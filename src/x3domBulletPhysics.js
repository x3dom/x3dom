/*

Initial contribution/implementation by Andreas Stamoulias, Multimedia Content Lab (MCLab) (medialab.teicrete.gr),
Technological Institute of Crete - Department of Informatics Engineering.

Specific optimizations and additions were based on Don Brutzman's (http://faculty.nps.edu/brutzman/brutzman.html) commentary 
and the X3D Rigid body physics examples (http://www.web3d.org/x3d/content/examples/Basic/RigidBodyPhysics/).

This software is based on x3dom framework and ammo.js under their licenses.

This software is dual licensed under the MIT and GPL licenses.

==[MIT]====================================================================

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


==[GPL]====================================================================

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.


*/


function Vector2d(){
	var x;
	var y;
}

function Vector3d(){
	var x;
	var y;
	var z;
}

function Vector4d(){
	var x;
	var y;
	var z;
	var w;
}

function Vector3x3d(){
	var xx;
	var xy;
	var xz;	
	
	var yx;
	var yy;
	var yz;
	
	var zx;
	var zy;
	var zz;
}

function IndexedFaceset(){
	var coordIndex = [];
	var coordPoint = [];
}

function IndexedTriangleSet(){
	var coordIndex = [];
	var coordPoint = [];
}

function IndexedLineSet(){
	var coordIndex = [];
	var coordPoint = [];
}

function Motors(){
	var torque = new Vector3d();
}



function X3DCollidableShape(){

	// CS stands for CollidableShape. CollidableShapes' attributes.
	var CS_index;
	var CS_DEF;
	var CS_containerField;
	var CS_enabled;
	var CS_Rotation = new Vector4d();
	var CS_Translation = new Vector3d();
	var CS_InitialPosition = new Vector3d();
	var CS_InitialRotation = new Vector4d();
	
	// CollisionCollection attributes
	var CC_DEF;
	var CC_bounce;
	var CC_containerField;
	var CC_minBounceSpeed;
	var CC_appliedParameters;
	var CC_enabled;
	var CC_frictionCoefficients = new Vector2d();
	var CC_slipFactors = new Vector2d();
	var CC_softnessConstantForceMix;
	var CC_softnessErrorCorrection;
	var CC_surfaceSpeed = new Vector2d();
	
	// Shapes attributes. 
	var Name;
	var Type;
	var DEF;
	var C_Size = new Vector3d();
	var C_Radius;
	var C_Height;
	
	// Transforms attributes
	var T_index;
	var T_DEF;
	var Translation = new Vector3d();
	var Rotation = new Vector4d();
	var Size = new Vector3d();
	var Radius;
	var Height;
	var Scale = new Vector3d();
	
	// RigidBodyCollection attributes
	var RBC_set_contacts;
	var RBC_autoDisable;
	var RBC_bodies;
	var RBC_constantForceMix;
	var RBC_contactSurfaceThickness;
	var RBC_disableAngularSpeed;
	var RBC_disableLinearSpeed;
	var RBC_disableTime;
	var RBC_enabled;
	var RBC_errorCorrection;
	var RBC_gravity = new Vector3d();
	var RBC_iterations;
	var RBC_joints;
	var RBC_maxCorrectionSpeed;
	var RBC_metadata;
	var RBC_preferAccuracy;
	var RBC_collider;
	
	// RigidBody attributes
	var RB_DEF;
	var RB_angularDampingFactor;
	var RB_angularVelocity = new Vector3d();
	var RB_autoDamp;
	var RB_autoDisable;
	var RB_centerOfMass = new Vector3d();
	var RB_disableAngularSpeed;
	var RB_disableLinearSpeed;
	var RB_disableTime;
	var RB_enabled;
	var RB_finiteRotationAxis;
	var RB_fixed;
	var RB_forces;
	var RB_geometry;
	var RB_inertia = new Vector3x3d();
	var RB_linearDampingFactor;
	var RB_linearVelocity = new Vector3d();
	var RB_mass;
	var RB_massDensityModel;
	var RB_metadata;
	var RB_orientation = new Vector4d();
	var RB_position = new Vector3d();
	var RB_torques;
	var RB_useFiniteRotation;
	var RB_useGlobalGravity;
	
	var createRigid;
	var IndexedFaceSetGeometry = new IndexedFaceset();
	var IndexedTriangleSetGeometry = new IndexedTriangleSet();
	var IndexedLineSetGeometry = new IndexedLineSet();
	
	var isMotor = false;
	var Motor = new Motors();
	
}

function X3DJoint(){

 /* Supported Joint Types
 1. BallJoint();
 2. MotorJoint();
 3. DoubleAxisHingeJoint();
 4. SingleAxisHingeJoint();
 5. SliderJoint();
 6. UniversalJoint();
 */

 var JointTypeName; // string
 var X3D_JointType;
 var createJoint;
 var JointMotors = new Motors();

}


function BallJoint(){ //as btPoint2PointConstraint in Bullet

	var anchorPoint = new Vector3d();
	
	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;

	var debugMode; //boolean, DEBUG MODE is enabled with debugMode='true' in any joint type
	
}

function SliderJoint(){ //as btSliderConstraint in Bullet

	var axis = new Vector3d();
	var maxSeparation;
	var minSeparation;
	var sliderForce;
	var stopBounce;
	var stopErrorCorrection;
	
	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;
	
	var debugMode;
	
}

function UniversalJoint(){ //as btUniversalConstraint in Bullet

	var axis1 = new Vector3d();
	var axis2 = new Vector3d();
	var containerField; 
	var anchorPoint = new Vector3d();
	var stop1Bounce;
	var stop1ErrorCorrection; 
	var stop2Bounce; 
	var stop2ErrorCorrection;
	
	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;

	var debugMode;
	
}


function MotorJoint(){	//as btPoint2PointConstraint in Bullet

	var containerField;
	var axis1Angle;
	var axis1Torque;
	var axis2Angle;
	var axis2Torque;
	var axis3Angle;
	var axis3Torque;
	var enabledAxes;
	var motor1Axis = new Vector3d();
	var motor2Axis = new Vector3d();
	var motor3Axis = new Vector3d();
	var stop1Bounce;
	var stop1ErrorCorrection;  	
	var stop2Bounce;
	var stop2ErrorCorrection;  	
	var stop3Bounce;
	var stop3ErrorCorrection;

	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;

	var debugMode;
	
}


function SingleAxisHingeJoint(){ // as btHingeConstraint in Bullet

	var anchorPoint = new Vector3d();
	var axis = new Vector3d();
	var minAngle; // (converted in radians inside the parser)
	var maxAngle;
	var stopBounce;
	var stopErrorCorrection;
	
	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;

	var debugMode;
	
}




function DoubleAxisHingeJoint(){ // as btHingeConstraint in Bullet

	var anchorPoint = new Vector3d();
	var axis1 = new Vector3d();
	var axis2 = new Vector3d();
	var desiredAngularVelocity1;
	var desiredAngularVelocity2;
	var minAngle1;
	var maxAngle1;
	var maxTorque1;
	var maxTorque2;	
	var stopBounce1;
	var stopErrorCorrection1;
	var stopConstantForceMix1;
	var suspensionErrorCorrection;
	var suspensionForce;
	
	var body1_USE;
	var CollidableShape_body1_USE;
	var body2_USE;
	var CollidableShape_body2_USE;

	var debugMode;
	
}




(function(){


	var CollidableShapes = [], JointShapes = [], scene, initScene, render, main, updateRigidbodies, MakeUpdateList, 
		CreateRigidbodies, rigidbodies = [], WorldGravity = new Vector3d(),obj, startPos, currPos, drag = false, 
		updateRigidbody, updateJoint, runtime = null, x3d, intervalVar, building_constraints = true, debug_mode=false
		append_ammo=false;

		
	//Get all CollidableShapes from the scene and create an instance of the X3DCollidableShape using their attributes.
	var colShape = document.getElementsByTagName("CollidableShape");
	if(colShape == null){
		console.log("NO CollidableShape node");
	}
	else{

		if(append_ammo == false){
			append_ammo = true;
			var head = document.getElementsByTagName("head")[0];
			var ammojs = document.createElement('script');
			ammojs.type = "text/javascript";
			ammojs.src = "ammo.js";
			head.appendChild(ammojs);
		}

		for (i=0; i < colShape.length; i++) {
	
			var X3D_CS = new X3DCollidableShape;
			
			X3D_CS.CS_index = colShape[i].getAttribute("index");
			X3D_CS.CS_DEF = colShape[i].getAttribute('DEF');
			X3D_CS.CS_containerField = colShape[i].getAttribute('containerField');
			X3D_CS.CS_enabled = colShape[i].getAttribute('enabled');

			if(colShape[i].hasAttribute('rotation')){
				var tempArraySize =colShape[i].getAttribute("rotation").split(" ");
				X3D_CS.CS_Rotation = new Vector4d;
				X3D_CS.CS_Rotation.x = tempArraySize[0];
				X3D_CS.CS_Rotation.y = tempArraySize[1];
				X3D_CS.CS_Rotation.z = tempArraySize[2];
				X3D_CS.CS_Rotation.w = tempArraySize[3];
				
				X3D_CS.CS_InitialRotation = new Vector4d;
				X3D_CS.CS_InitialRotation.x = tempArraySize[0];
				X3D_CS.CS_InitialRotation.y = tempArraySize[1];
				X3D_CS.CS_InitialRotation.z = tempArraySize[2];
				X3D_CS.CS_InitialRotation.w = tempArraySize[3];
			}
			
			if(colShape[i].hasAttribute('translation')){
				var tempArraySize =colShape[i].getAttribute("translation").split(" ");
				X3D_CS.CS_Translation = new Vector3d;
				X3D_CS.CS_Translation.x = parseFloat(tempArraySize[0]);
				X3D_CS.CS_Translation.y = parseFloat(tempArraySize[1]);
				X3D_CS.CS_Translation.z = parseFloat(tempArraySize[2]);
				
				X3D_CS.CS_InitialPosition = new Vector3d;
				X3D_CS.CS_InitialPosition.x = tempArraySize[0];
				X3D_CS.CS_InitialPosition.y = tempArraySize[1];
				X3D_CS.CS_InitialPosition.z = tempArraySize[2];
			}
			
			/*
				CollisionSensor --> CollisionCollection --> CollidableShape
			*/
			var colSensor = document.getElementsByTagName("CollisionSensor");
			for (var cs=0; cs < colSensor.length; cs++) {
				var colSensorChilds = colSensor[cs].getElementsByTagName("CollisionCollection");
				for (var cs1=0; cs1 < colSensorChilds.length; cs1++) {
					var colSensorCollectionChilds = colSensorChilds[cs1].getElementsByTagName("CollidableShape");
					for (var cs2=0; cs2 < colSensorCollectionChilds.length; cs2++) {	
						if(colSensorCollectionChilds[cs2].getAttribute('USE') == X3D_CS.CS_DEF){
							X3D_CS.CC_DEF = colSensorChilds[cs].getAttribute('DEF');
							X3D_CS.CC_bounce = parseFloat(colSensorChilds[cs].getAttribute('bounce'));
							X3D_CS.CC_containerField = colSensorChilds[cs].getAttribute('containerField');
							X3D_CS.CC_minBounceSpeed = parseFloat(colSensorChilds[cs].getAttribute('minBounceSpeed'));
							X3D_CS.CC_appliedParameters = colSensorChilds[cs].getAttribute('appliedParameters');
							X3D_CS.CC_enabled = colSensorChilds[cs].getAttribute('enabled');
								
							if(colSensorChilds[cs].hasAttribute('frictionCoefficients')){
								var tempArray = colSensorChilds[cs].getAttribute('frictionCoefficients').split(" ");
								X3D_CS.CC_frictionCoefficients = new Vector2d;
								X3D_CS.CC_frictionCoefficients.x = tempArray[0];
								X3D_CS.CC_frictionCoefficients.y = tempArray[1];
							}
								
							if(colSensorChilds[cs].hasAttribute('slipFactors')){
								var tempArray = colSensorChilds[cs].getAttribute('slipFactors').split(" ");
								X3D_CS.CC_slipFactors = new Vector2d;
								X3D_CS.CC_slipFactors.x = tempArray[0];
								X3D_CS.CC_slipFactors.y = tempArray[1];
							}
								
							X3D_CS.CC_softnessConstantForceMix = parseFloat(colSensorChilds[cs].getAttribute('softnessConstantForceMix'));
							X3D_CS.CC_softnessErrorCorrection = parseFloat(colSensorChilds[cs].getAttribute('softnessErrorCorrection'));
								
							if(colSensorChilds[cs].hasAttribute('surfaceSpeed')){
								var tempArray = colSensorChilds[cs].getAttribute('surfaceSpeed').split(" ");
								X3D_CS.CC_surfaceSpeed = new Vector2d;
								X3D_CS.CC_surfaceSpeed.x = tempArray[0];
								X3D_CS.CC_surfaceSpeed.y = tempArray[1];
							}	
						}	
					}
				}
			}
			
			
			// Search every shape node in CollidableShape
			var shapes = colShape[i].getElementsByTagName("Shape");
			for (s=0; s < shapes.length; s++) {
				for (s2=0; s2 < shapes[s].childNodes.length; s2++) {
					if (shapes[s].childNodes[s2].nodeType == 1 && !(shapes[s].childNodes[s2].nodeName =="Appearance" || shapes[s].childNodes[s2].nodeName == "appearance")){ // 1: type-element
						
						CollidableShapes.push( X3D_CS );
						
						X3D_CS.Name = shapes[s].childNodes[s2].nodeName;
						X3D_CS.Type = shapes[s].childNodes[s2].nodeType;
						if(shapes[s].childNodes[s2].getAttribute('DEF')){
							X3D_CS.DEF = shapes[s].childNodes[s2].getAttribute('DEF');
						}
						else{
							X3D_CS.DEF = null;
						}

						switch(X3D_CS.Name){
							
							case "BOX":
							case "Box":
							{
						
								if(shapes[s].childNodes[s2].hasAttribute('size')){
									var tempArraySize =shapes[s].childNodes[s2].getAttribute("size").split(" ");
									X3D_CS.C_Size = new Vector3d;
									X3D_CS.C_Size.x = tempArraySize[0];
									X3D_CS.C_Size.y = tempArraySize[1];
									X3D_CS.C_Size.z = tempArraySize[2];
								}
							
							}
							break;
						
							case "SPHERE":
							case "Sphere":
							{
								if(shapes[s].childNodes[s2].hasAttribute('radius')){
									X3D_CS.C_Radius = parseFloat(shapes[s].childNodes[s2].getAttribute('radius'));
								}
								
							}
							break;
						
							case "CYLINDER":
							case "Cylinder":
							{
							
								if(shapes[s].childNodes[s2].hasAttribute('radius')){
									X3D_CS.C_Radius = parseFloat(shapes[s].childNodes[s2].getAttribute('radius'));
								}
								if(shapes[s].childNodes[s2].hasAttribute('height')){
									X3D_CS.C_Height = parseFloat(shapes[s].childNodes[s2].getAttribute('height'));
								}
								
							}
							break;
						
							case "CONE":
							case "Cone":
							{
							
								if(shapes[s].childNodes[s2].hasAttribute('bottomRadius')){
									X3D_CS.C_Radius = parseFloat(shapes[s].childNodes[s2].getAttribute('bottomRadius'));
								}
								if(shapes[s].childNodes[s2].hasAttribute('height')){
									X3D_CS.C_Height = parseFloat(shapes[s].childNodes[s2].getAttribute('height'));
								}
							
							}
							break;
							
							case "INDEXEDFACESET":
							case "IndexedFaceSet":
							{
							
								var tempArrayIndex = shapes[s].childNodes[s2].getAttribute("coordIndex").split(" -1   ");
								X3D_CS.IndexedFaceSetGeometry = new IndexedFaceset;
								X3D_CS.IndexedFaceSetGeometry.coordIndex = [];
								for(var index = 0; index <tempArrayIndex.length; index++){
									X3D_CS.IndexedFaceSetGeometry.coordIndex[index] = [];
									var tmp = tempArrayIndex[index].split(" ");
									X3D_CS.IndexedFaceSetGeometry.coordIndex[index][0] = tmp[0];
									X3D_CS.IndexedFaceSetGeometry.coordIndex[index][1] = tmp[1];
									X3D_CS.IndexedFaceSetGeometry.coordIndex[index][2] = tmp[2];			
								}
													
								var indxfaceset_child = shapes[s].childNodes[s2];
								
								for(var ifn=0; ifn<indxfaceset_child.childNodes.length; ifn++){
									if(indxfaceset_child.childNodes[ifn].nodeName == "Coordinate"){
										X3D_CS.IndexedFaceSetGeometry.coordPoint = [];
										var tempArrayIndex = indxfaceset_child.childNodes[ifn].getAttribute("point").split(", ");
										for(var index = 0; index <tempArrayIndex.length; index++){
											X3D_CS.IndexedFaceSetGeometry.coordPoint[index] = [];
											var tmp = tempArrayIndex[index].split(" ");
											X3D_CS.IndexedFaceSetGeometry.coordPoint[index][0] = parseFloat(tmp[0]);
											X3D_CS.IndexedFaceSetGeometry.coordPoint[index][1] = parseFloat(tmp[1]);
											X3D_CS.IndexedFaceSetGeometry.coordPoint[index][2] = parseFloat(tmp[2]);
										
										}
									}
								}		
							}
							break;
							
							case "INDEXEDTRIANGLESET":
							case "IndexedTriangleSet":
							{
								
								X3D_CS.IndexedTriangleSetGeometry = new IndexedTriangleSet;
								var triangleset_child = shapes[s].childNodes[s2];
								
								for(var ifn=0; ifn<triangleset_child.childNodes.length; ifn++){
									if(triangleset_child.childNodes[ifn].nodeName == "Coordinate"){
										X3D_CS.IndexedTriangleSetGeometry.coordPoint = [];
										var tempArrayIndex = triangleset_child.childNodes[ifn].getAttribute("point").split(" ");
										var num = 0;
										for(var index = 0; index <tempArrayIndex.length/3; index++){
											X3D_CS.IndexedTriangleSetGeometry.coordPoint[index] = [];
											X3D_CS.IndexedTriangleSetGeometry.coordPoint[index][0] = parseFloat(tempArrayIndex[0+num]);
											X3D_CS.IndexedTriangleSetGeometry.coordPoint[index][1] = parseFloat(tempArrayIndex[1+num]);
											X3D_CS.IndexedTriangleSetGeometry.coordPoint[index][2] = parseFloat(tempArrayIndex[2+num]);
											num+=3;
										}
									}
								}	
							}
							break;
							
							
						}

						
						
						/*
							if nodeType = 1 : node is element type
							check if the CollidableShape's index and the Transform's index are matching
						*/
						var transform = document.getElementsByTagName("Transform");
						for (t=0; t < transform.length; t++) {
							var transform_index = transform[t].getAttribute("index");
							var transformElem = transform[t].getElementsByTagName("Shape");
							for (t2=0; t2 < transformElem.length; t2++) {
								for (t3=0; t3 < transformElem[t2].childNodes.length; t3++) {
								
									if (transformElem[t2].childNodes[t3].nodeType == 1 && !(transformElem[t2].childNodes[t3].nodeName =="Appearance" || transformElem[t2].childNodes[t3].nodeName == "appearance")){
										
										for (cs=0; cs < CollidableShapes.length; cs++) {
											
											if(CollidableShapes[cs].CS_index == transform_index){
												
												if(transform[t].hasAttribute("DEF")){
													X3D_CS.T_DEF = transform[t].getAttribute("DEF");
												}
												
												if(transform[t].hasAttribute("scale")){
													var tempArrayScale = transform[t].getAttribute("scale").split(" ");
													X3D_CS.Scale = new Vector3d;
													X3D_CS.Scale.x = tempArrayScale[0];
													X3D_CS.Scale.y = tempArrayScale[1];
													X3D_CS.Scale.z = tempArrayScale[2];
												}
												
												X3D_CS.Radius = parseFloat(transformElem[t2].childNodes[t3].getAttribute('radius'));
												X3D_CS.Height = parseFloat(transformElem[t2].childNodes[t3].getAttribute('height'));
												
												if(transform[t].hasAttribute("translation")){
													var tempArrayTranslation = transform[t].getAttribute("translation").split(" ");
													X3D_CS.Translation = new Vector3d;
													X3D_CS.Translation.x = tempArrayTranslation[0];
													X3D_CS.Translation.y = tempArrayTranslation[1];
													X3D_CS.Translation.z = tempArrayTranslation[2];
												}

												if(transform[t].hasAttribute("rotation")){
													var tempArrayRotation = transform[t].getAttribute("rotation").split(" ");
													X3D_CS.Rotation = new Vector4d;
													X3D_CS.Rotation.x = tempArrayRotation[0];
													X3D_CS.Rotation.y = tempArrayRotation[1];
													X3D_CS.Rotation.z = tempArrayRotation[2];
													X3D_CS.Rotation.w = tempArrayRotation[3];
												}
												
												if(transformElem[t2].childNodes[t3].hasAttribute("size")){
													var tempArraySize =transformElem[t2].childNodes[t3].getAttribute("size").split(" ");
													X3D_CS.Size = new Vector3d;
													X3D_CS.Size.x = tempArraySize[0];
													X3D_CS.Size.y = tempArraySize[1];
													X3D_CS.Size.z = tempArraySize[2];
												}	
											}
											else{
												
												if(CollidableShapes[cs].CS_index != transform_index && cs == CollidableShapes.length){
													X3D_CS.T_DEF = null;
													X3D_CS.Size = CollidableShapes[cs].C_Size;
													X3D_CS.Radius = CollidableShapes[cs].C_Radius;
													X3D_CS.Height = CollidableShapes[cs].C_Height;
													X3D_CS.Translation = CollidableShapes[cs].CS_Translation;
													X3D_CS.Rotation = CollidableShapes[cs].CS_Rotation;
													
												}
											}
										}	
									}
								}
							}
						}
					}
				}
			}
			
			
				
			
			
			/*
				Get the Rigidbody + RigidBodyCollection attributes from the x3d scene
			*/
			var Rigid_b = document.getElementsByTagName("RigidBodyCollection");	
			for (rb=0; rb < Rigid_b.length; rb++) {
			
				X3D_CS.RBC_set_contacts = Rigid_b[rb].getAttribute("set_contacts");
				X3D_CS.RBC_autoDisable = Rigid_b[rb].getAttribute("autoDisable");
				X3D_CS.RBC_bodies = Rigid_b[rb].getAttribute("bodies");
				X3D_CS.RBC_constantForceMix = parseFloat(Rigid_b[rb].getAttribute("constantForceMix"));
				X3D_CS.RBC_contactSurfaceThickness = parseFloat(Rigid_b[rb].getAttribute("contactSurfaceThickness"));
				X3D_CS.RBC_disableAngularSpeed = parseFloat(Rigid_b[rb].getAttribute("disableAngularSpeed"));
				X3D_CS.RBC_disableLinearSpeed = parseFloat(Rigid_b[rb].getAttribute("disableLinearSpeed"));
				X3D_CS.RBC_disableTime = parseFloat(Rigid_b[rb].getAttribute("disableTime"));
				X3D_CS.RBC_enabled = Rigid_b[rb].getAttribute("enabled");
				X3D_CS.RBC_errorCorrection = parseFloat(Rigid_b[rb].getAttribute("errorCorrection"));
				
				if(Rigid_b[rb].hasAttribute("gravity")){
					var tempArray = Rigid_b[rb].getAttribute("gravity").split(" ");
					X3D_CS.RBC_gravity = new Vector3d;
					X3D_CS.RBC_gravity.x = tempArray[0];
					X3D_CS.RBC_gravity.y = tempArray[1];
					X3D_CS.RBC_gravity.z = tempArray[2];
				}
				
				X3D_CS.RBC_iterations = parseFloat(Rigid_b[rb].getAttribute("iterations"));
				X3D_CS.RBC_joints = Rigid_b[rb].getAttribute("joints");
				X3D_CS.RBC_maxCorrectionSpeed = parseFloat(Rigid_b[rb].getAttribute("maxCorrectionSpeed"));
				X3D_CS.RBC_metadata = Rigid_b[rb].getAttribute("metadata");
				X3D_CS.RBC_preferAccuracy = Rigid_b[rb].getAttribute("preferAccuracy");
				X3D_CS.RBC_collider = Rigid_b[rb].getAttribute("collider");

				
				var RigBD_elem = Rigid_b[rb].childNodes;
				for (rbe=0; rbe < RigBD_elem.length; rbe++) {
					if(RigBD_elem[rbe].nodeName == "RigidBody" || RigBD_elem[rbe].nodeName == "RIGIDBODY"){
						var RigBD_CollShape = RigBD_elem[rbe].childNodes;
						for (rbcs=0; rbcs < RigBD_CollShape.length; rbcs++) {
							if(RigBD_CollShape[rbcs].nodeName == "CollidableShape" || RigBD_CollShape[rbcs].nodeName == "COLLIDABLESHAPE"){
								for (rcs=0; rcs < CollidableShapes.length; rcs++) {
									if(RigBD_CollShape[rbcs].getAttribute("USE") == CollidableShapes[rcs].CS_DEF){
									
										if(RigBD_elem[rbe].hasAttribute("DEF")){
											X3D_CS.RB_DEF = RigBD_elem[rbe].getAttribute("DEF");
										}
										
										if(RigBD_elem[rbe].hasAttribute("angularDampingFactor")){
											X3D_CS.RB_angularDampingFactor = parseFloat(RigBD_elem[rbe].getAttribute("angularDampingFactor"));
										}
										
										if(RigBD_elem[rbe].hasAttribute("angularVelocity")){
											var tempArray = RigBD_elem[rbe].getAttribute("angularVelocity").split(" ");
											X3D_CS.RB_angularVelocity = new Vector3d;
											X3D_CS.RB_angularVelocity.x = tempArray[0];
											X3D_CS.RB_angularVelocity.y = tempArray[1];
											X3D_CS.RB_angularVelocity.z = tempArray[2];
										}
										
										if(RigBD_elem[rbe].hasAttribute("autoDamp")){
											X3D_CS.RB_autoDamp = RigBD_elem[rbe].getAttribute("autoDamp");
										}
										
										if(RigBD_elem[rbe].hasAttribute("autoDisable")){
											X3D_CS.RB_autoDisable = RigBD_elem[rbe].getAttribute("autoDisable");
										}
										if(RigBD_elem[rbe].hasAttribute("centerOfMass")){
											var tempArray = RigBD_elem[rbe].getAttribute("centerOfMass").split(" ");
											X3D_CS.RB_centerOfMass = new Vector3d;
											X3D_CS.RB_centerOfMass.x = tempArray[0];
											X3D_CS.RB_centerOfMass.y = tempArray[1];
											X3D_CS.RB_centerOfMass.z = tempArray[2];
										}
										
										if(RigBD_elem[rbe].hasAttribute("disableAngularSpeed")){
											X3D_CS.RB_disableAngularSpeed = RigBD_elem[rbe].getAttribute("disableAngularSpeed");
										}
										
										if(RigBD_elem[rbe].hasAttribute("disableLinearSpeed")){
											X3D_CS.RB_disableLinearSpeed = RigBD_elem[rbe].getAttribute("disableLinearSpeed");
										}
										
										if(RigBD_elem[rbe].hasAttribute("disableTime")){
											X3D_CS.RB_disableTime = RigBD_elem[rbe].getAttribute("disableTime");
										}
										
										if(RigBD_elem[rbe].getAttribute("enabled")){
											X3D_CS.RB_enabled = RigBD_elem[rbe].getAttribute("enabled");
										}
										
										if(RigBD_elem[rbe].hasAttribute("finiteRotationAxis")){
											var tempArray = RigBD_elem[rbe].getAttribute("finiteRotationAxis").split(" ");
											X3D_CS.RB_finiteRotationAxis = new Vector3d;
											X3D_CS.RB_finiteRotationAxis.x = tempArray[0];
											X3D_CS.RB_finiteRotationAxis.y = tempArray[1];
											X3D_CS.RB_finiteRotationAxis.z = tempArray[2];
										}
										
										if(RigBD_elem[rbe].hasAttribute("fixed")){
											X3D_CS.RB_fixed = RigBD_elem[rbe].getAttribute("fixed");
										}
										
										if(RigBD_elem[rbe].hasAttribute("forces")){
											X3D_CS.RB_forces = RigBD_elem[rbe].getAttribute("forces");
										}
										
										if(RigBD_elem[rbe].hasAttribute("geometry")){
											X3D_CS.RB_geometry = RigBD_elem[rbe].getAttribute("geometry");
										}
										
										if(RigBD_elem[rbe].hasAttribute("inertia")){
											var tempArray = RigBD_elem[rbe].getAttribute("inertia").split(" ");
											X3D_CS.RB_inertia = new Vector3x3d;
											X3D_CS.RB_inertia.xx = tempArray[0];
											X3D_CS.RB_inertia.xy = tempArray[1];
											X3D_CS.RB_inertia.xz = tempArray[2];
											X3D_CS.RB_inertia.yx = tempArray[3];
											X3D_CS.RB_inertia.yy = tempArray[4];
											X3D_CS.RB_inertia.yz = tempArray[5];
											X3D_CS.RB_inertia.zx = tempArray[6];
											X3D_CS.RB_inertia.zy = tempArray[7];
											X3D_CS.RB_inertia.zz = tempArray[8];
										}
										
										if(RigBD_elem[rbe].hasAttribute("linearDampingFactor")){
											X3D_CS.RB_linearDampingFactor = parseFloat(RigBD_elem[rbe].getAttribute("linearDampingFactor"));
										}
										
										if(RigBD_elem[rbe].hasAttribute("linearVelocity")){
											var tempArray = RigBD_elem[rbe].getAttribute("linearVelocity").split(" ");
											X3D_CS.RB_linearVelocity = new Vector3d;
											X3D_CS.RB_linearVelocity.x = tempArray[0];
											X3D_CS.RB_linearVelocity.y = tempArray[1];
											X3D_CS.RB_linearVelocity.z = tempArray[2];
										}
										
										if(RigBD_elem[rbe].hasAttribute("mass")){
											X3D_CS.RB_mass = parseFloat(RigBD_elem[rbe].getAttribute("mass"));
										}
										
										if(RigBD_elem[rbe].hasAttribute("massDensityModel")){
											X3D_CS.RB_massDensityModel = parseFloat(RigBD_elem[rbe].getAttribute("massDensityModel"));
										}
										
										if(RigBD_elem[rbe].hasAttribute("metadata")){
											X3D_CS.RB_metadata = parseFloat(RigBD_elem[rbe].getAttribute("metadata"));
										}
										
										if(RigBD_elem[rbe].hasAttribute("orientation")){
											var tempArray = RigBD_elem[rbe].getAttribute("orientation").split(" ");
											X3D_CS.RB_orientation = new Vector4d;
											X3D_CS.RB_orientation.x = tempArray[0];
											X3D_CS.RB_orientation.y = tempArray[1];
											X3D_CS.RB_orientation.z = tempArray[2];
											X3D_CS.RB_orientation.w = tempArray[3];
										}
										
										if(RigBD_elem[rbe].hasAttribute("position")){
											var tempArray = RigBD_elem[rbe].getAttribute("position").split(" ");
											X3D_CS.RB_position = new Vector3d;
											X3D_CS.RB_position.x = tempArray[0];
											X3D_CS.RB_position.y = tempArray[1];
											X3D_CS.RB_position.z = tempArray[2];
										}
										
										if(RigBD_elem[rbe].hasAttribute("torques")){
											X3D_CS.RB_torques = RigBD_elem[rbe].getAttribute("torques");
										}
										
										if(RigBD_elem[rbe].hasAttribute("useFiniteRotation")){
											X3D_CS.RB_useFiniteRotation = RigBD_elem[rbe].getAttribute("useFiniteRotation");
										}
										
										if(RigBD_elem[rbe].hasAttribute("useGlobalGravity")){
											X3D_CS.RB_useGlobalGravity = RigBD_elem[rbe].getAttribute("useGlobalGravity");
										}
										
									}
								}
							}	
						}
					}
				}

			
			}
			
			X3D_CS.createRigid = true;
			
		}		

		
		
		if(Rigid_b != null){
			for (rb=0; rb < Rigid_b.length; rb++) {
				
				var RigBD_elem = Rigid_b[rb].childNodes;
				
				for(rbe=0; rbe < RigBD_elem.length; rbe++){
					
					switch(RigBD_elem[rbe].nodeName){
						
						case "BALLJOINT":
						case "BallJoint":{
							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new BallJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}
							
							if(RigBD_elem[rbe].hasAttribute("anchorPoint")){
								var tempArray = RigBD_elem[rbe].getAttribute("anchorPoint").split(" ");
								X3D_J.X3D_JointType.anchorPoint = new Vector3d;
								X3D_J.X3D_JointType.anchorPoint.x = tempArray[0];
								X3D_J.X3D_JointType.anchorPoint.y = tempArray[1];
								X3D_J.X3D_JointType.anchorPoint.z = tempArray[2];
							}	
							
							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){	
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}								
										}
									}
									else{
										if(X3D_J.X3D_JointType.body2_USE == null){
											X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}
												
										}
									}
								}	
							}
							JointShapes.push( X3D_J );
						}
						break;
							
						case "MOTORJOINT":
						case "MotorJoint":{
						
							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new MotorJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;	
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}
								
							if(RigBD_elem[rbe].hasAttribute("motor1Axis")){
								var tempArray = RigBD_elem[rbe].getAttribute("motor1Axis").split(" ");
								X3D_J.X3D_JointType.motor1Axis = new Vector3d;
								X3D_J.X3D_JointType.motor1Axis.x = tempArray[0];
								X3D_J.X3D_JointType.motor1Axis.y = tempArray[1];
								X3D_J.X3D_JointType.motor1Axis.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("motor2Axis")){
								var tempArray = RigBD_elem[rbe].getAttribute("motor2Axis").split(" ");
								X3D_J.X3D_JointType.motor2Axis = new Vector3d;
								X3D_J.X3D_JointType.motor2Axis.x = tempArray[0];
								X3D_J.X3D_JointType.motor2Axis.y = tempArray[1];
								X3D_J.X3D_JointType.motor2Axis.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("motor3Axis")){
								var tempArray = RigBD_elem[rbe].getAttribute("motor3Axis").split(" ");
								X3D_J.X3D_JointType.motor3Axis = new Vector3d;
								X3D_J.X3D_JointType.motor3Axis.x = tempArray[0];
								X3D_J.X3D_JointType.motor3Axis.y = tempArray[1];
								X3D_J.X3D_JointType.motor3Axis.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("axis1Angle")){
								X3D_J.X3D_JointType.axis1Angle = parseFloat(RigBD_elem[rbe].getAttribute("axis1Angle")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("axis2Angle")){
								X3D_J.X3D_JointType.axis2Angle = parseFloat(RigBD_elem[rbe].getAttribute("axis2Angle")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("axis3Angle")){
								X3D_J.X3D_JointType.axis3Angle = parseFloat(RigBD_elem[rbe].getAttribute("axis3Angle")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("axis1Torque")){
								X3D_J.X3D_JointType.axis1Torque = parseFloat(RigBD_elem[rbe].getAttribute("axis1Torque"));
							}
							if(RigBD_elem[rbe].hasAttribute("axis2Torque")){
								X3D_J.X3D_JointType.axis2Torque = parseFloat(RigBD_elem[rbe].getAttribute("axis2Torque"));
							}
							if(RigBD_elem[rbe].hasAttribute("axis3Torque")){
								X3D_J.X3D_JointType.axis3Torque = parseFloat(RigBD_elem[rbe].getAttribute("axis3Torque"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop1Bounce")){
								X3D_J.X3D_JointType.stop1Bounce = parseFloat(RigBD_elem[rbe].getAttribute("stop1Bounce"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop1ErrorCorrection")){
								X3D_J.X3D_JointType.stop1ErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stop1ErrorCorrection"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop2Bounce")){
								X3D_J.X3D_JointType.stop2Bounce = parseFloat(RigBD_elem[rbe].getAttribute("stop2Bounce"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop2ErrorCorrection")){
								X3D_J.X3D_JointType.stop2ErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stop2ErrorCorrection"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop3Bounce")){
								X3D_J.X3D_JointType.stop3Bounce = parseFloat(RigBD_elem[rbe].getAttribute("stop3Bounce"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop3ErrorCorrection")){
								X3D_J.X3D_JointType.stop3ErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stop3ErrorCorrection"));
							}
								
								
							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else if(X3D_J.X3D_JointType.body2_USE == null){
										X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else{
										if(X3D_J.X3D_JointType.body3_USE == null){
											X3D_J.X3D_JointType.body3_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body3_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body3_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body3_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}
												
										}
									}
								}
									
							}
							JointShapes.push( X3D_J );
						}
						break;
							
						case "SLIDERJOINT":
						case "SliderJoint":{

							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new SliderJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}

							if(RigBD_elem[rbe].hasAttribute("axis")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis").split(" ");
								X3D_J.X3D_JointType.axis = new Vector3d;
								X3D_J.X3D_JointType.axis.x = tempArray[0];
								X3D_J.X3D_JointType.axis.y = tempArray[1];
								X3D_J.X3D_JointType.axis.z = tempArray[2];
							}
							
							if(RigBD_elem[rbe].hasAttribute("maxSeparation")){
								X3D_J.X3D_JointType.maxSeparation = parseFloat(RigBD_elem[rbe].getAttribute("maxSeparation"));
							}
							if(RigBD_elem[rbe].hasAttribute("minSeparation")){
								X3D_J.X3D_JointType.minSeparation = parseFloat(RigBD_elem[rbe].getAttribute("minSeparation"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopBounce")){
								X3D_J.X3D_JointType.stopBounce = parseFloat(RigBD_elem[rbe].getAttribute("stopBounce"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopErrorCorrection")){
								X3D_J.X3D_JointType.stopErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stopErrorCorrection"));
							}
							
							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){
										
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
										for (ii=0; ii < CollidableShapes.length; ii++) {	
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else{
										if(X3D_J.X3D_JointType.body2_USE == null){
											X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}
											
										}
									}
								}
									
							}
							JointShapes.push( X3D_J );
						}
						break;
							
						case "UNIVERSALJOINT":
						case "UniversalJoint":{
						
							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new UniversalJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}
							
							if(RigBD_elem[rbe].hasAttribute("axis1")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis1").split(" ");
								X3D_J.X3D_JointType.axis1 = new Vector3d;
								X3D_J.X3D_JointType.axis1.x = tempArray[0];
								X3D_J.X3D_JointType.axis1.y = tempArray[1];
								X3D_J.X3D_JointType.axis1.z = tempArray[2];
							}
							
							if(RigBD_elem[rbe].hasAttribute("axis2")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis2").split(" ");
								X3D_J.X3D_JointType.axis2 = new Vector3d;
								X3D_J.X3D_JointType.axis2.x = tempArray[0];
								X3D_J.X3D_JointType.axis2.y = tempArray[1];
								X3D_J.X3D_JointType.axis2.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("anchorPoint")){
								var tempArray = RigBD_elem[rbe].getAttribute("anchorPoint").split(" ");
								X3D_J.X3D_JointType.anchorPoint = new Vector3d;
								X3D_J.X3D_JointType.anchorPoint.x = tempArray[0];
								X3D_J.X3D_JointType.anchorPoint.y = tempArray[1];
								X3D_J.X3D_JointType.anchorPoint.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("stopBounce1")){
								X3D_J.X3D_JointType.stopBounce1 = parseFloat(RigBD_elem[rbe].getAttribute("stopBounce1"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop1ErrorCorrection")){
								X3D_J.X3D_JointType.stop1ErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stop1ErrorCorrection"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopBounce2")){
								X3D_J.X3D_JointType.stopBounce2 = parseFloat(RigBD_elem[rbe].getAttribute("stopBounce2"));
							}
							if(RigBD_elem[rbe].hasAttribute("stop2ErrorCorrection")){
								X3D_J.X3D_JointType.stop2ErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stop2ErrorCorrection"));
							}
							

							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){				
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
											
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else{
										if(X3D_J.X3D_JointType.body2_USE == null){
											X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}
												
										}
									}
								}
									
							}
					
							JointShapes.push( X3D_J );
						}
						break;
						
						case "SINGLEAXISHINGEJOINT":
						case "SingleAxisHingeJoint":{
						
							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new SingleAxisHingeJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}
							
							if(RigBD_elem[rbe].hasAttribute("axis")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis").split(" ");
								X3D_J.X3D_JointType.axis = new Vector3d;
								X3D_J.X3D_JointType.axis.x = tempArray[0];
								X3D_J.X3D_JointType.axis.y = tempArray[1];
								X3D_J.X3D_JointType.axis.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("anchorPoint")){
								var tempArray = RigBD_elem[rbe].getAttribute("anchorPoint").split(" ");
								X3D_J.X3D_JointType.anchorPoint = new Vector3d;
								X3D_J.X3D_JointType.anchorPoint.x = tempArray[0];
								X3D_J.X3D_JointType.anchorPoint.y = tempArray[1];
								X3D_J.X3D_JointType.anchorPoint.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("maxAngle")){
								X3D_J.X3D_JointType.maxAngle = parseFloat(RigBD_elem[rbe].getAttribute("maxAngle")) * 0.0174532925; //radians
							}
							if(RigBD_elem[rbe].hasAttribute("minAngle")){
								X3D_J.X3D_JointType.minAngle = parseFloat(RigBD_elem[rbe].getAttribute("minAngle")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("stopBounce")){
								X3D_J.X3D_JointType.stopBounce = parseFloat(RigBD_elem[rbe].getAttribute("stopBounce"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopErrorCorrection")){
								X3D_J.X3D_JointType.stopErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("stopErrorCorrection"));
							}
								
							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){
										
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
											
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else{
										if(X3D_J.X3D_JointType.body2_USE == null){
											X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}	
										}
									}
								}		
							}
					
							JointShapes.push( X3D_J );
							
						}
						break;
						case "DOUBLEAXISHINGEJOINT":
						case "DoubleAxisHingeJoint":{
						
							var X3D_J = new X3DJoint;
							X3D_J.createJoint = true;
							X3D_J.X3D_JointType = new DoubleAxisHingeJoint;
							X3D_J.JointTypeName = RigBD_elem[rbe].nodeName;
							
							if(RigBD_elem[rbe].hasAttribute("debugMode")){
								X3D_J.X3D_JointType.debugMode = RigBD_elem[rbe].getAttribute("debugMode");
							}
								
							if(RigBD_elem[rbe].hasAttribute("axis1")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis1").split(" ");
								X3D_J.X3D_JointType.axis1 = new Vector3d;
								X3D_J.X3D_JointType.axis1.x = tempArray[0];
								X3D_J.X3D_JointType.axis1.y = tempArray[1];
								X3D_J.X3D_JointType.axis1.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("axis2")){
								var tempArray = RigBD_elem[rbe].getAttribute("axis2").split(" ");
								X3D_J.X3D_JointType.axis2 = new Vector3d;
								X3D_J.X3D_JointType.axis2.x = tempArray[0];
								X3D_J.X3D_JointType.axis2.y = tempArray[1];
								X3D_J.X3D_JointType.axis2.z = tempArray[2];
							}
								
							if(RigBD_elem[rbe].hasAttribute("anchorPoint")){
								var tempArray = RigBD_elem[rbe].getAttribute("anchorPoint").split(" ");
								X3D_J.X3D_JointType.anchorPoint = new Vector3d;
								X3D_J.X3D_JointType.anchorPoint.x = tempArray[0];
								X3D_J.X3D_JointType.anchorPoint.y = tempArray[1];
								X3D_J.X3D_JointType.anchorPoint.z = tempArray[2];
							}
			
							if(RigBD_elem[rbe].hasAttribute("desiredAngularVelocity1")){
								X3D_J.X3D_JointType.desiredAngularVelocity1 = parseFloat(RigBD_elem[rbe].getAttribute("desiredAngularVelocity1"));
							}
							if(RigBD_elem[rbe].hasAttribute("desiredAngularVelocity2")){
								X3D_J.X3D_JointType.desiredAngularVelocity2 = parseFloat(RigBD_elem[rbe].getAttribute("desiredAngularVelocity2"));
							}
							if(RigBD_elem[rbe].hasAttribute("maxAngle1")){
								X3D_J.X3D_JointType.maxAngle1 = parseFloat(RigBD_elem[rbe].getAttribute("maxAngle1")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("minAngle1")){
								X3D_J.X3D_JointType.minAngle1 = parseFloat(RigBD_elem[rbe].getAttribute("minAngle1")) * 0.0174532925;
							}
							if(RigBD_elem[rbe].hasAttribute("maxTorque1")){
								X3D_J.X3D_JointType.maxTorque1 = parseFloat(RigBD_elem[rbe].getAttribute("maxTorque1"));
							}
							if(RigBD_elem[rbe].hasAttribute("maxTorque2")){
								X3D_J.X3D_JointType.maxTorque2 = parseFloat(RigBD_elem[rbe].getAttribute("maxTorque2"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopBounce1")){
								X3D_J.X3D_JointType.stopBounce1 = parseFloat(RigBD_elem[rbe].getAttribute("stopBounce1"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopConstantForceMix1")){
								X3D_J.X3D_JointType.stopConstantForceMix1 = parseFloat(RigBD_elem[rbe].getAttribute("stopConstantForceMix1"));
							}
							if(RigBD_elem[rbe].hasAttribute("stopErrorCorrection1")){
								X3D_J.X3D_JointType.stopErrorCorrection1 = parseFloat(RigBD_elem[rbe].getAttribute("stopErrorCorrection1"));
							}
							if(RigBD_elem[rbe].hasAttribute("suspensionErrorCorrection")){
								X3D_J.X3D_JointType.suspensionErrorCorrection = parseFloat(RigBD_elem[rbe].getAttribute("suspensionErrorCorrection"));
							}
							if(RigBD_elem[rbe].hasAttribute("suspensionForce")){
								X3D_J.X3D_JointType.suspensionForce = parseFloat(RigBD_elem[rbe].getAttribute("suspensionForce"));
							}
								
							var RigBD_Joints = RigBD_elem[rbe].childNodes;
							for (rbj=0; rbj < RigBD_Joints.length; rbj++) {
								if(RigBD_Joints[rbj].nodeName == "RigidBody" || RigBD_Joints[rbj].nodeName == "RIGIDBODY"){
											
									if(X3D_J.X3D_JointType.body1_USE == null){
										X3D_J.X3D_JointType.body1_USE = RigBD_Joints[rbj].getAttribute("USE");
											
										for (ii=0; ii < CollidableShapes.length; ii++) {
											if(X3D_J.X3D_JointType.body1_USE == CollidableShapes[ii].RB_DEF){
												if(X3D_J.X3D_JointType.CollidableShape_body1_USE == null){
													X3D_J.X3D_JointType.CollidableShape_body1_USE = CollidableShapes[ii].CS_DEF;
												}
											}
										}
									}
									else{
										if(X3D_J.X3D_JointType.body2_USE == null){
											X3D_J.X3D_JointType.body2_USE = RigBD_Joints[rbj].getAttribute("USE");
											for (ii=0; ii < CollidableShapes.length; ii++) {
												if(X3D_J.X3D_JointType.body2_USE == CollidableShapes[ii].RB_DEF){
													if(X3D_J.X3D_JointType.CollidableShape_body2_USE == null){
														X3D_J.X3D_JointType.CollidableShape_body2_USE = CollidableShapes[ii].CS_DEF;
													}
												}
											}	
										}
									}
								}	
							}
					
							JointShapes.push( X3D_J );
						}
					}	
				}
				
			}
		}
		
		
		

		
		/*
		
			INITIALIZE BULLET (Ammo.js) WORLD
			Get the X3D Scene and set :
				1.	btCollisionConfiguration allows to configure Bullet collision detection stack allocator size, 
					default collision algorithms and persistent manifold pool size.
				2.	btCollisionDispatcher supports algorithms that handle ConvexConvex and ConvexConcave collision pairs. 
				3.	The btDbvtBroadphase implements a broadphase using two dynamic AABB bounding volume hierarchies/trees. 
					One tree is used for static/non-moving objects, and another tree is used for dynamic objects. 
					Objects can move from one tree to the other. This is a very fast broadphase, 
					especially for very dynamic worlds where many objects are moving.
				4.	The btSequentialImpulseConstraintSolver is a fast SIMD implementation of the Projected Gauss Seidel (iterative LCP) method. 
				5.	The world gravity
		
		*/
		
		initScene = function() {
		
			var collisionConfiguration, dispatcher, overlappingPairCache, solver, WorldGravity = new Vector3d; // ammo functions
			
			WorldGravity.x = 0;
			WorldGravity.y = -9.81; //m/s^2
			WorldGravity.z = 0;
			
			scene =  document.getElementsByTagName("Scene");

			collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
			overlappingPairCache = new Ammo.btDbvtBroadphase();
			solver = new Ammo.btSequentialImpulseConstraintSolver();
			scene = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
			scene.setGravity(new Ammo.btVector3(WorldGravity.x, WorldGravity.y, WorldGravity.z));
			
		};
		
		
		
		
		/*
		
			CREATE RIGIDBODIES
			Notes
			1.	If the object's mass is set to zero, then the rigidbody is set to static.
		
		*/
		
		
		CreateRigidbodies = function() {
			
			var mass, startTransform, localInertia, sphereShape, boxShape, cylinderShape, coneShape, indexedfacesetShape, 
				motionState, rbInfo, sphereAmmo, boxAmmo, cylinderAmmo, coneAmmo, indexedfacesetAmmo;
				
			
			building_constraints = true;

			for (i=0; i < CollidableShapes.length; i++) {
				if(CollidableShapes[i].createRigid == true){
				
					switch (CollidableShapes[i].Name)
					{
						case "SPHERE":
						case "Sphere":		// Create a sphere physics model
						{
						
							var sphere = CollidableShapes[i];
						

							if(CollidableShapes[i].RB_enabled == "false"){ 
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
						
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}
							
							if(CollidableShapes[i].RB_centerOfMass != null){
								var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							}
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z));
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));
							
							
							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
							
							sphereShape = new Ammo.btSphereShape(CollidableShapes[i].C_Radius);
							sphereShape.calculateLocalInertia( mass, localInertia );
							sphereShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
							
							motionState = new Ammo.btDefaultMotionState( startTransform);
							
							rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, sphereShape, localInertia );
							
							sphereAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								sphereAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								sphereAmmo.setDamping(0,0);
							}
							
							sphereAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							sphereAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								sphereAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								sphereAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								sphereAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								sphereAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								sphereAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}

							sphereAmmo.setCenterOfMassTransform(startTransform);
							
							
							if(updateRigidbody != null){
								scene.addRigidBody( sphereAmmo );
								sphereAmmo.mesh = sphere;
								rigidbodies.splice(updateRigidbody,1,sphereAmmo);
							}
							else{
								scene.addRigidBody( sphereAmmo );
								sphereAmmo.mesh = sphere;
								rigidbodies.push( sphereAmmo );
							}
						}
						break;
						
						case "BOX":
						case "Box":		// Create a box physics model
						{
							var box = CollidableShapes[i];

							if(CollidableShapes[i].RB_enabled == "false"){
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
							
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}
							
							if(CollidableShapes[i].RB_centerOfMass != null){
								var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							}
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setBasis(CollidableShapes[i].RB_inertia);
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z ));
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));

							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
							
							boxShape = new Ammo.btBoxShape(new Ammo.btVector3( CollidableShapes[i].C_Size.x/2, CollidableShapes[i].C_Size.y/2, CollidableShapes[i].C_Size.z/2));
							boxShape.calculateLocalInertia( mass, localInertia );
							boxShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
							
							motionState = new Ammo.btDefaultMotionState( startTransform);
							
							rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, boxShape, localInertia );
							
							boxAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								boxAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								boxAmmo.setDamping(0,0);
							}
							
							boxAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							boxAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								boxAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								boxAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								boxAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								boxAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								boxAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}
							
							boxAmmo.setCenterOfMassTransform(startTransform);
							
							if(updateRigidbody != null){
								scene.addRigidBody( boxAmmo );
								boxAmmo.mesh = box;
								rigidbodies.splice(updateRigidbody,1,boxAmmo);
							}
							else{
								scene.addRigidBody( boxAmmo );
								boxAmmo.mesh = box;
								rigidbodies.push( boxAmmo );
							}
						}
						break;
						
						case "CYLINDER":
						case "Cylinder":	// Create a cylinder physics model
						{
							var cylinder = CollidableShapes[i];
							
							if(CollidableShapes[i].RB_enabled == "false"){
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
							
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}

							var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setBasis(CollidableShapes[i].RB_inertia);
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z ));
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));
							
							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
							
							cylinderShape = new Ammo.btCylinderShape(new Ammo.btVector3(CollidableShapes[i].C_Radius, CollidableShapes[i].C_Height/2, CollidableShapes[i].C_Radius));
							cylinderShape.calculateLocalInertia( mass, localInertia );
							cylinderShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
							
							motionState = new Ammo.btDefaultMotionState( startTransform);
							
							rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, cylinderShape, localInertia );
							
							cylinderAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								cylinderAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								cylinderAmmo.setDamping(0,0);
							}
							
							cylinderAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							cylinderAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								cylinderAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								cylinderAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								cylinderAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								cylinderAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								cylinderAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}
							
							cylinderAmmo.setCenterOfMassTransform(startTransform);
							
							if(updateRigidbody != null){
								scene.addRigidBody( cylinderAmmo );
								cylinderAmmo.mesh = cylinder;
								rigidbodies.splice(updateRigidbody,1,cylinderAmmo);
							}
							else{
								scene.addRigidBody( cylinderAmmo );
								cylinderAmmo.mesh = cylinder;
								rigidbodies.push( cylinderAmmo );
							}
						}
						break;
						
						case "CONE":
						case "Cone":	// Create a cone physics model
						{
							var cone = CollidableShapes[i];
							
							if(CollidableShapes[i].RB_enabled == "false"){
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
							
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}
							
							var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setBasis(CollidableShapes[i].RB_inertia);
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z ));
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));
							
							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
							
							coneShape = new Ammo.btConeShape(CollidableShapes[i].C_Radius, CollidableShapes[i].C_Height);
							coneShape.setConeUpIndex(1);
							coneShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
							
							
							coneShape.calculateLocalInertia( mass, localInertia );
							
							motionState = new Ammo.btDefaultMotionState( startTransform);
							
							rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, coneShape, localInertia );
							
							coneAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								coneAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								coneAmmo.setDamping(0,0);
							}
							
							coneAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							coneAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								coneAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								coneAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								coneAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								coneAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								coneAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}
							
							coneAmmo.setCenterOfMassTransform(startTransform);
							
							if(updateRigidbody != null){
								scene.addRigidBody( coneAmmo );
								coneAmmo.mesh = cone;
								rigidbodies.splice(updateRigidbody,1,coneAmmo);
							}
							else{
								scene.addRigidBody( coneAmmo );
								coneAmmo.mesh = cone;
								rigidbodies.push( coneAmmo );
							}
						}
						break;
						
						case "INDEXEDFACESET":
						case "IndexedFaceSet":		// Create a convexHull physics model
						{

							var indexedfaceset = CollidableShapes[i];
						
							if(CollidableShapes[i].RB_enabled == "false"){
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
							
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}
							
							var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setBasis(CollidableShapes[i].RB_inertia);
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z ));	
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));
							
							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
								
							var points = CollidableShapes[i].IndexedFaceSetGeometry.coordIndex;
							
							var numPoints = CollidableShapes[i].IndexedFaceSetGeometry.coordPoint;
							
							if(numPoints.length < 60){
								
								var convexHullShape = new Ammo.btConvexHullShape();
							
								for(jj=0; jj < numPoints.length; jj++){
									convexHullShape.addPoint(new Ammo.btVector3(numPoints[jj][0], numPoints[jj][1], numPoints[jj][2]), true);
								}
								
								var compoundShape = new Ammo.btCompoundShape();
								compoundShape.addChildShape(startTransform, convexHullShape);
								
								compoundShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
								compoundShape.createAabbTreeFromChildren();
								compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,1,0), new Ammo.btVector3(0,0,0)),true);
								compoundShape.calculateLocalInertia( mass, localInertia );
								
								motionState = new Ammo.btDefaultMotionState( startTransform);
								
								rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
							
							}
							else{				
								var x_val = [];
								var y_val = [];
								var z_val = [];
								
								for(jj=0; jj < numPoints.length; jj++){
									if(jj<1){
										x_val[0] = 0;
										x_val[1] = Infinity;
										x_val[2] = 0;
										x_val[3] = -Infinity;
										
										y_val[0] = 0;
										y_val[1] = Infinity;
										y_val[2] = 0;
										y_val[3] = -Infinity;
										
										z_val[0] = 0;
										z_val[1] = Infinity;
										z_val[2] = 0;
										z_val[3] = -Infinity;
									}
									else{
										if(numPoints[jj][0] < x_val[1]){
											x_val[1] = numPoints[jj][0];
											x_val[0] = jj;
										}
										if(numPoints[jj][0] > x_val[3]){
											x_val[3] = numPoints[jj][0];
											x_val[2] = jj;
										}
										if(numPoints[jj][1] < y_val[1]){
											y_val[1] = numPoints[jj][1];
											y_val[0] = jj;
										}
										if(numPoints[jj][1] > y_val[3]){
											y_val[3] = numPoints[jj][1];
											y_val[2] = jj;
										}
										if(numPoints[jj][2] < z_val[1]){
											z_val[1] = numPoints[jj][2];
											z_val[0] = jj;
										}	
										if(numPoints[jj][2] > z_val[3]){
											z_val[3] = numPoints[jj][2];
											z_val[2] = jj;
										}
									}
								}
								
								var convexHullShape = new Ammo.btConvexHullShape();
								
								//DOWN SIDE
								// min X - min Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[1], z_val[1]), true);
								// max X - min Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[1],	z_val[1]), true);										
								// min X - min Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[1], z_val[3]), true);
								// max X - min Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[1], z_val[3]), true);

								//UP SIDE											
								// min X - max Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[3], z_val[1]), true);
								// max X - max Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[3], z_val[1]), true);																					
								// min X - max Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[3], z_val[3]), true);
								// max X - max Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[3], z_val[3]), true);

								//EXTRA POINTS
								//x min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[x_val[0]][0], numPoints[x_val[0]][1], numPoints[x_val[0]][2]), true);
								//y min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[y_val[0]][0], numPoints[y_val[0]][1], numPoints[y_val[0]][2]), true);
								//z min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[z_val[0]][0], numPoints[z_val[0]][1], numPoints[z_val[0]][2]), true);
								//x max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[x_val[2]][0], numPoints[x_val[2]][1], numPoints[x_val[2]][2]), true);
								//y max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[y_val[2]][0], numPoints[y_val[2]][1], numPoints[y_val[2]][2]), true);
								//z max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[z_val[2]][0], numPoints[z_val[2]][1], numPoints[z_val[2]][2]), true);

								
								var compoundShape = new Ammo.btCompoundShape();
								compoundShape.addChildShape( startTransform, convexHullShape);
								compoundShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
								compoundShape.createAabbTreeFromChildren();
								compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,1,0), new Ammo.btVector3(0,0,0)),true);
								compoundShape.calculateLocalInertia( mass, localInertia );
								
								motionState = new Ammo.btDefaultMotionState( startTransform);
								
								rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
							}
							
							indexedfacesetAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								indexedfacesetAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								indexedfacesetAmmo.setDamping(0,0);
							}
							
							indexedfacesetAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							indexedfacesetAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								indexedfacesetAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								indexedfacesetAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								indexedfacesetAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								indexedfacesetAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								indexedfacesetAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}
							
							indexedfacesetAmmo.setCenterOfMassTransform(startTransform);
							
							if(updateRigidbody != null){
								scene.addRigidBody( indexedfacesetAmmo );
								indexedfacesetAmmo.mesh = indexedfaceset;
								rigidbodies.splice(updateRigidbody,1,indexedfacesetAmmo);
							}
							else{
								scene.addRigidBody( indexedfacesetAmmo );
								indexedfacesetAmmo.mesh = indexedfaceset;
								rigidbodies.push( indexedfacesetAmmo );
							}
						}
						break;
						
						case "INDEXEDTRIANGLESET":
						case "IndexedTriangleSet": // Create a convexHull physics model
						{

							var triangleset = CollidableShapes[i];
						
							if(CollidableShapes[i].RB_enabled == "false"){
								mass = 0;
							}
							else{
								mass = CollidableShapes[i].RB_mass;
							}
							
							var FiniteRotation = new Ammo.btQuaternion();
							
							if(CollidableShapes[i].RB_useFiniteRotation == "false"){
								FiniteRotation = new Ammo.btQuaternion(CollidableShapes[i].RB_finiteRotationAxis.x, CollidableShapes[i].RB_finiteRotationAxis.y, CollidableShapes[i].RB_finiteRotationAxis.z, 0);
							}
							else{
								FiniteRotation = new Ammo.btQuaternion(0, 0, 0, 0);
							}
							
							var CenterOfMass = new Ammo.btVector3(CollidableShapes[i].RB_centerOfMass.x, CollidableShapes[i].RB_centerOfMass.y, CollidableShapes[i].RB_centerOfMass.z);
							
							startTransform = new Ammo.btTransform(FiniteRotation, CenterOfMass);
							startTransform.setIdentity();
							startTransform.setBasis(CollidableShapes[i].RB_inertia);
							startTransform.setOrigin(new Ammo.btVector3( CollidableShapes[i].CS_Translation.x, CollidableShapes[i].CS_Translation.y, CollidableShapes[i].CS_Translation.z ));	
							startTransform.setRotation(new Ammo.btQuaternion(CollidableShapes[i].CS_Rotation.x, CollidableShapes[i].CS_Rotation.y, CollidableShapes[i].CS_Rotation.z, CollidableShapes[i].CS_Rotation.w));
							
							localInertia = new Ammo.btVector3(
								CollidableShapes[i].RB_inertia.xx + CollidableShapes[i].RB_inertia.xy + CollidableShapes[i].RB_inertia.xz, 
								CollidableShapes[i].RB_inertia.yx + CollidableShapes[i].RB_inertia.yy + CollidableShapes[i].RB_inertia.yz,
								CollidableShapes[i].RB_inertia.zx + CollidableShapes[i].RB_inertia.zy + CollidableShapes[i].RB_inertia.zz
							);
							
							var numPoints = CollidableShapes[i].IndexedTriangleSetGeometry.coordPoint;
							
							if(numPoints.length < 60){
								
								var convexHullShape = new Ammo.btConvexHullShape();
							
								for(jj=0; jj < numPoints.length; jj++){
									convexHullShape.addPoint(new Ammo.btVector3(numPoints[jj][0], numPoints[jj][1], numPoints[jj][2]), true);
								}
								
								var compoundShape = new Ammo.btCompoundShape();
								compoundShape.addChildShape(startTransform, convexHullShape);
								
								compoundShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
								compoundShape.createAabbTreeFromChildren();
								compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,1,0), new Ammo.btVector3(0,0,0)),true);
								compoundShape.calculateLocalInertia( mass, localInertia );
								
								motionState = new Ammo.btDefaultMotionState( startTransform);
								
								rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
							
							}
							else{				
								var x_val = [];
								var y_val = [];
								var z_val = [];
								
								for(jj=0; jj < numPoints.length; jj++){
									if(jj<1){
										x_val[0] = 0;
										x_val[1] = Infinity;
										x_val[2] = 0;
										x_val[3] = -Infinity;
										
										y_val[0] = 0;
										y_val[1] = Infinity;
										y_val[2] = 0;
										y_val[3] = -Infinity;
										
										z_val[0] = 0;
										z_val[1] = Infinity;
										z_val[2] = 0;
										z_val[3] = -Infinity;
									}
									else{
										if(numPoints[jj][0] < x_val[1]){
											x_val[1] = numPoints[jj][0];
											x_val[0] = jj;
										}
										if(numPoints[jj][0] > x_val[3]){
											x_val[3] = numPoints[jj][0];
											x_val[2] = jj;
										}
										if(numPoints[jj][1] < y_val[1]){
											y_val[1] = numPoints[jj][1];
											y_val[0] = jj;
										}
										if(numPoints[jj][1] > y_val[3]){
											y_val[3] = numPoints[jj][1];
											y_val[2] = jj;
										}
										if(numPoints[jj][2] < z_val[1]){
											z_val[1] = numPoints[jj][2];
											z_val[0] = jj;
										}	
										if(numPoints[jj][2] > z_val[3]){
											z_val[3] = numPoints[jj][2];
											z_val[2] = jj;
										}
									}
								}
								
								var convexHullShape = new Ammo.btConvexHullShape();
								
								//DOWN SIDE
								// min X - min Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[1], z_val[1]), true);
								// max X - min Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[1],	z_val[1]), true);										
								// min X - min Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[1], z_val[3]), true);
								// max X - min Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[1], z_val[3]), true);

								//UP SIDE											
								// min X - max Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[3], z_val[1]), true);
								// max X - max Y - min Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[3], z_val[1]), true);																					
								// min X - max Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[1], y_val[3], z_val[3]), true);
								// max X - max Y - max Z
								convexHullShape.addPoint(new Ammo.btVector3(x_val[3], y_val[3], z_val[3]), true);

								//EXTRA POINTS
								//x min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[x_val[0]][0], numPoints[x_val[0]][1], numPoints[x_val[0]][2]), true);
								//y min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[y_val[0]][0], numPoints[y_val[0]][1], numPoints[y_val[0]][2]), true);
								//z min point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[z_val[0]][0], numPoints[z_val[0]][1], numPoints[z_val[0]][2]), true);
								//x max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[x_val[2]][0], numPoints[x_val[2]][1], numPoints[x_val[2]][2]), true);
								//y max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[y_val[2]][0], numPoints[y_val[2]][1], numPoints[y_val[2]][2]), true);
								//z max point
								convexHullShape.addPoint(new Ammo.btVector3(numPoints[z_val[2]][0], numPoints[z_val[2]][1], numPoints[z_val[2]][2]), true);

								
								var compoundShape = new Ammo.btCompoundShape();
								compoundShape.addChildShape( startTransform, convexHullShape);
								compoundShape.setMargin(CollidableShapes[i].RBC_contactSurfaceThickness);
								compoundShape.createAabbTreeFromChildren();
								compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,1,0), new Ammo.btVector3(0,0,0)),true);
								compoundShape.calculateLocalInertia( mass, localInertia );
								
								motionState = new Ammo.btDefaultMotionState( startTransform);
								
								rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
							}
							
							trianglesetAmmo = new Ammo.btRigidBody( rbInfo );
							
							if(CollidableShapes[i].RB_autoDamp == "true"){
								trianglesetAmmo.setDamping(CollidableShapes[i].RB_linearDampingFactor, CollidableShapes[i].RB_angularDampingFactor); // void btRigidBody::setDamping(btScalar lin_damping, btScalar ang_damping) 	
							}
							else{
								trianglesetAmmo.setDamping(0,0);
							}
							
							trianglesetAmmo.setAngularVelocity(new Ammo.btVector3(CollidableShapes[i].RB_angularVelocity.x, CollidableShapes[i].RB_angularVelocity.y, CollidableShapes[i].RB_angularVelocity.z));
							trianglesetAmmo.setLinearVelocity(new Ammo.btVector3(CollidableShapes[i].RB_linearVelocity.x, CollidableShapes[i].RB_linearVelocity.y, CollidableShapes[i].RB_linearVelocity.z));
							if(CollidableShapes[i].CC_bounce != null){
								trianglesetAmmo.setRestitution(CollidableShapes[i].CC_bounce);
							}
							else{
								trianglesetAmmo.setRestitution(0.0);
							}
							
							if(CollidableShapes[i].CC_frictionCoefficients != null){
								trianglesetAmmo.setFriction(CollidableShapes[i].CC_frictionCoefficients.y);
							}
							else{
								trianglesetAmmo.setFriction(1);
							}
							
							if(CollidableShapes[i].RB_useGlobalGravity == "false"){
								trianglesetAmmo.setGravity(new Ammo.btVector3(CollidableShapes[i].RBC_gravity.x,CollidableShapes[i].RBC_gravity.y,CollidableShapes[i].RBC_gravity.z));
							}
							
							trianglesetAmmo.setCenterOfMassTransform(startTransform);
							
							if(updateRigidbody != null){
								scene.addRigidBody( trianglesetAmmo );
								trianglesetAmmo.mesh = triangleset;
								rigidbodies.splice(updateRigidbody,1,trianglesetAmmo);
							}
							else{
								scene.addRigidBody( trianglesetAmmo );
								trianglesetAmmo.mesh = triangleset;
								rigidbodies.push( trianglesetAmmo );
							}
						}
						break;
						
					}		
				}
			}
			
			CreateJoints();
			MakeUpdateList();

			
		};
		

		
		CreateJoints = function(){
		
			if(updateRigidbody != null){
			
				var constraintNum = scene.getNumConstraints();
				for(cn = constraintNum; cn >= 0; cn--){
				
					var constr = scene.getConstraint(cn);
					scene.removeConstraint(constr);
					
				}
			}
			
			for (var i=0; i < JointShapes.length; i++) {
				
				switch(JointShapes[i].JointTypeName){
					
					case "BALLJOINT":
					case "BallJoint":
					{
							
						for ( j = 0; j < rigidbodies.length; j++ ) {
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
								
								var object1 = rigidbodies[j];
								var anchorPoint = JointShapes[i].X3D_JointType.anchorPoint;
								
							}
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
								
								var object2 = rigidbodies[j];
								
							}

						}
							
						var newBallJoint = new Ammo.btPoint2PointConstraint(	object1, 
																				object2, 
																				new btVector3( anchorPoint.x, anchorPoint.y, anchorPoint.z ), 
																				new btVector3( -anchorPoint.x, -anchorPoint.y, -anchorPoint.z ) );
						
						scene.addConstraint( newBallJoint );
						
						
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
							
							debug_mode = true;
							
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans); 
							
						}
						
					}
					break;
						
					case "SLIDERJOINT":
					case "SliderJoint":
					{

						for ( j = 0; j < rigidbodies.length; j++ ) {
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
							
								var object1 = rigidbodies[j];
								var transform1 = object1.getWorldTransform();
								
								
							}
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
							
								var object2 = rigidbodies[j];
								var transform2 = object2.getWorldTransform();
								
							}

						}
							
						var newSliderJoint = new Ammo.btSliderConstraint(	object1, 
																			object2, 
																			transform1, 
																			transform2, 
																			true );
						

						newSliderJoint.setFrames(transform1, transform2);
						scene.addConstraint( newSliderJoint );
						
						
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
						
							debug_mode = true;
						
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans);
							
						}
						
					}
					break;
						
					case "UNIVERSALJOINT":
					case "UniversalJoint":
					{

						for ( j = 0; j < rigidbodies.length; j++ ) {
							
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
							
								var object1 = rigidbodies[j];
								var axis1 = JointShapes[i].X3D_JointType.axis1;
								var axis2 = JointShapes[i].X3D_JointType.axis2;
								var anchorPoint = JointShapes[i].X3D_JointType.anchorPoint;
								
							}
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
							
								var object2 = rigidbodies[j];
						
							}

						}
							
						var newUniversalJoint = new btUniversalConstraint(	object1, 
																			object2, 
																			new Ammo.btVector3(anchorPoint.x, anchorPoint.y, anchorPoint.z), 
																			new Ammo.btVector3(axis1.x, axis1.y, axis1.z),  
																			new Ammo.btVector3(axis2.x, axis2.y, axis2.z) );
						
						scene.addConstraint( newUniversalJoint );
						
						
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
						
							debug_mode = true;
							
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans); 
							
						}
						
					}	
					break;
						
					case "MOTORJOINT":
					case "MotorJoint":
					{

						for ( j = 0; j < rigidbodies.length; j++ ) {
							
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
							
								var object1 = rigidbodies[j];
								var torque1 = new Vector3d;
								torque1 = JointShapes[i].X3D_JointType.axis1Torque;
								var torque2 = new Vector3d;
								torque2 = JointShapes[i].X3D_JointType.axis2Torque;
								var torque3 = new Vector3d;
								torque3 = JointShapes[i].X3D_JointType.axis3Torque;
								var axis1 = JointShapes[i].X3D_JointType.motor1Axis;
								var axis2 = JointShapes[i].X3D_JointType.motor2Axis;
								rigidbodies[j].mesh.isMotor = true;
								rigidbodies[j].mesh.Motor = new Motors;
								rigidbodies[j].mesh.Motor.torque = new Vector3d;
								rigidbodies[j].mesh.Motor.torque.x = torque2*axis2.x;
								rigidbodies[j].mesh.Motor.torque.y = torque2*axis2.y;
								rigidbodies[j].mesh.Motor.torque.z = torque2*axis2.z;
								
								var axis3 = JointShapes[i].X3D_JointType.motor3Axis;
								var transform1 = object1.getWorldTransform();
								var axis1Angle = JointShapes[i].X3D_JointType.axis1Angle;
								var axis2Angle = JointShapes[i].X3D_JointType.axis2Angle;
								var axis3Angle = JointShapes[i].X3D_JointType.axis3Angle;
								var anchorPoint = new Ammo.btVector3(0.0, 0.0, 0.0);					
								
							}
							
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
							
								var object2 = rigidbodies[j];
								var transform2 = object2.getWorldTransform();
								rigidbodies[j].mesh.isMotor = true;
								rigidbodies[j].mesh.Motor = new Motors;
								rigidbodies[j].mesh.Motor.torque = new Vector3d;
								rigidbodies[j].mesh.Motor.torque.x = torque3*axis3.x;
								rigidbodies[j].mesh.Motor.torque.y = torque3*axis3.y;
								rigidbodies[j].mesh.Motor.torque.z = torque3*axis3.z;

							}

						}
						
						var newGearJoint = new btGeneric6DofConstraint(	object1, 
																		object2, 
																		transform1,
																		transform2,
																		true
																		);
						/*
						newGearJoint.setLimit(1, 0.0, 1.0);
						newGearJoint.setLimit(2, 0.0, 1.0);
						newGearJoint.setLimit(3, 0.0, 1.0);

						For each axis, if
						lower limit = upper limit, The axis is locked
						lower limit < upper limit, The axis is limited between the specified values
						lower limit > upper limit, The axis is free and has no limits 
						*/
						
						
						if(axis3.x != 0){
							
							newGearJoint.getRotationalLimitMotor(0).m_enableMotor = true;
							newGearJoint.getRotationalLimitMotor(0).m_targetVelocity = torque1;
							newGearJoint.getRotationalLimitMotor(0).m_maxMotorForce = 100.0;
							newGearJoint.getRotationalLimitMotor(0).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(0).m_hiLimit = 10.0;
						}
						else{
							newGearJoint.getRotationalLimitMotor(0).m_enableMotor = false;
							newGearJoint.getRotationalLimitMotor(0).m_targetVelocity = 0;
							newGearJoint.getRotationalLimitMotor(0).m_maxMotorForce = 0.0;
							newGearJoint.getRotationalLimitMotor(0).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(0).m_hiLimit = 0.0;
						}
						
						if(axis3.y != 0){
							newGearJoint.getRotationalLimitMotor(1).m_enableMotor = true;
							newGearJoint.getRotationalLimitMotor(1).m_targetVelocity = torque2;
							newGearJoint.getRotationalLimitMotor(1).m_maxMotorForce = 100.0;
							newGearJoint.getRotationalLimitMotor(1).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(1).m_hiLimit = 10.0;
						}
						else{
							newGearJoint.getRotationalLimitMotor(1).m_enableMotor = false;
							newGearJoint.getRotationalLimitMotor(1).m_targetVelocity = 0;
							newGearJoint.getRotationalLimitMotor(1).m_maxMotorForce = 0.0;
							newGearJoint.getRotationalLimitMotor(1).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(1).m_hiLimit = 0.0;
						}
						
						if(axis3.z != 0){
							newGearJoint.getRotationalLimitMotor(2).m_enableMotor = true;
							newGearJoint.getRotationalLimitMotor(2).m_targetVelocity = torque3;
							newGearJoint.getRotationalLimitMotor(2).m_maxMotorForce = 100.0;
							newGearJoint.getRotationalLimitMotor(2).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(2).m_hiLimit = 10.0;
						}
						else{
							newGearJoint.getRotationalLimitMotor(2).m_enableMotor = false;
							newGearJoint.getRotationalLimitMotor(2).m_targetVelocity = 0;
							newGearJoint.getRotationalLimitMotor(2).m_maxMotorForce = 0.0;
							newGearJoint.getRotationalLimitMotor(2).m_loLimit = 0.0;
							newGearJoint.getRotationalLimitMotor(2).m_hiLimit = 0.0;
						}
						
						
						newGearJoint.enableFeedback(true);
						
						scene.addConstraint( newGearJoint, true);
						
						
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
						
							debug_mode = true;
							
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans); 
							
						}
						
					}		
					break;
						
					case "SINGLEAXISHINGEJOINT":
					case "SingleAxisHingeJoint":
					{
							
						for ( j = 0; j < rigidbodies.length; j++ ) {
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
							
									var object1 = rigidbodies[j];
									var axis = JointShapes[i].X3D_JointType.axis;
									var transform1 = object1.getWorldTransform();
									var anchorPoint = JointShapes[i].X3D_JointType.anchorPoint;
									var minAngle = JointShapes[i].X3D_JointType.minAngle;
									var maxAngle = JointShapes[i].X3D_JointType.maxAngle;
									var pivot1 = rigidbodies[j].mesh.RB_centerOfMass;
									var softness = rigidbodies[j].CC_softnessConstantForceMix;
									var biasFactor = 0.3; // bullet default value
									var relaxationFactor = rigidbodies[j].CC_softnessErrorCorrection;
							
							}
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
							
								var object2 = rigidbodies[j];
								var transform2 = object2.getWorldTransform();
								var pivot2 = rigidbodies[j].mesh.RB_centerOfMass;
								
							}

						}

						var newSingleHingeJoint = new btHingeConstraint(object1, 
																		object2, 
																		new Ammo.btVector3(anchorPoint.x, anchorPoint.y, anchorPoint.z), 
																		new Ammo.btVector3(-anchorPoint.x, -anchorPoint.y, -anchorPoint.z), 
																		new Ammo.btVector3(axis.x, axis.y, axis.z), 
																		new Ammo.btVector3(axis.x, axis.y, axis.z), 
																		false );

						newSingleHingeJoint.setLimit(minAngle1, maxAngle1, softness, biasFactor, relaxationFactor);
							
						scene.addConstraint(newSingleHingeJoint);
					
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
								
							debug_mode = true;
								
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans);
							
						}				
					
					}
					break;
						
					case "DOUBLEAXISHINGEJOINT":
					case "DoubleAxisHingeJoint":
					{
						
						for ( j = 0; j < rigidbodies.length; j++ ) {
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body1_USE){
								
								var object1 = rigidbodies[j];
								var axis1 = JointShapes[i].X3D_JointType.axis1;
								var axis2 = JointShapes[i].X3D_JointType.axis2;
								var transform1 = object1.getWorldTransform();
								var anchorPoint = JointShapes[i].X3D_JointType.anchorPoint;
								var minAngle1 = JointShapes[i].X3D_JointType.minAngle1;
								var maxAngle1 = JointShapes[i].X3D_JointType.maxAngle1;
								var softness = rigidbodies[j].CC_softnessConstantForceMix;
								var biasFactor = 0.3; // bullet default value
								var relaxationFactor = rigidbodies[j].CC_softnessErrorCorrection;
							
							}
								
							if(rigidbodies[j].mesh.CS_DEF == JointShapes[i].X3D_JointType.CollidableShape_body2_USE){
								
								var object2 = rigidbodies[j];
								var transform2 = object2.getWorldTransform();
									
							}
						}
							
						var newDoubleHingeJoint = new btHingeConstraint(object1, 
																		object2, 
																		new Ammo.btVector3(anchorPoint.x, anchorPoint.y, anchorPoint.z),  
																		new Ammo.btVector3(-anchorPoint.x, -anchorPoint.y, -anchorPoint.z), 
																		new Ammo.btVector3(axis1.x, axis1.y, axis1.z), 
																		new Ammo.btVector3(axis2.x, axis2.y, axis2.z), 
																		false );	
						
						newDoubleHingeJoint.setLimit(minAngle1, maxAngle1, softness, biasFactor, relaxationFactor);	
						
						scene.addConstraint( newDoubleHingeJoint, true);
						
						
						//DEBUG MODE TRANSFORM CONSTRUCTION
						if(JointShapes[i].X3D_JointType.debugMode == "true"){
						
							debug_mode = true;
						
							var trans = document.createElement('Transform');
							trans.setAttribute('DEF', 'debugNode');
							trans.setAttribute('translation', '0.0 0.0 0.0');
									
							var new_shape = document.createElement('Shape');
									
							var indxLineSet = document.createElement('IndexedLineSet');
							indxLineSet.setAttribute('vertexCount', '1 1');
									
							var coord_point = document.createElement('Coordinate');
							coord_point.setAttribute('point', ''+object1.mesh.CS_Translation.x+' '+object1.mesh.CS_Translation.y+' '+object1.mesh.CS_Translation.z+' '+
																		object2.mesh.CS_Translation.x+' '+object2.mesh.CS_Translation.y+' '+object2.mesh.CS_Translation.z);
									
							var coord_color = document.createElement('Color');
							coord_color.setAttribute('color', '0.0 1.0 0.0 0.0 1.0 0.0');

							trans.appendChild(new_shape); 
							new_shape.appendChild(indxLineSet); 
							indxLineSet.appendChild(coord_point); 
							indxLineSet.appendChild(coord_color); 
							document.getElementsByTagName('Scene')[0].appendChild(trans); 
							
						}
						
					}
					break;

				}
			}
			
		};
		
		

		
		MakeUpdateList = function() {

			for ( i = 0; i < rigidbodies.length; i++ ) {
				if(!drag && rigidbodies[i].mesh.createRigid){
					rigidbodies[i].mesh.createRigid = false;
				}
			}
			for ( i = 0; i < JointShapes.length; i++ ) {
				if(!drag && JointShapes[i].createJoint){
					JointShapes[i].createJoint = false;
				}
			}
			building_constraints = false;
			
		}
		



		CreateInteractiveObjects = function(){
			
			x3d = document.getElementsByTagName("X3D");
			for (x3d_num=0; x3d_num < x3d.length; x3d_num++){
			
				runtime = x3d[x3d_num].runtime;
				x3d[x3d_num].addEventListener('mouseup', MouseControlStop, false);
				x3d[x3d_num].addEventListener('mousedown', MouseControlStart, false);	
				x3d[x3d_num].addEventListener('mousemove', MouseControlMove, false);
				
				//start from the transform node and cross check with collidable shapes
				//if transform is not present create one to enable the interactivity of the object
				for (i = 0; i < rigidbodies.length; i++){
					var transform = document.getElementsByTagName("Transform");
					for (t=0; t < transform.length; t++){
						var trans_index = transform[t].getAttribute("index");
						if(rigidbodies[i].mesh.CS_index == trans_index && rigidbodies[i].mesh.RB_mass != 0){
							transform[t].addEventListener('mousedown', MouseControlStart, false);
							transform[t].addEventListener('mousemove', MouseControlMove, false);
							// Moveable wrapper requires x3dom-full.js, its signature is:
							// x3dom.Moveable(x3domElement, transformNode, callback, snapToGridSize)
							new x3dom.Moveable(x3d[x3d_num], transform[t], null, 0);
						}
					}			
				}	
			}
		}
		
		


		UpdateConstraints = function(){
		
			if (drag && building_constraints == false){
				for (i = 0; i < rigidbodies.length; i++){
					if(rigidbodies[i].mesh.T_DEF == obj.getAttribute('DEF') && rigidbodies[i].mesh.Name != "IndexedFaceSet"){
						updateRigidbody = i;
					}
				}
				CreateRigidbodies();
			}
			else{
				
				clearInterval(intervalVar);
				CreateRigidbodies();
				updateRigidbody = null;
				obj = null;
		
			}
			
		}
		
		
		MouseControlMove = function(event){
		
			currPos = event.hitPnt;
			
		}
		
		
		MouseControlStart = function(event){
		
			if (!drag){
				drag = true;
				startPos = event.hitPnt;
				obj = event.target;
				if(obj.getAttribute('DEF') != null){
					for ( i = 0; i < rigidbodies.length; i++ ){
						if(rigidbodies[i].mesh.T_DEF == obj.getAttribute('DEF')){
							rigidbodies[i].mesh.createRigid = true;
							intervalVar=setInterval(UpdateConstraints,1);
						}
					}
				}
				else{
					drag = false;
					obj = null;
				}
			}
			
		}
		
		
		MouseControlStop = function(event){
		
			if(drag){
				stopPos = event.hitPnt;
				drag = false;
			}
			
		}
		
		

		
		updateRigidbodies = function(){
		
			scene.stepSimulation( 1 / 60, 100);
			
			var i, transform = new Ammo.btTransform(), origin, rotation;
			
			//Update the rigidbodies in scene
			for ( i = 0; i < rigidbodies.length; i++ ){
				
				if(!rigidbodies[i].mesh.createRigid){
					
					rigidbodies[i].getMotionState().getWorldTransform( transform );
					
					//CALCULATE RIGIDBODY POSITION FROM BULLET
					origin = transform.getOrigin();
					rigidbodies[i].mesh.CS_Translation.x = origin.x();
					rigidbodies[i].mesh.CS_Translation.y = origin.y();
					rigidbodies[i].mesh.CS_Translation.z = origin.z();
					
					pos_x = rigidbodies[i].mesh.CS_Translation.x;
					pos_y = rigidbodies[i].mesh.CS_Translation.y;
					pos_z = rigidbodies[i].mesh.CS_Translation.z;
					
				}
				
				else{
					if(currPos != null){
						
						//CALCULATE RIGIDBODY POSITION FROM MOUSE POSITION + SCENE ORIENTATION
						var rb_x = currPos[0];
						var rb_y = currPos[1];
						var rb_z = currPos[2];
						
						rigidbodies[i].getMotionState().getWorldTransform( transform );
						transform.setOrigin(new Ammo.btVector3(rb_x, rb_y, rb_z));
						
						origin = transform.getOrigin();
						
						rigidbodies[i].mesh.CS_Translation.x = origin.x();
						rigidbodies[i].mesh.CS_Translation.y = origin.y();
						rigidbodies[i].mesh.CS_Translation.z = origin.z();
						
					}
				}
					
					
				//CALCULATE RIGIDBODY ROTATION FROM BULLET
				rotation = transform.getRotation();
				rigidbodies[i].mesh.CS_Rotation.x = rotation.x();
				rigidbodies[i].mesh.CS_Rotation.y = rotation.y();
				rigidbodies[i].mesh.CS_Rotation.z = rotation.z();
				rigidbodies[i].mesh.CS_Rotation.w = rotation.w();
				
				
				//SET RIGIDBODY POSITION + ROTATION
				var Shape = document.getElementsByTagName("Transform");
				for (var sh=0; sh < Shape.length; sh++){
					if(Shape[sh].getAttribute('DEF') == rigidbodies[i].mesh.T_DEF){
						Shape[sh].setAttribute('translation', ''+rigidbodies[i].mesh.CS_Translation.x+' '+rigidbodies[i].mesh.CS_Translation.y+' '+rigidbodies[i].mesh.CS_Translation.z);
						Shape[sh].setAttribute('rotation', ''+rigidbodies[i].mesh.CS_Rotation.x+' '+rigidbodies[i].mesh.CS_Rotation.y+' '+rigidbodies[i].mesh.CS_Rotation.z+' '+rigidbodies[i].mesh.CS_Rotation.w);	
					}
				}

				if(rigidbodies[i].mesh.isMotor == true){
					rigidbodies[i].applyTorque(new Ammo.btVector3(rigidbodies[i].mesh.Motor.torque.x, rigidbodies[i].mesh.Motor.torque.y, rigidbodies[i].mesh.Motor.torque.z));
				}
				
			}
			
			

			//Remove debug Nodes
			if(debug_mode){
				var rem_debugNode = document.getElementsByTagName('Transform');
				for ( dm = 0; dm < rem_debugNode.length; dm++ ) {
					if(rem_debugNode[dm].getAttribute("DEF") == "debugNode"){
						document.getElementsByTagName('Scene')[0].removeChild(rem_debugNode[dm]);
					}
				}
			}

			
		};
		
		
		

		
		main = function main(){
			updateRigidbodies();
			window.requestAnimFrame(main);
		};
		
		
		window.onload = function(){
			initScene();
			requestAnimFrame(main);
			CreateRigidbodies();
			CreateInteractiveObjects();
		}
	
	
	}
})();


window['requestAnimFrame'] = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();
	
