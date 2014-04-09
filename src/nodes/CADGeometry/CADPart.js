/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### CADPart ###
// According to the CADGeometry specification,
// the CADPart node has transformation fields identical to
// those used in the Transform node, therefore just inherit it
x3dom.registerNodeType(
    "CADPart",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for CADPart
         * @constructs x3dom.nodeTypes.CADPart
         * @x3d x.x
         * @component CADGeometry
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.CADPart.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.CADPart
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);