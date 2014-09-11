/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Transform ###
x3dom.registerNodeType(
    "Transform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        
        /**
         * Constructor for Transform
         * @constructs x3dom.nodeTypes.Transform
         * @x3d 3.3
         * @component Grouping
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Transform node is a grouping node that defines a coordinate system for its children that is relative to the coordinate systems of its ancestors.
         * The translation, rotation, scale, scaleOrientation and center fields define a geometric 3D transformation.
         */
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);


            /**
             * The center field specifies a translation offset from the origin of the local coordinate system (0,0,0).
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**

             * The translation field specifies a translation to the coordinate system.
             * @var {x3dom.fields.SFVec3f} translation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             * The rotation field specifies a rotation of the coordinate system.
             * @var {x3dom.fields.SFRotation} rotation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             * The scale field specifies a non-uniform scale of the coordinate system.
             * Scale values may have any value: positive, negative (indicating a reflection), or zero. A value of zero indicates that any child geometry shall not be displayed.
             * @var {x3dom.fields.SFVec3f} scale
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             * The scaleOrientation specifies a rotation of the coordinate system before the scale (to specify scales in arbitrary orientations).
             * The scaleOrientation applies only to the scale operation.
             * @var {x3dom.fields.SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

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