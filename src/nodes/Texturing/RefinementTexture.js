/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### RefinementTexture ### */
x3dom.registerNodeType(
    "RefinementTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.RenderedTexture,
        
        /**
         * Constructor for RefinementTexture
         * @constructs x3dom.nodeTypes.RefinementTexture
         * @x3d x.x
         * @component Texturing
         * @extends x3dom.nodeTypes.RenderedTexture
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.RefinementTexture.superClass.call(this, ctx);

            /**
             * Specifies the first stamp texture.
             * @var {x3dom.fields.SFString} stamp0
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue "gpuii/stamps/0.gif"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'stamp0', "gpuii/stamps/0.gif");

            /**
             * Specifies the second stamp texture.
             * @var {x3dom.fields.SFString} stamp1
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue "gpuii/stamps/1.gif"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'stamp1', "gpuii/stamps/1.gif");

            /**
             * Defines whether texture refinement should be managed by another component.
             * @var {x3dom.fields.SFBool} autoRefinement
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'autoRefinement', true);

            /**
             * Specifies the image format of the dataset.
             * @var {x3dom.fields.SFString} format
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue 'jpg'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'format', 'jpg');

            /**
             * Maximum level that should be loaded (if GSM is smaller than on DSL6000)
             * @var {x3dom.fields.SFInt32} iterations
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue 7
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'iterations', 7);

            /**
             * Maximum level that should be loaded (if GSM is smaller than on DSL6000)
             * @var {x3dom.fields.SFInt32} maxLevel
             * @memberof x3dom.nodeTypes.RefinementTexture
             * @initvalue this._vf.iterations
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxLevel', this._vf.iterations);

            if (this._vf.iterations % 2 === 0) {
                var temp = this._vf.stamp0;
                this._vf.stamp0 = this._vf.stamp1;
                this._vf.stamp1 = temp;
            }

            this._vf.iterations = (this._vf.iterations > 11) ? 11 : this._vf.iterations;
            this._vf.iterations = (this._vf.iterations < 3) ? 3 : this._vf.iterations;
            this._vf.maxLevel = (this._vf.maxLevel > 11) ? 11 : this._vf.maxLevel;
            this._vf.maxLevel = (this._vf.maxLevel < 3) ? 3 : this._vf.maxLevel;
            this._vf.maxLevel = (this._vf.maxLevel > this._vf.iterations) ? this._vf.iterations : this._vf.maxLevel;

            // Additional parameters to control the refinement mechanism on shader
            // TODO: optimize
            var repeatConfig = [
                {x: 4, y: 8}, {x: 8, y: 8}, {x: 8, y: 16},
                {x: 16, y: 16}, {x: 16, y: 32}, {x: 32, y: 32},
                {x: 32, y: 64}, {x: 64, y: 64}, {x: 64, y: 128}
            ];

            // TODO: optimize
            this._repeat = new x3dom.fields.SFVec2f(
                    this._vf.dimensions[0] / repeatConfig[this._vf.iterations - 3].x,
                    this._vf.dimensions[1] / repeatConfig[this._vf.iterations - 3].y
            );
            this._renderedImage = 0;
            this._currLoadLevel = 0;
            this._loadLevel = 1;
        
        },
        {
            nextLevel: function() {
                if (this._loadLevel < this._vf.maxLevel) {
                    this._loadLevel++;
                    this._nameSpace.doc.needRender = true;
                }
            },

            requirePingPong: function() {
                return (this._currLoadLevel <= this._vf.maxLevel &&
                    this._renderedImage < this._loadLevel);
            }
        }
    )
);