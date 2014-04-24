/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureTransform ### */
x3dom.registerNodeType(
    "TextureTransform",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureTransformNode,
        
        /**
         * Constructor for TextureTransform
         * @constructs x3dom.nodeTypes.TextureTransform
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TextureTransform node defines a 2D transformation that is applied to texture coordinates. This node affects the way textures coordinates are applied to the geometric surface. The transformation consists of (in order):
         * a translation; a rotation about the centre point; a non-uniform scale about the centre point.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureTransform.superClass.call(this, ctx);


            /**
             * The center field specifies a translation offset in texture coordinate space about which the rotation and scale fields are applied.
             * @var {x3dom.fields.SFVec2f} center
             * @memberof x3dom.nodeTypes.TextureTransform
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'center', 0, 0);

            /**
             * The rotation field specifies a rotation in angle base units of the texture coordinates about the center point after the scale has been applied.
             * A positive rotation value makes the texture coordinates rotate counterclockwise about the centre, thereby rotating the appearance of the texture itself clockwise.
             * @var {x3dom.fields.SFFloat} rotation
             * @memberof x3dom.nodeTypes.TextureTransform
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'rotation', 0);

            /**
             * The scale field specifies a scaling factor in S and T of the texture coordinates about the center point.
             * @var {x3dom.fields.SFVec2f} scale
             * @memberof x3dom.nodeTypes.TextureTransform
             * @initvalue 1,1
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'scale', 1, 1);

            /**
             * The translation field specifies a translation of the texture coordinates.
             * @var {x3dom.fields.SFVec2f} translation
             * @memberof x3dom.nodeTypes.TextureTransform
             * @initvalue 0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec2f(ctx, 'translation', 0, 0);

            //Tc' = -C * S * R * C * T * Tc
            var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
            var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
            var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
            var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);

            this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
        
        },
        {
            fieldChanged: function (fieldName) {
                //Tc' = -C * S * R * C * T * Tc
                if (fieldName == 'center' || fieldName == 'rotation' ||
                    fieldName == 'scale' || fieldName == 'translation') {

                    var negCenter = new x3dom.fields.SFVec3f(-this._vf.center.x, -this._vf.center.y, 1);
                    var posCenter = new x3dom.fields.SFVec3f(this._vf.center.x, this._vf.center.y, 0);
                    var trans3 = new x3dom.fields.SFVec3f(this._vf.translation.x, this._vf.translation.y, 0);
                    var scale3 = new x3dom.fields.SFVec3f(this._vf.scale.x, this._vf.scale.y, 0);

                    this._trafo = x3dom.fields.SFMatrix4f.translation(negCenter).
                        mult(x3dom.fields.SFMatrix4f.scale(scale3)).
                        mult(x3dom.fields.SFMatrix4f.rotationZ(this._vf.rotation)).
                        mult(x3dom.fields.SFMatrix4f.translation(posCenter.add(trans3)));
                }
            },

            texTransformMatrix: function() {
                return this._trafo;
            }
        }
    )
);