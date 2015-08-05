/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2014 Naval Postgraduate School MOVES Institute. BSD License.
 * 
 * @author DMcG, Byron Harder
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
    "EspduTransform",   // Name of XML tag
    "DIS",              // Node group this is a member of
     // This section of code is hand-manufacturing a Javascript class.
     // The zeroth arugment is what class is being extended,
     // The first argument is a constructor function, the second a 
     // object literal containing a list of methods for the class.
     // See Internals.js for details.
     defineClass(x3dom.nodeTypes.X3DNode,  // Superclass
     // Constructor function
     function(ctx) 
     {         
        // Call to superclass
        x3dom.nodeTypes.EspduTransform.superClass.call(this, ctx);

         //x3dom.debug.logWarning("In constructor for class EspduTransform");
         
         // Add fields that show up as attributes in the x3d node.
         // The field names here must match the attribute names used in 
         // the HTML. 
         
         // The best source for the meaning of the various fiels is 
         // IEEE 1278.1-2012, the DIS standard, available from IEEE.
         // (often for free if your university library is subscribed
         // to IEEE standards, as many are.) Note that the IEEE standard
         // has gone through revisions over the years, and the above is
         // for version 7, while the node fields below were defined with
         // DIS version 6 in mind. but they're very, very close, with generally
         // better explainations in the V7 document. 
         
         /** Articulation paramters.  */
         this.addField_SFFloat(ctx, 'set_articulationParameterValue0', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue1', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue2', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue3', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue4', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue5', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue6', 0.0);
         this.addField_SFFloat(ctx, 'set_articulationParameterValue7', 0.0);
                  
         /** address */
         this.addField_SFString(ctx, 'address', "localhost");
         
         /**The entity ID is one of the three values that together uniquely ID
          * an entity in the world. [0..65535]
          * */
         this.addField_SFInt32(ctx, "entityID", 0); 
         
         /** How many articulation parameters there are [0-78] */
         this.addField_SFInt32(ctx, "articulationParameterCount", 0);
         
         /** [0,255] */
         this.addField_MFInt32(ctx, 'articulationParameterDesignatorArray', 0);
        
         /** [0,255] */
         this.addField_MFInt32(ctx, 'articulationParameterChangeIndicatorArray', 0);
         
         /**  [0,65535] */
         this.addField_MFInt32(ctx, 'articulationParameterIdPartAttachedToArray', 0);
         
         /**  [0,65535] */
         this.addField_MFInt32(ctx, 'articulationParameterTypeArray', 0);
         
         /** [0,65535] */
         this.addField_MFFloat(ctx, 'articulationParameterArray', 0);
      
         /** Center [-inf..+inf] */
         this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

         
         /** From the SISO EBV document, a series of integers that define
          * a unique entity type, eg m1a2 abrams, F-16 block 3, etc. The 
          * range of values that are allowed are
          * Name       Index  range
          * ----       -----  ------
          * EntityKind   0     [0-7]
          * Domain       1     [0-7]
          * Country      2     [0-65535]
          * Category     3     [0-7]
          * Subcategory  4     [0-7]
          * Specific     5     [0-7]
          * Extra        6     [0-7]
          * 
          * The meaning of the values are defined in the EBV document
          * */
         this.addField_MFInt32(ctx, "entityType", 0, 0, 0, 0, 0, 0);
         
         /** child nodes */
         this.addField_MFNode("children", x3dom.nodeTypes.X3DNode);
         
         /** Type of collision (elastic, inelastic). [0..255] */
         this.addField_SFInt32(ctx, "collisionType", 0);
         
         /** Type of dead reckoning algorithm. [0..255] */
         this.addField_SFInt32(ctx, "deadReckoning", 0);
         
         /** Detonation location. (global coordinates?)*/
         this.addField_MFFloat(ctx, "detonationLocation", 0, 0, 0);
         
         /** Detonation location. (Local coordinates?) */
         this.addField_MFFloat(ctx, "detonationRelativeLocation", 0, 0, 0);
         
         /** Detonation result. [0..255] */
         this.addField_SFInt32(ctx, "detonationResult", 0);
         
         /** Enabled or not boolean */
         this.addField_SFBool(ctx, "enabled", 'true');
         
         /** catetory [0..255] */
         this.addField_SFInt32(ctx, "entityCategory", 0);
         
         /** country [0..16K], 225 = USA */
         this.addField_SFInt32(ctx, "entityCountry", 0);
         
         /* domain (air, surface, subsurface, etc), [0..255] */
         this.addField_SFInt32(ctx, "entityDomain", 0);
         
         /** extra [0..255] */
         this.addField_SFInt32(ctx, "entityExtra", 0);
         
         /** kind [0..255] */
         this.addField_SFInt32(ctx, "entityKind", 0);
         
         /** specific [0..255] */
         this.addField_SFInt32(ctx, "entitySpecific", 0);
         
         /** specific [0..255] */
         this.addField_SFInt32(ctx, "entitySubCategory", 0);
         
         
         /** app id for event */
         this.addField_SFInt32(ctx, "eventApplicationID", 0);
         
         /** entity id for event */
         this.addField_SFInt32(ctx, "eventEntityID", 0);
         
         /** event number */
         this.addField_SFInt32(ctx, "eventNumber", 0);
         
         /** event number */
         this.addField_SFInt32(ctx, "eventNumber", 0);
         
         /** event site id */
         this.addField_SFInt32(ctx, "eventSiteID", 0);
         
         /** fired1 */
         this.addField_SFBool(ctx, "fired1", 'false');
         
         /** fired2  */
         this.addField_SFBool(ctx, "fired2", 'false');
         
         /** [0..64k] */
         this.addField_SFInt32(ctx, "fireMissionIndex", 0);
         
         /** firing range [0...+inf] */
         this.addField_MFFloat(ctx, "firingRange", 0);
         
         /** [0..64k] */
         this.addField_SFInt32(ctx, "firingRate", 0);
         
         /** [0..64k] */
         this.addField_SFInt32(ctx, "forceID", 0);         
         
         /** [0..255] */
         this.addField_SFInt32(ctx, "fuse", 0);
         
         /** [-inf..+inf] */
         this.addField_MFDouble(ctx, "geoCoords", 0, 0, 0);
         
         /** [-inf..+inf] */
         this.addField_MFFloat(ctx, "linearVelocity", 0, 0, 0);
         
         /** [-inf..+inf] */
         this.addField_MFFloat(ctx, "linearAcceleration", 0, 0, 0);
         
         /** Up to 11 chars. Clamped to 11 */
         this.addField_SFString(ctx, "marking", "Entity");
         
         /** Metainfo node  */
         this.addField_SFNode("metadata", x3dom.nodeTypes.X3DMetadataObject);
         
         /** Send ucast to this, which changes to mcast */
         this.addField_SFString(ctx, "multicastRelayHost", "localhost");
         
         /** Relay port [0..64k] */
         this.addField_SFInt32(ctx, "multicatRelayPort", 0);
         
         /** munition app id [0..64k] */
         this.addField_SFInt32(ctx, "munitionApplicationID", 0);
         
         /** munition end point */
         this.addField_SFVec3f(ctx, "munitionEndPoint", 0, 0, 0);
         
         /** munition entity id [0..64k] */
         this.addField_SFInt32(ctx, "munitionEntityID", 0);
         
         /** munition qty [0..64k] */
         this.addField_SFInt32(ctx, "munitionQuantity", 0);
         
         /** munition site id [0..64k] */
         this.addField_SFInt32(ctx, "munitionSiteID", 0);
         
         /** munition start point */
         this.addField_SFVec3f(ctx, "munitionStartPoint", 0, 0, 0);
         
         /** standalone, networkReader, networkWriter */
         this.addField_SFString(ctx, "networkMode", "networkWriter");
         
         /** port [0..64k] */
         this.addField_SFInt32(ctx, "port", 0);
         
         /** time between network operations (obsolete, really) */
         this.addField_SFTime(ctx, "interval", 0.1);
         
         /** Rotation matrix */
         this.addField_SFRotation(ctx, "rotation", 0, 0, 1, 0);
         
         /** scale */
         this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
         
         /** Scale orientation */
         this.addField_SFRotation(ctx, "scaleOrientation",0, 0, 1, 0  );
         
         /** siteID, part of the entity ID triplet */
         this.addField_SFInt32(ctx, 'siteID', 0);
         
         /** translation */
         this.addField_SFVec3f(ctx, "translation", 0, 0, 0);
         
         /** warhead */
         this.addField_SFInt32(ctx, "warhead", 0);
         
         /** time between network write operations (obsolete, really) */
         this.addField_SFTime(ctx, "writeInterval", 1000);
         
         /** articulation paramter changes */
         this.addField_SFFloat(ctx, "articulationParameterValue0_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue1_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue2_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue3_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue4_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue5_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue6_changed", 0);
         this.addField_SFFloat(ctx, "articulationParameterValue7_changed", 0);
         
         /** collideTime */
         this.addField_SFTime(ctx, "collideTime", 0);
         
         /** detonateTime */
         this.addField_SFTime(ctx, "detonateTime", 0);
         
         /** firedTime */
         this.addField_SFTime(ctx, "firedTime", 0);
         
         /** Various status */
         this.addField_SFBool(ctx, 'isActive', 'false');
         this.addField_SFBool(ctx, 'isCollided', 'false');
         this.addField_SFBool(ctx, 'isDetonated', 'false');
         this.addField_SFBool(ctx, 'isNetworkReader', 'false');
         this.addField_SFBool(ctx, 'isNetworkWriter', 'false');
         this.addField_SFBool(ctx, 'isRtpHeaderHeard', 'false');
         this.addField_SFBool(ctx, 'isStandalone', 'false');
         
         /** Timestap */
         this.addField_SFTime(ctx, "timestamp", 0);
         
         /** bounding boxes */
         this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
         this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);
         
         /** Geodetic system */
         this.addField_MFString(ctx, 'geoSystem', "GD", 'WE' );
         
         /** Real time header expected? Not really relevant any more */
         this.addField_SFBool(ctx, 'rtpHeaderExpected', 'false');
         
         // The values in the X3D file node are directly passed here -- the
         // "default" values above, such as the localCoordinateSystemOrign
         // attribute, are not used, instead the value in the x3D file are
         // in force here.
         
         // Set up internal objects, not visible to XML. These are entirely
         // javascript objects. In this case the network singleton communicates
         // with the server to send and receive DIS. The args don't matter here;
         // the object should have already been created and initialized. I hope.
         //this.network = new NetworkSingleton(null, null);
         this.network = NetworkSingleton.getInstance();
         this.espdu = new x3dom.dis.EntityStatePdu();
         
         this.disWriteIntervalTaskID = 0;
     },
      
     // The implementation object. Thas has function definitions for the Node's API.
     {
          
          fieldChanged: function(fieldName) {
              //x3dom.debug.logWarning("in EspduTransform fieldChanged, field=:", fieldName);
              
              // There's a setInterval task to periodically call disWriteEvent.
              // Cancel the old interval, and set the new interval.
              
              if(fieldName === 'writeInterval' && this._vf.networkMode === 'networkWriter')
              {
                  //x3dom.debug.logWarning("writeInterval value changed");
                  clearInterval(this.disWriteIntervalTaskID);
                  this.disWriteIntervalTaskID = setInterval(function(){self.disWriteEvent(self);}, this._vf.writeInterval);
              }
            },
            
            nodeChanged:function() {
                
                //x3dom.debug.logWarning("in EspduTransform nodeChanged");
                
                this.espdu.entityID.entity = this._vf.entityID;
                this.espdu.entityID.site = this._vf.siteID;
                var applicationID = NetworkSingleton.getInstance().entityManager._vf.applicationID;
                this.espdu.entityID.application = applicationID;
                
                //x3dom.debug.logWarning("state of node in nodeChanged:", this._vf);
                this.espdu.entityType.entityKind = this._vf.entityKind;
                this.espdu.entityType.domain = this._vf.entityDomain;
                this.espdu.entityType.country = this._vf.entityCountry;
                this.espdu.entityType.category = this._vf.entityCategory;
                this.espdu.entityType.subcategory = this._vf.entitySubCategory;
                this.espdu.entityType.spec = this._vf.entitySpecific;
                this.espdu.entityType.extra = this._vf.entityExtra;
                this.espdu.marking.setMarking(this._vf.marking);
                
                //x3dom.debug.logWarning("Entity type after:" ,this.espdu.entityType);
               
               
                var self = this;
                
                // If we are a writer--an entity controlled by this page--we
                // set up a task to periodically write the state to the network
                // via a DIS heartbeat. The logic can get complex here, but network
                // mode should be fairly static, ie it's not changing back and forth
                // between local and network control.
                if(this._vf.networkMode === 'networkWriter')
                {
                  this.disWriteIntervalTaskID = setInterval(function(){self.disWriteEvent(self);}, this._vf.writeInterval);
                  this.network.addLocalEntity(this);
                }
                
                
            },
            
            updateField:function(field, msg) {
               
                //x3dom.debug.logWarning("EsdpudTransform updateField called:", field, ", ", msg);
                // if writeInterval, clear old task using id disUpdateIntervalTaskID and create a new one
            },

           disWriteEvent: function(self) 
           {
               self.network.sendDisUpdate(self);
           }
       }
     )
   );
   
   
