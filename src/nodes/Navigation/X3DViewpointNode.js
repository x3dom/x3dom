/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DViewpointNode ### */
x3dom.registerNodeType(
    "X3DViewpointNode",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DViewpointNode
         * @constructs x3dom.nodeTypes.X3DViewpointNode
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A node of node type X3DViewpointNode defines a specific location in the local coordinate system from which the user may view the scene.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DViewpointNode.superClass.call(this, ctx);

            // attach some convenience accessor methods to dom/xml node
            if (ctx && ctx.xmlNode) {
                var domNode = ctx.xmlNode;

                if (!domNode.resetView && !domNode.getFieldOfView &&
                    !domNode.getNear && !domNode.getFar)
                {
                    domNode.resetView = function() {
                        var that = this._x3domNode;

                        that.resetView();
                        that._nameSpace.doc.needRender = true;
                    };

                    domNode.getFieldOfView = function() {
                        return this._x3domNode.getFieldOfView();
                    };

                    domNode.getNear = function() {
                        return this._x3domNode.getNear();
                    };

                    domNode.getFar = function() {
                        return this._x3domNode.getFar();
                    };
                }
            }
        
        },
        {
            activate: function (prev) {
                var viewarea = this._nameSpace.doc._viewarea;
                if (prev) {
                    viewarea.animateTo(this, prev._autoGen ? null : prev);
                }
                viewarea._needNavigationMatrixUpdate = true;

                x3dom.nodeTypes.X3DBindableNode.prototype.activate.call(this, prev);
                //x3dom.debug.logInfo ('activate ViewBindable ' + this._DEF + '/' + this._vf.description);
            },

            deactivate: function (prev) {
                x3dom.nodeTypes.X3DBindableNode.prototype.deactivate.call(this, prev);
                //x3dom.debug.logInfo ('deactivate ViewBindable ' + this._DEF + '/' + this._vf.description);
            },

            getTransformation: function() {
                return this.getCurrentTransform();
            },

            getCenterOfRotation: function() {
                return new x3dom.fields.SFVec3f(0, 0, 0);
            },

            setCenterOfRotation: function(cor) {
                this._vf.centerOfRotation.setValues(cor);   // method overwritten by Viewfrustum
            },

            getFieldOfView: function() {
                return 1.57079633;
            },

            /**
             * Sets the (local) view matrix
             * @param newView
             */
            setView: function(newView) {
                var mat = this.getCurrentTransform();
                this._viewMatrix = newView.mult(mat);
            },

            /**
             * Sets an absolute view matrix in world coordinates
             * @param newView
             */
            setViewAbsolute: function(newView)
            {
                this._viewMatrix = newView;
            },

            setProjectionMatrix: function(matrix)
            {

            },

            resetView: function() {
                // see derived class
            },

            getNear: function() {
                return 0.1;
            },

            getFar: function() {
                return 10000;
            },

            getImgPlaneHeightAtDistOne: function() {
                return 2.0;
            },

            getViewMatrix: function() {
                return null;
            },

            getProjectionMatrix: function(aspect) {
                return null;
            },

            setZoom: function( value ) {
                
            }
        }
    )
);
