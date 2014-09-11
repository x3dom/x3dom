/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 */

/* ### Arc2D ### */
x3dom.registerNodeType(
    "Arc2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        
        /**
         * Constructor for Arc2D
         * @constructs x3dom.nodeTypes.Arc2D
         * @x3d 3.3
         * @component Geometry2D
         * @status full
         * @extends x3dom.nodeTypes.X3DPlanarGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Arc node specifies a linear circular arc whose center is at (0,0) and whose angles are
         *  measured starting at the positive x-axis and sweeping towards the positive y-axis.
         */
        function (ctx) {
            x3dom.nodeTypes.Arc2D.superClass.call(this, ctx);


            /**
             * The radius field specifies the radius of the circle of which the arc is a portion.
             * @var {x3dom.fields.SFFloat} radius
             * @memberof x3dom.nodeTypes.Arc2D
             * @initvalue 1
             * @range (0, inf)
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 1);

            /**
             * The arc extends from the startAngle counterclockwise to the endAngle.
             * @var {x3dom.fields.SFFloat} startAngle
             * @memberof x3dom.nodeTypes.Arc2D
             * @initvalue 0
             * @range [-2 pi, 2pi]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'startAngle', 0);

            /**
             * The arc extends from the startAngle counterclockwise to the endAngle.
             * @var {x3dom.fields.SFFloat} endAngle
             * @memberof x3dom.nodeTypes.Arc2D
             * @initvalue 1.570796
             * @range [-2 pi, 2pi]
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);

            /**
             * Number of lines into which the arc is subdivided
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.Arc2D
             * @initvalue 32
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