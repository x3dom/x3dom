/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### X3DNBodyCollidableNode ###
x3dom.registerNodeType("X3DNBodyCollidableNode", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for X3DNBodyCollidableNode
         * @constructs x3dom.nodeTypes.X3DNBodyCollidableNode
         * @x3d x.x
         * @component X3DChildNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.X3DNBodyCollidableNode.superClass.call(this, ctx);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
    this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'translation', 0,0,0);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.X3DNBodyCollidableNode
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

        },{
    nodeChanged: function(){
        x3dom.debug.logInfo('X3DNBodyCollidableNode: ');
    }
}));