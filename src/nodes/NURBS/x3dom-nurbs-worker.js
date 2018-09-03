/*
 * Ayam, a free 3D modeler for the RenderMan interface.
 *
 * Ayam is copyrighted 1998-2016 by Randolf Schultz
 * (randolf.schultz@gmail.com) and others.
 *
 * All rights reserved.
 *
 * See the file License for details.
 *
 */

/* NURBS for x3dom */

importScripts('x3dom-nurbs-tess.js');

onmessage = function(e) {
    var tess = new Tessellator(e.data);
    tess.adjustThresholds(e.data[8], e.data[9]);
    if(e.data[10] && e.data[10].length){
	tess.initTrims();
    } else {
	tess.tloops = null;
    }
    tess.tessellate();

    if(tess.have_transferables){
	var indices = new Uint32Array(tess.indices.length);
	for(var i = 0; i < tess.indices.length; i++)
	    indices[i] = tess.indices[i];
	postMessage(indices.buffer, [indices.buffer]);
	var coords = new Float64Array(tess.coordinates.length);
	for(var i = 0; i < tess.coordinates.length; i++)
	    coords[i] = tess.coordinates[i];
	postMessage(coords.buffer, [coords.buffer]);
	var tcoords = new Float64Array(tess.texcoords.length);
	for(var i = 0; i < tess.texcoords.length; i++)
	    tcoords[i] = tess.texcoords[i];
	postMessage(tcoords.buffer, [tcoords.buffer]);
    } else {
	postMessage([tess.indices, tess.coordinates, tess.texcoords]);
    }

}
