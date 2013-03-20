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
};

x3dom.MatrixMixer.prototype.calcFraction = function(time) {
    var fraction = (time - this._beginTime) / (this._endTime - this._beginTime);
    return (Math.sin((fraction * Math.PI) - (Math.PI / 2)) + 1) / 2.0;
};

x3dom.MatrixMixer.prototype.setBeginMatrix = function(mat) {
    this._beginMat.setValues(mat);
    this._beginInvMat = mat.inverse();
    this._beginLogMat = x3dom.fields.SFMatrix4f.zeroMatrix();  // mat.log();
};

x3dom.MatrixMixer.prototype.setEndMatrix = function(mat) {
    this._endMat.setValues(mat);
    this._endLogMat = mat.mult(this._beginInvMat).log();
    this._logDiffMat = this._endLogMat.addScaled(this._beginLogMat, -1);
};

x3dom.MatrixMixer.prototype.mix = function(time) {
    var mat = null;

    if (time <= this._beginTime)
    {
        mat = x3dom.fields.SFMatrix4f.copy(this._beginLogMat);
    }
    else
    {
        if (time >= this._endTime)
        {
            mat = x3dom.fields.SFMatrix4f.copy(this._endLogMat);
        }
        else
        {
            var fraction = this.calcFraction(time);
            mat = this._logDiffMat.multiply(fraction).add(this._beginLogMat);
        }
    }

    return mat.exp().mult(this._beginMat);
};
