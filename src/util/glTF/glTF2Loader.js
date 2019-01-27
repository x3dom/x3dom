/**
 *
 * @param {Object} gltf
 * @param {NodeNameSpace} nameSpace
 */
x3dom.glTF2Loader = function(nameSpace)
{
    this._nameSpace = nameSpace;
    this._binaryData = null;
    this._prefix = "gltf";
    this._nodeNamePrefix = this._prefix + "NODE";
    this._animationPrefix = "CLIP";
    this._channelPrefix = "CHANNEL";
    this._clockPrefix = this._prefix + "CLOCK";
    this._interpolatorPrefix = this._prefix + "INTR";
    this._cameraPrefix = this._prefix + "CAM";
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

    // Get the nodes
    for( var i = 0; i < scene.nodes.length; i++ )
    {
        var node = this._gltf.nodes[ scene.nodes[ i ] ];

        this._traverseNodes(node, x3dScene, scene.nodes[ i ] );
    }

    //Get the animations
    if ( this._gltf.animations )
    { 
        this._gltf.animations.forEach( function( animation, a_i )
        {
            this._generateX3DAnimationNodes( x3dScene, animation, a_i );  
        }, this );
    }

    console.log(x3dScene);

    return x3dScene;
};

/**
 * find animation input with longest duration 
 * @param {Node} animation - the animation node
 */
x3dom.glTF2Loader.prototype._findLongestInput = function (animation)
{   
    var duration = -1;
    animation.channels.forEach( function (channel)
    {
        var input_accessor = 
            this._gltf.accessors[    
                animation.samplers[
                    channel.sampler].input];
        duration = Math.max(input_accessor.max[0], duration);
    }, this);
    return duration;
};


/**
 * generate necessary animation nodes
 * @param {X3DNode} x3dScene - A X3D-Node
 * @param {Node} animation - animatio node
 * @param {Number} a_i - animation index
 */
x3dom.glTF2Loader.prototype._generateX3DAnimationNodes = function(x3dScene, animation, a_i)
{
    var animation_length = this._findLongestInput( animation );
    var animationID = this._animationPrefix + a_i;
    this._generateX3DAnimationClock( x3dScene, animation_length, animationID );
    animation.channels.forEach (function ( channel, c_i )
    {
        this._generateX3DAnimation( x3dScene, animation_length,
                                   animation.samplers[channel.sampler], channel.target,
                                   animationID, this._channelPrefix + c_i );
    }, this);
};

/**
 * generate and  append TimeSensor
 * @param {X3DNode} parent - A X3D-Node
 * @param {Number} duration - cycle interval
 * @param {String} aniID - DEF name
 */
x3dom.glTF2Loader.prototype._generateX3DAnimationClock = function(parent, duration, aniID)
{
    var clock = document.createElement('TimeSensor');
    clock.setAttribute('loop','true');
    clock.setAttribute('cycleInterval', duration);
    clock.setAttribute('DEF', this._clockPrefix + aniID);
    parent.appendChild(clock);
};

/**
 * generate and  append ROUTE, Interpolator, TimeSensor combos
 * @param {X3DNode} parent - A X3D-Node
 * @param {Number} duration - cycle interval, for normalization
 * @param {Object} sampler - glTF sampler
 * @param {Object} target - glTF target
 * @param {String} animID - animation name
 * @param {String} chID - channel name, for DEF construction
 */
x3dom.glTF2Loader.prototype._generateX3DAnimation = function(parent, duration, sampler, target, animID, chID)
{
    var aniID = animID + chID;
    var input_accessor = this._gltf.accessors[sampler.input];
    var output_accessor = this._gltf.accessors[sampler.output];

    var path2Interpolator = {
        'translation' : 'PositionInterpolator' ,
        'rotation' : 'OrientationInterpolator' ,
        'scale' : 'PositionInterpolator',
        'weight' : 'ScalarInterpolator' // not sure
    };

    var interpolator = path2Interpolator[target.path];

    var views = this._gltf.bufferViews;
    var input_view = views[input_accessor.bufferView];
    input_view.id = input_accessor.bufferView; //fix to cached viewID
    var output_view = views[output_accessor.bufferView];
    output_view.id = output_accessor.bufferView;
    var bufferURI = x3dom.Utils.dataURIToObjectURL(this._gltf.buffers[input_view.buffer].uri); //output_view hopefully has same buffer
    
    var interNode = document.createElement(interpolator);
    var interDEF = this._interpolatorPrefix + aniID;
    interNode.setAttribute('DEF', interDEF);
    interNode.setAttribute('key', 'sampler.input.array');
    interNode.setAttribute('keyValue', 'sampler.output.array');
    interNode.setAttribute('buffer', bufferURI);

    interNode.interpolation=sampler.interpolation || 'LINEAR';
    
    var input_accessor_dom = this._generateX3DBufferAccessor('SAMPLER_INPUT', input_accessor, input_accessor.bufferView); 
    input_accessor_dom.duration = duration;

    interNode.appendChild(input_accessor_dom);
    interNode.appendChild(this._generateX3DBufferAccessor('SAMPLER_OUTPUT', output_accessor, output_accessor.bufferView));
    
    interNode.appendChild(this._generateX3DBufferView(input_view));
    interNode.appendChild(this._generateX3DBufferView(output_view));

    parent.appendChild(interNode);

    function _createROUTEElement(fromField, fromNode, toField, toNode)
    {
        var route = document.createElement('ROUTE');
        route.setAttribute('fromField', fromField);
        route.setAttribute('fromNode', fromNode);
        route.setAttribute('toField', toField);
        route.setAttribute('toNode', toNode);
        return route;
    };
    
    var targetDEF = this._nodeNamePrefix + this._gltf.nodes[target.node].name;
    
    var routeTS2INT = _createROUTEElement("fraction_changed", this._clockPrefix + animID, "set_fraction", interDEF);
    var routeINT2NODE = _createROUTEElement("value_changed", interDEF, "set_" + target.path, targetDEF);
 
    parent.appendChild(routeTS2INT);
    parent.appendChild(routeINT2NODE);
};

/**
 * Traverses all glTF nodes
 * @param {Object} node - A glTF-Node
 * @param {X3DNode} parent - A X3D-Node
 */
x3dom.glTF2Loader.prototype._traverseNodes = function(node, parent, index)
{
    var x3dNode = this._generateX3DNode(node, parent, index);

    parent.appendChild(x3dNode);

    if (node.children)
    {
        for(var i = 0; i < node.children.length; i++)
        {
            var child = this._gltf.nodes[ node.children[i] ];

            this._traverseNodes(child, x3dNode, node.children[i]);
        }
    }
};

/**
 * Generates a X3D node from a glTF node
 * @param {Object} node - A glTF-Node
 */
x3dom.glTF2Loader.prototype._generateX3DNode = function(node, parent, index)
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
        x3dNode = this._generateX3DTransform(node); // always use Transform in case of animations
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

    if( node.camera != undefined )
    {
        var camera = this._gltf.cameras[node.camera];
        var viewpoint = this._generateX3DViewpoint(camera);
        viewpoint.setAttribute('DEF', this._cameraPrefix + node.camera);

        x3dNode.appendChild(viewpoint);
    }

    if ( !node.name )
    {
        node.name = index;
    }
    
    var nodeDEF = this._nodeNamePrefix + node.name;

    x3dNode.setAttribute( "DEF", nodeDEF );

    return x3dNode;
};

/**
 * Generates a X3D scene node
 */
x3dom.glTF2Loader.prototype._generateX3DScene = function()
{
    var scene = document.createElement( "scene" );

    return scene;
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
 * Generates a X3D viewpoint or orthoviepoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {Viewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DViewpoint = function(camera)
{
    switch(camera.type)
    {
        case "orthographic":
            return this._generateX3DOrthoViewpoint(camera.orthographic);
        case "perspective":
            return this._generateX3DPerspectiveViewpoint(camera.perspective);
        default:
            return this._generateX3DPerspectiveViewpoint(camera.perspective);
    }
};

/**
 * Generates a X3D viewpoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {Viewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DPerspectiveViewpoint = function(camera)
{
    var viewpoint = document.createElement("viewpoint");

    var fov   = camera.yfov  || 0.785398;
    var znear = camera.znear || -1;
    var zfar  = camera.zfar  || -1;

    viewpoint.setAttribute("fieldOfView", fov);
    viewpoint.setAttribute("zNear", znear);
    viewpoint.setAttribute("zFar", zfar);
    viewpoint.setAttribute("position", "0 0 0");

    return viewpoint;
};

/**
 * Generates a X3D orthoviewpoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {OrthoViewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DOrthoViewpoint = function(camera)
{
    var viewpoint = document.createElement("orthoviewpoint");

    var xmag  = camera.xmag  ||  1;
    var ymag  = camera.ymag  ||  1;
    var znear = camera.znear || -1;
    var zfar  = camera.zfar  || -1;
    var fov   = [-xmag, -ymag, xmag, ymag];

    viewpoint.setAttribute("fieldOfView", fov);
    viewpoint.setAttribute("zNear", znear);
    viewpoint.setAttribute("zFar", zfar);
    viewpoint.setAttribute("position", "0 0 0");

    return viewpoint;
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

    var material = (primitive.material != undefined) ? this._gltf.materials[ primitive.material ] : {};

    shape.appendChild(this._generateX3DAppearance( material ));

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

    appearance.appendChild(this._generateX3DPhysicalMaterial(material));

    if(this._textureTransform)
    {
        appearance.appendChild(this._textureTransform);
        this._textureTransform = undefined;
    }

    return appearance;
};

x3dom.glTF2Loader.prototype._generateX3DPhysicalMaterial = function(material)
{
    var mat = document.createElement("physicalmaterial");

    var texture;
    var baseColorFactor   = [1,1,1,1];
    var emissiveFactor    = material.emissiveFactor || [0,0,0];
    var metallicFactor    = 1;
    var roughnessFactor   = 1;
    var alphaMode         = material.alphaMode || "OPAQUE";
    var alphaCutoff       = material.alphaCutoff || 0.5;
    var seperateOcclusion = true
    var model             = undefined;
    var pbr               = undefined;
    var channel           = 0;  
    var transform;

    if( material.pbrMetallicRoughness )
    {
        pbr = material.pbrMetallicRoughness;
        model = "roughnessMetallic";
    }
    else if(material.extensions && material.extensions.KHR_materials_pbrSpecularGlossiness)
    {
        pbr = material.extensions.KHR_materials_pbrSpecularGlossiness;
        model = "specularGlossiness";
    }

    if( model == "roughnessMetallic" )
    {
        var baseColorFactor = pbr.baseColorFactor || [1,1,1,1];
        var metallicFactor  = (pbr.metallicFactor  != undefined) ? pbr.metallicFactor  : 1;
        var roughnessFactor = (pbr.roughnessFactor != undefined) ? pbr.roughnessFactor : 1;

        if(pbr.baseColorTexture)
        {
            channel = (pbr.baseColorTexture.texCoord) ? 1 : 0;
            texture = this._gltf.textures[pbr.baseColorTexture.index];
            transform = (pbr.baseColorTexture.extensions && pbr.baseColorTexture.extensions.KHR_texture_transform) ? 
                         pbr.baseColorTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild(this._generateX3DImageTexture(texture, "baseColorTexture", channel, transform));
        }

        if(pbr.metallicRoughnessTexture)
        {
            channel = (pbr.metallicRoughnessTexture.texCoord) ? 1 : 0;
            texture = this._gltf.textures[pbr.metallicRoughnessTexture.index];
            transform = (pbr.metallicRoughnessTexture.extensions && pbr.metallicRoughnessTexture.extensions.KHR_texture_transform) ? 
                         pbr.metallicRoughnessTexture.extensions.KHR_texture_transform : undefined;

            if( material.occlusionTexture && material.occlusionTexture.index == pbr.metallicRoughnessTexture.index)
            {
                seperateOcclusion = false;        
                mat.appendChild(this._generateX3DImageTexture(texture, "occlusionRoughnessMetallicTexture", channel, transform));
            }
            else
            {
                mat.appendChild(this._generateX3DImageTexture(texture, "roughnessMetallicTexture", channel, transform));
            }
        }

        mat.setAttribute("baseColorFactor", baseColorFactor.join(" "));
        mat.setAttribute("metallicFactor",  metallicFactor);
        mat.setAttribute("roughnessFactor", roughnessFactor);
    }
    else if ( model == "specularGlossiness" )
    {
        var diffuseFactor    = pbr.diffuseFactor || [ 1, 1, 1, 1 ];
        var specularFactor   = pbr.specularFactor || [ 1, 1, 1 ];
        var glossinessFactor = (pbr.glossinessFactor != undefined) ? pbr.glossinessFactor : 1;

        if ( pbr.diffuseTexture )
        {
            channel = (pbr.diffuseTexture.texCoord) ? 1 : 0;
            texture = this._gltf.textures[pbr.diffuseTexture.index];
            transform = (pbr.diffuseTexture.extensions && pbr.diffuseTexture.extensions.KHR_texture_transform) ? 
                         pbr.diffuseTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild(this._generateX3DImageTexture(texture, "baseColorTexture", channel, transform));
        }

        if ( pbr.specularGlossinessTexture )
        {
            channel = (pbr.specularGlossinessTexture.texCoord) ? 1 : 0;
            texture = this._gltf.textures[pbr.specularGlossinessTexture.index];
            transform = (pbr.specularGlossinessTexture.extensions && pbr.specularGlossinessTexture.extensions.KHR_texture_transform) ? 
                         pbr.specularGlossinessTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild(this._generateX3DImageTexture(texture, "specularGlossinessTexture", channel, transform));
        }

        mat.setAttribute("diffuseFactor", diffuseFactor.join(" "));
        mat.setAttribute("specularFactor",  specularFactor.join(" "));
        mat.setAttribute("glossinessFactor", glossinessFactor);
    }

    if(material.normalTexture)
    {
        channel = (material.normalTexture.texCoord) ? 1 : 0;
        texture = this._gltf.textures[material.normalTexture.index];
        transform = (material.normalTexture.extensions && material.normalTexture.extensions.KHR_texture_transform) ? 
                     material.normalTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild(this._generateX3DImageTexture(texture, "normalTexture", channel, transform));
    }

    if(material.emissiveTexture)
    {
        channel = (material.emissiveTexture.texCoord) ? 1 : 0;
        texture = this._gltf.textures[material.emissiveTexture.index];
        transform = (material.emissiveTexture.extensions && material.emissiveTexture.extensions.KHR_texture_transform) ? 
                     material.emissiveTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild(this._generateX3DImageTexture(texture, "emissiveTexture", channel, transform));
    }

    if(material.occlusionTexture && seperateOcclusion)
    {
        channel = (material.occlusionTexture.texCoord) ? 1 : 0;
        texture = this._gltf.textures[material.occlusionTexture.index];
        transform = (material.occlusionTexture.extensions && material.occlusionTexture.extensions.KHR_texture_transform) ? 
                     material.occlusionTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild(this._generateX3DImageTexture(texture, "occlusionTexture", channel, transform));
    }

    if(material.extensions && material.extensions.KHR_materials_unlit)
    {
        mat.setAttribute("unlit", true);
    }

    mat.setAttribute("emissiveFactor",  emissiveFactor.join(" "));
    mat.setAttribute("alphaMode",  alphaMode);
    mat.setAttribute("alphaCutoff", alphaCutoff);
    mat.setAttribute("model", model);

    return mat;
};

/**
 * Generates a X3D image texture node
 * @private
 * @param {Object} image - A glTF image node
 * @return {Imagetexture}
 */
x3dom.glTF2Loader.prototype._generateX3DImageTexture = function(texture, containerField, channel, transform)
{
    var image   = this._gltf.images[texture.source];

    var imagetexture = document.createElement("imagetexture");

    imagetexture.setAttribute("origChannelCount", "2");
    imagetexture.setAttribute("flipY", "true");

    if(containerField)
    {
        imagetexture.setAttribute("containerField", containerField);
    }

    if(image.uri != undefined)
    {
        imagetexture.setAttribute("url", x3dom.Utils.dataURIToObjectURL(image.uri));
    }

    if(texture.sampler != undefined)
    {
        var sampler = this._gltf.samplers[texture.sampler];
        imagetexture.appendChild(this._createX3DTextureProperties(sampler));
    }

    if(channel)
    {
        imagetexture.setAttribute("channel", "1");
    }

    if(transform)
    {
        this._textureTransform = this._createX3DTextureTransform(imagetexture, transform);
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
 * Generates a X3D TextureTransform node
 * @private
 * @param {Object} primitive - A glTF texture transform node
 * @return {TextureTransform}
 */
x3dom.glTF2Loader.prototype._createX3DTextureTransform = function(imagetexture, transform)
{
    var texturetransform = document.createElement("texturetransform");

    var offset   = transform.offset || [0, 0];
    var rotation = transform.rotation || 0;
    var scale    = transform.scale || [1, 1] ;

    if(transform.texCoord)
    {
        imagetexture.setAttribute("channel", texCoord);
    }

    texturetransform.setAttribute("translation", offset.join(" "));
    texturetransform.setAttribute("scale", scale.join(" "));
    texturetransform.setAttribute("rotation", rotation * -1.0);

    return texturetransform;
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
    var bufferView = document.createElement( "bufferview" );

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

    var bufferAccessor = document.createElement( "bufferaccessor" );

    bufferAccessor.setAttribute("bufferType", buffer.replace("_0", ""));
    bufferAccessor.setAttribute("view", viewID);
    bufferAccessor.setAttribute("byteOffset", byteOffset || 0);
    bufferAccessor.setAttribute("byteStride", bufferView.byteStride || 0);
    bufferAccessor.setAttribute("normalized", accessor.normalized || false);

    bufferAccessor.setAttribute("components", components);
    bufferAccessor.setAttribute("componentType", accessor.componentType);
    bufferAccessor.setAttribute("count", accessor.count);

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

        uri = x3dom.Utils.dataURIToObjectURL(buffer.uri);
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
        return (typeof input == "string") ? JSON.parse(input) : input;
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

                gltf.buffers[0].uri = x3dom.Utils.arrayBufferToObjectURL(binaryData, "application/octet-stream");

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

            if( image.bufferView != undefined )
            {
                var bufferView = gltf.bufferViews[image.bufferView];

                var imageData = new Uint8Array(buffer, byteOffset + bufferView.byteOffset, bufferView.byteLength);

                image.uri = x3dom.Utils.arrayBufferToObjectURL(imageData, image.mimeType);
            }
        }
    }
};
