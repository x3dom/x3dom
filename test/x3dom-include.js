var x3dom_include = {};

//--------------------------------------------------------------------------------------------------

x3dom_include.findPackagesJSON = function ( basePath )
{
    basePath = basePath || ""

    var xhr = new XMLHttpRequest();

    xhr.open( "GET", basePath + "build/core/packages.json", false );

    xhr.addEventListener( "load", function ( e )
    {
        if ( xhr.status !== 200 )
        {
            x3dom_include.findPackagesJSON( "../" + basePath );
        }
        else
        {
            x3dom_include.includeCSS( basePath + "src/x3dom.css" );
            x3dom_include.includeScripts( basePath, JSON.parse( xhr.response ) );
        }
    } );

    xhr.send( null );
};

//--------------------------------------------------------------------------------------------------

x3dom_include.includeScripts = function ( rootDir, packages )
{
    for ( var name in packages )
    {
        if ( x3dom_include.getLevel( name ) > this.level )
        {
            return;
        }

        var package = packages[ name ];

        for ( var basePath in package )
        {
            var files = package[ basePath ];

            for( var i = 0, n = files.length; i < n; i++ )
            {
                x3dom_include.includeScript( rootDir + basePath + files[ i ] );
            }
        }
    }
};

//--------------------------------------------------------------------------------------------------

x3dom_include.includeScript = function ( src )
{
    document.write('<script src="' + src + '"></script>');
};

//--------------------------------------------------------------------------------------------------

x3dom_include.includeCSS = function ( src )
{
    var link = document.createElement( "link" );

    link.setAttribute( "type", "text/css" );

    link.setAttribute( "rel", "stylesheet" );

    link.setAttribute( "href", src );

    document.head.appendChild( link );
}

//--------------------------------------------------------------------------------------------------

x3dom_include.getLevel = function ( name )
{
    switch ( name )
    {
        case "BASIC"   : return 0;
        case "FULL"    : return 1;
        case "PHYSICS" : return 2;
        case "AMO"     : return 2;
        default        : return 0; 
    }
}

//--------------------------------------------------------------------------------------------------

x3dom_include.detectLevel = function ()
{
    var parts = document.querySelector("script[src*='x3dom-include.js']").src.split( "?" );

    if ( !parts[ 1 ] )
    {
        return 0;
    }

    return x3dom_include.getLevel( parts[ 1 ].toUpperCase() );
}

//--------------------------------------------------------------------------------------------------

x3dom_include.level = x3dom_include.detectLevel();

//--------------------------------------------------------------------------------------------------

x3dom_include.findPackagesJSON( "" );