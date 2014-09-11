/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DBinaryContainerGeometryNode ### */
x3dom.registerNodeType(
    "X3DBinaryContainerGeometryNode",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for X3DBinaryContainerGeometryNode
         * @constructs x3dom.nodeTypes.X3DBinaryContainerGeometryNode
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DBinaryContainerGeometryNode.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFVec3f} position
             * @memberof x3dom.nodeTypes.X3DBinaryContainerGeometryNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'position', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFVec3f} size
             * @memberof x3dom.nodeTypes.X3DBinaryContainerGeometryNode
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);

            /**
             *
             * @var {x3dom.fields.MFInt32} vertexCount
             * @memberof x3dom.nodeTypes.X3DBinaryContainerGeometryNode
             * @initvalue [0]
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'vertexCount', [0]);

            /**
             *
             * @var {x3dom.fields.MFString} primType
             * @memberof x3dom.nodeTypes.X3DBinaryContainerGeometryNode
             * @initvalue ['TRIANGLES']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);

            // correct min/max of bounding volume set in BinaryContainerGeometry
            this._mesh._invalidate = false;
            this._mesh._numCoords = 0;
            this._mesh._numFaces = 0;

            this._diameter = this._vf.size.length();
        
        },
        {
            getMin: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.min;
            },

            getMax: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.max;
            },

            getVolume: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol;
            },

            invalidateVolume: function() {
                // at the moment, do nothing here since field updates are not impl.
            },

            getCenter: function() {
                return this._vf.position;
            },

            getDiameter: function() {
                return this._diameter;
            },

            needLighting: function() {
                var hasTris = (this._vf.primType.length && this._vf.primType[0].indexOf("TRIANGLE") >= 0);
                return (this._vf.lit && hasTris);
            }
        }
    )
);