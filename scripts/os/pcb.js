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
PCB.prototype.update = function(cpu) {
	this.PC = cpu.PC;
	this.AC = cpu.AC;
    this.Xreg = cpu.Xreg;
    this.Yreg = cpu.Yreg;
    this.Zflag = cpu.Zflag;
};

// displays the contents of the process control block
PCB.prototype.Display = function() {
	_StdOut.putText("Process terminated, PCB contents:");
	_StdOut.advanceLine();
	_StdOut.putText("   pid: " + this.pid);
	_StdOut.advanceLine();
	_StdOut.putText("   base: " + this.base);
	_StdOut.advanceLine();
	_StdOut.putText("   limit: " + this.limit);
	_StdOut.advanceLine();
	_StdOut.putText("   PC: " + this.PC);
	_StdOut.advanceLine();
	_StdOut.putText("   AC: " + this.AC);
	_StdOut.advanceLine();
	_StdOut.putText("   X: " + this.Xreg);
	_StdOut.advanceLine();
	_StdOut.putText("   Y: " + this.Yreg);
	_StdOut.advanceLine();
	_StdOut.putText("   Z: " + this.Zflag);
	_StdOut.advanceLine();
	_StdOut.putText(">");
};