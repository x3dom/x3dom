#include "ModelGeometry.h"
#include "Quadric.h"

#include <assert.h>

#include <algorithm>


struct ErrorInfo 
{
    float error_value;
    unsigned int halfedge_index;

    bool operator<(const ErrorInfo & other) const
    {
        return error_value < other.error_value;
    }
};


float dot(float a[3], float b[3])
{
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}


void cross(float u[3], float v[3], float n[3])
{
  n[0] = u[1]*v[2] - u[2]*v[1];
  n[1] = u[2]*v[0] - u[0]*v[2];
  n[2] = u[0]*v[1] - u[1]*v[0];
}


void ModelGeometry::get_normal(unsigned int vp, unsigned int vq, unsigned int vr, float n[3])
{
  const Vertex & p = vertex_data->at(vp);
  const Vertex & q = vertex_data->at(vq);
  const Vertex & r = vertex_data->at(vr);

  float u[3], v[3];
  float norm;

  // right hand system, CCW triangle
  u[0] = q.x - p.x;
  u[1] = q.y - p.y;
  u[2] = q.z - p.z;

  v[0] = r.x - p.x;
  v[1] = r.y - p.y;
  v[2] = r.z - p.z;

  // plane normal
  cross(u, v, n);
  norm = sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]);
  n[0] = n[0] / norm;
  n[1] = n[1] / norm;
  n[2] = n[2] / norm;
}


int walk_CCW(unsigned int index, const std::vector<Halfedge> & halfedges)
{
    return halfedges.at(prevHalfEdgeIdx(index)).twin;
}


int walk_CW(unsigned int index, const std::vector<Halfedge> & halfedges)
{
    int t = halfedges.at(index).twin;
    
    if (t != -1)
        return nextHalfEdgeIdx(t);
    else
        return -1;
}


void ModelGeometry::add_triangle(unsigned int v0, unsigned int v1, unsigned int v2)
{
    Edge e0, e1, e2;
    e0.v0 = v0;
    e0.v1 = v1;
    e0.id = edges.size();

    e1.v0 = v1;
    e1.v1 = v2;
    e1.id = edges.size() + 1;
    
    e2.v0 = v2;
    e2.v1 = v0;
    e2.id = edges.size() + 2;

    edges.push_back(e0);
    edges.push_back(e1);
    edges.push_back(e2);


    Halfedge h0, h1, h2;

    h0.v    = v0;
    h1.v    = v1;
    h2.v    = v2;

    h0.twin = h1.twin = h2.twin = -1;
    h0.state = h1.state = h2.state = UNCHANGED;

    halfedges.push_back(h0);
    halfedges.push_back(h1);
    halfedges.push_back(h2);
}


void ModelGeometry::set_vertex_data(std::vector<Vertex> * data)
{
   vertex_data = data;
}


void ModelGeometry::create_half_edges()
{
    printf("Creating half-edges ...\n");

    std::sort(edges.begin(), edges.end());

    for (unsigned int i = 0; i < (edges.size()-1); ++i)
    {
        if (edges.at(i).hasSameVerts(edges.at(i+1)))
        {
            halfedges.at(edges.at(i).id).twin   = edges.at(i+1).id;
            halfedges.at(edges.at(i+1).id).twin = edges.at(i).id;
            ++i;
        }
    }

    edges.clear();

    printf("Creating adjacency map ...\n");

    unsigned int v;
    bool found;

    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        v = halfedges.at(i).v;

        const std::vector<unsigned int> & adjacent_halfedges = adjacency[v];

        found = false;

        for (std::vector<unsigned int>::const_iterator it = adjacent_halfedges.begin(), end = adjacent_halfedges.end();
             it != end; ++it)
        {
            if (*it == i)
            {
                found = true;
                break;
            }
        }
        
        if (!found)
            adjacency[v].push_back(i);
    }

     unsigned int border_halfedges = 0;

    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        if (halfedges.at(i).twin == -1)
            ++border_halfedges;
    }

    if (border_halfedges)
        printf("WARNING: Found %d border half-edges.\n", border_halfedges);
    else
        printf("Found no border half-edges.\n");
}


bool ModelGeometry::can_be_collapsed(unsigned int e, const std::vector<Halfedge> & halfedges)
{
    const Halfedge & h = halfedges.at(e);
    
    //if there is no twin, or if it is already selected for a collapse, discard e
    if (h.twin == -1)
        return false;

    const Halfedge & twin = halfedges.at(h.twin);

    if (twin.state == MARKED_FOR_COLLAPSE)
        return false;

    unsigned int e_next = nextHalfEdgeIdx(e);

    //discard anything close to the border
    const Halfedge & prev      = halfedges.at(prevHalfEdgeIdx(e));
    const Halfedge & next      = halfedges.at(e_next);
    const Halfedge & twin_prev = halfedges.at(prevHalfEdgeIdx(h.twin));
    const Halfedge & twin_next = halfedges.at(nextHalfEdgeIdx(h.twin));

    if (prev.twin == -1 || next.twin == -1 || twin_prev.twin == -1 || twin_next.twin == -1)
        return false;


    //check if neighbouring vertices should already be collapsed
    
    //walk CW around the 'tip' of the halfedge
    std::vector<unsigned int> halfedges_around_tip;

    unsigned int current_halfedge = e_next;
    int current_twin;

    do
    {
        current_twin = halfedges.at(current_halfedge).twin;

        if (current_twin == -1)
            return false;

        if (halfedges.at(current_halfedge).state == MARKED_FOR_COLLAPSE ||
            halfedges.at(current_twin).state == MARKED_FOR_COLLAPSE       )
            return false;

        halfedges_around_tip.push_back(current_halfedge);

        current_halfedge = walk_CW(current_halfedge, halfedges);
        
        if (current_halfedge == -1)
            return false;
    }
    while (current_halfedge != h.twin);
    
    //walk CW around the 'base' of the halfedge
    std::vector<unsigned int> halfedges_around_base;

    current_halfedge = nextHalfEdgeIdx(h.twin);

    float n1_a[3], n1_b[3],
          n2_a[3], n2_b[3],
          cprod_1[3], cprod_2[3];
    do
    {
        current_twin = halfedges.at(current_halfedge).twin;

        if (current_twin == -1)
            return false;

        if (halfedges.at(current_halfedge).state == MARKED_FOR_COLLAPSE ||
            halfedges.at(current_twin).state == MARKED_FOR_COLLAPSE       )
            return false;

        halfedges_around_base.push_back(current_halfedge);

        //check if normals would get flipped
        if (halfedges_around_base.size() > 1)
        {
            get_normal(halfedges.at(current_halfedge).v,
                       halfedges.at(nextHalfEdgeIdx(current_halfedge)).v,
                       halfedges.at(prevHalfEdgeIdx(current_halfedge)).v,
                       n1_a);
            
            get_normal(halfedges.at(e_next).v,
                       halfedges.at(nextHalfEdgeIdx(current_halfedge)).v,
                       halfedges.at(prevHalfEdgeIdx(current_halfedge)).v,
                       n1_b);

            if (dot(n1_a, n1_b) < 0.0f)
                return false;

            if (halfedges_around_base.size() > 2)
            {
                cross(n1_a, n2_a, cprod_1);
                cross(n1_b, n2_b, cprod_2);

                if (dot(cprod_1, cprod_2) < 0.0f)
                    return false;
            }

            for (unsigned int i = 0; i < 3; ++i)
            {
                n2_a[i] = n1_a[i];
                n2_b[i] = n1_b[i];
            }
        }

        current_halfedge = walk_CW(current_halfedge, halfedges);
        
        if (current_halfedge == -1)
            return false;
    }
    while (current_halfedge != e);


    //discard split-vertices that will introduce high degrees
    if (halfedges_around_tip.size() + halfedges_around_base.size() - 2 > 10)
        return false;


    unsigned int edge_idx_1, edge_idx_2;
    unsigned int va, vb;

    //discard split-vertices which would introduce degenerated triangles
    for (unsigned int i = 0; i < halfedges_around_tip.size(); ++i)
    {
        edge_idx_1 = halfedges_around_tip.at(i);
        va         = halfedges.at(nextHalfEdgeIdx(edge_idx_1)).v;

        for (unsigned int j = 0; j < halfedges_around_base.size(); ++j)
        {
            edge_idx_2 = halfedges_around_base.at(j);
            vb         = halfedges.at(nextHalfEdgeIdx(edge_idx_2)).v;

            //common vertices of neighboured halfedges shall form a valid triangle with the halfedge
            if (va == vb)
            {
                if (nextHalfEdgeIdx(edge_idx_1) != halfedges.at(edge_idx_2).twin &&
                    nextHalfEdgeIdx(edge_idx_2) != halfedges.at(edge_idx_1).twin   )
                    return false;
            }

            //no 'opposite' edges within a quadrilateral may be collapsed at the same time
            const std::vector<unsigned int> & adjacent_halfedges = adjacency[va];

            for (std::vector<unsigned int>::const_iterator it = adjacent_halfedges.begin(), end = adjacent_halfedges.end();
                 it != end; ++it)
            {
                if (vb == halfedges.at(nextHalfEdgeIdx(*it)).v                                                         &&
                    (halfedges.at(*it).state                == MARKED_FOR_COLLAPSE                                  ||
                     halfedges.at(*it).twin != -1 && halfedges.at(halfedges.at(*it).twin).state == MARKED_FOR_COLLAPSE)  )
                {
                    return false;
                }
            }
        }
    }
    
    return true;
}


void ModelGeometry::simplify()
{
    printf("Starting simplification analysis ...\n");


    //1. Analyse the model and assign an error value to each vertex

    //find error values for the potential edge collapses    
    std::vector<Quadric> error_metrics;

    error_metrics.resize(vertex_data->size());

    bool * set_up = (bool *) malloc(sizeof(bool) * vertex_data->size());
    for (unsigned int i = 0; i < vertex_data->size(); ++i)
        set_up[i] = false;

    const std::vector<Vertex> & v_data = *vertex_data;

    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        unsigned int v = halfedges.at(i).v;

        if (!set_up[v])
        {
            Quadric metric;


            //start with the triangle which belongs to the half-edge
            const Vertex & p0 = vertex_data->at(halfedges.at(prevHalfEdgeIdx(i)).v);
            const Vertex & p1 = vertex_data->at(v);
            const Vertex & p2 = vertex_data->at(halfedges.at(nextHalfEdgeIdx(i)).v);
            
            float t1[] = {p0.x, p0.y, p0.z};
            float t2[] = {p1.x, p1.y, p1.z};
            float t3[] = {p2.x, p2.y, p2.z};

            metric.set(t1, t2, t3);

            //add neighboured triangles
            //(this goes just around one direction, so it might ignore some triangles near borders)
            int e_next = walk_CCW(i, halfedges);

            Quadric otherMetric;

            while (e_next != i && e_next != -1)
            {   
                const Vertex & p0 = vertex_data->at(halfedges.at(prevHalfEdgeIdx(e_next)).v);
                const Vertex & p1 = vertex_data->at(halfedges.at(e_next).v);
                const Vertex & p2 = vertex_data->at(halfedges.at(nextHalfEdgeIdx(e_next)).v);

                float f1[] = {p0.x, p0.y, p0.z};
                float f2[] = {p1.x, p1.y, p1.z};
                float f3[] = {p2.x, p2.y, p2.z};

                otherMetric.set(f1, f2, f3);

                metric.add(otherMetric);

                e_next = walk_CCW(e_next, halfedges);
            }


            error_metrics[v] = metric;

            set_up[v] = true;
        }
    }

    free(set_up);


    //2. Use the error information to decide which vertices shall be collapsed

    std::vector<ErrorInfo> errors;
    Quadric q;

    unsigned int v0, v1;
    float collapsed_edge[3];

    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        v0 = halfedges.at(i).v;
        v1 = halfedges.at(nextHalfEdgeIdx(i)).v;

        const Vertex & c = vertex_data->at(v1);

        collapsed_edge[0] = c.x;
        collapsed_edge[1] = c.y;
        collapsed_edge[2] = c.z; 

        ErrorInfo e;
        e.halfedge_index = i;

        q.reset();
        q.add(error_metrics.at(v0));
        q.add(error_metrics.at(v1));

        e.error_value = q.error(collapsed_edge);

        errors.push_back(e);
    }

    std::sort(errors.begin(), errors.end());

    printf("Determined error values, checking collapse candidates ... \n");

    //pick the best edge collapses
    unsigned int halfedge_index, num_collapses = 0;

    const unsigned int max_collapses = vertex_data->size() / 2;

    for (unsigned int i = 0; i < errors.size() && num_collapses < max_collapses; ++i)
    {
        halfedge_index = errors.at(i).halfedge_index;

        if (can_be_collapsed(halfedge_index, halfedges))
        {
            halfedges.at(halfedge_index).state = MARKED_FOR_COLLAPSE;
            
            ++num_collapses;
        }
    }

    printf("Prepared %d collapses, collapsing edges ...\n", num_collapses);


    //3. Perform the actual edge collapses

    unsigned int * vertex_id_map = (unsigned int *) malloc(vertex_data->size() * sizeof(unsigned int));

    for (unsigned int i = 0; i < vertex_data->size(); ++i)
        vertex_id_map[i] = i;

    unsigned int prev_halfedge, next_halfedge,
                 twin_prev_halfedge, twin_next_halfedge;
    
    int coll_1, coll_2, coll_3, coll_4;

    int twin;

    unsigned int v_old, v_new;

    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        if (halfedges.at(i).state == MARKED_FOR_COLLAPSE)
        {
            prev_halfedge = prevHalfEdgeIdx(i);
            next_halfedge = nextHalfEdgeIdx(i);


            //collapse this half-edge
            halfedges.at(i).state             = COLLAPSED;
            halfedges.at(prev_halfedge).state = COLLAPSED;
            halfedges.at(next_halfedge).state = COLLAPSED;


            //collapse the twin of this half-edge
            twin = halfedges.at(i).twin;
            assert(twin != -1);

            twin_prev_halfedge = prevHalfEdgeIdx(twin);
            twin_next_halfedge = nextHalfEdgeIdx(twin);

            halfedges.at(twin).state               = COLLAPSED;
            halfedges.at(twin_prev_halfedge).state = COLLAPSED;
            halfedges.at(twin_next_halfedge).state = COLLAPSED;


            //track vertex index change
            v_old = halfedges.at(i).v;
            v_new = halfedges.at(next_halfedge).v;

            vertex_id_map[v_old] = v_new;


            //assign twin changes
            coll_1 = halfedges.at(next_halfedge).twin;
            coll_2 = halfedges.at(prev_halfedge).twin;

            assert(coll_1 != -1);
            halfedges.at(coll_1).twin = coll_2;

            assert(coll_2 != -1);
            halfedges.at(coll_2).twin = coll_1;

            coll_3 = halfedges.at(twin_next_halfedge).twin;
            coll_4 = halfedges.at(twin_prev_halfedge).twin;

            assert(coll_3 != -1);
            halfedges.at(coll_3).twin = coll_4;

            assert(coll_4 != -1);
            halfedges.at(coll_4).twin = coll_3;

            
            //double-check:
            //make sure that never more than two vertices are collapsed into one during one batch
            int checked_edge = coll_2;
            do
            {
                assert(halfedges.at(checked_edge).state == UNCHANGED);                
                checked_edge = walk_CCW(checked_edge, halfedges);
            }
            while (checked_edge != coll_2);

            checked_edge = coll_4;
            do
            {
                assert(halfedges.at(checked_edge).state == UNCHANGED);                
                checked_edge = walk_CCW(checked_edge, halfedges);
            }
            while (checked_edge != coll_4);


            //store edge collapse info
            EdgeCollapse coll;

            coll.v  = v_new;
            coll.e1 = coll_2;
            coll.e2 = coll_4;
            coll.dx = vertex_data->at(v_old).x - vertex_data->at(v_new).x;
            coll.dy = vertex_data->at(v_old).y - vertex_data->at(v_new).y;
            coll.dz = vertex_data->at(v_old).z - vertex_data->at(v_new).z;

            collapses.push_back(coll);
        }
    }


    //clear adjacency information
    adjacency.clear();


    for (unsigned int i = 0; i < halfedges.size(); ++i)
    {
        halfedges.at(i).v = vertex_id_map[halfedges.at(i).v];

        //rewrite adjacency information
        if (halfedges.at(i).state == UNCHANGED)
        {
            std::vector<unsigned int> & adjacent_halfedges = adjacency[halfedges.at(i).v];
            adjacent_halfedges.push_back(i);
        }

    }

    printf("Performed %d edge collapses.\n", collapses.size());

    //sort collapses by vertex id - this is important for decoding!
    std::sort(collapses.begin(), collapses.end());

    free(vertex_id_map);
    
    errors.clear();
}


void ModelGeometry::refine()
{
    printf("Starting refinement ...\n");

    Vertex v_old;

    Halfedge h;

    unsigned int ta_e0, ta_e1, ta_e2,
                 tb_e0, tb_e1, tb_e2;

    unsigned int n;

    int current_edge;

    //for (int i = collapses.size() - 1; i >= 0; --i)
    for (int i = 0; i < collapses.size(); ++i)
    {
        const EdgeCollapse & c = collapses.at(i);

        assert(c.v < vertex_data->size());
        

        //add a new vertex
        const Vertex & v_split = vertex_data->at(c.v);

        v_old.x = v_split.x + c.dx;
        v_old.y = v_split.y + c.dy;
        v_old.z = v_split.z + c.dz;

        vertex_data->push_back(v_old);
        
        
        //add two new triangles (-> 6 new half-edges)
        n = halfedges.size();

        ta_e0 = n;
        ta_e1 = n+1;
        ta_e2 = n+2;

        tb_e0 = n+3;
        tb_e1 = n+4;
        tb_e2 = n+5;

        h.state = UNCHANGED;

        h.v    = vertex_data->size() - 1;
        h.twin = tb_e0;
        halfedges.push_back(h); //halfedge from ta_e0
        
        h.v    = c.v;
        h.twin = halfedges.at(c.e1).twin;
        halfedges.push_back(h); //halfedge from ta_e1

        h.v    = halfedges.at(halfedges.at(c.e1).twin).v;
        h.twin = c.e1;
        halfedges.push_back(h); //halfedge from ta_e2

        h.v    = c.v;
        h.twin = ta_e0;
        halfedges.push_back(h); //halfedge from tb_e0
   
        h.v    = vertex_data->size() - 1;
        h.twin = halfedges.at(c.e2).twin; 
        halfedges.push_back(h); //halfedge from tb_e1
                                                 
        h.v    = halfedges.at(halfedges.at(c.e2).twin).v;                               
        h.twin = c.e2;
        halfedges.push_back(h); //halfedge from tb_e2

        //don't forget to update existing halfedges that changed
        halfedges.at(halfedges.at(c.e1).twin).twin = ta_e1;
        halfedges.at(c.e1).twin                    = ta_e2;

        halfedges.at(halfedges.at(c.e2).twin).twin = tb_e1;
        halfedges.at(c.e2).twin                    = tb_e2;

        
        //assign new vertex to neighboured halfedges
        current_edge = c.e1;

        while (current_edge != tb_e1)
        {
            halfedges.at(current_edge).v = vertex_data->size() - 1;
            
            current_edge = walk_CCW(current_edge, halfedges);
        }
    }

    printf("Performed %d vertex splits.\n", collapses.size());
}


void ModelGeometry::get_triangles(std::vector<Triangle> & triangles, std::vector<Vertex> & new_vertex_data)
{
    unsigned int * offsets = (unsigned int *) calloc(vertex_data->size(), sizeof(unsigned int));
        
    for (unsigned int i = 0; i < halfedges.size(); i += 3)
    {     
        const Halfedge & h0 = halfedges.at(i);
        const Halfedge & h1 = halfedges.at(i+1);
        const Halfedge & h2 = halfedges.at(i+2);

        if (h0.state == UNCHANGED &&
            h1.state == UNCHANGED &&
            h2.state == UNCHANGED   )
        {
            offsets[h0.v] = 1; //mark as used
            offsets[h1.v] = 1;
            offsets[h2.v] = 1;
        }
    }
    
    unsigned int offset = 0;

    for (unsigned int i = 0; i < vertex_data->size(); ++i)
    {
        if (offsets[i])
        {
            const Vertex & v = vertex_data->at(i);
            new_vertex_data.push_back(v);
            
            ++offset;

            offsets[i] = offset;
        }
    }

    for (unsigned int i = 0; i < halfedges.size(); i += 3)
    {
        const Halfedge & h0 = halfedges.at(i);
        const Halfedge & h1 = halfedges.at(i+1);
        const Halfedge & h2 = halfedges.at(i+2);

        if (h0.state == UNCHANGED &&
            h1.state == UNCHANGED &&
            h2.state == UNCHANGED   )
        {
            Triangle t;
            t.v0 = offsets[h0.v] - 1;
            t.v1 = offsets[h1.v] - 1;
            t.v2 = offsets[h2.v] - 1;

            triangles.push_back(t);
        }
    }

    free(offsets);
}


void ModelGeometry::compute_local_edge_indices()
{
    int e, e_next;

    std::vector<unsigned int> cutedge_indices;
    unsigned int v, v_min;
    unsigned int min_idx;

    for (std::vector<EdgeCollapse>::iterator it = collapses.begin(), end = collapses.end();
         it != end; ++it)
    {
        e      = it->e1;
        e_next = nextHalfEdgeIdx(e);

        v_min   = INT_MAX;
        min_idx = 0;
        
        cutedge_indices.clear();
        cutedge_indices.push_back(e);

        while (e != it->e2)
        {
            assert(e != -1 && e_next != -1);

            v = halfedges.at(e_next).v;

            if (v < v_min)
            {
                v_min   = v;
                min_idx = cutedge_indices.size() - 1;
            }

            assert(halfedges.at(e).state == UNCHANGED);

            cutedge_indices.push_back(e);

            e = walk_CCW(e, halfedges);
            e_next = nextHalfEdgeIdx(e);
        }

        while (e != it->e1)
        {
            assert(e != -1 && e_next != -1);

            v = halfedges.at(e_next).v;

            if (v < v_min)
            {
                v_min   = v;
                min_idx = cutedge_indices.size() - 1;
            }

            assert(halfedges.at(e).state == UNCHANGED);

            cutedge_indices.push_back(e);

            e = walk_CCW(e, halfedges);
            e_next = nextHalfEdgeIdx(e);
        }

        it->a = INT_MAX;
        it->b = INT_MAX;

        for (unsigned int i = min_idx; i < min_idx + cutedge_indices.size(); ++i)
        {
          if (cutedge_indices.at(i % cutedge_indices.size()) == it->e1)
            it->a = i-min_idx;
          else if (cutedge_indices.at(i % cutedge_indices.size()) == it->e2)
            it->b = i-min_idx;
        }

        assert(it->a != INT_MAX && it->b != INT_MAX);
    }
}


void ModelGeometry::compute_global_edge_indices()
{
    int e, e_next;

    std::vector<unsigned int> cutedge_indices;
    
    unsigned int v_min, min_idx;

    for (std::vector<EdgeCollapse>::iterator it = collapses.begin(), end = collapses.end();
         it != end; ++it)
    {
        const std::vector<unsigned int> & adjacent_halfedges = adjacency[it->v];
        
        if (adjacent_halfedges.size())
        {
            e = adjacent_halfedges.at(0);

            v_min   = INT_MAX;
            min_idx = 0;

            cutedge_indices.clear();

            for (unsigned int i = 0; i < adjacent_halfedges.size(); ++i)
            {
                cutedge_indices.push_back(e);

                e_next = nextHalfEdgeIdx(e);

                assert(e_next != -1);

                if (halfedges.at(e_next).v < v_min)
                {
                    v_min   = halfedges.at(e_next).v;
                    min_idx = i;
                }

                e = walk_CCW(e, halfedges);

                assert(e != -1);
            }

            it->e1 = cutedge_indices.at((min_idx + it->a) % adjacent_halfedges.size());
            it->e2 = cutedge_indices.at((min_idx + it->b) % adjacent_halfedges.size());
        }
        else
        {
            printf("ERROR: At least one split-vertex does not exist yet.\n");
            return;
        }
    }
}


void ModelGeometry::write_collapses(const char * filename)
{   
    FILE * f = fopen(filename, "w");

    if (!f)
    {
        printf("Error: cannot open file %s for writing.", filename);
        return;
    }
  
    //transform global edge indices to local edges indices
    compute_local_edge_indices();

    
    //transform vertex indices to discard unused vertices
    unsigned char * used = (unsigned char *) calloc(vertex_data->size(), sizeof(unsigned char));

    for (unsigned int i = 0; i <halfedges.size(); i+=3)
    {
        const Halfedge & h0 = halfedges.at(i);
        const Halfedge & h1 = halfedges.at(i+1);
        const Halfedge & h2 = halfedges.at(i+2);

        if (h0.state == UNCHANGED &&
            h1.state == UNCHANGED &&
            h2.state == UNCHANGED   )
        {
            used[h0.v] = 1;
            used[h1.v] = 1;
            used[h2.v] = 1;
        }
    }

    unsigned int idx = 0;
    unsigned int * new_indices = (unsigned int *) malloc(vertex_data->size() * sizeof(unsigned int));

    for (unsigned int i = 0; i < vertex_data->size(); ++i)
        if (used[i])
            new_indices[i] = idx++;

    free(used);


    //transform edge indices to discard unused edges
    unsigned int * new_indices_edges = (unsigned int *) malloc(halfedges.size() * sizeof(unsigned int));

    idx = 0;
    for (unsigned int i = 0; i < halfedges.size(); i+=3)
    {
        const Halfedge & h0 = halfedges.at(i);
        const Halfedge & h1 = halfedges.at(i+1);
        const Halfedge & h2 = halfedges.at(i+2);

        if (h0.state == UNCHANGED &&
            h1.state == UNCHANGED &&
            h2.state == UNCHANGED   )
        {
            new_indices_edges[i]   = idx;
            new_indices_edges[i+1] = idx+1;
            new_indices_edges[i+2] = idx+2;
            idx += 3;
        }
    }

    //write collapses
    for (std::vector<EdgeCollapse>::const_iterator it = collapses.begin(), end = collapses.end();
         it != end; ++it)
    {   
        //fprintf(f, "%d %d %d %f %f %f \n", new_indices[it->v], it->a, it->b, it->dx, it->dy, it->dz);
        fprintf(f, "%d %d %d %f %f %f \n", new_indices[it->v], new_indices_edges[it->e1], new_indices_edges[it->e2], it->dx, it->dy, it->dz);

        if (halfedges.at(it->e1).state != UNCHANGED ||
            halfedges.at(it->e2).state != UNCHANGED   )
            printf("ERROR: A stored cut-edge refers to an already collapsed half-edge!\n");
    }

    free(new_indices);

    fclose(f);
}


void ModelGeometry::read_collapses(const char * filename)
{
    printf("Reading collapses ...\n");

    FILE * f = fopen(filename, "r");

    if (!f)
    {
        printf("Error: cannot open file %s for reading.", filename);
        return;
    }

    collapses.clear();
    
    EdgeCollapse coll;

    //while (fscanf(f, "%d %d %d %f %f %f \n", &coll.v, &coll.a, &coll.b, &coll.dx, &coll.dy, &coll.dz) != EOF)
    while (fscanf(f, "%d %d %d %f %f %f \n", &coll.v, &coll.e1, &coll.e2, &coll.dx, &coll.dy, &coll.dz) != EOF)
    {   
        collapses.push_back(coll);
    }

    //transform local edge indices to global edges indices
    //compute_global_edge_indices();

    fclose(f);

    printf("Read %d collapses.\n", collapses.size());
}
