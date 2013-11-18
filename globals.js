/* ------------  
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)
   
   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS
//
var APP_NAME = "Layered Cake";
var APP_VERSION = "2.112";

var CPU_CLOCK_INTERVAL = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                    // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;

var PROGRAM_TERMINATION_IRQ = 2;

var SYSTEM_CALL_PRINT_IRQ = 3;

var CONTEXT_SWITCH_IRQ = 4;

var FILE_SYSTEM_IRQ = 5;

// Scheduling algorithms constants
var ROUND_ROBIN = 0;
var FIRST_COME_FIRST_SERVE = 1;
var PRIORITY = 2;

// Scheduling algorithm variable
var CURRENT_SCHEDULING_ALGOR = ROUND_ROBIN;

// Sizes for file system
var NUMBER_OF_TRACKS = 4;
var NUMBER_OF_SECTORS = 8;
var NUMBER_OF_BLOCKS = 8;
var BLOCK_SIZE = 64;


//
// Global Variables
//
var _CPU = null;

var _OSclock = 0;       // Page 23.

var _Mode = 0;   // 0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas = null;               // Initialized in hostInit().
var _DrawingContext = null;       // Initialized in hostInit().
var _DefaultFontFamily = "sans";  // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;        // Additional space added to font size when advancing a line.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// Single steping
var _Step = false;
var _SingleStep = false;

// Memory manager
var _MemoryManager = null;
// Memory size
var _MemorySize = 768;
// Memory block size
var _BlockSize = 255;

// CPU scheduler
var _CpuScheduler = null;

// Array to hold PCBs for processes that are running
var _ReadyQueue = null;

// Current PCB
var _CurrentPCB = null;

// Array to hold processes that are loaded
var _ResidentList = null;

// Time quantum for Round Robin scheduling
var _Quantum = 6;

// UI
var _Console = null;
var _OsShell = null;
var _CommandHistory = null;
var _CommandIndex = 0;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var krnKeyboardDriver = null;
var krnFileSystemDriver = null;

// For testing...
var _GLaDOS = null;
