package x3dom
{
	import com.adobe.utils.AGALMiniAssembler;
	
	import flash.display3D.Context3D;
	import flash.display3D.Context3DProgramType;
	import flash.display3D.Program3D;

	public class ShaderGenerator
	{
		private var _context3D:Context3D;
		private var _shaderCache:Array = new Array();
		private var _program3D:Program3D;
		
		/**
		 * 
		 */
		public function ShaderGenerator(context3D:Context3D)
		{
			_context3D = context3D;
		}
		
		/**
		 * 
		 */
		public function generate(mesh:Mesh, lights:Array) : Program3D
		{
			//Build Shader identifier [light(false|true) / texture(0|1|2) / color(false|true) / sphereMapping(false|true)]
			var identifier:String = String(lights.length>0) + " / " + String(mesh.hasTexture()) + " / " + String(mesh.hasColor() + " / " + String(mesh.sphereMapping) );
			
			//Check if shader is in cache
			if( _shaderCache[identifier] == undefined ) {
				
				var vertexShader:AGALMiniAssembler = generateVertexShader(mesh, lights);
				var fragmentShader:AGALMiniAssembler = generateFragmentShader(mesh, lights);
				
				//Generate Program3D 
				var program3D:Program3D = _context3D.createProgram();
				
				//Upload shader to Program3D
				program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
				
				//Save Program3D in shaderCache
				_shaderCache[identifier] = program3D;
			}
			
			//Return Program3D
			return _shaderCache[identifier];
		}
		
		/**
		 * 
		 */
		private function generateVertexShader(mesh:Mesh, lights:Array) : AGALMiniAssembler
		{
			var shader:String = "";
			shader += "m44 op, va0, vc0\n";
			
			if( lights.length > 0 && !mesh.hasColor()) {
				shader += "dp3 vt0.x, va0, vc4\n";
				shader += "dp3 vt0.y, va0, vc5\n";
				shader += "dp3 vt0.z, va0, vc6\n";
				
				shader += "sub v3, vc8, -vt0.xyz\n"; 
				
				shader += "dp3 vt1.x, va2, vc4\n";
				shader += "dp3 vt1.y, va2, vc5\n";
				shader += "dp3 vt1.z, va2, vc6\n";
				shader += "mov v0, vt1.xyz\n";
			} 
			
			if( mesh.hasColor() )
				shader += "mov v1, va3\n";		 	//color -> Fragment(v1)
			
			if( mesh.hasTexture() ) {
				if( mesh.sphereMapping )
				{
					shader += "mov vt2, va1\n";
					shader += "div vt2, vt2, vc9.y\n";
					shader += "add vt2, vt2, vc9.x\n";
					shader += "mov v2, vt2\n";
				} else {
					shader += "mov v2, va1\n";		 	//TexCoord -> Fragment(v0)
				}
			}
			
			//Generate AGALMiniAssembler from generated Shader
			var vertexShaderAssembler:AGALMiniAssembler = new AGALMiniAssembler();
			vertexShaderAssembler.assemble( Context3DProgramType.VERTEX, shader );
			
			//Return AGALMiniAssembler
			return vertexShaderAssembler;
		}
		
		private function generateFragmentShader(mesh:Mesh, lights:Array) : AGALMiniAssembler
		{
			var shader:String = "";
			if( mesh.hasTexture() ) {
				shader += "mov ft6, v2 \n";
				shader += "sub ft6.y, fc3.w, ft6.y \n";					//Flip V-Coord
				shader += "tex ft0, ft6, fs0 <2d, wrap, linear> \n";	//Sample Texture(ft0)
			}
			
			if( lights.length > 0 && !mesh.hasColor()) {
				shader += "nrm ft1.xyz, fc0\n";							//Normalize LightDir(ft1)
				shader += "nrm ft2.xyz, v0 \n";							//Normalize Normal(ft2)
				shader += "add ft4, ft1.xyz, v3\n";						//L+V
				shader += "nrm ft4.xyz, ft4\n";							//Normalize(L+V)
				shader += "dp3 ft3, ft2.xyz, ft1.xyz\n";					//NdotL
				shader += "dp3 ft5, ft2.xyz, ft4\n";						//NdotH
				shader += "sat ft3, ft3\n";								//saturate(NdotL)
				shader += "sat ft5, ft5\n";								//saturate(NdotH)
				shader += "pow ft5, ft5, fc2.w\n";						//pow(NdotH, shininess)
				shader += "mul ft5, ft3, ft5\n";							//NdotL * pow(NdotH, shininess);
				if( mesh.hasTexture() == 1 ) {
					shader += "mul ft3, ft3, ft0\n";
				} else {
					if( mesh.hasColor() ) {
						shader += "mul ft3, ft3, v1.xyz\n";
					} else {
						shader += "mul ft3, ft3, fc1\n";
					}
				}
				shader += "mul ft5, ft5, fc2.xyz\n";
				shader += "add ft3, ft3, ft5\n";
				
				if( mesh.hasTexture() == 2 ) {
					shader += "mul ft3, ft3, ft0\n";				//rgb *= texColor(ft3)
				}
					
				if( mesh.hasTexture() )
				{
					shader += "mul ft3.w, fc1.w, ft0.w\n";
				} else {
					shader += "mov ft3.w, fc1.w\n";
				}

				shader += "sat ft3, ft3\n";								//saturate(NdotL)
				shader += "sub ft4, ft3, fc4\n";
				shader += "kil ft4\n";
				shader += "mov oc, ft3 \n";							//Output Color
			} else {
				if( mesh.hasColor() ) {
					shader += "mov ft1, v1.xyz\n";
				} else if( mesh.hasTexture() == 1 ) {
					shader += "mov ft1, ft0\n";
				} else {
					shader += "mov ft1, fc1\n";
				}
				
				if( mesh.hasTexture() == 2 ) {
					shader += "mul ft1, ft1, ft0\n";
				}
				
				shader += "mov ft1.w, fc1.w\n";
				shader += "sat ft1, ft1\n";								//saturate(NdotL)
				shader += "sub ft2, ft1, fc4\n";
				shader += "kil ft2\n";
				shader += "mov oc, ft1 \n";							//Output Color
			}
			
			
			var fragmentShaderAssembler:AGALMiniAssembler = new AGALMiniAssembler();
			fragmentShaderAssembler.assemble( Context3DProgramType.FRAGMENT, shader );
			
			return fragmentShaderAssembler;
		}
		
		public function getBackgroundShader() : Program3D
		{
			if( _shaderCache['BackgroundShader'] == undefined ) {
				
				
				//Generate Program3D 
				var program3D:Program3D = _context3D.createProgram();
				
				var vertexShader:AGALMiniAssembler = new AGALMiniAssembler();
				vertexShader.assemble( Context3DProgramType.VERTEX,				
					"mov op, va0\n" +					//Position						
					"mov v0, va1\n"						//TexCoord -> Fragment(v0)		
				);
				
				var fragmentShader:AGALMiniAssembler = new AGALMiniAssembler();
				fragmentShader.assemble( Context3DProgramType.FRAGMENT,				
					"tex ft0, v0, fs0 <2d, clamp, linear> \n" +	//Sample Texture(ft0)
					"mov oc, ft0\n" 
				);		
				
				//Upload shader to Program3D
				program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
				
				//Save Program3D in shaderCache
				_shaderCache['BackgroundShader'] = program3D;
			}
			
			//Return Program3D
			return _shaderCache['BackgroundShader'];
		}
		
		public function getPickingShader() : Program3D
		{
			if( _shaderCache['PickingShader'] == undefined ) {
				
				//Generate Program3D 
				var program3D:Program3D = _context3D.createProgram();
				
				var vertexShader:AGALMiniAssembler = new AGALMiniAssembler();
				vertexShader.assemble( Context3DProgramType.VERTEX,				
					"m44 op, va0, vc0\n" +				//Position*MVP-Matrix
					//"m43 vt3, va0, vc4\n" +				//Position*M-Matrix
					
					"dp4 vt3.x, va0, vc4\n" +				//Position*M-Matrix
					"dp4 vt3.y, va0, vc5\n" +				//Position*M-Matrix
					"dp4 vt3.z, va0, vc6\n" +				//Position*M-Matrix
					
								
					"mov vt1, vc8\n" +
					"mov vt2, vc9\n" +
					"sub vt0, vt2, vt1\n" +				//Dia = max - min
					"sub vt3, vt3.xyz0, vt1.xyz0\n" +
					"div vt4.x, vt3.x, vt0.x\n" +
					"div vt4.y, vt3.y, vt0.y\n" +
					"div vt4.z, vt3.z, vt0.z\n" +
					"mov v0, vt4.xyz0\n"
				);
				
				var fragmentShader:AGALMiniAssembler = new AGALMiniAssembler();
				fragmentShader.assemble( Context3DProgramType.FRAGMENT,
					"mov ft0, v0\n" +
					"mov ft0.w, fc0.x\n" +
					"mov oc, ft0\n" 
				);		
				
				//Upload shader to Program3D
				program3D.upload( vertexShader.agalcode, fragmentShader.agalcode);
				
				//Save Program3D in shaderCache
				_shaderCache['PickingShader'] = program3D;
			}
			
			//Return Program3D
			return _shaderCache['PickingShader'];
		}
	}
}