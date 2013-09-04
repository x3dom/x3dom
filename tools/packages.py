
def prefix_path(lst, path):
    return [path + '/' + entry for entry in lst]

# Note: order is important
BASICS = [
  'lang/Array.js',
  'Internals.js',
  'debug.js',
  'util/AdaptiveRenderControl.js',
  'util/DownloadManager.js',
  'util/RefinementJobManager.js',
  'util/RefinementJobWorker.js',
  'util/Properties.js',
  'util/DoublyLinkedList.js',
  'util/EarClipping.js',
  'util/Utils.js',
  'util/States.js',
  'util/StateManager.js',
  'util/BinaryContainerSetup.js',
  'util/DrawableCollection.js',
  'util/BVH.js',
  'X3DCanvas.js',
  'Runtime.js',
  'Main.js',
  'Cache.js',
  'Texture.js'
]

SHADER = [
	'shader/Shader.js',
	'shader/ShaderParts.js',
	'shader/ShaderDynamic.js',
	'shader/ShaderDynamicMobile.js',
	'shader/ShaderComposed.js',
	'shader/ShaderNormal.js',
	'shader/ShaderPicking.js',
	'shader/ShaderPicking24.js',
	'shader/ShaderPickingId.js',
	'shader/ShaderPickingColor.js',
	'shader/ShaderPickingTexcoord.js',
	'shader/ShaderFrontgroundTexture.js',
	'shader/ShaderBackgroundTexture.js',
	'shader/ShaderBackgroundSkyTexture.js',
	'shader/ShaderBackgroundCubeTexture.js',
	'shader/ShaderShadow.js',
	'shader/ShaderShadowRendering.js',
	'shader/ShaderBlur.js'
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
    'nodes/Texturing3D.js'
]

COMPONENTS = [
  'nodes/Geospatial.js',
  'nodes/Geometry2D.js',
  'nodes/VolumeRendering.js',
  'nodes/CADGeometry.js',
  'nodes/BVHRefiner.js',
  'nodes/Geometry3DExt.js',
  'util/Moveable.js',          # SpaceSensor-like helper
  'Docs.js'                    # interactive documentation
]

CORE_PROFILE = BASICS + SHADER + GFX + NODES
MORE_PROFILE = COMPONENTS

FULL_PROFILE = CORE_PROFILE + MORE_PROFILE
