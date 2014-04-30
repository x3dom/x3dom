/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


/* ### X3DFontStyleNode ### */
x3dom.registerNodeType(
    "X3DFontStyleNode",
    "Text",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DFontStyleNode
         * @constructs x3dom.nodeTypes.X3DFontStyleNode
         * @x3d x.x
         * @component Text
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this, ctx);
        
        }
    )
);

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

/* ### Text ### */
x3dom.registerNodeType(
    "Text",
    "Text",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for Text
         * @constructs x3dom.nodeTypes.Text
         * @x3d x.x
         * @component Text
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Text.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} string
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'string', []);

            /**
             *
             * @var {MFFloat} length
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'length', []);

            /**
             *
             * @var {SFFloat} maxExtent
             * @memberof x3dom.nodeTypes.Text
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxExtent', 0.0);

            /**
             *
             * @var {SFNode} fontStyle
             * @memberof x3dom.nodeTypes.Text
             * @initvalue x3dom.nodeTypes.X3DFontStyleNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode ('fontStyle', x3dom.nodeTypes.X3DFontStyleNode);

            this._mesh._positions[0] = [];
			this._mesh._normals[0]   = [0,0,1, 0,0,1, 0,0,1, 0,0,1];
            this._mesh._texCoords[0] = [0,0, 1,0, 1,1, 0,1];
            this._mesh._colors[0] 	 = [];
            this._mesh._indices[0] 	 = [0,1,2, 2,3,0];
            this._mesh._invalidate 	 = true;
            this._mesh._numFaces 	 = 2;
            this._mesh._numCoords 	 = 4;
        
        },
        {
            nodeChanged: function() {
                if (!this._cf.fontStyle.node) {
                    this.addChild(x3dom.nodeTypes.FontStyle.defaultNode());
                }
                this.invalidateVolume();
            },

            fieldChanged: function(fieldName) {
                if (fieldName == 'string' || fieldName == 'length' || fieldName == 'maxExtent') {
                    this.invalidateVolume();
                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    ) // defineClass
); // registerNodeType
