#include "ModelHandler.h"


int main(int argc, char * argv[])
{
	if (argc < 2)
	{
		printf("\nUsage:\n%s [triangulated_model_file_name.obj]\n", argv[0]);
		return -1;
    }

    ModelHandler m;
    m.read_OBJ(argv[1]);
    
    char filename[64];
    unsigned int i = 8;

    do
    {
        sprintf(filename, "../data/collapses_%d.coll", i);

        m.get_geometry().read_collapses(filename);

        m.uncompress_model();

        m.update();

        sprintf(filename, "../data/refined_%d.obj", (8-i)+1);

        m.write_OBJ(filename);
    }
    while (--i > 7);

	return 0;
}
