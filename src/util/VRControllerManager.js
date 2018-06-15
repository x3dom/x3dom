x3dom.VRControllerManager = function()
{
    this.leftInline     = undefined;
    this.leftTransform  = undefined;
    this.rightInline    = undefined;
    this.rightTransform = undefined;

    this.leftGamepadIdx  = undefined;
    this.rightGamepadIdx = undefined;
    this.vrDisplay       = undefined;

    this.controllers = {
        "HTC Vive MV" : {
            left  : "https://x3dom.org/download/assets/vr/vive.glb",
            right : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : 40
        },
        "Oculus Oculus Rift CV1" : {
            left  : "https://x3dom.org/download/assets/vr/oculus-touch-left.glb",
            right : "https://x3dom.org/download/assets/vr/oculus-touch-right.glb",
            scaleFactor : 39.5
        },
        "Oculus Go" : {
            left  : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            right : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            scaleFactor : 1
        }
    }

    this._addInlines();
    this._addGamePadListeners();
};

x3dom.VRControllerManager.prototype._addGamePadListeners = function()
{
    window.addEventListener("gamepadconnected", this._onGamePadConnected.bind(this));
    window.addEventListener("gamepaddisconnected", this._onGamePadDisconnected.bind(this));
}

x3dom.VRControllerManager.prototype._onGamePadConnected = function( e )
{
    var gamepad = e.gamepad;
    var pose = gamepad.pose;

    navigator.getVRDisplays().then( function( displays ) {

        var display = displays[0];

        if(gamepad.displayId == display.displayId)
        {
            var controller = this.controllers[ display.displayName ];

            if ( gamepad.hand == "left" )
            {
                this.leftGamepadIdx = gamepad.index;
                this.leftInline.setAttribute( "url", controller.left );
                this.leftTransform.setAttribute("matrix", this._getMatrixStr( pose.position, pose.orientation, controller.scaleFactor ));
            }
            else if ( gamepad.hand == "right" )
            {
                this.rightGamepadIdx = gamepad.index;
                this.rightInline.setAttribute( "url", controller.right, controller.scaleFactor );
                this.rightTransform.setAttribute("matrix", this._getMatrixStr( pose.position, pose.orientation, controller.scaleFactor ));
            }
        }

    }.bind(this));
}

x3dom.VRControllerManager.prototype._onGamePadDisconnected = function( e )
{
    console.log( e );
}

x3dom.VRControllerManager.prototype._addInlines = function()
{
    var x3dScene = document.querySelector("scene") || document.querySelector("Scene")

    if( x3dScene )
    {
        this.leftTransform  = document.createElement("matrixtransform");
        this.leftInline     = document.createElement("inline");
    
        this.rightTransform  = document.createElement("matrixtransform");
        this.rightInline     = document.createElement("inline");
    
        this.leftTransform.appendChild(this.leftInline);
        this.rightTransform.appendChild(this.rightInline);

        x3dScene.appendChild(this.leftTransform);
        x3dScene.appendChild(this.rightTransform);
    }
}

x3dom.VRControllerManager.prototype.update = function( viewarea, vrDisplay )
{
    if ( !vrDisplay || (vrDisplay && !vrDisplay.isPresenting) )
    {
        this.leftInline.setAttribute("render", "false");
        this.rightInline.setAttribute("render", "false");
    }
    else
    {
        this.leftInline.setAttribute("render", "true");
        this.rightInline.setAttribute("render", "true");
    }

    var gamepads = navigator.getGamepads();
    var controller = {};

    if (this.leftGamepadIdx != undefined && gamepads[ this.leftGamepadIdx ] )
    {
        var gamepad = gamepads[ this.leftGamepadIdx ];
        var pose = gamepad.pose;

        this.leftTransform.setAttribute("matrix", this._getMatrixStr( pose.position, 
                                                                      pose.orientation,
                                                                      this.controllers[ vrDisplay.displayName ].scaleFactor ));

        controller.left = gamepad;
    }

    if (this.rightGamepadIdx != undefined && gamepads[ this.rightGamepadIdx ] )
    {
        var gamepad = gamepads[ this.rightGamepadIdx ];
        var pose = gamepad.pose;

        this.rightTransform.setAttribute("matrix", this._getMatrixStr( pose.position, 
                                                                       pose.orientation, 
                                                                       this.controllers[ vrDisplay.displayName ].scaleFactor ));
        controller.right = gamepad;
    }

    this.onUpdate( viewarea, vrDisplay, controller );
}

x3dom.VRControllerManager.prototype.onUpdate = function( viewarea, vrDisplay, controllers )
{
    var transMat = new x3dom.fields.SFMatrix4f();
    var rotMat = new x3dom.fields.SFMatrix4f();

    if(controllers.left)
    {
        console.log(controllers.left.buttons[1]);
    }
    

    // transMat.setTranslate(new x3dom.fields.SFVec3f(0, 0, -5));

    viewarea.vrLeftViewMatrix  = viewarea.vrLeftViewMatrix.mult(transMat).mult(rotMat);
    viewarea.vrRightViewMatrix = viewarea.vrRightViewMatrix.mult(transMat).mult(rotMat);
}

x3dom.VRControllerManager.prototype._getMatrixStr = function( position, orientation, scale )
{
    position    = position || [ 0.2, -0.3, -0.3 ];
    orientation = orientation || [ 0, 0, 0, 1 ];
    scale       = scale || 1;

    var x = orientation[0], y = orientation[1], z = orientation[2], w = orientation[3];

    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;

    var str = "";

    str += (1 - (yy + zz)) * scale + " ";
    str += (xy + wz) * scale + " ";
    str += (xz - wy) * scale + " ";
    str += 0 + " ";
    str += (xy - wz) * scale + " ";
    str += (1 - (xx + zz)) * scale + " ";
    str += (yz + wx) * scale + " ";
    str += 0 + " ";
    str += (xz + wy) * scale + " ";
    str += (yz - wx) * scale + " ";
    str += (1 - (xx + yy)) * scale + " ";
    str += 0 + " ";
    str += position[0] + " ";
    str += position[1] + " ";
    str += position[2] + " ";
    str += 1;

    return str;
}
