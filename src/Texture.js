/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Texture
 */
x3dom.Texture = function(gl, doc, cache, node)
{
	this.gl 			= gl;
	this.doc			= doc;
	this.cache			= cache;
	this.node 			= node;
	
	this.samplerName 	= "diffuseMap";
	this.type 			= gl.TEXTURE_2D;
	this.format			= gl.RGBA;
	this.magFilter		= gl.LINEAR;
	this.minFilter		= gl.LINEAR;
	this.wrapS			= gl.REPEAT;
	this.wrapT			= gl.REPEAT;
	this.genMipMaps		= false;
	this.texture		= null;
	
	this.update();
};

/**
 * 
 */
x3dom.Texture.prototype.update = function()
{
	if ( x3dom.isa(this.node, x3dom.nodeTypes.Text) )
	{
		this.updateText();
	}
	else
	{
		this.updateTexture();
	}
};

x3dom.Texture.prototype.updateTexture = function()
{
	var gl  = this.gl;
	var doc = this.doc;
	var tex = this.node;
	
	//Set sampler
	this.samplerName = tex._type;

	//Set texture type
	if ( x3dom.isa(tex, x3dom.nodeTypes.X3DEnvironmentTextureNode) ) {
		this.type = gl.TEXTURE_CUBE_MAP;
	} else {
		this.type = gl.TEXTURE_2D;
	}
	
	//Set texture format
	if (x3dom.isa(tex, x3dom.nodeTypes.PixelTexture)) {
		switch (tex._vf.image.comp)
		{
			case 1: this.format = gl.LUMINANCE; break;
			case 2: this.format = gl.LUMINANCE_ALPHA; break;
			case 3: this.format = gl.RGB; break;
			case 4: this.format = gl.RGBA; break;
		}
	} else {
		this.format = gl.RGBA;
	}
	
	//Looking for child texture
	var childTex = (tex._video !== undefined && 
					tex._video !== null && 
					tex._needPerFrameUpdate !== undefined && 
					tex._needPerFrameUpdate === true);
	
	//Set texture min, mag, wrapS and wrapT
	if (tex._cf.textureProperties.node !== null) {
		var texProp = tex._cf.textureProperties.node;
		
		this.wrapS = x3dom.Utils.boundaryModesDic(gl, texProp._vf.boundaryModeS.toUpperCase());
        this.wrapT = x3dom.Utils.boundaryModesDic(gl, texProp._vf.boundaryModeT.toUpperCase());

		this.minFilter = x3dom.Utils.minFilterDic(gl, texProp._vf.minificationFilter.toUpperCase());
		this.magFilter = x3dom.Utils.magFilterDic(gl, texProp._vf.magnificationFilter.toUpperCase());
		
		if (texProp._vf.generateMipMaps === true) {
			this.genMipMaps = true;
						
			if (this.minFilter == gl.NEAREST) {
				this.minFilter  = gl.NEAREST_MIPMAP_NEAREST;
			} else if (this.minFilter == gl.LINEAR) {
				this.minFilter  = gl.LINEAR_MIPMAP_LINEAR;
			}
		} else {
			this.genMipMaps = false;
			
			if ( (this.minFilter == gl.LINEAR_MIPMAP_LINEAR) ||
				 (this.minFilter == gl.LINEAR_MIPMAP_NEAREST) ) {
				minFilter  = gl.LINEAR;
			} else if ( (this.minFilter == gl.NEAREST_MIPMAP_LINEAR) ||
					    (this.minFilter == gl.NEAREST_MIPMAP_NEAREST) ) {
				this.minFilter  = gl.NEAREST;
			}
		}
	} else {
		if (tex._vf.repeatS == false) {
			this.wrapS = gl.CLAMP_TO_EDGE;
		}
		if (tex._vf.repeatT == false) {
			this.wrapT = gl.CLAMP_TO_EDGE;
		}
	}
	
	//Set texture
	if (tex._isCanvas && tex._canvas)
	{
		if(this.texture == null) {
			this.texture = gl.createTexture()
		}
		gl.bindTexture(this.type, this.texture);
        gl.texImage2D(this.type, 0, this.format, this.format, gl.UNSIGNED_BYTE, tex._canvas);
		gl.bindTexture(this.type, null);
	}
	else if (x3dom.isa(tex, x3dom.nodeTypes.RenderedTexture))
    {
		this.texture = tex._webgl.fbo.tex;
	}
	else if (x3dom.isa(tex, x3dom.nodeTypes.PixelTexture))
	{
		if(this.texture == null) {
			this.texture = gl.createTexture()
		}
		
		var pixelArr = tex._vf.image.toGL();
		var pixelArrfont_size = tex._vf.image.width * tex._vf.image.height * tex._vf.image.comp;
		
		while (pixelArr.length < pixelArrfont_size) {
			pixelArr.push(0);
		}
		
		var pixels = new Uint8Array(pixelArr);
		
		gl.bindTexture(this.type, this.texture);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(this.type, 0, this.format, 
                      tex._vf.image.width, tex._vf.image.height, 0, 
                      this.format, gl.UNSIGNED_BYTE, pixels);
		gl.bindTexture(this.type, null);
	}
	else if (x3dom.isa(tex, x3dom.nodeTypes.MovieTexture) || childTex)
    {
		var that = this;
		if(this.texture == null) {
			this.texture = gl.createTexture();
		}
		
		if (!this.childTex)
		{
			tex._video = document.createElement('video');
			tex._video.setAttribute('autobuffer', 'true');
			var p = document.getElementsByTagName('body')[0];
			p.appendChild(tex._video);
			tex._video.style.visibility = "hidden";
		}
		
		for (var i=0; i<tex._vf.url.length; i++)
		{
			var videoUrl = tex._nameSpace.getURL(tex._vf.url[i]);
			x3dom.debug.logInfo('Adding video file: ' + videoUrl);
			var src = document.createElement('source');
			src.setAttribute('src', videoUrl);
			tex._video.appendChild(src);
		}

		var updateMovie = function()
		{	
			gl.bindTexture(that.type, that.texture);
			gl.texImage2D(that.type, 0, that.format, that.format, gl.UNSIGNED_BYTE, tex._video);
			gl.bindTexture(that.type, null);
			doc.needRender = true;
		};
		
		var startVideo = function()
		{       	
			tex._video.play();
			tex._intervalID = setInterval(updateMovie, 16);
		};
		
		var videoDone = function()
		{
			clearInterval(tex._intervalID);		
			if (tex._vf.loop === true)
			{
				tex._video.play();
				tex._intervalID = setInterval(updateMovie, 16);
			}
		};
		
		// Start listening for the canplaythrough event, so we do not
		// start playing the video until we can do so without stuttering
		tex._video.addEventListener("canplaythrough", startVideo, true);

		// Start listening for the ended event, so we can stop the
		// texture update when the video is finished playing
		tex._video.addEventListener("ended", videoDone, true);	
	}
	else if (x3dom.isa(tex, x3dom.nodeTypes.X3DEnvironmentTextureNode)) 
	{
		this.texture = this.cache.getTextureCube(gl, doc, tex.getTexUrl(), false);
	}
	else 
	{
		this.texture = this.cache.getTexture2D(gl, doc, tex._nameSpace.getURL(tex._vf.url[0]));
	}
};

x3dom.Texture.prototype.updateText = function()
{
	var gl = this.gl;
	
	this.wrapS			= gl.CLAMP_TO_EDGE;
	this.wrapT			= gl.CLAMP_TO_EDGE;
	
	var fontStyleNode = this.node._cf.fontStyle.node;
	
	if ( fontStyleNode !== null )
	{
		var fonts = fontStyleNode._vf.family.toString();

		// clean attribute values and split in array
		fonts = fonts.trim().replace(/\'/g,'').replace(/\,/, ' ');
		fonts = fonts.split(" ");
		
		var font_family = Array.map(fonts, function(s) {
			if (s == 'SANS') { return 'sans-serif'; }
			else if (s == 'SERIF') { return 'serif'; }
			else if (s == 'TYPEWRITER') { return 'monospace'; }
			else { return ''+s+''; }  //'Verdana' 
		}).join(",");
		
		var font_style = fontStyleNode._vf.style.toString().replace(/\'/g,'');
		switch (font_style.toUpperCase()) {
			case 'PLAIN': 		font_style = 'normal'; 		break;
			case 'BOLD': 		font_style = 'bold'; 		break;
			case 'ITALIC': 		font_style = 'italic'; 		break;
			case 'BOLDITALIC': 	font_style = 'italic bold'; break;
			default: 			font_style = 'normal';
		}
		
		var leftToRight = fontStyleNode._vf.leftToRight ? 'ltr' : 'rtl';
		var topToBottom = fontStyleNode._vf.topToBottom;
		
		// TODO: make it possible to use mutiple values
		var font_justify = fontStyleNode._vf.justify[0].toString().replace(/\'/g,'');
		
		switch (font_justify.toUpperCase()) {
			case 'BEGIN': 	font_justify = 'left'; 		break;
			case 'END': 	font_justify = 'right'; 	break;
			case 'FIRST': 	font_justify = 'left'; 		break; // not clear what to do with this one
			case 'MIDDLE': 	font_justify = 'center'; 	break;
			default: 		font_justify = 'left'; 		break;
		}

		var font_size 		= fontStyleNode._vf.size;
		var font_spacing 	= fontStyleNode._vf.spacing;
		var font_horizontal = fontStyleNode._vf.horizontal;
		var font_language 	= fontStyleNode._vf.language;
	}
	
	var textX, textY;
	var paragraph = this.node._vf.string;
	var text_canvas = document.createElement('canvas');
	text_canvas.dir = leftToRight;
	var textHeight = font_size * 42; //muss man die px größe berechnen relativ zu lokalen Koordinatensystem 
	var textAlignment = font_justify;			
	
	// needed to make webfonts work
	document.body.appendChild(text_canvas);

	var text_ctx = text_canvas.getContext('2d');
	
	// calculate font font_size in px
	text_ctx.font = font_style + " " + textHeight + "px " + font_family;  //bold 

	var maxWidth = text_ctx.measureText(paragraph[0]).width;
	// calculate maxWidth
	for(var i = 1; i < paragraph.length; i++) {  
		if(text_ctx.measureText(paragraph[i]).width > maxWidth)
			maxWidth = text_ctx.measureText(paragraph[i]).width;
	}
	
	text_canvas.width = maxWidth;
	text_canvas.height = textHeight * paragraph.length; 

	switch(textAlignment) {
		case "left": 	textX = 0; 						break;
		case "center": 	textX = text_canvas.width/2; 	break;
		case "right": 	textX = text_canvas.width;		break;
	}

	var txtW =  text_canvas.width;
	var txtH = text_canvas.height;

	text_ctx.fillStyle = 'rgba(0,0,0,0)';
	text_ctx.fillRect(0, 0, text_ctx.canvas.width, text_ctx.canvas.height);
	
	// write white text with black border
	text_ctx.fillStyle = 'white';	
    //text_ctx.fillRect(0, 0, text_canvas.width, text_canvas.height);	
	text_ctx.lineWidth = 2.5;
	text_ctx.strokeStyle = 'grey';
	text_ctx.textBaseline = 'top';

	text_ctx.font = font_style + " " + textHeight + "px " + font_family;  //bold 
	text_ctx.textAlign = textAlignment;

	// create the multiline text
	for(var i = 0; i < paragraph.length; i++) {  
		textY = i*textHeight;          
		text_ctx.fillText(paragraph[i], textX,  textY);
	}
	
	if( this.texture === null )
	{
		this.texture = gl.createTexture();
	}
	
	gl.bindTexture(this.type, this.texture);
	gl.texImage2D(this.type, 0, this.format, this.format, gl.UNSIGNED_BYTE, text_canvas);
	gl.bindTexture(this.type, null);
	
	//remove canvas after Texture creation
	document.body.removeChild(text_canvas);
	
	var w  = txtW/100.0; 
    var h  = txtH/100.0;
	
	this.node._mesh._positions[0] = [-w,-h+.4,0, w,-h+.4,0, w,h+.4,0, -w,h+.4,0];
	//this.node._mesh._positions[0] = [-w,-h,0, w,-h,0, w,h,0, -w,h,0];
	

};