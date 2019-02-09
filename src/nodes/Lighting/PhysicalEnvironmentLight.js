/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### DirectionalLight ### */
x3dom.registerNodeType(
    "PhysicalEnvironmentLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        
        /**
         * Constructor for PhysicalEnvironmentLight
         * @constructs x3dom.nodeTypes.PhysicalEnvironmentLight
         * @x3d x.x
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc 
         */
        function (ctx) {
            x3dom.nodeTypes.PhysicalEnvironmentLight.superClass.call(this, ctx);

            /**
             * The direction field specifies the direction vector of the illumination emanating from the light source in the local coordinate system.
             * @var {x3dom.fields.SFVec3f} direction
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue 0,0,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);

            /**
             * 
             * The diffuse component of the environment light.
             * The node supports only pre-computed HDR .dds files and these should be linear by default.
             * @var {x3dom.nodeTypes.X3DTextureNode} diffuse
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue papermillDiffuse.dds
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'diffuse', "https://x3dom.org/download/assets/pbr/papermillDiffuse.dds");

            /**
             *
             * The specular component of the environment light.
             * The node supports only pre-computed HDR .dds files and these should be linear by default.
             * @var {x3dom.nodeTypes.X3DTextureNode} specular
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue papermillSpecular.dds
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'specular', "https://x3dom.org/download/assets/pbr/papermillSpecular.dds");

            /**
             *
             * @var {x3dom.fields.SFInt32} shadowCascades
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowCascades', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitFactor
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitOffset
             * @memberof x3dom.nodeTypes.PhysicalEnvironmentLight
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitOffset', 0.1);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "diffuse" || fieldName == "specular") {
                    //this.invalidateGLObject();
                }
            },

            getViewMatrix: function(vec) {
                var dir = this.getCurrentTransform().multMatrixVec(this._vf.direction).normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                    new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(vec.negate()));
            }
        }
    )
);
