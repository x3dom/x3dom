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

    m.compress_model();

    m.write_OBJ("result.obj");

	return 0;
}
