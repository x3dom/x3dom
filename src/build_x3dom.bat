@echo off

python ../tools/x3dom_packer.py swfobject/swfobject.js x3dmain.js debug.js gfx_flash gfx_webgl.js x3d.js x3d_follower.js fields.js -o x3dom.js

copy x3dom.js ..\example
copy x3dom.css ..\example

rem copy /a x3dmain.js + debug.js + gfx_webgl.js + x3d.js + fields.js x3dom.js /b 
rem pause
