/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoOrigin ### */
x3dom.registerNodeType(
    "GeoOrigin",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for GeoOrigin
         * @constructs x3dom.nodeTypes.GeoOrigin
         * @x3d 3.2
         * @component Geospatial
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoOrigin node defines an absolute geospatial location and an implicit local coordinate frame against which geometry is referenced.
         * This node is used to translate from geographical coordinates into a local Cartesian coordinate system which can be managed by the X3D browser. This node is deprecated as of X3D 3.3
         */
        function (ctx) {
            x3dom.nodeTypes.GeoOrigin.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The geoCoords field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFVec3d} geoCoords
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);

            /**
             * The rotateYUp field is used to specify whether coordinates of nodes that use this GeoOrigin are to be rotated such that their up direction is aligned with the X3D Y axis.
             * The default behavior is to not perform this operation.
             * @var {x3dom.fields.SFBool} rotateYUp
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'rotateYUp', false);
        
        }
    )
);