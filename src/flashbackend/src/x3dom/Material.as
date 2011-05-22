/**
* x3dom actionscript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
* Dual licensed under the MIT and GPL licenses.
*/

package x3dom {
	
	/**
	* The Material-Class represent the X3D Material-Node
	*/
	public class Material {
		
		/**
		 * [0..1] how much ambient omnidirectional light is reflected from all light sources.
		 * @default 0.2 
		 */
		private var _ambientIntensity:Number;
		
		/**
		 * [RGB color] how much direct, angle-dependent light is reflected from all light sources.
		 * @default RGB(0.2, 0.2, 0.2)
		 */
		private var _diffuseColor:Vector.<Number>;
		
		/**
		 * [RGB color] how much glowing light is emitted from this object.
		 * @default RGB(0.0, 0.0, 0.0)
		 */
		private var _emissiveColor:Vector.<Number>;
		
		/**
		 * [0..1] low values provide soft specular glows, high values provide sharper, smaller highlights.
		 * @default 0.2
		 */
		private var _shininess:Number;
		
		/**
		 * [RGB color] specular highlights are brightness reflections
		 * @default RGB(0.0, 0.0, 0.0)
		 */
		private var _specularColor:Vector.<Number>;
		
		/**
		 * [0..1] how 'clear' an object is: 1.0 is completely transparent, 0.0 is completely opaque.
		 * @default 0.0
		 */
		private var _transparency:Number;

		/**
		* Create a new Material instance
		* @param ambientIntensity [0..1] how much ambient omnidirectional light is reflected from all light sources.
		* @param diffuseColor [RGB color] how much direct, angle-dependent light is reflected from all light sources.
		*/
		public function Material(ambientIntensity:Number = 0.2, 
								 diffuseColor:Vector.<Number> = null,
								 emissiveColor:Vector.<Number> = null,
								 shininess:Number = 0.2,
								 specularColor:Vector.<Number> = null,
								 transparency:Number = 0.0)
		{
			_ambientIntensity	= ambientIntensity;
			_diffuseColor		= (diffuseColor != null) ? diffuseColor : Vector.<Number>( [ 0.2, 0.2, 0.2 ] );
			_emissiveColor		= (emissiveColor != null) ? emissiveColor : Vector.<Number>( [ 0.0, 0.0, 0.0 ] );
			_shininess			= shininess;
			_specularColor		= (specularColor != null) ? specularColor : Vector.<Number>( [ 0.0, 0.0, 0.0 ] );
			_transparency		= transparency;
		}
		
		/**
		* [0..1] how much ambient omnidirectional light is reflected from all light sources. 
		*/
		public function get ambientIntensity() : Number 
		{
			return _ambientIntensity;
		}
		
		/**
		* @private 
		*/
		public function set ambientIntensity(value:Number) : void 
		{
			_ambientIntensity = value;
		}
		
		/**
		* [RGB color] how much direct, angle-dependent light is reflected from all light sources.
		*/
		public function get diffuseColor() : Vector.<Number> 
		{
			return _diffuseColor;
		}
		
		/**
		* @private
		*/
		public function set diffuseColor(value:Vector.<Number>) : void 
		{
			_diffuseColor = value;
		}
		
		/**
		* [RGB color] how much glowing light is emitted from this object.
		*/
		public function get emissiveColor() : Vector.<Number> 
		{
			return _emissiveColor;
		}
		
		/**
		* @private
		*/
		public function set emissiveColor(value:Vector.<Number>) : void 
		{
			_emissiveColor = value;
		}
		
		/**
		* [0..1] low values provide soft specular glows, high values provide sharper, smaller highlights. 
		*/
		public function get shininess() : Number 
		{
			return _shininess;
		}
		
		/**
		* @private
		*/
		public function set shininess(value:Number) : void 
		{
			_shininess = value;
		}
		
		/**
		* [RGB color] specular highlights are brightness reflections
		*/
		public function get specularColor() : Vector.<Number> 
		{
			return _specularColor;
		}
		
		/**
		* @private
		*/
		public function set specularColor(value:Vector.<Number>) : void 
		{
			_specularColor = value;
		}
		
		/**
		* [0..1] how 'clear' an object is: 1.0 is completely transparent, 0.0 is completely opaque.
		*/
		public function get transparency() : Number 
		{
			return _transparency;
		}
		
		/**
		* @private
		*/
		public function set transparency(value:Number) : void 
		{
			_transparency = value;
		}
		
		/**
		* Return the Material-Object as String
		*/
		public function toString() : String 
		{
			return 	"Material [ " +
					"ambientIntensity: " + _ambientIntensity.toString() + " | " +
					"diffuseColor: " + _diffuseColor.toString() + " | " +
					"emissiveColor: " + _emissiveColor.toString() + " | " +
					"shininess: " + _shininess.toString() + " | " +
					"specularColor: " + _specularColor.toString() + " | " +
					"transparency: " + _transparency.toString() + 
					" ]";
		}

	}
	
}
