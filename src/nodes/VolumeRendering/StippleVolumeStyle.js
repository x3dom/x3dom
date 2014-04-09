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
        function (ctx) {
            x3dom.nodeTypes.StippleVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'distanceFactor', 1);
            this.addField_SFFloat(ctx, 'interiorFactor', 1);
            this.addField_SFFloat(ctx, 'lightingFactor', 1);
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);
            this.addField_SFFloat(ctx, 'gradientRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'gradientBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'gradientOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'silhouetteOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'resolutionFactor', 1);
        }
    )
);