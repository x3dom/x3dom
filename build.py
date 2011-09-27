from optparse import OptionParser

from tools import x3dom_packer

files = [
  'src/lang/Array.js',
  'src/Internals.js',
  'src/debug.js',
  'src/ImageLoadManager.js',
  'src/lang/Properties.js',
  'src/X3DCanvas.js',
  'src/Runtime.js',
  'src/Main.js',
  'src/version.js',
  'src/gfx_webgl.js',
  'src/gfx_flash.js',
  'src/Mesh.js',
  'src/X3DDocument.js',
  'src/MatrixMixer.js',
  'src/Viewarea.js',
  'src/fields.js',
  'src/nodes/NodeNameSpace.js',
  'src/nodes/Core.js',
  'src/nodes/Grouping.js',
  'src/nodes/Bindable.js',
  'src/nodes/Rendering.js',
  'src/nodes/Shape.js',
  'src/nodes/Lighting.js',
  'src/nodes/Interpolation.js',
  'src/nodes/Followers.js',
  'src/nodes/Time.js',
  'src/nodes/Networking.js',
  'src/nodes/EnvironmentalEffects.js',
  'src/nodes/Navigation.js',
  'src/nodes/Text.js',
  'src/nodes/Sound.js',
  'src/nodes/Texturing.js',
  'src/nodes/Shaders.js',
  'src/nodes/Geometry3D.js',
  'src/nodes/Geospatial.js'
]

components = [
  'src/nodes/Geometry2D.js',
  'src/nodes/VolumeRendering.js',
]

parser = OptionParser

if __name__ == '__main__':
    parser = OptionParser()
    
    parser.add_option("-a", "--algo",       type="string",  dest="algo",      default="jsmin",            help='The algorithm to use. "jsmin" or "jspacker".')
    parser.add_option("-o", "--outfile",    type="string",  dest="outfile",   default="dist/x3dom.js",    help='The name of the output file.')

    (options, args) = parser.parse_args()

    # Not very efficient but well..
    options.outfile = 'dist/x3dom.js'
    options.algo = None
    x3dom_packer.build(parser, options, files + components)

    options.outfile = 'dist/x3dom.min.js'
    options.algo = 'jsmin'
    x3dom_packer.build(parser, options, files + components)

    options.outfile = 'dist/x3dom-core.js'
    options.algo = None
    x3dom_packer.build(parser, options, files)

    options.outfile = 'dist/x3dom-core.min.js'
    options.algo = 'jsmin'
    x3dom_packer.build(parser, options, files)
