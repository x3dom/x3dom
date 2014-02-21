/**
 * The abstract pointing device sensor node class serves as a base class for all pointing device sensors.
 * Pointing device sensors catch pointing device events from all sibling nodes.
 */





x3dom.registerNodeType(
    "X3DPointingDeviceSensorNode",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DSensorNode,

        function (ctx)
        {
            x3dom.nodeTypes.X3DPointingDeviceSensorNode.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------

            //route-able output fields
            //this.addField_SFBool(ctx, 'isOver', false);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * List of sibling nodes' pointing device event listeners, which have been attached by this node.
             * @type {Array}
             * @private
             */
            this._siblingNodeListenerSets = [];


            //---------------------------------------
            // INITIALIZATION
            //---------------------------------------

            //currently, nothing is done here
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Overrides X3DSensorNode.siblingAdded
             * @param {X3DNode} sibling - the sibling which was added
             */
            siblingAdded: function(sibling) {
                x3dom.nodeTypes.X3DSensorNode.prototype.siblingAdded.call(this, sibling);

                var index = this._findSiblingNodeListenerSetIndex(sibling._xmlNode);
                var listenerSet;

                if (index == -1)
                {
                    listenerSet = new NodeEventListenerSet(sibling._xmlNode);

                    this._siblingNodeListenerSets.push(listenerSet);

                    this._attachPointingDeviceEventListeners(sibling, listenerSet);
                }
                else
                {
                    x3dom.debug.logWarning("Sibling has already been added to X3DPointingDeviceSensorNode.");
                }
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Overrides X3DSensorNode.siblingRemoved
             * @param {X3DNode} sibling - the sibling which was removed
             */
            siblingRemoved: function(sibling) {
                x3dom.nodeTypes.X3DSensorNode.prototype.siblingRemoved.call(this, sibling);

                var index = this._findSiblingNodeListenerSetIndex(sibling._xmlNode);

                if (index != -1)
                {
                    this._detachPointingDeviceEventListeners(sibling, this._siblingNodeListenerSets[listenerSet]);

                    this._siblingNodeListenerSets.splice(index, 1);
                }
                else
                {
                    x3dom.debug.logError("Cannot remove sibling from X3DPointingDeviceSensorNode: Sibling is not known.");
                }
            },

            //----------------------------------------------------------------------------------------------------------------------

            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------

            _findSiblingNodeListenerSetIndex: function(domNode)
            {
                var i = 0;

                for (; i < this._siblingNodeListenerSets; ++i)
                {
                    if (this._siblingNodeListenerSets._domNode == domNode)
                    {
                        return i;
                    }
                }

                return -1;
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Attaches pointing device event listeners for the given sibling to the matching domNode
             * @param {X3DNode} node - the sibling node to attach the event listeners to
             * @param {NodeEventListenerSet} listenerSet - the current set of listeners which belongs to the given node
             * @private
             */
            _attachPointingDeviceEventListeners: function(sibling, listenerSet)
            {
                var that = this;

                var pointerOverCallback     = function(event){ that._pointerEnteredSibling(event, sibling); };
                var pointerOutCallback      = function(event){ that._pointerLeftSibling(event, sibling); };
                var pointerMovedCallback    = function(event){ that._pointerMovedOverSibling(event, sibling); };
                var pointerPressedCallback  = function(event){ that._pointerPressedOverSibling(event, sibling); };
                var pointerReleasedCallback = function(event){ that._pointerReleasedOverSibling(event, sibling); };

                listenerSet.setListener("mouseover", pointerOverCallback);
                listenerSet.setListener("mouseout",  pointerOutCallback);
                listenerSet.setListener("mousemove", pointerMovedCallback);
                listenerSet.setListener("mousedown", pointerPressedCallback);
                listenerSet.setListener("mouseup",   pointerReleasedCallback);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Detaches a set of pointing device event listeners that were previously installed to notify this sensor
             * @param {NodeEventListenerSet} listenerSet - the set of listeners
             * @private
             */
            _detachPointingDeviceEventListeners: function(listenerSet)
            {
                listenerSet.removeListener("mousedown");
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has entered the area over a sibling node of this sensor
             * @param {DOMEvent] event - the pointer event
             * @param {X3DNode] sibling - the sibling node
             * @private
             */
            _pointerEnteredSibling: function(event, sibling)
            {
                //currently, nothing is done here
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has left the area over a sibling node of this sensor
             * @param {DOMEvent] event - the pointer event
             * @param {X3DNode] sibling - the sibling node
             * @private
             */
            _pointerLeftSibling: function(event, sibling)
            {
                //currently, nothing is done here
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been moved over a sibling node of this sensor
             * @param {DOMEvent] event - the pointer event
             * @param {X3DNode] sibling - the sibling node
             * @private
             */
            _pointerMovedOverSibling: function(event, sibling)
            {
                //currently, nothing is done here
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been pressed over a sibling node of this sensor
             * @param {DOMEvent] event - the pointer event
             * @param {X3DNode] sibling - the sibling node
             * @private
             */
            _pointerPressedOverSibling: function(event, sibling)
            {
                var that = this;

                //attach a listener to catch the mouseup event, also out of the sibling
                var tmpListener = function(event) {
                    that._pointerReleased(event);
                    document.removeEventListener("mouseup", tmpListener);
                };

                document.addEventListener("mouseup", tmpListener);
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been released over a sibling node of this sensor
             * @param {DOMEvent] event - the pointer event
             * @param {X3DNode] sibling - the sibling node
             * @private
             */
            _pointerReleasedOverSibling: function(event, sibling)
            {
                //currently, nothing is done here
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * Function that gets called if the pointing device has been released,
             * after it has been pressed over a sibling of this node
             * @param {DOMEvent] event - the pointer event
             * @private
             */
            _pointerReleased: function(event)
            {
                //currently, nothing is done here
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);
