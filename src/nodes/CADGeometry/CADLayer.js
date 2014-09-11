/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### CADLayer ###
x3dom.registerNodeType(
    "CADLayer",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for CADLayer
         * @constructs x3dom.nodeTypes.CADLayer
         * @x3d 3.3
         * @component CADGeometry
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The CADLayer node defines a hierarchy of nodes used for showing layer structure for the CAD model.
         */
        function (ctx) {
            x3dom.nodeTypes.CADLayer.superClass.call(this, ctx);

            /**
             * The name field describes the content of the layer.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.CADLayer
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx,'name', "");
            // to be implemented: the 'visible' field
            // there already is a 'render' field defined in base class
            // which basically defines visibility...
            // NOTE: bbox stuff also already defined in a base class!
        
        }
    )
);
