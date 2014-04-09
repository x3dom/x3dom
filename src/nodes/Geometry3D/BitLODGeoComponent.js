/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### BitLODGeoComponent ### */
x3dom.registerNodeType(
    "BitLODGeoComponent",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for BitLODGeoComponent
         * @constructs x3dom.nodeTypes.BitLODGeoComponent
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.BitLODGeoComponent.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} src
             * @memberof x3dom.nodeTypes.BitLODGeoComponent
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'src', "");

            /**
             *
             * @var {MFInt32} format
             * @memberof x3dom.nodeTypes.BitLODGeoComponent
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'format', []);

            /**
             *
             * @var {MFString} attrib
             * @memberof x3dom.nodeTypes.BitLODGeoComponent
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'attrib', []);

            this._attribShift = [];
            this._attribShiftDec = [];
            this._mask = [];

            this._bitsPerComponent = 0;
        
        },
        {
            nodeChanged: function()
            {
                //Get Bits per component
                for(var f=0; f<this._vf.format.length; f++) {
                    this._bitsPerComponent += this._vf.format[f];
                }
            },

            getSrc: function()
            {
                return this._vf.src;
            },

            getFormat: function()
            {
                return this._vf.format;
            },

            getAttrib: function(idx)
            {
                return this._vf.attrib[idx];
            },

            getNumAttribs: function()
            {
                return this._vf.attrib.length;
            }
        }
    )
);