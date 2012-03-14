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


/** @class x3dom.Mesh
*/
x3dom.Mesh = function(parent) 
{
    this._parent = parent;
    
    this._min = new x3dom.fields.SFVec3f(0,0,0);
    this._max = new x3dom.fields.SFVec3f(0,0,0);
    this._invalidate = true;
    this._numFaces = 0;
    this._numCoords = 0;
    
    this._positions = [];
    this._normals   = [];
    this._texCoords = [];
    this._colors    = [];
    this._indices   = [];
    
    this._positions[0] = [];
    this._normals[0]   = [];
    this._texCoords[0] = [];
    this._colors[0]    = [];
    this._indices[0]   = [];
};

x3dom.Mesh.prototype._dynamicFields = {};   // can hold X3DVertexAttributeNodes
/*x3dom.Mesh.prototype._positions = [];
x3dom.Mesh.prototype._normals   = [];
x3dom.Mesh.prototype._texCoords = [];
x3dom.Mesh.prototype._colors    = [];
x3dom.Mesh.prototype._indices   = [];*/

x3dom.Mesh.prototype._numTexComponents = 2;
x3dom.Mesh.prototype._numColComponents = 3;
x3dom.Mesh.prototype._lit = true;
x3dom.Mesh.prototype._min = {};
x3dom.Mesh.prototype._max = {};
x3dom.Mesh.prototype._invalidate = true;
x3dom.Mesh.prototype._numFaces = 0;
x3dom.Mesh.prototype._numCoords = 0;

x3dom.Mesh.prototype.setMeshData = function(positions, normals, texCoords, colors, indices)
{
    this._positions[0] = positions;
    this._normals[0]   = normals;
    this._texCoords[0] = texCoords;
    this._colors[0]    = colors;
    this._indices[0]   = indices;
    
    this._invalidate = true;
    this._numFaces = this._indices[0].length / 3;
    this._numCoords = this._positions[0].length / 3;
};

x3dom.Mesh.prototype.getBBox = function(min, max, invalidate)
{
    if (this._invalidate === true && invalidate === true)   //need both?
    {
        var coords = this._positions[0];
        var n = coords.length;
        
        if (n > 3)
        {
            this._min = new x3dom.fields.SFVec3f(coords[0],coords[1],coords[2]);
            this._max = new x3dom.fields.SFVec3f(coords[0],coords[1],coords[2]);
        }
        else
        {
            this._min = new x3dom.fields.SFVec3f(0,0,0);
            this._max = new x3dom.fields.SFVec3f(0,0,0);
        }
        
        for (var i=3; i<n; i+=3)
        {
            if (this._min.x > coords[i+0]) { this._min.x = coords[i+0]; }
            if (this._min.y > coords[i+1]) { this._min.y = coords[i+1]; }
            if (this._min.z > coords[i+2]) { this._min.z = coords[i+2]; }
            
            if (this._max.x < coords[i+0]) { this._max.x = coords[i+0]; }
            if (this._max.y < coords[i+1]) { this._max.y = coords[i+1]; }
            if (this._max.z < coords[i+2]) { this._max.z = coords[i+2]; }
        }
        
        this._invalidate = false;
    }
    
    min.setValues(this._min);
    max.setValues(this._max);
};

x3dom.Mesh.prototype.getCenter = function() 
{
    var min = new x3dom.fields.SFVec3f(0,0,0);
    var max = new x3dom.fields.SFVec3f(0,0,0);
    
    this.getBBox(min, max, true);
    
    var center = min.add(max).multiply(0.5);
    //x3dom.debug.logInfo("getCenter: " + min + " | " + max + " --> " + center);
    
    return center;
};

x3dom.Mesh.prototype.doIntersect = function(line)
{
    var min = new x3dom.fields.SFVec3f(0,0,0);
    var max = new x3dom.fields.SFVec3f(0,0,0);
    
    this.getBBox(min, max, true);
    
    var isect = line.intersect(min, max);
    
    //TODO: iterate over all faces!
    if (isect && line.enter < line.dist)
    {
        //x3dom.debug.logInfo("Hit \"" + this._parent._xmlNode.localName + "/ " + 
        //                    this._parent._DEF + "\" at dist=" + line.enter.toFixed(4));
        
        line.dist = line.enter;
        line.hitObject = this._parent;
        line.hitPoint = line.pos.add(line.dir.multiply(line.enter));
    }
    
    return isect;
};

x3dom.Mesh.prototype.calcNormals = function(creaseAngle)
{
    var i = 0, j = 0, num = 0;
    var multInd = (this._multiIndIndices !== undefined && this._multiIndIndices.length);
    var coords = this._positions[0];
    var idxs = multInd ? this._multiIndIndices : this._indices[0];
    
    var vertNormals = [];
    var vertFaceNormals = [];

    var a, b, n = null;
    
    //num = coords.length / 3;
    num = (this._posSize !== undefined && this._posSize > coords.length) ? 
           this._posSize / 3 : coords.length / 3;
    num = 3 * ((num - Math.floor(num) > 0) ? Math.floor(num + 1) : num);
    
    for (i = 0; i < num; ++i) {
        vertFaceNormals[i] = [];
    }
    
    num = idxs.length;

    for (i = 0; i < num; i += 3) {
        if (!multInd) {
            a = new x3dom.fields.SFVec3f(
                    coords[idxs[i  ]*3], coords[idxs[i  ]*3+1], coords[idxs[i  ]*3+2]).
                subtract(new x3dom.fields.SFVec3f(
                    coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]));
            b = new x3dom.fields.SFVec3f(
                    coords[idxs[i+1]*3], coords[idxs[i+1]*3+1], coords[idxs[i+1]*3+2]).
                subtract(new x3dom.fields.SFVec3f(
                    coords[idxs[i+2]*3], coords[idxs[i+2]*3+1], coords[idxs[i+2]*3+2]));
        }
        else {
            a = new x3dom.fields.SFVec3f(
                        coords[i*3], coords[i*3+1], coords[i*3+2]).
                    subtract(new x3dom.fields.SFVec3f(
                        coords[(i+1)*3], coords[(i+1)*3+1], coords[(i+1)*3+2]));
            b = new x3dom.fields.SFVec3f(
                        coords[(i+1)*3], coords[(i+1)*3+1], coords[(i+1)*3+2]).
                    subtract(new x3dom.fields.SFVec3f(
                        coords[(i+2)*3], coords[(i+2)*3+1], coords[(i+2)*3+2]));
        }
        
        n = a.cross(b).normalize();
        
        if (creaseAngle <= x3dom.fields.Eps) {
            vertNormals[i*3  ] = vertNormals[(i+1)*3  ] = vertNormals[(i+2)*3  ] = n.x;
            vertNormals[i*3+1] = vertNormals[(i+1)*3+1] = vertNormals[(i+2)*3+1] = n.y;
            vertNormals[i*3+2] = vertNormals[(i+1)*3+2] = vertNormals[(i+2)*3+2] = n.z;
        }
        else {
            vertFaceNormals[idxs[i  ]].push(n);
            vertFaceNormals[idxs[i+1]].push(n);
            vertFaceNormals[idxs[i+2]].push(n);
        }
    }
    
    if (creaseAngle > x3dom.fields.Eps) 
    {
        for (i = 0; i < coords.length; i += 3) {
            //TODO: generic creaseAngle
            n = new x3dom.fields.SFVec3f(0, 0, 0);
            
            if (!multInd) {
                num = vertFaceNormals[i/3].length;
                for (j = 0; j < num; ++j) {
                    n = n.add(vertFaceNormals[i/3][j]);
                }
            }
            else {
                num = vertFaceNormals[idxs[i/3]].length;
                for (j = 0; j < num; ++j) {
                    n = n.add(vertFaceNormals[idxs[i/3]][j]);
                }
            }

            n = n.normalize();
            vertNormals[i  ] = n.x;
            vertNormals[i+1] = n.y;
            vertNormals[i+2] = n.z;
        }
    }
    
    if (multInd) {
        this._multiIndIndices = [];
    }
    
    this._normals[0] = vertNormals;
};

x3dom.Mesh.prototype.splitMesh = function()
{
    var MAX = 65535;
    if (this._positions[0].length / 3 <= MAX) {
        return;
    }
    
    var positions = this._positions[0];
    var normals = this._normals[0];
    var texCoords = this._texCoords[0];
    var colors = this._colors[0];
    var indices = this._indices[0];
    var i = 0;
    
    do
    {
        this._positions[i] = [];
        this._normals[i]   = [];
        this._texCoords[i] = [];
        this._colors[i]    = [];
        this._indices[i]   = [];
        
        var k = ((indices.length - ((i + 1) * MAX) < 0) ? false : true);
        
        if (k) {
            this._indices[i] = indices.slice(i * MAX, (i + 1) * MAX);
        } else { 
            this._indices[i] = indices.slice(i * MAX);
        }
        
        if (i) {
            var m = i * MAX;
            for (var j=0, l=this._indices[i].length; j<l; j++) {
                this._indices[i][j] -= m;
            }
        }
        
        if (k) { 
            this._positions[i] = positions.slice(i * MAX * 3, 3 * (i + 1) * MAX);
        } else { 
            this._positions[i] = positions.slice(i * MAX * 3);
        }
        
        if (normals.length) {
            if (k) { 
                this._normals[i] = normals.slice(i * MAX * 3, 3 * (i + 1) * MAX);
            } else { 
                this._normals[i] = normals.slice(i * MAX * 3);
            }
        }
        if (texCoords.length) {
            if (k) { 
                this._texCoords[i] = texCoords.slice(i * MAX * this._numTexComponents, 
                                                        this._numTexComponents * (i + 1) * MAX);
            } else {
                this._texCoords[i] = texCoords.slice(i * MAX * this._numTexComponents);
            }
        }
        if (colors.length) {
            if (k) { 
                this._colors[i] = colors.slice(i * MAX * this._numColComponents, 
                                                  this._numColComponents * (i + 1) * MAX);
            } else { 
                this._colors[i] = colors.slice(i * MAX * this._numColComponents);
            }
        }
    }
    while (positions.length > ++i * MAX * 3);
};

x3dom.Mesh.prototype.calcTexCoords = function(mode)
{
    this._texCoords[0] = [];
    
    // TODO; impl. all modes that aren't handled in shader!
    // FIXME; WebKit requires valid texCoords for texturing
    if (mode.toLowerCase() === "sphere-local")
    {
        for (var i=0, j=0, n=this._normals[0].length; i<n; i+=3)
        {
            this._texCoords[0][j++] = 0.5 + this._normals[0][i  ] / 2.0;
            this._texCoords[0][j++] = 0.5 + this._normals[0][i+1] / 2.0;
        }
    }
    else    // "plane" is x3d default mapping
    {
        var min = new x3dom.fields.SFVec3f(0, 0, 0), 
            max = new x3dom.fields.SFVec3f(0, 0, 0);
        
        this.getBBox(min, max, true);
        var dia = max.subtract(min);
        
        var S = 0, T = 1;
        
        if (dia.x >= dia.y)
        {
            if (dia.x >= dia.z)
            {
                S = 0;
                T = dia.y >= dia.z ? 1 : 2;
            }
            else // dia.x < dia.z
            {
                S = 2;
                T = 0;
            }
        }
        else // dia.x < dia.y
        {
            if (dia.y >= dia.z)
            {
                S = 1;
                T = dia.x >= dia.z ? 0 : 2;
            }
            else // dia.y < dia.z
            {
                S = 2;
                T = 1;
            }
        }
        
        var sDenom = 1, tDenom = 1;
        var sMin = 0, tMin = 0;
        
        switch(S) {
            case 0: sDenom = dia.x; sMin = min.x; break;
            case 1: sDenom = dia.y; sMin = min.y; break;
            case 2: sDenom = dia.z; sMin = min.z; break;
        }
        
        switch(T) {
            case 0: tDenom = dia.x; tMin = min.x; break;
            case 1: tDenom = dia.y; tMin = min.y; break;
            case 2: tDenom = dia.z; tMin = min.z; break;
        }
        
        for (var k=0, l=0, m=this._positions[0].length; k<m; k+=3)
        {
            this._texCoords[0][l++] = (this._positions[0][k+S] - sMin) / sDenom;
            this._texCoords[0][l++] = (this._positions[0][k+T] - tMin) / tDenom;
        }
    }
};

