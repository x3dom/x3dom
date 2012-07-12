#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <float.h>
#include <math.h>

#include <vector>
#include <algorithm>


//Refinement information
// Bit:			  0    1    2    3    4    5   6    7
// Information: | n1 | n2 | px | px | py | py |pz | pz |
namespace R
{
	const unsigned int Levels    = 8;
	const unsigned int PosOffset = 2;
	const unsigned int NorOffset = 0;
	const unsigned int BitsPos   = 2;
	const unsigned int BitsNor   = 1;
};


struct Vertex
{
	float x, y, z;
};


typedef Vertex  Normal;


struct Triangle
{
	unsigned int v0, v1, v2,
				 n0, n1, n2;
};


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
	Triangle t;
	
	t.v0 = atoi(str);
	str  = strchr(str, '/') + 2;	
	t.n0 = atoi(str);
	str  = strchr(str, ' ') + 1;
	
	t.v1 = atoi(str);
	str  = strchr(str, '/') + 2;
	t.n1 = atoi(str);
	str  = strchr(str, ' ') + 1;
	
	t.v2 = atoi(str);	
	str  = strchr(str, '/') + 2;
	t.n2 = atoi(str);
	str  = strchr(str, ' ') + 1;
	
	list.push_back(t);
}


void computeRefinementData(unsigned char * buffer, unsigned int level,
						   const std::vector<Triangle> & face_data,
						   const std::vector<Vertex	 > & vertex_data,
						   const std::vector<Normal	 > & normal_data,
						   const Vertex & minValue, const Vertex & maxValue)
{
	std::vector<std::pair<Vertex, Normal> > combined_data;

	for (std::vector<Triangle>::const_iterator it = face_data.begin(), end = face_data.end();
		 it != end; ++it)
	{
		combined_data.push_back(std::make_pair<Vertex, Normal>(vertex_data.at(it->v0 - 1), normal_data.at(it->n0 - 1)));
		combined_data.push_back(std::make_pair<Vertex, Normal>(vertex_data.at(it->v1 - 1), normal_data.at(it->n1 - 1)));
		combined_data.push_back(std::make_pair<Vertex, Normal>(vertex_data.at(it->v2 - 1), normal_data.at(it->n2 - 1)));
	}
	
	for (unsigned int i = 0; i < combined_data.size(); ++i)
	{
		unsigned int result = 0x0;
		
		const Vertex & v = combined_data[i].first;
		const Normal & n = combined_data[i].second;
		
		static const unsigned int Max16BitVal = pow(2, 16) - 1;
		
		//normalize vertex data with 16 bit precision
		unsigned int x = ((v.x - minValue.x) / (maxValue.x - minValue.x)) * Max16BitVal;
		unsigned int y = ((v.y - minValue.y) / (maxValue.y - minValue.y)) * Max16BitVal;
		unsigned int z = ((v.z - minValue.z) / (maxValue.z - minValue.z)) * Max16BitVal;
				
		//extract the requested precision level
		unsigned int rightShift = (R::Levels - level - 1) * R::BitsPos;
		unsigned int mask 		= pow(2, R::BitsPos) - 1;
		x >>= rightShift;
		y >>= rightShift;
		z >>= rightShift;
		x &= mask;
		y &= mask;
		z &= mask;		
		
		x <<= (8 - R::PosOffset) - R::BitsPos;
		y <<= (8 - R::PosOffset) - R::BitsPos * 2;
		z <<= (8 - R::PosOffset) - R::BitsPos * 3;
		
		result |= x;
		result |= y;
		result |= z;
		
		//compute polar coordinates, normalize normal data with 8 bit precision
		float theta = acos(n.z);
		float phi   = atan2(n.y, n.x);
		
		theta = (theta 		  /         M_PI ) * 255.0f;
		phi   = ((phi - M_PI) / (2.0f * M_PI)) * 255.0f;
		
		unsigned int theta_i = theta;
		unsigned int phi_i   = phi;
		
		rightShift = (R::Levels - level - 1) * R::BitsNor;		
		mask	   = pow(2, R::BitsNor) - 1;
		theta_i >>= rightShift;
		phi_i   >>= rightShift;
		theta_i &= mask;
		phi_i   &= mask;
		
		theta_i <<= (8 - R::NorOffset) - R::BitsNor;
		phi_i   <<= (8 - R::NorOffset) - R::BitsNor * 2;
		
		result |= theta_i;
		result |= phi_i;

		buffer[i] = result;
	}
}


int main(int argc, char * argv[])
{
	if (argc < 2)
	{
		printf("\nUsage:\n%s [triangulated_model_file_name.obj]\n", argv[0]);
		return -1;
	}
	
	std::vector<Vertex	> vertex_data;
	std::vector<Normal	> normal_data;
	std::vector<Triangle> face_data;

	FILE * object_file_handle = fopen(argv[1], "r");
	
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
		
		if (normal_data.size() != vertex_data.size())
		{
			printf("Incompatible model file: The number of normals (%d) is not equal to the number of vertices (%d). Filling with default values. \n",
				   normal_data.size(), vertex_data.size());
			//return -1;
			Normal n;
			n.x = n.y = 0.0; n.z = 1.0;
			while (normal_data.size() < vertex_data.size())
				normal_data.push_back(n);
			while (normal_data.size() > vertex_data.size())
				vertex_data.push_back(n);
		}
		
		printf("Compositing refinement data ...\n");
		
		unsigned char * refinementBuffers[R::Levels];
		
		for (unsigned int i = 0; i < R::Levels; ++i)
		{
			refinementBuffers[i] = (unsigned char *) malloc(face_data.size() * 3);
			computeRefinementData(refinementBuffers[i], i, face_data, vertex_data, normal_data, min_coord, max_coord);
		}
		
		printf("Writing refinement data to files ...\n");
		
		FILE * data_file_handle = NULL;
		
		char * filename = (char *) malloc(20 * sizeof(char));
		
		for (unsigned int i = 0; i < R::Levels; ++i)
		{
			sprintf(filename, "refinement%02d.bin", i);			
			data_file_handle = fopen(filename, "wb");
			
			for (unsigned int j = 0; j < face_data.size() * 3; ++j)
			{
				fputc(refinementBuffers[i][j], data_file_handle);
			}
			
			fclose(data_file_handle);
		}
		
		free(filename);
	
		
		/*
		printf("Writing 8 bit data to \"refinement0.bin\".\n");
		
		FILE * data_file_handle = fopen("refinement0.bin", "wb");
		
		//[0xD0, 0x91, 0x52, 0x13]
		fputc(0xD0, data_file_handle);
		fputc(0x91, data_file_handle);
		fputc(0x52, data_file_handle);
		fputc(0x13, data_file_handle);
		
		fclose(data_file_handle);
		
		printf("Writing 8 bit data to \"refinement1.bin\".\n");
		
		data_file_handle = fopen("refinement1.bin", "wb");
		
		//[0xE0, 0x61, 0x62, 0x23]
		fputc(0xE0, data_file_handle);
		fputc(0x61, data_file_handle);
		fputc(0x62, data_file_handle);
		fputc(0x23, data_file_handle);
		
		fclose(data_file_handle);
		*/
		
		printf("Done.\n");
			
		for (unsigned int i = 0; i < R::Levels; ++i)
		{
			free(refinementBuffers[i]);
		}
		
	}
	else
	{
		printf("Cannot open file \"%s\".\n", argv[1]);
	}
	
	return 0;
}
