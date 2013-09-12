/* ------------
   Console.js

   Requires globals.js

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

function CLIconsole() {
    // Properties
    this.CurrentFont      = _DefaultFontFamily;
    this.CurrentFontSize  = _DefaultFontSize;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = _DefaultFontSize;
    this.buffer = "";
    
    // Methods
    this.init = function() {
       this.clearScreen();
       this.resetXY();
    };

    this.clearScreen = function() {
       _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
    };

    this.resetXY = function() {
       this.CurrentXPosition = 0;
       this.CurrentYPosition = this.CurrentFontSize;
    };

    this.handleInput = function() {
       while (_KernelInputQueue.getSize() > 0)
       {
           // Get the next character from the kernel input queue.
           var chr = _KernelInputQueue.dequeue();
           // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
           if (chr == String.fromCharCode(13))  //     Enter key
           {
               // The enter key marks the end of a console command, so ...
               // ... tell the shell ...
               _OsShell.handleInput(this.buffer);
               // ... and reset our buffer.
               this.buffer = "";
           }
		   else if (chr == "up")
		   {
				if(_CommandIndex > 0)
				{
					this.removeText(this.buffer);
					this.buffer = "";
					_CommandIndex--;
					this.buffer = _CommandHistory[_CommandIndex];
					this.putText(this.buffer);
				}
		   }
		   else if (chr == "dn")
		   {
				if(_CommandIndex < _CommandHistory.length - 1)
				{
					this.removeText(this.buffer);
					this.buffer = "";
					_CommandIndex++;
					this.buffer = _CommandHistory[_CommandIndex];
					this.putText(this.buffer);
				}
		   }
		   else if (chr == String.fromCharCode(8))  // Backspace
		   {
			   if(this.buffer != "")
			   {
				   // Get and remove the last character in the buffer
				   var chr = this.buffer.substring(this.buffer.length, this.buffer.length - 1);
				   this.buffer = this.buffer.substring(0, this.buffer.length - 1);
				   // ... and clear it from the screen
				   this.removeText(chr);
			   }
		   }
           // TODO: Write a case for Ctrl-C.
           else
           {
               // This is a "normal" character, so ...
               // ... draw it on the screen...
               this.putText(chr);
               // ... and add it to our buffer.
               this.buffer += chr;
           }
       }
    };

    this.putText = function(text) {
       // My first inclination here was to write two functions: putChar() and putString().
       // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
       // between the two.  So rather than be like PHP and write two (or more) functions that
       // do the same thing, thereby encouraging confusion and decreasing readability, I
       // decided to write one function and use the term "text" to connote string or char.
       if (text !== "")
       {
           // Draw the text at the current X and Y coordinates.
           _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
           // Move the current X position.
           var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
           this.CurrentXPosition = this.CurrentXPosition + offset;
       }
    };
	
	this.removeText = function(text) {
		// TODO
		_DrawingContext.unDrawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
		// Move the current X position.
	    var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
	    this.CurrentXPosition = this.CurrentXPosition - offset;
	}
	
    this.advanceLine = function() {
	   this.CurrentXPosition = 0;
	   this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;
	   
	   if(this.CurrentYPosition > _Canvas.height)
	   {
		   this.scrollDown();
	   }
    };
	
	this.scrollDown = function() {
		var consoleImage = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
	   _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
	   _DrawingContext.putImageData(consoleImage, 0, 0 - (_DefaultFontSize + _FontHeightMargin));
	   this.CurrentYPosition -= _DefaultFontSize + _FontHeightMargin;
	}
	
	this.bsod = function()
	{
		var img = new Image();
		img.addEventListener("load", function() {
		  _DrawingContext.drawImage(img, 0, 0)
		}, false);
		img.src = 'images/bsod.png';
	}
}
