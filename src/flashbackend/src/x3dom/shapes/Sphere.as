package x3dom.shapes
{
	import x3dom.DrawableObject;

	public class Sphere extends DrawableObject
	{
		public function Sphere(radius:Number=10, latitudeBands:Number=48, longitudeBands:Number=48)
		{
			var latNumber:Number, longNumber:Number;
			var theta:Number, sinTheta:Number, cosTheta:Number;
			var phi:Number, sinPhi:Number, cosPhi:Number;
			var x:Number, y:Number, z:Number, u:Number, v:Number;
			
			var vertices:Vector.<Number> = new Vector.<Number>();
			var texCoords:Vector.<Number> = new Vector.<Number>();
			var indices:Vector.<uint> = new Vector.<uint>();
			
			for(latNumber = 0; latNumber<=latitudeBands ; latNumber++)
			{
				theta = (latNumber * Math.PI) / latitudeBands;
				sinTheta = Math.sin(theta);
				cosTheta = Math.cos(theta);
				
				for (longNumber = 0; longNumber <= longitudeBands; longNumber++)
				{
					phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
					sinPhi = Math.sin(phi);
					cosPhi = Math.cos(phi);
					
					x = -cosPhi * sinTheta;
					y = -cosTheta;
					z = -sinPhi * sinTheta;
					
					u = 0.25 - ((1.0 * longNumber) / longitudeBands);
					v = latNumber / latitudeBands;
					
					vertices.push(radius * x);
					vertices.push(radius * y);
					vertices.push(radius * z);
					texCoords.push(u);
					texCoords.push(v);
				}
			}
			
			var first:Number, second:Number;
			
			for (latNumber = 0; latNumber < latitudeBands; latNumber++)
			{
				for (longNumber = 0; longNumber < longitudeBands; longNumber++)
				{
					first = (latNumber * (longitudeBands + 1)) + longNumber;
					second = first + longitudeBands + 1;
					
					indices.push(first);
					indices.push(second);
					indices.push(first + 1);
					
					indices.push(second);
					indices.push(second + 1);
					indices.push(first + 1);
				}
			}
			
			this.shape.setVertices(0, vertices);
			this.shape.setTexCoords(0, texCoords);
			this.shape.setIndices(0, indices);
		}
	}
}