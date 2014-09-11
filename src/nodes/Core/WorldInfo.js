/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### WorldInfo ### */
x3dom.registerNodeType(
    "WorldInfo",
    "Core",
    defineClass(x3dom.nodeTypes.X3DInfoNode,
        
        /**
         * Constructor for WorldInfo
         * @constructs x3dom.nodeTypes.WorldInfo
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The WorldInfo node contains information about the world. This node is strictly for documentation
         * purposes and has no effect on the visual appearance or behaviour of the world.
         */
        function (ctx) {
            x3dom.nodeTypes.WorldInfo.superClass.call(this, ctx);


            /**
             * The title field is intended to store the name or title of the world so that browsers can present this to
             * the user (perhaps in the window border).
             * @var {x3dom.fields.MFString} info
             * @memberof x3dom.nodeTypes.WorldInfo
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'info', []);

            /**
             * Information about the world can be stored in the info field, such as author information, copyright, and
             * usage instructions.
             * @var {x3dom.fields.SFString} title
             * @memberof x3dom.nodeTypes.WorldInfo
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'title', "");

            x3dom.debug.logInfo(this._vf.info);
            x3dom.debug.logInfo(this._vf.title);
        
        }
    )
);