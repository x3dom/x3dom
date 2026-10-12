(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
        else if (typeof exports === 'object') exports['loaders'] = factory();
  else root['loaders'] = factory();})(globalThis, function () {
"use strict";
var __exports__ = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // external-global-plugin:@loaders.gl/core
  var require_core = __commonJS({
    "external-global-plugin:@loaders.gl/core"(exports, module) {
      module.exports = globalThis.loaders;
    }
  });

  // bundle.ts
  var bundle_exports = {};
  __export(bundle_exports, {
    LOD_METRIC_TYPE: () => LOD_METRIC_TYPE,
    TILESET_TYPE: () => TILESET_TYPE,
    TILE_CONTENT_STATE: () => TILE_CONTENT_STATE,
    TILE_REFINEMENT: () => TILE_REFINEMENT,
    TILE_TYPE: () => TILE_TYPE,
    Tile3D: () => Tile3D,
    Tileset3D: () => Tileset3D,
    TilesetCache: () => TilesetCache,
    TilesetTraverser: () => TilesetTraverser,
    calculateTransformProps: () => calculateTransformProps,
    createBoundingVolume: () => createBoundingVolume,
    getFrameState: () => getFrameState,
    getLodStatus: () => getLodStatus
  });
  __reExport(bundle_exports, __toESM(require_core(), 1));

  // ../../node_modules/@math.gl/core/dist/lib/common.js
  var RADIANS_TO_DEGREES = 1 / Math.PI * 180;
  var DEGREES_TO_RADIANS = 1 / 180 * Math.PI;
  var DEFAULT_CONFIG = {
    EPSILON: 1e-12,
    debug: false,
    precision: 4,
    printTypes: false,
    printDegrees: false,
    printRowMajor: true,
    _cartographicRadians: false
  };
  globalThis.mathgl = globalThis.mathgl || { config: { ...DEFAULT_CONFIG } };
  var config = globalThis.mathgl.config;
  function formatValue(value, { precision = config.precision } = {}) {
    value = round(value);
    return `${parseFloat(value.toPrecision(precision))}`;
  }
  function isArray(value) {
    return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
  }
  function toRadians(degrees2) {
    return radians(degrees2);
  }
  function toDegrees(radians2) {
    return degrees(radians2);
  }
  function radians(degrees2, result) {
    return map(degrees2, (degrees3) => degrees3 * DEGREES_TO_RADIANS, result);
  }
  function degrees(radians2, result) {
    return map(radians2, (radians3) => radians3 * RADIANS_TO_DEGREES, result);
  }
  function equals(a, b, epsilon) {
    const oldEpsilon = config.EPSILON;
    if (epsilon) {
      config.EPSILON = epsilon;
    }
    try {
      if (a === b) {
        return true;
      }
      if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }
        for (let i = 0; i < a.length; ++i) {
          if (!equals(a[i], b[i])) {
            return false;
          }
        }
        return true;
      }
      if (a && a.equals) {
        return a.equals(b);
      }
      if (b && b.equals) {
        return b.equals(a);
      }
      if (typeof a === "number" && typeof b === "number") {
        return Math.abs(a - b) <= config.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
      }
      return false;
    } finally {
      config.EPSILON = oldEpsilon;
    }
  }
  function round(value) {
    return Math.round(value / config.EPSILON) * config.EPSILON;
  }
  function duplicateArray(array) {
    return array.clone ? array.clone() : new Array(array.length);
  }
  function map(value, func, result) {
    if (isArray(value)) {
      const array = value;
      result = result || duplicateArray(array);
      for (let i = 0; i < result.length && i < array.length; ++i) {
        const val = typeof value === "number" ? value : value[i];
        result[i] = func(val, i, result);
      }
      return result;
    }
    return func(value);
  }

  // ../../node_modules/@math.gl/core/dist/classes/base/math-array.js
  var MathArray = class extends Array {
    // Common methods
    /**
     * Clone the current object
     * @returns a new copy of this object
     */
    clone() {
      return new this.constructor().copy(this);
    }
    fromArray(array, offset = 0) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = array[i + offset];
      }
      return this.check();
    }
    toArray(targetArray = [], offset = 0) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        targetArray[offset + i] = this[i];
      }
      return targetArray;
    }
    toObject(targetObject) {
      return targetObject;
    }
    from(arrayOrObject) {
      return Array.isArray(arrayOrObject) ? this.copy(arrayOrObject) : (
        // @ts-ignore
        this.fromObject(arrayOrObject)
      );
    }
    to(arrayOrObject) {
      if (arrayOrObject === this) {
        return this;
      }
      return isArray(arrayOrObject) ? this.toArray(arrayOrObject) : this.toObject(arrayOrObject);
    }
    toTarget(target) {
      return target ? this.to(target) : this;
    }
    /** @deprecated */
    toFloat32Array() {
      return new Float32Array(this);
    }
    toString() {
      return this.formatString(config);
    }
    /** Formats string according to options */
    formatString(opts) {
      let string = "";
      for (let i = 0; i < this.ELEMENTS; ++i) {
        string += (i > 0 ? ", " : "") + formatValue(this[i], opts);
      }
      return `${opts.printTypes ? this.constructor.name : ""}[${string}]`;
    }
    equals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }
      for (let i = 0; i < this.ELEMENTS; ++i) {
        if (!equals(this[i], array[i])) {
          return false;
        }
      }
      return true;
    }
    exactEquals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }
      for (let i = 0; i < this.ELEMENTS; ++i) {
        if (this[i] !== array[i]) {
          return false;
        }
      }
      return true;
    }
    // Modifiers
    /** Negates all values in this object */
    negate() {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = -this[i];
      }
      return this.check();
    }
    lerp(a, b, t) {
      if (t === void 0) {
        return this.lerp(this, a, b);
      }
      for (let i = 0; i < this.ELEMENTS; ++i) {
        const ai = a[i];
        const endValue = typeof b === "number" ? b : b[i];
        this[i] = ai + t * (endValue - ai);
      }
      return this.check();
    }
    /** Minimal */
    min(vector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(vector[i], this[i]);
      }
      return this.check();
    }
    /** Maximal */
    max(vector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.max(vector[i], this[i]);
      }
      return this.check();
    }
    clamp(minVector, maxVector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], minVector[i]), maxVector[i]);
      }
      return this.check();
    }
    add(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] += vector[i];
        }
      }
      return this.check();
    }
    subtract(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] -= vector[i];
        }
      }
      return this.check();
    }
    scale(scale6) {
      if (typeof scale6 === "number") {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] *= scale6;
        }
      } else {
        for (let i = 0; i < this.ELEMENTS && i < scale6.length; ++i) {
          this[i] *= scale6[i];
        }
      }
      return this.check();
    }
    /**
     * Multiplies all elements by `scale`
     * Note: `Matrix4.multiplyByScalar` only scales its 3x3 "minor"
     */
    multiplyByScalar(scalar) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scalar;
      }
      return this.check();
    }
    // Debug checks
    /** Throws an error if array length is incorrect or contains illegal values */
    check() {
      if (config.debug && !this.validate()) {
        throw new Error(`math.gl: ${this.constructor.name} some fields set to invalid numbers'`);
      }
      return this;
    }
    /** Returns false if the array length is incorrect or contains illegal values */
    validate() {
      let valid = this.length === this.ELEMENTS;
      for (let i = 0; i < this.ELEMENTS; ++i) {
        valid = valid && Number.isFinite(this[i]);
      }
      return valid;
    }
    // three.js compatibility
    /** @deprecated */
    sub(a) {
      return this.subtract(a);
    }
    /** @deprecated */
    setScalar(a) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = a;
      }
      return this.check();
    }
    /** @deprecated */
    addScalar(a) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] += a;
      }
      return this.check();
    }
    /** @deprecated */
    subScalar(a) {
      return this.addScalar(-a);
    }
    /** @deprecated */
    multiplyScalar(scalar) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scalar;
      }
      return this.check();
    }
    /** @deprecated */
    divideScalar(a) {
      return this.multiplyByScalar(1 / a);
    }
    /** @deprecated */
    clampScalar(min2, max2) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], min2), max2);
      }
      return this.check();
    }
    /** @deprecated */
    get elements() {
      return this;
    }
  };

  // ../../node_modules/@math.gl/core/dist/lib/validators.js
  function validateVector(v, length4) {
    if (v.length !== length4) {
      return false;
    }
    for (let i = 0; i < v.length; ++i) {
      if (!Number.isFinite(v[i])) {
        return false;
      }
    }
    return true;
  }
  function checkNumber(value) {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid number ${JSON.stringify(value)}`);
    }
    return value;
  }
  function checkVector(v, length4, callerName = "") {
    if (config.debug && !validateVector(v, length4)) {
      throw new Error(`math.gl: ${callerName} some fields set to invalid numbers'`);
    }
    return v;
  }

  // ../../node_modules/@math.gl/core/dist/lib/assert.js
  function assert(condition, message) {
    if (!condition) {
      throw new Error(`math.gl assertion ${message}`);
    }
  }

  // ../../node_modules/@math.gl/core/dist/classes/base/vector.js
  var Vector = class extends MathArray {
    // ACCESSORS
    get x() {
      return this[0];
    }
    set x(value) {
      this[0] = checkNumber(value);
    }
    get y() {
      return this[1];
    }
    set y(value) {
      this[1] = checkNumber(value);
    }
    /**
     * Returns the length of the vector from the origin to the point described by this vector
     *
     * @note `length` is a reserved word for Arrays, so `v.length()` will return number of elements
     * Instead we provide `len` and `magnitude`
     */
    len() {
      return Math.sqrt(this.lengthSquared());
    }
    /**
     * Returns the length of the vector from the origin to the point described by this vector
     */
    magnitude() {
      return this.len();
    }
    /**
     * Returns the squared length of the vector from the origin to the point described by this vector
     */
    lengthSquared() {
      let length4 = 0;
      for (let i = 0; i < this.ELEMENTS; ++i) {
        length4 += this[i] * this[i];
      }
      return length4;
    }
    /**
     * Returns the squared length of the vector from the origin to the point described by this vector
     */
    magnitudeSquared() {
      return this.lengthSquared();
    }
    distance(mathArray) {
      return Math.sqrt(this.distanceSquared(mathArray));
    }
    distanceSquared(mathArray) {
      let length4 = 0;
      for (let i = 0; i < this.ELEMENTS; ++i) {
        const dist2 = this[i] - mathArray[i];
        length4 += dist2 * dist2;
      }
      return checkNumber(length4);
    }
    dot(mathArray) {
      let product = 0;
      for (let i = 0; i < this.ELEMENTS; ++i) {
        product += this[i] * mathArray[i];
      }
      return checkNumber(product);
    }
    // MODIFIERS
    normalize() {
      const length4 = this.magnitude();
      if (length4 !== 0) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= length4;
        }
      }
      return this.check();
    }
    multiply(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] *= vector[i];
        }
      }
      return this.check();
    }
    divide(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= vector[i];
        }
      }
      return this.check();
    }
    // THREE.js compatibility
    lengthSq() {
      return this.lengthSquared();
    }
    distanceTo(vector) {
      return this.distance(vector);
    }
    distanceToSquared(vector) {
      return this.distanceSquared(vector);
    }
    getComponent(i) {
      assert(i >= 0 && i < this.ELEMENTS, "index is out of range");
      return checkNumber(this[i]);
    }
    setComponent(i, value) {
      assert(i >= 0 && i < this.ELEMENTS, "index is out of range");
      this[i] = value;
      return this.check();
    }
    addVectors(a, b) {
      return this.copy(a).add(b);
    }
    subVectors(a, b) {
      return this.copy(a).subtract(b);
    }
    multiplyVectors(a, b) {
      return this.copy(a).multiply(b);
    }
    addScaledVector(a, b) {
      return this.add(new this.constructor(a).multiplyScalar(b));
    }
  };

  // ../../node_modules/@math.gl/core/dist/gl-matrix/common.js
  var EPSILON = 1e-6;
  var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
  var RANDOM = Math.random;
  function round2(a) {
    if (a >= 0)
      return Math.round(a);
    return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
  }
  var degree = Math.PI / 180;

  // ../../node_modules/@math.gl/core/dist/gl-matrix/vec2.js
  function create() {
    const out = new ARRAY_TYPE(2);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
    }
    return out;
  }
  function transformMat3(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
  }
  function transformMat4(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
  }
  var forEach = function() {
    const vec = create();
    return function(a, stride, offset, count, fn, arg) {
      let i;
      let l;
      if (!stride) {
        stride = 2;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
      }
      return a;
    };
  }();

  // ../../node_modules/@math.gl/core/dist/lib/gl-matrix-extras.js
  function vec2_transformMat4AsVector(out, a, m) {
    const x = a[0];
    const y = a[1];
    const w = m[3] * x + m[7] * y || 1;
    out[0] = (m[0] * x + m[4] * y) / w;
    out[1] = (m[1] * x + m[5] * y) / w;
    return out;
  }
  function vec3_transformMat4AsVector(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = m[3] * x + m[7] * y + m[11] * z || 1;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
  }
  function vec3_transformMat2(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    out[2] = a[2];
    return out;
  }
  function vec4_transformMat2(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
  function vec4_transformMat3(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    out[0] = m[0] * x + m[3] * y + m[6] * z;
    out[1] = m[1] * x + m[4] * y + m[7] * z;
    out[2] = m[2] * x + m[5] * y + m[8] * z;
    out[3] = a[3];
    return out;
  }

  // ../../node_modules/@math.gl/core/dist/gl-matrix/vec3.js
  var vec3_exports = {};
  __export(vec3_exports, {
    add: () => add,
    angle: () => angle,
    bezier: () => bezier,
    ceil: () => ceil,
    clone: () => clone,
    copy: () => copy,
    create: () => create2,
    cross: () => cross,
    dist: () => dist,
    distance: () => distance,
    div: () => div,
    divide: () => divide,
    dot: () => dot,
    equals: () => equals2,
    exactEquals: () => exactEquals,
    floor: () => floor,
    forEach: () => forEach2,
    fromValues: () => fromValues,
    hermite: () => hermite,
    inverse: () => inverse,
    len: () => len,
    length: () => length,
    lerp: () => lerp,
    max: () => max,
    min: () => min,
    mul: () => mul,
    multiply: () => multiply,
    negate: () => negate,
    normalize: () => normalize,
    random: () => random,
    rotateX: () => rotateX,
    rotateY: () => rotateY,
    rotateZ: () => rotateZ,
    round: () => round3,
    scale: () => scale,
    scaleAndAdd: () => scaleAndAdd,
    set: () => set,
    slerp: () => slerp,
    sqrDist: () => sqrDist,
    sqrLen: () => sqrLen,
    squaredDistance: () => squaredDistance,
    squaredLength: () => squaredLength,
    str: () => str,
    sub: () => sub,
    subtract: () => subtract,
    transformMat3: () => transformMat32,
    transformMat4: () => transformMat42,
    transformQuat: () => transformQuat,
    zero: () => zero
  });
  function create2() {
    const out = new ARRAY_TYPE(3);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    return out;
  }
  function clone(a) {
    const out = new ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function length(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  function fromValues(x, y, z) {
    const out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
  }
  function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
  }
  function ceil(out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
  }
  function floor(out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    return out;
  }
  function min(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
  }
  function max(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
  }
  function round3(out, a) {
    out[0] = round2(a[0]);
    out[1] = round2(a[1]);
    out[2] = round2(a[2]);
    return out;
  }
  function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
  }
  function scaleAndAdd(out, a, b, scale6) {
    out[0] = a[0] + b[0] * scale6;
    out[1] = a[1] + b[1] * scale6;
    out[2] = a[2] + b[2] * scale6;
    return out;
  }
  function distance(a, b) {
    const x = b[0] - a[0];
    const y = b[1] - a[1];
    const z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }
  function squaredDistance(a, b) {
    const x = b[0] - a[0];
    const y = b[1] - a[1];
    const z = b[2] - a[2];
    return x * x + y * y + z * z;
  }
  function squaredLength(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    return x * x + y * y + z * z;
  }
  function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
  }
  function inverse(out, a) {
    out[0] = 1 / a[0];
    out[1] = 1 / a[1];
    out[2] = 1 / a[2];
    return out;
  }
  function normalize(out, a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    let len2 = x * x + y * y + z * z;
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2);
    }
    out[0] = a[0] * len2;
    out[1] = a[1] * len2;
    out[2] = a[2] * len2;
    return out;
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cross(out, a, b) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const bx = b[0];
    const by = b[1];
    const bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }
  function lerp(out, a, b, t) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
  }
  function slerp(out, a, b, t) {
    const angle2 = Math.acos(Math.min(Math.max(dot(a, b), -1), 1));
    const sinTotal = Math.sin(angle2);
    const ratioA = Math.sin((1 - t) * angle2) / sinTotal;
    const ratioB = Math.sin(t * angle2) / sinTotal;
    out[0] = ratioA * a[0] + ratioB * b[0];
    out[1] = ratioA * a[1] + ratioB * b[1];
    out[2] = ratioA * a[2] + ratioB * b[2];
    return out;
  }
  function hermite(out, a, b, c, d, t) {
    const factorTimes2 = t * t;
    const factor1 = factorTimes2 * (2 * t - 3) + 1;
    const factor2 = factorTimes2 * (t - 2) + t;
    const factor3 = factorTimes2 * (t - 1);
    const factor4 = factorTimes2 * (3 - 2 * t);
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
  }
  function bezier(out, a, b, c, d, t) {
    const inverseFactor = 1 - t;
    const inverseFactorTimesTwo = inverseFactor * inverseFactor;
    const factorTimes2 = t * t;
    const factor1 = inverseFactorTimesTwo * inverseFactor;
    const factor2 = 3 * t * inverseFactorTimesTwo;
    const factor3 = 3 * factorTimes2 * inverseFactor;
    const factor4 = factorTimes2 * t;
    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
    return out;
  }
  function random(out, scale6) {
    scale6 = scale6 === void 0 ? 1 : scale6;
    const r = RANDOM() * 2 * Math.PI;
    const z = RANDOM() * 2 - 1;
    const zScale = Math.sqrt(1 - z * z) * scale6;
    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale6;
    return out;
  }
  function transformMat42(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }
  function transformMat32(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
  }
  function transformQuat(out, a, q) {
    const qx = q[0];
    const qy = q[1];
    const qz = q[2];
    const qw = q[3];
    const x = a[0];
    const y = a[1];
    const z = a[2];
    let uvx = qy * z - qz * y;
    let uvy = qz * x - qx * z;
    let uvz = qx * y - qy * x;
    let uuvx = qy * uvz - qz * uvy;
    let uuvy = qz * uvx - qx * uvz;
    let uuvz = qx * uvy - qy * uvx;
    const w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;
    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;
    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
  }
  function rotateX(out, a, b, rad) {
    const p = [];
    const r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[0];
    r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
    r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function rotateY(out, a, b, rad) {
    const p = [];
    const r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function rotateZ(out, a, b, rad) {
    const p = [];
    const r = [];
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
    r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
    r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
    r[2] = p[2];
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  function angle(a, b) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const bx = b[0];
    const by = b[1];
    const bz = b[2];
    const mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz));
    const cosine = mag && dot(a, b) / mag;
    return Math.acos(Math.min(Math.max(cosine, -1), 1));
  }
  function zero(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  function str(a) {
    return `vec3(${a[0]}, ${a[1]}, ${a[2]})`;
  }
  function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  }
  function equals2(a, b) {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
  }
  var sub = subtract;
  var mul = multiply;
  var div = divide;
  var dist = distance;
  var sqrDist = squaredDistance;
  var len = length;
  var sqrLen = squaredLength;
  var forEach2 = function() {
    const vec = create2();
    return function(a, stride, offset, count, fn, arg) {
      let i;
      let l;
      if (!stride) {
        stride = 3;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }
      return a;
    };
  }();

  // ../../node_modules/@math.gl/core/dist/classes/vector3.js
  var ORIGIN = [0, 0, 0];
  var ZERO;
  var Vector3 = class extends Vector {
    static get ZERO() {
      if (!ZERO) {
        ZERO = new Vector3(0, 0, 0);
        Object.freeze(ZERO);
      }
      return ZERO;
    }
    /**
     * @class
     * @param x
     * @param y
     * @param z
     */
    constructor(x = 0, y = 0, z = 0) {
      super(-0, -0, -0);
      if (arguments.length === 1 && isArray(x)) {
        this.copy(x);
      } else {
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
          checkNumber(z);
        }
        this[0] = x;
        this[1] = y;
        this[2] = z;
      }
    }
    set(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this.check();
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      return this.check();
    }
    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
      }
      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      return this.check();
    }
    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      return object;
    }
    // Getters/setters
    get ELEMENTS() {
      return 3;
    }
    get z() {
      return this[2];
    }
    set z(value) {
      this[2] = checkNumber(value);
    }
    // ACCESSORS
    angle(vector) {
      return angle(this, vector);
    }
    // MODIFIERS
    cross(vector) {
      cross(this, this, vector);
      return this.check();
    }
    rotateX({ radians: radians2, origin = ORIGIN }) {
      rotateX(this, this, origin, radians2);
      return this.check();
    }
    rotateY({ radians: radians2, origin = ORIGIN }) {
      rotateY(this, this, origin, radians2);
      return this.check();
    }
    rotateZ({ radians: radians2, origin = ORIGIN }) {
      rotateZ(this, this, origin, radians2);
      return this.check();
    }
    // Transforms
    // transforms as point (4th component is implicitly 1)
    transform(matrix4) {
      return this.transformAsPoint(matrix4);
    }
    // transforms as point (4th component is implicitly 1)
    transformAsPoint(matrix4) {
      transformMat42(this, this, matrix4);
      return this.check();
    }
    // transforms as vector  (4th component is implicitly 0, ignores translation. slightly faster)
    transformAsVector(matrix4) {
      vec3_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }
    transformByMatrix3(matrix3) {
      transformMat32(this, this, matrix3);
      return this.check();
    }
    transformByMatrix2(matrix2) {
      vec3_transformMat2(this, this, matrix2);
      return this.check();
    }
    transformByQuaternion(quaternion) {
      transformQuat(this, this, quaternion);
      return this.check();
    }
  };

  // ../../node_modules/@math.gl/core/dist/classes/vector4.js
  var ZERO2;
  var Vector4 = class extends Vector {
    static get ZERO() {
      if (!ZERO2) {
        ZERO2 = new Vector4(0, 0, 0, 0);
        Object.freeze(ZERO2);
      }
      return ZERO2;
    }
    constructor(x = 0, y = 0, z = 0, w = 0) {
      super(-0, -0, -0, -0);
      if (isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
          checkNumber(z);
          checkNumber(w);
        }
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
      }
    }
    set(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this.check();
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      return this.check();
    }
    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
        checkNumber(object.w);
      }
      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      this[3] = object.w;
      return this;
    }
    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      object.w = this[3];
      return object;
    }
    // Getters/setters
    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */
    get ELEMENTS() {
      return 4;
    }
    get z() {
      return this[2];
    }
    set z(value) {
      this[2] = checkNumber(value);
    }
    get w() {
      return this[3];
    }
    set w(value) {
      this[3] = checkNumber(value);
    }
    transform(matrix4) {
      transformMat42(this, this, matrix4);
      return this.check();
    }
    transformByMatrix3(matrix3) {
      vec4_transformMat3(this, this, matrix3);
      return this.check();
    }
    transformByMatrix2(matrix2) {
      vec4_transformMat2(this, this, matrix2);
      return this.check();
    }
    transformByQuaternion(quaternion) {
      transformQuat(this, this, quaternion);
      return this.check();
    }
    // three.js compatibility
    applyMatrix4(m) {
      m.transform(this, this);
      return this;
    }
  };

  // ../../node_modules/@math.gl/core/dist/classes/base/matrix.js
  var Matrix = class extends MathArray {
    // fromObject(object) {
    //   const array = object.elements;
    //   return this.fromRowMajor(array);
    // }
    // toObject(object) {
    //   const array = object.elements;
    //   this.toRowMajor(array);
    //   return object;
    // }
    // TODO better override formatString?
    toString() {
      let string = "[";
      if (config.printRowMajor) {
        string += "row-major:";
        for (let row = 0; row < this.RANK; ++row) {
          for (let col = 0; col < this.RANK; ++col) {
            string += ` ${this[col * this.RANK + row]}`;
          }
        }
      } else {
        string += "column-major:";
        for (let i = 0; i < this.ELEMENTS; ++i) {
          string += ` ${this[i]}`;
        }
      }
      string += "]";
      return string;
    }
    getElementIndex(row, col) {
      return col * this.RANK + row;
    }
    // By default assumes row major indices
    getElement(row, col) {
      return this[col * this.RANK + row];
    }
    // By default assumes row major indices
    setElement(row, col, value) {
      this[col * this.RANK + row] = checkNumber(value);
      return this;
    }
    getColumn(columnIndex, result = new Array(this.RANK).fill(-0)) {
      const firstIndex = columnIndex * this.RANK;
      for (let i = 0; i < this.RANK; ++i) {
        result[i] = this[firstIndex + i];
      }
      return result;
    }
    setColumn(columnIndex, columnVector) {
      const firstIndex = columnIndex * this.RANK;
      for (let i = 0; i < this.RANK; ++i) {
        this[firstIndex + i] = columnVector[i];
      }
      return this;
    }
  };

  // ../../node_modules/@math.gl/core/dist/gl-matrix/mat3.js
  function create3() {
    const out = new ARRAY_TYPE(9);
    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
    }
    out[0] = 1;
    out[4] = 1;
    out[8] = 1;
    return out;
  }
  function transpose(out, a) {
    if (out === a) {
      const a01 = a[1];
      const a02 = a[2];
      const a12 = a[5];
      out[1] = a[3];
      out[2] = a[6];
      out[3] = a01;
      out[5] = a[7];
      out[6] = a02;
      out[7] = a12;
    } else {
      out[0] = a[0];
      out[1] = a[3];
      out[2] = a[6];
      out[3] = a[1];
      out[4] = a[4];
      out[5] = a[7];
      out[6] = a[2];
      out[7] = a[5];
      out[8] = a[8];
    }
    return out;
  }
  function invert(out, a) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;
    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
  }
  function determinant(a) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
  }
  function multiply2(out, a, b) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[4];
    const b12 = b[5];
    const b20 = b[6];
    const b21 = b[7];
    const b22 = b[8];
    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;
    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;
    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
  }
  function translate(out, a, v) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const x = v[0];
    const y = v[1];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a10;
    out[4] = a11;
    out[5] = a12;
    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
  }
  function rotate(out, a, rad) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;
    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;
    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
  }
  function scale2(out, a, v) {
    const x = v[0];
    const y = v[1];
    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];
    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
  }
  function fromQuat(out, q) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const yx = y * x2;
    const yy = y * y2;
    const zx = z * x2;
    const zy = z * y2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;
    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;
    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;
    return out;
  }

  // ../../node_modules/@math.gl/core/dist/classes/matrix3.js
  var INDICES;
  (function(INDICES3) {
    INDICES3[INDICES3["COL0ROW0"] = 0] = "COL0ROW0";
    INDICES3[INDICES3["COL0ROW1"] = 1] = "COL0ROW1";
    INDICES3[INDICES3["COL0ROW2"] = 2] = "COL0ROW2";
    INDICES3[INDICES3["COL1ROW0"] = 3] = "COL1ROW0";
    INDICES3[INDICES3["COL1ROW1"] = 4] = "COL1ROW1";
    INDICES3[INDICES3["COL1ROW2"] = 5] = "COL1ROW2";
    INDICES3[INDICES3["COL2ROW0"] = 6] = "COL2ROW0";
    INDICES3[INDICES3["COL2ROW1"] = 7] = "COL2ROW1";
    INDICES3[INDICES3["COL2ROW2"] = 8] = "COL2ROW2";
  })(INDICES || (INDICES = {}));
  var IDENTITY_MATRIX = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  var Matrix3 = class extends Matrix {
    static get IDENTITY() {
      return getIdentityMatrix();
    }
    static get ZERO() {
      return getZeroMatrix();
    }
    get ELEMENTS() {
      return 9;
    }
    get RANK() {
      return 3;
    }
    get INDICES() {
      return INDICES;
    }
    constructor(array, ...args) {
      super(-0, -0, -0, -0, -0, -0, -0, -0, -0);
      if (arguments.length === 1 && Array.isArray(array)) {
        this.copy(array);
      } else if (args.length > 0) {
        this.copy([array, ...args]);
      } else {
        this.identity();
      }
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      return this.check();
    }
    // Constructors
    identity() {
      return this.copy(IDENTITY_MATRIX);
    }
    /**
     *
     * @param object
     * @returns self
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromObject(object) {
      return this.check();
    }
    /** Calculates a 3x3 matrix from the given quaternion
     * q quat  Quaternion to create matrix from
     */
    fromQuaternion(q) {
      fromQuat(this, q);
      return this.check();
    }
    /**
     * accepts column major order, stores in column major order
     */
    // eslint-disable-next-line max-params
    set(m00, m10, m20, m01, m11, m21, m02, m12, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    }
    /**
     * accepts row major order, stores as column major
     */
    // eslint-disable-next-line max-params
    setRowMajor(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    }
    // Accessors
    determinant() {
      return determinant(this);
    }
    // Modifiers
    transpose() {
      transpose(this, this);
      return this.check();
    }
    /** Invert a matrix. Note that this can fail if the matrix is not invertible */
    invert() {
      invert(this, this);
      return this.check();
    }
    // Operations
    multiplyLeft(a) {
      multiply2(this, a, this);
      return this.check();
    }
    multiplyRight(a) {
      multiply2(this, this, a);
      return this.check();
    }
    rotate(radians2) {
      rotate(this, this, radians2);
      return this.check();
    }
    scale(factor) {
      if (Array.isArray(factor)) {
        scale2(this, this, factor);
      } else {
        scale2(this, this, [factor, factor]);
      }
      return this.check();
    }
    translate(vec) {
      translate(this, this, vec);
      return this.check();
    }
    // Transforms
    transform(vector, result) {
      let out;
      switch (vector.length) {
        case 2:
          out = transformMat3(result || [-0, -0], vector, this);
          break;
        case 3:
          out = transformMat32(result || [-0, -0, -0], vector, this);
          break;
        case 4:
          out = vec4_transformMat3(result || [-0, -0, -0, -0], vector, this);
          break;
        default:
          throw new Error("Illegal vector");
      }
      checkVector(out, vector.length);
      return out;
    }
    /** @deprecated */
    transformVector(vector, result) {
      return this.transform(vector, result);
    }
    /** @deprecated */
    transformVector2(vector, result) {
      return this.transform(vector, result);
    }
    /** @deprecated */
    transformVector3(vector, result) {
      return this.transform(vector, result);
    }
  };
  var ZERO_MATRIX3;
  var IDENTITY_MATRIX3 = null;
  function getZeroMatrix() {
    if (!ZERO_MATRIX3) {
      ZERO_MATRIX3 = new Matrix3([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      Object.freeze(ZERO_MATRIX3);
    }
    return ZERO_MATRIX3;
  }
  function getIdentityMatrix() {
    if (!IDENTITY_MATRIX3) {
      IDENTITY_MATRIX3 = new Matrix3();
      Object.freeze(IDENTITY_MATRIX3);
    }
    return IDENTITY_MATRIX3;
  }

  // ../../node_modules/@math.gl/core/dist/gl-matrix/mat4.js
  var mat4_exports = {};
  __export(mat4_exports, {
    add: () => add2,
    adjoint: () => adjoint,
    clone: () => clone2,
    copy: () => copy2,
    create: () => create4,
    decompose: () => decompose,
    determinant: () => determinant2,
    equals: () => equals3,
    exactEquals: () => exactEquals2,
    frob: () => frob,
    fromQuat: () => fromQuat3,
    fromQuat2: () => fromQuat2,
    fromRotation: () => fromRotation,
    fromRotationTranslation: () => fromRotationTranslation,
    fromRotationTranslationScale: () => fromRotationTranslationScale,
    fromRotationTranslationScaleOrigin: () => fromRotationTranslationScaleOrigin,
    fromScaling: () => fromScaling,
    fromTranslation: () => fromTranslation,
    fromValues: () => fromValues2,
    fromXRotation: () => fromXRotation,
    fromYRotation: () => fromYRotation,
    fromZRotation: () => fromZRotation,
    frustum: () => frustum,
    getRotation: () => getRotation,
    getScaling: () => getScaling,
    getTranslation: () => getTranslation,
    identity: () => identity,
    invert: () => invert2,
    lookAt: () => lookAt,
    mul: () => mul2,
    multiply: () => multiply3,
    multiplyScalar: () => multiplyScalar,
    multiplyScalarAndAdd: () => multiplyScalarAndAdd,
    ortho: () => ortho,
    orthoNO: () => orthoNO,
    orthoZO: () => orthoZO,
    perspective: () => perspective,
    perspectiveFromFieldOfView: () => perspectiveFromFieldOfView,
    perspectiveNO: () => perspectiveNO,
    perspectiveZO: () => perspectiveZO,
    rotate: () => rotate2,
    rotateX: () => rotateX2,
    rotateY: () => rotateY2,
    rotateZ: () => rotateZ2,
    scale: () => scale3,
    set: () => set2,
    str: () => str2,
    sub: () => sub2,
    subtract: () => subtract2,
    targetTo: () => targetTo,
    translate: () => translate2,
    transpose: () => transpose2
  });
  function create4() {
    const out = new ARRAY_TYPE(16);
    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  function clone2(a) {
    const out = new ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function copy2(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function fromValues2(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    const out = new ARRAY_TYPE(16);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
  }
  function set2(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m10;
    out[5] = m11;
    out[6] = m12;
    out[7] = m13;
    out[8] = m20;
    out[9] = m21;
    out[10] = m22;
    out[11] = m23;
    out[12] = m30;
    out[13] = m31;
    out[14] = m32;
    out[15] = m33;
    return out;
  }
  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function transpose2(out, a) {
    if (out === a) {
      const a01 = a[1];
      const a02 = a[2];
      const a03 = a[3];
      const a12 = a[6];
      const a13 = a[7];
      const a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }
    return out;
  }
  function invert2(out, a) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  function adjoint(out, a) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;
    out[0] = a11 * b11 - a12 * b10 + a13 * b09;
    out[1] = a02 * b10 - a01 * b11 - a03 * b09;
    out[2] = a31 * b05 - a32 * b04 + a33 * b03;
    out[3] = a22 * b04 - a21 * b05 - a23 * b03;
    out[4] = a12 * b08 - a10 * b11 - a13 * b07;
    out[5] = a00 * b11 - a02 * b08 + a03 * b07;
    out[6] = a32 * b02 - a30 * b05 - a33 * b01;
    out[7] = a20 * b05 - a22 * b02 + a23 * b01;
    out[8] = a10 * b10 - a11 * b08 + a13 * b06;
    out[9] = a01 * b08 - a00 * b10 - a03 * b06;
    out[10] = a30 * b04 - a31 * b02 + a33 * b00;
    out[11] = a21 * b02 - a20 * b04 - a23 * b00;
    out[12] = a11 * b07 - a10 * b09 - a12 * b06;
    out[13] = a00 * b09 - a01 * b07 + a02 * b06;
    out[14] = a31 * b01 - a30 * b03 - a32 * b00;
    out[15] = a20 * b03 - a21 * b01 + a22 * b00;
    return out;
  }
  function determinant2(a) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    const b0 = a00 * a11 - a01 * a10;
    const b1 = a00 * a12 - a02 * a10;
    const b2 = a01 * a12 - a02 * a11;
    const b3 = a20 * a31 - a21 * a30;
    const b4 = a20 * a32 - a22 * a30;
    const b5 = a21 * a32 - a22 * a31;
    const b6 = a00 * b5 - a01 * b4 + a02 * b3;
    const b7 = a10 * b5 - a11 * b4 + a12 * b3;
    const b8 = a20 * b2 - a21 * b1 + a22 * b0;
    const b9 = a30 * b2 - a31 * b1 + a32 * b0;
    return a13 * b6 - a03 * b7 + a33 * b8 - a23 * b9;
  }
  function multiply3(out, a, b) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];
    let b0 = b[0];
    let b1 = b[1];
    let b2 = b[2];
    let b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
  }
  function translate2(out, a, v) {
    const x = v[0];
    const y = v[1];
    const z = v[2];
    let a00;
    let a01;
    let a02;
    let a03;
    let a10;
    let a11;
    let a12;
    let a13;
    let a20;
    let a21;
    let a22;
    let a23;
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
  }
  function scale3(out, a, v) {
    const x = v[0];
    const y = v[1];
    const z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
  }
  function rotate2(out, a, rad, axis) {
    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    let len2 = Math.sqrt(x * x + y * y + z * z);
    let c;
    let s;
    let t;
    let a00;
    let a01;
    let a02;
    let a03;
    let a10;
    let a11;
    let a12;
    let a13;
    let a20;
    let a21;
    let a22;
    let a23;
    let b00;
    let b01;
    let b02;
    let b10;
    let b11;
    let b12;
    let b20;
    let b21;
    let b22;
    if (len2 < EPSILON) {
      return null;
    }
    len2 = 1 / len2;
    x *= len2;
    y *= len2;
    z *= len2;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) {
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  }
  function rotateX2(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    if (a !== out) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
  }
  function rotateY2(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    if (a !== out) {
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  }
  function rotateZ2(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    if (a !== out) {
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
  }
  function fromTranslation(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromScaling(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = v[1];
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = v[2];
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromRotation(out, rad, axis) {
    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    let len2 = Math.sqrt(x * x + y * y + z * z);
    let c;
    let s;
    let t;
    if (len2 < EPSILON) {
      return null;
    }
    len2 = 1 / len2;
    x *= len2;
    y *= len2;
    z *= len2;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromXRotation(out, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = c;
    out[6] = s;
    out[7] = 0;
    out[8] = 0;
    out[9] = -s;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromYRotation(out, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    out[0] = c;
    out[1] = 0;
    out[2] = -s;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromZRotation(out, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = 0;
    out[3] = 0;
    out[4] = -s;
    out[5] = c;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function fromRotationTranslation(out, q, v) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromQuat2(out, a) {
    const translation = new ARRAY_TYPE(3);
    const bx = -a[0];
    const by = -a[1];
    const bz = -a[2];
    const bw = a[3];
    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    const magnitude = bx * bx + by * by + bz * bz + bw * bw;
    if (magnitude > 0) {
      translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
      translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
      translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
    } else {
      translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
      translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
      translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
    }
    fromRotationTranslation(out, a, translation);
    return out;
  }
  function getTranslation(out, mat) {
    out[0] = mat[12];
    out[1] = mat[13];
    out[2] = mat[14];
    return out;
  }
  function getScaling(out, mat) {
    const m11 = mat[0];
    const m12 = mat[1];
    const m13 = mat[2];
    const m21 = mat[4];
    const m22 = mat[5];
    const m23 = mat[6];
    const m31 = mat[8];
    const m32 = mat[9];
    const m33 = mat[10];
    out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    return out;
  }
  function getRotation(out, mat) {
    const scaling = new ARRAY_TYPE(3);
    getScaling(scaling, mat);
    const is1 = 1 / scaling[0];
    const is2 = 1 / scaling[1];
    const is3 = 1 / scaling[2];
    const sm11 = mat[0] * is1;
    const sm12 = mat[1] * is2;
    const sm13 = mat[2] * is3;
    const sm21 = mat[4] * is1;
    const sm22 = mat[5] * is2;
    const sm23 = mat[6] * is3;
    const sm31 = mat[8] * is1;
    const sm32 = mat[9] * is2;
    const sm33 = mat[10] * is3;
    const trace = sm11 + sm22 + sm33;
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }
    return out;
  }
  function decompose(out_r, out_t, out_s, mat) {
    out_t[0] = mat[12];
    out_t[1] = mat[13];
    out_t[2] = mat[14];
    const m11 = mat[0];
    const m12 = mat[1];
    const m13 = mat[2];
    const m21 = mat[4];
    const m22 = mat[5];
    const m23 = mat[6];
    const m31 = mat[8];
    const m32 = mat[9];
    const m33 = mat[10];
    out_s[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
    out_s[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
    out_s[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);
    const is1 = 1 / out_s[0];
    const is2 = 1 / out_s[1];
    const is3 = 1 / out_s[2];
    const sm11 = m11 * is1;
    const sm12 = m12 * is2;
    const sm13 = m13 * is3;
    const sm21 = m21 * is1;
    const sm22 = m22 * is2;
    const sm23 = m23 * is3;
    const sm31 = m31 * is1;
    const sm32 = m32 * is2;
    const sm33 = m33 * is3;
    const trace = sm11 + sm22 + sm33;
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1) * 2;
      out_r[3] = 0.25 * S;
      out_r[0] = (sm23 - sm32) / S;
      out_r[1] = (sm31 - sm13) / S;
      out_r[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
      out_r[3] = (sm23 - sm32) / S;
      out_r[0] = 0.25 * S;
      out_r[1] = (sm12 + sm21) / S;
      out_r[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
      out_r[3] = (sm31 - sm13) / S;
      out_r[0] = (sm12 + sm21) / S;
      out_r[1] = 0.25 * S;
      out_r[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
      out_r[3] = (sm12 - sm21) / S;
      out_r[0] = (sm31 + sm13) / S;
      out_r[1] = (sm23 + sm32) / S;
      out_r[2] = 0.25 * S;
    }
    return out_r;
  }
  function fromRotationTranslationScale(out, q, v, s) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const sx = s[0];
    const sy = s[1];
    const sz = s[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
  }
  function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const sx = s[0];
    const sy = s[1];
    const sz = s[2];
    const ox = o[0];
    const oy = o[1];
    const oz = o[2];
    const out0 = (1 - (yy + zz)) * sx;
    const out1 = (xy + wz) * sx;
    const out2 = (xz - wy) * sx;
    const out4 = (xy - wz) * sy;
    const out5 = (1 - (xx + zz)) * sy;
    const out6 = (yz + wx) * sy;
    const out8 = (xz + wy) * sz;
    const out9 = (yz - wx) * sz;
    const out10 = (1 - (xx + yy)) * sz;
    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = 0;
    out[4] = out4;
    out[5] = out5;
    out[6] = out6;
    out[7] = 0;
    out[8] = out8;
    out[9] = out9;
    out[10] = out10;
    out[11] = 0;
    out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
    out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
    out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
    out[15] = 1;
    return out;
  }
  function fromQuat3(out, q) {
    const x = q[0];
    const y = q[1];
    const z = q[2];
    const w = q[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const yx = y * x2;
    const yy = y * y2;
    const zx = z * x2;
    const zy = z * y2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;
    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;
    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  function frustum(out, left, right, bottom, top, near, far) {
    const rl = 1 / (right - left);
    const tb = 1 / (top - bottom);
    const nf = 1 / (near - far);
    out[0] = near * 2 * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = near * 2 * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near * 2 * nf;
    out[15] = 0;
    return out;
  }
  function perspectiveNO(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      const nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }
    return out;
  }
  var perspective = perspectiveNO;
  function perspectiveZO(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
      const nf = 1 / (near - far);
      out[10] = far * nf;
      out[14] = far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -near;
    }
    return out;
  }
  function perspectiveFromFieldOfView(out, fov, near, far) {
    const upTan = Math.tan(fov.upDegrees * Math.PI / 180);
    const downTan = Math.tan(fov.downDegrees * Math.PI / 180);
    const leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
    const rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
    const xScale = 2 / (leftTan + rightTan);
    const yScale = 2 / (upTan + downTan);
    out[0] = xScale;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = yScale;
    out[6] = 0;
    out[7] = 0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = (upTan - downTan) * yScale * 0.5;
    out[10] = far / (near - far);
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = far * near / (near - far);
    out[15] = 0;
    return out;
  }
  function orthoNO(out, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }
  var ortho = orthoNO;
  function orthoZO(out, left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = near * nf;
    out[15] = 1;
    return out;
  }
  function lookAt(out, eye, center, up) {
    let len2;
    let x0;
    let x1;
    let x2;
    let y0;
    let y1;
    let y2;
    let z0;
    let z1;
    let z2;
    const eyex = eye[0];
    const eyey = eye[1];
    const eyez = eye[2];
    const upx = up[0];
    const upy = up[1];
    const upz = up[2];
    const centerx = center[0];
    const centery = center[1];
    const centerz = center[2];
    if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
      return identity(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len2 = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len2;
    z1 *= len2;
    z2 *= len2;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len2 = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len2) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len2 = 1 / len2;
      x0 *= len2;
      x1 *= len2;
      x2 *= len2;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len2 = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len2) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len2 = 1 / len2;
      y0 *= len2;
      y1 *= len2;
      y2 *= len2;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  }
  function targetTo(out, eye, target, up) {
    const eyex = eye[0];
    const eyey = eye[1];
    const eyez = eye[2];
    const upx = up[0];
    const upy = up[1];
    const upz = up[2];
    let z0 = eyex - target[0];
    let z1 = eyey - target[1];
    let z2 = eyez - target[2];
    let len2 = z0 * z0 + z1 * z1 + z2 * z2;
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2);
      z0 *= len2;
      z1 *= len2;
      z2 *= len2;
    }
    let x0 = upy * z2 - upz * z1;
    let x1 = upz * z0 - upx * z2;
    let x2 = upx * z1 - upy * z0;
    len2 = x0 * x0 + x1 * x1 + x2 * x2;
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2);
      x0 *= len2;
      x1 *= len2;
      x2 *= len2;
    }
    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
  }
  function str2(a) {
    return `mat4(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]}, ${a[8]}, ${a[9]}, ${a[10]}, ${a[11]}, ${a[12]}, ${a[13]}, ${a[14]}, ${a[15]})`;
  }
  function frob(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3] + a[4] * a[4] + a[5] * a[5] + a[6] * a[6] + a[7] * a[7] + a[8] * a[8] + a[9] * a[9] + a[10] * a[10] + a[11] * a[11] + a[12] * a[12] + a[13] * a[13] + a[14] * a[14] + a[15] * a[15]);
  }
  function add2(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    out[9] = a[9] + b[9];
    out[10] = a[10] + b[10];
    out[11] = a[11] + b[11];
    out[12] = a[12] + b[12];
    out[13] = a[13] + b[13];
    out[14] = a[14] + b[14];
    out[15] = a[15] + b[15];
    return out;
  }
  function subtract2(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    out[9] = a[9] - b[9];
    out[10] = a[10] - b[10];
    out[11] = a[11] - b[11];
    out[12] = a[12] - b[12];
    out[13] = a[13] - b[13];
    out[14] = a[14] - b[14];
    out[15] = a[15] - b[15];
    return out;
  }
  function multiplyScalar(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    out[9] = a[9] * b;
    out[10] = a[10] * b;
    out[11] = a[11] * b;
    out[12] = a[12] * b;
    out[13] = a[13] * b;
    out[14] = a[14] * b;
    out[15] = a[15] * b;
    return out;
  }
  function multiplyScalarAndAdd(out, a, b, scale6) {
    out[0] = a[0] + b[0] * scale6;
    out[1] = a[1] + b[1] * scale6;
    out[2] = a[2] + b[2] * scale6;
    out[3] = a[3] + b[3] * scale6;
    out[4] = a[4] + b[4] * scale6;
    out[5] = a[5] + b[5] * scale6;
    out[6] = a[6] + b[6] * scale6;
    out[7] = a[7] + b[7] * scale6;
    out[8] = a[8] + b[8] * scale6;
    out[9] = a[9] + b[9] * scale6;
    out[10] = a[10] + b[10] * scale6;
    out[11] = a[11] + b[11] * scale6;
    out[12] = a[12] + b[12] * scale6;
    out[13] = a[13] + b[13] * scale6;
    out[14] = a[14] + b[14] * scale6;
    out[15] = a[15] + b[15] * scale6;
    return out;
  }
  function exactEquals2(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
  }
  function equals3(a, b) {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const a3 = a[3];
    const a4 = a[4];
    const a5 = a[5];
    const a6 = a[6];
    const a7 = a[7];
    const a8 = a[8];
    const a9 = a[9];
    const a10 = a[10];
    const a11 = a[11];
    const a12 = a[12];
    const a13 = a[13];
    const a14 = a[14];
    const a15 = a[15];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    const b3 = b[3];
    const b4 = b[4];
    const b5 = b[5];
    const b6 = b[6];
    const b7 = b[7];
    const b8 = b[8];
    const b9 = b[9];
    const b10 = b[10];
    const b11 = b[11];
    const b12 = b[12];
    const b13 = b[13];
    const b14 = b[14];
    const b15 = b[15];
    return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
  }
  var mul2 = multiply3;
  var sub2 = subtract2;

  // ../../node_modules/@math.gl/core/dist/gl-matrix/vec4.js
  function create5() {
    const out = new ARRAY_TYPE(4);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
    }
    return out;
  }
  function add3(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
  }
  function scale4(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
  }
  function length2(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = a[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }
  function squaredLength2(a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = a[3];
    return x * x + y * y + z * z + w * w;
  }
  function normalize2(out, a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = a[3];
    let len2 = x * x + y * y + z * z + w * w;
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2);
    }
    out[0] = x * len2;
    out[1] = y * len2;
    out[2] = z * len2;
    out[3] = w * len2;
    return out;
  }
  function dot2(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  function lerp2(out, a, b, t) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
  }
  function transformMat43(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
  }
  function transformQuat2(out, a, q) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const qx = q[0];
    const qy = q[1];
    const qz = q[2];
    const qw = q[3];
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out[3] = a[3];
    return out;
  }
  var forEach3 = function() {
    const vec = create5();
    return function(a, stride, offset, count, fn, arg) {
      let i;
      let l;
      if (!stride) {
        stride = 4;
      }
      if (!offset) {
        offset = 0;
      }
      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }
      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
        a[i + 3] = vec[3];
      }
      return a;
    };
  }();

  // ../../node_modules/@math.gl/core/dist/classes/matrix4.js
  var INDICES2;
  (function(INDICES3) {
    INDICES3[INDICES3["COL0ROW0"] = 0] = "COL0ROW0";
    INDICES3[INDICES3["COL0ROW1"] = 1] = "COL0ROW1";
    INDICES3[INDICES3["COL0ROW2"] = 2] = "COL0ROW2";
    INDICES3[INDICES3["COL0ROW3"] = 3] = "COL0ROW3";
    INDICES3[INDICES3["COL1ROW0"] = 4] = "COL1ROW0";
    INDICES3[INDICES3["COL1ROW1"] = 5] = "COL1ROW1";
    INDICES3[INDICES3["COL1ROW2"] = 6] = "COL1ROW2";
    INDICES3[INDICES3["COL1ROW3"] = 7] = "COL1ROW3";
    INDICES3[INDICES3["COL2ROW0"] = 8] = "COL2ROW0";
    INDICES3[INDICES3["COL2ROW1"] = 9] = "COL2ROW1";
    INDICES3[INDICES3["COL2ROW2"] = 10] = "COL2ROW2";
    INDICES3[INDICES3["COL2ROW3"] = 11] = "COL2ROW3";
    INDICES3[INDICES3["COL3ROW0"] = 12] = "COL3ROW0";
    INDICES3[INDICES3["COL3ROW1"] = 13] = "COL3ROW1";
    INDICES3[INDICES3["COL3ROW2"] = 14] = "COL3ROW2";
    INDICES3[INDICES3["COL3ROW3"] = 15] = "COL3ROW3";
  })(INDICES2 || (INDICES2 = {}));
  var DEFAULT_FOVY = 45 * Math.PI / 180;
  var DEFAULT_ASPECT = 1;
  var DEFAULT_NEAR = 0.1;
  var DEFAULT_FAR = 500;
  var IDENTITY_MATRIX2 = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var Matrix4 = class extends Matrix {
    static get IDENTITY() {
      return getIdentityMatrix2();
    }
    static get ZERO() {
      return getZeroMatrix2();
    }
    get ELEMENTS() {
      return 16;
    }
    get RANK() {
      return 4;
    }
    get INDICES() {
      return INDICES2;
    }
    constructor(array) {
      super(-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0);
      if (arguments.length === 1 && Array.isArray(array)) {
        this.copy(array);
      } else {
        this.identity();
      }
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      this[9] = array[9];
      this[10] = array[10];
      this[11] = array[11];
      this[12] = array[12];
      this[13] = array[13];
      this[14] = array[14];
      this[15] = array[15];
      return this.check();
    }
    // eslint-disable-next-line max-params
    set(m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
    // accepts row major order, stores as column major
    // eslint-disable-next-line max-params
    setRowMajor(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
    toRowMajor(result) {
      result[0] = this[0];
      result[1] = this[4];
      result[2] = this[8];
      result[3] = this[12];
      result[4] = this[1];
      result[5] = this[5];
      result[6] = this[9];
      result[7] = this[13];
      result[8] = this[2];
      result[9] = this[6];
      result[10] = this[10];
      result[11] = this[14];
      result[12] = this[3];
      result[13] = this[7];
      result[14] = this[11];
      result[15] = this[15];
      return result;
    }
    // Constructors
    /** Set to identity matrix */
    identity() {
      return this.copy(IDENTITY_MATRIX2);
    }
    /**
     *
     * @param object
     * @returns self
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromObject(object) {
      return this.check();
    }
    /**
     * Calculates a 4x4 matrix from the given quaternion
     * @param quaternion Quaternion to create matrix from
     * @returns self
     */
    fromQuaternion(quaternion) {
      fromQuat3(this, quaternion);
      return this.check();
    }
    /**
     * Generates a frustum matrix with the given bounds
     * @param view.left - Left bound of the frustum
     * @param view.right - Right bound of the frustum
     * @param view.bottom - Bottom bound of the frustum
     * @param view.top - Top bound of the frustum
     * @param view.near - Near bound of the frustum
     * @param view.far - Far bound of the frustum. Can be set to Infinity.
     * @returns self
     */
    frustum(view) {
      const { left, right, bottom, top, near = DEFAULT_NEAR, far = DEFAULT_FAR } = view;
      if (far === Infinity) {
        computeInfinitePerspectiveOffCenter(this, left, right, bottom, top, near);
      } else {
        frustum(this, left, right, bottom, top, near, far);
      }
      return this.check();
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point,
     * and up axis
     * @param view.eye - (vector) Position of the viewer
     * @param view.center - (vector) Point the viewer is looking at
     * @param view.up - (vector) Up axis
     * @returns self
     */
    lookAt(view) {
      const { eye, center = [0, 0, 0], up = [0, 1, 0] } = view;
      lookAt(this, eye, center, up);
      return this.check();
    }
    /**
     * Generates a orthogonal projection matrix with the given bounds
     * from "traditional" view space parameters
     * @param view.left - Left bound of the frustum
     * @param view.right number  Right bound of the frustum
     * @param view.bottom - Bottom bound of the frustum
     * @param view.top number  Top bound of the frustum
     * @param view.near - Near bound of the frustum
     * @param view.far number  Far bound of the frustum
     * @returns self
     */
    ortho(view) {
      const { left, right, bottom, top, near = DEFAULT_NEAR, far = DEFAULT_FAR } = view;
      ortho(this, left, right, bottom, top, near, far);
      return this.check();
    }
    /**
     * Generates an orthogonal projection matrix with the same parameters
     * as a perspective matrix (plus focalDistance)
     * @param view.fovy Vertical field of view in radians
     * @param view.aspect Aspect ratio. Typically viewport width / viewport height
     * @param view.focalDistance Distance in the view frustum used for extent calculations
     * @param view.near Near bound of the frustum
     * @param view.far Far bound of the frustum
     * @returns self
     */
    orthographic(view) {
      const { fovy = DEFAULT_FOVY, aspect = DEFAULT_ASPECT, focalDistance = 1, near = DEFAULT_NEAR, far = DEFAULT_FAR } = view;
      checkRadians(fovy);
      const halfY = fovy / 2;
      const top = focalDistance * Math.tan(halfY);
      const right = top * aspect;
      return this.ortho({
        left: -right,
        right,
        bottom: -top,
        top,
        near,
        far
      });
    }
    /**
     * Generates a perspective projection matrix with the given bounds
     * @param view.fovy Vertical field of view in radians
     * @param view.aspect Aspect ratio. typically viewport width/height
     * @param view.near Near bound of the frustum
     * @param view.far Far bound of the frustum
     * @returns self
     */
    perspective(view) {
      const { fovy = 45 * Math.PI / 180, aspect = 1, near = 0.1, far = 500 } = view;
      checkRadians(fovy);
      perspective(this, fovy, aspect, near, far);
      return this.check();
    }
    // Accessors
    determinant() {
      return determinant2(this);
    }
    /**
     * Extracts the non-uniform scale assuming the matrix is an affine transformation.
     * The scales are the "lengths" of the column vectors in the upper-left 3x3 matrix.
     * @param result
     * @returns self
     */
    getScale(result = [-0, -0, -0]) {
      result[0] = Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
      result[1] = Math.sqrt(this[4] * this[4] + this[5] * this[5] + this[6] * this[6]);
      result[2] = Math.sqrt(this[8] * this[8] + this[9] * this[9] + this[10] * this[10]);
      return result;
    }
    /**
     * Gets the translation portion, assuming the matrix is a affine transformation matrix.
     * @param result
     * @returns self
     */
    getTranslation(result = [-0, -0, -0]) {
      result[0] = this[12];
      result[1] = this[13];
      result[2] = this[14];
      return result;
    }
    /**
     * Gets upper left 3x3 pure rotation matrix (non-scaling), assume affine transformation matrix
     * @param result
     * @param scaleResult
     * @returns self
     */
    getRotation(result, scaleResult) {
      result = result || [-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0];
      scaleResult = scaleResult || [-0, -0, -0];
      const scale6 = this.getScale(scaleResult);
      const inverseScale0 = 1 / scale6[0];
      const inverseScale1 = 1 / scale6[1];
      const inverseScale2 = 1 / scale6[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = 0;
      result[4] = this[4] * inverseScale0;
      result[5] = this[5] * inverseScale1;
      result[6] = this[6] * inverseScale2;
      result[7] = 0;
      result[8] = this[8] * inverseScale0;
      result[9] = this[9] * inverseScale1;
      result[10] = this[10] * inverseScale2;
      result[11] = 0;
      result[12] = 0;
      result[13] = 0;
      result[14] = 0;
      result[15] = 1;
      return result;
    }
    /**
     *
     * @param result
     * @param scaleResult
     * @returns self
     */
    getRotationMatrix3(result, scaleResult) {
      result = result || [-0, -0, -0, -0, -0, -0, -0, -0, -0];
      scaleResult = scaleResult || [-0, -0, -0];
      const scale6 = this.getScale(scaleResult);
      const inverseScale0 = 1 / scale6[0];
      const inverseScale1 = 1 / scale6[1];
      const inverseScale2 = 1 / scale6[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = this[4] * inverseScale0;
      result[4] = this[5] * inverseScale1;
      result[5] = this[6] * inverseScale2;
      result[6] = this[8] * inverseScale0;
      result[7] = this[9] * inverseScale1;
      result[8] = this[10] * inverseScale2;
      return result;
    }
    // Modifiers
    transpose() {
      transpose2(this, this);
      return this.check();
    }
    invert() {
      invert2(this, this);
      return this.check();
    }
    // Operations
    multiplyLeft(a) {
      multiply3(this, a, this);
      return this.check();
    }
    multiplyRight(a) {
      multiply3(this, this, a);
      return this.check();
    }
    // Rotates a matrix by the given angle around the X axis
    rotateX(radians2) {
      rotateX2(this, this, radians2);
      return this.check();
    }
    // Rotates a matrix by the given angle around the Y axis.
    rotateY(radians2) {
      rotateY2(this, this, radians2);
      return this.check();
    }
    /**
     * Rotates a matrix by the given angle around the Z axis.
     * @param radians
     * @returns self
     */
    rotateZ(radians2) {
      rotateZ2(this, this, radians2);
      return this.check();
    }
    /**
     *
     * @param param0
     * @returns self
     */
    rotateXYZ(angleXYZ) {
      return this.rotateX(angleXYZ[0]).rotateY(angleXYZ[1]).rotateZ(angleXYZ[2]);
    }
    /**
     *
     * @param radians
     * @param axis
     * @returns self
     */
    rotateAxis(radians2, axis) {
      rotate2(this, this, radians2, axis);
      return this.check();
    }
    /**
     *
     * @param factor
     * @returns self
     */
    scale(factor) {
      scale3(this, this, Array.isArray(factor) ? factor : [factor, factor, factor]);
      return this.check();
    }
    /**
     *
     * @param vec
     * @returns self
     */
    translate(vector) {
      translate2(this, this, vector);
      return this.check();
    }
    // Transforms
    /**
     * Transforms any 2, 3 or 4 element vector. 2 and 3 elements are treated as points
     * @param vector
     * @param result
     * @returns self
     */
    transform(vector, result) {
      if (vector.length === 4) {
        result = transformMat43(result || [-0, -0, -0, -0], vector, this);
        checkVector(result, 4);
        return result;
      }
      return this.transformAsPoint(vector, result);
    }
    /**
     * Transforms any 2 or 3 element array as point (w implicitly 1)
     * @param vector
     * @param result
     * @returns self
     */
    transformAsPoint(vector, result) {
      const { length: length4 } = vector;
      let out;
      switch (length4) {
        case 2:
          out = transformMat4(result || [-0, -0], vector, this);
          break;
        case 3:
          out = transformMat42(result || [-0, -0, -0], vector, this);
          break;
        default:
          throw new Error("Illegal vector");
      }
      checkVector(out, vector.length);
      return out;
    }
    /**
     * Transforms any 2 or 3 element array as vector (w implicitly 0)
     * @param vector
     * @param result
     * @returns self
     */
    transformAsVector(vector, result) {
      let out;
      switch (vector.length) {
        case 2:
          out = vec2_transformMat4AsVector(result || [-0, -0], vector, this);
          break;
        case 3:
          out = vec3_transformMat4AsVector(result || [-0, -0, -0], vector, this);
          break;
        default:
          throw new Error("Illegal vector");
      }
      checkVector(out, vector.length);
      return out;
    }
    /** @deprecated */
    transformPoint(vector, result) {
      return this.transformAsPoint(vector, result);
    }
    /** @deprecated */
    transformVector(vector, result) {
      return this.transformAsPoint(vector, result);
    }
    /** @deprecated */
    transformDirection(vector, result) {
      return this.transformAsVector(vector, result);
    }
    // three.js math API compatibility
    makeRotationX(radians2) {
      return this.identity().rotateX(radians2);
    }
    makeTranslation(x, y, z) {
      return this.identity().translate([x, y, z]);
    }
  };
  var ZERO3;
  var IDENTITY;
  function getZeroMatrix2() {
    if (!ZERO3) {
      ZERO3 = new Matrix4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      Object.freeze(ZERO3);
    }
    return ZERO3;
  }
  function getIdentityMatrix2() {
    if (!IDENTITY) {
      IDENTITY = new Matrix4();
      Object.freeze(IDENTITY);
    }
    return IDENTITY;
  }
  function checkRadians(possiblyDegrees) {
    if (possiblyDegrees > Math.PI * 2) {
      throw Error("expected radians");
    }
  }
  function computeInfinitePerspectiveOffCenter(result, left, right, bottom, top, near) {
    const column0Row0 = 2 * near / (right - left);
    const column1Row1 = 2 * near / (top - bottom);
    const column2Row0 = (right + left) / (right - left);
    const column2Row1 = (top + bottom) / (top - bottom);
    const column2Row2 = -1;
    const column2Row3 = -1;
    const column3Row2 = -2 * near;
    result[0] = column0Row0;
    result[1] = 0;
    result[2] = 0;
    result[3] = 0;
    result[4] = 0;
    result[5] = column1Row1;
    result[6] = 0;
    result[7] = 0;
    result[8] = column2Row0;
    result[9] = column2Row1;
    result[10] = column2Row2;
    result[11] = column2Row3;
    result[12] = 0;
    result[13] = 0;
    result[14] = column3Row2;
    result[15] = 0;
    return result;
  }

  // ../../node_modules/@math.gl/core/dist/gl-matrix/quat.js
  function create6() {
    const out = new ARRAY_TYPE(4);
    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }
    out[3] = 1;
    return out;
  }
  function identity2(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  }
  function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    const s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }
  function multiply4(out, a, b) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    const bx = b[0];
    const by = b[1];
    const bz = b[2];
    const bw = b[3];
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  }
  function rotateX3(out, a, rad) {
    rad *= 0.5;
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    const bx = Math.sin(rad);
    const bw = Math.cos(rad);
    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
  }
  function rotateY3(out, a, rad) {
    rad *= 0.5;
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    const by = Math.sin(rad);
    const bw = Math.cos(rad);
    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
  }
  function rotateZ3(out, a, rad) {
    rad *= 0.5;
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    const bz = Math.sin(rad);
    const bw = Math.cos(rad);
    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
  }
  function calculateW(out, a) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
    return out;
  }
  function slerp2(out, a, b, t) {
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    let bx = b[0];
    let by = b[1];
    let bz = b[2];
    let bw = b[3];
    let cosom;
    let omega;
    let scale0;
    let scale1;
    let sinom;
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (1 - cosom > EPSILON) {
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      scale0 = 1 - t;
      scale1 = t;
    }
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    return out;
  }
  function invert3(out, a) {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const a3 = a[3];
    const dot4 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
    const invDot = dot4 ? 1 / dot4 : 0;
    out[0] = -a0 * invDot;
    out[1] = -a1 * invDot;
    out[2] = -a2 * invDot;
    out[3] = a3 * invDot;
    return out;
  }
  function conjugate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
  }
  function fromMat3(out, m) {
    const fTrace = m[0] + m[4] + m[8];
    let fRoot;
    if (fTrace > 0) {
      fRoot = Math.sqrt(fTrace + 1);
      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      let i = 0;
      if (m[4] > m[0])
        i = 1;
      if (m[8] > m[i * 3 + i])
        i = 2;
      const j = (i + 1) % 3;
      const k = (i + 2) % 3;
      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }
    return out;
  }
  var add4 = add3;
  var scale5 = scale4;
  var dot3 = dot2;
  var lerp3 = lerp2;
  var length3 = length2;
  var squaredLength3 = squaredLength2;
  var normalize3 = normalize2;
  var rotationTo = function() {
    const tmpvec3 = create2();
    const xUnitVec3 = fromValues(1, 0, 0);
    const yUnitVec3 = fromValues(0, 1, 0);
    return function(out, a, b) {
      const dot4 = dot(a, b);
      if (dot4 < -0.999999) {
        cross(tmpvec3, xUnitVec3, a);
        if (len(tmpvec3) < 1e-6)
          cross(tmpvec3, yUnitVec3, a);
        normalize(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot4 > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      }
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot4;
      return normalize3(out, out);
    };
  }();
  var sqlerp = function() {
    const temp1 = create6();
    const temp2 = create6();
    return function(out, a, b, c, d, t) {
      slerp2(temp1, a, d, t);
      slerp2(temp2, b, c, t);
      slerp2(out, temp1, temp2, 2 * t * (1 - t));
      return out;
    };
  }();
  var setAxes = function() {
    const matr = create3();
    return function(out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];
      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];
      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];
      return normalize3(out, fromMat3(out, matr));
    };
  }();

  // ../../node_modules/@math.gl/core/dist/classes/quaternion.js
  var IDENTITY_QUATERNION = [0, 0, 0, 1];
  var Quaternion = class extends MathArray {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      super(-0, -0, -0, -0);
      if (Array.isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        this.set(x, y, z, w);
      }
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      return this.check();
    }
    set(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this.check();
    }
    fromObject(object) {
      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      this[3] = object.w;
      return this.check();
    }
    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     * NOTE: The resultant quaternion is not normalized, so you should
     * be sure to renormalize the quaternion yourself where necessary.
     * @param m
     * @returns
     */
    fromMatrix3(m) {
      fromMat3(this, m);
      return this.check();
    }
    fromAxisRotation(axis, rad) {
      setAxisAngle(this, axis, rad);
      return this.check();
    }
    /** Set a quat to the identity quaternion */
    identity() {
      identity2(this);
      return this.check();
    }
    // Set the components of a quat to the given values
    // set(i, j, k, l) {
    //   quat_set(this, i, j, k, l);
    //   return this.check();
    // }
    // Sets a quat from the given angle and rotation axis, then returns it.
    setAxisAngle(axis, rad) {
      return this.fromAxisRotation(axis, rad);
    }
    // Getters/setters
    get ELEMENTS() {
      return 4;
    }
    get x() {
      return this[0];
    }
    set x(value) {
      this[0] = checkNumber(value);
    }
    get y() {
      return this[1];
    }
    set y(value) {
      this[1] = checkNumber(value);
    }
    get z() {
      return this[2];
    }
    set z(value) {
      this[2] = checkNumber(value);
    }
    get w() {
      return this[3];
    }
    set w(value) {
      this[3] = checkNumber(value);
    }
    // Calculates the length of a quat
    len() {
      return length3(this);
    }
    // Calculates the squared length of a quat
    lengthSquared() {
      return squaredLength3(this);
    }
    // Calculates the dot product of two quat's
    // @return {Number}
    dot(a) {
      return dot3(this, a);
    }
    // Gets the rotation axis and angle for a given quaternion.
    // If a quaternion is created with setAxisAngle, this method will
    // return the same values as providied in the original parameter
    // list OR functionally equivalent values.
    // Example: The quaternion formed by axis [0, 0, 1] and angle -90
    // is the same as the quaternion formed by [0, 0, 1] and 270.
    // This method favors the latter.
    // @return {{[x,y,z], Number}}
    // getAxisAngle() {
    //   const axis = [];
    // //   const angle = quat_getAxisAngle(axis, this);
    //   return {axis, angle};
    // }
    // MODIFIERS
    // Sets a quaternion to represent the shortest rotation from one vector
    // to another. Both vectors are assumed to be unit length.
    rotationTo(vectorA, vectorB) {
      rotationTo(this, vectorA, vectorB);
      return this.check();
    }
    // Sets the specified quaternion with values corresponding to the given axes.
    // Each axis is a vec3 and is expected to be unit length and perpendicular
    // to all other specified axes.
    // setAxes() {
    //   Number
    // }
    // Performs a spherical linear interpolation with two control points
    // sqlerp() {
    //   Number;
    // }
    // Adds two quat's
    add(a) {
      add4(this, this, a);
      return this.check();
    }
    // Calculates the W component of a quat from the X, Y, and Z components.
    // Any existing W component will be ignored.
    calculateW() {
      calculateW(this, this);
      return this.check();
    }
    // Calculates the conjugate of a quat If the quaternion is normalized,
    // this function is faster than quat_invert and produces the same result.
    conjugate() {
      conjugate(this, this);
      return this.check();
    }
    // Calculates the inverse of a quat
    invert() {
      invert3(this, this);
      return this.check();
    }
    // Performs a linear interpolation between two quat's
    lerp(a, b, t) {
      if (t === void 0) {
        return this.lerp(this, a, b);
      }
      lerp3(this, a, b, t);
      return this.check();
    }
    // Multiplies two quat's
    multiplyRight(a) {
      multiply4(this, this, a);
      return this.check();
    }
    multiplyLeft(a) {
      multiply4(this, a, this);
      return this.check();
    }
    // Normalize a quat
    normalize() {
      const length4 = this.len();
      const l = length4 > 0 ? 1 / length4 : 0;
      this[0] = this[0] * l;
      this[1] = this[1] * l;
      this[2] = this[2] * l;
      this[3] = this[3] * l;
      if (length4 === 0) {
        this[3] = 1;
      }
      return this.check();
    }
    // Rotates a quaternion by the given angle about the X axis
    rotateX(rad) {
      rotateX3(this, this, rad);
      return this.check();
    }
    // Rotates a quaternion by the given angle about the Y axis
    rotateY(rad) {
      rotateY3(this, this, rad);
      return this.check();
    }
    // Rotates a quaternion by the given angle about the Z axis
    rotateZ(rad) {
      rotateZ3(this, this, rad);
      return this.check();
    }
    // Scales a quat by a scalar number
    scale(b) {
      scale5(this, this, b);
      return this.check();
    }
    // Performs a spherical linear interpolation between two quat
    slerp(arg0, arg1, arg2) {
      let start;
      let target;
      let ratio;
      switch (arguments.length) {
        case 1:
          ({
            start = IDENTITY_QUATERNION,
            target,
            ratio
          } = arg0);
          break;
        case 2:
          start = this;
          target = arg0;
          ratio = arg1;
          break;
        default:
          start = arg0;
          target = arg1;
          ratio = arg2;
      }
      slerp2(this, start, target, ratio);
      return this.check();
    }
    transformVector4(vector, result = new Vector4()) {
      transformQuat2(result, vector, this);
      return checkVector(result, 4);
    }
    // THREE.js Math API compatibility
    lengthSq() {
      return this.lengthSquared();
    }
    setFromAxisAngle(axis, rad) {
      return this.setAxisAngle(axis, rad);
    }
    premultiply(a) {
      return this.multiplyLeft(a);
    }
    multiply(a) {
      return this.multiplyRight(a);
    }
  };

  // ../../node_modules/@math.gl/core/dist/lib/math-utils.js
  var math_utils_exports = {};
  __export(math_utils_exports, {
    EPSILON1: () => EPSILON1,
    EPSILON10: () => EPSILON10,
    EPSILON11: () => EPSILON11,
    EPSILON12: () => EPSILON12,
    EPSILON13: () => EPSILON13,
    EPSILON14: () => EPSILON14,
    EPSILON15: () => EPSILON15,
    EPSILON16: () => EPSILON16,
    EPSILON17: () => EPSILON17,
    EPSILON18: () => EPSILON18,
    EPSILON19: () => EPSILON19,
    EPSILON2: () => EPSILON2,
    EPSILON20: () => EPSILON20,
    EPSILON3: () => EPSILON3,
    EPSILON4: () => EPSILON4,
    EPSILON5: () => EPSILON5,
    EPSILON6: () => EPSILON6,
    EPSILON7: () => EPSILON7,
    EPSILON8: () => EPSILON8,
    EPSILON9: () => EPSILON9,
    PI_OVER_FOUR: () => PI_OVER_FOUR,
    PI_OVER_SIX: () => PI_OVER_SIX,
    PI_OVER_TWO: () => PI_OVER_TWO,
    TWO_PI: () => TWO_PI
  });
  var EPSILON1 = 0.1;
  var EPSILON2 = 0.01;
  var EPSILON3 = 1e-3;
  var EPSILON4 = 1e-4;
  var EPSILON5 = 1e-5;
  var EPSILON6 = 1e-6;
  var EPSILON7 = 1e-7;
  var EPSILON8 = 1e-8;
  var EPSILON9 = 1e-9;
  var EPSILON10 = 1e-10;
  var EPSILON11 = 1e-11;
  var EPSILON12 = 1e-12;
  var EPSILON13 = 1e-13;
  var EPSILON14 = 1e-14;
  var EPSILON15 = 1e-15;
  var EPSILON16 = 1e-16;
  var EPSILON17 = 1e-17;
  var EPSILON18 = 1e-18;
  var EPSILON19 = 1e-19;
  var EPSILON20 = 1e-20;
  var PI_OVER_TWO = Math.PI / 2;
  var PI_OVER_FOUR = Math.PI / 4;
  var PI_OVER_SIX = Math.PI / 6;
  var TWO_PI = Math.PI * 2;

  // ../../node_modules/@math.gl/geospatial/dist/constants.js
  var WGS84_RADIUS_X = 6378137;
  var WGS84_RADIUS_Y = 6378137;
  var WGS84_RADIUS_Z = 6356752314245179e-9;
  var WGS84_CONSTANTS = {
    radii: [WGS84_RADIUS_X, WGS84_RADIUS_Y, WGS84_RADIUS_Z],
    radiiSquared: [
      WGS84_RADIUS_X * WGS84_RADIUS_X,
      WGS84_RADIUS_Y * WGS84_RADIUS_Y,
      WGS84_RADIUS_Z * WGS84_RADIUS_Z
    ],
    oneOverRadii: [1 / WGS84_RADIUS_X, 1 / WGS84_RADIUS_Y, 1 / WGS84_RADIUS_Z],
    oneOverRadiiSquared: [
      1 / (WGS84_RADIUS_X * WGS84_RADIUS_X),
      1 / (WGS84_RADIUS_Y * WGS84_RADIUS_Y),
      1 / (WGS84_RADIUS_Z * WGS84_RADIUS_Z)
    ],
    maximumRadius: Math.max(WGS84_RADIUS_X, WGS84_RADIUS_Y, WGS84_RADIUS_Z),
    centerToleranceSquared: 0.1
    // EPSILON1;
  };

  // ../../node_modules/@math.gl/geospatial/dist/type-utils.js
  function identity3(x) {
    return x;
  }
  var scratchVector = new Vector3();
  function fromCartographic(cartographic, result = [], map2 = identity3) {
    if ("longitude" in cartographic) {
      result[0] = map2(cartographic.longitude);
      result[1] = map2(cartographic.latitude);
      result[2] = cartographic.height;
    } else if ("x" in cartographic) {
      result[0] = map2(cartographic.x);
      result[1] = map2(cartographic.y);
      result[2] = cartographic.z;
    } else {
      result[0] = map2(cartographic[0]);
      result[1] = map2(cartographic[1]);
      result[2] = cartographic[2];
    }
    return result;
  }
  function fromCartographicToRadians(cartographic, vector = []) {
    return fromCartographic(cartographic, vector, config._cartographicRadians ? identity3 : toRadians);
  }
  function toCartographic(vector, cartographic, map2 = identity3) {
    if ("longitude" in cartographic) {
      cartographic.longitude = map2(vector[0]);
      cartographic.latitude = map2(vector[1]);
      cartographic.height = vector[2];
    } else if ("x" in cartographic) {
      cartographic.x = map2(vector[0]);
      cartographic.y = map2(vector[1]);
      cartographic.z = vector[2];
    } else {
      cartographic[0] = map2(vector[0]);
      cartographic[1] = map2(vector[1]);
      cartographic[2] = vector[2];
    }
    return cartographic;
  }
  function toCartographicFromRadians(vector, cartographic) {
    return toCartographic(vector, cartographic, config._cartographicRadians ? identity3 : toDegrees);
  }

  // ../../node_modules/@math.gl/geospatial/dist/ellipsoid/helpers/ellipsoid-transform.js
  var EPSILON142 = 1e-14;
  var scratchOrigin = new Vector3();
  var VECTOR_PRODUCT_LOCAL_FRAME = {
    up: {
      south: "east",
      north: "west",
      west: "south",
      east: "north"
    },
    down: {
      south: "west",
      north: "east",
      west: "north",
      east: "south"
    },
    south: {
      up: "west",
      down: "east",
      west: "down",
      east: "up"
    },
    north: {
      up: "east",
      down: "west",
      west: "up",
      east: "down"
    },
    west: {
      up: "north",
      down: "south",
      north: "down",
      south: "up"
    },
    east: {
      up: "south",
      down: "north",
      north: "up",
      south: "down"
    }
  };
  var degeneratePositionLocalFrame = {
    north: [-1, 0, 0],
    east: [0, 1, 0],
    up: [0, 0, 1],
    south: [1, 0, 0],
    west: [0, -1, 0],
    down: [0, 0, -1]
  };
  var scratchAxisVectors = {
    east: new Vector3(),
    north: new Vector3(),
    up: new Vector3(),
    west: new Vector3(),
    south: new Vector3(),
    down: new Vector3()
  };
  var scratchVector1 = new Vector3();
  var scratchVector2 = new Vector3();
  var scratchVector3 = new Vector3();
  function localFrameToFixedFrame(ellipsoid, firstAxis, secondAxis, thirdAxis, cartesianOrigin, result) {
    const thirdAxisInferred = VECTOR_PRODUCT_LOCAL_FRAME[firstAxis] && VECTOR_PRODUCT_LOCAL_FRAME[firstAxis][secondAxis];
    assert(thirdAxisInferred && (!thirdAxis || thirdAxis === thirdAxisInferred));
    let firstAxisVector;
    let secondAxisVector;
    let thirdAxisVector;
    const origin = scratchOrigin.copy(cartesianOrigin);
    const atPole = equals(origin.x, 0, EPSILON142) && equals(origin.y, 0, EPSILON142);
    if (atPole) {
      const sign = Math.sign(origin.z);
      firstAxisVector = scratchVector1.fromArray(degeneratePositionLocalFrame[firstAxis]);
      if (firstAxis !== "east" && firstAxis !== "west") {
        firstAxisVector.scale(sign);
      }
      secondAxisVector = scratchVector2.fromArray(degeneratePositionLocalFrame[secondAxis]);
      if (secondAxis !== "east" && secondAxis !== "west") {
        secondAxisVector.scale(sign);
      }
      thirdAxisVector = scratchVector3.fromArray(degeneratePositionLocalFrame[thirdAxis]);
      if (thirdAxis !== "east" && thirdAxis !== "west") {
        thirdAxisVector.scale(sign);
      }
    } else {
      const { up, east, north } = scratchAxisVectors;
      east.set(-origin.y, origin.x, 0).normalize();
      ellipsoid.geodeticSurfaceNormal(origin, up);
      north.copy(up).cross(east);
      const { down, west, south } = scratchAxisVectors;
      down.copy(up).scale(-1);
      west.copy(east).scale(-1);
      south.copy(north).scale(-1);
      firstAxisVector = scratchAxisVectors[firstAxis];
      secondAxisVector = scratchAxisVectors[secondAxis];
      thirdAxisVector = scratchAxisVectors[thirdAxis];
    }
    result[0] = firstAxisVector.x;
    result[1] = firstAxisVector.y;
    result[2] = firstAxisVector.z;
    result[3] = 0;
    result[4] = secondAxisVector.x;
    result[5] = secondAxisVector.y;
    result[6] = secondAxisVector.z;
    result[7] = 0;
    result[8] = thirdAxisVector.x;
    result[9] = thirdAxisVector.y;
    result[10] = thirdAxisVector.z;
    result[11] = 0;
    result[12] = origin.x;
    result[13] = origin.y;
    result[14] = origin.z;
    result[15] = 1;
    return result;
  }

  // ../../node_modules/@math.gl/geospatial/dist/ellipsoid/helpers/scale-to-geodetic-surface.js
  var scratchVector4 = new Vector3();
  var scaleToGeodeticSurfaceIntersection = new Vector3();
  var scaleToGeodeticSurfaceGradient = new Vector3();
  function scaleToGeodeticSurface(cartesian, ellipsoid, result = []) {
    const { oneOverRadii, oneOverRadiiSquared, centerToleranceSquared } = ellipsoid;
    scratchVector4.from(cartesian);
    const positionX = scratchVector4.x;
    const positionY = scratchVector4.y;
    const positionZ = scratchVector4.z;
    const oneOverRadiiX = oneOverRadii.x;
    const oneOverRadiiY = oneOverRadii.y;
    const oneOverRadiiZ = oneOverRadii.z;
    const x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX;
    const y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY;
    const z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ;
    const squaredNorm = x2 + y2 + z2;
    const ratio = Math.sqrt(1 / squaredNorm);
    if (!Number.isFinite(ratio)) {
      return void 0;
    }
    const intersection = scaleToGeodeticSurfaceIntersection;
    intersection.copy(cartesian).scale(ratio);
    if (squaredNorm < centerToleranceSquared) {
      return intersection.to(result);
    }
    const oneOverRadiiSquaredX = oneOverRadiiSquared.x;
    const oneOverRadiiSquaredY = oneOverRadiiSquared.y;
    const oneOverRadiiSquaredZ = oneOverRadiiSquared.z;
    const gradient = scaleToGeodeticSurfaceGradient;
    gradient.set(intersection.x * oneOverRadiiSquaredX * 2, intersection.y * oneOverRadiiSquaredY * 2, intersection.z * oneOverRadiiSquaredZ * 2);
    let lambda = (1 - ratio) * scratchVector4.len() / (0.5 * gradient.len());
    let correction = 0;
    let xMultiplier;
    let yMultiplier;
    let zMultiplier;
    let func;
    do {
      lambda -= correction;
      xMultiplier = 1 / (1 + lambda * oneOverRadiiSquaredX);
      yMultiplier = 1 / (1 + lambda * oneOverRadiiSquaredY);
      zMultiplier = 1 / (1 + lambda * oneOverRadiiSquaredZ);
      const xMultiplier2 = xMultiplier * xMultiplier;
      const yMultiplier2 = yMultiplier * yMultiplier;
      const zMultiplier2 = zMultiplier * zMultiplier;
      const xMultiplier3 = xMultiplier2 * xMultiplier;
      const yMultiplier3 = yMultiplier2 * yMultiplier;
      const zMultiplier3 = zMultiplier2 * zMultiplier;
      func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1;
      const denominator = x2 * xMultiplier3 * oneOverRadiiSquaredX + y2 * yMultiplier3 * oneOverRadiiSquaredY + z2 * zMultiplier3 * oneOverRadiiSquaredZ;
      const derivative = -2 * denominator;
      correction = func / derivative;
    } while (Math.abs(func) > math_utils_exports.EPSILON12);
    return scratchVector4.scale([xMultiplier, yMultiplier, zMultiplier]).to(result);
  }

  // ../../node_modules/@math.gl/geospatial/dist/ellipsoid/ellipsoid.js
  var scratchVector5 = new Vector3();
  var scratchNormal = new Vector3();
  var scratchK = new Vector3();
  var scratchPosition = new Vector3();
  var scratchHeight = new Vector3();
  var scratchCartesian = new Vector3();
  var Ellipsoid = class {
    constructor(x = 0, y = 0, z = 0) {
      this.centerToleranceSquared = math_utils_exports.EPSILON1;
      assert(x >= 0);
      assert(y >= 0);
      assert(z >= 0);
      this.radii = new Vector3(x, y, z);
      this.radiiSquared = new Vector3(x * x, y * y, z * z);
      this.radiiToTheFourth = new Vector3(x * x * x * x, y * y * y * y, z * z * z * z);
      this.oneOverRadii = new Vector3(x === 0 ? 0 : 1 / x, y === 0 ? 0 : 1 / y, z === 0 ? 0 : 1 / z);
      this.oneOverRadiiSquared = new Vector3(x === 0 ? 0 : 1 / (x * x), y === 0 ? 0 : 1 / (y * y), z === 0 ? 0 : 1 / (z * z));
      this.minimumRadius = Math.min(x, y, z);
      this.maximumRadius = Math.max(x, y, z);
      if (this.radiiSquared.z !== 0) {
        this.squaredXOverSquaredZ = this.radiiSquared.x / this.radiiSquared.z;
      }
      Object.freeze(this);
    }
    /** Compares this Ellipsoid against the provided Ellipsoid componentwise */
    equals(right) {
      return this === right || Boolean(right && this.radii.equals(right.radii));
    }
    /** Creates a string representing this Ellipsoid in the format '(radii.x, radii.y, radii.z)'. */
    toString() {
      return this.radii.toString();
    }
    cartographicToCartesian(cartographic, result = [0, 0, 0]) {
      const normal = scratchNormal;
      const k = scratchK;
      const [, , height] = cartographic;
      this.geodeticSurfaceNormalCartographic(cartographic, normal);
      k.copy(this.radiiSquared).scale(normal);
      const gamma = Math.sqrt(normal.dot(k));
      k.scale(1 / gamma);
      normal.scale(height);
      k.add(normal);
      return k.to(result);
    }
    cartesianToCartographic(cartesian, result = [0, 0, 0]) {
      scratchCartesian.from(cartesian);
      const point = this.scaleToGeodeticSurface(scratchCartesian, scratchPosition);
      if (!point) {
        return void 0;
      }
      const normal = this.geodeticSurfaceNormal(point, scratchNormal);
      const h = scratchHeight;
      h.copy(scratchCartesian).subtract(point);
      const longitude = Math.atan2(normal.y, normal.x);
      const latitude = Math.asin(normal.z);
      const height = Math.sign(vec3_exports.dot(h, scratchCartesian)) * vec3_exports.length(h);
      return toCartographicFromRadians([longitude, latitude, height], result);
    }
    eastNorthUpToFixedFrame(origin, result = new Matrix4()) {
      return localFrameToFixedFrame(this, "east", "north", "up", origin, result);
    }
    // Computes a 4x4 transformation matrix from a reference frame centered at
    // the provided origin to the ellipsoid's fixed reference frame.
    localFrameToFixedFrame(firstAxis, secondAxis, thirdAxis, origin, result = new Matrix4()) {
      return localFrameToFixedFrame(this, firstAxis, secondAxis, thirdAxis, origin, result);
    }
    geocentricSurfaceNormal(cartesian, result = [0, 0, 0]) {
      return scratchVector5.from(cartesian).normalize().to(result);
    }
    geodeticSurfaceNormalCartographic(cartographic, result = [0, 0, 0]) {
      const cartographicVectorRadians = fromCartographicToRadians(cartographic);
      const longitude = cartographicVectorRadians[0];
      const latitude = cartographicVectorRadians[1];
      const cosLatitude = Math.cos(latitude);
      scratchVector5.set(cosLatitude * Math.cos(longitude), cosLatitude * Math.sin(longitude), Math.sin(latitude)).normalize();
      return scratchVector5.to(result);
    }
    geodeticSurfaceNormal(cartesian, result = [0, 0, 0]) {
      return scratchVector5.from(cartesian).scale(this.oneOverRadiiSquared).normalize().to(result);
    }
    /** Scales the provided Cartesian position along the geodetic surface normal
     * so that it is on the surface of this ellipsoid.  If the position is
     * at the center of the ellipsoid, this function returns undefined. */
    scaleToGeodeticSurface(cartesian, result) {
      return scaleToGeodeticSurface(cartesian, this, result);
    }
    /** Scales the provided Cartesian position along the geocentric surface normal
     * so that it is on the surface of this ellipsoid. */
    scaleToGeocentricSurface(cartesian, result = [0, 0, 0]) {
      scratchPosition.from(cartesian);
      const positionX = scratchPosition.x;
      const positionY = scratchPosition.y;
      const positionZ = scratchPosition.z;
      const oneOverRadiiSquared = this.oneOverRadiiSquared;
      const beta = 1 / Math.sqrt(positionX * positionX * oneOverRadiiSquared.x + positionY * positionY * oneOverRadiiSquared.y + positionZ * positionZ * oneOverRadiiSquared.z);
      return scratchPosition.multiplyScalar(beta).to(result);
    }
    /** Transforms a Cartesian X, Y, Z position to the ellipsoid-scaled space by multiplying
     * its components by the result of `Ellipsoid#oneOverRadii` */
    transformPositionToScaledSpace(position, result = [0, 0, 0]) {
      return scratchPosition.from(position).scale(this.oneOverRadii).to(result);
    }
    /** Transforms a Cartesian X, Y, Z position from the ellipsoid-scaled space by multiplying
     * its components by the result of `Ellipsoid#radii`. */
    transformPositionFromScaledSpace(position, result = [0, 0, 0]) {
      return scratchPosition.from(position).scale(this.radii).to(result);
    }
    /** Computes a point which is the intersection of the surface normal with the z-axis. */
    getSurfaceNormalIntersectionWithZAxis(position, buffer = 0, result = [0, 0, 0]) {
      assert(equals(this.radii.x, this.radii.y, math_utils_exports.EPSILON15));
      assert(this.radii.z > 0);
      scratchPosition.from(position);
      const z = scratchPosition.z * (1 - this.squaredXOverSquaredZ);
      if (Math.abs(z) >= this.radii.z - buffer) {
        return void 0;
      }
      return scratchPosition.set(0, 0, z).to(result);
    }
  };
  Ellipsoid.WGS84 = new Ellipsoid(WGS84_RADIUS_X, WGS84_RADIUS_Y, WGS84_RADIUS_Z);

  // ../../node_modules/@probe.gl/stats/dist/utils/hi-res-timestamp.js
  function getHiResTimestamp() {
    let timestamp;
    if (typeof window !== "undefined" && window.performance) {
      timestamp = window.performance.now();
    } else if (typeof process !== "undefined" && process.hrtime) {
      const timeParts = process.hrtime();
      timestamp = timeParts[0] * 1e3 + timeParts[1] / 1e6;
    } else {
      timestamp = Date.now();
    }
    return timestamp;
  }

  // ../../node_modules/@probe.gl/stats/dist/lib/stat.js
  var Stat = class {
    constructor(name, type) {
      this.sampleSize = 1;
      this.time = 0;
      this.count = 0;
      this.samples = 0;
      this.lastTiming = 0;
      this.lastSampleTime = 0;
      this.lastSampleCount = 0;
      this._count = 0;
      this._time = 0;
      this._samples = 0;
      this._startTime = 0;
      this._timerPending = false;
      this.name = name;
      this.type = type;
      this.reset();
    }
    reset() {
      this.time = 0;
      this.count = 0;
      this.samples = 0;
      this.lastTiming = 0;
      this.lastSampleTime = 0;
      this.lastSampleCount = 0;
      this._count = 0;
      this._time = 0;
      this._samples = 0;
      this._startTime = 0;
      this._timerPending = false;
      return this;
    }
    setSampleSize(samples) {
      this.sampleSize = samples;
      return this;
    }
    /** Call to increment count (+1) */
    incrementCount() {
      this.addCount(1);
      return this;
    }
    /** Call to decrement count (-1) */
    decrementCount() {
      this.subtractCount(1);
      return this;
    }
    /** Increase count */
    addCount(value) {
      this._count += value;
      this._samples++;
      this._checkSampling();
      return this;
    }
    /** Decrease count */
    subtractCount(value) {
      this._count -= value;
      this._samples++;
      this._checkSampling();
      return this;
    }
    /** Add an arbitrary timing and bump the count */
    addTime(time) {
      this._time += time;
      this.lastTiming = time;
      this._samples++;
      this._checkSampling();
      return this;
    }
    /** Start a timer */
    timeStart() {
      this._startTime = getHiResTimestamp();
      this._timerPending = true;
      return this;
    }
    /** End a timer. Adds to time and bumps the timing count. */
    timeEnd() {
      if (!this._timerPending) {
        return this;
      }
      this.addTime(getHiResTimestamp() - this._startTime);
      this._timerPending = false;
      this._checkSampling();
      return this;
    }
    getSampleAverageCount() {
      return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
    }
    /** Calculate average time / count for the previous window */
    getSampleAverageTime() {
      return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
    }
    /** Calculate counts per second for the previous window */
    getSampleHz() {
      return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1e3) : 0;
    }
    getAverageCount() {
      return this.samples > 0 ? this.count / this.samples : 0;
    }
    /** Calculate average time / count */
    getAverageTime() {
      return this.samples > 0 ? this.time / this.samples : 0;
    }
    /** Calculate counts per second */
    getHz() {
      return this.time > 0 ? this.samples / (this.time / 1e3) : 0;
    }
    _checkSampling() {
      if (this._samples === this.sampleSize) {
        this.lastSampleTime = this._time;
        this.lastSampleCount = this._count;
        this.count += this._count;
        this.time += this._time;
        this.samples += this._samples;
        this._time = 0;
        this._count = 0;
        this._samples = 0;
      }
    }
  };

  // ../../node_modules/@probe.gl/stats/dist/lib/stats.js
  var Stats = class {
    constructor(options) {
      this.stats = {};
      this.id = options.id;
      this.stats = {};
      this._initializeStats(options.stats);
      Object.seal(this);
    }
    /** Acquire a stat. Create if it doesn't exist. */
    get(name, type = "count") {
      return this._getOrCreate({ name, type });
    }
    get size() {
      return Object.keys(this.stats).length;
    }
    /** Reset all stats */
    reset() {
      for (const stat of Object.values(this.stats)) {
        stat.reset();
      }
      return this;
    }
    forEach(fn) {
      for (const stat of Object.values(this.stats)) {
        fn(stat);
      }
    }
    getTable() {
      const table = {};
      this.forEach((stat) => {
        table[stat.name] = {
          time: stat.time || 0,
          count: stat.count || 0,
          average: stat.getAverageTime() || 0,
          hz: stat.getHz() || 0
        };
      });
      return table;
    }
    _initializeStats(stats = []) {
      stats.forEach((stat) => this._getOrCreate(stat));
    }
    _getOrCreate(stat) {
      const { name, type } = stat;
      let result = this.stats[name];
      if (!result) {
        if (stat instanceof Stat) {
          result = stat;
        } else {
          result = new Stat(name, type);
        }
        this.stats[name] = result;
      }
      return result;
    }
  };

  // ../loader-utils/src/lib/env-utils/assert.ts
  function assert2(condition, message) {
    if (!condition) {
      throw new Error(message || "loader assertion failed.");
    }
  }

  // ../loader-utils/src/lib/request-utils/request-scheduler.ts
  var STAT_QUEUED_REQUESTS = "Queued Requests";
  var STAT_ACTIVE_REQUESTS = "Active Requests";
  var STAT_CANCELLED_REQUESTS = "Cancelled Requests";
  var STAT_QUEUED_REQUESTS_EVER = "Queued Requests Ever";
  var STAT_ACTIVE_REQUESTS_EVER = "Active Requests Ever";
  var DEFAULT_PROPS = {
    id: "request-scheduler",
    /** Specifies if the request scheduler should throttle incoming requests, mainly for comparative testing. */
    throttleRequests: true,
    /** The maximum number of simultaneous active requests. Un-throttled requests do not observe this limit. */
    maxRequests: 6,
    /**
     * Specifies a debounce time, in milliseconds. All requests are queued, until no new requests have
     * been added to the queue for this amount of time.
     */
    debounceTime: 0
  };
  var RequestScheduler = class {
    props;
    stats;
    activeRequestCount = 0;
    /** Tracks the number of active requests and prioritizes/cancels queued requests. */
    requestQueue = [];
    requestMap = /* @__PURE__ */ new Map();
    updateTimer = null;
    constructor(props = {}) {
      this.props = { ...DEFAULT_PROPS, ...props };
      this.stats = new Stats({ id: this.props.id });
      this.stats.get(STAT_QUEUED_REQUESTS);
      this.stats.get(STAT_ACTIVE_REQUESTS);
      this.stats.get(STAT_CANCELLED_REQUESTS);
      this.stats.get(STAT_QUEUED_REQUESTS_EVER);
      this.stats.get(STAT_ACTIVE_REQUESTS_EVER);
    }
    /**
     * Update scheduler props. Preserves active and queued requests.
     */
    setProps(props) {
      if (props.throttleRequests !== void 0) {
        this.props.throttleRequests = props.throttleRequests;
      }
      if (props.maxRequests !== void 0) {
        this.props.maxRequests = props.maxRequests;
      }
      if (props.debounceTime !== void 0) {
        this.props.debounceTime = props.debounceTime;
      }
    }
    /**
     * Called by an application that wants to issue a request, without having it deeply queued by the browser
     *
     * When the returned promise resolved, it is OK for the application to issue a request.
     * The promise resolves to an object that contains a `done` method.
     * When the application's request has completed (or failed), the application must call the `done` function
     *
     * @param handle
     * @param getPriority will be called when request "slots" open up,
     *    allowing the caller to update priority or cancel the request
     *    Highest priority executes first, priority < 0 cancels the request
     * @returns a promise
     *   - resolves to a object (with a `done` field) when the request can be issued without queueing,
     *   - resolves to `null` if the request has been cancelled (by the callback return < 0).
     *     In this case the application should not issue the request
     */
    scheduleRequest(handle, getPriority = () => 0) {
      if (!this.props.throttleRequests) {
        return Promise.resolve({ done: () => {
        } });
      }
      if (this.requestMap.has(handle)) {
        return this.requestMap.get(handle);
      }
      const request = { handle, priority: 0, getPriority };
      const promise = new Promise((resolve2) => {
        request.resolve = resolve2;
        return request;
      });
      this.requestQueue.push(request);
      this.requestMap.set(handle, promise);
      this._issueNewRequests();
      return promise;
    }
    // PRIVATE
    _issueRequest(request) {
      const { handle, resolve: resolve2 } = request;
      let isDone = false;
      const done = () => {
        if (!isDone) {
          isDone = true;
          this.requestMap.delete(handle);
          this.activeRequestCount--;
          this._issueNewRequests();
        }
      };
      this.activeRequestCount++;
      return resolve2 ? resolve2({ done }) : Promise.resolve({ done });
    }
    /** We check requests asynchronously, to prevent multiple updates */
    _issueNewRequests() {
      if (this.updateTimer !== null) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = setTimeout(() => this._issueNewRequestsAsync(), this.props.debounceTime);
    }
    /** Refresh all requests  */
    _issueNewRequestsAsync() {
      if (this.updateTimer !== null) {
        clearTimeout(this.updateTimer);
      }
      this.updateTimer = null;
      const freeSlots = Math.max(this.props.maxRequests - this.activeRequestCount, 0);
      if (freeSlots === 0) {
        return;
      }
      this._updateAllRequests();
      for (let i = 0; i < freeSlots; ++i) {
        const request = this.requestQueue.shift();
        if (request) {
          this._issueRequest(request);
        }
      }
    }
    /** Ensure all requests have updated priorities, and that no longer valid requests are cancelled */
    _updateAllRequests() {
      const requestQueue = this.requestQueue;
      for (let i = 0; i < requestQueue.length; ++i) {
        const request = requestQueue[i];
        if (!this._updateRequest(request)) {
          requestQueue.splice(i, 1);
          this.requestMap.delete(request.handle);
          i--;
        }
      }
      requestQueue.sort((a, b) => a.priority - b.priority);
    }
    /** Update a single request by calling the callback */
    _updateRequest(request) {
      request.priority = request.getPriority(request.handle);
      if (request.priority < 0) {
        request.resolve(null);
        return false;
      }
      return true;
    }
  };

  // ../loader-utils/src/lib/path-utils/path.ts
  var path_exports = {};
  __export(path_exports, {
    dirname: () => dirname,
    filename: () => filename,
    join: () => join,
    resolve: () => resolve
  });

  // ../loader-utils/src/lib/path-utils/get-cwd.ts
  function getCWD() {
    if (typeof process !== "undefined" && typeof process.cwd !== "undefined") {
      return process.cwd();
    }
    const pathname = window.location?.pathname;
    return pathname?.slice(0, pathname.lastIndexOf("/") + 1) || "";
  }

  // ../loader-utils/src/lib/path-utils/path.ts
  function filename(url) {
    const slashIndex = url ? url.lastIndexOf("/") : -1;
    return slashIndex >= 0 ? url.substr(slashIndex + 1) : url;
  }
  function dirname(url) {
    const slashIndex = url ? url.lastIndexOf("/") : -1;
    return slashIndex >= 0 ? url.substr(0, slashIndex) : "";
  }
  function join(...parts) {
    const separator = "/";
    parts = parts.map((part, index) => {
      if (index) {
        part = part.replace(new RegExp(`^${separator}`), "");
      }
      if (index !== parts.length - 1) {
        part = part.replace(new RegExp(`${separator}$`), "");
      }
      return part;
    });
    return parts.join(separator);
  }
  function resolve(...components) {
    const paths = [];
    for (let _i = 0; _i < components.length; _i++) {
      paths[_i] = components[_i];
    }
    let resolvedPath = "";
    let resolvedAbsolute = false;
    let cwd;
    for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      let path;
      if (i >= 0) {
        path = paths[i];
      } else {
        if (cwd === void 0) {
          cwd = getCWD();
        }
        path = cwd;
      }
      if (path.length === 0) {
        continue;
      }
      resolvedPath = `${path}/${resolvedPath}`;
      resolvedAbsolute = path.charCodeAt(0) === SLASH;
    }
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute) {
      return `/${resolvedPath}`;
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    }
    return ".";
  }
  var SLASH = 47;
  var DOT = 46;
  function normalizeStringPosix(path, allowAboveRoot) {
    let res = "";
    let lastSlash = -1;
    let dots = 0;
    let code;
    let isAboveRoot = false;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) {
        code = path.charCodeAt(i);
      } else if (code === SLASH) {
        break;
      } else {
        code = SLASH;
      }
      if (code === SLASH) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (res.length < 2 || !isAboveRoot || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
            if (res.length > 2) {
              const start = res.length - 1;
              let j = start;
              for (; j >= 0; --j) {
                if (res.charCodeAt(j) === SLASH) {
                  break;
                }
              }
              if (j !== start) {
                res = j === -1 ? "" : res.slice(0, j);
                lastSlash = i;
                dots = 0;
                isAboveRoot = false;
                continue;
              }
            } else if (res.length === 2 || res.length === 1) {
              res = "";
              lastSlash = i;
              dots = 0;
              isAboveRoot = false;
              continue;
            }
          }
          if (allowAboveRoot) {
            if (res.length > 0) {
              res += "/..";
            } else {
              res = "..";
            }
            isAboveRoot = true;
          }
        } else {
          const slice = path.slice(lastSlash + 1, i);
          if (res.length > 0) {
            res += `/${slice}`;
          } else {
            res = slice;
          }
          isAboveRoot = false;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }

  // src/utils/doubly-linked-list-node.ts
  var DoublyLinkedListNode = class {
    item;
    previous;
    next;
    constructor(item, previous, next) {
      this.item = item;
      this.previous = previous;
      this.next = next;
    }
  };

  // src/utils/doubly-linked-list.ts
  var DoublyLinkedList = class {
    head = null;
    tail = null;
    _length = 0;
    get length() {
      return this._length;
    }
    /**
     * Adds the item to the end of the list
     * @param {*} [item]
     * @return {DoublyLinkedListNode}
     */
    add(item) {
      const node = new DoublyLinkedListNode(item, this.tail, null);
      if (this.tail) {
        this.tail.next = node;
        this.tail = node;
      } else {
        this.head = node;
        this.tail = node;
      }
      ++this._length;
      return node;
    }
    /**
     * Removes the given node from the list
     * @param {DoublyLinkedListNode} node
     */
    remove(node) {
      if (!node) {
        return;
      }
      if (node.previous && node.next) {
        node.previous.next = node.next;
        node.next.previous = node.previous;
      } else if (node.previous) {
        node.previous.next = null;
        this.tail = node.previous;
      } else if (node.next) {
        node.next.previous = null;
        this.head = node.next;
      } else {
        this.head = null;
        this.tail = null;
      }
      node.next = null;
      node.previous = null;
      --this._length;
    }
    /**
     * Moves nextNode after node
     * @param {DoublyLinkedListNode} node
     * @param {DoublyLinkedListNode} nextNode
     */
    splice(node, nextNode) {
      if (node === nextNode) {
        return;
      }
      this.remove(nextNode);
      this._insert(node, nextNode);
    }
    _insert(node, nextNode) {
      const oldNodeNext = node.next;
      node.next = nextNode;
      if (this.tail === node) {
        this.tail = nextNode;
      } else {
        oldNodeNext.previous = nextNode;
      }
      nextNode.next = oldNodeNext;
      nextNode.previous = node;
      ++this._length;
    }
  };

  // src/tileset/tileset-cache.ts
  var TilesetCache = class {
    _list;
    _sentinel;
    _trimTiles;
    constructor() {
      this._list = new DoublyLinkedList();
      this._sentinel = this._list.add("sentinel");
      this._trimTiles = false;
    }
    reset() {
      this._list.splice(this._list.tail, this._sentinel);
    }
    touch(tile) {
      const node = tile._cacheNode;
      if (node) {
        this._list.splice(this._sentinel, node);
      }
    }
    add(tileset, tile, addCallback) {
      if (!tile._cacheNode) {
        tile._cacheNode = this._list.add(tile);
        if (addCallback) {
          addCallback(tileset, tile);
        }
      }
    }
    unloadTile(tileset, tile, unloadCallback) {
      const node = tile._cacheNode;
      if (!node) {
        return;
      }
      this._list.remove(node);
      tile._cacheNode = null;
      if (unloadCallback) {
        unloadCallback(tileset, tile);
      }
    }
    unloadTiles(tileset, unloadCallback) {
      const trimTiles = this._trimTiles;
      this._trimTiles = false;
      const list = this._list;
      const maximumMemoryUsageInBytes = tileset.maximumMemoryUsage * 1024 * 1024;
      const sentinel = this._sentinel;
      let node = list.head;
      while (node !== sentinel && (tileset.gpuMemoryUsageInBytes > maximumMemoryUsageInBytes || trimTiles)) {
        const tile = node.item;
        node = node.next;
        this.unloadTile(tileset, tile, unloadCallback);
      }
    }
    trim() {
      this._trimTiles = true;
    }
  };

  // src/tileset/helpers/transform-utils.ts
  function calculateTransformProps(tileHeader, tile) {
    assert2(tileHeader);
    assert2(tile);
    const { rtcCenter, gltfUpAxis } = tile;
    const {
      computedTransform,
      boundingVolume: { center }
    } = tileHeader;
    let modelMatrix = new Matrix4(computedTransform);
    if (rtcCenter) {
      modelMatrix.translate(rtcCenter);
    }
    switch (gltfUpAxis) {
      case "Z":
        break;
      case "Y":
        const rotationY = new Matrix4().rotateX(Math.PI / 2);
        modelMatrix = modelMatrix.multiplyRight(rotationY);
        break;
      case "X":
        const rotationX = new Matrix4().rotateY(-Math.PI / 2);
        modelMatrix = modelMatrix.multiplyRight(rotationX);
        break;
      default:
        break;
    }
    if (tile.isQuantized) {
      modelMatrix.translate(tile.quantizedVolumeOffset).scale(tile.quantizedVolumeScale);
    }
    const cartesianOrigin = new Vector3(center);
    tile.cartesianModelMatrix = modelMatrix;
    tile.cartesianOrigin = cartesianOrigin;
    const cartographicOrigin = Ellipsoid.WGS84.cartesianToCartographic(
      cartesianOrigin,
      new Vector3()
    );
    const fromFixedFrameMatrix = Ellipsoid.WGS84.eastNorthUpToFixedFrame(cartesianOrigin);
    const toFixedFrameMatrix = fromFixedFrameMatrix.invert();
    tile.cartographicModelMatrix = toFixedFrameMatrix.multiplyRight(modelMatrix);
    tile.cartographicOrigin = cartographicOrigin;
    const rootNode = _getRootNode(tile);
    if (rootNode) {
      tile.cartesianModelMatrix = new Matrix4(modelMatrix).multiplyRight(rootNode.matrix);
      tile.cartographicModelMatrix.multiplyRight(rootNode.matrix);
      rootNode.matrix = Matrix4.IDENTITY;
    }
    if (!tile.coordinateSystem) {
      tile.modelMatrix = tile.cartographicModelMatrix;
    }
  }
  var TRANSLATION_LIMIT_SQUARED = 1e6 ** 2;
  function _getRootNode(tile) {
    const gltf = tile.gltf;
    if (!gltf) {
      return null;
    }
    const sceneIndex = typeof gltf.scene === "number" ? gltf.scene : 0;
    const scene = gltf.scenes?.[sceneIndex];
    const rootNode = scene?.nodes?.[0];
    if (!rootNode?.matrix)
      return null;
    const m = rootNode.matrix;
    const translationMagnitude = m[12] * m[12] + m[13] * m[13] + m[14] * m[14];
    if (translationMagnitude <= TRANSLATION_LIMIT_SQUARED)
      return null;
    return rootNode;
  }

  // ../../node_modules/@math.gl/culling/dist/constants.js
  var INTERSECTION = {
    OUTSIDE: -1,
    // Represents that an object is not contained within the frustum.
    INTERSECTING: 0,
    // Represents that an object intersects one of the frustum's planes.
    INSIDE: 1
    // Represents that an object is fully within the frustum.
  };

  // ../../node_modules/@math.gl/culling/dist/lib/bounding-volumes/axis-aligned-bounding-box.js
  var scratchVector6 = new Vector3();
  var scratchNormal2 = new Vector3();

  // ../../node_modules/@math.gl/culling/dist/lib/bounding-volumes/bounding-sphere.js
  var scratchVector7 = new Vector3();
  var scratchVector22 = new Vector3();
  var BoundingSphere = class {
    /** Creates a bounding sphere */
    constructor(center = [0, 0, 0], radius = 0) {
      this.radius = -0;
      this.center = new Vector3();
      this.fromCenterRadius(center, radius);
    }
    /** Sets the bounding sphere from `center` and `radius`. */
    fromCenterRadius(center, radius) {
      this.center.from(center);
      this.radius = radius;
      return this;
    }
    /**
     * Computes a bounding sphere from the corner points of an axis-aligned bounding box.  The sphere
     * tightly and fully encompasses the box.
     */
    fromCornerPoints(corner, oppositeCorner) {
      oppositeCorner = scratchVector7.from(oppositeCorner);
      this.center = new Vector3().from(corner).add(oppositeCorner).scale(0.5);
      this.radius = this.center.distance(oppositeCorner);
      return this;
    }
    /** Compares the provided BoundingSphere component wise */
    equals(right) {
      return this === right || Boolean(right) && this.center.equals(right.center) && this.radius === right.radius;
    }
    /** Duplicates a BoundingSphere instance. */
    clone() {
      return new BoundingSphere(this.center, this.radius);
    }
    /** Computes a bounding sphere that contains both the left and right bounding spheres. */
    union(boundingSphere) {
      const leftCenter = this.center;
      const leftRadius = this.radius;
      const rightCenter = boundingSphere.center;
      const rightRadius = boundingSphere.radius;
      const toRightCenter = scratchVector7.copy(rightCenter).subtract(leftCenter);
      const centerSeparation = toRightCenter.magnitude();
      if (leftRadius >= centerSeparation + rightRadius) {
        return this.clone();
      }
      if (rightRadius >= centerSeparation + leftRadius) {
        return boundingSphere.clone();
      }
      const halfDistanceBetweenTangentPoints = (leftRadius + centerSeparation + rightRadius) * 0.5;
      scratchVector22.copy(toRightCenter).scale((-leftRadius + halfDistanceBetweenTangentPoints) / centerSeparation).add(leftCenter);
      this.center.copy(scratchVector22);
      this.radius = halfDistanceBetweenTangentPoints;
      return this;
    }
    /** Computes a bounding sphere by enlarging the provided sphere to contain the provided point. */
    expand(point) {
      const scratchPoint2 = scratchVector7.from(point);
      const radius = scratchPoint2.subtract(this.center).magnitude();
      if (radius > this.radius) {
        this.radius = radius;
      }
      return this;
    }
    // BoundingVolume interface
    /**
     * Applies a 4x4 affine transformation matrix to a bounding sphere.
     * @param sphere The bounding sphere to apply the transformation to.
     * @param transform The transformation matrix to apply to the bounding sphere.
     * @returns self.
     */
    transform(transform) {
      this.center.transform(transform);
      const scale6 = mat4_exports.getScaling(scratchVector7, transform);
      this.radius = Math.max(scale6[0], Math.max(scale6[1], scale6[2])) * this.radius;
      return this;
    }
    /** Computes the estimated distance squared from the closest point on a bounding sphere to a point. */
    distanceSquaredTo(point) {
      const d = this.distanceTo(point);
      return d * d;
    }
    /** Computes the estimated distance from the closest point on a bounding sphere to a point. */
    distanceTo(point) {
      const scratchPoint2 = scratchVector7.from(point);
      const delta = scratchPoint2.subtract(this.center);
      return Math.max(0, delta.len() - this.radius);
    }
    /** Determines which side of a plane a sphere is located. */
    intersectPlane(plane) {
      const center = this.center;
      const radius = this.radius;
      const normal = plane.normal;
      const distanceToPlane = normal.dot(center) + plane.distance;
      if (distanceToPlane < -radius) {
        return INTERSECTION.OUTSIDE;
      }
      if (distanceToPlane < radius) {
        return INTERSECTION.INTERSECTING;
      }
      return INTERSECTION.INSIDE;
    }
  };

  // ../../node_modules/@math.gl/culling/dist/lib/bounding-volumes/oriented-bounding-box.js
  var scratchVector32 = new Vector3();
  var scratchOffset = new Vector3();
  var scratchVectorU = new Vector3();
  var scratchVectorV = new Vector3();
  var scratchVectorW = new Vector3();
  var scratchCorner = new Vector3();
  var scratchToCenter = new Vector3();
  var MATRIX3 = {
    COLUMN0ROW0: 0,
    COLUMN0ROW1: 1,
    COLUMN0ROW2: 2,
    COLUMN1ROW0: 3,
    COLUMN1ROW1: 4,
    COLUMN1ROW2: 5,
    COLUMN2ROW0: 6,
    COLUMN2ROW1: 7,
    COLUMN2ROW2: 8
  };
  var OrientedBoundingBox = class {
    constructor(center = [0, 0, 0], halfAxes = [0, 0, 0, 0, 0, 0, 0, 0, 0]) {
      this.center = new Vector3().from(center);
      this.halfAxes = new Matrix3(halfAxes);
    }
    /** Returns an array with three halfSizes for the bounding box */
    get halfSize() {
      const xAxis = this.halfAxes.getColumn(0);
      const yAxis = this.halfAxes.getColumn(1);
      const zAxis = this.halfAxes.getColumn(2);
      return [new Vector3(xAxis).len(), new Vector3(yAxis).len(), new Vector3(zAxis).len()];
    }
    /** Returns a quaternion describing the orientation of the bounding box */
    get quaternion() {
      const xAxis = this.halfAxes.getColumn(0);
      const yAxis = this.halfAxes.getColumn(1);
      const zAxis = this.halfAxes.getColumn(2);
      const normXAxis = new Vector3(xAxis).normalize();
      const normYAxis = new Vector3(yAxis).normalize();
      const normZAxis = new Vector3(zAxis).normalize();
      return new Quaternion().fromMatrix3(new Matrix3([...normXAxis, ...normYAxis, ...normZAxis]));
    }
    /**
     * Create OrientedBoundingBox from quaternion based OBB,
     */
    fromCenterHalfSizeQuaternion(center, halfSize, quaternion) {
      const quaternionObject = new Quaternion(quaternion);
      const directionsMatrix = new Matrix3().fromQuaternion(quaternionObject);
      directionsMatrix[0] = directionsMatrix[0] * halfSize[0];
      directionsMatrix[1] = directionsMatrix[1] * halfSize[0];
      directionsMatrix[2] = directionsMatrix[2] * halfSize[0];
      directionsMatrix[3] = directionsMatrix[3] * halfSize[1];
      directionsMatrix[4] = directionsMatrix[4] * halfSize[1];
      directionsMatrix[5] = directionsMatrix[5] * halfSize[1];
      directionsMatrix[6] = directionsMatrix[6] * halfSize[2];
      directionsMatrix[7] = directionsMatrix[7] * halfSize[2];
      directionsMatrix[8] = directionsMatrix[8] * halfSize[2];
      this.center = new Vector3().from(center);
      this.halfAxes = directionsMatrix;
      return this;
    }
    /** Duplicates a OrientedBoundingBox instance. */
    clone() {
      return new OrientedBoundingBox(this.center, this.halfAxes);
    }
    /** Compares the provided OrientedBoundingBox component wise and returns */
    equals(right) {
      return this === right || Boolean(right) && this.center.equals(right.center) && this.halfAxes.equals(right.halfAxes);
    }
    /** Computes a tight-fitting bounding sphere enclosing the provided oriented bounding box. */
    getBoundingSphere(result = new BoundingSphere()) {
      const halfAxes = this.halfAxes;
      const u = halfAxes.getColumn(0, scratchVectorU);
      const v = halfAxes.getColumn(1, scratchVectorV);
      const w = halfAxes.getColumn(2, scratchVectorW);
      const cornerVector = scratchVector32.copy(u).add(v).add(w);
      result.center.copy(this.center);
      result.radius = cornerVector.magnitude();
      return result;
    }
    /** Determines which side of a plane the oriented bounding box is located. */
    intersectPlane(plane) {
      const center = this.center;
      const normal = plane.normal;
      const halfAxes = this.halfAxes;
      const normalX = normal.x;
      const normalY = normal.y;
      const normalZ = normal.z;
      const radEffective = Math.abs(normalX * halfAxes[MATRIX3.COLUMN0ROW0] + normalY * halfAxes[MATRIX3.COLUMN0ROW1] + normalZ * halfAxes[MATRIX3.COLUMN0ROW2]) + Math.abs(normalX * halfAxes[MATRIX3.COLUMN1ROW0] + normalY * halfAxes[MATRIX3.COLUMN1ROW1] + normalZ * halfAxes[MATRIX3.COLUMN1ROW2]) + Math.abs(normalX * halfAxes[MATRIX3.COLUMN2ROW0] + normalY * halfAxes[MATRIX3.COLUMN2ROW1] + normalZ * halfAxes[MATRIX3.COLUMN2ROW2]);
      const distanceToPlane = normal.dot(center) + plane.distance;
      if (distanceToPlane <= -radEffective) {
        return INTERSECTION.OUTSIDE;
      } else if (distanceToPlane >= radEffective) {
        return INTERSECTION.INSIDE;
      }
      return INTERSECTION.INTERSECTING;
    }
    /** Computes the estimated distance from the closest point on a bounding box to a point. */
    distanceTo(point) {
      return Math.sqrt(this.distanceSquaredTo(point));
    }
    /**
     * Computes the estimated distance squared from the closest point
     * on a bounding box to a point.
     * See Geometric Tools for Computer Graphics 10.4.2
     */
    distanceSquaredTo(point) {
      const offset = scratchOffset.from(point).subtract(this.center);
      const halfAxes = this.halfAxes;
      const u = halfAxes.getColumn(0, scratchVectorU);
      const v = halfAxes.getColumn(1, scratchVectorV);
      const w = halfAxes.getColumn(2, scratchVectorW);
      const uHalf = u.magnitude();
      const vHalf = v.magnitude();
      const wHalf = w.magnitude();
      u.normalize();
      v.normalize();
      w.normalize();
      let distanceSquared = 0;
      let d;
      d = Math.abs(offset.dot(u)) - uHalf;
      if (d > 0) {
        distanceSquared += d * d;
      }
      d = Math.abs(offset.dot(v)) - vHalf;
      if (d > 0) {
        distanceSquared += d * d;
      }
      d = Math.abs(offset.dot(w)) - wHalf;
      if (d > 0) {
        distanceSquared += d * d;
      }
      return distanceSquared;
    }
    /**
     * The distances calculated by the vector from the center of the bounding box
     * to position projected onto direction.
     *
     * - If you imagine the infinite number of planes with normal direction,
     *   this computes the smallest distance to the closest and farthest planes
     *   from `position` that intersect the bounding box.
     *
     * @param position The position to calculate the distance from.
     * @param direction The direction from position.
     * @param result An Interval (array of length 2) to store the nearest and farthest distances.
     * @returns Interval (array of length 2) with nearest and farthest distances
     *   on the bounding box from position in direction.
     */
    // eslint-disable-next-line max-statements
    computePlaneDistances(position, direction, result = [-0, -0]) {
      let minDist = Number.POSITIVE_INFINITY;
      let maxDist = Number.NEGATIVE_INFINITY;
      const center = this.center;
      const halfAxes = this.halfAxes;
      const u = halfAxes.getColumn(0, scratchVectorU);
      const v = halfAxes.getColumn(1, scratchVectorV);
      const w = halfAxes.getColumn(2, scratchVectorW);
      const corner = scratchCorner.copy(u).add(v).add(w).add(center);
      const toCenter = scratchToCenter.copy(corner).subtract(position);
      let mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).add(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).subtract(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).subtract(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).add(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).add(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).subtract(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).subtract(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      result[0] = minDist;
      result[1] = maxDist;
      return result;
    }
    /**
     * Applies a 4x4 affine transformation matrix to a bounding sphere.
     * @param transform The transformation matrix to apply to the bounding sphere.
     * @returns itself, i.e. the modified BoundingVolume.
     */
    transform(transformation) {
      this.center.transformAsPoint(transformation);
      const xAxis = this.halfAxes.getColumn(0, scratchVectorU);
      xAxis.transformAsPoint(transformation);
      const yAxis = this.halfAxes.getColumn(1, scratchVectorV);
      yAxis.transformAsPoint(transformation);
      const zAxis = this.halfAxes.getColumn(2, scratchVectorW);
      zAxis.transformAsPoint(transformation);
      this.halfAxes = new Matrix3([...xAxis, ...yAxis, ...zAxis]);
      return this;
    }
    getTransform() {
      throw new Error("not implemented");
    }
  };

  // ../../node_modules/@math.gl/culling/dist/lib/plane.js
  var scratchPosition2 = new Vector3();
  var scratchNormal3 = new Vector3();
  var Plane = class {
    constructor(normal = [0, 0, 1], distance2 = 0) {
      this.normal = new Vector3();
      this.distance = -0;
      this.fromNormalDistance(normal, distance2);
    }
    /** Creates a plane from a normal and a distance from the origin. */
    fromNormalDistance(normal, distance2) {
      assert(Number.isFinite(distance2));
      this.normal.from(normal).normalize();
      this.distance = distance2;
      return this;
    }
    /** Creates a plane from a normal and a point on the plane. */
    fromPointNormal(point, normal) {
      point = scratchPosition2.from(point);
      this.normal.from(normal).normalize();
      const distance2 = -this.normal.dot(point);
      this.distance = distance2;
      return this;
    }
    /** Creates a plane from the general equation */
    fromCoefficients(a, b, c, d) {
      this.normal.set(a, b, c);
      assert(equals(this.normal.len(), 1));
      this.distance = d;
      return this;
    }
    /** Duplicates a Plane instance. */
    clone() {
      return new Plane(this.normal, this.distance);
    }
    /** Compares the provided Planes by normal and distance */
    equals(right) {
      return equals(this.distance, right.distance) && equals(this.normal, right.normal);
    }
    /** Computes the signed shortest distance of a point to a plane.
     * The sign of the distance determines which side of the plane the point is on.
     */
    getPointDistance(point) {
      return this.normal.dot(point) + this.distance;
    }
    /** Transforms the plane by the given transformation matrix. */
    transform(matrix4) {
      const normal = scratchNormal3.copy(this.normal).transformAsVector(matrix4).normalize();
      const point = this.normal.scale(-this.distance).transform(matrix4);
      return this.fromPointNormal(point, normal);
    }
    projectPointOntoPlane(point, result = [0, 0, 0]) {
      const scratchPoint2 = scratchPosition2.from(point);
      const pointDistance = this.getPointDistance(scratchPoint2);
      const scaledNormal = scratchNormal3.copy(this.normal).scale(pointDistance);
      return scratchPoint2.subtract(scaledNormal).to(result);
    }
  };

  // ../../node_modules/@math.gl/culling/dist/lib/culling-volume.js
  var faces = [new Vector3([1, 0, 0]), new Vector3([0, 1, 0]), new Vector3([0, 0, 1])];
  var scratchPlaneCenter = new Vector3();
  var scratchPlaneNormal = new Vector3();
  var CullingVolume = class {
    /**
     * Create a new `CullingVolume` bounded by an array of clipping planed
     * @param planes Array of clipping planes.
     * */
    constructor(planes = []) {
      this.planes = planes;
    }
    /**
     * Constructs a culling volume from a bounding sphere. Creates six planes that create a box containing the sphere.
     * The planes are aligned to the x, y, and z axes in world coordinates.
     */
    fromBoundingSphere(boundingSphere) {
      this.planes.length = 2 * faces.length;
      const center = boundingSphere.center;
      const radius = boundingSphere.radius;
      let planeIndex = 0;
      for (const faceNormal of faces) {
        let plane0 = this.planes[planeIndex];
        let plane1 = this.planes[planeIndex + 1];
        if (!plane0) {
          plane0 = this.planes[planeIndex] = new Plane();
        }
        if (!plane1) {
          plane1 = this.planes[planeIndex + 1] = new Plane();
        }
        const plane0Center = scratchPlaneCenter.copy(faceNormal).scale(-radius).add(center);
        plane0.fromPointNormal(plane0Center, faceNormal);
        const plane1Center = scratchPlaneCenter.copy(faceNormal).scale(radius).add(center);
        const negatedFaceNormal = scratchPlaneNormal.copy(faceNormal).negate();
        plane1.fromPointNormal(plane1Center, negatedFaceNormal);
        planeIndex += 2;
      }
      return this;
    }
    /** Determines whether a bounding volume intersects the culling volume. */
    computeVisibility(boundingVolume) {
      let intersect = INTERSECTION.INSIDE;
      for (const plane of this.planes) {
        const result = boundingVolume.intersectPlane(plane);
        switch (result) {
          case INTERSECTION.OUTSIDE:
            return INTERSECTION.OUTSIDE;
          case INTERSECTION.INTERSECTING:
            intersect = INTERSECTION.INTERSECTING;
            break;
          default:
        }
      }
      return intersect;
    }
    /**
     * Determines whether a bounding volume intersects the culling volume.
     *
     * @param parentPlaneMask A bit mask from the boundingVolume's parent's check against the same culling
     *   volume, such that if (planeMask & (1 << planeIndex) === 0), for k < 31, then
     *   the parent (and therefore this) volume is completely inside plane[planeIndex]
     *   and that plane check can be skipped.
     */
    computeVisibilityWithPlaneMask(boundingVolume, parentPlaneMask) {
      assert(Number.isFinite(parentPlaneMask), "parentPlaneMask is required.");
      if (parentPlaneMask === CullingVolume.MASK_OUTSIDE || parentPlaneMask === CullingVolume.MASK_INSIDE) {
        return parentPlaneMask;
      }
      let mask = CullingVolume.MASK_INSIDE;
      const planes = this.planes;
      for (let k = 0; k < this.planes.length; ++k) {
        const flag = k < 31 ? 1 << k : 0;
        if (k < 31 && (parentPlaneMask & flag) === 0) {
          continue;
        }
        const plane = planes[k];
        const result = boundingVolume.intersectPlane(plane);
        if (result === INTERSECTION.OUTSIDE) {
          return CullingVolume.MASK_OUTSIDE;
        } else if (result === INTERSECTION.INTERSECTING) {
          mask |= flag;
        }
      }
      return mask;
    }
  };
  CullingVolume.MASK_OUTSIDE = 4294967295;
  CullingVolume.MASK_INSIDE = 0;
  CullingVolume.MASK_INDETERMINATE = 2147483647;

  // ../../node_modules/@math.gl/culling/dist/lib/perspective-off-center-frustum.js
  var scratchPlaneUpVector = new Vector3();
  var scratchPlaneRightVector = new Vector3();
  var scratchPlaneNearCenter = new Vector3();
  var scratchPlaneFarCenter = new Vector3();
  var scratchPlaneNormal2 = new Vector3();

  // ../../node_modules/@math.gl/culling/dist/lib/algorithms/bounding-sphere-from-points.js
  var fromPointsXMin = new Vector3();
  var fromPointsYMin = new Vector3();
  var fromPointsZMin = new Vector3();
  var fromPointsXMax = new Vector3();
  var fromPointsYMax = new Vector3();
  var fromPointsZMax = new Vector3();
  var fromPointsCurrentPos = new Vector3();
  var fromPointsScratch = new Vector3();
  var fromPointsRitterCenter = new Vector3();
  var fromPointsMinBoxPt = new Vector3();
  var fromPointsMaxBoxPt = new Vector3();
  var fromPointsNaiveCenterScratch = new Vector3();

  // ../../node_modules/@math.gl/culling/dist/lib/algorithms/compute-eigen-decomposition.js
  var scratchMatrix = new Matrix3();
  var scratchUnitary = new Matrix3();
  var scratchDiagonal = new Matrix3();
  var jMatrix = new Matrix3();
  var jMatrixTranspose = new Matrix3();

  // ../../node_modules/@math.gl/culling/dist/lib/algorithms/bounding-box-from-points.js
  var scratchVector23 = new Vector3();
  var scratchVector33 = new Vector3();
  var scratchVector42 = new Vector3();
  var scratchVector52 = new Vector3();
  var scratchVector62 = new Vector3();
  var scratchCovarianceResult = new Matrix3();
  var scratchEigenResult = {
    diagonal: new Matrix3(),
    unitary: new Matrix3()
  };

  // src/tileset/helpers/frame-state.ts
  var scratchVector8 = new Vector3();
  var scratchPosition3 = new Vector3();
  var cullingVolume = new CullingVolume([
    new Plane(),
    new Plane(),
    new Plane(),
    new Plane(),
    new Plane(),
    new Plane()
  ]);
  function getFrameState(viewport, frameNumber) {
    const { cameraDirection, cameraUp, height } = viewport;
    const { metersPerUnit } = viewport.distanceScales;
    const viewportCenterCartesian = worldToCartesian(viewport, viewport.center);
    const enuToFixedTransform = Ellipsoid.WGS84.eastNorthUpToFixedFrame(viewportCenterCartesian);
    const cameraPositionCartographic = viewport.unprojectPosition(viewport.cameraPosition);
    const cameraPositionCartesian2 = Ellipsoid.WGS84.cartographicToCartesian(
      cameraPositionCartographic,
      new Vector3()
    );
    const cameraDirectionCartesian = new Vector3(
      // @ts-ignore
      enuToFixedTransform.transformAsVector(new Vector3(cameraDirection).scale(metersPerUnit))
    ).normalize();
    const cameraUpCartesian = new Vector3(
      // @ts-ignore
      enuToFixedTransform.transformAsVector(new Vector3(cameraUp).scale(metersPerUnit))
    ).normalize();
    commonSpacePlanesToWGS84(viewport);
    const ViewportClass = viewport.constructor;
    const { longitude, latitude, width, bearing, zoom } = viewport;
    const topDownViewport = new ViewportClass({
      longitude,
      latitude,
      height,
      width,
      bearing,
      zoom,
      pitch: 0
    });
    return {
      camera: {
        position: cameraPositionCartesian2,
        direction: cameraDirectionCartesian,
        up: cameraUpCartesian
      },
      viewport,
      topDownViewport,
      height,
      cullingVolume,
      frameNumber,
      // TODO: This can be the same between updates, what number is unique for between updates?
      sseDenominator: 1.15
      // Assumes fovy = 60 degrees
    };
  }
  function limitSelectedTiles(tiles, frameState, maximumTilesSelected) {
    if (maximumTilesSelected === 0 || tiles.length <= maximumTilesSelected) {
      return [tiles, []];
    }
    const tuples = [];
    const { longitude: viewportLongitude, latitude: viewportLatitude } = frameState.viewport;
    for (const [index, tile] of tiles.entries()) {
      const [longitude, latitude] = tile.header.mbs;
      const deltaLon = Math.abs(viewportLongitude - longitude);
      const deltaLat = Math.abs(viewportLatitude - latitude);
      const distance2 = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
      tuples.push([index, distance2]);
    }
    const tuplesSorted = tuples.sort((a, b) => a[1] - b[1]);
    const selectedTiles = [];
    for (let i = 0; i < maximumTilesSelected; i++) {
      selectedTiles.push(tiles[tuplesSorted[i][0]]);
    }
    const unselectedTiles = [];
    for (let i = maximumTilesSelected; i < tuplesSorted.length; i++) {
      unselectedTiles.push(tiles[tuplesSorted[i][0]]);
    }
    return [selectedTiles, unselectedTiles];
  }
  function commonSpacePlanesToWGS84(viewport) {
    const frustumPlanes = viewport.getFrustumPlanes();
    const nearCenterCommon = closestPointOnPlane(frustumPlanes.near, viewport.cameraPosition);
    const nearCenterCartesian = worldToCartesian(viewport, nearCenterCommon);
    const cameraCartesian = worldToCartesian(viewport, viewport.cameraPosition, scratchPosition3);
    let i = 0;
    cullingVolume.planes[i++].fromPointNormal(
      nearCenterCartesian,
      scratchVector8.copy(nearCenterCartesian).subtract(cameraCartesian)
    );
    for (const dir in frustumPlanes) {
      if (dir === "near") {
        continue;
      }
      const plane = frustumPlanes[dir];
      const posCommon = closestPointOnPlane(plane, nearCenterCommon, scratchPosition3);
      const cartesianPos = worldToCartesian(viewport, posCommon, scratchPosition3);
      cullingVolume.planes[i++].fromPointNormal(
        cartesianPos,
        // Want the normal to point into the frustum since that's what culling expects
        scratchVector8.copy(nearCenterCartesian).subtract(cartesianPos)
      );
    }
  }
  function closestPointOnPlane(plane, refPoint, out = new Vector3()) {
    const distanceToRef = plane.normal.dot(refPoint);
    out.copy(plane.normal).scale(plane.distance - distanceToRef).add(refPoint);
    return out;
  }
  function worldToCartesian(viewport, point, out = new Vector3()) {
    const cartographicPos = viewport.unprojectPosition(point);
    return Ellipsoid.WGS84.cartographicToCartesian(cartographicPos, out);
  }

  // src/tileset/helpers/zoom.ts
  var WGS84_RADIUS_X2 = 6378137;
  var WGS84_RADIUS_Y2 = 6378137;
  var WGS84_RADIUS_Z2 = 6356752314245179e-9;
  var scratchVector9 = new Vector3();
  function getZoomFromBoundingVolume(boundingVolume, cartorgraphicCenter) {
    if (boundingVolume instanceof OrientedBoundingBox) {
      const { halfAxes } = boundingVolume;
      const obbSize = getObbSize(halfAxes);
      return Math.log2(WGS84_RADIUS_Z2 / (obbSize + cartorgraphicCenter[2]));
    } else if (boundingVolume instanceof BoundingSphere) {
      const { radius } = boundingVolume;
      return Math.log2(WGS84_RADIUS_Z2 / (radius + cartorgraphicCenter[2]));
    } else if (boundingVolume.width && boundingVolume.height) {
      const { width, height } = boundingVolume;
      const zoomX = Math.log2(WGS84_RADIUS_X2 / width);
      const zoomY = Math.log2(WGS84_RADIUS_Y2 / height);
      return (zoomX + zoomY) / 2;
    }
    return 1;
  }
  function getZoomFromFullExtent(fullExtent, cartorgraphicCenter, cartesianCenter) {
    Ellipsoid.WGS84.cartographicToCartesian(
      [fullExtent.xmax, fullExtent.ymax, fullExtent.zmax],
      scratchVector9
    );
    const extentSize = Math.sqrt(
      Math.pow(scratchVector9[0] - cartesianCenter[0], 2) + Math.pow(scratchVector9[1] - cartesianCenter[1], 2) + Math.pow(scratchVector9[2] - cartesianCenter[2], 2)
    );
    return Math.log2(WGS84_RADIUS_Z2 / (extentSize + cartorgraphicCenter[2]));
  }
  function getZoomFromExtent(extent, cartorgraphicCenter, cartesianCenter) {
    const [xmin, ymin, xmax, ymax] = extent;
    return getZoomFromFullExtent(
      { xmin, xmax, ymin, ymax, zmin: 0, zmax: 0 },
      cartorgraphicCenter,
      cartesianCenter
    );
  }
  function getObbSize(halfAxes) {
    halfAxes.getColumn(0, scratchVector9);
    const axeY = halfAxes.getColumn(1);
    const axeZ = halfAxes.getColumn(2);
    const farthestVertex = scratchVector9.add(axeY).add(axeZ);
    const size = farthestVertex.len();
    return size;
  }

  // src/tileset/tile-3d.ts
  var import_core21 = __toESM(require_core(), 1);

  // src/constants.ts
  var TILE_CONTENT_STATE = {
    UNLOADED: 0,
    // Has never been requested
    LOADING: 1,
    // Is waiting on a pending request
    PROCESSING: 2,
    // Request received.  Contents are being processed for rendering.  Depending on the content, it might make its own requests for external data.
    READY: 3,
    // Ready to render.
    EXPIRED: 4,
    // Is expired and will be unloaded once new content is loaded.
    FAILED: 5
    // Request failed.
  };
  var TILE_REFINEMENT = /* @__PURE__ */ ((TILE_REFINEMENT2) => {
    TILE_REFINEMENT2[TILE_REFINEMENT2["ADD"] = 1] = "ADD";
    TILE_REFINEMENT2[TILE_REFINEMENT2["REPLACE"] = 2] = "REPLACE";
    return TILE_REFINEMENT2;
  })(TILE_REFINEMENT || {});
  var TILE_TYPE = /* @__PURE__ */ ((TILE_TYPE2) => {
    TILE_TYPE2["EMPTY"] = "empty";
    TILE_TYPE2["SCENEGRAPH"] = "scenegraph";
    TILE_TYPE2["POINTCLOUD"] = "pointcloud";
    TILE_TYPE2["MESH"] = "mesh";
    return TILE_TYPE2;
  })(TILE_TYPE || {});
  var TILESET_TYPE = /* @__PURE__ */ ((TILESET_TYPE2) => {
    TILESET_TYPE2["I3S"] = "I3S";
    TILESET_TYPE2["TILES3D"] = "TILES3D";
    return TILESET_TYPE2;
  })(TILESET_TYPE || {});
  var LOD_METRIC_TYPE = /* @__PURE__ */ ((LOD_METRIC_TYPE2) => {
    LOD_METRIC_TYPE2["GEOMETRIC_ERROR"] = "geometricError";
    LOD_METRIC_TYPE2["MAX_SCREEN_THRESHOLD"] = "maxScreenThreshold";
    return LOD_METRIC_TYPE2;
  })(LOD_METRIC_TYPE || {});
  var TILE3D_OPTIMIZATION_HINT = {
    NOT_COMPUTED: -1,
    USE_OPTIMIZATION: 1,
    SKIP_OPTIMIZATION: 0
  };

  // src/tileset/helpers/bounding-volume.ts
  function defined(x) {
    return x !== void 0 && x !== null;
  }
  var scratchPoint = new Vector3();
  var scratchScale = new Vector3();
  var scratchNorthWest = new Vector3();
  var scratchSouthEast = new Vector3();
  var scratchCenter = new Vector3();
  var scratchXAxis = new Vector3();
  var scratchYAxis = new Vector3();
  var scratchZAxis = new Vector3();
  function createBoundingVolume(boundingVolumeHeader, transform, result) {
    assert2(boundingVolumeHeader, "3D Tile: boundingVolume must be defined");
    if (boundingVolumeHeader.box) {
      return createBox(boundingVolumeHeader.box, transform, result);
    }
    if (boundingVolumeHeader.region) {
      return createObbFromRegion(boundingVolumeHeader.region);
    }
    if (boundingVolumeHeader.sphere) {
      return createSphere(boundingVolumeHeader.sphere, transform, result);
    }
    throw new Error("3D Tile: boundingVolume must contain a sphere, region, or box");
  }
  function getCartographicBounds(boundingVolumeHeader, boundingVolume) {
    if (boundingVolumeHeader.box) {
      return orientedBoundingBoxToCartographicBounds(boundingVolume);
    }
    if (boundingVolumeHeader.region) {
      const [west, south, east, north, minHeight, maxHeight] = boundingVolumeHeader.region;
      return [
        [degrees(west), degrees(south), minHeight],
        [degrees(east), degrees(north), maxHeight]
      ];
    }
    if (boundingVolumeHeader.sphere) {
      return boundingSphereToCartographicBounds(boundingVolume);
    }
    throw new Error("Unkown boundingVolume type");
  }
  function createBox(box, transform, result) {
    const center = new Vector3(box[0], box[1], box[2]);
    transform.transform(center, center);
    let origin = [];
    if (box.length === 10) {
      const halfSize = box.slice(3, 6);
      const quaternion = new Quaternion();
      quaternion.fromArray(box, 6);
      const x = new Vector3([1, 0, 0]);
      const y = new Vector3([0, 1, 0]);
      const z = new Vector3([0, 0, 1]);
      x.transformByQuaternion(quaternion);
      x.scale(halfSize[0]);
      y.transformByQuaternion(quaternion);
      y.scale(halfSize[1]);
      z.transformByQuaternion(quaternion);
      z.scale(halfSize[2]);
      origin = [...x.toArray(), ...y.toArray(), ...z.toArray()];
    } else {
      origin = [...box.slice(3, 6), ...box.slice(6, 9), ...box.slice(9, 12)];
    }
    const xAxis = transform.transformAsVector(origin.slice(0, 3));
    const yAxis = transform.transformAsVector(origin.slice(3, 6));
    const zAxis = transform.transformAsVector(origin.slice(6, 9));
    const halfAxes = new Matrix3([
      xAxis[0],
      xAxis[1],
      xAxis[2],
      yAxis[0],
      yAxis[1],
      yAxis[2],
      zAxis[0],
      zAxis[1],
      zAxis[2]
    ]);
    if (defined(result)) {
      result.center = center;
      result.halfAxes = halfAxes;
      return result;
    }
    return new OrientedBoundingBox(center, halfAxes);
  }
  function createSphere(sphere, transform, result) {
    const center = new Vector3(sphere[0], sphere[1], sphere[2]);
    transform.transform(center, center);
    const scale6 = transform.getScale(scratchScale);
    const uniformScale = Math.max(Math.max(scale6[0], scale6[1]), scale6[2]);
    const radius = sphere[3] * uniformScale;
    if (defined(result)) {
      result.center = center;
      result.radius = radius;
      return result;
    }
    return new BoundingSphere(center, radius);
  }
  function createObbFromRegion(region) {
    const [west, south, east, north, minHeight, maxHeight] = region;
    const northWest = Ellipsoid.WGS84.cartographicToCartesian(
      [degrees(west), degrees(north), minHeight],
      scratchNorthWest
    );
    const southEast = Ellipsoid.WGS84.cartographicToCartesian(
      [degrees(east), degrees(south), maxHeight],
      scratchSouthEast
    );
    const centerInCartesian = new Vector3().addVectors(northWest, southEast).multiplyByScalar(0.5);
    Ellipsoid.WGS84.cartesianToCartographic(centerInCartesian, scratchCenter);
    Ellipsoid.WGS84.cartographicToCartesian(
      [degrees(east), scratchCenter[1], scratchCenter[2]],
      scratchXAxis
    );
    Ellipsoid.WGS84.cartographicToCartesian(
      [scratchCenter[0], degrees(north), scratchCenter[2]],
      scratchYAxis
    );
    Ellipsoid.WGS84.cartographicToCartesian(
      [scratchCenter[0], scratchCenter[1], maxHeight],
      scratchZAxis
    );
    return createBox(
      [
        ...centerInCartesian,
        ...scratchXAxis.subtract(centerInCartesian),
        ...scratchYAxis.subtract(centerInCartesian),
        ...scratchZAxis.subtract(centerInCartesian)
      ],
      new Matrix4()
    );
  }
  function orientedBoundingBoxToCartographicBounds(boundingVolume) {
    const result = emptyCartographicBounds();
    const { halfAxes } = boundingVolume;
    const xAxis = new Vector3(halfAxes.getColumn(0));
    const yAxis = new Vector3(halfAxes.getColumn(1));
    const zAxis = new Vector3(halfAxes.getColumn(2));
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          scratchPoint.copy(boundingVolume.center);
          scratchPoint.add(xAxis);
          scratchPoint.add(yAxis);
          scratchPoint.add(zAxis);
          addToCartographicBounds(result, scratchPoint);
          zAxis.negate();
        }
        yAxis.negate();
      }
      xAxis.negate();
    }
    return result;
  }
  function boundingSphereToCartographicBounds(boundingVolume) {
    const result = emptyCartographicBounds();
    const { center, radius } = boundingVolume;
    const point = Ellipsoid.WGS84.scaleToGeodeticSurface(center, scratchPoint);
    let zAxis;
    if (point) {
      zAxis = Ellipsoid.WGS84.geodeticSurfaceNormal(point);
    } else {
      zAxis = new Vector3(0, 0, 1);
    }
    let xAxis = new Vector3(zAxis[2], -zAxis[1], 0);
    if (xAxis.len() > 0) {
      xAxis.normalize();
    } else {
      xAxis = new Vector3(0, 1, 0);
    }
    const yAxis = xAxis.clone().cross(zAxis);
    for (const axis of [xAxis, yAxis, zAxis]) {
      scratchScale.copy(axis).scale(radius);
      for (let dir = 0; dir < 2; dir++) {
        scratchPoint.copy(center);
        scratchPoint.add(scratchScale);
        addToCartographicBounds(result, scratchPoint);
        scratchScale.negate();
      }
    }
    return result;
  }
  function emptyCartographicBounds() {
    return [
      [Infinity, Infinity, Infinity],
      [-Infinity, -Infinity, -Infinity]
    ];
  }
  function addToCartographicBounds(target, cartesian) {
    Ellipsoid.WGS84.cartesianToCartographic(cartesian, scratchPoint);
    target[0][0] = Math.min(target[0][0], scratchPoint[0]);
    target[0][1] = Math.min(target[0][1], scratchPoint[1]);
    target[0][2] = Math.min(target[0][2], scratchPoint[2]);
    target[1][0] = Math.max(target[1][0], scratchPoint[0]);
    target[1][1] = Math.max(target[1][1], scratchPoint[1]);
    target[1][2] = Math.max(target[1][2], scratchPoint[2]);
  }

  // src/tileset/helpers/tiles-3d-lod.ts
  var scratchPositionNormal = new Vector3();
  var scratchCartographic = new Vector3();
  var scratchMatrix2 = new Matrix4();
  var scratchCenter2 = new Vector3();
  var scratchPosition4 = new Vector3();
  var scratchDirection = new Vector3();
  function fog(distanceToCamera, density) {
    const scalar = distanceToCamera * density;
    return 1 - Math.exp(-(scalar * scalar));
  }
  function getDynamicScreenSpaceError(tileset, distanceToCamera) {
    if (tileset.dynamicScreenSpaceError && tileset.dynamicScreenSpaceErrorComputedDensity) {
      const density = tileset.dynamicScreenSpaceErrorComputedDensity;
      const factor = tileset.dynamicScreenSpaceErrorFactor;
      const dynamicError = fog(distanceToCamera, density) * factor;
      return dynamicError;
    }
    return 0;
  }
  function getTiles3DScreenSpaceError(tile, frameState, useParentLodMetric) {
    const tileset = tile.tileset;
    const parentLodMetricValue = tile.parent && tile.parent.lodMetricValue || tile.lodMetricValue;
    const lodMetricValue = useParentLodMetric ? parentLodMetricValue : tile.lodMetricValue;
    if (lodMetricValue === 0) {
      return 0;
    }
    const distance2 = Math.max(tile._distanceToCamera, 1e-7);
    const { height, sseDenominator } = frameState;
    const { viewDistanceScale } = tileset.options;
    let error = lodMetricValue * height * (viewDistanceScale || 1) / (distance2 * sseDenominator);
    error -= getDynamicScreenSpaceError(tileset, distance2);
    return error;
  }

  // src/tileset/helpers/i3s-lod.ts
  var cameraPositionCartesian = new Vector3();
  var toEye = new Vector3();
  var cameraPositionEnu = new Vector3();
  var extraVertexEnu = new Vector3();
  var projectedOriginVector = new Vector3();
  var enuToCartesianMatrix = new Matrix4();
  var cartesianToEnuMatrix = new Matrix4();
  function getLodStatus(tile, frameState) {
    if (tile.lodMetricValue === 0 || isNaN(tile.lodMetricValue)) {
      return "DIG";
    }
    const screenSize = 2 * getProjectedRadius(tile, frameState);
    if (screenSize < 2) {
      return "OUT";
    }
    if (!tile.header.children || screenSize <= tile.lodMetricValue) {
      return "DRAW";
    } else if (tile.header.children) {
      return "DIG";
    }
    return "OUT";
  }
  function getProjectedRadius(tile, frameState) {
    const { topDownViewport: viewport } = frameState;
    const mbsLat = tile.header.mbs[1];
    const mbsLon = tile.header.mbs[0];
    const mbsZ = tile.header.mbs[2];
    const mbsR = tile.header.mbs[3];
    const mbsCenterCartesian = [...tile.boundingVolume.center];
    const cameraPositionCartographic = viewport.unprojectPosition(viewport.cameraPosition);
    Ellipsoid.WGS84.cartographicToCartesian(cameraPositionCartographic, cameraPositionCartesian);
    toEye.copy(cameraPositionCartesian).subtract(mbsCenterCartesian).normalize();
    Ellipsoid.WGS84.eastNorthUpToFixedFrame(mbsCenterCartesian, enuToCartesianMatrix);
    cartesianToEnuMatrix.copy(enuToCartesianMatrix).invert();
    cameraPositionEnu.copy(cameraPositionCartesian).transform(cartesianToEnuMatrix);
    const projection = Math.sqrt(
      cameraPositionEnu[0] * cameraPositionEnu[0] + cameraPositionEnu[1] * cameraPositionEnu[1]
    );
    const extraZ = projection * projection / cameraPositionEnu[2];
    extraVertexEnu.copy([cameraPositionEnu[0], cameraPositionEnu[1], extraZ]);
    const extraVertexCartesian = extraVertexEnu.transform(enuToCartesianMatrix);
    const extraVectorCartesian = extraVertexCartesian.subtract(mbsCenterCartesian).normalize();
    const radiusVector = toEye.cross(extraVectorCartesian).normalize().scale(mbsR);
    const sphereMbsBorderVertexCartesian = radiusVector.add(mbsCenterCartesian);
    const sphereMbsBorderVertexCartographic = Ellipsoid.WGS84.cartesianToCartographic(
      sphereMbsBorderVertexCartesian
    );
    const projectedOrigin = viewport.project([mbsLon, mbsLat, mbsZ]);
    const projectedMbsBorderVertex = viewport.project(
      sphereMbsBorderVertexCartographic
    );
    const projectedRadius = projectedOriginVector.copy(projectedOrigin).subtract(projectedMbsBorderVertex).magnitude();
    return projectedRadius;
  }

  // src/tileset/helpers/3d-tiles-options.ts
  function get3dTilesOptions(tileset) {
    return {
      assetGltfUpAxis: tileset.asset && tileset.asset.gltfUpAxis || "Y"
    };
  }

  // src/utils/managed-array.ts
  var ManagedArray = class {
    _map = /* @__PURE__ */ new Map();
    _array;
    _length;
    constructor(length4 = 0) {
      this._array = new Array(length4);
      this._length = length4;
    }
    /**
     * Gets or sets the length of the array.
     * If the set length is greater than the length of the internal array, the internal array is resized.
     *
     * @memberof ManagedArray.prototype
     * @type Number
     */
    get length() {
      return this._length;
    }
    set length(length4) {
      this._length = length4;
      if (length4 > this._array.length) {
        this._array.length = length4;
      }
    }
    /**
     * Gets the internal array.
     *
     * @memberof ManagedArray.prototype
     * @type Array
     * @readonly
     */
    get values() {
      return this._array;
    }
    /**
     * Gets the element at an index.
     *
     * @param {Number} index The index to get.
     */
    get(index) {
      assert2(index < this._array.length);
      return this._array[index];
    }
    /**
     * Sets the element at an index. Resizes the array if index is greater than the length of the array.
     *
     * @param {Number} index The index to set.
     * @param {*} element The element to set at index.
     */
    set(index, element) {
      assert2(index >= 0);
      if (index >= this.length) {
        this.length = index + 1;
      }
      if (this._map.has(this._array[index])) {
        this._map.delete(this._array[index]);
      }
      this._array[index] = element;
      this._map.set(element, index);
    }
    delete(element) {
      const index = this._map.get(element);
      if (index >= 0) {
        this._array.splice(index, 1);
        this._map.delete(element);
        this.length--;
      }
    }
    /**
     * Returns the last element in the array without modifying the array.
     *
     * @returns {*} The last element in the array.
     */
    peek() {
      return this._array[this._length - 1];
    }
    /**
     * Push an element into the array.
     *
     * @param {*} element The element to push.
     */
    push(element) {
      if (!this._map.has(element)) {
        const index = this.length++;
        this._array[index] = element;
        this._map.set(element, index);
      }
    }
    /**
     * Pop an element from the array.
     *
     * @returns {*} The last element in the array.
     */
    pop() {
      const element = this._array[--this.length];
      this._map.delete(element);
      return element;
    }
    /**
     * Resize the internal array if length > _array.length.
     *
     * @param {Number} length The length.
     */
    reserve(length4) {
      assert2(length4 >= 0);
      if (length4 > this._array.length) {
        this._array.length = length4;
      }
    }
    /**
     * Resize the array.
     *
     * @param {Number} length The length.
     */
    resize(length4) {
      assert2(length4 >= 0);
      this.length = length4;
    }
    /**
     * Trim the internal array to the specified length. Defaults to the current length.
     *
     * @param {Number} [length] The length.
     */
    trim(length4) {
      if (length4 === null || length4 === void 0) {
        length4 = this.length;
      }
      this._array.length = length4;
    }
    reset() {
      this._array = [];
      this._map = /* @__PURE__ */ new Map();
      this._length = 0;
    }
    find(target) {
      return this._map.has(target);
    }
  };

  // src/tileset/tileset-traverser.ts
  var DEFAULT_PROPS2 = {
    loadSiblings: false,
    skipLevelOfDetail: false,
    updateTransforms: true,
    onTraversalEnd: () => {
    },
    viewportTraversersMap: {},
    basePath: ""
  };
  var TilesetTraverser = class {
    options;
    // fulfill in traverse call
    root = null;
    // tiles should be rendered
    selectedTiles = {};
    // tiles should be loaded from server
    requestedTiles = {};
    // tiles does not have render content
    emptyTiles = {};
    lastUpdate = new Date().getTime();
    updateDebounceTime = 1e3;
    /** temporary storage to hold the traversed tiles during a traversal */
    _traversalStack = new ManagedArray();
    _emptyTraversalStack = new ManagedArray();
    /** set in every traverse cycle */
    _frameNumber = null;
    // RESULT
    traversalFinished(frameState) {
      return true;
    }
    // TODO nested props
    constructor(options) {
      this.options = { ...DEFAULT_PROPS2, ...options };
    }
    // tiles should be visible
    traverse(root, frameState, options) {
      this.root = root;
      this.options = { ...this.options, ...options };
      this.reset();
      this.updateTile(root, frameState);
      this._frameNumber = frameState.frameNumber;
      this.executeTraversal(root, frameState);
    }
    reset() {
      this.requestedTiles = {};
      this.selectedTiles = {};
      this.emptyTiles = {};
      this._traversalStack.reset();
      this._emptyTraversalStack.reset();
    }
    /**
     * Execute traverse
     * Depth-first traversal that traverses all visible tiles and marks tiles for selection.
     * If skipLevelOfDetail is off then a tile does not refine until all children are loaded.
     * This is the traditional replacement refinement approach and is called the base traversal.
     * Tiles that have a greater screen space error than the base screen space error are part of the base traversal,
     * all other tiles are part of the skip traversal. The skip traversal allows for skipping levels of the tree
     * and rendering children and parent tiles simultaneously.
     */
    /* eslint-disable-next-line complexity, max-statements */
    executeTraversal(root, frameState) {
      const stack = this._traversalStack;
      root._selectionDepth = 1;
      stack.push(root);
      while (stack.length > 0) {
        const tile = stack.pop();
        let shouldRefine = false;
        if (this.canTraverse(tile, frameState)) {
          this.updateChildTiles(tile, frameState);
          shouldRefine = this.updateAndPushChildren(
            tile,
            frameState,
            stack,
            tile.hasRenderContent ? tile._selectionDepth + 1 : tile._selectionDepth
          );
        }
        const parent = tile.parent;
        const parentRefines = Boolean(!parent || parent._shouldRefine);
        const stoppedRefining = !shouldRefine;
        if (!tile.hasRenderContent) {
          this.emptyTiles[tile.id] = tile;
          this.loadTile(tile, frameState);
          if (stoppedRefining) {
            this.selectTile(tile, frameState);
          }
        } else if (tile.refine === 1 /* ADD */) {
          this.loadTile(tile, frameState);
          this.selectTile(tile, frameState);
        } else if (tile.refine === 2 /* REPLACE */) {
          this.loadTile(tile, frameState);
          if (stoppedRefining) {
            this.selectTile(tile, frameState);
          }
        }
        this.touchTile(tile, frameState);
        tile._shouldRefine = shouldRefine && parentRefines;
      }
      const newTime = new Date().getTime();
      if (this.traversalFinished(frameState) || newTime - this.lastUpdate > this.updateDebounceTime) {
        this.lastUpdate = newTime;
        this.options.onTraversalEnd(frameState);
      }
    }
    updateChildTiles(tile, frameState) {
      const children = tile.children;
      for (const child of children) {
        this.updateTile(child, frameState);
      }
    }
    /* eslint-disable complexity, max-statements */
    updateAndPushChildren(tile, frameState, stack, depth) {
      const { loadSiblings, skipLevelOfDetail } = this.options;
      const children = tile.children;
      children.sort(this.compareDistanceToCamera.bind(this));
      const checkRefines = tile.refine === 2 /* REPLACE */ && tile.hasRenderContent && !skipLevelOfDetail;
      let hasVisibleChild = false;
      let refines = true;
      for (const child of children) {
        child._selectionDepth = depth;
        if (child.isVisibleAndInRequestVolume) {
          if (stack.find(child)) {
            stack.delete(child);
          }
          stack.push(child);
          hasVisibleChild = true;
        } else if (checkRefines || loadSiblings) {
          this.loadTile(child, frameState);
          this.touchTile(child, frameState);
        }
        if (checkRefines) {
          let childRefines;
          if (!child._inRequestVolume) {
            childRefines = false;
          } else if (!child.hasRenderContent) {
            childRefines = this.executeEmptyTraversal(child, frameState);
          } else {
            childRefines = child.contentAvailable;
          }
          refines = refines && childRefines;
          if (!refines) {
            return false;
          }
        }
      }
      if (!hasVisibleChild) {
        refines = false;
      }
      return refines;
    }
    /* eslint-enable complexity, max-statements */
    updateTile(tile, frameState) {
      this.updateTileVisibility(tile, frameState);
    }
    // tile to render in the browser
    selectTile(tile, frameState) {
      if (this.shouldSelectTile(tile)) {
        tile._selectedFrame = frameState.frameNumber;
        this.selectedTiles[tile.id] = tile;
      }
    }
    // tile to load from server
    loadTile(tile, frameState) {
      if (this.shouldLoadTile(tile)) {
        tile._requestedFrame = frameState.frameNumber;
        tile._priority = tile._getPriority();
        this.requestedTiles[tile.id] = tile;
      }
    }
    // cache tile
    touchTile(tile, frameState) {
      tile.tileset._cache.touch(tile);
      tile._touchedFrame = frameState.frameNumber;
    }
    // tile should be visible
    // tile should have children
    // tile LoD (level of detail) is not sufficient under current viewport
    canTraverse(tile, frameState) {
      if (!tile.hasChildren) {
        return false;
      }
      if (tile.hasTilesetContent) {
        return !tile.contentExpired;
      }
      return this.shouldRefine(tile, frameState);
    }
    shouldLoadTile(tile) {
      return tile.hasUnloadedContent || tile.contentExpired;
    }
    shouldSelectTile(tile) {
      return tile.contentAvailable && !this.options.skipLevelOfDetail;
    }
    /** Decide if tile LoD (level of detail) is not sufficient under current viewport */
    shouldRefine(tile, frameState, useParentMetric = false) {
      let screenSpaceError = tile._screenSpaceError;
      if (useParentMetric) {
        screenSpaceError = tile.getScreenSpaceError(frameState, true);
      }
      return screenSpaceError > tile.tileset.memoryAdjustedScreenSpaceError;
    }
    updateTileVisibility(tile, frameState) {
      const viewportIds = [];
      if (this.options.viewportTraversersMap) {
        for (const key in this.options.viewportTraversersMap) {
          const value = this.options.viewportTraversersMap[key];
          if (value === frameState.viewport.id) {
            viewportIds.push(key);
          }
        }
      } else {
        viewportIds.push(frameState.viewport.id);
      }
      tile.updateVisibility(frameState, viewportIds);
    }
    // UTILITIES
    compareDistanceToCamera(b, a) {
      return b._distanceToCamera - a._distanceToCamera;
    }
    anyChildrenVisible(tile, frameState) {
      let anyVisible = false;
      for (const child of tile.children) {
        child.updateVisibility(frameState);
        anyVisible = anyVisible || child.isVisibleAndInRequestVolume;
      }
      return anyVisible;
    }
    // Depth-first traversal that checks if all nearest descendants with content are loaded.
    // Ignores visibility.
    executeEmptyTraversal(root, frameState) {
      let allDescendantsLoaded = true;
      const stack = this._emptyTraversalStack;
      stack.push(root);
      while (stack.length > 0) {
        const tile = stack.pop();
        const traverse = !tile.hasRenderContent && this.canTraverse(tile, frameState);
        const emptyLeaf = !tile.hasRenderContent && tile.children.length === 0;
        if (!traverse && !tile.contentAvailable && !emptyLeaf) {
          allDescendantsLoaded = false;
        }
        this.updateTile(tile, frameState);
        if (!tile.isVisibleAndInRequestVolume) {
          this.loadTile(tile, frameState);
          this.touchTile(tile, frameState);
        }
        if (traverse) {
          const children = tile.children;
          for (const child of children) {
            stack.push(child);
          }
        }
      }
      return root.hasEmptyContent || allDescendantsLoaded;
    }
  };

  // src/tileset/tile-3d.ts
  var scratchVector10 = new Vector3();
  function defined2(x) {
    return x !== void 0 && x !== null;
  }
  var Tile3D = class {
    tileset;
    header;
    id;
    url;
    parent;
    /* Specifies the type of refine that is used when traversing this tile for rendering. */
    refine;
    type;
    contentUrl;
    /** Different refinement algorithms used by I3S and 3D tiles */
    lodMetricType = "geometricError";
    /** The error, in meters, introduced if this tile is rendered and its children are not. */
    lodMetricValue = 0;
    /** @todo math.gl is not exporting BoundingVolume base type? */
    boundingVolume = null;
    /**
     * The tile's content.  This represents the actual tile's payload,
     * not the content's metadata in the tileset JSON file.
     */
    content = null;
    contentState = TILE_CONTENT_STATE.UNLOADED;
    gpuMemoryUsageInBytes = 0;
    /** The tile's children - an array of Tile3D objects. */
    children = [];
    depth = 0;
    viewportIds = [];
    transform = new Matrix4();
    extensions = null;
    /** TODO Cesium 3d tiles specific */
    implicitTiling = null;
    /** Container to store application specific data */
    userData = {};
    computedTransform;
    hasEmptyContent = false;
    hasTilesetContent = false;
    traverser = new TilesetTraverser({});
    /** Used by TilesetCache */
    _cacheNode = null;
    _frameNumber = null;
    // TODO Cesium 3d tiles specific
    _expireDate = null;
    _expiredContent = null;
    _boundingBox = void 0;
    /** updated every frame for tree traversal and rendering optimizations: */
    _distanceToCamera = 0;
    _screenSpaceError = 0;
    _visibilityPlaneMask;
    _visible = void 0;
    _contentBoundingVolume;
    _viewerRequestVolume;
    _initialTransform = new Matrix4();
    // Used by traverser, cannot be marked private
    _priority = 0;
    _selectedFrame = 0;
    _requestedFrame = 0;
    _selectionDepth = 0;
    _touchedFrame = 0;
    _centerZDepth = 0;
    _shouldRefine = false;
    _stackLength = 0;
    _visitedFrame = 0;
    _inRequestVolume = false;
    _lodJudge = null;
    // TODO i3s specific, needs to remove
    /**
     * Indicates whether the tile has been drawn by the renderer.
     * Defaults to true for backwards compatibility — renderers that support
     * transition hold (e.g. deck.gl 9.3+) should set this to false on tile load,
     * then back to true after first draw to avoid flashes (see deck.gl #7914).
     */
    tileDrawn = true;
    /**
     * @constructs
     * Create a Tile3D instance
     * @param tileset - Tileset3D instance
     * @param header - tile header - JSON loaded from a dataset
     * @param parentHeader - parent Tile3D instance
     * @param extendedId - optional ID to separate copies of a tile for different viewports.
     *    const extendedId = `${tile.id}-${frameState.viewport.id}`;
     */
    // eslint-disable-next-line max-statements
    constructor(tileset, header, parentHeader, extendedId = "") {
      this.header = header;
      this.tileset = tileset;
      this.id = extendedId || header.id;
      this.url = header.url;
      this.parent = parentHeader;
      this.refine = this._getRefine(header.refine);
      this.type = header.type;
      this.contentUrl = header.contentUrl;
      this._initializeLodMetric(header);
      this._initializeTransforms(header);
      this._initializeBoundingVolumes(header);
      this._initializeContent(header);
      this._initializeRenderingState(header);
      Object.seal(this);
    }
    destroy() {
      this.header = null;
    }
    isDestroyed() {
      return this.header === null;
    }
    get selected() {
      return this._selectedFrame === this.tileset._frameNumber;
    }
    get isVisible() {
      return this._visible;
    }
    get isVisibleAndInRequestVolume() {
      return this._visible && this._inRequestVolume;
    }
    /** Returns true if tile is not an empty tile and not an external tileset */
    get hasRenderContent() {
      return !this.hasEmptyContent && !this.hasTilesetContent;
    }
    /** Returns true if tile has children */
    get hasChildren() {
      return this.children.length > 0 || this.header.children && this.header.children.length > 0;
    }
    /**
     * Determines if the tile's content is ready. This is automatically `true` for
     * tiles with empty content.
     */
    get contentReady() {
      return this.contentState === TILE_CONTENT_STATE.READY || this.hasEmptyContent;
    }
    /**
     * Determines if the tile has available content to render.  `true` if the tile's
     * content is ready or if it has expired content this renders while new content loads; otherwise,
     */
    get contentAvailable() {
      return Boolean(
        this.contentReady && this.hasRenderContent || this._expiredContent && !this.contentFailed
      );
    }
    /** Returns true if tile has renderable content but it's unloaded */
    get hasUnloadedContent() {
      return this.hasRenderContent && this.contentUnloaded;
    }
    /**
     * Determines if the tile's content has not be requested. `true` if tile's
     * content has not be requested; otherwise, `false`.
     */
    get contentUnloaded() {
      return this.contentState === TILE_CONTENT_STATE.UNLOADED;
    }
    /**
     * Determines if the tile's content is expired. `true` if tile's
     * content is expired; otherwise, `false`.
     */
    get contentExpired() {
      return this.contentState === TILE_CONTENT_STATE.EXPIRED;
    }
    // Determines if the tile's content failed to load.  `true` if the tile's
    // content failed to load; otherwise, `false`.
    get contentFailed() {
      return this.contentState === TILE_CONTENT_STATE.FAILED;
    }
    /**
     * Distance from the tile's bounding volume center to the camera
     */
    get distanceToCamera() {
      return this._distanceToCamera;
    }
    /**
     * Screen space error for LOD selection
     */
    get screenSpaceError() {
      return this._screenSpaceError;
    }
    /**
     * Get bounding box in cartographic coordinates
     * @returns [min, max] each in [longitude, latitude, altitude]
     */
    get boundingBox() {
      if (!this._boundingBox) {
        this._boundingBox = getCartographicBounds(this.header.boundingVolume, this.boundingVolume);
      }
      return this._boundingBox;
    }
    /** Get the tile's screen space error. */
    getScreenSpaceError(frameState, useParentLodMetric) {
      switch (this.tileset.type) {
        case "I3S" /* I3S */:
          return getProjectedRadius(this, frameState);
        case "TILES3D" /* TILES3D */:
          return getTiles3DScreenSpaceError(this, frameState, useParentLodMetric);
        default:
          throw new Error("Unsupported tileset type");
      }
    }
    /**
     * Make tile unselected than means it won't be shown
     * but it can be still loaded in memory
     */
    unselect() {
      this._selectedFrame = 0;
    }
    /**
     * Memory usage of tile on GPU
     */
    _getGpuMemoryUsageInBytes() {
      return this.content.gpuMemoryUsageInBytes || this.content.byteLength || 0;
    }
    /*
     * If skipLevelOfDetail is off try to load child tiles as soon as possible so that their parent can refine sooner.
     * Tiles are prioritized by screen space error.
     */
    // eslint-disable-next-line complexity
    _getPriority() {
      const traverser = this.tileset._traverser;
      const { skipLevelOfDetail } = traverser.options;
      const maySkipTile = this.refine === 1 /* ADD */ || skipLevelOfDetail;
      if (maySkipTile && !this.isVisible && this._visible !== void 0) {
        return -1;
      }
      if (this.tileset._frameNumber - this._touchedFrame >= 1) {
        return -1;
      }
      if (this.contentState === TILE_CONTENT_STATE.UNLOADED) {
        return -1;
      }
      const parent = this.parent;
      const useParentScreenSpaceError = parent && (!maySkipTile || this._screenSpaceError === 0 || parent.hasTilesetContent);
      const screenSpaceError = useParentScreenSpaceError ? parent._screenSpaceError : this._screenSpaceError;
      const rootScreenSpaceError = traverser.root ? traverser.root._screenSpaceError : 0;
      return Math.max(rootScreenSpaceError - screenSpaceError, 0);
    }
    /**
     *  Requests the tile's content.
     * The request may not be made if the Request Scheduler can't prioritize it.
     */
    // eslint-disable-next-line max-statements, complexity
    async loadContent() {
      if (this.hasEmptyContent) {
        return false;
      }
      if (this.content) {
        return true;
      }
      const expired = this.contentExpired;
      if (expired) {
        this._expireDate = null;
      }
      this.contentState = TILE_CONTENT_STATE.LOADING;
      const requestToken = await this.tileset._requestScheduler.scheduleRequest(
        this.id,
        this._getPriority.bind(this)
      );
      if (!requestToken) {
        this.contentState = TILE_CONTENT_STATE.UNLOADED;
        return false;
      }
      try {
        const contentUrl = this.tileset.getTileUrl(this.contentUrl);
        const loader = this.tileset.loader;
        const tilesetLoaderOptions = this.tileset.loadOptions[loader.id] || {};
        const options = {
          ...this.tileset.loadOptions,
          [loader.id]: {
            ...tilesetLoaderOptions,
            isTileset: this.type === "json",
            ...this._getLoaderSpecificOptions(loader.id)
          }
          // TODO add typecheck - as const satisfies ...
        };
        this.content = await (0, import_core21.load)(contentUrl, loader, options);
        if (this.tileset.options.contentLoader) {
          await this.tileset.options.contentLoader(this);
        }
        if (this._isTileset()) {
          this.tileset._initializeTileHeaders(this.content, this);
        }
        this.contentState = TILE_CONTENT_STATE.READY;
        this._onContentLoaded();
        return true;
      } catch (error) {
        this.contentState = TILE_CONTENT_STATE.FAILED;
        throw error;
      } finally {
        requestToken.done();
      }
    }
    // Unloads the tile's content.
    unloadContent() {
      if (this.content && this.content.destroy) {
        this.content.destroy();
      }
      this.content = null;
      if (this.header.content && this.header.content.destroy) {
        this.header.content.destroy();
      }
      this.header.content = null;
      this.contentState = TILE_CONTENT_STATE.UNLOADED;
      this.tileDrawn = true;
      return true;
    }
    /**
     * Update the tile's visibility
     * @param {Object} frameState - frame state for tile culling
     * @param {string[]} viewportIds - a list of viewport ids that show this tile
     * @return {void}
     */
    updateVisibility(frameState, viewportIds) {
      if (this._frameNumber === frameState.frameNumber) {
        return;
      }
      const parent = this.parent;
      const parentVisibilityPlaneMask = parent ? parent._visibilityPlaneMask : CullingVolume.MASK_INDETERMINATE;
      if (this.tileset._traverser.options.updateTransforms) {
        const parentTransform = parent ? parent.computedTransform : this.tileset.modelMatrix;
        this._updateTransform(parentTransform);
      }
      this._distanceToCamera = this.distanceToTile(frameState);
      this._screenSpaceError = this.getScreenSpaceError(frameState, false);
      this._visibilityPlaneMask = this.visibility(frameState, parentVisibilityPlaneMask);
      this._visible = this._visibilityPlaneMask !== CullingVolume.MASK_OUTSIDE;
      this._inRequestVolume = this.insideViewerRequestVolume(frameState);
      this._frameNumber = frameState.frameNumber;
      this.viewportIds = viewportIds;
    }
    // Determines whether the tile's bounding volume intersects the culling volume.
    // @param {FrameState} frameState The frame state.
    // @param {Number} parentVisibilityPlaneMask The parent's plane mask to speed up the visibility check.
    // @returns {Number} A plane mask as described above in {@link CullingVolume#computeVisibilityWithPlaneMask}.
    visibility(frameState, parentVisibilityPlaneMask) {
      const { cullingVolume: cullingVolume2 } = frameState;
      const { boundingVolume } = this;
      return cullingVolume2.computeVisibilityWithPlaneMask(boundingVolume, parentVisibilityPlaneMask);
    }
    // Assuming the tile's bounding volume intersects the culling volume, determines
    // whether the tile's content's bounding volume intersects the culling volume.
    // @param {FrameState} frameState The frame state.
    // @returns {Intersect} The result of the intersection: the tile's content is completely outside, completely inside, or intersecting the culling volume.
    contentVisibility() {
      return true;
    }
    /**
     * Computes the (potentially approximate) distance from the closest point of the tile's bounding volume to the camera.
     * @param frameState The frame state.
     * @returns {Number} The distance, in meters, or zero if the camera is inside the bounding volume.
     */
    distanceToTile(frameState) {
      const boundingVolume = this.boundingVolume;
      return Math.sqrt(Math.max(boundingVolume.distanceSquaredTo(frameState.camera.position), 0));
    }
    /**
     * Computes the tile's camera-space z-depth.
     * @param frameState The frame state.
     * @returns The distance, in meters.
     */
    cameraSpaceZDepth({ camera }) {
      const boundingVolume = this.boundingVolume;
      scratchVector10.subVectors(boundingVolume.center, camera.position);
      return camera.direction.dot(scratchVector10);
    }
    /**
     * Checks if the camera is inside the viewer request volume.
     * @param {FrameState} frameState The frame state.
     * @returns {Boolean} Whether the camera is inside the volume.
     */
    insideViewerRequestVolume(frameState) {
      const viewerRequestVolume = this._viewerRequestVolume;
      return !viewerRequestVolume || viewerRequestVolume.distanceSquaredTo(frameState.camera.position) <= 0;
    }
    // TODO Cesium specific
    // Update whether the tile has expired.
    updateExpiration() {
      if (defined2(this._expireDate) && this.contentReady && !this.hasEmptyContent) {
        const now = Date.now();
        if (Date.lessThan(this._expireDate, now)) {
          this.contentState = TILE_CONTENT_STATE.EXPIRED;
          this._expiredContent = this.content;
        }
      }
    }
    get extras() {
      return this.header.extras;
    }
    // INTERNAL METHODS
    _initializeLodMetric(header) {
      if ("lodMetricType" in header) {
        this.lodMetricType = header.lodMetricType;
      } else {
        this.lodMetricType = this.parent && this.parent.lodMetricType || this.tileset.lodMetricType;
        console.warn(`3D Tile: Required prop lodMetricType is undefined. Using parent lodMetricType`);
      }
      if ("lodMetricValue" in header) {
        this.lodMetricValue = header.lodMetricValue;
      } else {
        this.lodMetricValue = this.parent && this.parent.lodMetricValue || this.tileset.lodMetricValue;
        console.warn(
          "3D Tile: Required prop lodMetricValue is undefined. Using parent lodMetricValue"
        );
      }
    }
    _initializeTransforms(tileHeader) {
      this.transform = tileHeader.transform ? new Matrix4(tileHeader.transform) : new Matrix4();
      const parent = this.parent;
      const tileset = this.tileset;
      const parentTransform = parent && parent.computedTransform ? parent.computedTransform.clone() : tileset.modelMatrix.clone();
      this.computedTransform = new Matrix4(parentTransform).multiplyRight(this.transform);
      const parentInitialTransform = parent && parent._initialTransform ? parent._initialTransform.clone() : new Matrix4();
      this._initialTransform = new Matrix4(parentInitialTransform).multiplyRight(this.transform);
    }
    _initializeBoundingVolumes(tileHeader) {
      this._contentBoundingVolume = null;
      this._viewerRequestVolume = null;
      this._updateBoundingVolume(tileHeader);
    }
    _initializeContent(tileHeader) {
      this.content = { _tileset: this.tileset, _tile: this };
      this.hasEmptyContent = true;
      this.contentState = TILE_CONTENT_STATE.UNLOADED;
      this.hasTilesetContent = false;
      if (tileHeader.contentUrl) {
        this.content = null;
        this.hasEmptyContent = false;
      }
    }
    // TODO - remove anything not related to basic visibility detection
    _initializeRenderingState(header) {
      this.depth = header.level || (this.parent ? this.parent.depth + 1 : 0);
      this._shouldRefine = false;
      this._distanceToCamera = 0;
      this._centerZDepth = 0;
      this._screenSpaceError = 0;
      this._visibilityPlaneMask = CullingVolume.MASK_INDETERMINATE;
      this._visible = void 0;
      this._inRequestVolume = false;
      this._stackLength = 0;
      this._selectionDepth = 0;
      this._frameNumber = 0;
      this._touchedFrame = 0;
      this._visitedFrame = 0;
      this._selectedFrame = 0;
      this._requestedFrame = 0;
      this._priority = 0;
    }
    _getRefine(refine) {
      return refine || this.parent && this.parent.refine || 2 /* REPLACE */;
    }
    _isTileset() {
      return this.contentUrl.indexOf(".json") !== -1;
    }
    _onContentLoaded() {
      switch (this.content && this.content.type) {
        case "vctr":
        case "geom":
          this.tileset._traverser.disableSkipLevelOfDetail = true;
          break;
        default:
      }
      if (this._isTileset()) {
        this.hasTilesetContent = true;
      } else {
        this.gpuMemoryUsageInBytes = this._getGpuMemoryUsageInBytes();
      }
    }
    _updateBoundingVolume(header) {
      this.boundingVolume = createBoundingVolume(
        header.boundingVolume,
        this.computedTransform,
        this.boundingVolume
      );
      const content = header.content;
      if (!content) {
        return;
      }
      if (content.boundingVolume) {
        this._contentBoundingVolume = createBoundingVolume(
          content.boundingVolume,
          this.computedTransform,
          this._contentBoundingVolume
        );
      }
      if (header.viewerRequestVolume) {
        this._viewerRequestVolume = createBoundingVolume(
          header.viewerRequestVolume,
          this.computedTransform,
          this._viewerRequestVolume
        );
      }
    }
    // Update the tile's transform. The transform is applied to the tile's bounding volumes.
    _updateTransform(parentTransform = new Matrix4()) {
      const computedTransform = parentTransform.clone().multiplyRight(this.transform);
      const didTransformChange = !computedTransform.equals(this.computedTransform);
      if (!didTransformChange) {
        return;
      }
      this.computedTransform = computedTransform;
      this._updateBoundingVolume(this.header);
    }
    // Get options which are applicable only for the particular loader
    _getLoaderSpecificOptions(loaderId) {
      switch (loaderId) {
        case "i3s":
          return {
            ...this.tileset.options.i3s,
            _tileOptions: {
              attributeUrls: this.header.attributeUrls,
              textureUrl: this.header.textureUrl,
              textureFormat: this.header.textureFormat,
              textureLoaderOptions: this.header.textureLoaderOptions,
              materialDefinition: this.header.materialDefinition,
              isDracoGeometry: this.header.isDracoGeometry,
              mbs: this.header.mbs
            },
            _tilesetOptions: {
              store: this.tileset.tileset.store,
              attributeStorageInfo: this.tileset.tileset.attributeStorageInfo,
              fields: this.tileset.tileset.fields
            },
            isTileHeader: false
          };
        case "3d-tiles":
        case "cesium-ion":
        default:
          return get3dTilesOptions(this.tileset.tileset);
      }
    }
  };

  // src/tileset/format-3d-tiles/tileset-3d-traverser.ts
  var Tileset3DTraverser = class extends TilesetTraverser {
    compareDistanceToCamera(a, b) {
      return b._distanceToCamera === 0 && a._distanceToCamera === 0 ? b._centerZDepth - a._centerZDepth : b._distanceToCamera - a._distanceToCamera;
    }
    updateTileVisibility(tile, frameState) {
      super.updateTileVisibility(tile, frameState);
      if (!tile.isVisibleAndInRequestVolume) {
        return;
      }
      const hasChildren = tile.children.length > 0;
      if (tile.hasTilesetContent && hasChildren) {
        const firstChild = tile.children[0];
        this.updateTileVisibility(firstChild, frameState);
        tile._visible = firstChild._visible;
        return;
      }
      if (this.meetsScreenSpaceErrorEarly(tile, frameState)) {
        tile._visible = false;
        return;
      }
      const replace = tile.refine === 2 /* REPLACE */;
      const useOptimization = tile._optimChildrenWithinParent === TILE3D_OPTIMIZATION_HINT.USE_OPTIMIZATION;
      if (replace && useOptimization && hasChildren) {
        if (!this.anyChildrenVisible(tile, frameState)) {
          tile._visible = false;
          return;
        }
      }
    }
    meetsScreenSpaceErrorEarly(tile, frameState) {
      const { parent } = tile;
      if (!parent || parent.hasTilesetContent || parent.refine !== 1 /* ADD */) {
        return false;
      }
      return !this.shouldRefine(tile, frameState, true);
    }
  };

  // src/tileset/format-i3s/i3s-tileset-traverser.ts
  var import_core22 = __toESM(require_core(), 1);

  // src/tileset/format-i3s/i3s-pending-tiles-register.ts
  var I3SPendingTilesRegister = class {
    frameNumberMap = /* @__PURE__ */ new Map();
    /**
     * Register a new pending tile header for the particular frameNumber
     * @param viewportId
     * @param frameNumber
     */
    register(viewportId, frameNumber) {
      const viewportMap = this.frameNumberMap.get(viewportId) || /* @__PURE__ */ new Map();
      const oldCount = viewportMap.get(frameNumber) || 0;
      viewportMap.set(frameNumber, oldCount + 1);
      this.frameNumberMap.set(viewportId, viewportMap);
    }
    /**
     * Deregister a pending tile header for the particular frameNumber
     * @param viewportId
     * @param frameNumber
     */
    deregister(viewportId, frameNumber) {
      const viewportMap = this.frameNumberMap.get(viewportId);
      if (!viewportMap) {
        return;
      }
      const oldCount = viewportMap.get(frameNumber) || 1;
      viewportMap.set(frameNumber, oldCount - 1);
    }
    /**
     * Check is there are no pending tile headers registered for the particular frameNumber
     * @param viewportId
     * @param frameNumber
     * @returns
     */
    isZero(viewportId, frameNumber) {
      const count = this.frameNumberMap.get(viewportId)?.get(frameNumber) || 0;
      return count === 0;
    }
  };

  // src/tileset/format-i3s/i3s-tile-manager.ts
  var STATUS = {
    REQUESTED: "REQUESTED",
    COMPLETED: "COMPLETED",
    ERROR: "ERROR"
  };
  var I3STileManager = class {
    _statusMap;
    pendingTilesRegister = new I3SPendingTilesRegister();
    constructor() {
      this._statusMap = {};
    }
    /**
     * Add request to map
     * @param request - node metadata request
     * @param key - unique key
     * @param callback - callback after request completed
     * @param frameState - frameState data
     */
    add(request, key, callback, frameState) {
      if (!this._statusMap[key]) {
        const {
          frameNumber,
          viewport: { id }
        } = frameState;
        this._statusMap[key] = { request, callback, key, frameState, status: STATUS.REQUESTED };
        this.pendingTilesRegister.register(id, frameNumber);
        request().then((data) => {
          this._statusMap[key].status = STATUS.COMPLETED;
          const {
            frameNumber: actualFrameNumber,
            viewport: { id: id2 }
          } = this._statusMap[key].frameState;
          this.pendingTilesRegister.deregister(id2, actualFrameNumber);
          this._statusMap[key].callback(data, frameState);
        }).catch((error) => {
          this._statusMap[key].status = STATUS.ERROR;
          const {
            frameNumber: actualFrameNumber,
            viewport: { id: id2 }
          } = this._statusMap[key].frameState;
          this.pendingTilesRegister.deregister(id2, actualFrameNumber);
          callback(error);
        });
      }
    }
    /**
     * Update request if it is still actual for the new frameState
     * @param key - unique key
     * @param frameState - frameState data
     */
    update(key, frameState) {
      if (this._statusMap[key]) {
        const {
          frameNumber,
          viewport: { id }
        } = this._statusMap[key].frameState;
        this.pendingTilesRegister.deregister(id, frameNumber);
        const {
          frameNumber: newFrameNumber,
          viewport: { id: newViewportId }
        } = frameState;
        this.pendingTilesRegister.register(newViewportId, newFrameNumber);
        this._statusMap[key].frameState = frameState;
      }
    }
    /**
     * Find request in the map
     * @param key - unique key
     * @returns
     */
    find(key) {
      return this._statusMap[key];
    }
    /**
     * Check it there are pending tile headers for the particular frameNumber
     * @param viewportId
     * @param frameNumber
     * @returns
     */
    hasPendingTiles(viewportId, frameNumber) {
      return !this.pendingTilesRegister.isZero(viewportId, frameNumber);
    }
  };

  // src/tileset/format-i3s/i3s-tileset-traverser.ts
  var I3STilesetTraverser = class extends TilesetTraverser {
    _tileManager;
    constructor(options) {
      super(options);
      this._tileManager = new I3STileManager();
    }
    /**
     * Check if there are no penging tile header requests,
     * that means the traversal is finished and we can call
     * following-up callbacks.
     */
    traversalFinished(frameState) {
      return !this._tileManager.hasPendingTiles(frameState.viewport.id, this._frameNumber || 0);
    }
    shouldRefine(tile, frameState) {
      tile._lodJudge = getLodStatus(tile, frameState);
      return tile._lodJudge === "DIG";
    }
    updateChildTiles(tile, frameState) {
      const children = tile.header.children || [];
      const childTiles = tile.children;
      const tileset = tile.tileset;
      for (const child of children) {
        const extendedId = `${child.id}-${frameState.viewport.id}`;
        const childTile = childTiles && childTiles.find((t) => t.id === extendedId);
        if (!childTile) {
          let request = () => this._loadTile(child.id, tileset);
          const cachedRequest = this._tileManager.find(extendedId);
          if (!cachedRequest) {
            if (tileset.tileset.nodePages) {
              request = () => tileset.tileset.nodePagesTile.formTileFromNodePages(child.id);
            }
            this._tileManager.add(
              request,
              extendedId,
              (header) => this._onTileLoad(header, tile, extendedId),
              frameState
            );
          } else {
            this._tileManager.update(extendedId, frameState);
          }
        } else if (childTile) {
          this.updateTile(childTile, frameState);
        }
      }
      return false;
    }
    async _loadTile(nodeId, tileset) {
      const { loader } = tileset;
      const nodeUrl = tileset.getTileUrl(`${tileset.url}/nodes/${nodeId}`);
      const options = {
        ...tileset.loadOptions,
        i3s: {
          ...tileset.loadOptions.i3s,
          isTileHeader: true
        }
      };
      return await (0, import_core22.load)(nodeUrl, loader, options);
    }
    /**
     * The callback to init Tile3D instance after loading the tile JSON
     * @param {Object} header - the tile JSON from a dataset
     * @param {Tile3D} tile - the parent Tile3D instance
     * @param {string} extendedId - optional ID to separate copies of a tile for different viewports.
     *                              const extendedId = `${tile.id}-${frameState.viewport.id}`;
     * @return {void}
     */
    _onTileLoad(header, tile, extendedId) {
      const childTile = new Tile3D(tile.tileset, header, tile, extendedId);
      tile.children.push(childTile);
      const frameState = this._tileManager.find(childTile.id).frameState;
      this.updateTile(childTile, frameState);
      if (this._frameNumber === frameState.frameNumber && (this.traversalFinished(frameState) || new Date().getTime() - this.lastUpdate > this.updateDebounceTime)) {
        this.executeTraversal(childTile, frameState);
      }
    }
  };

  // src/tileset/tileset-3d.ts
  var DEFAULT_PROPS3 = {
    description: "",
    ellipsoid: Ellipsoid.WGS84,
    modelMatrix: new Matrix4(),
    throttleRequests: true,
    maxRequests: 64,
    /** Default memory values optimized for viewing mesh-based 3D Tiles on both mobile and desktop devices */
    maximumMemoryUsage: 32,
    memoryCacheOverflow: 1,
    maximumTilesSelected: 0,
    debounceTime: 0,
    onTileLoad: () => {
    },
    onTileUnload: () => {
    },
    onTileError: () => {
    },
    onTraversalComplete: (selectedTiles) => selectedTiles,
    onUpdate: () => {
    },
    contentLoader: void 0,
    viewDistanceScale: 1,
    maximumScreenSpaceError: 8,
    memoryAdjustedScreenSpaceError: false,
    loadTiles: true,
    updateTransforms: true,
    viewportTraversersMap: null,
    loadOptions: { fetch: {} },
    attributions: [],
    basePath: "",
    i3s: {}
  };
  var TILES_TOTAL = "Tiles In Tileset(s)";
  var TILES_IN_MEMORY = "Tiles In Memory";
  var TILES_IN_VIEW = "Tiles In View";
  var TILES_RENDERABLE = "Tiles To Render";
  var TILES_LOADED = "Tiles Loaded";
  var TILES_LOADING = "Tiles Loading";
  var TILES_UNLOADED = "Tiles Unloaded";
  var TILES_LOAD_FAILED = "Failed Tile Loads";
  var POINTS_COUNT = "Points/Vertices";
  var TILES_GPU_MEMORY = "Tile Memory Use";
  var MAXIMUM_SSE = "Maximum Screen Space Error";
  var Tileset3D = class {
    // props: Tileset3DProps;
    options;
    loadOptions;
    type;
    tileset;
    loader;
    url;
    basePath;
    modelMatrix;
    ellipsoid;
    lodMetricType;
    lodMetricValue;
    refine;
    root = null;
    roots = {};
    /** @todo any->unknown */
    asset = {};
    // Metadata for the entire tileset
    description = "";
    properties;
    extras = null;
    attributions = {};
    credits = {};
    stats;
    /** flags that contain information about data types in nested tiles */
    contentFormats = { draco: false, meshopt: false, dds: false, ktx2: false };
    // view props
    cartographicCenter = null;
    cartesianCenter = null;
    zoom = 1;
    boundingVolume = null;
    /** Updated based on the camera position and direction */
    dynamicScreenSpaceErrorComputedDensity = 0;
    // METRICS
    /**
     * The maximum amount of GPU memory (in MB) that may be used to cache tiles
     * Tiles not in view are unloaded to enforce private
     */
    maximumMemoryUsage = 32;
    /** The total amount of GPU memory in bytes used by the tileset. */
    gpuMemoryUsageInBytes = 0;
    /**
     * If loading the level of detail required by maximumScreenSpaceError
     * results in the memory usage exceeding maximumMemoryUsage (GPU), level of detail refinement
     * will instead use this (larger) adjusted screen space error to achieve the
     * best possible visual quality within the available memory.
     */
    memoryAdjustedScreenSpaceError = 0;
    _cacheBytes = 0;
    _cacheOverflowBytes = 0;
    /** Update tracker. increase in each update cycle. */
    _frameNumber = 0;
    _queryParams = {};
    _extensionsUsed = [];
    _tiles = {};
    /** counter for tracking tiles requests */
    _pendingCount = 0;
    /** Hold traversal results */
    selectedTiles = [];
    // TRAVERSAL
    traverseCounter = 0;
    geometricError = 0;
    lastUpdatedVieports = null;
    _requestedTiles = [];
    _emptyTiles = [];
    frameStateData = {};
    _traverser;
    _cache = new TilesetCache();
    _requestScheduler;
    /** Tile IDs held visible during transitions until replacements have drawn */
    _heldTiles = /* @__PURE__ */ new Set();
    // Promise tracking
    updatePromise = null;
    tilesetInitializationPromise;
    /**
     * Create a new Tileset3D
     * @param json
     * @param props
     */
    // eslint-disable-next-line max-statements
    constructor(tileset, options) {
      this.options = { ...DEFAULT_PROPS3, ...options };
      this.tileset = tileset;
      this.loader = tileset.loader;
      this.type = tileset.type;
      this.url = tileset.url;
      this.basePath = tileset.basePath || path_exports.dirname(this.url);
      this.modelMatrix = this.options.modelMatrix;
      this.ellipsoid = this.options.ellipsoid;
      this.lodMetricType = tileset.lodMetricType;
      this.lodMetricValue = tileset.lodMetricValue;
      this.refine = tileset.root.refine;
      this.loadOptions = this.options.loadOptions || {};
      this._traverser = this._initializeTraverser();
      this._requestScheduler = new RequestScheduler({
        throttleRequests: this.options.throttleRequests,
        maxRequests: this.options.maxRequests
      });
      this.memoryAdjustedScreenSpaceError = this.options.maximumScreenSpaceError;
      this._cacheBytes = this.options.maximumMemoryUsage * 1024 * 1024;
      this._cacheOverflowBytes = this.options.memoryCacheOverflow * 1024 * 1024;
      this.stats = new Stats({ id: this.url });
      this._initializeStats();
      this.tilesetInitializationPromise = this._initializeTileSet(tileset);
    }
    /** Release resources */
    destroy() {
      this._destroy();
    }
    /** Is the tileset loaded (update needs to have been called at least once) */
    isLoaded() {
      return this._pendingCount === 0 && this._frameNumber !== 0 && this._requestedTiles.length === 0;
    }
    get tiles() {
      return Object.values(this._tiles);
    }
    get frameNumber() {
      return this._frameNumber;
    }
    get queryParams() {
      return new URLSearchParams(this._queryParams).toString();
    }
    setProps(props) {
      this.options = { ...this.options, ...props };
    }
    /** @deprecated */
    // setOptions(options: Tileset3DProps): void {
    //   this.options = {...this.options, ...options};
    // }
    /**
     * Return a loadable tile url for a specific tile subpath
     * @param tilePath a tile subpath
     */
    getTileUrl(tilePath) {
      const isDataUrl = tilePath.startsWith("data:");
      if (isDataUrl) {
        return tilePath;
      }
      let tileUrl = tilePath;
      if (this.queryParams.length) {
        tileUrl = `${tilePath}${tilePath.includes("?") ? "&" : "?"}${this.queryParams}`;
      }
      return tileUrl;
    }
    // TODO CESIUM specific
    hasExtension(extensionName) {
      return Boolean(this._extensionsUsed.indexOf(extensionName) > -1);
    }
    /**
     * Update visible tiles relying on a list of viewports
     * @param viewports - list of viewports
     * @deprecated
     */
    update(viewports = null) {
      this.tilesetInitializationPromise.then(() => {
        if (!viewports && this.lastUpdatedVieports) {
          viewports = this.lastUpdatedVieports;
        } else {
          this.lastUpdatedVieports = viewports;
        }
        if (viewports) {
          this.doUpdate(viewports);
        }
      });
    }
    /**
     * Update visible tiles relying on a list of viewports.
     * Do it with debounce delay to prevent update spam
     * @param viewports viewports
     * @returns Promise of new frameNumber
     */
    async selectTiles(viewports = null) {
      await this.tilesetInitializationPromise;
      if (viewports) {
        this.lastUpdatedVieports = viewports;
      }
      if (!this.updatePromise) {
        this.updatePromise = new Promise((resolve2) => {
          setTimeout(() => {
            if (this.lastUpdatedVieports) {
              this.doUpdate(this.lastUpdatedVieports);
            }
            resolve2(this._frameNumber);
            this.updatePromise = null;
          }, this.options.debounceTime);
        });
      }
      return this.updatePromise;
    }
    adjustScreenSpaceError() {
      if (this.gpuMemoryUsageInBytes < this._cacheBytes) {
        this.memoryAdjustedScreenSpaceError = Math.max(
          this.memoryAdjustedScreenSpaceError / 1.02,
          this.options.maximumScreenSpaceError
        );
      } else if (this.gpuMemoryUsageInBytes > this._cacheBytes + this._cacheOverflowBytes) {
        this.memoryAdjustedScreenSpaceError *= 1.02;
      }
    }
    /**
     * Update visible tiles relying on a list of viewports
     * @param viewports viewports
     */
    // eslint-disable-next-line max-statements, complexity
    doUpdate(viewports) {
      if ("loadTiles" in this.options && !this.options.loadTiles) {
        return;
      }
      if (this.traverseCounter > 0) {
        return;
      }
      const preparedViewports = viewports instanceof Array ? viewports : [viewports];
      this._cache.reset();
      this._frameNumber++;
      this.traverseCounter = preparedViewports.length;
      const viewportsToTraverse = [];
      for (const viewport of preparedViewports) {
        const id = viewport.id;
        if (this._needTraverse(id)) {
          viewportsToTraverse.push(id);
        } else {
          this.traverseCounter--;
        }
      }
      for (const viewport of preparedViewports) {
        const id = viewport.id;
        if (!this.roots[id]) {
          this.roots[id] = this._initializeTileHeaders(this.tileset, null);
        }
        if (!viewportsToTraverse.includes(id)) {
          continue;
        }
        const frameState = getFrameState(viewport, this._frameNumber);
        this._traverser.traverse(this.roots[id], frameState, this.options);
      }
    }
    /**
     * Check if traversal is needed for particular viewport
     * @param {string} viewportId - id of a viewport
     * @return {boolean}
     */
    _needTraverse(viewportId) {
      let traverserId = viewportId;
      if (this.options.viewportTraversersMap) {
        traverserId = this.options.viewportTraversersMap[viewportId];
      }
      if (traverserId !== viewportId) {
        return false;
      }
      return true;
    }
    /**
     * The callback to post-process tiles after traversal procedure
     * @param frameState - frame state for tile culling
     */
    _onTraversalEnd(frameState) {
      const id = frameState.viewport.id;
      if (!this.frameStateData[id]) {
        this.frameStateData[id] = { selectedTiles: [], _requestedTiles: [], _emptyTiles: [] };
      }
      const currentFrameStateData = this.frameStateData[id];
      const selectedTiles = Object.values(this._traverser.selectedTiles);
      const [filteredSelectedTiles, unselectedTiles] = limitSelectedTiles(
        selectedTiles,
        frameState,
        this.options.maximumTilesSelected
      );
      currentFrameStateData.selectedTiles = filteredSelectedTiles;
      for (const tile of unselectedTiles) {
        tile.unselect();
      }
      currentFrameStateData._requestedTiles = Object.values(this._traverser.requestedTiles);
      currentFrameStateData._emptyTiles = Object.values(this._traverser.emptyTiles);
      this.traverseCounter--;
      if (this.traverseCounter > 0) {
        return;
      }
      this._updateTiles();
    }
    /**
     * Update tiles relying on data from all traversers
     */
    _updateTiles() {
      const previousSelectedTiles = this.selectedTiles;
      this.selectedTiles = [];
      this._requestedTiles = [];
      this._emptyTiles = [];
      for (const frameStateKey in this.frameStateData) {
        const frameStateDataValue = this.frameStateData[frameStateKey];
        this.selectedTiles = this.selectedTiles.concat(frameStateDataValue.selectedTiles);
        this._requestedTiles = this._requestedTiles.concat(frameStateDataValue._requestedTiles);
        this._emptyTiles = this._emptyTiles.concat(frameStateDataValue._emptyTiles);
      }
      this.selectedTiles = this.options.onTraversalComplete(this.selectedTiles);
      const selectedIds = new Set(this.selectedTiles.map((t) => t.id));
      const hasUndrawnTiles = this.selectedTiles.some((t) => !t.tileDrawn);
      let heldBackCount = 0;
      if (hasUndrawnTiles) {
        for (const tileId of selectedIds) {
          this._heldTiles.add(tileId);
        }
        for (const tileId of this._heldTiles) {
          if (selectedIds.has(tileId))
            continue;
          const tile = this._tiles[tileId];
          if (tile && tile.contentAvailable) {
            tile._selectedFrame = this._frameNumber;
            this.selectedTiles.push(tile);
            heldBackCount++;
          } else {
            this._heldTiles.delete(tileId);
          }
        }
      } else {
        this._heldTiles = selectedIds;
      }
      if (heldBackCount > 0) {
        setTimeout(() => {
          this.selectTiles();
        }, 0);
      }
      for (const tile of this.selectedTiles) {
        this._tiles[tile.id] = tile;
      }
      this._loadTiles();
      this._unloadTiles();
      this._updateStats();
      if (this._tilesChanged(previousSelectedTiles, this.selectedTiles)) {
        this.options.onUpdate();
      }
    }
    _tilesChanged(oldSelectedTiles, selectedTiles) {
      if (oldSelectedTiles.length !== selectedTiles.length) {
        return true;
      }
      const set1 = new Set(oldSelectedTiles.map((t) => t.id));
      const set22 = new Set(selectedTiles.map((t) => t.id));
      let changed = oldSelectedTiles.filter((x) => !set22.has(x.id)).length > 0;
      changed = changed || selectedTiles.filter((x) => !set1.has(x.id)).length > 0;
      return changed;
    }
    _loadTiles() {
      this._requestedTiles.sort((a, b) => a._priority - b._priority);
      for (const tile of this._requestedTiles) {
        if (tile.contentUnloaded) {
          this._loadTile(tile);
        }
      }
    }
    _unloadTiles() {
      this._cache.unloadTiles(this, (tileset, tile) => tileset._unloadTile(tile));
    }
    _updateStats() {
      let tilesRenderable = 0;
      let pointsRenderable = 0;
      for (const tile of this.selectedTiles) {
        if (tile.contentAvailable && tile.content) {
          tilesRenderable++;
          if (tile.content.pointCount) {
            pointsRenderable += tile.content.pointCount;
          } else {
            pointsRenderable += tile.content.vertexCount;
          }
        }
      }
      this.stats.get(TILES_IN_VIEW).count = this.selectedTiles.length;
      this.stats.get(TILES_RENDERABLE).count = tilesRenderable;
      this.stats.get(POINTS_COUNT).count = pointsRenderable;
      this.stats.get(MAXIMUM_SSE).count = this.memoryAdjustedScreenSpaceError;
    }
    async _initializeTileSet(tilesetJson) {
      if (this.type === "I3S" /* I3S */) {
        this.calculateViewPropsI3S();
        tilesetJson.root = await tilesetJson.root;
      }
      this.root = this._initializeTileHeaders(tilesetJson, null);
      if (this.type === "TILES3D" /* TILES3D */) {
        this._initializeTiles3DTileset(tilesetJson);
        this.calculateViewPropsTiles3D();
      }
      if (this.type === "I3S" /* I3S */) {
        this._initializeI3STileset();
      }
    }
    /**
     * Called during initialize Tileset to initialize the tileset's cartographic center (longitude, latitude) and zoom.
     * These metrics help apps center view on tileset
     * For I3S there is extent (<1.8 version) or fullExtent (>=1.8 version) to calculate view props
     * @returns
     */
    calculateViewPropsI3S() {
      const fullExtent = this.tileset.fullExtent;
      if (fullExtent) {
        const { xmin, xmax, ymin, ymax, zmin, zmax } = fullExtent;
        this.cartographicCenter = new Vector3(
          xmin + (xmax - xmin) / 2,
          ymin + (ymax - ymin) / 2,
          zmin + (zmax - zmin) / 2
        );
        this.cartesianCenter = new Vector3();
        Ellipsoid.WGS84.cartographicToCartesian(this.cartographicCenter, this.cartesianCenter);
        this.zoom = getZoomFromFullExtent(fullExtent, this.cartographicCenter, this.cartesianCenter);
        return;
      }
      const extent = this.tileset.store?.extent;
      if (extent) {
        const [xmin, ymin, xmax, ymax] = extent;
        this.cartographicCenter = new Vector3(xmin + (xmax - xmin) / 2, ymin + (ymax - ymin) / 2, 0);
        this.cartesianCenter = new Vector3();
        Ellipsoid.WGS84.cartographicToCartesian(this.cartographicCenter, this.cartesianCenter);
        this.zoom = getZoomFromExtent(extent, this.cartographicCenter, this.cartesianCenter);
        return;
      }
      console.warn("Extent is not defined in the tileset header");
      this.cartographicCenter = new Vector3();
      this.zoom = 1;
      return;
    }
    /**
     * Called during initialize Tileset to initialize the tileset's cartographic center (longitude, latitude) and zoom.
     * These metrics help apps center view on tileset.
     * For 3DTiles the root tile data is used to calculate view props.
     * @returns
     */
    calculateViewPropsTiles3D() {
      const root = this.root;
      const { center } = root.boundingVolume;
      if (!center) {
        console.warn("center was not pre-calculated for the root tile");
        this.cartographicCenter = new Vector3();
        this.zoom = 1;
        return;
      }
      if (center[0] !== 0 || center[1] !== 0 || center[2] !== 0) {
        this.cartographicCenter = new Vector3();
        Ellipsoid.WGS84.cartesianToCartographic(center, this.cartographicCenter);
      } else {
        this.cartographicCenter = new Vector3(0, 0, -Ellipsoid.WGS84.radii[0]);
      }
      this.cartesianCenter = center;
      this.zoom = getZoomFromBoundingVolume(root.boundingVolume, this.cartographicCenter);
    }
    _initializeStats() {
      this.stats.get(TILES_TOTAL);
      this.stats.get(TILES_LOADING);
      this.stats.get(TILES_IN_MEMORY);
      this.stats.get(TILES_IN_VIEW);
      this.stats.get(TILES_RENDERABLE);
      this.stats.get(TILES_LOADED);
      this.stats.get(TILES_UNLOADED);
      this.stats.get(TILES_LOAD_FAILED);
      this.stats.get(POINTS_COUNT);
      this.stats.get(TILES_GPU_MEMORY, "memory");
      this.stats.get(MAXIMUM_SSE);
    }
    // Installs the main tileset JSON file or a tileset JSON file referenced from a tile.
    // eslint-disable-next-line max-statements
    _initializeTileHeaders(tilesetJson, parentTileHeader) {
      const rootTile = new Tile3D(this, tilesetJson.root, parentTileHeader);
      if (parentTileHeader) {
        parentTileHeader.children.push(rootTile);
        rootTile.depth = parentTileHeader.depth + 1;
      }
      if (this.type === "TILES3D" /* TILES3D */) {
        const stack = [];
        stack.push(rootTile);
        while (stack.length > 0) {
          const tile = stack.pop();
          this.stats.get(TILES_TOTAL).incrementCount();
          const children = tile.header.children || [];
          for (const childHeader of children) {
            const childTile = new Tile3D(this, childHeader, tile);
            if (childTile.contentUrl?.includes("?session=")) {
              const url = new URL(childTile.contentUrl);
              const session = url.searchParams.get("session");
              if (session) {
                this._queryParams.session = session;
              }
            }
            tile.children.push(childTile);
            childTile.depth = tile.depth + 1;
            stack.push(childTile);
          }
        }
      }
      return rootTile;
    }
    _initializeTraverser() {
      let TraverserClass;
      const type = this.type;
      switch (type) {
        case "TILES3D" /* TILES3D */:
          TraverserClass = Tileset3DTraverser;
          break;
        case "I3S" /* I3S */:
          TraverserClass = I3STilesetTraverser;
          break;
        default:
          TraverserClass = TilesetTraverser;
      }
      return new TraverserClass({
        basePath: this.basePath,
        onTraversalEnd: this._onTraversalEnd.bind(this)
      });
    }
    _destroyTileHeaders(parentTile) {
      this._destroySubtree(parentTile);
    }
    async _loadTile(tile) {
      let loaded;
      try {
        this._onStartTileLoading();
        loaded = await tile.loadContent();
      } catch (error) {
        this._onTileLoadError(tile, error instanceof Error ? error : new Error("load failed"));
      } finally {
        this._onEndTileLoading();
        this._onTileLoad(tile, loaded);
      }
    }
    _onTileLoadError(tile, error) {
      this.stats.get(TILES_LOAD_FAILED).incrementCount();
      const message = error.message || error.toString();
      const url = tile.url;
      console.error(`A 3D tile failed to load: ${tile.url} ${message}`);
      this.options.onTileError(tile, message, url);
    }
    _onTileLoad(tile, loaded) {
      if (!loaded) {
        return;
      }
      if (this.type === "I3S" /* I3S */) {
        const nodesInNodePages = this.tileset?.nodePagesTile?.nodesInNodePages || 0;
        this.stats.get(TILES_TOTAL).reset();
        this.stats.get(TILES_TOTAL).addCount(nodesInNodePages);
      }
      if (tile && tile.content) {
        calculateTransformProps(tile, tile.content);
      }
      this.updateContentTypes(tile);
      this._addTileToCache(tile);
      this.options.onTileLoad(tile);
    }
    /**
     * Update information about data types in nested tiles
     * @param tile instance of a nested Tile3D
     */
    updateContentTypes(tile) {
      if (this.type === "I3S" /* I3S */) {
        if (tile.header.isDracoGeometry) {
          this.contentFormats.draco = true;
        }
        switch (tile.header.textureFormat) {
          case "dds":
            this.contentFormats.dds = true;
            break;
          case "ktx2":
            this.contentFormats.ktx2 = true;
            break;
          default:
        }
      } else if (this.type === "TILES3D" /* TILES3D */) {
        const { extensionsRemoved = [] } = tile.content?.gltf || {};
        if (extensionsRemoved.includes("KHR_draco_mesh_compression")) {
          this.contentFormats.draco = true;
        }
        if (extensionsRemoved.includes("EXT_meshopt_compression")) {
          this.contentFormats.meshopt = true;
        }
        if (extensionsRemoved.includes("KHR_texture_basisu")) {
          this.contentFormats.ktx2 = true;
        }
      }
    }
    _onStartTileLoading() {
      this._pendingCount++;
      this.stats.get(TILES_LOADING).incrementCount();
    }
    _onEndTileLoading() {
      this._pendingCount--;
      this.stats.get(TILES_LOADING).decrementCount();
    }
    _addTileToCache(tile) {
      this._cache.add(this, tile, (tileset) => tileset._updateCacheStats(tile));
    }
    _updateCacheStats(tile) {
      this.stats.get(TILES_LOADED).incrementCount();
      this.stats.get(TILES_IN_MEMORY).incrementCount();
      this.gpuMemoryUsageInBytes += tile.gpuMemoryUsageInBytes || 0;
      this.stats.get(TILES_GPU_MEMORY).count = this.gpuMemoryUsageInBytes;
      if (this.options.memoryAdjustedScreenSpaceError) {
        this.adjustScreenSpaceError();
      }
    }
    _unloadTile(tile) {
      this.gpuMemoryUsageInBytes -= tile.gpuMemoryUsageInBytes || 0;
      this.stats.get(TILES_IN_MEMORY).decrementCount();
      this.stats.get(TILES_UNLOADED).incrementCount();
      this.stats.get(TILES_GPU_MEMORY).count = this.gpuMemoryUsageInBytes;
      this.options.onTileUnload(tile);
      tile.unloadContent();
    }
    // Traverse the tree and destroy all tiles
    _destroy() {
      const stack = [];
      if (this.root) {
        stack.push(this.root);
      }
      while (stack.length > 0) {
        const tile = stack.pop();
        for (const child of tile.children) {
          stack.push(child);
        }
        this._destroyTile(tile);
      }
      this.root = null;
    }
    // Traverse the tree and destroy all sub tiles
    _destroySubtree(tile) {
      const root = tile;
      const stack = [];
      stack.push(root);
      while (stack.length > 0) {
        tile = stack.pop();
        for (const child of tile.children) {
          stack.push(child);
        }
        if (tile !== root) {
          this._destroyTile(tile);
        }
      }
      root.children = [];
    }
    _destroyTile(tile) {
      this._cache.unloadTile(this, tile);
      this._unloadTile(tile);
      tile.destroy();
    }
    _initializeTiles3DTileset(tilesetJson) {
      if (tilesetJson.queryString) {
        const searchParams = new URLSearchParams(tilesetJson.queryString);
        const queryParams = Object.fromEntries(searchParams.entries());
        this._queryParams = { ...this._queryParams, ...queryParams };
      }
      this.asset = tilesetJson.asset;
      if (!this.asset) {
        throw new Error("Tileset must have an asset property.");
      }
      if (this.asset.version !== "0.0" && this.asset.version !== "1.0" && this.asset.version !== "1.1") {
        throw new Error("The tileset must be 3D Tiles version either 0.0 or 1.0 or 1.1.");
      }
      if ("tilesetVersion" in this.asset) {
        this._queryParams.v = this.asset.tilesetVersion;
      }
      this.credits = {
        attributions: this.options.attributions || []
      };
      this.description = this.options.description || "";
      this.properties = tilesetJson.properties;
      this.geometricError = tilesetJson.geometricError;
      this._extensionsUsed = tilesetJson.extensionsUsed || [];
      this.extras = tilesetJson.extras;
    }
    _initializeI3STileset() {
      const i3sOptions = this.loadOptions.i3s;
      if (i3sOptions && typeof i3sOptions === "object" && "token" in i3sOptions) {
        this._queryParams.token = i3sOptions.token;
      }
    }
  };
  return __toCommonJS(bundle_exports);
})();
      return __exports__;
      });
