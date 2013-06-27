#ifndef ABSTRACTSPATIALHIERARCHYBASE_H
#define ABSTRACTSPATIALHIERARCHYBASE_H

#include "Fields.h"

extern "C"
{
extern void jsAddDrawableCallback(int id, float coverage);
extern void jsAddHierarchyBoxVolume(float minX, float minY, float minZ, float maxX, float maxY, float maxZ);
}

//----------------------------------------------------------------------------------------------------------------------------------

class AbstractSpatialHierarchyBase
{
public:
	/*
	Data in/output
	*/
	virtual int addDataElement(float xMin, float yMin, float zMin, float xMax, float yMax, float zMax) = 0;
	virtual void removeDataElement(int id) = 0;
	virtual void setDataElementValue(int id, int MinOrMax, int dim, float val) = 0;
	virtual float getDataElementValue(int id, int MinOrMax, int dim) = 0;
	virtual void getHierarchyNodeBoxVolume(int id) = 0;

	//----------------------------------------------------------------------------------------------------------------------------------

	/*
	Hierarchy Operations
	*/
	virtual void buildHierarchy() = 0;
	virtual void updateHierarchy() = 0;
	virtual void setModelViewMatrix(float _00, float _01, float _02, float _03, float _10, float _11, float _12, float _13, 
									float _20, float _21, float _22, float _23, float _30, float _31, float _32, float _33) = 0;
	virtual void setSmallFeatureCullingParams(float pixelHeightAtDistOne, float nearPlaneDist, float threshold) = 0;
	virtual void collectDrawables(ViewFrustum _frustum) = 0;
	
	
	virtual ~AbstractSpatialHierarchyBase(){};
};
#endif