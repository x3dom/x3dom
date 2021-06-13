
/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * (C)2020 Andreas Plesch, Waltham, MA, U.S.A.
 * Dual licensed under the MIT and GPL
 */

/* ### X3DScript ### */
x3dom.registerNodeType(
    "X3DScript",
    "Scripting",
    defineClass( x3dom.nodeTypes.X3DScriptNode,

        /**
         * Constructor for X3DScript
         * @constructs x3dom.nodeTypes.X3DScript
         * @x3d 3.3
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DScriptNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Script node is used to program behaviour in a scene.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.X3DChildNode.superClass.call( this, ctx );

            /**
             * NYI.
             * Once the script has access to a X3D node (via an SFNode or MFNode value either in one of the Script node's fields or passed in as an attribute),
             * the script is able to read the contents of that node's fields. If the Script node's directOutput field is TRUE,
             * the script may also send events directly to any node to which it has access, and may dynamically establish or break routes.
             * If directOutput is FALSE (the default), the script may only affect the rest of the world via events sent through its fields.
             * The results are undefined if directOutput is FALSE and the script sends events directly to a node to which it has access.
             * @var {x3dom.fields.SFBool} load
             * @memberof x3dom.nodeTypes.X3DScript
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "directOutput", false ); //NYI

            /**
             * NYI.
             * If the Script node's mustEvaluate field is FALSE, the browser may delay sending input events to the script until its outputs are needed by the browser. If the mustEvaluate field is TRUE, the browser shall send input events to the script as soon as possible, regardless of whether the outputs are needed. The mustEvaluate field shall be set to TRUE only if the Script node has effects that are not known to the browser (such as sending information across the network). Otherwise, poor performance may result.
             * @var {x3dom.fields.SFBool} mustEvaluate
             * @memberof x3dom.nodeTypes.X3DScript
             * @initvalue false
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "mustEvaluate", false ); //NYI

            /**
             * Contains all fields.x3dom mechanism to allow custom fields.
             * @var {x3dom.fields.MFNode} fields
             * @memberof x3dom.nodeTypes.X3DScript
             * @initvalue x3dom.nodeTypes.Field
             * @field x3dom
             * @instance
             */
            this.addField_MFNode( "fields", x3dom.nodeTypes.Field );

            this._domParser = new DOMParser();
            this._source = "// ecmascript source code";
            this.LANG = "ecmascript:";
            this.CDATA = "[CDATA[";
            this.endRegex = /\s*]]$/ ;
            this._ctx = ctx;
            this._callbacks = {};
        },
        {
            nodeChanged : function ()
            {
                var script_text = "";

                ctx.xmlNode = this._xmlNode;

                if ( ctx.xmlNode !== undefined && ctx.xmlNode !== null )
                {
                    var that = this;

                    if ( that._vf.url.length && that._vf.url[ 0 ] !== null && that._vf.url[ 0 ].indexOf( "\n" ) == -1 )
                    {
                        var xhr        = new XMLHttpRequest(),
                            url        = that._nameSpace.getURL( that._vf.url[ 0 ] ),
                            originalID = that._id;

                        that._id = "default";
                        that._vf.url = new x3dom.fields.MFString( [ this._getDefaultScript() ] );

                        // TODO, url is an array
                        xhr.open( "GET", url, false );
                        xhr.onload = function ()
                        {
                            that._vf.url = new x3dom.fields.MFString( [] );
                            that._vf.url.push( xhr.response );
                            script_text += xhr.response;
                            that._id = originalID;
                            that.fieldChanged( "url" );
                        };
                        xhr.onerror = function ()
                        {
                            x3dom.debug.logError( "Could not load file '" + that._vf.url[ 0 ] + "'." );
                        };
                        //xhr.send(null);
                        x3dom.RequestManager.addRequest( xhr );
                    }
                    else
                    {
                        if ( that._vf.url.length )
                        {
                            that._vf.url = new x3dom.fields.MFString( [] );
                        }
                        try
                        {
                            that._vf.url.push( ctx.xmlNode.childNodes[ 1 ].nodeValue );
                            ctx.xmlNode.removeChild( ctx.xmlNode.childNodes[ 1 ] );
                        }
                        catch ( e )
                        {
                            ctx.xmlNode.childNodes.forEach( function ( childDomNode )
                            {
                                if ( childDomNode.nodeType === 3 )
                                {
                                    that._vf.url.push( childDomNode.nodeValue );
                                }
                                else if ( childDomNode.nodeType === 4 )
                                {
                                    that._vf.url.push( childDomNode.data );
                                }
                                childDomNode.parentNode.removeChild( childDomNode );
                            } );
                        }
                    }
                    if ( typeof scripts === "undefined" )
                    {
                        var scripts = [];
                    }
                    var decls = "var MFBool = x3dom.fields.MFBoolean; var MFColor = x3dom.fields.MFColor; var MFColorRGBA = x3dom.fields.MFColorRGBA; var MFDouble = function() { return Array.prototype.slice.call(arguments, 0); }; var MFFloat = x3dom.fields.MFFloat; var MFImage = function() { return Array.prototype.slice.call(arguments, 0); }; var MFInt32 = x3dom.fields.MFInt32; var MFMatrix3d = function() { return Array.prototype.slice.call(arguments, 0); }; var MFMatrix3f = function() { return Array.prototype.slice.call(arguments, 0); }; var MFMatrix4d = function() { return Array.prototype.slice.call(arguments, 0); }; var MFMatrix4f = function() { return Array.prototype.slice.call(arguments, 0); }; var MFNode = x3dom.fields.MFNode; var MFRotation = x3dom.fields.MFRotation; var MFString = x3dom.fields.MFString; var MFTime = function() { return Array.prototype.slice.call(arguments, 0); }; var MFVec2d = function() { return Array.prototype.slice.call(arguments, 0); }; var MFVec2f = x3dom.fields.MFVec2f; var MFVec3d = function() { return Array.prototype.slice.call(arguments, 0); }; var MFVec3f = x3dom.fields.MFVec3f; var MFVec4d = function() { return Array.prototype.slice.call(arguments, 0); }; var MFVec4f = function() { return Array.prototype.slice.call(arguments, 0); }; var SFBool = Boolean; var SFColor = x3dom.fields.SFColor; var SFColorRGBA = x3dom.fields.SFColorRGBA; var SFDouble = Number; var SFFloat = Number; var SFInt32 = Number; var SFImage = x3dom.fields.SFImage; var SFMatrix3d = function() { return Array.prototype.slice.call(arguments, 0); }; var SFMatrix3f = function() { return Array.prototype.slice.call(arguments, 0); }; var SFMatrix4d = function() { return Array.prototype.slice.call(arguments, 0); }; var SFMatrix4f = x3dom.fields.SFMatrix4f; var SFNode = x3dom.fields.SFNode; var Quaternion = x3dom.fields.Quaternion; var SFString = String; var SFTime = Number; var SFVec2d = function() { return Array.prototype.slice.call(arguments, 0); }; var SFVec2f = x3dom.fields.SFVec2f; var SFVec3d = function() { return Array.prototype.slice.call(arguments, 0); }; var SFVec3f = x3dom.fields.SFVec3f; var SFVec4d = function() { return Array.prototype.slice.call(arguments, 0); }; var SFVec4f = x3dom.fields.SFVec4f; " + script_text + "\n" + "return this;";
                    scripts.push( new Function( decls )() );
                }
                // else hope that url field was already set somehow

                this._parentNodes.forEach( function ( script )
                {
                    script.nodeChanged();
                } );
                // use textContent of dom node if it contains "ecmascript:"
                // cdata sections in html docs get converted to comments by browser
                // use the comment if it contains "ecmascript:"
                var xml = this._xmlNode;
                if ( xml.textContent.indexOf( this.LANG ) > -1 )
                {
                    this._source = xml.textContent;
                    xml.textContent = "";
                }
                xml.childNodes.forEach( function ( node )
                {
                    if ( node.nodeType == node.COMMENT_NODE )
                    {
                        if ( node.textContent.indexOf( this.LANG ) > -1 )
                        {
                            this._source = node.textContent;
                        }
                    }
                }, this );

                //cleanup
                this._source = this._source.replace( this.CDATA, "" );
                this._source = this._source.replace( this.LANG, "" );
                this._source = this._source.replace( this.endRegex, "" );

                //make fields
                this._cf.fields.nodes.forEach( function ( field )
                {
                    var fieldType = field._vf.type;
                    var fieldName = field._vf.name;
                    if ( fieldType.endsWith( "ode" ) ) // cf node
                    {
                        var type = x3dom.nodeTypes.X3DNode;
                        //TODO; get type from default value
                        this[ "addField_" + fieldType ]( fieldName, type );//type should be registered x3dom type
                    }
                    else
                    {
                        if ( field._vf.value ) {this._ctx.xmlNode.setAttribute( fieldName, field._vf.value );} // use dom to set value
                        this[ "addField_" + fieldType ]( this._ctx, fieldName, field._vf.value ); //or default value if none given
                    }
                }, this );

                //find inputs and outputs, and fields to initialize
                var outputs = [];
                var inputs = [];
                var initValues = [];
                this._cf.fields.nodes.forEach( function ( field )
                {
                    var atype = field._vf.accessType;
                    var fieldName = field._vf.name;
                    switch ( atype.toLowerCase() )
                    {
                        case "outputonly" :
                            outputs.push( fieldName );
                            initValues.push( fieldName );
                            break;
                        case "inputoutput" :
                            outputs.push( fieldName + "_changed" );
                            inputs.push( "set_" + fieldName );
                            initValues.push( fieldName );
                            break;
                        case "inputonly" :
                            inputs.push( fieldName );
                            break;
                        case "initializeonly" :
                            initValues.push( fieldName );
                        default :
                            x3dom.debug.logWarning( fieldName + " has unrecognized access type: " +  atype );
                            break;
                    }
                } );
                //wrap source
                var source = "return function wrapper ( scriptNode ) { \n";
                var callbacks = [ "initialize", "prepareEvents", "eventsProcessed", "shutdown", "getOutputs" ].concat( inputs );
                source += "var " + callbacks.join( "," ) + ";\n";
                source += "var " + outputs.join( "," ) + ";\n";
                initValues.forEach( function ( field )
                {
                    source += "var " + field + " = scriptNode._vf['" + field + "'];\n";
                } );
                Object.keys( x3dom.fields ) .forEach( function ( field )
                {
                    source += "var " + field + " = x3dom.fields." + field + ";\n";
                } );
                //TODO add SFRotation, Browser, print ...
                source += this._source;
                source += "\n function getOutputs () { \n";
                source += "return { " + outputs.map( function ( c )
                {
                    return "\n" + c + " : " + c;
                } ).join( "," ) + " } };";
                source += "\n return { " + callbacks.map( function ( c )
                {
                    return "\n" + c + " : " + c;
                } ).join( "," ) + " } };";
                //make script function
                this._scriptFunction = new Function( source )();
                this._callbacks = this._scriptFunction( this ); // pass in this node
                //run initialize
                if ( this._callbacks.initialize instanceof Function )
                {
                    this._callbacks.initialize( Date.now() / 1000 );
                }
            },

            fieldChanged : function ( fieldName )
            {
                if ( this._callbacks[ fieldName ] instanceof Function )
                {
                    var preOutputs = this._callbacks.getOutputs();
                    this._callbacks[ fieldName ]( this._vf[ fieldName ], Date.now() / 1000 );
                    var postOutputs = this._callbacks.getOutputs();
                    for ( var output in postOutputs )
                    {
                        //if ( postOutputs[output] != preOutputs[output] )
                        {
                            this.postMessage( output, postOutputs[ output ] );
                        }
                    }
                }
                if ( fieldName === "url" )
                {
                    this._parentNodes.forEach( function ( script )
                    {
                        script.fieldChanged( "url" );
                    } );
                }
            }
        }
    )
);
/*
Script : X3DScriptNode {
  SFNode    [in,out] metadata     NULL  [X3DMetadataObject]
  MFString  [in,out] url          []    [URI]
  SFBool    []       directOutput FALSE
  SFBool    []       mustEvaluate FALSE
  # And any number of:
  fieldType [in]     fieldName
  fieldType [in,out] fieldName    initialValue
  fieldType [out]    fieldName
  fieldType []       fieldName    initialValue
}
The Script node is used to program behaviour in a scene. Script nodes typically:

signify a change or user action;
receive events from other nodes;
contain a program module that performs some computation;
effect change somewhere else in the scene by sending events.
Each Script node has associated programming language code, referenced by the url field, that is executed to carry out the Script node's function. That code is referred to as the "script" in the rest of this description. Details on the url field can be found in 9.2.1 URLs.

Browsers are not required to support any specific language. Detailed information on scripting languages is described in 29.2 Concepts. Browsers supporting a scripting language for which a language binding is specified shall adhere to that language binding (see ISO/IEC 19777).

Sometime before a script receives the first event it shall be initialized (any language-dependent or user-defined initialize() is performed). The script is able to receive and process events that are sent to it. Each event that can be received shall be declared in the Script node using the same syntax as is used in a prototype definition:

    inputOnly type name
The type can be any of the standard X3D fields (as defined in 5 Field type reference). Name shall be an identifier that is unique for this Script node.

The Script node is able to generate events in response to the incoming events. Each event that may be generated shall be declared in the Script node using the following syntax:

    outputOnly type name
If the Script node's mustEvaluate field is FALSE, the browser may delay sending input events to the script until its outputs are needed by the browser. If the mustEvaluate field is TRUE, the browser shall send input events to the script as soon as possible, regardless of whether the outputs are needed. The mustEvaluate field shall be set to TRUE only if the Script node has effects that are not known to the browser (such as sending information across the network). Otherwise, poor performance may result.

Once the script has access to a X3D node (via an SFNode or MFNode value either in one of the Script node's fields or passed in as an attribute), the script is able to read the contents of that node's fields. If the Script node's directOutput field is TRUE, the script may also send events directly to any node to which it has access, and may dynamically establish or break routes. If directOutput is FALSE (the default), the script may only affect the rest of the world via events sent through its fields. The results are undefined if directOutput is FALSE and the script sends events directly to a node to which it has access.

A script is able to communicate directly with the X3D browser to get information such as the current time and the current world URL. This is strictly defined generally by the SAI services (see Part 2 of ISO/IEC 19775) and by the language bindings of the SAI (see ISO/IEC 19777) for the specific scripting language being used.

The location of the Script node in the scene graph has no affect on its operation.
*/
