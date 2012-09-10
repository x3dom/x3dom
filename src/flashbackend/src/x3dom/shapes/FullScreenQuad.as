package x3dom.shapes
{
	import x3dom.DrawableObject;
	
	public class FullScreenQuad extends DrawableObject
	{
		public function FullScreenQuad()
		{
			this.shape.setVertices( 0, Vector.<Number>( [-1,-1,0, 1,-1,0, 1,1,0, -1,1,0] ) );
			this.shape.setTexCoords( 0, Vector.<Number>( [0,1, 1,1, 1,0, 0,0] ) );
			this.shape.setIndices( 0, Vector.<uint>( [0,1,2, 2,3,0] ) );
		}
	}
}