
DEBUG = true;

var runtime = null; //holds the object that we need to manipulate the scene during the runtime
var root = null; //reference to our matrixTransform obj

var initDone = false; //false as long we haven't used the initialized the tracker
var doTracking = true; //to track or not to track

var width = 320; //width of our canvas/video
var height = 240; //height of those
var canvas = null;   //global canvas obj that we need for render purposes
var videoCanvas = null; //same

var detector = null;    //marker detector obj
var raster = null;      //raster obj

var resultMat = null;    //the matrix we get from the JSARToolkit and pass to our x3dom scene
var threshold = 100;    //threshold of the light

var videoStream = null;  // holds the stream
var video = document.createElement('video'); //create a video element

video.width = width;  //initialize video
video.height = height;
video.autoplay = true;

// Normalize the various vendor prefixed versions of getUserMedia.
navigator.getUserMedia = (navigator.getUserMedia ||navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||navigator.msGetUserMedia);
var getUserMedia = function(t, onsuccess, onerror) { //get the userMedia
    if (navigator.getUserMedia) {
        return navigator.getUserMedia(t, onsuccess, onerror);
        } else {
        onerror(new Error("No getUserMedia implementation found."));
        return null;
    }
};
var createObjectURL = window.URL.createObjectURL; //create URL for the stream
if (!createObjectURL) {                           //check if it worked
    throw new Error("URL.createObjectURL not found."); //if not throw error
}
function startCam() {   //
    getUserMedia(
        {video: true, audio: false},
        function(stream) {
            video.crossOrigin = ""; //allow cross-domain communication
            video.src = createObjectURL(stream); //create stream and use it as video source
            videoStream = stream;  //save to variable

            // enable animation when tracking
            document.getElementById("TS_planet").setAttribute("enabled", "true");
        },
        function(error) {
            alert("Could not access webcam."); //if webcam request failed print error
        });
}
startCam(); //call startCam method
var a = true;
document.onload = function() //is executed when the page is fully loaded
{
    runtime = document.getElementById("x3d").runtime; //allows to manipulate the x3dom context during the runtime

    root = document.getElementById("root"); //get the MatrixTransform node

    runtime.exitFrame = function () {
        if (!initDone) {
            initializeTracker();
            initDone = true;
        }

        if (doTracking) {
            animate();

            this.triggerRedraw(); //triggers redraw function

            if(a){
                console.log(this);
                a= false;
            }

        }
    };
};

function redraw()  //redraw
{
    videoCanvas.getContext('2d').drawImage(video, 0, 0);
    canvas.getContext('2d').drawImage(videoCanvas, 0, 0, width, height);
    // Tell JSARToolKit that the canvas has changed.
    canvas.changed = true;
}
function animate()
{
    // Draw the video frame to the canvas.
    try {
        redraw();
    }
    catch (e) {
        // workaround for Firefox
        if (e.name == "NS_ERROR_NOT_AVAILABLE") {
            setTimeout(function() { redraw(); }, 10);
        }
        else { throw e; }
    }
    // Detect the markers in the video frame.
    var markerCount = detector.detectMarkerLite(raster, threshold);

    for (var i=0; i<markerCount; i++) {
        // Get the marker matrix into the result matrix.
        detector.getTransformMatrix(i, resultMat);

        // Copy the marker matrix to the tmp matrix.
        var tmpMat = adaptMarkerMatrix(resultMat);

        // Copy the marker matrix over to your marker root object.
        root.setAttribute("matrix", tmpMat.toGL().toString());
    }
}

function adaptMarkerMatrix(arMat)
{
    var tmpMat = new x3dom.fields.SFMatrix4f(
        arMat.m00,  arMat.m01,  arMat.m02,  arMat.m03,
        arMat.m10,  arMat.m11,  arMat.m12,  arMat.m13,
        arMat.m20,  arMat.m21,  arMat.m22,  arMat.m23,
        0,          0,          0,          1);

    var translation = new x3dom.fields.SFVec3f(0,0,0),
        scale = new x3dom.fields.SFVec3f(1,1,1);
    var rotation = new x3dom.fields.Quaternion(0,0,1,0),
        scaleOrient = new x3dom.fields.Quaternion(0,0,1,0);

    tmpMat.getTransform(translation, rotation, scale, scaleOrient);

    // camera image is flipped, therefore flip orientation, too
    rotation.y *= -1;
    rotation.z *= -1;
    translation.y *= -1;
    translation.z *= -1;

    tmpMat = rotation.toMatrix();
    tmpMat.setTranslate(translation);

    return tmpMat;
}

function initializeTracker()
{
    // Setting up JSARToolKit
    canvas = document.createElement('canvas');
    canvas.id = "trackerCanvas";
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    if (DEBUG) { //shows the debug window
        var debugCanvas = document.createElement('canvas');
        debugCanvas.id = 'debugCanvas';
        debugCanvas.width = width;
        debugCanvas.height = height;
        document.body.appendChild(debugCanvas);
    }

    // Create an RGB raster object for the 2D canvas.
    // JSARToolKit uses raster objects to read image data.
    // Note that you need to set canvas.changed = true on every frame.
    raster = new NyARRgbRaster_Canvas2D(canvas);

    // FLARParam is the thing used by FLARToolKit to set camera parameters.
    // Here we create a FLARParam for images with 320x240 pixel dimensions.
    var param = new FLARParam(width, height);

    // The FLARMultiIdMarkerDetector is the actual detection engine for marker detection.
    // It detects multiple ID markers. ID markers are special markers that encode a number.
    detector = new FLARMultiIdMarkerDetector(param, 120);

    // For tracking video set continue mode to true. In continue mode, the detector
    // tracks markers across multiple frames.
    detector.setContinueMode(true);

    // Copy the camera perspective matrix from the FLARParam to the WebGL library camera matrix.
    // The second and third parameters determine the zNear and zFar planes for the perspective matrix.
    var camera = document.getElementById("vf");

    var zNear = camera.getNear();
    var zFar = camera.getFar();
    var perspectiveMatrix = runtime.projectionMatrix().toGL();

    param.copyCameraMatrix(perspectiveMatrix, zNear, zFar);

    var proj = new x3dom.fields.SFMatrix4f();
    proj.setFromArray(perspectiveMatrix);
    proj._22 *= -1;
    proj._32 *= -1;

    camera.setAttribute("projection", proj.toGL().toString());

    // Detecting markers
    videoCanvas = document.getElementById('bgnd');

    // Create a NyARTransMatResult object for getting the marker translation matrices.
    resultMat = new NyARTransMatResult();

    // Draw the video frame to the raster canvas, scaled to 320x240.
    // And tell the raster object that the underlying canvas has changed.
    redraw();
}

function showMarker()
{
    var win = window.open('./marker.png','Marker','width=420,height=420');
    win.focus();
}