/*

Might be nice to have specialised transform-matrices etc, for more optimised maths.

*/

function SFMatrix4(_00, _01, _02, _03, _10, _11, _12, _13, _20, _21, _22, _23, _30, _31, _32, _33) {
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

SFMatrix4.identity = function () {
    return new SFMatrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

SFMatrix4.translation = function (vec) {
    return new SFMatrix4(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
}

SFMatrix4.rotationX = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new SFMatrix4(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
}

SFMatrix4.rotationY = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new SFMatrix4(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
}

SFMatrix4.rotationZ = function (a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return new SFMatrix4(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

SFMatrix4.scale = function (vec) {
    return new SFMatrix4(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
}


SFMatrix4.parseRotation = function (str) {
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

    return new SFMatrix4(
        t*x*x+c,   t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c,   t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c,   0,
        0,         0,         0,         1
    ).transpose();
}

SFMatrix4.prototype.times = function (that)  {
    return new SFMatrix4(
        this._00*that._00+this._01*that._10+this._02*that._20+this._03*that._30, this._00*that._01+this._01*that._11+this._02*that._21+this._03*that._31, this._00*that._02+this._01*that._12+this._02*that._22+this._03*that._32, this._00*that._03+this._01*that._13+this._02*that._23+this._03*that._33,
        this._10*that._00+this._11*that._10+this._12*that._20+this._13*that._30, this._10*that._01+this._11*that._11+this._12*that._21+this._13*that._31, this._10*that._02+this._11*that._12+this._12*that._22+this._13*that._32, this._10*that._03+this._11*that._13+this._12*that._23+this._13*that._33,
        this._20*that._00+this._21*that._10+this._22*that._20+this._23*that._30, this._20*that._01+this._21*that._11+this._22*that._21+this._23*that._31, this._20*that._02+this._21*that._12+this._22*that._22+this._23*that._32, this._20*that._03+this._21*that._13+this._22*that._23+this._23*that._33,
        this._30*that._00+this._31*that._10+this._32*that._20+this._33*that._30, this._30*that._01+this._31*that._11+this._32*that._21+this._33*that._31, this._30*that._02+this._31*that._12+this._32*that._22+this._33*that._32, this._30*that._03+this._31*that._13+this._32*that._23+this._33*that._33
    );
}

SFMatrix4.prototype.transformPos = function (vec) {
    return new SFVec3(
        this._00*vec.x + this._01*vec.y + this._02*vec.z + this._03,
        this._10*vec.x + this._11*vec.y + this._12*vec.z + this._13,
        this._20*vec.x + this._21*vec.y + this._22*vec.z + this._23
    );
}

SFMatrix4.prototype.transformNorm = function (vec) {
    return new SFVec3(
        this._00*vec.x + this._01*vec.y + this._02*vec.z,
        this._10*vec.x + this._11*vec.y + this._12*vec.z,
        this._20*vec.x + this._21*vec.y + this._22*vec.z
    );
}

SFMatrix4.prototype.transpose = function () {
    return new SFMatrix4(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
}

SFMatrix4.prototype.toGL = function () {
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
}

SFMatrix4.prototype.decompose = function () {
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

SFMatrix4.prototype.toString = function () {
    return '[SFMatrix4 ' +
        this._00+', '+this._01+', '+this._02+', '+this._03+'; '+
        this._10+', '+this._11+', '+this._12+', '+this._13+'; '+
        this._20+', '+this._21+', '+this._22+', '+this._23+'; '+
        this._30+', '+this._31+', '+this._32+', '+this._33+']';
}


function SFVec3(x, y, z) {
    if (arguments.length == 0) {
        this.x = this.y = this.z = 0;
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

SFVec3.parse = function (str) {
    var m = /^(\S+)\s+(\S+)\s+(\S+)$/.exec(str);
    return new SFVec3(+m[1], +m[2], +m[3]);
}

SFVec3.prototype.plus = function (that) {
    return new SFVec3(this.x + that.x, this.y + that.y, this.z + that.z);
}

SFVec3.prototype.minus = function (that) {
    return new SFVec3(this.x - that.x, this.y - that.y, this.z - that.z);
}

SFVec3.prototype.negate = function () {
    return new SFVec3(-this.x, -this.y, -this.z);
}

SFVec3.prototype.dot = function (that) {
    return (this.x*that.x + this.y*that.y + this.z*that.z);
}

SFVec3.prototype.cross = function (that) {
    return new SFVec3(this.y*that.z - this.z*that.y, this.z*that.x - this.x*that.z, this.x*that.y - this.y*that.x);
}

SFVec3.prototype.reflect = function (n) {
    var d2 = this.dot(n)*2;
    return new SFVec3(this.x - d2*n.x, this.y - d2*n.y, this.z - d2*n.z);
}

SFVec3.prototype.normalised = function (that) {
    var n = Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
    if (n) n = 1 / n;
    return new SFVec3(this.x*n, this.y*n, this.z*n);
}

SFVec3.prototype.toGL = function () {
    return [ this.x, this.y, this.z ];
}


function SFQuat(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

SFQuat.prototype.times = function (that) {
    return new SFQuat(
        this.w*that.x + this.x*that.w + this.y*that.z - this.z*that.y,
        this.w*that.y + this.y*that.w + this.z*that.x - this.x*that.z,
        this.w*that.z + this.z*that.w + this.x*that.y - this.y*that.x,
        this.w*that.w - this.x*that.x - this.y*that.y - this.z*that.z
    );
}

SFQuat.parseAxisAngle = function (str) {
    var m = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(str);
    return SFQuat.axisAngle(new SFVec3(+m[1], +m[2], +m[3]), +m[4]);
}

SFQuat.axisAngle = function (axis, a) {
    var s = Math.sin(a/2);
    var c = Math.cos(a/2);
    return new SFQuat(axis.x*s, axis.y*s, axis.z*s, c);
}

SFQuat.prototype.toMatrix = function () {
    var xx = this.x * this.x * 2;
    var xy = this.x * this.y * 2;
    var xz = this.x * this.z * 2;
    var yy = this.y * this.y * 2;
    var yz = this.y * this.z * 2;
    var zz = this.z * this.z * 2;
    var wx = this.w * this.x * 2;
    var wy = this.w * this.y * 2;
    var wz = this.w * this.z * 2;

    return new SFMatrix4(
        1 - (yy + zz), xy - wz, xz + wy, 0,
        xy + wz, 1 - (xx + zz), yz - wx, 0,
        xz - wy, yz + wx, 1 - (xx + yy), 0,
        0, 0, 0, 1
    );
}

SFQuat.prototype.dot = function (that) {
    return this.x*that.x + this.y*that.y + this.z*that.z + this.w*that.w;
}

SFQuat.prototype.plus = function (that) {
    return new SFQuat(this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w);
}

SFQuat.prototype.minus = function (that) {
    return new SFQuat(this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w);
}

SFQuat.prototype.timesScalar = function (s) {
    return new SFQuat(this.x*s, this.y*s, this.z*s, this.w*s);
}

SFQuat.prototype.normalised = function (that) {
    var d2 = this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
    if (d2 == 0) return this;
    var id = 1/Math.sqrt(d2);
    return new SFQuat(this.x*id, this.y*id, this.z*id, this.w*id);
}


SFQuat.prototype.slerp = function (that, t) {
    var dot = this.dot(that);
    if (dot > 0.995)
        return this.plus(that.minus(this).timesScalar(t)).normalised();
    dot = Math.max(-1, Math.min(1, dot));
    var theta = Math.acos(dot)*t;
    var tother = that.minus(this.timesScalar(dot)).normalised();
    return this.timesScalar(Math.cos(theta)).plus(tother.timesScalar(Math.sin(theta)));
}

SFQuat.prototype.toString = function () {
    return '((' + this.x + ', ' + this.y + ', ' + this.z + '), ' + this.w + ')';
}