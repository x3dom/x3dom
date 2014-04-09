/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

//	### RigidBody ###
x3dom.registerNodeType("RigidBody", "X3DNode", defineClass(x3dom.nodeTypes.X3DNode, 
        /**
         * Constructor for RigidBody
         * @constructs x3dom.nodeTypes.RigidBody
         * @x3d x.x
         * @component X3DNode
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function(ctx){
    x3dom.nodeTypes.RigidBody.superClass.call(this, ctx);

            /**
             *
             * @var {SFFloat} angularDampingFactor
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0.001
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'angularDampingFactor', 0.001);

            /**
             *
             * @var {SFVec3f} angularVelocity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'angularVelocity', 0,0,0);

            /**
             *
             * @var {SFBool} autoDamp
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'autoDamp', false);

            /**
             *
             * @var {SFBool} autoDisable
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'autoDisable', false);

            /**
             *
             * @var {SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'centerOfMass', 0,0,0);

            /**
             *
             * @var {SFFloat} disableAngularSpeed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableAngularSpeed', 0);

            /**
             *
             * @var {SFFloat} disableLinearSpeed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableLinearSpeed', 0);

            /**
             *
             * @var {SFFloat} disableTime
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'disableTime', 0);

            /**
             *
             * @var {SFBool} enabled
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'enabled', true);

            /**
             *
             * @var {SFVec3f} finiteRotationAxis
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'finiteRotationAxis', 0,0,0);

            /**
             *
             * @var {SFBool} fixed
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'fixed', false);

            /**
             *
             * @var {MFVec3f} forces
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue []
             * @field x3dom
             * @instance
             */
    this.addField_MFVec3f(ctx, 'forces', []);

            /**
             *
             * @var {MFFloat} inertia
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue [1,0,0,0,1,0,0,0,1]
             * @field x3dom
             * @instance
             */
    this.addField_MFFloat(ctx, 'inertia', [1, 0, 0, 0, 1, 0, 0, 0, 1]);

            /**
             *
             * @var {SFFloat} linearDampingFactor
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0.001
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'linearDampingFactor', 0.001);

            /**
             *
             * @var {SFVec3f} linearVelocity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'linearVelocity', 0,0,0);

            /**
             *
             * @var {SFFloat} mass
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 1
             * @field x3dom
             * @instance
             */
    this.addField_SFFloat(ctx, 'mass', 1);

            /**
             *
             * @var {SFRotation} orientation
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,1,0
             * @field x3dom
             * @instance
             */
    this.addField_SFRotation(ctx, 'orientation', 0,0,1,0);

            /**
             *
             * @var {SFVec3f} position
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
    this.addField_SFVec3f(ctx, 'position', 0,0,0);

            /**
             *
             * @var {MFVec3f} torques
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue []
             * @field x3dom
             * @instance
             */
    this.addField_MFVec3f(ctx, 'torques', []);

            /**
             *
             * @var {SFBool} useFiniteRotation
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue false
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'useFiniteRotation', false);

            /**
             *
             * @var {SFBool} useGlobalGravity
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue true
             * @field x3dom
             * @instance
             */
    this.addField_SFBool(ctx, 'useGlobalGravity', true);

            /**
             *
             * @var {MFNode} massDensityModel
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue x3dom.nodeTypes.Shape
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('massDensityModel', x3dom.nodeTypes.Shape);

            /**
             *
             * @var {MFNode} metadata
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
    this.addField_MFNode('metadata', x3dom.nodeTypes.X3DMetadataObject);

            /**
             *
             * @var {MFNode} geometry
             * @memberof x3dom.nodeTypes.RigidBody
             * @initvalue x3dom.nodeTypes.X3DNBodyCollidableNode
             * @field x3dom
             * @instance
             */
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