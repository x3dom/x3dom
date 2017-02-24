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
         * @x3d 3.3
         * @component Text
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Text node specifies a two-sided, flat text string object positioned in the Z=0 plane of the local coordinate system based on values defined in the fontStyle field.
         * Text nodes may contain multiple text strings specified using the UTF-8 encoding.
         * The text strings are stored in the order in which the text mode characters are to be produced as defined by the parameters in the FontStyle node.
         */
        function (ctx) {
            x3dom.nodeTypes.Text.superClass.call(this, ctx);


            /**
             * The text strings are contained in the string field.
             * @var {x3dom.fields.MFString} string
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'string', []);

            /**
             * The length field contains an MFFloat value that specifies the length of each text string in the local coordinate system.
             * The length of each line of type is measured horizontally for horizontal text (FontStyle node: horizontal=TRUE) and vertically for vertical text (FontStyle node: horizontal=FALSE).
             * @var {x3dom.fields.MFFloat} length
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Text
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'length', []);

            /**
             * The maxExtent field limits and compresses all of the text strings if the length of the maximum string is longer than the maximum extent, as measured in the local coordinate system. If the text string with the maximum length is shorter than the maxExtent, then there is no compressing.
             * The maximum extent is measured horizontally for horizontal text (FontStyle node: horizontal=TRUE) and vertically for vertical text (FontStyle node: horizontal=FALSE).
             * @var {x3dom.fields.SFFloat} maxExtent
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Text
             * @initvalue 0.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'maxExtent', 0.0);

            /**
             * The fontStyle field contains one FontStyle node that specifies the font size, font family and style, direction of the text strings, and any specific language rendering techniques used for the text.
             * @var {x3dom.fields.SFNode} fontStyle
             * @memberof x3dom.nodeTypes.Text
             * @initvalue x3dom.nodeTypes.X3DFontStyleNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode ('fontStyle', x3dom.nodeTypes.X3DFontStyleNode);

            this._mesh._positions[0] = [0,0,0, 1,0,0, 1,1,0, 0,1,0];
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
            },
            
            validateGLObject: function ()
            {
                Array.forEach(this._parentNodes, function (node) {
                    node._dirty.texture = false;
                });

                this._nameSpace.doc.needRender = true;
            }
        }
    ) // defineClass
); // registerNodeType
