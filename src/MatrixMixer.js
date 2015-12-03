/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

x3dom.MatrixMixer = function(beginTime, endTime) {
    if (arguments.length === 0) {
        this._beginTime = 0;
        this._endTime = 1;
    }
    else {
        this._beginTime = beginTime;
        this._endTime = endTime;
    }

    this._beginMat = x3dom.fields.SFMatrix4f.identity();
    this._beginInvMat = x3dom.fields.SFMatrix4f.identity();
    this._beginLogMat = x3dom.fields.SFMatrix4f.identity();
    this._endMat = x3dom.fields.SFMatrix4f.identity();
    this._endLogMat = x3dom.fields.SFMatrix4f.identity();

    this._beginRot = new x3dom.fields.Quaternion();
    this._endRot = new x3dom.fields.Quaternion();

    this._beginPos = new x3dom.fields.SFVec3f();
    this._endPos = new x3dom.fields.SFVec3f();
    this._result = x3dom.fields.SFMatrix4f.identity();

    this._useQuaternion = false;
};

x3dom.MatrixMixer.prototype.calcFraction = function(time) {
    var fraction = (time - this._beginTime) / (this._endTime - this._beginTime);
    return (Math.sin((fraction * Math.PI) - (Math.PI / 2)) + 1) / 2.0;
};

x3dom.MatrixMixer.prototype._isValid = function() {
    var angles = this._beginMat.inverse().mult(this._endMat).getEulerAngles();
    return (Math.abs(angles[0]) != Math.PI && Math.abs(angles[1]) != Math.PI && Math.abs(angles[2]) != Math.PI);
};

x3dom.MatrixMixer.prototype._prepareQuaternionAnimation = function() {
    this._beginRot.setValue(this._beginMat);
    this._endRot.setValue(this._endMat);

    this._beginPos = this._beginMat.e3();
    this._endPos = this._endMat.e3();

    this._useQuaternion = true;
};

x3dom.MatrixMixer.prototype.setBeginMatrix = function(mat) {
    this._beginMat.setValues(mat);
    this._beginInvMat = mat.inverse();
    this._beginLogMat = x3dom.fields.SFMatrix4f.zeroMatrix();  // mat.log();
};

x3dom.MatrixMixer.prototype.reset = function() {
    this._beginTime = 0;
    this._endTime = 0;
    this._useQuaternion = false;
};

x3dom.MatrixMixer.prototype.setEndMatrix = function(mat) {
    this._endMat.setValues(mat);

    if (!this._isValid()) {
        this._prepareQuaternionAnimation();
    }

    this._endLogMat = this._endMat.mult(this._beginInvMat).log();
    this._logDiffMat = this._endLogMat.addScaled(this._beginLogMat, -1);
};

x3dom.MatrixMixer.prototype.mixQuaternion = function(time) {

    var fraction = this.calcFraction(time);

    var rotation = this._beginRot.slerp(this._endRot, fraction);
    var translation = this._beginPos.addScaled(this._endPos.subtract(this._beginPos), fraction);

    this._result.setRotate(rotation);
    this._result.setTranslate(translation);

    return this._result.copy();

};

x3dom.MatrixMixer.prototype.mixMatrix = function(time) {

    var mat = null;

    if (time <= this._beginTime) {
        mat = x3dom.fields.SFMatrix4f.copy(this._beginLogMat);
    }
    else {
        if (time >= this._endTime) {
            mat = x3dom.fields.SFMatrix4f.copy(this._endLogMat);
        }
        else {
            var fraction = this.calcFraction(time);
            mat = this._logDiffMat.multiply(fraction).add(this._beginLogMat);
        }
    }

    return mat.exp().mult(this._beginMat);

};


x3dom.MatrixMixer.prototype.mix = function(time) {

    if(this._useQuaternion) {
        return this.mixQuaternion(time);
    }else {
        return this.mixMatrix(time);
    }
};
