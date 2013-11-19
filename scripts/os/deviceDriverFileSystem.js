/* ------------  
   deviceDriverFileSystem.js

   Requires globals.js and deviceDriverFileSystemFileEntry.js

   Prototype to handle all implementation of byte-level detail of file system.
   ------------ */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem() {
  // Override the base method pointers.
  //this.driverEntry = krnFSDriverEntry;
  //this.isr = krnFsIsr;
  this.status = "not loaded";
  this.formatted = false;
  this.readData = "";
}

DeviceDriverFileSystem.prototype.driverEntry = function() {
  // Initialization routine for this, the kernel-mode Keyboard Device Driver.
  this.status = "loaded";

  // TODO - do we want to support non-volatile storage?
};

// function to handle file system ISR operations - read, write, create, delete, format, ls
DeviceDriverFileSystem.prototype.isr = function(params) {
  if(params[0] === "create") {
    if(this.create(params[1])) {
      _StdOut.putText("Successfully create new file: " + params[1]);
      _StdOut.advanceLine();
      _StdOut.putText(">");
    }
  }
  else if(params[0] === "read") {
    if(this.read(params[1])) {
      _StdOut.putText(this.readData);
      _StdOut.advanceLine();
      _StdOut.putText(">");
    }
  }
  else if(params[0] === "write") {
    if (this.write(params[1], params[2])) {
      _StdOut.putText("Successfully wrote to " + params[1]);
      _StdOut.advanceLine();
      _StdOut.putText(">");
    }
  }
  else if(params[0] === "delete") {
    if (this.delete(params[1])) {
      _StdOut.putText("Successfully deleted " + params[1]);
      _StdOut.advanceLine();
      _StdOut.putText(">");
    }
  }
  else if(params[0] === "format") {
    if (this.format()) {
      _StdOut.putText("Successfully formatted the file system");
      _StdOut.advanceLine();
      _StdOut.putText(">");
    }
  }
  else if(params[0] === "ls") {
    this.list();
  }
  else if(params[0] === "swapCreate") {
    this.create(params[1]);
  }
  else if(params[0] === "swapRead") {
    this.read(params[1]);
  }
  else if(params[0] === "swapWrite") {
    this.write(params[1], params[2]);
  }
  else if(params[0] === "swapDelete") {
    this.delete(params[1]);
  }
};



// returns whether or not the file system is formatted
DeviceDriverFileSystem.prototype.isFormatted = function() {
  return this.formatted;
};

// function to make the string key for local storage
DeviceDriverFileSystem.prototype.makeKey = function(t, s, b) {
  return t + "," + s + "," + b;
};

// funtion to return the last data that was read from the disk
DeviceDriverFileSystem.prototype.getReadData = function() {
  return this.readData;
};

// function to return all the entries in the file system for display
DeviceDriverFileSystem.prototype.getEntries = function() {
  // prevent the display from refreshing if we aren't formatted
  if(!this.formatted)
    return;

  // list of FileEntry objects for every TSB on the disk for display
  var list = [];

  // foreach block in each sector in the directory, grab the entries
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

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        // get the file entry on the disk and parse it
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        // see if it is in use and if it matches the filename we are looking for
        if(fileEntry.isInUse() && fileEntry.data === filename)
          return this.makeKey(track, sector, block);

      }
    }
  }

  return "";
};

// function to get the next open slot in the directory
DeviceDriverFileSystem.prototype.getNextOpenDirEntry = function() {
  var entry = "";

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 0; track < 1; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        // get the file entry on the disk and parse it
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
  if(numOfEntries === 0)
    return null;

  var entry = "";
  var count = 0;
  var list = [];

  // foreach block in each sector in the directory, grab the entries,
  // check to see if they are in use, i.e. they have an entry
  for(var track = 1; track < NUMBER_OF_TRACKS; track++) {
    for (var sector = 0; sector < NUMBER_OF_SECTORS; sector++) {
      for (var block = 0; block < NUMBER_OF_BLOCKS; block++) {
        
        // get the file entry on the disk and parse it
        entry = localStorage[this.makeKey(track, sector, block)];
        var fileEntry = new FileEntry();
        fileEntry.parseEntry(entry);
        // if the entry is not in use then add it to the list and increment  
        // our count, returning when we have found numOfEntries open entries
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
        
        var blankEntry = new FileEntry();
        if(track === 0 && sector === 0 && block === 0) {
          blankEntry.setData("MBR");
        }
        // set the local storage to a blank file entry - not in use, no link and no data
        localStorage[this.makeKey(track, sector, block)] = blankEntry.toString();

      }
    }
  }

  this.formatted = true;
  return true;
};

// function to create a file
DeviceDriverFileSystem.prototype.create = function(filename) {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // look for space in the directory and at least one open file entry
  var nextOpenDir = this.getNextOpenDirEntry();
  var openFileEntries = this.getOpenFileEntries(1);
  if(nextOpenDir === null || openFileEntries === null) {
    _StdOut.putText("Error: file system full");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // search for a file with our filename and see if it 
  // is not found i.e. the filename isn't already taken
  if(this.findDirEntry(filename) !== "") {
    _StdOut.putText("Error: filename already taken");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // get the directory slot and set the appropriate 
  // filename and link to a reserved file entry spot
  var entry = new FileEntry();
  entry.parseEntry(localStorage[nextOpenDir]);
  entry.setData(filename);
  entry.setLink(openFileEntries[0]);

  // reserve the next open file entry spot for this newly created file
  var reserveSpot = new FileEntry();
  reserveSpot.parseEntry(localStorage[openFileEntries[0]]);
  reserveSpot.setData(""); // TODO - better way to set in use?

  // commit the values to the disk
  localStorage[nextOpenDir] = entry.toString();
  localStorage[openFileEntries[0]] = reserveSpot.toString();

  return true;
};

// function to display the contents of a file
DeviceDriverFileSystem.prototype.read = function(filename) {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // search for a file with our filename and see if it 
  // is found i.e. the filename does exist
  var dirTSB = this.findDirEntry(filename);
  if(dirTSB === "") {
    _StdOut.putText("Error: file not found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // parse the entry info from the directory entry
  var entryObj = new FileEntry();
  entryObj.parseEntry(localStorage[dirTSB]);

  // get the first link to the file data
  var nextLink = entryObj.getStringLink();
  entryObj.parseEntry(localStorage[nextLink]);

  // extract the first bit of info from the first link in the chain
  var fileData = entryObj.data;

  // go through the rest of the links in the chain and concatenate the data together
  while(entryObj.hasLink()) {
    nextLink = entryObj.getStringLink();
    entryObj.parseEntry(localStorage[nextLink]);
    fileData += entryObj.data;
  }
  // store the last read data for when we want to display it or when we are swapping
  this.readData = fileData;
  
  return true;
};

// function to write data to a file
DeviceDriverFileSystem.prototype.write = function(filename, data) {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // search for a file with our filename and see if it 
  // is found i.e. the file does exist
  var dirTSB = this.findDirEntry(filename);
  if(dirTSB === "") {
    _StdOut.putText("Error: file not found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // go through and delete all the contents of this file
  // since write is an over-write in our implementation
  this.deleteFileContents(dirTSB);

  // go and grab the first link in the chain for this file
  var entryObj = new FileEntry();
  entryObj.parseEntry(localStorage[dirTSB]);
  var allocatedBlock = entryObj.getStringLink();
  
  // if the data can fit in the block that we already assigned it when we created the file
  if (data.length < BLOCK_SIZE - 4) {
    // just put the data in there
    entryObj = new FileEntry();
    entryObj.setData(data);
    localStorage[allocatedBlock] = entryObj.toString();
  }
  // otherwise we must spread this file out across several blocks
  else {
    var dataArray = [];
    var maxDataSize = BLOCK_SIZE - 4;
    // grab block size chunks of the data at a time, adding that to a
    // list which we will write to disk and chain all together
    while (data !== "") {
      dataArray[dataArray.length] = data.substring(0, maxDataSize);
      data = data.substring(maxDataSize, data.length);
      if(data.length < maxDataSize)
        maxDataSize = data.length;
    }

    // see if there are enough open blocks on the disk for the size of this write
    // we need as many blocks as split the data into - 1 because when we created
    // the file we reserved one block
    var openFileEntries = this.getOpenFileEntries(dataArray.length - 1);
    if(openFileEntries === null) {
      _StdOut.putText("Error: not enough space in file system");
      _StdOut.advanceLine();
      _StdOut.putText(">");
      return false;
    }

    // variable to keep track of the last link - this is the TSB
    // in which we are writing to, after we write to it we assign
    // it the next open block and continue
    var lastTSB = allocatedBlock;
    
    // go about spreading the data across more than 1 block by
    // adding each chunk of data to each open block we found earlier
    for (var j = 0; j <= openFileEntries.length; j++) {
      entryObj = new FileEntry();
      entryObj.setData(dataArray[j]);
      // set the next link in the chain if we aren't at the last one
      if(j !== openFileEntries.length)
        entryObj.setLink(openFileEntries[j]);
      localStorage[lastTSB] = entryObj.toString();
      lastTSB = openFileEntries[j];
    }
  }
  
  return true;
};

// function to remove a file from storage
DeviceDriverFileSystem.prototype.delete = function(filename) {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // get the TSB of the directory entry for this file, i.e.
  // search for a file with our filename and see if it 
  // is found i.e. the file does exist
  var dirTSB = this.findDirEntry(filename);
  if(dirTSB === "") {
    _StdOut.putText("Error: file not found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  var blankEntry = new FileEntry();
  var entryObj = new FileEntry();

  // parse the entry info from the directory entry in order
  // to get the next link in this file chain
  entryObj.parseEntry(localStorage[dirTSB]);
  // clear out the directory entry
  localStorage[dirTSB] = blankEntry.toString();

  // get the first link to the chain from the directory entry we parsed earlier
  var nextLink = entryObj.getStringLink();
  entryObj.parseEntry(localStorage[nextLink]);
  // clear out this entry
  localStorage[nextLink] = blankEntry.toString();

  // go through each remaining link of the chain and delete those in similar fashion
  while(entryObj.hasLink()) {
    nextLink = entryObj.getStringLink();
    entryObj.parseEntry(localStorage[nextLink]);
    localStorage[nextLink] = blankEntry.toString();
  }

  return true;
};

// function to delete the contents of a given file
DeviceDriverFileSystem.prototype.deleteFileContents = function(dirTSB) {
  var blankEntry = new FileEntry();
  var entryObj = new FileEntry();

  // parse the entry info from the directory entry in order
  // to get the first link in this file chain
  entryObj.parseEntry(localStorage[dirTSB]);

  // get the first link to the chain from the directory entry we parsed earlier
  var nextLink = entryObj.getStringLink();
  entryObj.parseEntry(localStorage[nextLink]);
  // clear out the first entry's data but still reserve it since we alwasy want
  // to have at least one block for each file that we create
  entryObj.setData("");
  localStorage[nextLink] = entryObj.toString();

  // go through any remaining links of the chain and replace entries with blank, unused entries
  while(entryObj.hasLink()) {
    nextLink = entryObj.getStringLink();
    entryObj.parseEntry(localStorage[nextLink]);
    localStorage[nextLink] = blankEntry.toString();
  }

  return true;
};

// function to list the files currently stored on the disk
DeviceDriverFileSystem.prototype.list = function() {
  if(!this.formatted) {
    _StdOut.putText("Error: file system not formatted yet");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // make sure there are more than just the msb in the directory track
  var files = this.getDirEntries();
  if(files.length < 2) {
    _StdOut.putText("No files found");
    _StdOut.advanceLine();
    _StdOut.putText(">");
    return false;
  }

  // go through all the files and print out the names except for the MBR
  for (var i = 0; i < files.length; i++) {
    if(files[i].data !== "MBR") {
      _StdOut.putText(files[i].data + " ");
    }
  }
  _StdOut.advanceLine();
  _StdOut.putText(">");

  return true;
};