/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

// ### X3DGroupingNode ###
x3dom.registerNodeType(
    "X3DGroupingNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DGroupingNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'render', true);
            this.addField_MFNode('children', x3dom.nodeTypes.X3DChildNode);
            // FIXME; add addChild and removeChild slots ?
        },
        {
            // Collects array of [transform matrix, node] for all objects that should be drawn.
            collectDrawableObjects: function (transform, out)
            {
                if (!this._vf.render) {
                    return;
                }

                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        var childTransform = this._childNodes[i].transformMatrix(transform);
                        this._childNodes[i].collectDrawableObjects(childTransform, out);
                    }
                }
            }
        }
    )
);

// ### Switch ###
x3dom.registerNodeType(
    "Switch",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Switch.superClass.call(this, ctx);

            this.addField_SFInt32(ctx, 'whichChoice', -1);
        },
        {
            getVolume: function (min, max, invalidate)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return false;
                }

                if (this._childNodes[this._vf.whichChoice]) {
                    return this._childNodes[this._vf.whichChoice].getVolume(min, max, invalidate);
                }

                return false;
            },

            find: function (type)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return null;
                }

                if (this._childNodes[this._vf.whichChoice]) {
                    if (this._childNodes[this._vf.whichChoice].constructor == type) {
                        return this._childNodes[this._vf.whichChoice];
                    }

                    var c = this._childNodes[this._vf.whichChoice].find(type);
                    if (c) {
                        return c;
                    }
                }

                return null;
            },

            findAll: function (type)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return [];
                }

                var found = [];

                if (this._childNodes[this._vf.whichChoice]) {
                    if (this._childNodes[this._vf.whichChoice].constructor == type) {
                        found.push(this._childNodes[this._vf.whichChoice]);
                    }

                    found = found.concat(this._childNodes[this._vf.whichChoice].findAll(type));
                }

                return found;
            },

            // Collects array of [transform matrix, node] for all objects that should be drawn.
            collectDrawableObjects: function (transform, out)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return;
                }

                if (this._childNodes[this._vf.whichChoice]) {
                    var childTransform = this._childNodes[this._vf.whichChoice].transformMatrix(transform);
                    this._childNodes[this._vf.whichChoice].collectDrawableObjects(childTransform, out);
                }
            },

            doIntersect: function(line)
            {
                if (this._vf.whichChoice < 0 ||
                    this._vf.whichChoice >= this._childNodes.length) {
                    return false;
                }

                if (this._childNodes[this._vf.whichChoice]) {
                    return this._childNodes[this._vf.whichChoice].doIntersect(line);
                }

                return false;
            }
        }
    )
);

// ### X3DTransformNode ###
x3dom.registerNodeType(
    "X3DTransformNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.X3DTransformNode.superClass.call(this, ctx);

            ctx.doc._nodeBag.trans.push(this);

            // holds the current matrix (local space transform)
            this._trafo = null;
        },
        {
            tick: function(t)
            {
              if( this._xmlNode && (
                    this._xmlNode['transform'] ||
                    this._xmlNode.hasAttribute('transform') ||
                    this._listeners['transform'])
              )
              {
                var transMatrix = this.getCurrentTransform();
                
                var event = {
                  target: {},
                  type: 'transform',
                  worldX: transMatrix._03,
                  worldY: transMatrix._13,
                  worldZ: transMatrix._23,
                  stopPropagation: function() { this.cancelBubble = true; }
                };
                
                var attrib = this._xmlNode[event.type];
                
                if (typeof(attrib) === "function")
                  attrib.call(this._xmlNode, event);
                else
                {
                  var funcStr = this._xmlNode.getAttribute(event.type);
                  var func = new Function('event', funcStr);
                  func.call(this._xmlNode, event);
                }

                var list = this._listeners[event.type];
                if (list)
                  for (var it=0; it<list.length; it++)
                    list[it].call(this._xmlNode, event);
              }
              
              // temporary per frame update method for CSS-Transform
              var trans = x3dom.getStyle(this._xmlNode, "-webkit-transform");
              //x3dom.debug.logInfo('set css-trans: ' + this._DEF + ' to ' + trans);
              if (trans && (trans != 'none')) {
                  this._trafo.setValueByStr(trans);
                  //x3dom.debug.logInfo(' valid set:' + this._trafo);
                  return true;
              }

              return false;
            },

            transformMatrix: function(transform) {
                return transform.mult(this._trafo);
            },

            getVolume: function(min, max, invalidate)
            {
                var nMin = x3dom.fields.SFVec3f.MAX();
                var nMax = x3dom.fields.SFVec3f.MIN();
                var valid = false;

                for (var i=0, n=this._childNodes.length; i<n; i++)
                {
                    if (this._childNodes[i])
                    {
                        var childMin = x3dom.fields.SFVec3f.MAX();
                        var childMax = x3dom.fields.SFVec3f.MIN();

                        valid = this._childNodes[i].getVolume(
                                        childMin, childMax, invalidate) || valid;

                        if (valid)  // values only set by Mesh.BBox()
                        {
                            if (nMin.x > childMin.x) {nMin.x = childMin.x;}
                            if (nMin.y > childMin.y) {nMin.y = childMin.y;}
                            if (nMin.z > childMin.z) {nMin.z = childMin.z;}

                            if (nMax.x < childMax.x) {nMax.x = childMax.x;}
                            if (nMax.y < childMax.y) {nMax.y = childMax.y;}
                            if (nMax.z < childMax.z) {nMax.z = childMax.z;}
                        }
                    }
                }

                if (valid)
                {
                    nMin = this._trafo.multMatrixPnt(nMin);
                    nMax = this._trafo.multMatrixPnt(nMax);

                    min.x = nMin.x < nMax.x ? nMin.x : nMax.x;
                    min.y = nMin.y < nMax.y ? nMin.y : nMax.y;
                    min.z = nMin.z < nMax.z ? nMin.z : nMax.z;

                    max.x = nMax.x > nMin.x ? nMax.x : nMin.x;
                    max.y = nMax.y > nMin.y ? nMax.y : nMin.y;
                    max.z = nMax.z > nMin.z ? nMax.z : nMin.z;
                }
                return valid;
            },

            doIntersect: function(line)
            {
                var isect = false;
                var mat = this._trafo.inverse();

                var tmpPos = new x3dom.fields.SFVec3f(line.pos.x, line.pos.y, line.pos.z);
                var tmpDir = new x3dom.fields.SFVec3f(line.dir.x, line.dir.y, line.dir.z);

                line.pos = mat.multMatrixPnt(line.pos);
                line.dir = mat.multMatrixVec(line.dir);

                if (line.hitObject) {
                    line.dist *= line.dir.length();
                }

                // check for _nearest_ hit object and don't stop on first!
                for (var i=0; i<this._childNodes.length; i++)
                {
                    if (this._childNodes[i]) {
                        isect = this._childNodes[i].doIntersect(line) || isect;
                    }
                }

                line.pos.setValues(tmpPos);
                line.dir.setValues(tmpDir);

                if (isect) {
                    line.hitPoint = this._trafo.multMatrixPnt(line.hitPoint);
                    line.dist *= line.dir.length();
                }

                return isect;
            },

            parentRemoved: function(parent)
            {
                var i;
                var n;
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (i=0, n=doc._nodeBag.trans.length; i<n; i++) {
                        if (doc._nodeBag.trans[i] === this) {
                            doc._nodeBag.trans.splice(i, 1);
                        }
                    }
                }

                for (i=0, n=this._childNodes.length; i<n; i++) {
                    if (this._childNodes[i]) {
                        this._childNodes[i].parentRemoved(this);
                    }
                }
            }
        }
    )
);

// ### Transform ###
x3dom.registerNodeType(
    "Transform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        function (ctx) {
            x3dom.nodeTypes.Transform.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

            // P' = T * C * R * SR * S * -SR * -C * P
            this._trafo = x3dom.fields.SFMatrix4f.translation(
                    this._vf.translation.add(this._vf.center)).
                mult(this._vf.rotation.toMatrix()).
                mult(this._vf.scaleOrientation.toMatrix()).
                mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                mult(this._vf.scaleOrientation.toMatrix().inverse()).
                mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
        },
        {
            fieldChanged: function (fieldName) {
                // P' = T * C * R * SR * S * -SR * -C * P
                this._trafo = x3dom.fields.SFMatrix4f.translation(
                                this._vf.translation.add(this._vf.center)).
                            mult(this._vf.rotation.toMatrix()).
                            mult(this._vf.scaleOrientation.toMatrix()).
                            mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                            mult(this._vf.scaleOrientation.toMatrix().inverse()).
                            mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
            }
        }
    )
);

// ### MatrixTransform ###
x3dom.registerNodeType(
    "MatrixTransform",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DTransformNode,
        function (ctx) {
            x3dom.nodeTypes.MatrixTransform.superClass.call(this, ctx);

            this.addField_SFMatrix4f(ctx, 'matrix', 1, 0, 0, 0,
                                                    0, 1, 0, 0,
                                                    0, 0, 1, 0,
                                                    0, 0, 0, 1);
            this._trafo = this._vf.matrix;
        },
        {
        }
    )
);

// ### Group ###
x3dom.registerNodeType(
    "Group",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
        },
        {
        }
    )
);

// ### StaticGroup ###
x3dom.registerNodeType(
    "StaticGroup",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.StaticGroup.superClass.call(this, ctx);

            // FIXME; implement optimizations; no need to maintain the children's
            // X3D representations, as they cannot be accessed after creation time
            x3dom.debug.logWarning("StaticGroup NYI");
        }
    )
);

// Not a real X3D node type
// TODO; refactor to Scene + Viewarea node --> via Layering component?

// ### Scene ###
x3dom.registerNodeType(
    "Scene",
    "Core",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);

            // define the experimental picking mode:
            // box, exact (NYI), idBuf, color, texCoord
            this.addField_SFString(ctx, 'pickMode', "idBuf");
        },
        {
            /* bindable getter (e.g. getViewpoint) are added automatically */
        }
    )
);
/* ### END OF NODES ###*/

