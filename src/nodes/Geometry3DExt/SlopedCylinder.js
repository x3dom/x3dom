/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### SlopedCylinder ### */
x3dom.registerNodeType(
    "SlopedCylinder",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for SlopedCylinder
         * @constructs x3dom.nodeTypes.SlopedCylinder
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a sloped cylinder shape
         */
        function (ctx) {
            x3dom.nodeTypes.SlopedCylinder.superClass.call(this, ctx);


            /**
             * Defines the radius of the sloped cylinder.
             * @var {x3dom.fields.SFFloat} radius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1.0);

            /**
             * Defines the height of the sloped cylinder
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 2.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 2.0);

            /**
             * Defines whether the bottom exists.
             * @var {x3dom.fields.SFBool} bottom
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'bottom', true);

            /**
             * Defines whether the top exists.
             * @var {x3dom.fields.SFBool} top
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'top', true);

            /**
             * Defines the shear for the top in x direction.
             * @var {x3dom.fields.SFFloat} xtshear
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 0.26179
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xtshear', 0.26179);

            /**
             * Defines the shear for the top in y direction.
             * @var {x3dom.fields.SFFloat} ytshear
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ytshear', 0.0);

            /**
             * Defines the shear for the bottom in x direction.
             * @var {x3dom.fields.SFFloat} xbshear
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 0.26179
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'xbshear', 0.26179);

            /**
             * Defines the shear for the bottom in y direction.
             * @var {x3dom.fields.SFFloat} ybshear
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ybshear', 0.0);

            /**
             * Specifies the number of faces that are generated to approximate the cylinder.
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.SlopedCylinder
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this.rebuildGeometry();
        
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var topSlopeX = this._vf.xtshear;
                var topSlopeY = this._vf.ytshear;
                var botSlopeX = this._vf.xbshear;
                var botSlopeY = this._vf.ybshear;
                var sides = this._vf.subdivision;

                var radius = this._vf.radius;
                var height = this._vf.height / 2;

                var delta = 2.0 * Math.PI / sides;
                var beta, x, y, z;
                var j, k;

                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    x =  Math.sin(beta);
                    z = -Math.cos(beta);

                    this._mesh._positions[0].push(x * radius, -height + x * botSlopeX + z * botSlopeY, z * radius);
                    this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                    this._mesh._positions[0].push(x * radius,  height + x * topSlopeX + z * topSlopeY, z * radius);
                    this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                var h, base;

                if (this._vf.top && radius > 0)
                {
                    base = this._mesh._positions[0].length / 3;

                    for (j=sides-1; j>=0; j--)
                    {
                        k = 6 * j;
                        x = this._mesh._positions[0][k+3];
                        y = this._mesh._positions[0][k+4];
                        z = this._mesh._positions[0][k+5];

                        this._mesh._positions[0].push(x, y, z);
                        this._mesh._texCoords[0].push(x / 2 + 0.5, -z / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j=2; j<sides; j++)
                    {
                        this._mesh._indices[0].push(base);
                        this._mesh._indices[0].push(h);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                if (this._vf.bottom && radius > 0)
                {
                    base = this._mesh._positions[0].length / 3;

                    for (j=sides-1; j>=0; j--)
                    {
                        k = 6 * j;
                        x = this._mesh._positions[0][k  ];
                        y = this._mesh._positions[0][k+1];
                        z = this._mesh._positions[0][k+2];

                        this._mesh._positions[0].push(x, y, z);
                        this._mesh._texCoords[0].push(x / 2 + 0.5, z / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j=2; j<sides; j++)
                    {
                        this._mesh._indices[0].push(h);
                        this._mesh._indices[0].push(base);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                // calculate normals and adjust them at seam
                this._mesh.calcNormals(Math.PI, this._vf.ccw);

                var n0b = new x3dom.fields.SFVec3f(this._mesh._normals[0][0],
                    this._mesh._normals[0][1],
                    this._mesh._normals[0][2]);
                var n0t = new x3dom.fields.SFVec3f(this._mesh._normals[0][3],
                    this._mesh._normals[0][4],
                    this._mesh._normals[0][5]);
                k = 6 * sides;
                var n1b = new x3dom.fields.SFVec3f(this._mesh._normals[0][k  ],
                    this._mesh._normals[0][k+1],
                    this._mesh._normals[0][k+2]);
                var n1t = new x3dom.fields.SFVec3f(this._mesh._normals[0][k+3],
                    this._mesh._normals[0][k+4],
                    this._mesh._normals[0][k+5]);

                var nb = n0b.add(n1b).normalize();
                var nt = n0t.add(n1t).normalize();

                this._mesh._normals[0][0] = nb.x;
                this._mesh._normals[0][1] = nb.y;
                this._mesh._normals[0][2] = nb.z;
                this._mesh._normals[0][3] = nt.x;
                this._mesh._normals[0][4] = nt.y;
                this._mesh._normals[0][5] = nt.z;

                this._mesh._normals[0][k  ] = nb.x;
                this._mesh._normals[0][k+1] = nb.y;
                this._mesh._normals[0][k+2] = nb.z;
                this._mesh._normals[0][k+3] = nt.x;
                this._mesh._normals[0][k+4] = nt.y;
                this._mesh._normals[0][k+5] = nt.z;

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "xtshear" || fieldName == "ytshear" ||
                    fieldName == "xbshear" || fieldName == "ybshear" ||
                    fieldName == "radius" || fieldName == "height" ||
                    fieldName == "bottom" || fieldName == "top" || fieldName == "subdivision")
                {
                    this.rebuildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);