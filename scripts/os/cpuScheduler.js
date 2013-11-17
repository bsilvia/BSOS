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
	// only call schedule at each clock cycle if we are doing round robin
	if(CURRENT_SCHEDULING_ALGOR === ROUND_ROBIN) {
		this.schedule();
	}
};

// this method checks for any scheduling decisions to be made and context switches if necessary
// onRun distinguishes scheduling operations based on if we are scheduling at a clock tick or
// because we just got a command to run one or more programs
CpuScheduler.prototype.schedule = function() {
	switch (CURRENT_SCHEDULING_ALGOR)
    {
		case ROUND_ROBIN:
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				if(_ReadyQueue.isEmpty())
					return;
				// pull one off the ready queue and have to set
				// current pcb, cpu, and relocation register accordingly
				_CurrentPCB = _ReadyQueue.dequeue();
				_CPU.set(_CurrentPCB);
				_MemoryManager.SetRelocationRegister(_CurrentPCB.base);
			}
			else if(this.cycles >= _Quantum)
			{
				this.cycles = 0;
				if(!_ReadyQueue.isEmpty())
				{
					this.contextSwitch(_ReadyQueue.dequeue());
				}
			}
			break;
		case FIRST_COME_FIRST_SERVE:
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				if(_ReadyQueue.isEmpty())
					return;
				// pull one off the ready queue and have to set
				// current pcb, cpu, and relocation register accordingly
				_CurrentPCB = _ReadyQueue.dequeue();
				_CPU.set(_CurrentPCB);
				_MemoryManager.SetRelocationRegister(_CurrentPCB.base);
			}
			// otherwise we have to pluck the next process off the queue
			else
			{
				this.cycles = 0;
				if(!_ReadyQueue.isEmpty())
				{
					this.contextSwitch(_ReadyQueue.dequeue());
				}
			}
			break;
		case PRIORITY:
			// TODO
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				if(_ReadyQueue.isEmpty())
					return;
				// get the next highest priority process and set
				// current pcb, cpu, and relocation register accordingly
				_CurrentPCB = this.getNextHighestPriorityProcess();
				_CPU.set(_CurrentPCB);
				_MemoryManager.SetRelocationRegister(_CurrentPCB.base);
			}
			// otherwise we have to 
			else
			{
				this.cycles = 0;
				if(!_ReadyQueue.isEmpty())
				{
					this.contextSwitch(this.getNextHighestPriorityProcess());
				}
			}
			break;
	}
};

// method to perform context switching
CpuScheduler.prototype.contextSwitch = function(pcb) {
	// software interrupt for a context switch
	krnAddInterrupt(CONTEXT_SWITCH_IRQ, pcb);
};

// this is called when a program is requested to run
CpuScheduler.prototype.run = function(pcb, index) {
	// add the program's pcb to the ready queue
	_ReadyQueue.enqueue(pcb);

	// remove it from the resident list
	_ResidentList.splice(index);

	this.schedule();
};

// runs all programs that are in the resident list
CpuScheduler.prototype.runAll = function() {
	// put all the programs in the resident list on the ready queue
	for (var i = 0; i < _ResidentList.length; i++) {
		_ReadyQueue.enqueue(_ResidentList[i]);
	}

	// clear the resident list
	_ResidentList = [];

	this.schedule();
	updateReadyQueue();
};

// function to kill a process, whether it be because the user requested
// it, the program terminated unexpectedly, or the program terminated gracefully
CpuScheduler.prototype.killProcess = function(pid, idx) {
	// we are killing the current process
	if(idx === -1) {
		_MemoryManager.deallocate(_CurrentPCB.memBlock);
		_CurrentPCB.finished = true;
		// simulate reaching the end of the quantum if we are doing round robin
		this.cycles = _Quantum;
		// we must pick a new process to run if available so call schedule
		if(!_ReadyQueue.isEmpty()) {
			this.schedule();
		}
	}
	// otherwise we just need to remove it from the ready queue
	else {
		var pcb = _ReadyQueue.removeAt(idx);
		_MemoryManager.deallocate(pcb[0].memBlock);
		pcb[0].finished = true;
	}
	updateReadyQueue();
};

// function to get the next highest priority in the ready queue to aid scheduling
CpuScheduler.prototype.getNextHighestPriorityProcess = function() {
	var lowestPriority = Number.MAX_VALUE;
	var idx = -1;

	// Go through the ready queue to find the highest priority (lowest priority number) process.
	// Due to the default value of priority we give processes that were not loaded with a priority,
	// they will always execute after all the processes that were given a priority number
	for (var i = 0; i < _ReadyQueue.getSize(); i++) {
		if(_ReadyQueue.getItem(i).priority != -1 && _ReadyQueue.getItem(i).priority < lowestPriority){
			lowestPriority = _ReadyQueue.getItem(i).priority;
			idx = i;
		}
	}

	return _ReadyQueue.removeAt(idx)[0];
};