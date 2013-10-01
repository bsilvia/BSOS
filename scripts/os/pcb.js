/* ------------  
   pcb.js

   Process control block (PCB) prototype.
   ------------ */

function PCB() {
	this.pid = getNextPid();
	this.base = 0;
	this.limit = 0;
	
	this.PC = 0;
	this.AC = 0;
	this.Xreg = 0;
	this.Yreg = 0;
	this.Zflag = 0;
}

function getNextPid() {
	if(typeof this.pid == 'undefined') {
		this.pid = 0;
	}
	
	return this.pid++;
}

// updates the pcb given the current state of the cpu
PCB.prototype.updateCpu = function(cpu) {
	this.PC = cpu.PC;
	this.AC = cpu.AC;
    this.Xreg = cpu.Xreg;
    this.Yreg = cpu.Yreg;
    this.Zflag = cpu.Zflag;
};
