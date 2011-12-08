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
	
	reversePointDirection: function (linklist, plane) {
		
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
							
				if(plane == 'YZ') {
					z = (nodel.point.y - nodei.point.y) * (nodek.point.z - nodel.point.z);
					z -= (nodel.point.z - nodei.point.z) * (nodek.point.y - nodel.point.y);
				} else if(plane == 'XZ') {
					z = (nodel.point.z - nodei.point.z) * (nodek.point.x - nodel.point.x);
					z -= (nodel.point.x - nodei.point.x) * (nodek.point.z - nodel.point.z);
				} else {
					z = (nodel.point.x - nodei.point.x) * (nodek.point.y - nodel.point.y);
					z -= (nodel.point.y - nodei.point.y) * (nodek.point.x - nodel.point.x);
				}
				
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
		var node = linklist.first.next;
		var plane = this.identifyPlane(node.prev.point, node.point, node.next.point);
		
		var invers = this.reversePointDirection(linklist, plane);
		var indexes = [];
		node = linklist.first.next;
		var next = null;
		var count = 0;	
			
		var isEar = true;
		
		while(linklist.length >= 3 && count < 10) {
			next = node.next;
			for(var i = 0; i < linklist.length; i++) {
				if(this.isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point, plane)) {
					isEar = false;
				}
			}
			
			if(isEar) {
				if(this.isKonvex(node.prev.point, node.point, node.next.point, plane)) {
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
		var node = linklist.first.next;
		var plane = this.identifyPlane(node.prev.point, node.point, node.next.point);
		var invers = this.reversePointDirection(linklist, plane);
		
		var data = new Object();
		data.indices = [];
		data.point = [];
		data.normals = [];
		data.colors = [];
		data.texCoords = [];
		node = linklist.first.next;
		var next = null;
		var count = 0;
		
		
		var isEar = true;
		while(linklist.length >= 3  && count < 10) {
			next = node.next;
			for(var i = 0; i < linklist.length; i++) {
				if(this.isNotEar(linklist.getNode(i).point, node.prev.point, node.point, node.next.point, plane)) {
					isEar = false;
				}
			}
			if(isEar) {
				if(this.isKonvex(node.prev.point, node.point, node.next.point, plane)) {				
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
	
	isNotEar: function (ap1, tp1, tp2, tp3, plane) {
		var b0, b1, b2, b3;
		
		var ap1a, ap1b, tp1a, tp1b, tp2a, tp2b, tp3a, tp3b;
		
		if(plane == 'YZ') {
			ap1a = ap1.y, ap1b = ap1.z;
			tp1a = tp1.y, tp1b = tp1.z;
			tp2a = tp2.y, tp2b = tp2.z;
			tp3a = tp3.y, tp3b = tp3.z;
		} else if(plane == 'XZ') {
			ap1a = ap1.z, ap1b = ap1.x;
			tp1a = tp1.z, tp1b = tp1.x;
			tp2a = tp2.z, tp2b = tp2.x;
			tp3a = tp3.z, tp3b = tp3.x;		
		} else {
			ap1a = ap1.x, ap1b = ap1.y;
			tp1a = tp1.x, tp1b = tp1.y;
			tp2a = tp2.x, tp2b = tp2.y;
			tp3a = tp3.x, tp3b = tp3.y;
		}
		
		b0 = ((tp2a - tp1a) * (tp3b - tp1b) - (tp3a - tp1a) * (tp2b - tp1b));
		if (b0 != 0) {
		  b1 = (((tp2a - ap1a) * (tp3b - ap1b) - (tp3a - ap1a) * (tp2b - ap1b)) / b0);
		  b2 = (((tp3a - ap1a) * (tp1b - ap1b) - (tp1a - ap1a) * (tp3b - ap1b)) / b0);
		  b3 = 1 - b1 - b2;
	
		  return ((b1 > 0) && (b2 > 0) && (b3 > 0));
		}
		else {
		  return false;
		}	
	},

	isKonvex: function (p ,p1, p2, plane) {
		var pa, pb, p1a, p1b, p2a, p2b;
		if(plane == 'YZ') {
			pa = p.y, pb = p.z;
			p1a = p1.y, p1b = p1.z;
			p2a = p2.y, p2b = p2.z;
		} else if(plane == 'XZ') {
			pa = p.z, pb = p.x;
			p1a = p1.z, p1b = p1.x;
			p2a = p2.z, p2b = p2.x;
		} else {
			pa = p.x, pb = p.y;
			p1a = p1.x, p1b = p1.y;
			p2a = p2.x, p2b = p2.y;
		}
		
		var l = ((p1a - pa) * (p2b - pb) - (p1b - pb) * (p2a - pa));
		if (l < 0) {
		  return false;
		} else {
		  return true;
		}	
	},
	
	identifyPlane: function(p1, p2, p3) {
		var v1x, v1y, v1z;
		var v2x, v2y, v2z;
		var v3x, v3y, v3z;
	
		v1x = p2.x - p1.x, v1y = p2.y - p1.y, v1z = p2.z - p1.z;
		v2x = p3.x - p1.x, v2y = p3.y - p1.y, v2z = p3.z - p1.z;
		
		v3x = v1y*v2z - v1z*v2y;
		v3y = v1z*v2x - v1x*v2z;
		v3z = v1x*v2y - v1y*v2x;
		
		var angle = Math.max( Math.abs(v3x), Math.abs(v3y), Math.abs(v3z));
		
		if(angle == Math.abs(v3x)){
			return 'YZ';
		} else if(angle == Math.abs(v3y)) {
			return 'XZ';
		} else if(angle == Math.abs(v3z)){
			return 'XY';
		} else {
			return 'fehler';
		}
	}

};