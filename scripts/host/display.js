/* ------------  
   display.js

   Routines to manipulate the display.
   ------------ */

// function to update datetime on status bar
function updateTime() {
    var now = new Date();
    var hrs = now.getHours() > 12 ? String(now.getHours() - 12) : String(now.getHours() == 0 ? 12 : now.getHours());
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
      if(j == 0) {
        cell.style.fontWeight = "bold";
        var pad = "000";
        hexString = pad.substring(0, pad.length - hexString.length) + hexString;
        cell.innerHTML = "$" + hexString;
      }
      else {
        cell.innerHTML = 00;
      }
    }
  }
}

// function to update the memory display given a memory array
function updateMemoryDisplay(memory) {
   var table = document.getElementById("memoryTable");

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

    for(var j = 0; j < 9; j++) {
      var cell = row.insertCell(j);
      
      // if we are in the first column, pad the number and display it in bold
      if(j == 0) {
        cell.style.fontWeight = "bold";
        var pad = "000";
        hexString = pad.substring(0, pad.length - hexString.length) + hexString;
        cell.innerHTML = "$" + hexString;
      }
      else {
        cell.innerHTML = memory[memoryIndex];
        memoryIndex++;
      }
    }
  }
}