/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Extrusion ### */
x3dom.registerNodeType(
    "Extrusion",
    "Geometry3DExt",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for Extrusion
         * @constructs x3dom.nodeTypes.Extrusion
         * @x3d 3.3
         * @component Geometry3DExt
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Extrusion node specifies geometric shapes based on a two dimensional cross-section extruded along a three dimensional spine in the local coordinate system. The cross-section can be scaled and rotated at each spine point to produce a wide variety of shapes.
         */
        function (ctx) {
            x3dom.nodeTypes.Extrusion.superClass.call(this, ctx);


            /**
             * Specifies whether the beginCap should exist.
             * @var {x3dom.fields.SFBool} beginCap
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'beginCap', true);

            /**
             * Specifies whether the endCap should exist.
             * @var {x3dom.fields.SFBool} endCap
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'endCap', true);

            /**
             * The convex field indicates whether all polygons in the shape are convex.
             * @var {x3dom.fields.SFBool} convex
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'convex', true);

            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFFloat} creaseAngle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'creaseAngle', 0);

            /**
             * Describes the cross section as a 2D piecewise linear curve (series of connected vertices).
             * @var {x3dom.fields.MFVec2f} crossSection
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(1,1), (1, -1), (-1, -1), (-1, 1), (1, 1)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'crossSection', [
                new x3dom.fields.SFVec2f(1, 1),
                new x3dom.fields.SFVec2f(1, -1),
                new x3dom.fields.SFVec2f(-1, -1),
                new x3dom.fields.SFVec2f(-1, 1),
                new x3dom.fields.SFVec2f(1, 1)
            ]);

            /**
             * Defines an array of orientations for each extrusion step.
             * @var {x3dom.fields.MFRotation} orientation
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(0,0,0,1)]
             * @field x3d
             * @instance
             */
            this.addField_MFRotation(ctx, 'orientation', [ new x3dom.fields.Quaternion(0, 0, 0, 1) ]);

            /**
             * Defines an array of 2D scale values for each extrusion step.
             * @var {x3dom.fields.MFVec2f} scale
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(1,1)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'scale', [ new x3dom.fields.SFVec2f(1, 1) ]);

            /**
             * Describes the spine as a 3D piecewise linear curve (series of conntected vertices).
             * @var {x3dom.fields.MFVec3f} spine
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(0,0,0)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'spine', [ new x3dom.fields.SFVec3f(0, 0, 0),
                new x3dom.fields.SFVec3f(0, 1, 0)
            ]);

            /**
             * Convenience field for setting default spine.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'height', 0);

            // http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/geometry3D.html#Extrusion
            // http://accad.osu.edu/~pgerstma/class/vnv/resources/info/AnnotatedVrmlRef/ch3-318.htm
            this.rebuildGeometry();
        
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var i, j, n, m, len, sx = 1, sy = 1;
                var spine = this._vf.spine,
                    scale = this._vf.scale,
                    orientation = this._vf.orientation,
                    crossSection = this._vf.crossSection;
                var positions = [], index = 0;

                m = spine.length;
                n = crossSection.length;

                if (/*m == 0 &&*/ this._vf.height > 0) {
                    spine[0] = new x3dom.fields.SFVec3f(0, 0, 0);
                    spine[1] = new x3dom.fields.SFVec3f(0, this._vf.height, 0);
                    m = 2;
                }

                var x, y, z;
                var last_z = new x3dom.fields.SFVec3f(0, 0, 1);

                if (m > 2) {
                    for (i = 1; i < m - 1; i++) {
                        var last_z_candidate = spine[i + 1].subtract(spine[i]).cross(spine[i - 1].subtract(spine[i]));
                        if (last_z_candidate.length() > x3dom.fields.Eps) {
                            last_z = x3dom.fields.SFVec3f.copy(last_z_candidate.normalize());
                            break;
                        }
                    }
                }

                var texCoordV = 0;
                var texCoordsV = [ 0 ];

                for (i=1; i<m; i++) {
                    var v = spine[i].subtract(spine[i-1]).length();
                    texCoordV = texCoordV + v;
                    texCoordsV[i] = texCoordV;
                }

                var texCoordU = 0;
                var texCoordsU = [ 0 ];

                var maxTexU_x = 0, minTexU_x = 0;
                var maxTexU_z = 0, minTexU_z = 0;

                for (j=1; j<n; j++) {
                    var u = crossSection[j].subtract(crossSection[j-1]).length();
                    texCoordU = texCoordU + u;
                    texCoordsU[j] = texCoordU;

                    if (j==1) {
                        maxTexU_x = minTexU_x = crossSection[j-1].x;
                        maxTexU_z = minTexU_z = crossSection[j-1].y;
                    }

                    if (maxTexU_x < crossSection[j].x) {
                        maxTexU_x = crossSection[j].x;
                    }
                    if (minTexU_x > crossSection[j].x) {
                        minTexU_x = crossSection[j].x;
                    }
                    if (maxTexU_z < crossSection[j].y) {
                        maxTexU_z = crossSection[j].y;
                    }
                    if (minTexU_z > crossSection[j].y) {
                        minTexU_z = crossSection[j].y;
                    }
                }

                if (Math.abs(maxTexU_x - minTexU_x) < Math.abs(maxTexU_z - minTexU_z)) {
                    var helpMax = maxTexU_x;
                    var helpMin = minTexU_x;
                    maxTexU_x = maxTexU_z;
                    minTexU_x = minTexU_z;
                    maxTexU_z = helpMax;
                    minTexU_z = helpMin;
                }

                var diffTexU_x = Math.abs(maxTexU_x - minTexU_x);
                var diffTexU_z = Math.abs(maxTexU_z - minTexU_z);

                var spineClosed = (m > 2) ? spine[0].equals(spine[spine.length-1], x3dom.fields.Eps) : false;

                for (i=0; i<m; i++) {
                    if ((len = scale.length) > 0) {
                        if (i < len) {
                            sx = scale[i].x;
                            sy = scale[i].y;
                        }
                        else {
                            sx = scale[len-1].x;
                            sy = scale[len-1].y;
                        }
                    }

                    for (j=0; j<n; j++) {
                        var pos = new x3dom.fields.SFVec3f(
                                crossSection[j].x * sx + spine[i].x,
                            spine[i].y,
                                crossSection[j].y * sy + spine[i].z);

                        if (m > 2) {
                            if (i == 0) {
                                if (spineClosed) {
                                    y = spine[1].subtract(spine[m-2]);
                                    z = spine[1].subtract(spine[0]).cross(spine[m-2].subtract(spine[0]));
                                }
                                else {
                                    y = spine[1].subtract(spine[0]);
                                    z = spine[2].subtract(spine[1]).cross(spine[0].subtract(spine[1]));
                                }
                                if (z.length() > x3dom.fields.Eps) {
                                    last_z = x3dom.fields.SFVec3f.copy(z);
                                }
                            }
                            else if (i == m-1) {
                                if (spineClosed) {
                                    y = spine[1].subtract(spine[m-2]);
                                    z = spine[1].subtract(spine[0]).cross(spine[m-2].subtract(spine[0]));
                                }
                                else {
                                    y = spine[m-1].subtract(spine[m-2]);
                                    z = x3dom.fields.SFVec3f.copy(last_z);
                                }
                            }
                            else {
                                y = spine[i+1].subtract(spine[i-1]);
                                z = y.cross(spine[i-1].subtract(spine[i]));
                            }
                            if (z.dot(last_z) < 0) {
                                z = z.negate();
                            }

                            y = y.normalize();
                            z = z.normalize();

                            if (z.length() <= x3dom.fields.Eps)	{
                                z = x3dom.fields.SFVec3f.copy(last_z);
                            }

                            if (i != 0) {
                                last_z = x3dom.fields.SFVec3f.copy(z);
                            }
                            x = y.cross(z).normalize();

                            var baseMat = x3dom.fields.SFMatrix4f.identity();
                            baseMat.setValue(x, y, z);
                            var rotMat = (i < orientation.length) ? orientation[i].toMatrix() :
                                ( (orientation.length > 0) ? orientation[orientation.length-1].toMatrix() :
                                    x3dom.fields.SFMatrix4f.identity() );

                            pos = pos.subtract(spine[i]);
                            pos = baseMat.multMatrixPnt(rotMat.multMatrixPnt(pos));
                            pos = pos.add(spine[i]);
                        }
                        pos.crossSection = crossSection[j];
                        positions.push(pos);

                        if (this._vf.creaseAngle <= x3dom.fields.Eps) {
                            if (i > 0 && j > 0) {
                                var iPos = (i-1)*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j-1]/texCoordU, texCoordsV[i-1]/texCoordV);
                                iPos = (i-1)*n+j;
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j]/texCoordU, texCoordsV[i-1]/texCoordV);
                                iPos = i*n+j;
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j]/texCoordU, texCoordsV[i]/texCoordV);

                                this._mesh._indices[0].push(index++, index++, index++);

                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j]/texCoordU, texCoordsV[i]/texCoordV);
                                iPos = i*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j-1]/texCoordU, texCoordsV[i]/texCoordV);
                                iPos = (i-1)*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                this._mesh._texCoords[0].push(texCoordsU[j-1]/texCoordU, texCoordsV[i-1]/texCoordV);

                                this._mesh._indices[0].push(index++, index++, index++);
                            }
                        }
                        else {
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);
                            this._mesh._texCoords[0].push(texCoordsU[j]/texCoordU, texCoordsV[i]/texCoordV);

                            if (i > 0 && j > 0) {
                                this._mesh._indices[0].push((i-1)*n+(j-1), (i-1)*n+ j   ,  i   *n+ j   );
                                this._mesh._indices[0].push( i   *n+ j   ,  i   *n+(j-1), (i-1)*n+(j-1));
                            }
                        }
                    }

                    if (i == m-1) {
                        var p0, l, startPos;
                        var linklist, linklist_indices;

                        // add bottom (1st cross-section)
                        if (this._vf.beginCap) {
                            linklist = new x3dom.DoublyLinkedList();
                            l = this._mesh._positions[0].length / 3;

                            for (j=0; j<n; j++) {
                                linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[j], j));

                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    p0 = positions[j];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._texCoords[0].push((p0.crossSection.x - minTexU_x)/diffTexU_x,
                                            (p0.crossSection.y - minTexU_z)/diffTexU_z);

                                }
                            }
                            if(this._vf.ccw == false)
                                linklist.invert();

                            linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                            for (j=linklist_indices.length-1; j>=0; j--) {
                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    this._mesh._indices[0].push(l + linklist_indices[j]);
                                }
                                else {
                                    p0 = positions[linklist_indices[j]];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._texCoords[0].push((p0.crossSection.x - minTexU_x)/diffTexU_x,
                                            (p0.crossSection.y - minTexU_z)/diffTexU_z);
                                    this._mesh._indices[0].push(index++);
                                }
                            }
                        }

                        // add top (last cross-section)
                        if (this._vf.endCap) {
                            linklist = new x3dom.DoublyLinkedList();
                            startPos = (m - 1) * n;
                            l = this._mesh._positions[0].length / 3;

                            for (j=0; j<n; j++) {
                                linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[startPos+j], startPos+j));

                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    p0 = positions[startPos+j];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._texCoords[0].push((p0.crossSection.x - minTexU_x)/diffTexU_x,
                                            (p0.crossSection.y - minTexU_z)/diffTexU_z);
                                }
                            }

                            if(this._vf.ccw == false)
                                linklist.invert();

                            linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                            for (j=0; j<linklist_indices.length; j++) {
                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    this._mesh._indices[0].push(l + (linklist_indices[j] - startPos));
                                }
                                else {
                                    p0 = positions[linklist_indices[j]];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._texCoords[0].push((p0.crossSection.x - minTexU_x)/diffTexU_x,
                                            (p0.crossSection.y - minTexU_z)/diffTexU_z);
                                    this._mesh._indices[0].push(index++);
                                }
                            }
                        }
                    }
                }

                this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "beginCap" || fieldName == "endCap" ||
                    fieldName == "crossSection" || fieldName == "orientation" ||
                    fieldName == "scale" || fieldName == "spine" ||
                    fieldName == "height" || fieldName == "creaseAngle")
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