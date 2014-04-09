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
        function (ctx) {
            x3dom.nodeTypes.BitLODGeoComponent.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'src', "");
            this.addField_MFInt32(ctx, 'format', []);
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