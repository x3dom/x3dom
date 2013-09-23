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
                    //image geometry
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
                    //pop geometry
                    "uniform float popGeometry;\n" +
                    "uniform float PG_precisionLevel;\n" +
                    "uniform float PG_powPrecision;\n" +
                    "uniform vec3 PG_maxBBSize;\n" +
                    "uniform vec3 PG_bbMin;\n" +
                    "uniform vec3 PG_bbMaxModF;\n" +
                    "uniform vec3 PG_bboxShiftVec;\n" +
                    "uniform float PG_numAnchorVertices;\n" +

					"void main(void) {\n" +
					"   gl_PointSize = 2.0;\n" +
                    "   vec3 pos;\n" +
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
					"		pos = texture2D( IG_coordinateTexture, IG_texCoord ).rgb;\n" +
					"	 	pos = pos * (IG_bboxMax - IG_bboxMin) + IG_bboxMin;\n" +
                    "	} else if (popGeometry != 0.0) {\n" +
                    "		pos = position;\n" +
                    "		vec3 offsetVec = step(pos / bgPrecisionMax, PG_bbMaxModF) * PG_bboxShiftVec;\n" +
                    "		if (PG_precisionLevel <= 2.0) {\n" +
                    "   		pos = floor(pos / PG_powPrecision) * PG_powPrecision;\n" +
                    "   		pos /= (65536.0 - PG_powPrecision);\n" +
                    "		}\n" +
                    "		else {\n" +
                    "   		pos /= bgPrecisionMax;\n" +
                    "		}\n" +
                    "		pos = (pos + offsetVec + PG_bbMin) * PG_maxBBSize;\n" +
					"	} else {\n" +
					"		pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
					"	}\n" +
                    "	worldCoord = (modelMatrix * vec4(pos, 1.0)).xyz - from;\n" +
                    "	gl_Position = modelViewProjectionMatrix * vec4(pos, 1.0);\n" +
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
                    //pop geometry
                    "uniform float popGeometry;\n" +
                    "uniform float PG_precisionLevel;\n" +
                    "uniform float PG_powPrecision;\n" +
                    "uniform vec3 PG_maxBBSize;\n" +
                    "uniform vec3 PG_bbMin;\n" +
                    "uniform vec3 PG_bbMaxModF;\n" +
                    "uniform vec3 PG_bboxShiftVec;\n" +
                    "uniform float PG_numAnchorVertices;\n" +
                    
                    "void main(void) {\n" +
                    "    gl_PointSize = 2.0;\n" +
                    "    vec3 pos;\n" +
					"    if (writeShadowIDs > 0.0) {\n" +
					"	    idCoord = vec2((texcoord.x + writeShadowIDs) / 256.0);\n" +
    				"       idCoord.x = floor(idCoord.x) / 255.0;\n" +
    				"       idCoord.y = fract(idCoord.y) * 1.00392156862745;\n" +
					"	 }\n" +
                    "	 if (popGeometry != 0.0) {\n" +
                    "		pos = position;\n" +
                    "		vec3 offsetVec = step(pos / bgPrecisionMax, PG_bbMaxModF) * PG_bboxShiftVec;\n" +
                    "		if (PG_precisionLevel <= 2.0) {\n" +
                    "   		pos = floor(pos / PG_powPrecision) * PG_powPrecision;\n" +
                    "   		pos /= (65536.0 - PG_powPrecision);\n" +
                    "		}\n" +
                    "		else {\n" +
                    "   		pos /= bgPrecisionMax;\n" +
                    "		}\n" +
                    "		pos = (pos + offsetVec + PG_bbMin) * PG_maxBBSize;\n" +
                    "	 } else {\n" +
                    "       pos = bgCenter + bgSize * position / bgPrecisionMax;\n" +
                    "	 }\n" +
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
  var shader = "#ifdef GL_FRAGMENT_PRECISION_HIGH\n";
  shader += "precision highp float;\n";
  shader += "#else\n";
  shader += " precision mediump float;\n";
  shader += "#endif\n\n";

	shader += "uniform float writeShadowIDs;\n" +
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
