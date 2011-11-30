/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * Class: x3dom.runtime
 *
 * Runtime proxy object to get and set runtime parameters. This object
 * is attached to each X3D element and can be used in the following manner:
 *
 * > var e = document.getElementById('the_x3delement');
 * > e.runtime.showAll();
 * > e.runtime.resetView();
 * > ...
 */
x3dom.EarClipping = {
	
	reversePointDirection: function (linklist) {
		
			var l, k;
			var count = 0;
			var z;
			var nodei, nodel, nodek;
			
			if (linklist.length < 3) {
				return false;
			}
			
			for (var i = 0; i < linklist.length; i++) {
				l = (i + 1) % linklist.length;
				k = (i + 2) % linklist.length;
				
				nodei = linklist.getNode(i);
				nodel = linklist.getNode(l);
				nodek = linklist.getNode(k); 
						
				z = (nodel.point.x - nodei.point.x) * (nodek.point.y - nodel.point.y);
				z -= (nodel.point.y - nodei.point.y) * (nodek.point.x - nodel.point.x);
				if (z < 0) {
					count--;
				} else if (z > 0) {
					count++;
				}
			}	
			
			if (count < 0) {
				linklist.invert();
				return true;
			}	
			return false;
	}, 

	getIndexes: function (linklist) {
		var invers = this.reversePointDirection(linklist);
		var indexes = [];
		var node = linklist.first.next;
		var next = null;
		var count = 0;	
			
		var isEar = true;
		while(linklist.length >= 3 && count < 10) {
			next = node.next;
			for(var i = 0; i < linklist.length; i++) {
				if(this.isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point)) {
					isEar = false;
				}
			}
			
			if(isEar) {
				if(this.isKonvex(node.prev.point, node.point, node.next.point)) {
					indexes.push(node.prev.point_index, node.point_index, node.next.point_index);
					linklist.deleteNode(node);
				} else {
					count++;
				}
			}
			
			if(count == 3) {
				if(this.reversePointDirection(linklist))
				{		
					var tmp = this.getIndexes(linklist).reverse();
					for(var i = 0; i < tmp.length; i++ ) {
						indexes.push(tmp[i]);
					}
				}
			}
			node = next;
			isEar = true;
		}
		if(invers){
			return indexes.reverse();
		} else {
			return indexes;
		}
	},

	getMultiIndexes: function (linklist) {
		var invers = this.reversePointDirection(linklist);
		
		var data = new Object();
		data.indices = [];
		data.point = [];
		data.normals = [];
		data.colors = [];
		data.texCoords = [];
		var node = linklist.first.next;
		var next = null;
		var count = 0;
		
		
					
		var isEar = true;
		while(linklist.length >= 3  && count < 10) {
			next = node.next;
			for(var i = 0; i < linklist.length; i++) {
				if(this.isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point)) {
					isEar = false;
				}
			}
			
			if(isEar) {
				if(this.isKonvex(node.prev.point, node.point, node.next.point)) {				
					data.indices.push(node.prev.point_index, node.point_index, node.next.point_index);
					data.point.push(node.prev.point,
									node.point,
									node.next.point);
					if(node.normals) {					
						data.normals.push(node.prev.normals,
										  node.normals,
										  node.next.normals);
					
					}
					if(node.colors){
						data.colors.push(node.prev.colors,
										node.colors,
										node.next.colors);
					}
					if(node.texCoords){
						data.texCoords.push(node.prev.texCoords,
											node.texCoords,
											node.next.texCoords); 
					}
					linklist.deleteNode(node);
				}  else {
					count++;
				}
			}
			if(count == 3) {
			if(this.reversePointDirection(linklist))
			{
				var tmp = this.getMultiIndexes(linklist);
				data.indices = data.indices.concat(tmp.indices.reverse());
				data.point = data.point.concat(tmp.point.reverse());
				data.normals = data.normals.concat(tmp.normals.reverse());
				data.colors = data.colors.concat(tmp.colors.reverse());
				data.texCoords = data.texCoords.concat(tmp.texCoords.reverse());			
			}
		}
			node = next;
			isEar = true;
		}
		if(invers){	
			data.indices = data.indices.reverse();
			data.point = data.point.reverse();
			data.normals = data.normals.reverse();
			data.colors = data.colors.reverse();
			data.texCoords = data.texCoords.reverse();
			
			return data;
		} else {
			return data;
		}
	}, 
	
	isNotEar: function (ap1, tp1, tp2, tp3) {
		var b0, b1, b2, b3;
		b0 = ((tp2.x - tp1.x) * (tp3.y - tp1.y) - (tp3.x - tp1.x) * (tp2.y - tp1.y));
		if (b0 != 0) {
		  b1 = (((tp2.x - ap1.x) * (tp3.y - ap1.y) - (tp3.x - ap1.x) * (tp2.y - ap1.y)) / b0);
		  b2 = (((tp3.x - ap1.x) * (tp1.y - ap1.y) - (tp1.x - ap1.x) * (tp3.y - ap1.y)) / b0);
		  b3 = 1 - b1 - b2;
	
		  return ((b1 > 0) && (b2 > 0) && (b3 > 0));
		}
		else {
		  return false;
		}	
	},

	isKonvex: function (p ,p1, p2) {
		var l = ((p1.x - p.x) * (p2.y - p.y) - (p1.y - p.y) * (p2.x - p.x));
		if (l < 0) {
		  return false;
		} else {
		  return true;
		}	
	}

};