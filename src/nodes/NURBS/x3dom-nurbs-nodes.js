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

/* NURBS for x3dom */

function createITS(data, node) {
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

function createCoarseITS(node) {
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
} /* createCoarseITS */


function tessProgress(x3de, onoff) {
    if(!x3de.tessProgressDiv) {
	var progressDiv = document.createElement('div');
	progressDiv.setAttribute('class', 'x3dom-progress');
	var _text = document.createElement('strong');
	_text.appendChild(document.createTextNode('Tessellating...'));
	progressDiv.appendChild(_text);
	var _inner = document.createElement('span');
	_inner.setAttribute('style', 'width: 25%;');
	_inner.appendChild(document.createTextNode(' '));
	progressDiv.appendChild(_inner);
	x3de.tessProgressDiv = progressDiv;
	x3de.appendChild(progressDiv);
    }
    var pd = x3de.tessProgressDiv;
    if(onoff)
	pd.style.display = 'inline';
    else
	pd.style.display = 'none';
} /* tessProgress */


x3dom.registerNodeType(
    "NurbsPatchSurface",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.NurbsPatchSurface.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'uDimension', 0);
            this.addField_SFInt32(ctx, 'vDimension', 0);
            this.addField_SFInt32(ctx, 'uOrder', 3);
            this.addField_SFInt32(ctx, 'vOrder', 3);
            this.addField_SFFloat(ctx, 'uTessellation', 0.0);
            this.addField_SFFloat(ctx, 'vTessellation', 0.0);
            this.addField_MFFloat(ctx, 'uKnot', []);
            this.addField_MFFloat(ctx, 'vKnot', []);
            this.addField_MFFloat(ctx, 'weight', []);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            this.addField_SFNode('controlPoint',
				 x3dom.nodeTypes.X3DCoordinateNode);
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
            }
        }
    )
);

x3dom.registerNodeType(
    "NurbsCurve2D",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.NurbsCurve2D.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'order', 3);
            this.addField_MFFloat(ctx, 'knot', []);
            this.addField_MFFloat(ctx, 'controlPoint', []);
            this.addField_MFFloat(ctx, 'weight', []);
	}, { }
    )
);

x3dom.registerNodeType(
    "ContourPolyline2D",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.ContourPolyline2D.superClass.call(this, ctx);
            this.addField_MFFloat(ctx, 'controlPoint', []);
	}, { }
    )
);

x3dom.registerNodeType(
    "Contour2D",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Contour2D.superClass.call(this, ctx);
            this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);
	}, { }
    )
);

x3dom.registerNodeType(
    "NurbsTrimmedSurface",
    "Rendering",
    defineClass(x3dom.nodeTypes.NurbsPatchSurface,
        function (ctx) {
            x3dom.nodeTypes.NurbsTrimmedSurface.superClass.call(this, ctx);

            this.addField_MFNode('trimmingContour', x3dom.nodeTypes.Contour2D);
            this._needReRender = true;
	    this._myctx = ctx;
        },
        {
            nodeChanged: function() {
                this._needReRender = true;
		this._vf.ccw = false;
		this._vf.solid = false;
		this._vf.useGeoCache = false;
		if(!this._hasCoarseMesh){
		    var its = createCoarseITS(this);
		    this._mesh = its._mesh;
		    this._hasCoarseMesh = true;
		}

		var x3de = this._myctx.doc._x3dElem;
		tessProgress(x3de, true);

		var T = [];
		if(this._cf.trimmingContour &&
		   this._cf.trimmingContour.nodes.length) {
		    var len = this._cf.trimmingContour.nodes.length;
		    for(var i = 0; i < len; i++) {
			var c2dnode = this._cf.trimmingContour.nodes[i];
			if(c2dnode._cf.children) {
			    T[i] = [];
			    var trim = c2dnode._cf.children.nodes;
			    for(var j = 0; j < trim.length; j++) {
				var tc = trim[j];
				// convert polyline to NURBS
				if(!tc._vf.order) {
				    tc._vf.order = 2;
				}
				if(!tc._vf.knot) {
				    var knots = [];
				    knots.push(0);
				    knots.push(0);
				    for(var k = 2;
					k < tc._vf.controlPoint.length/2; k++)
					knots.push(k-1);
				    knots.push(knots[knots.length-1]+1);
				    knots.push(knots[knots.length-1]);
				    tc._vf.knot = knots;
				}
				T[i].push([tc._vf.controlPoint.length-1,
					   tc._vf.order-1, tc._vf.knot,
					   tc._vf.controlPoint, tc._vf.weight]);
			    }
			}
		    }
		}

		var onmessage = function(e) {
		    if(e.data.length >= 3){
			var its = createITS(e.data, this.caller);
			this.caller.workerTask = null;
			this.caller._mesh = its._mesh;
			if(this.caller._cleanupGLObjects)
			    this.caller._cleanupGLObjects(true);
			Array.forEach(this.caller._parentNodes,
				      function (node) {
					  node.setAllDirty();
				      });
			if(tessWorkerPool.taskQueue.length == 0) {
			    var x3de = this.caller._myctx.doc._x3dElem;
			    tessProgress(x3de, false);
			}
			this.caller._nameSpace.doc.needRender = true;
		    }
		}
		var coordNode = this._cf.controlPoint.node;
		x3dom.debug.assert(coordNode);
		var startmessage = [this._vf.uDimension-1,
				    this._vf.vDimension-1,
				    this._vf.uOrder-1, this._vf.vOrder-1,
				    this._vf.uKnot, this._vf.vKnot,
				    coordNode.getPoints(),
				    this._vf.weight,
				    this._vf.uTessellation,
				    this._vf.vTessellation,
				    T];

		if(this.workerTask)
		    this.workerTask.discard = true;

		this.workerTask = new WorkerTask('x3dom-nurbs-worker.js',
						 this, onmessage, startmessage);

		tessWorkerPool.addWorkerTask(this.workerTask);
            },
            fieldChanged: function(fieldName) {
		this.nodeChanged();
            }

        }
    )
);
