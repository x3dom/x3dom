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

/* ### NurbsCurve ### */
x3dom.registerNodeType(
    "NurbsCurve",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DParametricGeometryNode, 
    
        /**
         * Constructor for NurbsCurve
         * @constructs x3dom.nodeTypes.NurbsCurve
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DParametricGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsCurve node is a geometry node defining a parametric curve in 3D space.
         */
         
        function (ctx) {
            x3dom.nodeTypes.NurbsCurve.superClass.call(this, ctx);
            
            /**
             * the order of the curve.
             * @var {x3dom.fields.SFInt32} order
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue 3
             * @range [2, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'order', 3);
            
            /**
             * knots defines the knot vector. The number of knots shall be equal to the number of control points
             * plus the order of the curve. The order shall be non-decreasing. Within the knot vector there may not be more
             * than order−1 consecutive knots of equal value. If the length of a knot vector is 0 or not the exact number
             * required (numcontrolPoint + order), a default uniform knot vector is computed.
             * @var {x3dom.fields.SFInt32} knot
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'knot', []);
            
            /**
             * controlPoint defines the X3DCoordinateNode instance that provides the source of coordinates used to control
             * the curve or surface. Depending on the weight value and the order, this piecewise linear curve is approximated
             * by the resulting parametric curve. The number of control points shall be equal to or greater than the order.
             * A closed B-Spline curve can be specified by repeating the limiting control points, specifying a periodic knot vector,
             * and setting the closed field to TRUE. If the last control point is not identical to the first or there exists a
             * non-unitary value of weight within (order-1) control points of the seam, the closed field is ignored.
             * @var {x3dom.fields.MFVec2d} controlPoint
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue null
             * @field x3d
             * @instance
             */
            this.addField_SFNode('controlPoint', x3dom.nodeTypes.X3DCoordinateNode);
            
            /**
             * control point weights: P[i].w = weight[ i ]
             * @var {x3dom.fields.MFDouble} weight
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue []
             * @range [0, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'weight', []);
            
            /**
             * NYI: The tessellation field gives a hint to the curve tessellator by setting an absolute number of subdivision steps.
             * These values shall be greater than or equal to the Order field. A value of 0 indicates that the browser choose
             * a suitable tessellation. Interpretation of values below 0 is implementation dependent.
             * @var {x3dom.fields.SFInt32} tessellation
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'tessellation', 0); //NYI
            
            /**
             * NYI: whether or not the curve is to be evaluated as a closed curve
             * @var {x3dom.fields.SFBool} closed
             * @memberof x3dom.nodeTypes.NurbsCurve
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'closed', false); //NYI

            this.points = []; //MFVec3f controlPoints
            this.uList = []; //Array of tessellated u values
            this.basisFunsCache = {}; //N[u]
            this.ils = new x3dom.nodeTypes.IndexedLineSet();
            this.ils.addChild(new x3dom.nodeTypes.Coordinate());
        },
        {
            nodeChanged: function() {
                this._needReRender = true;
                this._vf.useGeoCache = false;
                if(!this._hasCoarseMesh){
                    var ils = this.createCoarseILS(this);
                    this._mesh = ils._mesh;
                    this._hasCoarseMesh = true;
                }
                this.generateGeometry();
                
            },
            fieldChanged: function(fieldName) {
		        //this.invalidateVolume();
                Array.forEach(this._parentNodes, function (node) {
                    node._dirty.positions = true;
                    node.invalidateVolume();
                });
                switch (fieldName) {
                	case 'tessellation': this.uList = []; break;
                	case 'knot':
                	case 'order':
                	case 'closed': this.uList = []; this.basisFunsCache = {}; break;
                }
                this.generateGeometry();
            },
            generateGeometry: function () {
            	this.points = this._cf.controlPoint.node._vf.point; 
                var points = this.points.length;
                if (this._vf.knot.length == 0) this.createDefaultKnots();
                if (this._vf.weight.length != points) this._vf.weight = Array(points).fill(1.0);
                var tessPoints = this.calcTessPoints(this._vf.tessellation, points);
                if (this.uList.length == 0) this.uList = this.listPoints(tessPoints, this._vf.knot);
                var data = this.tessellate();
                //var ils = 
                this.createILS( data, this );
                this._mesh = this.ils._mesh;
                return;
            },
            createDefaultKnots: function () {
                var knots = Array(this.points.length+this._vf.order).fill(0);
                for (var k = this._vf.order;
                    k < this.points.length; k++)
                    knots[k]=k-1;
                for (var k = knots.length-this._vf.order;
                    k < knots.length; k++)
                    knots[k]=this.points.length-1;
                this._vf.knot = knots;
            },
            calcTessPoints: function(tess, controls) {
                if (tess > 0) return tess + 1;
                if (tess == 0) return 2 * controls + 1;
                return -tess * controls + 1;
            },
            listPoints: function(points, knots) {
                var step = knots[knots.length-1] - knots[0];
                step = step/(points-1);
                var list = [];
                for(var i=0; i < points; i++) list.push(knots[0] + i*step);
                //todo: go through knots and move nearest u if necessary
                return list;
            },
            tessellate: function () {
                var nurb = {
                    dimension: this.points.length-1,
                    u: this.uList,
                    degree: this._vf.order-1,
                    knots: this._vf.knot,
                    points: this.points,
                    weights: this._vf.weight,
                    closed: this._vf.closed
                };
                return nurb.u.map(function(u){
                    return this.curvePoint3DH(nurb.dimension, nurb.degree, nurb.knots, nurb.points, nurb.weights, u);
                }, this);
            },
            curvePoint3DH: function (n, p, U, P, W, u) {
                var spanu, indu, k, i;
                var Nu, temp = [0, 0, 0, 0];

                spanu = this.findSpan(n, p, u, U);
                Nu = this.basisFuns(spanu, u, p, U);

                indu = spanu - p;

                for (k = 0; k <= p; k++) {
                    i = indu+k;
                    temp[0] += Nu[k]*P[i].x;
                    temp[1] += Nu[k]*P[i].y;
                    temp[2] += Nu[k]*P[i].z;
                    temp[3] += Nu[k]*W[i];
                }

                return new x3dom.fields.SFVec3f(
                    temp[0]/temp[3],
                    temp[1]/temp[3],
                    temp[2]/temp[3] );
			},
            findSpan: function (n, p, u, U) {
                var low, mid, high;

                if(u >= U[n]) return n;
                if(u <= U[p]) return p;

                low = 0;
                high = n+1;
                mid = Math.floor((low+high)/2);

                while( u < U[mid] || u >= U[mid+1] ) {
                    if(u < U[mid]) high = mid;
                    else low = mid;
                    mid = Math.floor((low+high)/2);
                }
                return mid;
            }, /* findSpan */
            basisFuns: function (i, u, p, U) {
                var uKey = Math.floor(u*10e10);
                if (this.basisFunsCache[uKey]) return this.basisFunsCache[uKey];
                var N = [], left = [], right = [], saved, temp;
                var j, r;

                N[0] = 1.0;
                for(j = 0; j <= p; j++) {
                    left[j] = 0;
                    right[j] = 0;
                }
                
                for(j = 1; j <= p; j++)	{
                    left[j] = u - U[i+1-j];
                    right[j] = U[i+j] - u;
                    saved = 0.0;

                    for(r = 0; r < j; r++) {
                        temp = N[r] / (right[r+1] + left[j-r]);
                        N[r] = saved + right[r+1] * temp;
                        saved = left[j-r] * temp;
                    }

                    N[j] = saved;
                }
                this.basisFunsCache[uKey] = N;

                return N;
            }, /* basisFuns */
            createCoarseILS: function(node) {
                var coordNode = node._cf.controlPoint.node;
                var ils = new x3dom.nodeTypes.IndexedLineSet();
                
                ils._nameSpace = node._nameSpace;
                var ind = [];
                for(var i = 0; i < coordNode._vf.point.length; i++){
                    ind.push(i);
	    	    }
	    	    ind.push(-1);
                
                ils._vf.coordIndex = ind;
                ils.addChild(coordNode);
                ils.nodeChanged();
                ils._xmlNode = node._xmlNode;
                return ils;
            },
            createILS: function (data, node) {
                //var ils = new x3dom.nodeTypes.IndexedLineSet();
                this.ils._nameSpace = node._nameSpace;
                this.ils._vf.coordIndex = [];
                //var co = new x3dom.nodeTypes.Coordinate();
                var co = this.ils._cf.coord.node;
                co._nameSpace = node._nameSpace;
                co._vf.point = new x3dom.fields.MFVec3f();
                for(var i = 0; i < data.length; i++) {
                    co._vf.point.push(data[i]);
                    this.ils._vf.coordIndex.push(i);
                }
                //ils.addChild(co);
                this.ils.nodeChanged();
                this.ils._xmlNode = node._xmlNode;
                return this.ils;
                } /* createILS */
        }
    )
);
