/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver();  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

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
	
	// make sure we got params and that isShifted is a valid value
	// and check to see if the keyCode is outside the valid range of a keyboard
	if(keyCode === null || isShifted === null || keyCode < 8 ||
		keyCode > 222 || !(isShifted !== true || isShifted !== false))
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
	else if (keyCode == 190 && isShifted)	// > character
	{
		chr = String.fromCharCode(62);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 190)				// period .
	{
	    chr = String.fromCharCode(46);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 188 && isShifted)	// < character
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

	else if	(keyCode == 219 && isShifted)	// curly brace {
	{
	    chr = String.fromCharCode(123);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 219)				// square bracket [
	{
	    chr = String.fromCharCode(91);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 221 && isShifted)	// curly brace }
	{
	    chr = String.fromCharCode(125);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 221)				// square bracket ]
	{
	    chr = String.fromCharCode(93);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 220 && isShifted)	// backslash \
	{
	    chr = String.fromCharCode(124);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 220)				// | character
	{
	    chr = String.fromCharCode(92);
        _KernelInputQueue.enqueue(chr);
	}

	else if	(keyCode == 192 && isShifted)	// tilde ~
	{
	    chr = String.fromCharCode(126);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 192)				// ` character
	{
	    chr = String.fromCharCode(96);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 49 && isShifted)	// exclamation point !
	{
	    chr = String.fromCharCode(33);
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
	else if (keyCode == 50 && isShifted)	// @ character
	{
		chr = String.fromCharCode(64);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 51 && isShifted)	// # character
	{
		chr = String.fromCharCode(35);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 52 && isShifted)	// $ character
	{
		chr = String.fromCharCode(36);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 53 && isShifted)	// % character
	{
		chr = String.fromCharCode(37);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 54 && isShifted)	// ^ character
	{
		chr = String.fromCharCode(94);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 55 && isShifted)	// & character
	{
		chr = String.fromCharCode(38);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 56 && isShifted)	// asterisk *
	{
		chr = String.fromCharCode(42);
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
	else if	(keyCode == 189 && isShifted)	// underscore _
	{
	    chr = String.fromCharCode(95);
        _KernelInputQueue.enqueue(chr);
	}
	else if	(keyCode == 189)				// hyphen -
	{
	    chr = String.fromCharCode(45);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 187 && isShifted)	// plus +
	{
	    chr = String.fromCharCode(43);
        _KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 187)				// equals =
	{
	    chr = String.fromCharCode(61);
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
	// silently ignore keys that we don't display on screen 
	// or handle but which are valid keyboard keys
	/*else									// non-valid key
	{
		krnTrapError("Keyboard driver error: invalid keycode or parameters: " + params);
	}*/
}
