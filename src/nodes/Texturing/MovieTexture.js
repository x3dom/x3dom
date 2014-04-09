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
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.Texture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MovieTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} loop
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);

            /**
             *
             * @var {SFFloat} speed
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // TODO; implement the following fields...

            /**
             *
             * @var {SFTime} pauseTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'pauseTime', 0);

            /**
             *
             * @var {SFFloat} pitch
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'pitch', 1.0);

            /**
             *
             * @var {SFTime} resumeTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'resumeTime', 0);

            /**
             *
             * @var {SFTime} startTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'startTime', 0);

            /**
             *
             * @var {SFTime} stopTime
             * @memberof x3dom.nodeTypes.MovieTexture
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'stopTime', 0);
        
        }
    )
);