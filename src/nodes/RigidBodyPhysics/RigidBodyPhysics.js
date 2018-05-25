/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// TODO: this file has lots of syntactical issues, fix them!

function X3DCollidableShape(){
    var CollidableShape = new x3dom.fields.SFNode();
    var RigidBody = new x3dom.fields.SFNode();
    var RigidBodyCollection = new x3dom.fields.SFNode();
    var CollisionCollection = new x3dom.fields.SFNode();
    var Transform = new x3dom.fields.SFNode();
    var RB_setup = new x3dom.fields.MFBoolean();
    var T_setup = new x3dom.fields.MFBoolean();
    var CC_setup = new x3dom.fields.MFBoolean();
    var createRigid = new x3dom.fields.MFBoolean();
    var isMotor = new x3dom.fields.MFBoolean();
    var torque = new x3dom.fields.SFVec3f();
    var isInline = new x3dom.fields.MFBoolean();
    var inlineExternalTransform = new x3dom.fields.SFNode();
    var inlineInternalTransform = new x3dom.fields.SFNode();
}

function X3DJoint(){
    var createJoint = new x3dom.fields.MFBoolean();
    var Joint = [];
}

//	###############################################################
//	###############################################################
//	###############################################################

(function(){

    var CollidableShapes = [], JointShapes = [], bulletWorld, x3dWorld = null, initScene, main, updateRigidbodies, MakeUpdateList, X3DRigidBodyComponents, CreateX3DCollidableShape,
        UpdateTransforms, CreateRigidbodies, rigidbodies = [], mousePickObject, mousePos = new x3dom.fields.SFVec3f(), drag = false, interactiveTransforms = [], UpdateRigidbody,
        intervalVar, building_constraints = true, ParseX3DElement, InlineObjectList, inline_x3dList = [], inlineLoad = false, completeJointSetup = false;

    function ParseX3DElement(){

        for(var cv in x3dom.canvases){
            for(var sc in x3dom.canvases[cv].x3dElem.children){
                if(x3dom.isa(x3dom.canvases[cv].x3dElem.children[sc]._x3domNode, x3dom.nodeTypes.Scene)){
                    x3dWorld = x3dom.canvases[cv].x3dElem.children[sc];
                }
            }
        }

        if (x3dWorld) {
            for (var i in x3dWorld.children) {
                if (x3dom.isa(x3dWorld.children[i]._x3domNode, x3dom.nodeTypes.Transform)) {
                    if (x3dom.isa(x3dWorld.children[i]._x3domNode._cf.children.nodes[0]._xmlNode._x3domNode, x3dom.nodeTypes.Inline)) {
                        if (inline_x3dList.length == 0) {
                            inline_x3dList.push(x3dWorld.children[i]);
                        }
                        else {
                            for (var n in inline_x3dList) {
                                if (inline_x3dList[n]._x3domNode._DEF.toString() == x3dWorld.children[i]._x3domNode._DEF.toString()) {
                                    break;
                                }
                                else {
                                    if (n == inline_x3dList.length - 1) {
                                        inline_x3dList.push(x3dWorld.children[i]);
                                    }
                                }

                            }
                        }
                    }
                }
                if (x3dom.isa(x3dWorld.children[i]._x3domNode, x3dom.nodeTypes.Group)) {
                    for (var all in x3dWorld.children[i].childNodes) {
                        CreateX3DCollidableShape(x3dWorld.children[i].childNodes[all], null);
                    }
                }
                else {
                    CreateX3DCollidableShape(x3dWorld.children[i], null);
                }
            }
        }
    }

    function CreateX3DCollidableShape(a, b){

        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.CollidableShape)){
            var X3D_CS = new X3DCollidableShape;
            CollidableShapes.push(X3D_CS);
            X3D_CS.CollidableShape = a;
            X3D_CS.createRigid = true;
            X3D_CS.RB_setup = false;
            X3D_CS.T_setup = false;
            X3D_CS.CC_setup = false;
            X3D_CS.isMotor = false;
            X3D_CS.torque = new x3dom.fields.SFVec3f(0,0,0);
            X3D_CS.isInline = false;
            X3D_CS.inlineExternalTransform = null;
            X3D_CS.Transform = a._x3domNode._cf.transform;
            if(b){
                X3D_CS.isInline = true;
                X3D_CS.inlineExternalTransform = b;
            }
        }
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.RigidBodyCollection)){
            for(var ea in a._x3domNode._cf.joints.nodes){
                if(x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.BallJoint) || x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.UniversalJoint)
                    || x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.SliderJoint) || x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.MotorJoint)
                    || x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.SingleAxisHingeJoint) || x3dom.isa(a._x3domNode._cf.joints.nodes[ea], x3dom.nodeTypes.DoubleAxisHingeJoint)){
                    var X3D_J = new X3DJoint;
                    X3D_J.createJoint = true;
                    X3D_J.Joint = a._x3domNode._cf.joints.nodes[ea];
                    JointShapes.push(X3D_J);
                }
            }
            completeJointSetup = true;
        }
        if(inlineLoad){
            X3DRigidBodyComponents(a);
        }
        if(a.parentNode){
            for (var ea in a.parentNode.children){
                if(a.parentNode && a.parentNode.children.hasOwnProperty(ea) && a.parentNode.children[ea]){
                    if(x3dom.isa(a.parentNode.children[ea]._x3domNode, x3dom.nodeTypes.Group)){
                        for(var all in a.parentNode.children[ea].childNodes){
                            if(a.parentNode.children[ea].childNodes.hasOwnProperty(all) && a.parentNode.children[ea].childNodes[all]){
                                X3DRigidBodyComponents(a.parentNode.children[ea].childNodes[all]);
                            }
                        }
                    }
                    else{
                        X3DRigidBodyComponents(a.parentNode.children[ea]);
                    }
                }
            }
        }
    }

    function X3DRigidBodyComponents(a){
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.CollisionSensor)){
            for(var ea in a._x3domNode._cf.collider._x3domNode._cf.collidables.nodes){
                for(var cs in CollidableShapes){
                    if(!CollidableShapes[cs].CC_setup && CollidableShapes[cs].CollidableShape._x3domNode._DEF == a._x3domNode._cf.collider._x3domNode._cf.collidables.nodes[ea]._DEF){
                        CollidableShapes[cs].CC_setup = true;
                        CollidableShapes[cs].CollisionCollection = a._x3domNode._cf.collider;
                    }
                }
            }
        }
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.CollisionCollection)){
            for(var ea in a._x3domNode._cf.collidables.nodes){
                for(var cs in CollidableShapes){
                    if(!CollidableShapes[cs].CC_setup && CollidableShapes[cs].CollidableShape._x3domNode._DEF == a._x3domNode._cf.collidables.nodes[ea]._DEF){
                        CollidableShapes[cs].CC_setup = true;
                        CollidableShapes[cs].CollisionCollection = a._x3domNode._cf.collider;
                    }
                }
            }
        }
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.Transform)){
            for(var cs in CollidableShapes){
                if(!CollidableShapes[cs].T_setup && CollidableShapes[cs].Transform._x3domNode._DEF == a._x3domNode._DEF){
                    CollidableShapes[cs].T_setup = true;
                    CollidableShapes[cs].inlineInternalTransform = null;
                    interactiveTransforms.push(a);
                    if(!CollidableShapes[cs].inlineInternalTransform && CollidableShapes[cs].isInline){
                        CollidableShapes[cs].inlineInternalTransform = a;
                    }
                }
            }
        }
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.RigidBodyCollection)){
            for(var ea in a._x3domNode._cf.bodies.nodes){
                for(var eac in a._x3domNode._cf.bodies.nodes[ea]._cf.geometry.nodes){
                    for(var cs in CollidableShapes){
                        if(!CollidableShapes[cs].RB_setup && CollidableShapes[cs].CollidableShape._x3domNode._DEF == a._x3domNode._cf.bodies.nodes[ea]._cf.geometry.nodes[eac]._DEF){
                            CollidableShapes[cs].RB_setup = true;
                            CollidableShapes[cs].RigidBody = a._x3domNode._cf.bodies.nodes[ea];
                            CollidableShapes[cs].RigidBodyCollection = a;
                        }
                    }
                }
            }
        }

    }


//	################################################################
//	###################	INITIALIZE BULLET WORLD	####################
//	################################################################

    initScene = function(){
        var collisionConfiguration, dispatcher, overlappingPairCache, solver, WorldGravity = new x3dom.fields.SFVec3f();
        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        overlappingPairCache = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();
        bulletWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
        bulletWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
    };

//	###############################################################
//	###########	CREATE&DESCRIBE RIGIDBODIES IN BULLET	###########
//	###############################################################

    CreateRigidbodies = function(){
        var mass, startTransform, localInertia, sphereShape, boxShape, cylinderShape, coneShape, indexedfacesetShape, centerOfMass, motionState, rbInfo,
            sphereAmmo, boxAmmo, cylinderAmmo, coneAmmo, indexedfacesetAmmo;

        building_constraints = true;
        for (var cs in CollidableShapes){
            if(CollidableShapes[cs].CC_setup && CollidableShapes[cs].T_setup && CollidableShapes[cs].RB_setup && CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._xmlNode.nodeName && CollidableShapes[cs].createRigid == true){
                switch (CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._xmlNode.nodeName.toLowerCase())
                {
                    case "sphere":{
                        var sphere = CollidableShapes[cs];
                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            CollidableShapes[cs].Transform._x3domNode._vf.rotation = CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation;
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        sphereShape = new Ammo.btSphereShape(CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.radius);
                        sphereShape.calculateLocalInertia(mass, localInertia);
                        sphereShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        motionState = new Ammo.btDefaultMotionState(startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, sphereShape, localInertia);
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        sphereAmmo = new Ammo.btRigidBody(rbInfo);
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            sphereAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            sphereAmmo.setDamping(0,0);
                        }
                        sphereAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        sphereAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            sphereAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            sphereAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            sphereAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            sphereAmmo.setFriction(0);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            sphereAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            sphereAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            sphereAmmo.setFlags(0);
                        }
                        else{
                            sphereAmmo.setFlags(1);
                        }
                        sphereAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody(sphereAmmo);
                            sphereAmmo.geometry = sphere;
                            rigidbodies.splice(UpdateRigidbody,1,sphereAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody(sphereAmmo);
                            sphereAmmo.geometry = sphere;
                            rigidbodies.push(sphereAmmo);
                        }
                    }
                        break;

                    case "box":{

                        var box = CollidableShapes[cs];
                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setBasis(CollidableShapes[cs].RigidBody._vf.inertia);
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));

                        var zeroRot = new x3dom.fields.Quaternion(0,0,0,1);
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        boxShape = new Ammo.btBoxShape(new Ammo.btVector3( 	CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.size.x/2,
                                CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.size.y/2,
                                CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.size.z/2));
                        localInertia = new Ammo.btVector3(0,0,0);
                        boxShape.calculateLocalInertia(mass, localInertia);
                        boxShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        motionState = new Ammo.btDefaultMotionState(startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, boxShape, localInertia);
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        boxAmmo = new Ammo.btRigidBody(rbInfo);
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            boxAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            boxAmmo.setDamping(0,0);
                        }
                        boxAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        boxAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            boxAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            boxAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            boxAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            boxAmmo.setFriction(1);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            boxAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            boxAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            boxAmmo.setFlags(0);
                        }
                        else{
                            boxAmmo.setFlags(1);
                        }
                        boxAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody(boxAmmo);
                            boxAmmo.geometry = box;
                            rigidbodies.splice(UpdateRigidbody,1,boxAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody(boxAmmo);
                            boxAmmo.geometry = box;
                            rigidbodies.push(boxAmmo);
                        }
                    }
                        break;

                    case "cylinder":{
                        var cylinder = CollidableShapes[cs];

                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setBasis(CollidableShapes[cs].RigidBody._vf.inertia);
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            CollidableShapes[cs].Transform._x3domNode._vf.rotation = CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation;
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        cylinderShape = new Ammo.btCylinderShape(new Ammo.btVector3(CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.radius,
                                CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.height/2,
                            CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.radius));
                        cylinderShape.calculateLocalInertia(mass, localInertia);
                        cylinderShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        motionState = new Ammo.btDefaultMotionState(startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, cylinderShape, localInertia);
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        cylinderAmmo = new Ammo.btRigidBody(rbInfo);
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            cylinderAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            cylinderAmmo.setDamping(0,0);
                        }
                        cylinderAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        cylinderAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            cylinderAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            cylinderAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            cylinderAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            cylinderAmmo.setFriction(1);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            cylinderAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            cylinderAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            cylinderAmmo.setFlags(0);
                        }
                        else{
                            cylinderAmmo.setFlags(1);
                        }
                        cylinderAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody( cylinderAmmo );
                            cylinderAmmo.geometry = cylinder;
                            rigidbodies.splice(UpdateRigidbody,1,cylinderAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody( cylinderAmmo );
                            cylinderAmmo.geometry = cylinder;
                            rigidbodies.push( cylinderAmmo );
                        }
                    }
                        break;

                    case "cone":{

                        var cone = CollidableShapes[cs];

                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setBasis(CollidableShapes[cs].RigidBody._vf.inertia);
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            CollidableShapes[cs].Transform._x3domNode._vf.rotation = CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation;
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        coneShape = new Ammo.btConeShape(	CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.radius,
                            CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._vf.height);
                        coneShape.setConeUpIndex(1);
                        coneShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        coneShape.calculateLocalInertia( mass, localInertia );
                        motionState = new Ammo.btDefaultMotionState( startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, coneShape, localInertia );
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        coneAmmo = new Ammo.btRigidBody( rbInfo );
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            coneAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            coneAmmo.setDamping(0,0);
                        }
                        coneAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        coneAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            coneAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            coneAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            coneAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            coneAmmo.setFriction(1);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            coneAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            coneAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            coneAmmo.setFlags(0);
                        }
                        else{
                            coneAmmo.setFlags(1);
                        }
                        coneAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody( coneAmmo );
                            coneAmmo.geometry = cone;
                            rigidbodies.splice(UpdateRigidbody,1,coneAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody( coneAmmo );
                            coneAmmo.geometry = cone;
                            rigidbodies.push( coneAmmo );
                        }
                    }
                        break;

                    case "indexedfaceset":{
                        var indexedfaceset = CollidableShapes[cs];
                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setBasis(CollidableShapes[cs].RigidBody._vf.inertia);
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            CollidableShapes[cs].Transform._x3domNode._vf.rotation = CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation;
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        var convexHullShape = new Ammo.btConvexHullShape();
                        for(var p in CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point){
                            convexHullShape.addPoint(new Ammo.btVector3(CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].x,
                                    CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].y,
                                    CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].z),
                                true);
                        }
                        var compoundShape = new Ammo.btCompoundShape();
                        compoundShape.addChildShape(startTransform, convexHullShape);
                        compoundShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        compoundShape.createAabbTreeFromChildren();
                        compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,0,1), new Ammo.btVector3(0,0,0)),true);
                        compoundShape.calculateLocalInertia( mass, localInertia );
                        motionState = new Ammo.btDefaultMotionState( startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        indexedfacesetAmmo = new Ammo.btRigidBody( rbInfo );
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            indexedfacesetAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            indexedfacesetAmmo.setDamping(0,0);
                        }
                        indexedfacesetAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        indexedfacesetAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            indexedfacesetAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            indexedfacesetAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            indexedfacesetAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            indexedfacesetAmmo.setFriction(1);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            indexedfacesetAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            indexedfacesetAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            indexedfacesetAmmo.setFlags(0);
                        }
                        else{
                            indexedfacesetAmmo.setFlags(1);
                        }
                        indexedfacesetAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody( indexedfacesetAmmo );
                            indexedfacesetAmmo.geometry = indexedfaceset;
                            rigidbodies.splice(UpdateRigidbody,1,indexedfacesetAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody( indexedfacesetAmmo );
                            indexedfacesetAmmo.geometry = indexedfaceset;
                            rigidbodies.push( indexedfacesetAmmo );
                        }
                    }
                        break;

                    case "indexedtriangleset":{

                        var triangleset = CollidableShapes[cs];
                        if(!CollidableShapes[cs].RigidBody._vf.enabled || CollidableShapes[cs].RigidBody._vf.fixed){
                            mass = 0;
                        }
                        else{
                            mass = CollidableShapes[cs].RigidBody._vf.mass;
                        }
                        startTransform = new Ammo.btTransform();
                        startTransform.setIdentity();
                        startTransform.setBasis(CollidableShapes[cs].RigidBody._vf.inertia);
                        startTransform.setOrigin(new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y,
                            CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z));
                        if(CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z == 0
                            && CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w == 1
                            ){
                            startTransform.setRotation(new Ammo.btQuaternion(0,0,1,0));
                        }
                        else{
                            CollidableShapes[cs].Transform._x3domNode._vf.rotation = CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation;
                            startTransform.setRotation(new Ammo.btQuaternion(	CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.x,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.y,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.z,
                                CollidableShapes[cs].CollidableShape._x3domNode._vf.rotation.w));
                        }
                        if(CollidableShapes[cs].RigidBody._vf.centerOfMass != null){
                            centerOfMass = 	new Ammo.btTransform(startTransform.getRotation(),
                                new Ammo.btVector3(	CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.x+CollidableShapes[cs].RigidBody._vf.centerOfMass.x,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.y+CollidableShapes[cs].RigidBody._vf.centerOfMass.y,
                                        CollidableShapes[cs].CollidableShape._x3domNode._vf.translation.z+CollidableShapes[cs].RigidBody._vf.centerOfMass.z));
                        }
                        else{
                            centerOfMass = startTransform;
                        }
                        if(CollidableShapes[cs].RigidBody._vf.inertia){
                            if(CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5] ==
                                CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8] == 1){
                                localInertia = new Ammo.btVector3(0,0,0);
                            }
                            else{
                                localInertia = new Ammo.btVector3(
                                        CollidableShapes[cs].RigidBody._vf.inertia[0] + CollidableShapes[cs].RigidBody._vf.inertia[1] + CollidableShapes[cs].RigidBody._vf.inertia[2],
                                        CollidableShapes[cs].RigidBody._vf.inertia[3] + CollidableShapes[cs].RigidBody._vf.inertia[4] + CollidableShapes[cs].RigidBody._vf.inertia[5],
                                        CollidableShapes[cs].RigidBody._vf.inertia[6] + CollidableShapes[cs].RigidBody._vf.inertia[7] + CollidableShapes[cs].RigidBody._vf.inertia[8]);
                            }
                        }
                        else{
                            localInertia = new Ammo.btVector3(0,0,0);
                        }
                        var convexHullShape = new Ammo.btConvexHullShape();
                        for(var p in CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point){
                            convexHullShape.addPoint(new Ammo.btVector3(CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].x,
                                CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].y,
                                CollidableShapes[cs].CollidableShape._x3domNode._cf.shape._x3domNode._cf.geometry.node._cf.coord.node._vf.point[p].z), true);
                        }
                        var compoundShape = new Ammo.btCompoundShape();
                        compoundShape.addChildShape(startTransform, convexHullShape);
                        compoundShape.setMargin(CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.contactSurfaceThickness);
                        compoundShape.createAabbTreeFromChildren();
                        compoundShape.updateChildTransform(0, new Ammo.btTransform(new Ammo.btQuaternion(0,0,0,1), new Ammo.btVector3(0,0,0)),true);
                        compoundShape.calculateLocalInertia( mass, localInertia );
                        motionState = new Ammo.btDefaultMotionState( startTransform);
                        rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
                        rbInfo.m_friction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.x;
                        rbInfo.m_rollingFriction = CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y;
                        var trianglesetAmmo = new Ammo.btRigidBody( rbInfo );
                        if(CollidableShapes[cs].RigidBody._vf.autoDamp){
                            trianglesetAmmo.setDamping(CollidableShapes[cs].RigidBody._vf.linearDampingFactor, CollidableShapes[cs].RigidBody._vf.angularDampingFactor);
                        }
                        else{
                            trianglesetAmmo.setDamping(0,0);
                        }
                        trianglesetAmmo.setAngularVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.angularVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.angularVelocity.z));
                        trianglesetAmmo.setLinearVelocity(new Ammo.btVector3(	CollidableShapes[cs].RigidBody._vf.linearVelocity.x,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.y,
                            CollidableShapes[cs].RigidBody._vf.linearVelocity.z));
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce != null){
                            trianglesetAmmo.setRestitution(CollidableShapes[cs].CollisionCollection._x3domNode._vf.bounce);
                        }
                        else{
                            trianglesetAmmo.setRestitution(1.0);
                        }
                        if(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients != null){
                            trianglesetAmmo.setFriction(CollidableShapes[cs].CollisionCollection._x3domNode._vf.frictionCoefficients.y);
                        }
                        else{
                            trianglesetAmmo.setFriction(1);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed && CollidableShapes[cs].RigidBody._vf.disableAngularSpeed){
                            trianglesetAmmo.setSleepingThresholds(CollidableShapes[cs].RigidBody._vf.disableLinearSpeed, CollidableShapes[cs].RigidBody._vf.disableAngularSpeed);
                        }
                        if(CollidableShapes[cs].RigidBody._vf.useGlobalGravity){
                            trianglesetAmmo.setGravity(new Ammo.btVector3(	CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.x,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.y,
                                CollidableShapes[cs].RigidBodyCollection._x3domNode._vf.gravity.z));
                            trianglesetAmmo.setFlags(0);
                        }
                        else{
                            trianglesetAmmo.setFlags(1);
                        }
                        trianglesetAmmo.setCenterOfMassTransform(centerOfMass);
                        if(UpdateRigidbody != null){
                            bulletWorld.removeRigidBody(rigidbodies[UpdateRigidbody]);
                            bulletWorld.addRigidBody( trianglesetAmmo );
                            trianglesetAmmo.geometry = triangleset;
                            rigidbodies.splice(UpdateRigidbody,1,trianglesetAmmo);
                        }
                        else{
                            bulletWorld.addRigidBody( trianglesetAmmo );
                            trianglesetAmmo.geometry = triangleset;
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


//	###############################################################
//	############	CREATE&DESCRIBE JOINTS IN BULLET	###########
//	###############################################################

    CreateJoints = function(){
        if(UpdateRigidbody != null){
            var cn, constraintNum = bulletWorld.getNumConstraints();
            for(cn = constraintNum; cn >= 0; cn--){
                var constr = bulletWorld.getConstraint(cn);
                bulletWorld.removeConstraint(constr);
            }
        }
        for(var js in JointShapes){
            if(JointShapes[js].Joint._xmlNode.nodeName){
                switch(JointShapes[js].Joint._xmlNode.nodeName.toLowerCase()){
                    case "balljoint":{
                        for (var j in rigidbodies) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                            }
                        }
                        if(object1 && object2){
                            var newBallJoint = new Ammo.btPoint2PointConstraint(object1, object2,
                                new Ammo.btVector3(JointShapes[js].Joint._vf.anchorPoint.x, JointShapes[js].Joint._vf.anchorPoint.y, JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(-JointShapes[js].Joint._vf.anchorPoint.x, -JointShapes[js].Joint._vf.anchorPoint.y, -JointShapes[js].Joint._vf.anchorPoint.z));
                            bulletWorld.addConstraint(newBallJoint);
                        }
                    }
                        break;

                    case "sliderjoint":{
                        for ( j = 0; j < rigidbodies.length; j++ ) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                            }
                        }
                        if(object1 && object2){
                            var newSliderJoint = new Ammo.btSliderConstraint(object1, object2, object1.getWorldTransform(), object2.getWorldTransform(), true);
                            newSliderJoint.setFrames(object1.getWorldTransform(), object2.getWorldTransform());
                            bulletWorld.addConstraint(newSliderJoint);
                        }
                    }
                        break;

                    case "universaljoint":{
                        for ( j = 0; j < rigidbodies.length; j++ ) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                            }
                        }
                        if(object1 && object2){
                            var newUniversalJoint = new btUniversalConstraint(object1, object2,
                                new Ammo.btVector3(JointShapes[js].Joint._vf.anchorPoint.x, JointShapes[js].Joint._vf.anchorPoint.y, JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis1.x, JointShapes[js].Joint._vf.axis1.y, JointShapes[js].Joint._vf.axis1.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis2.x, JointShapes[js].Joint._vf.axis2.y, JointShapes[js].Joint._vf.axis2.z));
                            bulletWorld.addConstraint( newUniversalJoint );
                        }
                    }
                        break;

                    case "motorjoint":{
                        for ( j = 0; j < rigidbodies.length; j++ ) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                                rigidbodies[j].geometry.isMotor = true;
                                rigidbodies[j].geometry.torque = new x3dom.fields.SFVec3f(	JointShapes[js].Joint._vf.axis2Torque * JointShapes[js].Joint._vf.motor2Axis.x,
                                        JointShapes[js].Joint._vf.axis2Torque * JointShapes[js].Joint._vf.motor2Axis.y,
                                        JointShapes[js].Joint._vf.axis2Torque * JointShapes[js].Joint._vf.motor2Axis.z);
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                                rigidbodies[j].geometry.isMotor = true;
                                rigidbodies[j].geometry.torque = new x3dom.fields.SFVec3f(	JointShapes[js].Joint._vf.axis3Torque * JointShapes[js].Joint._vf.motor3Axis.x,
                                        JointShapes[js].Joint._vf.axis3Torque * JointShapes[js].Joint._vf.motor3Axis.y,
                                        JointShapes[js].Joint._vf.axis3Torque * JointShapes[js].Joint._vf.motor3Axis.z);
                            }
                        }
                        if(object1 && object2){
                            var newGearJoint = new btGeneric6DofConstraint(	object1, object2, object1.getWorldTransform(), object2.getWorldTransform(), true );
                            /*
                             For each axis, if
                             lower limit = upper limit, The axis is locked
                             lower limit < upper limit, The axis is limited between the specified values
                             lower limit > upper limit, The axis is free and has no limits
                             */
                            if(JointShapes[js].Joint._vf.motor3Axis.x != 0){
                                newGearJoint.getRotationalLimitMotor(0).m_enableMotor = true;
                                newGearJoint.getRotationalLimitMotor(0).m_targetVelocity = JointShapes[js].Joint._vf.axis1Torque;
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
                            if(JointShapes[js].Joint._vf.motor3Axis.y != 0){
                                newGearJoint.getRotationalLimitMotor(1).m_enableMotor = true;
                                newGearJoint.getRotationalLimitMotor(1).m_targetVelocity = JointShapes[js].Joint._vf.axis2Torque;
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
                            if(JointShapes[js].Joint._vf.motor3Axis.z != 0){
                                newGearJoint.getRotationalLimitMotor(2).m_enableMotor = true;
                                newGearJoint.getRotationalLimitMotor(2).m_targetVelocity = JointShapes[js].Joint._vf.axis3Torque;
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
                            bulletWorld.addConstraint( newGearJoint, true);
                        }
                    }
                        break;

                    case "singleaxishingejoint":{
                        for ( j = 0; j < rigidbodies.length; j++ ) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                            }
                        }
                        if(object1 && object2){
                            var newSingleHingeJoint = new btHingeConstraint(object1, object2,
                                new Ammo.btVector3(JointShapes[js].Joint._vf.anchorPoint.x, JointShapes[js].Joint._vf.anchorPoint.y, JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(-JointShapes[js].Joint._vf.anchorPoint.x, -JointShapes[js].Joint._vf.anchorPoint.y, -JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis.x, JointShapes[js].Joint._vf.axis.y, JointShapes[js].Joint._vf.axis.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis.x, JointShapes[js].Joint._vf.axis.y, JointShapes[js].Joint._vf.axis.z),
                                false );
                            newSingleHingeJoint.setLimit(JointShapes[js].Joint._vf.minAngle, JointShapes[js].Joint._vf.maxAngle, 0.9, 0.3, 1.0);
                            bulletWorld.addConstraint(newSingleHingeJoint);
                        }
                    }
                        break;

                    case "doubleaxishingejoint":{
                        for ( j = 0; j < rigidbodies.length; j++ ) {
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body1.node._DEF){
                                var object1 = rigidbodies[j];
                            }
                            if(rigidbodies[j].geometry.RigidBody._DEF && rigidbodies[j].geometry.RigidBody._DEF == JointShapes[js].Joint._cf.body2.node._DEF){
                                var object2 = rigidbodies[j];
                            }
                        }
                        if(object1 && object2){
                            var newDoubleHingeJoint = new btHingeConstraint(object1, object2,
                                new Ammo.btVector3(JointShapes[js].Joint._vf.anchorPoint.x, JointShapes[js].Joint._vf.anchorPoint.y, JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(-JointShapes[js].Joint._vf.anchorPoint.x, -JointShapes[js].Joint._vf.anchorPoint.y, -JointShapes[js].Joint._vf.anchorPoint.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis1.x, JointShapes[js].Joint._vf.axis1.y, JointShapes[js].Joint._vf.axis1.z),
                                new Ammo.btVector3(JointShapes[js].Joint._vf.axis2.x, JointShapes[js].Joint._vf.axis2.y, JointShapes[js].Joint._vf.axis2.z),
                                false );
                            newDoubleHingeJoint.setLimit(JointShapes[js].Joint._vf.minAngle1, JointShapes[js].Joint._vf.maxAngle1, 0.9, 0.3, 1.0);
                            bulletWorld.addConstraint( newDoubleHingeJoint, true);
                        }
                    }
                        break;
                }
            }
        }
    };

    MakeUpdateList = function(){
        for(var r = 0; r < rigidbodies.length; r++ ){
            if(!drag && rigidbodies[r].geometry.createRigid){
                rigidbodies[r].geometry.createRigid = false;
            }
        }
        for(var r = 0; r < JointShapes.length; r++ ){
            if(!drag && JointShapes[r].createJoint){
                JointShapes[r].createJoint = false;
            }
        }
        building_constraints = false;
    };

    CreateInteractiveObjects = function(){
        if (x3dWorld) {
            x3dWorld.parentElement.addEventListener('mouseup', MouseControlStop, false);
            x3dWorld.parentElement.addEventListener('mousedown', MouseControlStart, false);
            x3dWorld.parentElement.addEventListener('mousemove', MouseControlMove, false);
            for (var t in interactiveTransforms) {
                for (var cs in CollidableShapes) {
                    if (CollidableShapes[cs].Transform._x3domNode._DEF == interactiveTransforms[t]._x3domNode._DEF) {
                        if (!CollidableShapes[cs].RigidBody._vf.fixed) {
                            interactiveTransforms[t].addEventListener('mousedown', MouseControlStart, false);
                            interactiveTransforms[t].addEventListener('mousemove', MouseControlMove, false);
                            new x3dom.Moveable(x3dWorld.parentElement, interactiveTransforms[t], null, 0);
                        }
                    }
                }
            }
        }
    };

    UpdateConstraints = function(){
        if(drag && building_constraints == false){
            for(var r = 0; r < rigidbodies.length; r++){
                if(rigidbodies[r].geometry.Transform){
                    if(rigidbodies[r].geometry.Transform._x3domNode._DEF == mousePickObject._DEF){
                        UpdateRigidbody = r;
                    }
                }
            }
            CreateRigidbodies();
        }
        else{
            clearInterval(intervalVar);
            CreateRigidbodies();
            UpdateRigidbody = null;
            mousePickObject = null;
        }
    };

    MouseControlMove = function(e){
        if(e.hitPnt){
            mousePos = new x3dom.fields.SFVec3f.parse(e.hitPnt);
        }
    };

    MouseControlStart = function(e){
        if(!drag){
            drag = true;
            if(e.hitObject){
                for(var pn in e.hitObject._x3domNode._parentNodes){
                    if(x3dom.isa(e.hitObject._x3domNode._parentNodes[pn], x3dom.nodeTypes.Transform)){
                        mousePickObject = e.hitObject._x3domNode._parentNodes[pn];
                    }
                }
            }
            if(mousePickObject){
                for (var r in rigidbodies){
                    if(rigidbodies[r] && rigidbodies[r].geometry.Transform._x3domNode._DEF == mousePickObject._DEF){
                        rigidbodies[r].activate(false);
                        rigidbodies[r].geometry.createRigid = true;
                        intervalVar=setInterval(UpdateConstraints, 1);
                    }
                }
            }
            else{
                drag = false;
                mousePickObject = null;
            }
        }
    };

    MouseControlStop = function(e){
        if(drag){
            drag = false;
        }
    };

//	###############################################################
//	####################	UPDATE RIGIDBODIES	###################
//	##########	CALCULATE RIGIDBODY POSITION&ROTATION	###########

    updateRigidbodies = function(){
        bulletWorld.stepSimulation(1/60, 100);
        var r, transform = new Ammo.btTransform(), origin = new Ammo.btVector3(), rotation = new Ammo.btQuaternion();
        for(r = 0; r < rigidbodies.length; r++){
            if(!rigidbodies[r].geometry.createRigid){
                rigidbodies[r].getMotionState().getWorldTransform( transform );
                origin = transform.getOrigin();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.x = origin.x();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.y = origin.y();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.z = origin.z();
                rotation = transform.getRotation();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.rotation.x = rotation.x();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.rotation.y = rotation.y();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.rotation.z = rotation.z();
                rigidbodies[r].geometry.CollidableShape._x3domNode._vf.rotation.w = rotation.w();
            }
            else{
                if(mousePos){
                    //CALCULATE RIGIDBODY POSITION FROM MOUSE POSITION
                    rigidbodies[r].getMotionState().getWorldTransform( transform );
                    transform.setOrigin(new Ammo.btVector3(mousePos.x, mousePos.y, mousePos.z));
                    origin = transform.getOrigin();
                    rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.x = origin.x();
                    rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.y = origin.y();
                    rigidbodies[r].geometry.CollidableShape._x3domNode._vf.translation.z = origin.z();
                }
            }

            //SET RIGIDBODY POSITION + ROTATION
            for (var x in x3dWorld.children){
                if(x3dWorld.children[x].nodeName && x3dWorld.children[x].nodeName.toLowerCase() == "group"){
                    for(var c in x3dWorld.children[x].childNodes){
                        if(x3dWorld.children[x].childNodes.hasOwnProperty(c) && x3dWorld.children[x].childNodes[c] != null){
                            UpdateTransforms(x3dWorld.children[x].childNodes[c], rigidbodies[r]);
                        }
                    }
                }
                else{
                    UpdateTransforms(x3dWorld.children[x], rigidbodies[r]);
                }
            }

            if(rigidbodies[r].geometry.isMotor == true){
                rigidbodies[r].applyTorque(new Ammo.btVector3(rigidbodies[r].geometry.torque.x, rigidbodies[r].geometry.torque.y, rigidbodies[r].geometry.torque.z));
            }
            if(rigidbodies[r].geometry.RigidBody._vf.torques.length > 0){
                for(var num in rigidbodies[r].geometry.RigidBody._vf.torques){
                    rigidbodies[r].applyTorque(new Ammo.btVector3(rigidbodies[r].geometry.RigidBody._vf.torques[num].x, rigidbodies[r].geometry.RigidBody._vf.torques[num].y, rigidbodies[r].geometry.RigidBody._vf.torques[num].z));
                }
            }
        }
    };

    function UpdateTransforms(a, b){
        if(x3dom.isa(a._x3domNode, x3dom.nodeTypes.Transform)){
            if(b.geometry.isInline){
                if(a == b.geometry.inlineExternalTransform){
                    if(b.geometry.inlineInternalTransform){
                        b.geometry.inlineInternalTransform.translation = b.geometry.CollidableShape._x3domNode._vf.translation;
                        b.geometry.inlineInternalTransform.rotation = b.geometry.CollidableShape._x3domNode._vf.rotation;
                    }
                }
            }
            else{
                if(b.geometry.Transform){
                    if(b.geometry.Transform._x3domNode._DEF == a._x3domNode._DEF){
                        a.translation = b.geometry.CollidableShape._x3domNode._vf.translation;
                        a.rotation = b.geometry.CollidableShape._x3domNode._vf.rotation;
                    }
                }
            }
        }
    }

    function InlineObjectList(a, b){
        for(var x in a.children){
            CreateX3DCollidableShape(a.children[x], b);
        }
        b.translation = new x3dom.fields.SFVec3f(0,0,0);
    }

    main = function main(){
        updateRigidbodies();
        window.requestAnimFrame(main);
        if(document.readyState === "complete" && !inlineLoad && inline_x3dList.length){
            for(var x in inline_x3dList){
                if(inline_x3dList[x]._x3domNode._cf.children.nodes[0]._xmlNode._x3domNode._childNodes[0]){
                    inlineLoad = true;
                    InlineObjectList(inline_x3dList[x]._x3domNode._cf.children.nodes[0]._xmlNode._x3domNode._childNodes[0]._xmlNode, inline_x3dList[x]);
                    CreateRigidbodies();
                }
            }
        }
    };

    window.onload = function(){
        ParseX3DElement();
        initScene();
        requestAnimFrame(main);
        if(!inline_x3dList.length){
            CreateRigidbodies();
        }
        CreateInteractiveObjects();
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
