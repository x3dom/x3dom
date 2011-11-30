
def prefix_path(lst, path):
    return [path + '/' + entry for entry in lst]

# Note: order is important
BASICS = [
  'lang/Array.js',
  'Internals.js',
  'debug.js',
  'ImageLoadManager.js',
  'lang/Properties.js',
  'lang/DoublyLinkedList.js',
  'util/EarClipping.js',
  'X3DCanvas.js',
  'Runtime.js',
  'Main.js'
]

GFX = [
  'gfx_webgl.js',
  'gfx_flash.js'
]

NODES = [
    'X3DDocument.js',
    'MatrixMixer.js',
    'Viewarea.js',
    'Mesh.js',
    'fields.js',
    'nodes/NodeNameSpace.js',
    'nodes/Core.js',
    'nodes/Grouping.js',
    'nodes/Bindable.js',
    'nodes/Rendering.js',
    'nodes/Shape.js',
    'nodes/Lighting.js',
    'nodes/Followers.js',
    'nodes/Interpolation.js',
    'nodes/Time.js',
    'nodes/Networking.js',
    'nodes/EnvironmentalEffects.js',
    'nodes/Navigation.js',
    'nodes/Text.js',
    'nodes/Sound.js',
    'nodes/Texturing.js',
    'nodes/Shaders.js',
    'nodes/Geometry3D.js',
]

COMPONENTS = [
  'nodes/Geospatial.js',
  'nodes/Geometry2D.js',
  'nodes/VolumeRendering.js'
]

CORE_PROFILE = BASICS + GFX + NODES
MORE_PROFILE = COMPONENTS

FULL_PROFILE = CORE_PROFILE + MORE_PROFILE
