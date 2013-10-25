/* ------------  
   cpuScheduler.js

   Requires globals.js

   CPU Scheduler to perform short term scheduling decisions.
   ------------ */

function CpuScheduler() {
   // TODO check to see if something else is already running
   // variable to keep track of how many cycles we have spent on a given process
   this.cycles = 0;

   // anything else?
}

// performs one cycle, the kernel calls this function because we have to
// perform scheduling decisions at each cpu cycle including context switching
CpuScheduler.prototype.cycle = function() {
	this.cycles++;
	this.schedule();
};

// this method checks for any scheduling decisions to be made and context switches if necessary
CpuScheduler.prototype.schedule = function() {
	// TODO - make decision
	if(this.cycles === _Quantum)
	{
		this.cycles = 0;
		if(!_ReadyQueue.isEmpty())
		{
			this.contextSwitch();
		}
	}
};

// method to perform context switching
cpuScheduler.prototype.contextSwitch = function() {
	// TODO - update current PCB, then choose the next process to load in
	// and update the CPU with that PCB and start that process
	// should a context swtich take one clock cycle?

	// TODO - set relocation register in memory manager as well as setting the cpu
};