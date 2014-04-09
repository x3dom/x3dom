/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### Anchor ###
x3dom.registerNodeType(
    "Anchor",
    "Networking",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_MFString(ctx, 'parameter', []);
        },
        {
            doIntersect: function(line) {
                var isect = false;
                for (var i=0; i<this._childNodes.length; i++) {
                    if (this._childNodes[i]) {
                        isect = this._childNodes[i].doIntersect(line) || isect;
                    }
                }
                return isect;
            },

            handleTouch: function() {
                var url = this._vf.url.length ? this._vf.url[0] : "";
                var aPos = url.search("#");
                var anchor = "";
                if (aPos >= 0)
                    anchor = url.slice(aPos+1);

                var param = this._vf.parameter.length ? this._vf.parameter[0] : "";
                var tPos = param.search("target=");
                var target = "";
                if (tPos >= 0)
                    target = param.slice(tPos+7);

                // TODO: implement #Viewpoint bind
                // http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/networking.html#Anchor
                x3dom.debug.logInfo("Anchor url=" + url + ", target=" + target + ", #viewpoint=" + anchor);

                if (target.length == 0 || target == "_blank") {
                    window.open(this._nameSpace.getURL(url), target);
                }
                else {
                    window.location = this._nameSpace.getURL(url);
                }
            }
        }
    )
);