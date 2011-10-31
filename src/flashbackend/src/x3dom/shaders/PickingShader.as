package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class PickingShader
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
		 * Generate the final Program3D for the PickingShader
		 */
		public function PickingShader()
		{
			//Get 3D Context
			this._context3D = FlashBackend.getContext();
			
			//Generate Program3D 
			this._program3D = this._context3D.createProgram();
			
			//Generate vertex shader
			var vertexShader:AGALMiniAssembler = this.generateVertexShader();
			
			//Generate fragment shader
			var fragmentShader:AGALMiniAssembler = this.generateFragmentShader();
			
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
			shader += "m44 vt0, va0, vc4\n";			//Position*M-Matrix -> (vt0)
			shader += "mov vt1, vc8\n";					//min -> (vt1)
			shader += "mov vt2, vc9\n";					//max -> (vt2)
			shader += "sub vt3, vt2, vt1\n";			//dia = max - min -> (vt3)
			shader += "sub vt0, vt0.xyz0, vt1.xyz0\n";	//worldPos -= min -> vt0
			shader += "div vt0, vt0, vt3\n";			//wordPos /= dia -> vt0
			shader += "mov v0, vt0.xyz0\n"				//worldPos -> Fragment (v0)
			shader += "m44 op, va0, vc0\n";				//Output Position*MVP-Matrix
			
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
			shader += "mov ft0, v0\n";		//worldcoords -> ft0.xyz
			shader += "mov ft0.w, fc0.x\n"; //objectID -> ft0.w
			shader += "mov oc, ft0\n"; 		//Output color
			
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