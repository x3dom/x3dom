#include "Fields.h"

Vec3f operator-(const Vec3f& lhs, const Vec3f& rhs)
{
	return Vec3f(lhs._values[0] - rhs._values[0],lhs._values[1] - rhs._values[1], lhs._values[2] - rhs._values[2]);
};

Vec3f operator+(const Vec3f& lhs, const Vec3f& rhs)
{
	return Vec3f(lhs._values[0] + rhs._values[0],lhs._values[1] + rhs._values[1], lhs._values[2] + rhs._values[2]);
};