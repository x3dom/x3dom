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
             * The onGreatCircle field is used to specify whether coordinates will be interpolated along a great circle path
             * The default behavior is to not perform this operation.
             * @var {x3dom.fields.SFBool} onGreatCircle
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'onGreatCircle', false);
            
            /**
             * The exactGreatCircle field is used to specify wether the exact Great Circle path is used or a linear approximation which avoids coordinate transformations
             * The default behavior is to perform this operation.
             * @var {x3dom.fields.SFBool} onGreatCircle
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'exactGreatCircle', false);
        
            /*
             * original simply does linear interpolation, then converts to geocentric for value_changed
             */
            
            /* optional: onGreatCircle=true
             * use slerp directly on geocentric vectors. slerp is in fields.js for quaternions, just set 4th comp. to zero
             * should work ok, elevation should be also interpolated ok with the slerp of the gc vectors
             * then just convert to geosystem (implement GCtoUTM)
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
                
                // "linearize" great circle path to minimize coordinate conversions
                // an angular segment size of 0.1 degrees produces a misfit of 2.5m vertically, eg. good enough
                // eg. max. arc is 180, 1800 segments, seems to much
                // lets say max. 180 segments per interval, so for 18 degrees arc still good fit
                // larger 18 degrees just use a 180 equal segments: 180/180=1 degrees max, prod. ca. 250m misfit 
                // go through each interval
                // measure angular size
                // if size < 18 degrees
                //   divide interval equally such segments are close to 0.1:
                //     number of new segments is int(size/0.1)+1 or so; 0.45/0.1=4.5=4, plus 1;ok
                // otherwise number of new segments is 180
                // produce new keys, scale by original key
                // produce corresponding new key values: GC on great circle
                var a, b, t, cosom, n_segments, omega, newKey, keyMin, keyMax, keyDist;
                var maxangle = 18 * Math.PI/180 ;
                var maxsegment = 0.1 * Math.PI/180 ;
                //var cosmax_angle = Math.cos(maxangle);
                var n_segments_max = maxangle/maxsegment;
                this._linKey = new x3dom.fields.MFFloat();
                for (var i = 0; i < this._vf.key.length-1; ++i) {
                    a = this._keyValueGC[i];
                    b = this._keyValueGC[i+1];
                    cosom = a.dot(b)/(a.length()*b.length());
                    omega = Math.acos(cosom);
                    n_segments = omega < maxangle ? Math.floor(omega/maxsegment)+1 : n_segments_max;
                    keyMin = this._vf.key[i];
                    keyMax = this._vf.key[i+1];
                    keyDist = keyMax - keyMin;
                    for (var n = 0; n < n_segments; ++n) {
                        newKey = keyMin + (n/n_segments)*keyDist;
                        this._linKey.push(newKey);
                    }                    
                }
                // still need last key
                this._linKey.push(keyMax);
                // go through all new keys as times and produce new keyValues in given geoSystem
                this._linKeyValue = new x3dom.fields.MFVec3f();
                var indexLinValueGC, linvalue, coords;
                var hint = 0;
                for (i = 0; i < this._linKey.length; ++i) {
                    indexLinValueGC = this.linearInterpHintKeyValue(this._linKey[i], hint, this._vf.key, this._keyValueGC, x3dom.nodeTypes.GeoPositionInterpolator.prototype.slerp);
                    hint = indexLinValueGC[0];
                    coords = new x3dom.fields.MFVec3f();
                    coords.push(indexLinValueGC[1]);
                    linvalue = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoGEO(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                    this._linKeyValue.push(linvalue);
                }
                //need to treat GD specially if going across date line                    
                var referenceFrame = x3dom.nodeTypes.GeoCoordinate.prototype.getReferenceFrame(this._vf.geoSystem);
                if(referenceFrame == 'GD') {
                    var isLongitudeFirst = x3dom.nodeTypes.GeoCoordinate.prototype.isLogitudeFirst(this._vf.geoSystem);
                    var val1, valMid, val3, lon1, lonMid, lon3, nlonMid, extrap;
                    //does not work if going across in very last segment ...
                    for (i = 0; i < this._linKey.length - 2; ++i) {
                            val1 = this._linKeyValue[i] ;                        
                            valMid = this._linKeyValue[i+1] ;
                            val3 = this._linKeyValue[i+2] ;
                            lon1 = isLongitudeFirst ? val1.x : val1.y; 
                            lonMid = isLongitudeFirst ? valMid.x : valMid.y; 
                            lon3 = isLongitudeFirst ? val3.x : val3.y;
                            if (Math.abs(lon3-lon1) > 180) {
                                x3dom.debug.logError("date line: " + lon1 + " " + lonMid + " " + lon3);
                                //push lonMid to 180, and lon3 also but on the other side
                                nlonMid=lon1 > 0 ? 180 : -180;
                                //adjust Key position
                                extrap = (nlonMid-lon1)/(lonMid-lon1);
                                this._linKey[i+1] = this._linKey[i] + extrap*(this._linKey[i+1]-this._linKey[i]);
                                this._linKey[i+2] = this._linKey[i+1] ; // + 0.000000000000001;
                                //extrapolate xyz location, 
                                this._linKeyValue[i+1] = val1.add((valMid.subtract(val1)).multiply(extrap));
                                this._linKeyValue[i+2] = this._linKeyValue[i+1].copy();
                                //third point on other side
                                if (isLongitudeFirst) {
                                    this._linKeyValue[i+2].x = -nlonMid;
                                }
                                else {
                                    this._linKeyValue[i+2].y = -nlonMid;
                                }
                                //skip next
                                i = i + 1;              
                            }
                    }
                }
            },
            
            // adapted from PositionInterpolator.js
            fieldChanged: function(fieldName)
            {
                if(fieldName === "set_fraction")
                {
                    var value, indexValue, valueGC, valueX3D, coords ;
                    if(this._vf.onGreatCircle) {
                        if(this._vf.exactGreatCircle) {
                            indexValue = this.linearInterpHintKeyValue(this._vf.set_fraction, this._keyHint, this._vf.key, this._keyValueGC, x3dom.nodeTypes.GeoPositionInterpolator.prototype.slerp);
                            this._keyHint = indexValue[0];
                            valueGC = indexValue[1];                            
                            coords = new x3dom.fields.MFVec3f();
                            coords.push(valueGC);
                            value = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoGEO(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                        }
                        else {
                            // use linearized Great Circle
                            indexValue = this.linearInterpHintKeyValue(this._vf.set_fraction, this._keyHint, this._linKey, this._linKeyValue, function (a, b, t) {
                            return a.multiply(1.0-t).add(b.multiply(t));
                            });
                            this._keyHint = indexValue[0];
                            value = indexValue[1];
                            // just do slerp on orginal for GC
                            // do not reuse this._keyHint since it is a different index
                            // should be a small array
                            valueGC = this.linearInterpHintKeyValue(this._vf.set_fraction, 0, this._vf.key, this._keyValueGC, x3dom.nodeTypes.GeoPositionInterpolator.prototype.slerp);
                        }
                    }
                    else {
                        value = this.linearInterp(this._vf.set_fraction, function (a, b, t) {
                            return a.multiply(1.0-t).add(b.multiply(t));                        
                        });
                        coords = new x3dom.fields.MFVec3f();
                        coords.push(value);
                        valueGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(this._vf.geoSystem, this._cf.geoOrigin, coords)[0];
                    }
                    //x3dom.debug.logInfo("interpolated fraction: " + this._vf.set_fraction);
                    
                    //x3dom.debug.logInfo("interpolated GD: " + value);
                    x3dom.debug.logInfo("interpolated GC: " + valueGC);
                    //account for GeoOrigin, eg. transform to X3D coordinates
                    coords = new x3dom.fields.MFVec3f();
                    coords.push(valueGC);
                    var GCgeoSystem = new x3dom.fields.MFString();
                    GCgeoSystem.push("GC");
                    GCgeoSystem.push(x3dom.nodeTypes.GeoCoordinate.prototype.getElipsoideCode(this._vf.geoSystem));
                    valueX3D = x3dom.nodeTypes.GeoCoordinate.prototype.GCtoX3D(GCgeoSystem, this._cf.geoOrigin, coords)[0];
                    x3dom.debug.logInfo(valueX3D);
                    this.postMessage('value_changed', valueX3D);
                    
                     //this.postMessage('value_changed', valueGC);
                    this.postMessage('geovalue_changed', value);
                }
            }        
        
        }
    )
);
