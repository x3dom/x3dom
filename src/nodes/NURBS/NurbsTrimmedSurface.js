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

/* ### NurbsTrimmedSurface ### */
x3dom.registerNodeType(
    "NurbsTrimmedSurface",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode, //NurbsPatchSurface
        
        /**
         * Constructor for NurbsTrimmedSurface
         * @constructs x3dom.nodeTypes.NurbsTrimmedSurface
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode //NurbsPatchSurface
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsTrimmedSurface node defines a NURBS surface that is trimmed by a set of trimming loops.
         */
         
        function (ctx) {
            x3dom.nodeTypes.NurbsTrimmedSurface.superClass.call(this, ctx);
            
            /**
             * The trimmingContour field, if specified, shall contain a set of Contour2D nodes. Trimming loops shall be processed
             * as described for the Contour2D node. If no trimming contours are defined, the NurbsTrimmedSurface node shall have
             * the same semantics as the NurbsPatchSurface node.
             * @var {x3dom.fields.MFNode} trimmingContour
             * @memberof x3dom.nodeTypes.NurbsTrimmedSurface
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFNode('trimmingContour', x3dom.nodeTypes.Contour2D);
            
            this._needReRender = true;
        },
        {
            nodeChanged: function() {
                this._needReRender = true;
                this._vf.ccw = false;
                this._vf.solid = false;
                this._vf.useGeoCache = false;
                if(!this._hasCoarseMesh){
                    var its = this.createCoarseITS(this);
                    this._mesh = its._mesh;
                    this._hasCoarseMesh = true;
                }

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
                      k < tc._vf.controlPoint.length; k++) //controlPoint.length when MFVec2f, was /2
                      knots.push(k-1);
                        knots.push(knots[knots.length-1]+1);
                        knots.push(knots[knots.length-1]);
                        tc._vf.knot = knots;
                    }
                    T[i].push([tc._vf.controlPoint.length-1, //T[0] needs attention when MFVec2f
                         tc._vf.order-1, tc._vf.knot,
                         tc._vf.controlPoint, tc._vf.weight]); //T[3] needs attention when MFVec2f
                      }
                  }
                    }
                }

                var onmessage = function(e) {
                  if(e.data.length >= 3){
		            if (this.caller.uv.length) {
                        var data = e.data[1];
                        var point = new x3dom.fields.MFVec3f();
                        for(var i = 0; i < data.length; i++)
                            point.push(
                                new x3dom.fields.SFVec3f(data[i][0],data[i][1],data[i][2]));
                        
                        this.caller._mesh.positions[0] = point.toGL();
                    } else {
                      var its = this.caller.createITS(e.data, this.caller);
                      this.caller.workerTask = null;
                      this.caller._mesh = its._mesh;
                    }
                      if(this.caller._cleanupGLObjects)
                          this.caller._cleanupGLObjects(true);
                      Array.forEach(this.caller._parentNodes,
                          function (node) {
                            node.setAllDirty();
                          });
                      var x3de = this.caller._nameSpace.doc._x3dElem;
                      var tasks = x3dom.tessWorkerPool.taskQueue.length;
                      x3de.runtime.canvas.progressText = tasks == 0 ? "" : "Tesselation tasks: " + tasks;
                      this.caller._nameSpace.doc.needRender = true;
                      this.caller.basisFunsCache = e.data[3];
                      this.caller.uv = e.data[4];
                  }
                }
		
                var coordNode = this._cf.controlPoint.node;
                //x3dom.debug.assert(coordNode);
                var startmessage = [
                        this._vf.uDimension-1,
                        this._vf.vDimension-1,
                        this._vf.uOrder-1, this._vf.vOrder-1,
                        this._vf.uKnot, this._vf.vKnot,
                        coordNode.getPoints(),
                        this._vf.weight,
                        this._vf.uTessellation,
                        this._vf.vTessellation,
                        T,
                        this.basisFunsCache,
                        this.uv
                ];

                if(this.workerTask)
                    this.workerTask.discard = true;

                this.workerTask = new x3dom.WorkerTask(x3dom.tessWorkerScript, //global script
                         this, onmessage, startmessage);

                x3dom.tessWorkerPool.addWorkerTask(this.workerTask); //global pool
            },
            fieldChanged: function(fieldName) {
                    if (fieldName == 'order' || fieldName == 'knot') {
                        this.basisFunsCache = new Map();
                        this.uv = [];
                    }
                    this.nodeChanged();
            }
        }
    )
);
