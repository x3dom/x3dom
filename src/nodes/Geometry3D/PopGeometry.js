/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PopGeometry ### */
x3dom.registerNodeType(
    "PopGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        
        /**
         * Constructor for PopGeometry
         * @constructs x3dom.nodeTypes.PopGeometry
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBinaryContainerGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PopGeometry node provides a first, experimental implementation of the POP Buffer algorithm for progressive streaming of triangular mesh data.
         */
        function (ctx) {
            x3dom.nodeTypes.PopGeometry.superClass.call(this, ctx);

            /**
             * The size of the bounding box of this geometry, as it is used for culling.
             * @var {x3dom.fields.SFVec3f} tightSize
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'tightSize',  1, 1, 1);
            //@todo: add this on export

            /**
             * The size of the bounding box used to quantize data in this geometry,
             * which is usually the largest bounding box of all sub-meshes of a given mesh.
             * @var {x3dom.fields.SFVec3f} maxBBSize
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'maxBBSize',  1, 1, 1);

            /**
             * The minimum coordinates of the bounding box, in a normalized range between [0,1],
             * and given modulo maxBBSize.
             * @var {x3dom.fields.SFVec3f} bbMinModF
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'bbMinModF',  0, 0, 0);

            /**
             * The maximum coordinates of the bounding box, in a normalized range between [0,1],
             * and given modulo maxBBSize.
             * @var {x3dom.fields.SFVec3f} bbMaxModF
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1,1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'bbMaxModF',  1, 1, 1);

            /**
             * Minimum coordinates of the bounding box, in object coordinates.
             * @var {x3dom.fields.SFVec3f} bbMin
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'bbMin', 0, 0, 0);

            /**
             * Field for internal use.
             * @var {x3dom.fields.SFVec3f} bbShiftVec
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f (ctx, 'bbShiftVec', 0, 0, 0);

            if (this._vf.bbMinModF.x > this._vf.bbMaxModF.x)
                this._vf.bbShiftVec.x = 1.0;
            if (this._vf.bbMinModF.y > this._vf.bbMaxModF.y)
                this._vf.bbShiftVec.y = 1.0;
            if (this._vf.bbMinModF.z > this._vf.bbMaxModF.z)
                this._vf.bbShiftVec.z = 1.0;


            /**
             * Number of levels of this pop geometry.
             * @var {x3dom.fields.MFNode} levels
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue x3dom.nodeTypes.PopGeometryLevel
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('levels', x3dom.nodeTypes.PopGeometryLevel);


            /**
             * Stride of all (interleaved) attributes, given in bytes.
             * @var {x3dom.fields.SFInt32} attributeStride
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'attributeStride',   0);

            /**
             * Offset, given in bytes, for the position attribute inside the interleaved attribute array.
             * @var {x3dom.fields.SFInt32} positionOffset
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'positionOffset',    0);

            /**
             * Offset, given in bytes, for the normal attribute inside the interleaved attribute array.
             * @var {x3dom.fields.SFInt32} normalOffset
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalOffset',      0);

            /**
             * Offset, given in bytes, for the texture coordinate attribute inside the interleaved attribute array.
             * @var {x3dom.fields.SFInt32} texcoordOffset
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'texcoordOffset',    0);

            /**
             * Offset, given in bytes, for the color attribute inside the interleaved attribute array.
             * @var {x3dom.fields.SFInt32} colorOffset
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'colorOffset',       0);

            /**
             * Number of anchor vertices (can be 0).
             * Anchor vertices are used to keep some vertices on the bordes between sub-meshes fixed during refinement.
             * @var {x3dom.fields.SFInt32} numAnchorVertices
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'numAnchorVertices', 0);


            /**
             * Precision, given in bytes, for the components of the position attribute.
             * @var {x3dom.fields.SFInt32} positionPrecision
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 2
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'positionPrecision', 2);

            /**
             * Precision, given in bytes, for the components of the normal attribute.
             * @var {x3dom.fields.SFInt32} normalPrecision
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'normalPrecision',   1);

            /**
             * Precision, given in bytes, for the components of the texture coordinate attribute.
             * @var {x3dom.fields.SFInt32} texcoordPrecision
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 2
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'texcoordPrecision', 2);

            /**
             * Precision, given in bytes, for the components of the color attribute.
             * @var {x3dom.fields.SFInt32} colorPrecision
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'colorPrecision',    1);


            /**
             * Minimum precision level of this PopGeometry node.
             * This can be used to clamp displayed precision - if the value is -1, no clamping takes place.
             * @var {x3dom.fields.SFInt32} minPrecisionLevel
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'minPrecisionLevel', -1);

            /**
             * Maximum precision level of this PopGeometry node.
             * This can be used to clamp displayed precision - if the value is -1, no clamping takes place.
             * @var {x3dom.fields.SFInt32} maxPrecisionLevel
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue -1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'maxPrecisionLevel', -1);

            /**
             * Additional precision multiplication factor, for tuning the displayed precision.
             * @var {x3dom.fields.SFFloat} precisionFactor
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'precisionFactor',  1.0);

            //those four fields are read by the x3dom renderer

            /**
             * Field for internal use by the X3DOM renderer.
             * @var {x3dom.fields.SFString} coordType
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue "Uint16"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'coordType',    "Uint16");

            /**
             * Field for internal use by the X3DOM renderer.
             * @var {x3dom.fields.SFString} normalType
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue "Uint8"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalType',   "Uint8");

            /**
             * Field for internal use by the X3DOM renderer.
             * @var {x3dom.fields.SFString} texCoordType
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue "Uint16"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'texCoordType', "Uint16");

            /**
             * Field for internal use by the X3DOM renderer.
             * @var {x3dom.fields.SFString} colorType
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue "Uint8"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'colorType',    "Uint8");


            /**
             * Size of the vertex buffer, used to pre-allocate the buffer before downloading data.
             * @var {x3dom.fields.SFInt32} vertexBufferSize
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'vertexBufferSize', 0);


            /**
             * Specifies whether this PopGeometry was encoded for indexed rendering.
             * @var {x3dom.fields.SFBool} indexedRendering
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'indexedRendering', true);
            //ATTENTION: Although it might be supported by aopt,
            //           X3DOM does not accept 16 bit spherical normals yet,
            //           spherical normals are assumed to be 8 bit and get
            //           encoded as the 4th 16 bit position component

            /**
             * Specifies whether this PopGeometry was encoded for rendering with spherical normals.
             * @var {x3dom.fields.SFBool} sphericalNormals
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'sphericalNormals', false);

            //needed as we manipulate vertexCount during loading

            /**
             * Vertex count at the highest possible level of precision.
             * @var {x3dom.fields.MFInt32} originalVertexCount
             * @memberof x3dom.nodeTypes.PopGeometry
             * @initvalue [0]
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'originalVertexCount', [0]);

            for (var i = 0; i < this._vf.vertexCount.length; ++i) {
                this._vf.originalVertexCount[i] = this._vf.vertexCount[i];
            }

            //@todo: remove this three lines after cleanup
            this._vf.maxBBSize = x3dom.fields.SFVec3f.copy(this._vf.size);
            this._vf.size  = this._vf.tightSize;
            this._diameter = this._vf.size.length();

            this._bbMinBySize = [ Math.floor(this._vf.bbMin.x / this._vf.maxBBSize.x),
                Math.floor(this._vf.bbMin.y / this._vf.maxBBSize.y),
                Math.floor(this._vf.bbMin.z / this._vf.maxBBSize.z) ];
            this._volRadius        = this._vf.size.length() / 2;
            this._volLargestRadius = this._vf.maxBBSize.length() / 2;

            // workaround
            this._mesh._numPosComponents  = this._vf.sphericalNormals ? 4 : 3;
            this._mesh._numNormComponents = this._vf.sphericalNormals ? 2 : 3;
            this._mesh._numTexComponents  = 2;
            this._mesh._numColComponents  = 3;

            x3dom.nodeTypes.PopGeometry.numTotalVerts += this.getVertexCount();
            x3dom.nodeTypes.PopGeometry.numTotalTris  += (this.hasIndex() ?
                this.getTotalNumberOfIndices() : this.getVertexCount()) / 3;
        
        },
        {
            forceUpdateCoverage: function() {
                return true;
            },

            getBBoxShiftVec: function() {
                return this._vf.bbShiftVec;
            },

            getBBoxSize: function() {
                return this._vf.size;
            },

            hasIndex: function() {
                return this._vf.indexedRendering;
            },

            getTotalNumberOfIndices: function() {
                if (this._vf.indexedRendering) {
                    var sum = 0;
                    for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                        sum += this._vf.originalVertexCount[i];
                    }
                    return sum;
                }
                else  {
                    return 0;
                }
            },

            getVertexCount: function() {
                var sum = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    sum += this._vf.originalVertexCount[i];
                }
                return sum;
            },

            //adapts the vertex count according to the given total number of indices / vertices
            //which is used by the renderer
            adaptVertexCount: function(numVerts) {
                var verts = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    if ((this._vf.originalVertexCount[i] + verts) <= numVerts) {
                        this._vf.vertexCount[i] = this._vf.originalVertexCount[i];
                        verts += this._vf.originalVertexCount[i];
                    }
                    else {
                        this._vf.vertexCount[i] = numVerts - verts;
                        break;
                    }
                }
            },

            hasNormal: function() {
                return (this._vf.normalOffset != 0) && !this._vf.sphericalNormals;
            },

            hasTexCoord: function() {
                return (this._vf.texcoordOffset != 0);
            },

            hasColor: function() {
                return (this._vf.colorOffset != 0);
            },

            getPositionPrecision : function() {
                return this._vf.positionPrecision;
            },

            getNormalPrecision : function() {
                return this._vf.normalPrecision;
            },

            getTexCoordPrecision : function() {
                return this._vf.texcoordPrecision;
            },

            getColorPrecision : function() {
                return this._vf.colorPrecision;
            },

            getAttributeStride : function() {
                return this._vf.attributeStride;
            },

            getPositionOffset : function() {
                return this._vf.positionOffset;
            },

            getNormalOffset : function() {
                return this._vf.normalOffset;
            },

            getTexCoordOffset : function() {
                return this._vf.texcoordOffset;
            },

            getColorOffset : function() {
                return this._vf.colorOffset;
            },

            getBufferTypeStringFromByteCount: function(bytes) {
                switch(bytes)
                {
                    case 1:
                        return "Uint8";
                    case 2:
                        return "Uint16";
                    //case 4: //currently not supported by PopGeometry
                    //    return "Float32";
                    default:
                        return 0;
                }
            },

            getDataURLs : function() {
                var urls = [];

                for (var i = 0; i < this._cf.levels.nodes.length; ++i) {
                    urls.push(this._cf.levels.nodes[i].getSrc());
                }

                return urls;
            },

            getNumIndicesByLevel : function(lvl) {
                return this._cf.levels.nodes[lvl].getNumIndices();
            },

            getNumLevels : function(lvl) {
                return this._cf.levels.nodes.length;
            },

            getVertexDataBufferOffset : function(lvl) {
                return this._cf.levels.nodes[lvl].getVertexDataBufferOffset();
            },

            getPrecisionMax: function(type) {
                switch(this._vf[type])
                {
                    //currently, only Uint8 and Uint16 are supported
                    //case "Int8":
                    //    return 127.0;
                    case "Uint8":
                        return 255.0;
                    //case "Int16":
                    //    return 32767.0;
                    case "Uint16":
                        return 65535.0;
                    //case "Int32":
                    //return 2147483647.0;
                    //case "Uint32":
                    //return 4294967295.0;
                    //case "Float32":
                    //case "Float64":
                    default:
                        return 1.0;
                }
            }
        }
    )
);


/** Static class members (needed for stats) */
x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor  = 1;
x3dom.nodeTypes.PopGeometry.PrecisionFactorOnMove = 1;
x3dom.nodeTypes.PopGeometry.numRenderedVerts      = 0;
x3dom.nodeTypes.PopGeometry.numRenderedTris       = 0;
x3dom.nodeTypes.PopGeometry.numTotalVerts         = 0;
x3dom.nodeTypes.PopGeometry.numTotalTris          = 0;

/** Static LUT for LOD computation */
x3dom.nodeTypes.PopGeometry.powLUT = [32768, 16384, 8192, 4096, 2048, 1024, 512, 256,
    128,    64,   32,   16,   8,    4,    2,   1];