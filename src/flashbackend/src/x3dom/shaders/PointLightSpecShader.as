package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class PointLightSpecShader
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
		public function PointLightSpecShader()
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
			shader += "mov v0, va1\n";			//TexCoord -> Fragment(v0)
			
			shader += "m44 v1, va0, vc4\n";		//VS Position (v1)
			
			shader += "mov vt0, vc8\n";
			shader += "m44 v2, vt0, vc0\n";		//LightPos (v2)
			
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
			shader += "tex ft1, v0, fs0 <2d, clamp, nearest>\n";	//Sample Depth Texture		-> ft1
			
			shader += "mov ft2, fc1\n";
			shader += "div ft2, ft2, fc2\n";						//1/1.0, 1/255.0, 1/65025.0, 1/16581375.0
			shader += "dp4 ft1.x, ft1, ft2\n"; 						//dot(rgba,ft2) = depth -> ft1.x
			
			shader += "sub ft3.xxxx, ft1.x, fc0.x\n";				//if(depth-0.01)
			shader += "kill ft3.xxxx\n";							//kill
			
			shader += "mul ft1, ft1.x, fc0.w\n";					//depth*farClipPlane 	-> ft1.x		
			shader += "mul ft7, v1.xyz, ft1.x\n";					//PosVS * depth
			
			shader += "tex ft2, v0, fs1 <2d, clamp, nearest>\n";	//Sample Normal Texture		-> ft2
			shader += "mov ft6.x, ft2.w\n";							//Shininess -> ft6
			shader += "mul ft2.xyz, ft2.xyz, fc0.zzz\n";			//Normal * 2.0
			shader += "sub ft2.xyz, ft2.xyz, fc1.xxx\n";			//Normal - 1.0
			shader += "nrm ft2.xyz, ft2.xyz\n";						//normalize(N)
			
			shader += "sub ft3.xyz, v2.xyz, ft7.xyz\n";				//LightDir = LightPos - VSPos
			shader += "nrm ft3.xyz, ft3.xyz\n";						//normalize(LightDir)
			
			shader += "neg ft5.xyz, ft7.xyz\n";						//EyeDir = -VSPos
			shader += "nrm ft5.xyz, ft5.xyz\n";						//normalize(EyeDir)
			
			shader += "add ft1.xyz, ft3.xyz, ft5.xyz\n";			//H = L + V
			shader += "nrm ft1.xyz, ft1.xyz\n";						//normalize(H)
			
			shader += "dp3 ft4, ft2.xyz, ft3.xyz\n";				//NdotL
			shader += "dp3 ft5, ft2.xyz, ft1.xyz\n";				//NdotH
			
			shader += "mul ft3.x, ft6.x, fc0.y\n";					//shininess * 128
			shader += "pow ft2.x, ft5.x, ft3.x\n";					//pow(NdotH, shininess*128)
			shader += "mul ft1.x, ft2.x, fc3.x\n";					//intensity * pow(NdotH, shininess*128)
			shader += "mul ft1.xyz, fc4.xyz, ft1.x\n";				//LightColor * intensity * pow(NdotH, shininess*128)
			
			shader += "mov oc, ft1\n";								//Output color
			
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