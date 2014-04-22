/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DTransformNode ###
x3dom.registerNodeType(
    "X3DTransformNode",
    "Grouping",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for X3DTransformNode
         * @constructs x3dom.nodeTypes.X3DTransformNode
         * @x3d x.x
         * @component Grouping
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the basis for all node types that group and transform their children.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DTransformNode.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.trans.push(this);
            else
                x3dom.debug.logWarning("X3DTransformNode: No runtime context found!");

            // holds the current matrix (local space transform)
            this._trafo = null;

            // workaround, only check on init if getStyle is necessary, since expensive
            this._needCssStyleUpdates = true;
        
        },
        {
            tick: function (t)
            {
                var dom = this._xmlNode;

                if (dom && (dom['ontransform'] ||
                    dom.hasAttribute('ontransform') ||
                    this._listeners['transform'])) {
                    var transMatrix = this.getCurrentTransform();

                    var event = {
                        target: dom,
                        type: 'transform',
                        worldX: transMatrix._03,
                        worldY: transMatrix._13,
                        worldZ: transMatrix._23,
                        cancelBubble: false,
                        stopPropagation: function () {
                            this.cancelBubble = true;
                        }
                    };

                    this.callEvtHandler("ontransform", event);
                }

                // temporary per frame update method for CSS-Transform
                if (this._needCssStyleUpdates && dom) {
                    var trans = x3dom.getStyle(dom, "-webkit-transform") ||
                        x3dom.getStyle(dom, "-moz-transform") ||
                        x3dom.getStyle(dom, "-ms-transform") ||
                        x3dom.getStyle(dom, "transform");

                    if (trans && (trans != 'none')) {
                        this._trafo.setValueByStr(trans);

                        this.invalidateVolume();
                        //this.invalidateCache();

                        return true;
                    }
                    this._needCssStyleUpdates = false;    // no special CSS set
                }

                return false;
            },

            transformMatrix: function(transform) {
                return transform.mult(this._trafo);
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    this._graph.localMatrix = this._trafo;

                    for (var i=0, n=this._childNodes.length; i<n; i++)
                    {
                        var child = this._childNodes[i];
                        if (!child || child._vf.render !== true)
                            continue;

                        var childVol = child.getVolume();

                        if (childVol && childVol.isValid())
                            vol.extendBounds(childVol.min, childVol.max);
                    }

                    if (vol.isValid())
                        vol.transform(this._trafo);
                }

                return vol;
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
                var i, n;

                if (this._parentNodes.length == 0) {
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