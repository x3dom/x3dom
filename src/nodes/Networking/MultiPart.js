/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### MultiPart ###
x3dom.registerNodeType(
    "MultiPart",
    "Networking",
    defineClass(x3dom.nodeTypes.Inline,

        /**
         * Constructor for MultiPart
         * @constructs x3dom.nodeTypes.MultiPart
         * @x3d x.x
         * @component Networking
         * @extends x3dom.nodeTypes.Inline
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Multipart node
         */
            function (ctx) {
            x3dom.nodeTypes.MultiPart.superClass.call(this, ctx);

            /**
             * Specifies the url to the IDMap.
             * @var {x3dom.fields.MFString} urlIDMap
             * @memberof x3dom.nodeTypes.MultiPart
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'urlIDMap', []);

            this._idMap = null;
            this._oldPixels = null;
            this._inlineNamespace = null;
            this._highlightedParts = [];

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
                    this.loadIDMap();
                    this.appendAPI();
                    this.appendEventListeners();
                }
            },

            appendEventListeners: function ()
            {
                var that = this;

                this._xmlNode._shadowObjectID = -1

                this._xmlNode.addEventListener("mousedown", function (e) {
                    if (!that._nameSpace.doc._viewarea._isMoving) {
                        e.partID = that._idMap.mapping[e.shadowObjectId].name;
                        this.dispatchEvent(new CustomEvent("partclick", {detail: e}));
                    }
                }, false);

                this._xmlNode.addEventListener("mouseout", function (e) {
                    if (!that._nameSpace.doc._viewarea._isMoving) {
                        if (e.shadowObjectId == -1) {
                            e.partID = that._idMap.mapping[this._shadowObjectID].name;
                            this._shadowObjectID = -1;
                            var event = new CustomEvent("partout", {detail: e});
                            this.dispatchEvent(event);
                        }
                    }
                }, false);

                this._xmlNode.addEventListener("mousemove", function (e) {
                    if (!that._nameSpace.doc._viewarea._isMoving) {
                        e.partID = that._idMap.mapping[e.shadowObjectId].name
                        this.dispatchEvent(new CustomEvent("partmove", {detail: e}));
                        if (e.shadowObjectId != this._shadowObjectID) {
                            var tmp = e.shadowObjectId;
                            if (this._shadowObjectID != -1) {
                                e.partID = that._idMap.mapping[this._shadowObjectID].name;
                                this.dispatchEvent(new CustomEvent("partout", {detail: e}));
                            }
                            this._shadowObjectID = e.shadowObjectId = tmp;
                            e.partID = that._idMap.mapping[e.shadowObjectId].name;
                            this.dispatchEvent(new CustomEvent("partover", {detail: e}));
                        }
                    }
                }, false);
            },

            loadIDMap: function ()
            {
                if (this._vf.urlIDMap.length && this._vf.urlIDMap[0].length)
                {
                    var that = this;

                    var idMapURI = this._nameSpace.getURL(this._vf.urlIDMap[0]);

                    var xhr = new XMLHttpRequest();

                    xhr.open("GET", idMapURI, true);

                    xhr.onload = function()
                    {
                        that._idMap = JSON.parse(this.responseText);

                        that._nameSpace.doc._scene._shadowIdMap = eval("(" + this.response + ")");

                        that.loadInline();
                    };

                    xhr.send(null);
                }
            },

            createImageData: function ()
            {
                var diffuseColor, transparency, rgba;
                var size = x3dom.Utils.nextHighestPowerOfTwo(Math.sqrt(this._idMap.numberOfIDs));
                var imageData = size + " " + size + " 4";

                for (var i=0; i<size*size; i++)
                {
                    if (i < this._idMap.mapping.length)
                    {
                        var appName = this._idMap.mapping[i].appearance;

                        for (var a=0; a<this._idMap.appearance.length; a++)
                        {
                            if (this._idMap.appearance[a].name == appName)
                            {
                                diffuseColor = this._idMap.appearance[a].material.diffuseColor;
                                transparency = this._idMap.appearance[a].material.transparency;

                                rgba = x3dom.fields.SFColorRGBA.parse(diffuseColor + " " + transparency);

                                imageData += " " + rgba.toUint();
                            }
                        }
                    }
                    else
                    {
                        imageData += " 255";
                    }
                }

                return imageData;
            },

            createVisibilityData: function ()
            {
                var size = x3dom.Utils.nextHighestPowerOfTwo(Math.sqrt(this._idMap.numberOfIDs));
                var visibilityData = size + " " + size + " 1";

                for (var i=0; i<size*size; i++)
                {
                    if (i < this._idMap.mapping.length)
                    {
                        visibilityData += " 255";
                    }
                    else
                    {
                        visibilityData += " 0";
                    }
                }
                return visibilityData;
            },

            replaceMaterials: function (inlScene)
            {
                var css;
                var firstMat = true;
                if (inlScene && inlScene.hasChildNodes())
                {
                    var shapes = inlScene.getElementsByTagName("Shape");

                    for (var s=0; s<shapes.length; s++)
                    {
                        var appearances = shapes[s].getElementsByTagName("Appearance");

                        if (appearances.length)
                        {
                            for (var a = 0; a < appearances.length; a++)
                            {
                                var materials = appearances[a].getElementsByTagName("Material");

                                if (materials.length)
                                {
                                    //Replace Material
                                    if (firstMat) {
                                        firstMat = false;
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("DEF", "MultiMaterial");

                                        var sstDA = document.createElement("SurfaceShaderTexture");
                                        sstDA.setAttribute("containerField", "multiDiffuseAlphaTexture");

                                        var ptDA = document.createElement("PixelTexture");
                                        ptDA.setAttribute("id", "MultiMaterial_ColorMap");
                                        ptDA.setAttribute("image", this.createImageData());

                                        var sstV = document.createElement("SurfaceShaderTexture");
                                        sstV.setAttribute("containerField", "multiVisibilityTexture");

                                        var ptV = document.createElement("PixelTexture");
                                        ptV.setAttribute("id", "MultiMaterial_VisibilityMap");
                                        ptV.setAttribute("image", this.createVisibilityData());

                                        sstDA.appendChild(ptDA);
                                        sstV.appendChild(ptV);
                                        css.appendChild(sstDA);
                                        css.appendChild(sstV);
                                    }
                                    else
                                    {
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("USE", "MultiMaterial");
                                    }
                                    materials[0].parentNode.replaceChild(css, materials[0]);
                                }
                                else
                                {
                                    //Add Material
                                    console.log("Add Material");
                                }
                            }
                        }
                        else
                        {
                            //Add Appearance + Material
                            console.log("Add Appearance + Material");
                        }
                    }
                }
            },

            appendAPI: function ()
            {
                var multiPart = this;
                this._xmlNode.getParts = function (selector)
                {
                    var i, m;
                    var selection = []

                    if (selector == undefined || selector.length == 0) {
                        for (m=0; m<multiPart._idMap.mapping.length; m++) {
                            selection.push(m);
                        }
                    }
                    else
                    {
                        for (i=0; i<selector.length; i++) {
                            for (m=0; m<multiPart._idMap.mapping.length; m++) {
                                if (selector[i].id == multiPart._idMap.mapping[m].name ||
                                    selector[i].app == multiPart._idMap.mapping[m].appearance) {
                                    selection.push(m);
                                }
                            }
                        }
                    }

                    var Parts = function(ids, colorMap, visibilityMap)
                    {
                        var parts = this;
                        this.ids = ids;
                        this.colorMap = colorMap;
                        this.visibilityMap = visibilityMap;

                        /**
                         *
                         * @param color
                         */
                        this.setColor = function(color) {
                            var pixels = parts.colorMap.getPixels();
                            var colorRGBA = x3dom.fields.SFColorRGBA.parse(color);

                            for(var i=0; i<parts.ids.length; i++) {
                                if (multiPart._highlightedParts[parts.ids[i]]){
                                    multiPart._highlightedParts[parts.ids[i]] = colorRGBA;
                                } else {
                                    pixels[parts.ids[i]] = colorRGBA;
                                }
                            }

                            parts.colorMap.setPixels(pixels);
                        };

                        /**
                         *
                         * @param transparency
                         */
                        this.setTransparency = function(transparency) {
                            var pixels = parts.colorMap.getPixels();

                            for(var i=0; i<parts.ids.length; i++) {
                                if (multiPart._highlightedParts[parts.ids[i]]){
                                    multiPart._highlightedParts[parts.ids[i]].r = transparency;
                                } else {
                                    pixels[parts.ids[i]].a = transparency;
                                }
                            }

                            parts.colorMap.setPixels(pixels);
                        };

                        /**
                         *
                         * @param visibility
                         */
                        this.setVisibility = function(visibility) {
                            var pixels = parts.visibilityMap.getPixels();

                            for(var i=0; i<parts.ids.length; i++) {
                                pixels[parts.ids[i]].r = (visibility) ? 1 : 0;
                            }

                            parts.visibilityMap.setPixels(pixels);
                        };

                        /**
                         *
                         * @param color
                         */
                        this.highlight = function(color) {
                            var pixels = parts.colorMap.getPixels();
                            var colorRGBA = x3dom.fields.SFColorRGBA.parse(color);

                            for(var i=0; i<parts.ids.length; i++) {
                                if (multiPart._highlightedParts[parts.ids[i]] == undefined) {
                                    multiPart._highlightedParts[parts.ids[i]] = pixels[parts.ids[i]]
                                    pixels[parts.ids[i]] = colorRGBA;
                                }
                            }

                            parts.colorMap.setPixels(pixels);
                        };

                        /**
                         *
                         * @param color
                         */
                        this.unhighlight = function() {
                            var pixels = parts.colorMap.getPixels();
                            for(var i=0; i<parts.ids.length; i++) {
                                if (multiPart._highlightedParts[parts.ids[i]]) {
                                    pixels[parts.ids[i]] = multiPart._highlightedParts[parts.ids[i]];
                                    multiPart._highlightedParts[parts.ids[i]] = undefined;
                                }
                            }
                            parts.colorMap.setPixels(pixels);
                        };
                    };

                    var colorMap = multiPart._inlineNamespace.defMap["MultiMaterial_ColorMap"];
                    var visibilityMap = multiPart._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];
                    return new Parts(selection, colorMap, visibilityMap);
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

                        that._inlineNamespace = new x3dom.NodeNameSpace(nsName, that._nameSpace.doc);

                        var url = that._vf.url.length ? that._vf.url[0] : "";

                        if ((url[0] === '/') || (url.indexOf(":") >= 0))
                        {
                            that._inlineNamespace.setBaseURL(url);
                        }
                        else
                        {
                            that._inlineNamespace.setBaseURL(that._nameSpace.baseURL + url);
                        }

                        //Replace Material before setupTree()
                        that.replaceMaterials(inlScene);

                        newScene = that._inlineNamespace.setupTree(inlScene);

                        that._nameSpace.addSpace(that._inlineNamespace);

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
                        if (xml && xml.localName) {
                            x3dom.debug.logError('No Scene in ' + xml.localName);
                        } else {
                            x3dom.debug.logError('No Scene in resource');
                        }
                    }

                    // trick to free memory, assigning a property to global object, then deleting it
                    var global = x3dom.getGlobal();

                    if (that._childNodes.length > 0 && that._childNodes[0] && that._childNodes[0]._nameSpace) {
                        that._nameSpace.removeSpace(that._childNodes[0]._nameSpace);
                    }

                    while (that._childNodes.length !== 0) {
                        global['_remover'] = that.removeChild(that._childNodes[0]);
                    }

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
                    //nameSpace = null;
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