/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
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


(function () {

    var onload = function() {

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagName('X3D');
        var w3sg = document.getElementsByTagName('webSG');

        // ~~ Components and params {{{ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var i,j;
        var params;
        var properties = new x3dom.Properties();  // stores the stuff in <param>
        var components, prefix;

        // for each X3D element
        for (i=0; i < x3ds.length; i++) {

            // for each param element inside X3D element
            params = x3ds[i].getElementsByTagName('PARAM');
            for (j=0; j < params.length; j++) {
                properties.setProperty(params[j].getAttribute('name'), params[j].getAttribute('value'));
            }

            // load components from params or default to x3d attribute
            components = properties.getProperty('components', x3ds[i].getAttribute("components"));

            if (components) {
                prefix = properties.getProperty('loadpath', x3ds[i].getAttribute("loadpath"))
                components = components.trim().split(',');
                for (j=0; j < components.length; j++) {
                    x3dom.loadJS(components[j] + ".js", prefix);
                }
            }
            // TODO: use this instead of the <scene><param /></scene> approach below (for showLog, etc.)
        }
        // }}}


        // active hacky DOMAttrModified workaround to webkit
        if (window.navigator.userAgent.match(/webkit/i)) {
            x3dom.debug.logInfo ("Active DOMAttrModifiedEvent workaround for webkit ");
            x3dom.userAgentFeature.supportsDOMAttrModified = false;
        }

        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) {
            n.runtime = x3dom.runtime;
            n.hasRuntime = true;
            return n;
        });
        w3sg = Array.map(w3sg, function (n) { n.hasRuntime = false; return n; });
        
        var i=0; // re-usable counter

        for (i=0; i<w3sg.length; i++) {
            x3ds.push(w3sg[i]);
        }

        var activateLog = false;
        for (i=0; i < x3ds.length; i++) {
            // log is for all elements
            var showLog = x3ds[i].getAttribute("showLog");
            if (showLog !== null && showLog == "true") {
                activateLog = true;
                break;
            }
        }

        // Activate debugging/logging for x3dom. Logging will only work for
        // all log calls after this line!
        x3dom.debug.activate(activateLog);

        if (x3dom.versionInfo !== undefined) {
            x3dom.debug.logInfo("X3Dom Version " + x3dom.versionInfo.version + ", " +
                                "Revison " + x3dom.versionInfo.revision + ", " +
                                "Date " + x3dom.versionInfo.date);
        }
        
        x3dom.debug.logInfo("Found " + (x3ds.length - w3sg.length) + " X3D and " + 
                            w3sg.length + " (experimental) WebSG nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        for (i=0; i < x3ds.length; i++)
        {
            var x3d_element = x3ds[i];

        /*
            // http://de.selfhtml.org/javascript/objekte/mimetypes.htm
            if (navigator.mimeTypes["model/vrml"] &&
                navigator.mimeTypes["model/vrml"].enabledPlugin != null)
            {
                alert(navigator.mimeTypes["model/vrml"].suffixes);
                
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3ds[i].getAttribute("width"));
                embed.setAttribute("height", x3ds[i].getAttribute("height"));
                //embed.setAttribute("src", "flipper.x3d");
                
                x3ds[i].parentNode.insertBefore(embed, x3ds[i]);
                embed.load(domString);
                
                continue;
            }
        */
        
            // http://www.howtocreate.co.uk/wrongWithIE/?chapter=navigator.plugins
            if (x3dom.detectActiveX()) {
                x3dom.insertActiveX(x3d_element);
                continue;
            }
        
            var x3dcanvas = new x3dom.X3DCanvas(x3d_element, i);



            if (x3dcanvas.gl === null) {

            /*
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3dcanvas.canvasDiv.style.width);
                embed.setAttribute("height", x3dcanvas.canvasDiv.style.height);
                //embed.setAttribute("src", "flipper.x3d");
                x3dcanvas.canvasDiv.appendChild(embed);
                embed.load(domString);
                break;
            */
                
                var altDiv = document.createElement("div");
                altDiv.setAttribute("class", "x3dom-nox3d");
                var altP = document.createElement("p");
                altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
                var aLnk = document.createElement("a");
                aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
                aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
                
                altDiv.appendChild(altP);
                altDiv.appendChild(aLnk);
                
                x3dcanvas.x3dElem.appendChild(altDiv);

                // remove the stats div (it's not ed when WebGL doesnt work)
                if (x3dcanvas.statDiv) { 
                    x3d_element.removeChild(x3dcanvas.statDiv);
                }

                // check if "altImg" is specified on x3d element and if so use it as background
                var altImg = x3ds[i].getAttribute("altImg") || null;
                if (altImg) {
                    var altImgObj = new Image();                
                    altImgObj.src = altImg;                    
                    x3d_element.style.backgroundImage = "url("+altImg+")";                    
                }
                continue;
            }
            
            var t0 = new Date().getTime();

            if (!x3ds[i].runtime) {
                 x3ds[i].runtime = x3dom.runtime;
            }  
            x3ds[i].runtime.initialize(x3ds[i], x3dcanvas);
//            x3ds[i].runtime.ready();

            x3dcanvas.load(x3ds[i], i);

            // evaluate a possible <param> setting "showLog" and override x3d attribute
            // since the doc-object is only avail after .load() this can only be done
            // here. Redunant log activation code above is required to capture
            // log message before that :/
			
            showLog = x3dcanvas.doc.properties.getProperty("showLog", activateLog);

			if (showLog === true || showLog.toString().toLowerCase() === "true") {
				activateLog = true;
			} else if (showLog.toString().toLowerCase() === "false") {
				activateLog = false;
			}
            x3dom.debug.activate(activateLog);

            var showStats = x3dcanvas.doc.properties.getProperty("showStat", "false");
            if (showStats === true) {
                x3ds[i].runtime.statistics(true);
            } else if (showStats === false) {
                x3ds[i].runtime.statistics(false);
            }

            var showProgress = x3dcanvas.doc.properties.getProperty("showProgress", x3d_element.getAttribute("showProgress") || "true");
            if (showProgress.toLowerCase() === "bar") {
                x3dcanvas.progressDiv.setAttribute("class", "x3dom-progress bar");
                showProgress = "true";
            }

            if (showProgress.toLowerCase() === "true") {
                x3ds[i].runtime.processIndicator(true);
            } else if (showStats.toLowerCase() === "false") {
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

			var t1 = new Date().getTime() - t0;
            x3dom.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
        
        var ready = (function(eventType) {
            var evt = null;

            if (document.createEvent) {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            }
            else if (document.createEventObject) {
                evt = document.createEventObject();
                // http://stackoverflow.com/questions/1874866/how-to-fire-onload-event-on-document-in-ie
                document.body.fireEvent('on' + eventType, evt);   
            }
        })('load');
    };
    
    var onunload = function() {
        for (var i=0; i<x3dom.canvases.length; i++) {
            x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
        }
    };
    
    if (window.location.pathname.lastIndexOf(".xhtml") > 0) {
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
    
})();

