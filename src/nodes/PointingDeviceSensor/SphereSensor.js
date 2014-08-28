/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */
 
 /*
 * Based on code provided by Fraunhofer IGD.
 * (C)2014 Toshiba Corporation, Japan.
 * Dual licensed under the MIT and GPL.
 */

x3dom.registerNodeType(
    "SphereSensor",
    "PointingDeviceSensor",
    defineClass(x3dom.nodeTypes.X3DDragSensorNode,

        /**
         * Constructor for SphereSensor
         * @constructs x3dom.nodeTypes.SphereSensor
         * @x3d 3.3
         * @component PointingDeviceSensor
         * @status experimental
         * @extends x3dom.nodeTypes.X3DDragSensorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc SphereSensor converts pointing device motion into a spherical rotation around the origin of the
         * local coordinate system.
         */
        function (ctx)
        {
            x3dom.nodeTypes.SphereSensor.superClass.call(this, ctx);

            //---------------------------------------
            // FIELDS
            //---------------------------------------
            /**
             * Offset value that is incorporated into the rotation output of the sensor.
             * This value is automatically updated if the value of the autoOffset field is 'true'.
             * @var {x3dom.fields.SFRotation} offset
             * @memberof x3dom.nodeTypes.SphereSensor
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation(ctx, 'offset', 0, 1, 0, 0);

            //route-able output fields
            //this.addField_SFVec3f(ctx, 'rotation_changed', 0, 0, 0);


            //---------------------------------------
            // PROPERTIES
            //---------------------------------------

            /**
             * Current rotation that is produced by this sphere sensor
             * @type {x3dom.fields.Quaternion}
             * @private
             */
            this._currentRotation = null;
			
			/**
             * Rotation matrix, derived from the current value of the offset field
             * @type {x3dom.fields.SFMatrix4f}
             * @private
             */
            this._rotationMatrix = this._vf.offset.toMatrix();
        },
        {
            //----------------------------------------------------------------------------------------------------------------------
            // PUBLIC FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------
			
			/**
             * This function returns the parent transformation of this node, combined with its current rotation
             * @overrides x3dom.nodeTypes.X3DPointingDeviceSensorNode.getCurrentTransform
             */
            getCurrentTransform: function ()
            {
                var parentTransform = x3dom.nodeTypes.X3DDragSensorNode.prototype.getCurrentTransform.call(this);
				
                return parentTransform.mult(this._rotationMatrix);
            },


            //----------------------------------------------------------------------------------------------------------------------
            // PRIVATE FUNCTIONS
            //----------------------------------------------------------------------------------------------------------------------
			
            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging
             * @private
             */
            _startDragging: function(viewarea, x, y, wx, wy, wz)
            {
				//console.log(viewarea, x, y, wx, wy, wz);
                x3dom.nodeTypes.X3DDragSensorNode.prototype._startDragging.call(this, viewarea, x, y, wx, wy, wz);
				
				this._currentRotation = new x3dom.fields.Quaternion();
				
				this._viewArea = viewarea;	
				
				// origin of sphere in local coordinates
				this._localOrigin = new x3dom.fields.SFVec3f(0.0, 0.0, 0.0);
				
				this._inverseToWorldMatrix = this.getCurrentTransform().inverse();

				// compute initial point of intersection on the sphere sensor's geometry, in local sphere sensor's coordinate system
				var firstIntersection = this._inverseToWorldMatrix.multMatrixPnt(new x3dom.fields.SFVec3f(wx, wy, wz));
				
				this._initialSphereIntersectionVector = firstIntersection.subtract(this._localOrigin);

				this._sphereRadius = this._initialSphereIntersectionVector.length();

				this._initialSphereIntersectionVector = this._initialSphereIntersectionVector.normalize();
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._process2DDrag
             * @private
             */
            _process2DDrag: function(x, y, dx, dy)
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._process2DDrag.call(this, x, y, dx, dy);

				// We have to compute hit point on virtual sphere's geometry
				var viewRay = this._viewArea.calcViewRay(x, y);
				viewRay.pos = this._inverseToWorldMatrix.multMatrixPnt(viewRay.pos);
				viewRay.dir = this._inverseToWorldMatrix.multMatrixVec(viewRay.dir);
				
				/*
				 * S := Ray Origin	  = viewRay.pos
				 * V := Ray Direction = viewRay.dir
				 * O := Sphere Center = this._localOrigin
				 * r := Sphere Radius = this._sphereRadius
				 * alpha := Ray parameter
				 * 
				 * If the view ray intersects the virtual sphere centred at O
				 * at (S + alpha*V), it must satisfy the following equation:
				 * | S + alpha*V - O | = r
				 * dot_prod((S + alpha*V - O),(S + alpha*V - O)) = r*r
				 * or,
				 * alpha*alpha*V.V + alpha*2*(V.(S-O)) + (S.S -2O.S + O.O) - r*r = 0
				 * or,
				 * A*alpha*alpha + B*alpha + C = 0
				 */
				 
				 var A = viewRay.dir.dot(viewRay.dir);
				 var B = 2.0*(viewRay.dir.dot(viewRay.pos.subtract(this._localOrigin)));
				 var C = viewRay.pos.dot(viewRay.pos) - 2.0*this._localOrigin.dot(viewRay.pos) +
                         this._localOrigin.dot(this._localOrigin) - this._sphereRadius*this._sphereRadius;
				 
				 var determinant = (B*B) - (4.0*A*C);
				 var alpha_1;
				 var alpha_2;
				 
				 // if the roots are real i.e. the ray intersects the sphere, the determinant must be greater
				 // than or equal to zero
				 if(determinant >= 0.0) {
					alpha_1 = (-B + Math.sqrt(determinant)) / (2.0*A);
					alpha_2 = (-B - Math.sqrt(determinant)) / (2.0*A);
					
					// pick the closer of the two points
					alpha_1 = Math.min(alpha_1, alpha_2);
					
					// if the closer intersection point has alpha < 0, then we are inside the sphere and must not do anything
					if(alpha_1 >= 1.0) {
						//TODO: output trackPoint_changed event
						var hitPoint = viewRay.pos.add(viewRay.dir.multiply(alpha_1));
						
						var vecToHitPoint = hitPoint.subtract(this._localOrigin).normalize();
						
						this._currentRotation = x3dom.fields.Quaternion.rotateFromTo(this._initialSphereIntersectionVector, vecToHitPoint);
						
						this._currentRotation = this._currentRotation.multiply(this._vf.offset);
						
						// output rotationChanged_event, given in local sphere sensor coordinates
						this.postMessage('rotation_changed',  this._currentRotation);
					}
				 }
				 else {
					// do nothing, because no intersection
				 }
            },

            //----------------------------------------------------------------------------------------------------------------------

            /**
             * @overrides x3dom.nodeTypes.X3DDragSensorNode._stopDragging
             * @private
             */
            _stopDragging: function()
            {
                x3dom.nodeTypes.X3DDragSensorNode.prototype._stopDragging.call(this);

                if (this._vf.autoOffset)
                {
                    this._vf.offset = this._currentRotation;
					this.postMessage('offset_changed', this._vf.offset);
                }
				
				this._currentRotation = new x3dom.fields.Quaternion();
            }

            //----------------------------------------------------------------------------------------------------------------------
        }
    )
);