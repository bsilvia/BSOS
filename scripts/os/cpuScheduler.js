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

// performs one cycle, the kernel calls this function instead of the cpu cycle
// because we have to perform scheduling decisions at each cycle including context switching
CpuScheduler.prototype.cycle = function() {
	// TODO - call cpu cycle here after checking for the need to context switch

	_CPU.cycle();
};

