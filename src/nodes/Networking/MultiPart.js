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

            /**
             * Defines whether the shape is pickable.
             * @var {x3dom.fields.SFBool} isPickable
             * @memberof x3dom.nodeTypes.MultiPart
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isPickable', true);
            
            /**
             * Defines the shape type for sorting.
             * @var {x3dom.fields.SFString} sortType
             * @range [auto, transparent, opaque]
             * @memberof x3dom.nodeTypes.MultiPart
             * @initvalue 'auto'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'sortType', 'auto');

            /**
             * Specifies whether backface-culling is used. If solid is TRUE only front-faces are drawn.
             * @var {x3dom.fields.SFBool} solid
             * @memberof x3dom.nodeTypes.MultiPart
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'solid', true);

            /**
             * Change render order manually.
             * @var {x3dom.fields.SFInt32} sortKey
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'sortKey', 0);

            /**
             * Set the initial visibility.
             * @var {x3dom.fields.SFInt32} initialVisibility
             * @range [auto, visible, invisible]
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 'auto'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'initialVisibility', 'auto');

            this._idMap = null;
            this._inlineNamespace = null;
            this._highlightedParts = [];
            this._minId = 0;
            this._maxId = 0;
            this._lastId = -1;
            this._lastButton = 0;
            this._identifierToPartId = [];
            this._identifierToAppId = [];
            this._visiblePartsPerShape = [];
            this._partVolume = [];
            this._partVisibility = [];
			this._originalColor = [];

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
                }
            },
            
            getVolume: function ()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    for (var i=0; i<this._partVisibility.length; i++)
                    {
                        if (!this._partVisibility[i])
                            continue;

                        var childVol = this._partVolume[i];

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }
                };
                
                return vol;
            },

            handleEvents: function(e)
            {
                if( this._inlineNamespace ) {
                    var colorMap = this._inlineNamespace.defMap["MultiMaterial_ColorMap"];
                    var visibilityMap = this._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];

                    if (e.pickedId != -1) {
                        e.part = new x3dom.Parts(this, [e.pickedId - this._minId], colorMap, visibilityMap);
                        e.partID = this._idMap.mapping[e.pickedId - this._minId].name;

                        //fire mousemove event
                        e.type = "mousemove";
                        this.callEvtHandler("onmousemove", e);

                        //fire mousemove event
                        e.type = "mouseover";
                        this.callEvtHandler("onmouseover", e);

                        //fire click event
                        if (e.button && e.button != this._lastButton) {
                            e.type = "click";
                            this.callEvtHandler("onclick", e);
                            this._lastButton = e.button;
                        }

                        //if some mouse button is down fire mousedown event
                        if (e.button) {
                            e.type = "mousedown";
                            this.callEvtHandler("onmousedown", e);
                            this._lastButton = e.button;
                        }

                        //if some mouse button is up fire mouseup event
                        if (this._lastButton != 0 && e.button == 0) {
                            e.type = "mouseup";
                            this.callEvtHandler("onmouseup", e);
                            this._lastButton = 0;
                        }

                        //If the picked id has changed we enter+leave a part
                        if (e.pickedId != this._lastId) {
                            if (this._lastId != -1) {
                                e.part = new x3dom.Parts(this, [this._lastId - this._minId], colorMap, visibilityMap);
                                e.partID = this._idMap.mapping[this._lastId - this._minId].name;
                                e.type = "mouseleave";
                                this.callEvtHandler("onmouseleave", e);
                            }

                            e.part = new x3dom.Parts(this, [e.pickedId - this._minId], colorMap, visibilityMap);
                            e.partID = this._idMap.mapping[e.pickedId - this._minId].name;
                            e.type = "mouseenter";
                            this.callEvtHandler("onmouseenter", e);
                            this._lastId = e.pickedId;
                        }

                        this._lastId = e.pickedId;
                    }
                    else if (this._lastId != -1) {
                        e.part = new x3dom.Parts(this, [this._lastId - this._minId], colorMap, visibilityMap);
                        e.partID = this._idMap.mapping[this._lastId - this._minId].name;
                        e.type = "mouseout";
                        this.callEvtHandler("onmouseout", e);
                        e.type = "mouseleave";
                        this.callEvtHandler("onmouseleave", e);
                        this._lastId = -1;
                    }
                }

            },

            loadIDMap: function ()
            {
                if (this._vf.urlIDMap.length && this._vf.urlIDMap[0].length)
                {
                    var i, min, max;

                    var that = this;

                    var idMapURI = this._nameSpace.getURL(this._vf.urlIDMap[0]);

                    var xhr = new XMLHttpRequest();

                    xhr.open("GET", idMapURI, true);

                    xhr.onload = function()
                    {
                        that._idMap = JSON.parse(this.responseText);

                        //Check if the MultiPart map already initialized
                        if (that._nameSpace.doc._scene._multiPartMap == null) {
                            that._nameSpace.doc._scene._multiPartMap = {numberOfIds: 0, multiParts: []};
                        }

                        //Set the ID range this MultiPart is holding
                        that._minId = that._nameSpace.doc._scene._multiPartMap.numberOfIds;
                        that._maxId = that._minId + that._idMap.numberOfIDs - 1;

                        //Update the MultiPart map
                        that._nameSpace.doc._scene._multiPartMap.numberOfIds += that._idMap.numberOfIDs;
                        that._nameSpace.doc._scene._multiPartMap.multiParts.push(that);

                        //prepare internal shape map
                        for (i=0; i<that._idMap.mapping.length; i++)
                        {
                            if (!that._identifierToPartId[that._idMap.mapping[i].name]) {
                                that._identifierToPartId[that._idMap.mapping[i].name] = [];
                            }

                            if (!that._identifierToPartId[that._idMap.mapping[i].appearance]) {
                                that._identifierToPartId[that._idMap.mapping[i].appearance] = [];
                            }

                            that._identifierToPartId[that._idMap.mapping[i].name].push(i);
                            that._identifierToPartId[that._idMap.mapping[i].appearance].push(i);

                            if (!that._partVolume[i]) {
                                var min = x3dom.fields.SFVec3f.parse(that._idMap.mapping[i].min);
                                var max = x3dom.fields.SFVec3f.parse(that._idMap.mapping[i].max);

                                that._partVolume[i] = new x3dom.fields.BoxVolume(min, max);
                            }

                        }

                        //prepare internal appearance map
                        for (i=0; i<that._idMap.appearance.length; i++)
                        {
                            that._identifierToAppId[that._idMap.appearance[i].name] = i;
                        }

                        that.loadInline();
                    };

                    xhr.send(null);
                }
            },

            createColorData: function ()
            {
                var diffuseColor, transparency, rgba;
                var size = Math.ceil(Math.sqrt(this._idMap.numberOfIDs));
                var colorData = size + " " + size + " 4";

                for (var i=0; i<size*size; i++)
                {
                    if (i < this._idMap.mapping.length)
                    {
                        var appName = this._idMap.mapping[i].appearance;
                        var appID = this._identifierToAppId[appName];

                        diffuseColor = this._idMap.appearance[appID].material.diffuseColor;
                        transparency = this._idMap.appearance[appID].material.transparency;

                        rgba = x3dom.fields.SFColorRGBA.parse(diffuseColor + " " + transparency);

                        colorData += " " + rgba.toUint();
						
						this._originalColor[i] = rgba;
                    }
                    else
                    {
                        colorData += " 255";
                    }
                }

                return colorData;
            },

            createVisibilityData: function ()
            {
                var i, j;
                var size = Math.ceil(Math.sqrt(this._idMap.numberOfIDs));
                var visibilityData = size + " " + size + " 1";

                for (i=0; i<size*size; i++)
                {
                    if (i < this._idMap.mapping.length)
                    {
                        if (this._vf.initialVisibility == 'auto')
                        {
                            //TODO get the Data from JSON
                            visibilityData += " 255";

                            if (!this._partVisibility[i]) {
                                this._partVisibility[i] = true;
                            }

                            for (j=0; j<this._idMap.mapping[i].usage.length; j++)
                            {
                                if (!this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]]) {
                                    this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]] = {val:0, max:0};
                                }
                                this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]].val++;
                                this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]].max++;
                            }
                        }
                        else if (this._vf.initialVisibility == 'visible')
                        {
                            visibilityData += " 255";

                            if (!this._partVisibility[i]) {
                                this._partVisibility[i] = true;
                            }

                            for (j=0; j<this._idMap.mapping[i].usage.length; j++)
                            {
                                if (!this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]]) {
                                    this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]] = {val:0, max:0};
                                }
                                this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]].val++;
                                this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]].max++;
                            }
                        }
                        else if (this._vf.initialVisibility == 'invisible')
                        {
                            visibilityData += " 0";

                            if (!this._partVisibility[i]) {
                                this._partVisibility[i] = false;
                            }

                            for (j=0; j<this._idMap.mapping[i].usage.length; j++)
                            {
                                if (!this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]]) {
                                    this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]] = {val:0, max:0};
                                }
                                this._visiblePartsPerShape[this._idMap.mapping[i].usage[j]].max++;
                            }
                        }

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
                var css, shapeDEF, colorData, visibilityData, appearance;
                var firstMat = true;
                if (inlScene && inlScene.hasChildNodes())
                {
                    colorData = this.createColorData();
                    visibilityData = this.createVisibilityData();

                    var shapes = inlScene.getElementsByTagName("Shape");

                    for (var s=0; s<shapes.length; s++)
                    {
                        shapeDEF = shapes[s].getAttribute("DEF") ||
                                   shapes[s].getAttribute("def");

                        if(shapeDEF && this._visiblePartsPerShape[shapeDEF] && 
                           this._visiblePartsPerShape[shapeDEF].val == 0)
                        {
                            shapes[s].setAttribute("render", "false");
                        }

                        shapes[s].setAttribute("idOffset", this._minId);
                        shapes[s].setAttribute("isPickable", this._vf.isPickable);

                        var geometries = shapes[s].getElementsByTagName("BinaryGeometry");

                        if (geometries && geometries.length) {
                            for (var g = 0; g < geometries.length; g++) {
                                geometries[g].setAttribute("solid", this._vf.solid);
                            }
                        }

                        var appearances = shapes[s].getElementsByTagName("Appearance");
                        
                        if (appearances.length)
                        {
                            for (var a = 0; a < appearances.length; a++)
                            {
                                //Remove DEF/USE
                                appearances[a].removeAttribute("DEF");
                                appearances[a].removeAttribute("USE");
                                
                                appearances[a].setAttribute("sortType", this._vf.sortType);
                                appearances[a].setAttribute("sortKey", this._vf.sortKey);

                                var materials = appearances[a].getElementsByTagName("Material");

                                if (materials.length)
                                {
                                    //Replace Material
                                    if (firstMat) {
                                        firstMat = false;
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("DEF", "MultiMaterial");

                                        var ptDA = document.createElement("PixelTexture");
                                        ptDA.setAttribute("containerField", "multiDiffuseAlphaTexture");
                                        ptDA.setAttribute("id", "MultiMaterial_ColorMap");
                                        ptDA.setAttribute("image", colorData);

                                        var ptV = document.createElement("PixelTexture");
                                        ptV.setAttribute("containerField", "multiVisibilityTexture");
                                        ptV.setAttribute("id", "MultiMaterial_VisibilityMap");
                                        ptV.setAttribute("image", visibilityData);

                                        css.appendChild(ptDA);
                                        css.appendChild(ptV);
                                    }
                                    else
                                    {
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("USE", "MultiMaterial");
                                    }
                                    appearances[a].replaceChild(css, materials[0]);
                                }
                                else
                                {
                                    //Add Material
                                    if (firstMat) {
                                        firstMat = false;
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("DEF", "MultiMaterial");

                                        var ptDA = document.createElement("PixelTexture");
                                        ptDA.setAttribute("containerField", "multiDiffuseAlphaTexture");
                                        ptDA.setAttribute("id", "MultiMaterial_ColorMap");
                                        ptDA.setAttribute("image", colorData);

                                        var ptV = document.createElement("PixelTexture");
                                        ptV.setAttribute("containerField", "multiVisibilityTexture");
                                        ptV.setAttribute("id", "MultiMaterial_VisibilityMap");
                                        ptV.setAttribute("image", visibilityData);

                                        css.appendChild(ptDA);
                                        css.appendChild(ptV);
                                    }
                                    else
                                    {
                                        css = document.createElement("CommonSurfaceShader");
                                        css.setAttribute("USE", "MultiMaterial");
                                    }

                                    appearances[a].appendChild(css);
                                }
                            }
                        }
                        else
                        {
                            //Add Appearance
                            appearance = document.createElement("Appearance");
                            
                            //Add Material
                            if (firstMat) {
                                firstMat = false;
                                css = document.createElement("CommonSurfaceShader");
                                css.setAttribute("DEF", "MultiMaterial");

                                var ptDA = document.createElement("PixelTexture");
                                ptDA.setAttribute("containerField", "multiDiffuseAlphaTexture");
                                ptDA.setAttribute("id", "MultiMaterial_ColorMap");
                                ptDA.setAttribute("image", colorData);

                                var ptV = document.createElement("PixelTexture");
                                ptV.setAttribute("containerField", "multiVisibilityTexture");
                                ptV.setAttribute("id", "MultiMaterial_VisibilityMap");
                                ptV.setAttribute("image", visibilityData);

                                css.appendChild(ptDA);
                                css.appendChild(ptV);
                            }
                            else
                            {
                                css = document.createElement("CommonSurfaceShader");
                                css.setAttribute("USE", "MultiMaterial");
                            }

                            appearance.appendChild(css);
                            geometries[g].appendChild(appearance);
                        }
                    }
                }
            },

            appendAPI: function ()
            {
                var multiPart = this;

                this._xmlNode.getIdList = function ()
                {
                    var i, ids = [];

                    for (i=0; i<multiPart._idMap.mapping.length; i++) {
                        ids.push( multiPart._idMap.mapping[i].name );
                    }

                    return ids;
                };

                this._xmlNode.getParts = function (selector)
                {
                    var i, m;
                    var selection = [];

                    if (selector == undefined) {
                        for (m=0; m<multiPart._idMap.mapping.length; m++) {
                            selection.push(m);
                        }
                    } else {
                        for (i=0; i<selector.length; i++) {
                            if (multiPart._identifierToPartId[selector[i]]) {
                                selection = selection.concat(multiPart._identifierToPartId[selector[i]]);
                            }
                        }
                    }

                    var colorMap = multiPart._inlineNamespace.defMap["MultiMaterial_ColorMap"];
                    var visibilityMap = multiPart._inlineNamespace.defMap["MultiMaterial_VisibilityMap"];

                    if ( selection.length == 0) {
                        return null;
                    } else {
                        return new x3dom.Parts(multiPart, selection, colorMap, visibilityMap);
                    }
                };
                
                this._xmlNode.fitPart = function (id, updateCenterOfRotation)
                {
                    var shapeID = multiPart._identifierToPartId[id];
                
                    if (shapeID)
                    {
                        if (updateCenterOfRotation === undefined) {
                            updateCenterOfRotation = true;
                        }
                        
                        var min = multiPart._partVolume[shapeID[0]].min;
                        var max = multiPart._partVolume[shapeID[0]].max;

                        var mat = multiPart.getCurrentTransform();

                        min = mat.multMatrixPnt(min);
                        max = mat.multMatrixPnt(max);
                         
                        multiPart._nameSpace.doc._viewarea.fit(min, max, updateCenterOfRotation);
                    }
                };
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

                    if (xhr.status === x3dom.nodeTypes.Inline.AwaitTranscoding) {
                        if (that.count < that.numRetries)
                        {
                            that.count++;
                            var refreshTime = +xhr.getResponseHeader("Refresh") || 5;
                            x3dom.debug.logInfo('XHR status: ' + xhr.status + ' - Await Transcoding (' + that.count + '/' + that.numRetries + '): ' + 
                                                'Next request in ' + refreshTime + ' seconds');
                      
                            window.setTimeout(function() {
                                that._nameSpace.doc.downloadCount -= 1;
                                that.loadInline();
                            }, refreshTime * 1000);
                            return xhr;
                        }
                        else
                        {
                            x3dom.debug.logError('XHR status: ' + xhr.status + ' - Await Transcoding (' + that.count + '/' + that.numRetries + '): ' + 
                                                 'No Retries left');
                            that._nameSpace.doc.downloadCount -= 1;
                            that.count = 0;
                            return xhr;
                        }
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
                        var nsDefault = "ns" + that._nameSpace.childSpaces.length;
                        
                        var nsName = (that._vf.nameSpaceName.length != 0) ?
                                      that._vf.nameSpaceName.toString().replace(' ','') : nsDefault;

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

                        that.appendAPI();
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
