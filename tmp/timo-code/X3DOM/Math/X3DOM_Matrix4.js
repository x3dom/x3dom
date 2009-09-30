// JavaScript Document
x3dom.matrix4 = {
	
	identity: function() 
	{
		return [1.0, 0.0, 0.0, 0.0,
				0.0, 1.0, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				0.0, 0.0, 0.0, 1.0];
		
	},
	
	isIdentity: function(mat4)
	{
		for(vari=0; i<16; i++){
			if(i==0 || i==5 || i==10 || i==15){
				if(mat4[i] != 1) return false;
			}else{
				if(mat4[i] != 0) return false;
			}
		}
		return true;
	},
	
	add: function(mat4_1, mat4_2) 
	{
		var mat4Result = new Array();
		
		for(var i=0; i<16; i++)
			matResult[i] = mat4_1[i] + mat4_2[i];
	
		return mat4Result;
	},
	
	mulScalar: function(mat4_1, scalar) 
	{
		var mat4Result = new Array();
		
		for(var i=0; i<16; i++)
			matResult[i] = mat4_1[i] * scalar;
	
		return mat4Result;
	},
	
	mul: function(mat4_1, mat4_2) 
	{
		var mat4Result = new Array();
		
		for (var i=0; i<4; ++i){
			for (var j=0; j<4; ++j){
				var s = 0;
				for (var k=0; k<4; ++k){
					s = s + mat4_1[4*i+k] * mat4_2[4*k+j];
				}
				mat4Result[4*i+j] = s;
			}
		}
	
		return mat4Result;
	},
		
	rotateX: function(angle) 
	{
		var rad = (angle*Math.PI) / 180.0;
		
		return [1.0,  0.0,           0.0,           0.0,
				0.0,  Math.cos(rad), Math.sin(rad), 0.0,
				0.0, -Math.sin(rad), Math.cos(rad), 0.0,
				0.0,  0.0,           0.0,           1.0];
	},
	
	rotateY: function(angle) 
	{
		var rad = (angle*Math.PI) / 180.0;
		
		return [Math.cos(rad), 0.0, -Math.sin(rad), 0.0,
				0.0,           1.0,  0.0,           0.0,
				Math.sin(rad), 0.0,  Math.cos(rad), 0.0,
				0.0,           0.0,  0.0,           1.0];
	},
	
	rotateZ: function(angle) 
	{
		var rad = (angle*Math.PI) / 180.0;
		
		return [ Math.cos(rad), Math.sin(rad), 0.0, 0.0,
				-Math.sin(rad), Math.cos(rad), 0.0, 0.0,
				 0.0,           0.0,           1.0, 0.0,
				 0.0,           0.0,           0.0, 1.0];
	},
	
	scale: function(sx, sy, sz) 
	{
		return [sx,  0.0, 0.0, 0.0,
			    0.0, sy,  0.0, 0.0,
			    0.0, 0.0, sz,  0.0,
			    0.0, 0.0, 0.0, 1.0];
	},
	
	translate: function(tx, ty, tz)
	{
		return [1.0, 0.0, 0.0, 0.0,
			    0.0, 1.0, 0.0, 0.0,
			    0.0, 0.0, 1.0, 0.0,
			    tx,  ty,  tz,  1.0];
	},
	
	orthoLH: function(w, h, zn, zf)
	{	
		return [2.0/w, 0.0,   0.0,         0.0,
				0.0,   2.0/h, 0.0,         0.0,
				0.0,   0.0,   1.0/(zf-zn), 0.0,
				0.0,   0.0,   -zn/(zf-zn), 1.0];

	},
	
	orthoRH: function(w, h, zn, zf)
	{		
		return [2.0/w, 0.0,   0.0,         0.0,
				0.0,   2.0/h, 0.0,         0.0,
				0.0,   0.0,   1.0/(zn-zf), 0.0,
				0.0,   0.0,   zn/(zn-zf),  1.0];

	},
	
	perspectiveFovLH: function(fovy, aspect, zn, zf) 
	{
		yScale = 1/Math.tan(fovy/2.0);
		xScale = yScale/aspect;
		
		return [xScale, 0.0, 0.0, 0.0,
				0.0, yScale, 0.0, 0.0,
				0.0, 0.0, zf/(zf-zn), 1.0,
				0.0, 0.0, -zn*zf/(zf-zn), 0.0];
	},
	
	perspectiveFovRH: function(fovy, aspect, zn, zf) 
	{
		yScale = 1/Math.tan(fovy/2.0);
		xScale = yScale/aspect;
		
		return [xScale, 0.0,    0.0,           0.0,
				0.0,    yScale, 0.0,           0.0,
				0.0,    0.0,    zf/(zn-zf),   -1.0,
				0.0,    0.0,    zn*zf/(zn-zf), 0.0];
	},
	
	lookAtLH: function(eye, at, up)
	{
		var zaxis = x3dom.vector3.normalize(x3dom.vector3.sub(at, eye));
		var xaxis = x3dom.vector3.normalize(x3dom.vector3.cross(up, zaxis));
		var yaxis = x3dom.vector3.normalize(x3dom.vector3.cross(zaxis, xaxis));
		
		var dotX = x3dom.vector3.dot(xaxis, eye);
		var dotY = x3dom.vector3.dot(yaxis, eye);
		var dotZ = x3dom.vector3.dot(zaxis, eye);
	
		return [xaxis[0], yaxis[0], zaxis[0], 0.0,
				xaxis[1], yaxis[1], zaxis[1], 0.0,
				xaxis[2], yaxis[2], zaxis[2], 0.0,
				-dotX,    -dotY,    -dotZ,    1.0];
	},
	
	lookAtRH: function(eye, at, up)
	{
		var zaxis = x3dom.vector3.normalize(x3dom.vector3.sub(eye, at));
		var xaxis = x3dom.vector3.normalize(x3dom.vector3.cross(up, zaxis));
		var yaxis = x3dom.vector3.normalize(x3dom.vector3.cross(zaxis, xaxis));
		
		var dotX = x3dom.vector3.dot(xaxis, eye);
		var dotY = x3dom.vector3.dot(yaxis, eye);
		var dotZ = x3dom.vector3.dot(zaxis, eye);
	
		return [xaxis[0], yaxis[0], zaxis[0], 0.0,
				xaxis[1], yaxis[1], zaxis[1], 0.0,
				xaxis[2], yaxis[2], zaxis[2], 0.0,
				-dotX,    -dotY,    -dotZ,    1.0];
	},
	
	transpose: function(mat4)
	{
		return [mat4[0], mat4[4],  mat4[8], mat4[12],
				mat4[1], mat4[5],  mat4[9], mat4[13],
				mat4[2], mat4[6], mat4[10], mat4[14],
				mat4[3], mat4[7], mat4[11], mat4[15]];
	},
	
	inverse: function(mat4)
	{
		var kInv = [];
		var fA0 = mat4[ 0] * mat4[ 5] - mat4[ 1] * mat4[ 4];
		var fA1 = mat4[ 0] * mat4[ 6] - mat4[ 2] * mat4[ 4];
		var fA2 = mat4[ 0] * mat4[ 7] - mat4[ 3] * mat4[ 4];
		var fA3 = mat4[ 1] * mat4[ 6] - mat4[ 2] * mat4[ 5];
		var fA4 = mat4[ 1] * mat4[ 7] - mat4[ 3] * mat4[ 5];
		var fA5 = mat4[ 2] * mat4[ 7] - mat4[ 3] * mat4[ 6];
		var fB0 = mat4[ 8] * mat4[13] - mat4[ 9] * mat4[12];
		var fB1 = mat4[ 8] * mat4[14] - mat4[10] * mat4[12];
		var fB2 = mat4[ 8] * mat4[15] - mat4[11] * mat4[12];
		var fB3 = mat4[ 9] * mat4[14] - mat4[10] * mat4[13];
		var fB4 = mat4[ 9] * mat4[15] - mat4[11] * mat4[13];
		var fB5 = mat4[10] * mat4[15] - mat4[11] * mat4[14];

		// Determinant
		var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;
		
		// Account for a very small value
		if (Math.abs(fDet) <= 0.00000001)
		{
			x3dom.debug.error('matrix4.inverse() failed due to bad values');
			return null;
		}

		kInv[ 0] = + mat4[ 5] * fB5 - mat4[ 6] * fB4 + mat4[ 7] * fB3;
		kInv[ 4] = - mat4[ 4] * fB5 + mat4[ 6] * fB2 - mat4[ 7] * fB1;
		kInv[ 8] = + mat4[ 4] * fB4 - mat4[ 5] * fB2 + mat4[ 7] * fB0;
		kInv[12] = - mat4[ 4] * fB3 + mat4[ 5] * fB1 - mat4[ 6] * fB0;
		kInv[ 1] = - mat4[ 1] * fB5 + mat4[ 2] * fB4 - mat4[ 3] * fB3;
		kInv[ 5] = + mat4[ 0] * fB5 - mat4[ 2] * fB2 + mat4[ 3] * fB1;
		kInv[ 9] = - mat4[ 0] * fB4 + mat4[ 1] * fB2 - mat4[ 3] * fB0;
		kInv[13] = + mat4[ 0] * fB3 - mat4[ 1] * fB1 + mat4[ 2] * fB0;
		kInv[ 2] = + mat4[13] * fA5 - mat4[14] * fA4 + mat4[15] * fA3;
		kInv[ 6] = - mat4[12] * fA5 + mat4[14] * fA2 - mat4[15] * fA1;
		kInv[10] = + mat4[12] * fA4 - mat4[13] * fA2 + mat4[15] * fA0;
		kInv[14] = - mat4[12] * fA3 + mat4[13] * fA1 - mat4[14] * fA0;
		kInv[ 3] = - mat4[ 9] * fA5 + mat4[10] * fA4 - mat4[11] * fA3;
		kInv[ 7] = + mat4[ 8] * fA5 - mat4[10] * fA2 + mat4[11] * fA1;
		kInv[11] = - mat4[ 8] * fA4 + mat4[ 9] * fA2 - mat4[11] * fA0;
		kInv[15] = + mat4[ 8] * fA3 - mat4[ 9] * fA1 + mat4[10] * fA0;

		// Inverse using Determinant
		var fInvDet = 1.0 / fDet;
		kInv[ 0] *= fInvDet;
		kInv[ 1] *= fInvDet;
		kInv[ 2] *= fInvDet;
		kInv[ 3] *= fInvDet;
		kInv[ 4] *= fInvDet;
		kInv[ 5] *= fInvDet;
		kInv[ 6] *= fInvDet;
		kInv[ 7] *= fInvDet;
		kInv[ 8] *= fInvDet;
		kInv[ 9] *= fInvDet;
		kInv[10] *= fInvDet;
		kInv[11] *= fInvDet;
		kInv[12] *= fInvDet;
		kInv[13] *= fInvDet;
		kInv[14] *= fInvDet;
		kInv[15] *= fInvDet;

		return kInv;
	}
	
};
