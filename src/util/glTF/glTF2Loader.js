/**
 * 
 * @param {Object} gltf 
 * @param {NodeNameSpace} nameSpace 
 */
x3dom.glTF2Loader = function(nameSpace)
{
    this._nameSpace = nameSpace;
    this._binaryData = null;
}

/**
 * Starts the loading/parsing of the glTF-Object
 * @param {Object} gltf 
 */
x3dom.glTF2Loader.prototype.load = function(input, binary)
{
    this._gltf = this._getGLTF(input, binary);

    //generate X3D scene
    var x3dScene = this._generateX3DScene();

    //Get the scene ID
    var sceneID = this._gltf.scene || 0;

    //Get the scene
    var scene = this._gltf.scenes[ sceneID ];

    for( var i = 0; i < scene.nodes.length; i++ )
    {
        var node = this._gltf.nodes[ scene.nodes[ i ] ];

        this._traverseNodes(node, x3dScene);
    }

    console.log(x3dScene);

    console.log(this._gltf);

    return x3dScene;
}

/**
 * Traverses all glTF nodes
 * @param {Object} node - A glTF-Node
 * @param {X3DNode} parent - A X3D-Node
 */
x3dom.glTF2Loader.prototype._traverseNodes = function(node, parent)
{
    var x3dNode = this._generateX3DNode(node, parent);

    parent.appendChild(x3dNode);

    if (node.children)
    {
        for(var i = 0; i < node.children.length; i++)
        {
            var child = this._gltf.nodes[ node.children[i] ];
    
            this._traverseNodes(child, x3dNode);
        }
    }
};

/**
 * Generates a X3D node from a glTF node
 * @param {Object} node - A glTF-Node
 */
x3dom.glTF2Loader.prototype._generateX3DNode = function(node)
{
    var x3dNode;

    if( node.matrix != undefined )
    {
        x3dNode = this._generateX3DMatrixTransform(node);
    }
    else if( node.translation != undefined || 
             node.rotation    != undefined ||
             node.scale       != undefined)
    {
        x3dNode = this._generateX3DTransform(node);
    }
    else
    {
        x3dNode = this._generateX3DGroup(node);
    }

    if( node.mesh != undefined )
    {
        var mesh = this._gltf.meshes[node.mesh];

        for( var i = 0; i < mesh.primitives.length; i++ )
        {
            var shape = this._generateX3DShape(mesh.primitives[i]);

            x3dNode.appendChild(shape);
        }
        
    }

    if ( node.name != undefined )
    {
        x3dNode.setAttribute( "id", node.name );
        x3dNode.setAttribute( "DEF", node.name );
    }

    return x3dNode;
};

/**
 * Generates a X3D scene node
 */
x3dom.glTF2Loader.prototype._generateX3DScene = function()
{
    return document.createElement("scene");
};

/**
 * Generates a X3D transform node
 * @param {Object} node - A glTF-Node
 */
x3dom.glTF2Loader.prototype._generateX3DTransform = function(node)
{
    var transform = document.createElement("transform");

    if( node.translation != undefined )
    {
        transform.setAttribute("translation", node.translation.join(" "));
    }

    if( node.rotation != undefined )
    {
        transform.setAttribute("rotation", this._toAxisAngle(node.rotation).join(" "));
    }

    if( node.scale != undefined )
    {
        transform.setAttribute("scale", node.scale.join(" "));
    }

    return transform;
};

/**
 * Generates a X3D matrix transform node
 * @param {Object} node - A glTF-Node
 * @return {MatrixTransform}
 */
x3dom.glTF2Loader.prototype._generateX3DMatrixTransform = function(node)
{
    var matrixTransform = document.createElement("matrixtransform");

    if( node.matrix != undefined )
    {
        matrixTransform.setAttribute("matrix", node.matrix.join(" ") );
    }

    return matrixTransform;
};

/**
 * Generates a X3D group node
 * @param {Object} node - A glTF-Node
 * @return {Group}
 */
x3dom.glTF2Loader.prototype._generateX3DGroup = function(node)
{
    return document.createElement("group");
};

/**
 * Generates a X3D shape node
 * @private
 * @param {Object} primitive - A glTF primitive node
 * @return {Shape}
 */
x3dom.glTF2Loader.prototype._generateX3DShape = function(primitive)
{
    var shape = document.createElement("shape");

    if(primitive.material != undefined)
    {
        var appearance = this._generateX3DAppearance( this._gltf.materials[ primitive.material ] );

        shape.appendChild(appearance);
    }

    shape.appendChild(this._generateX3DBufferGeometry(primitive));

    return shape;
};

/**
 * Generates a X3D appearance node
 * @private
 * @param {Object} primitive - A glTF material node
 * @return {Appearance}
 */
x3dom.glTF2Loader.prototype._generateX3DAppearance = function(material)
{
    var appearance = document.createElement("appearance");

    appearance.appendChild(this._generateX3DMaterial(material));

    if(material.pbrMetallicRoughness.baseColorTexture != undefined)
    {
        var texture = this._gltf.textures[material.pbrMetallicRoughness.baseColorTexture.index];

        appearance.appendChild(this._generateX3DImageTexture(texture));
    }

    return appearance;
};

x3dom.glTF2Loader.prototype._generateX3DMaterial = function(material)
{
    var mat = document.createElement("material");

    var diffuseColor = [1, 1, 1];
    var transparency = 0;

    if(material.pbrMetallicRoughness.baseColorFactor)
    {
        diffuseColor[0] = material.pbrMetallicRoughness.baseColorFactor[0];
        diffuseColor[1] = material.pbrMetallicRoughness.baseColorFactor[1];
        diffuseColor[2] = material.pbrMetallicRoughness.baseColorFactor[2];
        transparency    = 1.0 - material.pbrMetallicRoughness.baseColorFactor[3];
    }

    mat.setAttribute("diffuseColor", diffuseColor.join(" "));
    mat.setAttribute("transparency", transparency);
    
    return mat;
};

/**
 * Generates a X3D image texture node
 * @private
 * @param {Object} image - A glTF image node
 * @return {Imagetexture}
 */
x3dom.glTF2Loader.prototype._generateX3DImageTexture = function(texture)
{
    var image   = this._gltf.images[texture.source]; 

    var imagetexture = document.createElement("imagetexture");
    
    imagetexture.setAttribute("origChannelCount", "2");
    imagetexture.setAttribute("flipY", "true");

    if(image.uri != undefined)
    {
        imagetexture.setAttribute("url", image.uri);
    }

    if(texture.sampler != undefined)
    {
        var sampler = this._gltf.samplers[texture.sampler];
        imagetexture.appendChild(this._createX3DTextureProperties(sampler));
    }
    

    return imagetexture;
};

/**
 * Generates a X3D TextureProperties node
 * @private
 * @param {Object} primitive - A glTF sampler node
 * @return {TextureProperties}
 */
x3dom.glTF2Loader.prototype._createX3DTextureProperties = function(sampler)
{
    var textureproperties = document.createElement("textureproperties");

    textureproperties.setAttribute("boundaryModeS", x3dom.Utils.boundaryModesDicX3D(sampler.wrapS));
    textureproperties.setAttribute("boundaryModeT", x3dom.Utils.boundaryModesDicX3D(sampler.wrapT));

    textureproperties.setAttribute("magnificationFilter", x3dom.Utils.magFilterDicX3D(sampler.magFilter));
    textureproperties.setAttribute("minificationFilter",  x3dom.Utils.minFilterDicX3D(sampler.minFilter));

    if(sampler.minFilter == undefined || (sampler.minFilter >= 9984 && sampler.minFilter <= 9987) )
    {
        textureproperties.setAttribute("generateMipMaps", "true");
    }
    
    return textureproperties;
};

/**
 * Generates a X3D BufferGeometry node
 * @private
 * @param {Object} primitive - A glTF primitive node
 * @return {BufferGeometry}
 */
x3dom.glTF2Loader.prototype._generateX3DBufferGeometry = function(primitive)
{
    var views = [];
    var bufferGeometry = document.createElement("buffergeometry");
    var centerAndSize = this._getCenterAndSize(primitive);
 
    bufferGeometry.setAttribute("buffer", this._bufferURI(primitive));
    bufferGeometry.setAttribute("position", centerAndSize.center.join( " " ));
    bufferGeometry.setAttribute("size", centerAndSize.size.join( " " ));
    bufferGeometry.setAttribute("vertexCount", this._getVertexCount(primitive));
    bufferGeometry.setAttribute("primType", this._primitiveType(primitive.mode));

    //Check Material for double sided rendering
    if(primitive.material != undefined)
    {
        var material = this._gltf.materials[ primitive.material ];

        if(material.doubleSided)
        {
            bufferGeometry.setAttribute("solid", "false");
        }
    }

    //Check for indices
    if(primitive.indices != undefined)
    {
        var accessor = this._gltf.accessors[primitive.indices];

        var view = this._gltf.bufferViews[accessor.bufferView];
        view.id = accessor.bufferView;
        view.target = 34963;

        var viewID = views.indexOf(view)

        if(view.target != undefined && viewID == -1)
        {
            viewID = views.push(view) - 1;
        }

        bufferGeometry.appendChild( this._generateX3DBufferAccessor("INDEX", accessor, viewID) );
    }

    for(var attribute in primitive.attributes)
    {
        var accessor = this._gltf.accessors[ primitive.attributes[attribute] ];

        var view = this._gltf.bufferViews[accessor.bufferView];
        view.target = 34962;
        view.id = accessor.bufferView;

        var viewID = views.indexOf(view)

        if(view.target != undefined && viewID == -1)
        {
            viewID = views.push(view) - 1;
        }

        bufferGeometry.appendChild( this._generateX3DBufferAccessor(attribute, accessor, viewID) );
    }

    for(var i = 0; i < views.length; i++)
    {
        bufferGeometry.appendChild(this._generateX3DBufferView(views[i]));
    }

    return bufferGeometry;
}

x3dom.glTF2Loader.prototype._generateX3DBufferView = function(view)
{
    var bufferView = document.createElement( "buffergeometryview" );

    bufferView.setAttribute("target",     view.target);
    bufferView.setAttribute("byteOffset", view.byteOffset || 0);
    bufferView.setAttribute("byteLength", view.byteLength);
    bufferView.setAttribute("id", view.id);

    return bufferView;
};

x3dom.glTF2Loader.prototype._generateX3DBufferAccessor = function(buffer, accessor, viewID)
{
    var components = this._componentsOf(accessor.type);

    var bufferView = this._gltf.bufferViews[accessor.bufferView];

    var byteOffset = accessor.byteOffset;

    var bufferAccessor = document.createElement( "buffergeometryaccessor" );

    bufferAccessor.setAttribute("bufferType", buffer.replace("_0", ""));
    bufferAccessor.setAttribute("view", viewID);
    bufferAccessor.setAttribute("byteOffset", byteOffset || 0);
    bufferAccessor.setAttribute("byteStride", bufferView.byteStride || 0);

    bufferAccessor.setAttribute("components", components);
    bufferAccessor.setAttribute("componentType", accessor.componentType);

    return bufferAccessor;
};

/**
 */
x3dom.glTF2Loader.prototype._getCenterAndSize = function(primitive)
{
    var size = [1, 1, 1];
    var center = [0, 0, 0];

    if(primitive.attributes.POSITION != undefined)
    {
        var accessor = this._gltf.accessors[primitive.attributes.POSITION];

        size[0] = accessor.max[0] - accessor.min[0];
        size[1] = accessor.max[1] - accessor.min[1];
        size[2] = accessor.max[2] - accessor.min[2];

        center[0] = accessor.min[0] + size[0] * 0.5;
        center[1] = accessor.min[1] + size[1] * 0.5;
        center[2] = accessor.min[2] + size[2] * 0.5;
    }

    return {center: center, size: size};
};

x3dom.glTF2Loader.prototype._getVertexCount = function(primitive)
{
    var vertexCount = 0;
    var accessor;

    if(primitive.indices != undefined)
    {
        accessor = this._gltf.accessors[primitive.indices];
        vertexCount = accessor.count;
    }
    else if(primitive.attributes.POSITION != undefined)
    {
        accessor = this._gltf.accessors[primitive.attributes.POSITION];
        vertexCount = accessor.count;
    }

    return vertexCount;
}

x3dom.glTF2Loader.prototype._sizeInBytes = function(componentType)
{
    switch(componentType)
    {
        case 5120: return 1;
        case 5121: return 1;
        case 5122: return 2;
        case 5123: return 2;
        case 5125: return 4;
        case 5126: return 4;
    }
};

x3dom.glTF2Loader.prototype._componentsOf = function(type)
{
    switch(type)
    {
        case "SCALAR": return 1;
        case "VEC2":   return 2;
        case "VEC3":   return 3;
        case "VEC4":   return 4;
        case "MAT2":   return 4;
        case "MAT3":   return 9;
        case "MAT4":   return 16;
    }
};

x3dom.glTF2Loader.prototype._bufferURI = function(primitive)
{
    var uri = "";

    if(primitive.attributes.POSITION != undefined)
    {
        var accessor = this._gltf.accessors[ primitive.attributes.POSITION ];
        var bufferView = this._gltf.bufferViews[accessor.bufferView];
        var buffer = this._gltf.buffers[bufferView.buffer];

        uri = buffer.uri;
    }

    return uri;
};

x3dom.glTF2Loader.prototype._primitiveType = function(mode)
{
    switch(mode)
    {
        case 0: return "POINTS";
        case 1: return "LINES";
        case 2: return "LINE_LOOP";
        case 3: return "LINE_STRIP";
        case 4: return "TRIANGLES";
        case 5: return "TRIANGLE_STRIP";
        case 6: return "TRIANGLE_FAN";
        default: return "TRIANGLES";
    }
};

x3dom.glTF2Loader.prototype._isDefaultSampler = function(sampler)
{
    return ( sampler.wrapS     == 10497 && sampler.wrapS     == 10497 && 
             sampler.magFilter == 9729  && sampler.minFilter == 9729 );
};

x3dom.glTF2Loader.prototype._toAxisAngle = function(quat)
{
    var result = [];
    var quat = new x3dom.fields.Quaternion(quat[0], quat[1], quat[2], quat[3]);
    var axisAngle = quat.toAxisAngle();

    result[0] = axisAngle[0].x;
    result[1] = axisAngle[0].y;
    result[2] = axisAngle[0].z;
    result[3] = axisAngle[1];

    return result;
};

/**
 */
x3dom.glTF2Loader.prototype._getGLTF = function(input, binary)
{
    if(!binary)
    {
        return JSON.parse(input);
    }

    var byteOffset = 0;

    var header = new Uint32Array(input, byteOffset, 3);

    if (header[0] == 1179937895 || header[1] == 2)
    {
        byteOffset += 12;

        var jsonHeader = new Uint32Array(input, byteOffset, 2);

        if (jsonHeader[1] == 1313821514)
        {
            byteOffset += 8;

            var jsonData = new Uint8Array(input, byteOffset, jsonHeader[0]);

            byteOffset += jsonHeader[0];

            var binaryHeader = new Uint32Array(input, byteOffset, 2);

            if (binaryHeader[1] == 5130562)
            {
                byteOffset += 8;

                var binaryData = new Uint8Array(input, byteOffset, binaryHeader[0]);

                var gltf = x3dom.Utils.arrayBufferToJSON(jsonData);

                gltf.buffers[0].uri = x3dom.Utils.arrayBufferToDataURL(binaryData, "application/octet-stream");

                this._convertBinaryImages(gltf, input, byteOffset);

                return gltf;
            }
        }
    }  
};

x3dom.glTF2Loader.prototype._convertBinaryImages = function(gltf, buffer, byteOffset)
{
    if(gltf.images != undefined)
    {
        for(var i = 0; i < gltf.images.length; i++)
        {
            var image = gltf.images[i];

            if( image.bufferView )
            {
                var bufferView = gltf.bufferViews[image.bufferView];

                var imageData = new Uint8Array(buffer, byteOffset + bufferView.byteOffset, bufferView.byteLength);

                image.uri = x3dom.Utils.arrayBufferToDataURL(imageData, image.mimeType);
            }
        }
    }
};

