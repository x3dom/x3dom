
#include "Quadric.h"

#include <stdio.h>
#include <math.h>


Quadric::Quadric()
{
  planes = 0;
  quadrix[0][0] = quadrix[0][1] = quadrix[0][2] = quadrix[0][3] = 0.0;
  quadrix[1][0] = quadrix[1][1] = quadrix[1][2] = quadrix[1][3] = 0.0;
  quadrix[2][0] = quadrix[2][1] = quadrix[2][2] = quadrix[2][3] = 0.0;
  quadrix[3][0] = quadrix[3][1] = quadrix[3][2] = quadrix[3][3] = 0.0;
}


void Quadric::reset()
{
  planes = 0;
  quadrix[0][0] = quadrix[0][1] = quadrix[0][2] = quadrix[0][3] = 0.0;
  quadrix[1][0] = quadrix[1][1] = quadrix[1][2] = quadrix[1][3] = 0.0;
  quadrix[2][0] = quadrix[2][1] = quadrix[2][2] = quadrix[2][3] = 0.0;
  quadrix[3][0] = quadrix[3][1] = quadrix[3][2] = quadrix[3][3] = 0.0;
}


void Quadric::set(float p[3], float q[3], float r[3])
{
  float u[3], v[3];
  float a, b, c, d, norm;

  planes = 1;

  // right hand system, CCW triangle p,q,r
  u[0] = q[0] - p[0];
  u[1] = q[1] - p[1];
  u[2] = q[2] - p[2];

  v[0] = r[0] - p[0];
  v[1] = r[1] - p[1];
  v[2] = r[2] - p[2];

  // plane normal
  a = u[1]*v[2] - u[2]*v[1];
  b = u[2]*v[0] - u[0]*v[2];
  c = u[0]*v[1] - u[1]*v[0];
  norm = sqrt(a*a + b*b + c*c);
  a = a/norm;
  b = b/norm;
  c = c/norm;

  d = -(a*p[0] + b*p[1] + c*p[2]);

  // quacric error measure
  quadrix[0][0] = a*a; quadrix[0][1] = a*b;
  quadrix[0][2] = a*c; quadrix[0][3] = a*d;
  quadrix[1][0] = b*a; quadrix[1][1] = b*b;
  quadrix[1][2] = b*c; quadrix[1][3] = b*d;
  quadrix[2][0] = c*a; quadrix[2][1] = c*b;
  quadrix[2][2] = c*c; quadrix[2][3] = c*d;
  quadrix[3][0] = d*a; quadrix[3][1] = d*b;
  quadrix[3][2] = d*c; quadrix[3][3] = d*d;
}


void Quadric::addPlane(float point[3], float plane[3])
{
  float a, b, c, d;
  
  a = plane[0];
  b = plane[1];
  c = plane[2];

  d = -(a*point[0] + b*point[1] + c*point[2]);

  // quacric error measure
  quadrix[0][0] = (quadrix[0][0]*planes + a*a) / planes+1;
  quadrix[0][1] = (quadrix[0][1]*planes + a*b) / planes+1;
  quadrix[0][2] = (quadrix[0][2]*planes + a*c) / planes+1;
  quadrix[0][3] = (quadrix[0][3]*planes + a*d) / planes+1;
  quadrix[1][0] = (quadrix[1][0]*planes + b*a) / planes+1;
  quadrix[1][1] = (quadrix[1][1]*planes + b*b) / planes+1;
  quadrix[1][2] = (quadrix[1][2]*planes + b*c) / planes+1;
  quadrix[1][3] = (quadrix[1][3]*planes + b*d) / planes+1;
  quadrix[2][0] = (quadrix[2][0]*planes + c*a) / planes+1;
  quadrix[2][1] = (quadrix[2][1]*planes + c*b) / planes+1;
  quadrix[2][2] = (quadrix[2][2]*planes + c*c) / planes+1;
  quadrix[2][3] = (quadrix[2][3]*planes + c*d) / planes+1;
  quadrix[3][0] = (quadrix[3][0]*planes + d*a) / planes+1;
  quadrix[3][1] = (quadrix[3][1]*planes + d*b) / planes+1;
  quadrix[3][2] = (quadrix[3][2]*planes + d*c) / planes+1;
  quadrix[3][3] = (quadrix[3][3]*planes + d*d) / planes+1;

  planes++;
}


void Quadric::add(Quadric &q)
{
  int i, j;

  for (i = 0; i < 4; i++)
    for (j = 0; j < 4; j++)
      quadrix[i][j] = (quadrix[i][j]*planes + q.quadrix[i][j]*q.planes) / 
        (planes + q.planes);
  
  planes += q.planes;
}


float Quadric::error(float v[3])
{
  float tmp[4], res;
  int i, j;

  for (i = 0; i < 4; i++) {
    tmp[i] = quadrix[i][3];
    for (j = 0; j < 3; j ++)
      tmp[i] += v[j] * quadrix[i][j];
  }
  res = tmp[3];
  for (i = 0; i < 3; i++)
    res += v[i] * tmp[i];

  return res;
}
