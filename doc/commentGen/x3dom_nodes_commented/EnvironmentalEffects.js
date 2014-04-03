/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### X3DBackgroundNode ### */
x3dom.registerNodeType(
    "X3DBackgroundNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DBackgroundNode
         * @constructs x3dom.nodeTypes.X3DBackgroundNode
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} withCredentials
             * @memberof x3dom.nodeTypes.X3DBackgroundNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'withCredentials', false);
            
            this._dirty = true;
        
        },
        {
            getSkyColor: function() {
                return new x3dom.fields.SFColor(0,0,0);
            },
            getTransparency: function() {
                return 0;
            },
            getTexUrl: function() {
                return [];
            }
        }
    )
);

/* ### X3DFogNode ### */
x3dom.registerNodeType(
    "X3DFogNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DFogNode
         * @constructs x3dom.nodeTypes.X3DFogNode
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DFogNode.superClass.call(this, ctx);
        
        },
        {
        }
    )
);

/* ### Fog ### */
x3dom.registerNodeType(
    "Fog",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DFogNode,
        
        /**
         * Constructor for Fog
         * @constructs x3dom.nodeTypes.Fog
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFogNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);


            /**
             *
             * @var {SFColor} color
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             *
             * @var {SFString} fogType
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue "LINEAR"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'fogType', "LINEAR");

            /**
             *
             * @var {SFFloat} visibilityRange
             * @memberof x3dom.nodeTypes.Fog
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityRange', 0);
        
        },
        {
        }
    )
);


/* ### Background ### */
x3dom.registerNodeType(
    "Background",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBackgroundNode,
        
        /**
         * Constructor for Background
         * @constructs x3dom.nodeTypes.Background
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBackgroundNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);

            var trans = (ctx && ctx.autoGen) ? 1 : 0;


            /**
             *
             * @var {MFColor} skyColor
             * @memberof x3dom.nodeTypes.Background
             * @initvalue [newx3dom.fields.SFColor(0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_MFColor(ctx, 'skyColor', [new x3dom.fields.SFColor(0,0,0)]);

            /**
             *
             * @var {MFFloat} skyAngle
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'skyAngle', []);

            /**
             *
             * @var {MFColor} groundColor
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFColor(ctx, 'groundColor', []);

            /**
             *
             * @var {MFFloat} groundAngle
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'groundAngle', []);

            /**
             *
             * @var {SFFloat} transparency
             * @memberof x3dom.nodeTypes.Background
             * @initvalue trans
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'transparency', trans);

            /**
             *
             * @var {MFString} backUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'backUrl', []);

            /**
             *
             * @var {MFString} bottomUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'bottomUrl', []);

            /**
             *
             * @var {MFString} frontUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'frontUrl', []);

            /**
             *
             * @var {MFString} leftUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'leftUrl', []);

            /**
             *
             * @var {MFString} rightUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'rightUrl', []);

            /**
             *
             * @var {MFString} topUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'topUrl', []);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("Url") > 0 || fieldName == "transparency" ||
                    fieldName.search("sky") >= 0 || fieldName.search("ground") >= 0) {
                    this._dirty = true;
                }
                else if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            getSkyColor: function() {
                return this._vf.skyColor;
            },

            getGroundColor: function() {
                return this._vf.groundColor;
            },

            getTransparency: function() {
                return this._vf.transparency;
            },

            getTexUrl: function() {
                return [
                    this._nameSpace.getURL(this._vf.backUrl[0]),
                    this._nameSpace.getURL(this._vf.frontUrl[0]),
                    this._nameSpace.getURL(this._vf.bottomUrl[0]),
                    this._nameSpace.getURL(this._vf.topUrl[0]),
                    this._nameSpace.getURL(this._vf.leftUrl[0]),
                    this._nameSpace.getURL(this._vf.rightUrl[0])
                ];
            }
        }
    )
);

/* ### X3DEnvironmentNode ### */
x3dom.registerNodeType(
    "X3DEnvironmentNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DEnvironmentNode
         * @constructs x3dom.nodeTypes.X3DEnvironmentNode
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DEnvironmentNode.superClass.call(this, ctx);
        
        }
    )
);

/* ### Environment ### */
x3dom.registerNodeType(
    "Environment",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DEnvironmentNode,
        
        /**
         * Constructor for Environment
         * @constructs x3dom.nodeTypes.Environment
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Environment.superClass.call(this, ctx);

            // If TRUE, transparent objects are sorted from back to front (allows explicitly disabling sorting)

            /**
             *
             * @var {SFBool} sortTrans
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'sortTrans', true);

            // Transparent objects like glass do not throw much shadow, enable this IR convenience flag with TRUE

            /**
             *
             * @var {SFBool} shadowExcludeTransparentObjects
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'shadowExcludeTransparentObjects', false);
            
            // The gamma correction to apply by default, see lighting and gamma tutorial

            /**
             *
             * @var {SFString} gammaCorrectionDefault
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue "none"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'gammaCorrectionDefault', "none"); //"linear");

            // boolean flags for feature (de)activation
            // If TRUE, objects outside the viewing frustum are ignored

            /**
             *
             * @var {SFBool} frustumCulling
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'frustumCulling', true);

            // If TRUE, objects smaller than the threshold below are ignored

            /**
             *
             * @var {SFBool} smallFeatureCulling
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'smallFeatureCulling', false);

            /**
             *
             * @var {SFFloat} smallFeatureThreshold
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'smallFeatureThreshold', 1.0);

            // defaults can be >0 since only used upon activation

            /**
             *
             * @var {SFBool} occlusionCulling
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'occlusionCulling', false);

            /**
             *
             * @var {SFFloat} occlusionVisibilityThreshold
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'occlusionVisibilityThreshold', 0.0);

            // previously was scaleRenderedIdsOnMove; percentage of objects to be rendered, in [0,1]

            /**
             *
             * @var {SFBool} lowPriorityCulling
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'lowPriorityCulling', false);

            /**
             *
             * @var {SFFloat} lowPriorityThreshold
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'lowPriorityThreshold', 1.0);     // 1.0 means everything is rendered

            // shape tesselation is lowered as long as resulting error is lower than threshold

            /**
             *
             * @var {SFBool} tessellationDetailCulling
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'tessellationDetailCulling', false);

            /**
             *
             * @var {SFFloat} tessellationErrorThreshold
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'tessellationErrorThreshold', 0.0);

            // experimental If true ARC adjusts rendering parameters

            /**
             *
             * @var {SFBool} enableARC
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enableARC', false);
            // define frame-rate range for quality-speed trade-off (experimental)

            /**
             *
             * @var {SFFloat} minFrameRate
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'minFrameRate',  1.0);

            /**
             *
             * @var {SFFloat} maxFrameRate
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue 62.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxFrameRate', 62.5);

            // 4 exp. factors for controlling speed-performance trade-off
            // factors could be in [0, 1] (and not evaluated if -1)

            /**
             *
             * @var {SFFloat} userDataFactor
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'userDataFactor', -1);

            /**
             *
             * @var {SFFloat} smallFeatureFactor
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'smallFeatureFactor', -1);

            /**
             *
             * @var {SFFloat} occlusionVisibilityFactor
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'occlusionVisibilityFactor', -1);

            /**
             *
             * @var {SFFloat} lowPriorityFactor
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'lowPriorityFactor', -1);

            /**
             *
             * @var {SFFloat} tessellationErrorFactor
             * @memberof x3dom.nodeTypes.Environment
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'tessellationErrorFactor', -1);

            this._validGammaCorrectionTypes = [
                "none", "fastlinear", "linear"
            ];

            // init internal stuff (but should be called each frame)
            this.checkSanity();
        
        },
        {
            checkSanity: function()
            {
                var checkParam = function(flag, value, defaultOn, defaultOff)
                {
                    if(flag && (value == defaultOff))
                        return defaultOn;

                    if(!flag && (value != defaultOff))
                        return defaultOff;
                    return value;
                };
                
                this._smallFeatureThreshold = checkParam(this._vf.smallFeatureCulling,
                                                         this._vf.smallFeatureThreshold, 10, 0); // cull objects < 10 px
                this._lowPriorityThreshold = checkParam(this._vf.lowPriorityCulling,
                                                        this._vf.lowPriorityThreshold, 0.5, 1);  // 1 means 100% visible
                this._occlusionVisibilityThreshold = checkParam(this._vf.occlusionCulling,
                                                                this._vf.occlusionVisibilityThreshold, 1, 0);
                this._tessellationErrorThreshold = checkParam(this._vf.tessellationDetailCulling,
                                                              this._vf.tessellationErrorThreshold, 1, 0);
                
                var checkGamma = function(field, that) {
                    field = field.toLowerCase();

                    if (that._validGammaCorrectionTypes.indexOf(field) > -1) {
                        return field;
                    }
                    else {
                        x3dom.debug.logWarning(field + " gammaCorrectionDefault may only be linear, fastLinear, or none (default)");
                        return that._validGammaCorrectionTypes[0];
                    }
                };
                
                this._vf.gammaCorrectionDefault = checkGamma(this._vf.gammaCorrectionDefault, this);
            }
        }
    )
);
