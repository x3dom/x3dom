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
         * @x3d 3.0
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLODNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoLOD node provides a terrain-specialized form of the LOD node.
         * It is a grouping node that specifies two different levels of detail for an object using a tree structure, where 0 to 4 children can be specified, and also efficiently manages the loading and unloading of these levels of detail.
         */
        function (ctx) {
            x3dom.nodeTypes.GeoLOD.superClass.call(this, ctx);


            /**
             * The geoSystem field is used to define the spatial reference frame.
             * @var {MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]},
             * @memberof x3dom.nodeTypes.GeoLocation
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'geoSystem', ['GD', 'WE']);

            /**
             * The rootUrl and rootNode fields provide two different ways to specify the geometry of the root tile.
             * You may use one or the other. The rootNode field lets you include the geometry for the root tile directly within the X3D file.
             * @var {MFString} rootUrl
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'rootUrl', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {MFString} child1Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child1Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {MFString} child2Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child2Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {MFString} child3Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child3Url', []);

            /**
             * When the viewer enters the specified range, this geometry is replaced with the contents of the four children files defined by child1Url through child4Url.
             * The four children files are loaded into memory only when the user is within the specified range. Similarly, these are unloaded from memory when the user leaves this range.
             * @var {MFString} child4Url
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'child4Url', []);
            //this.addField_SFVec3d(ctx, 'center', 0, 0, 0);

            /**
             * The level of detail is switched depending upon whether the user is closer or farther than range length base units from the geospatial coordinate center.
             * @var {SFFloat} range
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.GeoLOD
             * @initvalue 10
             * @field x3d
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
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoLocation
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('geoOrigin', x3dom.nodeTypes.X3DChildNode);

            /**
             * The rootUrl and rootNode fields provide two different ways to specify the geometry of the root tile. The rootUrl field lets you specify a URL for a file that contains the geometry.
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