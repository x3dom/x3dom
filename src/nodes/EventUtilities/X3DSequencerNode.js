/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009, 2017, A. Plesch, Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DSequencerNode ###
x3dom.registerNodeType(
    "X3DSequencerNode",
    "EventUtilities",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DSequencerNode
         * @constructs x3dom.nodeTypes.X3DSequencerNode
         * @x3d 3.3
         * @component EventUtilities
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The abstract node X3DSequencerNode forms the basis for all types of sequencers.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DSequencerNode.superClass.call(this, ctx);
        
            /**
             * If the next inputOnly field receives an SFBool event with value TRUE, it triggers the next output value in keyValue array by issuing a value_changed event with that value.
             * After reaching the boundary of keyValue array, next goes to the initial element after last.
             * @var {x3dom.fields.SFBool} next
             * @memberof x3dom.nodeTypes.X3DSequencerNode
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'next', false);
        
            /**
             * If the previous inputOnly field receives an SFBool event with value TRUE, it triggers the previous output value in keyValue array by issuing a value_changed event with that value.
             * After reaching the boundary of keyValue array previous goes to the last element after the first.
             * @var {x3dom.fields.SFBool} previous
             * @memberof x3dom.nodeTypes.X3DSequencerNode
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'previous', false);

            /**
             * The key field contains the list of key times, the keyValue field contains values for the target field, one complete set of values for each key.
             * Sequencer nodes containing no keys in the key field shall not produce any events.
             * However, an input event that replaces an empty key field with one that contains keys will cause the sequencer node to produce events the next time that a set_fraction event is received.
             * @var {x3dom.fields.MFFloat} key
             * @memberof x3dom.nodeTypes.X3DSequencerNode
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'key', []);

            /**
             * The set_fraction inputOnly field receives an SFFloat event and causes the sequencer node function to evaluate, resulting in a value_changed output event of the specified type with the same timestamp as the set_fraction event.
             * @var {x3dom.fields.SFFloat} set_fraction
             * @memberof x3dom.nodeTypes.X3DSequencerNode
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'set_fraction', 0);
        
            this._keyIndex = -1;
            this._key_changed = false;
            this._keyValue_changed = false;
        
        },
        {
            findInterval: function (time) {
                var keyLength = this._vf.key.length-1;
                
                if (time < this._vf.key[0]) {
                    return 0;
                }

                else if (time >= this._vf.key[keyLength]) {
                    return keyLength;
                }

                for (var i = 0; i < keyLength; ++i) {
                    if ((this._vf.key[i] <= time) && (time < this._vf.key[i+1])) {
                        return i;
                    }
                }
                return 0; // should never happen
            },        

            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var keyIndex = this.findInterval(this._vf.set_fraction);
                    if (keyIndex !== this._keyIndex) { // only generate event when necessary
                      this._keyIndex = keyIndex;
                      this.postMessage('value_changed', this._vf.keyValue[keyIndex]);
                    }
                    return;
                }
                if(fieldName === "next" && this._vf.next)
                {
                    this._keyIndex = (this._keyIndex + 1)%(this._vf.key.length);
                    this.postMessage('value_changed', this._vf.keyValue[this._keyIndex]);
                    return;
                }
                if(fieldName === "previous" && this._vf.previous)
                {
                    this._keyIndex = (this._keyIndex - 1 + this._vf.key.length)%(this._vf.key.length);
                    this.postMessage('value_changed', this._vf.keyValue[this._keyIndex]);
                    return;
                }
                if(fieldName === "key")
                {
                    if (this._key_changed) { // avoid loop this way since no timestamping
                        this._key_changed = false;
                        return
                    }
                    this._key_changed = true;
                    this.postMessage('key', this._vf.key);
                    return;
                }
                if(fieldName === "keyValue")
                {
                    if (this._keyValue_changed) { // avoid loop this way since no timestamping
                        this._keyValue_changed = false;
                        return
                    }
                    this._keyValue_changed = true;
                    this.postMessage('keyValue', this._vf.keyValue);
                    return;
                }
            }
        }
    )
);
