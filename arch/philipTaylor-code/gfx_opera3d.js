var gfx_opera3d = (function () {

function Context(ctx2d, ctx3d) {
    this.ctx2d = ctx2d;
    this.ctx3d = ctx3d;
}

Context.prototype.getName = function() {
    return "opera-3d";
}

function setupContext(canvas) {
    try {
        var ctx2d = canvas.getContext('2d');
        var ctx3d = canvas.getContext('opera-3d');
        if (ctx2d && ctx3d)
            return new Context(ctx2d, ctx3d);
    } catch (e) { }
}

Context.prototype.prepareScene = function (scene) {
    var lightmap = document.createElement('canvas');
    var s = 256;
    lightmap.width = s;
    lightmap.height = s;
    var ctx = lightmap.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, s, s);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = ctx.createLinearGradient(0, 0, s, 0);
    ctx.fillStyle.addColorStop(0, '#000');
    ctx.fillStyle.addColorStop(1, '#f00');
    ctx.fillRect(0, 0, s, s);
    for (var n = 0; n < s; ++n) {
        ctx.fillStyle = 'rgba(255, 255, 0, '+Math.pow(n/(s-1), 2)+')';
        ctx.fillRect(0, n, s, 1);
    }

    scene._opera3d = {
        lightmap: this.ctx3d.createTexture(lightmap),
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
        for (var i = 0; i*3 < coords.length; ++i) {
            var n = new SFVec3(0, 0, 0);
            for (var j = 0; j < vertFaceNormals[i].length; ++j)
                n = n.plus(vertFaceNormals[i][j]);
            n = n.normalised();
            vertNormals[i] = n;
        }
        shape._opera3d = {
            normals: vertNormals,
        };
    });
};

function transformByMatrix(ctx, matrix) {
    var decomp = matrix.decompose();
    ctx.translate(decomp[0].x, decomp[0].y, decomp[0].z);
    ctx.rotateX(decomp[2]*180/Math.PI);
    ctx.rotateY(decomp[3]*180/Math.PI);
    ctx.rotateZ(decomp[4]*180/Math.PI);
}

Context.prototype.renderScene = function (scene, t) {
    var ctx = this.ctx3d;

    ctx.beginScene();
    ctx.save();

    ctx.save();
    ctx.color = 'rgb(100%, 100%, 50%)';
    ctx.ztest = 'none';
    ctx.drawTriangle(
        -10, -10, -10, 0, 0,
        10, -10, -10, 0, 0,
        10, 10, -10, 0, 0
    );
    ctx.drawTriangle(
        -10, -10, -10, 0, 0,
        -10, 10, -10, 0, 0,
        10, 10, -10, 0, 0
    );
    ctx.restore();

    //var mat_projection = this._setCamera(0.661, 4/3, 100, 0.1);
    var mat_view = scene.getViewMatrix();
    transformByMatrix(ctx, mat_view);

    var lightPosition = new SFVec3(10*Math.sin(t), 10, 10*Math.cos(t));
    lightPosition = new SFVec3(0, 100, 100);
    var eyePosition = scene.getViewPosition();

    Array.forEach(scene._findAll(X3DShape), function (shape) {
        var model = ctx.create3DModel();
        var modelTransform = shape.getCurrentTransform();
        var coords = shape._geometry._positions;
        var norms = shape._opera3d.normals;
        for (var i = 0; i*3 < coords.length; ++i) {
            var pos = modelTransform.transformPos(new SFVec3(coords[i*3], coords[i*3+1], coords[i*3+2]));
            var norm = modelTransform.transformNorm(norms[i]);
            var lightDir = lightPosition.minus(pos).normalised();
            var eyeDir = eyePosition.minus(pos).normalised();
            var diffuse = lightDir.dot(norm);
            var specular = Math.pow(Math.max(0, Math.min(1, -lightDir.reflect(norm).dot(eyeDir))), 8);
            diffuse = Math.max(0.01, Math.min(0.99, diffuse));
            specular = Math.max(0.01, Math.min(0.99, specular));
            model.addVertex(coords[i*3], coords[i*3+1], coords[i*3+2], diffuse, specular);
        }
        var idxs = shape._geometry._indexes;
        for (var i = 0; i < idxs.length; i += 3)
            model.addTriangle(idxs[i], idxs[i+1], idxs[i+2]);
        ctx.save();
        ctx.texture = scene._opera3d.lightmap;
        transformByMatrix(ctx, modelTransform);
        ctx.draw3DModel(model);
        ctx.restore();
    });

    ctx.restore();
    ctx.endScene();

};

return setupContext;

})();
