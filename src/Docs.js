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

/* This module adds documentation related functionality to the library. */

/**
 * The x3dom.docs namespace.
 * @namespace x3dom.docs
 */
x3dom.docs = {};

x3dom.docs.specURLMap = {
    CADGeometry          : "CADGeometry.html",      // 32 CAD geometry component
    Core                 : "core.html",             //  7 Core component
    DIS                  : "dis.html",              // 28 Distributed interactive simulation (DIS) component
    CubeMapTexturing     : "env_texture.html",      // 34 Cube map environmental texturing component
    EnvironmentalEffects : "enveffects.html",       // 24 Environmental effects component
    EnvironmentalSensor  : "envsensor.html",        // 22 Environmental sensor component
    Followers            : "followers.html",        // 39 Followers component
    Geospatial           : "geodata.html",          // 25 Geospatial component
    Geometry2D           : "geometry2D.html",       // 14 Geometry2D component
    Geometry3D           : "geometry3D.html",       // 13 Geometry3D component
    Grouping             : "group.html",            // 10 Grouping component
    "H-Anim"             : "hanim.html",            // 26 Humanoid Animation (H-Anim) component
    Interpolation        : "interp.html",           // 19 Interpolation component
    KeyDeviceSensor      : "keyboard.html",         // 21 Key device sensor component
    Layering             : "layering.html",         // 35 Layering component
    Layout               : "layout.html",           // 36 Layout component
    Lighting             : "lighting.html",         // 17 Lighting component
    Navigation           : "navigation.html",       // 23 Navigation component
    Networking           : "networking.html",       //  9 Networking component
    NURBS                : "nurbs.html",            // 27 NURBS component
    ParticleSystems      : "particle_systems.html", // 40 Particle systems component
    Picking              : "picking.html",          // 38 Picking component
    PointingDeviceSensor : "pointingsensor.html",   // 20 Pointing device sensor component
    Rendering            : "rendering.html",        // 11 Rendering component
    RigidBodyPhysics     : "rigid_physics.html",    // 37 Rigid body physics
    Scripting            : "scripting.html",        // 29 Scripting component
    Shaders              : "shaders.html",          // 31 Programmable shaders component
    Shape                : "shape.html",            // 12 Shape component
    Sound                : "sound.html",            // 16 Sound component
    Text                 : "text.html",             // 15 Text component
    Texturing3D          : "texture3D.html",        // 33 Texturing3D Component
    Texturing            : "texturing.html",        // 18 Texturing component
    Time                 : "time.html",             //  8 Time component
    EventUtilities       : "utils.html",            // 30 Event Utilities component
    VolumeRendering      : "volume.html"            // 41 Volume rendering component
};

x3dom.docs.specBaseURL = "https://www.web3d.org/documents/specifications/19775-1/V3.3/Part01/components/";

/**
 * The dump-nodetype tree functionality in a function
 *
 * @returns {string} HTML Node Type List.
 */
x3dom.docs.getNodeTreeInfo = function ()
{
    // Create the nodetype hierarchy
    var tn,
        t;
    var types = "";

    var objInArray = function ( array, obj )
    {
        for ( var i = 0; i < array.length; i++ )
        {
            if ( array[ i ] === obj )
            {
                return true;
            }
        }
        return false;
    };

    var dump = function ( t, indent )
    {
        for ( var i = 0; i < indent; i++ )
        {
            types += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }

        types += "<a href='" +
            x3dom.docs.specBaseURL + x3dom.docs.specURLMap[ x3dom.nodeTypes[ t ]._compName ] + "#" + t +
            "' style='color:black; text-decoration:none; font-weight:bold;'>" +
            t + "</a> &nbsp; <a href='" +
            x3dom.docs.specBaseURL + x3dom.docs.specURLMap[ x3dom.nodeTypes[ t ]._compName ] +
            "' style='color:black; text-decoration:none; font-style:italic;'>" +
            x3dom.nodeTypes[ t ]._compName + "</a><br/>";

        for ( var i in x3dom.nodeTypes[ t ].childTypes[ t ] )
        {
            dump( x3dom.nodeTypes[ t ].childTypes[ t ][ i ], indent + 1 );
        }
    };

    for ( tn in x3dom.nodeTypes )
    {
        var t = x3dom.nodeTypes[ tn ];
        if ( t.childTypes === undefined )
        {
            t.childTypes = {};
        }

        while ( t.superClass )
        {
            if ( t.superClass.childTypes[ t.superClass._typeName ] === undefined )
            {
                t.superClass.childTypes[ t.superClass._typeName ] = [];
            }
            if ( !objInArray( t.superClass.childTypes[ t.superClass._typeName ], t._typeName ) )
            {
                t.superClass.childTypes[ t.superClass._typeName ].push( t._typeName );
            }
            t = t.superClass;
        }
    }

    dump( "X3DNode", 0 );

    return "<div class='x3dom-doc-nodes-tree'>" + types + "</div>";
};

/**
 * Get Component Info
 *
 * @returns {string} HTML Component List.
 */
x3dom.docs.getComponentInfo = function ()
{
    // Dump nodetypes by component
    // but first sort alphabetically
    var components = [];
    var component,
        result = "",
        c,
        cn;

    for ( c in x3dom.components )
    {
        components.push( c );
    }
    components.sort();

    // for (var c in x3dom.components) {
    for ( cn in components )
    {
        c = components[ cn ];
        component = x3dom.components[ c ];
        result += "<h2><a href='" +
            x3dom.docs.specBaseURL + x3dom.docs.specURLMap[ c ] +
            "' style='color:black; text-decoration:none; font-style:italic;'>" +
            c + "</a></h2>";

        result += "<ul style='list-style-type:circle;'>";

        // var $ul = $("#components ul:last");
        for ( var t in component )
        {
            result += "<li><a href='" +
                x3dom.docs.specBaseURL + x3dom.docs.specURLMap[ c ] + "#" + t +
                "' style='color:black; text-decoration:none; font-weight:bold;'>" +
                t + "</a> <ul>";
            if ( ! t.startsWith( "X3D" ) )
            {
                try
                {
                    var node = new x3dom.nodeTypes[ t ]();
                    result += "-- basic fields --";
                    for ( var field in node._vf )
                    {
                        result += "<li>" + field + ": " + node._vf[ field ] ;
                        result += "</li>";
                    }
                }
                catch ( m ) {};
                try
                {
                    result += "-- node fields --";
                    for ( var cfield in node._cf )
                    {
                        result += "<li>" + cfield + ": " + JSON.stringify( node._cf[ cfield ] ) ;
                        result += "</li>";
                    }
                }
                catch ( m ) {};
            }
            result += "</ul> </li>";
        }
        result += "</ul>";
    }

    return result;
};