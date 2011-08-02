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

// ### Anchor ###
x3dom.registerNodeType(
    "Anchor",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
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
                // fixme; window.open usually gets blocked
                // but this way the current page is lost?!
                window.location = this._nameSpace.getURL(this._vf.url[0]);
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
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "url") {
                    var xhr = this.nodeChanged();
                    xhr = null;
                }
            },

            nodeChanged: function ()
            {
                var that = this;

                var xhr = new window.XMLHttpRequest();
                xhr.overrideMimeType('text/xml');   //application/xhtml+xml
                this._nameSpace.doc.downloadCount += 1;

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        delete xhr['onreadystatechange'];
                        if (xhr.responseXML.documentElement.localName == 'parsererror') {
                            that._nameSpace.doc.downloadCount -= 1;
                            x3dom.debug.logError('XML parser failed on ' + that._vf.url +
                                        ':\n' + xhr.responseXML.documentElement.textContent);
                            return xhr;
                        }
                    } else {
                        // still loading
                        //x3dom.debug.logInfo('Loading inlined data... (readyState: ' + xhr.readyState + ')');
                        //if (xhr.readyState == 3) x3dom.debug.logInfo(xhr.responseText);
                        return xhr;
                    }

                    if (xhr.status !== 200) {
                        that._nameSpace.doc.downloadCount -= 1;
                        x3dom.debug.logError('XMLHttpRequest requires a web server running!');
                        return xhr;
                    }

                    x3dom.debug.logInfo('Inline: downloading '+that._vf.url+' done.');

                    var xml = xhr.responseXML;

                    //TODO; check if exists and FIXME: it's not necessarily the first scene in the doc!
                    var inlScene = xml.getElementsByTagName('Scene')[0] || xml.getElementsByTagName('scene')[0];
                    var newScene;
                    var nameSpace;

                    if (inlScene) {
                        nameSpace = new x3dom.NodeNameSpace("", that._nameSpace.doc);
                        nameSpace.setBaseURL (that._vf.url[0]);
                        newScene = nameSpace.setupTree(inlScene);
                    } else {
                        x3dom.debug.logWarning('no Scene in ' + xml.localName);
                    }

                    // trick to free memory, assigning a property to global object, then deleting it
                    var global = x3dom.getGlobal();
                    while (that._childNodes.length !== 0) {
                        global['_remover'] = that.removeChild(that._childNodes[0]);
                    }
                    delete global['_remover'];

                    that.addChild(newScene);
                    //that._xmlNode.appendChild (inlScene);

                    that._nameSpace.doc.downloadCount -= 1;
                    that._nameSpace.doc.needRender = true;
                    x3dom.debug.logInfo('Inline: added '+that._vf.url+' to scene.');

                    newScene = null;
                    nameSpace = null;
                    xml = null;
                    inlScene = null;
                };

                xhr.open('GET', encodeURI(this._nameSpace.getURL(this._vf.url[0])), true);
                xhr.send(null);
                return xhr;
            }
        }
    )
);
