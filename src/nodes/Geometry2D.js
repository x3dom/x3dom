/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */
 
/* ### Arc2D ### */
x3dom.registerNodeType(
    "Arc2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Arc2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'endAngle', 1.570796);
            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFFloat(ctx, 'startAngle', 0);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ArcClose2D ### */
x3dom.registerNodeType(
    "ArcClose2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ArcClose2D.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'closureType', "PIE");
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);
            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFFloat(ctx, 'startAngle', 0);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Circle2D ### */
x3dom.registerNodeType(
    "Circle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Circle2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Disk2D ### */
x3dom.registerNodeType(
    "Disk2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Disk2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'innerRadius', 0);
            this.addField_SFFloat(ctx, 'outerRadius', 1);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Polyline2D ### */
x3dom.registerNodeType(
    "Polyline2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Polyline2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'lineSegments', []);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Polypoint2D ### */
x3dom.registerNodeType(
    "Polypoint2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Polypoint2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'point', []);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Rectangle2D ### */
x3dom.registerNodeType(
    "Rectangle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Rectangle2D.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'size', 2, 2);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### TriangleSet2D ### */
x3dom.registerNodeType(
    "TriangleSet2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.TriangleSet2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'vertices', []);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
