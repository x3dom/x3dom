/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// Not a real X3D node type
// ### Scene ###
x3dom.registerNodeType(
    "Scene",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for Scene
         * @constructs x3dom.nodeTypes.Scene
         * @x3d x.x
         * @component Core
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The scene node wraps the x3d scene.
         */
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);

            // define the experimental picking mode: box, idBuf, idBuf24, idBufId, color, texCoord

            /**
             * The picking mode for the scene
             * @var {x3dom.fields.SFString} pickMode
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "idBuf"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'pickMode', "idBuf");
            // experimental field to switch off picking

            /**
             * Flag to enable/disable pick pass
             * @var {x3dom.fields.SFBool} doPickPass
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'doPickPass', true);

            // another experimental field for shadow DOM remapping

            /**
             * The url of the shadow object id mapping
             * @var {x3dom.fields.SFString} shadowObjectIdMapping
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'shadowObjectIdMapping', "");

            this._lastMin = new x3dom.fields.SFVec3f(0, 0, 0);
            this._lastMax = new x3dom.fields.SFVec3f(1, 1, 1);

            this._shadowIdMap = null;
            this.loadMapping();

            this._multiPartMap = null;
            
            /**
             * Flag to enable Screen Space Ambient Occlusion
             * @var {x3dom.fields.SFBool} SSAO
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "false"
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'SSAO', false);

            /**
             * Value that determines the radius in which the SSAO is sampled in world space
             * @var {x3dom.fields.SFFloat} SSAOradius
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "4"
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'SSAOradius',0.7);

            /**
             * Value that determines the amount of contribution of SSAO (from 0 to 1)
             * @var {x3dom.fields.SFFloat} SSAOamount
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "1.0"
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'SSAOamount',0.3);

            /**
             * Value that determines the size of the random texture used for sparse sampling of SSAO
             * @var {x3dom.fields.SFFloat} SSAOrandomTextureSize
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "4"
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'SSAOrandomTextureSize',4);

            /**
             * Value that determines the maximum depth difference for the SSAO blurring pass.
             * Pixels with higher depth difference to the filer kernel center are not incorporated into the average.
             * @var {x3dom.fields.SFFloat} SSAOblurDepthTreshold
             * @memberof x3dom.nodeTypes.Scene
             * @initvalue "5"
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'SSAOblurDepthTreshold',1);
        
        },
        {
            /* Bindable getter (e.g. getViewpoint) are added automatically */

            fieldChanged: function(fieldName)
            {
                if (fieldName == "shadowObjectIdMapping")
                {
                    this.loadMapping();
                }
                else if (fieldName == "SSAO")
                {
                    this._nameSpace.doc.needRender = true;
                }
            },

            updateVolume: function()
            {
                var vol = this.getVolume();

                if (vol.isValid())
                {
                    this._lastMin = x3dom.fields.SFVec3f.copy(vol.min);
                    this._lastMax = x3dom.fields.SFVec3f.copy(vol.max);
                }
            },

            loadMapping: function()
            {
                this._shadowIdMap = null;

                if (this._vf.shadowObjectIdMapping.length == 0) {
                    return;
                }

                var that = this;
                var xhr = new XMLHttpRequest();

                xhr.open("GET", this._nameSpace.getURL(this._vf.shadowObjectIdMapping), true);
                xhr.send();

                xhr.onload = function()
                {
                    that._shadowIdMap = eval("(" + xhr.response + ")");

                    if (!that._shadowIdMap || !that._shadowIdMap.mapping) {
                        x3dom.debug.logWarning("Invalid ID map: " + that._vf.shadowObjectIdMapping);
                    }
                    else {
                        x3dom.debug.assert(that._shadowIdMap.maxID <= that._shadowIdMap.mapping.length,
                                "Too few ID map entries in " + that._vf.shadowObjectIdMapping + ", " +
                                "length of mapping array is only " + that._shadowIdMap.mapping.length +
                                " instead of " + that._shadowIdMap.ids.length + "!");
                    }
                };
            }
        }
    )
);
