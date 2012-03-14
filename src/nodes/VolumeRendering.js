/*
 * MEDX3DOM JavaScript Library
 * http://medx3dom.org
 *
 * (C)2011 Vicomtech Research Center,
 *         Donostia - San Sebastian
 * Licensed under the Apache.
 *
 * Based on code originally provided by
 * http://www.x3dom.org
 */

 /**
  * http://igraphics.com/Standards/ISO_IEC_19775_1_2_PDAM1_Candidate_2011_05_12/Part01/components/volume.html
  */

/* ### X3DVolumeDataNode ### */
x3dom.registerNodeType(
    "X3DVolumeDataNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DShapeNode,   // changed inheritance!
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeDataNode.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'dimensions', 1, 1, 1);
            this.addField_SFNode('voxels', x3dom.nodeTypes.Texture);
            //this.addField_MFNode('voxels', x3dom.nodeTypes.X3DTexture3DNode);
            //this.addField_SFBool(ctx, 'swapped', false);
            //this.addField_SFVec3f(ctx, 'sliceThickness', 1, 1, 1);

            x3dom.debug.logWarning('VolumeRendering component NYI!!!');
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### X3DVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DNode,
        function (ctx) {
            x3dom.nodeTypes.X3DVolumeRenderStyleNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'enabled', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### X3DComposableVolumeRenderStyleNode ### */
x3dom.registerNodeType(
    "X3DComposableVolumeRenderStyleNode",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode.superClass.call(this, ctx);

            this.addField_SFNode('surfaceNormals', x3dom.nodeTypes.X3DTexture3DNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### BlendedVolumeStyle ### */
x3dom.registerNodeType(
    "BlendedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.BlendedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFNode('voxels', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFFloat(ctx, 'weightConstant1', 0.5);
            this.addField_SFFloat(ctx, 'weightConstant2', 0.5);
            this.addField_SFString(ctx, 'weightFunction1', "CONSTANT");
            this.addField_SFString(ctx, 'weightFunction2', "CONSTANT");
            this.addField_SFNode('weightTransferFunction1', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
            this.addField_SFNode('weightTransferFunction2', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### BoundaryEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "BoundaryEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.BoundaryEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'retainedOpacity', 1);
            this.addField_SFFloat(ctx, 'boundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'opacityFactor', 1);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### CartoonVolumeStyle ### */
x3dom.registerNodeType(
    "CartoonVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.CartoonVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'parallelColor', 0, 0, 0);
            this.addField_SFColor(ctx, 'orthogonalColor', 1, 1, 1);
            this.addField_SFInt32(ctx, 'colorSteps', 4);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ComposedVolumeStyle ### */
x3dom.registerNodeType(
    "ComposedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ComposedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'ordered', false);
            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### EdgeEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "EdgeEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.EdgeEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'edgeColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ISOSurfaceVolumeData ### */
x3dom.registerNodeType(
    "ISOSurfaceVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.ISOSurfaceVolumeData.superClass.call(this, ctx);

            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);
            this.addField_SFNode('gradients', x3dom.nodeTypes.X3DTexture3DNode);
            this.addField_MFFloat(ctx, 'surfaceValues', []);
            this.addField_SFFloat(ctx, 'contourStepSize', 0);
            this.addField_SFFloat(ctx, 'surfaceTolerance', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### OpacityMapVolumeStyle ### */
x3dom.registerNodeType(
    "OpacityMapVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.OpacityMapVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('transferFunction', x3dom.nodeTypes.X3DTextureNode);
            this.addField_SFString(ctx, 'type', "simple");
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ProjectionVolumeStyle ### */
x3dom.registerNodeType(
    "ProjectionVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ProjectionVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'intensityThreshold', 0);
            this.addField_SFString(ctx, 'type', "MAX");
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### SegmentedVolumeData ### */
x3dom.registerNodeType(
    "SegmentedVolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.SegmentedVolumeData.superClass.call(this, ctx);

            this.addField_MFNode('renderStyle', x3dom.nodeTypes.X3DVolumeDataNode);
            this.addField_MFBool(ctx, 'segmentEnabled', []);
            this.addField_SFNode('segmentIdentifiers', x3dom.nodeTypes.X3DVolumeDataNode);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ShadedVolumeStyle ### */
x3dom.registerNodeType(
    "ShadedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ShadedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);
            this.addField_SFBool(ctx, 'lighting', false);
            this.addField_SFBool(ctx, 'shadows', false);
            this.addField_SFString(ctx, 'phaseFunction', "Henyey-Greenstein");
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### SilhouetteEnhancementVolumeStyle ### */
x3dom.registerNodeType(
    "SilhouetteEnhancementVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.SilhouetteEnhancementVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'silhouetteSharpness', 0.5);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### StippleVolumeStyle ### */
x3dom.registerNodeType(
    "StippleVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.StippleVolumeStyle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'distanceFactor', 1);
            this.addField_SFFloat(ctx, 'interiorFactor', 1);
            this.addField_SFFloat(ctx, 'lightingFactor', 1);
            this.addField_SFFloat(ctx, 'gradientThreshold', 0.4);
            this.addField_SFFloat(ctx, 'gradientRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'gradientBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'gradientOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'silhouetteRetainedOpacity', 1);
            this.addField_SFFloat(ctx, 'silhouetteBoundaryOpacity', 0);
            this.addField_SFFloat(ctx, 'silhouetteOpacityFactor', 1);
            this.addField_SFFloat(ctx, 'resolutionFactor', 1);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ToneMappedVolumeStyle ### */
x3dom.registerNodeType(
    "ToneMappedVolumeStyle",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DComposableVolumeRenderStyleNode,
        function (ctx) {
            x3dom.nodeTypes.ToneMappedVolumeStyle.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'coolColor', 0, 0, 1);
            this.addField_SFColor(ctx, 'warmColor', 1, 1, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ColorBox ### */
//FIXME: Not a real X3D Node
x3dom.registerNodeType(
    "ColorBox",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ColorBox.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);

            var sx = this._vf.size.x,
                sy = this._vf.size.y,
                sz = this._vf.size.z;

    	    var geoCacheID = 'ColorBox_'+sx+'-'+sy+'-'+sz;

    	    if( x3dom.geoCache[geoCacheID] !== undefined )
    	    {
    		  this._mesh = x3dom.geoCache[geoCacheID];
    	    }
    	    else
    	    {
    		  sx /= 2; sy /= 2; sz /= 2;

    		  this._mesh._positions[0] = [
    			-sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
    			-sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
    			-sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
    			 sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
    			-sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
    			-sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
    		  ];
		  
    		  this._mesh._colors[0] = [
    			0,0,0,  0, 1,0,   1, 1,0,   1,0,0,
    			0,0, 1,  0, 1, 1,   1, 1, 1,   1,0, 1,
    			0,0,0,  0,0, 1,  0, 1, 1,  0, 1,0,
    			1,0,0,   1,0, 1,   1, 1, 1,   1, 1,0,
    			0, 1,0,  0, 1, 1,   1, 1, 1,   1, 1,0,
    			0,0,0,  0,0, 1,   1,0, 1,   1,0,0
    		  ];

    		  this._mesh._normals[0] = [
    			0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
    			0,0,1,  0,0,1,   0,0,1,   0,0,1,
    			-1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
    			1,0,0,   1,0,0,   1,0,0,   1,0,0,
    			0,1,0,  0,1,0,   0,1,0,   0,1,0,
    			0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0
    		  ];

    		  this._mesh._indices[0] = [
    			0,1,2, 2,3,0,
    			4,7,5, 5,7,6,
    			8,9,10, 10,11,8,
    			12,14,13, 14,12,15,
    			16,17,18, 18,19,16,
    			20,22,21, 22,20,23
    		  ];
    		  
    		  this._mesh._invalidate = true;
    		  this._mesh._numFaces = 12;
    		  this._mesh._numCoords = 24;

    		  x3dom.geoCache[geoCacheID] = this._mesh;
    	    }
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "size") {
                    var sx = this._vf.size.x / 2,
                        sy = this._vf.size.y / 2,
                        sz = this._vf.size.z / 2;

                    this._mesh._positions[0] = [
            			-sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
            			-sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
            			-sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
            			 sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
            			-sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
            			-sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
                    ];

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
            }
        }
    )
);

/* ### VolumeData ### */
x3dom.registerNodeType(
    "VolumeData",
    "VolumeRendering",
    defineClass(x3dom.nodeTypes.X3DVolumeDataNode,
        function (ctx) {
            x3dom.nodeTypes.VolumeData.superClass.call(this, ctx);

            this.addField_SFNode('renderStyle', x3dom.nodeTypes.X3DVolumeRenderStyleNode);
	    
    	    this.vrcMultiTexture = new x3dom.nodeTypes.MultiTexture(ctx);
    	    this.vrcRenderTexture = new x3dom.nodeTypes.RenderedTexture(ctx);
    	    this.vrcVolumeTexture = null;
    	    
    	    this.vrcBackCubeShape = new x3dom.nodeTypes.Shape(ctx);
    	    this.vrcBackCubeAppearance = new x3dom.nodeTypes.Appearance();
    	    this.vrcBackCubeGeometry = new x3dom.nodeTypes.ColorBox(ctx);
    	    this.vrcBackCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);
    	    this.vrcBackCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
    	    this.vrcBackCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
    	    	    
    	    this.vrcFrontCubeShader = new x3dom.nodeTypes.ComposedShader(ctx);	
    	    this.vrcFrontCubeShaderVertex = new x3dom.nodeTypes.ShaderPart(ctx);
    	    this.vrcFrontCubeShaderFragment = new x3dom.nodeTypes.ShaderPart(ctx);
    	    this.vrcFrontCubeShaderFieldBackCoord = new x3dom.nodeTypes.Field(ctx);
    	    this.vrcFrontCubeShaderFieldVolData = new x3dom.nodeTypes.Field(ctx);	    
        },
        {
            // nodeChanged is called after subtree is parsed and attached in DOM
            nodeChanged: function()
            {
                // uhhhh, manually build backend-graph scene-subtree,
                // therefore, try to mimic depth-first parsing scheme
                if (!this._cf.appearance.node) 
                {
                    this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
                    
		            // second texture, ray direction and length
        		    this.vrcBackCubeShaderVertex._vf.type = 'vertex';		    
        		    this.vrcBackCubeShaderVertex._vf.url.push (
        			"attribute vec3 position;" +
        			"attribute vec3 color;" +
        			"varying vec3 fragColor;" +
        			"uniform mat4 modelViewProjectionMatrix;" +
        			"" +
        			"void main(void) {" +
        			"    fragColor = color;" +
        			"    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
        			"}"
        		    );

        		    this.vrcBackCubeShaderFragment._vf.type = 'fragment';
        		    this.vrcBackCubeShaderFragment._vf.url.push(
        			"#ifdef GL_ES             \n" +
        			"  precision highp float; \n" +
        			"#endif                   \n" +
        			"" +
        			"varying vec3 fragColor;" +
        			"" +
        			"void main(void) {" +
        			"    gl_FragColor = vec4(fragColor, 1.0);" +
        			"}"
        		    );
		            
        		    this.vrcBackCubeShader.addChild(this.vrcBackCubeShaderFragment, 'parts');
        		    this.vrcBackCubeShaderFragment.nodeChanged();
        		    
        		    this.vrcBackCubeShader.addChild(this.vrcBackCubeShaderVertex, 'parts');  
        		    this.vrcBackCubeShaderVertex.nodeChanged();
        		    
        		    this.vrcBackCubeAppearance.addChild(this.vrcBackCubeShader);
        		    this.vrcBackCubeShader.nodeChanged();
        		    
        		    // initialize fbo - note that internally the datatypes must fit!
        		    this.vrcRenderTexture._vf.update = 'always';
        		    this.vrcRenderTexture._vf.dimensions = [500, 500, 4];
        		    this.vrcRenderTexture._vf.repeatS = false;
        		    this.vrcRenderTexture._vf.repeatT = false;
        		    this.vrcRenderTexture._nameSpace = this._nameSpace;
        		    
		            this.vrcBackCubeGeometry._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);
                    this.vrcBackCubeGeometry._vf.ccw = false;
		            this.vrcBackCubeGeometry._vf.solid = true;
		            // manually trigger size update
                    this.vrcBackCubeGeometry.fieldChanged("size");
        		    
        		    this.vrcBackCubeShape.addChild(this.vrcBackCubeGeometry);
        		    this.vrcBackCubeGeometry.nodeChanged();
        		    
        		    this.vrcBackCubeShape.addChild(this.vrcBackCubeAppearance);
        		    this.vrcBackCubeAppearance.nodeChanged();
        		    
        		    this.vrcRenderTexture.addChild(this.vrcBackCubeShape, 'scene');
        		    this.vrcBackCubeShape.nodeChanged();
        		    
        		    // create shortcut to volume data set
        		    this.vrcVolumeTexture = this._cf.voxels.node;
        		    this.vrcVolumeTexture._vf.repeatS = false;
        		    this.vrcVolumeTexture._vf.repeatT = false;
        		    
        		    this.vrcMultiTexture._nameSpace = this._nameSpace;
        		    
        		    this.vrcMultiTexture.addChild(this.vrcRenderTexture, 'texture');
        		    this.vrcRenderTexture.nodeChanged();
        		    
        		    this.vrcMultiTexture.addChild(this.vrcVolumeTexture, 'texture');
        		    this.vrcVolumeTexture.nodeChanged();
        		    
        		    this._cf.appearance.node.addChild(this.vrcMultiTexture);
        		    this.vrcMultiTexture.nodeChanged();
        		    
        		    
		            // here goes the volume shader
        		    this.vrcFrontCubeShaderVertex._vf.type = 'vertex';
        		    this.vrcFrontCubeShaderVertex._vf.url.push(
        			"attribute vec3 position;"+
        			"attribute vec3 color;"+
        			"uniform mat4 modelViewProjectionMatrix;"+
        			"varying vec3 vertexColor;"+
        			"varying vec4 vertexPosition;"+
        			"void main()"+
        			"{"+
        			"vertexColor = color;"+
        			"vertexPosition = modelViewProjectionMatrix * vec4(position, 1.0);"+
        			"gl_Position = vertexPosition;"+
        			"}"
        		    );

        		    this.vrcFrontCubeShaderFragment._vf.type = 'fragment';
        		    this.vrcFrontCubeShaderFragment._vf.url.push(
        			"#ifdef GL_ES             \n" +
        			"  precision highp float; \n" +
        			"#endif                   \n" +
        			"" +
        			"uniform sampler2D uBackCoord;"+
        			"uniform sampler2D uVolData;"+
        			"varying vec3 vertexColor;"+
        			"varying vec4 vertexPosition;"+
        			"const float Steps = 60.0;"+
        			"const float numberOfSlices = 96.0;"+
        			"const float slicesOverX = 10.0;"+
        			"const float slicesOverY = 10.0;"+
        			"vec4 getVolumeValue(vec3 volpos)"+
        			"{"+
        			"float s1,s2;"+
        			"float dx1,dy1;"+
        			"float dx2,dy2;"+
        			"vec2 texpos1,texpos2;"+
        			"s1 = floor(volpos.z*numberOfSlices);"+
        			"s2 = s1+1.0;"+
        			"dx1 = fract(s1/slicesOverX);"+
        			"dy1 = floor(s1/slicesOverY)/slicesOverY;"+
        			"dx2 = fract(s2/slicesOverX);"+
        			"dy2 = floor(s2/slicesOverY)/slicesOverY;"+
        			"texpos1.x = dx1+(volpos.x/slicesOverX);"+
        			"texpos1.y = dy1+(volpos.y/slicesOverY);"+
        			"texpos2.x = dx2+(volpos.x/slicesOverX);"+
        			"texpos2.y = dy2+(volpos.y/slicesOverY);"+
        			"return mix( texture2D(uVolData,texpos1), texture2D(uVolData,texpos2), (volpos.z*numberOfSlices)-s1);"+
        			"}"+
        			"void main()"+
        			"{"+
        			"vec2 texC = vertexPosition.xy/vertexPosition.w;"+
        			"texC = 0.5*texC + 0.5;"+
        			"vec4 backColor = texture2D(uBackCoord,texC);"+
        			"vec3 dir = backColor.rgb - vertexColor.rgb;"+
        			"vec3 pos = vertexColor;"+
        			"vec4 src = vec4(0, 0, 0, 0);"+
        			"vec4 value = vec4(0, 0, 0, 0);"+
        			"float cont = 0.0;"+
        			"vec3 Step = dir/Steps;"+
        			"for(float i = 0.0; i < Steps; i+=1.0)"+
        			"{"+
        			"value = getVolumeValue(pos);"+
        			"if (value.a>0.0)"+
        			"cont+=1.0;"+
        			"src += value;"+
        			"pos.xyz += Step;"+
        			"if(pos.x > 1.0 || pos.y > 1.0 || pos.z > 1.0)"+
        			"break;"+
        			"}"+
        			"src.rgb /= Steps;"+
        			"src.a = 1.0;"+
        			"if(src.r <= 0.01 && src.g <= 0.01 && src.b <= 0.01) discard;"+
        			"gl_FragColor = src;"+
        			"}"
        		    );
		    
        		    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderVertex, 'parts');
        		    this.vrcFrontCubeShaderVertex.nodeChanged();
        		    
        		    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFragment, 'parts');
        		    this.vrcFrontCubeShaderFragment.nodeChanged();
		            
        		    this.vrcFrontCubeShaderFieldBackCoord._vf.name = 'uBackCoord';
        		    this.vrcFrontCubeShaderFieldBackCoord._vf.type = 'SFInt32';
        		    this.vrcFrontCubeShaderFieldBackCoord._vf.value = 0;

        		    this.vrcFrontCubeShaderFieldVolData._vf.name = 'uVolData';
        		    this.vrcFrontCubeShaderFieldVolData._vf.type = 'SFInt32';
        		    this.vrcFrontCubeShaderFieldVolData._vf.value = 1;
		    
        		    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldBackCoord, 'fields');
        		    this.vrcFrontCubeShaderFieldBackCoord.nodeChanged();
        		    
        		    this.vrcFrontCubeShader.addChild(this.vrcFrontCubeShaderFieldVolData, 'fields');
        		    this.vrcFrontCubeShaderFieldVolData.nodeChanged();
	                
        		    this._cf.appearance.node.addChild(this.vrcFrontCubeShader);
        		    this.vrcFrontCubeShader.nodeChanged();	
        		    
        		    this._cf.appearance.node.nodeChanged();
                }

                if (!this._cf.geometry.node) {
                    this.addChild(new x3dom.nodeTypes.ColorBox());

                    this._cf.geometry.node._vf.size = new x3dom.fields.SFVec3f(
                        this._vf.dimensions.x, this._vf.dimensions.y, this._vf.dimensions.z);
                    this._cf.geometry.node._vf.ccw = true;
		            this._cf.geometry.node._vf.solid = true;

					// workaround to trigger field change...
                    this._cf.geometry.node.fieldChanged("size");
		            this._cf.geometry.node.fieldChanged("ccw");
		            this._cf.geometry.node.fieldChanged("solid");
                }
            },

            fieldChanged: function(fieldName) {}
        }
    )
);
