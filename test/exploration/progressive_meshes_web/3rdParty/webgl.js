'use strict';

// Utility wrapper around WebGL. Perserves WebGL semantics, so it
// isn't too object-oriented.

function createContextFromCanvas(canvas) {
  var context = canvas.getContext('experimental-webgl');
  // Automatically use debug wrapper context, if available.
  return typeof WebGLDebugUtils !== 'undefined' ? 
    WebGLDebugUtils.makeDebugContext(context, function(err, funcName, args) {
      throw WebGLDebugUtils.glEnumToString(err) + " by " + funcName;
    }) : context;
};

function Shader(gl, source, shaderType) {
  this.gl_ = gl;
  this.handle_ = gl.createShader(shaderType);
  gl.shaderSource(this.handle_, source);
  gl.compileShader(this.handle_);
  if (!gl.getShaderParameter(this.handle_, gl.COMPILE_STATUS)) {
    throw this.info();
  }
}

Shader.prototype.info = function() {
  return this.gl.getShaderParameter(this.handle_, this.gl.INFO_LOG);
}

Shader.prototype.type = function() {
  return this.gl.getShaderParameter(this.handle_, this.gl.SHADER_TYPE);
}

function vertexShader(gl, source) {
  return new Shader(gl, source, gl.VERTEX_SHADER);
}

function fragmentShader(gl, source) {
  return new Shader(gl, source, gl.FRAGMENT_SHADER);
}

function Program(gl, shaders) {
  this.gl_ = gl;
  this.handle_ = gl.createProgram();
  shaders.forEach(function(shader) {
    gl.attachShader(this.handle_, shader.handle_);
  }, this);
  gl.linkProgram(this.handle_);
  if (!gl.getProgramParameter(this.handle_, gl.LINK_STATUS)) {
    throw this.info();
  }
  
  var numActiveAttribs = gl.getProgramParameter(this.handle_,
                                                gl.ACTIVE_ATTRIBUTES);
  this.attribs = [];
  this.set_attrib = {};
  for (var i = 0; i < numActiveAttribs; i++) {
    var active_attrib = gl.getActiveAttrib(this.handle_, i);
    var loc = gl.getAttribLocation(this.handle_, active_attrib.name);
    this.attribs[loc] = active_attrib;
    this.set_attrib[active_attrib.name] = loc;
  }
  
  var numActiveUniforms = gl.getProgramParameter(this.handle_,
                                                 gl.ACTIVE_UNIFORMS);
  this.uniforms = [];
  this.set_uniform = {};
  for (var j = 0; j < numActiveUniforms; j++) {
    var active_uniform = gl.getActiveUniform(this.handle_, j);
    this.uniforms[j] = active_uniform;
    this.set_uniform[active_uniform.name] = gl.getUniformLocation(
      this.handle_, active_uniform.name);
  }
};

Program.prototype.info = function() {
  return this.gl_.getProgramInfoLog(this.handle_);
};

Program.prototype.use = function() {
  this.gl_.useProgram(this.handle_);
};

Program.prototype.enableVertexAttribArrays = function(attribArrays) {
  var numAttribs = attribArrays.length;
  for (var i = 0; i < numAttribs; ++i) {
    var params = attribArrays[i];
    var loc = this.set_attrib[params.name];
    if (loc !== undefined) {
      this.gl_.enableVertexAttribArray(loc);
    }
  }
};

Program.prototype.vertexAttribPointers = function(attribArrays) {
  var numAttribs = attribArrays.length;
  for (var i = 0; i < numAttribs; ++i) {
    var params = attribArrays[i];
    var loc = this.set_attrib[params.name];
    var typeBytes = 4;  // TODO: 4 assumes gl.FLOAT, use params.type
    this.gl_.vertexAttribPointer(loc, params.size, this.gl_.FLOAT,
                                 !!params.normalized, typeBytes*params.stride,
                                 typeBytes*params.offset);
  }
};

function textureFromImage(gl, image) {
  // TODO: texture formats. Color, MIP-mapping, etc.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                   gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

function textureFromUrl(gl, url, opt_callback) {
  var image = new Image;
  image.onload = function() {
    var texture = textureFromImage(gl, image);
    opt_callback && opt_callback(gl, texture);
  };
  image.src = url;
}
