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
   this.virtualMemory = [];
   this.relocationRegister = 0;
   this.lastLoadedPCB = null;
   this.swapFileContents = "";
}

MemoryManager.prototype.SetRelocationRegister = function(num) {
	this.relocationRegister = num;
};

MemoryManager.prototype.passSwapFileContents = function(data) {
	this.swapFileContents = data;
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
	var pcb;// = new PCB();

	//if(priority > -1)
	//	pcb.priority = priority;

	// TODO - need to move this down below and set the location appropriately
	if(blockNum === -1) {
		if(!krnFileSystemDriver.isFormatted()) {
			_StdOut.putText("Error: can't load program into virtual memory, file system is not formatted");
			return false;
		}

		// create a new process control block and set the priority if applicable
		pcb = new PCB();
		if(priority > -1)
			pcb.priority = priority;

		this.rollIn(pcb, program);
		//pcb.location = "Disk";
		//pcb.swapFileName = "~pid" + pcb.pid;
		//virtualMemory[virtualMemory.length] = pcb;
		//_StdOut.putText("No more free slots in memory");
		//return false;
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
	this.memoryBlocks[idxBlock].taken = false;
};

// 
MemoryManager.prototype.contextSwitch = function(newPCB) {
	var pidSwappedOut = _CurrentPCB.pid;

    // add the current process back onto the ready queue if it is not finished
    if(_CurrentPCB.finished !== true) {
		_ReadyQueue.enqueue(_CurrentPCB);

		// if the new processes is on the disk then we must swap it with the current process 
		if(newPCB.isOnDisk()) {
			this.rollIn(_CurrentPCB);
			this.rollOut(newPCB);
		}
	}

	// set the current process to the new process that was passed
    _CurrentPCB = newPCB;

    // set relocation register
    this.SetRelocationRegister(_CurrentPCB.base);
};

// rolls a process onto the disk from memory
MemoryManager.prototype.rollIn = function(pcb, program) {
	pcb.swapLocation();
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
MemoryManager.prototype.rollOut = function(pcb) {
	// TODO - test that changes to pcb are reflected in newPCB above after this function call
	// read the program from the swap file
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapRead", pcb.swapFileName]);
	// 
	while(this.swapFileContents === "") {

	}
	krnAddInterrupt(FILE_SYSTEM_IRQ, ["swapDelete", pcb.swapFileName]);
	pcb.swapLocation();
	var program = this.swapFileContents;
	// reset the swap file contents variable
	this.swapFileContents = "";

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