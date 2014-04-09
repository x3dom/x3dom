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
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoMetadata.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} url
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             *
             * @var {MFNode} data
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue x3dom.nodeTypes.X3DInfoNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('data', x3dom.nodeTypes.X3DInfoNode);

            /**
             *
             * @var {MFString} summary
             * @memberof x3dom.nodeTypes.GeoMetadata
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'summary', []);
        
        }
    )
);