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
			shader += "m44 v0, va0, vc4\n";	//Position*MV-Matrix -> (v0)
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
			
			//Build shader
			//Normalize depth
			shader += "neg ft0.x, v0.z\n";
			shader += "div ft0.x, ft0.x, fc2.x\n";				//VSPos.z / farClipDistance
			
			//Encoding floats to RGBA - Thanks To: "Aras" 
			//http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
			
			shader += "mul ft0, fc0, ft0.x\n";					//
			shader += "frc ft0, ft0\n";							//
			shader += "mul ft1, ft0.yzww, fc1\n"; 				//
			shader += "sub oc, ft0, ft1\n"; 					//Output color*/
			
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