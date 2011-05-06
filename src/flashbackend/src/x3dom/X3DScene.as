package x3dom {
	
	import com.adobe.utils.*;
	
	import flash.display3D.*;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	
	import x3dom.*;
	
	/**
	 * The X3DScene class handles the complete 3D scene managing and rendering
	 */
	public class X3DScene {
		
		private var _context3D:Context3D;
		private var _shaderProgram:Program3D;
		
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
		
		private var _shaderGenerator:ShaderGenerator;	

		/**
		 * Creates a new X3DScene object
		 */
		public function X3DScene(context3D:Context3D) 
		{
			//Set Context3D
			_context3D = context3D;
			
			_background = new Background(_context3D);
			
			_shaderGenerator = new ShaderGenerator(_context3D);	
		}
		
		/**
		 * 
		 */
		public function renderScene() : void 
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
			
			//Clean lights array - TODO need ID's for lights, so lights can updated without deleting! !!
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
		public function getMesh(id:Number) : Mesh
		{
			for(var i:uint=0; i<_meshes.length; i++)
				if(_meshes[i].id == id) return _meshes[i];
			
			_meshes.push( new Mesh(id, this, _context3D) );
						 
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

	}
	
}
