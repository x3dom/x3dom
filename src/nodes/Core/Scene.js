/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// Not a real X3D node type
// ### Scene ###
x3dom.registerNodeType(
    "Scene",
    "Core",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Scene.superClass.call(this, ctx);

            // define the experimental picking mode: box, idBuf, idBuf24, idBufId, color, texCoord
            this.addField_SFString(ctx, 'pickMode', "idBuf");
            // experimental field to switch off picking
            this.addField_SFBool(ctx, 'doPickPass', true);

            // another experimental field for shadow DOM remapping
            this.addField_SFString(ctx, 'shadowObjectIdMapping', "");

            this._lastMin = new x3dom.fields.SFVec3f(0, 0, 0);
            this._lastMax = new x3dom.fields.SFVec3f(1, 1, 1);

            this._shadowIdMap = null;
            this.loadMapping();
        },
        {
            /* Bindable getter (e.g. getViewpoint) are added automatically */

            fieldChanged: function(fieldName)
            {
                if (fieldName == "shadowObjectIdMapping")
                    this.loadMapping();
            },

            updateVolume: function()
            {
                var vol = this.getVolume();

                if (vol.isValid())
                {
                    this._lastMin = x3dom.fields.SFVec3f.copy(vol.min);
                    this._lastMax = x3dom.fields.SFVec3f.copy(vol.max);
                }
            },

            loadMapping: function()
            {
                this._shadowIdMap = null;

                if (this._vf.shadowObjectIdMapping.length == 0) {
                    return;
                }

                var that = this;
                var xhr = new XMLHttpRequest();

                xhr.open("GET", encodeURI(this._nameSpace.getURL(this._vf.shadowObjectIdMapping)), true);
                xhr.send();

                xhr.onload = function()
                {
                    that._shadowIdMap = eval("(" + xhr.response + ")");

                    if (!that._shadowIdMap || !that._shadowIdMap.mapping) {
                        x3dom.debug.logWarning("Invalid ID map: " + that._vf.shadowObjectIdMapping);
                    }
                    else {
                        x3dom.debug.assert(that._shadowIdMap.maxID <= that._shadowIdMap.mapping.length,
                                "Too few ID map entries in " + that._vf.shadowObjectIdMapping + ", " +
                                "length of mapping array is only " + that._shadowIdMap.mapping.length +
                                " instead of " + that._shadowIdMap.ids.length + "!");
                    }
                };
            }
        }
    )
);