default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC := lang/Array.js x3dom-internals.js x3dmain.js version.js
DEBUG := debug.js 
GFX := gfx_webgl.js gfx_flash.js
NODE := Mesh.js X3DDocument.js MatrixMixer.js Viewarea.js node/Core.js node/Interpolation.js node/Followers.js node/Time.js node/Networking.js node/EnvironmentalEffects.js node/Navigation.js node/Text.js node/Sound.js node/Texturing.js node/Shaders.js node/Geoemtry3D.js
FIELDS := fields.js

SRC := $(BASIC) $(DEBUG) $(GFX) $(NODE) $(FIELDS) 
#---------------

version.js:
	touch version.js

bundle: $(BUNDLE)

clean: 
	rm -f $(BUNDLE) out

cc: closureCompiler

closureCompiler:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --js=lang/Array.js --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js --js=Mesh.js --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=fields.js  --js=nodes/Core.js --js=nodes/Lighting.js --js=nodes/Followers.js --js=nodes/Time.js --js=nodes/Interpolation.js --js=nodes/Networking.js --js=nodes/EnvironmentalEffects.js --js=nodes/Text.js --js=nodes/Sound.js --js=nodes/Texturing.js --js=nodes/Shaders.js --js=nodes/Geoemtry3D.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE --js=lang/Array.js --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js  --js=Mesh.js --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=fields.js  --js=nodes/Core.js  --js=nodes/Lighting.js --js=nodes/Followers.js --js=nodes/Time.js --js=nodes/Interpolation.js --js=nodes/Networking.js --js=nodes/EnvironmentalEffects.js --js=nodes/Text.js  --js=nodes/Sound.js  --js=nodes/Texturing.js --js=nodes/Shaders.js --js=nodes/Geoemtry3D.js

runServer:
	python ../tools/testserver.py &
	open http://localhost:8080/index.html

count:
	wc -l $(SRC)

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	#cp x3dom.js ../example
