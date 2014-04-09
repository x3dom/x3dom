/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### BitLODGeometry ### */
x3dom.registerNodeType(
    "BitLODGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.BitLODGeometry.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'index', "");   // Uint16
            this.addField_SFBool(ctx, 'usesVLCIndices', false);  // variable-length coding
            this.addField_SFBool(ctx, 'clientSideNormals', false);  // variable-length coding
            this.addField_SFBool(ctx, 'normalAsSphericalCoordinates', false);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            this.addField_MFNode('components', x3dom.nodeTypes.BitLODGeoComponent);

            // Typed Array View Types
            // Int8, Uint8, Int16, Uint16, Int32, Uint32, Float32, Float64
            //this.addField_SFString(ctx, 'indexType', "Uint16");
            this.addField_SFString(ctx, 'coordType', "Uint16");
            this.addField_SFString(ctx, 'normalType', "Uint16");
            this.addField_SFString(ctx, 'texCoordType', "Uint16");
            this.addField_SFString(ctx, 'colorType', "Uint16");
            //this.addField_SFString(ctx, 'tangentType', "Float32");
            //this.addField_SFString(ctx, 'binormalType', "Float32");

            // workaround
            this._hasStrideOffset = false;
            this._mesh._numTexComponents = 2;
            this._mesh._numColComponents = 3;

            this._vf.clientSideNormals            = false;
            this._vf.normalPerVertex              = !this._vf.clientSideNormals;
            this._vf.normalAsSphericalCoordinates = this._vf.normalPerVertex;
            this._mesh._numNormComponents         = this._vf.normalAsSphericalCoordinates ? 2 : 3;
        },
        {
            parentAdded: function(parent)
            {
                parent._coordStrideOffset    = [12, 0];
                parent._normalStrideOffset   = [12, 8];
                parent._texCoordStrideOffset = [ 4, 0];
                parent._colorStrideOffset    = [ 6, 0];
            },

            // ATTENTION: the following accessor methods are NOT shared
            // by all Geometry nodes, so be careful when using them!!!
            hasIndex: function()
            {
                return (this._vf.index.length) ? true : false;
            },

            usesVLCIndices: function()
            {
                return this._vf.usesVLCIndices == true;
            },

            usesClientSideNormals: function()
            {
                return this._vf.clientSideNormals == true;
            },

            hasColor: function()
            {
                for(var i=0; i<this.getNumComponents(); i++) {
                    for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
                        if(this.getComponent(i).getAttrib(j) == "color3")
                            return true;
                    }
                }
                return false;
            },

            hasTexCoord: function()
            {
                for(var i=0; i<this.getNumComponents(); i++) {
                    for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
                        if(this.getComponent(i).getAttrib(j) == "texcoord2")
                            return true;
                    }
                }
                return false;
            },

            getCoordNormalURLs: function() {
                var coordNormalURLs = [];
                for(var i=0; i<this.getNumComponents(); i++) {
                    for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
                        if(this.getComponent(i).getAttrib(j) == "coord3") {
                            coordNormalURLs.push(this.getComponent(i).getSrc());
                        }
                    }
                }
                return coordNormalURLs;
            },

            getTexCoordURLs: function() {
                var texCoordURLs = [];
                for(var i=0; i<this.getNumComponents(); i++) {
                    for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
                        if(this.getComponent(i).getAttrib(j) == "texcoord2") {
                            texCoordURLs.push(this.getComponent(i).getSrc());
                        }
                    }
                }
                return texCoordURLs;
            },

            getColorURLs: function() {
                var colorURLs = [];
                for(var i=0; i<this.getNumComponents(); i++) {
                    for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
                        if(this.getComponent(i).getAttrib(j) == "color3") {
                            colorURLs.push(this.getComponent(i).getSrc());
                        }
                    }
                }
                return colorURLs;
            },

            getNumPrimTypes: function()
            {
                return this._vf.primType.length;
            },

            getPrimType: function(idx)
            {
                if( idx < this.getNumPrimTypes() )
                    return this._vf.primType[idx].toUpperCase();
                return "";
            },

            getNumVertexCounts: function()
            {
                return this._vf.vertexCount.length;
            },

            getVertexCount: function(idx)
            {
                if( idx < this.getNumVertexCounts() )
                    return this._vf.vertexCount[idx];
                return 0;
            },

            setVertexCount: function(idx, value)
            {
                this._vf.vertexCount[idx] = value;
            },

            getNumComponents: function()
            {
                return this._cf.components.nodes.length;
            },

            getComponent: function(idx)
            {
                return this._cf.components.nodes[idx];
            },

            getComponentsURLs: function()
            {
                var URLs = [];

                for(var c=0; c<this._cf.components.nodes.length; c++)
                    URLs[c] = this._cf.components.nodes[c].getSrc();

                return URLs;
            },

            getComponentFormats: function()
            {
                var formats = [];

                for(var c=0; c<this._cf.components.nodes.length; c++)
                    formats[c] = this._cf.components.nodes[c]._vf.format;

                return formats;
            },

            getComponentAttribs: function()
            {
                var attribs = [];

                for(var c=0; c<this._cf.components.nodes.length; c++)
                    attribs[c] = this._cf.components.nodes[c]._vf.attrib;

                return attribs;
            },

            getNumVertices: function()
            {
                var count = 0;
                for(var i=0; i<this._vf.vertexCount.length; i++) {
                    count += this._vf.vertexCount[i];
                }

                return count;
            },

            getAttribType: function(bits)
            {
                switch(bits)
                {
                    case 8:
                        return "Uint8";
                    case 16:
                        return "Uint16";
                    case 32:
                        return "Float32";
                    default:
                        return 0;
                }
            },

            getPrecisionMax: function(type)
            {
                switch(this._vf[type])
                {
                    case "Int8":
                        return 127.0;
                    case "Uint8":
                        return 255.0 - (Math.pow(2.0, 8.0 - this.loadedLevels) - 1.0);
                    case "Int16":
                        return 32767.0;
                    case "Uint16":
                        if (type === 'normalType')
                            return 65535.0 - (Math.pow(2.0, 16.0 - this.loadedLevels) - 1.0);
                        else
                            return 65535.0 - (Math.pow(2.0, 16.0 - this.loadedLevels*2.0) - 1.0);
                    case "Int32":
                        return 2147483647.0;
                    case "Uint32":
                        return 4294967295.0;
                    case "Float32":
                    case "Float64":
                    default:
                        return 1.0;
                }
            }
        }
    )
);