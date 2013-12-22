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


// ### Anchor ###
x3dom.registerNodeType(
    "Anchor",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_MFString(ctx, 'parameter', []);
        },
        {
            doIntersect: function(line) {
                var isect = false;
                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        isect = this._childNodes[i].doIntersect(line) || isect;
                    }
                }
                return isect;
            },

            handleTouch: function() {
                var url = this._vf.url.length ? this._vf.url[0] : "";
                var aPos = url.search("#");
                var anchor = "";
                if (aPos >= 0)
                    anchor = url.slice(aPos+1);
                
                var param = this._vf.parameter.length ? this._vf.parameter[0] : "";
                var tPos = param.search("target=");
                var target = "";
                if (tPos >= 0)
                    target = param.slice(tPos+7);
                
                // TODO: implement #Viewpoint bind 
                // http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/networking.html#Anchor
                x3dom.debug.logInfo("Anchor url=" + url + ", target=" + target + ", #viewpoint=" + anchor);
                
                if (target.length == 0 || target == "_blank") {
                    window.open(this._nameSpace.getURL(url), target);
                }
                else {
                    window.location = this._nameSpace.getURL(url);
                }
            }
        }
    )
);

// ### Inline ###
x3dom.registerNodeType(
    "Inline",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Inline.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_SFBool(ctx, 'load', true);
			this.addField_MFString(ctx, 'nameSpaceName', []);
			this.addField_SFBool(ctx, 'mapDEFToID', false);

            this.initDone = false;
			this.count = 0;
            this.numRetries = x3dom.nodeTypes.Inline.MaximumRetries;
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "url") {
					if (this._vf.nameSpaceName.length != 0) {
						var node = this._xmlNode;
						if (node && node.hasChildNodes())
						{
							while ( node.childNodes.length >= 1 )
							{
								node.removeChild( node.firstChild );       
							} 
						}
					}
                    this.loadInline();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            nodeChanged: function ()
            {
                if (!this.initDone) {
                    this.initDone = true;
                    this.loadInline();
                }
            },

            fireEvents: function(eventType)
            {
                if ( this._xmlNode &&
                    (this._xmlNode['on'+eventType] ||
                     this._xmlNode.hasAttribute('on'+eventType) ||
                     this._listeners[eventType]) )
                {
                    var event = {
                        target: this._xmlNode,
                        type: eventType,
                        error: (eventType == "error") ? "XMLHttpRequest Error" : "",
                        cancelBubble: false,
                        stopPropagation: function() { this.cancelBubble = true; }
                    };

                    try {
                        var attrib = this._xmlNode["on" + eventType];

                        if (typeof(attrib) === "function") {
                            attrib.call(this._xmlNode, event);
                        }
                        else {
                            var funcStr = this._xmlNode.getAttribute("on" + eventType);
                            var func = new Function('event', funcStr);
                            func.call(this._xmlNode, event);
                        }

                        var list = this._listeners[eventType];
                        if (list) {
                            for (var i = 0; i < list.length; i++) {
                                list[i].call(this._xmlNode, event);
                            }
                        }
                    }
                    catch(ex) {
                        x3dom.debug.logException(ex);
                    }
                }
            },

            loadInline: function ()
            {
				var that = this;

                var xhr = new window.XMLHttpRequest();
                if (xhr.overrideMimeType)
                    xhr.overrideMimeType('text/xml');   //application/xhtml+xml

                xhr.onreadystatechange = function () 
                {
					if (xhr.readyState != 4) {
						// still loading
						//x3dom.debug.logInfo('Loading inlined data... (readyState: ' + xhr.readyState + ')');
						return xhr;
					}
					
					if (xhr.status === x3dom.nodeTypes.Inline.AwaitTranscoding && that.count < that.numRetries) {
						that.count++;
                        var refreshTime = +xhr.getResponseHeader("Refresh") || 5;
						x3dom.debug.logInfo('Statuscode ' + xhr.status + ' and send new request in ' + refreshTime + ' sec.');

						window.setTimeout(function() {
                            that._nameSpace.doc.downloadCount -= 1;
                            that.loadInline();
							}, refreshTime * 1000);
                        return xhr;
					}
					else if ((xhr.status !== 200) && (xhr.status !== 0)) {
						that.fireEvents("error");
                        x3dom.debug.logError('XHR status: ' + xhr.status + ' - XMLHttpRequest requires web server running!');

                        that._nameSpace.doc.downloadCount -= 1;
						that.count = 0;
                        return xhr;
                    }
                    else if ((xhr.status == 200) || (xhr.status == 0)) {
						that.count = 0;
					}
					
                    x3dom.debug.logInfo('Inline: downloading '+that._vf.url[0]+' done.');

                    var inlScene = null, newScene = null, nameSpace = null, xml = null;

                    if (navigator.appName != "Microsoft Internet Explorer")
                        xml = xhr.responseXML;
                    else
                        xml = new DOMParser().parseFromString(xhr.responseText, "text/xml");

                    //TODO; check if exists and FIXME: it's not necessarily the first scene in the doc!
                    if (xml !== undefined && xml !== null)
                    {
                        inlScene = xml.getElementsByTagName('Scene')[0] || 
                                   xml.getElementsByTagName('scene')[0];
                    }
                    else {
                        that.fireEvents("error");
					}
                    
                    if (inlScene)
                    {
                        var nsName = (that._vf.nameSpaceName.length != 0) ?
                                      that._vf.nameSpaceName.toString().replace(' ','') : "";
                        nameSpace = new x3dom.NodeNameSpace(nsName, that._nameSpace.doc);
                        
                        var url = that._vf.url.length ? that._vf.url[0] : "";
                        if ((url[0] === '/') || (url.indexOf(":") >= 0))
                            nameSpace.setBaseURL(url);
                        else
                            nameSpace.setBaseURL(that._nameSpace.baseURL + url);
                        
                        newScene = nameSpace.setupTree(inlScene);
                        that._nameSpace.addSpace(nameSpace);
                        
                        if(that._vf.nameSpaceName.length != 0)
                        {
                            Array.forEach ( inlScene.childNodes, function (childDomNode)
                            {
                                if(childDomNode instanceof Element)
                                {
                                    setNamespace(that._vf.nameSpaceName, childDomNode, that._vf.mapDEFToID);
                                    that._xmlNode.appendChild(childDomNode);
                                }
                            } );
                        }
                    }
                    else {
                        if (xml && xml.localName)
                            x3dom.debug.logError('No Scene in ' + xml.localName);
                        else
                            x3dom.debug.logError('No Scene in resource');
                    }

                    // trick to free memory, assigning a property to global object, then deleting it
                    var global = x3dom.getGlobal();

                    if (that._childNodes.length > 0 && that._childNodes[0] && that._childNodes[0]._nameSpace)
                        that._nameSpace.removeSpace(that._childNodes[0]._nameSpace);
                    
                    while (that._childNodes.length !== 0)
                        global['_remover'] = that.removeChild(that._childNodes[0]);
                    
                    delete global['_remover'];

                    if (newScene)
                    {
                        that.addChild(newScene);

                        that.invalidateVolume();
                        //that.invalidateCache();

                        that._nameSpace.doc.downloadCount -= 1;
                        that._nameSpace.doc.needRender = true;
                        x3dom.debug.logInfo('Inline: added ' + that._vf.url[0] + ' to scene.');
                        
                        // recalc changed scene bounding box twice
                        var theScene = that._nameSpace.doc._scene;

                        if (theScene) {
                            theScene.invalidateVolume();
                            //theScene.invalidateCache();

                            window.setTimeout( function() {
                                that.invalidateVolume();
                                //that.invalidateCache();

                                theScene.updateVolume();
                                that._nameSpace.doc.needRender = true;
                                }, 1000 );
                        }
                        
                        that.fireEvents("load");
                    }
                    
                    newScene = null;
                    nameSpace = null;
                    inlScene = null;
                    xml = null;

                    return xhr;
                };

                if (this._vf.url.length && this._vf.url[0].length)
                {
                    var xhrURI = this._nameSpace.getURL(this._vf.url[0]);

                    //Unfortunately, there is currently an inconsistent behavior between
                    //chrome and firefox, where the first one is "escaping" the "%" character in the
                    //blob URI, which contains a ref to a "file" object. This can also not be fixed by
                    //first using "decodeURI", because, in that case, "%3A" is not resolved to "%".
                    if (!(xhrURI.substr(0, 5) === "blob:"))
                    {
                        xhrURI = encodeURI(xhrURI);
                    }

                    xhr.open('GET', xhrURI, true);

                    this._nameSpace.doc.downloadCount += 1;

                    try {
                        xhr.send(null);
                    }
                    catch(ex) {
                        this.fireEvents("error");
                        x3dom.debug.logError(this._vf.url[0] + ": " + ex);
                    }
                }
            }
        }
    )
);

x3dom.nodeTypes.Inline.AwaitTranscoding = 202;      // Parameterizable retry state for Transcoder
x3dom.nodeTypes.Inline.MaximumRetries = 15;         // Parameterizable maximum number of retries


function setNamespace(prefix, childDomNode, mapDEFToID)
{
	if(childDomNode instanceof Element && childDomNode.__setAttribute !== undefined) {
	
		if(childDomNode.hasAttribute('id') )	{
			childDomNode.__setAttribute('id', prefix.toString().replace(' ','') +'__'+ childDomNode.getAttribute('id'));	
		} else if (childDomNode.hasAttribute('DEF') && mapDEFToID){
			childDomNode.__setAttribute('id', prefix.toString().replace(' ','') +'__'+ childDomNode.getAttribute('DEF'));
		}
	}
	
	if(childDomNode.hasChildNodes()){
		Array.forEach ( childDomNode.childNodes, function (children) {
			setNamespace(prefix, children, mapDEFToID);
		} );
	}		
}
