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
 * States namespace
 */
x3dom.States = function(x3dElem)
{
	var that = this;
  this.active = false;
  
  this.viewer = document.createElement('div');
  this.viewer.id = 'x3dom-state-viewer';
  
  
  
  var title = document.createElement('div');
  title.className = 'x3dom-states-head';
  title.appendChild(document.createTextNode( 'x3dom' ) );
  
  
  var subTitle = document.createElement('span');
  subTitle.className = 'x3dom-states-head2';
  subTitle.appendChild(document.createTextNode( 'stats' ) );
  title.appendChild(subTitle);
  
  this.measureList = document.createElement('ul');
  this.measureList.className = 'x3dom-states-list';
  
  this.infoList = document.createElement('ul');
  this.infoList.className = 'x3dom-states-list';
  
  this.viewer.appendChild(title);
  this.viewer.appendChild(this.measureList);
  this.viewer.appendChild(this.infoList);
  
  /**
   *
   */
  this.disableContextMenu = function (e) 
	{
		e.preventDefault();
        e.stopPropagation();
        e.returnValue = false;
        return false;	
	};
  
  /**
   *
   */
  this.thousandSeperator = function(value) 
	{
		return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};
  
  /**
   *
   */
  this.toFixed = function(value)
	{
		var fixed = (value < 1) ? 2 : (value < 10) ? 2 : 2;
		return value.toFixed(fixed);
	};
  
  /**
   *
   */
  this.update = function()
  {
    var infos = x3dElem.runtime.states.infos;
    var measurements = x3dElem.runtime.states.measurements;

    //Clear measure list
    this.measureList.innerHTML = "";

    //Create list items
    for(var m in measurements) {
      infoItem = document.createElement('li');
      infoItem.className = 'x3dom-states-item';
      
      infoTitle = document.createElement('div');
      infoTitle.className = 'x3dom-states-item-title';
      infoTitle.appendChild(document.createTextNode(m));
      
      infoValue = document.createElement('div');
      infoValue.className = 'x3dom-states-item-value';
      infoValue.appendChild(document.createTextNode( this.toFixed(measurements[m]) ) );
      
      infoItem.appendChild(infoTitle);
      infoItem.appendChild(infoValue);
      
      this.measureList.appendChild(infoItem);
    }
    
    //Clear info list
    this.infoList.innerHTML = "";
    
    //Create list items
    for(var i in infos) {
      var infoItem = document.createElement('li');
      infoItem.className = 'x3dom-states-item';
      
      var infoTitle = document.createElement('div');
      infoTitle.className = 'x3dom-states-item-title';
      infoTitle.appendChild(document.createTextNode(i));
      
      var infoValue = document.createElement('div');
      infoValue.className = 'x3dom-states-item-value';
      infoValue.appendChild(document.createTextNode( this.thousandSeperator(infos[i]) ) );
      
      infoItem.appendChild(infoTitle);
      infoItem.appendChild(infoValue);
      
      this.infoList.appendChild(infoItem);
    }
  };
    
  window.setInterval(function(){that.update();}, 1000);
  
  this.viewer.addEventListener("contextmenu", that.disableContextMenu);
}

/**
 * 
 */
x3dom.States.prototype.display = function(value) 
{
	this.active = (value !== undefined) ? value : !this.active;
	this.viewer.style.display = (this.active) ? "block" : "none";
}