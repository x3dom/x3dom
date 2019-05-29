/** @namespace x3dom.nodeTypes */
/*
 * MEDX3DOM JavaScript Library
 * http://medx3dom.org
 *
 * (C)2019 Vicomtech Research Center,
 *         Donostia - San Sebastian
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * http://www.x3dom.org
 */

/* ### MPRPlane ### */
x3dom.registerNodeType(
    "MPRPlane",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for a MPRPlane
         * @constructs x3dom.nodeTypes.MPRPlane
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc class for defining an arbitrary plane for the MPRVolumeStyle.
         */
        function (ctx) {
            x3dom.nodeTypes.MPRPlane.superClass.call(this, ctx);

            /**
             * Specifies if the reconstructed plane is visible or not.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.MPRPlane
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * The normal vector of the plane.
             * @var {x3dom.fields.SFVec3f} normal
             * @memberof x3dom.nodeTypes.MPRPlane
             * @initvalue 0.0,1.0,0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'normal', 0.0, 1.0, 0.0);

            /**
             * The position field specifies the position along the plane normal direction where the slice plane is rendered.
             * @var {x3dom.fields.SFFloat} position
             * @memberof x3dom.nodeTypes.MPRPlane
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'position', 0.5);

            this.uniformBooleanEnabled = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformVec3fNormal = new x3dom.nodeTypes.Uniform(ctx);
            this.uniformFloatPosition = new x3dom.nodeTypes.Uniform(ctx);
            this._planeID = 0; //To differentiate between plane instances
        },
        {
            nodeChanged: function () {
                if(!this._planeID) {
                    this._planeID = ++x3dom.nodeTypes.MPRPlane.planeID;
                }
            },
            fieldChanged: function(fieldName) {
                 switch(fieldName){
                    case 'enabled':
                        this.uniformBooleanEnabled._vf.value = this._vf.enabled.toString();
                        this.uniformBooleanEnabled.fieldChanged("value");
                        break;
                    case 'position':
                        this.uniformFloatPosition._vf.value = Math.min(Math.max(this._vf.position, 0.001), 0.999);
                        this.uniformFloatPosition.fieldChanged("value");
                        break;
                    case 'normal':
                        this.uniformVec3fNormal._vf.value = this._vf.normal;
                        this.uniformVec3fNormal.fieldChanged("value");
                        break;
                }
            },
            uniforms: function(){
                var unis = [];

                this.uniformBooleanEnabled._vf.name = 'enabledPlane'+this._planeID;
                this.uniformBooleanEnabled._vf.type = 'SFBool';
                this.uniformBooleanEnabled._vf.value = this._vf.enabled;
                unis.push(this.uniformBooleanEnabled);

                this.uniformVec3fNormal._vf.name = 'normalPlane'+this._planeID;
                this.uniformVec3fNormal._vf.type = 'SFVec3f';
                this.uniformVec3fNormal._vf.value = this._vf.normal;
                unis.push(this.uniformVec3fNormal);

                this.uniformFloatPosition._vf.name = 'positionPlane'+this._planeID;
                this.uniformFloatPosition._vf.type = 'SFFloat';
                this.uniformFloatPosition._vf.value = this._vf.position;
                unis.push(this.uniformFloatPosition);
                return unis;
            },
            styleUniformsShaderText: function(){
              var uniformShaderText = "uniform vec3 normalPlane"+this._planeID+";\n"+
              "uniform float positionPlane"+this._planeID+";\n"+
              "uniform bool enabledPlane"+this._planeID+";\n";
              return uniformShaderText;
            },
            styleShaderText: function(){
              var shaderText = "  if(enabledPlane"+this._planeID+"){\n"+
              "   vec3 pointLine"+this._planeID+" = normalPlane"+this._planeID+"*positionPlane"+this._planeID+";\n"+
              "   float d"+this._planeID+" = dot(pointLine"+this._planeID+"-ray_pos,normalPlane"+this._planeID+")/dot(dir,normalPlane"+this._planeID+");\n"+
              "   float f"+this._planeID+" = step(0.0, d"+this._planeID+");\n"+
              "   d"+this._planeID+" = (1.0 - f"+this._planeID+") * 1000.0 + f"+this._planeID+" * d"+this._planeID+";\n"+
              "   d = min(d"+this._planeID+",d);\n"+
              "  }\n";
              return shaderText;
            }
        }
    )
);

/** Static class ID counter (needed to allow duplicate planes) */
x3dom.nodeTypes.MPRPlane.planeID = 0;
