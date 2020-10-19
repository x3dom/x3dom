/**
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * The x3dom.fields namespace.
 * @namespace x3dom.fields
 */
x3dom.fields = {};

// shortcut for convenience and speedup
var VecMath = x3dom.fields;

// Epsilon
x3dom.fields.Eps = 0.000001;

///////////////////////////////////////////////////////////////////////////////
// Single-Field Definitions
///////////////////////////////////////////////////////////////////////////////

/**
 * Constructor. You must either specify all argument values or no
 * argument. In the latter case, an identity matrix will be created.
 *
 * @class Represents a 4x4 matrix in row major format.
 * @param {Number} [_00=1] - value at [0,0]
 * @param {Number} [_01=0] - value at [0,1]
 * @param {Number} [_02=0] - value at [0,2]
 * @param {Number} [_03=0] - value at [0,3]
 * @param {Number} [_10=0] - value at [1,0]
 * @param {Number} [_11=1] - value at [1,1]
 * @param {Number} [_12=0] - value at [1,2]
 * @param {Number} [_13=0] - value at [1,3]
 * @param {Number} [_20=0] - value at [2,0]
 * @param {Number} [_21=0] - value at [2,1]
 * @param {Number} [_22=1] - value at [2,2]
 * @param {Number} [_23=0] - value at [2,3]
 * @param {Number} [_30=0] - value at [3,0]
 * @param {Number} [_31=0] - value at [3,1]
 * @param {Number} [_32=0] - value at [3,2]
 * @param {Number} [_33=1] - value at [3,3]
 */
x3dom.fields.SFMatrix4f = function ( _00, _01, _02, _03,
    _10, _11, _12, _13,
    _20, _21, _22, _23,
    _30, _31, _32, _33 )
{
    if ( arguments.length === 0 )
    {
        this._00 = 1; this._01 = 0; this._02 = 0; this._03 = 0;
        this._10 = 0; this._11 = 1; this._12 = 0; this._13 = 0;
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else
    {
        this._00 = _00; this._01 = _01; this._02 = _02; this._03 = _03;
        this._10 = _10; this._11 = _11; this._12 = _12; this._13 = _13;
        this._20 = _20; this._21 = _21; this._22 = _22; this._23 = _23;
        this._30 = _30; this._31 = _31; this._32 = _32; this._33 = _33;
    }
};

/**
 * Returns the first column vector of the matrix.
 *
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e0 = function ()
{
    var baseVec = new x3dom.fields.SFVec3f( this._00, this._10, this._20 );
    return baseVec.normalize();
};

/**
 * Returns the second column vector of the matrix.
 *
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e1 = function ()
{
    var baseVec = new x3dom.fields.SFVec3f( this._01, this._11, this._21 );
    return baseVec.normalize();
};

/**
 * Returns the third column vector of the matrix.
 *
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e2 = function ()
{
    var baseVec = new x3dom.fields.SFVec3f( this._02, this._12, this._22 );
    return baseVec.normalize();
};

/**
 * Returns the fourth column vector of the matrix.
 *
 * @returns {x3dom.fields.SFVec3f} the vector
 */
x3dom.fields.SFMatrix4f.prototype.e3 = function ()
{
    return new x3dom.fields.SFVec3f( this._03, this._13, this._23 );
};

/**
 * Returns a copy of the argument matrix.
 *
 * @param {x3dom.fields.SFMatrix4f} that - the matrix to copy
 * @returns {x3dom.fields.SFMatrix4f} the copy
 */
x3dom.fields.SFMatrix4f.copy = function ( that )
{
    return new x3dom.fields.SFMatrix4f(
        that._00, that._01, that._02, that._03,
        that._10, that._11, that._12, that._13,
        that._20, that._21, that._22, that._23,
        that._30, that._31, that._32, that._33
    );
};

/**
 * Returns a copy of the matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} the copy
 */
x3dom.fields.SFMatrix4f.prototype.copy = function ()
{
    return x3dom.fields.SFMatrix4f.copy( this );
};

/**
 * Returns a SFMatrix4f identity matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} the new identity matrix
 */
x3dom.fields.SFMatrix4f.identity = function ()
{
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};

/**
 * Returns a new null matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} the new null matrix
 */
x3dom.fields.SFMatrix4f.zeroMatrix = function ()
{
    return new x3dom.fields.SFMatrix4f(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    );
};

/**
 * Returns a new translation matrix.
 *
 * @param {x3dom.fields.SFVec3f} vec - vector that describes the desired
 *                                     translation
 * @returns {x3dom.fields.SFMatrix4f} the new identity matrix
 */
x3dom.fields.SFMatrix4f.translation = function ( vec )
{
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, vec.x,
        0, 1, 0, vec.y,
        0, 0, 1, vec.z,
        0, 0, 0, 1
    );
};

/**
 * Returns a new rotation matrix, rotating around the x axis.
 *
 * @param {Number} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationX = function ( a )
{
    var c = Math.cos( a );
    var s = Math.sin( a );
    return new x3dom.fields.SFMatrix4f(
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    );
};

/**
 * Returns a new rotation matrix, rotating around the y axis.
 *
 * @param {Number} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationY = function ( a )
{
    var c = Math.cos( a );
    var s = Math.sin( a );
    return new x3dom.fields.SFMatrix4f(
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    );
};

/**
 * Returns a new rotation matrix, rotating around the z axis.
 *
 * @param {Number} a - angle in radians
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.rotationZ = function ( a )
{
    var c = Math.cos( a );
    var s = Math.sin( a );
    return new x3dom.fields.SFMatrix4f(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
};

/**
 * Returns a new scale matrix.
 *
 * @param {x3dom.fields.SFVec3f} vec - vector containing scale factors
 *                                     along the three main axes
 * @returns {x3dom.fields.SFMatrix4f} the new scale matrix
 */
x3dom.fields.SFMatrix4f.scale = function ( vec )
{
    return new x3dom.fields.SFMatrix4f(
        vec.x, 0, 0, 0,
        0, vec.y, 0, 0,
        0, 0, vec.z, 0,
        0, 0, 0, 1
    );
};

/**
 * Returns a new camera matrix, using the given "look at" parameters.
 *
 * @param {x3dom.fields.SFVec3f} from - eye point
 * @param {x3dom.fields.SFVec3f} at - focus ("look at") point
 * @param {x3dom.fields.SFVec3f} up - up vector
 * @returns {x3dom.fields.SFMatrix4f} the new camera matrix
 */
x3dom.fields.SFMatrix4f.lookAt = function ( from, at, up )
{
    var view = from.subtract( at ).normalize();
    var right = up.normalize().cross( view ).normalize();

    // check if zero vector, i.e. linearly dependent
    if ( right.dot( right ) < x3dom.fields.Eps )
    {
        x3dom.debug.logWarning( "View matrix is linearly dependent." );
        return x3dom.fields.SFMatrix4f.translation( from );
    }

    var newUp = view.cross( right ).normalize();

    var tmp = x3dom.fields.SFMatrix4f.identity();
    tmp.setValue( right, newUp, view, from );

    return tmp;
};

/**
 * Returns a new perspective projection frustum.
 *
 * @param {Number} left   - Left
 * @param {Number} right  - Right
 * @param {Number} bottom - Bottom
 * @param {Number} top    - Top
 * @param {Number} near   - near clipping distance
 * @param {Number} far    - far clipping distance
 */
x3dom.fields.SFMatrix4f.perspectiveFrustum = function ( left, right, bottom, top, near, far )
{
    return new x3dom.fields.SFMatrix4f(
        2 * near / ( right - left ), 0, ( right + left ) / ( right - left ), 0,
        0, 2 * near / ( top - bottom ), ( top + bottom ) / ( top - bottom ), 0,
        0, 0, -( far + near ) / ( far - near ), -2 * far * near / ( far - near ),
        0, 0, -1, 0
    );
};

/**
 * Returns a new perspective projection matrix.
 *
 * @param {Number} fov    - field-of-view angle in radians
 * @param {Number} aspect - aspect ratio (width / height)
 * @param {Number} near   - near clipping distance
 * @param {Number} far    - far clipping distance
 * @returns {x3dom.fields.SFMatrix4f} the new projection matrix
 */
x3dom.fields.SFMatrix4f.perspective = function ( fov, aspect, near, far )
{
    var f = 1 / Math.tan( fov / 2 );

    return new x3dom.fields.SFMatrix4f(
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, ( near + far ) / ( near - far ), 2 * near * far / ( near - far ),
        0, 0, -1, 0
    );
};

/**
 * Returns a new orthogonal projection matrix.
 *
 * @param {Number} left         - left border value of the view area
 * @param {Number} right        - right border value of the view area
 * @param {Number} bottom       - bottom border value of the view area
 * @param {Number} top          - top border value of the view area
 * @param {Number} near         - near clipping distance
 * @param {Number} far          - far clipping distance
 * @param {Number} [aspect=1.0] - desired aspect ratio (width / height)
 *                                of the projected image
 * @returns {x3dom.fields.SFMatrix4f} the new projection matrix
 */
x3dom.fields.SFMatrix4f.ortho = function ( left, right, bottom, top,
    near, far, aspect )
{
    var rl = ( right - left ) / 2;    // hs
    var tb = ( top - bottom ) / 2;    // vs
    var fn = far - near;

    if ( aspect === undefined )
    {aspect = 1.0;}

    if ( aspect < ( rl / tb ) )
    {
        tb = rl / aspect;
    }
    else
    {
        rl = tb * aspect;
    }

    left = -rl;
    right = rl;
    bottom = -tb;
    top = tb;

    rl *= 2;
    tb *= 2;

    return new x3dom.fields.SFMatrix4f(
        2 / rl, 0, 0, -( right + left ) / rl,
        0, 2 / tb, 0, -( top + bottom ) / tb,
        0, 0, -2 / fn, -( far + near ) / fn,
        0, 0, 0, 1
    );
};

/**
 * Sets the translation components of a homogenous transform matrix.
 *
 * @param {x3dom.fields.SFVec3f} vec - the translation vector
 */
x3dom.fields.SFMatrix4f.prototype.setTranslate = function ( vec )
{
    this._03 = vec.x;
    this._13 = vec.y;
    this._23 = vec.z;
};

/**
 * Sets the scale components of a homogenous transform matrix.
 *
 * @param {x3dom.fields.SFVec3f} vec - vector containing scale factors
 *                                     along the three main axes
 */
x3dom.fields.SFMatrix4f.prototype.setScale = function ( vec )
{
    this._00 = vec.x;
    this._11 = vec.y;
    this._22 = vec.z;
};

/**
 * Sets the rotation components of a homogenous transform matrix.
 *
 * @param {x3dom.fields.Quaternion} quat - quaternion that describes
 *                                         the rotation
 */
x3dom.fields.SFMatrix4f.prototype.setRotate = function ( quat )
{
    var xx = quat.x * quat.x;
    var xy = quat.x * quat.y;
    var xz = quat.x * quat.z;
    var yy = quat.y * quat.y;
    var yz = quat.y * quat.z;
    var zz = quat.z * quat.z;
    var wx = quat.w * quat.x;
    var wy = quat.w * quat.y;
    var wz = quat.w * quat.z;

    this._00 = 1 - 2 * ( yy + zz );
    this._01 = 2 * ( xy - wz );
    this._02 = 2 * ( xz + wy );
    this._10 = 2 * ( xy + wz );
    this._11 = 1 - 2 * ( xx + zz );
    this._12 = 2 * ( yz - wx );
    this._20 = 2 * ( xz - wy );
    this._21 = 2 * ( yz + wx );
    this._22 = 1 - 2 * ( xx + yy );
};

/**
 * Creates a new matrix from a column major string representation, with
 * values separated by commas or whitespace
 *
 * @param {String} str - string to parse
 * @returns {x3dom.fields.SFMatrix4f} the new matrix
 */
x3dom.fields.SFMatrix4f.parseRotation = function ( str )
{
    var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec( str );
    var x = +m[ 1 ],
        y = +m[ 2 ],
        z = +m[ 3 ],
        a = +m[ 4 ];

    var d = Math.sqrt( x * x + y * y + z * z );
    if ( d === 0 )
    {
        x = 1;
        y = z = 0;
    }
    else
    {
        x /= d;
        y /= d;
        z /= d;
    }

    var c = Math.cos( a );
    var s = Math.sin( a );
    var t = 1 - c;

    return new x3dom.fields.SFMatrix4f(
        t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
        t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
        t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
        0, 0, 0, 1
    ).transpose();
};

/**
 * Creates a new matrix from a X3D-conformant string representation
 *
 * @param {String} str - string to parse
 * @returns {x3dom.fields.SFMatrix4f} the new rotation matrix
 */
x3dom.fields.SFMatrix4f.parse = function ( str )
{
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    if ( val.exec( str ) )
    {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = str.split( /[,\s]+/ ).map( function ( n ) { return +n; } );
    if ( arr.length >= 16 )
    {
        if ( !needTranspose )
        {
            return new x3dom.fields.SFMatrix4f(
                arr[ 0 ], arr[ 1 ], arr[ 2 ], arr[ 3 ],
                arr[ 4 ], arr[ 5 ], arr[ 6 ], arr[ 7 ],
                arr[ 8 ], arr[ 9 ], arr[ 10 ], arr[ 11 ],
                arr[ 12 ], arr[ 13 ], arr[ 14 ], arr[ 15 ]
            );
        }
        else
        {
            return new x3dom.fields.SFMatrix4f(
                arr[ 0 ], arr[ 4 ], arr[ 8 ], arr[ 12 ],
                arr[ 1 ], arr[ 5 ], arr[ 9 ], arr[ 13 ],
                arr[ 2 ], arr[ 6 ], arr[ 10 ], arr[ 14 ],
                arr[ 3 ], arr[ 7 ], arr[ 11 ], arr[ 15 ]
            );
        }
    }
    else if ( arr.length === 6 )
    {
        return new x3dom.fields.SFMatrix4f(
            arr[ 0 ], arr[ 1 ], 0, arr[ 4 ],
            arr[ 2 ], arr[ 3 ], 0, arr[ 5 ],
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }
    else
    {
        x3dom.debug.logWarning( "SFMatrix4f - can't parse string: " + str );
        return x3dom.fields.SFMatrix4f.identity();
    }
};

/**
 * Returns the result of multiplying this matrix with the given one,
 * using "post-multiplication" / "right multiply".
 *
 * @param {x3dom.fields.SFMatrix4f} that - matrix to multiply with this
 *                                         one
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.mult = function ( that )
{
    return new x3dom.fields.SFMatrix4f(
        this._00 * that._00 + this._01 * that._10 + this._02 * that._20 + this._03 * that._30,
        this._00 * that._01 + this._01 * that._11 + this._02 * that._21 + this._03 * that._31,
        this._00 * that._02 + this._01 * that._12 + this._02 * that._22 + this._03 * that._32,
        this._00 * that._03 + this._01 * that._13 + this._02 * that._23 + this._03 * that._33,
        this._10 * that._00 + this._11 * that._10 + this._12 * that._20 + this._13 * that._30,
        this._10 * that._01 + this._11 * that._11 + this._12 * that._21 + this._13 * that._31,
        this._10 * that._02 + this._11 * that._12 + this._12 * that._22 + this._13 * that._32,
        this._10 * that._03 + this._11 * that._13 + this._12 * that._23 + this._13 * that._33,
        this._20 * that._00 + this._21 * that._10 + this._22 * that._20 + this._23 * that._30,
        this._20 * that._01 + this._21 * that._11 + this._22 * that._21 + this._23 * that._31,
        this._20 * that._02 + this._21 * that._12 + this._22 * that._22 + this._23 * that._32,
        this._20 * that._03 + this._21 * that._13 + this._22 * that._23 + this._23 * that._33,
        this._30 * that._00 + this._31 * that._10 + this._32 * that._20 + this._33 * that._30,
        this._30 * that._01 + this._31 * that._11 + this._32 * that._21 + this._33 * that._31,
        this._30 * that._02 + this._31 * that._12 + this._32 * that._22 + this._33 * that._32,
        this._30 * that._03 + this._31 * that._13 + this._32 * that._23 + this._33 * that._33
    );
};

/**
 * Transforms a given 3D point, using this matrix as a homogenous
 * transform matrix (ignores projection part of matrix for speedup in
 * standard cases).
 *
 * @param {x3dom.fields.SFVec3f} vec - point to transform
 * @returns {x3dom.fields.SFVec3f} resulting point
 */
x3dom.fields.SFMatrix4f.prototype.multMatrixPnt = function ( vec )
{
    return new x3dom.fields.SFVec3f(
        this._00 * vec.x + this._01 * vec.y + this._02 * vec.z + this._03,
        this._10 * vec.x + this._11 * vec.y + this._12 * vec.z + this._13,
        this._20 * vec.x + this._21 * vec.y + this._22 * vec.z + this._23
    );
};

/**
 * Transforms a given 3D vector, using this matrix as a homogenous
 * transform matrix.
 *
 * @param {x3dom.fields.SFVec3f} vec - vector to transform
 * @returns {x3dom.fields.SFVec3f} resulting vector
 */
x3dom.fields.SFMatrix4f.prototype.multMatrixVec = function ( vec )
{
    return new x3dom.fields.SFVec3f(
        this._00 * vec.x + this._01 * vec.y + this._02 * vec.z,
        this._10 * vec.x + this._11 * vec.y + this._12 * vec.z,
        this._20 * vec.x + this._21 * vec.y + this._22 * vec.z
    );
};

/**
 * Transforms a given 3D point, using this matrix as a transform matrix
 * (also includes projection part of matrix - required for e.g.
 * modelview-projection matrix). The resulting point is normalized by a
 * w component.
 *
 * @param {x3dom.fields.SFVec3f} vec - point to transform
 * @returns {x3dom.fields.SFVec3f} resulting point
 */
x3dom.fields.SFMatrix4f.prototype.multFullMatrixPnt = function ( vec )
{
    var w = this._30 * vec.x + this._31 * vec.y + this._32 * vec.z + this._33;
    if ( w )
    {
        w = 1.0 / w;
    }
    return new x3dom.fields.SFVec3f(
        ( this._00 * vec.x + this._01 * vec.y + this._02 * vec.z + this._03 ) * w,
        ( this._10 * vec.x + this._11 * vec.y + this._12 * vec.z + this._13 ) * w,
        ( this._20 * vec.x + this._21 * vec.y + this._22 * vec.z + this._23 ) * w
    );
};

/**
 * Transforms a given 3D point, using this matrix as a transform matrix
 * (also includes projection part of matrix - required for e.g.
 * modelview-projection matrix). The resulting point is normalized by a
 * w component.
 *
 * @param {x3dom.fields.SFVec4f} plane - plane to transform
 * @returns {x3dom.fields.SFVec4f} resulting plane
 */
x3dom.fields.SFMatrix4f.prototype.multMatrixPlane = function ( plane )
{
    var normal = new x3dom.fields.SFVec3f( plane.x, plane.y, plane.z );

    var memberPnt = normal.multiply( -plane.w );

    memberPnt = this.multMatrixPnt( memberPnt );

    var invTranspose = this.inverse().transpose();

    normal = invTranspose.multMatrixVec( normal );

    var d = -normal.dot( memberPnt );

    return new x3dom.fields.SFVec4f( normal.x, normal.y, normal.z, d );
};

/**
 * Returns a transposed version of this matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.transpose = function ()
{
    return new x3dom.fields.SFMatrix4f(
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    );
};

/**
 * Returns a negated version of this matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.negate = function ()
{
    return new x3dom.fields.SFMatrix4f(
        -this._00, -this._01, -this._02, -this._03,
        -this._10, -this._11, -this._12, -this._13,
        -this._20, -this._21, -this._22, -this._23,
        -this._30, -this._31, -this._32, -this._33
    );
};

/**
 * Returns a scaled version of this matrix.
 *
 * @param {Number} s - scale factor
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.multiply = function ( s )
{
    return new x3dom.fields.SFMatrix4f(
        s * this._00, s * this._01, s * this._02, s * this._03,
        s * this._10, s * this._11, s * this._12, s * this._13,
        s * this._20, s * this._21, s * this._22, s * this._23,
        s * this._30, s * this._31, s * this._32, s * this._33
    );
};

/**
 * Returns the result of adding the given matrix to this matrix.
 *
 * @param {x3dom.fields.SFMatrix4f} that - the other matrix
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.add = function ( that )
{
    return new x3dom.fields.SFMatrix4f(
        this._00 + that._00, this._01 + that._01, this._02 + that._02, this._03 + that._03,
        this._10 + that._10, this._11 + that._11, this._12 + that._12, this._13 + that._13,
        this._20 + that._20, this._21 + that._21, this._22 + that._22, this._23 + that._23,
        this._30 + that._30, this._31 + that._31, this._32 + that._32, this._33 + that._33
    );
};

/**
 * Returns the result of adding the given matrix to this matrix
 * using an additional scale factor for the argument matrix.
 *
 * @param {x3dom.fields.SFMatrix4f} that - the other matrix
 * @param {Number} s - the scale factor
 * @returns {x3dom.fields.SFMatrix4f} resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.addScaled = function ( that, s )
{
    return new x3dom.fields.SFMatrix4f(
        this._00 + s * that._00, this._01 + s * that._01, this._02 + s * that._02, this._03 + s * that._03,
        this._10 + s * that._10, this._11 + s * that._11, this._12 + s * that._12, this._13 + s * that._13,
        this._20 + s * that._20, this._21 + s * that._21, this._22 + s * that._22, this._23 + s * that._23,
        this._30 + s * that._30, this._31 + s * that._31, this._32 + s * that._32, this._33 + s * that._33
    );
};

/**
 * Fills the values of this matrix with the values of the other one.
 *
 * @param {x3dom.fields.SFMatrix4f} that - the other matrix
 */
x3dom.fields.SFMatrix4f.prototype.setValues = function ( that )
{
    this._00 = that._00;
    this._01 = that._01;
    this._02 = that._02;
    this._03 = that._03;
    this._10 = that._10;
    this._11 = that._11;
    this._12 = that._12;
    this._13 = that._13;
    this._20 = that._20;
    this._21 = that._21;
    this._22 = that._22;
    this._23 = that._23;
    this._30 = that._30;
    this._31 = that._31;
    this._32 = that._32;
    this._33 = that._33;
};

/**
 * Fills the upper left 3x3 or 3x4 values of this matrix, using the
 * given (three or four) column vectors.
 *
 * @param {x3dom.fields.SFVec3f} v1             - first column vector
 * @param {x3dom.fields.SFVec3f} v2             - second column vector
 * @param {x3dom.fields.SFVec3f} v3             - third column vector
 * @param {x3dom.fields.SFVec3f} [v4=undefined] - fourth column vector
 */
x3dom.fields.SFMatrix4f.prototype.setValue = function ( v1, v2, v3, v4 )
{
    this._00 = v1.x;
    this._01 = v2.x;
    this._02 = v3.x;
    this._10 = v1.y;
    this._11 = v2.y;
    this._12 = v3.y;
    this._20 = v1.z;
    this._21 = v2.z;
    this._22 = v3.z;
    this._30 = 0;
    this._31 = 0;
    this._32 = 0;

    if ( arguments.length > 3 )
    {
        this._03 = v4.x;
        this._13 = v4.y;
        this._23 = v4.z;
        this._33 = 1;
    }
};

/**
 * Fills the values of this matrix, using the given array.
 *
 * @param {Number[]} a - array, the first 16 values will be used to
 *                       initialize the matrix
 */
x3dom.fields.SFMatrix4f.prototype.setFromArray = function ( a )
{
    this._00 = a[ 0 ];
    this._01 = a[ 4 ];
    this._02 = a[ 8 ];
    this._03 = a[ 12 ];
    this._10 = a[ 1 ];
    this._11 = a[ 5 ];
    this._12 = a[ 9 ];
    this._13 = a[ 13 ];
    this._20 = a[ 2 ];
    this._21 = a[ 6 ];
    this._22 = a[ 10 ];
    this._23 = a[ 14 ];
    this._30 = a[ 3 ];
    this._31 = a[ 7 ];
    this._32 = a[ 11 ];
    this._33 = a[ 15 ];

    return this;
};

/**
 * Fills the values of this matrix, using the given array.
 * @param {Number[]} a - array, the first 16 values will be used to
 *                       initialize the matrix
 */
x3dom.fields.SFMatrix4f.fromArray = function ( a )
{
    var m = new x3dom.fields.SFMatrix4f();

    m._00 = a[ 0 ]; m._01 = a[ 4 ]; m._02 = a[  8 ]; m._03 = a[ 12 ];
    m._10 = a[ 1 ]; m._11 = a[ 5 ]; m._12 = a[  9 ]; m._13 = a[ 13 ];
    m._20 = a[ 2 ]; m._21 = a[ 6 ]; m._22 = a[ 10 ]; m._23 = a[ 14 ];
    m._30 = a[ 3 ]; m._31 = a[ 7 ]; m._32 = a[ 11 ]; m._33 = a[ 15 ];

    return m;
};

/**
 * Sets the rotation, translation, and scaling of this matrix using
 * the respective transformation components, and returns this matrix.
 *
 * @param {x3dom.fields.Quaternion} rotation    - the rotation part
 * @param {x3dom.fields.SFVec3f}    translation - the 3D translation
 *                                                vector
 * @param {x3dom.fields.SFVec3f}    scale       - the non-uniform scaling
 *                                                factors
 * @returns {x3dom.fields.SFMatrix4f} the modified matrix
 */
x3dom.fields.SFMatrix4f.prototype.fromRotationTranslationScale = function ( rotation, translation, scale )
{
    translation    = translation || new x3dom.fields.SFVec3f(); //[ 0.2, -0.3, -0.3 ];
    rotation = rotation || new x3dom.fields.Quaternion();
    scale       = scale || new x3dom.fields.SFVec3f( 1, 1, 1 );

    var x = rotation.x,
        y = rotation.y,
        z = rotation.z,
        w = rotation.w;

    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;

    this._00 = ( 1 - ( yy + zz ) ) * scale.x;
    this._10 = ( xy + wz ) * scale.x;
    this._20 = ( xz - wy ) * scale.x;
    this._30 = 0;
    this._01 = ( xy - wz ) * scale.y;
    this._11 = ( 1 - ( xx + zz ) ) * scale.y;
    this._21 = ( yz + wx ) * scale.y;
    this._31 = 0;
    this._02 = ( xz + wy ) * scale.z;
    this._12 = ( yz - wx ) * scale.z;
    this._22 = ( 1 - ( xx + yy ) ) * scale.z;
    this._32 = 0;
    this._03 = translation.x;
    this._13 = translation.y;
    this._23 = translation.z;
    this._33 = 1;

    return this;
};

/**
 * Creates and returns a new 4x4 transformation matrix defined by the
 * rotation, translation, and scaling components.
 *
 * @param {x3dom.fields.Quaternion} rotation    - the rotation part
 * @param {x3dom.fields.SFVec3f}    translation - the 3D translation vector
 * @param {x3dom.fields.SFVec3f}    scale       - the non-uniform scaling
 *                                                factors
 * @returns {x3dom.fields.SFMatrix4f} the created transformation matrix
 */
x3dom.fields.SFMatrix4f.fromRotationTranslationScale = function ( rotation, translation, scale )
{
    translation = translation || new x3dom.fields.SFVec3f(); //[ 0.2, -0.3, -0.3 ];
    rotation    = rotation || new x3dom.fields.Quaternion();
    scale       = scale || new x3dom.fields.SFVec3f( 1, 1, 1 );
    var m       = new x3dom.fields.SFMatrix4f();

    var x = rotation.x,
        y = rotation.y,
        z = rotation.z,
        w = rotation.w;

    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;

    m._00 = ( 1 - ( yy + zz ) ) * scale.x;
    m._10 = ( xy + wz ) * scale.x;
    m._20 = ( xz - wy ) * scale.x;
    m._30 = 0;
    m._01 = ( xy - wz ) * scale.y;
    m._11 = ( 1 - ( xx + zz ) ) * scale.y;
    m._21 = ( yz + wx ) * scale.y;
    m._31 = 0;
    m._02 = ( xz + wy ) * scale.z;
    m._12 = ( yz - wx ) * scale.z;
    m._22 = ( 1 - ( xx + yy ) ) * scale.z;
    m._32 = 0;
    m._03 = translation.x;
    m._13 = translation.y;
    m._23 = translation.z;
    m._33 = 1;

    return m;
};

/**
 * Returns a column major version of this matrix, packed into a single
 * array.
 *
 * @returns {Number[]} resulting array of 16 values
 */
x3dom.fields.SFMatrix4f.prototype.toGL = function ()
{
    return [
        this._00, this._10, this._20, this._30,
        this._01, this._11, this._21, this._31,
        this._02, this._12, this._22, this._32,
        this._03, this._13, this._23, this._33
    ];
};

/**
 * Creates and returns a new ``SFMatrix4f'' with the elements,
 * construed as being in column-major format, copied from the supplied
 * array.
 *
 * @param   {Number[]} array - an array of at least 16 numbers,
 *                             the first 16 of which will be construed
 *                             as the new matrix data in column-major
 *                             format
 * @returns {SFMatrix4f} a new matrix based upon the ``array''
 *                       data transferred from its imputed column-major
 *                       format into the row-major format
 */
x3dom.fields.SFMatrix4f.fromGL = function ( array )
{
    var newMatrix = new x3dom.fields.SFMatrix4f();
    newMatrix._00 = array[ 0 ];
    newMatrix._01 = array[ 4 ];
    newMatrix._02 = array[ 8 ];
    newMatrix._03 = array[ 12 ];
    newMatrix._10 = array[ 1 ];
    newMatrix._11 = array[ 5 ];
    newMatrix._12 = array[ 9 ];
    newMatrix._13 = array[ 13 ];
    newMatrix._20 = array[ 2 ];
    newMatrix._21 = array[ 6 ];
    newMatrix._22 = array[ 10 ];
    newMatrix._23 = array[ 14 ];
    newMatrix._30 = array[ 3 ];
    newMatrix._31 = array[ 7 ];
    newMatrix._32 = array[ 11 ];
    newMatrix._33 = array[ 15 ];
    return newMatrix;
};

/**
 * Returns the value of this matrix at a given position.
 *
 * @param {Number} i - row index (starting with 0)
 * @param {Number} j - column index (starting with 0)
 * @returns {Number} the entry at the specified position
 */
x3dom.fields.SFMatrix4f.prototype.at = function ( i, j )
{
    var field = "_" + i + j;
    return this[ field ];
};

/**
 * Sets the value of this matrix at a given position.
 *
 * @param {Number} i - row index (starting with 0)
 * @param {Number} j - column index (starting with 0)
 * @param {Number} newEntry - the new value to store at position (i, j)
 * @returns {x3dom.fields.SFMatrix4f} this modified matrix
 */
x3dom.fields.SFMatrix4f.prototype.setAt = function ( i, j, newEntry )
{
    var field = "_" + i + j;
    this[ field ] = newEntry;
    return this;
};

/**
 * Computes the square root of the matrix, assuming that its determinant
 * is greater than zero.
 *
 * @returns {SFMatrix4f} a matrix containing the result
 */
x3dom.fields.SFMatrix4f.prototype.sqrt = function ()
{
    var Y = x3dom.fields.SFMatrix4f.identity();
    var result = x3dom.fields.SFMatrix4f.copy( this );

    for ( var i = 0; i < 6; i++ )
    {
        var iX = result.inverse();
        var iY = ( i == 0 ) ? x3dom.fields.SFMatrix4f.identity() : Y.inverse();

        var rd = result.det(),
            yd = Y.det();

        var g = Math.abs( Math.pow( rd * yd, -0.125 ) );
        var ig = 1.0 / g;

        result = result.multiply( g );
        result = result.addScaled( iY, ig );
        result = result.multiply( 0.5 );

        Y = Y.multiply( g );
        Y = Y.addScaled( iX, ig );
        Y = Y.multiply( 0.5 );
    }

    return result;
};

/**
 * Returns the largest absolute value of all entries in the matrix.
 * This is only a helper for calculating log and not the usual
 * Infinity-norm for matrices.
 *
 * @returns {Number} the largest absolute value
 */
x3dom.fields.SFMatrix4f.prototype.normInfinity = function ()
{
    var t = 0,
        m = 0;

    if ( ( t = Math.abs( this._00 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._01 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._02 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._03 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._10 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._11 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._12 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._13 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._20 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._21 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._22 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._23 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._30 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._31 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._32 ) ) > m )
    {
        m = t;
    }
    if ( ( t = Math.abs( this._33 ) ) > m )
    {
        m = t;
    }

    return m;
};

/**
 * Returns the 1-norm of the upper left 3x3 part of this matrix.
 * The 1-norm is also known as maximum absolute column sum norm.
 *
 * @returns {Number} the resulting number
 */
x3dom.fields.SFMatrix4f.prototype.norm1_3x3 = function ()
{
    var max = Math.abs( this._00 ) +
              Math.abs( this._10 ) +
              Math.abs( this._20 );
    var t = 0;

    if ( ( t = Math.abs( this._01 ) +
             Math.abs( this._11 ) +
             Math.abs( this._21 ) ) > max )
    {
        max = t;
    }

    if ( ( t = Math.abs( this._02 ) +
             Math.abs( this._12 ) +
             Math.abs( this._22 ) ) > max )
    {
        max = t;
    }

    return max;
};

/**
 * Returns the infinity-norm of the upper left 3x3 part of this matrix.
 * The infinity-norm is also known as maximum absolute row sum norm.
 *
 * @returns {Number} the resulting number
 */
x3dom.fields.SFMatrix4f.prototype.normInf_3x3 = function ()
{
    var max = Math.abs( this._00 ) +
              Math.abs( this._01 ) +
              Math.abs( this._02 );
    var t = 0;

    if ( ( t = Math.abs( this._10 ) +
             Math.abs( this._11 ) +
             Math.abs( this._12 ) ) > max )
    {
        max = t;
    }

    if ( ( t = Math.abs( this._20 ) +
             Math.abs( this._21 ) +
             Math.abs( this._22 ) ) > max )
    {
        max = t;
    }

    return max;
};

/**
 * Computes the transposed adjoint of the upper left 3x3 part of this
 * matrix, and stores it in the upper left part of a new 4x4 identity
 * matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} the resulting matrix
 */
x3dom.fields.SFMatrix4f.prototype.adjointT_3x3 = function ()
{
    var result = x3dom.fields.SFMatrix4f.identity();

    result._00 = this._11 * this._22 - this._12 * this._21;
    result._01 = this._12 * this._20 - this._10 * this._22;
    result._02 = this._10 * this._21 - this._11 * this._20;

    result._10 = this._21 * this._02 - this._22 * this._01;
    result._11 = this._22 * this._00 - this._20 * this._02;
    result._12 = this._20 * this._01 - this._21 * this._00;

    result._20 = this._01 * this._12 - this._02 * this._11;
    result._21 = this._02 * this._10 - this._00 * this._12;
    result._22 = this._00 * this._11 - this._01 * this._10;

    return result;
};

/**
 * Checks whether this matrix equals another matrix.
 *
 * @param {x3dom.fields.SFMatrix4f} that - the other matrix
 * @returns {Boolean}
 */
x3dom.fields.SFMatrix4f.prototype.equals = function ( that )
{
    var eps = 0.000000000001;
    return Math.abs( this._00 - that._00 ) < eps && Math.abs( this._01 - that._01 ) < eps &&
           Math.abs( this._02 - that._02 ) < eps && Math.abs( this._03 - that._03 ) < eps &&
           Math.abs( this._10 - that._10 ) < eps && Math.abs( this._11 - that._11 ) < eps &&
           Math.abs( this._12 - that._12 ) < eps && Math.abs( this._13 - that._13 ) < eps &&
           Math.abs( this._20 - that._20 ) < eps && Math.abs( this._21 - that._21 ) < eps &&
           Math.abs( this._22 - that._22 ) < eps && Math.abs( this._23 - that._23 ) < eps &&
           Math.abs( this._30 - that._30 ) < eps && Math.abs( this._31 - that._31 ) < eps &&
           Math.abs( this._32 - that._32 ) < eps && Math.abs( this._33 - that._33 ) < eps;
};

/**
 * Decomposes the matrix into a translation, rotation, scale,
 * and scale orientation. Any projection information is discarded.
 * The decomposition depends upon choice of center point for rotation
 * and scaling, which is optional as the last parameter.
 *
 * @param {x3dom.fields.SFVec3f}    translation -
 *          3D vector to be filled with the translation values
 * @param {x3dom.fields.Quaternion} rotation -
 *          quaternion to be filled with the rotation values
 * @param {x3dom.fields.SFVec3f}    scaleFactor -
 *          3D vector to be filled with the scale factors
 * @param {x3dom.fields.Quaternion} scaleOrientation -
 *          rotation (quaternion) to be applied before scaling
 * @param {x3dom.fields.SFVec3f}   [center=undefined] -
 *          center point for rotation and scaling, if not origin
 */
x3dom.fields.SFMatrix4f.prototype.getTransform = function (
    translation, rotation, scaleFactor, scaleOrientation, center )
{
    var m = null;

    if ( arguments.length > 4 )
    {
        m = x3dom.fields.SFMatrix4f.translation( center.negate() );
        m = m.mult( this );

        var c = x3dom.fields.SFMatrix4f.translation( center );
        m = m.mult( c );
    }
    else
    {
        m = x3dom.fields.SFMatrix4f.copy( this );
    }

    var flip = m.decompose( translation, rotation, scaleFactor,
        scaleOrientation );

    scaleFactor.setValues( scaleFactor.multiply( flip ) );
};

/**
 * Computes the decomposition of the given 4x4 affine matrix M as
 * M = T F R SO S SO^t, where T is a translation matrix,
 * F is +/- I (a reflection), R is a rotation matrix,
 * SO is a rotation matrix and S is a (nonuniform) scale matrix.
 *
 * @param {x3dom.fields.SFVec3f} t     -
 *          3D vector to be filled with the translation values
 * @param {x3dom.fields.Quaternion} r  -
 *          quaternion to be filled with the rotation values
 * @param {x3dom.fields.SFVec3f} s     -
 *          3D vector to be filled with the scale factors
 * @param {x3dom.fields.Quaternion} so -
 *          rotation (quaternion) to be applied before scaling
 * @returns {Number} signum of determinant of the transposed adjoint
 *                   upper 3x3 matrix
 */
x3dom.fields.SFMatrix4f.prototype.decompose = function ( t, r, s, so )
{
    var A  = x3dom.fields.SFMatrix4f.copy( this );

    var Q  = x3dom.fields.SFMatrix4f.identity(),
        S  = x3dom.fields.SFMatrix4f.identity(),
        SO = x3dom.fields.SFMatrix4f.identity();

    t.x = A._03;
    t.y = A._13;
    t.z = A._23;

    A._03 = 0.0;
    A._13 = 0.0;
    A._23 = 0.0;

    A._30 = 0.0;
    A._31 = 0.0;
    A._32 = 0.0;

    var det = A.polarDecompose( Q, S );
    var f = 1.0;

    if ( det < 0.0 )
    {
        Q = Q.negate();
        f = -1.0;
    }

    r.setValue( Q );

    S.spectralDecompose( SO, s );

    so.setValue( SO );

    return f;
};

/**
 * Performs a polar decomposition of this matrix A into two matrices
 * Q and S, so that A = QS.
 *
 * @param {x3dom.fields.SFMatrix4f} Q - first resulting matrix
 * @param {x3dom.fields.SFMatrix4f} S - first resulting matrix
 * @returns {Number} determinant of the transposed adjoint upper 3x3
 *                   matrix
 */
x3dom.fields.SFMatrix4f.prototype.polarDecompose = function ( Q, S )
{
    var TOL = 0.000000000001;

    var Mk = this.transpose();
    var Ek = x3dom.fields.SFMatrix4f.identity();

    var Mk_one = Mk.norm1_3x3();
    var Mk_inf = Mk.normInf_3x3();

    var MkAdjT,
        MkAdjT_one,
        MkAdjT_inf,
        Ek_one,
        Mk_det;

    do
    {
        // compute transpose of adjoint
        MkAdjT = Mk.adjointT_3x3();

        // Mk_det = det(Mk) -- computed from the adjoint
        Mk_det = Mk._00 * MkAdjT._00 +
            Mk._01 * MkAdjT._01 +
            Mk._02 * MkAdjT._02;

        // TODO: should this be a close to zero test ?
        if ( Mk_det == 0.0 )
        {
            x3dom.debug.logWarning( "polarDecompose: Mk_det == 0.0" );
            break;
        }

        MkAdjT_one = MkAdjT.norm1_3x3();
        MkAdjT_inf = MkAdjT.normInf_3x3();

        // compute update factors
        var gamma = Math.sqrt( Math.sqrt( ( MkAdjT_one * MkAdjT_inf ) /
            ( Mk_one * Mk_inf ) ) / Math.abs( Mk_det ) );

        var g1 = 0.5 * gamma;
        var g2 = 0.5 / ( gamma * Mk_det );

        Ek.setValues( Mk );

        Mk = Mk.multiply( g1 );         // this does:
        Mk = Mk.addScaled( MkAdjT, g2 ); // Mk = g1 * Mk + g2 * MkAdjT
        Ek = Ek.addScaled( Mk, -1.0 );   // Ek -= Mk;

        Ek_one = Ek.norm1_3x3();
        Mk_one = Mk.norm1_3x3();
        Mk_inf = Mk.normInf_3x3();
    } while ( Ek_one > ( Mk_one * TOL ) );

    Q.setValues( Mk.transpose() );
    S.setValues( Mk.mult( this ) );

    for ( var i = 0; i < 3; ++i )
    {
        for ( var j = i; j < 3; ++j )
        {
            S.setAt( j, i, 0.5 * ( S.at( j, i ) + S.at( i, j ) ) );
            S.setAt( i, j, 0.5 * ( S.at( j, i ) + S.at( i, j ) ) );
        }
    }

    return Mk_det;
};

/**
 * Performs a spectral decomposition of this matrix.
 *
 * @param {x3dom.fields.SFMatrix4f} SO - resulting matrix
 * @param {x3dom.fields.SFVec3f} k - resulting vector
 */
x3dom.fields.SFMatrix4f.prototype.spectralDecompose = function ( SO, k )
{
    var next = [ 1, 2, 0 ];
    var maxIterations = 20;
    var diag = [ this._00, this._11, this._22 ];
    var offDiag = [ this._12, this._20, this._01 ];

    for ( var iter = 0; iter < maxIterations; ++iter )
    {
        var sm =   Math.abs( offDiag[ 0 ] )
                 + Math.abs( offDiag[ 1 ] )
                 + Math.abs( offDiag[ 2 ] );

        if ( sm == 0 )
        {
            break;
        }

        for ( var i = 2; i >= 0; --i )
        {
            var p = next[ i ];
            var q = next[ p ];

            var absOffDiag = Math.abs( offDiag[ i ] );
            var g = 100.0 * absOffDiag;

            if ( absOffDiag > 0.0 )
            {
                var t = 0,
                    h = diag[ q ] - diag[ p ];
                var absh = Math.abs( h );

                if ( absh + g == absh )
                {
                    t = offDiag[ i ] / h;
                }
                else
                {
                    var theta = 0.5 * h / offDiag[ i ];
                    t =   1.0 / ( Math.abs( theta )
                        + Math.sqrt( theta * theta + 1.0 ) );

                    t = theta < 0.0 ? -t : t;
                }

                var c = 1.0 / Math.sqrt( t * t + 1.0 );
                var s = t * c;

                var tau = s / ( c + 1.0 );
                var ta = t * offDiag[ i ];

                offDiag[ i ] = 0.0;

                diag[ p ] -= ta;
                diag[ q ] += ta;

                var offDiagq = offDiag[ q ];

                offDiag[ q ] -= s * ( offDiag[ p ] + tau * offDiagq );
                offDiag[ p ] += s * ( offDiagq - tau * offDiag[ p ] );

                for ( var j = 2; j >= 0; --j )
                {
                    var a = SO.at( j, p );
                    var b = SO.at( j, q );

                    SO.setAt( j, p, SO.at( j, p ) - s * ( b + tau * a ) );
                    SO.setAt( j, q, SO.at( j, q ) + s * ( a - tau * b ) );
                }
            }
        }
    }

    k.x = diag[ 0 ];
    k.y = diag[ 1 ];
    k.z = diag[ 2 ];
};

/**
 * Computes the logarithm of this matrix, assuming that its determinant
 * is greater than zero.
 *
 * @returns {x3dom.fields.SFMatrix4f} log of matrix
 */
x3dom.fields.SFMatrix4f.prototype.log = function ()
{
    var maxiter = 12;
    var eps = 1e-12;

    var A = x3dom.fields.SFMatrix4f.copy( this );
    var Z = x3dom.fields.SFMatrix4f.copy( this );

    // Take repeated square roots to reduce spectral radius
    Z._00 -= 1;
    Z._11 -= 1;
    Z._22 -= 1;
    Z._33 -= 1;

    var k = 0;

    while ( Z.normInfinity() > 0.5 )
    {
        A = A.sqrt();
        Z.setValues( A );

        Z._00 -= 1;
        Z._11 -= 1;
        Z._22 -= 1;
        Z._33 -= 1;

        k++;
    }

    A._00 -= 1;
    A._11 -= 1;
    A._22 -= 1;
    A._33 -= 1;

    A = A.negate();
    Z.setValues( A );

    var result = x3dom.fields.SFMatrix4f.copy( A );
    var i = 1;

    while ( Z.normInfinity() > eps && i < maxiter )
    {
        Z = Z.mult( A );
        i++;

        result = result.addScaled( Z, 1.0 / i );
    }

    return result.multiply( -( 1 << k ) );
};

/**
 * Computes the exponential of this matrix.
 *
 * @returns {x3dom.fields.SFMatrix4f} exp of matrix
 */
x3dom.fields.SFMatrix4f.prototype.exp = function ()
{
    var q = 6;
    var A = x3dom.fields.SFMatrix4f.copy( this ),
        D = x3dom.fields.SFMatrix4f.identity(),
        N = x3dom.fields.SFMatrix4f.identity(),
        result = x3dom.fields.SFMatrix4f.identity();
    var k = 0,
        c = 1.0;

    var j = 1.0 + parseInt( Math.log( A.normInfinity() / 0.693 ) );
    // var j = 1.0 + (Math.log(A.normInfinity() / 0.693) | 0);

    if ( j < 0 )
    {
        j = 0;
    }

    A = A.multiply( 1.0 / ( 1 << j ) );

    for ( k = 1; k <= q; k++ )
    {
        c *= ( q - k + 1 ) / ( k * ( 2 * q - k + 1 ) );

        result = A.mult( result );

        N = N.addScaled( result, c );

        if ( k % 2 )
        {
            D = D.addScaled( result, -c );
        }
        else
        {
            D = D.addScaled( result, c );
        }
    }

    result = D.inverse().mult( N );

    for ( k = 0; k < j; k++ )
    {
        result = result.mult( result );
    }

    return result;
};

/**
 * Computes a determinant for a 3x3 matrix m, given as values in
 * row major order.
 *
 * @param {Number} a1 - value of m at (0,0)
 * @param {Number} a2 - value of m at (0,1)
 * @param {Number} a3 - value of m at (0,2)
 * @param {Number} b1 - value of m at (1,0)
 * @param {Number} b2 - value of m at (1,1)
 * @param {Number} b3 - value of m at (1,2)
 * @param {Number} c1 - value of m at (2,0)
 * @param {Number} c2 - value of m at (2,1)
 * @param {Number} c3 - value of m at (2,2)
 * @returns {Number} determinant
 */
x3dom.fields.SFMatrix4f.prototype.det3 = function ( a1, a2, a3,
    b1, b2, b3,
    c1, c2, c3 )
{
    return ( ( a1 * b2 * c3 ) + ( a2 * b3 * c1 ) + ( a3 * b1 * c2 ) -
        ( a1 * b3 * c2 ) - ( a2 * b1 * c3 ) - ( a3 * b2 * c1 ) );
};

/**
 * Computes the determinant of this matrix.
 *
 * @returns {Number} determinant
 */
x3dom.fields.SFMatrix4f.prototype.det = function ()
{
    var a1 = this._00;
    var b1 = this._10;
    var c1 = this._20;
    var d1 = this._30;

    var a2 = this._01;
    var b2 = this._11;
    var c2 = this._21;
    var d2 = this._31;

    var a3 = this._02;
    var b3 = this._12;
    var c3 = this._22;
    var d3 = this._32;

    var a4 = this._03;
    var b4 = this._13;
    var c4 = this._23;
    var d4 = this._33;

    return ( a1 * this.det3( b2, b3, b4, c2, c3, c4, d2, d3, d4 ) -
        b1 * this.det3( a2, a3, a4, c2, c3, c4, d2, d3, d4 ) +
        c1 * this.det3( a2, a3, a4, b2, b3, b4, d2, d3, d4 ) -
        d1 * this.det3( a2, a3, a4, b2, b3, b4, c2, c3, c4 ) );
};

/**
 * Computes the inverse of this matrix, given that it is not singular.
 *
 * @returns {x3dom.fields.SFMatrix4f} the inverse of this matrix
 */
x3dom.fields.SFMatrix4f.prototype.inverse = function ()
{
    var a1 = this._00;
    var b1 = this._10;
    var c1 = this._20;
    var d1 = this._30;

    var a2 = this._01;
    var b2 = this._11;
    var c2 = this._21;
    var d2 = this._31;

    var a3 = this._02;
    var b3 = this._12;
    var c3 = this._22;
    var d3 = this._32;

    var a4 = this._03;
    var b4 = this._13;
    var c4 = this._23;
    var d4 = this._33;

    var rDet = this.det();

    // if (Math.abs(rDet) < 1e-30)
    if ( rDet == 0 )
    {
        x3dom.debug.logWarning( "Invert matrix: singular matrix, " +
                                "no inverse!" );
        return x3dom.fields.SFMatrix4f.identity();
    }

    rDet = 1.0 / rDet;

    return new x3dom.fields.SFMatrix4f(
        +this.det3( b2, b3, b4, c2, c3, c4, d2, d3, d4 ) * rDet,
        -this.det3( a2, a3, a4, c2, c3, c4, d2, d3, d4 ) * rDet,
        +this.det3( a2, a3, a4, b2, b3, b4, d2, d3, d4 ) * rDet,
        -this.det3( a2, a3, a4, b2, b3, b4, c2, c3, c4 ) * rDet,
        -this.det3( b1, b3, b4, c1, c3, c4, d1, d3, d4 ) * rDet,
        +this.det3( a1, a3, a4, c1, c3, c4, d1, d3, d4 ) * rDet,
        -this.det3( a1, a3, a4, b1, b3, b4, d1, d3, d4 ) * rDet,
        +this.det3( a1, a3, a4, b1, b3, b4, c1, c3, c4 ) * rDet,
        +this.det3( b1, b2, b4, c1, c2, c4, d1, d2, d4 ) * rDet,
        -this.det3( a1, a2, a4, c1, c2, c4, d1, d2, d4 ) * rDet,
        +this.det3( a1, a2, a4, b1, b2, b4, d1, d2, d4 ) * rDet,
        -this.det3( a1, a2, a4, b1, b2, b4, c1, c2, c4 ) * rDet,
        -this.det3( b1, b2, b3, c1, c2, c3, d1, d2, d3 ) * rDet,
        +this.det3( a1, a2, a3, c1, c2, c3, d1, d2, d3 ) * rDet,
        -this.det3( a1, a2, a3, b1, b2, b3, d1, d2, d3 ) * rDet,
        +this.det3( a1, a2, a3, b1, b2, b3, c1, c2, c3 ) * rDet
    );
};

/**
 * Returns an array of 2*3 = 6 euler angles (in radians), assuming that
 * this is a rotation matrix. The first three and the second three
 * values are alternatives for the three euler angles, where each of the
 * two cases leads to the same resulting rotation.
 *
 * @returns {Number[]} an array of 6 Euler angles in radians, each
 *                     consecutive triple of which represents one of the
 *                     two alternative choices for the same rotation
 */
x3dom.fields.SFMatrix4f.prototype.getEulerAngles = function ()
{
    var theta_1,
        theta_2,
        theta,
        phi_1,
        phi_2,
        phi,
        psi_1,
        psi_2,
        psi,
        cos_theta_1,
        cos_theta_2;

    if ( Math.abs( ( Math.abs( this._20 ) - 1.0 ) ) > 0.0001 )
    {
        theta_1 = -Math.asin( this._20 );
        theta_2 = Math.PI - theta_1;

        cos_theta_1 = Math.cos( theta_1 );
        cos_theta_2 = Math.cos( theta_2 );

        psi_1 = Math.atan2( this._21 / cos_theta_1, this._22 / cos_theta_1 );
        psi_2 = Math.atan2( this._21 / cos_theta_2, this._22 / cos_theta_2 );

        phi_1 = Math.atan2( this._10 / cos_theta_1, this._00 / cos_theta_1 );
        phi_2 = Math.atan2( this._10 / cos_theta_2, this._00 / cos_theta_2 );

        return [ psi_1, theta_1, phi_1,
            psi_2, theta_2, phi_2 ];
    }
    else
    {
        phi = 0;

        if ( this._20 == -1.0 )
        {
            theta = Math.PI / 2.0;
            psi = phi + Math.atan2( this._01, this._02 );
        }
        else
        {
            theta = -( Math.PI / 2.0 );
            psi = -phi + Math.atan2( -this._01, -this._02 );
        }

        return [ psi, theta, phi,
            psi, theta, phi ];
    }
};

/**
 * Converts this matrix to a string representation, where all entries
 * are separated by whitespaces.
 *
 * @returns {String} a string representation of this matrix
 */
x3dom.fields.SFMatrix4f.prototype.toString = function ()
{
    return this._00.toFixed( 6 ) + " " + this._10.toFixed( 6 ) + " " +
           this._20.toFixed( 6 ) + " " + this._30.toFixed( 6 ) + " " +
           this._01.toFixed( 6 ) + " " + this._11.toFixed( 6 ) + " " +
           this._21.toFixed( 6 ) + " " + this._31.toFixed( 6 ) + " " +
           this._02.toFixed( 6 ) + " " + this._12.toFixed( 6 ) + " " +
           this._22.toFixed( 6 ) + " " + this._32.toFixed( 6 ) + " " +
           this._03.toFixed( 6 ) + " " + this._13.toFixed( 6 ) + " " +
           this._23.toFixed( 6 ) + " " + this._33.toFixed( 6 );
};

/**
 * Fills the values of this matrix from a string, where the entries are
 * separated by commas or whitespace, and given in column-major order.
 *
 * @param {String} str - the string representation
 */
x3dom.fields.SFMatrix4f.prototype.setValueByStr = function ( str )
{
    var needTranspose = false;
    var val = /matrix.*\((.+)\)/;
    // check if matrix is set via CSS string
    if ( val.exec( str ) )
    {
        str = RegExp.$1;
        needTranspose = true;
    }
    var arr = str.split( /[,\s]+/ ).map( function ( n ){ return +n; } );
    if ( arr.length >= 16 )
    {
        if ( !needTranspose )
        {
            this._00 = arr[ 0 ];  this._01 = arr[ 1 ]; this._02 = arr[ 2 ];  this._03 = arr[ 3 ];
            this._10 = arr[ 4 ];  this._11 = arr[ 5 ]; this._12 = arr[ 6 ];  this._13 = arr[ 7 ];
            this._20 = arr[ 8 ];  this._21 = arr[ 9 ]; this._22 = arr[ 10 ]; this._23 = arr[ 11 ];
            this._30 = arr[ 12 ]; this._31 = arr[ 13 ]; this._32 = arr[ 14 ]; this._33 = arr[ 15 ];
        }
        else
        {
            this._00 = arr[ 0 ];  this._01 = arr[ 4 ]; this._02 = arr[ 8 ];  this._03 = arr[ 12 ];
            this._10 = arr[ 1 ];  this._11 = arr[ 5 ]; this._12 = arr[ 9 ];  this._13 = arr[ 13 ];
            this._20 = arr[ 2 ];  this._21 = arr[ 6 ]; this._22 = arr[ 10 ]; this._23 = arr[ 14 ];
            this._30 = arr[ 3 ];  this._31 = arr[ 7 ]; this._32 = arr[ 11 ]; this._33 = arr[ 15 ];
        }
    }
    else if ( arr.length === 6 )
    {
        this._00 = arr[ 0 ]; this._01 = arr[ 1 ]; this._02 = 0; this._03 = arr[ 4 ];
        this._10 = arr[ 2 ]; this._11 = arr[ 3 ]; this._12 = 0; this._13 = arr[ 5 ];
        this._20 = 0; this._21 = 0; this._22 = 1; this._23 = 0;
        this._30 = 0; this._31 = 0; this._32 = 0; this._33 = 1;
    }
    else
    {
        x3dom.debug.logWarning( "SFMatrix4f - can't parse string: " + str );
    }

    return this;
};

/**
 * SFVec2f constructor.
 *
 * Represents a two-dimensional vector, the components of which, all
 * being numbers, can be accessed and modified directly.
 *
 * @class Represents a SFVec2f
 */
x3dom.fields.SFVec2f = function ( x, y )
{
    if ( arguments.length === 0 )
    {
        this.x = 0;
        this.y = 0;
    }
    else
    {
        this.x = x;
        this.y = y;
    }
};

/**
 * Returns a copy of the given 2D vector.
 *
 * @param   {x3dom.fields.SFVec2f} v - the vector to copy
 * @returns {x3dom.fields.SFVec2f} the copy of the input vector
 */
x3dom.fields.SFVec2f.copy = function ( v )
{
    return new x3dom.fields.SFVec2f( v.x, v.y );
};

x3dom.fields.SFVec2f.parse = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    if ( m === null ) {return new x3dom.fields.SFVec2f();}
    return new x3dom.fields.SFVec2f( +m[ 1 ], +m[ 2 ] );
};

/**
 * Returns a copy of this 2D vector.
 *
 * @returns {x3dom.fields.SFVec2f} the copy of this vector
 */
x3dom.fields.SFVec2f.prototype.copy = function ()
{
    return x3dom.fields.SFVec2f.copy( this );
};

/**
 * Sets this vector's components from another vector, and returns this
 * modified vector.
 *
 * @param {x3dom.fields.SFVec2f} that - the vector to copy from
 * @returns {x3dom.fields.SFVec2f} this modified vector
 */
x3dom.fields.SFVec2f.prototype.setValues = function ( that )
{
    this.x = that.x;
    this.y = that.y;

    return this;
};

/**
 * Returns the vector component at the given index.
 *
 * @param {Number} i - the index of the vector component to obtain,
 *                     with 0 being the x-coordinate, 1 being the
 *                     y-coordinate, and any other value defaulting to
 *                     the x-coordinate
 * @returns {Number} the vector component at the specified index
 */
x3dom.fields.SFVec2f.prototype.at = function ( i )
{
    switch ( i )
    {
        case 0:  return this.x;
        case 1:  return this.y;
        default: return this.x;
    }
};

/**
 * Returns a new vector as the sum of adding another vector to this one.
 *
 * @param   {x3dom.fields.SFVec2f} that - the vector to add to this
 *                                        vector
 * @returns {x3dom.fields.SFVec2f} a new vector holding the sum
 */
x3dom.fields.SFVec2f.prototype.add = function ( that )
{
    return new x3dom.fields.SFVec2f( this.x + that.x, this.y + that.y );
};

/**
 * Returns a new vector as the difference between this vector and
 * another one subtracted from it.
 *
 * @param {x3dom.fields.SFVec2f} that - the vector to deduct from this
 *                                      vector
 * @returns {x3dom.fields.SFVec2f} a new vector holding the difference
 */
x3dom.fields.SFVec2f.prototype.subtract = function ( that )
{
    return new x3dom.fields.SFVec2f( this.x - that.x, this.y - that.y );
};

/**
 * Returns a negated version of this vector.
 *
 * @returns {x3dom.fields.SFVec2f} a negated version of this vector
 */
x3dom.fields.SFVec2f.prototype.negate = function ()
{
    return new x3dom.fields.SFVec2f( -this.x, -this.y );
};

/**
 * Returns the dot product between this vector and another one.
 *
 * @param {x3dom.fields.SFVec2f} that - the right-hand side vector
 * @returns {Number} the dot product between this and the other vector
 */
x3dom.fields.SFVec2f.prototype.dot = function ( that )
{
    return this.x * that.x + this.y * that.y;
};

/**
 * Returns the vector obtained by reflecting this vector at another one.
 *
 * @param {x3dom.fields.SFVec2f} n - the vector to reflect this one at
 * @returns {x3dom.fields.SFVec2f} the reflection vector
 */
x3dom.fields.SFVec2f.prototype.reflect = function ( n )
{
    var d2 = this.dot( n ) * 2;
    return new x3dom.fields.SFVec2f( this.x - d2 * n.x, this.y - d2 * n.y );
};

/**
 * Returns a normalized version of this vector.
 *
 * If this vector's magnitude equals zero, the resulting will be the
 * zero vector.
 *
 * @returns {x3dom.fields.SFVec2f} a new normalized vector based on
 *                                 this one
 */
x3dom.fields.SFVec2f.prototype.normalize = function ()
{
    var n = this.length();
    if ( n ) { n = 1.0 / n; }
    return new x3dom.fields.SFVec2f( this.x * n, this.y * n );
};

/**
 * Returns the product of the componentwise multiplication of this
 * vector with another one.
 *
 * @param {x3dom.fields.SFVec2f} that - the multiplicand (right) vector
 * @returns {x3dom.fields.SFVec2f} a new vector as product of a
 *                                 componentwise multiplication of this
 *                                 vector with the other one
 */
x3dom.fields.SFVec2f.prototype.multComponents = function ( that )
{
    return new x3dom.fields.SFVec2f( this.x * that.x, this.y * that.y );
};

/**
 * Returns a scaled version of this vector.
 *
 * @param {Number} n - the scalar scaling factor for this vector
 * @returns {x3dom.fields.SFVec2f} a new vector obtained by scaling this
 *                                one by the given factor
 */
x3dom.fields.SFVec2f.prototype.multiply = function ( n )
{
    return new x3dom.fields.SFVec2f( this.x * n, this.y * n );
};

/**
 * Returns the quotient of this vector componentwise divided by another
 * one.
 *
 * @param {x3dom.fields.SFVec2f} that - the divisor vector to divide by
 * @returns {x3dom.fields.SFVec2f} the quotient obtained by componentwise
 *                                 division of this vector by the other
 */
x3dom.fields.SFVec2f.prototype.divideComponents = function ( that )
{
    return new x3dom.fields.SFVec2f( this.x / that.x, this.y / that.y );
};

/**
 * Returns a version of this vector with its components divided by
 * the scalar factor.
 *
 * @param {Number} n - the scalar factor to divide the components by
 * @returns {x3dom.fields.SFVec2f} a new vector obtained by dividing
 *                                 this one's components by the scalar
 */
x3dom.fields.SFVec2f.prototype.divide = function ( n )
{
    var denom = n ? ( 1.0 / n ) : 1.0;
    return new x3dom.fields.SFVec2f( this.x * denom, this.y * denom );
};

/**
 * Checks whether this vector equals another one, as defined by the
 * deviation tolerance among their components.
 *
 * @param {x3dom.fields.SFVec2f} that - the vector to compare to this one
 * @param {Number}               eps  - the tolerance of deviation
 *                                      within which not exactly equal
 *                                      components are still considered
 *                                      equal
 * @returns {Boolean} ``true'' if both vectors are equal or
 *                    approximately equal, ``false'' otherwise
 */
x3dom.fields.SFVec2f.prototype.equals = function ( that, eps )
{
    return Math.abs( this.x - that.x ) < eps &&
           Math.abs( this.y - that.y ) < eps;
};

/**
 * Returns the length, or magnitude, of this vector.
 *
 * @returns {Number} the magnitude of this vector
 */
x3dom.fields.SFVec2f.prototype.length = function ()
{
    return Math.sqrt( ( this.x * this.x ) + ( this.y * this.y ) );
};

/**
 * Returns the components of this vector as an array of two numbers,
 * suitable for interaction with OpenGL.
 *
 * @returns {Number[]} an array holding this vector's x- and
 *                     y-coordinates in this order
 */
x3dom.fields.SFVec2f.prototype.toGL = function ()
{
    return [ this.x, this.y ];
};

/**
 * Returns a string representation of this vector.
 *
 * @returns {String} a string representation of this vector
 */
x3dom.fields.SFVec2f.prototype.toString = function ()
{
    return this.x + " " + this.y;
};

/**
 * Parses a string and sets this vector's components to the values
 * obtained from it, returning this modified vector.
 *
 * @param {String} str - the string to parse the coordinates from
 * @returns {x3dom.fields.SFVec2f} this modified vector
 */
x3dom.fields.SFVec2f.prototype.setValueByStr = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    m = m || [ 0, 0, 0 ];
    this.x = +m[ 1 ];
    this.y = +m[ 2 ];
    return this;
};

/**
 * SFVec3f constructor.
 *
 * Represents a three-dimensional vector, the components of which, all
 * being numbers, can be accessed and modified directly.
 *
 * @class Represents a SFVec3f
 */
x3dom.fields.SFVec3f = function ( x, y, z )
{
    if ( arguments.length === 0 )
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    else
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
};

/**
 * The 3D zero vector.
 */
x3dom.fields.SFVec3f.NullVector = new x3dom.fields.SFVec3f( 0, 0, 0 );
/**
 * A 3D vector whose components all equal one.
 */
x3dom.fields.SFVec3f.OneVector  = new x3dom.fields.SFVec3f( 1, 1, 1 );

/**
 * Returns a copy of the supplied 3D vector.
 *
 * @param {x3dom.fields.SFVec3f} v - the vector to copy
 * @returns {x3dom.fields.SFVec3f} a copy of the input vector
 */
x3dom.fields.SFVec3f.copy = function ( v )
{
    return new x3dom.fields.SFVec3f( v.x, v.y, v.z );
};

/**
 * Returns a vector whose components are set to the smallest
 * representable value.
 *
 * @returns {x3dom.fields.SFVec3f} a vector with the smallest
 *                                 representable value for each component
 */
x3dom.fields.SFVec3f.MIN = function ()
{
    return new x3dom.fields.SFVec3f( -Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE );
};

/**
 * Returns a vector whose components are set to the largest
 * representable value.
 *
 * @returns {x3dom.fields.SFVec3f} a vector with the largest
 *                                 representable value for each component
 */
x3dom.fields.SFVec3f.MAX = function ()
{
    return new x3dom.fields.SFVec3f( Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE );
};

/**
 * Parses and returns a vector from a string representation.
 *
 * @param {String} str - the string to parse the vector data from
 * @returns {x3dom.fields.SFVec3f} a new vector parsed from the string
 */
x3dom.fields.SFVec3f.parse = function ( str )
{
    try
    {
        var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
        return new x3dom.fields.SFVec3f( +m[ 1 ], +m[ 2 ], +m[ 3 ] );
    }
    catch ( e )
    {
        // allow automatic type conversion as is convenient for shaders
        var c = x3dom.fields.SFColor.colorParse( str );
        return new x3dom.fields.SFVec3f( c.r, c.g, c.b );
    }
};

/**
 * Returns a copy of this vector.
 *
 * @returns {x3dom.fields.SFVec3f} a copy of this vector
 */
x3dom.fields.SFVec3f.prototype.copy = function ()
{
    return x3dom.fields.SFVec3f.copy( this );
};

/**
 * Sets the components of this vector from the supplied array.
 *
 * @param {Number[]} array - an array of at least three numbers, the
 *                           first three of which will become this
 *                           vector's x-, y-, and z-coordinates
 * @returns {x3dom.fields.SFVec3f} this modified vector
 */
x3dom.fields.SFVec3f.prototype.fromArray = function ( array )
{
    this.x = array[ 0 ];
    this.y = array[ 1 ];
    this.z = array[ 2 ];

    return this;
};

/**
 * Creates and returns a new 3D vector containin the elements of the
 * input array.
 *
 * @param {Number[]} array - an array of at least three numbers, the
 *                           first three of which will become the new
 *                           vector's x-, y-, and z-coordinates
 * @returns {x3dom.fields.SFVec3f} a new vector with the input array's
 *                                 values
 */
x3dom.fields.SFVec3f.fromArray = function ( array )
{
    return new x3dom.fields.SFVec3f( array[ 0 ], array[ 1 ], array[ 2 ] );
};

/**
 * Sets the components of this vector from another vector, and returns
 * this modified vector.
 *
 * @param {x3dom.fields.SFVec3f} that - the vector to copy from
 * @returns {x3dom.fields.SFVec3f} this modified vector
 */
x3dom.fields.SFVec3f.prototype.setValues = function ( that )
{
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;

    return this;
};

/**
 * Sets the components of this vector from supplied coordinates, and
 * returns this modified vector.
 *
 * @param {Number} x - the new x-coordinate
 * @param {Number} y - the new y-coordinate
 * @param {Number} z - the new z-coordinate
 * @returns {x3dom.fields.SFVec3f} this modified vector
 */
x3dom.fields.SFVec3f.prototype.set = function ( x, y, z )
{
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
};

/**
 * Returns the vector component with at the given index.
 *
 * If the index does not designate a valid component, per default the
 * x-coordinate is returned.
 *
 * @param {Number} i - the index of the vector component to access,
 *                     starting at zero
 * @returns {Number} the vector component at the given index, or the
 *                   x-component if invalid
 */
x3dom.fields.SFVec3f.prototype.at = function ( i )
{
    switch ( i )
    {
        case 0:  return this.x;
        case 1:  return this.y;
        case 2:  return this.z;
        default: return this.x;
    }
};

/**
 * Returns a new vector as the sum of adding another vector to this one.
 *
 * @param   {x3dom.fields.SFVec3f} that - the vector to add to this*
                                          vector
 * @returns {x3dom.fields.SFVec3f} a new vector holding the sum
 */
x3dom.fields.SFVec3f.prototype.add = function ( that )
{
    return new x3dom.fields.SFVec3f( this.x + that.x, this.y + that.y, this.z + that.z );
};

/**
 * Returns a new vector as the sum of adding another scaled vector,
 * scaled by the supplied scalar value, to this one.
 *
 * @param   {x3dom.fields.SFVec3f} that - the vector to scale and add to
 *                                        this one; will not be modified
 * @param   {Number}               s    - the factor to scale the
 *                                        ``that'' vector by
 *                                        before the addition
 * @returns {x3dom.fields.SFVec3f} a new vector holding the sum
 */
x3dom.fields.SFVec3f.prototype.addScaled = function ( that, s )
{
    return new x3dom.fields.SFVec3f( this.x + s * that.x, this.y + s * that.y, this.z + s * that.z );
};

/**
 * Returns a new vector as the difference between this vector and
 * another one subtracted from it.
 *
 * @param {x3dom.fields.SFVec3f} that - the vector to deduct from this
 *                                      vector
 * @returns {x3dom.fields.SFVec3f} a new vector holding the difference
 */
x3dom.fields.SFVec3f.prototype.subtract = function ( that )
{
    return new x3dom.fields.SFVec3f( this.x - that.x, this.y - that.y, this.z - that.z );
};

/**
 * Returns a new vector as the difference between two vectors.
 *
 * @param {x3dom.fields.SFVec3f} a - the vector to be deducted by the
 *                                   second one
 * @param {x3dom.fields.SFVec3f} b - the vector to deduct from the
 *                                   first one
 * @returns {x3dom.fields.SFVec3f} a new vector holding the difference
 */
x3dom.fields.SFVec3f.prototype.subtractVectors = function ( a, b )
{
    return new x3dom.fields.SFVec3f( a.x - b.x, a.y - b.y, a.z - b.z );
};

/**
 * Returns a version of this vector with all components negated.
 *
 * @returns {x3dom.fields.SFVec3f} a negated version of this vector
 */
x3dom.fields.SFVec3f.prototype.negate = function ()
{
    return new x3dom.fields.SFVec3f( -this.x, -this.y, -this.z );
};

/**
 * Returns the dot product between this vector and another one.
 *
 * @param {x3dom.fields.SFVec3f} that - the right-hand side vector
 * @returns {Number} the dot product between this vector and the other one
 */
x3dom.fields.SFVec3f.prototype.dot = function ( that )
{
    return ( this.x * that.x + this.y * that.y + this.z * that.z );
};

/**
 * Returns a new vector representing the cross product between this
 * vector and another one.
 *
 * @param {x3dom.fields.SFVec3f} that - the right-handside vector
 * @returns {x3dom.fields.SFVec3f} the cross product of the two vectors
 */
x3dom.fields.SFVec3f.prototype.cross = function ( that )
{
    return new x3dom.fields.SFVec3f( this.y * that.z - this.z * that.y,
        this.z * that.x - this.x * that.z,
        this.x * that.y - this.y * that.x );
};

/**
 * Returns the vector obtained by reflecting this vector at another one.
 *
 * @param {x3dom.fields.SFVec3f} n - the vector to reflect this one at
 * @returns {x3dom.fields.SFVec3f} the reflection vector
 */
x3dom.fields.SFVec3f.prototype.reflect = function ( n )
{
    var d2 = this.dot( n ) * 2;
    return new x3dom.fields.SFVec3f( this.x - d2 * n.x,
        this.y - d2 * n.y,
        this.z - d2 * n.z );
};

/**
 * Returns the magnitude, or length, of this vector.
 *
 * @returns {Number} the magnitude of this vector
 */
x3dom.fields.SFVec3f.prototype.length = function ()
{
    return Math.sqrt( ( this.x * this.x ) +
                      ( this.y * this.y ) +
                      ( this.z * this.z ) );
};

/**
 * Returns a normalized version of this vector.
 *
 * @returns {x3dom.fields.SFVec3f} a normalized version of this vector
 */
x3dom.fields.SFVec3f.prototype.normalize = function ()
{
    var n = this.length();
    if ( n ) { n = 1.0 / n; }
    return new x3dom.fields.SFVec3f( this.x * n, this.y * n, this.z * n );
};

/**
 * Returns a new vector obtained by componentwise multiplication of
 * this one with another vector.
 *
 * @param {x3dom.fields.SFVec3f} that - the vector whose components
 *                                      shall be multiplied with those
 *                                      of this vector
 * @returns {x3dom.fields.SFVec3f} the vector containing the
 *                                 componentwise multiplication product
 *                                 of this and the supplied vector
 */
x3dom.fields.SFVec3f.prototype.multComponents = function ( that )
{
    return new x3dom.fields.SFVec3f( this.x * that.x, this.y * that.y, this.z * that.z );
};

/**
 * Returns a new vector obtained by scaling this vector by the supplied
 * scalar factor.
 *
 * @param {Number} n - the scalar scaling factor for this vector
 * @returns {x3dom.fields.SFVec3f} a scaled version of this vector
 */
x3dom.fields.SFVec3f.prototype.multiply = function ( n )
{
    return new x3dom.fields.SFVec3f( this.x * n, this.y * n, this.z * n );
};

/**
 * Returns a new vector obtained by dividing this vector by the supplied
 * scalar factor.
 *
 * @param {Number} n - the scalar division factor for this vector
 * @returns {x3dom.fields.SFVec3f} a scaled version of this vector
 */
x3dom.fields.SFVec3f.prototype.divide = function ( n )
{
    var denom = n ? ( 1.0 / n ) : 1.0;
    return new x3dom.fields.SFVec3f( this.x * denom, this.y * denom, this.z * denom );
};

/**
 * Checks whether this vector equals another one, as defined by the
 * deviation tolerance among their components.
 *
 * @param {x3dom.fields.SFVec3f} that - the vector to compare to this one
 * @param {Number}               eps  - the tolerance of deviation
 *                                      within which not exactly equal
 *                                      components are still considered
 *                                      equal
 * @returns {Boolean} ``true'' if both vectors are equal or
 *                    approximately equal, ``false'' otherwise
 */
x3dom.fields.SFVec3f.prototype.equals = function ( that, eps )
{
    return Math.abs( this.x - that.x ) < eps &&
        Math.abs( this.y - that.y ) < eps &&
        Math.abs( this.z - that.z ) < eps;
};

/**
 * Returns a four-element array holding this vector's components in a
 * mode suitable for interaction with OpenGL.
 *
 * @returns {Number[]} an array with this vector's x-, y-,
 *                     and z-coordinates in this order
 */
x3dom.fields.SFVec3f.prototype.toGL = function ()
{
    return [ this.x, this.y, this.z ];
};

/**
 * Returns a string representation of this vector.
 *
 * @returns {String} a string representation of this vector
 */
x3dom.fields.SFVec3f.prototype.toString = function ()
{
    return this.x + " " + this.y + " " + this.z;
};

/**
 * Parses a string, sets this vector's components from the parsed data,
 * and returns this vector.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.SFVec3f} this modified vector
 */
x3dom.fields.SFVec3f.prototype.setValueByStr = function ( str )
{
    try
    {
        var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
        this.x = +m[ 1 ];
        this.y = +m[ 2 ];
        this.z = +m[ 3 ];
    }
    catch ( e )
    {
        // allow automatic type conversion as is convenient for shaders
        var c = x3dom.fields.SFColor.colorParse( str );
        this.x = c.r;
        this.y = c.g;
        this.z = c.b;
    }
    return this;
};

/**
 * SFVec4f constructor.
 *
 * Represents a four-dimensional vector, the components of which, all
 * being numbers, can be accessed and modified directly.
 *
 * @class Represents a SFVec4f
 */
x3dom.fields.SFVec4f = function ( x, y, z, w )
{
    if ( arguments.length === 0 )
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }
    else
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
};

/**
 * Returns a copy of the given vector.
 *
 * @param {x3dom.fields.SFVec4f} v - the vector to copy
 * @returns {x3dom.fields.SFVec4f} a copy of the input vector
 */
x3dom.fields.SFVec4f.copy = function ( v )
{
    return new x3dom.fields.SFVec4f( v.x, v.y, v.z, v.w );
};

/**
 * Returns a copy of this vector.
 *
 * @returns {x3dom.fields.SFVec4f} a copy of this vector
 */
x3dom.fields.SFVec4f.prototype.copy = function ()
{
    return x3dom.fields.SFVec4f( this );
};

/**
 * Parses a string and returns a new 4D vector with the parsed
 * coordinates.
 *
 * The input string must contain four numbers to produce a valid result.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.SFVec3f} a new 4D vector containing the
 *                                 parsed coordinates
 */
x3dom.fields.SFVec4f.parse = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    if ( m === null ) {return new x3dom.fields.SFVec4f();}
    return new x3dom.fields.SFVec4f( +m[ 1 ], +m[ 2 ], +m[ 3 ], +m[ 4 ] );
};

/**
 * Parses a string, sets this vector's components from the parsed data,
 * and returns this vector.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.SFVec4f} this modified vector
 */
x3dom.fields.SFVec4f.prototype.setValueByStr = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    m = m || [ 0, 0, 0, 0, 0 ];
    this.x = +m[ 1 ];
    this.y = +m[ 2 ];
    this.z = +m[ 3 ];
    this.w = +m[ 4 ];
    return this;
};

/**
 * Returns an OpenGL-conformant array representation of this vector.
 *
 * @returns {Number[]} the four components of this vector
 */
x3dom.fields.SFVec4f.prototype.toGL = function ()
{
    return [ this.x, this.y, this.z, this.w ];
};

/**
 * Returns a string representation of this vector.
 *
 * @returns {String} a string representation of this vector
 */
x3dom.fields.SFVec4f.prototype.toString = function ()
{
    return this.x + " " + this.y + " " + this.z + " " + this.w;
};

/**
 * Quaternion constructor.
 *
 * Represents a quaternion, the four components of which, all being
 * numbers, can be accessed and modified directly.
 *
 * Note that the coordinates, if supplied separately or in an array,
 * are always construed in the order of x, y, z, and w. This fact is
 * significant as some conventions prepend the scalar component w
 * instead of listing it as the terminal entity. A quaternion in our
 * sense, hence, is a quadruple (x, y, z, w).
 *
 * @class Represents a Quaternion
 */
x3dom.fields.Quaternion = function ( x, y, z, w )
{
    if ( arguments.length === 0 )
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
    }
    else
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
};

/**
 * SFRotation constructor.
 *
 * Represents a SFRotation, the four components of which, all being
 * numbers, can be accessed and modified directly.
 *
 * Note that the coordinates, if supplied separately or in an array,
 * are always construed in the order of x, y, z, and w. This fact is
 * significant as some conventions prepend the scalar component w
 * instead of listing it as the terminal entity. A quaternion in our
 * sense, hence, is a quadruple (x, y, z, w).
 *
 * @class Represents a SFRotation
 */
x3dom.fields.SFRotation = new Proxy( x3dom.fields.Quaternion,
    {
        construct : function ( target, args )
        {
            args[ 0 ] = args[ 0 ] || 0;
            args[ 1 ] = args[ 1 ] == undefined ? 1 : args[ 1 ];
            args[ 2 ] = args[ 2 ] || 0;
            args[ 3 ] = args[ 3 ] || 0;
            var quat;
            var handler = {
                get : function ( target, prop )
                {
                    switch ( prop )
                    {
                        case "0":
                        //case "x":
                            return target.SFRotation.x;
                            break;
                        case "1":
                        //case "y":
                            return target.SFRotation.y;
                            break;
                        case "2":
                        //case "z":
                            return target.SFRotation.z;
                            break;
                        case "3":
                        case "angle":
                            return target.SFRotation.angle;
                            break;
                        default:
                            return Reflect.get( target, prop );
                    }
                },
                set : function ( target, prop, value )
                {
                    var rot = target.SFRotation;
                    rot[ prop ] = value;
                    target.setValues(
                        new x3dom.fields.Quaternion.axisAngle(
                            new x3dom.fields.SFVec3f( rot.x, rot.y, rot.z ), rot.angle
                        )
                    );
                    return true;
                }
            };

            if ( args[ 0 ].constructor == x3dom.fields.SFVec3f )
            {
                if ( args[ 1 ].constructor == x3dom.fields.SFVec3f )
                {
                    quat = new x3dom.fields.Quaternion.rotateFromTo( args[ 0 ].normalize(), args[ 1 ].normalize() );
                }
                else
                {
                    quat = new x3dom.fields.Quaternion.axisAngle( args[ 0 ], args[ 1 ] );
                }
                //save properties
                var aa = quat.toAxisAngle();
                quat.SFRotation = {
                    x     : aa[ 0 ].x,
                    y     : aa[ 0 ].y,
                    z     : aa[ 0 ].z,
                    angle : aa[ 1 ]
                };
            }
            else
            {
                quat = new x3dom.fields.Quaternion.axisAngle( new x3dom.fields.SFVec3f( args[ 0 ], args[ 1 ], args[ 2 ] ), args[ 3 ] );
                quat.SFRotation = {
                    x     : args[ 0 ],
                    y     : args[ 1 ],
                    z     : args[ 2 ],
                    angle : args[ 3 ]
                };
            }
            return new Proxy( quat, handler );
        }
    } );

/**
 * SAI function to return the axis of rotation.
 *
 * @returns {x3dom.fields.SFVec3f} the axis of rotation
 */
x3dom.fields.Quaternion.prototype.getAxis = function ()
{
    if ( "SFRotation" in this )
    {
        var axis = this.SFRotation;
        return new x3dom.fields.SFVec3f( axis.x, axis.y, axis.z );
    }
    else
    {
        var aa = this.toAxisAngle();
        return aa[ 0 ];
    }
};

/**
 * SAI function to set the axis of rotation.
 * not well tested
 * @param {x3dom.fields.SFVec3f} vec - the axis vector to set to.
 * @returns {} void
 */
x3dom.fields.Quaternion.prototype.setAxis = function ( vec )
{
    var angle;
    if ( "SFRotation" in this )
    {
        angle = this.SFRotation.angle;
        this.SFRotation.x = vec.x;
        this.SFRotation.y = vec.y;
        this.SFRotation.z = vec.z;
    }
    else
    {
        angle = this.angle();
    }
    var q = new x3dom.fields.Quaternion.axisAngle( vec, angle );
    this.setValues( q );
};

/**
 * SAI function to return the inverse of this object's rotation.
 * see below
 * @returns {x3dom.fields.SFRotation} the inverted rotation
 */

/**
 * SAI function to return the object multiplied by the passed value.
 * seee below
 * @returns {x3dom.fields.SFRotation} the multiplied rotation
 */

/**
 * SAI function to return the value of vec multiplied by the matrix corresponding to this object's rotation.
 *
 * @param {x3dom.fields.SFVec3f} vec - the vector to multiply with
 * @returns {x3dom.fields.SFVec3f} the axis of rotation
 */
x3dom.fields.Quaternion.prototype.multiVec = function ( vec )
{
    var m = x3dom.fields.SFMatrix4f.identity();
    m.setRotate( this );
    return m.multMatrixVec( vec );
};

/**
 * slerp SAI function to return the value of the spherical linear interpolation between this object's rotation and dest at value 0 ≤ t ≤ 1.
 * For t = 0, the value is this object`s rotation. For t = 1, the value is the dest rotation.
 * see below, not well tested
 * @param {x3dom.fields.SFRotation} dest - the destination rotation
 * @param {x3dom.fields.SFFloat} t - the fraction
 * @returns {x3dom.fields.SFRotation} the interpolated rotation
 */

/**
 * Sets the components of this quaternion from another quaternion, and returns
 * this modified quaternion.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to copy from
 * @returns {x3dom.fields.Quaternion} this modified quaternion
 */
x3dom.fields.Quaternion.prototype.setValues = function ( that )
{
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;
    this.w = that.w;

    return this;
};

/**
 * Returns a copy of the supplied quaternion.
 *
 * @param {x3dom.fields.Quaternion} v - the quatenion to copy
 * @returns {x3dom.fields.Quaternion} a copy of the supplied quaternion
 */
x3dom.fields.Quaternion.copy = function ( v )
{
    return new x3dom.fields.Quaternion( v.x, v.y, v.z, v.w );
};

/**
 * Returns the product obtained by multiplying this vector with
 * another one.
 *
 * @param {x3dom.fields.Quaternion} that - the right (multiplicand)
 *                                         quaternion
 * @returns {x3dom.fields.Quaternion} the product of this quaternion
 *                                    and the other one
 */
x3dom.fields.Quaternion.prototype.multiply = function ( that )
{
    var product = new x3dom.fields.Quaternion(
        this.w * that.x + this.x * that.w + this.y * that.z - this.z * that.y,
        this.w * that.y + this.y * that.w + this.z * that.x - this.x * that.z,
        this.w * that.z + this.z * that.w + this.x * that.y - this.y * that.x,
        this.w * that.w - this.x * that.x - this.y * that.y - this.z * that.z
    );
    if ( "SFRotation" in this )
    {
        var aa = product.toAxisAngle();
        return new x3dom.fields.SFRotation( aa[ 0 ].x, aa[ 0 ].y, aa[ 0 ].z, aa[ 1 ] );
    }
    return product;
};

/**
 * Sets this quaternion's components from an array of numbers.
 *
 * @param {Number[]} array - an array of at least four numbers, the first
 *                        four of which will be used to set this
 *                        quaternion's x-, y-, z-, and w-components
 * @returns {x3dom.fields.Quaternion} this modified quaternion
 */
x3dom.fields.Quaternion.prototype.fromArray = function ( array )
{
    this.x = array[ 0 ];
    this.y = array[ 1 ];
    this.z = array[ 2 ];
    this.w = array[ 3 ];

    return this;
};

/**
 * Sets this quaternion's components from an array of numbers.
 *
 * @param {Number[]} array - an array of at least four numbers, the first
 *                           four of which will be used as the x-, y-,
 *                           z-, and w-components in this order.
 */
x3dom.fields.Quaternion.fromArray = function ( array )
{
    return new x3dom.fields.Quaternion( array[ 0 ], array[ 1 ], array[ 2 ], array[ 3 ] );
};

/**
 * Parses the axis-angle representation of a rotation from a string
 * and creates and returns a new quaternion equivalent to it.
 *
 * @param {String} str - the string to parse the axis-angle data from
 * @returns {x3dom.fields.Quaternion} a new quaternion equivalent to the
 *                                    axis-angle rotation expressed in
 *                                    the parsed input string
 */
x3dom.fields.Quaternion.parseAxisAngle = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    if ( m === null ) {return new x3dom.fields.Quaternion();}

    return x3dom.fields.Quaternion.axisAngle( new x3dom.fields.SFVec3f( +m[ 1 ], +m[ 2 ], +m[ 3 ] ), +m[ 4 ] );
};

/**
 * Creates and returns an axis-angle representation of this quaternion.
 *
 * @param {x3dom.fields.SFVec3f} axis - the rotation axis
 * @param {Number}               a    - the rotation angle in radians
 * @returns {x3dom.fields.Quaternion} a new quaternion equivalent to the
 *                                    specified axis-angle representation
 */
x3dom.fields.Quaternion.axisAngle = function ( axis, a )
{
    var t = axis.length();

    if ( t > x3dom.fields.Eps )
    {
        var s = Math.sin( a / 2 ) / t;
        var c = Math.cos( a / 2 );
        return new x3dom.fields.Quaternion( axis.x * s, axis.y * s, axis.z * s, c );
    }
    else
    {
        return new x3dom.fields.Quaternion( 0, 0, 0, 1 );
    }
};

/**
 * Returns a copy of this quaternion.
 *
 * @returns {x3dom.fields.Quaternion} a copy of this quaternion
 */
x3dom.fields.Quaternion.prototype.copy = function ()
{
    return x3dom.fields.Quaternion.copy( this );
};

/**
 * Returns a rotation matrix representation of this quaternion.
 *
 * @returns {x3dom.fields.SFMatrix4} a new rotation matrix representing
 *                                   this quaternion's rotation
 */
x3dom.fields.Quaternion.prototype.toMatrix = function ()
{
    var xx = this.x * this.x;
    var xy = this.x * this.y;
    var xz = this.x * this.z;
    var yy = this.y * this.y;
    var yz = this.y * this.z;
    var zz = this.z * this.z;
    var wx = this.w * this.x;
    var wy = this.w * this.y;
    var wz = this.w * this.z;

    return new x3dom.fields.SFMatrix4f(
        1 - 2 * ( yy + zz ), 2 * ( xy - wz ), 2 * ( xz + wy ), 0,
        2 * ( xy + wz ), 1 - 2 * ( xx + zz ), 2 * ( yz - wx ), 0,
        2 * ( xz - wy ), 2 * ( yz + wx ), 1 - 2 * ( xx + yy ), 0,
        0, 0, 0, 1
    );
};

/**
 * Returns an axis-angle representation of this quaternion as a
 * two-element array containing the rotation axis and angle in radians
 * in this order.
 *
 * @returns {Array} an array of two elements, the first of which is
 *                  the ``SFVec3f'' axis-angle rotation axis,
 *                  the second being the angle in radians.
 */
x3dom.fields.Quaternion.prototype.toAxisAngle = function ()
{
    var x = 0,
        y = 0,
        z = 0;
    var s = 0,
        a = 0;

    if ( this.w > 1 )
    {
        this.normalize();
    }

    a = 2 * Math.acos( this.w );
    s = Math.sqrt( 1 - this.w * this.w );

    if ( s == 0 )
    {  //< x3dom.fields.Eps )
        x = this.x;
        y = this.y;
        z = this.z;
    }
    else
    {
        x = this.x / s;
        y = this.y / s;
        z = this.z / s;
    }

    return [ new x3dom.fields.SFVec3f( x, y, z ), a ];
};

/**
 * Returns this quaternion's rotation angle in radians.
 *
 * @returns {Number} this quaternion's rotation angle in radians
 */
x3dom.fields.Quaternion.prototype.angle = function ()
{
    return 2 * Math.acos( this.w );
};

/**
 * Sets this quaternion's components from the supplied rotation matrix,
 * and returns the quaternion itself.
 *
 * @param {x3dom.fields.SFMatrix4f} matrix - the rotation matrix whose
 *                                           rotation shall be copied
 *                                           into this quaternion
 * @returns {x3dom.fields.Quaternion} this modified quaternion
 */
x3dom.fields.Quaternion.prototype.setValue = function ( matrix )
{
    var tr,
        s = 1;
    var qt = [ 0, 0, 0 ];

    var i = 0,
        j = 0,
        k = 0;
    var nxt = [ 1, 2, 0 ];

    tr = matrix._00 + matrix._11 + matrix._22;

    if ( tr > 0.0 )
    {
        s = Math.sqrt( tr + 1.0 );

        this.w = s * 0.5;

        s = 0.5 / s;

        this.x = ( matrix._21 - matrix._12 ) * s;
        this.y = ( matrix._02 - matrix._20 ) * s;
        this.z = ( matrix._10 - matrix._01 ) * s;
    }
    else
    {
        if ( matrix._11 > matrix._00 )
        {
            i = 1;
        }
        else
        {
            i = 0;
        }

        if ( matrix._22 > matrix.at( i, i ) )
        {
            i = 2;
        }

        j = nxt[ i ];
        k = nxt[ j ];

        s = Math.sqrt( matrix.at( i, i ) - ( matrix.at( j, j ) + matrix.at( k, k ) ) + 1.0 );

        qt[ i ] = s * 0.5;
        s = 0.5 / s;

        this.w = ( matrix.at( k, j ) - matrix.at( j, k ) ) * s;

        qt[ j ] = ( matrix.at( j, i ) + matrix.at( i, j ) ) * s;
        qt[ k ] = ( matrix.at( k, i ) + matrix.at( i, k ) ) * s;

        this.x = qt[ 0 ];
        this.y = qt[ 1 ];
        this.z = qt[ 2 ];
    }

    if ( this.w > 1.0 || this.w < -1.0 )
    {
        var errThreshold = 1 + ( x3dom.fields.Eps * 100 );

        if ( this.w > errThreshold || this.w < -errThreshold )
        {
            // When copying, then everything, incl. the famous OpenSG MatToQuat bug
            x3dom.debug.logInfo( "MatToQuat: BUG: |quat[4]| (" + this.w + ") >> 1.0 !" );
        }

        if ( this.w > 1.0 )
        {
            this.w = 1.0;
        }
        else
        {
            this.w = -1.0;
        }
    }
};

/**
 * Sets this quaternion from the Euler angles representation, and
 * returns this quaternion.
 *
 * @param {Number} alpha - the rotation angle in radians about the
 *                          first axis
 * @param {Number} beta  - the rotation angle in radians about the
 *                          second axis
 * @param {Number} gamma - the rotation angle in radians about the
 *                          third axis
 * @returns {x3dom.fields.Quaternion} the modified quaternion
 */
x3dom.fields.Quaternion.prototype.setFromEuler = function ( alpha, beta, gamma )
{
    var sx = Math.sin( alpha * 0.5 );
    var cx = Math.cos( alpha * 0.5 );
    var sy = Math.sin( beta * 0.5 );
    var cy = Math.cos( beta * 0.5 );
    var sz = Math.sin( gamma * 0.5 );
    var cz = Math.cos( gamma * 0.5 );

    this.x = ( sx * cy * cz ) - ( cx * sy * sz );
    this.y = ( cx * sy * cz ) + ( sx * cy * sz );
    this.z = ( cx * cy * sz ) - ( sx * sy * cz );
    this.w = ( cx * cy * cz ) + ( sx * sy * sz );

    return this;
};

/**
 * Returns the dot product of this quaternion and another one.
 *
 * @param {x3dom.fields.Quaternion} that - the right quaternion
 * @returns {Number} the production of this quaternion and the other one
 */
x3dom.fields.Quaternion.prototype.dot = function ( that )
{
    return this.x * that.x + this.y * that.y + this.z * that.z + this.w * that.w;
};

/**
 * Returns a new quaternion obtained by adding to this quaternion
 * the components of another one.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to add to this
 *                                         one
 * @returns {x3dom.fields.Quaternion} a new quaternion representing the
 *                                    sum of this and the other quaternion
 */
x3dom.fields.Quaternion.prototype.add = function ( that )
{
    return new x3dom.fields.Quaternion( this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w );
};

/**
 * Returns a new quaternion as the difference between this quaternion
 * and another one subtracted from it.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to deduct
 *                                         from this one
 * @returns {x3dom.fields.Quaternion} a new quaternion holding the
 *                                    difference
 */
x3dom.fields.Quaternion.prototype.subtract = function ( that )
{
    return new x3dom.fields.Quaternion( this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w );
};

/**
 * Sets this quaternion's components from another quaternion, and
 * returns this quaternion.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to copy from
 * @returns {x3dom.fields.Quaternion} this modified quaternion
 */
x3dom.fields.Quaternion.prototype.setValues = function ( that )
{
    this.x = that.x;
    this.y = that.y;
    this.z = that.z;
    this.w = that.w;

    return this;
};

/**
 * Checks whether this quaternion equals another one.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to juxtapose
 *                                         with this one
 * @param {Number}                  eps  - the tolerance of deviation
 *                                         within which not exactly equal
 *                                         components are still considered
 *                                         equal
 * @returns {Boolean} ``true'' if both quaternions are equal
 *                    or approximately equal, ``false'' otherwise
 */
x3dom.fields.Quaternion.prototype.equals = function ( that, eps )
{
    return ( this.dot( that ) >= 1.0 - eps );
};

/**
 * Returns a scaled version of this quaternion.
 *
 * @param {Number} s - the scalar scale factor
 * @returns {x3dom.fields.Quaternion} a scaled version of this quaternion
 */
x3dom.fields.Quaternion.prototype.multScalar = function ( s )
{
    return new x3dom.fields.Quaternion( this.x * s, this.y * s, this.z * s, this.w * s );
};

/**
 * Normalizes and returns this quaternion.
 *
 * @returns {x3dom.fields.Quaternion} this normalized quaternion
 */
x3dom.fields.Quaternion.prototype.normalize = function ()
{
    var d2 = this.dot( this );
    var id = 1.0;
    if ( d2 )
    {
        id = 1.0 / Math.sqrt( d2 );
    }

    this.x *= id;
    this.y *= id;
    this.z *= id;
    this.w *= id;

    return this;
};

/**
 * Normalizes a quaternion and returns it.
 *
 * @param {x3dom.fields.Quaternion} that - the quaternion to be
 *                                         normalized
 * @returns {x3dom.fields.Quaternion} the normalized input quaternion
 */
x3dom.fields.Quaternion.normalize = function ( that )
{
    var d2 = that.dot( that );
    var id = 1.0;
    if ( d2 )
    {
        id = 1.0 / Math.sqrt( d2 );
    }

    that.x *= id;
    that.y *= id;
    that.z *= id;
    that.w *= id;

    return that;
};

/**
 * Returns a negated version of this quaternion.
 *
 * The negation of a quaternion negates all of its components.
 *
 * @returns {x3dom.fields.Quaternion} the negated version of this
 *                                    quaternion
 */
x3dom.fields.Quaternion.prototype.negate = function ()
{
    return new x3dom.fields.Quaternion( -this.x, -this.y, -this.z, -this.w );
};

/**
 * Returns an inverted version of this quaternion.
 *
 * The conjugate or inverse quaternion negates the x-, y-, and
 * z-components, while retaining the w-coordinate's signum.
 *
 * @returns {x3dom.fields.Quaternion} the inverted version of this
 *                                    quaternion
 */
x3dom.fields.Quaternion.prototype.inverse = function ()
{
    var inverse = new x3dom.fields.Quaternion( -this.x, -this.y, -this.z, this.w );
    if ( "SFRotation" in this )
    {
        var aa = inverse.toAxisAngle();
        return new x3dom.fields.SFRotation( aa[ 0 ].x, aa[ 0 ].y, aa[ 0 ].z, aa[ 1 ] );
    }
    return inverse;
};

/**
 * Returns the result of performing a spherical linear interpolation,
 * or slerp, between this quaternion and another one as defined
 * by the supplied ratio.
 *
 * @param {x3dom.fields.Quaternion} that - the opposite end of the
 *                                         interpolation
 * @param {Number}                  t    - the ratio of the interpolation
 *                                         between the two quaternions,
 *                                         usually as a floating-point
 *                                         value in the [0.0, 1.0]
 * @returns {x3dom.fields.Quaternion} a new quaternion which represents
 *                                    the interpolated value between
 *                                    this and the opposite quaternion
 *                                    at the given ratio
 */
x3dom.fields.Quaternion.prototype.slerp = function ( that, t )
{
    // calculate the cosine
    var cosom = this.dot( that );
    var rot1;

    // adjust signs if necessary
    if ( cosom < 0.0 )
    {
        cosom = -cosom;
        rot1 = that.negate();
    }
    else
    {
        rot1 = new x3dom.fields.Quaternion( that.x, that.y, that.z, that.w );
    }

    // calculate interpolating coeffs
    var scalerot0;
    var scalerot1;

    if ( ( 1.0 - cosom ) > 0.00001 )
    {
        // standard case
        var omega = Math.acos( cosom );
        var sinom = Math.sin( omega );
        scalerot0 = Math.sin( ( 1.0 - t ) * omega ) / sinom;
        scalerot1 = Math.sin( t * omega ) / sinom;
    }
    else
    {
        // rot0 and rot1 very close - just do linear interp.
        scalerot0 = 1.0 - t;
        scalerot1 = t;
    }

    // build the new quaternion
    var result = this.multScalar( scalerot0 ).add( rot1.multScalar( scalerot1 ) );
    if ( "SFRotation" in this )
    {
        var aa = result.toAxisAngle();
        return new x3dom.fields.SFRotation( aa[ 0 ].x, aa[ 0 ].y, aa[ 0 ].z, aa[ 1 ] );
    }
    return result;
};

/**
 * Computes and returns a quaternion representing the rotation necessary
 * to reach align the first vector with the second one.
 *
 * @param {x3dom.fields.SFVec3f} fromVec - the start vector which shall
 *                                         be construed as being
 *                                         intended to be aligned with
 *                                         the ``toVec''
 * @param {x3dom.fields.SFVec3f} toVec   - the vector whose orientation
 *                                         shall be reached by the
 *                                         ``fromVec''
 * @returns {x3dom.fields.Quaternion} the quaternion which represents
 *                                    the rotation necessary to align
 *                                    the ``fromVec'' with the
 *                                    ``toVec''
 */
x3dom.fields.Quaternion.rotateFromTo = function ( fromVec, toVec )
{
    var from = fromVec.normalize();
    var to = toVec.normalize();
    var cost = from.dot( to );

    // check for degeneracies
    if ( cost > 0.99999 )
    {
        // vectors are parallel
        return new x3dom.fields.Quaternion( 0, 0, 0, 1 );
    }
    else if ( cost < -0.99999 )
    {
        // vectors are opposite
        // find an axis to rotate around, which should be
        // perpendicular to the original axis
        // Try cross product with (1,0,0) first, if that's one of our
        // original vectors then try  (0,1,0).
        var cAxis = new x3dom.fields.SFVec3f( 1, 0, 0 );

        var tmp = from.cross( cAxis );

        if ( tmp.length() < 0.00001 )
        {
            cAxis.x = 0;
            cAxis.y = 1;
            cAxis.z = 0;

            tmp = from.cross( cAxis );
        }
        tmp = tmp.normalize();

        return x3dom.fields.Quaternion.axisAngle( tmp, Math.PI );
    }

    var axis = fromVec.cross( toVec );
    axis = axis.normalize();

    // use half-angle formulae
    // sin^2 t = ( 1 - cos (2t) ) / 2
    var s = Math.sqrt( 0.5 * ( 1.0 - cost ) );
    axis = axis.multiply( s );

    // scale the axis by the sine of half the rotation angle to get
    // the normalized quaternion
    // cos^2 t = ( 1 + cos (2t) ) / 2
    // w part is cosine of half the rotation angle
    s = Math.sqrt( 0.5 * ( 1.0 + cost ) );

    return new x3dom.fields.Quaternion( axis.x, axis.y, axis.z, s );
};

/**
 * Returns a four-element array of this quaternion's rotation in
 * an axis-angle representation suitable for communication with OpenGL.
 *
 * @returns {Number[]} an array of four numbers holding the rotation
 *                     axis' x-, y-, and z-coordinates, as well as the
 *                     angle in radians
 */
x3dom.fields.Quaternion.prototype.toGL = function ()
{
    var val = this.toAxisAngle();
    return [ val[ 0 ].x, val[ 0 ].y, val[ 0 ].z, val[ 1 ] ];
};

/**
 * Returns a string representation of this quaternion.
 *
 * @returns {String} a string representation of this quaternion
 */
x3dom.fields.Quaternion.prototype.toString = function ()
{
    if ( "SFRotation" in this )
    {
        return this.SFRotation.x + " " + this.SFRotation.y + " " + this.SFRotation.z + " " + this.SFRotation.angle;
    }
    return this.x + " " + this.y + " " + this.z + ", " + this.w;
};

/**
 * Parses the axis-angle representation of a rotation from a string
 * and sets this quaternion's rotation from it, finally returning this
 * quaternion itself.
 *
 * @param {String} str - the string to parse the axis-angle data from
 * @returns {x3dom.fields.Quaternion} this modified quaternion
 */
x3dom.fields.Quaternion.prototype.setValueByStr = function ( str )
{
    var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
    m = m || [ 0, 1, 0, 0, 0 ];
    var quat = x3dom.fields.Quaternion.axisAngle( new x3dom.fields.SFVec3f( +m[ 1 ], +m[ 2 ], +m[ 3 ] ), +m[ 4 ] );
    this.x = quat.x;
    this.y = quat.y;
    this.z = quat.z;
    this.w = quat.w;
    return this;
};

/**
 * Parses a string and creates and returns a color based upon it.
 *
 * The input string might represent the color information in a variety
 * of formats, encompassing a CSS-conformant color name, an invocation
 * of ``rgb(red, green, blue)'', an invocation of
 * ``rgba(red, green, blue, alpha)'', or a hexadecimal representation of
 * the kind ``#RRGGBBAA'', ``#RRGGBB'', ``#RGBA'', or ``#RGB''.
 *
 * The thus generated object exhibits the following structure:
 *   {
 *     r : <red>,
 *     g : <green>,
 *     b : <blue>,
 *     a : <alpha>
 *   }
 * All components are normalized in the floating-point range [0.0, 1.0].
 * If none of the above formats can be detected, all components are
 * instead set to zero.
 *
 * @param {String} str - the string to parse the color information from
 * @returns {Object} an object containing the four color components,
 *                   each such represented by a property ``r'', ``g'',
 *                   ``b'', ``a'', whose value is normalized in the range
 *                   [0.0, 1.0]; failure to match a color format yields
 *                   zero for all components
 */
function _colorParse ( str )
{
    var red = 0.0,
        green = 0.0,
        blue = 0.0;
    var alpha = 1.0;

    // Definition of CSS color names
    var colorNames = {
        aliceblue            : "#f0f8ff",
        antiquewhite         : "#faebd7",
        aqua                 : "#00ffff",
        aquamarine           : "#7fffd4",
        azure                : "#f0ffff",
        beige                : "#f5f5dc",
        bisque               : "#ffe4c4",
        black                : "#000000",
        blanchedalmond       : "#ffebcd",
        blue                 : "#0000ff",
        blueviolet           : "#8a2be2",
        brown                : "#a52a2a",
        burlywood            : "#deb887",
        cadetblue            : "#5f9ea0",
        chartreuse           : "#7fff00",
        chocolate            : "#d2691e",
        coral                : "#ff7f50",
        cornflowerblue       : "#6495ed",
        cornsilk             : "#fff8dc",
        crimson              : "#dc143c",
        cyan                 : "#00ffff",
        darkblue             : "#00008b",
        darkcyan             : "#008b8b",
        darkgoldenrod        : "#b8860b",
        darkgray             : "#a9a9a9",
        darkgreen            : "#006400",
        darkkhaki            : "#bdb76b",
        darkmagenta          : "#8b008b",
        darkolivegreen       : "#556b2f",
        darkorange           : "#ff8c00",
        darkorchid           : "#9932cc",
        darkred              : "#8b0000",
        darksalmon           : "#e9967a",
        darkseagreen         : "#8fbc8f",
        darkslateblue        : "#483d8b",
        darkslategray        : "#2f4f4f",
        darkturquoise        : "#00ced1",
        darkviolet           : "#9400d3",
        deeppink             : "#ff1493",
        deepskyblue          : "#00bfff",
        dimgray              : "#696969",
        dodgerblue           : "#1e90ff",
        feldspar             : "#d19275",
        firebrick            : "#b22222",
        floralwhite          : "#fffaf0",
        forestgreen          : "#228b22",
        fuchsia              : "#ff00ff",
        gainsboro            : "#dcdcdc",
        ghostwhite           : "#f8f8ff",
        gold                 : "#ffd700",
        goldenrod            : "#daa520",
        gray                 : "#808080",
        green                : "#008000",
        greenyellow          : "#adff2f",
        honeydew             : "#f0fff0",
        hotpink              : "#ff69b4",
        indianred            : "#cd5c5c",
        indigo               : "#4b0082",
        ivory                : "#fffff0",
        khaki                : "#f0e68c",
        lavender             : "#e6e6fa",
        lavenderblush        : "#fff0f5",
        lawngreen            : "#7cfc00",
        lemonchiffon         : "#fffacd",
        lightblue            : "#add8e6",
        lightcoral           : "#f08080",
        lightcyan            : "#e0ffff",
        lightgoldenrodyellow : "#fafad2",
        lightgrey            : "#d3d3d3",
        lightgreen           : "#90ee90",
        lightpink            : "#ffb6c1",
        lightsalmon          : "#ffa07a",
        lightseagreen        : "#20b2aa",
        lightskyblue         : "#87cefa",
        lightslateblue       : "#8470ff",
        lightslategray       : "#778899",
        lightsteelblue       : "#b0c4de",
        lightyellow          : "#ffffe0",
        lime                 : "#00ff00",
        limegreen            : "#32cd32",
        linen                : "#faf0e6",
        magenta              : "#ff00ff",
        maroon               : "#800000",
        mediumaquamarine     : "#66cdaa",
        mediumblue           : "#0000cd",
        mediumorchid         : "#ba55d3",
        mediumpurple         : "#9370d8",
        mediumseagreen       : "#3cb371",
        mediumslateblue      : "#7b68ee",
        mediumspringgreen    : "#00fa9a",
        mediumturquoise      : "#48d1cc",
        mediumvioletred      : "#c71585",
        midnightblue         : "#191970",
        mintcream            : "#f5fffa",
        mistyrose            : "#ffe4e1",
        moccasin             : "#ffe4b5",
        navajowhite          : "#ffdead",
        navy                 : "#000080",
        oldlace              : "#fdf5e6",
        olive                : "#808000",
        olivedrab            : "#6b8e23",
        orange               : "#ffa500",
        orangered            : "#ff4500",
        orchid               : "#da70d6",
        palegoldenrod        : "#eee8aa",
        palegreen            : "#98fb98",
        paleturquoise        : "#afeeee",
        palevioletred        : "#d87093",
        papayawhip           : "#ffefd5",
        peachpuff            : "#ffdab9",
        peru                 : "#cd853f",
        pink                 : "#ffc0cb",
        plum                 : "#dda0dd",
        powderblue           : "#b0e0e6",
        purple               : "#800080",
        red                  : "#ff0000",
        rosybrown            : "#bc8f8f",
        royalblue            : "#4169e1",
        saddlebrown          : "#8b4513",
        salmon               : "#fa8072",
        sandybrown           : "#f4a460",
        seagreen             : "#2e8b57",
        seashell             : "#fff5ee",
        sienna               : "#a0522d",
        silver               : "#c0c0c0",
        skyblue              : "#87ceeb",
        slateblue            : "#6a5acd",
        slategray            : "#708090",
        snow                 : "#fffafa",
        springgreen          : "#00ff7f",
        steelblue            : "#4682b4",
        tan                  : "#d2b48c",
        teal                 : "#008080",
        thistle              : "#d8bfd8",
        tomato               : "#ff6347",
        turquoise            : "#40e0d0",
        violet               : "#ee82ee",
        violetred            : "#d02090",
        wheat                : "#f5deb3",
        white                : "#ffffff",
        whitesmoke           : "#f5f5f5",
        yellow               : "#ffff00",
        yellowgreen          : "#9acd32"
    };

    // Matches CSS rgb() function
    var rgbMatch = /^rgb\((\d{1,3}),\s{0,1}(\d{1,3}),\s{0,1}(\d{1,3})\)$/.exec( str );
    if ( rgbMatch !== null )
    {
        red   = rgbMatch[ 1 ] / 255.0;
        green = rgbMatch[ 2 ] / 255.0;
        blue  = rgbMatch[ 3 ] / 255.0;
    }

    // Matches CSS rgba() function
    var rgbaMatch = /^rgba\((\d{1,3}),\s{0,1}(\d{1,3}),\s{0,1}(\d{1,3}),(0+\.?\d*|1\.?0*)\)$/.exec( str );
    if ( rgbaMatch !== null )
    {
        red   = rgbaMatch[ 1 ] / 255.0;
        green = rgbaMatch[ 2 ] / 255.0;
        blue  = rgbaMatch[ 3 ] / 255.0;
        alpha = +rgbaMatch[ 4 ];
    }

    // Matches CSS color name
    if ( colorNames[ str ] )
    {
        str = colorNames[ str ];
    }

    // Hexadecimal color codes
    if ( str.substr && str.substr( 0, 1 ) === "#" )
    {
        var hex = str.substr( 1 );
        var len = hex.length;

        if ( len === 8 )
        {
            red   = parseInt( "0x" + hex.substr( 0, 2 ), 16 ) / 255.0;
            green = parseInt( "0x" + hex.substr( 2, 2 ), 16 ) / 255.0;
            blue  = parseInt( "0x" + hex.substr( 4, 2 ), 16 ) / 255.0;
            alpha = parseInt( "0x" + hex.substr( 6, 2 ), 16 ) / 255.0;
        }
        else if ( len === 6 )
        {
            red   = parseInt( "0x" + hex.substr( 0, 2 ), 16 ) / 255.0;
            green = parseInt( "0x" + hex.substr( 2, 2 ), 16 ) / 255.0;
            blue  = parseInt( "0x" + hex.substr( 4, 2 ), 16 ) / 255.0;
        }
        else if ( len === 4 )
        {
            red   = parseInt( "0x" + hex.substr( 0, 1 ), 16 ) / 15.0;
            green = parseInt( "0x" + hex.substr( 1, 1 ), 16 ) / 15.0;
            blue  = parseInt( "0x" + hex.substr( 2, 1 ), 16 ) / 15.0;
            alpha = parseInt( "0x" + hex.substr( 3, 1 ), 16 ) / 15.0;
        }
        else if ( len === 3 )
        {
            red   = parseInt( "0x" + hex.substr( 0, 1 ), 16 ) / 15.0;
            green = parseInt( "0x" + hex.substr( 1, 1 ), 16 ) / 15.0;
            blue  = parseInt( "0x" + hex.substr( 2, 1 ), 16 ) / 15.0;
        }
    }

    return { r: red, g: green, b: blue, a: alpha };
}

/**
 * SFColor constructor.
 *
 * This class represents a color as a triple of floating-point ratios,
 * usually confined to the range [0.0, 1.0], but not mandatorily
 * restricted in this sense. The three color components or channels
 * encompass red, green, and blue, that is, the RGB color model.
 *
 * @class Represents a SFColor
 */
x3dom.fields.SFColor = function ( r, g, b )
{
    if ( arguments.length === 0 )
    {
        this.r = 0;
        this.g = 0;
        this.b = 0;
    }
    else
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }
};

/**
 * Parses a string and returns and creates a color from it.
 *
 * The input string must convey four numbers, which will be construed
 * as the red, green, blue, and alpha channel in this order. If this
 * format cannot be detected, the more potent rules of the method
 * ``x3dom.fields.SFColor.colorParse'' will be applied, which see.
 *
 * @param {String} str - the string to parse the color information from
 * @returns {x3dom.fields.SFColor} the color parsed from the string,
 *                                 or a color with all components
 *                                 zero-valued if none format could
 *                                 be matched
 */
x3dom.fields.SFColor.parse = function ( str )
{
    try
    {
        var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
        return new x3dom.fields.SFColor( +m[ 1 ], +m[ 2 ], +m[ 3 ] );
    }
    catch ( e )
    {
        return x3dom.fields.SFColor.colorParse( str );
    }
};

/**
 * Returns a copy of the specified color.
 *
 * @param   {x3dom.fields.SFColor} that - the color to copy
 * @returns {x3dom.fields.SFColor} a copy of the input color
 */
x3dom.fields.SFColor.copy = function ( that )
{
    return new x3dom.fields.SFColor( that.r, that.g, that.b );
};

/**
 * Returns a copy of this color.
 *
 * @returns {x3dom.fields.SFColor} a copy of this color
 */
x3dom.fields.SFColor.prototype.copy = function ()
{
    return x3dom.fields.SFColor.copy( this );
};

/**
 * Sets the components of this color from the supplied hue, saturation
 * and value as according to the HSV color model.
 *
 * @param {Number} h - the hue in degrees
 * @param {Number} s - the saturation as a floating-point ratio in
 *                     the range [0.0, 1.0]
 * @param {Number} v - the value as a floating-point ratio in
 *                     the range [0.0, 1.0]
 * @returns {x3dom.fields.SFColor} this color itself
 */
x3dom.fields.SFColor.prototype.setHSV = function ( h, s, v )
{
    var hi = 0;
    var f  = 0;
    var p  = 0;
    var q  = 0;
    var t  = 0;
    var r  = 0;
    var g  = 0;
    var b  = 0;

    hi = Math.floor( h / 60.0 );
    f  = ( h / 60.0 ) - hi;
    p  = v * ( 1.0 - s );
    q  = v * ( 1.0 - ( s * f ) );
    t  = v * ( 1.0 - ( s * ( 1.0 - f ) ) );

    switch ( hi )
    {
        case 0 :
        case 6 :
        {
            r = v;
            g = t;
            b = p;
            break;
        }
        case 1 :
        {
            r = q;
            g = v;
            b = p;
            break;
        }
        case 2 :
        {
            r = p;
            g = v;
            b = t;
            break;
        }
        case 3 :
        {
            r = p;
            g = q;
            b = v;
            break;
        }
        case 4 :
        {
            r = t;
            g = p;
            b = v;
            break;
        }
        case 5 :
        {
            r = v;
            g = p;
            b = q;
            break;
        }
        default :
        {
            x3dom.debug.logWarning( "Using black for invalid case in setHSV: " + hi );
            break;
        }
    };

    this.r = r;
    this.g = g;
    this.b = b;

    return this;
};

/**
 * Returns the HSV color components corresponding to this color as an
 * array of three numbers.
 *
 * In accordance with the widespread wont, the hue is delivered as an
 * angle in degrees in the range [0.0, 360.0]; the saturation and value
 * both are ratios in the range [0.0, 1.0].
 *
 * @see{@link https://www.rapidtables.com/convert/color/rgb-to-hsv.html}}
 * @see{@link https://en.wikipedia.org/wiki/HSL_and_HSV}}
 * @returns {Number[]} the three HSV color components corresponding to
 *                     this color as elements of an array in the order
 *                     hue, saturation, and value
 */
x3dom.fields.SFColor.prototype.getHSV = function ()
{
    var hue            = 0;       // H
    var saturation     = 0;       // S
    var val            = 0;       // V
    var maxComponent   = {};      // C_max
    var componentRange = 0;       // MAX - MIN

    var minComponentValue  = this.r;
    maxComponent.name  = "red";
    maxComponent.value = this.r;

    if ( this.g < minComponentValue )
    {
        minComponentValue = this.g;
    }
    if ( this.b < minComponentValue )
    {
        minComponentValue = this.b;
    }

    if ( this.g > maxComponent.value )
    {
        maxComponent.name  = "green";
        maxComponent.value = this.g;
    }
    if ( this.b > maxComponent.value )
    {
        maxComponent.name  = "blue";
        maxComponent.value = this.b;
    }

    componentRange = maxComponent.value - minComponentValue;

    if ( componentRange == 0.0 )
    {
        hue = 0;
    }
    else if ( maxComponent.name == "red" )
    {
        hue = 60.0 * ( ( ( this.g - this.b ) / componentRange ) % 6 );
    }
    else if ( maxComponent.name == "green" )
    {
        hue = 60.0 * ( ( ( this.b - this.r ) / componentRange ) + 2.0 );
    }
    else if ( maxComponent.name == "blue" )
    {
        hue = 60.0 * ( ( ( this.r - this.g ) / componentRange ) + 4.0 );
    }
    else
    {
        throw ( "Unknown maximum component: " + maxComponent.name );
    }

    if ( hue < 0 )
    {
        hue = hue + 360;
    }

    if ( maxComponent.value == 0 )
    {
        saturation = 0;
    }
    else
    {
        saturation = componentRange / maxComponent.value;
    }

    val = maxComponent.value;

    return [ hue, saturation, val ];
};

/**
 * Sets this color's components to that of the supplied color and
 * returns this modified color.
 *
 * @param {x3dom.fields.SFColor} color - the color to copy from
 * @returns {x3dom.fields.SFColor} this modified color
 */
x3dom.fields.SFColor.prototype.setValues = function ( color )
{
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    return this;
};

/**
 * Checks whether this color equals another one in circumference of
 * the specified tolerance.
 *
 * @param   {x3dom.fields.SFColor} that - a copy of this color
 * @param   {Number}               eps  - the tolerance of deviation
 *                                        between the two tested colors'
 *                                        components within which they
 *                                        might still be considered as
 *                                        equal
 * @returns {Boolean} ``true'' if the two colors are equal,
 *                    ``false'' otherwise
 */
x3dom.fields.SFColor.prototype.equals = function ( that, eps )
{
    return Math.abs( this.r - that.r ) < eps &&
           Math.abs( this.g - that.g ) < eps &&
           Math.abs( this.b - that.b ) < eps;
};

/**
 * Returns a new RGB color as the sum of this color and another one.
 *
 * @param {x3dom.fields.SFColor|x3dom.fields.SFColorRGBA} that -
 *          the color to add to this one
 * @returns {x3dom.fields.SFColor} a new color with its components being
 *                                 that of this one augmented by the
 *                                 supplied second color
 */
x3dom.fields.SFColor.prototype.add = function ( that )
{
    return new x3dom.fields.SFColor( this.r + that.r, this.g + that.g, this.b + that.b );
};

/**
 * Returns a new RGB color as the difference between this color and
 * another one.
 *
 * @param {x3dom.fields.SFColor|x3dom.fields.SFColorRGBA} that -
 *          the color to subtract from this one
 * @returns {x3dom.fields.SFColor} a new color with its components
 *                                 being that of this one reduced by the
 *                                 supplied second color
 */
x3dom.fields.SFColor.prototype.subtract = function ( that )
{
    return new x3dom.fields.SFColor( this.r - that.r, this.g - that.g, this.b - that.b );
};

/**
 * Returns a version of this color whose components have been scaled by
 * the supplied scalar factor.
 *
 * @param {Number} n - the scalar factor to scale each component by
 * @returns {x3dom.fields.SFColor} a new color based upon this one
 *                                 with each component scaled by the
 *                                 supplied factor
 */
x3dom.fields.SFColor.prototype.multiply = function ( n )
{
    return new x3dom.fields.SFColor( this.r * n, this.g * n, this.b * n );
};

/**
 * Returns a single integer-encoded representation of this RGBA color.
 *
 * The generated encoding encompasses at most 24 bits, with each eight
 * consecutive bits reserved for one of the color components. The bits
 * 0 to  7 encode the blue channel; the bits  8 to 15 store the green
 * channel; the bits 16 to 23 hold the red channel. The format is thus
 * visually: RRRRRRRRGGGGGGGGBBBBBBBB.
 *
 * @returns {Number} a 32-bit integer representation of this color's
 *                   components, encoded in its lower 24 bits.
 */
x3dom.fields.SFColor.prototype.toUint = function ()
{
    return ( ( Math.round( this.r * 255 ) << 16 ) |
        ( Math.round( this.g * 255 ) << 8 ) |
        Math.round( this.b * 255 ) ) >>> 0;
};

/**
 * Sets this color's components from a single integer-encoded value
 * holding all channel data in its bits, and returns this color.
 *
 * The supplied integer number is considered regarding its first 24
 * bits, each consecutive eight of which represent the integer value
 * of one component in the range of [0, 255]. The keys are as follows:
 *   - Bits  0 to  7 encode the blue  channel .
 *   - Bits  8 to 15 encode the green channel.
 *   - Bits 16 to 23 encode the red   channel.
 * The format is thus visually:
 *   RRRRRRRRGGGGGGGGBBBBBBBB
 *
 * @param {Number} rgbInteger - a 32-bit integer representation of this
 *                               color's new components
 * @returns {x3dom.fields.SFColor} this modified color
 */
x3dom.fields.SFColor.prototype.setFromUint = function ( rgbInteger )
{
    this.r = ( ( ( rgbInteger >> 16 ) & 255 ) / 255 );
    this.g = ( ( ( rgbInteger >>  8 ) & 255 ) / 255 );
    this.b = ( ( ( rgbInteger >>  0 ) & 255 ) / 255 );
    return this;
};

/**
 * Returns the components of this color as an OpenGL-conformant array
 * of three numbers.
 *
 * @returns {Number[]} an array of three numbers which represent this
 *                     color's components in the order red, green, and
 *                     blue
 */
x3dom.fields.SFColor.prototype.toGL = function ()
{
    return [ this.r, this.g, this.b ];
};

/**
 * Returns a string representation of this color.
 *
 * @returns {String} a string representation of this color
 */
x3dom.fields.SFColor.prototype.toString = function ()
{
    return this.r + " " + this.g + " " + this.b;
};

/**
 * Parses a string, sets this color's components from the parsed data,
 * and returns this color.
 *
 * The underlying examination process is a two-step approach, the first
 * of which endeavors to parse three numbers, separated by whitespaces
 * and/or comma, to retrieve the color components from these. If this
 * fails, a second step is undertaken, in which the input string is
 * matched against the more versatile CSS rules, for which see
 * {@link x3dom.fields.SFColor.colorParse}. Failure to obtain a
 * result in this case leads to this color being left unmodified.
 *
 * @param {String} str - the string to parse, either as three numbers,
 *                       or as a CSS color specification
 * @returns {x3dom.fields.SFColor} this potentially modified color
 */
x3dom.fields.SFColor.prototype.setValueByStr = function ( str )
{
    try
    {
        var m = /^\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*$/.exec( str );
        this.r = +m[ 1 ];
        this.g = +m[ 2 ];
        this.b = +m[ 3 ];
    }
    catch ( e )
    {
        var c = x3dom.fields.SFColor.colorParse( str );
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
    }
    return this;
};

/**
 * Parses a string and creates and returns a color based upon it.
 *
 * The input string might represent the color information in a variety
 * of formats, encompassing a CSS-conformant color name, an invocation
 * of ``rgb(red, green, blue)'', an invocation of
 * ``rgba(red, green, blue, alpha)'', or a hexadecimal representation of
 * the kind ``#RRGGBBAA'', ``#RRGGBB'', ``#RGBA'', or ``#RGB''.
 *
 * @param {String} color - the string to parse the color information
 *                         from
 * @returns {x3dom.fields.SFColor} the color parsed from the string,
 *                                 or a color with all components
 *                                 zero-valued if none format could
 *                                 be matched
 */
x3dom.fields.SFColor.colorParse = function ( color )
{
    var rgb = _colorParse( color );
    return new x3dom.fields.SFColor( rgb.r, rgb.g, rgb.b );
};

/**
 * SFColorRGBA constructor.
 *
 * This class represents a color as a quadruple of floating-point ratios,
 * usually confined to the range [0.0, 1.0], but not mandatorily
 * restricted in this sense. The four color components or channels
 * encompass red, green, blue, and alpha, that is, the RGBA color model.
 * The alpha component defines the opacity of a color, which is the
 * opposite of its transparency.
 *
 * @class Represents a SFColorRGBA
 */
x3dom.fields.SFColorRGBA = function ( r, g, b, a )
{
    if ( arguments.length === 0 )
    {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
    }
    else
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
};

/**
 * Parses a string and returns and creates a color from it.
 *
 * The input string must convey four numbers, which will be construed
 * as the red, green, blue, and alpha channel in this order. If this
 * format cannot be detected, the more potent rules of the method
 * ``x3dom.fields.SFColorRGBA.colorParse'' will be applied, which see.
 *
 * @param {String} str - the string to parse the color information from
 * @returns {x3dom.fields.SFColorRGBA} the color parsed from the string,
 *                                     or a color with all components
 *                                     zero-valued if none format could
 *                                     be matched
 */
x3dom.fields.SFColorRGBA.parse = function ( str )
{
    try
    {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec( str );
        return new x3dom.fields.SFColorRGBA( +m[ 1 ], +m[ 2 ], +m[ 3 ], +m[ 4 ] );
    }
    catch ( e )
    {
        return x3dom.fields.SFColorRGBA.colorParse( str );
    }
};

/**
 * Returns a copy of the supplied color.
 *
 * @param   {x3dom.fields.SFColorRGBA} that - the color to copy
 * @returns {x3dom.fields.SFColorRGBA} a copy of the input color
 */
x3dom.fields.SFColorRGBA.copy = function ( that )
{
    return new x3dom.fields.SFColorRGBA( that.r, that.g, that.b, that.a );
};

/**
 * Returns a copy of this color.
 *
 * @returns {x3dom.fields.SFColorRGBA} a copy of this color
 */
x3dom.fields.SFColorRGBA.prototype.copy = function ()
{
    return x3dom.fields.SFColorRGBA.copy( this );
};

/**
 * Sets the components of this color from the supplied hue, saturation
 * and value as according to the HSV color model.
 *
 * @param {Number} h - the hue in degrees
 * @param {Number} s - the saturation as a floating-point ratio in
 *                     the range [0.0, 1.0]
 * @param {Number} v - the value as a floating-point ratio in
 *                     the range [0.0, 1.0]
 * @returns {x3dom.fields.SFColorRGBA} this color itself
 */
x3dom.fields.SFColorRGBA.prototype.setHSV = x3dom.fields.SFColor.prototype.setHSV;

/**
 * Returns the HSV color components corresponding to this color as an
 * array of three numbers.
 *
 * In accordance with the widespread wont, the hue is delivered as an
 * angle in degrees in the range [0.0, 360.0]; the saturation and value
 * both are ratios in the range [0.0, 1.0].
 *
 * @see{@link https://www.rapidtables.com/convert/color/rgb-to-hsv.html}}
 * @see{@link https://en.wikipedia.org/wiki/HSL_and_HSV}}
 * @returns {Number[]} the three HSV color components corresponding to
 *                     this color as elements of an array in the order
 *                     hue, saturation, and value
 */
x3dom.fields.SFColorRGBA.prototype.getHSV = x3dom.fields.SFColor.prototype.getHSV;

/**
 * Sets this color's components to that of the supplied color and
 * returns this modified color.
 *
 * @param {x3dom.fields.SFColorRGBA} color - the color to copy from
 * @returns {x3dom.fields.SFColorRGBA} this modified color
 */
x3dom.fields.SFColorRGBA.prototype.setValues = function ( color )
{
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
    return this;
};

/**
 * Checks whether this color equals another one in circumference of
 * the specified tolerance.
 *
 * @param   {x3dom.fields.SFColorRGBA} that - a copy of this color
 * @param   {Number}                   eps  - the tolerance of deviation
 *                                        between the two tested colors'
 *                                        components within which they
 *                                        might still be considered as
 *                                        equal
 * @returns {Boolean} ``true'' if the two colors are equal,
 *                    ``false'' otherwise
 */
x3dom.fields.SFColorRGBA.prototype.equals = function ( that, eps )
{
    return Math.abs( this.r - that.r ) < eps &&
           Math.abs( this.g - that.g ) < eps &&
           Math.abs( this.b - that.b ) < eps &&
           Math.abs( this.a - that.a ) < eps;
};

/**
 * Returns the components of this color as an OpenGL-conformant array
 * of four numbers.
 *
 * @returns {Number[]} an array of four numbers which represent this
 *                     color's components in the order red, green, blue,
 *                     and alpha
 */
x3dom.fields.SFColorRGBA.prototype.toGL = function ()
{
    return [ this.r, this.g, this.b, this.a ];
};

/**
 * Returns a string representation of this color.
 *
 * @returns {String} a string representation of this color.
 */
x3dom.fields.SFColorRGBA.prototype.toString = function ()
{
    return this.r + " " + this.g + " " + this.b + " " + this.a;
};

/**
 * Parses a string, sets this color's components from the parsed data,
 * and returns this color.
 *
 * The underlying examination process is a two-step approach, the first
 * of which endeavors to parse four numbers, separated by whitespaces
 * and/or comma, to retrieve the color components from these. If this
 * fails, a second step is undertaken, in which the input string is
 * matched against the more versatile CSS rules, for which see
 * {@link x3dom.fields.SFColorRGBA.colorParse}. Failure to obtain a
 * result in this case leads to this color being left unmodified.
 *
 * @param {String} str - the string to parse, either as four numbers,
 *                       or as a CSS color specification
 * @returns {x3dom.fields.SFColorRGBA} this potentially modified color
 */
x3dom.fields.SFColorRGBA.prototype.setValueByStr = function ( str )
{
    try
    {
        var m = /^([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)\s*,?\s*([+\-]?\d*\.*\d*[eE]?[+\-]?\d*?)$/.exec( str );
        this.r = +m[ 1 ];
        this.g = +m[ 2 ];
        this.b = +m[ 3 ];
        this.a = +m[ 4 ];
    }
    catch ( e )
    {
        var c = x3dom.fields.SFColorRGBA.colorParse( str );
        this.r = c.r;
        this.g = c.g;
        this.b = c.b;
        this.a = c.a;
    }

    return this;
};

/**
 * Returns a single integer-encoded representation of this RGBA color.
 *
 * The generated encoding encompasses at most 32 bits, with each eight
 * consecutive bits reserved for one of the color components. The bits
 * 0 to  7 encode the alpha channel; the bits  8 to 15 store the blue
 * channel; the bits 16 to 23 hold the green channel; the bits 24 to 31
 * represent the red channel. The format is thus visually:
 * RRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA.
 *
 * @returns {Number} a 32-bit integer representation of this color's
 *                   components
 */
x3dom.fields.SFColorRGBA.prototype.toUint = function ()
{
    return ( ( Math.round( this.r * 255 ) << 24 ) |
        ( Math.round( this.g * 255 ) << 16 ) |
        ( Math.round( this.b * 255 ) << 8 ) |
        Math.round( this.a * 255 ) ) >>> 0;
};

/**
 * Sets this color's components from a single integer-encoded value
 * holding all channel data in its bits, and returns this color.
 *
 * The supplied integer number is considered regarding its first 32
 * bits, each consecutive eight of which represent the integer value
 * of one component in the range of [0, 255]. The keys are as follows:
 *   - Bits  0 to  7 encode the alpha channel .
 *   - Bits  8 to 15 encode the blue  channel.
 *   - Bits 16 to 23 encode the green channel.
 *   - Bits 24 to 31 encode the red   channel.
 * The format is thus visually:
 *   RRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA
 *
 * @param {Number} rgbaInteger - a 32-bit integer representation of this
 *                               color's new components
 * @returns {x3dom.fields.SFColorRGBA} this modified color
 */
x3dom.fields.SFColorRGBA.prototype.setFromUint = function ( rgbaInteger )
{
    this.r = ( ( ( rgbaInteger >> 24 ) & 255 ) / 255 );
    this.g = ( ( ( rgbaInteger >> 16 ) & 255 ) / 255 );
    this.b = ( ( ( rgbaInteger >>  8 ) & 255 ) / 255 );
    this.a = ( ( ( rgbaInteger >>  0 ) & 255 ) / 255 );
    return this;
};

/**
 * Parses a string and creates and returns a color based upon it.
 *
 * The input string might represent the color information in a variety
 * of formats, encompassing a CSS-conformant color name, an invocation
 * of ``rgb(red, green, blue)'', an invocation of
 * ``rgba(red, green, blue, alpha)'', or a hexadecimal representation of
 * the kind ``#RRGGBBAA'', ``#RRGGBB'', ``#RGBA'', or ``#RGB''.
 *
 * @param {String} color - the string to parse the color information from
 * @returns {x3dom.fields.SFColorRGBA} the color parsed from the string,
 *                                     or a color with all components
 *                                     zero-valued if none format could
 *                                     be matched
 */
x3dom.fields.SFColorRGBA.colorParse = function ( color )
{
    var rgba = _colorParse( color );
    return new x3dom.fields.SFColorRGBA( rgba.r, rgba.g, rgba.b, rgba.a );
};

/**
 * SFImage constructor.
 *
 * Such an image is specified by its width and height in pixels, as well
 * as the number of color components, or color depth, and a flat array
 * of integer pixel components in the range [0, 255].
 *
 * For more information consult {@link https://www.web3d.org/documents/specifications/19775-1/V3.2/Part01/fieldsDef.html#SFImageAndMFImage}.
 *
 * @class Represents an SFImage
 */
x3dom.fields.SFImage = function ( w, h, c, arr )
{
    if ( arguments.length === 0 || !( arr && arr.map ) )
    {
        this.width  = 0;
        this.height = 0;
        this.comp   = 0;
        this.array  = [];
    }
    else
    {
        this.width  = w;
        this.height = h;
        this.comp   = c;
        var that    = this.array;
        arr.map( function ( v ) { that.push( v ); }, this.array );
    }
};

/**
 * Parses a string and returns a new image.
 *
 * The process involves the examination of whitespace-separated tokens
 * in the input string, the tally of which design the actual output.
 * If at most two tokens are found, the width and height are extracted
 * in this order. If three tokens are found, the width, height, and
 * number of components are extracted in this order. If four or more
 * tokens are found, the width, height, number of components, and the
 * available pixel data are extracted in this order.
 *
 * @param {String} str - the string to parse the image data from
 * @returns {x3dom.fields.SFImage} a new image from the parsed string
 */
x3dom.fields.SFImage.parse = function ( str )
{
    var img = new x3dom.fields.SFImage();
    img.setValueByStr( str );
    return img;
};

/**
 * Returns a copy of a supplied image.
 *
 * @param {x3dom.fields.SFImage} that - the image to copy
 * @returns {x3dom.fields.SFImage} a copy of the supplied image
 */
x3dom.fields.SFImage.copy = function ( that )
{
    var destination = new x3dom.fields.SFImage();
    destination.width = that.width;
    destination.height = that.height;
    destination.comp = that.comp;
    // use instead slice?
    // destination.array = that.array.slice();
    destination.setPixels( that.getPixels() );
    return destination;
};

/**
 * Returns a copy of this image.
 *
 * @returns {x3dom.fields.SFImage} a copy of this image
 */
x3dom.fields.SFImage.prototype.copy = function ()
{
    return x3dom.fields.SFImage.copy( this );
};

/**
 * Parses a string and sets this image's data from it.
 *
 * The process involves the examination of whitespace-separated tokens
 * in the input string, the tally of which design the actual output.
 * If at most two tokens are found, the width and height are extracted
 * in this order. If three tokens are found, the width, height, and
 * number of components are extracted in this order. If four or more
 * tokens are found, the width, height, number of components, and the
 * available pixel data are extracted in this order.
 *
 * @param {String} str - the string to parse the image data from
 * @returns {x3dom.fields.SFImage} this modified image
 */
x3dom.fields.SFImage.prototype.setValueByStr = function ( str )
{
    var mc = str.match( /(\w+)/g );
    var n = mc.length;

    this.array = [];

    if ( n > 2 )
    {
        this.width = +mc[ 0 ];
        this.height = +mc[ 1 ];
        this.comp = +mc[ 2 ];
    }
    else
    {
        this.width = 0;
        this.height = 0;
        this.comp = 0;
        return;
    }

    var i,
        r,
        g,
        b,
        a;
    var radix = 10;

    for ( i = 3; i < n; i++ )
    {
        if ( !mc[ i ].substr ) {continue;}

        if ( mc[ i ].substr( 1, 1 ).toLowerCase() === "x" ) {radix = 16;}
        // Maybe optimize by directly parsing value!
        var inp = parseInt( mc[ i ], radix );
        // just coercing should also work:
        // var inp = mc[i];
        // check for NaN ?
        if ( this.comp === 1 )
        {
            r = inp & 255;
            this.array.push( r );
        }
        else if ( this.comp === 2 )
        {
            r = inp >> 8 & 255;
            g = inp & 255;
            this.array.push( r, g );
        }
        else if ( this.comp === 3 )
        {
            r = inp >> 16 & 255;
            g = inp >> 8 & 255;
            b = inp & 255;
            this.array.push( r, g, b );
        }
        else if ( this.comp === 4 )
        {
            r = inp >> 24 & 255;
            g = inp >> 16 & 255;
            b = inp >> 8 & 255;
            a = inp & 255;
            this.array.push( r, g, b, a );
        }
    }
};

/**
 * Sets the pixel color at a specified position of this image.
 *
 * @param {Number} x - the column index of the pixel to modify, starting
 *                     at zero
 * @param {Number} y - the row index of the pixel to modify, starting
 *                     at zero
 * @param {x3dom.fields.SFColor} color - the new pixel color
 * @returns {x3dom.fields.SFImage} this modified image
 */
x3dom.fields.SFImage.prototype.setPixel = function ( x, y, color )
{
    var startIdx = ( y * this.width + x ) * this.comp;

    if ( this.comp === 1 && startIdx < this.array.length )
    {
        this.array[ startIdx ] = color.r * 255;
    }
    else if ( this.comp === 2 && ( startIdx + 1 ) < this.array.length )
    {
        this.array[ startIdx ] = color.r * 255;
        this.array[ startIdx + 1 ] = color.g * 255;
    }
    else if ( this.comp === 3 && ( startIdx + 2 ) < this.array.length )
    {
        this.array[ startIdx ] = color.r * 255;
        this.array[ startIdx + 1 ] = color.g * 255;
        this.array[ startIdx + 2 ] = color.b * 255;
    }
    else if ( this.comp === 4 && ( startIdx + 3 ) < this.array.length )
    {
        this.array[ startIdx ] = color.r * 255;
        this.array[ startIdx + 1 ] = color.g * 255;
        this.array[ startIdx + 2 ] = color.b * 255;
        this.array[ startIdx + 3 ] = color.a * 255;
    }

    return this;
};

/**
 * Returns the pixel at a specified position in this image.
 *
 * @param {Number} x - the column index of the pixel to return, starting
 *                     at zero
 * @param {Number} y - the row index of the pixel to return, starting
 *                     at zero
 * @returns {x3dom.fields.SFColorRGBA} the pixel color at the specified
 *                                     position
 */
x3dom.fields.SFImage.prototype.getPixel = function ( x, y )
{
    var startIdx = ( y * this.width + x ) * this.comp;

    if ( this.comp === 1 && startIdx < this.array.length )
    {
        var intensity = this.array[ startIdx ] / 255;
        return new x3dom.fields.SFColorRGBA( intensity,
            intensity,
            intensity,
            1 );
    }
    else if ( this.comp === 2 && ( startIdx + 1 ) < this.array.length )
    {
        var intensity = this.array[ startIdx ]     / 255;
        var alpha     = this.array[ startIdx + 1 ] / 255;
        return new x3dom.fields.SFColorRGBA( intensity,
            intensity,
            intensity,
            alpha );
    }
    else if ( this.comp === 3 && ( startIdx + 2 ) < this.array.length )
    {
        return new x3dom.fields.SFColorRGBA( this.array[ startIdx ] / 255,
            this.array[ startIdx + 1 ] / 255,
            this.array[ startIdx + 2 ] / 255,
            1 );
    }
    else if ( this.comp === 4 && ( startIdx + 3 ) < this.array.length )
    {
        return new x3dom.fields.SFColorRGBA( this.array[ startIdx ] / 255,
            this.array[ startIdx + 1 ] / 255,
            this.array[ startIdx + 2 ] / 255,
            this.array[ startIdx + 3 ] / 255 );
    }
};

/**
 * Sets the pixels from an array of colors.
 *
 * @param {x3dom.fields.SFColor[]|x3dom.fields.SFColorRGBA[]} pixels -
 *          an array of the new pixel colors
 * @returns {x3dom.fields.SFImage} this modified image
 */
x3dom.fields.SFImage.prototype.setPixels = function ( pixels )
{
    var i,
        idx = 0;

    if ( this.comp === 1 )
    {
        for ( i = 0; i < pixels.length; i++ )
        {
            this.array[ idx++ ] = pixels[ i ].r * 255;
        }
    }
    else if ( this.comp === 2 )
    {
        for ( i = 0; i < pixels.length; i++ )
        {
            this.array[ idx++ ] = pixels[ i ].r * 255;
            this.array[ idx++ ] = pixels[ i ].g * 255;
        }
    }
    else if ( this.comp === 3 )
    {
        for ( i = 0; i < pixels.length; i++ )
        {
            this.array[ idx++ ] = pixels[ i ].r * 255;
            this.array[ idx++ ] = pixels[ i ].g * 255;
            this.array[ idx++ ] = pixels[ i ].b * 255;
        }
    }
    else if ( this.comp === 4 )
    {
        for ( i = 0; i < pixels.length; i++ )
        {
            this.array[ idx++ ] = pixels[ i ].r * 255;
            this.array[ idx++ ] = pixels[ i ].g * 255;
            this.array[ idx++ ] = pixels[ i ].b * 255;
            this.array[ idx++ ] = pixels[ i ].a * 255;
        }
    }
};

/**
 * Returns an array with all pixels of this image, each represented by
 * an ``SFColorRGBA'' object.
 *
 * @returns {x3dom.fields.SFColorRGBA[]} an array of RGBA pixel colors
 */
x3dom.fields.SFImage.prototype.getPixels = function ()
{
    var i;
    var pixels = [];

    if ( this.comp === 1 )
    {
        for ( i = 0; i < this.array.length; i += this.comp )
        {
            var intensity = this.array[ i ] / 255;
            pixels.push( new x3dom.fields.SFColorRGBA( intensity,
                intensity,
                intensity,
                1 ) );
        }
    }
    else if ( this.comp === 2 )
    {
        for ( i = 0; i < this.array.length; i += this.comp )
        {
            var intensity = this.array[ i ]     / 255;
            var alpha     = this.array[ i + 1 ] / 255;
            pixels.push( new x3dom.fields.SFColorRGBA( intensity,
                intensity,
                intensity,
                alpha ) );
        }
    }
    else if ( this.comp === 3 )
    {
        for ( i = 0; i < this.array.length; i += this.comp )
        {
            pixels.push( new x3dom.fields.SFColorRGBA( this.array[ i ] / 255,
                this.array[ i + 1 ] / 255,
                this.array[ i + 2 ] / 255,
                1 ) );
        }
    }
    else if ( this.comp === 4 )
    {
        for ( i = 0; i < this.array.length; i += this.comp )
        {
            pixels.push( new x3dom.fields.SFColorRGBA( this.array[ i ] / 255,
                this.array[ i + 1 ] / 255,
                this.array[ i + 2 ] / 255,
                this.array[ i + 3 ] / 255 ) );
        }
    }

    return pixels;
};

/**
 * Returns the image pixel data as an array of integer values conforming
 * to OpenGL's format.
 *
 * @returns {Number[]} an array containing this image's pixel data as
 *                     integer components
 */
x3dom.fields.SFImage.prototype.toGL = function ()
{
    var a = [];

    this.array.map( function ( c )
    {
        a.push( c );
    } );

    return a;
};

///////////////////////////////////////////////////////////////////////////////
// Multi-Field Definitions
///////////////////////////////////////////////////////////////////////////////

/**
 * MFColor constructor.
 *
 * An ``MFColorRGBA'' object stores an arbitrary number of
 * ``SFColorRGBA'' instances in a one-dimensional array.
 *
 * @class Represents a MFColor
 */
x3dom.fields.MFColor = function ( colorArray )
{
    if ( colorArray )
    {
        var that = this;
        colorArray.map( function ( c ) { that.push( c ); }, this );
    }
};

/**
 * Returns a copy of the supplied color array.
 *
 * @param {x3dom.fields.MFColor} colorArray - the color array to copy
 * @returns {x3dom.fields.MFColor} a copy of the supplied color array
 */
x3dom.fields.MFColor.copy = function ( colorArray )
{
    var destination = new x3dom.fields.MFColor();
    colorArray.map( function ( v ) { destination.push( v.copy() ); }, this );
    return destination;
};

x3dom.fields.MFColor.prototype = x3dom.extend( [] );

/**
 * Parses a string and returns a new RGB color array based upon its
 * received color data.
 *
 * @param {String} str - the string to parse the RGB color data from
 * @returns {x3dom.fields.MFColor} a new RGB color array containing the
 *                                 parsed RGB colors
 */
x3dom.fields.MFColor.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var colors = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 3 )
    {
        colors.push( new x3dom.fields.SFColor( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ) );
    }

    return new x3dom.fields.MFColor( colors );
};

/**
 * Returns a copy of this color array.
 *
 * @returns {x3dom.fields.MFColor} a copy of this color array
 */
x3dom.fields.MFColor.prototype.copy = function ()
{
    return x3dom.fields.MFColor.copy( this );
};

/**
 * Parses a string, transfers the extracted color data into this RGB
 * color array, and returns the modified RGB color array.
 *
 * @param {String} str - the string to parse into this RGB color array
 * @returns {x3dom.fields.MFColor} this modified RGB color array
 */
x3dom.fields.MFColor.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 3 )
    {
        this.push( new x3dom.fields.SFColor( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ) );
    }
};

/**
 * Returns a one-dimensional array of numbers which represents this
 * color array's components in order of the maintained colors, being
 * suitable for communication with OpenGL.
 *
 * @returns {Number[]} a one-dimensional array containing all stored
 *                     colors' red, green, and blue components in this
 *                     order
 */
x3dom.fields.MFColor.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( c )
    {
        a.push( c.r );
        a.push( c.g );
        a.push( c.b );
    } );

    return a;
};

/**
 * MFColorRGBA constructor.
 *
 * An ``MFColorRGBA'' object stores an arbitrary number of
 * ``SFColorRGBA'' instances in a one-dimensional array.
 *
 * @class Represents a MFColorRGBA
 */
x3dom.fields.MFColorRGBA = function ( colorArray )
{
    if ( colorArray )
    {
        var that = this;
        colorArray.map( function ( c ) { that.push( c ); }, this );
    }
};

/**
 * Returns a copy of the supplied RGBA color array.
 *
 * @param {x3dom.fields.MFColorRGBA} colorArray - the color array to
 *                                                copy
 * @returns {x3dom.fields.MFColorRGBA} a copy of the supplied color
 *                                     array
 */
x3dom.fields.MFColorRGBA.copy = function ( colorArray )
{
    var destination = new x3dom.fields.MFColorRGBA();
    colorArray.map( function ( v ) { destination.push( v.copy() ); }, this );
    return destination;
};

x3dom.fields.MFColorRGBA.prototype = x3dom.extend( [] );

/**
 * Parses a string and returns a new RGBA color array from its data.
 *
 * @param {String} str - the string to parse into an RGBA color array
 * @returns {x3dom.fields.MFColorRGBA} a new RGBA color array obtained
 *                                     from the parsed string
 */
x3dom.fields.MFColorRGBA.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var colors = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 4 )
    {
        colors.push( new x3dom.fields.SFColorRGBA( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ], +mc[ i + 3 ] ) );
    }

    return new x3dom.fields.MFColorRGBA( colors );
};

/**
 * Returns a copy of this RGBA color array.
 *
 * @returns {x3dom.fields.MFColorRGBA} a copy of this color array
 */
x3dom.fields.MFColorRGBA.prototype.copy = function ()
{
    return x3dom.fields.MFColorRGBA.copy( this );
};

/**
 * Parses a string, transfers the extracted color data into this RGBA
 * color array, and returns the modified RGBA color array.
 *
 * @param {String} str - the string to parse into this RGBA color array
 * @returns {x3dom.fields.MFColorRGBA} this modified RGBA color array
 */
x3dom.fields.MFColorRGBA.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 4 )
    {
        this.push( new x3dom.fields.SFColorRGBA( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ], +mc[ i + 3 ] ) );
    }
};

/**
 * Returns a one-dimensional array of numbers which represents this
 * color array's components in order of the maintained colors, being
 * suitable for communication with OpenGL.
 *
 * @returns {Number[]} a one-dimensional array containing all stored
 *                     colors' red, green, blue, and alpha components in
 *                     this order
 */
x3dom.fields.MFColorRGBA.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( c )
    {
        a.push( c.r );
        a.push( c.g );
        a.push( c.b );
        a.push( c.a );
    } );

    return a;
};

/**
 * MFRotation constructor.
 *
 * An ``MFRotation'' object stores an arbitrary number of
 * ``Quaternion'' instances in a one-dimensional array.
 *
 * @class Represents a MFRotation
 */
x3dom.fields.MFRotation = function ( rotArray )
{
    if ( rotArray )
    {
        var that = this;
        rotArray.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFRotation.prototype = x3dom.extend( [] );

/**
 * Returns a copy of the specified rotation array.
 *
 * @param {x3dom.fields.MFRotation} rotationArray - the rotation array
 *                                                  to copy
 * @returns {x3dom.fields.MFRotation} a copy of the supplied rotation
 *                                    array
 */
x3dom.fields.MFRotation.copy = function ( rotationArray )
{
    var destination = new x3dom.fields.MFRotation();
    rotationArray.map( function ( v ) { destination.push( v.copy() ); }, this );
    return destination;
};

/**
 * Returns a copy of this rotation array.
 *
 * @returns {x3dom.fields.MFRotation} a copy of this rotation array
 */
x3dom.fields.MFRotation.prototype.copy = function ()
{
    return x3dom.fields.MFRotation.copy( this );
};

/**
 * Parses a string and returns a new rotation array based upon it.
 *
 * @param {String} str - the string to parse the rotation array from
 * @returns {x3dom.fields.MFRotation} a new rotation array parsed from
 *                                    the input string
 */
x3dom.fields.MFRotation.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var vecs = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 4 )
    {
        vecs.push( x3dom.fields.Quaternion.axisAngle( new x3dom.fields.SFVec3f( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ), +mc[ i + 3 ] ) );
    }

    // holds the quaternion representation as needed by interpolators etc.
    return new x3dom.fields.MFRotation( vecs );
};

/**
 * Parses a string, sets this rotation array's rotation from it, and
 * returns this modified rotation array.
 *
 * @param {String} str - the string to parse the rotations from
 * @returns {x3dom.fields.MFRotation} this modified rotation array
 */
x3dom.fields.MFRotation.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 4 )
    {
        this.push( x3dom.fields.Quaternion.axisAngle( new x3dom.fields.SFVec3f( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ), +mc[ i + 3 ] ) );
    }
};

/**
 * Returns a one-dimensional array of numbers which represents this
 * rotation array's components in order of the maintained rotations,
 * being suitable for communication with OpenGL.
 *
 * @returns {Number[]} a one-dimensional array containing all stored
 *                     rotations' x, y, z, and alpha components in this
 *                     order
 */
x3dom.fields.MFRotation.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( c )
    {
        var val = c.toAxisAngle();
        a.push( val[ 0 ].x );
        a.push( val[ 0 ].y );
        a.push( val[ 0 ].z );
        a.push( val[ 1 ] );
    } );

    return a;
};

/**
 * MFVec3f constructor.
 *
 * An ``MFVec3f'' object stores an arbitrary number of
 * ``SFVec3f'' instances in a one-dimensional array.
 *
 * @class Represents a MFVec3f
 */
x3dom.fields.MFVec3f = function ( vec3Array )
{
    if ( vec3Array )
    {
        var that = this;
        vec3Array.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFVec3f.prototype = x3dom.extend( Array );

/**
 * Returns a copy of the specified 3D vector array.
 *
 * @param {x3dom.fields.MFVec3f} vecArray - the 3D vector array to copy
 * @returns {x3dom.fields.MFVec3f} a copy of the supplied 3D vector
 *                                 array
 */
x3dom.fields.MFVec3f.copy = function ( vec3Array )
{
    var destination = new x3dom.fields.MFVec3f();
    vec3Array.map( function ( v ) { destination.push( v.copy() ); }, this );
    return destination;
};

/**
 * Parses a string and creates and returns a new 3D vector array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFVec3f} a new 3D vector array containing
 *                                 the parsed vectors
 */
x3dom.fields.MFVec3f.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var vecs = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 3 )
    {
        vecs.push( new x3dom.fields.SFVec3f( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ) );
    }

    return new x3dom.fields.MFVec3f( vecs );
};

/**
 * Returns a copy of this vector array.
 *
 * @returns {x3dom.fields.MFVec3f} a copy of this object
 */
x3dom.fields.MFVec3f.prototype.copy = function ()
{
    return x3dom.fields.MFVec3f.copy( this );
};

/**
 * Parses a string and sets this 3D vector array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFVec3f} this modified 3D vector array
 */
x3dom.fields.MFVec3f.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 3 )
    {
        this.push( new x3dom.fields.SFVec3f( +mc[ i + 0 ], +mc[ i + 1 ], +mc[ i + 2 ] ) );
    }
    return this;
};

/**
 * Sets this 3D vector array's elements from the given array.
 *
 * @param {Array} vec3Array - an array of ``SFVec3f'' objects
 *                            to copy from
 */
x3dom.fields.MFVec3f.prototype.setValues = function ( vec3Array )
{
    var i;
    var n = Math.min( vec3Array.length, this.length );

    for ( i = 0; i < n; i++ )
    {
        this[ i ].setValues( vec3Array[ i ] );
    }
};

/**
 * Returns an OpenGL-conformant array representation of this 3D vector
 * array, enlisting each 3D vector's coordinates in order.
 *
 * @returns {Number[]} an array of numbers containing each vector's
 *                     x-, y-, and z-coordinates in this order
 */
x3dom.fields.MFVec3f.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( c )
    {
        a.push( c.x );
        a.push( c.y );
        a.push( c.z );
    } );

    return a;
};

/**
 * Returns a string representation of this 3D vector array.
 *
 * @returns {String} a string representation of this 3D vector array
 */
x3dom.fields.MFVec3f.prototype.toString = function ()
{
    var str = "";

    this.forEach( function ( sf )
    {
        str = str + sf.toString() + " ";
    } );
    return str.trim();
};

/**
 * MFVec2f constructor.
 *
 * An ``MFVec2f'' object stores an arbitrary number of
 * ``SFVec2f'' instances in a one-dimensional array.
 *
 * @class Represents a MFVec2f
 */
x3dom.fields.MFVec2f = function ( vec2Array )
{
    if ( vec2Array )
    {
        var that = this;
        vec2Array.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFVec2f.prototype = x3dom.extend( [] );

/**
 * Returns a copy of the specified 2D vector array.
 *
 * @param {x3dom.fields.MFVec2f} vec2Array - the 2D vector array to copy
 * @returns {x3dom.fields.MFVec2f} a copy of the supplied 2D vector
 *                                 array
 */
x3dom.fields.MFVec2f.copy = function ( vec2Array )
{
    var destination = new x3dom.fields.MFVec2f();
    vec2Array.map( function ( v ) { destination.push( v.copy() ); }, this );
    return destination;
};

/**
 * Parses a string and creates and returns a new 2D vector array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFVec3f} a new 2D vector array containing
 *                                 the parsed vectors
 */
x3dom.fields.MFVec2f.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var vecs = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 2 )
    {
        vecs.push( new x3dom.fields.SFVec2f( +mc[ i + 0 ], +mc[ i + 1 ] ) );
    }

    return new x3dom.fields.MFVec2f( vecs );
};

/**
 * Returns a copy of this 2D vector array.
 *
 * @returns {x3dom.fields.MFVec2f} a copy of this 2D vector array
 */
x3dom.fields.MFVec2f.prototype.copy = function ()
{
    return x3dom.fields.MFVec2f.copy( this );
};

/**
 * Parses a string and sets this 2D vector array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFVec2f} this modified 3D vector array
 */
x3dom.fields.MFVec2f.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i += 2 )
    {
        this.push( new x3dom.fields.SFVec2f( +mc[ i + 0 ], +mc[ i + 1 ] ) );
    }
};

/**
 * Returns an OpenGL-conformant array representation of this 2D vector
 * array, enlisting each 2D vector's coordinates in order.
 *
 * @returns {Number[]} an array of numbers containing each vector's
 *                     x- and y-coordinates in this order
 */
x3dom.fields.MFVec2f.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( v )
    {
        a.push( v.x );
        a.push( v.y );
    } );

    return a;
};

/**
 * MFInt32 constructor.
 *
 * An ``MFInt32'' object stores an arbitrary number of integer
 * values in a one-dimensional array.
 *
 * @class Represents a MFInt32
 */
x3dom.fields.MFInt32 = function ( array )
{
    if ( array )
    {
        var that = this;
        array.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFInt32.prototype = x3dom.extend( [] );

/**
 * Returns a copy of the supplied integer array.
 *
 * @param {x3dom.fields.MFInt32} intArray - the integer array to copy
 * @returns {x3dom.fields.MFInt32} a copy of the supplied integer array
 */
x3dom.fields.MFInt32.copy = function ( intArray )
{
    var destination = new x3dom.fields.MFInt32();
    intArray.map( function ( v ) { destination.push( v ); }, this );
    return destination;
};

/**
 * Parses a string and returns a new integer array containing the
 * extracted integer values.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFInt32} a new integer array containing the
 *                                 parsed values
 */
x3dom.fields.MFInt32.parse = function ( str )
{
    var mc = str.match( /([+\-]?\d+\s*){1},?\s*/g );
    var vals = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; ++i )
    {
        vals.push( parseInt( mc[ i ], 10 ) );
    }

    return new x3dom.fields.MFInt32( vals );
};

/**
 * Returns a copy of this integer array.
 *
 * @returns {x3dom.fields.MFInt32} a copy of this integer array
 */
x3dom.fields.MFInt32.prototype.copy = function ()
{
    return x3dom.fields.MFInt32.copy( this );
};

/**
 * Parses a string and sets this integer array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFInt32} this modified integer array
 */
x3dom.fields.MFInt32.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-]?\d+\s*){1},?\s*/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; ++i )
    {
        this.push( parseInt( mc[ i ], 10 ) );
    }
};

/**
 * Returns an OpenGL-conformant array representation of this integer
 * array as a one-dimensional array.
 *
 * @returns {Number[]} an array of numbers containing the integer values
 */
x3dom.fields.MFInt32.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( v )
    {
        a.push( v );
    } );

    return a;
};

/**
 * MFFloat constructor.
 *
 * An ``MFFloat'' object stores an arbitrary number of
 * floating-point numbers in a one-dimensional array.
 *
 * @class Represents a MFFloat
 */
x3dom.fields.MFFloat = function ( array )
{
    if ( array )
    {
        var that = this;
        array.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFFloat.prototype = x3dom.extend( [] );

/**
 * Returns a copy of the supplied float array.
 *
 * @returns {x3dom.fields.MFFloat} a copy of the supplied float array
 */
x3dom.fields.MFFloat.copy = function ( floatArray )
{
    var destination = new x3dom.fields.MFFloat();
    floatArray.map( function ( v ) { destination.push( v ); }, this );
    return destination;
};

/**
 * Parses a string and returns a new float array containing the
 * extracted floating-point values.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFFloat} a new float array containing the
 *                                 parsed values
 */
x3dom.fields.MFFloat.parse = function ( str )
{
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    var vals = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i++ )
    {
        vals.push( +mc[ i ] );
    }

    return new x3dom.fields.MFFloat( vals );
};

/**
 * Returns a copy of this float array.
 *
 * @returns {x3dom.fields.MFFloat} a copy of this float array
 */
x3dom.fields.MFFloat.prototype.copy = function ()
{
    return x3dom.fields.MFFloat.copy( this );
};

/**
 * Parses a string and sets this float array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFFloat} this modified float array
 */
x3dom.fields.MFFloat.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /([+\-0-9eE\.]+)/g );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i++ )
    {
        this.push( +mc[ i ] );
    }
};

/**
 * Returns a one-dimensional array of numbers which represents this
 * float array's numbers, being suitable for communication with OpenGL.
 *
 * @returns {Number[]} a one-dimensional array containing all stored
 *                     floating-point numbers
 */
x3dom.fields.MFFloat.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( v )
    {
        a.push( v );
    } );

    return a;
};

/**
 * MFBoolean constructor.
 *
 * An ``MFBoolean'' object stores an arbitrary number of
 * ``Boolean'' values in a one-dimensional array.
 *
 * @class Represents a MFBoolean
 */
x3dom.fields.MFBoolean = function ( array )
{
    if ( array )
    {
        var that = this;
        array.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFBoolean.prototype = x3dom.extend( [] );

/**
 * Returns a copy of the supplied Boolean array.
 *
 * @returns {x3dom.fields.MFBoolean} the copy of the supplied Boolean
 *                                   array
 */
x3dom.fields.MFBoolean.copy = function ( boolArray )
{
    var destination = new x3dom.fields.MFBoolean();
    boolArray.map( function ( v ) { destination.push( v ); }, this );
    return destination;
};

/**
 * Parses a string and returns a new Boolean array containing the
 * extracted Boolean values.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFBoolean} a new boolean array containing the
 *                                 parsed values
 */
x3dom.fields.MFBoolean.parse = function ( str )
{
    var mc = str.match( /(true|false|1|0)/ig );
    var vals = [];
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i++ )
    {
        vals.push( ( mc[ i ] == "1" || mc[ i ].toLowerCase() == "true" ) );
    }

    return new x3dom.fields.MFBoolean( vals );
};

/**
 * Returns a copy of this Boolean array.
 *
 * @returns {Boolean} a copy of this Boolean array
 */
x3dom.fields.MFBoolean.prototype.copy = function ()
{
    return x3dom.fields.MFBoolean.copy( this );
};

/**
 * Parses a string and sets this Boolean array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFBoolean} this modified Boolean array
 */
x3dom.fields.MFBoolean.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    var mc = str.match( /(true|false|1|0)/ig );
    for ( var i = 0, n = mc ? mc.length : 0; i < n; i++ )
    {
        this.push( ( mc[ i ] == "1" || mc[ i ].toLowerCase() == "true" ) );
    }
};

/**
 * Returns a one-dimensional array of integer numbers which represents
 * this Boolean array's truth values, being suitable for communication
 * with OpenGL.
 *
 * Each Boolean ``true'' value will be converted into the
 * integer one (1), each ``false'' into the integer zero (0).
 *
 * @returns {Number[]} a one-dimensional array representing the Boolean
 *                     truth values in a numerical fashion
 */
x3dom.fields.MFBoolean.prototype.toGL = function ()
{
    var a = [];

    this.map( function ( v )
    {
        a.push( v ? 1 : 0 );
    } );

    return a;
};

/**
 * MFString constructor.
 *
 * An ``MFString'' object stores an arbitrary number of
 * ``String'' values in a one-dimensional array.

 * @class Represents a MFString
 */
x3dom.fields.MFString = function ( strArray )
{
    if ( strArray && strArray.map )
    {
        var that = this;
        strArray.map( function ( v ) { that.push( v ); }, this );
    }
};

x3dom.fields.MFString.prototype = x3dom.extend( [] );

/**
 * Creates and returns a copy of the supplied string array.
 *
 * @param {MFString} stringArray - the string array to copy
 * @returns {MFString} a copy of the input string array
 */
x3dom.fields.MFString.copy = function ( stringArray )
{
    var destination = new x3dom.fields.MFString();
    stringArray.map( function ( v ) { destination.push( v ); }, this );
    return destination;
};

/**
 * Parses a string and returns a new string array containing the
 * extracted string values.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFString} a new string array containing the
 *                                  parsed values
 */
x3dom.fields.MFString.parse = function ( str )
{
    var arr = [];
    str = str.trim();
    // ignore leading whitespace?
    if ( str.length && str[ 0 ] == "\"" )
    {
        var m;
        var re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        while ( ( m = re.exec( str ) ) )
        {
            var s = m[ 1 ].replace( /\\([\\"])/g, "$1" );
            if ( s !== undefined )
            {
                arr.push( s );
            }
        }
    }
    else
    {
        arr.push( str );
    }
    return new x3dom.fields.MFString( arr );
};

/**
 * Returns a copy of this string array.
 *
 * @returns {MFString} a copy of this string array
 */
x3dom.fields.MFString.prototype.copy = function ()
{
    return x3dom.fields.MFString.copy( this );
};

/**
 * Parses a string and sets this string array's elements from the
 * obtained data, finally returning this modified array.
 *
 * @param {String} str - the string to parse
 * @returns {x3dom.fields.MFString} this modified string array
 */
x3dom.fields.MFString.prototype.setValueByStr = function ( str )
{
    this.length = 0;
    // ignore leading whitespace?
    if ( str.length && str[ 0 ] == "\"" )
    {
        var m;
        var re = /"((?:[^\\"]|\\\\|\\")*)"/g;
        while ( ( m = re.exec( str ) ) )
        {
            var s = m[ 1 ].replace( /\\([\\"])/, "$1" );
            if ( s !== undefined )
            {
                this.push( s );
            }
        }
    }
    else
    {
        this.push( str );
    }
    return this;
};

/**
 * Returns a string representation of this string array.
 *
 * @returns {String} a string representation of this string array
 */
x3dom.fields.MFString.prototype.toString = function ()
{
    var str = "";
    for ( var i = 0, n = this.length; i < n; i++ )
    {
        str = str + this[ i ] + " ";
    }
    return str;
};

///////////////////////////////////////////////////////////////////////////////
// Single-/Multi-Field Node Definitions
///////////////////////////////////////////////////////////////////////////////

/**
 * SFNode constructor.
 *
 * @class Represents a SFNode
 */
x3dom.fields.SFNode = function ( type )
{
    this.type = type;
    this.node = null;
};

/**
 * Checks whether this node refers to the specified one.
 *
 * @param {x3dom.fields.SFNode} node - the node to check for presence
 * @returns {Boolean} ``true'' if this node contains the
 *                    supplied one, ``false'' otherwise
 */
x3dom.fields.SFNode.prototype.hasLink = function ( node )
{
    return ( node ? ( this.node === node ) : this.node );
};

/**
 * Stores the specified node in this one, always returning the Boolean
 * ``true'' value as a sign of success.
 *
 * @param {x3dom.fields.SFNode} node - the node to add
 * @returns {Boolean} always ``true'' as a sign of successful
 *                    storage of the supplied node
 */
x3dom.fields.SFNode.prototype.addLink = function ( node )
{
    this.node = node;
    return true;
};

/**
 * Removes the specified node from this one, if it matches the stored
 * data, returning a Boolean success or failure value.
 *
 * @param {x3dom.fields.SFNode} node - the node to remove
 * @returns {Boolean} ``true'' if the specified node was
 *                    stored in this one and could be removed,
 *                    ``false'' if not
 */
x3dom.fields.SFNode.prototype.rmLink = function ( node )
{
    if ( this.node === node )
    {
        this.node = null;
        return true;
    }
    else
    {
        return false;
    }
};

/**
 * MFNode constructor.
 *
 * Represents a collection of zero or more ``SFNode'' objects,
 * thus being a node array.
 *
 * @class Represents a MFNode
 */
x3dom.fields.MFNode = function ( type )
{
    this.type = type;
    this.nodes = [];
};

/**
 * Checks whether this node array contains the specified node, returning
 * a Boolean check result.
 *
 * @param {x3dom.fields.SFNode} node - the node to check for presence
 * @returns {Boolean} ``true'' if either the specified node is
 *                    contained in this node array, or if no node is
 *                    supplied and the node array is not empty,
 *                    ``false'' if the node is either not part
 *                    of this node array, or is not supplied and the
 *                    node array is empty
 */
x3dom.fields.MFNode.prototype.hasLink = function ( node )
{
    if ( node )
    {
        for ( var i = 0, n = this.nodes.length; i < n; i++ )
        {
            if ( this.nodes[ i ] === node )
            {
                return true;
            }
        }
    }
    else
    {
        return ( this.length > 0 );
    }
    return false;
};

/**
 * Adds the specified node to this node's children
 *
 * @param {SFNode} node - the node to append
 * @returns {Boolean} always ``true''
 */
x3dom.fields.MFNode.prototype.addLink = function ( node )
{
    this.nodes.push( node );
    return true;
};

/**
 * Removes the first occurrence of a specified node from the child
 * nodes list of this node, returning a Boolean success or failure flag.
 *
 * @param {x3dom.fields.SFNode} node - the node to remove
 * @returns {Boolean} ``true'' if the node could be found and
 *                    removed, ``false'' if not
 */
x3dom.fields.MFNode.prototype.rmLink = function ( node )
{
    for ( var i = 0, n = this.nodes.length; i < n; i++ )
    {
        if ( this.nodes[ i ] === node )
        {
            this.nodes.splice( i, 1 );
            return true;
        }
    }
    return false;
};

/**
 * Returns the number of child nodes stored in this node.
 *
 * @returns {Number} the number of child nodes
 */
x3dom.fields.MFNode.prototype.length = function ()
{
    return this.nodes.length;
};

///////////////////////////////////////////////////////////////////////////////
// Math Helper Class Definitions
///////////////////////////////////////////////////////////////////////////////

/**
 * Line constructor.
 *
 * @param {SFVec3f} pos - anchor point of the line
 * @param {SFVec3f} dir - direction of the line, must be normalized
 * @class Represents a Line (as internal helper).
 *        A line has an origin and a vector that describes a direction,
 *        it is infinite in both directions.
 */
x3dom.fields.Line = function ( pos, dir )
{
    if ( arguments.length === 0 )
    {
        this.pos = new x3dom.fields.SFVec3f( 0, 0, 0 );
        this.dir = new x3dom.fields.SFVec3f( 0, 0, 1 );
    }

    this.pos = x3dom.fields.SFVec3f.copy( pos );
    this.dir = x3dom.fields.SFVec3f.copy( dir );
};

/**
 * For a given point, this function returns the closest point on this
 * line.
 *
 * @param p {x3dom.fields.SFVec3f} - the point
 * @returns {x3dom.fields.SFVec3f} the closest point on this line
 */
x3dom.fields.Line.prototype.closestPoint = function ( p )
{
    var distVec = p.subtract( this.pos );

    // project the distance vector on the line
    var projDist = distVec.dot( this.dir );

    return this.pos.add( this.dir.multiply( projDist ) );
};

/**
 * For a given point, this function returns the distance to the closest
 * point on this line.
 *
 * @param p {x3dom.fields.SFVec3f} - the point
 * @returns {Number} the distance to the closest point
 */
x3dom.fields.Line.prototype.shortestDistance = function ( p )
{
    var distVec = p.subtract( this.pos );

    // project the distance vector on the line
    var projDist = distVec.dot( this.dir );

    // subtract the projected distance vector, to obtain the part that
    // is orthogonal to this line
    return distVec.subtract( this.dir.multiply( projDist ) ).length();
};

/**
 * Ray constructor.
 *
 * @param {SFVec3f} pos - anchor point of the ray
 * @param {SFVec3f} dir - direction of the ray, must be normalized
 * @class Represents a Ray (as internal helper).
 *        A ray is a special line that extends to only one direction
 *        from its origin.
 */
x3dom.fields.Ray = function ( pos, dir )
{
    if ( arguments.length === 0 )
    {
        this.pos = new x3dom.fields.SFVec3f( 0, 0, 0 );
        this.dir = new x3dom.fields.SFVec3f( 0, 0, 1 );
    }
    else
    {
        this.pos = new x3dom.fields.SFVec3f( pos.x, pos.y, pos.z );

        var n = dir.length();
        if ( n ) { n = 1.0 / n; }

        this.dir = new x3dom.fields.SFVec3f( dir.x * n,
            dir.y * n,
            dir.z * n );
    }

    this.enter = 0;
    this.exit = 0;
    this.hitObject = null;
    this.hitPoint = {};
    this.dist = Number.MAX_VALUE;
};

/**
 * Returns a string representation of this ray.
 *
 * @returns {String} a string representation of this ray
 */
x3dom.fields.Ray.prototype.toString = function ()
{
    return "Ray: [" + this.pos.toString() + "; " +
                      this.dir.toString() + "]";
};

/**
 * Intersects this ray with a plane, defined by the given anchor point
 * and normal. The result returned is the point of intersection, if any.
 * If no point of intersection exists, null is returned. Null is also
 * returned in case there is an infinite number of solutions (, i.e., if
 * the ray origin lies in the plane).
 *
 * @param {x3dom.fields.SFVec3f} p - anchor point
 * @param {x3dom.fields.SFVec3f} n - plane normal
 * @returns {x3dom.fields.SFVec3f} the point of intersection, can be null
 */
x3dom.fields.Ray.prototype.intersectPlane = function ( p, n )
{
    var result = null;

    var alpha; // ray parameter, should be computed

    var nDotDir = n.dot( this.dir );

    // if the ray hits the plane, the plane normal and ray direction
    // must be facing each other
    if ( nDotDir < 0.0 )
    {
        alpha = ( p.dot( n ) - this.pos.dot( n ) ) / nDotDir;

        result = this.pos.addScaled( this.dir, alpha );
    }

    return result;
};

/**
 * Intersect a line with a box volume specified by its the low and
 * high points and demarcations of its main diagonal.
 *
 * @param {x3dom.fields.SFVec3f} the lower  endpoint of the box diagonal
 * @param {x3dom.fields.SFVec3f} the higher endpoint of the box diagonal
 */
x3dom.fields.Ray.prototype.intersect = function ( low, high )
{
    var isect = 0.0;
    var out = Number.MAX_VALUE;
    var r;
    var te;
    var tl;

    if ( this.dir.x > x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.x;

        te = ( low.x - this.pos.x ) * r;
        tl = ( high.x - this.pos.x ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }
    }
    else if ( this.dir.x < -x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.x;

        te = ( high.x - this.pos.x ) * r;
        tl = ( low.x - this.pos.x ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }
    }
    else if ( this.pos.x < low.x || this.pos.x > high.x )
    {
        return false;
    }

    if ( this.dir.y > x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.y;

        te = ( low.y - this.pos.y ) * r;
        tl = ( high.y - this.pos.y ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }

        if ( isect - out >= x3dom.fields.Eps )
        {
            return false;
        }
    }
    else if ( this.dir.y < -x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.y;

        te = ( high.y - this.pos.y ) * r;
        tl = ( low.y - this.pos.y ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }

        if ( isect - out >= x3dom.fields.Eps )
        {
            return false;
        }
    }
    else if ( this.pos.y < low.y || this.pos.y > high.y )
    {
        return false;
    }

    if ( this.dir.z > x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.z;

        te = ( low.z - this.pos.z ) * r;
        tl = ( high.z - this.pos.z ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }
    }
    else if ( this.dir.z < -x3dom.fields.Eps )
    {
        r = 1.0 / this.dir.z;

        te = ( high.z - this.pos.z ) * r;
        tl = ( low.z - this.pos.z ) * r;

        if ( tl < out )
        {
            out = tl;
        }

        if ( te > isect )
        {
            isect = te;
        }
    }
    else if ( this.pos.z < low.z || this.pos.z > high.z )
    {
        return false;
    }

    this.enter = isect;
    this.exit = out;

    return ( isect - out < x3dom.fields.Eps );
};

/**
 * BoxVolume constructor.
 *
 * @class Represents a box volume (as internal helper).
 */
x3dom.fields.BoxVolume = function ( min, max )
{
    if ( arguments.length < 2 )
    {
        this.min = new x3dom.fields.SFVec3f( 0, 0, 0 );
        this.max = new x3dom.fields.SFVec3f( 0, 0, 0 );
        this.valid = false;
    }
    else
    {
        // compiler enforced type check for min/max would be nice
        this.min = x3dom.fields.SFVec3f.copy( min );
        this.max = x3dom.fields.SFVec3f.copy( max );
        this.valid = true;
    }

    this.updateInternals();
};

/**
 * Box Volume Get Scalar Value
 *
 * @returns {number}
 */
x3dom.fields.BoxVolume.prototype.getScalarValue = function ()
{
    var extent = this.max.subtract( this.min );

    return ( extent.x * extent.y * extent.z );
};

/**
 * Box Volume Copy
 *
 * @param other
 * @returns {x3dom.fields.BoxVolume}
 */
x3dom.fields.BoxVolume.copy = function ( other )
{
    var volume = new x3dom.fields.BoxVolume( other.min, other.max );
    volume.valid = other.valid;
    return volume;
};

/**
 * Box Volume Equals
 *
 * @param other
 * @returns {*}
 */
x3dom.fields.BoxVolume.prototype.equals = function ( other )
{
    return ( this.min.equals( other.min, 0.000000000001 ) &&
             this.max.equals( other.max, 0.000000000001 ) );
};

/**
 * Box Volume Update Internals
 *
 */
x3dom.fields.BoxVolume.prototype.updateInternals = function ()
{
    this.radialVec = this.max.subtract( this.min ).multiply( 0.5 );
    this.center = this.min.add( this.radialVec );
    this.diameter = 2 * this.radialVec.length();
};

/**
 * Box Volume Set Bounds
 *
 * @param min
 * @param max
 */
x3dom.fields.BoxVolume.prototype.setBounds = function ( min, max )
{
    this.min.setValues( min );
    this.max.setValues( max );

    this.updateInternals();
    this.valid = true;
};

/**
 * Box Volume Set Bounds By Center Size
 *
 * @param center
 * @param size
 */
x3dom.fields.BoxVolume.prototype.setBoundsByCenterSize = function ( center,
    size )
{
    var halfSize = size.multiply( 0.5 );
    this.min = center.subtract( halfSize );
    this.max = center.add( halfSize );

    this.updateInternals();
    this.valid = true;
};

/**
 * Box Volume Extend Bounds
 *
 * @param min
 * @param max
 */
x3dom.fields.BoxVolume.prototype.extendBounds = function ( min, max )
{
    if ( this.valid )
    {
        if ( this.min.x > min.x ) { this.min.x = min.x; }
        if ( this.min.y > min.y ) { this.min.y = min.y; }
        if ( this.min.z > min.z ) { this.min.z = min.z; }

        if ( this.max.x < max.x ) { this.max.x = max.x; }
        if ( this.max.y < max.y ) { this.max.y = max.y; }
        if ( this.max.z < max.z ) { this.max.z = max.z; }

        this.updateInternals();
    }
    else
    {
        this.setBounds( min, max );
    }
};

/**
 * Box Volume Get Bounds
 *
 * @param min
 * @param max
 */
x3dom.fields.BoxVolume.prototype.getBounds = function ( min, max )
{
    min.setValues( this.min );
    max.setValues( this.max );
};

/**
 * Box Volume Get Radial Vector
 *
 * @returns {*}
 */
x3dom.fields.BoxVolume.prototype.getRadialVec = function ()
{
    return this.radialVec;
};

/**
 * Box Volume Invalidate
 *
 */
x3dom.fields.BoxVolume.prototype.invalidate = function ()
{
    this.valid = false;
    this.min = new x3dom.fields.SFVec3f( 0, 0, 0 );
    this.max = new x3dom.fields.SFVec3f( 0, 0, 0 );
    this.updateInternals();
};

/**
 * Box Volume Is Valid?
 *
 * @returns {Boolean} ``true'' if this box volume is valid,
 *                    ``false'' otherwise
 */
x3dom.fields.BoxVolume.prototype.isValid = function ()
{
    return this.valid;
};

/**
 * Box Volume Get Center
 *
 * @returns {*}
 */
x3dom.fields.BoxVolume.prototype.getCenter = function ()
{
    return this.center;
};

/**
 * Box Volume Get Diameter
 *
 * @returns {number|*}
 */
x3dom.fields.BoxVolume.prototype.getDiameter = function ()
{
    return this.diameter;
};

/**
 * Box Volume Transform
 *
 * @param m
 */
x3dom.fields.BoxVolume.prototype.transform = function ( m )
{
    var xmin,
        ymin,
        zmin,
        xmax,
        ymax,
        zmax;

    xmin = xmax = m._03;
    ymin = ymax = m._13;
    zmin = zmax = m._23;

    // calculate xmin and xmax of new transformed BBox
    var a = this.max.x * m._00;
    var b = this.min.x * m._00;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    a = this.max.y * m._01;
    b = this.min.y * m._01;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    a = this.max.z * m._02;
    b = this.min.z * m._02;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    // calculate ymin and ymax of new transformed BBox
    a = this.max.x * m._10;
    b = this.min.x * m._10;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    a = this.max.y * m._11;
    b = this.min.y * m._11;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    a = this.max.z * m._12;
    b = this.min.z * m._12;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    // calculate zmin and zmax of new transformed BBox
    a = this.max.x * m._20;
    b = this.min.x * m._20;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    a = this.max.y * m._21;
    b = this.min.y * m._21;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    a = this.max.z * m._22;
    b = this.min.z * m._22;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    this.min.x = xmin;
    this.min.y = ymin;
    this.min.z = zmin;

    this.max.x = xmax;
    this.max.y = ymax;
    this.max.z = zmax;

    this.updateInternals();
};

/**
 * Box Volume Transform Form
 *
 * @param m
 * @param other
 */
x3dom.fields.BoxVolume.prototype.transformFrom = function ( m, other )
{
    var xmin,
        ymin,
        zmin,
        xmax,
        ymax,
        zmax;

    xmin = xmax = m._03;
    ymin = ymax = m._13;
    zmin = zmax = m._23;

    // calculate xmin and xmax of new transformed BBox
    var a = other.max.x * m._00;
    var b = other.min.x * m._00;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    a = other.max.y * m._01;
    b = other.min.y * m._01;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    a = other.max.z * m._02;
    b = other.min.z * m._02;

    if ( a >= b )
    {
        xmax += a;
        xmin += b;
    }
    else
    {
        xmax += b;
        xmin += a;
    }

    // calculate ymin and ymax of new transformed BBox
    a = other.max.x * m._10;
    b = other.min.x * m._10;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    a = other.max.y * m._11;
    b = other.min.y * m._11;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    a = other.max.z * m._12;
    b = other.min.z * m._12;

    if ( a >= b )
    {
        ymax += a;
        ymin += b;
    }
    else
    {
        ymax += b;
        ymin += a;
    }

    // calculate zmin and zmax of new transformed BBox
    a = other.max.x * m._20;
    b = other.min.x * m._20;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    a = other.max.y * m._21;
    b = other.min.y * m._21;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    a = other.max.z * m._22;
    b = other.min.z * m._22;

    if ( a >= b )
    {
        zmax += a;
        zmin += b;
    }
    else
    {
        zmax += b;
        zmin += a;
    }

    this.min.x = xmin;
    this.min.y = ymin;
    this.min.z = zmin;

    this.max.x = xmax;
    this.max.y = ymax;
    this.max.z = zmax;

    this.updateInternals();
    this.valid = true;
};

/**
 * FrustumVolume constructor.
 *
 * A ``FrustumVolume'' represents the concept of a truncated pyramid
 * shape with particular emphasis on its use as a boundary in which
 * intersections might occur. The frustum constitutes a very significant
 * entity by its connotation with perspectives.
 *
 * @param {SFMatrix4f} clipMat - a matrix from which to set the
 *                               boundaries (clipping) of this frustum
 * @class Represents a frustum (as internal helper).
 */
x3dom.fields.FrustumVolume = function ( clipMat )
{
    this.planeNormals = [];
    this.planeDistances = [];
    this.directionIndex = [];

    if ( arguments.length === 0 )
    {
        return;
    }

    var planeEquation = [];

    for ( var i = 0; i < 6; i++ )
    {
        this.planeNormals[ i ] = new x3dom.fields.SFVec3f( 0, 0, 0 );
        this.planeDistances[ i ] = 0;
        this.directionIndex[ i ] = 0;

        planeEquation[ i ] = new x3dom.fields.SFVec4f( 0, 0, 0, 0 );
    }

    planeEquation[ 0 ].x = clipMat._30 - clipMat._00;
    planeEquation[ 0 ].y = clipMat._31 - clipMat._01;
    planeEquation[ 0 ].z = clipMat._32 - clipMat._02;
    planeEquation[ 0 ].w = clipMat._33 - clipMat._03;

    planeEquation[ 1 ].x = clipMat._30 + clipMat._00;
    planeEquation[ 1 ].y = clipMat._31 + clipMat._01;
    planeEquation[ 1 ].z = clipMat._32 + clipMat._02;
    planeEquation[ 1 ].w = clipMat._33 + clipMat._03;

    planeEquation[ 2 ].x = clipMat._30 + clipMat._10;
    planeEquation[ 2 ].y = clipMat._31 + clipMat._11;
    planeEquation[ 2 ].z = clipMat._32 + clipMat._12;
    planeEquation[ 2 ].w = clipMat._33 + clipMat._13;

    planeEquation[ 3 ].x = clipMat._30 - clipMat._10;
    planeEquation[ 3 ].y = clipMat._31 - clipMat._11;
    planeEquation[ 3 ].z = clipMat._32 - clipMat._12;
    planeEquation[ 3 ].w = clipMat._33 - clipMat._13;

    planeEquation[ 4 ].x = clipMat._30 + clipMat._20;
    planeEquation[ 4 ].y = clipMat._31 + clipMat._21;
    planeEquation[ 4 ].z = clipMat._32 + clipMat._22;
    planeEquation[ 4 ].w = clipMat._33 + clipMat._23;

    planeEquation[ 5 ].x = clipMat._30 - clipMat._20;
    planeEquation[ 5 ].y = clipMat._31 - clipMat._21;
    planeEquation[ 5 ].z = clipMat._32 - clipMat._22;
    planeEquation[ 5 ].w = clipMat._33 - clipMat._23;

    for ( i = 0; i < 6; i++ )
    {
        var vectorLength = Math.sqrt(
            planeEquation[ i ].x * planeEquation[ i ].x +
            planeEquation[ i ].y * planeEquation[ i ].y +
            planeEquation[ i ].z * planeEquation[ i ].z );

        planeEquation[ i ].x /= vectorLength;
        planeEquation[ i ].y /= vectorLength;
        planeEquation[ i ].z /= vectorLength;
        planeEquation[ i ].w /= -vectorLength;
    }

    var updateDirectionIndex = function ( normalVec )
    {
        var ind = 0;
        if ( normalVec.x > 0 ) {ind |= 1;}
        if ( normalVec.y > 0 ) {ind |= 2;}
        if ( normalVec.z > 0 ) {ind |= 4;}
        return ind;
    };

    // right
    this.planeNormals[ 3 ].setValues( planeEquation[ 0 ] );
    this.planeDistances[ 3 ] = planeEquation[ 0 ].w;
    this.directionIndex[ 3 ] = updateDirectionIndex( this.planeNormals[ 3 ] );

    // left
    this.planeNormals[ 2 ].setValues( planeEquation[ 1 ] );
    this.planeDistances[ 2 ] = planeEquation[ 1 ].w;
    this.directionIndex[ 2 ] = updateDirectionIndex( this.planeNormals[ 2 ] );

    // bottom
    this.planeNormals[ 5 ].setValues( planeEquation[ 2 ] );
    this.planeDistances[ 5 ] = planeEquation[ 2 ].w;
    this.directionIndex[ 5 ] = updateDirectionIndex( this.planeNormals[ 5 ] );

    // top
    this.planeNormals[ 4 ].setValues( planeEquation[ 3 ] );
    this.planeDistances[ 4 ] = planeEquation[ 3 ].w;
    this.directionIndex[ 4 ] = updateDirectionIndex( this.planeNormals[ 4 ] );

    // near
    this.planeNormals[ 0 ].setValues( planeEquation[ 4 ] );
    this.planeDistances[ 0 ] = planeEquation[ 4 ].w;
    this.directionIndex[ 0 ] = updateDirectionIndex( this.planeNormals[ 0 ] );

    // far
    this.planeNormals[ 1 ].setValues( planeEquation[ 5 ] );
    this.planeDistances[ 1 ] = planeEquation[ 5 ].w;
    this.directionIndex[ 1 ] = updateDirectionIndex( this.planeNormals[ 1 ] );
};

/**
 * Check the volume against the frustum.
 * Return values > 0 indicate a plane mask that was used to identify
 * the object as "inside".
 * Return value -1 means the object has been culled (i.e., is outside
 * with respect to at least one plane).
 * Return value 0 is a rare case, indicating that the object intersects
 * with all planes of the frustum.
 *
 * @param vol
 * @param planeMask
 */
x3dom.fields.FrustumVolume.prototype.intersect = function ( vol, planeMask )
{
    if ( this.planeNormals.length < 6 )
    {
        x3dom.debug.logWarning( "FrustumVolume not initialized!" );
        return false;
    }

    var that = this;
    var min = vol.min;
    var max = vol.max;

    var setDirectionIndexPoint = function ( index )
    {
        var pnt = new x3dom.fields.SFVec3f( 0, 0, 0 );
        if ( index & 1 ) { pnt.x = min.x; }
        else           { pnt.x = max.x; }
        if ( index & 2 ) { pnt.y = min.y; }
        else           { pnt.y = max.y; }
        if ( index & 4 ) { pnt.z = min.z; }
        else           { pnt.z = max.z; }
        return pnt;
    };

    // Check if the point is in the halfspace
    var pntIsInHalfSpace = function ( i, pnt )
    {
        var s = that.planeNormals[ i ].dot( pnt ) - that.planeDistances[ i ];
        return ( s >= 0 );
    };

    // Check if the box formed by min/max is fully inside the halfspace
    var isInHalfSpace = function ( i )
    {
        var p = setDirectionIndexPoint( that.directionIndex[ i ] );
        return pntIsInHalfSpace( i, p );
    };

    // Check if the box formed by min/max is fully outside the halfspace
    var isOutHalfSpace = function ( i )
    {
        var p = setDirectionIndexPoint( that.directionIndex[ i ] ^ 7 );
        return !pntIsInHalfSpace( i, p );
    };

    // Check each point of the box to the 6 planes
    var mask = 1;
    if ( planeMask < 0 ) {planeMask = 0;}

    for ( var i = 0; i < 6; i++, mask <<= 1 )
    {
        if ( ( planeMask & mask ) != 0 )
        {continue;}

        if ( isOutHalfSpace( i ) )
        {return -1;}

        if ( isInHalfSpace( i ) )
        {planeMask |= mask;}
    }

    return planeMask;
};
