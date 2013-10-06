/* ------------  
   memoryManager.js

   Requires globals.js and memory.js

   Memory manager to interface to the actual memory.
   ------------ */

function MemoryManager() {
   this.memory = new Memory(_MemorySize);
   this.memoryBlocks = new Array(new MemoryBlock(0, 255),
   						new MemoryBlock(256, 511),
   						new MemoryBlock(512,767));
}

// class to keep track of each block of memory
function MemoryBlock(base, limit) {
	this.taken = false;
	this.base = base;
	this.limit = limit;
}

// function to handle reading from 'phyiscal' memory
MemoryManager.prototype.read = function(address) {
	return this.memory.read(address);
};

// function to handle writing to 'phyiscal' memory
MemoryManager.prototype.write = function(address, data) {
	this.memory.write(address, data);
};

// function to return entire memory array
MemoryManager.prototype.getMemory = function() {
	return this.memory.getMemory();
};

// loads a given program into memory
MemoryManager.prototype.load = function(pcb, program) {
	// load the program into an open block of memory
	if(!this.memoryBlocks[0].taken) {
		pcb.base = this.memoryBlocks[0].base;
		pcb.limit = this.memoryBlocks[0].limit;
		this.memoryBlocks[0].taken = true;
	}
	else if(!this.memoryBlocks[1].taken) {
		pcb.base = this.memoryBlocks[1].base;
		pcb.limit = this.memoryBlocks[1].limit;
		this.memoryBlocks[1].taken = true;
	}
	else if(!this.memoryBlocks[2].taken) {
		pcb.base = this.memoryBlocks[2].base;
		pcb.limit = this.memoryBlocks[2].limit;
		this.memoryBlocks[2].taken = true;
	}

	for (var i = 0; i < program.length; i++) {
		this.memory.write(i + pcb.base, program[i]);
	};

	_StdOut.putText("Loaded program with PID " + pcb.pid);
};