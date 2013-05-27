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

// ### BVHRefiner ###
x3dom.registerNodeType(
    "BVHRefiner",
    "Navigation",
    defineClass(x3dom.nodeTypes.X3DLODNode,
        function (ctx) {
            x3dom.nodeTypes.BVHRefiner.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'factor', 1.0);
            this.addField_SFInt32(ctx, 'maxDepth', 3);
            this.addField_SFVec2f(ctx, 'size', 1, 1);
            this.addField_SFVec3f(ctx, 'octSize', 1, 1, 1);
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);
            this.addField_SFString(ctx, 'url', "");
            this.addField_SFString(ctx, 'elevationUrl', "");
            this.addField_SFString(ctx, 'textureUrl', "");
            this.addField_SFString(ctx, 'normalUrl', "");
            this.addField_SFString(ctx, 'mode', "");
            this.addField_SFString(ctx, 'subMode', "wmts");
            this.addField_SFString(ctx, 'imageFormat', "png");
            this.addField_SFString(ctx, 'elevationFormat', "png");
            this.addField_SFString(ctx, 'textureFormat', "png");
            this.addField_SFString(ctx, 'normalFormat', "png");
            this.addField_SFFloat(ctx, 'maxElevation', 1.0);
            this.addField_SFBool(ctx, 'lit', true);

            if (this._vf.mode === "bin") {
                // creating the root-node of the quadtree
                this.rootNode = new QuadtreeNodeBin(ctx, this, 0, 0, 0, null);
            }
            else if (this._vf.mode === "3d" || this._vf.mode === "2d") {
                // 2D-Mesh that will represent the geometry of this node
                var geometry = new x3dom.nodeTypes.Plane(ctx);
                // definition the parameters of the geometry
                geometry._vf.subdivision.setValues(this._vf.subdivision);
                geometry.fieldChanged("subdivision");
                geometry._vf.size.setValues(this._vf.size);
                geometry._vf.center.setValues(this._vf.center);
                
                if (this._vf.mode === "2d") {
                    if (this._vf.subMode === "wmts"){
                        // creating the root-node of the quadtree
                        this.rootNode = new QuadtreeNode2dWMTS(ctx, this, 0, 0,
                                                               new x3dom.fields.SFMatrix4f.identity(), 
                                                               0, 0, geometry);
                    }
                    else {
                        // creating the root-node of the quadtree
                        this.rootNode = new QuadtreeNode2D(ctx, this, 0, 0,
                                                           new x3dom.fields.SFMatrix4f.identity(), 
                                                           0, 0, geometry, "/", 1);
                    }
                }
                else {
                    if (this._vf.subMode === "32bit"){
                        this.rootNode = new QuadtreeNode3D_32bit(ctx, this, 0, 0,
                                                           new x3dom.fields.SFMatrix4f.identity(), 
                                                           0, 0, geometry);
                    }
                    else {
                        this.rootNode = new QuadtreeNode3D(ctx, this, 0, 0,
                                                           new x3dom.fields.SFMatrix4f.identity(), 
                                                           0, 0, geometry);
                    }
                }
            }
            else if (this._vf.mode === "oct"){
                // creating the root-node of the quadtree
                this.rootNode = new OctreeNode(ctx, this, 0, new x3dom.fields.SFMatrix4f.identity());
            }
            else {
                x3dom.debug.logError("Error attribute mode. Value: '" + this._vf.mode +
                                     "' isn't conform. Please use type 'bin', '2d' or '3d'");
            }
        },
        {
            visitChildren: function(transform, drawableCollection, singlePath, invalidateCache, planeMask) {
                this.createChildren = 0;
                singlePath = false;         // TODO (specify if unique node path or multi-parent)
                invalidateCache = true;     // TODO (reuse world transform and volume cache)
                this.rootNode.collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
            },

            getVolume: function()
            {
                var vol = this._graph.volume;

                if (!this.volumeValid() && this._vf.render)
                {
                    var childVol = this.rootNode.getVolume();
                    if (childVol && childVol.isValid())
                        vol.extendBounds(childVol.min, childVol.max);
                }
                
                return vol;
            }
        }
    )
);



/*
 * Defines one 2D node (plane) of a quadtree that represents a part 
 * (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode2D}
 */
function QuadtreeNode2dWMTS(ctx, terrain, level, nodeNumber, nodeTransformation, 
                            columnNr, rowNr, geometry)
{

     // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // true if components are available and renderable
    var exists = true;
    // url of the data source
    var url = terrain._vf.url + "/" + level + "/" + columnNr + 
              "/" + rowNr + "." + (terrain._vf.imageFormat).toLowerCase();
    // defines the resizing factor
    var resizeFac = (terrain._vf.size.x + terrain._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};
    
    
    
    /* 
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // texture that should represent the surface-data of this node
        var texture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = terrain._nameSpace;
        
        // definition of texture
        texture._nameSpace = terrain._nameSpace;
        texture._vf.url[0] = url;

        // calculate the average position of the node
        position = nodeTransformation.e3();
        
        // add textures to the appearence of this node
        appearance.addChild(texture);
        texture.nodeChanged();

        // create shape with geometry and appearance data
        shape._cf.geometry.node = geometry;
        shape._cf.appearance.node = appearance;
        geometry.nodeChanged();
        appearance.nodeChanged();

        // add shape to terrain object
        terrain.addChild(shape);
        shape.nodeChanged();
        
        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }
    
    
    
    /* 
     * Creates the four children 
     */
    function create() {
        
        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + 
                           (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        
        // calculation of the scaling factor
        var s = (terrain._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode2dWMTS(ctx, terrain, (level + 1), lt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, terrain, (level + 1), rt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, terrain, (level + 1), lb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode2dWMTS(ctx, terrain, (level + 1), rb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }    
    
    
    
    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        // decision if culled, drawn etc...
        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /* 
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}



/*
 * Defines one 2D node (plane) of a quadtree that represents a part 
 * (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode2D}
 */
function QuadtreeNode2D(ctx, terrain, level, nodeNumber, nodeTransformation, 
                        columnNr, rowNr, geometry, path, imgNumber)
{

     // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // true if components are available and renderable
    var exists = true;
    // url of the data source
    var url = terrain._vf.url + path + imgNumber + ".png";
    // terrain._vf.url + "/" + level + "/" + columnNr + "/" + rowNr + "." + (terrain._vf.imageFormat).toLowerCase()
    // defines the resizing factor
    var resizeFac = (terrain._vf.size.x + terrain._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};
    
    
    
    /* 
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // texture that should represent the surface-data of this node
        var texture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = terrain._nameSpace;
        
        // definition of texture
        texture._nameSpace = terrain._nameSpace;
        texture._vf.url[0] = url;

        // calculate the average position of the node
        position = nodeTransformation.e3();
        
        // add textures to the appearence of this node
        appearance.addChild(texture);
        texture.nodeChanged();

        // create shape with geometry and appearance data
        shape._cf.geometry.node = geometry;
        shape._cf.appearance.node = appearance;
        geometry.nodeChanged();
        appearance.nodeChanged();

        // add shape to terrain object
        terrain.addChild(shape);
        shape.nodeChanged();
        
        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
    }
    
    
    
    /* 
     * Creates the four children 
     */
    function create() {
        
        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + 
                           (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        
        // calculation of the scaling factor
        var s = (terrain._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode2D(ctx, terrain, (level + 1), lt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry, path + imgNumber + "/", 1));
        children.push(new QuadtreeNode2D(ctx, terrain, (level + 1), rt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry, path + imgNumber + "/", 3));
        children.push(new QuadtreeNode2D(ctx, terrain, (level + 1), lb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry, path + imgNumber + "/", 2));
        children.push(new QuadtreeNode2D(ctx, terrain, (level + 1), rb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry, path + imgNumber + "/", 4));
    }    
    
    
    
    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        // decision if culled, drawn etc...
        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /* 
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}



/*
 * Defines one 3D node (plane with displacement) of a quadtree that represents 
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D_NEW(ctx, terrain, level, nodeNumber, nodeTransformation, 
                        columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the terrain surface
    var imageAddressColor = terrain._vf.textureUrl + "/" + level + "/" + 
                            columnNr + "/" + rowNr + "." + 
                            (terrain._vf.textureFormat).toLowerCase();
    // address of the image for the terrain height-data
    var imageAddressHeight = terrain._vf.elevationUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.elevationFormat).toLowerCase();
    // address of the image for the terrain normal-data
    var imageAddressNormal = terrain._vf.normalUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.normalFormat).toLowerCase();
    // true if components are available and renderable
    var exists = true;
    // defines the resizing factor
    var resizeFac = (terrain._vf.size.x + terrain._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /* 
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var shader = new x3dom.nodeTypes.CommonSurfaceShader(ctx);
        var ssTexColor = new x3dom.nodeTypes.SurfaceShaderTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        var ssTexDisplace = new x3dom.nodeTypes.SurfaceShaderTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = terrain._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();
       
        shader._vf.displacementFactor = terrain._vf.maxElevation;
       
        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = terrain._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        ssTexColor.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        shader.addChild(ssTexColor, 'diffuseTexture');
        ssTexColor.nodeChanged();

        // create height-data
        heightTexture._nameSpace = terrain._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;
        ssTexDisplace.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        shader.addChild(ssTexDisplace, 'displacementTexture');
        heightTexture.nodeChanged(); 

        appearance.addChild(shader, 'shaders');
        shader.nodeChanged();

        // create shape with geometry and appearance data
        shape._cf.geometry.node = geometry;
        shape._cf.appearance.node = appearance;
        geometry.nodeChanged();
        appearance.nodeChanged();

        // add shape to terrain object
        terrain.addChild(shape);
        shape.nodeChanged();
        
        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.min.z = -Math.round(terrain._vf.maxElevation / 2);
        cullObject.volume.max.z = Math.round(terrain._vf.maxElevation / 2);
    }



    /* 
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader 
     */
    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texHeight;\n" +
            "uniform float maxElevation;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "const float shininess = 32.0;\n" + 
            "\n" +
            "void main(void) {\n" +
            "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
            "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
            "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
            "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
            "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
            "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
            "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
            "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
            "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
            "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
            "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
            "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
            "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
            "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
            "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
            "    float specularLightWeight = pow(rdotv, shininess);" +
            "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
            "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, height.x * maxElevation, 1.0);\n" +
            "}\n";
    }


    
    /* 
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader 
     */
    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    gl_FragColor = vec4(colr.xyz * vLight, colr.w);\n" +
            "}\n";
    }



    /* 
     * Creates the four children 
     */
    function create() {
        
        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + 
                           (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        
        // calculation of the scaling factor
        var s = (terrain._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D_NEW(ctx, terrain, (level + 1), lt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, terrain, (level + 1), rt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, terrain, (level + 1), lb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D_NEW(ctx, terrain, (level + 1), rb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /* 
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}



/*
 * Defines one node of a quadtree that represents a part (nxn vertices) of 
 * the whole mesh, that represents a binary geometry object.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {number} resizeFac defines the resizing factor. Can be null on init
 * @returns {QuadtreeNodeBin}
 */
function QuadtreeNodeBin(ctx, terrain, level, columnNr, rowNr, resizeFac)
{
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // factor redefinition to get a view about the whole scene on level three
    var fac = terrain._vf.factor + level * 5;
    
    // array with the maximal four child nodes
    var children = [];
    // path to x3d-file that should be loaded
    var path = terrain._vf.url + "/" + level + "/" + columnNr + "/";
    // address of the image for the terrain height-data
    var file = path + rowNr + ".x3d";
    // position of the node in world space
    var position = null;
    // stores if file has been loaded
    var exists = false;
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape(ctx);
    // loader for binary geometry files
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
    // Try to load the binary geometry files
    try {
        xhr.send();

        var xmlDoc = xhr.responseXML;
        if (xmlDoc !== null) {
            var replacer = new RegExp("\"", "g");
            createGeometry(shape);
            initialize();
            exists = true;
        }
        var imgAddress = xmlDoc.getElementsByTagName("ImageTexture")[0].
                         getAttribute("url").replace(replacer, "");
    }
    catch (exp) {
        x3dom.debug.logException("Error loading file '" + file + "': " + exp);
    }



    /*
     * creates the geometry of this node
     */
    function createGeometry(parent) {
        var binGeo = xmlDoc.getElementsByTagName("BinaryGeometry")[0];

        if (parent && parent._nameSpace && binGeo) {
            var geometry = parent._nameSpace.setupTree(binGeo);
            parent.addChild(geometry);
            geometry.nodeChanged();
            if (level === 0) {
                resizeFac = (geometry._vf.size.x + 
                             geometry._vf.size.y) / 2;
            }
            position = x3dom.fields.SFVec3f.copy(geometry._vf.position);
        }
    }



    /*
     * creates the appearance for this node and add it to the dom tree
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);

        // definition of nameSpace
        shape._nameSpace = new x3dom.NodeNameSpace("", terrain._nameSpace.doc);
        shape._nameSpace.setBaseURL(terrain._nameSpace.baseURL + path);

        // creation of texture
        colorTexture._nameSpace = shape._nameSpace;
        colorTexture._vf.url[0] = imgAddress;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();

        // add textures and appearance
        appearance.addChild(textures);
        textures.nodeChanged();
        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.nodeChanged();
        
        // bind static cull-properties to cullObject
        cullObject.boundedNode = shape; 
        cullObject.volume = shape.getVolume();
    }



    /*
     * creates the four child-nodes
     */
    function create() {
        children.push(new QuadtreeNodeBin(ctx, terrain, (level + 1), (columnNr * 2), (rowNr * 2), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, terrain, (level + 1), (columnNr * 2 + 1), (rowNr * 2), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, terrain, (level + 1), (columnNr * 2), (rowNr * 2 + 1), resizeFac));
        children.push(new QuadtreeNodeBin(ctx, terrain, (level + 1), (columnNr * 2 + 1), (rowNr * 2 + 1), resizeFac));
    }



    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = transform;

        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            
            // terrain._vf.factor instead (level * 16)
            if (level < 3 || (distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / fac)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                    shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(transform, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(transform, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}





/*
 * Defines one node of an octree that represents a part (nxn vertices) of 
 * the whole point cloud
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {number} resizeFac defines the resizing factor. Can be null on init
 * @returns {QuadtreeNodeBin}
 */
function OctreeNode(ctx, terrain, level, nodeTransformation)
{
    // array with the maximal four child nodes
    var children = [];
    // position of the node in world space
    var position = nodeTransformation.e3();
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape(ctx);
    // object that stores all information to do a frustum culling
    var cullObject = {};
    // defines the resizing factor
    var resizeFac = (terrain._vf.octSize.x + terrain._vf.octSize.y + terrain._vf.octSize.z) / 3.0;
    
    

    /*
     * creates the appearance for this node and add it to the dom tree
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        var geometry = new x3dom.nodeTypes.Box(ctx);
        
        geometry._vf.size = terrain._vf.octSize;
        geometry.fieldChanged('size');
        
        // definition of nameSpace
        shape._nameSpace = new x3dom.NodeNameSpace("", terrain._nameSpace.doc);
        shape._nameSpace.setBaseURL(terrain._nameSpace.baseURL);

        shape.addChild(appearance);
        appearance.nodeChanged();
        shape.addChild(geometry);
        geometry.nodeChanged();
        shape.nodeChanged();
        
        // bind static cull-properties to cullObject
        cullObject.boundedNode = shape; 
        cullObject.volume = shape.getVolume();
    }



    /*
     * creates the four child-nodes
     */
    function create() {
        // calculation of the scaling factor
        var s = terrain._vf.octSize.multiply(0.25);

        // creation of all children
        children.push(new OctreeNode(ctx, terrain, (level + 1), 
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1), 
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, -s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, -s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, -s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
        children.push(new OctreeNode(ctx, terrain, (level + 1),
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, -s.z))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 0.5)))));
    }



    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {
        
        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        if ((planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
        
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));

            // terrain._vf.factor instead (level * 16)
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0){
                    create();
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /*
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first box as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}
















/*
 * Defines one 3D node (plane with displacement) of a quadtree that represents 
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D(ctx, terrain, level, nodeNumber, nodeTransformation, 
                        columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the terrain surface
    var imageAddressColor = terrain._vf.textureUrl + "/" + level + "/" + 
                            columnNr + "/" + rowNr + "." + 
                            (terrain._vf.textureFormat).toLowerCase();
    // address of the image for the terrain height-data
    var imageAddressHeight = terrain._vf.elevationUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.elevationFormat).toLowerCase();
    // address of the image for the terrain normal-data
    var imageAddressNormal = terrain._vf.normalUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.normalFormat).toLowerCase();
    // true if components are available and renderable
    var exists = true;
    // defines the resizing factor
    var resizeFac = (terrain._vf.size.x + terrain._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /* 
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the normal-data of this node
        var normalTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // creating the special shader for these nodes
        var composedShader = new x3dom.nodeTypes.ComposedShader(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = terrain._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();
        
        // creating the special vertex-shader for terrain-nodes
        var vertexShader = new x3dom.nodeTypes.ShaderPart(ctx);
        vertexShader._vf.type = 'vertex';
        vertexShader._vf.url[0] = createVertexShader();

        // creating the special fragment-shader for terrain-nodes
        var fragmentShader = new x3dom.nodeTypes.ShaderPart(ctx);
        fragmentShader._vf.type = 'fragment';
        fragmentShader._vf.url[0] = createFragmentShader();

        // create complete-shader with vertex- and fragment-shader
        composedShader.addChild(vertexShader, 'parts');
        composedShader.addChild(fragmentShader, 'parts');

        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = terrain._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        var colorTextureField = new x3dom.nodeTypes.Field(ctx);
        colorTextureField._vf.name = 'texColor';
        colorTextureField._vf.type = 'SFInt32';
        colorTextureField._vf.value = 0;
        composedShader.addChild(colorTextureField, 'fields');
        colorTextureField.nodeChanged();

        // create height-data
        heightTexture._nameSpace = terrain._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;
        textures.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        var heightTextureField = new x3dom.nodeTypes.Field(ctx);
        heightTextureField._vf.name = 'texHeight';
        heightTextureField._vf.type = 'SFInt32';
        heightTextureField._vf.value = 1;
        composedShader.addChild(heightTextureField, 'fields');
        heightTextureField.nodeChanged();

        // create normal-data
        normalTexture._nameSpace = terrain._nameSpace;
        normalTexture._vf.url[0] = imageAddressNormal;
        normalTexture._vf.repeatT = false;
        normalTexture._vf.repeatS = false;
        textures.addChild(normalTexture, 'texture');
        normalTexture.nodeChanged();
        var normalTextureField = new x3dom.nodeTypes.Field(ctx);
        normalTextureField._vf.name = 'texNormal';
        normalTextureField._vf.type = 'SFInt32';
        normalTextureField._vf.value = 2;
        composedShader.addChild(normalTextureField, 'fields');
        normalTextureField.nodeChanged();
        
        // transmit maximum elevation value to gpu
        var maxHeight = new x3dom.nodeTypes.Field(ctx);
        maxHeight._vf.name = 'maxElevation';
        maxHeight._vf.type = 'SFFloat';
        maxHeight._vf.value = terrain._vf.maxElevation;
        composedShader.addChild(maxHeight, 'fields');
        maxHeight.nodeChanged();

        // add textures to the appearence of this node
        appearance.addChild(textures);
        textures.nodeChanged();
        appearance.addChild(composedShader);
        composedShader.nodeChanged();

        // create shape with geometry and appearance data
        shape._cf.geometry.node = geometry;
        shape._cf.appearance.node = appearance;
        geometry.nodeChanged();
        appearance.nodeChanged();

        // add shape to terrain object
        terrain.addChild(shape);
        shape.nodeChanged();
        
        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.min.z = -Math.round(terrain._vf.maxElevation / 2);
        cullObject.volume.max.z = Math.round(terrain._vf.maxElevation / 2);
    }



    /* 
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader 
     */
    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texHeight;\n" +
            "uniform float maxElevation;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "const float shininess = 32.0;\n" + 
            "\n" +
            "void main(void) {\n" +
            "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
            "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
            "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
            "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
            "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
            "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
            "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
            "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
            "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
            "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
            "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
            "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
            "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
            "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
            "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
            "    float specularLightWeight = pow(rdotv, shininess);" +
            "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
            "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, height.x * maxElevation, 1.0);\n" +
            "}\n";
    }


    
    /* 
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader 
     */
    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    gl_FragColor = vec4(colr.xyz * vLight, colr.w);\n" +
            "}\n";
    }



    /* 
     * Creates the four children 
     */
    function create() {
        
        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + 
                           (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        
        // calculation of the scaling factor
        var s = (terrain._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D(ctx, terrain, (level + 1), lt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D(ctx, terrain, (level + 1), rt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D(ctx, terrain, (level + 1), lb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D(ctx, terrain, (level + 1), rb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /* 
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}
















/*
 * Defines one 3D node (plane with displacement) of a quadtree that represents 
 * a part (nxn vertices) of the whole mesh.
 * @param {object} ctx context
 * @param {x3dom.nodeTypes.Terrain} terrain root terrain node  
 * @param {number} level level of the node within the quadtree
 * @param {number} nodeNumber id of the node within the level
 * @param {x3dom.fields.SFMatrix4f} nodeTransformation transformation matrix that defines scale and position
 * @param {number} columnNr column number in the wmts matrix within the level
 * @param {number} rowNr row number in the wmts matrix within the level
 * @param {x3dom.nodeTypes.Plane} geometry plane
 * @returns {QuadtreeNode3D}
 */
function QuadtreeNode3D_32bit(ctx, terrain, level, nodeNumber, nodeTransformation, 
                              columnNr, rowNr, geometry)
{
    // array with the maximal four child nodes
    var children = [];
    // drawable component of this node
    var shape = new x3dom.nodeTypes.Shape();
    // position of the node in world space
    var position = null;
    // address of the image for the terrain surface
    var imageAddressColor = terrain._vf.textureUrl + "/" + level + "/" + 
                            columnNr + "/" + rowNr + "." + 
                            (terrain._vf.textureFormat).toLowerCase();
    // address of the image for the terrain height-data
    var imageAddressHeight = terrain._vf.elevationUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.elevationFormat).toLowerCase();
    // address of the image for the terrain normal-data
    var imageAddressNormal = terrain._vf.normalUrl + "/" + level + "/" + 
                             columnNr + "/" + rowNr + "." + 
                             (terrain._vf.normalFormat).toLowerCase();
    // true if components are available and renderable
    var exists = true;
    // defines the resizing factor
    var resizeFac = (terrain._vf.size.x + terrain._vf.size.y) / 2.0;
    // object that stores all information to do a frustum culling
    var cullObject = {};



    /* 
     * Initializes all nodeTypes that are needed to create the drawable
     * component for this node
     */
    function initialize() {

        // appearance of the drawable component of this node
        var appearance = new x3dom.nodeTypes.Appearance(ctx);
        // multiTexture to get heightmap and colormap to gpu
        var textures = new x3dom.nodeTypes.MultiTexture(ctx);
        // texture that should represent the surface-data of this node
        var colorTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the height-data of this node
        var heightTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // texture that should represent the normal-data of this node
        var normalTexture = new x3dom.nodeTypes.ImageTexture(ctx);
        // creating the special shader for these nodes
        var composedShader = new x3dom.nodeTypes.ComposedShader(ctx);

        // definition of the nameSpace of this shape
        shape._nameSpace = terrain._nameSpace;

        // calculate the average position of the node
        position = nodeTransformation.e3();
        
        // creating the special vertex-shader for terrain-nodes
        var vertexShader = new x3dom.nodeTypes.ShaderPart(ctx);
        vertexShader._vf.type = 'vertex';
        vertexShader._vf.url[0] = createVertexShader();

        // creating the special fragment-shader for terrain-nodes
        var fragmentShader = new x3dom.nodeTypes.ShaderPart(ctx);
        fragmentShader._vf.type = 'fragment';
        fragmentShader._vf.url[0] = createFragmentShader();

        // create complete-shader with vertex- and fragment-shader
        composedShader.addChild(vertexShader, 'parts');
        composedShader.addChild(fragmentShader, 'parts');

        // create texture-data of this node with url's of the texture data
        colorTexture._nameSpace = terrain._nameSpace;
        colorTexture._vf.url[0] = imageAddressColor;
        colorTexture._vf.repeatT = false;
        colorTexture._vf.repeatS = false;
        textures.addChild(colorTexture, 'texture');
        colorTexture.nodeChanged();
        var colorTextureField = new x3dom.nodeTypes.Field(ctx);
        colorTextureField._vf.name = 'texColor';
        colorTextureField._vf.type = 'SFInt32';
        colorTextureField._vf.value = 0;
        composedShader.addChild(colorTextureField, 'fields');
        colorTextureField.nodeChanged();

        // create height-data
        heightTexture._nameSpace = terrain._nameSpace;
        heightTexture._vf.url[0] = imageAddressHeight;
        heightTexture._vf.repeatT = false;
        heightTexture._vf.repeatS = false;
        textures.addChild(heightTexture, 'texture');
        heightTexture.nodeChanged();
        var heightTextureField = new x3dom.nodeTypes.Field(ctx);
        heightTextureField._vf.name = 'texHeight';
        heightTextureField._vf.type = 'SFInt32';
        heightTextureField._vf.value = 1;
        composedShader.addChild(heightTextureField, 'fields');
        heightTextureField.nodeChanged();

        // create normal-data
        normalTexture._nameSpace = terrain._nameSpace;
        normalTexture._vf.url[0] = imageAddressNormal;
        normalTexture._vf.repeatT = false;
        normalTexture._vf.repeatS = false;
        textures.addChild(normalTexture, 'texture');
        normalTexture.nodeChanged();
        var normalTextureField = new x3dom.nodeTypes.Field(ctx);
        normalTextureField._vf.name = 'texNormal';
        normalTextureField._vf.type = 'SFInt32';
        normalTextureField._vf.value = 2;
        composedShader.addChild(normalTextureField, 'fields');
        normalTextureField.nodeChanged();
        
        // transmit maximum elevation value to gpu
        var maxHeight = new x3dom.nodeTypes.Field(ctx);
        maxHeight._vf.name = 'maxElevation';
        maxHeight._vf.type = 'SFFloat';
        maxHeight._vf.value = terrain._vf.maxElevation;
        composedShader.addChild(maxHeight, 'fields');
        maxHeight.nodeChanged();

        // add textures to the appearence of this node
        appearance.addChild(textures);
        textures.nodeChanged();
        appearance.addChild(composedShader);
        composedShader.nodeChanged();

        // create shape with geometry and appearance data
        shape._cf.geometry.node = geometry;
        shape._cf.appearance.node = appearance;
        geometry.nodeChanged();
        appearance.nodeChanged();

        // add shape to terrain object
        terrain.addChild(shape);
        shape.nodeChanged();
        
        // definition the static properties of cullObject
        cullObject.boundedNode = shape;
        cullObject.volume = shape.getVolume();
        // setting max and min in z-direction to get the complete volume
        cullObject.volume.min.z = -Math.round(terrain._vf.maxElevation);
        cullObject.volume.max.z = Math.round(terrain._vf.maxElevation);
    }



    /* 
     * Creates the code for the vertex shader
     * @returns {String} code of the vertex shader 
     */
    function createVertexShader() {
        return "attribute vec3 position;\n" +
            "attribute vec3 texcoord;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 modelViewProjectionMatrix;\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texHeight;\n" +
            "uniform float maxElevation;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "const float shininess = 32.0;\n" + 
            "\n" +
            "void main(void) {\n" +
            "    vec3 uLightPosition = vec3(160.0, -9346.0, 4806.0);\n" +
            "    vec4 colr = texture2D(texColor, vec2(texcoord[0], 1.0-texcoord[1]));\n" +
            "    vec3 uAmbientMaterial = vec3(1.0, 1.0, 0.9);" +
            "    vec3 uAmbientLight = vec3(0.5, 0.5, 0.5);" +
            "    vec3 uDiffuseMaterial = vec3(0.7, 0.7, 0.7);" +
            "    vec3 uDiffuseLight = vec3(1.0, 1.0, 1.0);" +
            "    vec4 vertexPositionEye4 = modelViewMatrix * vec4(position, 1.0);" +
            "    vec3 vertexPositionEye3 = vec3((modelViewMatrix * vec4(vertexPositionEye4.xyz, 1.0)).xyz);" +
            "    vec3 vectorToLightSource = normalize(uLightPosition - vertexPositionEye3);" +
            "    vec4 height = texture2D(texHeight, vec2(texcoord[0], 1.0 - texcoord[1]));\n" +
            "    vec4 normalEye = 2.0 * texture2D(texNormal, vec2(texcoord[0], 1.0-texcoord[1])) - 1.0;\n" +
            "    float diffuseLightWeighting = max(dot(normalEye.xyz, vectorToLightSource), 0.0);" +
            "    texC = vec2(texcoord[0], 1.0-texcoord[1]);\n" +
            "    vec3 diffuseReflectance = uDiffuseMaterial * uDiffuseLight * diffuseLightWeighting;" +
            "    vec3 uSpecularMaterial = vec3(0.0, 0.0, 0.0);" +
            "    vec3 uSpecularLight = vec3(1.0, 1.0, 1.0);" +
            "    vec3 reflectionVector = normalize(reflect(-vectorToLightSource, normalEye.xyz));" +
            "    vec3 viewVectorEye = -normalize(vertexPositionEye3);" +
            "    float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
            "    float specularLightWeight = pow(rdotv, shininess);" +
            "    vec3 specularReflection = uSpecularMaterial * uSpecularLight * specularLightWeight;" +
            "    vLight = vec4(uAmbientMaterial * uAmbientLight + diffuseReflectance + specularReflection, 1.0).xyz;" +
            "    gl_Position = modelViewProjectionMatrix * vec4(position.xy, ((height.g * 256.0)+height.b) * maxElevation, 1.0);\n" +
            "}\n";
    }


    
    /* 
     * Creates the code for the fragment shader
     * @returns {String} code of the fragment shader 
     */
    function createFragmentShader() {
        return "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "#endif\n" +
            "uniform sampler2D texColor;\n" +
            "uniform sampler2D texNormal;\n" +
            "varying vec2 texC;\n" +
            "varying vec3 vLight;\n" +
            "\n" +
            "\n" +
            "void main(void) {\n" +
            "    vec4 normal = 2.0 * texture2D(texNormal, texC) - 1.0;\n" +
            "    vec4 colr = texture2D(texColor, texC);\n" +
            "    float coler = ((colr.g * 256.0)+colr.b) / 1.0;" +
            "    gl_FragColor = vec4(vLight * coler, 1.0);\n" +
            "}\n";
    }



    /* 
     * Creates the four children 
     */
    function create() {
        
        // calculation of children number nodeNumber within their level
        var deltaR = Math.sqrt(Math.pow(4, level));
        var deltaR1 = Math.sqrt(Math.pow(4, level + 1));
        var lt = Math.floor(nodeNumber / deltaR) * 4 * deltaR + 
                           (nodeNumber % deltaR) * 2;
        var rt = lt + 1;
        var lb = lt + deltaR1;
        var rb = lb + 1;
        
        // calculation of the scaling factor
        var s = (terrain._vf.size).multiply(0.25);

        // creation of all children
        children.push(new QuadtreeNode3D_32bit(ctx, terrain, (level + 1), lt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, terrain, (level + 1), rt,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, terrain, (level + 1), lb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(-s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2), (rowNr * 2 + 1), geometry));
        children.push(new QuadtreeNode3D_32bit(ctx, terrain, (level + 1), rb,
            nodeTransformation.mult(new x3dom.fields.SFMatrix4f.translation(
                    new x3dom.fields.SFVec3f(s.x, -s.y, 0.0))).mult(new x3dom.fields.SFMatrix4f.scale(
                    new x3dom.fields.SFVec3f(0.5, 0.5, 1.0))), (columnNr * 2 + 1), (rowNr * 2 + 1), geometry));
    }



    /* 
     * Decides to create new children and if the node shoud be drawn or not
     */
    this.collectDrawables = function (transform, drawableCollection, singlePath, invalidateCache, planeMask) {

        // definition the actual transformation of the node
        cullObject.localMatrix = nodeTransformation;
        
        if (exists && (planeMask = drawableCollection.cull(transform, cullObject, singlePath, planeMask)) > 0) {
            var mat_view = drawableCollection.viewMatrix;
            var vPos = mat_view.multMatrixPnt(position);
            var distanceToCamera = Math.sqrt(Math.pow(vPos.x, 2) + Math.pow(vPos.y, 2) + Math.pow(vPos.z, 2));
            if ((distanceToCamera < Math.pow((terrain._vf.maxDepth - level), 2) * resizeFac / terrain._vf.factor)) {
                if (children.length === 0 && terrain.createChildren === 0) {
                    terrain.createChildren++;
                    create();
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else if (children.length === 0 && terrain.createChildren > 0) {
                    shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                }
                else {
                    for (var i = 0; i < children.length; i++) {
                        children[i].collectDrawables(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
                    }
                }
            }
            else {
                shape.collectDrawableObjects(nodeTransformation, drawableCollection, singlePath, invalidateCache, planeMask);
            }
        }
    };



    /* 
     * Returns the volume of this node
     */
    this.getVolume = function() {
        // TODO; implement correctly, for now just use first shape as workaround
        return shape.getVolume();
    };



    // initializes this node directly after creating
    initialize();
}