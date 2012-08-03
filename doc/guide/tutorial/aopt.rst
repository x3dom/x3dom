
Analyzing&Optimizing Your Model For The 3D Web
==============================================

The InstantReality platform provides its users with tools to help them better understand and optimize their (possibly large) 3D data sets. One such tool is aopt that (among other things) can help you in various ways to optimize 3d models with a special focus on scenegraph data.

aopt
----

aopt is a powerful command line tool that comes bundled with InstantReality. If you have InstantReality installed, opening your command line and entering "aopt" will provide you with a list of all available command line arguments and some examples of its usage. A very basic procedure for example would be to convert a file that InstantReality can open into an X3D file:

	aopt –i <input.foo> -x <output>.x3d

Or to VRML:

	aopt –i <input.foo> -v <output>.wrl

You can also export to HTML and XHTML `directly <http://x3dom.org/docs/dev/tutorial/dataconversion.html>`_.

Analyzing your 3D model
-----------------------

You can get some basic statistics for your file using the "-p" parameter:

	aopt -i <input.foo> -p

This will give you some basic information like the number of nodes and the numbers of various types of nodes. For example, a scene that is static but heavy on the number of nodes might be suited for automatic restructuring (see below).

ImageGeometry & BinaryGeometry Nodes
------------------------------------

If you want to retain the basic structure of your scenegraphs (i.e. not change any of the nodes, only their contents) you can convert geometry nodes to special ImageGeometry or BinaryGeometry nodes that will apply advanced compression techniques. This will create additional files that are referenced from <output>.x3d, so you should first create a folder, e.g.:

	mkdir imggeo
	aopt -i <input.foo> -g imggeo/:is -x <output>.x3d

Note: currently it is import that "imggeo" (or any folder you choose) does exist. Please also note that the "/" is NOT optional, it needs to be added at the end of the path.

The ":is" part is a sub-parameter. "i" is for "index" and "s" for "strip", so this example will generate and store index strip geometry. For ImageGeometry nodes these are the only options available and it is recommended to set them.

As an alternative you can convert to BinaryGeometry instead of ImageGeometry nodes:

	mkdir bingeo
	aopt -i <input.foo> -G bingeo/:is -x <output>.x3d

For BinaryGeometry the available parameters are:

* i: index
* s: strip
* a: autoIndex (index data with more than 16 bit indicies)
* c: compact (use 16 bit for coordinates)
* I: interleaved (all stat in a single package)

Restructuring
-------------

If you are willing to completely restructure the scenegraph, you can use this funtion:

	aopt -i <input.foo> -F Scene:opt(1),maxtris(20000) -x <output>.x3d

This will try to automatically optimize your scene, for example it might try to merge (flatten) your whole scene, generate one or more texture atlases on the way or split all geometry nodes so they can be indexed with 16 bits.

Instead of Scene you can also have specific node names or node type names for a more targeted approach. The subparameters in the example configure aopt to create a single-index geometry with up to 20000 triangles per geometry core.

It's not necessary to set any sub-parameters.

Available subparameters are:

* opt: 0:None 1:createSingleIndex 2:createSharedIndex 3:OptimizePrimitives
* int maxtris: Maximum Number of Triangles per GeometryCore.
* int vertexcolor: Store MaterialColor in VertexColor if the amount of triangles in the geomety is under the threshold.
* int texcoords: Ignore Geometry with Texturecoordinates greater than that value.
* int optimizeTC: Try to lower Texturecoordinates to this value. (Generates more Triangles).
* bool storeondisk: Geometries are stored on disk. (Lower Memory consumption during process).
* bool toworld: The vertex positions are tranformed to worldcoordinates.
* idmap: Should an IDmap be created?
* bool flat: Scene is stored in a flat graph (true), or in a hierarchy (false).
* bool cacheopt: Merges all Geometry with same Material and rebuild it to 65555 vertex chunks.
* bool calcnormals: False: Keep Normals True: Recalc them after building new Geometry.
* int maxIndexSize: Maximum IndexSize for rebuildBy Index/Texture.
* int maxTextureSize: Maximum Texture Size for rebuildByTextureSize.
* float centerBB: Output will be transformed to a centered BB with given size.

Example:

	aopt -i <input.foo> -F Scene:maxtris(5000),flat(true),calcnormals(false),centerBB(50)  -x <output>.x3d

Note: Depending on the operation optTree chooses, not all parameter are used! Boolean values can be both 0/1 and false/true.
