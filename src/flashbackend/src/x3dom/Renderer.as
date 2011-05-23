package x3dom
{
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.shaders.*;

	public class Renderer
	{
		private var _scene:X3DScene;
		private var _context3D:Context3D;
		private var _shaderCache:ShaderCache;
		
		private var _bitmapBuffer:BitmapData;
		
		private var _mvMatrix:Matrix3D = new Matrix3D();
		private var _mvpMatrix:Matrix3D = new Matrix3D();
		
		public function Renderer(scene:X3DScene)
		{
			_scene = scene;
			_context3D = FlashBackend.getContext();
			_shaderCache = new ShaderCache();
			
			_bitmapBuffer = new BitmapData(FlashBackend.getWidth(), FlashBackend.getHeight());
		}
		
		public function render() : void
		{		
			pickingPass();
			//shadowPass();
			renderDefaultPass();
		}
		
		private function renderDefaultPass() : void
		{
			//Clear Buffers and render background
			renderBackground();
			
			//Get scenes list of lights
			var lights:Array = _scene.lights;
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = _scene.drawableObjects;
			
			//Iterate all objects for rendering
			for(var i:uint; i<drawableObjects.length; i++)
			{
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				if(shape.texture && !shape.texture.ready)
				{
					//Render scene again if shape is ready
					shape.texture.addEventListener(Event.COMPLETE, handleTextureComplete );
				}
				
				//Set Dynamic shader
				_context3D.setProgram( _shaderCache.getDynamicShader(shape, lights) );
				
				//Build ModelView-Matrix
				_mvMatrix.identity();
				_mvMatrix.append(trafo);
				_mvMatrix.append(_scene.viewMatrix);
				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(trafo);
				_mvpMatrix.append(_scene.viewMatrix);
				_mvpMatrix.append(_scene.projectionMatrix);
				
				if(shape.solid) {
					_context3D.setCulling(Context3DTriangleFace.FRONT);
				} else {
					_context3D.setCulling(Context3DTriangleFace.NONE);
				}
				
				//Associate MVP-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Associate MV-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _mvMatrix, true );
				
				if(lights.length)
				{
					//Associate EyePosition
					_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  8, Vector.<Number>( [ -_scene.viewMatrix.position.x, -_scene.viewMatrix.position.y, -_scene.viewMatrix.position.z, 1.0 ] ) );
					//Associate LightDirection
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  0, Vector.<Number>( lights[0].direction ) );
				}
				
				//Associate Material
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ shape.material.diffuseColor[0], shape.material.diffuseColor[1], shape.material.diffuseColor[2],1.0-shape.material.transparency ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ shape.material.specularColor[0], shape.material.specularColor[1], shape.material.specularColor[2], shape.material.shininess*128.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ shape.material.emissiveColor[0], shape.material.emissiveColor[1], shape.material.emissiveColor[2], 1.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  4, Vector.<Number>( [ 0.0, 0.0, 0.0, 0.1 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  5, Vector.<Number>( [ 0.0, 0.5, 1.0, 2.0 ] ) );
				
				
				//Associate sphere mapping
				if(shape.sphereMapping) {
					_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  9, Vector.<Number>( [ 0.5, 2.0, 1.0, 1.0 ] ) );
				}
				
				//Associate texture
				if(shape.texture) {
					_context3D.setTextureAt(0, shape.texture.texture);
				}
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
					
					//Associate normals
					if(shape.normalBuffer && lights.length) {
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
					
					//Associate texture and texture coordinates
					if(shape.texCoordBuffer && shape.texture) {				
						_context3D.setVertexBufferAt( 1, shape.texCoordBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_2 );
					}
					
					//Draw the mesh
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
				
				cleanBuffers();
			}
			
			//Swap Back- and Frontbuffer
			_context3D.present();
		}
		
		private function pickingPass() : void
		{
			_context3D.clear();
			
			_scene.calculateBB();
			
			//Get scenes list of sorted drawableObjects
			var drawableObjects:Array = _scene.drawableObjects;
			
			//Iterate all objects for rendering
			for(var i:uint; i<drawableObjects.length; i++)
			{
				var id:uint = drawableObjects[i].id;
				var shape:Shape = drawableObjects[i].shape;
				var trafo:Matrix3D = drawableObjects[i].transform;
				
				//Set Picking Shader
				_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.PICKING) );
				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(trafo);
				_mvpMatrix.append(_scene.viewMatrix);
				_mvpMatrix.append(_scene.projectionMatrix);
				
				//Associate MVP-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Associate M-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, trafo, true );
				
				//Associate min + max
				_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 8, Vector.<Number>([_scene.min.x, _scene.min.y, _scene.min.z, 0.0]) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 9, Vector.<Number>([_scene.max.x, _scene.max.y, _scene.max.z, 0.0]) );
				
				var alpha:Number = 1.0 - id/255.0;
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([alpha, 0.0, 0.0, 0.0]) );
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
				
					//Draw the shape
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
				
				cleanBuffers();
			}
			
			//Draw backbuffer to bitmapbuffer
			_context3D.drawToBitmapData(_bitmapBuffer);
			
			var pixelValue:uint = _bitmapBuffer.getPixel(FlashBackend.getMouseX(), FlashBackend.getMouseY());
			var pickPos:Vector3D = new Vector3D();
			pickPos.x = (pixelValue >> 16 & 0xFF) / 255.0;
			pickPos.y = (pixelValue >> 8 & 0xFF) / 255.0;
			pickPos.z = (pixelValue & 0xFF) / 255.0; 
			
			
			var temp:Vector3D = _scene.max.subtract(_scene.min);
			pickPos.x *= temp.x;
			pickPos.y *= temp.y;
			pickPos.z *= temp.z;
			pickPos = pickPos.add(_scene.min);
			
			_scene.pickedPos = pickPos;
			
			pixelValue = _bitmapBuffer.getPixel32(FlashBackend.getMouseX(), FlashBackend.getMouseY());
			_scene.pickedObj = 255.0 - (pixelValue >> 24 & 0xFF);
		}
		
		private function shadowPass() : void
		{
			
		}
		
		private function renderBackground() : void
		{
			//Get scenes Background
			var background:Background = _scene.background;
			
			//Clear buffers with Background color
			_context3D.clear(background.skyColor[0], background.skyColor[1], background.skyColor[2], background.transparency);
			
			//Check if there is a background texture
			if(background.hasBackTexture() || background.hasSkyTexture() || background.hasCubeTexture())
			{
				//var for hoding geometry
				var shape:Shape;
				
				//Check what geometry we need
				if(background.hasBackTexture()) {
					//Get the background Plane
					shape = background.plane;
					
					//Set BackgroundTexture shader
					_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.BACKGROUNDTEXTURE) );
					
				} else {
					//Get the background Sphere
					shape = background.sphere;
					
					//Build ModelViewProjection-Matrix
					_mvpMatrix.identity();
					_mvpMatrix.append(_scene.viewMatrix);
					_mvpMatrix.append(_scene.projectionMatrix);
					
					if(background.hasSkyTexture()) {
						//Set BackgroundSkyTexture shader
						_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.BACKGROUNDSKYTEXTURE) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([1.0, 0.5, 2.0, 0.0]) );
					} else {
						//Set BackgroundSkyTexture shader
						_context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.BACKGROUNDCUBETEXTURE) );
						_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([0.0, 0.0, 1.0, 0.0]) );
					}
					
					//Associate MVP-Matrix
					_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				}
				
				//Check if shape is ready to render
				if(shape.texture && !shape.texture.ready)
				{
					//Render scene again if shape is ready
					shape.texture.addEventListener(Event.COMPLETE, handleTextureComplete );
				}
				
				//Disable DepthTest 
				_context3D.setDepthTest(false, Context3DCompareMode.LESS);
				
				//Disable backface culling
				_context3D.setCulling(Context3DTriangleFace.NONE);
				
				//Associate vertices
				_context3D.setVertexBufferAt( 0, shape.vertexBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_3 );
				
				if(!background.hasCubeTexture()) {
					//Associate texture coordinates
					_context3D.setVertexBufferAt( 1, shape.texCoordBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_2 );
				}
				
				//Associate texture
				_context3D.setTextureAt(0, shape.texture.texture);
				
				//Draw the mesh
				_context3D.drawTriangles( shape.indexBuffer[0], 0, shape.numTriangles[0] );
				
				//Enable DepthTest
				_context3D.setDepthTest(true, Context3DCompareMode.LESS);
				
				//Clean all Buffers
				cleanBuffers();
			}
		}
		
		private function handleTextureComplete(e:Event) : void
		{
			this.render();
			e.target.removeEventListener(Event.COMPLETE, handleTextureComplete);
		}
		
		private function cleanBuffers() : void
		{
			_context3D.setTextureAt(0, null);
			_context3D.setVertexBufferAt( 0, null );
			_context3D.setVertexBufferAt( 1, null );
			_context3D.setVertexBufferAt( 2, null );
			_context3D.setVertexBufferAt( 3, null );
		}
	}
}