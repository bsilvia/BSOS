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
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, false);
	}
	else
		return this.memory.read(address + this.relocationRegister);
};

// function to handle writing to 'phyiscal' memory
MemoryManager.prototype.write = function(address, data) {
	if(address < 0 || address > _BlockSize) {
		//krnTrapError("Memory write - out of bounds exception!"); // maybe we don't have to be so harsh here?
		krnTrace("Memory write - out of bounds exception!");
		krnAddInterrupt(PROGRAM_TERMINATION_IRQ, false);
	}
	else
		this.memory.write(address + this.relocationRegister, data);
};

// function to return entire memory array
MemoryManager.prototype.getMemory = function() {
	return this.memory.getMemory();
};

// loads a given program into memory, returning true if sucessful, false otherwise
MemoryManager.prototype.load = function(program) {
	// check the size of the program
	if(program.length > _BlockSize) {
		_StdOut.putText("Program size exceeds max memory size");
		return false;
	}

	var blockNum = this.getNextAvailableBlock();

	if(blockNum === -1) {
		_StdOut.putText("No more free slots in memory");
		return false;
	}

	// create a new process control block
	var pcb = new PCB();

	// load the program into the open block of memory
	pcb.base = this.memoryBlocks[blockNum].base;
	pcb.limit = this.memoryBlocks[blockNum].limit;
	pcb.memBlock = blockNum;
	this.memoryBlocks[blockNum].taken = true;

	this.lastLoadedPCB = pcb;

	// write the program to memory
	for (var i = 0; i < program.length; i++) {
		this.memory.write(i + pcb.base, program[i]);
	}

	_StdOut.putText("Loaded program with PID " + pcb.pid);
	return true;
};

// deallocates a block of memory once a process no longer needs it
MemoryManager.prototype.deallocate = function(idxBlock) {
	this.memoryBlocks[idxBlock].taken = false;
};