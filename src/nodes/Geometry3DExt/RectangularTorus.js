/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### RectangularTorus ### */
x3dom.registerNodeType(
    "RectangularTorus",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for RectangularTorus
         * @constructs x3dom.nodeTypes.RectangularTorus
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a rectangular torus shape.
         */
        function (ctx) {
            x3dom.nodeTypes.RectangularTorus.superClass.call(this, ctx);


            /**
             * Defines the inner radius of the torus.
             * @var {x3dom.fields.SFFloat} innerRadius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'innerRadius', 0.5); //Inside radius

            /**
             * Defines the outer radius of the torus.
             * @var {x3dom.fields.SFFloat} outerRadius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'outerRadius', 1);	//Outside radius

            /**
             * Defines the height of the torus.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 1);	    //Height of rectangular section

            /**
             * Defines the length of the torus as angle. 2 * PI is a full torus.
             * @var {x3dom.fields.SFFloat} angle
             * @range [0, 2*pi]
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue 2*Math.PI
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'angle', 2 * Math.PI);	//Subtended angle

            /**
             * Specifies whether the side caps exist.
             * @var {x3dom.fields.SFBool} caps
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'caps', true);        //Show side caps

            /**
             * Specifies the number of rings that are generated to approximate the torus.
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.RectangularTorus
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._origCCW = this._vf.ccw;

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

                this._vf.ccw = !this._origCCW;

                // assure that angle in [0, 2 * PI]
                if (this._vf.angle < 0)
                    this._vf.angle = 0;
                else if (this._vf.angle > twoPi)
                    this._vf.angle = twoPi;

                // assure that innerRadius < outerRadius
                if (this._vf.innerRadius > this._vf.outerRadius)
                {
                    var tmp = this._vf.innerRadius;
                    this._vf.innerRadius = this._vf.outerRadius;
                    this._vf.outerRadius = tmp;
                }

                var innerRadius = this._vf.innerRadius;
                var outerRadius = this._vf.outerRadius;
                var height = this._vf.height / 2;
                var angle = this._vf.angle;
                var sides = this._vf.subdivision;

                var beta, x, z, k, j, nx, nz;
                var delta = angle / sides;

                //Outer Side
                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, height, z);
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

                //Inner Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, height, z);
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

                //Top Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
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

                //Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
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

                //Create Caps
                if (angle < twoPi && this._vf.caps == true)
                {
                    //First Cap
                    k += 2;

                    x = outerRadius;
                    z = 0;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 0, 1);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, 0, 1);

                    x = innerRadius;
                    z = 0;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 0, 1);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, 0, 1);

                    this._mesh._indices[0].push(k    );
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 3);

                    //Second Cap
                    k+=4;

                    nx =  Math.cos(angle);
                    nz = -Math.sin(angle);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k    );

                    this._mesh._indices[0].push(k + 3);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "height" || fieldName == "angle" ||
                    fieldName == "subdivision" || fieldName == "caps")
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