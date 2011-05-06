package x3dom {
	
	import flash.display3D.*;
	import flash.display3D.textures.Texture;
	import flash.events.Event;
	import flash.geom.*;
	
	import x3dom.*;
	
	public class Mesh {
		
		private var _id:Number;
		
		private var _scene:X3DScene;
		
		private var _context3D:Context3D;
		
		private var _material:Material		= new Material();
		
		private var _texture:ImageTexture	= null;
		
		private var _modelMatrix:Matrix3D	= new Matrix3D();
		
		private var _min:Vector3D;
		private var _max:Vector3D;
		private var _center:Vector3D;
		
		private var _colors:Array			= new Array();
		private var _indices:Array			= new Array();
		private var _normals:Array			= new Array();
		private var _texCoords:Array		= new Array();
		private var _vertices:Array			= new Array();
		
		private var _colorBuffer:Array		= new Array();
		private var _indexBuffer:Array		= new Array();
		private var _normalBuffer:Array		= new Array();
		private var _texCoordBuffer:Array	= new Array();
		private var _vertexBuffer:Array		= new Array();
		public var _program3D:Program3D 	= null;
		
		public function Mesh( id:Number, scene:X3DScene, context3D:Context3D ) 
		{
			_id			= id;
			_scene		= scene;
			_context3D 	= context3D;
		}
		
		public function render() : void
		{
			//If Texture exists and it's not completly loaded -> Render later else -> Render now
			if( _texture != null && !_texture.loaded )
			{
				//Add Complete-Listener to textur
				_texture.addEventListener(Event.COMPLETE, handleTextureLoaded);
			}
			else
			{ 
				//Associate material propeties
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  1, Vector.<Number>( [ _material.diffuseColor[0], _material.diffuseColor[1], _material.diffuseColor[2],1.0-_material.transparency ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  2, Vector.<Number>( [ _material.specularColor[0], _material.specularColor[1], _material.specularColor[2], _material.shininess*128.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  3, Vector.<Number>( [ _material.emissiveColor[0], _material.emissiveColor[1], _material.emissiveColor[2], 1.0 ] ) );
				_context3D.setProgramConstantsFromVector( Context3DProgramType.FRAGMENT,  4, Vector.<Number>( [ 0.5, 0.5, 0.5, 1.0 ] ) );
				
				//Iterate array of Buffers for grater than 64k meshes
				for(var i:uint=0; i<_vertexBuffer.length; i++)
				{	
					//Associate vertices
					_context3D.setVertexBufferAt( 0, _vertexBuffer[i],  0, Context3DVertexBufferFormat.FLOAT_3 );
					
					if(!hasColor()) {
						//Associate normals
						_context3D.setVertexBufferAt( 2, _normalBuffer[i], 0, Context3DVertexBufferFormat.FLOAT_3 );
					}
					
					if(hasColor()) {
						//Associate colors
						_context3D.setVertexBufferAt( 3, _colorBuffer[i],  0, Context3DVertexBufferFormat.FLOAT_3 );
					}
					
					//Check if a texture exists
					if(_texture != null) 
					{
						//Associate a texture with a sampler stage 
						_context3D.setTextureAt(0, _texture.texture);
						
						//Associate texCoords
						_context3D.setVertexBufferAt( 1, _texCoordBuffer[i],  0, Context3DVertexBufferFormat.FLOAT_2 );
						
					}
					
					//Draw the mesh
					_context3D.drawTriangles( _indexBuffer[i], 0, _indices[i].length/3 );
					
				}
				cleanBuffers();
			}
		}
		
		private function cleanBuffers() : void
		{
			_context3D.setTextureAt(0, null);
			_context3D.setVertexBufferAt( 0, null );
			_context3D.setVertexBufferAt( 1, null );
			_context3D.setVertexBufferAt( 2, null );
			_context3D.setVertexBufferAt( 3, null );
		}
		
		/**
		 * Calcuates meshs boundingbox (min, max, center)
		 */
		private function calculateBoundingBox() :void
		{
			//Init min/max values
			_min = new Vector3D( 999999.0,  999999.0,  999999.0);
			_max = new Vector3D(-999999.0, -999999.0, -999999.0);
			
			//Iterate all vertices and find absolute min/max values
			for(var i:uint=0; i<_vertices.length; i++)
			{
				for(var j:uint=0; j<_vertices[i].length; j+=3)
				{
					if (_min.x > _vertices[i][j+0]) { _min.x = _vertices[i][j+0]; }
					if (_min.y > _vertices[i][j+1]) { _min.y = _vertices[i][j+1]; }
					if (_min.z > _vertices[i][j+2]) { _min.z = _vertices[i][j+2]; }
					
					if (_max.x < _vertices[i][j+0]) { _max.x = _vertices[i][j+0]; }
					if (_max.y < _vertices[i][j+1]) { _max.y = _vertices[i][j+1]; }
					if (_max.z < _vertices[i][j+2]) { _max.z = _vertices[i][j+2]; }
				}
			}
			
			//Calculate center point
			_center = _min.add(_max);
			_center.scaleBy(0.5);
		}
		
		private function handleTextureLoaded(e:Event) : void
		{
			//Remove Complete-Listener from textur
			_texture.removeEventListener(Event.COMPLETE, handleTextureLoaded);
			
			//Render scene again
			_scene.renderScene();
		}
		
		public function set id(id:Number) : void
		{
			_id = id;
		}
		
		public function get id() : Number
		{
			return _id;
		}
		
		public function set modelMatrix(modelMatrix:Matrix3D) : void
		{
			_modelMatrix = modelMatrix;
		}
		
		public function get modelMatrix() : Matrix3D
		{
			return _modelMatrix;
		}
		
		public function get min() : Vector3D
		{
			return _modelMatrix.transformVector(_min);
		}
		
		public function get max() : Vector3D
		{
			return _modelMatrix.transformVector(_max);
		}
		
		public function get center() : Vector3D
		{
			return _modelMatrix.transformVector(_center);
		}
		
		public function setMaterial(material:Object) : void 
		{
			_material.ambientIntensity 	= Number( material.ambientIntensity );
			_material.diffuseColor 		= Vector.<Number>( String(material.diffuseColor).split(',') );
			_material.emissiveColor 	= Vector.<Number>( String(material.emissiveColor).split(',') );
			_material.shininess 		= Number( material.shininess );
			_material.specularColor		= Vector.<Number>( String(material.specularColor).split(',') );
			_material.transparency		= Number( material.transparency );
			
		}
		
		public function setTexture(texture:Object) : void
		{
			_texture = new ImageTexture(_context3D);
			_texture.origChannelCount 	= Number( texture.origChannelCount );
			_texture.repeatS			= Boolean( texture.repeatS );
			_texture.repeatT			= Boolean( texture.repeatT );
			_texture.url				= texture.url;		
			
			_texture.load();
		}
		
		public function setColors(idx:uint, colors:Vector.<Number>) : void 
		{
			_colors[ idx ] = colors;
			_colorBuffer[ idx ] = _context3D.createVertexBuffer( colors.length/3, 3 );
			_colorBuffer[ idx ].uploadFromVector( colors, 0, colors.length/3 );
		}
		
		public function setIndices(idx:uint, indices:Vector.<uint>) : void 
		{
			_indices[ idx ] = indices;
			_indexBuffer[ idx ] = _context3D.createIndexBuffer( indices.length );
			_indexBuffer[ idx ].uploadFromVector( indices, 0, indices.length );
		}
		
		public function setNormals(idx:uint, normals:Vector.<Number>) : void 
		{
			_normals[ idx ] = normals;
			_normalBuffer[ idx ] = _context3D.createVertexBuffer( normals.length/3, 3 );
			_normalBuffer[ idx ].uploadFromVector( normals, 0, normals.length/3 );
		}
		
		public function setTexCoords(idx:uint, texCoords:Vector.<Number>) : void 
		{
			_texCoords[ idx ] = texCoords;
			_texCoordBuffer[ idx ] = _context3D.createVertexBuffer( texCoords.length/2, 2 );
			_texCoordBuffer[ idx ].uploadFromVector( texCoords, 0, texCoords.length/2 );
		}
		
		public function setVertices(idx:uint, vertices:Vector.<Number>) : void 
		{
			_vertices[ idx ] = vertices;
			_vertexBuffer[ idx ] = _context3D.createVertexBuffer( vertices.length/3, 3 );
			_vertexBuffer[ idx ].uploadFromVector( vertices, 0, vertices.length/3 );
			
			calculateBoundingBox();
		}
		
		public function hasTexture() : uint
		{
			if(_texture != null) {
				if(_texture.origChannelCount == 1.0 || _texture.origChannelCount == 2.0) {
					return 2;
				}
				return 1;
			} else {
				return 0;
			}
		}
		
		public function hasColor() : Boolean
		{
			if(_colors.length)
				return true;
			else
				return false
		}

	}
	
}
