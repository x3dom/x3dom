package x3dom {
	
	import com.adobe.utils.*;
	
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Stage;
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	
	import mx.flash.UIMovieClip;
	
	import x3dom.*;
	
	/**
	 * The X3DScene class handles the complete 3D scene managing and rendering
	 */
	public class X3DScene {
		
		private var _context3D:Context3D;
		
		private var _background:Background;
		
		/**
		 * Scenes viewing matrix
		 */
		private var _viewMatrix:Matrix3D	= new Matrix3D();
		
		/**
		 * Scenes projection matrix
		 */
		private var _projMatrix:Matrix3D	= new Matrix3D();
		
		/**
		 * ModelView matrix
		 */
		private var _mvMatrix:Matrix3D		= new Matrix3D();
		
		/**
		 * ModelViewProjection matrix
		 */
		private var _mvpMatrix:Matrix3D 	= new Matrix3D();
		
		/**
		 * Array of all scene lights
		 */
		private var _lights:Array	= new Array();
		
		/**
		 * Array of all meshes
		 */
		private var _meshes:Array	= new Array();
		
		private var _drawableObjects:Array	= new Array();
		
		private var _shaderGenerator:ShaderGenerator;	
		
		public var _stage:Stage;
		
		
		//For Picking
		public var _picking:Boolean = false;
		private var _pickingData:BitmapData;
		public var _min:Vector3D;
		public var _max:Vector3D;
		public var _x:Number;
		public var _y:Number;
		public var _objID:Number = 0;
		public var _pickPos:Vector3D = new Vector3D();

		/**
		 * Creates a new X3DScene object
		 */
		public function X3DScene(context3D:Context3D, stage:Stage) 
		{
			//Set Context3D
			_context3D = context3D;
			
			_stage = stage;
			
			_background = new Background(this, _context3D);
			
			_shaderGenerator = new ShaderGenerator(_context3D);
			
			_pickingData = new BitmapData(550, 400);
		}
		
		/**
		 * 
		 */
		public function renderScene() : void 
		{
			if(_picking) 
				renderPickingPass();
			renderDefaultPass();
			
		}
		
		public function renderDefaultPass() : void
		{	
			//Clear scene before rendering
			_background.render();
			
			//z-Sorting
			_meshes.sort(zSorting);
			
			//Iterate all meshes for rendering
			for(var i:uint = 0; i<_meshes.length; i++)
			{
				//Set Shader
				_context3D.setProgram( _shaderGenerator.generate(_meshes[i], _lights) );
				
				//Build ModelView-Matrix
				_mvMatrix.identity();
				_mvMatrix.append(_meshes[i].modelMatrix);
				_mvMatrix.append(_viewMatrix);
				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(_meshes[i].modelMatrix);
				_mvpMatrix.append(_viewMatrix);
				_mvpMatrix.append(_projMatrix);
				
				//Pass our MVP-Matrix to the shader program
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Pass our MV-Matrix to the shader program
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _mvMatrix, true );
				
				if(_lights.length > 0)
				{
					//Pass our EyePosition to the shader program
					_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  8, Vector.<Number>( [ -_viewMatrix.position.x, -_viewMatrix.position.y, -_viewMatrix.position.z, 1.0 ] ) );
					//Pass our LightDirection to the shader program
					_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  0, Vector.<Number>( _lights[0].direction ) );
				}
				
				//Render Mesh
				_meshes[i].render();
				
			}
			
			//Present/flip back buffer
			_context3D.present();
		}
		
		/**
		 * 
		 */ 
		public function renderPickingPass() : void 
		{
			_context3D.clear();
			
			this.getVolume();
			
			for(var i:uint = 0; i<_meshes.length; i++)
			{
				//Set Shader
				_context3D.setProgram( _shaderGenerator.getPickingShader() );
				
				//Build ModelViewProjection-Matrix
				_mvpMatrix.identity();
				_mvpMatrix.append(_meshes[i].modelMatrix);
				_mvpMatrix.append(_viewMatrix);
				_mvpMatrix.append(_projMatrix);
				
				//Pass our MVP-Matrix to the shader program
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  0, _mvpMatrix, true );
				
				//Pass our M-Matrix to the shader program
				_context3D.setProgramConstantsFromMatrix( Context3DProgramType.VERTEX,  4, _meshes[i].modelMatrix, true );
				
				//Pass min + max
				_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 8, Vector.<Number>([_min.x, _min.y, _min.z, 0.0]) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX, 9, Vector.<Number>([_max.x, _max.y, _max.z, 0.0]) );
				
				var alpha:Number = 1.0 - _meshes[i].id/255.0;
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT, 0, Vector.<Number>([alpha, 0.0, 0.0, 0.0]) );
				
				//Render Mesh
				_meshes[i].render(true);
			}
			
			_context3D.drawToBitmapData(_pickingData);
			
			var pixelValue:uint = _pickingData.getPixel(_x, _y);
			var pickPos:Vector3D = new Vector3D();
			pickPos.x = (pixelValue >> 16 & 0xFF) / 255.0;
			pickPos.y = (pixelValue >> 8 & 0xFF) / 255.0;
			pickPos.z = (pixelValue & 0xFF) / 255.0; 
			
			
			var temp:Vector3D = _max.subtract(_min);
			pickPos.x *= temp.x;
			pickPos.y *= temp.y;
			pickPos.z *= temp.z;
			pickPos = pickPos.add(_min);
			
			_pickPos = pickPos;
			
			pixelValue = _pickingData.getPixel32(_x, _y);
			_objID = 255.0 - (pixelValue >> 24 & 0xFF);
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		public function getVolume() : void
		{
			//Init min/max values
			var min:Vector3D = new Vector3D( 999999.0,  999999.0,  999999.0);
			var max:Vector3D = new Vector3D(-999999.0, -999999.0, -999999.0);
			
			for(var i:uint = 0; i<_meshes.length; i++) {
				if(min.x > _meshes[i].min.x) { min.x = _meshes[i].min.x; }
				if(min.y > _meshes[i].min.y) { min.y = _meshes[i].min.y; }
				if(min.z > _meshes[i].min.z) { min.z = _meshes[i].min.z; }
				
				if(max.x < _meshes[i].max.x) { max.x = _meshes[i].max.x; }
				if(max.y < _meshes[i].max.y) { max.y = _meshes[i].max.y; }
				if(max.z < _meshes[i].max.z) { max.z = _meshes[i].max.z; }
			}
			
			_min = min;
			_max = max
		}
		
		/**
		 * Compare function for Mesh z-sorting
		 */
		private function zSorting(a:Mesh, b:Mesh) : Number
		{
			return _viewMatrix.transformVector(a.center).z - _viewMatrix.transformVector(b.center).z;
		}
		
		/**
		 * Return scenes background object
		 */
		public function get background() : Background
		{
			return _background;
		}
		
		/**
		 * Return scenes lights array
		 */
		public function get lights() : Array
		{
			return _lights;
		}
		
		/**
		 * Return the mesh with the given ID or generates a new one
		 */
		public function getMesh(id:Number, type:String = "MESH") : Object
		{
			for(var i:uint=0; i<_meshes.length; i++)
				if(_meshes[i].id == id) return _meshes[i];
			
			if(type == "TEXT") { 
				_meshes.push( new X3DText(id, this, _context3D) );
			} else {
				_meshes.push( new Mesh(id, this, _context3D) );
			}
						 
			return _meshes[_meshes.length-1];
		}
		
		/**
		 * Scenes viewing matrix
		 */
		public function get viewMatrix() : Matrix3D
		{
			return _viewMatrix;
		}
		
		/**
		 * @private
		 */
		public function set viewMatrix(viewMatrix:Matrix3D) : void
		{
			_viewMatrix = viewMatrix;
		}
		
		/**
		 * Scenes projection matrix
		 */
		public function get projectionMatrix() : Matrix3D
		{
			return _projMatrix;
		}
		
		/**
		 * @private
		 */
		public function set projectionMatrix(projectionMatrix:Matrix3D) : void
		{
			_projMatrix = projectionMatrix;
		}
		
		/**
		 * Scenes shaderGenerator
		 */
		public function get shaderGenerator() : ShaderGenerator
		{
			return _shaderGenerator;
		}

	}
	
}
