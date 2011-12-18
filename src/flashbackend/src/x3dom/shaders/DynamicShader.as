package x3dom.shaders
{
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;
	
	import x3dom.*;
	import x3dom.texturing.CubeMapTexture;
	
	public class DynamicShader
	{
		/**
		 * Holds our 3D context
		 */
		private var _context3D:Context3D;
		
		/**
		 * Program3D for the DynamicShader
		 */
		private var _program3D:Program3D;
		
		/**
		 * Generate the final Program3D for the DynamicShader
		 */
		public function DynamicShader(shape:Shape, lights:Array)
		{
			//Get 3D Context
			this._context3D = FlashBackend.getContext();
			
			//Generate Program3D 
			this._program3D = this._context3D.createProgram();
			
			//Generate vertex shader
			var vertexShader:AGALMiniAssembler = generateVertexShader(shape, lights);
			
			//Generate fragment shader
			var fragmentShader:AGALMiniAssembler = generateFragmentShader(shape, lights);
			
			//Upload shaders to Program3D
			this._program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
		}
		
		/**
		 * Generate the vertex shader
		 */
		private function generateVertexShader(shape:Shape, lights:Array) : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader							
			shader += "m44 op, va0, vc0\n";
			
			if( lights.length && shape.normalBuffer) {
				shader += "dp3 vt0.x, va0, vc4\n";
				shader += "dp3 vt0.y, va0, vc5\n";
				shader += "dp3 vt0.z, va0, vc6\n";
				
				shader += "sub v3, vc8, -vt0.xyz\n";
				//shader += "mov v3, -vt0\n";
				
				shader += "dp3 vt1.x, va2, vc4\n";
				shader += "dp3 vt1.y, va2, vc5\n";
				shader += "dp3 vt1.z, va2, vc6\n";
				shader += "mov v0, vt1.xyz\n";
				
				shader += "mov v4, va2\n";
			} 
			
			if( shape.colorBuffer )
				shader += "mov v1, va3\n";		 	//color -> Fragment(v1)
			
			if( shape.texture ) {
				if( shape.sphereMapping )
				{
					//fragTexcoord = 0.5 + fragNormal.xy / 2.0;";
					shader += "mov vt2, va1\n";
					shader += "div vt2, vt1.xyz, vc9.y\n";
					shader += "add vt2, vt2.xyz, vc9.x\n";
					shader += "mov v2, vt2\n";
				} else {
					shader += "mov v2, va1\n";		 	//TexCoord -> Fragment(v0)
				}
			}
			
			//Generate AGALMiniAssembler from generated Shader
			var vertexShader:AGALMiniAssembler = new AGALMiniAssembler();
			vertexShader.assemble( Context3DProgramType.VERTEX, shader );
			
			//Return AGALMiniAssembler
			return vertexShader;
		}
		
		/**
		 * Generate the fragment shader
		 */
		private function generateFragmentShader(shape:Shape, lights:Array) : AGALMiniAssembler
		{
			//Init shader string
			var shader:String = "";
			
			//Build shader
			if( shape.texture ) {
				if(shape.texture is CubeMapTexture) {
					shader += "nrm ft1.xyz, v0\n";							//Normalize Normal(ft2)
					shader += "nrm ft7.xyz, v3\n";
					
					shader += "dp3 ft0.w, ft7.xyz, ft1.xyz\n";
					shader += "add ft0.w, ft0.w, ft0.w\n";
					shader += "mul ft0.xyz, ft1.xyz, ft0.w\n";
					shader += "sub ft0.xyz, ft7.xyz, ft0.xyz\n";
					shader += "neg ft0.xyz, ft0.xyz\n";
					
					shader += "m33 ft0.xyz, ft0, fc6\n";
					
					shader += "tex ft0, ft0, fs0 <3d, cube, linear> \n";	//Sample Texture(ft0)
				} else {
					shader += "mov ft6, v2 \n";
					shader += "sub ft6.y, fc5.z, ft6.y \n";					//Flip V-Coord
					shader += "tex ft0, ft6, fs0 <2d, wrap, linear> \n";	//Sample Texture(ft0)
				}
			}
			
			if( lights.length > 0 && !shape.colorBuffer) {
				shader += "mov ft1, fc0\n";
				shader += "nrm ft1.xyz, ft1\n";							//Normalize LightDir(ft1)
				shader += "nrm ft2.xyz, v0 \n";							//Normalize Normal(ft2)
				
				if(!shape.solid) {
					shader += "dp4 ft6.x, ft2.xyz, v3.xyz\n";				//dot(normal, eye) (ft6)
					shader += "slt ft6.x, ft6.x, fc5.x\n";					//(ft6) < 0
					shader += "sub ft6.x, fc5.y, ft6.x\n";					//0.5 - 0|1
					shader += "mul ft6.x, ft6.x, fc5.w\n";					//-0.5|0.5 * 2
					shader += "mul ft2.xyz, ft2.xyz, ft6.xxx\n";			//normal * 1|-1
				}
				
				shader += "add ft4, ft1.xyz, v3\n";						//L+V
				shader += "nrm ft4.xyz, ft4\n";							//Normalize(L+V)
				shader += "dp3 ft3, ft2.xyz, ft1.xyz\n";				//NdotL
				shader += "dp3 ft5, ft2.xyz, ft4\n";					//NdotH
				shader += "sat ft3, ft3\n";								//saturate(NdotL)
				shader += "sat ft5, ft5\n";								//saturate(NdotH)
				shader += "pow ft5, ft5, fc2.w\n";						//pow(NdotH, shininess)
				shader += "mul ft5, ft3, ft5\n";						//NdotL * pow(NdotH, shininess);
				if( shape.texture && !shape.texture.blending) {
					shader += "mul ft3, ft3, ft0\n";
				} else {
					if( shape.colorBuffer ) {
						shader += "mul ft3, ft3, v1.xyz\n";
					} else {
						shader += "mul ft3, ft3, fc1\n";
					}
				}
				shader += "mul ft5, ft5, fc2.xyz\n";
				shader += "add ft3, ft3, ft5\n";
				
				if( shape.texture && shape.texture.blending) {
					if(shape.texture is CubeMapTexture) {
						shader += "sub ft6, ft0, ft3)\n";				//lerp(diffColor, refColor, ratio)
						shader += "mul ft6, ft6, fc10\n";
						shader += "add ft3, ft6, ft3\n";
					} else {
						shader += "mul ft3, ft3, ft0\n";				//rgb *= texColor(ft3)
					}
				}
				
				if( shape.texture )
				{
					shader += "mul ft3.w, fc1.w, ft0.w\n";
				} else {
					shader += "mov ft3.w, fc1.w\n";
				}
				
				shader += "sat ft3, ft3\n";								//saturate(NdotL)
				shader += "add ft3, fc3, ft3\n";						//rgb += emissiveColor
				shader += "sub ft4, ft3, fc4\n";
				shader += "kil ft4.wwww\n";
				shader += "mov oc, ft3 \n";							//Output Color
			} else {
				if( shape.colorBuffer ) {
					shader += "mov ft1, v1.xyz\n";
				} else if( shape.texture && !shape.texture.blending ) {
					shader += "mov ft1, ft0\n";
				} else {
					shader += "mov ft1, fc1\n";
				}
				
				if( shape.texture && shape.texture.blending ) {
					shader += "mul ft1, ft1, ft0\n";
				}
				
				shader += "mov ft1.w, fc1.w\n";
				shader += "sat ft1, ft1\n";								//saturate(NdotL)
				shader += "add ft1, fc3, ft1\n";						//rgb += emissiveColor
				shader += "sub ft2, ft1, fc4\n";
				shader += "kil ft2.wwww\n";
				shader += "mov oc, ft1 \n";							//Output Color
			}
			
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