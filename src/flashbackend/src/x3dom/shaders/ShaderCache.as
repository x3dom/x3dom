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
			this._cache = new Array();
		}
		
		/**
		 * Returns one of the default shader programs
		 */
		public function getShader(shaderIdentifier:String) : Program3D
		{
			//Check if shader is in cache
			if( this._cache[shaderIdentifier] == undefined ) 
			{
				//Choose shader based on identifier
				if(shaderIdentifier == ShaderIdentifier.PICKING) {
					this._cache[shaderIdentifier] = new PickingShader().program3D;	
				} else if(shaderIdentifier == ShaderIdentifier.PICKING_COLOR) {
					//_cache[shaderIdentifier] = new PickingColorShader(_context3D).program3D;
				} else if(shaderIdentifier == ShaderIdentifier.PICKING_TEXCOORD) {
					//_cache[shaderIdentifier] = new PickingTexCoordShader(_context3D).program3D;
				} else if(shaderIdentifier == ShaderIdentifier.BACKGROUNDTEXTURE) {
					this._cache[shaderIdentifier] = new BackgroundTextureShader().program3D;
				} else if(shaderIdentifier == ShaderIdentifier.BACKGROUNDSKYTEXTURE) {
					this._cache[shaderIdentifier] = new BackgroundSkyTextureShader().program3D;
				} else if(shaderIdentifier == ShaderIdentifier.BACKGROUNDCUBETEXTURE) {
					this._cache[shaderIdentifier] = new BackgroundCubeTextureShader().program3D;
				} else if(shaderIdentifier == ShaderIdentifier.SHADOW) {
					//_cache[shaderIdentifier] = new ShadowShader(_context3D).program3D;
				} else if(shaderIdentifier == ShaderIdentifier.DEPTH) {
					this._cache[shaderIdentifier] = new DepthShader().program3D;
				} else if(shaderIdentifier == ShaderIdentifier.NORMAL) {
					this._cache[shaderIdentifier] = new NormalShader().program3D;
				}
			}
			
			//Return Program3D from cache
			return this._cache[shaderIdentifier];
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
			if( this._cache[shaderIdentifier] == undefined ) 
			{
				this._cache[shaderIdentifier] = new DynamicShader(shape, lights).program3D;
			}
			
			//Return Program3D from cache
			return this._cache[shaderIdentifier];
		}
	}
}