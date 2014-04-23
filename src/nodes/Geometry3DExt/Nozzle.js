/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Nozzle ### */
x3dom.registerNodeType(
    "Nozzle",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Nozzle
         * @constructs x3dom.nodeTypes.Nozzle
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node describes a nozzle shape for a pipe.
         */
        function (ctx) {
            x3dom.nodeTypes.Nozzle.superClass.call(this, ctx);


            /**
             * Defines the height of the nozzle.
             * @var {x3dom.fields.SFFloat} nozzleHeight
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Nozzle
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'nozzleHeight', 0.1);

            /**
             * Defines the radius of the nozzle.
             * @var {x3dom.fields.SFFloat} nozzleRadius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Nozzle
             * @initvalue 0.6
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'nozzleRadius', 0.6);

            /**
             * Defines the height of the pipe.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Nozzle
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 1.0);

            /**
             * Defines the outer radius of the pipe.
             * @var {x3dom.fields.SFFloat} outerRadius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Nozzle
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'outerRadius', 0.5);

            /**
             * Defines the inner radius of the pipe.
             * @var {x3dom.fields.SFFloat} innerRadius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Nozzle
             * @initvalue 0.4
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'innerRadius', 0.4);

            /**
             * Specifies the number of faces that are generated to approximate the sides of the pipe and nozzle.
             * @var {x3dom.fields.SFFloat} subdivision
             * @range [2, inf]
             * @memberof x3dom.nodeTypes.Nozzle
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

                var twoPi = 2.0 * Math.PI;
                var sides = this._vf.subdivision;

                var height = this._vf.height;
                var center = height / 2;

                if (this._vf.innerRadius > this._vf.outerRadius)
                {
                    var tmp = this._vf.innerRadius;
                    this._vf.innerRadius = this._vf.outerRadius;
                    this._vf.outerRadius = tmp;
                }
                var innerRadius = this._vf.innerRadius;
                var outerRadius = this._vf.outerRadius;

                if (this._vf.nozzleRadius < outerRadius)
                {
                    this._vf.nozzleRadius = outerRadius;
                }
                var nozzleRadius = this._vf.nozzleRadius;

                if (this._vf.nozzleHeight > height)
                {
                    this._vf.nozzleHeight = height;
                }
                var nozzleHeight = this._vf.nozzleHeight;

                var beta, delta, x, z, k, j, nx, nz;
                delta = twoPi / sides;

                //Outer Stem Side
                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

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

                //Inner Stem Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Stem Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Outer Nozzle Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

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

                //Inner Nozzle Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Nozzle Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Nozzle Top Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(0, 1, 0);

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

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "nozzleHeight" || fieldName == "nozzleRadius" || fieldName == "height" ||
                    fieldName == "outerRadius" || fieldName == "innerRadius" || fieldName == "subdivision")
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