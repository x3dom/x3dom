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
         * @x3d 3.3
         * @component EnvironmentalEffects
         * @status full
         * @extends x3dom.nodeTypes.X3DBackgroundNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A background node that uses six static images to compose the backdrop.  For the backUrl,
         * bottomUrl, frontUrl, leftUrl, rightUrl, topUrl fields, browsers shall support the JPEG and PNG
         * (see ISO/IEC 15948) image file formats.
         */
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);

            /**
             *
             * @var {MFString} backUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'backUrl', []);

            /**
             *
             * @var {MFString} bottomUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'bottomUrl', []);

            /**
             *
             * @var {MFString} frontUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'frontUrl', []);

            /**
             *
             * @var {MFString} leftUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'leftUrl', []);

            /**
             *
             * @var {MFString} rightUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'rightUrl', []);

            /**
             *
             * @var {MFString} topUrl
             * @memberof x3dom.nodeTypes.Background
             * @initvalue []
             * @range [URI]
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