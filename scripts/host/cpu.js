/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function Cpu() {
    this.PC    = 0;     // Program Counter
    this.AC    = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false;
    
    this.init = function() {
        this.PC    = 0;
        this.AC    = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;
        this.isExecuting = false;
    };

    // clears the CPU registers
    this.clear = function() {
      this.PC    = 0;
      this.AC    = 0;
      this.Xreg  = 0;
      this.Yreg  = 0;
      this.Zflag = 0;
    };

    // sets the values of the cpu registers based on a given pcb
    this.set = function(pcb) {
      this.PC    = pcb.PC;
      this.AC    = pcb.AC;
      this.Xreg  = pcb.Xreg;
      this.Yreg  = pcb.Yreg;
      this.Zflag = pcb.Zflag;
    };
    
    this.cycle = function() {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.
        // Do the real work here. Be sure to set this.isExecuting appropriately.
        
        var opCode = _MemoryManager.read(this.PC++);

        switch(opCode) {
          case "A9":
            this.LDAconstant();
            break;
          case "AD":
            this.LDAmemory();
            break;
          case "8D":
            this.STA();
            break;
          case "6D":
            this.ADC();
            break;
          case "A2":
            this.LDXconstant();
            break;
          case "AE":
            this.LDXmemory();
            break;
          case "A0":
            this.LDYconstant();
            break;
          case "AC":
            this.LDYmemory();
            break;
          case "EA":
            this.NOP();
            break;
          case "00":
            this.BRK();
            break;
          case "EC":
            this.CPX();
            break;
          case "D0":
            this.BNE();
            break;
          case "EE":
            this.INC();
            break;
          case "FF":
            this.SYS();
            break;
          default:
            //_StdOut.putText("Invalid op code found: " + opCode + " terminating process.");
            //_StdOut.advanceLine();
            krnTrace("Invalid op code found: " + opCode + " terminating process.");
            //this.isExecuting = false;
            krnKill(_CurrentPCB.pid);
            //krnAddInterrupt(PROGRAM_TERMINATION_IRQ, false);  // TODO - to be changed
            break;
        }
    };

    // A9 - load the accumulator with a constant
    this.LDAconstant = function () {
      var constant = parseInt(_MemoryManager.read(this.PC++), 16);
      this.AC = constant;
    };
    // AD - load the accumulator from memory
    this.LDAmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      this.AC = value;
    };
    // 8D - store the accumulator in memory
    this.STA = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);

      var pad = "00";
      var stringValue = this.AC.toString(16).toUpperCase();
      stringValue = pad.substring(0, pad.length - stringValue.length) + stringValue;
      _MemoryManager.write(address, stringValue);
    };
    // 6D - add with carry
    this.ADC = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      this.AC = this.AC + value;
    };
    // A2 - load the x register with a constant
    this.LDXconstant = function () {
      var constant = parseInt(_MemoryManager.read(this.PC++), 16);
      this.Xreg = constant;
    };
    // AE - load the x register from memory
    this.LDXmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      this.Xreg = value;
    };
    // A0 - load the y register with a constant
    this.LDYconstant = function () {
      var constant = parseInt(_MemoryManager.read(this.PC++), 16);
      this.Yreg = constant;
    };
    // AC - load the y register from memory
    this.LDYmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      this.Yreg = value;
    };
    // EA - no operation
    this.NOP = function () {
      this.PC++;
    };
    // 00 - break (which is really a system call)
    this.BRK = function () {
      // stop execution and disable the single step
      // need to update and display PCB, let kernel know we are done somehow?
      //this.isExecuting = false;
      _SingleStep = false;
      disableStepBtn();

      krnKill(_CurrentPCB.pid);
      //krnAddInterrupt(PROGRAM_TERMINATION_IRQ, true);   // TODO - to be changed
    };
    // EC - compare a byte in memory to the x register, sets z flag if equal
    this.CPX = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      if(value == this.Xreg) {
        this.Zflag = 1;
      }
      else {
        this.Zflag = 0;
      }
    };
    // D0 - branch x bytes if z flag = 0
    this.BNE = function () {
      var bytes = parseInt(_MemoryManager.read(this.PC++), 16);
      if(this.Zflag === 0) {
        if(this.PC + bytes > 256) {
          this.PC = bytes + this.PC - 256;
        }
        else {
          this.PC += bytes;
        }
      }
      else {
        //this.PC++;
      }
    };
    // EE - increment the value of a byte
    this.INC = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 16);
      value++;
      var stringValue = value.toString(16);
      if(stringValue.length < 2)
        stringValue = "0" + stringValue;
      _MemoryManager.write(address, stringValue);
    };
    // FF - system call
    // $01 in x register = print the integer stored in the Y register
    // $02 in x register = print the 00-terminated string stored at the address in the y register
    this.SYS = function () {
      if(this.Xreg == 1) {
        //_StdOut.putText(this.Yreg.toString());
        //_StdOut.advanceLine();
        //_StdOut.putText(">");
        krnAddInterrupt(SYSTEM_CALL_PRINT_IRQ, this.Yreg.toString());
      }
      else if(this.Xreg == 2) {
        var address = this.Yreg;
        var data = _MemoryManager.read(address++);
        var str = "";

        // read all the characters of the string and print each out until we reach the 00 character
        while (data != "00") {
          var ASCIIvalue = parseInt(data, 16);
          //_StdOut.putText(String.fromCharCode(ASCIIvalue));
          str += String.fromCharCode(ASCIIvalue);
          data = _MemoryManager.read(address++);
        }
        //_StdOut.advanceLine();
        //_StdOut.putText(">");
        krnAddInterrupt(SYSTEM_CALL_PRINT_IRQ, str);
      }
    };
}
