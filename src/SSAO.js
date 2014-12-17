x3dom.SSAO = {};
x3dom.SSAO.isEnabled = function(scene){return scene.getEnvironment()._vf.SSAO};

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
	var sizeHasChanged = scene.getEnvironment()._vf.SSAOrandomTextureSize != x3dom.SSAO.currentRandomTextureSize;

	if(x3dom.SSAO.randomTexture === undefined){
		//create random texture
		x3dom.SSAO.randomTexture = gl.createTexture();
	}

	if(x3dom.SSAO.randomTexture === undefined || sizeHasChanged){
		gl.bindTexture(gl.TEXTURE_2D,x3dom.SSAO.randomTexture);
		var rTexSize = x3dom.SSAO.currentRandomTextureSize = scene.getEnvironment()._vf.SSAOrandomTextureSize;
		var randomImageBuffer = new ArrayBuffer(rTexSize*rTexSize*4); //rTexSize^2 pixels with 4 bytes each
		var randomImageView = new Uint8Array(randomImageBuffer);
		//fill the image with random unit Vectors in the z-y-plane:
		for(var i = 0; i<rTexSize*rTexSize;++i){
			var x = Math.random()*2.0-1.0;
			var y = Math.random()*2.0-1.0;
			var z = 0;
			var length = Math.sqrt(x*x+y*y+z*z);
			x /=length;
			y /=length;
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

/*
 * Renders a sparsely sampled Screen-Space Ambient Occlusion Factor.
 * @param stateManager x3dom webgl stateManager
 * @param gl WebGL context
 * @param scene Scene Node
 * @param tex depth texture
 * @param canvas Canvas the scene is rendered on (needed for dimensions)
 * @param fbo FrameBufferObject handle that should be used as a target (null to use curent fbo)
 */
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
	sp.radius = scene.getEnvironment()._vf.SSAOradius;
	sp.randomTextureTilingFactor = [canvas.width/x3dom.SSAO.currentRandomTextureSize,canvas.height/x3dom.SSAO.currentRandomTextureSize];

	var viewpoint = scene.getViewpoint();
	var nearPlane = viewpoint.getNear();
	var farPlane = viewpoint.getFar();
	sp.nearPlane = nearPlane;
	sp.farPlane = farPlane;
	sp.depthReconstructionConstantA = (farPlane+nearPlane)/(nearPlane-farPlane);
	sp.depthReconstructionConstantB = (2.0*farPlane*nearPlane)/(nearPlane-farPlane);
	sp.depthBufferEpsilon = 0.0001*(farPlane-nearPlane);
	//16 samples with a well distributed pseudo random opposing-pairs sampling pattern:
	sp.samples = [0.03800223814729654,0.10441029119843426,-0.04479934806797181,
				-0.03800223814729654,-0.10441029119843426,0.04479934806797181,
				-0.17023209847088397,0.1428416910414532,0.6154407640895228,
				0.17023209847088397,-0.1428416910414532,-0.6154407640895228,
				-0.288675134594813,-0.16666666666666646,-0.3774214123135722,
				0.288675134594813,0.16666666666666646,0.3774214123135722,
				0.07717696785196887,-0.43769233467209245,-0.5201284112706428,
				-0.07717696785196887,0.43769233467209245,0.5201284112706428,
				0.5471154183401156,-0.09647120981496134,-0.15886420745887797,
				-0.5471154183401156,0.09647120981496134,0.15886420745887797,
				0.3333333333333342,0.5773502691896253,-0.8012446019636266,
				-0.3333333333333342,-0.5773502691896253,0.8012446019636266,
				-0.49994591864508653,0.5958123446480936,-0.15385106176844343,
				0.49994591864508653,-0.5958123446480936,0.15385106176844343,
				-0.8352823295874743,-0.3040179051783715,0.7825440557226517,
				0.8352823295874743,0.3040179051783715,-0.7825440557226517];
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

/**
 * Applies a depth-aware averaging filter.
 * @param stateManager x3dom webgl stateManager
 * @param gl WebGL context
 * @param scene Scene Node
 * @param ssaoTexture texture that contains the SSAO factor
 * @param depthTexture depth texture
 * @param canvas Canvas the scene is rendered on (needed for dimensions)
 * @param fbo FrameBufferObject handle that should be used as a target (null to use curent fbo)
 */
x3dom.SSAO.blur = function(stateManager,gl,scene,ssaoTexture,depthTexture,canvas,fbo) {

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

	sp.depthThreshold = scene.getEnvironment()._vf.SSAOblurDepthTreshold;

	var viewpoint = scene.getViewpoint();
	var nearPlane = viewpoint.getNear();
	var farPlane = viewpoint.getFar();
	sp.nearPlane = nearPlane;
	sp.farPlane = farPlane;
	sp.depthReconstructionConstantA = (farPlane+nearPlane)/(nearPlane-farPlane);
	sp.depthReconstructionConstantB = (2.0*farPlane*nearPlane)/(nearPlane-farPlane);
	sp.pixelSize = [1.0/canvas.width,1.0/canvas.height];
	sp.amount = scene.getEnvironment()._vf.SSAOamount;

	//ssao texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, ssaoTexture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	//depth texture
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);

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
};

/**
 * Renders Screen-Space Ambeint Occlusion multiplicatively on top of the scene.
 * @param stateManager state manager for the WebGL context
 * @param gl WebGL context
 * @param scene current scene
 * @param canvas canvas that the scene is rendered to
 */
x3dom.SSAO.renderSSAO = function(stateManager, gl, scene, canvas) {

	//set up resources if they are non-existent or if they are outdated:
	this.reinitializeShadersIfNecessary(gl);
	this.reinitializeRandomTextureIfNecessary(gl,scene);
	this.reinitializeFBOIfNecessary(gl,canvas);
		
	stateManager.viewport(0,0,canvas.width, canvas.height);

    //render SSAO into fbo
    this.render(stateManager,gl, scene, scene._webgl.fboScene.tex,canvas,x3dom.SSAO.fbo);
    //render blurred SSAO multiplicatively
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    this.blur(stateManager,gl, scene, x3dom.SSAO.fbotex,scene._webgl.fboScene.tex,canvas,null);		
    gl.disable(gl.BLEND);
};
