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
function ListNode(data,index) {
	this.data = data;
	this.index = index;
	this.next = null;
	this.prev = null;
};

function DoublyLinkedList() {
	this.length = 0;
	this.first = null;
	this.last = null;
};

DoublyLinkedList.prototype.appendNode = function(node) {
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
DoublyLinkedList.prototype.insertAfterNode = function(node, newNode) {
  	newNode.prev = node;
 	newNode.next = node.next;
  	node.next.prev = newNode;
  	node.next = newNode;
  	if (newNode.prev == this.last) { 
		this.last = newNode;
	}
  	this.length++;
};

DoublyLinkedList.prototype.deleteNode = function(node) {
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
DoublyLinkedList.prototype.getNode = function(index) {
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



