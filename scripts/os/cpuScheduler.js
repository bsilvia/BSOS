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
	// make the client OS control the host CPU with the client OS CPU scheduler
	_CPU.cycle();
	this.cycles++;
	this.schedule();
};

// this method checks for any scheduling decisions to be made and context switches if necessary
CpuScheduler.prototype.schedule = function() {
	// TODO - make decision
	// TODO - log all scheduling events
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
CpuScheduler.prototype.contextSwitch = function() {
	// software interrupt for a context switch
	krnAddInterrupt(CONTEXT_SWITCH_IRQ, _ReadyQueue.dequeue());
};

// this is called when a program is requested to run
CpuScheduler.prototype.run = function(pcb, index) {
	// add the program's pcb to the ready queue
  	_ReadyQueue.enqueue(pcb);

  	// remove it from the resident list
	_ResidentList.splice(index);

  	// if this is the first one getting added to the ready queue then
  	// it is the only one being run so pull it off the ready queue
  	if(_ReadyQueue.getSize() === 1)
  		_CurrentPCB = _ReadyQueue.dequeue();

	// TODO - will need to do more with the program as we 
	// allow for more scheduling algorithms
};

// runs all programs that are in the resident list
CpuScheduler.prototype.runAll = function() {
	for (var i = 0; i < _ResidentList.length; i++) {
		_ReadyQueue.enqueue(_ResidentList[i]);
	};

	_ResidentList = [];
};