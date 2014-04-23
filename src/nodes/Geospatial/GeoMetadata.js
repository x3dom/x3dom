/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoMetadata ### */
x3dom.registerNodeType(
    "GeoMetadata",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DInfoNode,
        
        /**
         * Constructor for GeoMetadata
         * @constructs x3dom.nodeTypes.GeoMetadata
         * @x3d 3.3
         * @component Geospatial
         * @status full
         * @extends x3dom.nodeTypes.X3DInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoMetadata node supports the specification of metadata describing any number of geospatial nodes.
         * This is similar to a WorldInfo node, but specifically for describing geospatial information.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoMetadata.superClass.call(this, ctx);


            /**
             * The url field is used to specify a hypertext link to an external, complete metadata description.
             * Multiple URL strings can be specified in order to provide alternative locations for the same metadata information.
             * The summary field may be used to specify the format of the metadata in the case where this cannot be deduced easily.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             * The data field is used to list all of the other nodes in a scene by DEF name that reference the data described in the GeoMetadata node.
             * The nodes in the data field are not rendered, so DEF/USE can be used in order to first describe them and then to use them in the scene graph.
             * @var {x3dom.fields.MFNode} data
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue x3dom.nodeTypes.X3DInfoNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('data', x3dom.nodeTypes.X3DInfoNode);

            /**
             * The summary string array contains a set of keyword/value pairs, with each keyword and its subsequent value contained in a separate string; i.e., there should always be an even (or zero) number of strings.
             * @var {x3dom.fields.MFString} summary
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'summary', []);
        
        }
    )
);