var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;

var awaitingSecondAttrib = false;

var refinementManager;

//---

const UseInterleavedOutput = true;
		
const NumLevels = 8;

const StrideInBits = 96;

var texture;

var glContext;

var glBuffers;	//object data buffers on the gpu
  /* Element structure:
  {
  indices:   {},
  positions: {},
  normals:   {},
  texcoords: {}
  }
  */

var positionAttribLocation;
var normalAttribLocation;
var colorAttributeLocation;

var refinedLevels = 0, refinementsTexCoord = 0;

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

             
function LoaderExample() { }

var drawAllowed = false;
LoaderExample.prototype = {


num_indices : 0,


load : function(gl)
{
  var b, i, j;
  
  var refinementURLs = [];
  for (i = 0; i < NumLevels; ++i) {
    refinementURLs[i] = (encodeURI('bitbunny_aopt/LG_0_level' + i + '.bin'));
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
  
  positionAttribLocation = gl.getAttribLocation(this.program.handle_, 'a_position');
  normalAttribLocation   = gl.getAttribLocation(this.program.handle_, 'a_normal');
  colorAttributeLocation = gl.getAttribLocation(this.program.handle_, 'a_color');
  
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(normalAttribLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);
  
  glBuffers = {};  
  glBuffers.indices   = gl.createBuffer();
  glBuffers.positions = gl.createBuffer();
  glBuffers.normals   = gl.createBuffer();
  glBuffers.colors    = gl.createBuffer();
  
  glContext = gl;
    
  
  refinementManager = new x3dom.RefinementJobManager();

  //BEGIN GET TEXTURE 
  texture = gl.createTexture();
  var img = new Image();
  img.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  img.src = "bitbunny_aopt/fractal.png";
  //END GET TEXTURE
  
	//BEGIN GET INDICES
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'bitbunny_aopt/LG_0_indexBinary.bin', true);
	xhr.responseType = "arraybuffer";            
	xhr.send(null);

	xhr.onload = function(){          
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers.indices);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(xhr.response), gl.STATIC_DRAW);
	};
	//END GET INDICES

  
  //interleaved result format: (positions + normals)
  //[ px | py  | pz  | 0   | nt  | np  ]
  //[ 0  | 16  | 32  | 48  | 64  | 80  ] 96
  // 96 bits = 12 bytes
  
  const numVerts = 34834;
  
  var buf = new ArrayBuffer(6*2 * numVerts);  
  var interleavedCoordNormalBuffer = new Uint16Array(buf);
  
  var cBuf = new ArrayBuffer(3*2 * numVerts);  
  var colorBuffer = new Uint16Array(cBuf);
  
  x3dom.RefinementJobManager.suppressOnTransferablesNotSupported = true;
  
  refinementManager.addResultBuffer(0, interleavedCoordNormalBuffer);
  refinementManager.addResultBuffer(1, colorBuffer);
  
  //normal / coord refinements
  for (i = 0; i < NumLevels; ++i) {
    refinementManager.addRefinementJob(0,                           //attributeId / resultBufferId
                                       i,                           //download priority
                                       refinementURLs[i],           //data file url
                                       i,                           //refinement level (-> important for bit shift)
                                       refinementFinishedCallback,  //'job finished'-callback
                                       StrideInBits,                //stride in bits (size of a single result element)
                                       [3, 2],                      //number of components information array
                                       [6, 2],                      //bits per refinement level information array
                                       [0, 6],                      //read offset (bits) information array
                                       [0, 64]);                    //write offset (bits) information array                                       
  }
  
  //color refinements
  colorURLs = ['bitbunny_aopt/LG_0_level8.bin',  'bitbunny_aopt/LG_0_level9.bin',
               'bitbunny_aopt/LG_0_level10.bin', 'bitbunny_aopt/LG_0_level11.bin'];
  for (i = 0; i < 4; ++i) {
    refinementManager.addRefinementJob(1,                           //attributeId / resultBufferId
                                       i,                           //download priority
                                       colorURLs[i],                //data file url
                                       i,                           //refinement level (-> important for bit shift)
                                       refinementFinishedCallback,  //'job finished'-callback
                                       48,                          //stride in bits (size of a single result element)
                                       [3],                         //number of components information array
                                       [6],                         //bits per refinement level information array
                                       [0],                         //read offset (bits) information array
                                       [0]);                        //write offset (bits) information array                                       
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
    //this.xform.view.lookAt(0.0, 2.0, 3.0,
    this.xform.view.lookAt(0.0, -1.0, 2.0,
                           0.0, -1.0, 0.0,
                           0.0, 1.0, 0.0);

    this.xform.model.loadIdentity();	
    this.xform.model.rotate(sglDegToRad(this.angle), 0.0, 1.0, 0.0);
    //this.xform.model.rotate(sglDegToRad(90.0), 1.0, 0.0, 0.0);

    gl.uniformMatrix4fv(this.program.set_uniform["u_mvp"], false,
                        this.xform.modelViewProjectionMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(this.program.handle_, "u_sampler"), 0);
   
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuffers.indices);
   
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.positions);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.UNSIGNED_SHORT, true, 6*2, 0  );
    gl.vertexAttribPointer(normalAttribLocation,   2, gl.UNSIGNED_SHORT, true, 6*2, 4*2);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.colors);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_SHORT, true, 3*2, 0);

    gl.drawElements(gl.TRIANGLES, 208353, gl.UNSIGNED_SHORT, 0);  
  }
}
};


function refinementFinishedCallback(attributeId, bufferView) {  
  if (attributeId === 0) {
    console.log('=> Client received refined coord/normal data for level ' + refinedLevels + '!');
    
    ++refinedLevels;
    
    //upload the VBO data to the GPU
    glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers.positions);  
    glContext.bufferData(glContext.ARRAY_BUFFER, bufferView, glContext.STATIC_DRAW);
    
    if (refinedLevels === NumLevels) {     
      UpdateTotal(Date.now() - start_time);
    }
  }
  else if (attributeId === 1) {
    console.log('=> Client received refined color data!');
     
    glContext.bindBuffer(glContext.ARRAY_BUFFER, glBuffers.colors);
    glContext.bufferData(glContext.ARRAY_BUFFER, bufferView, glContext.STATIC_DRAW);
  }  
  
  drawAllowed = true;
  
  refinementManager.continueProcessing(attributeId);
}


start_time = Date.now();


sglRegisterCanvas("webgl_canvas", new LoaderExample(), 60.0);
