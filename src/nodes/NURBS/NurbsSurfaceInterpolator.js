/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2018 A. Plesch, Waltham, MA USA
 * Dual licensed under the MIT and GPL
 */
/*
 * Ayam, a free 3D modeler for the RenderMan interface.
 *
 * Ayam is copyrighted 1998-2016 by Randolf Schultz
 * (randolf.schultz@gmail.com) and others.
 *
 * All rights reserved.
 *
 * See the file License for details.
 *
 */

/* ### NurbsSurfaceInterpolator ### */
x3dom.registerNodeType(
    "NurbsSurfaceInterpolator",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DChildNode,

        /**
         * Constructor for NurbsSurfaceInterpolator
         * @constructs x3dom.nodeTypes.NurbsSurfaceInterpolator
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc NurbsPositionInterpolator describes a 3D NURBS curve.
         */

        function (ctx) {
        x3dom.nodeTypes.NurbsSurfaceInterpolator.superClass.call(this, ctx);

        /**
         * uDimension and vDimension define the number of control points in the u and v dimensions.
         * @var {x3dom.fields.SFInt32} uDimension
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 0
         * @range [0, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFInt32(ctx, 'uDimension', 0);

        /**
         * uDimension and vDimension define the number of control points in the u and v dimensions.
         * @var {x3dom.fields.SFInt32} vDimension
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 0
         * @range [0, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFInt32(ctx, 'vDimension', 0);

        /**
         * uKnot and vKnot define the knot values of the surface in the u and v dimensions.
         * @var {x3dom.fields.MFDouble} uKnot
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue []
         * @range [-inf, inf]
         * @field x3d
         * @instance
         */
        this.addField_MFDouble(ctx, 'uKnot', []);

        /**
         * uKnot and vKnot define the knot values of the surface in the u and v dimensions.
         * @var {x3dom.fields.MFDouble} vKnot
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue []
         * @range [-inf, inf]
         * @field x3d
         * @instance
         */
        this.addField_MFDouble(ctx, 'vKnot', []);

        /**
         * uOrder and vOrder define the order of the surface in the u and v dimensions.
         * @var {x3dom.fields.SFInt32} uOrder
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 3
         * @range [2, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFInt32(ctx, 'uOrder', 3);

        /**
         * uOrder and vOrder define the order of the surface in the u and v dimensions.
         * @var {x3dom.fields.SFInt32} vOrder
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 3
         * @range [2, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFInt32(ctx, 'vOrder', 3);

        /**
         * controlPoint defines the X3DCoordinateNode instance that provides the source of coordinates used to control
         * the curve or surface. Depending on the weight value and the order, this piecewise linear curve is approximated
         * by the resulting parametric curve. The number of control points shall be equal to or greater than the order.
         * @var {x3dom.fields.MFVec2d} controlPoint
         * @memberof x3dom.nodeTypes.NurbsSurfaceInterpolator
         * @initvalue null
         * @field x3d
         * @instance
         */
        this.addField_SFNode('controlPoint', x3dom.nodeTypes.X3DCoordinateNode);

        /**
         * control point weights: P[i].w = weight[ i ]
         * @var {x3dom.fields.MFDouble} weight
         * @memberof x3dom.nodeTypes.NurbsSurfaceInterpolator
         * @initvalue []
         * @range [0, inf]
         * @field x3d
         * @instance
         */
        this.addField_MFDouble(ctx, 'weight', []);

        /**
         * The set_fraction inputOnly field receives an SFFloat event and causes the interpolator node function
         * to evaluate, resulting in a value_changed output event of the specified type with the same timestamp as the set_fraction event.
         * @var {x3dom.fields.SFFloat} set_fraction
         * @memberof x3dom.nodeTypes.NurbsSurfaceInterpolator
         * @initvalue 0,0
         * @field x3d
         * @instance
         */
        this.addField_SFVec2f(ctx, 'set_fraction', 0, 0);

        this.points = []; //MFVec3f controlPoints
        this._fractionalShift = 0.01; //relative distance to adjacent point

        //this.basisFunsCache = {}; //N[u]
        //this evaluates the curve at set_fraction
        //alternatively, tessellate at some degree dependant resolution and turn into linear positioninterpolator
    }, 
    {
        nodeChanged: function () {
        },
        fieldChanged: function (fieldName) {
            //                 switch (fieldName) {
            //                     case 'knot':
            //                     case 'order': this.basisFunsCache = {};
            //                 }
            if (fieldName === "set_fraction") {
                var value = this.getValue(this._vf.set_fraction);
                this.postMessage('position_changed', value.position);
                this.postMessage('position_changed', value.normal);
            }
        },
        getValue: function (uv) {
            this.points = this._cf.controlPoint.node._vf.point;
            var points = this.points.length;
            var uKnot = this._vf.uKnot;
            var vKnot = this._vf.vKnot;
            if (uKnot.length !== this._vf.uDimension + this._vf.uOrder)
                uKnot = this.createDefaultKnots(this._vf.uDimension, this._vf.uOrder);
            if (vKnot.length !== this._vf.vDimension + this._vf.vOrder)
                vKnot = this.createDefaultKnots(this._vf.vDimension, this._vf.vOrder);
            if (this._vf.weight.length != points)
                this._vf.weight = Array(points).fill(1.0);
            var uShift = (uKnot[uKnot.length-1] - uKnot[0]) * this._fractionalShift;
            var vShift = (vKnot[vKnot.length-1] - vKnot[0]) * this._fractionalShift;
            var uDiff = this.surfacePoint(u+uShift, v).subtract(this.curvePoint(u, v));
            var vDiff = this.surfacePoint(u, v+vShift).subtract(this.curvePoint(u, v));
            return {
                position: this.surfacePoint(u, v),
                normal: uDiff.cross(vDiff).normalize()
            }
        },
        createDefaultKnots: function (n, o) {
            var knots = Array(n + o).fill(0);
            for (var k = o;
                k < n; k++)
                knots[k] = (k - 1) / (n - 1);
            for (var k = knots.length - o;
                k < knots.length; k++)
                knots[k] = 1; //points-1;
            return knots;
        },
        surfacePoint: function (u, v) {
            return this.surfacePoint3DH(
                this._vf.uDimension - 1,
                this._vf.uDimension - 1,
                this._vf.uOrder - 1,
                this._vf.vOrder - 1,
                this._vf.uKnot,
                this._vf.vKnot,
                this.points,
                this._vf.weight,
                u, v
            );
        },
        findSpan: function (n, p, u, U) {
            return x3dom.nodeTypes.NurbsCurve.prototype.findSpan(n, p, u, U);
        }, /* findSpan */
        basisFuns: function (i, u, p, U) { // modified to disable cache
            return x3dom.nodeTypes.NurbsPositionInterpolator.prototype.basisFuns(i, u, p, U);
            //var uKey = Math.floor(u*10e10);
            //if (this.basisFunsCache[uKey]) return this.basisFunsCache[uKey];
            var N = [],
                left = [],
                right = [],
                saved,
                temp;
                var j,
                r;

            N[0] = 1.0;
            for (j = 0; j <= p; j++) {
                left[j] = 0;
                right[j] = 0;
            }

            for (j = 1; j <= p; j++) {
                left[j] = u - U[i + 1 - j];
                right[j] = U[i + j] - u;
                saved = 0.0;

                for (r = 0; r < j; r++) {
                    temp = N[r] / (right[r + 1] + left[j - r]);
                    N[r] = saved + right[r + 1] * temp;
                    saved = left[j - r] * temp;
                }

                N[j] = saved;
            }
            //this.basisFunsCache[uKey] = N;
            return N;
        }, /* basisFuns */
        surfacePoint3DH: function (n, m, p, q, U, V, P, W, u, v)
        {
            var spanu, spanv, indu, indv, l, k, i, j = 0;
            var Nu, Nv, C = [], Cw = [0.0,0.0,0.0,0.0], temp = [];

            spanu = this.findSpan(n, p, u, U);
            Nu = this.basisFuns(spanu, u, p, U);
            spanv = this.findSpan(m, q, v, V);
            Nv = this.basisFuns(spanv, v, q, V);

            indu = spanu - p;
            for(l = 0; l <= q; l++)
            {
                indv = spanv - q + l;
                for(k = 0; k < 4; k++)
                    temp[j+k] = 0.0;
                for(k = 0; k <= p; k++)
                {
                    i = indu+k+(indv*(n+1));
                    temp[j+0] += Nu[k]*P[i].x;
                    temp[j+1] += Nu[k]*P[i].y;
                    temp[j+2] += Nu[k]*P[i].z;
                    temp[j+3] += Nu[k]*W[i];
                }
                j += 4;
            }

            j = 0;
            for(l = 0; l <= q; l++)
            {
                Cw[0] += Nv[l]*temp[j+0];
                Cw[1] += Nv[l]*temp[j+1];
                Cw[2] += Nv[l]*temp[j+2];
                Cw[3] += Nv[l]*temp[j+3];
                j += 4;
            }

            for(j = 0; j < 3; j++)
                C[j] = Cw[j]/Cw[3];

            return new x3dom.fields.SFVec3f (
                C[0], C[1], C[2] );
        } /* surfacePoint3DH */
    }));
