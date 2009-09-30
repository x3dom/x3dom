x3dom.Camera = function()
{
	
	this.m_vPosition = [0.0, 0.0, 5.0];
	this.m_vLookAt   = [0.0, 0.0, 0.0];
	this.m_vUpVector = [0.0, 1.0, 0.0];
	this.m_vViewdir  = [0.0, 0.0, -1.0];
	
	this.m_matViewMatrix = x3dom.matrix4.lookAtRH(this.m_vPosition, this.m_vLookAt, this.m_vUpVector);
	this.m_matProjMatrix = x3dom.matrix4.perspectiveFovRH(Math.PI/4, 1.0, 0.1, 8000.0);
		
	this.getViewMatrix = function()
	{
		return this.m_matViewMatrix;
	}
	
	this.getProjMatrix = function()
	{
		return this.m_matProjMatrix;
	}
	
}

x3dom.Camera.m_vPosition = [0.0, 0.0, 5.0];
x3dom.Camera.m_vLookAt   = [0.0, 0.0, 0.0];
x3dom.Camera.m_vUpVector = [0.0, 1.0, 0.0];
x3dom.Camera.m_vViewdir  = [0.0, 0.0, -1.0];
x3dom.Camera.m_matViewMatrix = x3dom.matrix4.lookAtRH(x3dom.Camera.m_vPosition, x3dom.Camera.m_vLookAt, x3dom.Camera.m_vUpVector);
x3dom.Camera.m_matProjMatrix = x3dom.matrix4.perspectiveFovRH(Math.PI/4, 1.0, 0.1, 8000.0);
x3dom.Camera.getViewMatrix = function()
	{
		return x3dom.Camera.m_matViewMatrix = x3dom.matrix4.lookAtRH(x3dom.Camera.m_vPosition, x3dom.Camera.m_vLookAt, x3dom.Camera.m_vUpVector);
	}
	
x3dom.Camera.getProjMatrix = function()
	{
		return this.m_matProjMatrix;
	}