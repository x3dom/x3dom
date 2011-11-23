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
x3dom.ImageLoadManager = {
	
	heap: [],
	
	complete: false,
	
	activeDownloads: 0,
	
	push: function(tex) {
		if(x3dom.caps.BACKEND == 'webgl') {
			if(tex._vf.url[0] != undefined) {
				x3dom.debug.logInfo("[ImageLoadManager] Push image to queue: URL = " + tex._vf.url[0] + " | Priority = " + tex._vf.priority);
				x3dom.ImageLoadManager.heapUp( x3dom.ImageLoadManager.heap.push({priority: tex._vf.priority, image: tex._image, url:tex._vf.url[0]}) - 1 );
				if(x3dom.ImageLoadManager.complete) {
					x3dom.ImageLoadManager.complete = false;
					x3dom.ImageLoadManager.load();
				}
			}
		}
	},
	
	pop: function() {
		if(x3dom.ImageLoadManager.isEmpty()) {
		
		} else {
			var result = x3dom.ImageLoadManager.heap[0];
			var tmp = x3dom.ImageLoadManager.heap.pop();
			if(x3dom.ImageLoadManager.heap.length > 0) {
				x3dom.ImageLoadManager.heap[0] = tmp;
				x3dom.ImageLoadManager.heapDown(0);
			} 
			return result;
		}
	},
	
	load: function() {
		if(x3dom.caps.BACKEND == 'webgl') {
			x3dom.debug.logInfo("[ImageLoadManager] Start loading...");
			while(!x3dom.ImageLoadManager.isEmpty()) {
				var item = x3dom.ImageLoadManager.pop();
				item.image.crossOrigin = '';
				item.image.src = item.url;
				item.image.onload = x3dom.ImageLoadManager.onLoadFnc;
				x3dom.ImageLoadManager.activeDownloads++;
			}
			x3dom.ImageLoadManager.complete = true;
		}
	},
	
	onLoadFnc: function(evt) {
		var event = document.createEvent("HTMLEvents");
		event.initEvent('ImageLoadManager_Load', true, true);
		this.dispatchEvent(event);
	},
	
	getLeftChildIndex: function(nodeIndex) {
		return parseInt( 2 * nodeIndex + 1 );
	},
	
	getRightChildIndex: function(nodeIndex) {
		return parseInt( 2 * nodeIndex + 2 );
	},
	
	getParentIndex: function(nodeIndex) {
		return parseInt( (nodeIndex - 1) / 2 );
	},
	
	heapUp: function(nodeIndex) {
		var parentIndex, tmp;
		if (nodeIndex != 0) {
			parentIndex = x3dom.ImageLoadManager.getParentIndex(nodeIndex);
			if (x3dom.ImageLoadManager.heap[parentIndex].priority > x3dom.ImageLoadManager.heap[nodeIndex].priority) {
				tmp = x3dom.ImageLoadManager.heap[parentIndex];
				x3dom.ImageLoadManager.heap[parentIndex] = x3dom.ImageLoadManager.heap[nodeIndex];
				x3dom.ImageLoadManager.heap[nodeIndex] = tmp;
				x3dom.ImageLoadManager.heapUp(parentIndex);
			}
		}
	},
	
	heapDown: function(nodeIndex) {
		var leftChildIndex, rightChildIndex, minIndex, tmp;
		leftChildIndex = x3dom.ImageLoadManager.getLeftChildIndex(nodeIndex);
		rightChildIndex = x3dom.ImageLoadManager.getRightChildIndex(nodeIndex);
		if (rightChildIndex >= x3dom.ImageLoadManager.heap.length) {
			  if (leftChildIndex >= x3dom.ImageLoadManager.heap.length)
					return;
			  else
					minIndex = leftChildIndex;
		} else {
			  if (x3dom.ImageLoadManager.heap[leftChildIndex].priority <= x3dom.ImageLoadManager.heap[rightChildIndex].priority)
					minIndex = leftChildIndex;
			  else
					minIndex = rightChildIndex;
		}
		if (x3dom.ImageLoadManager.heap[nodeIndex].priority > x3dom.ImageLoadManager.heap[minIndex].priority) {
			  tmp = x3dom.ImageLoadManager.heap[minIndex];
			  x3dom.ImageLoadManager.heap[minIndex] = x3dom.ImageLoadManager.heap[nodeIndex];
			  x3dom.ImageLoadManager.heap[nodeIndex] = tmp;
			  x3dom.ImageLoadManager.heapDown(minIndex);
		}
    },
	
	isEmpty: function() {
        return (x3dom.ImageLoadManager.heap.length == 0);
    },
	
	toString: function() {
		var string = "ImageLoadManager(" + x3dom.ImageLoadManager.heap.length + ") [";
		for(var i=0; i<x3dom.ImageLoadManager.heap.length; i++) {
			if(i!=0) string += ", ";
			string += x3dom.ImageLoadManager.heap[i].priority + " - " + x3dom.ImageLoadManager.heap[i].url;
		}
		string += "]";
		return string;
	},
	
	length: function() {
		return x3dom.ImageLoadManager.heap.length;
	}
	
 };