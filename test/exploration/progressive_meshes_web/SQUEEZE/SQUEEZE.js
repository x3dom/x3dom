var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;

var glContext;

var positionBuffer;
var normalBuffer;

var positionAttribLocation;
var normalAttribLocation;
      
var numArrayElements = 0;

var refinedLevels = [];

function UpdateDecode(ms) {
  decode_ms += ms;
}


function UpdateTotal(ms) {
  start_drawing = true;
  out.innerHTML = "Decode time: "     + decode_ms +
                  " ms, Total time: " + ms        + " ms";
}

             
function LoaderExample() { }

LoaderExample.prototype = {


load : function(gl)
{
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
  
  positionBuffer = gl.createBuffer();
  normalBuffer   = gl.createBuffer();
  
  var trianglePositions = [0.0, 0.0, 0.0,
                           1.0, 0.0, 0.0,
                           0.0, 1.0, 0.0 ];
                       
  var triangleNormals = [0.0, 0.0, 1.0,
                         0.0, 0.0, 1.0,
                         0.0, 0.0, 1.0 ];
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(trianglePositions), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleNormals),   gl.STATIC_DRAW);
},


update : function(gl, dt)
{
  this.angle += 90.0 * dt;
},


draw : function(gl)
{
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
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);  
  gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0 );  
  
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);  
  gl.vertexAttribPointer(normalAttribLocation,   3, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

};

    
start_time = Date.now();


sglRegisterCanvas("webgl_canvas", new LoaderExample(), 60.0);
