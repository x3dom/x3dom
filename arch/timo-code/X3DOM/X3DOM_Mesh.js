// JavaScript Document
x3dom.Mesh = function()
{
	this.m_fVertices    = [];
	this.m_uiIndices    = [];
	this.m_fNormals     = [];
	this.m_fTexCoords   = [];
	
	this.m_vTranslation = [0.0, 0.0, 0.0];
	this.m_vRotation    = [0.0, 0.0, 0.0];
	this.m_vScale	    = [1.0, 1.0, 1.0];
	this.matMeshMatrix  = x3dom.matrix4.identity();
	
	this.m_Material     = new x3dom.Material();
	
	this.update = function()
	{
		var result		= x3dom.matrix4.identity();
		
		var scale       = x3dom.matrix4.scale(this.m_vScale[0], this.m_vScale[1], this.m_vScale[2]);
		var rotationX   = x3dom.matrix4.rotateX(this.m_vRotation[0]);
		var rotationY   = x3dom.matrix4.rotateY(this.m_vRotation[1]);
		var rotationZ   = x3dom.matrix4.rotateZ(this.m_vRotation[2]);
		var translation = x3dom.matrix4.translate(this.m_vTranslation[0], this.m_vTranslation[1], this.m_vTranslation[2]);
		
		result = x3dom.matrix4.mul(scale, rotationX);
		result = x3dom.matrix4.mul(result, rotationY);
		result = x3dom.matrix4.mul(result, rotationZ);
		result = x3dom.matrix4.mul(result, translation);
		
		this.m_matMeshMatrix = result;
	}
	
	this.translate = function(vec3)
	{
		this.m_vTranslation = vec3;
	}
	
	this.rotate = function(vec3)
	{
		this.m_vRotation = vec3;
	}
	
	this.scale = function(vec3)
	{
		this.m_vScale = vec3;
	}
	
	this.setVertices = function(vertices)
	{
		this.m_fVertices = vertices;
	}
	this.getVertices = function()
	{
		return this.m_fVertices;
	}
	
	this.setIndices = function(indices)
	{
		this.m_uiIndices = indices;
	}
	this.getIndices = function()
	{
		return this.m_uiIndices;
	}
	
	this.setNormals = function(normals)
	{
		this.m_fNormals = normals;
	}
	this.getNormals = function()
	{
		return this.m_fNormals;
	}
	
	this.setTexCoords = function(texCoords)
	{
		this.m_fTexCoords = texCoords;
	}
	this.getTexCoords = function()
	{
		return this.m_fTexCoords;
	}
}