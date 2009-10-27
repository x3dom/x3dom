function Camera() {
	this.m_vPosition = $V([0.0, -8.0, 0.0]);
	this.m_vLookAt   = $V([0.0, 0.0, 0.0]);
	this.m_vUpVec	 = $V([0.0, 1.0, 0.0]);
	
	this.m_matViewMatrix = getLookAtMatrixLH(this.m_vPosition, this.m_vLookAt, this.m_vUpVec);
	this.m_matProjMatrix = getPerspectiveFovLH(0.793, 1.0, 0.1, 100.0);
}
Camera.prototype.update = function() {
	this.m_matViewMatrix = getLookAtMatrixRH(this.m_vPosition, this.m_vLookAt, this.m_vUpVec);
}
Camera.prototype.getViewMatrix = function() {
	return this.m_matViewMatrix;
}
Camera.prototype.getProjMatrix = function() {
	return this.m_matProjMatrix;
}