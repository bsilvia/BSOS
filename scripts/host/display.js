/* ------------  
   display.js

   Routines to manipulate the display.
   ------------ */

// function to update datetime on status bar
function updateTime() {
    var now = new Date();
    var hrs = now.getHours() > 12 ? String(now.getHours() - 12) : String(now.getHours() === 0 ? 12 : now.getHours());
    var min = now.getMinutes() < 10 ? "0" + String(now.getMinutes()) : String(now.getMinutes());
    var sec = now.getSeconds() < 10 ? "0" + String(now.getSeconds()) : String(now.getSeconds());
    sec = sec + " " + (now.getHours() >= 12 ? "pm" : "am");

    var time = hrs + ":" + min + ":" + sec;
    var date = [now.getMonth() + 1,
          now.getDate(),
          now.getFullYear()].join('/');

    // set the content of the element with the ID time to the formatted string
    document.getElementById('datetime').innerHTML = date + " " + time;

    // call this function again in 1000ms
    setTimeout(updateTime, 1000);
}

// function to create the memory display table
function createMemoryDisplay() {
  var table = document.getElementById("memoryTable");

  // remove all current entries in the table
  while(table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  // go through and generate each row and cell
  for(var i = 0; i < 96; i++) {
    // calculate the hex value for this row
    var hexString = (i*8).toString(16);
    
    var row = table.insertRow(i);

    for(var j = 0; j < 9; j++) {
      var cell = row.insertCell(j);
      
      // if we are in the first column, pad the number and display it in bold
      if(j === 0) {
        cell.style.fontWeight = "bold";
        var pad = "000";
        hexString = pad.substring(0, pad.length - hexString.length) + hexString;
        cell.innerHTML = "$" + hexString;
      }
      else {
        cell.innerHTML = "00";
      }
    }
  }
}

// function to update the memory display given a memory array
function updateMemoryDisplay() {
   var table = document.getElementById("memoryTable");

   var memory = _MemoryManager.getMemory();

  // remove all current entries in the table
  while(table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  var memoryIndex = 0;

  // go through and generate each row and cell
  for(var i = 0; i < 96; i++) {
    // calculate the hex value for this row
    var hexString = (i*8).toString(16);

    var row = table.insertRow(i);

    if(memoryIndex % 256 === 0) {
      row.style.backgroundColor = '#6191FF';
    }

    for(var j = 0; j < 9; j++) {
      var cell = row.insertCell(j);
      
      // if we are in the first column, pad the number and display it in bold
      if(j === 0) {
        cell.style.fontWeight = "bold";
        var pad = "000";
        hexString = pad.substring(0, pad.length - hexString.length) + hexString;
        cell.innerHTML = "$" + hexString;
      }
      else {
        cell.innerHTML = memory[memoryIndex].read();
        memoryIndex++;
      }
    }
  }
}

// function to update the cpu display
function updateCpuDisplay() {
  var programCounter = _CPU.PC;
  var hexString = programCounter.toString(16);
  //var pad = "000";
  //hexString = "$" + pad.substring(0, pad.length - hexString.length) + hexString;
  
  document.getElementById("tdProgramCounter").innerHTML = toHexOutput(hexString, 3);
  document.getElementById("tdAccumulator").innerHTML = toHexOutput(_CPU.AC.toString(16), 2);   //parseInt(_CPU.AC, 16);
  document.getElementById("tdXRegister").innerHTML = toHexOutput(_CPU.Xreg.toString(16), 2);   //parseInt(_CPU.Xreg, 16);
  document.getElementById("tdYRegister").innerHTML = toHexOutput(_CPU.Yreg.toString(16), 2);   //parseInt(_CPU.Yreg, 16);
  document.getElementById("tdZFlag").innerHTML = toHexOutput(_CPU.Zflag.toString(16), 2);      //parseInt(_CPU.Zflag, 16);
}

// function to update the ready queue display
function updateReadyQueue () {
  var table = document.getElementById("readyQueueTable");

  // remove all current entries in the table
  while(table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  // go through and generate each row and cell
  for(var i = 0; i < 4; i++) {

    var row = table.insertRow(i);

    for(var j = 0; j < 8; j++) {
      var cell = row.insertCell(j);
      
      // if we are in the first column, pad the number and display it in bold
      if(i === 0 && j === 0) {
        cell.innerHTML = "PID";
      }
      else if (i === 0 && j === 1) {
        cell.innerHTML = "Base";
      }
      else if (i === 0 && j === 2) {
        cell.innerHTML = "Limit";
      }
      else if (i === 0 && j === 3) {
        cell.innerHTML = "PC";
      }
      else if (i === 0 && j === 4) {
        cell.innerHTML = "AC";
      }
      else if (i === 0 && j === 5) {
        cell.innerHTML = "X";
      }
      else if (i === 0 && j === 6) {
        cell.innerHTML = "Y";
      }
      else if (i === 0 && j === 7) {
        cell.innerHTML = "Z";
      }
      // display the item in ready queue (if applicable)
      else if (j === 0) {
        // if we don't have at least 1 item in the ready
        // queue then don't display anything
        if(_ReadyQueue.getSize() < i)
          j = 8;
        else
          cell.innerHTML = _ReadyQueue.getItem(i-1).pid;
      }
      else if (j === 1) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).base;
      }
      else if (j === 2) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).limit;
      }
      else if (j === 3) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).PC;
      }
      else if (j === 4) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).AC;
      }
      else if (j === 5) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).Xreg;
      }
      else if (j === 6) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).Yreg;
      }
      else if (j === 7) {
        cell.innerHTML = _ReadyQueue.getItem(i-1).Zflag;
      }
    } // end for each column in this row

  } // end for each row in the table
}

// takes a string and pads it with the number of 0's for output as hex
function toHexOutput(string, num) {
  var pad = "";
  for (var i = 0; i < num; i++) {
    pad += "0";
  }
  string = "$" + pad.substring(0, pad.length - string.length) + string;
  return string.toUpperCase();
}

// function to disable the step button when a program being stepped through finished
function disableStepBtn() {
  document.getElementById('btnStep').disabled = true;
}