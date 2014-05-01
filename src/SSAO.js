x3dom.SSAO = {};
x3dom.SSAO.isInitialized = false;
x3dom.SSAO.isEnabled = true;

x3dom.SSAO.initialize = function(gl) {
	x3dom.SSAO.shaderProgram = x3dom.Utils.wrapProgram(gl, new x3dom.shader.SSAOShader(gl), "ssao");
	isInitialized = true;
};

x3dom.SSAO.render = function(stateManager,gl,scene,tex) {
	
	stateManager.frontFace(gl.CCW);
	stateManager.disable(gl.CULL_FACE);
	stateManager.disable(gl.DEPTH_TEST);
	
	var sp = x3dom.SSAO.shaderProgram;

	stateManager.useProgram(sp);

	if (!sp.tex) {
		sp.tex = 0;
	}

	//this.stateManager.enable(gl.TEXTURE_2D);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene._fgnd._webgl.buffers[0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, scene._fgnd._webgl.buffers[1]);
	gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(sp.position);

	gl.drawElements(scene._fgnd._webgl.primType, scene._fgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

	gl.disableVertexAttribArray(sp.position);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);
	//this.stateManager.disable(gl.TEXTURE_2D);
};

x3dom.SSAO.renderSSAO =
	function(stateManager, gl, scene, canvas) {
		if(!this.isInitialized) {
			this.initialize(gl);
			
			//render depth buffer to scene:
			//scene._webgl.fboScene contains screen-space coordinates. This means that the blue component is the depth (z) value.
			
			stateManager.viewport(0,0,canvas.width, canvas.height);
            //scene._fgnd._webgl.render(gl, scene._webgl.fboScene.tex);
            this.render(stateManager,gl, scene, scene._webgl.fboScene.tex);
		}
		
		
	};
