/* ------------
   Queue.js
   
   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at http://www.w3schools.com/jsref/jsref_obj_array.asp .
   Look at the push and shift methods, as they are the least obvious here.
   
   ------------ */
   
function Queue()
{
    // Properties
    this.q = new Array();

    // Methods
    this.getSize = function() {
        return this.q.length;
    };

    this.isEmpty = function(){
        return (this.q.length === 0);
    };

    this.enqueue = function(element) {
        this.q.push(element);
    };
    
    this.dequeue = function() {
        var retVal = null;
        if (this.q.length > 0)
        {
            retVal = this.q.shift();
        }
        return retVal;
    };
    
    this.toString = function() {
        var retVal = "";
        for (var i in this.q)
        {
            retVal += "[" + this.q[i] + "] ";
        }
        return retVal;
    };

    // function to return the underlying array to
    // be used for displaying the ready queue
    this.getItem = function(num) {
        return this.q[num];
    };

    // function to remove and return an item at the given index
    this.removeAt = function(index) {
        return this.q.splice(index, 1);
    };
}
