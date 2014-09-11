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


// This module adds documentation related functionality
// to the library.

/** The x3dom.docs namespace.
 * @namespace x3dom.docs
 */
x3dom.docs = {};


x3dom.docs.specURLMap = {
    CADGeometry: "CADGeometry.html",
    Core: "core.html",
    DIS: "dis.html",
    CubeMapTexturing: "env_texture.html",
    EnvironmentalEffects: "enveffects.html",
    EnvironmentalSensor: "envsensor.html",
    Followers: "followers.html",
    Geospatial: "geodata.html",
    Geometry2D: "geometry2D.html",
    Geometry3D: "geometry3D.html",
    Grouping: "group.html",
    "H-Anim": "hanim.html",
    Interpolation: "interp.html",
    KeyDeviceSensor: "keyboard.html",
    Layering: "layering.html",
    Layout: "layout.html",
    Lighting: "lighting.html",
    Navigation: "navigation.html",
    Networking: "networking.html",
    NURBS: "nurbs.html",
    ParticleSystems: "particle_systems.html",
    Picking: "picking.html",
    PointingDeviceSensor: "pointingsensor.html",
    Rendering: "rendering.html",
    RigidBodyPhysics: "rigid_physics.html",
    Scripting: "scripting.html",
    Shaders: "shaders.html",
    Shape: "shape.html",
    Sound: "sound.html",
    Text: "text.html",
    Texturing3D: "texture3D.html",
    Texturing: "texturing.html",
    Time: "time.html",
    EventUtilities: "utils.html",
    VolumeRendering: "volume.html"
};

x3dom.docs.specBaseURL = "http://www.web3d.org/x3d/specifications/ISO-IEC-19775-1.2-X3D-AbstractSpecification/Part01/components/";


// the dump-nodetype tree functionality in a function
x3dom.docs.getNodeTreeInfo = function() {

    // Create the nodetype hierarchy
    var tn, t;
    var types = "";

    var objInArray = function(array, obj) {
        for(var i=0; i<array.length; i++) {
            if (array[i] === obj) {
                return true;
            }
        }
        return false;
    };

    var dump = function(t, indent) {
        for (var i=0; i<indent; i++) {
            types += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        }

        types += "<a href='" +
                        x3dom.docs.specBaseURL + x3dom.docs.specURLMap[x3dom.nodeTypes[t]._compName] + "#" + t +
                        "' style='color:black; text-decoration:none; font-weight:bold;'>" +
                        t + "</a> &nbsp; <a href='" +
                        x3dom.docs.specBaseURL + x3dom.docs.specURLMap[x3dom.nodeTypes[t]._compName] +
                        "' style='color:black; text-decoration:none; font-style:italic;'>" +
                        x3dom.nodeTypes[t]._compName + "</a><br/>";

        for (var i in x3dom.nodeTypes[t].childTypes[t]) {
            dump(x3dom.nodeTypes[t].childTypes[t][i], indent+1);
        }
    };

    for (tn in x3dom.nodeTypes) {
     var t = x3dom.nodeTypes[tn];
         if (t.childTypes === undefined) {
             t.childTypes = {};
         }

         while (t.superClass) {
             if (t.superClass.childTypes[t.superClass._typeName] === undefined) {
                 t.superClass.childTypes[t.superClass._typeName] = [];
             }
             if (!objInArray(t.superClass.childTypes[t.superClass._typeName], t._typeName)) {
                 t.superClass.childTypes[t.superClass._typeName].push(t._typeName);
             }
             t = t.superClass;
         }
     }

    dump("X3DNode", 0);

    return "<div class='x3dom-doc-nodes-tree'>" + types + "</div>";
};


x3dom.docs.getComponentInfo = function() {
    // Dump nodetypes by component
    // but first sort alphabetically
    var components = [];
    var component;
    var result = "";
    var c, cn;

    for (c in x3dom.components) {
        components.push(c);
    }
    components.sort();

    //for (var c in x3dom.components) {
    for (cn in components) {
        c = components[cn];
        component = x3dom.components[c];
        result += "<h2><a href='" +
            x3dom.docs.specBaseURL + x3dom.docs.specURLMap[c] +
            "' style='color:black; text-decoration:none; font-style:italic;'>" +
            c + "</a></h2>";

        result += "<ul style='list-style-type:circle;'>";

        //var $ul = $("#components ul:last");
        for (var t in component) {
            result += "<li><a href='" +
                x3dom.docs.specBaseURL + x3dom.docs.specURLMap[c] + "#" + t +
                    "' style='color:black; text-decoration:none; font-weight:bold;'>" +
                    t + "</a></li>";
        }
        result += "</ul>";
    }

    return result;
};
