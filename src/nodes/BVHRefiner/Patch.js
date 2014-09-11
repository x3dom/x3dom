/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */


/* ### Patch ### */
x3dom.registerNodeType(
    "Patch",
    "BVHRefiner",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        
        /**
         * Constructor for Patch
         * @constructs x3dom.nodeTypes.Patch
         * @x3d x.x
         * @component BVHRefiner
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Patch node is used by the BVHRefiner.
         */
        function (ctx) {
            x3dom.nodeTypes.Patch.superClass.call(this, ctx);


            /**
             * Size of the entire terrain.
             * @var {x3dom.fields.SFVec2f} size
             * @memberof x3dom.nodeTypes.Patch
             * @initvalue 2,2
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'size', 2, 2);

            /**
             * Subdivision of the regualr geometry. The higher, the finer the geometry.
             * @var {x3dom.fields.SFVec2f} subdivision
             * @memberof x3dom.nodeTypes.Patch
             * @initvalue 1,1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);

            /**
             * Center position of the geometry.
             * @var {x3dom.fields.SFVec3f} center
             * @memberof x3dom.nodeTypes.Patch
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            /**
             * Render mode of the mesh.
             * @var {x3dom.fields.MFString} primType
             * @memberof x3dom.nodeTypes.Patch
             * @initvalue ['TRIANGLES']
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);

            var sx = this._vf.size.x, sy = this._vf.size.y;
            var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;

            this._indexBufferTriangulationParts = [];

            var x = 0, y = 0;
            var xstep = sx / subx / 2;
            var ystep = sy / suby / 2;

            sx /= 2;
            sy /= 2;
            var countX = subx * 2 + 1;
            var countY = suby * 2 + 1;

            /*************************************************************/
            // VERTEX-INFORMATION
            /*************************************************************/
            for (y = 0; y <= suby * 2; y++) {
                for (x = 0; x <= subx * 2; x++) {
                    this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
                    this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
                    this._mesh._positions[0].push(this._vf.center.z);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);
                    this._mesh._texCoords[0].push(x / (subx * 2));
                    this._mesh._texCoords[0].push(y / (suby * 2));
                }
            }

            /*************************************************************/
            // regular triangulation
            for (y = 0; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: 0,
                count: subx * suby * 6
            });

            /*************************************************************/
            // finer bottom triangulation
            for (y = 0; y < countY - 2; y += 2) {
                for (x = 0; x < 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 1) * countX);

                    this._mesh._indices[0].push((x) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 0; y < countY - 2; y += 2) {
                for (x = 2; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + suby * 9
            });

            /*************************************************************/
            // finer top triangulation
            for (y = 0; y < countY - 2; y += 2) {
                for (x = countX - 3; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 0; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 4; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + suby * 9
            });

            /*************************************************************/
            // finer right triangulation
            for (y = 2; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            for (y = 0; y < 2; y += 2) {
                for (x = 0; x < countX - 2; x += 2) {

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + y * countX);

                    this._mesh._indices[0].push((x + 1) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9
            });

            /*************************************************************/
            // finer left triangulation
            for (y = countY - 3; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 0; y < countY - 4; y += 2) {
                for (x = 0; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9
            });

            /*************************************************************/
            // finer topLeft triangulation
            for (y = countY - 3; y < countY - 2; y += 2) {
                for (x = countX - 3; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 0; y < countY - 4; y += 2) {
                for (x = 0; x < countX - 4; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            for (y = 0; y < countY - 4; y += 2) {
                for (x = countX - 3; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = countY - 3; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 4; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9 + (suby - 1) * 9 + 3
            });

            /*************************************************************/
            // finer bottomLeft triangulation
            for (y = countY - 3; y < countY - 2; y += 2) {
                for (x = 0; x < 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 1) * countX);

                    this._mesh._indices[0].push((x) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 0; y < countY - 4; y += 2) {
                for (x = 2; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            // finer left
            for (y = countY - 3; y < countY - 2; y += 2) {
                for (x = 2; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 1) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            // finer bottom
            for (y = 0; y < countY - 4; y += 2) {
                for (x = 0; x < 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 1) * countX);

                    this._mesh._indices[0].push((x) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9 + (suby - 1) * 9 + 3
            });

            /*************************************************************/
            // finer bottomRight triangulation
            for (y = 0; y < 2; y += 2) {
                for (x = 0; x < 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 1) * countX);

                    this._mesh._indices[0].push((x) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + y * countX);

                    this._mesh._indices[0].push((x + 1) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 2; y < countY - 2; y += 2) {
                for (x = 2; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            // finer bottom
            for (y = 2; y < countY - 2; y += 2) {
                for (x = 0; x < 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 1) * countX);

                    this._mesh._indices[0].push((x) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            // finer right
            for (y = 0; y < 2; y += 2) {
                for (x = 2; x < countX - 2; x += 2) {

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + y * countX);

                    this._mesh._indices[0].push((x + 1) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9 + (suby - 1) * 9 + 3
            });

            /*************************************************************/
            // finer topRight triangulation
            // finer right
            for (y = 0; y < 2; y += 2) {
                for (x = countX - 3; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + y * countX);

                    this._mesh._indices[0].push((x + 1) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            for (y = 2; y < countY - 2; y += 2) {
                for (x = 0; x < countX - 4; x += 2) {
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x) + y * countX);

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                }
            }

            //  finer top
            for (y = 2; y < countY - 2; y += 2) {
                for (x = countX - 3; x < countX - 2; x += 2) {
                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            // finer right
            for (y = 0; y < 2; y += 2) {
                for (x = 0; x < countX - 4; x += 2) {

                    this._mesh._indices[0].push((x) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + (y + 2) * countX);

                    this._mesh._indices[0].push((x) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);

                    this._mesh._indices[0].push((x + 2) + (y + 2) * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 2) + y * countX);

                    this._mesh._indices[0].push((x + 2) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x + 1) + y * countX);

                    this._mesh._indices[0].push((x + 1) + y * countX);
                    this._mesh._indices[0].push((x + 1) + (y + 1) * countX);
                    this._mesh._indices[0].push((x) + y * countX);
                }
            }

            this._indexBufferTriangulationParts.push({
                offset: this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].offset +
                    this._indexBufferTriangulationParts[this._indexBufferTriangulationParts.length - 1].count * 2,
                count: subx * suby * 6 + subx * 9 + (suby - 1) * 9 + 3
            });

            this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        
        },
        {
            hasIndexOffset: function() {
                return true;
            },

            getTriangulationAttributes: function(triangulationIndex){
                return this._indexBufferTriangulationParts[triangulationIndex];
            }
        }
    )
);