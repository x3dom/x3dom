
x3dom.debug = {

    INFO: 0,
    WARNING: 1,
    ERROR: 2,
    EXCEPTION: 3,
    

    // stores if firebug is available
    isFirebugEnabled: false,
    
    // stores if the x3dom.debug object is initialized already
    isSetup: false,

    // stores the number of lines logged
    numLinesLogged: 0,
    
    // the maximum number of lines to log in order to prevent
    // the browser to slow down
    maxLinesToLog: 100,
    
    /** Setup the x3dom.debug object.
        Checks for firebug...
      */
    setup: function() {
        if (x3dom.debug.isSetup) return;
    
        try {
            if (console) 
                x3dom.debug.isFirebugEnabled = true;           
        }
        catch (err) {
            x3dom.debug.isFirebugEnabled = false;
        };
        
        alert("x3dom.debug.setup");
        // setup should be setup only once, thus store if we done that already
        x3dom.debug.isSetup = true;
    },

    doLog: function(msg, logType) {
    
        if (x3dom.debug.isFirebugEnabled) {
            switch (logType) {
                case x3dom.debug.INFO:
                    console.info(msg);
                    break;
                case x3dom.debug.WARNING:
                    console.warn(msg);
                    break;
                case x3dom.debug.ERROR:
                    console.error(msg);
                    break;
                case x3dom.debug.EXCEPTION:
                    console.log(msg);
                    break;
                default: 
                    break;
            };
        };
        
    },
    
    /** Log an info message. */
    logInfo: function(msg) {
        x3dom.debug.doLog(msg, x3dom.debug.INFO);
    },
    
    /** Log a warning message. */
    logWarning: function(msg) {
        x3dom.debug.doLog(msg, x3dom.debug.WARNING);
    },
    
    /** Log an error message. */
    logError: function(msg) {
        x3dom.debug.doLog(msg, x3dom.debug.ERROR);
    },
    
    /** Log an exception message. */
    logException: function(msg) {
        x3dom.debug.doLog(msg, x3dom.debug.EXCEPTION);
    }
};

// Call the setup function to... umm, well, setup x3dom.debug
x3dom.debug.setup();

x3dom.debug.logInfo("this is an info log message.");
x3dom.debug.logWarning("this is a warning log message.");
// x3dom.debug.logError("this is an error log message.");
x3dom.debug.logException("this is an exception log message.");
