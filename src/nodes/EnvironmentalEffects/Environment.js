/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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