#include "AbstractSpatialHierarchyBase.h"
#include "Bih.h"

#include <stdio.h>

AbstractSpatialHierarchyBase* base;

extern "C"
{
	extern void jsAddDrawableCallback(int id, float coverage);
	extern void jsAddHierarchyBoxVolume(float minX, float minY, float minZ, float maxX, float maxY, float maxZ);
	
	//----------------------------------------------------------------------------------------------------------------------------------

	int addDataElement(float xMin, float yMin, float zMin, float xMax, float yMax, float zMax)
	{
		return base->addDataElement(xMin, yMin, zMin, xMax, yMax, zMax);
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	void removeDataElement(int id)
	{
		base->removeDataElement(id);
	}

	//----------------------------------------------------------------------------------------------------------------------------------
	
	void setDataElementValue(int id, int MinOrMax, int dim, float val)
	{
		base->setDataElementValue(id, MinOrMax, dim, val);
	};

	//----------------------------------------------------------------------------------------------------------------------------------


	float getDataElementValue(int id, int MinOrMax, int dim)
	{
		return base->getDataElementValue(id, MinOrMax, dim);
	};
	
	//----------------------------------------------------------------------------------------------------------------------------------
	
	void createSpatialHierarchy(int poolSize)
	{
		if(base != 0)
		{
			delete base;
			base = 0;
		}

		base = new Bih(poolSize);
	}

	//----------------------------------------------------------------------------------------------------------------------------------
	
	void buildHierarchy()
	{
		base->buildHierarchy();
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	void updateHierarchy()
	{
		base->updateHierarchy();
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	void getHierarchyNodeBoxVolume(int id)
	{
		base->getHierarchyNodeBoxVolume(id);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	void setModelViewMatrix(float _00, float _01, float _02, float _03, float _10, float _11, float _12, float _13, 
		float _20, float _21, float _22, float _23, float _30, float _31, float _32, float _33)
	{
		base->setModelViewMatrix(_00,_01,_02,_03,_10,_11,_12,_13,_20,_21,_22,_23,_30,_31,_32,_33);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	void setSmallFeatureCullingParams(float pixelHeightAtDistOne, float nearPlaneDist, float threshold)
	{
		base->setSmallFeatureCullingParams(pixelHeightAtDistOne, nearPlaneDist, threshold);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	void collectDrawables(float _00, float _01, float _02, float _03,
						float _10, float _11, float _12, float _13,
						float _20, float _21, float _22, float _23,
						float _30, float _31, float _32, float _33,
						float _40, float _41, float _42, float _43,
						float _50, float _51, float _52, float _53)
	{
		base->collectDrawables(ViewFrustum( _00, _01, _02, _03,
											_10, _11, _12, _13,
											_20, _21, _22, _23,
											_30, _31, _32, _33,
											_40, _41, _42, _43,
											_50, _51, _52, _53));
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	int main()
	{
		createSpatialHierarchy(10);
		int id1 = addDataElement(-1,-1,-1,1,1,1);
		int id2 = addDataElement(-2,-3,-4,2,3,4);

		float val = getDataElementValue(id2,0,1);

		buildHierarchy();
		//printf("%i %f",id2,val);
		collectDrawables(0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5);
	}
}