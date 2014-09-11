/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Sphere ### */
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Sphere
         * @constructs x3dom.nodeTypes.Sphere
         * @x3d 3.3
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Sphere node specifies a sphere centred at (0, 0, 0) in the local coordinate system.
         */
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);

            // sky box background creates sphere with r = 10000

            /**
             * The radius field specifies the radius of the sphere.
             * @var {x3dom.fields.SFFloat} radius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Sphere
             * @initvalue ctx?1:10000
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', ctx ? 1 : 10000);

            /**
             * Specifies the number of faces that are generated to approximate the surface of the sphere.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.Sphere
             * @initvalue 24,24
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 24, 24);

            var qfactor = 1.0;
            var r = this._vf.radius;
            var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;

            var geoCacheID = 'Sphere_' + r + '-' + subx + '-' + suby;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Sphere from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                if(ctx) {
                    qfactor = ctx.doc.properties.getProperty("PrimitiveQuality", "Medium");
                }
                if (!x3dom.Utils.isNumber(qfactor)) {
                    switch (qfactor.toLowerCase()) {
                        case "low":
                            qfactor = 0.3;
                            break;
                        case "medium":
                            qfactor = 0.5;
                            break;
                        case "high":
                            qfactor = 1.0;
                            break;
                    }
                } else {
                    qfactor = parseFloat(qfactor);
                }

                this._quality = qfactor;

                var latNumber, longNumber;
                var latitudeBands = Math.floor(subx * qfactor);
                var longitudeBands = Math.floor(suby * qfactor);

                var theta, sinTheta, cosTheta;
                var phi, sinPhi, cosPhi;
                var x, y, z, u, v;

                for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                    theta = (latNumber * Math.PI) / latitudeBands;
                    sinTheta = Math.sin(theta);
                    cosTheta = Math.cos(theta);

                    for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                        phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                        sinPhi = Math.sin(phi);
                        cosPhi = Math.cos(phi);

                        x = -cosPhi * sinTheta;
                        y = -cosTheta;
                        z = -sinPhi * sinTheta;

                        u = 0.25 - (longNumber / longitudeBands);
                        v = latNumber / latitudeBands;

                        this._mesh._positions[0].push(r * x);
                        this._mesh._positions[0].push(r * y);
                        this._mesh._positions[0].push(r * z);
                        this._mesh._normals[0].push(x);
                        this._mesh._normals[0].push(y);
                        this._mesh._normals[0].push(z);
                        this._mesh._texCoords[0].push(u);
                        this._mesh._texCoords[0].push(v);
                    }
                }

                var first, second;

                for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                    for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                        first = (latNumber * (longitudeBands + 1)) + longNumber;
                        second = first + longitudeBands + 1;

                        this._mesh._indices[0].push(first);
                        this._mesh._indices[0].push(second);
                        this._mesh._indices[0].push(first + 1);

                        this._mesh._indices[0].push(second);
                        this._mesh._indices[0].push(second + 1);
                        this._mesh._indices[0].push(first + 1);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "radius") {
                    this._mesh._positions[0] = [];
                    var r = this._vf.radius;
                    var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
                    var qfactor = this._quality;

                    var latNumber, longNumber;
                    var latitudeBands = Math.floor(subx * qfactor);
                    var longitudeBands = Math.floor(suby * qfactor);

                    var theta, sinTheta, cosTheta;
                    var phi, sinPhi, cosPhi;
                    var x, y, z;

                    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                        theta = (latNumber * Math.PI) / latitudeBands;
                        sinTheta = Math.sin(theta);
                        cosTheta = Math.cos(theta);

                        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                            phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                            sinPhi = Math.sin(phi);
                            cosPhi = Math.cos(phi);

                            x = -cosPhi * sinTheta;
                            y = -cosTheta;
                            z = -sinPhi * sinTheta;

                            this._mesh._positions[0].push(r * x);
                            this._mesh._positions[0].push(r * y);
                            this._mesh._positions[0].push(r * z);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName === "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] =[];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] =[];

                    var r = this._vf.radius;
                    var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
                    var qfactor = this._quality;

                    var latNumber, longNumber;
                    var latitudeBands = Math.floor(subx * qfactor);
                    var longitudeBands = Math.floor(suby * qfactor);

                    var theta, sinTheta, cosTheta;
                    var phi, sinPhi, cosPhi;
                    var x, y, z, u, v;

                    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                        theta = (latNumber * Math.PI) / latitudeBands;
                        sinTheta = Math.sin(theta);
                        cosTheta = Math.cos(theta);

                        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                            phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                            sinPhi = Math.sin(phi);
                            cosPhi = Math.cos(phi);

                            x = -cosPhi * sinTheta;
                            y = -cosTheta;
                            z = -sinPhi * sinTheta;

                            u = 0.25 - (longNumber / longitudeBands);
                            v = latNumber / latitudeBands;

                            this._mesh._positions[0].push(r * x);
                            this._mesh._positions[0].push(r * y);
                            this._mesh._positions[0].push(r * z);
                            this._mesh._normals[0].push(x);
                            this._mesh._normals[0].push(y);
                            this._mesh._normals[0].push(z);
                            this._mesh._texCoords[0].push(u);
                            this._mesh._texCoords[0].push(v);
                        }
                    }

                    var first, second;

                    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                            first = (latNumber * (longitudeBands + 1)) + longNumber;
                            second = first + longitudeBands + 1;

                            this._mesh._indices[0].push(first);
                            this._mesh._indices[0].push(second);
                            this._mesh._indices[0].push(first + 1);

                            this._mesh._indices[0].push(second);
                            this._mesh._indices[0].push(second + 1);
                            this._mesh._indices[0].push(first + 1);
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