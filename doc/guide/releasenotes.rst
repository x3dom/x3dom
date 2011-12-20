.. _releasenotes:

Release notes
=============

Version 1.3
-----------

* Flash
* 

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