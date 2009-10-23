
default: bundle

bundle: x3domBundle.js

BASIC := debug.js fields.js
RUNTIME := x3dom.js
NODE := x3d.js
GFX := gfx_webgl.js

x3domBundle.js: 
	cat > x3domBundle.js $(BASIC) $(RUNTIME) $(NODE) $(GFX) 
	
