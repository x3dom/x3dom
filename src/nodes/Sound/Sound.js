/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Sound ### */
x3dom.registerNodeType(
    "Sound",
    "Sound",
    defineClass(x3dom.nodeTypes.X3DSoundNode,
        
        /**
         * Constructor for Sound
         * @constructs x3dom.nodeTypes.Sound
         * @x3d x.x
         * @component Sound
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSoundNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Sound.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} source
             * @memberof x3dom.nodeTypes.Sound
             * @initvalue x3dom.nodeTypes.X3DSoundSourceNode
             * @field x3dom
             * @instance
             */
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