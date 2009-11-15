default: bundle

#--- FILES ----
BUNDLE := x3dom.js

BASIC := x3dmain.js 
DEBUG := debug.js 
GFX := gfx_webgl.js
NODE := x3d.js
FIELDS := fields.js

SRC := $(BASIC) $(DEBUG) $(GFX) $(NODE) $(FIELDS)
#---------------

bundle: $(BUNDLE)

clean: 
	rm -f $(BUNDLE)

runServer:
	python testserver.py &
	open http://localhost:8070/index.xhtml

count:
	wc -l $(SRC)

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	
	
