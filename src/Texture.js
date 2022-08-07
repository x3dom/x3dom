/**
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Start Dash Video
 *
 * @param recurl
 * @param texturediv
 */
function startDashVideo ( recurl, texturediv )
{
    var vars = function ()
        {
            var vars = {};
            var parts = window.location.href.replace( /[?&]+([^=&]+)=([^&]*)/gi, function ( m, key, value )
            {
                vars[ key ] = value;
            } );
            return vars;
        },
        url = recurl,
        video,
        context,
        player;

    if ( vars && vars.hasOwnProperty( "url" ) )
    {
        url = vars.url;
    }

    video = document.querySelector( texturediv );
    context = new Dash.di.DashContext();
    player = new MediaPlayer( context );

    player.startup();

    player.attachView( video );
    player.setAutoPlay( false );

    player.attachSource( url );
}

/**
 * Texture
 *
 * @param gl
 * @param doc
 * @param cache
 * @param node
 * @constructor
 */
x3dom.Texture = function ( gl, doc, cache, node )
{
    this.gl = gl;
    this.doc = doc;
    this.cache = cache;
    this.node = node;

    this.samplerName = "diffuseMap";
    this.type = gl.TEXTURE_2D;
    this.format = gl.RGBA;
    this.magFilter = gl.LINEAR;
    this.minFilter = gl.LINEAR;
    this.wrapS = gl.REPEAT;
    this.wrapT = gl.REPEAT;
    this.genMipMaps = false;
    this.texture = null;
    this.ready = false;
    this.anisotropicDegree = 1.0;

    this.dashtexture = false;

    var tex = this.node;
    var suffix = "mpd";

    this.node._x3domTexture = this;

    if ( x3dom.isa( tex, x3dom.nodeTypes.MovieTexture ) )
    {
        // for dash we are lazy and check only the first url
        if ( tex._vf.url[ 0 ].indexOf( suffix, tex._vf.url[ 0 ].length - suffix.length ) !== -1 )
        {
            this.dashtexture = true;
            // we need to initially place the script for the dash player once in the document,
            // but insert this additional script only, if really needed and Dash is requested!
            var js = document.getElementById( "AdditionalDashVideoScript" );
            if ( !js )
            {
                js = document.createElement( "script" );
                js.setAttribute( "type", "text/javascript" );
                js.setAttribute( "src", x3dom.Texture.dashVideoScriptFile );
                js.setAttribute( "id", "AdditionalDashVideoScript" );
                js.onload = function ()
                {
                    var texObj;
                    while ( ( texObj = x3dom.Texture.loadDashVideos.pop() ) )
                    {
                        x3dom.Texture.textNum++;
                        texObj.update();
                    }
                    js.ready = true;
                };
                document.getElementsByTagName( "head" )[ 0 ].appendChild( js );
            }
            if ( js.ready === true )
            {
                // count dash players and add this number to the class name for future reference
                // (append in id too, for play, pause etc)
                x3dom.Texture.textNum++;
                // update can be directly called as script is already loaded
                this.update();
            }
            else
            {
                // push to stack and process later when script has loaded
                x3dom.Texture.loadDashVideos.push( this );
            }
        }
    }

    if ( !this.dashtexture )
    {
        this.update();
    }
};

x3dom.Texture.dashVideoScriptFile = "dash.all.js";
x3dom.Texture.loadDashVideos = [];
x3dom.Texture.textNum = 0;
x3dom.Texture.clampFontSize = false;
x3dom.Texture.minFontQuality = 0.5;
x3dom.Texture.maxFontQuality = 10;

/**
 * Update
 *
 */
x3dom.Texture.prototype.update = function ()
{
    if ( x3dom.isa( this.node, x3dom.nodeTypes.Text ) )
    {
        this.updateText();
    }
    else
    {
        this.updateTexture();
    }

    this.node.validateGLObject();
};

/**
 * Set Pixel
 *
 * @param x
 * @param y
 * @param pixel
 * @param update
 */
x3dom.Texture.prototype.setPixel = function ( x, y, pixel, update )
{
    var gl = this.gl;

    var pixels = new Uint8Array( pixel );

    gl.bindTexture( this.type, this.texture );

    gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );

    gl.texSubImage2D( this.type, 0, x, y, 1, 1, this.format, gl.UNSIGNED_BYTE, pixels );

    gl.bindTexture( this.type, null );

    if ( update )
    {
        this.doc.needRender = true;
    }
};

/**
 * Update Texture
 *
 */
x3dom.Texture.prototype.updateTexture = function ()
{
    var gl = this.gl;
    var doc = this.doc;
    var tex = this.node;

    // Set sampler
    this.samplerName = tex._type;

    // Set texture type
    if ( x3dom.isa( tex, x3dom.nodeTypes.X3DEnvironmentTextureNode ) )
    {
        this.type = gl.TEXTURE_CUBE_MAP;
    }
    else
    {
        this.type = gl.TEXTURE_2D;
    }

    // Set texture format
    if ( x3dom.isa( tex, x3dom.nodeTypes.PixelTexture ) )
    {
        switch ( tex._vf.image.comp )
        {
            case 1:
                this.format = gl.LUMINANCE;
                break;
            case 2:
                this.format = gl.LUMINANCE_ALPHA;
                break;
            case 3:
                this.format = gl.RGB;
                break;
            case 4:
                this.format = gl.RGBA;
                break;
        }
    }
    else
    {
        this.format = gl.RGBA;
    }

    // Set texture min, mag, wrapS and wrapT
    if ( tex._cf.textureProperties.node !== null )
    {
        var texProp = tex._cf.textureProperties.node;

        this.wrapS = x3dom.Utils.boundaryModesDic( gl, texProp._vf.boundaryModeS );
        this.wrapT = x3dom.Utils.boundaryModesDic( gl, texProp._vf.boundaryModeT );

        this.minFilter = x3dom.Utils.minFilterDic( gl, texProp._vf.minificationFilter );
        this.magFilter = x3dom.Utils.magFilterDic( gl, texProp._vf.magnificationFilter );

        this.anisotropicDegree = Math.min( Math.max( texProp._vf.anisotropicDegree, 1.0 ), x3dom.caps.MAX_ANISOTROPY );

        if ( texProp._vf.generateMipMaps === true )
        {
            this.genMipMaps = true;

            if ( this.minFilter == gl.NEAREST )
            {
                this.minFilter = gl.NEAREST_MIPMAP_NEAREST;
            }
            else if ( this.minFilter == gl.LINEAR )
            {
                this.minFilter = gl.LINEAR_MIPMAP_LINEAR;
            }

            if ( this.texture && ( this.texture.ready || this.texture.textureCubeReady ) )
            {
                gl.bindTexture( this.type, this.texture );
                gl.generateMipmap( this.type );
                gl.bindTexture( this.type, null );
            }
        }
        else
        {
            this.genMipMaps = false;

            if ( ( this.minFilter == gl.LINEAR_MIPMAP_LINEAR ) ||
                ( this.minFilter == gl.LINEAR_MIPMAP_NEAREST ) )
            {
                this.minFilter = gl.LINEAR;
            }
            else if ( ( this.minFilter == gl.NEAREST_MIPMAP_LINEAR ) ||
                ( this.minFilter == gl.NEAREST_MIPMAP_NEAREST ) )
            {
                this.minFilter = gl.NEAREST;
            }
        }
    }
    else
    {
        if ( tex._vf.repeatS == false )
        {
            this.wrapS = gl.CLAMP_TO_EDGE;
        }
        else
        {
            this.wrapS = gl.REPEAT;
        }

        if ( tex._vf.repeatT == false )
        {
            this.wrapT = gl.CLAMP_TO_EDGE;
        }
        else
        {
            this.wrapT = gl.REPEAT;
        }

        if ( this.samplerName == "displacementMap" )
        {
            this.wrapS = gl.CLAMP_TO_EDGE;
            this.wrapT = gl.CLAMP_TO_EDGE;
            this.minFilter = gl.NEAREST;
            this.magFilter = gl.NEAREST;
        }
    }

    // Looking for child texture
    var childTex = ( tex._video && tex._needPerFrameUpdate === true );

    // Set texture
    if ( tex._isCanvas && tex._canvas )
    {
        if ( this.texture == null )
        {
            this.texture = gl.createTexture();
        }
        this.texture.width = tex._canvas.width;
        this.texture.height = tex._canvas.height;
        this.texture.ready = true;

        gl.bindTexture( this.type, this.texture );
        gl.texImage2D( this.type, 0, this.format, this.format, gl.UNSIGNED_BYTE, tex._canvas );
        if ( this.genMipMaps )
        {
            gl.generateMipmap( this.type );
        }
        gl.bindTexture( this.type, null );
    }

    else if ( x3dom.isa( tex, x3dom.nodeTypes.RenderedTexture ) )
    {
        if ( tex._webgl && tex._webgl.fbo )
        {
            if ( tex._webgl.fbo.dtex && tex._vf.depthMap )
            {
                this.texture = tex._webgl.fbo.dtex;
            }
            else
            {
                this.texture = tex._webgl.fbo.tex;
            }
        }
        else
        {
            this.texture = null;
            x3dom.debug.logError( "Try updating RenderedTexture without FBO initialized!" );
        }
        if ( this.texture )
        {
            this.texture.ready = true;
        }
    }
    else if ( x3dom.isa( tex, x3dom.nodeTypes.PixelTexture ) )
    {
        if ( tex._vf.origChannelCount == 0 ) {tex.setOrigChannelCount( tex._vf.image.comp );}

        if ( this.texture == null )
        {
            if ( this.node._DEF )
            {
                this.texture = this.cache.getTexture2DByDEF( gl, this.node._nameSpace, this.node._DEF );
            }
            else
            {
                this.texture = gl.createTexture();
            }
        }
        this.texture.width = tex._vf.image.width;
        this.texture.height = tex._vf.image.height;
        this.texture.ready = true;

        var pixelArr = tex._vf.image.array;
        var pixelArrfont_size = tex._vf.image.width * tex._vf.image.height * tex._vf.image.comp;

        var pixels = new Uint8Array( pixelArrfont_size );

        pixels.set( pixelArr );

        gl.bindTexture( this.type, this.texture );
        gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );
        gl.texImage2D( this.type, 0, this.format,
            tex._vf.image.width, tex._vf.image.height, 0,
            this.format, gl.UNSIGNED_BYTE, pixels );
        if ( this.genMipMaps )
        {
            gl.generateMipmap( this.type );
        }
        gl.bindTexture( this.type, null );
    }
    else if ( x3dom.isa( tex, x3dom.nodeTypes.MovieTexture ) || childTex )
    {
        var that = this;
        var p = document.getElementsByTagName( "body" )[ 0 ];

        if ( this.texture == null )
        {
            this.texture = gl.createTexture();
        }

        if ( this.dashtexture )
        {
            var element_vid = document.createElement( "div" );
            element_vid.setAttribute( "class", "dash-video-player" + x3dom.Texture.textNum );
            tex._video = document.createElement( "video" );
            tex._video.setAttribute( "preload", "auto" );
            tex._video.setAttribute( "muted", "muted" );

            var scriptToRun = document.createElement( "script" );
            scriptToRun.setAttribute( "type", "text/javascript" );
            scriptToRun.innerHTML = "startDashVideo(\"" + tex._vf.url[ 0 ] +
                "\",\".dash-video-player" + x3dom.Texture.textNum + " video\")";
            element_vid.appendChild( scriptToRun );
            element_vid.appendChild( tex._video );
            p.appendChild( element_vid );
            tex._video.style.visibility = "hidden";
            tex._video.style.display = "none";
        }
        else
        {
            if ( !childTex )
            {
                tex._video = document.createElement( "video" );
                tex._video.setAttribute( "preload", "auto" );
                tex._video.setAttribute( "muted", "muted" );
                tex._video.setAttribute( "autoplay", "" );
                tex._video.setAttribute( "playsinline", "" );
                tex._video.crossOrigin = "anonymous";
                // p.appendChild( tex._video );
                // tex._video.style.visibility = "hidden";
                // tex._video.style.display = "none";
                tex._video.load();
            }

            for ( var i = 0; i < tex._vf.url.length; i++ )
            {
                var videoUrl = tex._nameSpace.getURL( tex._vf.url[ i ] );
                x3dom.debug.logInfo( "Adding video file: " + videoUrl );
                var src = document.createElement( "source" );
                src.setAttribute( "src", videoUrl );
                tex._video.appendChild( src );
            }
        }

        var updateMovie = function ()
        {
            gl.bindTexture( that.type, that.texture );
            gl.texImage2D( that.type, 0, that.format, that.format, gl.UNSIGNED_BYTE, tex._video );
            if ( that.genMipMaps )
            {
                gl.generateMipmap( that.type );
            }
            gl.bindTexture( that.type, null );
            that.texture.ready = true;
            doc.needRender = true;
        };

        var startVideo = function ()
        {
            //x3dom.debug.logInfo( "startVideo" );
            window.removeEventListener( "mousedown", startVideo );
            window.removeEventListener( "keydown", startVideo );
            if ( !( tex._video instanceof HTMLMediaElement ) )
            {
                x3dom.debug.logInfo( "No video exists." );
                return;
            }
            tex._video.play()
                .then( function fulfilled ()
                {
                    if ( tex._intervalID )
                    {
                        x3dom.debug.logInfo( "The video has already started, startVideo() is called repeatedly." );
                        clearInterval( tex._intervalID );
                        tex._intervalID = null;
                    }
                    tex._intervalID = setInterval( updateMovie, 16 );
                } )
                .catch( function rejected ( err )
                {
                    x3dom.debug.logInfo( "Waiting for interaction: " + err );
                    window.addEventListener( "mousedown", startVideo );
                    window.addEventListener( "keydown", startVideo );
                } );
        };

        var pauseVideo = function ()
        {
            //x3dom.debug.logInfo( "pauseVideo" );
            window.removeEventListener( "mousedown", startVideo );
            window.removeEventListener( "keydown", startVideo );
            tex._video.pause();
            clearInterval( tex._intervalID );
            tex._intervalID = null;
        };

        var videoDone = function ()
        {
            clearInterval( tex._intervalID );
            tex._intervalID = null;
            if ( tex._vf.loop === true )
            {
                tex._video.play();
                tex._intervalID = setInterval( updateMovie, 16 );
            }
        };

        tex._video.startVideo = startVideo;
        tex._video.pauseVideo = pauseVideo;

        // Start listening for the canplaythrough event, so we do not
        // start playing the video until we can do so without stuttering
        tex._video.addEventListener( "canplaythrough", startVideo, true );

        // Start listening for the ended event, so we can stop the
        // texture update when the video is finished playing
        tex._video.addEventListener( "ended", videoDone, true );
    }
    else if ( x3dom.isa( tex, x3dom.nodeTypes.X3DEnvironmentTextureNode ) )
    {
        this.texture = this.cache.getTextureCube( gl, doc, tex.getTexUrl(), false,
            tex._vf.crossOrigin, tex._vf.scale, this.genMipMaps, tex._vf.flipY );
    }
    else
    {
        this.texture = this.cache.getTexture2D( gl, doc, tex._nameSpace.getURL( tex._vf.url[ 0 ] ),
            false, tex._vf.crossOrigin, tex._vf.scale, this.genMipMaps, tex._vf.flipY, tex );
    }
};

/**
 * Update Text
 *
 */
x3dom.Texture.prototype.updateText = function ()
{
    var gl = this.gl;

    this.wrapS = gl.CLAMP_TO_EDGE;
    this.wrapT = gl.CLAMP_TO_EDGE;
    this.type = gl.TEXTURE_2D;
    this.format = gl.RGBA;
    this.magFilter = gl.LINEAR;
    this.minFilter = gl.LINEAR_MIPMAP_LINEAR;
    this.genMipMaps = true;
    if ( x3dom.caps.MAX_ANISOTROPY )
    {
        this.anisotropicDegree = x3dom.caps.MAX_ANISOTROPY;
    }

    var fontStyleNode = this.node._cf.fontStyle.node, // should always exist?
        font_family = "serif", // should be dealt with by default fontStyleNode?
        font_style = "normal",
        font_justify = "left",
        font_size = 1.0,
        font_spacing = 1.0,
        font_horizontal = true,
        font_language = "",
        oversample = 2.0,
        minor_alignment = "FIRST";

    if ( fontStyleNode !== null )
    {
        var fonts = fontStyleNode._vf.family.toString();

        // clean attribute values and split in array
        fonts = fonts.trim().replace( /\'/g, "" ).replace( /\,/, " " );
        fonts = fonts.split( " " );

        font_family = fonts.map( function ( s )
        {
            if ( s == "SANS" )
            {
                return "Verdana, sans-serif";
            }
            else if ( s == "SERIF" )
            {
                return "Georgia, serif";
            }
            else if ( s == "TYPEWRITER" )
            {
                return "monospace";
            }
            else
            {
                return "" + s + "";
            }  // 'Verdana'
        } ).join( "," );

        font_style = fontStyleNode._vf.style.toString().replace( /\'/g, "" );
        switch ( font_style.toUpperCase() )
        {
            case "PLAIN":
                font_style = "normal";
                break;
            case "BOLD":
                font_style = "bold";
                break;
            case "ITALIC":
                font_style = "italic";
                break;
            case "BOLDITALIC":
                font_style = "italic bold";
                break;
            default:
                font_style = "normal";
        }

        var leftToRight = fontStyleNode._vf.leftToRight ? "ltr" : "rtl";
        var topToBottom = fontStyleNode._vf.topToBottom;

        var beginAlign = leftToRight == "ltr" ? "left" : "right";
        var endAlign = leftToRight == "ltr" ? "right" : "left";

        font_justify = fontStyleNode._vf.justify[ 0 ].toString().replace( /\'/g, "" );
        switch ( font_justify.toUpperCase() )
        {
            case "BEGIN":
                font_justify = beginAlign;
                break;
            case "END":
                font_justify = endAlign;
                break;
            case "FIRST":
                font_justify = beginAlign;
                break; // relevant only in justify[1], eg. minor alignment
            case "MIDDLE":
                font_justify = "center";
                break;
            default:
                font_justify = beginAlign;
                break;
        }

        if ( fontStyleNode._vf.justify[ 1 ] === undefined )
        {
            minor_alignment = "FIRST";
        }
        else
        {
            minor_alignment = fontStyleNode._vf.justify[ 1 ].toString().replace( /\'/g, "" );
            switch ( minor_alignment.toUpperCase() )
            {
                case "BEGIN":
                    minor_alignment = "BEGIN";
                    break;
                case "FIRST":
                    minor_alignment = "FIRST";
                    break;
                case "MIDDLE":
                    minor_alignment = "MIDDLE";
                    break;
                case "END":
                    minor_alignment = "END";
                    break;
                default:
                    minor_alignment = "FIRST";
                    break;
            }
        }

        font_size = fontStyleNode._vf.size;
        font_spacing = fontStyleNode._vf.spacing;
        font_horizontal = fontStyleNode._vf.horizontal; //TODO: vertical needs canvas support
        font_language = fontStyleNode._vf.language;
        oversample = fontStyleNode._vf.quality;
        oversample = Math.max( x3dom.Texture.minFontQuality, oversample );
        oversample = Math.min( x3dom.Texture.maxFontQuality, oversample );

        if ( font_size < 0.1 ) {font_size = 0.1;}
        if ( x3dom.Texture.clampFontSize && font_size > 2.3 )
        {
            font_size = 2.3;
        }
    }

    var textX,
        textY,
        paragraph = this.node._vf.string,
        maxExtent = this.node._vf.maxExtent,
        lengths = [],
        x3dToPx = 32,
        textAlignment = font_justify;
    var text_canvas = document.createElement( "canvas" );
    text_canvas.dir = leftToRight;
    var textHeight = font_size * x3dToPx; // pixel size relative to local coordinate system

    // needed to make webfonts work
    document.body.appendChild( text_canvas );

    var text_ctx = text_canvas.getContext( "2d" );

    text_ctx.font = font_style + " " + textHeight + "px " + font_family;

    var maxWidth = 0,
        pWidth,
        pLength,
        i,
        j;

    // calculate maxWidth and length scaling; sanitize lengths
    for ( i = 0; i < paragraph.length; i++ )
    {
        pWidth = text_ctx.measureText( paragraph[ i ] ).width;
        if ( pWidth > maxWidth )
        {
            maxWidth = pWidth;
        }

        pLength = this.node._vf.length[ i ] | 0;
        if ( maxExtent > 0 && ( pLength > maxExtent || pLength == 0 ) )
        {
            pLength = maxExtent;
        }
        lengths[ i ] = pLength <= 0 ? pWidth : pLength * x3dToPx;
    }

    var canvas_extra = 0.25 * textHeight; // single line, some fonts are higher than textHeight
    var txtW = maxWidth + canvas_extra; // needed for italic since textMetrics.width ignores that
    var txtH = textHeight + textHeight * font_spacing * ( paragraph.length - 1 ) + canvas_extra;

    textX = 0;
    textY = 0;

    var x_offset = 0,
        y_offset = 0,
        baseLine = "alphabetic";

    // x_offset and starting X
    switch ( font_justify )
    {
        case "center":
            x_offset = -txtW / 2;
            textX = txtW / 2;
            break;
        case "left":
            x_offset = 0;
            textX = 0;
            break;
        case "right":
            x_offset = -txtW;
            textX = txtW;
            break;
    }

    // y_offset, baseline and first Y
    switch ( minor_alignment )
    {
        case "MIDDLE":
            y_offset = txtH / 2 - canvas_extra / 2;
            baseLine = "middle";
            textY = topToBottom ? textHeight / 2 : textHeight / 2;
            break;
        case "BEGIN":
            y_offset = topToBottom ? 0 : txtH - canvas_extra;
            baseLine = topToBottom ? "top" : "bottom";
            textY = topToBottom ? 0 : textHeight; // adjust for baseline
            break;
        case "FIRST":
            //special case of BEGIN
            y_offset = topToBottom ? textHeight : txtH - canvas_extra;
            baseLine = topToBottom ? "alphabetic" : "bottom";
            textY = topToBottom ? textHeight : textHeight;
            break;
        case "END":
            y_offset = topToBottom ? txtH - canvas_extra : 0;
            baseLine = topToBottom ? "bottom" : "top";
            textY = topToBottom ? textHeight : 0;
            break;
    }

    var pxToX3d = 1 / x3dToPx;
    var w = txtW * pxToX3d;
    var h = txtH * pxToX3d;
    var max_texture_size = x3dom.caps.MAX_TEXTURE_SIZE >> 2;

    x_offset *= pxToX3d;
    y_offset *= pxToX3d;

    text_canvas.width = Math.min(
        x3dom.Utils.nextHighestPowerOfTwo( txtW * oversample ),
        max_texture_size );
    text_canvas.height = Math.min(
        x3dom.Utils.nextHighestPowerOfTwo( txtH * oversample ),
        max_texture_size );
    text_canvas.dir = leftToRight;

    text_ctx.scale( text_canvas.width / txtW, text_canvas.height / txtH );

    // transparent background
    text_ctx.fillStyle = "rgba(0,0,0,0)";
    text_ctx.fillRect( 0, 0, text_ctx.canvas.width, text_ctx.canvas.height );

    // write white text with black border
    text_ctx.fillStyle = "white";

    text_ctx.textBaseline = baseLine;

    text_ctx.font = font_style + " " + textHeight + "px " + font_family;
    text_ctx.textAlign = textAlignment;

    var renderConfig = {
        font_style   : font_style,
        font_family  : font_family,
        font_spacing : font_spacing,
        paragraph    : paragraph,
        topToBottom  : topToBottom,
        leftToRight  : leftToRight,
        textX        : textX,
        textY        : textY,
        textHeight   : textHeight,
        lengths      : lengths
    };

    this.renderScaledText( text_ctx, 1, renderConfig );

    if ( this.texture === null )
    {
        this.texture = gl.createTexture();
    }

    gl.bindTexture( this.type, this.texture );
    this.uploadTextMipmap( text_canvas, renderConfig );
    gl.bindTexture( this.type, null );

    //remove canvas after Texture creation
    document.body.removeChild( text_canvas );

    this.node._mesh._positions[ 0 ] = [
        0 + x_offset, -h + y_offset, 0,
        w + x_offset, -h + y_offset, 0,
        w + x_offset, 0 + y_offset, 0,
        0 + x_offset, 0 + y_offset, 0 ];

    this.node.invalidateVolume();
    this.node._parentNodes.forEach( function ( node )
    {
        node.setAllDirty();
    } );
};

x3dom.Texture.prototype.renderScaledText = function ( ctx2d, pot, txt )
{
    ctx2d.font = txt.font_style + " " + txt.textHeight / pot + "px " + txt.font_family;
    var textYpos = txt.textY;

    // create the multiline text always top down
    for ( var i = 0; i < txt.paragraph.length; i++ )
    {
        var j = txt.topToBottom ? i : txt.paragraph.length - 1 - i;
        var paragraphj = txt.paragraph[ j ];
        if ( txt.leftToRight == "rtl" ) {paragraphj = "\u202e" + paragraphj;} //force rtl unicode mark
        ctx2d.fillText( paragraphj, txt.textX / pot, textYpos / pot, txt.lengths[ j ] / pot );
        textYpos += txt.textHeight * txt.font_spacing;
    }
};

x3dom.Texture.prototype.uploadTextMipmap = function ( canvas, txt )
{
    var gl = this.gl,
        w = canvas.width,
        h = canvas.height,
        level = 0,
        pot = 1,
        w2 = w,
        h2 = h,
        ctx2d = canvas.getContext( "2d" );
    while ( true )
    {
        gl.texImage2D( this.type, level++, this.format, this.format, gl.UNSIGNED_BYTE, ctx2d.getImageData( 0, 0, w2, h2 ) );
        if ( w2 == 1 && h2 == 1 ) {break;}
        w2 = Math.max( 1, w2 >> 1 );
        h2 = Math.max( 1, h2 >> 1 );
        ctx2d.clearRect( 0, 0, w, h );
        pot *= 2;
        this.renderScaledText( ctx2d, pot, txt );
    }
//    this.gl.generateMipmap( this.type );
};
