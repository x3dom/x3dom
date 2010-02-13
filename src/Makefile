default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC := x3dmain.js 
DEBUG := debug.js 
GFX := gfx_webgl.js
NODE := x3d.js
FIELDS := fields.js
#VERSION := version.js

SRC := $(BASIC) $(DEBUG) $(GFX) $(NODE) $(FIELDS) 
#---------------

bundle: $(BUNDLE)

clean: 
	rm -f $(BUNDLE) out

closureCompiler:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=x3d.js --js=fields.js
	
ccVerbose:  
	java -jar ../tools/compiler.jar --js_output_file=x3dom.js --summary_detail_level=3 --warning_level=VERBOSE --js=x3dmain.js --js=debug.js --js=gfx_webgl.js --js=x3d.js --js=fields.js >& out

runServer:
	python testserver.py &
	open http://localhost:8070/index.xhtml

count:
	wc -l $(SRC)

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	
	
