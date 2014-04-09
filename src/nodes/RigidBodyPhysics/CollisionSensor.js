/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### CollisionSensor ###
x3dom.registerNodeType("CollisionSensor", "X3DSensorNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for CollisionSensor
         * @constructs x3dom.nodeTypes.CollisionSensor
         * @x3d x.x
         * @component X3DSensorNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.CollisionSensor.superClass.call(this, ctx);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.CollisionSensor
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFNode} collider
             * @memberof x3dom.nodeTypes.CollisionSensor
             * @initvalue x3dom.nodeTypes.CollisionCollection
             * @field x3dom
             * @instance
             */
    this.addField_SFNode('collider', x3dom.nodeTypes.CollisionCollection);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.CollisionSensor
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        if(!this._cf.collider.node){
            for(var x in this._xmlNode.children){
                if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.CollisionCollection)){
                    this._cf.collider = this._xmlNode.children[x];
                }
            }
        }
        x3dom.debug.logInfo('CollisionSensor: ');
    }
}));