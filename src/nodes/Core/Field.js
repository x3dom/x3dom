/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Field ### */
x3dom.registerNodeType(
    "Field",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for Field
         * @constructs x3dom.nodeTypes.Field
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Field.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {SFString} type
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'type', "");

            /**
             *
             * @var {SFString} value
             * @memberof x3dom.nodeTypes.Field
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'value', "");
        
        },
        {
            fieldChanged: function(fieldName) {
                var that = this;
                if (fieldName === 'value') {
                    Array.forEach(this._parentNodes, function (node) {
                        node.fieldChanged(that._vf.name);
                    });
                }
            }
        }
    )
);