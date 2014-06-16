/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### DynamicLOD ###
x3dom.registerNodeType(
    "DynamicLOD",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        
        /**
         * Constructor for DynamicLOD
         * @constructs x3dom.nodeTypes.DynamicLOD
         * @x3d x.x
         * @component Navigation
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.DynamicLOD.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFFloat} subScale
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue 0.5
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subScale', 0.5);

            /**
             *
             * @var {x3dom.fields.SFVec2f} size
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue 2,2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'size', 2, 2);

            /**
             *
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);

            /**
             *
             * @var {x3dom.fields.SFNode} root
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue x3dom.nodeTypes.X3DShapeNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode ('root', x3dom.nodeTypes.X3DShapeNode);


            /**
             *
             * @var {x3dom.fields.SFString} urlHead
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue "http://r"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'urlHead', "http://r");

            /**
             *
             * @var {x3dom.fields.SFString} urlCenter
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue ".ortho.tiles.virtualearth.net/tiles/h"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'urlCenter', ".ortho.tiles.virtualearth.net/tiles/h");

            /**
             *
             * @var {x3dom.fields.SFString} urlTail
             * @memberof x3dom.nodeTypes.DynamicLOD
             * @initvalue ".png?g=-1"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'urlTail', ".png?g=-1");

            this.rootGeometry = new x3dom.nodeTypes.Plane(ctx);
            this.level = 0;
            this.quadrant = 4;
            this.cell = "";
        
        },
        {
            nodeChanged: function()
            {
                var root = this._cf.root.node;

                if (root == null || root._cf.geometry.node != null)
                    return;

                this.rootGeometry._vf.size.setValues(this._vf.size);
                this.rootGeometry._vf.subdivision.setValues(this._vf.subdivision);
                this.rootGeometry._vf.center.setValues(this._vf.center);
                this.rootGeometry.fieldChanged("subdivision");   // trigger update

                this._cf.root.node.addChild(this.rootGeometry);  // add to shape
                this.rootGeometry.nodeChanged();

                this._cf.root.node.nodeChanged();

                this._nameSpace.doc.needRender = true;
            },

            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                var root = this._cf.root.node;

                if (root == null)
                    return;

                var mat_view = drawableCollection.viewMatrix;

                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);

                //var mat_view_model = mat_view.mult(transform);
                this._eye = transform.inverse().multMatrixPnt(center);

                var l, len = this._vf.center.subtract(this._eye).length();

                //calculate range check for viewer distance d (with range in local coordinates)
                if (len > x3dom.fields.Eps && len * this._vf.subScale <= this._vf.size.length()) {
                    /*  Quadrants per level: (TODO; make parameterizable, e.g. 0 and 1 might be swapped)
                     0 | 1
                     -----
                     2 | 3
                     */
                    if (this._childNodes.length <= 1) {
                        var offset = new Array(
                            new x3dom.fields.SFVec3f(-0.25*this._vf.size.x,  0.25*this._vf.size.y, 0),
                            new x3dom.fields.SFVec3f( 0.25*this._vf.size.x,  0.25*this._vf.size.y, 0),
                            new x3dom.fields.SFVec3f(-0.25*this._vf.size.x, -0.25*this._vf.size.y, 0),
                            new x3dom.fields.SFVec3f( 0.25*this._vf.size.x, -0.25*this._vf.size.y, 0)
                        );

                        for (l=0; l<4; l++) {
                            var node = new x3dom.nodeTypes.DynamicLOD();

                            node._nameSpace = this._nameSpace;
                            node._eye.setValues(this._eye);

                            node.level = this.level + 1;
                            node.quadrant = l;
                            node.cell = this.cell + l;

                            node._vf.urlHead = this._vf.urlHead;
                            node._vf.urlCenter = this._vf.urlCenter;
                            node._vf.urlTail = this._vf.urlTail;

                            node._vf.center = this._vf.center.add(offset[l]);
                            node._vf.size = this._vf.size.multiply(0.5);
                            node._vf.subdivision.setValues(this._vf.subdivision);

                            var app = new x3dom.nodeTypes.Appearance();

                            //var mat = new x3dom.nodeTypes.Material();
                            //mat._vf.diffuseColor = new x3dom.fields.SFVec3f(Math.random(),Math.random(),Math.random());
                            //
                            //app.addChild(mat);
                            //mat.nodeChanged();

                            var tex = new x3dom.nodeTypes.ImageTexture();
                            tex._nameSpace = this._nameSpace;
                            tex._vf.url[0] = this._vf.urlHead + node.quadrant + this._vf.urlCenter + node.cell + this._vf.urlTail;
                            //x3dom.debug.logInfo(tex._vf.url[0]);

                            app.addChild(tex);
                            tex.nodeChanged();

                            var shape = new x3dom.nodeTypes.Shape();
                            shape._nameSpace = this._nameSpace;

                            shape.addChild(app);
                            app.nodeChanged();

                            node.addChild(shape, "root");
                            shape.nodeChanged();

                            this.addChild(node);
                            node.nodeChanged();
                        }
                    }
                    else {
                        for (l=1; l<this._childNodes.length; l++) {
                            this._childNodes[l].collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                        }
                    }
                }
                else {
                    root.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                }
            },

            getVolume: function() {
                var vol = this._graph.volume;

                if (!vol.isValid()) {
                    vol.min.setValues(this._vf.center);
                    vol.min.x -= 0.5 * this._vf.size.x;
                    vol.min.y -= 0.5 * this._vf.size.y;
                    vol.min.z -= x3dom.fields.Eps;

                    vol.max.setValues(this._vf.center);
                    vol.max.x += 0.5 * this._vf.size.x;
                    vol.max.y += 0.5 * this._vf.size.y;
                    vol.max.z += x3dom.fields.Eps;
                }

                return vol;
            }
        }
    )
);