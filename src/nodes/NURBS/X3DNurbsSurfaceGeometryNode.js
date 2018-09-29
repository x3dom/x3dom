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

/* ### NurbsPatchSurface ### */
x3dom.registerNodeType(
    "X3DNurbsSurfaceGeometryNode",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DParametricGeometryNode,

        /**
         * Constructor for X3DNurbsSurfaceGeometryNode
         * @constructs x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DParametricGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The X3DNurbsSurfaceGeometryNode represents the abstract geometry type for all types of NURBS surfaces.
         */

        function (ctx) {
        x3dom.nodeTypes.X3DParametricGeometryNode.superClass.call(this, ctx);

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
         * subdividing the surface in a equal number of subdivision steps. 0: double dimension plus 1.
         * For implementations doing tessellations based on chord length, tessellation values less than zero
         * are interpreted as the maximum chord length deviation in pixels. Implementations doing fully automatic
         * tessellation may ignore the tessellation hint parameters.
         * @var {x3dom.fields.SFInt32} uTessellation
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 0
         * @range [-inf, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFFloat(ctx, 'uTessellation', 0.0); //should be SFInt32

        /**
         * subdividing the surface in a equal number of subdivision steps. 0: double dimension plus 1.
         * For implementations doing tessellations based on chord length, tessellation values less than zero
         * are interpreted as the maximum chord length deviation in pixels. Implementations doing fully automatic
         * tessellation may ignore the tessellation hint parameters.
         * @var {x3dom.fields.SFInt32} vTessellation
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue 0
         * @range [-inf, inf]
         * @field x3d
         * @instance
         */
        this.addField_SFFloat(ctx, 'vTessellation', 0.0); //should be SFInt32

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
         * control point weights: P[i,j].w = weight[ i + (j × uDimension)]
         * @var {x3dom.fields.MFDouble} weight
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue []
         * @range [0, inf]
         * @field x3d
         * @instance
         */
        this.addField_MFDouble(ctx, 'weight', []);

        /**
         * controlPoint defines a set of control points of dimension uDimension × vDimension.
         * This set of points defines a mesh where the points do not have a uniform spacing.
         * uDimension points define a polyline in u-direction followed by further u-polylines with the v-parameter in ascending order.
         * The number of control points shall be equal or greater than the order.
         * A closed surface in either the u-dimension or the v-dimension shall be specified by repeating the limiting control points
         * for that dimension and setting the respective uClosed or vClosed field to TRUE. If the last control point is not identical
         * with the first control point, the field is ignored. If either the uClosed or the vClosed field is set to FALSE,
         * the implementation shall not be required to smoothly blend the edges of the surface in that dimension.
         * into a continuous surface.
         * @var {x3dom.fields.SFNode} controlPoint
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue null
         * @field x3d
         * @instance
         */
        this.addField_SFNode('controlPoint', x3dom.nodeTypes.X3DCoordinateNode);

        /**
         * NYI: uClosed and vClosed define whether or not the specific dimension is to be evaluated as a closed surface
         * along the u and v directions, respectively.
         * @var {x3dom.fields.SFBool} uClosed
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue false
         * @field x3d
         * @instance
         */
        this.addField_SFBool(ctx, 'uClosed', false); //NYI

        /**
         * NYI: uClosed and vClosed define whether or not the specific dimension is to be evaluated as a closed surface
         * along the u and v directions, respectively.
         * @var {x3dom.fields.SFBool} vClosed
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue false
         * @field x3d
         * @instance
         */
        this.addField_SFBool(ctx, 'vClosed', false); //NYI

        /**
         * texCoord provides additional information on how to generate texture coordinates.
         * By default, texture coordinates in the unit square (or cube for 3D coordinates) are generated automatically
         * from the parametric subdivision. A NurbsTextureCoordinate node or simply a TextureCoordinate node can then
         * be used to compute a texture coordinate given a u/v parameter of the X3DParametricGeometryNode.
         * The NurbsTextureCoordinate also supports non-animated surfaces to specify a "chord length"-based texture coordinate parametrization.
         * @var {x3dom.fields.SFNode} texCoord
         * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
         * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
         * @field x3dom
         * @instance
         */
        this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);

        /**
         * NYI: whether the surface is visible when viewed from the inside.
         * When solid=TRUE is used, the surface shall be visible only from the side that appears ccw (counter-clockwise)
         * on the screen, assuming a surface's quads would be rendered in this order:
         *  point(u  , v  );
         *  point(u-1, v  );
         *  point(u-1, v-1);
         *  point(u  , v-1);
         * where u is the parameter generating successive points along the u dimension, and v is the parameter
         * generating successive points along the v dimension.
         * @var {x3dom.fields.SFBool} solid
         * @memberof x3dom.nodeTypes.X3DParametricGeometryNode
         * @initvalue false
         * @field x3d
         * @instance
         */
        this.addField_SFBool(ctx, 'solid', false); //NYI

        this.addField_SFBool(ctx, 'normalPerVertex', true);

        this._needReRender = true;
        this.basisFunsCache = new Map();
        this.uv = []; // trigger triangulation

        //this._myctx = ctx;
    }, 
    {
        nodeChanged: function () {
            this._needReRender = true;
            this._vf.ccw = false;
            this._vf.solid = false;
            this._vf.useGeoCache = false;
            if (!this._hasCoarseMesh) {
                var its = this.createCoarseITS(this);
                this._mesh = its._mesh;
                this._hasCoarseMesh = true;
            }
            
            var uKnot = this._vf.uKnot;
            var vKnot = this._vf.vKnot;
            if (uKnot.length !== this._vf.uDimension + this._vf.uOrder)
                uKnot = this.createDefaultKnots(this._vf.uDimension, this._vf.uOrder);
            if (vKnot.length !== this._vf.vDimension + this._vf.vOrder)
                vKnot = this.createDefaultKnots(this._vf.vDimension, this._vf.vOrder);

            var T = [];
            if (this._cf.trimmingContour &&
                this._cf.trimmingContour.nodes.length) {
                var len = this._cf.trimmingContour.nodes.length;
                for (var i = 0; i < len; i++) {
                    var c2dnode = this._cf.trimmingContour.nodes[i];
                    if (c2dnode._cf.children) {
                        T[i] = [];
                        var trim = c2dnode._cf.children.nodes;
                        for (var j = 0; j < trim.length; j++) {
                            var tc = trim[j];
                            // convert polyline to NURBS
                            if (!tc._vf.order) {
                                tc._vf.order = 2;
                            }
                            if (!tc._vf.knot) {
                                var knots = [];
                                knots.push(0);
                                knots.push(0);
                                for (var k = 2;
                                    k < tc._vf.controlPoint.length; k++) //controlPoint.length when MFVec2f, was /2
                                    knots.push(k - 1);
                                knots.push(knots[knots.length - 1] + 1);
                                knots.push(knots[knots.length - 1]);
                                tc._vf.knot = knots;
                            }
                            T[i].push([tc._vf.controlPoint.length - 1, //T[0] needs attention when MFVec2f
                                    tc._vf.order - 1, tc._vf.knot,
                                    tc._vf.controlPoint, tc._vf.weight]); //T[3] needs attention when MFVec2f
                        }
                    }
                }
            }

            var onmessage = function (e) {
                if (e.data.length >= 3) {
                    if (this.caller.uv.length) {
                        var data = e.data[1];
                        var point = new x3dom.fields.MFVec3f();
                        for (var i = 0; i < data.length; i++)
                            point.push(
                                new x3dom.fields.SFVec3f(data[i][0], data[i][1], data[i][2]));

                        this.caller._mesh._positions[0] = point.toGL();
                    } else {
                        var its = this.caller.createITS(e.data, this.caller);
                        this.caller.workerTask = null;
                        this.caller._mesh = its._mesh;
                        if (this.caller._nameSpace) { // worker returns sometimes when doc changes
                            var tasks = x3dom.tessWorkerPool.taskQueue.length;
                            var x3de = this.caller._nameSpace.doc._x3dElem;
                            x3de.runtime.canvas.progressText = tasks == 0 ? "" : "Tesselation tasks: " + tasks;
                        }
                    }
                    if (this.caller._cleanupGLObjects)
                        this.caller._cleanupGLObjects(true);
                    Array.forEach(this.caller._parentNodes,
                        function (node) {
                        node.setAllDirty();
                    });
                    this.caller.basisFunsCache = e.data[3];
                    this.caller.uv = e.data[4];
                }
            }

            var coordNode = this._cf.controlPoint.node;
            //x3dom.debug.assert(coordNode);
            var startmessage = [
                this._vf.uDimension - 1,
                this._vf.vDimension - 1,
                this._vf.uOrder - 1, this._vf.vOrder - 1,
                this._vf.uKnot, this._vf.vKnot,
                coordNode.getPoints(),
                this._vf.weight,
                this._vf.uTessellation,
                this._vf.vTessellation,
                T,
                this.basisFunsCache,
                this.uv
            ];

            if (this.workerTask)
                this.workerTask.discard = true;

            this.workerTask = new x3dom.WorkerTask(x3dom.tessWorkerScript, //global script
                    this, onmessage, startmessage);

            x3dom.tessWorkerPool.addWorkerTask(this.workerTask); //global pool
        },
        
        fieldChanged: function (fieldName) {
            if (fieldName == 'order' || fieldName == 'knot' || fieldName.includes('Tessellation')) {
                this.basisFunsCache = new Map();
                this.uv = [];
                this.nodeChanged();
                return
            } else if (this.uv.length)
                this.nodeChanged();
            // do nothing until first tessellation
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

        createCoarseITS: function (node) {
            var w = node._vf.uDimension;
            var h = node._vf.vDimension;
            var coordNode = node._cf.controlPoint.node;

            var its = new x3dom.nodeTypes.IndexedTriangleSet();
            its._nameSpace = node._nameSpace;
            its._vf.solid = false;
            its._vf.ccw = false;
            var ind = [],
            i1 = 0,
            i2 = w;
            for (var i = 0; i < h - 1; i++) {
                for (var j = 0; j < w - 1; j++) {
                    ind.push(i1);
                    ind.push(i1 + 1);
                    ind.push(i2);
                    ind.push(i2);
                    ind.push(i1 + 1);
                    ind.push(i2 + 1);
                    i1++;
                    i2++;
                }
                i1++;
                i2++;
            }
            its._vf.index = ind;

            its.addChild(coordNode);
            if (0) {
                var tc = new x3dom.nodeTypes.TextureCoordinate();
                tc._nameSpace = node._nameSpace;
                tc._vf.point = new x3dom.fields.MFVec2f(data[2]/*tess.texcoords*/);
                its.addChild(tc);
            }

            its.nodeChanged();
            its._xmlNode = node._xmlNode;
            return its;
        }, /* createCoarseITS */

        createITS: function (data, node) {
            var its = new x3dom.nodeTypes.IndexedTriangleSet();
            its._nameSpace = node._nameSpace;
            its._vf.normalPerVertex = node._vf.normalPerVertex;
            its._vf.solid = false;
            its._vf.ccw = false;
            its._vf.index = data[0];
            var co = new x3dom.nodeTypes.Coordinate();
            co._nameSpace = node._nameSpace;
            co._vf.point = new x3dom.fields.MFVec3f();
            for (var i = 0; i < data[1].length; i++)
                co._vf.point.push(
                    new x3dom.fields.SFVec3f(data[1][i][0], data[1][i][1], data[1][i][2]));
            its.addChild(co);
            var tc = new x3dom.nodeTypes.TextureCoordinate();
            tc._nameSpace = node._nameSpace;
            tc._vf.point = new x3dom.fields.MFVec2f();
            for (var i = 0; i < data[2].length; i++)
                tc._vf.point.push(
                    new x3dom.fields.SFVec2f(data[2][i][0], data[2][i][1]));
            its.addChild(tc);
            its.nodeChanged();
            its._xmlNode = node._xmlNode;
            return its;
        } /* createITS */
    }));
