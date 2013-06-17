package x3dom.shaders
{
	import x3dom.*;
	
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	public class PointLightDiffShader
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
		public function PointLightDiffShader()
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
			//FC0 [0.01, 128.0, 2.0, _scene.zFar]
			//FC1 [1.0, 1.0, 1.0, 1.0]
			//FC2 [1.0, 255.0, 65025.0, 16581375.0]
			//FC3 [lights[i].intensity, 0.0, 0.0, 0.0]
			//FC4 [lights[i].color]
			
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
					
			shader += "dp3 ft4, ft2.xyz, ft3.xyz\n";				//NdotL
			
			shader += "mul ft1, ft4, fc3.x\n";						//intensity * NdotL
			shader += "mul ft1, fc4, ft1.x\n";						//LightColor * intensity * NdotL
			
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