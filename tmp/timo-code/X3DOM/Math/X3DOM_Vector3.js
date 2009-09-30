x3dom.vector3 = {
	
	length: function(vec3) 
	{
		return Math.sqrt(vec3[0]*vec3[0] + vec3[1]*vec3[1] + vec3[2]*vec3[2]);
	},
	
	normalize: function(vec3) 
	{
		var vec3Result = new Array();
	
		var length = this.length(vec3);
		
		vec3Result[0] = vec3[0]/length;
		vec3Result[1] = vec3[1]/length;
		vec3Result[2] = vec3[2]/length;
		
		return vec3Result;
	},
	
	add: function(vec3_1, vec3_2) 
	{
		var vec3Result = new Array();
		
		vec3Result[0] = vec3_1[0] + vec3_2[0];
		vec3Result[1] = vec3_1[1] + vec3_2[1];
		vec3Result[2] = vec3_1[2] + vec3_2[2];
		
		return vec3Result;
	},
	
	sub: function(vec3_1, vec3_2) 
	{
		var vec3Result = new Array();
		
		vec3Result[0] = vec3_1[0] - vec3_2[0];
		vec3Result[1] = vec3_1[1] - vec3_2[1];
		vec3Result[2] = vec3_1[2] - vec3_2[2];
		
		return vec3Result;
	},
	
	cross: function(vec3_1, vec3_2) 
	{
		var vec3Result = new Array();
		
		vec3Result[0] = vec3_1[1] * vec3_2[2] - vec3_1[2] * vec3_2[1];
		vec3Result[1] = vec3_1[2] * vec3_2[0] - vec3_1[0] * vec3_2[2];
		vec3Result[2] = vec3_1[0] * vec3_2[1] - vec3_1[1] * vec3_2[0];
		
		return vec3Result;
	},
	
	dot: function(vec3_1, vec3_2) 
	{	
		return vec3_1[0]*vec3_2[0] + vec3_1[1]*vec3_2[1] + vec3_1[2]*vec3_2[2];
	}
	
};