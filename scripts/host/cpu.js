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
        this.AC   = 0;
        this.Xreg  = 0;
        this.Yreg  = 0;
        this.Zflag = 0;
        this.isExecuting = false;
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
            this.isExecuting = false;
            break;
        }
    };

    // A9 - load the accumulator with a constant
    this.LDAconstant = function () {
      var constant = _MemoryManager.read(this.PC++);
      this.AC = constant;
    }
    // AD - load the accumulator from memory
    this.LDAmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = _MemoryManager.read(address);
      this.AC = value;
    }
    // 8D - store the accumulator in memory
    this.STA = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      _MemoryManager.write(address, this.AC);
    }
    // 6D - add with carry
    this.ADC = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = parseInt(_MemoryManager.read(address), 10);
      this.AC = (parseInt(this.AC, 10) + value).toString(16);
    }
    // A2 - load the x register with a constant
    this.LDXconstant = function () {
      var constant = _MemoryManager.read(this.PC++);
      this.Xreg = constant;
    }
    // AE - load the x register from memory
    this.LDXmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = _MemoryManager.read(address);
      this.Xreg = value;
    }
    // A0 - load the y register with a constant
    this.LDYconstant = function () {
      var constant = _MemoryManager.read(this.PC++);
      this.Yreg = constant;
    }
    // AC - load the y register from memory
    this.LDYmemory = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = _MemoryManager.read(address);
      this.Yreg = value;
    }
    // EA - no operation
    this.NOP = function () {
      this.PC++;
    }
    // 00 - break (which is really a system call)
    this.BRK = function () {
      // stop execution and disable the step button
      this.isExecuting = false;
      _SingleStep = false;
      document.getElementById('btnStep').disabled = false;
    }
    // EC - compare a byte in memory to the x register, sets z flag if equal
    this.CPX = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = _MemoryManager.read(address);
      if(parseInt(value, 10) == parseInt(this.Xreg, 10)) {
        this.Zflag = 1;
      }
    }
    // D0 - branch x bytes if z flag = 0
    this.BNE = function () {
      var bytes = _MemoryManager.read(this.PC++);
      var intBytes = parseInt(bytes, 16);
      if(this.Zflag == 0) {
        if(this.PC + intBytes > 256) {
          this.PC = intBytes + this.PC - 256;
        }
        else {
          this.PC += intBytes;
        }
      }
      else {
        //this.PC++;
      }
    }
    // EE - increment the value of a byte
    this.INC = function () {
      var mem1 = _MemoryManager.read(this.PC++);
      var mem2 = _MemoryManager.read(this.PC++);
      var address = parseInt(mem2 + mem1, 16);
      var value = _MemoryManager.read(address);
      var numericValue = parseInt(value, 10) + 1;
      var pad = "00";
      var stringValue = numericValue.toString(16);
      stringValue = pad.substring(0, pad.length - stringValue.length) + stringValue;
      _MemoryManager.write(address, stringValue);
    }
    // FF - system call
    // $01 in x register = print the integer stored in the Y register
    // $02 in x register = print the 00-terminated string stored at the address in the y register
    this.SYS = function () {
      if(parseInt(this.Xreg, 10) == 1) {
        _StdOut.putText(parseInt(this.Yreg, 10).toString());
        _StdOut.advanceLine();
        _StdOut.putText(">");
      }
      else if(parseInt(this.Xreg, 10) == 2) {
        var mem = this.Yreg;
        var address = parseInt(mem, 16);
        var data = _MemoryManager.read(address++);

        // read all the characters of the string and print each out until we reach the 00 character
        while (data != "00") {
          var ASCIIvalue = parseInt(data, 16);
          _StdOut.putText(String.fromCharCode(ASCIIvalue));
          data = _MemoryManager.read(address++);
        }
        _StdOut.advanceLine();
        _StdOut.putText(">");
      }
    }
}
