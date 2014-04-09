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
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoPositionInterpolator.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} geoSystem
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             *
             * @var {MFVec3d} keyValue
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3d(ctx, 'keyValue', []);

            /**
             *
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue x3dom.nodeTypes.X3DInterpolatorNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DInterpolatorNode);
        
        }
    )
);