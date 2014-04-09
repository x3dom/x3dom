/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### SphereSegment ### */
x3dom.registerNodeType(
    "SphereSegment",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.SphereSegment.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_MFFloat(ctx, 'longitude', []);
            this.addField_MFFloat(ctx, 'latitude', []);
            this.addField_SFVec2f(ctx, 'stepSize', 1, 1);

            var r = this._vf.radius;
            var longs = this._vf.longitude;
            var lats = this._vf.latitude;

            var subx = longs.length, suby = lats.length;
            var first, second;

            var latNumber, longNumber;
            var latitudeBands = suby;
            var longitudeBands = subx;

            var theta, sinTheta, cosTheta;
            var phi, sinPhi, cosPhi;
            var x, y, z, u, v;

            for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                theta = ((lats[latNumber]+90) * Math.PI) / 180;
                sinTheta = Math.sin(theta);
                cosTheta = Math.cos(theta);

                for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    phi = ((longs[longNumber]) * Math.PI) / 180;

                    sinPhi = Math.sin(phi);
                    cosPhi = Math.cos(phi);

                    x = -cosPhi * sinTheta;
                    y = -cosTheta;
                    z = -sinPhi * sinTheta;

                    u = longNumber / (longitudeBands-1);
                    v = latNumber / (latitudeBands-1);

                    this._mesh._positions[0].push(r * x, r * y, r * z);
                    this._mesh._normals[0].push(x, y, z);
                    this._mesh._texCoords[0].push(u, v);
                }
            }

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
        }
    )
);