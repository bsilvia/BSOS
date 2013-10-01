/* ------------  
   pcb.js

   Process control block (PCB) prototype.
   ------------ */

function PCB() {
	this.pid = this.currentPid++;
	this.base = 0;
	this.limit = 0;
	
	this.pc = 0;
	this.ac = 0;
	this.x = 0;
	this.y = 0;
	this.z = 0;
}

PCB.currentPid = 0;

// updates the pcb given the current state of the cpu
PCB.prototype.updateCpu = function(cpu) {
	this.pc = cpu.pc;
	this.ac = cpu.ac;
    this.x = cpu.x;
    this.y = cpu.y;
    this.z = cpu.z;
};
