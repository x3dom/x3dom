x3dom.SSAO = {};
x3dom.SSAO.isInitialized = false;
x3dom.SSAO.isEnabled = true;
x3dom.SSAO.randomTextureSize = 4;

x3dom.SSAO.initialize = function(gl,canvas) {
	x3dom.SSAO.shaderProgram = x3dom.Utils.wrapProgram(gl, new x3dom.shader.SSAOShader(gl), "ssao");
	x3dom.SSAO.blurShaderProgram = x3dom.Utils.wrapProgram(gl, new x3dom.shader.SSAOBlurShader(gl), "ssao-blur");
	
	//create 4x4 random texture
	x3dom.SSAO.randomTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,x3dom.SSAO.randomTexture);
	var rTexSize = x3dom.SSAO.randomTextureSize;
	var randomImageBuffer = new ArrayBuffer(rTexSize*rTexSize*4); //4x4 pixels with 4 bytes each
	var randomImageView = Uint8Array(randomImageBuffer);
	for(var i = 0; i<rTexSize*rTexSize;++i){
		var x = Math.random()*2.0-1.0;
		var y = Math.random()*2.0-1.0;
		var z = Math.random()*2.0-1.0;
		var length = Math.sqrt(x*x+y*y+z*z);
		x /=length;
		y /=length;
		z /=length;
		randomImageView[4*i] = (x+1.0)*0.5*255.0;
		randomImageView[4*i+1] = (y+1.0)*0.5*255.0;
		randomImageView[4*i+2] = (z+1.0)*0.5*255.0;
		randomImageView[4*i+3] = 255;
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,rTexSize,rTexSize,0, gl.RGBA,gl.UNSIGNED_BYTE, randomImageView);
	gl.bindTexture(gl.TEXTURE_2D,null);

	//create framebuffer texture
var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	x3dom.SSAO.fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, x3dom.SSAO.fbo);
	x3dom.SSAO.fbotex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,x3dom.SSAO.fbotex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,canvas.width,canvas.height,0, gl.RGBA,gl.UNSIGNED_BYTE, null);
	gl.bindTexture(gl.TEXTURE_2D,null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER,
                       gl.COLOR_ATTACHMENT0,
                       gl.TEXTURE_2D,
                       x3dom.SSAO.fbotex,
                       0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);


	console.log("initialized SSAO");
	x3dom.SSAO.isInitialized = true;
};

x3dom.SSAO.render = function(stateManager,gl,scene,tex,canvas,fbo) {

	var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	}
	
	stateManager.frontFace(gl.CCW);
	stateManager.disable(gl.CULL_FACE);
	stateManager.disable(gl.DEPTH_TEST);
	
	var sp = x3dom.SSAO.shaderProgram;
	
	stateManager.useProgram(sp);

	gl.uniform1i(sp.program.depthTextureLocation,0);
	gl.uniform1i(sp.program.randomTextureLocation,1);
	gl.uniform2f(sp.program.randomTextureTilingFactorLocation,canvas.width/x3dom.SSAO.randomTextureSize,canvas.height/x3dom.SSAO.randomTextureSize);

	if (!sp.tex) {
		sp.tex = 0;
	}

	//this.stateManager.enable(gl.TEXTURE_2D);
	//depth texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	//random texture:
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, x3dom.SSAO.randomTexture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene._fgnd._webgl.buffers[0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, scene._fgnd._webgl.buffers[1]);
	gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(sp.position);

	gl.drawElements(scene._fgnd._webgl.primType, scene._fgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);

	gl.disableVertexAttribArray(sp.position);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, null);
	//this.stateManager.disable(gl.TEXTURE_2D);
	
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);
	}
};

x3dom.SSAO.blur = function(stateManager,gl,scene,tex,canvas,fbo) {

	var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	}

	stateManager.frontFace(gl.CCW);
	stateManager.disable(gl.CULL_FACE);
	stateManager.disable(gl.DEPTH_TEST);
	
	var sp = x3dom.SSAO.blurShaderProgram;
	
	stateManager.useProgram(sp);

	if (!sp.tex) {
		sp.tex = 0;
	}

	//this.stateManager.enable(gl.TEXTURE_2D);
	//ssao texture
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

	gl.bindTexture(gl.TEXTURE_2D, null);
	
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);
	}
}

x3dom.SSAO.renderSSAO =
	function(stateManager, gl, scene, canvas) {
		if(!this.isInitialized) {
			this.initialize(gl,canvas);
		}
			
			//render depth buffer to scene:
			//scene._webgl.fboScene contains screen-space coordinates. This means that the blue component is the depth (z) value.
			
			stateManager.viewport(0,0,canvas.width, canvas.height);
            //scene._fgnd._webgl.render(gl, scene._webgl.fboScene.tex);

            this.render(stateManager,gl, scene, scene._webgl.fboScene.tex,canvas,x3dom.SSAO.fbo);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
	    this.blur(stateManager,gl, scene, x3dom.SSAO.fbotex,canvas,/*x3dom.SSAO.fbo*/null);		
	gl.disable(gl.BLEND);
	};
