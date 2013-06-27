#ifndef FIELDS_H
#define FIELDS_H

#include <math.h>

//----------------------------------------------------------------------------------------------------------------------------------

class Vec3f
{
public:
	float _values[3];

	//----------------------------------------------------------------------------------------------------------------------------------

	Vec3f()
	{
		this->_values[0] = this->_values[1] = this->_values[2] = 0;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	Vec3f(float x, float y, float z)
	{
		this->_values[0] = x;
		this->_values[1] = y;
		this->_values[2] = z;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	float length() const
	{
		return sqrtf(this->_values[0]* this->_values[0] + this->_values[1] * this->_values[1] + this->_values[2] * this->_values[2]);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	float dot(Vec3f& rhs) const
	{
		 return (this->_values[0]* rhs._values[0] + this->_values[1]*rhs._values[1] + this->_values[2] * rhs._values[2]);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	const float& operator[] (int x) const { return this->_values[x]; }
	float& operator[] (int x) { return this->_values[x]; }
};

Vec3f operator-(const Vec3f& lhs, const Vec3f& rhs);
Vec3f operator+(const Vec3f& lhs, const Vec3f& rhs);

//----------------------------------------------------------------------------------------------------------------------------------

class BoxVolume
{
private:
	Vec3f _vecs[2];
	Vec3f _center;
	Vec3f _radialVec;
	int _longestAxis;

	void calcLongestAxis()
	{
		const Vec3f& min = this->_vecs[0];
		const Vec3f& max = this->_vecs[1];

		float val = fabs(max[0] - min[0]);
		float difY = fabs(max[1] - min[1]);
		float difZ = fabs(max[2] - min[2]);

		this->_longestAxis = 0;
		if(difY > val)
		{
			val = difY;
			this->_longestAxis = 1;
		}
		if(difZ > val)
			this->_longestAxis = 2;
	}

public:
	
	//----------------------------------------------------------------------------------------------------------------------------------

	BoxVolume(){}

	//----------------------------------------------------------------------------------------------------------------------------------
	BoxVolume(float xMin, float yMin, float zMin, float xMax, float yMax, float zMax)
	{
		this->_vecs[0] = Vec3f(xMin, yMin, zMin);
		this->_vecs[1] = Vec3f(xMax, yMax, zMax);
		this->update();
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	const Vec3f& operator[] (int x) const { return this->_vecs[x]; }
	Vec3f& operator[] (int x) { return this->_vecs[x]; }

	//----------------------------------------------------------------------------------------------------------------------------------

	BoxVolume(const BoxVolume& other)
	{
		this->_vecs[0] = other._vecs[0];
		this->_vecs[1] = other._vecs[1];
		this->_center = other._center;
		this->_radialVec = other._radialVec;
		this->_longestAxis = other._longestAxis;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	~BoxVolume(){}

	void update()
	{
		this->_center =  Vec3f(
			(this->_vecs[1][0] + this->_vecs[0][0]) * 0.5f,
			(this->_vecs[1][1] + this->_vecs[0][1]) * 0.5f,
			(this->_vecs[1][2] + this->_vecs[0][2]) * 0.5f);
	
		this->_radialVec = (this->_vecs[1] - this->_vecs[0]);

		this->calcLongestAxis();
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	inline Vec3f getCenter() const
	{
		return this->_center;
	}

	//----------------------------------------------------------------------------------------------------------------------------------
	
	inline int getLongestAxis() const
	{
		return this->_longestAxis;
	}

	//----------------------------------------------------------------------------------------------------------------------------------


	inline Vec3f getRadialVec() const
	{
		return this->_radialVec;
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	inline void getMinMax(int axis, float& min, float& max)
	{
		min = this->_vecs[0][axis];
		max = this->_vecs[1][axis];
	}

};

//----------------------------------------------------------------------------------------------------------------------------------

class DataElement
{
public:
	int _id;
	bool _active;
	BoxVolume _volume;

	//----------------------------------------------------------------------------------------------------------------------------------

	DataElement()
		:_id(-1),_volume(BoxVolume()){}

	//----------------------------------------------------------------------------------------------------------------------------------

	DataElement(int id, BoxVolume volume)
		:_id(id), _volume(volume)
	{}
};

//----------------------------------------------------------------------------------------------------------------------------------

class ViewFrustum
{
private:
	float _planeDistances[6];
	Vec3f _planeNormals[6];
	int _directionIndex[6];

	//----------------------------------------------------------------------------------------------------------------------------------

	int updateDirectionIndex(Vec3f normalVec) {
		int ind = 0;
		if (normalVec[0] > 0) ind |= 1;
		if (normalVec[1] > 0) ind |= 2;
		if (normalVec[2] > 0) ind |= 4;
		return ind;
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	//Check if the point is in the halfspace
	bool pntIsInHalfSpace(int i, Vec3f point) 
	{
		float s = this->_planeNormals[i].dot(point) - this->_planeDistances[i];
		return (s >= 0);
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	Vec3f setDirectionIndexPoint(int index, const BoxVolume* volume) 
	{
		Vec3f min = (*volume)[0], max = (*volume)[1];
		Vec3f pnt(0, 0, 0);
		if (index & 1) { pnt[0] = min[0]; }
		else           { pnt[0] = max[0]; }
		if (index & 2) { pnt[1] = min[1]; }
		else           { pnt[1] = max[1]; }
		if (index & 4) { pnt[2] = min[2]; }
		else           { pnt[2] = max[2]; }
		return pnt;
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	//Check if the box formed by min/max is fully inside the halfspace
	bool isInHalfSpace(int i, const BoxVolume* _volume) 
	{
		Vec3f p = setDirectionIndexPoint(this->_directionIndex[i], _volume);
		return pntIsInHalfSpace(i, p);
	};

	//----------------------------------------------------------------------------------------------------------------------------------

	//Check if the box formed by min/max is fully outside the halfspace
	bool isOutHalfSpace(int i, const BoxVolume* _volume) 
	{
		Vec3f p = setDirectionIndexPoint(this->_directionIndex[i] ^ 7,_volume);
		return !pntIsInHalfSpace(i, p);
	};
	
	//----------------------------------------------------------------------------------------------------------------------------------
	
public:
	ViewFrustum(float _00, float _01, float _02, float _03,
				float _10, float _11, float _12, float _13,
				float _20, float _21, float _22, float _23,
				float _30, float _31, float _32, float _33,
				float _40, float _41, float _42, float _43,
				float _50, float _51, float _52, float _53)
	{
		for (int i = 0; i < 6; i++) 
		{
			this->_planeDistances[i] = 0;
			this->_directionIndex[i] = 0;
		}
		// right
		this->_planeNormals[3] = Vec3f(_30,_31,_32);
		this->_planeDistances[3] = _33;
		this->_directionIndex[3] = updateDirectionIndex(this->_planeNormals[3]);

		// left
		this->_planeNormals[2] = Vec3f(_20,_21,_22);
		this->_planeDistances[2] = _23;
		this->_directionIndex[2] = updateDirectionIndex(this->_planeNormals[2]);

		// bottom
		this->_planeNormals[5] = Vec3f(_50,_51,_52);
		this->_planeDistances[5] = _53;
		this->_directionIndex[5] = updateDirectionIndex(this->_planeNormals[5]);

		// top
		this->_planeNormals[4] = Vec3f(_40,_41,_42);
		this->_planeDistances[4] = _43;
		this->_directionIndex[4] = updateDirectionIndex(this->_planeNormals[4]);

		// near
		this->_planeNormals[0]= Vec3f(_00,_01,_02);
		this->_planeDistances[0] = _03;
		this->_directionIndex[0] = updateDirectionIndex(this->_planeNormals[0]);

		// far
		this->_planeNormals[1]= Vec3f(_10,_11,_12);
		this->_planeDistances[1] = _13;
		this->_directionIndex[1] = updateDirectionIndex(this->_planeNormals[1]);
	}

	//----------------------------------------------------------------------------------------------------------------------------------

	int intersect(const BoxVolume* volume, int planeMask)
	{
		//Check each point of the box to the 6 planes
		int mask = 1;
		if (planeMask < 0) planeMask = 0;

		for (int i = 0; i < 6; i++, mask<<=1) {
			if ((planeMask & mask) != 0)
				continue;

			if (isOutHalfSpace(i,volume))
				return -1;

			if (isInHalfSpace(i, volume))
				planeMask |= mask;
		}

		return planeMask;
	}
};
#endif
