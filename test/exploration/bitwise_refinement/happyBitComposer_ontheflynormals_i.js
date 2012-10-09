var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;
		
const NumLevels = 8;

const StrideInBits = 48;

var indexArray;

var triangleBuffer = 'undefined';

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


var refinementURLs = [ 'indexed_tris/refinement00.bin',
                       'indexed_tris/refinement01.bin',
                       'indexed_tris/refinement02.bin',
                       'indexed_tris/refinement03.bin',
                       'indexed_tris/refinement04.bin',
                       'indexed_tris/refinement05.bin',
                       'indexed_tris/refinement06.bin',
                       'indexed_tris/refinement07.bin' ];
             
             
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
  
  glBuffers             = {};    
  glBuffers.vertex_data = gl.createBuffer();  
  
  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'indexed_tris/indices.bin', true);
  xhr.responseType = "arraybuffer";            
  xhr.onload = function() {      
    indexArray = new Uint32Array(xhr.response);
  };
  xhr.send(null);    
  
  glContext = gl;
  
  refinedLevels = 0;
  
  var refinementManager = new x3dom.RefinementJobManager();

  var callback;
  
  (function (rm) {    
    callback = function(attributeId, bufferView){
      refinementFinishedCallback(attributeId, bufferView, rm);
    };    
  })(refinementManager);
                                 
  var coordBuffer = new Uint16Array(3*3261603);
  
  refinementManager.addResultBuffer(0, coordBuffer);
  
  for (i = 0; i < NumLevels; ++i) {
    refinementManager.addRefinementJob(0,                 //attributeId / resultBufferId
                                       i,                 //download priority
                                       refinementURLs[i], //data file url
                                       i,                 //refinement level (-> important for bit shift)
                                       callback,          //'job finished'-callback
                                       StrideInBits,      //stride in bits (size of a single result element)
                                       [3],               //number of components information array
                                       [6],               //bits per refinement level information array
                                       [0],               //read offset (bits) information array
                                       [0]);              //write offset (bits) information array
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
    this.xform.view.lookAt(0.0, 2.0, 4.0,
                           0.0, 1.0, 0.0,
                           0.0, 1.0, 0.0);

    this.xform.model.loadIdentity();    
    this.xform.model.rotate(sglDegToRad(this.angle), 0.0, 1.0, 0.0);
    this.xform.model.translate(-0.4, 0.0, -0.4);

    gl.uniformMatrix4fv(this.program.set_uniform["u_mvp"], false,
                        this.xform.modelViewProjectionMatrix);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.vertex_data);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.UNSIGNED_SHORT, true, 8*2, 0);
    gl.vertexAttribPointer(normalAttribLocation,   3, gl.UNSIGNED_SHORT, true, 8*2, 4*2);

    gl.drawArrays(gl.TRIANGLES, 0, 3254172);
    
    //-  
    if (refinedLevels !== NumLevels) {        
      drawAllowed = false;
    }
  
  }  
}
};


function subtract(v0, v1) {
  return [v0[0] - v1[0],
          v0[1] - v1[1],
          v0[2] - v1[2]];
};


function normalize(v) {
  var l = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  l = 1.0 / l;
  return [v[0]*l, v[1]*l, v[2]*l];
};


function cross(v0, v1) {
  return [v0[1]*v1[2] - v0[2]*v1[1],
          v0[2]*v1[0] - v0[0]*v1[2],
          v0[0]*v1[1] - v0[1]*v1[0]];
};


function refinementFinishedCallback(attributeId, buffer, refinementJobManager) {
  var normalBuffer,
      coordBuffer, i, idx, t_idx,
      point_idx, points, e1, e2, nor;

  coordBuffer  = new Uint16Array(buffer);

  numArrayElements = (coordBuffer.length * Uint16Array.BYTES_PER_ELEMENT * 4) / StrideInBits;
  
  ++refinedLevels;
  
  drawAllowed = true;
  
  //if (refinedLevels === NumLevels)
  { 
    if (triangleBuffer === 'undefined') {
      //8 entries per element -> xyz + one zero byte as padding, same for normals
      triangleBuffer = new Uint16Array(indexArray.length * 8);
    }
    
    //create VBO data, using downloaded indices, create normals on-the-fly
    point_idx = 0;
    points    = [[0,0,0],[0,0,0],[0,0,0]];
    for (i = 0; i < indexArray.length; ++i) {
      idx = indexArray[i] * 3;
      
      points[point_idx][0] = coordBuffer[idx    ];
      points[point_idx][1] = coordBuffer[idx + 1];
      points[point_idx][2] = coordBuffer[idx + 2];
      
      t_idx = i*8;
      
      triangleBuffer[t_idx    ] = points[point_idx][0];
      triangleBuffer[t_idx + 1] = points[point_idx][1];
      triangleBuffer[t_idx + 2] = points[point_idx][2];
      
      if (++point_idx === 3) {
        point_idx = 0;
      
        e1  = normalize(subtract(points[1], points[0]));
        e2  = normalize(subtract(points[2], points[0]));
        nor = cross(e1, e2);
        
        nor[0] = nor[0] * 32767 + 32767;
        nor[1] = nor[1] * 32767 + 32767;
        nor[2] = nor[2] * 32767 + 32767;
        
        triangleBuffer[t_idx + 4] = nor[0];
        triangleBuffer[t_idx + 5] = nor[1];
        triangleBuffer[t_idx + 6] = nor[2];
        
        triangleBuffer[t_idx - 4 ] = nor[0]; 
        triangleBuffer[t_idx - 3 ] = nor[1]; 
        triangleBuffer[t_idx - 2 ] = nor[2]; 
                               
        triangleBuffer[t_idx - 12] = nor[0];
        triangleBuffer[t_idx - 11] = nor[1];
        triangleBuffer[t_idx - 10] = nor[2];
      }
    }
  
    //upload the VBO data to the GPU
    glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers.vertex_data);  
    glContext.bufferData(glContext.ARRAY_BUFFER, triangleBuffer, glContext.STATIC_DRAW);
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
