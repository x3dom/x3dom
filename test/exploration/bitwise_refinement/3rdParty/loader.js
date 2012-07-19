'use strict';

// TODO: will it be an optimization to specialize this method at
// runtime for different combinations of stride, decodeOffset and
// decodeScale?
function decompressInner_(str, inputStart, inputEnd,
                          output, outputStart, stride,
                          decodeOffset, decodeScale) {
  var prev = 0;
  for (var j = inputStart; j < inputEnd; j++) {
    var code = str.charCodeAt(j);
    prev += (code >> 1) ^ (-(code & 1));
    output[outputStart] = decodeScale * (prev + decodeOffset);
    outputStart += stride;
  }
}

function decompressSimpleMesh(str, attribArrays) {
  var numVerts = str.charCodeAt(0);
  if (numVerts >= 0xE000) numVerts -= 0x0800;
  numVerts++;

  // Extract conversion parmaters from attribArrays.
  var stride = attribArrays[0].stride;  // TODO: generalize.
  var decodeOffsets = new Float32Array(stride);
  var decodeScales = new Float32Array(stride);
  var numArrays = attribArrays.length;
  for (var i = 0; i < numArrays; i++) {
    var attribArray = attribArrays[i];
    var end = attribArray.offset + attribArray.size;
    for (var j = attribArray.offset; j < end; j++) {
      decodeOffsets[j] = attribArray.decodeOffset;
      decodeScales[j] = attribArray.decodeScale;
    }
  }

  // Decode attributes.
  var inputOffset = 1;
  var attribsOut = new Float32Array(stride * numVerts);
  for (var i = 0; i < stride; i++) {
    var end = inputOffset + numVerts;
    var decodeScale = decodeScales[i];
    if (decodeScale) {
      // Assume if decodeScale is never set, simply ignore the
      // attribute.
      decompressInner_(str, inputOffset, end,
                       attribsOut, i, stride,
                       decodeOffsets[i], decodeScale);
    }
    inputOffset = end;
  }

  // Decode indices.
  var numIndices = str.length - inputOffset;
  var indicesOut = new Uint16Array(numIndices);
  var highest = 0;
  for (var i = 0; i < numIndices; i++) {
    var code = str.charCodeAt(i + inputOffset);
    indicesOut[i] = highest - code;
    if (code == 0) {
      highest++;
    }
  }

  return [attribsOut, indicesOut];
}

function meshBufferData(gl, mesh) {
  var attribs = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, attribs);
  gl.bufferData(gl.ARRAY_BUFFER, mesh[0], gl.STATIC_DRAW);

  var indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh[1], gl.STATIC_DRAW);

  return [attribs, indices];
}
