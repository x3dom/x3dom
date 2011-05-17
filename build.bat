@echo off

@echo "Creating the dist\x3dom.js..."
mkdir dist
python tools\x3dom_packer.py src\lang\Array.js src\Internals.js src\X3DCanvas.js src\Runtime.js src\Main.js src\debug.js src\gfx_flash.js src\gfx_webgl.js src\X3DDocument.js src\MatrixMixer.js src\Viewarea.js src\fields.js src\nodes\NodeNameSpace.js src\nodes\Core.js src\nodes\Bindable.js src\nodes\Rendering.js src\nodes\Shape.js src\nodes\Lighting.js src\nodes\Interpolation.js src\nodes\Followers.js src\nodes\Time.js src\nodes\Networking.js src\nodes\EnvironmentalEffects.js src\nodes\Navigation.js src\nodes\Text.js src\nodes\Sound.js src\nodes\Texturing.js src\nodes\Shaders.js src\nodes\Geometry3D.js -o dist\x3dom.js

@echo "Copy files to example directory"
copy dist\x3dom.js example\
copy src\x3dom.css example\

rem copy /a x3dmain.js + debug.js + gfx_webgl.js + x3d.js + fields.js x3dom.js /b
rem pause