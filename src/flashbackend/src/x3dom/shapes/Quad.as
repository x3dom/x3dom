package x3dom.shapes
{
	import x3dom.DrawableObject;
	
	public class Quad extends DrawableObject
	{
		public function Quad(width:Number=1, height:Number=1)
		{
			this.shape.setVertices( 0, Vector.<Number>( [-width/2.0, -height/2.0, 0, 
														  width/2.0, -height/2.0, 0,
														  width/2.0,  height/2.0, 0,
														 -width/2.0,  height/2.0, 0,] ) );
			this.shape.setTexCoords( 0, Vector.<Number>( [0,1, 1,1, 1,0, 0,0] ) );
			this.shape.setIndices( 0, Vector.<uint>( [0,1,2, 2,3,0] ) );
		}
	}
}