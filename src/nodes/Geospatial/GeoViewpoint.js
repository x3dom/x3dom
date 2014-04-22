/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoViewpoint ### */
x3dom.registerNodeType(
    "GeoViewpoint",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DViewpointNode,
        
        /**
         * Constructor for GeoViewpoint
         * @constructs x3dom.nodeTypes.GeoViewpoint
         * @x3d 3.3
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoViewpoint node allows the specification of a viewpoint in terms of a geospatial coordinate.
         * This node can be used wherever a Viewpoint node can be used and can be combined with Viewpoint nodes in the same scene.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoViewpoint.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * Preferred minimum viewing angle from this viewpoint in radians.
             * Small field of view roughly corresponds to a telephoto lens, large field of view roughly corresponds to a wide-angle lens.
             * Hint: modifying Viewpoint distance to object may be better for zooming.
             * Warning: fieldOfView may not be correct for different window sizes and aspect ratios.
             * Interchange profile hint: this field may be ignored.
             * @var {SFFloat} fieldOfView
             * @range [0, pi]
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0.785398
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);

            /**
             * The orientation fields of the Viewpoint node specifies relative orientation to the default orientation.
             * @var {SFRotation} orientation
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);

            /**
             * The position fields of the Viewpoint node specifies a relative location in the local coordinate system. Position is relative to the coordinate system's origin (0,0,0),
             * @var {SFVec3d} position
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,100000
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);

            /**
             * Enable/disable directional light that always points in the direction the user is looking.
             * @var {SFBool} headlight
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             * Specifies the navigation type.
             * @var {MFString} navType
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 'EXAMINE'
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'navType', 'EXAMINE');

            /**
             * The speedFactor field of the GeoViewpoint node is used as a multiplier to the elevation-based velocity that the node sets internally; i.e., this is a relative value and not an absolute speed as is the case for the NavigationInfo node.
             * @var {SFFloat} speedFactor
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'speedFactor', 1.0);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue x3dom.nodeTypes.X3DViewpointNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DViewpointNode);
        
        }
    )
);