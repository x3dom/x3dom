basics = [
  'lang/Array.js',
  'Internals.js',
  'debug.js',
  'ImageLoadManager.js',
  'lang/Properties.js',
  'X3DCanvas.js',
  'Runtime.js',
  'Main.js'
]

gfx = [
  'gfx_webgl.js',
  'gfx_flash.js'
]

nodes = [
  'Mesh.js',
  'X3DDocument.js',
  'MatrixMixer.js',
  'Viewarea.js',
  'nodes/NodeNameSpace.js',
  'nodes/Core.js',
  'nodes/Grouping.js',
  'nodes/Bindable.js',
  'nodes/Rendering.js',
  'nodes/Shape.js',
  'nodes/Lighting.js',
  'nodes/Interpolation.js',
  'nodes/Followers.js',
  'nodes/Time.js',
  'nodes/Networking.js',
  'nodes/EnvironmentalEffects.js',
  'nodes/Navigation.js',
  'nodes/Text.js',
  'nodes/Sound.js',
  'nodes/Texturing.js',
  'nodes/Shaders.js',
  'nodes/Geometry3D.js',
  'nodes/Geospatial.js'
]

fields = [
  'fields.js'
]

components = [
  'nodes/Geometry2D.js',
  'nodes/VolumeRendering.js'
]

html_profile = basics + gfx + nodes + fields
ext_profile = components

full_profile = html_profile + ext_profile