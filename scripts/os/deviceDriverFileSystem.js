/* ------------  
   deviceDriverFileSystem.js

   Requires globals.js

   
   ------------ */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem() {
   // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnFSDriverEntry;
    this.isr = krnFsIsr;     // TODO
    // "Constructor" code.
}

function krnFSDriverEntry() {
   // Initialization routine for this, the kernel-mode Keyboard Device Driver.
   this.status = "loaded";
}

// function to handle file system ISR operations - read, write, create, delete
function krnFsIsr(params) {
   if(params[0] === "create") {

   }
   else if(params[0] === "read") {

   }
   else if(params[0] === "write") {

   }
   else if(params[0] === "delete") {

   }
}