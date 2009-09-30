var gfx_glweb20 = (function () {

function Context(ctx3d) {
    this.ctx3d = ctx3d;
}

Context.prototype.getName = function() {
    return "moz-glweb20";
}

function setupContext(canvas) {
    try {
        var ctx = canvas.getContext('moz-glweb20');
        if (ctx)
            return new Context(ctx);
    } catch (e) { }
}


function setCamera(fovy, aspect, zfar, znear) {
    var f = 1/Math.tan(fovy/2);
    var m = new SFMatrix4(
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (znear+zfar)/(znear-zfar), 2*znear*zfar/(znear-zfar),
        0, 0, -1, 0
    );
    return m;
};

function wrapShaderProgram(gl, sp) {
    var shader = {};
    for (var i = 0; ; ++i) {
        var obj = gl.getActiveUniform(sp, i);
        if (gl.getError() != 0) break; // XXX: GetProgramiv(ACTIVE_ATTRIBUTES) is not implemented, so just loop until error

        var loc = gl.getUniformLocation(sp, obj.name);
        switch (obj.type) {
            case gl.FLOAT_VEC2:
            case gl.FLOAT_VEC3:
            case gl.FLOAT_VEC4:
                shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformf(loc, val) } })(loc));
                // XXX: no getUniform; can't do __defineGetter__
                break;
            case gl.FLOAT_MAT2:
            case gl.FLOAT_MAT3:
            case gl.FLOAT_MAT4:
                shader.__defineSetter__(obj.name, (function (loc) { return function (val) { gl.uniformMatrix(loc, val) } })(loc));
                break;
            default:
                log('GLSL program variable '+obj.name+' has unknown type '+obj.type);
        }
    }
    for (var i = 0; ; ++i) {
        var obj = gl.getActiveAttrib(sp, i);
        if (gl.getError() != 0) break; // XXX: as above

        var loc = gl.getAttribLocation(sp, obj.name);
        shader[obj.name] = loc;
    }
    return shader;
};


Context.prototype.prepareScene = function (scene) {
    var gl = this.ctx3d;

    var fs = getShader(gl, "shader-fs");
    var vs = getShader(gl, "shader-vs");
    var sp = gl.createProgram();
    gl.attachShader(sp, vs);
    gl.attachShader(sp, fs);
    gl.linkProgram(sp);
    gl.useProgram(sp);
    var msg = gl.getProgramInfoLog(sp);
    if (msg) log(msg);
    scene._glweb20 = {
        program: sp,
        shader: wrapShaderProgram(gl, sp),
    };

    Array.forEach(scene._findAll(X3DShape), function (shape) {
        var coords = shape._geometry._positions;
        var idxs = shape._geometry._indexes;
        var vertFaceNormals = [];
        for (var i = 0; i < coords.length/3; ++i)
            vertFaceNormals[i] = [];

        for (var i = 0; i < idxs.length; i += 3) {
            var a = new SFVec3(coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
              minus(new SFVec3(coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
            var b = new SFVec3(coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
              minus(new SFVec3(coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
            var n = a.cross(b).normalised();
            vertFaceNormals[idxs[i]].push(n);
            vertFaceNormals[idxs[i+1]].push(n);
            vertFaceNormals[idxs[i+2]].push(n);
        }
        var vertNormals = [];
        for (var i = 0; i < coords.length; i += 3) {
            var n = new SFVec3(0, 0, 0);
            for (var j = 0; j < vertFaceNormals[i/3].length; ++j)
                n = n.plus(vertFaceNormals[i/3][j]);
            n = n.normalised();
            vertNormals[i] = n.x;
            vertNormals[i+1] = n.y;
            vertNormals[i+2] = n.z;
        }
        shape._glweb20 = {
            normals: vertNormals,
        };
    });
};

Context.prototype.renderScene = function (scene, t) {
    var gl = this.ctx3d;

    gl.clearColor(1.0, 1.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    var sp = scene._glweb20.shader;

    var mat_projection = setCamera(0.661, 4/3, 100, 0.1);
    var mat_view = scene.getViewMatrix();

    sp.lightPosition = [10*Math.sin(t), 10, 10*Math.cos(t)];
    sp.lightPosition = [0, 100, 100];
    sp.eyePosition = scene.getViewPosition().toGL();

    Array.forEach(scene._findAll(X3DShape), function (shape) {
        sp.modelMatrix = shape.getCurrentTransform().toGL();
        sp.modelViewMatrix = mat_view.times(shape.getCurrentTransform()).toGL();
        sp.modelViewProjectionMatrix = mat_projection.times(mat_view).times(shape.getCurrentTransform()).toGL();
        gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, shape._geometry._positions);
        gl.enableVertexAttribArray(sp.position);
        gl.vertexAttribPointer(sp.normal, 3, gl.FLOAT, shape._glweb20.normals);
        gl.enableVertexAttribArray(sp.normal);

        gl.drawElements(gl.TRIANGLES, shape._geometry._indexes.length, shape._geometry._indexes);
    });

    gl.swapBuffers();
};

return setupContext;

})();
