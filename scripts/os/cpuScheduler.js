/* ------------  
   cpuScheduler.js

   Requires globals.js

   CPU Scheduler to perform short term scheduling decisions.
   ------------ */

function CpuScheduler() {
   // TODO check to see if something else is already running
   // variable to keep track of how many cycles we have spent on a given process
   this.cycles = 0;


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
		// TODO - context switch
	}
};

