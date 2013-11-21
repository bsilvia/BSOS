/* ------------
   Kernel.js
   
   Requires globals.js
   
   Routines for the Operating System, NOT the host.
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */


//
// OS Startup and Shutdown Routines   
//
function krnBootstrap()      // Page 8.
{
   hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

   // Initialize our global queues.
   _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
   _KernelBuffers = new Array();         // Buffers... for the kernel.
   _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
   _Console = new CLIconsole();          // The command line interface / console I/O device.

   // Initialize the CLIconsole.
   _Console.init();

   // Initialize standard input and output to the _Console.
   _StdIn  = _Console;
   _StdOut = _Console;

   // Initialize the cpu scheduler
   _ReadyQueue = new Queue();

   // Initialize the resident list
   _ResidentList = new Array();

   // Initialize the memory manager
   _MemoryManager = new MemoryManager();

   // Initialize the cpu scheduler
   _CpuScheduler = new CpuScheduler();

   // Load the Keyboard Device Driver
   krnTrace("Loading the keyboard device driver.");
   krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.  TODO: Should that have a _global-style name?
   krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
   krnTrace(krnKeyboardDriver.status);

   // Load the File System Device Driver
   krnTrace("Loading the file system device driver.");
   krnFileSystemDriver = new DeviceDriverFileSystem();
   krnFileSystemDriver.driverEntry();
   krnTrace(krnFileSystemDriver.status);

   //
   // ... more?
   //

   // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
   krnTrace("Enabling the interrupts.");
   krnEnableInterrupts();

   // Launch the shell.
   krnTrace("Creating and Launching the shell.");
   _OsShell = new Shell();
   _OsShell.init();

   // Finally, initiate testing.
   if (_GLaDOS) {
      _GLaDOS.afterStartup();
   }
}

function krnShutdown()
{
    krnTrace("begin shutdown OS");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...    
    // ... Disable the Interrupts.
    krnTrace("Disabling the interrupts.");
    krnDisableInterrupts();
    // 
    // Unload the Device Drivers?
    // More?
    //
    krnTrace("end shutdown OS");
}


function krnOnCPUClockPulse()
{
    /* This gets called from the host hardware sim every time there is a hardware clock pulse.
       This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
       This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel 
       that it has to look for interrupts and process them if it finds any.                           */

    // Check for an interrupt, are any. Page 560
    if (_KernelInterruptQueue.getSize() > 0)
    {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
        var interrupt = _KernelInterruptQueue.dequeue();
        krnInterruptHandler(interrupt.irq, interrupt.params);
    }
    // If there are no interrupts then run one CPU cycle if there is anything being processed.
    else if (_CPU.isExecuting)
    {
        // if single stepping is off then execute normally
        if(!_SingleStep) {
          //_CPU.cycle();
          _CpuScheduler.cycle();

          updateCpuDisplay();
          updateMemoryDisplay();
        }
        // otherwise if the step button was pressed, execute one cycle on the clock tick
        else if (_SingleStep && _Step) {
          //_CPU.cycle();
          _CpuScheduler.cycle();
          // reset step after every cycle so as to stop executing until the user presses the button again
          _Step = false;

          updateCpuDisplay();
          updateMemoryDisplay();
        }
        else {
          krnTrace("Idle");
        }
    }
    // If there are no interrupts and there is nothing being executed then just be idle.
    else
    {
       krnTrace("Idle");
    }
}


// 
// Interrupt Handling
// 
function krnEnableInterrupts()
{
    // Keyboard
    hostEnableKeyboardInterrupt();
    // Put more here.
}

function krnDisableInterrupts()
{
    // Keyboard
    hostDisableKeyboardInterrupt();
    // Put more here.
}

// function to add an interrupt to the kernel interrupt queue
function krnAddInterrupt(irq, params) {
  _KernelInterruptQueue.enqueue(new Interrupt(irq, params));
}

function krnInterruptHandler(irq, params)    // This is the Interrupt Handler Routine.  Pages 8 and 560.
{
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
    krnTrace("Handling IRQ~" + irq);

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
    // TODO: Consider using an Interrupt Vector in the future.
    // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.  
    //       Maybe the hardware simulation will grow to support/require that in the future.
    switch (irq)
    {
        case TIMER_IRQ:
            krnTimerISR();                   // Kernel built-in routine for timers (not the clock).
            break;
        case KEYBOARD_IRQ:
            krnKeyboardDriver.isr(params);   // Kernel mode device driver
            _StdIn.handleInput();
            break;
        case FILE_SYSTEM_IRQ:
            krnFileSystemDriver.isr(params);
            updateFileSystemDisplay(krnFileSystemDriver.getEntries());
            break;
        case PROGRAM_TERMINATION_IRQ:
            _StdOut.putText("Process " + _CurrentPCB.pid + " terminated unexpectedly");
            _StdOut.advanceLine();
            _StdOut.putText(">");
            krnKill(_CurrentPCB.pid);
            break;
        case SYSTEM_CALL_PRINT_IRQ:
            _StdOut.putText(params);
            _StdOut.advanceLine();
            _StdOut.putText(">");
            break;
        case CONTEXT_SWITCH_IRQ:
            // update the process's PCB
            _CurrentPCB.update();

            var pidSwappedOut = _CurrentPCB.pid;
            var pidSwappedIn = params.pid;

            // set the cpu values from the values in the pcb of the new process
            _CPU.set(params);

            // call the memory manager to manage switching between processes that
            // may be across memory or across blocks on the disk
            _MemoryManager.contextSwitch(params);

            // update ready queue display
            updateReadyQueue();

            krnTrace("Context switch from pid " + pidSwappedOut + " to " + pidSwappedIn);
            break;
        default:
            krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }
}

function krnTimerISR()  // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
{
    // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
}



//
// System Calls... that generate software interrupts via tha Application Programming Interface library routines.
//
// Some ideas:
// - ReadConsole
// - WriteConsole
// - CreateProcess
// - ExitProcess
// - WaitForProcessToExit
// - CreateFile
// - OpenFile
// - ReadFile
// - WriteFile
// - CloseFile


// function to handle writing to console
function krnWriteConsole(msg, putPrompt) {
  if(msg !== "")
    _StdOut.putText(msg);
  if(putPrompt) {
    _StdOut.advanceLine();
    _StdOut.putText(">");
  }
}

//
// OS Utility Routines
//
function krnTrace(msg)
{
   // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
   if (_Trace)
   {
      if (msg === "Idle")
      {
         // We can't log every idle clock pulse because it would lag the browser very quickly.
         if (_OSclock % 10 === 0)  // Check the CPU_CLOCK_INTERVAL in globals.js for an 
         {                        // idea of the tick rate and adjust this line accordingly.
            hostLog(msg, "OS");
         }
      }
      else
      {
       hostLog(msg, "OS");
      }
   }
}
   
function krnTrapError(msg)
{
    hostLog("OS ERROR - TRAP: " + msg);

    _StdOut.bluescreen();
    hostBtnHaltOS_click();
    krnShutdown();
}


// function to load a program into memory
function krnLoadProgram(program, priority) {
  // ask the memory manager to do the actual loading
  if(_MemoryManager.load(program, priority))
  {
    // add the pcb to the resident list if we could successfully load it into
    // memory - when we get to file systems will we allow loading more than 3?
    _ResidentList[_ResidentList.length] = _MemoryManager.lastLoadedPCB;
  }
}

// function to run a program in memory
function krnRunProgram(pid) {
  var pcb = null;
  var idx = -1;

  for (var i = 0; i < _ResidentList.length; i++) {
    pcb = _ResidentList[i];
    if(pcb.pid === parseInt(pid,10))
    {
      idx = i;
      break;
    }
  }

  // check to see if we found the program in the resident list
  if(idx === -1)
  {
    // wasn't found
    _StdOut.putText("Invalid pid.");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  _CpuScheduler.run(pcb, idx);

  // start executing if not already
  _CPU.isExecuting = true;

  // update ready queue display
  updateReadyQueue();
}

// function to run all the programs at once
function krnRunAll() {
  // check to make sure something is loaded
  if(_ResidentList.length === 0)
  {
    // wasn't found
    _StdOut.putText("No programs loaded.");
    return;
  }

  _CpuScheduler.runAll();

  // start executing if not already
  _CPU.isExecuting = true;

  // update ready queue display
  updateReadyQueue();
}

// function to kill a specific process
function krnKill(pid) {
  var pcb = null;
  var idx = -1;

  // check to see if it is the current process and make sure it is still running
  if(_CurrentPCB.pid === pid && _CurrentPCB.finished === false) {
    if(_ReadyQueue.isEmpty())
      _CPU.isExecuting = false;

    _CpuScheduler.killProcess(pid, idx);
    return;
  }

  for (var i = 0; i < _ReadyQueue.getSize(); i++) {
    pcb = _ReadyQueue.getItem(i);
    if(pcb.pid === parseInt(pid,10))
    {
      idx = i;
      break;
    }
  }

  // check to see if we found the program in the resident list
  if(idx === -1)
  {
    // wasn't found
    _StdOut.putText("Invalid pid.");
    return;
  }

  _CpuScheduler.killProcess(pid, idx);
}