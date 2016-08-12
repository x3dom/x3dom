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

/**
 * Generate the final ShadowShader program
 */
x3dom.shader.DynamicShadowShader = function(gl, properties)
{
	this.program = gl.createProgram();
	
	var vertexShader 	= this.generateVertexShader(gl, properties);
	var fragmentShader 	= this.generateFragmentShader(gl, properties);
	
	gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    
    // optional, but position should be at location 0 for performance reasons
    gl.bindAttribLocation(this.program, 0, "position");
    
	gl.linkProgram(this.program);
	
	return this.program;
};

/**
 * Generate the vertex shader
 */
x3dom.shader.DynamicShadowShader.prototype.generateVertexShader = function(gl, properties)
{
	var shader = "";

	//Shadow stuff
	shader += "attribute vec3 position;\n";
	shader += "uniform mat4 modelViewProjectionMatrix;\n";
	shader += "varying vec4 projCoords;\n";

	//ShadowID stuff
	if(properties.VERTEXID) {
		shader += "varying float fragID;\n";
		shader += "attribute float id;\n";
	}

	//Bounding stuff
	if(properties.REQUIREBBOX) {
		shader += "uniform vec3 bgCenter;\n";
		shader += "uniform vec3 bgSize;\n";
		shader += "uniform float bgPrecisionMax;\n";
	}

	//ImageGeometry stuff
	if(properties.IMAGEGEOMETRY) {
		shader += "uniform vec3 IG_bboxMin;\n";
		shader += "uniform vec3 IG_bboxMax;\n";
		shader += "uniform float IG_coordTextureWidth;\n";
		shader += "uniform float IG_coordTextureHeight;\n";
		shader += "uniform vec2 IG_implicitMeshSize;\n";

		for( var i = 0; i < properties.IG_PRECISION; i++ ) {
			shader += "uniform sampler2D IG_coords" + i + "\n;";
		}

		if(properties.IG_INDEXED) {
			shader += "uniform sampler2D IG_index;\n";
			shader += "uniform float IG_indexTextureWidth;\n";
			shader += "uniform float IG_indexTextureHeight;\n";
		}
	}

	//PopGeometry stuff
	if (properties.POPGEOMETRY) {
		shader += "uniform float PG_precisionLevel;\n";
		shader += "uniform float PG_powPrecision;\n";
		shader += "uniform vec3 PG_maxBBSize;\n";
		shader += "uniform vec3 PG_bbMin;\n";
		shader += "uniform vec3 PG_bbMaxModF;\n";
		shader += "uniform vec3 PG_bboxShiftVec;\n";
		shader += "uniform float PG_numAnchorVertices;\n";
		shader += "attribute float PG_vertexID;\n";
	}

	//ClipPlane stuff
	if(properties.CLIPPLANES) {
		shader += "uniform mat4 modelViewMatrix;\n";
		shader += "varying vec4 fragPosition;\n";
	}

	/*******************************************************************************
	 * Generate main function
	 ********************************************************************************/
	shader += "void main(void) {\n";
	shader += "    vec3 pos = position;\n";

	/*******************************************************************************
	 * Start of special Geometry switch
	 ********************************************************************************/
	if(properties.IMAGEGEOMETRY) { //ImageGeometry
		if(properties.IG_INDEXED) {
			shader += "    vec2 halfPixel = vec2(0.5/IG_indexTextureWidth,0.5/IG_indexTextureHeight);\n";
			shader += "    vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_indexTextureWidth), position.y*(IG_implicitMeshSize.y/IG_indexTextureHeight)) + halfPixel;\n";
			shader += "    vec2 IG_indices = texture2D( IG_index, IG_texCoord ).rg;\n";
			shader += "    halfPixel = vec2(0.5/IG_coordTextureWidth,0.5/IG_coordTextureHeight);\n";
			shader += "    IG_texCoord = (IG_indices * 0.996108948) + halfPixel;\n";
		} else {
			shader += "    vec2 halfPixel = vec2(0.5/IG_coordTextureWidth, 0.5/IG_coordTextureHeight);\n";
			shader += "    vec2 IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_coordTextureWidth), position.y*(IG_implicitMeshSize.y/IG_coordTextureHeight)) + halfPixel;\n";
		}

		shader += "    pos = texture2D( IG_coordinateTexture, IG_texCoord ).rgb;\n";
		shader += "    pos = pos * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n";
	} else if (properties.POPGEOMETRY) { //PopGeometry
		shader += "    vec3 offsetVec = step(pos / bgPrecisionMax, PG_bbMaxModF) * PG_bboxShiftVec;\n";
		shader += "    if (PG_precisionLevel <= 2.0) {\n";
		shader += "        pos = floor(pos / PG_powPrecision) * PG_powPrecision;\n";
		shader += "        pos /= (65536.0 - PG_powPrecision);\n";
		shader += "    }\n";
		shader += "    else {\n";
		shader += "        pos /= bgPrecisionMax;\n";
		shader += "    }\n";
		shader += "    pos = (pos + offsetVec + PG_bbMin) * PG_maxBBSize;\n";
	} else {
		if(properties.REQUIREBBOX) {
			shader += "    pos = bgCenter + bgSize * pos / bgPrecisionMax;\n";
		}
	}

	if(properties.VERTEXID) {
		shader += "    fragID = id;\n";
	}

	if(properties.CLIPPLANES) {
		shader += "    fragPosition = (modelViewMatrix * vec4(pos, 1.0));\n";
	}

	shader += "    projCoords = modelViewProjectionMatrix * vec4(pos, 1.0);\n";
	shader += "    gl_Position = projCoords;\n";

	shader += "}\n";

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ShadowShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.DynamicShadowShader.prototype.generateFragmentShader = function(gl, properties)
{
	var shader = "";

	shader += "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
    shader += "    precision highp float;\n";
    shader += "#else\n";
    shader += "    precision mediump float;\n";
    shader += "#endif\n\n";

	//Shadow stuff
	shader += "varying vec4 projCoords;\n";
	shader += "uniform float offset;\n";
	shader += "uniform bool cameraView;\n";

	//ShadowID stuff
	if(properties.VERTEXID) {
		shader += "varying float fragID;\n";
	}

	if (properties.MULTIVISMAP) {
		shader += "uniform sampler2D multiVisibilityMap;\n";
		shader += "uniform float multiVisibilityWidth;\n";
		shader += "uniform float multiVisibilityHeight;\n";
	}

	//ClipPlane stuff
	if(properties.CLIPPLANES) {
		shader += "uniform mat4 viewMatrixInverse;\n";
		shader += "varying vec4 fragPosition;\n";
		shader += x3dom.shader.clipPlanes(properties.CLIPPLANES);
	}

	//Import RGBA Packing stuff if FloatingPoint textures are not supported
	if(!x3dom.caps.FP_TEXTURES) {
		shader += x3dom.shader.rgbaPacking();
	}

	/*******************************************************************************
	 * Generate main function
	 ********************************************************************************/

	shader += "void main(void) {\n";

	if(properties.CLIPPLANES)
	{
		shader += "calculateClipPlanes();\n";
	}

	if (properties.MULTIVISMAP) {
		shader += "    vec2 idTexCoord;\n";
		shader += "    float roundedID = floor(fragID+0.5);\n";
		shader += "    idTexCoord.x = (mod(roundedID, multiVisibilityWidth)) * (1.0 / multiVisibilityWidth) + (0.5 / multiVisibilityWidth);\n";
		shader += "    idTexCoord.y = (floor(roundedID / multiVisibilityHeight)) * (1.0 / multiVisibilityHeight) + (0.5 / multiVisibilityHeight);\n";
		shader += "    vec4 visibility = texture2D( multiVisibilityMap, idTexCoord );\n";
		shader += "    if (visibility.r < 1.0) discard; \n";
	}

	shader += "    vec3 proj = (projCoords.xyz / projCoords.w);\n";

 	if(!x3dom.caps.FP_TEXTURES) {
		shader += "    gl_FragColor = packDepth(proj.z);\n";
	} else {
		//use variance shadow maps, when not rendering from camera view
		//shader +=	"if (!cameraView) proj.z = exp((1.0-offset)*80.0*proj.z);\n";
		shader += "	   if (!cameraView){\n";
		shader += "		   proj.z = (proj.z + 1.0)*0.5;\n";
		shader += "		   proj.y = proj.z * proj.z;\n";
		shader += "	   }\n";
		shader += "    gl_FragColor = vec4(proj, 1.0);\n";
	}

	shader += "}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[ShadowShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
