package x3dom
{
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	
	import x3dom.shaders.*;
	
	public class LPPRenderer
	{
		private var _scene:X3DScene;
		private var _context3D:Context3D;
		private var _shaderCache:ShaderCache;
		
		private var _mvMatrix:Matrix3D = new Matrix3D();
		private var _mvInvMatrix:Matrix3D = new Matrix3D();
		private var _mvpMatrix:Matrix3D = new Matrix3D();
		
		public function LPPRenderer(scene:X3DScene)
		{
			_scene = scene;
			_context3D = FlashBackend.getContext();
			_shaderCache = new ShaderCache();
		}
		
		public function render() : void
		{
			//depthPass();
			normalPass();
		}
		
		private function depthPass() : void
		{
			_context3D.clear();
			
			_context3D.setCulling(Context3DTriangleFace.FRONT);
			_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO );
			
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
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 2, Vector.<Number>([100.0, 0.0, 0.0, 0.0]) );
				
				for(var j:uint = 0; j<shape.vertexBuffer.length; j++) {
					//Associate vertices
					if(shape.vertexBuffer) {
						_context3D.setVertexBufferAt( 0, shape.vertexBuffer[j],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
									
					//Draw the mesh
					_context3D.drawTriangles( shape.indexBuffer[j], 0, shape.numTriangles[j] );
				}
				
				//Clean Buffers
				cleanBuffers();
			}
			
			//Swap Back- and Frontbuffer
			_context3D.present();
		}
		
		private function normalPass() : void
		{
			_context3D.clear();
			
			_context3D.setCulling(Context3DTriangleFace.FRONT);
			_context3D.setBlendFactors(Context3DBlendFactor.ONE, Context3DBlendFactor.ZERO  );
			
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
				
				//Clean Buffers
				cleanBuffers();
			}
			
			//Swap Back- and Frontbuffer
			_context3D.present();
		}
		
		private function lightPass() : void
		{
			
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