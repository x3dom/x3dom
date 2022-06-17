/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Inline ###
x3dom.registerNodeType(
    "Inline",
    "Networking",
    defineClass( x3dom.nodeTypes.X3DGroupingNode,

        /**
         * Constructor for Inline
         * @constructs x3dom.nodeTypes.Inline
         * @x3d 3.3
         * @component Networking
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Inline is a Grouping node that can load nodes from another X3D scene via url.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.Inline.superClass.call( this, ctx );

            /**
             * Each specified URL shall refer to a valid X3D file that contains a list of children nodes, prototypes and routes at the top level. Hint: Strings can have multiple values, so separate each string by quote marks. Warning: strictly match directory and filename capitalization for http links!
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString( ctx, "url", [] );

            /**
             * Specifies whether the X3D file specified by the url field is loaded.
             * TRUE: load immediately (it's also possible to load the URL at a later time by sending a TRUE event to the load field);
             * FALSE: no action is taken (by sending a FALSE event to the load field of a previously loaded Inline,
             * the contents of the Inline will be unloaded from the scene graph)
             * @var {x3dom.fields.SFBool} load
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "load", true );

            /**
             * The description field specifies a textual description.
             * This may be used by browser-specific user interfaces that wish to present users with more detailed information.
             * @var {x3dom.fields.SFString} description
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "description", "" );

            /**
             * Specifies the namespace of the Inline node.
             * @var {x3dom.fields.MFString} nameSpaceName
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "nameSpaceName", [] );

            /**
             * Specifies the content type of the resource.
             * @var {x3dom.fields.SFString} contentType
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue ""
             * @range ["", "model/x3d+xml", "model/x3d+json", "model/gltf+json", "model/gltf-binary"]
             * @field x3dom
             * @instance
             */
            this.addField_SFString( ctx, "contentType", "" );

            /**
             * Specifies whether the DEF value is used as id when no other id is set.
             * @var {x3dom.fields.SFBool} mapDEFToID
             * @memberof x3dom.nodeTypes.Inline
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "mapDEFToID", false );

            this.initDone = false;
            this.urlIndex = 0;
            this.count = 0;
            this.numRetries = x3dom.nodeTypes.Inline.MaximumRetries;

            this.ContentType = {
                X3D  : "model/x3d+xml",
                GLTF : "model/gltf+json",
                GLB  : "model/gltf-binary",
                X3DJ : "model/x3d+json"
            };
        },
        {
            fieldChanged : function ( fieldName )
            {
                if ( fieldName == "url" || fieldName == "load" )
                {
                    //Remove the childs of the x3domNode
                    for ( var i = 0; i < this._childNodes.length; i++ )
                    {
                        this.removeChild( this._childNodes[ i ] );
                    }

                    //if reflected to DOM remove the childs of the domNode
                    if ( this._vf.nameSpaceName.length != 0 )
                    {
                        var node = this._xmlNode;
                        if ( node && node.hasChildNodes() )
                        {
                            while ( node.childNodes.length >= 1 )
                            {
                                node.removeChild( node.firstChild );
                            }
                        }
                    }
                    this.urlIndex = 0;
                    this.loadInline();
                }
                else if ( fieldName == "render" )
                {
                    this.invalidateVolume();
                    //this.invalidateCache();
                }
            },

            nodeChanged : function ()
            {
                if ( !this.initDone )
                {
                    this.initDone = true;
                    this.urlIndex = 0;
                    this.loadInline();
                }
            },

            parentRemoved : function ()
            {
                var global = x3dom.getGlobal();

                if ( this._childNodes.length > 0 && this._childNodes[ 0 ] && this._childNodes[ 0 ]._nameSpace )
                {this._nameSpace.removeSpace( this._childNodes[ 0 ]._nameSpace );}

                for ( var i = 0, n = this._childNodes.length; i < n; i++ )
                {
                    if ( this._childNodes[ i ] )
                    {
                        this._childNodes[ i ].parentRemoved( this );
                        global[ "_remover" ] = this.removeChild( this._childNodes[ i ] );
                    }
                }

                delete global[ "_remover" ];
            },

            fireEvents : function ( eventType )
            {
                if ( this._xmlNode &&
                    ( this._xmlNode[ "on" + eventType ] ||
                        this._xmlNode.hasAttribute( "on" + eventType ) ||
                        this._listeners[ eventType ] ) )
                {
                    var xmlNode = this._xmlNode;
                    var event = {
                        target          : xmlNode,
                        type            : eventType,
                        error           : ( eventType == "error" ) ? "XMLHttpRequest Error" : "",
                        cancelBubble    : false,
                        stopPropagation : function () { this.cancelBubble = true; }
                    };

                    try
                    {
                        var attrib = xmlNode[ "on" + eventType ];

                        if ( typeof( attrib ) === "function" )
                        {
                            attrib.call( xmlNode, event );
                        }
                        else if ( xmlNode.hasAttribute( "on" + eventType ) )
                        {
                            var funcStr = xmlNode.getAttribute( "on" + eventType );
                            var func = new Function( "event", funcStr );
                            func.call( xmlNode, event );
                        }

                        var list = this._listeners[ eventType ];
                        if ( list )
                        {
                            for ( var i = 0; i < list.length; i++ )
                            {
                                list[ i ].call( xmlNode, event );
                            }
                        }
                    }
                    catch ( ex )
                    {
                        x3dom.debug.logException( ex );
                    }
                }
            },

            isValidContentType : function ( contentType )
            {
                for ( var type in this.ContentType )
                {
                    if ( contentType === this.ContentType[ type ] )
                    {
                        return true;
                    }
                }

                return false;
            },

            getContentType : function ()
            {
                //Return contentType if defined & valid
                if ( this._vf.contentType != "" && this.isValidContentType( this._vf.contentType ) )
                {
                    return this._vf.contentType;
                }

                //Try to detect the contentType from suffix
                if ( this._vf.url.length && this._vf.url[ this.urlIndex ].length )
                {
                    var url = this._vf.url[ this.urlIndex ];
                    var lastPointIndex = url.lastIndexOf( "." );

                    if ( lastPointIndex != -1 )
                    {
                        var suffix = url.substr( lastPointIndex ).toLowerCase();

                        switch ( suffix )
                        {
                            case ".x3d"  :  return this.ContentType.X3D;
                            case ".gltf" :  return this.ContentType.GLTF;
                            case ".glb"  :  return this.ContentType.GLB;
                            case ".json" :  return this.ContentType.X3DJ;
                        }
                    }
                }
            },

            loadX3D : function ( inlScene, nameSpace )
            {
                if ( !this._vf.load )
                {
                    x3dom.debug.logInfo( "Inline: load field prevented loading of " + this._vf.url[ this.urlIndex ] );
                    return;
                }

                var that = this;

                var newScene = null;

                if ( inlScene )
                {
                    newScene = nameSpace.setupTree( inlScene );
                    newScene._nameSpace.superInlineNode = that;

                    if ( that._vf.nameSpaceName.length != 0 )
                    {
                        while ( inlScene.children.length )
                        {
                            var childDomNode = inlScene.children[ 0 ];
                            setNamespace( that._vf.nameSpaceName, childDomNode, that._vf.mapDEFToID );
                            that._xmlNode.appendChild( childDomNode );
                        }
                    }
                }
                else
                {
                    x3dom.debug.logError( "No Scene in resource" );
                }

                // trick to free memory, assigning a property to global object, then deleting it
                var global = x3dom.getGlobal();

                if ( that._childNodes.length > 0 && that._childNodes[ 0 ] && that._childNodes[ 0 ]._nameSpace )
                {that._nameSpace.removeSpace( that._childNodes[ 0 ]._nameSpace );}

                while ( that._childNodes.length !== 0 )
                {global[ "_remover" ] = that.removeChild( that._childNodes[ 0 ] );}

                delete global[ "_remover" ];

                if ( newScene )
                {
                    that.addChild( newScene );

                    that.invalidateVolume();

                    // recalc changed scene bounding box twice
                    var theScene = that._nameSpace.doc._scene;

                    if ( theScene )
                    {
                        theScene.invalidateVolume();
                        //theScene.invalidateCache();

                        window.setTimeout( function ()
                        {
                            that.invalidateVolume();
                            //that.invalidateCache();

                            theScene.updateVolume();
                            that._nameSpace.doc.needRender = true;
                            that._nameSpace.doc.decrementDownloads();
                            that._nameSpace.doc.needRender = true;
                            x3dom.debug.logInfo( "Inline: added " + that._vf.url[ that.urlIndex ] + " to scene." );
                        }, 1000 );
                    }
                    that._nameSpace.importNodes( newScene._nameSpace );

                    that.fireEvents( "load" );
                }

                newScene = null;
                nameSpace = null;
                inlScene = null;
            },

            loadInline : function ()
            {
                var that = this;

                var contentType = this.getContentType();

                var isBinary = false;

                var xhr = new window.XMLHttpRequest();

                xhr.onreadystatechange = function ()
                {
                    if ( xhr.readyState == 4 )
                    {
                        //202 Still Transcoding
                        if ( xhr.status === x3dom.nodeTypes.Inline.AwaitTranscoding )
                        {
                            if ( that.count < that.numRetries )
                            {
                                that.count++;

                                var refreshTime = +xhr.getResponseHeader( "Refresh" ) || 5;

                                x3dom.debug.logInfo( "XHR status: " + xhr.status + " - Await Transcoding (" + that.count + "/" + that.numRetries + "): " +
                                                    "Next request in " + refreshTime + " seconds" );

                                window.setTimeout( function ()
                                {
                                    that._nameSpace.doc.decrementDownloads();;
                                    that.loadInline();
                                }, refreshTime * 1000 );
                            }
                            else
                            {
                                x3dom.debug.logError( "XHR status: " + xhr.status + " - Await Transcoding (" + that.count + "/" + that.numRetries + "): " +
                                                     "No Retries left" );

                                that._nameSpace.doc.decrementDownloads();;

                                that.count = 0;
                            }
                        }
                        else if ( xhr.status == 200 || xhr.status == 0 )
                        {
                            x3dom.debug.logInfo( "Inline: downloading " + that._vf.url[ that.urlIndex ] + " done." );

                            if ( contentType == undefined )
                            {
                                contentType = xhr.getResponseHeader( "Content-Type" );
                            }

                            that.count = 0;

                            var inlineScene;

                            var namespace = that.addNameSpace();

                            if ( contentType == that.ContentType.GLTF || contentType == that.ContentType.GLB )
                            {
                                if ( xhr.response )
                                {
                                    var loader = new x3dom.glTF2Loader( namespace );

                                    inlineScene = loader.load( xhr.response, isBinary );

                                    that.loadX3D( inlineScene, namespace );
                                }
                                else
                                {
                                    that.nextUrlOrError( "Invalid XHR response for glTF" );
                                }
                            }
                            else if ( contentType == that.ContentType.X3DJ )
                            {
                                if ( xhr.response )
                                {
                                    var json = x3dom.protoExpander.prototypeExpander( xhr.responseURL, xhr.response );
                                    var parser = new x3dom.JSONParser();

                                    var xml = parser.parseJavaScript( json );

                                    if ( xml !== undefined && xml !== null )
                                    {
                                        inlineScene = xml.getElementsByTagName( "Scene" )[ 0 ] ||
                                                      xml.getElementsByTagName( "scene" )[ 0 ];

                                        that.loadX3D( inlineScene, namespace );
                                    }
                                    else
                                    {
                                        that.nextUrlOrError( "Invalid XML parsing of JSON" );
                                    }
                                }
                                else
                                {
                                    that.nextUrlOrError( "Invalid XHR response for JSON" );
                                }
                            }
                            else if ( contentType == that.ContentType.X3D )
                            {
                                var xml;

                                if ( navigator.appName == "Microsoft Internet Explorer" )
                                {
                                    xml = new DOMParser().parseFromString( xhr.responseText, "text/xml" );
                                }
                                else
                                {
                                    xml = xhr.responseXML;
                                }

                                if ( xml !== undefined && xml !== null )
                                {
                                    inlineScene = xml.getElementsByTagName( "Scene" )[ 0 ] ||
                                                  xml.getElementsByTagName( "scene" )[ 0 ];

                                    that.loadX3D( inlineScene, namespace );
                                }
                                else
                                {
                                    that.nextUrlOrError( "Invalid xml parsing for X3D" );
                                }
                            }
                        }
                        else
                        {
                            that.nextUrlOrError( that._vf.url[ that.urlIndex ] + " status: " + xhr.status + " - XMLHttpRequest requires web server running!" );
                        }
                    }
                };

                if ( this._vf.url.length && this._vf.url[ this.urlIndex ].length )
                {
                    var xhrURI = this._nameSpace.getURL( this._vf.url[ this.urlIndex ] );

                    xhr.open( "GET", xhrURI, true );
                    xhr.setRequestHeader( "Accept", "model/x3d+xml; q=1.0, model/gltf+json; q=0.5, model/gltf-binary; q=0.5" );

                    if ( xhr.overrideMimeType )
                    {
                        if ( contentType == this.ContentType.X3D )
                        {
                            xhr.overrideMimeType( "text/xml" );
                        }
                        if ( contentType == this.ContentType.X3DJ )
                        {
                            xhr.overrideMimeType( "application/json" );
                            xhr.responseType = "json";
                        }
                        else if ( contentType == this.ContentType.GLTF )
                        {
                            isBinary = false;
                            xhr.responseType = "json";
                        }
                        else if ( contentType == this.ContentType.GLB )
                        {
                            isBinary = true;
                            xhr.responseType = "arraybuffer";
                        }
                    }

                    try
                    {
                        this._nameSpace.doc.incrementDownloads();
                        x3dom.RequestManager.addRequest( xhr );
                    }
                    catch ( ex )
                    {
                        that.nextUrlOrError( this._vf.url[ this.urlIndex ] + ": " + ex );
                    }
                }
            },

            nextUrlOrError : function ( errorMsg )
            {
                x3dom.debug.logWarning( errorMsg );
                this._nameSpace.doc.decrementDownloads();
                this.urlIndex++;
                if ( this.urlIndex < this._vf.url.length )
                {
                    this.loadInline();
                }
                else
                {
                    this.fireEvents( "error" );
                    this.count = 0;
                }
            },

            addNameSpace : function ()
            {
                var nsName = ( this._vf.nameSpaceName.length != 0 ) ?
                    this._vf.nameSpaceName.toString().replace( " ", "" ) : "";

                var nameSpace = new x3dom.NodeNameSpace( nsName, this._nameSpace.doc );

                var url = this._vf.url.length ? this._vf.url[ 0 ] : "";

                if ( ( url[ 0 ] === "/" ) || ( url.indexOf( ":" ) >= 0 ) )
                {
                    nameSpace.setBaseURL( url );
                }
                else
                {
                    nameSpace.setBaseURL( this._nameSpace.baseURL + url );
                }

                this._nameSpace.addSpace( nameSpace );

                return nameSpace;
            }
        }
    )
);

x3dom.nodeTypes.Inline.AwaitTranscoding = 202;      // Parameterizable retry state for Transcoder
x3dom.nodeTypes.Inline.MaximumRetries = 15;         // Parameterizable maximum number of retries

function setNamespace ( prefix, childDomNode, mapDEFToID )
{
    if ( childDomNode instanceof Element && childDomNode.__setAttribute !== undefined )
    {
        if ( childDomNode.hasAttribute( "id" ) )
        {
            childDomNode.__setAttribute( "id", prefix.toString().replace( " ", "" ) + "__" + childDomNode.getAttribute( "id" ) );
        }
        else if ( childDomNode.hasAttribute( "DEF" ) && mapDEFToID )
        {
            childDomNode.__setAttribute( "id", prefix.toString().replace( " ", "" ) + "__" + childDomNode.getAttribute( "DEF" ) );
            // workaround for Safari
            if ( !childDomNode.id )
            {childDomNode.id = childDomNode.__getAttribute( "id" );}
        }
    }

    if ( childDomNode.hasChildNodes() )
    {
        childDomNode.childNodes.forEach( function ( children )
        {
            setNamespace( prefix, children, mapDEFToID );
        } );
    }
}
