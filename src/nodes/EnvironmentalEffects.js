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
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);

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
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFString(ctx, 'fogType', "LINEAR");
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
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);

            var trans = (ctx && ctx.autoGen) ? 1 : 0;

            this.addField_MFColor(ctx, 'skyColor', [new x3dom.fields.SFColor(0,0,0)]);
            this.addField_MFFloat(ctx, 'skyAngle', []);
            this.addField_MFColor(ctx, 'groundColor', []);
            this.addField_MFFloat(ctx, 'groundAngle', []);
            this.addField_SFFloat(ctx, 'transparency', trans);
            this.addField_MFString(ctx, 'backUrl', []);
            this.addField_MFString(ctx, 'bottomUrl', []);
            this.addField_MFString(ctx, 'frontUrl', []);
            this.addField_MFString(ctx, 'leftUrl', []);
            this.addField_MFString(ctx, 'rightUrl', []);
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
        function (ctx) {
            x3dom.nodeTypes.Environment.superClass.call(this, ctx);

            // If TRUE, transparent objects are sorted from back to front (allows explicitly disabling sorting)
            this.addField_SFBool(ctx, 'sortTrans', true);

            // Transparent objects like glass do not throw much shadow, enable this IR convenience flag with TRUE
            this.addField_SFBool(ctx, 'shadowExcludeTransparentObjects', false);
            
            // The gamma correction to apply by default, see lighting and gamma tutorial
            this.addField_SFString(ctx, 'gammaCorrectionDefault', "none"); //"linear");

            // boolean flags for feature (de)activation
            // If TRUE, objects outside the viewing frustum are ignored
            this.addField_SFBool(ctx, 'frustumCulling', true);

            // If TRUE, objects smaller than the threshold below are ignored
            this.addField_SFBool(ctx, 'smallFeatureCulling', false);
            this.addField_SFFloat(ctx, 'smallFeatureThreshold', 1.0);

            // defaults can be >0 since only used upon activation
            this.addField_SFBool(ctx, 'occlusionCulling', false);
            this.addField_SFFloat(ctx, 'occlusionVisibilityThreshold', 0.0);

            // previously was scaleRenderedIdsOnMove; percentage of objects to be rendered, in [0,1]
            this.addField_SFBool(ctx, 'lowPriorityCulling', false);
            this.addField_SFFloat(ctx, 'lowPriorityThreshold', 1.0);     // 1.0 means everything is rendered

            // shape tesselation is lowered as long as resulting error is lower than threshold
            this.addField_SFBool(ctx, 'tessellationDetailCulling', false);
            this.addField_SFFloat(ctx, 'tessellationErrorThreshold', 0.0);

            // experimental If true ARC adjusts rendering parameters
            this.addField_SFBool(ctx, 'enableARC', false);
            // define frame-rate range for quality-speed trade-off (experimental)
            this.addField_SFFloat(ctx, 'minFrameRate',  1.0);
            this.addField_SFFloat(ctx, 'maxFrameRate', 62.5);

            // 4 exp. factors for controlling speed-performance trade-off
            // factors could be in [0, 1] (and not evaluated if -1)
            this.addField_SFFloat(ctx, 'userDataFactor', -1);
            this.addField_SFFloat(ctx, 'smallFeatureFactor', -1);
            this.addField_SFFloat(ctx, 'occlusionVisibilityFactor', -1);
            this.addField_SFFloat(ctx, 'lowPriorityFactor', -1);
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
