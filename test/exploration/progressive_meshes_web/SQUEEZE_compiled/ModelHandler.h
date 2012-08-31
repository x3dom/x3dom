#ifndef MODEL_HANDLER_H
#define MODEL_HANDLER_H

#include <vector>

#include "ModelGeometry.h"


typedef Vertex  Normal;


class ModelHandler
{
public:
    int read_OBJ(const char * filename);

    int write_OBJ(const char * filename);

    void compress_model();

    void update();

    void uncompress_model();

    const ModelGeometry & get_geometry() const;

    ModelGeometry & get_geometry();

private:
    std::vector<Vertex	> vertex_data;
    std::vector<Normal	> normal_data;
    std::vector<Triangle> face_data;

    ModelGeometry geometry;

};


#endif
