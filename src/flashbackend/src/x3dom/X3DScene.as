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

		/**
		 * Creates a new X3DScene object
		 */
		public function X3DScene(context3D:Context3D) 
		{
			//Set Context3D
			_context3D = context3D;
			
			_background = new Background(_context3D);
			
			createShader();
		}
		
		/**
		 * 
		 */
		public function renderScene() : void 
		{
			//Clear scene before rendering
			_background.render();
			
			//Set Shader
			_context3D.setProgram ( _shaderProgram );
			
			//Pass our LightDirection to the shader program
			_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  0, Vector.<Number>( [ 0.0, 0.0, 1.0, 1.0 ] ) );
			//Pass our EyePosition to the shader program
			_context3D.setProgramConstantsFromVector( Context3DProgramType.VERTEX,  9, Vector.<Number>( [ -_viewMatrix.position.x, -_viewMatrix.position.y, -_viewMatrix.position.z, 1.0 ] ) );
			
			//z-Sorting
			_meshes.sort(zSorting);

			//Iterate all meshes for rendering
			for(var i:uint = 0; i<_meshes.length; i++)
			{
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
			
				//_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ 1.0, 0.8, 0.2, 128.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ 0.5, 0.5, 0.5, 1.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ 0.0, 0.0, 0.0, 1.0 ] ) );
				
				//Render Mesh
				_meshes[i].render();
			}
			
			//Present/flip back buffer
			_context3D.present();
		}
		
		/**
		 * TODO: own shader class, this one is only for Testing
		 */
		private function createShader() : void
		{
			// A simple vertex shader which does a 3D transformation
			var vertexShaderAssembler:AGALMiniAssembler = new AGALMiniAssembler();
			vertexShaderAssembler.assemble( Context3DProgramType.VERTEX,
				//   Name              Reg   Size
				//   ----------------- ----- ----
				//   MVP-Matrix		   vc0     4
				//   MV-Matrix         vc4     4
				//   EyePosition       vc9     1
										   
				"m44 op, va0, vc0\n" +
				
				"dp3 vt0.x, va0, vc4\n" +
				"dp3 vt0.y, va0, vc5\n" +
				"dp3 vt0.z, va0, vc6\n" +
				
				"sub v1, vc9, -vt0.xyz\n" + 
				//"mov v1, -vt0.xyz0\n" + 
				
				"dp3 vt1.x, va2, vc4\n" +
				"dp3 vt1.y, va2, vc5\n" +
				"dp3 vt1.z, va2, vc6\n" +
				
				//"mov v0, va1\n"			 	//TexCoord -> Fragment(v0)	
				"mov v3, vt1.xyz\n"

							
			);			
			
			// A simple fragment shader which will use the vertex position as a color
			var fragmentShaderAssembler:AGALMiniAssembler = new AGALMiniAssembler();
			fragmentShaderAssembler.assemble( Context3DProgramType.FRAGMENT,
				//"mov ft6, v0 \n" +
				//"sub ft6.y, fc3.w, ft6.y \n" +					//Flip V-Coord
				//"tex ft0, ft6, fs0 <2d, clamp, linear> \n" +	//Sample Texture(ft0)
				"nrm ft1.xyz, fc0\n" +							//Normalize LightDir(ft1)
				"nrm ft2.xyz, v3 \n" +							//Normalize Normal(ft2)
				"add ft4, ft1.xyz, v1\n" +						//L+V
				"nrm ft4.xyz, ft4\n" +							//Normalize(L+V)
				"dp3 ft3, ft2.xyz, ft1.xyz\n" +					//NdotL
				"dp3 ft5, ft2.xyz, ft4\n" +						//NdotH
				"sat ft3, ft3\n" +								//saturate(NdotL)
				"sat ft5, ft5\n" +								//saturate(NdotH)
				"pow ft5, ft5, fc1.w\n" +						//pow(NdotH, shininess)
				"mul ft5, ft3, ft5\n" +							//NdotL * pow(NdotH, shininess);
				//"mul ft3, ft3, ft0.xyz\n" +
				"mul ft3, ft3, fc1.xyz\n" +
				"mul ft5, ft5, fc2.xyz\n" +
				"add ft3, ft3, fc3\n" +
				"add ft3, ft3, ft5\n" +
				"sat ft3, ft3\n" +								//saturate(NdotL)
				"mov oc, ft3.xyz \n"							//Output Color
			);
			
			// combine shaders into a program which we then upload to the GPU
			_shaderProgram = _context3D.createProgram();
			_shaderProgram.upload( vertexShaderAssembler.agalcode, fragmentShaderAssembler.agalcode);
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
