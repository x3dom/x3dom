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


/* ### X3DPlanarGeometryNode ### */
x3dom.registerNodeType(
    "X3DPlanarGeometryNode",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for X3DPlanarGeometryNode
         * @constructs x3dom.nodeTypes.X3DPlanarGeometryNode
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DPlanarGeometryNode.superClass.call(this, ctx);
        
        }
    )
);

/* ### Arc2D ### */
x3dom.registerNodeType(
    "Arc2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Arc2D
         * @constructs x3dom.nodeTypes.Arc2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Arc2D.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} radius
             * @memberof x3dom.nodeTypes.Arc2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1);

            /**
             *
             * @var {SFFloat} startAngle
             * @memberof x3dom.nodeTypes.Arc2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'startAngle', 0);

            /**
             *
             * @var {SFFloat} endAngle
             * @memberof x3dom.nodeTypes.Arc2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);

            /**
             *
             * @var {SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Arc2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._mesh._primType = 'LINES';

            var r = this._vf.radius;
            var start = this._vf.startAngle;
            var end = this._vf.endAngle;

            // The following code ensures that:
            // 1. 0 <= startAngle < 2*Pi
            // 2. startAngle < endAngle
            // 3. endAngle - startAngle <= 2*Pi
            var Pi2 = Math.PI * 2.0;
            start -= Math.floor(start / Pi2) * Pi2;
            end -= Math.floor(end / Pi2) * Pi2;
            if (end <= start)
                end += Pi2;

            var geoCacheID = 'Arc2D_' + r + start + end;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Arc2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {

                var anzahl = this._vf.subdivision;
                var t = (end - start) / anzahl;
                var theta = start;

                for (var i = 0; i <= anzahl + 1; i++) {
                    var x = Math.cos(theta) * r;
                    var y = Math.sin(theta) * r;

                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);
                    theta += t;
                }

                for (var j = 0; j < anzahl; j++) {
                    this._mesh._indices[0].push(j);
                    this._mesh._indices[0].push(j + 1);
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "radius" || fieldName == "subdivision" ||
                    fieldName == "startAngle" || fieldName == "endAngle") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];

                    var r = this._vf.radius;
                    var start = this._vf.startAngle;
                    var end = this._vf.endAngle;
                    var anzahl = this._vf.subdivision;

                    var Pi2 = Math.PI * 2.0;
                    start -= Math.floor(start / Pi2) * Pi2;
                    end -= Math.floor(end / Pi2) * Pi2;
                    if (end <= start)
                        end += Pi2;

                    var t = (end - start) / anzahl;
                    var theta = start;

                    for (var i = 0; i <= anzahl + 1; i++) {
                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                        theta += t;
                    }

                    for (var j = 0; j < anzahl; j++) {
                        this._mesh._indices[0].push(j);
                        this._mesh._indices[0].push(j + 1);
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 2;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node._dirty.indexes = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### ArcClose2D ### */
x3dom.registerNodeType(
    "ArcClose2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for ArcClose2D
         * @constructs x3dom.nodeTypes.ArcClose2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ArcClose2D.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} closureType
             * @memberof x3dom.nodeTypes.ArcClose2D
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'closureType', "PIE");

            /**
             *
             * @var {SFFloat} radius
             * @memberof x3dom.nodeTypes.ArcClose2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1);

            /**
             *
             * @var {SFFloat} startAngle
             * @memberof x3dom.nodeTypes.ArcClose2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'startAngle', 0);

            /**
             *
             * @var {SFFloat} endAngle
             * @memberof x3dom.nodeTypes.ArcClose2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);

            /**
             *
             * @var {SFFloat} subdivision
             * @memberof x3dom.nodeTypes.ArcClose2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var r = this._vf.radius;
            var start = this._vf.startAngle;
            var end = this._vf.endAngle;
            var anzahl = this._vf.subdivision;

            // The following code ensures that:
            // 1. 0 <= startAngle < 2*Pi
            // 2. startAngle < endAngle
            // 3. endAngle - startAngle <= 2*Pi
            var Pi2 = Math.PI * 2.0;
            start -= Math.floor(start / Pi2) * Pi2;
            end -= Math.floor(end / Pi2) * Pi2;
            if (end <= start)
                end += Pi2;

            var geoCacheID = 'ArcClose2D_' + r + start + end + this._vf.closureType;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using ArcClose2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {
                var t = (end - start) / anzahl;
                var theta = start;

                if (this._vf.closureType.toUpperCase() == 'PIE') {

                    this._mesh._positions[0].push(0.0);
                    this._mesh._positions[0].push(0.0);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push(0.5);
                    this._mesh._texCoords[0].push(0.5);

                    for (var i = 0; i <= anzahl; i++) {
                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        theta += t;
                    }

                    for (var j = 1; j <= anzahl; j++) {
                        this._mesh._indices[0].push(j + 1);
                        this._mesh._indices[0].push(0);
                        this._mesh._indices[0].push(j);
                    }

                } else {    // "CHORD"
                    for (var i = 0; i <= anzahl; i++) {
                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        theta += t;
                    }

                    var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                    var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((x + r) / (2 * r));
                    this._mesh._texCoords[0].push((y + r) / (2 * r));

                    for (var j = 0; j < anzahl; j++) {
                        this._mesh._indices[0].push(j + 1);
                        this._mesh._indices[0].push(anzahl + 1);
                        this._mesh._indices[0].push(j);
                    }
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                var r = this._vf.radius;
                var start = this._vf.startAngle;
                var end = this._vf.endAngle;
                var anzahl = this._vf.subdivision;

                var Pi2 = Math.PI * 2.0;
                start -= Math.floor(start / Pi2) * Pi2;
                end -= Math.floor(end / Pi2) * Pi2;
                if (end <= start)
                    end += Pi2;

                var t = (end - start) / anzahl;
                var theta = start;

                if (fieldName === "radius") {
                    this._mesh._positions[0] = [];

                    if (this._vf.closureType.toUpperCase() == 'PIE') {

                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);

                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            theta += t;
                        }
                    } else {
                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            theta += t;
                        }

                        var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                        var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });

                } else if (fieldName == "closureType" || fieldName == "subdivision" ||
                           fieldName == "startAngle" || fieldName == "endAngle") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    if (this._vf.closureType.toUpperCase() == 'PIE') {

                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push(0.5);
                        this._mesh._texCoords[0].push(0.5);

                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(1);

                            this._mesh._texCoords[0].push((x + r) / (2 * r));
                            this._mesh._texCoords[0].push((y + r) / (2 * r));

                            theta += t;
                        }

                        for (var j = 1; j <= anzahl; j++) {
                            this._mesh._indices[0].push(j + 1);
                            this._mesh._indices[0].push(0);
                            this._mesh._indices[0].push(j);
                        }

                    } else {
                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(1);

                            this._mesh._texCoords[0].push((x + r) / (2 * r));
                            this._mesh._texCoords[0].push((y + r) / (2 * r));

                            theta += t;
                        }

                        var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                        var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        for (var j = 0; j < anzahl; j++) {
                            this._mesh._indices[0].push(j + 1);
                            this._mesh._indices[0].push(anzahl + 1);
                            this._mesh._indices[0].push(j);
                        }
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 2;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);

/* ### Circle2D ### */
x3dom.registerNodeType(
    "Circle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Circle2D
         * @constructs x3dom.nodeTypes.Circle2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Circle2D.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} radius
             * @memberof x3dom.nodeTypes.Circle2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1);

            /**
             *
             * @var {SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Circle2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._mesh._primType = 'LINES';

            var r = this._vf.radius;

            var geoCacheID = 'Circle2D_' + r;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Circle2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {

                var anzahl = this._vf.subdivision;

                for (var i = 0; i <= anzahl; i++) {
                    var theta = i * ((2 * Math.PI) / anzahl);

                    var x = Math.cos(theta) * r;
                    var y = Math.sin(theta) * r;

                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);
                }


                for (i = 0; i < anzahl; i++) {
                    this._mesh._indices[0].push(i);
                    if ((i + 1) == anzahl) {
                        this._mesh._indices[0].push(0);
                    } else {
                        this._mesh._indices[0].push(i + 1);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "radius" || fieldName == "subdivision") {
                    var r = this._vf.radius;
                    var anzahl = this._vf.subdivision;

                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];

                    for (var i = 0; i <= anzahl; i++) {
                        var theta = i * ((2 * Math.PI) / anzahl);

                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                    }

                    for (i = 0; i < anzahl; i++) {
                        this._mesh._indices[0].push(i);
                        if ((i + 1) == anzahl) {
                            this._mesh._indices[0].push(0);
                        } else {
                            this._mesh._indices[0].push(i + 1);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 2;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node._dirty.indexes = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### Disk2D ### */
x3dom.registerNodeType(
    "Disk2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Disk2D
         * @constructs x3dom.nodeTypes.Disk2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Disk2D.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} innerRadius
             * @memberof x3dom.nodeTypes.Disk2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'innerRadius', 0);

            /**
             *
             * @var {SFFloat} outerRadius
             * @memberof x3dom.nodeTypes.Disk2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'outerRadius', 1);

            /**
             *
             * @var {SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Disk2D
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var ir = this._vf.innerRadius;
            var or = this._vf.outerRadius;

            var geoCacheID = 'Disk2D_' + ir + or;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Disk2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {

                var anzahl = this._vf.subdivision;
                for (var i = 0; i <= anzahl; i++) {

                    var theta = i * ((2 * Math.PI) / anzahl);

                    var ox = Math.cos(theta) * or;
                    var oy = Math.sin(theta) * or;
                    var ix = Math.cos(theta) * ir;
                    var iy = Math.sin(theta) * ir;
                    this._mesh._positions[0].push(ox);
                    this._mesh._positions[0].push(oy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((ox + or) / (2 * or));
                    this._mesh._texCoords[0].push((oy + or) / (2 * or));

                    this._mesh._positions[0].push(ix);
                    this._mesh._positions[0].push(iy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);
                    this._mesh._texCoords[0].push((ix + or) / (2 * or));
                    this._mesh._texCoords[0].push((iy + or) / (2 * or));
                }

                for (i = 0; i < anzahl * 2; i = i + 2) {
                    if (i == (anzahl * 2) - 2) {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(1);

                        this._mesh._indices[0].push(1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(0);
                    } else {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 3);

                        this._mesh._indices[0].push(i + 3);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 2);
                    }
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var ir = this._vf.innerRadius;
                    var or = this._vf.outerRadius;

                    var anzahl = this._vf.subdivision;
                    for (var i = 0; i <= anzahl; i++) {

                        var theta = i * ((2 * Math.PI) / anzahl);

                        var ox = Math.cos(theta) * or;
                        var oy = Math.sin(theta) * or;
                        var ix = Math.cos(theta) * ir;
                        var iy = Math.sin(theta) * ir;
                        this._mesh._positions[0].push(ox);
                        this._mesh._positions[0].push(oy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((ox + or) / (2 * or));
                        this._mesh._texCoords[0].push((oy + or) / (2 * or));

                        this._mesh._positions[0].push(ix);
                        this._mesh._positions[0].push(iy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);
                        this._mesh._texCoords[0].push((ix + or) / (2 * or));
                        this._mesh._texCoords[0].push((iy + or) / (2 * or));
                    }

                    for (i = 0; i < anzahl * 2; i = i + 2) {
                        if (i == (anzahl * 2) - 2) {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(1);

                            this._mesh._indices[0].push(1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(0);
                        } else {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 3);

                            this._mesh._indices[0].push(i + 3);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 2);
                        }
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);

/* ### Polyline2D ### */
x3dom.registerNodeType(
    "Polyline2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Polyline2D
         * @constructs x3dom.nodeTypes.Polyline2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Polyline2D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec2f} lineSegments
             * @memberof x3dom.nodeTypes.Polyline2D
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'lineSegments', []);

            this._mesh._primType = 'LINES';

            var x = 0, y = 0;
            if (this._vf.lineSegments.length) {
                x = this._vf.lineSegments[0].x;
                y = this._vf.lineSegments[0].y;
            }

            var geoCacheID = 'Polyline2D_' + x + '-' + y;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Polyline2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                for (var i = 0; i < this._vf.lineSegments.length; i++) {
                    x = this._vf.lineSegments[i].x;
                    y = this._vf.lineSegments[i].y;
                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);
                }
                for (var j = 0; j < this._vf.lineSegments.length - 1; j++) {
                    this._mesh._indices[0].push(j);
                    this._mesh._indices[0].push(j + 1);
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "lineSegments") {
                    var x, y;
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    for (var i = 0; i < this._vf.lineSegments.length; i++) {
                        x = this._vf.lineSegments[i].x;
                        y = this._vf.lineSegments[i].y;
                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                    }
                    for (var j = 0; j < this._vf.lineSegments.length - 1; j++) {
                        this._mesh._indices[0].push(j);
                        this._mesh._indices[0].push(j + 1);
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 2;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node._dirty.indexes = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### Polypoint2D ### */
x3dom.registerNodeType(
    "Polypoint2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Polypoint2D
         * @constructs x3dom.nodeTypes.Polypoint2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Polypoint2D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec2f} point
             * @memberof x3dom.nodeTypes.Polypoint2D
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'point', []);

            this._mesh._primType = 'POINTS';

            var x = 0, y = 0;
            if (this._vf.point.length) {
                x = this._vf.point[0].x;
                y = this._vf.point[0].y;
            }

            var geoCacheID = 'Polypoint2D_' + x + '-' + y;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Polypoint2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                for (var i = 0; i < this._vf.point.length; i++) {
                    x = this._vf.point[i].x;
                    y = this._vf.point[i].y;
                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);
                }

                this._mesh._invalidate = true;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "point") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    for (var i = 0; i < this._vf.point.length; i++) {
                        var x = this._vf.point[i].x;
                        var y = this._vf.point[i].y;
                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### Rectangle2D ### */
x3dom.registerNodeType(
    "Rectangle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Rectangle2D
         * @constructs x3dom.nodeTypes.Rectangle2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Rectangle2D.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec2f} size
             * @memberof x3dom.nodeTypes.Rectangle2D
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'size', 2, 2);

            /**
             *
             * @var {SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.Rectangle2D
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);

            var sx = this._vf.size.x, sy = this._vf.size.y;
            var partx = this._vf.subdivision.x, party = this._vf.subdivision.y;

            var geoCacheID = 'Rectangle2D_' + sx + '-' + sy;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Rectangle2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var xstep = sx / partx;
                var ystep = sy / party;

                sx /= 2;
                sy /= 2;

                for (var i = 0; i <= partx; i++) {
                    for (var j = 0; j <= party; j++) {
                        this._mesh._positions[0].push(i * xstep - sx, j * ystep - sy, 0);
                        this._mesh._normals[0].push(0, 0, 1);
                        this._mesh._texCoords[0].push(i / partx, j / party);
                    }
                }

                for (var i = 1; i <= party; i++) {
                    for (var j = 0; j < partx; j++) {
                        this._mesh._indices[0].push((i - 1) * (partx + 1) + j + 1);
                        this._mesh._indices[0].push((i - 1) * (partx + 1) + j);
                        this._mesh._indices[0].push(i * (partx + 1) + j);

                        this._mesh._indices[0].push((i - 1) * (partx + 1) + j + 1);
                        this._mesh._indices[0].push(i * (partx + 1) + j);
                        this._mesh._indices[0].push(i * (partx + 1) + j + 1);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "size") {
                    this._mesh._positions[0] = [];
                    var size = this._vf.size;
                    var sx = size.x / 2;
                    var sy = size.y / 2;

                    var partx = this._vf.subdivision.x, party = this._vf.subdivision.y;

                    var xstep = sx / partx;
                    var ystep = sy / party;

                    sx /= 2;
                    sy /= 2;

                    for (var i = 0; i <= partx; i++) {
                        for (var j = 0; j <= party; j++) {
                            this._mesh._positions[0].push(i * xstep - sx, j * ystep - sy, 0);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });

                } else if (fieldName == "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var sx = this._vf.size.x / 2;
                    var sy = this._vf.size.y / 2;

                    var partx = this._vf.subdivision.x, party = this._vf.subdivision.y;
                    var xstep = sx / partx;
                    var ystep = sy / party;

                    sx /= 2;
                    sy /= 2;

                    for (var i = 0; i <= partx; i++) {
                        for (var j = 0; j <= party; j++) {
                            this._mesh._positions[0].push(i * xstep - sx, j * ystep - sy, 0);
                            this._mesh._normals[0].push(0, 0, 1);
                            this._mesh._texCoords[0].push(i / partx, j / party);
                        }
                    }

                    for (var i = 1; i <= party; i++) {
                        for (var j = 0; j < partx; j++) {
                            this._mesh._indices[0].push((i - 1) * (partx + 1) + j + 1);
                            this._mesh._indices[0].push((i - 1) * (partx + 1) + j);
                            this._mesh._indices[0].push(i * (partx + 1) + j);

                            this._mesh._indices[0].push((i - 1) * (partx + 1) + j + 1);
                            this._mesh._indices[0].push(i * (partx + 1) + j);
                            this._mesh._indices[0].push(i * (partx + 1) + j + 1);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);

/* ### TriangleSet2D ### */
x3dom.registerNodeType(
    "TriangleSet2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for TriangleSet2D
         * @constructs x3dom.nodeTypes.TriangleSet2D
         * @x3d x.x
         * @component Geometry2D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TriangleSet2D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec2f} vertices
             * @memberof x3dom.nodeTypes.TriangleSet2D
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'vertices', []);

            /**
             *
             * @var {MFVec2f} lineSegments
             * @memberof x3dom.nodeTypes.TriangleSet2D
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'lineSegments', []);

            var x = 0, y = 0;
            if (this._vf.vertices.length) {
                x = this._vf.vertices[0].x;
                y = this._vf.vertices[0].y;
            }

            var geoCacheID = 'TriangleSet2D_' + x + '-' + y;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using TriangleSet2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var minx = 0, miny = 0, maxx = 0, maxy = 0;

                if (this._vf.vertices.length) {
                    minx = this._vf.vertices[0].x;
                    miny = this._vf.vertices[0].y;
                    maxx = this._vf.vertices[0].x;
                    maxy = this._vf.vertices[0].y;
                }

                for (var i = 0; i < this._vf.vertices.length; i++) {
                    if (this._vf.vertices[i].x < minx) {
                        minx = this._vf.vertices[i].x
                    }
                    if (this._vf.vertices[i].y < miny) {
                        miny = this._vf.vertices[i].y
                    }
                    if (this._vf.vertices[i].x > maxx) {
                        maxx = this._vf.vertices[i].x
                    }
                    if (this._vf.vertices[i].y > maxy) {
                        maxy = this._vf.vertices[i].y
                    }
                }

                for (var i = 0; i < this._vf.vertices.length; i++) {
                    x = this._vf.vertices[i].x;
                    y = this._vf.vertices[i].y;
                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((x - minx) / (maxx - minx));
                    this._mesh._texCoords[0].push((y - miny) / (maxy - miny));
                }

                for (var j = 0; j < this._vf.vertices.length; j += 3) {
                    this._mesh._indices[0].push(j);
                    this._mesh._indices[0].push(j + 2);
                    this._mesh._indices[0].push(j + 1);
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "vertices" || fieldName == "lineSegments") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var minx = this._vf.vertices[0].x;
                    var miny = this._vf.vertices[0].y;
                    var maxx = this._vf.vertices[0].x;
                    var maxy = this._vf.vertices[0].y;

                    for (var i = 0; i < this._vf.vertices.length; i++) {
                        if (this._vf.vertices[i].x < minx) {
                            minx = this._vf.vertices[i].x
                        }
                        if (this._vf.vertices[i].y < miny) {
                            miny = this._vf.vertices[i].y
                        }
                        if (this._vf.vertices[i].x > maxx) {
                            maxx = this._vf.vertices[i].x
                        }
                        if (this._vf.vertices[i].y > maxy) {
                            maxy = this._vf.vertices[i].y
                        }
                    }

                    for (var i = 0; i < this._vf.vertices.length; i++) {
                        var x = this._vf.vertices[i].x;
                        var y = this._vf.vertices[i].y;
                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x - minx) / (maxx - minx));
                        this._mesh._texCoords[0].push((y - miny) / (maxy - miny));
                    }

                    for (var j = 0; j < this._vf.vertices.length; j += 3) {
                        this._mesh._indices[0].push(j);
                        this._mesh._indices[0].push(j + 2);
                        this._mesh._indices[0].push(j + 1);
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);
