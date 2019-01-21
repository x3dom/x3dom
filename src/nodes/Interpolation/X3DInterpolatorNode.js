/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### X3DInterpolatorNode ###
x3dom.registerNodeType(
    "X3DInterpolatorNode",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        
        /**
         * Constructor for X3DInterpolatorNode
         * @constructs x3dom.nodeTypes.X3DInterpolatorNode
         * @x3d 3.3
         * @component Interpolation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The abstract node X3DInterpolatorNode forms the basis for all types of interpolators.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this, ctx);


            /**
             * The key field contains the list of key times, the keyValue field contains values for the target field, one complete set of values for each key.
             * Interpolator nodes containing no keys in the key field shall not produce any events.
             * However, an input event that replaces an empty key field with one that contains keys will cause the interpolator node to produce events the next time that a set_fraction event is received.
             * @var {x3dom.fields.MFFloat} key
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'key', []);

            /**
             * The set_fraction inputOnly field receives an SFFloat event and causes the interpolator node function to evaluate, resulting in a value_changed output event of the specified type with the same timestamp as the set_fraction event.
             * @var {x3dom.fields.SFFloat} set_fraction
             * @memberof x3dom.nodeTypes.X3DInterpolatorNode
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'set_fraction', 0);

             /**
             * The url to the binary file, that contains the buffer data.
             * @var {x3dom.fields.SFString} buffer
             * @memberof x3dom.nodeTypes.BufferGeometry
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'buffer', "");

            this.addField_MFNode('views', x3dom.nodeTypes.BufferView );
            this.addField_MFNode('accessors', x3dom.nodeTypes.BufferAccessor );

            this.constructorFromType = {
                "5120": Int8Array,
                "5121": Uint8Array,
                "5122": Int16Array,
                "5123": Uint16Array,
                "5125": Uint32Array,
                "5126": Float32Array
            };
            this.normalizeFromType = {
                "5120": function(c) {return Math.max(c / 127.0, -1.0)},
                "5121": function(c) {return c / 255.0;},
                "5122": function(c) {return Math.max(c / 32767.0, -1.0)},
                "5123": function(c) {return c / 65535.0;},
                "5125": function(c) {return c / 4294967295;},
                "5126": function(c) {return c;},
            };
        
        },
        {
            nodeChanged: function () {
                var scope = this;
                function initAccessors (arraybuffer)
                {
                    var that = scope;
                    var key, keyValue;
                    scope._cf.accessors.nodes.forEach(function(accessor)
                    {
                        var view = findBufferView(accessor._vf.view);
                        var byteOffset = accessor._vf.byteOffset + view._vf.byteOffset;
                        var typeLength = accessor._vf.count * accessor._vf.components;
                        var array;
                        if (accessor._vf.bufferType === 'SAMPLER_INPUT')
                        {
                            if(accessor._vf.componentType === 5126)
                            {
                                array = new Float32Array(arraybuffer, byteOffset, typeLength);
                                that.duration = accessor._xmlNode.duration;
                                key = new x3dom.fields.MFFloat( array.map(function(a){return a/that.duration;}) );
                            }
                            else 
                            {
                                x3dom.debug.logWarning('glTF animation input needs to be FLOAT but is '+ accessor._vf.componentType);
                            }
                        }
                        if (accessor._vf.bufferType === 'SAMPLER_OUTPUT')
                        {
                            array = new that.constructorFromType[accessor._vf.componentType](arraybuffer, byteOffset, typeLength);
                            keyValue = that.keyValueFromAccessor(array, accessor._vf.componentType);
                        }
                    });
                    //modify for STEP
                    if (scope._xmlNode.interpolation === 'STEP')
                    {
                        //keys: 0,0.5,1 -> 0,0.5,0.5,1,1
                        //values: 1,2,3 -> 1,1  ,2  ,2,3

                        var stepKey = key.copy();
                        for(var i=1; i<key.length; i++)
                        {
                            stepKey.splice(i*2,0, key[i]);
                        };
                        var stepValue = keyValue.copy();
                        for(var i=0; i<key.length-1; i++)
                        {
                            stepValue.splice(i*2+1, 0, keyValue[i]);
                        };
                        key = stepKey;
                        keyValue = stepValue;
                    }
                    scope._vf.key = key;
                    scope._vf.keyValue = keyValue;
                }
                
                function findBufferView(view) {
                    return scope._cf.views.nodes.find(function(bview){return bview._vf.id === view});
                }
                
                if (this._vf.buffer) {
                    //console.log(this);
                    var URL = this._nameSpace.getURL(this._vf.buffer);
                    if(x3dom.XHRCache[URL] && x3dom.XHRCache[URL].response !== null)
                    {
                        initAccessors(x3dom.XHRCache[URL].response);
                        return;
                    }
                    var xhr;

                    if (x3dom.XHRCache[URL] === undefined)
                    {
                        xhr = new XMLHttpRequest();

                        xhr.open("GET", URL);//avoid getting twice, with geometry buffer

                        xhr.responseType = "arraybuffer";
                        x3dom.XHRCache[URL] = xhr;
                        x3dom.RequestManager.addRequest( xhr );
                        scope._nameSpace.doc.downloadCount += 1;
                        xhr.counted = false;
                    }
                    else xhr = x3dom.XHRCache[URL];

                    xhr.addEventListener('load', function(e)
                    {
                        if (!xhr.counted)
                        {   
                            scope._nameSpace.doc.downloadCount -= 1;
                            xhr.counted = true;
                        }
                        if(xhr.status != 200) return;
                        
                        initAccessors(xhr.response);

                        scope._nameSpace.doc.needRender = true;
                    });

                    xhr.onerror = function(e) // ok to do only once
                    {
                        scope._nameSpace.doc.downloadCount -= 1;
                        return;
                    }                            
                }
            },

            linearInterp: function (time, interp) {
                if (time <= this._vf.key[0])
                    return this._vf.keyValue[0];

                else if (time >= this._vf.key[this._vf.key.length-1])
                    return this._vf.keyValue[this._vf.key.length-1];

                for (var i = 0; i < this._vf.key.length-1; ++i) {
                    if ((this._vf.key[i] < time) && (time <= this._vf.key[i+1]))
                        return interp( this._vf.keyValue[i], this._vf.keyValue[i+1],
                                (time - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i]) );
                }
                return this._vf.keyValue[0];
            },

            cubicSplineInterp: function (time, interp) {
                
                if (time <= this._vf.key[0])
                    return this._vf.keyValue[1];

                else if (time >= this._vf.key[this._vf.key.length-1])
                    return this._vf.keyValue[this._vf.keyValue.length-2];

                var i, i3, interval, basis; 

                for (i = 0; i < this._vf.key.length-1; ++i) {
                    if ((this._vf.key[i] < time) && (time <= this._vf.key[i+1])) {
                        i3 = i*3;
                        interval = this._vf.key[i+1] - this._vf.key[i];
                        basis = this.cubicSplineBasis( (time - this._vf.key[i]) / interval, interval * this.duration );
                        return interp( 
                                this._vf.keyValue[i3+2], this._vf.keyValue[i3+1], this._vf.keyValue[i3+3], this._vf.keyValue[i3+4],
                                basis.h00, basis.h10, basis.h01, basis.h11                       
                                );
                    }
                }
                return this._vf.keyValue[0];
            },

            cubicSplineBasis: function (t, intervalInSeconds)
            {
                var t2 = t*t;
                var t3 = t2*t;
                var h01 = -2*t3 + 3*t2;
                var h11 = t3 - t2;
                var h00 = 1 - h01; //2*t3 - 3*t2 + 1;
                var h10 = h11 - t2 + t; //t3 - 2*t2 + t;
                

                return {'h00':h00, 'h10': intervalInSeconds * h10, 'h01':h01, 'h11': intervalInSeconds * h11};
            },

            keyValueFromArray: function (array) // to be redefined by interpolators
            {
                return array;
            }
        }
    )
);
//global XHR cache
x3dom.XHRCache = {}; // unify with x3dom.BinaryContainerLoader.bufferGeoCache
