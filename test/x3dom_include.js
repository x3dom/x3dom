var includes = '../../src/lang/Array.js\n\
../../src/Internals.js\n\
../../src/debug.js\n\
../../src/util/AdaptiveRenderControl.js\n\
../../src/util/DownloadManager.js\n\
../../src/util/RefinementJobManager.js\n\
../../src/util/RefinementJobWorker.js\n\
../../src/util/Properties.js\n\
../../src/util/DoublyLinkedList.js\n\
../../src/util/EarClipping.js\n\
../../src/util/Utils.js\n\
../../src/util/States.js\n\
../../src/util/StateManager.js\n\
../../src/util/BinaryContainerSetup.js\n\
../../src/util/DrawableCollection.js\n\
../../src/util/BVH.js\n\
../../src/X3DCanvas.js\n\
../../src/Runtime.js\n\
../../src/Main.js\n\
../../src/Cache.js\n\
../../src/Texture.js\n\
../../src/shader/Shader.js\n\
../../src/shader/ShaderParts.js\n\
../../src/shader/ShaderDynamic.js\n\
../../src/shader/ShaderDynamicMobile.js\n\
../../src/shader/ShaderComposed.js\n\
../../src/shader/ShaderNormal.js\n\
../../src/shader/ShaderPicking.js\n\
../../src/shader/ShaderPicking24.js\n\
../../src/shader/ShaderPickingId.js\n\
../../src/shader/ShaderPickingColor.js\n\
../../src/shader/ShaderPickingTexcoord.js\n\
../../src/shader/ShaderFrontgroundTexture.js\n\
../../src/shader/ShaderBackgroundTexture.js\n\
../../src/shader/ShaderBackgroundSkyTexture.js\n\
../../src/shader/ShaderBackgroundCubeTexture.js\n\
../../src/shader/ShaderShadow.js\n\
../../src/shader/ShaderShadowRendering.js\n\
../../src/shader/ShaderBlur.js\n\
../../src/gfx_webgl.js\n\
../../src/gfx_flash.js\n\
../../src/X3DDocument.js\n\
../../src/MatrixMixer.js\n\
../../src/Viewarea.js\n\
../../src/Mesh.js\n\
../../src/fields.js\n\
../../src/nodes/NodeNameSpace.js\n\
../../src/nodes/Core.js\n\
../../src/nodes/Grouping.js\n\
../../src/nodes/Bindable.js\n\
../../src/nodes/Rendering.js\n\
../../src/nodes/Shape.js\n\
../../src/nodes/Lighting.js\n\
../../src/nodes/Followers.js\n\
../../src/nodes/Interpolation.js\n\
../../src/nodes/Time.js\n\
../../src/nodes/Networking.js\n\
../../src/nodes/EnvironmentalEffects.js\n\
../../src/nodes/Navigation.js\n\
../../src/nodes/Text.js\n\
../../src/nodes/Sound.js\n\
../../src/nodes/Texturing.js\n\
../../src/nodes/Shaders.js\n\
../../src/nodes/Geometry3D.js\n\
../../src/nodes/Texturing3D.js'.split("\n");

var headNode = document.getElementsByTagName("head")[0];

var importcss = document.createElement("link");
importcss.type = "text/css";
importcss.href = "../../src/x3dom.css";
//importcss.href = "media/css/tests.css";
importcss.rel="stylesheet";
headNode.appendChild(importcss);


for(var i=0; i<includes.length;i++)
{

    document.write("<script src=\"" + includes[i] + "\"></script>");
}

//this is only for tests
document.write("<script src=\"media/js/tests.js\"></script>");