var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;

var awaitingSecondAttrib = false;

//---
//const ACTIVE = 14;
//const NumPatches = (ACTIVE + 1);
const NumPatches = 16;

const PrimCount = [{a : 72884,
                    b : 2730  },
                   {a : 90528,
                    b : 3444  },
                   {a : 99968,
                    b : 3642  },
                   {a : 92007,
                    b : 3462  },
                   {a : 84212,
                    b : 3147  },
                   {a : 63917,
                    b : 2367  },
                   {a : 68877,
                    b : 2580  },
                   {a : 80033,
                    b : 2904  },
                   {a : 92117,
                    b : 3324  },
                   {a : 108251,
                    b : 3816  },
                   {a : 91844,
                    b : 3438  },
                   {a : 107469,
                    b : 3783  },
                   {a : 97880,
                    b : 3981  },                
                   {a : 67513,
                    b : 2601  },
                   {a : 61274,
                    b : 2430  },
                   {a : 104126,
                    b : 4386  }
                    ];
                    
const FileBaseURIs = [encodeURI("lodGeo/G0_"),
                      encodeURI("lodGeo/G1_"),
                      encodeURI("lodGeo/G15_"),
                      encodeURI("lodGeo/G2_"),
                      encodeURI("lodGeo/G3_"),
                      encodeURI("lodGeo/G4_"),
                      encodeURI("lodGeo/G5_"),
                      encodeURI("lodGeo/G6_"),
                      encodeURI("lodGeo/G7_"),
                      encodeURI("lodGeo/G8_"),
                      encodeURI("lodGeo/G9_"),
                      encodeURI("lodGeo/G10_"),
                      encodeURI("lodGeo/G11_"),
                      encodeURI("lodGeo/G12_"),
                      encodeURI("lodGeo/G13_"),
                      encodeURI("lodGeo/G14_")]
                       
const Offsets = [{x : 0.0150144994259, y : 0.235128998756, z : -0.0129659995437},
                 {x : 0.0150395017117, y : 0.21044999361, z : -0.00991200096905},
                 {x : -0.0170029997826, y : 0.222592502832, z : -0.0113889984787},
                 {x : 0.0150015000254, y : 0.185926496983, z : -0.00905999913812},
                 {x : 0.015164501965, y : 0.161074995995, z : -0.00654399953783},
                 {x : -0.0170179996639, y : 0.185856491327, z : -0.00910650007427},
                 {x : -0.0182349998504, y : 0.160950005054, z : -0.00737849995494},
                 {x : 0.014450000599, y : .136440992355, z : -0.0082370005548},
                 {x : 0.0130889993161, y : 0.111671000719, z : -0.0116869993508},
                 {x : -0.0200204998255, y : 0.136252000928, z : -0.00875150039792},
                 {x : -0.0212794989347, y : 0.111699998379, z : -0.0122699998319},
                 {x : 0.0133754983544, y : 0.0869500041008, z : -0.00683899968863},
                 {x : 0.0149069987237, y : 0.062527500093, z : -0.0066795013845},
                 {x : -0.01427350007, y : 0.0870749950409, z : -0.0068469978869},
                 {x : -0.0330730006099, y : 0.0868249982595, z : -0.00686400011182},
                 {x : -0.024871500209, y : 0.0622909963131, z : -0.00668999925256}]
                       

const UseInterleavedOutput = true;
		
const NumLevels = 8;

const StrideInBits = 96;

var glContext;

var glBuffers = [];	//object data buffers on the gpu
  /* Element structure:
  {
  indicesTriStrips: {},
  indicesTris:      {},
  positions: {},
  normals:   {}  
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
  out.innerHTML = "Decode time: " + decode_ms +
      " ms, Total time: " + ms + " ms";
}

/*
var refinementURLs = [ 'data/refinement00.bin',
                       'data/refinement01.bin',
                       'data/refinement02.bin',
                       'data/refinement03.bin',
                       'data/refinement04.bin',
                       'data/refinement05.bin',
                       'data/refinement06.bin',
                       'data/refinement07.bin' ];
*/
/*                     
var refinementURLs = [ 'LG_0_level0.bin',
                       'LG_0_level1.bin',
                       'LG_0_level2.bin',
                       'LG_0_level3.bin',
                       'LG_0_level4.bin',
                       'LG_0_level5.bin',
                       'LG_0_level6.bin',
                       'LG_0_level7.bin' ];                       
                       
*/
/*
var refinementURLs = ['lodGeo/G0_level0.bin',
                      'lodGeo/G0_level1.bin',
                      'lodGeo/G0_level2.bin',
                      'lodGeo/G0_level3.bin',
                      'lodGeo/G0_level4.bin',
                      'lodGeo/G0_level5.bin',
                      'lodGeo/G0_level6.bin',
                      'lodGeo/G0_level7.bin'];
                      */

             
function LoaderExample() { }

var drawAllowed = false;
LoaderExample.prototype = {


num_indices : 0,


load : function(gl)
{
  var b, i, j;
  
  var refinementURLs = [], indexFileURLs = [];
  for (i = 0; i < 16; ++i) {
    indexFileURLs[i] = (encodeURI(FileBaseURIs[i] + 'indexBinary.bin'));
    
    refinementURLs.push([]);
    for (j = 0; j < 8; ++j) {
      refinementURLs[i].push(encodeURI(FileBaseURIs[i] + 'level' + j + '.bin'));      
    } 
  }
  
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
  
  //-> original code:
  //program.enableVertexAttribArrays(BUDDHA_ATTRIB_ARRAYS);
  //-
	//-> replaced with:
  positionAttribLocation = gl.getAttribLocation(this.program.handle_, 'a_position');
  normalAttribLocation   = gl.getAttribLocation(this.program.handle_, 'a_normal');
  
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(normalAttribLocation);
  
  for (b = 0; b < NumPatches; ++b) {
    glBuffers[b] = {};
    glBuffers[b].indicesTriStrips = gl.createBuffer();
    glBuffers[b].indicesTris      = gl.createBuffer();
    glBuffers[b].positions        = gl.createBuffer();
    glBuffers[b].normals          = gl.createBuffer();
  }
  
  glContext = gl;
  //-
  //BEGIN GET INDICES
  for (b = 0; b < NumPatches; ++b) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", indexFileURLs[b], true);
    xhr.responseType = "arraybuffer";            
    xhr.send(null);
    
    (function(req, idx){
    
      xhr.onload = function(){          
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers[idx].indicesTriStrips);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(req.response, 0,                  PrimCount[idx].a), gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers[idx].indicesTris);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(req.response, PrimCount[idx].a*2, PrimCount[idx].b), gl.STATIC_DRAW);
      };
    
    })(xhr, b);
  }
  //END GET INDICES
  //----
  
  
  for (b = 0; b < NumPatches; ++b) {
  
    var bitComposer = new x3dom.BitLODComposer();

    //bitComposer.toggleDebugOutput(true);
    //x3dom.DownloadManager.toggleDebugOutput(true);
    
    var callback;
    
    (function (idx, bc){
    
        callback = function(buffer){
        refinementFinishedCallback(buffer, idx, bc);
      };
    
    })(b, bitComposer);
    
    bitComposer.run([3, 2], 					          //components
                    [16, 16], 					        //attribute bits for each component
                    [6,   2], 					        //bits per refinement level for all components
                    refinementURLs[b],	        //URLs for the files of the refinement levels
                    callback, //callback, executed on refinement
                    [0, 64],					          //write offset in bits (interleaved output)
                    StrideInBits);			        //write stride in bits (interleaved output)
                  
  }
},


update : function(gl, dt)
{
  this.angle += 90.0 * dt;
},


draw : function(gl)
{
  if (drawAllowed){
  
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

    //-> original code:
    //gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    //program.vertexAttribPointers(BUDDHA_ATTRIB_ARRAYS);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    //gl.drawElements(gl.TRIANGLES, this.num_indices, gl.UNSIGNED_SHORT, 0);
    //-
    //-> replaced with:
    for (var b = 0; b < NumPatches; ++b) {
      gl.uniform3f(gl.getUniformLocation(this.program.handle_, "u_offset"), Offsets[b].x, Offsets[b].y, Offsets[b].z);
    
      if (UseInterleavedOutput) {
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[b].positions);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.UNSIGNED_SHORT, true, 6*2, 0  );
        gl.vertexAttribPointer(normalAttribLocation,   2, gl.UNSIGNED_SHORT, true, 6*2, 4*2);							
      }
      else {
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[b].positions);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.UNSIGNED_SHORT, true, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers[b].normals);
        gl.vertexAttribPointer(normalAttribLocation, 2, gl.UNSIGNED_SHORT, true, 0, 0);
      }

      //gl.drawArrays(gl.TRIANGLES, 0, numArrayElements);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers[b].indicesTriStrips);
      gl.drawElements(gl.TRIANGLE_STRIP, PrimCount[b].a, gl.UNSIGNED_SHORT, 0);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers[b].indicesTris);
      gl.drawElements(gl.TRIANGLES, PrimCount[b].b, gl.UNSIGNED_SHORT, 0);  
    }
    //-  
    var b;
    for (b = 0; b < NumPatches; ++b) {
      if (refinedLevels[b] !== NumLevels){
        drawAllowed = false;
      }
    }
  
  }
  
}
};


function refinementFinishedCallback(buffer, patchIdx, bitComposer) {
  if (!refinedLevels[patchIdx])
    refinedLevels[patchIdx] = 0;
  
  console.log('=> Client received refined data for level ' + refinedLevels[patchIdx] + ' of patch ' + patchIdx + '!');
          
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
  
  ++refinedLevels[patchIdx];
  
  if (true ||
      refinedLevels[patchIdx] === 2 ||
      refinedLevels[patchIdx] === 4 ||
      refinedLevels[patchIdx] === 6 ||
      refinedLevels[patchIdx] === 8   )
  {
 
  //upload the VBO data to the GPU
  glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers[patchIdx].positions);  
  glContext.bufferData(glContext.ARRAY_BUFFER, coordBuffer, glContext.STATIC_DRAW);
  
  //@todo: check this hack!
  drawAllowed = true;
  }
  
  if (!UseInterleavedOutput) {
    glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers[patchIdx].normals);
    glContext.bufferData(glContext.ARRAY_BUFFER, normalBuffer, glContext.STATIC_DRAW);
  }
  
  //enjoy it :-)
  //sleep(500);

  if (refinedLevels[patchIdx] === NumLevels) {
    UpdateTotal(Date.now() - start_time);
  }
  //else {
    bitComposer.refine(buffer);
  //}
}
    
    
start_time = Date.now();


sglRegisterCanvas("webgl_canvas", new LoaderExample(), 60.0);
