/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "X3DBackgroundNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        
        /**
         * Constructor for X3DBackgroundNode
         * @constructs x3dom.nodeTypes.X3DBackgroundNode
         * @x3d x.x
         * @component EnvironmentalEffects
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBindableNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} withCredentials
             * @memberof x3dom.nodeTypes.X3DBackgroundNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'withCredentials', false);

            this._dirty = true;
        
        },
        {
            getSkyColor: function() {
                return new x3dom.fields.SFColor(0,0,0);
            },
            getTransparency: function() {
                return 0;
            },
            getTexUrl: function() {
                return [];
            }
        }
    )
);