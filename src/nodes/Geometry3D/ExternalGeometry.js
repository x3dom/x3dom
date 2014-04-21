/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


/* ### ExternalGeometry ### */
x3dom.registerNodeType(
    "ExternalGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,

        /**
         * Constructor for ExternalGeometry
         * @constructs x3dom.nodeTypes.ExternalGeometry
         * @x3d x.x
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
         function (ctx) {
            x3dom.nodeTypes.ExternalGeometry.superClass.call(this, ctx);

            /**
             *
             * @var {SFString} url
             * @memberof x3dom.nodeTypes.Geometry3D
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'url',  "");

        },
        {
            updateRenderData: function(shape, shaderProgram, glContext, viewarea, context) {
                var xhr;

                if (this._vf['url'] == "") {
                    return;
                }

                //TODO: simply return if we are up-to-date

                //check if there is still memory available
                if (x3dom.BinaryContainerLoader.outOfMemory) {
                    return;
                }

                //TODO: make it right
                // 0 := no BG, 1 := indexed BG, -1 := non-indexed BG
                shape._webgl.externalGeometry = -1;

                //TODO: check SOURCE child nodes
                shape._webgl.internalDownloadCount  = 1;
                shape._nameSpace.doc.downloadCount  = 1;

                //TODO: check this object - when is it called, where is it really needed?
                //shape._webgl.makeSeparateTris = {...};


                //post request
                xhr = new XMLHttpRequest();

                xhr.open("GET", encodeURI(this._vf['url']), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onload = function()
                {
                    var result = xhr.response;

                    console.log("RESULT: " + result[0]);

                    //notify renderer
                    if (shape._webgl.internalDownloadCount == 0)
                        shape._nameSpace.doc.needRender = true;

                    that.checkError(gl);
                };


            }

            /*nodeChanged: function()
            {
                Array.forEach(this._parentNodes, function (node) {
                    node._dirty.positions = true;
                    node._dirty.normals = true;
                    node._dirty.texcoords = true;
                    node._dirty.colors = true;
                });
                this._vol.invalidate();
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "index" ||fieldName == "coord" || fieldName == "normal" ||
                    fieldName == "texCoord" || fieldName == "color") {
                    this._dirty[fieldName] = true;
                    this._vol.invalidate();
                }
                else if (fieldName == "implicitMeshSize") {
                    this._vol.invalidate();
                }
            }*/

        }
    )
);
