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
		this.schedule(null);
	}
};

// this method checks for any scheduling decisions to be made and context switches if necessary
// onRun distinguishes scheduling operations based on if we are scheduling at a clock tick or
// because we just got a command to run one or more programs
CpuScheduler.prototype.schedule = function(pcb) {
	switch (CURRENT_SCHEDULING_ALGOR)
    {
		case ROUND_ROBIN:
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				// reset the cycles since we are executing on a new process
				// and cycles may be > 0 from previous execution
				this.cycles = 0;
				if(_ReadyQueue.isEmpty())
					return;

				this.runProcess(_ReadyQueue.dequeue());
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
			// TODO - have something about date loaded for when the schedule is switched during execution?
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				if(_ReadyQueue.isEmpty())
					return;

				// pull the next process out and set current pcb,
				// cpu, and relocation register accordingly
				this.runProcess(this.getNextEarliestArrivalProcess());
			}
			// otherwise we have to pluck the next process off the queue
			else
			{
				this.cycles = 0;
				if(!_ReadyQueue.isEmpty())
				{
					this.contextSwitch(this.getNextEarliestArrivalProcess());
				}
			}
			break;
		case PRIORITY:
			// if we aren't already running another process
			if(!_CPU.isExecuting)
			{
				if(_ReadyQueue.isEmpty())
					return;

				// pull the next process out and run it
				this.runProcess(this.getNextHighestPriorityProcess());
			}
			// otherwise we have to pull the next highest priority and run that one
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

// starts execution of a given process, checking to see if it
// needs to be switched from the disk to memory
CpuScheduler.prototype.runProcess = function(pcb) {
	// if it is on the disk then we must deal with taking it out
	// and "swap" it with another process that we choose in
	// memory in order to get it into memory therefore we 
	// can't set the current pcb right here
	if(pcb.isOnDisk()) {
		this.runProcessOnDisk(pcb);
		_CPU.set(pcb);
		_MemoryManager.SetRelocationRegister(pcb.base);
	}
	// otherwise it is in memory so we can proceed as normal
	else {
		_CurrentPCB = pcb;
		_CPU.set(_CurrentPCB);
		_MemoryManager.SetRelocationRegister(_CurrentPCB.base);
	}
};

// takes the process on disk and either puts it in an empty memory slot
// or picks a process in memory and swaps it out, we only do this when
// we first start execution, i.e. CPU.isExecuting === false
CpuScheduler.prototype.runProcessOnDisk = function(processOnDisk) {
	// if all the memory slots are full
	if(_MemoryManager.getNextAvailableBlock() === -1) {
		// clear the cpu since the current process (the process that we
		// pick out of the ready queue that is in memory) which we will
		// be swapping will get updated with the cpu values
		_CPU.clear();

		_CurrentPCB = null;

		// go through the resident list, looking for a process that is
		// in memory that we can swap with
		for (var j = 0; j < _ResidentList.length; j++) {
			if (_ResidentList[j].isInMemory()) {
				// set the first process we find in memory to the current PCB
				// since we always context switch with the current PCB
				_CurrentPCB = _ResidentList[j];
				_CurrentPCB.tempSwap = true;
				break;
			}
		}

		// if we couldn't find a process in memory in the resident list to
		// swap with then we must take something from the ready queue
		if(_CurrentPCB === null) {
			for (var k = 0; k < _ReadyQueue.getSize(); k++) {
				if (_ReadyQueue.getItem(k).isInMemory()) {
					// set the first process we find in memory to the current PCB
					// since we always context switch with the current PCB
					_CurrentPCB = _ReadyQueue.getItem(k);
					_CurrentPCB.tempSwap = true;
					break;
				}
			}
		}

		// make the call to context switch, swapping out the process in memory
		// with the process that is on the disk that the user is requesting to run
		this.contextSwitch(processOnDisk);
	}
	// otherwise there is an open spot and we can just roll in the process
	else {
		_MemoryManager.rollIn(processOnDisk);
		_CurrentPCB = processOnDisk;
		_CPU.set(_CurrentPCB);
	}
};

// schedules when the cpu is not yet executing and must schedule either
// one given process or the first of all the processes loaded
CpuScheduler.prototype.scheduleOneProcess = function(pcb) {
	// if we aren't running just one specific process
	// or we are running one specific process but it is in memory
	if(pcb === null || (pcb !== null && pcb.isInMemory())) {
		// pull the next process out and set current pcb,
		// cpu, and relocation register accordingly
		_CurrentPCB = _ReadyQueue.dequeue();
		_CPU.set(_CurrentPCB);
		_MemoryManager.SetRelocationRegister(_CurrentPCB.base);
	}
	// if we are running a specific process and its on the disk
	else if(pcb !== null && pcb.isOnDisk()) {
		// if all the memory slots are full
		if(_MemoryManager.getNextAvailableBlock() === -1) {
			// clear the cpu since the current process (the process that we
			// pick out of the ready queue that is in memory) which we will
			// be swapping will get updated with the cpu values
			_CPU.clear();

			// go through the resident list, looking for a process that is
			// in memory that we can swap with
			for (var j = 0; j < _ResidentList.length; j++) {
				if (_ResidentList[j].isInMemory()) {
					// set the first process we find in memory to the current PCB
					// since we always context switch with the current PCB
					_CurrentPCB = _ResidentList[j];
					_CurrentPCB.tempSwap = true;
					break;
				}
			}

			// make the call to context switch, swapping out the process in memory
			// with the process that is on the disk (that we added to the ready queue 
			// earlier) that the user is requesting to run
			this.contextSwitch(_ReadyQueue.dequeue());
		}
		// otherwise there is an open spot and we can just roll in the process
		else {
			_MemoryManager.rollIn(_ReadyQueue.dequeue());
			_CurrentPCB = pcb;
			_CPU.set(_CurrentPCB);
		}
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
	_ResidentList.splice(index, 1);

	this.schedule(pcb);
};

// runs all programs that are in the resident list
CpuScheduler.prototype.runAll = function() {
	// put all the programs in the resident list on the ready queue
	for (var i = 0; i < _ResidentList.length; i++) {
		_ReadyQueue.enqueue(_ResidentList[i]);
	}

	// clear the resident list
	_ResidentList = [];

	this.schedule(null);
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
			this.schedule(null);
		}
	}
	// otherwise we just need to remove it from the ready queue
	else {
		var pcb = _ReadyQueue.removeAt(idx);
		// make sure to deallocate the memory that was being used 
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
		if(_ReadyQueue.getItem(i).priority != -1 && _ReadyQueue.getItem(i).priority < lowestPriority) {
			lowestPriority = _ReadyQueue.getItem(i).priority;
			idx = i;
		}
	}

	return _ReadyQueue.removeAt(idx)[0];
};

// function to get the next process that came before the rest
CpuScheduler.prototype.getNextEarliestArrivalProcess = function() {
	var earliestArrival = Number.MAX_VALUE;
	var idx = -1;

	// Go through the ready queue to find the earliest arrival process.
	for (var i = 0; i < _ReadyQueue.getSize(); i++) {
		if(_ReadyQueue.getItem(i).arrival < earliestArrival) {
			earliestArrival = _ReadyQueue.getItem(i).arrival;
			idx = i;
		}
	}

	return _ReadyQueue.removeAt(idx)[0];
};