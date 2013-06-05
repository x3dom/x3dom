package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class NormalShader
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
		public function NormalShader()
		{
			//Get 3D Context
			this._context3D = FlashBackend.getContext();
			
			//Generate Program3D 
			this._program3D = this._context3D.createProgram();
			
			//Generate vertex shader
			var vertexShader:AGALMiniAssembler = generateVertexShader();
			
			//Generate fragment shader
			var fragmentShader:AGALMiniAssembler = generateFragmentShader();
			
			//Upload shaders to Program3D
			this._program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
		}
		
		/**
		 * Generate the vertex shader
		 */
		private function generateVertexShader() : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader
			//shader += "m44 v0, va1, vc4\n";	//Normal*MV-Matrix -> (v0)
			
			shader += "dp3 vt0.x, va1, vc4\n";	//Normal*MV-Matrix -> (v0)
			shader += "dp3 vt0.y, va1, vc5\n";	//Normal*MV-Matrix -> (v0)
			shader += "dp3 vt0.z, va1, vc6\n";	//Normal*MV-Matrix -> (v0)
			shader += "mov v0, vt0.xyz0\n";	//Normal*MV-Matrix -> (v0)
			//shader += "add vt0.xyz, vt0.xyz, vc8.y\n";
			//shader += "mul vt0.xyz, vt0.xyz, vc8.x\n";	
			
			shader += "m44 op, va0, vc0\n";	//Position*MVP-Matrix -> (op)
			
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
			
			shader += "nrm ft0.xyz, v0\n";
			//shader += "sat ft0.xyz, ft0.xyz\n";
			shader += "add ft0, ft0.xyz, fc1.yyy\n";
			shader += "mul ft0, ft0, fc1.x\n";
			shader += "mov ft0.w, fc0.x\n";
			shader += "mov oc, ft0\n"; 					//Output color*/
			
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
			return this._program3D;
		}
	}
}