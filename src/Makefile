default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC := x3dmain.js version.js
DEBUG := debug.js 
GFX := gfx_webgl.js
NODE := x3d.js x3d_follower.js
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
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=x3d.js --js=x3d_follower.js --js=fields.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=x3d.js --js=x3d_follower.js --js=fields.js

runServer:
	python testserver.py &
	open http://localhost:8070/index.html

count:
	wc -l $(SRC)
	
cat:
	cat x3dmain.js debug.js fields.js gfx_webgl.js x3d.js > out.js

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	cp x3dom.js ../example
	cp x3dom.js ../A2_VW
