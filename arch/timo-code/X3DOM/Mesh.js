function Mesh() {
	this.m_matMeshMatrix = Matrix.I(4);
	this.m_vScale		 = $V([1.0, 1.0, 1.0]);
	this.m_vPosition	 = $V([0.0, 0.0, 0.0]);
	this.m_vRotation 	 = $V([0.0, 0.0, 0.0]);
	
	this.m_fVertices	 = new Array();
	this.m_fNormals 	 = new Array();
	this.m_uiIndices	 = new Array();
	this.m_fColor		 = new Array();
	
	this.va = -1;
	this.na = -1;
	this.ca = -1;
	this.mvUniform = -1;
	this.pmUniform = -1;
	this.nmUniform = -1;
}

function getShader(id, gl) {
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

Mesh.prototype.helper = function(gl) {
	
	var fs = getShader("shader-fs", gl);
    var vs = getShader("shader-vs", gl);

    var sp = gl.createProgram();
    gl.attachShader(sp, vs);
    gl.attachShader(sp, fs);

    gl.linkProgram(sp);
	
    if (gl.getProgramParameter(sp, 0x8B82 /*gl.LINK_STATUS*/) != 1) {
        alert(gl.getProgramInfoLog(shader));
    }

    gl.useProgram(sp);
	
	
	this.va = gl.getAttribLocation(sp, "Vertex");
    this.na = gl.getAttribLocation(sp, "Normal");
    this.ca = gl.getAttribLocation(sp, "InColor");

    this.mvUniform = gl.getUniformLocation(sp, "MVMatrix");
    this.pmUniform = gl.getUniformLocation(sp, "PMatrix");
    this.nmUniform = gl.getUniformLocation(sp, "NMatrix");

	if (this.va != -1) {
        gl.vertexAttribPointer(this.va, 3, gl.FLOAT, false, 0, this.m_fVertices);
        gl.enableVertexAttribArray(this.va);
    }

    if (this.na != -1) {
        gl.vertexAttribPointer(this.na, 3, gl.FLOAT, false, 0, this.m_fNormals);
        gl.enableVertexAttribArray(this.na);
    }

    if (this.ca != -1) {
        gl.vertexAttribPointer(this.ca, 4, gl.FLOAT, false, 0, this.m_fColor);
        gl.enableVertexAttribArray(this.ca);
    }

}

Mesh.prototype.render = function(gl, cam) {
	
	//this.transform(cam);
	
	gl.uniformMatrix4fv(this.mvUniform, cam.getViewMatrix());
	alert("test03");
    gl.uniformMatrix4fv(this.pmUniform, cam.getProjMatrix().flatten());
	gl.drawElements(gl.TRIANGLES, this.m_uiIndices.length, gl.UNSIGNED_SHORT, this.m_uiIndices);
	
}

Mesh.prototype.transform = function(cam) {
	
	// Skalierungsmatrix erstellen
	var mScale = matrixScaling(this.m_vScale[1], this.m_vScale[2], this.m_vScale[3] );
	// Rotationsmatrix X-Achse erstellen
	var mRotX = matrixRotationX(this.m_vRotation[1]);
	// Rotationsmatrix Y-Achse erstellen
	var mRotY = matrixRotationY(this.m_vRotation[2]);
	// Rotationsmatrix Z-Achse erstellen
	var mRotZ = matrixRotationZ(this.m_vRotation[3]);
	// Translationsmatrix erstellen
	var mTranslate = matrixTranslation(this.m_vPosition[1], this.m_vPosition[2], this.m_vPosition[3]);

	//this.m_matMeshMatrix = mScale.x(mRotX);
	alert(this.m_matMeshMatrix.inspect());
	//this.m_matMeshMatrix = this.m_matMeshMatrix.multiply(mRotZ);
	//this.m_matMeshMatrix = this.m_matMeshMatrix.multiply(mTranslate);

	//this.m_matMeshMatrix.multiply(cam.getViewMatrix());
	
}

Mesh.prototype.fillMesh = function() {
	vertices = [  0.5, -0.5,  0.5, // +X
                  0.5, -0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5,  0.5,  0.5,

                  0.5,  0.5,  0.5, // +Y
                  0.5,  0.5, -0.5,
                 -0.5,  0.5, -0.5,
                 -0.5,  0.5,  0.5,

                  0.5,  0.5,  0.5, // +Z
                 -0.5,  0.5,  0.5,
                 -0.5, -0.5,  0.5,
                  0.5, -0.5,  0.5,

                 -0.5, -0.5,  0.5, // -X
                 -0.5,  0.5,  0.5,
                 -0.5,  0.5, -0.5,
                 -0.5, -0.5, -0.5,

                 -0.5, -0.5,  0.5, // -Y
                 -0.5, -0.5, -0.5,
                  0.5, -0.5, -0.5,
                  0.5, -0.5,  0.5,

                 -0.5, -0.5, -0.5, // -Z
                 -0.5,  0.5, -0.5,
                  0.5,  0.5, -0.5,
                  0.5, -0.5, -0.5,
            ];
	this.m_fVertices = vertices;
        normals = [ 1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,

                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,

                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,

                   -1, 0, 0,
                   -1, 0, 0,
                   -1, 0, 0,
                   -1, 0, 0,

                    0,-1, 0,
                    0,-1, 0,
                    0,-1, 0,
                    0,-1, 0,

                    0, 0,-1,
                    0, 0,-1,
                    0, 0,-1,
                    0, 0,-1
            ];
		this.m_fNormals = normals;
		indices = [];
        for (var i = 0; i < 6; i++) {
            indices.push(i*4 + 0);
            indices.push(i*4 + 1);
            indices.push(i*4 + 3);
            indices.push(i*4 + 1);
            indices.push(i*4 + 2);
            indices.push(i*4 + 3);
        }
		this.m_uiIndices = indices;
		var color = [];
    	for (var i = 0; i < vertices.length/3; i++) {
        	color.push(Math.random(1.0));
        	color.push(Math.random(1.0));
        	color.push(Math.random(1.0));
        	color.push(1.0);
    	}
		this.m_fColor = color;
}

