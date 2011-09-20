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

cc: closureCompiler

closureCompiler:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3                         --js=lang/Array.js --js=Internals.js --js=lang/Properties.js --js=X3DCanvas.js --js=Runtime.js --js=Main.js --js=debug.js --js=ImageLoadManager.js --js=gfx_webgl.js --js=gfx_flash.js --js=Mesh.js --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=fields.js  --js=nodes/NodeNameSpace.js --js=nodes/Core.js --js=nodes/Grouping.js --js=nodes/Bindable.js --js=nodes/Rendering.js --js=nodes/Shape.js --js=nodes/Lighting.js --js=nodes/Followers.js --js=nodes/Interpolation.js --js=nodes/Time.js --js=nodes/Networking.js --js=nodes/EnvironmentalEffects.js --js=nodes/Navigation.js --js=nodes/Text.js --js=nodes/Sound.js --js=nodes/Texturing.js --js=nodes/Shaders.js --js=nodes/Geometry3D.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE --js=lang/Array.js --js=Internals.js --js=debug.js --js=ImageLoadManager.js --js=lang/Properties.js --js=X3DCanvas.js --js=Runtime.js --js=Main.js  --js=gfx_webgl.js --js=gfx_flash.js --js=Mesh.js --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=fields.js  --js=nodes/NodeNameSpace.js --js=nodes/Core.js --js=nodes/Grouping.js --js=nodes/Bindable.js  --js=nodes/Rendering.js --js=nodes/Shape.js --js=nodes/Lighting.js --js=nodes/Followers.js --js=nodes/Interpolation.js --js=nodes/Time.js --js=nodes/Networking.js --js=nodes/EnvironmentalEffects.js --js=nodes/Navigation.js --js=nodes/Text.js --js=nodes/Sound.js --js=nodes/Texturing.js --js=nodes/Shaders.js --js=nodes/Geometry3D.js

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	#cp x3dom.js ../example
