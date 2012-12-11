package x3dom
{
	import com.adobe.images.PNGEncoder;
	
	import flash.display.BitmapData;
	import flash.display.PNGEncoderOptions;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.Matrix3D;
	import flash.geom.Vector3D;
	import flash.utils.ByteArray;
	
	import mx.utils.Base64Encoder;
	
	import x3dom.shaders.*;
	import x3dom.texturing.CubeMapTexture;
	
	
	public class Renderer
	{
		
		protected var _scene:X3DScene;
		protected var _context3D:Context3D;
		protected var _shaderCache:ShaderCache;
		
		protected var _mvpMatrix:Matrix3D = new Matrix3D();
		
		protected var _captureScreen:Boolean;
		
		protected var _bitmapBuffer:BitmapData;
		protected var _screenURL:String;
		protected var _base64Encoder:Base64Encoder;
		
		public function Renderer(scene:X3DScene)
		{
			this._scene = scene;
			this._context3D = FlashBackend.getContext();
			this._shaderCache = new ShaderCache();
			this._captureScreen = false;
			this._bitmapBuffer = new BitmapData(FlashBackend.getWidth(), FlashBackend.getHeight());
			this._base64Encoder = new Base64Encoder();
		}
		
		public function render() : void
		{		
			trace("Override this function");
		}
		
		protected function renderBackground() : void
		{
			//Get scenes Background
			var background:Background = this._scene.background;
			
			//Clear buffers with Background color
			this._context3D.clear(background.skyColor[0], background.skyColor[1], background.skyColor[2], background.transparency);
			
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
					this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.BACKGROUNDTEXTURE) );
					
				} else {
					//Get the background Sphere
					shape = background.sphere;
					
					//Build ModelViewProjection-Matrix
					this._mvpMatrix.identity();
					this._mvpMatrix.append(this._scene.viewMatrix);
					this._mvpMatrix.append(this._scene.projectionMatrix);
					
					if(background.hasSkyTexture()) {
						//Set BackgroundSkyTexture shader
						this._context3D.setProgram( this._shaderCache.getShader(ShaderIdentifier.BACKGROUNDSKYTEXTURE) );
						this._context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([1.0, 0.5, 2.0, 0.0]) );
					} else {
						//Set BackgroundSkyTexture shader
						this._context3D.setProgram( _shaderCache.getShader(ShaderIdentifier.BACKGROUNDCUBETEXTURE) );
						this._context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([0.0, 0.0, 1.0, 0.0]) );
					}
					
					//Associate MVP-Matrix
					this._context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, this._mvpMatrix, true );
				}
				
				//Check if shape is ready to render
				if(shape.texture && !shape.texture.ready)
				{
					//Render scene again if shape is ready
					shape.texture.addEventListener(Event.COMPLETE, handleComplete );
				}
				
				//Disable DepthTest 
				this._context3D.setDepthTest(false, Context3DCompareMode.LESS);
				
				//Disable backface culling
				this._context3D.setCulling(Context3DTriangleFace.NONE);
				
				//Associate vertices
				this._context3D.setVertexBufferAt( 0, shape.vertexBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_3 );
				
				if(!background.hasCubeTexture()) {
					//Associate texture coordinates
					this._context3D.setVertexBufferAt( 1, shape.texCoordBuffer[0],  0, Context3DVertexBufferFormat.FLOAT_2 );
				}
				
				//Associate texture
				this._context3D.setTextureAt(0, shape.texture.texture);
				
				//Draw the mesh
				this._context3D.drawTriangles( shape.indexBuffer[0], 0, shape.numTriangles[0] );
				
				//Enable DepthTest
				this._context3D.setDepthTest(true, Context3DCompareMode.LESS);
				
				//Clean all Buffers
				this.cleanBuffers();
			}
		}
		
		protected function captureScreen() : void
		{
			//Set mime type
			this._screenURL = "data:image/png;base64,";
			
			//Draw scene to BitmapDate
			this._context3D.drawToBitmapData(_bitmapBuffer);
			
			//Encode BitmapData to PNG
			var png:ByteArray = PNGEncoder.encode(_bitmapBuffer);
			
			//Encode PNG to Base64
			this._base64Encoder.encodeBytes(png);
			
			//Apppend encoded string
			this._screenURL += this._base64Encoder.toString();
		}
		
		public function get screenURL() : String
		{
			//Enable screen capturing
			this._captureScreen = true;
			
			//Render scene
			this.render();
			
			//Disable screen capturing
			this._captureScreen = false;
			
			//Return screen URL
			return _screenURL;
		}
		
		protected function handleComplete(e:Event) : void
		{
			this.render();
			e.target.removeEventListener(Event.COMPLETE, handleComplete);
		}
		
		protected function handleRender(e:Event) : void
		{
			this.render();
		}
		
		protected function cleanBuffers() : void
		{
			this._context3D.setTextureAt(0, null);
			this._context3D.setTextureAt(1, null);
			this._context3D.setVertexBufferAt( 0, null );
			this._context3D.setVertexBufferAt( 1, null );
			this._context3D.setVertexBufferAt( 2, null );
			this._context3D.setVertexBufferAt( 3, null );
		}
	}
}