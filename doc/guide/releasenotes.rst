.. _releasenotes:

Release notes
=============

Version 1.4
-----------
Three years X3DOM and still going strong. After almost one year in the making
we are proud to announce a new X3DOM release. This latest and greatest version
of the JavasSript library that marriages HTML with 3D features a great many
fixes and enhancements. For example:

  * NEW - Experimental - geometry nodes that externalize vertex data in binary containers:
      - ImageGeometry (which holds vertex attributes in images),
      - BinaryGeometry (which holds vertex data in binary files,
        where attributes can have - besides standard 32-bit - 8-bit and 16-bit),
      - BitLODGeometry (which also holds vertex attributes in external files,
        though here the containers can consist of variable bit precision for JPEG-like effects)
  * OrthoViewpoint
  * LOD now also in Flash renderer
  * Enhanced picking with a max. of 65,535 objects, while the corresponding mouse event
    also provides picked position and normal
  * NEW Programmatic documentation API
  * Enhanced JavaScript API now with a plenthora of additional methods
  * NEW Support for iOS devices
  * NEW MultiTouch integration now supporting iOS devices and Mozilla
  * New tutorial for image geometry generation
  * Multiline Text support per specification
  * Lots of Flash backend fixes
  * Many more bugfixes in skybox background, added attribute setters,
    viewpointChanged event, etc. Refer to the CHANGELOG file for a complete
    list

You can get the this X3DOM release from:

    `http://x3dom.org/download/1.4/ <http://x3dom.org/download/1.4/>`


Version 1.3
-----------

  * Our participation at the W3C was officially launched
  * We have moved from SF to GitHub
  * We have added some unit tests
  * We have renewed our documentation and added some tutorials
  * We have added component support for X3DOM to hold the core tight and allow (non-)standardized extensions
  * With the release of Flash 11 we are now able to use a non-beta API for the Flash fallback
  * ```<x3d src='foo.x3d' />``` support allows integration of 3D content like
    native images. Note: this will not behave like including images and only work in a client/server
    environment due the fact that we have to use the XMLHttpRequest functionality
  * We have redesigned our multitouch support. It now works on iOS devices and
    multitouch setups with Mozilla. For Android and Firefox there seem to be
    some bugs in the android implementation and this should work only
    after these bugs are closed
  * We worked on the WebGL-backend, reducing the shader complexity to run on
    mobile hardware. The shaders are now chosen using a cabs-like system.
  * Added support for billboards
  * Redesigned our build system
  * We have implemented functionality for reflecting inlined scenes into the
    namespace of parent scenes. With this it is now possible to access
    elements from the parent scene to address elements within the inlined
    scene. Due to the lack of supporting such a concept in the X3D and
    HTML standard we have made use of a custom extension (see field
    nameSpaceName)
  * Inline support in a flash renderer
  * Support for a ```<param>``` tag. This allows to configure
    the framework runtime at a single point
  * Extended triangulation for generating triangles out of concave geometry
  * New components
  * Various fixes & new features

With the new component model we have added the first two optional components:

  * 2D primitive support for the use of elements like rectangles, discs, lines, etc.
  * Initial support for some GEO referencing elements from the X3D specification

Version 1.2
-----------
After many months of work, we’re proud to announce the release today of 
X3DOM 1.2. There’s plenty of cool stuff we have worked on since the last 
release. You can also swing by the downloads page to grab a copy of the 
release package:

http://x3dom.org/x3dom/release/


Major Feature: Flash11/MoleHill Render backend
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
The new version supports an additional render-backend. The system now looks 
for a Flash11 plugin if the browser does not provide a SAI-Plugin or WebGL 
interface. This enables the user to view X3DOM pages, with some restrictions, 
using the Internet Explorer 9 browser. It utilizes the Adobe Flash MoleHill 
3D-API for GPU-Accelerated rendering. To use Adobe Flash-based X3DOM you need 
the latest Adobe Flash Player Incubator build (11.01.3d).

Our ``x3dom.swf`` must either be placed in the same folder as your xhtml/html 
files, or you can specify a path with the swfpath-Parameter of the X3D-Node. 
With the X3D-Nodes backend-Parameter you can set Flash as default backend.

At the moment the Flash-backend is still in an early beta state with most of 
base nodes working. Special features like multiple lights, shadows, 
CommonSurfaceShader, etc. are being worked on

Additional Changes
~~~~~~~~~~~~~~~~~~
  * Internal reorganization of sources. Node type have now their own submodule 
    (src/nodes) and are split into groups.
  * Text node is partially working now. You can use any font available to the 
    browser. This includes WebFonts of CSS3.
  * Added system to pass parameters to runtime. The use attributes with the 
    X3D element will be deprecated in 1.3. Currently supported parameters
  * Partially working MT support with on Firefox beta. Experimental.
  * It is now possible to directly apply CSS styles to the X3D element.
  * Fixed display problem with textures which have dimensions not to the 
    power of two.


Verison 1.1
-----------

Second stable release after almost 7 month.

http://x3dom.org/download/x3dom-v1.1.js

Most features from the 1.1. milestone are implemented:

  * Unified HTML/XHTML encoding
  * HTML5 <canvas>, <img> and <video> as texture element supported
  * CSS 3D Transforms
  * Shader composition framework
  * multiple lights and support for Spot-, Point- and DirectionalLight
  * Fog
  * LOD
  * Support for large meshes
  * Improved normal generation
  * Follower component
  * WebGL compatibility
  * The proposed HTML profile is almost implemented
  * The fallback-model has changed a bit. We partially support X3D-SAI 
    plugins now and removed O3D as technology.

Recently there have been several changes in the WebGL-API (e.g. interface 
changes in texImage2D() method, replacement of old WebGL array types with 
the new TypedArray specification, enforcement of precision modifiers in 
shader code, and changed behavior of NPOT textures). This leads to 
incompatibilities with previous versions, why the 1.0 X3DOM release does 
no longer work together with recent browser versions.


Version 1.0
-----------
First stable release of the framework.

http://x3dom.org/download/x3dom-v1.0.js

All initially planned features are implemented:

  * HTML / XHTML Support
  * Monitoring of DOM element add/remove and attribute change
  * JS-Scenegraph synchronizer
  * ROUTEs
  * DEF/USE support
  * External Subtree (via X3D Inline)
  * Image (Texture), Movie (Texture) and Sound (Emitter) support
  * Navigation: Examine
  * WebGL Render backend
  * The proposed HTML profile is partially implemented.

`Full release note <http://www.x3dom.org/?p=781>`_