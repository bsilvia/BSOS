/* ------------  
   deviceDriverFileSystem.js

   Requires globals.js

   Prototype to handle all implementation of byte-level detail of file system.
   ------------ */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem() {
  // Override the base method pointers.
  //this.driverEntry = krnFSDriverEntry;
  //this.isr = krnFsIsr;
  this.status = "not loaded";
  this.formatted = false;
  this.fileEntries = [];
}

DeviceDriverFileSystem.prototype.driverEntry = function() {
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.

  // foreach block in each sector in the directory, grab the filenames
  for(var track = 0; track < NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {

        var entry = new FileEntry();
        //entry.setKey(this.makeKey(track, sector, block));
        //var idx = parseInt("" + track + sector + block, 10);
        this.fileEntries[parseInt("" + track + sector + block, 10)] = entry;

      }
    }
  }
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

// class to keep track of each file entry
function FileEntry() {
  this.inUse = 0;
  this.track = "-";
  this.sector = "-";
  this.block = "-";
  //this.key = "";
  this.data = "";
  this.separator = "  ";

  // function to return this file entry's string representation
  this.toString = function () {
    return this.inUse + this.separator +
      this.track + "," + this.sector + "," + this.block + this.separator +
      this.padData(this.data);
  };
  // function to take some data and an empty space holder
  this.padData = function(data) {
    var newData = data;
    for (var i = newData.length; i < BLOCK_SIZE - 4; i++) {
      newData += "*";
    }
    return newData;
  };
  // function to parse this entry into its appropriate values
  this.parseEntry = function(entryString) {
    var vals = entryString.split(this.separator);
    this.inUse = vals[0];

    var tsb = vals[1].split(",");
    this.track = tsb[0];
    this.sector = tsb[1];
    this.block = tsb[2];

    //this.key = vals[1];
    this.data = vals[2].replace('*', "");
  };
  // function to set the data in this entry
  this.setData = function(data) {
    if(data.length > BLOCK_SIZE - 4)
      return false;
    this.data = data;
    return true;
  };

  this.getNumericLink = function() {
    return parseInt("" + this.track + this.sector + this.block, 10);
  };
  this.getStringLink = function() {
    return this.track + "," + this.sector + "," + this.block;
  };
  this.hasLink = function() {
    return !isNaN(this.getNumericLink());
  };
  this.isInUse = function() {
    return this.inUse === 0;
  };
}

// returns whether or not the file system is formatted
DeviceDriverFileSystem.prototype.isFormatted = function() {
  return this.formatted;
};

// function to make the key for local storage
DeviceDriverFileSystem.prototype.makeKey = function(t, s, b) {
  return t + "," + s + "," + b;
};

// function to return all the entries in the file system for display
DeviceDriverFileSystem.prototype.getEntries = function() {
  /*var entries = [];
  
  // foreach block in each sector in each track, grab the data and add it to the array
  for(var track = 0; track <= NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {
        entries[entries.length] = localStorage[this.makeKey(track, sector, block)];
      }
    }
  }

  return entries;*/
  return this.fileEntries;
};

// function to read the directory and return all the files
DeviceDriverFileSystem.prototype.getDirEntries = function() {
  var entry = "";
  var list = [];

  // foreach block in each sector in the directory, grab the filenames
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {
        
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        list[list.length] = fileEntry;

      }
    }
  }

  return list;
};




// function to format the file system
DeviceDriverFileSystem.prototype.format = function() {
  // foreach block in each sector in each track, enter the default data
  for(var track = 0; track <= NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector <= NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block <= NUMBER_OF_BLOCKS; block++) {
        
        var entry = new FileEntry();
        if(track === 0 && sector === 0 && block === 0)
          entry.setData("MBR");
        //else
        //  localStorage[this.makeKey(track, sector, block)] = this.formatEntry(0, "-", "-", "-", "");

        localStorage[this.makeKey(track, sector, block)] = entry.toString();
      }
    }
  }
  this.formatted = true;
};

// function to create a file
DeviceDriverFileSystem.prototype.create = function(filename) {
  // TODO
};

// function to display the contents of a file
DeviceDriverFileSystem.prototype.read = function(filename) {
  // TODO
};

// function to write data to a file
DeviceDriverFileSystem.prototype.write = function(filename) {
  // TODO
};

// function to remove a file from storage
DeviceDriverFileSystem.prototype.delete = function(filename) {
  // TODO
};

// function to list the files currently stored on the disk
DeviceDriverFileSystem.prototype.list = function() {
  // TODO
};