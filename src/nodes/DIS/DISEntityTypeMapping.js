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
x3dom.registerNodeType(
    "DISEntityTypeMapping",
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
         
         console.log("In constructor for DISEntityTypeMapping");
         
         // Add fields that show up as attributes in the x3d node.
         // The field names here must match the attribute names used in 
         // the HTML. 
         
         // metadata node
         this.addField_SFNode(ctx, "metadata", "x3dom.nodeTypes.X3DMetadataObject");

         /** The URL form which a model is loaded, given the values in
          *  the enumerated fields below.
          */
         this.addField_SFString(ctx, 'url', "http://localhost"); 
         
         // The fields are kind, domain, country, category, subcategory,
         // and specific. The collection of all of these defines a specific
         // type of physical entity, as defined in the SISO EBV document.
         // The semantic meaning of each of these fields can vary depending
         // on context. 
         
         /** kind, typically entity, cultural feature, life form, etc. [0..255] */
         this.addField_SFInt32(ctx, 'kind', 1);
         
          /** domain, typically air/surface/subsurface/space [0..255] */
         this.addField_SFInt32(ctx, 'domain', 1);
         
         /** country, different value for each country. [0..16K] 225 = US.*/
         this.addField_SFInt32(ctx, 'country', 225);
         
         // Category, subcategory, and specific are almost entirely
         // context-specific.
         
         /**  Category [0..255]*/
         this.addField_SFInt32(ctx, 'category', 0);
         
         /**  Subcategory. [0..255] */
         this.addField_SFInt32(ctx, 'subcategory', 0);
         
         /** Subcategory [0..255]*/
         this.addField_SFInt32(ctx, 'specific', 0);
         
         console.log("country:", this.country);
         
         //this.addField_SFNode(ctx, "addedNodes", "x3dom.nodeTypes.X3DNode");

         //this.addField_SFNode(ctx, "removedNodes", "x3dom.nodeTypes.X3DNode");
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
              console.log("in DISEntityTypeMapping fieldChanged, field=:", fieldName);
            },
            
            /**
             * DISEntityManager node changed
             * 
             * @returns {undefined}
             */
            nodeChanged:function() {
                console.log("DISEntityTypeMapping nodeChanged called");
            },
            
            /**
             * A field in DISEntityManager has been updated
             * @param {type} field name of field
             * @param {type} msg
             * @returns {undefined}
             */
            updateField:function(field, msg) {
               
                console.log("DISEntityTypeMapping updateField called:", field, ", ", msg);
            },

           testFromObject: function(aParam) 
           {
               console.log("DISEntityTypeMapping TestFromObject called");
           }
       }
     )
   );



