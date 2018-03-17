/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### BinaryGeometry ### */
x3dom.registerNodeType(
    "BufferGeometryAccessor",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for BufferGeometryAccessor
         * @constructs x3dom.nodeTypes.BufferGeometryAccessor
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BufferGeometryAccessor node is experimental.
         */
        function (ctx) {
            x3dom.nodeTypes.BufferGeometryAccessor.superClass.call(this, ctx);


            /**
             * The target vertex attribute or vertex index
             * @var {x3dom.fields.SFString} bufferType
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'bufferType', "");

            /**
             * The related buffer view
             * @var {x3dom.fields.SFInt32} view
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'view', 0);

            /**
             * The buffer byteOffset
             * @var {x3dom.fields.SFInt32} byteOffset
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'byteOffset', 0);

            /**
             * The buffer byteStride
             * @var {x3dom.fields.SFInt32} byteStride
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'byteStride', 0);

            /**
             * The buffer components
             * @var {x3dom.fields.SFInt32} components
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'components', 0);

            /**
             * The buffer componentType
             * @var {x3dom.fields.SFInt32} componentType
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 5126
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'componentType', 5126);

            /**
             * The buffer element count
             * @var {x3dom.fields.SFInt32} count
             * @memberof x3dom.nodeTypes.BufferGeometryAccessor
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'count', 0);
        },
        {
            parentAdded: function(parent)
            {
                switch(this._vf.bufferType)
                {
                    case "COLOR" : parent._hasColor = true; break;
                    case "INDEX" : parent._indexed = true; break;
                }
            }
        }
    )
);