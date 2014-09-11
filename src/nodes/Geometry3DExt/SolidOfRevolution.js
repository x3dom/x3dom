/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### SolidOfRevolution ### */
x3dom.registerNodeType(
    "SolidOfRevolution",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for SolidOfRevolution
         * @constructs x3dom.nodeTypes.SolidOfRevolution
         * @x3d x.x
         * @component Geometry3DExt
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Describes a SolidOfRevolution shape.
         */
        function (ctx) {
            x3dom.nodeTypes.SolidOfRevolution.superClass.call(this, ctx);


            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFFloat} creaseAngle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SolidOfRevolution
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'creaseAngle', 0);

            /**
             * Defines the cross section that is swept around the axis. The cross section is described as an array of 2D vertices.
             * @var {x3dom.fields.MFVec2f} crossSection
             * @memberof x3dom.nodeTypes.SolidOfRevolution
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'crossSection', []);

            /**
             * The subtended angle through which the 2D loop is swept around the x axis.
             * @var {x3dom.fields.SFFloat} angle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SolidOfRevolution
             * @initvalue 2*Math.PI
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'angle', 2*Math.PI);

            /**
             *Specifies whether the caps exist.
             * @var {x3dom.fields.SFBool} caps
             * @memberof x3dom.nodeTypes.SolidOfRevolution
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'caps', true);

            /**
             * Specifies the number of steps that are generated to approximate the shape.
             * @var {x3dom.fields.SFFloat} subdivision
             * @memberof x3dom.nodeTypes.SolidOfRevolution
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._origCCW = this._vf.ccw;

            this.rebuildGeometry();
        
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                // assure that angle in [-2.Pi, 2.PI]
                var twoPi = 2.0 * Math.PI;
                if (this._vf.angle < -twoPi)
                    this._vf.angle = -twoPi;
                else if (this._vf.angle > twoPi)
                    this._vf.angle = twoPi;

                var crossSection = this._vf.crossSection, angle = this._vf.angle, steps = this._vf.subdivision;
                var i, j, k, l, m, n = crossSection.length;

                if (n < 1) {
                    x3dom.debug.logWarning("SolidOfRevolution requires crossSection curve.");
                    return;
                }

                var loop = (n > 2) ? crossSection[0].equals(crossSection[n-1], x3dom.fields.Eps) : false;
                var fullRevolution = (twoPi - Math.abs(angle) <= x3dom.fields.Eps);

                var alpha, delta = angle / steps;
                var positions = [], baseCurve = [];

                // fix wrong face orientation in case of clockwise rotation
                this._vf.ccw = (angle < 0) ? this._origCCW : !this._origCCW;

                // check if side caps are required
                if (!loop)
                {
                    if (Math.abs(crossSection[n-1].y) > x3dom.fields.Eps) {
                        crossSection.push(new x3dom.fields.SFVec2f(crossSection[n-1].x, 0));
                    }
                    if (Math.abs(crossSection[0].y) > x3dom.fields.Eps) {
                        crossSection.unshift(new x3dom.fields.SFVec2f(crossSection[0].x, 0));
                    }
                    n = crossSection.length;
                }

                // check curvature, starting from 2nd segment, and adjust base curve
                var pos = null, lastPos = null, penultimatePos = null;
                var duplicate = [];    // to be able to sort out duplicates for caps

                for (j=0; j<n; j++)
                {
                    if (pos) {
                        if (lastPos) {
                            penultimatePos = lastPos;
                        }
                        lastPos = pos;
                    }

                    pos = new x3dom.fields.SFVec3f(crossSection[j].x, 0, crossSection[j].y);

                    if (j >= 2)
                    {
                        alpha = pos.subtract(lastPos).normalize();
                        alpha = alpha.dot(lastPos.subtract(penultimatePos).normalize());
                        alpha = Math.abs(Math.cos(alpha));

                        if (alpha > this._vf.creaseAngle)
                        {
                            baseCurve.push(x3dom.fields.SFVec3f.copy(lastPos));
                            duplicate.push(true);
                        }
                        // TODO; handle case that curve is loop and angle smaller creaseAngle
                    }

                    baseCurve.push(pos);
                    duplicate.push(false);
                }

                n = baseCurve.length;

                // generate body of revolution (with rotation around x-axis)
                for (i=0, alpha=0; i<=steps; i++, alpha+=delta)
                {
                    var mat = x3dom.fields.SFMatrix4f.rotationX(alpha);

                    for (j=0; j<n; j++)
                    {
                        pos = mat.multMatrixPnt(baseCurve[j]);
                        positions.push(pos);

                        this._mesh._positions[0].push(pos.x, pos.y, pos.z);

                        if (i > 0 && j > 0)
                        {
                            this._mesh._indices[0].push((i-1)*n+(j-1), (i-1)*n+ j   ,  i   *n+ j   );
                            this._mesh._indices[0].push( i   *n+ j   ,  i   *n+(j-1), (i-1)*n+(j-1));
                        }
                    }
                }

                if (!fullRevolution && this._vf.caps == true)
                {
                    // add first cap
                    var linklist = new x3dom.DoublyLinkedList();
                    m = this._mesh._positions[0].length / 3;

                    for (j=0, i=0; j<n; j++)
                    {
                        if (!duplicate[j])
                        {
                            // Tessellation leads to errors with duplicated vertices if polygon not convex
                            linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[j], i++));

                            pos = positions[j];
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);
                        }
                    }

                    var linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                    for (j=linklist_indices.length-1; j>=0; j--)
                    {
                        this._mesh._indices[0].push(m + linklist_indices[j]);
                    }

                    // second cap
                    m = this._mesh._positions[0].length / 3;

                    for (j=0; j<n; j++)
                    {
                        if (!duplicate[j])
                        {
                            pos = positions[n * steps + j];
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);
                        }
                    }

                    for (j=0; j<linklist_indices.length; j++)
                    {
                        this._mesh._indices[0].push(m + linklist_indices[j]);
                    }
                }

                // calculate and readjust normals if full revolution
                this._mesh.calcNormals(Math.PI, this._vf.ccw);

                if (fullRevolution)
                {
                    m = 3 * n * steps;

                    for (j=0; j<n; j++)
                    {
                        k = 3 * j;
                        this._mesh._normals[0][m+k  ] = this._mesh._normals[0][k  ];
                        this._mesh._normals[0][m+k+1] = this._mesh._normals[0][k+1];
                        this._mesh._normals[0][m+k+2] = this._mesh._normals[0][k+2];
                    }
                }

                this._mesh.calcTexCoords("");

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "crossSection" || fieldName == "angle" || fieldName == "caps" ||
                    fieldName == "subdivision" || fieldName == "creaseAngle")
                {
                    this.rebuildGeometry();

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);