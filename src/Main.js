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

x3dom.detectActiveX = function() {
    var isInstalled = false;  
    
    if (window.ActiveXObject)  {  
        var control = null;  

        try  {  
            control = new ActiveXObject('AVALONATX.InstantPluginATXCtrl.1');  
        } catch (e) {
        }  
        
        if (control) {
            isInstalled = true;  
        }
    }
    
    return isInstalled;
};

x3dom.rerouteSetAttribute = function(node, browser) {
    // save old setAttribute method
    node._setAttribute = node.setAttribute;
    node.setAttribute = function(name, value) {
        var id = node.getAttribute("_x3domNode");
        var anode = browser.findNode(id);
        
        if (anode)
            return anode.parseField(name, value);
        else
            return 0;
    };

    for(var i=0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        x3dom.rerouteSetAttribute(child, browser);
    }
};

x3dom.insertActiveX = function(x3d) {
    
    if (typeof x3dom.atxCtrlCounter == 'undefined') {
        x3dom.atxCtrlCounter = 0;
    }
 
    var height = x3d.getAttribute("height");
    var width  = x3d.getAttribute("width");

    var parent = x3d.parentNode;
    
    var divelem = document.createElement("div");
    divelem.setAttribute("id", "x3dplaceholder");

    var inserted = parent.insertBefore(divelem, x3d);
    
    // hide x3d div
    var hiddenx3d = document.createElement("div");
    hiddenx3d.style.display = "none";
    parent.appendChild(hiddenx3d);
    parent.removeChild(x3d);
    hiddenx3d.appendChild(x3d);
     
    var atx = document.createElement("object");
    
    var containerName = "Avalon" + x3dom.atxCtrlCounter;
    x3dom.atxCtrlCounter++;
    
    atx.setAttribute("id", containerName);
    atx.setAttribute("classid", "CLSID:F3254BA0-99FF-4D14-BD81-EDA9873A471E");
    atx.setAttribute("width",   width   ? width     : "500");
    atx.setAttribute("height",  height  ? height    : "500");
    
    inserted.appendChild(atx);
    
    var atxctrl = document.getElementById(containerName);
    var browser = atxctrl.getBrowser();
    var scene   = browser.importDocument(x3d);
    browser.replaceWorld(scene);
        
    // add backtrack method to get browser from x3d node instead of the ctrl
    x3d.getBrowser = function() {
        return atxctrl.getBrowser();
    };
    
    x3dom.rerouteSetAttribute(x3d, browser);
};

// holds the UserAgent feature
x3dom.userAgentFeature = {
    supportsDOMAttrModified: false
};


(function loadX3DOM() {

    var onload = function() {
        var i,j;  // counters

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagName('X3D');
        var w3sg = document.getElementsByTagName('webSG');	// FIXME

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
                    prefix = settings.getProperty('loadpath', x3ds[i].getAttribute("loadpath"))
                    components = components.trim().split(',');
                    for (j=0; j < components.length; j++) {
                        x3dom.loadJS(components[j] + ".js", prefix);
                    }
                }
            }

            // src=foo.x3d adding inline node, not a good idea, but...
            if (typeof X3DOM_SECURITY_OFF != 'undefined' && X3DOM_SECURITY_OFF === true) {
                if (x3ds[i].getAttribute("src")) {
                    var _scene = document.createElement("scene");
                    var _inl = document.createElement("Inline");
                    _inl.setAttribute("url", x3ds[i].getAttribute("src"));
                    _scene.appendChild(_inl);
                    x3ds[i].appendChild(_scene);
                }
            }
        }
        // }}}
		
		if (showLoggingConsole == true) {
			x3dom.debug.activate(true);
		} else {
			x3dom.debug.activate(false);
		}

/*
        // active hacky DOMAttrModified workaround to webkit
        if (window.navigator.userAgent.match(/webkit/i)) {
            x3dom.debug.logInfo ("Activate DOMAttrModifiedEvent workaround for WebKit.");
            x3dom.userAgentFeature.supportsDOMAttrModified = false;
        }
*/

        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) {
            //n.runtime = x3dom.runtime;
            n.runtime = new x3dom.Runtime();
            n.hasRuntime = true;
            return n;
        });
        w3sg = Array.map(w3sg, function (n) { n.hasRuntime = false; return n; });
        
        for (i=0; i<w3sg.length; i++) {
            x3ds.push(w3sg[i]);
        }

        if (x3dom.versionInfo !== undefined) {
            x3dom.debug.logInfo("X3DOM version " + x3dom.versionInfo.version + ", " +
                                "Revison <a href='https://github.com/x3dom/x3dom/tree/"+ x3dom.versionInfo.revision +"'>"
                                + x3dom.versionInfo.revision + "</a>, " +
                                "Date " + x3dom.versionInfo.date);
        }
        
        x3dom.debug.logInfo("Found " + (x3ds.length - w3sg.length) + " X3D and " + 
                            w3sg.length + " (experimental) WebSG nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        var x3d_element;
        var x3dcanvas;
        var altDiv, altP, aLnk, altImg, altImgObj;
        var t0,t1;

        for (i=0; i < x3ds.length; i++)
        {
            x3d_element = x3ds[i];

            // http://www.howtocreate.co.uk/wrongWithIE/?chapter=navigator.plugins
            if (x3dom.detectActiveX()) {
                x3dom.insertActiveX(x3d_element);
                continue;
            }
        
            x3dcanvas = new x3dom.X3DCanvas(x3d_element, i);

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

//            if (!x3ds[i].runtime) {
                 x3ds[i].runtime = new x3dom.Runtime(x3ds[i], x3dcanvas);
//            }

            x3ds[i].runtime.initialize(x3ds[i], x3dcanvas);
            if (x3dom.runtime.ready) {
                x3ds[i].runtime.ready = x3dom.runtime.ready;
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

//            var showProgress = x3ds[i].getAttribute("showProgress");
//            if (showProgress == 'true' || showProgress === true || showProgress == 'bar') {
//                var spinner = document.createElement("div");
//                spinner.innerHTML = "Loaded " + " elements"
//                spinner.id = 'x3dom-progress-1';
//                spinner.className = 'x3dom-progress';
//                if (showProgress == 'bar') {
//                    spinner.className = 'x3dom-progress x3dom-progress-bar';
//                }
//                 x3ds[i].appendChild(spinner);
//            }

            x3dom.canvases.push(x3dcanvas);
			t1 = new Date().getTime() - t0;
            x3dom.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
			
            //Start image queue

		    // gets the value of param name="maxActiveDownloads"
		    // settings.getProperty('maxActiveDownloads', 10);
            //x3dom.ImageLoadManager.load();
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
    
    /** Initializes an <x3d> root element that was added after document load.
     *
     *  If there already was an <x3d> element, it needs to be removed before:
     *  var x3d = document.getElementsByTagName("x3d")[0];
	 *	x3d.parentNode.removeChild(x3d);
     */
    x3dom.reload = function() {
        onunload();
        onload();
    };
	
    /* FIX PROBLEM IN CHROME - HACK - searching for better solution !!! */
	if (navigator.userAgent.indexOf("Chrome") != -1) {
		document.__getElementsByTagName = document.getElementsByTagName;
		
		document.getElementsByTagName = function(tag) {
			var obj = new Array();   
				
			var elems = this.__getElementsByTagName("*");
			if(tag =="*"){
				obj = elems;
			} else {
				tag = tag.toUpperCase();
				for (var i = 0; i < elems.length; i++) {
					var tagName = elems[i].tagName.toUpperCase();		
					if (tagName === tag) {
						obj.push(elems[i]);
					}
				}
			}
			
            return obj;
        };

		document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.__getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
		
	} else { /* END OF HACK */
        document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
	}
    
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
   if(document.readyState === "complete"){
	onload();
   }
})();
