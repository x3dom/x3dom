default: bundle

BUNDLE := x3dom.js

bundle: $(BUNDLE)

clean: 
	rm -f $(BUNDLE)

BASIC := x3dmain.js 
DEBUG := debug.js 
GFX := gfx_webgl.js
NODE := x3d.js
FIELDS := fields.js

WS := WS

$(BUNDLE): 	
	python ../tools/x3dom_packer.py $(BASIC) $(DEBUG) $(GFX) $(NODE) $(FIELDS) -o $(BUNDLE) 
	
	
