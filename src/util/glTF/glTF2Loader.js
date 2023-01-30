/**
 *
 * @param {Object} gltf
 * @param {NodeNameSpace} nameSpace
 */
x3dom.glTF2Loader = function ( nameSpace )
{
    this._nameSpace = nameSpace;
    this._definitions = {};
    this._supportedExtensions = [
        "KHR_materials_pbrSpecularGlossiness",
        "KHR_materials_unlit",
        "KHR_texture_transform"
    ];
};

/**
 * Starts the loading/parsing of the glTF-Object
 * @param {Object} gltf
 */
x3dom.glTF2Loader.prototype.load = function ( input, binary )
{
    this._gltf = this._getGLTF( input, binary );

    //generate X3D scene
    var x3dScene = this._generateX3DScene();

    //Get the scene ID
    var sceneID = this._gltf.scene || 0;

    //Get the scene
    var scene = this._gltf.scenes[ sceneID ];

    //generate worldinfo from asset properties and extras
    this._generateX3DWorldInfo( scene, x3dScene );

    //check if unsupported extension are required
    if ( this._unsupportedExtensionsRequired() )
    {
        x3dom.debug.logWarning( "Cannot render glTF." );
        x3dom.debug.logWarning( "Some required extension of " + this._gltf.extensionsRequired + " not supported." );
        return x3dScene;
    }

    // Get the nodes
    for ( var i = 0; i < scene.nodes.length; i++ )
    {
        var node = this._gltf.nodes[ scene.nodes[ i ] ];

        this._traverseNodes( node, x3dScene, scene.nodes[ i ] );
    }

    //Get the animations
    if ( this._gltf.animations )
    {
        for ( var i = 0; i < this._gltf.animations.length; i++ )
        {
            var animation   = this._gltf.animations[ i ];
            var animationID = "glTF_ANIMATION_" + i;

            this._generateX3DAnimationNodes( x3dScene, animation, animationID );
        }
    }

    return x3dScene;
};

/**
 * return true if an extension is required but not supported
 */
x3dom.glTF2Loader.prototype._unsupportedExtensionsRequired = function ()
{
    if ( !this._gltf.extensionsRequired )
    {
        return false;
    }
    return this._gltf.extensionsRequired.some( function ( e )
    {
        return this._supportedExtensions.indexOf( e ) < 0;
    }, this );
};

/**
 * extract asset properties, extras and append as WorldInfo, metadata
 * @param {Object} scene - A gltf scene node
 * @param {X3DNode} parent - A X3D-Node
 */
x3dom.glTF2Loader.prototype._generateX3DWorldInfo = function ( scene, parent )
{
    if ( this._gltf.asset ) //should always exist
    {
        var asset = this._gltf.asset;
        var assetProperties = [ "copyright", "generator", "version", "minversion" ];
        var worldInfo = document.createElement( "worldinfo" );

        var info = new x3dom.fields.MFString();
        var property,
            i;
        for ( i = 0; i < assetProperties.length; i++ )
        {
            property = assetProperties[ i ];
            if ( asset[ property ] )
            {
                info.push( "\"" + assetProperties[ i ] + ":" + asset[ property ] + "\"" );  //toString() does not put in quotes
            }
        }
        worldInfo.setAttribute( "info", info.toString() );

        if ( asset.extras && asset.extras.title )
        {
            worldInfo.setAttribute( "title", asset.extras.title );
        }

        //need holder for both asset and scene extras
        var metadata = document.createElement( "MetadataSet" );
        metadata.setAttribute( "name", "global" );
        metadata.setAttribute( "containerfield", "metadata" );

        this._generateX3DMetadata( asset, metadata, "asset_extras", "value" );
        this._generateX3DMetadata( scene, metadata, "scene_extras", "value" );

        if ( metadata.hasChildNodes() ) { worldInfo.appendChild( metadata ); }

        parent.appendChild( worldInfo );
    }
};

/**
 * append metadata nodes from extras
 * @param {Object} node - A glTF node with extras
 * @param {X3DNode} parent - A X3D-Node
 * @param {X3DNode} name - name for name field
 */
x3dom.glTF2Loader.prototype._generateX3DMetadata = function ( node, parent, name, containerfield )
{
    if ( !node.extras ) { return; }

    name = name || "extras";
    containerfield = containerfield || "metadata";

    var metadata = _generateMetadata( name, node.extras, containerfield );

    parent.appendChild( metadata );

    return;

    function _generateMetadata ( name, value, cf )
    {
        var type = typeof value;

        if ( type == "string" || value === null || type == "undefined" )
        {
            return _generateX3DMetadataNode( "MetadataString", name, JSON.stringify( value ), cf );
        }
        else if ( type == "number" )  { return _generateX3DMetadataNode( "MetadataFloat", name, value, cf ); }
        else if ( type == "boolean" ) { return _generateX3DMetadataNode( "MetadataBoolean", name, value, cf ); }
        else if ( type == "object" )  { return _generateX3DMetadataSetNode( name, value, cf ); }
        return _generateX3DMetadataNode( "MetadataString", name, value, cf ); // should never happen
    }

    function _generateX3DMetadataNode ( nodename, name, value, cf )
    {
        var x3dnode = document.createElement( nodename );
        x3dnode.setAttribute( "name", name );
        x3dnode.setAttribute( "value", value );
        x3dnode.setAttribute( "containerfield", cf );
        return x3dnode;
    }

    function _generateX3DMetadataSetNode ( name, value, cf )
    {
        var x3dnode = document.createElement( "MetadataSet" );
        x3dnode.setAttribute( "name", name );
        x3dnode.setAttribute( "containerfield", cf );
        var keys = Object.keys( value ),
            key,
            i;
        for ( i = 0; i < keys.length; i++ )
        {
            key = keys[ i ];
            x3dnode.appendChild( _generateMetadata( key, value[ key ], "value" ) );
        }
        return x3dnode;
    }
};
/**
 * Traverses all glTF nodes
 * @param {Object} node - A glTF-Node
 * @param {X3DNode} parent - A X3D-Node
 */
x3dom.glTF2Loader.prototype._traverseNodes = function ( node, parent, index )
{
    var x3dNode = this._generateX3DNode( node, index );

    parent.appendChild( x3dNode );

    if ( node.children )
    {
        for ( var i = 0; i < node.children.length; i++ )
        {
            var child = this._gltf.nodes[ node.children[ i ] ];

            this._traverseNodes( child, x3dNode, node.children[ i ] );
        }
    }
};

/**
 * Generates a X3D node from a glTF node
 * @param {Object} node - A glTF-Node
 */
x3dom.glTF2Loader.prototype._generateX3DNode = function ( node, index )
{
    var x3dNode;

    node.name = ( node.name ) ? node.name : index;

    if ( node.matrix != undefined )
    {
        x3dNode = this._generateX3DMatrixTransform( node );
    }
    else if ( node.translation != undefined ||
             node.rotation    != undefined ||
             node.scale       != undefined )
    {
        x3dNode = this._generateX3DTransform( node );
    }
    else
    {
        x3dNode = this._generateX3DTransform( node ); // always use Transform in case of animations
    }

    this._generateX3DMetadata( node, x3dNode );

    if ( node.mesh != undefined )
    {
        var mesh = this._gltf.meshes[ node.mesh ];

        for ( var i = 0; i < mesh.primitives.length; i++ )
        {
            x3dNode.appendChild( this._generateX3DShape( mesh.primitives[ i ] ) );
        }
    }

    if ( node.model != undefined )
    {
        var model = this._gltf.models[ node.model ];

        if ( model.uri != undefined )
        {
            x3dNode.appendChild( this._generateX3DInline( model ) );
        }
    }

    if ( node.camera != undefined )
    {
        x3dNode.appendChild( this._generateX3DViewpoint( node ) );
    }

    return x3dNode;
};

/**
 * Generates a X3D scene node
 */
x3dom.glTF2Loader.prototype._generateX3DScene = function ()
{
    var scene = document.createElement( "scene" );

    return scene;
};

/**
 * Generates a X3D transform node
 * @param {Object} node - A glTF-Node
 */
x3dom.glTF2Loader.prototype._generateX3DTransform = function ( node )
{
    var transform = document.createElement( "transform" );

    if ( node.translation != undefined )
    {
        transform.setAttribute( "translation", node.translation.join( " " ) );
    }

    if ( node.rotation != undefined )
    {
        transform.setAttribute( "rotation", this._toAxisAngle( node.rotation ).join( " " ) );
    }

    if ( node.scale != undefined )
    {
        transform.setAttribute( "scale", node.scale.join( " " ) );
    }

    if ( node.name != undefined )
    {
        transform.setAttribute( "DEF", "glTF_NODE_" + node.name );
    }

    return transform;
};

/**
 * Generates a X3D matrix transform node
 * @param {Object} node - A glTF-Node
 * @return {MatrixTransform}
 */
x3dom.glTF2Loader.prototype._generateX3DMatrixTransform = function ( node )
{
    var matrixTransform = document.createElement( "matrixtransform" );

    if ( node.matrix != undefined )
    {
        matrixTransform.setAttribute( "matrix", node.matrix.join( " " ) );
    }

    if ( node.name != undefined )
    {
        matrixTransform.setAttribute( "DEF", "glTF_NODE_" + node.name );
    }

    return matrixTransform;
};

/**
 * Generates a X3D group node
 * @param {Object} node - A glTF-Node
 * @return {Group}
 */
x3dom.glTF2Loader.prototype._generateX3DGroup = function ( node )
{
    return document.createElement( "group" );
};

/**
 * Generates a X3D inline node
 * @param {Object} model - A glTF-Model
 * @return {Group}
 */
x3dom.glTF2Loader.prototype._generateX3DInline = function ( model )
{
    var inline =  document.createElement( "inline" );

    inline.setAttribute( "url", model.uri );

    if ( model.mimeType != undefined )
    {
        inline.setAttribute( "contentType", model.mimeType );
    }

    return inline;
};

/**
 * Generates a X3D viewpoint or orthoviepoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {Viewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DViewpoint = function ( node )
{
    var camera = this._gltf.cameras[ node.camera ];
    var cameraID = "glTF_CAMERA_" + node.camera;

    switch ( camera.type )
    {
        case "orthographic":
            return this._generateX3DOrthoViewpoint( cameraID, camera.orthographic );
        case "perspective":
            return this._generateX3DPerspectiveViewpoint( cameraID, camera.perspective );
        default:
            return this._generateX3DPerspectiveViewpoint( cameraID, camera.perspective );
    }
};

/**
 * Generates a X3D viewpoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {Viewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DPerspectiveViewpoint = function ( id, camera )
{
    var viewpoint = document.createElement( "viewpoint" );

    this._generateX3DMetadata( camera, viewpoint );

    var fov   = camera.yfov  || 0.785398;
    var znear = camera.znear || -1;
    var zfar  = camera.zfar  || -1;

    var _zratio = 100000;
    if ( zfar / znear > _zratio ) { zfar = znear = -1; }

    viewpoint.setAttribute( "DEF", id );
    viewpoint.setAttribute( "fieldOfView", fov );
    viewpoint.setAttribute( "zNear", znear );
    viewpoint.setAttribute( "zFar", zfar );
    viewpoint.setAttribute( "position", "0 0 0" );

    return viewpoint;
};

/**
 * Generates a X3D orthoviewpoint node
 * @private
 * @param {Object} camera - A glTF camera node
 * @return {OrthoViewpoint}
 */
x3dom.glTF2Loader.prototype._generateX3DOrthoViewpoint = function ( id, camera )
{
    var viewpoint = document.createElement( "orthoviewpoint" );

    this._generateX3DMetadata( camera, viewpoint );

    var xmag  = camera.xmag  ||  1;
    var ymag  = camera.ymag  ||  1;
    var znear = camera.znear || -1;
    var zfar  = camera.zfar  || -1;
    var fov   = [ -xmag, -ymag, xmag, ymag ];

    viewpoint.setAttribute( "DEF", id );
    viewpoint.setAttribute( "fieldOfView", fov );
    viewpoint.setAttribute( "zNear", znear );
    viewpoint.setAttribute( "zFar", zfar );
    viewpoint.setAttribute( "position", "0 0 0" );

    return viewpoint;
};

/**
 * Generates a X3D shape node
 * @private
 * @param {Object} primitive - A glTF primitive node
 * @return {Shape}
 */
x3dom.glTF2Loader.prototype._generateX3DShape = function ( primitive )
{
    var shape = document.createElement( "shape" );

    this._generateX3DMetadata( primitive, shape );

    var material = ( primitive.material != undefined ) ? this._gltf.materials[ primitive.material ] : { name: "DEFAULT" };
    if ( material.name == undefined ) {material.name = primitive.material;}

    shape.appendChild( this._generateX3DAppearance( material ) );

    shape.appendChild( this._generateX3DBufferGeometry( primitive ) );

    return shape;
};

/**
 * Generates a X3D appearance node
 * @private
 * @param {Object} primitive - A glTF material node
 * @return {Appearance}
 */
x3dom.glTF2Loader.prototype._generateX3DAppearance = function ( material )
{
    var appearance = document.createElement( "appearance" );

    this._generateX3DMetadata( material, appearance );

    if ( material.alphaMode === "BLEND" )
    {
        appearance.setAttribute( "sortType", "transparent" );
    }
    else
    {
        appearance.setAttribute( "sortType", "opaque" );
    }

    appearance.appendChild( this._generateX3DPhysicalMaterial( material ) );

    if ( this._textureTransform )
    {
        appearance.appendChild( this._textureTransform );
        this._textureTransform = undefined;
    }

    return appearance;
};

x3dom.glTF2Loader.prototype._generateX3DPhysicalMaterial = function ( material )
{
    var mat = document.createElement( "physicalmaterial" );

    if ( this._USEorDEF( mat, "glTF_MATERIAL_" + material.name ) )
    {
        return mat;
    }

    var texture,
        baseColorFactor   = [ 1, 1, 1, 1 ],
        emissiveFactor    = material.emissiveFactor || [ 0, 0, 0 ],
        metallicFactor    = 1,
        roughnessFactor   = 1,
        alphaMode         = material.alphaMode || "OPAQUE",
        alphaCutoff       = material.alphaCutoff || 0.5,
        seperateOcclusion = true,
        model             = undefined,
        pbr               = undefined,
        channel           = 0,
        transform;

    if ( material.pbrMetallicRoughness )
    {
        pbr = material.pbrMetallicRoughness;
        model = "roughnessMetallic";
    }
    else if ( material.extensions && material.extensions.KHR_materials_pbrSpecularGlossiness )
    {
        pbr = material.extensions.KHR_materials_pbrSpecularGlossiness;
        model = "specularGlossiness";
    }

    if ( model == "roughnessMetallic" )
    {
        var baseColorFactor = pbr.baseColorFactor || [ 1, 1, 1, 1 ];
        var metallicFactor  = ( pbr.metallicFactor  != undefined ) ? pbr.metallicFactor  : 1;
        var roughnessFactor = ( pbr.roughnessFactor != undefined ) ? pbr.roughnessFactor : 1;

        if ( pbr.baseColorTexture )
        {
            channel = ( pbr.baseColorTexture.texCoord ) ? 1 : 0;
            texture = this._gltf.textures[ pbr.baseColorTexture.index ];
            transform = ( pbr.baseColorTexture.extensions && pbr.baseColorTexture.extensions.KHR_texture_transform ) ?
                pbr.baseColorTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild( this._generateX3DImageTexture( texture, "baseColorTexture", channel, transform ) );
        }

        if ( pbr.metallicRoughnessTexture )
        {
            channel = ( pbr.metallicRoughnessTexture.texCoord ) ? 1 : 0;
            texture = this._gltf.textures[ pbr.metallicRoughnessTexture.index ];
            transform = ( pbr.metallicRoughnessTexture.extensions && pbr.metallicRoughnessTexture.extensions.KHR_texture_transform ) ?
                pbr.metallicRoughnessTexture.extensions.KHR_texture_transform : undefined;

            if ( material.occlusionTexture && material.occlusionTexture.index == pbr.metallicRoughnessTexture.index )
            {
                seperateOcclusion = false;
                mat.appendChild( this._generateX3DImageTexture( texture, "occlusionRoughnessMetallicTexture", channel, transform ) );
            }
            else
            {
                mat.appendChild( this._generateX3DImageTexture( texture, "roughnessMetallicTexture", channel, transform ) );
            }
        }

        mat.setAttribute( "baseColorFactor", baseColorFactor.join( " " ) );
        mat.setAttribute( "metallicFactor",  metallicFactor );
        mat.setAttribute( "roughnessFactor", roughnessFactor );
    }
    else if ( model == "specularGlossiness" )
    {
        var diffuseFactor    = pbr.diffuseFactor || [ 1, 1, 1, 1 ];
        var specularFactor   = pbr.specularFactor || [ 1, 1, 1 ];
        var glossinessFactor = ( pbr.glossinessFactor != undefined ) ? pbr.glossinessFactor : 1;

        if ( pbr.diffuseTexture )
        {
            channel = ( pbr.diffuseTexture.texCoord ) ? 1 : 0;
            texture = this._gltf.textures[ pbr.diffuseTexture.index ];
            transform = ( pbr.diffuseTexture.extensions && pbr.diffuseTexture.extensions.KHR_texture_transform ) ?
                pbr.diffuseTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild( this._generateX3DImageTexture( texture, "baseColorTexture", channel, transform ) );
        }

        if ( pbr.specularGlossinessTexture )
        {
            channel = ( pbr.specularGlossinessTexture.texCoord ) ? 1 : 0;
            texture = this._gltf.textures[ pbr.specularGlossinessTexture.index ];
            transform = ( pbr.specularGlossinessTexture.extensions && pbr.specularGlossinessTexture.extensions.KHR_texture_transform ) ?
                pbr.specularGlossinessTexture.extensions.KHR_texture_transform : undefined;
            mat.appendChild( this._generateX3DImageTexture( texture, "specularGlossinessTexture", channel, transform ) );
        }

        mat.setAttribute( "diffuseFactor", diffuseFactor.join( " " ) );
        mat.setAttribute( "specularFactor",  specularFactor.join( " " ) );
        mat.setAttribute( "glossinessFactor", glossinessFactor );
    }

    if ( material.normalTexture )
    {
        channel = ( material.normalTexture.texCoord ) ? 1 : 0;
        texture = this._gltf.textures[ material.normalTexture.index ];
        transform = ( material.normalTexture.extensions && material.normalTexture.extensions.KHR_texture_transform ) ?
            material.normalTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild( this._generateX3DImageTexture( texture, "normalTexture", channel, transform ) );
    }

    if ( material.emissiveTexture )
    {
        channel = ( material.emissiveTexture.texCoord ) ? 1 : 0;
        texture = this._gltf.textures[ material.emissiveTexture.index ];
        transform = ( material.emissiveTexture.extensions && material.emissiveTexture.extensions.KHR_texture_transform ) ?
            material.emissiveTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild( this._generateX3DImageTexture( texture, "emissiveTexture", channel, transform ) );
    }

    if ( material.occlusionTexture && seperateOcclusion )
    {
        channel = ( material.occlusionTexture.texCoord ) ? 1 : 0;
        texture = this._gltf.textures[ material.occlusionTexture.index ];
        transform = ( material.occlusionTexture.extensions && material.occlusionTexture.extensions.KHR_texture_transform ) ?
            material.occlusionTexture.extensions.KHR_texture_transform : undefined;
        mat.appendChild( this._generateX3DImageTexture( texture, "occlusionTexture", channel, transform ) );
    }

    if ( material.extensions && material.extensions.KHR_materials_unlit )
    {
        mat.setAttribute( "unlit", true );
    }

    mat.setAttribute( "emissiveFactor",  emissiveFactor.join( " " ) );
    mat.setAttribute( "alphaMode",  alphaMode );
    mat.setAttribute( "alphaCutoff", alphaCutoff );
    mat.setAttribute( "model", model );

    return mat;
};

/**
 * Generates a X3D image texture node
 * @private
 * @param {Object} image - A glTF image node
 * @return {Imagetexture}
 */
x3dom.glTF2Loader.prototype._generateX3DImageTexture = function ( texture, containerField, channel, transform )
{
    var image   = this._gltf.images[ texture.source ];

    var imagetexture = document.createElement( "imagetexture" );

    this._generateX3DMetadata( texture, imagetexture );

    imagetexture.setAttribute( "origChannelCount", "2" );
    imagetexture.setAttribute( "flipY", "true" );

    if ( containerField )
    {
        imagetexture.setAttribute( "containerField", containerField );
    }

    if ( image.uri != undefined )
    {
        imagetexture.setAttribute( "url", x3dom.Utils.dataURIToObjectURL( image.uri ) );
    }

    if ( texture.sampler != undefined )
    {
        var sampler = this._gltf.samplers[ texture.sampler ];
        imagetexture.appendChild( this._createX3DTextureProperties( sampler ) );
    }

    if ( channel )
    {
        imagetexture.setAttribute( "channel", "1" );
    }

    if ( transform )
    {
        this._textureTransform = this._createX3DTextureTransform( imagetexture, transform );
    }

    return imagetexture;
};

/**
 * Generates a X3D TextureProperties node
 * @private
 * @param {Object} primitive - A glTF sampler node
 * @return {TextureProperties}
 */
x3dom.glTF2Loader.prototype._createX3DTextureProperties = function ( sampler )
{
    var textureproperties = document.createElement( "textureproperties" );

    textureproperties.setAttribute( "boundaryModeS", x3dom.Utils.boundaryModesDicX3D( sampler.wrapS ) );
    textureproperties.setAttribute( "boundaryModeT", x3dom.Utils.boundaryModesDicX3D( sampler.wrapT ) );

    textureproperties.setAttribute( "magnificationFilter", x3dom.Utils.magFilterDicX3D( sampler.magFilter ) );
    textureproperties.setAttribute( "minificationFilter",  x3dom.Utils.minFilterDicX3D( sampler.minFilter ) );

    if ( sampler.minFilter == undefined || ( sampler.minFilter >= 9984 && sampler.minFilter <= 9987 ) )
    {
        textureproperties.setAttribute( "generateMipMaps", "true" );
    }

    return textureproperties;
};

/**
 * Generates a X3D TextureTransform node
 * @private
 * @param {Object} transform - A glTF texture transform node
 * @return {TextureTransform}
 */
x3dom.glTF2Loader.prototype._createX3DTextureTransform = function ( imagetexture, transform )
{
    var texturetransform = document.createElement( "matrixtexturetransform" );

    var offset   = transform.offset || [ 0, 0 ];
    var rotation = transform.rotation || 0;
    var scale    = transform.scale || [ 1, 1 ] ;
    // var center = transform.center || [0 0] ;

    var negCenter = new x3dom.fields.SFVec3f( -0, -0, 0 ); // in case of a future gltf pivot
    var posCenter = new x3dom.fields.SFVec3f( 0, 0, 0 );
    var trans3 = new x3dom.fields.SFVec3f( offset[ 0 ], offset[ 1 ], 0 );
    var scale3 = new x3dom.fields.SFVec3f( scale[ 0 ], scale[ 1 ], 0 );

    var trafo =
        x3dom.fields.SFMatrix4f.translation( posCenter.add( trans3 ) ).
            mult( x3dom.fields.SFMatrix4f.rotationZ( rotation * -1.0 ) ).
            mult( x3dom.fields.SFMatrix4f.scale( scale3 ) ).
            mult( x3dom.fields.SFMatrix4f.translation( negCenter ) ); // center is not used in gltf

    texturetransform.setAttribute( "matrix", trafo.toString() );

    if ( transform.texCoord )
    {
        imagetexture.setAttribute( "channel", texCoord );
    }

    return texturetransform;
};

/**
 * Generates a X3D BufferGeometry node
 * @private
 * @param {Object} primitive - A glTF primitive node
 * @return {BufferGeometry}
 */
x3dom.glTF2Loader.prototype._generateX3DBufferGeometry = function ( primitive )
{
    var views = [];
    var bufferGeometry = document.createElement( "buffergeometry" );
    var centerAndSize = this._getCenterAndSize( primitive );

    bufferGeometry.setAttribute( "buffer", this._bufferURI( primitive ) );
    bufferGeometry.setAttribute( "position", centerAndSize.center.join( " " ) );
    bufferGeometry.setAttribute( "size", centerAndSize.size.join( " " ) );
    bufferGeometry.setAttribute( "vertexCount", this._getVertexCount( primitive ) );
    bufferGeometry.setAttribute( "primType", this._primitiveType( primitive.mode ) );

    //Check Material for double sided rendering
    if ( primitive.material != undefined )
    {
        var material = this._gltf.materials[ primitive.material ];

        if ( material.doubleSided )
        {
            bufferGeometry.setAttribute( "solid", "false" );
        }
    }

    //Check for indices
    if ( primitive.indices != undefined )
    {
        var accessor = this._gltf.accessors[ primitive.indices ];

        var view = this._gltf.bufferViews[ accessor.bufferView ];
        view.id = accessor.bufferView;
        view.target = 34963;

        var viewID = views.indexOf( view );

        if ( view.target != undefined && viewID == -1 )
        {
            viewID = views.push( view ) - 1;
        }

        bufferGeometry.appendChild( this._generateX3DBufferAccessor( "INDEX", accessor, viewID ) );
    }

    for ( var attribute in primitive.attributes )
    {
        var accessor = this._gltf.accessors[ primitive.attributes[ attribute ] ];

        var view = this._gltf.bufferViews[ accessor.bufferView ];
        view.target = 34962;
        view.id = accessor.bufferView;

        var viewID = views.indexOf( view );

        if ( view.target != undefined && viewID == -1 )
        {
            viewID = views.push( view ) - 1;
        }

        bufferGeometry.appendChild( this._generateX3DBufferAccessor( attribute, accessor, viewID ) );
    }

    for ( var i = 0; i < views.length; i++ )
    {
        bufferGeometry.appendChild( this._generateX3DBufferView( views[ i ] ) );
    }

    return bufferGeometry;
};

x3dom.glTF2Loader.prototype._generateX3DBufferView = function ( view )
{
    var bufferView = document.createElement( "bufferview" );

    bufferView.setAttribute( "target",     view.target );
    bufferView.setAttribute( "byteOffset", view.byteOffset || 0 );
    bufferView.setAttribute( "byteLength", view.byteLength );
    bufferView.setAttribute( "id", view.id );

    return bufferView;
};

x3dom.glTF2Loader.prototype._generateX3DBufferAccessor = function ( buffer, accessor, viewID )
{
    var components = this._componentsOf( accessor.type );

    var bufferView = this._gltf.bufferViews[ accessor.bufferView ];

    var byteOffset = accessor.byteOffset;

    var bufferAccessor = document.createElement( "bufferaccessor" );

    bufferAccessor.setAttribute( "bufferType", buffer.replace( "_0", "" ) );
    bufferAccessor.setAttribute( "view", viewID );
    bufferAccessor.setAttribute( "byteOffset", byteOffset || 0 );
    bufferAccessor.setAttribute( "byteStride", bufferView.byteStride || 0 );
    bufferAccessor.setAttribute( "normalized", accessor.normalized || false );

    bufferAccessor.setAttribute( "components", components );
    bufferAccessor.setAttribute( "componentType", accessor.componentType );
    bufferAccessor.setAttribute( "count", accessor.count );

    return bufferAccessor;
};

/**
 * generate necessary animation nodes
 * @param {X3DNode} x3dScene - A X3D-Node
 * @param {Node} animation - animatio node
 * @param {Number} a_i - animation index
 */
x3dom.glTF2Loader.prototype._generateX3DAnimationNodes = function ( x3dScene, animation, animationID )
{
    var duration     = this._animationDuration( animation );
    var timeSensorID = animationID + "_TIMESENSOR";

    x3dScene.appendChild( this._generateX3DTimeSensor( timeSensorID, duration ) );

    for ( var i = 0; i < animation.channels.length; i++ )
    {
        var channel        = animation.channels[ i ];
        var path           = channel.target.path;
        var node           = channel.target.node;
        var sampler        = animation.samplers[ channel.sampler ];
        var targetID       = "glTF_NODE_" + this._gltf.nodes[ node ].name;
        var interpolatorID = animationID + "_INTERPOLATOR_" + i;

        x3dScene.appendChild( this._generateX3DInterpolator( interpolatorID,
            path,
            sampler,
            duration ) );

        x3dScene.appendChild( this._createX3DRoute( "fraction_changed",
            timeSensorID,
            "set_fraction",
            interpolatorID ) );

        x3dScene.appendChild( this._createX3DRoute( "value_changed",
            interpolatorID,
            "set_" + path,
            targetID ) );
    }
};

/**
 * generate and  append TimeSensor
 * @param {X3DNode} parent - A X3D-Node
 * @param {Number} duration - cycle interval
 * @param {String} aniID - DEF name
 */
x3dom.glTF2Loader.prototype._generateX3DTimeSensor = function ( id, duration )
{
    var clock = document.createElement( "TimeSensor" );

    clock.setAttribute( "loop", "true" );
    clock.setAttribute( "cycleInterval", duration );
    clock.setAttribute( "DEF", id );

    return clock;
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
x3dom.glTF2Loader.prototype._generateX3DInterpolator = function ( id, path, sampler, duration )
{
    var interpolator;
    var interpolation  = sampler.interpolation || "LINEAR";
    var accessorInput  = this._gltf.accessors[ sampler.input ];
    var accessorOutput = this._gltf.accessors[ sampler.output ];
    var viewInput      = this._gltf.bufferViews[ accessorInput.bufferView ];
    var viewOutput     = this._gltf.bufferViews[ accessorOutput.bufferView ];

    switch ( path )
    {
        case "scale":
        case "translation":
            interpolator = document.createElement( "PositionInterpolator" );
            break;
        case "rotation":
            interpolator = document.createElement( "OrientationInterpolator" );
            break;
        case "weights":
            interpolator = document.createElement( "ScalarInterpolator" );
            break;
    }

    interpolator.setAttribute( "DEF", id );
    interpolator.setAttribute( "buffer", this._bufferURI( sampler ) );
    interpolator.setAttribute( "interpolation", interpolation );
    interpolator.setAttribute( "duration", duration );

    interpolator.appendChild( this._generateX3DBufferAccessor( "SAMPLER_INPUT", accessorInput, 0 ) );
    interpolator.appendChild( this._generateX3DBufferAccessor( "SAMPLER_OUTPUT", accessorOutput, 1 ) );

    interpolator.appendChild( this._generateX3DBufferView( viewInput ) );
    interpolator.appendChild( this._generateX3DBufferView( viewOutput ) );

    return interpolator;
};

/**
 * Traverses all glTF nodes
 * @param {Object} node - A glTF-Node
 * @param {X3DNode} parent - A X3D-Node
 */
x3dom.glTF2Loader.prototype._createX3DRoute = function ( fromField, fromNode, toField, toNode )
{
    var route = document.createElement( "ROUTE" );

    route.setAttribute( "fromField", fromField );
    route.setAttribute( "fromNode", fromNode );
    route.setAttribute( "toField", toField );
    route.setAttribute( "toNode", toNode );

    return route;
};

/**
 */
x3dom.glTF2Loader.prototype._getCenterAndSize = function ( primitive )
{
    var size = [ 1, 1, 1 ];
    var center = [ 0, 0, 0 ];

    if ( primitive.attributes.POSITION != undefined )
    {
        var accessor = this._gltf.accessors[ primitive.attributes.POSITION ];

        size[ 0 ] = accessor.max[ 0 ] - accessor.min[ 0 ];
        size[ 1 ] = accessor.max[ 1 ] - accessor.min[ 1 ];
        size[ 2 ] = accessor.max[ 2 ] - accessor.min[ 2 ];

        center[ 0 ] = accessor.min[ 0 ] + size[ 0 ] * 0.5;
        center[ 1 ] = accessor.min[ 1 ] + size[ 1 ] * 0.5;
        center[ 2 ] = accessor.min[ 2 ] + size[ 2 ] * 0.5;
    }

    return {center: center, size: size};
};

x3dom.glTF2Loader.prototype._getVertexCount = function ( primitive )
{
    var vertexCount = 0;
    var accessor;

    if ( primitive.indices != undefined )
    {
        accessor = this._gltf.accessors[ primitive.indices ];
        vertexCount = accessor.count;
    }
    else if ( primitive.attributes.POSITION != undefined )
    {
        accessor = this._gltf.accessors[ primitive.attributes.POSITION ];
        vertexCount = accessor.count;
    }

    return vertexCount;
};

x3dom.glTF2Loader.prototype._sizeInBytes = function ( componentType )
{
    switch ( componentType )
    {
        case 5120: return 1;
        case 5121: return 1;
        case 5122: return 2;
        case 5123: return 2;
        case 5125: return 4;
        case 5126: return 4;
    }
};

x3dom.glTF2Loader.prototype._componentsOf = function ( type )
{
    switch ( type )
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

x3dom.glTF2Loader.prototype._bufferURI = function ( value )
{
    var uri = "",
        accessorIdx;

    if ( value.attributes != undefined && value.attributes.POSITION != undefined )
    {
        accessorIdx = value.attributes.POSITION;
    }
    else if ( value.input )
    {
        accessorIdx = value.input;
    }

    if ( accessorIdx != undefined )
    {
        var accessor = this._gltf.accessors[ accessorIdx ];
        var bufferView = this._gltf.bufferViews[ accessor.bufferView ];
        var buffer     = this._gltf.buffers[ bufferView.buffer ];

        uri = x3dom.Utils.dataURIToObjectURL( buffer.uri );
    }

    return uri;
};

x3dom.glTF2Loader.prototype._USEorDEF = function ( node, value )
{
    if ( this._definitions[ value ] != undefined )
    {
        node.setAttribute( "USE", value );
        return true;
    }
    else
    {
        node.setAttribute( "DEF", value );
        this._definitions[ value ] = value;
        return false;
    }
};

x3dom.glTF2Loader.prototype._primitiveType = function ( mode )
{
    switch ( mode )
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

x3dom.glTF2Loader.prototype._isDefaultSampler = function ( sampler )
{
    return ( sampler.wrapS     == 10497 && sampler.wrapT     == 10497 &&
             sampler.magFilter == 9729  && sampler.minFilter == 9729 );
};

x3dom.glTF2Loader.prototype._toAxisAngle = function ( quat )
{
    var result = [];
    var quat = new x3dom.fields.Quaternion( quat[ 0 ], quat[ 1 ], quat[ 2 ], quat[ 3 ] );
    var axisAngle = quat.toAxisAngle();

    result[ 0 ] = axisAngle[ 0 ].x;
    result[ 1 ] = axisAngle[ 0 ].y;
    result[ 2 ] = axisAngle[ 0 ].z;
    result[ 3 ] = axisAngle[ 1 ];

    return result;
};

/**
 */
x3dom.glTF2Loader.prototype._getGLTF = function ( input, binary )
{
    if ( !binary )
    {
        return ( typeof input == "string" ) ? JSON.parse( input ) : input;
    }

    var byteOffset = 0;

    var header = new Uint32Array( input, byteOffset, 3 );

    if ( header[ 0 ] == 1179937895 || header[ 1 ] == 2 )
    {
        byteOffset += 12;

        var jsonHeader = new Uint32Array( input, byteOffset, 2 );

        if ( jsonHeader[ 1 ] == 1313821514 )
        {
            byteOffset += 8;

            var jsonData = new Uint8Array( input, byteOffset, jsonHeader[ 0 ] );

            byteOffset += jsonHeader[ 0 ];

            var binaryHeader = new Uint32Array( input, byteOffset, 2 );

            if ( binaryHeader[ 1 ] == 5130562 )
            {
                byteOffset += 8;

                var binaryData = new Uint8Array( input, byteOffset, binaryHeader[ 0 ] );

                var gltf = x3dom.Utils.arrayBufferToJSON( jsonData );

                gltf.buffers[ 0 ].uri = x3dom.Utils.arrayBufferToObjectURL( binaryData, "application/octet-stream" );

                this._convertBinaryImages( gltf, input, byteOffset );

                return gltf;
            }
        }
    }
};

x3dom.glTF2Loader.prototype._convertBinaryImages = function ( gltf, buffer, byteOffset )
{
    if ( gltf.images != undefined )
    {
        for ( var i = 0; i < gltf.images.length; i++ )
        {
            var image = gltf.images[ i ];

            if ( image.bufferView != undefined )
            {
                var bufferView = gltf.bufferViews[ image.bufferView ];
                bufferView.byteOffset = bufferView.byteOffset || 0;

                var imageData = new Uint8Array( buffer, byteOffset + bufferView.byteOffset, bufferView.byteLength );

                image.uri = x3dom.Utils.arrayBufferToObjectURL( imageData, image.mimeType );
            }
        }
    }
};

/**
 * find animation input with longest duration
 * @param {Node} animation - the animation node
 */
x3dom.glTF2Loader.prototype._animationDuration = function ( animation )
{
    var duration = -1;

    for ( var i = 0; i < animation.channels.length; i++ )
    {
        var channel  = animation.channels[ i ];
        var sampler  = animation.samplers[ channel.sampler ];
        var accessor = this._gltf.accessors[ sampler.input ];

        duration = Math.max( accessor.max[ 0 ], duration );
    }

    return duration;
};
