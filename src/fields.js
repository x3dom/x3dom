/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
* 
*/

/** @namespace The x3dom.fields namespace. */
x3dom.fields = {};

/** SFMatrix4f constructor. 
    @class Represents a SFMatrix4f
    //TODO; use 2-dim array instead of _xx
  */
x3dom.fields.SFMatrix4f = function(_00, _01, _02, _03, _10, _11, _12, _13, _20, _21, _22, _23, _30, _31, _32, _33) {
    if (arguments.length == 0) {
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
}

/** returns 1st base vector (right) */
x3dom.fields.SFMatrix4f.prototype.e0 = function () {
	var baseVec = new x3dom.fields.SFVec3f(this._00, this._10, this._20);
	return baseVec.normalize();
}

/** returns 2nd base vector (up) */
x3dom.fields.SFMatrix4f.prototype.e1 = function () {
	var baseVec = new x3dom.fields.SFVec3f(this._01, this._11, this._21);
	return baseVec.normalize();
}

/** returns 3rd base vector (fwd) */
x3dom.fields.SFMatrix4f.prototype.e2 = function () {
	var baseVec = new x3dom.fields.SFVec3f(this._02, this._12, this._22);
	return baseVec.normalize();
}

/** returns 4th base vector (pos) */
x3dom.fields.SFMatrix4f.prototype.e3 = function () {
	return new x3dom.fields.SFVec3f(this._03, this._13, this._23);
}

/** Returns a SFMatrix4f identity matrix. */
x3dom.fields.SFMatrix4f.identity = function () {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.translation = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.rotationX = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.rotationY = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.rotationZ = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4f(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.scale = function (vec) {
    return new x3dom.fields.SFMatrix4f(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4f.prototype.setTranslate = function (vec) {
	this._03 = vec.x;
	this._13 = vec.y;
	this._23 = vec.z;
}

x3dom.fields.SFMatrix4f.prototype.setScale = function (vec) {
	this._00 = vec.x;
	this._11 = vec.y;
	this._22 = vec.z;
}

x3dom.fields.SFMatrix4f.parseRotation = function (str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    var x = +m[1], y = +m[2], z = +m[3], a = +m[4];
    var d = Math.sqrt(x*x + y*y + z*z);
    if (d == 0) {
        x = 1; y = z = 0;
    } else {
        x /= d; y /= d; z /= d;
    }
    var c = Math.cos(a);
    var s = Math.sin(a);
    var t  = 1-c;

    return new x3dom.fields.SFMatrix4f(
        t*x*x+c,   t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c,   t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c,   0,
        0,         0,         0,         1
    ).transpose();
}

x3dom.fields.SFMatrix4f.parse = function (str) {
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        return new x3dom.fields.SFMatrix4f(
                arr[0],  arr[1],  arr[2],  arr[3], 
                arr[4],  arr[5],  arr[6],  arr[7], 
                arr[8],  arr[9],  arr[10], arr[11], 
                arr[12], arr[13], arr[14], arr[15]
        );
    }
    else {
        x3dom.debug.logInfo("SFMatrix4f - can't parse string: " + str);
        return x3dom.fields.SFMatrix4f.identity();
    }
}

x3dom.fields.SFMatrix4f.prototype.mult = function (that)  {
    return new x3dom.fields.SFMatrix4f(
        this._00*that._00+this._01*that._10+this._02*that._20+this._03*that._30, 
        this._00*that._01+this._01*that._11+this._02*that._21+this._03*that._31, 
        this._00*that._02+this._01*that._12+this._02*that._22+this._03*that._32, 
        this._00*that._03+this._01*that._13+this._02*that._23+this._03*that._33,
        this._10*that._00+this._11*that._10+this._12*that._20+this._13*that._30, 
        this._10*that._01+this._11*that._11+this._12*that._21+this._13*that._31, 
        this._10*that._02+this._11*that._12+this._12*that._22+this._13*that._32, 
        this._10*that._03+this._11*that._13+this._12*that._23+this._13*that._33,
        this._20*that._00+this._21*that._10+this._22*that._20+this._23*that._30, 
        this._20*that._01+this._21*that._11+this._22*that._21+this._23*that._31, 
        this._20*that._02+this._21*that._12+this._22*that._22+this._23*that._32, 
        this._20*that._03+this._21*that._13+this._22*that._23+this._23*that._33,
        this._30*that._00+this._31*that._10+this._32*that._20+this._33*that._30, 
        this._30*that._01+this._31*that._11+this._32*that._21+this._33*that._31, 
        this._30*that._02+this._31*that._12+this._32*that._22+this._33*that._32, 
        this._30*that._03+this._31*that._13+this._32*that._23+this._33*that._33
    );
}

x3dom.fields.SFMatrix4f.prototype.multMatrixPnt = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03,
        this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13,
        this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23
    );
}

x3dom.fields.SFMatrix4f.prototype.multMatrixVec = function (vec) {
    return new x3dom.fields.SFVec3f(
        this._00*vec.x + this._01*vec.y + this._02*vec.z,
        this._10*vec.x + this._11*vec.y + this._12*vec.z,
        this._20*vec.x + this._21*vec.y + this._22*vec.z
    );
}

x3dom.fields.SFMatrix4f.prototype.multFullMatrixPnt = function (vec) {
    var w = this._30*vec.x + this._31*vec.y + this._32*vec.z + this._33;
    if (w) w = 1.0 / w;
    return new x3dom.fields.SFVec3f(
        (this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03) * w,
        (this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13) * w,
        (this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23) * w
    );
}

x3dom.fields.SFMatrix4f.prototype.transpose = function () {
    return new x3dom.fields.SFMatrix4f(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
}

x3dom.fields.SFMatrix4f.prototype.toGL = function () {
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
}

x3dom.fields.SFMatrix4f.prototype.decompose = function () {
    // Return [ T, S, x, y, z ] such that
    //   rotateX(x); rotateY(t); rotateZ(z); scale(S); translate(T);
    // does the equivalent transformation

    var T = new x3dom.fields.SFVec3f(this._03, this._13, this._23);
    var S = new x3dom.fields.SFVec3f(1, 1, 1); // XXX

    // http://www.j3d.org/matrix_faq/matrfaq_latest.html
    var angle_x, angle_y, angle_z, tr_x, tr_y, C;
    angle_y = Math.asin(this._02);
    C = Math.cos(angle_y);
    if (Math.abs(C) > 0.005) {
      tr_x = this._22 / C;
      tr_y = -this._12 / C;
      angle_x = Math.atan2(tr_y, tr_x);
      tr_x =  this._00 / C;
      tr_y = -this._01 / C;
      angle_z = Math.atan2(tr_y, tr_x);
    } else {
      angle_x = 0;
      tr_x = this._11;
      tr_y = this._10;
      angle_z = Math.atan2(tr_y, tr_x);
    }

    return [ T, S, angle_x, angle_y, angle_z ];
}

x3dom.fields.SFMatrix4f.prototype.det3 = function (
				a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    var d = (a1 * b2 * c3) + (a2 * b3 * c1) + (a3 * b1 * c2) -
			(a1 * b3 * c2) - (a2 * b1 * c3) - (a3 * b2 * c1);
	return d;
}

x3dom.fields.SFMatrix4f.prototype.det = function () {
    var a1, a2, a3, a4,
        b1, b2, b3, b4,
        c1, c2, c3, c4,
        d1, d2, d3, d4;

    a1 = this._00;
    b1 = this._10;
    c1 = this._20;
    d1 = this._30;

    a2 = this._01;
    b2 = this._11;
    c2 = this._21;
    d2 = this._31;

    a3 = this._02;
    b3 = this._12;
    c3 = this._22;
    d3 = this._32;

    a4 = this._03;
    b4 = this._13;
    c4 = this._23;
    d4 = this._33;
	
    var d = + a1 * this.det3(b2, b3, b4, c2, c3, c4, d2, d3, d4)
            - b1 * this.det3(a2, a3, a4, c2, c3, c4, d2, d3, d4)
            + c1 * this.det3(a2, a3, a4, b2, b3, b4, d2, d3, d4)
            - d1 * this.det3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
	return d;
}

x3dom.fields.SFMatrix4f.prototype.inverse = function () {
    var a1, a2, a3, a4,
        b1, b2, b3, b4,
        c1, c2, c3, c4,
        d1, d2, d3, d4;

    a1 = this._00;
    b1 = this._10;
    c1 = this._20;
    d1 = this._30;

    a2 = this._01;
    b2 = this._11;
    c2 = this._21;
    d2 = this._31;

    a3 = this._02;
    b3 = this._12;
    c3 = this._22;
    d3 = this._32;

    a4 = this._03;
    b4 = this._13;
    c4 = this._23;
    d4 = this._33;

    var rDet = this.det();

    if (Math.abs(rDet) < 0.000001)
    {
        x3dom.debug.logInfo("Invert matrix: singular matrix, no inverse!");
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
}

x3dom.fields.SFMatrix4f.prototype.toString = function () {
    return '[SFMatrix4f ' +
        this._00+', '+this._01+', '+this._02+', '+this._03+'; '+
        this._10+', '+this._11+', '+this._12+', '+this._13+'; '+
        this._20+', '+this._21+', '+this._22+', '+this._23+'; '+
        this._30+', '+this._31+', '+this._32+', '+this._33+']';
}

x3dom.fields.SFMatrix4f.prototype.setValueByStr = function(str) {
    var arr = Array.map(str.split(/[,\s]+/), function (n) { return +n; });
    if (arr.length >= 16)
    {
        this._00 = arr[0]; this._01 = arr[1]; this._02 = arr[2]; this._03 = arr[3];
        this._10 = arr[4]; this._11 = arr[5]; this._12 = arr[6]; this._13 = arr[7];
        this._20 = arr[8]; this._21 = arr[9]; this._22 = arr[10]; this._23 = arr[11];
        this._30 = arr[12]; this._31 = arr[13]; this._32 = arr[14]; this._33 = arr[15];
    }
    else {
        x3dom.debug.logInfo("SFMatrix4f - can't parse string: " + str);
    }
    return this;
}


/** SFVec2f constructor.
    @class Represents a SFVec2f
  */
x3dom.fields.SFVec2f = function(x, y) {
    if (arguments.length == 0) {
        this.x = this.y = 0;
    }
    else {
        this.x = x;
        this.y = y;
    }
}

x3dom.fields.SFVec2f.parse = function (str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    return new x3dom.fields.SFVec2f(+m[1], +m[2]);
}

x3dom.fields.SFVec2f.prototype.add = function (that) {
    return new x3dom.fields.SFVec2f(this.x+that.x, this.y+that.y);
}

x3dom.fields.SFVec2f.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec2f(this.x-that.x, this.y-that.y);
}

x3dom.fields.SFVec2f.prototype.negate = function () {
    return new x3dom.fields.SFVec2f(-this.x, -this.y);
}

x3dom.fields.SFVec2f.prototype.dot = function (that) {
    return this.x * that.x + this.y * that.y;
}

x3dom.fields.SFVec2f.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec2f(this.x-d2*n.x, this.y-d2*n.y);
}

x3dom.fields.SFVec2f.prototype.normalize = function (that) {
    var n = this.length();
    if (n) n = 1.0 / n;
    return new x3dom.fields.SFVec2f(this.x*n, this.y*n);
}

x3dom.fields.SFVec2f.prototype.multiply = function (n) {
    return new x3dom.fields.SFVec2f(this.x*n, this.y*n);
}

x3dom.fields.SFVec2f.prototype.divide = function (n) {
    var denom = n ? (1.0 / n) : 1.0;
    return new x3dom.fields.SFVec2f(this.x*denom, this.y*denom);
}

x3dom.fields.SFVec2f.prototype.length = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y));
}

x3dom.fields.SFVec2f.prototype.toGL = function () {
    return [ this.x, this.y ];
}

x3dom.fields.SFVec2f.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " }";
}

x3dom.fields.SFVec2f.prototype.setValueByStr = function(str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    this.x = +m[1];
    this.y = +m[2];
    return this;
}


/** SFVec3f constructor.
    @class Represents a SFVec3f
  */
x3dom.fields.SFVec3f = function(x, y, z) {
    if (arguments.length == 0) {
        this.x = this.y = this.z = 0;
    }
    else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

x3dom.fields.SFVec3f.parse = function (str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    return new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]);
}

x3dom.fields.SFVec3f.prototype.add = function (that) {
    return new x3dom.fields.SFVec3f(this.x + that.x, this.y + that.y, this.z + that.z);
}

x3dom.fields.SFVec3f.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec3f(this.x - that.x, this.y - that.y, this.z - that.z);
}

x3dom.fields.SFVec3f.prototype.negate = function () {
    return new x3dom.fields.SFVec3f(-this.x, -this.y, -this.z);
}

x3dom.fields.SFVec3f.prototype.dot = function (that) {
    return (this.x*that.x + this.y*that.y + this.z*that.z);
}

x3dom.fields.SFVec3f.prototype.cross = function (that) {
    return new x3dom.fields.SFVec3f( this.y*that.z - this.z*that.y, 
                                    this.z*that.x - this.x*that.z, 
                                    this.x*that.y - this.y*that.x );
}

x3dom.fields.SFVec3f.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec3f(this.x - d2*n.x, this.y - d2*n.y, this.z - d2*n.z);
}

x3dom.fields.SFVec3f.prototype.length = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
}

x3dom.fields.SFVec3f.prototype.normalize = function (that) {
    var n = this.length();
    if (n) n = 1.0 / n;
    return new x3dom.fields.SFVec3f(this.x*n, this.y*n, this.z*n);
}

x3dom.fields.SFVec3f.prototype.multiply = function (n) {
    return new x3dom.fields.SFVec3f(this.x*n, this.y*n, this.z*n);
}

x3dom.fields.SFVec2f.prototype.divide = function (n) {
    var denom = n ? (1.0 / n) : 1.0;
    return new x3dom.fields.SFVec2f(this.x*denom, this.y*denom, this.z*denom);
}

x3dom.fields.SFVec3f.prototype.toGL = function () {
    return [ this.x, this.y, this.z ];
}

x3dom.fields.SFVec3f.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " z " + this.z + " }";
}

x3dom.fields.SFVec3f.prototype.setValueByStr = function(str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    this.x = +m[1];
    this.y = +m[2];
    this.z = +m[3];
    return this;
}


/** Quaternion constructor.
    @class Represents a Quaternion
  */
x3dom.fields.Quaternion = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

x3dom.fields.Quaternion.prototype.mult = function (that) {
    return new x3dom.fields.Quaternion(
        this.w*that.x + this.x*that.w + this.y*that.z - this.z*that.y,
        this.w*that.y + this.y*that.w + this.z*that.x - this.x*that.z,
        this.w*that.z + this.z*that.w + this.x*that.y - this.y*that.x,
        this.w*that.w - this.x*that.x - this.y*that.y - this.z*that.z
    );
}

x3dom.fields.Quaternion.parseAxisAngle = function (str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    return x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]), +m[4]);
}

x3dom.fields.Quaternion.axisAngle = function (axis, a) {
	var t = axis.length();
	
	if (t > 0.000001)
	{
		var s = Math.sin(a/2) / t;
		var c = Math.cos(a/2);
		return new x3dom.fields.Quaternion(axis.x*s, axis.y*s, axis.z*s, c);
	}
	else
	{
		return new x3dom.fields.Quaternion(0, 0, 0, 1);
	}
}

x3dom.fields.Quaternion.prototype.toMatrix = function () {
    var xx = this.x * this.x * 2;
    var xy = this.x * this.y * 2;
    var xz = this.x * this.z * 2;
    var yy = this.y * this.y * 2;
    var yz = this.y * this.z * 2;
    var zz = this.z * this.z * 2;
    var wx = this.w * this.x * 2;
    var wy = this.w * this.y * 2;
    var wz = this.w * this.z * 2;

    return new x3dom.fields.SFMatrix4f(
        1 - (yy + zz), xy - wz, xz + wy, 0,
        xy + wz, 1 - (xx + zz), yz - wx, 0,
        xz - wy, yz + wx, 1 - (xx + yy), 0,
        0, 0, 0, 1
    );
}

x3dom.fields.Quaternion.prototype.dot = function (that) {
    return this.x*that.x + this.y*that.y + this.z*that.z + this.w*that.w;
}

x3dom.fields.Quaternion.prototype.add = function (that) {
    return new x3dom.fields.Quaternion(this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w);
}

x3dom.fields.Quaternion.prototype.subtract = function (that) {
    return new x3dom.fields.Quaternion(this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w);
}

x3dom.fields.Quaternion.prototype.multScalar = function (s) {
    return new x3dom.fields.Quaternion(this.x*s, this.y*s, this.z*s, this.w*s);
}

x3dom.fields.Quaternion.prototype.normalize = function (that) {
    var d2 = this.dot(that);
    var id = 1.0;
    if (d2) id = 1.0 / Math.sqrt(d2);
    return new x3dom.fields.Quaternion(this.x*id, this.y*id, this.z*id, this.w*id);
}

x3dom.fields.Quaternion.prototype.negate = function() {
    return new x3dom.fields.Quaternion(-this.x, -this.y, -this.z, -this.w);
}

x3dom.fields.Quaternion.prototype.slerp = function (that, t) {
    // calculate the cosine
    var cosom = this.dot(that);
    var rot1;

    // adjust signs if necessary
    if (cosom < 0.0)
    {
        cosom = -cosom;
        rot1 = that.negate();
    }
    else
    {
        rot1 = new x3dom.fields.Quaternion(that.x, that.y, that.z, that.w);
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

    // build the new quaternion
    return this.multScalar(scalerot0).add(rot1.multScalar(scalerot1));
}

x3dom.fields.Quaternion.rotateFromTo = function (fromVec, toVec) {
    var from = fromVec.normalize();
    var to   = toVec.normalize();
    var cost = from.dot(to);

    // check for degeneracies
    if (cost > 0.99999)
    {
        // vectors are parallel
        return new x3dom.fields.Quaternion(0, 0, 0, 1);
    }
    else if (cost < -0.99999)
    {
        // vectors are opposite
        // find an axis to rotate around, which should be
        // perpendicular to the original axis
        // Try cross product with (1,0,0) first, if that's one of our
        // original vectors then try  (0,1,0).
        var cAxis = new x3dom.fields.SFVec3f(1, 0, 0);

        var tmp = from.cross(cAxis);

        if (tmp.length() < 0.00001)
        {
            cAxis.x = 0;
            cAxis.y = 1;
            cAxis.z = 0;

            tmp = from.cross(cAxis);
        }
        tmp.normalize();

        return x3dom.fields.Quaternion.axisAngle(tmp, Math.Pi);
    }

    var axis = fromVec.cross(toVec);
    axis.normalize();

    // use half-angle formulae
    // sin^2 t = ( 1 - cos (2t) ) / 2
    var s = Math.sqrt(0.5 * (1.0 - cost));
    axis = axis.multiply(s);

    // scale the axis by the sine of half the rotation angle to get
    // the normalized quaternion
    // cos^2 t = ( 1 + cos (2t) ) / 2
    // w part is cosine of half the rotation angle
    s = Math.sqrt(0.5 * (1.0 + cost));
    
    return new x3dom.fields.Quaternion(axis.x, axis.y, axis.z, s);
}

x3dom.fields.Quaternion.prototype.toString = function () {
    return '((' + this.x + ', ' + this.y + ', ' + this.z + '), ' + this.w + ')';
}

x3dom.fields.Quaternion.prototype.setValueByStr = function(str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    var quat = x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+m[1], +m[2], +m[3]), +m[4]);
    this.x = quat.x;
    this.y = quat.y;
    this.z = quat.z;
    this.w = quat.w;
    return this;
}


/** SFColor constructor.
    @class Represents a SFColor
  */
x3dom.fields.SFColor = function(r, g, b) {
    if (arguments.length == 0) {
        this.r = this.g = this.b = 0;
    }
    else {
        this.r = r;
        this.g = g;
        this.b = b;
    }    
}

x3dom.fields.SFColor.parse = function(str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    return new x3dom.fields.SFColor( +m[1], +m[2], +m[3] );
}

x3dom.fields.SFColor.prototype.setHSV = function (h, s, v) {
    x3dom.debug.logInfo("SFColor.setHSV() NYI");
}

x3dom.fields.SFColor.prototype.getHSV = function () {
    var h = 0, s = 0, v = 0;
    x3dom.debug.logInfo("SFColor.getHSV() NYI");
    return [ h, s, v ];
}

x3dom.fields.SFColor.prototype.toGL = function () {
    return [ this.r, this.g, this.b ];
}

x3dom.fields.SFColor.prototype.toString = function() {
    return "{ r " + this.r + " g " + this.g + " b " + this.b + " }";
}

x3dom.fields.SFColor.prototype.setValueByStr = function(str) {
    var m = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)$/.exec(str);
    this.r = +m[1];
    this.g = +m[2];
    this.b = +m[3];
    return this;
}
  

/** MFColor constructor.
    @class Represents a MFColor
  */
x3dom.fields.MFColor = function(colorArray) {
    if (arguments.length == 0) {
        
    }
    else {
        colorArray.map( function(c) { this.push(c); }, this );
    }
};

x3dom.fields.MFColor.prototype = new Array;

x3dom.fields.MFColor.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.*\d*[eE]?[+-]?\d*?\s*){3},?\s*/g);
    var colors = [];
    for (var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*$/.exec(mc[i]);
        if (c[0])
            colors.push( new x3dom.fields.SFColor(+c[1], +c[2], +c[3]) );
    }

    return new x3dom.fields.MFColor( colors );
    
}

x3dom.fields.MFColor.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        a.push(c.r);
        a.push(c.g);
        a.push(c.b);        
    });

    return a;
}


/** MFRotation constructor.
    @class Represents a MFRotation
  */
x3dom.fields.MFRotation = function(rotArray) {
    if (arguments.length == 0) {        
        
    }
    else {
        rotArray.map( function(v) { this.push(v); }, this );
    }
};

x3dom.fields.MFRotation.prototype = new Array;

x3dom.fields.MFRotation.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.*\d*[eE]?[+-]?\d*?\s*){4},?\s*/g);
    var vecs = [];
    for (var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*$/.exec(mc[i]);
        if (c[0])
            vecs.push( x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3f(+c[1], +c[2], +c[3]), +c[4]) );
    }
    
    // holds the quaternion representation as needed by interpolators etc.
    return new x3dom.fields.MFRotation( vecs );    
}

x3dom.fields.MFRotation.prototype.toGL = function() {
    var a = [];

    //TODO

    return a;
}


/** MFVec3f constructor.
    @class Represents a MFVec3f
  */
x3dom.fields.MFVec3f = function(vec3Array) {
    if (arguments.length == 0) {        
        
    }
    else {
        vec3Array.map( function(v) { this.push(v); }, this );
    }
};

x3dom.fields.MFVec3f.prototype = new Array;

x3dom.fields.MFVec3f.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.*\d*[eE]?[+-]?\d*?\s*){3},?\s*/g);
    var vecs = [];
    for (var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*$/.exec(mc[i]);
        if (c[0])
            vecs.push( new x3dom.fields.SFVec3f(+c[1], +c[2], +c[3]) );
    }

    return new x3dom.fields.MFVec3f( vecs );    
}

x3dom.fields.MFVec3f.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(c) {
        a.push(c.x);
        a.push(c.y);
        a.push(c.z);        
    });

    return a;
}



/** MFVec2f constructor.
    @class Represents a MFVec2f
  */
x3dom.fields.MFVec2f = function(vec2Array) {
    if (arguments.length == 0) {        
        
    }
    else {
        vec2Array.map( function(v) { this.push(v); }, this );
    }
};

x3dom.fields.MFVec2f.prototype = new Array;

x3dom.fields.MFVec2f.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.*\d*[eE]?[+-]?\d*?\s*){2},?\s*/g);
    var vecs = [];
    for (var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*$/.exec(mc[i]);
        if (c[0])
            vecs.push( new x3dom.fields.SFVec2f(+c[1], +c[2]) );
    }

    return new x3dom.fields.MFVec2f( vecs );    
}

x3dom.fields.MFVec2f.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(v) {
        a.push(v.x);
        a.push(v.y);    
    });

    return a;
}


/** MFFloat constructor.
    @class Represents a MFFloat
  */
x3dom.fields.MFFloat = function(array) {
    if (arguments.length == 0) {
        
    }
    else {
        array.map( function(v) { this.push(v); }, this );
    }
};

x3dom.fields.MFFloat.prototype = new Array;

x3dom.fields.MFFloat.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.*\d*[eE]?[+-]?\d*?\s*){1},?\s*/g);
    var vals = [];
    for (var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*[eE]?[+-]?\d*?)\s*,?\s*$/.exec(mc[i]);
        if (c[0])
            vals.push( +c[1] );
    }
    
    return new x3dom.fields.MFFloat( vals );    
}

x3dom.fields.MFFloat.prototype.toGL = function() {
    var a = [];

    Array.map( this, function(v) {
        a.push(v);
    });

    return a;
}


/** Line constructor.
    @class Represents a Line (as internal helper).
  */
x3dom.fields.Line = function(pos, dir) 
{
    if (arguments.length == 0) 
    {
        this.pos = new x3dom.fields.SFVec3f(0, 0, 0);
        this.dir = new x3dom.fields.SFVec3f(0, 0, 1);
        
        this.t = 1;
    } 
    else 
    {
        this.pos = new x3dom.fields.SFVec3f(pos.x, pos.y, pos.z);
        
        var n = dir.length();
        this.t = n;
        if (n) n = 1.0 / n;
        
        this.dir = new x3dom.fields.SFVec3f(dir.x*n, dir.y*n, dir.z*n);
    }
}

x3dom.fields.Line.prototype.toString = function () {
    var str = 'Line: [' + this.pos.toString() + '; ' + this.dir.toString() + ']';
    return str;
}

/** intersect line with box volume given by low and high */
x3dom.fields.Line.prototype.intersect = function(low, high)
{
    var Eps = 0.000001;
    var isect = 0.0;
    var out = Number.MAX_VALUE;
    var r, te, tl;
    
    if (this.dir.x > Eps)
    {
        r = 1.0 / this.dir.x;
    
        te = (low.x - this.pos.x) * r;
        tl = (high.x - this.pos.x) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect  = te;
    }
    else if (this.dir.x < -Eps)
    {
        r = 1.0 / this.dir.x;
    
        te = (high.x - this.pos.x) * r;
        tl = (low.x - this.pos.x) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect = te;
    }
    else if (this.pos.x < low.x || this.pos.x > high.x)
    {
        return false;
    }
    
    if (this.dir.y > Eps)
    {
        r = 1.0 / this.dir.y;
    
        te = (low.y - this.pos.y) * r;
        tl = (high.y - this.pos.y) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect = te;
    
        if (isect-out >= Eps)
            return false;
    }
    else if (this.dir.y < -Eps)
    {
        r = 1.0 / this.dir.y;
    
        te = (high.y - this.pos.y) * r;
        tl = (low.y - this.pos.y) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect = te;
    
        if (isect-out >= Eps)
            return false;
    }
    else if (this.pos.y < low.y || this.pos.y > high.y)
    {
        return false;
    }
    
    if (this.dir.z > Eps)
    {
        r = 1.0 / this.dir.z;
    
        te = (low.z - this.pos.z) * r;
        tl = (high.z - this.pos.z) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect = te;
    }
    else if (this.dir.z < -Eps)
    {
        r = 1.0 / this.dir.z;
    
        te = (high.z - this.pos.z) * r;
        tl = (low.z - this.pos.z) * r;
    
        if (tl < out)   
            out = tl;
    
        if (te > isect)    
            isect = te;
    }
    else if (this.pos.z < low.z || this.pos.z > high.z)
    {
        return false;
    }
    
    this.enter = isect;
    this.exit  = out;

    return (isect-out < Eps);
}
