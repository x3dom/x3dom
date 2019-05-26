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
    "BufferView",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for BufferView
         * @constructs x3dom.nodeTypes.BufferView
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BufferAccessor node is experimental.
         */
        function (ctx) {
            x3dom.nodeTypes.BufferView.superClass.call(this, ctx);

            /**
             * The buffer target vertex or index
             * @var {x3dom.fields.SFInt32} target
             * @memberof x3dom.nodeTypes.BufferView
             * @initvalue 34962
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'target', 34962);

            /**
             * The buffer byteOffset
             * @var {x3dom.fields.SFInt32} byteOffset
             * @memberof x3dom.nodeTypes.BufferView
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'byteOffset', 0);

            /**
             * The buffer byteStride
             * @var {x3dom.fields.SFInt32} byteStride
             * @memberof x3dom.nodeTypes.BufferView
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'byteStride', 0);

            /**
             * The buffer byteLength
             * @var {x3dom.fields.SFInt32} byteLength
             * @memberof x3dom.nodeTypes.BufferView
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'byteLength', 0);

            /**
             * The buffer id
             * @var {x3dom.fields.SFInt32} id
             * @memberof x3dom.nodeTypes.BufferView
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'id', 0);
        },
        {
            parentAdded: function(parent)
            {
            }
        }
    )
);
