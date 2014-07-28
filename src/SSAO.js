x3dom.SSAO = {};
x3dom.SSAO.isEnabled = function(scene){return scene._vf.SSAO};

/**
 * Reinitializes the shaders if they were not created yet or need to be updated.
 */
x3dom.SSAO.reinitializeShadersIfNecessary = function(gl){
	if(x3dom.SSAO.shaderProgram === undefined){
		x3dom.SSAO.shaderProgram = x3dom.Utils.wrapProgram(gl, new x3dom.shader.SSAOShader(gl), "ssao");
	}
	if(x3dom.SSAO.blurShaderProgram === undefined){
		x3dom.SSAO.blurShaderProgram = x3dom.Utils.wrapProgram(gl, new x3dom.shader.SSAOBlurShader(gl), "ssao-blur");
	}
};

/**
 * Reinitializes the random Texture if it was not created yet or if it's size changed.
 */
x3dom.SSAO.reinitializeRandomTextureIfNecessary = function(gl,scene){
	var sizeHasChanged = scene._vf.SSAOrandomTextureSize != x3dom.SSAO.currentRandomTextureSize;

	if(x3dom.SSAO.randomTexture === undefined){
		//create random texture
		x3dom.SSAO.randomTexture = gl.createTexture();
	}

	if(x3dom.SSAO.randomTexture === undefined || sizeHasChanged){
		gl.bindTexture(gl.TEXTURE_2D,x3dom.SSAO.randomTexture);
		var rTexSize = x3dom.SSAO.currentRandomTextureSize = scene._vf.SSAOrandomTextureSize;
		var randomImageBuffer = new ArrayBuffer(rTexSize*rTexSize*4); //rTexSize^2 pixels with 4 bytes each
		var randomImageView = Uint8Array(randomImageBuffer);
		//fill the image with random unit Vectors:
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
	}
};

/**
 * Reinitializes the FBO render target for the SSAO if it wasn't created yet or if the canvas size changed.
 */
x3dom.SSAO.reinitializeFBOIfNecessary = function(gl,canvas){

	var dimensionsHaveChanged =
		x3dom.SSAO.currentFBOWidth != canvas.width || 
		x3dom.SSAO.currentFBOHeight != canvas.height;

	if(x3dom.SSAO.fbo === undefined || dimensionsHaveChanged)
	{
		x3dom.SSAO.currentFBOWidth = canvas.width;
		x3dom.SSAO.currentFBOHeight = canvas.height;
		var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
		if(x3dom.SSAO.fbo === undefined){
			//create framebuffer
			x3dom.SSAO.fbo = gl.createFramebuffer();
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, x3dom.SSAO.fbo);
		if(x3dom.SSAO.fbotex === undefined){
			//create render texture
			x3dom.SSAO.fbotex = gl.createTexture();
		}
		gl.bindTexture(gl.TEXTURE_2D,x3dom.SSAO.fbotex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,x3dom.SSAO.currentFBOWidth,
			x3dom.SSAO.currentFBOHeight,0, gl.RGBA,gl.UNSIGNED_BYTE, null);
		gl.bindTexture(gl.TEXTURE_2D,null);
		gl.framebufferTexture2D(gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			x3dom.SSAO.fbotex,
			0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);
	}
};


x3dom.SSAO.render = function(stateManager,gl,scene,tex,canvas,fbo) {
	//save previous fbo
	var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	}
	
	stateManager.frontFace(gl.CCW);
	stateManager.disable(gl.CULL_FACE);
	stateManager.disable(gl.DEPTH_TEST);
	
	var sp = x3dom.SSAO.shaderProgram;
	
	stateManager.useProgram(sp);

	//set up uniforms
	sp.depthTexture = 0;
	sp.randomTexture = 1;
	sp.radius = scene._vf.SSAOradius;
	sp.randomTextureTilingFactor = [canvas.width/x3dom.SSAO.currentRandomTextureSize,canvas.height/x3dom.SSAO.currentRandomTextureSize];

	var viewpoint = scene.getViewpoint();
	sp.nearPlane = viewpoint.getNear();
	sp.farPlane = viewpoint.getFar();

	if (!sp.tex) {
		sp.tex = 0;
	}

	//depth texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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
	
	//restore prevoius fbo
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);
	}
};

x3dom.SSAO.blur = function(stateManager,gl,scene,tex,depthTex,canvas,fbo) {

	//save previous fbo
	var oldfbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	}

	stateManager.frontFace(gl.CCW);
	stateManager.disable(gl.CULL_FACE);
	stateManager.disable(gl.DEPTH_TEST);
	
	var sp = x3dom.SSAO.blurShaderProgram;
	
	stateManager.useProgram(sp);

	sp.SSAOTexture = 0;
	sp.depthTexture = 1;

	var viewpoint = scene.getViewpoint();
	sp.nearPlane = viewpoint.getNear();
	sp.farPlane = viewpoint.getFar();

	if (!sp.tex) {
		sp.tex = 0;
	}

	//ssao texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	//depth texture
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTex);

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
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	//restore previous fbo
	if(fbo != null){
		gl.bindFramebuffer(gl.FRAMEBUFFER, oldfbo);
	}
}

x3dom.SSAO.renderSSAO =
function(stateManager, gl, scene, canvas) {

	//set up resources if they are non-existent or if they are outdated:
	this.reinitializeShadersIfNecessary(gl);
	this.reinitializeRandomTextureIfNecessary(gl,scene);
	this.reinitializeFBOIfNecessary(gl,canvas);

	//render depth buffer to scene:
	//scene._webgl.fboScene contains screen-space coordinates. This means that the blue component is the depth (z/w) value.
		
	stateManager.viewport(0,0,canvas.width, canvas.height);
    //scene._fgnd._webgl.render(gl, scene._webgl.fboScene.tex);

    //render SSAO into fbo
    this.render(stateManager,gl, scene, scene._webgl.fboScene.tex,canvas,x3dom.SSAO.fbo);
    //render blurred SSAO multiplicatively
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    this.blur(stateManager,gl, scene, x3dom.SSAO.fbotex,scene._webgl.fboScene.tex,canvas,/*x3dom.SSAO.fbo*/null);		
    gl.disable(gl.BLEND);
};
