/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2014 Naval Postgraduate School MOVES Institute. BSD License.
 * 
 * @author DMcG
 */


/** Makes use of the x3dom function defineClass()
 * 
 * x3dom.registerNodeType("YourNodeName", "GroupName", definitionObj);
 * 
 * The first is the new node name, the second the package (eg, geospatial,
 * DIS) and the third the object.
 * 
 * defineClass(superclassObj, constructorObj, implementationObj);
 *
 * is used to define the object. In this case the return value of defineClass()
 * is being passed in as the third argument to registerNodeType.
 *
 */

// Define a class that represents a connection back to the server.
// this contains a host url & port, and maintains a list of entities
// that we have heard from the network.
x3dom.registerNodeType(
    "DISEntityManager",
    "DIS",
     // This section of code is hand-manufacturing a Javascript class.
     // The zeroth arugment is what class is being extended,
     // The first argument is a constructor function, the second a 
     // object literal containing a list of methods for the class.
     // See Internals.js for details.
     
     defineClass(x3dom.nodeTypes.X3DNode,  // Extends this node 
     // Constructor function
     function(ctx) 
     {         
         // Call to superclass
         x3dom.nodeTypes.X3DNode.call(this, ctx);
         
         console.log("In constructor for DISEntityManager");
         
         // Add fields that show up as attributes in the x3d node.
         // The field names here must match the attribute names used in 
         // the HTML. 
         this.addField_SFString(ctx, 'websocketUrl', "http://localhost:8282/"); 
         
         // Application ID, one of the site/application/entity id triplet. [0...65535]
         this.addField_SFInt32(ctx, 'applicationID', 1);
         
         // Site ID, one of the site/application/entity id triplet. [0...65535]
         this.addField_SFInt32(ctx, 'siteID', 1);
         
         // zero or more DISEntityTypeMapping nodes. No ctx arg?
         this.addField_MFNode('mapping', x3dom.nodeTypes.DISEntityTypeMapping);
                  
         // latitude, longitude, altitude (degrees and meters).
         this.addField_MFDouble(ctx, "localCoordinateSystemOrigin", 0.0, 0.0, 0.0);
        
         // The values in the X3D file node are directly passed here -- the
         // "default" values above, such as the localCoordinateSystemOrign
         // attribute, are not used, instead the value in the x3D file are
         // in force here.
         
         
         
         // Set up internal objects, not visible to XML. These are entirely
         // javascript objects. 
         //this.network = new NetworkSingleton(this._vf.websocketUrl, this._vf.localCoordinateSystemOrigin);
     },
      
     // The implementation object. Thas has function definitions for the Node API,
     // done in the format of an object literal, with functions for the values.
     {
          
          /**
           * Called when a field value is changed
           * 
           * @param {type} fieldName the name of the field, eg siteID, applicationID, etc
           * @returns {undefined} nothing
           */
          fieldChanged: function(fieldName) {
              console.log("in DISEntityManager fieldChanged, field=:", fieldName);
            },
            
            /**
             * DISEntityManager node changed
             * 
             * @returns {undefined}
             */
            nodeChanged:function() {
                console.log("DISEntityManager nodeChanged called");
                
             // Set up internal objects, not visible to XML. These are entirely
             // javascript objects. 
             this.network = new NetworkSingleton(this._vf.websocketUrl, this._vf.localCoordinateSystemOrigin, this);
            },
            
            /**
             * A field in DISEntityManager has been updated
             * @param {type} field name of field
             * @param {type} msg
             * @returns {undefined}
             */
            updateField:function(field, msg) {
               
                console.log("DISEntityManager updateField called:", field, ", ", msg);
            },

           testFromObject: function(aParam) 
           {
               console.log("DISEntityManager TestFromObject called");
           }
       }
     )
   );



