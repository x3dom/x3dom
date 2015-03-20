if(typeof x3domDIS === 'undefined')  x3domDIS = {};

/**
 * Singleton pattern for network connection. A single instance of this
 * object should be talking over a web socket back to the server. All
 * ESPDUTransform et al objects should communicate with the server
 * through this object. Use the NetworkSingleton.getInstance() function
 * to retrieve the single, shared instance.<p>
 
 * 
 * @param theUrl URL of the websocket server
 * @param origin array of three floats with lat/lon/alt (degrees and meters)
 * @param entityManager DISEntityManager node, link back to the node that created us
 * @returns {Array.callee._singletonInstance|NetworkSingleton.arguments.callee._singletonInstance|Function._singletonInstance}
 */
function NetworkSingleton(theUrl, origin, entityManager)
{
    //console.log("Retrieving singleton instance of NetworkSingleton");
    
    if(NetworkSingleton.prototype._singletonInstance)
    {
        //console.log("Returing already created instance of NetworkSingleton");
        return NetworkSingleton.prototype._singletonInstance;
    }
    
    
    NetworkSingleton.prototype._singletonInstance = this;
    
        //console.log("Returning new instance of NetworkSingleton ", NetworkSingleton.prototype);

 
 // This doesn't work in strict mode
 /*
    if ( arguments.callee._singletonInstance )
 {
     return arguments.callee._singletonInstance;
 }
  arguments.callee._singletonInstance = this;
  var self = this;
    */
   
  /** URL of the server we communicate with */
  this.url = theUrl;
  var self = this;
  
  /** The entity manager, which keeps track of entities, their location, etc.*/
  this.entityManager = entityManager;
  
  /** The origin of the local coordinate system, in lat/lon/alt, degrees and meters */
  this.localCoordinateSystemOrigin = origin;
  
  /** Factory object for converting binary data to Javascript DIS objects */
  this.pduFactory = new dis.PduFactory(); 
    
  /** The rangeCoordinates object converts to and from DIS global coordinates 
   * (origin at center of earth) to local coordinates (relative to a rectilinear
   * origin at a lat/lon/alt).
   * */
  this.rangeCoordinates = new dis.RangeCoordinates(origin[0], origin[1], origin[2]);
  
  /** array of all the entities external to this page we have heard from. Key is the
   * JSON format EntityID.
   * */
  this.remoteEntityDatabase = {};
  
  /** list of all the entities contained on this page, ie that are the source
   * of ESDPU senders. Key is the JSON format EntityID.
   */
  this.localEntityDatabase = {};
  
  /** Listeners, objects that will be notified when a new entity from the network is 
   * heard from.
   */
  this.newRemoteEntityListeners = new Array(0);
 

  if(window.WebSocket)
        this.websocketConnection = new WebSocket(this.url);
    else if(Window.MozWebSocket)
        this.websocketConnection = new MozWebSocket(this.url);
    else
        console.log("****This web browser does not support web sockets");
        
    // Set the format we want to use to receive binary messages
    this.websocketConnection.binaryType = 'arraybuffer';
    
    // Attach functions to the the web socket for various events. We should
    // re-establish a connection if it closes, perhaps due to a timeout.
    this.websocketConnection.onopen = function(evt){/*console.log("Websocket onopen");*/};
    this.websocketConnection.onclose = function(evt){/*console.log("Websocket onclose");*/};
    
    // Arguably we should try to reconnect with the server if we have a failure
    this.websocketConnection.onerror = function(evt){/*console.log("Websocket onerror");*/};
    
    // The onmessage function is big enough to break out into its own function
    this.websocketConnection.onmessage = function(evt){self.onMessage(evt);};
};

/** 
 * Searches for an exact match on the entity type in all the tags available
 * for "DISEntityTypeMapping". Returns the URL of the 3D model for the matching
 * entity type.
 * 
 * Note that it is easy for the EntityType to be just _slightly_ off and miss
 * a match. This needs to be thought about more carefully.
 * 
 * @param {entityType} entityType from the EBV document
 * @returns {URL} URL to retrieve the 3D model for the entity type specified
 */
NetworkSingleton.prototype.urlForEntityType = function(entityType)
{
    //console.log("in urlForEntityType");
    
    var typeMatchingTags = document.getElementsByTagName("DISEntityTypeMapping");
    var matchingUrl;
    //console.log(typeMatchingTags);
    
    for(var idx = 0; idx < typeMatchingTags.length; idx++)
    {
        
        aTag = typeMatchingTags[idx];
        
        //console.log("Tag:", aTag, " entity type:", entityType);
           
        var etype = new dis.EntityType();
        
        var kind = aTag.getAttribute("kind");
        var domain = aTag.getAttribute("domain");
        var country = aTag.getAttribute("country");
        var category = aTag.getAttribute("category");
        var subcategory = aTag.getAttribute("subcategory");
        var specific = aTag.getAttribute("specific");
        var extra = aTag.getAttribute("extra");
        var url = aTag.getAttribute("url");
        var matchFound = false;
       
       /*
       console.log("entityKind:", entityType.entityKind, ", ", kind);
        if(entityType.entityKind === parseInt(kind))
            console.log("match on kind");
        
        console.log("domain:", entityType.domain, ", ", domain);
        if(entityType.domain === parseInt(domain))
            console.log("match on domain");
        
        console.log("country:", entityType.country, ", ", country);
        if(entityType.country === parseInt(country))
            console.log("match on country");
        
        console.log("category:", entityType.category, ", ", category);
        if(entityType.category === parseInt(category))
            console.log("match on category");
        
        console.log("subcategory:", entityType.subcategory, ", ", subcategory);
        if(entityType.subcategory === parseInt(subcategory))
            console.log("match on subcategory");
        
        console.log("specific:", entityType.spec, ", ", specific);
        if(entityType.spec === parseInt(specific))
            console.log("match on specific");
        
        console.log("extra:", entityType.extra, ", ", extra);
        if(entityType.extra === parseInt(extra))
            console.log("match on extra");
        */
        
        if(entityType.entityKind === parseInt(kind) &&
           entityType.domain === parseInt(domain) &&
           entityType.country === parseInt(country) &&
           entityType.category === parseInt(category) &&
           entityType.subcategory === parseInt(subcategory) &&
           entityType.spec === parseInt(specific) &&
           entityType.extra === parseInt(extra) )
           {
                matchFound = true;
                matchingUrl = url;
                break;
           };
    };
    
    //console.log("Returning URL", matchingUrl, " for entity type " + entityType);
    return matchingUrl;
};
  
/** 
 * Builds a string using the name from the DISEntityTypeMapping and the entityID fields.
 * 
 * @param {entityType} entityType from the EBV document
 * @param {entityID} entityID {site:application:entity} from the espdu
 * @returns unique name for display in table of entities
 */
NetworkSingleton.prototype.displayName = function(entityType, entityID)
{
    //console.log("in displayName");
    
    var typeString = "Unknown Entity Type";
    var entityIDString = ":" + entityID.site + ":" + entityID.application + ":" + entityID.entity;
    
    var typeMatchingTags = document.getElementsByTagName("DISEntityTypeMapping");
    //console.log(typeMatchingTags);
    
    for(var idx = 0; idx < typeMatchingTags.length; idx++)
    {
        
        aTag = typeMatchingTags[idx];
        
        //console.log("Tag:", aTag, " entity type:", entityType);
           
        var etype = new dis.EntityType();
        
        var kind = aTag.getAttribute("kind");
        var domain = aTag.getAttribute("domain");
        var country = aTag.getAttribute("country");
        var category = aTag.getAttribute("category");
        var subcategory = aTag.getAttribute("subcategory");
        var specific = aTag.getAttribute("specific");
        var extra = aTag.getAttribute("extra");
        var matchFound = false;
       
       /*
       console.log("entityKind:", entityType.entityKind, ", ", kind);
        if(entityType.entityKind === parseInt(kind))
            console.log("match on kind");
        
        console.log("domain:", entityType.domain, ", ", domain);
        if(entityType.domain === parseInt(domain))
            console.log("match on domain");
        
        console.log("country:", entityType.country, ", ", country);
        if(entityType.country === parseInt(country))
            console.log("match on country");
        
        console.log("category:", entityType.category, ", ", category);
        if(entityType.category === parseInt(category))
            console.log("match on category");
        
        console.log("subcategory:", entityType.subcategory, ", ", subcategory);
        if(entityType.subcategory === parseInt(subcategory))
            console.log("match on subcategory");
        
        console.log("specific:", entityType.spec, ", ", specific);
        if(entityType.spec === parseInt(specific))
            console.log("match on specific");
        
        console.log("extra:", entityType.extra, ", ", extra);
        if(entityType.extra === parseInt(extra))
            console.log("match on extra");
        */
        
        if(entityType.entityKind === parseInt(kind) &&
           entityType.domain === parseInt(domain) &&
           entityType.country === parseInt(country) &&
           entityType.category === parseInt(category) &&
           entityType.subcategory === parseInt(subcategory) &&
           entityType.spec === parseInt(specific) &&
           entityType.extra === parseInt(extra) )
           {
                matchFound = true;
                typeString = aTag.getAttribute("name");        
                break;
           };
    };
    
    //console.log("Returning URL", matchingUrl, " for entity type " + entityType);
    return typeString + entityIDString;
};

  
  /**
   * An object that should be informed when a new message from the server arrives.
   * @param {object} listener
   * @returns {undefined}
   */
  NetworkSingleton.prototype.registerNewEntityListener = function(listener)
  {
      this.newRemoteEntityListeners.push(listener);
  };
  
  /**
   * Remove a listener object, so that it is no longer informed when a message arrives
   * 
   * @param {object} listener
   * @returns {undefined}
   */
  NetworkSingleton.prototype.unregisterNewEntityListener = function(listener)
  {

      for(var idx = 0; idx < this.newRemoteEntityListeners.length; idx++)
      {
          if(this.newRemoteEntityListeners[idx] === listener)
          {
              this.newRemoteEntityListeners.slice(idx);
              //console.log("unregistered new remote entity listener");
              break;
          };        
      };
  };
  
  /**
   * Notify all listeners that a DIS message has arrived, and hand off the PDU.
   * 
   * @param {type} aPdu
   * @returns {undefined}
   */
  NetworkSingleton.prototype.notifyNewEntityListeners = function(aPdu)
  {
      for(idx = 0; idx < this.newRemoteEntityListeners.length; idx++)
      {
          this.newRemoteEntityListeners[idx].newEntityFound(aPdu);
      };
  };
  
  /**
   * An espdu has been received from the server over the websocket. Process
   * it by checking to see if that entity already exists. If it does not,
   * create an entity that corresponds to it and add it to our database
   * of entities.
   * 
   * @param {EntityStatePdu} anEspdu
   * @returns {undefined}
   */
  NetworkSingleton.prototype.espduReceived = function(anEspdu)
  {
      // The string index into the database
      var jsonEid = JSON.stringify(anEspdu.entityID);
      var newEntityFound = false;
      var matchingEntity;
      
      matchingEntity = this.remoteEntityDatabase[jsonEid];
      
      // If we haven't heard of this entity before, create a new one
      if(typeof matchingEntity === 'undefined')
      {
          console.log("**********Adding new espduTransfrom in reponse to msg from network ", anEspdu, " Pre addition database is ", this.remoteEntityDatabase);
          newEntityFound = true;
          matchingEntity = this.addNewEspduTransformNode(anEspdu);
          this.remoteEntityDatabase[jsonEid] = matchingEntity;
      }
      
      // Figure out how much time passed since last espdu
      var oldLastHeardFrom = matchingEntity.lastHeardFrom;
      matchingEntity.lastHeardFrom = new Date();
      var interarrivalTime = matchingEntity.lastHeardFrom - oldLastHeardFrom;
      
      //Get the previous location for this entity
      var oldLocation = matchingEntity.location;
     
      // Convert to local coordinate system. "ECEF" refers to earth-centered, earth-fixed,
      // a cartesian coordinate system that rotates with the earth with the origin at
      // the center of the earth, x pointing out at th equator and prime meridian,
      // y pointing out at the equator and 90 deg east, and z through the north pole.
      // ENU refers to east-north-up, for the XYZ coordinate axes, respectively. 
      // localCoordinates refers to the local x3d coordinate system, with the origin
      // at the location specified, x-axis pointing east, y-axis pointing north, and
      // z-axis pointing up.
      var localCoordinates = this.rangeCoordinates.ECEFtoENU(anEspdu.entityLocation.x, anEspdu.entityLocation.y, anEspdu.entityLocation.z);
      //Temporary ground-clamping hack: zero the altitude
      localCoordinates.z = 0.0;
      
      // Get the latitude, longitude, and elevation of the entity's location.
      var latLon = this.rangeCoordinates.ECEFObjectToLatLongAltInDegrees(anEspdu.entityLocation);
      
      // Set the orientation of the graphics object.
      // For now, we ignore the DIS orientation, and just base it on previous and new x/y values
      var moveVector = new x3dom.fields.SFVec2f(
          localCoordinates.x - oldLocation.x,
          localCoordinates.y - oldLocation.y
          );
      var rotation = Math.acos(moveVector.normalize().x);
      if(moveVector.y < 0) rotation = Math.PI + (Math.PI - rotation);
      //console.log("Movement vector (" + moveVector.x + ", " + moveVector.y + ")");
      //console.log("  Normalized x: " + moveVector.normalize().x);
      //console.log("  Setting rotation: " + rotation);
      // Find all inner transforms and set the xy rotation
      var graphicsGeometry = matchingEntity.transformNode;
      var innerChild = {};
      for (var childIndex in graphicsGeometry.children) {
          innerChild = graphicsGeometry.children[childIndex];
          if (innerChild.tagName === "TRANSFORM") {
              innerChild.setAttribute("rotation", "0 1 0 " + rotation);
          }
      }
      
      // Set the position of the graphics object in local coordinates
      //   to the previous location so it can be animated to the new one
        graphicsGeometry.setAttribute("translation", 
            matchingEntity.location.x + " " + 
            matchingEntity.location.y + " " + 
            matchingEntity.location.z + " ");
      
      //Animate the entity from its last position to the newly received position.
      //  This approach incurs a delay corresponding to 1 ESPDU interarrival time.
      //We have to disable the timeSensor first--it'll ignore inputs if active
      matchingEntity.timeSensorNode.setAttribute("enabled", "false");
      //Reset the time sensor (Date is in milliseconds and timeSensor expects seconds)
      matchingEntity.timeSensorNode.setAttribute("cycleInterval", interarrivalTime/1000);
      //Restart the time sensor
      matchingEntity.timeSensorNode.setAttribute("startTime", new Date()/1000);
      matchingEntity.timeSensorNode.setAttribute("enabled", "true");
      /*
      console.log("enabled: " + matchingEntity.timeSensorNode.getAttribute("enabled"));
      console.log("startTime: " + matchingEntity.timeSensorNode.getAttribute("startTime"));
      console.log("stopTime: " + matchingEntity.timeSensorNode.getAttribute("stopTime"));
      console.log("cycleInterval: " + matchingEntity.timeSensorNode.getAttribute("cycleInterval"));
      console.log("elapsedTime: " + matchingEntity.timeSensorNode.getAttribute("elapsedTime"));
      console.log("fractionChanged: " + matchingEntity.timeSensorNode.getAttribute("fractionChanged"));
      console.log("isActive: " + matchingEntity.timeSensorNode.getAttribute("isActive"));
      */
      matchingEntity.positionInterpolatorNode.setAttribute("keyValue", 
            graphicsGeometry.getAttribute("translation") + " " +
            localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);
      
      
      
      //Update the most recent espdu and location
      matchingEntity.espdu = anEspdu;
      matchingEntity.location = localCoordinates;
      
      // If this entity wasn't heard of before, notify a list of objects that are
      // interested in that event.
      if(newEntityFound === true)
      {
          this.notifyNewEntityListeners(anEspdu);
      }
  };
  
  /**
   * Adds a local entity, ie the entity identified by a local espdu node. The
   * espduTransformNode should have the "networkWriter" mode turned on for
   * the attribute "networkMode". This signifies that the entity is being
   * controlled from the web page, not being dynamically loaded in response
   * to messages from off-page.<p>
   * 
   * @param {espduTransformNode} espduTransformNode the node that has been added
   */
  NetworkSingleton.prototype.addLocalEntity = function(espduTransformNode)
  {
      var jsonEid = JSON.stringify(espduTransformNode.espdu.entityID);
      
      // Not present? Add it to the list of local entities. Otherwise no-op.
      
      if(typeof this.localEntityDatabase[jsonEid] === 'undefined')
      {
          this.localEntityDatabase[jsonEid] = espduTransformNode;
          //console.log("adding local entity ", jsonEid);
      }
      
  };
  
  /**
   * Received message from web socket server. Turn it into a Javascript PDU
   * and do something with it.
   * @param {type} evt The message from the server. Contains a binary format DIS message.
   * @returns {undefined}
   */
  NetworkSingleton.prototype.onMessage = function(evt)
  {      
      // convert from binary to javascript object
      var pduFactory = new dis.PduFactory();
      var pdu = pduFactory.createPdu(evt.data);
      
      console.log("Recieved PDU from server");
      
      // If the factory can't correctly decode the message it will return null.
      // Really, the only option is to throw up our hands and punt.
      if(pdu === null)
          return;
         
      switch(pdu.pduType)
      {
          case 1: // Entity State PDU
              this.espduReceived(pdu);
              break;
              
          case 2:  // Fire PDU
              //console.log("Got fire PDU");
              break;
              
          case 3: // Detonation PDU
              //console.log("Got detonation PDU");
              break;
              
          default: //console.log("Got PDU of type ", pdu.pduType);
      
      };
  };
        
      /**
       * 
       * @param {type} espduTransformNode The EspduTransformNode sending an update
       * @returns {undefined} void
       */
      NetworkSingleton.prototype.sendDisUpdate = function(espduTransformNode)
      {          
          var dataBuffer = new ArrayBuffer(1500);
          var os = new dis.OutputStream(dataBuffer);
          espduTransformNode.espdu.entityID.application = this.entityManager._vf.applicationID;
          
          espduTransformNode.espdu.encodeToBinaryDIS(os);
          var trimmedData = dataBuffer.slice(0, os.currentPosition);
          this.websocketConnection.send(trimmedData);
          //console.log("Sent espdu from entity", espduTransformNode.espdu.entityID);
       };
       
       /**
        * Test code, not used.
        * 
        * @returns {undefined}
        */
       NetworkSingleton.prototype.addSimpleBox = function()
       {
         x = Math.random() * 6 - 3;
         y = Math.random() * 6 - 3;
         z = Math.random() * 6 - 3;

         s0 = Math.random() + 0.5;
         s1 = Math.random() + 0.5;
         s2 = Math.random() + 0.5;
                
        var t = document.createElement('Transform');
        t.setAttribute("translation", x + " " + y + " " + z );
        t.setAttribute("scale", s0 + " " + s1 + " " + s2 );
        var s = document.createElement('Shape');
		
		// Appearance Node
		var app = document.createElement('Appearance');
		
		// Material Node
		var mat = document.createElement('Material');
		
		app.appendChild(mat);
		
		s.appendChild(app);
		
        t.appendChild(s);
        var b = document.createElement('Box');
        s.appendChild(b);
        
        var ot = document.getElementById('networkEntities');
        ot.appendChild(t);
        };
        
       /**
        * Adds a new EspduTransform node to the scenegraph as a result of a 
        * new entity from the network being heard from
        * 
        * @param {type} espdu from a newly discovered entity from the network
        * @returns {entity} object with properties of espdu, x3d espdu transform node, and date last heard from
        */
       NetworkSingleton.prototype.addNewEspduTransformNode = function(espdu)
       {
           var newEspduTransformNode = document.createElement("EspduTransform");
           var displayName = this.displayName(espdu.entityType, espdu.entityID);
           newEspduTransformNode.setAttribute("networkMode", "reader");
           newEspduTransformNode.setAttribute("siteID", espdu.entityID.site);
           newEspduTransformNode.setAttribute("applicationID", espdu.entityID.application);
           newEspduTransformNode.setAttribute("entityID", espdu.entityID.entity);
           newEspduTransformNode.setAttribute("displayName", displayName);
           
           //console.log("newly created espdu transform node:", newEspduTransformNode);
           //newEspduTransformNode.espdu.entityType = espdu.entityType;
          
           var url = this.urlForEntityType(espdu.entityType);
           
           var transform = document.createElement("transform");
           
           //we'll need a unique DEF to connect animation routes to each other
           var transformDEF = displayName + ":transform";
           transform.setAttribute("DEF", transformDEF);

           // Convert from global (earth-centered) coordinates 
           var localCoordinates = this.rangeCoordinates.ECEFtoENU(espdu.entityLocation.x, 
                                                                  espdu.entityLocation.y, 
                                                                  espdu.entityLocation.z);
           
           //console.log("Entity position in local coordinates:", localCoordinates);
           // The right way is to do geotranslation to local coords, as here. For debugging
           // we add it near the origin.
           transform.setAttribute("translation", localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);
           //transform.setAttribute("translation", 3 + Math.random(), " ", 2 + Math.random(), " ", 4 + Math.random() );
         
           transform.setAttribute("scale", 1 + " " + 1 + " " + 1);
           //for debugging:
           //transform.setAttribute("scale", 10 + " " + 10 + " " + 10);
           transform.setAttribute("rotation", "1 0 0 1.570796"); //orient to xy plane
           
           //console.log(transform);
           var innerTransform = document.createElement("transform");
           var inlineModel = document.createElement("inline");
           inlineModel.setAttribute("url", url);
           var shape = document.createElement("Shape");
           var appearance = document.createElement("Appearance");
           var material = document.createElement("Material");
           material.setAttribute("diffuseColor", "0.603 0.1 0.1");
           var box = document.createElement("Box");
           
           //var modelUrl = this.urlForEntityType(espdu.entityType);
           //console.log("Have model of ", modelUrl, ' for entityType', espdu.entityType);
           
           // The following elements will be used to animate the entity from one point to the next
           // Time sensor will tell the pos interpolator how much time has passed
           var timeSensor = document.createElement("timeSensor");
           var timeSensorDEF = displayName + ":timeSensor";
           timeSensor.setAttribute("DEF", timeSensorDEF);
           timeSensor.setAttribute("loop", "false");
           // Pos interpolator will tell the transform how far it has moved
           var positionInterpolator = document.createElement("PositionInterpolator");
           var positionInterpolatorDEF = displayName + ":positionInterpolator";
           positionInterpolator.setAttribute("DEF", positionInterpolatorDEF);
           positionInterpolator.setAttribute("key", "0 1");
           //initial value is (x y z) to (x y z) i.e. zero velocity
           positionInterpolator.setAttribute("keyValue", 
                localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z + " " +
                localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);
           //route the time sensor output to the pos interpolator
           var timePosRoute = document.createElement("Route");
           timePosRoute.setAttribute("DEF", displayName + ":timePosRoute");
           timePosRoute.setAttribute("fromNode", timeSensorDEF);
           timePosRoute.setAttribute("fromField", "fraction_changed");
           timePosRoute.setAttribute("toNode", positionInterpolatorDEF);
           timePosRoute.setAttribute("toField", "set_fraction");
           //route the pos interpolator output to the transform
           var posTransformRoute = document.createElement("Route");
           posTransformRoute.setAttribute("DEF", displayName + ":posTransformRoute");
           posTransformRoute.setAttribute("fromNode", positionInterpolatorDEF);
           posTransformRoute.setAttribute("fromField", "value_changed");
           posTransformRoute.setAttribute("toNode", transformDEF);
           posTransformRoute.setAttribute("toField", "translation");           

           appearance.appendChild(material);
           shape.appendChild(appearance);
           shape.appendChild(box);
           innerTransform.appendChild(inlineModel);
           transform.appendChild(innerTransform);
 
           // The espduTransform constructor doesn't fire until it's added
           // to the document
           var root = document.getElementById('networkEntities');
           //console.log("Root node for added networked entities is ", root);
           root.appendChild(newEspduTransformNode);
           //newEspduTransformNode.addChild(transform);
           //once the following works, try putting these all inside the transform
           //  to make it easier to delete them
           root.appendChild(transform);
           root.appendChild(timeSensor);
           root.appendChild(positionInterpolator);
           root.appendChild(timePosRoute);
           root.appendChild(posTransformRoute);
           
           
           // Crete a new "entity" object, with properties for the last time
           // it was heard from, the last espdu received, and the graphics
           // associated with the object.
           var newEntity = {};
           newEntity.espdu = espdu;
           newEntity.espduTransformNode = newEspduTransformNode;
           newEntity.transformNode = transform;
           newEntity.timeSensorNode = timeSensor;
           newEntity.positionInterpolatorNode = positionInterpolator;
           newEntity.timePosRouteNode = timePosRoute;
           newEntity.posTransformRouteNode = posTransformRoute;
           newEntity.location = localCoordinates;           
           
           return newEntity;
       };
       
       NetworkSingleton.getInstance = function()
       {
           if(NetworkSingleton.prototype._singletonInstance === undefined)
           {
               console.log("***** attempting to retrieve network singleton before it is constructed");
               return;
           }
           return NetworkSingleton.prototype._singletonInstance;
       };