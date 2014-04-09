/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MovieTexture ### */
x3dom.registerNodeType(
    "MovieTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.Texture,
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'loop', false);
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement the following fields...
            this.addField_SFTime(ctx, 'pauseTime', 0);
            this.addField_SFFloat(ctx, 'pitch', 1.0);
            this.addField_SFTime(ctx, 'resumeTime', 0);
            this.addField_SFTime(ctx, 'startTime', 0);
            this.addField_SFTime(ctx, 'stopTime', 0);
        }
    )
);