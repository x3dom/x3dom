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


x3dom.gfx_webgl = (function () {

	/*****************************************************************************
    * Context constructor
    *****************************************************************************/
    function Context(ctx3d, canvas, name) {
        this.ctx3d = ctx3d;
        this.canvas = canvas;
        this.name = name;
		this.IG_PositionBuffer = null;
		this.cache = new x3dom.Cache();
    }

	
	/*****************************************************************************
    * Return context name
    *****************************************************************************/
    Context.prototype.getName = function() {
        return this.name;
    };

	
	/*****************************************************************************
    * Setup the 3D context and init some things
    *****************************************************************************/
    function setupContext(canvas, forbidMobileShaders) {
        var validContextNames = ['moz-webgl', 'webkit-3d', 'experimental-webgl', 'webgl'];
        var ctx = null;
        // Context creation params
        var ctxAttribs = { alpha: true,
                           depth: true,
                           stencil: true,
                           antialias: true,
                           premultipliedAlpha: false,
                           preserveDrawingBuffer: true
                         };
        
        for (var i=0; i<validContextNames.length; i++) {
            try {
                ctx = canvas.getContext(validContextNames[i], ctxAttribs);
                if (ctx) {
                    var newCtx = new Context(ctx, canvas, 'webgl');

                    try {
						x3dom.debug.logInfo("\nVendor: " + ctx.getParameter(ctx.VENDOR) + ", " + 
											"Renderer: " + ctx.getParameter(ctx.RENDERER) + ", " + 
											"Version: " + ctx.getParameter(ctx.VERSION) + ", " + 
											"ShadingLangV.: " + ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION)
											+ ", " + "\nExtensions: " + ctx.getSupportedExtensions());
						
						//Save CAPS
						x3dom.caps.VENDOR 							= ctx.getParameter(ctx.VENDOR);
						x3dom.caps.VERSION							= ctx.getParameter(ctx.VERSION);
						x3dom.caps.RENDERER							= ctx.getParameter(ctx.RENDERER);
						x3dom.caps.SHADING_LANGUAGE_VERSION 		= ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION);
						x3dom.caps.RED_BITS 						= ctx.getParameter(ctx.RED_BITS);
						x3dom.caps.GREEN_BITS 						= ctx.getParameter(ctx.GREEN_BITS);
						x3dom.caps.BLUE_BITS 						= ctx.getParameter(ctx.BLUE_BITS);
						x3dom.caps.ALPHA_BITS 						= ctx.getParameter(ctx.ALPHA_BITS);
						x3dom.caps.DEPTH_BITS 						= ctx.getParameter(ctx.DEPTH_BITS);
						x3dom.caps.MAX_VERTEX_ATTRIBS				= ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
						x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS 	= ctx.getParameter(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
						x3dom.caps.MAX_VARYING_VECTORS				= ctx.getParameter(ctx.MAX_VARYING_VECTORS);
						x3dom.caps.MAX_VERTEX_UNIFORM_VECTORS		= ctx.getParameter(ctx.MAX_VERTEX_UNIFORM_VECTORS);
						x3dom.caps.MAX_COMBINED_TEXTURE_IMAGE_UNITS	= ctx.getParameter(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
						x3dom.caps.MAX_TEXTURE_SIZE					= ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
						x3dom.caps.MAX_CUBE_MAP_TEXTURE_SIZE		= ctx.getParameter(ctx.MAX_CUBE_MAP_TEXTURE_SIZE);
						x3dom.caps.COMPRESSED_TEXTURE_FORMATS	= ctx.getParameter(ctx.COMPRESSED_TEXTURE_FORMATS);
						x3dom.caps.MAX_RENDERBUFFER_SIZE			= ctx.getParameter(ctx.MAX_RENDERBUFFER_SIZE);
						x3dom.caps.MAX_VIEWPORT_DIMS				= ctx.getParameter(ctx.MAX_VIEWPORT_DIMS);
						x3dom.caps.ALIASED_LINE_WIDTH_RANGE			= ctx.getParameter(ctx.ALIASED_LINE_WIDTH_RANGE);
						x3dom.caps.ALIASED_POINT_SIZE_RANGE			= ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE);
						x3dom.caps.FP_TEXTURES 						= ctx.getExtension("OES_texture_float");
						x3dom.caps.EXTENSIONS						= ctx.getSupportedExtensions();
						
						x3dom.caps.MOBILE							= (function(a) { if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) { return true; } else {return false; } } )(navigator.userAgent||navigator.vendor||window.opera);
						
                        // explicitly disable for iPad and the like
                        if (x3dom.caps.RENDERER.indexOf("PowerVR") >= 0 ||
                            navigator.appVersion.indexOf("Mobile") > -1 ||
                            // coarse guess to find out old SM 2.0 hardware (e.g. Intel):
                            x3dom.caps.MAX_VARYING_VECTORS <= 8 ||
                            x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 2)   
                        {
                            x3dom.caps.MOBILE = true;
                        }
                        if (x3dom.caps.MOBILE)
                        {
                            if (forbidMobileShaders) {
                                x3dom.caps.MOBILE = false;
                                x3dom.debug.logWarning("Detected mobile graphics card! " + 
							        "But being forced to desktop shaders which might not work!");
                            }
                            else {
							    x3dom.debug.logWarning("Detected mobile graphics card! " + 
							        "Using low quality shaders without ImageGeometry support!");
						    }
						}
                    }
                    catch (ex) {
                        x3dom.debug.logWarning(
                                "Your browser probably supports an older WebGL version. " +
                                "Please try the old mobile runtime instead:\n" +
                                "http://www.x3dom.org/x3dom/src_mobile/x3dom.js");
                        newCtx = null;
                    }
                    
                    return newCtx;
                }
            }
            catch (e) {}
        }
        return null;
    }
		
	/*****************************************************************************
    * Setup GL objects for given shape
    *****************************************************************************/
    Context.prototype.setupShape = function (gl, shape, viewarea) 
    {
        var i, q = 0;
        var vertices, positionBuffer;
		
        if (shape._webgl !== undefined)
        {
			var needFullReInit = false;
		
            // TODO; do same for texcoords etc.!
            if (shape._dirty.colors === true &&
                shape._webgl.shader.color === undefined &&
                shape._cf.geometry.node._mesh._colors[0].length)
            {
                // required since otherwise shape._webgl.shader.color stays undefined
                // and thus the wrong shader will be chosen although there are colors
                needFullReInit = true;
            }
            
            if (needFullReInit)
            {   
				//Save old shader
				var spOld = shape._webgl.shader;
				
				for (q=0; q<shape._webgl.positions.length; q++)
				{
					if (spOld.position !== undefined) 
					{
						gl.deleteBuffer(shape._webgl.buffers[5*q+1]);
						gl.deleteBuffer(shape._webgl.buffers[5*q+0]);
					}
					
					if (spOld.normal !== undefined) 
					{
						gl.deleteBuffer(shape._webgl.buffers[5*q+2]);
					}
					
					if (spOld.texcoord !== undefined) 
					{
						gl.deleteBuffer(shape._webgl.buffers[5*q+3]);
					}
					
					if (spOld.color !== undefined)
					{
						gl.deleteBuffer(shape._webgl.buffers[5*q+4]);
					}
				}
				
				for (var inc=0; inc<shape._webgl.dynamicFields.length; inc++)
				{
					var h_attrib = shape._webgl.dynamicFields[inc];
					
					if (spOld[h_attrib.name] !== undefined)
					{
						gl.deleteBuffer(h_attrib.buf);
					}
				}
            }
			
			//Check for dirty Textures
			if (shape._dirty.texture === true)
			{
				//Check for Texture add or remove
				if (shape._webgl.texture.length != shape.getTextures().length)
				{
					//Delete old Textures
					for ( var t=0; t<shape._webgl.texture.length; ++t )
					{
						shape._webgl.texture.pop();
					}
					
					//Generate new Textures
					var textures = shape.getTextures();
					for( var t=0; t<textures.length; ++t )
					{		
						shape._webgl.texture.push( new x3dom.Texture(gl, shape._nameSpace.doc, this.cache, textures[t]) );		
					}
					
					//Set dirty shader
					shape._dirty.shader = true;
					
					//Set dirty texture Coordinates
					shape._dirty.texCoords = true;
				}
				else
				{
					//If someone remove and append at the same time, texture count don't change
					//and we have to check if all nodes the same as before
					var textures = shape.getTextures();
					for( var t=0; t<textures.length; ++t )
					{	
						if(textures[t] === shape._webgl.texture[t])
						{
							//only update the texture
							shape._webgl.texture[t].update();
						} 
						else 
						{
							//delete old Texture
							gl.deleteTexture( shape._webgl.texture[t].texture );
							
							//Set texture to null for recreation
							shape._webgl.texture[t].texture = null;
							
							//Set new node
							shape._webgl.texture[t].node = textures[t];
							
							//Update new node
							shape._webgl.texture[t].update();
						}
					}
				}
				shape._dirty.texture = false;
			}
			
			//Check if we need a new shader
            var oldLightsAndShadow 		 = shape._webgl.lightsAndShadow;
            shape._webgl.lightsAndShadow = x3dom.Utils.checkDirtyLighting(viewarea);
			
			if ( shape._webgl.lightsAndShadow[0] != oldLightsAndShadow[0] || 
                 shape._webgl.lightsAndShadow[1] != oldLightsAndShadow[1] ||
				 shape._dirty.shader )
			{
				shape._webgl.shader = this.cache.getDynamicShader(gl, viewarea, shape);
				shape._dirty.shader = false;
			}		
            
            for (q=0; q<shape._webgl.positions.length; q++)
            {
              if (!needFullReInit && shape._dirty.positions === true)
              {
                if (shape._webgl.shader.position !== undefined) 
                {
					shape._webgl.indexes[q] = shape._cf.geometry.node._mesh._indices[q];
					
					gl.deleteBuffer(shape._webgl.buffers[5*q+0]);

					var indicesBuffer = gl.createBuffer();
					shape._webgl.buffers[5*q+0] = indicesBuffer;
            
					var indexArray = new Uint16Array(shape._webgl.indexes[q]);
				
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
				
					indexArray = null;
				
                    shape._webgl.positions[q] = shape._cf.geometry.node._mesh._positions[q];
                    
                    // TODO; don't delete but use glMapBuffer() and DYNAMIC_DRAW
                    gl.deleteBuffer(shape._webgl.buffers[5*q+1]);
                    
                    positionBuffer = gl.createBuffer();
                    shape._webgl.buffers[5*q+1] = positionBuffer;
                    
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[5*q+0]);
                    
                    vertices = new Float32Array(shape._webgl.positions[q]);
                    
                    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    
                    gl.vertexAttribPointer(shape._webgl.shader.position, 
                        shape._cf.geometry.node._mesh._numPosComponents, 
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);

                    vertices = null;
                }
                
                shape._dirty.positions = false;
              }
              if (!needFullReInit && shape._dirty.colors === true)
              {
                if (shape._webgl.shader.color !== undefined)
                {
                    shape._webgl.colors[q] = shape._cf.geometry.node._mesh._colors[q];
                    
                    gl.deleteBuffer(shape._webgl.buffers[5*q+4]);
                    
                    colorBuffer = gl.createBuffer();
                    shape._webgl.buffers[5*q+4] = colorBuffer;
                    
                    colors = new Float32Array(shape._webgl.colors[q]);
                    
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);             
                    
                    gl.vertexAttribPointer(shape._webgl.shader.color, 
                        shape._cf.geometry.node._mesh._numColComponents, 
                        shape._webgl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    
                    colors = null;
                }
                
                shape._dirty.colors = false;
              }
			  if (!needFullReInit && shape._dirty.normals === true)
              {
                if (shape._webgl.shader.normal !== undefined)
                {
                    shape._webgl.normals[q] = shape._cf.geometry.node._mesh._normals[q];
                    
					gl.deleteBuffer(shape._webgl.buffers[5*q+2]);
                    
                    normalBuffer = gl.createBuffer();
                    shape._webgl.buffers[5*q+2] = normalBuffer;					
                    
                    normals = new Float32Array(shape._webgl.normals[q]);
                    
                    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);             
                    
                    gl.vertexAttribPointer(shape._webgl.shader.normal, 
                        shape._cf.geometry.node._mesh._numNormComponents, 
                        shape._webgl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    
                    normals = null;
                }
                
                shape._dirty.normals = false; 
              }
			  if (!needFullReInit && shape._dirty.texCoords === true)
              {
                if (shape._webgl.shader.texcoord !== undefined)
                {
                    shape._webgl.texcoords[q] =  shape._cf.geometry.node._mesh._texCoords[q];
                    
                    gl.deleteBuffer(shape._webgl.buffers[5*q+3]);
					         
                    texCoordBuffer = gl.createBuffer();
                    shape._webgl.buffers[5*q+3] = texCoordBuffer;
                    
                    texCoords = new Float32Array(shape._webgl.texcoords[q]);
                    
                    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);             
                    
                    gl.vertexAttribPointer(shape._webgl.shader.texCoord, 
                        shape._cf.geometry.node._mesh._numTexComponents, 
                        shape._webgl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    
                    texCoords = null;
                }
                
                shape._dirty.texCoords = false; 
              }
            }

		    if (shape._webgl.imageGeometry != 0)
            {
				for ( var t=0; t<shape._webgl.texture.length; ++t )
				{
					shape._webgl.texture[t].updateTexture();
				} 
			
                shape._cf.geometry.node._dirty.coord = false;
                shape._cf.geometry.node._dirty.normal = false;
                shape._cf.geometry.node._dirty.texCoord = false;
                shape._cf.geometry.node._dirty.color = false;
                shape._cf.geometry.node._dirty.index = false;
            }

            if (!needFullReInit) {
                return;
            }
        }
        else if (!(x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Text) ||
                   x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BinaryGeometry) ||
                   x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PopGeometry) ||
                   x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BitLODGeometry)) &&
                 (!shape._cf.geometry.node || 
				   shape._cf.geometry.node._mesh._positions[0].length < 1) ) 
		{
		    if (x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS < 2 &&
		        x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.ImageGeometry)) {
		        x3dom.debug.logError("Can't render ImageGeometry nodes with only " +
		                              x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS +
		                             " vertex texture units. Please upgrade your GPU!");
		    }
		    else {
                x3dom.debug.logError("NO VALID MESH OR NO VERTEX POSITIONS SET!");
            }
            return;
        }
        
        // we're on init, thus reset all dirty flags
        shape._dirty.positions = false;
        shape._dirty.normals   = false;
        shape._dirty.texcoords = false;
        shape._dirty.colors    = false;
        shape._dirty.indexes   = false;
        shape._dirty.texture   = false;
		shape._dirty.material  = false;
        shape._dirty.shader    = false;
        
        
        // dynamically attach clean-up method for GL objects
        if (shape._cleanupGLObjects == null)
        {
          shape._cleanupGLObjects = function(force)
          {
            // FIXME; what if complete tree is removed? Then _parentNodes.length my be greater 0.
            if (this._webgl && ((arguments.length > 0 && force) || this._parentNodes.length == 0))
            {
                //var doc = this.findX3DDoc();
                //var gl = doc.ctx.ctx3d;
                var sp = this._webgl.shader;

                for (var cnt=0; this._webgl.texture !== undefined &&
                                cnt < this._webgl.texture.length; cnt++)
                {
                    if (this._webgl.texture[cnt].texture) {
                        gl.deleteTexture(this._webgl.texture[cnt].texture);
                    }
                }

                for (var q=0; q<this._webgl.positions.length; q++)
                {
                    if (sp.position !== undefined) {
                        gl.deleteBuffer(this._webgl.buffers[5*q+1]);
                        gl.deleteBuffer(this._webgl.buffers[5*q+0]);
                    }

                    if (sp.normal !== undefined) {
                        gl.deleteBuffer(this._webgl.buffers[5*q+2]);
                    }

                    if (sp.texcoord !== undefined) {
                        gl.deleteBuffer(this._webgl.buffers[5*q+3]);
                    }

                    if (sp.color !== undefined) {
                        gl.deleteBuffer(this._webgl.buffers[5*q+4]);
                    }
                }

                for (var df=0; df<this._webgl.dynamicFields.length; df++)
                {
                    var attrib = this._webgl.dynamicFields[df];

                    if (sp[attrib.name] !== undefined) {
                        gl.deleteBuffer(attrib.buf);
                    }
                }

                delete this._webgl;
            }
          };  // shape._cleanupGLObjects()
        }
		
		
		shape._webgl = {
			positions: shape._cf.geometry.node._mesh._positions,
			normals: shape._cf.geometry.node._mesh._normals,
			texcoords: shape._cf.geometry.node._mesh._texCoords,
			colors: shape._cf.geometry.node._mesh._colors,
			indexes: shape._cf.geometry.node._mesh._indices,
			//indicesBuffer,positionBuffer,normalBuffer,texcBuffer,colorBuffer
			//buffers: [{},{},{},{},{}],
			coordType: gl.FLOAT,
			normalType: gl.FLOAT,
			texCoordType: gl.FLOAT,
			colorType: gl.FLOAT,
			texture: [],
			lightsAndShadow: x3dom.Utils.checkDirtyLighting(viewarea),
			imageGeometry:  0, // 0 := no IG,  1 := indexed IG, -1  := non-indexed IG
			binaryGeometry: 0, // 0 := no BG,  1 := indexed BG, -1  := non-indexed BG
			popGeometry:    0, // 0 := no PG,  1 := indexed PG, -1  := non-indexed PG
			bitLODGeometry: 0  // 0 := no BLG, 1 := indexed BLG, -1 := non-indexed BLG      
		};
		
		//Set Textures		
		var textures = shape.getTextures();
		for( var t=0; t<textures.length; ++t )
		{		
			shape._webgl.texture.push( new x3dom.Texture(gl, shape._nameSpace.doc, this.cache, textures[t]) );		
		}
		
		shape._webgl.positions = shape._cf.geometry.node._mesh._positions,
		
		//Set Shader
		shape._webgl.shader = this.cache.getDynamicShader(gl, viewarea, shape);
		
		// init vertex attribs
        var sp = shape._webgl.shader;
        var currAttribs = 0;
        
        shape._webgl.buffers = [];
        shape._webgl.dynamicFields = [];
		
		//Set Geometry Primitive Type
		if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PointSet) || 
			x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polypoint2D)) 
		{
			shape._webgl.primType = gl.POINTS;
		}
		else if ( x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedLineSet) ||
				  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Circle2D) ||
				  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Arc2D) || 
				  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.Polyline2D))
		{		
			shape._webgl.primType = gl.LINES;
		}
		else if ( x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedTriangleStripSet) &&  
				  shape._cf.geometry.node._mesh._primType.toUpperCase() == 'TRIANGLESTRIP')
		{
			shape._webgl.primType = gl.TRIANGLE_STRIP;
		} 
		else if ( x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.ImageGeometry) ||
				  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BinaryGeometry) ||
                  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PopGeometry) ||
				  x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BitLODGeometry) )
		{
			shape._webgl.primType = [];				
			for (var primCnt=0; primCnt<shape._cf.geometry.node._vf.primType.length; ++primCnt) 
			{
				switch(shape._cf.geometry.node._vf.primType[primCnt].toUpperCase())
				{
					case 'POINTS':
						shape._webgl.primType.push(gl.POINTS);
						break;
					case 'LINES':
						shape._webgl.primType.push(gl.LINES);
						break;
					case 'TRIANGLESTRIP':
						shape._webgl.primType.push(gl.TRIANGLE_STRIP);
						break;
					case 'TRIANGLES':
					default:
						shape._webgl.primType.push(gl.TRIANGLES);
						break;
				}
			}
		} 
		else 
		{
			shape._webgl.primType = gl.TRIANGLES;
		}
		
        // BinaryGeometry needs special handling
        if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BinaryGeometry)) 
        {
            var t00 = new Date().getTime();
            
            var thisContext = this;
            
			// 0 := no BG, 1 := indexed BG, -1 := non-indexed BG
			shape._webgl.binaryGeometry = -1;
			
			shape._webgl.internalDownloadCount = ((shape._cf.geometry.node._vf.index.length > 0) ? 1 : 0) +
                ((shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.coord.length > 0) ? 1 : 0) +
                ((!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.coord.length > 0) ? 1 : 0) +
                ((!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.normal.length > 0) ? 1 : 0) +
                ((!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.texCoord.length > 0) ? 1 : 0) +
                ((!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.color.length > 0) ? 1 : 0);
			
			var createTriangleSoup = (shape._cf.geometry.node._vf.normalPerVertex == false) ||
			                        ((shape._cf.geometry.node._vf.indexType == "Uint32") &&
			                         (shape._cf.geometry.node._vf.index.length > 0));

            shape._webgl.makeSeparateTris = {
                index: null,
                coord: null,
                normal: null,
                texCoord: null,
                color: null,

                pushBuffer: function(name, buf) {
                    this[name] = buf;
                    
                    if (--shape._webgl.internalDownloadCount == 0) {
                        if (this.coord)
                            this.createMesh();
                        shape._nameSpace.doc.needRender = true;
                    }
                    if (--shape._nameSpace.doc.downloadCount == 0)
                        shape._nameSpace.doc.needRender = true;
                },

                createMesh: function() {
                    var geoNode = shape._cf.geometry.node;
                    
                    if (geoNode._hasStrideOffset) {
                        x3dom.debug.logError(geoNode._vf.indexType + 
                            " index type and per-face normals not supported for interleaved arrays.");
                        return;
                    }
                    
                    for (var k=0; k<shape._webgl.primType.length; k++) {
                        if (shape._webgl.primType[k] == gl.TRIANGLE_STRIP) {
                            x3dom.debug.logError("Triangle strips not yet supported for per-face normals.");
                            return;
                        }
                    }
                    
                    var attribTypeStr = geoNode._vf.coordType;
                    shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
                    
                    // remap vertex data
                    var bgCenter, bgSize, bgPrecisionMax;
                    
                    if (shape._webgl.coordType != gl.FLOAT)
                    {
                        if (geoNode._mesh._numPosComponents == 4 && 
                            x3dom.Utils.isUnsignedType(geoNode._vf.coordType))
                            bgCenter = x3dom.fields.SFVec3f.copy(geoNode.getMin());
                        else
                            bgCenter = x3dom.fields.SFVec3f.copy(geoNode._vf.position);

                        bgSize = x3dom.fields.SFVec3f.copy(geoNode._vf.size);
                        bgPrecisionMax = geoNode.getPrecisionMax('coordType');
                    }
                    else
                    {
                        bgCenter = new x3dom.fields.SFVec3f(0, 0, 0);
                        bgSize = new x3dom.fields.SFVec3f(1, 1, 1);
                        bgPrecisionMax = 1.0;
                    }
                    
                    // check types
                    var dataLen = shape._coordStrideOffset[0] / 
                                    x3dom.Utils.getDataTypeSize(geoNode._vf.coordType);
                    dataLen = (dataLen == 0) ? 3 : dataLen;
                    
                    x3dom.debug.logInfo("makeSeparateTris.createMesh called with coord length " + dataLen);
                    
                    if (this.color && dataLen != shape._colorStrideOffset[0] / 
                                x3dom.Utils.getDataTypeSize(geoNode._vf.colorType))
                    {
                        this.color = null;
                        x3dom.debug.logWarning("Color format not supported.");
                    }
                    
                    var texDataLen = this.texCoord ? (shape._texCoordStrideOffset[0] / 
                                          x3dom.Utils.getDataTypeSize(geoNode._vf.texCoordType)) : 0;
                    
                    // set data types
                    //geoNode._vf.coordType = "Float32";
                    geoNode._vf.normalType = "Float32";
                    
                    //shape._webgl.coordType = gl.FLOAT;
                    shape._webgl.normalType = gl.FLOAT;
                    
                    //geoNode._mesh._numPosComponents = 3;
                    geoNode._mesh._numNormComponents = 3;
                    
                    //shape._coordStrideOffset = [0, 0];
                    shape._normalStrideOffset = [0, 0];
                    
                    // create non-indexed mesh
                    var posBuf = [], normBuf = [], texcBuf = [], colBuf = [];
                    var i, j, l, n = this.index ? (this.index.length - 2) : (this.coord.length / 3 - 2);
                    
                    for (i=0; i<n; i+=3)
                    {
                        j = dataLen * (this.index ? this.index[i] : i);
                        var p0 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax, 
                                                          bgSize.y * this.coord[j+1] / bgPrecisionMax, 
                                                          bgSize.z * this.coord[j+2] / bgPrecisionMax);
                        // offset irrelevant for normal calculation
                        //p0 = bgCenter.add(p0);
                        
                        posBuf.push(this.coord[j  ]);
                        posBuf.push(this.coord[j+1]);
                        posBuf.push(this.coord[j+2]);
                        if (dataLen > 3) posBuf.push(this.coord[j+3]);
                        
                        if (this.color) {
                            colBuf.push(this.color[j  ]);
                            colBuf.push(this.color[j+1]);
                            colBuf.push(this.color[j+2]);
                            if (dataLen > 3) colBuf.push(this.color[j+3]);
                        }
                        
                        if (this.texCoord) {
                            l = texDataLen * (this.index ? this.index[i] : i);
                            
                            texcBuf.push(this.texCoord[l  ]);
                            texcBuf.push(this.texCoord[l+1]);
                            if (texDataLen > 3) {
                                texcBuf.push(this.texCoord[l+2]);
                                texcBuf.push(this.texCoord[l+3]);
                            }
                        }
                        
                        j = dataLen * (this.index ? this.index[i+1] : i+1);
                        var p1 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax, 
                                                          bgSize.y * this.coord[j+1] / bgPrecisionMax, 
                                                          bgSize.z * this.coord[j+2] / bgPrecisionMax);
                        //p1 = bgCenter.add(p1);
                        
                        posBuf.push(this.coord[j  ]);
                        posBuf.push(this.coord[j+1]);
                        posBuf.push(this.coord[j+2]);
                        if (dataLen > 3) posBuf.push(this.coord[j+3]);
                        
                        if (this.color) {
                            colBuf.push(this.color[j  ]);
                            colBuf.push(this.color[j+1]);
                            colBuf.push(this.color[j+2]);
                            if (dataLen > 3) colBuf.push(this.color[j+3]);
                        }
                        
                        if (this.texCoord) {
                            l = texDataLen * (this.index ? this.index[i+1] : i+1);
                            
                            texcBuf.push(this.texCoord[l  ]);
                            texcBuf.push(this.texCoord[l+1]);
                            if (texDataLen > 3) {
                                texcBuf.push(this.texCoord[l+2]);
                                texcBuf.push(this.texCoord[l+3]);
                            }
                        }
                        
                        j = dataLen * (this.index ? this.index[i+2] : i+2);
                        var p2 = new x3dom.fields.SFVec3f(bgSize.x * this.coord[j  ] / bgPrecisionMax, 
                                                          bgSize.y * this.coord[j+1] / bgPrecisionMax, 
                                                          bgSize.z * this.coord[j+2] / bgPrecisionMax);
                        //p2 = bgCenter.add(p2);
                        
                        posBuf.push(this.coord[j  ]);
                        posBuf.push(this.coord[j+1]);
                        posBuf.push(this.coord[j+2]);
                        if (dataLen > 3) posBuf.push(this.coord[j+3]);
                        
                        if (this.color) {
                            colBuf.push(this.color[j  ]);
                            colBuf.push(this.color[j+1]);
                            colBuf.push(this.color[j+2]);
                            if (dataLen > 3) colBuf.push(this.color[j+3]);
                        }
                        
                        if (this.texCoord) {
                            l = texDataLen * (this.index ? this.index[i+2] : i+2);
                            
                            texcBuf.push(this.texCoord[l  ]);
                            texcBuf.push(this.texCoord[l+1]);
                            if (texDataLen > 3) {
                                texcBuf.push(this.texCoord[l+2]);
                                texcBuf.push(this.texCoord[l+3]);
                            }
                        }

                        var a = p0.subtract(p1);
                        var b = p1.subtract(p2);
                        var norm = a.cross(b).normalize();
                        
                        for (var j=0; j<3; j++) {
                            normBuf.push(norm.x);
                            normBuf.push(norm.y);
                            normBuf.push(norm.z);
                        }
                    }
                    
                    // coordinates
                    var buffer = gl.createBuffer();
                    shape._webgl.buffers[1] = buffer;
                    
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, 
                        x3dom.Utils.getArrayBufferView(geoNode._vf.coordType, posBuf), gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.position, geoNode._mesh._numPosComponents, 
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                    
                    // normals
                    buffer = gl.createBuffer();
                    shape._webgl.buffers[2] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normBuf), gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.normal, geoNode._mesh._numNormComponents, 
                        shape._webgl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);
                    
                    // tex coords
                    if (this.texCoord) 
                    {
                        buffer = gl.createBuffer();
                        shape._webgl.buffers[3] = buffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, 
                            x3dom.Utils.getArrayBufferView(geoNode._vf.texCoordType, texcBuf), 
                            gl.STATIC_DRAW);
                        
                        gl.vertexAttribPointer(sp.texcoord, geoNode._mesh._numTexComponents, 
                            shape._webgl.texCoordType, false,
                            shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.texcoord);
                    }
                    
                    // colors
                    if (this.color) 
                    {
                        buffer = gl.createBuffer();
                        shape._webgl.buffers[4] = buffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, 
                            x3dom.Utils.getArrayBufferView(geoNode._vf.colorType, colBuf), 
                            gl.STATIC_DRAW);
                        
                        gl.vertexAttribPointer(sp.color, geoNode._mesh._numColComponents, 
                            shape._webgl.colorType, false,
                            shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.color);
                    }
                    
                    // adjust sizes
                    geoNode._vf.vertexCount = [];
                    geoNode._vf.vertexCount[0] = posBuf.length / dataLen;
                    
                    geoNode._mesh._numCoords = geoNode._vf.vertexCount[0];
                    geoNode._mesh._numFaces = geoNode._vf.vertexCount[0] / 3;
                    
                    shape._webgl.primType = [];
                    shape._webgl.primType[0] = gl.TRIANGLES;
                    
                    // cleanup
                    posBuf = null;
                    normBuf = null;
                    texcBuf = null;
                    colBuf = null;
                    
                    this.index = null;
                    this.coord = null;
                    this.normal = null;
                    this.texCoord = null;
                    this.color = null;
                    
                    // recreate shader
                    delete shape._webgl.shader;
                    shape._webgl.shader = thisContext.cache.getDynamicShader(gl, viewarea, shape);
                }
            };
			
            // index
            if (shape._cf.geometry.node._vf.index.length > 0)
            {
                var xmlhttp0 = new XMLHttpRequest();
                xmlhttp0.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.index)), true);
                xmlhttp0.responseType = "arraybuffer";
            
                shape._nameSpace.doc.downloadCount += 1;
            
                xmlhttp0.send(null);
            
                xmlhttp0.onload = function() 
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp0.response;
                    
                    var geoNode = shape._cf.geometry.node;            
                    var attribTypeStr = geoNode._vf.indexType;  //"Uint16"
        		    
        		    var indexArray = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

                    if (createTriangleSoup) {
                        shape._webgl.makeSeparateTris.pushBuffer("index", indexArray);
                        return;
                    }

                    var indicesBuffer = gl.createBuffer();
                    shape._webgl.buffers[0] = indicesBuffer;
                    
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

                    // Test reading Data
                    //x3dom.debug.logWarning("arraybuffer[0]="+indexArray[0]+"; n="+indexArray.length);
                    
                    shape._webgl.binaryGeometry = 1;    // indexed BG
                    
                    if (geoNode._vf.vertexCount[0] == 0)
                        geoNode._vf.vertexCount[0] = indexArray.length;
                    
                    geoNode._mesh._numFaces = 0;
                    
                    for (var i=0; i<geoNode._vf.vertexCount.length; i++) {
                        if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                            geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                        else
                            geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
                    }

                    indexArray = null;

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
                    if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;   
                    x3dom.debug.logInfo("XHR0/ index load time: " + t11 + " ms"); 
                };
            }

            // interleaved array -- assume all attributes are given in one single array buffer
            if (shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.coord.length > 0)
            {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.coord)), true);
                xmlhttp.responseType = "arraybuffer";

                shape._nameSpace.doc.downloadCount += 1;

                xmlhttp.send(null);

                xmlhttp.onload = function()
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp.response;

                    var geoNode = shape._cf.geometry.node;
                    var attribTypeStr = geoNode._vf.coordType;

                    // assume same data type for all attributes (but might be wrong)
                    shape._webgl.coordType    = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
                    shape._webgl.normalType   = shape._webgl.coordType;
                    shape._webgl.texCoordType = shape._webgl.coordType;
                    shape._webgl.colorType    = shape._webgl.coordType;

                    var attributes = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);

                    // calculate number of single data packages by including stride and type size
                    var dataLen = shape._coordStrideOffset[0] / x3dom.Utils.getDataTypeSize(attribTypeStr);
                    if (dataLen)
                        geoNode._mesh._numCoords = attributes.length / dataLen;
                    
                    if (geoNode._vf.index.length == 0) {
                        for (var i=0; i<geoNode._vf.vertexCount.length; i++) {
                            if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                                geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                            else
                                geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
                        }
                    }

                    var buffer = gl.createBuffer();

                    shape._webgl.buffers[1] = buffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.position, geoNode._mesh._numPosComponents, 
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);

                    if (geoNode._vf.normal.length > 0)
                    {
                        shape._webgl.buffers[2] = buffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                        gl.vertexAttribPointer(sp.normal, geoNode._mesh._numNormComponents, 
                            shape._webgl.normalType, false,
                            shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.normal);
                    }

                    if (geoNode._vf.texCoord.length > 0)
                    {
                        shape._webgl.buffers[3] = buffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                        gl.vertexAttribPointer(sp.texcoord, geoNode._mesh._numTexComponents, 
                            shape._webgl.texCoordType, false,
                            shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.texcoord);
                    }

                    if (geoNode._vf.color.length > 0)
                    {
                        shape._webgl.buffers[4] = buffer;

                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                        gl.bufferData(gl.ARRAY_BUFFER, attributes, gl.STATIC_DRAW);

                        gl.vertexAttribPointer(sp.color, geoNode._mesh._numColComponents, 
                            shape._webgl.colorType, false,
                            shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                        gl.enableVertexAttribArray(sp.color);
                    }

                    attributes = null;  // delete data block in CPU memory

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
                    if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;
                    x3dom.debug.logInfo("XHR/ interleaved array load time: " + t11 + " ms");
                };
            }
            
            // coord
            if (!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.coord.length > 0)
            {
                var xmlhttp1 = new XMLHttpRequest();
                xmlhttp1.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.coord)), true);
                xmlhttp1.responseType = "arraybuffer";
            
                shape._nameSpace.doc.downloadCount += 1;
            
                xmlhttp1.send(null);
            
                xmlhttp1.onload = function() 
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp1.response;
                    
                    var geoNode = shape._cf.geometry.node;            

                    var attribTypeStr = geoNode._vf.coordType;
                    shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

                    var vertices = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);
                    
                    if (createTriangleSoup) {
                        shape._webgl.makeSeparateTris.pushBuffer("coord", vertices);
                        return;
                    }
                    
                    var positionBuffer = gl.createBuffer();
                    shape._webgl.buffers[1] = positionBuffer;
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                    
                    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                    gl.vertexAttribPointer(sp.position, 
                        geoNode._mesh._numPosComponents, 
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                    
                    geoNode._mesh._numCoords = vertices.length / geoNode._mesh._numPosComponents;
                    
                    if (geoNode._vf.index.length == 0) {
                        for (var i=0; i<geoNode._vf.vertexCount.length; i++) {
                            if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
                                geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] - 2;
                            else
                                geoNode._mesh._numFaces += geoNode._vf.vertexCount[i] / 3;
                        }
                    }
                    
                    // Test reading Data
                    //x3dom.debug.logWarning("arraybuffer[0].vx="+vertices[0]);

                    if ((attribTypeStr == "Float32") &&
                        (shape._vf.bboxSize.x < 0 || shape._vf.bboxSize.y < 0 || shape._vf.bboxSize.z < 0))
                    {
                        var min = new x3dom.fields.SFVec3f(vertices[0],vertices[1],vertices[2]);
                        var max = new x3dom.fields.SFVec3f(vertices[0],vertices[1],vertices[2]);

                        for (var i=3; i<vertices.length; i+=3)
                        {
                            if (min.x > vertices[i+0]) { min.x = vertices[i+0]; }
                            if (min.y > vertices[i+1]) { min.y = vertices[i+1]; }
                            if (min.z > vertices[i+2]) { min.z = vertices[i+2]; }

                            if (max.x < vertices[i+0]) { max.x = vertices[i+0]; }
                            if (max.y < vertices[i+1]) { max.y = vertices[i+1]; }
                            if (max.z < vertices[i+2]) { max.z = vertices[i+2]; }
                        }

                        // TODO; move to mesh for all cases?
                        shape._vf.bboxCenter.setValues(min.add(max).multiply(0.5));
                        shape._vf.bboxSize.setValues(max.subtract(min));
                    }
                    
                    vertices = null;

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
                    if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;   
                    x3dom.debug.logInfo("XHR1/ coord load time: " + t11 + " ms"); 
                };
            }
            
            // normal
            if (!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.normal.length > 0)
            {
                var xmlhttp2 = new XMLHttpRequest();
                xmlhttp2.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.normal)), true);
                xmlhttp2.responseType = "arraybuffer";
            
                shape._nameSpace.doc.downloadCount += 1;
            
                xmlhttp2.send(null);
            
                xmlhttp2.onload = function() 
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp2.response;

                    var attribTypeStr = shape._cf.geometry.node._vf.normalType;
                    shape._webgl.normalType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

                    var normals = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);
                    
                    if (createTriangleSoup) {
                        shape._webgl.makeSeparateTris.pushBuffer("normal", normals);
                        return;
                    }
                    
                    var normalBuffer = gl.createBuffer();
                    shape._webgl.buffers[2] = normalBuffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);                

                    gl.vertexAttribPointer(sp.normal, 
                        shape._cf.geometry.node._mesh._numNormComponents, 
                        shape._webgl.normalType, false,
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.normal);

                    // Test reading Data
                    //x3dom.debug.logWarning("arraybuffer[0].nx="+normals[0]);  

                    normals = null;

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
                    if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;   
                    x3dom.debug.logInfo("XHR2/ normal load time: " + t11 + " ms");
                };
            }
            
            // texCoord
            if (!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.texCoord.length > 0)
            {
                var xmlhttp3 = new XMLHttpRequest();
                xmlhttp3.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.texCoord)), true);
                xmlhttp3.responseType = "arraybuffer";
            
                shape._nameSpace.doc.downloadCount += 1;
            
                xmlhttp3.send(null);
            
                xmlhttp3.onload = function() 
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp3.response;

                    var attribTypeStr = shape._cf.geometry.node._vf.texCoordType;
                    shape._webgl.texCoordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

                    var texCoords = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);
                    
                    if (createTriangleSoup) {
                        shape._webgl.makeSeparateTris.pushBuffer("texCoord", texCoords);
                        return;
                    }

                    var texcBuffer = gl.createBuffer();
                    shape._webgl.buffers[3] = texcBuffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

                    gl.vertexAttribPointer(sp.texcoord, 
                        shape._cf.geometry.node._mesh._numTexComponents, 
                        shape._webgl.texCoordType, false,
                        shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.texcoord);

                    // Test reading Data
                    //x3dom.debug.logWarning("arraybuffer[0].tx="+texCoords[0]);  

                    texCoords = null;

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
                    if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;   
                    x3dom.debug.logInfo("XHR3/ texCoord load time: " + t11 + " ms"); 
                };
            }
          
            // color
            if (!shape._cf.geometry.node._hasStrideOffset && shape._cf.geometry.node._vf.color.length > 0)
            {
                var xmlhttp4 = new XMLHttpRequest();
                xmlhttp4.open("GET", encodeURI(shape._nameSpace.getURL(
                                        shape._cf.geometry.node._vf.color)), true);
                xmlhttp4.responseType = "arraybuffer";
            
                shape._nameSpace.doc.downloadCount += 1;
            
                xmlhttp4.send(null);
            
                xmlhttp4.onload = function() 
                {
                    if (!shape._webgl)
                        return;
                    
                    var XHR_buffer = xmlhttp4.response;

                    var attribTypeStr = shape._cf.geometry.node._vf.colorType;
                    shape._webgl.colorType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

                    var colors = x3dom.Utils.getArrayBufferView(attribTypeStr, XHR_buffer);
                    
                    if (createTriangleSoup) {
                        shape._webgl.makeSeparateTris.pushBuffer("color", colors);
                        return;
                    }

                    var colorBuffer = gl.createBuffer();
                    shape._webgl.buffers[4] = colorBuffer;

                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);             

                    gl.vertexAttribPointer(sp.color, 
                        shape._cf.geometry.node._mesh._numColComponents, 
                        shape._webgl.colorType, false,
                        shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.color);

                    // Test reading Data
                    //x3dom.debug.logWarning("arraybuffer[0].cx="+colors[0]);  

                    colors = null;

                    shape._nameSpace.doc.downloadCount -= 1;
					shape._webgl.internalDownloadCount -= 1;
					if(shape._webgl.internalDownloadCount == 0)
						shape._nameSpace.doc.needRender = true;

                    var t11 = new Date().getTime() - t00;   
                    x3dom.debug.logInfo("XHR4/ color load time: " + t11 + " ms");
                };
            }
            
            // TODO: tangent AND binormal
        }
    //################
    // PopGeometry
    //################
    else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.PopGeometry))
	{ 
      (function() {
      
        var popGeo = shape._cf.geometry.node;
        
        //reserve space for vertex buffer (and index buffer if any) on the gpu        
        if (popGeo.hasIndex()) {        
          shape._webgl.popGeometry = 1;
          
          shape._webgl.buffers[0] = gl.createBuffer();
          
          //this call allocates some gpu memory and initializes it to 0
          //(note that 16 bit indices are the only possibility by now)
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[0]);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, popGeo.getTotalNumberOfIndices()*2, gl.STATIC_DRAW);
        }
        else {
          shape._webgl.popGeometry = -1;
        }

        shape._webgl.buffers[1] = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[1]);
        gl.bufferData(gl.ARRAY_BUFFER, (popGeo._vf.attributeStride * popGeo._vf.vertexBufferSize), gl.STATIC_DRAW);


        //setup general render settings
        var attribTypeStr      = popGeo.getBufferTypeStringFromByteCount(popGeo.getPositionPrecision());        
        shape._webgl.coordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);

        shape._coordStrideOffset[0] = popGeo.getAttributeStride();
        shape._coordStrideOffset[1] = popGeo.getPositionOffset();           

        gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, shape._webgl.coordType,
                               false, shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
        gl.enableVertexAttribArray(sp.position);

        if (popGeo.hasNormal()) {
          attribTypeStr           = popGeo.getBufferTypeStringFromByteCount(popGeo.getNormalPrecision());
          shape._webgl.normalType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
          
          shape._normalStrideOffset[0] = popGeo.getAttributeStride();
          shape._normalStrideOffset[1] = popGeo.getNormalOffset();           
          
          shape._webgl.buffers[2] = shape._webgl.buffers[1]; //use interleaved vertex data buffer
          
          gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents, shape._webgl.normalType,
                                 false, shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
          gl.enableVertexAttribArray(sp.normal);
        }
        if (popGeo.hasTexCoord()) {
          attribTypeStr             = popGeo.getBufferTypeStringFromByteCount(popGeo.getTexCoordPrecision());
          shape._webgl.texCoordType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
          
          shape._webgl.buffers[3] = shape._webgl.buffers[1]; //use interleaved vertex data buffer
          
          shape._texCoordStrideOffset[0] = popGeo.getAttributeStride();
          shape._texCoordStrideOffset[1] = popGeo.getTexCoordOffset();    
          
          gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents, shape._webgl.texCoordType,
                                 false, shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
          gl.enableVertexAttribArray(sp.texcoord);
        }
        if (popGeo.hasColor()) {
          attribTypeStr          = popGeo.getBufferTypeStringFromByteCount(popGeo.getColorPrecision());
          shape._webgl.colorType = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);  
          
          shape._webgl.buffers[4] = shape._webgl.buffers[1]; //use interleaved vertex data buffer
          
          shape._colorStrideOffset[0] = popGeo.getAttributeStride();
          shape._colorStrideOffset[1] = popGeo.getColorOffset();           
          
          gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents, shape._webgl.colorType,
                                 false, shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
          gl.enableVertexAttribArray(sp.color);          
        }
        
        shape._webgl.currentNumIndices  = 0;
        shape._webgl.currentNumVertices = 0;
        shape._webgl.numVerticesAtLevel = [];
        shape._webgl.precisionLevel     = 0;
        shape._webgl.levelsAvailable    = 0;
        
        shape._webgl.levelLoaded = [];        
        (function(){ for (var i = 0; i < popGeo.getNumLevels(); ++i) shape._webgl.levelLoaded.push(false); })();
        
        //download callback, used to simply upload received vertex data to the GPU
        var uploadDataToGPU = function(data, lvl) {        
          //if (lvl > 4) return;
          
          x3dom.debug.logInfo("PopGeometry: Received data for level " + lvl + " !\n");
          shape._webgl.levelLoaded[lvl] = true;
          
          shape._webgl.numVerticesAtLevel[lvl] = 0;
          
          if (data) {          
              //perform gpu data upload
              var indexDataLengthInBytes = 0;
              var vertexDataLengthInBytes;
              
              var redrawNeeded = false;
              
              if (popGeo.hasIndex()) {
                indexDataLengthInBytes = popGeo.getNumIndicesByLevel(lvl)*2;
              
                if (indexDataLengthInBytes > 0) {
                    redrawNeeded = true;
                    
                    var indexDataView = new Uint8Array(data, 0, indexDataLengthInBytes);
                
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[0]);
                    //index data is always placed where it belongs, as we have to keep the order of rendering
                    (function() {
                        var indexDataOffset = 0;
                        
                        for (var i = 0; i < lvl; ++i) { indexDataOffset += popGeo.getNumIndicesByLevel(i); }
                        
                        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, indexDataOffset*2, indexDataView);
                    })();
                }
              }
              
              vertexDataLengthInBytes = data.byteLength - indexDataLengthInBytes;
              
              if (vertexDataLengthInBytes > 0) {
                  redrawNeeded = true;
                  
                  var attributeDataView = new Uint8Array(data, indexDataLengthInBytes, vertexDataLengthInBytes);
                  
                  gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[1]);
                  if (!popGeo.hasIndex()) {
                    //on non-indexed rendering, vertex data is just appended - the order of vertex data packages doesn't matter
                    gl.bufferSubData(gl.ARRAY_BUFFER, shape._webgl.currentNumVertices       * popGeo.getAttributeStride(), attributeDataView);
                  }
                  else {
                    //on indexed rendering, vertex data is always placed where it belongs, as we have to keep the indexed order
                    gl.bufferSubData(gl.ARRAY_BUFFER,popGeo.getVertexDataBufferOffset(lvl) * popGeo.getAttributeStride(), attributeDataView);
                  }
                  
                  //adjust render settings: vertex data
                  shape._webgl.numVerticesAtLevel[lvl] = vertexDataLengthInBytes / popGeo.getAttributeStride();
                  shape._webgl.currentNumVertices += shape._webgl.numVerticesAtLevel[lvl];
              }
              
              //update the shader's precision masking and compute number of valid indices
              (function() {
                var numValidIndices = 0;
                
                var allLoaded = true;
                
                for (var i = shape._webgl.levelsAvailable; i < popGeo.getNumLevels(); ++i) {                                
                    if (shape._webgl.levelLoaded[i] === false) {
                        allLoaded = false;
                        shape._webgl.precisionLevel = i; //precision in bits
                        break;
                    }
                    else {
                        numValidIndices += popGeo.getNumIndicesByLevel(i);
                        ++shape._webgl.levelsAvailable;
                    }
                }
                
                if (allLoaded) {
                    shape._webgl.precisionLevel = 16;
                }
                
                //adjust render settings: index data
                shape._webgl.currentNumIndices = numValidIndices;
              })();
              
              //here, we tell X3DOM how many faces / vertices get displayed in the stats
              popGeo._mesh._numCoords = shape._webgl.currentNumVertices;
              //@todo: this assumes pure TRIANGLES data
              popGeo._mesh._numFaces  = (popGeo.hasIndex() ? shape._webgl.currentNumIndices / 3 : shape._webgl.currentNumVertices / 3);
              
              //here, we tell X3DOM how many vertices get rendered
              //@todo: this assumes pure TRIANGLES data
              popGeo.adaptVertexCount(popGeo.hasIndex() ? popGeo._mesh._numFaces * 3 : popGeo._mesh._numCoords); 
              x3dom.debug.logInfo("PopGeometry: Loaded level " + lvl + " data to gpu, model has now " +
                                  popGeo._mesh._numCoords + " vertices and " + popGeo._mesh._numFaces + " triangles, " +
                                  (new Date().getTime() - shape._webgl.downloadStartTimer) + " ms after posting download requests, " +
                                  "displaying with " + shape._webgl.precisionLevel + " bits prec.");                                  
              
                
              //request redraw, if necessary
              if (redrawNeeded) {
                shape._nameSpace.doc.needRender = true;
              }
          }          
        };
         
        //post XHRs
        var dataURLs = popGeo.getDataURLs();
        
        var downloadCallbacks = [];
        var priorities        = [];     
        
        shape._webgl.downloadStartTimer = new Date().getTime();
                
        //CODE WITHOUT DL MANAGER
      /*
        for (var i = 0; i < dataURLs.length; ++i) {        
          shape._nameSpace.doc.downloadCount += 1;
          
          var xhrequest = new XMLHttpRequest();
          //var order = [0,4,2,8,1,3,7,5,6,9,10,11,12];
          (function(xhr, idx){          
            xhr.open("GET", dataURLs[i], true);
            //xhr.open("GET", dataURLs[order[i]], true);
            xhr.responseType = "arraybuffer";
            
            xhr.onload = function() {
              shape._nameSpace.doc.downloadCount -= 1;              
              return uploadDataToGPU(xhr.response, idx);
            };
          
            xhr.send(null);            
          })(xhrequest, i);
          //})(xhrequest, order[i]);
        }
    */
        //END CODE WITHOUT DL MANAGER
        
        //CODE WITH DL MANAGER
        //use the DownloadManager to prioritize loading        
           
        for (var i = 0; i < dataURLs.length; ++i) {
          shape._nameSpace.doc.downloadCount += 1;
          
          (function(idx) {
            downloadCallbacks.push(function(data) {
              shape._nameSpace.doc.downloadCount -= 1;              
              return uploadDataToGPU(data, idx);
            });
          })(i);
          
          priorities.push(i);
        }        
        
        x3dom.DownloadManager.get(dataURLs, downloadCallbacks, priorities);
    
        //END CODE WITH DL MANAGER
      })();      
    }
    //################
    //(end PopGeometry)
    //################
		else if(x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.BitLODGeometry))
		{	
			var that = this;
		
			shape._webgl.bitLODGeometry = -1;
		
			var bitLODGeometry = shape._cf.geometry.node;

			//Get number of components
			var numComponents = bitLODGeometry.getNumComponents();

			//Check if components available
			if(numComponents)
			{
				//Check if there are indices avaible
				if(bitLODGeometry.hasIndex())
				{
                  //this function generates a single, large triangle buffer out of
                  //  - an index buffer containing indices of TRIANGLES / TRIANGLE STRIPS
                  //  - a set of data buffers containing the triangle data          
                  shape._webgl.generateTriangleBuffer = function() {
                    if (typeof shape._webgl.dataBuffers[0] != 'undefined' &&
                        (typeof shape._webgl.dataBuffers[1] != 'undefined' || //positions & normals
                         typeof shape._webgl.dataBuffers[3] != 'undefined' || //texcoords
                         typeof shape._webgl.dataBuffers[4] != 'undefined'    //colors
                         )) {
                
                var indexArray = shape._webgl.dataBuffers[0];
                
                var read_idx_pos_nor;
                var read_idx_tc;
                var read_idx_col;
                var write_idx;
                var i;
                
                var n_theta   = 0;
                var n_phi     = 0;
                var accum_cnt = 0;
                var points    = [new x3dom.fields.SFVec3f(0, 0, 0),
                                 new x3dom.fields.SFVec3f(0, 0, 0),
                                 new x3dom.fields.SFVec3f(0, 0, 0)];
                var nor = new x3dom.fields.SFVec3f(0, 0, 0);
                var v1  = new x3dom.fields.SFVec3f(0, 0, 0);
                var v2  = new x3dom.fields.SFVec3f(0, 0, 0);
                             
                var coordsNormalsAvailable = (typeof shape._webgl.dataBuffers[1] != 'undefined' && shape._webgl.dataBuffers[1].length > 0);
                var texCoordsAvailable     = (typeof shape._webgl.dataBuffers[3] != 'undefined' && shape._webgl.dataBuffers[3].length > 0);
                var colorsAvailable        = (typeof shape._webgl.dataBuffers[4] != 'undefined' && shape._webgl.dataBuffers[4].length > 0);                
                
                var posNorEntriesPerElement = (shape._cf.geometry.node._mesh._numNormComponents == 2 ? 6 : 8);
                var stride = posNorEntriesPerElement + (bitLODGeometry.hasTexCoord() ? 2 : 0) + (bitLODGeometry.hasColor() ? 4 : 0);
                
                if (typeof shape._webgl.triangleBuffer == 'undefined') {
                  //6 to 12 entries per element:
                  //px py pz + 0 + nt np [+ s t] [+ r g b + 0]
                  //px py pz + 0 + nx ny nz + 0 + [+ s t] [+ r g b + 0]
                  shape._webgl.triangleBuffer = new Uint16Array(indexArray.length * stride);
                }
                
                for (i = 0; i < indexArray.length; ++i) {
                    write_idx = i * stride;

                    if (coordsNormalsAvailable) {
                        read_idx_pos_nor = indexArray[i] * 6;

                        //write coords                    
                        shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[1][read_idx_pos_nor    ];
                        shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 1];
                        shape._webgl.triangleBuffer[write_idx + 2] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 2];
                        shape._webgl.triangleBuffer[write_idx + 3] = 0;

                        //write normals                    
                        //A: use transmitted per-vertex-normals
                        if (bitLODGeometry._vf.normalPerVertex) {
                            shape._webgl.triangleBuffer[write_idx + 4] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 4];
                            shape._webgl.triangleBuffer[write_idx + 5] = shape._webgl.dataBuffers[1][read_idx_pos_nor + 5];
                        }
                        else if (true || shape._webgl.loadedLevels === 8) {                        
                            //B: on-the-fly normal computation for per-face normals (by cross product)
/*
                            points[accum_cnt].x = shape._webgl.dataBuffers[1][read_idx_pos_nor    ];
                            points[accum_cnt].y = shape._webgl.dataBuffers[1][read_idx_pos_nor + 1];
                            points[accum_cnt].z = shape._webgl.dataBuffers[1][read_idx_pos_nor + 2];

                            if (++accum_cnt === 3) {
                                v1 = points[1].subtract(points[0]);
                                v2 = points[2].subtract(points[0]);
                                
                                nor = v1.cross(v2);
                                
                                nor = nor.normalize();
                                
                                //map to positive integers
                                nor = nor.add(new x3dom.fields.SFVec3f(1.0, 1.0, 1.0));
                                nor = nor.multiply(0.5);
                                nor = nor.multiply(shape._cf.geometry.node.getPrecisionMax('normalType'));
                                
                                shape._webgl.triangleBuffer[write_idx + 4 - stride*2] = nor.x.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 5 - stride*2] = nor.y.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 6 - stride*2] = nor.z.toFixed(0);
                                
                                shape._webgl.triangleBuffer[write_idx + 4 - stride  ] = nor.x.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 5 - stride  ] = nor.y.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 6 - stride  ] = nor.z.toFixed(0);
                                
                                shape._webgl.triangleBuffer[write_idx + 4           ] = nor.x.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 5           ] = nor.y.toFixed(0);
                                shape._webgl.triangleBuffer[write_idx + 6           ] = nor.z.toFixed(0);
                                
                                accum_cnt = 0;
                            }
                            */
                            //C: on-the-fly normal computation for per-face normals (by averaging)
                            //**
                            //AVERAGING WITH SPHERICAL COORDS
                            n_theta += shape._webgl.dataBuffers[1][read_idx_pos_nor + 4];                            
                            n_phi   += shape._webgl.dataBuffers[1][read_idx_pos_nor + 5];                            
                            //**
                            
                            //--
                            //AVERAGING WITH CARTESIAN COORDS
                            /*
                            n_theta = shape._webgl.dataBuffers[1][read_idx_pos_nor + 4];
                            n_phi   = shape._webgl.dataBuffers[1][read_idx_pos_nor + 5];
                            
                            n_theta /= 65535.0;
                            n_phi   /= 65535.0;                            
                            n_theta *= Math.PI;
                            n_phi    = n_phi * Math.PI * 2.0 - Math.PI;
                            
                            points[0].x += Math.sin(n_theta) * Math.cos(n_phi);
                            points[0].y += Math.sin(n_theta) * Math.sin(n_phi);
                            points[0].z += Math.cos(n_theta);
                            */
                            //--
                            
                            if (++accum_cnt === 3) {
                              //**
                              //AVERAGING WITH SPHERICAL COORDS
                              n_theta /= 3.0;
                              n_phi   /= 3.0;
                              //**
                              
                              //--
                              //AVERAGING WITH CARTESIAN COORDS
                              /*
                              points[0].x /= 3.0;
                              points[0].y /= 3.0;
                              points[0].z /= 3.0;
                                                            
                              n_theta = Math.acos(points[0].z);
                              n_phi   = Math.atan2(points[0].y, points[0].x);
                            
                              points[0].x = 0;
                              points[0].y = 0;
                              points[0].z = 0;
                              
                              n_theta = (n_theta		  /         Math.PI ) * (256 - 1) * 256;
                              n_phi   = ((n_phi + Math.PI) / (2.0 * Math.PI)) * (256 - 1) * 256;
                              */
                              //--
                              shape._webgl.triangleBuffer[write_idx + 4 - 2*stride] = n_theta;
                              shape._webgl.triangleBuffer[write_idx + 5 - 2*stride] = n_phi;
                              
                              shape._webgl.triangleBuffer[write_idx + 4 - stride  ] = n_theta;
                              shape._webgl.triangleBuffer[write_idx + 5 - stride  ] = n_phi;
                              
                              shape._webgl.triangleBuffer[write_idx + 4           ] = n_theta;
                              shape._webgl.triangleBuffer[write_idx + 5           ] = n_phi;
                              
                              n_theta = n_phi = accum_cnt = 0;
                            }
                            
                        }
                    }

                    write_idx += posNorEntriesPerElement;

                    if (texCoordsAvailable) {                    
                        read_idx_tc = indexArray[i] * 2;

                        //write texcoords
                        shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[3][read_idx_tc    ];
                        shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[3][read_idx_tc + 1];

                        write_idx += 2;
                    }

                    if (colorsAvailable) {                     
                        read_idx_col = indexArray[i] * 4;

                        //write colors
                        shape._webgl.triangleBuffer[write_idx    ] = shape._webgl.dataBuffers[4][read_idx_col    ];
                        shape._webgl.triangleBuffer[write_idx + 1] = shape._webgl.dataBuffers[4][read_idx_col + 1];
                        shape._webgl.triangleBuffer[write_idx + 2] = shape._webgl.dataBuffers[4][read_idx_col + 2];
                        shape._webgl.triangleBuffer[write_idx + 3] = 0;

                        write_idx += 4;
                    }                    
                }

                //upload triangle buffer to the gpu and configure attributes
                var glBuf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
                gl.bufferData(gl.ARRAY_BUFFER, shape._webgl.triangleBuffer, gl.STATIC_DRAW);

                var attribTypeStr 		= bitLODGeometry._vf.coordType;                
                shape._webgl.coordType  = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
                shape._webgl.normalType = shape._webgl.coordType;

                shape._coordStrideOffset[0]  = shape._normalStrideOffset[0] = stride*2;
                shape._coordStrideOffset[1]  = 0;
                shape._normalStrideOffset[1] = 4*2;                
                
                shape._webgl.buffers[1] = glBuf;
                shape._webgl.buffers[2] = glBuf;
                
                gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, 
                                       shape._webgl.coordType, false, shape._coordStrideOffset[0],
                                       shape._coordStrideOffset[1]);                
                gl.enableVertexAttribArray(sp.position);

                gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents, 
                                       shape._webgl.normalType, false, shape._coordStrideOffset[0],
                                       shape._coordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.normal);
                                
                if (bitLODGeometry.hasTexCoord()) {
                  shape._webgl.texCoordType = shape._webgl.coordType;
                  shape._webgl.buffers[3] = glBuf;
                  
                  shape._texCoordStrideOffset[0] = stride*2;
                  shape._texCoordStrideOffset[1] = posNorEntriesPerElement*2;
                                         
                  gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents, 
                                         shape._webgl.texCoordType, false, shape._texCoordStrideOffset[0],
                                         shape._texCoordStrideOffset[1]);
                  gl.enableVertexAttribArray(sp.texcoord);
                }
                
                if (bitLODGeometry.hasColor()) {
                  shape._webgl.colorType  = shape._webgl.coordType;
                  shape._webgl.buffers[4] = glBuf;
                  
                  shape._colorStrideOffset[0] = stride*2;
                  shape._colorStrideOffset[1] = bitLODGeometry.hasTexCoord() ? (posNorEntriesPerElement+2)*2 : posNorEntriesPerElement*2;
                  
                  gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents, 
                                         shape._webgl.colorType, false, shape._colorStrideOffset[0],
                                         shape._colorStrideOffset[1]);
                  gl.enableVertexAttribArray(sp.color);
                }
            }      
          };
           
        shape._webgl.bitLODGeometry = 1;    // indexed BLG
        var xmlhttpLOD = new XMLHttpRequest();
        xmlhttpLOD.open("GET", encodeURI(shape._nameSpace.getURL(bitLODGeometry._vf.index)) , true);
        xmlhttpLOD.responseType = "arraybuffer";

        shape._nameSpace.doc.downloadCount += 1;

        xmlhttpLOD.send(null);

        xmlhttpLOD.onload = function()
        {
            var XHR_buffer = xmlhttpLOD.response;

            var indexArray;
            
            if (bitLODGeometry.usesVLCIndices()) {
                          
              //variable-length decoding, indexed triangle strips are converted to indexed triangles
              (function(){
                if (typeof shape._webgl.dataBuffers == 'undefined')
                  shape._webgl.dataBuffers = [];
                
                shape._webgl.dataBuffers[0] = [];
                
                var codes = x3dom.Utils.getArrayBufferView("Uint8", XHR_buffer);
                var i = 0;
                var b;
                var delta;
                var magic_number;
                var value = 0;

                var vertexIdx = 0;
                var primIdx   = 0;
                var lastVal   = -1, preLastVal = -1;
              
                while (i < codes.length) {
                    if (vertexIdx >= shape._cf.geometry.node._vf.vertexCount[primIdx]) {
                        ++primIdx;
                        vertexIdx = 0;                        
                    }
                                
                    b = codes[i++];

                    delta        = 0;
                    magic_number = 128;

                    //read bytes while the marker bit (first one) is set
                    while (b >= 128) {
                        delta |= b - 128;
                        delta <<= 7;

                        magic_number <<= 7;

                        b = codes[i++];
                    }

                    delta |= b;

                    magic_number /= 2;                  
                    delta -= magic_number;

                    value = value + delta;
                    
                    if (shape._webgl.primType[primIdx] == gl.TRIANGLE_STRIP) {
                        if (vertexIdx < 3) {
                            shape._webgl.dataBuffers[0].push(value);
                        }
                        else if ((vertexIdx % 2) == 0) {
                            shape._webgl.dataBuffers[0].push(preLastVal);
                            shape._webgl.dataBuffers[0].push(lastVal);
                            shape._webgl.dataBuffers[0].push(value);
                        }
                        else {
                            shape._webgl.dataBuffers[0].push(lastVal);
                            shape._webgl.dataBuffers[0].push(preLastVal);
                            shape._webgl.dataBuffers[0].push(value);
                        }
                        
                        preLastVal = lastVal;
                        lastVal    = value;
                    }
                    else {
                        shape._webgl.dataBuffers[0].push(value);                        
                    }
                    
                    ++vertexIdx;                    
                }                
              }());

              //switch to non-indexed rendering
              shape._webgl.bitLODGeometry = -1;

              //create triangle render buffer with normals computed on-the-fly
              //(if data is already available ...)              
              shape._webgl.generateTriangleBuffer();
              
              bitLODGeometry._mesh._numFaces  = shape._webgl.dataBuffers[0].length / 3;
              bitLODGeometry._mesh._numCoords = shape._webgl.dataBuffers[0].length;
            }
            else
            {            
                var indicesBuffer = gl.createBuffer();
                shape._webgl.buffers[0] = indicesBuffer;

                indexArray = x3dom.Utils.getArrayBufferView("Uint16", XHR_buffer);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
              
                if (bitLODGeometry.getVertexCount(0) == 0)
                    bitLODGeometry.setVertexCount(0, indexArray.length);
                
                bitLODGeometry._mesh._numFaces = 0;
            
                for (var p=0; p<bitLODGeometry.getNumPrimTypes(); p++) {
                    if (shape._webgl.primType[p] == gl.TRIANGLE_STRIP)
                        bitLODGeometry._mesh._numFaces += bitLODGeometry.getVertexCount(p) - 2;
                    else
                        bitLODGeometry._mesh._numFaces += bitLODGeometry.getVertexCount(p) / 3;
                }            
            }

            indexArray = null;

            shape._nameSpace.doc.downloadCount -= 1;
            shape._nameSpace.doc.needRender = true;
        };
        }  	        
        function callBack(attributeId, bufferView)
        {	          
          if (typeof shape._webgl.loadedLevels == 'undefined')
            shape._webgl.loadedLevels = 0;
            
          shape._webgl.loadedLevels++;
          
          if (bitLODGeometry.hasIndex() && bitLODGeometry.usesVLCIndices()) {
            if (typeof shape._webgl.dataBuffers == 'undefined')
                  shape._webgl.dataBuffers = [];

            if (attributeId === 0) {
              shape._webgl.dataBuffers[1] = bufferView;
            }
            else if (attributeId === 1) {
              shape._webgl.dataBuffers[3] = bufferView;
            }
            else if (attributeId === 2) {
              shape._webgl.dataBuffers[4] = bufferView;
            }
            
            shape._webgl.generateTriangleBuffer();
          }
          else
          {
            var buffer = gl.createBuffer();
          
            if (attributeId === 0) {
              var attribTypeStr 		= bitLODGeometry._vf.coordType;
                
              shape._webgl.coordType  = x3dom.Utils.getVertexAttribType(attribTypeStr, gl);
              shape._webgl.normalType = shape._webgl.coordType;
          
              // calculate number of single data packages by including stride and type size					
              var dataLen = shape._coordStrideOffset[0] / x3dom.Utils.getDataTypeSize(attribTypeStr);
              //@todo: we need numCoords before this callback is invoked
              if (dataLen && bitLODGeometry._vf.normalPerVertex)
                bitLODGeometry._mesh._numCoords = bufferView.length / dataLen;
              
              //Positions
              shape._webgl.buffers[1] = buffer;
              
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);
              
              gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, 
                                     shape._webgl.coordType, false, 
                           shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
              gl.enableVertexAttribArray(sp.position);

              //Normals
              shape._webgl.buffers[2] = buffer;
              
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);
              
              gl.vertexAttribPointer(sp.normal, shape._cf.geometry.node._mesh._numNormComponents, 
                        shape._webgl.normalType, false, 
                        shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
              gl.enableVertexAttribArray(sp.normal);
            } 
            else if (attributeId === 1) 
            {
              shape._webgl.texCoordType = shape._webgl.coordType;
              shape._webgl.buffers[3] = buffer;
              
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);
              
              gl.vertexAttribPointer(sp.texcoord, shape._cf.geometry.node._mesh._numTexComponents, 
                           shape._webgl.texCoordType, false, 
                           shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
              gl.enableVertexAttribArray(sp.texcoord);
            } 
            else if (attributeId === 2) 
            {
              shape._webgl.colorType = shape._webgl.coordType;
              shape._webgl.buffers[4] = buffer;
              
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.bufferData(gl.ARRAY_BUFFER, bufferView, gl.STATIC_DRAW);
              
              gl.vertexAttribPointer(sp.color, shape._cf.geometry.node._mesh._numColComponents, 
                           shape._webgl.colorType, false, 
                           shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
              gl.enableVertexAttribArray(sp.color);
            }
            
            bufferView = null;
					}
          
				  //shape._nameSpace.doc.downloadCount -= 1;
					shape._nameSpace.doc.needRender = true;
					
					shape._webgl.refinementJobManager.continueProcessing(attributeId);
				}


				//If there is still no BitComposer create a new one 
				//shape._webgl.bitLODComposer = new x3dom.BitLODComposer();
				shape._webgl.refinementJobManager = new x3dom.RefinementJobManager();
			
				//allocate buffers, pass them to the refinement manager
				//@todo: method returns number of index entries - at the moment, we have no mechanism to get the 
        //       real number of vertices here, so we usually allocate too much memory
				var numVerts = bitLODGeometry.getNumVertices();
		  
				var buf = new ArrayBuffer(12 * numVerts);  
				var interleavedCoordNormalBuffer = new Uint16Array(buf);
				
				shape._webgl.refinementJobManager.addResultBuffer(0, interleavedCoordNormalBuffer);    

				for (var i = 0; i < bitLODGeometry.getCoordNormalURLs().length; ++i) {
					shape._webgl.refinementJobManager.addRefinementJob(
						0,                                     //attributeId / resultBufferId
						i,                                     //download priority
						bitLODGeometry.getCoordNormalURLs()[i],//data file url
						i,                                     //refinement level (-> important for bit shift)
						callBack,                              //'job finished'-callback
						96,                                    //stride in bits (size of a single result element)
						[3, 2],                                //number of components information array
						[6, 2],                                //bits per refinement level information array
						[0, 6],                                //read offset (bits) information array
						[0, 64]);                              //write offset (bits) information array                                       
				}
				
				if(bitLODGeometry.hasTexCoord()) {
					var tBuf = new ArrayBuffer(4 * numVerts);  
					var texCoordBuffer = new Uint16Array(tBuf);
					
					shape._webgl.refinementJobManager.addResultBuffer(1, texCoordBuffer);
					
					for (i = 0; i < bitLODGeometry.getTexCoordURLs().length; ++i) {
						shape._webgl.refinementJobManager.addRefinementJob(
							1,                           		//attributeId / resultBufferId
							i,                           		//download priority
							bitLODGeometry.getTexCoordURLs()[i], //data file url
							i,                           		//refinement level (-> important for bit shift)
							callBack,  							        //'job finished'-callback
							32,                          		//stride in bits (size of a single result element)
							[2],                         		//number of components information array
							[8],                         		//bits per refinement level information array
							[0],                         		//read offset (bits) information array
							[0]);                        		//write offset (bits) information array                                       
					}
				}
				
				if(bitLODGeometry.hasColor()) {
					var cBuf = new ArrayBuffer(6 * numVerts);  
					var colorBuffer = new Uint16Array(cBuf);
					
					shape._webgl.refinementJobManager.addResultBuffer(2, colorBuffer);
					
					for (i = 0; i < bitLODGeometry.getColorURLs().length; ++i) {
						shape._webgl.refinementJobManager.addRefinementJob(
							2,                           		//attributeId / resultBufferId
							i,                           		//download priority
							bitLODGeometry.getColorURLs()[i],	//data file url
							i,                           		//refinement level (-> important for bit shift)
							callBack,  							        //'job finished'-callback
							48,                          		//stride in bits (size of a single result element)
							[3],                         		//number of components information array
							[6],                         		//bits per refinement level information array
							[0],                         		//read offset (bits) information array
							[0]);                        		//write offset (bits) information array                                       
					}
				}
			}
		}		
		else if(x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.ImageGeometry))
		{
			//Get ImageGeometry
			var imageGeometry = shape._cf.geometry.node;
		
			if ( imageGeometry.getIndexTexture() ) {
				shape._webgl.imageGeometry = 1;
			} else {
				shape._webgl.imageGeometry = -1;
			}

			shape._cf.geometry.node._dirty.coord = false;
			shape._cf.geometry.node._dirty.normal = false;
			shape._cf.geometry.node._dirty.texCoord = false;
			shape._cf.geometry.node._dirty.color = false;
			shape._cf.geometry.node._dirty.index = false;
		
			if (this.IG_PositionBuffer == null) {
				this.IG_PositionBuffer = gl.createBuffer();
			}
            shape._webgl.buffers[1] = this.IG_PositionBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.IG_PositionBuffer);
            
            vertices = new Float32Array(shape._webgl.positions[0]);
            
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.IG_PositionBuffer);
            
            gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, 
                shape._webgl.coordType, false,
                shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
            gl.enableVertexAttribArray(sp.position);

            vertices = null;
		}
        else // No BinaryMesh -- FIXME
        {
            
            for (q=0; q<shape._webgl.positions.length; q++)
            {
              if (sp.position !== undefined) 
              {
                // bind indices for drawElements() call
                var indicesBuffer = gl.createBuffer();
                shape._webgl.buffers[5*q+0] = indicesBuffer;
            
                var indexArray = new Uint16Array(shape._webgl.indexes[q]);
            
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
            
                indexArray = null;
            
                positionBuffer = gl.createBuffer();
                shape._webgl.buffers[5*q+1] = positionBuffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            
                vertices = new Float32Array(shape._webgl.positions[q]);
            
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            
                gl.vertexAttribPointer(sp.position, 
                    shape._cf.geometry.node._mesh._numPosComponents, 
                    shape._webgl.coordType, false,
                    shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.position);

                vertices = null;
              }
              if (sp.normal !== undefined) 
              {
                var normalBuffer = gl.createBuffer();
                shape._webgl.buffers[5*q+2] = normalBuffer;
            
                var normals = new Float32Array(shape._webgl.normals[q]);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);                
            
                gl.vertexAttribPointer(sp.normal, 
                    shape._cf.geometry.node._mesh._numNormComponents, 
                    shape._webgl.normalType, false,
                    shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
                gl.enableVertexAttribArray(sp.normal);

                normals = null;
              }
              if (sp.texcoord !== undefined)
              {
                var texcBuffer = gl.createBuffer();
                shape._webgl.buffers[5*q+3] = texcBuffer;
            
                var texCoords = new Float32Array(shape._webgl.texcoords[q]);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            
                gl.vertexAttribPointer(sp.texcoord, 
                    shape._cf.geometry.node._mesh._numTexComponents, 
                    shape._webgl.texCoordType, false,
                    shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
                gl.enableVertexAttribArray(sp.texcoord);
                
                texCoords = null;
              }
              if (sp.color !== undefined)
              {
                var colorBuffer = gl.createBuffer();
                shape._webgl.buffers[5*q+4] = colorBuffer;
            
                var colors = new Float32Array(shape._webgl.colors[q]);

                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);             
            
                gl.vertexAttribPointer(sp.color, 
                    shape._cf.geometry.node._mesh._numColComponents, 
                    shape._webgl.colorType, false,
                    shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
                gl.enableVertexAttribArray(sp.color);
                
                colors = null;
              }
            }
        
            // TODO; FIXME; what if geometry with split mesh has dynamic fields?
            for (var df in shape._cf.geometry.node._mesh._dynamicFields)
            {
                var attrib = shape._cf.geometry.node._mesh._dynamicFields[df];
            
                shape._webgl.dynamicFields[currAttribs] = {
                      buf: {}, name: df, numComponents: attrib.numComponents };
            
                if (sp[df] !== undefined)
                {
                    var attribBuffer = gl.createBuffer();
                    shape._webgl.dynamicFields[currAttribs++].buf = attribBuffer;
                
                    var attribs = new Float32Array(attrib.value);
                
                    gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, attribs, gl.STATIC_DRAW);                
                
                    gl.vertexAttribPointer(sp[df], attrib.numComponents, gl.FLOAT, false, 0, 0); 

                    attribs = null;
                }
            }
            
        } // No BinaryGeometry -- FIXME
    };
    
	
	/*****************************************************************************
    * Mainly manages rendering of backgrounds and buffer clearing
    *****************************************************************************/
    Context.prototype.setupScene = function(gl, bgnd) {
        var sphere;
        var texture;
        
        if (bgnd._webgl !== undefined)
        {
            if (!bgnd._dirty) {
                return;
            }
            
            if (bgnd._webgl.texture !== undefined && bgnd._webgl.texture)
            {
                gl.deleteTexture(bgnd._webgl.texture);
            }
            if (bgnd._webgl.shader && bgnd._webgl.shader.position !== undefined)
            {
                gl.deleteBuffer(bgnd._webgl.buffers[1]);
                gl.deleteBuffer(bgnd._webgl.buffers[0]);
            }
            if (bgnd._webgl.shader && bgnd._webgl.shader.texcoord !== undefined)
            {
                gl.deleteBuffer(bgnd._webgl.buffers[2]);
            }
            bgnd._webgl = {};
        }
        
        bgnd._dirty = false;
        
        var url = bgnd.getTexUrl();
        var i = 0;
        var w = 1, h = 1;
        
        if (url.length > 0 && url[0].length > 0)
        {
            if (url.length >= 6 && url[1].length > 0 && url[2].length > 0 && 
                url[3].length > 0 && url[4].length > 0 && url[5].length > 0)
            {
                sphere = new x3dom.nodeTypes.Sphere();
                
                bgnd._webgl = {
                    positions: sphere._mesh._positions[0],
                    indexes: sphere._mesh._indices[0],
                    buffers: [{}, {}]
                };
                
                bgnd._webgl.primType = gl.TRIANGLES;
						
				bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_CUBETEXTURE);
                
                bgnd._webgl.texture = x3dom.Utils.createTextureCube(gl, bgnd._nameSpace.doc, url, true);
            }
            else {
                texture = gl.createTexture();
                
                var image = new Image();
                image.crossOrigin = '';
                
                image.onload = function() {
                    bgnd._nameSpace.doc.needRender = true;
                    bgnd._nameSpace.doc.downloadCount -= 1;
                    
                    bgnd._webgl.texture = texture;
                    //x3dom.debug.logInfo(texture + " load tex url: " + url[0]);
                    
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                };

                image.onerror = function()
                {
                    bgnd._nameSpace.doc.downloadCount -= 1;

                    x3dom.debug.logError("Can't load tex url: " + url[0]);
                };
                
                image.src = bgnd._nameSpace.getURL(url[0]);
                bgnd._nameSpace.doc.downloadCount += 1;
                
                bgnd._webgl = {
                    positions: [-w,-h,0, -w,h,0, w,-h,0, w,h,0],
                    indexes: [0, 1, 2, 3],
                    buffers: [{}, {}]
                };

                bgnd._webgl.primType = gl.TRIANGLE_STRIP;

				bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_TEXTURE);
            }
        }
        else 
        {          
            if (bgnd.getSkyColor().length > 1 || bgnd.getGroundColor().length) 
            {
                sphere = new x3dom.nodeTypes.Sphere();
                texture = gl.createTexture();
                
                bgnd._webgl = {
                    positions: sphere._mesh._positions[0],
                    texcoords: sphere._mesh._texCoords[0],
                    indexes: sphere._mesh._indices[0],
                    buffers: [{}, {}, {}],
                    texture: texture,
                    primType: gl.TRIANGLES
                };
                
                var N = x3dom.Utils.nextHighestPowerOfTwo(
                            bgnd.getSkyColor().length + bgnd.getGroundColor().length + 2);
                N = (N < 512) ? 512 : N;
                
                var n = bgnd._vf.groundAngle.length;
                var tmp = [], arr = [];
                var colors = [], sky = [0];
                
                for (i=0; i<bgnd._vf.skyColor.length; i++) {
                    colors[i] = bgnd._vf.skyColor[i];
                }
                
                for (i=0; i<bgnd._vf.skyAngle.length; i++) {
                    sky[i+1] = bgnd._vf.skyAngle[i];
                }
                
                if (n > 0 || bgnd._vf.groundColor.length == 1) {
                    if (sky[sky.length-1] < Math.PI / 2) {
                        sky[sky.length] = Math.PI / 2 - x3dom.fields.Eps;
                        colors[colors.length] = colors[colors.length - 1];
                    }
                    
                    for (i=n-1; i>=0; i--) {
                        if ((i == n - 1) && (Math.PI - bgnd._vf.groundAngle[i] <= Math.PI / 2)) {
                            sky[sky.length] = Math.PI / 2;
                            colors[colors.length] = bgnd._vf.groundColor[bgnd._vf.groundColor.length-1];
                        }
                        sky[sky.length] = Math.PI - bgnd._vf.groundAngle[i];
                        colors[colors.length] = bgnd._vf.groundColor[i + 1];
                    }
                    
                    if (n == 0 && bgnd._vf.groundColor.length == 1) {
                        sky[sky.length] = Math.PI / 2;
                        colors[colors.length] = bgnd._vf.groundColor[0];
                    }
                    sky[sky.length] = Math.PI;
                    colors[colors.length] = bgnd._vf.groundColor[0];
                }
                else {
                    if (sky[sky.length-1] < Math.PI) {
                        sky[sky.length] = Math.PI;
                        colors[colors.length] = colors[colors.length - 1];
                    }
                }
                
                for (i=0; i<sky.length; i++) {
                    sky[i] /= Math.PI;
                }
                
                x3dom.debug.assert(sky.length == colors.length);
                
                var interp = new x3dom.nodeTypes.ColorInterpolator();
                
                interp._vf.key = new x3dom.fields.MFFloat(sky);
                interp._vf.keyValue = new x3dom.fields.MFColor(colors);
                
                for (i=0; i<N; i++) {
                    var fract = i / (N - 1.0);
                    interp._vf.set_fraction = fract;
                    interp.fieldChanged("set_fraction");
                    tmp[i] = interp._vf.value_changed;
                }
                
                tmp.reverse();
                
                for (i=0; i<tmp.length; i++) {
                    arr[3 * i + 0] = Math.floor(tmp[i].r * 255);
                    arr[3 * i + 1] = Math.floor(tmp[i].g * 255);
                    arr[3 * i + 2] = Math.floor(tmp[i].b * 255);
                }
                
                var pixels = new Uint8Array(arr);
                var format = gl.RGB;
                
                N = (pixels.length) / 3;
                
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, format, 1, N, 0, format, gl.UNSIGNED_BYTE, pixels);
            	gl.bindTexture(gl.TEXTURE_2D, null);
										
				bgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.BACKGROUND_SKYTEXTURE);
            }
            else 
            {
                // TODO; impl. gradient bg etc., e.g. via canvas 2d?
                bgnd._webgl = {};
            }
        }
        
        if (bgnd._webgl.shader)
        {
            var sp = bgnd._webgl.shader;
            
            var positionBuffer = gl.createBuffer();
            bgnd._webgl.buffers[1] = positionBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            
            var vertices = new Float32Array(bgnd._webgl.positions);
            
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            
            gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.position);
            
            var indicesBuffer = gl.createBuffer();
            bgnd._webgl.buffers[0] = indicesBuffer;
            
            var indexArray = new Uint16Array(bgnd._webgl.indexes);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
            
            vertices = null;
            indexArray = null;
            
            if (sp.texcoord !== undefined)
            {       
                var texcBuffer = gl.createBuffer();
                bgnd._webgl.buffers[2] = texcBuffer;
                
                var texcoords = new Float32Array(bgnd._webgl.texcoords);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, texcBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);              
                
                gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.texcoord);
                
                texcoords = null;
            }
        }
        
        bgnd._webgl.render = function(gl, mat_view, mat_proj)
        {
            var sp = bgnd._webgl.shader;
            var mat_scene = null;
            var projMatrix_22 = mat_proj._22,
                projMatrix_23 = mat_proj._23;
            
            if ((sp !== undefined && sp !== null) &&
                (sp.texcoord !== undefined && sp.texcoord !== null) &&
                (bgnd._webgl.texture !== undefined && bgnd._webgl.texture !== null))
            {
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                
                gl.frontFace(gl.CCW);
                gl.disable(gl.CULL_FACE);
                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.BLEND);
                
                sp.bind();
                
                if (!sp.tex) {
                    sp.tex = 0;
                }
                sp.alpha = 1.0;
                
                // adapt projection matrix to better near/far
                mat_proj._22 = 100001 / 99999;
                mat_proj._23 = 200000 / 99999;
                
                mat_scene = mat_proj.mult(mat_view);
                sp.modelViewProjectionMatrix = mat_scene.toGL();
                
                mat_proj._22 = projMatrix_22;
                mat_proj._23 = projMatrix_23;
                
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, bgnd._webgl.texture);
                
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgnd._webgl.buffers[0]);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[1]);
                gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.position);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[2]);
                gl.vertexAttribPointer(sp.texcoord, 2, gl.FLOAT, false, 0, 0); 
                gl.enableVertexAttribArray(sp.texcoord);
                
                try {
                    gl.drawElements(bgnd._webgl.primType, bgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
                }
                catch(e) {
                    x3dom.debug.logException("Render background: " + e);
                }
                
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
                
                gl.disableVertexAttribArray(sp.position);
                gl.disableVertexAttribArray(sp.texcoord);
                
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
            else if (!sp || !bgnd._webgl.texture ||
                (bgnd._webgl.texture.textureCubeReady !== undefined && 
                 bgnd._webgl.texture.textureCubeReady !== true))
            {
                var bgCol = bgnd.getSkyColor().toGL();
                bgCol[3] = 1.0 - bgnd.getTransparency();
                
                gl.clearColor(bgCol[0], bgCol[1], bgCol[2], bgCol[3]);
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
            else
            {
                gl.clearDepth(1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                
                gl.frontFace(gl.CCW);
                gl.disable(gl.CULL_FACE);
                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.BLEND);
                
                sp.bind();
                if (!sp.tex) {
                    sp.tex = 0;
                }
                
                if (bgnd._webgl.texture.textureCubeReady) {
                    // adapt projection matrix to better near/far
                    mat_proj._22 = 100001 / 99999;
                    mat_proj._23 = 200000 / 99999;

                    mat_scene = mat_proj.mult(mat_view);
                    sp.modelViewProjectionMatrix = mat_scene.toGL();

                    mat_proj._22 = projMatrix_22;
                    mat_proj._23 = projMatrix_23;
                    
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, bgnd._webgl.texture);
                    
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, bgnd._webgl.texture);
                    
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                }
                
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bgnd._webgl.buffers[0]);
                gl.bindBuffer(gl.ARRAY_BUFFER, bgnd._webgl.buffers[1]);
                gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(sp.position);
                
                try {
                    gl.drawElements(bgnd._webgl.primType, bgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
                }
                catch(e) {
                    x3dom.debug.logException("Render background: " + e);
                }
                
                gl.disableVertexAttribArray(sp.position);
                
                if (bgnd._webgl.texture.textureCubeReady) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }
                else {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            }
        };
    };
    
	
	/*****************************************************************************
    * Setup Frontgrounds
    *****************************************************************************/
    Context.prototype.setupFgnds = function (gl, scene)
    {
        if (scene._fgnd !== undefined) {
            return;
        }
        
        var w = 1, h = 1;
        scene._fgnd = {};
        
        scene._fgnd._webgl = {
            positions: [-w,-h,0, -w,h,0, w,-h,0, w,h,0],
            indexes: [0, 1, 2, 3],
            buffers: [{}, {}]
        };

        scene._fgnd._webgl.primType = gl.TRIANGLE_STRIP;
		
		scene._fgnd._webgl.shader = this.cache.getShader(gl, x3dom.shader.FRONTGROUND_TEXTURE);
        
        var sp = scene._fgnd._webgl.shader;
        
        var positionBuffer = gl.createBuffer();
        scene._fgnd._webgl.buffers[1] = positionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        var vertices = new Float32Array(scene._fgnd._webgl.positions);
        
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
        
        var indicesBuffer = gl.createBuffer();
        scene._fgnd._webgl.buffers[0] = indicesBuffer;
        
        var indexArray = new Uint16Array(scene._fgnd._webgl.indexes);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
        
        vertices = null;
        indexArray = null;
        
        scene._fgnd._webgl.render = function(gl, tex)
        {
            scene._fgnd._webgl.texture = tex;
            
            gl.frontFace(gl.CCW);
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);
            
            sp.bind();
            if (!sp.tex) {
                sp.tex = 0;
            }
            
            //gl.enable(gl.TEXTURE_2D);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, scene._fgnd._webgl.texture);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene._fgnd._webgl.buffers[0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, scene._fgnd._webgl.buffers[1]);
            gl.vertexAttribPointer(sp.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(sp.position);
            
            try {
                gl.drawElements(scene._fgnd._webgl.primType, 
                                scene._fgnd._webgl.indexes.length, gl.UNSIGNED_SHORT, 0);
            }
            catch(e) {
                x3dom.debug.logException("Render foreground: " + e);
            }
            
            gl.disableVertexAttribArray(sp.position);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            //gl.disable(gl.TEXTURE_2D);
        };
    };
    
	
	/*****************************************************************************
    * Render Shadow-Pass
    *****************************************************************************/
    Context.prototype.renderShadowPass = function(gl, scene, mat_light, mat_scene)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, scene._webgl.fboShadow.fbo);
        
        gl.viewport(0, 0, scene._webgl.fboShadow.width, scene._webgl.fboShadow.height);
        
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        
        var sp = scene._webgl.shadowShader;
        sp.bind();
        
        //var mat_light = scene.getLightMatrix();
        //var mat_scene = scene.getWCtoLCMatrix();
        var i, n = scene.drawableObjects.length;
        
        for (i=0; i<n; i++)
        {
            var trafo = scene.drawableObjects[i][0];
            var shape = scene.drawableObjects[i][1];
            
            sp.modelViewMatrix = mat_light.mult(trafo).toGL();
            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();
            
            for (var q=0; q<shape._webgl.positions.length; q++)
            {
				if(shape._webgl.buffers[5*q+0])
				{
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[5*q+0]);
				}
                if (sp.position !== undefined && shape._webgl.buffers[5*q+1]) 
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+1]);
                    
                    gl.vertexAttribPointer(sp.position, shape._cf.geometry.node._mesh._numPosComponents, 
                        shape._webgl.coordType, false,
                        shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
                    gl.enableVertexAttribArray(sp.position);
                }
                
                try {
                    if (shape._webgl.indexes && shape._webgl.indexes[q]) {
						if (shape._webgl.imageGeometry != 0 || shape._webgl.binaryGeometry < 0 ||
                            shape._webgl.popGeometry < 0    || shape._webgl.bitLODGeometry < 0) {
							for (var v=0, offset=0; v<shape._cf.geometry.node._vf.vertexCount.length; v++) {
								gl.drawArrays(shape._webgl.primType[v], offset, shape._cf.geometry.node._vf.vertexCount[v]);
								offset += shape._cf.geometry.node._vf.vertexCount[v];
							}
						}
						else if (shape._webgl.binaryGeometry > 0 || shape._webgl.popGeometry > 0 || 
						         shape._webgl.bitLODGeometry > 0) {
					        for (var v=0, offset=0; v<shape._cf.geometry.node._vf.vertexCount.length; v++) {
						        gl.drawElements(shape._webgl.primType[v], shape._cf.geometry.node._vf.vertexCount[v], 
						                        gl.UNSIGNED_SHORT, 2*offset);
						        offset += shape._cf.geometry.node._vf.vertexCount[v];
					        }
						}
    					else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedTriangleStripSet) &&
    					         shape._webgl.primType == gl.TRIANGLE_STRIP) {  // TODO; remove 2nd check
        				    var indOff = shape._cf.geometry.node._indexOffset;
        				    for (var io=1; io<indOff.length; io++) {
             					gl.drawElements(shape._webgl.primType, indOff[io]-indOff[io-1], gl.UNSIGNED_SHORT, 2*indOff[io-1]);
             				}
        				}
						else {
							gl.drawElements(shape._webgl.primType, shape._webgl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
						}
                    }
                }
                catch (e) {
                    x3dom.debug.logException(shape._DEF + " renderShadowPass(): " + e);
                }
                
                if (sp.position !== undefined) {
                    gl.disableVertexAttribArray(sp.position);
                }
            }
        }
        gl.flush();
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    
	/*****************************************************************************
    * Render Picking-Pass
    *****************************************************************************/
    Context.prototype.renderPickingPass = function(gl, scene, mat_view, mat_scene, 
                            from, sceneSize, pickMode, lastX, lastY, width, height)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, scene._webgl.fboPick.fbo);
        
        gl.viewport(0, 0, scene._webgl.fboPick.width, scene._webgl.fboPick.height);
        
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        
        var sp = null;
        if (pickMode === 0) {
			sp = scene._webgl.pickShader;
		}
        else if (pickMode === 1) { 
            sp = scene._webgl.pickColorShader; 
        }
        else if (pickMode === 2) {
            sp = scene._webgl.pickTexCoordShader; 
        }
        sp.bind();
        
        var bgCenter = new x3dom.fields.SFVec3f(0, 0, 0).toGL();
        var bgSize = new x3dom.fields.SFVec3f(1, 1, 1).toGL();
        
        for (var i=0; i<scene.drawableObjects.length; i++)
        {
            var trafo = scene.drawableObjects[i][0];
            var shape = scene.drawableObjects[i][1];
            
            if (shape._objectID < 1 || shape._webgl === undefined ||
                shape._vf.isPickable == false) {
                continue;
            }
            
            sp.modelMatrix = trafo.toGL();
            sp.modelViewProjectionMatrix = mat_scene.mult(trafo).toGL();

            sp.lowBit  = (shape._objectID & 255) / 255.0;
            sp.highBit = (shape._objectID >>> 8) / 255.0;

            sp.from = from.toGL();
            sp.sceneSize = sceneSize;
			
			//Set ImageGeometry switch
            sp.imageGeometry = shape._webgl.imageGeometry;
			
			if (shape._webgl.coordType != gl.FLOAT)
			{
			    if ( shape._webgl.bitLODGeometry != 0 || shape._webgl.popGeometry != 0 ||
                    (shape._cf.geometry.node._mesh._numPosComponents == 4 &&
        		     x3dom.Utils.isUnsignedType(shape._cf.geometry.node._vf.coordType)) )
        		    sp.bgCenter = shape._cf.geometry.node.getMin().toGL();
        		else
			        sp.bgCenter = shape._cf.geometry.node._vf.position.toGL();
			    sp.bgSize = shape._cf.geometry.node._vf.size.toGL();
    		    sp.bgPrecisionMax = shape._cf.geometry.node.getPrecisionMax('coordType');
    		}
    		else {
			    sp.bgCenter = bgCenter;
			    sp.bgSize   = bgSize;
    		    sp.bgPrecisionMax = 1;
    		}
    		if (shape._webgl.colorType != gl.FLOAT) {
    		    sp.bgPrecisionColMax = shape._cf.geometry.node.getPrecisionMax('colorType');
			}
			if (shape._webgl.texCoordType != gl.FLOAT) {
			    sp.bgPrecisionTexMax = shape._cf.geometry.node.getPrecisionMax('texCoordType');
			}
			
			if (shape._webgl.imageGeometry != 0 && !x3dom.caps.MOBILE)  // FIXME: mobile errors
			{
				sp.IG_bboxMin 				= shape._cf.geometry.node.getMin().toGL();
				sp.IG_bboxMax				= shape._cf.geometry.node.getMax().toGL();
				sp.IG_implicitMeshSize		= shape._cf.geometry.node._vf.implicitMeshSize.x;  // FIXME
				
				var tex = x3dom.Utils.findTextureByName(shape._webgl.texture, "IG_coords0");
				if(tex) {
					sp.IG_coordTextureWidth = tex.texture.width;
					sp.IG_coordTextureHeight = tex.texture.height;
				}
				
				if(shape._webgl.imageGeometry == 1) {
					tex = x3dom.Utils.findTextureByName(shape._webgl.texture, "IG_index");
					if(tex) {
						sp.IG_indexTextureWidth	 = tex.texture.width;
						sp.IG_indexTextureHeight = tex.texture.height;
					}
					
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, shape._webgl.texture[1].texture);
					
					gl.activeTexture(gl.TEXTURE1);
					gl.bindTexture(gl.TEXTURE_2D, shape._webgl.texture[2].texture);
				} else {
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, shape._webgl.texture[1].texture);
				}
				
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				
				var texUnit = 0;
				
				if(shape._cf.geometry.node.getIndexTexture()) {
					if(!sp.IG_indexTexture) {
						sp.IG_indexTexture = texUnit++;
					}
				}
				
				if(shape._cf.geometry.node.getCoordinateTexture(0)) {
					if(!sp.IG_coordinateTexture) {
						sp.IG_coordinateTexture = texUnit++;
					}
				}
			}

			for (var q=0; q<shape._webgl.positions.length; q++)
			{
				if(shape._webgl.buffers[5*q+0])
				{
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[5*q+0]);
				}
				if (sp.position !== undefined && shape._webgl.buffers[5*q+1]) 
				{	
					gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+1]);
					
					gl.vertexAttribPointer(sp.position, 
						shape._cf.geometry.node._mesh._numPosComponents, 
						shape._webgl.coordType, false,
						shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
					gl.enableVertexAttribArray(sp.position);
				}
				if (sp.color !== undefined && shape._webgl.buffers[5*q+4])
				{
					gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+4]);
					
					gl.vertexAttribPointer(sp.color, 
						shape._cf.geometry.node._mesh._numColComponents, 
						shape._webgl.colorType, false,
						shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
					gl.enableVertexAttribArray(sp.color);
				}
				if (sp.texcoord !== undefined && shape._webgl.buffers[5*q+3])
				{
					gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+3]);

					gl.vertexAttribPointer(sp.texcoord, 
						shape._cf.geometry.node._mesh._numTexComponents, 
						shape._webgl.texCoordType, false,
						shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
					gl.enableVertexAttribArray(sp.texcoord);
				}
				
				if (shape.isSolid()) {
					gl.enable(gl.CULL_FACE);
					
					if (shape.isCCW()) {
						gl.frontFace(gl.CCW);
					}
					else {
						gl.frontFace(gl.CW);
					}
				}
				else {
					gl.disable(gl.CULL_FACE);
				}
				
				try {
					if (shape._webgl.indexes && shape._webgl.indexes[q]) {
						if (shape._webgl.imageGeometry != 0 || shape._webgl.binaryGeometry < 0 ||
                            shape._webgl.popGeometry < 0 || shape._webgl.bitLODGeometry < 0) {
							if (shape._webgl.bitLODGeometry != 0 && shape._cf.geometry.node._vf.normalPerVertex === false) {                                
                                var totalVertexCount = 0;
                                for (var v=0; v<shape._cf.geometry.node._vf.vertexCount.length; v++) {                                    
                                    if (shape._webgl.primType[v] == gl.TRIANGLES) {
                                        totalVertexCount += shape._cf.geometry.node._vf.vertexCount[v];
                                    }
                                    else if (shape._webgl.primType[v] == gl.TRIANGLE_STRIP) {
                                        totalVertexCount += (shape._cf.geometry.node._vf.vertexCount[v] - 2) * 3;
                                    }
                                }
                                gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                            }
                            else {
                                for (var v=0, offset=0; v<shape._cf.geometry.node._vf.vertexCount.length; v++) {
                                    gl.drawArrays(shape._webgl.primType[v], offset, shape._cf.geometry.node._vf.vertexCount[v]);
                                    offset += shape._cf.geometry.node._vf.vertexCount[v];
                                }
                            }
						}
						else if (shape._webgl.binaryGeometry > 0 || shape._webgl.popGeometry > 0 || 
						         shape._webgl.bitLODGeometry > 0) {
					        for (var v=0, offset=0; v<shape._cf.geometry.node._vf.vertexCount.length; v++) {
						        gl.drawElements(shape._webgl.primType[v], shape._cf.geometry.node._vf.vertexCount[v], 
						                        gl.UNSIGNED_SHORT, 2*offset);
						        offset += shape._cf.geometry.node._vf.vertexCount[v];
					        }
    					} 
    					else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedTriangleStripSet) &&
    					         shape._webgl.primType == gl.TRIANGLE_STRIP) {  // TODO; remove 2nd check
        				    var indOff = shape._cf.geometry.node._indexOffset;
        				    for (var io=1; io<indOff.length; io++) {
             					gl.drawElements(shape._webgl.primType, indOff[io]-indOff[io-1], gl.UNSIGNED_SHORT, 2*indOff[io-1]);
             				}
        				}
						else {
							gl.drawElements(shape._webgl.primType, shape._webgl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
						}
					}
				}
				catch (e) {
					x3dom.debug.logException(shape._DEF + " renderPickingPass(): " + e);
				}
				
				//Clean Texture units
				if(shape._webgl.imageGeometry != 0) {
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, null);
					if(shape._webgl.imageGeometry == 1) {
						gl.activeTexture(gl.TEXTURE1);
						gl.bindTexture(gl.TEXTURE_2D, null);
					}
				}
				
				if (sp.position !== undefined) {
					gl.disableVertexAttribArray(sp.position);
				}
				if (sp.color !== undefined) {
					gl.disableVertexAttribArray(sp.color);
				}
				if (sp.texcoord !== undefined) {
					gl.disableVertexAttribArray(sp.texcoord);
				}
			}
        }
        gl.flush();
        
        try {
            var x = lastX * scene._webgl.pickScale,
                y = scene._webgl.fboPick.height - 1 - lastY * scene._webgl.pickScale;
            var data = new Uint8Array(4 * width * height);    // 4 = 1 * 1 * 4; then take width x height window
            
            gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
            
            scene._webgl.fboPick.pixelData = data;
        }
        catch(se) {
            scene._webgl.fboPick.pixelData = [];
            //No Exception on file:// when starting with additional flags:
            //chrome.exe --enable-webgl --use-gl=desktop --log-level=0 
            //           --allow-file-access-from-files --allow-file-access --disable-web-security
            x3dom.debug.logException(se + " (cannot pick)");
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    
    
	/*****************************************************************************
    * Render single Shape
    *****************************************************************************/
    Context.prototype.renderShape = function (transform, shape, viewarea, 
                                              slights, numLights, 
                                              mat_view, mat_scene, mat_light, mat_proj,
                                              gl, oneShadowExistsAlready)
    {
        if (shape._webgl === undefined) {
            return;
        }
        
        var tex = null;
        var scene = viewarea._scene;
        var sp = shape._webgl.shader;

        if (!sp) {
            x3dom.debug.logError("[Context|RenderShape] No Shader is set!");
            return;
        }
        sp.bind();
		
        //===========================================================================
        // Set special Geometry variables
        //===========================================================================
        if (shape._webgl.popGeometry) {
          sp.PG_precisionLevel = shape._webgl.precisionLevel;          
        }
        
		if (shape._webgl.coordType != gl.FLOAT)
		{
		    if ( shape._webgl.bitLODGeometry != 0 ||  shape._webgl.popGeometry != 0 ||
                (shape._cf.geometry.node._mesh._numPosComponents == 4 &&
    		     x3dom.Utils.isUnsignedType(shape._cf.geometry.node._vf.coordType)) )
			{
    		    sp.bgCenter = shape._cf.geometry.node.getMin().toGL();
    		}
    		else {
		        sp.bgCenter = shape._cf.geometry.node._vf.position.toGL();
			}
		    sp.bgSize = shape._cf.geometry.node._vf.size.toGL();
		    sp.bgPrecisionMax = shape._cf.geometry.node.getPrecisionMax('coordType');            
		}
		if (shape._webgl.colorType != gl.FLOAT) {
		    sp.bgPrecisionColMax = shape._cf.geometry.node.getPrecisionMax('colorType');
		}
		if (shape._webgl.texCoordType != gl.FLOAT) {
			sp.bgPrecisionTexMax = shape._cf.geometry.node.getPrecisionMax('texCoordType');
		}
		if (shape._webgl.normalType != gl.FLOAT) {
    		sp.bgPrecisionNorMax = shape._cf.geometry.node.getPrecisionMax('normalType');
		}
		
		if (shape._webgl.imageGeometry != 0) {
			sp.IG_bboxMin 			 = shape._cf.geometry.node.getMin().toGL();
			sp.IG_bboxMax			 = shape._cf.geometry.node.getMax().toGL();
			sp.IG_implicitMeshSize	 = shape._cf.geometry.node._vf.implicitMeshSize.x;  // FIXME
			
			var tex = x3dom.Utils.findTextureByName( shape._webgl.texture, "IG_coords0" );			
			if(tex) {
				sp.IG_coordTextureWidth  = tex.texture.width;
				sp.IG_coordTextureHeight = tex.texture.height;
			}
			
			if(shape._webgl.imageGeometry == 1) {
				tex = x3dom.Utils.findTextureByName( shape._webgl.texture, "IG_index" );		
				if(tex) {
					sp.IG_indexTextureWidth	 = tex.texture.width;
					sp.IG_indexTextureHeight = tex.texture.height;
				}
			}
		}

        //===========================================================================
        // Set fog
        //===========================================================================
        var fog = scene.getFog();
        if(fog){
			sp.fogColor = fog._vf.color.toGL();
			sp.fogRange = fog._vf.visibilityRange;
			sp.fogType	= (fog._vf.fogType == "LINEAR") ? 0.0 : 1.0;
        }
        
		//Look for shaders
		var shader = shape._cf.appearance.node._shader;
		
		if(shader) {
			if(x3dom.isa(shader, x3dom.nodeTypes.ComposedShader)) {
				for (var fName in shader._vf) {
					if (shader._vf.hasOwnProperty(fName) && fName !== 'language') {
						var field = shader._vf[fName];
						if (field) {
    						if (field.toGL) {
    							sp[fName] = field.toGL();
    						}
    						else {
    							sp[fName] = field;
    						}
    					}
					}
				}
			} else if(x3dom.isa(shader, x3dom.nodeTypes.CommonSurfaceShader)) {
				shape._webgl.csshader = shader;	
			}
		}
		

        //===========================================================================
        // Set Material
        //===========================================================================
		var mat = shape._cf.appearance.node._cf.material.node;
        if (shape._webgl.csshader) {
			sp.diffuseColor      = shader._vf.diffuseFactor.toGL();
			sp.specularColor     = shader._vf.specularFactor.toGL();
			sp.emissiveColor     = shader._vf.emissiveFactor.toGL();
			sp.shininess         = shader._vf.shininessFactor;
			sp.ambientIntensity	 = (shader._vf.ambientFactor.x + 
									shader._vf.ambientFactor.y + 
									shader._vf.ambientFactor.z)/3;
			sp.transparency      = 1.0 - shader._vf.alphaFactor;
        } else {
			sp.diffuseColor		= mat._vf.diffuseColor.toGL();
			sp.specularColor	= mat._vf.specularColor.toGL();
			sp.emissiveColor	= mat._vf.emissiveColor.toGL();
			sp.shininess        = mat._vf.shininess;
			sp.ambientIntensity	= mat._vf.ambientIntensity;
			sp.transparency		= mat._vf.transparency;
        }
        
        //FIXME Only set for VertexColorUnlit and ColorPicking
        sp.alpha = 1.0 - mat._vf.transparency;
        
        //===========================================================================
        // Set Lights
        //===========================================================================
        if (numLights > 0)
        {        
            for(var p=0; p<numLights; p++) {
                var light_transform = mat_view.mult(slights[p].getCurrentTransform());
                
                if(x3dom.isa(slights[p], x3dom.nodeTypes.DirectionalLight))
                {
					sp['light'+p+'_Type']             = 0.0;
					sp['light'+p+'_On']               = (slights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Color']            = slights[p]._vf.color.toGL();
					sp['light'+p+'_Intensity']        = slights[p]._vf.intensity;
					sp['light'+p+'_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
					sp['light'+p+'_Direction']        = light_transform.multMatrixVec(slights[p]._vf.direction).toGL();
					sp['light'+p+'_Attenuation']      = [1.0, 1.0, 1.0];
					sp['light'+p+'_Location']         = [1.0, 1.0, 1.0];
					sp['light'+p+'_Radius']           = 0.0;
					sp['light'+p+'_BeamWidth']        = 0.0;
					sp['light'+p+'_CutOffAngle']      = 0.0;
					sp['light'+p+'_ShadowIntensity']  = slights[p]._vf.shadowIntensity;
                }
                else if(x3dom.isa(slights[p], x3dom.nodeTypes.PointLight))
                {
					sp['light'+p+'_Type']             = 1.0;
					sp['light'+p+'_On']               = (slights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Color']            = slights[p]._vf.color.toGL();
					sp['light'+p+'_Intensity']        = slights[p]._vf.intensity;
					sp['light'+p+'_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
					sp['light'+p+'_Direction']        = [1.0, 1.0, 1.0];
					sp['light'+p+'_Attenuation']      = slights[p]._vf.attenuation.toGL();
					sp['light'+p+'_Location']         = light_transform.multMatrixPnt(slights[p]._vf.location).toGL();
					sp['light'+p+'_Radius']           = slights[p]._vf.radius;
					sp['light'+p+'_BeamWidth']        = 0.0;
					sp['light'+p+'_CutOffAngle']      = 0.0;
					sp['light'+p+'_ShadowIntensity']  = slights[p]._vf.shadowIntensity;
                }
                else if(x3dom.isa(slights[p], x3dom.nodeTypes.SpotLight))
                {
					sp['light'+p+'_Type']             = 2.0;
					sp['light'+p+'_On']               = (slights[p]._vf.on) ? 1.0 : 0.0;
					sp['light'+p+'_Color']            = slights[p]._vf.color.toGL();
					sp['light'+p+'_Intensity']        = slights[p]._vf.intensity;
					sp['light'+p+'_AmbientIntensity'] = slights[p]._vf.ambientIntensity;
					sp['light'+p+'_Direction']        = light_transform.multMatrixVec(slights[p]._vf.direction).toGL();
					sp['light'+p+'_Attenuation']      = slights[p]._vf.attenuation.toGL();
					sp['light'+p+'_Location']         = light_transform.multMatrixPnt(slights[p]._vf.location).toGL();
					sp['light'+p+'_Radius']           = slights[p]._vf.radius;
					sp['light'+p+'_BeamWidth']        = slights[p]._vf.beamWidth;
					sp['light'+p+'_CutOffAngle']      = slights[p]._vf.cutOffAngle;
					sp['light'+p+'_ShadowIntensity']  = slights[p]._vf.shadowIntensity;
                }
            }
        }
		
        //===========================================================================
        // Set HeadLight
        //===========================================================================
        var nav = scene.getNavigationInfo();
        if(nav._vf.headlight){
			numLights = (numLights) ? numLights : 0;
			sp['light'+numLights+'_Type']             = 0.0;
			sp['light'+numLights+'_On']               = 1.0;
			sp['light'+numLights+'_Color']            = [1.0, 1.0, 1.0];
			sp['light'+numLights+'_Intensity']        = 1.0;
			sp['light'+numLights+'_AmbientIntensity'] = 0.0;
			sp['light'+numLights+'_Direction']        = [0.0, 0.0, -1.0];
			sp['light'+numLights+'_Attenuation']      = [1.0, 1.0, 1.0];
			sp['light'+numLights+'_Location']         = [1.0, 1.0, 1.0];
			sp['light'+numLights+'_Radius']           = 0.0;
			sp['light'+numLights+'_BeamWidth']        = 0.0;
			sp['light'+numLights+'_CutOffAngle']      = 0.0;
			sp['light'+numLights+'_ShadowIntensity']  = 0.0;
        }
        
        // transformation matrices
        var model_view = mat_view.mult(transform);

        sp.modelViewMatrix = model_view.toGL();
        sp.normalMatrix = model_view.inverse().transpose().toGL();
        

        sp.projectionMatrix = mat_proj.toGL();
        sp.viewMatrix = mat_view.toGL();
        sp.modelViewMatrixInverse = model_view.inverse().toGL();
        sp.modelViewProjectionMatrix = mat_scene.mult(transform).toGL();

		for (var cnt=0; cnt<shape._webgl.texture.length; cnt++)
		{
			var tex = shape._webgl.texture[cnt];
			
			gl.activeTexture(gl.TEXTURE0 + cnt);
			gl.bindTexture(tex.type, tex.texture);
			gl.texParameteri(tex.type, gl.TEXTURE_WRAP_S, tex.wrapS);
			gl.texParameteri(tex.type, gl.TEXTURE_WRAP_T, tex.wrapT);
			gl.texParameteri(tex.type, gl.TEXTURE_MAG_FILTER, tex.magFilter);
			gl.texParameteri(tex.type, gl.TEXTURE_MIN_FILTER, tex.minFilter);
			if (tex.genMipMaps) {
				gl.generateMipmap(tex.type);
			}
			
			if(!shader || shader && !x3dom.isa(shader, x3dom.nodeTypes.ComposedShader)) 
			{
				if(!sp[tex.samplerName]) 
					sp[tex.samplerName] = cnt;
			}
		}
		
		if (shape._cf.appearance.node._cf.textureTransform.node !== null)
		{
			// use shader/ calculation due to performance issues
			var texTrafo = shape._cf.appearance.node.texTransformMatrix();
			sp.texTrafoMatrix = texTrafo.toGL();
		}
        
        if (oneShadowExistsAlready) 
        {
            if (!sp.sh_tex) {
                sp.sh_tex = cnt;
            }
            gl.activeTexture(gl.TEXTURE0 + cnt);
            gl.bindTexture(gl.TEXTURE_2D, scene._webgl.fboShadow.tex);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.generateMipmap(gl.TEXTURE_2D);
            
            sp.matPV = mat_light.mult(transform).toGL();
        }

        var attrib;
        // TODO; FIXME; what if geometry with split mesh has dynamic fields?
        for (var df=0; df<shape._webgl.dynamicFields.length; df++)
        {
            attrib = shape._webgl.dynamicFields[df];
            
            if (sp[attrib.name] !== undefined)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buf);
                
                gl.vertexAttribPointer(sp[attrib.name], attrib.numComponents, gl.FLOAT, false, 0, 0); 
                gl.enableVertexAttribArray(sp[attrib.name]);
            }
        }
        
        if (shape.isSolid()) {
            gl.enable(gl.CULL_FACE);
            
            if (shape.isCCW()) {
                gl.frontFace(gl.CCW);
            } else {
                gl.frontFace(gl.CW);
            }
        } else {
            gl.disable(gl.CULL_FACE);
        }
        
        for (var q=0; q<shape._webgl.positions.length; q++)
        {
		    if(shape._webgl.buffers[5*q+0])
		    {
			  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape._webgl.buffers[5*q+0]);
		    }
		    if (sp.position !== undefined && shape._webgl.buffers[5*q+1])
		    {
			  gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+1]);
			  
			  gl.vertexAttribPointer(sp.position, 
			  	shape._cf.geometry.node._mesh._numPosComponents, 
			  	shape._webgl.coordType, false,
			  	shape._coordStrideOffset[0], shape._coordStrideOffset[1]);
			  gl.enableVertexAttribArray(sp.position);
		    }
		    if (sp.normal !== undefined && shape._webgl.buffers[5*q+2]) 
		    {
			  gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+2]);            
			  
			  gl.vertexAttribPointer(sp.normal, 
			  	shape._cf.geometry.node._mesh._numNormComponents, 
			  	shape._webgl.normalType, (shape._webgl.bitLODGeometry != 0), 
			  	shape._normalStrideOffset[0], shape._normalStrideOffset[1]);
			  gl.enableVertexAttribArray(sp.normal);
		    }
		    if (sp.texcoord !== undefined && shape._webgl.buffers[5*q+3])
		    {
			  gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+3]);
			  
			  gl.vertexAttribPointer(sp.texcoord, 
			  	shape._cf.geometry.node._mesh._numTexComponents, 
			  	shape._webgl.texCoordType, false,
			  	shape._texCoordStrideOffset[0], shape._texCoordStrideOffset[1]);
			  gl.enableVertexAttribArray(sp.texcoord);
		    }
		    if (sp.color !== undefined && shape._webgl.buffers[5*q+4])
		    {
			  gl.bindBuffer(gl.ARRAY_BUFFER, shape._webgl.buffers[5*q+4]);
			  
			  gl.vertexAttribPointer(sp.color, 
			  	shape._cf.geometry.node._mesh._numColComponents, 
			  	shape._webgl.colorType, false,
			  	shape._colorStrideOffset[0], shape._colorStrideOffset[1]);
			  gl.enableVertexAttribArray(sp.color);
		    }
        
            // render object
            try {
              // fixme; viewarea._points is dynamic and doesn't belong there!!!
              if (viewarea._points !== undefined && viewarea._points > 0) {
                var polyMode = (viewarea._points == 1) ? gl.POINTS : gl.LINES;
                
				if (shape._webgl.imageGeometry != 0 || shape._webgl.binaryGeometry < 0 || 
				    shape._webgl.popGeometry < 0 || shape._webgl.bitLODGeometry < 0) {
					for (var i=0, offset=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++) {
						gl.drawArrays(polyMode, offset, shape._cf.geometry.node._vf.vertexCount[i]);
						offset += shape._cf.geometry.node._vf.vertexCount[i];
					}
				}    
				else if (shape._webgl.binaryGeometry > 0 || shape._webgl.popGeometry > 0 || 
				         shape._webgl.bitLODGeometry > 0) {
			        for (var i=0, offset=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++) {
				        gl.drawElements(polyMode, shape._cf.geometry.node._vf.vertexCount[i], 
				                        gl.UNSIGNED_SHORT, 2*offset);
				        offset += shape._cf.geometry.node._vf.vertexCount[i];
			        }
				}
				else {
					gl.drawElements(polyMode, shape._webgl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
				}
              }
              else {
                if (shape._webgl.primType == gl.POINTS && (typeof shape._webgl.primType).toString() != "object") {
					gl.drawArrays(gl.POINTS, 0, shape._webgl.positions[q].length/3);
                }
                else {
                    if (shape._webgl.indexes && shape._webgl.indexes[q]) {
						if (shape._webgl.imageGeometry != 0 || shape._webgl.binaryGeometry < 0 || 
						    shape._webgl.popGeometry < 0 || shape._webgl.bitLODGeometry < 0) {
                            if (shape._webgl.bitLODGeometry != 0 && shape._cf.geometry.node._vf.normalPerVertex === false) {
                                var totalVertexCount = 0;
                                for (var i = 0; i < shape._cf.geometry.node._vf.vertexCount.length; i++) {                                    
                                    if (shape._webgl.primType[i] == gl.TRIANGLES) {
                                        totalVertexCount += shape._cf.geometry.node._vf.vertexCount[i];
                                    }
                                    else if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP) {
                                        totalVertexCount += (shape._cf.geometry.node._vf.vertexCount[i] - 2) * 3;
                                    }
                                }
                                gl.drawArrays(gl.TRIANGLES, 0, totalVertexCount);
                            }
                            else {
                                for (var i=0, offset=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++) {
                                    gl.drawArrays(shape._webgl.primType[i], offset, shape._cf.geometry.node._vf.vertexCount[i]);
                                    offset += shape._cf.geometry.node._vf.vertexCount[i];
                                }
                            }
						}
						else if (shape._webgl.binaryGeometry > 0 || shape._webgl.popGeometry > 0 || 
						         shape._webgl.bitLODGeometry > 0) {
                            for (var i=0, offset=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++) {
						        gl.drawElements(shape._webgl.primType[i], shape._cf.geometry.node._vf.vertexCount[i], 
						                        gl.UNSIGNED_SHORT, 2*offset);
						        offset += shape._cf.geometry.node._vf.vertexCount[i];
					        }
    					}
    					else if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedTriangleStripSet) &&
    					         shape._webgl.primType == gl.TRIANGLE_STRIP) {  // TODO; remove 2nd check
        				    var indOff = shape._cf.geometry.node._indexOffset;
        				    for (var io=1; io<indOff.length; io++) {
             					gl.drawElements(shape._webgl.primType, indOff[io]-indOff[io-1], gl.UNSIGNED_SHORT, 2*indOff[io-1]);
             				}
        				}
						else {
							gl.drawElements(shape._webgl.primType, shape._webgl.indexes[q].length, gl.UNSIGNED_SHORT, 0);
						}
                    }
                }
              }
            }
            catch (e) {
                x3dom.debug.logException(shape._DEF + " renderShape(): " + e);
            }

			if (sp.position !== undefined) {
				gl.disableVertexAttribArray(sp.position);
			}
			if (sp.normal !== undefined) {
				gl.disableVertexAttribArray(sp.normal);
			}
			if (sp.texcoord !== undefined) {
				gl.disableVertexAttribArray(sp.texcoord);
			}
			if (sp.color !== undefined) {
				gl.disableVertexAttribArray(sp.color);
			}
        }
        
        if (shape._webgl.indexes && shape._webgl.indexes[0]) {
			if(shape._webgl.imageGeometry != 0) {
				for(var i=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++) {
				    if (shape._webgl.primType[i] == gl.TRIANGLE_STRIP)
					    this.numFaces += (shape._cf.geometry.node._vf.vertexCount[i] - 2);
					else
					    this.numFaces += (shape._cf.geometry.node._vf.vertexCount[i] / 3);
				}
			} 
			else {
				this.numFaces += shape._cf.geometry.node._mesh._numFaces;
			}
        }
		
		if(shape._webgl.imageGeometry != 0) {
			for(var i=0; i<shape._cf.geometry.node._vf.vertexCount.length; i++)
				this.numCoords += shape._cf.geometry.node._vf.vertexCount[i];
			this.numDrawCalls += shape._cf.geometry.node._vf.vertexCount.length;
		}
		else if (shape._webgl.binaryGeometry != 0 || shape._webgl.popGeometry != 0 || 
		         shape._webgl.bitLODGeometry != 0) {
		    this.numCoords += shape._cf.geometry.node._mesh._numCoords;
		    this.numDrawCalls += shape._cf.geometry.node._vf.vertexCount.length;
		}
		else {
			this.numCoords += shape._cf.geometry.node._mesh._numCoords;
			
			if (x3dom.isa(shape._cf.geometry.node, x3dom.nodeTypes.IndexedTriangleStripSet) 
			    && shape._webgl.primType == gl.TRIANGLE_STRIP) {
			    this.numDrawCalls += shape._cf.geometry.node._indexOffset.length;
			}
			else {
			    this.numDrawCalls += shape._webgl.positions.length;
		    }
		}
		
        for (cnt=0; shape._webgl.texture !== undefined && 
                    cnt < shape._webgl.texture.length; cnt++)
        {
            if (shape._webgl.texture[cnt])
            {
                tex = null;
                if (shape._cf.appearance.node._cf.texture.node) {
                    tex = shape._cf.appearance.node._cf.texture.node.getTexture(cnt);
                }
                
                if (x3dom.isa(tex, x3dom.nodeTypes.X3DEnvironmentTextureNode)) 
                {
                    gl.activeTexture(gl.TEXTURE0 + cnt);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                    //gl.disable(gl.TEXTURE_CUBE_MAP);
                } else if(!x3dom.isa(tex, x3dom.nodeTypes.X3DEnvironmentTextureNode)){
                    gl.activeTexture(gl.TEXTURE0 + cnt);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
            }
        }
        if (oneShadowExistsAlready) {
            gl.activeTexture(gl.TEXTURE0 + cnt);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        //gl.disable(gl.TEXTURE_2D);
        
        for (df=0; df<shape._webgl.dynamicFields.length; df++) {
            attrib = shape._webgl.dynamicFields[df];
            
            if (sp[attrib.name] !== undefined) {
                gl.disableVertexAttribArray(sp[attrib.name]);
            }
        }
    };
    

	/*****************************************************************************
    * Render ColorBuffer-Pass for picking
    *****************************************************************************/
    Context.prototype.pickValue = function (viewarea, x, y, viewMat, sceneMat)
    {
        var gl = this.ctx3d;
        var scene = viewarea._scene;
        
        // method requires that scene has already been rendered at least once
        if (gl === null || scene === null || !scene._webgl ||
            scene.drawableObjects === undefined || !scene.drawableObjects ||
            scene._vf.pickMode.toLowerCase() === "box")
        {
            return false;
        }
        
        //t0 = new Date().getTime();
        
        var mat_view, mat_scene;
        
        if (arguments.length > 4) {
            mat_view = viewMat;
            mat_scene = sceneMat;
        }
        else {
            mat_view = viewarea._last_mat_view;
            mat_scene = viewarea._last_mat_scene;
        }
        
        var pickMode = (scene._vf.pickMode.toLowerCase() === "color") ? 1 :
                        ((scene._vf.pickMode.toLowerCase() === "texcoord") ? 2 : 0);
        
        var min = scene._lastMin;
        var max = scene._lastMax;
        var from = mat_view.inverse().e3();

        // get bbox of scene bbox and camera position
        var _min = x3dom.fields.SFVec3f.copy(from);
        var _max = x3dom.fields.SFVec3f.copy(from);

        if (_min.x > min.x) { _min.x = min.x; }
        if (_min.y > min.y) { _min.y = min.y; }
        if (_min.z > min.z) { _min.z = min.z; }

        if (_max.x < max.x) { _max.x = max.x; }
        if (_max.y < max.y) { _max.y = max.y; }
        if (_max.z < max.z) { _max.z = max.z; }

        min.setValues(_min);
        max.setValues(_max);

        var sceneSize = max.subtract(min).length();
        
        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, mat_view, mat_scene, 
                               from, sceneSize, pickMode, x, y, 2, 2);
        
        //var index = ( (scene._webgl.fboPick.height - 1 - scene._lastY) * 
        //               scene._webgl.fboPick.width + scene._lastX ) * 4;
        var index = 0;
        if (index >= 0 && scene._webgl.fboPick.pixelData && 
            index < scene._webgl.fboPick.pixelData.length)
        {
            var pickPos = new x3dom.fields.SFVec3f(0, 0, 0);
            var pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);
            var objId = scene._webgl.fboPick.pixelData[index + 3];

            if (pickMode === 0)
            {
                objId += 256 * scene._webgl.fboPick.pixelData[index + 2];
                
                var pixelOffset = 1.0 / scene._webgl.pickScale, denom = 1.0 / 256.0;
                
                var dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                           (scene._webgl.fboPick.pixelData[index + 1] / 255.0);
                
                var line = viewarea.calcViewRay(x, y);
                
                pickPos = line.pos.add(line.dir.multiply(dist * sceneSize));
                
                index = 4;      // get right pixel
                dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                       (scene._webgl.fboPick.pixelData[index + 1] / 255.0);
                
                line = viewarea.calcViewRay(x + pixelOffset, y);
                
                var right = line.pos.add(line.dir.multiply(dist * sceneSize));
                right = right.subtract(pickPos).normalize();
                
                index = 8;      // get top pixel
                dist = (scene._webgl.fboPick.pixelData[index + 0] / 255.0) * denom +
                       (scene._webgl.fboPick.pixelData[index + 1] / 255.0);
                
                line = viewarea.calcViewRay(x, y - pixelOffset);
                
                var up = line.pos.add(line.dir.multiply(dist * sceneSize));
                up = up.subtract(pickPos).normalize();
                
                pickNorm = right.cross(up).normalize();
            }
            else
            {
                pickPos.x = scene._webgl.fboPick.pixelData[index + 0];
                pickPos.y = scene._webgl.fboPick.pixelData[index + 1];
                pickPos.z = scene._webgl.fboPick.pixelData[index + 2];
            }
            //x3dom.debug.logInfo(pickPos + " / " + objId);
            
            if (objId > 0) {
                //x3dom.debug.logInfo(x3dom.nodeTypes.Shape.idMap.nodeID[objId]._DEF + " // " +
                //                    x3dom.nodeTypes.Shape.idMap.nodeID[objId]._xmlNode.localName);
                viewarea._pickingInfo.pickPos = pickPos;
                viewarea._pickingInfo.pickNorm = pickNorm;
                viewarea._pickingInfo.pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[objId];
            }
            else {
                viewarea._pickingInfo.pickObj = null;
                //viewarea._pickingInfo.lastObj = null;
                viewarea._pickingInfo.lastClickObj = null;
            }
        }
        
        //t1 = new Date().getTime() - t0;
        //x3dom.debug.logInfo("Picking time (idBuf): " + t1 + "ms");
        
        return true;
    };

	/*****************************************************************************
    * Render ColorBuffer-Pass for picking sub window
    *****************************************************************************/
    Context.prototype.pickRect = function (viewarea, x1, y1, x2, y2)
    {
        var gl = this.ctx3d;
        var scene = viewarea ? viewarea._scene : null;
        
        // method requires that scene has already been rendered at least once
        if (gl === null || scene === null || !scene._webgl || !scene.drawableObjects)
            return false;
        
        // values not fully correct but unnecessary anyway, just to feed the shader
        var from = viewarea._last_mat_view.inverse().e3();
        var sceneSize = scene._lastMax.subtract(scene._lastMin).length();
        
        var x = (x1 <= x2) ? x1 : x2;
        var y = (y1 >= y2) ? y1 : y2;
        var width  = (1 + Math.abs(x2 - x1)) * scene._webgl.pickScale;
        var height = (1 + Math.abs(y2 - y1)) * scene._webgl.pickScale;
        
        // render to texture for reading pixel values
        this.renderPickingPass(gl, scene, viewarea._last_mat_view, viewarea._last_mat_scene, 
                    from, sceneSize, 0, x, y, (width<1) ? 1:width, (height<1) ? 1:height);
        
        var index = 0;
        var pickedObjects = [];
        
        // get objects in rectangle
        for (index = 0; scene._webgl.fboPick.pixelData && 
             index < scene._webgl.fboPick.pixelData.length; index += 4)
        {
            var objId = scene._webgl.fboPick.pixelData[index + 3] + 
                        scene._webgl.fboPick.pixelData[index + 2] * 256;
            
            if (objId > 0)
                pickedObjects.push(objId);
        }
        pickedObjects.sort();
        
        // make found object IDs unique
        pickedObjects = ( function(arr) {
                var a = [], l = arr.length;
                for (var i=0; i<l; i++) {
                    for (var j=i+1; j<l; j++) {
                        if (arr[i] === arr[j])
                            j = ++i;
                    }
                    a.push(arr[i]);
                }
                return a;
            } )(pickedObjects);
        
        var pickedNodes = [];
        
        for (index = 0; index < pickedObjects.length; index++)
        {
            var obj = pickedObjects[index];
            
            obj = x3dom.nodeTypes.Shape.idMap.nodeID[obj];
            obj = (obj && obj._xmlNode) ? obj._xmlNode : null;
            
            if (obj)
                pickedNodes.push(obj);
        }
        
        return pickedNodes;
    };
    
	/*****************************************************************************
    * Render Scene (Main-Pass)
    *****************************************************************************/
    Context.prototype.renderScene = function (viewarea) 
    {
        var gl = this.ctx3d;
        var scene = viewarea._scene;
        
        if (gl === null || scene === null)
        {
            return;
        }
        
        var rentex = viewarea._doc._nodeBag.renderTextures;
        var rt_tex, rtl_i, rtl_n = rentex.length;
        
        if (!scene._webgl)
        {
            var type = gl.UNSIGNED_BYTE;

            if (x3dom.caps.FP_TEXTURES) {
                type = gl.FLOAT;
            }

            scene._webgl = {};
            this.setupFgnds(gl, scene);
            
            // scale factor for mouse coords and width/ height (low res for speed-up)
            scene._webgl.pickScale = 0.5;
            
            scene._webgl._currFboWidth = Math.round(this.canvas.width * scene._webgl.pickScale);
            scene._webgl._currFboHeight = Math.round(this.canvas.height * scene._webgl.pickScale);

            // TODO: FIXME when spec ready: readPixels not (yet?) available for float textures
            // https://bugzilla.mozilla.org/show_bug.cgi?id=681903
            // https://www.khronos.org/webgl/public-mailing-list/archives/1108/msg00025.html
            scene._webgl.fboPick = this.initFbo(gl, 
                         scene._webgl._currFboWidth, scene._webgl._currFboHeight, true, gl.UNSIGNED_BYTE);
            scene._webgl.fboPick.pixelData = null;
			
			//Set picking shaders
			scene._webgl.pickShader = this.cache.getShader(gl, x3dom.shader.PICKING);
			scene._webgl.pickColorShader = this.cache.getShader(gl, x3dom.shader.PICKING_COLOR);
            scene._webgl.pickTexCoordShader = this.cache.getShader(gl, x3dom.shader.PICKING_TEXCOORD);
            
            scene._webgl.fboShadow = this.initFbo(gl, 1024, 1024, false, type);
			scene._webgl.shadowShader = this.cache.getShader(gl, x3dom.shader.SHADOW);
            
            // TODO; for testing do it on init, but must be refreshed on node change!
            for (rtl_i=0; rtl_i<rtl_n; rtl_i++) {
                rt_tex = rentex[rtl_i];
                rt_tex._webgl = {};
                rt_tex._webgl.fbo = this.initFbo(gl, 
                            rt_tex._vf.dimensions[0], 
                            rt_tex._vf.dimensions[1], false, type);
            }
            
            // init scene volume to improve picking speed
            var min = x3dom.fields.SFVec3f.MAX();
            var max = x3dom.fields.SFVec3f.MIN();
            
            scene.getVolume(min, max, true);
            
            scene._lastMin = min;
            scene._lastMax = max;
            
            viewarea._last_mat_view = x3dom.fields.SFMatrix4f.identity();
            viewarea._last_mat_proj = x3dom.fields.SFMatrix4f.identity();
        	viewarea._last_mat_scene = x3dom.fields.SFMatrix4f.identity();

            this._calledViewpointChangedHandler = false;
        }
        else 
        {
            var fboWidth = Math.round(this.canvas.width * scene._webgl.pickScale);
            var fboHeight = Math.round(this.canvas.height * scene._webgl.pickScale);
            
            if (scene._webgl._currFboWidth !== fboWidth ||
                scene._webgl._currFboHeight !== fboHeight)
            {
                scene._webgl._currFboWidth = fboWidth;
                scene._webgl._currFboHeight = fboHeight;
                
                scene._webgl.fboPick = this.initFbo(gl, fboWidth, fboHeight, true, scene._webgl.fboPick.typ);
                scene._webgl.fboPick.pixelData = null;
                
                x3dom.debug.logInfo("Refreshed picking FBO to size (" + fboWidth + ", " + fboHeight + ")");
            }
        }
        
        var bgnd = scene.getBackground();
        this.setupScene(gl, bgnd);
        
        var t0, t1;
        this.numFaces = 0;
        this.numCoords = 0;
        this.numDrawCalls = 0;
        
        // render traversal
        scene.drawableObjects = null;
        //if (scene.drawableObjects === undefined || !scene.drawableObjects)
        //{
            scene.drawableObjects = [];
            scene.drawableObjects.LODs = [];
            scene.drawableObjects.Billboards = [];
            
            t0 = new Date().getTime();
            
            scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableObjects);
            
            t1 = new Date().getTime() - t0;
            
            if (this.canvas.parent.statDiv) {
                this.canvas.parent.statDiv.appendChild(document.createElement("br"));
                this.canvas.parent.statDiv.appendChild(document.createTextNode("traverse: " + t1));
            }
        //}
        
        var mat_proj = viewarea.getProjectionMatrix();
        var mat_view = viewarea.getViewMatrix();

        // fire viewpointChanged event
        if ( !this._calledViewpointChangedHandler || !viewarea._last_mat_view.equals(mat_view) )
        {
        	var e_viewpoint = viewarea._scene.getViewpoint();
        	var e_eventType = "viewpointChanged";

        	try {
				if ( e_viewpoint._xmlNode && 
					(e_viewpoint._xmlNode["on"+e_eventType] ||
					 e_viewpoint._xmlNode.hasAttribute("on"+e_eventType) ||
					 e_viewpoint._listeners[e_eventType]) )
				{
				    var e_viewtrafo = e_viewpoint.getCurrentTransform();
					e_viewtrafo = e_viewtrafo.inverse().mult(mat_view);
					
					var e_mat = e_viewtrafo.inverse();
					
					var e_rotation = new x3dom.fields.Quaternion(0, 0, 1, 0);
					e_rotation.setValue(e_mat);
					
					var e_translation = e_mat.e3();
					
				    var e_event = {
						target: e_viewpoint._xmlNode,
						type: e_eventType,
						matrix: e_viewtrafo,
						position: e_translation,
						orientation: e_rotation.toAxisAngle(),
						cancelBubble: false,
						stopPropagation: function() { this.cancelBubble = true; }
					};
					
					e_viewpoint.callEvtHandler(e_eventType, e_event);

                    this._calledViewpointChangedHandler = true;
				}
			}
			catch(e_e) {
				x3dom.debug.logException(e_e);
			}
        }
        
        viewarea._last_mat_view = mat_view;
        viewarea._last_mat_proj = mat_proj;
        
        var mat_scene = mat_proj.mult(mat_view);  //viewarea.getWCtoCCMatrix();
        viewarea._last_mat_scene = mat_scene;
                      
                            
        // sorting and stuff
        t0 = new Date().getTime();
        
        // do z-sorting for transparency
        var zPos = [], sortKeyArr = [], zPosTransp = {};
        var sortKeyProp = "";
        var i, m, n = scene.drawableObjects.length;
        var center, trafo, obj3d;
        
        for (i=0; i<n; i++)
        {
            trafo = scene.drawableObjects[i][0];
            obj3d = scene.drawableObjects[i][1];
            
            // do also init of GL objects
            this.setupShape(gl, obj3d, viewarea);
            
            center = obj3d.getCenter();
            center = trafo.multMatrixPnt(center);
            center = mat_view.multMatrixPnt(center);

            var sortType = (obj3d._cf.appearance.node !== undefined) ? 
                            obj3d._cf.appearance.node._vf.sortType : "opaque";
            var sortKey  = (obj3d._cf.appearance.node !== undefined) ? 
                            obj3d._cf.appearance.node._vf.sortKey : 0;

            if (sortType.toLowerCase() === "opaque") {
                zPos.push([i, center.z, sortKey]);
            }
            else {
                sortKeyProp = sortKey.toString();
                if (zPosTransp[sortKeyProp] === undefined)
                    zPosTransp[sortKeyProp] = [];

                zPosTransp[sortKeyProp].push([i, center.z, sortKey]);
                sortKeyArr.push(sortKey);
            }
            
            //PopGeometry: adapt LOD
            if (x3dom.isa(obj3d._cf.geometry.node, x3dom.nodeTypes.PopGeometry))
            {   
                (function() {                
                    var popGeo = obj3d._cf.geometry.node;
                    
                    popGeo._mesh._numCoords = 0;
                    popGeo._mesh._numFaces  = 0;
                    
                    //@todo: Check wheter this is really fov_y
                    var fov_y = (180.0 * viewarea._scene.getViewpoint().getFieldOfView()) / Math.PI;
                    
                    //var bboxSize = popGeo.getBBoxSize();
                    //@todo: CHECK THIS AGAIN!
                    
                    mat_model_view = mat_view.mult(trafo);
                    
                    var bbxScaleFactor = new x3dom.fields.SFVec3f(0,0,0);
                    (function(){
                        var translation = new x3dom.fields.SFVec3f(0,0,0);
                        var rotation    = new x3dom.fields.Quaternion(0,0,1,0);
                        var scaleOrientation = new x3dom.fields.Quaternion(0,0,1,0);
                        mat_model_view.getTransform(translation, rotation, bbxScaleFactor, scaleOrientation);
                    })();
                    
                    var bboxSize = popGeo.getBBoxSize().multComponents(bbxScaleFactor);
                                     
                    var near  = viewarea._scene.getViewpoint().getNear();
                    var far   = viewarea._scene.getViewpoint().getFar();
                    var ratio = viewarea._width / viewarea._height;
                        
                    var imgPlaneHeightAtDistOne = 2.0 * Math.tan(fov_y / 2.0);
                    
                    //view frustum culling, using bounding sphere (without near / far clipping plane yet)
                    if (popGeo.insideViewFrustum(center, bboxSize, near, far, ratio, imgPlaneHeightAtDistOne)) {
                    
                        //compute distance-based LOD
                        //distance is estimated conservatively using the bounding sphere
                        var dist = Math.max(-center.z - (bboxSize.length() * 0.5), near);
                        
                        var projectedPixelLength = dist * (imgPlaneHeightAtDistOne / viewarea._height);
                                                
                        var computeLOD = function(bboxComponentSize) {
                            // TODO: is ErrorToleranceFactor really per node type or per node instance?
                            if (typeof x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor === 'undefined')
                                x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor = 1.0;
                            else if (x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor == 0.0)
                                return 16;
                            else
                                return Math.ceil(Math.log( bboxComponentSize /
                                                          (x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor * 0.5 * projectedPixelLength)
                                                          ) / Math.log(2.0));
                        };
                        
                        //compute LOD using bounding sphere
                        var currentLOD  = computeLOD(bboxSize.length());
                        
                        //currentLOD = 16;
                        currentLOD = Math.max(currentLOD, 1);
                        currentLOD = Math.min(currentLOD, 16);
                        
                        //assign rendering resolution, according to currently loaded data and LOD
                        //@todo: fix cracks and throw away the next line
                        //if (currentLOD >= 8) currentLOD = 16;
                        
                        obj3d._webgl.precisionLevel = Math.min(obj3d._webgl.levelsAvailable, currentLOD);                    
                        obj3d._webgl.precisionLevel = (obj3d._webgl.precisionLevel === popGeo.getNumLevels()) ? 16 : obj3d._webgl.precisionLevel;
                        
                        //here, we tell X3DOM how many faces / vertices get displayed in the stats                
                                            
                        //@todo: this assumes pure TRIANGLES data
                        for (var i = 0; (i < currentLOD) && (i < obj3d._webgl.levelsAvailable); ++i) {                        
                            popGeo._mesh._numCoords += obj3d._webgl.numVerticesAtLevel[i];
                            //@todo: this assumes pure TRIANGLES data
                            popGeo._mesh._numFaces  += (popGeo.hasIndex() ? popGeo.getNumIndicesByLevel(i) / 3 : obj3d._webgl.numVerticesAtLevel[i] / 3);
                        }                   
                    }
                    
                    //here, we tell X3DOM how many vertices get rendered
                    //@todo: this assumes pure TRIANGLES data
                    popGeo.adaptVertexCount(popGeo.hasIndex() ? popGeo._mesh._numFaces * 3 : popGeo._mesh._numCoords); 
                })();
            }
        }

        // sort solid objects only according to sortKey
        zPos.sort(function(a, b) { return a[2] - b[2]; });

        // sort transparent objects along viewer distance and sortKey
        sortKeyArr.sort(function(a, b) { return a - b; });
        
        sortKeyArr = (function (arr) {
            var a = [], l = arr.length;
            for (var i=0; i<l; i++) {
                for (var j=i+1; j<l; j++) {
                    if (arr[i] === arr[j])
                      j = ++i;
                }
                a.push(arr[i]);
            }
            return a;
        })(sortKeyArr);

        for (var sortKeyArrIt=0, sortKeyArrN=sortKeyArr.length; 
                 sortKeyArrIt<sortKeyArrN; ++sortKeyArrIt) {
            sortKeyProp = sortKeyArr[sortKeyArrIt];
            var zPosTranspArr = zPosTransp[sortKeyProp];
            
            zPosTranspArr.sort(function(a, b) { return a[1] - b[1]; });
            zPos.push.apply(zPos, zPosTranspArr);
        }
        
        m = scene.drawableObjects.Billboards.length;
        n = scene.drawableObjects.LODs.length;
        if (m || n) {
            center = new x3dom.fields.SFVec3f(0, 0, 0); // eye
            center = mat_view.inverse().multMatrixPnt(center);
        }
        
        for (i=0; i<n; i++)
        {
            trafo = scene.drawableObjects.LODs[i][0];
            obj3d = scene.drawableObjects.LODs[i][1];
            
            if (obj3d) {
                obj3d._eye = trafo.inverse().multMatrixPnt(center);
            }
        }
        
        for (i=0; i<m; i++)
        {
            trafo = scene.drawableObjects.Billboards[i][0];
            obj3d = scene.drawableObjects.Billboards[i][1];
            
            if (obj3d) {
                var mat_view_model = mat_view.mult(trafo);
                obj3d._eye = trafo.inverse().multMatrixPnt(center);
                obj3d._eyeViewUp = new x3dom.fields.SFVec3f(mat_view_model._10, mat_view_model._11, mat_view_model._12);
                obj3d._eyeLook = new x3dom.fields.SFVec3f(mat_view_model._20, mat_view_model._21, mat_view_model._22);
            }
        }
        
        t1 = new Date().getTime() - t0;
        
        if (this.canvas.parent.statDiv) {
            this.canvas.parent.statDiv.appendChild(document.createElement("br"));
            this.canvas.parent.statDiv.appendChild(document.createTextNode("sort: " + t1));
        }
        
        //===========================================================================
        // Render Shadow Pass
        //===========================================================================
        var slights = viewarea.getLights(); 
        var numLights = slights.length;
        var oneShadowExistsAlready = false;
        var mat_light;
        
        for(var p=0; p<numLights; p++){
            //FIXME!!! Shadowing for only one Light
            if(slights[p]._vf.shadowIntensity > 0.0 && !oneShadowExistsAlready){
                oneShadowExistsAlready = true;
                t0 = new Date().getTime();

                // FIXME; iterate over all lights
                var lightMatrix = viewarea.getLightMatrix()[0];
                mat_light = viewarea.getWCtoLCMatrix(lightMatrix);
                
                // TODO; handle shadows for BG, LOD and IG
                this.renderShadowPass(gl, scene, lightMatrix, mat_light);
                t1 = new Date().getTime() - t0;
                
                if (this.canvas.parent.statDiv) {
                    this.canvas.parent.statDiv.appendChild(document.createElement("br"));
                    this.canvas.parent.statDiv.appendChild(document.createTextNode("shadow: " + t1));
                }   
            }
        }
        
        for (rtl_i=0; rtl_i<rtl_n; rtl_i++) {
            this.renderRTPass(gl, viewarea, rentex[rtl_i]);
        }
        
        // rendering
        t0 = new Date().getTime();
        
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // calls gl.clear etc. (bgnd stuff)
        bgnd._webgl.render(gl, mat_view, mat_proj);
        
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //Workaround for WebKit & Co.
        gl.blendFuncSeparate(
                    gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
                    //gl.ONE_MINUS_DST_ALPHA, gl.ONE
                    gl.ONE, gl.ONE
                    //gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
                );
        gl.enable(gl.BLEND);

        for (i=0, n=zPos.length; i<n; i++)
        {
            var obj = scene.drawableObjects[zPos[i][0]];
			
            var needEnableBlending = false;
            var needEnableDepthMask = false;
            var shapeApp = obj[1]._cf.appearance.node;

            // HACK; fully impl. BlendMode and DepthMode
            if (shapeApp._cf.blendMode.node &&
                shapeApp._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                shapeApp._cf.blendMode.node._vf.destFactor.toLowerCase() === "none")
            {
                needEnableBlending = true;
                gl.disable(gl.BLEND);
            }
            if (shapeApp._cf.depthMode.node &&
                shapeApp._cf.depthMode.node._vf.readOnly === true)
            {
                needEnableDepthMask = true;
                gl.depthMask(false);
            }

            this.renderShape(obj[0], obj[1], viewarea, slights, numLights, 
                mat_view, mat_scene, mat_light, mat_proj, gl, oneShadowExistsAlready);

            if (needEnableBlending) {
                gl.enable(gl.BLEND);
            }
            if (needEnableDepthMask) {
                gl.depthMask(true);
            }
        }

        gl.disable(gl.BLEND);
        /*gl.blendFuncSeparate( // just multiply dest RGB by its A
            gl.ZERO, gl.DST_ALPHA,
            gl.ZERO, gl.ONE
        );*/
        
        gl.disable(gl.DEPTH_TEST);
        
        if (viewarea._visDbgBuf !== undefined && viewarea._visDbgBuf)
        {
            if (scene._vf.pickMode.toLowerCase() === "idbuf" || 
                scene._vf.pickMode.toLowerCase() === "color" ||
                scene._vf.pickMode.toLowerCase() === "texcoord") {
                gl.viewport(0, 3*this.canvas.height/4, 
                            this.canvas.width/4, this.canvas.height/4);
                scene._fgnd._webgl.render(gl, scene._webgl.fboPick.tex);
            }
            if (oneShadowExistsAlready) {
                gl.viewport(this.canvas.width/4, 3*this.canvas.height/4, 
                            this.canvas.width/4, this.canvas.height/4);
                scene._fgnd._webgl.render(gl, scene._webgl.fboShadow.tex);
            }
        }
        
        gl.flush();
        
        t1 = new Date().getTime() - t0;
            
        if (this.canvas.parent.statDiv) {
            this.canvas.parent.statDiv.appendChild(document.createElement("br"));
            this.canvas.parent.statDiv.appendChild(document.createTextNode("render: " + t1));
            this.canvas.parent.statDiv.appendChild(document.createElement("br"));
			this.canvas.parent.statDiv.appendChild(document.createTextNode("#Tris: " + this.numFaces));
            this.canvas.parent.statDiv.appendChild(document.createElement("br"));
            this.canvas.parent.statDiv.appendChild(document.createTextNode("#Pnts: " + this.numCoords));
            this.canvas.parent.statDiv.appendChild(document.createElement("br"));
            this.canvas.parent.statDiv.appendChild(document.createTextNode("#Draws: " + this.numDrawCalls));
        }
        
        //scene.drawableObjects = null;
    };
    
	/*****************************************************************************
    * Render RenderedTexture-Pass
    *****************************************************************************/
    Context.prototype.renderRTPass = function(gl, viewarea, rt)
    {
        switch(rt._vf.update.toUpperCase())
        {
            case "NONE":
                return;
            case "NEXT_FRAME_ONLY":
                if (!rt._needRenderUpdate) {
                    return;
                }
                rt._needRenderUpdate = false;
                break;
            case "ALWAYS":
            default:
                break;
        }
        
        var scene = viewarea._scene;
        var bgnd = null; 
        
        var mat_view = rt.getViewMatrix();
        var mat_proj = rt.getProjectionMatrix();
        var mat_scene = mat_proj.mult(mat_view);
        
        var lightMatrix = viewarea.getLightMatrix()[0];
        var mat_light = viewarea.getWCtoLCMatrix(lightMatrix);
        
        var i, n, m = rt._cf.excludeNodes.nodes.length;
        
        var arr = new Array(m);
        for (i=0; i<m; i++) {
            var render = rt._cf.excludeNodes.nodes[i]._vf.render;
            if (render === undefined) {
                arr[i] = -1;
            }
            else {
                if (render === true) {
                    arr[i] = 1;
                } else {
                    arr[i] = 0;
                }
            }
            rt._cf.excludeNodes.nodes[i]._vf.render = false;
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, rt._webgl.fbo.fbo);
        
        gl.viewport(0, 0, rt._webgl.fbo.width, rt._webgl.fbo.height);
        
        if (rt._cf.background.node === null) 
        {
            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        }
        else if (rt._cf.background.node === scene.getBackground())
        {
            bgnd = scene.getBackground();
            bgnd._webgl.render(gl, mat_view, mat_proj);
        }
        else 
        {
            bgnd = rt._cf.background.node;
            this.setupScene(gl, bgnd);
            bgnd._webgl.render(gl, mat_view, mat_proj);
        }
        
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        gl.blendFuncSeparate(
                    gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
                    gl.ONE, gl.ONE
                );
        gl.enable(gl.BLEND);
        
        var slights = viewarea.getLights(); 
        var numLights = slights.length;
        var oneShadowExistsAlready = false;
        
        var transform, shape;
        var locScene = rt._cf.scene.node;

        var needEnableBlending, needEnableDepthMask;
        
        if (!locScene || locScene === scene)
        {
            n = scene.drawableObjects.length;
            
            for (i=0; i<n; i++)
            {
                transform = scene.drawableObjects[i][0];
                shape = scene.drawableObjects[i][1];
                
                if (shape._vf.render !== undefined && shape._vf.render === false) {
                   continue;
                }

                needEnableBlending = false;
                needEnableDepthMask = false;

                // HACK; fully impl. BlendMode and DepthMode
                appearance = shape._cf.appearance.node;

                if (appearance._cf.blendMode.node &&
                    appearance._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                    appearance._cf.blendMode.node._vf.destFactor.toLowerCase() === "none")
                {
                    needEnableBlending = true;
                    gl.disable(gl.BLEND);
                }
                if (appearance._cf.depthMode.node &&
                    appearance._cf.depthMode.node._vf.readOnly === true)
                {
                    needEnableDepthMask = true;
                    gl.depthMask(false);
                }

                this.renderShape(transform, shape, viewarea, slights, numLights, 
                        mat_view, mat_scene, mat_light, mat_proj, gl, oneShadowExistsAlready);

                if (needEnableBlending) {
                    gl.enable(gl.BLEND);
                }
                if (needEnableDepthMask) {
                    gl.depthMask(true);
                }
            }
        }
        else
        {
            locScene.drawableObjects = [];
            
            locScene.collectDrawableObjects(
                locScene.transformMatrix(x3dom.fields.SFMatrix4f.identity()), locScene.drawableObjects);
            
            n = locScene.drawableObjects.length;
            
            for (i=0; i<n; i++)
            {
                transform = locScene.drawableObjects[i][0];
                shape = locScene.drawableObjects[i][1];
                
                if (shape._vf.render !== undefined && shape._vf.render === false) {
                   continue;
                }
                
                this.setupShape(gl, shape, viewarea);

                needEnableBlending = false;
                needEnableDepthMask = false;

                // HACK; fully impl. BlendMode and DepthMode
                appearance = shape._cf.appearance.node;

                if (appearance._cf.blendMode.node &&
                    appearance._cf.blendMode.node._vf.srcFactor.toLowerCase() === "none" &&
                    appearance._cf.blendMode.node._vf.destFactor.toLowerCase() === "none")
                {
                    needEnableBlending = true;
                    gl.disable(gl.BLEND);
                }
                if (appearance._cf.depthMode.node &&
                    appearance._cf.depthMode.node._vf.readOnly === true)
                {
                    needEnableDepthMask = true;
                    gl.depthMask(false);
                }

                this.renderShape(transform, shape, viewarea, slights, numLights, 
                        mat_view, mat_scene, mat_light, mat_proj, gl, oneShadowExistsAlready);

                if (needEnableBlending) {
                    gl.enable(gl.BLEND);
                }
                if (needEnableDepthMask) {
                    gl.depthMask(true);
                }
            }
        }
        
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        
        gl.flush();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        for (i=0; i<m; i++) {
            if (arr[i] !== 0) {
                rt._cf.excludeNodes.nodes[i]._vf.render = true;
            }
        }
    };
    
	/*****************************************************************************
    * Cleanup
    *****************************************************************************/
    Context.prototype.shutdown = function(viewarea)
    {
        var gl = this.ctx3d;
        var attrib;
        var scene;
        
        if (gl === null || scene === null || !scene || scene.drawableObjects === null) {
            return;
        }
        scene = viewarea._scene;
        
        // TODO; optimize traversal, matrices are not needed for cleanup
        scene.collectDrawableObjects(x3dom.fields.SFMatrix4f.identity(), scene.drawableObjects);
        
        var bgnd = scene.getBackground();
        if (bgnd._webgl.texture !== undefined && bgnd._webgl.texture)
        {
            gl.deleteTexture(bgnd._webgl.texture);
        }
        if (bgnd._webgl.shader.position !== undefined) 
        {
            gl.deleteBuffer(bgnd._webgl.buffers[1]);
            gl.deleteBuffer(bgnd._webgl.buffers[0]);
        }
        
        for (var i=0, n=scene.drawableObjects.length; i<n; i++)
        {
            var shape = scene.drawableObjects[i][1];
            var sp = shape._webgl.shader;
            
            for (var cnt=0; shape._webgl.texture !== undefined && 
                            cnt < shape._webgl.texture.length; cnt++)
            {
                if (shape._webgl.texture[cnt].texture)
                {
                    gl.deleteTexture(shape._webgl.texture[cnt].texture);
                }
            }
            
            for (var q=0; q<shape._webgl.positions.length; q++)
            {
                if (sp.position !== undefined) 
                {
                    gl.deleteBuffer(shape._webgl.buffers[5*q+1]);
                    gl.deleteBuffer(shape._webgl.buffers[5*q+0]);
                }
                
                if (sp.normal !== undefined) 
                {
                    gl.deleteBuffer(shape._webgl.buffers[5*q+2]);
                }
                
                if (sp.texcoord !== undefined) 
                {
                    gl.deleteBuffer(shape._webgl.buffers[5*q+3]);
                }
                
                if (sp.color !== undefined)
                {
                    gl.deleteBuffer(shape._webgl.buffers[5*q+4]);
                }
            }

            for (var df=0; df<shape._webgl.dynamicFields.length; df++)
            {
                attrib = shape._webgl.dynamicFields[df];
                
                if (sp[attrib.name] !== undefined)
                {
                    gl.deleteBuffer(attrib.buf);
                }
            }
            
            shape._webgl = null;
        }
    };
    
	/*****************************************************************************
    * Start of fbo init stuff
    *****************************************************************************/
    Context.prototype.emptyTexImage2D = function(gl, internalFormat, width, height, format, type)
    {
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
        }
        catch (e) {
            // seems to be no longer necessary, but anyway...
            var bytes = 3;
            switch (internalFormat)
            {
                case gl.DEPTH_COMPONENT: bytes = 3; break;
                case gl.ALPHA: bytes = 1; break;
                case gl.RGB: bytes = 3; break;
                case gl.RGBA: bytes = 4; break;
                case gl.LUMINANCE: bytes = 1; break;
                case gl.LUMINANCE_ALPHA: bytes = 2; break;
            }
            var pixels = new Uint8Array(width * height * bytes);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, pixels);
        }
    };

	/*****************************************************************************
    * Init Texture
    *****************************************************************************/
    Context.prototype.initTex = function(gl, w, h, nearest, type)
    {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        this.emptyTexImage2D(gl, gl.RGBA, w, h, gl.RGBA, type);
        //this.emptyTexImage2D(gl, gl.DEPTH_COMPONENT16, w, h, gl.DEPTH_COMPONENT, gl.UNSIGNED_BYTE);

        if (nearest) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        tex.width = w;
        tex.height = h;

        return tex;
    };


	/*****************************************************************************
    * Creates FBO with given size 
	* (taken from FBO utilities for WebGL by Emanuele Ruffaldi 2009)
	*
	* Returned Object has rbo, fbo, tex, width, height
    *****************************************************************************/
    Context.prototype.initFbo = function(gl, w, h, nearest, type)
    {
        var fbo = gl.createFramebuffer();
        var rb = gl.createRenderbuffer();
        
        var tex = this.initTex(gl, w, h, nearest, type);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE)
            x3dom.debug.logWarning("[Context|InitFBO] FBO-Status: " + status);

        var r = {
            fbo: fbo,
            rbo: rb,
            tex: tex,
            width: w,
            height: h,
            typ: type
        };

        return r;
    };

    return setupContext;

})();
