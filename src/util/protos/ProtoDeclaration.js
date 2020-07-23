/**
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2020 Andreas Plesch, Waltham, MA
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * ProtoDeclaration constructor
 *
 * @param namespace - namespace of containing scene
 * @param name - name of new node
 * @param protoBody - dom of ProtoBody
 * @param fields - fields from ProtoInterface
 * @param isExternProto - true for ExternProtoDeclare
 * @param url - url MFString for ExternProtoDeclare
 * @constructor
 */
x3dom.ProtoDeclaration = function ( namespace, name, protoBody, fields, isExternProto, url )
{
    this._nameSpace = namespace; // main scene name space
    this.name = name;
    this._protoBody = protoBody || null;
    this.fields = fields || [];
    this.isExternProto = isExternProto || false;
    this.url = url || [];
    this.needsLoading = true;
    this.instanceQueue = [];
};

/**
 * ProtoDeclaration registerNode
 *
 * registers node with x3dom
 * takes fields from ProtoDeclaration and adds them to node
 *
 */
x3dom.ProtoDeclaration.prototype.registerNode = function ()
{
    var that = this;
    x3dom.registerNodeType(
        that.name,
        "Core", // ProtoComponent
        defineClass( x3dom.nodeTypes.X3DNode,

            /**
             * generic Constructor for named prototype
             * @constructs x3dom.nodeTypes[this.name]
             * @x3d 3.3
             * @component Core
             * @status experimental
             * @extends x3dom.nodeTypes.X3DNode
             * @param {Object} [ctx=null] - context object, containing initial settings like namespace
             * @classdesc X3DBindableNode is the abstract base type for all bindable children nodes.
             */
            function ( ctx )
            {
                x3dom.nodeTypes[ that.name ].superClass.call( this, ctx );

                //add fields
                this._cf_hash = {};
                that.fields.forEach( function ( field )
                {
                    if ( !field.dataType.endsWith( "ode" ) )//; //_vf fields
                    {
                    //set interface defaults
                        if ( ctx && ctx.xmlNode && !ctx.xmlNode.hasAttribute( field.name ) )
                        {
                            if ( field.value )
                            {
                                ctx.xmlNode.setAttribute( field.name, field.value );
                            }
                        }
                        this[ "addField_" + field.dataType ]( ctx, field.name, field.value );
                    }
                    else // _cf fields
                    {
                        //set interface defaults for cf fields
                        if ( ctx && ctx.xmlNode )
                        {
                            if ( ctx.xmlNode.querySelectorAll( "[containerField='" + field.name + "']" ).length == 0 )
                            {
                                field.cfValue.forEach( function ( sfnodedom )
                                {
                                    ctx.xmlNode.appendChild( sfnodedom.cloneNode( true ) );
                                } );
                            }
                        }
                        //find node type from IS in body
                        var type = x3dom.nodeTypes.X3DNode;
                        var ISRoutes = that._protoBody._ISRoutes;
                        var ISconnection = ISRoutes[ field.name ][ 0 ];
                        var nodeField = ISconnection.nodeField;
                        var ISDomNode = that._protoBody.querySelector( "[DEF=" + ISconnection.nodeDEF + "]" );
                        //create temp node to get type
                        var IStype = ISDomNode.localName.toLowerCase();
                        if ( IStype in x3dom.nodeTypesLC )
                        {
                            var ISctx = {
                                doc       : ctx.doc,
                                runtime   : ctx.runtime,
                                xmlNode   : ISDomNode.cloneNode( true ), // clone to avoid adding defaults
                                nameSpace : ctx.nameSpace
                            };
                            var ISNode = new x3dom.nodeTypesLC[ IStype ]( ISctx );
                            type = ISNode._cf[ nodeField ].type;
                        }
                        this[ "addField_" + field.dataType ]( field.name, type );//type should be registered x3dom type
                        this._cf_hash[ field.name ] = "trigger";
                    }
                }, this );

                //initialize
                var nameSpaceName = "protoNS";
                if ( ctx.xmlNode.hasAttribute( "DEF" ) )
                {
                    nameSpaceName = ctx.xmlNode.getAttribute( "DEF" ) + "NS";
                }
                this.innerNameSpace = new x3dom.NodeNameSpace( nameSpaceName, ctx.doc ); // instance name space
                this.innerNameSpace.setBaseURL( ctx.nameSpace.baseURL + that.name );
                that._nameSpace.addSpace( this.innerNameSpace );

                //transfer proto definitions to instance namespace if any
                that._nameSpace.protos.forEach( function ( protoDeclaration )
                {
                    this.innerNameSpace.protos.push( protoDeclaration );
                }, this );

                this.nodes = [];
                this.protoBodyClone = that._protoBody.cloneNode( true );
                this.declaration = that;
                this.isProtoInstance = true;
                this._changing = false;
                this._externTries = 0;
                this._maxTries = 5;
            },
            {
                nodeChanged : function ( nodeField )
                {
                    if ( this._changing ) {return;}

                    this._changing = true;

                    var body = this.protoBodyClone;

                    //register ProtoDeclares and convert ProtoInstance to new nodes
                    body.querySelectorAll( ":scope > *" )
                        .forEach( function ( childDomNode )
                        {
                            var tag = childDomNode.localName.toLowerCase();
                            if ( tag == "protodeclare" )
                            { this.innerNameSpace.protoDeclare( childDomNode ); }
                            else if ( tag == "externprotodeclare" )
                            { this.innerNameSpace.externProtoDeclare( childDomNode ); }
                            else if ( tag == "protoinstance" )
                            { this.innerNameSpace.protoInstance( childDomNode, body ); }
                        },
                        this );

                    //generate nodes from body
                    var children = this.protoBodyClone.childNodes;
                    var i;

                    for ( i = 0; i < children.length; i++ )
                    {
                        var c = this.innerNameSpace.setupTree.call( this.innerNameSpace, children[ i ], this );

                        if ( c != null )
                        {
                            this.nodes.push( c );
                        }
                    };
                    this.typeNode = this.nodes[ 0 ];
                    this.helperNodes = this.nodes.slice( 1 );

                    //transfer dom "on" attributes to typeNode dom
                    var attributes = this._xmlNode.attributes;
                    var attr;
                    for ( i = 0; i < attributes.length; i++ )
                    {
                        attr = attributes[ i ];
                        if ( attr.name.startsWith( "on" ) )
                        {
                            this.typeNode._xmlNode.setAttribute( attr.name, attr.value );
                        }
                    }

                    //set initial values
                    for ( var field in this._vf )
                    {
                        this.fieldChanged( field );
                    }
                    for ( field in this._cf )
                    {
                        var cf = this._cf[ field ];
                        if ( "nodes" in cf ) //MFNode
                        {
                            //only process if changed to avoid re-adding
                            if ( this._cf_hash[ field ] !== this._get_cf_hash( field )
                                || field == nodeField ) // if passed, is changed
                            {
                                this.fieldChanged( field );
                            }
                        }
                        else
                        {
                            this.fieldChanged( field );
                        }
                    }

                    //add fieldwatchers to nodeFields to forward event out
                    //todo: only for output fields
                    for ( field in this._vf )
                    {
                        var ISRoutes = this.declaration._protoBody._ISRoutes;
                        if ( field in ISRoutes ) //misbehaved Protos may have unused fields
                        {
                            this._setupFieldWatchers( field );
                        }
                    };
                    this._changing = false;

                    //save a current 'hash' of cf children
                    for ( field in this._cf )
                    {
                        if ( "nodes" in this._cf[ field ] )
                        {
                            this._cf_hash[ field ] = this._get_cf_hash( field );
                        }
                    }
                },

                fieldChanged : function ( field )
                {
                    try //
                    {
                        //todo: check if input field
                        var ISRoutes = this.declaration._protoBody._ISRoutes;
                        if ( ! ( field in ISRoutes ) ) {return;}
                        ISRoutes[ field ].forEach( function ( ISNode )
                        {
                            var instanceNode = this.innerNameSpace.defMap[ ISNode.nodeDEF ];

                            if ( instanceNode == undefined ) //probably unfinished externproto
                            {
                                var ISparent = this.protoBodyClone.querySelector( "[DEF=" + ISNode.nodeDEF + "]" );
                                if ( ISparent.tagName.toLowerCase() == "protoinstance" )
                                {
                                    if ( this._externTries++ < this._maxTries )
                                    {
                                        x3dom.debug.logWarning( " ExternProto instance attempt: " + this._externTries );
                                        //try again
                                        var timer = setTimeout( this.fieldChanged.bind( this ), 1000, field );
                                    }
                                }
                                return;
                            }

                            this._externTries = 0;
                            //forward
                            //strip set_ and _changed
                            var nodeField = this._normalizeName( ISNode.nodeField, instanceNode );
                            if ( field in this._vf )
                            {
                                instanceNode._vf[ nodeField ] = this._vf[ field ];
                                instanceNode.fieldChanged( nodeField );
                            }
                            else if ( field in this._cf )
                            {
                                instanceNode._cf[ nodeField ] = this._cf[ field ];//(re)add reference

                                //transfer parents/children
                                var nodes = [];
                                if ( instanceNode._cfFieldTypes[ nodeField ] == "MFNode" )
                                {
                                    nodes = this._cf[ field ].nodes;
                                }
                                else if ( instanceNode._cfFieldTypes[ nodeField ] == "SFNode"
                                            && this._cf[ field ].node )
                                {
                                    nodes = [ this._cf[ field ].node ];
                                }
                                else
                                {
                                    x3dom.debug.logWarning( "Unexpected field type: " + instanceNode._cfFieldTypes[ nodeField ] );
                                }

                                //first remove all field childnodes
                                instanceNode._childNodes.forEach( function ( sfnode )
                                {
                                    instanceNode.removeChild( sfnode, nodeField, "force" );
                                } );

                                // then re-add new child nodes to instance
                                nodes.forEach( function ( sfnode )
                                {
                                    instanceNode.addChild( sfnode, nodeField );
                                } );

                                if ( instanceNode._cfFieldTypes[ nodeField ] == "MFNode" )
                                {
                                    // now the _cf nodes array may contain duplicate references
                                    // remove the first one
                                    for ( var i = 0; i < nodes.length; i++ )
                                    {
                                        var node = nodes[ i ];
                                        for ( var j = nodes.length - 1; j > i; j-- )
                                        {
                                            if ( node == nodes[ j ] )
                                            {
                                                nodes.splice( j, 1 );
                                            }
                                        }
                                    }
                                }

                                instanceNode.nodeChanged( nodeField );
                            }
                        }, this );
                    }
                    catch ( error )
                    {
                        x3dom.debug.logWarning( "Proto warning: " + error );
                    };
                },

                _normalizeName : function ( name, node )
                {
                    if ( name in node._vf )
                    {
                        return name;
                    }
                    return name.replace( /^set_/, "" ).replace( /_changed$/, "" );
                },

                _setupFieldWatchers : function ( field )
                {
                    this.declaration._protoBody._ISRoutes[ field ].forEach( function ( ISNode )
                    {
                        var instanceNode = this.innerNameSpace.defMap[ ISNode.nodeDEF ];
                        if ( instanceNode == undefined )
                        {
                            var ISparent = this.protoBodyClone.querySelector( "[DEF=" + ISNode.nodeDEF + "]" );
                            if ( ISparent.tagName.toLowerCase() == "protoinstance" )
                            {
                                if ( this._externTries++ < this._maxTries )
                                {
                                    x3dom.debug.logWarning( " retrying ExternProto: " + this._externTries );
                                    //try again
                                    var timer = setTimeout( this._setupFieldWatchers.bind( this ), 1000, field );
                                }
                            }
                            return;
                        }
                        var nodeField = this._normalizeName( ISNode.nodeField, instanceNode );
                        if ( !instanceNode._fieldWatchers[ nodeField ] )
                        {
                            instanceNode._fieldWatchers[ nodeField ] = [];
                        }
                        instanceNode._fieldWatchers[ nodeField ].push(
                            this.postMessage.bind( this, field ) ); // forward
                    }, this );
                },

                _get_cf_hash : function ( field )
                {
                    var nodes = this._cf[ field ].nodes;
                    return nodes.length;
                }
            }
        )
    );
};
