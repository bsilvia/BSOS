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
		krnTrace("Memory read - out of bounds exception!");
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, _CurrentPCB.pid);
	}
	else
		return this.memory.read(address + this.relocationRegister);
};

// function to handle writing to 'phyiscal' memory
MemoryManager.prototype.write = function(address, data) {
	if(address < 0 || address > _BlockSize) {
		krnTrace("Memory write - out of bounds exception!");
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, _CurrentPCB.pid);
	}
	else
		this.memory.write(address + this.relocationRegister, data);
};

// function to return entire memory array for display purposes
MemoryManager.prototype.getMemory = function() {
	return this.memory.getMemory();
};

// loads a given program into memory, returning true if sucessful, false otherwise
MemoryManager.prototype.load = function(program, priority) {
	// check the size of the program
	if(program.length > _BlockSize) {
		krnWriteConsole("Program size exceeds max memory size", false);
		return false;
	}

	var blockNum = this.getNextAvailableBlock();
	var pcb;

	// if there was no open memory blocks then we must put this process onto the disk
	if(blockNum === -1) {
		if(!krnFileSystemDriver.isFormatted()) {
			krnWriteConsole("Can't load program into virtual memory if file system is not formatted", false);
			return false;
		}

		// create a new process control block and set the priority if applicable
		pcb = new PCB();
		if(priority > -1)
			pcb.priority = priority;

		// roll the process onto the disk, i.e. write it to disk
		this.rollOut(pcb, program);
	}
	// otherwise just load into the memory block
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

	if(priority > -1)
		krnWriteConsole("Loaded program with PID " + pcb.pid + " and priority " + priority, false);
	else
		krnWriteConsole("Loaded program with PID " + pcb.pid, false);

	return true;
};

// deallocates a block of memory once a process no longer needs it
MemoryManager.prototype.deallocate = function(idxBlock) {
	if(idxBlock >= 0 && idxBlock <= 3) {
		this.memoryBlocks[idxBlock].taken = false;
		for (var i = 0; i < _BlockSize; i++) {
			this.memory.write(i + this.memoryBlocks[idxBlock].base, "00");
		}
	}
};

// function to read the entire current block of memory, as needed when swapping
MemoryManager.prototype.readMemoryBlock = function() {
	var data = "";
	for (var i = 0; i < _BlockSize; i++) {
		if(i !== _BlockSize)
			data += this.read(i) + " ";
		else
			data += this.read(i);
	}
	// return array of op-codes, this is important because that 
	// is what roll out expects when we pass it the program
	return data.split(" ");
};

// function to handle context switches and swapping of processes
MemoryManager.prototype.contextSwitch = function(newPCB) {
	var pidSwappedOut = _CurrentPCB.pid;

	// if the current process isn't finished yet, then we must add it to ready queue
    if(_CurrentPCB.finished !== true) {
		if(!_CurrentPCB.tempSwap) {
			// add the current process back onto the ready queue if it is not finished
			_ReadyQueue.enqueue(_CurrentPCB);
		}
		else {
			_CurrentPCB.tempSwap = false;
		}

		// if the new process is on the disk then we must swap it with the current process 
		if(newPCB.isOnDisk()) {
			// take the current process out of memory, putting it on the disk
			this.rollOut(_CurrentPCB, this.readMemoryBlock());
			// and replacing it with the process we read in from the disk
			this.rollIn(newPCB);
		}
	}
	// otherwise don't add the current process back onto the ready queue
	else if(newPCB.isOnDisk()) {
		// take the new process on disk and roll into memory, we can do this since we 
		// know there will be a spot in memory for it due to the fact that current 
		// process finished and relinquished the memory block it was in at the time
		this.rollIn(newPCB);
	}

	// set the current process to the new process that was passed
    _CurrentPCB = newPCB;

    // set relocation register
    this.SetRelocationRegister(_CurrentPCB.base);
};

// rolls a processes out of the disk and into memory
MemoryManager.prototype.rollIn = function(pcb) {
	krnTrace("rolling in process id " + pcb.pid + " from disk");
	// read the program from the swap file
	krnFileSystemDriver.isr(["swapRead", pcb.swapFileName]);
	var swapFileData = krnFileSystemDriver.getReadData();
	var program = swapFileData.split(" ");

	// after we have read the swap file, delete it
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapDelete", pcb.swapFileName]);
	
	// put the process into a free memory slot
	var blockNum = this.getNextAvailableBlock();

	// load the program into the open block of memory by
	// setting the appropriate pcb attributes to reflect that this
	// process is no longer on the disk but in memory
	pcb.swapLocation();
	pcb.swapFileName = "";
	pcb.base = this.memoryBlocks[blockNum].base;
	pcb.limit = this.memoryBlocks[blockNum].limit;
	pcb.memBlock = blockNum;
	this.memoryBlocks[blockNum].taken = true;
	this.SetRelocationRegister(pcb.base);
	
	// and actually writing the program to memory
	for (var i = 0; i < program.length; i++) {
		this.memory.write(i + pcb.base, program[i]);
	}
};

// rolls a process out of memory and onto the disk
MemoryManager.prototype.rollOut = function(pcb, program) {
	krnTrace("rolling out process id " + pcb.pid + " out of memory");
	// set the appropriate pcb attributes to reflect that this
	// process is no longer in memory but on the disk
	pcb.swapLocation();
	pcb.base = 0;
	pcb.limit = 0;
	pcb.swapFileName = "~pid" + pcb.pid;
	this.deallocate(pcb.memBlock);
	pcb.memBlock = -1;

	// create the swap file that will contain this process's code
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapCreate", pcb.swapFileName]);

	// format the process's code from an array of op-codes 
	// to a string for storage onto the disk
	var processCodeString = "";
	for (var i = 0; i < program.length; i++) {
		if(i !== program.length - 1)
			processCodeString += program[i] + " ";
		else
			processCodeString += program[i];
	}

	// write that code to the disk
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapWrite", pcb.swapFileName, processCodeString]);
};