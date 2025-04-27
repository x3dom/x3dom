/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### AudioClip ### */
x3dom.registerNodeType(
    "AudioClip",
    "Sound",
    defineClass( x3dom.nodeTypes.X3DSoundSourceNode,

        /**
         * Constructor for AudioClip
         * @constructs x3dom.nodeTypes.AudioClip
         * @x3d 3.3
         * @component Sound
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSoundSourceNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc An AudioClip node specifies audio data that can be referenced by Sound nodes.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.AudioClip.superClass.call( this, ctx );

            /**
             * The url field specifies the URL from which the sound is loaded.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "url", [] );

            /**
             * Specifies whether the clip is enabled.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "enabled", false );

            /**
             * Specifies whether the clip loops when finished.
             * @var {x3dom.fields.SFBool} loop
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "loop", false );

            this._audio = document.createElement( "audio" );
            this._audio.setAttribute( "preload", "auto" );
            //this._audio.setAttribute( "muted", "muted" );
            this._audio.setAttribute( "autoplay", "" );
            this._audio.setAttribute( "playsinline", "" );
            this._audio.crossOrigin = "anonymous";
            //this._audio.setAttribute('preload', 'none');
            //this._audio.setAttribute('autoplay', 'true');
            if ( navigator.appName != "Microsoft Internet Explorer" )
            {
                document.body.appendChild( this._audio );
            }

            this._sources = [];
        },
        {
            nodeChanged : function ()
            {
                this._createSources = function ()
                {
                    this._sources = [];
                    for ( var i = 0; i < this._vf.url.length; i++ )
                    {
                        var audioUrl = this._nameSpace.getURL( this._vf.url[ i ] );
                        x3dom.debug.logInfo( "Adding sound file: " + audioUrl );
                        var src = document.createElement( "source" );
                        src.setAttribute( "src", audioUrl );
                        this._sources.push( src );
                        this._audio.appendChild( src );
                    }
                };

                var that = this;

                this._startAudio = function ()
                {
                    //x3dom.debug.logInfo( "startAudio" );
                    window.removeEventListener( "mousedown", that._startAudio );
                    window.removeEventListener( "keydown", that._startAudio );
                    if ( !( that._audio instanceof HTMLMediaElement ) )
                    {
                        x3dom.debug.logInfo( "No audio exists." );
                        return;
                    }
                    if ( that._vf.enabled === true )
                    {
                        that._audio.play()
                            .then( function ( success )
                            {
                            } )
                            .catch( function ( error )
                            {
                                x3dom.debug.logInfo( "Waiting for interaction: " + error );  //x3dom.debug.logError( error );
                                window.addEventListener( "mousedown", that._startAudio );
                                window.addEventListener( "keydown", that._startAudio );
                            } );
                    }
                };

                this._stopAudio = function ()
                {
                    window.removeEventListener( "mousedown", that._startAudio );
                    window.removeEventListener( "keydown", that._startAudio );
                    that._audio.pause();
                };

                this._audioEnded = function ()
                {
                    if ( that._vf.enabled === true && that._vf.loop === true )
                    {
                        that._startAudio();
                    }
                };

                this._audio.addEventListener( "canplaythrough", this._startAudio, true );
                this._audio.addEventListener( "ended", this._audioEnded, true );
                this._audio.addEventListener( "error", ( e )=>{x3dom.debug.logWarning( "MediaEvent error:" + e );}, true );
                //this._audio.addEventListener( "pause", this._stopAudio, true );

                this._createSources();
            },

            fieldChanged : function ( fieldName )
            {
                if ( fieldName === "enabled" )
                {
                    if ( this._vf.enabled === true )
                    {
                        this._startAudio();
                    }
                    else
                    {
                        this._stopAudio();
                    }
                }
                else if ( fieldName === "loop" )
                {
                    //this._audio.loop = this._vf.loop;
                }
                else if ( fieldName === "url" )
                {
                    this._stopAudio();
                    while ( this._audio.hasChildNodes() )
                    {
                        this._audio.removeChild( this._audio.firstChild );
                    }

                    for ( var i = 0; i < this._vf.url.length; i++ )
                    {
                        var audioUrl = this._nameSpace.getURL( this._vf.url[ i ] );
                        x3dom.debug.logInfo( "Adding sound file: " + audioUrl );
                        var src = document.createElement( "source" );
                        src.setAttribute( "src", audioUrl );
                        this._audio.appendChild( src );
                    }
                    this._audio.load();
                }
            },

            parentRemoved : function ( parent )
            {
                x3dom.nodeTypes.X3DSoundSourceNode.prototype.parentRemoved.call( this, parent );
                if ( this._parentNodes.length === 0 && this._audio )
                {
                    this._stopAudio();
                    while ( this._audio.hasChildNodes() )
                    {
                        this._audio.removeChild( this._audio.firstChild );
                    }
                    document.body.removeChild( this._audio );
                    this._audio = null;
                }
            }
        }
    )
);
