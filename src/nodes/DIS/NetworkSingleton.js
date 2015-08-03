if(typeof x3domDIS === 'undefined')  x3domDIS = {};

/**
 * Singleton pattern for network connection. A single instance of this
 * object should be talking over a web socket back to the server. All
 * ESPDUTransform et al objects should communicate with the server
 * through this object. Use the NetworkSingleton.getInstance() function
 * to retrieve the single, shared instance.<p>
 * 
 * This object is created at a geo-specified location--latitude,
 * longitude, and altitude, specified in degrees and meters. DIS uses a geocentric
 * coordinate system, with the origin at the center of the earth and using the
 * WGS-84 ellipsoid. When a state update arrives the location is transformed
 * to a local coordinate system, with East-North-Up (ENU) for XYZ.<p>
 * 
 * This has a pointer to the DISEntityManager object, which maintains a
 * list of all the entities in the world.<p>
 * 
 * We also have a URL to the websocket server. This is a Websocket TCP
 * socket. A better implementation would abstract this away, so we could
 * use either a websocket or WebRTC for transport, but this would require 
 * some siginficant changes to the X3D DIS spec.
 * 
 * @author DMcG, Byron Harder
 * 
 * @param theUrl URL of the websocket server
 * @param origin array of three floats with lat/lon/alt (degrees and meters)
 * @param entityManager DISEntityManager node, link back to the node that created us
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
   
    // The largest DIS message size that can be sent; this is closely
    // related to the MTU in legacy DIS applications using UDP.
    this.MAX_DIS_MESSAGE_SIZE = 1500;
    
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
     * JSON format EntityID field from the ESPDU. This is a triplet of site, application,
     * and entity ID.
     * */
    this.remoteEntityDatabase = {};

    /** list of all the entities contained on this page, ie that are the source
     * of ESDPU senders. Key is the JSON format EntityID.
     */
    this.localEntityDatabase = {};

    // Listeners, objects that will be notified when a new entity from the network is 
    // heard from.
    this.newRemoteEntityListeners = new Array(0);

    // Open a websocket connection back to the server at the specified URL.
    // Some compatiblity checks for very old browsers that don't support
    // websockets
    if(window.WebSocket)
          this.websocketConnection = new WebSocket(this.url);
      else if(Window.MozWebSocket)
          this.websocketConnection = new MozWebSocket(this.url);
      else
      {
          x3dom.debug.logError("This web browser does not support web sockets.");
          x3dom.debug.logError("Distributed Interactive Simulation (DIS) will not operate.");
      }

      // Set the format we want to use to receive binary messages. This specifies
      // native DIS format
      this.websocketConnection.binaryType = 'arraybuffer';

      // Attach functions to the the web socket for various events. We should
      // re-establish a connection if it closes, perhaps due to a timeout.
      this.websocketConnection.onopen = function(evt){};
      this.websocketConnection.onclose = 
          function(evt)
          { 
              x3dom.debug.logWarning("DIS websocket to server closed"); 
              x3dom.debug.logWarning("Websocket close code: ", evt.code);
              x3dom.debug.logWarning("See http://tools.ietf.org/html/rfc6455#section-7.4.1 for details");
          };

      // Arguably we should try to reconnect with the server if we have a failure
      this.websocketConnection.onerror = 
          function(evt)
          {
              x3dom.debug.logWarning("DIS websocket error: ", evt);
          };

      // The onmessage function is big enough to break out into its own function
      this.websocketConnection.onmessage = 
          function(evt)
          {
              self.onMessage(evt);
          };
};

/**
 * Private method (or should be.) Return an DISEntityTypeMapping tag in the
 * document, given a DIS Entity Type record. If the tag is not matched
 * in the document, undefined is returned.
 * 
 * @param EntityType openDIS entity type record
 * @returns DISEntityTypeMapping tag from the DOM tree, or undefined if not found
 */
NetworkSingleton.prototype.DISEntityTypeMappingTagForEntityType = function(entityType)
{
    // Get a list of all the DISEntityTypeMapping tags in the DOM
    var typeMatchingTags = document.getElementsByTagName("DISEntityTypeMapping");
    var aTag;
        
    for(var idx = 0; idx < typeMatchingTags.length; idx++)
    {
        aTag = typeMatchingTags[idx];
          
        // Retrieve the various field values from the entity type record.
        // Note that these are in string format and we'll need to convert
        // these to numerics.
        var etype = new dis.EntityType();
        var kind = aTag.getAttribute("kind");
        var domain = aTag.getAttribute("domain");
        var country = aTag.getAttribute("country");
        var category = aTag.getAttribute("category");
        var subcategory = aTag.getAttribute("subcategory");
        var specific = aTag.getAttribute("specific");
        //var extra = aTag.getAttribute("extra");
        var url = aTag.getAttribute("url");
        var matchFound = false;
        
        if(entityType.entityKind === parseInt(kind) &&
           entityType.domain === parseInt(domain) &&
           entityType.country === parseInt(country) &&
           entityType.category === parseInt(category) &&
           entityType.subcategory === parseInt(subcategory) &&
           entityType.spec === parseInt(specific))
           //entityType.extra === parseInt(extra) )
           {
                matchFound = true;
                break;
           };
    };
    
    if(!matchFound)
    {
        x3dom.debug.logWarning("No match found for DIS entity type ", entityType);
        return null;
    }
    
    return aTag;   
}
/** 
 * A DIS entity type is a record of arbitrary (but known) numbers that 
 * correspond to one piece of military hardware--a type of tank, like a T-72,
 * M1A2, F-16, whatever. The document should contain EntityTypeMapping 
 * tags that match an enitity type to a URL at which we can retrieve the
 * 3D model.<p>
 * 
 * Searches for an exact match on the entity type in all the tags available
 * for "DISEntityTypeMapping". Returns the URL of the 3D model for the matching
 * entity type, or null if not found.<p>
 * 
 * Note that it is easy for the EntityType to be just _slightly_ off and miss
 * a match. This needs to be thought about more carefully.<p>
 * 
 * @param {entityType} entityType from the EBV document
 * @returns {URL} URL to retrieve the 3D model for the entity type specified, or null if not found
 */
NetworkSingleton.prototype.urlForEntityType = function(entityType)
{    
    var aTag = this.DISEntityTypeMappingTagForEntityType(entityType);
    
    if( aTag != null )
    {
        return aTag.getAttribute("url");
    }
    
    return null;
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
    var entityIDString = ":" + entityID.site + ":" + entityID.application + ":" + entityID.entity;
    var aTag = this.DISEntityTypeMappingTagForEntityType(entityType);
    
    if(aTag != null)
    {
        return aTag.getAttribute("name") + entityIDString;
    }
    
    return "Unknown Entity Type" + entityIDString;   
}
 
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
              this.firePduReceived(pdu);
              break;

          default: // All other PDU types
             x3dom.debug.logWarning("PDU type not handled. type=", pdu.PduType, " name=", pdu.constructor.name); 
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
      
      // If we haven't heard of this entity before, create a new one.
      // This includes inserting a new EspduTransform node into the
      // document.
      if(typeof matchingEntity === 'undefined')
      {
          newEntityFound = true;
          matchingEntity = this.addNewEspduTransformNode(anEspdu);
          this.remoteEntityDatabase[jsonEid] = matchingEntity;
      }
     
      // Convert to local coordinate system. "ECEF" refers to earth-centered, earth-fixed,
      // a cartesian coordinate system that rotates with the earth with the origin at
      // the center of the earth, x pointing out at the equator and prime meridian,
      // y pointing out at the equator and 90 deg east, and z through the north pole.
      // ENU refers to east-north-up, for the XYZ coordinate axes, respectively. 
      // localCoordinates refers to the local x3d coordinate system, with the origin
      // at the location specified, x-axis pointing east, y-axis pointing north, and
      // z-axis pointing up.
      var localCoordinates = this.rangeCoordinates.ECEFtoENU(anEspdu.entityLocation.x, anEspdu.entityLocation.y, anEspdu.entityLocation.z);
      
      // Get the latitude, longitude, and elevation of the entity's location.
      var latLon = this.rangeCoordinates.ECEFObjectToLatLongAltInDegrees(anEspdu.entityLocation);
      
      // Set the position of the graphics object in local coordinates
      var graphicsGeometry = matchingEntity.transformNode;
      graphicsGeometry.setAttribute("translation", localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);
      
      // If this entity wasn't heard of before, notify a list of objects that are
      // interested in that event.
      if(newEntityFound === true)
      {
          this.notifyNewEntityListeners(anEspdu);
      }
  };
  
   /**
   * A fire pdu has been received from the server over the websocket. Process
   * it by creating a red line (actually a long, thin cylinder) from shooter to 
   * target as a child node of the shooter . Schedule deletion of the visualization
   * a short time into the future.
   * 
   * This is currently a copy of the espduReceived code, and needs to be 
   * modified for firepdu logic. 
   * 
   * @param {EntityStatePdu} aFirepdu
   * @returns {undefined}
   */
  NetworkSingleton.prototype.firePduReceived = function(aFirepdu)
  {
      // The string index into the database
      var jsonEid = JSON.stringify(aFirepdu.firingEntityID);
      var matchingEntity = this.remoteEntityDatabase[jsonEid];
      //console.log("Received fire pdu:  ", aFirepdu);

      // If we don't have the firing entity, we can't animate the shot
      if(typeof matchingEntity === 'undefined')
      {
          return;
      }

      // Draw the shot line segment using firingEntity, velocity, and range.
      // Line orientation is from the normalized velocity.
      // Line segment length equals range.
      // Translated half the range in the velocity direction so it appears to
      // originate at the firer and terminate at the given range.
      var root = document.getElementById('networkEntities');
      var graphicsGeometry = matchingEntity.transformNode;
      var shotLine = document.createElement("transform");
      //get the velocity in local coordinates:
      var vECEF = aFirepdu.velocity;
      var locECEF = matchingEntity.espdu.entityLocation;
      var impactPointECEF = {x:vECEF.x+locECEF.x, y:vECEF.y+locECEF.y, z:vECEF.z+locECEF.z};
      //console.log("DIS coords impact point: ", impactPointECEF);
      var impactPointENU = this.rangeCoordinates.ECEFObjectToENU(impactPointECEF);
      impactPointENU.z = 10; //clamp to just above sea level
      //console.log("Local coords impact point: ", impactPointENU);
      var matchingEntityLocation = x3dom.fields.SFVec3f.parse(graphicsGeometry.getAttribute("translation"));
      matchingEntityLocation.z = 10; //clamp to just above sea level
      var velocityVector = new x3dom.fields.SFVec3f(impactPointENU.x-matchingEntityLocation.x, impactPointENU.y-matchingEntityLocation.y, impactPointENU.z-matchingEntityLocation.z);
      //console.log("Local coords velocity: ", velocityVector);
      var translationVector = velocityVector.normalize().multiply(aFirepdu.rangeToTarget/2);
      //console.log("Local coords translation: ", translationVector);
      worldTranslation = translationVector.add(matchingEntityLocation);
      shotLine.setAttribute("translation", worldTranslation.toString());
      var defaultCylinderDirVector = new x3dom.fields.SFVec3f(0, 1, 0); //oriented on y axis according to XML standard
      var axisAngle = x3dom.fields.Quaternion.rotateFromTo(defaultCylinderDirVector, velocityVector).toAxisAngle();
      shotLine.setAttribute("rotation", axisAngle[0].toString() + " " + axisAngle[1]);
      var shape = document.createElement("shape");
      var appearance = document.createElement("appearance");
      var material = document.createElement("material");
      material.setAttribute("diffuseColor", "1 0 0"); //red
      material.setAttribute("transparency", "0.25");
      var cylinder = document.createElement("cylinder");
      cylinder.setAttribute("height", aFirepdu.rangeToTarget);
      // we need to do better than a hard-coded radius. Should be scaled by model size:
      cylinder.setAttribute("radius", 5);
      shotLine.appendChild(shape);
      shape.appendChild(appearance);
      appearance.appendChild(material);
      shape.appendChild(cylinder);
      // remember this for later deletion:
      root.appendChild(shotLine);

      //Schedule deletion of the shot line
      function killShotLine(root, shotLine) { root.removeChild(shotLine); }
      setTimeout(function() { killShotLine(root, shotLine) }, 2000);

      // Notify a list of objects that are
      // interested in the fire event.
      this.notifyNewEntityListeners(aFirepdu);
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
      }
      
  };
        
/**
 * Sends a DIS update from the EspduTransformNode specified.<p>
 * 
 * @param {type} espduTransformNode The EspduTransformNode sending an update
 * @returns {undefined} void
 */
NetworkSingleton.prototype.sendDisUpdate = function(espduTransformNode)
{          
    var dataBuffer = new ArrayBuffer(this.MAX_DIS_MESSAGE_SIZE);
    var os = new dis.OutputStream(dataBuffer);
    espduTransformNode.espdu.entityID.application = this.entityManager._vf.applicationID;

    // Encode it to the DIS binary format, then trim it down to actual
    // size, which may be smaller than max size
    espduTransformNode.espdu.encodeToBinaryDIS(os);
    var trimmedData = dataBuffer.slice(0, os.currentPosition);
    this.websocketConnection.send(trimmedData);
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
    var entityIDString = ":" + entityID.site + ":" + entityID.application + ":" + entityID.entity;
    var aTag = this.DISEntityTypeMappingTagForEntityType(entityType);
    
    if(aTag != null)
    {
        return aTag.getAttribute("name") + entityIDString;
    }
    
    return "Unknown Entity Type" + entityIDString;   
}
  
/**
 * Adds a new EspduTransform node to the scenegraph as a result of a 
 * new entity from the network being heard from
 * 
 * @param {type} espdu from a newly discovered entity from the network
 * @returns {entity} object with properties of espdu, x3d espdu transform node, and date last heard from
 */
NetworkSingleton.prototype.addNewEspduTransformNode = function(espdu)
{
    // TO DO: create an EspduTransform node via a standard constructor,
    // which this is not. 
    x3dom.debug.logWarning("Creating new EspudTransform node for entity ID", espdu.entityID);
    
    var newEspduTransformNode = document.createElement("EspduTransform");
    newEspduTransformNode.setAttribute("networkMode", "reader");
    newEspduTransformNode.setAttribute("siteID", espdu.entityID.site);
    newEspduTransformNode.setAttribute("applicationID", espdu.entityID.application);
    newEspduTransformNode.setAttribute("entityID", espdu.entityID.entity);
    
    var displayName = this.displayName(espdu.entityType, espdu.entityID);
    var url = this.urlForEntityType(espdu.entityType);

    if(url == null)
    {
        x3dom.debug.logError("Cannot find a matching EntityType record URL for ", espdu.entityType);
        x3dom.debug.logError("");
        x3dom.debug.logError("Using a temporary URL of models/PirateMotherSkiff.x3d");
        url = "models/PirateMotherSkiff.x3d";
    }
    var transform = document.createElement("transform");

    // Convert from global (earth-centered) coordinates 
    var localCoordinates = this.rangeCoordinates.ECEFtoENU(espdu.entityLocation.x, 
                                                           espdu.entityLocation.y, 
                                                           espdu.entityLocation.z);

    //we'll need a unique DEF to connect animation routes to each other
    var transformDEF = displayName + ":transform";
    transform.setAttribute("DEF", transformDEF);
    
    // geotranslation to local coords
    transform.setAttribute("translation", localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);

    transform.setAttribute("scale", 1 + " " + 1 + " " + 1);
    transform.setAttribute("rotation", "1 0 0 1.570796"); //orient to xy plane
    //a hack until ESPDUtransform and transform are the same object:
    transform.setAttribute("forceID", espdu.forceID);

    var innerTransform = document.createElement("transform");
    var inlineModel = document.createElement("inline");
    inlineModel.setAttribute("url", url);
    var shape = document.createElement("Shape");
    var appearance = document.createElement("Appearance");
    var material = document.createElement("Material");
    material.setAttribute("diffuseColor", "0.603 0.1 0.1");
    var box = document.createElement("Box");

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

    // Create a new "entity" object, with properties for the last time
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
 * This is the approved way to get an instance of the singleton object. It's actually
 * created elsewhere, in DISEntityManager.
 */
NetworkSingleton.getInstance = function()
{
    if(NetworkSingleton.prototype._singletonInstance === undefined)
    {
        x3dom.debug.logError("Attempting to retrieve network singleton before it was constructed");
        return;
    }
    return NetworkSingleton.prototype._singletonInstance;
};