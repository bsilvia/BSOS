/* ------------  
   memory.js

   Core memory prototype.
   ------------ */

function Memory(size) {
   
   this.memory = new Array();

   for(i = 0; i < size; i++) {
      this.memory[i] = "00";
   }
}

// read the data at the given address
Memory.prototype.read = function(addr) {
   return this.memory[addr];
}

// write the given data to the given address
Memory.prototype.write = function(addr, data) {
   this.memory[addr] = data;
}

// get the memory array and all of its contents
Memory.prototype.getMemory = function() {
   return this.memory;
};