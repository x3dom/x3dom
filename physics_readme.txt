Based on Extensible 3D (X3D), Part 1: Architecture and base components, 37 Rigid body physics
http://www.web3d.org/files/specifications/19775-1/V3.2/Part01/components/rigid_physics.html

Implementation of Rigid body physics component support level 1
1. CollidableShape Node (Sphere, Box, Cylinder, Cone, IndexedFaceSet and IndexedTriangleSet).
2. CollisionCollection Node

Implementation of Rigid body physics component support level 2
1. RigidBody Node
2. RigidBodyCollection Node
3. BallJoint
4. UniversalJoint
5. SingleAxisHingeJoint
6. DoubleAxisHingeJoint
7. SliderJoint
8. MotorJoint




Based on RigidBodyPhysics component of X3D


//	### RigidBodyCollection ###
x3dom.registerNodeType("RigidBodyCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.RigidBodyCollection.superClass.call(this, ctx);
	this.addField_SFBool(ctx, 'autoDisable', false);
	this.addField_SFFloat(ctx, 'constantForceMix', 0.0001);
	this.addField_SFFloat(ctx, 'contactSurfaceThickness', 0);
	this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);
	this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);
	this.addField_SFFloat(ctx, 'disableTime', 0);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFFloat(ctx, 'errorCorrection', 0.8);
	this.addField_SFVec3f(ctx, 'gravity', 0,-9.8,0);
	this.addField_SFInt32(ctx, 'iterations', 1);
	this.addField_SFFloat(ctx, 'maxCorrectionSpeed', -1);
	this.addField_SFBool(ctx, 'preferAccuracy', false);
	this.addField_MFNode('bodies', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('joints', x3dom.nodeTypes.X3DRigidJointNode);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		if(!this._cf.joints.nodes){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DRigidJointNode)){
					this._cf.joints = this._xmlNode.children[x];
				}
			}
		}
		if(!this._cf.bodies.nodes){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
					this._cf.bodies = this._xmlNode.children[x];
				}
			}
		}
		x3dom.debug.logInfo('RigidBodyCollection: ');
	}
}));

//	### RigidBody ###
x3dom.registerNodeType("RigidBody", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.RigidBody.superClass.call(this, ctx);
	this.addField_SFFloat(ctx, 'angularDampingFactor', 0.001);
	this.addField_SFVec3f(ctx, 'angularVelocity', 0,0,0);
	this.addField_SFBool(ctx, 'autoDamp', false);
	this.addField_SFBool(ctx, 'autoDisable', false);
	this.addField_SFVec3f(ctx, 'centerOfMass', 0,0,0);
	this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);
	this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);
	this.addField_SFFloat(ctx, 'disableTime', 0);
	this.addField_SFBool(ctx, 'enabled', true);		
	this.addField_SFVec3f(ctx, 'finiteRotationAxis', 0,0,0);
	this.addField_SFBool(ctx, 'fixed', false);
	this.addField_MFVec3f(ctx, 'forces', []);
	this.addField_MFFloat(ctx, 'inertia', [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	this.addField_SFFloat(ctx, 'linearDampingFactor', 0.001);
	this.addField_SFVec3f(ctx, 'linearVelocity', 0,0,0);
	this.addField_SFFloat(ctx, 'mass', 1);
	this.addField_SFRotation(ctx, 'orientation', 0,0,1,0);
	this.addField_SFVec3f(ctx, 'position', 0,0,0);
	this.addField_MFVec3f(ctx, 'torques', []);
	this.addField_SFBool(ctx, 'useFiniteRotation', false);
	this.addField_SFBool(ctx, 'useGlobalGravity', true);
	this.addField_MFNode('massDensityModel', x3dom.nodeTypes.Shape);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
	this.addField_MFNode('geometry', x3dom.nodeTypes.X3DNBodyCollidableNode);
},{
	nodeChanged: function(){
		if(!this._cf.geometry.nodes){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
					this._cf.geometry = this._xmlNode.children[x];
				}
			}
		}
		if(!this._cf.massDensityModel.nodes){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Shape)){
					this._cf.massDensityModel = this._xmlNode.children[x];
				}
			}
		}
	   x3dom.debug.logInfo('RigidBody: ');
	}
}));

//	### X3DNBodyCollidableNode ###
x3dom.registerNodeType("X3DNBodyCollidableNode", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.X3DNBodyCollidableNode.superClass.call(this, ctx);
	this.addField_SFBool(ctx, 'enabled', true);	
	this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);
	this.addField_SFVec3f(ctx, 'translation', 0,0,0);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
	   x3dom.debug.logInfo('X3DNBodyCollidableNode: ');
	}
}));

//	### CollidableShape ###
x3dom.registerNodeType("CollidableShape", "X3DNBodyCollidableNode ", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.CollidableShape.superClass.call(this, ctx);
	this.addField_SFBool(ctx, 'enabled', true);	
	this.addField_SFRotation(ctx, 'rotation', 0,0,1,0);
	this.addField_SFVec3f(ctx, 'translation', 0,0,0);
	this.addField_SFNode('transform', x3dom.nodeTypes.Transform);
	this.addField_SFNode('shape', x3dom.nodeTypes.Shape);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		if(!this._cf.transform.node){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Transform)){
					this._cf.transform = this._xmlNode.children[x];
				}
			}
		}
		if(!this._cf.shape.node){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.Shape)){
					this._cf.shape = this._xmlNode.children[x];
				}
			}
		}
	   x3dom.debug.logInfo('CollidableShape: ');
	}
}));

//	### CollisionCollection ###
x3dom.registerNodeType("CollisionCollection", "X3DChildNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.CollisionCollection.superClass.call(this, ctx);
	this.addField_SFFloat(ctx, 'bounce', 0);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFVec2f(ctx, 'frictionCoefficients', 0,0);
	this.addField_SFFloat(ctx, 'minBounceSpeed', 0.1);
	this.addField_SFVec2f(ctx, 'slipFactors', 0,0);
	this.addField_SFFloat(ctx, 'softnessConstantForceMix', 0.0001);
	this.addField_SFFloat(ctx, 'softnessErrorCorrection', 0.8);
	this.addField_SFVec2f(ctx, 'surfaceSpeed', 0,0);
	this.addField_MFNode('collidables', x3dom.nodeTypes.X3DNBodyCollidableNode);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		if(!this._cf.collidables.nodes){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.X3DNBodyCollidableNode)){
					this._cf.collidables = this._xmlNode.children[x];
				}
			}
		}
		x3dom.debug.logInfo('CollisionCollection: ');
	}
}));

//	### CollisionSensor ###
x3dom.registerNodeType("CollisionSensor", "X3DSensorNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.CollisionSensor.superClass.call(this, ctx);
	this.addField_SFBool(ctx, 'enabled', true);
	this.addField_SFNode('collider', x3dom.nodeTypes.CollisionCollection);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		if(!this._cf.collider.node){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.CollisionCollection)){
					this._cf.collider = this._xmlNode.children[x];
				}
			}
		}
		x3dom.debug.logInfo('CollisionSensor: ');
	}
}));

//	### X3DRigidJointNode ###
x3dom.registerNodeType("X3DRigidJointNode", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.X3DRigidJointNode.superClass.call(this, ctx);
	this.addField_SFString(ctx, 'forceOutput', "");
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		if(!this._cf.body1.node){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
					this._cf.body1 = this._xmlNode.children[x];
				}
			}
		}
		if(!this._cf.body2.node){
			for(var x in this._xmlNode.children){
				if(x3dom.isa(this._xmlNode.children[x]._x3domNode, x3dom.nodeTypes.RigidBody)){
					this._cf.body2 = this._xmlNode.children[x];
				}
			}
		}
		x3dom.debug.logInfo('X3DRigidJointNode: ');
	}
}));

//	### BallJoint ###
x3dom.registerNodeType("BallJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.BallJoint.superClass.call(this, ctx);
	this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('BallJoint: ');
	}
}));

//	### MotorJoint ###
x3dom.registerNodeType("MotorJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.MotorJoint.superClass.call(this, ctx);
	this.addField_SFFloat(ctx, 'axis1Angle', 0);
	this.addField_SFFloat(ctx, 'axis1Torque', 0);
	this.addField_SFFloat(ctx, 'axis2Angle', 0);
	this.addField_SFFloat(ctx, 'axis2Torque', 0);
	this.addField_SFFloat(ctx, 'axis3Angle', 0);
	this.addField_SFFloat(ctx, 'axis3Torque', 0);
	this.addField_SFInt32(ctx, 'enabledAxes', 1);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFVec3f(ctx, 'motor1Axis', 0,0,0);
	this.addField_SFVec3f(ctx, 'motor2Axis', 0,0,0);
	this.addField_SFVec3f(ctx, 'motor3Axis', 0,0,0);
	this.addField_SFFloat(ctx, 'stop1Bounce', 0);
	this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);
	this.addField_SFFloat(ctx, 'stop2Bounce', 0);
	this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);
	this.addField_SFFloat(ctx, 'stop3Bounce', 0);
	this.addField_SFFloat(ctx, 'stop3ErrorCorrection', 0.8);
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('MotorJoint: ');
	}
}));

//	### SliderJoint ###
x3dom.registerNodeType("SliderJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.SliderJoint.superClass.call(this, ctx);
	this.addField_SFVec3f(ctx, 'axis', 0,1,0);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFFloat(ctx, 'maxSeparation', 1);
	this.addField_SFFloat(ctx, 'minSeparation', 0);
	this.addField_SFFloat(ctx, 'stopBounce', 0);
	this.addField_SFFloat(ctx, 'stopErrorCorrection', 1);
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('SliderJoint: ');
	}
}));

//	### UniversalJoint ###
x3dom.registerNodeType("UniversalJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.UniversalJoint.superClass.call(this, ctx);
	this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
	this.addField_SFVec3f(ctx, 'axis1', 0,0,0);
	this.addField_SFVec3f(ctx, 'axis2', 0,0,0);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFFloat(ctx, 'stop1Bounce', 0);
	this.addField_SFFloat(ctx, 'stop1ErrorCorrection', 0.8);
	this.addField_SFFloat(ctx, 'stop2Bounce', 0);
	this.addField_SFFloat(ctx, 'stop2ErrorCorrection', 0.8);
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('UniversalJoint: ');
	}
}));

//	### SingleAxisHingeJoint ###
x3dom.registerNodeType("SingleAxisHingeJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.SingleAxisHingeJoint.superClass.call(this, ctx);
	this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
	this.addField_SFVec3f(ctx, 'axis', 0,0,0);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFFloat(ctx, 'maxAngle', 90);
	this.addField_SFFloat(ctx, 'minAngle', -90);
	this.addField_SFFloat(ctx, 'stopBounce', 0);
	this.addField_SFFloat(ctx, 'stopErrorCorrection', 0.8);
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('SingleAxisHingeJoint: ');
	}
}));

//	### DoubleAxisHingeJoint ###
x3dom.registerNodeType("DoubleAxisHingeJoint", "X3DRigidJointNode", defineClass(x3dom.nodeTypes.X3DNode, function(ctx){
	x3dom.nodeTypes.DoubleAxisHingeJoint.superClass.call(this, ctx);
	this.addField_SFVec3f(ctx, 'anchorPoint', 0,0,0);
	this.addField_SFVec3f(ctx, 'axis1', 0,0,0);
	this.addField_SFVec3f(ctx, 'axis2', 0,0,0);
	this.addField_SFFloat(ctx, 'desiredAngularVelocity1', 0);
	this.addField_SFFloat(ctx, 'desiredAngularVelocity2', 0);
	this.addField_SFString(ctx, 'forceOutput', "NONE");
	this.addField_SFFloat(ctx, 'maxAngle1', 90);
	this.addField_SFFloat(ctx, 'minAngle1', -90);
	this.addField_SFFloat(ctx, 'maxTorque1', 0);
	this.addField_SFFloat(ctx, 'maxTorque2', 0);
	this.addField_SFFloat(ctx, 'stopBounce1', 0);
	this.addField_SFFloat(ctx, 'stopConstantForceMix1', 0.001);
	this.addField_SFFloat(ctx, 'stopErrorCorrection1', 0.8);
	this.addField_SFFloat(ctx, 'suspensionErrorCorrection', 0.8);
	this.addField_SFFloat(ctx, 'suspensionForce', 0);
	this.addField_SFNode('body1', x3dom.nodeTypes.RigidBody);
	this.addField_SFNode('body2', x3dom.nodeTypes.RigidBody);
	this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);
},{
	nodeChanged: function(){
		x3dom.debug.logInfo('DoubleAxisHingeJoint: ');
	}
}));







Implemented attributes for each Node described in X3D Rigid body physics component, are shown below.


RigidBody : X3DNode {
	SFFloat    [in,out] angularDampingFactor 0.001   [0,1]				implemented
	SFVec3f    [in,out] angularVelocity      0 0 0   (-∞,∞)				implemented
	SFBool     [in,out] autoDamp             FALSE					implemented
	SFBool     [in,out] autoDisable          FALSE					not implemented
	SFVec3f    [in,out] centerOfMass         0 0 0   (-∞,∞)				implemented
	SFFloat    [in,out] disableAngularSpeed  0       [0,∞)				implemented
	SFFloat    [in,out] disableLinearSpeed   0       [0,∞)				implemented
	SFFloat    [in,out] disableTime          0       [0,∞)				not implemented
	SFBool     [in,out] enabled              TRUE					implemented
	SFVec3f    [in,out] finiteRotationAxis   0 0 0   [-1,1]				implemented
	SFBool     [in,out] fixed                FALSE					implemented
	MFVec3f    [in,out] forces               []					TODO
	MFNode     [in,out] geometry             []      [X3DNBodyCollidableNode]	implemented
	SFMatrix3f [in,out] inertia	     	 1 0 0					implemented
                                         	 0 1 0
                                         	 0 0 1
	SFFloat    [in,out] linearDampingFactor  0.001   [0,1]				implemented
	SFVec3f    [in,out] linearVelocity       0 0 0   (-∞,∞)				implemented
	SFFloat    [in,out] mass                 1       (0,∞)				implemented
	SFNode     [in,out] massDensityModel     NULL    [Sphere, Box, Cone]		not implemented
	SFNode     [in,out] metadata             NULL    [X3DMetadataObject]		implemented
	SFRotation [in,out] orientation          0 0 1 0 [0,1]				not implemented
	SFVec3f    [in,out] position             0 0 0   (-∞,∞)				not implemented
	MFVec3f    [in,out] torques              []					implemented
	SFBool     [in,out] useFiniteRotation    FALSE					implemented
	SFBool     [in,out] useGlobalGravity     TRUE					implemented
}


RigidBodyCollection : X3DChildNode {
	MFNode  [in]     set_contacts            []       [Contact] 			not implemented
	SFBool  [in,out] autoDisable             FALSE					not implemented
	MFNode  [in,out] bodies                  []       [RigidBody]			implemented
	SFFloat [in,out] constantForceMix        0.0001   [0,∞)				not implemented
	SFFloat [in,out] contactSurfaceThickness 0        [0,∞)				implemented
	SFFloat [in,out] disableAngularSpeed     0        [0,∞)				not implemented
	SFFloat [in,out] disableLinearSpeed      0        [0,∞)				not implemented
	SFFloat [in,out] disableTime             0        [0,∞)				not implemented
	SFBool  [in,out] enabled                 TRUE					implemented
	SFFloat [in,out] errorCorrection         0.8      [0,1]				TODO
	SFVec3f [in,out] gravity                 0 -9.8 0				implemented
	SFInt32 [in,out] iterations              10	    [0,∞)			not implemented
	MFNode  [in,out] joints                  []       [X3DRigidJointNode]		implemented
	SFFloat [in,out] maxCorrectionSpeed      -1       [0,∞) or -1			not implemented
	SFNode  [in,out] metadata                NULL     [X3DMetadataObject]		implemented
	SFBool  [in,out] preferAccuracy          FALSE					not implemented
	SFNode  []       collider                NULL     [CollisionCollection]		implemented
}



CollidableShape : X3DNBodyCollidableNode  {
	SFBool     [in,out] enabled     	TRUE					implemented
	SFNode     [in,out] metadata    	NULL     [X3DMetadataObject]		implemented
	SFRotation [in,out] rotation    	0 0 1 0  [0,1]				implemented
	SFVec3f    [in,out] translation 	0 0 0    (-∞,∞)				implemented
	SFVec3f    []       bboxCenter  	0 0 0    (-∞,∞)				
	SFVec3f    []       bboxSize    	-1 -1 -1 [0,∞) or -1 -1 -1		
	SFNode     []       shape       	NULL     [Shape]			
}


CollisionCollection : X3DChildNode {
	MFString [in,out] appliedParameters        "BOUNCE" []				not implemented
	SFFloat  [in,out] bounce                   0        [0,1]			implemented
	MFNode   [in,out] collidables              NULL     [X3DNBodyCollisionSpaceNode,	
                                                   X3DNBodyCollidableNode]		implemented
	SFBool   [in,out] enabled                  TRUE					not implemented
	SFVec2f  [in,out] frictionCoefficients     0 0      [0,∞)			implemented
	SFNode   [in,out] metadata                 NULL     [X3DMetadataObject]		implemented
	SFFloat  [in,out] minBounceSpeed           0.1      [0,∞)			not implemented
	SFVec2f  [in,out] slipFactors		   0 0      (-∞,∞)			TODO
	SFFloat  [in,out] softnessConstantForceMix 0.0001   [0,1]			not implemented
	SFFloat  [in,out] softnessErrorCorrection  0.8      [0,1]			not implemented
	SFVec2f  [in,out] surfaceSpeed             0 0      (-∞,∞)			TODO
}

CollisionSensor : X3DSensorNode {
  	SFNode [in,out] collider      NULL [CollisionCollection]			not implemented
  	SFBool [in,out] enabled       TRUE						not implemented
  	SFNode [in,out] metadata      NULL [X3DMetadataObject]				not implemented
  	MFNode [out]    intersections	[X3DNBodyCollidableNode]			not implemented
  	MFNode [out]    contacts           [Contact]					not implemented
  	SFBool [out]    isActive
}


BallJoint : X3DRigidJointNode {
	SFVec3f  [in,out] anchorPoint      0 0 0					implemented
	SFNode   [in,out] body1            NULL   [RigidBody]				implemented
	SFNode   [in,out] body2            NULL   [RigidBody]				implemented
	MFString [in,out] forceOutput      "NONE" ["ALL","NONE",...]			not implemented
	SFNode   [in,out] metadata         NULL   [X3DMetadataObject]			implemented
	SFVec3f  [out]    body1AnchorPoint
	SFVec3f  [out]    body2AnchorPoint
}

UniversalJoint : X3DRigidJointNode {
	SFVec3f  [in,out] anchorPoint          0 0 0					implemented
	SFVec3f  [in,out] axis1                0 0 0					implemented
	SFVec3f  [in,out] axis2                0 0 0					implemented
	SFNode   [in,out] body1                NULL   [RigidBody]			implemented
	SFNode   [in,out] body2                NULL   [RigidBody]			implemented
	SFNode   [in,out] metadata             NULL   [X3DMetadataObject]		implemented
	MFString [in,out] forceOutput          "NONE" ["ALL","NONE",...]		not implemented
	SFFloat  [in,out] stopBounce1          0      [0,1]				not implemented
	SFFloat  [in,out] stop1ErrorCorrection 0.8    [0,1]				not implemented
	SFFloat  [in,out] stop2Bounce          0      [0,1]				not implemented
	SFFloat  [in,out] stop2ErrorCorrection 0.8    [0,1]				not implemented
	SFVec3f  [out]    body1AnchorPoint
	SFVec3f  [out]    body1Axis
	SFVec3f  [out]    body2AnchorPoint
	SFVec3f  [out]    body2Axis
}


SingleAxisHingeJoint : X3DRigidJointNode {
	SFVec3f  [in,out] anchorPoint         0 0 0					implemented
	SFVec3f  [in,out] axis                0 0 0					implemented
	SFNode   [in,out] body1               NULL   [RigidBody]			implemented
	SFNode   [in,out] body2               NULL   [RigidBody]			implemented
	MFString [in,out] forceOutput         "NONE" ["ALL","NONE",...]			not implemented
	SFFloat  [in,out] maxAngle		π					implemented
	SFNode   [in,out] metadata            NULL   [X3DMetadataObject]		implemented
	SFFloat  [in,out] minAngle            -π					implemented
	SFFloat  [in,out] stopBounce          0      [0,1]				not implemented
	SFFloat  [in,out] stopErrorCorrection 0.8    [0,1]				not implemented
	SFFloat  [out]    angle
	SFFloat  [out]    angleRate
	SFVec3f  [out]    body1AnchorPoint
	SFVec3f  [out]    body2AnchorPoint
}


DoubleAxisHingeJoint : X3DRigidJointNode {
	SFVec3f  [in,out] anchorPoint               0 0 0				implemented
	SFVec3f  [in,out] axis1                     0 0 0				implemented
	SFVec3f  [in,out] axis2                     0 0 0				implemented
	SFNode   [in,out] body1                     NULL   [RigidBody]			implemented
	SFNode   [in,out] body2                     NULL   [RigidBody]			implemented
	SFFloat  [in,out] desiredAngularVelocity1   0      (-∞,∞)			not implemented
	SFFloat  [in,out] desiredAngularVelocity2   0      (-∞,∞)			not implemented
	MFString [in,out] forceOutput               "NONE" ["ALL","NONE",...]		not implemented
	SFFloat  [in,out] maxAngle1                 π      [-π,π]			implemented
	SFFloat  [in,out] maxTorque1                0      (-∞,∞)			TODO
	SFFloat  [in,out] maxTorque2                0      (-∞,∞)			TODO
	SFNode   [in,out] metadata			NULL   [X3DMetadataObject]	implemented
	SFFloat  [in,out] minAngle1                 -π     [-π,π]			implemented
	SFFloat  [in,out] stopBounce1               0      [0,1]			not implemented
	SFFloat  [in,out] stopConstantForceMix1     0.001  [0,∞)			not implemented
	SFFloat  [in,out] stopErrorCorrection1      0.8    [0,1]			not implemented
	SFFloat  [in,out] suspensionErrorCorrection 0.8    [0,1]			not implemented
	SFFloat  [in,out] suspensionForce            0     [0,∞)			not implemented
	SFVec3f  [out]    body1AnchorPoint
	SFVec3f  [out]    body1Axis
	SFVec3f  [out]    body2AnchorPoint
	SFVec3f  [out]    body2Axis
	SFFloat  [out]    hinge1Angle
	SFFloat  [out]    hinge1AngleRate
	SFFloat  [out]    hinge2Angle
	SFFloat  [out]    hinge2AngleRate
}


SliderJoint : X3DRigidJointNode {
	SFVec3f  [in,out] axis                0 1 0					not implemented
	SFNode   [in,out] body1               NULL   [RigidBody]			implemented	
	SFNode   [in,out] body2               NULL   [RigidBody]			implemented	
	MFString [in,out] forceOutput         "NONE" ["ALL","NONE",...]			not implemented	
	SFFloat  [in,out] maxSeparation       1      [0,∞)				not implemented		
	SFNode   [in,out] metadata            NULL   [X3DMetadataObject]		implemented	
	SFFloat  [in,out] minSeparation       0      [0,∞)				TODO
	SFFloat  [in,out] stopBounce          0      [0,1]				not implemented
	SFFloat  [in,out] stopErrorCorrection 1      [0,1]				not implemented
	SFFloat  [out]    separation
	SFFloat  [out]    separationRate
}


MotorJoint : X3DRigidJointNode {
	SFFloat  [in,out] axis1Angle           0      [-π,π]				implemented
	SFFloat  [in,out] axis1Torque          0      (-∞,∞)				implemented
	SFFloat  [in,out] axis2Angle           0      [-π,π]				implemented
	SFFloat  [in,out] axis2Torque          0      (-∞,∞)				implemented
	SFFloat  [in,out] axis3Angle           0      [-π,π]				implemented
	SFFloat  [in,out] axis3Torque          0      (-∞,∞)				implemented
	SFNode   [in,out] body1                NULL   [RigidBody]			implemented
	SFNode   [in,out] body2                NULL   [RigidBody]			implemented
	SFInt32  [in,out] enabledAxes          1	[0,3]				TODO
	MFString [in,out] forceOutput          "NONE" ["ALL","NONE",...]		not implemented
	SFNode   [in,out] metadata             NULL   [X3DMetadataObject]		implemented
	SFVec3f  [in,out] motor1Axis           0 0 0					implemented
	SFVec3f  [in,out] motor2Axis           0 0 0					implemented
	SFVec3f  [in,out] motor3Axis           0 0 0					implemented
	SFFloat  [in,out] stop1Bounce          0      [0,1]				not implemented
	SFFloat  [in,out] stop1ErrorCorrection 0.8    [0,1]				not implemented
	SFFloat  [in,out] stop2Bounce          0      [0,1]				not implemented
	SFFloat  [in,out] stop2ErrorCorrection 0.8    [0,1]				not implemented
	SFFloat  [in,out] stop3Bounce          0      [0,1]				not implemented
	SFFloat  [in,out] stop3ErrorCorrection 0.8    [0,1]				not implemented
	SFFloat  [out]    motor1Angle
	SFFloat  [out]    motor1AngleRate
	SFFloat  [out]    motor2Angle
	SFFloat  [out]    motor2AngleRate
	SFFloat  [out]    motor3Angle
	SFFloat  [out]    motor3AngleRate
	SFBool   []       autoCalc             FALSE
}


