/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Shape ### */
x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,
        
        /**
         * Constructor for Shape
         * @constructs x3dom.nodeTypes.Shape
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DShapeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Shape node has two fields, appearance and geometry, that are used to create rendered objects in the world.
         * The appearance field contains an Appearance node that specifies the visual attributes (e.g., material and texture) to be applied to the geometry.
         * The geometry field contains a geometry node. The specified geometry node is rendered with the specified appearance nodes applied.
         */
        function (ctx) {
            x3dom.nodeTypes.Shape.superClass.call(this, ctx);
        
        },
        {
            nodeChanged: function () {
                //TODO delete this if all works fine
                if (!this._cf.appearance.node) {
                    //Unlit
                    //this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
                }
                if (!this._cf.geometry.node) {
                    if (this._DEF)
                        x3dom.debug.logError("No geometry given in Shape/" + this._DEF);
                }
                else if (!this._objectID) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
                this.setAllDirty();
            }
        }
    )
);

/** Static class ID counter (needed for caching) */
x3dom.nodeTypes.Shape.shaderPartID = 0;

/** Static class ID counter (needed for picking) */
x3dom.nodeTypes.Shape.objectID = 0;

/** Map for Shape node IDs (needed for picking) */
x3dom.nodeTypes.Shape.idMap = {
    nodeID: {},
    remove: function(obj) {
        for (var prop in this.nodeID) {
            if (this.nodeID.hasOwnProperty(prop)) {
                var val = this.nodeID[prop];
                if (val._objectID  && obj._objectID &&
                    val._objectID === obj._objectID)
                {
                    delete this.nodeID[prop];
                    x3dom.debug.logInfo("Unreg " + val._objectID);
                    // FIXME; handle node removal to unreg from map,
                    // and put free'd ID back to ID pool for reuse
                }
            }
        }
    }
};
