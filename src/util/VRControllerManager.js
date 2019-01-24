x3dom.VRControllerManager = function()
{
    this.leftInline     = undefined;
    this.leftTransform  = undefined;
    this.rightInline    = undefined;
    this.rightTransform = undefined;

    this.leftGamepadIdx  = undefined;
    this.rightGamepadIdx = undefined;
    this.vrDisplay       = undefined;
    this.wasPresenting   = false;

    this.controllers = {
        "HTC Vive MV" : {
            left  : "https://x3dom.org/download/assets/vr/vive.glb",
            right : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : new x3dom.fields.SFVec3f(40, 40, 40),
            offset : new x3dom.fields.SFVec3f(),
            axesScale : [1,1]
        },
        "Oculus Oculus Rift CV1" : {
            left  : "https://x3dom.org/download/assets/vr/oculus-touch-left.glb",
            right : "https://x3dom.org/download/assets/vr/oculus-touch-right.glb",
            scaleFactor : new x3dom.fields.SFVec3f(39.5, 39.5, 39.5),
            offset : new x3dom.fields.SFVec3f(),
            axesScale : [1,1]
        },
        "Oculus Go" : {
            left  : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            right : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            scaleFactor : new x3dom.fields.SFVec3f(1, 1, 1),
            offset : new x3dom.fields.SFVec3f(0.2, -0.3, -0.3),
            axesScale : [1,-1]
        },
        "Emulated HTC Vive DVT" : {
            left  : "https://x3dom.org/download/assets/vr/vive.glb",
            right : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : new x3dom.fields.SFVec3f(40, 40, 40),
            offset : new x3dom.fields.SFVec3f(),
            axesScale : [1,1]
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

        if(display && gamepad.displayId == display.displayId)
        {
            var controller = this.controllers[ display.displayName ];

            if ( gamepad.hand == "left" )
            {
                this.leftGamepadIdx = gamepad.index;
                this.leftInline.setAttribute( "url", controller.left );
            }
            else if ( gamepad.hand == "right" )
            {
                this.rightGamepadIdx = gamepad.index;
                this.rightInline.setAttribute( "url", controller.right, controller.scaleFactor );
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

        this.leftInline.setAttribute("render", "false");
        this.rightInline.setAttribute("render", "false");
    
        this.leftTransform.appendChild(this.leftInline);
        this.rightTransform.appendChild(this.rightInline);

        x3dScene.appendChild(this.leftTransform);
        x3dScene.appendChild(this.rightTransform);
    }
}
x3dom.VRControllerManager.prototype.fit = function( viewarea, vrDisplay )
{
    var min = viewarea._scene._lastMin;
    var max = viewarea._scene._lastMax;

    var dia2 = max.subtract(min).multiply(0.5);    // half diameter
    var bsr = dia2.length();                       // bounding sphere radius

    var viewDir = viewarea.vrLeftViewMatrix.e2();

    var aspect =  Math.min(viewarea._width/viewarea._height, 1);

    var tanfov2 = Math.tan(1.57 / 2.0);
    var dist = bsr / tanfov2 / aspect;

    viewarea._movement = viewDir.multiply(-dist)
}


x3dom.VRControllerManager.prototype.update = function( viewarea, vrDisplay )
{
    if ( !vrDisplay || (vrDisplay && !vrDisplay.isPresenting) )
    {
        if(this.wasPresenting)
        {
            this.leftInline.setAttribute("render", "false");
            this.rightInline.setAttribute("render", "false");
    
            this.wasPresenting = false;
        }
        
        return;
    }
    else
    {
        if(!this.wasPresenting)
        {
            this.leftInline.setAttribute("render", "true");
            this.rightInline.setAttribute("render", "true");

            this.fit(viewarea, vrDisplay);
        }

        this.wasPresenting = true;
    }

    var gamepads = navigator.getGamepads();
    var controller = {};

    if (this.leftGamepadIdx != undefined && gamepads[ this.leftGamepadIdx ] )
    {
        var gamepad = gamepads[ this.leftGamepadIdx ];
        controller.left = gamepad;
    }

    if (this.rightGamepadIdx != undefined && gamepads[ this.rightGamepadIdx ] )
    {
        var gamepad = gamepads[ this.rightGamepadIdx ];
        controller.right = gamepad;
    }

    this.onUpdate( viewarea, vrDisplay, controller );
}

x3dom.VRControllerManager.prototype.onUpdate = function( viewarea, vrDisplay, controllers )
{
    var transMat = new x3dom.fields.SFMatrix4f();
    var rotMat = new x3dom.fields.SFMatrix4f();
    var axes = [0, 0];
    var axesScale = this.controllers[vrDisplay.displayName].axesScale;

    if(controllers.left)
    {   
        axes[0] += controllers.left.axes[0] * axesScale[0];
        axes[1] += controllers.left.axes[1] * axesScale[1];

        if(controllers.left.buttons[1].pressed)
        {
            this.fit(viewarea);
        }
    }
    
    if(controllers.right)
    {
        axes[0] += controllers.right.axes[0] * axesScale[0];
        axes[1] += controllers.right.axes[1] * axesScale[1];

        if(controllers.right.buttons[1].pressed)
        {
            this.fit(viewarea);
        }
    }

    var dx = axes[0] * 5;
    var dy = axes[1] * 5;

    var viewDir = viewarea.vrLeftViewMatrix.e2();
    var rightDir = viewarea.vrLeftViewMatrix.e0();

    var d = (viewarea._scene._lastMax.subtract(viewarea._scene._lastMin)).length();
    d = ((d < x3dom.fields.Eps) ? 1 : d);

    viewDir  = new x3dom.fields.SFVec3f(-viewDir.x,  -viewDir.y,  viewDir.z ).multiply(d * (dy/viewarea._height));
    rightDir = new x3dom.fields.SFVec3f(-rightDir.x, -rightDir.y, rightDir.z).multiply(d * (dx/viewarea._width) );

    viewarea._movement = viewarea._movement.add(rightDir).add(viewDir);
    transMat = x3dom.fields.SFMatrix4f.translation(viewarea._movement);

    viewarea.vrLeftViewMatrix  = viewarea.vrLeftViewMatrix.mult(transMat).mult(rotMat);
    viewarea.vrRightViewMatrix = viewarea.vrRightViewMatrix.mult(transMat).mult(rotMat);

    //Enable default Mouse Navigation
    // viewarea.vrLeftViewMatrix  = viewarea.vrLeftViewMatrix.mult(viewarea._transMat).mult(viewarea._rotMat);
    // viewarea.vrRightViewMatrix = viewarea.vrRightViewMatrix.mult(viewarea._transMat).mult(viewarea._rotMat);

    this._updateControllerModels(viewarea, vrDisplay, controllers);
}

x3dom.VRControllerManager.prototype._updateControllerModels = function( viewarea, vrDisplay, controllers )
{
    if ( !vrDisplay || (vrDisplay && !vrDisplay.isPresenting) )
    {
        this.leftInline.setAttribute("render", "false");
        this.rightInline.setAttribute("render", "false");
        return;
    }
    else
    {
        this.leftInline.setAttribute("render", "true");
        this.rightInline.setAttribute("render", "true");
    }

    if(controllers.left)
    {
        var pose = controllers.left.pose;
        var rotation = (pose.orientation) ? x3dom.fields.Quaternion.fromArray(pose.orientation) : new x3dom.fields.Quaternion();
        var position = (pose.position) ? x3dom.fields.SFVec3f.fromArray(pose.position) : this.controllers[ vrDisplay.displayName ].offset;
        var scale    = this.controllers[ vrDisplay.displayName ].scaleFactor;

        position = position.subtract(viewarea._movement);

        var matrix = x3dom.fields.SFMatrix4f.fromRotationTranslationScale(rotation, position, scale);

        this.leftTransform.setAttribute("matrix", matrix.toString());
    }

    if(controllers.right)
    {
        var pose = controllers.right.pose;
        var rotation = (pose.orientation) ? x3dom.fields.Quaternion.fromArray(pose.orientation) : new x3dom.fields.Quaternion();
        var position = (pose.position) ? x3dom.fields.SFVec3f.fromArray(pose.position) : this.controllers[ vrDisplay.displayName ].offset;
        var scale    = this.controllers[ vrDisplay.displayName ].scaleFactor;

        position = position.subtract(viewarea._movement);

        var matrix = x3dom.fields.SFMatrix4f.fromRotationTranslationScale(rotation, position, scale);

        this.rightTransform.setAttribute("matrix", matrix.toString());
    }

};