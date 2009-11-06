
if(!Array.forEach){Array.forEach=function(array,fun,thisp){var len=array.length;for(var i=0;i<len;i++){if(i in array){fun.call(thisp,array[i],i,array);}}};}
if(!Array.map){Array.map=function(array,fun,thisp){var len=array.length;var res=[];for(var i=0;i<len;i++){if(i in array){res[i]=fun.call(thisp,array[i],i,array);}}
return res;};}
if(!Array.filter){Array.filter=function(array,fun,thisp){var len=array.length;var res=[];for(var i=0;i<len;i++){if(i in array){var val=array[i];if(fun.call(thisp,val,i,array)){res.push(val);}}}
return res;};}
var x3dom={canvases:[]};x3dom.x3dNS='http://www.web3d.org/specifications/x3d-namespace';x3dom.x3dextNS='http://philip.html5.org/x3d/ext';x3dom.xsltNS='http://www.w3.org/1999/XSL/x3dom.Transform';x3dom.xhtmlNS='http://www.w3.org/1999/xhtml';x3dom.X3DCanvas=function(x3dElem){this.initContext=function(canvas){x3dom.debug.logInfo("Initializing X3DCanvas for ["+canvas.id+"]");var gl=x3dom.gfx_webgl(canvas);if(!gl){x3dom.debug.logError("No 3D context found...");this.canvasDiv.removeChild(canvas);return null;}
return gl;};this.createHTMLCanvas=function(x3dElem){x3dom.debug.logInfo("Creating canvas for X3D element...");var canvas=document.createElementNS(x3dom.xhtmlNS,'canvas');canvas.setAttribute("class","x3dom-canvas");this.canvasDiv.appendChild(canvas);x3dElem.parentNode.insertBefore(this.canvasDiv,x3dElem);var x,y,w,h,showStat;if((x=x3dElem.getAttribute("x"))!==null){canvas.style.left=x.toString();}
if((y=x3dElem.getAttribute("y"))!==null){canvas.style.top=y.toString();}
if((w=x3dElem.getAttribute("width"))!==null){canvas.style.width=this.canvasDiv.style.width=w.toString();canvas.setAttribute("width",canvas.style.width);}
if((h=x3dElem.getAttribute("height"))!==null){canvas.style.height=this.canvasDiv.style.height=h.toString();canvas.setAttribute("height",canvas.style.height);}
var id;if((id=x3dElem.getAttribute("id"))!==null){this.canvasDiv.setAttribute("class","x3dom-canvasdiv");this.canvasDiv.id="x3dom-"+id+"-canvasdiv";canvas.id="x3dom-"+id+"-canvas";}
else{var index=(document.getElementsByTagNameNS(x3dom.x3dNS,'X3D').length+1);this.canvasDiv.id="x3dom-"+index+"-canvasdiv";canvas.id="x3dom-"+index+"-canvas";}
return canvas;};this.createStatDiv=function(){var statDiv=document.createElementNS('http://www.w3.org/1999/xhtml','div');statDiv.setAttribute("class","x3dom-statdiv");statDiv.innerHTML="0 fps";this.canvasDiv.appendChild(statDiv);statDiv.oncontextmenu=statDiv.onmousedown=function(evt){evt.preventDefault();evt.stopPropagation();evt.returnValue=false;return false;};return statDiv;};this.x3dElem=x3dElem;this.canvasDiv=document.createElementNS('http://www.w3.org/1999/xhtml','div');this.canvas=this.createHTMLCanvas(x3dElem);this.canvas.parent=this;this.fps_t0=new Date().getTime();this.gl=this.initContext(this.canvas);this.doc=null;this.showStat=x3dElem.getAttribute("showStat");this.statDiv=(this.showStat!==null&&this.showStat=="true")?this.createStatDiv():null;if(this.canvas!==null&&this.gl!==null)
{this.canvas.mouse_dragging=false;this.canvas.mouse_button=0;this.canvas.mouse_drag_x=0;this.canvas.mouse_drag_y=0;this.canvas.oncontextmenu=function(evt){evt.preventDefault();evt.stopPropagation();evt.returnValue=false;return false;};this.canvas.addEventListener('mousedown',function(evt){switch(evt.button){case 0:this.mouse_button=1;break;case 1:this.mouse_button=4;break;case 2:this.mouse_button=2;break;default:this.mouse_button=0;break;}
this.mouse_drag_x=evt.layerX;this.mouse_drag_y=evt.layerY;this.mouse_dragging=true;if(evt.shiftKey){this.mouse_button=1;}
if(evt.ctrlKey){this.mouse_button=4;}
if(evt.altKey){this.mouse_button=2;}
this.parent.doc.onMousePress(this.mouse_drag_x,this.mouse_drag_y,this.mouse_button);window.status=this.id+' DOWN: '+evt.layerX+", "+evt.layerY;evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);this.canvas.addEventListener('mouseup',function(evt){this.mouse_button=0;this.mouse_dragging=false;this.parent.doc.onMouseRelease(this.mouse_drag_x,this.mouse_drag_y,this.mouse_button);evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);this.canvas.addEventListener('mouseout',function(evt){this.mouse_button=0;this.mouse_dragging=false;this.parent.doc.onMouseRelease(this.mouse_drag_x,this.mouse_drag_y,this.mouse_button);evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);this.canvas.addEventListener('dblclick',function(evt){this.mouse_button=0;this.mouse_drag_x=evt.layerX;this.mouse_drag_y=evt.layerY;this.mouse_dragging=false;this.parent.doc.onDoubleClick(this.mouse_drag_x,this.mouse_drag_y);window.status=this.id+' DBL: '+evt.layerX+", "+evt.layerY;evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);this.canvas.addEventListener('mousemove',function(evt){window.status=this.id+' MOVE: '+evt.layerX+", "+evt.layerY;if(!this.mouse_dragging){return;}
var dx=evt.layerX-this.mouse_drag_x;var dy=evt.layerY-this.mouse_drag_y;this.mouse_drag_x=evt.layerX;this.mouse_drag_y=evt.layerY;if(evt.shiftKey){this.mouse_button=1;}
if(evt.ctrlKey){this.mouse_button=4;}
if(evt.altKey){this.mouse_button=2;}
this.parent.doc.ondrag(this.mouse_drag_x,this.mouse_drag_y,this.mouse_button);evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);this.canvas.addEventListener('DOMMouseScroll',function(evt){this.mouse_drag_y+=2*evt.detail;this.parent.doc.ondrag(this.mouse_drag_x,this.mouse_drag_y,2);window.status=this.id+' SCROLL: '+evt.detail;evt.preventDefault();evt.stopPropagation();evt.returnValue=false;},false);}};x3dom.X3DCanvas.prototype.tick=function()
{var d=new Date().getTime();var fps=1000.0/(d-this.fps_t0);if(this.statDiv){this.statDiv.textContent=fps.toFixed(2)+' fps';}
this.fps_t0=d;try{this.doc.advanceTime(d/1000);this.doc.render(this.gl);}
catch(e){x3dom.debug.logException(e);throw e;}};x3dom.X3DCanvas.prototype.load=function(uri,sceneElemPos){this.doc=new x3dom.X3DDocument(this.canvas,this.gl);var x3dCanvas=this;var doc=this.doc;var gl=this.gl;x3dom.debug.logInfo("gl="+gl.toString()+", this.gl="+this.gl+", pos="+sceneElemPos);this.doc.onload=function(){x3dom.debug.logInfo("loaded ["+uri+"]");setInterval(function(){x3dCanvas.tick();},16);};this.doc.onerror=function(){alert('Failed to load X3D document');};this.doc.load(uri,sceneElemPos);};(function(){var onload=function(){var x3ds=document.getElementsByTagNameNS('http://www.web3d.org/specifications/x3d-namespace','X3D');x3ds=Array.map(x3ds,function(n){return n;});var i=0;var activateLog=false;for(i=0;i<x3ds.length;i++){var showLog=x3ds[i].getAttribute("showLog");if(showLog!==null&&showLog=="true")
{activateLog=true;break;}}
if(activateLog){x3dom.debug.activate();}
x3dom.debug.logInfo("Found "+x3ds.length+" X3D nodes...");for(i=0;i<x3ds.length;i++){var x3dcanvas=new x3dom.X3DCanvas(x3ds[i]);if(x3dcanvas.gl===null)
{var altDiv=document.createElement("div");altDiv.setAttribute("class","x3dom-nox3d");var altP=document.createElement("p");altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));var aLnk=document.createElement("a");aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));altDiv.appendChild(altP);altDiv.appendChild(aLnk);x3dcanvas.canvasDiv.appendChild(altDiv);if(x3dcanvas.statDiv){x3dcanvas.canvasDiv.removeChild(x3dcanvas.statDiv);}
var altImg=x3ds[i].getAttribute("altImg")||null;if(altImg){var altImgObj=new Image();altImgObj.src=altImg;x3dcanvas.canvasDiv.style.backgroundImage="url("+altImg+")";}
else{}
continue;}
x3dcanvas.load(x3ds[i],i);x3dom.canvases.push(x3dcanvas);}};var onunload=function(){for(var i=0;i<x3dom.canvases.length;i++){x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);}};window.addEventListener('load',onload,false);window.addEventListener('unload',onunload,false);window.addEventListener('reload',onunload,false);document.onkeypress=function(evt){for(var i=0;i<x3dom.canvases.length;i++){x3dom.canvases[i].doc.onKeyPress(evt.charCode);}
return true;};})();x3dom.debug={INFO:"INFO",WARNING:"WARNING",ERROR:"ERROR",EXCEPTION:"EXCEPTION",isActive:false,isFirebugAvailable:false,isSetup:false,numLinesLogged:0,maxLinesToLog:400,logContainer:null,setup:function(){if(x3dom.debug.isSetup){return;}
try{if(console){x3dom.debug.isFirebugAvailable=true;}}
catch(err){x3dom.debug.isFirebugAvailable=false;}
x3dom.debug.setupLogContainer();x3dom.debug.isSetup=true;},activate:function(){x3dom.debug.isActive=true;document.body.appendChild(x3dom.debug.logContainer);},setupLogContainer:function(){x3dom.debug.logContainer=document.createElement("div");x3dom.debug.logContainer.id="x3dom_logdiv";x3dom.debug.logContainer.style.border="2px solid olivedrab";x3dom.debug.logContainer.style.height="180px";x3dom.debug.logContainer.style.padding="2px";x3dom.debug.logContainer.style.overflow="auto";x3dom.debug.logContainer.style.whiteSpace="pre-wrap";x3dom.debug.logContainer.style.fontFamily="sans-serif";x3dom.debug.logContainer.style.fontSize="x-small";x3dom.debug.logContainer.style.color="#00ff00";x3dom.debug.logContainer.style.backgroundColor="black";},doLog:function(msg,logType){if(!x3dom.debug.isActive){return;}
if(x3dom.debug.numLinesLogged===x3dom.debug.maxLinesToLog){msg="Maximum number of log lines (="+x3dom.debug.maxLinesToLog+") reached. Deactivating logging...";}
if(x3dom.debug.numLinesLogged>x3dom.debug.maxLinesToLog){return;}
var node=document.createElement("p");node.style.margin=0;node.innerHTML=logType+": "+msg;x3dom.debug.logContainer.insertBefore(node,x3dom.debug.logContainer.firstChild);if(x3dom.debug.isFirebugAvailable){switch(logType){case x3dom.debug.INFO:console.info(msg);break;case x3dom.debug.WARNING:console.warn(msg);break;case x3dom.debug.ERROR:console.error(msg);break;case x3dom.debug.EXCEPTION:console.debug(msg);break;default:break;}}
x3dom.debug.numLinesLogged++;},logInfo:function(msg){x3dom.debug.doLog(msg,x3dom.debug.INFO);},logWarning:function(msg){x3dom.debug.doLog(msg,x3dom.debug.WARNING);},logError:function(msg){x3dom.debug.doLog(msg,x3dom.debug.ERROR);},logException:function(msg){x3dom.debug.doLog(msg,x3dom.debug.EXCEPTION);},assert:function(c,msg){if(!c){x3dom.debug.doLog("Assertion failed in "+x3dom.debug.assert.caller.name+': '+msg,x3dom.debug.WARNING);}}};x3dom.debug.setup();x3dom.gfx_webgl=(function(){function Context(ctx3d,canvas,name){this.ctx3d=ctx3d;this.canvas=canvas;this.name=name;}
Context.prototype.getName=function(){return this.name;}
function setupContext(canvas){x3dom.debug.logInfo("setupContext: canvas="+canvas);try{var ctx=canvas.getContext('moz-webgl');if(ctx)
return new Context(ctx,canvas,'moz-webgl');}catch(e){}
try{var ctx=canvas.getContext('webkit-3d');if(ctx)
return new Context(ctx,canvas,'webkit-3d');}catch(e){}}
var g_shaders={};g_shaders['vs-x3d-textured']={type:"vertex",data:"attribute vec3 position;"+"attribute vec3 normal;"+"attribute vec2 texcoord;"+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"varying vec2 fragTexCoord;"+"uniform mat4 modelViewProjectionMatrix;"+"uniform mat4 modelViewMatrix;"+"uniform mat4 viewMatrixInverse;"+"uniform vec3 lightDirection;"+"uniform vec3 eyePosition;"+""+"void main(void) {"+"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);"+"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;"+"    fragLightVector = -lightDirection;"+"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;"+"    fragTexCoord = texcoord;"+"}"};g_shaders['vs-x3d-textured-tt']={type:"vertex",data:"attribute vec3 position;"+"attribute vec3 normal;"+"attribute vec2 texcoord;"+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"varying vec2 fragTexCoord;"+"uniform mat4 texTrafoMatrix;"+"uniform mat4 modelViewProjectionMatrix;"+"uniform mat4 modelViewMatrix;"+"uniform mat4 viewMatrixInverse;"+"uniform vec3 lightDirection;"+"uniform vec3 eyePosition;"+""+"void main(void) {"+"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);"+"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;"+"    fragLightVector = -lightDirection;"+"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;"+"    fragTexCoord = (texTrafoMatrix * vec4(texcoord, 1.0, 1.0)).xy;"+"}"};g_shaders['fs-x3d-textured']={type:"fragment",data:"uniform float ambientIntensity;"+"uniform vec3 diffuseColor;"+"uniform vec3 emissiveColor;"+"uniform float shininess;"+"uniform vec3 specularColor;"+"uniform float alpha;"+"uniform float lightOn;"+"uniform sampler2D tex;"+""+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"varying vec2 fragTexCoord;"+""+"void main(void) {"+"    vec3 normal = normalize(fragNormal);"+"    vec3 light = normalize(fragLightVector);"+"    vec3 eye = normalize(fragEyeVector);"+"    vec2 texCoord = vec2(fragTexCoord.x,1.0-fragTexCoord.y);"+"    float diffuse = max(0.0, dot(normal, light)) * lightOn;"+"    diffuse += max(0.0, dot(normal, eye));"+"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;"+"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);"+"    vec3 rgb = emissiveColor + diffuse*texture2D(tex, texCoord).rgb + specular*specularColor;"+"    rgb = clamp(rgb, 0.0, 1.0);"+"    gl_FragColor = vec4(rgb, texture2D(tex, texCoord).a);"+"}"};g_shaders['vs-x3d-untextured']={type:"vertex",data:"attribute vec3 position;"+"attribute vec3 normal;"+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"uniform mat4 modelViewProjectionMatrix;"+"uniform mat4 modelViewMatrix;"+"uniform mat4 viewMatrixInverse;"+"uniform vec3 lightDirection;"+"uniform vec3 eyePosition;"+""+"void main(void) {"+"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);"+"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;"+"    fragLightVector = -lightDirection;"+"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;"+"}"};g_shaders['fs-x3d-untextured']={type:"fragment",data:"uniform float ambientIntensity;"+"uniform vec3 diffuseColor;"+"uniform vec3 emissiveColor;"+"uniform float shininess;"+"uniform vec3 specularColor;"+"uniform float alpha;"+"uniform float lightOn;"+""+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+""+"void main(void) {"+"    vec3 normal = normalize(fragNormal);"+"    vec3 light = normalize(fragLightVector);"+"    vec3 eye = normalize(fragEyeVector);"+"    float diffuse = max(0.0, dot(normal, light)) * lightOn;"+"    diffuse += max(0.0, dot(normal, eye));"+"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;"+"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);"+"    vec3 rgb = emissiveColor + diffuse*diffuseColor + specular*specularColor;"+"    rgb = clamp(rgb, 0.0, 1.0);"+"    gl_FragColor = vec4(rgb, alpha);"+"}"};g_shaders['vs-x3d-vertexcolor']={type:"vertex",data:"attribute vec3 position;"+"attribute vec3 normal;"+"attribute vec3 color;"+"varying vec3 fragNormal;"+"varying vec3 fragColor;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"uniform mat4 modelViewProjectionMatrix;"+"uniform mat4 modelViewMatrix;"+"uniform mat4 viewMatrixInverse;"+"uniform vec3 lightDirection;"+"uniform vec3 eyePosition;"+""+"void main(void) {"+"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);"+"    fragNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;"+"    fragLightVector = -lightDirection;"+"    fragColor = color;"+"    fragEyeVector = eyePosition - (modelViewMatrix * vec4(position, 1.0)).xyz;"+"}"};g_shaders['fs-x3d-vertexcolor']={type:"fragment",data:"uniform float ambientIntensity;"+"uniform vec3 diffuseColor;"+"uniform vec3 emissiveColor;"+"uniform float shininess;"+"uniform vec3 specularColor;"+"uniform float alpha;"+"uniform float lightOn;"+""+"varying vec3 fragNormal;"+"varying vec3 fragColor;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+""+"void main(void) {"+"    vec3 normal = normalize(fragNormal);"+"    vec3 light = normalize(fragLightVector);"+"    vec3 eye = normalize(fragEyeVector);"+"    float diffuse = max(0.0, dot(normal, light)) * lightOn;"+"    diffuse += max(0.0, dot(normal, eye));"+"    float specular = pow(max(0.0, dot(normal, normalize(light+eye))), shininess*128.0) * lightOn;"+"    specular += pow(max(0.0, dot(normal, normalize(eye))), shininess*128.0);"+"    vec3 rgb = emissiveColor + diffuse*fragColor + specular*specularColor;"+"    rgb = clamp(rgb, 0.0, 1.0);"+"    gl_FragColor = vec4(rgb, alpha);"+"}"};g_shaders['fs-x3d-shownormal']={type:"fragment",data:"uniform float ambientIntensity;"+"uniform vec3 diffuseColor;"+"uniform vec3 emissiveColor;"+"uniform float shininess;"+"uniform vec3 specularColor;"+"uniform float alpha;"+"uniform float lightOn;"+""+"varying vec3 fragNormal;"+"varying vec3 fragLightVector;"+"varying vec3 fragEyeVector;"+"varying vec2 fragTexCoord;"+""+"void main(void) {"+"    vec3 normal = normalize(fragNormal);"+"    gl_FragColor = vec4((normal+1.0)/2.0, 1.0);"+"}"};g_shaders['vs-x3d-default']={type:"vertex",data:"attribute vec3 position;"+"uniform mat4 modelViewProjectionMatrix;"+"void main(void) {"+"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);"+"}"};g_shaders['fs-x3d-default']={type:"fragment",data:"uniform vec3 diffuseColor;"+"uniform float alpha;"+"uniform float lightOn;"+"void main(void) {"+"    gl_FragColor = vec4(diffuseColor, alpha);"+"}"};function getDefaultShaderProgram(gl)
{var prog=gl.createProgram();var vs=gl.createShader(gl.VERTEX_SHADER);var fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(vs,g_shaders['vs-x3d-default'].data);gl.shaderSource(fs,g_shaders['fs-x3d-default'].data);gl.compileShader(vs);gl.compileShader(fs);gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);var msg=gl.getProgramInfoLog(prog);if(msg)
x3dom.debug.logError(msg);return wrapShaderProgram(gl,prog);}
function getShaderProgram(gl,ids)
{var shader=[];for(var id=0;id<2;id++)
{if(!g_shaders[ids[id]])
{x3dom.debug.logError('Cannot find shader '+ids[id]);return;}
if(g_shaders[ids[id]].type=='vertex')
shader[id]=gl.createShader(gl.VERTEX_SHADER);else if(g_shaders[ids[id]].type=='fragment')
shader[id]=gl.createShader(gl.FRAGMENT_SHADER);else
{x3dom.debug.logError('Invalid shader type '+g_shaders[id].type);return;}
gl.shaderSource(shader[id],g_shaders[ids[id]].data);gl.compileShader(shader[id]);}
var prog=gl.createProgram();gl.attachShader(prog,shader[0]);gl.attachShader(prog,shader[1]);gl.linkProgram(prog);var msg=gl.getProgramInfoLog(prog);if(msg)
x3dom.debug.logError(msg);return wrapShaderProgram(gl,prog);}
function wrapShaderProgram(gl,sp)
{var shader={};shader.bind=function(){gl.useProgram(sp)};var i,ok=true;for(i=0;ok;++i){try{var obj=gl.getActiveUniform(sp,i);}
catch(e){}
if(gl.getError()!=0){break;}
var loc=gl.getUniformLocation(sp,obj.name);switch(obj.type){case gl.SAMPLER_2D:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform1i(loc,val)}})(loc));break;case gl.SAMPLER_CUBE:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform1i(loc,val)}})(loc));break;case gl.BOOL:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform1i(loc,val)}})(loc));break;case gl.FLOAT:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform1f(loc,val)}})(loc));break;case gl.FLOAT_VEC2:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform2f(loc,val[0],val[1])}})(loc));break;case gl.FLOAT_VEC3:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform3f(loc,val[0],val[1],val[2])}})(loc));break;case gl.FLOAT_VEC4:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniform4f(loc,val[0],val[1],val[2],val[3])}})(loc));break;case gl.FLOAT_MAT2:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniformMatrix2fv(loc,false,new CanvasFloatArray(val))}})(loc));break;case gl.FLOAT_MAT3:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniformMatrix3fv(loc,false,new CanvasFloatArray(val))}})(loc));break;case gl.FLOAT_MAT4:shader.__defineSetter__(obj.name,(function(loc){return function(val){gl.uniformMatrix4fv(loc,false,new CanvasFloatArray(val))}})(loc));break;default:x3dom.debug.logInfo('GLSL program variable '+obj.name+' has unknown type '+obj.type);}}
for(var i=0;ok;++i){try{var obj=gl.getActiveAttrib(sp,i);}
catch(e){}
if(gl.getError()!=0){break;}
var loc=gl.getAttribLocation(sp,obj.name);shader[obj.name]=loc;}
return shader;}
Context.prototype.setupShape=function(gl,shape)
{if(x3dom.isa(shape._geometry,x3dom.nodeTypes.Text)){var text_canvas=document.createElementNS('http://www.w3.org/1999/xhtml','canvas');var text_ctx=text_canvas.getContext('2d');var fontStyle=shape._geometry._fontStyle;var font_family='SANS';text_ctx.mozTextStyle='48px '+font_family;var text_w=0;var string=shape._geometry._string;for(var i=0;i<string.length;++i)
text_w=Math.max(text_w,text_ctx.mozMeasureText(string[i]));var line_h=1.2*text_ctx.mozMeasureText('M');var text_h=line_h*shape._geometry._string.length;text_canvas.width=Math.pow(2,Math.ceil(Math.log(text_w)/Math.log(2)));text_canvas.height=Math.pow(2,Math.ceil(Math.log(text_h)/Math.log(2)));text_ctx.fillStyle='#000';text_ctx.translate(0,line_h);for(var i=0;i<string.length;++i){text_ctx.mozDrawText(string[i]);text_ctx.translate(0,line_h);}
document.body.appendChild(text_canvas);var ids=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,ids);gl.texImage2D(gl.TEXTURE_2D,0,text_canvas);var w=text_w/text_h;var h=1;var u=text_w/text_canvas.width;var v=text_h/text_canvas.height;shape._webgl={positions:[-w,-h,0,w,-h,0,w,h,0,-w,h,0],normals:[0,0,1,0,0,1,0,0,1,0,0,1],indexes:[0,1,2,2,3,0],texcoords:[0,v,u,v,u,0,0,0],mask_texture:ids,};shape._webgl.shader=getShaderProgram(gl,['vs-x3d-textured','fs-x3d-textured']);}
else
{if(shape._webgl!==undefined)
return;var tex=shape._appearance._texture;if(tex)
{var texture=gl.createTexture();var image=new Image();image.src=tex._url;image.onload=function()
{shape._webgl.texture=texture;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);}}
shape._webgl={positions:shape._geometry._mesh._positions,normals:shape._geometry._mesh._normals,texcoords:shape._geometry._mesh._texCoords,colors:shape._geometry._mesh._colors,indexes:shape._geometry._mesh._indices,buffers:[{},{},{},{},{}],};if(tex){if(shape._appearance._textureTransform==null)
shape._webgl.shader=getShaderProgram(gl,['vs-x3d-textured','fs-x3d-textured']);else
shape._webgl.shader=getShaderProgram(gl,['vs-x3d-textured-tt','fs-x3d-textured']);}
else if(shape._geometry._mesh._colors.length>0){shape._webgl.shader=getShaderProgram(gl,['vs-x3d-vertexcolor','fs-x3d-vertexcolor']);}
else{shape._webgl.shader=getShaderProgram(gl,['vs-x3d-untextured','fs-x3d-untextured']);}
var sp=shape._webgl.shader;if(sp.position!==undefined)
{var positionBuffer=gl.createBuffer();shape._webgl.buffers[1]=positionBuffer;gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);var vertices=new CanvasFloatArray(shape._webgl.positions);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.vertexAttribPointer(sp.position,3,gl.FLOAT,false,0,0);var indicesBuffer=gl.createBuffer();shape._webgl.buffers[0]=indicesBuffer;var indexArray=new CanvasUnsignedShortArray(shape._webgl.indexes);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indicesBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);delete vertices;delete indexArray;}
if(sp.normal!==undefined)
{var normalBuffer=gl.createBuffer();shape._webgl.buffers[2]=normalBuffer;var normals=new CanvasFloatArray(shape._webgl.normals);gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);gl.vertexAttribPointer(sp.normal,3,gl.FLOAT,false,0,0);delete normals;}
if(sp.texcoord!==undefined)
{var texcBuffer=gl.createBuffer();shape._webgl.buffers[3]=texcBuffer;var texCoords=new CanvasFloatArray(shape._webgl.texcoords);gl.bindBuffer(gl.ARRAY_BUFFER,texcBuffer);gl.bufferData(gl.ARRAY_BUFFER,texCoords,gl.STATIC_DRAW);gl.vertexAttribPointer(sp.texcoord,2,gl.FLOAT,false,0,0);delete texCoords;}
if(sp.color!==undefined)
{var colorBuffer=gl.createBuffer();shape._webgl.buffers[4]=colorBuffer;var colors=new CanvasFloatArray(shape._webgl.colors);gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);gl.vertexAttribPointer(sp.color,3,gl.FLOAT,false,0,0);delete colors;}}}
Context.prototype.renderScene=function(scene)
{var gl=this.ctx3d;gl.viewport(0,0,this.canvas.width,this.canvas.height);var bgCol=scene.getSkyColor();gl.clearColor(bgCol[0],bgCol[1],bgCol[2],bgCol[3]);gl.clearDepth(1.0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);var sp=getDefaultShaderProgram(gl);if(!scene._webgl){var sp=getDefaultShaderProgram(gl);scene._webgl={shader:sp,};}
var t0,t1;if(scene.drawableObjects===undefined||!scene.drawableObjects){scene.drawableObjects=[];t0=new Date().getTime();scene._collectDrawableObjects(x3dom.fields.SFMatrix4.identity(),scene.drawableObjects);t1=new Date().getTime()-t0;if(this.canvas.parent.statDiv){this.canvas.parent.statDiv.appendChild(document.createElement("br"));this.canvas.parent.statDiv.appendChild(document.createTextNode("traverse: "+t1));}}
t0=new Date().getTime();var mat_projection=scene.getProjectionMatrix();var mat_view=scene.getViewMatrix();var mat_view_inv=mat_view.inverse();var light,lightOn;var slights=scene.getLights();if(slights.length>0){light=slights[0]._direction;lightOn=(slights[0]._on==true)?1.0:0.0;lightOn=lightOn*slights[0]._intensity;}
else{light=new x3dom.fields.SFVec3(0,-1,0);lightOn=0.0;}
light=mat_view.multMatrixVec(light);var zPos=[];for(var i=0,n=scene.drawableObjects.length;i<n;i++)
{var trafo=scene.drawableObjects[i][0];var obj3d=scene.drawableObjects[i][1];var center=obj3d._getCenter();center=trafo.multMatrixPnt(center);center=mat_view_inv.multMatrixPnt(center);zPos[i]=[i,center.z];}
zPos.sort(function(a,b){return a[1]-b[1];});zPos.reverse();t1=new Date().getTime()-t0;if(this.canvas.parent.statDiv){this.canvas.parent.statDiv.appendChild(document.createElement("br"));this.canvas.parent.statDiv.appendChild(document.createTextNode("sort: "+t1));}
t0=new Date().getTime();for(var i=0,n=zPos.length;i<n;i++)
{var obj=scene.drawableObjects[zPos[i][0]];var transform=obj[0];var shape=obj[1];if(!shape._webgl)
this.setupShape(gl,shape);var sp=shape._webgl.shader;if(!sp)
sp=scene._webgl.shader;sp.bind();sp.eyePosition=[0,0,0];sp.lightDirection=light.toGL();sp.lightOn=lightOn;var mat=shape._appearance._material;if(mat){sp.ambientIntensity=mat._ambientIntensity;sp.diffuseColor=mat._diffuseColor.toGL();sp.emissiveColor=mat._emissiveColor.toGL();sp.shininess=mat._shininess;sp.specularColor=mat._specularColor.toGL();sp.alpha=1.0-mat._transparency;}
if(shape._webgl.mask_texture!==undefined&&shape._webgl.mask_texture)
{x3dom.debug.logInfo("TEXT?");}
sp.viewMatrixInverse=mat_view_inv.toGL();sp.modelViewMatrix=mat_view.mult(transform).toGL();sp.modelViewProjectionMatrix=scene.getWCtoCCMatrix().mult(transform).toGL();if(shape._webgl.texture!==undefined&&shape._webgl.texture)
{var tex=shape._appearance._texture;var wrapS=gl.REPEAT,wrapT=gl.REPEAT;if(tex._repeatS==false)wrapS=gl.CLAMP_TO_EDGE;if(tex._repeatT==false)wrapT=gl.CLAMP_TO_EDGE;gl.enable(gl.TEXTURE_2D);gl.bindTexture(gl.TEXTURE_2D,shape._webgl.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,wrapS);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wrapT);if(shape._appearance._textureTransform!==null)
{var texTrafo=shape._appearance.transformMatrix();sp.texTrafoMatrix=texTrafo.toGL();}}
if(sp.position!==undefined)
{gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,shape._webgl.buffers[0]);gl.bindBuffer(gl.ARRAY_BUFFER,shape._webgl.buffers[1]);gl.vertexAttribPointer(sp.position,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(sp.position);}
if(sp.normal!==undefined)
{gl.bindBuffer(gl.ARRAY_BUFFER,shape._webgl.buffers[2]);gl.vertexAttribPointer(sp.normal,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(sp.normal);}
if(sp.texcoord!==undefined)
{gl.bindBuffer(gl.ARRAY_BUFFER,shape._webgl.buffers[3]);gl.vertexAttribPointer(sp.texcoord,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(sp.texcoord);}
if(sp.color!==undefined)
{gl.bindBuffer(gl.ARRAY_BUFFER,shape._webgl.buffers[4]);gl.vertexAttribPointer(sp.color,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(sp.color);}
if(shape._isSolid())
gl.enable(gl.CULL_FACE);else
gl.disable(gl.CULL_FACE);if(scene._points!==undefined&&scene._points)
gl.drawElements(gl.POINTS,shape._webgl.indexes.length,gl.UNSIGNED_SHORT,0);else
gl.drawElements(gl.TRIANGLES,shape._webgl.indexes.length,gl.UNSIGNED_SHORT,0);if(shape._webgl.texture!==undefined&&shape._webgl.texture)
{gl.bindTexture(gl.TEXTURE_2D,null);gl.disable(gl.TEXTURE_2D);}
if(sp.position!==undefined){gl.disableVertexAttribArray(sp.position);}
if(sp.normal!==undefined){gl.disableVertexAttribArray(sp.normal);}
if(sp.texcoord!==undefined){gl.disableVertexAttribArray(sp.texcoord);}}
gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);t1=new Date().getTime()-t0;if(this.canvas.parent.statDiv){this.canvas.parent.statDiv.appendChild(document.createElement("br"));this.canvas.parent.statDiv.appendChild(document.createTextNode("render: "+t1));}
scene.drawableObjects=null;}
Context.prototype.shutdown=function(scene)
{var gl=this.ctx3d;scene._collectDrawableObjects(x3dom.fields.SFMatrix4.identity(),scene.drawableObjects);for(var i=0,n=scene.drawableObjects.length;i<n;i++)
{var shape=scene.drawableObjects[i][1];var sp=shape._webgl.shader;if(shape._webgl.texture!==undefined&&shape._webgl.texture)
{gl.deleteTexture(shape._webgl.texture);}
if(sp.position!==undefined)
{gl.deleteBuffer(shape._webgl.buffers[1]);gl.deleteBuffer(shape._webgl.buffers[0]);}
if(sp.normal!==undefined)
{gl.deleteBuffer(shape._webgl.buffers[2]);}
if(sp.texcoord!==undefined)
{gl.deleteBuffer(shape._webgl.buffers[3]);}
if(sp.color!==undefined)
{gl.deleteBuffer(shape._webgl.buffers[4]);}}}
return setupContext;})();x3dom.nodeTypes={};x3dom.components={};x3dom.registerNodeType=function(nodeTypeName,componentName,nodeDef){x3dom.debug.logInfo("Registering nodetype ["+nodeTypeName+"] in component ["+componentName+"]");if(x3dom.components[componentName]===undefined){x3dom.debug.logInfo("Adding new component ["+componentName+"]");x3dom.components[componentName]={};x3dom.components[componentName][nodeTypeName]=nodeDef;x3dom.nodeTypes[nodeTypeName]=nodeDef;}
else{x3dom.debug.logInfo("Using component ["+componentName+"]");x3dom.components[componentName][nodeTypeName]=nodeDef;x3dom.nodeTypes[nodeTypeName]=nodeDef;}};x3dom.parsingInline==false;x3dom.isX3DElement=function(node){return(node.nodeType===Node.ELEMENT_NODE&&(node.namespaceURI==x3dom.x3dNS||x3dom.parsingInline==true));};function defineClass(parent,ctor,methods){if(parent){function inheritance(){}
inheritance.prototype=parent.prototype;ctor.prototype=new inheritance();ctor.prototype.constructor=ctor;ctor.superClass=parent;}
if(methods){for(var m in methods){ctor.prototype[m]=methods[m];}}
return ctor;}
x3dom.isa=function(object,clazz){if(object.constructor==clazz){return true;}
function f(c){if(c==clazz){return true;}
if(c.prototype&&c.prototype.constructor&&c.prototype.constructor.superClass){return f(c.prototype.constructor.superClass);}
return false;}
return f(object.constructor.superClass);};function MFString_parse(str){if(str[0]=='"'){var re=/"((?:[^\\"]|\\\\|\\")*)"/g;var m;var ret=[];while(m=re.exec(str)){ret.push(m[1].replace(/\\([\\"])/,"$1"));}
return ret;}else{return[str];}}
x3dom.registerNodeType("X3DNode","base",defineClass(null,function(ctx){if(ctx.xmlNode.hasAttribute('DEF')){this._DEF=ctx.xmlNode.getAttribute('DEF');ctx.defMap[this._DEF]=this;}else{if(ctx.xmlNode.hasAttribute('id')){this._DEF=ctx.xmlNode.getAttribute('id');ctx.defMap[this._DEF]=this;}}
this._typeName=ctx.xmlNode.localName;this._xmlNode=ctx.xmlNode;this._fieldWatchers={};this._parentNodes=[];this._childNodes=[];},{_getCurrentTransform:function(){if(this._parentNodes.length>=1){return this._transformMatrix(this._parentNodes[0]._getCurrentTransform());}
else{return x3dom.fields.SFMatrix4.identity();}},_transformMatrix:function(transform){return transform;},_getVolume:function(min,max,invalidate)
{var valid=false;for(var i=0;i<this._childNodes.length;i++)
{if(this._childNodes[i])
{var childMin=new x3dom.fields.SFVec3(min.x,min.y,min.z);var childMax=new x3dom.fields.SFVec3(max.x,max.y,max.z);valid=this._childNodes[i]._getVolume(childMin,childMax,invalidate)||valid;if(valid)
{if(min.x>childMin.x){min.x=childMin.x;}
if(min.y>childMin.y){min.y=childMin.y;}
if(min.z>childMin.z){min.z=childMin.z;}
if(max.x<childMax.x){max.x=childMax.x;}
if(max.y<childMax.y){max.y=childMax.y;}
if(max.z<childMax.z){max.z=childMax.z;}}}}
return valid;},_find:function(type){for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){if(this._childNodes[i].constructor==type){return this._childNodes[i];}
var c=this._childNodes[i]._find(type);if(c){return c;}}}
return null;},_findAll:function(type){var found=[];for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){if(this._childNodes[i].constructor==type){found.push(this._childNodes[i]);}
found=found.concat(this._childNodes[i]._findAll(type));}}
return found;},_collectDrawableObjects:function(transform,out){for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){var childTransform=this._childNodes[i]._transformMatrix(transform);this._childNodes[i]._collectDrawableObjects(childTransform,out);}}},_doIntersect:function(line){for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){if(this._childNodes[i]._doIntersect(line)){return true;}}}
return false;},_getNodeByDEF:function(def){if(this._DEF==def){return this;}
for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){var found=this._childNodes[i]._getNodeByDEF(def);if(found){return found;}}}
return null;},_postMessage:function(field,msg){var listeners=this._fieldWatchers[field];var thisp=this;if(listeners){Array.forEach(listeners,function(l){l.call(thisp,msg);});}},_updateField:function(field,msg){var fieldName="_"+field;var f=this[fieldName];if(f===undefined){this[fieldName]={};f=this[fieldName];}
if(f!==null){if(f.constructor===x3dom.fields.SFVec3){this[fieldName]=x3dom.fields.SFVec3.parse(msg);}
else if(fieldName=="_transparency"){this[fieldName]=+msg;}
else if(msg=="true"){this[fieldName]=true;}
else if(msg=="false"){this[fieldName]=false;}}},_setupRoute:function(fromField,toNode,toField){if(!this._fieldWatchers[fromField]){this._fieldWatchers[fromField]=[];}
this._fieldWatchers[fromField].push(function(msg){toNode._postMessage(toField,msg);});if(!toNode._fieldWatchers[toField]){toNode._fieldWatchers[toField]=[];}
toNode._fieldWatchers[toField].push(function(msg){if(toNode[toField]===undefined){toNode["_"+toField]=msg;}
else{toNode[toField]=msg;}});},_attribute_SFFloat:function(ctx,name,n){this['_'+name]=ctx.xmlNode.hasAttribute(name)?+ctx.xmlNode.getAttribute(name):n;},_attribute_SFTime:function(ctx,name,n){this['_'+name]=ctx.xmlNode.hasAttribute(name)?+ctx.xmlNode.getAttribute(name):n;},_attribute_SFBool:function(ctx,name,n){this['_'+name]=ctx.xmlNode.hasAttribute(name)?ctx.xmlNode.getAttribute(name)=="true":n;},_attribute_SFString:function(ctx,name,n){this['_'+name]=ctx.xmlNode.hasAttribute(name)?ctx.xmlNode.getAttribute(name):n;},_attribute_SFColor:function(ctx,name,r,g,b){this['_'+name]=ctx.xmlNode.hasAttribute(name)?x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)):new x3dom.fields.SFVec3(r,g,b);},_attribute_SFVec2:function(ctx,name,x,y){this['_'+name]=ctx.xmlNode.hasAttribute(name)?x3dom.fields.SFVec2.parse(ctx.xmlNode.getAttribute(name)):new x3dom.fields.SFVec2(x,y);},_attribute_SFVec3:function(ctx,name,x,y,z){this['_'+name]=ctx.xmlNode.hasAttribute(name)?x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute(name)):new x3dom.fields.SFVec3(x,y,z);},_attribute_SFRotation:function(ctx,name,x,y,z,a){this['_'+name]=ctx.xmlNode.hasAttribute(name)?x3dom.fields.Quaternion.parseAxisAngle(ctx.xmlNode.getAttribute(name)):new x3dom.fields.Quaternion(x,y,z,a);},_attribute_MFString:function(ctx,name,def){this['_'+name]=ctx.xmlNode.hasAttribute(name)?MFString_parse(ctx.xmlNode.getAttribute(name)):def;},_attribute_MFColor:function(ctx,name,def){this['_'+name]=ctx.xmlNode.hasAttribute(name)?x3dom.fields.MFColor.parse(ctx.xmlNode.getAttribute(name)):new x3dom.fields.MFColor([new x3dom.fields.SFColor(0,0,0)]);}}));x3dom.registerNodeType("X3DAppearanceNode","base",defineClass(x3dom.nodeTypes.X3DNode,function(ctx){x3dom.nodeTypes.X3DAppearanceNode.superClass.call(this,ctx);}));x3dom.registerNodeType("Appearance","Shape",defineClass(x3dom.nodeTypes.X3DAppearanceNode,function(ctx){x3dom.nodeTypes.Appearance.superClass.call(this,ctx);var material=null;var texture=null;var textureTransform=null;Array.forEach(ctx.xmlNode.childNodes,function(node){if(x3dom.isX3DElement(node)){var child=ctx.setupNodePrototypes(node,ctx);if(child){if(x3dom.isa(child,x3dom.nodeTypes.X3DMaterialNode)){ctx.assert(!material,'has <= 1 material node');material=child;}
else if(x3dom.isa(child,x3dom.nodeTypes.X3DTextureNode)){texture=child;}
else if(x3dom.isa(child,x3dom.nodeTypes.X3DTextureTransformNode)){textureTransform=child;}
else{ctx.log('unrecognised x3dom.nodeTypes.Appearance child node type '+node.localName);}}}});if(!material)
{var nodeType=x3dom.nodeTypes["Material"];material=new nodeType(ctx);}
this._material=material;this._texture=texture;this._textureTransform=textureTransform;},{transformMatrix:function(){if(this._textureTransform==null){return x3dom.fields.SFMatrix4.identity();}
else{return this._textureTransform.transformMatrix();}},_getNodeByDEF:function(def){if(this._DEF==def){return this;}
var found=null;if(this._material!==null){found=this._material._getNodeByDEF(def);if(found){return found;}}
if(this._texture!==null){found=this._texture._getNodeByDEF(def);if(found){return found;}}
if(this._textureTransform!==null){found=this._textureTransform._getNodeByDEF(def);if(found){return found;}}
return found;},_find:function(type){var c=null;if(this._material!==null){if(this._material.constructor==type){return this._material;}
c=this._material._find(type);if(c){return c;}}
if(this._texture!==null){if(this._texture.constructor==type){return this._texture;}
c=this._texture._find(type);if(c){return c;}}
if(this._textureTransform!==null){if(this._textureTransform.constructor==type){return this._textureTransform;}
c=this._textureTransform._find(type);if(c){return c;}}
return c;}}));x3dom.registerNodeType("X3DAppearanceChildNode","base",defineClass(x3dom.nodeTypes.X3DNode,function(ctx){x3dom.nodeTypes.X3DAppearanceChildNode.superClass.call(this,ctx);}));x3dom.registerNodeType("X3DMaterialNode","base",defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,function(ctx){x3dom.nodeTypes.X3DMaterialNode.superClass.call(this,ctx);}));x3dom.registerNodeType("Material","Shape",defineClass(x3dom.nodeTypes.X3DMaterialNode,function(ctx){x3dom.nodeTypes.Material.superClass.call(this,ctx);this._attribute_SFFloat(ctx,'ambientIntensity',0.2);this._attribute_SFColor(ctx,'diffuseColor',0.8,0.8,0.8);this._attribute_SFColor(ctx,'emissiveColor',0,0,0);this._attribute_SFFloat(ctx,'shininess',0.2);this._attribute_SFColor(ctx,'specularColor',0,0,0);this._attribute_SFFloat(ctx,'transparency',0);}));x3dom.registerNodeType("X3DTextureTransformNode","Texturing",defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,function(ctx){x3dom.nodeTypes.X3DTextureTransformNode.superClass.call(this,ctx);}));x3dom.registerNodeType("TextureTransform","Texturing",defineClass(x3dom.nodeTypes.X3DTextureTransformNode,function(ctx){x3dom.nodeTypes.TextureTransform.superClass.call(this,ctx);this._attribute_SFVec2(ctx,'center',0,0);this._attribute_SFFloat(ctx,'rotation',0);this._attribute_SFVec2(ctx,'scale',1,1);this._attribute_SFVec2(ctx,'translation',0,0);var negCenter=new x3dom.fields.SFVec3(-this._center.x,-this._center.y,1);var posCenter=new x3dom.fields.SFVec3(this._center.x,this._center.y,0);var trans3=new x3dom.fields.SFVec3(this._translation.x,this._translation.y,0);var scale3=new x3dom.fields.SFVec3(this._scale.x,this._scale.y,0);this._trafo=x3dom.fields.SFMatrix4.translation(negCenter).mult(x3dom.fields.SFMatrix4.scale(scale3)).mult(x3dom.fields.SFMatrix4.rotationZ(this._rotation)).mult(x3dom.fields.SFMatrix4.translation(posCenter)).mult(x3dom.fields.SFMatrix4.translation(trans3));},{transformMatrix:function(){var negCenter=new x3dom.fields.SFVec3(-this._center.x,-this._center.y,1);var posCenter=new x3dom.fields.SFVec3(this._center.x,this._center.y,0);var trans3=new x3dom.fields.SFVec3(this._translation.x,this._translation.y,0);var scale3=new x3dom.fields.SFVec3(this._scale.x,this._scale.y,0);this._trafo=x3dom.fields.SFMatrix4.translation(negCenter).mult(x3dom.fields.SFMatrix4.scale(scale3)).mult(x3dom.fields.SFMatrix4.rotationZ(this._rotation)).mult(x3dom.fields.SFMatrix4.translation(posCenter)).mult(x3dom.fields.SFMatrix4.translation(trans3));return this._trafo;}}));x3dom.registerNodeType("X3DTextureNode","Texturing",defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,function(ctx){x3dom.nodeTypes.X3DTextureNode.superClass.call(this,ctx);}));x3dom.registerNodeType("ImageTexture","Texturing",defineClass(x3dom.nodeTypes.X3DTextureNode,function(ctx){x3dom.nodeTypes.ImageTexture.superClass.call(this,ctx);this._attribute_MFString(ctx,'url',[]);this._attribute_SFBool(ctx,'repeatS',true);this._attribute_SFBool(ctx,'repeatT',true);}));x3dom.Mesh=function(parent)
{this._parent=parent;this._min=new x3dom.fields.SFVec3(0,0,0);this._max=new x3dom.fields.SFVec3(0,0,0);this._invalidate=true;};x3dom.Mesh.prototype._positions=[];x3dom.Mesh.prototype._normals=[];x3dom.Mesh.prototype._texCoords=[];x3dom.Mesh.prototype._colors=[];x3dom.Mesh.prototype._indices=[];x3dom.Mesh.prototype._min={};x3dom.Mesh.prototype._max={};x3dom.Mesh.prototype._invalidate=true;x3dom.Mesh.prototype.getBBox=function(min,max,invalidate)
{if(this._invalidate===true&&invalidate===true)
{var coords=this._positions;var n=coords.length;if(n>3)
{this._min=new x3dom.fields.SFVec3(coords[0],coords[1],coords[2]);this._max=new x3dom.fields.SFVec3(coords[0],coords[1],coords[2]);}
else
{this._min=new x3dom.fields.SFVec3(0,0,0);this._max=new x3dom.fields.SFVec3(0,0,0);}
for(var i=3;i<n;i+=3)
{if(this._min.x>coords[i+0]){this._min.x=coords[i+0];}
if(this._min.y>coords[i+1]){this._min.y=coords[i+1];}
if(this._min.z>coords[i+2]){this._min.z=coords[i+2];}
if(this._max.x<coords[i+0]){this._max.x=coords[i+0];}
if(this._max.y<coords[i+1]){this._max.y=coords[i+1];}
if(this._max.z<coords[i+2]){this._max.z=coords[i+2];}}
this._invalidate=false;}
min.x=this._min.x;min.y=this._min.y;min.z=this._min.z;max.x=this._max.x;max.y=this._max.y;max.z=this._max.z;};x3dom.Mesh.prototype.getCenter=function()
{var min=new x3dom.fields.SFVec3(0,0,0);var max=new x3dom.fields.SFVec3(0,0,0);this.getBBox(min,max,true);var center=min.add(max).scale(0.5);return center;};x3dom.Mesh.prototype.doIntersect=function(line)
{var min=new x3dom.fields.SFVec3(0,0,0);var max=new x3dom.fields.SFVec3(0,0,0);this.getBBox(min,max,true);var isect=line.intersect(min,max);line.hit=isect;if(isect)
{x3dom.debug.logInfo("Hit \""+this._parent._typeName+"/"+this._parent._DEF+"\"");line.hitObject=this._parent;line.hitPoint=line.pos.add(line.dir.scale(line.enter));}
return isect;};x3dom.Mesh.prototype.calcNormals=function(creaseAngle)
{var i=0;var coords=this._positions;var idxs=this._indices;var vertNormals=[];var vertFaceNormals=[];var n=null;for(i=0;i<coords.length/3;++i){vertFaceNormals[i]=[];}
for(i=0;i<idxs.length;i+=3){var a=new x3dom.fields.SFVec3(coords[idxs[i]*3],coords[idxs[i]*3+1],coords[idxs[i]*3+2]).subtract(new x3dom.fields.SFVec3(coords[idxs[i+1]*3],coords[idxs[i+1]*3+1],coords[idxs[i+1]*3+2]));var b=new x3dom.fields.SFVec3(coords[idxs[i+1]*3],coords[idxs[i+1]*3+1],coords[idxs[i+1]*3+2]).subtract(new x3dom.fields.SFVec3(coords[idxs[i+2]*3],coords[idxs[i+2]*3+1],coords[idxs[i+2]*3+2]));n=a.cross(b).normalised();vertFaceNormals[idxs[i]].push(n);vertFaceNormals[idxs[i+1]].push(n);vertFaceNormals[idxs[i+2]].push(n);}
for(i=0;i<coords.length;i+=3){n=new x3dom.fields.SFVec3(0,0,0);for(var j=0;j<vertFaceNormals[i/3].length;++j){n=n.add(vertFaceNormals[i/3][j]);}
n=n.normalised();vertNormals[i]=n.x;vertNormals[i+1]=n.y;vertNormals[i+2]=n.z;}
this._normals=vertNormals;};x3dom.Mesh.prototype.calcTexCoords=function()
{};x3dom.Mesh.prototype.remapData=function()
{};x3dom.registerNodeType("X3DGeometryNode","base",defineClass(x3dom.nodeTypes.X3DNode,function(ctx){x3dom.nodeTypes.X3DGeometryNode.superClass.call(this,ctx);this._attribute_SFBool(ctx,'solid',true);this._mesh=new x3dom.Mesh(this);},{_getVolume:function(min,max,invalidate){this._mesh.getBBox(min,max,invalidate);return true;},_getCenter:function(){return this._mesh.getCenter();},_doIntersect:function(line){var isect=this._mesh.doIntersect(line);if(isect&&this._xmlNode!==null){if(this._xmlNode.hasAttribute('onclick'))
{var funcStr=this._xmlNode.getAttribute('onclick');var func=new Function('hitPnt',funcStr);func.call(this,line.hitPoint);}}
return isect;}}));x3dom.registerNodeType("Box","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Box.superClass.call(this,ctx);var sx,sy,sz;if(ctx.xmlNode.hasAttribute('size')){var size=x3dom.fields.SFVec3.parse(ctx.xmlNode.getAttribute('size'));sx=size.x;sy=size.y;sz=size.z;}else{sx=sy=sz=2;}
sx/=2;sy/=2;sz/=2;this._mesh._positions=[-sx,-sy,-sz,-sx,sy,-sz,sx,sy,-sz,sx,-sy,-sz,-sx,-sy,sz,-sx,sy,sz,sx,sy,sz,sx,-sy,sz,-sx,-sy,-sz,-sx,-sy,sz,-sx,sy,sz,-sx,sy,-sz,sx,-sy,-sz,sx,-sy,sz,sx,sy,sz,sx,sy,-sz,-sx,sy,-sz,-sx,sy,sz,sx,sy,sz,sx,sy,-sz,-sx,-sy,-sz,-sx,-sy,sz,sx,-sy,sz,sx,-sy,-sz];this._mesh._normals=[0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0];this._mesh._texCoords=[1,0,1,1,0,1,0,0,0,0,0,1,1,1,1,0,0,0,1,0,1,1,0,1,1,0,0,0,0,1,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,1,0];this._mesh._indices=[0,1,2,2,3,0,4,7,5,5,7,6,8,9,10,10,11,8,12,14,13,14,12,15,16,17,18,18,19,16,20,22,21,22,20,23];this._mesh._invalidate=true;}));x3dom.registerNodeType("Sphere","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Sphere.superClass.call(this,ctx);var r;if(ctx.xmlNode.hasAttribute('radius')){r=+ctx.xmlNode.getAttribute('radius');}
else{r=1;}
var verts=[0,0,-r,r,0,0,0,0,r,-r,0,0,0,-r,0,0,r,0];var norms=[0,0,-1,1,0,0,0,0,1,-1,0,0,0,-1,0,0,1,0];var tris=[0,1,4,1,2,4,2,3,4,3,0,4,1,0,5,2,1,5,3,2,5,0,3,5];var new_verts,new_tris;function add_vertex(a,b){if(a>b){var t=a;a=b;b=t;}
if(new_verts[a]===undefined){new_verts[a]=[];}
if(new_verts[a][b]===undefined){new_verts[a][b]=verts.length/3;var x=(verts[a*3]+verts[b*3])/2;var y=(verts[a*3+1]+verts[b*3+1])/2;var z=(verts[a*3+2]+verts[b*3+2])/2;var s=r/Math.sqrt(x*x+y*y+z*z);var xs=x*s,ys=y*s,zs=z*s;verts.push(xs,ys,zs);var l=Math.sqrt(xs*xs+ys*ys+zs*zs);norms.push(xs/l,ys/s,zs/l);}
return new_verts[a][b];}
for(var k=0;k<3;++k){new_verts=[];new_tris=[];for(var i=0;i<tris.length;i+=3){var a=add_vertex(tris[i],tris[i+1]);var b=add_vertex(tris[i+1],tris[i+2]);var c=add_vertex(tris[i+2],tris[i]);new_tris.push(tris[i],a,c,tris[i+1],b,a,tris[i+2],c,b,a,b,c);}
tris=new_tris;}
this._mesh._positions=verts;this._mesh._normals=norms;this._mesh._indices=tris;this._mesh._invalidate=true;}));x3dom.registerNodeType("Torus","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Torus.superClass.call(this,ctx);var innerRadius=0.5,outerRadius=1.0;if(ctx.xmlNode.hasAttribute('innerRadius')){innerRadius=+ctx.xmlNode.getAttribute('innerRadius');}
if(ctx.xmlNode.hasAttribute('outerRadius')){outerRadius=+ctx.xmlNode.getAttribute('outerRadius');}
var rings=24,sides=24;var ringDelta=2.0*Math.PI/rings;var sideDelta=2.0*Math.PI/sides;var p=[],n=[],t=[],i=[];var a,b;for(a=0,theta=0;a<=rings;a++,theta+=ringDelta)
{var cosTheta=Math.cos(theta);var sinTheta=Math.sin(theta);for(b=0,phi=0;b<=sides;b++,phi+=sideDelta)
{var cosPhi=Math.cos(phi);var sinPhi=Math.sin(phi);var dist=outerRadius+innerRadius*cosPhi;n.push(cosTheta*cosPhi,-sinTheta*cosPhi,sinPhi);p.push(cosTheta*dist,-sinTheta*dist,innerRadius*sinPhi);t.push(-a/rings,b/sides);}}
for(a=0;a<sides;a++)
{for(b=0;b<rings;b++)
{i.push(b*(sides+1)+a);i.push(b*(sides+1)+a+1);i.push((b+1)*(sides+1)+a);i.push(b*(sides+1)+a+1);i.push((b+1)*(sides+1)+a+1);i.push((b+1)*(sides+1)+a);}}
this._mesh._positions=p;this._mesh._normals=n;this._mesh._texCoords=t;this._mesh._indices=i;this._mesh._invalidate=true;}));x3dom.registerNodeType("Cone","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Cone.superClass.call(this,ctx);var bottomRadius=1.0,height=2.0;if(ctx.xmlNode.hasAttribute('bottomRadius')){bottomRadius=+ctx.xmlNode.getAttribute('bottomRadius');}
if(ctx.xmlNode.hasAttribute('height')){height=+ctx.xmlNode.getAttribute('height');}
var beta,x,z;var sides=32;var delta=2.0*Math.PI/sides;var incl=bottomRadius/height;var nlen=1.0/Math.sqrt(1.0+incl*incl);var p=[],n=[],t=[],i=[];for(var j=0,k=0;j<=sides;j++)
{beta=j*delta;x=Math.sin(beta);z=-Math.cos(beta);p.push(0,height/2,0);n.push(x/nlen,incl/nlen,z/nlen);t.push(1.0-j/sides,1);p.push(x*bottomRadius,-height/2,z*bottomRadius);n.push(x/nlen,incl/nlen,z/nlen);t.push(1.0-j/sides,0);if(j>0)
{i.push(k+0);i.push(k+2);i.push(k+1);i.push(k+1);i.push(k+2);i.push(k+3);k+=2;}}
if(bottomRadius>0)
{var base=p.length/3;for(j=sides-1;j>=0;j--)
{beta=j*delta;x=bottomRadius*Math.sin(beta);z=-bottomRadius*Math.cos(beta);p.push(x,-height/2,z);n.push(0,-1,0);t.push(x/bottomRadius/2+0.5,z/bottomRadius/2+0.5);}
var h=base+1;for(j=2;j<sides;j++)
{i.push(h);i.push(base);h=base+j;i.push(h);}}
this._mesh._positions=p;this._mesh._normals=n;this._mesh._texCoords=t;this._mesh._indices=i;this._mesh._invalidate=true;}));x3dom.registerNodeType("Cylinder","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Cylinder.superClass.call(this,ctx);var radius=1.0,height=2.0;if(ctx.xmlNode.hasAttribute('radius')){radius=+ctx.xmlNode.getAttribute('radius');}
if(ctx.xmlNode.hasAttribute('height')){height=+ctx.xmlNode.getAttribute('height');}
var beta,x,z;var sides=24;var delta=2.0*Math.PI/sides;var p=[],n=[],t=[],i=[];for(var j=0,k=0;j<=sides;j++)
{beta=j*delta;x=Math.sin(beta);z=-Math.cos(beta);p.push(x*radius,-height/2,z*radius);n.push(x,0,z);t.push(1.0-j/sides,0);p.push(x*radius,height/2,z*radius);n.push(x,0,z);t.push(1.0-j/sides,1);if(j>0)
{i.push(k+0);i.push(k+1);i.push(k+2);i.push(k+2);i.push(k+1);i.push(k+3);k+=2;}}
if(radius>0)
{var base=p.length/3;for(j=sides-1;j>=0;j--)
{beta=j*delta;x=radius*Math.sin(beta);z=-radius*Math.cos(beta);p.push(x,height/2,z);n.push(0,1,0);t.push(x/radius/2+0.5,-z/radius/2+0.5);}
var h=base+1;for(j=2;j<sides;j++)
{i.push(base);i.push(h);h=base+j;i.push(h);}
base=p.length/3;for(j=sides-1;j>=0;j--)
{beta=j*delta;x=radius*Math.sin(beta);z=-radius*Math.cos(beta);p.push(x,-height/2,z);n.push(0,-1,0);t.push(x/radius/2+0.5,z/radius/2+0.5);}
h=base+1;for(j=2;j<sides;j++)
{i.push(h);i.push(base);h=base+j;i.push(h);}}
this._mesh._positions=p;this._mesh._normals=n;this._mesh._texCoords=t;this._mesh._indices=i;this._mesh._invalidate=true;}));x3dom.registerNodeType("Text","Geometry3D",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.Text.superClass.call(this,ctx);this._attribute_MFString(ctx,'string',[]);var style=null;Array.forEach(ctx.xmlNode.childNodes,function(node){if(x3dom.isX3DElement(node)){var child=ctx.setupNodePrototypes(node,ctx);if(child){if(x3dom.isa(child,x3dom.X3DFontStyleNode)){ctx.assert(!style,'has <= 1 fontStyle node');style=child;}else{ctx.log('unrecognised x3dom.Text child node type '+node.localName);}}}});this._fontStyle=style;}));x3dom.registerNodeType("X3DComposedGeometryNode","base",defineClass(x3dom.nodeTypes.X3DGeometryNode,function(ctx){x3dom.nodeTypes.X3DComposedGeometryNode.superClass.call(this,ctx);}));x3dom.registerNodeType("IndexedFaceSet","Geometry3D",defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,function(ctx){x3dom.nodeTypes.IndexedFaceSet.superClass.call(this,ctx);this._attribute_SFBool(ctx,'creaseAngle',0);var t0=new Date().getTime();var indexes=ctx.xmlNode.getAttribute('coordIndex').match(/((?:\+|-)?\d+)/g);var normalInd,texCoordInd,colorInd;var hasNormal=false,hasNormalInd=false;var hasTexCoord=false,hasTexCoordInd=false;var hasColor=false,hasColorInd=false;if(ctx.xmlNode.hasAttribute('normalIndex'))
{normalInd=ctx.xmlNode.getAttribute('normalIndex').match(/((?:\+|-)?\d+)/g);hasNormalInd=true;}
if(ctx.xmlNode.hasAttribute('texCoordIndex'))
{texCoordInd=ctx.xmlNode.getAttribute('texCoordIndex').match(/((?:\+|-)?\d+)/g);hasTexCoordInd=true;}
if(ctx.xmlNode.hasAttribute('colorIndex'))
{colorInd=ctx.xmlNode.getAttribute('colorIndex').match(/((?:\+|-)?\d+)/g);hasColorInd=true;}
var positions,normals,texCoords,colors;var coordNode=Array.filter(ctx.xmlNode.childNodes,function(n){return(x3dom.isX3DElement(n)&&n.localName=='Coordinate');});ctx.assert(coordNode.length==1);positions=Array.map(coordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g),function(n){return+n;});var normalNode=Array.filter(ctx.xmlNode.childNodes,function(n){return(x3dom.isX3DElement(n)&&n.localName=='Normal');});if(normalNode.length==1)
{hasNormal=true;normals=Array.map(normalNode[0].getAttribute('vector').match(/([+\-0-9eE\.]+)/g),function(n){return+n;});}
else{hasNormal=false;}
var texCoordNode=Array.filter(ctx.xmlNode.childNodes,function(n){return(x3dom.isX3DElement(n)&&n.localName=='TextureCoordinate');});if(texCoordNode.length==1)
{hasTexCoord=true;texCoords=Array.map(texCoordNode[0].getAttribute('point').match(/([+\-0-9eE\.]+)/g),function(n){return+n;});}
else{hasTexCoord=false;}
var colorNode=Array.filter(ctx.xmlNode.childNodes,function(n){return(x3dom.isX3DElement(n)&&n.localName=='Color');});if(colorNode.length==1)
{hasColor=true;colors=Array.map(colorNode[0].getAttribute('color').match(/([+\-0-9eE\.]+)/g),function(n){return+n;});}
else{hasColor=false;}
this._mesh._indices=[];this._mesh._positions=[];if(hasNormal){this._mesh._normals=[];}
if(hasTexCoord){this._mesh._texCoords=[];}
if(hasColor){this._mesh._colors=[];}
if((hasNormal&&hasNormalInd)||(hasTexCoord&&hasTexCoordInd)||(hasColor&&hasColorInd))
{var t=0,cnt=0;var p0,p1,p2,n0,n1,n2,t1,t2,t3,c0,c1,c2;for(var i=0;i<indexes.length;++i)
{if(indexes[i]==-1){t=0;continue;}
if(hasNormalInd){ctx.assert(normalInd[i]!=-1);}
if(hasTexCoordInd){ctx.assert(texCoordInd[i]!=-1);}
if(hasColorInd){ctx.assert(colorInd[i]!=-1);}
switch(t)
{case 0:p0=+indexes[i];if(hasNormalInd){n0=+normalInd[i];}
else{n0=p0;}
if(hasTexCoordInd){t0=+texCoordInd[i];}
else{t0=p0;}
if(hasColorInd){c0=+colorInd[i];}
else{c0=p0;}
t=1;break;case 1:p1=+indexes[i];if(hasNormalInd){n1=+normalInd[i];}
else{n1=p1;}
if(hasTexCoordInd){t1=+texCoordInd[i];}
else{t1=p1;}
if(hasColorInd){c1=+colorInd[i];}
else{c1=p1;}
t=2;break;case 2:p2=+indexes[i];if(hasNormalInd){n2=+normalInd[i];}
else{n2=p2;}
if(hasTexCoordInd){t2=+texCoordInd[i];}
else{t2=p2;}
if(hasColorInd){c2=+colorInd[i];}
else{c2=p2;}
t=3;this._mesh._indices.push(cnt++,cnt++,cnt++);this._mesh._positions.push(positions[p0*3+0]);this._mesh._positions.push(positions[p0*3+1]);this._mesh._positions.push(positions[p0*3+2]);this._mesh._positions.push(positions[p1*3+0]);this._mesh._positions.push(positions[p1*3+1]);this._mesh._positions.push(positions[p1*3+2]);this._mesh._positions.push(positions[p2*3+0]);this._mesh._positions.push(positions[p2*3+1]);this._mesh._positions.push(positions[p2*3+2]);if(hasNormal){this._mesh._normals.push(normals[n0*3+0]);this._mesh._normals.push(normals[n0*3+1]);this._mesh._normals.push(normals[n0*3+2]);this._mesh._normals.push(normals[n1*3+0]);this._mesh._normals.push(normals[n1*3+1]);this._mesh._normals.push(normals[n1*3+2]);this._mesh._normals.push(normals[n2*3+0]);this._mesh._normals.push(normals[n2*3+1]);this._mesh._normals.push(normals[n2*3+2]);}
if(hasTexCoord){this._mesh._texCoords.push(texCoords[t0*3+0]);this._mesh._texCoords.push(texCoords[t0*3+1]);this._mesh._texCoords.push(texCoords[t0*3+2]);this._mesh._texCoords.push(texCoords[t1*3+0]);this._mesh._texCoords.push(texCoords[t1*3+1]);this._mesh._texCoords.push(texCoords[t1*3+2]);this._mesh._texCoords.push(texCoords[t2*3+0]);this._mesh._texCoords.push(texCoords[t2*3+1]);this._mesh._texCoords.push(texCoords[t2*3+2]);}
if(hasColor){this._mesh._colors.push(colors[c0*3+0]);this._mesh._colors.push(colors[c0*3+1]);this._mesh._colors.push(colors[c0*3+2]);this._mesh._colors.push(colors[c1*3+0]);this._mesh._colors.push(colors[c1*3+1]);this._mesh._colors.push(colors[c1*3+2]);this._mesh._colors.push(colors[c2*3+0]);this._mesh._colors.push(colors[c2*3+1]);this._mesh._colors.push(colors[c2*3+2]);}
break;case 3:p1=p2;n1=n2;t1=t2;p2=+indexes[i];if(hasNormalInd){n2=+normalInd[i];}
else{n2=p2;}
if(hasTexCoordInd){t2=+texCoordInd[i];}
else{t2=p2;}
if(hasColorInd){c2=+colorInd[i];}
else{c2=p2;}
this._mesh._indices.push(cnt++,cnt++,cnt++);this._mesh._positions.push(positions[p0*3+0]);this._mesh._positions.push(positions[p0*3+1]);this._mesh._positions.push(positions[p0*3+2]);this._mesh._positions.push(positions[p1*3+0]);this._mesh._positions.push(positions[p1*3+1]);this._mesh._positions.push(positions[p1*3+2]);this._mesh._positions.push(positions[p2*3+0]);this._mesh._positions.push(positions[p2*3+1]);this._mesh._positions.push(positions[p2*3+2]);if(hasNormal){this._mesh._normals.push(normals[n0*3+0]);this._mesh._normals.push(normals[n0*3+1]);this._mesh._normals.push(normals[n0*3+2]);this._mesh._normals.push(normals[n1*3+0]);this._mesh._normals.push(normals[n1*3+1]);this._mesh._normals.push(normals[n1*3+2]);this._mesh._normals.push(normals[n2*3+0]);this._mesh._normals.push(normals[n2*3+1]);this._mesh._normals.push(normals[n2*3+2]);}
if(hasTexCoord){this._mesh._texCoords.push(texCoords[t0*3+0]);this._mesh._texCoords.push(texCoords[t0*3+1]);this._mesh._texCoords.push(texCoords[t0*3+2]);this._mesh._texCoords.push(texCoords[t1*3+0]);this._mesh._texCoords.push(texCoords[t1*3+1]);this._mesh._texCoords.push(texCoords[t1*3+2]);this._mesh._texCoords.push(texCoords[t2*3+0]);this._mesh._texCoords.push(texCoords[t2*3+1]);this._mesh._texCoords.push(texCoords[t2*3+2]);}
if(hasColor){this._mesh._colors.push(colors[c0*3+0]);this._mesh._colors.push(colors[c0*3+1]);this._mesh._colors.push(colors[c0*3+2]);this._mesh._colors.push(colors[c1*3+0]);this._mesh._colors.push(colors[c1*3+1]);this._mesh._colors.push(colors[c1*3+2]);this._mesh._colors.push(colors[c2*3+0]);this._mesh._colors.push(colors[c2*3+1]);this._mesh._colors.push(colors[c2*3+2]);}
break;default:}}
if(!hasNormal){this._mesh.calcNormals(this._creaseAngle);}
if(!hasTexCoord){this._mesh.calcTexCoords();}
this._mesh.remapData();}
else
{var t=0,n0,n1,n2;for(var i=0;i<indexes.length;++i)
{if(indexes[i]==-1){t=0;continue;}
switch(t){case 0:n0=+indexes[i];t=1;break;case 1:n1=+indexes[i];t=2;break;case 2:n2=+indexes[i];t=3;this._mesh._indices.push(n0,n1,n2);break;case 3:n1=n2;n2=+indexes[i];this._mesh._indices.push(n0,n1,n2);break;}}
this._mesh._positions=positions;if(hasNormal){this._mesh._normals=normals;}
else{this._mesh.calcNormals(this._creaseAngle);}
if(hasTexCoord){this._mesh._texCoords=texCoords;}
else{this._mesh.calcTexCoords();}
if(hasColor){this._mesh._colors=colors;}
this._mesh.remapData();}
this._mesh._invalidate=true;var t1=new Date().getTime()-t0;}));x3dom.registerNodeType("X3DFontStyleNode","base",defineClass(x3dom.nodeTypes.X3DNode,function(ctx){x3dom.nodeTypes.X3DFontStyleNode.superClass.call(this,ctx);}));x3dom.registerNodeType("FontStyle","Text",defineClass(x3dom.nodeTypes.X3DFontStyleNode,function(ctx){x3dom.nodeTypes.FontStyle.superClass.call(this,ctx);this._attribute_MFString(ctx,'family',['SERIF']);this._attribute_SFFloat(ctx,'size',1.0);}));x3dom.registerNodeType("X3DChildNode","base",defineClass(x3dom.nodeTypes.X3DNode,function(ctx){x3dom.nodeTypes.X3DChildNode.superClass.call(this,ctx);}));x3dom.registerNodeType("X3DBindableNode","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DBindableNode.superClass.call(this,ctx);}));x3dom.registerNodeType("Viewpoint","Navigation",defineClass(x3dom.nodeTypes.X3DBindableNode,function(ctx){x3dom.nodeTypes.Viewpoint.superClass.call(this,ctx);this._attribute_SFFloat(ctx,'fieldOfView',0.785398);this._attribute_SFVec3(ctx,'position',0,0,10);this._attribute_SFRotation(ctx,'orientation',0,0,0,1);this._attribute_SFVec3(ctx,'centerOfRotation',0,0,0);this._attribute_SFFloat(ctx,'zNear',0.1);this._attribute_SFFloat(ctx,'zFar',100000);this._viewMatrix=this._orientation.toMatrix().transpose().mult(x3dom.fields.SFMatrix4.translation(this._position.negate()));this._projMatrix=null;},{getCenterOfRotation:function(){return this._centerOfRotation;},getViewMatrix:function(){return this._viewMatrix;},getFieldOfView:function(){return this._fieldOfView;},getProjectionMatrix:function(aspect)
{if(this._projMatrix==null)
{var fovy=this._fieldOfView;var zfar=this._zFar;var znear=this._zNear;var f=1/Math.tan(fovy/2);this._projMatrix=new x3dom.fields.SFMatrix4(f/aspect,0,0,0,0,f,0,0,0,0,(znear+zfar)/(znear-zfar),2*znear*zfar/(znear-zfar),0,0,-1,0);}
return this._projMatrix;}}));x3dom.registerNodeType("NavigationInfo","Navigation",defineClass(x3dom.nodeTypes.X3DBindableNode,function(ctx){x3dom.nodeTypes.NavigationInfo.superClass.call(this,ctx);this._attribute_SFBool(ctx,'headlight',true);this._attribute_MFString(ctx,'type',["EXAMINE"]);x3dom.debug.logInfo("NavType: "+this._type[0].toLowerCase());},{}));x3dom.registerNodeType("WorldInfo","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.WorldInfo.superClass.call(this,ctx);this._attribute_MFString(ctx,'info',[]);this._attribute_SFString(ctx,'title',"");x3dom.debug.logInfo(this._info);x3dom.debug.logInfo(this._title);},{}));x3dom.registerNodeType("Background","EnvironmentalEffects",defineClass(x3dom.nodeTypes.X3DBindableNode,function(ctx){x3dom.nodeTypes.Background.superClass.call(this,ctx);this._attribute_MFColor(ctx,'skyColor',new x3dom.fields.MFColor([new x3dom.fields.SFColor(0,0,0)]));this._attribute_SFFloat(ctx,'transparency',0);},{getSkyColor:function(){return this._skyColor;},getTransparency:function(){return this._transparency;}}));x3dom.registerNodeType("X3DLightNode","Lighting",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DLightNode.superClass.call(this,ctx);this._attribute_SFFloat(ctx,'ambientIntensity',0);this._attribute_SFColor(ctx,'color',1,1,1);this._attribute_SFFloat(ctx,'intensity',1);this._attribute_SFBool(ctx,'global',false);this._attribute_SFBool(ctx,'on',true);},{}));x3dom.registerNodeType("DirectionalLight","Lighting",defineClass(x3dom.nodeTypes.X3DLightNode,function(ctx){x3dom.nodeTypes.DirectionalLight.superClass.call(this,ctx);this._attribute_SFVec3(ctx,'direction',0,-1,0);},{}));x3dom.registerNodeType("X3DShapeNode","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DShapeNode.superClass.call(this,ctx);}));x3dom.registerNodeType("Shape","Shape",defineClass(x3dom.nodeTypes.X3DShapeNode,function(ctx){x3dom.nodeTypes.Shape.superClass.call(this,ctx);var appearance,geometry;Array.forEach(ctx.xmlNode.childNodes,function(node){if(x3dom.isX3DElement(node)){var child=ctx.setupNodePrototypes(node,ctx);if(child){if(x3dom.isa(child,x3dom.nodeTypes.X3DAppearanceNode)){ctx.assert(!appearance,'has <= 1 appearance node');appearance=child;}else if(x3dom.isa(child,x3dom.nodeTypes.X3DGeometryNode)){ctx.assert(!geometry,'has <= 1 geometry node');geometry=child;}else{ctx.log('unrecognised x3dom.Shape child node type '+node.localName);}}}});if(!appearance)
{var nodeType=x3dom.nodeTypes["Appearance"];appearance=new nodeType(ctx);}
ctx.assert(appearance&&geometry,'has appearance and geometry');this._appearance=appearance;this._geometry=geometry;},{_collectDrawableObjects:function(transform,out){out.push([transform,this]);},_getVolume:function(min,max,invalidate){return this._geometry._getVolume(min,max,invalidate);},_getCenter:function(){return this._geometry._getCenter();},_doIntersect:function(line){return this._geometry._doIntersect(line);},_isSolid:function(){return this._geometry._solid;},_getNodeByDEF:function(def){if(this._DEF==def)
return this;var found=null;if(this._appearance!==null){found=this._appearance._getNodeByDEF(def);if(found)
return found;}
if(this._geometry!==null){found=this._geometry._getNodeByDEF(def);if(found)
return found;}
return found;},_find:function(type){var c=null;if(this._appearance!==null){if(this._appearance.constructor==type)
return this._appearance;c=this._appearance._find(type);if(c)
return c;}
if(this._geometry!==null){if(this._geometry.constructor==type)
return this._geometry;c=this._geometry._find(type);if(c)
return c;}
return c;}}));x3dom.registerNodeType("X3DGroupingNode","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DGroupingNode.superClass.call(this,ctx);this._childNodes=[];this._autoChild=true;},{addChild:function(node){this._childNodes.push(node);node._parentNodes.push(this);}}));x3dom.registerNodeType("Transform","Grouping",defineClass(x3dom.nodeTypes.X3DGroupingNode,function(ctx){x3dom.nodeTypes.Transform.superClass.call(this,ctx);this._attribute_SFVec3(ctx,'center',0,0,0);this._attribute_SFVec3(ctx,'translation',0,0,0);this._attribute_SFRotation(ctx,'rotation',0,0,0,1);this._attribute_SFVec3(ctx,'scale',1,1,1);this._attribute_SFRotation(ctx,'scaleOrientation',0,0,0,1);this._trafo=x3dom.fields.SFMatrix4.translation(this._translation).mult(x3dom.fields.SFMatrix4.translation(this._center)).mult(this._rotation.toMatrix()).mult(this._scaleOrientation.toMatrix()).mult(x3dom.fields.SFMatrix4.scale(this._scale)).mult(this._scaleOrientation.toMatrix().inverse()).mult(x3dom.fields.SFMatrix4.translation(this._center.negate()));},{_transformMatrix:function(transform){this._trafo=x3dom.fields.SFMatrix4.translation(this._translation).mult(x3dom.fields.SFMatrix4.translation(this._center)).mult(this._rotation.toMatrix()).mult(this._scaleOrientation.toMatrix()).mult(x3dom.fields.SFMatrix4.scale(this._scale)).mult(this._scaleOrientation.toMatrix().inverse()).mult(x3dom.fields.SFMatrix4.translation(this._center.negate()));return transform.mult(this._trafo);},_getVolume:function(min,max,invalidate)
{var nMin=new x3dom.fields.SFVec3(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);var nMax=new x3dom.fields.SFVec3(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE);var valid=false;for(var i=0;i<this._childNodes.length;i++)
{if(this._childNodes[i])
{var childMin=new x3dom.fields.SFVec3(0,0,0);var childMax=new x3dom.fields.SFVec3(0,0,0);valid=this._childNodes[i]._getVolume(childMin,childMax,invalidate)||valid;if(valid)
{if(nMin.x>childMin.x)nMin.x=childMin.x;if(nMin.y>childMin.y)nMin.y=childMin.y;if(nMin.z>childMin.z)nMin.z=childMin.z;if(nMax.x<childMax.x)nMax.x=childMax.x;if(nMax.y<childMax.y)nMax.y=childMax.y;if(nMax.z<childMax.z)nMax.z=childMax.z;}}}
if(valid)
{nMin=this._trafo.multMatrixPnt(nMin);nMax=this._trafo.multMatrixPnt(nMax);min.x=nMin.x;min.y=nMin.y;min.z=nMin.z;max.x=nMax.x;max.y=nMax.y;max.z=nMax.z;}
return valid;},_doIntersect:function(line)
{var isect=false;var mat=this._trafo.inverse();var tmpPos=new x3dom.fields.SFVec3(line.pos.x,line.pos.y,line.pos.z);var tmpDir=new x3dom.fields.SFVec3(line.dir.x,line.dir.y,line.dir.z);line.pos=mat.multMatrixPnt(line.pos);line.dir=mat.multMatrixVec(line.dir);for(var i=0;i<this._childNodes.length;i++)
{if(this._childNodes[i])
{isect=this._childNodes[i]._doIntersect(line);if(isect)
{line.hitPoint=this._trafo.multMatrixPnt(line.hitPoint);break;}}}
line.pos=new x3dom.fields.SFVec3(tmpPos.x,tmpPos.y,tmpPos.z);line.dir=new x3dom.fields.SFVec3(tmpDir.x,tmpDir.y,tmpDir.z);return isect;}}));x3dom.registerNodeType("Group","Grouping",defineClass(x3dom.nodeTypes.X3DGroupingNode,function(ctx){x3dom.nodeTypes.Group.superClass.call(this,ctx);},{}));x3dom.registerNodeType("X3DInterpolatorNode","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DInterpolatorNode.superClass.call(this,ctx);if(ctx.xmlNode.hasAttribute('key'))
this._key=Array.map(ctx.xmlNode.getAttribute('key').split(/\s+/),function(n){return+n;});else
this._key=[];},{_linearInterp:function(t,interp){if(t<=this._key[0])
return this._keyValue[0];if(t>=this._key[this._key.length-1])
return this._keyValue[this._key.length-1];for(var i=0;i<this._key.length-1;++i)
if(this._key[i]<t&&t<=this._key[i+1])
return interp(this._keyValue[i],this._keyValue[i+1],(t-this._key[i])/(this._key[i+1]-this._key[i]));}}));x3dom.registerNodeType("OrientationInterpolator","Interpolation",defineClass(x3dom.nodeTypes.X3DInterpolatorNode,function(ctx){x3dom.nodeTypes.OrientationInterpolator.superClass.call(this,ctx);if(ctx.xmlNode.hasAttribute('keyValue'))
this._keyValue=x3dom.fields.MFRotation.parse(ctx.xmlNode.getAttribute('keyValue'));else
this._keyValue=[];this._fieldWatchers.set_fraction=[function(msg){var value=this._linearInterp(msg,function(a,b,t){return a.slerp(b,t);});this._postMessage('value_changed',value);}];}));x3dom.registerNodeType("PositionInterpolator","Interpolation",defineClass(x3dom.nodeTypes.X3DInterpolatorNode,function(ctx){x3dom.nodeTypes.PositionInterpolator.superClass.call(this,ctx);if(ctx.xmlNode.hasAttribute('keyValue'))
this._keyValue=x3dom.fields.MFVec3.parse(ctx.xmlNode.getAttribute('keyValue'));else
this._keyValue=[];this._fieldWatchers.set_fraction=[function(msg){var value=this._linearInterp(msg,function(a,b,t){return a.scale(1.0-t).add(b.scale(t));});this._postMessage('value_changed',value);}];}));x3dom.registerNodeType("ScalarInterpolator","Interpolation",defineClass(x3dom.nodeTypes.X3DInterpolatorNode,function(ctx){x3dom.nodeTypes.ScalarInterpolator.superClass.call(this,ctx);if(ctx.xmlNode.hasAttribute('keyValue'))
this._keyValue=Array.map(ctx.xmlNode.getAttribute('keyValue').split(/\s+/),function(n){return+n;});else
this._keyValue=[];this._fieldWatchers.set_fraction=[function(msg){var value=this._linearInterp(msg,function(a,b,t){return(1.0-t)*a+t*b;});this._postMessage('value_changed',value);}];}));x3dom.registerNodeType("X3DSensorNode","base",defineClass(x3dom.nodeTypes.X3DChildNode,function(ctx){x3dom.nodeTypes.X3DSensorNode.superClass.call(this,ctx);}));x3dom.registerNodeType("TimeSensor","Time",defineClass(x3dom.nodeTypes.X3DSensorNode,function(ctx){x3dom.nodeTypes.TimeSensor.superClass.call(this,ctx);this._attribute_SFBool(ctx,'enabled',true);this._attribute_SFTime(ctx,'cycleInterval',1);this._attribute_SFBool(ctx,'loop',false);this._attribute_SFTime(ctx,'startTime',0);this._fraction=0;},{_onframe:function(ts){if(!this._enabled)
return;var isActive=(ts>=this._startTime);var cycleFrac,cycle,fraction;if(this._cycleInterval>0){cycleFrac=(ts-this._startTime)/this._cycleInterval;cycle=Math.floor(cycleFrac);fraction=cycleFrac-cycle;}
this._postMessage('fraction_changed',fraction);},}));x3dom.registerNodeType("Scene","base",defineClass(x3dom.nodeTypes.X3DGroupingNode,function(ctx){x3dom.nodeTypes.Scene.superClass.call(this,ctx);this._rotMat=x3dom.fields.SFMatrix4.identity();this._transMat=x3dom.fields.SFMatrix4.identity();this._movement=new x3dom.fields.SFVec3(0,0,0);this._width=400;this._height=300;this._lastX=-1;this._lastY=-1;this._pick=new x3dom.fields.SFVec3(0,0,0);this._ctx=ctx;this._cam=null;this._bgnd=null;this._navi=null;this._lights=[];},{getViewpoint:function()
{if(this._cam==null)
{this._cam=this._find(x3dom.nodeTypes.Viewpoint);if(!this._cam)
{var nodeType=x3dom.nodeTypes["Viewpoint"];this._cam=new nodeType(this._ctx);x3dom.debug.logInfo("Created ViewBindable.");}}
return this._cam;},getLights:function()
{if(this._lights.length==0)
this._lights=this._findAll(x3dom.nodeTypes.DirectionalLight);return this._lights;},getNavInfo:function()
{if(this._navi==null)
{this._navi=this._find(x3dom.nodeTypes.NavigationInfo);if(!this._navi)
{var nodeType=x3dom.nodeTypes["NavigationInfo"];this._navi=new nodeType(this._ctx);x3dom.debug.logInfo("Created UserBindable.");}}
return this._navi;},getVolume:function(min,max,invalidate)
{var MIN=new x3dom.fields.SFVec3(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);var MAX=new x3dom.fields.SFVec3(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE);var valid=this._getVolume(MIN,MAX,invalidate);min.x=MIN.x;min.y=MIN.y;min.z=MIN.z;max.x=MAX.x;max.y=MAX.y;max.z=MAX.z;return valid;},getViewpointMatrix:function()
{var viewpoint=this.getViewpoint();var mat_viewpoint=viewpoint._getCurrentTransform();return mat_viewpoint.mult(viewpoint.getViewMatrix());},getViewMatrix:function()
{return this.getViewpointMatrix().mult(this._transMat).mult(this._rotMat);},getSkyColor:function()
{if(this._bgnd==null)
{this._bgnd=this._find(x3dom.nodeTypes.Background);if(!this._bgnd)
{var nodeType=x3dom.nodeTypes["Background"];this._bgnd=new nodeType(this._ctx);x3dom.debug.logInfo("Created BackgroundBindable.");}}
var bgCol=this._bgnd.getSkyColor().toGL();if(bgCol.length>2)
bgCol[3]=1.0-this._bgnd.getTransparency();return bgCol;},getProjectionMatrix:function()
{var viewpoint=this.getViewpoint();return viewpoint.getProjectionMatrix(this._width/this._height);},getWCtoCCMatrix:function()
{var view=this.getViewMatrix();var proj=this.getProjectionMatrix();return proj.mult(view);},getCCtoWCMatrix:function()
{var mat=this.getWCtoCCMatrix();return mat.inverse();},calcViewRay:function(x,y)
{var cctowc=this.getCCtoWCMatrix();var rx=x/(this._width-1.0)*2.0-1.0;var ry=(this._height-1.0-y)/(this._height-1.0)*2.0-1.0;var from=cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3(rx,ry,-1));var at=cctowc.multFullMatrixPnt(new x3dom.fields.SFVec3(rx,ry,1));var dir=at.subtract(from);return new x3dom.fields.Line(from,dir);},onMousePress:function(x,y,buttonState)
{this._lastX=x;this._lastY=y;var line=this.calcViewRay(x,y);var isect=this._doIntersect(line);if(isect)
{this._pick.x=line.hitPoint.x;this._pick.y=line.hitPoint.y;this._pick.z=line.hitPoint.z;x3dom.debug.logInfo("Ray hit at position "+this._pick);}
else
{var dir=this.getViewMatrix().e2().negate();var u=dir.dot(line.pos.negate())/dir.dot(line.dir);this._pick=line.pos.add(line.dir.scale(u));}},onMouseRelease:function(x,y,buttonState)
{this._lastX=x;this._lastY=y;},onDoubleClick:function(x,y)
{var navi=this.getNavInfo();if(navi._type[0].length<=1||navi._type[0].toLowerCase()=="none")
return;var viewpoint=this.getViewpoint();viewpoint._centerOfRotation.x=this._pick.x;viewpoint._centerOfRotation.y=this._pick.y;viewpoint._centerOfRotation.z=this._pick.z;x3dom.debug.logInfo("New center of Rotation:  "+this._pick);},ondrag:function(x,y,buttonState)
{var navi=this.getNavInfo();if(navi._type[0].length<=1||navi._type[0].toLowerCase()=="none")
return;var dx=x-this._lastX;var dy=y-this._lastY;if(buttonState&1)
{var alpha=(dy*2*Math.PI)/this._width;var beta=(dx*2*Math.PI)/this._height;var mat=this.getViewMatrix();var mx=x3dom.fields.SFMatrix4.rotationX(alpha);var my=x3dom.fields.SFMatrix4.rotationY(beta);var viewpoint=this.getViewpoint();var center=viewpoint.getCenterOfRotation();mat.setTranslate(new x3dom.fields.SFVec3(0,0,0));this._rotMat=this._rotMat.mult(x3dom.fields.SFMatrix4.translation(center)).mult(mat.inverse()).mult(mx).mult(my).mult(mat).mult(x3dom.fields.SFMatrix4.translation(center.negate()));}
if(buttonState&4)
{var min=new x3dom.fields.SFVec3(0,0,0);var max=new x3dom.fields.SFVec3(0,0,0);var ok=this.getVolume(min,max,true);var d=ok?(max.subtract(min)).length():10;var vec=new x3dom.fields.SFVec3(d*dx/this._width,d*(-dy)/this._height,0);this._movement=this._movement.add(vec);var viewpoint=this.getViewpoint();this._transMat=viewpoint.getViewMatrix().inverse().mult(x3dom.fields.SFMatrix4.translation(this._movement)).mult(viewpoint.getViewMatrix());}
if(buttonState&2)
{var min=new x3dom.fields.SFVec3(0,0,0);var max=new x3dom.fields.SFVec3(0,0,0);var ok=this.getVolume(min,max,true);var d=ok?(max.subtract(min)).length():10;var vec=new x3dom.fields.SFVec3(0,0,d*(dx+dy)/this._height);this._movement=this._movement.add(vec);var viewpoint=this.getViewpoint();this._transMat=viewpoint.getViewMatrix().inverse().mult(x3dom.fields.SFMatrix4.translation(this._movement)).mult(viewpoint.getViewMatrix());}
this._lastX=x;this._lastY=y;}}));x3dom.registerNodeType("Anchor","Networking",defineClass(x3dom.nodeTypes.X3DGroupingNode,function(ctx){x3dom.nodeTypes.Anchor.superClass.call(this,ctx);this._attribute_MFString(ctx,'url',[]);},{_doIntersect:function(line){var isect=false;for(var i=0;i<this._childNodes.length;i++){if(this._childNodes[i]){if(this._childNodes[i]._doIntersect(line)){isect=true;}}}
if(isect&&this._url.length>0){window.location=this._url[0];}
return isect;}}));x3dom.registerNodeType("Inline","Networking",defineClass(x3dom.nodeTypes.X3DGroupingNode,function(ctx){x3dom.nodeTypes.Inline.superClass.call(this,ctx);this._attribute_MFString(ctx,'url',[]);this._attribute_SFBool(ctx,'load',true);var that=this;var xhr=new XMLHttpRequest();xhr.overrideMimeType('text/xml');xhr.onreadystatechange=function(){if(xhr.readyState==4){if(xhr.responseXML.documentElement.localName=='parsererror'){x3dom.debug.logInfo('XML parser failed on '+this._url+':\n'+xhr.responseXML.documentElement.textContent);return;}}
else{x3dom.debug.logInfo('Loading inlined data... (readyState: '+xhr.readyState+')');return;}
if(xhr.status!==200){x3dom.debug.logError('XMLHttpRequest requires a web server running!');return;}
x3dom.debug.logInfo('Inline: downloading '+that._url+' done.');var xml=xhr.responseXML;var inlScene=xml.getElementsByTagName('Scene')[0];x3dom.parsingInline=true;that._childNodes=[ctx.setupNodePrototypes(inlScene,ctx)];that._childNodes[0]._parentNodes.push(that);x3dom.parsingInline=false;x3dom.debug.logInfo('Inline: added '+that._url+' to scene.');};x3dom.debug.logInfo('Inline: downloading '+this._url);xhr.open('GET',this._url,true);xhr.send(null);},{}));x3dom.X3DDocument=function(canvas,ctx){this.canvas=canvas;this.ctx=ctx;this.onload=function(){};this.onerror=function(){};}
x3dom.X3DDocument.prototype.load=function(uri,sceneElemPos){var uri_docs={};var queued_uris=[uri];var doc=this;function next_step(){if(queued_uris.length==0){doc._setup(uri_docs[uri],uri_docs,sceneElemPos);doc.onload();return;}
var next_uri=queued_uris.shift();if(x3dom.isX3DElement(next_uri)&&next_uri.localName=='X3D'){uri_docs[next_uri]=next_uri;next_step();}}
next_step();}
x3dom.xpath=function(doc,expr,node){var xpe=new XPathEvaluator();function nsResolver(prefix){var ns={'x3d':x3dom.x3dNS,};return ns[prefix]||null;}
var result=xpe.evaluate(expr,node||doc,nsResolver,0,null);var res,found=[];while(res=result.iterateNext())
found.push(res);return found;}
x3dom.X3DDocument.prototype._setup=function(sceneDoc,uriDocs,sceneElemPos){var ctx={defMap:{},docs:uriDocs,setupNodePrototypes:this._setupNodePrototypes,assert:x3dom.debug.assert,log:x3dom.debug.logInfo,};var doc=this;x3dom.debug.logInfo("Loading scene #"+sceneElemPos+" from "+x3dom.xpath(sceneDoc,'//x3d:Scene',sceneDoc).length+".");var scene=this._setupNodePrototypes(x3dom.xpath(sceneDoc,'//x3d:Scene',sceneDoc)[sceneElemPos],ctx);if(sceneElemPos==0)
scene._routes=Array.map(x3dom.xpath(sceneDoc,'//x3d:ROUTE',null),function(route){var fromNode=scene._getNodeByDEF(route.getAttribute('fromNode'));var toNode=scene._getNodeByDEF(route.getAttribute('toNode'));if(!(fromNode&&toNode)){x3dom.debug.logInfo("Broken route - can't find all DEFs for "+route.getAttribute('fromNode')+" -> "+route.getAttribute('toNode'));return;}
fromNode._setupRoute(route.getAttribute('fromField'),toNode,route.getAttribute('toField'));});var domEventListener={onAttrModified:function(e){var attrToString={1:"MODIFICATION",2:"ADDITION",3:"REMOVAL"};e.target._x3domNode._updateField(e.attrName,e.newValue);},onNodeRemoved:function(e){x3dom.debug.logInfo("MUTATION: "+e+", "+e.type+", removed node="+e.target.tagName);},onNodeInserted:function(e){var parent=e.target.parentNode._x3domNode;var child=e.target;x3dom.parsingInline=true;var newChild=scene._ctx.setupNodePrototypes(child,scene._ctx);parent._childNodes.push(newChild);newChild._parentNodes.push(parent);x3dom.parsingInline=false;}};sceneDoc.addEventListener('DOMNodeRemoved',domEventListener.onNodeRemoved,true);sceneDoc.addEventListener('DOMNodeInserted',domEventListener.onNodeInserted,true);sceneDoc.addEventListener('DOMAttrModified',domEventListener.onAttrModified,true);this._scene=scene;this._scene._width=this.canvas.width;this._scene._height=this.canvas.height;};x3dom.X3DDocument.prototype._setupNodePrototypes=function(node,ctx){var n,t;if(x3dom.isX3DElement(node)){if(node.hasAttribute('USE')){n=ctx.defMap[node.getAttribute('USE')];if(n==null)
ctx.log('Could not USE: '+node.getAttribute('USE'));return n;}
else{if(node.localName=='ROUTE')
return n;var nodeType=x3dom.nodeTypes[node.localName];if(nodeType===undefined){x3dom.debug.logInfo("Unrecognised element "+node.localName);}
else{ctx.xmlNode=node;n=new nodeType(ctx);node._x3domNode=n;if(n._autoChild===true){Array.forEach(Array.map(node.childNodes,function(n){return ctx.setupNodePrototypes(n,ctx)},this),function(c){if(c)n.addChild(c)});}
return n;}}}};x3dom.X3DDocument.prototype.advanceTime=function(t){if(this._scene){Array.forEach(this._scene._findAll(x3dom.nodeTypes.TimeSensor),function(timer){timer._onframe(t);});}};x3dom.X3DDocument.prototype.render=function(ctx){if(!ctx)
return;ctx.renderScene(this._scene);}
x3dom.X3DDocument.prototype.ondrag=function(x,y,buttonState){this._scene.ondrag(x,y,buttonState);}
x3dom.X3DDocument.prototype.onMousePress=function(x,y,buttonState){this._scene.onMousePress(x,y,buttonState);}
x3dom.X3DDocument.prototype.onMouseRelease=function(x,y,buttonState){this._scene.onMouseRelease(x,y,buttonState);}
x3dom.X3DDocument.prototype.onDoubleClick=function(x,y){this._scene.onDoubleClick(x,y);}
x3dom.X3DDocument.prototype.onKeyPress=function(charCode)
{switch(charCode)
{case 97:break;case 109:{if(this._scene._points===undefined)
this._scene._points=true;else
this._scene._points=!this._scene._points;}
break;case 114:{this._scene._rotMat=x3dom.fields.SFMatrix4.identity();this._scene._transMat=x3dom.fields.SFMatrix4.identity();this._scene._movement=new x3dom.fields.SFVec3(0,0,0);}
break;default:}}
x3dom.X3DDocument.prototype.shutdown=function(ctx)
{if(!ctx)
return;ctx.shutdown(this._scene);}
x3dom.fields={};x3dom.fields.SFMatrix4=function(_00,_01,_02,_03,_10,_11,_12,_13,_20,_21,_22,_23,_30,_31,_32,_33){if(arguments.length==0){this._00=1;this._01=0;this._02=0;this._03=0;this._10=0;this._11=1;this._12=0;this._13=0;this._20=0;this._21=0;this._22=1;this._23=0;this._30=0;this._31=0;this._32=0;this._33=1;}else{this._00=_00;this._01=_01;this._02=_02;this._03=_03;this._10=_10;this._11=_11;this._12=_12;this._13=_13;this._20=_20;this._21=_21;this._22=_22;this._23=_23;this._30=_30;this._31=_31;this._32=_32;this._33=_33;}}
x3dom.fields.SFMatrix4.prototype.e0=function(){var baseVec=new x3dom.fields.SFVec3(this._00,this._10,this._20);return baseVec.normalised();}
x3dom.fields.SFMatrix4.prototype.e1=function(){var baseVec=new x3dom.fields.SFVec3(this._01,this._11,this._21);return baseVec.normalised();}
x3dom.fields.SFMatrix4.prototype.e2=function(){var baseVec=new x3dom.fields.SFVec3(this._02,this._12,this._22);return baseVec.normalised();}
x3dom.fields.SFMatrix4.prototype.e3=function(){return new x3dom.fields.SFVec3(this._03,this._13,this._23);}
x3dom.fields.SFMatrix4.identity=function(){return new x3dom.fields.SFMatrix4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);}
x3dom.fields.SFMatrix4.translation=function(vec){return new x3dom.fields.SFMatrix4(1,0,0,vec.x,0,1,0,vec.y,0,0,1,vec.z,0,0,0,1);}
x3dom.fields.SFMatrix4.rotationX=function(a){var c=Math.cos(a);var s=Math.sin(a);return new x3dom.fields.SFMatrix4(1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1);}
x3dom.fields.SFMatrix4.rotationY=function(a){var c=Math.cos(a);var s=Math.sin(a);return new x3dom.fields.SFMatrix4(c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1);}
x3dom.fields.SFMatrix4.rotationZ=function(a){var c=Math.cos(a);var s=Math.sin(a);return new x3dom.fields.SFMatrix4(c,-s,0,0,s,c,0,0,0,0,1,0,0,0,0,1);}
x3dom.fields.SFMatrix4.scale=function(vec){return new x3dom.fields.SFMatrix4(vec.x,0,0,0,0,vec.y,0,0,0,0,vec.z,0,0,0,0,1);}
x3dom.fields.SFMatrix4.prototype.setTranslate=function(vec){this._03=vec.x;this._13=vec.y;this._23=vec.z;}
x3dom.fields.SFMatrix4.prototype.setScale=function(vec){this._00=vec.x;this._11=vec.y;this._22=vec.z;}
x3dom.fields.SFMatrix4.parseRotation=function(str){var m=/^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(str);var x=+m[1],y=+m[2],z=+m[3],a=+m[4];var d=Math.sqrt(x*x+y*y+z*z);if(d==0){x=1;y=z=0;}else{x/=d;y/=d;z/=d;}
var c=Math.cos(a);var s=Math.sin(a);var t=1-c;return new x3dom.fields.SFMatrix4(t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1).transpose();}
x3dom.fields.SFMatrix4.prototype.mult=function(that){return new x3dom.fields.SFMatrix4(this._00*that._00+this._01*that._10+this._02*that._20+this._03*that._30,this._00*that._01+this._01*that._11+this._02*that._21+this._03*that._31,this._00*that._02+this._01*that._12+this._02*that._22+this._03*that._32,this._00*that._03+this._01*that._13+this._02*that._23+this._03*that._33,this._10*that._00+this._11*that._10+this._12*that._20+this._13*that._30,this._10*that._01+this._11*that._11+this._12*that._21+this._13*that._31,this._10*that._02+this._11*that._12+this._12*that._22+this._13*that._32,this._10*that._03+this._11*that._13+this._12*that._23+this._13*that._33,this._20*that._00+this._21*that._10+this._22*that._20+this._23*that._30,this._20*that._01+this._21*that._11+this._22*that._21+this._23*that._31,this._20*that._02+this._21*that._12+this._22*that._22+this._23*that._32,this._20*that._03+this._21*that._13+this._22*that._23+this._23*that._33,this._30*that._00+this._31*that._10+this._32*that._20+this._33*that._30,this._30*that._01+this._31*that._11+this._32*that._21+this._33*that._31,this._30*that._02+this._31*that._12+this._32*that._22+this._33*that._32,this._30*that._03+this._31*that._13+this._32*that._23+this._33*that._33);}
x3dom.fields.SFMatrix4.prototype.multMatrixPnt=function(vec){return new x3dom.fields.SFVec3(this._00*vec.x+this._01*vec.y+this._02*vec.z+this._03,this._10*vec.x+this._11*vec.y+this._12*vec.z+this._13,this._20*vec.x+this._21*vec.y+this._22*vec.z+this._23);}
x3dom.fields.SFMatrix4.prototype.multMatrixVec=function(vec){return new x3dom.fields.SFVec3(this._00*vec.x+this._01*vec.y+this._02*vec.z,this._10*vec.x+this._11*vec.y+this._12*vec.z,this._20*vec.x+this._21*vec.y+this._22*vec.z);}
x3dom.fields.SFMatrix4.prototype.multFullMatrixPnt=function(vec){var w=this._30*vec.x+this._31*vec.y+this._32*vec.z+this._33;if(w)w=1.0/w;return new x3dom.fields.SFVec3((this._00*vec.x+this._01*vec.y+this._02*vec.z+this._03)*w,(this._10*vec.x+this._11*vec.y+this._12*vec.z+this._13)*w,(this._20*vec.x+this._21*vec.y+this._22*vec.z+this._23)*w);}
x3dom.fields.SFMatrix4.prototype.transpose=function(){return new x3dom.fields.SFMatrix4(this._00,this._10,this._20,this._30,this._01,this._11,this._21,this._31,this._02,this._12,this._22,this._32,this._03,this._13,this._23,this._33);}
x3dom.fields.SFMatrix4.prototype.toGL=function(){return[this._00,this._10,this._20,this._30,this._01,this._11,this._21,this._31,this._02,this._12,this._22,this._32,this._03,this._13,this._23,this._33];}
x3dom.fields.SFMatrix4.prototype.decompose=function(){var T=new SFVec3(this._03,this._13,this._23);var S=new SFVec3(1,1,1);var angle_x,angle_y,angle_y,tr_x,tr_y,C;angle_y=Math.asin(this._02);C=Math.cos(angle_y);if(Math.abs(C)>0.005){tr_x=this._22/C;tr_y=-this._12/C;angle_x=Math.atan2(tr_y,tr_x);tr_x=this._00/C;tr_y=-this._01/C;angle_z=Math.atan2(tr_y,tr_x);}else{angle_x=0;tr_x=this._11;tr_y=this._10;angle_z=Math.atan2(tr_y,tr_x);}
return[T,S,angle_x,angle_y,angle_z];}
x3dom.fields.SFMatrix4.prototype.det3=function(a1,a2,a3,b1,b2,b3,c1,c2,c3){var d=(a1*b2*c3)+(a2*b3*c1)+(a3*b1*c2)-
(a1*b3*c2)-(a2*b1*c3)-(a3*b2*c1);return d;}
x3dom.fields.SFMatrix4.prototype.det=function(){var a1,a2,a3,a4,b1,b2,b3,b4,c1,c2,c3,c4,d1,d2,d3,d4;a1=this._00;b1=this._10;c1=this._20;d1=this._30;a2=this._01;b2=this._11;c2=this._21;d2=this._31;a3=this._02;b3=this._12;c3=this._22;d3=this._32;a4=this._03;b4=this._13;c4=this._23;d4=this._33;var d=+a1*this.det3(b2,b3,b4,c2,c3,c4,d2,d3,d4)
-b1*this.det3(a2,a3,a4,c2,c3,c4,d2,d3,d4)
+c1*this.det3(a2,a3,a4,b2,b3,b4,d2,d3,d4)
-d1*this.det3(a2,a3,a4,b2,b3,b4,c2,c3,c4);return d;}
x3dom.fields.SFMatrix4.prototype.inverse=function(){var a1,a2,a3,a4,b1,b2,b3,b4,c1,c2,c3,c4,d1,d2,d3,d4;a1=this._00;b1=this._10;c1=this._20;d1=this._30;a2=this._01;b2=this._11;c2=this._21;d2=this._31;a3=this._02;b3=this._12;c3=this._22;d3=this._32;a4=this._03;b4=this._13;c4=this._23;d4=this._33;var rDet=this.det();if(Math.abs(rDet)<0.000001)
{x3dom.debug.logInfo("Invert matrix: singular matrix, no inverse!");return x3dom.fields.SFMatrix4.identity();}
rDet=1.0/rDet;return new x3dom.fields.SFMatrix4(+this.det3(b2,b3,b4,c2,c3,c4,d2,d3,d4)*rDet,-this.det3(a2,a3,a4,c2,c3,c4,d2,d3,d4)*rDet,+this.det3(a2,a3,a4,b2,b3,b4,d2,d3,d4)*rDet,-this.det3(a2,a3,a4,b2,b3,b4,c2,c3,c4)*rDet,-this.det3(b1,b3,b4,c1,c3,c4,d1,d3,d4)*rDet,+this.det3(a1,a3,a4,c1,c3,c4,d1,d3,d4)*rDet,-this.det3(a1,a3,a4,b1,b3,b4,d1,d3,d4)*rDet,+this.det3(a1,a3,a4,b1,b3,b4,c1,c3,c4)*rDet,+this.det3(b1,b2,b4,c1,c2,c4,d1,d2,d4)*rDet,-this.det3(a1,a2,a4,c1,c2,c4,d1,d2,d4)*rDet,+this.det3(a1,a2,a4,b1,b2,b4,d1,d2,d4)*rDet,-this.det3(a1,a2,a4,b1,b2,b4,c1,c2,c4)*rDet,-this.det3(b1,b2,b3,c1,c2,c3,d1,d2,d3)*rDet,+this.det3(a1,a2,a3,c1,c2,c3,d1,d2,d3)*rDet,-this.det3(a1,a2,a3,b1,b2,b3,d1,d2,d3)*rDet,+this.det3(a1,a2,a3,b1,b2,b3,c1,c2,c3)*rDet);}
x3dom.fields.SFMatrix4.prototype.toString=function(){return'[SFMatrix4 '+
this._00+', '+this._01+', '+this._02+', '+this._03+'; '+
this._10+', '+this._11+', '+this._12+', '+this._13+'; '+
this._20+', '+this._21+', '+this._22+', '+this._23+'; '+
this._30+', '+this._31+', '+this._32+', '+this._33+']';}
x3dom.fields.SFVec2=function(x,y){if(arguments.length==0){this.x=this.y=0;}else{this.x=x;this.y=y;}}
x3dom.fields.SFVec2.parse=function(str){var m=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)$/.exec(str);return new x3dom.fields.SFVec2(+m[1],+m[2]);}
x3dom.fields.SFVec2.prototype.add=function(that){return new x3dom.fields.SFVec2(this.x+that.x,this.y+that.y);}
x3dom.fields.SFVec2.prototype.subtract=function(that){return new x3dom.fields.SFVec2(this.x-that.x,this.y-that.y);}
x3dom.fields.SFVec2.prototype.negate=function(){return new x3dom.fields.SFVec2(-this.x,-this.y);}
x3dom.fields.SFVec2.prototype.dot=function(that){return this.x*that.x+this.y*that.y;}
x3dom.fields.SFVec2.prototype.reflect=function(n){var d2=this.dot(n)*2;return new x3dom.fields.SFVec2(this.x-d2*n.x,this.y-d2*n.y);}
x3dom.fields.SFVec2.prototype.normalised=function(that){var n=this.length();if(n)n=1.0/n;return new x3dom.fields.SFVec2(this.x*n,this.y*n);}
x3dom.fields.SFVec2.prototype.multiply=function(n){return new x3dom.fields.SFVec2(this.x*n,this.y*n);}
x3dom.fields.SFVec2.prototype.length=function(){return Math.sqrt((this.x*this.x)+(this.y*this.y));}
x3dom.fields.SFVec2.prototype.toGL=function(){return[this.x,this.y];}
x3dom.fields.SFVec2.prototype.toString=function(){return"{ x "+this.x+" y "+this.y+" }";}
x3dom.fields.SFVec2.prototype.setValueByStr=function(s){var m=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)$/.exec(s);this.x=+m[1];this.y=+m[2];return this;}
x3dom.fields.SFVec3=function(x,y,z){if(arguments.length==0){this.x=this.y=this.z=0;}else{this.x=x;this.y=y;this.z=z;}}
x3dom.fields.SFVec3.parse=function(str){var m=/^(\S+)\s+(\S+)\s+(\S+)$/.exec(str);return new x3dom.fields.SFVec3(+m[1],+m[2],+m[3]);}
x3dom.fields.SFVec3.prototype.add=function(that){return new x3dom.fields.SFVec3(this.x+that.x,this.y+that.y,this.z+that.z);}
x3dom.fields.SFVec3.prototype.subtract=function(that){return new x3dom.fields.SFVec3(this.x-that.x,this.y-that.y,this.z-that.z);}
x3dom.fields.SFVec3.prototype.negate=function(){return new x3dom.fields.SFVec3(-this.x,-this.y,-this.z);}
x3dom.fields.SFVec3.prototype.dot=function(that){return(this.x*that.x+this.y*that.y+this.z*that.z);}
x3dom.fields.SFVec3.prototype.cross=function(that){return new x3dom.fields.SFVec3(this.y*that.z-this.z*that.y,this.z*that.x-this.x*that.z,this.x*that.y-this.y*that.x);}
x3dom.fields.SFVec3.prototype.reflect=function(n){var d2=this.dot(n)*2;return new x3dom.fields.SFVec3(this.x-d2*n.x,this.y-d2*n.y,this.z-d2*n.z);}
x3dom.fields.SFVec3.prototype.length=function(){return Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));}
x3dom.fields.SFVec3.prototype.normalised=function(that){var n=this.length();if(n)n=1.0/n;return new x3dom.fields.SFVec3(this.x*n,this.y*n,this.z*n);}
x3dom.fields.SFVec3.prototype.scale=function(n){return new x3dom.fields.SFVec3(this.x*n,this.y*n,this.z*n);}
x3dom.fields.SFVec3.prototype.toGL=function(){return[this.x,this.y,this.z];}
x3dom.fields.SFVec3.prototype.toString=function(){return"{ x "+this.x+" y "+this.y+" z "+this.z+" }";}
x3dom.fields.Quaternion=function(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;}
x3dom.fields.Quaternion.prototype.mult=function(that){return new x3dom.fields.Quaternion(this.w*that.x+this.x*that.w+this.y*that.z-this.z*that.y,this.w*that.y+this.y*that.w+this.z*that.x-this.x*that.z,this.w*that.z+this.z*that.w+this.x*that.y-this.y*that.x,this.w*that.w-this.x*that.x-this.y*that.y-this.z*that.z);}
x3dom.fields.Quaternion.parseAxisAngle=function(str){var m=/^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/.exec(str);return x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3(+m[1],+m[2],+m[3]),+m[4]);}
x3dom.fields.Quaternion.axisAngle=function(axis,a){var t=axis.length();if(t>0.000001)
{var s=Math.sin(a/2)/t;var c=Math.cos(a/2);return new x3dom.fields.Quaternion(axis.x*s,axis.y*s,axis.z*s,c);}
else
{return new x3dom.fields.Quaternion(0,0,0,1);}}
x3dom.fields.Quaternion.prototype.toMatrix=function(){var xx=this.x*this.x*2;var xy=this.x*this.y*2;var xz=this.x*this.z*2;var yy=this.y*this.y*2;var yz=this.y*this.z*2;var zz=this.z*this.z*2;var wx=this.w*this.x*2;var wy=this.w*this.y*2;var wz=this.w*this.z*2;return new x3dom.fields.SFMatrix4(1-(yy+zz),xy-wz,xz+wy,0,xy+wz,1-(xx+zz),yz-wx,0,xz-wy,yz+wx,1-(xx+yy),0,0,0,0,1);}
x3dom.fields.Quaternion.prototype.dot=function(that){return this.x*that.x+this.y*that.y+this.z*that.z+this.w*that.w;}
x3dom.fields.Quaternion.prototype.add=function(that){return new x3dom.fields.Quaternion(this.x+that.x,this.y+that.y,this.z+that.z,this.w+that.w);}
x3dom.fields.Quaternion.prototype.subtract=function(that){return new x3dom.fields.Quaternion(this.x-that.x,this.y-that.y,this.z-that.z,this.w-that.w);}
x3dom.fields.Quaternion.prototype.multScalar=function(s){return new x3dom.fields.Quaternion(this.x*s,this.y*s,this.z*s,this.w*s);}
x3dom.fields.Quaternion.prototype.normalised=function(that){var d2=this.dot(that);var id=1.0;if(d2)id=1.0/Math.sqrt(d2);return new x3dom.fields.Quaternion(this.x*id,this.y*id,this.z*id,this.w*id);}
x3dom.fields.Quaternion.prototype.negate=function(){return new x3dom.fields.Quaternion(this.x,this.y,this.z,this.w);}
x3dom.fields.Quaternion.prototype.slerp=function(that,t){var cosom=this.dot(that);var rot1;if(cosom<0.0)
{cosom=-cosom;rot1=that.negate();}
else
{rot1=new x3dom.fields.Quaternion(that.x,that.y,that.z,that.w);}
var scalerot0,scalerot1;if((1.0-cosom)>0.00001)
{var omega=Math.acos(cosom);var sinom=Math.sin(omega);scalerot0=Math.sin((1.0-t)*omega)/sinom;scalerot1=Math.sin(t*omega)/sinom;}
else
{scalerot0=1.0-t;scalerot1=t;}
return this.multScalar(scalerot0).add(rot1.multScalar(scalerot1));}
x3dom.fields.Quaternion.prototype.toString=function(){return'(('+this.x+', '+this.y+', '+this.z+'), '+this.w+')';}
x3dom.fields.MFRotation=function(rotArray){if(arguments.length==0){}
else{rotArray.map(function(v){this.push(v);},this);}};x3dom.fields.MFRotation.prototype=new Array;x3dom.fields.MFRotation.parse=function(str){var mc=str.match(/([+-]?\d*\.?\d*\s*){4},?\s*/g);var vecs=[];for(var i=0;i<mc.length;++i){var c=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*),?\s*([+-]?\d*\.*\d*),?\s*$/.exec(mc[i]);if(c[0])
vecs.push(x3dom.fields.Quaternion.axisAngle(new x3dom.fields.SFVec3(+c[1],+c[2],+c[3]),+c[4]));}
return new x3dom.fields.MFRotation(vecs);}
x3dom.fields.MFRotation.prototype.toGL=function(){var a=[];return a;}
x3dom.fields.SFColor=function(r,g,b){if(arguments.length==0){this.r=this.g=this.b=0;}else{this.r=r;this.g=g;this.b=b;}}
x3dom.fields.SFColor.parse=function(str){var m=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)$/.exec(str);return new x3dom.fields.SFColor(+m[1],+m[2],+m[3]);}
x3dom.fields.SFColor.prototype.toGL=function(){return[this.r,this.g,this.b];}
x3dom.fields.SFColor.prototype.toString=function(){return"{ r "+this.r+" g "+this.g+" b "+this.b+" }";}
x3dom.fields.MFColor=function(colorArray){if(arguments.length==0){}
else{colorArray.map(function(c){this.push(c);},this);}};x3dom.fields.MFColor.prototype=new Array;x3dom.fields.MFColor.parse=function(str){var mc=str.match(/([+-]?\d*\.?\d*\s*){3},?\s*/g);var colors=[];for(var i=0;i<mc.length;++i){var c=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*),?\s*$/.exec(mc[i]);if(c[0])
colors.push(new x3dom.fields.SFColor(+c[1],+c[2],+c[3]));}
return new x3dom.fields.MFColor(colors);}
x3dom.fields.MFColor.prototype.toGL=function(){var a=[];Array.map(this,function(c){a.push(c.r);a.push(c.g);a.push(c.b);});return a;}
x3dom.fields.MFVec3=function(vec3Array){if(arguments.length==0){}
else{vec3Array.map(function(v){this.push(v);},this);}};x3dom.fields.MFVec3.prototype=new Array;x3dom.fields.MFVec3.parse=function(str){var mc=str.match(/([+-]?\d*\.?\d*\s*){3},?\s*/g);var vecs=[];for(var i=0;i<mc.length;++i){var c=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*),?\s*$/.exec(mc[i]);if(c[0])
vecs.push(new x3dom.fields.SFVec3(+c[1],+c[2],+c[3]));}
return new x3dom.fields.MFVec3(vecs);}
x3dom.fields.MFVec3.prototype.toGL=function(){var a=[];Array.map(this,function(c){a.push(c.x);a.push(c.y);a.push(c.z);});return a;}
x3dom.fields.MFVec2=function(vec2Array){if(arguments.length==0){}
else{vec2Array.map(function(v){this.push(v);},this);}};x3dom.fields.MFVec2.prototype=new Array;x3dom.fields.MFVec2.parse=function(str){var mc=str.match(/([+-]?\d*\.?\d*\s*){2},?\s*/g);var vecs=[];for(var i=0;i<mc.length;++i){var c=/^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*$/.exec(mc[i]);if(c[0])
vecs.push(new x3dom.fields.SFVec2(+c[1],+c[2]));}
return new x3dom.fields.MFVec2(vecs);}
x3dom.fields.MFVec2.prototype.toGL=function(){var a=[];Array.map(this,function(v){a.push(v.x);a.push(v.y);});return a;}
x3dom.fields.Line=function(pos,dir)
{if(arguments.length==0)
{this.pos=new x3dom.fields.SFVec3(0,0,0);this.dir=new x3dom.fields.SFVec3(0,0,1);this.t=1;}
else
{this.pos=new x3dom.fields.SFVec3(pos.x,pos.y,pos.z);var n=dir.length();this.t=n;if(n)n=1.0/n;this.dir=new x3dom.fields.SFVec3(dir.x*n,dir.y*n,dir.z*n);}}
x3dom.fields.Line.prototype.toString=function(){var str='Line: ['+this.pos.toString()+'; '+this.dir.toString()+']';return str;}
x3dom.fields.Line.prototype.intersect=function(low,high)
{var Eps=0.000001;var isect=0.0;var out=Number.MAX_VALUE;var r,te,tl;if(this.dir.x>Eps)
{r=1.0/this.dir.x;te=(low.x-this.pos.x)*r;tl=(high.x-this.pos.x)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;}
else if(this.dir.x<-Eps)
{r=1.0/this.dir.x;te=(high.x-this.pos.x)*r;tl=(low.x-this.pos.x)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;}
else if(this.pos.x<low.x||this.pos.x>high.x)
{return false;}
if(this.dir.y>Eps)
{r=1.0/this.dir.y;te=(low.y-this.pos.y)*r;tl=(high.y-this.pos.y)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;if(isect-out>=Eps)
return false;}
else if(this.dir.y<-Eps)
{r=1.0/this.dir.y;te=(high.y-this.pos.y)*r;tl=(low.y-this.pos.y)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;if(isect-out>=Eps)
return false;}
else if(this.pos.y<low.y||this.pos.y>high.y)
{return false;}
if(this.dir.z>Eps)
{r=1.0/this.dir.z;te=(low.z-this.pos.z)*r;tl=(high.z-this.pos.z)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;}
else if(this.dir.z<-Eps)
{r=1.0/this.dir.z;te=(high.z-this.pos.z)*r;tl=(low.z-this.pos.z)*r;if(tl<out)
out=tl;if(te>isect)
isect=te;}
else if(this.pos.z<low.z||this.pos.z>high.z)
{return false;}
this.enter=isect;this.exit=out;return(isect-out<Eps);}