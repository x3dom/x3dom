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
 * Class: x3dom.imageLoader
 *
 * Loader object that manage priority based 
 * image/texture loading.
 */
x3dom.ImageLoadManager = function() {
	
	this.heap = [];
	
	this.maxDownloads = 32;
	
	this.activeDownloads = 0;
		
	this.push = function(priority, image, url) {
		this.heapUp(this.heap.push({priority: priority, image: image, url:url}) - 1);
		this.load();
	};
	
	this.pop = function() {
		if(this.isEmpty()) {
		
		} else {
			var result = this.heap[0];
			var tmp = this.heap.pop();
			if(this.heap.length > 0) {
				this.heap[0] = tmp;
				this.heapDown(0);
			} 
			return result;
		}
	};
	
	this.load = function() {
		while(this.activeDownloads <= this.maxDownloads && this.heap.length) {
			var item = this.pop();
			this.activeDownloads++;
			item.image.crossOrigin = '';
			item.image.src = item.url;
		}
	};
	
	this.getLeftChildIndex = function(nodeIndex) {
		return parseInt( 2 * nodeIndex + 1 );
	};
	
	this.getRightChildIndex = function(nodeIndex) {
		return parseInt( 2 * nodeIndex + 2 );
	};
	
	this.getParentIndex = function(nodeIndex) {
		return parseInt( (nodeIndex - 1) / 2 );
	};
	
	this.heapUp = function(nodeIndex) {
		var parentIndex, tmp;
		if (nodeIndex != 0) {
			parentIndex = this.getParentIndex(nodeIndex);
			if (this.heap[parentIndex].priority > this.heap[nodeIndex].priority) {
				tmp = this.heap[parentIndex];
				this.heap[parentIndex] = this.heap[nodeIndex];
				this.heap[nodeIndex] = tmp;
				this.heapUp(parentIndex);
			}
		}
	};
	
	this.heapDown = function(nodeIndex) {
		var leftChildIndex, rightChildIndex, minIndex, tmp;
		leftChildIndex = this.getLeftChildIndex(nodeIndex);
		rightChildIndex = this.getRightChildIndex(nodeIndex);
		if (rightChildIndex >= this.heap.length) {
			  if (leftChildIndex >= this.heap.length)
					return;
			  else
					minIndex = leftChildIndex;
		} else {
			  if (this.heap[leftChildIndex].priority <= this.heap[rightChildIndex].priority)
					minIndex = leftChildIndex;
			  else
					minIndex = rightChildIndex;
		}
		if (this.heap[nodeIndex].priority > this.heap[minIndex].priority) {
			  tmp = this.heap[minIndex];
			  this.heap[minIndex] = this.heap[nodeIndex];
			  this.heap[nodeIndex] = tmp;
			  this.heapDown(minIndex);
		}
    };
	
	this.isEmpty = function() {
        return (this.heap.length == 0);
    };
	
	this.toString = function() {
		var string = "MinHeap [";
		for(var i=0; i<this.heap.length; i++) {
			if(i!=0) string += ", ";
			string += this.heap[i].priority + " - " + this.heap[i].data;
		}
		string += "]";
		return string;
	};
	
	this.length = function() {
		return this.heap.length;
	}
	
 };