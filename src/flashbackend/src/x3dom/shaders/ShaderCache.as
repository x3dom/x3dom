/**
 * x3dom actionscript library 0.1
 * http://x3dom.org/
 *
 * Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
 * Dual licensed under the MIT and GPL licenses.
 */

package x3dom.shaders
{
	import flash.display3D.Context3D;
	import flash.display3D.Program3D;
	
	import x3dom.Debug;
	import x3dom.Shape;
	import x3dom.texturing.CubeMapTexture;
	
	public class ShaderCache
	{
		/**
		 * Holds our 3D context
		 */
		private var _context3D:Context3D;
		
		/**
		 * Holds all generated shaders programs
		 */
		private var _cache:Array;
		
		/**
		 * Create a new ShaderCache Instance 
		 */
		public function ShaderCache()
		{	
			//Init shader cache
			_cache = new Array();
		}
		
		/**
		 * Returns one of the default shader programs
		 */
		public function getShader(shaderIdentifier:String) : Program3D
		{
			//Check if shader is in cache
			if( _cache[shaderIdentifier] == undefined ) 
			{
				//Choose shader based on identifier
				switch(shaderIdentifier) 
				{
					case ShaderIdentifier.PICKING:
						_cache[shaderIdentifier] = new PickingShader().program3D;
						break;
					
					case ShaderIdentifier.PICKING_COLOR:
						//_cache[shaderIdentifier] = new PickingColorShader(_context3D).program3D;
						break;
					
					case ShaderIdentifier.PICKING_TEXCOORD:
						//_cache[shaderIdentifier] = new PickingTexCoordShader(_context3D).program3D;
						break;
					
					case ShaderIdentifier.BACKGROUNDTEXTURE:
						_cache[shaderIdentifier] = new BackgroundTextureShader().program3D;
						break;
					
					case ShaderIdentifier.BACKGROUNDSKYTEXTURE:
						_cache[shaderIdentifier] = new BackgroundSkyTextureShader().program3D;
						break;
					
					case ShaderIdentifier.BACKGROUNDCUBETEXTURE:
						_cache[shaderIdentifier] = new BackgroundCubeTextureShader().program3D;
						break;
					
					case ShaderIdentifier.SHADOW:
						//_cache[shaderIdentifier] = new ShadowShader(_context3D).program3D;
						break;
					
					case ShaderIdentifier.DEPTH:
						_cache[shaderIdentifier] = new DepthShader().program3D;
						break;
					
					default:
						break;
				}
			}
			
			//Return Program3D from cache
			return _cache[shaderIdentifier];
		}
		
		/**
		 * Returns a dynamic generated shader program
		 */
		public function getDynamicShader(shape:Shape, lights:Array) : Program3D
		{
			//Build Shader identifier [light(false|true) / texture(false|true) / blend(false|true) / cubeMap(false|true) / color(false|true) / sphereMapping(false|true)  / solid(false|true)]
			var shaderIdentifier:String = String(lights.length>0) + " / " + 
										  String(Boolean(shape.texture)) + " / " + 
										  String(shape.texture && shape.texture.blending) + " / " + 
										  String(shape.texture && shape.texture is CubeMapTexture) + " / " +
										  String(Boolean(shape.colorBuffer)) + " / " + 
										  String(shape.sphereMapping) + " / " +
										  String(shape.solid);

			//Check if shader is in cache
			if( _cache[shaderIdentifier] == undefined ) 
			{
				_cache[shaderIdentifier] = new DynamicShader(shape, lights).program3D;
			}
			
			//Return Program3D from cache
			return _cache[shaderIdentifier];
		}
	}
}