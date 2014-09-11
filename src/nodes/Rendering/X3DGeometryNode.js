/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DGeometryNode ### */
x3dom.registerNodeType(
    "X3DGeometryNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DGeometryNode
         * @constructs x3dom.nodeTypes.X3DGeometryNode
         * @x3d 3.3
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all geometry in X3D.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DGeometryNode.superClass.call(this, ctx);


            /**
             * Specifies whether backface-culling is used. If solid is TRUE only front-faces are drawn.
             * @var {x3dom.fields.SFBool} solid
             * @memberof x3dom.nodeTypes.X3DGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'solid', true);

            /**
             * The ccw field defines the ordering of the vertex coordinates of the geometry with respect to user-given or automatically generated normal vectors used in the lighting model equations.
             * @var {x3dom.fields.SFBool} ccw
             * @memberof x3dom.nodeTypes.X3DGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'ccw', true);

            /**
             * Most geo primitives use geo cache and others might later on, but one should be able to disable cache per geometry node.
             * @var {x3dom.fields.SFBool} useGeoCache
             * @memberof x3dom.nodeTypes.X3DGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'useGeoCache', true);

            /**
             * Specifies whether this geometry should be rendered with or without lighting.
             * @var {x3dom.fields.SFBool} lit
             * @memberof x3dom.nodeTypes.X3DGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'lit', true);

            // mesh object also holds volume (_vol)
            this._mesh = new x3dom.Mesh(this);
        
        },
        {
            getVolume: function() {
                // geometry doesn't hold volume, but mesh does
                return this._mesh.getVolume();
            },

            invalidateVolume: function() {
                this._mesh.invalidate();
            },

            getCenter: function() {
                return this._mesh.getCenter();
            },

            getDiameter: function() {
                return this._mesh.getDiameter();
            },

            doIntersect: function(line) {
                return this._mesh.doIntersect(line);
            },

            forceUpdateCoverage: function() {
                return false;
            },

            hasIndexOffset: function() {
                return false;
            },

            getColorTexture: function() {
                return null;
            },

            getColorTextureURL: function() {
                return null;
            },

            parentAdded: function(parent) {
                if (x3dom.isa(parent, x3dom.nodeTypes.X3DShapeNode)) {
                    if (parent._cleanupGLObjects) {
                        parent._cleanupGLObjects(true);
                    }
                    parent.setAllDirty();
                    parent.invalidateVolume();
                }
            },

            needLighting: function() {
                var hasTris = this._mesh._primType.indexOf("TRIANGLE") >= 0;
                return (this._vf.lit && hasTris);
            }
        }
    )
);