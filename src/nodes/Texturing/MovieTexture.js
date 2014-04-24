/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for MovieTexture
         * @constructs x3dom.nodeTypes.MovieTexture
         * @x3d 3.3
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The MovieTexture node defines a time dependent texture map (contained in a movie file) and parameters for controlling the movie and the texture mapping.
         */
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);


            /**
             * Specifies whether the playback restarts after finished.
             * @var {x3dom.fields.SFBool} loop
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);

            /**
             * Specifies the plaback speed.
             * @var {x3dom.fields.SFFloat} speed
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement the following fields...

            /**
             * Sets a time to pause the video.
             * @var {x3dom.fields.SFTime} pauseTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'pauseTime', 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} pitch
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'pitch', 1.0);

            /**
             * Sets a time to resume from pause.
             * @var {x3dom.fields.SFTime} resumeTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'resumeTime', 0);

            /**
             * Sets a start time for the video.
             * @var {x3dom.fields.SFTime} startTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'startTime', 0);

            /**
             * Sets a stop time for the video.
             * @var {x3dom.fields.SFTime} stopTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'stopTime', 0);
        
        }
    )
);