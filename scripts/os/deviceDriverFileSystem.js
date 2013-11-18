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
}

DeviceDriverFileSystem.prototype.driverEntry = function() {
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.
  this.status = "loaded";

  // TODO - do we want to support non-volatile storage?
};

// function to handle file system ISR operations - read, write, create, delete, format, ls
DeviceDriverFileSystem.prototype.isr = function(params) {
  if(params[0] === "create") {
    this.create(params[1]);
  }
  else if(params[0] === "read") {
    this.read(params[1]);
  }
  else if(params[0] === "write") {
    this.write(params[1], params[2]);
  }
  else if(params[0] === "delete") {
    this.delete(params[1]);
  }
  else if(params[0] === "format") {
    this.format();
  }
  else if(params[0] === "ls") {
    this.list();
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
    this.inUse = parseInt(vals[0], 10);

    var tsb = vals[1].split(",");
    if(!isNaN(tsb[0]))
      this.track = parseInt(tsb[0], 10);
    else
      this.track = "-";
    if(!isNaN(tsb[1]))
      this.sector = parseInt(tsb[1], 10);
    else
      this.track = "-";
    if(!isNaN(tsb[2]))
      this.block = parseInt(tsb[2], 10);
    else
      this.track = "-";

    //this.key = vals[1];
    var idx = vals[2].indexOf("*");
    if(idx > 0)
      this.data = vals[2].substring(0, idx);
    else
      this.data = vals[2];
  };
  // function to set the data in this entry
  this.setData = function(data) {
    if(data.length > BLOCK_SIZE - 4)
      return false;
    this.data = data;
    this.inUse = 1;
    return true;
  };
  // function to set the link to the next in the chain
  this.setLink = function(tsbString) {
    var items = tsbString.split(",");
    this.track = parseInt(items[0], 10);
    this.sector = parseInt(items[1], 10);
    this.block = parseInt(items[2], 10);
    //parseInt("" + t + s + b, 10);
  };

  //  get the numeric value for the link for this entry
  //this.getNumericLinkIndex = function() {
  //  return parseInt("" + this.track + this.sector + this.block, 10);
  //};
  // gets the string value (T,S,B) for the link for this entry
  this.getStringLink = function() {
    return this.track + "," + this.sector + "," + this.block;
  };
  // determines if this entry has a link or not
  this.hasLink = function() {
    return !isNaN(this.track);
  };
  // returns whether or not this entry is in use or not
  this.isInUse = function() {
    return this.inUse === 1;
  };
}

// returns whether or not the file system is formatted
DeviceDriverFileSystem.prototype.isFormatted = function() {
  return this.formatted;
};

// function to make the string key for local storage
DeviceDriverFileSystem.prototype.makeKey = function(t, s, b) {
  return t + "," + s + "," + b;
};

//  get the numeric value for the tsb string given
DeviceDriverFileSystem.prototype.getNumericKey = function(tsbString) {
  var items = tsbString.split(",");
  var t = items[0];
  var s = items[1];
  var b = items[2];
  return parseInt("" + t + s + b, 10);
};

// function to return all the entries in the file system for display
DeviceDriverFileSystem.prototype.getEntries = function() {
  // prevent the display from refreshing
  if(!this.formatted)
    return;

  var list = [];

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {

        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        list[list.length] = fileEntry;
      
      }
    }
  }
  return list;
};

// function to read the directory and return all the files
DeviceDriverFileSystem.prototype.getDirEntries = function() {
  var entry = "";
  var list = [];

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        if(fileEntry.isInUse())
          list[list.length] = fileEntry;

      }
    }
  }

  return list;
};

// function to find a specific entrying in the directory and return its TSB
DeviceDriverFileSystem.prototype.findDirEntry = function(filename) {
  var entry = "";
  var tsbString = "";

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        if(fileEntry.isInUse() && fileEntry.data === filename)
          return this.makeKey(track, sector, block);

      }
    }
  }

  return tsbString;
};

// function to get the next open slot in the directory
DeviceDriverFileSystem.prototype.getNextOpenDirEntry = function() {
  var entry = "";

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        // if its not in use then return the TSB
        if(!fileEntry.isInUse())
          return this.makeKey(track, sector, block);

      }
    }
  }

  return null;
};

// function to return the a list of the desired number of open file
// entries or null if not enough open entries are available
DeviceDriverFileSystem.prototype.getOpenFileEntries = function(numOfEntries) {
  var entry = "";
  var count = 0;
  var list = [];

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 1; track < NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        if(!fileEntry.isInUse()) {
          list[list.length] = this.makeKey(track, sector, block);
          count++;
          if(count === numOfEntries)
            return list;
        }
        
      }
    }
  }

  return null;
};




// function to format the file system
DeviceDriverFileSystem.prototype.format = function() {
  // foreach block in each sector in each track, enter the default data
  for(var track = 0; track < NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        var entry = new FileEntry();
        if(track === 0 && sector === 0 && block === 0) {
          entry.setData("MBR");
        }

        //this.fileEntries[this.getNumericKey(this.makeKey(track, sector, block))] = entry;
        localStorage[this.makeKey(track, sector, block)] = entry.toString();
      }
    }
  }
  this.formatted = true;
};

// function to create a file
DeviceDriverFileSystem.prototype.create = function(filename) {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  var nextOpenDir = this.getNextOpenDirEntry();
  var openFileEntry = this.getOpenFileEntries(1);   // when checking in write for if enough exist, subtract one for the first one we reserve when we create it
  if(nextOpenDir === null || openFileEntry === null) {
    _StdOut.putText("Error: file system full");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  var fileList = this.findDirEntry(filename);
  if(fileList !== "") {
    _StdOut.putText("Error: filename already taken");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  // get the directory slot and set the appropriate filename and link
  // to a reserved spot
  var entry = new FileEntry();
  entry.parseEntry(localStorage[nextOpenDir]);
  entry.setData(filename);
  entry.setLink(openFileEntry[0]);

  // reserve the next open file entry spot for this newly created file
  var reserveSpot = new FileEntry();
  reserveSpot.parseEntry(localStorage[openFileEntry[0]]);
  reserveSpot.setData(""); // TODO - better way to set in use?

  localStorage[nextOpenDir] = entry.toString();
  localStorage[openFileEntry[0]] = reserveSpot.toString();
};

// function to display the contents of a file
DeviceDriverFileSystem.prototype.read = function(filename) {
  // TODO
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }
};

// function to write data to a file
DeviceDriverFileSystem.prototype.write = function(filename) {
  // TODO
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }
};

// function to remove a file from storage
DeviceDriverFileSystem.prototype.delete = function(filename) {
  // TODO
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  var dirTSB = this.findDirEntry(filename);
  
  if(dirTSB === "") {
    _StdOut.putText("Error: file not found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  var blankEntry = new FileEntry();

  var entryObj = new FileEntry();
  entryObj.parseEntry(localStorage[dirTSB]);
  localStorage[dirTSB] = blankEntry.toString();

  var nextLink = entryObj.getStringLink();
  localStorage[nextLink] = blankEntry.toString();
  entryObj.parseEntry(localStorage[nextLink]);
  //var fileChain = [nextLink];

  while(entryObj.hasLink()) {
    nextLink = entryObj.getStringLink();
    //fileChain[fileChain.length] = nextLink;
    entryObj.parseEntry(localStorage[nextLink]);
    localStorage[nextLink] = blankEntry.toString();
  }

};

// function to list the files currently stored on the disk
DeviceDriverFileSystem.prototype.list = function() {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  var files = this.getDirEntries();
  if(files.length < 1) {
    _StdOut.putText("No files found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return;
  }

  for (var i = 0; i < files.length; i++) {
    if(files[i] !== "MBR") {
      _StdOut.putText(files[i].data);
      _StdOut.advanceLine();
    }
  }
  _StdOut.putText(">");
};