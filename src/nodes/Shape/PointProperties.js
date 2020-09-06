/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2020 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PointProperties ### */
x3dom.registerNodeType(
    "PointProperties",
    "Shape",
    defineClass( x3dom.nodeTypes.X3DAppearanceChildNode,

        /**
         * Constructor for PointProperties
         * @constructs x3dom.nodeTypes.PointProperties
         * @x3d 3.3
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PointProperties node specifies additional properties to be applied to all point geometry.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.PointProperties.superClass.call( this, ctx );

            /**
             SFFloat  [in,out] pointSizeScaleFactor  1 [1,∞)
             SFFloat  [in,out] pointSizeMinValue     1 [0,∞)
             SFFloat  [in,out] pointSizeMaxValue     1 [0,∞)
             SFVec3f  [in,out] attenuation  1 0 0 [0,∞)
             */
            /**
             * pointSizeScaleFactor is a value determining the nominal point size before modification by the sizing modifications, as determined by the pointSizeMinValue, pointSizeMaxValue, and pointSizeAttenuation values discussed below. The nominal rendered point size is a browser-dependent minimum renderable point size, multiplied by the pointSizeScaleFactor.
             * @var {x3dom.fields.SFFloat} pointSizeScaleFactor
             * @range [1, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeScaleFactor", 1 );

            /**
             * pointSizeMinValue is minimum allowed scaling factor on nominal browser point scaling. The provided value for pointSizeMinValue must be less than or equal to value for pointSizeMaxValue.
             * @var {x3dom.fields.SFFloat} pointSizeMinValue
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeMinValue", 1 );

            /**
             * pointSizeMaxValue is maximum allowed scaling factor on nominal browser point scaling. The provided value for pointSizeMinValue must be less than or equal to value for pointSizeMaxValue.
             * @var {x3dom.fields.SFFloat} pointSizeMaxValue
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeMaxValue", 1 );

            /**
             * The pointSizeMinValue, pointSizeMaxValue, and pointSizeAttenuation fields specify a depth perception in a point cloud rendering by making points close to the viewer appear larger. The modification of point size depending on distance from the view occurs in two steps, starting with the nominal point size as determined by the pointSizeScaleFactor field.
             * @var {x3dom.fields.SFVec3f} attenuation
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1 0 0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f( ctx, "attenuation", 1, 0, 0 );
        },
        {
            nodeChanged : function ()
            {
                if ( this._vf.pointSizeMinValue > this._vf.pointSizeMaxValue )
                {
                    x3dom.debug.logWarning( "pointSizeMinValue is larger than pointSizeMaxValue, will set to MaxValue" );
                    this._vf.pointSizeMinValue = this._vf.pointSizeMaxValue;
                }
            },
            fieldChanged : function ( fieldName )
            {
                this._nodeChanged();
            }
        }
    )
);
