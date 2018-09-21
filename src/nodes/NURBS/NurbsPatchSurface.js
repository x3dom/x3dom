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
    "NurbsPatchSurface",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode, //X3DNurbsSurfaceGeometryNode
    
        /**
         * Constructor for NurbsPatchSurface
         * @constructs x3dom.nodeTypes.NurbsPatchSurface
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode //X3DNurbsSurfaceGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsPatchSurface node is a contiguous NURBS surface patch.
         */
    
        function (ctx) {
            x3dom.nodeTypes.NurbsPatchSurface.superClass.call(this, ctx);
            
            /**
             * uDimension and vDimension define the number of control points in the u and v dimensions.
             * @var {x3dom.fields.SFInt32} uDimension
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue 0
             * @range [0, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'uDimension', 0);
            
            /**
             * uDimension and vDimension define the number of control points in the u and v dimensions.
             * @var {x3dom.fields.SFInt32} vDimension
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue 0
             * @range [0, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'vDimension', 0);
            
            /**
             * uOrder and vOrder define the order of the surface in the u and v dimensions.
             * @var {x3dom.fields.SFInt32} uOrder
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue 3
             * @range [2, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFInt32(ctx, 'uOrder', 3);
            
            /**
             * uOrder and vOrder define the order of the surface in the u and v dimensions.
             * @var {x3dom.fields.SFInt32} vOrder
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
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
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
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
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue 0
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'vTessellation', 0.0); //should be SFInt32
            
            /**
             * uKnot and vKnot define the knot values of the surface in the u and v dimensions.
             * @var {x3dom.fields.MFDouble} uKnot
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'uKnot', []);
            
            /**
             * uKnot and vKnot define the knot values of the surface in the u and v dimensions.
             * @var {x3dom.fields.MFDouble} vKnot
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue []
             * @range [-inf, inf]
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'vKnot', []);
            
            /**
             * control point weights: P[i,j].w = weight[ i + (j × uDimension)]
             * @var {x3dom.fields.MFDouble} weight
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
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
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue null
             * @field x3d
             * @instance
             */
            this.addField_SFNode('controlPoint', x3dom.nodeTypes.X3DCoordinateNode);
            
            /**
             * NYI: uClosed and vClosed define whether or not the specific dimension is to be evaluated as a closed surface
             * along the u and v directions, respectively.
             * @var {x3dom.fields.SFBool} uClosed
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'uClosed', false); //NYI
            
            /**
             * NYI: uClosed and vClosed define whether or not the specific dimension is to be evaluated as a closed surface
             * along the u and v directions, respectively.
             * @var {x3dom.fields.SFBool} vClosed
             * @memberof x3dom.nodeTypes.NurbsPatchSurface
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'vClosed', false); //NYI
            
            //texCoord; needed when properly derived
            //solid
            
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            
            this._needReRender = true;
            this._myctx = ctx;
        },
        {
            nodeChanged: function() {
                x3dom.nodeTypes.NurbsTrimmedSurface.prototype.nodeChanged.call(this);
		            return;
            },
            fieldChanged: function(fieldName) {
		            this.nodeChanged();
            },
            createCoarseITS: function(node) { //X3DNurbsSurfaceGeometryNode
                var w = node._vf.uDimension;
                var h = node._vf.vDimension;
                var coordNode = node._cf.controlPoint.node;

                var its = new x3dom.nodeTypes.IndexedTriangleSet();
                its._nameSpace = node._nameSpace;
                its._vf.solid = false;
                its._vf.ccw = false;
                var ind = [], i1 = 0, i2 = w;
                for(var i = 0; i < h-1; i++){
                for(var j = 0; j < w-1; j++){
                    ind.push(i1);
                    ind.push(i1+1);
                    ind.push(i2);
                    ind.push(i2);
                    ind.push(i1+1);
                    ind.push(i2+1);
                    i1++;
                    i2++;
                }
                i1++;
                i2++;
                }
                its._vf.index = ind;

                its.addChild(coordNode)
                if(0){
                var tc = new x3dom.nodeTypes.TextureCoordinate();
                tc._nameSpace = node._nameSpace;
                tc._vf.point = new x3dom.fields.MFVec2f(data[2]/*tess.texcoords*/);
                its.addChild(tc)
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
                for(var i = 0; i < data[1].length; i++)
                co._vf.point.push(
                      new x3dom.fields.SFVec3f(data[1][i][0],data[1][i][1],data[1][i][2]));
                its.addChild(co);
                var tc = new x3dom.nodeTypes.TextureCoordinate();
                tc._nameSpace = node._nameSpace;
                tc._vf.point = new x3dom.fields.MFVec2f();
                for(var i = 0; i < data[2].length; i++)
                tc._vf.point.push(
                    new x3dom.fields.SFVec2f(data[2][i][0],data[2][i][1]));
                its.addChild(tc);
                its.nodeChanged();
                its._xmlNode = node._xmlNode;
                return its;
            } /* createITS */
        }
    )
);