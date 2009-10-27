var SFVec3f=function(x,y,z)
{
	this.SFVec3f = [x,y,z];
};
var MFColor=function(x,y,z)
{
	this.MFColor = [x,y,z];
};
var SFString = function(str)
{
	this.SFString = str;
};
var SFBool = function(bool)
{
	this.SFBool = bool;
};

var X3D = function()
{
	this.Scene = null;
};

var Scene = function()
{
	this.bboxCenter = new SFVec3f(0.0,0.0,0.0);
	this.bboxSize = new SFVec3f(0.0,0.0,0.0);
	this.children = new Array();
	this.description = new SFString("This is the Scene");
	this.render = new SFBool(true);
	this.showBBox = new SFBool(false);
	this.isPickable = new SFBool(true);
	this.addChildren = function(obj)
	{
		this.children["Background"] = obj;
	}
	this.removeChildren = function(obj)
	{
		this.children["Background"] = obj;
	}
}

var Background = function()
{
	this.skyColor = new MFColor(0.0, 0.0, 0.0);
}