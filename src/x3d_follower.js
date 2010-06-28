/* ### X3DFollowerNode ### */
x3dom.registerNodeType(
    "X3DFollowerNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFollowerNode.superClass.call(this, ctx);
            
            // [S|M]F<type> [in]     set_destination
            // [S|M]F<type> [in]     set_value
            // SFBool       [out]    isActive
            // [S|M]F<type> [out]    value_changed
            // [S|M]F<type> []       initialDestination
            // [S|M]F<type> []       initialValue
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### X3DChaserNode ### */
x3dom.registerNodeType(
    "X3DChaserNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        function (ctx) {
            x3dom.nodeTypes.X3DChaserNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'duration', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ColorChaser ### */
x3dom.registerNodeType(
    "ColorChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.ColorChaser.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFColor(ctx, 'initialValue', 0, 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ColorDamper ### */
x3dom.registerNodeType(
    "ColorDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.ColorDamper.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'initialValue', 0.8, 0.8, 0.8);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### CoordinateChaser ### */
x3dom.registerNodeType(
    "CoordinateChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateChaser.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'initialDestination', []);
            this.addField_MFVec3f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### CoordinateDamper ### */
x3dom.registerNodeType(
    "CoordinateDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.CoordinateDamper.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'initialDestination', []);
            this.addField_MFVec3f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### X3DDamperNode ### */
x3dom.registerNodeType(
    "X3DDamperNode",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DFollowerNode,
        function (ctx) {
            x3dom.nodeTypes.X3DDamperNode.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'tau', 0);
            this.addField_SFFloat(ctx, 'tolerance', -1);
            this.addField_SFInt32(ctx, 'order', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### OrientationChaser ### */
x3dom.registerNodeType(
    "OrientationChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationChaser.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### OrientationDamper ### */
x3dom.registerNodeType(
    "OrientationDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.OrientationDamper.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 1, 0, 0);
            this.addField_SFRotation(ctx, 'initialValue', 0, 1, 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### PositionChaser ### */
x3dom.registerNodeType(
    "PositionChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### PositionChaser2D ### */
x3dom.registerNodeType(
    "PositionChaser2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser2D.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'initialDestination', 0, 0);
            this.addField_SFVec2f(ctx, 'initialValue', 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### PositionDamper ### */
x3dom.registerNodeType(
    "PositionDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### PositionDamper2D ### */
x3dom.registerNodeType(
    "PositionDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper2D.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'initialDestination', 0, 0);
            this.addField_SFVec2f(ctx, 'initialValue', 0, 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ScalarChaser ### */
x3dom.registerNodeType(
    "ScalarChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarChaser.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'initialDestination', 0);
            this.addField_SFFloat(ctx, 'initialValue', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ScalarDamper ### */
x3dom.registerNodeType(
    "ScalarDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.ScalarDamper.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'initialDestination', 0);
            this.addField_SFFloat(ctx, 'initialValue', 0);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### TexCoordChaser2D ### */
x3dom.registerNodeType(
    "TexCoordChaser2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DChaserNode,
        function (ctx) {
            x3dom.nodeTypes.TexCoordChaser2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### TexCoordDamper2D ### */
x3dom.registerNodeType(
    "TexCoordDamper2D",
    "Followers",
    defineClass(x3dom.nodeTypes.X3DDamperNode,
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
