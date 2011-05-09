default: bundle

#--- FILES ----
BUNDLE := x3dom.js

SWF := swfobject/swfobject.js
BASIC := lang/Array.js x3dom-internals.js x3dmain.js version.js
DEBUG := debug.js 
GFX := gfx_webgl.js gfx_flash.js
NODE := Mesh.js x3d.js X3DDocument.js MatrixMixer.js Viewarea.js node/Interpolation.js node/Followers.js node/Networking.js
FIELDS := fields.js

SRC := $(SWF) $(BASIC) $(DEBUG) $(GFX) $(NODE) $(FIELDS) 
#---------------

version.js:
	touch version.js

bundle: $(BUNDLE)

clean: 
	rm -f $(BUNDLE) out

cc: closureCompiler

closureCompiler:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --js=swfobject/swfobject.js --js=lang/Array.js  --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js --js=Mesh.js --js=x3d.js --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=nodes/Follower.js --js=nodes/Interpolation.js --js=nodes/Networking.js --js=fields.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE  --js=swfobject/swfobject.js --js=lang/Array.js --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js  --js=Mesh.js --js=x3d.js  --js=X3DDocument.js --js=MatrixMixer.js --js=Viewarea.js --js=nodes/Follower.js --js=nodes/Interpolation.js --js=nodes/Networking.js --js=fields.js

runServer:
	python ../tools/testserver.py &
	open http://localhost:8080/index.html

count:
	wc -l $(SRC)

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	#cp x3dom.js ../example
