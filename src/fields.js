/*

Might be nice to have specialised transform-matrices etc, for more optimised maths.

*/

/** @namespace The x3dom.fields namespace. */
x3dom.fields = {};

/** SFMatrix4 constructor. 
    @class Represents a SFMatrix4
  */
x3dom.fields.SFMatrix4 = function(_00, _01, _02, _03, _10, _11, _12, _13, _20, _21, _22, _23, _30, _31, _32, _33) {
    if (arguments.length == 0) {
        this._00 = 1; this._01 = 0; this._02 = 0; this._03 = 0;
        this._10 = 0; this._11 = 1; this._12 = 0; this._13 = 0;
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    } else {
        this._00 = _00; this._01 = _01; this._02 = _02; this._03 = _03;
        this._10 = _10; this._11 = _11; this._12 = _12; this._13 = _13;
        this._20 = _20; this._21 = _21; this._22 = _22; this._23 = _23;
        this._30 = _30; this._31 = _31; this._32 = _32; this._33 = _33;
    }
}

/** Returns a SFMatrix4 identity matrix. */
x3dom.fields.SFMatrix4.identity = function () {
    return new x3dom.fields.SFMatrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.translation = function (vec) {
    return new x3dom.fields.SFMatrix4(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.rotationX = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.rotationY = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.rotationZ = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new x3dom.fields.SFMatrix4(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.scale = function (vec) {
    return new x3dom.fields.SFMatrix4(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFMatrix4.parseRotation = function (str) {
    var m = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(str);
    var x = +m[1], y = +m[2], z = +m[3], a = +m[4];
    var d = Math.sqrt(x*x + y*y + z*z);
    if (d == 0) {
        x = 1; y = z = 0;
    } else {
        x /= d; y /= d; z /= d;
    }
    //a -= 3.141;
    var c = Math.cos(a);
    var s = Math.sin(a);
    var t  = 1-c;

    return new x3dom.fields.SFMatrix4(
        t*x*x+c,   t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c,   t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c,   0,
        0,         0,         0,         1
    ).transpose();
}

x3dom.fields.SFMatrix4.prototype.mult = function (that)  {
    return new x3dom.fields.SFMatrix4(
        this._00*that._00+this._01*that._10+this._02*that._20+this._03*that._30, this._00*that._01+this._01*that._11+this._02*that._21+this._03*that._31, this._00*that._02+this._01*that._12+this._02*that._22+this._03*that._32, this._00*that._03+this._01*that._13+this._02*that._23+this._03*that._33,
        this._10*that._00+this._11*that._10+this._12*that._20+this._13*that._30, this._10*that._01+this._11*that._11+this._12*that._21+this._13*that._31, this._10*that._02+this._11*that._12+this._12*that._22+this._13*that._32, this._10*that._03+this._11*that._13+this._12*that._23+this._13*that._33,
        this._20*that._00+this._21*that._10+this._22*that._20+this._23*that._30, this._20*that._01+this._21*that._11+this._22*that._21+this._23*that._31, this._20*that._02+this._21*that._12+this._22*that._22+this._23*that._32, this._20*that._03+this._21*that._13+this._22*that._23+this._23*that._33,
        this._30*that._00+this._31*that._10+this._32*that._20+this._33*that._30, this._30*that._01+this._31*that._11+this._32*that._21+this._33*that._31, this._30*that._02+this._31*that._12+this._32*that._22+this._33*that._32, this._30*that._03+this._31*that._13+this._32*that._23+this._33*that._33
    );
}

x3dom.fields.SFMatrix4.prototype.multMatrixPnt = function (vec) {
    return new x3dom.fields.SFVec3(
        this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03,
        this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13,
        this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23
    );
}

x3dom.fields.SFMatrix4.prototype.multMatrixVec = function (vec) {
    return new x3dom.fields.SFVec3(
        this._00*vec.x + this._01*vec.y + this._02*vec.z,
        this._10*vec.x + this._11*vec.y + this._12*vec.z,
        this._20*vec.x + this._21*vec.y + this._22*vec.z
    );
}

x3dom.fields.SFMatrix4.prototype.transpose = function () {
    return new x3dom.fields.SFMatrix4(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
}

x3dom.fields.SFMatrix4.prototype.toGL = function () {
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
}

x3dom.fields.SFMatrix4.prototype.decompose = function () {
    // Return [ T, S, x, y, z ] such that
    //   rotateX(x); rotateY(t); rotateZ(z); scale(S); translate(T);
    // does the equivalent transformation

    var T = new SFVec3(this._03, this._13, this._23);
    var S = new SFVec3(1, 1, 1); // XXX

    // http://www.j3d.org/matrix_faq/matrfaq_latest.html
    var angle_x, angle_y, angle_y, tr_x, tr_y, C;
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

x3dom.fields.SFMatrix4.prototype.toString = function () {
    return '[SFMatrix4 ' +
        this._00+', '+this._01+', '+this._02+', '+this._03+'; '+
        this._10+', '+this._11+', '+this._12+', '+this._13+'; '+
        this._20+', '+this._21+', '+this._22+', '+this._23+'; '+
        this._30+', '+this._31+', '+this._32+', '+this._33+']';
}

/** SFVec2 constructor.
    @class Represents a SFVec2
  */
x3dom.fields.SFVec2 = function(x, y) {
    if (arguments.length == 0) {
        this.x = this.y = 0;
    } else {
        this.x = x;
        this.y = y;
    }
}

x3dom.fields.SFVec2.parse = function (str) {
    var m = /^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)$/.exec(str);
    return new x3dom.fields.SFVec2(+m[1], +m[2]);
}

x3dom.fields.SFVec2.prototype.add = function (that) {
    return new x3dom.fields.SFVec2(this.x+that.x, this.y+that.y);
/*    this.x += that.x;
    this.y += that.y;
    return this;*/
}

x3dom.fields.SFVec2.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec2(this.x-that.x, this.y-that.y);
/*    this.x -= that.x;
    this.y -= that.y;
    return this;    */
}

x3dom.fields.SFVec2.prototype.negate = function () {
    return new x3dom.fields.SFVec2(this.x*-1, this.y*-1);
/*    this.x *= -1;
    this.y *= -1;
    return this;    */
}

x3dom.fields.SFVec2.prototype.dot = function (that) {
    return this.x * that.x  +  this.y * that.y;
}


x3dom.fields.SFVec2.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec2(this.x-d2*n.x, this.y-d2*n.y);
/*    this.x -= d2*n.x;
    this.y -= d2*n.y;
    return this;    */
}

x3dom.fields.SFVec2.prototype.normalise = function (that) {
    // var n = Math.sqrt((this.x*this.x) + (this.y*this.y));
    var n = this.length();
    if (n) n = 1.0 / n;
    return new x3dom.fields.SFVec2(this.x*n, this.y*n);
/*    this.x *= n;
    this.y *= n;
    return this;*/
}

x3dom.fields.SFVec2.prototype.multiply = function (n) {
    return new x3dom.fields.SFVec2(this.x*n, this.y*n);
/*    this.x *= n;
    this.y *= n;
    return this;*/
}

x3dom.fields.SFVec2.prototype.length = function() {
    return Math.sqrt((this.x*this.x) + (this.y*this.y));
}

x3dom.fields.SFVec2.prototype.toGL = function () {
    return [ this.x, this.y ];
}

x3dom.fields.SFVec2.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " }";
}

x3dom.fields.SFVec2.prototype.setValueByStr = function(s) {
    var m = /^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)$/.exec(s);
    this.x = +m[1];
    this.y = +m[2];
    return this;
}




/** SFVec3 constructor.
    @class Represents a SFVec3
  */
x3dom.fields.SFVec3 = function(x, y, z) {
    if (arguments.length == 0) {
        this.x = this.y = this.z = 0;
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

x3dom.fields.SFVec3.parse = function (str) {
    var m = /^(\S+)\s+(\S+)\s+(\S+)$/.exec(str);
    return new x3dom.fields.SFVec3(+m[1], +m[2], +m[3]);
}

x3dom.fields.SFVec3.prototype.add = function (that) {
    return new x3dom.fields.SFVec3(this.x + that.x, this.y + that.y, this.z + that.z);
}

x3dom.fields.SFVec3.prototype.subtract = function (that) {
    return new x3dom.fields.SFVec3(this.x - that.x, this.y - that.y, this.z - that.z);
}

x3dom.fields.SFVec3.prototype.negate = function () {
    return new x3dom.fields.SFVec3(-this.x, -this.y, -this.z);
}

x3dom.fields.SFVec3.prototype.dot = function (that) {
    return (this.x*that.x + this.y*that.y + this.z*that.z);
}

x3dom.fields.SFVec3.prototype.cross = function (that) {
    return new x3dom.fields.SFVec3(this.y*that.z - this.z*that.y, this.z*that.x - this.x*that.z, this.x*that.y - this.y*that.x);
}

x3dom.fields.SFVec3.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new x3dom.fields.SFVec3(this.x - d2*n.x, this.y - d2*n.y, this.z - d2*n.z);
}

x3dom.fields.SFVec3.prototype.normalised = function (that) {
    var n = Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
    if (n) n = 1.0 / n;
    return new x3dom.fields.SFVec3(this.x*n, this.y*n, this.z*n);
}

x3dom.fields.SFVec3.prototype.scale = function (n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
}

x3dom.fields.SFVec3.prototype.toGL = function () {
    return [ this.x, this.y, this.z ];
}

x3dom.fields.SFVec3.prototype.toString = function () {
    return "{ x " + this.x + " y " + this.y + " z " + this.z + " }";
}


/** SFQuaternion constructor.
    @class Represents a SFQuaternion
  */
x3dom.fields.SFQuaternion = function(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

x3dom.fields.SFQuaternion.prototype.mult = function (that) {
    return new x3dom.fields.SFQuaternion(
        this.w*that.x + this.x*that.w + this.y*that.z - this.z*that.y,
        this.w*that.y + this.y*that.w + this.z*that.x - this.x*that.z,
        this.w*that.z + this.z*that.w + this.x*that.y - this.y*that.x,
        this.w*that.w - this.x*that.x - this.y*that.y - this.z*that.z
    );
}

x3dom.fields.SFQuaternion.parseAxisAngle = function (str) {
    var m = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(str);
    return x3dom.fields.SFQuaternion.axisAngle(new x3dom.fields.SFVec3(+m[1], +m[2], +m[3]), +m[4]);
}

x3dom.fields.SFQuaternion.axisAngle = function (axis, a) {
    var s = Math.sin(a/2);
    var c = Math.cos(a/2);
    return new x3dom.fields.SFQuaternion(axis.x*s, axis.y*s, axis.z*s, c);
}

x3dom.fields.SFQuaternion.prototype.toMatrix = function () {
    var xx = this.x * this.x * 2;
    var xy = this.x * this.y * 2;
    var xz = this.x * this.z * 2;
    var yy = this.y * this.y * 2;
    var yz = this.y * this.z * 2;
    var zz = this.z * this.z * 2;
    var wx = this.w * this.x * 2;
    var wy = this.w * this.y * 2;
    var wz = this.w * this.z * 2;

    return new x3dom.fields.SFMatrix4(
        1 - (yy + zz), xy - wz, xz + wy, 0,
        xy + wz, 1 - (xx + zz), yz - wx, 0,
        xz - wy, yz + wx, 1 - (xx + yy), 0,
        0, 0, 0, 1
    );
}

x3dom.fields.SFQuaternion.prototype.dot = function (that) {
    return this.x*that.x + this.y*that.y + this.z*that.z + this.w*that.w;
}

x3dom.fields.SFQuaternion.prototype.add = function (that) {
    return new x3dom.fields.SFQuaternion(this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w);
}

x3dom.fields.SFQuaternion.prototype.subtract = function (that) {
    return new x3dom.fields.SFQuaternion(this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w);
}

x3dom.fields.SFQuaternion.prototype.multScalar = function (s) {
    return new x3dom.fields.SFQuaternion(this.x*s, this.y*s, this.z*s, this.w*s);
}

x3dom.fields.SFQuaternion.prototype.normalised = function (that) {
    var d2 = this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
    if (d2 == 0) return this;
    var id = 1/Math.sqrt(d2);
    return new x3dom.fields.SFQuaternion(this.x*id, this.y*id, this.z*id, this.w*id);
}

x3dom.fields.SFQuaternion.prototype.slerp = function (that, t) {
    var dot = this.dot(that);
    if (dot > 0.995)
        return this.add(that.subtract(this).multScalar(t)).normalised();
    dot = Math.max(-1, Math.min(1, dot));
    var theta = Math.acos(dot)*t;
    var tother = that.subtract(this.multScalar(dot)).normalised();
    return this.multScalar(Math.cos(theta)).add(tother.multScalar(Math.sin(theta)));
}

x3dom.fields.SFQuaternion.prototype.toString = function () {
    return '((' + this.x + ', ' + this.y + ', ' + this.z + '), ' + this.w + ')';
}


/** SFColor constructor.
    @class Represents a SFColor
  */
x3dom.fields.SFColor = function(r, g, b) {
    if (arguments.length == 0) {
        this.r = this.g = this.b = 0;
    } else {
        this.r = r;
        this.g = g;
        this.b = b;
    }    
}

x3dom.fields.SFColor.prototype.toGL = function () {
    return [ this.r, this.g, this.b ];
}


x3dom.fields.SFColor.toString = function() {
    return "{ r " + this.r + " g " + this.g + " b " + this.b + " }";
}
  

/** MFColor constructor.
    @class Represents a MFColor
  */
x3dom.fields.MFColor = [];


