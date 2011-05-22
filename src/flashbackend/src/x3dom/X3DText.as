package x3dom
{
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display3D.*;
	import flash.text.AntiAliasType;
	import flash.text.Font;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	import flash.text.TextFormatAlign;
	
	import x3dom.texturing.BitmapTexture;
	
	public class X3DText extends Shape
	{
		private var _textField:TextField;
		private var _textFormat:TextFormat;
		
		public function X3DText()
		{		
			_textField = new TextField();
			_textField.autoSize = TextFieldAutoSize.LEFT;
			_textField.antiAliasType = AntiAliasType.ADVANCED;
			_textField.multiline = true;
			
			_textFormat = new TextFormat();
		}
		
		public function setTextProperties(value:Object) : void
		{		
			//Set Text
			_textField.text = value.text;
			
			//Set text size
			_textFormat.size = Number( value.fontSize );
			
			//Set text font family
			_textFormat.font = String( value.fontFamily ).replace(/\'/g,'').split(" ")[0];
			
			//Set text color
			_textFormat.color = 0xFFFFFF;
			
			//Set text align
			var fontAlign:String = String( value.fontAlign ).replace(/\'/g,'').split(" ")[0];
			switch( fontAlign.toUpperCase() )
			{
				case "BEGIN": _textFormat.align = TextFormatAlign.LEFT; break;
				case "END": _textFormat.align = TextFormatAlign.RIGHT; break;
				case "MIDDLE": _textFormat.align = TextFormatAlign.CENTER; break;
				case "FIRST": _textFormat.align = TextFormatAlign.LEFT; break;
				default: _textFormat.align = TextFormatAlign.LEFT;
			}
			
			//Set text style
			switch( String(value.fontStyle).toUpperCase() )
			{
				case "PLAIN": _textFormat.bold = false; _textFormat.italic = false; break;
				case "BOLD": _textFormat.bold = true; _textFormat.italic = false; break;
				case "ITALIC": _textFormat.bold = false; _textFormat.italic = true; break;
				case "BOLDITALIC": _textFormat.bold = true; _textFormat.italic = true; break;
				default: _textFormat.bold = false; _textFormat.italic = false;
			}
			
			//Set TextField format
			_textField.setTextFormat( _textFormat );
			
			//Create bitmap from TextField
			var bitmapData:BitmapData = new BitmapData(_textField.width, _textField.height, true, 0x00000000);
			bitmapData.draw(_textField);
			
			//Set bitmap as texture
			this.texture = new BitmapTexture(new Bitmap(bitmapData), true);
			
			//Create Plane
			var width:Number  = Utils.nextBestPowerOfTwo(_textField.width)/100.0;
			var height:Number = Utils.nextBestPowerOfTwo(_textField.height)/100.0;
			this.setIndices( 0, Vector.<uint>([0,1,2, 2,3,0]) );
			this.setVertices( 0, Vector.<Number>([-width,-height,0, width,-height,0, width,height,0, -width,height,0]) );
			this.setNormals( 0, Vector.<Number>([0,0,1, 0,0,1, 0,0,1, 0,0,1]) );
			this.setTexCoords( 0, Vector.<Number>([0,0, 1,0, 1,1, 0,1]) );
		}
	}
}