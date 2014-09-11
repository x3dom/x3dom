/** @namespace x3dom.nodeTypes */
/*
 * MEDX3DOM JavaScript Library
 * http://medx3dom.org
 *
 * (C)2011 Vicomtech Research Center,
 *         Donostia - San Sebastian
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * http://www.x3dom.org
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
         * @classdesc NYI!!
         */
        function (ctx) {
            x3dom.nodeTypes.StippleVolumeStyle.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFFloat} distanceFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'distanceFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} interiorFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'interiorFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} lightingFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'lightingFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} gradientThreshold
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0.4
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);

            /**
             *
             * @var {x3dom.fields.SFFloat} gradientRetainedOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientRetainedOpacity', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} gradientBoundaryOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientBoundaryOpacity', 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} gradientOpacityFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'gradientOpacityFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} silhouetteRetainedOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} silhouetteBoundaryOpacity
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} silhouetteOpacityFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'silhouetteOpacityFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} resolutionFactor
             * @memberof x3dom.nodeTypes.StippleVolumeStyle
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'resolutionFactor', 1);
        
        }
    )
);