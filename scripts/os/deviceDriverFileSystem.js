/* ------------  
   deviceDriverFileSystem.js

   Requires globals.js

   
   ------------ */

DeviceDriverFileSystem.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverFileSystem() {
   // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    //this.driverEntry = krnKbdDriverEntry;  // TODO
    //this.isr = krnKbdDispatchKeyPress;     // TODO
    // "Constructor" code.
}
