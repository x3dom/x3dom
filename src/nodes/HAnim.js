/*
 * HAnim Humanoid Animation component, X3D extension to the
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * Closely adapted from the code for the Grouping and CAD components in X3D as
 * implemented in X3DOM
 
 Dual licensed under the MIT and GPL.
 http://x3dom.org/download/dev/docs/html/license.html
 
 * Based on code originally provided by
 *  Philip Taylor: http://philip.html5.org
 
 * 30 NOV 2013  Don Brutzman
 */


// H-Anim (Humanoid Animation) Component
// http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/hanim.html
// http://www.web3d.org/files/specifications/19774/V1.0/HAnim/HAnim.html

// ### HAnimDisplacer ###
x3dom.registerNodeType(
    "HAnimDisplacer",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.HAnimDisplacer.superClass.call(this, ctx);

            this.addField_SFString(ctx,'name', "");
            this.addField_SFFloat(ctx, 'weight', 0);
            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFVec3f(ctx, 'displacements', []);

            // TODO displacement (add functionality e.g. via matrix palette skinning in shader)
            x3dom.debug.logWarning("HAnimDisplacer NYI!");
        }
    )
);

// ### HAnimJoint ###
x3dom.registerNodeType(
    "HAnimJoint",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimJoint.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
            
            this.addField_SFRotation(ctx, 'limitOrientation', 0, 0, 1, 0);
            this.addField_MFFloat(ctx, 'llimit', []);
            this.addField_MFFloat(ctx, 'ulimit', []);
            this.addField_MFInt32(ctx, 'skinCoordIndex', []);
            this.addField_MFFloat(ctx, 'skinCoordWeight', []);
        }
    )
);

// ### HAnimSegment ###
x3dom.registerNodeType(
    "HAnimSegment",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.HAnimSegment.superClass.call(this, ctx);

            this.addField_SFString(ctx,'name', "");
            this.addField_SFVec3f(ctx, 'centerOfMass', 0, 0, 0);
            this.addField_SFFloat(ctx, 'mass', 0);
            this.addField_MFFloat(ctx, 'momentsOfInertia', [0, 0, 0, 0, 0, 0, 0, 0, 0]);

            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
        },
        {
            // TODO coord      add functionality
            // TODO displacers add functionality
        }
    )
);

// ### HAnimSite ###
x3dom.registerNodeType(
    "HAnimSite",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimSite.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
        }
    )
);

// ### HAnimHumanoid ###
x3dom.registerNodeType(
    "HAnimHumanoid",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        function (ctx) {
            x3dom.nodeTypes.HAnimHumanoid.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'name', "");
            this.addField_SFString(ctx, 'version', "");
            this.addField_MFString(ctx, 'info', []);

            this.addField_MFNode('joints', x3dom.nodeTypes.HAnimJoint);
            this.addField_MFNode('segments', x3dom.nodeTypes.HAnimSegment);
            this.addField_MFNode('sites', x3dom.nodeTypes.HAnimSite);
            this.addField_MFNode('skeleton', x3dom.nodeTypes.HAnimJoint);
            this.addField_MFNode('skin', x3dom.nodeTypes.X3DChildNode);
            this.addField_MFNode('skinCoord', x3dom.nodeTypes.X3DCoordinateNode);
            this.addField_MFNode('skinNormal', x3dom.nodeTypes.X3DNormalNode);
            this.addField_MFNode('viewpoints', x3dom.nodeTypes.HAnimSite);
        },
        {
            // TODO skeleton   contains the HumanoidRoot Joint object functionality: map similar to children of Group
            // TODO skeleton   add functionality for HAnimSite also (unaffected by internal transformations)
            // TODO joints     add functionality
            // TODO segments   add functionality
            // TODO sites      add functionality
            // TODO skin...    add functionality
            // TODO viewpoints add functionality
        }
    )
);
