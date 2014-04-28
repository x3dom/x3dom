//if this file is used as standalone lib, define some basics first
if (typeof x3dom === "undefined")
{
    /**
     * @namespace x3dom
     */
    x3dom = {
        extend: function(f) {
            function G() {}
            G.prototype = f.prototype || f;
            return new G();
        },

        debug: {
            logInfo:    function(msg) { console.log(msg); },
            logWarning: function(msg) { console.warn(msg); },
            logError:   function(msg) { console.error(msg); }
        }
    };

    if (!Array.map) {
        Array.map = function(array, fun, thisp) {
            var len = array.length;
            var res = [];
            for (var i = 0; i < len; i++) {
                if (i in array) {
                    res[i] = fun.call(thisp, array[i], i, array);
                }
            }
            return res;
        };
    }

    console.log("Using x3dom fields.js as standalone math and/or base types library.");
}

/**
 * @namespace x3dom.fields
 */
x3dom.fields = {};


// shortcut for convenience
var VecMath = x3dom.fields;


// Epsilon
//TODO: move to common header for fields?
x3dom.fields.Eps = 0.000001;


/**
 * Constructor. You must either speficy all argument values or no argument. In the latter case, an identity matrix will be created.
 * 
 * @class Represents a 4x4 matrix in row major format.
 * @param {Number} [_00=1] - value at [0,0]
 * @param {Number} [_01=0] - value at [0,1]
 * @param {Number} [_02=0] - value at [0,2]
 * @param {Number} [_03=0] - value at [0,3]
 * @param {Number} [_10=0] - value at [1,0]
 * @param {Number} [_11=1] - value at [1,1]
 * @param {Number} [_12=0] - value at [1,2]
 * @param {Number} [_13=0] - value at [1,3]
 * @param {Number} [_20=0] - value at [2,0]
 * @param {Number} [_21=0] - value at [2,1]
 * @param {Number} [_22=1] - value at [2,2]
 * @param {Number} [_23=0] - value at [2,3]
 * @param {Number} [_30=0] - value at [3,0]
 * @param {Number} [_31=0] - value at [3,1]
 * @param {Number} [_32=0] - value at [3,2]
 * @param {Number} [_33=1] - value at [3,3]
 */
//THINKABOUTME: use array instead of _xx?
x3dom.fields.SFMatrix4f = function(	_00, _01, _02, _03, 
									_10, _11, _12, _13, 
									_20, _21, _22, _23, 
									_30, _31, _32, _33) 
{
    if (arguments.length === 0) {
        this._00 = 1; this._01 = 0; this._02 = 0; this._03 = 0;
        this._10 = 0; this._11 = 1; this._12 = 0; this._13 = 0;
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else {
        this._00 = _00; this._01 = _01; this._02 = _02; this._03 = _03;
        this._10 = _10; this._11 = _11; this._12 = _12; this._13 = _13;
        this._20 = _20; this._21 = _21; this._22 = _22; this._23 = _23;
        this._30 = _30; this._31 = _31; this._32 = _32; this._33 = _33;
    }
};


/**
 * Returns the first column vector of the matrix.
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e0 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._00, this._10, this._20);
    return baseVec.normalize();
};


/**
 * Returns the second column vector of the matrix.
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e1 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._01, this._11, this._21);
    return baseVec.normalize();
};


/**
 * Returns the third column vector of the matrix.
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e2 = function () {
    var baseVec = new x3dom.fields.SFVec3f(this._02, this._12, this._22);
    return baseVec.normalize();
};


/**
 * Returns the fourth column vector of the matrix.
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e3 = function () {
    return new x3dom.fields.SFVec3f(this._03, this._13, this._23);
};


/**
 * Sets the translation components of a homogenous transform matrix.
 * @param {x3dom.fields.SFVec3f} vec - the translation vector
 */
x3dom.fields.SFMatrix4f.prototype.setTranslate = function (vec) {
    this._03 = vec.x;
    this._13 = vec.y;
    this._23 = vec.z;
};


/**
 * Sets the scale components of a homogenous transform matrix.  
 * @param {x3dom.fields.SFVec3f} vec - vector containing scale factors along the three main axes
 */
x3dom.fields.SFMatrix4f.prototype.setScale = function (vec) {
    this._00 = vec.x;
    this._11 = vec.y;
    this._22 = vec.z;
};


/**
 * Sets the rotation components of a homogenous transform matrix.  
 * @param {x3dom.fields.Quaternion} quat - quaternion that describes the rotation
 */
x3dom.fields.SFMatrix4f.prototype.setRotate = function (quat) {
    var xx = quat.x * quat.x;
    var xy = quat.x * quat.y;
    var xz = quat.x * quat.z;
    var yy = quat.y * quat.y;
    var yz = quat.y * quat.z;
    var zz = quat.z * quat.z;
    var wx = quat.w * quat.x;
    var wy = quat.w * quat.y;
    var wz = quat.w * quat.z;

    this._00 = 1 - 2 * (yy + zz); this._01 = 2 * (xy - wz); this._02 = 2 * (xz + wy);
    this._10 = 2 * (xy + wz); this._11 = 1 - 2 * (xx + zz); this._12 = 2 * (yz - wx);
    this._20 = 2 * (xz - wy); this._21 = 2 * (yz + wx); this._22 = 1 - 2 * (xx + yy);
};


/**
 * Creates a new matrix from a column major string representation, with values separated by commas
 * @param {String} str - string to parse
 * @return {x3dom.fields.SFMatrix4f} the new matrix
 */
x3dom.fields.SFMatrix4f.parseRotation = function (str) {
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec(str);
    var x = +m[1], y = +m[2], z = +m[3], a = +m[4];
    
    var d = Math.sqrt(x*x + y*y + z*z);
    if (d === 0) {
        x = 1; y = z = 0;
    } else {
        x /= d; y /= d; z /= d;
    }
    
    var c = Math.cos(a);
    var s = Math.sin(a);
    var t = 1 - c;

    return new x3dom.fields.SFMatrix4f(
        t*x*x+c,   t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c,   t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c,   0,
        0,         0,         0,         1
    ).transpose();
};


/**
 * Creates a new matrix from a X3D-conformant string representation of rotation (using euler angles)
 * @param {String} str - string to parse
 * @return {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.parse = function (str) {
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    if (val.exec(str)) {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        if (!needTranspose) {
            return new x3dom.fields.SFMatrix4f(
                arr[0],  arr[1],  arr[2],  arr[3], 
                arr[4],  arr[5],  arr[6],  arr[7], 
                arr[8],  arr[9],  arr[10], arr[11], 
                arr[12], arr[13], arr[14], arr[15]
            );
        }
        else {
            return new x3dom.fields.SFMatrix4f(
                arr[0],  arr[4],  arr[8],  arr[12], 
                arr[1],  arr[5],  arr[9],  arr[13], 
                arr[2],  arr[6],  arr[10], arr[14], 
                arr[3],  arr[7],  arr[11], arr[15]
            );
        }
    }
    else if (arr.length === 6) {
        return new x3dom.fields.SFMatrix4f(
            arr[0],  arr[1],  0,  arr[4], 
            arr[2],  arr[3],  0,  arr[5], 
                 0,       0,  1,  0, 
                 0,       0,  0,  1
        );
    }
    else {
        x3dom.debug.logWarning("SFMatrix4f - can't parse string: " + str);
        return x3dom.fields.SFMatrix4f.identity();
    }
};


/**
 * Returns the result of multiplying this matrix with the given one, using "post-multiplication" / "right multiply".
 * @param {x3dom.fields.SFMatrix4f} m - matrix to multiply with this one
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.mult = function (m)  {
    return new x3dom.fields.SFMatrix4f(
        this._00*m._00+this._01*m._10+this._02*m._20+this._03*m._30, 
        this._00*m._01+this._01*m._11+this._02*m._21+this._03*m._31, 
        this._00*m._02+this._01*m._12+this._02*m._22+this._03*m._32, 
        this._00*m._03+this._01*m._13+this._02*m._23+this._03*m._33,
        this._10*m._00+this._11*m._10+this._12*m._20+this._13*m._30, 
        this._10*m._01+this._11*m._11+this._12*m._21+this._13*m._31, 
        this._10*m._02+this._11*m._12+this._12*m._22+this._13*m._32, 
        this._10*m._03+this._11*m._13+this._12*m._23+this._13*m._33,
        this._20*m._00+this._21*m._10+this._22*m._20+this._23*m._30, 
        this._20*m._01+this._21*m._11+this._22*m._21+this._23*m._31, 
        this._20*m._02+this._21*m._12+this._22*m._22+this._23*m._32, 
        this._20*m._03+this._21*m._13+this._22*m._23+this._23*m._33,
        this._30*m._00+this._31*m._10+this._32*m._20+this._33*m._30, 
        this._30*m._01+this._31*m._11+this._32*m._21+this._33*m._31, 
        this._30*m._02+this._31*m._12+this._32*m._22+this._33*m._32, 
        this._30*m._03+this._31*m._13+this._32*m._23+this._33*m._33
    );
};


/**
 * Transforms a given 3D point, using this matrix as a homogenous transform matrix.
 * @param {x3dom.fields.SFVec3f} vec - point to transform
 * @return {x3dom.fields.SFVec3f} resulting point
 */
x3dom.fields.SFMatrix4f.prototype.multMatrixPnt = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03,
        this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13,
        this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23
    );
};


/**
 * Transforms a given 3D vector, using this matrix as a homogenous transform matrix. 
 * @param {x3dom.fields.SFVec3f} vec - vector to transform
 * @return {x3dom.fields.SFVec3f} resulting vector
 */
x3dom.fields.SFMatrix4f.prototype.multMatrixVec = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z,
        this._10*vec.x + this._11*vec.y + this._12*vec.z,
        this._20*vec.x + this._21*vec.y + this._22*vec.z
    );
};


/**
 * Transforms a given 3D point, using this matrix as a transform matrix.
 * The resulting point is normalized by a w component.
 * @param {x3dom.fields.SFVec3f} vec - point to transform
 * @return {x3dom.fields.SFVec3f} resulting point
 */
 //TODO: understand better what this does and update documentation (or remove function, if not useful)
x3dom.fields.SFMatrix4f.prototype.multFullMatrixPnt = function (vec) {
    var w = this._30*vec.x + this._31*vec.y + this._32*vec.z + this._33;
    if (w) { w = 1.0 / w; }
    return new x3dom.fields.SFVec3f(
        (this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03) * w,
        (this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13) * w,
        (this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23) * w
    );
};


/**
 * Returns a transposed version of this matrix. 
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.transpose = function () {
    return new x3dom.fields.SFMatrix4f(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
};


/**
 * Returns a negated version of this matrix. 
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.negate = function () {
    return new x3dom.fields.SFMatrix4f(
        -this._00, -this._01, -this._02, -this._03,
        -this._10, -this._11, -this._12, -this._13,
        -this._20, -this._21, -this._22, -this._23,
        -this._30, -this._31, -this._32, -this._33
    );
};


/**
 * Returns a scaled version of this matrix. 
 * @param {Number} s - scale factor
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.multiply = function (s) {
    return new x3dom.fields.SFMatrix4f(
        s*this._00, s*this._01, s*this._02, s*this._03,
        s*this._10, s*this._11, s*this._12, s*this._13,
        s*this._20, s*this._21, s*this._22, s*this._23,
        s*this._30, s*this._31, s*this._32, s*this._33
    );
};


/**
 * Returns the result of adding the given matrix to this matrix. 
 * @param {x3dom.fields.SFMatrix4f} m - the other matrix
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.add = function (m) {
    return new x3dom.fields.SFMatrix4f(
        this._00+m._00, this._01+m._01, this._02+m._02, this._03+m._03,
        this._10+m._10, this._11+m._11, this._12+m._12, this._13+m._13,
        this._20+m._20, this._21+m._21, this._22+m._22, this._23+m._23,
        this._30+m._30, this._31+m._31, this._32+m._32, this._33+m._33
    );
};


/**
 * Returns the result of adding the given matrix to this matrix, using an additional scale factor for the argument matrix.
 * @param {x3dom.fields.SFMatrix4f} m - the other matrix
 * @param {Number} s - the scale factor
 * @return {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.addScaled = function (m, s) {
    return new x3dom.fields.SFMatrix4f(
        this._00+s*m._00, this._01+s*m._01, this._02+s*m._02, this._03+s*m._03,
        this._10+s*m._10, this._11+s*m._11, this._12+s*m._12, this._13+s*m._13,
        this._20+s*m._20, this._21+s*m._21, this._22+s*m._22, this._23+s*m._23,
        this._30+s*m._30, this._31+s*m._31, this._32+s*m._32, this._33+s*m._33
    );
};


/**
 * Fills the values of this matrix with the values of the another one.
 * @param {x3dom.fields.SFMatrix4f} m - the other matrix
 */
x3dom.fields.SFMatrix4f.prototype.setValues = function (m) {
    this._00 = m._00; this._01 = m._01; this._02 = m._02; this._03 = m._03;
    this._10 = m._10; this._11 = m._11; this._12 = m._12; this._13 = m._13;
    this._20 = m._20; this._21 = m._21; this._22 = m._22; this._23 = m._23;
    this._30 = m._30; this._31 = m._31; this._32 = m._32; this._33 = m._33;
};


/**
 * Fills the upper left 3x3 or 3x4 values of this matrix, using the given (three or four) column vectors. 
 * @param {x3dom.fields.SFVec3f} v1             - first column vector
 * @param {x3dom.fields.SFVec3f} v2             - second column vector
 * @param {x3dom.fields.SFVec3f} v3             - third column vector
 * @param {x3dom.fields.SFVec3f} [v4=undefined] - fourth column vector
 */
 //TODO: rename
x3dom.fields.SFMatrix4f.prototype.setValue = function (v1, v2, v3, v4) {
    this._00 = v1.x; this._01 = v2.x; this._02 = v3.x;
    this._10 = v1.y; this._11 = v2.y; this._12 = v3.y;
    this._20 = v1.z; this._21 = v2.z; this._22 = v3.z;
    this._30 = 0;    this._31 = 0;    this._32 = 0;
    
    if (arguments.length > 3) {
        this._03 = v4.x;
        this._13 = v4.y;
        this._23 = v4.z;
        this._33 = 1;
    }
};


/**
 * Fills the values of this matrix, using the given array.
 * @param {Number[]} a - array, the first 16 values will be used to initialize the matrix
 */
x3dom.fields.SFMatrix4f.prototype.setFromArray = function (a) {
    this._00 = a[0]; this._01 = a[4]; this._02 = a[ 8]; this._03 = a[12];
    this._10 = a[1]; this._11 = a[5]; this._12 = a[ 9]; this._13 = a[13];
    this._20 = a[2]; this._21 = a[6]; this._22 = a[10]; this._23 = a[14];
    this._30 = a[3]; this._31 = a[7]; this._32 = a[11]; this._33 = a[15];
};


/**
 * Returns a column major version of this matrix, packed into a single array.
 * @returns {Number[]} resulting array of 16 values
 */
x3dom.fields.SFMatrix4f.prototype.toGL = function () {
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
};


/**
 * Returns the value of this matrix at a given position.
 * @param {Number} i - row index (starting with 0)
 * @param {Number} j - column index (starting with 0)
 * @returns {Number} the value
 */
x3dom.fields.SFMatrix4f.prototype.at = function (i, j) {
	var field = "_" + i + j;
	return this[field];
};


/**
 * Computes the square root of the matrix, assuming that its determinant is greater than zero.
 * @return {SFMatrix4f} a matrix containing the result
 */
x3dom.fields.SFMatrix4f.prototype.sqrt = function () {
    var Y = x3dom.fields.SFMatrix4f.identity();
    var result = x3dom.fields.SFMatrix4f.copy(this);
    
    for (var i=0; i<6; i++)
    {
        var iX = result.inverse();
        var iY = (i == 0) ? x3dom.fields.SFMatrix4f.identity() : Y.inverse();
        
        var rd = result.det(), yd = Y.det();
        
        var g = Math.abs( Math.pow(rd * yd, -0.125) );
        var ig = 1.0 / g;
        
        result = result.multiply(g);
        result = result.addScaled(iY, ig);
        result = result.multiply(0.5);
        
        Y = Y.multiply(g);
        Y = Y.addScaled(iX, ig);
        Y = Y.multiply(0.5);
    }
    
    return result;
};


/**
 * Returns the largest absolute value of all entries in the matrix.
 * @returns {Number} the largest absolute value
 */
 //TODO: understand, possibly rename
x3dom.fields.SFMatrix4f.prototype.normInfinity = function () {
    var t = 0, m = 0;

    if ((t = Math.abs(this._00)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._01)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._02)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._03)) > m) {
        m = t;
    }
        
    if ((t = Math.abs(this._10)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._11)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._12)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._13)) > m) {
        m = t;
    }
    
    if ((t = Math.abs(this._20)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._21)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._22)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._23)) > m) {
        m = t;
    }
        
    if ((t = Math.abs(this._30)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._31)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._32)) > m) {
        m = t;
    }
    if ((t = Math.abs(this._33)) > m) {
        m = t;
    }

    return m;
};


/**
 * Returns the 1-norm of the upper left 3x3 part of this matrix.
 * The 1-norm is also known as maximum absolute column sum norm.
 * @returns {Number} the resulting number
 */
x3dom.fields.SFMatrix4f.prototype.norm1_3x3 = function() {
    var max = Math.abs(this._00) + 
              Math.abs(this._10) +
              Math.abs(this._20);
    var t = 0;
    
    if ((t = Math.abs(this._01) +
             Math.abs(this._11) +
             Math.abs(this._21)) > max) {
        max = t;
    }
    
    if ((t = Math.abs(this._02) +
             Math.abs(this._12) +
             Math.abs(this._22)) > max) {
        max = t;
    }
    
    return max;
};


/**
 * Returns the infinity-norm of the upper left 3x3 part of this matrix.
 * The infinity-norm is also known as maximum absolute row sum norm.
 * @returns {Number} the resulting number
 */
x3dom.fields.SFMatrix4f.prototype.normInf_3x3 = function() {
    var max = Math.abs(this._00) + 
              Math.abs(this._01) +
              Math.abs(this._02);
    var t = 0;
    
    if ((t = Math.abs(this._10) +
             Math.abs(this._11) +
             Math.abs(this._12)) > max) {
        max = t;
    }
    
    if ((t = Math.abs(this._20) +
             Math.abs(this._21) +
             Math.abs(this._22)) > max) {
        max = t;
    }
    
    return max;
};


/**
 * Computes the transposed adjoint of the upper left 3x3 part of this matrix,
 * and stores it in the upper left part of a new 4x4 identity matrix.
 * @returns {x3dom.fields.SFMatrix4f} the resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.adjointT_3x3 = function () {
	var result = x3dom.fields.SFMatrix4f.identity();
	
    result._00 = this._11 * this._22 - this._12 * this._21;
    result._01 = this._12 * this._20 - this._10 * this._22;
    result._02 = this._10 * this._21 - this._11 * this._20;
    
    result._10 = this._21 * this._02 - this._22 * this._01;
    result._11 = this._22 * this._00 - this._20 * this._02;
    result._12 = this._20 * this._01 - this._21 * this._00;
    
    result._20 = this._01 * this._12 - this._02 * this._11;
    result._21 = this._02 * this._10 - this._00 * this._12;
    result._22 = this._00 * this._11 - this._01 * this._10;
	
	return result;
};


/**
 * Checks whether this matrix equals another matrix.
 * @param {x3dom.fields.SFMatrix4f} m - the other matrix
 * @returns {Boolean}
 */
x3dom.fields.SFMatrix4f.prototype.equals = function (that) {    
    return Math.abs(this._00-that._00) < x3dom.fields.Eps && Math.abs(this._01-that._01) < x3dom.fields.Eps && 
           Math.abs(this._02-that._02) < x3dom.fields.Eps && Math.abs(this._03-that._03) < x3dom.fields.Eps &&
           Math.abs(this._10-that._10) < x3dom.fields.Eps && Math.abs(this._11-that._11) < x3dom.fields.Eps && 
           Math.abs(this._12-that._12) < x3dom.fields.Eps && Math.abs(this._13-that._13) < x3dom.fields.Eps &&
           Math.abs(this._20-that._20) < x3dom.fields.Eps && Math.abs(this._21-that._21) < x3dom.fields.Eps && 
           Math.abs(this._22-that._22) < x3dom.fields.Eps && Math.abs(this._23-that._23) < x3dom.fields.Eps &&
           Math.abs(this._30-that._30) < x3dom.fields.Eps && Math.abs(this._31-that._31) < x3dom.fields.Eps && 
           Math.abs(this._32-that._32) < x3dom.fields.Eps && Math.abs(this._33-that._33) < x3dom.fields.Eps;
};


/** 
 * Decomposes the matrix into a translation, rotation, scale,
 * and scale orientation. Any projection information is discarded.
 * The decomposition depends upon choice of center point for rotation and scaling,
 * which is optional as the last parameter.
 * @param {x3dom.fields.SFVec3f} translation         - 3D vector to be filled with the translation values
 * @param {x3dom.fields.Quaternion} rotation         - quaternion to be filled with the rotation values
 * @param {x3dom.fields.SFVec3f} scaleFactor         - 3D vector to be filled with the scale factors
 * @param {x3dom.fields.Quaternion} scaleOrientation - rotation (quaternion) to be applied before scaling
 * @param {x3dom.fields.Quaternion} scaleOrientation - rotation (quaternion) to be applied before scaling
 * @param {x3dom.fields.SFVec3f} [center=undefined]  - center point for rotation and scaling, if not origin
 */
//TODO: check if these are really the correct types...
x3dom.fields.SFMatrix4f.prototype.getTransform = function(
				        translation, rotation, scaleFactor, scaleOrientation, center) 
{
	var m = null;
	
	if (arguments.length > 4) {
		m = x3dom.fields.SFMatrix4f.translation(center.negate());
		m = m.mult(this);
		
		var c = x3dom.fields.SFMatrix4f.translation(center);
		m = m.mult(c);
	}
	else {
	    m = x3dom.fields.SFMatrix4f.copy(this);
	}
	
	var flip = m.decompose(translation, rotation, scaleFactor, scaleOrientation);
	
	scaleFactor.setValues(scaleFactor.multiply(flip));
};


//helper function
//TODO: make this an inner function of "getTransform?"
x3dom.fields.SFMatrix4f.prototype.decompose = function(t, r, s, so) 
{
	var A = x3dom.fields.SFMatrix4f.copy(this);
	
    var Q  = x3dom.fields.SFMatrix4f.identity(),
		S  = x3dom.fields.SFMatrix4f.identity(),
		SO = x3dom.fields.SFMatrix4f.identity();
	
	t.x = A._03;
    t.y = A._13;
    t.z = A._23;
    
    A._03 = 0.0;
    A._13 = 0.0;
    A._23 = 0.0;
    
    A._30 = 0.0;
    A._31 = 0.0;
    A._32 = 0.0;
	
	var det = A.polarDecompose(Q, S);
    var f = 1.0;

    if (det < 0.0) {
        Q = Q.negate();
        f = -1.0;
    }
    
    r.setValue(Q);
    
    S.spectralDecompose(SO, s);
    
    so.setValue(SO);
	
	return f;
};


/**
 * Performs a polar decomposition of this matrix A into two matrices Q and S, so that A = QS
 * @param {x3dom.fields.SFMatrix4f} Q - first resulting matrix
 * @param {x3dom.fields.SFMatrix4f} S - first resulting matrix
 * @returns {Number} determinant of the transposed adjoint upper 3x3 matrix
 */
 //TODO: revise (parameter namings etc.), document
x3dom.fields.SFMatrix4f.prototype.polarDecompose = function(Q, S)
{
    var Mk = this.transpose();
    var Ek = x3dom.fields.SFMatrix4f.identity();
	
    var Mk_one = Mk.norm1_3x3();
    var Mk_inf = Mk.normInf_3x3();
    
	var MkAdjT;
    var MkAdjT_one, MkAdjT_inf;
    var Ek_one, Mk_det;
       
    do
    {
        // compute transpose of adjoint
		MkAdjT = Mk.adjointT_3x3();
        
        // Mk_det = det(Mk) -- computed from the adjoint        
        Mk_det = Mk._00 * MkAdjT._00 + 
                 Mk._01 * MkAdjT._01 +
                 Mk._02 * MkAdjT._02;
        
        //TODO: should this be a close to zero test ?
        if (Mk_det == 0.0)
        {
            x3dom.debug.logWarning("polarDecompose: Mk_det == 0.0");
            break;
        }
        
        MkAdjT_one = MkAdjT.norm1_3x3();
        MkAdjT_inf = MkAdjT.normInf_3x3();
        
        // compute update factors
        var gamma = Math.sqrt( Math.sqrt((MkAdjT_one * MkAdjT_inf) / 
							  (Mk_one * Mk_inf)) / Math.abs(Mk_det) );
        
        var g1 = 0.5 * gamma;
        var g2 = 0.5 / (gamma * Mk_det);
        
        Ek.setValues(Mk);
        
        Mk = Mk.multiply (g1);         // this does:
        Mk = Mk.addScaled(MkAdjT, g2); // Mk = g1 * Mk + g2 * MkAdjT
        Ek = Ek.addScaled(Mk, -1.0);   // Ek -= Mk;
        
        Ek_one = Ek.norm1_3x3();
        Mk_one = Mk.norm1_3x3();
        Mk_inf = Mk.normInf_3x3();
        
    } while (Ek_one > (Mk_one * x3dom.fields.Eps));
    
    Q.setValues(Mk.transpose());
    S.setValues(Mk.mult(this));

    for (var i = 0; i < 3; ++i)
    {
        for (var j = i; j < 3; ++j)
        {
            S['_'+j+i] = 0.5 * (S['_'+j+i] + S['_'+i+j]);
			S['_'+i+j] = 0.5 * (S['_'+j+i] + S['_'+i+j]);
        }
    }
    
    return Mk_det;
};


/**
 * Performs a spectral decomposition of this matrix.
 * @param {x3dom.fields.SFMatrix4f} SO - resulting matrix
 * @param {x3dom.fields.SFVec3f} k - resulting vector
 */
 //TODO: revise (parameter namings etc.), document
x3dom.fields.SFMatrix4f.prototype.spectralDecompose = function(SO, k)
{
    var next = [1, 2, 0];
    var maxIterations = 20;
    var diag = [this._00, this._11, this._22];
    var offDiag = [this._12, this._20, this._01];
    
    for (var iter = 0; iter < maxIterations; ++iter)
    {
        var sm = Math.abs(offDiag[0]) + Math.abs(offDiag[1]) + Math.abs(offDiag[2]);
        
        if (sm == 0) {        
            break;
        }
        
        for (var i = 2; i >= 0; --i)
        {
            var p = next[i];
            var q = next[p];
            
            var absOffDiag = Math.abs(offDiag[i]);
            var g          = 100.0 * absOffDiag; 
            
            if (absOffDiag > 0.0)
            {
                var t = 0, h = diag[q] - diag[p];
                var absh = Math.abs(h);
                
                if (absh + g == absh)
                {
                    t = offDiag[i] / h;
                }
                else
                {
                    var theta = 0.5 * h / offDiag[i];
                    t = 1.0 / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0));
                    
                    t = theta < 0.0 ? -t : t;
                }
            
                var c = 1.0 / Math.sqrt(t * t + 1.0);
                var s = t * c;
                
                var tau = s / (c + 1.0);
                var ta  = t * offDiag[i];
                
                offDiag[i] = 0.0;
                
                diag[p] -= ta;
                diag[q] += ta;
                
                var offDiagq = offDiag[q];
                
                offDiag[q] -= s * (offDiag[p] + tau * offDiagq);
                offDiag[p] += s * (offDiagq - tau * offDiag[p]);
                
                for (var j = 2; j >= 0; --j)
                {
                    var a = SO['_'+j+p];
                    var b = SO['_'+j+q];
                    
                    SO['_'+j+p] -= s * (b + tau * a);
                    SO['_'+j+q] += s * (a - tau * b);
                }
            }
        }
    }
    
    k.x = diag[0];
    k.y = diag[1];
    k.z = diag[2];
};


/**
 * Computes the logarithm of this matrix, assuming that its determinant is greater than zero.
 * @returns {Number}
 */
x3dom.fields.SFMatrix4f.prototype.log = function () {
    var maxiter = 12;
    
    var A = x3dom.fields.SFMatrix4f.copy(this),
        Z = x3dom.fields.SFMatrix4f.copy(this);

    // Take repeated square roots to reduce spectral radius
    Z._00 -= 1;
    Z._11 -= 1;
    Z._22 -= 1;
    Z._33 -= 1;
    
    var k = 0;

    while (Z.normInfinity() > 0.5)
    {
        A = A.sqrt();
        Z.setValues(A);

        Z._00 -= 1;
        Z._11 -= 1;
        Z._22 -= 1;
        Z._33 -= 1;

        k++;
    }

    A._00 -= 1;
    A._11 -= 1;
    A._22 -= 1;
    A._33 -= 1;

    A = A.negate();
    Z.setValues(A);
    
    var result = x3dom.fields.SFMatrix4f.copy(A);
    var i = 1;

    while (Z.normInfinity() > x3dom.fields.Eps && i < maxiter)
    {
        Z = Z.mult(A);
        i++;

        result = result.addScaled(Z, 1.0 / i);
    }
    
    return result.multiply( -(1 << k) );
};


/**
 * Computes the exponential of this matrix.
 * @returns {Number}
 */
x3dom.fields.SFMatrix4f.prototype.exp = function () {
    var q = 6;
    var A = x3dom.fields.SFMatrix4f.copy(this), 
        D = x3dom.fields.SFMatrix4f.identity(), 
        N = x3dom.fields.SFMatrix4f.identity(), 
        result = x3dom.fields.SFMatrix4f.identity();
    var k = 0, c = 1.0;

    var j = 1.0 + parseInt(Math.log(A.normInfinity() / 0.693));
    //var j = 1.0 + (Math.log(A.normInfinity() / 0.693) | 0);
    
    if (j < 0) {
        j = 0;
    }

    A = A.multiply(1.0 / (1 << j));

    for (k = 1; k <= q; k++)
    {
        c *= (q - k + 1) / (k * (2 * q - k + 1));

        result = A.mult(result);

        N = N.addScaled(result, c);

        if (k % 2) {
            D = D.addScaled(result, -c);
        }
        else {
            D = D.addScaled(result, c);
        }
    }
    
    result = D.inverse().mult(N);

    for (k = 0; k < j; k++)
    {
        result = result.mult(result);
    }
    
    return result;
};


/**
 * Computes a determinant for a 3x3 matrix m, given as values in row major order.
 * @param {Number} a1 - value of m at (0,0)
 * @param {Number} a2 - value of m at (0,1)
 * @param {Number} a3 - value of m at (0,2)
 * @param {Number} b1 - value of m at (1,0)
 * @param {Number} b2 - value of m at (1,1)
 * @param {Number} b3 - value of m at (1,2)
 * @param {Number} c1 - value of m at (2,0)
 * @param {Number} c2 - value of m at (2,1)
 * @param {Number} c3 - value of m at (2,2)
 * @returns {Number}
 */
//TODO: move this helper function into "det"?
x3dom.fields.SFMatrix4f.prototype.det3 = function (a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    return ((a1 * b2 * c3) + (a2 * b3 * c1) + (a3 * b1 * c2) -
            (a1 * b3 * c2) - (a2 * b1 * c3) - (a3 * b2 * c1));
};


/**
 * Computes the determinant of this matrix.
 * @returns {Number}
 */
x3dom.fields.SFMatrix4f.prototype.det = function () {
    var a1 = this._00;
    var b1 = this._10;
    var c1 = this._20;
    var d1 = this._30;

    var a2 = this._01;
    var b2 = this._11;
    var c2 = this._21;
    var d2 = this._31;

    var a3 = this._02;
    var b3 = this._12;
    var c3 = this._22;
    var d3 = this._32;

    var a4 = this._03;
    var b4 = this._13;
    var c4 = this._23;
    var d4 = this._33;
    
    return (a1 * this.det3(b2, b3, b4, c2, c3, c4, d2, d3, d4) - 
            b1 * this.det3(a2, a3, a4, c2, c3, c4, d2, d3, d4) + 
            c1 * this.det3(a2, a3, a4, b2, b3, b4, d2, d3, d4) - 
            d1 * this.det3(a2, a3, a4, b2, b3, b4, c2, c3, c4));
};


/**
 * Computes the inverse of this matrix, given that it is not singular.
 * @returns {x3dom.fields.SFMatrix4f}
 */
x3dom.fields.SFMatrix4f.prototype.inverse = function () {
    var a1 = this._00;
    var b1 = this._10;
    var c1 = this._20;
    var d1 = this._30;

    var a2 = this._01;
    var b2 = this._11;
    var c2 = this._21;
    var d2 = this._31;

    var a3 = this._02;
    var b3 = this._12;
    var c3 = this._22;
    var d3 = this._32;

    var a4 = this._03;
    var b4 = this._13;
    var c4 = this._23;
    var d4 = this._33;

    var rDet = this.det();

    //if (Math.abs(rDet) < 1e-30)
    if (rDet == 0)
    {
        x3dom.debug.logWarning("Invert matrix: singular matrix, no inverse!");
        return x3dom.fields.SFMatrix4f.identity();
    }

    rDet = 1.0 / rDet;

    return new x3dom.fields.SFMatrix4f(
                +this.det3(b2, b3, b4, c2, c3, c4, d2, d3, d4) * rDet,
                -this.det3(a2, a3, a4, c2, c3, c4, d2, d3, d4) * rDet,
                +this.det3(a2, a3, a4, b2, b3, b4, d2, d3, d4) * rDet,
                -this.det3(a2, a3, a4, b2, b3, b4, c2, c3, c4) * rDet,
                -this.det3(b1, b3, b4, c1, c3, c4, d1, d3, d4) * rDet,
                +this.det3(a1, a3, a4, c1, c3, c4, d1, d3, d4) * rDet,
                -this.det3(a1, a3, a4, b1, b3, b4, d1, d3, d4) * rDet,
                +this.det3(a1, a3, a4, b1, b3, b4, c1, c3, c4) * rDet,
                +this.det3(b1, b2, b4, c1, c2, c4, d1, d2, d4) * rDet,
                -this.det3(a1, a2, a4, c1, c2, c4, d1, d2, d4) * rDet,
                +this.det3(a1, a2, a4, b1, b2, b4, d1, d2, d4) * rDet,
                -this.det3(a1, a2, a4, b1, b2, b4, c1, c2, c4) * rDet,
                -this.det3(b1, b2, b3, c1, c2, c3, d1, d2, d3) * rDet,
                +this.det3(a1, a2, a3, c1, c2, c3, d1, d2, d3) * rDet,
                -this.det3(a1, a2, a3, b1, b2, b3, d1, d2, d3) * rDet,
                +this.det3(a1, a2, a3, b1, b2, b3, c1, c2, c3) * rDet
            );
};


/**
 * Returns an array of 2*3 = 6 euler angles (in radians), assuming that this is a rotation matrix.
 * The first three and the second three values are alternatives for the three euler angles,
 * where each of the two cases leads to the same resulting rotation.
 * @returns {Number[]}
 */
x3dom.fields.SFMatrix4f.prototype.getEulerAngles = function() {
    var theta_1, theta_2, theta;
    var phi_1, phi_2, phi;
    var psi_1, psi_2, psi;
    var cos_theta_1, cos_theta_2;

    if (Math.abs(this._20) != 1.0) {
        theta_1 = -Math.asin(this._20);
        theta_2 = Math.PI - theta_1;

        cos_theta_1 = Math.cos(theta_1);
        cos_theta_2 = Math.cos(theta_2);

        psi_1   = Math.atan2(this._21 / cos_theta_1, this._22 / cos_theta_1);
        psi_2   = Math.atan2(this._21 / cos_theta_2, this._22 / cos_theta_2);

        phi_1   = Math.atan2(this._10 / cos_theta_1, this._00 / cos_theta_1);
        phi_2   = Math.atan2(this._10 / cos_theta_2, this._00 / cos_theta_2);

        return [psi_1, theta_1, phi_1,
                psi_2, theta_2, phi_2];
    }
    else {
        phi = 0;

        if (this._20 == -1.0) {
            theta = Math.PI / 2.0;
            psi   = phi + Math.atan2(this._01, this._02);
        }
        else {
            theta = -(Math.PI / 2.0);
            psi   = -phi + Math.atan2(-this._01, -this._02);
        }

        return [psi, theta, phi,
                psi, theta, phi];
    }
};


/**
 * Converts this matrix to a string representation, where all entries are separated by commas,
 * and where rows are additionally separated by linebreaks.
 * @returns {String}
 */
x3dom.fields.SFMatrix4f.prototype.toString = function () {
    return this._00.toFixed(6) + ', ' + this._01.toFixed(6)+', '+
		   this._02.toFixed(6) + ', ' + this._03.toFixed(6)+', \n'+
           this._10.toFixed(6) + ', ' + this._11.toFixed(6)+', '+
		   this._12.toFixed(6) + ', ' + this._13.toFixed(6)+', \n'+
           this._20.toFixed(6) + ', ' + this._21.toFixed(6)+', '+
		   this._22.toFixed(6) + ', ' + this._23.toFixed(6)+', \n'+
           this._30.toFixed(6) + ', ' + this._31.toFixed(6)+', '+
		   this._32.toFixed(6) + ', ' + this._33.toFixed(6);
};


/**
 * Fills the values of this matrix from a string, where the entries are separated
 * by commas and given in column-major order.
 * @param {String} str - the string representation
 */
 //TODO: where does this "matrix" prefix (or whatever= come from?
 //      it seems to have an influence whether the result should be transposed
x3dom.fields.SFMatrix4f.prototype.setValueByStr = function(str) {
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    if (val.exec(str)) {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        if (!needTranspose) {
            this._00 = arr[0];  this._01 = arr[1];  this._02 = arr[2];  this._03 = arr[3];
            this._10 = arr[4];  this._11 = arr[5];  this._12 = arr[6];  this._13 = arr[7];
            this._20 = arr[8];  this._21 = arr[9];  this._22 = arr[10]; this._23 = arr[11];
            this._30 = arr[12]; this._31 = arr[13]; this._32 = arr[14]; this._33 = arr[15];
        }
        else {
            this._00 = arr[0];  this._01 = arr[4];  this._02 = arr[8];  this._03 = arr[12];
            this._10 = arr[1];  this._11 = arr[5];  this._12 = arr[9];  this._13 = arr[13];
            this._20 = arr[2];  this._21 = arr[6];  this._22 = arr[10]; this._23 = arr[14];
            this._30 = arr[3];  this._31 = arr[7];  this._32 = arr[11]; this._33 = arr[15];
        }
    }
    else if (arr.length === 6) {
        this._00 = arr[0]; this._01 = arr[1]; this._02 = 0; this._03 = arr[4];
        this._10 = arr[2]; this._11 = arr[3]; this._12 = 0; this._13 = arr[5];
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else {
        x3dom.debug.logWarning("SFMatrix4f - can't parse string: " + str);
    }
    return this;
};



//------------------------------------------------------------------------------------------------------------------
// STATIC MEMBERS
//------------------------------------------------------------------------------------------------------------------

/**
 * Returns a copy of the argument matrix.
 * @param {x3dom.fields.SFMatrix4f} m - the matrix to copy
 * @returns {x3dom.fields.SFMatrix4f} the copy
 */
x3dom.fields.SFMatrix4f.copy = function(m) {
    return new x3dom.fields.SFMatrix4f(
        m._00, m._01, m._02, m._03,
        m._10, m._11, m._12, m._13,
        m._20, m._21, m._22, m._23,
        m._30, m._31, m._32, m._33
    );
};


/**
 * Returns a SFMatrix4f identity matrix.
 * @returns {x3dom.fields.SFMatrix4f} the new identity matrix
 */
x3dom.fields.SFMatrix4f.identity = function () {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};


/**
 * Returns a new null matrix.
 * @returns {x3dom.fields.SFMatrix4f} the new null matrix
 */
x3dom.fields.SFMatrix4f.zeroMatrix = function () {
    return new x3dom.fields.SFMatrix4f(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    );
};


/**
 * Returns a new translation matrix.
 * @param {x3dom.fields.SFVec3f} vec - vector that describes the desired translation
 * @returns {x3dom.fields.SFMatrix4f} the new identity matrix
 */
x3dom.fields.SFMatrix4f.translation = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
};


/**
 * Returns a new rotation matrix , rotating around the x axis.
 * @param {x3dom.fields.SFVec3f} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationX = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
};


/**
 * Returns a new rotation matrix , rotating around the y axis.
 * @param {x3dom.fields.SFVec3f} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationY = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
};


/**
 * Returns a new rotation matrix , rotating around the z axis.
 * @param {x3dom.fields.SFVec3f} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationZ = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};


/**
 * Returns a new scale matrix.
 * @param {x3dom.fields.SFVec3f} vec - vector containing scale factors along the three main axes
 * @returns {x3dom.fields.SFMatrix4f} the new scale matrix
 */
x3dom.fields.SFMatrix4f.scale = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
};


/**
 * Returns a new view matrix, using the given "look at" parameters.
 * @param {x3dom.fields.SFVec3f} from - eye point
 * @param {x3dom.fields.SFVec3f} from - focus ("look at") point
 * @param {x3dom.fields.SFVec3f} from - up vector
 * @returns {x3dom.fields.SFMatrix4f} the new view matrix
 */
x3dom.fields.SFMatrix4f.lookAt = function (from, at, up)
{
    var view = from.subtract(at).normalize();
    var right = up.normalize().cross(view);

    // check if zero vector, i.e. linearly dependent
    if (right.dot(right) < x3dom.fields.Eps) {
        x3dom.debug.logWarning("View matrix is linearly dependent.");
        return x3dom.fields.SFMatrix4f.translation(from);
    }

    var newUp = view.cross(right.normalize()).normalize();

    var tmp = x3dom.fields.SFMatrix4f.identity();
    tmp.setValue(right, newUp, view, from);

    return tmp;
};


/**
 * Returns a new perspective projection matrix.
 * @param {Number} fov    - field-of-view angle in radians
 * @param {Number} aspect - aspect ratio (width / height)
 * @param {Number} near   - near clipping distance
 * @param {Number} far    - far clipping distance
 * @returns {x3dom.fields.SFMatrix4f} the new projection matrix
 */
x3dom.fields.SFMatrix4f.perspective = function(fov, aspect, near, far)
{
    var f = 1 / Math.tan(fov / 2);

    return new x3dom.fields.SFMatrix4f(
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near+far)/(near-far), 2*near*far/(near-far),
        0, 0, -1, 0
    );
};


/**
 * Returns a new orthogonal projection matrix.
 * @param {Number} left         - left border value of the view area
 * @param {Number} right        - right border value of the view area
 * @param {Number} bottom       - bottom border value of the view area
 * @param {Number} top          - top border value of the view area
 * @param {Number} near         - near clipping distance
 * @param {Number} far          - far clipping distance
 * @param {Number} [aspect=1.0] - desired aspect ratio (width / height) of the projected image
 * @returns {x3dom.fields.SFMatrix4f} the new projection matrix
 */
x3dom.fields.SFMatrix4f.ortho = function(left, right, bottom, top, near, far, aspect)
{
    var rl = (right - left) / 2;    // hs
    var tb = (top - bottom) / 2;    // vs
    var fn = far - near;

    if (aspect === undefined)
        aspect = 1.0;

    if (aspect < (rl / tb))
        tb = rl / aspect;
    else
        rl = tb * aspect;

    //TODO: doesn't this make the whole "left/right thing" senseless?
    //      if we interpret it this way, why not directly specify a range?
    left = -rl;
    right = rl;
    bottom = -tb;
    top = tb;

    rl *= 2;
    tb *= 2;

    return new x3dom.fields.SFMatrix4f(
        2 / rl, 0, 0,  -(right+left) / rl,
        0, 2 / tb, 0,  -(top+bottom) / tb,
        0, 0, -2 / fn, -(far+near) / fn,
        0, 0, 0, 1
    );
};
