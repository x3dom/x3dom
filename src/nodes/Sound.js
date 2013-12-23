/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### X3DSoundNode ### */
x3dom.registerNodeType(
    "X3DSoundNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSoundNode.superClass.call(this, ctx);
        }
    )
);

/* ### Sound ### */
x3dom.registerNodeType(
    "Sound",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DSoundNode,
        function (ctx) {
            x3dom.nodeTypes.Sound.superClass.call(this, ctx);

            this.addField_SFNode('source', x3dom.nodeTypes.X3DSoundSourceNode);
        },
        {
            nodeChanged: function()
            {
                if (this._cf.source.node || !this._xmlNode) {
                    return;
                }

                x3dom.debug.logInfo("No AudioClip child node given, searching for &lt;audio&gt; elements...");
                /** USAGE e.g.:
                    <sound>
                        <audio src='sound/spita.wav' loop='loop'></audio>
                    </sound>
                */
                try {
                    Array.forEach( this._xmlNode.childNodes, function (childDomNode) {
                        if (childDomNode.nodeType === 1)
                        {
                            // For testing: look for <audio> element if no child
                            x3dom.debug.logInfo("### Found &lt;"+childDomNode.nodeName+"&gt; tag.");

                            if (childDomNode.localName.toLowerCase() === "audio")
                            {
                                var loop = childDomNode.getAttribute("loop");
                                loop = loop ? (loop.toLowerCase() === "loop") : false;

                                // TODO; check if crash still exists and clean-up code
                                // work around strange crash in Chrome
                                // by creating new audio element here

                                /*
                                var src = childDomNode.getAttribute("src");
                                var newNode = document.createElement('audio');
                                newNode.setAttribute('autobuffer', 'true');
                                newNode.setAttribute('src', src);
                                */
                                var newNode = childDomNode.cloneNode(false);

                                childDomNode.parentNode.removeChild(childDomNode);
                                childDomNode = null;
								
								if(navigator.appName != "Microsoft Internet Explorer") {
									document.body.appendChild(newNode);
								}

                                var startAudio = function() {
                                    newNode.play();
                                };

                                var audioDone = function() {
                                    if (loop) {
                                        newNode.play();
                                    }
                                };

                                newNode.addEventListener("canplaythrough", startAudio, true);
                                newNode.addEventListener("ended", audioDone, true);
                            }
                        }
                    } );
                }
                catch(e) {
                    x3dom.debug.logException(e);
                }
            }
        }
    )
);


/* ### X3DSoundSourceNode ### */
x3dom.registerNodeType(
    "X3DSoundSourceNode",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DTimeDependentNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSoundSourceNode.superClass.call(this, ctx);
        }
    )
);

/* ### AudioClip ### */
x3dom.registerNodeType(
    "AudioClip",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DSoundSourceNode,
        function (ctx) {
            x3dom.nodeTypes.AudioClip.superClass.call(this, ctx);

            this.addField_MFString(ctx, 'url', []);
            this.addField_SFBool(ctx, 'enabled', true);
            this.addField_SFBool(ctx, 'loop', false);

            this._audio = null;
        },
        {
            nodeChanged: function()
            {
                this._audio = document.createElement('audio');
                this._audio.setAttribute('autobuffer', 'true');
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
                    that._audio.play();
                };

                var audioDone = function()
                {
                    if (that._vf.loop === true)
                    {
                        that._audio.play();
                    }
                };

                this._audio.addEventListener("canplaythrough", startAudio, true);
                this._audio.addEventListener("ended", audioDone, true);
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
                    if (this._vf.loop === true)
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
