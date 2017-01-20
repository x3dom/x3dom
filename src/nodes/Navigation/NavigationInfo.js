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
         * @x3d 3.3
         * @component Navigation
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNavigationInfoNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc NavigationInfo describes the viewing model and physical characteristics of the viewer's avatar.
         * Hint: for inspection of simple objects, usability often improves with type='EXAMINE' 'ANY' Hint: NavigationInfo types ''WALK' 'FLY'' support camera-to-object collision detection.
         * Background, Fog, NavigationInfo, TextureBackground and Viewpoint are bindable nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.NavigationInfo.superClass.call(this, ctx);


            /**
             * Enable/disable directional light that always points in the direction the user is looking.
             * @var {x3dom.fields.SFBool} headlight
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'headlight', true);

            /**
             * defines the navigation type
             * @var {x3dom.fields.MFString} type
             * @range {"ANY","WALK","EXAMINE","FLY","LOOKAT","NONE","EXPLORE",...}
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue ["EXAMINE","ANY"]
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'type', ["EXAMINE","ANY"]);

            /**
             * Specifies the view angle and height for helicopter mode and min/max rotation angle for turntable in ]0, PI[, starting from +y (0) down to -y (PI)
             * @var {x3dom.fields.MFFloat} typeParams
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [-0.4,60,0.05,2.8]
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'typeParams', [-0.4, 60, 0.05, 2.8]);

            /**
             * allows restricting examine and turntable navigation, overrides mouse buttons (useful for special viewers)
             * @range [all, pan, zoom, rotate, none]
             * @var {x3dom.fields.SFString} explorationMode
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 'all'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'explorationMode', 'all');
            // TODO; use avatarSize + visibilityLimit for projection matrix (near/far)

            /**
             * avatarSize triplet values are:
             * (a) collision distance between user and geometry (near culling plane of the view frustrum)
             * (b) viewer height above terrain
             * (c) tallest height viewer can WALK over.
             * Hint: keep (avatarSize.CollisionDistance / visibilityLimit) less then; 10,000 to avoid aliasing artifacts (i.e. polygon 'tearing').
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.MFFloat} avatarSize
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue [0.25,1.6,0.75]
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'avatarSize', [0.25, 1.6, 0.75]);

            /**
             * Geometry beyond the visibilityLimit may not be rendered (far culling plane of the view frustrum).
             * visibilityLimit=0.0 indicates an infinite visibility limit.
             * Hint: keep visibilityLimit greater than zero.
             * Hint: keep (avatarSize.CollisionDistance / visibilityLimit) less than 10,000 to avoid aliasing artifacts (i.e. polygon 'tearing').
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} visibilityLimit
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 0.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'visibilityLimit', 0.0);

            /**
             * Default rate at which viewer travels through scene, meters/second.
             * Warning: default 1 m/s usually seems slow for ordinary navigation.
             * Interchange profile hint: this field may be ignored.
             * @var {x3dom.fields.SFFloat} speed
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'speed', 1.0);
            // for 'jumping' between viewpoints (bind transition time)

            /**
             * The transitionTime field specifies the duration of any viewpoint transition
             * @var {x3dom.fields.SFTime} transitionTime
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.NavigationInfo
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFTime(ctx, 'transitionTime', 1.0);

            /**
             * Specifies the transition mode.
             * @var {x3dom.fields.MFString} transitionType
             * @range [LINEAR, TELEPORT, ANIMATE, ...]
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
            
            this._typeMapping = {
              "default":x3dom.DefaultNavigation,
              "turntable":x3dom.TurntableNavigation  
            };
            
            this._heliUpdated = false;

            var type = this.setType(this.getType());
            x3dom.debug.logInfo("NavType: " + type);
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "typeParams") {
                    this._heliUpdated = false;
                }
                else if (fieldName == "type") {
                    this.setType(this.getType());
                }
            },

            setType: function(type, viewarea) {
                var navType = this.checkType(type.toLowerCase());
                var oldType = this.checkType(this.getType());

                if(oldType !== navType || this._impl == null){
                    if(this._typeMapping[navType] == null)
                        this._impl = new this._typeMapping['default'](this);    
                    else
                        this._impl = new this._typeMapping[navType](this);                    
                    
                    switch (navType) {
                        case 'game':
                            if (viewarea)
                                viewarea.initMouseState();
                            else
                                this._nameSpace.doc._viewarea.initMouseState();
                            break;
                        case 'helicopter':
                            this._heliUpdated = false;
                            break;
                        case "turntable":
                            if (viewarea) {
                                viewarea.initMouseState();
                            }
                            else if(this._nameSpace.doc._viewarea){
                                this._nameSpace.doc._viewarea.initMouseState();
                            }
                            break;
                        default:
                            break;
                    }
                    if (this._nameSpace.doc._viewarea)
                        this._impl.init(this._nameSpace.doc._viewarea, false);
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

                // experimental HACK to switch between clamp to CoR (params[4]>0) and CoR translation in turntable mode
               var params = [theta, height, minAngle, maxAngle];
               if (length >= 5)
               {
                   // SPREAD OPERATOR KILLS IE
                   // adding rest parameters
                   //params.push(...this._vf.typeParams.slice(4));
                   
                   params = params.concat( this._vf.typeParams.slice(4) );
                   
               }
               console.log(params);
               return params;
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