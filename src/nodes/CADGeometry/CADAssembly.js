/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


// ### CADAssembly ###
x3dom.registerNodeType(
    "CADAssembly",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for CADAssembly
         * @constructs x3dom.nodeTypes.CADAssembly
         * @x3d x.x
         * @component CADGeometry
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.CADAssembly.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.CADAssembly
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);