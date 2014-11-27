/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoPositionInterpolator ### */
x3dom.registerNodeType(
    "GeoPositionInterpolator",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for GeoPositionInterpolator
         * @constructs x3dom.nodeTypes.GeoPositionInterpolator
         * @x3d 3.3
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoPositionInterpolator node provides an interpolator capability where key values are specified in geographic coordinates and the interpolation is performed within the specified spatial reference frame.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoPositionInterpolator.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The keyValue array is used to contain the actual coordinates and should be provided in a format consistent with that specified for the particular geoSystem.
             * @var {x3dom.fields.MFVec3d} keyValue
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'keyValue', []);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue x3dom.nodeTypes.X3DInterpolatorNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);
            
            /**
             * The onGreatCircle field is used to specify whether coordinates will be interpolated along a great circle path.
             * The default behavior is to not perform this operation for performance and compatibility.
             * @var {x3dom.fields.SFBool} onGreatCircle
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'onGreatCircle', false);
            
            /*
             * original simply does linear interpolation, then converts to geocentric for value_changed
             */             
        },
        {
            // adapted from X3DInterpolator.js
            
            // we need our own key and keyValue, uses hint for larger arrays and returns also found index
            linearInterpHintKeyValue: function (time, keyHint, key, keyValue, interp) {
                // add guess as input where to find time; should be close to index of last time?
                // do wraparound search in both directions since interpolation often goes back
                var keylength = key.length;
                
                if (time <= key[0])
                    return [0, keyValue[0]];
                
                else if (time >= key[keylength - 1])
                    return [keylength - 1, keyValue[keylength - 1]];
                
                var keyIndexStart = keyHint ;
                var i;
                // strictly loop only to keylength/2 but does not hurt
                for (var ii = 0; ii < keylength - 1; ++ii) {
                    // look forward
                    i = (keyIndexStart + ii) % keylength;
                    //i+1 can be outside array but undefined leads to false in check
                    if ((key[i] < time) && (time <= key[i+1]))
                        return [i, interp( keyValue[i], keyValue[i+1],
                                (time - key[i]) / (key[i+1] - key[i]) )];
                    // look backward
                    i = (keyIndexStart - ii + keylength) % keylength; 
                    if ((key[i] < time) && (time <= key[i+1]))
                        return [i, interp( keyValue[i], keyValue[i+1],
                                (time - key[i]) / (key[i+1] - key[i]) )];                    
                }
                return [0, keyValue[0]];
            },
            
            // adapted from fields.js
            slerp: function (a, b, t) {
                // calculate the cosine
                // since a and b are not unit vectors here; this is the only real change
                var cosom = a.dot(b)/(a.length()*b.length());
                var rot1;
            
                /* 
                 * does not apply for geometric slerp
                 * adjust signs if necessary
                if (cosom < 0.0)
                {
                    cosom = -cosom;
                    rot1 = b.negate();
                }
                else
                */
                {
                    rot1 = new x3dom.fields.SFVec3f(b.x, b.y, b.z);
                }
            
                // calculate interpolating coeffs
                var scalerot0, scalerot1;
                
                if ((1.0 - cosom) > 0.00001)
                {
                    // standard case
                    var omega = Math.acos(cosom);
                    var sinom = Math.sin(omega);
                    scalerot0 = Math.sin((1.0 - t) * omega) / sinom;
                    scalerot1 = Math.sin(t * omega) / sinom;
                }
                else
                {
                    // rot0 and rot1 very close - just do linear interp.
                    scalerot0 = 1.0 - t;
                    scalerot1 = t;
                }
            
                // build the new vector
                return a.multiply(scalerot0).add(rot1.multiply(scalerot1));
            },
            
            nodeChanged: function() {
                // set up initial values
                this._keyValueGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(this._vf.geoSystem, this._cf.geoOrigin, this._vf.keyValue);
                this._keyHint = 0;
                // sanity check key.length vs. keyValue.length
            },
            
            // adapted from PositionInterpolator.js
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction") {
                    
                    var value, indexValue, valueGC, valueX3D, coords ;
                    
                    if(this._vf.onGreatCircle) {
                            indexValue = this.linearInterpHintKeyValue(this._vf.set_fraction, this._keyHint, this._vf.key, this._keyValueGC, x3dom.nodeTypes.GeoPositionInterpolator.prototype.slerp);
                            this._keyHint = indexValue[0];
                            valueGC = indexValue[1];                            
                            coords = new x3dom.fields.MFVec3f();
                            coords.push(valueGC);
                            value = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoGEO(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                    }
                    
                    else {
                        indexValue = this.linearInterpHintKeyValue(this._vf.set_fraction, this._keyHint, this._vf.key, this._vf.keyValue, function (a, b, t) {
                            return a.multiply(1.0-t).add(b.multiply(t));                        
                        });
                        this._keyHint = indexValue[0];
                        value = indexValue[1];                            
                        coords = new x3dom.fields.MFVec3f();
                        coords.push(value);
                        valueGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                    }
                    
                    //account for GeoOrigin, eg. transform to X3D coordinates
                    coords = new x3dom.fields.MFVec3f();
                    coords.push(valueGC);
                    var GCgeoSystem = new x3dom.fields.MFString();
                    GCgeoSystem.push("GC");
                    GCgeoSystem.push(x3dom.nodeTypes.GeoCoordinate.prototype.getElipsoideCode(this._vf.geoSystem));
                    valueX3D = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoX3D(GCgeoSystem, this._cf.geoOrigin, coords)[0];
                    
                    this.postMessage('value_changed', valueX3D);
                    this.postMessage('geovalue_changed', value);
                }
            }                
        }
    )
);
