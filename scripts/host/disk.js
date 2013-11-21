/* ------------  
   disk.js

   Core disk prototype.
   ------------ */

function Disk() {

}

// function to get an entry from the disk
Disk.prototype.getEntry = function(tsbString) {
	return localStorage[tsbString];
};

// function to set an entry on the disk
Disk.prototype.setEntry = function(tsbString, data) {
	localStorage[tsbString] = data;
};