		var j = 1;

		function prehidewt(event) {
   			setTimeout(function () {
      			trans=j/100;
   				prehide(trans);
      			j=j+10;
      			if (j <= 100) {
        			prehidewt();
      			}
   			}, 6)
		}
   		
   		function preshowwt(event) {
   			setTimeout(function () {
      			trans=j/100;
   				preshow(trans);
      			j=j-10;
      			if (j >= 0) {
        			preshowwt();
      			}
   			}, 6)
		}
   		
   		var prehide = function(transp) {
			for(var i=0; i<len; i++) {
				var value = arr[i];
				hide(arr[i], transp);
			}
   		}
   		
   		var preshow = function(transp) {
		for(var i=0; i<len; i++) {
				var value = arr[i];
				show(event, arr[i], transp);
			}
		}
   		
		var hide = function(id_N, transp) {
				var node = document.getElementById(id_N);
				Array.forEach ( node.childNodes, function (childDomNode) {
						travers(childDomNode, transp);
				} );
    	};	
		
		var show = function(event, id_N, transp) {	
				var node = document.getElementById(id_N);
				Array.forEach ( node.childNodes, function (childDomNode) {	
						 travers(childDomNode, transp);
				} );
    	};	
	
		function travers(node, trans) {
				if(node.nodeName == 'Material' || node.nodeName == 'material'){
					if(!node.hasAttribute('USE')){
						node.setAttribute('transparency', trans);
					}
				}
				if(node.hasChildNodes()){
					Array.forEach ( node.childNodes, function (children) {
							travers(children, trans);
					} );
				}	
    	};	
    	function addIt() {
        	 document.getElementById('hide').addEventListener('click', prehidewt, false);
			 document.getElementById('show').addEventListener('click', preshowwt, false);
    	}