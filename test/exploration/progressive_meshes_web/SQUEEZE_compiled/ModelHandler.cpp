#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <float.h>
#include <math.h>

#include <algorithm>

#include "ModelHandler.h"


Triangle make_Triangle(unsigned int v0, unsigned int v1, unsigned int v2,
					   unsigned int n0, unsigned int n1, unsigned int n2)
{
	Triangle t;
	t.v0 = v0; t.v1 = v1; t.v2 = v2;
	t.n0 = n0; t.n1 = n1; t.n2 = n2;
	return t;
}


void read_vertex(char * str, std::vector<Vertex> & list)
{
	Vertex v;
	
	v.x = atof(str);
	str = strchr(str, ' ') + 1;
	v.y = atof(str);
	str = strchr(str, ' ') + 1;
	v.z = atof(str);
	
	list.push_back(v);
}


void read_normal(char * str, std::vector<Vertex> & list)
{
	read_vertex(str, list);
}


void read_face(char * str, std::vector<Triangle> & list)
{
    static bool use_normals = false;
    static bool checked     = false;

	Triangle t;
	
	t.v0 = atoi(str);

    if (!checked)
    {
        use_normals = (strchr(str, '/') != 0);
        checked     = true;
    }

    if (use_normals)
    {
        if (use_normals)
	    str  = strchr(str, '/') + 2;
	    t.n0 = atoi(str);
    }
	str  = strchr(str, ' ') + 1;
	
	t.v1 = atoi(str);
	if (use_normals)
    {
        str  = strchr(str, '/') + 2;
	    t.n1 = atoi(str);
    }
	str  = strchr(str, ' ') + 1;
	
	t.v2 = atoi(str);	
	if (use_normals)
    {
        str  = strchr(str, '/') + 2;
	    t.n2 = atoi(str);
    }
	str  = strchr(str, ' ') + 1;
	
	list.push_back(t);
}


int ModelHandler::read_OBJ(const char * filename)
{
	FILE * object_file_handle = fopen(filename, "r");
	
	if (object_file_handle)
	{
		printf("Reading object file.\n");
		
		char * line = (char *) malloc(sizeof(char) * 49);
		
		Vertex min_coord;
		Vertex max_coord;
		
		min_coord.x =  FLT_MAX; min_coord.y =  FLT_MAX; min_coord.z =  FLT_MAX;		
		max_coord.x = -FLT_MAX; max_coord.y = -FLT_MAX; max_coord.z = -FLT_MAX;		
		
		while(fgets(line, 50, object_file_handle))
		{
			if (line[0] == 'v')
			{
				if (line[1] != 'n')
				{
					read_vertex(line + 2, vertex_data);
					
					const Vertex & v = vertex_data[vertex_data.size() - 1];
					
					min_coord.x = std::min<float>(min_coord.x, v.x);
					min_coord.y = std::min<float>(min_coord.y, v.y);
					min_coord.z = std::min<float>(min_coord.z, v.z);
					
					max_coord.x = std::max<float>(max_coord.x, v.x);
					max_coord.y = std::max<float>(max_coord.y, v.y);
					max_coord.z = std::max<float>(max_coord.z, v.z);
				}
				else
				{
					read_normal(line + 3, normal_data);
				}
			}			
			else if (line[0] == 'f')
			{
				read_face(line + 2, face_data);
			}
		}
		
		free(line);
		
		fclose(object_file_handle);
		
		printf("Read %d vertices and %d triangles.\n", vertex_data.size(), face_data.size());		
		
        printf("Bounding box data: \n [%f %f %f] - [%f %f %f]\n", min_coord.x, min_coord.y, min_coord.z,
                                                                  max_coord.x, max_coord.y, max_coord.z);
    }
	else
	{
		printf("Cannot open file \"%s\".\n", filename);
        return 1;
	}
    
    geometry.set_vertex_data(&vertex_data);

    for (std::vector<Triangle>::const_iterator it = face_data.begin(), end = face_data.end(); it != end; ++it)
    {
        //attention: the evil OBJ indices start with 1!
        geometry.add_triangle(it->v0 - 1, it->v1 - 1, it->v2 - 1);
    }

    geometry.create_half_edges();

	return 0;
}


int ModelHandler::write_OBJ(const char * filename)
{
    FILE * object_file_handle = fopen(filename, "w");

    if (object_file_handle)
	{
        printf("Writing object file.\n");

        //write vertex positions
        for (std::vector<Vertex>::const_iterator it = vertex_data.begin(), end = vertex_data.end();
             it != end; ++it)
        {
            fprintf(object_file_handle, "v %f %f %f\n", it->x, it->y, it->z);
        }

        //write triangles
        for (std::vector<Triangle>::const_iterator it = face_data.begin(), end = face_data.end();
             it != end; ++it)
        {
            fprintf(object_file_handle, "f %d %d %d\n", it->v0 + 1, it->v1 + 1, it->v2 + 1);
        }

        fclose(object_file_handle);

        return 0;
    }
    else
    {
        return 1;
    }
}


void ModelHandler::compress_model()
{
    geometry.simplify();
}


void ModelHandler::update()
{
    std::vector<Vertex> new_vertex_data;

    face_data.clear();

    geometry.get_triangles(face_data, new_vertex_data);

    vertex_data.clear();

    vertex_data = new_vertex_data;

    printf("Model has now %d vertices and %d triangles.\n", vertex_data.size(), face_data.size());
}


void ModelHandler::uncompress_model()
{
    geometry.refine();
}


const ModelGeometry & ModelHandler::get_geometry() const
{
    return geometry;
}


ModelGeometry & ModelHandler::get_geometry()
{
    return geometry;
}