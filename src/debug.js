/**
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

x3dom.debug = {
    INFO      : "INFO",
    WARNING   : "WARNING",
    ERROR     : "ERROR",
    EXCEPTION : "EXCEPTION",

    // determines whether debugging/logging is active. If set to "false"
    // no debugging messages will be logged.
    isActive : false,

    // stores if firebug is available
    isFirebugAvailable : false,

    // stores if the x3dom.debug object is initialized already
    isSetup : false,

    // stores if x3dom.debug object is append already (Need for IE integration)
    isAppend : false,

    // stores the number of lines logged
    numLinesLogged : 0,

    // the maximum number of lines to log in order to prevent
    // the browser to slow down
    maxLinesToLog : 10000,

    // the container div for the logging messages
    logContainer : null,

    /**
     * @brief Setup the x3dom.debug object.
     *
     * Checks for firebug and creates the container div for the logging messages.
     */
    setup : function ()
    {
        // If debugging is already setup simply return
        if ( x3dom.debug.isSetup )
        {
            return;
        }

        // Check for firebug console
        try
        {
            if ( window.console.firebug !== undefined )
            {
                x3dom.debug.isFirebugAvailable = true;
            }
        }
        catch ( err )
        {
            x3dom.debug.isFirebugAvailable = false;
        }

        x3dom.debug.setupLogContainer();

        // setup should be setup only once, thus store if we done that already
        x3dom.debug.isSetup = true;
    },

    /**
     * @brief Activates the log
     *
     * @param visible
     */
    activate : function ( visible )
    {
        x3dom.debug.isActive = true;
        x3dom.debug.logContainer.style.display = ( visible ) ? "block" : "none";
    },

    /**
     * @brief Inserts a container div for the logging messages into the HTML page
     *
     */
    setupLogContainer : function ()
    {
        x3dom.debug.logContainer = document.createElement( "div" );
        x3dom.debug.logContainer.setAttribute( "class", "x3dom-log" );
    },

    appendElement : function ( x3dElement )
    {
        x3dElement.appendChild( x3dom.debug.logContainer );
    },

    /**
     * @brief Generic logging function which does all the work.
     *
     * @param msg the log message
     * @param logType the type of the log message. One of INFO, WARNING, ERROR or EXCEPTION.
     */
    doLog : function ( msg, logType )
    {
        // If logging is deactivated do nothing and simply return
        if ( !x3dom.debug.isActive )
        {
            return;
        }

        // If we have reached the maximum number of logged lines output
        // a warning message
        if ( x3dom.debug.numLinesLogged === x3dom.debug.maxLinesToLog )
        {
            msg = "Maximum number of log lines (=" + x3dom.debug.maxLinesToLog +
                ") reached. Deactivating logging...";
        }

        // If the maximum number of log lines is exceeded do not log anything
        // but simply return
        if ( x3dom.debug.numLinesLogged > x3dom.debug.maxLinesToLog )
        {
            return;
        }

        // Output a log line to the HTML page
        var node = document.createElement( "p" );
        node.style.margin = 0;
        switch ( logType )
        {
            case x3dom.debug.INFO:
                node.style.color = "#00ff00";
                break;
            case x3dom.debug.WARNING:
                node.style.color = "#cd853f";
                break;
            case x3dom.debug.ERROR:
                node.style.color = "#ff4500";
                break;
            case x3dom.debug.EXCEPTION:
                node.style.color = "#ffff00";
                break;
            default:
                node.style.color = "#00ff00";
                break;
        }

        // not sure if try/catch solves problem http://sourceforge.net/apps/trac/x3dom/ticket/52
        // but due to no avail of ATI gfxcard can't test
        try
        {
            node.innerHTML = logType + ": " + msg;
            x3dom.debug.logContainer.insertBefore( node, x3dom.debug.logContainer.firstChild );
        }
        catch ( err )
        {
            if ( window.console.firebug !== undefined )
            {
                window.console.warn( msg );
            }
        }

        // Use firebug's console if available
        if ( x3dom.debug.isFirebugAvailable )
        {
            switch ( logType )
            {
                case x3dom.debug.INFO:
                    window.console.info( msg );
                    break;
                case x3dom.debug.WARNING:
                    window.console.warn( msg );
                    break;
                case x3dom.debug.ERROR:
                    window.console.error( msg );
                    break;
                case x3dom.debug.EXCEPTION:
                    window.console.debug( msg );
                    break;
                default:
                    break;
            }
        }

        x3dom.debug.numLinesLogged++;
    },

    /**
     * @brief Log an info message.
     *
     * @param msg
     */
    logInfo : function ( msg )
    {
        x3dom.debug.doLog( msg, x3dom.debug.INFO );
    },

    /**
     * @brief Log a warning message.
     *
     * @param msg
     */
    logWarning : function ( msg )
    {
        x3dom.debug.doLog( msg, x3dom.debug.WARNING );
    },

    /**
     * @brief Log an error message.
     *
     * @param msg
     */
    logError : function ( msg )
    {
        x3dom.debug.doLog( msg, x3dom.debug.ERROR );
    },

    /**
     * @brief Log an exception message.
     *
     * @param msg
     */
    logException : function ( msg )
    {
        x3dom.debug.doLog( msg, x3dom.debug.EXCEPTION );
    },

    /**
     * @brief Log an assertion.
     *
     * @param c
     * @param msg
     */
    assert : function ( c, msg )
    {
        if ( !c )
        {
            x3dom.debug.doLog( "Assertion failed in " +
                x3dom.debug.assert.caller.name + ": " +
                msg, x3dom.debug.ERROR );
        }
    },

    /**
     * @brief Checks the type of a given object.
     *
     * @param obj the object to check.
     * @returns one of; "boolean", "number", "string", "object", "function", or "null".
     */
    typeOf : function ( obj )
    {
        var type = typeof obj;
        return type === "object" && !obj ? "null" : type;
    },

    /**
     * @brief Checks if a property of a specified object has the given type.
     *
     * @param obj the object to check.
     * @param name the property name.
     * @param type the property type (optional, default is "function").
     * @returns true if the property exists and has the specified type, otherwise false.
     */
    exists : function ( obj, name, type )
    {
        type = type || "function";
        return ( obj ? this.typeOf( obj[ name ] ) : "null" ) === type;
    },

    /**
     * @brief Dumps all members of the given object.
     *
     * @param node
     */
    dumpFields : function ( node )
    {
        var str = "";
        for ( var fName in node )
        {
            str += ( fName + ", " );
        }
        str += "\n";
        x3dom.debug.logInfo( str );
        return str;
    }
};

// Call the setup function to... umm, well, setup x3dom.debug
x3dom.debug.setup();