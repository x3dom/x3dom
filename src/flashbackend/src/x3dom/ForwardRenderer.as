package x3dom
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display3D.Context3DCompareMode;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Context3DTriangleFace;
	import flash.display3D.Context3DVertexBufferFormat;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.shaders.ShaderIdentifier;
	import x3dom.shapes.Quad;
	import x3dom.texturing.BitmapTexture;
	import x3dom.texturing.CubeMapTexture;

	public class ForwardRenderer extends Renderer
	{	
		private var _mvMatrix:Matrix3D = new Matrix3D();
		private var _mvInvMatrix:Matrix3D = new Matrix3D();
		private var _orthoMatrix:Matrix3D = new Matrix3D();
		private var _quad:Quad = new Quad(FlashBackend.getWidth()/4, FlashBackend.getHeight()/4);
		
		private var _pickingTexture:BitmapTexture;
		
		public function ForwardRenderer(scene:X3DScene)
		{
			super(scene);
			
			_orthoMatrix = Utils.MatrixOrthoRH(FlashBackend.getWidth(), FlashBackend.getHeight(), _scene.zNear, _scene.zFar);
		}
		
		override public function render() : void
		{		
			this.pickingPass();
			this.renderDefaultPass();
		}
		
		private function renderDefaultPass() : void
		{
			//Clear Buffers and render background
			this.renderBackground();
			
			//Get scenes list of lights
			var lights:Array = this._scene.lights;
			
			var numTriangles:Number = 0;
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = this._scene.drawableObjects;
			
			//Get number of drawable objects
			var numDrawableObjects:Number = drawableObjects.length;
			
			FlashBackend.setObjs(numDrawableObjects);
			
			//_context3D.setBlendFactors(Context3DBlendFactor.SOURCE_ALPHA, Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA );
			
			//Iterate all objects for rendering
			for(var i:uint; i<numDrawableObjects; i++)
			{
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				shape.addEventListener(Event.RENDER, handleRender );
				
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
					this._context3D.setProgram( this._shaderCache.getDynamicShader(shape, this._scene) );
					
					//Build ModelView-Matrix
					this._mvMatrix.identity();
					this._mvMatrix.append(trafo);
					this._mvMatrix.append(this._scene.viewMatrix);
					
					this._mvInvMatrix.identity();
					this._mvInvMatrix.append(trafo);
					this._mvInvMatrix.append(this._scene.viewMatrix);
					this._mvInvMatrix.invert();
					
					//Build ModelViewProjection-Matrix
					this._mvpMatrix.identity();
					this._mvpMatrix.append(trafo);
					this._mvpMatrix.append(this._scene.viewMatrix);
					this._mvpMatrix.append(this._scene.projectionMatrix);
					
					if(shape.solid) {
						this._context3D.setCulling(Context3DTriangleFace.FRONT);
					} else {
						this._context3D.setCulling(Context3DTriangleFace.NONE);
					}
					
					//Associate MVP-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, this._mvpMatrix, true );
					
					//Associate MV-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, this._mvMatrix, true );
					
					if(lights.length && shape.material != null)
					{
						//Associate LightDirection
						this._context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  0, Vector.<Number>( lights[0].direction ) );
					}
					
					//Associate Material
					if(shape.material == null) {
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ 1.0, 1.0, 1.0, 1.0] ) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ 0.0, 0.0, 0.0, 0.0 ] ) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ 0.0, 0.0, 0.0, 1.0 ] ) );
					} else {
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ shape.material.diffuseColor[0], shape.material.diffuseColor[1], shape.material.diffuseColor[2],1.0-shape.material.transparency ] ) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ shape.material.specularColor[0], shape.material.specularColor[1], shape.material.specularColor[2], shape.material.shininess*128.0 ] ) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ shape.material.emissiveColor[0], shape.material.emissiveColor[1], shape.material.emissiveColor[2], 1.0 ] ) );
					}
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  4, Vector.<Number>( [ 0.0, 0.0, 0.0, 0.1 ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  5, Vector.<Number>( [ 0.0, 0.5, 1.0, 2.0 ] ) );
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  14, Vector.<Number>( [ 0.07, 0.07, 0.07, 1.0 ] ) );
					
					
					//Associate sphere mapping
					if(shape.sphereMapping) {
						_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  9, Vector.<Number>( [ 0.5, 2.0, 1.0, 1.0 ] ) );
					}
					
					//Associate texture
					if(shape.texCoordBuffer && shape.texture) {
						_context3D.setTextureAt(0, shape.texture.texture);
						if(shape.texture is CubeMapTexture) {
							_context3D.setProgramConstantsFromMatrix( Context3DProgramType.FRAGMENT,  6, this._mvInvMatrix, true );
							_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  10, Vector.<Number>( [ 0.75, 0.75, 0.75, 1.0 ] ) );
						}
						if(shape.texture.transform)
						{
							_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  13, shape.texture.transform, true );
						}
					}
					
					// Associate fog paramenters
					if (this._scene.fogType == 0.0 || this._scene.fogType == 1.0)
					{
						var fogColor : Array = _scene.fogColor;
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 11, Vector.<Number>([fogColor[0], fogColor[1], fogColor[2], this._scene.fogVisRange]));
						// Set other constants for fog calculation, such as the base of the natural logarithm, for exponnential fog
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 12, Vector.<Number>([2.71828, 0.0, 0.0, 0.0]));
					}
					
					for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
						//Associate vertices
						if(shape.vertexBuffer) {
							_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
						}
						
						//Associate texture coordinates
						if(shape.texCoordBuffer && shape.texture) {				
							_context3D.setVertexBufferAt( 1, shape.texCoordBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_2 );
						}
						
						//Associate normals
						if(shape.normalBuffer && lights.length && shape.material) {
							_context3D.setVertexBufferAt( 2, shape.normalBuffer[j], 0, Context3DVertexBufferFormat.FLOAT_3 );
						}
						
						//Associate colors
						if(shape.colorBuffer) {
							if(shape.numColorComponents == 4) {
								_context3D.setVertexBufferAt( 3, shape.colorBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_4 );
							} else {
								_context3D.setVertexBufferAt( 3, shape.colorBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
							}
						}
						
						//Draw the mesh
						_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
						
						numTriangles += shape.numTriangles[j];
					}
					
					FlashBackend.setTris(numTriangles);
					
					this.cleanBuffers();
				
				}
			}
			
			//Capture Screen if needed
			if(this._captureScreen) {
				this.captureScreen();
			}
			
			//Swap Back- and Frontbuffer
			this._context3D.present();
		}
		
		private function pickingPass() : void
		{
			this._context3D.clear();
			
			this._scene.calculateBB();
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = this._scene.drawableObjects;
			
			//Get number of drawable objects
			var numDrawableObjects:Number = drawableObjects.length;
			
			//Iterate all objects for rendering
			for(var i:uint; i<numDrawableObjects; i++)
			{
				var id:uint = drawableObjects[i].id;
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				if(shape._ready) 
				{
					//Set Picking Shader
					this._context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.PICKING) );
					
					//Build ModelViewProjection-Matrix
					this._mvpMatrix.identity();
					this._mvpMatrix.append(trafo);
					this._mvpMatrix.append(this._scene.viewMatrix);
					this._mvpMatrix.append(this._scene.projectionMatrix);
					
					//Associate MVP-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, this._mvpMatrix, true );
					
					//Associate M-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, trafo, true );
					
					//Associate min + max
					this._context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 8, Vector.<Number>([this._scene.min.x, this._scene.min.y, this._scene.min.z, 0.0]) );
					this._context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 9, Vector.<Number>([this._scene.max.x, this._scene.max.y, this._scene.max.z, 0.0]) );
					
					var alpha:Number = 1.0 - id/255.0;
					this._context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([alpha, 0.0, 0.0, 0.0]) );
					
					for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
						//Associate vertices
						if(shape.vertexBuffer) {
							this._context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
						}
					
						//Draw the shape
						this._context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
					}
					
					this.cleanBuffers();
					
				}
				
			}
			
			//Draw backbuffer to bitmapbuffer
			this._context3D.drawToBitmapData(_bitmapBuffer);
			
			var pixelValue:uint = this._bitmapBuffer.getPixel(FlashBackend.getMouseX(), FlashBackend.getMouseY());
			var pickPos:Vector3D = new Vector3D();
			pickPos.x = (pixelValue >> 16 & 0xFF) / 255.0;
			pickPos.y = (pixelValue >> 8 & 0xFF) / 255.0;
			pickPos.z = (pixelValue & 0xFF) / 255.0; 
			
			
			var temp:Vector3D = this._scene.max.subtract(_scene.min);
			pickPos.x *= temp.x;
			pickPos.y *= temp.y;
			pickPos.z *= temp.z;
			pickPos = pickPos.add(this._scene.min);
			
			this._scene.pickedPos = pickPos;
			
			pixelValue = this._bitmapBuffer.getPixel32(FlashBackend.getMouseX(), FlashBackend.getMouseY());
			this._scene.pickedObj = 255.0 - (pixelValue >> 24 & 0xFF);
		}
		
		private function debugPass() : void
		{
			_pickingTexture = new BitmapTexture(new Bitmap(this._bitmapBuffer));
			
			_context3D.setDepthTest(false,  Context3DCompareMode.LESS);
			
			//Set Dynamic shader
			this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.LPPDEBUGSHADER) );
			
			var xPos:Number = (-FlashBackend.getWidth()/2) + (FlashBackend.getWidth()/8);
			var yPos:Number = (FlashBackend.getHeight()/2) - (FlashBackend.getHeight()/8);
			var mpMatrix:Matrix3D = new Matrix3D();
			mpMatrix.appendTranslation(xPos, yPos, 0);
			mpMatrix.append(_orthoMatrix);
				
			this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, mpMatrix, true );
				
			_context3D.setTextureAt(0, _pickingTexture.texture);
	
			_context3D.setVertexBufferAt( 0, _quad.shape.vertexBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_3 );
			_context3D.setVertexBufferAt( 1, _quad.shape.texCoordBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_2 );
			
			_context3D.drawTriangles( _quad.shape.indexBuffer[0], 0, _quad.shape.numTriangles[0] );
				
			this.cleanBuffers();
			
			this._context3D.present();
			
			_context3D.setDepthTest(true,  Context3DCompareMode.LESS);
		}
		
	}
}