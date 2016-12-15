/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DBindableNode ### */
x3dom.registerNodeType(
    "X3DBindableNode",
    "Core",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DBindableNode
         * @constructs x3dom.nodeTypes.X3DBindableNode
         * @x3d 3.3
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc X3DBindableNode is the abstract base type for all bindable children nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DBindableNode.superClass.call(this, ctx);


            /**
             * Pushes/pops the node on/from the top of the bindable stack
             * @var {x3dom.fields.SFBool} bind
             * @memberof x3dom.nodeTypes.X3DBindableNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'bind', false);

            /**
             * Description of the bindable node
             * @var {x3dom.fields.SFString} description
             * @memberof x3dom.nodeTypes.X3DBindableNode
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'description', "");

            /**
             *
             * @var {x3dom.fields.SFBool} isActive
             * @memberof x3dom.nodeTypes.X3DBindableNode
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'isActive', false);

            this._autoGen = (ctx && ctx.autoGen ? true : false);
            if (this._autoGen)
                this._vf.description = "default" + this.constructor.superClass._typeName;

            // Bindable stack to register node later on
            this._stack = null;
            this._bindAnimation = true;
        
        },
        {
            bind: function (value) {
                if (this._stack) {
                    if (value) {
                        this._stack.push (this);
                    }
                    else {
                        this._stack.pop  (this);
                    }
                }
                else {
                    x3dom.debug.logError ('No BindStack in ' + this.typeName() + 'Bindable');
                }
            },

            activate: function (prev) {
                this.postMessage('isActive', true);
                x3dom.debug.logInfo('activate ' + this.typeName() + 'Bindable ' +
                    this._DEF + '/' + this._vf.description);
            },

            deactivate: function (prev) {
                this.postMessage('isActive', false);
                x3dom.debug.logInfo('deactivate ' + this.typeName() + 'Bindable ' +
                    this._DEF + '/' + this._vf.description);
            },

            fieldChanged: function(fieldName) {
                if (fieldName.indexOf("bind") >= 0) {
                    this.bind(this._vf.bind);
                }
            },

            nodeChanged: function() {
                this._stack = this._nameSpace.doc._bindableBag.addBindable(this);
            }
        }
    )
);