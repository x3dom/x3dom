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
    "BufferGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,

        /**
         * Constructor for BufferGeometry
         * @constructs x3dom.nodeTypes.BufferGeometry
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DBinaryContainerGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The BufferGeometry node can load binary data like glTF buffer.
         */
        function (ctx) {
            x3dom.nodeTypes.BufferGeometry.superClass.call(this, ctx);


            /**
             * The url to the binary file, that contains the buffer data.
             * @var {x3dom.fields.SFString} buffer
             * @memberof x3dom.nodeTypes.BufferGeometry
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'buffer', "");

            this.addField_MFNode('views', x3dom.nodeTypes.BufferView);
            this.addField_MFNode('accessors', x3dom.nodeTypes.BufferAccessor);

            this._hasColor = false;
            this._hasMultiTexCoord = false;
            this._indexed = false;
        },
        {
            parentAdded: function(parent)
            {

            },

            nodeChanged: function()
            {

            },

            doIntersect: function(line)
            {
                var min = this.getMin();
                var max = this.getMax();
                var isect = line.intersect(min, max);

                if (isect && line.enter < line.dist) {
                    line.dist = line.enter;
                    line.hitObject = this;
                    line.hitPoint = line.pos.add(line.dir.multiply(line.enter));
                    return true;
                }
                else {
                    return false;
                }
            },

            hasColor: function() {
                return this._hasColor;
            },

            hasMultiTexCoord: function() {
                return this._hasMultiTexCoord;
            },

            getPrecisionMax: function(type)
            {
                switch(this._vf[type])
                {
                    case "Int8":
                        return 127.0;
                    case "Uint8":
                        return 255.0;
                    case "Int16":
                        return 32767.0;
                    case "Uint16":
                        return 65535.0;
                    case "Int32":
                        return 2147483647.0;
                    case "Uint32":
                        return 4294967295.0;
                    case "Float32":
                    case "Float64":
                    default:
                        return 1.0;
                }
            }
        }
    )
);
