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
x3dom.DoublyLinkedList = function() {
	this.length = 0;
	this.first = null;
	this.last = null;
};
x3dom.DoublyLinkedList.ListNode = function(point, point_index, normals, colors, texCoords) {
	this.point = point;
	this.point_index = point_index;
	this.normals = normals;
	this.colors = colors;
	this.texCoords = texCoords;
	this.next = null;
	this.prev = null;
};

x3dom.DoublyLinkedList.prototype.appendNode = function(node) {
  	if (this.first === null) {
    	node.prev = node;
    	node.next = node;
    	this.first = node;
    	this.last = node;
  	} else {
   	 	node.prev = this.last;
   	 	node.next = this.first;
   	 	this.first.prev = node;
    	this.last.next = node;
    	this.last = node;
  	}
  	this.length++;
};
x3dom.DoublyLinkedList.prototype.insertAfterNode = function(node, newNode) {
  	newNode.prev = node;
 	newNode.next = node.next;
  	node.next.prev = newNode;
  	node.next = newNode;
  	if (newNode.prev == this.last) { 
		this.last = newNode;
	}
  	this.length++;
};

x3dom.DoublyLinkedList.prototype.deleteNode = function(node) {
 	if (this.length > 1) {
		node.prev.next = node.next;
		node.next.prev = node.prev;
		if (node == this.first) {
			this.first = node.next;
		}
		if (node == this.last) {
			this.last = node.prev;
		}
	} else {
		this.first = null;
		this.last = null;
	}
	node.prev = null;
	node.next = null;
	this.length--;
};
x3dom.DoublyLinkedList.prototype.getNode = function(index) {
	var node = null;
	if(index > this.length) {
		return node;	
	}
	for(var i = 0; i < this.length; i++) {
		if(i == 0) {
			node = this.first;
		} else {
			node = node.next;
		}
		if(i == index) {
			return node;
		}
	}
};
x3dom.DoublyLinkedList.prototype.invert = function() {
	var node = null;
	var tmp = null;
	node = this.first;
	
	for(var i = 0; i < this.length; i++) {
		tmp = node.prev;
		node.prev =	node.next;
		node.next = tmp;
		node = node.prev;
	}
	tmp = this.first;
	this.first = this.last;
	this.last = tmp;
};




