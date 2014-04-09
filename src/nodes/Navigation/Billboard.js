/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Billboard ### */
x3dom.registerNodeType(
    "Billboard",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Billboard.superClass.call(this, ctx);

            // When the axisOfRotation field is set to (0, 0, 0),
            // the special case of viewer-alignment is indicated.
            this.addField_SFVec3f(ctx, 'axisOfRotation', 0, 1, 0);

            this._eye = new x3dom.fields.SFVec3f(0, 0, 0);
            this._eyeViewUp = new x3dom.fields.SFVec3f(0, 0, 0);
            this._eyeLook = new x3dom.fields.SFVec3f(0, 0, 0);
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask)
            {
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask <= 0) {
                    return;
                }

                // no caching later on as transform changes almost every frame anyway
                singlePath = false;

                var vol = this.getVolume();

                var min = x3dom.fields.SFVec3f.MAX();
                var max = x3dom.fields.SFVec3f.MIN();
                vol.getBounds(min, max);

                var mat_view = drawableCollection.viewMatrix;

                var center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
                center = mat_view.inverse().multMatrixPnt(center);

                var mat_view_model = mat_view.mult(transform);
                this._eye = transform.inverse().multMatrixPnt(center);
                this._eyeViewUp = new x3dom.fields.SFVec3f(mat_view_model._10, mat_view_model._11, mat_view_model._12);
                this._eyeLook = new x3dom.fields.SFVec3f(mat_view_model._20, mat_view_model._21, mat_view_model._22);

                var rotMat = x3dom.fields.SFMatrix4f.identity();
                var mid = max.add(min).multiply(0.5);
                var billboard_to_viewer = this._eye.subtract(mid);

                if(this._vf.axisOfRotation.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)) {
                    var rot1 = x3dom.fields.Quaternion.rotateFromTo(
                        billboard_to_viewer, new x3dom.fields.SFVec3f(0, 0, 1));
                    rotMat = rot1.toMatrix().transpose();

                    var yAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 1, 0)).normalize();
                    var zAxis = rotMat.multMatrixPnt(new x3dom.fields.SFVec3f(0, 0, 1)).normalize();

                    if(!this._eyeViewUp.equals(new x3dom.fields.SFVec3f(0, 0, 0), x3dom.fields.Eps)) {
                        // new local z-axis aligned with camera z-axis
                        var rot2 = x3dom.fields.Quaternion.rotateFromTo(this._eyeLook, zAxis);
                        // new: local y-axis rotated by rot2
                        var rotatedyAxis = rot2.toMatrix().transpose().multMatrixVec(yAxis);
                        // new: rotated local y-axis aligned with camera y-axis
                        var rot3 = x3dom.fields.Quaternion.rotateFromTo(this._eyeViewUp, rotatedyAxis);

                        rotMat = rot2.toMatrix().transpose().mult(rotMat);
                        rotMat = rot3.toMatrix().transpose().mult(rotMat);
                    }
                }
                else {
                    var normalPlane = this._vf.axisOfRotation.cross(billboard_to_viewer).normalize();

                    if(this._eye.z < 0) {
                        normalPlane = normalPlane.multiply(-1);
                    }

                    var degreesToRotate = Math.asin(normalPlane.dot(new x3dom.fields.SFVec3f(0, 0, 1)));

                    if(this._eye.z < 0) {
                        degreesToRotate += Math.PI;
                    }

                    rotMat = x3dom.fields.SFMatrix4f.parseRotation(
                            this._vf.axisOfRotation.x + ", " + this._vf.axisOfRotation.y + ", " +
                            this._vf.axisOfRotation.z + ", " + degreesToRotate*(-1));
                }

                var childTransform = this.transformMatrix(transform.mult(rotMat));

                for (var i=0, i_n=this._childNodes.length; i<i_n; i++)
                {
                    var cnode = this._childNodes[i];
                    if (cnode) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
        }
    )
);