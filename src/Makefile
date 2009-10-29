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
	#cat $(BASIC) $(WS) $(DEBUG) $(WS) $(GFX) $(WS) $(NODE) $(WS) $(FIELDS) | gzip > $(BUNDLE)
	cat > $(BUNDLE) $(BASIC) $(WS) $(DEBUG) $(WS) $(GFX) $(WS) $(NODE) $(WS) $(FIELDS)
	
