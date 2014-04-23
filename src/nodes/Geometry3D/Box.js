/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Box ### */
x3dom.registerNodeType(
    "Box",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Box
         * @constructs x3dom.nodeTypes.Box
         * @x3d 3.3
         * @component Geometry3D
         * @status full
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Box node specifies a rectangular parallelepiped box centred at (0, 0, 0) in the local coordinate system and aligned with the local coordinate axes. By default, the box measures 2 units in each dimension, from -1 to +1.
         */
        function (ctx) {
            x3dom.nodeTypes.Box.superClass.call(this, ctx);


            /**
             * The size field specifies the extents of the box along the X-, Y-, and Z-axes respectively and each component value shall be greater than zero.
             * @var {x3dom.fields.SFVec3f} size
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Box
             * @initvalue 2,2,2
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'size', 2, 2, 2);

            /**
             * Specifies whether helper colors should be used, which will color each vertex with a different color. This will overwrite the color of the corresponding appearance node.
             * @var {x3dom.fields.SFBool} hasHelperColors
             * @memberof x3dom.nodeTypes.Box
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'hasHelperColors', false);

            var sx = this._vf.size.x,
                sy = this._vf.size.y,
                sz = this._vf.size.z;

            var geoCacheID = 'Box_'+sx+'-'+sy+'-'+sz;

            if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
            {
                //x3dom.debug.logInfo("Using Box from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else
            {
                sx /= 2; sy /= 2; sz /= 2;

                this._mesh._positions[0] = [
                    -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //hinten 0,0,-1
                    -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //vorne 0,0,1
                    -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //links -1,0,0
                    sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //rechts 1,0,0
                    -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //oben 0,1,0
                    -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //unten 0,-1,0
                ];
                this._mesh._normals[0] = [
                    0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
                    0,0,1,  0,0,1,   0,0,1,   0,0,1,
                    -1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
                    1,0,0,   1,0,0,   1,0,0,   1,0,0,
                    0,1,0,  0,1,0,   0,1,0,   0,1,0,
                    0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0
                ];
                this._mesh._texCoords[0] = [
                    1,0, 1,1, 0,1, 0,0,
                    0,0, 0,1, 1,1, 1,0,
                    0,0, 1,0, 1,1, 0,1,
                    1,0, 0,0, 0,1, 1,1,
                    0,1, 0,0, 1,0, 1,1,
                    0,0, 0,1, 1,1, 1,0
                ];
                if (this._vf.hasHelperColors) {
                    this._mesh._colors[0] = [
                        0, 0, 0,  0, 1, 0,  1, 1, 0,  1, 0, 0,
                        0, 0, 1,  0, 1, 1,  1, 1, 1,  1, 0, 1,
                        0, 0, 0,  0, 0, 1,  0, 1, 1,  0, 1, 0,
                        1, 0, 0,  1, 0, 1,  1, 1, 1,  1, 1, 0,
                        0, 1, 0,  0, 1, 1,  1, 1, 1,  1, 1, 0,
                        0, 0, 0,  0, 0, 1,  1, 0, 1,  1, 0, 0
                    ];
                }
                this._mesh._indices[0] = [
                    0,1,2, 2,3,0,
                    4,7,5, 5,7,6,
                    8,9,10, 10,11,8,
                    12,14,13, 14,12,15,
                    16,17,18, 18,19,16,
                    20,22,21, 22,20,23
                ];
                this._mesh._invalidate = true;
                this._mesh._numFaces = 12;
                this._mesh._numCoords = 24;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName === "size") {
                    var sx = this._vf.size.x / 2,
                        sy = this._vf.size.y / 2,
                        sz = this._vf.size.z / 2;

                    this._mesh._positions[0] = [
                        -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
                        -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
                        -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
                        sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
                        -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
                        -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
                    ];

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName === "hasHelperColors") {
                    if (this._vf.hasHelperColors) {
                        this._mesh._colors[0] = [
                            0, 0, 0,  0, 1, 0,  1, 1, 0,  1, 0, 0,
                            0, 0, 1,  0, 1, 1,  1, 1, 1,  1, 0, 1,
                            0, 0, 0,  0, 0, 1,  0, 1, 1,  0, 1, 0,
                            1, 0, 0,  1, 0, 1,  1, 1, 1,  1, 1, 0,
                            0, 1, 0,  0, 1, 1,  1, 1, 1,  1, 1, 0,
                            0, 0, 0,  0, 0, 1,  1, 0, 1,  1, 0, 0
                        ];
                    }
                    else {
                        this._mesh._colors[0] = [];
                    }

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);