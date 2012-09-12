.. _aopt:

Analyzing and optimizing your model for the 3D Web
==================================================

The InstantReality platform provides its users tools to help them better understand and optimize their (possibly large) 3D data sets. One such tool is aopt that (among other things) can help you in various ways to optimize 3D models with a special focus on scene-graph data.

`Get the aopt tool <http://www.instantreality.org/downloads/>`_

aopt
----

aopt is a powerful command line tool that comes bundled with InstantReality. If you have InstantReality installed, opening your command line and entering "aopt" will provide you with a list of all available command line arguments and some examples of its usage. A very basic procedure for example would be to convert a file that InstantReality can open (e.g. in obj, ply or wrl format) into an X3D file:

.. code-block:: none

	aopt –i <input.foo> -x <output>.x3d

Or to HTML:

.. code-block:: none

	aopt –i <input.foo> -N <output>.html

For a general introduction to data conversion with aopt `check here <http://x3dom.org/docs/dev/tutorial/dataconversion.html>`_.

Analyzing your 3D model
-----------------------

You can get some basic statistics for your file using the "-p" parameter:

.. code-block:: none

	aopt -i <input.foo> -p

This will give you some basic information like the number of nodes and the numbers of various types of nodes. For example, a scene that is static but heavy on the number of nodes might be suited for automatic restructuring (see below).

ImageGeometry & BinaryGeometry nodes
------------------------------------

If you want to retain the basic structure of your scene-graphs (i.e. not change any of the nodes, only their contents) you can convert geometry nodes to special ``ImageGeometry`` or ``BinaryGeometry`` nodes that will apply advanced compression techniques. This will create additional files that are referenced from <output>.x3d, so you should first create a folder, e.g.:

.. code-block:: none

	mkdir imggeo
	aopt -i <input.foo> -g imggeo/:s -x <output>.x3d

Note: currently it is import that "imggeo" (or any folder you choose) does exist. Please also note that the "/" is NOT optional, it needs to be added at the end of the path.

The ":is" part is a sub-parameter. "i" is for "index" and "s" for "strip", so this example will generate and store indexed trianglestrip geometry. For ``ImageGeometry`` nodes these are the only options available and it is recommended to either use `s` or `is`.

As an alternative you can convert to ``BinaryGeometry`` instead of ``ImageGeometry`` nodes:

.. code-block:: none

	mkdir bingeo
	aopt -i <input.foo> -G bingeo/:is -x <output>.x3d

Or convert to HTML using 16 bit interleaved attribute buffers:

.. code-block:: none

	mkdir bingeo
	aopt -i <input.foo> -G bingeo/:saI -N <output>.html

This conversion leads to geometry nodes that look like the one shown next:

.. code-block:: xml

    <binaryGeometry vertexCount='1153083' primType='"TRIANGLES"' 
    	position='19.811892 -57.892578 -1.699294' 
    	size='92.804482 159.783081 26.479685' 
    	coord='binGeo/BG0_interleaveBinary.bin#0+24' coordType='Int16' 
    	normal='binGeo/BG0_interleaveBinary.bin#8+24' normalType='Int16' 
    	color='binGeo/BG0_interleaveBinary.bin#16+24' colorType='Int16'>
    </binaryGeometry>

For ``BinaryGeometry`` the available parameters are:

* i: index
* s: trianglestrip
* a: autoIndex (only index data with less than 16 bit indices)
* c: compact (use 16 bit representation for vertex attributes)
* I: interleaved (use 16 bit interleaved vertex data)

Mesh restructuring
------------------

If you are willing to completely restructure the scene-graph to increase performance, you can use this function:

.. code-block:: none

	aopt -i <input.foo> -F Scene:opt(1),maxtris(20000) -x <output>.x3d

This will try to automatically optimize your scene, for example it might try to merge (flatten) your whole scene, generate one or more texture atlases on the way or split all geometry nodes so they can be indexed with 16 bits.

Instead of ``Scene`` you can also have specific node names or node type names for a more targeted approach. The sub-parameters in this example configure aopt to create a single-index geometry with up to 20,000 triangles per geometry node.

It's not necessary to set any sub-parameters here.
Next, an example is shown how to also accomplish mesh optimization (here of a ply model) by calling aopt three times, for cleanup, mesh patching (for coping with the 16 bit indices limit), and final binary geometry creation.

.. code-block:: none

    aopt -i model.ply -u -b model-clean.x3db
    aopt -i model-clean.x3db -F Scene -b model-opt.x3db
    aopt -i model-opt.x3db -G binGeo/:saI -N model.html

Currently available sub-parameters for the "-F" option are:

* int opt: 0:none 1:createSingleIndex 2:createSharedIndex 3:optimizePrimitives
* int maxtris: Maximum number of triangles per geometry node
* int vertexcolor: Store material color in vertex color, if the amount of triangles in the geometry is under the threshold
* int texcoords: Ignore geometry with texture coordinates greater than that value
* int optimizeTC: Try to lower texture coordinates to this value (generates more triangles)
* bool storeondisk: Geometries are stored on disk (lower Memory consumption during process)
* bool toworld: The vertex positions are transformed to world coordinates
* bool idmap: Should an ID map be created?
* bool flat: Scene is stored in a flat graph (true), or in a hierarchy (false)
* bool cacheopt: Merges all geometry nodes with same material and rebuild it to chunks of 65,535 (= 2^16 - 1) vertices
* bool calcnormals: false to keep normals, true to recalc them after building new geometries
* int maxIndexSize: Maximum index size for rebuild by index/texture
* int maxTextureSize: Maximum texture size for rebuild by texture size
* float centerBB: Output will be transformed to a centered BBox with given size

Example:

.. code-block:: none

	aopt -i <input.foo> -F Scene:maxtris(5000),flat(true),calcnormals(false),centerBB(50) -x <output>.x3d

Note: Depending on the operation the internal tree optimization method chooses, not all parameters are used! Boolean values can be both, 0/1 and false/true.
