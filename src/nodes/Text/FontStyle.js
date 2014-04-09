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
        function (ctx) {
            x3dom.nodeTypes.FontStyle.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'family', ['SERIF']);
            this.addField_SFBool(ctx, 'horizontal', true);
            this.addField_MFString(ctx, 'justify', ['BEGIN']);
            this.addField_SFString(ctx, 'language', "");
            this.addField_SFBool(ctx, 'leftToRight', true);
            this.addField_SFFloat(ctx, 'size', 1.0);
            this.addField_SFFloat(ctx, 'spacing', 1.0);
            this.addField_SFString(ctx, 'style', "PLAIN");
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