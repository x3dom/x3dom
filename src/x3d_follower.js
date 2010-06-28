/* ### Follower ### */
x3dom.registerNodeType(
    "Follower",
    "Followers",
    defineClass(x3dom.nodeTypes.SceneTimeSensor,
        function (ctx) {
            x3dom.nodeTypes.Follower.superClass.call(this, ctx);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Chaser ### */
x3dom.registerNodeType(
    "Chaser",
    "Followers",
    defineClass(x3dom.nodeTypes.Follower,
        function (ctx) {
            x3dom.nodeTypes.Chaser.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'duration', 1);
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
    defineClass(x3dom.nodeTypes.Chaser,
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
    defineClass(x3dom.nodeTypes.Damper,
        function (ctx) {
            x3dom.nodeTypes.ColorDamper.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFColor(ctx, 'initialValue', 0, 0, 0);
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
    defineClass(x3dom.nodeTypes.Chaser,
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
    defineClass(x3dom.nodeTypes.Damper,
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

/* ### Damper ### */
x3dom.registerNodeType(
    "Damper",
    "Followers",
    defineClass(x3dom.nodeTypes.Follower,
        function (ctx) {
            x3dom.nodeTypes.Damper.superClass.call(this, ctx);

            this.addField_SFTime(ctx, 'tau', 0);
            this.addField_SFFloat(ctx, 'tolerance', -1);
            this.addField_SFInt32(ctx, 'order', 1);
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
    defineClass(x3dom.nodeTypes.Chaser,
        function (ctx) {
            x3dom.nodeTypes.OrientationChaser.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 0, 0, 1);
            this.addField_SFRotation(ctx, 'initialValue', 0, 0, 0, 1);
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
    defineClass(x3dom.nodeTypes.Damper,
        function (ctx) {
            x3dom.nodeTypes.OrientationDamper.superClass.call(this, ctx);

            this.addField_SFRotation(ctx, 'initialDestination', 0, 0, 0, 1);
            this.addField_SFRotation(ctx, 'initialValue', 0, 0, 0, 1);
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
    defineClass(x3dom.nodeTypes.Chaser,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser.superClass.call(this, ctx);
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
    defineClass(x3dom.nodeTypes.PositionChaser,
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

/* ### PositionChaser3D ### */
x3dom.registerNodeType(
    "PositionChaser3D",
    "Followers",
    defineClass(x3dom.nodeTypes.PositionChaser,
        function (ctx) {
            x3dom.nodeTypes.PositionChaser3D.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
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
    defineClass(x3dom.nodeTypes.Damper,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper.superClass.call(this, ctx);
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
    defineClass(x3dom.nodeTypes.PositionDamper,
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

/* ### PositionDamper3D ### */
x3dom.registerNodeType(
    "PositionDamper3D",
    "Followers",
    defineClass(x3dom.nodeTypes.PositionDamper,
        function (ctx) {
            x3dom.nodeTypes.PositionDamper3D.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'initialDestination', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'initialValue', 0, 0, 0);
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
    defineClass(x3dom.nodeTypes.Chaser,
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
    defineClass(x3dom.nodeTypes.Damper,
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

/* ### TexCoordChaser ### */
x3dom.registerNodeType(
    "TexCoordChaser",
    "Followers",
    defineClass(x3dom.nodeTypes.Chaser,
        function (ctx) {
            x3dom.nodeTypes.TexCoordChaser.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### TexCoordDamper ### */
x3dom.registerNodeType(
    "TexCoordDamper",
    "Followers",
    defineClass(x3dom.nodeTypes.Damper,
        function (ctx) {
            x3dom.nodeTypes.TexCoordDamper.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'initialDestination', []);
            this.addField_MFVec2f(ctx, 'initialValue', []);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
