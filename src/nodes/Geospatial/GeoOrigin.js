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
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoOrigin.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} geoSystem
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             *
             * @var {SFVec3d} geoCoords
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3d(ctx, 'geoCoords', 0, 0, 0);

            /**
             *
             * @var {SFBool} rotateYUp
             * @memberof x3dom.nodeTypes.GeoOrigin
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'rotateYUp', false);
        
        }
    )
);