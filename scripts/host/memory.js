/* ------------  
   memory.js

   Core memory prototype.
   ------------ */

function Memory(size) {
   
   this.memory = new Array();

   for(i = 0; i < size; i++) {
      this.memory[i] = new MemoryCell();
   }
}

// read the data at the given address
Memory.prototype.read = function(addr) {
   return this.memory[addr].read();
};

// write the given data to the given address
Memory.prototype.write = function(addr, data) {
   this.memory[addr].write(data);
};

// get the memory array and all of its contents
Memory.prototype.getMemory = function() {
   return this.memory;
};


// class for a memory cell, we store an array
// of these memory cells instead of just the value
// because strings can take up more than 1 byte
function MemoryCell() {
   this.value = "00";
}

// reads from the memory cell
MemoryCell.prototype.read = function() {
   return this.value;
};

// write to the memory cell
MemoryCell.prototype.write = function(data) {
   this.value = data;
};