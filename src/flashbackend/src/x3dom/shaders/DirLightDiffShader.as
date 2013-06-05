package x3dom.shaders
{
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	import x3dom.*;
	
	public class DirLightDiffShader
	{
		/**
		 * Holds our 3D context
		 */
		private var _context3D:Context3D;
		
		/**
		 * Program3D for the BackgroundTextureShader
		 */
		private var _program3D:Program3D;
		
		/**
		 * Generate the final Program3D for the DirLightShader
		 */
		public function DirLightDiffShader(isHeadLight:Boolean = false)
		{
			//Get 3D Context
			this._context3D = FlashBackend.getContext();
			
			//Generate Program3D 
			this._program3D = this._context3D.createProgram();
			
			//Generate vertex shader
			var vertexShader:AGALMiniAssembler = generateVertexShader(isHeadLight);
			
			//Generate fragment shader
			var fragmentShader:AGALMiniAssembler = generateFragmentShader();
			
			//Upload shaders to Program3D
			this._program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
		}
		
		/**
		 * Generate the vertex shader
		 */
		private function generateVertexShader(isHeadLight:Boolean) : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader						
			shader += "mov v0, va1\n";			//TexCoord -> Fragment(v0)		
						
			if (isHeadLight)
			{
				shader += "mov v2, vc8\n";	
			} 
			else 
			{
				shader += "mov vt2,vc8\n";
				shader += "dp3 vt1.x, vt2, vc0\n";
				shader += "dp3 vt1.y, vt2, vc1\n";
				shader += "dp3 vt1.z, vt2, vc2\n";
				shader += "mov v2, vt1.xyz0\n";
			}
			
			shader += "mov op, va0\n";
			
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
			/*02*/ shader += "tex ft1, v0, fs0 <2d, clamp, linear>\n";		//Sample Depth Texture		-> ft1
			 
			/*03*/ shader += "mov ft2, fc1\n";
			/*04*/ shader += "div ft2, ft2, fc2\n";							//1/1.0, 1/255.0, 1/65025.0, 1/16581375.0
			/*05*/ shader += "dp4 ft1.x, ft1, ft2\n"; 						//dot(rgba,ft2) = depth -> ft1.x
			
			/*06*/ shader += "sub ft3.xxxx, ft1.x, fc0.x\n";				//if(depth-0.01)
			/*07*/ shader += "kill ft3.xxxx\n";								//kill

			/*11*/ shader += "tex ft2, v0, fs1 <2d, clamp, linear>\n";		//Sample Normal Texture		-> ft2
			/*12*/ shader += "mul ft2.xyz, ft2.xyz, fc0.z\n";				//Normal * 2.0
			/*13*/ shader += "sub ft2.xyz, ft2.xyz, fc1.x\n";				//Normal - 1.0
			/*14*/ shader += "nrm ft2.xyz, ft2.xyz\n";						//normalize(N)
			
			/*15*/ shader += "neg ft3, v2\n";								//-LightDir
			/*16*/ shader += "nrm ft3.xyz, ft3\n";							//normalize(LightDir)
			
			/*19*/ shader += "dp3 ft4, ft2, ft3\n";							//NdotL
				   //shader += "sat ft4, ft4\n";
				   shader += "mul ft4, ft4, fc3.x\n";
			/*21*/ shader += "mul ft1, fc4, ft4\n";							//lightColor * NdotL
			/*24*/ shader += "mov oc, ft1\n";								//Output color
			
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