#include <map>
#include <vector>


//assume triangles only
inline unsigned int nextHalfEdgeIdx(unsigned int i)
{
    return ((i % 3) == 2) ? (i - 2) : (i + 1);
}

inline unsigned int prevHalfEdgeIdx(unsigned int i)
{
    return ((i % 3) == 0) ? (i + 2) : (i - 1);
}

typedef std::map<unsigned int, std::vector<unsigned int> > AdjacencyMap;

struct Edge
{
    unsigned int v0;
    unsigned int v1;

    unsigned int id;

    bool operator<(const Edge & other) const
    {
        unsigned int a0 = std::min<unsigned int>(v0, v1);
        unsigned int a1 = std::max<unsigned int>(v0, v1);

        unsigned int b0 = std::min<unsigned int>(other.v0, other.v1);
        unsigned int b1 = std::max<unsigned int>(other.v0, other.v1);

        return a0 < b0 || a0 == b0 && a1 < b1;
    }

    bool hasSameVerts(const Edge & other) const
    {
        return v0 == other.v0 && v1 == other.v1 ||
               v0 == other.v1 && v1 == other.v0;
    }
};


enum HalfedgeState
{
    UNCHANGED,
    MARKED_FOR_COLLAPSE,
    COLLAPSED
};


struct Halfedge
{
    unsigned int v;
    int twin;
    HalfedgeState state;    
};


struct Vertex
{
	float x, y, z;
};


struct Triangle
{
	unsigned int v0, v1, v2,
				 n0, n1, n2;
};


struct EdgeCollapse
{
    unsigned int v;         //vertex
    unsigned int e1, e2;    //edges (global)
    unsigned int a, b;      //edges (local)

    float dx, dy, dz;       //difference vector

    bool operator<(const EdgeCollapse & other) const
    {
        return v < other.v;
    }
};


class ModelGeometry 
{
public:
    void add_triangle(unsigned int v0, unsigned int v1, unsigned int v2);

    void set_vertex_data(std::vector<Vertex> * data);

    void create_half_edges();

    void simplify();

    void refine();

    void get_triangles(std::vector<Triangle> & triangles, std::vector<Vertex> & new_vertex_data);
    
    void compute_local_edge_indices();

    void compute_global_edge_indices();

    void write_collapses(const char * filename);

    void read_collapses(const char * filename);

private:
    bool can_be_collapsed(unsigned int e, const std::vector<Halfedge> & halfedges);

    void get_normal(unsigned int vp, unsigned int vq, unsigned int vr, float n[3]);

    AdjacencyMap adjacency;

    std::vector<Halfedge> halfedges;

    std::vector<Edge> edges;

    std::vector<Vertex> * vertex_data;

    std::vector<EdgeCollapse> collapses;
};
