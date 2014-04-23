/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

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
             * @var {x3dom.fields.MFString} string
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'string', []);

            /**
             *
             * @var {x3dom.fields.MFFloat} length
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'length', []);

            /**
             *
             * @var {x3dom.fields.SFFloat} maxExtent
             * @memberof x3dom.nodeTypes.Text
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxExtent', 0.0);

            /**
             *
             * @var {x3dom.fields.SFNode} fontStyle
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