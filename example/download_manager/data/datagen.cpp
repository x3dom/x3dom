#include <stdio.h>
#include <stdlib.h>

void write_chunks(char * fname, int numChunks, float size_factor)
{
	for (int i = 0; i < numChunks; ++i)
	{		
		sprintf(fname + 2, "%03d", i);
		sprintf(fname + 5, ".bin");
		
		FILE * fhandle = fopen(fname, "wb");

		//chunks have each [size_factor] MiB size
		for (int j = 0; j < 1048576 * size_factor; ++j)
		{
			fputc(23, fhandle);
		}
		
		fclose(fhandle);
	}
}


int main(int argc, char * argv[])
{
	if (argc < 3)
	{
		printf("\nusage:\n%s [no_of_chunks] [chunksize_in_mib]\n", argv[0]);
		return -1;
	}
	
	int   numChunks = atoi(argv[1]);
	float chunksize = atof(argv[2]);
	
	char fname[] = {'D', '_', '0', '0', '0',
					'.', 'b', 'i', 'n', '\0'};

	write_chunks(fname, numChunks, chunksize);
	
	return 0;
}
