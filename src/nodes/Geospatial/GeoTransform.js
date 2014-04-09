/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoTransform ### */
x3dom.registerNodeType(
    "GeoTransform",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for GeoTransform
         * @constructs x3dom.nodeTypes.GeoTransform
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoTransform.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3d} geoCenter
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3d(ctx, 'geoCenter', 0, 0, 0);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3f} scale
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             *
             * @var {SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             *
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue x3dom.nodeTypes.Transform
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.Transform);

            /**
             *
             * @var {MFString} geoSystem
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
        
        }
    )
);