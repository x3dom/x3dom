/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DLightNode ### */
x3dom.registerNodeType(
    "X3DLightNode",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DLightNode
         * @constructs x3dom.nodeTypes.X3DLightNode
         * @x3d 3.3
         * @component Lighting
         * @status full
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DLightNode abstract node type is the base type from which all node types that serve as light sources are derived.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DLightNode.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.lights.push(this);
            else
                x3dom.debug.logWarning("X3DLightNode: No runtime context found!");

            this._lightID = 0;
            this._dirty = true;


            /**
             * The ambientIntensity specifies the intensity of the ambient emission from the light. Light intensity may range from 0.0 (no light emission) to 1.0 (full intensity).
             * @var {x3dom.fields.SFFloat} ambientIntensity
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'ambientIntensity', 0);

            /**
             * The color field specifies the spectral colour properties of both the direct and ambient light emission as an RGB value.
             * @var {x3dom.fields.SFColor} color
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             * The intensity field specifies the brightness of the direct emission from the light. Light intensity may range from 0.0 (no light emission) to 1.0 (full intensity).
             * @var {x3dom.fields.SFFloat} intensity
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'intensity', 1);

            /**
             * Specifies whether the light is global or scoped.
             * Global lights illuminate all objects that fall within their volume of lighting influence.
             * Scoped lights only illuminate objects that are in the same transformation hierarchy as the light; i.e., only the children and descendants of its enclosing parent group are illuminated.
             * @var {x3dom.fields.SFBool} global
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'global', false);

            /**
             * The on field specifies whether the light is enabled or disabled.
             * @var {x3dom.fields.SFBool} on
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'on', true);

            /**
             * Defines the attenuation of the shadows
             * @var {x3dom.fields.SFFloat} shadowIntensity
             * @range [o, 1]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowIntensity', 0);

            /**
             * Specifies the resolution of the used shadow map.
             * @var {x3dom.fields.SFInt32} shadowMapSize
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1024
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowMapSize', 1024);

            /**
             * Sets the smoothness of the shadow umbra.
             * @var {x3dom.fields.SFInt32} shadowFilterSize
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowFilterSize', 0);

            /**
             * Defines the shadow offset for the back projection of the shadow map.
             * @var {x3dom.fields.SFFloat} shadowOffset
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowOffset', 0);

            /**
             * Specifies the placement of the near plane of the light projection.
             * Objects that are closer to the light source than the near plane do not cast shadows.
             * If the zNear value is not set, the near plane is placed automatically.
             * @var {x3dom.fields.SFFloat} zNear
             * @range -1 or [0, inf]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNear', -1);

            /**
             * Specifies the placement of the far plane of the light projection.
             * Objects that are farther away from the light source than the far plane do not cast shadows.
             * If the zFar value is not set, the far plane is placed automatically.
             * @var {x3dom.fields.SFFloat} zFar
             * @range -1 or [0, inf]
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFar', -1);
        
        },
        {
            getViewMatrix: function(vec) {
                return x3dom.fields.SFMatrix4f.identity;
            },

            nodeChanged: function () {
                if(!this._lightID) {
                    this._lightID = ++x3dom.nodeTypes.X3DLightNode.lightID;
                }
            },

            fieldChanged: function(fieldName)
            {
                if (this._vf.hasOwnProperty(fieldName)) {
                    this._dirty = true;
                }
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 1 && this._parentNodes[0] == parent) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.lights.length; i<n; i++) {
                        if (doc._nodeBag.lights[i] === this) {
                            doc._nodeBag.lights.splice(i, 1);
                        }
                    }
                }
            },
            onRemove: function()
            {
                //console.log("remove");
            }
        }
    )
);

/** Static class ID counter (needed for flash performance up) */
x3dom.nodeTypes.X3DLightNode.lightID = 0;
