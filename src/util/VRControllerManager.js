x3dom.VRControllerManager = function()
{
    this.leftInline     = undefined;
    this.leftTransform  = undefined;
    this.rightInline    = undefined;
    this.rightTransform = undefined;

    this.leftGamepadIdx  = undefined;
    this.rightGamepadIdx = undefined;

    this.controllers = {
        "OpenVR Gamepad" : {
            left  : "https://x3dom.org/download/assets/vr/vive.glb",
            right : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : 40
        },
        "OpenVR Controller" : {
            left  : "https://x3dom.org/download/assets/vr/vive.glb",
            right : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : 40
        },
        "Oculus Touch" : {
            left  : "https://x3dom.org/download/assets/vr/oculus-touch-left.glb",
            right : "https://x3dom.org/download/assets/vr/oculus-touch-right.glb",
            scaleFactor : 40
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

    if ( !this.controllers[ gamepad.id ] )
    {
        return;
    }

    if ( gamepad.hand == "left" )
    {
        this.leftGamepadIdx = gamepad.index;
        this.leftInline.setAttribute( "url", this.controllers[ gamepad.id ].left );

        var pose = gamepad.pose;

        this.leftTransform.setAttribute("matrix", this._getMatrixStr( pose.position, pose.orientation, this.controllers[ gamepad.id ].scaleFactor ));
    }
    else if ( gamepad.hand == "right" )
    {
        this.rightGamepadIdx = gamepad.index;
        this.rightInline.setAttribute( "url", this.controllers[ gamepad.id ].right, this.controllers[ gamepad.id ].scaleFactor );
    }
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

x3dom.VRControllerManager.prototype.update = function( vrDisplay )
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

    if (this.leftGamepadIdx && gamepads[ this.leftGamepadIdx ] )
    {
        var gamepad = gamepads[ this.leftGamepadIdx ];
        var pose = gamepad.pose;

        this.leftTransform.setAttribute("matrix", this._getMatrixStr( pose.position, 
                                                                      pose.orientation,
                                                                      this.controllers[ gamepad.id ].scaleFactor ));
    }

    if (this.rightGamepadIdx && gamepads[ this.rightGamepadIdx ] )
    {
        var gamepad = gamepads[ this.rightGamepadIdx ];
        var pose = gamepad.pose;

        this.rightTransform.setAttribute("matrix", this._getMatrixStr( pose.position, 
                                                                       pose.orientation, 
                                                                       this.controllers[ gamepad.id ].scaleFactor ));
    }
}

x3dom.VRControllerManager.prototype._getMatrixStr = function( position, orientation, scale )
{
    position    = position || [ 0, 0, 0];
    orientation = orientation || [ 0, 0, 0, 1 ];
    scala       = scale || 1;

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
