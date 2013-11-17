/* ------------  
   deviceDriverFileSystem.js

   Requires globals.js

   
   ------------ */

//DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem() {
  // Override the base method pointers.
  //this.driverEntry = krnFSDriverEntry;
  //this.isr = krnFsIsr;
  this.status = "not loaded";
  this.fromatted = false;
  //this.getEntries = getAllEntries;
}

DeviceDriverFileSystem.prototype.driverEntry = function() {
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.
  this.status = "loaded";

  // TODO - do we want to support non-volatile storage?
};

// function to handle file system ISR operations - read, write, create, delete, format
DeviceDriverFileSystem.prototype.isr = function(params) {
  if(params[0] === "create") {
    // TODO - this.create(params[1]);
  }
  else if(params[0] === "read") {
    // TODO - this.read(params[1]);
  }
  else if(params[0] === "write") {
    // TODO - this.write(params[1], params[2]);
  }
  else if(params[0] === "delete") {
    // TODO - this.delete(params[1]);
  }
  else if(params[0] === "format") {
    this.format();
  }
};

// function to take the data for a value entry in the file system and return its string representation
DeviceDriverFileSystem.prototype.valueEntry = function(inUse, track, sector, block, data) {
  return inUse + "  " + track + "," + sector + "," + block + "  " + this.padData(data);
};

// function to take some data and an empty space holder
DeviceDriverFileSystem.prototype.padData = function(data) {
  for (var i = data.length; i < 60; i++) {
    data += "*";
  }
  return data;
};

DeviceDriverFileSystem.prototype.makeKey = function(t, s, b) {
  return t + "," + s + "," + b;
};

// function to return all the entries in the file system for display
DeviceDriverFileSystem.prototype.getEntries = function() {
  var entries = [];
  
  // foreach block in each sector in each track, grab the data and add it to the array
  for(var track = 0; track <= NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {
        entries[entries.length] = localStorage[this.makeKey(track, sector, block)];
      }
    }
  }

  return entries;
};

// function to format the file system
DeviceDriverFileSystem.prototype.format = function() {
  // foreach block in each sector in each track, enter the default data
  for(var track = 0; track <= NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {
        
        if(track === 0 && sector === 0 && block === 0)
          localStorage[this.makeKey(track, sector, block)] = this.valueEntry(1, "-", "-", "-", "MBR");
        else
          localStorage[this.makeKey(track, sector, block)] = this.valueEntry(0, "-", "-", "-", "");

      }
    }
  }
};
