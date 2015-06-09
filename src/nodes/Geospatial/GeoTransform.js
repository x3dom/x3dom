/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoTransform ### */
x3dom.registerNodeType(
    "GeoTransform",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DTransformNode, //should be X3DGroupingNode but more convenient
        
        /**
         * Constructor for GeoTransform
         * @constructs x3dom.nodeTypes.GeoTransform
         * @x3d 3.3
         * @component Geospatial
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoTransform node is a grouping node that defines a coordinate system for its children to support the translation and orientation of geometry built using GeoCoordinate nodes within the local world coordinate system.
         * The X-Z plane of a GeoTransform coordinate system is tangent to the ellipsoid of the spatial reference frame at the location specified by the geoCenter field.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoTransform.superClass.call(this, ctx);


            /**
             * The geoCenter field specifies, in the spatial reference frame specified by the geoSystem field, the location at which the local coordinate system is centered.
             * @var {x3dom.fields.SFVec3d} geoCenter
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3d(ctx, 'geoCenter', 0, 0, 0);

            /**
             * Defines the rotation component of the transformation.
             * @var {x3dom.fields.SFRotation} rotation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);

            /**
             * Defines the scale component of the transformation.
             * @var {x3dom.fields.SFVec3f} scale
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 1,1,1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);

            /**
             * The scaleOrientation specifies a rotation of the coordinate system before the scale (to specify scales in arbitrary orientations).
             * The scaleOrientation applies only to the scale operation.
             * @var {x3dom.fields.SFRotation} scaleOrientation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,1,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

            /**
             * The translation field specifies a translation to the coordinate system.
             * @var {x3dom.fields.SFVec3f} translation
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue x3dom.nodeTypes.Transform
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.GeoOrigin);

            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoTransform
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);
            
             /**
             * The onGreatCircle field is used to specify whether coordinates will be interpolated along a great circle path.
             * The default behavior is to not perform this operation for performance and compatibility.
             * @var {x3dom.fields.SFBool} onGreatCircle
             * @memberof x3dom.nodeTypes.GeoPositionInterpolator
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'applyGeoOriginToChildren', false);
            
            
        
        },
        {
            nodeChanged: function ()
            {
                this._trafo = this.getGeoTransform();
            },
            
            getGeoTransform: function ()
            {
                // OR x OT x C x GR x T x R x SR x S x -SR x -GR x -C x -OT x -OR
                // OR: GeoOriginRotation
                // OT: GeoOriginTranslation
                // GR: GeoLocationRotation with geoCenter
                // C: geoCenterTranslation
                // regular Transform P' = T * C * R * SR * S * -SR * -C * P
                /*
                return x3dom.fields.SFMatrix4f.translation(
                        this._vf.translation.add(this._vf.center)).
                        mult(this._vf.rotation.toMatrix()).
                        mult(this._vf.scaleOrientation.toMatrix()).
                        mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                        mult(this._vf.scaleOrientation.toMatrix().inverse()).
                        mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
                        this._trafo = this.getGeoTransform();
                */
                var geoCenterRotMat, geoCenter, scaleOrientMat, geoTransform, coords, geoCenterGC, geoSystem, geoOrigin;
                geoSystem = this._vf.geoSystem;
                geoOrigin = this._cf.geoOrigin;
                geoCenter = this._vf.geoCenter;
                skipGO = this._vf.applyGeoOriginToChildren;
                scaleOrientMat = this._vf.scaleOrientation.toMatrix();
                coords = new x3dom.fields.MFVec3f();
                coords.push(geoCenter);
                geoCenterGC = x3dom.nodeTypes.GeoCoordinate.prototype.GEOtoGC(geoSystem, geoOrigin, coords)[0];
                geoCenterRotMat = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, geoCenterGC);
                geoTransform = 
                    x3dom.fields.SFMatrix4f.translation(geoCenterGC).
                    mult(geoCenterRotMat).
                    mult(x3dom.fields.SFMatrix4f.translation(this._vf.translation)).
                    mult(this._vf.rotation.toMatrix()).
                    mult(scaleOrientMat).
                    mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                    mult(scaleOrientMat.inverse()).
                    mult(geoCenterRotMat.inverse()).
                    mult(x3dom.fields.SFMatrix4f.translation(geoCenterGC.negate()));
                //do geoOrigin
                if(geoOrigin.node)
                {
                    var origin = x3dom.nodeTypes.GeoCoordinate.prototype.OriginToGC(geoOrigin);
                    if (!skipGO) 
                        {
                            //undo translation
                            geoTransform = geoTransform.mult(x3dom.fields.SFMatrix4f.translation(origin));
                        }
                    if(geoOrigin.node._vf.rotateYUp)
                    {
                        var rotMatOrigin = x3dom.nodeTypes.GeoLocation.prototype.getGeoRotMat(geoSystem, origin);
                        if (!skipGO) 
                        {    
                            //undo rotation before translation
                            geoTransform = geoTransform.mult(rotMatOrigin);
                        }
                        
                    }
                    //redo transl. afer geoTransform
                    geoTransform = x3dom.fields.SFMatrix4f.translation(origin.negate()).mult(geoTransform);
                    if(geoOrigin.node._vf.rotateYUp)
                    {
                        //redo rotation after translation
                        geoTransform = rotMatOrigin.inverse().mult(geoTransform);
                    }
                }
                return geoTransform;
            },
            
            fieldChanged: function (fieldName)
            {
                if (fieldName == "geoCenter" || fieldName == "translation" ||
                    fieldName == "rotation" || fieldName == "scale" ||
                    fieldName == "scaleOrientation")
                {
                    this._trafo = this.getGeoTransform();
                    
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
                else if (fieldName == "render") {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            }
        }
    )
);
