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
         * @x3d x.x
         * @component Grouping
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3f} center
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             *
             * @var {SFVec3f} translation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             *
             * @var {SFRotation} rotation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             *
             * @var {SFVec3f} scale
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             *
             * @var {SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.Transform
             * @initvalue 0,0,1,0
             * @field x3dom
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