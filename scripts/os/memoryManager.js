/* ------------  
   memoryManager.js

   Requires globals.js and memory.js

   Memory manager to interface to the actual memory.
   ------------ */

function MemoryManager() {
   this.memory = new Memory(_MemorySize);
   this.programPIDs = new Array();
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
MemoryManager.prototype.load = function(program) {
	
	// create the pcb, set its base and limit here
	var newPCB = new PCB();
	newPCB.base = 0;			// TO-DO keep track of which blocks of memory are open
	newPCB.limit = 255;			//       and assign the base and limit from that
	this.programPIDs[newPCB.pid] = newPCB;

	for (var i = 0; i < program.length; i++) {
		this.memory.write(i + newPCB.base, program[i]);
	};

	_StdOut.putText("Loaded program with PID " + newPCB.pid);
};