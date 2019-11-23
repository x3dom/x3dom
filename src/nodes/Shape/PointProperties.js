/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
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
         * @classdesc The PointProperties node specifies additional properties to be applied to all points.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.PointProperties.superClass.call( this, ctx );

            // https://www.web3d.org/specifications/X3dSchemaDocumentation4.0/x3d-4.0_PointProperties.html

            /**
             * Nominal rendered point size is a browser-dependent minimum renderable point size, which is then multiplied by an additional (greater than or equal to 1.0) pointSizeScaleFactor.
             * Hint: Additional sizing modifications are determined by pointSizeMinValue, pointSizeMaxValue, and pointSizeAttenuation array.
             *
             * @var {x3dom.fields.SFFloat} pointSizeScaleFactor
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeScaleFactor", 1 );

            /**
             * PointSizeMinValue is minimum allowed scaling factor on nominal browser point scaling.
             * Warning: Maintain pointSizeMinValue <= pointSizeMaxValue.
             *
             * @var {x3dom.fields.SFFloat} pointSizeMinValue
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeMinValue", 1 );

            /**
             * PointSizeMaxValue is maximum allowed scaling factor on nominal browser point scaling.
             * Warning: Maintain pointSizeMinValue <= pointSizeMaxValue.
             *
             * @var {x3dom.fields.SFFloat} pointSizeMaxValue
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeMaxValue", 1 );

            /**
             * PointSizeAttenuation array values [a, b, c] are set to default values if undefined. Together these parameters define attenuation factor 1/(a + b×r + c×r^2) where r is the distance from observer position (current viewpoint) to each point.
             * Hint: Nominal point size is multiplied by attenuation factor and then clipped to a minimum value of pointSizeMinValue × minimum renderable point size, then clipped to maximum size of pointSizeMaxValue × minimum renderable point size.
             *
             * @var {x3dom.fields.MFFloat} pointSizeAttenuation
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue 1 0 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "pointSizeAttenuation", 1 );

            /**
             * ColorMode has blending effect on the rendering of point sprites, applying supplied color (Color node or Material emissiveColor) and texture color.
             * Hint:
             * POINT_COLOR shall display the RGB channels of the color instance defined in X3DMaterialNode or X3DColorNode, and the A channel of the texture if any. If no color is associated to the point, the default RGB color (0, 0, 0) shall be used.
             * TEXTURE_COLOR shall display the original texture with its RGBA channels and regardless to the X3DMaterialNode or X3DColorNode which might be associated to the point set.
             * TEXTURE_AND_POINT_COLOR shall display the RGBA channels of a texture added to the RGB channels of the color defined in X3DMaterialNode or X3DColorNode node, and the A channel of the texture if any. If no color is associated to the point, the result shall be exactly the same as TEXTURE_COLOR.
             *
             * @var {["POINT_COLOR", "TEXTURE_COLOR", "TEXTURE_AND_POINT_COLOR"]} colorMode
             * @memberof x3dom.nodeTypes.PointProperties
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "colorMode", "TEXTURE_AND_POINT_COLOR" );
        }
    )
);