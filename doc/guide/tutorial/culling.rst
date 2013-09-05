.. _culling:

Culling
==================================================


This tutorial explains the different parameters to adjust x3doms integrated culling techniques for your personal needs on quality and performance.

The Environment-Bindable
------------------------

All relevant parameters are included in the new Environment-Bindable. To change it's settings it has to be added to the scene explicitly. For each culling technique there exists a boolean flag to enable/disable it and a list of more detailed settings if applicable. Each of the following sections explains the usage of a technique and it's parameters. Their combination can lead to very different results which allows explicit performance tuning for a specific scene.

.. code-block:: xml

    <environment viewFrustumCulling='true' smallFeatureCulling='true' smallFeatureThreshold..>
    </environment>
    

View Frustum Culling
--------------------

The most common culling technique is the viewfrustum culling controlled by the viewFrustumCulling flag. The bounding volumes of the nodes are tested to be intersecting the frustum defining the current view. The nodes of the scene are traversed recursively reusing already calculated intersection if possible. It is the only technique which is not dependent on additional parameters.

========================    ====================================    ========================    
Setting                     Usage                                   Values                     
========================    ====================================    ========================    
viewFrustumCulling          (de-)activate the culling technique     [true;false]
========================    ====================================    ========================
 	

Small Feature Culling
---------------------

Using the smallFeatureCulling flag this technique is activated. For each node the amount of pixels is calculated it's bounding volume would cover in screen space. If the coverage is below the smallFeatureThreshold parameter the node (and subsequent shapes) is culled.

========================    ===============================================    ========================    
Setting                     Usage                                              Values                     
========================    ===============================================    ========================    
smallFeatureCulling         (de-)activate the culling technique                [true;false]
smallFeatureTreshold        cull objects covering less pixels than treshold    [0..*]
========================    ===============================================    ========================


Occlusion Culling *
-------------------

Being the most complex supported culling method, occlusion culling is triggered by the occlusionCulling flag. The scene is traversed using the "Coherent Hierarchical Culling++" algorithm and based on the triggere occlusion queries the screen space coverage not occluded by other nodes is tested. A node is only drawn if its coverage is higher than the occlusionVisibilityTreshold.

===========================    ================================================================    ========================    
Setting                        Usage                                                               Values                     
===========================    ================================================================    ========================    
occlusionCulling               (de-)activate the culling technique                                 [true;false]
occlusionVisibilityTreshold    cull objects covering less pixels than treshold due to occlusion    [0..*]
===========================    ================================================================    ========================


Low Priority Culling
--------------------

This is the only supported comparison-based culling technique. Triggered by the lowPriorityCulling the nodes which passed all previous (activated) culling techniques are sorted by their priority. Afterwards the part of this list defined by the lowPriorityTreshold is removed. At the moment the screen-space coverage is used as priority, later on there will be a more sophisticated calculation allowing the user to set priorities to mark his or her personally important nodes. Therefore by now the priority culling is very similar to the small feature method but culling a relative amount instead of comparing to an absolute threshold.

===========================    ===================================================================    ========================    
Setting                        Usage                                                                  Values                     
===========================    ===================================================================    ========================    
lowPriorityCulling             (de-)activate the culling technique                                    [true;false]
lowPriorityThreshold           draw only objects within threshold fraction of priority sorted list    [0..1]
===========================    ===================================================================    ========================


Tesselation Detail Culling
--------------------------

The possibiliy of using this culling technique completely depends on the support of the meshes data formats. Up to now only the POP-Geometry format natively supports it. As long as the resulting error stays within the amount of pixels defined by tesselationErrorThreshold the tesselation of the mesh is lowered to certain degree. It can be enabled using the flag tesselationDetailCulling.

===========================    ===================================================================    ========================    
Setting                        Usage                                                                  Values                     
===========================    ===================================================================    ========================    
tesselationDetailCulling       (de-)activate the culling technique                                    [true;false]
tesselationErrorTreshold       use mesh simplification having lower error than threshold              [0..*]
===========================    ===================================================================    ========================
* : Not fully implemented yet