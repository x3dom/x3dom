/*
 * Copyrigth (C) 2014 TOSHIBA
 * Dual licensed under the MIT and GPL licenses.
 *
 * Based on code originally provided by
 * http://www.x3dom.org
 *
 */

/* ### ScreenGroup ### */
x3dom.registerNodeType(
    "ScreenGroup",
    "Layout",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,

        /**
         * Constructor for ScreenGroup
         * N.B. Screengroup is not meant to work with any viewpoint other than
         * a regular, perspective viewpoint.
         * @constructs x3dom.nodeTypes.ScreenGroup
         * @x3d 3.3
         * @component Layout
         * @author armand.girier@toshiba.co.jp
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Add a class description here.
         */
        function (ctx) {
            x3dom.nodeTypes.ScreenGroup.superClass.call(this, ctx);
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {

                // This is taken "as is" from Billboard

                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask < 0) {
                    return;
                }

                // no caching later on as transform changes almost every frame anyway
                singlePath = false;

  // End of code borrowed from Billboard, Screengroup's scale computing starts
  // here.

  // Computes the scaling ratio applied to an object depending on its distance
  // to the camera. A dot　product is performed between said distance and the
  // camera direction, since it is the relevant value to compute the perspective
  // scale.
  // All positions and directions are converted to the camera's coordinates.

                var doc,        // The current X3D document.
                    vp,         // The current viewpoint.
                    minus_one,  // (0, 0, -1), original view direction.
                    zero,       // (0, 0, 0), local position of the screengroup and camera.
                    viewport_height,
                    one_to_one_pixel_depth, //The depth at which an object of size S looks S pixels big.
                    view_transform,
                    view_direction,
                    model_transform,
                    camera_position,
                    screengroup_position,
                    viewpoint_to_screengroup,
                    ratio,      // The scaling ratio to make the screen group size in pixels.
                    scale_matrix; // The matrix for the scaling.


                doc = this._nameSpace.doc;
                vp = doc._scene.getViewpoint();

                viewport_height = doc._x3dElem.clientHeight;
                one_to_one_pixel_depth = viewport_height / vp.getImgPlaneHeightAtDistOne();

                minus_one = new x3dom.fields.SFVec3f(0, 0, -1.0);
                zero = new x3dom.fields.SFVec3f(0, 0, 0);

                view_transform = drawableCollection.viewMatrix;
                model_transform = transform;

                view_direction = minus_one; // In camera's coordinates

                camera_position = zero; // In camera's coordinates

                screengroup_position = view_transform.multMatrixPnt(
                  model_transform.multMatrixPnt(zero)
                ); // In camera's coordinates


                viewpoint_to_screengroup = screengroup_position.subtract(camera_position);

                ratio = view_direction.dot(viewpoint_to_screengroup) / one_to_one_pixel_depth;

                scale_matrix = x3dom.fields.SFMatrix4f.scale(new x3dom.fields.SFVec3f(ratio, ratio, ratio));
                var childTransform = this.transformMatrix(model_transform.mult(scale_matrix));


                for (var i=0, i_n=this._childNodes.length; i<i_n; i++)
                {
                    var cnode = this._childNodes[i];
                    if (cnode) {
                        cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                    }
                }
            }
        }
    )
);
