@echo off

python ../tools/x3dom_packer.py swfobject/swfobject.js x3dmain.js debug.js gfx_flash gfx_webgl.js x3d.js X3DDocument.js MatrixMixer.js Viewarea.js nodes/Followers.js fields.js -o x3dom.js

copy x3dom.js ..\example
copy x3dom.css ..\example

rem copy /a x3dmain.js + debug.js + gfx_webgl.js + x3d.js + fields.js x3dom.js /b 
rem pause
