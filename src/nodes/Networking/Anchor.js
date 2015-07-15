/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for Anchor
         * @constructs x3dom.nodeTypes.Anchor
         * @x3d 3.3
         * @component Networking
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Anchor is a Grouping node that can contain most nodes. Clicking Anchored geometry loads content specified by the url field.
         * Loaded content completely replaces current content, if parameter is same window.
         * Hint: insert a Shape node before adding geometry or Appearance.
         */
        function (ctx) {
            x3dom.nodeTypes.Anchor.superClass.call(this, ctx);


            /**
             * Address of replacement world, activated by clicking Anchor geometry. Hint: jump to a world's internal viewpoint by appending viewpoint name (e.g. #ViewpointName, someOtherCoolWorld.wrl#GrandTour). Hint: jump to a local viewpoint by only using viewpoint name (e.g. #GrandTour). Hint: Strings can have multiple values, so separate each string by quote marks [ 'http://www.url1.org' 'http://www.url2.org' 'etc.' ]. Hint: XML encoding for ' is ampersandquot; (a character entity). Warning: strictly match directory and filename capitalization for http links! Hint: can replace embedded blank(s) in url queries with %20 for each blank character.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.Anchor
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             * Passed parameter that signals web browser how to redirect url loading. Each string shall consist of "keyword=value" pairs. Hint: set parameter to target=_blank or target=_extern to load target url with a system-specific application. target=_self or target=_intern will open url in current x3d-browser window. Hint: set parameter to target=frame_name to load target url into another frame. Hint: Strings can have multiple values, so separate each string by quote marks. [ 'http://www.url1.org' 'http://www.url2.org' 'etc.' ]. Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.MFString} parameter
             * @memberof x3dom.nodeTypes.Anchor
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'parameter', []);

            /**
             * The description field in the Anchor node specifies a textual description of the Anchor node.
             * This may be used by browser-specific user interfaces that wish to present users with more detailed information about the Anchor.
             * @var {x3dom.fields.SFString} description
             * @memberof x3dom.nodeTypes.Anchor
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'description', "");
        
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

                if(target.length !=0 || target != "_self") {
                    window.open(this._nameSpace.getURL(url), target);
                }
                else {
                    window.location = this._nameSpace.getURL(url);
                }
            }
        }
    )
);
