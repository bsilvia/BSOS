/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";
	
	if(keyCode == null || isShifted == null || keyCode < 8 || keyCode > 222)
	{
		krnTrapError("Keyboard driver error: invalid keycode or parameters: " + params);
	}
	
    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);        
    }    
    else if ( ((keyCode >= 48) && (keyCode <= 57) && !isShifted) ||   // digits 
               (keyCode == 32)                     ||   // space
               (keyCode == 13)                     ||   // enter
			   (keyCode == 8)  )  				     	// backspace
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr); 
    }
	// Punctuation marks
	else if (keyCode == 190 && isShifted)	// period .
	{
	    chr = String.fromCharCode(62);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 190)				// period .
	{
	    chr = String.fromCharCode(46);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 188 && isShifted)	// comma ,
	{
	    chr = String.fromCharCode(60);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 188)				// comma ,
	{
	    chr = String.fromCharCode(44);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 186 && isShifted)	// colon :
	{
	    chr = String.fromCharCode(58);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 186)				// semicolon ;
	{
	    chr = String.fromCharCode(59);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 49 && isShifted)	// exclamation point !
	{
	    chr = String.fromCharCode(33);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 189)				// hyphen -
	{
	    chr = String.fromCharCode(45);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 222 && isShifted)	// quotation "
	{
	    chr = String.fromCharCode(34);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 222)				// apostrophe '
	{
	    chr = String.fromCharCode(39);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 191 && isShifted)	// question mark ?
	{
	    chr = String.fromCharCode(63);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 191)				// forward slash /
	{
	    chr = String.fromCharCode(47);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 57 && isShifted)	// left parenthesis (
	{
	    chr = String.fromCharCode(40);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 48 && isShifted)	// right parenthesis )
	{
	    chr = String.fromCharCode(41);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 50 && isShifted)
	{
		chr = String.fromCharCode(64);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 38)					// up arrow
	{
		_KernelInputQueue.enqueue("up");
	}
	else if (keyCode == 40)					// down arrow
	{
		_KernelInputQueue.enqueue("dn");
	}
}
