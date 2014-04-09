/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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