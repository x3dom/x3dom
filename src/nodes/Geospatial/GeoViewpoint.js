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
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DViewpointNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoViewpoint.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} geoSystem
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             *
             * @var {SFFloat} fieldOfView
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0.785398
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'fieldOfView', 0.785398);

            /**
             *
             * @var {SFRotation} orientation
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'orientation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3d} position
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 0,0,100000
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3d(ctx, 'position', 0, 0, 100000);

            /**
             *
             * @var {SFBool} headlight
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             *
             * @var {MFString} navType
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 'EXAMINE'
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'navType', 'EXAMINE');

            /**
             *
             * @var {SFFloat} speedFactor
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'speedFactor', 1.0);

            /**
             *
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoViewpoint
             * @initvalue x3dom.nodeTypes.X3DViewpointNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DViewpointNode);
        
        }
    )
);