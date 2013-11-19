/* ------------  
   memoryManager.js

   Requires globals.js and memory.js

   Memory manager to interface to the actual memory.
   ------------ */

function MemoryManager() {
   this.memory = new Memory(_MemorySize);
   this.memoryBlocks = new Array(new MemoryBlock(0, _BlockSize),
								new MemoryBlock(_MemorySize/3, _BlockSize),
								new MemoryBlock(_MemorySize*2/3, _BlockSize));
   this.relocationRegister = 0;
   this.lastLoadedPCB = null;
}

MemoryManager.prototype.SetRelocationRegister = function(num) {
	this.relocationRegister = num;
};

// function to return the next available block of memory if there is one
MemoryManager.prototype.getNextAvailableBlock = function() {
	for (var i = 0; i < this.memoryBlocks.length; i++) {
		if(!this.memoryBlocks[i].taken)
			return i;
	}
	return -1;
};

// class to keep track of each block of memory
function MemoryBlock(base, limit) {
	this.taken = false;
	this.base = base;
	this.limit = limit;
}

// function to handle reading from 'phyiscal' memory
MemoryManager.prototype.read = function(address) {
	// make sure the address isn't before or beyond its space
	if(address < 0 || address > _BlockSize) {
		//krnTrapError("Memory read - out of bounds exception!"); // maybe we don't have to be so harsh here?
		krnTrace("Memory read - out of bounds exception!");
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, _CurrentPCB.pid);
	}
	else
		return this.memory.read(address + this.relocationRegister);
};

// function to handle writing to 'phyiscal' memory
MemoryManager.prototype.write = function(address, data) {
	if(address < 0 || address > _BlockSize) {
		//krnTrapError("Memory write - out of bounds exception!"); // maybe we don't have to be so harsh here?
		krnTrace("Memory write - out of bounds exception!");
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, _CurrentPCB.pid);
	}
	else
		this.memory.write(address + this.relocationRegister, data);
};

// function to return entire memory array
MemoryManager.prototype.getMemory = function() {
	return this.memory.getMemory();
};

// loads a given program into memory, returning true if sucessful, false otherwise
MemoryManager.prototype.load = function(program, priority) {
	// check the size of the program
	if(program.length > _BlockSize) {
		_StdOut.putText("Program size exceeds max memory size");
		return false;
	}

	var blockNum = this.getNextAvailableBlock();

	// create a new process control block
	var pcb;

	// if there was no open memory blocks then we must put this process onto the disk
	if(blockNum === -1) {
		if(!krnFileSystemDriver.isFormatted()) {
			_StdOut.putText("Error: can't load program into virtual memory, file system is not formatted");
			return false;
		}

		// create a new process control block and set the priority if applicable
		pcb = new PCB();
		if(priority > -1)
			pcb.priority = priority;

		// roll the process onto the disk, so should be roll out from this perspective?
		this.rollOut(pcb, program);
	}
	else {
		// create a new process control block and set the priority if applicable
		pcb = new PCB();
		if(priority > -1)
			pcb.priority = priority;

		// load the program into the open block of memory
		pcb.base = this.memoryBlocks[blockNum].base;
		pcb.limit = this.memoryBlocks[blockNum].limit;
		pcb.memBlock = blockNum;
		this.memoryBlocks[blockNum].taken = true;
		
		// write the program to memory
		for (var i = 0; i < program.length; i++) {
			this.memory.write(i + pcb.base, program[i]);
		}
	}

	this.lastLoadedPCB = pcb;

	// write the program to memory
	//for (var i = 0; i < program.length; i++) {
	//	this.memory.write(i + pcb.base, program[i]);
	//}

	if(priority > -1)
		_StdOut.putText("Loaded program with PID " + pcb.pid + " and priority " + priority);
	else
		_StdOut.putText("Loaded program with PID " + pcb.pid);
	return true;
};

// deallocates a block of memory once a process no longer needs it
MemoryManager.prototype.deallocate = function(idxBlock) {
	if(idxBlock >= 0 && idxBlock <= 3)
		this.memoryBlocks[idxBlock].taken = false;
};

// function to read the entire current block of memory, as required with swapping
MemoryManager.prototype.readMemoryBlock = function() {
	var data = "";
	for (var i = 0; i < _BlockSize; i++) {
		if(i !== _BlockSize)
			data += this.read(i) + " ";
		else
			data += this.read(i);
	}
	return data.split(" ");
};

// function to handle context switches and swapping of processes
MemoryManager.prototype.contextSwitch = function(newPCB) {
	var pidSwappedOut = _CurrentPCB.pid;

    // add the current process back onto the ready queue if it is not finished
    if(_CurrentPCB.finished !== true) {
		_ReadyQueue.enqueue(_CurrentPCB);

		// if the new processes is on the disk then we must swap it with the current process 
		if(newPCB.isOnDisk()) {
			this.rollOut(_CurrentPCB, this.readMemoryBlock()); // need to pass the program to be put on disk
			this.rollIn(newPCB);
		}
	}
	// otherwise don't add the current process back onto the ready queue
	else if(newPCB.isOnDisk()) {
		// take the new process on disk and roll into memory, we can do this since we know
		// there will be a spot in memory for it due to the fact that current process finished
		// and relinquished the memory block it was in at the time
		this.rollIn(newPCB);
	}

	// set the current process to the new process that was passed
    _CurrentPCB = newPCB;

    // set relocation register
    this.SetRelocationRegister(_CurrentPCB.base);
};

// rolls a process out of memory and onto the disk
MemoryManager.prototype.rollOut = function(pcb, program) {
	pcb.swapLocation();
	pcb.base = 0;
	pcb.limit = 0;
	pcb.swapFileName = "~pid" + pcb.pid;
	this.deallocate(pcb.memBlock);
	pcb.memBlock = -1;
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapCreate", pcb.swapFileName]);

	var programString = "";
	for (var i = 0; i < program.length; i++) {
		if(i !== program.length - 1)
			programString += program[i] + " ";
		else
			programString += program[i];
	}
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapWrite", pcb.swapFileName, programString]);
};

// rolls a processes out of the disk and into memory
MemoryManager.prototype.rollIn = function(pcb) {
	// read the program from the swap file
	krnFileSystemDriver.isr(["swapRead", pcb.swapFileName]);

	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapDelete", pcb.swapFileName]);
	pcb.swapLocation();
	var swapFileData = krnFileSystemDriver.getReadData();
	var program = swapFileData.split(" ");

	// put the process into a free memory slot
	var blockNum = this.getNextAvailableBlock();

	// load the program into the open block of memory
	pcb.base = this.memoryBlocks[blockNum].base;
	pcb.limit = this.memoryBlocks[blockNum].limit;
	pcb.memBlock = blockNum;
	this.memoryBlocks[blockNum].taken = true;
	
	// write the program to memory
	for (var i = 0; i < program.length; i++) {
		this.memory.write(i + pcb.base, program[i]);
	}
};