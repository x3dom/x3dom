var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;

const UseInterleavedOutput = true;
		
const NumLevels = 8;

const StrideInBits = 128;

var glContext;

var glBuffers = [];	//object data buffers on the gpu
  /* Element structure:
  {
  positions: {} 
  }
  */

var positionAttribLocation;
var normalAttribLocation;
      
var numArrayElements = 0;

var refinedLevels = [];

function sleep(milliseconds) {
  var start = new Date().getTime();
  var newDate;
  do {
    newDate = new Date();
  }
  while ((newDate.getTime() - start) < milliseconds);
}
//---


function UpdateDecode(ms) {
  decode_ms += ms;
}


function UpdateTotal(ms) {
  start_drawing = true;
  out.innerHTML = "Decode time (sum of all threads): " + decode_ms +
      " ms, Total time: " + ms + " ms";
}


var refinementURLs = [ 'buddha_nonindexed/refinement00.bin',
                       'buddha_nonindexed/refinement01.bin',
                       'buddha_nonindexed/refinement02.bin',
                       'buddha_nonindexed/refinement03.bin',
                       'buddha_nonindexed/refinement04.bin',
                       'buddha_nonindexed/refinement05.bin',
                       'buddha_nonindexed/refinement06.bin',
                       'buddha_nonindexed/refinement07.bin' ];
             
             
function LoaderExample() { }

var drawAllowed = false;
LoaderExample.prototype = {


num_indices : 0,


load : function(gl)
{
  var i, j;
  
  this.xform = new SglTransformStack();
  this.angle = 0.0;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  var simpleVsrc = id("SIMPLE_VERTEX_SHADER").text;
  var simpleFsrc = id("SIMPLE_FRAGMENT_SHADER").text;
  var program = new Program(gl, [vertexShader(gl, simpleVsrc),
                                 fragmentShader(gl, simpleFsrc)]);
  this.program = program;
  program.use();
 
  positionAttribLocation = gl.getAttribLocation(this.program.handle_, 'a_position');
  normalAttribLocation   = gl.getAttribLocation(this.program.handle_, 'a_normal');
  
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(normalAttribLocation);
  
  glBuffers           = {};    
  glBuffers.positions = gl.createBuffer();
  
  glContext = gl;
  
  refinedLevels = 0;
  
  var refinementManager = new x3dom.RefinementJobManager();

  var callback;
  
  (function (rm) {    
    callback = function(attributeId, bufferView){
      refinementFinishedCallback(attributeId, bufferView, rm);
    };    
  })(refinementManager);
                                 //3263148
  var buf = new ArrayBuffer(16 * 3254172);
  
  var interleavedCoordNormalBuffer = new Uint16Array(buf);
  
  refinementManager.addResultBuffer(0, interleavedCoordNormalBuffer);
  
  for (i = 0; i < NumLevels; ++i) {
    refinementManager.addRefinementJob(0,                 //attributeId / resultBufferId
                                       i,                 //download priority
                                       refinementURLs[i], //data file url
                                       i,                 //refinement level (-> important for bit shift)
                                       callback,          //'job finished'-callback
                                       StrideInBits,      //stride in bits (size of a single result element)
                                       [3, 3],            //number of components information array
                                       [6, 0],            //bits per refinement level information array
                                       [0, 0],            //read offset (bits) information array
                                       [0, 64]);          //write offset (bits) information array
  }
},


update : function(gl, dt)
{
  this.angle += 90.0 * dt;
},


draw : function(gl)
{
  if (drawAllowed) {
  
    // Move some of this (viewport, projection) to a reshape function.
    var w = this.ui.width;
    var h = this.ui.height;

    gl.clearColor(0.2, 0.2, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    gl.viewport(0, 0, w, h);

    this.xform.projection.loadIdentity();
    this.xform.projection.perspective(sglDegToRad(60.0), w/h, 0.1, 100.0);

    this.xform.view.loadIdentity();
    this.xform.view.lookAt(0.0, 2.0, 3.0,
                           0.0, 0.0, 0.0,
                           0.0, 1.0, 0.0);

    this.xform.model.loadIdentity();
    this.xform.model.rotate(sglDegToRad(this.angle), 0.0, 1.0, 0.0);

    gl.uniformMatrix4fv(this.program.set_uniform["u_mvp"], false,
                        this.xform.modelViewProjectionMatrix);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.positions);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.UNSIGNED_SHORT, true, 8*2, 0  );
    gl.vertexAttribPointer(normalAttribLocation,   3, gl.UNSIGNED_SHORT, true, 8*2, 4*2);

    //3263148    
    gl.drawArrays(gl.TRIANGLES, 0, 3254172);
    
    //-  
    if (refinedLevels !== NumLevels) {        
      drawAllowed = false;
    }
  
  }
  
}
};


function refinementFinishedCallback(attributeId, buffer, refinementJobManager) {  
  //console.log('=> Client received refined data for level ' + refinedLevels + '!');
          
  var normalBuffer,
      coordBuffer;
    
  if (UseInterleavedOutput) {					
    coordBuffer  = new Uint16Array(buffer);
  }
  else {
    normalBuffer = new Uint16Array(buffer);
    coordBuffer  = new Uint16Array(buffer);
  }

  if (UseInterleavedOutput) {
    numArrayElements = (coordBuffer.length * Uint16Array.BYTES_PER_ELEMENT * 8) / StrideInBits;
  }
  else {
    numArrayElements = coordBuffer.length / 3;
  }
  
  ++refinedLevels;
  
  drawAllowed = true;
  
  //if (refinedLevels === NumLevels)
  { 
    //upload the VBO data to the GPU
    glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers.positions);  
    glContext.bufferData(glContext.ARRAY_BUFFER, coordBuffer, glContext.STATIC_DRAW);
  }
  
  var allFinished = true;
  
  if (refinedLevels === NumLevels) {
    UpdateTotal(Date.now() - start_time);    
  }  
  else {
    refinementJobManager.continueProcessing(attributeId);
  }
}
    
    
start_time = Date.now();


sglRegisterCanvas("webgl_canvas", new LoaderExample(), 60.0);
