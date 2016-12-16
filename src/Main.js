/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

// holds the UserAgent feature
x3dom.userAgentFeature = {
    supportsDOMAttrModified: false
};


(function loadX3DOM() {
    "use strict";

    var onload = function() {
        var i,j;  // counters

        // Search all X3D elements in the page
        var x3ds_unfiltered = document.getElementsByTagName('X3D');
        var x3ds = [];

        // check if element already has been processed
        for (i=0; i < x3ds_unfiltered.length; i++) {
            if (x3ds_unfiltered[i].hasRuntime === undefined)
                x3ds.push(x3ds_unfiltered[i]);
        }

        // ~~ Components and params {{{ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var params;
        var settings = new x3dom.Properties();  // stores the stuff in <param>
        var validParams = array_to_object([ 
            'showLog', 
            'showStat',
            'showProgress', 
            'PrimitiveQuality', 
            'components', 
            'loadpath', 
            'disableDoubleClick',
            'backend',
            'altImg',
            'flashrenderer',
            'swfpath',
            'runtimeEnabled',
            'keysEnabled',
            'showTouchpoints',
            'disableTouch',
            'maxActiveDownloads'
        ]);
        var components, prefix;
		var showLoggingConsole = false;

        // for each X3D element
        for (i=0; i < x3ds.length; i++) {

            // default parameters
            settings.setProperty("showLog", x3ds[i].getAttribute("showLog") || 'false');
            settings.setProperty("showStat", x3ds[i].getAttribute("showStat") || 'false');
            settings.setProperty("showProgress", x3ds[i].getAttribute("showProgress") || 'true');
            settings.setProperty("PrimitiveQuality", x3ds[i].getAttribute("PrimitiveQuality") || 'High');

            // for each param element inside the X3D element
            // add settings to properties object
            params = x3ds[i].getElementsByTagName('PARAM');
            for (j=0; j < params.length; j++) {
                if (params[j].getAttribute('name') in validParams) {
                    settings.setProperty(params[j].getAttribute('name'), params[j].getAttribute('value'));
                } else {
                    //x3dom.debug.logError("Unknown parameter: " + params[j].getAttribute('name'));
                }
            }

            // enable log
            if (settings.getProperty('showLog') === 'true') {
				showLoggingConsole = true;
            }

            if (typeof X3DOM_SECURITY_OFF != 'undefined' && X3DOM_SECURITY_OFF === true) {
                // load components from params or default to x3d attribute
                components = settings.getProperty('components', x3ds[i].getAttribute("components"));
                if (components) {
                    prefix = settings.getProperty('loadpath', x3ds[i].getAttribute("loadpath"));
                    components = components.trim().split(',');
                    for (j=0; j < components.length; j++) {
                        x3dom.loadJS(components[j] + ".js", prefix);
                    }
                }

                // src=foo.x3d adding inline node, not a good idea, but...
                if (x3ds[i].getAttribute("src")) {
                    var _scene = document.createElement("scene");
                    var _inl = document.createElement("Inline");
                    _inl.setAttribute("url", x3ds[i].getAttribute("src"));
                    _scene.appendChild(_inl);
                    x3ds[i].appendChild(_scene);
                }
            }
        }
		
		if (showLoggingConsole == true) {
			x3dom.debug.activate(true);
		} else {
			x3dom.debug.activate(false);
		}

        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) {
            n.hasRuntime = true;
            return n;
        });

        if (x3dom.versionInfo !== undefined) {
            x3dom.debug.logInfo("X3DOM version " + x3dom.versionInfo.version + ", " +
                                "Revison <a href='https://github.com/x3dom/x3dom/tree/"+ x3dom.versionInfo.revision +"'>"
                                + x3dom.versionInfo.revision + "</a>, " +
                                "Date " + x3dom.versionInfo.date);
        }
        
        x3dom.debug.logInfo("Found " + x3ds.length + " X3D and nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        var x3d_element;
        var x3dcanvas;
        var altDiv, altP, aLnk, altImg;
        var t0, t1;

        for (i=0; i < x3ds.length; i++)
        {
            x3d_element = x3ds[i];

            x3dcanvas = new x3dom.X3DCanvas(x3d_element, x3dom.canvases.length);

            x3dom.canvases.push(x3dcanvas);

            if (x3dcanvas.gl === null) {

                altDiv = document.createElement("div");
                altDiv.setAttribute("class", "x3dom-nox3d");
                altDiv.setAttribute("id", "x3dom-nox3d");

                altP = document.createElement("p");
                altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
                aLnk = document.createElement("a");
                aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
                aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
                
                altDiv.appendChild(altP);
                altDiv.appendChild(aLnk);
                
                x3dcanvas.x3dElem.appendChild(altDiv);

                // remove the stats div (it's not added when WebGL doesn't work)
                if (x3dcanvas.stateViewer) { 
                    x3d_element.removeChild(x3dcanvas.stateViewer.viewer);
                }

                continue;
            }
            
            t0 = new Date().getTime();

            x3ds[i].runtime = new x3dom.Runtime(x3ds[i], x3dcanvas);
            x3ds[i].runtime.initialize(x3ds[i], x3dcanvas);

            if (x3dom.runtime.ready) {
                x3ds[i].runtime.ready = x3dom.runtime.ready;
            }
            
            // no backend found method system wide call
            if (x3dcanvas.backend == '') {
                x3dom.runtime.noBackendFound();
            }
            
            x3dcanvas.load(x3ds[i], i, settings);

            // show or hide statistics based on param/x3d attribute settings
            if (settings.getProperty('showStat') === 'true') {
                x3ds[i].runtime.statistics(true);
            } else {
                x3ds[i].runtime.statistics(false);
            }

            if (settings.getProperty('showProgress') === 'true') {
                if (settings.getProperty('showProgress') === 'bar'){
                    x3dcanvas.progressDiv.setAttribute("class", "x3dom-progress bar");
                }
                x3ds[i].runtime.processIndicator(true);
            } else {
                x3ds[i].runtime.processIndicator(false);
            }

			t1 = new Date().getTime() - t0;
            x3dom.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
        
        var ready = (function(eventType) {
            var evt = null;

            if (document.createEvent) {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            } else if (document.createEventObject) {
                evt = document.createEventObject();
                // http://stackoverflow.com/questions/1874866/how-to-fire-onload-event-on-document-in-ie
                document.body.fireEvent('on' + eventType, evt);   
            }
        })('load');
    };
    
    var onunload = function() {
        if (x3dom.canvases) {
            for (var i=0; i<x3dom.canvases.length; i++) {
                x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
            }
            x3dom.canvases = [];
        }
    };
    
    /** Initializes an <x3d> root element that was added after document load. */
    x3dom.reload = function() {
        onload();
    };
    
    if (window.addEventListener)  {
        window.addEventListener('load', onload, false);
        window.addEventListener('unload', onunload, false);
        window.addEventListener('reload', onunload, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', onload);
        window.attachEvent('onunload', onunload);
        window.attachEvent('onreload', onunload);
    }

    // Initialize if we were loaded after 'DOMContentLoaded' already fired.
    // This can happen if the script was loaded by other means.
    if (document.readyState === "complete") {
        window.setTimeout( function() { onload(); }, 20 );
    }
})();
