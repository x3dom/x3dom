var gCanvas;
var gl;
var note;

var fs = -1;
var vs = -1;
var sp = -1;

var Manipulator;

var X3D = new X3D();
var Scene = new Scene();
var Background = new Background();
Scene.addChildren(Background);
X3D.Scene = Scene;



function getShader(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript)
        return null;

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, 0x8B81 /*gl.COMPILE_STATUS*/) != 1) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var count = 0;

function handleLoad() {
	
	x3dom.debug.enable();
	x3dom.debug.info("Test Info");
	x3dom.debug.warning("Test Warning");
	x3dom.debug.error("Test Error");
	
    gCanvas = document.getElementById("canvas");
    gl = gCanvas.getContext("moz-glweb20");

    if (fs == -1) {
        fs = getShader("shader-fs");
        vs = getShader("shader-vs");

        sp = gl.createProgram();
        gl.attachShader(sp, vs);
        gl.attachShader(sp, fs);

        gl.linkProgram(sp);

        if (gl.getProgramParameter(sp, 0x8B82 /*gl.LINK_STATUS*/) != 1) {
            alert(gl.getProgramInfoLog(shader));
        }

        gl.useProgram(sp);
    }

    var va = gl.getAttribLocation(sp, "Vertex");
    var na = gl.getAttribLocation(sp, "Normal");
    var ca = gl.getAttribLocation(sp, "InColor");

    var mvUniform = gl.getUniformLocation(sp, "MVMatrix");
    var pmUniform = gl.getUniformLocation(sp, "PMatrix");
	var nmUniform = gl.getUniformLocation(sp, "NMatrix");
	
	var lightPosUniform = gl.getUniformLocation(sp, "LightPos"); 
	
	var camera = new x3dom.Camera();
	var mesh = new x3dom.Mesh();
	mesh.setVertices(vertices);
	mesh.setIndices(indices);
	mesh.setNormals(normals);

    if (va != -1) {
        gl.vertexAttribPointer(va, 3, gl.FLOAT, false, 0, mesh.getVertices());
        gl.enableVertexAttribArray(va);
    }

    if (na != -1) {
        gl.vertexAttribPointer(na, 3, gl.FLOAT, false, 0, mesh.getNormals());
        gl.enableVertexAttribArray(na);
    }

	var rotZ = 0.0;
	
	

	var redraw = function () {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);

		
		
		var matView = camera.getViewMatrix();
		var matProj = camera.getProjMatrix();
		
		var matMesh = x3dom.matrix4.identity();
		
		matMesh = x3dom.matrix4.rotateX(rotZ);
		matView = x3dom.matrix4.mul(matMesh, matView);
		var matNorm = x3dom.matrix4.transpose( x3dom.matrix4.inverse(matView) );
		
		 
		gl.uniformMatrix4fv(mvUniform, matView);
		gl.uniformMatrix4fv(pmUniform, matProj);
		gl.uniformMatrix4fv(nmUniform, matNorm);
		
		gl.uniform4fv(lightPosUniform, [3.0, 3.0, 3.0, 1.0]);
		
        //var matViewProj = x3dom.matrix4.mul(matView, matProj);
		//gl.uniformMatrix4fv(mvpUniform, matViewProj);

	// do the draw
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, indices);
        gl.swapBuffers();
		
		rotZ += 1.0;
		
        count++;
        if (count < 1)
            setTimeout(redraw, 100);
    }

    //Manipulator = new OrbitManipulator(gCanvas, gl, redraw);
	//redraw($M.I(4));
	
	var intervallID = setInterval(redraw, 25);
}

window.addEventListener("load", handleLoad, false);
