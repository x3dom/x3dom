package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class LPPDynamicShader
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
		public function LPPDynamicShader()
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
			shader += "m44 v0, va0, vc0\n";		//PositionWS -> (v0)
			shader += "m44 op, va0, vc0\n";		//Position*MVP-Matrix -> (op)
			
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
			shader += "mov ft0, v0\n";
			shader += "div ft0, ft0, ft0.w\n";
			shader += "neg ft0.y, ft0.y\n";
			shader += "add ft0, ft0, fc5.y\n";
			shader += "mul ft0, ft0, fc5.x\n";
			
			//shader += "add ft0, ft0, fc6\n";
			
			shader += "tex ft1, ft0, fs0 <2d, clamp, linear>\n";		//Sample Light Texture		-> ft1
			shader += "tex ft2, ft0, fs1 <2d, clamp, linear>\n";		//Sample Light Texture		-> ft1
			
			shader += "mul ft3.xyz, fc1.xyz, ft1.xyz\n";
			shader += "mov ft3.w, fc1.w\n";
			shader += "mul ft4.xyz, fc2.xyz, ft2.xyz\n";
			shader += "mov ft4.w, fc1.w\n";
			shader += "add ft5, ft3, ft4\n";
			
			shader += "sat ft5, ft5\n";

			shader += "mov oc, ft5\n"; 					//Output color*/
			
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