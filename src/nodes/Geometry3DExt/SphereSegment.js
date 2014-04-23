/** @namespace x3dom.nodeTypes */
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
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for SphereSegment
         * @constructs x3dom.nodeTypes.SphereSegment
         * @x3d x.x
         * @component Geometry3DExt
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a sphere segment shape.
         */
        function (ctx) {
            x3dom.nodeTypes.SphereSegment.superClass.call(this, ctx);


            /**
             * Defines the radius of the sphere.
             * @var {x3dom.fields.SFFloat} radius
             * @memberof x3dom.nodeTypes.SphereSegment
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1);

            /**
             * Defines an array of longitude values.
             * @var {x3dom.fields.MFFloat} longitude
             * @memberof x3dom.nodeTypes.SphereSegment
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'longitude', []);

            /**
             * Defines an array of latitude values.
             * @var {x3dom.fields.MFFloat} latitude
             * @memberof x3dom.nodeTypes.SphereSegment
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'latitude', []);

            /**
             * Defines an array of stepSizes.
             * @var {x3dom.fields.SFVec2f} stepSize
             * @memberof x3dom.nodeTypes.SphereSegment
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
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