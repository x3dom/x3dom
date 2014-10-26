/** @namespace x3dom.nodeTypes */
/*
 * Based on code originally provided by
 * http://www.x3dom.org
 * 
 * (C)2014 Toshiba Corporation, Japan.
 * Dual licensed under the MIT and GPL
 */

// ### SplinePositionInterpolator ###
x3dom.registerNodeType(
    "SplinePositionInterpolator",
    "Interpolation",
    defineClass(x3dom.nodeTypes.X3DInterpolatorNode,
        
        /**
         * Constructor for SplinePositionInterpolator
         * @constructs x3dom.nodeTypes.SplinePositionInterpolator
         * @x3d 3.3
         * @component Interpolation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInterpolatorNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The SplinePositionInterpolator node non-linearly interpolates among a list of 3D vectors to produce an SFVec3f value_changed event. The keyValue, keyVelocity, and key fields shall each have the same number of values.
         */
        function (ctx) {
            x3dom.nodeTypes.SplinePositionInterpolator.superClass.call(this, ctx);

            /**
             * Defines the set of data points, that are used for interpolation.
             * @var {x3dom.fields.MFVec3f} keyValue
             * @memberof x3dom.nodeTypes.SplinePositionInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'keyValue', []);
			
			/**
             * Defines the set of velocity vectors, that are used for interpolation.
             * @var {x3dom.fields.MFVec3f} keyVelocity
             * @memberof x3dom.nodeTypes.SplinePositionInterpolator
             * @initvalue []
             * @field x3d
             * @instance
             */
			this.addField_MFVec3f(ctx, 'keyVelocity', []);
			
			/**
             * Specifies whether the interpolator should provide a closed loop, with continuous velocity vectors as the interpolator transitions from the last key to the first key.
             * @var {x3dom.fields.SFBool} closed
             * @memberof x3dom.nodeTypes.SplinePositionInterpolator
             * @initvalue false
             * @field x3d
             * @instance
             */
			this.addField_SFBool(ctx, 'closed', false);
			
			/**
             * Specifies whether the velocity vectors are to be transformed into normalized tangency vectors.
             * @var {x3dom.fields.SFBool} normalizeVelocity
             * @memberof x3dom.nodeTypes.SplinePositionInterpolator
             * @initvalue false
             * @field x3d
             * @instance
             */
			this.addField_SFBool(ctx, 'normalizeVelocity', false);
			 
			/******** Private variables and functions ***********/
			
			/* dtot is the sum of the distance between all adjacent keys.
			 * dtot = SUM{i=0, i < n-1}(|vi - vi+1|)
			 */
			this.dtot = 0.0;
			
			/* Non-uniform interval adjusted velocity vectors
			 */
			this.T0 = [];
			this.T1 = [];
			
			/* Checks sanity. Node is sane if (|key| == |key_value|) and (|key| == |key_velocity| or |key_velocity| == 0 or (|key_velocity| == 2 and |key| >= 2))
			 */
			this.checkSanity = function() {
				var sane = (this._vf.key.length == this._vf.keyValue.length) &&
						   ((this._vf.key.length == this._vf.keyVelocity.length) || (this._vf.keyVelocity.length == 2 && this._vf.key.length >= 2) || (this._vf.keyVelocity.length == 0));
				if(!sane)
					x3dom.debug.logWarning("SplinePositionInterpolator Node: 'key' , 'keyValue' and/or 'keyVelocity' fields have inappropriate sizes");
			};
			
			/* Calculate dtot (sum of distances between all adjacent keys)
			 */
			this.calcDtot = function()
			{
				this.dtot = 0.0;
				for(var i = 0; i < this._vf.key.length-1; i++) 
				{
					this.dtot += Math.abs(this._vf.key[i] - this._vf.key[i+1]);
				}
			};
			 
			/* Calculate non-uniform interval adjusted velocity vectors
			 */
			this.calcAdjustedKeyVelocity = function()
			{
				var i, Ti, F_plus_i, F_minus_i;
				var N = this._vf.key.length;
				
				// If velocities are defined at all the control points, ignore 'closed' field
				if(this._vf.keyVelocity.length == N)
				{
					for(i = 0; i < N; i++)
					{
						Ti = this._vf.keyVelocity[i];
						
						if(this._vf.normalizeVelocity)
							Ti = Ti.multiply(this.dtot / Ti.length());
						
						F_plus_i = (i == 0 || i == N-1) ? 1.0 : 2.0 * (this._vf.key[i] - this._vf.key[i-1]) / (this._vf.key[i+1] - this._vf.key[i-1]);
						F_minus_i= (i == 0 || i == N-1) ? 1.0 : 2.0 * (this._vf.key[i+1] - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i-1]);
						
						this.T0[i] =  Ti.multiply(F_plus_i);
						this.T1[i] =  Ti.multiply(F_minus_i);
					}
				}
				// if only first and last velocities are specified, ignore 'closed' field
				else if(this._vf.keyVelocity.length == 2 && N > 2)
				{
					for(i = 0; i < N; i++)
					{
						if(i == 0)
							Ti = this._vf.keyVelocity[0];
						else if(i == N-1)
							Ti = this._vf.keyVelocity[1];
						else
							Ti = this._vf.keyValue[i+1].subtract(this._vf.keyValue[i-1]).multiply(0.5);
						
						if(this._vf.normalizeVelocity)
							Ti = Ti.multiply(this.dtot / Ti.length());
						
						F_plus_i = (i == 0 || i == N-1) ? 1.0 : 2.0 * (this._vf.key[i] - this._vf.key[i-1]) / (this._vf.key[i+1] - this._vf.key[i-1]);
						F_minus_i= (i == 0 || i == N-1) ? 1.0 : 2.0 * (this._vf.key[i+1] - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i-1]);
						
						this.T0[i] =  Ti.multiply(F_plus_i);
						this.T1[i] =  Ti.multiply(F_minus_i);
					}
				}
				// velocities are unspecified
				else
				{
					// ignore closed if first and last keyValues are not equal
					var closed = this._vf.closed && this._vf.keyValue[0].equals(this._vf.keyValue[N-1], 0.00001);
					
					for(i = 0; i < N; i++)
					{
						if((i == 0 || i == N-1) && !closed)
						{
							this.T0[i] = new x3dom.fields.SFVec3f(0, 0, 0);
							this.T1[i] = new x3dom.fields.SFVec3f(0, 0, 0);
							continue;
						}
						else if((i == 0 || i == N-1) && closed)
						{
							Ti = this._vf.keyValue[1].subtract(this._vf.keyValue[N-2]).multiply(0.5);
							if(i == 0) {
								F_plus_i = 2.0 * (this._vf.key[0] - this._vf.key[N-2]) / (this._vf.key[1] - this._vf.key[N-2]);
								F_minus_i= 2.0 * (this._vf.key[1] - this._vf.key[0]) / (this._vf.key[1] - this._vf.key[N-2]);
							}
							else {
								F_plus_i = 2.0 * (this._vf.key[N-1] - this._vf.key[N-2]) / (this._vf.key[1] - this._vf.key[N-2]);
								F_minus_i= 2.0 * (this._vf.key[1] - this._vf.key[N-1]) / (this._vf.key[1] - this._vf.key[N-2]);
							}
							F_plus_i = 2.0 * (this._vf.key[N-1] - this._vf.key[N-2]) / (this._vf.key[N-2] - this._vf.key[1]);
							F_minus_i= 2.0 * (this._vf.key[1] - this._vf.key[0]) / (this._vf.key[N-2] - this._vf.key[1]);
						}
						else
						{
							Ti = this._vf.keyValue[i+1].subtract(this._vf.keyValue[i-1]).multiply(0.5);
							F_plus_i = 2.0 * (this._vf.key[i] - this._vf.key[i-1]) / (this._vf.key[i+1] - this._vf.key[i-1]);
							F_minus_i= 2.0 * (this._vf.key[i+1] - this._vf.key[i]) / (this._vf.key[i+1] - this._vf.key[i-1]);
						}
						
						this.T0[i] =  Ti.multiply(F_plus_i);
						this.T1[i] =  Ti.multiply(F_minus_i);
					}
				}
			};
			
			this.checkSanity();
			this.calcDtot();
			this.calcAdjustedKeyVelocity();
        },
        {
            fieldChanged: function(fieldName)
            {
				switch(fieldName)
				{
					case 'key':
					case 'keyValue':
					case 'keyVelocity':
					{
						this.checkSanity();
						this.calcDtot();
						this.calcAdjustedKeyVelocity();
						break;
					}
					case 'closed':
					case 'normalizeVelocity':
					{
						this.calcAdjustedKeyVelocity();
						break;
					}
					case 'set_fraction':
					{
						var value;
						
						if(this._vf.key.length > 0.0) {
							if (this._vf.set_fraction <= this._vf.key[0])
								value = x3dom.fields.SFVec3f.copy(this._vf.keyValue[0]);

							else if (this._vf.set_fraction >= this._vf.key[this._vf.key.length-1])
								value = x3dom.fields.SFVec3f.copy(this._vf.keyValue[this._vf.key.length-1]);
						}
						
						for(var i = 0; i < this._vf.key.length-1; i++) {
							if ((this._vf.key[i] < this._vf.set_fraction) && (this._vf.set_fraction <= this._vf.key[i+1])) {
								var s = (this._vf.set_fraction - this._vf.key[i]) / (this._vf.key[i+1]-this._vf.key[i]);
								
								var S_H = new x3dom.fields.SFVec4f(2.0*s*s*s - 3.0*s*s + 1.0, -2.0*s*s*s + 3.0*s*s, s*s*s - 2.0*s*s + s, s*s*s - s*s);
								value = new x3dom.fields.SFVec3f(S_H.x * this._vf.keyValue[i].x + S_H.y * this._vf.keyValue[i+1].x + S_H.z * this.T0[i].x + S_H.w * this.T1[i+1].x,
															     S_H.x * this._vf.keyValue[i].y + S_H.y * this._vf.keyValue[i+1].y + S_H.z * this.T0[i].y + S_H.w * this.T1[i+1].y,
															     S_H.x * this._vf.keyValue[i].z + S_H.y * this._vf.keyValue[i+1].z + S_H.z * this.T0[i].z + S_H.w * this.T1[i+1].z);
								break;
							}
						}
						
						if(value !== undefined)
							this.postMessage('value_changed', value);
						else
							x3dom.debug.logWarning("SplinePositionInterpolator Node: value_changed is undefined!");
					}
				}
            }
        }
    )
);