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

$(BUNDLE): $(SRC)
	python ../tools/x3dom_packer.py $(SRC) -o $(BUNDLE) 
	
	
