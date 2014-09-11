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


