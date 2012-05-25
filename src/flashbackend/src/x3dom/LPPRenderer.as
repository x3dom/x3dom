package x3dom
{
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.shaders.*;
	
	public class LPPRenderer extends Renderer
	{		
		private var _depthTexture:Texture;
		private var _normalTexture:Texture;
		private var _lightTexture:Texture;
		
		private var _mvMatrix:Matrix3D = new Matrix3D();
		private var _mvInvMatrix:Matrix3D = new Matrix3D();
		private var _mvpMatrix:Matrix3D = new Matrix3D();
		private var _pInvMatrix:Matrix3D = new Matrix3D();
		
		private var _fullScreenQuad:Shape = new Shape();
		
		public function LPPRenderer(scene:X3DScene)
		{
			super(scene);
			
			_depthTexture  = _context3D.createTexture(FlashBackend.getWidth(), FlashBackend.getHeight(), Context3DTextureFormat.BGRA, true);
			_normalTexture = _context3D.createTexture(FlashBackend.getWidth(), FlashBackend.getHeight(), Context3DTextureFormat.BGRA, true);
			//_lightTexture  = _context3D.createTexture(FlashBackend.getWidth(), FlashBackend.getHeight(), Context3DTextureFormat.BGRA, true);
			
			this._fullScreenQuad.setVertices( 0, Vector.<Number>( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0] ) );
			this._fullScreenQuad.setTexCoords( 0, Vector.<Number>( [0,1, 1,1, 1,0, 0,0] ) );
			this._fullScreenQuad.setIndices( 0, Vector.<uint>( [0,1,2, 2,3,0] ) );
		}
		
		override public function render() : void
		{
			depthPass();
			normalPass();
			lightPass();
		}
		
		private function depthPass() : void
		{
			
			_context3D.setCulling(Context3DTriangleFace.FRONT);
			_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO );
			_context3D.setRenderToTexture(_depthTexture, true);
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
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Associate MV-Matrix
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _mvMatrix, true );
				
				//Associate constants for float to rgba encoding
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([1.0, 255.0, 65025.0, 16581375.0]) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 1, Vector.<Number>([0.00392156886, 0.00392156886, 0.00392156886, 0.0]) );
				
				//Associate farclip distance
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 2, Vector.<Number>([1000.0, 0.0, 0.0, 0.0]) );
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
									
					//Draw the mesh
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
			}
		}
		
		private function normalPass() : void
		{
			_context3D.setRenderToTexture(_normalTexture, true);
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
				_mvMatrix.transpose();
				_mvMatrix.invert();
				
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
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([0.5, 1.0, 2.0, 0.0]) );
				
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
		}
		
		private function lightPass() : void
		{
			_context3D.setRenderToBackBuffer();
			_context3D.clear();
			
			this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.DIRLIGHTSHADER) );
			
			//Build ModelView-Matrix
			_mvMatrix.identity();
			_mvMatrix.append(_scene.viewMatrix);
			
			//Build ProjectionInverse-Matrix
			_pInvMatrix.identity();
			_pInvMatrix.append(_scene.projectionMatrix);
			_pInvMatrix.invert();
			
			//Associate MVP-Matrix
			_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
			
			//Associate MV-Matrix
			_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _pInvMatrix, true );
			_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  8, Vector.<Number>([0.0, 0.0, 1.0, 0.0]) );
			
			
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([0.00048828125, 0.0009765625, 2.0, 1000.0]) );
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 1, Vector.<Number>([1.0, 1.0, 1.0, 1.0]) );
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 2, Vector.<Number>([1.0, 255.0, 65025.0, 16581375.0]) );
			
			_context3D.setVertexBufferAt( 0, _fullScreenQuad.vertexBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_3 );
			_context3D.setVertexBufferAt( 1, _fullScreenQuad.texCoordBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_2 );
			
			_context3D.setTextureAt(0, _depthTexture);
			_context3D.drawTriangles( _fullScreenQuad.indexBuffer[0], 0, _fullScreenQuad.numTriangles[0] );
			
			//Clean Buffers
			cleanBuffers();
			
			//Swap Back- and Frontbuffer
			_context3D.present();
		}
		
		private function geometryPass() : void
		{
			
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