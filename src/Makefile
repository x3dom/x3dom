default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC :=  src/lang/Array.js\
          src/Internals.js\
          src/debug.js\
          src/ImageLoadManager.js\
          src/lang/Properties.js\
          src/X3DCanvas.js}
          src/Runtime.js rc/Main.js
         
GFX   :=  src/gfx_webgl.js\
          src/gfx_flash.js
         
NODE  :=  src/Mesh.js\
          src/X3DDocument.js\
          src/MatrixMixer.js\
          src/Viewarea.js\
          src/nodes/NodeNameSpace.js\
          src/nodes/Core.js\
          src/nodes/Grouping.js\
          src/nodes/Bindable.js\
          src/nodes/Rendering.js\
          src/nodes/Shape.js\
          src/nodes/Lighting.js\
          src/nodes/Interpolation.js\
          src/nodes/Followers.js\
          src/nodes/Time.js\
          src/nodes/Networking.js\
          src/nodes/EnvironmentalEffects.js\
          src/nodes/Navigation.js\
          src/nodes/Text.js\
          src/nodes/Sound.js\
          src/nodes/Texturing.js\
          src/nodes/Shaders.js\
          src/nodes/Geometry3D.js\
          src/nodes/Geospatial.js
         
FIELDS := src/fields.js

SRC := $(BASIC) $(GFX) $(NODE) $(FIELDS)
#---------------

version.js:
  touch version.js

bundle: $(BUNDLE)

clean: 
  rm -f $(BUNDLE) out

$(BUNDLE): $(SRC)
  python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
  #cp x3dom.js ../example
