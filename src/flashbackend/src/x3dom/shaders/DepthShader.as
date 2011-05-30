package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class DepthShader
	{
		/**
		 * Holds our 3D context
		 */
		private var _context3D:Context3D;
		
		/**
		 * Program3D for the PickingShader
		 */
		private var _program3D:Program3D;
		
		/**
		 * Generate the final Program3D for the DepthShader
		 */
		public function DepthShader()
		{
			//Get 3D Context
			_context3D = FlashBackend.getContext();
			
			//Generate Program3D 
			_program3D = _context3D.createProgram();
			
			//Generate vertex shader
			var vertexShader:AGALMiniAssembler = generateVertexShader();
			
			//Generate fragment shader
			var fragmentShader:AGALMiniAssembler = generateFragmentShader();
			
			//Upload shaders to Program3D
			program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
		}
		
		/**
		 * Generate the vertex shader
		 */
		private function generateVertexShader() : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader							
			shader += "m44 vt0, va0, vc0\n";	//Position*MVP-Matrix -> (v0)
			shader += "mov v0, vt0\n";			//
			shader += "mov op, vt0\n";			//Output Position*MVP-Matrix
			
			//Generate AGALMiniAssembler from generated Shader
			var vertexShader:AGALMiniAssembler = new AGALMiniAssembler();
			vertexShader.assemble( Context3DProgramType.VERTEX, shader );
			
			//Return AGALMiniAssembler
			return vertexShader;
		}
		
		/**
		 * Generate the fragment shader
		 */
		private function generateFragmentShader() : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader
			shader += "mul ft0, fc0, v0.z\n";					//
			shader += "frc ft0, ft0\n";							//
			shader += "mul ft1, ft0.yzww, fc1\n"; 				//
			shader += "sub oc, ft0, ft1\n"; 							//Output color
			
			//Generate AGALMiniAssembler from generated Shader
			var fragmentShader:AGALMiniAssembler = new AGALMiniAssembler();
			fragmentShader.assemble( Context3DProgramType.FRAGMENT, shader );
			
			//Return AGALMiniAssembler
			return fragmentShader;
		}
		
		/**
		 * Return the generated Program3D
		 */ 
		public function get program3D() : Program3D
		{
			return _program3D;
		}
	}
}