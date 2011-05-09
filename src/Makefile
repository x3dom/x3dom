default: bundle

#--- FILES ----
BUNDLE := x3dom.js

SWF := swfobject/swfobject.js
BASIC := lang/Array.js x3dom-internals.js x3dmain.js version.js
DEBUG := debug.js 
GFX := gfx_webgl.js gfx_flash.js
NODE := mesh.js x3d.js x3d_document.js MatrixMixer.js x3d_viewarea.js x3d_follower.js
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
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --js=swfobject/swfobject.js --js=lang/Array.js  --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js --js=mesh.js --js=x3d.js --js=x3d_document.js --js=MatrixMixer.js --js=x3d_viewarea.js --js=nodes/Follower.js --js=fields.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE  --js=swfobject/swfobject.js --js=lang/Array.js --js=x3dom-internals.js --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=gfx_flash.js  --js=mesh.js --js=x3d.js  --js=x3d_document.js --js=MatrixMixer.js --js=x3d_viewarea.js --js=nodes/Follower.js --js=fields.js

runServer:
	python ../tools/testserver.py &
	open http://localhost:8080/index.html

count:
	wc -l $(SRC)

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	#cp x3dom.js ../example
