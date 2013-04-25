/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */
 
 
/**
 *
 */
x3dom.DrawableCollection = function (viewarea, sortTrans) {
  this.collection = [];
  this.viewarea = viewarea;
 
  this.sortBySortKey = false;
  this.sortByPriority = false;
  this.sortTrans = sortTrans;
  
  this.numberOfNodes = 0;
  
  this.length = 0;
};

/**
 *
 */
x3dom.DrawableCollection.prototype.addDrawable = function ( shape, transform, boundingbox, params ) {

  //Create a new drawable object
  var drawable = {};
  
  //Set the shape
  drawable.shape = shape;
  
  //Set the transform
  drawable.transform = transform;
  
  //Set the boundingbox
  drawable.boundingBox = boundingbox;
  
  //Set the parameters
  drawable.params = params;
  
  //Calculate the magical object priority
  drawable.priority = 0;
  
    
  var appearance = shape._cf.appearance.node;
  drawable.sortType = appearance ? appearance._vf.sortType.toLowerCase() : "opaque";
  drawable.sortKey  = appearance ? appearance._vf.sortKey  : 0;

  //Calculate the z-Pos for transparent object sorting as long as 
  //the center of the box is not available
  if (drawable.sortType == 'transparent') {
    var center = shape.getCenter();
    var viewMatrix = this.viewarea.getViewMatrix();
    center = transform.multMatrixPnt(center);
    center = viewMatrix.multMatrixPnt(center);
    drawable.zPos = center.z;
  }
  
  //Generate the shader properties
  drawable.properties = x3dom.Utils.generateProperties(this.viewarea, shape);

  //Look for sorting by sortKey
  if (!this.sortBySortKey && drawable.sortKey != 0) {
    this.sortBySortKey = true;
  }

  //Generate separate array for sortType if not exists
  if (this.collection[drawable.sortType] === undefined) {
    this.collection[drawable.sortType] = [];
  }
  
  //Push drawable to the collection
  this.collection[drawable.sortType].push( drawable );
  
  //Increment collection length
  this.length++;
};

/**
 *
 */
x3dom.DrawableCollection.prototype.concat = function ( idx ) {
  var opaque = (this.collection['opaque'] !== undefined) ? this.collection['opaque'] : [];
  var transparent = (this.collection['transparent'] !== undefined) ? this.collection['transparent'] : [];
  
  //Merge opaque and transparent drawables to a single array
  this.collection = opaque.concat(transparent);
};

/**
 *
 */
x3dom.DrawableCollection.prototype.get = function ( idx ) {
  return this.collection[idx];
};

/**
 *
 */
x3dom.DrawableCollection.prototype.sort = function () {

  var opaque = [];
  var transparent = [];

  //Sort opaque drawables
  if (this.collection['opaque'] !== undefined) {
    if ( this.sortOpaque) {
      this.collection['opaque'].sort(function(a,b) {
        if(a.sortKey == b.sortKey || !this.sortBySortKey) {
          /*if(a.priority == b.priority || !this.sortByPriority) {
            //Third sort criteria (shaderID)
            return a.properties.toIdentifier() < b.properties.toIdentifier() ? -1 : 
                   a.properties.toIdentifier() > b.properties.toIdentifier() ?  1 : 0;
          }*/
          //Second sort criteria (priority)
          return a.priority - b.priority;
        }	
        //First sort criteria (sortKey)
        return a.sortKey - b.sortKey;
      });
    }
    opaque = this.collection['opaque'];
  }

  //Sort transparent drawables
  if (this.collection['transparent'] !== undefined) {
    if (this.sortTrans) {
      this.collection['transparent'].sort(function(a,b) {
        if (a.sortKey == b.sortKey || !this.sortBySortKey) {
          if (a.priority == b.priority || !this.sortByPriority) {
            /*if (a.zPos == b.zPos || !this.sortByTrans) {
              //Fourth sort criteria (shaderID)
              return a.properties.toIdentifier() < b.properties.toIdentifier() ? -1 : 
                     a.properties.toIdentifier() > b.properties.toIdentifier() ?  1 : 0;
            }*/
            //Third sort criteria (zPos)
            return a.zPos - b.zPos;
          }
          //Second sort criteria (priority)
          return a.priority - b.priority;
        }	
        //First sort criteria (sortKey)
        return a.sortKey - b.sortKey;
      });
    }
    transparent = this.collection['transparent'];
  }
  
  //Merge opaque and transparent drawables to a single array
  this.collection = opaque.concat(transparent);
};
