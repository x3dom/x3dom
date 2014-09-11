/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Torus ### */
x3dom.registerNodeType(
    "Torus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Torus
         * @constructs x3dom.nodeTypes.Torus
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Torus node specifies a torus shape centred at (0, 0, 0) in the local coordinate system.
         */
        function (ctx) {
            x3dom.nodeTypes.Torus.superClass.call(this, ctx);

            var twoPi = 2.0 * Math.PI;


            /**
             * Specifies the inner radius of the torus.
             * @var {x3dom.fields.SFFloat} innerRadius
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'innerRadius', 0.5);

            /**
             * Specifies the outer radius of the torus.
             * @var {x3dom.fields.SFFloat} outerRadius
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'outerRadius', 1.0);

            /**
             * Specifies the size of the torus as an angle.
             * @var {x3dom.fields.SFFloat} angle
             * @range [0, 2*pi]
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue twoPi
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'angle', twoPi);

            /**
             * Specifies whether the torus ends are closed with caps (when angle is smaller than a full circle).
             * @var {x3dom.fields.SFBool} caps
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'caps', true);

            /**
             * Specifies the number of faces that are generated to approximate the torus.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue 24,24
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 24, 24);

            /**
             * Use a different interpretation mode for the inside and outside radius.
             * @var {x3dom.fields.SFBool} insideOutsideRadius
             * @memberof x3dom.nodeTypes.Torus
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'insideOutsideRadius', false);

            // assure that angle in [0, 2 * PI]
            if (this._vf.angle < 0)
                this._vf.angle = 0;
            else if (this._vf.angle > twoPi)
                this._vf.angle = twoPi;

            this._origCCW = this._vf.ccw;

            var innerRadius = this._vf.innerRadius;
            var outerRadius = this._vf.outerRadius;

            if (this._vf.insideOutsideRadius == true)
            {
                if (innerRadius > outerRadius) {
                    var tmp = innerRadius;
                    innerRadius = outerRadius;
                    outerRadius = tmp;
                }

                var rad = (outerRadius - innerRadius) / 2;

                outerRadius = innerRadius + rad;
                innerRadius = rad;

                // fix wrong face orientation in case of clockwise rotation
                this._vf.ccw = !this._origCCW;
            }

            var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
            rings = Math.max(3, Math.round((this._vf.angle / twoPi) * rings));

            // FIXME; check/update geoCache on field update (for ALL primitives)!
            var geoCacheID = 'Torus_'+innerRadius+'_'+outerRadius+'_'+this._vf.angle+'_'+
                this._vf.subdivision+'-'+this._vf.caps;

            if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
            {
                //x3dom.debug.logInfo("Using Torus from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else
            {
                var ringDelta = this._vf.angle / rings;
                var sideDelta = twoPi / sides;
                var a, b, theta, phi;
                var cosTheta, sinTheta, cosPhi, sinPhi, dist;

                for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
                {
                    cosTheta = Math.cos(theta);
                    sinTheta = Math.sin(theta);

                    for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                    {
                        cosPhi = Math.cos(phi);
                        sinPhi = Math.sin(phi);
                        dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * dist, innerRadius * sinPhi, -sinTheta * dist);
                            this._mesh._normals[0].push(cosTheta * cosPhi, sinPhi, -sinTheta * cosPhi);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
                            this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
                        }
                        this._mesh._texCoords[0].push(-a / rings, b / sides);
                    }
                }

                for (a=0; a<sides; a++)
                {
                    for (b=0; b<rings; b++)
                    {
                        this._mesh._indices[0].push(b * (sides+1) + a);
                        this._mesh._indices[0].push(b * (sides+1) + a + 1);
                        this._mesh._indices[0].push((b + 1) * (sides+1) + a);

                        this._mesh._indices[0].push(b * (sides+1) + a + 1);
                        this._mesh._indices[0].push((b + 1) * (sides+1) + a + 1);
                        this._mesh._indices[0].push((b + 1) * (sides+1) + a);
                    }
                }

                if (this._vf.angle < twoPi && this._vf.caps == true)
                {
                    // create first cap
                    var origPos = this._mesh._positions[0].length / 3;

                    if (this._vf.insideOutsideRadius) {
                        this._mesh._positions[0].push(outerRadius, 0, 0);
                        this._mesh._normals[0].push(0, 0, 1);
                    }
                    else {
                        this._mesh._positions[0].push(outerRadius, 0, 0);
                        this._mesh._normals[0].push(0, 1, 0);
                    }
                    this._mesh._texCoords[0].push(0.5, 0.5);

                    for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                    {
                        cosPhi = Math.cos(phi);
                        sinPhi = Math.sin(phi);
                        dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(dist, sinPhi * innerRadius, 0);
                            this._mesh._normals[0].push(0, 0, 1);
                        }
                        else {
                            this._mesh._positions[0].push(dist, 0, sinPhi * innerRadius);
                            this._mesh._normals[0].push(0, 1, 0);
                        }
                        this._mesh._texCoords[0].push((1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                        if (b > 0) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b);
                            this._mesh._indices[0].push(origPos + b - 1);
                        }
                        if (b == sides) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + 1);
                            this._mesh._indices[0].push(origPos + b);
                        }
                    }

                    // second cap
                    cosTheta = Math.cos(this._vf.angle);
                    sinTheta = Math.sin(this._vf.angle);

                    origPos = this._mesh._positions[0].length / 3;
                    var nx = -sinTheta, ny = -cosTheta;

                    if (this._vf.insideOutsideRadius) {
                        this._mesh._positions[0].push(cosTheta * outerRadius, 0, -sinTheta * outerRadius);
                        this._mesh._normals[0].push(nx, 0, ny);
                    }
                    else {
                        this._mesh._positions[0].push(cosTheta * outerRadius, -sinTheta * outerRadius, 0);
                        this._mesh._normals[0].push(nx, ny, 0);
                    }
                    this._mesh._texCoords[0].push(0.5, 0.5);

                    for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                    {
                        cosPhi = Math.cos(phi);
                        sinPhi = Math.sin(phi);
                        dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * dist, sinPhi * innerRadius, -sinTheta * dist);
                            this._mesh._normals[0].push(nx, 0, ny);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, sinPhi * innerRadius);
                            this._mesh._normals[0].push(nx, ny, 0);
                        }
                        this._mesh._texCoords[0].push(1 - (1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                        if (b > 0) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b - 1);
                            this._mesh._indices[0].push(origPos + b);
                        }
                        if (b == sides) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b);
                            this._mesh._indices[0].push(origPos + 1);
                        }
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function(fieldName)
            {
                // TODO; invalidate geometry cache if necessary (to be fixed for all primitives)!
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "subdivision" || fieldName == "angle" ||
                    fieldName == "insideOutsideRadius" || fieldName == "caps")
                {
                    // assure that angle in [0, 2 * PI]
                    var twoPi = 2.0 * Math.PI;

                    if (this._vf.angle < 0)
                        this._vf.angle = 0;
                    else if (this._vf.angle > twoPi)
                        this._vf.angle = twoPi;

                    var innerRadius = this._vf.innerRadius;
                    var outerRadius = this._vf.outerRadius;

                    if (this._vf.insideOutsideRadius == true)
                    {
                        if (innerRadius > outerRadius) {
                            var tmp = innerRadius;
                            innerRadius = outerRadius;
                            outerRadius = tmp;
                        }

                        var rad = (outerRadius - innerRadius) / 2;

                        outerRadius = innerRadius + rad;
                        innerRadius = rad;

                        this._vf.ccw = !this._origCCW;
                    }
                    else
                        this._vf.ccw = this._origCCW;

                    var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
                    rings = Math.max(3, Math.round((this._vf.angle / twoPi) * rings));

                    var ringDelta = this._vf.angle / rings;
                    var sideDelta = twoPi / sides;
                    var a, b, theta, phi;
                    var cosTheta, sinTheta, cosPhi, sinPhi, dist;

                    this._mesh._positions[0] = [];
                    this._mesh._normals[0]   = [];
                    this._mesh._texCoords[0] = [];
                    this._mesh._indices[0]   = [];

                    for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
                    {
                        cosTheta = Math.cos(theta);
                        sinTheta = Math.sin(theta);

                        for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                        {
                            cosPhi = Math.cos(phi);
                            sinPhi = Math.sin(phi);
                            dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(cosTheta * dist, innerRadius * sinPhi, -sinTheta * dist);
                                this._mesh._normals[0].push(cosTheta * cosPhi, sinPhi, -sinTheta * cosPhi);
                            }
                            else {
                                this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
                                this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
                            }
                            this._mesh._texCoords[0].push(-a / rings, b / sides);
                        }
                    }

                    for (a=0; a<sides; a++)
                    {
                        for (b=0; b<rings; b++)
                        {
                            this._mesh._indices[0].push(b * (sides+1) + a);
                            this._mesh._indices[0].push(b * (sides+1) + a + 1);
                            this._mesh._indices[0].push((b + 1) * (sides+1) + a);

                            this._mesh._indices[0].push(b * (sides+1) + a + 1);
                            this._mesh._indices[0].push((b + 1) * (sides+1) + a + 1);
                            this._mesh._indices[0].push((b + 1) * (sides+1) + a);
                        }
                    }

                    if (this._vf.angle < twoPi && this._vf.caps == true)
                    {
                        // create first cap
                        var origPos = this._mesh._positions[0].length / 3;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(outerRadius, 0, 0);
                            this._mesh._normals[0].push(0, 0, 1);
                        }
                        else {
                            this._mesh._positions[0].push(outerRadius, 0, 0);
                            this._mesh._normals[0].push(0, 1, 0);
                        }
                        this._mesh._texCoords[0].push(0.5, 0.5);

                        for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                        {
                            cosPhi = Math.cos(phi);
                            sinPhi = Math.sin(phi);
                            dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(dist, sinPhi * innerRadius, 0);
                                this._mesh._normals[0].push(0, 0, 1);
                            }
                            else {
                                this._mesh._positions[0].push(dist, 0, sinPhi * innerRadius);
                                this._mesh._normals[0].push(0, 1, 0);
                            }
                            this._mesh._texCoords[0].push((1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                            if (b > 0) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b);
                                this._mesh._indices[0].push(origPos + b - 1);
                            }
                            if (b == sides) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + 1);
                                this._mesh._indices[0].push(origPos + b);
                            }
                        }

                        // second cap
                        cosTheta = Math.cos(this._vf.angle);
                        sinTheta = Math.sin(this._vf.angle);

                        origPos = this._mesh._positions[0].length / 3;
                        var nx = -sinTheta, ny = -cosTheta;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * outerRadius, 0, -sinTheta * outerRadius);
                            this._mesh._normals[0].push(nx, 0, ny);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * outerRadius, -sinTheta * outerRadius, 0);
                            this._mesh._normals[0].push(nx, ny, 0);
                        }
                        this._mesh._texCoords[0].push(0.5, 0.5);

                        for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                        {
                            cosPhi = Math.cos(phi);
                            sinPhi = Math.sin(phi);
                            dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(cosTheta * dist, sinPhi * innerRadius, -sinTheta * dist);
                                this._mesh._normals[0].push(nx, 0, ny);
                            }
                            else {
                                this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, sinPhi * innerRadius);
                                this._mesh._normals[0].push(nx, ny, 0);
                            }
                            this._mesh._texCoords[0].push(1 - (1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                            if (b > 0) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b - 1);
                                this._mesh._indices[0].push(origPos + b);
                            }
                            if (b == sides) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b);
                                this._mesh._indices[0].push(origPos + 1);
                            }
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