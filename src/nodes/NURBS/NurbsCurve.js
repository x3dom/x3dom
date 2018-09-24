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
                return;
            },
            fieldChanged: function(fieldName) {
		            this.nodeChanged();
            },
            createCoarseILS: function(node) {
                var coordNode = node._cf.controlPoint.node;

                var ils = new x3dom.nodeTypes.IndexedLineSet();
                ils._nameSpace = node._nameSpace;
                var ind = [];
                for(var i = 0; i < coordNode.length-1; i++){
                    ind.push(i);
                    ind.push(i+1);
                    ind.push(-1);
                }
                
                ils._vf.index = ind;

                ils.addChild(coordNode);

                ils.nodeChanged();
                ils._xmlNode = node._xmlNode;
                return ils;
            }
        }
    )
);
