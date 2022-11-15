x3dom.VRControllerManager = function ()
{
    this.leftInline     = undefined;
    this.leftTransform  = undefined;
    this.rightInline    = undefined;
    this.rightTransform = undefined;
    this.wasPresenting  = false;
    this.modelsAdded    = false;

    this._controllers = {
        "htc-vive" : {
            left        : "https://x3dom.org/download/assets/vr/vive.glb",
            right       : "https://x3dom.org/download/assets/vr/vive.glb",
            scaleFactor : new x3dom.fields.SFVec3f( 40, 40, 40 ),
            offset      : new x3dom.fields.SFVec3f(),
            axesScale   : [ 1, 1 ]
        },
        "oculus-touch" : {
            left        : "https://x3dom.org/download/assets/vr/oculus-touch-left.glb",
            right       : "https://x3dom.org/download/assets/vr/oculus-touch-right.glb",
            scaleFactor : new x3dom.fields.SFVec3f( 39.5, 39.5, 39.5 ),
            offset      : new x3dom.fields.SFVec3f(),
            axesScale   : [ 1, 1 ]
        },
        "oculus-go" : {
            left        : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            right       : "https://x3dom.org/download/assets/vr/oculus-go.glb",
            scaleFactor : new x3dom.fields.SFVec3f( 1, 1, 1 ),
            offset      : new x3dom.fields.SFVec3f( 0.2, -0.3, -0.3 ),
            axesScale   : [ -1, 1 ]
        }
    };

    this._addInlines();
};

x3dom.VRControllerManager.prototype._addInlines = function ()
{
    var x3dScene = document.querySelector( "scene" ) || document.querySelector( "Scene" );

    if ( x3dScene )
    {
        this.leftTransform  = document.createElement( "matrixtransform" );
        this.leftInline     = document.createElement( "inline" );

        this.rightTransform  = document.createElement( "matrixtransform" );
        this.rightInline     = document.createElement( "inline" );

        this.leftInline.setAttribute( "render", "false" );
        this.rightInline.setAttribute( "render", "false" );

        this.leftTransform.appendChild( this.leftInline );
        this.rightTransform.appendChild( this.rightInline );

        x3dScene.appendChild( this.leftTransform );
        x3dScene.appendChild( this.rightTransform );
    }
};

x3dom.VRControllerManager.prototype._addControllerModels = function ( controllers )
{
    if ( this.modelsAdded )
    {
        return;
    }

    if ( controllers.left )
    {
        const url = this._getControllerModelURL( controllers.left.type, "left" );

        this.leftInline.setAttribute( "url", url );
    }

    if ( controllers.right )
    {
        const url = this._getControllerModelURL( controllers.right.type, "right" );

        this.rightInline.setAttribute( "url", url );
    }

    this.modelsAdded = true;
};

x3dom.VRControllerManager.prototype._getControllerAxesScale = function ( type )
{
    if ( this._controllers[ type ] === undefined )
    {
        return [ 1, 1 ];
    }

    return this._controllers[ type ].axesScale;
};

x3dom.VRControllerManager.prototype._getControllerModelURL = function ( type, side )
{
    if ( this._controllers[ type ] === undefined )
    {
        return "";
    }

    return this._controllers[ type ][ side ];
};

x3dom.VRControllerManager.prototype._getControllerOffset = function ( type )
{
    if ( this._controllers[ type ] === undefined )
    {
        return [ 0, 0, 0 ];
    }

    return this._controllers[ type ].offset;
};

x3dom.VRControllerManager.prototype._getControllerScaleFactor = function ( type )
{
    if ( this._controllers[ type ] === undefined )
    {
        return [ 1, 1, 1 ];
    }

    return this._controllers[ type ].scaleFactor;
};

x3dom.VRControllerManager.prototype.fit = function ( viewarea )
{
    var min = viewarea._scene._lastMin;
    var max = viewarea._scene._lastMax;

    var dia2 = max.subtract( min ).multiply( 0.5 );    // half diameter
    var bsr = dia2.length();                       // bounding sphere radius

    var viewDir = viewarea.vrLeftViewMatrix.e2();

    var aspect =  Math.min( viewarea._width / viewarea._height, 1 );

    var tanfov2 = Math.tan( 0.5 * Math.PI / 2.0 );
    var dist = bsr / tanfov2 / aspect;

    viewarea._movement = viewDir.multiply( -dist );
};

x3dom.VRControllerManager.prototype.update = function ( viewarea, vrFrameData )
{
    if ( !vrFrameData )
    {
        if ( this.wasPresenting )
        {
            this.leftInline.setAttribute( "render", "false" );
            this.rightInline.setAttribute( "render", "false" );

            this.wasPresenting = false;
        }

        return;
    }

    if ( !this.wasPresenting )
    {
        this.leftInline.setAttribute( "render", "true" );
        this.rightInline.setAttribute( "render", "true" );

        this.fit( viewarea );

        this.wasPresenting = true;
    }

    this._addControllerModels( vrFrameData.controllers );
    this._updateMatrices( viewarea, vrFrameData.controllers );
    this._updateControllerModels( viewarea, vrFrameData.controllers );
};

x3dom.VRControllerManager.prototype._updateMatrices = function ( viewarea, controllers )
{
    var transMat = new x3dom.fields.SFMatrix4f();
    var rotMat = new x3dom.fields.SFMatrix4f();
    var axes = [ 0, 0 ];

    if ( controllers.left )
    {
        var axesScale = this._getControllerAxesScale( controllers.left.type );

        axes[ 0 ] += controllers.left.gamepad.axes[ 0 ] * axesScale[ 0 ];
        axes[ 1 ] += controllers.left.gamepad.axes[ 1 ] * axesScale[ 1 ];

        if ( controllers.left.gamepad.buttons[ 0 ].pressed )
        {
            this.fit( viewarea );
        }
    }

    if ( controllers.right )
    {
        var axesScale = this._getControllerAxesScale( controllers.right.type );

        axes[ 0 ] += controllers.right.gamepad.axes[ 0 ] * axesScale[ 0 ];
        axes[ 1 ] += controllers.right.gamepad.axes[ 1 ] * axesScale[ 1 ];

        if ( controllers.right.gamepad.buttons[ 0 ].pressed )
        {
            this.fit( viewarea );
        }
    }

    var dx = axes[ 0 ] * 5;
    var dy = axes[ 1 ] * 5;

    var viewDir = viewarea.vrLeftViewMatrix.e2();
    var rightDir = viewarea.vrLeftViewMatrix.e0();

    var d = ( viewarea._scene._lastMax.subtract( viewarea._scene._lastMin ) ).length();
    d = ( ( d < x3dom.fields.Eps ) ? 1 : d );

    viewDir  = new x3dom.fields.SFVec3f( -viewDir.x,  -viewDir.y,  viewDir.z ).multiply( d * ( dy / viewarea._height ) );
    rightDir = new x3dom.fields.SFVec3f( -rightDir.x, -rightDir.y, rightDir.z ).multiply( d * ( dx / viewarea._width ) );

    viewarea._movement = viewarea._movement.add( rightDir ).add( viewDir );
    transMat = x3dom.fields.SFMatrix4f.translation( viewarea._movement );

    viewarea.vrLeftViewMatrix  = viewarea.vrLeftViewMatrix.mult( transMat ).mult( rotMat );
    viewarea.vrRightViewMatrix = viewarea.vrRightViewMatrix.mult( transMat ).mult( rotMat );

    //Enable default Mouse Navigation
    // viewarea.vrLeftViewMatrix  = viewarea.vrLeftViewMatrix.mult(viewarea._transMat).mult(viewarea._rotMat);
    // viewarea.vrRightViewMatrix = viewarea.vrRightViewMatrix.mult(viewarea._transMat).mult(viewarea._rotMat);
};

x3dom.VRControllerManager.prototype._updateControllerModels = function ( viewarea, controllers )
{
    if ( controllers.left )
    {
        var pose     = controllers.left.pose;
        var offset   = this._getControllerOffset( controllers.left.type );
        var rotation = ( pose.orientation ) ? x3dom.fields.Quaternion.fromArray( pose.orientation ) : new x3dom.fields.Quaternion();
        var position = ( pose.position ) ? x3dom.fields.SFVec3f.fromArray( pose.position ) : offset;
        var scale    = this._getControllerScaleFactor( controllers.left.type );

        position = position.subtract( viewarea._movement );

        var matrix = x3dom.fields.SFMatrix4f.fromRotationTranslationScale( rotation, position, scale );

        this.leftTransform.setAttribute( "matrix", matrix.toString() );
    }

    if ( controllers.right )
    {
        var pose     = controllers.right.pose;
        var offset   = this._getControllerOffset( controllers.right.type );
        var rotation = ( pose.orientation ) ? x3dom.fields.Quaternion.fromArray( pose.orientation ) : new x3dom.fields.Quaternion();
        var position = ( pose.position ) ? x3dom.fields.SFVec3f.fromArray( pose.position ) : offset;
        var scale    = this._getControllerScaleFactor( controllers.right.type );

        position = position.subtract( viewarea._movement );

        var matrix = x3dom.fields.SFMatrix4f.fromRotationTranslationScale( rotation, position, scale );

        this.rightTransform.setAttribute( "matrix", matrix.toString() );
    }
};