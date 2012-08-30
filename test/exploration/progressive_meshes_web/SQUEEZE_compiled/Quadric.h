#ifndef QUADRIC_H
#define QUADRIC_H


class Quadric {
public:
  Quadric();

  void reset();
  void set(float p[3], float q[3], float r[3]);
  void add(Quadric &q);
  void addPlane(float point[3], float plane[3]);

  float error(float v[3]);
  
private:
  int planes;
  float quadrix[4][4];
};


#endif
