@echo off

python ../tools/x3dom_packer.py swfobject/swfobject.js X3DCanvas.js Runtime.js Main.js debug.js gfx_flash gfx_webgl.js X3DDocument.js MatrixMixer.js Viewarea.js fields.js nodes/Core.js nodes/Bindable.js nodes/Rendering.js nodes/Shape.js nodes/Lighting.js nodes/Interpolation.js nodes/Followers.js nodes/Time.js nodes/Networking.js nodes/EnvironmentalEffects.js nodes/Navigation.js nodes/Text.js nodes/Sound.js nodes/Texturing.js nodes/Shaders.js nodes/Geometry3D.js -o x3dom.js

copy x3dom.js ..\example
copy x3dom.css ..\example

rem copy /a x3dmain.js + debug.js + gfx_webgl.js + x3d.js + fields.js x3dom.js /b 
rem pause
