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
    defineClass(x3dom.nodeTypes.X3DSoundSourceNode,
        
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
        function (ctx) {
            x3dom.nodeTypes.AudioClip.superClass.call(this, ctx);


            /**
             * The url field specifies the URL from which the sound is loaded.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            /**
             * Specifies whether the clip is enabled.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * Specifies whether the clip loops when finished.
             * @var {x3dom.fields.SFBool} loop
             * @memberof x3dom.nodeTypes.AudioClip
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'loop', false);

            this._preventAutoPlay = true;
            this._audio = null;
        
        },
        {
            nodeChanged: function()
            {
                this._audio = document.createElement('audio');
                //this._audio.setAttribute('preload', 'none');
                //this._audio.setAttribute('autoplay', 'true');
                if(navigator.appName != "Microsoft Internet Explorer") {
                    document.body.appendChild(this._audio);
                }

                for (var i=0; i<this._vf.url.length; i++)
                {
                    var audioUrl = this._nameSpace.getURL(this._vf.url[i]);
                    x3dom.debug.logInfo('Adding sound file: ' + audioUrl);
                    var src = document.createElement('source');
                    src.setAttribute('src', audioUrl);
                    this._audio.appendChild(src);
                }

                var that = this;

                var startAudio = function()
                {
                    if (that._vf.enabled === true)
                    {
                        that._audio.play();
                    }
                };

                var audioDone = function()
                {
                    if (that._vf.enabled === true && that._vf.loop === true)
                    {
                        that._audio.play();
                    }
                };


                var preventAutoPlay = function()
                {
                    if(that._preventAutoPlay)
                    {
                        that._audio.pause();
                        that._preventAutoPlay = false;
                    }
                };

                this._audio.addEventListener("canplaythrough", startAudio, true);
                this._audio.addEventListener("ended", audioDone, true);
                this._audio.addEventListener("play", preventAutoPlay, true);
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName === "enabled")
                {
                    if (this._vf.enabled === true)
                    {
                        this._audio.play();
                    }
                    else
                    {
                        this._audio.pause();
                    }
                }
                else if (fieldName === "loop")
                {
                    if (this._vf.enabled === true && this._vf.loop === true)
                    {
                        this._audio.play();
                    }
                }
                else if (fieldName === "url")
                {
                    this._audio.pause();
                    while (this._audio.hasChildNodes())
                    {
                        this._audio.removeChild(this._audio.firstChild);
                    }

                    for (var i=0; i<this._vf.url.length; i++)
                    {
                        var audioUrl = this._nameSpace.getURL(this._vf.url[i]);
                        x3dom.debug.logInfo('Adding sound file: ' + audioUrl);
                        var src = document.createElement('source');
                        src.setAttribute('src', audioUrl);
                        this._audio.appendChild(src);
                    }
                }
            },

            shutdown: function() {
                if (this._audio) {
                    this._audio.pause();
                    while (this._audio.hasChildNodes()) {
                        this._audio.removeChild(this._audio.firstChild);
                    }
                    document.body.removeChild(this._audio);
                    this._audio = null;
                }
            }
        }
    )
);