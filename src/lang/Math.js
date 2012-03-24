/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */
 
/** @namespace The math namespace. */
math = {};

math.Eps = 0.000001;

/** Float32Array  */
if(typeof Float32Array != "undefined")
  math.Float32Array = Float32Array;
else if(typeof WebGLFloatArray != "undefined") 
  math.Float32Array = WebGLFloatArray;
else
  math.Float32Array = Array;
  
/** The Vector[2] */
math.vec2 = 
{
  create : function(arg)
  {
    var vec = new math.Float32Array(2);
    
    if(arg.length)
    {
      if(arg[0] instanceof Array)
        for(var i=0; i<2; ++i)
          vec[i] = arg[0][i];
          
      else
        for(var i=0; i<2; ++i)
          vec[i] = arg[i];
    }
    
    return vec;
  },
  
  negate : function(vec)
  {
    vec[0] = -vec[0],
    vec[1] = -vec[1];
  },
  
  add : function(left, right, result)
  {
    result[0] = left[0] + right[0],
    result[1] = left[1] + right[1];
  },
  
  subtract : function(left, right, result)
  {
    result[0] = left[0] - right[0],
    result[1] = left[1] - right[1];
  },
  
  dot : function(left, right)
  {
    return left[0] * right[0] + left[1] * right[1];
  },
  
  length : function(vec)
  {
    var x = vec[0];
    var y = vec[1];
    
    return Math.sqrt(x*x + y*y);
  },
  
  normalize : function(vec)
  {
    var x = vec[0];
    var y = vec[1];
    
    var n = Math.sqrt(x*x + y*y);
    
    if(n != 0.0)
      n = 1.0 / n;
    else
      return;
      
    vec[0] = x * n;
    vec[1] = y * n;
  }
};

/** The Vector[3] */
math.vec3 = 
{
  create : function(arg)
  {
    var vec = new math.Float32Array(3);
    
    if(arg.length)
    {
      if(arg[0] instanceof Array)
        for(var i=0; i<3; ++i)
          vec[i] = arg[0][i];
          
      else
        for(var i=0; i<3; ++i)
          vec[i] = arg[i];
    }
    
    return vec;
  },
  
  copy : function(vec)
  {
    return this.create(vec);
  },
  
  toString : function(vec)
  {
    return "[" + vec[0].toFixed(6) + " " + vec[1].toFixed(6) + " " + vec[2].toFixed(6) + "]";
  },
  
  negate : function(vec)
  {
    vec[0] = -vec[0],
    vec[1] = -vec[1],
    vec[2] = -vec[2];
  },
  
  add : function(left, right, result)
  {
    result[0] = left[0] + right[0],
    result[1] = left[1] + right[1],
    result[2] = left[2] + right[2];
  },
  
  subtract : function(left, right, result)
  {
    result[0] = left[0] - right[0],
    result[1] = left[1] - right[1],
    result[2] = left[2] - right[2];
  },
  
  dot : function(left, right)
  {
    return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
  },
  
  cross : function(left, right, result)
  {
    var xl = left[0],
        yl = left[1],
        zl = left[2]
        xr = right[0],
        yr = right[1],
        zr = right[2];
    
    result[0] = (yl * zr) - (zl * yr),
    result[1] = (zl * xr) - (xl * zr),
    result[2] = (xl * yr) - (yl * xr);
  },
  
  length : function(vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2];
    
    return Math.sqrt(x*x + y*y + z*z);
  },
  
  normalize : function(vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2];
    
    var n = Math.sqrt(x*x + y*y + z*z);
    
    if(n != 0.0)
      n = 1.0 / n;
    else
      return;
      
    vec[0] = x * n,
    vec[1] = y * n,
    vec[2] = z * n;
  },
  
  scale : function(vec, factor, result)
  {
    result[0] = vec[0] * factor;
    result[1] = vec[1] * factor;
    result[2] = vec[2] * factor;
  }
};

/** The Vector[4] */
math.vec4 = 
{
  create : function(arg)
  {
    var vec = new math.Float32Array(4);
    
    if(arg.length)
    {
      if(arg[0] instanceof Array)
        for(var i=0; i<4; ++i)
          vec[i] = arg[0][i];
          
      else
        for(var i=0; i<4; ++i)
          vec[i] = arg[i];
    }
    
    return vec;
  },
   
  negate : function(vec)
  {
    vec[0] = -vec[0],
    vec[1] = -vec[1],
    vec[2] = -vec[2],
    vec[3] = -vec[3];
  },
  
  add : function(left, right, result)
  {
    result[0] = left[0] + right[0],
    result[1] = left[1] + right[1],
    result[2] = left[2] + right[2],
    result[3] = left[3] + right[3];
  },
  
  subtract : function(left, right, result)
  {
    result[0] = left[0] - right[0],
    result[1] = left[1] - right[1],
    result[2] = left[2] - right[2],
    result[3] = left[3] - right[3];
  },
  
  dot : function(left, right)
  {
    return left[0] * right[0] + left[1] * right[1] + left[2] * right[2] + left[3] * right[3];
  },
  
  length : function(vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2],
        w = vec[3];
    
    return Math.sqrt(x*x + y*y + z*z);
  },
  
  normalize : function(vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2],
        w = vec[3];
    
    var n = Math.sqrt(x*x + y*y + z*z + w*w);
    
    if(n != 0.0)
      n = 1.0 / n;
    else
      return;
      
    vec[0] = x * n,
    vec[1] = y * n,
    vec[2] = z * n,
    vec[3] = w * n;
  }
};

/** The 2x2 Matrix */
math.mat2x2 = 
{
};

/** The 3x3 Matrix */
math.mat3x3 = 
{
};

/** The 4x4 Matrix */
math.mat4x4 = 
{
  create : function(arg)
  {
    var mat = new math.Float32Array(16);
    
    if(arg)
    {
      if(arg[0] instanceof Array)
        for(var i=0; i<16; ++i)
          mat[i] = arg[0][i];
          
      else
        for(var i=0; i<16; ++i)
          mat[i] = arg[i];
    }
    
    else
    {
      mat[00] = 1, mat[01] = 0, mat[02] = 0, mat[03] = 0;
      mat[04] = 0, mat[05] = 1, mat[06] = 0, mat[07] = 0;
      mat[08] = 0, mat[09] = 0, mat[10] = 1, mat[11] = 0;
      mat[12] = 0, mat[13] = 0, mat[14] = 0, mat[15] = 1;
    }

    return mat;
  },
  
  identity : function(mat)
  {
    var temp = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    
    for(var i=0; i<16; ++i)
      mat[i] = temp[i];
  },
  
  zero : function(mat)
  {
    var temp = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
    
    for(var i=0; i<16; ++i)
      mat[i] = temp[i];
  },
  
  copy : function(mat)
  {
    return this.create(mat);
  },
  
  toString : function(mat)
  {
    return "| " + mat[00].toFixed(6) + " " + mat[01].toFixed(6) + " " + mat[02].toFixed(6) + " " + mat[03].toFixed(6) + " |\n" +
           "| " + mat[04].toFixed(6) + " " + mat[05].toFixed(6) + " " + mat[06].toFixed(6) + " " + mat[07].toFixed(6) + " |\n" +
           "| " + mat[08].toFixed(6) + " " + mat[09].toFixed(6) + " " + mat[10].toFixed(6) + " " + mat[11].toFixed(6) + " |\n" +
           "| " + mat[12].toFixed(6) + " " + mat[13].toFixed(6) + " " + mat[14].toFixed(6) + " " + mat[15].toFixed(6) + " |";
  },
  
  add : function(left, right, result)
  {
    for(var i=0; i<16; ++i)
      result[i] = left[i] + right[i];
  },
  
  mult : function(left, right, result)
  {
    var l00 =  left[00], l01 =  left[01], l02 =  left[02], l03 =  left[03],
        l10 =  left[04], l11 =  left[05], l12 =  left[06], l13 =  left[07],
        l20 =  left[08], l21 =  left[09], l22 =  left[10], l23 =  left[11],
        l30 =  left[12], l31 =  left[13], l32 =  left[14], l33 =  left[15],
        
        r00 = right[00], r01 = right[01], r02 = right[02], r03 = right[03],
        r10 = right[04], r11 = right[05], r12 = right[06], r13 = right[07],
        r20 = right[08], r21 = right[09], r22 = right[10], r23 = right[11],
        r30 = right[12], r31 = right[13], r32 = right[14], r33 = right[15];
        
    result[00] = l00 * r00 + l01 * r10 + l02 * r20 + l03 * r30, 
    result[01] = l00 * r01 + l01 * r11 + l02 * r21 + l03 * r31, 
    result[02] = l00 * r02 + l01 * r12 + l02 * r22 + l03 * r32, 
    result[03] = l00 * r03 + l01 * r13 + l02 * r23 + l03 * r33, 
    
    result[04] = l10 * r00 + l11 * r10 + l12 * r20 + l13 * r30, 
    result[05] = l10 * r01 + l11 * r11 + l12 * r21 + l13 * r31, 
    result[06] = l10 * r02 + l11 * r12 + l12 * r22 + l13 * r32, 
    result[07] = l10 * r03 + l11 * r13 + l12 * r23 + l13 * r33, 
    
    result[08] = l20 * r00 + l21 * r10 + l22 * r20 + l23 * r30, 
    result[09] = l20 * r01 + l21 * r11 + l22 * r21 + l23 * r31, 
    result[10] = l20 * r02 + l21 * r12 + l22 * r22 + l23 * r32, 
    result[11] = l20 * r03 + l21 * r13 + l22 * r23 + l23 * r33, 
    
    result[12] = l30 * r00 + l31 * r10 + l32 * r20 + l33 * r30, 
    result[13] = l30 * r01 + l31 * r11 + l32 * r21 + l33 * r31, 
    result[14] = l30 * r02 + l31 * r12 + l32 * r22 + l33 * r32, 
    result[15] = l30 * r03 + l31 * r13 + l32 * r23 + l33 * r33;
  },
  
  transpose : function(mat)
  {
    var                 m01 =  mat[01], m02 =  mat[02], m03 =  mat[03],
        m04 =  mat[04],                 m06 =  mat[06], m07 =  mat[07],
        m08 =  mat[08], m09 =  mat[09],                 m11 =  mat[11],
        m12 =  mat[12], m13 =  mat[13], m14 =  mat[14];
        
                   mat[01] = m04, mat[02] = m08, mat[03] = m12,
    mat[04] = m01,                mat[06] = m09, mat[07] = m13,
    mat[08] = m02, mat[09] = m06,                mat[11] = m14, 
    mat[12] = m03, mat[13] = m07, mat[14] = m11;
  },
  
  det : function(mat)
  {
    var m00 = mat[00], m01 = mat[01], m02 = mat[02], m03 = mat[03],
        m10 = mat[04], m11 = mat[05], m12 = mat[06], m13 = mat[07],
        m20 = mat[08], m21 = mat[09], m22 = mat[10], m23 = mat[11],
        m30 = mat[12], m31 = mat[13], m32 = mat[14], m33 = mat[15];
    
    var d0 = m00 * ((m11 * m22 * m33 + m12 * m23 * m31 + m13 * m21 * m32) -
                    (m11 * m23 * m32 + m12 * m21 * m33 + m13 * m22 * m31));
                    
    var d1 = m10 * ((m01 * m22 * m33 + m02 * m23 * m31 + m03 * m21 * m32) -
                    (m01 * m23 * m32 + m02 * m21 * m33 + m03 * m22 * m31));
                    
    var d2 = m20 * ((m01 * m12 * m33 + m02 * m13 * m31 + m03 * m11 * m32) -
                   (m01 * m13 * m32 + m02 * m11 * m33 + m03 * m12 * m31));
                   
    var d3 = m30 * ((m01 * m12 * m23 + m02 * m13 * m21 + m03 * m11 * m22) -
                   (m01 * m13 * m22 + m02 * m11 * m23 + m03 *m12 * m21));
                   
   return d0 - d1 + d2 - d3;
  },
  
  inverse : function(mat)
  {
    // DEBUG
    if(this.det(mat) == 0)
    {
      x3dom.debug.logInfo("Divide by 0");
      return;
    }
    // DEBUG
    
    // based on code of glMatrix.js (Brandon Jones 2011)
    var m00 = mat[00], m01 = mat[01], m02 = mat[02], m03 = mat[03],
        m10 = mat[04], m11 = mat[05], m12 = mat[06], m13 = mat[07],
        m20 = mat[08], m21 = mat[09], m22 = mat[10], m23 = mat[11],
        m30 = mat[12], m31 = mat[13], m32 = mat[14], m33 = mat[15];

    var d00 = m00 * m11 - m01 * m10,
        d01 = m00 * m12 - m02 * m10,
        d02 = m00 * m13 - m03 * m10,
        d03 = m01 * m12 - m02 * m11,
        d04 = m01 * m13 - m03 * m11,
        d05 = m02 * m13 - m03 * m12,
        d06 = m20 * m31 - m21 * m30,
        d07 = m20 * m32 - m22 * m30,
        d08 = m20 * m33 - m23 * m30,
        d09 = m21 * m32 - m22 * m31,
        d10 = m21 * m33 - m23 * m31,
        d11 = m22 * m33 - m23 * m32;

    var det_inv = 1.0 / (d00 * d11 - d01 * d10 + d02 * d09 + d03 * d08 - d04 * d07 + d05 * d06);

    mat[00] = ( m11 * d11 - m12 * d10 + m13 * d09) * det_inv;
    mat[01] = (-m01 * d11 + m02 * d10 - m03 * d09) * det_inv;
    mat[02] = ( m31 * d05 - m32 * d04 + m33 * d03) * det_inv;
    mat[03] = (-m21 * d05 + m22 * d04 - m23 * d03) * det_inv;
    
    mat[04] = (-m10 * d11 + m12 * d08 - m13 * d07) * det_inv;
    mat[05] = ( m00 * d11 - m02 * d08 + m03 * d07) * det_inv;
    mat[06] = (-m30 * d05 + m32 * d02 - m33 * d01) * det_inv;
    mat[07] = ( m20 * d05 - m22 * d02 + m23 * d01) * det_inv;
    
    mat[08] = ( m10 * d10 - m11 * d08 + m13 * d06) * det_inv;
    mat[09] = (-m00 * d10 + m01 * d08 - m03 * d06) * det_inv;
    mat[10] = ( m30 * d04 - m31 * d02 + m33 * d00) * det_inv;
    mat[11] = (-m20 * d04 + m21 * d02 - m23 * d00) * det_inv;
    
    mat[12] = (-m10 * d09 + m11 * d07 - m12 * d06) * det_inv;
    mat[13] = ( m00 * d09 - m01 * d07 + m02 * d06) * det_inv;
    mat[14] = (-m30 * d03 + m31 * d01 - m32 * d00) * det_inv;
    mat[15] = ( m20 * d03 - m21 * d01 + m22 * d00) * det_inv;
  },
  
  translate : function(mat, vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2];
    
    mat[03] = mat[00] * x + mat[01] * y + mat[02] * z + mat[03];
    mat[07] = mat[04] * x + mat[05] * y + mat[06] * z + mat[07];
    mat[11] = mat[08] * x + mat[09] * y + mat[10] * z + mat[11];
    mat[15] = mat[12] * x + mat[13] * y + mat[14] * z + mat[15];
  },
  
  setTranslation : function(mat, vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2];
    
    mat[03] = x;
    mat[07] = y;
    mat[11] = z;
  },
  
  scale : function(mat, vec)
  {
    var x = vec[0],
        y = vec[1],
        z = vec[2];

    mat[00] *= x, 
    mat[01] *= x, 
    mat[02] *= x, 
    mat[03] *= x, 
    
    mat[04] *= y, 
    mat[05] *= y, 
    mat[06] *= y, 
    mat[07] *= y, 
    
    mat[08] *= z, 
    mat[09] *= z, 
    mat[10] *= z, 
    mat[11] *= z;
  },
  
  rotateX : function(mat, angle)
  {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    
    var m01 = mat[01], m02 = mat[02],
        m11 = mat[05], m12 = mat[06],
        m21 = mat[09], m22 = mat[10],
        m31 = mat[13], m32 = mat[14];

    mat[01] = m01 * c + m02 * -s, 
    mat[02] = m01 * s + m02 *  c, 
    mat[05] = m11 * c + m12 * -s, 
    mat[06] = m11 * s + m12 *  c, 
    mat[09] = m21 * c + m22 * -s, 
    mat[10] = m21 * s + m22 *  c, 
    mat[13] = m31 * c + m32 * -s, 
    mat[14] = m31 * s + m32 *  c;
  },
  
  rotateY : function(mat, angle)
  {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var m00 = mat[00], m02 = mat[02],
        m10 = mat[04], m12 = mat[06],
        m20 = mat[08], m22 = mat[10],
        m30 = mat[12], m32 = mat[14];

    mat[00] = m00 *  c + m02 * s, 
    mat[02] = m00 * -s + m02 * c, 
    mat[04] = m10 *  c + m12 * s, 
    mat[06] = m10 * -s + m12 * c, 
    mat[08] = m20 *  c + m22 * s, 
    mat[10] = m20 * -s + m22 * c, 
    mat[12] = m30 *  c + m32 * s, 
    mat[14] = m30 * -s + m32 * c;
  },
  
  rotateZ : function(mat, angle)
  {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var m00 = mat[00], m01 = mat[01],
        m10 = mat[04], m11 = mat[05],
        m20 = mat[08], m21 = mat[09],
        m30 = mat[12], m31 = mat[13];

    mat[00] = m00 * c + m01 * -s, 
    mat[01] = m00 * s + m01 *  c,
    mat[04] = m10 * c + m11 * -s, 
    mat[05] = m10 * s + m11 *  c,
    mat[08] = m20 * c + m21 * -s, 
    mat[09] = m20 * s + m21 *  c,
    mat[12] = m30 * c + m31 * -s, 
    mat[13] = m30 * s + m31 *  c;
  },
  
  lookAt : function(eye, at, up, mat)
  {
    var eye_x = eye[0], eye_y = eye[1], eye_z = eye[0],
        at_x  = at[0],  at_y  = at[1],  at_z  = at[2],
        up_x  = up[2],  up_y  = up[2],  up_z  = up[2];
        
    if(eye_x == at_x && eye_x == at_x && eye_x == at_x)
    {
      this.identity(mat);
      return;
    }
    
    // math.vec3.subtract(eye, at, dir);
    var dir_x = eye_x - at_x,
        dir_y = eye_y - at_y,
        dir_z = eye_z - at_z;
    
    // math.vec3.normalize(dir);
    var n_dir = 1.0 / Math.sqrt(dir_x*dir_x + dir_y*dir_y + dir_z*dir_z);
    dir_x *= n_dir,
    dir_y *= n_dir,
    dir_z *= n_dir;
    
    // math.vec3.cross(up, dir, right);
    var right_x = up_y*dir_z - up_z*dir_y,
        right_y = up_z*dir_x - up_x*dir_z,
        right_z = up_x*dir_y - up_y*dir_x;
    
    // math.vec3.normalize(right);
    var n_right = 1.0 / Math.sqrt(dir_x*dir_x + dir_y*dir_y + dir_z*dir_z);
    right_x *= n_right,
    right_y *= n_right,
    right_z *= n_right;
    
    // math.vec3.cross(dir, right, newup);
    var newup_x = dir_y*right_z - dir_z*right_y,
        newup_y = dir_z*right_x - dir_x*right_z,
        newup_z = dir_x*right_y - dir_y*right_x;
    
    // math.vec3.normalize(newup);
    var n_newup = 1.0 / Math.sqrt(newup_x*newup_x + newup_y*newup_y + newup_z*newup_z);
    newup_x *= n_newup,
    newup_y *= n_newup,
    newup_z *= n_newup;
    
    var trans_x = -(right_x * eye_x + right_y * eye_y + right_z * eye_z),
        trans_y = -(newup_x * eye_x + newup_y * eye_y + newup_z * eye_z),
        trans_z = -(dir_x   * eye_x + dir_x   * eye_y + dir_x   * eye_z);

    // this.mult(mat, temp, mat);
    mat[00] = right_x, mat[01] = newup_x, mat[02] = dir_x,   mat[03] = 0,
    mat[04] = right_y, mat[05] = newup_y, mat[06] = dir_y,   mat[07] = 0,
    mat[08] = right_z, mat[09] = newup_z, mat[10] = dir_z,   mat[11] = 0,
    mat[12] = trans_x, mat[13] = trans_y, mat[14] = trans_z, mat[15] = 1;
  },
  
  lookAt2 : function(eye, at, up, mat)
  {
    var dir = math.vec3.create();
    var newup = math.vec3.create();
    var right = math.vec3.create();
    
    math.vec3.subtract(eye, at, dir);
    math.vec3.normalize(dir);
    math.vec3.cross(up, dir, right);
    
    math.vec3.normalize(right);
    math.vec3.cross(dir, right, newup);
    math.vec3.normalize(newup);
    
    var right_x = right[0],
        right_y = right[1],
        right_z = right[2],
        newup_x = newup[0],
        newup_y = newup[1],
        newup_z = newup[2],
        dir_x   = dir[0],
        dir_y   = dir[1],
        dir_z   = dir[2],
        eye_x   = eye[0],
        eye_y   = eye[1],
        eye_z   = eye[2];
        
    var trans_x = -(right_x * eye_x + right_y * eye_y + right_z * eye_z),
        trans_y = -(newup_x * eye_x + newup_y * eye_y + newup_z * eye_z),
        trans_z = -(dir_x   * eye_x + dir_x   * eye_y + dir_x   * eye_z);
    
    mat[00] = right_x, mat[01] = newup_x, mat[02] = dir_x,   mat[03] = 0,
    mat[04] = right_y, mat[05] = newup_y, mat[06] = dir_y,   mat[07] = 0,
    mat[08] = right_z, mat[09] = newup_z, mat[10] = dir_z,   mat[11] = 0,
    mat[12] = trans_x, mat[13] = trans_y, mat[14] = trans_z, mat[15] = 1;
  },
  
  column3 : function(mat, col, vec)
  {
    if(col == 0)
    {
      vec[0] = mat[00];
      vec[1] = mat[04];
      vec[2] = mat[08];
    }
    else if(col == 1)
    {
      vec[0] = mat[01];
      vec[1] = mat[05];
      vec[2] = mat[09];
    }
    else if(col == 2)
    {
      vec[0] = mat[02];
      vec[1] = mat[06];
      vec[2] = mat[10];
    }
    else if(col == 3)
    {
      vec[0] = mat[03];
      vec[1] = mat[07];
      vec[2] = mat[11];
    }
  }
};
  
/** The Quaternion */
math.quat = 
{
  create : function()
  {
    var quat = new math.Float32Array(3);
    
    if(arg.length)
    {
      if(arg[0] instanceof Array)
        for(var i=0; i<4; ++i)
          quat[i] = arg[0][i];
          
      else
        for(var i=0; i<4; ++i)
          quat[i] = arg[i];
    }
    
    return quat;
  },
  
  negate : function(quat)
  {
    quat[0] = -quat[0],
    quat[1] = -quat[1],
    quat[2] = -quat[2],
    quat[3] = -quat[3];
  },
  
  add : function(left, right, result)
  {
    result[0] = left[0] + right[0],
    result[1] = left[1] + right[1],
    result[2] = left[2] + right[2],
    result[3] = left[3] + right[3];
  },
  
  subtract : function(left, right, result)
  {
    result[0] = left[0] - right[0],
    result[1] = left[1] - right[1],
    result[2] = left[2] - right[2],
    result[3] = left[3] - right[3];
  },
  
  dot : function(left, right)
  {
    return left[0] * right[0] + left[1] * right[1] + left[2] * right[2] + left[3] * right[3];
  },
  
  mult : function(left, right, result)
  {
    result[0] = left[3] * right[0] + left[0] * right[3] + left[1] * right[2] - left[2] * right[1],
    result[1] = left[3] * right[1] + left[1] * right[3] + left[2] * right[0] - left[0] * right[2],
    result[2] = left[3] * right[2] + left[2] * right[3] + left[0] * right[1] - left[1] * right[0],
    result[3] = left[3] * right[3] - left[0] * right[0] - left[1] * right[1] - left[2] * right[2];
  },
  
  inverse : function(quat)
  {
    quat[0] = -quat[0],
    quat[1] = -quat[1],
    quat[2] = -quat[2];
  },
  
  normalize : function(quat)
  {
    var x = quat[0],
        y = quat[1],
        z = quat[2],
        w = quat[3];
    
    var d = x*x + y*y + z*z + w*w;
    if(d)
    {
      var f = 1.0 / Math.sqrt(d);
      quat[0] *= f;
      quat[1] *= f;
      quat[2] *= f;
      quat[3] *= f;
    }
  }
};