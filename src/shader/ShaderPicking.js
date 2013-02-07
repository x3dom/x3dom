/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Generate the final Shader program
 */
x3dom.shader.PickingShader = function(gl)
{
	this.program = gl.createProgram();
	
	var vertexShader   = this.generateVertexShader(gl);
	var fragmentShader = this.generateFragmentShader(gl);
	
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
x3dom.shader.PickingShader.prototype.generateVertexShader = function(gl)
{
	var shader = "";

    if (!x3dom.caps.MOBILE) {
        shader =    "attribute vec3 position;\n" +
                    "attribute vec2 texcoord;\n" +
					"uniform vec3 bgCenter;\n" +
					"uniform vec3 bgSize;\n" +
					"uniform float bgPrecisionMax;\n" +
					"uniform mat4 modelMatrix;\n" +
					"uniform mat4 modelViewProjectionMatrix;\n" +
					"uniform vec3 from;\n" +
					"varying vec3 worldCoord;\n" +
					"varying vec2 idCoord;\n" +
					"uniform float writeShadowIDs;\n" +
					"uniform float imageGeometry;\n" +
					"uniform vec3 IG_bboxMin;\n" +
					"uniform vec3 IG_bboxMax;\n" +
					"uniform float IG_coordTextureWidth;\n" +
					"uniform float IG_coordTextureHeight;\n" +
					"uniform float IG_indexTextureWidth;\n" +
					"uniform float IG_indexTextureHeight;\n" +
					"uniform sampler2D IG_indexTexture;\n" +
					"uniform sampler2D IG_coordinateTexture;\n" +
					"uniform vec2 IG_implicitMeshSize;\n" +
					
					"void main(void) {\n" +
					"   if (writeShadowIDs > 0.0) {\n" +
					"	    idCoord = vec2((texcoord.x + writeShadowIDs) / 256.0);\n" +
    				"       idCoord.x = floor(idCoord.x) / 255.0;\n" +
    				"       idCoord.y = fract(idCoord.y) * 1.00392156862745;\n" +
					"	}\n" +
					"	if (imageGeometry != 0.0) {\n" +
					"		vec2 IG_texCoord;\n" +
					"		if(imageGeometry == 1.0) {\n" +
					"			vec2 halfPixel = vec2(0.5/IG_indexTextureWidth,0.5/IG_indexTextureHeight);\n" +
					"			IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_indexTextureWidth), position.y*(IG_implicitMeshSize.y/IG_indexTextureHeight)) + halfPixel;\n" +
					"			vec2 IG_index = texture2D( IG_indexTexture, IG_texCoord ).rg;\n" + 
					"			IG_texCoord = IG_index * 0.996108948;\n" +
					"		} else {\n" +
					"			vec2 halfPixel = vec2(0.5/IG_coordTextureWidth, 0.5/IG_coordTextureHeight);\n" +
					"			IG_texCoord = vec2(position.x*(IG_implicitMeshSize.x/IG_coordTextureWidth), position.y*(IG_implicitMeshSize.y/IG_coordTextureHeight)) + halfPixel;\n" +
					"		}\n" +
					"		vec3 pos = texture2D( IG_coordinateTexture, IG_texCoord ).rgb;\n" +
					"	 	pos = pos * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n" +
					"    	worldCoord = (modelMatrix * vec4(pos, 1.0)).xyz - from;\n" +
					"		gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
					"	} else {\n" +
					"		vec3 pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
					"		worldCoord = (modelMatrix * vec4(pos, 1.0)).xyz - from;\n" +
					"		gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
					"	}\n" +
					"}\n";
    }
    else {
        shader =    "attribute vec3 position;\n" +
                    "attribute vec2 texcoord;\n" +
                    "uniform vec3 bgCenter;\n" +
                    "uniform vec3 bgSize;\n" +
                    "uniform float bgPrecisionMax;\n" +
					"uniform float writeShadowIDs;\n" +
                    "uniform mat4 modelMatrix;\n" +
                    "uniform mat4 modelViewProjectionMatrix;\n" +
                    "uniform vec3 from;\n" +
                    "varying vec3 worldCoord;\n" +
                    "varying vec2 idCoord;\n" +
                    
                    "void main(void) {\n" +
					"    if (writeShadowIDs > 0.0) {\n" +
					"	    idCoord = vec2((texcoord.x + writeShadowIDs) / 256.0);\n" +
    				"       idCoord.x = floor(idCoord.x) / 255.0;\n" +
    				"       idCoord.y = fract(idCoord.y) * 1.00392156862745;\n" +
					"	 }\n" +
                    "    vec3 pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
                    "    worldCoord = (modelMatrix * vec4(pos, 1.0)).xyz - from;\n" +
                    "    gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
                    "}\n";
    }

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
    gl.compileShader(vertexShader);
		
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingShader] VertexShader " + gl.getShaderInfoLog(vertexShader));		
	}
	
	return vertexShader;
};

/**
 * Generate the fragment shader
 */
x3dom.shader.PickingShader.prototype.generateFragmentShader = function(gl)
{
	var shader =	"#ifdef GL_ES\n" +
					"  precision highp float;\n" +
					"#endif\n" +
					"\n" +
					"uniform float writeShadowIDs;\n" +
					"uniform float highBit;\n" +
					"uniform float lowBit;\n" +
					"uniform float sceneSize;\n" +
					"varying vec3 worldCoord;\n" +
					"varying vec2 idCoord;\n" +
					
					"void main(void) {\n" +
					"    vec4 col = vec4(0.0, 0.0, highBit, lowBit);\n" +
					"    if (writeShadowIDs > 0.0) {\n" +
    				"       col.ba = idCoord;\n" +
					"	 }\n" +
					"    float d = length(worldCoord) / sceneSize;\n" +
					"    vec2 comp = fract(d * vec2(256.0, 1.0));\n" +
					"    col.rg = comp - (comp.rr * vec2(0.0, 1.0/256.0));\n" +
					"    gl_FragColor = col;\n" +
					"}\n";

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shader);
    gl.compileShader(fragmentShader);
		
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		x3dom.debug.logError("[PickingShader] FragmentShader " + gl.getShaderInfoLog(fragmentShader));		
	}
	
	return fragmentShader;
};
