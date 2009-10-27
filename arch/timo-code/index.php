<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>X3DOM Tests</title>
<link rel="shortcut icon" href="favicon/favicon.ico">
<link href="css/general.css" rel="stylesheet" type="text/css" />
<script type="text/javascript">var SCRIPT_PATH = 'X3DOM/'</script>
<script type="text/javascript" src="X3DOM/X3DOM_API.js"></script>
<script type="text/javascript" src="js/Cube.js"></script>
<script type="text/javascript" src="js/Main.js"></script>
<script id="shader-fs" type="x-shader/x-fragment">
	varying float intensity;
	varying vec4 FragColor;
	
	void main(void) {
		gl_FragColor = FragColor;
	}
</script>
<script id="shader-vs" type="x-shader/x-vertex">
	attribute vec3 Vertex;
	attribute vec3 Normal; 
	attribute vec4 InColor;

	uniform mat4 PMatrix;
	uniform mat4 MVMatrix;
	uniform mat4 NMatrix;

	uniform vec4 LightPos;
	varying vec4 FragColor;
	
	varying vec4 diffuse,ambientGlobal, ambient;
	varying vec3 normal,lightDir,halfVector;
	varying float dist;

	
	void main(void) {
		
		mat3 normalMatrix3x3 = mat3(NMatrix[0][0],NMatrix[0][1],NMatrix[0][2],NMatrix[1][0],NMatrix[1][1],NMatrix[1][2],NMatrix[2][0],NMatrix[2][1],NMatrix[2][2]);
		vec3 transformNormal = normalize(normalMatrix3x3 * Normal);
		
		vec4 ambient = vec4(0.0, 0.0, 0.0, 1.0); 
		vec4 diffuse = vec4(0.4, 0.6, 0.8, 1.0);
		vec4 lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
		vec4 lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
		vec4 ambientLightColor = vec4(0.0, 0.0, 0.0, 1.0);
		
		vec4 ecPos4 = MVMatrix * vec4(Vertex,1.0);
		vec3 ecPos = (vec3(ecPos4))/ecPos4.w;
			
		vec3 VP = vec3(LightPos) - ecPos;
		float d = length(VP);
		VP = normalize(VP);
		
		float attenuation = 1.0 / (0.5 + (0.5 * d) + (0.5 * d * d));
		float nDotVP = max(0.0, dot(transformNormal, VP));
		
		ambient += lightAmbient * attenuation;
		diffuse += lightDiffuse * nDotVP * attenuation;
		
		FragColor = ambient + diffuse + ambientLightColor;
		gl_Position =  PMatrix * MVMatrix * vec4(Vertex, 1.0);
	}
</script>
</head>

<body>
<div class="CanvasContainer">
	<canvas id="canvas" width="500" height="500"></canvas>
</div>
</body>
</html>