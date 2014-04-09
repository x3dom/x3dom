/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DLightNode ### */
x3dom.registerNodeType(
    "X3DLightNode",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DLightNode
         * @constructs x3dom.nodeTypes.X3DLightNode
         * @x3d x.x
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DLightNode.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.lights.push(this);
            else
                x3dom.debug.logWarning("X3DLightNode: No runtime context found!");

            this._lightID = 0;
            this._dirty = true;


            /**
             *
             * @var {SFFloat} ambientIntensity
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ambientIntensity', 0);

            /**
             *
             * @var {SFColor} color
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'color', 1, 1, 1);

            /**
             *
             * @var {SFFloat} intensity
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'intensity', 1);

            /**
             *
             * @var {SFBool} global
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'global', false);

            /**
             *
             * @var {SFBool} on
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'on', true);

            /**
             *
             * @var {SFFloat} shadowIntensity
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowIntensity', 0);

            /**
             *
             * @var {SFInt32} shadowMapSize
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 1024
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowMapSize', 1024);

            /**
             *
             * @var {SFInt32} shadowFilterSize
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowFilterSize', 0);

            /**
             *
             * @var {SFFloat} shadowOffset
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowOffset', 0);

            /**
             *
             * @var {SFFloat} zNear
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zNear', -1);

            /**
             *
             * @var {SFFloat} zFar
             * @memberof x3dom.nodeTypes.X3DLightNode
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'zFar', -1);
        
        },
        {
            getViewMatrix: function(vec) {
                return x3dom.fields.SFMatrix4f.identity;
            },

            nodeChanged: function () {
                if(!this._lightID) {
                    this._lightID = ++x3dom.nodeTypes.X3DLightNode.lightID;
                }
            },

            fieldChanged: function(fieldName)
            {
                if (this._vf.hasOwnProperty(fieldName)) {
                    this._dirty = true;
                }
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.lights.length; i<n; i++) {
                        if (doc._nodeBag.lights[i] === this) {
                            doc._nodeBag.lights.splice(i, 1);
                        }
                    }
                }
            }
        }
    )
);

/** Static class ID counter (needed for flash performance up) */
x3dom.nodeTypes.X3DLightNode.lightID = 0;