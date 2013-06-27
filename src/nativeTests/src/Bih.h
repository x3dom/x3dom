// ========================================================================= //
//                                                                           //
// Reused from CLINT BIH                                                     //
//                                               +-----+-----+--+--+--+--+   //
//                                               !     !     !  !  !  !  !   //
//                                               !     !     +--+--+--+--+   //
// Author:    Fraunhofer-Institut fuer           !     !     !  !  !  !  !   //
//            Graphische Datenverarbeitung       +-----+-----+--+--+--+--+   //
//            (IGD) Abteilung A4:                !     !     !  !  !  !  !   //
//            Virtuelle und Erweiterte Realiteat !     !     +--+--+--+--+   //
//            Fraunhoferstr. 5                   !     !     !  !  !  !  !   //
//            D-64283 Darmstadt, Germany         +-----+-----+--+--+--+--+   //
//                                               ! FFFFFF hh !     GGGG  !   //
//            Rights: Copyright (c) 2007 by IGD. ! FFFFFF hh !    GGGGGG !   //
//            All rights reserved.               ! FFF    hh h    GG     !   //
//            IGD provides this product          ! FFFFF  hhhhhh  GG  GG !   //
//            without warranty of any kind       ! FFFFF  hhh!hhh GG  GG !   //
//            and shall not be liable for        ! FFF    hh ! hh GGGGGG !   //
//            any damages caused by the use      ! FFF    hh ! hh  GGGG  !   //
//            of this product.                   +-----------+-----------+   //
//                                                                           //
// ========================================================================= //


#include "SpatialHierarchyDataManager.h"

#include <vector>
#include <stdio.h>

#ifndef CLINT_BIH_TREE_H
#define CLINT_BIH_TREE_H

#include <stddef.h>

struct bih_tree_stats
{
    // tree statistics
    size_t num_nodes;
    size_t num_leaves;
    size_t depth;
    size_t max_objs;

    bih_tree_stats()
    {
        clear();
    }

    void clear()
    {
        num_nodes  = 0;
        depth      = 0;
        max_objs   = 0;
        num_leaves = 0;
    }
};

/**
 * Bounding Interval Hierarchy node.
 * This is intensly optimized for size/cache coherency as it is the primary structure
 * for BIH-based ray tracing. Modify with extreme care!
 *
 * S := Scalar type
 */
struct bih_node
{
    /**
     * The left child is always stored next to the parent, so we don't need a pointer
     * for that one.
     */
    size_t index_right_child;

    /**
     * We could store this in the 2 lowest bits of index_right_child, but then we'd have
     * a size of 12 bytes instead of 16 bytes, which is less cache-friendly (test if true?).
     *
     *  0 - x-axis
     *  1 - y-axis
     *  2 - z-axis
     * -1 - leaf node
     */
    int split_axis;

//    union {
    int index_geo[2];    // index to objects [0] and number of objects [1] - leaf nodes only
    float   clip[2];         // clipping planes - internal nodes only
//    };

	BoxVolume boxVolume;
};

/**
 * Bounding Interval Hierarchy
 */
class bih_tree
{
public:
    bih_tree()
    {
        index_ = 0;
        nodes_ = 0;

        num_objs_ = 0;
        num_nodes_ = 0;

        active = false;
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    ~bih_tree()
    {
        if (nodes_ != 0)
            delete[] nodes_;

        if (index_ != 0)
            delete[] index_;
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    bih_tree(const bih_tree& other)
    {
        index_ = 0;
        nodes_ = 0;

        num_objs_ = 0;
        num_nodes_ = 0;

        clone_from(other);
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    bih_tree& operator=(const bih_tree& other)
    {
        if (&other != this)
            clone_from(other);

        return (*this);
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    bool active;

	//----------------------------------------------------------------------------------------------------------------------------------

    void reset(size_t num_objs)
    {
        stats_.clear();       

        if (index_ != 0)
            delete[] index_;

        if (nodes_ != 0)
            delete[] nodes_;

        nodes_ = 0;
        num_nodes_ = 0;

        index_ = new size_t[num_objs];
        num_objs_ = num_objs;

        reset_index(num_objs);
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    inline void reset_index(size_t num_objs)
    {
        for (size_t i=0; i<num_objs_; i++)
            index_[i] = i;
    }

	//----------------------------------------------------------------------------------------------------------------------------------

    inline const bih_node& node(size_t index) const {return nodes_[index];}
    inline       bih_node& node(size_t index)       {check_resize(index); return nodes_[index];}

    inline const size_t*& index() const { return(const size_t*&) index_;}
    inline       size_t*& index()       {return index_;}

    inline size_t index(size_t i) const {return index_[i];}

    /**
     * While building the tree it is unclear how much space is needed.
     * Thus this function to check if a specific entry is available.
     * If not nodes_ is automatically resized.
     */
    void check_resize(size_t node_index)
    {
	    if (node_index >= num_nodes_)
        {
            size_t resize_factor = 2;
            size_t new_num_nodes = node_index * resize_factor;

            /*if (num_nodes_ > 0)
                std::cout << "RESIZE! "
                          << num_nodes_ << " -> " << new_num_nodes
                          << " mem: " << (sizeof(bih_node<S>) * new_num_nodes) << std::endl;*/

            bih_node* temp = new bih_node[new_num_nodes];
            for (size_t i=0; i<num_nodes_; i++)
                temp[i] = nodes_[i];

            if (nodes_ != 0)
                delete[] nodes_;

            nodes_ = temp;
            num_nodes_ = new_num_nodes;
        }
    }

    const bih_tree_stats& stats() const {return stats_;}
          bih_tree_stats& stats()       {return stats_;}

	//----------------------------------------------------------------------------------------------------------------------------------

private:
    bih_node* nodes_;
    size_t num_nodes_;

    size_t* index_;
    size_t num_objs_;

    bih_tree_stats stats_;

    void clone_from(const bih_tree& other)
    {
        // clean up own stuff
        if (nodes_ != 0)
            delete[] nodes_;
        nodes_ = 0;
        num_nodes_ = 0;

        if (index_ != 0)
            delete[] index_;
        index_ = 0;
        num_objs_ = 0;

        active = false;

        // copy the other tree if it is active
        if (other.active)
        {
            active = other.active;
            stats_ = other.stats_;

            num_nodes_ = other.num_nodes_;
            num_objs_ = other.num_objs_;

            if (num_objs_ > 0)
                index_ = new size_t[num_objs_];
            for (size_t i=0; i<num_objs_; i++)
                index_[i] = other.index_[i];

            if (num_nodes_ > 0)
                nodes_ = new bih_node[num_nodes_];
            for (size_t i=0; i<num_nodes_; i++)
                nodes_[i] = other.nodes_[i];
        }
    }
};

//----------------------------------------------------------------------------------------------------------------------------------

struct build_setup
{
	unsigned int max_obj_per_node;
	unsigned int max_depth;

	build_setup()
	{
		max_obj_per_node = 1;
		max_depth = 50;
	}
};

//----------------------------------------------------------------------------------------------------------------------------------

class Bih : public SpatialHierarchyDataManager
{
private:
	bih_tree tree;

	//----------------------------------------------------------------------------------------------------------------------------------

	size_t bucket_sort(size_t*& index, size_t start, size_t num, float pivot, int axis);
	void process_node(bih_tree & tree, int node_index, size_t start_obj_index, size_t num_objs, const BoxVolume* box, unsigned int depth, const build_setup& setup);
	void compile(bih_tree& tree, const build_setup& setup);
	void recompile(bih_tree& tree, const build_setup& setup);

	void intersect(ViewFrustum* frustum, int nodeIndex, int planeMask);

public:
	Bih(int poolSize) : SpatialHierarchyDataManager(poolSize)
	{
		this->tree.reset(poolSize);
	};

	//----------------------------------------------------------------------------------------------------------------------------------
	
	virtual void buildHierarchy()
	{
		build_setup setup;
		this->compile(this->tree,setup);	
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	virtual void updateHierarchy() 
	{
	
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	virtual void getHierarchyNodeBoxVolume(int id)
	{
		//num_nodes = nodes -1
		if(id <= this->tree.stats().num_nodes)
		{
			bih_node& node = this->tree.node(id);
			Vec3f min = node.boxVolume[0];
			Vec3f max = node.boxVolume[1];
#ifdef EMSCRIPTEN	
			jsAddHierarchyBoxVolume(min[0],min[1],min[2],max[0],max[1],max[2]);
#endif
		}
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	virtual void collectDrawables(ViewFrustum _frustum)
	{
		this->intersect(&_frustum,0,0);

		/*
		for(int i = 0; i < this->_currentSize; ++i)
		{
#if EMSCRIPTEN
			jsAddDrawableCallback(i);
#else
			printf("%i", i);			
#endif	
		}*/
	}
};

#endif