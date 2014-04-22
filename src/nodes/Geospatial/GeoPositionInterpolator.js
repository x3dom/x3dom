/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoPositionInterpolator ### */
x3dom.registerNodeType(
    "GeoPositionInterpolator",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for GeoPositionInterpolator
         * @constructs x3dom.nodeTypes.GeoPositionInterpolator
         * @x3d 3.0
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoPositionInterpolator node provides an interpolator capability where key values are specified in geographic coordinates and the interpolation is performed within the specified spatial reference frame.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoPositionInterpolator.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The keyValue array is used to contain the actual coordinates and should be provided in a format consistent with that specified for the particular geoSystem.
             * @var {MFVec3d} keyValue
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3d(ctx, 'keyValue', []);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue x3dom.nodeTypes.X3DInterpolatorNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DInterpolatorNode);
        
        }
    )
);