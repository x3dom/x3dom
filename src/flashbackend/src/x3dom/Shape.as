/**
 * x3dom actionscript library 0.1
 * http://x3dom.org/
 *
 * Copyright (c) 2011 Johannes Behr, Yvonne Jung, Timo Sturm
 * Dual licensed under the MIT and GPL licenses.
 */

package x3dom
{
	import flash.display3D.Context3D;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Vector3D;
	
	import x3dom.texturing.*;

	public class Shape extends EventDispatcher
	{	
		/**
		 * Holds our 3D context
		 */
		private var _context3D:Context3D;
		
		public var _ready:Boolean = true;
		
		/**
		 * Specifiying the Material used by geometry.
		 * @default Default Material
		 */
		private var _material:Material = new Material();
		
		/**
		 * Specifiying the Texture used by geometry.
		 * @default null
		 */
		private var _texture:BaseTexture = null;
		
		/**
		 * Specifiying the geometries BoundingBox.
		 * @default Default BoundingBox
		 */
		protected var _boundingBox:BoundingBox = new BoundingBox();
		
		/**
		 * Specifiying if backface culling is ON or OFF.
		 * @default true
		 */
		private var _solid:Boolean = true;
		
		/**
		 * Specifiying if texture coordinates in SPHERE-Mode.
		 * @default false
		 */
		private var _sphereMapping:Boolean = false;
		
		/**
		 * Specifiying the number of color components. 3 means RGB and 4 means RGBA.
		 * @default 3
		 */
		private var _numColorComponents:uint = 3;
		
		/**
		 * Specifiying the colors used by the geometry.
		 * @default null 
		 */
		protected var _numTriangles:Array = new Array();
		
		/**
		 * Hold the colors for rendering.
		 * @default null
		 */
		private var _colorBuffer:Array = null;
		
		/**
		 * Hold the indices for rendering.
		 * @default null
		 */
		private var _indexBuffer:Array = null;
		
		/**
		 * Hold the normals for rendering.
		 * @default null
		 */
		private var _normalBuffer:Array = null;
		
		/**
		 * Hold the texture coordinates for rendering.
		 * @default null
		 */
		private var _texCoordBuffer:Array = null;
		
		/**
		 * Hold the vertices for rendering.
		 * @default null
		 */
		private var _vertexBuffer:Array = null;
		
		/**
		 * Create a new Shape Instance
		 */
		public function Shape()
		{
			_context3D = FlashBackend.getContext();
		}
		
		/**
		 * Caculate the geometries BoundingBox 
		 * @default null
		 */
		public function calculateBB(vertices:Vector.<Number>) : void
		{
			//Init min/max values
			var min:Vector3D = new Vector3D( 999999.0,  999999.0,  999999.0);
			var max:Vector3D = new Vector3D(-999999.0, -999999.0, -999999.0);
			
			//Iterate all vertices and find absolute min/max values
			for(var i:uint=0; i<vertices.length; i+=3)
			{
				if (min.x > vertices[i+0]) { min.x = vertices[i+0]; }
				if (min.y > vertices[i+1]) { min.y = vertices[i+1]; }
				if (min.z > vertices[i+2]) { min.z = vertices[i+2]; }
				
				if (max.x < vertices[i+0]) { max.x = vertices[i+0]; }
				if (max.y < vertices[i+1]) { max.y = vertices[i+1]; }
				if (max.z < vertices[i+2]) { max.z = vertices[i+2]; }
			}
			
			//Calculate center point
			var center:Vector3D = min.add(max);
			center.scaleBy(0.5);
			
			//Set BoundingBox values
			this._boundingBox.min = min;
			this._boundingBox.max = max;
			this._boundingBox.center = center;
		}
		
		/**
		 * Specifiying if texture coordinates in SPHERE-Mode.
		 */
		public function set sphereMapping(sphereMapping:Boolean) : void
		{
			this._sphereMapping = sphereMapping;
		}
		
		/**
		 * @private
		 */
		public function get sphereMapping() : Boolean
		{
			return this._sphereMapping;
		}
		
		/**
		 * Specifiying the geometries BoundingBox.
		 */
		public function set boundingBox(boundingBox:BoundingBox) : void
		{
			this._boundingBox = boundingBox;
		}
		
		/**
		 * @private
		 */
		public function get boundingBox() : BoundingBox
		{
			return this._boundingBox;
		}
		
		/**
		 * Specifiying if backface culling is ON or OFF
		 */
		public function set solid(solid:Boolean) : void
		{
			this._solid = solid;
		}
		
		/**
		 * @private
		 */
		public function get solid() : Boolean
		{
			return this._solid;
		}
		
		/**
		 * Specifiying the Material used by geometry.
		 */
		public function set material(material:Material) : void
		{
			this._material = material;
		}
		
		/**
		 * @private
		 */
		public function get material() : Material
		{
			return this._material;
		}
		
		/**
		 * @private
		 */
		public function get texture() : BaseTexture
		{
			return this._texture;
		}
		
		/**
		 * Specifiying the Material used by geometry.
		 */
		public function set texture(texture:BaseTexture) : void
		{
			this._texture = texture;
		}
		
		/**
		 * Number of geometries triangles
		 */
		public function get numTriangles() : Array
		{
			return this._numTriangles;
		}
		
		/**
		 * Color buffer for rendring
		 */
		public function get colorBuffer() : Array
		{
			return this._colorBuffer;
		}
		
		/**
		 * Index buffer for rendring
		 */
		public function get indexBuffer() : Array
		{
			return this._indexBuffer;
		}
		
		/**
		 * Normal buffer for rendring
		 */
		public function get normalBuffer() : Array
		{
			return this._normalBuffer;
		}
		
		/**
		 * Texture coordinate buffer for rendring
		 */
		public function get texCoordBuffer() : Array
		{
			return this._texCoordBuffer;
		}
		
		/**
		 * Vertex buffer for rendring
		 */
		public function get vertexBuffer() : Array
		{
			return this._vertexBuffer;
		}
		
		public function get numColorComponents() : uint
		{
			return this._numColorComponents;
		}
		
		/**
		 * Fill the colors-Array and create the colors-Buffer for rendering
		 * @param idx Index of the Array where colors are saved
		 * @param colors Vector with the colors 
		 * @param numColorComponents Number of color components
		 */
		public function setColors(idx:uint, colors:Vector.<Number>, numComponents:uint) : void 
		{
			//Init color Buffer if not done yet
			if( !this._colorBuffer) this._colorBuffer = new Array();
			
			//Set number of color components
			this._numColorComponents = numComponents;
			
			//Create color buffer
			this._colorBuffer[ idx ] = this._context3D.createVertexBuffer( colors.length/numComponents, numComponents );
			
			//Set color buffer
			this._colorBuffer[ idx ].uploadFromVector( colors, 0, colors.length/numComponents );
		}
		
		/**
		 * Fill the indices-Array and create the indices-Buffer for rendering
		 * @param idx Index of the Array where indices are saved
		 * @param colors Vector with the indices 
		 */
		public function setIndices(idx:uint, indices:Vector.<uint>) : void 
		{
			this._numTriangles[ idx ] = indices.length/3;
			
			//Init indices Buffer if not done yet
			if( !this._indexBuffer) this._indexBuffer = new Array();
			
			//Create indices buffer
			this._indexBuffer[ idx ] = this._context3D.createIndexBuffer( indices.length );
			
			//Set indices buffer
			this._indexBuffer[ idx ].uploadFromVector( indices, 0, indices.length );
		}
		
		/**
		 * Fill the normals-Array and create the normals-Buffer for rendering
		 * @param idx Index of the Array where normals are saved
		 * @param normals Vector with the normals 
		 */
		public function setNormals(idx:uint, normals:Vector.<Number>) : void 
		{		
			//Init normals Buffer if not done yet
			if( !this._normalBuffer) this._normalBuffer = new Array();
			
			//Create normals buffer
			this._normalBuffer[ idx ] = this._context3D.createVertexBuffer( normals.length/3, 3 );
			
			//Set normals buffer
			this._normalBuffer[ idx ].uploadFromVector( normals, 0, normals.length/3 );
		}
		
		/**
		 * Fill the textureCoordinates-Array and create the textureCoordinates-Buffer for rendering
		 * @param idx Index of the Array where textureCoordinates are saved
		 * @param texCoords Vector with the textureCoordinates 
		 */
		public function setTexCoords(idx:uint, texCoords:Vector.<Number>) : void 
		{		
			//Init texture coordinate Buffer if not done yet
			if( !this._texCoordBuffer) this._texCoordBuffer = new Array();
			
			//Create texture coordinate buffer
			this._texCoordBuffer[ idx ] = this._context3D.createVertexBuffer( texCoords.length/2, 2 );
			
			//Set texture coordinate buffer
			this._texCoordBuffer[ idx ].uploadFromVector( texCoords, 0, texCoords.length/2 );
		}
		
		/**
		 * Fill the vertices-Array and create the vertices-Buffer for rendering
		 * @param idx Index of the Array where vertices are saved
		 * @param vertices Vector with the vertices 
		 */
		public function setVertices(idx:uint, vertices:Vector.<Number>) : void 
		{		
			//Init texture coordinate Buffer if not done yet
			if( !this._vertexBuffer) this._vertexBuffer = new Array();
			
			//Create vertices buffer
			this._vertexBuffer[ idx ] = this._context3D.createVertexBuffer( vertices.length/3, 3 );
			
			//Set vertices buffer
			this._vertexBuffer[ idx ].uploadFromVector( vertices, 0, vertices.length/3 );
			
			//Calculate the BoundingBox
			this.calculateBB(vertices);
		}
	}
}