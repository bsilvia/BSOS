/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    // Methods
    this.init        = shellInit;
    this.putPrompt   = shellPutPrompt;
    this.handleInput = shellHandleInput;
    this.execute     = shellExecute;
}

function shellInit() {
    var sc = null;
    
	_CommandHistory = new Array();
	
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data.";
    sc.function = shellVer;
    this.commandList[this.commandList.length] = sc;
    
    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help.";
    sc.function = shellHelp;
    this.commandList[this.commandList.length] = sc;
    
    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
    sc.function = shellShutdown;
    this.commandList[this.commandList.length] = sc;

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursor position.";
    sc.function = shellCls;
    this.commandList[this.commandList.length] = sc;

    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.function = shellMan;
    this.commandList[this.commandList.length] = sc;
    
    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.function = shellTrace;
    this.commandList[this.commandList.length] = sc;

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.function = shellRot13;
    this.commandList[this.commandList.length] = sc;

    // bsod
    sc = new ShellCommand();
    sc.command = "bluescreen";
    sc.description = "- Produces an OS error.";
    sc.function = function() {
        krnTrapError("User simulated error");
    };
    this.commandList[this.commandList.length] = sc;
    
    // whereami
    sc = new ShellCommand();
    sc.command = "whereami";
    sc.description = "- Displays the users current location.";
    sc.function = function() {
        var locations = new Array("Paris", "Barcelona", "London", "Maui", "New York City",
            "San Fransico", "Puerto Rico", "Sydney", "Vancouver", "Zurich", "Prague", "Florence");
        _StdOut.putText(locations[Math.floor((Math.random()*12)+1)]);
    };
    this.commandList[this.commandList.length] = sc;
    
    // findchucknorris
    sc = new ShellCommand();
    sc.command = "findchucknorris";
    sc.description = "- Do it, I dare you.";
    sc.function = function() {
        _StdOut.putText("You don't find Chuck Norris, he finds you.");
    };
    this.commandList[this.commandList.length] = sc;

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.function = shellPrompt;
    this.commandList[this.commandList.length] = sc;
	
	// status <string>
    sc = new ShellCommand();
    sc.command = "status";
    sc.description = "<string> - Sets the status.";
    sc.function = function(args){
		if (args.length > 0)
		{
			//_OsShell.promptStr = args[0];
			_Status  = document.getElementById('status');
            var newStatus = "";
            for (var i = 0; i < args.length; i++) {
                 newStatus += args[i] + " ";
            };
			_Status.value = newStatus;
            _Status.innerHTML = newStatus;
		}
		else
		{
			_StdIn.putText("Usage: status <string> Please supply a string.");
		}
	};
    this.commandList[this.commandList.length] = sc;

	// date
	sc = new ShellCommand();
	sc.command = "date";
	sc.description = "- Displays the current date and time.";
	sc.function = function() {
		var currentdate = new Date();
		var datetime = currentdate.getDate() + "/" +
						(currentdate.getMonth()+1)  + "/" +
						currentdate.getFullYear() + " " +
						currentdate.getHours() + ":" +
						currentdate.getMinutes() + ":" +
						currentdate.getSeconds();
		_StdIn.putText(datetime);
	};
	this.commandList[this.commandList.length] = sc;
	
    // single step
    sc = new ShellCommand();
    sc.command = "singlestep";
    sc.description = "<on | off> - Steps through program execution.";
    sc.function = function(args) {
        
        if (args.length > 0)
        {
            if(args[0] == "on") {
                _SingleStep = true;
                document.getElementById('btnStep').disabled = false;
            }
            else if(args[0] == "off"){
                _SingleStep = false;
                document.getElementById('btnStep').disabled = true;
            }
            else {
                _StdIn.putText("Usage: singlestep <on | off> Please indicate on or off.");
            }
        }
        else
        {
            _StdIn.putText("Usage: singlestep <on | off> Please indicate on or off.");
        }

    };
    this.commandList[this.commandList.length] = sc;

	// load 
	sc = new ShellCommand();
	sc.command = "load";
	sc.description = "<priority (optional)>- Loads code into memory with an optional priority.";
	sc.function = function(args) {
		var str = document.getElementById("taProgramInput").value;
        var priority = -1;

        if(str.trim() === "")
        {
            _StdOut.putText("No commands detected");
            _StdOut.advanceLine();
            return;
        }
        else if (args.length > 0 && isNaN(args[0]))
        {
            _StdOut.putText("Invalid priority number");
            _StdOut.advanceLine();
            return;
        }
        else if (args.length > 0 && parseInt(args[0], 10) < 0)
        {
            _StdOut.putText("Invalid priority number");
            _StdOut.advanceLine();
            return;
        }
        else if (args.length > 0) {
            priority = parseInt(args[0], 10);
        }

		var lines = str.split("\n");
		var myReg = /\b[0-9A-F]{2}\b/gi;
        var validCommands = true;

        // go through each line of commands to check its validity
		for (var i in lines)
		{
			// get list of commands separated by spaces
			var commandsArr = lines[i].trim().split(" ");
			// get list of commands that are composed of hex digits
			var matchArr = lines[i].trim().match(myReg);
			
			// if they are not the same length then this line is invalid code
			if(commandsArr === null || matchArr === null || commandsArr.length !== matchArr.length)
			{
                var y = parseInt(i, 10);
                y = parseInt(y+1, 10);
                _StdOut.putText("Invalid command on line " + y + ": " + lines[i]);
                _StdOut.advanceLine();
                krnTrace("Invalid command on line " + y + ": " + lines[i]);
                validCommands = false;
            }
		}

        if(validCommands) {
            var commands = str.split(" ");

            // TODO - add priority here
            krnLoadProgram(commands, priority);

            updateMemoryDisplay();
        }
	};
	this.commandList[this.commandList.length] = sc;

    // setschedule
    sc = new ShellCommand();
    sc.command = "setschedule";
    sc.description = "<rr | fcfs | priority> - Sets the scheduling algorithm.";
    sc.function = function(args) {
        if (args.length > 0)
        {
            if(args[0] === "rr")
                CURRENT_SCHEDULING_ALGOR = ROUND_ROBIN;
            else if (args[0] === "fcfs")
                CURRENT_SCHEDULING_ALGOR = FIRST_COME_FIRST_SERVE;
            else if (args[0] === "priority")
                CURRENT_SCHEDULING_ALGOR = PRIORITY;
            else
                _StdIn.putText("Usage: schedule <rr | fcfs | priority> Please supply a scheduling option.");
        }
        else
        {
            _StdIn.putText("Usage: schedule <rr | fcfs | priority> Please supply a scheduling option.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // getschedule
    sc = new ShellCommand();
    sc.command = "getschedule";
    sc.description = "- Returns the current scheduling algorithm.";
    sc.function = function(args) {
        if(CURRENT_SCHEDULING_ALGOR === ROUND_ROBIN)
            _StdOut.putText("Current scheduling algorithm: Round Robin");
        else if (CURRENT_SCHEDULING_ALGOR === FIRST_COME_FIRST_SERVE)
            _StdOut.putText("Current scheduling algorithm: First Come First Serve");
        else if (CURRENT_SCHEDULING_ALGOR === PRIORITY)
            _StdOut.putText("Current scheduling algorithm: Priority");
    };
    this.commandList[this.commandList.length] = sc;

    // run
    sc = new ShellCommand();
    sc.command = "run";
    sc.description = "<pid> - Runs the program with the given process ID.";
    sc.function = function(args) {
        if (args.length > 0)
        {
            krnRunProgram(args[0]);
        }
        else
        {
            _StdIn.putText("Usage: run <pid> Please supply a pid.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // runall
    sc = new ShellCommand();
    sc.command = "runall";
    sc.description = "- Runs all the program at once.";
    sc.function = function(args) {
        krnRunAll();
    };
    this.commandList[this.commandList.length] = sc;

    // quantum
    sc = new ShellCommand();
    sc.command = "quantum";
    sc.description = "<int> - Changes the quantum of time for Round Robin.";
    sc.function = function(args) {
        // ensure they passed an int
        if (args.length > 0 && !isNaN(args[0]) && parseInt(args[0], 10) > 0)
        {
            _Quantum = parseInt(args[0], 10);
            // let the scheduler know we have a new quantum
            //_CpuScheduler.newQuantum();
        }
        else
        {
            _StdOut.putText("Usage: quantum <int> Please supply a positive integer.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // processes
    sc = new ShellCommand();
    sc.command = "processes";
    sc.description = "- Displays the PIDs of all active processes.";
    sc.function = function(args) {
        if(_ReadyQueue.getSize() === 0 && _CurrentPCB.finished === true)
        {
            _StdOut.putText("No active processes");
            return;
        }

        _StdOut.putText("Active processes: ");
        _StdOut.putText(_CurrentPCB.pid + " ");
        for (var i = 0; i < _ReadyQueue.getSize(); i++) {
            _StdOut.putText(_ReadyQueue.getItem(i).pid.toString() + " ");
        }
        //StdOut.putText(_ReadyQueue.toString() + "[" + this.q[i] + "] "); // TODO - or resident list?
        //_StdOut.advanceLine();
    };
    this.commandList[this.commandList.length] = sc;

    // kill
    sc = new ShellCommand();
    sc.command = "kill";
    sc.description = "<pid> - Kills the process with the given pid.";
    sc.function = function(args) {
        // ensure they passed a pid
        if (args.length > 0 && !isNaN(args[0]) && parseInt(args[0], 10) >= 0)
        {
            krnKill(parseInt(args[0],10));
        }
        else
        {
            _StdIn.putText("Usage: kill <pid> Please supply a non-negative pid.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // format
    sc = new ShellCommand();
    sc.command = "format";
    sc.description = "- Formats the hard disk.";
    sc.function = function(args) {
        // TODO - display message for error or success
        krnAddInterrupt(FILE_SYSTEM_IRQ, ["format"]);
    };
    this.commandList[this.commandList.length] = sc;

    // ls
    sc = new ShellCommand();
    sc.command = "ls";
    sc.description = "- Lists all files currently on disk.";
    sc.function = function(args) {
        // TODO
        krnAddInterrupt(FILE_SYSTEM_IRQ, ["ls"]);
    };
    this.commandList[this.commandList.length] = sc;

    // create
    sc = new ShellCommand();
    sc.command = "create";
    sc.description = "<filename> - Creates a file with the given name.";
    sc.function = function(args) {
        // ensure they passed a filename and that it only contains characters and digits
        if (args.length > 0 && /^[A-Za-z][A-Za-z0-9]*$/.test(args[0]))
        {
            // TODO - display message for error or success
            // krnAddInterrupt(FILE_SYSTEM_IRQ, ["create", args[0]]);
            //_StdOut.putText("valid");
        }
        else
        {
            _StdIn.putText("Usage: create <filename> Please supply a valid filename.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // read
    sc = new ShellCommand();
    sc.command = "read";
    sc.description = "<filename> - Reads the contents of the given file.";
    sc.function = function(args) {
        // ensure they passed a filename
        if (args.length > 0 && /^[A-Za-z][A-Za-z0-9]*$/.test(args[0]))
        {
            // TODO - display error if something went wrong
            // krnAddInterrupt(FILE_SYSTEM_IRQ, ["read", args[0]]); // in read isr call function to validate filename
        }
        else
        {
            _StdIn.putText("Usage: read <filename> Please supply a valid filename.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // write
    sc = new ShellCommand();
    sc.command = "write";
    sc.description = "<filename data> - Writes the given data to a file.";
    sc.function = function(args) {
        // ensure they passed a filename
        if (args.length > 1 && /^[A-Za-z][A-Za-z0-9]*$/.test(args[0]))
        {
            // TODO - display message for error or success
            var data = "";
            for (var i = 0; i < args.length; i++) {
                data += args[i] + " ";
            }
            data.trim();
            // krnAddInterrupt(FILE_SYSTEM_IRQ, ["write", args[0], data]); // in write isr call function to validate filename
        }
        else
        {
            _StdIn.putText("Usage: write <filename data> Please supply a valid filename and some data.");
        }
    };
    this.commandList[this.commandList.length] = sc;

    // delete
    sc = new ShellCommand();
    sc.command = "delete";
    sc.description = "<filename> - Removes the given file for storage.";
    sc.function = function(args) {
        // ensure they passed a filename
        if (args.length > 0 && /^[A-Za-z][A-Za-z0-9]*$/.test(args[0]))
        {
            // TODO - display message for error or success
            // krnAddInterrupt(FILE_SYSTEM_IRQ, ["delete", args[0]]); // in delete isr call function to validate filename
        }
        else
        {
            _StdIn.putText("Usage: delete <filename> Please supply a valid filename.");
        }
    };
    this.commandList[this.commandList.length] = sc;
	
    // Display the initial prompt.
    this.putPrompt();
}

function shellPutPrompt()
{
    _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
    krnTrace("Shell Command~" + buffer);
    // 
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = shellParseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // JavaScript may not support associative arrays in all browsers so we have to
    // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            var fn = this.commandList[index].function;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
}

function shellParseInput(buffer)
{
    var retVal = new UserCommand();

    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);

    // 2. Lower-case it.
    buffer = buffer.toLowerCase();
	
	// 2.1 Record the command in the history.
	_CommandIndex = _CommandHistory.length;
	_CommandHistory[_CommandIndex++] = buffer;

    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");

    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;

    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg !== "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
}

function shellExecute(fn, args)
{
    // We just got a command, so advance the line...
    _StdIn.advanceLine();
    // ... call the command function passing in the args...
    fn(args);
    // Check to see if we need to advance the line again
    if (_StdIn.CurrentXPosition > 0)
    {
        _StdIn.advanceLine();
    }
    // ... and finally write the prompt again.
    this.putPrompt();
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()
{
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for, well... help.");
    }
}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
   if (_SarcasticMode) {
      _StdIn.putText("Okay. I forgive you. This time.");
      _SarcasticMode = false;
   } else {
      _StdIn.putText("For what?");
   }
}

function shellVer(args)
{
    _StdIn.putText(APP_NAME + " version " + APP_VERSION);
}

function shellHelp(args)
{
    _StdIn.putText("Commands:");
    for (var i in _OsShell.commandList)
    {
        _StdIn.advanceLine();
        _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");
     // Call Kernel shutdown routine.
    krnShutdown();
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help":
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on":
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }
                
                break;
            case "off":
                _Trace = false;
                _StdIn.putText("Trace OFF");
                break;
            default:
                _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
        }
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}
