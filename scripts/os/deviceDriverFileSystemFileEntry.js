/* ------------  
   deviceDriverFileSystemFileEntry.js

   Requires globals.js

   Core file entry prototype.
   ------------ */

// class to keep track of each file entry
function FileEntry() {
  this.inUse = 0;
  this.track = "-";
  this.sector = "-";
  this.block = "-";
  this.data = "";
  this.separator = "  ";
}

// function to return this file entry's string representation
FileEntry.prototype.toString = function() {
  return this.inUse + this.separator +
      this.track + "," + this.sector + "," + this.block + this.separator +
      this.padData(this.data);
};

// function to take some data and an empty space holder
FileEntry.prototype.padData = function(data) {
  var newData = data;
  for (var i = newData.length; i < BLOCK_SIZE - 4; i++) {
    newData += "*";
  }
  return newData;
};

// function to parse this entry into its appropriate values
FileEntry.prototype.parseEntry = function(entryString) {
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
FileEntry.prototype.setData = function(data) {
  if(data.length > BLOCK_SIZE - 4)
    return false;
  this.data = data;
  this.inUse = 1;
  return true;
};

// function to set the link to the next in the chain
FileEntry.prototype.setLink = function(tsbString) {
  var items = tsbString.split(",");
  this.track = parseInt(items[0], 10);
  this.sector = parseInt(items[1], 10);
  this.block = parseInt(items[2], 10);
};

// gets the string value (T,S,B) for the link for this entry
FileEntry.prototype.getStringLink = function() {
  return this.track + "," + this.sector + "," + this.block;
};

// determines if this entry has a link or not
FileEntry.prototype.hasLink = function() {
  return !isNaN(this.track);
};

// returns whether or not this entry is in use or not
FileEntry.prototype.isInUse = function() {
  return this.inUse === 1;
};