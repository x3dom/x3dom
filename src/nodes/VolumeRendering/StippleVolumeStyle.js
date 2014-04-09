/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### StippleVolumeStyle ### */
x3dom.registerNodeType(
    "StippleVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        
        /**
         * Constructor for StippleVolumeStyle
         * @constructs x3dom.nodeTypes.StippleVolumeStyle
         * @x3d x.x
         * @component VolumeRendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DVolumeRenderStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.StippleVolumeStyle.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} distanceFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'distanceFactor', 1);

            /**
             *
             * @var {SFFloat} interiorFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'interiorFactor', 1);

            /**
             *
             * @var {SFFloat} lightingFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'lightingFactor', 1);

            /**
             *
             * @var {SFFloat} gradientThreshold
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0.4
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);

            /**
             *
             * @var {SFFloat} gradientRetainedOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientRetainedOpacity', 1);

            /**
             *
             * @var {SFFloat} gradientBoundaryOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientBoundaryOpacity', 0);

            /**
             *
             * @var {SFFloat} gradientOpacityFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientOpacityFactor', 1);

            /**
             *
             * @var {SFFloat} silhouetteRetainedOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);

            /**
             *
             * @var {SFFloat} silhouetteBoundaryOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);

            /**
             *
             * @var {SFFloat} silhouetteOpacityFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteOpacityFactor', 1);

            /**
             *
             * @var {SFFloat} resolutionFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'resolutionFactor', 1);
        
        }
    )
);