#include "Bih.h"

/**
 * Go through the objects from start to finish and sort them inplace
 * according to the subspace they fall into.
 *
 * Returns number of objects in the "left" (less than pivot) bucket.
 */
size_t Bih::bucket_sort(size_t*& index, size_t start, size_t num, float pivot, int axis)
{
    float min, max;
    size_t num_left = 0;
	float vec[3];
	
    for (size_t i=0; i<num; i++)
    {
		/*
        // get the min/max values of a triangle in axis
        geo.axis_min_max(index[start+i], axis, min, max);

        // sort into subspaces
        float geo_center = min + ((max - min) * 0.5f);
	    */

		float center =  (this->p_dataElements[index[start+i]]._volume.getCenter())[axis];

        if (center < pivot)
        {
            // swap
            size_t t              = index[start+i];
            index[start+i]		  = index[start+num_left];
            index[start+num_left] = t;

            num_left += 1;
        }
    }
	
    return num_left;
}

//----------------------------------------------------------------------------------------------------------------------------------

/**
 * This is the core building function. It is recursive and divides a set of
 * geometry (geo, start_obj_index, num_objs) into subnodes that are, again,
 * subdivided in the recursive calls.
 */
void Bih::process_node(bih_tree & tree, int node_index, size_t start_obj_index, size_t num_objs, const BoxVolume* box, unsigned int depth, const build_setup& setup)
{
    bih_node& node(tree.node(node_index));
	node.boxVolume = *box;
	

    if (depth > tree.stats().depth) tree.stats().depth = depth;

    // calculate split axis and split center of AABB
    node.split_axis = box->getLongestAxis();
	float split_center = box->getCenter()[node.split_axis];

    // bucket sort objects into 2 subspaces around split_center
    unsigned int num_objects_left = bucket_sort(tree.index(),
                                                start_obj_index, num_objs, split_center, node.split_axis);
    unsigned int num_objects_right = num_objs - num_objects_left;

    // now adjust splitting planes to really fit both subspaces
    node.clip[0] = (*box)[0][node.split_axis];
    node.clip[1] = (*box)[1][node.split_axis];

    size_t center_index = start_obj_index + num_objects_left;

    float min = 0, max = 0;

    for (size_t i=start_obj_index; i<center_index; i++)
    {
		//geo.axis_min_max(tree.index()[i], node.split_axis, min,max);
        this->p_dataElements[tree.index()[i]]._volume.getMinMax(node.split_axis,min,max);	
		if (max > node.clip[0])
            node.clip[0] = max;
    }

    for (size_t i=center_index; i<start_obj_index+num_objs; i++)
    {
        //geo.axis_min_max(tree.index()[i], node.split_axis, min,max);
        this->p_dataElements[tree.index()[i]]._volume.getMinMax(node.split_axis,min,max);		
		if (min < node.clip[1])
            node.clip[1] = min;
    }

    // enlarge sub-spaces by 1% each
    /*float delta = (box->vecs[1][node.split_axis] - box->vecs[0][node.split_axis]) * 0.01f;
    node.clip[0] += delta;
    node.clip[1] -= delta;
	*/


	// subdivide
	BoxVolume left_voxel(*box);
	left_voxel[1][node.split_axis] = node.clip[0]; //is slower
	left_voxel.update();
	
    // subdivide or store leaves
    tree.stats().num_nodes += 1;  // add one node for left subtree/leaf
    if ((num_objects_left > setup.max_obj_per_node) && (depth < setup.max_depth))
    {
		process_node(tree, tree.stats().num_nodes,start_obj_index, num_objects_left,
                     &left_voxel, depth+1, setup);
    }
    else
    {
        // store
        bih_node& leaf_node(tree.node(tree.stats().num_nodes));
		leaf_node.boxVolume =  num_objects_left == 1 ? this->p_dataElements[tree.index(start_obj_index)]._volume :  left_voxel;

        leaf_node.split_axis        = -1;
        leaf_node.index_right_child = -1;
        leaf_node.index_geo[0]      = start_obj_index;
        leaf_node.index_geo[1]      = num_objects_left;

        // update tree statistics
        if (num_objects_left > tree.stats().max_objs) tree.stats().max_objs = num_objects_left;
        tree.stats().num_leaves += 1;
    }

    // we have to get the node again since the array it references may have been resized at this point
    bih_node& node2(tree.node(node_index));

    tree.stats().num_nodes += 1; // add one node for right subtree/leaf
    node2.index_right_child = static_cast<int>(tree.stats().num_nodes); // connect current node to right subtree/leaf

	BoxVolume right_voxel(*box);
	right_voxel[0][node2.split_axis] = node.clip[1];// is slower
	right_voxel.update();

    if ((num_objects_right > setup.max_obj_per_node) && (depth < setup.max_depth))
    {
		process_node(tree, tree.stats().num_nodes,start_obj_index+num_objects_left, num_objects_right,
                     &right_voxel, depth+1, setup);
    }
    else
    {
        bih_node& leaf_node(tree.node(tree.stats().num_nodes));
		leaf_node.boxVolume = num_objects_right == 1 ? this->p_dataElements[tree.index(start_obj_index+num_objects_left)]._volume :  right_voxel;
        leaf_node.split_axis        = -1;
        leaf_node.index_right_child = -1;
        leaf_node.index_geo[0]      = start_obj_index+num_objects_left;
        leaf_node.index_geo[1]      = num_objects_right;

        if (num_objects_right > tree.stats().max_objs) tree.stats().max_objs = num_objects_right;
        tree.stats().num_leaves += 1;
    }

}


//----------------------------------------------------------------------------------------------------------------------------------

/**
 * Compiles geo into a bih tree.
 */
void Bih::compile( bih_tree& tree, const build_setup& setup)
{
    if (this->_currentSize == 0) return;

    tree.reset(this->_currentSize);

    // make an initial guess at the amount of BIH nodes needed
    tree.check_resize(this->_currentSize);

    //geo.calc_bounding_box();
	BoxVolume overallBB(this->calcOverallBoundingBox());
	overallBB.update();
	Vec3f min = overallBB[0];
	Vec3f max = overallBB[1];

	printf("Overall BB: %f %f %f %f %f %f\n",min[0],min[1],min[2],max[0],max[1],max[2]);

    // compile
    process_node(tree, 0,0, this->_currentSize,
                 &overallBB,
                 0, setup);

	printf("Stats: Nodes %i Leafs %i\n",tree.stats().num_nodes, tree.stats().num_leaves);

	tree.active = true;
}

//----------------------------------------------------------------------------------------------------------------------------------

/**
 * Compiles geo into a bih tree.
 */
void Bih::recompile(bih_tree& tree, const build_setup& setup)
{
    //std::cout << "#num_objects : " << geo.num_objects() << std::endl;
	/*
    if (geo.num_objects() == 0) return;

    tree.reset(geo.num_objects());
    tree.check_resize(geo.num_objects());

    geo.calc_bounding_box();

    // compile
    process_node(tree, 0,
                 geo, 0, geo.num_objects(),
                 geo.bounding_box,
                 0, setup);

    tree.active = true;*/
}

//----------------------------------------------------------------------------------------------------------------------------------

void Bih::intersect(ViewFrustum* frustum, int nodeIndex, int planeMask)
{
	bih_node* node = &this->tree.node(nodeIndex);
	//leaf?
	
	if(planeMask < 63)
	{
		planeMask = frustum->intersect(&node->boxVolume,planeMask);
	}
	if(planeMask >=0)
	{
		if(node->split_axis == -1)
		{
			for(int i = 0; i < node->index_geo[1]; ++i)
			{
				int id = this->tree.index()[node->index_geo[0]+i];
				DataElement& data = this->p_dataElements[id];
				
				float coverage = this->calculateCoverage(data._volume);
				if(coverage >= this->_smallFeatureTreshold)
				{
#ifdef EMSCRIPTEN
					jsAddDrawableCallback(id,coverage);
#endif
				}
			}
		}
		else
		{
			float coverage = this->calculateCoverage(node->boxVolume);
			if(coverage >= this->_smallFeatureTreshold)
			{
				this->intersect(frustum,nodeIndex+1,planeMask);
				this->intersect(frustum,node->index_right_child,planeMask);
			}
		}
	}/*
	else
		printf("Outside Node: %i - planeMask %i\n",nodeIndex,planeMask);*/
}