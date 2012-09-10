package x3dom
{
	import flash.display.BitmapData;
	import flash.display.BlendMode;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.lighting.DirectionalLight;
	import x3dom.lighting.LightType;
	import x3dom.lighting.PointLight;
	import x3dom.shaders.*;
	import x3dom.shapes.*;
	
	public class LPPRenderer extends Renderer
	{		
		private var _depthTexture:Texture;
		private var _normalTexture:Texture;
		private var _lightDiffTexture:Texture;
		private var _lightSpecTexture:Texture;
		
		private var _mvMatrix:Matrix3D = new Matrix3D();
		private var _mvInvMatrix:Matrix3D = new Matrix3D();
		private var _pInvMatrix:Matrix3D = new Matrix3D();
		
		private var _fullScreenQuad:FullScreenQuad = new FullScreenQuad();
		private var _sphere:Sphere = new Sphere();
		
		public function LPPRenderer(scene:X3DScene)
		{
			super(scene);
			
			var width:Number  = Utils.nextHighestPowerOfTwo(FlashBackend.getWidth());
			var height:Number = Utils.nextHighestPowerOfTwo(FlashBackend.getHeight());
			
			_depthTexture  = _context3D.createTexture(width, height, Context3DTextureFormat.BGRA, true);
			_normalTexture = _context3D.createTexture(width, height, Context3DTextureFormat.BGRA, true);
			_lightDiffTexture  = _context3D.createTexture(width, height, Context3DTextureFormat.BGRA, true);
			_lightSpecTexture  = _context3D.createTexture(width, height, Context3DTextureFormat.BGRA, true);
			
		}
		
		override public function render() : void
		{
			depthPass();
			normalPass();
			//lightPass("SPECULAR");
			lightPass("DIFFUSE");
			//geometryPass();
		}
		
		private function depthPass() : void
		{
			
			_context3D.setCulling(Context3DTriangleFace.FRONT);
			_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO );
			_context3D.setRenderToTexture(_depthTexture, true);
			//_context3D.setRenderToBackBuffer();
			_context3D.clear();
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = _scene.drawableObjects;
			
			//Get number of drawable objects
			var numDrawableObjects:Number = drawableObjects.length;
			
			//Iterate all objects for rendering
			for(var i:uint; i<numDrawableObjects; i++)
			{
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				//Set Depth shader
				_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.DEPTH) );
				
				//Build ModelView-Matrix
				_mvMatrix.identity();
				_mvMatrix.append(trafo);
				_mvMatrix.append(_scene.viewMatrix);
				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(trafo);
				_mvpMatrix.append(_scene.viewMatrix);
				_mvpMatrix.append(_scene.projectionMatrix);
				
				//Associate MVP-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 0, _mvpMatrix, true );
				
				//Associate MV-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX, 4, _mvMatrix, true );
				
				//Associate constants for float to rgba encoding
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([1.0, 255.0, 65025.0, 16581375.0]) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 1, Vector.<Number>([0.00392156886, 0.00392156886, 0.00392156886, 0.0]) );
				
				//Associate farclip distance
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 2, Vector.<Number>([_scene.zFar, 0.0, 0.0, 0.0]) );
				
				if(shape.solid) {
					this._context3D.setCulling(Context3DTriangleFace.FRONT);
				} else {
					this._context3D.setCulling(Context3DTriangleFace.NONE);
				}
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
									
					//Draw the mesh
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
			}
			
			//_context3D.present();
		}
		
		private function normalPass() : void
		{
			_context3D.setRenderToTexture(_normalTexture, true);
			//_context3D.setRenderToBackBuffer();
			_context3D.clear();
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = _scene.drawableObjects;
			
			//Get number of drawable objects
			var numDrawableObjects:Number = drawableObjects.length;
			
			//Iterate all objects for rendering
			for(var i:uint; i<numDrawableObjects; i++)
			{
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				//Set Depth shader
				_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.NORMAL) );
				
				//Build ModelView-Matrix
				_mvMatrix.identity();
				_mvMatrix.append(trafo);
				_mvMatrix.append(_scene.viewMatrix);

				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(trafo);
				_mvpMatrix.append(_scene.viewMatrix);
				_mvpMatrix.append(_scene.projectionMatrix);
				
				//Associate MVP-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Associate MV-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _mvMatrix, true );
				
				//Associate constants for float to rgba encoding
				_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 8, Vector.<Number>([0.5, 1.0, 2.0, 0.0]) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([shape.material.shininess, 1.0, 1.0, 1.0]) );				
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
					
					//Associate normals
					if(shape.normalBuffer) {
						_context3D.setVertexBufferAt( 1, shape.normalBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
					
					//Draw the mesh
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
			}
			
			//_context3D.present();
			cleanBuffers();
		}
		
		private function lightPass(type:String) : void
		{
			if(type == "DIFFUSE") {
				//_context3D.setRenderToTexture(_lightDiffTexture, true);
			} else {
				_context3D.setRenderToTexture(_lightSpecTexture, true);
			}
			
			_context3D.setRenderToBackBuffer();
			_context3D.clear();
			
			if(type == "DIFFUSE") {
				this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.DIRLIGHTDIFFSHADER) );
				//this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.POINTLIGHTDIFFSHADER) );
			} else {
				this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.DIRLIGHTSPECSHADER) );
			}
			
			//Build ModelView-Matrix
			_mvMatrix.identity();
			_mvMatrix.append(_scene.viewMatrix);
			
			//Build ProjectionInverse-Matrix
			_pInvMatrix.identity();
			_pInvMatrix.append(_scene.projectionMatrix);
			_pInvMatrix.invert();
			
			//Associate ModelView-Matrix
			_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvMatrix, true );
			
			if(type == "SPECULAR") {
				//Associate ProjectionInverse-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _pInvMatrix, true );
			}
			
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([0.01, 128.0, 2.0, _scene.zFar]) );
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 1, Vector.<Number>([1.0, 1.0, 1.0, 1.0]) );
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 2, Vector.<Number>([1.0, 255.0, 65025.0, 16581375.0]) );
					
			_context3D.setTextureAt(0, _depthTexture);
			_context3D.setTextureAt(1, _normalTexture);
			
			var lights:Array = this._scene.lights;
				
			_context3D.setDepthTest(false,  Context3DCompareMode.LESS);
						
			for(var i:uint=0; i<lights.length; i++) {
				
				if(lights[i] is DirectionalLight)
				{
					//Set Light direction
					_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  8, Vector.<Number>(lights[i].direction) );
					
				}
				else if(lights[i] is PointLight)
				{				
					//Set Light position
					_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 8, Vector.<Number>(lights[i].location) );
					
					//Set Light attenuation
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 5, Vector.<Number>(lights[i].attenuation) );
					
					//Set Light attenuation
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 6, Vector.<Number>([0.0025, 0.0, 0.0, 0.0]) );
				}
				
				//Set Light color
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 4, Vector.<Number>(lights[i].color) );
				
				_context3D.setVertexBufferAt( 0, _fullScreenQuad.shape.vertexBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_3 );
				_context3D.setVertexBufferAt( 1, _fullScreenQuad.shape.texCoordBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_2 );
				
				//Draw Sphere
				_context3D.drawTriangles( _fullScreenQuad.shape.indexBuffer[0], 0, _fullScreenQuad.shape.numTriangles[0] );
				
				//Set Addative Blending
				_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ONE);
			}
			
			_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO);
			_context3D.setDepthTest(true,  Context3DCompareMode.LESS);
			
			//Clean Buffers
			cleanBuffers();
			
			_context3D.present();
		}
		
		private function geometryPass() : void
		{
			//Clear Buffers and render background
			_context3D.setRenderToBackBuffer();
			this.renderBackground();
			
			var numTriangles:Number = 0;
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = this._scene.drawableObjects;
			
			//Get number of drawable objects
			var numDrawableObjects:Number = drawableObjects.length;
			
			FlashBackend.setObjs(numDrawableObjects);
			
			//Iterate all objects for rendering
			for(var i:uint; i<numDrawableObjects; i++)
			{
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				if(!shape._ready) {
					//Render scene again if shape is ready
					shape.addEventListener(Event.COMPLETE, handleComplete );
				}else{
					
					if(shape.texture && !shape.texture.ready)
					{
						//Render scene again if shape is ready
						shape.texture.addEventListener(Event.COMPLETE, handleComplete );
					}
					
					//Set Dynamic shader
					this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.LPPDYNAMICSHADER) );
					
					//Build ModelView-Matrix
					this._mvMatrix.identity();
					this._mvMatrix.append(trafo);
					this._mvMatrix.append(this._scene.viewMatrix);
					
					//Build ModelViewProjection-Matrix
					this._mvpMatrix.identity();
					this._mvpMatrix.append(trafo);
					this._mvpMatrix.append(this._scene.viewMatrix);
					this._mvpMatrix.append(this._scene.projectionMatrix);
					
					//Associate MVP-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, this._mvpMatrix, true );
					
					//Associate MV-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, this._mvMatrix, true );
					
					//Associate Material
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ shape.material.diffuseColor[0], shape.material.diffuseColor[1], shape.material.diffuseColor[2],1.0-shape.material.transparency ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ shape.material.specularColor[0], shape.material.specularColor[1], shape.material.specularColor[2], shape.material.shininess*128.0 ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ shape.material.emissiveColor[0], shape.material.emissiveColor[1], shape.material.emissiveColor[2], 1.0 ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  4, Vector.<Number>( [ 0.5, 1024.0, 0.0, 0.0 ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  5, Vector.<Number>( [ 0.5, 1.0, 0.0, 0.0 ] ) );
					
					_context3D.setTextureAt(0, _lightDiffTexture);
					_context3D.setTextureAt(1, _lightSpecTexture);
					
					//Associate texture
					if(shape.texture) {
						_context3D.setTextureAt(1, shape.texture.texture);
					}
					
					for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
						//Associate vertices
						if(shape.vertexBuffer) {
							_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
						}
						
						//Associate colors
						if(shape.colorBuffer) {
							if(shape.numColorComponents == 4) {
								_context3D.setVertexBufferAt( 3, shape.colorBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_4 );
							} else {
								_context3D.setVertexBufferAt( 3, shape.colorBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
							}
						}
						
						//Associate texture coordinates
						if(shape.texCoordBuffer && shape.texture) {				
							_context3D.setVertexBufferAt( 1, shape.texCoordBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_2 );
						}
						
						//Draw the mesh
						_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
						
						numTriangles += shape.numTriangles[j];
					}
					
					FlashBackend.setTris(numTriangles);
					
					this.cleanBuffers();
				}
			}
			
			//Swap Back- and Frontbuffer
			this._context3D.present();
		}
	}
}