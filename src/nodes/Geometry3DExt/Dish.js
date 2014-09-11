/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Dish ### */
x3dom.registerNodeType(
    "Dish",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Dish
         * @constructs x3dom.nodeTypes.Dish
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Dish.superClass.call(this, ctx);


            /**
             * Specifies the diameter of the base.
             * @var {x3dom.fields.SFFloat} diameter
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Dish
             * @initvalue 2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'diameter', 2);

            /**
             * Defines the maximum height of the dished surface above the base
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Dish
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 1);

            /**
             * Defines the radius of the third semi-principal axes of the ellipsoid
             * @var {x3dom.fields.SFFloat} radius
             * @memberof x3dom.nodeTypes.Dish
             * @initvalue this._vf.diameter/2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', this._vf.diameter / 2);

            /**
             * The bottom field specifies whether the bottom cap of the dish is created.
             * @var {x3dom.fields.SFBool} bottom
             * @memberof x3dom.nodeTypes.Dish
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'bottom', true);

            /**
             * Specifies the number of faces that are generated to approximate the sides of the dish.
             * The first component specifies the number of rings and the second component the number of subdivisions of each ring.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Dish
             * @initvalue 24,24
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 24, 24);

            this.rebuildGeometry();
        
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var twoPi = Math.PI * 2, halfPi = Math.PI / 2;
                var halfDia = this._vf.diameter / 2;

                // If r is 0 or half of diameter, treat as section of sphere, else half of ellipsoid
                var r = this._vf.radius;
                r = (r == 0 || Math.abs(halfDia - r) <= x3dom.fields.Eps) ? halfDia : r;

                // height defines sectional part taken from half of ellipsoid (sphere if r==halfDia)
                var h = Math.min(this._vf.height, r);
                var offset = r - h;

                var a = halfDia;    // 1st semi-principal axes along x
                var b = r;          // 2nd semi-principal axes along y
                var c = halfDia;    // 3rd semi-principal axes along z

                var latitudeBands = this._vf.subdivision.x, longitudeBands = this._vf.subdivision.y;
                var latNumber, longNumber;

                var segTheta = halfPi - Math.asin(1 - h / r);
                var segL = Math.ceil(latitudeBands / halfPi * segTheta);

                var theta, sinTheta, cosTheta;
                var phi, sinPhi, cosPhi;
                var x, y, z, u, v;
                var tmpPosArr = [], tmpTcArr = [];

                for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                    if (segL == latNumber) {
                        theta = segTheta;
                    }
                    else {
                        theta = (latNumber * halfPi) / latitudeBands;
                    }
                    sinTheta = Math.sin(theta);
                    cosTheta = Math.cos(theta);

                    for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                        phi = (longNumber * twoPi) / longitudeBands;
                        sinPhi = Math.sin(phi);
                        cosPhi = Math.cos(phi);

                        x = a * (-cosPhi * sinTheta);
                        y = b *            cosTheta;
                        z = c * (-sinPhi * sinTheta);

                        u = 0.25 - (longNumber / longitudeBands);
                        v = latNumber / latitudeBands;

                        this._mesh._positions[0].push(x, y - offset, z);
                        this._mesh._texCoords[0].push(u, v);
                        this._mesh._normals[0].push(x/(a*a), y/(b*b), z/(c*c));

                        if ((latNumber == latitudeBands) || (segL == latNumber)) {
                            tmpPosArr.push(x, y - offset, z);
                            tmpTcArr.push(u, v);
                        }
                    }

                    if (segL == latNumber)
                        break;
                }

                for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                    if (segL == latNumber)
                        break;

                    for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                        var first = (latNumber * (longitudeBands + 1)) + longNumber;
                        var second = first + longitudeBands + 1;

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second);
                        this._mesh._indices[0].push(first);

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second + 1);
                        this._mesh._indices[0].push(second);
                    }
                }

                if (this._vf.bottom)
                {
                    var origPos = this._mesh._positions[0].length / 3;
                    var t = origPos + 1;

                    for (var i=0, m=tmpPosArr.length/3; i<m; i++) {
                        var j = 3 * i;
                        this._mesh._positions[0].push(tmpPosArr[j  ]);
                        this._mesh._positions[0].push(tmpPosArr[j+1]);
                        this._mesh._positions[0].push(tmpPosArr[j+2]);
                        j = 2 * i;
                        this._mesh._texCoords[0].push(tmpTcArr[j  ]);
                        this._mesh._texCoords[0].push(tmpTcArr[j+1]);
                        this._mesh._normals[0].push(0, -1, 0);

                        if (i >= 2) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(t);

                            t = origPos + i;
                            this._mesh._indices[0].push(t);
                        }
                    }
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "radius" || fieldName == "height" || fieldName == "diameter" ||
                    fieldName == "subdivision" || fieldName == "bottom")
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