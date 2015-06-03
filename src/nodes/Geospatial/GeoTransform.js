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
    defineClass(x3dom.nodeTypes.X3DTransformNode, //should be X3DGroupingNode but more convenient
        
        /**
         * Constructor for GeoTransform
         * @constructs x3dom.nodeTypes.GeoTransform
         * @x3d 3.3
         * @component Geospatial
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoTransform node is a grouping node that defines a coordinate system for its children to support the translation and orientation of geometry built using GeoCoordinate nodes within the local world coordinate system.
         * The X-Z plane of a GeoTransform coordinate system is tangent to the ellipsoid of the spatial reference frame at the location specified by the geoCenter field.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoTransform.superClass.call(this, ctx);


            /**
             * The geoCenter field specifies, in the spatial reference frame specified by the geoSystem field, the location at which the local coordinate system is centered.
             * @var {x3dom.fields.SFVec3d} geoCenter
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3d(ctx, 'geoCenter', 0, 0, 0);

            /**
             * Defines the rotation component of the transformation.
             * @var {x3dom.fields.SFRotation} rotation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             * Defines the scale component of the transformation.
             * @var {x3dom.fields.SFVec3f} scale
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             * The scaleOrientation specifies a rotation of the coordinate system before the scale (to specify scales in arbitrary orientations).
             * The scaleOrientation applies only to the scale operation.
             * @var {x3dom.fields.SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

            /**
             * The translation field specifies a translation to the coordinate system.
             * @var {x3dom.fields.SFVec3f} translation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue x3dom.nodeTypes.Transform
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.Transform);

            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
        
            // P' = T * C * R * SR * S * -SR * -C * P
            this._trafo = x3dom.fields.SFMatrix4f.translation(
                this._vf.translation.add(this._vf.center)).
                mult(this._vf.rotation.toMatrix()).
                mult(this._vf.scaleOrientation.toMatrix()).
                mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                mult(this._vf.scaleOrientation.toMatrix().inverse()).
                mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
        
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "center" || fieldName == "translation" ||
                    fieldName == "rotation" || fieldName == "scale" ||
                    fieldName == "scaleOrientation")
                {
                    // P' = T * C * R * SR * S * -SR * -C * P
                    this._trafo = x3dom.fields.SFMatrix4f.translation(
                        this._vf.translation.add(this._vf.center)).
                        mult(this._vf.rotation.toMatrix()).
                        mult(this._vf.scaleOrientation.toMatrix()).
                        mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                        mult(this._vf.scaleOrientation.toMatrix().inverse()).
                        mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));

                    this.invalidateVolume();
                    //this.invalidateCache();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
        }
    )
);
