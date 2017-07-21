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


/** @class x3dom.Mesh
*/
x3dom.Mesh = function(parent) 
{
    this._parent = parent;

    this._vol = new x3dom.fields.BoxVolume();

    this._invalidate = true;
    this._numFaces = 0;
    this._numCoords = 0;

    // cp. x3dom.Utils.primTypeDic for type list
	this._primType = 'TRIANGLES';
    
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

x3dom.Mesh.prototype._numPosComponents = 3;
x3dom.Mesh.prototype._numTexComponents = 2;
x3dom.Mesh.prototype._numColComponents = 3;
x3dom.Mesh.prototype._numNormComponents = 3;
x3dom.Mesh.prototype._lit = true;

x3dom.Mesh.prototype._vol = null;
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

x3dom.Mesh.prototype.getVolume = function()
{
    if (this._invalidate == true && !this._vol.isValid())
    {
        var coords = this._positions[0];
        var n = coords.length;

        if (n > 3)
        {
            var initVal = new x3dom.fields.SFVec3f(coords[0],coords[1],coords[2]);
            this._vol.setBounds(initVal, initVal);

            for (var i=3; i<n; i+=3)
            {
                if (this._vol.min.x > coords[i  ]) { this._vol.min.x = coords[i  ]; }
                if (this._vol.min.y > coords[i+1]) { this._vol.min.y = coords[i+1]; }
                if (this._vol.min.z > coords[i+2]) { this._vol.min.z = coords[i+2]; }

                if (this._vol.max.x < coords[i  ]) { this._vol.max.x = coords[i  ]; }
                if (this._vol.max.y < coords[i+1]) { this._vol.max.y = coords[i+1]; }
                if (this._vol.max.z < coords[i+2]) { this._vol.max.z = coords[i+2]; }
            }
            this._invalidate = false;
        }
    }

    return this._vol;
};

x3dom.Mesh.prototype.invalidate = function()
{
    this._invalidate = true;
    this._vol.invalidate();
};

x3dom.Mesh.prototype.isValid = function()
{
    return this._vol.isValid();
};

x3dom.Mesh.prototype.getCenter = function() 
{
    return this.getVolume().getCenter();
};

x3dom.Mesh.prototype.getDiameter = function() 
{
    return this.getVolume().getDiameter();
};

x3dom.Mesh.prototype.doIntersect = function(line)
{
    var vol = this.getVolume();
    var isect = line.intersect(vol.min, vol.max);
    
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

x3dom.Mesh.prototype.calcNormals = function(creaseAngle, ccw)
{
    if (ccw === undefined)
        ccw = true;

    var multInd = this._multiIndIndices && this._multiIndIndices.length;
    var idxs = multInd ? this._multiIndIndices : this._indices[0];
    var coords = this._positions[0];

    var vertNormals = [];
    var vertFaceNormals = [];

    var i, j, m = coords.length;
    var a, b, n = null;

    var num = (this._posSize !== undefined && this._posSize > m) ? this._posSize / 3 : m / 3;
    num = 3 * ((num - Math.floor(num) > 0) ? Math.floor(num + 1) : num);
    
    for (i = 0; i < num; ++i) {
        vertFaceNormals[i] = [];
    }
    
    num = idxs.length;
        
    for (i = 0; i < num; i += 3) {
        var ind_i0, ind_i1, ind_i2;
        var t;

        if (!multInd) {
            ind_i0 = idxs[i  ] * 3;
            ind_i1 = idxs[i+1] * 3;
            ind_i2 = idxs[i+2] * 3;

            t = new x3dom.fields.SFVec3f(coords[ind_i1], coords[ind_i1+1], coords[ind_i1+2]);
            a = new x3dom.fields.SFVec3f(coords[ind_i0], coords[ind_i0+1], coords[ind_i0+2]).subtract(t);
            b = t.subtract(new x3dom.fields.SFVec3f(coords[ind_i2], coords[ind_i2+1], coords[ind_i2+2]));

            // this is needed a few lines below
            ind_i0 =  i    * 3;
            ind_i1 = (i+1) * 3;
            ind_i2 = (i+2) * 3;
        }
        else {
            ind_i0 =  i    * 3;
            ind_i1 = (i+1) * 3;
            ind_i2 = (i+2) * 3;

            t = new x3dom.fields.SFVec3f(coords[ind_i1], coords[ind_i1+1], coords[ind_i1+2]);
            a = new x3dom.fields.SFVec3f(coords[ind_i0], coords[ind_i0+1], coords[ind_i0+2]).subtract(t);
            b = t.subtract(new x3dom.fields.SFVec3f(coords[ind_i2], coords[ind_i2+1], coords[ind_i2+2]));
        }
        
        n = a.cross(b).normalize();
        if (!ccw)
            n = n.negate();

        if (creaseAngle <= x3dom.fields.Eps) {
            vertNormals[ind_i0  ] = vertNormals[ind_i1  ] = vertNormals[ind_i2  ] = n.x;
            vertNormals[ind_i0+1] = vertNormals[ind_i1+1] = vertNormals[ind_i2+1] = n.y;
            vertNormals[ind_i0+2] = vertNormals[ind_i1+2] = vertNormals[ind_i2+2] = n.z;
        }
        else {
            vertFaceNormals[idxs[i  ]].push(n);
            vertFaceNormals[idxs[i+1]].push(n);
            vertFaceNormals[idxs[i+2]].push(n);
        }
    }

    // TODO: allow generic creaseAngle
    if (creaseAngle > x3dom.fields.Eps) 
    {
        for (i = 0; i < m; i += 3) {
            var iThird = i / 3;
            var arr;

            if (!multInd) {
                arr = vertFaceNormals[iThird];
            }
            else {
                arr = vertFaceNormals[idxs[iThird]];
            }
            num = arr.length;

            n = new x3dom.fields.SFVec3f(0, 0, 0);

            for (j = 0; j < num; ++j) {
                n = n.add(arr[j]);
            }
            n = n.normalize();

            vertNormals[i  ] = n.x;
            vertNormals[i+1] = n.y;
            vertNormals[i+2] = n.z;
        }
    }
    
    this._normals[0] = vertNormals;
};

/** @param primStride Number of index entries per primitive, for example 3 for TRIANGLES
 */
x3dom.Mesh.prototype.splitMesh = function(primStride, checkMultiIndIndices)
{
    var pStride;
    var isMultiInd;

    if (typeof primStride === undefined) {
        pStride = 3;
    } else {
        pStride = primStride;
    }

    if (typeof checkMultiIndIndices === undefined) {
        checkMultiIndIndices = false;
    }

    var MAX = x3dom.Utils.maxIndexableCoords;

    //adapt MAX to match the primitive stride
    MAX = Math.floor(MAX / pStride) * pStride;

    if (this._positions[0].length / 3 <= MAX && !checkMultiIndIndices) {
        return;
    }

    if (checkMultiIndIndices) {
        isMultiInd = this._multiIndIndices && this._multiIndIndices.length;
    } else {
        isMultiInd = false;
    }
    
    var positions = this._positions[0];
    var normals = this._normals[0];
    var texCoords = this._texCoords[0];
    var colors = this._colors[0];
    var indices = isMultiInd ? this._multiIndIndices : this._indices[0];

    var i = 0;
    
    do
    {
        this._positions[i] = [];
        this._normals[i]   = [];
        this._texCoords[i] = [];
        this._colors[i]    = [];
        this._indices[i]   = [];
        
        var k = (indices.length - ((i + 1) * MAX) >= 0);
        
        if (k) {
            this._indices[i] = indices.slice(i * MAX, (i + 1) * MAX);
        } else { 
            this._indices[i] = indices.slice(i * MAX);
        }

        if(!isMultiInd) {
            if (i) {
                var m = i * MAX;
                for (var j=0, l=this._indices[i].length; j<l; j++) {
                    this._indices[i][j] -= m;
                }
            }
        } else {
            for (var j=0, l=this._indices[i].length; j<l; j++) {
                this._indices[i][j] = j;
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
        var vol = this.getVolume();

        vol.getBounds(min, max);
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
            this._texCoords[0][l++] = (this._positions[0][k+T] - tMin) / sDenom;
        }
    }
};
