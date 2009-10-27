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

function transformByMatrix(ctx, matrix) {
    var decomp = matrix.decompose();
    ctx.translate(decomp[0].x, decomp[0].y, decomp[0].z);
    ctx.rotateX(decomp[2]*180/Math.PI);
    ctx.rotateY(decomp[3]*180/Math.PI);
    ctx.rotateZ(decomp[4]*180/Math.PI);
}

function createLightmap(ctx3d, size, mat) {
    var lightmap = document.createElement('canvas');
    lightmap.width = size;
    lightmap.height = size;
    var ctx = lightmap.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = ctx.createLinearGradient(0, 0, size, 0);
    ctx.fillStyle.addColorStop(0, 'rgb(0, 0, 0)');
    ctx.fillStyle.addColorStop(1, 'rgb('+Math.floor(255*mat._diffuseColor.x)+','+Math.floor(255*mat._diffuseColor.y)+','+Math.floor(255*mat._diffuseColor.z)+')');
    ctx.fillRect(0, 0, size, size);
    var spec = 'rgba('+Math.floor(255*mat._specularColor.x)+','+Math.floor(255*mat._specularColor.y)+','+Math.floor(255*mat._specularColor.z)+',';
    for (var n = 0; n < size; ++n) {
        ctx.fillStyle = spec+Math.pow(n/(size-1), mat._shininess*128)+')';
        ctx.fillRect(0, n, size, 1);
    }
    return ctx3d.createTexture(lightmap);
}

function setupShape(ctx3d, shape) {
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

    // TODO: share between identical materials
    var mat = shape._appearance._material;
    var lightmap = mat ? createLightmap(ctx3d, 128, mat) : null;

    shape._opera3d = {
        normals: vertNormals,
        lightmap: lightmap,
    };
}

Context.prototype.renderScene = function (env, scene, t) {
    var ctx = this.ctx3d;

    if (! scene._opera3d) {
        scene._opera3d = {
        };
    }

    ctx.beginScene();
    ctx.save();

    ctx.save();
    ctx.color = 'rgba(100%, 100%, 50%, 0.5)';
    ctx.ztest = 'none';
    // Fill the background with two triangles
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
    //lightPosition = new SFVec3(0, 100, 100);
    var eyePosition = scene.getViewPosition();

    var drawableObjects = [];
    scene._collectDrawableObjects(SFMatrix4.identity(), drawableObjects);
    Array.forEach(drawableObjects, function (obj) {
        var transform = obj[0];
        var shape = obj[1];

        if (! shape._opera3d)
            setupShape(ctx, shape);

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
            var specular = Math.max(0, lightDir.plus(eyeDir).normalised().dot(norm));
            diffuse = Math.max(0.01, Math.min(0.99, diffuse)); // clamp to avoid interpolating past the edge pixels
            specular = Math.max(0.01, Math.min(0.99, specular));
            model.addVertex(coords[i*3], coords[i*3+1], coords[i*3+2], diffuse, specular);
        }
        var idxs = shape._geometry._indexes;
        for (var i = 0; i < idxs.length; i += 3)
            model.addTriangle(idxs[i], idxs[i+1], idxs[i+2]);
        ctx.save();
        ctx.texture = shape._opera3d.lightmap;
        transformByMatrix(ctx, modelTransform);
        ctx.draw3DModel(model);
        ctx.restore();
    });

    ctx.restore();
    ctx.endScene();

};

return setupContext;

})();
