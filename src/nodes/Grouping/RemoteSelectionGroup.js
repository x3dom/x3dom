/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### RemoteSelectionGroup ###
x3dom.registerNodeType(
    "RemoteSelectionGroup",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for RemoteSelectionGroup
         * @constructs x3dom.nodeTypes.RemoteSelectionGroup
         * @x3d x.x
         * @component Grouping
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The RemoteSelectionGroup node uses a WebSocket connection to request the results of a a  side
         *  culling.
         */
        function (ctx) {
            x3dom.nodeTypes.RemoteSelectionGroup.superClass.call(this, ctx);


            /**
             * The address for the WebSocket connection
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue ["ws://localhost:35668/cstreams/0"]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', ["ws://localhost:35668/cstreams/0"]);

            /**
             * Defines a list of subsequent id/object pairs.
             * @var {x3dom.fields.MFString} label
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'label', []);

            /**
             * Sets the maximum number of items that are rendered.
             * @var {x3dom.fields.SFInt32} maxRenderedIds
             * @range -1 or [0, inf]
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxRenderedIds', -1);

            /**
             * Sets whether a reconnect is attempted on a connection loss.
             * @var {x3dom.fields.SFBool} reconnect
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'reconnect', true);

            /**
             * Sets the scaling factor to reduce the number of render calls during navigation
             * @var {x3dom.fields.SFFloat} scaleRenderedIdsOnMove
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'scaleRenderedIdsOnMove', 1.0);

            /**
             * Defines whether culling is used. If culling is disabled the RemoteSelectionGroup works like a normal group.
             * @var {x3dom.fields.SFBool} enableCulling
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enableCulling', true);

            /**
             * Defines a set of labels to disable nodes. The label must include the prefix.
             * @var {x3dom.fields.MFString} invisibleNodes
             * @memberof x3dom.nodeTypes.RemoteSelectionGroup
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'invisibleNodes', []);

            this._idList = [];          // to be updated by socket connection
            this._websocket = null;     // pointer to socket

            this._nameObjMap = {};
            this._createTime = [];
            this._visibleList = [];

            if (ctx)
                this.initializeSocket();    // init socket connection
            else
                x3dom.debug.logWarning("RemoteSelectionGroup: No runtime context found!");
        
        },
        {
            initializeSocket: function()
            {
                var that = this;

                if ("WebSocket" in window)
                {
                    var wsUrl = "ws://localhost:35668/cstreams/0";

                    if (this._vf.url.length && this._vf.url[0].length)
                        wsUrl = this._vf.url[0];

                    this._websocket = new WebSocket(wsUrl);

                    this._websocket._lastMsg = null;
                    this._websocket._lastData = "";

                    this._websocket.onopen = function(evt)
                    {
                        x3dom.debug.logInfo("WS Connected");

                        var view = that._nameSpace.doc._viewarea.getViewMatrix();
                        this._lastMsg = view.toGL().toString();

                        view = that._nameSpace.doc._viewarea.getProjectionMatrix();
                        this._lastMsg += ("," + view.toGL().toString());

                        this.send(this._lastMsg);
                        x3dom.debug.logInfo("WS Sent: " + this._lastMsg);

                        this._lastMsg = "";     // triggers first update
                        this._lastData = "";
                    };

                    this._websocket.onclose = function(evt)
                    {
                        x3dom.debug.logInfo("WS Disconnected");

                        if (that._vf.reconnect)
                        {
                            window.setTimeout(function() {
                                that.initializeSocket();
                            }, 2000);
                        }
                    };

                    this._websocket.onmessage = function(evt)
                    {
                        if (that._vf.maxRenderedIds < 0)
                        {
                            // render all sent items
                            that._idList = x3dom.fields.MFString.parse(evt.data);
                        }
                        else if (that._vf.maxRenderedIds > 0)
                        {
                            // render #maxRenderedIds items
                            that._idList = [];
                            var arr = x3dom.fields.MFString.parse(evt.data);
                            var n = Math.min(arr.length, Math.abs(that._vf.maxRenderedIds));

                            for (var i=0; i<n; ++i) {
                                that._idList[i] = arr[i];
                            }
                        }

                        if (that._vf.maxRenderedIds != 0 && this._lastData != evt.data)
                        {
                            this._lastData = evt.data;
                            that._nameSpace.doc.needRender = true;
                            //x3dom.debug.logInfo("WS Response: " + evt.data);

                            that.invalidateVolume();
                            //that.invalidateCache();
                        }
                    };

                    this._websocket.onerror = function(evt)
                    {
                        x3dom.debug.logError(evt.data);
                    };

                    this._websocket.updateCamera = function()
                    {
                        // send again
                        var view = that._nameSpace.doc._viewarea.getViewMatrix();
                        var message = view.toGL().toString();

                        view = that._nameSpace.doc._viewarea.getProjectionMatrix();
                        message += ("," + view.toGL().toString());

                        if (this._lastMsg != null && this._lastMsg != message)
                        {
                            this._lastMsg = message;
                            this.send(message);
                            //x3dom.debug.logInfo("WS Sent: " + message);
                        }
                    };

                    // if there were a d'tor this would belong there
                    // this._websocket.close();
                }
                else
                {
                    x3dom.debug.logError("Browser has no WebSocket support!");
                }
            },

            nodeChanged: function ()
            {
                var n = this._vf.label.length;

                this._nameObjMap = {};
                this._createTime = new Array(n);
                this._visibleList = new Array(n);

                for (var i=0; i<n; ++i)
                {
                    var shape = this._childNodes[i];

                    if (shape && x3dom.isa(shape, x3dom.nodeTypes.X3DShapeNode))
                    {
                        this._nameObjMap[this._vf.label[i]] = { shape: shape, pos: i };
                        this._visibleList[i] = true;
                    }
                    else {
                        this._visibleList[i] = false;
                        x3dom.debug.logError("Invalid children: " + this._vf.label[i]);
                    }

                    // init list that holds creation time of gl object
                    this._createTime[i] = 0;
                }

                this.invalidateVolume();
                //this.invalidateCache();

                x3dom.debug.logInfo("RemoteSelectionGroup has " + n + " entries.");
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "url")
                {
                    if (this._websocket) {
                        this._websocket.close();
                        this._websocket = null;
                    }
                    this.initializeSocket();
                }
                else if (fieldName == "invisibleNodes")
                {
                    for (var i=0, n=this._vf.label.length; i<n; ++i)
                    {
                        var shape = this._childNodes[i];

                        if (shape && x3dom.isa(shape, x3dom.nodeTypes.X3DShapeNode))
                        {
                            this._visibleList[i] = true;

                            for (var j=0, numInvis=this._vf.invisibleNodes.length; j<numInvis; ++j)
                            {
                                var nodeName = this._vf.invisibleNodes[j];
                                var starInd = nodeName.lastIndexOf('*');
                                var matchNameBegin = false;

                                if (starInd > 0) {
                                    nodeName = nodeName.substring(0, starInd);
                                    matchNameBegin = true;
                                }
                                if (nodeName.length <= 1)
                                    continue;

                                if ((matchNameBegin && this._vf.label[i].indexOf(nodeName) == 0) ||
                                    this._vf.label[i] == nodeName) {
                                    this._visibleList[i] = false;
                                    break;
                                }
                            }
                        }
                        else {
                            this._visibleList[i] = false;
                        }
                    }

                    this.invalidateVolume();
                    //this.invalidateCache();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            getNumRenderedObjects: function(len, isMoving)
            {
                var n = len;

                if (this._vf.maxRenderedIds > 0)
                {
                    var num = Math.max(this._vf.maxRenderedIds, 16);  // set lower bound

                    var scale = 1;  // scale down on move
                    if (isMoving)
                        scale = Math.min(this._vf.scaleRenderedIdsOnMove, 1);

                    num = Math.max(Math.round(scale * num), 0);
                    n = Math.min(n, num);
                }

                return n;
            },

            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                var viewarea = this._nameSpace.doc._viewarea;
                var isMoving = viewarea.isMovingOrAnimating();

                var ts = new Date().getTime();
                var maxLiveTime = 10000;
                var i, n, numChild = this._childNodes.length;

                if (!this._vf.enableCulling)
                {
                    n = this.getNumRenderedObjects(numChild, isMoving);

                    var cnt = 0;
                    for (i=0; i<numChild; i++)
                    {
                        var shape = this._childNodes[i];

                        if (shape)
                        {
                            var needCleanup = true;

                            if (this._visibleList[i] && cnt < n &&
                                shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes))
                            {
                                this._createTime[i] = ts;
                                cnt++;
                                needCleanup = false;
                            }

                            if (needCleanup && !isMoving && this._createTime[i] > 0 &&
                                ts - this._createTime[i] > maxLiveTime && shape._cleanupGLObjects)
                            {
                                shape._cleanupGLObjects(true);
                                this._createTime[i] = 0;
                            }
                        }
                    }

                    return;
                }

                if (this._websocket)
                    this._websocket.updateCamera();

                if (this._vf.label.length)
                {
                    n = this.getNumRenderedObjects(this._idList.length, isMoving);

                    for (i=0; i<n; i++)
                    {
                        var obj = this._nameObjMap[this._idList[i]];
                        if (obj && obj.shape) {
                            obj.shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                            this._createTime[obj.pos] = ts;
                        }
                        else
                            x3dom.debug.logError("Invalid label: " + this._idList[i]);
                    }

                    for (i=0; i<this._childNodes.length; i++)
                    {
                        if (this._childNodes[i] && !isMoving && this._createTime[i] > 0 &&
                            ts - this._createTime[i] > maxLiveTime && this._childNodes[i]._cleanupGLObjects)
                        {
                            this._childNodes[i]._cleanupGLObjects(true);
                            this._createTime[i] = 0;
                        }
                    }
                }
            }
        }
    )
);