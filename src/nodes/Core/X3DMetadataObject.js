/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DMetadataObject ### */
x3dom.registerNodeType(
    "X3DMetadataObject",
    "Core",
    defineClass( x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for X3DMetadataObject
         * @constructs x3dom.nodeTypes.X3DMetadataObject
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract interface is the basis for all metadata nodes. The interface is inherited by
         * all metadata nodes.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.X3DMetadataObject.superClass.call( this, ctx );

            /**
             * The specification of a non-empty value for the name field is required.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "name", "" );

            /**
             * The specification of the reference field is optional. If provided, it identifies the metadata standard
             * or other specification that defines the name field. If the reference field is not provided or is empty,
             * the meaning of the name field is considered implicit to the characters in the string.
             * @var {x3dom.fields.SFString} reference
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "reference", "" );
        },
        {
            nodeChanged : function ()
            {
                const value0 = this._vf.value[ 0 ];
                const field = this._vf.name;
                const tag = x3dom.extensions.TAG;
                const startTag = "<" + tag + ">";
                const endTag = "</" + tag + ">";
                const parentDom = this._xmlNode.parentNode;
                const useNodes = this._runtime.doc.querySelectorAll( "[USE=" + this._DEF + "]" );
                const parentType = parentDom.localName.toLowerCase();
                const parentDefault = new x3dom.nodeTypesLC[ parentType ]();
                if ( this._vf.reference == x3dom.extensions.FIELD && value0 !== undefined )
                {
                    if ( !( field in parentDefault._vf ) )
                    {
                        x3dom.debug.logWarning(
                            "Requested extension field " + field + " for " + parentDefault.typeName() + " not implemented." );
                    }
                    this._xmlNode.parentNode.setAttribute(
                        field, value0 );
                    for ( const useNode of useNodes )
                    {
                        useNode.parentNode.setAttribute( field, value0 );
                    }
                }
                if ( this._vf.reference == x3dom.extensions.NODE && value0 !== undefined )
                {
                    if ( !( this._vf.name in parentDefault._cf ) )
                    {
                        x3dom.debug.logWarning(
                            "Requested extension node field " + field + " for " + parentDefault.typeName() + " not implemented." );
                    }
                    var dom = new DOMParser()
                        .parseFromString( startTag + value0 + endTag, "application/xml" )
                        .firstChild;
                    while ( dom.firstElementChild )
                    {
                        const cf = dom.firstElementChild.getAttribute( "containerField" );
                        if ( cf !== null && cf !== field )
                        {
                            x3dom.debug.logWarning(
                                "Provided containerField " + cf + " does not match extension field " + field
                            );
                        }
                        else
                        {
                            x3dom.debug.logInfo(
                                "Setting containerField for " + dom.firstElementChild.localName + " to extension field " + field
                            );
                            dom.firstElementChild.setAttribute( "containerField", field );
                        }
                        for ( const useNode of useNodes )
                        {
                            var currentElement = dom.firstElementChild.cloneNode( true );
                            useNode.parentNode.appendChild( currentElement );
                        }
                        this._xmlNode.parentNode.appendChild( dom.firstElementChild );
                    }
                }
            }
        }
    )
);
x3dom.extensions = {
    FIELD : "X3DFieldExtension",
    NODE  : "X3DNodeExtension",
    TAG   : "MFNode"
};
