
x3dom.DDSLoader = {};

x3dom.DDSLoader.load = function( src )
{
    return new Promise( function( resolve, reject ) {

        var xhr = new XMLHttpRequest();

        xhr.open('GET', src, true);

        xhr.responseType = "arraybuffer";

        xhr.onload = function()
        {
            var dds = x3dom.DDSLoader._read( xhr.response );

            if ( dds )
            {
                resolve( dds );
            }
            else
            {
                reject( dds );
            }
        };
  
        xhr.onerror = function()
        {
            reject();
        };
    
        //ddsXhr.send(null);
        x3dom.RequestManager.addRequest(xhr);

    });
}

x3dom.DDSLoader._read = function( source )
{
    if ( source === undefined || source.byteLength < 128 )
    {
        return;
    }
    
    let dds = 
    {
        isCompressed  : false,
        isVolume      : false,
        isCubeMap     : false,
        targets       : [],
        data          : []
    };

    let int32Buffer = new Uint32Array( source, 0, 32 );
    
    //Parse DDS Header
    dds.header = x3dom.DDSLoader._readHeader( int32Buffer );
    
    int32Buffer = new Uint32Array( source, 128, 5 );
    
    //Parse DDS Header
    dds.header10 = x3dom.DDSLoader._readHeader10( dds, int32Buffer );
    
    //Check if the magic number is present
    if ( dds.header.dwMagic != 0x20534444 )
    {
        return;
    }
    
    //Check if the header size is correct
    if ( dds.header.dwSize != 0x7C )
    {
        return;
    }   
    
    //Parse resource format
    if ( !x3dom.DDSLoader._readFormat( dds ) )
    {
        return;
    }    
    
    x3dom.DDSLoader._readMipmapCount( dds );
    
    x3dom.DDSLoader._readType( dds );

    this._readData( dds, source );

    return dds;
}

x3dom.DDSLoader._readHeader = function( buffer )
{
    return {
        dwMagic             : buffer[ 0 ],
        dwSize              : buffer[ 1 ],
        dwFlags             : x3dom.DDSLoader._readDDSFlags( buffer[ 2 ] ),
        dwHeight            : buffer[ 3 ],
        dwWidth             : buffer[ 4 ],
        dwPitchOrLinearSize : buffer[ 5 ],
        dwDepth             : buffer[ 6 ],
        dwMipMapCount       : buffer[ 7 ],
        dwReserved1         : "UNUSED",
        ddspf               : {
            dwSize              : buffer[ 19 ],
            dwFlags             : x3dom.DDSLoader._readPFFlags( buffer[ 20 ] ),
            dwFourCC            : x3dom.DDSLoader.int32ToFourCC( buffer[ 21 ] ),
            dwRGBBitCount       : buffer[ 22 ],
            dwRBitMask          : buffer[ 23 ],
            dwGBitMask          : buffer[ 24 ],
            dwBBitMask          : buffer[ 25 ],
            dwABitMask          : buffer[ 26 ]
        },
        dwCaps              : x3dom.DDSLoader._readCapsFlags( buffer[ 27 ] ),
        dwCaps2             : x3dom.DDSLoader._readCaps2Flags( buffer[ 28 ] ),
        dwCaps3             : "UNUSED",
        dwCaps4             : "UNUSED",
        dwReserved2         : "UNUSED"   
    }
};

x3dom.DDSLoader._readHeader10 = function( dds, buffer )
{
    if ( dds.header.ddspf.dwFourCC != "DX10" )
    {
        return null;
    }

    return {
        dxgiFormat          : buffer[ 0 ],
        resourceDimension   : x3dom.DDSLoader._readResourceDimension( buffer[ 1 ] ),
        miscFlags           : x3dom.DDSLoader._readMiscFlags( buffer[ 2 ] ),
        arraySize           : buffer[ 3 ],
        miscFlags2          : x3dom.DDSLoader._readMiscFlags2( buffer[ 4 ] ),       
    }
};

x3dom.DDSLoader._readMipmapCount = function( dds )
{
    dds.numberOfMipmaps = ( dds.header.dwFlags.DDSD_MIPMAPCOUNT ) ? dds.header.dwMipMapCount : 1;
}

x3dom.DDSLoader._readType = function( dds )
{
    if ( dds.header.dwFlags.DDSD_DEPTH && dds.header.dwCaps2.DDSCAPS2_VOLUME )
    {
        dds.type = 32879;
        
        dds.numberOfImages = dds.header.dwCaps.DDSD_DEPTH;
    }
    else if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP )
    {
        dds.type = 34067;
        
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_POSITIVEX )
        { 
            dds.targets.push( 34069 );
        }
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_NEGATIVEX )
        {    
            dds.targets.push( 34070 );
        }    
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_POSITIVEY )
        { 
            dds.targets.push( 34071 );
        }
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_NEGATIVEY )
        {     
            dds.targets.push( 34072 );
        }
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_POSITIVEZ )
        {
            dds.targets.push( 34073 );
        }
        if ( dds.header.dwCaps2.DDSCAPS2_CUBEMAP_NEGATIVEZ )
        { 
            dds.targets.push( 34074 );
        }

        dds.numberOfImages = dds.targets.length;

    }
    else
    {   
        dds.type = 3553;
        
        dds.targets.push( 3553 );
        
        dds.numberOfImages = dds.targets.length;           
    }
    
};

x3dom.DDSLoader._readDDSFlags = function( dwFlags ) 
{
    return  { 
        DDSD_CAPS           : ( dwFlags & 0x1      ) ? true : false,
        DDSD_HEIGHT         : ( dwFlags & 0x2      ) ? true : false,
        DDSD_WIDTH          : ( dwFlags & 0x4      ) ? true : false,
        DDSD_PITCH          : ( dwFlags & 0x8      ) ? true : false,
        DDSD_PIXELFORMAT    : ( dwFlags & 0x1000   ) ? true : false,
        DDSD_MIPMAPCOUNT    : ( dwFlags & 0x20000  ) ? true : false,
        DDSD_LINEARSIZE     : ( dwFlags & 0x80000  ) ? true : false,
        DDSD_DEPTH          : ( dwFlags & 0x800000 )  ? true : false
    }
}

x3dom.DDSLoader._readPFFlags = function( dwFlags )
{
    return  {
        DDPF_ALPHAPIXELS    : ( dwFlags & 0x1     ) ? true : false,
        DDPF_ALPHA          : ( dwFlags & 0x2     ) ? true : false,
        DDPF_FOURCC         : ( dwFlags & 0x4     ) ? true : false,
        DDPF_RGB            : ( dwFlags & 0x40    ) ? true : false,
        DDPF_YUV            : ( dwFlags & 0x200   ) ? true : false,
        DDPF_LUMINANCE      : ( dwFlags & 0x20000 ) ? true : false
    }  
}

x3dom.DDSLoader._readCapsFlags = function( dwFlags )
{
    return  { 
        DDSCAPS_COMPLEX : ( dwFlags & 0x8      ) ? true : false,
        DDSCAPS_MIPMAP  : ( dwFlags & 0x400000 ) ? true : false,
        DDSCAPS_TEXTURE : ( dwFlags & 0x1000   ) ? true : false
    }  
}

x3dom.DDSLoader._readCaps2Flags = function( dwFlags )
{
    return  {   
        DDSCAPS2_CUBEMAP            : ( dwFlags & 0x200   ) ? true : false,
        DDSCAPS2_CUBEMAP_POSITIVEX  : ( dwFlags & 0x400   ) ? true : false,
        DDSCAPS2_CUBEMAP_NEGATIVEX  : ( dwFlags & 0x800   ) ? true : false,
        DDSCAPS2_CUBEMAP_POSITIVEY  : ( dwFlags & 0x1000  ) ? true : false,
        DDSCAPS2_CUBEMAP_NEGATIVEY  : ( dwFlags & 0x2000  ) ? true : false,
        DDSCAPS2_CUBEMAP_POSITIVEZ  : ( dwFlags & 0x4000  ) ? true : false,
        DDSCAPS2_CUBEMAP_NEGATIVEZ  : ( dwFlags & 0x8000  ) ? true : false,
        DDSCAPS2_VOLUME             : ( dwFlags & 0x20000 ) ? true : false
    }
}

x3dom.DDSLoader._readResourceDimension = function( resourceDimension )
{
    switch ( resourceDimension )
    {
        case 0x0: return "D3D10_RESOURCE_DIMENSION_UNKNOWN";
        case 0x1: return "D3D10_RESOURCE_DIMENSION_BUFFER";
        case 0x2: return "D3D10_RESOURCE_DIMENSION_TEXTURE1D";
        case 0x3: return "D3D10_RESOURCE_DIMENSION_TEXTURE2D";
        case 0x4: return "D3D10_RESOURCE_DIMENSION_TEXTURE3D";
    }
}

x3dom.DDSLoader._readMiscFlags = function( miscFlag )
{
    return {
        D3D11_RESOURCE_MISC_GENERATE_MIPS                   : ( miscFlag & 0x1     ) ? true : false,
        D3D11_RESOURCE_MISC_SHARED                          : ( miscFlag & 0x2     ) ? true : false,
        D3D11_RESOURCE_MISC_TEXTURECUBE                     : ( miscFlag & 0x4     ) ? true : false,
        D3D11_RESOURCE_MISC_DRAWINDIRECT_ARGS               : ( miscFlag & 0x10    ) ? true : false,
        D3D11_RESOURCE_MISC_BUFFER_ALLOW_RAW_VIEWS          : ( miscFlag & 0x20    ) ? true : false,
        D3D11_RESOURCE_MISC_BUFFER_STRUCTURED               : ( miscFlag & 0x40    ) ? true : false,
        D3D11_RESOURCE_MISC_RESOURCE_CLAMP                  : ( miscFlag & 0x80    ) ? true : false,
        D3D11_RESOURCE_MISC_SHARED_KEYEDMUTEX               : ( miscFlag & 0x100   ) ? true : false,
        D3D11_RESOURCE_MISC_GDI_COMPATIBLE                  : ( miscFlag & 0x200   ) ? true : false,
        D3D11_RESOURCE_MISC_SHARED_NTHANDLE                 : ( miscFlag & 0x800   ) ? true : false,
        D3D11_RESOURCE_MISC_RESTRICTED_CONTENT              : ( miscFlag & 0x1000  ) ? true : false,
        D3D11_RESOURCE_MISC_RESTRICT_SHARED_RESOURCE        : ( miscFlag & 0x2000  ) ? true : false,
        D3D11_RESOURCE_MISC_RESTRICT_SHARED_RESOURCE_DRIVER : ( miscFlag & 0x4000  ) ? true : false,
        D3D11_RESOURCE_MISC_GUARDED                         : ( miscFlag & 0x8000  ) ? true : false,
        D3D11_RESOURCE_MISC_TILE_POOL                       : ( miscFlag & 0x20000 ) ? true : false,
        D3D11_RESOURCE_MISC_TILED                           : ( miscFlag & 0x40000 ) ? true : false,
        D3D11_RESOURCE_MISC_HW_PROTECTED                    : ( miscFlag & 0x80000 ) ? true : false,
    }    
}

x3dom.DDSLoader._readMiscFlags2 = function( miscFlag )
{
    let miscFlags2 = {};
    
    switch ( miscFlag )
    {
        case 0x0: 
            miscFlags2.alphaMode = "DDS_ALPHA_MODE_UNKNOWN";
            break;
        case 0x1: 
            miscFlags2.alphaMode = "DDS_ALPHA_MODE_UNKNOWN";
            break;
        case 0x2: 
            miscFlags2.alphaMode = "DDS_ALPHA_MODE_UNKNOWN";
            break;
        case 0x3: 
            miscFlags2.alphaMode = "DDS_ALPHA_MODE_UNKNOWN";
            break;
        case 0x4: 
            miscFlags2.alphaMode = "DDS_ALPHA_MODE_UNKNOWN";
            break;
    }
    
    return miscFlags2;      
}

x3dom.DDSLoader._readData = function( dds, buffer, texture, options )
{
    var offset = (dds.header10) ? 148 : 128;
    
    var byteArray, width, height;
    
    dds.width = dds.header.dwWidth;
    dds.height = dds.header.dwHeight;
    dds.generateMipmaps = ( dds.numberOfMipmaps <= 1 && !dds.isCompressed );
    
    for ( let i = 0; i < dds.numberOfImages; i++ )
    {
        width = dds.header.dwWidth;
        height = dds.header.dwHeight;
        
        dds.data[ dds.targets[ i ] ] = [];
        
        for ( var m = 0; m < dds.numberOfMipmaps; m++ )
        {      
            if ( m != 0 )
            {
                width  = Math.max( width  * 0.5, 1 );
                height = Math.max( height * 0.5, 1 );
            }
    
            if ( dds.isCompressed )
            {
                byteArray = this._readCompressedData( buffer, width, height, offset, dds.blockSize );
                
                dds.data[ dds.targets[ i ] ][ m ] = byteArray;
            }
            else
            {
                byteArray = this._readUncompressedData( buffer, width, height, offset, dds.format );
                
                dds.data[ dds.targets[ i ] ][ m ] = byteArray;
            }
    
            offset += byteArray.length * byteArray.BYTES_PER_ELEMENT * dds.format.bytesPerElementFactor;

        }
    }

    if(dds.format.overwriteType)
    {
        dds.format.type = dds.format.overwriteType;
    }

    if(dds.format.overwriteInternalType)
    {
        dds.format.internal = dds.format.overwriteInternalType;
    }
    
    return dds;

};

x3dom.DDSLoader._readCompressedData = function( buffer, width, height, offset, blockSize )
{
    let length = Math.max( 1, parseInt( ( width + 3 ) / 4 ) ) * Math.max( 1, parseInt( ( height + 3 ) / 4 ) ) * blockSize;

    return new Uint8Array( buffer.slice( offset, offset + length ) );
}

x3dom.DDSLoader._readUncompressedData = function( buffer, width, height, offset, format, type )
{
    format.bytesPerElementFactor = 1;

    if ( format.internal == 6406 )
    {
        return new Uint8Array( buffer.slice( offset, offset + width * height ) );
    }
    else if ( format.internal == 6409 )
    {
        return new Uint8Array( buffer.slice( offset, offset + width * height ) );
    }
    else if ( format.internal == 6410 )
    {
        return new Uint8Array( buffer.slice( offset, offset + width * height * 2 ) );
    }
    else if ( format.internal == 6407 )
    {
        return x3dom.DDSLoader.R8G8B8_To_B8G8R8( new Uint8Array( buffer.slice( offset, offset + width * height * 3 ) ) );
    }
    else if ( format.internal == 36194 )
    {
        return new Uint16Array( buffer.slice( offset, offset + width * height * 2 ) );
    }
    else if ( format.internal == 6408 && format.type != 36193 && format.type != 5126 )
    {
        return x3dom.DDSLoader.A8R8G8B8_To_A8B8G8R8( new Uint8Array( buffer.slice( offset, offset + width * height * 4 ) ) );
    }
    else if ( format.internal == 32854)
    {
        return x3dom.DDSLoader.A4R4G4B4_To_A4B4G4R4( new Uint16Array( buffer.slice( offset, offset + width * height * 2 ) ) );
    }
    else if ( format.internal == 32855 )
    {
        return x3dom.DDSLoader.A1R5G5B5_To_A1B5G5R5( new Uint16Array( buffer.slice( offset, offset + width * height * 2 ) ) );
    }
    else if ( format.internal == 34842 || format.type == 36193 )
    {
        if( x3dom.caps.HFP_TEXTURES || x3dom.caps.WEBGL_VERSION == 2)
        {
            return new Uint16Array( buffer.slice( offset, offset + width * height * 4 * 2 ) );
        }
        else if( x3dom.caps.FP_TEXTURES )
        {
            format.overwriteType = 5126;
            format.overwriteInternalType = (x3dom.caps.WEBGL_VERSION == 2) ? 34836 : 6408;
            format.bytesPerElementFactor = 0.5;

            return x3dom.DDSLoader.UI16_To_F32( new Uint16Array( buffer.slice( offset, offset + width * height * 4 * 2 ) ));
        }
        else
        {
            format.overwriteType = 5121;
            format.overwriteInternalType = 6408;
            format.bytesPerElementFactor = 2;

            return x3dom.DDSLoader.UI16_To_UI8( new Uint16Array( buffer.slice( offset, offset + width * height * 4 * 2 ) ));
        }
    }
    else if ( format.internal == 34836 || format.type == 5126)
    {
        if( x3dom.caps.FP_TEXTURES || x3dom.caps.WEBGL_VERSION == 2)
        {
            return new Float32Array( buffer.slice( offset, offset + width * height * 4 * 4 ) );
        }
        else
        {

        }
        
    }
    else if ( format.internal == 35898 )
    {
        return new Uint8Array( buffer.slice( offset, offset + width * height * 3 ) );
    }
};

x3dom.DDSLoader._readFormat = function( dds )
{
    let pixelFormat = dds.header.ddspf;

    if ( pixelFormat.dwFlags.DDPF_FOURCC )
    {
        if ( pixelFormat.dwFourCC == "DXT1" )
        {
            dds.blockSize = 8;
            dds.isCompressed = true;
            dds.format = { internal: 33776, format: 6407, type: 5121 };
        }
        else if ( pixelFormat.dwFourCC == "DXT3" )
        {
            dds.blockSize = 16;
            dds.isCompressed = true;
            dds.format = { internal: 33778, format: 6408, type: 5121 };
        }
        else if ( pixelFormat.dwFourCC == "DXT5" )
        {
            dds.blockSize = 16;
            dds.isCompressed = true;
            dds.format = { internal: 33779, format: 6408, type: 5121 };
        }
        else if ( pixelFormat.dwFourCC == "t" )
        {
            if(x3dom.caps.WEBGL_VERSION == 2)
            {
                dds.format = { internal: 34836, format: 6408, type: 5126 };
            }
            else
            {
                dds.format = { internal: 6408, format: 6408, type: 5126 };
            }
        }
        else if ( pixelFormat.dwFourCC == "q"  || pixelFormat.dwFourCC == "$" )
        {
            if(x3dom.caps.WEBGL_VERSION == 2)
            {
                dds.format = { internal: 34842, format: 6408, type: 5131 };
            }
            else
            {
                dds.format = { internal: 6408, format: 6408, type: 36193 };
            }
        }
        else
        {
            return false;
        }
    }
    else if ( pixelFormat.dwFlags.DDPF_RGB && !pixelFormat.dwFlags.DDPF_ALPHAPIXELS )
    {
        if ( pixelFormat.dwRGBBitCount == 24  && pixelFormat.dwRBitMask == 0xff0000 &&
                pixelFormat.dwGBitMask == 0xff00 && pixelFormat.dwBBitMask == 0xff )
        {
            dds.format = { internal: 6407, format: 6407, type: 5121 };
        }
        else if ( pixelFormat.dwRGBBitCount == 16 && pixelFormat.dwRBitMask == 0xf800 &&
                    pixelFormat.dwGBitMask == 0x7e0 && pixelFormat.dwBBitMask == 0x1f )
        {
            dds.format = { internal: 36194, format: 6407, type: 33635 };
        }
        else
        {
            return false;
        }
    }
    else if ( pixelFormat.dwFlags.DDPF_RGB && pixelFormat.dwFlags.DDPF_ALPHAPIXELS )
    {
        if ( pixelFormat.dwRGBBitCount == 32  && pixelFormat.dwRBitMask == 0xff0000 &&
                pixelFormat.dwGBitMask == 0xff00 && pixelFormat.dwBBitMask == 0xff &&
                pixelFormat.dwABitMask == 0xff000000 )
        {
            dds.format = { internal: 6408, format: 6408, type: 5121 };
        }
        else if ( pixelFormat.dwRGBBitCount == 16 && pixelFormat.dwRBitMask == 0xf00 &&
                    pixelFormat.dwGBitMask == 0xf0  && pixelFormat.dwBBitMask == 0xf &&
                    pixelFormat.dwABitMask == 0xf000 )
        {
            dds.format = { internal: 32854, format: 6408, type: 32819 };
        }
        else if ( pixelFormat.dwRGBBitCount == 16 && pixelFormat.dwRBitMask == 0x7C00 &&
                    pixelFormat.dwGBitMask == 0x3E0 && pixelFormat.dwBBitMask == 0x1F &&
                    pixelFormat.dwABitMask == 0x8000 )
        {
            dds.format = { internal: 32855, format: 6408, type: 32820 };
        }
        else
        {
            return false;
        }
    }
    else if ( pixelFormat.dwFlags.DDPF_LUMINANCE && !pixelFormat.dwFlags.DDPF_ALPHAPIXELS )
    {
        if ( pixelFormat.dwRGBBitCount == 8 && pixelFormat.dwRBitMask == 0xff )
        {
            dds.format = { internal: 6409, format: 6409, type: 5121 };
        }
        else
        {
            return false;
        }
    }
    else if ( pixelFormat.dwFlags.DDPF_LUMINANCE && pixelFormat.dwFlags.DDPF_ALPHAPIXELS )
    {
        if ( pixelFormat.dwRGBBitCount == 16 && pixelFormat.dwRBitMask == 0xff &&
                pixelFormat.dwABitMask == 0xff00 )
        {
            dds.format = { internal: 6410, format: 6410, type: 5121 };
        }
        else
        {
            return false;
        }
    }
    else if ( pixelFormat.dwFlags.DDPF_ALPHA )
    {
        if ( pixelFormat.dwRGBBitCount == 8 && pixelFormat.dwABitMask == 0xff )
        {
            dds.format = { internal: 6406, format: 6406, type: 5121 };
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }

    return true; 
};

x3dom.DDSLoader.int32ToFourCC = function ( value ) 
{
    return String.fromCharCode (

        ( value       ) & 0xff,
        ( value >> 8  ) & 0xff,
        ( value >> 16 ) & 0xff,
        ( value >> 24 ) & 0xff

    ).replace( /[\x00]/g, "" );
};

x3dom.DDSLoader.R8G8B8_To_B8G8R8 = function ( src )
{
    var dst = new Uint8Array( src.length );

    for ( var i = 0; i < src.length; i += 3 )
    {
        dst[ i     ] = src[ i + 1 ];
        dst[ i + 1 ] = src[ i + 0 ];
        dst[ i + 2 ] = src[ i + 2 ];
    }

    return dst;
};

x3dom.DDSLoader.A8R8G8B8_To_A8B8G8R8 = function ( src )
{
    var dst = new Uint8Array( src.length );

    for ( var i = 0; i < src.length; i += 4 )
    {
        dst[ i     ] = src[ i + 2 ];
        dst[ i + 1 ] = src[ i + 1 ];
        dst[ i + 2 ] = src[ i + 0 ];
        dst[ i + 3 ] = src[ i + 3 ];
    }

    return dst;
};

x3dom.DDSLoader.UI16_To_UI8 = function ( src )
{
    var dst = new Uint8Array( src.length );

    for ( var i = 0; i < src.length; i += 4 )
    {
        dst[ i     ] = x3dom.DDSLoader.UI16_To_UI8_2(src[ i     ]) * 255;
        dst[ i + 1 ] = x3dom.DDSLoader.UI16_To_UI8_2(src[ i + 1 ]) * 255;
        dst[ i + 2 ] = x3dom.DDSLoader.UI16_To_UI8_2(src[ i + 2 ]) * 255;
        dst[ i + 3 ] = x3dom.DDSLoader.UI16_To_UI8_2(src[ i + 3 ]) * 255;
    }

    return dst;
};

x3dom.DDSLoader.UI16_To_F32 = function ( src )
{
    var dst = new Float32Array( src.length );

    for ( var i = 0; i < src.length; i += 4 )
    {
        dst[ i     ] = x3dom.DDSLoader.UI16_To_F16(src[ i     ]);
        dst[ i + 1 ] = x3dom.DDSLoader.UI16_To_F16(src[ i + 1 ]);
        dst[ i + 2 ] = x3dom.DDSLoader.UI16_To_F16(src[ i + 2 ]);
        dst[ i + 3 ] = x3dom.DDSLoader.UI16_To_F16(src[ i + 3 ]);
    }

    return dst;
};

x3dom.DDSLoader.UI16_To_F16 = function( interger )
{
    var sign     = (interger >> 15) & 0x1;
    var exponent = (interger >> 10) & 0x3ff;
    var fraction = interger & (Math.pow(2, 10) - 1);
    var result;

    if (exponent === 0)
    {
        if( fraction === 0 )
        {
            result = 0.0;
        }
        else
        {
            result = Math.pow(-1, sign) * fraction / Math.pow(2,10) * Math.pow(2,-14)
        }
    }

    result = Math.pow(-1, sign) * (1 + fraction / Math.pow(2,10)) * Math.pow(2, exponent - 15);

    return result;
}

x3dom.DDSLoader.UI16_To_UI8_2 = function( interger )
{
    var float = x3dom.DDSLoader.UI16_To_F16(interger)

    return float / (float + 1);
}

x3dom.DDSLoader.A4R4G4B4_To_A4B4G4R4 = function ( src ) {

    var a, r, g, b;

    var dst = new Uint16Array( src.length );

    for ( var i = 0; i < src.length; i++ )
    {
        a = ( src[ i ] >> 12 ) & 0xf;
        r = ( src[ i ] >> 8  ) & 0xf;
        g = ( src[ i ] >> 4  ) & 0xf;
        b = ( src[ i ]       ) & 0xf;

        var test = ( r << 12 ) & ( g << 8 ) & ( b << 4 ) & ( a );

        dst[ i ] = ( r << 12 ) & ( g << 8 ) & ( b << 4 ) & ( a );
    }

    return dst;

};

x3dom.DDSLoader.A1R5G5B5_To_A1B5G5R5 = function ( src )
{
    var a, r, g, b;

    var dst = new Uint16Array( src.length );

    for ( var i = 0; i < src.length; i++ )
    {
        a = ( src[ i ] >> 15 ) & 0x1;
        r = ( src[ i ] >> 10 ) & 0x1f;
        g = ( src[ i ] >> 5  ) & 0x5f;
        b = ( src[ i ]       ) & 0x5f;

        dst[ i ] = ( r << 11 ) & ( g << 6 ) & ( b << 1 ) & ( a );
    }

    return dst;
};