/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### NavigationInfo ### */
x3dom.registerNodeType(
    "NavigationInfo",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DNavigationInfoNode,
        
        /**
         * Constructor for NavigationInfo
         * @constructs x3dom.nodeTypes.NavigationInfo
         * @x3d x.x
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNavigationInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} headlight
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             *
             * @var {MFString} type
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue ["EXAMINE","ANY"]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'type', ["EXAMINE","ANY"]);
            // view angle and height for helicopter mode and
            // min/max rotation angle for turntable in ]0, PI[, starting from +y (0) down to -y (PI)

            /**
             *
             * @var {MFFloat} typeParams
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [-0.4,60,0.05,2.8]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'typeParams', [-0.4, 60, 0.05, 2.8]);
            // allows restricting examine and turntable navigation, overrides mouse buttons
            // can be one of [all, pan, zoom, rotate, none] (useful for special viewers)

            /**
             *
             * @var {SFString} explorationMode
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 'all'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'explorationMode', 'all');
            // TODO; use avatarSize + visibilityLimit for projection matrix (near/far)

            /**
             *
             * @var {MFFloat} avatarSize
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [0.25,1.6,0.75]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'avatarSize', [0.25, 1.6, 0.75]);

            /**
             *
             * @var {SFFloat} visibilityLimit
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);

            /**
             *
             * @var {SFFloat} speed
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // for 'jumping' between viewpoints (bind transition time)

            /**
             *
             * @var {SFTime} transitionTime
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFTime(ctx, 'transitionTime', 1.0);

            /**
             *
             * @var {MFString} transitionType
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue ["LINEAR"]
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'transitionType', ["LINEAR"]);

            this._validTypes = [
                "none", "examine", "turntable",
                "fly", "freefly", "lookat", "lookaround",
                "walk", "game", "helicopter", "any"
            ];
            this._heliUpdated = false;

            var type = this.checkType(this.getType());
            x3dom.debug.logInfo("NavType: " + type);
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "typeParams") {
                    this._heliUpdated = false;
                }
                else if (fieldName == "type") {
                    var type = this.checkType(this.getType());

                    switch (type) {
                        case 'game':
                            this._nameSpace.doc._viewarea.initMouseState();
                            break;
                        case 'helicopter':
                            this._heliUpdated = false;
                            break;
                        case "turntable":
                            this._nameSpace.doc._viewarea.initMouseState();
                            this._nameSpace.doc._viewarea.initTurnTable(this);
                            break;
                        default:
                            break;
                    }

                    this._vf.type[0] = type;
                    x3dom.debug.logInfo("Switch to " + type + " mode.");
                }
            },

            setType: function(type, viewarea) {
                var navType = this.checkType(type.toLowerCase());
                var oldType = this.checkType(this.getType());

                switch (navType) {
                    case 'game':
                        if (oldType !== navType) {
                            if (viewarea)
                                viewarea.initMouseState();
                            else
                                this._nameSpace.doc._viewarea.initMouseState();
                        }
                        break;
                    case 'helicopter':
                        if (oldType !== navType) {
                            this._heliUpdated = false;
                        }
                        break;
                    case "turntable":
                        if (oldType !== navType) {
                            if (viewarea) {
                                viewarea.initMouseState();
                                viewarea.initTurnTable(this);
                            }
                            else {
                                this._nameSpace.doc._viewarea.initMouseState();
                                this._nameSpace.doc._viewarea.initTurnTable(this);
                            }
                        }
                        break;
                    default:
                        break;
                }

                this._vf.type[0] = navType;
                x3dom.debug.logInfo("Switch to " + navType + " mode.");
            },

            getType: function() {
                var type = this._vf.type[0].toLowerCase();
                // FIXME; the following if's aren't nice!
                if (type.length <= 1)
                    type = "none";
                else if (type == "any")
                    type = "examine";
                return type;
            },

            getTypeParams: function() {
                var length = this._vf.typeParams.length;

                var theta  = (length >= 1) ? this._vf.typeParams[0] : -0.4;
                var height = (length >= 2) ? this._vf.typeParams[1] : 60.0;
                var minAngle = (length >= 3) ? this._vf.typeParams[2] : x3dom.fields.Eps;
                var maxAngle = (length >= 4) ? this._vf.typeParams[3] : Math.PI - x3dom.fields.Eps;

                return [theta, height, minAngle, maxAngle];
            },

            setTypeParams: function(params) {
                for (var i=0; i<params.length; i++) {
                    this._vf.typeParams[i] = params[i];
                }
            },

            checkType: function(type) {
                if (this._validTypes.indexOf(type) > -1) {
                    return type;
                }
                else {
                    x3dom.debug.logWarning(type + " is no valid navigation type, use one of " +
                        this._validTypes.toString());
                    return "examine";
                }
            },

            getExplorationMode: function() {
                switch (this._vf.explorationMode.toLowerCase()) {
                    case "all":    return 7;
                    case "rotate": return 1; //left btn
                    case "zoom":   return 2; //right btn
                    case "pan":    return 4; //middle btn
                    case "none":   return 0; //type 'none'
                    default:       return 7;
                }
            }
        }
    )
);