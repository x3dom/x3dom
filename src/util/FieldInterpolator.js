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

x3dom.FieldInterpolator = function( beginTime, endTime, beginValue, endValue )
{
	this.beginTime = beginTime || 0;
	this.endTime   = endTime || 1;
	this.beginValue = beginValue || 0;
	this.endValue   = endValue || 0;
	this.isInterpolating = false;
};

x3dom.FieldInterpolator.prototype.isActive = function()
{
    return ( this.beginTime > 0 );
};

x3dom.FieldInterpolator.prototype.calcFraction = function(time)
{
    var fraction = ( time - this.beginTime ) / ( this.endTime - this.beginTime );
    return ( Math.sin( ( fraction * Math.PI ) - ( Math.PI / 2 ) ) + 1 ) / 2.0;
};

x3dom.FieldInterpolator.prototype.reset = function()
{
	this.isInterpolating = false;
    this.beginTime = 0;
    this.endTime = 1;
	this.beginValue = 0;
	this.endValue   = 0;
};

x3dom.FieldInterpolator.prototype.interpolate = function( time )
{
	if ( time < this.beginTime )
	{
		return this.beginValue;
	}
	else if ( time >= this.endTime )
	{
		var endValue = this.endValue;
		
		this.reset();
		
		return endValue;
	}
	else
	{
		this.isInterpolating = true;
		return this.beginValue + ( this.endValue - this.beginValue ) * this.calcFraction( time );
	}
};
