/*
 * Ayam, a free 3D modeler for the RenderMan interface.
 *
 * Ayam is copyrighted 1998-2016 by Randolf Schultz
 * (randolf.schultz@gmail.com) and others.
 *
 * All rights reserved.
 *
 * See the file License for details.
 *
 */

/* NURBS for x3dom */

/*
  The tessellator is based on idea and example code from
  A. J. Chung and A. J. Field 
  "A Simple Recursive Tessellator for Adaptive Surface Triangulation"
  in Journal of Graphics Tools Vol. 5, Iss. 3, 2000,
  (https://sourceforge.net/projects/emvise/).
*/

function findSpan(n, p, u, U)
{
 var low, mid, high;

  if(u >= U[n])
    return n;

  if(u <= U[p])
    return p;

  low = 0;
  high = n+1;
  mid = Math.floor((low+high)/2);

  while(u < U[mid] || u >= U[mid+1])
    {
      if(u < U[mid])
	high = mid;
      else
	low = mid;

      mid = Math.floor((low+high)/2);
    }

 return mid;
} /* findSpan */


function basisFuns(i, u, p, U)
{
 var N = [], left = [], right = [], saved, temp;
 var j, r;

  N[0] = 1.0;
  for(j = 0; j <= p; j++) {
      left[j] = 0;
      right[j] = 0;
  }
  for(j = 1; j <= p; j++)
    {
      left[j] = u - U[i+1-j];
      right[j] = U[i+j] - u;
      saved = 0.0;

      for(r = 0; r < j; r++)
	{
	  temp = N[r] / (right[r+1] + left[j-r]);
	  N[r] = saved + right[r+1] * temp;
	  saved = left[j-r] * temp;
	}

      N[j] = saved;
    }

 return N;
} /* basisFuns */


function surfacePoint3DH(n, m, p, q, U, V, P, W, u, v)
{
 var spanu, spanv, indu, indv, l, k, i, j = 0;
 var Nu, Nv, C = [], Cw = [0.0,0.0,0.0,0.0], temp = [];

  spanu = findSpan(n, p, u, U);
  Nu = basisFuns(spanu, u, p, U);
  spanv = findSpan(m, q, v, V);
  Nv = basisFuns(spanv, v, q, V);

  indu = spanu - p;
  for(l = 0; l <= q; l++)
    {
      indv = spanv - q + l;
      for(k = 0; k < 4; k++)
	  temp[j+k] = 0.0;
      for(k = 0; k <= p; k++)
	{
	  i = indu+k+(indv*(n+1));
	  temp[j+0] += Nu[k]*P[i].x;
	  temp[j+1] += Nu[k]*P[i].y;
	  temp[j+2] += Nu[k]*P[i].z;
	  temp[j+3] += Nu[k]*W[i];
	}
      j += 4;
    }

  j = 0;
  for(l = 0; l <= q; l++)
    {
      Cw[0] += Nv[l]*temp[j+0];
      Cw[1] += Nv[l]*temp[j+1];
      Cw[2] += Nv[l]*temp[j+2];
      Cw[3] += Nv[l]*temp[j+3];
      j += 4;
    }

  for(j = 0; j < 3; j++)
    C[j] = Cw[j]/Cw[3];

 return C;
} /* surfacePoint3DH */


function surfacePoint3D(n, m, p, q, U, V, P, u, v)
{
 var spanu, spanv, indu, indv, l, k, i, j = 0;
 var Nu, Nv, C = [0.0, 0.0, 0.0], temp = [];

  spanu = findSpan(n, p, u, U);
  Nu = basisFuns(spanu, u, p, U);
  spanv = findSpan(m, q, v, V);
  Nv = basisFuns(spanv, v, q, V);

  indu = spanu - p;
  for(l = 0; l <= q; l++)
    {
      indv = spanv - q + l;
      temp[j+0] = 0.0;
      temp[j+1] = 0.0;
      temp[j+2] = 0.0;
      for(k = 0; k <= p; k++)
	{
	  i = indu+k+(indv*(n+1));
	  temp[j+0] += Nu[k]*P[i].x;
	  temp[j+1] += Nu[k]*P[i].y;
	  temp[j+2] += Nu[k]*P[i].z;
	}
      j += 3;
    }

  j = 0;
  for(l = 0; l <= q; l++)
    {
      C[0] += Nv[l]*temp[j+0];
      C[1] += Nv[l]*temp[j+1];
      C[2] += Nv[l]*temp[j+2];
      j += 3;
    }

 return C;
} /* surfacePoint3D */


function curvePoint2DH(n, p, U, P, W, u)
{
 var span, j, k;
 var N, Cw = [0.0, 0.0, 0.0], C = [];

  span = findSpan(n, p, u, U);
  N = basisFuns(span, u, p, U);

  for(j = 0; j <= p; j++)
    {
      k = (span-p+j)*2;
      Cw[0] = Cw[0] + N[j]*P[k];
      Cw[1] = Cw[1] + N[j]*P[k+1];
      Cw[2] = Cw[2] + N[j]*W[span-p+j];
    }

  for(j = 0; j < 2; j++)
    C[j] = Cw[j]/Cw[2];

 return C;
} /* curvePoint2DH */


function curvePoint2D(n, p, U, P, u)
{
 var span, j, k;
 var N, C = [0.0, 0.0];

  span = findSpan(n, p, u, U);
  N = basisFuns(span, u, p, U);

  for(j = 0; j <= p; j++)
    {
      k = (span-p+j)*2;
      C[0] = C[0] + N[j]*P[k];
      C[1] = C[1] + N[j]*P[k+1];
    }

 return C;
} /* curvePoint2D */


function Tessellator(nurb) {
    this.use_objectspace = true;
    this.edge_thresh = 0.1;
    this.trim_thresh = 0.1;
    this.split_bias = 0.5;
    this.skew_thresh = 0.01;
    this.max_rec = 5;

    this.w = nurb[0];
    this.h = nurb[1];
    this.p = nurb[2];
    this.q = nurb[3];
    this.U = nurb[4];
    this.V = nurb[5];
    this.P = nurb[6];
    this.W = nurb[7];
    this.tloops = nurb[10];

    this.surfaceHash = [];
    this.indexHash = [];
    this.curveHash = null;
    this.coordinates = [];
    this.texcoords = [];
    this.indices = [];
    this.coordIndex = 0;

    this.tessellate = function () {
	if(this.W && this.W.length != (this.w+1)*(this.h+1))
	    this.W = null;
	// TODO: find multiple control points/internal knots and add initial
	// triangles for them to make sure those important surface features
	// (hard edges) are preserved
	var u0 = this.U[this.p];
	var u1 = this.U[this.U.length-this.p-1];
	var u05 = (u0+u1)*0.5;
	var v0 = this.V[this.q];
	var v1 = this.V[this.V.length-this.q-1];
	var v05 = (v0+v1)*0.5;
	this.tessTri([[u0,v0],[u0,v05],[u05,v0]]);
	this.tessTri([[u0,v05],[u05,v05],[u05,v0]]);
	this.tessTri([[u0,v05],[u0,v1],[u05,v05]]);
	this.tessTri([[u0,v1],[u05,v1],[u05,v05]]);
	this.tessTri([[u05,v0],[u05,v05],[u1,v0]]);
	this.tessTri([[u05,v05],[u1,v05],[u1,v0]]);
	this.tessTri([[u05,v05],[u05,v1],[u1,v05]]);
	this.tessTri([[u05,v1],[u1,v1],[u1,v05]]);
    } // tesselate

    /* Adapt thresholds to current NURBS configuration. */
    this.adjustThresholds = function (uparam, vparam) {
	if(uparam < 0) {
	    this.use_objectspace = false;
	    if(vparam >= 0.0)
		vparam = uparam;
	    var ul = 2.0/(this.w+1);
	    var vl = 2.0/(this.h+1);
	    ul *= (this.U[this.U.length-this.p-1] - this.U[this.p]);
	    vl *= (this.V[this.V.length-this.q-1] - this.V[this.q]);
	    this.edge_thresh_u = -uparam*ul;
	    this.edge_thresh_v = -vparam*vl;
	} else {
	    var mi = Number.MAX_VALUE;
	    var mx = -Number.MAX_VALUE;
	    var bb = [mi,mi,mi,mx,mx,mx];
	    for(var i = 0; i < this.P.length; i++) {
		if(this.P[i].x < bb[0]) bb[0] = this.P[i].x;
		if(this.P[i].y < bb[1]) bb[1] = this.P[i].y;
		if(this.P[i].z < bb[2]) bb[2] = this.P[i].z;
		if(this.P[i].x > bb[3]) bb[3] = this.P[i].x;
		if(this.P[i].y > bb[4]) bb[4] = this.P[i].y;
		if(this.P[i].z > bb[5]) bb[5] = this.P[i].z;
	    }
	    var ex = Math.sqrt((bb[0]-bb[3])*(bb[0]-bb[3])+
			       (bb[1]-bb[4])*(bb[1]-bb[4])+
			       (bb[2]-bb[5])*(bb[2]-bb[5]))/5.0;
	    if(uparam <= 10e-6)
		uparam = 1.0;
	    this.edge_thresh *= ex * uparam;
	    this.trim_thresh *= ex * uparam;
	}
    } // adjustThresholds

    this.tessTri = function (tri) {
	var work = [tri];
	while(work.length) {
	    var cur = work.splice(0, 1);
	    var pieces = this.refineTri(cur[0]);
	    work = pieces.concat(work);
	}
    } // tessTri

    this.refineTri = function (tri) {
	// 0 cull entire triangle?
	if(this.tloops && this.inOut(tri) < 0)
	    return [];

	// 1 measure triangle degeneracy

	// area of triangle
	var area = tri[0][0]*tri[1][1] - tri[1][0]*tri[0][1] +
	           tri[1][0]*tri[2][1] - tri[2][0]*tri[1][1] +
	           tri[2][0]*tri[0][1] - tri[0][0]*tri[2][1];
	if(area < 0)
	    area = -area;

	// calc sum of squares of edge lengths
	var a = [], b = [];
	a[0] = tri[0][0] - tri[1][0];
	a[1] = tri[0][1] - tri[1][1];
	var max_ed = a[0]*a[0] + a[1]*a[1];
	a[0] = tri[1][0] - tri[2][0];
	a[1] = tri[1][1] - tri[2][1];
	max_ed += a[0]*a[0] + a[1]*a[1];
	a[0] = tri[2][0] - tri[0][0];
	a[1] = tri[2][1] - tri[0][1];
	max_ed += a[0]*a[0] + a[1]*a[1];

	area /= max_ed;
	if(area <= this.skew_thresh) {
	    // triangle is skewed => dice rather than split edges
	    this.diceTri(tri);
	    return [];
	}

	// 2 split edges

	var eds = [];
	max_ed = 0.0;
	for(var i = 0; i < 3; i++) {
	    var j0 = (i+1)%3;
	    var j1 = (i+2)%3;
	    a = tri[j0];
	    b = tri[j1];
	    eds[i] = this.splitEdge(a, b);
	    if (eds[i] > max_ed)
		max_ed = eds[i];
	}

	max_ed *= this.split_bias;

	var m = [], mv = [], co = 0;
	for(var i = 0; i < 3; i++) {
	    var j0 = (i+1)%3;
	    var j1 = (i+2)%3;

	    if((eds[i] > this.edge_thresh) && (eds[i] >= max_ed)) {
		co++;
		mv[i] = [];
		mv[i][0] = 0.5*(tri[j0][0] + tri[j1][0]);
		mv[i][1] = 0.5*(tri[j0][1] + tri[j1][1]);
		m[i] = i - 3;
	    } else {
		// move midpt to vertex closer to center
		if(eds[j0] > eds[j1]) {
		    mv[i] = tri[j0];
		    m[i] = j0;
		} else {
		    mv[i] = tri[j1];
		    m[i] = j1;
		}
	    }
	}
	var res = [];
	if(co) {
	    // add one for center tile
	    co++;

	    // corner tiles
	    var j = co;
	    for(var i = 0; i < 3; i++) {
		var j0 = (i+1)%3;
		var j1 = (i+2)%3;
		if((m[j1] != i) && (m[j0] != i)) {
		    res[--j] = [tri[i], mv[j1], mv[j0]];
		}
	    }

	    // center tile
	    if(j) {
		if ((m[0]==m[1]) || (m[1]==m[2]) || (m[2]==m[0])) {
		    // avoid degenerate center tile
		    return [];
		}
		res[0] = [mv[0], mv[1], mv[2]];
	    }
	    return res;
	}
	/* check disabled, because the curvature check in splitEdge()
	   already does enough */
/*
	else if (this.splitCenter( mv )) {
	    // no edges split; add vertex to center and do a simple dice?
	    var c = [];
	    c[0] = (tri[0][0] + tri[1][0] + tri[2][0])/3.0;
	    c[1] = (tri[0][1] + tri[1][1] + tri[2][1])/3.0;

	    for(var i = 0; i < 3; i++) {
		res[i] = [tri[i], tri[(i+1)%3], c];
	    }

	    return res;
	}
*/
	this.trimFinal(tri);

	return [];
    } // refineTri

    /* Refine a triangle around a middle point. */
    this.diceTri = function (tri) {
	// pick a central point
	var cv = [];
	cv[0] = (tri[0][0] + tri[1][0] + tri[2][0])/3.0;
	cv[1] = (tri[0][1] + tri[1][1] + tri[2][1])/3.0;
	this.computeSurface(cv);
	for(var ed = 0; ed < 3; ed++) {
	    var divs = [], d = [];
	    var e1 = (ed+1)%3;

	    d[0] = tri[e1][0] - tri[ed][0];
	    d[1] = tri[e1][1] - tri[ed][1];

	    divs[0] = 1.0;
	    var beg = 0.0;
	    while(divs.length) {
		var a = [], b = [];
		var end = divs[0];
		a[0] = tri[ed][0] + d[0]*beg;
		a[1] = tri[ed][1] + d[1]*beg;
		b[0] = tri[ed][0] + d[0]*end;
		b[1] = tri[ed][1] + d[1]*end;
		if (this.splitEdge(a, b) > this.edge_thresh) {
		    // split edge
		    divs.splice(0, 0, 0.5*(beg+end));
		} else {
		    // render it
		    this.computeSurface(a);
		    this.computeSurface(b);
		    var slice = [cv, a, b];
		    this.trimFinal(slice);
		    divs.splice(0, 1);
		    beg = end;
		}
	    }
	}
    } /* diceTri */

    /* Compute a point on the NURBS surface. */
    this.computeSurface = function(uv, nooutput) {
	// first try the hash
	var indu = Math.floor(uv[0]*10e10);
	var indv = Math.floor(uv[1]*10e10);
	if(this.surfaceHash[indu]) {
	    var memoizedPoint = this.surfaceHash[indu][indv];
	    if(memoizedPoint)
		return memoizedPoint;
	}
	// hash lookup failed, compute the point
	var pnt;
	if(this.W) {
	    pnt = surfacePoint3DH(this.w, this.h, this.p, this.q,
				  this.U, this.V, this.P, this.W,
				  uv[0], uv[1]);
	} else {
	    pnt = surfacePoint3D(this.w, this.h, this.p, this.q,
				 this.U, this.V, this.P,
				 uv[0], uv[1]);
	}

	// do not memoize this point whilst tesselating trim curves
	if(this.curveHash)
	    return pnt;

	// memoize pnt
	if(!this.surfaceHash[indu])
	    this.surfaceHash[indu] = [];
	this.surfaceHash[indu][indv] = pnt;

	// do not output this point whilst checking edge curvature
	if(nooutput)
	    return pnt;

	if(!this.indexHash[indu])
	    this.indexHash[indu] = [];
	this.indexHash[indu][indv] = this.coordIndex;
	this.coordIndex++;
	this.coordinates.push(pnt);
	this.texcoords.push([uv[0],uv[1]]);
	return pnt;
    } /* computeSurface */

    /* Compute a point on a trim curve. */
    this.computeCurve = function(loop, seg, u) {
	// first try the hash
	var indu = Math.floor(u*10e10);
	if(this.curveHash[loop][seg]) {
	    var memoizedPoint = this.curveHash[loop][seg][indu];
	    if(memoizedPoint)
		return memoizedPoint;
	}
	// hash lookup failed, compute the point
	var pnt, crv = this.tloops[loop][seg];
	if(crv[4] && crv[4].length) {
	    pnt = curvePoint2DH(crv[0], crv[1], crv[2], crv[3], crv[4], u);
	} else {
	    pnt = curvePoint2D(crv[0], crv[1], crv[2], crv[3], u);
	}
	// memoize pnt
	if(!this.curveHash[loop][seg])
	    this.curveHash[loop][seg] = [];
	this.curveHash[loop][seg][indu] = pnt;
	return pnt;
    } /* computeCurve */

    /* Decide if an edge should be split;
       must be commutative to avoid cracks. */
    this.splitEdge = function (a, b) {
	var pa = this.computeSurface(a);
	var pb = this.computeSurface(b);
	if(!this.use_objectspace) {
	    var dist = Math.sqrt((a[0]-b[0])*(a[0]-b[0])/this.edge_thresh_u+
				 (a[1]-b[1])*(a[1]-b[1])/this.edge_thresh_v);
	    return dist;
	}

	if(Math.abs(pa[0]-pb[0]) > 10e-6 ||
	   Math.abs(pa[1]-pb[1]) > 10e-6 ||
	   Math.abs(pa[2]-pb[2]) > 10e-6) {
	    var lab = Math.sqrt((pa[0]-pb[0])*(pa[0]-pb[0])+
				(pa[1]-pb[1])*(pa[1]-pb[1])+
				(pa[2]-pb[2])*(pa[2]-pb[2]));
	    if(lab < this.edge_thresh) {
		// check for curvy region by computing the middle between
		// a and b and see how the distances a-b and a-m-b compare
		var m = [a[0]+(b[0]-a[0])*0.5,a[1]+(b[1]-a[1])*0.5];
		var pm = this.computeSurface(m, false);
		var lamb = 0.0;
		if(Math.abs(pa[0]-pm[0]) > 10e-6 ||
		   Math.abs(pa[1]-pm[1]) > 10e-6 ||
		   Math.abs(pa[2]-pm[2]) > 10e-6) {
		    lamb += Math.sqrt((pa[0]-pm[0])*(pa[0]-pm[0])+
				      (pa[1]-pm[1])*(pa[1]-pm[1])+
				      (pa[2]-pm[2])*(pa[2]-pm[2]))
		}
		if(Math.abs(pb[0]-pm[0]) > 10e-6 ||
		   Math.abs(pb[1]-pm[1]) > 10e-6 ||
		   Math.abs(pb[2]-pm[2]) > 10e-6) {
		    lamb += Math.sqrt((pb[0]-pm[0])*(pb[0]-pm[0])+
				      (pb[1]-pm[1])*(pb[1]-pm[1])+
				      (pb[2]-pm[2])*(pb[2]-pm[2]))
		}
		if(lamb > lab*1.01)
		    lab += lamb;
	    }
	    return lab;
	}
	else
	    return 0.0;
    } // splitEdge

    /* To avoid missing high frequency detail (e.g. spikes in functions)
       should all three edges fall below the split threshold, this function
       is called to determine if the triangle should be split by adding
       a vertex to its center. An interval bound on the function over the
       domain of the triangle is one possible implementation. */
    this.splitCenter = function (tri) {
	var cv = [];
	this.curveHash = [];
	cv[0] = (tri[0][0] + tri[1][0] + tri[2][0])/3.0;
	cv[1] = (tri[0][1] + tri[1][1] + tri[2][1])/3.0;
	var ed = 0.0;
	for(var i = 0; i < 3; i++)
	    ed += this.splitEdge(tri[i], cv);
	this.curveHash = null;
	if(ed*0.5 > this.edge_thresh){
	    this.computeSurface(cv);
	    return true;
	}
	return false;
    } // splitCenter

    /* Render the refined tile once all edges match the acceptance criteria. */
    this.renderFinal = function (tri) {
	for(var i = 0; i < 3; i++) {
	    var uv = tri[i];
	    var indu = Math.floor(uv[0]*10e10);
	    var indv = Math.floor(uv[1]*10e10);
	    if(this.indexHash[indu])
		this.indices.push(this.indexHash[indu][indv]);
	}
    } // renderFinal

    /* Find true intersection of line segment with trims. */
    this.intersectTrim = function (p1, p2, prev) {
	var sl = 0, ss = 0;
	if(prev){
	    sl = prev[2];
	    ss = prev[3]+1;
	}
	for(var ilp = sl; ilp < this.ttloops.length; ilp++) {
	    var lp = this.ttloops[ilp];
	    // TODO: add bbox test for speedup?
	    for(var k = ss; k < lp.length-1; k++ ) {
		var p3 = lp[k];
		var p4 = lp[k+1];

		if(((Math.abs(p1[0]-p3[0])<10e-6) &&
		    (Math.abs(p1[1]-p3[1])<10e-6)) ||
		   ((Math.abs(p1[0]-p4[0])<10e-6) &&
		    (Math.abs(p1[1]-p4[1])<10e-6)))
		    return [];
		//continue;

		if(((Math.abs(p2[0]-p3[0])<10e-6) &&
		    (Math.abs(p2[1]-p3[1])<10e-6)) ||
		   ((Math.abs(p2[0]-p4[0])<10e-6) &&
		    (Math.abs(p2[1]-p4[1])<10e-6)))
		    return [];
		//continue;

		var den = ((p2[0]-p1[0])*(p4[1]-p3[1]) -
			   (p2[1]-p1[1])*(p4[0]-p3[0]));

		if(Math.abs(den) < 10e-6) {
		    continue;
		}

		var r = ((p1[1]-p3[1])*(p4[0]-p3[0]) -
			 (p1[0]-p3[0])*(p4[1]-p3[1]))/den;

		if((r < 10e-6) || (r > (1.0-10e-6)))
		    continue;

		var s = ((p1[1]-p3[1])*(p2[0]-p1[0]) -
			 (p1[0]-p3[0])*(p2[1]-p1[1]))/den;

		if((s < 10e-6) || (s > (1.0-10e-6)))
		    continue;

		return [p1[0]+r*(p2[0]-p1[0]), p1[1]+r*(p2[1]-p1[1]), ilp, k];
	    }
	    if(prev)
		return [];
	}
	return [];
    } // intersectTrim

    /* Render four triangles created by a trim loop entering _and_ leaving
       on one triangle edge. */
    this.renderDiced = function (p0, p1, p2, tm, ip0, ip1) {
	var ip0s = ip0;
	var ip1s = ip1;
	if(((p0[0]-ip0[0])*(p0[0]-ip0[0])+(p0[1]-ip0[1])*(p0[1]-ip0[1])) >
	   ((p0[0]-ip1[0])*(p0[0]-ip1[0])+(p0[1]-ip1[1])*(p0[1]-ip1[1]))) {
	    ip0s = ip1;
	    ip1s = ip0;
	}
	this.renderFinal([p0,tm,p2]);
	this.renderFinal([p0,ip0s,tm]);
	this.renderFinal([p1,p2,tm]);
	this.renderFinal([p1,tm,ip1s]);
    } // renderDiced

    /* Render a triangle with a complex trim pattern (all edges have
       valid intersections with the trim loops), the triangle is
       basically just subdivided via the intersection points. */
    this.renderComplex = function (tri, ip0, ip1, ip2) {
	// it is safe to use diceTri() since we only get here with
	// triangles that already meet the edge_thresh criterion so that
	// diceTri() will never split one of the edges => no cracks
	this.diceTri([tri[0],ip0,ip2]);
	this.diceTri([ip0,tri[1],ip1]);
	this.diceTri([ip0,ip1,ip2]);
	this.diceTri([ip2,ip1,tri[2]]);
    } // renderComplex

    /* Render a trimmed tile. */
    this.renderTrimmed = function (tri) {
	var t = 0.3;
	var ip0 = this.intersectTrim(tri[0], tri[1]);
	var ip1 = this.intersectTrim(tri[1], tri[2]);
	var ip2 = this.intersectTrim(tri[2], tri[0]);
	var len = (ip0.length>0)+(ip1.length>0)+(ip2.length>0);
	if(len == 1) {
	    var ip = [ip0,ip1,ip2];
	    // check loop touching triangle point
	    for(var i = 0; i < 3; i++)
		if(ip[i].length) {
		    if(((Math.abs(tri[i][0]-ip[i][0])<10e-6) &&
			(Math.abs(tri[i][1]-ip[i][1])<10e-6)) ||
		       ((Math.abs(tri[(i+1)%3][0]-ip[i][0])<10e-6) &&
			(Math.abs(tri[(i+1)%3][1]-ip[i][1])<10e-6))) {
			this.renderFinal(tri);
			return;
		    }
		}
	    // check loop entering and leaving on the same edge
	    if(ip0.length) {
		var ip01 = this.intersectTrim(tri[0], tri[1], ip0);
		if(ip01.length) {
		    var tm = this.ttloops[ip01[2]][ip01[3]];
		    this.computeSurface(tm);
		    this.computeSurface(ip0);
		    this.computeSurface(ip01);
		    if(this.inOut([tri[2],
	[tri[2][0]+(tri[1][0]-tri[2][0])*t,tri[2][1]+(tri[1][1]-tri[2][1])*t],
   [tri[2][0]+(tri[0][0]-tri[2][0])*t,tri[2][1]+(tri[0][1]-tri[2][1])*t]])> 0){
			this.renderDiced(tri[0],tri[1],tri[2],tm,ip0,ip01);
		    } else {
			this.renderFinal([ip0,tm,ip01]);
		    }
		    return;
		}
	    } else if(ip1.length) {
		var ip11 = this.intersectTrim(tri[1], tri[2], ip1);
		if(ip11.length) {
		    var tm = this.ttloops[ip11[2]][ip11[3]];
		    this.computeSurface(tm);
		    this.computeSurface(ip1);
		    this.computeSurface(ip11);
		    if(this.inOut([tri[0],
	[tri[0][0]+(tri[1][0]-tri[0][0])*t,tri[0][1]+(tri[1][1]-tri[0][1])*t],
   [tri[0][0]+(tri[2][0]-tri[0][0])*t,tri[0][1]+(tri[2][1]-tri[0][1])*t]])> 0){
			this.renderDiced(tri[1],tri[2],tri[0],tm,ip1,ip11);
		    } else {
			this.renderFinal([ip1,tm,ip11]);
		    }
		    return;
		}
	    } else if(ip2.length) {
		var ip21 = this.intersectTrim(tri[2], tri[0], ip2);
		if(ip21.length) {
		    var tm = this.ttloops[ip21[2]][ip21[3]];
		    this.computeSurface(tm);
		    this.computeSurface(ip2);
		    this.computeSurface(ip21);
		    if(this.inOut([tri[1],
	[tri[1][0]+(tri[0][0]-tri[1][0])*t,tri[1][1]+(tri[0][1]-tri[1][1])*t],
   [tri[1][0]+(tri[2][0]-tri[1][0])*t,tri[1][1]+(tri[2][1]-tri[1][1])*t]])> 0){
			this.renderDiced(tri[2],tri[0],tri[1],tm,ip2,ip21);
		    } else {
			this.renderFinal([ip2,tm,ip21]);
		    }
		    return;
		}
	    }
	    if(this.max_rec) {
		this.max_rec--;
		this.diceTri(tri);
		this.max_rec++;
		return;
	    }
	} /* if len == 1 */

	if(len != 2) {
	    // no intersection or complex intersection (all edges)
	    if(len == 3) {
		this.renderComplex(tri, ip0, ip1, ip2);
		return;
	    } else {
		var out = 0;
		if(this.inOut([tri[0],
	[tri[0][0]+(tri[1][0]-tri[0][0])*t,tri[0][1]+(tri[1][1]-tri[0][1])*t],
   [tri[0][0]+(tri[2][0]-tri[0][0])*t,tri[0][1]+(tri[2][1]-tri[0][1])*t]]) < 0)
		    out++;
		if(this.inOut([tri[1],
	[tri[1][0]+(tri[0][0]-tri[1][0])*t,tri[1][1]+(tri[0][1]-tri[1][1])*t],
   [tri[1][0]+(tri[2][0]-tri[1][0])*t,tri[1][1]+(tri[2][1]-tri[1][1])*t]]) < 0)
		    out++;
		if(this.inOut([tri[2],
	[tri[2][0]+(tri[1][0]-tri[2][0])*t,tri[2][1]+(tri[1][1]-tri[2][1])*t],
   [tri[2][0]+(tri[0][0]-tri[2][0])*t,tri[2][1]+(tri[0][1]-tri[2][1])*t]]) < 0)
		    out++;
		if(out > 0) {
		    return;
		}
		this.renderFinal(tri);
	    }
	} else {
	    // len is 2 => simple intersection on two edges, split tri
	    if(!ip0.length) {
		// ip1 and ip2 are valid
		this.computeSurface(ip1);
		this.computeSurface(ip2);
		if(this.inOut([tri[2],
	[tri[2][0]+(ip2[0]-tri[2][0])*t,tri[2][1]+(ip2[1]-tri[2][1])*t],
   [tri[2][0]+(ip1[0]-tri[2][0])*t,tri[2][1]+(ip1[1]-tri[2][1])*t]]) <= 0) {
		    // tri[2] is outside
		    this.renderFinal([tri[0], ip1, ip2]);
		    this.renderFinal([tri[0], tri[1], ip1]);
		} else {
		    // tri[2] is inside
		    this.renderFinal([tri[2], ip2, ip1]);
		}
	    } else {
		if(!ip1.length) {
		    // ip0 and ip2 are valid
		    this.computeSurface(ip0);
		    this.computeSurface(ip2);
		    if(this.inOut([tri[0],
	[tri[0][0]+(ip2[0]-tri[0][0])*t,tri[0][1]+(ip2[1]-tri[0][1])*t],
   [tri[0][0]+(ip0[0]-tri[0][0])*t,tri[0][1]+(ip0[1]-tri[0][1])*t]]) <= 0) {
			// tri[0] is outside
			this.renderFinal([tri[1], ip2, ip0]);
			this.renderFinal([tri[1], tri[2], ip2]);
		    } else {
			// tri[0] is inside
			this.renderFinal([tri[0], ip0, ip2]);
		    }
		} else {
		    // ip0 and ip1 are valid
		    this.computeSurface(ip0);
		    this.computeSurface(ip1);
		    if(this.inOut([tri[1],
	[tri[1][0]+(ip0[0]-tri[1][0])*t,tri[1][1]+(ip0[1]-tri[1][1])*t],
   [tri[1][0]+(ip1[0]-tri[1][0])*t,tri[1][1]+(ip1[1]-tri[1][1])*t]]) <= 0) {
			// tri[1] is outside
			this.renderFinal([tri[0], ip0, ip1]);
			this.renderFinal([tri[0], ip1, tri[2]]);
		    } else {
			// tri[1] is inside
			this.renderFinal([tri[1], ip1, ip0]);
		    }
		}
	    }
	} // len is 2
	return;
    } // renderTrimmed

    this.inOut = function (tri) {
	var a = [], ad = [];

	// counters for intersections
	var cl = []; // less
	var cg = []; // greater
	var ndx = [];

	for(var i = 0; i < 3; i++) {
	    a[i] = [];
	    var va = tri[i];
	    var vb = tri[(i+1)%3];

	    // make line equation for edge
	    a[i][0] = va[1] - vb[1];
	    a[i][1] = vb[0] - va[0];
	    ad[i] = a[i][0]*va[0] + a[i][1]*va[1];

	    cl[i] = cg[i] = 0;
	    ndx[i] = (Math.abs(a[i][0]) > Math.abs(a[i][1])) ? 1 : 0;
	}

	for(var ilp = 0; ilp < this.ttloops.length; ilp++) {
	    var lp = this.ttloops[ilp];
	    // TODO: add bbox test for speedup?
	    for(var k = 0; k < lp.length-1; k++ ) {
		var p0 = lp[k];
		var p1 = lp[k+1];
		var ni = 0;
		for(var i = 0; i < 3; i++) {
		    var d0 = p0[0]*a[i][0] + p0[1]*a[i][1] - ad[i];
		    var d1 = p1[0]*a[i][0] + p1[1]*a[i][1] - ad[i];

		    ni += (d0<0) ? 1 : -1;

		    if((d0<0) ? (d1<0) : (d1>=0))
			continue; // no intersection

		    // find intersection point
		    var ip = (p1[ndx[i]]*d0 - p0[ndx[i]]*d1) / (d0-d1);

		    var ba = ip<tri[i][ndx[i]];
		    var bb = ip<tri[(i+1)%3][ndx[i]];
		    if(ba && bb) {
			cl[i]++;
		    } else {
			if(!(ba || bb)) {
			    cg[i]++;
			} else {
			    return 0;
			}
		    }
		}
		// point inside tile
		if((ni == 3) || (ni == -3))
		    return 0;
	    }
	}

	if((cl[0]&1) && (cl[1]&1) && (cl[2]&1)) return 1;
	if( !((cl[0]&1) || (cl[1]&1) || (cl[2]&1)) ) return -1;

	return 0;
    } // inOut

    /*
      Function to decide if straight edge approximation of the trim curve
      should be refined more.  A default function using
      splitEdge() is provided but can be overridden by the user
    */
    this.refineTrim = function (loop, u1, u2) {
	var pa = this.computeCurve(loop, Math.floor(u1), u1);
	var pb = this.computeCurve(loop, Math.floor(u2), u2);
	return (this.splitEdge(pa, pb) > this.edge_thresh);
    }

    /* Construct straight edged approximation of the trimming curves */
    this.initTrims = function ( ) {
	this.ttloops = [];
	this.curveHash = [];
	var edt = this.edge_thresh;
	this.edge_thresh = this.trim_thresh;
	for(var ilp = 0; ilp < this.tloops.length; ilp++) {
	    var lp = this.tloops[ilp];
	    this.curveHash[ilp] = [];
	    this.ttloops[ilp] = [];
	    var ttus = [];
	    var pnts = [];
	    var ue;
	    // sample trim segments at every distinct knot
	    for(var j = 0; j < lp.length; j++) {
		var U = lp[j][2];

		// rewrite knots to form a continuous range over the loop;
		// this way, we can derive the segment from u: Math.floor(u)
		var uf = 1.0/(U[U.length-1]-U[0]);
		if(Math.abs(1.0-uf) > 10e-12)
		    for(var i = 0; i < U.length; i++)
			U[i] = (U[i]*uf);
		var ud = U[0]-j;
		if(Math.abs(ud) > 10e-12)
		    for(var i = 0; i < U.length; i++)
			U[i] = (U[i]-ud);

		var ui = lp[j][1];//p
		var u = U[ui];//U[p]
		ue = U[(U.length-ui-1)];//U[Ulen-p-1]
		while(u < ue) {
		    this.ttloops[ilp].push(this.computeCurve(ilp, j, u));
		    ttus.push(u);
		    ui++;
		    while(Math.abs(u-U[ui]) < 10e-6)
			ui++;
		    u = U[ui];
		}
	    }

	    // refine trim edges
	    var tlp = this.ttloops[ilp];

	    var x = 0;
	    while(x < tlp.length) {
		var p0u = ttus[x];
		var p0seg = Math.floor(p0u);
		var y = x+1;
		if(y == tlp.length) {
		    y = 0;
		}
		var p1u = ttus[y];

		if(lp[p0seg][1] > 1 && this.refineTrim(ilp, p0u, p1u)) {
		    // split edge
		    var um;
		    if(y == 0) {
			um = 0.5 * (p0u + ue);
			y = x+1;
		    } else {
			um = 0.5 * (p0u + p1u);
		    }
		    var v = this.computeCurve(ilp, p0seg, um);
		    tlp.splice(y, 0, v)
		    ttus.splice(y, 0, um);
		} else {
		    // proceed to next edge
		    if(y == 0)
			break;
		    x = y;
		}
	    } // foreach edge
	    // close loop
	    tlp.push(tlp[0]);
	} // foreach loop
	this.curveHash = null;
	this.edge_thresh = edt;
    } // initTrims

    this.trimFinal = function (tri) {
	if(this.tloops) {
	    if(this.inOut(tri) >= 0) {
		this.renderTrimmed(tri);
		return;
	    } else {
		// can not trust inOut(), i.e. we do get here with triangles
		// that should have been classified as "trimmed", see if this
		// is the case...
		var t = 0.3;
		var out = 0;
		if(this.inOut([tri[0],
	[tri[0][0]+(tri[1][0]-tri[0][0])*t,tri[0][1]+(tri[1][1]-tri[0][1])*t],
   [tri[0][0]+(tri[2][0]-tri[0][0])*t,tri[0][1]+(tri[2][1]-tri[0][1])*t]]) < 0)
		    out++;
		if(this.inOut([tri[1],
	[tri[1][0]+(tri[0][0]-tri[1][0])*t,tri[1][1]+(tri[0][1]-tri[1][1])*t],
   [tri[1][0]+(tri[2][0]-tri[1][0])*t,tri[1][1]+(tri[2][1]-tri[1][1])*t]]) < 0)
		    out++;
		if(this.inOut([tri[2],
	[tri[2][0]+(tri[1][0]-tri[2][0])*t,tri[2][1]+(tri[1][1]-tri[2][1])*t],
   [tri[2][0]+(tri[0][0]-tri[2][0])*t,tri[2][1]+(tri[0][1]-tri[2][1])*t]]) < 0)
		    out++;
		if(out > 0) {
		    // TODO: or call into renderTrimmed()?
		    //this.renderTrimmed(tri);
		    return;
		}
	    }
	}
	this.renderFinal(tri);
    } // trimFinal
} /* Tessellator */
