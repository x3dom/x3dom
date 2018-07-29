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

            this.addField_MFNode('views', x3dom.nodeTypes.BufferGeometryView );
            this.addField_MFNode('accessors', x3dom.nodeTypes.BufferGeometryAccessor );
        
        },
        {
            nodeChanged: function () {
                var scope = this;
                function initBufferViews (arraybuffer)
                {
                    //console.log(arraybuffer);
                }
                function initAccessors (arraybuffer)
                {
                    var arrayConstructor = {
                            "5120": Int8Array,
                            "5121": Uint8Array,
                            "5122": Int16Array,
                            "5123": Uint16Array,
                            "5125": Uint32Array,
                            "5126": Float32Array
                    };
                    var that = scope;
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
//                                 var max = array.reduce(function(a, b) {
//                                     return Math.max(a, b);
//                                 });
                                var max = accessor._xmlNode.duration;
                                that._vf.key = new x3dom.fields.MFFloat( array.map(function(a){return a/max;}) );
//                                 console.log(that._vf.key);
                            }
                            else 
                            {
                                x3dom.debug.logWarning('glTF animation input needs to be FLOAT but is '+ accessor._vf.componentType);
                            }
                        }
                        if (accessor._vf.bufferType === 'SAMPLER_OUTPUT')
                        {
                            array = new arrayConstructor[accessor._vf.componentType](arraybuffer, byteOffset, typeLength);
                            if (x3dom.isa(that, x3dom.nodeTypes.OrientationInterpolator))
                            {
                                var keyValue = new x3dom.fields.MFRotation();
                                array.forEach( function (val, i)
                                {
                                    if (i%4 == 3) {
                                        keyValue.push( new x3dom.fields.Quaternion (
                                            array[i-3],
                                            array[i-2],
                                            array[i-1],
                                            val
                                        ));  
                                    }
                                })
                            }
                            else if (x3dom.isa(that, x3dom.nodeTypes.PositionInterpolator))
                            {
                                var keyValue = new x3dom.fields.MFVec3f();
                                array.forEach( function (val, i)
                                {
                                    if (i%3 == 2) {
                                        keyValue.push( new x3dom.fields.SFVec3f (
                                            array[i-2],
                                            array[i-1],
                                            val
                                        ));  
                                    }
                                })
                            }
                            else // Scalar
                            {
                                var keyValue = array;
                            }
                            that._vf.keyValue = keyValue;
                            //console.log(keyValue);
                        }
                    });
 //                   console.log(scope._cf.accessors);
                }
                function findBufferView(view) {
                    return scope._cf.views.nodes.find(function(bview){return bview._vf.id === view});
                }
                
                if (this._vf.buffer) {
                    //console.log(this);
                    var URL = this._nameSpace.getURL(this._vf.buffer);
                    //from BinaryContainerLoader Buffersetup
//                     this.bufferGeoCache = {};
//                     if(this.bufferGeoCache[URL] != undefined)
//                     {
//                         this.bufferGeoCache[URL].promise.then( function(arraybuffer) {

//                             initBufferViews(arraybuffer);
//                             initAccessors();
//                             //computeNormals(arraybuffer);
//                         });
//                     }
//                     else
//                     {
//                         this.bufferGeoCache[URL] = {};
//                         this.bufferGeoCache[URL].buffers = [];
//                         this.bufferGeoCache[URL].promise = new Promise(function(resolve, reject) 
//                         {

                            var xhr = new XMLHttpRequest();

                            xhr.open("GET", URL);//avoid getting twice, with geometry buffer

                            xhr.responseType = "arraybuffer";

                            xhr.onload = function(e)
                            {
                                if(xhr.status != 200)
                                {
                                    scope._nameSpace.doc.downloadCount -= 1;
//                                     reject();
                                    return;
                                }

                                initBufferViews(xhr.response);

                                initAccessors(xhr.response);

                                //computeNormals(xhr.response);

//                                 resolve(xhr.response);

                                scope._nameSpace.doc.downloadCount -= 1;

                                scope._nameSpace.doc.needRender = true;
                            }

                            xhr.onerror = function(e)
                            {
                                scope._nameSpace.doc.downloadCount -= 1;
//                                 reject();
                            }

                            x3dom.RequestManager.addRequest( xhr );

//                             scope._nameSpace.doc.downloadCount += 1;
//                         });    
//                     }
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
            }
        }
    )
);
