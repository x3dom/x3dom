if(typeof x3domDIS === 'undefined')  x3domDIS = {};

/**
 * Singleton pattern for network connection. A single instance of this
 * object should be talking over a web socket back to the server. All
 * ESPDUTransform et al objects should communicate with the server
 * through this object.<p>
 * 
 * @param theUrl URL of the websocket server
 * @param origin array of three floats with lat/lon/alt (degrees and meters)
 * @param entityManager DISEntityManager node, link back to the node that created us
 * @returns {Array.callee._singletonInstance|NetworkSingleton.arguments.callee._singletonInstance|Function._singletonInstance}
 */
function NetworkSingleton(theUrl, origin, entityManager)
{
 if ( arguments.callee._singletonInstance )
 {
     return arguments.callee._singletonInstance;
 }
  arguments.callee._singletonInstance = this;
  var self = this;
  this.url = theUrl;
  this.entityManager = entityManager;
  this.localCoordinateSystemOrigin = origin;
  console.log("Coordinate system origin:", origin);
  
  this.rangeCoordinates = new dis.RangeCoordinates(origin[0], origin[1], origin[2]);
  // List of all the entities external to this page heard from
  this.remoteEntityDatabase = {};
  // list of all the entities contained on this page, ie that are the source
  // of ESDPU senders
  this.localEntityDatabase = {};
  
  // Listeners that will be notified when a new entity from the network is 
  // heard from
  this.newRemoteEntityListeners = new Array(0);

  if(window.WebSocket)
        this.websocketConnection = new WebSocket(this.url);
    else if(Window.MozWebSocket)
        this.websocketConnection = new MozWebSocket(this.url);
    else
        console.log("****This web browser does not support web sockets");
        
    // Set the format we want to use to receive binary messages
    this.websocketConnection.binaryType = 'arraybuffer';
    
    // Attach functions to the the web socket for various events
    this.websocketConnection.onopen = function(evt){self.onOpen(evt);};
    this.websocketConnection.onclose = function(evt){self.onClose(evt);};
    this.websocketConnection.onerror = function(evt){self.onError(evt);};
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
 * @param {type} listener
 * @returns {undefined}
 */
NetworkSingleton.prototype.urlForEntityType = function(entityType)
{
    console.log("in urlForEntityType");
    
    var typeMatchingTags = document.getElementsByTagName("DISEntityTypeMapping");
    var matchingUrl;
    console.log(typeMatchingTags);
    
    for(var idx = 0; idx < typeMatchingTags.length; idx++)
    {
        
        aTag = typeMatchingTags[idx];
           
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
    return matchingUrl;
};
  
  NetworkSingleton.prototype.onOpen = function(evt)
  {
      console.log("Websocket onOpen");
  };
  
  NetworkSingleton.prototype.onClose = function(evt)
  {
      console.log("Websocket onClose:", evt);
  };
  
  NetworkSingleton.prototype.onError = function(evt)
  {
      console.log("websocket onError", evt);
  };
  
  /**
   * An object that should be informed when a new message from the server arrives
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
      var idx = 0;
      for(idx = 0; idx < this.newRemoteEntityListeners.length; idx++)
      {
          if(this.newRemoteEntityListeners[idx] === listener)
          {
              this.newRemoteEntityListeners.slice(idx);
              console.log("unregistered new remote entity listener");
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
      var idx = 0;
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
  NetworkSingleton.prototype.handleEntityStatePdu = function(anEspdu)
  {
      var jsonEid = JSON.stringify(anEspdu.entityID);
      var newEntityFound = false;
      
      if(typeof this.remoteEntityDatabase[jsonEid] === 'undefined')
      {
          console.log("**********Adding new espduTransfrom in reponse to msg from network");
          newEntityFound = true;
          //console.log("Adding simple box");
          this.addNewEspduTransformNode(anEspdu);
          //this.addSimpleBox();
      }
      anEspdu.lastHeardFrom = new Date();
      this.remoteEntityDatabase[jsonEid] = anEspdu;
      
      // Convert to local coordinate system.
      var localCoordinates = this.rangeCoordinates.ECEFtoENU(anEspdu.entityLocation.x, anEspdu.entityLocation.y, anEspdu.entityLocation.z);
      var latLon = this.rangeCoordinates.ECEFObjectToLatLongAltInDegrees(anEspdu.entityLocation);
      if(newEntityFound)
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
          console.log("adding local entity ", jsonEid);
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
      switch(pdu.pduType)
      {
          case 1: 
              this.handleEntityStatePdu(pdu);
              break;
              
          case 2: console.log("Got fire PDU");
              break;
              
          case 3: console.log("Got detonation PDU");
              break;
              
          default: console.log("Got PDU of type ", pdu.pduType);
      
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
          console.log("Sent espdu from entity", espduTransformNode.espdu.entityLocation);
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
        
        var ot = document.getElementById('root');
        ot.appendChild(t);
        }
        
       /**
        * Adds a new EspduTransform node to the scenegraph as a result of a 
        * new entity from the network being heard from
        * 
        * @param {type} param espdu from a newly discovered entity from the network
        */
       NetworkSingleton.prototype.addNewEspduTransformNode = function(espdu)
       {
           var newEspduTransformNode = document.createElement("EspduTransform");
           newEspduTransformNode.setAttribute("networkMode", "reader");
           newEspduTransformNode.setAttribute("siteID", espdu.entityID.site);
           newEspduTransformNode.setAttribute("applicationID", espdu.entityID.application);
           newEspduTransformNode.setAttribute("entityID", espdu.entityID.entity);
          
           var transform = document.createElement("transform");
           
           // Convert from global (earth-centered) coordinates 
           var localCoordinates = this.rangeCoordinates.ECEFtoENU(espdu.entityLocation.x, 
                                                                  espdu.entityLocation.y, 
                                                                  espdu.entityLocation.z);
           
           transform.setAttribute("translation", localCoordinates.x + " " + localCoordinates.y + " " + localCoordinates.z);
           transform.setAttribute("scale", 1 + " " + 1 + " " + 1);
           
           var shape = document.createElement("Shape");
           var appearance = document.createElement("Appearance");
           var material = document.createElement("Material");
           material.setAttribute("diffuseColor", "0.603 0.894 0.909");
           var box = document.createElement("Box");
           
           var modelUrl = this.urlForEntityType(espdu.entityType);
           console.log("Have model of ", modelUrl, ' for entityType', espdu.entityType);
           
           appearance.appendChild(material);
           shape.appendChild(appearance);
           shape.appendChild(box);
           transform.appendChild(shape);
 
           
           
           // The espduTransform constructor doesn't fire until it's added
           // to the document
           var root = document.getElementById('DISNetworkEntities');
           root.appendChild(newEspduTransformNode);
           root.appendChild(transform);
           //root.style.display();
           console.log(root);
       };