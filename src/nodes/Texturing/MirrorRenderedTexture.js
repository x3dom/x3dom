/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// TODO; remove this node, use GeneratedCubeMapTexture instead!!!
/* ### MirrorRenderedTexture ### */
x3dom.registerNodeType(
    "MirrorRenderedTexture",
    "Texturing",
    defineClass(x3dom.nodeTypes.RenderedTexture,
        function (ctx) {
            x3dom.nodeTypes.MirrorRenderedTexture.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'viewOffset', 0, 0, 0);
        },
        {
            getViewMatrix: function ()
            {
                if (this._clearParents && this._cf.excludeNodes.nodes.length) {
                    var that = this;

                    Array.forEach(this._cf.excludeNodes.nodes, function(node) {
                        for (var i=0, n=node._parentNodes.length; i < n; i++) {
                            if (node._parentNodes[i] === that) {
                                node._parentNodes.splice(i, 1);
                                node.parentRemoved(that);
                            }
                        }
                    });

                    this._clearParents = false;
                }

                var vbP = this._nameSpace.doc._scene.getViewpoint();
                var view = this._cf.viewpoint.node;
                var ret_mat = null;

                if (view === null || view === vbP) {
                    ret_mat = this._nameSpace.doc._viewarea.getViewMatrix();    // viewOffset?!
                }
                else {
                    // Grab only the translation to pass it to the final transform matrix
                    var mat_transform = view.getCurrentTransform();
                    var mat_translate = new x3dom.fields.SFMatrix4f(
                        1, 0, 0, mat_transform._03 + this._vf.viewOffset.x,
                        0, 1, 0, mat_transform._13 + this._vf.viewOffset.y,
                        0, 0, 1, mat_transform._23 + this._vf.viewOffset.z,
                        0, 0, 0, 1).inverse();
                    ret_mat = view.getViewMatrix().mult(mat_translate);
                }

                return ret_mat;
            }
        }
    )
);