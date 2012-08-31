#include "ModelHandler.h"


int main(int argc, char * argv[])
{
	if (argc < 2)
	{
		printf("\nUsage:\n%s [triangulated_model_file_name.obj]\n", argv[0]);
		return -1;
    }

    char out_file[64];

    unsigned int i = 0;
    do
    {
        ModelHandler m;

        if (i == 0)
            m.read_OBJ(argv[1]);
        else
            m.read_OBJ(out_file);

        m.compress_model();

        sprintf(out_file, "../data/collapses_%d.coll", i+1);

        m.get_geometry().write_collapses(out_file);

        sprintf(out_file, "../data/simplified_%d.obj", i+1);

        m.update();

        m.write_OBJ(out_file);
    }
    while (++i < 8);

	return 0;
}
