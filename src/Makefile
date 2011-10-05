default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC := lang/Array.js Internals.js debug.js ImageLoadManager.js lang/Properties.js X3DCanvas.js Runtime.js Main.js version.js
GFX := gfx_webgl.js gfx_flash.js
NODE := Mesh.js X3DDocument.js MatrixMixer.js Viewarea.js nodes/NodeNameSpace.js nodes/Core.js nodes/Grouping.js nodes/Bindable.js nodes/Rendering.js nodes/Shape.js nodes/Lighting.js nodes/Interpolation.js nodes/Followers.js nodes/Time.js nodes/Networking.js nodes/EnvironmentalEffects.js nodes/Navigation.js nodes/Text.js nodes/Sound.js nodes/Texturing.js nodes/Shaders.js nodes/Geometry3D.js nodes/Geospatial.js
FIELDS := fields.js

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
