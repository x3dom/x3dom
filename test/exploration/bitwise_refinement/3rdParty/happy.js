var out = window.document.getElementById('output');

var start_time;

var decode_ms = 0;

var start_drawing = false;

function UpdateDecode(ms) {
  decode_ms += ms;
}

function UpdateTotal(ms) {
  start_drawing = true;
  out.innerHTML = "Decode time: " + decode_ms +
      " ms, Total time: " + ms + " ms";
}

var BUDDHA_ATTRIB_ARRAYS = [
  { name: "a_position",
    size: 3,
    stride: 8,
    offset: 0,
    decodeOffset: -4095,
    decodeScale: 1/8191
  },
  {
    name: "a_normal",
    size: 3,
    stride: 8,
    offset: 5,
    decodeOffset: -511,
    decodeScale: 1/1023
  }
];

var urls = [ 'happy.A.utf8',
             'happy.B.utf8',
             'happy.C.utf8',
             'happy.D.utf8',
             'happy.E.utf8',
             'happy.F.utf8',
             'happy.G.utf8',
             'happy.H.utf8',
             'happy.I.utf8',
             'happy.J.utf8',
             'happy.K.utf8' ];

function Mesh(gl, attribs_indices) {
  this.num_indices = attribs_indices[1].length;

  var buffers = meshBufferData(gl, attribs_indices);
  this.vbo = buffers[0];
  this.ibo = buffers[1];
}

Mesh.prototype.BindAndDraw = function(gl, program) {
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  program.vertexAttribPointers(BUDDHA_ATTRIB_ARRAYS);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

  gl.drawElements(gl.TRIANGLES, this.num_indices, gl.UNSIGNED_SHORT, 0);
}

function LoaderExample() { }

LoaderExample.prototype = {

num_indices : 0,

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
  program.enableVertexAttribArrays(BUDDHA_ATTRIB_ARRAYS);

  var meshes = [];
  for (var i = 0; i < urls.length; ++i) {
    getHttpRequest(urls[i], function(xhr) {
      if (this.status == 0 || this.status == 200) {
        var decodeStart = Date.now();
        var decoded = decompressSimpleMesh(xhr.responseText, 
                                           BUDDHA_ATTRIB_ARRAYS);
        UpdateDecode(Date.now() - decodeStart);
        meshes[meshes.length] = new Mesh(gl, decoded);
        if (meshes.length === urls.length) {
          UpdateTotal(Date.now() - start_time);
        }
      }
    });
  }

  this.meshes = meshes;
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
  this.xform.view.lookAt(0.0, 2.0, 3.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  this.xform.model.loadIdentity();
  this.xform.model.rotate(sglDegToRad(this.angle), 0.0, 1.0, 0.0);

  gl.uniformMatrix4fv(this.program.set_uniform["u_mvp"], false,
                      this.xform.modelViewProjectionMatrix);

  for (var i = 0; i < this.meshes.length; ++i) {
    var mesh = this.meshes[i];
    if (mesh) {
      mesh.BindAndDraw(gl, this.program);
    }
  }
}

};

start_time = Date.now();

sglRegisterCanvas("webgl_canvas", new LoaderExample(), 60.0);
