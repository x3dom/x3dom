// sets up for use of the 3DTilesRenderer umd libraries
// needs to be executed before libraries are added with packages.json
// establish a dummy exports object
exports = {};
//
// establish an x3dom object as name space
x3dom[ "3DTilesRenderer" ] = {};
//globalThis = x3dom.TilesRenderer;
// the npm libraries are amended by a line to save the libraries into the name space