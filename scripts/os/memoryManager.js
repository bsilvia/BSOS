/* ------------  
   memoryManager.js

   Requires globals.js and memory.js

   Memory manager to interface to the actual memory.
   ------------ */

function MemoryManager() {
   this.memory = new Memory(_MemorySize);
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