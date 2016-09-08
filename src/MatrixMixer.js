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

x3dom.MatrixMixer = function( beginTime, endTime )
{
    this.beginTime = beginTime || 0;
    this.endTime = endTime || 1;

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

x3dom.MatrixMixer.prototype._calcFraction = function( time )
{
    var fraction = ( time - this.beginTime ) / ( this.endTime - this.beginTime );
	
    return ( Math.sin( ( fraction * Math.PI ) - ( Math.PI / 2 ) ) + 1 ) / 2.0;
};

x3dom.MatrixMixer.prototype._isValid = function()
{
    var angles = this._beginMat.inverse().mult( this._endMat ).getEulerAngles();
	
    return ( Math.abs( angles[ 0 ] ) != Math.PI && 
	         Math.abs( angles[ 1 ] ) != Math.PI && 
			 Math.abs( angles[ 2 ] ) != Math.PI );
};

x3dom.MatrixMixer.prototype._prepareQuaternionAnimation = function()
{
    this._beginRot.setValue( this._beginMat );
    this._endRot.setValue( this._endMat );

    this._beginPos = this._beginMat.e3();
    this._endPos = this._endMat.e3();

    this._useQuaternion = true;
};

x3dom.MatrixMixer.prototype._reset = function()
{
    this.beginTime = 0;
    this.endTime = 0;
    this._useQuaternion = false;
};

x3dom.MatrixMixer.prototype.isActive = function()
{
    return ( this.beginTime > 0 );
};

x3dom.MatrixMixer.prototype.setBeginMatrix = function( mat )
{
    this._beginMat.setValues( mat );
    this._beginInvMat = mat.inverse();
    this._beginLogMat = x3dom.fields.SFMatrix4f.zeroMatrix();
};

x3dom.MatrixMixer.prototype.setEndMatrix = function( mat )
{
    this._endMat.setValues( mat );

    if ( !this._isValid() )
	{
        this._prepareQuaternionAnimation();
    }

    this._endLogMat = this._endMat.mult( this._beginInvMat ).log();
    this._logDiffMat = this._endLogMat.addScaled( this._beginLogMat, -1 );
};

x3dom.MatrixMixer.prototype._mixQuaternion = function( fraction )
{
    var rotation = this._beginRot.slerp( this._endRot, fraction );
    var translation = this._beginPos.addScaled( this._endPos.subtract( this._beginPos ), fraction );

    this._result.setRotate( rotation );
    this._result.setTranslate( translation );

    return this._result.copy();
};

x3dom.MatrixMixer.prototype._mixMatrix = function( fraction )
{
    return this._logDiffMat.multiply( fraction ).add( this._beginLogMat ).exp().mult( this._beginMat );
};


x3dom.MatrixMixer.prototype.mix = function( time )
{
	if ( time <= this.beginTime )
	{
		return x3dom.fields.SFMatrix4f.copy( this._beginLogMat ).exp().mult( this._beginMat );
	}
	else if ( time >= this.endTime )
	{
		this._reset();
		
		return x3dom.fields.SFMatrix4f.copy( this._endLogMat ).exp().mult( this._beginMat );
	}
	else
	{
		this.isMixing = true;
		
		var fraction = this._calcFraction( time );
		
		if(this._useQuaternion)
		{
			return this._mixQuaternion( fraction );
		}
		else
		{
			return this._mixMatrix( fraction );
		}
	}  
};
