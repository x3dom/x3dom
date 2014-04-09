/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### GeoLOD ### */
x3dom.registerNodeType(
    "GeoLOD",
    "Geospatial",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        
        /**
         * Constructor for GeoLOD
         * @constructs x3dom.nodeTypes.GeoLOD
         * @x3d x.x
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.GeoLOD.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} geoSystem
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue ['GD','WE']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             *
             * @var {MFString} rootUrl
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'rootUrl', []);

            /**
             *
             * @var {MFString} child1Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'child1Url', []);

            /**
             *
             * @var {MFString} child2Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'child2Url', []);

            /**
             *
             * @var {MFString} child3Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'child3Url', []);

            /**
             *
             * @var {MFString} child4Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'child4Url', []);
            //this.addField_SFVec3d(ctx, 'center', 0, 0, 0);

            /**
             *
             * @var {SFFloat} range
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue 10
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'range', 10);

            /**
             *
             * @var {SFString} referenceBindableDescription
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'referenceBindableDescription', []);

            /**
             *
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} rootNode
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('rootNode', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} privateChild1Node
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('privateChild1Node', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} privateChild2Node
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('privateChild2Node', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} privateChild3Node
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('privateChild3Node', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} privateChild4Node
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('privateChild4Node', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {SFNode} privateRootNode
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('privateRootNode', x3dom.nodeTypes.X3DChildNode);
        
        }
    )
);