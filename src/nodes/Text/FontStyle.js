/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### FontStyle ### */
x3dom.registerNodeType(
    "FontStyle",
    "Text",
    defineClass(x3dom.nodeTypes.X3DFontStyleNode,
        
        /**
         * Constructor for FontStyle
         * @constructs x3dom.nodeTypes.FontStyle
         * @x3d x.x
         * @component Text
         * @status experimental
         * @extends x3dom.nodeTypes.X3DFontStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} family
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ['SERIF']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'family', ['SERIF']);

            /**
             *
             * @var {SFBool} horizontal
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'horizontal', true);

            /**
             *
             * @var {MFString} justify
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ['BEGIN']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'justify', ['BEGIN']);

            /**
             *
             * @var {SFString} language
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'language', "");

            /**
             *
             * @var {SFBool} leftToRight
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'leftToRight', true);

            /**
             *
             * @var {SFFloat} size
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'size', 1.0);

            /**
             *
             * @var {SFFloat} spacing
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'spacing', 1.0);

            /**
             *
             * @var {SFString} style
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue "PLAIN"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'style', "PLAIN");

            /**
             *
             * @var {SFBool} topToBottom
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'topToBottom', true);
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == 'family' || fieldName == 'horizontal' || fieldName == 'justify' ||
                    fieldName == 'language' || fieldName == 'leftToRight' || fieldName == 'size' ||
                    fieldName == 'spacing' || fieldName == 'style' || fieldName == 'topToBottom') {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged(fieldName);
                    });
                }
            }
        }
    )
);

x3dom.nodeTypes.FontStyle.defaultNode = function() {
    if (!x3dom.nodeTypes.FontStyle._defaultNode) {
        x3dom.nodeTypes.FontStyle._defaultNode = new x3dom.nodeTypes.FontStyle();
        x3dom.nodeTypes.FontStyle._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.FontStyle._defaultNode;
};