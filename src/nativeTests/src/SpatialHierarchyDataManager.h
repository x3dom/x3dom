#ifndef SPATIALHIERARCHYDATAMANAGER_H
#define SPATIALHIERARCHYDATAMANAGER_H

#include "AbstractSpatialHierarchyBase.h"

#include <stdio.h>
#include <algorithm>

class SpatialHierarchyDataManager: public AbstractSpatialHierarchyBase
{
protected:
	DataElement * p_dataElements;
	int _poolSize;
	int _currentSize;

	float _modelViewMatrix[4][4];
	float _pixelHeightAtDistOne;
	float _nearPlaneDistance;
	float _smallFeatureTreshold;

	//----------------------------------------------------------------------------------------------------------------------------------

	float calculateCoverage(const BoxVolume& _volume)
	{
		const Vec3f& center = _volume.getCenter();
		float centerZ =   this->_modelViewMatrix[2][0] * center[0] 
		+ this->_modelViewMatrix[2][1] * center[1]
		+ this->_modelViewMatrix[2][2] * center[2] 
		+ this->_modelViewMatrix[2][3];

		const Vec3f& rVec = _volume.getRadialVec();
		float r  = Vec3f(
			this->_modelViewMatrix[0][0] * rVec[0] + this->_modelViewMatrix[0][1] * rVec[1] + this->_modelViewMatrix[0][2] * rVec[2],
			this->_modelViewMatrix[1][0] * rVec[0] + this->_modelViewMatrix[1][1] * rVec[1] + this->_modelViewMatrix[1][2] * rVec[2],
			this->_modelViewMatrix[2][0] * rVec[0] + this->_modelViewMatrix[2][1] * rVec[1] + this->_modelViewMatrix[2][2] * rVec[2]).length();
		float dist = std::max(-centerZ - r,this->_nearPlaneDistance );		
		return (r * 2.0) / (dist * this->_pixelHeightAtDistOne);
	}


	//----------------------------------------------------------------------------------------------------------------------------------

	BoxVolume calcOverallBoundingBox()
	{
		BoxVolume vol;

		for(int i = 0; i < this->_currentSize; ++i)
		{
			BoxVolume& elementVolume = this->p_dataElements[i]._volume;
			vol[0][0] = (elementVolume[0][0] < vol[0][0]) ? elementVolume[0][0] : vol[0][0];
			vol[0][1] = (elementVolume[0][1] < vol[0][1]) ? elementVolume[0][1] : vol[0][1];
			vol[0][2] = (elementVolume[0][2] < vol[0][2]) ? elementVolume[0][2] : vol[0][2];
			vol[1][0] = (elementVolume[1][0] > vol[1][0]) ? elementVolume[1][0] : vol[1][0];
			vol[1][1] = (elementVolume[1][1] > vol[1][1]) ? elementVolume[1][1] : vol[1][1];
			vol[1][2] = (elementVolume[1][2] > vol[1][2]) ? elementVolume[1][2] : vol[1][2];
		}
		return vol;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

private:
	//----------------------------------------------------------------------------------------------------------------------------------

public:
	int addDataElement(float xMin, float yMin, float zMin, float xMax, float yMax, float zMax)
	{
		if(this->_currentSize < this->_poolSize)
		{
			DataElement *element = &(this->p_dataElements[this->_currentSize]);
			element->_id = this->_currentSize;

			element->_volume = BoxVolume(xMin, yMin, zMin, xMax, yMax, zMax);
			return this->_currentSize++;
		}
		else
			return -1;
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	void removeDataElement(int id)
	{
		if(id < this->_currentSize)
		{
			DataElement *last =  &(this->p_dataElements[this->_currentSize-1]);
			DataElement *rem =  &(this->p_dataElements[id]);

			rem->_id = last->_id;
			rem->_active = last->_active;
			rem->_volume = last->_volume;

			this->_currentSize--;
		}
	};
	
	//----------------------------------------------------------------------------------------------------------------------------------

	void setDataElementValue(int id, int MinOrMax, int dim, float val)
	{
		this->p_dataElements[id]._volume[MinOrMax][dim] = val;	
	};
	
	//----------------------------------------------------------------------------------------------------------------------------------

	float getDataElementValue(int id, int MinOrMax, int dim)
	{
		return this->p_dataElements[id]._volume[MinOrMax][dim];
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	void setSmallFeatureCullingParams(float pixelHeightAtDistOne, float nearPlaneDist, float threshold)
	{
		this->_pixelHeightAtDistOne = pixelHeightAtDistOne;
		this->_nearPlaneDistance = nearPlaneDist;
		this->_smallFeatureTreshold = threshold;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	void setModelViewMatrix(float _00, float _01, float _02, float _03, float _10, float _11, float _12, float _13, 
		float _20, float _21, float _22, float _23, float _30, float _31, float _32, float _33)
	{
		this->_modelViewMatrix[0][0] = _00; this->_modelViewMatrix[0][1] = _01; this->_modelViewMatrix[0][2] = _02; this->_modelViewMatrix[0][3] = _03;
		this->_modelViewMatrix[1][0] = _10; this->_modelViewMatrix[1][1] = _11; this->_modelViewMatrix[1][2] = _12; this->_modelViewMatrix[1][3] = _13;
		this->_modelViewMatrix[2][0] = _20; this->_modelViewMatrix[2][1] = _21; this->_modelViewMatrix[2][2] = _22; this->_modelViewMatrix[2][3] = _23;
		this->_modelViewMatrix[3][0] = _30; this->_modelViewMatrix[3][1] = _31; this->_modelViewMatrix[3][2] = _32; this->_modelViewMatrix[3][3] = _33;
	}

	//----------------------------------------------------------------------------------------------------------------------------------


	SpatialHierarchyDataManager(int poolSize)
		:p_dataElements(new DataElement[poolSize]), _poolSize(poolSize),_currentSize(0)
	{

	}

	
};
#endif