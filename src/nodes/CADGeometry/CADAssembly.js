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
         * @x3d 3.3
         * @component CADGeometry
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CADAssembly node holds a set of assemblies or parts grouped together.
         */
        function (ctx) {
            x3dom.nodeTypes.CADAssembly.superClass.call(this, ctx);


            /**
             * The name field documents the name of this CAD structure.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.CADAssembly
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);