/**
 * Created with JetBrains WebStorm.
 * User: Nils
 * Date: 23.05.13
 * Time: 21:08
 * To change this template use File | Settings | File Templates.
 */
var MYAPP = {};
MYAPP.path = {};
MYAPP.path.shader = "shader/";
MYAPP.pickIdFields = null;

var geoData = null;


document.onload = function ()
{
    //onshadowObjectIdChanged="handleShadowIdEvent(event);"
    document.getElementById('scene').addEventListener('shadowObjectIdChanged', handleShadowIdEvent, false);
    initData();

    // create buttons to select ids
    for (var i = 0; i < geoData.mapping.length; i++) {
        createButton(geoData.mapping[i].name);
    }

    var list = new Array(15,16,17,18,30,31,18,15,16,30,31);
var list = new Array(250,200,250,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,28);

    createButtonSet(list);

    renewAppRadianceScaling();

    list = new Array(0,1,2,3,4,5,6,25,26,27,28);
    //var list = new Array(250,200,250,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,280,100,200,203,204,205,106,205,206,207,28);
    console.log("length: " + list.length);
    var canvas = document.getElementById("idContainerCanvas");
    writeListToCanvas(canvas, list);
};


function createButton(id)
{
    //id = id.replace("Geometry_", "")
    var button = $('<button id="' + id + '">' + id + '</button>');

    button.click(function ()
    {
        $('.fieldPickId').attr('value', id.replace("Geometry_", ""));
        //console.log(id.replace("Geometry_", ""))
    });
    $("#buttonsSelect").append(button);
}
function createButtonSet(list)
{
    //id = id.replace("Geometry_", "")
    var button = $('<button id="buttonIdList">buttonIdList (15,16,17,18,30,31,18,15,16,30,31)</button>');

    button.click(function ()
    {
        var canvas = document.getElementById("idContainerCanvas");
        writeListToCanvas(canvas, list)
        console.log("update selection List: " + list)
    });
    $("#buttonsSelect2").append(button);
}

function handleShadowIdEvent(event)
{
    var pinfo = document.getElementById("pinfo");
    pinfo.innerHTML = "Picked shadow object " + geoData.mapping[event.shadowObjectId].name
        + ": <br><br>" + geoData.mapping[event.shadowObjectId].usage;

    var min = x3dom.fields.SFVec3f.parse(geoData.mapping[event.shadowObjectId].min);
    var max = x3dom.fields.SFVec3f.parse(geoData.mapping[event.shadowObjectId].max);

    var box = document.getElementById('cpnt');

    box.setAttribute('point', min.x + ' ' + min.y + ' ' + min.z + ', ' +
        min.x + ' ' + min.y + ' ' + max.z + ', ' +
        max.x + ' ' + min.y + ' ' + max.z + ', ' +
        max.x + ' ' + min.y + ' ' + min.z + ', ' +
        min.x + ' ' + max.y + ' ' + min.z + ', ' +
        min.x + ' ' + max.y + ' ' + max.z + ', ' +
        max.x + ' ' + max.y + ' ' + max.z + ', ' +
        max.x + ' ' + max.y + ' ' + min.z);

    // !!!!!!!!!!!!!!!!!!!!VERY SLOW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    MYAPP.pickIdFields.attr('value', event.shadowObjectId);

    return false;
}




/***
 * replace the entire content of a Appearance node with the stuff that is needed for selecting an id in the thader
 */
function renewAppRadianceScaling()
{
    var app = $("#mainGroup").find("Appearance").first();
    var allApps = $("#mainGroup").find("Appearance");
    allApps = allApps.not(app);
    allApps.remove();

    // set the shader for the first appearance
    var cs = jQuery(
        '<texture hideChildren="false">' +
            '<canvas width="16" height="16" id="idContainerCanvas" style="border: solid 1px black; position:absolute; top:00px;left:256px;"> ' +
        '</texture>' +
        '<ComposedShader DEF="ComposedShader_0">' +
            //'<field name="fieldRenderedTex" type="SFInt32" value="0"            </field>' +   // make the program crash!!!!!!!!!!!!!!!!!!
            '<field class="fieldPickId"  name="fieldPickId"  type="SFFloat" value="-1.0">        </field>' +
            '<field class="fieldPickCol" name="fieldPickCol" type="SFVec3f" value="1.0 1.0 0.0"> </field>' +
            '<ShaderPart type="VERTEX" url="' + MYAPP.path.shader + 'VertexShader.glsl"> </ShaderPart>' +
            '<ShaderPart type="FRAGMENT" url="' + MYAPP.path.shader + 'FragmentShader.glsl"> </ShaderPart>' +
        '</ComposedShader> '
    );

    app.empty();
    app.append(cs);


    // use the first appearance for all shapes
    var allShapes = $("#mainGroup").find("Shape").not($("#mainGroup").find("Shape").first());
    allShapes.prepend(jQuery('<Appearance USE="App_0"></Appearance>'));

    // dose not work with use for appearances
    //allApps.attr('USE', 'App_0');
    //allApps.append(jQuery('<ComposedShader USE="ComposedShader_0"></ComposedShader>'));

    MYAPP.pickIdFields = $('.fieldPickId');
    //initCanvas(document.getElementById("idContainerCanvas"));
}
function initCanvas(canvas)
{

    var ctx = canvas.getContext('2d');
    var cw = canvas.width;
    var ch = canvas.height;
    var imgData = ctx.getImageData(0, 0, cw, ch);

    for (var i = 0; i < 500; ++i) {
        var x = Math.floor(Math.random() * cw * ch);
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);

        imgData.data[x*4 + 0] = r;
        imgData.data[x*4 + 1] = g;
        imgData.data[x*4 + 2] = b;
        imgData.data[x*4 + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);

}
function writeListToCanvas(canvas, list)
{
    var length = list.length;

    var ctx = canvas.getContext('2d');
    if(length < canvas.width){
        var cw = length;
        var ch = 1;
    }
    else {
        var cw = canvas.width;
        var ch = Math.floor(length / canvas.width);
    }
    //console.log("ch " + ch + " cw " + cw + "canvas.width" + canvas.width + "")

    var imgData = ctx.getImageData(0, 0, cw, ch);

    for (var i = 0; i < length; i++) {
        imgData.data[i*4 + 0] = list[i];
        imgData.data[i*4 + 1] = list[i];
        imgData.data[i*4 + 2] = list[i];
        imgData.data[i*4 + 3] = 255;

        //imgData.data[i] = list[i];    // better but this would not be visible for small indices (alpha about 0)
    }

    ctx.putImageData(imgData, 0, 0);

}

function initData()
{
    geoData = {
        "mapping": [
            {
                "name": "Geometry_0",
                "min": "-450.75, -601, 117.155",
                "max": "-385, -386.128, 241",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14"
                ]
            },
            {
                "name": "Geometry_1",
                "min": "-385.532, -601.17, 125",
                "max": "-337, -345.844, 241",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_2",
                "min": "-450.581, -601.176, 240.958",
                "max": "-337, -345.74, 284",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_3",
                "min": "-450, -576, 283.071",
                "max": "-337, -380, 352.777",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_6"
                ]
            },
            {
                "name": "Geometry_4",
                "min": "-337.696, -601.186, 132.464",
                "max": "-298, -345.75, 240",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_5",
                "min": "-298.009, -601.17, 139.49",
                "max": "-260, -345.834, 240",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_6",
                "min": "-337.69, -601.212, 239.9",
                "max": "-298, -345.85, 359.808",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7"
                ]
            },
            {
                "name": "Geometry_7",
                "min": "-298.625, -601.182, 239.9",
                "max": "-260, -345.834, 366.5",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_8",
                "min": "-260.65, -601.19, 176.06",
                "max": "-185.088, -430, 247",
                "usage": [
                    "CO_Geometry_1",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_4",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7"
                ]
            },
            {
                "name": "Geometry_9",
                "min": "-260.625, -601.18, 246.983",
                "max": "-185.136, -430, 311.052",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7"
                ]
            },
            {
                "name": "Geometry_10",
                "min": "-260.659, -430.024, 146.445",
                "max": "-222, -345.756, 373.038",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_11",
                "min": "-222.802, -430, 153.355",
                "max": "-185.02, -345.834, 379.377",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_12",
                "min": "-186, -601.17, 177.397",
                "max": "-132.947, -486.738, 309.652",
                "usage": [
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7"
                ]
            },
            {
                "name": "Geometry_13",
                "min": "-186, -488, 170.107",
                "max": "-124.777, -424, 389.238",
                "usage": [
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7"
                ]
            },
            {
                "name": "Geometry_14",
                "min": "-186, -424.01, 160",
                "max": "-98.3788, -345.764, 300.985",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_15",
                "min": "-186, -424, 300",
                "max": "-98.6795, -345.75, 391.5",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_5",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_16",
                "min": "-367.579, -346, 152.351",
                "max": "-297.022, -180.053, 213.988",
                "usage": [
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_17",
                "min": "-298, -346, 150.772",
                "max": "-238, -180.021, 213.955",
                "usage": [
                    "CO_Geometry_1",
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_4",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_18",
                "min": "-371.396, -346, 213",
                "max": "-246.122, -180.056, 235",
                "usage": [
                    "CO_Geometry_1",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_6",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_19",
                "min": "-371.293, -346, 234.992",
                "max": "-238, -180.079, 272.962",
                "usage": [
                    "CO_Geometry_0",
                    "CO_Geometry_1",
                    "CO_Geometry_10",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_20",
                "min": "-371.701, -182, 143.863",
                "max": "-301, -100, 239.428",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_21",
                "min": "-301.452, -182, 142.492",
                "max": "-238, -100, 251.803",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_22",
                "min": "-372.486, -100.679, 135.476",
                "max": "-302, -13.625, 222.683",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_23",
                "min": "-302.021, -100.682, 134.802",
                "max": "-238, -12, 243",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_4",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_24",
                "min": "-238.89, -346, 154",
                "max": "-215, -11.3767, 238",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_2",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_25",
                "min": "-215.007, -346, 177.817",
                "max": "-178.102, -12.4648, 238",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_26",
                "min": "-238.882, -346, 237.038",
                "max": "-164.312, -170, 276",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_27",
                "min": "-238.875, -171, 237.042",
                "max": "-159.561, -8.94852, 276",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_28",
                "min": "-226, -346, 275.179",
                "max": "-158, -180.13, 338",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_8",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_29",
                "min": "-158.163, -346, 289.553",
                "max": "-120.418, -180.111, 378.082",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_5",
                    "CO_Geometry_7",
                    "CO_Geometry_8"
                ]
            },
            {
                "name": "Geometry_30",
                "min": "-209, -182, 275.175",
                "max": "-120.336, -96, 375.192",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_3",
                    "CO_Geometry_9"
                ]
            },
            {
                "name": "Geometry_31",
                "min": "-205, -96.0138, 275.175",
                "max": "-120.43, -3.2735, 373.078",
                "usage": [
                    "CO_Geometry_10",
                    "CO_Geometry_11",
                    "CO_Geometry_12",
                    "CO_Geometry_13",
                    "CO_Geometry_14",
                    "CO_Geometry_9"
                ]
            }
        ]
    };
}