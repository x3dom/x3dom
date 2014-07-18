/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Plane ### */
x3dom.registerNodeType(
    "Plane",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Plane
         * @constructs x3dom.nodeTypes.Plane
         * @x3d x.x
         * @component Geometry3D
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @class The plane node describes a plane shape that extents in x and y direction.
         */
        function (ctx) {
            x3dom.nodeTypes.Plane.superClass.call(this, ctx);


            /**
             * The edge lengths of the plane.
             * @var {x3dom.fields.SFVec2f} size
             * @memberof x3dom.nodeTypes.Plane
             * @initvalue 2,2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'size', 2, 2);

            /**
             * Defines the number of single elements that are generated to represent the plane.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.Plane
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);

            /**
             * Defines the center point in the local coordinate system.
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.Plane
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             * Specifies the primitive type that is used to build the plane.
             * @var {x3dom.fields.MFString} primType
             * @memberof x3dom.nodeTypes.Plane
             * @initvalue ['TRIANGLES']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);

            // this way currently an initialize only field
            if (this._vf.primType.length)
                this._mesh._primType = this._vf.primType[0];

            var sx = this._vf.size.x, sy = this._vf.size.y;
            var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;

            var geoCacheID = 'Plane_' + sx + '-' + sy + '-' + subx + '-' + suby + '-' +
                this._vf.center.x + '-' + this._vf.center.y + '-' + this._vf.center.z;

            // Attention: DynamicLOD node internally creates Plane nodes, but MUST NOT
            //            use geoCache, therefore only use cache if "ctx" is defined!
            // TODO: move mesh generation of all primitives to nodeChanged()
            if (ctx && this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Plane from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var x = 0, y = 0;
                var xstep = sx / subx;
                var ystep = sy / suby;

                sx /= 2; sy /= 2;

                for (y = 0; y <= suby; y++) {
                    for (x = 0; x <= subx; x++) {
                        this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
                        this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
                        this._mesh._positions[0].push(this._vf.center.z);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);
                        this._mesh._texCoords[0].push(x / subx);
                        this._mesh._texCoords[0].push(y / suby);
                    }
                }

                for (y = 1; y <= suby; y++) {
                    for (x = 0; x < subx; x++) {
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                        this._mesh._indices[0].push(y * (subx + 1) + x);

                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                        this._mesh._indices[0].push(y * (subx + 1) + x + 1);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "size" || fieldName == "center") {
                    this._mesh._positions[0] = [];

                    var sx = this._vf.size.x, sy = this._vf.size.y;
                    var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
                    var x = 0, y = 0;
                    var xstep = sx / subx;
                    var ystep = sy / suby;

                    sx /= 2; sy /= 2;

                    for (y = 0; y <= suby; y++) {
                        for (x = 0; x <= subx; x++) {
                            this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
                            this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
                            this._mesh._positions[0].push(this._vf.center.z);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var sx = this._vf.size.x, sy = this._vf.size.y;
                    var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;

                    var x = 0, y = 0;
                    var xstep = sx / subx;
                    var ystep = sy / suby;

                    sx /= 2; sy /= 2;

                    for (y = 0; y <= suby; y++) {
                        for (x = 0; x <= subx; x++) {
                            this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
                            this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
                            this._mesh._positions[0].push(this._vf.center.z);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(1);
                            this._mesh._texCoords[0].push(x / subx);
                            this._mesh._texCoords[0].push(y / suby);
                        }
                    }

                    for (y = 1; y <= suby; y++) {
                        for (x = 0; x < subx; x++) {
                            this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
                            this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                            this._mesh._indices[0].push(y * (subx + 1) + x);

                            this._mesh._indices[0].push(y * (subx + 1) + x);
                            this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                            this._mesh._indices[0].push(y * (subx + 1) + x + 1);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);