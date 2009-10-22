/*!
 * x3dom javascript library 0.1
 * http://instantreality.org/
 *
 * Copyright (c) 2009 Peter Eschler, Johannes Behr
 * Dual licensed under the MIT and GPL licenses.
 * 
 */

x3dom.debug = {

    INFO:       "INFO",
    WARNING:    "WARNING",
    ERROR:      "ERROR",
    EXCEPTION:  "EXCEPTION",
    
	// determines whether debugging/logging is active. If set to "false"
	// no debugging messages will be logged.
	isActive: false,

    // stores if firebug is available
    isFirebugAvailable: false,
    
    // stores if the x3dom.debug object is initialized already
    isSetup: false,

    // stores the number of lines logged
    numLinesLogged: 0,
    
    // the maximum number of lines to log in order to prevent
    // the browser to slow down
    maxLinesToLog: 100,

	// the container div for the logging messages
	logContainer: null,
    
    /** @brief Setup the x3dom.debug object.

        Checks for firebug and creates the container div for the logging 
		messages.
      */
    setup: function() {
		// If debugging is already setup simply return
        if (x3dom.debug.isSetup) { return; }

		// Check for firebug console
        try {
            if (console) {
                x3dom.debug.isFirebugAvailable = true;           
            }
        }
        catch (err) {
            x3dom.debug.isFirebugAvailable = false;
        }
        
		// 
		x3dom.debug.setupLogContainer();

        // setup should be setup only once, thus store if we done that already
        x3dom.debug.isSetup = true;
    },

	/** @brief Inserts a container div for the logging messages into the HTML page
      */
	setupLogContainer: function() {
		x3dom.debug.logContainer = document.createElement("div");
		x3dom.debug.logContainer.id = "x3dom_logdiv";
		x3dom.debug.logContainer.style.border = "2px solid olivedrab";
		x3dom.debug.logContainer.style.height = "180px";
		x3dom.debug.logContainer.style.padding = "2px";
		x3dom.debug.logContainer.style.overflow = "auto";
		x3dom.debug.logContainer.style.whiteSpace = "pre-wrap";
		x3dom.debug.logContainer.style.fontSize = "x-small";
		document.body.appendChild(x3dom.debug.logContainer);
	},

	/** @brief Generic logging function which does all the work.

		@param msg the log message
		@param logType the type of the log message. One of INFO, WARNING, ERROR 
					   or EXCEPTION.
      */
    doLog: function(msg, logType) {

		// If logging is deactivated do nothing and simply return
		if (!x3dom.debug.isActive) { return; }

		// If we have reached the maximum number of logged lines output
		// a warning message
		if (x3dom.debug.numLinesLogged === x3dom.debug.maxLinesToLog) {
			msg = "Maximum number of log lines (=" + x3dom.debug.maxLinesToLog + 
				  ") reached. Deactivating logging...";
		}

		// If the maximum number of log lines is exceeded do not log anything
		// but simply return 
		if (x3dom.debug.numLinesLogged > x3dom.debug.maxLinesToLog) { return; }

		// Output a log line to the HTML page
		var node = document.createElement("p");
		node.style.margin = 0;
		node.style.fontFamily = "sans-serif"; 
		node.innerHTML = logType + ": " + msg;
		x3dom.debug.logContainer.insertBefore(node, x3dom.debug.logContainer.firstChild);

		// Use firebug's console if available
        if (x3dom.debug.isFirebugAvailable) {
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
                    console.debug(msg);
                    break;
                default: 
                    break;
            }
        }
        
		x3dom.debug.numLinesLogged++;
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
    },

	assert: function(c, msg) {
		if (!c) {
			x3dom.debug.doLog("Assertion failed in " + x3dom.debug.assert.caller.name + ': ' + msg, x3dom.debug.WARNING);
		}
	}
};

// Call the setup function to... umm, well, setup x3dom.debug
x3dom.debug.setup();
