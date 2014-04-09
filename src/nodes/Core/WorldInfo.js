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
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.WorldInfo.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} info
             * @memberof x3dom.nodeTypes.WorldInfo
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'info', []);

            /**
             *
             * @var {SFString} title
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