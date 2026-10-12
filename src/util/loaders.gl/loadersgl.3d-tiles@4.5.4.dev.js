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
    for (var name14 in all)
      __defProp(target, name14, { get: all[name14], enumerable: true });
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

  // ../../node_modules/pako/lib/utils/common.js
  var require_common = __commonJS({
    "../../node_modules/pako/lib/utils/common.js"(exports) {
      "use strict";
      var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
      function _has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      }
      exports.assign = function(obj) {
        var sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
          var source = sources.shift();
          if (!source) {
            continue;
          }
          if (typeof source !== "object") {
            throw new TypeError(source + "must be non-object");
          }
          for (var p in source) {
            if (_has(source, p)) {
              obj[p] = source[p];
            }
          }
        }
        return obj;
      };
      exports.shrinkBuf = function(buf, size) {
        if (buf.length === size) {
          return buf;
        }
        if (buf.subarray) {
          return buf.subarray(0, size);
        }
        buf.length = size;
        return buf;
      };
      var fnTyped = {
        arraySet: function(dest, src, src_offs, len2, dest_offs) {
          if (src.subarray && dest.subarray) {
            dest.set(src.subarray(src_offs, src_offs + len2), dest_offs);
            return;
          }
          for (var i = 0; i < len2; i++) {
            dest[dest_offs + i] = src[src_offs + i];
          }
        },
        // Join array of chunks to single array.
        flattenChunks: function(chunks) {
          var i, l, len2, pos, chunk, result;
          len2 = 0;
          for (i = 0, l = chunks.length; i < l; i++) {
            len2 += chunks[i].length;
          }
          result = new Uint8Array(len2);
          pos = 0;
          for (i = 0, l = chunks.length; i < l; i++) {
            chunk = chunks[i];
            result.set(chunk, pos);
            pos += chunk.length;
          }
          return result;
        }
      };
      var fnUntyped = {
        arraySet: function(dest, src, src_offs, len2, dest_offs) {
          for (var i = 0; i < len2; i++) {
            dest[dest_offs + i] = src[src_offs + i];
          }
        },
        // Join array of chunks to single array.
        flattenChunks: function(chunks) {
          return [].concat.apply([], chunks);
        }
      };
      exports.setTyped = function(on) {
        if (on) {
          exports.Buf8 = Uint8Array;
          exports.Buf16 = Uint16Array;
          exports.Buf32 = Int32Array;
          exports.assign(exports, fnTyped);
        } else {
          exports.Buf8 = Array;
          exports.Buf16 = Array;
          exports.Buf32 = Array;
          exports.assign(exports, fnUntyped);
        }
      };
      exports.setTyped(TYPED_OK);
    }
  });

  // ../../node_modules/pako/lib/zlib/trees.js
  var require_trees = __commonJS({
    "../../node_modules/pako/lib/zlib/trees.js"(exports) {
      "use strict";
      var utils = require_common();
      var Z_FIXED = 4;
      var Z_BINARY = 0;
      var Z_TEXT = 1;
      var Z_UNKNOWN = 2;
      function zero2(buf) {
        var len2 = buf.length;
        while (--len2 >= 0) {
          buf[len2] = 0;
        }
      }
      var STORED_BLOCK = 0;
      var STATIC_TREES = 1;
      var DYN_TREES = 2;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var Buf_size = 16;
      var MAX_BL_BITS = 7;
      var END_BLOCK = 256;
      var REP_3_6 = 16;
      var REPZ_3_10 = 17;
      var REPZ_11_138 = 18;
      var extra_lbits = (
        /* extra bits for each length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
      );
      var extra_dbits = (
        /* extra bits for each distance code */
        [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
      );
      var extra_blbits = (
        /* extra bits for each bit length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
      );
      var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      var DIST_CODE_LEN = 512;
      var static_ltree = new Array((L_CODES + 2) * 2);
      zero2(static_ltree);
      var static_dtree = new Array(D_CODES * 2);
      zero2(static_dtree);
      var _dist_code = new Array(DIST_CODE_LEN);
      zero2(_dist_code);
      var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
      zero2(_length_code);
      var base_length = new Array(LENGTH_CODES);
      zero2(base_length);
      var base_dist = new Array(D_CODES);
      zero2(base_dist);
      function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
        this.static_tree = static_tree;
        this.extra_bits = extra_bits;
        this.extra_base = extra_base;
        this.elems = elems;
        this.max_length = max_length;
        this.has_stree = static_tree && static_tree.length;
      }
      var static_l_desc;
      var static_d_desc;
      var static_bl_desc;
      function TreeDesc(dyn_tree, stat_desc) {
        this.dyn_tree = dyn_tree;
        this.max_code = 0;
        this.stat_desc = stat_desc;
      }
      function d_code(dist2) {
        return dist2 < 256 ? _dist_code[dist2] : _dist_code[256 + (dist2 >>> 7)];
      }
      function put_short(s, w) {
        s.pending_buf[s.pending++] = w & 255;
        s.pending_buf[s.pending++] = w >>> 8 & 255;
      }
      function send_bits(s, value, length4) {
        if (s.bi_valid > Buf_size - length4) {
          s.bi_buf |= value << s.bi_valid & 65535;
          put_short(s, s.bi_buf);
          s.bi_buf = value >> Buf_size - s.bi_valid;
          s.bi_valid += length4 - Buf_size;
        } else {
          s.bi_buf |= value << s.bi_valid & 65535;
          s.bi_valid += length4;
        }
      }
      function send_code(s, c, tree) {
        send_bits(
          s,
          tree[c * 2],
          tree[c * 2 + 1]
          /*.Len*/
        );
      }
      function bi_reverse(code, len2) {
        var res = 0;
        do {
          res |= code & 1;
          code >>>= 1;
          res <<= 1;
        } while (--len2 > 0);
        return res >>> 1;
      }
      function bi_flush(s) {
        if (s.bi_valid === 16) {
          put_short(s, s.bi_buf);
          s.bi_buf = 0;
          s.bi_valid = 0;
        } else if (s.bi_valid >= 8) {
          s.pending_buf[s.pending++] = s.bi_buf & 255;
          s.bi_buf >>= 8;
          s.bi_valid -= 8;
        }
      }
      function gen_bitlen(s, desc) {
        var tree = desc.dyn_tree;
        var max_code = desc.max_code;
        var stree = desc.stat_desc.static_tree;
        var has_stree = desc.stat_desc.has_stree;
        var extra = desc.stat_desc.extra_bits;
        var base = desc.stat_desc.extra_base;
        var max_length = desc.stat_desc.max_length;
        var h;
        var n, m;
        var bits;
        var xbits;
        var f;
        var overflow = 0;
        for (bits = 0; bits <= MAX_BITS; bits++) {
          s.bl_count[bits] = 0;
        }
        tree[s.heap[s.heap_max] * 2 + 1] = 0;
        for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
          n = s.heap[h];
          bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
          if (bits > max_length) {
            bits = max_length;
            overflow++;
          }
          tree[n * 2 + 1] = bits;
          if (n > max_code) {
            continue;
          }
          s.bl_count[bits]++;
          xbits = 0;
          if (n >= base) {
            xbits = extra[n - base];
          }
          f = tree[n * 2];
          s.opt_len += f * (bits + xbits);
          if (has_stree) {
            s.static_len += f * (stree[n * 2 + 1] + xbits);
          }
        }
        if (overflow === 0) {
          return;
        }
        do {
          bits = max_length - 1;
          while (s.bl_count[bits] === 0) {
            bits--;
          }
          s.bl_count[bits]--;
          s.bl_count[bits + 1] += 2;
          s.bl_count[max_length]--;
          overflow -= 2;
        } while (overflow > 0);
        for (bits = max_length; bits !== 0; bits--) {
          n = s.bl_count[bits];
          while (n !== 0) {
            m = s.heap[--h];
            if (m > max_code) {
              continue;
            }
            if (tree[m * 2 + 1] !== bits) {
              s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
              tree[m * 2 + 1] = bits;
            }
            n--;
          }
        }
      }
      function gen_codes(tree, max_code, bl_count) {
        var next_code = new Array(MAX_BITS + 1);
        var code = 0;
        var bits;
        var n;
        for (bits = 1; bits <= MAX_BITS; bits++) {
          next_code[bits] = code = code + bl_count[bits - 1] << 1;
        }
        for (n = 0; n <= max_code; n++) {
          var len2 = tree[n * 2 + 1];
          if (len2 === 0) {
            continue;
          }
          tree[n * 2] = bi_reverse(next_code[len2]++, len2);
        }
      }
      function tr_static_init() {
        var n;
        var bits;
        var length4;
        var code;
        var dist2;
        var bl_count = new Array(MAX_BITS + 1);
        length4 = 0;
        for (code = 0; code < LENGTH_CODES - 1; code++) {
          base_length[code] = length4;
          for (n = 0; n < 1 << extra_lbits[code]; n++) {
            _length_code[length4++] = code;
          }
        }
        _length_code[length4 - 1] = code;
        dist2 = 0;
        for (code = 0; code < 16; code++) {
          base_dist[code] = dist2;
          for (n = 0; n < 1 << extra_dbits[code]; n++) {
            _dist_code[dist2++] = code;
          }
        }
        dist2 >>= 7;
        for (; code < D_CODES; code++) {
          base_dist[code] = dist2 << 7;
          for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
            _dist_code[256 + dist2++] = code;
          }
        }
        for (bits = 0; bits <= MAX_BITS; bits++) {
          bl_count[bits] = 0;
        }
        n = 0;
        while (n <= 143) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        while (n <= 255) {
          static_ltree[n * 2 + 1] = 9;
          n++;
          bl_count[9]++;
        }
        while (n <= 279) {
          static_ltree[n * 2 + 1] = 7;
          n++;
          bl_count[7]++;
        }
        while (n <= 287) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        gen_codes(static_ltree, L_CODES + 1, bl_count);
        for (n = 0; n < D_CODES; n++) {
          static_dtree[n * 2 + 1] = 5;
          static_dtree[n * 2] = bi_reverse(n, 5);
        }
        static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
        static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
        static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
      }
      function init_block(s) {
        var n;
        for (n = 0; n < L_CODES; n++) {
          s.dyn_ltree[n * 2] = 0;
        }
        for (n = 0; n < D_CODES; n++) {
          s.dyn_dtree[n * 2] = 0;
        }
        for (n = 0; n < BL_CODES; n++) {
          s.bl_tree[n * 2] = 0;
        }
        s.dyn_ltree[END_BLOCK * 2] = 1;
        s.opt_len = s.static_len = 0;
        s.last_lit = s.matches = 0;
      }
      function bi_windup(s) {
        if (s.bi_valid > 8) {
          put_short(s, s.bi_buf);
        } else if (s.bi_valid > 0) {
          s.pending_buf[s.pending++] = s.bi_buf;
        }
        s.bi_buf = 0;
        s.bi_valid = 0;
      }
      function copy_block(s, buf, len2, header) {
        bi_windup(s);
        if (header) {
          put_short(s, len2);
          put_short(s, ~len2);
        }
        utils.arraySet(s.pending_buf, s.window, buf, len2, s.pending);
        s.pending += len2;
      }
      function smaller(tree, n, m, depth) {
        var _n2 = n * 2;
        var _m2 = m * 2;
        return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
      }
      function pqdownheap(s, tree, k) {
        var v = s.heap[k];
        var j = k << 1;
        while (j <= s.heap_len) {
          if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
            j++;
          }
          if (smaller(tree, v, s.heap[j], s.depth)) {
            break;
          }
          s.heap[k] = s.heap[j];
          k = j;
          j <<= 1;
        }
        s.heap[k] = v;
      }
      function compress_block(s, ltree, dtree) {
        var dist2;
        var lc;
        var lx = 0;
        var code;
        var extra;
        if (s.last_lit !== 0) {
          do {
            dist2 = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
            lc = s.pending_buf[s.l_buf + lx];
            lx++;
            if (dist2 === 0) {
              send_code(s, lc, ltree);
            } else {
              code = _length_code[lc];
              send_code(s, code + LITERALS + 1, ltree);
              extra = extra_lbits[code];
              if (extra !== 0) {
                lc -= base_length[code];
                send_bits(s, lc, extra);
              }
              dist2--;
              code = d_code(dist2);
              send_code(s, code, dtree);
              extra = extra_dbits[code];
              if (extra !== 0) {
                dist2 -= base_dist[code];
                send_bits(s, dist2, extra);
              }
            }
          } while (lx < s.last_lit);
        }
        send_code(s, END_BLOCK, ltree);
      }
      function build_tree(s, desc) {
        var tree = desc.dyn_tree;
        var stree = desc.stat_desc.static_tree;
        var has_stree = desc.stat_desc.has_stree;
        var elems = desc.stat_desc.elems;
        var n, m;
        var max_code = -1;
        var node;
        s.heap_len = 0;
        s.heap_max = HEAP_SIZE;
        for (n = 0; n < elems; n++) {
          if (tree[n * 2] !== 0) {
            s.heap[++s.heap_len] = max_code = n;
            s.depth[n] = 0;
          } else {
            tree[n * 2 + 1] = 0;
          }
        }
        while (s.heap_len < 2) {
          node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
          tree[node * 2] = 1;
          s.depth[node] = 0;
          s.opt_len--;
          if (has_stree) {
            s.static_len -= stree[node * 2 + 1];
          }
        }
        desc.max_code = max_code;
        for (n = s.heap_len >> 1; n >= 1; n--) {
          pqdownheap(s, tree, n);
        }
        node = elems;
        do {
          n = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[
            1
            /*SMALLEST*/
          ] = s.heap[s.heap_len--];
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
          m = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[--s.heap_max] = n;
          s.heap[--s.heap_max] = m;
          tree[node * 2] = tree[n * 2] + tree[m * 2];
          s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
          tree[n * 2 + 1] = tree[m * 2 + 1] = node;
          s.heap[
            1
            /*SMALLEST*/
          ] = node++;
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
        } while (s.heap_len >= 2);
        s.heap[--s.heap_max] = s.heap[
          1
          /*SMALLEST*/
        ];
        gen_bitlen(s, desc);
        gen_codes(tree, max_code, s.bl_count);
      }
      function scan_tree(s, tree, max_code) {
        var n;
        var prevlen = -1;
        var curlen;
        var nextlen = tree[0 * 2 + 1];
        var count = 0;
        var max_count = 7;
        var min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        tree[(max_code + 1) * 2 + 1] = 65535;
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            s.bl_tree[curlen * 2] += count;
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              s.bl_tree[curlen * 2]++;
            }
            s.bl_tree[REP_3_6 * 2]++;
          } else if (count <= 10) {
            s.bl_tree[REPZ_3_10 * 2]++;
          } else {
            s.bl_tree[REPZ_11_138 * 2]++;
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      }
      function send_tree(s, tree, max_code) {
        var n;
        var prevlen = -1;
        var curlen;
        var nextlen = tree[0 * 2 + 1];
        var count = 0;
        var max_count = 7;
        var min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            do {
              send_code(s, curlen, s.bl_tree);
            } while (--count !== 0);
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              send_code(s, curlen, s.bl_tree);
              count--;
            }
            send_code(s, REP_3_6, s.bl_tree);
            send_bits(s, count - 3, 2);
          } else if (count <= 10) {
            send_code(s, REPZ_3_10, s.bl_tree);
            send_bits(s, count - 3, 3);
          } else {
            send_code(s, REPZ_11_138, s.bl_tree);
            send_bits(s, count - 11, 7);
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      }
      function build_bl_tree(s) {
        var max_blindex;
        scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
        scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
        build_tree(s, s.bl_desc);
        for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
          if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
            break;
          }
        }
        s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
        return max_blindex;
      }
      function send_all_trees(s, lcodes, dcodes, blcodes) {
        var rank;
        send_bits(s, lcodes - 257, 5);
        send_bits(s, dcodes - 1, 5);
        send_bits(s, blcodes - 4, 4);
        for (rank = 0; rank < blcodes; rank++) {
          send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
        }
        send_tree(s, s.dyn_ltree, lcodes - 1);
        send_tree(s, s.dyn_dtree, dcodes - 1);
      }
      function detect_data_type(s) {
        var black_mask = 4093624447;
        var n;
        for (n = 0; n <= 31; n++, black_mask >>>= 1) {
          if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
            return Z_BINARY;
          }
        }
        if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
          return Z_TEXT;
        }
        for (n = 32; n < LITERALS; n++) {
          if (s.dyn_ltree[n * 2] !== 0) {
            return Z_TEXT;
          }
        }
        return Z_BINARY;
      }
      var static_init_done = false;
      function _tr_init(s) {
        if (!static_init_done) {
          tr_static_init();
          static_init_done = true;
        }
        s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
        s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
        s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
        s.bi_buf = 0;
        s.bi_valid = 0;
        init_block(s);
      }
      function _tr_stored_block(s, buf, stored_len, last) {
        send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
        copy_block(s, buf, stored_len, true);
      }
      function _tr_align(s) {
        send_bits(s, STATIC_TREES << 1, 3);
        send_code(s, END_BLOCK, static_ltree);
        bi_flush(s);
      }
      function _tr_flush_block(s, buf, stored_len, last) {
        var opt_lenb, static_lenb;
        var max_blindex = 0;
        if (s.level > 0) {
          if (s.strm.data_type === Z_UNKNOWN) {
            s.strm.data_type = detect_data_type(s);
          }
          build_tree(s, s.l_desc);
          build_tree(s, s.d_desc);
          max_blindex = build_bl_tree(s);
          opt_lenb = s.opt_len + 3 + 7 >>> 3;
          static_lenb = s.static_len + 3 + 7 >>> 3;
          if (static_lenb <= opt_lenb) {
            opt_lenb = static_lenb;
          }
        } else {
          opt_lenb = static_lenb = stored_len + 5;
        }
        if (stored_len + 4 <= opt_lenb && buf !== -1) {
          _tr_stored_block(s, buf, stored_len, last);
        } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
          send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
          compress_block(s, static_ltree, static_dtree);
        } else {
          send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
          send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
          compress_block(s, s.dyn_ltree, s.dyn_dtree);
        }
        init_block(s);
        if (last) {
          bi_windup(s);
        }
      }
      function _tr_tally(s, dist2, lc) {
        s.pending_buf[s.d_buf + s.last_lit * 2] = dist2 >>> 8 & 255;
        s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist2 & 255;
        s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
        s.last_lit++;
        if (dist2 === 0) {
          s.dyn_ltree[lc * 2]++;
        } else {
          s.matches++;
          dist2--;
          s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
          s.dyn_dtree[d_code(dist2) * 2]++;
        }
        return s.last_lit === s.lit_bufsize - 1;
      }
      exports._tr_init = _tr_init;
      exports._tr_stored_block = _tr_stored_block;
      exports._tr_flush_block = _tr_flush_block;
      exports._tr_tally = _tr_tally;
      exports._tr_align = _tr_align;
    }
  });

  // ../../node_modules/pako/lib/zlib/adler32.js
  var require_adler32 = __commonJS({
    "../../node_modules/pako/lib/zlib/adler32.js"(exports, module) {
      "use strict";
      function adler32(adler, buf, len2, pos) {
        var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
        while (len2 !== 0) {
          n = len2 > 2e3 ? 2e3 : len2;
          len2 -= n;
          do {
            s1 = s1 + buf[pos++] | 0;
            s2 = s2 + s1 | 0;
          } while (--n);
          s1 %= 65521;
          s2 %= 65521;
        }
        return s1 | s2 << 16 | 0;
      }
      module.exports = adler32;
    }
  });

  // ../../node_modules/pako/lib/zlib/crc32.js
  var require_crc32 = __commonJS({
    "../../node_modules/pako/lib/zlib/crc32.js"(exports, module) {
      "use strict";
      function makeTable() {
        var c, table = [];
        for (var n = 0; n < 256; n++) {
          c = n;
          for (var k = 0; k < 8; k++) {
            c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
          }
          table[n] = c;
        }
        return table;
      }
      var crcTable = makeTable();
      function crc32(crc, buf, len2, pos) {
        var t = crcTable, end = pos + len2;
        crc ^= -1;
        for (var i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
        }
        return crc ^ -1;
      }
      module.exports = crc32;
    }
  });

  // ../../node_modules/pako/lib/zlib/messages.js
  var require_messages = __commonJS({
    "../../node_modules/pako/lib/zlib/messages.js"(exports, module) {
      "use strict";
      module.exports = {
        2: "need dictionary",
        /* Z_NEED_DICT       2  */
        1: "stream end",
        /* Z_STREAM_END      1  */
        0: "",
        /* Z_OK              0  */
        "-1": "file error",
        /* Z_ERRNO         (-1) */
        "-2": "stream error",
        /* Z_STREAM_ERROR  (-2) */
        "-3": "data error",
        /* Z_DATA_ERROR    (-3) */
        "-4": "insufficient memory",
        /* Z_MEM_ERROR     (-4) */
        "-5": "buffer error",
        /* Z_BUF_ERROR     (-5) */
        "-6": "incompatible version"
        /* Z_VERSION_ERROR (-6) */
      };
    }
  });

  // ../../node_modules/pako/lib/zlib/deflate.js
  var require_deflate = __commonJS({
    "../../node_modules/pako/lib/zlib/deflate.js"(exports) {
      "use strict";
      var utils = require_common();
      var trees = require_trees();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var msg = require_messages();
      var Z_NO_FLUSH = 0;
      var Z_PARTIAL_FLUSH = 1;
      var Z_FULL_FLUSH = 3;
      var Z_FINISH = 4;
      var Z_BLOCK = 5;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_STREAM_ERROR = -2;
      var Z_DATA_ERROR = -3;
      var Z_BUF_ERROR = -5;
      var Z_DEFAULT_COMPRESSION = -1;
      var Z_FILTERED = 1;
      var Z_HUFFMAN_ONLY = 2;
      var Z_RLE = 3;
      var Z_FIXED = 4;
      var Z_DEFAULT_STRATEGY = 0;
      var Z_UNKNOWN = 2;
      var Z_DEFLATED = 8;
      var MAX_MEM_LEVEL = 9;
      var MAX_WBITS = 15;
      var DEF_MEM_LEVEL = 8;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
      var PRESET_DICT = 32;
      var INIT_STATE = 42;
      var EXTRA_STATE = 69;
      var NAME_STATE = 73;
      var COMMENT_STATE = 91;
      var HCRC_STATE = 103;
      var BUSY_STATE = 113;
      var FINISH_STATE = 666;
      var BS_NEED_MORE = 1;
      var BS_BLOCK_DONE = 2;
      var BS_FINISH_STARTED = 3;
      var BS_FINISH_DONE = 4;
      var OS_CODE = 3;
      function err(strm, errorCode) {
        strm.msg = msg[errorCode];
        return errorCode;
      }
      function rank(f) {
        return (f << 1) - (f > 4 ? 9 : 0);
      }
      function zero2(buf) {
        var len2 = buf.length;
        while (--len2 >= 0) {
          buf[len2] = 0;
        }
      }
      function flush_pending(strm) {
        var s = strm.state;
        var len2 = s.pending;
        if (len2 > strm.avail_out) {
          len2 = strm.avail_out;
        }
        if (len2 === 0) {
          return;
        }
        utils.arraySet(strm.output, s.pending_buf, s.pending_out, len2, strm.next_out);
        strm.next_out += len2;
        s.pending_out += len2;
        strm.total_out += len2;
        strm.avail_out -= len2;
        s.pending -= len2;
        if (s.pending === 0) {
          s.pending_out = 0;
        }
      }
      function flush_block_only(s, last) {
        trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
        s.block_start = s.strstart;
        flush_pending(s.strm);
      }
      function put_byte(s, b) {
        s.pending_buf[s.pending++] = b;
      }
      function putShortMSB(s, b) {
        s.pending_buf[s.pending++] = b >>> 8 & 255;
        s.pending_buf[s.pending++] = b & 255;
      }
      function read_buf(strm, buf, start, size) {
        var len2 = strm.avail_in;
        if (len2 > size) {
          len2 = size;
        }
        if (len2 === 0) {
          return 0;
        }
        strm.avail_in -= len2;
        utils.arraySet(buf, strm.input, strm.next_in, len2, start);
        if (strm.state.wrap === 1) {
          strm.adler = adler32(strm.adler, buf, len2, start);
        } else if (strm.state.wrap === 2) {
          strm.adler = crc32(strm.adler, buf, len2, start);
        }
        strm.next_in += len2;
        strm.total_in += len2;
        return len2;
      }
      function longest_match(s, cur_match) {
        var chain_length = s.max_chain_length;
        var scan = s.strstart;
        var match;
        var len2;
        var best_len = s.prev_length;
        var nice_match = s.nice_match;
        var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
        var _win = s.window;
        var wmask = s.w_mask;
        var prev = s.prev;
        var strend = s.strstart + MAX_MATCH;
        var scan_end1 = _win[scan + best_len - 1];
        var scan_end = _win[scan + best_len];
        if (s.prev_length >= s.good_match) {
          chain_length >>= 2;
        }
        if (nice_match > s.lookahead) {
          nice_match = s.lookahead;
        }
        do {
          match = cur_match;
          if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
            continue;
          }
          scan += 2;
          match++;
          do {
          } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
          len2 = MAX_MATCH - (strend - scan);
          scan = strend - MAX_MATCH;
          if (len2 > best_len) {
            s.match_start = cur_match;
            best_len = len2;
            if (len2 >= nice_match) {
              break;
            }
            scan_end1 = _win[scan + best_len - 1];
            scan_end = _win[scan + best_len];
          }
        } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
        if (best_len <= s.lookahead) {
          return best_len;
        }
        return s.lookahead;
      }
      function fill_window(s) {
        var _w_size = s.w_size;
        var p, n, m, more, str3;
        do {
          more = s.window_size - s.lookahead - s.strstart;
          if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
            utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
            s.match_start -= _w_size;
            s.strstart -= _w_size;
            s.block_start -= _w_size;
            n = s.hash_size;
            p = n;
            do {
              m = s.head[--p];
              s.head[p] = m >= _w_size ? m - _w_size : 0;
            } while (--n);
            n = _w_size;
            p = n;
            do {
              m = s.prev[--p];
              s.prev[p] = m >= _w_size ? m - _w_size : 0;
            } while (--n);
            more += _w_size;
          }
          if (s.strm.avail_in === 0) {
            break;
          }
          n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
          s.lookahead += n;
          if (s.lookahead + s.insert >= MIN_MATCH) {
            str3 = s.strstart - s.insert;
            s.ins_h = s.window[str3];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str3 + 1]) & s.hash_mask;
            while (s.insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str3 + MIN_MATCH - 1]) & s.hash_mask;
              s.prev[str3 & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = str3;
              str3++;
              s.insert--;
              if (s.lookahead + s.insert < MIN_MATCH) {
                break;
              }
            }
          }
        } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
      }
      function deflate_stored(s, flush) {
        var max_block_size = 65535;
        if (max_block_size > s.pending_buf_size - 5) {
          max_block_size = s.pending_buf_size - 5;
        }
        for (; ; ) {
          if (s.lookahead <= 1) {
            fill_window(s);
            if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.strstart += s.lookahead;
          s.lookahead = 0;
          var max_start = s.block_start + max_block_size;
          if (s.strstart === 0 || s.strstart >= max_start) {
            s.lookahead = s.strstart - max_start;
            s.strstart = max_start;
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.strstart > s.block_start) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_NEED_MORE;
      }
      function deflate_fast(s, flush) {
        var hash_head;
        var bflush;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
              s.match_length--;
              do {
                s.strstart++;
                s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              } while (--s.match_length !== 0);
              s.strstart++;
            } else {
              s.strstart += s.match_length;
              s.match_length = 0;
              s.ins_h = s.window[s.strstart];
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
            }
          } else {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_slow(s, flush) {
        var hash_head;
        var bflush;
        var max_insert;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          s.prev_length = s.match_length;
          s.prev_match = s.match_start;
          s.match_length = MIN_MATCH - 1;
          if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
            if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
              s.match_length = MIN_MATCH - 1;
            }
          }
          if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
            max_insert = s.strstart + s.lookahead - MIN_MATCH;
            bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
            s.lookahead -= s.prev_length - 1;
            s.prev_length -= 2;
            do {
              if (++s.strstart <= max_insert) {
                s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              }
            } while (--s.prev_length !== 0);
            s.match_available = 0;
            s.match_length = MIN_MATCH - 1;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          } else if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            if (bflush) {
              flush_block_only(s, false);
            }
            s.strstart++;
            s.lookahead--;
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          } else {
            s.match_available = 1;
            s.strstart++;
            s.lookahead--;
          }
        }
        if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          s.match_available = 0;
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_rle(s, flush) {
        var bflush;
        var prev;
        var scan, strend;
        var _win = s.window;
        for (; ; ) {
          if (s.lookahead <= MAX_MATCH) {
            fill_window(s);
            if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.match_length = 0;
          if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
            scan = s.strstart - 1;
            prev = _win[scan];
            if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
              strend = s.strstart + MAX_MATCH;
              do {
              } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
              s.match_length = MAX_MATCH - (strend - scan);
              if (s.match_length > s.lookahead) {
                s.match_length = s.lookahead;
              }
            }
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            s.strstart += s.match_length;
            s.match_length = 0;
          } else {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_huff(s, flush) {
        var bflush;
        for (; ; ) {
          if (s.lookahead === 0) {
            fill_window(s);
            if (s.lookahead === 0) {
              if (flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              break;
            }
          }
          s.match_length = 0;
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function Config(good_length, max_lazy, nice_length, max_chain, func) {
        this.good_length = good_length;
        this.max_lazy = max_lazy;
        this.nice_length = nice_length;
        this.max_chain = max_chain;
        this.func = func;
      }
      var configuration_table;
      configuration_table = [
        /*      good lazy nice chain */
        new Config(0, 0, 0, 0, deflate_stored),
        /* 0 store only */
        new Config(4, 4, 8, 4, deflate_fast),
        /* 1 max speed, no lazy matches */
        new Config(4, 5, 16, 8, deflate_fast),
        /* 2 */
        new Config(4, 6, 32, 32, deflate_fast),
        /* 3 */
        new Config(4, 4, 16, 16, deflate_slow),
        /* 4 lazy matches */
        new Config(8, 16, 32, 32, deflate_slow),
        /* 5 */
        new Config(8, 16, 128, 128, deflate_slow),
        /* 6 */
        new Config(8, 32, 128, 256, deflate_slow),
        /* 7 */
        new Config(32, 128, 258, 1024, deflate_slow),
        /* 8 */
        new Config(32, 258, 258, 4096, deflate_slow)
        /* 9 max compression */
      ];
      function lm_init(s) {
        s.window_size = 2 * s.w_size;
        zero2(s.head);
        s.max_lazy_match = configuration_table[s.level].max_lazy;
        s.good_match = configuration_table[s.level].good_length;
        s.nice_match = configuration_table[s.level].nice_length;
        s.max_chain_length = configuration_table[s.level].max_chain;
        s.strstart = 0;
        s.block_start = 0;
        s.lookahead = 0;
        s.insert = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        s.ins_h = 0;
      }
      function DeflateState() {
        this.strm = null;
        this.status = 0;
        this.pending_buf = null;
        this.pending_buf_size = 0;
        this.pending_out = 0;
        this.pending = 0;
        this.wrap = 0;
        this.gzhead = null;
        this.gzindex = 0;
        this.method = Z_DEFLATED;
        this.last_flush = -1;
        this.w_size = 0;
        this.w_bits = 0;
        this.w_mask = 0;
        this.window = null;
        this.window_size = 0;
        this.prev = null;
        this.head = null;
        this.ins_h = 0;
        this.hash_size = 0;
        this.hash_bits = 0;
        this.hash_mask = 0;
        this.hash_shift = 0;
        this.block_start = 0;
        this.match_length = 0;
        this.prev_match = 0;
        this.match_available = 0;
        this.strstart = 0;
        this.match_start = 0;
        this.lookahead = 0;
        this.prev_length = 0;
        this.max_chain_length = 0;
        this.max_lazy_match = 0;
        this.level = 0;
        this.strategy = 0;
        this.good_match = 0;
        this.nice_match = 0;
        this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
        this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
        this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
        zero2(this.dyn_ltree);
        zero2(this.dyn_dtree);
        zero2(this.bl_tree);
        this.l_desc = null;
        this.d_desc = null;
        this.bl_desc = null;
        this.bl_count = new utils.Buf16(MAX_BITS + 1);
        this.heap = new utils.Buf16(2 * L_CODES + 1);
        zero2(this.heap);
        this.heap_len = 0;
        this.heap_max = 0;
        this.depth = new utils.Buf16(2 * L_CODES + 1);
        zero2(this.depth);
        this.l_buf = 0;
        this.lit_bufsize = 0;
        this.last_lit = 0;
        this.d_buf = 0;
        this.opt_len = 0;
        this.static_len = 0;
        this.matches = 0;
        this.insert = 0;
        this.bi_buf = 0;
        this.bi_valid = 0;
      }
      function deflateResetKeep(strm) {
        var s;
        if (!strm || !strm.state) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.total_in = strm.total_out = 0;
        strm.data_type = Z_UNKNOWN;
        s = strm.state;
        s.pending = 0;
        s.pending_out = 0;
        if (s.wrap < 0) {
          s.wrap = -s.wrap;
        }
        s.status = s.wrap ? INIT_STATE : BUSY_STATE;
        strm.adler = s.wrap === 2 ? 0 : 1;
        s.last_flush = Z_NO_FLUSH;
        trees._tr_init(s);
        return Z_OK;
      }
      function deflateReset(strm) {
        var ret = deflateResetKeep(strm);
        if (ret === Z_OK) {
          lm_init(strm.state);
        }
        return ret;
      }
      function deflateSetHeader(strm, head) {
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        if (strm.state.wrap !== 2) {
          return Z_STREAM_ERROR;
        }
        strm.state.gzhead = head;
        return Z_OK;
      }
      function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        var wrap = 1;
        if (level === Z_DEFAULT_COMPRESSION) {
          level = 6;
        }
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else if (windowBits > 15) {
          wrap = 2;
          windowBits -= 16;
        }
        if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
          return err(strm, Z_STREAM_ERROR);
        }
        if (windowBits === 8) {
          windowBits = 9;
        }
        var s = new DeflateState();
        strm.state = s;
        s.strm = strm;
        s.wrap = wrap;
        s.gzhead = null;
        s.w_bits = windowBits;
        s.w_size = 1 << s.w_bits;
        s.w_mask = s.w_size - 1;
        s.hash_bits = memLevel + 7;
        s.hash_size = 1 << s.hash_bits;
        s.hash_mask = s.hash_size - 1;
        s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
        s.window = new utils.Buf8(s.w_size * 2);
        s.head = new utils.Buf16(s.hash_size);
        s.prev = new utils.Buf16(s.w_size);
        s.lit_bufsize = 1 << memLevel + 6;
        s.pending_buf_size = s.lit_bufsize * 4;
        s.pending_buf = new utils.Buf8(s.pending_buf_size);
        s.d_buf = 1 * s.lit_bufsize;
        s.l_buf = (1 + 2) * s.lit_bufsize;
        s.level = level;
        s.strategy = strategy;
        s.method = method;
        return deflateReset(strm);
      }
      function deflateInit(strm, level) {
        return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
      }
      function deflate(strm, flush) {
        var old_flush, s;
        var beg, val;
        if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
          return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
        }
        s = strm.state;
        if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
          return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
        }
        s.strm = strm;
        old_flush = s.last_flush;
        s.last_flush = flush;
        if (s.status === INIT_STATE) {
          if (s.wrap === 2) {
            strm.adler = 0;
            put_byte(s, 31);
            put_byte(s, 139);
            put_byte(s, 8);
            if (!s.gzhead) {
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
              put_byte(s, OS_CODE);
              s.status = BUSY_STATE;
            } else {
              put_byte(
                s,
                (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
              );
              put_byte(s, s.gzhead.time & 255);
              put_byte(s, s.gzhead.time >> 8 & 255);
              put_byte(s, s.gzhead.time >> 16 & 255);
              put_byte(s, s.gzhead.time >> 24 & 255);
              put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
              put_byte(s, s.gzhead.os & 255);
              if (s.gzhead.extra && s.gzhead.extra.length) {
                put_byte(s, s.gzhead.extra.length & 255);
                put_byte(s, s.gzhead.extra.length >> 8 & 255);
              }
              if (s.gzhead.hcrc) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
              }
              s.gzindex = 0;
              s.status = EXTRA_STATE;
            }
          } else {
            var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
            var level_flags = -1;
            if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
              level_flags = 0;
            } else if (s.level < 6) {
              level_flags = 1;
            } else if (s.level === 6) {
              level_flags = 2;
            } else {
              level_flags = 3;
            }
            header |= level_flags << 6;
            if (s.strstart !== 0) {
              header |= PRESET_DICT;
            }
            header += 31 - header % 31;
            s.status = BUSY_STATE;
            putShortMSB(s, header);
            if (s.strstart !== 0) {
              putShortMSB(s, strm.adler >>> 16);
              putShortMSB(s, strm.adler & 65535);
            }
            strm.adler = 1;
          }
        }
        if (s.status === EXTRA_STATE) {
          if (s.gzhead.extra) {
            beg = s.pending;
            while (s.gzindex < (s.gzhead.extra.length & 65535)) {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  break;
                }
              }
              put_byte(s, s.gzhead.extra[s.gzindex] & 255);
              s.gzindex++;
            }
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (s.gzindex === s.gzhead.extra.length) {
              s.gzindex = 0;
              s.status = NAME_STATE;
            }
          } else {
            s.status = NAME_STATE;
          }
        }
        if (s.status === NAME_STATE) {
          if (s.gzhead.name) {
            beg = s.pending;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  val = 1;
                  break;
                }
              }
              if (s.gzindex < s.gzhead.name.length) {
                val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (val === 0) {
              s.gzindex = 0;
              s.status = COMMENT_STATE;
            }
          } else {
            s.status = COMMENT_STATE;
          }
        }
        if (s.status === COMMENT_STATE) {
          if (s.gzhead.comment) {
            beg = s.pending;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  val = 1;
                  break;
                }
              }
              if (s.gzindex < s.gzhead.comment.length) {
                val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (val === 0) {
              s.status = HCRC_STATE;
            }
          } else {
            s.status = HCRC_STATE;
          }
        }
        if (s.status === HCRC_STATE) {
          if (s.gzhead.hcrc) {
            if (s.pending + 2 > s.pending_buf_size) {
              flush_pending(strm);
            }
            if (s.pending + 2 <= s.pending_buf_size) {
              put_byte(s, strm.adler & 255);
              put_byte(s, strm.adler >> 8 & 255);
              strm.adler = 0;
              s.status = BUSY_STATE;
            }
          } else {
            s.status = BUSY_STATE;
          }
        }
        if (s.pending !== 0) {
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === FINISH_STATE && strm.avail_in !== 0) {
          return err(strm, Z_BUF_ERROR);
        }
        if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
          var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
          if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
            s.status = FINISH_STATE;
          }
          if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
            if (strm.avail_out === 0) {
              s.last_flush = -1;
            }
            return Z_OK;
          }
          if (bstate === BS_BLOCK_DONE) {
            if (flush === Z_PARTIAL_FLUSH) {
              trees._tr_align(s);
            } else if (flush !== Z_BLOCK) {
              trees._tr_stored_block(s, 0, 0, false);
              if (flush === Z_FULL_FLUSH) {
                zero2(s.head);
                if (s.lookahead === 0) {
                  s.strstart = 0;
                  s.block_start = 0;
                  s.insert = 0;
                }
              }
            }
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          }
        }
        if (flush !== Z_FINISH) {
          return Z_OK;
        }
        if (s.wrap <= 0) {
          return Z_STREAM_END;
        }
        if (s.wrap === 2) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          put_byte(s, strm.adler >> 16 & 255);
          put_byte(s, strm.adler >> 24 & 255);
          put_byte(s, strm.total_in & 255);
          put_byte(s, strm.total_in >> 8 & 255);
          put_byte(s, strm.total_in >> 16 & 255);
          put_byte(s, strm.total_in >> 24 & 255);
        } else {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        flush_pending(strm);
        if (s.wrap > 0) {
          s.wrap = -s.wrap;
        }
        return s.pending !== 0 ? Z_OK : Z_STREAM_END;
      }
      function deflateEnd(strm) {
        var status;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        status = strm.state.status;
        if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.state = null;
        return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
      }
      function deflateSetDictionary(strm, dictionary) {
        var dictLength = dictionary.length;
        var s;
        var str3, n;
        var wrap;
        var avail;
        var next;
        var input;
        var tmpDict;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        s = strm.state;
        wrap = s.wrap;
        if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
          return Z_STREAM_ERROR;
        }
        if (wrap === 1) {
          strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
        }
        s.wrap = 0;
        if (dictLength >= s.w_size) {
          if (wrap === 0) {
            zero2(s.head);
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
          tmpDict = new utils.Buf8(s.w_size);
          utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
          dictionary = tmpDict;
          dictLength = s.w_size;
        }
        avail = strm.avail_in;
        next = strm.next_in;
        input = strm.input;
        strm.avail_in = dictLength;
        strm.next_in = 0;
        strm.input = dictionary;
        fill_window(s);
        while (s.lookahead >= MIN_MATCH) {
          str3 = s.strstart;
          n = s.lookahead - (MIN_MATCH - 1);
          do {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str3 + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str3 & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str3;
            str3++;
          } while (--n);
          s.strstart = str3;
          s.lookahead = MIN_MATCH - 1;
          fill_window(s);
        }
        s.strstart += s.lookahead;
        s.block_start = s.strstart;
        s.insert = s.lookahead;
        s.lookahead = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        strm.next_in = next;
        strm.input = input;
        strm.avail_in = avail;
        s.wrap = wrap;
        return Z_OK;
      }
      exports.deflateInit = deflateInit;
      exports.deflateInit2 = deflateInit2;
      exports.deflateReset = deflateReset;
      exports.deflateResetKeep = deflateResetKeep;
      exports.deflateSetHeader = deflateSetHeader;
      exports.deflate = deflate;
      exports.deflateEnd = deflateEnd;
      exports.deflateSetDictionary = deflateSetDictionary;
      exports.deflateInfo = "pako deflate (from Nodeca project)";
    }
  });

  // ../../node_modules/pako/lib/utils/strings.js
  var require_strings = __commonJS({
    "../../node_modules/pako/lib/utils/strings.js"(exports) {
      "use strict";
      var utils = require_common();
      var STR_APPLY_OK = true;
      var STR_APPLY_UIA_OK = true;
      try {
        String.fromCharCode.apply(null, [0]);
      } catch (__) {
        STR_APPLY_OK = false;
      }
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch (__) {
        STR_APPLY_UIA_OK = false;
      }
      var _utf8len = new utils.Buf8(256);
      for (q = 0; q < 256; q++) {
        _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
      }
      var q;
      _utf8len[254] = _utf8len[254] = 1;
      exports.string2buf = function(str3) {
        var buf, c, c2, m_pos, i, str_len = str3.length, buf_len = 0;
        for (m_pos = 0; m_pos < str_len; m_pos++) {
          c = str3.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str3.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
        }
        buf = new utils.Buf8(buf_len);
        for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
          c = str3.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str3.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          if (c < 128) {
            buf[i++] = c;
          } else if (c < 2048) {
            buf[i++] = 192 | c >>> 6;
            buf[i++] = 128 | c & 63;
          } else if (c < 65536) {
            buf[i++] = 224 | c >>> 12;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          } else {
            buf[i++] = 240 | c >>> 18;
            buf[i++] = 128 | c >>> 12 & 63;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          }
        }
        return buf;
      };
      function buf2binstring(buf, len2) {
        if (len2 < 65534) {
          if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
            return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len2));
          }
        }
        var result = "";
        for (var i = 0; i < len2; i++) {
          result += String.fromCharCode(buf[i]);
        }
        return result;
      }
      exports.buf2binstring = function(buf) {
        return buf2binstring(buf, buf.length);
      };
      exports.binstring2buf = function(str3) {
        var buf = new utils.Buf8(str3.length);
        for (var i = 0, len2 = buf.length; i < len2; i++) {
          buf[i] = str3.charCodeAt(i);
        }
        return buf;
      };
      exports.buf2string = function(buf, max2) {
        var i, out, c, c_len;
        var len2 = max2 || buf.length;
        var utf16buf = new Array(len2 * 2);
        for (out = 0, i = 0; i < len2; ) {
          c = buf[i++];
          if (c < 128) {
            utf16buf[out++] = c;
            continue;
          }
          c_len = _utf8len[c];
          if (c_len > 4) {
            utf16buf[out++] = 65533;
            i += c_len - 1;
            continue;
          }
          c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
          while (c_len > 1 && i < len2) {
            c = c << 6 | buf[i++] & 63;
            c_len--;
          }
          if (c_len > 1) {
            utf16buf[out++] = 65533;
            continue;
          }
          if (c < 65536) {
            utf16buf[out++] = c;
          } else {
            c -= 65536;
            utf16buf[out++] = 55296 | c >> 10 & 1023;
            utf16buf[out++] = 56320 | c & 1023;
          }
        }
        return buf2binstring(utf16buf, out);
      };
      exports.utf8border = function(buf, max2) {
        var pos;
        max2 = max2 || buf.length;
        if (max2 > buf.length) {
          max2 = buf.length;
        }
        pos = max2 - 1;
        while (pos >= 0 && (buf[pos] & 192) === 128) {
          pos--;
        }
        if (pos < 0) {
          return max2;
        }
        if (pos === 0) {
          return max2;
        }
        return pos + _utf8len[buf[pos]] > max2 ? pos : max2;
      };
    }
  });

  // ../../node_modules/pako/lib/zlib/zstream.js
  var require_zstream = __commonJS({
    "../../node_modules/pako/lib/zlib/zstream.js"(exports, module) {
      "use strict";
      function ZStream() {
        this.input = null;
        this.next_in = 0;
        this.avail_in = 0;
        this.total_in = 0;
        this.output = null;
        this.next_out = 0;
        this.avail_out = 0;
        this.total_out = 0;
        this.msg = "";
        this.state = null;
        this.data_type = 2;
        this.adler = 0;
      }
      module.exports = ZStream;
    }
  });

  // ../../node_modules/pako/lib/deflate.js
  var require_deflate2 = __commonJS({
    "../../node_modules/pako/lib/deflate.js"(exports) {
      "use strict";
      var zlib_deflate = require_deflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var toString2 = Object.prototype.toString;
      var Z_NO_FLUSH = 0;
      var Z_FINISH = 4;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_SYNC_FLUSH = 2;
      var Z_DEFAULT_COMPRESSION = -1;
      var Z_DEFAULT_STRATEGY = 0;
      var Z_DEFLATED = 8;
      function Deflate(options) {
        if (!(this instanceof Deflate))
          return new Deflate(options);
        this.options = utils.assign({
          level: Z_DEFAULT_COMPRESSION,
          method: Z_DEFLATED,
          chunkSize: 16384,
          windowBits: 15,
          memLevel: 8,
          strategy: Z_DEFAULT_STRATEGY,
          to: ""
        }, options || {});
        var opt = this.options;
        if (opt.raw && opt.windowBits > 0) {
          opt.windowBits = -opt.windowBits;
        } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
          opt.windowBits += 16;
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        var status = zlib_deflate.deflateInit2(
          this.strm,
          opt.level,
          opt.method,
          opt.windowBits,
          opt.memLevel,
          opt.strategy
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        if (opt.header) {
          zlib_deflate.deflateSetHeader(this.strm, opt.header);
        }
        if (opt.dictionary) {
          var dict;
          if (typeof opt.dictionary === "string") {
            dict = strings.string2buf(opt.dictionary);
          } else if (toString2.call(opt.dictionary) === "[object ArrayBuffer]") {
            dict = new Uint8Array(opt.dictionary);
          } else {
            dict = opt.dictionary;
          }
          status = zlib_deflate.deflateSetDictionary(this.strm, dict);
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          this._dict_set = true;
        }
      }
      Deflate.prototype.push = function(data, mode) {
        var strm = this.strm;
        var chunkSize = this.options.chunkSize;
        var status, _mode;
        if (this.ended) {
          return false;
        }
        _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.string2buf(data);
        } else if (toString2.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        do {
          if (strm.avail_out === 0) {
            strm.output = new utils.Buf8(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_deflate.deflate(strm, _mode);
          if (status !== Z_STREAM_END && status !== Z_OK) {
            this.onEnd(status);
            this.ended = true;
            return false;
          }
          if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
        if (_mode === Z_FINISH) {
          status = zlib_deflate.deflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return status === Z_OK;
        }
        if (_mode === Z_SYNC_FLUSH) {
          this.onEnd(Z_OK);
          strm.avail_out = 0;
          return true;
        }
        return true;
      };
      Deflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Deflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function deflate(input, options) {
        var deflator = new Deflate(options);
        deflator.push(input, true);
        if (deflator.err) {
          throw deflator.msg || msg[deflator.err];
        }
        return deflator.result;
      }
      function deflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return deflate(input, options);
      }
      function gzip(input, options) {
        options = options || {};
        options.gzip = true;
        return deflate(input, options);
      }
      exports.Deflate = Deflate;
      exports.deflate = deflate;
      exports.deflateRaw = deflateRaw;
      exports.gzip = gzip;
    }
  });

  // ../../node_modules/pako/lib/zlib/inffast.js
  var require_inffast = __commonJS({
    "../../node_modules/pako/lib/zlib/inffast.js"(exports, module) {
      "use strict";
      var BAD = 30;
      var TYPE = 12;
      module.exports = function inflate_fast(strm, start) {
        var state;
        var _in;
        var last;
        var _out;
        var beg;
        var end;
        var dmax;
        var wsize;
        var whave;
        var wnext;
        var s_window;
        var hold;
        var bits;
        var lcode;
        var dcode;
        var lmask;
        var dmask;
        var here;
        var op;
        var len2;
        var dist2;
        var from;
        var from_source;
        var input, output;
        state = strm.state;
        _in = strm.next_in;
        input = strm.input;
        last = _in + (strm.avail_in - 5);
        _out = strm.next_out;
        output = strm.output;
        beg = _out - (start - strm.avail_out);
        end = _out + (strm.avail_out - 257);
        dmax = state.dmax;
        wsize = state.wsize;
        whave = state.whave;
        wnext = state.wnext;
        s_window = state.window;
        hold = state.hold;
        bits = state.bits;
        lcode = state.lencode;
        dcode = state.distcode;
        lmask = (1 << state.lenbits) - 1;
        dmask = (1 << state.distbits) - 1;
        top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op === 0) {
                  output[_out++] = here & 65535;
                } else if (op & 16) {
                  len2 = here & 65535;
                  op &= 15;
                  if (op) {
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                    len2 += hold & (1 << op) - 1;
                    hold >>>= op;
                    bits -= op;
                  }
                  if (bits < 15) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  here = dcode[hold & dmask];
                  dodist:
                    for (; ; ) {
                      op = here >>> 24;
                      hold >>>= op;
                      bits -= op;
                      op = here >>> 16 & 255;
                      if (op & 16) {
                        dist2 = here & 65535;
                        op &= 15;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                          if (bits < op) {
                            hold += input[_in++] << bits;
                            bits += 8;
                          }
                        }
                        dist2 += hold & (1 << op) - 1;
                        if (dist2 > dmax) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                        hold >>>= op;
                        bits -= op;
                        op = _out - beg;
                        if (dist2 > op) {
                          op = dist2 - op;
                          if (op > whave) {
                            if (state.sane) {
                              strm.msg = "invalid distance too far back";
                              state.mode = BAD;
                              break top;
                            }
                          }
                          from = 0;
                          from_source = s_window;
                          if (wnext === 0) {
                            from += wsize - op;
                            if (op < len2) {
                              len2 -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist2;
                              from_source = output;
                            }
                          } else if (wnext < op) {
                            from += wsize + wnext - op;
                            op -= wnext;
                            if (op < len2) {
                              len2 -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = 0;
                              if (wnext < len2) {
                                op = wnext;
                                len2 -= op;
                                do {
                                  output[_out++] = s_window[from++];
                                } while (--op);
                                from = _out - dist2;
                                from_source = output;
                              }
                            }
                          } else {
                            from += wnext - op;
                            if (op < len2) {
                              len2 -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist2;
                              from_source = output;
                            }
                          }
                          while (len2 > 2) {
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            len2 -= 3;
                          }
                          if (len2) {
                            output[_out++] = from_source[from++];
                            if (len2 > 1) {
                              output[_out++] = from_source[from++];
                            }
                          }
                        } else {
                          from = _out - dist2;
                          do {
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            len2 -= 3;
                          } while (len2 > 2);
                          if (len2) {
                            output[_out++] = output[from++];
                            if (len2 > 1) {
                              output[_out++] = output[from++];
                            }
                          }
                        }
                      } else if ((op & 64) === 0) {
                        here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                        continue dodist;
                      } else {
                        strm.msg = "invalid distance code";
                        state.mode = BAD;
                        break top;
                      }
                      break;
                    }
                } else if ((op & 64) === 0) {
                  here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dolen;
                } else if (op & 32) {
                  state.mode = TYPE;
                  break top;
                } else {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break top;
                }
                break;
              }
          } while (_in < last && _out < end);
        len2 = bits >> 3;
        _in -= len2;
        bits -= len2 << 3;
        hold &= (1 << bits) - 1;
        strm.next_in = _in;
        strm.next_out = _out;
        strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
        strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
        state.hold = hold;
        state.bits = bits;
        return;
      };
    }
  });

  // ../../node_modules/pako/lib/zlib/inftrees.js
  var require_inftrees = __commonJS({
    "../../node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
      "use strict";
      var utils = require_common();
      var MAXBITS = 15;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var lbase = [
        /* Length codes 257..285 base */
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        13,
        15,
        17,
        19,
        23,
        27,
        31,
        35,
        43,
        51,
        59,
        67,
        83,
        99,
        115,
        131,
        163,
        195,
        227,
        258,
        0,
        0
      ];
      var lext = [
        /* Length codes 257..285 extra */
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        20,
        20,
        20,
        20,
        21,
        21,
        21,
        21,
        16,
        72,
        78
      ];
      var dbase = [
        /* Distance codes 0..29 base */
        1,
        2,
        3,
        4,
        5,
        7,
        9,
        13,
        17,
        25,
        33,
        49,
        65,
        97,
        129,
        193,
        257,
        385,
        513,
        769,
        1025,
        1537,
        2049,
        3073,
        4097,
        6145,
        8193,
        12289,
        16385,
        24577,
        0,
        0
      ];
      var dext = [
        /* Distance codes 0..29 extra */
        16,
        16,
        16,
        16,
        17,
        17,
        18,
        18,
        19,
        19,
        20,
        20,
        21,
        21,
        22,
        22,
        23,
        23,
        24,
        24,
        25,
        25,
        26,
        26,
        27,
        27,
        28,
        28,
        29,
        29,
        64,
        64
      ];
      module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
        var bits = opts.bits;
        var len2 = 0;
        var sym = 0;
        var min2 = 0, max2 = 0;
        var root = 0;
        var curr = 0;
        var drop = 0;
        var left = 0;
        var used = 0;
        var huff = 0;
        var incr;
        var fill;
        var low;
        var mask;
        var next;
        var base = null;
        var base_index = 0;
        var end;
        var count = new utils.Buf16(MAXBITS + 1);
        var offs = new utils.Buf16(MAXBITS + 1);
        var extra = null;
        var extra_index = 0;
        var here_bits, here_op, here_val;
        for (len2 = 0; len2 <= MAXBITS; len2++) {
          count[len2] = 0;
        }
        for (sym = 0; sym < codes; sym++) {
          count[lens[lens_index + sym]]++;
        }
        root = bits;
        for (max2 = MAXBITS; max2 >= 1; max2--) {
          if (count[max2] !== 0) {
            break;
          }
        }
        if (root > max2) {
          root = max2;
        }
        if (max2 === 0) {
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          opts.bits = 1;
          return 0;
        }
        for (min2 = 1; min2 < max2; min2++) {
          if (count[min2] !== 0) {
            break;
          }
        }
        if (root < min2) {
          root = min2;
        }
        left = 1;
        for (len2 = 1; len2 <= MAXBITS; len2++) {
          left <<= 1;
          left -= count[len2];
          if (left < 0) {
            return -1;
          }
        }
        if (left > 0 && (type === CODES || max2 !== 1)) {
          return -1;
        }
        offs[1] = 0;
        for (len2 = 1; len2 < MAXBITS; len2++) {
          offs[len2 + 1] = offs[len2] + count[len2];
        }
        for (sym = 0; sym < codes; sym++) {
          if (lens[lens_index + sym] !== 0) {
            work[offs[lens[lens_index + sym]]++] = sym;
          }
        }
        if (type === CODES) {
          base = extra = work;
          end = 19;
        } else if (type === LENS) {
          base = lbase;
          base_index -= 257;
          extra = lext;
          extra_index -= 257;
          end = 256;
        } else {
          base = dbase;
          extra = dext;
          end = -1;
        }
        huff = 0;
        sym = 0;
        len2 = min2;
        next = table_index;
        curr = root;
        drop = 0;
        low = -1;
        used = 1 << root;
        mask = used - 1;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        for (; ; ) {
          here_bits = len2 - drop;
          if (work[sym] < end) {
            here_op = 0;
            here_val = work[sym];
          } else if (work[sym] > end) {
            here_op = extra[extra_index + work[sym]];
            here_val = base[base_index + work[sym]];
          } else {
            here_op = 32 + 64;
            here_val = 0;
          }
          incr = 1 << len2 - drop;
          fill = 1 << curr;
          min2 = fill;
          do {
            fill -= incr;
            table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
          } while (fill !== 0);
          incr = 1 << len2 - 1;
          while (huff & incr) {
            incr >>= 1;
          }
          if (incr !== 0) {
            huff &= incr - 1;
            huff += incr;
          } else {
            huff = 0;
          }
          sym++;
          if (--count[len2] === 0) {
            if (len2 === max2) {
              break;
            }
            len2 = lens[lens_index + work[sym]];
          }
          if (len2 > root && (huff & mask) !== low) {
            if (drop === 0) {
              drop = root;
            }
            next += min2;
            curr = len2 - drop;
            left = 1 << curr;
            while (curr + drop < max2) {
              left -= count[curr + drop];
              if (left <= 0) {
                break;
              }
              curr++;
              left <<= 1;
            }
            used += 1 << curr;
            if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
              return 1;
            }
            low = huff & mask;
            table[low] = root << 24 | curr << 16 | next - table_index | 0;
          }
        }
        if (huff !== 0) {
          table[next + huff] = len2 - drop << 24 | 64 << 16 | 0;
        }
        opts.bits = root;
        return 0;
      };
    }
  });

  // ../../node_modules/pako/lib/zlib/inflate.js
  var require_inflate = __commonJS({
    "../../node_modules/pako/lib/zlib/inflate.js"(exports) {
      "use strict";
      var utils = require_common();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var inflate_fast = require_inffast();
      var inflate_table = require_inftrees();
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var Z_FINISH = 4;
      var Z_BLOCK = 5;
      var Z_TREES = 6;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_NEED_DICT = 2;
      var Z_STREAM_ERROR = -2;
      var Z_DATA_ERROR = -3;
      var Z_MEM_ERROR = -4;
      var Z_BUF_ERROR = -5;
      var Z_DEFLATED = 8;
      var HEAD = 1;
      var FLAGS = 2;
      var TIME = 3;
      var OS = 4;
      var EXLEN = 5;
      var EXTRA = 6;
      var NAME = 7;
      var COMMENT = 8;
      var HCRC = 9;
      var DICTID = 10;
      var DICT = 11;
      var TYPE = 12;
      var TYPEDO = 13;
      var STORED = 14;
      var COPY_ = 15;
      var COPY = 16;
      var TABLE = 17;
      var LENLENS = 18;
      var CODELENS = 19;
      var LEN_ = 20;
      var LEN = 21;
      var LENEXT = 22;
      var DIST = 23;
      var DISTEXT = 24;
      var MATCH = 25;
      var LIT = 26;
      var CHECK = 27;
      var LENGTH = 28;
      var DONE = 29;
      var BAD = 30;
      var MEM = 31;
      var SYNC = 32;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var MAX_WBITS = 15;
      var DEF_WBITS = MAX_WBITS;
      function zswap32(q) {
        return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
      }
      function InflateState() {
        this.mode = 0;
        this.last = false;
        this.wrap = 0;
        this.havedict = false;
        this.flags = 0;
        this.dmax = 0;
        this.check = 0;
        this.total = 0;
        this.head = null;
        this.wbits = 0;
        this.wsize = 0;
        this.whave = 0;
        this.wnext = 0;
        this.window = null;
        this.hold = 0;
        this.bits = 0;
        this.length = 0;
        this.offset = 0;
        this.extra = 0;
        this.lencode = null;
        this.distcode = null;
        this.lenbits = 0;
        this.distbits = 0;
        this.ncode = 0;
        this.nlen = 0;
        this.ndist = 0;
        this.have = 0;
        this.next = null;
        this.lens = new utils.Buf16(320);
        this.work = new utils.Buf16(288);
        this.lendyn = null;
        this.distdyn = null;
        this.sane = 0;
        this.back = 0;
        this.was = 0;
      }
      function inflateResetKeep(strm) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        strm.total_in = strm.total_out = state.total = 0;
        strm.msg = "";
        if (state.wrap) {
          strm.adler = state.wrap & 1;
        }
        state.mode = HEAD;
        state.last = 0;
        state.havedict = 0;
        state.dmax = 32768;
        state.head = null;
        state.hold = 0;
        state.bits = 0;
        state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
        state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
        state.sane = 1;
        state.back = -1;
        return Z_OK;
      }
      function inflateReset(strm) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        state.wsize = 0;
        state.whave = 0;
        state.wnext = 0;
        return inflateResetKeep(strm);
      }
      function inflateReset2(strm, windowBits) {
        var wrap;
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else {
          wrap = (windowBits >> 4) + 1;
          if (windowBits < 48) {
            windowBits &= 15;
          }
        }
        if (windowBits && (windowBits < 8 || windowBits > 15)) {
          return Z_STREAM_ERROR;
        }
        if (state.window !== null && state.wbits !== windowBits) {
          state.window = null;
        }
        state.wrap = wrap;
        state.wbits = windowBits;
        return inflateReset(strm);
      }
      function inflateInit2(strm, windowBits) {
        var ret;
        var state;
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        state = new InflateState();
        strm.state = state;
        state.window = null;
        ret = inflateReset2(strm, windowBits);
        if (ret !== Z_OK) {
          strm.state = null;
        }
        return ret;
      }
      function inflateInit(strm) {
        return inflateInit2(strm, DEF_WBITS);
      }
      var virgin = true;
      var lenfix;
      var distfix;
      function fixedtables(state) {
        if (virgin) {
          var sym;
          lenfix = new utils.Buf32(512);
          distfix = new utils.Buf32(32);
          sym = 0;
          while (sym < 144) {
            state.lens[sym++] = 8;
          }
          while (sym < 256) {
            state.lens[sym++] = 9;
          }
          while (sym < 280) {
            state.lens[sym++] = 7;
          }
          while (sym < 288) {
            state.lens[sym++] = 8;
          }
          inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
          sym = 0;
          while (sym < 32) {
            state.lens[sym++] = 5;
          }
          inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
          virgin = false;
        }
        state.lencode = lenfix;
        state.lenbits = 9;
        state.distcode = distfix;
        state.distbits = 5;
      }
      function updatewindow(strm, src, end, copy4) {
        var dist2;
        var state = strm.state;
        if (state.window === null) {
          state.wsize = 1 << state.wbits;
          state.wnext = 0;
          state.whave = 0;
          state.window = new utils.Buf8(state.wsize);
        }
        if (copy4 >= state.wsize) {
          utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
          state.wnext = 0;
          state.whave = state.wsize;
        } else {
          dist2 = state.wsize - state.wnext;
          if (dist2 > copy4) {
            dist2 = copy4;
          }
          utils.arraySet(state.window, src, end - copy4, dist2, state.wnext);
          copy4 -= dist2;
          if (copy4) {
            utils.arraySet(state.window, src, end - copy4, copy4, 0);
            state.wnext = copy4;
            state.whave = state.wsize;
          } else {
            state.wnext += dist2;
            if (state.wnext === state.wsize) {
              state.wnext = 0;
            }
            if (state.whave < state.wsize) {
              state.whave += dist2;
            }
          }
        }
        return 0;
      }
      function inflate(strm, flush) {
        var state;
        var input, output;
        var next;
        var put;
        var have, left;
        var hold;
        var bits;
        var _in, _out;
        var copy4;
        var from;
        var from_source;
        var here = 0;
        var here_bits, here_op, here_val;
        var last_bits, last_op, last_val;
        var len2;
        var ret;
        var hbuf = new utils.Buf8(4);
        var opts;
        var n;
        var order = (
          /* permutation of code lengths */
          [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
        );
        if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.mode === TYPE) {
          state.mode = TYPEDO;
        }
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        _in = have;
        _out = left;
        ret = Z_OK;
        inf_leave:
          for (; ; ) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0;
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || /* check if zlib header allowed */
                (((hold & 255) << 8) + (hold >> 8)) % 31) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len2 = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len2;
                } else if (len2 > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len2;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = hold >> 8 & 1;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  hbuf[2] = hold >>> 16 & 255;
                  hbuf[3] = hold >>> 24 & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = hold >>> 8 & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              case EXTRA:
                if (state.flags & 1024) {
                  copy4 = state.length;
                  if (copy4 > have) {
                    copy4 = have;
                  }
                  if (copy4) {
                    if (state.head) {
                      len2 = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      utils.arraySet(
                        state.head.extra,
                        input,
                        next,
                        // extra field is limited to 65536 bytes
                        // - no need for additional size check
                        copy4,
                        /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                        len2
                      );
                    }
                    if (state.flags & 512) {
                      state.check = crc32(state.check, input, copy4, next);
                    }
                    have -= copy4;
                    next += copy4;
                    state.length -= copy4;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy4 = 0;
                  do {
                    len2 = input[next + copy4++];
                    if (state.head && len2 && state.length < 65536) {
                      state.head.name += String.fromCharCode(len2);
                    }
                  } while (len2 && copy4 < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy4, next);
                  }
                  have -= copy4;
                  next += copy4;
                  if (len2) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy4 = 0;
                  do {
                    len2 = input[next + copy4++];
                    if (state.head && len2 && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len2);
                    }
                  } while (len2 && copy4 < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy4, next);
                  }
                  have -= copy4;
                  next += copy4;
                  if (len2) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = state.flags >> 9 & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = zswap32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case COPY_:
                state.mode = COPY;
              case COPY:
                copy4 = state.length;
                if (copy4) {
                  if (copy4 > have) {
                    copy4 = have;
                  }
                  if (copy4 > left) {
                    copy4 = left;
                  }
                  if (copy4 === 0) {
                    break inf_leave;
                  }
                  utils.arraySet(output, input, next, copy4, put);
                  have -= copy4;
                  next += copy4;
                  left -= copy4;
                  put += copy4;
                  state.length -= copy4;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (; ; ) {
                    here = state.lencode[hold & (1 << state.lenbits) - 1];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len2 = state.lens[state.have - 1];
                      copy4 = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len2 = 0;
                      copy4 = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len2 = 0;
                      copy4 = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy4 > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy4--) {
                      state.lens[state.have++] = len2;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              case LEN_:
                state.mode = LEN;
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              case DIST:
                for (; ; ) {
                  here = state.distcode[hold & (1 << state.distbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy4 = _out - left;
                if (state.offset > copy4) {
                  copy4 = state.offset - copy4;
                  if (copy4 > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy4 > state.wnext) {
                    copy4 -= state.wnext;
                    from = state.wsize - copy4;
                  } else {
                    from = state.wnext - copy4;
                  }
                  if (copy4 > state.length) {
                    copy4 = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy4 = state.length;
                }
                if (copy4 > left) {
                  copy4 = left;
                }
                left -= copy4;
                state.length -= copy4;
                do {
                  output[put++] = from_source[from++];
                } while (--copy4);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                    state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              default:
                return Z_STREAM_ERROR;
            }
          }
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
          if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
            state.mode = MEM;
            return Z_MEM_ERROR;
          }
        }
        _in -= strm.avail_in;
        _out -= strm.avail_out;
        strm.total_in += _in;
        strm.total_out += _out;
        state.total += _out;
        if (state.wrap && _out) {
          strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
          state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
        }
        strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
        if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
          ret = Z_BUF_ERROR;
        }
        return ret;
      }
      function inflateEnd(strm) {
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        var state = strm.state;
        if (state.window) {
          state.window = null;
        }
        strm.state = null;
        return Z_OK;
      }
      function inflateGetHeader(strm, head) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if ((state.wrap & 2) === 0) {
          return Z_STREAM_ERROR;
        }
        state.head = head;
        head.done = false;
        return Z_OK;
      }
      function inflateSetDictionary(strm, dictionary) {
        var dictLength = dictionary.length;
        var state;
        var dictid;
        var ret;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.wrap !== 0 && state.mode !== DICT) {
          return Z_STREAM_ERROR;
        }
        if (state.mode === DICT) {
          dictid = 1;
          dictid = adler32(dictid, dictionary, dictLength, 0);
          if (dictid !== state.check) {
            return Z_DATA_ERROR;
          }
        }
        ret = updatewindow(strm, dictionary, dictLength, dictLength);
        if (ret) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
        state.havedict = 1;
        return Z_OK;
      }
      exports.inflateReset = inflateReset;
      exports.inflateReset2 = inflateReset2;
      exports.inflateResetKeep = inflateResetKeep;
      exports.inflateInit = inflateInit;
      exports.inflateInit2 = inflateInit2;
      exports.inflate = inflate;
      exports.inflateEnd = inflateEnd;
      exports.inflateGetHeader = inflateGetHeader;
      exports.inflateSetDictionary = inflateSetDictionary;
      exports.inflateInfo = "pako inflate (from Nodeca project)";
    }
  });

  // ../../node_modules/pako/lib/zlib/constants.js
  var require_constants = __commonJS({
    "../../node_modules/pako/lib/zlib/constants.js"(exports, module) {
      "use strict";
      module.exports = {
        /* Allowed flush values; see deflate() and inflate() below for details */
        Z_NO_FLUSH: 0,
        Z_PARTIAL_FLUSH: 1,
        Z_SYNC_FLUSH: 2,
        Z_FULL_FLUSH: 3,
        Z_FINISH: 4,
        Z_BLOCK: 5,
        Z_TREES: 6,
        /* Return codes for the compression/decompression functions. Negative values
        * are errors, positive values are used for special but normal events.
        */
        Z_OK: 0,
        Z_STREAM_END: 1,
        Z_NEED_DICT: 2,
        Z_ERRNO: -1,
        Z_STREAM_ERROR: -2,
        Z_DATA_ERROR: -3,
        //Z_MEM_ERROR:     -4,
        Z_BUF_ERROR: -5,
        //Z_VERSION_ERROR: -6,
        /* compression levels */
        Z_NO_COMPRESSION: 0,
        Z_BEST_SPEED: 1,
        Z_BEST_COMPRESSION: 9,
        Z_DEFAULT_COMPRESSION: -1,
        Z_FILTERED: 1,
        Z_HUFFMAN_ONLY: 2,
        Z_RLE: 3,
        Z_FIXED: 4,
        Z_DEFAULT_STRATEGY: 0,
        /* Possible values of the data_type field (though see inflate()) */
        Z_BINARY: 0,
        Z_TEXT: 1,
        //Z_ASCII:                1, // = Z_TEXT (deprecated)
        Z_UNKNOWN: 2,
        /* The deflate compression method */
        Z_DEFLATED: 8
        //Z_NULL:                 null // Use -1 or null inline, depending on var type
      };
    }
  });

  // ../../node_modules/pako/lib/zlib/gzheader.js
  var require_gzheader = __commonJS({
    "../../node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
      "use strict";
      function GZheader() {
        this.text = 0;
        this.time = 0;
        this.xflags = 0;
        this.os = 0;
        this.extra = null;
        this.extra_len = 0;
        this.name = "";
        this.comment = "";
        this.hcrc = 0;
        this.done = false;
      }
      module.exports = GZheader;
    }
  });

  // ../../node_modules/pako/lib/inflate.js
  var require_inflate2 = __commonJS({
    "../../node_modules/pako/lib/inflate.js"(exports) {
      "use strict";
      var zlib_inflate = require_inflate();
      var utils = require_common();
      var strings = require_strings();
      var c = require_constants();
      var msg = require_messages();
      var ZStream = require_zstream();
      var GZheader = require_gzheader();
      var toString2 = Object.prototype.toString;
      function Inflate(options) {
        if (!(this instanceof Inflate))
          return new Inflate(options);
        this.options = utils.assign({
          chunkSize: 16384,
          windowBits: 0,
          to: ""
        }, options || {});
        var opt = this.options;
        if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
          opt.windowBits = -opt.windowBits;
          if (opt.windowBits === 0) {
            opt.windowBits = -15;
          }
        }
        if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
          opt.windowBits += 32;
        }
        if (opt.windowBits > 15 && opt.windowBits < 48) {
          if ((opt.windowBits & 15) === 0) {
            opt.windowBits |= 15;
          }
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        var status = zlib_inflate.inflateInit2(
          this.strm,
          opt.windowBits
        );
        if (status !== c.Z_OK) {
          throw new Error(msg[status]);
        }
        this.header = new GZheader();
        zlib_inflate.inflateGetHeader(this.strm, this.header);
        if (opt.dictionary) {
          if (typeof opt.dictionary === "string") {
            opt.dictionary = strings.string2buf(opt.dictionary);
          } else if (toString2.call(opt.dictionary) === "[object ArrayBuffer]") {
            opt.dictionary = new Uint8Array(opt.dictionary);
          }
          if (opt.raw) {
            status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
            if (status !== c.Z_OK) {
              throw new Error(msg[status]);
            }
          }
        }
      }
      Inflate.prototype.push = function(data, mode) {
        var strm = this.strm;
        var chunkSize = this.options.chunkSize;
        var dictionary = this.options.dictionary;
        var status, _mode;
        var next_out_utf8, tail, utf8str;
        var allowBufError = false;
        if (this.ended) {
          return false;
        }
        _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.binstring2buf(data);
        } else if (toString2.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        do {
          if (strm.avail_out === 0) {
            strm.output = new utils.Buf8(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
          if (status === c.Z_NEED_DICT && dictionary) {
            status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
          }
          if (status === c.Z_BUF_ERROR && allowBufError === true) {
            status = c.Z_OK;
            allowBufError = false;
          }
          if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
            this.onEnd(status);
            this.ended = true;
            return false;
          }
          if (strm.next_out) {
            if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
              if (this.options.to === "string") {
                next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
                tail = strm.next_out - next_out_utf8;
                utf8str = strings.buf2string(strm.output, next_out_utf8);
                strm.next_out = tail;
                strm.avail_out = chunkSize - tail;
                if (tail) {
                  utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
                }
                this.onData(utf8str);
              } else {
                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
              }
            }
          }
          if (strm.avail_in === 0 && strm.avail_out === 0) {
            allowBufError = true;
          }
        } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
        if (status === c.Z_STREAM_END) {
          _mode = c.Z_FINISH;
        }
        if (_mode === c.Z_FINISH) {
          status = zlib_inflate.inflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return status === c.Z_OK;
        }
        if (_mode === c.Z_SYNC_FLUSH) {
          this.onEnd(c.Z_OK);
          strm.avail_out = 0;
          return true;
        }
        return true;
      };
      Inflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Inflate.prototype.onEnd = function(status) {
        if (status === c.Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function inflate(input, options) {
        var inflator = new Inflate(options);
        inflator.push(input, true);
        if (inflator.err) {
          throw inflator.msg || msg[inflator.err];
        }
        return inflator.result;
      }
      function inflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return inflate(input, options);
      }
      exports.Inflate = Inflate;
      exports.inflate = inflate;
      exports.inflateRaw = inflateRaw;
      exports.ungzip = inflate;
    }
  });

  // ../../node_modules/pako/index.js
  var require_pako = __commonJS({
    "../../node_modules/pako/index.js"(exports, module) {
      "use strict";
      var assign = require_common().assign;
      var deflate = require_deflate2();
      var inflate = require_inflate2();
      var constants = require_constants();
      var pako2 = {};
      assign(pako2, deflate, inflate, constants);
      module.exports = pako2;
    }
  });

  // (disabled):zlib
  var require_zlib = __commonJS({
    "(disabled):zlib"() {
    }
  });

  // bundle.ts
  var bundle_exports = {};
  __export(bundle_exports, {
    CesiumIonLoader: () => CesiumIonLoader,
    TILE3D_TYPE: () => TILE3D_TYPE,
    Tile3DBatchTable: () => Tile3DBatchTableParser,
    Tile3DFeatureTable: () => Tile3DFeatureTable,
    Tile3DSubtreeLoader: () => Tile3DSubtreeLoader,
    Tile3DWriter: () => Tile3DWriter,
    Tiles3DArchive: () => Tiles3DArchive,
    Tiles3DArchiveFileLoader: () => Tiles3DArchiveFileLoader,
    Tiles3DLoader: () => Tiles3DLoader,
    _getIonTilesetMetadata: () => getIonTilesetMetadata
  });
  __reExport(bundle_exports, __toESM(require_core(), 1));

  // ../loader-utils/src/loader-types.ts
  async function parseFromContext(data, loaders, options, context) {
    return context._parse(data, loaders, options, context);
  }

  // ../loader-utils/src/lib/env-utils/assert.ts
  function assert2(condition, message) {
    if (!condition) {
      throw new Error(message || "loader assertion failed.");
    }
  }

  // ../loader-utils/src/lib/env-utils/globals.ts
  var globals = {
    self: typeof self !== "undefined" && self,
    window: typeof window !== "undefined" && window,
    global: typeof global !== "undefined" && global,
    document: typeof document !== "undefined" && document
  };
  var self_ = globals.self || globals.window || globals.global || {};
  var window_ = globals.window || globals.self || globals.global || {};
  var global_ = globals.global || globals.self || globals.window || {};
  var document_ = globals.document || {};
  var isBrowser = (
    // @ts-ignore process does not exist on browser
    Boolean(typeof process !== "object" || String(process) !== "[object process]" || process.browser)
  );
  var matches = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
  var nodeVersion = matches && parseFloat(matches[1]) || 0;

  // ../../node_modules/@probe.gl/env/dist/lib/globals.js
  var window_2 = globalThis;
  var document_2 = globalThis.document || {};
  var process_ = globalThis.process || {};
  var console_ = globalThis.console;
  var navigator_ = globalThis.navigator || {};

  // ../../node_modules/@probe.gl/env/dist/lib/is-electron.js
  function isElectron(mockUserAgent) {
    if (typeof window !== "undefined" && window.process?.type === "renderer") {
      return true;
    }
    if (typeof process !== "undefined" && Boolean(process.versions?.["electron"])) {
      return true;
    }
    const realUserAgent = typeof navigator !== "undefined" && navigator.userAgent;
    const userAgent = mockUserAgent || realUserAgent;
    return Boolean(userAgent && userAgent.indexOf("Electron") >= 0);
  }

  // ../../node_modules/@probe.gl/env/dist/lib/is-browser.js
  function isBrowser2() {
    const isNode = (
      // @ts-expect-error
      typeof process === "object" && String(process) === "[object process]" && !process?.browser
    );
    return !isNode || isElectron();
  }

  // ../../node_modules/@probe.gl/env/dist/index.js
  var VERSION = true ? "4.1.1" : "untranspiled source";

  // ../../node_modules/@probe.gl/log/dist/utils/assert.js
  function assert3(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  // ../../node_modules/@probe.gl/log/dist/loggers/log-utils.js
  function normalizeLogLevel(logLevel) {
    if (!logLevel) {
      return 0;
    }
    let resolvedLevel;
    switch (typeof logLevel) {
      case "number":
        resolvedLevel = logLevel;
        break;
      case "object":
        resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
        break;
      default:
        return 0;
    }
    assert3(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
    return resolvedLevel;
  }
  function normalizeArguments(opts) {
    const { logLevel, message } = opts;
    opts.logLevel = normalizeLogLevel(logLevel);
    const args = opts.args ? Array.from(opts.args) : [];
    while (args.length && args.shift() !== message) {
    }
    switch (typeof logLevel) {
      case "string":
      case "function":
        if (message !== void 0) {
          args.unshift(message);
        }
        opts.message = logLevel;
        break;
      case "object":
        Object.assign(opts, logLevel);
        break;
      default:
    }
    if (typeof opts.message === "function") {
      opts.message = opts.message();
    }
    const messageType = typeof opts.message;
    assert3(messageType === "string" || messageType === "object");
    return Object.assign(opts, { args }, opts.opts);
  }

  // ../../node_modules/@probe.gl/log/dist/loggers/base-log.js
  var noop = () => {
  };
  var BaseLog = class {
    constructor({ level = 0 } = {}) {
      this.userData = {};
      this._onceCache = /* @__PURE__ */ new Set();
      this._level = level;
    }
    set level(newLevel) {
      this.setLevel(newLevel);
    }
    get level() {
      return this.getLevel();
    }
    setLevel(level) {
      this._level = level;
      return this;
    }
    getLevel() {
      return this._level;
    }
    // Unconditional logging
    warn(message, ...args) {
      return this._log("warn", 0, message, args, { once: true });
    }
    error(message, ...args) {
      return this._log("error", 0, message, args);
    }
    // Conditional logging
    log(logLevel, message, ...args) {
      return this._log("log", logLevel, message, args);
    }
    info(logLevel, message, ...args) {
      return this._log("info", logLevel, message, args);
    }
    once(logLevel, message, ...args) {
      return this._log("once", logLevel, message, args, { once: true });
    }
    _log(type, logLevel, message, args, options = {}) {
      const normalized = normalizeArguments({
        logLevel,
        message,
        args: this._buildArgs(logLevel, message, args),
        opts: options
      });
      return this._createLogFunction(type, normalized, options);
    }
    _buildArgs(logLevel, message, args) {
      return [logLevel, message, ...args];
    }
    _createLogFunction(type, normalized, options) {
      if (!this._shouldLog(normalized.logLevel)) {
        return noop;
      }
      const tag = this._getOnceTag(options.tag ?? normalized.tag ?? normalized.message);
      if ((options.once || normalized.once) && tag !== void 0) {
        if (this._onceCache.has(tag)) {
          return noop;
        }
        this._onceCache.add(tag);
      }
      return this._emit(type, normalized);
    }
    _shouldLog(logLevel) {
      return this.getLevel() >= normalizeLogLevel(logLevel);
    }
    _getOnceTag(tag) {
      if (tag === void 0) {
        return void 0;
      }
      try {
        return typeof tag === "string" ? tag : String(tag);
      } catch {
        return void 0;
      }
    }
  };

  // ../../node_modules/@probe.gl/log/dist/utils/local-storage.js
  function getStorage(type) {
    try {
      const storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return storage;
    } catch (e) {
      return null;
    }
  }
  var LocalStorage = class {
    constructor(id, defaultConfig, type = "sessionStorage") {
      this.storage = getStorage(type);
      this.id = id;
      this.config = defaultConfig;
      this._loadConfiguration();
    }
    getConfiguration() {
      return this.config;
    }
    setConfiguration(configuration) {
      Object.assign(this.config, configuration);
      if (this.storage) {
        const serialized = JSON.stringify(this.config);
        this.storage.setItem(this.id, serialized);
      }
    }
    // Get config from persistent store, if available
    _loadConfiguration() {
      let configuration = {};
      if (this.storage) {
        const serializedConfiguration = this.storage.getItem(this.id);
        configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
      }
      Object.assign(this.config, configuration);
      return this;
    }
  };

  // ../../node_modules/@probe.gl/log/dist/utils/formatters.js
  function formatTime(ms) {
    let formatted;
    if (ms < 10) {
      formatted = `${ms.toFixed(2)}ms`;
    } else if (ms < 100) {
      formatted = `${ms.toFixed(1)}ms`;
    } else if (ms < 1e3) {
      formatted = `${ms.toFixed(0)}ms`;
    } else {
      formatted = `${(ms / 1e3).toFixed(2)}s`;
    }
    return formatted;
  }
  function leftPad(string, length4 = 8) {
    const padLength = Math.max(length4 - string.length, 0);
    return `${" ".repeat(padLength)}${string}`;
  }

  // ../../node_modules/@probe.gl/log/dist/utils/color.js
  var COLOR;
  (function(COLOR2) {
    COLOR2[COLOR2["BLACK"] = 30] = "BLACK";
    COLOR2[COLOR2["RED"] = 31] = "RED";
    COLOR2[COLOR2["GREEN"] = 32] = "GREEN";
    COLOR2[COLOR2["YELLOW"] = 33] = "YELLOW";
    COLOR2[COLOR2["BLUE"] = 34] = "BLUE";
    COLOR2[COLOR2["MAGENTA"] = 35] = "MAGENTA";
    COLOR2[COLOR2["CYAN"] = 36] = "CYAN";
    COLOR2[COLOR2["WHITE"] = 37] = "WHITE";
    COLOR2[COLOR2["BRIGHT_BLACK"] = 90] = "BRIGHT_BLACK";
    COLOR2[COLOR2["BRIGHT_RED"] = 91] = "BRIGHT_RED";
    COLOR2[COLOR2["BRIGHT_GREEN"] = 92] = "BRIGHT_GREEN";
    COLOR2[COLOR2["BRIGHT_YELLOW"] = 93] = "BRIGHT_YELLOW";
    COLOR2[COLOR2["BRIGHT_BLUE"] = 94] = "BRIGHT_BLUE";
    COLOR2[COLOR2["BRIGHT_MAGENTA"] = 95] = "BRIGHT_MAGENTA";
    COLOR2[COLOR2["BRIGHT_CYAN"] = 96] = "BRIGHT_CYAN";
    COLOR2[COLOR2["BRIGHT_WHITE"] = 97] = "BRIGHT_WHITE";
  })(COLOR || (COLOR = {}));
  var BACKGROUND_INCREMENT = 10;
  function getColor(color) {
    if (typeof color !== "string") {
      return color;
    }
    color = color.toUpperCase();
    return COLOR[color] || COLOR.WHITE;
  }
  function addColor(string, color, background) {
    if (!isBrowser2 && typeof string === "string") {
      if (color) {
        const colorCode = getColor(color);
        string = `\x1B[${colorCode}m${string}\x1B[39m`;
      }
      if (background) {
        const colorCode = getColor(background);
        string = `\x1B[${colorCode + BACKGROUND_INCREMENT}m${string}\x1B[49m`;
      }
    }
    return string;
  }

  // ../../node_modules/@probe.gl/log/dist/utils/autobind.js
  function autobind(obj, predefined = ["constructor"]) {
    const proto = Object.getPrototypeOf(obj);
    const propNames = Object.getOwnPropertyNames(proto);
    const object = obj;
    for (const key of propNames) {
      const value = object[key];
      if (typeof value === "function") {
        if (!predefined.find((name14) => key === name14)) {
          object[key] = value.bind(obj);
        }
      }
    }
  }

  // ../../node_modules/@probe.gl/log/dist/utils/hi-res-timestamp.js
  function getHiResTimestamp() {
    let timestamp;
    if (isBrowser2() && window_2.performance) {
      timestamp = window_2?.performance?.now?.();
    } else if ("hrtime" in process_) {
      const timeParts = process_?.hrtime?.();
      timestamp = timeParts[0] * 1e3 + timeParts[1] / 1e6;
    } else {
      timestamp = Date.now();
    }
    return timestamp;
  }

  // ../../node_modules/@probe.gl/log/dist/loggers/probe-log.js
  var originalConsole = {
    debug: isBrowser2() ? console.debug || console.log : console.log,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  var DEFAULT_LOG_CONFIGURATION = {
    enabled: true,
    level: 0
  };
  var ProbeLog = class extends BaseLog {
    constructor({ id } = { id: "" }) {
      super({ level: 0 });
      this.VERSION = VERSION;
      this._startTs = getHiResTimestamp();
      this._deltaTs = getHiResTimestamp();
      this.userData = {};
      this.LOG_THROTTLE_TIMEOUT = 0;
      this.id = id;
      this.userData = {};
      this._storage = new LocalStorage(`__probe-${this.id}__`, { [this.id]: DEFAULT_LOG_CONFIGURATION });
      this.timeStamp(`${this.id} started`);
      autobind(this);
      Object.seal(this);
    }
    isEnabled() {
      return this._getConfiguration().enabled;
    }
    getLevel() {
      return this._getConfiguration().level;
    }
    /** @return milliseconds, with fractions */
    getTotal() {
      return Number((getHiResTimestamp() - this._startTs).toPrecision(10));
    }
    /** @return milliseconds, with fractions */
    getDelta() {
      return Number((getHiResTimestamp() - this._deltaTs).toPrecision(10));
    }
    /** @deprecated use logLevel */
    set priority(newPriority) {
      this.level = newPriority;
    }
    /** @deprecated use logLevel */
    get priority() {
      return this.level;
    }
    /** @deprecated use logLevel */
    getPriority() {
      return this.level;
    }
    // Configure
    enable(enabled = true) {
      this._updateConfiguration({ enabled });
      return this;
    }
    setLevel(level) {
      this._updateConfiguration({ level });
      return this;
    }
    /** return the current status of the setting */
    get(setting) {
      return this._getConfiguration()[setting];
    }
    // update the status of the setting
    set(setting, value) {
      this._updateConfiguration({ [setting]: value });
    }
    /** Logs the current settings as a table */
    settings() {
      if (console.table) {
        console.table(this._storage.config);
      } else {
        console.log(this._storage.config);
      }
    }
    // Unconditional logging
    assert(condition, message) {
      if (!condition) {
        throw new Error(message || "Assertion failed");
      }
    }
    warn(message, ...args) {
      return this._log("warn", 0, message, args, {
        method: originalConsole.warn,
        once: true
      });
    }
    error(message, ...args) {
      return this._log("error", 0, message, args, {
        method: originalConsole.error
      });
    }
    /** Print a deprecation warning */
    deprecated(oldUsage, newUsage) {
      return this.warn(`\`${oldUsage}\` is deprecated and will be removed in a later version. Use \`${newUsage}\` instead`);
    }
    /** Print a removal warning */
    removed(oldUsage, newUsage) {
      return this.error(`\`${oldUsage}\` has been removed. Use \`${newUsage}\` instead`);
    }
    probe(logLevel, message, ...args) {
      return this._log("log", logLevel, message, args, {
        method: originalConsole.log,
        time: true,
        once: true
      });
    }
    log(logLevel, message, ...args) {
      return this._log("log", logLevel, message, args, {
        method: originalConsole.debug
      });
    }
    info(logLevel, message, ...args) {
      return this._log("info", logLevel, message, args, { method: console.info });
    }
    once(logLevel, message, ...args) {
      return this._log("once", logLevel, message, args, {
        method: originalConsole.debug || originalConsole.info,
        once: true
      });
    }
    /** Logs an object as a table */
    table(logLevel, table, columns) {
      if (table) {
        return this._log("table", logLevel, table, columns && [columns] || [], {
          method: console.table || noop,
          tag: getTableHeader(table)
        });
      }
      return noop;
    }
    time(logLevel, message) {
      return this._log("time", logLevel, message, [], {
        method: console.time ? console.time : console.info
      });
    }
    timeEnd(logLevel, message) {
      return this._log("time", logLevel, message, [], {
        method: console.timeEnd ? console.timeEnd : console.info
      });
    }
    timeStamp(logLevel, message) {
      return this._log("time", logLevel, message, [], {
        method: console.timeStamp || noop
      });
    }
    group(logLevel, message, opts = { collapsed: false }) {
      const method = (opts.collapsed ? console.groupCollapsed : console.group) || console.info;
      return this._log("group", logLevel, message, [], { method });
    }
    groupCollapsed(logLevel, message, opts = {}) {
      return this.group(logLevel, message, Object.assign({}, opts, { collapsed: true }));
    }
    groupEnd(logLevel) {
      return this._log("groupEnd", logLevel, "", [], {
        method: console.groupEnd || noop
      });
    }
    // EXPERIMENTAL
    withGroup(logLevel, message, func) {
      this.group(logLevel, message)();
      try {
        func();
      } finally {
        this.groupEnd(logLevel)();
      }
    }
    trace() {
      if (console.trace) {
        console.trace();
      }
    }
    _shouldLog(logLevel) {
      return this.isEnabled() && super._shouldLog(logLevel);
    }
    _emit(_type, normalized) {
      const method = normalized.method;
      assert3(method);
      normalized.total = this.getTotal();
      normalized.delta = this.getDelta();
      this._deltaTs = getHiResTimestamp();
      const message = decorateMessage(this.id, normalized.message, normalized);
      return method.bind(console, message, ...normalized.args);
    }
    _getConfiguration() {
      if (!this._storage.config[this.id]) {
        this._updateConfiguration(DEFAULT_LOG_CONFIGURATION);
      }
      return this._storage.config[this.id];
    }
    _updateConfiguration(configuration) {
      const currentConfiguration = this._storage.config[this.id] || {
        ...DEFAULT_LOG_CONFIGURATION
      };
      this._storage.setConfiguration({
        [this.id]: { ...currentConfiguration, ...configuration }
      });
    }
  };
  ProbeLog.VERSION = VERSION;
  function decorateMessage(id, message, opts) {
    if (typeof message === "string") {
      const time = opts.time ? leftPad(formatTime(opts.total)) : "";
      message = opts.time ? `${id}: ${time}  ${message}` : `${id}: ${message}`;
      message = addColor(message, opts.color, opts.background);
    }
    return message;
  }
  function getTableHeader(table) {
    for (const key in table) {
      for (const title in table[key]) {
        return title || "untitled";
      }
    }
    return "empty";
  }

  // ../../node_modules/@probe.gl/log/dist/init.js
  globalThis.probe = {};

  // ../../node_modules/@probe.gl/log/dist/index.js
  var dist_default = new ProbeLog({ id: "@probe.gl/log" });

  // ../loader-utils/src/lib/javascript-utils/is-type.ts
  var isSharedArrayBuffer = (value) => typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer;

  // ../loader-utils/src/lib/module-utils/js-module-utils.ts
  function registerJSModules(modules) {
    globalThis.loaders ||= {};
    globalThis.loaders.modules ||= {};
    Object.assign(globalThis.loaders.modules, modules);
  }
  function getJSModuleOrNull(name14) {
    const module = globalThis.loaders?.modules?.[name14];
    return module || null;
  }

  // ../worker-utils/src/lib/npm-tag.ts
  var NPM_TAG = "latest";

  // ../worker-utils/src/lib/env-utils/version.ts
  var warningIssued = false;
  function getVersion() {
    if (!globalThis._loadersgl_?.version) {
      globalThis._loadersgl_ = globalThis._loadersgl_ || {};
      if (typeof __VERSION__ === "undefined" && !warningIssued) {
        console.warn(
          "loaders.gl: The __VERSION__ variable is not injected using babel plugin. Latest unstable workers would be fetched from the CDN."
        );
        globalThis._loadersgl_.version = NPM_TAG;
        warningIssued = true;
      } else {
        globalThis._loadersgl_.version = __VERSION__;
      }
    }
    return globalThis._loadersgl_.version;
  }
  var VERSION2 = getVersion();

  // ../worker-utils/src/lib/env-utils/assert.ts
  function assert4(condition, message) {
    if (!condition) {
      throw new Error(message || "loaders.gl assertion failed.");
    }
  }

  // ../worker-utils/src/lib/env-utils/globals.ts
  var globals2 = {
    self: typeof self !== "undefined" && self,
    window: typeof window !== "undefined" && window,
    global: typeof global !== "undefined" && global,
    document: typeof document !== "undefined" && document
  };
  var self_2 = globals2.self || globals2.window || globals2.global || {};
  var window_3 = globals2.window || globals2.self || globals2.global || {};
  var global_3 = globals2.global || globals2.self || globals2.window || {};
  var document_3 = globals2.document || {};
  var isBrowser3 = (
    // @ts-ignore process.browser
    typeof process !== "object" || String(process) !== "[object process]" || process.browser
  );
  var isWorker = typeof importScripts === "function";
  var isMobile = typeof window !== "undefined" && typeof window.orientation !== "undefined";
  var matches2 = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
  var nodeVersion2 = matches2 && parseFloat(matches2[1]) || 0;

  // ../worker-utils/src/lib/library-utils/library-utils.ts
  var loadLibraryPromises = {};
  function extractLoadLibraryOptions(options = {}) {
    const useLocalLibraries = options.useLocalLibraries ?? options.core?.useLocalLibraries;
    const CDN = options.CDN ?? options.core?.CDN;
    const modules = options.modules;
    return {
      ...useLocalLibraries !== void 0 ? { useLocalLibraries } : {},
      ...CDN !== void 0 ? { CDN } : {},
      ...modules !== void 0 ? { modules } : {}
    };
  }
  async function loadLibrary(libraryUrl, moduleName = null, options = {}, libraryName = null) {
    if (moduleName) {
      const injectedLibrary = options.modules?.[libraryName || libraryUrl];
      if (injectedLibrary !== void 0 && typeof injectedLibrary !== "string") {
        return injectedLibrary;
      }
      libraryUrl = getLibraryUrl(libraryUrl, moduleName, options, libraryName);
    }
    loadLibraryPromises[libraryUrl] = // eslint-disable-next-line @typescript-eslint/no-misused-promises
    loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);
    return await loadLibraryPromises[libraryUrl];
  }
  function getLibraryUrl(library, moduleName, options = {}, libraryName = null) {
    if (options?.core) {
      throw new Error("loadLibrary: options.core must be pre-normalized");
    }
    libraryName = libraryName || library;
    const modules = options.modules || {};
    if (typeof modules[libraryName] === "string") {
      return modules[libraryName];
    }
    if (!options.useLocalLibraries && library.startsWith("http")) {
      return library;
    }
    if (!isBrowser3) {
      return `modules/${moduleName}/dist/libs/${libraryName}`;
    }
    if (options.CDN) {
      assert4(options.CDN.startsWith("http"));
      return `${options.CDN}/${moduleName}@${VERSION2}/dist/libs/${libraryName}`;
    }
    if (isWorker) {
      return `../src/libs/${libraryName}`;
    }
    return `modules/${moduleName}/src/libs/${libraryName}`;
  }
  async function loadLibraryFromFile(libraryUrl) {
    if (libraryUrl.endsWith("wasm")) {
      return await loadAsArrayBuffer(libraryUrl);
    }
    if (!isBrowser3) {
      const { requireFromFile } = globalThis.loaders || {};
      try {
        const result = await requireFromFile?.(libraryUrl);
        if (result || !libraryUrl.includes("/dist/libs/")) {
          return result;
        }
        return await requireFromFile?.(libraryUrl.replace("/dist/libs/", "/src/libs/"));
      } catch (error) {
        if (libraryUrl.includes("/dist/libs/")) {
          try {
            return await requireFromFile?.(libraryUrl.replace("/dist/libs/", "/src/libs/"));
          } catch {
          }
        }
        console.error(error);
        return null;
      }
    }
    if (isWorker) {
      return importScripts(libraryUrl);
    }
    const scriptSource = await loadAsText(libraryUrl);
    return loadLibraryFromString(scriptSource, libraryUrl);
  }
  function loadLibraryFromString(scriptSource, id) {
    if (!isBrowser3) {
      const { requireFromString } = globalThis.loaders || {};
      return requireFromString?.(scriptSource, id);
    }
    if (isWorker) {
      eval.call(globalThis, scriptSource);
      return null;
    }
    const script = document.createElement("script");
    script.id = id;
    try {
      script.appendChild(document.createTextNode(scriptSource));
    } catch (e) {
      script.text = scriptSource;
    }
    document.body.appendChild(script);
    return null;
  }
  async function loadAsArrayBuffer(url) {
    const { readFileAsArrayBuffer } = globalThis.loaders || {};
    if (isBrowser3 || !readFileAsArrayBuffer || url.startsWith("http")) {
      const response = await fetch(url);
      return await response.arrayBuffer();
    }
    try {
      return await readFileAsArrayBuffer(url);
    } catch {
      if (url.includes("/dist/libs/")) {
        return await readFileAsArrayBuffer(url.replace("/dist/libs/", "/src/libs/"));
      }
      throw new Error(`Failed to load ArrayBuffer from ${url}`);
    }
  }
  async function loadAsText(url) {
    const { readFileAsText } = globalThis.loaders || {};
    if (isBrowser3 || !readFileAsText || url.startsWith("http")) {
      const response = await fetch(url);
      return await response.text();
    }
    try {
      return await readFileAsText(url);
    } catch {
      if (url.includes("/dist/libs/")) {
        return await readFileAsText(url.replace("/dist/libs/", "/src/libs/"));
      }
      throw new Error(`Failed to load text from ${url}`);
    }
  }

  // ../loader-utils/src/lib/binary-utils/get-first-characters.ts
  function getFirstCharacters(data, length4 = 5) {
    if (typeof data === "string") {
      return data.slice(0, length4);
    } else if (ArrayBuffer.isView(data)) {
      return getMagicString(data.buffer, data.byteOffset, length4);
    } else if (data instanceof ArrayBuffer) {
      const byteOffset = 0;
      return getMagicString(data, byteOffset, length4);
    }
    return "";
  }
  function getMagicString(arrayBuffer, byteOffset, length4) {
    if (arrayBuffer.byteLength <= byteOffset + length4) {
      return "";
    }
    const dataView = new DataView(arrayBuffer);
    let magic = "";
    for (let i = 0; i < length4; i++) {
      magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
    }
    return magic;
  }

  // ../loader-utils/src/lib/parser-utils/parse-json.ts
  function parseJSON(string) {
    try {
      return JSON.parse(string);
    } catch (_) {
      throw new Error(`Failed to parse JSON from data starting with "${getFirstCharacters(string)}"`);
    }
  }

  // ../loader-utils/src/lib/binary-utils/array-buffer-utils.ts
  function compareArrayBuffers(arrayBuffer1, arrayBuffer2, byteLength) {
    byteLength = byteLength || arrayBuffer1.byteLength;
    if (arrayBuffer1.byteLength < byteLength || arrayBuffer2.byteLength < byteLength) {
      return false;
    }
    const array1 = new Uint8Array(arrayBuffer1);
    const array2 = new Uint8Array(arrayBuffer2);
    for (let i = 0; i < array1.length; ++i) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
  function concatenateArrayBuffers(...sources) {
    return concatenateArrayBuffersFromArray(sources);
  }
  function concatenateArrayBuffersFromArray(sources) {
    const sourceArrays = sources.map(
      (source2) => source2 instanceof ArrayBuffer ? new Uint8Array(source2) : source2
    );
    const byteLength = sourceArrays.reduce((length4, typedArray) => length4 + typedArray.byteLength, 0);
    const result = new Uint8Array(byteLength);
    let offset = 0;
    for (const sourceArray of sourceArrays) {
      result.set(sourceArray, offset);
      offset += sourceArray.byteLength;
    }
    return result.buffer;
  }
  function sliceArrayBuffer(arrayBuffer, byteOffset, byteLength) {
    const subArray = byteLength !== void 0 ? new Uint8Array(arrayBuffer).subarray(byteOffset, byteOffset + byteLength) : new Uint8Array(arrayBuffer).subarray(byteOffset);
    const arrayCopy = new Uint8Array(subArray);
    return arrayCopy.buffer;
  }

  // ../loader-utils/src/lib/binary-utils/memory-copy-utils.ts
  function padToNBytes(byteLength, padding) {
    assert2(byteLength >= 0);
    assert2(padding > 0);
    return byteLength + (padding - 1) & ~(padding - 1);
  }
  function copyToArray(source, target, targetOffset) {
    let sourceArray;
    if (source instanceof ArrayBuffer) {
      sourceArray = new Uint8Array(source);
    } else {
      const srcByteOffset = source.byteOffset;
      const srcByteLength = source.byteLength;
      sourceArray = new Uint8Array(source.buffer || source.arrayBuffer, srcByteOffset, srcByteLength);
    }
    target.set(sourceArray, targetOffset);
    return targetOffset + padToNBytes(sourceArray.byteLength, 4);
  }

  // ../loader-utils/src/lib/binary-utils/dataview-copy-utils.ts
  function padStringToByteAlignment(string, byteAlignment) {
    const length4 = string.length;
    const paddedLength = Math.ceil(length4 / byteAlignment) * byteAlignment;
    const padding = paddedLength - length4;
    let whitespace = "";
    for (let i = 0; i < padding; ++i) {
      whitespace += " ";
    }
    return string + whitespace;
  }
  function copyStringToDataView(dataView, byteOffset, string, byteLength) {
    if (dataView) {
      for (let i = 0; i < byteLength; i++) {
        dataView.setUint8(byteOffset + i, string.charCodeAt(i));
      }
    }
    return byteOffset + byteLength;
  }
  function copyBinaryToDataView(dataView, byteOffset, binary, byteLength) {
    if (dataView) {
      for (let i = 0; i < byteLength; i++) {
        dataView.setUint8(byteOffset + i, binary[i]);
      }
    }
    return byteOffset + byteLength;
  }
  function copyPaddedArrayBufferToDataView(dataView, byteOffset, sourceBuffer, padding) {
    const paddedLength = padToNBytes(sourceBuffer.byteLength, padding);
    const padLength = paddedLength - sourceBuffer.byteLength;
    if (dataView) {
      const targetArray = new Uint8Array(
        dataView.buffer,
        dataView.byteOffset + byteOffset,
        sourceBuffer.byteLength
      );
      const sourceArray = new Uint8Array(sourceBuffer);
      targetArray.set(sourceArray);
      for (let i = 0; i < padLength; ++i) {
        dataView.setUint8(byteOffset + sourceBuffer.byteLength + i, 32);
      }
    }
    byteOffset += paddedLength;
    return byteOffset;
  }
  function copyPaddedStringToDataView(dataView, byteOffset, string, padding) {
    const textEncoder = new TextEncoder();
    const stringBuffer = textEncoder.encode(string);
    byteOffset = copyPaddedArrayBufferToDataView(dataView, byteOffset, stringBuffer, padding);
    return byteOffset;
  }

  // ../loader-utils/src/lib/iterators/async-iteration.ts
  async function concatenateArrayBuffersAsync(asyncIterator) {
    const arrayBuffers = [];
    for await (const chunk of asyncIterator) {
      arrayBuffers.push(copyToArrayBuffer(chunk));
    }
    return concatenateArrayBuffers(...arrayBuffers);
  }
  function copyToArrayBuffer(chunk) {
    if (chunk instanceof ArrayBuffer) {
      return chunk;
    }
    if (ArrayBuffer.isView(chunk)) {
      const { buffer, byteOffset, byteLength } = chunk;
      return copyFromBuffer(buffer, byteOffset, byteLength);
    }
    return copyFromBuffer(chunk);
  }
  function copyFromBuffer(buffer, byteOffset = 0, byteLength = buffer.byteLength - byteOffset) {
    const view = new Uint8Array(buffer, byteOffset, byteLength);
    const copy4 = new Uint8Array(view.length);
    copy4.set(view);
    return copy4.buffer;
  }

  // ../loader-utils/src/lib/node/buffer.browser.ts
  function toArrayBuffer(buffer) {
    return buffer;
  }

  // ../loader-utils/src/lib/binary-utils/memory-conversion-utils.ts
  function isBuffer(value) {
    return value && typeof value === "object" && value.isBuffer;
  }
  function toArrayBuffer2(data) {
    if (isBuffer(data)) {
      return toArrayBuffer(data);
    }
    if (data instanceof ArrayBuffer) {
      return data;
    }
    if (isSharedArrayBuffer(data)) {
      return copyToArrayBuffer2(data);
    }
    if (ArrayBuffer.isView(data)) {
      const buffer = data.buffer;
      if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
        return buffer;
      }
      return buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }
    if (typeof data === "string") {
      const text = data;
      const uint8Array = new TextEncoder().encode(text);
      return uint8Array.buffer;
    }
    if (data && typeof data === "object" && data._toArrayBuffer) {
      return data._toArrayBuffer();
    }
    throw new Error("toArrayBuffer");
  }
  function ensureArrayBuffer(bufferSource) {
    if (bufferSource instanceof ArrayBuffer) {
      return bufferSource;
    }
    if (isSharedArrayBuffer(bufferSource)) {
      return copyToArrayBuffer2(bufferSource);
    }
    const { buffer, byteOffset, byteLength } = bufferSource;
    if (buffer instanceof ArrayBuffer && byteOffset === 0 && byteLength === buffer.byteLength) {
      return buffer;
    }
    return copyToArrayBuffer2(buffer, byteOffset, byteLength);
  }
  function copyToArrayBuffer2(buffer, byteOffset = 0, byteLength = buffer.byteLength - byteOffset) {
    const view = new Uint8Array(buffer, byteOffset, byteLength);
    const copy4 = new Uint8Array(view.length);
    copy4.set(view);
    return copy4.buffer;
  }

  // ../loader-utils/src/lib/node/promisify.ts
  function promisify1(fn) {
    return (args) => new Promise(
      (resolve2, reject) => fn(args, (error, callbackArgs) => error ? reject(error) : resolve2(callbackArgs))
    );
  }

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

  // ../loader-utils/src/lib/files/blob-file.ts
  var BlobFile = class {
    handle;
    size;
    bigsize;
    url;
    constructor(blob) {
      this.handle = blob instanceof ArrayBuffer ? new Blob([blob]) : blob;
      this.size = blob instanceof ArrayBuffer ? blob.byteLength : blob.size;
      this.bigsize = BigInt(this.size);
      this.url = blob instanceof File ? blob.name : "";
    }
    async close() {
    }
    async stat() {
      return {
        size: this.handle.size,
        bigsize: BigInt(this.handle.size),
        isDirectory: false
      };
    }
    async read(start, length4) {
      const arrayBuffer = await this.handle.slice(Number(start), Number(start) + Number(length4)).arrayBuffer();
      return arrayBuffer;
    }
  };

  // ../loader-utils/src/lib/files/node-file-facade.ts
  var NOT_IMPLEMENTED = new Error("Not implemented");
  var NodeFileFacade = class {
    handle;
    size = 0;
    bigsize = 0n;
    url = "";
    constructor(url, flags, mode) {
      if (globalThis.loaders?.NodeFile) {
        return new globalThis.loaders.NodeFile(url, flags, mode);
      }
      if (isBrowser) {
        throw new Error("Can't instantiate NodeFile in browser.");
      }
      throw new Error("Can't instantiate NodeFile. Make sure to import @loaders.gl/polyfills first.");
    }
    /** Read data */
    async read(start, length4) {
      throw NOT_IMPLEMENTED;
    }
    /** Write to file. The number of bytes written will be returned */
    async write(arrayBuffer, offset, length4) {
      throw NOT_IMPLEMENTED;
    }
    /** Get information about file */
    async stat() {
      throw NOT_IMPLEMENTED;
    }
    /** Truncates the file descriptor. Only available on NodeFile. */
    async truncate(length4) {
      throw NOT_IMPLEMENTED;
    }
    /** Append data to a file. Only available on NodeFile. */
    async append(data) {
      throw NOT_IMPLEMENTED;
    }
    /** Close the file */
    async close() {
    }
  };

  // ../loader-utils/src/lib/module-utils/initialize-wasm-module.ts
  function initializeWasmModule(initialize, extractExports) {
    return new Promise((resolve2, reject) => {
      let isSettled = false;
      function rejectInitialization(error) {
        if (!isSettled) {
          isSettled = true;
          reject(error);
        }
      }
      function resolveInitialization(module) {
        if (isSettled) {
          return;
        }
        isSettled = true;
        try {
          resolve2(extractExports(module));
        } catch (error) {
          reject(error);
        }
      }
      try {
        const modulePromise = initialize(resolveInitialization, rejectInitialization);
        modulePromise?.then(resolveInitialization, rejectInitialization);
      } catch (error) {
        rejectInitialization(error);
      }
    });
  }

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
  function clamp(value, min2, max2) {
    return map(value, (value2) => Math.max(min2, Math.min(max2, value2)));
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
  function assert5(condition, message) {
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
      assert5(i >= 0 && i < this.ELEMENTS, "index is out of range");
      return checkNumber(this[i]);
    }
    setComponent(i, value) {
      assert5(i >= 0 && i < this.ELEMENTS, "index is out of range");
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
  function transformMat2(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
  }
  function transformMat2d(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
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
  var forEach2 = function() {
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

  // ../../node_modules/@math.gl/core/dist/classes/vector2.js
  var Vector2 = class extends Vector {
    // Creates a new, empty vec2
    constructor(x = 0, y = 0) {
      super(2);
      if (isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
        }
        this[0] = x;
        this[1] = y;
      }
    }
    set(x, y) {
      this[0] = x;
      this[1] = y;
      return this.check();
    }
    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      return this.check();
    }
    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
      }
      this[0] = object.x;
      this[1] = object.y;
      return this.check();
    }
    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      return object;
    }
    // Getters/setters
    get ELEMENTS() {
      return 2;
    }
    /**
     * Returns angle from x axis
     * @returns
     */
    horizontalAngle() {
      return Math.atan2(this.y, this.x);
    }
    /**
     * Returns angle from y axis
     * @returns
     */
    verticalAngle() {
      return Math.atan2(this.x, this.y);
    }
    // Transforms
    /**
     * Transforms as point
     * @param matrix4
     * @returns
     */
    transform(matrix4) {
      return this.transformAsPoint(matrix4);
    }
    /**
     * transforms as point (4th component is implicitly 1)
     * @param matrix4
     * @returns
     */
    transformAsPoint(matrix4) {
      transformMat4(this, this, matrix4);
      return this.check();
    }
    /**
     * transforms as vector (4th component is implicitly 0, ignores translation. slightly faster)
     * @param matrix4
     * @returns
     */
    transformAsVector(matrix4) {
      vec2_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }
    transformByMatrix3(matrix3) {
      transformMat3(this, this, matrix3);
      return this.check();
    }
    transformByMatrix2x3(matrix2x3) {
      transformMat2d(this, this, matrix2x3);
      return this.check();
    }
    transformByMatrix2(matrix2) {
      transformMat2(this, this, matrix2);
      return this.check();
    }
  };

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
    forEach: () => forEach3,
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
  var forEach3 = function() {
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
  var forEach4 = function() {
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
    assert5(thirdAxisInferred && (!thirdAxis || thirdAxis === thirdAxisInferred));
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
      assert5(x >= 0);
      assert5(y >= 0);
      assert5(z >= 0);
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
      assert5(equals(this.radii.x, this.radii.y, math_utils_exports.EPSILON15));
      assert5(this.radii.z > 0);
      scratchPosition.from(position);
      const z = scratchPosition.z * (1 - this.squaredXOverSquaredZ);
      if (Math.abs(z) >= this.radii.z - buffer) {
        return void 0;
      }
      return scratchPosition.set(0, 0, z).to(result);
    }
  };
  Ellipsoid.WGS84 = new Ellipsoid(WGS84_RADIUS_X, WGS84_RADIUS_Y, WGS84_RADIUS_Z);

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
      const scratchPoint = scratchVector7.from(point);
      const radius = scratchPoint.subtract(this.center).magnitude();
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
      const scratchPoint = scratchVector7.from(point);
      const delta = scratchPoint.subtract(this.center);
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
      assert5(Number.isFinite(distance2));
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
      assert5(equals(this.normal.len(), 1));
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
      const scratchPoint = scratchPosition2.from(point);
      const pointDistance = this.getPointDistance(scratchPoint);
      const scaledNormal = scratchNormal3.copy(this.normal).scale(pointDistance);
      return scratchPoint.subtract(scaledNormal).to(result);
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
      assert5(Number.isFinite(parentPlaneMask), "parentPlaneMask is required.");
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
  function computeEigenDecomposition(matrix, result = {}) {
    const EIGEN_TOLERANCE = math_utils_exports.EPSILON20;
    const EIGEN_MAX_SWEEPS = 10;
    let count = 0;
    let sweep = 0;
    const unitaryMatrix = scratchUnitary;
    const diagonalMatrix = scratchDiagonal;
    unitaryMatrix.identity();
    diagonalMatrix.copy(matrix);
    const epsilon = EIGEN_TOLERANCE * computeFrobeniusNorm(diagonalMatrix);
    while (sweep < EIGEN_MAX_SWEEPS && offDiagonalFrobeniusNorm(diagonalMatrix) > epsilon) {
      shurDecomposition(diagonalMatrix, jMatrix);
      jMatrixTranspose.copy(jMatrix).transpose();
      diagonalMatrix.multiplyRight(jMatrix);
      diagonalMatrix.multiplyLeft(jMatrixTranspose);
      unitaryMatrix.multiplyRight(jMatrix);
      if (++count > 2) {
        ++sweep;
        count = 0;
      }
    }
    result.unitary = unitaryMatrix.toTarget(result.unitary);
    result.diagonal = diagonalMatrix.toTarget(result.diagonal);
    return result;
  }
  function computeFrobeniusNorm(matrix) {
    let norm = 0;
    for (let i = 0; i < 9; ++i) {
      const temp = matrix[i];
      norm += temp * temp;
    }
    return Math.sqrt(norm);
  }
  var rowVal = [1, 0, 0];
  var colVal = [2, 2, 1];
  function offDiagonalFrobeniusNorm(matrix) {
    let norm = 0;
    for (let i = 0; i < 3; ++i) {
      const temp = matrix[scratchMatrix.getElementIndex(colVal[i], rowVal[i])];
      norm += 2 * temp * temp;
    }
    return Math.sqrt(norm);
  }
  function shurDecomposition(matrix, result) {
    const tolerance = math_utils_exports.EPSILON15;
    let maxDiagonal = 0;
    let rotAxis = 1;
    for (let i = 0; i < 3; ++i) {
      const temp = Math.abs(matrix[scratchMatrix.getElementIndex(colVal[i], rowVal[i])]);
      if (temp > maxDiagonal) {
        rotAxis = i;
        maxDiagonal = temp;
      }
    }
    const p = rowVal[rotAxis];
    const q = colVal[rotAxis];
    let c = 1;
    let s = 0;
    if (Math.abs(matrix[scratchMatrix.getElementIndex(q, p)]) > tolerance) {
      const qq = matrix[scratchMatrix.getElementIndex(q, q)];
      const pp = matrix[scratchMatrix.getElementIndex(p, p)];
      const qp = matrix[scratchMatrix.getElementIndex(q, p)];
      const tau = (qq - pp) / 2 / qp;
      let t;
      if (tau < 0) {
        t = -1 / (-tau + Math.sqrt(1 + tau * tau));
      } else {
        t = 1 / (tau + Math.sqrt(1 + tau * tau));
      }
      c = 1 / Math.sqrt(1 + t * t);
      s = t * c;
    }
    Matrix3.IDENTITY.to(result);
    result[scratchMatrix.getElementIndex(p, p)] = result[scratchMatrix.getElementIndex(q, q)] = c;
    result[scratchMatrix.getElementIndex(q, p)] = s;
    result[scratchMatrix.getElementIndex(p, q)] = -s;
    return result;
  }

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
  function makeOrientedBoundingBoxFromPoints(positions, result = new OrientedBoundingBox()) {
    if (!positions || positions.length === 0) {
      result.halfAxes = new Matrix3([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      result.center = new Vector3();
      return result;
    }
    const length4 = positions.length;
    const meanPoint = new Vector3(0, 0, 0);
    for (const position of positions) {
      meanPoint.add(position);
    }
    const invLength = 1 / length4;
    meanPoint.multiplyByScalar(invLength);
    let exx = 0;
    let exy = 0;
    let exz = 0;
    let eyy = 0;
    let eyz = 0;
    let ezz = 0;
    for (const position of positions) {
      const p = scratchVector23.copy(position).subtract(meanPoint);
      exx += p.x * p.x;
      exy += p.x * p.y;
      exz += p.x * p.z;
      eyy += p.y * p.y;
      eyz += p.y * p.z;
      ezz += p.z * p.z;
    }
    exx *= invLength;
    exy *= invLength;
    exz *= invLength;
    eyy *= invLength;
    eyz *= invLength;
    ezz *= invLength;
    const covarianceMatrix = scratchCovarianceResult;
    covarianceMatrix[0] = exx;
    covarianceMatrix[1] = exy;
    covarianceMatrix[2] = exz;
    covarianceMatrix[3] = exy;
    covarianceMatrix[4] = eyy;
    covarianceMatrix[5] = eyz;
    covarianceMatrix[6] = exz;
    covarianceMatrix[7] = eyz;
    covarianceMatrix[8] = ezz;
    const { unitary } = computeEigenDecomposition(covarianceMatrix, scratchEigenResult);
    const rotation = result.halfAxes.copy(unitary);
    let v1 = rotation.getColumn(0, scratchVector42);
    let v2 = rotation.getColumn(1, scratchVector52);
    let v3 = rotation.getColumn(2, scratchVector62);
    let u1 = -Number.MAX_VALUE;
    let u2 = -Number.MAX_VALUE;
    let u3 = -Number.MAX_VALUE;
    let l1 = Number.MAX_VALUE;
    let l2 = Number.MAX_VALUE;
    let l3 = Number.MAX_VALUE;
    for (const position of positions) {
      scratchVector23.copy(position);
      u1 = Math.max(scratchVector23.dot(v1), u1);
      u2 = Math.max(scratchVector23.dot(v2), u2);
      u3 = Math.max(scratchVector23.dot(v3), u3);
      l1 = Math.min(scratchVector23.dot(v1), l1);
      l2 = Math.min(scratchVector23.dot(v2), l2);
      l3 = Math.min(scratchVector23.dot(v3), l3);
    }
    v1 = v1.multiplyByScalar(0.5 * (l1 + u1));
    v2 = v2.multiplyByScalar(0.5 * (l2 + u2));
    v3 = v3.multiplyByScalar(0.5 * (l3 + u3));
    result.center.copy(v1).add(v2).add(v3);
    const scale6 = scratchVector33.set(u1 - l1, u2 - l2, u3 - l3).multiplyByScalar(0.5);
    const scaleMatrix = new Matrix3([scale6[0], 0, 0, 0, scale6[1], 0, 0, 0, scale6[2]]);
    result.halfAxes.multiplyRight(scaleMatrix);
    return result;
  }

  // src/lib/utils/version.ts
  var VERSION3 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";

  // src/lib/constants.ts
  var TILE3D_TYPE = {
    COMPOSITE: "cmpt",
    POINT_CLOUD: "pnts",
    BATCHED_3D_MODEL: "b3dm",
    INSTANCED_3D_MODEL: "i3dm",
    GEOMETRY: "geom",
    VECTOR: "vect",
    GLTF: "glTF"
  };
  var TILE3D_TYPES = Object.keys(TILE3D_TYPE);
  var MAGIC_ARRAY = {
    BATCHED_MODEL: [98, 51, 100, 109],
    INSTANCED_MODEL: [105, 51, 100, 109],
    POINT_CLOUD: [112, 110, 116, 115],
    COMPOSITE: [99, 109, 112, 116]
  };

  // src/lib/parsers/helpers/parse-utils.ts
  function getStringFromArrayBuffer(arrayBuffer, byteOffset, byteLength) {
    assert2(arrayBuffer instanceof ArrayBuffer);
    const textDecoder = new TextDecoder("utf8");
    const typedArray = new Uint8Array(arrayBuffer, byteOffset, byteLength);
    const string = textDecoder.decode(typedArray);
    return string;
  }
  function getMagicString2(arrayBuffer, byteOffset = 0) {
    const dataView = new DataView(arrayBuffer);
    return `${String.fromCharCode(dataView.getUint8(byteOffset + 0))}${String.fromCharCode(dataView.getUint8(byteOffset + 1))}${String.fromCharCode(dataView.getUint8(byteOffset + 2))}${String.fromCharCode(dataView.getUint8(byteOffset + 3))}`;
  }

  // ../draco/src/lib/draco-module-loader.ts
  var DRACO_DECODER_VERSION = "1.5.6";
  var DRACO_ENCODER_VERSION = "1.4.1";
  var STATIC_DECODER_URL = `https://www.gstatic.com/draco/versioned/decoders/${DRACO_DECODER_VERSION}`;
  var DRACO_EXTERNAL_LIBRARIES = {
    /** The primary Draco3D encoder, javascript wrapper part */
    DECODER: "draco_wasm_wrapper.js",
    /** The primary draco decoder, compiled web assembly part */
    DECODER_WASM: "draco_decoder.wasm",
    /** Fallback decoder for non-webassebly environments. Very big bundle, lower performance */
    FALLBACK_DECODER: "draco_decoder.js",
    /** Draco encoder */
    ENCODER: "draco_encoder.js"
  };
  var DRACO_EXTERNAL_LIBRARY_URLS = {
    [DRACO_EXTERNAL_LIBRARIES.DECODER]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.DECODER}`,
    [DRACO_EXTERNAL_LIBRARIES.DECODER_WASM]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.DECODER_WASM}`,
    [DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER]: `${STATIC_DECODER_URL}/${DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER}`,
    [DRACO_EXTERNAL_LIBRARIES.ENCODER]: `https://raw.githubusercontent.com/google/draco/${DRACO_ENCODER_VERSION}/javascript/${DRACO_EXTERNAL_LIBRARIES.ENCODER}`
  };
  var loadDecoderPromise;
  async function loadDracoDecoderModule(options = {}, type) {
    const modules = options.modules || {};
    if (modules.draco3d) {
      loadDecoderPromise ||= initializeWasmModule(
        () => modules.draco3d.createDecoderModule({}),
        (draco) => ({ draco })
      );
    } else {
      loadDecoderPromise ||= loadDracoDecoder(options, type);
    }
    return await loadDecoderPromise;
  }
  function getLibraryExport(library, exportName) {
    if (library && typeof library === "object") {
      if (library.default) {
        return library.default;
      }
      if (library[exportName]) {
        return library[exportName];
      }
    }
    return library;
  }
  async function loadDracoDecoder(options, type) {
    let DracoDecoderModule;
    let wasmBinary;
    switch (type) {
      case "js":
        DracoDecoderModule = await loadLibrary(
          DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER],
          "draco",
          options,
          DRACO_EXTERNAL_LIBRARIES.FALLBACK_DECODER
        );
        break;
      case "wasm":
      default:
        try {
          [DracoDecoderModule, wasmBinary] = await Promise.all([
            await loadLibrary(
              DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER],
              "draco",
              options,
              DRACO_EXTERNAL_LIBRARIES.DECODER
            ),
            await loadLibrary(
              DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER_WASM],
              "draco",
              options,
              DRACO_EXTERNAL_LIBRARIES.DECODER_WASM
            )
          ]);
        } catch {
          DracoDecoderModule = null;
          wasmBinary = null;
        }
    }
    DracoDecoderModule = getLibraryExport(DracoDecoderModule, "DracoDecoderModule");
    DracoDecoderModule = DracoDecoderModule || globalThis.DracoDecoderModule;
    if (!DracoDecoderModule && !isBrowser3) {
      [DracoDecoderModule, wasmBinary] = await Promise.all([
        await loadLibrary(
          DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER],
          "draco",
          { ...options, useLocalLibraries: true },
          DRACO_EXTERNAL_LIBRARIES.DECODER
        ),
        await loadLibrary(
          DRACO_EXTERNAL_LIBRARY_URLS[DRACO_EXTERNAL_LIBRARIES.DECODER_WASM],
          "draco",
          { ...options, useLocalLibraries: true },
          DRACO_EXTERNAL_LIBRARIES.DECODER_WASM
        )
      ]);
      DracoDecoderModule = getLibraryExport(DracoDecoderModule, "DracoDecoderModule");
      DracoDecoderModule = DracoDecoderModule || globalThis.DracoDecoderModule;
    }
    return await initializeDracoDecoder(DracoDecoderModule, wasmBinary);
  }
  function initializeDracoDecoder(DracoDecoderModule, wasmBinary) {
    if (typeof DracoDecoderModule !== "function") {
      throw new Error("DracoDecoderModule could not be loaded");
    }
    const options = {};
    if (wasmBinary) {
      options.wasmBinary = wasmBinary;
    }
    return initializeWasmModule(
      (onInitialized) => DracoDecoderModule({ ...options, onModuleLoaded: onInitialized }),
      (draco) => ({ draco })
    );
  }

  // ../draco/src/lib/utils/version.ts
  var VERSION4 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";

  // ../schema-utils/src/lib/schema/data-type.ts
  function getDataTypeFromTypedArray(array) {
    switch (array.constructor) {
      case Int8Array:
        return "int8";
      case Uint8Array:
      case Uint8ClampedArray:
        return "uint8";
      case Int16Array:
        return "int16";
      case Uint16Array:
        return "uint16";
      case Int32Array:
        return "int32";
      case Uint32Array:
        return "uint32";
      case Float32Array:
        return "float32";
      case Float64Array:
        return "float64";
      default:
        return "null";
    }
  }

  // ../schema-utils/src/lib/mesh/mesh-utils.ts
  function getMeshBoundingBox(attributes) {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    const positions = attributes.POSITION ? attributes.POSITION.value : [];
    const len2 = positions && positions.length;
    for (let i = 0; i < len2; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      minZ = z < minZ ? z : minZ;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      maxZ = z > maxZ ? z : maxZ;
    }
    return [
      [minX, minY, minZ],
      [maxX, maxY, maxZ]
    ];
  }

  // ../schema-utils/src/lib/mesh/deduce-mesh-schema.ts
  function deduceMeshField(name14, attribute, optionalMetadata) {
    const type = getDataTypeFromTypedArray(attribute.value);
    const metadata = optionalMetadata ? optionalMetadata : makeMeshAttributeMetadata(attribute);
    return {
      name: name14,
      type: { type: "fixed-size-list", listSize: attribute.size, children: [{ name: "value", type }] },
      nullable: false,
      metadata
    };
  }
  function makeMeshAttributeMetadata(attribute) {
    const result = {};
    if ("byteOffset" in attribute) {
      result.byteOffset = attribute.byteOffset.toString(10);
    }
    if ("byteStride" in attribute) {
      result.byteStride = attribute.byteStride.toString(10);
    }
    if ("normalized" in attribute) {
      result.normalized = attribute.normalized.toString();
    }
    return result;
  }

  // ../draco/src/lib/utils/get-draco-schema.ts
  function getDracoSchema(attributes, loaderData, indices) {
    const metadata = makeMetadata(loaderData.metadata);
    const fields = [];
    const namedLoaderDataAttributes = transformAttributesLoaderData(loaderData.attributes);
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const field = getArrowFieldFromAttribute(
        attributeName,
        attribute,
        namedLoaderDataAttributes[attributeName]
      );
      fields.push(field);
    }
    if (indices) {
      const indicesField = getArrowFieldFromAttribute("indices", indices);
      fields.push(indicesField);
    }
    return { fields, metadata };
  }
  function transformAttributesLoaderData(loaderData) {
    const result = {};
    for (const key in loaderData) {
      const dracoAttribute = loaderData[key];
      result[dracoAttribute.name || "undefined"] = dracoAttribute;
    }
    return result;
  }
  function getArrowFieldFromAttribute(attributeName, attribute, loaderData) {
    const metadataMap = loaderData ? makeMetadata(loaderData.metadata) : void 0;
    const field = deduceMeshField(attributeName, attribute, metadataMap);
    return field;
  }
  function makeMetadata(metadata) {
    Object.entries(metadata);
    const serializedMetadata = {};
    for (const key in metadata) {
      serializedMetadata[`${key}.string`] = JSON.stringify(metadata[key]);
    }
    return serializedMetadata;
  }

  // ../draco/src/lib/draco-parser.ts
  var DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP = {
    POSITION: "POSITION",
    NORMAL: "NORMAL",
    COLOR: "COLOR_0",
    TEX_COORD: "TEXCOORD_0"
  };
  var DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP = {
    1: Int8Array,
    2: Uint8Array,
    3: Int16Array,
    4: Uint16Array,
    5: Int32Array,
    6: Uint32Array,
    // 7: BigInt64Array,
    // 8: BigUint64Array,
    9: Float32Array
    // 10: Float64Array
    // 11: BOOL - What array type do we use for this?
  };
  var INDEX_ITEM_SIZE = 4;
  var DracoParser = class {
    draco;
    decoder;
    metadataQuerier;
    // draco - the draco decoder, either import `draco3d` or load dynamically
    constructor(draco) {
      this.draco = draco;
      this.decoder = new this.draco.Decoder();
      this.metadataQuerier = new this.draco.MetadataQuerier();
    }
    /**
     * Destroy draco resources
     */
    destroy() {
      this.draco.destroy(this.decoder);
      this.draco.destroy(this.metadataQuerier);
    }
    /**
     * NOTE: caller must call `destroyGeometry` on the return value after using it
     * @param arrayBuffer
     * @param options
     */
    parseSync(arrayBuffer, options = {}) {
      const buffer = new this.draco.DecoderBuffer();
      buffer.Init(new Int8Array(arrayBuffer), arrayBuffer.byteLength);
      this._disableAttributeTransforms(options);
      const geometry_type = this.decoder.GetEncodedGeometryType(buffer);
      const dracoGeometry = geometry_type === this.draco.TRIANGULAR_MESH ? new this.draco.Mesh() : new this.draco.PointCloud();
      try {
        let dracoStatus;
        switch (geometry_type) {
          case this.draco.TRIANGULAR_MESH:
            dracoStatus = this.decoder.DecodeBufferToMesh(buffer, dracoGeometry);
            break;
          case this.draco.POINT_CLOUD:
            dracoStatus = this.decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
            break;
          default:
            throw new Error("DRACO: Unknown geometry type.");
        }
        if (!dracoStatus.ok() || !dracoGeometry.ptr) {
          const message = `DRACO decompression failed: ${dracoStatus.error_msg()}`;
          throw new Error(message);
        }
        const loaderData = this._getDracoLoaderData(dracoGeometry, geometry_type, options);
        const geometry = this._getMeshData(dracoGeometry, loaderData, options);
        const boundingBox = getMeshBoundingBox(geometry.attributes);
        const schema = getDracoSchema(geometry.attributes, loaderData, geometry.indices);
        const data = {
          loader: "draco",
          loaderData,
          header: {
            vertexCount: dracoGeometry.num_points(),
            boundingBox
          },
          ...geometry,
          schema
        };
        return data;
      } finally {
        this.draco.destroy(buffer);
        if (dracoGeometry) {
          this.draco.destroy(dracoGeometry);
        }
      }
    }
    // Draco specific "loader data"
    /**
     * Extract
     * @param dracoGeometry
     * @param geometry_type
     * @param options
     * @returns
     */
    _getDracoLoaderData(dracoGeometry, geometry_type, options) {
      const metadata = this._getTopLevelMetadata(dracoGeometry);
      const attributes = this._getDracoAttributes(dracoGeometry, options);
      return {
        geometry_type,
        num_attributes: dracoGeometry.num_attributes(),
        num_points: dracoGeometry.num_points(),
        num_faces: dracoGeometry instanceof this.draco.Mesh ? dracoGeometry.num_faces() : 0,
        metadata,
        attributes
      };
    }
    /**
     * Extract all draco provided information and metadata for each attribute
     * @param dracoGeometry
     * @param options
     * @returns
     */
    _getDracoAttributes(dracoGeometry, options) {
      const dracoAttributes = {};
      for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
        const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);
        const metadata = this._getAttributeMetadata(dracoGeometry, attributeId);
        dracoAttributes[dracoAttribute.unique_id()] = {
          unique_id: dracoAttribute.unique_id(),
          attribute_type: dracoAttribute.attribute_type(),
          data_type: dracoAttribute.data_type(),
          num_components: dracoAttribute.num_components(),
          byte_offset: dracoAttribute.byte_offset(),
          byte_stride: dracoAttribute.byte_stride(),
          normalized: dracoAttribute.normalized(),
          attribute_index: attributeId,
          metadata
        };
        const quantization = this._getQuantizationTransform(dracoAttribute, options);
        if (quantization) {
          dracoAttributes[dracoAttribute.unique_id()].quantization_transform = quantization;
        }
        const octahedron = this._getOctahedronTransform(dracoAttribute, options);
        if (octahedron) {
          dracoAttributes[dracoAttribute.unique_id()].octahedron_transform = octahedron;
        }
      }
      return dracoAttributes;
    }
    /**
     * Get standard loaders.gl mesh category data
     * Extracts the geometry from draco
     * @param dracoGeometry
     * @param options
     */
    _getMeshData(dracoGeometry, loaderData, options) {
      const attributes = this._getMeshAttributes(loaderData, dracoGeometry, options);
      const positionAttribute = attributes.POSITION;
      if (!positionAttribute) {
        throw new Error("DRACO: No position attribute found.");
      }
      if (dracoGeometry instanceof this.draco.Mesh) {
        switch (options.topology) {
          case "triangle-strip":
            return {
              topology: "triangle-strip",
              // TODO - mode is wrong?
              mode: 4,
              // GL.TRIANGLES
              attributes,
              indices: {
                value: this._getTriangleStripIndices(dracoGeometry),
                size: 1
              }
            };
          case "triangle-list":
          default:
            return {
              topology: "triangle-list",
              // TODO - mode is wrong?
              mode: 5,
              // GL.TRIANGLE_STRIP
              attributes,
              indices: {
                value: this._getTriangleListIndices(dracoGeometry),
                size: 1
              }
            };
        }
      }
      return {
        topology: "point-list",
        mode: 0,
        // GL.POINTS
        attributes
      };
    }
    _getMeshAttributes(loaderData, dracoGeometry, options) {
      const attributes = {};
      for (const loaderAttribute of Object.values(loaderData.attributes)) {
        const attributeName = this._deduceAttributeName(loaderAttribute, options);
        loaderAttribute.name = attributeName;
        const values = this._getAttributeValues(dracoGeometry, loaderAttribute);
        if (values) {
          const { value, size } = values;
          attributes[attributeName] = {
            value,
            size,
            byteOffset: loaderAttribute.byte_offset,
            byteStride: loaderAttribute.byte_stride,
            normalized: loaderAttribute.normalized
          };
        }
      }
      return attributes;
    }
    // MESH INDICES EXTRACTION
    /**
     * For meshes, we need indices to define the faces.
     * @param dracoGeometry
     */
    _getTriangleListIndices(dracoGeometry) {
      const numFaces = dracoGeometry.num_faces();
      const numIndices = numFaces * 3;
      const byteLength = numIndices * INDEX_ITEM_SIZE;
      const ptr = this.draco._malloc(byteLength);
      try {
        this.decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
        return new Uint32Array(this.draco.HEAPF32.buffer, ptr, numIndices).slice();
      } finally {
        this.draco._free(ptr);
      }
    }
    /**
     * For meshes, we need indices to define the faces.
     * @param dracoGeometry
     */
    _getTriangleStripIndices(dracoGeometry) {
      const dracoArray = new this.draco.DracoInt32Array();
      try {
        this.decoder.GetTriangleStripsFromMesh(dracoGeometry, dracoArray);
        return getUint32Array(dracoArray);
      } finally {
        this.draco.destroy(dracoArray);
      }
    }
    /**
     *
     * @param dracoGeometry
     * @param dracoAttribute
     * @param attributeName
     */
    _getAttributeValues(dracoGeometry, attribute) {
      const TypedArrayCtor = DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP[attribute.data_type];
      if (!TypedArrayCtor) {
        console.warn(`DRACO: Unsupported attribute type ${attribute.data_type}`);
        return null;
      }
      const numComponents = attribute.num_components;
      const numPoints = dracoGeometry.num_points();
      const numValues = numPoints * numComponents;
      const byteLength = numValues * TypedArrayCtor.BYTES_PER_ELEMENT;
      const dataType = getDracoDataType(this.draco, TypedArrayCtor);
      let value;
      const ptr = this.draco._malloc(byteLength);
      try {
        const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attribute.attribute_index);
        this.decoder.GetAttributeDataArrayForAllPoints(
          dracoGeometry,
          dracoAttribute,
          dataType,
          byteLength,
          ptr
        );
        value = new TypedArrayCtor(this.draco.HEAPF32.buffer, ptr, numValues).slice();
      } finally {
        this.draco._free(ptr);
      }
      return { value, size: numComponents };
    }
    // Attribute names
    /** 
     * DRACO does not store attribute names - We need to deduce an attribute name
     * for each attribute
    _getAttributeNames(
      dracoGeometry: Mesh | PointCloud,
      options: DracoParseOptions
    ): {[unique_id: number]: string} {
      const attributeNames: {[unique_id: number]: string} = {};
      for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
        const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);
        const attributeName = this._deduceAttributeName(dracoAttribute, options);
        attributeNames[attributeName] = attributeName;
      }
      return attributeNames;
    }
     */
    /**
     * Deduce an attribute name.
     * @note DRACO does not save attribute names, just general type (POSITION, COLOR)
     * to help optimize compression. We generate GLTF compatible names for the Draco-recognized
     * types
     * @param attributeData
     */
    _deduceAttributeName(attribute, options) {
      const uniqueId = attribute.unique_id;
      for (const [attributeName, attributeUniqueId] of Object.entries(
        options.extraAttributes || {}
      )) {
        if (attributeUniqueId === uniqueId) {
          return attributeName;
        }
      }
      const thisAttributeType = attribute.attribute_type;
      for (const dracoAttributeConstant in DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP) {
        const attributeType = this.draco[dracoAttributeConstant];
        if (attributeType === thisAttributeType) {
          return DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP[dracoAttributeConstant];
        }
      }
      const entryName = options.attributeNameEntry || "name";
      if (attribute.metadata[entryName]) {
        return attribute.metadata[entryName].string;
      }
      return `CUSTOM_ATTRIBUTE_${uniqueId}`;
    }
    // METADATA EXTRACTION
    /** Get top level metadata */
    _getTopLevelMetadata(dracoGeometry) {
      const dracoMetadata = this.decoder.GetMetadata(dracoGeometry);
      return this._getDracoMetadata(dracoMetadata);
    }
    /** Get per attribute metadata */
    _getAttributeMetadata(dracoGeometry, attributeId) {
      const dracoMetadata = this.decoder.GetAttributeMetadata(dracoGeometry, attributeId);
      return this._getDracoMetadata(dracoMetadata);
    }
    /**
     * Extract metadata field values
     * @param dracoMetadata
     * @returns
     */
    _getDracoMetadata(dracoMetadata) {
      if (!dracoMetadata || !dracoMetadata.ptr) {
        return {};
      }
      const result = {};
      const numEntries = this.metadataQuerier.NumEntries(dracoMetadata);
      for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        const entryName = this.metadataQuerier.GetEntryName(dracoMetadata, entryIndex);
        result[entryName] = this._getDracoMetadataField(dracoMetadata, entryName);
      }
      return result;
    }
    /**
     * Extracts possible values for one metadata entry by name
     * @param dracoMetadata
     * @param entryName
     */
    _getDracoMetadataField(dracoMetadata, entryName) {
      const dracoArray = new this.draco.DracoInt32Array();
      try {
        this.metadataQuerier.GetIntEntryArray(dracoMetadata, entryName, dracoArray);
        const intArray = getInt32Array(dracoArray);
        return {
          int: this.metadataQuerier.GetIntEntry(dracoMetadata, entryName),
          string: this.metadataQuerier.GetStringEntry(dracoMetadata, entryName),
          double: this.metadataQuerier.GetDoubleEntry(dracoMetadata, entryName),
          intArray
        };
      } finally {
        this.draco.destroy(dracoArray);
      }
    }
    // QUANTIZED ATTRIBUTE SUPPORT (NO DECOMPRESSION)
    /** Skip transforms for specific attribute types */
    _disableAttributeTransforms(options) {
      const { quantizedAttributes = [], octahedronAttributes = [] } = options;
      const skipAttributes = [...quantizedAttributes, ...octahedronAttributes];
      for (const dracoAttributeName of skipAttributes) {
        this.decoder.SkipAttributeTransform(this.draco[dracoAttributeName]);
      }
    }
    /**
     * Extract (and apply?) Position Transform
     * @todo not used
     */
    _getQuantizationTransform(dracoAttribute, options) {
      const { quantizedAttributes = [] } = options;
      const attribute_type = dracoAttribute.attribute_type();
      const skip = quantizedAttributes.map((type) => this.decoder[type]).includes(attribute_type);
      if (skip) {
        const transform = new this.draco.AttributeQuantizationTransform();
        try {
          if (transform.InitFromAttribute(dracoAttribute)) {
            return {
              quantization_bits: transform.quantization_bits(),
              range: transform.range(),
              min_values: new Float32Array([1, 2, 3]).map((i) => transform.min_value(i))
            };
          }
        } finally {
          this.draco.destroy(transform);
        }
      }
      return null;
    }
    _getOctahedronTransform(dracoAttribute, options) {
      const { octahedronAttributes = [] } = options;
      const attribute_type = dracoAttribute.attribute_type();
      const octahedron = octahedronAttributes.map((type) => this.decoder[type]).includes(attribute_type);
      if (octahedron) {
        const transform = new this.draco.AttributeQuantizationTransform();
        try {
          if (transform.InitFromAttribute(dracoAttribute)) {
            return {
              quantization_bits: transform.quantization_bits()
            };
          }
        } finally {
          this.draco.destroy(transform);
        }
      }
      return null;
    }
    // HELPERS
  };
  function getDracoDataType(draco, attributeType) {
    switch (attributeType) {
      case Float32Array:
        return draco.DT_FLOAT32;
      case Int8Array:
        return draco.DT_INT8;
      case Int16Array:
        return draco.DT_INT16;
      case Int32Array:
        return draco.DT_INT32;
      case Uint8Array:
        return draco.DT_UINT8;
      case Uint16Array:
        return draco.DT_UINT16;
      case Uint32Array:
        return draco.DT_UINT32;
      default:
        return draco.DT_INVALID;
    }
  }
  function getInt32Array(dracoArray) {
    const numValues = dracoArray.size();
    const intArray = new Int32Array(numValues);
    for (let i = 0; i < numValues; i++) {
      intArray[i] = dracoArray.GetValue(i);
    }
    return intArray;
  }
  function getUint32Array(dracoArray) {
    const numValues = dracoArray.size();
    const intArray = new Int32Array(numValues);
    for (let i = 0; i < numValues; i++) {
      intArray[i] = dracoArray.GetValue(i);
    }
    return intArray;
  }

  // ../draco/src/draco-loader.ts
  var DracoWorkerLoader = {
    dataType: null,
    batchType: null,
    name: "Draco",
    id: "draco",
    module: "draco",
    // shapes: ['mesh'],
    version: VERSION4,
    worker: true,
    extensions: ["drc"],
    mimeTypes: ["application/octet-stream"],
    binary: true,
    tests: ["DRACO"],
    options: {
      draco: {
        decoderType: typeof WebAssembly === "object" ? "wasm" : "js",
        // 'js' for IE11
        extraAttributes: {},
        attributeNameEntry: void 0
      }
    }
  };
  var DracoLoader = {
    ...DracoWorkerLoader,
    parse
  };
  async function parse(arrayBuffer, options) {
    const { draco } = await loadDracoDecoderModule(
      extractLoadLibraryOptions(options),
      options?.draco?.decoderType || "wasm"
    );
    const dracoParser = new DracoParser(draco);
    try {
      return dracoParser.parseSync(arrayBuffer, options?.draco);
    } finally {
      dracoParser.destroy();
    }
  }

  // ../math/src/geometry/constants.ts
  var GL_PRIMITIVE_MODE = {
    POINTS: 0,
    // Points. single points.
    LINES: 1,
    // Lines. Each vertex connects to the one after it.
    LINE_LOOP: 2,
    // Lines. Each set of two vertices is treated as a separate line segment.
    LINE_STRIP: 3,
    // Lines/ a connected group of line segments from the first vertex to the last
    TRIANGLES: 4,
    // Triangles. Each set of three vertices creates a separate triangle.
    TRIANGLE_STRIP: 5,
    // Triangles. A connected group of triangles.
    TRIANGLE_FAN: 6
    // Triangles. A connected group of triangles.
    // Each vertex connects to the previous and the first vertex in the fan.
  };
  var GL_TYPE = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    INT: 5124,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
    DOUBLE: 5130
  };
  var GL2 = {
    ...GL_PRIMITIVE_MODE,
    ...GL_TYPE
  };

  // ../math/src/geometry/gl/gl-type.ts
  var GL_TYPE_TO_ARRAY_TYPE = {
    [GL_TYPE.DOUBLE]: Float64Array,
    [GL_TYPE.FLOAT]: Float32Array,
    [GL_TYPE.UNSIGNED_SHORT]: Uint16Array,
    [GL_TYPE.UNSIGNED_INT]: Uint32Array,
    [GL_TYPE.UNSIGNED_BYTE]: Uint8Array,
    [GL_TYPE.BYTE]: Int8Array,
    [GL_TYPE.SHORT]: Int16Array,
    [GL_TYPE.INT]: Int32Array
  };
  var NAME_TO_GL_TYPE = {
    DOUBLE: GL_TYPE.DOUBLE,
    FLOAT: GL_TYPE.FLOAT,
    UNSIGNED_SHORT: GL_TYPE.UNSIGNED_SHORT,
    UNSIGNED_INT: GL_TYPE.UNSIGNED_INT,
    UNSIGNED_BYTE: GL_TYPE.UNSIGNED_BYTE,
    BYTE: GL_TYPE.BYTE,
    SHORT: GL_TYPE.SHORT,
    INT: GL_TYPE.INT
  };
  var ERR_TYPE_CONVERSION = "Failed to convert GL type";
  var GLType = class {
    // Signature: fromTypedArray(new Uint8Array())
    // Signature: fromTypedArray(Uint8Array)
    /**
     * Returns the size, in bytes, of the corresponding datatype
     * @param arrayOrType
     * @returns glType a a string
     */
    static fromTypedArray(arrayOrType) {
      arrayOrType = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;
      for (const glType in GL_TYPE_TO_ARRAY_TYPE) {
        const ArrayType = GL_TYPE_TO_ARRAY_TYPE[glType];
        if (ArrayType === arrayOrType) {
          return glType;
        }
      }
      throw new Error(ERR_TYPE_CONVERSION);
    }
    /**
     * Extracts name for glType from array NAME_TO_GL_TYPE
     * @param name
     * @returns glType as a number
     */
    static fromName(name14) {
      const glType = NAME_TO_GL_TYPE[name14];
      if (!glType) {
        throw new Error(ERR_TYPE_CONVERSION);
      }
      return glType;
    }
    // Converts GL constant to corresponding typed array type
    // eslint-disable-next-line complexity
    static getArrayType(glType) {
      switch (glType) {
        case GL_TYPE.UNSIGNED_SHORT_5_6_5:
        case GL_TYPE.UNSIGNED_SHORT_4_4_4_4:
        case GL_TYPE.UNSIGNED_SHORT_5_5_5_1:
          return Uint16Array;
        default:
          const ArrayType = GL_TYPE_TO_ARRAY_TYPE[glType];
          if (!ArrayType) {
            throw new Error(ERR_TYPE_CONVERSION);
          }
          return ArrayType;
      }
    }
    /**
     * Returns the size in bytes of one element of the provided WebGL type
     * @param glType
     * @returns size of glType
     */
    static getByteSize(glType) {
      const ArrayType = GLType.getArrayType(glType);
      return ArrayType.BYTES_PER_ELEMENT;
    }
    /**
     * Returns `true` if `glType` is a valid WebGL data type.
     * @param glType
     * @returns boolean
     */
    static validate(glType) {
      return Boolean(GLType.getArrayType(glType));
    }
    /**
     * Creates a typed view of an array of bytes
     * @param glType The type of typed array (ArrayBuffer view) to create
     * @param buffer The buffer storage to use for the view.
     * @param byteOffset The offset, in bytes, to the first element in the view
     * @param length The number of elements in the view. Defaults to buffer length
     * @returns A typed array view of the buffer
     */
    static createTypedArray(glType, buffer, byteOffset = 0, length4) {
      if (length4 === void 0) {
        length4 = (buffer.byteLength - byteOffset) / GLType.getByteSize(glType);
      }
      const arrayBuffer = ArrayBuffer.isView(buffer) ? buffer.buffer : buffer;
      const ArrayType = GLType.getArrayType(glType);
      return new ArrayType(arrayBuffer, byteOffset, length4);
    }
  };

  // ../math/src/geometry/utils/assert.ts
  function assert6(condition, message) {
    if (!condition) {
      throw new Error(`math.gl assertion failed. ${message}`);
    }
  }

  // ../math/src/geometry/colors/rgb565.ts
  function decodeRGB565(rgb565, target = [0, 0, 0]) {
    const r5 = rgb565 >> 11 & 31;
    const g6 = rgb565 >> 5 & 63;
    const b5 = rgb565 & 31;
    target[0] = r5 << 3;
    target[1] = g6 << 2;
    target[2] = b5 << 3;
    return target;
  }

  // ../math/src/geometry/compression/attribute-compression.ts
  var RIGHT_SHIFT = 1 / 256;
  var scratchVector24 = new Vector2();
  var scratchVector34 = new Vector3();
  var scratchEncodeVector2 = new Vector2();
  var octEncodeScratch = new Vector2();
  var uint8ForceArray = new Uint8Array(1);
  function fromSNorm(value, rangeMaximum = 255) {
    return clamp(value, 0, rangeMaximum) / rangeMaximum * 2 - 1;
  }
  function signNotZero(value) {
    return value < 0 ? -1 : 1;
  }
  function octDecodeInRange(x, y, rangeMax, result) {
    assert6(result);
    if (x < 0 || x > rangeMax || y < 0 || y > rangeMax) {
      throw new Error(`x and y must be unsigned normalized integers between 0 and ${rangeMax}`);
    }
    result.x = fromSNorm(x, rangeMax);
    result.y = fromSNorm(y, rangeMax);
    result.z = 1 - (Math.abs(result.x) + Math.abs(result.y));
    if (result.z < 0) {
      const oldVX = result.x;
      result.x = (1 - Math.abs(result.y)) * signNotZero(oldVX);
      result.y = (1 - Math.abs(oldVX)) * signNotZero(result.y);
    }
    return result.normalize();
  }
  function octDecode(x, y, result) {
    return octDecodeInRange(x, y, 255, result);
  }

  // src/lib/classes/tile-3d-feature-table.ts
  var Tile3DFeatureTable = class {
    json;
    buffer;
    featuresLength = 0;
    _cachedTypedArrays = {};
    constructor(featureTableJson, featureTableBinary) {
      this.json = featureTableJson;
      this.buffer = featureTableBinary;
    }
    getExtension(extensionName) {
      return this.json.extensions && this.json.extensions[extensionName];
    }
    hasProperty(propertyName) {
      return Boolean(this.json[propertyName]);
    }
    getGlobalProperty(propertyName, componentType = GL2.UNSIGNED_INT, componentLength = 1) {
      const jsonValue = this.json[propertyName];
      if (jsonValue && Number.isFinite(jsonValue.byteOffset)) {
        return this._getTypedArrayFromBinary(
          propertyName,
          componentType,
          componentLength,
          1,
          jsonValue.byteOffset
        );
      }
      return jsonValue;
    }
    getPropertyArray(propertyName, componentType, componentLength) {
      const jsonValue = this.json[propertyName];
      if (jsonValue && Number.isFinite(jsonValue.byteOffset)) {
        if ("componentType" in jsonValue) {
          componentType = GLType.fromName(jsonValue.componentType);
        }
        return this._getTypedArrayFromBinary(
          propertyName,
          componentType,
          componentLength,
          this.featuresLength,
          jsonValue.byteOffset
        );
      }
      return this._getTypedArrayFromArray(propertyName, componentType, jsonValue);
    }
    getProperty(propertyName, componentType, componentLength, featureId, result) {
      const jsonValue = this.json[propertyName];
      if (!jsonValue) {
        return jsonValue;
      }
      const typedArray = this.getPropertyArray(propertyName, componentType, componentLength);
      if (componentLength === 1) {
        return typedArray[featureId];
      }
      for (let i = 0; i < componentLength; ++i) {
        result[i] = typedArray[componentLength * featureId + i];
      }
      return result;
    }
    // HELPERS
    _getTypedArrayFromBinary(propertyName, componentType, componentLength, count, byteOffset) {
      const cachedTypedArrays = this._cachedTypedArrays;
      let typedArray = cachedTypedArrays[propertyName];
      if (!typedArray) {
        typedArray = GLType.createTypedArray(
          componentType,
          this.buffer.buffer,
          this.buffer.byteOffset + byteOffset,
          count * componentLength
        );
        cachedTypedArrays[propertyName] = typedArray;
      }
      return typedArray;
    }
    _getTypedArrayFromArray(propertyName, componentType, array) {
      const cachedTypedArrays = this._cachedTypedArrays;
      let typedArray = cachedTypedArrays[propertyName];
      if (!typedArray) {
        if (ArrayBuffer.isView(array)) {
          const byteOffset = array.byteOffset;
          const byteLength = array.byteLength;
          const elementCount = byteLength / GLType.getByteSize(componentType);
          typedArray = GLType.createTypedArray(componentType, array.buffer, byteOffset, elementCount);
        } else if (array instanceof ArrayBuffer) {
          typedArray = GLType.createTypedArray(componentType, array);
        } else {
          const ArrayType = GLType.getArrayType(componentType);
          typedArray = new ArrayType(array);
        }
        cachedTypedArrays[propertyName] = typedArray;
      }
      return typedArray;
    }
  };

  // src/lib/classes/helpers/tile-3d-accessor-utils.ts
  var COMPONENTS_PER_ATTRIBUTE = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  var UNPACKER = {
    SCALAR: (values, i) => values[i],
    VEC2: (values, i) => [values[2 * i + 0], values[2 * i + 1]],
    VEC3: (values, i) => [values[3 * i + 0], values[3 * i + 1], values[3 * i + 2]],
    VEC4: (values, i) => [values[4 * i + 0], values[4 * i + 1], values[4 * i + 2], values[4 * i + 3]],
    // TODO: check column major
    MAT2: (values, i) => [
      values[4 * i + 0],
      values[4 * i + 1],
      values[4 * i + 2],
      values[4 * i + 3]
    ],
    MAT3: (values, i) => [
      values[9 * i + 0],
      values[9 * i + 1],
      values[9 * i + 2],
      values[9 * i + 3],
      values[9 * i + 4],
      values[9 * i + 5],
      values[9 * i + 6],
      values[9 * i + 7],
      values[9 * i + 8]
    ],
    MAT4: (values, i) => [
      values[16 * i + 0],
      values[16 * i + 1],
      values[16 * i + 2],
      values[16 * i + 3],
      values[16 * i + 4],
      values[16 * i + 5],
      values[16 * i + 6],
      values[16 * i + 7],
      values[16 * i + 8],
      values[16 * i + 9],
      values[16 * i + 10],
      values[16 * i + 11],
      values[16 * i + 12],
      values[16 * i + 13],
      values[16 * i + 14],
      values[16 * i + 15]
    ]
  };
  var PACKER = {
    SCALAR: (x, values, i) => {
      values[i] = x;
    },
    VEC2: (x, values, i) => {
      values[2 * i + 0] = x[0];
      values[2 * i + 1] = x[1];
    },
    VEC3: (x, values, i) => {
      values[3 * i + 0] = x[0];
      values[3 * i + 1] = x[1];
      values[3 * i + 2] = x[2];
    },
    VEC4: (x, values, i) => {
      values[4 * i + 0] = x[0];
      values[4 * i + 1] = x[1];
      values[4 * i + 2] = x[2];
      values[4 * i + 3] = x[3];
    },
    // TODO: check column major correctness
    MAT2: (x, values, i) => {
      values[4 * i + 0] = x[0];
      values[4 * i + 1] = x[1];
      values[4 * i + 2] = x[2];
      values[4 * i + 3] = x[3];
    },
    MAT3: (x, values, i) => {
      values[9 * i + 0] = x[0];
      values[9 * i + 1] = x[1];
      values[9 * i + 2] = x[2];
      values[9 * i + 3] = x[3];
      values[9 * i + 4] = x[4];
      values[9 * i + 5] = x[5];
      values[9 * i + 6] = x[6];
      values[9 * i + 7] = x[7];
      values[9 * i + 8] = x[8];
      values[9 * i + 9] = x[9];
    },
    MAT4: (x, values, i) => {
      values[16 * i + 0] = x[0];
      values[16 * i + 1] = x[1];
      values[16 * i + 2] = x[2];
      values[16 * i + 3] = x[3];
      values[16 * i + 4] = x[4];
      values[16 * i + 5] = x[5];
      values[16 * i + 6] = x[6];
      values[16 * i + 7] = x[7];
      values[16 * i + 8] = x[8];
      values[16 * i + 9] = x[9];
      values[16 * i + 10] = x[10];
      values[16 * i + 11] = x[11];
      values[16 * i + 12] = x[12];
      values[16 * i + 13] = x[13];
      values[16 * i + 14] = x[14];
      values[16 * i + 15] = x[15];
    }
  };
  function createTypedArrayFromAccessor(tile3DAccessor, buffer, byteOffset, length4) {
    const { componentType } = tile3DAccessor;
    assert2(tile3DAccessor.componentType);
    const type = typeof componentType === "string" ? GLType.fromName(componentType) : componentType;
    const size = COMPONENTS_PER_ATTRIBUTE[tile3DAccessor.type];
    const unpacker = UNPACKER[tile3DAccessor.type];
    const packer = PACKER[tile3DAccessor.type];
    byteOffset += tile3DAccessor.byteOffset;
    const values = GLType.createTypedArray(type, buffer, byteOffset, size * length4);
    return {
      values,
      type,
      size,
      unpacker,
      packer
    };
  }

  // src/lib/classes/tile-3d-batch-table-hierarchy.ts
  var defined = (x) => x !== void 0;
  function initializeHierarchy(batchTable, jsonHeader, binaryBody) {
    if (!jsonHeader) {
      return null;
    }
    let hierarchy = batchTable.getExtension("3DTILES_batch_table_hierarchy");
    const legacyHierarchy = jsonHeader.HIERARCHY;
    if (legacyHierarchy) {
      console.warn("3D Tile Parser: HIERARCHY is deprecated. Use 3DTILES_batch_table_hierarchy.");
      jsonHeader.extensions = jsonHeader.extensions || {};
      jsonHeader.extensions["3DTILES_batch_table_hierarchy"] = legacyHierarchy;
      hierarchy = legacyHierarchy;
    }
    if (!hierarchy) {
      return null;
    }
    return initializeHierarchyValues(hierarchy, binaryBody);
  }
  function initializeHierarchyValues(hierarchyJson, binaryBody) {
    let i;
    let classId;
    let binaryAccessor;
    const instancesLength = hierarchyJson.instancesLength;
    const classes = hierarchyJson.classes;
    let classIds = hierarchyJson.classIds;
    let parentCounts = hierarchyJson.parentCounts;
    let parentIds = hierarchyJson.parentIds;
    let parentIdsLength = instancesLength;
    if (defined(classIds.byteOffset)) {
      classIds.componentType = defaultValue(classIds.componentType, GL.UNSIGNED_SHORT);
      classIds.type = AttributeType.SCALAR;
      binaryAccessor = getBinaryAccessor(classIds);
      classIds = binaryAccessor.createArrayBufferView(
        binaryBody.buffer,
        binaryBody.byteOffset + classIds.byteOffset,
        instancesLength
      );
    }
    let parentIndexes;
    if (defined(parentCounts)) {
      if (defined(parentCounts.byteOffset)) {
        parentCounts.componentType = defaultValue(parentCounts.componentType, GL.UNSIGNED_SHORT);
        parentCounts.type = AttributeType.SCALAR;
        binaryAccessor = getBinaryAccessor(parentCounts);
        parentCounts = binaryAccessor.createArrayBufferView(
          binaryBody.buffer,
          binaryBody.byteOffset + parentCounts.byteOffset,
          instancesLength
        );
      }
      parentIndexes = new Uint16Array(instancesLength);
      parentIdsLength = 0;
      for (i = 0; i < instancesLength; ++i) {
        parentIndexes[i] = parentIdsLength;
        parentIdsLength += parentCounts[i];
      }
    }
    if (defined(parentIds) && defined(parentIds.byteOffset)) {
      parentIds.componentType = defaultValue(parentIds.componentType, GL.UNSIGNED_SHORT);
      parentIds.type = AttributeType.SCALAR;
      binaryAccessor = getBinaryAccessor(parentIds);
      parentIds = binaryAccessor.createArrayBufferView(
        binaryBody.buffer,
        binaryBody.byteOffset + parentIds.byteOffset,
        parentIdsLength
      );
    }
    const classesLength = classes.length;
    for (i = 0; i < classesLength; ++i) {
      const classInstancesLength = classes[i].length;
      const properties = classes[i].instances;
      const binaryProperties = getBinaryProperties(classInstancesLength, properties, binaryBody);
      classes[i].instances = combine(binaryProperties, properties);
    }
    const classCounts = new Array(classesLength).fill(0);
    const classIndexes = new Uint16Array(instancesLength);
    for (i = 0; i < instancesLength; ++i) {
      classId = classIds[i];
      classIndexes[i] = classCounts[classId];
      ++classCounts[classId];
    }
    const hierarchy = {
      classes,
      classIds,
      classIndexes,
      parentCounts,
      parentIndexes,
      parentIds
    };
    validateHierarchy(hierarchy);
    return hierarchy;
  }
  function traverseHierarchy(hierarchy, instanceIndex, endConditionCallback) {
    if (!hierarchy) {
      return;
    }
    const parentCounts = hierarchy.parentCounts;
    const parentIds = hierarchy.parentIds;
    if (parentIds) {
      return endConditionCallback(hierarchy, instanceIndex);
    }
    if (parentCounts > 0) {
      return traverseHierarchyMultipleParents(hierarchy, instanceIndex, endConditionCallback);
    }
    return traverseHierarchySingleParent(hierarchy, instanceIndex, endConditionCallback);
  }
  function traverseHierarchyMultipleParents(hierarchy, instanceIndex, endConditionCallback) {
    const classIds = hierarchy.classIds;
    const parentCounts = hierarchy.parentCounts;
    const parentIds = hierarchy.parentIds;
    const parentIndexes = hierarchy.parentIndexes;
    const instancesLength = classIds.length;
    const visited = scratchVisited;
    visited.length = Math.max(visited.length, instancesLength);
    const visitedMarker = ++marker;
    const stack2 = scratchStack;
    stack2.length = 0;
    stack2.push(instanceIndex);
    while (stack2.length > 0) {
      instanceIndex = stack2.pop();
      if (visited[instanceIndex] === visitedMarker) {
        continue;
      }
      visited[instanceIndex] = visitedMarker;
      const result = endConditionCallback(hierarchy, instanceIndex);
      if (defined(result)) {
        return result;
      }
      const parentCount = parentCounts[instanceIndex];
      const parentIndex = parentIndexes[instanceIndex];
      for (let i = 0; i < parentCount; ++i) {
        const parentId = parentIds[parentIndex + i];
        if (parentId !== instanceIndex) {
          stack2.push(parentId);
        }
      }
    }
    return null;
  }
  function traverseHierarchySingleParent(hierarchy, instanceIndex, endConditionCallback) {
    let hasParent = true;
    while (hasParent) {
      const result = endConditionCallback(hierarchy, instanceIndex);
      if (defined(result)) {
        return result;
      }
      const parentId = hierarchy.parentIds[instanceIndex];
      hasParent = parentId !== instanceIndex;
      instanceIndex = parentId;
    }
    throw new Error("traverseHierarchySingleParent");
  }
  function validateHierarchy(hierarchy) {
    const scratchValidateStack = [];
    const classIds = hierarchy.classIds;
    const instancesLength = classIds.length;
    for (let i = 0; i < instancesLength; ++i) {
      validateInstance(hierarchy, i, stack);
    }
  }
  function validateInstance(hierarchy, instanceIndex, stack2) {
    const parentCounts = hierarchy.parentCounts;
    const parentIds = hierarchy.parentIds;
    const parentIndexes = hierarchy.parentIndexes;
    const classIds = hierarchy.classIds;
    const instancesLength = classIds.length;
    if (!defined(parentIds)) {
      return;
    }
    assert(
      instanceIndex < instancesLength,
      `Parent index ${instanceIndex} exceeds the total number of instances: ${instancesLength}`
    );
    assert(
      stack2.indexOf(instanceIndex) === -1,
      "Circular dependency detected in the batch table hierarchy."
    );
    stack2.push(instanceIndex);
    const parentCount = defined(parentCounts) ? parentCounts[instanceIndex] : 1;
    const parentIndex = defined(parentCounts) ? parentIndexes[instanceIndex] : instanceIndex;
    for (let i = 0; i < parentCount; ++i) {
      const parentId = parentIds[parentIndex + i];
      if (parentId !== instanceIndex) {
        validateInstance(hierarchy, parentId, stack2);
      }
    }
    stack2.pop(instanceIndex);
  }

  // src/lib/classes/tile-3d-batch-table.ts
  function defined2(x) {
    return x !== void 0 && x !== null;
  }
  var clone5 = (x, y) => x;
  var IGNORED_PROPERTY_FIELDS = {
    HIERARCHY: true,
    // Deprecated HIERARCHY property
    extensions: true,
    extras: true
  };
  var Tile3DBatchTableParser = class {
    json;
    binary;
    featureCount;
    _extensions;
    // Copy all top-level property fields from the json object, ignoring special fields
    _properties;
    _binaryProperties;
    // TODO: hierarchy support is only partially implemented and not tested
    _hierarchy;
    constructor(json, binary, featureCount, options = {}) {
      assert2(featureCount >= 0);
      this.json = json || {};
      this.binary = binary;
      this.featureCount = featureCount;
      this._extensions = this.json?.extensions || {};
      this._properties = {};
      for (const propertyName in this.json) {
        if (!IGNORED_PROPERTY_FIELDS[propertyName]) {
          this._properties[propertyName] = this.json[propertyName];
        }
      }
      this._binaryProperties = this._initializeBinaryProperties();
      if (options["3DTILES_batch_table_hierarchy"]) {
        this._hierarchy = initializeHierarchy(this, this.json, this.binary);
      }
    }
    getExtension(extensionName) {
      return this.json && this.json.extensions && this.json.extensions[extensionName];
    }
    memorySizeInBytes() {
      return 0;
    }
    isClass(batchId, className) {
      this._checkBatchId(batchId);
      assert2(typeof className === "string", className);
      if (this._hierarchy) {
        const result = traverseHierarchy(this._hierarchy, batchId, (hierarchy, instanceIndex) => {
          const classId = hierarchy.classIds[instanceIndex];
          const instanceClass = hierarchy.classes[classId];
          return instanceClass.name === className;
        });
        return defined2(result);
      }
      return false;
    }
    isExactClass(batchId, className) {
      assert2(typeof className === "string", className);
      return this.getExactClassName(batchId) === className;
    }
    getExactClassName(batchId) {
      this._checkBatchId(batchId);
      if (this._hierarchy) {
        const classId = this._hierarchy.classIds[batchId];
        const instanceClass = this._hierarchy.classes[classId];
        return instanceClass.name;
      }
      return void 0;
    }
    hasProperty(batchId, name14) {
      this._checkBatchId(batchId);
      assert2(typeof name14 === "string", name14);
      return defined2(this._properties[name14]) || this._hasPropertyInHierarchy(batchId, name14);
    }
    getPropertyNames(batchId, results) {
      this._checkBatchId(batchId);
      results = defined2(results) ? results : [];
      results.length = 0;
      const propertyNames = Object.keys(this._properties);
      results.push(...propertyNames);
      if (this._hierarchy) {
        this._getPropertyNamesInHierarchy(batchId, results);
      }
      return results;
    }
    getProperty(batchId, name14) {
      this._checkBatchId(batchId);
      assert2(typeof name14 === "string", name14);
      if (this._binaryProperties) {
        const binaryProperty = this._binaryProperties[name14];
        if (defined2(binaryProperty)) {
          return this._getBinaryProperty(binaryProperty, batchId);
        }
      }
      const propertyValues = this._properties[name14];
      if (defined2(propertyValues)) {
        return clone5(propertyValues[batchId], true);
      }
      if (this._hierarchy) {
        const hierarchyProperty = this._getHierarchyProperty(batchId, name14);
        if (defined2(hierarchyProperty)) {
          return hierarchyProperty;
        }
      }
      return void 0;
    }
    setProperty(batchId, name14, value) {
      const featureCount = this.featureCount;
      this._checkBatchId(batchId);
      assert2(typeof name14 === "string", name14);
      if (this._binaryProperties) {
        const binaryProperty = this._binaryProperties[name14];
        if (binaryProperty) {
          this._setBinaryProperty(binaryProperty, batchId, value);
          return;
        }
      }
      if (this._hierarchy) {
        if (this._setHierarchyProperty(this, batchId, name14, value)) {
          return;
        }
      }
      let propertyValues = this._properties[name14];
      if (!defined2(propertyValues)) {
        this._properties[name14] = new Array(featureCount);
        propertyValues = this._properties[name14];
      }
      propertyValues[batchId] = clone5(value, true);
    }
    // PRIVATE METHODS
    _checkBatchId(batchId) {
      const valid = batchId >= 0 && batchId < this.featureCount;
      if (!valid) {
        throw new Error("batchId not in range [0, featureCount - 1].");
      }
    }
    _getBinaryProperty(binaryProperty, index) {
      return binaryProperty.unpack(binaryProperty.typedArray, index);
    }
    _setBinaryProperty(binaryProperty, index, value) {
      binaryProperty.pack(value, binaryProperty.typedArray, index);
    }
    _initializeBinaryProperties() {
      let binaryProperties = null;
      for (const name14 in this._properties) {
        const property = this._properties[name14];
        const binaryProperty = this._initializeBinaryProperty(name14, property);
        if (binaryProperty) {
          binaryProperties = binaryProperties || {};
          binaryProperties[name14] = binaryProperty;
        }
      }
      return binaryProperties;
    }
    _initializeBinaryProperty(name14, property) {
      if ("byteOffset" in property) {
        const tile3DAccessor = property;
        assert2(this.binary, `Property ${name14} requires a batch table binary.`);
        assert2(tile3DAccessor.type, `Property ${name14} requires a type.`);
        const accessor = createTypedArrayFromAccessor(
          tile3DAccessor,
          this.binary.buffer,
          this.binary.byteOffset | 0,
          this.featureCount
        );
        return {
          typedArray: accessor.values,
          componentCount: accessor.size,
          unpack: accessor.unpacker,
          pack: accessor.packer
        };
      }
      return null;
    }
    //  EXTENSION SUPPORT: 3DTILES_batch_table_hierarchy
    _hasPropertyInHierarchy(batchId, name14) {
      if (!this._hierarchy) {
        return false;
      }
      const result = traverseHierarchy(this._hierarchy, batchId, (hierarchy, instanceIndex) => {
        const classId = hierarchy.classIds[instanceIndex];
        const instances = hierarchy.classes[classId].instances;
        return defined2(instances[name14]);
      });
      return defined2(result);
    }
    _getPropertyNamesInHierarchy(batchId, results) {
      traverseHierarchy(this._hierarchy, batchId, (hierarchy, instanceIndex) => {
        const classId = hierarchy.classIds[instanceIndex];
        const instances = hierarchy.classes[classId].instances;
        for (const name14 in instances) {
          if (instances.hasOwnProperty(name14)) {
            if (results.indexOf(name14) === -1) {
              results.push(name14);
            }
          }
        }
      });
    }
    _getHierarchyProperty(batchId, name14) {
      return traverseHierarchy(this._hierarchy, batchId, (hierarchy, instanceIndex) => {
        const classId = hierarchy.classIds[instanceIndex];
        const instanceClass = hierarchy.classes[classId];
        const indexInClass = hierarchy.classIndexes[instanceIndex];
        const propertyValues = instanceClass.instances[name14];
        if (defined2(propertyValues)) {
          if (defined2(propertyValues.typedArray)) {
            return this._getBinaryProperty(propertyValues, indexInClass);
          }
          return clone5(propertyValues[indexInClass], true);
        }
        return null;
      });
    }
    _setHierarchyProperty(batchTable, batchId, name14, value) {
      const result = traverseHierarchy(this._hierarchy, batchId, (hierarchy, instanceIndex) => {
        const classId = hierarchy.classIds[instanceIndex];
        const instanceClass = hierarchy.classes[classId];
        const indexInClass = hierarchy.classIndexes[instanceIndex];
        const propertyValues = instanceClass.instances[name14];
        if (defined2(propertyValues)) {
          assert2(instanceIndex === batchId, `Inherited property "${name14}" is read-only.`);
          if (defined2(propertyValues.typedArray)) {
            this._setBinaryProperty(propertyValues, indexInClass, value);
          } else {
            propertyValues[indexInClass] = clone5(value, true);
          }
          return true;
        }
        return false;
      });
      return defined2(result);
    }
  };

  // src/lib/parsers/helpers/parse-3d-tile-header.ts
  var SIZEOF_UINT32 = 4;
  function parse3DTileHeaderSync(tile, arrayBuffer, byteOffset = 0) {
    const view = new DataView(arrayBuffer);
    tile.magic = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT32;
    tile.version = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT32;
    tile.byteLength = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT32;
    if (tile.version !== 1) {
      throw new Error(`3D Tile Version ${tile.version} not supported`);
    }
    return byteOffset;
  }

  // src/lib/parsers/helpers/parse-3d-tile-tables.ts
  var SIZEOF_UINT322 = 4;
  var DEPRECATION_WARNING = "b3dm tile in legacy format.";
  function parse3DTileTablesHeaderSync(tile, arrayBuffer, byteOffset) {
    const view = new DataView(arrayBuffer);
    let batchLength;
    tile.header = tile.header || {};
    let featureTableJsonByteLength = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT322;
    let featureTableBinaryByteLength = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT322;
    let batchTableJsonByteLength = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT322;
    let batchTableBinaryByteLength = view.getUint32(byteOffset, true);
    byteOffset += SIZEOF_UINT322;
    if (batchTableJsonByteLength >= 570425344) {
      byteOffset -= SIZEOF_UINT322 * 2;
      batchLength = featureTableJsonByteLength;
      batchTableJsonByteLength = featureTableBinaryByteLength;
      batchTableBinaryByteLength = 0;
      featureTableJsonByteLength = 0;
      featureTableBinaryByteLength = 0;
      console.warn(DEPRECATION_WARNING);
    } else if (batchTableBinaryByteLength >= 570425344) {
      byteOffset -= SIZEOF_UINT322;
      batchLength = batchTableJsonByteLength;
      batchTableJsonByteLength = featureTableJsonByteLength;
      batchTableBinaryByteLength = featureTableBinaryByteLength;
      featureTableJsonByteLength = 0;
      featureTableBinaryByteLength = 0;
      console.warn(DEPRECATION_WARNING);
    }
    tile.header.featureTableJsonByteLength = featureTableJsonByteLength;
    tile.header.featureTableBinaryByteLength = featureTableBinaryByteLength;
    tile.header.batchTableJsonByteLength = batchTableJsonByteLength;
    tile.header.batchTableBinaryByteLength = batchTableBinaryByteLength;
    tile.header.batchLength = batchLength;
    return byteOffset;
  }
  function parse3DTileTablesSync(tile, arrayBuffer, byteOffset, options) {
    byteOffset = parse3DTileFeatureTable(tile, arrayBuffer, byteOffset, options);
    byteOffset = parse3DTileBatchTable(tile, arrayBuffer, byteOffset, options);
    return byteOffset;
  }
  function parse3DTileFeatureTable(tile, arrayBuffer, byteOffset, options) {
    const { featureTableJsonByteLength, featureTableBinaryByteLength, batchLength } = tile.header || {};
    tile.featureTableJson = {
      BATCH_LENGTH: batchLength || 0
    };
    if (featureTableJsonByteLength && featureTableJsonByteLength > 0) {
      const featureTableString = getStringFromArrayBuffer(
        arrayBuffer,
        byteOffset,
        featureTableJsonByteLength
      );
      tile.featureTableJson = JSON.parse(featureTableString);
    }
    byteOffset += featureTableJsonByteLength || 0;
    tile.featureTableBinary = new Uint8Array(arrayBuffer, byteOffset, featureTableBinaryByteLength);
    byteOffset += featureTableBinaryByteLength || 0;
    return byteOffset;
  }
  function parse3DTileBatchTable(tile, arrayBuffer, byteOffset, options) {
    const { batchTableJsonByteLength, batchTableBinaryByteLength } = tile.header || {};
    if (batchTableJsonByteLength && batchTableJsonByteLength > 0) {
      const batchTableString = getStringFromArrayBuffer(
        arrayBuffer,
        byteOffset,
        batchTableJsonByteLength
      );
      tile.batchTableJson = JSON.parse(batchTableString);
      byteOffset += batchTableJsonByteLength;
      if (batchTableBinaryByteLength && batchTableBinaryByteLength > 0) {
        tile.batchTableBinary = new Uint8Array(arrayBuffer, byteOffset, batchTableBinaryByteLength);
        tile.batchTableBinary = new Uint8Array(tile.batchTableBinary);
        byteOffset += batchTableBinaryByteLength;
      }
    }
    return byteOffset;
  }

  // src/lib/parsers/helpers/normalize-3d-tile-colors.ts
  function normalize3DTileColorAttribute(tile, colors, batchTable) {
    if (!colors && (!tile || !tile.batchIds || !batchTable)) {
      return null;
    }
    const { batchIds, isRGB565, pointCount = 0 } = tile;
    if (batchIds && batchTable) {
      const colorArray = new Uint8ClampedArray(pointCount * 3);
      for (let i = 0; i < pointCount; i++) {
        const batchId = batchIds[i];
        const dimensions = batchTable.getProperty(batchId, "dimensions");
        const color = dimensions.map((d) => d * 255);
        colorArray[i * 3] = color[0];
        colorArray[i * 3 + 1] = color[1];
        colorArray[i * 3 + 2] = color[2];
      }
      return {
        type: GL2.UNSIGNED_BYTE,
        value: colorArray,
        size: 3,
        normalized: true
      };
    }
    if (colors && isRGB565) {
      const colorArray = new Uint8ClampedArray(pointCount * 3);
      for (let i = 0; i < pointCount; i++) {
        const color = decodeRGB565(colors[i]);
        colorArray[i * 3] = color[0];
        colorArray[i * 3 + 1] = color[1];
        colorArray[i * 3 + 2] = color[2];
      }
      return {
        type: GL2.UNSIGNED_BYTE,
        value: colorArray,
        size: 3,
        normalized: true
      };
    }
    if (colors && colors.length === pointCount * 3) {
      return {
        type: GL2.UNSIGNED_BYTE,
        value: colors,
        size: 3,
        normalized: true
      };
    }
    return {
      type: GL2.UNSIGNED_BYTE,
      value: colors || new Uint8ClampedArray(),
      size: 4,
      normalized: true
    };
  }

  // src/lib/parsers/helpers/normalize-3d-tile-normals.ts
  var scratchNormal4 = new Vector3();
  function normalize3DTileNormalAttribute(tile, normals) {
    if (!normals) {
      return null;
    }
    if (tile.isOctEncoded16P) {
      const decodedArray = new Float32Array((tile.pointsLength || 0) * 3);
      for (let i = 0; i < (tile.pointsLength || 0); i++) {
        octDecode(normals[i * 2], normals[i * 2 + 1], scratchNormal4);
        scratchNormal4.toArray(decodedArray, i * 3);
      }
      return {
        type: GL2.FLOAT,
        size: 2,
        value: decodedArray
      };
    }
    return {
      type: GL2.FLOAT,
      size: 2,
      value: normals
    };
  }

  // src/lib/parsers/helpers/normalize-3d-tile-positions.ts
  function normalize3DTilePositionAttribute(tile, positions, options) {
    if (!tile.isQuantized) {
      return positions;
    }
    if (options["3d-tiles"] && options["3d-tiles"].decodeQuantizedPositions) {
      tile.isQuantized = false;
      return decodeQuantizedPositions(tile, positions);
    }
    return {
      type: GL2.UNSIGNED_SHORT,
      value: positions,
      size: 3,
      normalized: true
    };
  }
  function decodeQuantizedPositions(tile, positions) {
    const scratchPosition3 = new Vector3();
    const decodedArray = new Float32Array(tile.pointCount * 3);
    for (let i = 0; i < tile.pointCount; i++) {
      scratchPosition3.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]).scale(1 / tile.quantizedRange).multiply(tile.quantizedVolumeScale).add(tile.quantizedVolumeOffset).toArray(decodedArray, i * 3);
    }
    return decodedArray;
  }

  // src/lib/parsers/parse-3d-tile-point-cloud.ts
  async function parsePointCloud3DTile(tile, arrayBuffer, byteOffset, options, context) {
    byteOffset = parse3DTileHeaderSync(tile, arrayBuffer, byteOffset);
    byteOffset = parse3DTileTablesHeaderSync(tile, arrayBuffer, byteOffset);
    byteOffset = parse3DTileTablesSync(tile, arrayBuffer, byteOffset, options);
    initializeTile(tile);
    const { featureTable, batchTable } = parsePointCloudTables(tile);
    await parseDraco(tile, featureTable, batchTable, options, context);
    parsePositions(tile, featureTable, options);
    parseColors(tile, featureTable, batchTable);
    parseNormals(tile, featureTable);
    return byteOffset;
  }
  function initializeTile(tile) {
    tile.attributes = {
      positions: null,
      colors: null,
      normals: null,
      batchIds: null
    };
    tile.isQuantized = false;
    tile.isTranslucent = false;
    tile.isRGB565 = false;
    tile.isOctEncoded16P = false;
  }
  function parsePointCloudTables(tile) {
    const featureTable = new Tile3DFeatureTable(tile.featureTableJson, tile.featureTableBinary);
    const pointsLength = featureTable.getGlobalProperty("POINTS_LENGTH");
    if (!Number.isFinite(pointsLength)) {
      throw new Error("POINTS_LENGTH must be defined");
    }
    featureTable.featuresLength = pointsLength;
    tile.featuresLength = pointsLength;
    tile.pointsLength = pointsLength;
    tile.pointCount = pointsLength;
    tile.rtcCenter = featureTable.getGlobalProperty("RTC_CENTER", GL2.FLOAT, 3);
    const batchTable = parseBatchIds(tile, featureTable);
    return { featureTable, batchTable };
  }
  function parsePositions(tile, featureTable, options) {
    tile.attributes = tile.attributes || {
      positions: null,
      colors: null,
      normals: null,
      batchIds: null
    };
    if (!tile.attributes.positions) {
      if (featureTable.hasProperty("POSITION")) {
        tile.attributes.positions = featureTable.getPropertyArray("POSITION", GL2.FLOAT, 3);
      } else if (featureTable.hasProperty("POSITION_QUANTIZED")) {
        const positions = featureTable.getPropertyArray("POSITION_QUANTIZED", GL2.UNSIGNED_SHORT, 3);
        tile.isQuantized = true;
        tile.quantizedRange = (1 << 16) - 1;
        tile.quantizedVolumeScale = featureTable.getGlobalProperty(
          "QUANTIZED_VOLUME_SCALE",
          GL2.FLOAT,
          3
        );
        if (!tile.quantizedVolumeScale) {
          throw new Error("QUANTIZED_VOLUME_SCALE must be defined for quantized positions.");
        }
        tile.quantizedVolumeOffset = featureTable.getGlobalProperty(
          "QUANTIZED_VOLUME_OFFSET",
          GL2.FLOAT,
          3
        );
        if (!tile.quantizedVolumeOffset) {
          throw new Error("QUANTIZED_VOLUME_OFFSET must be defined for quantized positions.");
        }
        tile.attributes.positions = normalize3DTilePositionAttribute(tile, positions, options);
      }
    }
    if (!tile.attributes.positions) {
      throw new Error("Either POSITION or POSITION_QUANTIZED must be defined.");
    }
  }
  function parseColors(tile, featureTable, batchTable) {
    tile.attributes = tile.attributes || {
      positions: null,
      colors: null,
      normals: null,
      batchIds: null
    };
    if (!tile.attributes.colors) {
      let colors = null;
      if (featureTable.hasProperty("RGBA")) {
        colors = featureTable.getPropertyArray("RGBA", GL2.UNSIGNED_BYTE, 4);
        tile.isTranslucent = true;
      } else if (featureTable.hasProperty("RGB")) {
        colors = featureTable.getPropertyArray("RGB", GL2.UNSIGNED_BYTE, 3);
      } else if (featureTable.hasProperty("RGB565")) {
        colors = featureTable.getPropertyArray("RGB565", GL2.UNSIGNED_SHORT, 1);
        tile.isRGB565 = true;
      }
      tile.attributes.colors = normalize3DTileColorAttribute(tile, colors, batchTable);
    }
    if (featureTable.hasProperty("CONSTANT_RGBA")) {
      tile.constantRGBA = featureTable.getGlobalProperty("CONSTANT_RGBA", GL2.UNSIGNED_BYTE, 4);
    }
  }
  function parseNormals(tile, featureTable) {
    tile.attributes = tile.attributes || {
      positions: null,
      colors: null,
      normals: null,
      batchIds: null
    };
    if (!tile.attributes.normals) {
      let normals = null;
      if (featureTable.hasProperty("NORMAL")) {
        normals = featureTable.getPropertyArray("NORMAL", GL2.FLOAT, 3);
      } else if (featureTable.hasProperty("NORMAL_OCT16P")) {
        normals = featureTable.getPropertyArray("NORMAL_OCT16P", GL2.UNSIGNED_BYTE, 2);
        tile.isOctEncoded16P = true;
      }
      tile.attributes.normals = normalize3DTileNormalAttribute(tile, normals);
    }
  }
  function parseBatchIds(tile, featureTable) {
    let batchTable = null;
    if (!tile.batchIds && featureTable.hasProperty("BATCH_ID")) {
      tile.batchIds = featureTable.getPropertyArray("BATCH_ID", GL2.UNSIGNED_SHORT, 1);
      if (tile.batchIds) {
        const batchFeatureLength = featureTable.getGlobalProperty("BATCH_LENGTH");
        if (!batchFeatureLength) {
          throw new Error("Global property: BATCH_LENGTH must be defined when BATCH_ID is defined.");
        }
        const { batchTableJson, batchTableBinary } = tile;
        batchTable = new Tile3DBatchTableParser(batchTableJson, batchTableBinary, batchFeatureLength);
      }
    }
    return batchTable;
  }
  async function parseDraco(tile, featureTable, batchTable, options, context) {
    let dracoBuffer;
    let dracoFeatureTableProperties;
    let dracoBatchTableProperties;
    const batchTableDraco = tile.batchTableJson && tile.batchTableJson.extensions && tile.batchTableJson.extensions["3DTILES_draco_point_compression"];
    if (batchTableDraco) {
      dracoBatchTableProperties = batchTableDraco.properties;
    }
    const featureTableDraco = featureTable.getExtension("3DTILES_draco_point_compression");
    if (featureTableDraco) {
      dracoFeatureTableProperties = featureTableDraco.properties;
      const dracoByteOffset = featureTableDraco.byteOffset;
      const dracoByteLength = featureTableDraco.byteLength;
      if (!dracoFeatureTableProperties || !Number.isFinite(dracoByteOffset) || !dracoByteLength) {
        throw new Error("Draco properties, byteOffset, and byteLength must be defined");
      }
      dracoBuffer = (tile.featureTableBinary || []).slice(
        dracoByteOffset,
        dracoByteOffset + dracoByteLength
      );
      tile.hasPositions = Number.isFinite(dracoFeatureTableProperties.POSITION);
      tile.hasColors = Number.isFinite(dracoFeatureTableProperties.RGB) || Number.isFinite(dracoFeatureTableProperties.RGBA);
      tile.hasNormals = Number.isFinite(dracoFeatureTableProperties.NORMAL);
      tile.hasBatchIds = Number.isFinite(dracoFeatureTableProperties.BATCH_ID);
      tile.isTranslucent = Number.isFinite(dracoFeatureTableProperties.RGBA);
    }
    if (!dracoBuffer) {
      return true;
    }
    const dracoData = {
      buffer: dracoBuffer,
      properties: { ...dracoFeatureTableProperties, ...dracoBatchTableProperties },
      featureTableProperties: dracoFeatureTableProperties,
      batchTableProperties: dracoBatchTableProperties,
      dequantizeInShader: false
    };
    return await loadDraco(tile, dracoData, options, context);
  }
  async function loadDraco(tile, dracoData, options, context) {
    if (!context) {
      return;
    }
    const dracoOptions = {
      ...options,
      draco: {
        ...options?.draco,
        extraAttributes: dracoData.batchTableProperties || {}
      }
    };
    delete dracoOptions["3d-tiles"];
    const data = await parseFromContext(dracoData.buffer, DracoLoader, dracoOptions, context);
    const decodedPositions = data.attributes.POSITION && data.attributes.POSITION.value;
    const decodedColors = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
    const decodedNormals = data.attributes.NORMAL && data.attributes.NORMAL.value;
    const decodedBatchIds = data.attributes.BATCH_ID && data.attributes.BATCH_ID.value;
    const isQuantizedDraco = decodedPositions && data.attributes.POSITION.value.quantization;
    const isOctEncodedDraco = decodedNormals && data.attributes.NORMAL.value.quantization;
    if (isQuantizedDraco) {
      const quantization = data.POSITION.data.quantization;
      const range = quantization.range;
      tile.quantizedVolumeScale = new Vector3(range, range, range);
      tile.quantizedVolumeOffset = new Vector3(quantization.minValues);
      tile.quantizedRange = (1 << quantization.quantizationBits) - 1;
      tile.isQuantizedDraco = true;
    }
    if (isOctEncodedDraco) {
      tile.octEncodedRange = (1 << data.NORMAL.data.quantization.quantizationBits) - 1;
      tile.isOctEncodedDraco = true;
    }
    const batchTableAttributes = {};
    if (dracoData.batchTableProperties) {
      for (const attributeName of Object.keys(dracoData.batchTableProperties)) {
        if (data.attributes[attributeName] && data.attributes[attributeName].value) {
          batchTableAttributes[attributeName.toLowerCase()] = data.attributes[attributeName].value;
        }
      }
    }
    tile.attributes = {
      // @ts-expect-error
      positions: decodedPositions,
      // @ts-expect-error
      colors: normalize3DTileColorAttribute(tile, decodedColors, void 0),
      // @ts-expect-error
      normals: decodedNormals,
      // @ts-expect-error
      batchIds: decodedBatchIds,
      ...batchTableAttributes
    };
  }

  // ../gltf/src/lib/extensions/EXT_mesh_features.ts
  var EXT_mesh_features_exports = {};
  __export(EXT_mesh_features_exports, {
    createExtMeshFeatures: () => createExtMeshFeatures,
    decode: () => decode,
    encode: () => encode,
    name: () => name
  });

  // ../images/src/lib/utils/version.ts
  var VERSION5 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";

  // ../images/src/lib/category-api/image-type.ts
  var parseImageNode = globalThis.loaders?.parseImageNode;
  var IMAGE_SUPPORTED = typeof Image !== "undefined";
  var IMAGE_BITMAP_SUPPORTED = typeof ImageBitmap !== "undefined";
  var NODE_IMAGE_SUPPORTED = Boolean(parseImageNode);
  var DATA_SUPPORTED = isBrowser ? true : NODE_IMAGE_SUPPORTED;
  function isImageTypeSupported(type) {
    switch (type) {
      case "auto":
        return IMAGE_BITMAP_SUPPORTED || IMAGE_SUPPORTED || DATA_SUPPORTED;
      case "imagebitmap":
        return IMAGE_BITMAP_SUPPORTED;
      case "image":
        return IMAGE_SUPPORTED;
      case "data":
        return DATA_SUPPORTED;
      default:
        throw new Error(`@loaders.gl/images: image ${type} not supported in this environment`);
    }
  }
  function getDefaultImageType() {
    if (IMAGE_BITMAP_SUPPORTED) {
      return "imagebitmap";
    }
    if (IMAGE_SUPPORTED) {
      return "image";
    }
    if (DATA_SUPPORTED) {
      return "data";
    }
    throw new Error("Install '@loaders.gl/polyfills' to parse images under Node.js");
  }

  // ../images/src/lib/category-api/parsed-image-api.ts
  function getImageType(image) {
    const format = getImageTypeOrNull(image);
    if (!format) {
      throw new Error("Not an image");
    }
    return format;
  }
  function getImageData(image) {
    switch (getImageType(image)) {
      case "data":
        return image;
      case "image":
      case "imagebitmap":
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("getImageData");
        }
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height);
      default:
        throw new Error("getImageData");
    }
  }
  function getImageTypeOrNull(image) {
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
      return "imagebitmap";
    }
    if (typeof Image !== "undefined" && image instanceof Image) {
      return "image";
    }
    if (image && typeof image === "object" && image.data && image.width && image.height) {
      return "data";
    }
    return null;
  }

  // ../images/src/lib/parsers/svg-utils.ts
  var SVG_DATA_URL_PATTERN = /^data:image\/svg\+xml/;
  var SVG_URL_PATTERN = /\.svg((\?|#).*)?$/;
  function isSVG(url) {
    return url && (SVG_DATA_URL_PATTERN.test(url) || SVG_URL_PATTERN.test(url));
  }
  function getBlobOrSVGDataUrl(arrayBuffer, url) {
    if (isSVG(url)) {
      const textDecoder = new TextDecoder();
      let xmlText = textDecoder.decode(arrayBuffer);
      try {
        if (typeof unescape === "function" && typeof encodeURIComponent === "function") {
          xmlText = unescape(encodeURIComponent(xmlText));
        }
      } catch (error) {
        throw new Error(error.message);
      }
      const src = `data:image/svg+xml;base64,${btoa(xmlText)}`;
      return src;
    }
    return getBlob(arrayBuffer, url);
  }
  function getBlob(arrayBuffer, url) {
    if (isSVG(url)) {
      throw new Error("SVG cannot be parsed directly to imagebitmap");
    }
    return new Blob([new Uint8Array(arrayBuffer)]);
  }

  // ../images/src/lib/parsers/parse-to-image.ts
  async function parseToImage(arrayBuffer, options, url) {
    const blobOrDataUrl = getBlobOrSVGDataUrl(arrayBuffer, url);
    const URL2 = self.URL || self.webkitURL;
    const objectUrl = typeof blobOrDataUrl !== "string" && URL2.createObjectURL(blobOrDataUrl);
    try {
      return await loadToImage(objectUrl || blobOrDataUrl, options);
    } finally {
      if (objectUrl) {
        URL2.revokeObjectURL(objectUrl);
      }
    }
  }
  async function loadToImage(url, options) {
    const image = new Image();
    image.src = url;
    if (options.image && options.image.decode && image.decode) {
      await image.decode();
      return image;
    }
    return await new Promise((resolve2, reject) => {
      try {
        image.onload = () => resolve2(image);
        image.onerror = (error) => {
          const message = error instanceof Error ? error.message : "error";
          reject(new Error(message));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // ../images/src/lib/parsers/parse-to-image-bitmap.ts
  var imagebitmapOptionsSupported = true;
  async function parseToImageBitmap(arrayBuffer, options, url) {
    let blob;
    if (isSVG(url)) {
      const image = await parseToImage(arrayBuffer, options, url);
      blob = image;
    } else {
      blob = getBlob(arrayBuffer, url);
    }
    const imagebitmapOptions = options && options.imagebitmap;
    return await safeCreateImageBitmap(blob, imagebitmapOptions);
  }
  async function safeCreateImageBitmap(blob, imagebitmapOptions = null) {
    if (isEmptyObject(imagebitmapOptions) || !imagebitmapOptionsSupported) {
      imagebitmapOptions = null;
    }
    if (imagebitmapOptions) {
      try {
        return await createImageBitmap(blob, imagebitmapOptions);
      } catch (error) {
        console.warn(error);
        imagebitmapOptionsSupported = false;
      }
    }
    return await createImageBitmap(blob);
  }
  function isEmptyObject(object) {
    if (!object) {
      return true;
    }
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        return false;
      }
    }
    return true;
  }

  // ../images/src/lib/category-api/parse-isobmff-binary.ts
  function getISOBMFFMediaType(buffer) {
    if (!checkString(buffer, "ftyp", 4)) {
      return null;
    }
    if ((buffer[8] & 96) === 0) {
      return null;
    }
    return decodeMajorBrand(buffer);
  }
  function decodeMajorBrand(buffer) {
    const brandMajor = getUTF8String(buffer, 8, 12).replace("\0", " ").trim();
    switch (brandMajor) {
      case "avif":
      case "avis":
        return { extension: "avif", mimeType: "image/avif" };
      default:
        return null;
    }
  }
  function getUTF8String(array, start, end) {
    return String.fromCharCode(...array.slice(start, end));
  }
  function stringToBytes(string) {
    return [...string].map((character) => character.charCodeAt(0));
  }
  function checkString(buffer, header, offset = 0) {
    const headerBytes = stringToBytes(header);
    for (let i = 0; i < headerBytes.length; ++i) {
      if (headerBytes[i] !== buffer[i + offset]) {
        return false;
      }
    }
    return true;
  }

  // ../images/src/lib/category-api/binary-image-api.ts
  var BIG_ENDIAN = false;
  var LITTLE_ENDIAN = true;
  function getBinaryImageMetadata(binaryData) {
    const dataView = toDataView(binaryData);
    return getPngMetadata(dataView) || getJpegMetadata(dataView) || getGifMetadata(dataView) || getBmpMetadata(dataView) || getISOBMFFMetadata(dataView);
  }
  function getISOBMFFMetadata(binaryData) {
    const buffer = new Uint8Array(binaryData instanceof DataView ? binaryData.buffer : binaryData);
    const mediaType = getISOBMFFMediaType(buffer);
    if (!mediaType) {
      return null;
    }
    return {
      mimeType: mediaType.mimeType,
      // TODO - decode width and height
      width: 0,
      height: 0
    };
  }
  function getPngMetadata(binaryData) {
    const dataView = toDataView(binaryData);
    const isPng = dataView.byteLength >= 24 && dataView.getUint32(0, BIG_ENDIAN) === 2303741511;
    if (!isPng) {
      return null;
    }
    return {
      mimeType: "image/png",
      width: dataView.getUint32(16, BIG_ENDIAN),
      height: dataView.getUint32(20, BIG_ENDIAN)
    };
  }
  function getGifMetadata(binaryData) {
    const dataView = toDataView(binaryData);
    const isGif = dataView.byteLength >= 10 && dataView.getUint32(0, BIG_ENDIAN) === 1195984440;
    if (!isGif) {
      return null;
    }
    return {
      mimeType: "image/gif",
      width: dataView.getUint16(6, LITTLE_ENDIAN),
      height: dataView.getUint16(8, LITTLE_ENDIAN)
    };
  }
  function getBmpMetadata(binaryData) {
    const dataView = toDataView(binaryData);
    const isBmp = dataView.byteLength >= 14 && dataView.getUint16(0, BIG_ENDIAN) === 16973 && dataView.getUint32(2, LITTLE_ENDIAN) === dataView.byteLength;
    if (!isBmp) {
      return null;
    }
    return {
      mimeType: "image/bmp",
      width: dataView.getUint32(18, LITTLE_ENDIAN),
      height: dataView.getUint32(22, LITTLE_ENDIAN)
    };
  }
  function getJpegMetadata(binaryData) {
    const dataView = toDataView(binaryData);
    const isJpeg = dataView.byteLength >= 3 && dataView.getUint16(0, BIG_ENDIAN) === 65496 && dataView.getUint8(2) === 255;
    if (!isJpeg) {
      return null;
    }
    const { tableMarkers, sofMarkers } = getJpegMarkers();
    let i = 2;
    while (i + 9 < dataView.byteLength) {
      const marker2 = dataView.getUint16(i, BIG_ENDIAN);
      if (sofMarkers.has(marker2)) {
        return {
          mimeType: "image/jpeg",
          height: dataView.getUint16(i + 5, BIG_ENDIAN),
          // Number of lines
          width: dataView.getUint16(i + 7, BIG_ENDIAN)
          // Number of pixels per line
        };
      }
      if (!tableMarkers.has(marker2)) {
        return null;
      }
      i += 2;
      i += dataView.getUint16(i, BIG_ENDIAN);
    }
    return null;
  }
  function getJpegMarkers() {
    const tableMarkers = /* @__PURE__ */ new Set([65499, 65476, 65484, 65501, 65534]);
    for (let i = 65504; i < 65520; ++i) {
      tableMarkers.add(i);
    }
    const sofMarkers = /* @__PURE__ */ new Set([
      65472,
      65473,
      65474,
      65475,
      65477,
      65478,
      65479,
      65481,
      65482,
      65483,
      65485,
      65486,
      65487,
      65502
    ]);
    return { tableMarkers, sofMarkers };
  }
  function toDataView(data) {
    if (data instanceof DataView) {
      return data;
    }
    if (ArrayBuffer.isView(data)) {
      return new DataView(data.buffer);
    }
    if (data instanceof ArrayBuffer) {
      return new DataView(data);
    }
    throw new Error("toDataView");
  }

  // ../images/src/lib/parsers/parse-to-node-image.ts
  async function parseToNodeImage(arrayBuffer, options) {
    const { mimeType } = getBinaryImageMetadata(arrayBuffer) || {};
    const parseImageNode2 = globalThis.loaders?.parseImageNode;
    assert2(parseImageNode2);
    return await parseImageNode2(arrayBuffer, mimeType);
  }

  // ../images/src/lib/parsers/parse-image.ts
  async function parseImage(arrayBuffer, options, context) {
    options = options || {};
    const imageOptions = options.image || {};
    const imageType = imageOptions.type || "auto";
    const { url } = context || {};
    const loadType = getLoadableImageType(imageType);
    let image;
    switch (loadType) {
      case "imagebitmap":
        image = await parseToImageBitmap(arrayBuffer, options, url);
        break;
      case "image":
        image = await parseToImage(arrayBuffer, options, url);
        break;
      case "data":
        image = await parseToNodeImage(arrayBuffer, options);
        break;
      default:
        assert2(false);
    }
    if (imageType === "data") {
      image = getImageData(image);
    }
    return image;
  }
  function getLoadableImageType(type) {
    switch (type) {
      case "auto":
      case "data":
        return getDefaultImageType();
      default:
        isImageTypeSupported(type);
        return type;
    }
  }

  // ../images/src/image-loader.ts
  var EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "svg", "avif"];
  var MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp",
    "image/vnd.microsoft.icon",
    "image/svg+xml"
  ];
  var DEFAULT_IMAGE_LOADER_OPTIONS = {
    image: {
      type: "auto",
      decode: true
      // if format is HTML
    }
    // imagebitmap: {} - passes (platform dependent) parameters to ImageBitmap constructor
  };
  var ImageLoader = {
    dataType: null,
    batchType: null,
    id: "image",
    module: "images",
    name: "Images",
    version: VERSION5,
    mimeTypes: MIME_TYPES,
    extensions: EXTENSIONS,
    parse: parseImage,
    // TODO: byteOffset, byteLength;
    tests: [(arrayBuffer) => Boolean(getBinaryImageMetadata(new DataView(arrayBuffer)))],
    options: DEFAULT_IMAGE_LOADER_OPTIONS
  };

  // ../images/src/lib/category-api/image-format.ts
  var MIME_TYPES2 = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/tiff",
    // TODO - what is the correct type for SVG
    "image/svg",
    "image/svg+xml",
    "image/bmp",
    "image/vnd.microsoft.icon"
  ];
  var mimeTypeSupportedPromise = null;
  async function getSupportedImageFormats() {
    if (mimeTypeSupportedPromise) {
      return await mimeTypeSupportedPromise;
    }
    mimeTypeSupportedPromise = getSupportedImageFormatsAsync();
    return await mimeTypeSupportedPromise;
  }
  async function getSupportedImageFormatsAsync() {
    const supportedMimeTypes = /* @__PURE__ */ new Set();
    for (const mimeType of MIME_TYPES2) {
      const supported = isBrowser ? await checkBrowserImageFormatSupportAsync(mimeType) : checkNodeImageFormatSupport(mimeType);
      if (supported) {
        supportedMimeTypes.add(mimeType);
      }
    }
    return supportedMimeTypes;
  }
  var mimeTypeSupportedSync = {};
  function isImageFormatSupported(mimeType) {
    if (mimeTypeSupportedSync[mimeType] === void 0) {
      const supported = isBrowser ? checkBrowserImageFormatSupport(mimeType) : checkNodeImageFormatSupport(mimeType);
      mimeTypeSupportedSync[mimeType] = supported;
    }
    return mimeTypeSupportedSync[mimeType];
  }
  function checkNodeImageFormatSupport(mimeType) {
    const NODE_FORMAT_SUPPORT = ["image/png", "image/jpeg", "image/gif"];
    const imageFormatsNode = globalThis.loaders?.imageFormatsNode || NODE_FORMAT_SUPPORT;
    const parseImageNode2 = globalThis.loaders?.parseImageNode;
    return Boolean(parseImageNode2) && imageFormatsNode.includes(mimeType);
  }
  function checkBrowserImageFormatSupport(mimeType) {
    switch (mimeType) {
      case "image/avif":
      case "image/webp":
        return testBrowserImageFormatSupport(mimeType);
      default:
        return true;
    }
  }
  var TEST_IMAGE = {
    "image/avif": "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=",
    // Lossy test image. Support for lossy images doesn't guarantee support for all WebP images.
    "image/webp": "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA"
  };
  async function checkBrowserImageFormatSupportAsync(mimeType) {
    const dataURL = TEST_IMAGE[mimeType];
    return dataURL ? await testBrowserImageFormatSupportAsync(dataURL) : true;
  }
  function testBrowserImageFormatSupport(mimeType) {
    try {
      const element = document.createElement("canvas");
      const dataURL = element.toDataURL(mimeType);
      return dataURL.indexOf(`data:${mimeType}`) === 0;
    } catch {
      return false;
    }
  }
  async function testBrowserImageFormatSupportAsync(testImageDataURL) {
    return new Promise((resolve2) => {
      const image = new Image();
      image.src = testImageDataURL;
      image.onload = () => resolve2(image.height > 0);
      image.onerror = () => resolve2(false);
    });
  }

  // ../gltf/src/lib/utils/assert.ts
  function assert7(condition, message) {
    if (!condition) {
      throw new Error(message || "assert failed: gltf");
    }
  }

  // ../gltf/src/lib/gltf-utils/gltf-constants.ts
  var COMPONENTS = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  var BYTES = {
    5120: 1,
    // BYTE
    5121: 1,
    // UNSIGNED_BYTE
    5122: 2,
    // SHORT
    5123: 2,
    // UNSIGNED_SHORT
    5125: 4,
    // UNSIGNED_INT
    5126: 4
    // FLOAT
  };

  // ../gltf/src/lib/gltf-utils/gltf-utils.ts
  var MIPMAP_FACTOR = 1.33;
  var TYPES = ["SCALAR", "VEC2", "VEC3", "VEC4"];
  var ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT = [
    [Int8Array, 5120],
    [Uint8Array, 5121],
    [Int16Array, 5122],
    [Uint16Array, 5123],
    [Uint32Array, 5125],
    [Float32Array, 5126],
    [Float64Array, 5130]
  ];
  var ARRAY_TO_COMPONENT_TYPE = new Map(
    ARRAY_CONSTRUCTOR_TO_WEBGL_CONSTANT
  );
  var ATTRIBUTE_TYPE_TO_COMPONENTS = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  var ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE = {
    5120: 1,
    5121: 1,
    5122: 2,
    5123: 2,
    5125: 4,
    5126: 4
  };
  var ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  };
  function getAccessorTypeFromSize(size) {
    const type = TYPES[size - 1];
    return type || TYPES[0];
  }
  function getComponentTypeFromArray(typedArray) {
    const componentType = ARRAY_TO_COMPONENT_TYPE.get(typedArray.constructor);
    if (!componentType) {
      throw new Error("Illegal typed array");
    }
    return componentType;
  }
  function getAccessorArrayTypeAndLength(accessor, bufferView) {
    const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY[accessor.componentType];
    const components = ATTRIBUTE_TYPE_TO_COMPONENTS[accessor.type];
    const bytesPerComponent = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE[accessor.componentType];
    const length4 = accessor.count * components;
    const byteLength = accessor.count * components * bytesPerComponent;
    assert7(byteLength >= 0 && byteLength <= bufferView.byteLength);
    const componentByteSize = BYTES[accessor.componentType];
    const numberOfComponentsInElement = COMPONENTS[accessor.type];
    return { ArrayType, length: length4, byteLength, componentByteSize, numberOfComponentsInElement };
  }
  function getMemoryUsageGLTF(gltf) {
    let { images, bufferViews } = gltf;
    images = images || [];
    bufferViews = bufferViews || [];
    const imageBufferViews = images.map((i) => i.bufferView);
    bufferViews = bufferViews.filter((view) => !imageBufferViews.includes(view));
    const bufferMemory = bufferViews.reduce((acc, view) => acc + view.byteLength, 0);
    const pixelCount = images.reduce((acc, image) => {
      const { width, height } = image.image;
      return acc + width * height;
    }, 0);
    return bufferMemory + Math.ceil(4 * pixelCount * MIPMAP_FACTOR);
  }

  // ../gltf/src/lib/gltf-utils/get-typed-array.ts
  function getTypedArrayForBufferView(json, buffers, bufferViewIndex) {
    const bufferView = json.bufferViews[bufferViewIndex];
    assert7(bufferView);
    const bufferIndex = bufferView.buffer;
    const binChunk = buffers[bufferIndex];
    assert7(binChunk);
    const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
    return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
  }
  function getTypedArrayForAccessor(json, buffers, accessor) {
    const gltfAccessor = typeof accessor === "number" ? json.accessors?.[accessor] : accessor;
    if (!gltfAccessor) {
      throw new Error(`No gltf accessor ${JSON.stringify(accessor)}`);
    }
    const bufferView = json.bufferViews?.[gltfAccessor.bufferView || 0];
    if (!bufferView) {
      throw new Error(`No gltf buffer view for accessor ${bufferView}`);
    }
    const { arrayBuffer, byteOffset: bufferByteOffset } = buffers[bufferView.buffer];
    const byteOffset = (bufferByteOffset || 0) + (gltfAccessor.byteOffset || 0) + (bufferView.byteOffset || 0);
    const { ArrayType, length: length4, componentByteSize, numberOfComponentsInElement } = getAccessorArrayTypeAndLength(gltfAccessor, bufferView);
    const elementByteSize = componentByteSize * numberOfComponentsInElement;
    const elementAddressScale = bufferView.byteStride || elementByteSize;
    if (typeof bufferView.byteStride === "undefined" || bufferView.byteStride === elementByteSize) {
      const result2 = new ArrayType(arrayBuffer, byteOffset, length4);
      return result2;
    }
    const result = new ArrayType(length4);
    for (let i = 0; i < gltfAccessor.count; i++) {
      const values = new ArrayType(
        arrayBuffer,
        byteOffset + i * elementAddressScale,
        numberOfComponentsInElement
      );
      result.set(values, i * numberOfComponentsInElement);
    }
    return result;
  }

  // ../gltf/src/lib/api/gltf-scenegraph.ts
  function makeDefaultGLTFJson() {
    return {
      asset: {
        version: "2.0",
        generator: "loaders.gl"
      },
      buffers: [],
      extensions: {},
      extensionsRequired: [],
      extensionsUsed: []
    };
  }
  var GLTFScenegraph = class {
    // internal
    gltf;
    sourceBuffers;
    byteLength;
    // TODO - why is this not GLTFWithBuffers - what happens to images?
    constructor(gltf) {
      this.gltf = {
        json: gltf?.json || makeDefaultGLTFJson(),
        buffers: gltf?.buffers || [],
        images: gltf?.images || []
      };
      this.sourceBuffers = [];
      this.byteLength = 0;
      if (this.gltf.buffers && this.gltf.buffers[0]) {
        this.byteLength = this.gltf.buffers[0].byteLength;
        this.sourceBuffers = [this.gltf.buffers[0]];
      }
    }
    // Accessors
    get json() {
      return this.gltf.json;
    }
    getApplicationData(key) {
      const data = this.json[key];
      return data;
    }
    getExtraData(key) {
      const extras = this.json.extras || {};
      return extras[key];
    }
    hasExtension(extensionName) {
      const isUsedExtension = this.getUsedExtensions().find((name14) => name14 === extensionName);
      const isRequiredExtension = this.getRequiredExtensions().find((name14) => name14 === extensionName);
      return typeof isUsedExtension === "string" || typeof isRequiredExtension === "string";
    }
    getExtension(extensionName) {
      const isExtension = this.getUsedExtensions().find((name14) => name14 === extensionName);
      const extensions = this.json.extensions || {};
      return isExtension ? extensions[extensionName] : null;
    }
    getRequiredExtension(extensionName) {
      const isRequired = this.getRequiredExtensions().find((name14) => name14 === extensionName);
      return isRequired ? this.getExtension(extensionName) : null;
    }
    getRequiredExtensions() {
      return this.json.extensionsRequired || [];
    }
    getUsedExtensions() {
      return this.json.extensionsUsed || [];
    }
    getRemovedExtensions() {
      return this.json.extensionsRemoved || [];
    }
    getObjectExtension(object, extensionName) {
      const extensions = object.extensions || {};
      return extensions[extensionName];
    }
    getScene(index) {
      return this.getObject("scenes", index);
    }
    getNode(index) {
      return this.getObject("nodes", index);
    }
    getSkin(index) {
      return this.getObject("skins", index);
    }
    getMesh(index) {
      return this.getObject("meshes", index);
    }
    getMaterial(index) {
      return this.getObject("materials", index);
    }
    getAccessor(index) {
      return this.getObject("accessors", index);
    }
    // getCamera(index: number): object | null {
    //   return null; // TODO: fix thi: object  as null;
    // }
    getTexture(index) {
      return this.getObject("textures", index);
    }
    getSampler(index) {
      return this.getObject("samplers", index);
    }
    getImage(index) {
      return this.getObject("images", index);
    }
    getBufferView(index) {
      return this.getObject("bufferViews", index);
    }
    getBuffer(index) {
      return this.getObject("buffers", index);
    }
    getObject(array, index) {
      if (typeof index === "object") {
        return index;
      }
      const object = this.json[array] && this.json[array][index];
      if (!object) {
        throw new Error(`glTF file error: Could not find ${array}[${index}]`);
      }
      return object;
    }
    /**
     * Accepts buffer view index or buffer view object
     * @returns a `Uint8Array`
     */
    getTypedArrayForBufferView(bufferView) {
      bufferView = this.getBufferView(bufferView);
      const bufferIndex = bufferView.buffer;
      const binChunk = this.gltf.buffers[bufferIndex];
      assert7(binChunk);
      const byteOffset = (bufferView.byteOffset || 0) + binChunk.byteOffset;
      return new Uint8Array(binChunk.arrayBuffer, byteOffset, bufferView.byteLength);
    }
    /** Accepts accessor index or accessor object
     * @returns a typed array with type that matches the types
     */
    getTypedArrayForAccessor(accessor) {
      const gltfAccessor = this.getAccessor(accessor);
      return getTypedArrayForAccessor(this.gltf.json, this.gltf.buffers, gltfAccessor);
    }
    /** accepts accessor index or accessor object
     * returns a `Uint8Array`
     */
    getTypedArrayForImageData(image) {
      image = this.getAccessor(image);
      const bufferView = this.getBufferView(image.bufferView);
      const buffer = this.getBuffer(bufferView.buffer);
      const arrayBuffer = buffer.data;
      const byteOffset = bufferView.byteOffset || 0;
      return new Uint8Array(arrayBuffer, byteOffset, bufferView.byteLength);
    }
    // MODIFERS
    /**
     * Add an extra application-defined key to the top-level data structure
     */
    addApplicationData(key, data) {
      this.json[key] = data;
      return this;
    }
    /**
     * `extras` - Standard GLTF field for storing application specific data
     */
    addExtraData(key, data) {
      this.json.extras = this.json.extras || {};
      this.json.extras[key] = data;
      return this;
    }
    addObjectExtension(object, extensionName, data) {
      object.extensions = object.extensions || {};
      object.extensions[extensionName] = data;
      this.registerUsedExtension(extensionName);
      return this;
    }
    setObjectExtension(object, extensionName, data) {
      const extensions = object.extensions || {};
      extensions[extensionName] = data;
    }
    removeObjectExtension(object, extensionName) {
      const extensions = object?.extensions || {};
      if (extensions[extensionName]) {
        this.json.extensionsRemoved = this.json.extensionsRemoved || [];
        const extensionsRemoved = this.json.extensionsRemoved;
        if (!extensionsRemoved.includes(extensionName)) {
          extensionsRemoved.push(extensionName);
        }
      }
      delete extensions[extensionName];
    }
    /**
     * Add to standard GLTF top level extension object, mark as used
     */
    addExtension(extensionName, extensionData = {}) {
      assert7(extensionData);
      this.json.extensions = this.json.extensions || {};
      this.json.extensions[extensionName] = extensionData;
      this.registerUsedExtension(extensionName);
      return extensionData;
    }
    /**
     * Standard GLTF top level extension object, mark as used and required
     */
    addRequiredExtension(extensionName, extensionData = {}) {
      assert7(extensionData);
      this.addExtension(extensionName, extensionData);
      this.registerRequiredExtension(extensionName);
      return extensionData;
    }
    /**
     * Add extensionName to list of used extensions
     */
    registerUsedExtension(extensionName) {
      this.json.extensionsUsed = this.json.extensionsUsed || [];
      if (!this.json.extensionsUsed.find((ext) => ext === extensionName)) {
        this.json.extensionsUsed.push(extensionName);
      }
    }
    /**
     * Add extensionName to list of required extensions
     */
    registerRequiredExtension(extensionName) {
      this.registerUsedExtension(extensionName);
      this.json.extensionsRequired = this.json.extensionsRequired || [];
      if (!this.json.extensionsRequired.find((ext) => ext === extensionName)) {
        this.json.extensionsRequired.push(extensionName);
      }
    }
    /**
     * Removes an extension from the top-level list
     */
    removeExtension(extensionName) {
      if (this.json.extensions?.[extensionName]) {
        this.json.extensionsRemoved = this.json.extensionsRemoved || [];
        const extensionsRemoved = this.json.extensionsRemoved;
        if (!extensionsRemoved.includes(extensionName)) {
          extensionsRemoved.push(extensionName);
        }
      }
      if (this.json.extensions) {
        delete this.json.extensions[extensionName];
      }
      if (this.json.extensionsRequired) {
        this._removeStringFromArray(this.json.extensionsRequired, extensionName);
      }
      if (this.json.extensionsUsed) {
        this._removeStringFromArray(this.json.extensionsUsed, extensionName);
      }
    }
    /**
     *  Set default scene which is to be displayed at load time
     */
    setDefaultScene(sceneIndex) {
      this.json.scene = sceneIndex;
    }
    /**
     * @todo: add more properties for scene initialization:
     *   name`, `extensions`, `extras`
     *   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-scene
     */
    addScene(scene) {
      const { nodeIndices } = scene;
      this.json.scenes = this.json.scenes || [];
      this.json.scenes.push({ nodes: nodeIndices });
      return this.json.scenes.length - 1;
    }
    /**
     * @todo: add more properties for node initialization:
     *   `name`, `extensions`, `extras`, `camera`, `children`, `skin`, `rotation`, `scale`, `translation`, `weights`
     *   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#node
     */
    addNode(node) {
      const { meshIndex, matrix } = node;
      this.json.nodes = this.json.nodes || [];
      const nodeData = { mesh: meshIndex };
      if (matrix) {
        nodeData.matrix = matrix;
      }
      this.json.nodes.push(nodeData);
      return this.json.nodes.length - 1;
    }
    /** Adds a mesh to the json part */
    addMesh(mesh) {
      const { attributes, indices, material, mode = 4 } = mesh;
      const accessors = this._addAttributes(attributes);
      const glTFMesh = {
        primitives: [
          {
            attributes: accessors,
            mode
          }
        ]
      };
      if (indices) {
        const indicesAccessor = this._addIndices(indices);
        glTFMesh.primitives[0].indices = indicesAccessor;
      }
      if (Number.isFinite(material)) {
        glTFMesh.primitives[0].material = material;
      }
      this.json.meshes = this.json.meshes || [];
      this.json.meshes.push(glTFMesh);
      return this.json.meshes.length - 1;
    }
    addPointCloud(attributes) {
      const accessorIndices = this._addAttributes(attributes);
      const glTFMesh = {
        primitives: [
          {
            attributes: accessorIndices,
            mode: 0
            // GL.POINTS
          }
        ]
      };
      this.json.meshes = this.json.meshes || [];
      this.json.meshes.push(glTFMesh);
      return this.json.meshes.length - 1;
    }
    /**
     * Adds a binary image. Builds glTF "JSON metadata" and saves buffer reference
     * Buffer will be copied into BIN chunk during "pack"
     * Currently encodes as glTF image
     * @param imageData
     * @param mimeType
     */
    addImage(imageData, mimeTypeOpt) {
      const metadata = getBinaryImageMetadata(imageData);
      const mimeType = mimeTypeOpt || metadata?.mimeType;
      const bufferViewIndex = this.addBufferView(imageData);
      const glTFImage = {
        bufferView: bufferViewIndex,
        mimeType
      };
      this.json.images = this.json.images || [];
      this.json.images.push(glTFImage);
      return this.json.images.length - 1;
    }
    /**
     * Add one untyped source buffer, create a matching glTF `bufferView`, and return its index
     * @param buffer
     */
    addBufferView(buffer, bufferIndex = 0, byteOffset = this.byteLength) {
      const byteLength = buffer.byteLength;
      assert7(Number.isFinite(byteLength));
      this.sourceBuffers = this.sourceBuffers || [];
      this.sourceBuffers.push(buffer);
      const glTFBufferView = {
        buffer: bufferIndex,
        // Write offset from the start of the binary body
        byteOffset,
        byteLength
      };
      this.byteLength += padToNBytes(byteLength, 4);
      this.json.bufferViews = this.json.bufferViews || [];
      this.json.bufferViews.push(glTFBufferView);
      return this.json.bufferViews.length - 1;
    }
    /**
     * Adds an accessor to a bufferView
     * @param bufferViewIndex
     * @param accessor
     */
    addAccessor(bufferViewIndex, accessor) {
      const glTFAccessor = {
        bufferView: bufferViewIndex,
        // @ts-ignore
        type: getAccessorTypeFromSize(accessor.size),
        // @ts-ignore
        componentType: accessor.componentType,
        // @ts-ignore
        count: accessor.count,
        // @ts-ignore
        max: accessor.max,
        // @ts-ignore
        min: accessor.min
      };
      this.json.accessors = this.json.accessors || [];
      this.json.accessors.push(glTFAccessor);
      return this.json.accessors.length - 1;
    }
    /**
     * Add a binary buffer. Builds glTF "JSON metadata" and saves buffer reference
     * Buffer will be copied into BIN chunk during "pack"
     * Currently encodes buffers as glTF accessors, but this could be optimized
     * @param sourceBuffer
     * @param accessor
     */
    addBinaryBuffer(sourceBuffer, accessor = { size: 3 }) {
      const bufferViewIndex = this.addBufferView(sourceBuffer);
      let minMax = { min: accessor.min, max: accessor.max };
      if (!minMax.min || !minMax.max) {
        minMax = this._getAccessorMinMax(sourceBuffer, accessor.size);
      }
      const accessorDefaults = {
        // @ts-ignore
        size: accessor.size,
        componentType: getComponentTypeFromArray(sourceBuffer),
        // @ts-ignore
        count: Math.round(sourceBuffer.length / accessor.size),
        min: minMax.min,
        max: minMax.max
      };
      return this.addAccessor(bufferViewIndex, Object.assign(accessorDefaults, accessor));
    }
    /**
     * Adds a texture to the json part
     * @todo: add more properties for texture initialization
     * `sampler`, `name`, `extensions`, `extras`
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#texture
     */
    addTexture(texture) {
      const { imageIndex } = texture;
      const glTFTexture = {
        source: imageIndex
      };
      this.json.textures = this.json.textures || [];
      this.json.textures.push(glTFTexture);
      return this.json.textures.length - 1;
    }
    /** Adds a material to the json part */
    addMaterial(pbrMaterialInfo) {
      this.json.materials = this.json.materials || [];
      this.json.materials.push(pbrMaterialInfo);
      return this.json.materials.length - 1;
    }
    /** Pack the binary chunk */
    createBinaryChunk() {
      const totalByteLength = this.byteLength;
      const arrayBuffer = new ArrayBuffer(totalByteLength);
      const targetArray = new Uint8Array(arrayBuffer);
      let dstByteOffset = 0;
      for (const sourceBuffer of this.sourceBuffers || []) {
        dstByteOffset = copyToArray(sourceBuffer, targetArray, dstByteOffset);
      }
      if (this.json?.buffers?.[0]) {
        this.json.buffers[0].byteLength = totalByteLength;
      } else {
        this.json.buffers = [{ byteLength: totalByteLength }];
      }
      this.gltf.binary = arrayBuffer;
      this.sourceBuffers = [arrayBuffer];
      this.gltf.buffers = [{ arrayBuffer, byteOffset: 0, byteLength: arrayBuffer.byteLength }];
    }
    // PRIVATE
    _removeStringFromArray(array, string) {
      let found = true;
      while (found) {
        const index = array.indexOf(string);
        if (index > -1) {
          array.splice(index, 1);
        } else {
          found = false;
        }
      }
    }
    /**
     * Add attributes to buffers and create `attributes` object which is part of `mesh`
     */
    _addAttributes(attributes = {}) {
      const result = {};
      for (const attributeKey in attributes) {
        const attributeData = attributes[attributeKey];
        const attrName = this._getGltfAttributeName(attributeKey);
        const accessor = this.addBinaryBuffer(attributeData.value, attributeData);
        result[attrName] = accessor;
      }
      return result;
    }
    /**
     * Add indices to buffers
     */
    _addIndices(indices) {
      return this.addBinaryBuffer(indices, { size: 1 });
    }
    /**
     * Deduce gltf specific attribue name from input attribute name
     */
    _getGltfAttributeName(attributeName) {
      switch (attributeName.toLowerCase()) {
        case "position":
        case "positions":
        case "vertices":
          return "POSITION";
        case "normal":
        case "normals":
          return "NORMAL";
        case "color":
        case "colors":
          return "COLOR_0";
        case "texcoord":
        case "texcoords":
          return "TEXCOORD_0";
        default:
          return attributeName;
      }
    }
    /**
     * Calculate `min` and `max` arrays of accessor according to spec:
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#reference-accessor
     */
    _getAccessorMinMax(buffer, size) {
      const result = { min: null, max: null };
      if (buffer.length < size) {
        return result;
      }
      result.min = [];
      result.max = [];
      const initValues = buffer.subarray(0, size);
      for (const value of initValues) {
        result.min.push(value);
        result.max.push(value);
      }
      for (let index = size; index < buffer.length; index += size) {
        for (let componentIndex = 0; componentIndex < size; componentIndex++) {
          result.min[0 + componentIndex] = Math.min(
            // @ts-ignore
            result.min[0 + componentIndex],
            buffer[index + componentIndex]
          );
          result.max[0 + componentIndex] = Math.max(
            // @ts-ignore
            result.max[0 + componentIndex],
            buffer[index + componentIndex]
          );
        }
      }
      return result;
    }
  };

  // ../gltf/src/lib/extensions/utils/3d-tiles-utils.ts
  function emod(n) {
    return (n % 1 + 1) % 1;
  }
  var ATTRIBUTE_TYPE_TO_COMPONENTS2 = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
    BOOLEAN: 1,
    STRING: 1,
    ENUM: 1
  };
  var ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY2 = {
    INT8: Int8Array,
    UINT8: Uint8Array,
    INT16: Int16Array,
    UINT16: Uint16Array,
    INT32: Int32Array,
    UINT32: Uint32Array,
    INT64: BigInt64Array,
    UINT64: BigUint64Array,
    FLOAT32: Float32Array,
    FLOAT64: Float64Array
  };
  var ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2 = {
    INT8: 1,
    UINT8: 1,
    INT16: 2,
    UINT16: 2,
    INT32: 4,
    UINT32: 4,
    INT64: 8,
    UINT64: 8,
    FLOAT32: 4,
    FLOAT64: 8
  };
  function getArrayElementByteSize(attributeType, componentType) {
    return ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2[componentType] * ATTRIBUTE_TYPE_TO_COMPONENTS2[attributeType];
  }
  function getOffsetsForProperty(scenegraph, bufferViewIndex, offsetType, numberOfElements) {
    if (offsetType !== "UINT8" && offsetType !== "UINT16" && offsetType !== "UINT32" && offsetType !== "UINT64") {
      return null;
    }
    const arrayOffsetsBytes = scenegraph.getTypedArrayForBufferView(bufferViewIndex);
    const arrayOffsets = convertRawBufferToMetadataArray(
      arrayOffsetsBytes,
      "SCALAR",
      // offsets consist of ONE component
      offsetType,
      numberOfElements + 1
      // The number of offsets is equal to the property table `count` plus one.
    );
    if (arrayOffsets instanceof BigInt64Array || arrayOffsets instanceof BigUint64Array) {
      return null;
    }
    return arrayOffsets;
  }
  function convertRawBufferToMetadataArray(data, attributeType, componentType, elementCount = 1) {
    const numberOfComponents = ATTRIBUTE_TYPE_TO_COMPONENTS2[attributeType];
    const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY2[componentType];
    const size = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE2[componentType];
    const length4 = elementCount * numberOfComponents;
    const byteLength = length4 * size;
    let buffer = data.buffer;
    let offset = data.byteOffset;
    if (offset % size !== 0) {
      const bufferArray = new Uint8Array(buffer);
      buffer = bufferArray.slice(offset, offset + byteLength).buffer;
      offset = 0;
    }
    return new ArrayType(ensureArrayBuffer(buffer), offset, length4);
  }
  function getPrimitiveTextureData(scenegraph, textureInfo, primitive) {
    const texCoordAccessorKey = `TEXCOORD_${textureInfo.texCoord || 0}`;
    const texCoordAccessorIndex = primitive.attributes[texCoordAccessorKey];
    const textureCoordinates = scenegraph.getTypedArrayForAccessor(texCoordAccessorIndex);
    const json = scenegraph.gltf.json;
    const textureIndex = textureInfo.index;
    const imageIndex = json.textures?.[textureIndex]?.source;
    if (typeof imageIndex !== "undefined") {
      const mimeType = json.images?.[imageIndex]?.mimeType;
      const parsedImage = scenegraph.gltf.images?.[imageIndex];
      if (parsedImage && typeof parsedImage.width !== "undefined") {
        const textureData = [];
        for (let index = 0; index < textureCoordinates.length; index += 2) {
          const value = getImageValueByCoordinates(
            parsedImage,
            mimeType,
            textureCoordinates,
            index,
            textureInfo.channels
          );
          textureData.push(value);
        }
        return textureData;
      }
    }
    return [];
  }
  function primitivePropertyDataToAttributes(scenegraph, attributeName, propertyData, featureTable, primitive) {
    if (!propertyData?.length) {
      return;
    }
    const featureIndices = [];
    for (const texelData of propertyData) {
      let index = featureTable.findIndex((item) => item === texelData);
      if (index === -1) {
        index = featureTable.push(texelData) - 1;
      }
      featureIndices.push(index);
    }
    const typedArray = new Uint32Array(featureIndices);
    const bufferIndex = scenegraph.gltf.buffers.push({
      arrayBuffer: typedArray.buffer,
      byteOffset: typedArray.byteOffset,
      byteLength: typedArray.byteLength
    }) - 1;
    const bufferViewIndex = scenegraph.addBufferView(typedArray, bufferIndex, 0);
    const accessorIndex = scenegraph.addAccessor(bufferViewIndex, {
      size: 1,
      componentType: getComponentTypeFromArray(typedArray),
      count: typedArray.length
    });
    primitive.attributes[attributeName] = accessorIndex;
  }
  function getImageValueByCoordinates(parsedImage, mimeType, textureCoordinates, index, channels = [0]) {
    const CHANNELS_MAP = {
      r: { offset: 0, shift: 0 },
      g: { offset: 1, shift: 8 },
      b: { offset: 2, shift: 16 },
      a: { offset: 3, shift: 24 }
    };
    const u = textureCoordinates[index];
    const v = textureCoordinates[index + 1];
    let components = 1;
    if (mimeType && (mimeType.indexOf("image/jpeg") !== -1 || mimeType.indexOf("image/png") !== -1))
      components = 4;
    const offset = coordinatesToOffset(u, v, parsedImage, components);
    let value = 0;
    for (const c of channels) {
      const map2 = typeof c === "number" ? Object.values(CHANNELS_MAP)[c] : CHANNELS_MAP[c];
      const imageOffset = offset + map2.offset;
      const imageData = getImageData(parsedImage);
      if (imageData.data.length <= imageOffset) {
        throw new Error(`${imageData.data.length} <= ${imageOffset}`);
      }
      const imageValue = imageData.data[imageOffset];
      value |= imageValue << map2.shift;
    }
    return value;
  }
  function coordinatesToOffset(u, v, parsedImage, componentsCount = 1) {
    const w = parsedImage.width;
    const iX = emod(u) * (w - 1);
    const indX = Math.round(iX);
    const h = parsedImage.height;
    const iY = emod(v) * (h - 1);
    const indY = Math.round(iY);
    const components = parsedImage.components ? parsedImage.components : componentsCount;
    const offset = (indY * w + indX) * components;
    return offset;
  }
  function parseVariableLengthArrayNumeric(valuesData, numberOfElements, arrayOffsets, valuesDataBytesLength, valueSize) {
    const attributeValueArray = [];
    for (let index = 0; index < numberOfElements; index++) {
      const arrayOffset = arrayOffsets[index];
      const arrayByteSize = arrayOffsets[index + 1] - arrayOffsets[index];
      if (arrayByteSize + arrayOffset > valuesDataBytesLength) {
        break;
      }
      const typedArrayOffset = arrayOffset / valueSize;
      const elementCount = arrayByteSize / valueSize;
      attributeValueArray.push(valuesData.slice(typedArrayOffset, typedArrayOffset + elementCount));
    }
    return attributeValueArray;
  }
  function parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount) {
    const attributeValueArray = [];
    for (let index = 0; index < numberOfElements; index++) {
      const elementOffset = index * arrayCount;
      attributeValueArray.push(valuesData.slice(elementOffset, elementOffset + arrayCount));
    }
    return attributeValueArray;
  }
  function getPropertyDataString(numberOfElements, valuesDataBytes, arrayOffsets, stringOffsets) {
    if (arrayOffsets) {
      throw new Error("Not implemented - arrayOffsets for strings is specified");
    }
    if (stringOffsets) {
      const stringsArray = [];
      const textDecoder = new TextDecoder("utf8");
      let stringOffset = 0;
      for (let index = 0; index < numberOfElements; index++) {
        const stringByteSize = stringOffsets[index + 1] - stringOffsets[index];
        if (stringByteSize + stringOffset <= valuesDataBytes.length) {
          const stringData = valuesDataBytes.subarray(stringOffset, stringByteSize + stringOffset);
          const stringAttribute = textDecoder.decode(stringData);
          stringsArray.push(stringAttribute);
          stringOffset += stringByteSize;
        }
      }
      return stringsArray;
    }
    return [];
  }

  // ../gltf/src/lib/extensions/EXT_mesh_features.ts
  var EXT_MESH_FEATURES_NAME = "EXT_mesh_features";
  var name = EXT_MESH_FEATURES_NAME;
  async function decode(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    decodeExtMeshFeatures(scenegraph, options);
  }
  function encode(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    encodeExtMeshFeatures(scenegraph, options);
    scenegraph.createBinaryChunk();
    return scenegraph.gltf;
  }
  function decodeExtMeshFeatures(scenegraph, options) {
    const json = scenegraph.gltf.json;
    if (!json.meshes) {
      return;
    }
    for (const mesh of json.meshes) {
      for (const primitive of mesh.primitives) {
        processMeshPrimitiveFeatures(scenegraph, primitive, options);
      }
    }
  }
  function processMeshPrimitiveFeatures(scenegraph, primitive, options) {
    if (!options?.gltf?.loadBuffers) {
      return;
    }
    const extension = primitive.extensions?.[EXT_MESH_FEATURES_NAME];
    const featureIds = extension?.featureIds;
    if (!featureIds) {
      return;
    }
    for (const featureId of featureIds) {
      let featureIdData;
      if (typeof featureId.attribute !== "undefined") {
        const accessorKey = `_FEATURE_ID_${featureId.attribute}`;
        const accessorIndex = primitive.attributes[accessorKey];
        featureIdData = scenegraph.getTypedArrayForAccessor(accessorIndex);
      } else if (typeof featureId.texture !== "undefined" && options?.gltf?.loadImages) {
        featureIdData = getPrimitiveTextureData(scenegraph, featureId.texture, primitive);
      } else {
        featureIdData = [];
      }
      featureId.data = featureIdData;
    }
  }
  function encodeExtMeshFeatures(scenegraph, options) {
    const meshes = scenegraph.gltf.json.meshes;
    if (!meshes) {
      return;
    }
    for (const mesh of meshes) {
      for (const primitive of mesh.primitives) {
        encodeExtMeshFeaturesForPrimitive(scenegraph, primitive);
      }
    }
  }
  function createExtMeshFeatures(scenegraph, primitive, featureIdArray, propertyTableIndex) {
    if (!primitive.extensions) {
      primitive.extensions = {};
    }
    let extension = primitive.extensions[EXT_MESH_FEATURES_NAME];
    if (!extension) {
      extension = { featureIds: [] };
      primitive.extensions[EXT_MESH_FEATURES_NAME] = extension;
    }
    const { featureIds } = extension;
    const featureId = {
      featureCount: featureIdArray.length,
      propertyTable: propertyTableIndex,
      data: featureIdArray
    };
    featureIds.push(featureId);
    scenegraph.addObjectExtension(primitive, EXT_MESH_FEATURES_NAME, extension);
  }
  function encodeExtMeshFeaturesForPrimitive(scenegraph, primitive) {
    const extension = primitive.extensions?.[EXT_MESH_FEATURES_NAME];
    if (!extension) {
      return;
    }
    const featureIds = extension.featureIds;
    featureIds.forEach((featureId, elementIndex) => {
      if (featureId.data) {
        const { accessorKey, index } = createAccessorKey(primitive.attributes);
        const typedArray = new Uint32Array(featureId.data);
        featureIds[elementIndex] = {
          featureCount: typedArray.length,
          propertyTable: featureId.propertyTable,
          attribute: index
        };
        scenegraph.gltf.buffers.push({
          arrayBuffer: typedArray.buffer,
          byteOffset: typedArray.byteOffset,
          byteLength: typedArray.byteLength
        });
        const bufferViewIndex = scenegraph.addBufferView(typedArray);
        const accessorIndex = scenegraph.addAccessor(bufferViewIndex, {
          size: 1,
          componentType: getComponentTypeFromArray(typedArray),
          count: typedArray.length
        });
        primitive.attributes[accessorKey] = accessorIndex;
      }
    });
  }
  function createAccessorKey(attributes) {
    const prefix = "_FEATURE_ID_";
    const attrs = Object.keys(attributes).filter((item) => item.indexOf(prefix) === 0);
    let max2 = -1;
    for (const a of attrs) {
      const n = Number(a.substring(prefix.length));
      if (n > max2) {
        max2 = n;
      }
    }
    max2++;
    const accessorKey = `${prefix}${max2}`;
    return { accessorKey, index: max2 };
  }

  // ../gltf/src/lib/extensions/EXT_structural_metadata.ts
  var EXT_structural_metadata_exports = {};
  __export(EXT_structural_metadata_exports, {
    createExtStructuralMetadata: () => createExtStructuralMetadata,
    decode: () => decode2,
    encode: () => encode2,
    name: () => name2
  });
  var EXT_STRUCTURAL_METADATA_NAME = "EXT_structural_metadata";
  var name2 = EXT_STRUCTURAL_METADATA_NAME;
  async function decode2(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    decodeExtStructuralMetadata(scenegraph, options);
  }
  function encode2(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    encodeExtStructuralMetadata(scenegraph, options);
    scenegraph.createBinaryChunk();
    return scenegraph.gltf;
  }
  function decodeExtStructuralMetadata(scenegraph, options) {
    if (!options.gltf?.loadBuffers) {
      return;
    }
    const extension = scenegraph.getExtension(
      EXT_STRUCTURAL_METADATA_NAME
    );
    if (!extension) {
      return;
    }
    if (options.gltf?.loadImages) {
      decodePropertyTextures(scenegraph, extension);
    }
    decodePropertyTables(scenegraph, extension);
  }
  function decodePropertyTextures(scenegraph, extension) {
    const propertyTextures = extension.propertyTextures;
    const json = scenegraph.gltf.json;
    if (propertyTextures && json.meshes) {
      for (const mesh of json.meshes) {
        for (const primitive of mesh.primitives) {
          processPrimitivePropertyTextures(scenegraph, propertyTextures, primitive, extension);
        }
      }
    }
  }
  function decodePropertyTables(scenegraph, extension) {
    const schema = extension.schema;
    if (!schema) {
      return;
    }
    const schemaClasses = schema.classes;
    const propertyTables = extension.propertyTables;
    if (schemaClasses && propertyTables) {
      for (const schemaName in schemaClasses) {
        const propertyTable = findPropertyTableByClass(propertyTables, schemaName);
        if (propertyTable) {
          processPropertyTable(scenegraph, schema, propertyTable);
        }
      }
    }
  }
  function findPropertyTableByClass(propertyTables, schemaClassName) {
    for (const propertyTable of propertyTables) {
      if (propertyTable.class === schemaClassName) {
        return propertyTable;
      }
    }
    return null;
  }
  function processPrimitivePropertyTextures(scenegraph, propertyTextures, primitive, extension) {
    if (!propertyTextures) {
      return;
    }
    const primitiveExtension = primitive.extensions?.[EXT_STRUCTURAL_METADATA_NAME];
    const primitivePropertyTextureIndices = primitiveExtension?.propertyTextures;
    if (!primitivePropertyTextureIndices) {
      return;
    }
    for (const primitivePropertyTextureIndex of primitivePropertyTextureIndices) {
      const propertyTexture = propertyTextures[primitivePropertyTextureIndex];
      processPrimitivePropertyTexture(scenegraph, propertyTexture, primitive, extension);
    }
  }
  function processPrimitivePropertyTexture(scenegraph, propertyTexture, primitive, extension) {
    if (!propertyTexture.properties) {
      return;
    }
    if (!extension.dataAttributeNames) {
      extension.dataAttributeNames = [];
    }
    const className = propertyTexture.class;
    for (const propertyName in propertyTexture.properties) {
      const attributeName = `${className}_${propertyName}`;
      const textureInfoTopLevel = propertyTexture.properties?.[propertyName];
      if (!textureInfoTopLevel) {
        continue;
      }
      if (!textureInfoTopLevel.data) {
        textureInfoTopLevel.data = [];
      }
      const featureTextureTable = textureInfoTopLevel.data;
      const propertyData = getPrimitiveTextureData(
        scenegraph,
        textureInfoTopLevel,
        primitive
      );
      if (propertyData === null) {
        continue;
      }
      primitivePropertyDataToAttributes(
        scenegraph,
        attributeName,
        propertyData,
        featureTextureTable,
        primitive
      );
      textureInfoTopLevel.data = featureTextureTable;
      extension.dataAttributeNames.push(attributeName);
    }
  }
  function processPropertyTable(scenegraph, schema, propertyTable) {
    const schemaClass = schema.classes?.[propertyTable.class];
    if (!schemaClass) {
      throw new Error(
        `Incorrect data in the EXT_structural_metadata extension: no schema class with name ${propertyTable.class}`
      );
    }
    const numberOfElements = propertyTable.count;
    for (const propertyName in schemaClass.properties) {
      const classProperty = schemaClass.properties[propertyName];
      const propertyTableProperty = propertyTable.properties?.[propertyName];
      if (propertyTableProperty) {
        const data = getPropertyDataFromBinarySource(
          scenegraph,
          schema,
          classProperty,
          numberOfElements,
          propertyTableProperty
        );
        propertyTableProperty.data = data;
      }
    }
  }
  function getPropertyDataFromBinarySource(scenegraph, schema, classProperty, numberOfElements, propertyTableProperty) {
    let data = [];
    const valuesBufferView = propertyTableProperty.values;
    const valuesDataBytes = scenegraph.getTypedArrayForBufferView(valuesBufferView);
    const arrayOffsets = getArrayOffsetsForProperty(
      scenegraph,
      classProperty,
      propertyTableProperty,
      numberOfElements
    );
    const stringOffsets = getStringOffsetsForProperty(
      scenegraph,
      propertyTableProperty,
      numberOfElements
    );
    switch (classProperty.type) {
      case "SCALAR":
      case "VEC2":
      case "VEC3":
      case "VEC4":
      case "MAT2":
      case "MAT3":
      case "MAT4": {
        data = getPropertyDataNumeric(classProperty, numberOfElements, valuesDataBytes, arrayOffsets);
        break;
      }
      case "BOOLEAN": {
        throw new Error(`Not implemented - classProperty.type=${classProperty.type}`);
      }
      case "STRING": {
        data = getPropertyDataString(numberOfElements, valuesDataBytes, arrayOffsets, stringOffsets);
        break;
      }
      case "ENUM": {
        data = getPropertyDataENUM(
          schema,
          classProperty,
          numberOfElements,
          valuesDataBytes,
          arrayOffsets
        );
        break;
      }
      default:
        throw new Error(`Unknown classProperty type ${classProperty.type}`);
    }
    return data;
  }
  function getArrayOffsetsForProperty(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
    if (classProperty.array && // `count` is a number of array elements. May only be defined when `array` is true.
    // If `count` is NOT defined, it's a VARIABLE-length array
    typeof classProperty.count === "undefined" && // `arrayOffsets` is an index of the buffer view containing offsets for variable-length arrays.
    typeof propertyTableProperty.arrayOffsets !== "undefined") {
      return getOffsetsForProperty(
        scenegraph,
        propertyTableProperty.arrayOffsets,
        propertyTableProperty.arrayOffsetType || "UINT32",
        numberOfElements
      );
    }
    return null;
  }
  function getStringOffsetsForProperty(scenegraph, propertyTableProperty, numberOfElements) {
    if (typeof propertyTableProperty.stringOffsets !== "undefined") {
      return getOffsetsForProperty(
        scenegraph,
        propertyTableProperty.stringOffsets,
        propertyTableProperty.stringOffsetType || "UINT32",
        numberOfElements
      );
    }
    return null;
  }
  function getPropertyDataNumeric(classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
    const isArray2 = classProperty.array;
    const arrayCount = classProperty.count;
    const elementSize = getArrayElementByteSize(classProperty.type, classProperty.componentType);
    const elementCount = valuesDataBytes.byteLength / elementSize;
    let valuesData;
    if (classProperty.componentType) {
      valuesData = convertRawBufferToMetadataArray(
        valuesDataBytes,
        classProperty.type,
        // The datatype of the element's components. Only applicable to `SCALAR`, `VECN`, and `MATN` types.
        classProperty.componentType,
        elementCount
      );
    } else {
      valuesData = valuesDataBytes;
    }
    if (isArray2) {
      if (arrayOffsets) {
        return parseVariableLengthArrayNumeric(
          valuesData,
          numberOfElements,
          arrayOffsets,
          valuesDataBytes.length,
          elementSize
        );
      }
      if (arrayCount) {
        return parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount);
      }
      return [];
    }
    return valuesData;
  }
  function getPropertyDataENUM(schema, classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
    const enumType = classProperty.enumType;
    if (!enumType) {
      throw new Error(
        "Incorrect data in the EXT_structural_metadata extension: classProperty.enumType is not set for type ENUM"
      );
    }
    const enumEntry = schema.enums?.[enumType];
    if (!enumEntry) {
      throw new Error(
        `Incorrect data in the EXT_structural_metadata extension: schema.enums does't contain ${enumType}`
      );
    }
    const enumValueType = enumEntry.valueType || "UINT16";
    const elementSize = getArrayElementByteSize(classProperty.type, enumValueType);
    const elementCount = valuesDataBytes.byteLength / elementSize;
    let valuesData = convertRawBufferToMetadataArray(
      valuesDataBytes,
      classProperty.type,
      enumValueType,
      elementCount
    );
    if (!valuesData) {
      valuesData = valuesDataBytes;
    }
    if (classProperty.array) {
      if (arrayOffsets) {
        return parseVariableLengthArrayENUM({
          valuesData,
          numberOfElements,
          arrayOffsets,
          valuesDataBytesLength: valuesDataBytes.length,
          elementSize,
          enumEntry
        });
      }
      const arrayCount = classProperty.count;
      if (arrayCount) {
        return parseFixedLengthArrayENUM(valuesData, numberOfElements, arrayCount, enumEntry);
      }
      return [];
    }
    return getEnumsArray(valuesData, 0, numberOfElements, enumEntry);
  }
  function parseVariableLengthArrayENUM(params) {
    const {
      valuesData,
      numberOfElements,
      arrayOffsets,
      valuesDataBytesLength,
      elementSize,
      enumEntry
    } = params;
    const attributeValueArray = [];
    for (let index = 0; index < numberOfElements; index++) {
      const arrayOffset = arrayOffsets[index];
      const arrayByteSize = arrayOffsets[index + 1] - arrayOffsets[index];
      if (arrayByteSize + arrayOffset > valuesDataBytesLength) {
        break;
      }
      const typedArrayOffset = arrayOffset / elementSize;
      const elementCount = arrayByteSize / elementSize;
      const array = getEnumsArray(valuesData, typedArrayOffset, elementCount, enumEntry);
      attributeValueArray.push(array);
    }
    return attributeValueArray;
  }
  function parseFixedLengthArrayENUM(valuesData, numberOfElements, arrayCount, enumEntry) {
    const attributeValueArray = [];
    for (let index = 0; index < numberOfElements; index++) {
      const elementOffset = arrayCount * index;
      const array = getEnumsArray(valuesData, elementOffset, arrayCount, enumEntry);
      attributeValueArray.push(array);
    }
    return attributeValueArray;
  }
  function getEnumsArray(valuesData, offset, count, enumEntry) {
    const array = [];
    for (let i = 0; i < count; i++) {
      if (valuesData instanceof BigInt64Array || valuesData instanceof BigUint64Array) {
        array.push("");
      } else {
        const value = valuesData[offset + i];
        const enumObject = getEnumByValue(enumEntry, value);
        if (enumObject) {
          array.push(enumObject.name);
        } else {
          array.push("");
        }
      }
    }
    return array;
  }
  function getEnumByValue(enumEntry, value) {
    for (const enumValue of enumEntry.values) {
      if (enumValue.value === value) {
        return enumValue;
      }
    }
    return null;
  }
  var SCHEMA_CLASS_ID_DEFAULT = "schemaClassId";
  function encodeExtStructuralMetadata(scenegraph, options) {
    const extension = scenegraph.getExtension(
      EXT_STRUCTURAL_METADATA_NAME
    );
    if (!extension) {
      return;
    }
    if (extension.propertyTables) {
      for (const table of extension.propertyTables) {
        const classId = table.class;
        const schemaClass = extension.schema?.classes?.[classId];
        if (table.properties && schemaClass) {
          encodeProperties(table, schemaClass, scenegraph);
        }
      }
    }
  }
  function encodeProperties(table, schemaClass, scenegraph) {
    for (const propertyName in table.properties) {
      const data = table.properties[propertyName].data;
      if (data) {
        const classProperty = schemaClass.properties[propertyName];
        if (classProperty) {
          const tableProperty = createPropertyTableProperty(
            data,
            classProperty,
            scenegraph
          );
          table.properties[propertyName] = tableProperty;
        }
      }
    }
  }
  function createExtStructuralMetadata(scenegraph, propertyAttributes, classId = SCHEMA_CLASS_ID_DEFAULT) {
    let extension = scenegraph.getExtension(
      EXT_STRUCTURAL_METADATA_NAME
    );
    if (!extension) {
      extension = scenegraph.addExtension(EXT_STRUCTURAL_METADATA_NAME);
    }
    extension.schema = createSchema(propertyAttributes, classId, extension.schema);
    const table = createPropertyTable(propertyAttributes, classId, extension.schema);
    if (!extension.propertyTables) {
      extension.propertyTables = [];
    }
    return extension.propertyTables.push(table) - 1;
  }
  function createSchema(propertyAttributes, classId, schemaToUpdate) {
    const schema = schemaToUpdate ?? {
      id: "schema_id"
    };
    const schemaClass = {
      properties: {}
    };
    for (const attribute of propertyAttributes) {
      const classProperty = {
        type: attribute.elementType,
        componentType: attribute.componentType
      };
      schemaClass.properties[attribute.name] = classProperty;
    }
    schema.classes = {};
    schema.classes[classId] = schemaClass;
    return schema;
  }
  function createPropertyTable(propertyAttributes, classId, schema) {
    const table = {
      class: classId,
      count: 0
    };
    let count = 0;
    const schemaClass = schema.classes?.[classId];
    for (const attribute of propertyAttributes) {
      if (count === 0) {
        count = attribute.values.length;
      }
      if (count !== attribute.values.length && attribute.values.length) {
        throw new Error("Illegal values in attributes");
      }
      const classProperty = schemaClass?.properties[attribute.name];
      if (classProperty) {
        if (!table.properties) {
          table.properties = {};
        }
        table.properties[attribute.name] = { values: 0, data: attribute.values };
      }
    }
    table.count = count;
    return table;
  }
  function createPropertyTableProperty(values, classProperty, scenegraph) {
    const prop = { values: 0 };
    if (classProperty.type === "STRING") {
      const { stringData, stringOffsets } = createPropertyDataString(values);
      prop.stringOffsets = createBufferView(stringOffsets, scenegraph);
      prop.values = createBufferView(stringData, scenegraph);
    } else if (classProperty.type === "SCALAR" && classProperty.componentType) {
      const data = createPropertyDataScalar(values, classProperty.componentType);
      prop.values = createBufferView(data, scenegraph);
    }
    return prop;
  }
  var COMPONENT_TYPE_TO_ARRAY_CONSTRUCTOR = {
    INT8: Int8Array,
    UINT8: Uint8Array,
    INT16: Int16Array,
    UINT16: Uint16Array,
    INT32: Int32Array,
    UINT32: Uint32Array,
    INT64: Int32Array,
    UINT64: Uint32Array,
    FLOAT32: Float32Array,
    FLOAT64: Float64Array
  };
  function createPropertyDataScalar(array, componentType) {
    const numberArray = [];
    for (const value of array) {
      numberArray.push(Number(value));
    }
    const Construct = COMPONENT_TYPE_TO_ARRAY_CONSTRUCTOR[componentType];
    if (!Construct) {
      throw new Error("Illegal component type");
    }
    return new Construct(numberArray);
  }
  function createPropertyDataString(strings) {
    const utf8Encode = new TextEncoder();
    const arr = [];
    let len2 = 0;
    for (const str3 of strings) {
      const uint8Array = utf8Encode.encode(str3);
      len2 += uint8Array.length;
      arr.push(uint8Array);
    }
    const strArray = new Uint8Array(len2);
    const strOffsets = [];
    let offset = 0;
    for (const str3 of arr) {
      strArray.set(str3, offset);
      strOffsets.push(offset);
      offset += str3.length;
    }
    strOffsets.push(offset);
    const stringOffsetsTypedArray = new Uint32Array(strOffsets);
    return { stringData: strArray, stringOffsets: stringOffsetsTypedArray };
  }
  function createBufferView(typedArray, scenegraph) {
    scenegraph.gltf.buffers.push({
      arrayBuffer: ensureArrayBuffer(typedArray.buffer),
      byteOffset: typedArray.byteOffset,
      byteLength: typedArray.byteLength
    });
    return scenegraph.addBufferView(typedArray);
  }

  // ../gltf/src/lib/extensions/deprecated/EXT_feature_metadata.ts
  var EXT_feature_metadata_exports = {};
  __export(EXT_feature_metadata_exports, {
    decode: () => decode3,
    name: () => name3
  });
  var EXT_FEATURE_METADATA_NAME = "EXT_feature_metadata";
  var name3 = EXT_FEATURE_METADATA_NAME;
  async function decode3(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    decodeExtFeatureMetadata(scenegraph, options);
  }
  function decodeExtFeatureMetadata(scenegraph, options) {
    if (!options.gltf?.loadBuffers) {
      return;
    }
    const extension = scenegraph.getExtension(EXT_FEATURE_METADATA_NAME);
    if (!extension) {
      return;
    }
    if (options.gltf?.loadImages) {
      decodePropertyTextures2(scenegraph, extension);
    }
    decodePropertyTables2(scenegraph, extension);
  }
  function decodePropertyTextures2(scenegraph, extension) {
    const schema = extension.schema;
    if (!schema) {
      return;
    }
    const schemaClasses = schema.classes;
    const { featureTextures } = extension;
    if (schemaClasses && featureTextures) {
      for (const schemaName in schemaClasses) {
        const schemaClass = schemaClasses[schemaName];
        const featureTexture = findFeatureTextureByClass(featureTextures, schemaName);
        if (featureTexture) {
          handleFeatureTextureProperties(scenegraph, featureTexture, schemaClass);
        }
      }
    }
  }
  function decodePropertyTables2(scenegraph, extension) {
    const schema = extension.schema;
    if (!schema) {
      return;
    }
    const schemaClasses = schema.classes;
    const propertyTables = extension.featureTables;
    if (schemaClasses && propertyTables) {
      for (const schemaName in schemaClasses) {
        const propertyTable = findPropertyTableByClass2(propertyTables, schemaName);
        if (propertyTable) {
          processPropertyTable2(scenegraph, schema, propertyTable);
        }
      }
    }
  }
  function findPropertyTableByClass2(propertyTables, schemaClassName) {
    for (const propertyTableName in propertyTables) {
      const propertyTable = propertyTables[propertyTableName];
      if (propertyTable.class === schemaClassName) {
        return propertyTable;
      }
    }
    return null;
  }
  function findFeatureTextureByClass(featureTextures, schemaClassName) {
    for (const featureTexturesName in featureTextures) {
      const featureTable = featureTextures[featureTexturesName];
      if (featureTable.class === schemaClassName) {
        return featureTable;
      }
    }
    return null;
  }
  function processPropertyTable2(scenegraph, schema, propertyTable) {
    if (!propertyTable.class) {
      return;
    }
    const schemaClass = schema.classes?.[propertyTable.class];
    if (!schemaClass) {
      throw new Error(
        `Incorrect data in the EXT_structural_metadata extension: no schema class with name ${propertyTable.class}`
      );
    }
    const numberOfElements = propertyTable.count;
    for (const propertyName in schemaClass.properties) {
      const classProperty = schemaClass.properties[propertyName];
      const propertyTableProperty = propertyTable.properties?.[propertyName];
      if (propertyTableProperty) {
        const data = getPropertyDataFromBinarySource2(
          scenegraph,
          schema,
          classProperty,
          numberOfElements,
          propertyTableProperty
        );
        propertyTableProperty.data = data;
      }
    }
  }
  function handleFeatureTextureProperties(scenegraph, featureTexture, schemaClass) {
    const attributeName = featureTexture.class;
    for (const propertyName in schemaClass.properties) {
      const featureTextureProperty = featureTexture?.properties?.[propertyName];
      if (featureTextureProperty) {
        const data = getPropertyDataFromTexture(scenegraph, featureTextureProperty, attributeName);
        featureTextureProperty.data = data;
      }
    }
  }
  function getPropertyDataFromBinarySource2(scenegraph, schema, classProperty, numberOfFeatures, featureTableProperty) {
    let data = [];
    const bufferView = featureTableProperty.bufferView;
    const dataArray = scenegraph.getTypedArrayForBufferView(bufferView);
    const arrayOffsets = getArrayOffsetsForProperty2(
      scenegraph,
      classProperty,
      featureTableProperty,
      numberOfFeatures
    );
    const stringOffsets = getStringOffsetsForProperty2(
      scenegraph,
      classProperty,
      featureTableProperty,
      numberOfFeatures
    );
    if (classProperty.type === "STRING" || classProperty.componentType === "STRING") {
      data = getPropertyDataString(numberOfFeatures, dataArray, arrayOffsets, stringOffsets);
    } else if (isNumericProperty(classProperty)) {
      data = getPropertyDataNumeric2(classProperty, numberOfFeatures, dataArray, arrayOffsets);
    }
    return data;
  }
  function getArrayOffsetsForProperty2(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
    if (classProperty.type === "ARRAY" && // `componentCount` is a number of fixed-length array elements.
    // If `componentCount` is NOT defined, it's a VARIABLE-length array
    typeof classProperty.componentCount === "undefined" && // `arrayOffsetBufferView` is an index of the buffer view containing offsets for variable-length arrays.
    typeof propertyTableProperty.arrayOffsetBufferView !== "undefined") {
      return getOffsetsForProperty(
        scenegraph,
        propertyTableProperty.arrayOffsetBufferView,
        propertyTableProperty.offsetType || "UINT32",
        // offsetType is used both for stringOffsetBufferView and arrayOffsetBufferView
        numberOfElements
      );
    }
    return null;
  }
  function getStringOffsetsForProperty2(scenegraph, classProperty, propertyTableProperty, numberOfElements) {
    if (typeof propertyTableProperty.stringOffsetBufferView !== "undefined") {
      return getOffsetsForProperty(
        scenegraph,
        propertyTableProperty.stringOffsetBufferView,
        propertyTableProperty.offsetType || "UINT32",
        // offsetType is used both for stringOffsetBufferView and arrayOffsetBufferView
        numberOfElements
      );
    }
    return null;
  }
  function isNumericProperty(schemaProperty) {
    const types = [
      "UINT8",
      "INT16",
      "UINT16",
      "INT32",
      "UINT32",
      "INT64",
      "UINT64",
      "FLOAT32",
      "FLOAT64"
    ];
    return types.includes(schemaProperty.type) || typeof schemaProperty.componentType !== "undefined" && types.includes(schemaProperty.componentType);
  }
  function getPropertyDataNumeric2(classProperty, numberOfElements, valuesDataBytes, arrayOffsets) {
    const isArray2 = classProperty.type === "ARRAY";
    const arrayCount = classProperty.componentCount;
    const attributeType = "SCALAR";
    const componentType = classProperty.componentType || classProperty.type;
    const elementSize = getArrayElementByteSize(attributeType, componentType);
    const elementCount = valuesDataBytes.byteLength / elementSize;
    const valuesData = convertRawBufferToMetadataArray(
      valuesDataBytes,
      attributeType,
      componentType,
      elementCount
    );
    if (isArray2) {
      if (arrayOffsets) {
        return parseVariableLengthArrayNumeric(
          valuesData,
          numberOfElements,
          arrayOffsets,
          valuesDataBytes.length,
          elementSize
        );
      }
      if (arrayCount) {
        return parseFixedLengthArrayNumeric(valuesData, numberOfElements, arrayCount);
      }
      return [];
    }
    return valuesData;
  }
  function getPropertyDataFromTexture(scenegraph, featureTextureProperty, attributeName) {
    const json = scenegraph.gltf.json;
    if (!json.meshes) {
      return [];
    }
    const featureTextureTable = [];
    for (const mesh of json.meshes) {
      for (const primitive of mesh.primitives) {
        processPrimitiveTextures(
          scenegraph,
          attributeName,
          featureTextureProperty,
          featureTextureTable,
          primitive
        );
      }
    }
    return featureTextureTable;
  }
  function processPrimitiveTextures(scenegraph, attributeName, featureTextureProperty, featureTextureTable, primitive) {
    const textureInfoTopLevel = {
      channels: featureTextureProperty.channels,
      ...featureTextureProperty.texture
    };
    const propertyData = getPrimitiveTextureData(
      scenegraph,
      textureInfoTopLevel,
      primitive
    );
    if (!propertyData) {
      return;
    }
    primitivePropertyDataToAttributes(
      scenegraph,
      attributeName,
      propertyData,
      featureTextureTable,
      primitive
    );
  }

  // ../gltf/src/lib/utils/version.ts
  var VERSION6 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";

  // ../textures/src/lib/utils/version.ts
  var VERSION7 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";

  // ../textures/src/lib/parsers/basis-module-loader.ts
  var BASIS_EXTERNAL_LIBRARIES = {
    /** Basis transcoder, javascript wrapper part */
    TRANSCODER: "basis_transcoder.js",
    /** Basis transcoder, compiled web assembly part */
    TRANSCODER_WASM: "basis_transcoder.wasm",
    /** Basis encoder, javascript wrapper part */
    ENCODER: "basis_encoder.js",
    /** Basis encoder, compiled web assembly part */
    ENCODER_WASM: "basis_encoder.wasm"
  };
  var loadBasisTranscoderPromise;
  async function loadBasisTranscoderModule(options) {
    registerJSModules(options.modules);
    const basis = getJSModuleOrNull("basis");
    if (basis) {
      return basis;
    }
    loadBasisTranscoderPromise ||= loadBasisTranscoder(options);
    return await loadBasisTranscoderPromise;
  }
  async function loadBasisTranscoder(options) {
    let BASIS = null;
    let wasmBinary = null;
    [BASIS, wasmBinary] = await Promise.all([
      await loadLibrary(BASIS_EXTERNAL_LIBRARIES.TRANSCODER, "textures", options),
      await loadLibrary(BASIS_EXTERNAL_LIBRARIES.TRANSCODER_WASM, "textures", options)
    ]);
    BASIS = BASIS || globalThis.BASIS;
    return await initializeBasisTranscoderModule(BASIS, wasmBinary);
  }
  function initializeBasisTranscoderModule(BasisModule, wasmBinary) {
    const options = {};
    if (wasmBinary) {
      options.wasmBinary = wasmBinary;
    }
    return initializeWasmModule(
      () => BasisModule(options),
      (module) => {
        const { BasisFile, initializeBasis } = module;
        initializeBasis();
        return { BasisFile };
      }
    );
  }
  var loadBasisEncoderPromise;
  async function loadBasisEncoderModule(options) {
    const modules = options.modules || {};
    if (modules.basisEncoder) {
      return modules.basisEncoder;
    }
    loadBasisEncoderPromise = loadBasisEncoderPromise || loadBasisEncoder(options);
    return await loadBasisEncoderPromise;
  }
  async function loadBasisEncoder(options) {
    let BASIS_ENCODER = null;
    let wasmBinary = null;
    [BASIS_ENCODER, wasmBinary] = await Promise.all([
      await loadLibrary(BASIS_EXTERNAL_LIBRARIES.ENCODER, "textures", options),
      await loadLibrary(BASIS_EXTERNAL_LIBRARIES.ENCODER_WASM, "textures", options)
    ]);
    BASIS_ENCODER = BASIS_ENCODER || globalThis.BASIS;
    return await initializeBasisEncoderModule(BASIS_ENCODER, wasmBinary);
  }
  function initializeBasisEncoderModule(BasisEncoderModule, wasmBinary) {
    const options = {};
    if (wasmBinary) {
      options.wasmBinary = wasmBinary;
    }
    return initializeWasmModule(
      () => BasisEncoderModule(options),
      (module) => {
        const { BasisFile, KTX2File, BasisEncoder, initializeBasis } = module;
        initializeBasis();
        return { BasisFile, KTX2File, BasisEncoder };
      }
    );
  }

  // ../textures/src/lib/gl-extensions.ts
  var GL_RGBA4 = 32854;
  var GL_RGBA8 = 32856;
  var GL_RGB565 = 36194;
  var GL_COMPRESSED_RGB_S3TC_DXT1_EXT = 33776;
  var GL_COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779;
  var GL_COMPRESSED_RGBA8_ETC2_EAC = 37493;
  var GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840;
  var GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842;
  var GL_COMPRESSED_RGB_ETC1_WEBGL = 36196;
  var GL_COMPRESSED_RGB_ATC_WEBGL = 35986;
  var GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 34798;
  var GL_COMPRESSED_RGBA_ASTC_4x4_KHR = 37808;
  var GL_COMPRESSED_RED_RGTC1_EXT = 36283;
  var GL_COMPRESSED_RED_GREEN_RGTC2_EXT = 36285;
  var GL_COMPRESSED_RGBA_BPTC_UNORM_EXT = 36492;

  // ../textures/src/lib/utils/detect-supported-texture-formats.ts
  var BROWSER_PREFIXES = ["", "WEBKIT_", "MOZ_"];
  var WEBGL_TEXTURE_FORMATS = {
    /* eslint-disable camelcase */
    WEBGL_compressed_texture_s3tc: [
      "bc1-rgb-unorm-webgl",
      "bc1-rgba-unorm",
      "bc2-rgba-unorm",
      "bc3-rgba-unorm"
    ],
    WEBGL_compressed_texture_s3tc_srgb: [
      "bc1-rgb-unorm-srgb-webgl",
      "bc1-rgba-unorm-srgb",
      "bc2-rgba-unorm-srgb",
      "bc3-rgba-unorm-srgb"
    ],
    EXT_texture_compression_rgtc: ["bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm"],
    EXT_texture_compression_bptc: [
      "bc6h-rgb-ufloat",
      "bc6h-rgb-float",
      "bc7-rgba-unorm",
      "bc7-rgba-unorm-srgb"
    ],
    WEBGL_compressed_texture_etc1: ["etc1-rgb-unorm-webgl"],
    WEBGL_compressed_texture_etc: [
      "etc2-rgb8unorm",
      "etc2-rgb8unorm-srgb",
      "etc2-rgb8a1unorm",
      "etc2-rgb8a1unorm-srgb",
      "etc2-rgba8unorm",
      "etc2-rgba8unorm-srgb",
      "eac-r11unorm",
      "eac-r11snorm",
      "eac-rg11unorm",
      "eac-rg11snorm"
    ],
    WEBGL_compressed_texture_pvrtc: [
      "pvrtc-rgb4unorm-webgl",
      "pvrtc-rgba4unorm-webgl",
      "pvrtc-rgb2unorm-webgl",
      "pvrtc-rgba2unorm-webgl"
    ],
    WEBGL_compressed_texture_atc: [
      "atc-rgb-unorm-webgl",
      "atc-rgba-unorm-webgl",
      "atc-rgbai-unorm-webgl"
    ],
    WEBGL_compressed_texture_astc: [
      "astc-4x4-unorm",
      "astc-4x4-unorm-srgb",
      "astc-5x4-unorm",
      "astc-5x4-unorm-srgb",
      "astc-5x5-unorm",
      "astc-5x5-unorm-srgb",
      "astc-6x5-unorm",
      "astc-6x5-unorm-srgb",
      "astc-6x6-unorm",
      "astc-6x6-unorm-srgb",
      "astc-8x5-unorm",
      "astc-8x5-unorm-srgb",
      "astc-8x6-unorm",
      "astc-8x6-unorm-srgb",
      "astc-8x8-unorm",
      "astc-8x8-unorm-srgb",
      "astc-10x5-unorm",
      "astc-10x5-unorm-srgb",
      "astc-10x6-unorm",
      "astc-10x6-unorm-srgb",
      "astc-10x8-unorm",
      "astc-10x8-unorm-srgb",
      "astc-10x10-unorm",
      "astc-10x10-unorm-srgb",
      "astc-12x10-unorm",
      "astc-12x10-unorm-srgb",
      "astc-12x12-unorm",
      "astc-12x12-unorm-srgb"
    ]
    /* eslint-enable camelcase */
  };
  var textureFormats = null;
  function detectSupportedTextureFormats(gl) {
    if (!textureFormats) {
      gl = gl || getWebGLContext() || void 0;
      textureFormats = /* @__PURE__ */ new Set();
      for (const prefix of BROWSER_PREFIXES) {
        for (const extension in WEBGL_TEXTURE_FORMATS) {
          if (gl && gl.getExtension(`${prefix}${extension}`)) {
            for (const textureFormat of WEBGL_TEXTURE_FORMATS[extension]) {
              textureFormats.add(textureFormat);
            }
          }
        }
      }
    }
    return textureFormats;
  }
  function getWebGLContext() {
    try {
      const canvas = document.createElement("canvas");
      return canvas.getContext("webgl");
    } catch (error) {
      return null;
    }
  }

  // ../textures/src/lib/parsers/parse-ktx.ts
  var KTX2_ID = [
    // '´', 'K', 'T', 'X', '2', '0', 'ª', '\r', '\n', '\x1A', '\n'
    171,
    75,
    84,
    88,
    32,
    50,
    48,
    187,
    13,
    10,
    26,
    10
  ];
  function isKTX(data) {
    const id = new Uint8Array(data);
    const notKTX = id.byteLength < KTX2_ID.length || id[0] !== KTX2_ID[0] || // '´'
    id[1] !== KTX2_ID[1] || // 'K'
    id[2] !== KTX2_ID[2] || // 'T'
    id[3] !== KTX2_ID[3] || // 'X'
    id[4] !== KTX2_ID[4] || // ' '
    id[5] !== KTX2_ID[5] || // '2'
    id[6] !== KTX2_ID[6] || // '0'
    id[7] !== KTX2_ID[7] || // 'ª'
    id[8] !== KTX2_ID[8] || // '\r'
    id[9] !== KTX2_ID[9] || // '\n'
    id[10] !== KTX2_ID[10] || // '\x1A'
    id[11] !== KTX2_ID[11];
    return !notKTX;
  }

  // ../textures/src/lib/parsers/parse-basis.ts
  var basisTranscodingLock = Promise.resolve();
  var BASIS_FORMAT_TO_OUTPUT_OPTIONS = {
    etc1: {
      basisFormat: 0,
      compressed: true,
      format: GL_COMPRESSED_RGB_ETC1_WEBGL,
      textureFormat: "etc1-rgb-unorm-webgl"
    },
    etc2: {
      basisFormat: 1,
      compressed: true,
      format: GL_COMPRESSED_RGBA8_ETC2_EAC,
      textureFormat: "etc2-rgba8unorm"
    },
    bc1: {
      basisFormat: 2,
      compressed: true,
      format: GL_COMPRESSED_RGB_S3TC_DXT1_EXT,
      textureFormat: "bc1-rgb-unorm-webgl"
    },
    bc3: {
      basisFormat: 3,
      compressed: true,
      format: GL_COMPRESSED_RGBA_S3TC_DXT5_EXT,
      textureFormat: "bc3-rgba-unorm"
    },
    bc4: {
      basisFormat: 4,
      compressed: true,
      format: GL_COMPRESSED_RED_RGTC1_EXT,
      textureFormat: "bc4-r-unorm"
    },
    bc5: {
      basisFormat: 5,
      compressed: true,
      format: GL_COMPRESSED_RED_GREEN_RGTC2_EXT,
      textureFormat: "bc5-rg-unorm"
    },
    "bc7-m6-opaque-only": {
      basisFormat: 6,
      compressed: true,
      format: GL_COMPRESSED_RGBA_BPTC_UNORM_EXT,
      textureFormat: "bc7-rgba-unorm"
    },
    // Basis v2.50 unifies BC7 output; keep the legacy option as an alias.
    "bc7-m5": {
      basisFormat: 6,
      compressed: true,
      format: GL_COMPRESSED_RGBA_BPTC_UNORM_EXT,
      textureFormat: "bc7-rgba-unorm"
    },
    "pvrtc1-4-rgb": {
      basisFormat: 8,
      compressed: true,
      format: GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
      textureFormat: "pvrtc-rgb4unorm-webgl"
    },
    "pvrtc1-4-rgba": {
      basisFormat: 9,
      compressed: true,
      format: GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
      textureFormat: "pvrtc-rgba4unorm-webgl"
    },
    "astc-4x4": {
      basisFormat: 10,
      compressed: true,
      format: GL_COMPRESSED_RGBA_ASTC_4x4_KHR,
      textureFormat: "astc-4x4-unorm"
    },
    "atc-rgb": {
      basisFormat: 11,
      compressed: true,
      format: GL_COMPRESSED_RGB_ATC_WEBGL,
      textureFormat: "atc-rgb-unorm-webgl"
    },
    "atc-rgba-interpolated-alpha": {
      basisFormat: 12,
      compressed: true,
      format: GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL,
      textureFormat: "atc-rgbai-unorm-webgl"
    },
    rgba32: {
      basisFormat: 13,
      compressed: false,
      format: GL_RGBA8,
      textureFormat: "rgba8unorm"
    },
    rgb565: {
      basisFormat: 14,
      compressed: false,
      format: GL_RGB565,
      textureFormat: "rgb565unorm-webgl"
    },
    bgr565: {
      basisFormat: 15,
      compressed: false,
      format: GL_RGB565,
      textureFormat: "rgb565unorm-webgl"
    },
    rgba4444: {
      basisFormat: 16,
      compressed: false,
      format: GL_RGBA4,
      textureFormat: "rgba4unorm-webgl"
    }
  };
  var BASIS_FORMATS = Object.freeze(
    Object.keys(BASIS_FORMAT_TO_OUTPUT_OPTIONS)
  );
  async function withBasisTranscodingLock(transcode) {
    const previousLock = basisTranscodingLock;
    let releaseLock;
    basisTranscodingLock = new Promise((resolve2) => {
      releaseLock = resolve2;
    });
    await previousLock;
    try {
      return await transcode();
    } finally {
      releaseLock();
    }
  }
  async function parseBasis(data, options = {}) {
    const loadLibraryOptions = extractLoadLibraryOptions(options);
    return await withBasisTranscodingLock(async () => {
      if (!options.basis?.containerFormat || options.basis.containerFormat === "auto") {
        if (isKTX(data)) {
          const fileConstructors = await loadBasisEncoderModule(loadLibraryOptions);
          return parseKTX2File(fileConstructors.KTX2File, data, options);
        }
        const { BasisFile } = await loadBasisTranscoderModule(loadLibraryOptions);
        return parseBasisFile(BasisFile, data, options);
      }
      switch (options.basis.module) {
        case "encoder":
          const fileConstructors = await loadBasisEncoderModule(loadLibraryOptions);
          switch (options.basis.containerFormat) {
            case "ktx2":
              return parseKTX2File(fileConstructors.KTX2File, data, options);
            case "basis":
            default:
              return parseBasisFile(fileConstructors.BasisFile, data, options);
          }
        case "transcoder":
        default:
          const { BasisFile } = await loadBasisTranscoderModule(loadLibraryOptions);
          return parseBasisFile(BasisFile, data, options);
      }
    });
  }
  function parseBasisFile(BasisFile, data, options) {
    const basisFile = new BasisFile(new Uint8Array(data));
    try {
      if (!basisFile.startTranscoding()) {
        throw new Error("Failed to start basis transcoding");
      }
      const imageCount = basisFile.getNumImages();
      const images = [];
      for (let imageIndex = 0; imageIndex < imageCount; imageIndex++) {
        const levelsCount = basisFile.getNumLevels(imageIndex);
        const levels = [];
        for (let levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
          levels.push(transcodeImage(basisFile, imageIndex, levelIndex, options));
        }
        images.push(levels);
      }
      return images;
    } finally {
      basisFile.close();
      basisFile.delete();
    }
  }
  function transcodeImage(basisFile, imageIndex, levelIndex, options) {
    const width = basisFile.getImageWidth(imageIndex, levelIndex);
    const height = basisFile.getImageHeight(imageIndex, levelIndex);
    const hasAlpha = basisFile.getHasAlpha(
      /* imageIndex, levelIndex */
    );
    const { compressed, format, basisFormat, textureFormat } = getBasisOptions(options, hasAlpha);
    const decodedSize = basisFile.getImageTranscodedSizeInBytes(imageIndex, levelIndex, basisFormat);
    const decodedData = new Uint8Array(decodedSize);
    if (!basisFile.transcodeImage(decodedData, imageIndex, levelIndex, basisFormat, 0, 0)) {
      throw new Error("failed to start Basis transcoding");
    }
    return {
      // standard loaders.gl image category payload
      shape: "texture-level",
      width,
      height,
      data: decodedData,
      compressed,
      ...format !== void 0 ? { format } : {},
      ...textureFormat !== void 0 ? { textureFormat } : {},
      // Additional fields
      // Add levelSize field.
      hasAlpha
    };
  }
  function parseKTX2File(KTX2File, data, options) {
    const ktx2File = new KTX2File(new Uint8Array(data));
    try {
      if (!ktx2File.startTranscoding()) {
        throw new Error("failed to start KTX2 transcoding");
      }
      const levelsCount = ktx2File.getLevels();
      const levels = [];
      for (let levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
        levels.push(transcodeKTX2Image(ktx2File, levelIndex, options));
      }
      return [levels];
    } finally {
      ktx2File.close();
      ktx2File.delete();
    }
  }
  function transcodeKTX2Image(ktx2File, levelIndex, options) {
    const { alphaFlag, height, width } = ktx2File.getImageLevelInfo(levelIndex, 0, 0);
    const { compressed, format, basisFormat, textureFormat } = getBasisOptions(options, alphaFlag);
    const decodedSize = ktx2File.getImageTranscodedSizeInBytes(
      levelIndex,
      0,
      0,
      basisFormat
    );
    const decodedData = new Uint8Array(decodedSize);
    if (!ktx2File.transcodeImage(
      decodedData,
      levelIndex,
      0,
      0,
      basisFormat,
      0,
      -1,
      -1
      /* channel1 */
    )) {
      throw new Error("Failed to transcode KTX2 image");
    }
    return {
      // standard loaders.gl image category payload
      shape: "texture-level",
      width,
      height,
      data: decodedData,
      compressed,
      ...format !== void 0 ? { format } : {},
      ...textureFormat !== void 0 ? { textureFormat } : {},
      // Additional fields
      levelSize: decodedSize,
      hasAlpha: alphaFlag
    };
  }
  function getBasisOptions(options, hasAlpha) {
    let format = options.basis?.format || "auto";
    if (format === "auto") {
      format = options.basis?.supportedTextureFormats ? selectSupportedBasisFormat(options.basis.supportedTextureFormats) : selectSupportedBasisFormat();
    }
    if (typeof format === "object") {
      format = hasAlpha ? format.alpha : format.noAlpha;
    }
    const normalizedFormat = format.toLowerCase();
    const basisOutputOptions = BASIS_FORMAT_TO_OUTPUT_OPTIONS[normalizedFormat];
    if (!basisOutputOptions) {
      throw new Error(`Unknown Basis format ${format}`);
    }
    return basisOutputOptions;
  }
  function selectSupportedBasisFormat(supportedTextureFormats = detectSupportedTextureFormats()) {
    const textureFormats2 = new Set(supportedTextureFormats);
    if (hasSupportedTextureFormat(textureFormats2, ["astc-4x4-unorm", "astc-4x4-unorm-srgb"])) {
      return "astc-4x4";
    } else if (hasSupportedTextureFormat(textureFormats2, ["bc7-rgba-unorm", "bc7-rgba-unorm-srgb"])) {
      return {
        alpha: "bc7-m5",
        noAlpha: "bc7-m6-opaque-only"
      };
    } else if (hasSupportedTextureFormat(textureFormats2, [
      "bc1-rgb-unorm-webgl",
      "bc1-rgb-unorm-srgb-webgl",
      "bc1-rgba-unorm",
      "bc1-rgba-unorm-srgb",
      "bc2-rgba-unorm",
      "bc2-rgba-unorm-srgb",
      "bc3-rgba-unorm",
      "bc3-rgba-unorm-srgb"
    ])) {
      return {
        alpha: "bc3",
        noAlpha: "bc1"
      };
    } else if (hasSupportedTextureFormat(textureFormats2, [
      "pvrtc-rgb4unorm-webgl",
      "pvrtc-rgba4unorm-webgl",
      "pvrtc-rgb2unorm-webgl",
      "pvrtc-rgba2unorm-webgl"
    ])) {
      return {
        alpha: "pvrtc1-4-rgba",
        noAlpha: "pvrtc1-4-rgb"
      };
    } else if (hasSupportedTextureFormat(textureFormats2, [
      "etc2-rgb8unorm",
      "etc2-rgb8unorm-srgb",
      "etc2-rgb8a1unorm",
      "etc2-rgb8a1unorm-srgb",
      "etc2-rgba8unorm",
      "etc2-rgba8unorm-srgb",
      "eac-r11unorm",
      "eac-r11snorm",
      "eac-rg11unorm",
      "eac-rg11snorm"
    ])) {
      return "etc2";
    } else if (textureFormats2.has("etc1-rgb-unorm-webgl")) {
      return "etc1";
    } else if (hasSupportedTextureFormat(textureFormats2, [
      "atc-rgb-unorm-webgl",
      "atc-rgba-unorm-webgl",
      "atc-rgbai-unorm-webgl"
    ])) {
      return {
        alpha: "atc-rgba-interpolated-alpha",
        noAlpha: "atc-rgb"
      };
    }
    return "rgb565";
  }
  function hasSupportedTextureFormat(supportedTextureFormats, candidateTextureFormats) {
    return candidateTextureFormats.some(
      (textureFormat) => supportedTextureFormats.has(textureFormat)
    );
  }

  // ../textures/src/basis-loader.ts
  var BasisWorkerLoader = {
    dataType: null,
    batchType: null,
    name: "Basis",
    id: "basis",
    module: "textures",
    version: VERSION7,
    worker: true,
    extensions: ["basis", "ktx2"],
    mimeTypes: ["application/octet-stream", "image/ktx2"],
    tests: ["sB"],
    binary: true,
    options: {
      basis: {
        format: "auto",
        containerFormat: "auto",
        module: "transcoder"
      }
    }
  };
  var BasisLoader = {
    ...BasisWorkerLoader,
    parse: parseBasis
  };

  // ../gltf/src/lib/parsers/parse-glb.ts
  var LITTLE_ENDIAN2 = true;
  var MAGIC_glTF = 1735152710;
  var GLB_FILE_HEADER_SIZE = 12;
  var GLB_CHUNK_HEADER_SIZE = 8;
  var GLB_CHUNK_TYPE_JSON = 1313821514;
  var GLB_CHUNK_TYPE_BIN = 5130562;
  var GLB_V1_CONTENT_FORMAT_JSON = 0;
  var GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED = 0;
  var GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED = 1;
  function getMagicString3(dataView, byteOffset = 0) {
    return `${String.fromCharCode(dataView.getUint8(byteOffset + 0))}${String.fromCharCode(dataView.getUint8(byteOffset + 1))}${String.fromCharCode(dataView.getUint8(byteOffset + 2))}${String.fromCharCode(dataView.getUint8(byteOffset + 3))}`;
  }
  function isGLB(arrayBuffer, byteOffset = 0, options = {}) {
    const dataView = new DataView(arrayBuffer);
    const { magic = MAGIC_glTF } = options;
    const magic1 = dataView.getUint32(byteOffset, false);
    return magic1 === magic || magic1 === MAGIC_glTF;
  }
  function parseGLBSync(glb, arrayBuffer, byteOffset = 0, options = {}) {
    const dataView = new DataView(arrayBuffer);
    const type = getMagicString3(dataView, byteOffset + 0);
    const version = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN2);
    const byteLength = dataView.getUint32(byteOffset + 8, LITTLE_ENDIAN2);
    Object.assign(glb, {
      // Put less important stuff in a header, to avoid clutter
      header: {
        byteOffset,
        // Byte offset into the initial arrayBuffer
        byteLength,
        hasBinChunk: false
      },
      type,
      version,
      json: {},
      binChunks: []
    });
    byteOffset += GLB_FILE_HEADER_SIZE;
    switch (glb.version) {
      case 1:
        return parseGLBV1(glb, dataView, byteOffset);
      case 2:
        return parseGLBV2(glb, dataView, byteOffset, options = {});
      default:
        throw new Error(`Invalid GLB version ${glb.version}. Only supports version 1 and 2.`);
    }
  }
  function parseGLBV1(glb, dataView, byteOffset) {
    assert2(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
    const contentLength = dataView.getUint32(byteOffset + 0, LITTLE_ENDIAN2);
    const contentFormat = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN2);
    byteOffset += GLB_CHUNK_HEADER_SIZE;
    assert2(contentFormat === GLB_V1_CONTENT_FORMAT_JSON);
    parseJSONChunk(glb, dataView, byteOffset, contentLength);
    byteOffset += contentLength;
    byteOffset += parseBINChunk(glb, dataView, byteOffset, glb.header.byteLength);
    return byteOffset;
  }
  function parseGLBV2(glb, dataView, byteOffset, options) {
    assert2(glb.header.byteLength > GLB_FILE_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
    parseGLBChunksSync(glb, dataView, byteOffset, options);
    return byteOffset + glb.header.byteLength;
  }
  function parseGLBChunksSync(glb, dataView, byteOffset, options) {
    while (byteOffset + 8 <= glb.header.byteLength) {
      const chunkLength = dataView.getUint32(byteOffset + 0, LITTLE_ENDIAN2);
      const chunkFormat = dataView.getUint32(byteOffset + 4, LITTLE_ENDIAN2);
      byteOffset += GLB_CHUNK_HEADER_SIZE;
      switch (chunkFormat) {
        case GLB_CHUNK_TYPE_JSON:
          parseJSONChunk(glb, dataView, byteOffset, chunkLength);
          break;
        case GLB_CHUNK_TYPE_BIN:
          parseBINChunk(glb, dataView, byteOffset, chunkLength);
          break;
        case GLB_CHUNK_TYPE_JSON_XVIZ_DEPRECATED:
          if (!options.strict) {
            parseJSONChunk(glb, dataView, byteOffset, chunkLength);
          }
          break;
        case GLB_CHUNK_TYPE_BIX_XVIZ_DEPRECATED:
          if (!options.strict) {
            parseBINChunk(glb, dataView, byteOffset, chunkLength);
          }
          break;
        default:
          break;
      }
      byteOffset += padToNBytes(chunkLength, 4);
    }
    return byteOffset;
  }
  function parseJSONChunk(glb, dataView, byteOffset, chunkLength) {
    const jsonChunk = new Uint8Array(dataView.buffer, byteOffset, chunkLength);
    const textDecoder = new TextDecoder("utf8");
    const jsonText = textDecoder.decode(jsonChunk);
    glb.json = JSON.parse(jsonText);
    return padToNBytes(chunkLength, 4);
  }
  function parseBINChunk(glb, dataView, byteOffset, chunkLength) {
    glb.header.hasBinChunk = true;
    glb.binChunks.push({
      byteOffset,
      byteLength: chunkLength,
      arrayBuffer: dataView.buffer
      // TODO - copy, or create typed array view?
    });
    return padToNBytes(chunkLength, 4);
  }

  // ../gltf/src/lib/gltf-utils/resolve-url.ts
  function resolveUrl(url, options, context) {
    const absolute = url.startsWith("data:") || url.startsWith("http:") || url.startsWith("https:");
    if (absolute) {
      return url;
    }
    const baseUrl = context?.baseUrl || getResolveBaseUrl(options?.core?.baseUrl);
    if (!baseUrl) {
      throw new Error(`'baseUrl' must be provided to resolve relative url ${url}`);
    }
    return baseUrl.endsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }
  function getResolveBaseUrl(baseUrl) {
    if (!baseUrl) {
      return void 0;
    }
    if (baseUrl.endsWith("/")) {
      return baseUrl;
    }
    const slashIndex = baseUrl.lastIndexOf("/");
    return slashIndex >= 0 ? baseUrl.slice(0, slashIndex + 1) : "";
  }

  // ../gltf/src/lib/extensions/EXT_meshopt_compression.ts
  var EXT_meshopt_compression_exports = {};
  __export(EXT_meshopt_compression_exports, {
    decode: () => decode4,
    name: () => name4
  });

  // ../../node_modules/meshoptimizer/meshopt_decoder.mjs
  var MeshoptDecoder = function() {
    var wasm_base = "b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuixkbeeeddddillviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WboY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbrl79IV9Rbwq1Zkdbk:kYi5ud9:du8Jjjjjbcjq9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaicefhxcj;abad9Uc;WFbGcjdadca0EhmaialfgPar9Rgoadfhsavaoadz:jjjjbgzceVhHcbhOdndninaeaO9nmeaPax9RaD6mdamaeaO9RaOamfgoae6EgAcsfglc9WGhCaAcethXaxaDfhiaOaeaoaeao6E9RhQalcl4cifcd4hLazcjdfaAfhKcbhYabaOad2fg8AhEaHh3incbh5dnawTmbaxaYcd4fRbbh5kcbh8Eazcjdfhqinaih8Fdndndndna5a8Ecet4ciGgoc9:fPdebdkaPa8F9RaA6mrazcjdfa8EaA2fa8FaAz:jjjjb8Aa8FaAfhixdkazcjdfa8EaA2fcbaAz:kjjjb8Aa8FhixekaPa8F9RaL6mva8FaLfhidnaCTmbaPai9RcK6mbaocdtc:q:G:cjbfcj:G:cjbawEhaczhrcbhlinargoc9Wfghaqfhrdndndndndndnaaa8Fahco4fRbbalcoG4ciGcdtfydbPDbedvivvvlvkar9cb83bwar9cb83bbxlkarcbaiRbdai8Xbb9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbaqaofgrcGfcbaicdfa8J9c8N1:NfghRbbag9cjjjjjw:dg8J9qE86bbarcVfcbaha8J9c8M1:NfghRbbag9cjjjjjl:dg8J9qE86bbarc7fcbaha8J9c8L1:NfghRbbag9cjjjjjd:dg8J9qE86bbarctfcbaha8J9c8K1:NfghRbbag9cjjjjje:dg8J9qE86bbarc91fcbaha8J9c8J1:NfghRbbag9cjjjj;ab:dg8J9qE86bbarc4fcbaha8J9cg1:NfghRbbag9cjjjja:dg8J9qE86bbarc93fcbaha8J9ch1:NfghRbbag9cjjjjz:dgg9qE86bbarc94fcbahag9ca1:NfghRbbai8Xbe9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbarc95fcbaha8J9c8N1:NfgiRbbag9cjjjjjw:dg8J9qE86bbarc96fcbaia8J9c8M1:NfgiRbbag9cjjjjjl:dg8J9qE86bbarc97fcbaia8J9c8L1:NfgiRbbag9cjjjjjd:dg8J9qE86bbarc98fcbaia8J9c8K1:NfgiRbbag9cjjjjje:dg8J9qE86bbarc99fcbaia8J9c8J1:NfgiRbbag9cjjjj;ab:dg8J9qE86bbarc9:fcbaia8J9cg1:NfgiRbbag9cjjjja:dg8J9qE86bbarcufcbaia8J9ch1:NfgiRbbag9cjjjjz:dgg9qE86bbaiag9ca1:NfhixikaraiRblaiRbbghco4g8Ka8KciSg8KE86bbaqaofgrcGfaiclfa8Kfg8KRbbahcl4ciGg8La8LciSg8LE86bbarcVfa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc7fa8Ka8Lfg8KRbbahciGghahciSghE86bbarctfa8Kahfg8KRbbaiRbeghco4g8La8LciSg8LE86bbarc91fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc4fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc93fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc94fa8Kahfg8KRbbaiRbdghco4g8La8LciSg8LE86bbarc95fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc96fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc97fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc98fa8KahfghRbbaiRbigico4g8Ka8KciSg8KE86bbarc99faha8KfghRbbaicl4ciGg8Ka8KciSg8KE86bbarc9:faha8KfghRbbaicd4ciGg8Ka8KciSg8KE86bbarcufaha8KfgrRbbaiciGgiaiciSgiE86bbaraifhixdkaraiRbwaiRbbghcl4g8Ka8KcsSg8KE86bbaqaofgrcGfaicwfa8Kfg8KRbbahcsGghahcsSghE86bbarcVfa8KahfghRbbaiRbeg8Kcl4g8La8LcsSg8LE86bbarc7faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarctfaha8KfghRbbaiRbdg8Kcl4g8La8LcsSg8LE86bbarc91faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc4faha8KfghRbbaiRbig8Kcl4g8La8LcsSg8LE86bbarc93faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc94faha8KfghRbbaiRblg8Kcl4g8La8LcsSg8LE86bbarc95faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc96faha8KfghRbbaiRbvg8Kcl4g8La8LcsSg8LE86bbarc97faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc98faha8KfghRbbaiRbog8Kcl4g8La8LcsSg8LE86bbarc99faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc9:faha8KfghRbbaiRbrgicl4g8Ka8KcsSg8KE86bbarcufaha8KfgrRbbaicsGgiaicsSgiE86bbaraifhixekarai8Pbw83bwarai8Pbb83bbaiczfhikdnaoaC9pmbalcdfhlaoczfhraPai9RcL0mekkaoaC6moaimexokaCmva8FTmvkaqaAfhqa8Ecefg8Ecl9hmbkdndndndnawTmbasaYcd4fRbbgociGPlbedrbkaATmdazaYfh8Fazcjdfhhcbh8EaEhaina8FRbbhraahocbhlinaoahalfRbbgqce4cbaqceG9R7arfgr86bbaoadfhoaAalcefgl9hmbkaacefhaa8Fcefh8FahaAfhha8Ecefg8Ecl9hmbxikkaATmeazaYfhaazcjdfhhcbhoceh8EaKh8FinaEaofhlaa8Vbbhrcbhoinala8FaofRbbcwtahaofRbbgqVc;:FiGce4cbaqceG9R7arfgr87bbaladfhlaQaocefgofmbka8FaXfh8FcdhoaacdfhaahaXfhha8EceGhlcbh8EalmbxdkkaATmbaocl4h8EazaYfRbbhqcwhoa3hlinalRbbaotaqVhqalcefhlaocwfgoca9hmbkcbhhaEh8FaKhainazcjdfahfRbbhrcwhoaahlinalRbbaotarVhralaAfhlaocwfgoca9hmbkara8E94aq7hqcbhoa8Fhlinalaqao486bbalcefhlaocwfgoca9hmbka8Fadfh8FaacefhaahcefghaA9hmbkkaEclfhEa3clfh3aYclfgYad6mbkaza8AaAcufad2fadz:jjjjb8AaAaOfhOaihxaimbkc9:hoxdkcbc99aPax9RakSEhoxekc9:hokavcjqf8Kjjjjbaok:ysezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:kjjjb8Aav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk:4ioiue99dud99dud99dnaeTmbcbhiabhlindndnal8Uebgv:YgoJ:ji:1Salcof8UebgrciVgw:Y:vgDNJbbbZJbbb:;avcu9kEMgq:lJbbb9p9DTmbaq:Ohkxekcjjjj94hkkalclf8Uebhvalcdf8UebhxalarcefciGcetfak87ebdndnax:YgqaDNJbbbZJbbb:;axcu9kEMgm:lJbbb9p9DTmbam:Ohxxekcjjjj94hxkabaiarciGgkfcd7cetfax87ebdndnav:YgmaDNJbbbZJbbb:;avcu9kEMgP:lJbbb9p9DTmbaP:Ohvxekcjjjj94hvkalarcufciGcetfav87ebdndnawaw2:ZgPaPMaoaoN:taqaqN:tamamN:tgoJbbbbaoJbbbb9GE:raDNJbbbZMgD:lJbbb9p9DTmbaD:Ohrxekcjjjj94hrkalakcetfar87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk:Tvirud99eudndnadcl9hmbaeTmeindndnabRbbgiabcefgl8Sbbgvabcdfgo8Sbbgrf9R:YJbbuJabcifgwRbbgdce4adVgDcd4aDVgDcl4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax86bbdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao86bbdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai86bbdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad86bbabclfhbaecufgembxdkkaeTmbindndnab8Vebgiabcdfgl8Uebgvabclfgo8Uebgrf9R:YJbFu9habcofgw8Vebgdce4adVgDcd4aDVgDcl4aDVgDcw4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax87ebdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao87ebdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai87ebdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad87ebabcwfhbaecufgembkkk9teiucbcbyd:K:G:cjbgeabcifc98GfgbBd:K:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkk83dbcj:Gdk8Kbbbbdbbblbbbwbbbbbbbebbbdbbblbbbwbbbbc:K:Gdkl8W:qbb";
    var wasm_simd = "b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuixkbbebeeddddilve9Weeeviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WbwY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbDl79IV9Rbqq:59Dklbzik94evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaeai86b:q:W:cjbaecitab8Piw83i:q:G:cjbaecefgecjd9hmbkk:SBlEud97dur978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaialfgxar9RhodnadTgmmbavaoad;8qbbkaicefhPcj;abad9Uc;WFbGcjdadca0EhsdndndnadTmbaoadfhzcbhHinaeaH9nmdaxaP9RaD6miabaHad2fgOavcjdfasaeaH9RaHasfae6EgAaAcsfgoc9WGgCSEhXaPaDfhQaocl4cifcd4hLavcj;cbfaCcetfhKavcj;cbfaCci2fhYavcj;cbfaCfh8AcbhEaoc;ab6h3incbh5dnawTmbaPaEcd4fRbbh5kcbh8Eavcj;cbfh8Findndndndna5a8Ecet4ciGgoc9:fPdebdkaxaQ9RaC6mwdnaCTmbavcj;cbfa8EaC2faQaC;8qbbkaQaAfhQxdkaCTmeavcj;cbfa8EaC2fcbaC;8kbxekaxaQ9RaL6moaoclVcbawEhraQaLfhocbhidna3mbaxao9Rc;Gb6mbcbhlina8FalfhidndndndndndnaQalco4fRbbgqciGarfPDbedibledibkaipxbbbbbbbbbbbbbbbbpklbxlkaiaopbblaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLgacdp:meaapmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9oghpxiiiiiiiiiiiiiiiip8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaoclffa8JRb:q:W:cjbfhoxikaiaopbbwaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLpxssssssssssssssssp9oghpxssssssssssssssssp8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaocwffa8JRb:q:W:cjbfhoxdkaiaopbbbpklbaoczfhoxekaiaopbbdaoRbbggcitpbi:q:G:cjbagRb:q:W:cjbggpsaoRbeg8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbagaocdffa8JRb:q:W:cjbfhokdndndndndndnaqcd4ciGarfPDbedibledibkaiczfpxbbbbbbbbbbbbbbbbpklbxlkaiczfaopbblaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLgacdp:meaapmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9oghpxiiiiiiiiiiiiiiiip8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaoclffa8JRb:q:W:cjbfhoxikaiczfaopbbwaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLpxssssssssssssssssp9oghpxssssssssssssssssp8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaocwffa8JRb:q:W:cjbfhoxdkaiczfaopbbbpklbaoczfhoxekaiczfaopbbdaoRbbggcitpbi:q:G:cjbagRb:q:W:cjbggpsaoRbeg8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbagaocdffa8JRb:q:W:cjbfhokdndndndndndnaqcl4ciGarfPDbedibledibkaicafpxbbbbbbbbbbbbbbbbpklbxlkaicafaopbblaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLgacdp:meaapmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9oghpxiiiiiiiiiiiiiiiip8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaoclffa8JRb:q:W:cjbfhoxikaicafaopbbwaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLpxssssssssssssssssp9oghpxssssssssssssssssp8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbagaocwffa8JRb:q:W:cjbfhoxdkaicafaopbbbpklbaoczfhoxekaicafaopbbdaoRbbggcitpbi:q:G:cjbagRb:q:W:cjbggpsaoRbeg8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbagaocdffa8JRb:q:W:cjbfhokdndndndndndnaqco4arfPDbedibledibkaic8Wfpxbbbbbbbbbbbbbbbbpklbxlkaic8Wfaopbblaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLgacdp:meaapmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9oghpxiiiiiiiiiiiiiiiip8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsaap5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbaiaoclffaqRb:q:W:cjbfhoxikaic8Wfaopbbwaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLpxssssssssssssssssp9oghpxssssssssssssssssp8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsaap5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spklbaiaocwffaqRb:q:W:cjbfhoxdkaic8Wfaopbbbpklbaoczfhoxekaic8WfaopbbdaoRbbgicitpbi:q:G:cjbaiRb:q:W:cjbgipsaoRbegqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbaiaocdffaqRb:q:W:cjbfhokalc;abfhialcjefaC0meaihlaxao9Rc;Fb0mbkkdnaiaC9pmbaici4hlinaxao9RcK6mwa8FaifhqdndndndndndnaQaico4fRbbalcoG4ciGarfPDbedibledibkaqpxbbbbbbbbbbbbbbbbpkbbxlkaqaopbblaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLgacdp:meaapmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9oghpxiiiiiiiiiiiiiiiip8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spkbbagaoclffa8JRb:q:W:cjbfhoxikaqaopbbwaopbbbgaclp:meaapmbzeHdOiAlCvXoQrLpxssssssssssssssssp9oghpxssssssssssssssssp8Jgap5b9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbagRb:q:W:cjbggpsaap5e9cjF;8;4;W;G;ab9:9cU1:Ng8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPahaap9spkbbagaocwffa8JRb:q:W:cjbfhoxdkaqaopbbbpkbbaoczfhoxekaqaopbbdaoRbbggcitpbi:q:G:cjbagRb:q:W:cjbggpsaoRbeg8Jcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpkbbagaocdffa8JRb:q:W:cjbfhokalcdfhlaiczfgiaC6mbkkaohQaoTmoka8FaCfh8Fa8Ecefg8Ecl9hmbkdndndndnawTmbazaEcd4fRbbglciGPlbedwbkaCTmdaXaEfhlavaEfpbdbh8Kcbhoinalavcj;cbfaofpblbg8La8Aaofpblbg8MpmbzeHdOiAlCvXoQrLg8NaKaofpblbgyaYaofpblbg8PpmbzeHdOiAlCvXoQrLgIpmbezHdiOAlvCXorQLgacep9Taapxeeeeeeeeeeeeeeeeghp9op9Hp9rgaa8Kp9Ug8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp9Ug8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp9Ug8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp9Ug8Kp9Abbbaladfgla8Ka8NaIpmwDKYqk8AExm35Ps8E8Fgacep9Taaahp9op9Hp9rgap9Ug8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp9Ug8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp9Ug8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp9Ug8Kp9Abbbaladfgla8Ka8La8MpmwKDYq8AkEx3m5P8Es8Fg8Laya8PpmwKDYq8AkEx3m5P8Es8Fg8MpmbezHdiOAlvCXorQLgacep9Taaahp9op9Hp9rgap9Ug8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp9Ug8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp9Ug8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp9Ug8Kp9Abbbaladfgla8Ka8La8MpmwDKYqk8AExm35Ps8E8Fgacep9Taaahp9op9Hp9rgap9Ughp9Abbbaladfglahaaaapmlvorlvorlvorlvorp9Ughp9AbbbaladfglahaaaapmwDqkwDqkwDqkwDqkp9Ughp9AbbbaladfglahaaaapmxmPsxmPsxmPsxmPsp9Ug8Kp9AbbbaladfhlaoczfgoaC6mbxikkaCTmeaXaEfhlavaEfpbdbh8Kcbhoinalavcj;cbfaofpblbg8La8Aaofpblbg8MpmbzeHdOiAlCvXoQrLg8NaKaofpblbgyaYaofpblbg8PpmbzeHdOiAlCvXoQrLgIpmbezHdiOAlvCXorQLgacep:neaapxebebebebebebebebghp9op:bep9rgaa8Kp:oeg8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp:oeg8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp:oeg8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp:oeg8Kp9Abbbaladfgla8Ka8NaIpmwDKYqk8AExm35Ps8E8Fgacep:neaaahp9op:bep9rgap:oeg8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp:oeg8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp:oeg8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp:oeg8Kp9Abbbaladfgla8Ka8La8MpmwKDYq8AkEx3m5P8Es8Fg8Laya8PpmwKDYq8AkEx3m5P8Es8Fg8MpmbezHdiOAlvCXorQLgacep:neaaahp9op:bep9rgap:oeg8Kp9Abbbaladfgla8Kaaaapmlvorlvorlvorlvorp:oeg8Kp9Abbbaladfgla8KaaaapmwDqkwDqkwDqkwDqkp:oeg8Kp9Abbbaladfgla8KaaaapmxmPsxmPsxmPsxmPsp:oeg8Kp9Abbbaladfgla8Ka8La8MpmwDKYqk8AExm35Ps8E8Fgacep:neaaahp9op:bep9rgap:oeghp9Abbbaladfglahaaaapmlvorlvorlvorlvorp:oeghp9AbbbaladfglahaaaapmwDqkwDqkwDqkwDqkp:oeghp9AbbbaladfglahaaaapmxmPsxmPsxmPsxmPsp:oeg8Kp9AbbbaladfhlaoczfgoaC6mbxdkkaCTmbaXaEfhrcbhocbalcl4gl9Rc8FGhiavaEfpbdbhhinaravcj;cbfaofpblbg8Ka8Aaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaKaofpblbg8NaYaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLgaaip:Reaaalp:Tep9qgaahp9rghp9Abbbaradfgrahaaaapmlvorlvorlvorlvorp9rghp9AbbbaradfgrahaaaapmwDqkwDqkwDqkwDqkp9rghp9AbbbaradfgrahaaaapmxmPsxmPsxmPsxmPsp9rghp9Abbbaradfgraha8Ma8PpmwDKYqk8AExm35Ps8E8Fgaaip:Reaaalp:Tep9qgap9rghp9Abbbaradfgrahaaaapmlvorlvorlvorlvorp9rghp9AbbbaradfgrahaaaapmwDqkwDqkwDqkwDqkp9rghp9AbbbaradfgrahaaaapmxmPsxmPsxmPsxmPsp9rghp9Abbbaradfgraha8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLgaaip:Reaaalp:Tep9qgap9rghp9Abbbaradfgrahaaaapmlvorlvorlvorlvorp9rghp9AbbbaradfgrahaaaapmwDqkwDqkwDqkwDqkp9rghp9AbbbaradfgrahaaaapmxmPsxmPsxmPsxmPsp9rghp9Abbbaradfgraha8Ka8LpmwDKYqk8AExm35Ps8E8Fgaaip:Reaaalp:Tep9qgap9rghp9Abbbaradfgrahaaaapmlvorlvorlvorlvorp9rghp9AbbbaradfgrahaaaapmwDqkwDqkwDqkwDqkp9rghp9AbbbaradfgrahaaaapmxmPsxmPsxmPsxmPsp9rghp9AbbbaradfhraoczfgoaC6mbkkaEclfgEad6mbkdnaXavcjdf9hmbaAad2goTmbaOavcjdfao;8qbbkdnammbavaXaAcufad2fad;8qbbkaAaHfhHc9:hoaQhPaQmbxlkkaeTmbaDalfhrcbhocuhlinaralaD9RglfaD6mdasaeao9Raoasfae6Eaofgoae6mbkaial9RhPkcbc99axaP9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaokwbz:bjjjbkNsezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk;Toio97eue97aec98Ghedndnadcl9hmbaeTmecbhdinababpbbbgicKp:RecKp:Sep;6eglaicwp:RecKp:Sep;6ealp;Geaiczp:RecKp:Sep;6egvp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgwp9op9rp;Keglpxbb;:9cbb;:9cbb;:9cbb;:9calalp;Meaoaop;Meavaravawp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFbbbFbbbFbbbFbbbp9oaipxbbbFbbbFbbbFbbbFp9op9qalavp;Mearp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaoavp;Mearp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgDaDpbbbgipxbbbbbbFFbbbbbbFFgwp9oabpbbbgoaipmbediwDqkzHOAKY8AEgvczp:Reczp:Sep;6eglaoaipmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eavczp:Sep;6egvp;Gealp;Gep;Kep;Legipxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgqp9op9rp;Keglpxb;:FSb;:FSb;:FSb;:FSalalp;Meaiaip;Meavaravaqp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbp9oaiavp;Mearp;Keczp:Rep9qgialavp;Mearp;KepxFFbbFFbbFFbbFFbbp9oglpmwDKYqk8AExm35Ps8E8Fp9qpkbbabaoawp9oaialpmbezHdiOAlvCXorQLp9qpkbbabcafhbadclfgdae6mbkkk;2ileue97euo97dnaec98GgiTmbcbheinabcKfpx:ji:1S:ji:1S:ji:1S:ji:1SabpbbbglabczfgvpbbbgopmlvorxmPsCXQL358E8Fgrczp:Segwpxibbbibbbibbbibbbp9qp;6egDp;NegqaDaDp;MegDaDp;KealaopmbediwDqkzHOAKY8AEgDczp:Reczp:Sep;6eglalp;MeaDczp:Sep;6egoaop;Mearczp:Reczp:Sep;6egrarp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jep;Mepxbbn0bbn0bbn0bbn0gDp;KepxFFbbFFbbFFbbFFbbgkp9oaqaop;MeaDp;Keczp:Rep9qgoaqalp;MeaDp;Keakp9oaqarp;MeaDp;Keczp:Rep9qgDpmwDKYqk8AExm35Ps8E8Fglp5eawclp:RegqpEi:T:j83ibavalp5baqpEd:T:j83ibabcwfaoaDpmbezHdiOAlvCXorQLgDp5eaqpEe:T:j83ibabaDp5baqpEb:T:j83ibabcafhbaeclfgeai6mbkkkuee97dnadcd4ae2c98GgeTmbcbhdinababpbbbgicwp:Recwp:Sep;6eaicep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbabczfhbadclfgdae6mbkkk:Sodw97euaec98Ghedndnadcl9hmbaeTmecbhdinabpxbbuJbbuJbbuJbbuJabpbbbgicKp:TeglaicYp:Tep9qgvcdp:Teavp9qgvclp:Teavp9qgop;6ep;Negvaicwp:RecKp:SegraipxFbbbFbbbFbbbFbbbgwp9ogDp:Uep;6ep;Mepxbbn0bbn0bbn0bbn0gqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9oavaDarp:Xeaiczp:RecKp:Segip:Uep;6ep;Meaqp;Keawp9op9qavaDaraip:Uep:Xep;6ep;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qavaoalcep:Rep9oalpxebbbebbbebbbebbbp9op9qp;6ep;Meaqp;KecKp:Rep9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgkpxbFu9hbFu9hbFu9hbFu9habpbbbglakpbbbgrpmlvorxmPsCXQL358E8Fgvczp:TegqavcHp:Tep9qgicdp:Teaip9qgiclp:Teaip9qgicwp:Teaip9qgop;6ep;NegialarpmbediwDqkzHOAKY8AEgDpxFFbbFFbbFFbbFFbbglp9ograDczp:Segwp:Ueavczp:Reczp:SegDp:Xep;6ep;Mepxbbn0bbn0bbn0bbn0gvp;Kealp9oaiarawaDp:Uep:Xep;6ep;Meavp;Keczp:Rep9qgwaiaoaqcep:Rep9oaqpxebbbebbbebbbebbbp9op9qp;6ep;Meavp;Keczp:ReaiaDarp:Uep;6ep;Meavp;Kealp9op9qgipmwDKYqk8AExm35Ps8E8FpkbbabawaipmbezHdiOAlvCXorQLpkbbabcafhbadclfgdae6mbkkk9teiucbcbydj:G:cjbgeabcifc98GfgbBdj:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkxebcj:Gdklz:zbb";
    var detector = new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      4,
      1,
      96,
      0,
      0,
      3,
      3,
      2,
      0,
      0,
      5,
      3,
      1,
      0,
      1,
      12,
      1,
      0,
      10,
      22,
      2,
      12,
      0,
      65,
      0,
      65,
      0,
      65,
      0,
      252,
      10,
      0,
      0,
      11,
      7,
      0,
      65,
      0,
      253,
      15,
      26,
      11
    ]);
    var wasmpack = new Uint8Array([
      32,
      0,
      65,
      2,
      1,
      106,
      34,
      33,
      3,
      128,
      11,
      4,
      13,
      64,
      6,
      253,
      10,
      7,
      15,
      116,
      127,
      5,
      8,
      12,
      40,
      16,
      19,
      54,
      20,
      9,
      27,
      255,
      113,
      17,
      42,
      67,
      24,
      23,
      146,
      148,
      18,
      14,
      22,
      45,
      70,
      69,
      56,
      114,
      101,
      21,
      25,
      63,
      75,
      136,
      108,
      28,
      118,
      29,
      73,
      115
    ]);
    if (typeof WebAssembly !== "object") {
      return {
        supported: false
      };
    }
    var wasm3 = WebAssembly.validate(detector) ? unpack(wasm_simd) : unpack(wasm_base);
    var instance;
    var ready = WebAssembly.instantiate(wasm3, {}).then(function(result) {
      instance = result.instance;
      instance.exports.__wasm_call_ctors();
    });
    function unpack(data) {
      var result = new Uint8Array(data.length);
      for (var i = 0; i < data.length; ++i) {
        var ch = data.charCodeAt(i);
        result[i] = ch > 96 ? ch - 97 : ch > 64 ? ch - 39 : ch + 4;
      }
      var write = 0;
      for (var i = 0; i < data.length; ++i) {
        result[write++] = result[i] < 60 ? wasmpack[result[i]] : (result[i] - 60) * 64 + result[++i];
      }
      return result.buffer.slice(0, write);
    }
    function decode11(instance2, fun, target, count, size, source, filter) {
      var sbrk = instance2.exports.sbrk;
      var count4 = count + 3 & ~3;
      var tp = sbrk(count4 * size);
      var sp = sbrk(source.length);
      var heap = new Uint8Array(instance2.exports.memory.buffer);
      heap.set(source, sp);
      var res = fun(tp, count, size, sp, source.length);
      if (res == 0 && filter) {
        filter(tp, count4, size);
      }
      target.set(heap.subarray(tp, tp + count * size));
      sbrk(tp - sbrk(0));
      if (res != 0) {
        throw new Error("Malformed buffer data: " + res);
      }
    }
    var filters = {
      NONE: "",
      OCTAHEDRAL: "meshopt_decodeFilterOct",
      QUATERNION: "meshopt_decodeFilterQuat",
      EXPONENTIAL: "meshopt_decodeFilterExp",
      COLOR: "meshopt_decodeFilterColor"
    };
    var decoders = {
      ATTRIBUTES: "meshopt_decodeVertexBuffer",
      TRIANGLES: "meshopt_decodeIndexBuffer",
      INDICES: "meshopt_decodeIndexSequence"
    };
    var workers = [];
    var requestId = 0;
    function createWorker(url) {
      var worker = {
        object: new Worker(url),
        pending: 0,
        requests: {}
      };
      worker.object.onmessage = function(event) {
        var data = event.data;
        worker.pending -= data.count;
        worker.requests[data.id][data.action](data.value);
        delete worker.requests[data.id];
      };
      return worker;
    }
    function initWorkers(count) {
      var source = "self.ready = WebAssembly.instantiate(new Uint8Array([" + new Uint8Array(wasm3) + "]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = " + workerProcess.name + ";" + decode11.toString() + workerProcess.toString();
      var blob = new Blob([source], { type: "text/javascript" });
      var url = URL.createObjectURL(blob);
      for (var i = workers.length; i < count; ++i) {
        workers[i] = createWorker(url);
      }
      for (var i = count; i < workers.length; ++i) {
        workers[i].object.postMessage({});
      }
      workers.length = count;
      URL.revokeObjectURL(url);
    }
    function decodeWorker(count, size, source, mode, filter) {
      var worker = workers[0];
      for (var i = 1; i < workers.length; ++i) {
        if (workers[i].pending < worker.pending) {
          worker = workers[i];
        }
      }
      return new Promise(function(resolve2, reject) {
        var data = new Uint8Array(source);
        var id = ++requestId;
        worker.pending += count;
        worker.requests[id] = { resolve: resolve2, reject };
        worker.object.postMessage({ id, count, size, source: data, mode, filter }, [data.buffer]);
      });
    }
    function workerProcess(event) {
      var data = event.data;
      self.ready.then(function(instance2) {
        if (!data.id) {
          return self.close();
        }
        try {
          var target = new Uint8Array(data.count * data.size);
          decode11(instance2, instance2.exports[data.mode], target, data.count, data.size, data.source, instance2.exports[data.filter]);
          self.postMessage({ id: data.id, count: data.count, action: "resolve", value: target }, [target.buffer]);
        } catch (error) {
          self.postMessage({ id: data.id, count: data.count, action: "reject", value: error });
        }
      });
    }
    return {
      ready,
      supported: true,
      useWorkers: function(count) {
        initWorkers(count);
      },
      decodeVertexBuffer: function(target, count, size, source, filter) {
        decode11(instance, instance.exports.meshopt_decodeVertexBuffer, target, count, size, source, instance.exports[filters[filter]]);
      },
      decodeIndexBuffer: function(target, count, size, source) {
        decode11(instance, instance.exports.meshopt_decodeIndexBuffer, target, count, size, source);
      },
      decodeIndexSequence: function(target, count, size, source) {
        decode11(instance, instance.exports.meshopt_decodeIndexSequence, target, count, size, source);
      },
      decodeGltfBuffer: function(target, count, size, source, mode, filter) {
        decode11(instance, instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
      },
      decodeGltfBufferAsync: function(count, size, source, mode, filter) {
        if (workers.length > 0) {
          return decodeWorker(count, size, source, decoders[mode], filters[filter]);
        }
        return ready.then(function() {
          var target = new Uint8Array(count * size);
          decode11(instance, instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
          return target;
        });
      }
    };
  }();

  // ../gltf/src/meshopt/meshopt-decoder.ts
  function getMeshoptCompressionFilter(filter) {
    if (typeof filter === "string") {
      return filter;
    }
    return ["NONE", "OCTAHEDRAL", "QUATERNION", "EXPONENTIAL", "COLOR"][filter];
  }
  async function meshoptDecodeGltfBuffer(target, count, byteStride, source, mode, filter = "NONE") {
    await MeshoptDecoder.ready;
    MeshoptDecoder.decodeGltfBuffer(
      target,
      count,
      byteStride,
      source,
      mode,
      getMeshoptCompressionFilter(filter)
    );
  }

  // ../gltf/src/lib/extensions/meshopt-compression.ts
  async function decodeMeshoptCompression(gltfData, options, extensionName) {
    if (!options.gltf?.decompressMeshes || !options.gltf.loadBuffers) {
      return;
    }
    validateMeshoptCompressionExclusivity(gltfData.json);
    const scenegraph = new GLTFScenegraph(gltfData);
    const bufferViews = gltfData.json.bufferViews || [];
    const promises = bufferViews.map(
      (bufferView) => decodeMeshoptBufferView(scenegraph, bufferView, extensionName)
    );
    await Promise.all(promises);
    for (const bufferView of bufferViews) {
      scenegraph.removeObjectExtension(bufferView, extensionName);
    }
    for (const buffer of gltfData.json.buffers || []) {
      scenegraph.removeObjectExtension(buffer, extensionName);
    }
    scenegraph.removeExtension(extensionName);
  }
  function validateMeshoptCompressionExclusivity(gltf) {
    const bufferViews = gltf.bufferViews || [];
    for (let bufferViewIndex = 0; bufferViewIndex < bufferViews.length; bufferViewIndex++) {
      const extensions = bufferViews[bufferViewIndex].extensions;
      if (extensions?.KHR_meshopt_compression && extensions.EXT_meshopt_compression) {
        throw new Error(
          `glTF bufferView ${bufferViewIndex} cannot use both KHR_meshopt_compression and EXT_meshopt_compression.`
        );
      }
    }
    const buffers = gltf.buffers || [];
    for (let bufferIndex = 0; bufferIndex < buffers.length; bufferIndex++) {
      const extensions = buffers[bufferIndex].extensions;
      if (extensions?.KHR_meshopt_compression && extensions.EXT_meshopt_compression) {
        throw new Error(
          `glTF buffer ${bufferIndex} cannot use both KHR_meshopt_compression and EXT_meshopt_compression.`
        );
      }
    }
  }
  async function decodeMeshoptBufferView(scenegraph, bufferView, extensionName) {
    const meshoptExtension = scenegraph.getObjectExtension(bufferView, extensionName);
    if (!meshoptExtension) {
      return;
    }
    const {
      byteOffset = 0,
      byteLength,
      byteStride,
      count,
      mode,
      filter = "NONE",
      buffer: sourceBufferIndex
    } = meshoptExtension;
    const sourceBuffer = scenegraph.gltf.buffers[sourceBufferIndex];
    const targetBuffer = scenegraph.gltf.buffers[bufferView.buffer];
    const source = new Uint8Array(
      sourceBuffer.arrayBuffer,
      sourceBuffer.byteOffset + byteOffset,
      byteLength
    );
    const target = new Uint8Array(
      targetBuffer.arrayBuffer,
      targetBuffer.byteOffset + (bufferView.byteOffset || 0),
      bufferView.byteLength
    );
    await meshoptDecodeGltfBuffer(target, count, byteStride, source, mode, filter);
  }

  // ../gltf/src/lib/extensions/EXT_meshopt_compression.ts
  var name4 = "EXT_meshopt_compression";
  async function decode4(gltfData, options) {
    await decodeMeshoptCompression(gltfData, options, name4);
  }

  // ../gltf/src/lib/extensions/KHR_meshopt_compression.ts
  var KHR_meshopt_compression_exports = {};
  __export(KHR_meshopt_compression_exports, {
    decode: () => decode5,
    name: () => name5
  });
  var name5 = "KHR_meshopt_compression";
  async function decode5(gltfData, options) {
    await decodeMeshoptCompression(gltfData, options, name5);
  }

  // ../gltf/src/lib/extensions/EXT_texture_webp.ts
  var EXT_texture_webp_exports = {};
  __export(EXT_texture_webp_exports, {
    name: () => name6,
    preprocess: () => preprocess
  });
  var EXT_TEXTURE_WEBP = "EXT_texture_webp";
  var name6 = EXT_TEXTURE_WEBP;
  function preprocess(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    if (!isImageFormatSupported("image/webp")) {
      if (scenegraph.getRequiredExtensions().includes(EXT_TEXTURE_WEBP)) {
        throw new Error(`gltf: Required extension ${EXT_TEXTURE_WEBP} not supported by browser`);
      }
      return;
    }
    const { json } = scenegraph;
    for (const texture of json.textures || []) {
      const extension = scenegraph.getObjectExtension(
        texture,
        EXT_TEXTURE_WEBP
      );
      if (extension) {
        texture.source = extension.source;
      }
      scenegraph.removeObjectExtension(texture, EXT_TEXTURE_WEBP);
    }
    scenegraph.removeExtension(EXT_TEXTURE_WEBP);
  }

  // ../gltf/src/lib/extensions/EXT_texture_avif.ts
  var EXT_texture_avif_exports = {};
  __export(EXT_texture_avif_exports, {
    name: () => name7,
    preprocess: () => preprocess2
  });
  var EXT_TEXTURE_AVIF = "EXT_texture_avif";
  var name7 = EXT_TEXTURE_AVIF;
  async function preprocess2(gltfData, options) {
    const scenegraph = new GLTFScenegraph(gltfData);
    const supportedImageFormats = await getSupportedImageFormats();
    if (!supportedImageFormats.has("image/avif")) {
      if (scenegraph.getRequiredExtensions().includes(EXT_TEXTURE_AVIF)) {
        throw new Error(`gltf: Required extension ${EXT_TEXTURE_AVIF} not supported by browser`);
      }
      return;
    }
    const { json } = scenegraph;
    for (const texture of json.textures || []) {
      const extension = scenegraph.getObjectExtension(
        texture,
        EXT_TEXTURE_AVIF
      );
      if (extension) {
        texture.source = extension.source;
      }
      scenegraph.removeObjectExtension(texture, EXT_TEXTURE_AVIF);
    }
    scenegraph.removeExtension(EXT_TEXTURE_AVIF);
  }

  // ../gltf/src/lib/extensions/KHR_texture_basisu.ts
  var KHR_texture_basisu_exports = {};
  __export(KHR_texture_basisu_exports, {
    name: () => name8,
    preprocess: () => preprocess3
  });
  var KHR_TEXTURE_BASISU = "KHR_texture_basisu";
  var name8 = KHR_TEXTURE_BASISU;
  function preprocess3(gltfData, options) {
    const scene = new GLTFScenegraph(gltfData);
    const { json } = scene;
    for (const texture of json.textures || []) {
      const extension = scene.getObjectExtension(
        texture,
        KHR_TEXTURE_BASISU
      );
      if (extension) {
        texture.source = extension.source;
        scene.removeObjectExtension(texture, KHR_TEXTURE_BASISU);
      }
    }
    scene.removeExtension(KHR_TEXTURE_BASISU);
  }

  // ../gltf/src/lib/extensions/KHR_draco_mesh_compression.ts
  var KHR_draco_mesh_compression_exports = {};
  __export(KHR_draco_mesh_compression_exports, {
    decode: () => decode6,
    encode: () => encode3,
    name: () => name9,
    preprocess: () => preprocess4
  });

  // ../gltf/src/lib/gltf-utils/gltf-attribute-utils.ts
  function getGLTFAccessors(attributes) {
    const accessors = {};
    for (const name14 in attributes) {
      const attribute = attributes[name14];
      if (name14 !== "indices") {
        const glTFAccessor = getGLTFAccessor(attribute);
        accessors[name14] = glTFAccessor;
      }
    }
    return accessors;
  }
  function getGLTFAccessor(attribute) {
    const { buffer, size, count } = getAccessorData(attribute);
    const glTFAccessor = {
      // glTF Accessor values
      // TODO: Instead of a bufferView index we could have an actual buffer (typed array)
      // bufferView: null,
      // TODO: Deprecate `value` in favor of bufferView?
      // @ts-ignore
      value: buffer,
      size,
      // Decoded `type` (e.g. SCALAR)
      byteOffset: 0,
      count,
      type: getAccessorTypeFromSize(size),
      componentType: getComponentTypeFromArray(buffer)
    };
    return glTFAccessor;
  }
  function getAccessorData(attribute) {
    let buffer = attribute;
    let size = 1;
    let count = 0;
    if (attribute && attribute.value) {
      buffer = attribute.value;
      size = attribute.size || 1;
    }
    if (buffer) {
      if (!ArrayBuffer.isView(buffer)) {
        buffer = toTypedArray(buffer, Float32Array);
      }
      count = buffer.length / size;
    }
    return { buffer, size, count };
  }
  function toTypedArray(array, ArrayType, convertTypedArrays = false) {
    if (!array) {
      return null;
    }
    if (Array.isArray(array)) {
      return new ArrayType(array);
    }
    if (convertTypedArrays && !(array instanceof ArrayType)) {
      return new ArrayType(array);
    }
    return array;
  }

  // ../gltf/src/lib/extensions/KHR_draco_mesh_compression.ts
  var KHR_DRACO_MESH_COMPRESSION = "KHR_draco_mesh_compression";
  var name9 = KHR_DRACO_MESH_COMPRESSION;
  function preprocess4(gltfData, options, context) {
    const scenegraph = new GLTFScenegraph(gltfData);
    for (const primitive of makeMeshPrimitiveIterator(scenegraph)) {
      if (scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION)) {
      }
    }
  }
  async function decode6(gltfData, options, context) {
    if (!options?.gltf?.decompressMeshes) {
      return;
    }
    const scenegraph = new GLTFScenegraph(gltfData);
    const promises = [];
    for (const primitive of makeMeshPrimitiveIterator(scenegraph)) {
      if (scenegraph.getObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION)) {
        promises.push(decompressPrimitive(scenegraph, primitive, options, context));
      }
    }
    await Promise.all(promises);
    scenegraph.removeExtension(KHR_DRACO_MESH_COMPRESSION);
  }
  function encode3(gltfData, options = {}) {
    const scenegraph = new GLTFScenegraph(gltfData);
    for (const mesh of scenegraph.json.meshes || []) {
      compressMesh(mesh, options);
      scenegraph.addRequiredExtension(KHR_DRACO_MESH_COMPRESSION);
    }
  }
  async function decompressPrimitive(scenegraph, primitive, options, context) {
    const dracoExtension = scenegraph.getObjectExtension(
      primitive,
      KHR_DRACO_MESH_COMPRESSION
    );
    if (!dracoExtension) {
      return;
    }
    const buffer = scenegraph.getTypedArrayForBufferView(dracoExtension.bufferView);
    const bufferCopy = sliceArrayBuffer(buffer.buffer, buffer.byteOffset);
    const dracoOptions = { ...options };
    delete dracoOptions["3d-tiles"];
    const decodedData = await parseFromContext(bufferCopy, DracoLoader, dracoOptions, context);
    const decodedAttributes = getGLTFAccessors(decodedData.attributes);
    for (const [attributeName, decodedAttribute] of Object.entries(decodedAttributes)) {
      if (attributeName in primitive.attributes) {
        const accessorIndex = primitive.attributes[attributeName];
        const accessor = scenegraph.getAccessor(accessorIndex);
        if (accessor?.min && accessor?.max) {
          decodedAttribute.min = accessor.min;
          decodedAttribute.max = accessor.max;
        }
      }
    }
    primitive.attributes = decodedAttributes;
    if (decodedData.indices) {
      primitive.indices = getGLTFAccessor(decodedData.indices);
    }
    scenegraph.removeObjectExtension(primitive, KHR_DRACO_MESH_COMPRESSION);
    checkPrimitive(primitive);
  }
  function compressMesh(attributes, indices, mode = 4, options, context) {
    if (!options.DracoWriter) {
      throw new Error("options.gltf.DracoWriter not provided");
    }
    const compressedData = options.DracoWriter.encodeSync({ attributes });
    const decodedData = context?.parseSync?.({ attributes });
    const fauxAccessors = options._addFauxAttributes(decodedData.attributes);
    const bufferViewIndex = options.addBufferView(compressedData);
    const glTFMesh = {
      primitives: [
        {
          attributes: fauxAccessors,
          // TODO - verify with spec
          mode,
          // GL.POINTS
          extensions: {
            [KHR_DRACO_MESH_COMPRESSION]: {
              bufferView: bufferViewIndex,
              attributes: fauxAccessors
              // TODO - verify with spec
            }
          }
        }
      ]
    };
    return glTFMesh;
  }
  function checkPrimitive(primitive) {
    if (!primitive.attributes && Object.keys(primitive.attributes).length > 0) {
      throw new Error("glTF: Empty primitive detected: Draco decompression failure?");
    }
  }
  function* makeMeshPrimitiveIterator(scenegraph) {
    for (const mesh of scenegraph.json.meshes || []) {
      for (const primitive of mesh.primitives) {
        yield primitive;
      }
    }
  }

  // ../gltf/src/lib/extensions/KHR_texture_transform.ts
  var KHR_texture_transform_exports = {};
  __export(KHR_texture_transform_exports, {
    decode: () => decode7,
    name: () => name10
  });
  var KHR_TEXTURE_TRANSFORM = "KHR_texture_transform";
  var name10 = KHR_TEXTURE_TRANSFORM;
  var scratchVector8 = new Vector3();
  var scratchRotationMatrix = new Matrix3();
  var scratchScaleMatrix = new Matrix3();
  async function decode7(gltfData, options) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const hasExtension = gltfScenegraph.hasExtension(KHR_TEXTURE_TRANSFORM);
    if (!hasExtension || !options.gltf?.loadBuffers) {
      return;
    }
    const materials = gltfData.json.materials || [];
    for (let i = 0; i < materials.length; i++) {
      transformTexCoords(i, gltfData, gltfScenegraph);
    }
    if (!materials.some((material) => findTextureInfos(material).length > 0)) {
      gltfScenegraph.removeExtension(KHR_TEXTURE_TRANSFORM);
    }
  }
  function transformTexCoords(materialIndex, gltfData, gltfScenegraph) {
    const material = gltfData.json.materials?.[materialIndex];
    const materialTextures = findTextureInfos(material);
    const processedTransforms = /* @__PURE__ */ new Map();
    let nextTexCoord = getNextTexCoord(gltfData);
    for (const textureInfo of materialTextures) {
      const extension = textureInfo.extensions?.[KHR_TEXTURE_TRANSFORM];
      if (extension) {
        const sourceTexCoord = extension.texCoord ?? textureInfo.texCoord ?? 0;
        const transformKey = getTransformKey(sourceTexCoord, extension);
        let transformParameters = processedTransforms.get(transformKey);
        if (!transformParameters) {
          transformParameters = {
            sourceTexCoord,
            texCoord: nextTexCoord,
            matrix: makeTransformationMatrix(extension)
          };
          if (!transformPrimitives(gltfData, materialIndex, transformParameters)) {
            continue;
          }
          nextTexCoord++;
          processedTransforms.set(transformKey, transformParameters);
        }
        textureInfo.texCoord = transformParameters.texCoord;
        gltfScenegraph.removeObjectExtension(textureInfo, KHR_TEXTURE_TRANSFORM);
        if (textureInfo.extensions && Object.keys(textureInfo.extensions).length === 0) {
          delete textureInfo.extensions;
        }
      }
    }
  }
  function findTextureInfos(value) {
    if (!value || typeof value !== "object") {
      return [];
    }
    const object = value;
    const textureInfos = [];
    const extensions = object.extensions;
    if (Number.isFinite(object.index) && extensions?.[KHR_TEXTURE_TRANSFORM]) {
      textureInfos.push(object);
    }
    for (const [key, nestedValue] of Object.entries(object)) {
      if (key !== "extras") {
        textureInfos.push(...findTextureInfos(nestedValue));
      }
    }
    return textureInfos;
  }
  function getNextTexCoord(gltfData) {
    let maximumTexCoord = -1;
    for (const mesh of gltfData.json.meshes || []) {
      for (const primitive of mesh.primitives) {
        for (const attributeName of Object.keys(primitive.attributes)) {
          const match = /^TEXCOORD_(\d+)$/.exec(attributeName);
          if (match) {
            maximumTexCoord = Math.max(maximumTexCoord, Number(match[1]));
          }
        }
      }
    }
    return maximumTexCoord + 1;
  }
  function getTransformKey(sourceTexCoord, extension) {
    const { offset = [0, 0], rotation = 0, scale: scale6 = [1, 1] } = extension;
    return JSON.stringify([sourceTexCoord, offset, rotation, scale6]);
  }
  function transformPrimitives(gltfData, materialIndex, transformParameters) {
    const primitives = [];
    const meshes = gltfData.json.meshes || [];
    for (const mesh of meshes) {
      for (const primitive of mesh.primitives) {
        const material = primitive.material;
        if (Number.isFinite(material) && materialIndex === material) {
          primitives.push(primitive);
        }
      }
    }
    if (primitives.length === 0 || primitives.some(
      (primitive) => !canTransformPrimitive(gltfData, primitive, transformParameters.sourceTexCoord)
    )) {
      return false;
    }
    for (const primitive of primitives) {
      transformPrimitive(gltfData, primitive, transformParameters);
    }
    return true;
  }
  function canTransformPrimitive(gltfData, primitive, sourceTexCoord) {
    const texCoordAccessor = primitive.attributes[`TEXCOORD_${sourceTexCoord}`];
    if (!Number.isFinite(texCoordAccessor)) {
      return false;
    }
    const accessor = gltfData.json.accessors?.[texCoordAccessor];
    if (!accessor || accessor.bufferView === void 0 || accessor.sparse) {
      return false;
    }
    const bufferView = gltfData.json.bufferViews?.[accessor.bufferView];
    return Boolean(bufferView && gltfData.buffers[bufferView.buffer]);
  }
  function transformPrimitive(gltfData, primitive, transformParameters) {
    const { sourceTexCoord, texCoord, matrix } = transformParameters;
    const texCoordAccessor = primitive.attributes[`TEXCOORD_${sourceTexCoord}`];
    if (Number.isFinite(texCoordAccessor)) {
      const accessor = gltfData.json.accessors?.[texCoordAccessor];
      if (accessor && accessor.bufferView !== void 0) {
        const bufferView = gltfData.json.bufferViews?.[accessor.bufferView];
        if (bufferView) {
          const { arrayBuffer, byteOffset: bufferByteOffset } = gltfData.buffers[bufferView.buffer];
          const byteOffset = (bufferByteOffset || 0) + (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
          const { ArrayType, length: length4 } = getAccessorArrayTypeAndLength(accessor, bufferView);
          const bytes = BYTES[accessor.componentType];
          const components = COMPONENTS[accessor.type];
          const elementAddressScale = bufferView.byteStride || bytes * components;
          const result = new Float32Array(length4);
          for (let i = 0; i < accessor.count; i++) {
            const uv = new ArrayType(arrayBuffer, byteOffset + i * elementAddressScale, 2);
            scratchVector8.set(uv[0], uv[1], 1);
            scratchVector8.transformByMatrix3(matrix);
            result.set([scratchVector8[0], scratchVector8[1]], i * components);
          }
          createAttribute(texCoord, accessor, primitive, gltfData, result);
        }
      }
    }
  }
  function createAttribute(newTexCoord, originalAccessor, primitive, gltfData, newTexCoordArray) {
    gltfData.buffers.push({
      arrayBuffer: ensureArrayBuffer(newTexCoordArray.buffer),
      byteOffset: 0,
      byteLength: newTexCoordArray.buffer.byteLength
    });
    gltfData.json.bufferViews = gltfData.json.bufferViews || [];
    const bufferViews = gltfData.json.bufferViews;
    bufferViews.push({
      buffer: gltfData.buffers.length - 1,
      byteLength: newTexCoordArray.buffer.byteLength,
      byteOffset: 0
    });
    const accessors = gltfData.json.accessors;
    if (!accessors) {
      return;
    }
    accessors.push({
      bufferView: bufferViews?.length - 1,
      byteOffset: 0,
      componentType: 5126,
      count: originalAccessor.count,
      type: "VEC2"
    });
    primitive.attributes[`TEXCOORD_${newTexCoord}`] = accessors.length - 1;
  }
  function makeTransformationMatrix(extensionData) {
    const { offset = [0, 0], rotation = 0, scale: scale6 = [1, 1] } = extensionData;
    const translationMatrix = new Matrix3().set(1, 0, 0, 0, 1, 0, offset[0], offset[1], 1);
    const rotationMatrix = scratchRotationMatrix.set(
      Math.cos(rotation),
      Math.sin(rotation),
      0,
      -Math.sin(rotation),
      Math.cos(rotation),
      0,
      0,
      0,
      1
    );
    const scaleMatrix = scratchScaleMatrix.set(scale6[0], 0, 0, 0, scale6[1], 0, 0, 0, 1);
    return translationMatrix.multiplyRight(rotationMatrix).multiplyRight(scaleMatrix);
  }

  // ../gltf/src/lib/extensions/deprecated/KHR_lights_punctual.ts
  var KHR_lights_punctual_exports = {};
  __export(KHR_lights_punctual_exports, {
    decode: () => decode8,
    encode: () => encode4,
    name: () => name11
  });
  var KHR_LIGHTS_PUNCTUAL = "KHR_lights_punctual";
  var name11 = KHR_LIGHTS_PUNCTUAL;
  async function decode8(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    const extension = gltfScenegraph.getExtension(KHR_LIGHTS_PUNCTUAL);
    if (extension) {
      gltfScenegraph.json.lights = extension.lights;
      gltfScenegraph.removeExtension(KHR_LIGHTS_PUNCTUAL);
    }
    for (const node of json.nodes || []) {
      const nodeExtension = gltfScenegraph.getObjectExtension(node, KHR_LIGHTS_PUNCTUAL);
      if (nodeExtension) {
        node.light = nodeExtension.light;
      }
      gltfScenegraph.removeObjectExtension(node, KHR_LIGHTS_PUNCTUAL);
    }
  }
  async function encode4(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    if (json.lights) {
      const extension = gltfScenegraph.addExtension(KHR_LIGHTS_PUNCTUAL);
      assert7(!extension.lights);
      extension.lights = json.lights;
      delete json.lights;
    }
    if (gltfScenegraph.json.lights) {
      for (const light of gltfScenegraph.json.lights) {
        const node = light.node;
        gltfScenegraph.addObjectExtension(node, KHR_LIGHTS_PUNCTUAL, light);
      }
      delete gltfScenegraph.json.lights;
    }
  }

  // ../gltf/src/lib/extensions/deprecated/KHR_materials_unlit.ts
  var KHR_materials_unlit_exports = {};
  __export(KHR_materials_unlit_exports, {
    decode: () => decode9,
    encode: () => encode5,
    name: () => name12
  });
  var KHR_MATERIALS_UNLIT = "KHR_materials_unlit";
  var name12 = KHR_MATERIALS_UNLIT;
  async function decode9(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    for (const material of json.materials || []) {
      const extension = material.extensions && material.extensions.KHR_materials_unlit;
      if (extension) {
        material.unlit = true;
      }
      gltfScenegraph.removeObjectExtension(material, KHR_MATERIALS_UNLIT);
    }
    gltfScenegraph.removeExtension(KHR_MATERIALS_UNLIT);
  }
  function encode5(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    if (gltfScenegraph.materials) {
      for (const material of json.materials || []) {
        if (material.unlit) {
          delete material.unlit;
          gltfScenegraph.addObjectExtension(material, KHR_MATERIALS_UNLIT, {});
          gltfScenegraph.addExtension(KHR_MATERIALS_UNLIT);
        }
      }
    }
  }

  // ../gltf/src/lib/extensions/deprecated/KHR_techniques_webgl.ts
  var KHR_techniques_webgl_exports = {};
  __export(KHR_techniques_webgl_exports, {
    decode: () => decode10,
    encode: () => encode6,
    name: () => name13
  });
  var KHR_TECHNIQUES_WEBGL = "KHR_techniques_webgl";
  var name13 = KHR_TECHNIQUES_WEBGL;
  async function decode10(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    const extension = gltfScenegraph.getExtension(KHR_TECHNIQUES_WEBGL);
    if (extension) {
      const techniques = resolveTechniques(extension, gltfScenegraph);
      for (const material of json.materials || []) {
        const materialExtension = gltfScenegraph.getObjectExtension(material, KHR_TECHNIQUES_WEBGL);
        if (materialExtension) {
          material.technique = Object.assign(
            {},
            materialExtension,
            // @ts-ignore
            techniques[materialExtension.technique]
          );
          material.technique.values = resolveValues(material.technique, gltfScenegraph);
        }
        gltfScenegraph.removeObjectExtension(material, KHR_TECHNIQUES_WEBGL);
      }
      gltfScenegraph.removeExtension(KHR_TECHNIQUES_WEBGL);
    }
  }
  async function encode6(gltfData, options) {
  }
  function resolveTechniques(techniquesExtension, gltfScenegraph) {
    const { programs = [], shaders = [], techniques = [] } = techniquesExtension;
    const textDecoder = new TextDecoder();
    shaders.forEach((shader) => {
      if (Number.isFinite(shader.bufferView)) {
        shader.code = textDecoder.decode(
          gltfScenegraph.getTypedArrayForBufferView(shader.bufferView)
        );
      } else {
        throw new Error("KHR_techniques_webgl: no shader code");
      }
    });
    programs.forEach((program) => {
      program.fragmentShader = shaders[program.fragmentShader];
      program.vertexShader = shaders[program.vertexShader];
    });
    techniques.forEach((technique) => {
      technique.program = programs[technique.program];
    });
    return techniques;
  }
  function resolveValues(technique, gltfScenegraph) {
    const values = Object.assign({}, technique.values);
    Object.keys(technique.uniforms || {}).forEach((uniform) => {
      if (technique.uniforms[uniform].value && !(uniform in values)) {
        values[uniform] = technique.uniforms[uniform].value;
      }
    });
    Object.keys(values).forEach((uniform) => {
      if (typeof values[uniform] === "object" && values[uniform].index !== void 0) {
        values[uniform].texture = gltfScenegraph.getTexture(values[uniform].index);
      }
    });
    return values;
  }

  // ../gltf/src/lib/api/gltf-extensions.ts
  var EXTENSIONS2 = [
    // 1.0
    // KHR_binary_gltf is handled separately - must be processed before other parsing starts
    // KHR_binary_gltf,
    // 2.0
    EXT_structural_metadata_exports,
    EXT_mesh_features_exports,
    KHR_meshopt_compression_exports,
    EXT_meshopt_compression_exports,
    EXT_texture_avif_exports,
    EXT_texture_webp_exports,
    // Basisu should come after webp, we want basisu to be preferred if both are provided
    KHR_texture_basisu_exports,
    KHR_draco_mesh_compression_exports,
    KHR_lights_punctual_exports,
    KHR_materials_unlit_exports,
    KHR_techniques_webgl_exports,
    KHR_texture_transform_exports,
    EXT_feature_metadata_exports
  ];
  async function preprocessExtensions(gltf, options = {}, context) {
    const extensions = EXTENSIONS2.filter((extension) => useExtension(extension.name, options));
    for (const extension of extensions) {
      await extension.preprocess?.(gltf, options, context);
    }
  }
  async function decodeExtensions(gltf, options = {}, context) {
    const extensions = EXTENSIONS2.filter((extension) => useExtension(extension.name, options));
    for (const extension of extensions) {
      await extension.decode?.(gltf, options, context);
    }
  }
  function useExtension(extensionName, options) {
    const excludes = options?.gltf?.excludeExtensions || {};
    const exclude = extensionName in excludes && !excludes[extensionName];
    return !exclude;
  }

  // ../gltf/src/lib/extensions/KHR_binary_gltf.ts
  var KHR_BINARY_GLTF = "KHR_binary_glTF";
  function preprocess5(gltfData) {
    const gltfScenegraph = new GLTFScenegraph(gltfData);
    const { json } = gltfScenegraph;
    for (const image of json.images || []) {
      const extension = gltfScenegraph.getObjectExtension(
        image,
        KHR_BINARY_GLTF
      );
      if (extension) {
        Object.assign(image, extension);
      }
      gltfScenegraph.removeObjectExtension(image, KHR_BINARY_GLTF);
    }
    if (json.buffers && json.buffers[0]) {
      delete json.buffers[0].uri;
    }
    gltfScenegraph.removeExtension(KHR_BINARY_GLTF);
  }

  // ../gltf/src/lib/api/normalize-gltf-v1.ts
  var GLTF_ARRAYS = {
    accessors: "accessor",
    animations: "animation",
    buffers: "buffer",
    bufferViews: "bufferView",
    images: "image",
    materials: "material",
    meshes: "mesh",
    nodes: "node",
    samplers: "sampler",
    scenes: "scene",
    skins: "skin",
    textures: "texture"
  };
  var GLTF_KEYS = {
    accessor: "accessors",
    animations: "animation",
    buffer: "buffers",
    bufferView: "bufferViews",
    image: "images",
    material: "materials",
    mesh: "meshes",
    node: "nodes",
    sampler: "samplers",
    scene: "scenes",
    skin: "skins",
    texture: "textures"
  };
  var GLTFV1Normalizer = class {
    idToIndexMap = {
      animations: {},
      accessors: {},
      buffers: {},
      bufferViews: {},
      images: {},
      materials: {},
      meshes: {},
      nodes: {},
      samplers: {},
      scenes: {},
      skins: {},
      textures: {}
    };
    json;
    // constructor() {}
    /**
     * Convert (normalize) glTF < 2.0 to glTF 2.0
     * @param gltf - object with json and binChunks
     * @param options
     * @param options normalize Whether to actually normalize
     */
    normalize(gltf, options) {
      this.json = gltf.json;
      const json = gltf.json;
      switch (json.asset && json.asset.version) {
        case "2.0":
          return;
        case void 0:
        case "1.0":
          break;
        default:
          console.warn(`glTF: Unknown version ${json.asset.version}`);
          return;
      }
      if (!options.normalize) {
        throw new Error("glTF v1 is not supported.");
      }
      console.warn("Converting glTF v1 to glTF v2 format. This is experimental and may fail.");
      this._addAsset(json);
      this._convertTopLevelObjectsToArrays(json);
      preprocess5(gltf);
      this._convertObjectIdsToArrayIndices(json);
      this._updateObjects(json);
      this._updateMaterial(json);
    }
    // asset is now required, #642 https://github.com/KhronosGroup/glTF/issues/639
    _addAsset(json) {
      json.asset = json.asset || {};
      json.asset.version = "2.0";
      json.asset.generator = json.asset.generator || "Normalized to glTF 2.0 by loaders.gl";
    }
    _convertTopLevelObjectsToArrays(json) {
      for (const arrayName in GLTF_ARRAYS) {
        this._convertTopLevelObjectToArray(json, arrayName);
      }
    }
    /** Convert one top level object to array */
    _convertTopLevelObjectToArray(json, mapName) {
      const objectMap = json[mapName];
      if (!objectMap || Array.isArray(objectMap)) {
        return;
      }
      json[mapName] = [];
      for (const id in objectMap) {
        const object = objectMap[id];
        object.id = object.id || id;
        const index = json[mapName].length;
        json[mapName].push(object);
        this.idToIndexMap[mapName][id] = index;
      }
    }
    /** Go through all objects in all top-level arrays and replace ids with indices */
    _convertObjectIdsToArrayIndices(json) {
      for (const arrayName in GLTF_ARRAYS) {
        this._convertIdsToIndices(json, arrayName);
      }
      if ("scene" in json) {
        json.scene = this._convertIdToIndex(json.scene, "scene");
      }
      for (const texture of json.textures) {
        this._convertTextureIds(texture);
      }
      for (const mesh of json.meshes) {
        this._convertMeshIds(mesh);
      }
      for (const node of json.nodes) {
        this._convertNodeIds(node);
      }
      for (const node of json.scenes) {
        this._convertSceneIds(node);
      }
    }
    _convertTextureIds(texture) {
      if (texture.source) {
        texture.source = this._convertIdToIndex(texture.source, "image");
      }
    }
    _convertMeshIds(mesh) {
      for (const primitive of mesh.primitives) {
        const { attributes, indices, material } = primitive;
        for (const attributeName in attributes) {
          attributes[attributeName] = this._convertIdToIndex(attributes[attributeName], "accessor");
        }
        if (indices) {
          primitive.indices = this._convertIdToIndex(indices, "accessor");
        }
        if (material) {
          primitive.material = this._convertIdToIndex(material, "material");
        }
      }
    }
    _convertNodeIds(node) {
      if (node.children) {
        node.children = node.children.map((child) => this._convertIdToIndex(child, "node"));
      }
      if (node.meshes) {
        node.meshes = node.meshes.map((mesh) => this._convertIdToIndex(mesh, "mesh"));
      }
    }
    _convertSceneIds(scene) {
      if (scene.nodes) {
        scene.nodes = scene.nodes.map((node) => this._convertIdToIndex(node, "node"));
      }
    }
    /** Go through all objects in a top-level array and replace ids with indices */
    _convertIdsToIndices(json, topLevelArrayName) {
      if (!json[topLevelArrayName]) {
        console.warn(`gltf v1: json doesn't contain attribute ${topLevelArrayName}`);
        json[topLevelArrayName] = [];
      }
      for (const object of json[topLevelArrayName]) {
        for (const key in object) {
          const id = object[key];
          const index = this._convertIdToIndex(id, key);
          object[key] = index;
        }
      }
    }
    _convertIdToIndex(id, key) {
      const arrayName = GLTF_KEYS[key];
      if (arrayName in this.idToIndexMap) {
        const index = this.idToIndexMap[arrayName][id];
        if (!Number.isFinite(index)) {
          throw new Error(`gltf v1: failed to resolve ${key} with id ${id}`);
        }
        return index;
      }
      return id;
    }
    /**
     *
     * @param {*} json
     */
    _updateObjects(json) {
      for (const buffer of this.json.buffers) {
        delete buffer.type;
      }
    }
    /**
     * Update material (set pbrMetallicRoughness)
     * @param {*} json
     */
    _updateMaterial(json) {
      for (const material of json.materials) {
        material.pbrMetallicRoughness = {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 1,
          roughnessFactor: 1
        };
        const textureId = material.values?.tex || material.values?.texture2d_0 || material.values?.diffuseTex;
        const textureIndex = json.textures.findIndex((texture) => texture.id === textureId);
        if (textureIndex !== -1) {
          material.pbrMetallicRoughness.baseColorTexture = { index: textureIndex };
        }
      }
    }
  };
  function normalizeGLTFV1(gltf, options = {}) {
    return new GLTFV1Normalizer().normalize(gltf, options);
  }

  // ../gltf/src/lib/parsers/parse-gltf.ts
  function getGLTFImageOptions(options, mimeType) {
    const basisOptions = options.basis;
    const basisFormat = basisOptions?.format;
    return {
      ...options,
      core: { ...options.core, mimeType },
      basis: {
        ...basisOptions,
        format: basisFormat && basisFormat !== "auto" ? basisFormat : selectSupportedBasisFormat(basisOptions?.supportedTextureFormats)
      }
    };
  }
  async function parseGLTF(gltf, arrayBufferOrString, byteOffset = 0, options, context) {
    parseGLTFContainerSync(gltf, arrayBufferOrString, byteOffset, options);
    normalizeGLTFV1(gltf, { normalize: options?.gltf?.normalize });
    await preprocessExtensions(gltf, options, context);
    if (options?.gltf?.loadBuffers && gltf.json.buffers) {
      await loadBuffers(gltf, options, context);
    }
    if (options?.gltf?.loadImages) {
      await loadImages(gltf, options, context);
    }
    await decodeExtensions(gltf, options, context);
    return gltf;
  }
  function parseGLTFContainerSync(gltf, data, byteOffset, options) {
    if (options.core?.baseUrl) {
      gltf.baseUri = options.core?.baseUrl;
    }
    if (data instanceof ArrayBuffer && !isGLB(data, byteOffset, options.glb)) {
      const textDecoder = new TextDecoder();
      data = textDecoder.decode(data);
    }
    if (typeof data === "string") {
      gltf.json = parseJSON(data);
    } else if (data instanceof ArrayBuffer) {
      const glb = {};
      byteOffset = parseGLBSync(glb, data, byteOffset, options.glb);
      assert7(glb.type === "glTF", `Invalid GLB magic string ${glb.type}`);
      gltf._glb = glb;
      gltf.json = glb.json;
    } else {
      assert7(false, "GLTF: must be ArrayBuffer or string");
    }
    const buffers = gltf.json.buffers || [];
    gltf.buffers = new Array(buffers.length).fill(null);
    if (gltf._glb && gltf._glb.header.hasBinChunk) {
      const { binChunks } = gltf._glb;
      gltf.buffers[0] = {
        arrayBuffer: binChunks[0].arrayBuffer,
        byteOffset: binChunks[0].byteOffset,
        byteLength: binChunks[0].byteLength
      };
    }
    const images = gltf.json.images || [];
    gltf.images = new Array(images.length).fill({});
  }
  async function loadBuffers(gltf, options, context) {
    const buffers = gltf.json.buffers || [];
    for (let i = 0; i < buffers.length; ++i) {
      const buffer = buffers[i];
      if (buffer.uri) {
        const { fetch: fetch2 } = context;
        assert7(fetch2);
        const uri = resolveUrl(buffer.uri, options, context);
        const response = await context?.fetch?.(uri);
        const arrayBuffer = await response?.arrayBuffer?.();
        gltf.buffers[i] = {
          arrayBuffer,
          byteOffset: 0,
          byteLength: arrayBuffer.byteLength
        };
        delete buffer.uri;
      } else if (gltf.buffers[i] === null) {
        gltf.buffers[i] = {
          arrayBuffer: new ArrayBuffer(buffer.byteLength),
          byteOffset: 0,
          byteLength: buffer.byteLength
        };
      }
    }
  }
  async function loadImages(gltf, options, context) {
    const imageIndices = getReferencesImageIndices(gltf);
    const images = gltf.json.images || [];
    const promises = [];
    for (const imageIndex of imageIndices) {
      promises.push(loadImage(gltf, images[imageIndex], imageIndex, options, context));
    }
    return await Promise.all(promises);
  }
  function getReferencesImageIndices(gltf) {
    const imageIndices = /* @__PURE__ */ new Set();
    const textures = gltf.json.textures || [];
    for (const texture of textures) {
      if (texture.source !== void 0) {
        imageIndices.add(texture.source);
      }
    }
    return Array.from(imageIndices).sort();
  }
  async function loadImage(gltf, image, index, options, context) {
    let arrayBuffer;
    if (image.uri && !image.hasOwnProperty("bufferView")) {
      const uri = resolveUrl(image.uri, options, context);
      const { fetch: fetch2 } = context;
      const response = await fetch2(uri);
      arrayBuffer = await response.arrayBuffer();
      image.bufferView = {
        data: arrayBuffer
      };
    }
    if (Number.isFinite(image.bufferView)) {
      const array = getTypedArrayForBufferView(gltf.json, gltf.buffers, image.bufferView);
      arrayBuffer = sliceArrayBuffer(array.buffer, array.byteOffset, array.byteLength);
    }
    assert7(arrayBuffer, "glTF image has no data");
    const gltfOptions = getGLTFImageOptions(options, image.mimeType);
    let parsedImage = await parseFromContext(
      arrayBuffer,
      [ImageLoader, BasisLoader],
      gltfOptions,
      context
    );
    if (parsedImage && parsedImage[0]) {
      parsedImage = {
        compressed: true,
        // @ts-expect-error
        mipmaps: false,
        width: parsedImage[0].width,
        height: parsedImage[0].height,
        data: parsedImage[0]
      };
    }
    gltf.images = gltf.images || [];
    gltf.images[index] = parsedImage;
  }

  // ../gltf/src/gltf-loader.ts
  var GLTFLoader = {
    dataType: null,
    batchType: null,
    name: "glTF",
    id: "gltf",
    module: "gltf",
    version: VERSION6,
    extensions: ["gltf", "glb"],
    mimeTypes: ["model/gltf+json", "model/gltf-binary"],
    text: true,
    binary: true,
    tests: ["glTF"],
    parse: parse2,
    options: {
      gltf: {
        normalize: true,
        // Normalize glTF v1 to glTF v2 format (not yet stable)
        loadBuffers: true,
        // Fetch any linked .BIN buffers, decode base64
        loadImages: true,
        // Create image objects
        decompressMeshes: true
        // Decompress Draco and KHR/EXT meshopt encoded data
      }
    }
  };
  async function parse2(arrayBuffer, options = {}, context) {
    const mergedOptions = { ...GLTFLoader.options, ...options };
    mergedOptions.gltf = { ...GLTFLoader.options.gltf, ...mergedOptions.gltf };
    const byteOffset = options?.glb?.byteOffset || 0;
    const gltf = {};
    return await parseGLTF(gltf, arrayBuffer, byteOffset, mergedOptions, context);
  }

  // ../gltf/src/lib/api/post-process-gltf.ts
  var COMPONENTS2 = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };
  var BYTES2 = {
    5120: 1,
    // BYTE
    5121: 1,
    // UNSIGNED_BYTE
    5122: 2,
    // SHORT
    5123: 2,
    // UNSIGNED_SHORT
    5125: 4,
    // UNSIGNED_INT
    5126: 4
    // FLOAT
  };
  var GL_SAMPLER = {
    // Sampler parameters
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    // Sampler default values
    REPEAT: 10497,
    LINEAR: 9729,
    NEAREST_MIPMAP_LINEAR: 9986
  };
  var SAMPLER_PARAMETER_GLTF_TO_GL = {
    magFilter: GL_SAMPLER.TEXTURE_MAG_FILTER,
    minFilter: GL_SAMPLER.TEXTURE_MIN_FILTER,
    wrapS: GL_SAMPLER.TEXTURE_WRAP_S,
    wrapT: GL_SAMPLER.TEXTURE_WRAP_T
  };
  var DEFAULT_SAMPLER_PARAMETERS = {
    [GL_SAMPLER.TEXTURE_MAG_FILTER]: GL_SAMPLER.LINEAR,
    [GL_SAMPLER.TEXTURE_MIN_FILTER]: GL_SAMPLER.NEAREST_MIPMAP_LINEAR,
    [GL_SAMPLER.TEXTURE_WRAP_S]: GL_SAMPLER.REPEAT,
    [GL_SAMPLER.TEXTURE_WRAP_T]: GL_SAMPLER.REPEAT
  };
  function makeDefaultSampler() {
    return {
      id: "default-sampler",
      parameters: DEFAULT_SAMPLER_PARAMETERS
    };
  }
  function getBytesFromComponentType(componentType) {
    return BYTES2[componentType];
  }
  function getSizeFromAccessorType(type) {
    return COMPONENTS2[type];
  }
  var GLTFPostProcessor = class {
    baseUri = "";
    // @ts-expect-error
    jsonUnprocessed;
    // @ts-expect-error
    json;
    buffers = [];
    images = [];
    postProcess(gltf, options = {}) {
      const { json, buffers = [], images = [] } = gltf;
      const { baseUri = "" } = gltf;
      assert7(json);
      this.baseUri = baseUri;
      this.buffers = buffers;
      this.images = images;
      this.jsonUnprocessed = json;
      this.json = this._resolveTree(gltf.json, options);
      return this.json;
    }
    // Convert indexed glTF structure into tree structure
    // cross-link index resolution, enum lookup, convenience calculations
    // eslint-disable-next-line complexity, max-statements
    _resolveTree(gltf, options = {}) {
      const json = { ...gltf };
      this.json = json;
      if (gltf.bufferViews) {
        json.bufferViews = gltf.bufferViews.map((bufView, i) => this._resolveBufferView(bufView, i));
      }
      if (gltf.images) {
        json.images = gltf.images.map((image, i) => this._resolveImage(image, i));
      }
      if (gltf.samplers) {
        json.samplers = gltf.samplers.map((sampler, i) => this._resolveSampler(sampler, i));
      }
      if (gltf.textures) {
        json.textures = gltf.textures.map((texture, i) => this._resolveTexture(texture, i));
      }
      if (gltf.accessors) {
        json.accessors = gltf.accessors.map((accessor, i) => this._resolveAccessor(accessor, i));
      }
      if (gltf.materials) {
        json.materials = gltf.materials.map((material, i) => this._resolveMaterial(material, i));
      }
      if (gltf.meshes) {
        json.meshes = gltf.meshes.map((mesh, i) => this._resolveMesh(mesh, i));
      }
      if (gltf.nodes) {
        json.nodes = gltf.nodes.map((node, i) => this._resolveNode(node, i));
        json.nodes = json.nodes.map((node, i) => this._resolveNodeChildren(node));
      }
      if (gltf.skins) {
        json.skins = gltf.skins.map((skin, i) => this._resolveSkin(skin, i));
      }
      if (gltf.scenes) {
        json.scenes = gltf.scenes.map((scene, i) => this._resolveScene(scene, i));
      }
      if (typeof this.json.scene === "number" && json.scenes) {
        json.scene = json.scenes[this.json.scene];
      }
      return json;
    }
    getScene(index) {
      return this._get(this.json.scenes, index);
    }
    getNode(index) {
      return this._get(this.json.nodes, index);
    }
    getSkin(index) {
      return this._get(this.json.skins, index);
    }
    getMesh(index) {
      return this._get(this.json.meshes, index);
    }
    getMaterial(index) {
      return this._get(this.json.materials, index);
    }
    getAccessor(index) {
      return this._get(this.json.accessors, index);
    }
    getCamera(index) {
      return this._get(this.json.cameras, index);
    }
    getTexture(index) {
      return this._get(this.json.textures, index);
    }
    getSampler(index) {
      return this._get(this.json.samplers, index);
    }
    getImage(index) {
      return this._get(this.json.images, index);
    }
    getBufferView(index) {
      return this._get(this.json.bufferViews, index);
    }
    getBuffer(index) {
      return this._get(this.json.buffers, index);
    }
    _get(array, index) {
      if (typeof index === "object") {
        return index;
      }
      const object = array && array[index];
      if (!object) {
        console.warn(`glTF file error: Could not find ${array}[${index}]`);
      }
      return object;
    }
    // PARSING HELPERS
    _resolveScene(scene, index) {
      return {
        ...scene,
        // @ts-ignore
        id: scene.id || `scene-${index}`,
        nodes: (scene.nodes || []).map((node) => this.getNode(node))
      };
    }
    _resolveNode(gltfNode, index) {
      const node = {
        ...gltfNode,
        // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: gltfNode?.id || `node-${index}`
      };
      if (gltfNode.mesh !== void 0) {
        node.mesh = this.getMesh(gltfNode.mesh);
      }
      if (gltfNode.camera !== void 0) {
        node.camera = this.getCamera(gltfNode.camera);
      }
      if (gltfNode.skin !== void 0) {
        node.skin = this.getSkin(gltfNode.skin);
      }
      if (gltfNode.meshes !== void 0 && gltfNode.meshes.length) {
        node.mesh = gltfNode.meshes.reduce(
          (accum, meshIndex) => {
            const mesh = this.getMesh(meshIndex);
            accum.id = mesh.id;
            accum.primitives = accum.primitives.concat(mesh.primitives);
            return accum;
          },
          { primitives: [] }
        );
      }
      return node;
    }
    _resolveNodeChildren(node) {
      if (node.children) {
        node.children = node.children.map((child) => this.getNode(child));
      }
      return node;
    }
    _resolveSkin(gltfSkin, index) {
      const inverseBindMatrices = typeof gltfSkin.inverseBindMatrices === "number" ? this.getAccessor(gltfSkin.inverseBindMatrices) : void 0;
      return {
        ...gltfSkin,
        id: gltfSkin.id || `skin-${index}`,
        inverseBindMatrices
      };
    }
    _resolveMesh(gltfMesh, index) {
      const mesh = {
        ...gltfMesh,
        id: gltfMesh.id || `mesh-${index}`,
        primitives: []
      };
      if (gltfMesh.primitives) {
        mesh.primitives = gltfMesh.primitives.map((gltfPrimitive, primitiveIndex) => {
          const primitive = {
            ...gltfPrimitive,
            attributes: {},
            indices: void 0,
            material: void 0
          };
          const attributes = gltfPrimitive.attributes;
          for (const attribute in attributes) {
            primitive.attributes[attribute] = this.getAccessor(attributes[attribute]);
          }
          if (gltfPrimitive.indices !== void 0) {
            primitive.indices = this.getAccessor(gltfPrimitive.indices);
          }
          if (gltfPrimitive.material !== void 0) {
            primitive.material = this.getMaterial(gltfPrimitive.material);
          }
          return normalizePrimitiveTopology(primitive, mesh.id, primitiveIndex);
        });
      }
      return mesh;
    }
    _resolveMaterial(gltfMaterial, index) {
      const material = {
        ...gltfMaterial,
        // @ts-expect-error
        id: gltfMaterial.id || `material-${index}`
      };
      if (material.normalTexture) {
        material.normalTexture = { ...material.normalTexture };
        material.normalTexture.texture = this.getTexture(material.normalTexture.index);
      }
      if (material.occlusionTexture) {
        material.occlusionTexture = { ...material.occlusionTexture };
        material.occlusionTexture.texture = this.getTexture(material.occlusionTexture.index);
      }
      if (material.emissiveTexture) {
        material.emissiveTexture = { ...material.emissiveTexture };
        material.emissiveTexture.texture = this.getTexture(material.emissiveTexture.index);
      }
      if (!material.emissiveFactor) {
        material.emissiveFactor = material.emissiveTexture ? [1, 1, 1] : [0, 0, 0];
      }
      if (material.pbrMetallicRoughness) {
        material.pbrMetallicRoughness = { ...material.pbrMetallicRoughness };
        const mr = material.pbrMetallicRoughness;
        if (mr.baseColorTexture) {
          mr.baseColorTexture = { ...mr.baseColorTexture };
          mr.baseColorTexture.texture = this.getTexture(mr.baseColorTexture.index);
        }
        if (mr.metallicRoughnessTexture) {
          mr.metallicRoughnessTexture = { ...mr.metallicRoughnessTexture };
          mr.metallicRoughnessTexture.texture = this.getTexture(mr.metallicRoughnessTexture.index);
        }
      }
      return material;
    }
    _resolveAccessor(gltfAccessor, index) {
      const bytesPerComponent = getBytesFromComponentType(gltfAccessor.componentType);
      const components = getSizeFromAccessorType(gltfAccessor.type);
      const bytesPerElement = bytesPerComponent * components;
      const accessor = {
        ...gltfAccessor,
        // @ts-expect-error
        id: gltfAccessor.id || `accessor-${index}`,
        bytesPerComponent,
        components,
        bytesPerElement,
        value: void 0,
        bufferView: void 0,
        sparse: void 0
      };
      if (gltfAccessor.bufferView !== void 0) {
        accessor.bufferView = this.getBufferView(gltfAccessor.bufferView);
      }
      if (accessor.bufferView) {
        const buffer = accessor.bufferView.buffer;
        const { ArrayType, byteLength } = getAccessorArrayTypeAndLength(accessor, accessor.bufferView);
        const byteOffset = (accessor.bufferView.byteOffset || 0) + (accessor.byteOffset || 0) + buffer.byteOffset;
        let cutBuffer = copyToArrayBuffer2(buffer.arrayBuffer, byteOffset, byteLength);
        if (accessor.bufferView.byteStride) {
          cutBuffer = this._getValueFromInterleavedBuffer(
            buffer,
            byteOffset,
            accessor.bufferView.byteStride,
            accessor.bytesPerElement,
            accessor.count
          );
        }
        accessor.value = new ArrayType(cutBuffer);
      } else {
        const { ArrayType } = getAccessorArrayTypeAndLength(accessor, {
          byteLength: accessor.count * accessor.bytesPerElement
        });
        accessor.value = new ArrayType(accessor.count * accessor.components);
      }
      if (gltfAccessor.sparse) {
        this._applySparseAccessor(accessor, gltfAccessor.sparse);
      }
      return accessor;
    }
    /** Applies sparse accessor replacements to an accessor's materialized values. */
    _applySparseAccessor(accessor, sparse) {
      const SparseIndexArray = getSparseIndexArrayType(sparse.indices.componentType);
      const sparseIndices = this._getTypedArrayFromBufferView(
        SparseIndexArray,
        this.getBufferView(sparse.indices.bufferView),
        sparse.indices.byteOffset || 0,
        sparse.count
      );
      const SparseValueArray = accessor.value.constructor;
      const sparseValues = this._getTypedArrayFromBufferView(
        SparseValueArray,
        this.getBufferView(sparse.values.bufferView),
        sparse.values.byteOffset || 0,
        sparse.count * accessor.components
      );
      for (let sparseValueIndex = 0; sparseValueIndex < sparse.count; sparseValueIndex++) {
        const accessorIndex = Number(sparseIndices[sparseValueIndex]);
        assert7(
          Number.isInteger(accessorIndex) && accessorIndex >= 0 && accessorIndex < accessor.count,
          "glTF sparse accessor index is out of bounds"
        );
        for (let componentIndex = 0; componentIndex < accessor.components; componentIndex++) {
          const targetIndex = accessorIndex * accessor.components + componentIndex;
          const sourceIndex = sparseValueIndex * accessor.components + componentIndex;
          Reflect.set(accessor.value, targetIndex, sparseValues[sourceIndex]);
        }
      }
    }
    /** Creates a typed array from a byte range within a resolved buffer view. */
    _getTypedArrayFromBufferView(ArrayType, bufferView, byteOffset, length4) {
      const byteLength = length4 * ArrayType.BYTES_PER_ELEMENT;
      assert7(
        byteOffset + byteLength <= bufferView.byteLength,
        "glTF sparse accessor data exceeds its buffer view"
      );
      const buffer = bufferView.buffer;
      const absoluteByteOffset = buffer.byteOffset + (bufferView.byteOffset || 0) + byteOffset;
      const arrayBuffer = copyToArrayBuffer2(buffer.arrayBuffer, absoluteByteOffset, byteLength);
      return new ArrayType(arrayBuffer);
    }
    /**
     * Take values of particular accessor from interleaved buffer
     * various parts of the buffer
     * @param buffer
     * @param byteOffset
     * @param byteStride
     * @param bytesPerElement
     * @param count
     * @returns
     */
    _getValueFromInterleavedBuffer(buffer, byteOffset, byteStride, bytesPerElement, count) {
      const result = new Uint8Array(count * bytesPerElement);
      for (let i = 0; i < count; i++) {
        const elementOffset = byteOffset + i * byteStride;
        result.set(
          new Uint8Array(buffer.arrayBuffer.slice(elementOffset, elementOffset + bytesPerElement)),
          i * bytesPerElement
        );
      }
      return result.buffer;
    }
    _resolveTexture(gltfTexture, index) {
      return {
        ...gltfTexture,
        // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: gltfTexture.id || `texture-${index}`,
        sampler: typeof gltfTexture.sampler === "number" ? this.getSampler(gltfTexture.sampler) : makeDefaultSampler(),
        source: typeof gltfTexture.source === "number" ? this.getImage(gltfTexture.source) : void 0
      };
    }
    _resolveSampler(gltfSampler, index) {
      const sampler = {
        // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: gltfSampler.id || `sampler-${index}`,
        ...gltfSampler,
        parameters: {}
      };
      for (const key in sampler) {
        const glEnum = this._enumSamplerParameter(key);
        if (glEnum !== void 0) {
          sampler.parameters[glEnum] = sampler[key];
        }
      }
      return sampler;
    }
    _enumSamplerParameter(key) {
      return SAMPLER_PARAMETER_GLTF_TO_GL[key];
    }
    _resolveImage(gltfImage, index) {
      const image = {
        ...gltfImage,
        // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: gltfImage.id || `image-${index}`,
        image: null,
        bufferView: gltfImage.bufferView !== void 0 ? this.getBufferView(gltfImage.bufferView) : void 0
      };
      const preloadedImage = this.images[index];
      if (preloadedImage) {
        image.image = preloadedImage;
      }
      return image;
    }
    _resolveBufferView(gltfBufferView, index) {
      const bufferIndex = gltfBufferView.buffer;
      const arrayBuffer = this.buffers[bufferIndex].arrayBuffer;
      let byteOffset = this.buffers[bufferIndex].byteOffset || 0;
      if (gltfBufferView.byteOffset) {
        byteOffset += gltfBufferView.byteOffset;
      }
      const bufferView = {
        // // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: `bufferView-${index}`,
        ...gltfBufferView,
        // ...this.buffers[bufferIndex],
        buffer: this.buffers[bufferIndex],
        data: new Uint8Array(arrayBuffer, byteOffset, gltfBufferView.byteLength)
      };
      return bufferView;
    }
    _resolveCamera(gltfCamera, index) {
      const camera = {
        ...gltfCamera,
        // @ts-expect-error id could already be present, glTF standard does not prevent it
        id: gltfCamera.id || `camera-${index}`
      };
      if (camera.perspective) {
      }
      if (camera.orthographic) {
      }
      return camera;
    }
  };
  function normalizePrimitiveTopology(primitive, meshId, primitiveIndex) {
    if (primitive.mode !== 2 && primitive.mode !== 6) {
      return primitive;
    }
    const sourceIndices = primitive.indices?.value;
    const sourceIndexCount = primitive.indices?.count ?? getPrimitiveVertexCount(primitive);
    const maximumIndex = getMaximumIndex(sourceIndices, sourceIndexCount);
    const IndexArray = maximumIndex <= 65535 ? Uint16Array : Uint32Array;
    const generatedIndices = primitive.mode === 2 ? createLineLoopIndices(sourceIndices, sourceIndexCount, IndexArray) : createTriangleFanIndices(sourceIndices, sourceIndexCount, IndexArray);
    primitive.mode = primitive.mode === 2 ? 1 : 4;
    primitive.indices = {
      id: `${meshId}-primitive-${primitiveIndex}-portable-indices`,
      components: 1,
      bytesPerComponent: IndexArray.BYTES_PER_ELEMENT,
      bytesPerElement: IndexArray.BYTES_PER_ELEMENT,
      componentType: IndexArray === Uint16Array ? 5123 : 5125,
      normalized: false,
      count: generatedIndices.length,
      type: "SCALAR",
      min: generatedIndices.length ? [getMinimumIndex(generatedIndices)] : void 0,
      max: generatedIndices.length ? [maximumIndex] : void 0,
      value: generatedIndices
    };
    return primitive;
  }
  function getSparseIndexArrayType(componentType) {
    switch (componentType) {
      case 5121:
        return Uint8Array;
      case 5123:
        return Uint16Array;
      case 5125:
        return Uint32Array;
      default:
        throw new Error(`Invalid glTF sparse index component type ${componentType}`);
    }
  }
  function getPrimitiveVertexCount(primitive) {
    const attribute = Object.values(primitive.attributes)[0];
    assert7(attribute, "glTF primitive must define at least one attribute");
    return attribute.count;
  }
  function getMaximumIndex(indices, indexCount) {
    if (!indices) {
      return Math.max(0, indexCount - 1);
    }
    let maximumIndex = 0;
    for (let index = 0; index < indexCount; index++) {
      maximumIndex = Math.max(maximumIndex, Number(indices[index]));
    }
    return maximumIndex;
  }
  function getMinimumIndex(indices) {
    let minimumIndex = Infinity;
    for (const index of indices) {
      minimumIndex = Math.min(minimumIndex, index);
    }
    return minimumIndex;
  }
  function getSourceIndex(indices, index) {
    return indices ? Number(indices[index]) : index;
  }
  function createLineLoopIndices(sourceIndices, sourceIndexCount, IndexArray) {
    if (sourceIndexCount < 2) {
      return new IndexArray(0);
    }
    const generatedIndices = new IndexArray(sourceIndexCount * 2);
    for (let sourceIndex = 0; sourceIndex < sourceIndexCount; sourceIndex++) {
      generatedIndices[sourceIndex * 2] = getSourceIndex(sourceIndices, sourceIndex);
      generatedIndices[sourceIndex * 2 + 1] = getSourceIndex(
        sourceIndices,
        (sourceIndex + 1) % sourceIndexCount
      );
    }
    return generatedIndices;
  }
  function createTriangleFanIndices(sourceIndices, sourceIndexCount, IndexArray) {
    const triangleCount = Math.max(0, sourceIndexCount - 2);
    const generatedIndices = new IndexArray(triangleCount * 3);
    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex++) {
      generatedIndices[triangleIndex * 3] = getSourceIndex(sourceIndices, 0);
      generatedIndices[triangleIndex * 3 + 1] = getSourceIndex(sourceIndices, triangleIndex + 1);
      generatedIndices[triangleIndex * 3 + 2] = getSourceIndex(sourceIndices, triangleIndex + 2);
    }
    return generatedIndices;
  }
  function postProcessGLTF(gltf, options) {
    return new GLTFPostProcessor().postProcess(gltf, options);
  }

  // src/lib/parsers/helpers/parse-3d-tile-gltf-view.ts
  var GLTF_FORMAT = {
    URI: 0,
    EMBEDDED: 1
  };
  function parse3DTileGLTFViewSync(tile, arrayBuffer, byteOffset, options) {
    tile.rotateYtoZ = true;
    const gltfByteLength = (tile.byteOffset || 0) + (tile.byteLength || 0) - byteOffset;
    if (gltfByteLength === 0) {
      throw new Error("glTF byte length must be greater than 0.");
    }
    tile.gltfUpAxis = options?.["3d-tiles"] && options["3d-tiles"].assetGltfUpAxis ? options["3d-tiles"].assetGltfUpAxis : "Y";
    tile.gltfArrayBuffer = sliceArrayBuffer(arrayBuffer, byteOffset, gltfByteLength);
    tile.gltfByteOffset = 0;
    tile.gltfByteLength = gltfByteLength;
    if (byteOffset % 4 === 0) {
    } else {
      console.warn(`${tile.type}: embedded glb is not aligned to a 4-byte boundary.`);
    }
    return (tile.byteOffset || 0) + (tile.byteLength || 0);
  }
  async function extractGLTF(tile, gltfFormat, options, context) {
    const tile3DOptions = options?.["3d-tiles"] || {};
    extractGLTFBufferOrURL(tile, gltfFormat, options);
    if (tile3DOptions.loadGLTF) {
      if (!context) {
        return;
      }
      if (tile.gltfUrl) {
        const { fetch: fetch2 } = context;
        const response = await fetch2(tile.gltfUrl, options?.core);
        tile.gltfArrayBuffer = await response.arrayBuffer();
        tile.gltfByteOffset = 0;
      }
      if (tile.gltfArrayBuffer) {
        const gltfWithBuffers = await parseFromContext(
          tile.gltfArrayBuffer,
          GLTFLoader,
          options,
          context
        );
        tile.gltf = postProcessGLTF(gltfWithBuffers);
        tile.gpuMemoryUsageInBytes = getMemoryUsageGLTF(tile.gltf);
        delete tile.gltfArrayBuffer;
        delete tile.gltfByteOffset;
        delete tile.gltfByteLength;
      }
    }
  }
  function extractGLTFBufferOrURL(tile, gltfFormat, options) {
    switch (gltfFormat) {
      case GLTF_FORMAT.URI:
        if (tile.gltfArrayBuffer) {
          const gltfUrlBytes = new Uint8Array(tile.gltfArrayBuffer, tile.gltfByteOffset);
          const textDecoder = new TextDecoder();
          const gltfUrl = textDecoder.decode(gltfUrlBytes);
          tile.gltfUrl = gltfUrl.replace(/[\s\0]+$/, "");
        }
        delete tile.gltfArrayBuffer;
        delete tile.gltfByteOffset;
        delete tile.gltfByteLength;
        break;
      case GLTF_FORMAT.EMBEDDED:
        break;
      default:
        throw new Error("b3dm: Illegal glTF format field");
    }
  }

  // src/lib/parsers/parse-3d-tile-batched-model.ts
  async function parseBatchedModel3DTile(tile, arrayBuffer, byteOffset, options, context) {
    byteOffset = parseBatchedModel(tile, arrayBuffer, byteOffset, options, context);
    await extractGLTF(tile, GLTF_FORMAT.EMBEDDED, options, context);
    const extensions = tile?.gltf?.extensions;
    if (extensions && extensions.CESIUM_RTC) {
      tile.rtcCenter = extensions.CESIUM_RTC.center;
    }
    return byteOffset;
  }
  function parseBatchedModel(tile, arrayBuffer, byteOffset, options, context) {
    byteOffset = parse3DTileHeaderSync(tile, arrayBuffer, byteOffset);
    byteOffset = parse3DTileTablesHeaderSync(tile, arrayBuffer, byteOffset);
    byteOffset = parse3DTileTablesSync(tile, arrayBuffer, byteOffset, options);
    byteOffset = parse3DTileGLTFViewSync(tile, arrayBuffer, byteOffset, options);
    const featureTable = new Tile3DFeatureTable(tile.featureTableJson, tile.featureTableBinary);
    tile.rtcCenter = featureTable.getGlobalProperty("RTC_CENTER", GL2.FLOAT, 3);
    return byteOffset;
  }

  // src/lib/parsers/parse-3d-tile-instanced-model.ts
  async function parseInstancedModel3DTile(tile, arrayBuffer, byteOffset, options, context) {
    byteOffset = parseInstancedModel(tile, arrayBuffer, byteOffset, options, context);
    await extractGLTF(tile, tile.gltfFormat || 0, options, context);
    return byteOffset;
  }
  function parseInstancedModel(tile, arrayBuffer, byteOffset, options, context) {
    byteOffset = parse3DTileHeaderSync(tile, arrayBuffer, byteOffset);
    if (tile.version !== 1) {
      throw new Error(`Instanced 3D Model version ${tile.version} is not supported`);
    }
    byteOffset = parse3DTileTablesHeaderSync(tile, arrayBuffer, byteOffset);
    const view = new DataView(arrayBuffer);
    tile.gltfFormat = view.getUint32(byteOffset, true);
    byteOffset += 4;
    byteOffset = parse3DTileTablesSync(tile, arrayBuffer, byteOffset, options);
    byteOffset = parse3DTileGLTFViewSync(tile, arrayBuffer, byteOffset, options);
    if (!tile?.header?.featureTableJsonByteLength || tile.header.featureTableJsonByteLength === 0) {
      throw new Error("i3dm parser: featureTableJsonByteLength is zero.");
    }
    const featureTable = new Tile3DFeatureTable(tile.featureTableJson, tile.featureTableBinary);
    const instancesLength = featureTable.getGlobalProperty("INSTANCES_LENGTH");
    featureTable.featuresLength = instancesLength;
    if (!Number.isFinite(instancesLength)) {
      throw new Error("i3dm parser: INSTANCES_LENGTH must be defined");
    }
    tile.eastNorthUp = featureTable.getGlobalProperty("EAST_NORTH_UP");
    tile.rtcCenter = featureTable.getGlobalProperty("RTC_CENTER", GL2.FLOAT, 3);
    const batchTable = new Tile3DBatchTableParser(
      tile.batchTableJson,
      tile.batchTableBinary,
      instancesLength
    );
    extractInstancedAttributes(tile, featureTable, batchTable, instancesLength);
    return byteOffset;
  }
  function extractInstancedAttributes(tile, featureTable, batchTable, instancesLength) {
    const instances = new Array(instancesLength);
    const instancePosition = new Vector3();
    const instanceNormalRight = new Vector3();
    const instanceNormalUp = new Vector3();
    const instanceNormalForward = new Vector3();
    const instanceRotation = new Matrix3();
    const instanceQuaternion = new Quaternion();
    const instanceScale = new Vector3();
    const instanceTranslationRotationScale = {};
    const instanceTransform = new Matrix4();
    const scratch1 = [];
    const scratch2 = [];
    const scratch3 = [];
    const scratch4 = [];
    for (let i = 0; i < instancesLength; i++) {
      let position;
      if (featureTable.hasProperty("POSITION")) {
        position = featureTable.getProperty("POSITION", GL2.FLOAT, 3, i, instancePosition);
      } else if (featureTable.hasProperty("POSITION_QUANTIZED")) {
        position = featureTable.getProperty(
          "POSITION_QUANTIZED",
          GL2.UNSIGNED_SHORT,
          3,
          i,
          instancePosition
        );
        const quantizedVolumeOffset = featureTable.getGlobalProperty(
          "QUANTIZED_VOLUME_OFFSET",
          GL2.FLOAT,
          3
        );
        if (!quantizedVolumeOffset) {
          throw new Error(
            "i3dm parser: QUANTIZED_VOLUME_OFFSET must be defined for quantized positions."
          );
        }
        const quantizedVolumeScale = featureTable.getGlobalProperty(
          "QUANTIZED_VOLUME_SCALE",
          GL2.FLOAT,
          3
        );
        if (!quantizedVolumeScale) {
          throw new Error(
            "i3dm parser: QUANTIZED_VOLUME_SCALE must be defined for quantized positions."
          );
        }
        const MAX_UNSIGNED_SHORT = 65535;
        for (let j = 0; j < 3; j++) {
          position[j] = position[j] / MAX_UNSIGNED_SHORT * quantizedVolumeScale[j] + quantizedVolumeOffset[j];
        }
      }
      if (!position) {
        throw new Error("i3dm: POSITION or POSITION_QUANTIZED must be defined for each instance.");
      }
      instancePosition.copy(position);
      instanceTranslationRotationScale.translation = instancePosition;
      tile.normalUp = featureTable.getProperty("NORMAL_UP", GL2.FLOAT, 3, i, scratch1);
      tile.normalRight = featureTable.getProperty("NORMAL_RIGHT", GL2.FLOAT, 3, i, scratch2);
      const hasCustomOrientation = false;
      if (tile.normalUp) {
        if (!tile.normalRight) {
          throw new Error("i3dm: Custom orientation requires both NORMAL_UP and NORMAL_RIGHT.");
        }
        tile.hasCustomOrientation = true;
      } else {
        tile.octNormalUp = featureTable.getProperty(
          "NORMAL_UP_OCT32P",
          GL2.UNSIGNED_SHORT,
          2,
          i,
          scratch1
        );
        tile.octNormalRight = featureTable.getProperty(
          "NORMAL_RIGHT_OCT32P",
          GL2.UNSIGNED_SHORT,
          2,
          i,
          scratch2
        );
        if (tile.octNormalUp) {
          if (!tile.octNormalRight) {
            throw new Error(
              "i3dm: oct-encoded orientation requires NORMAL_UP_OCT32P and NORMAL_RIGHT_OCT32P"
            );
          }
          throw new Error("i3dm: oct-encoded orientation not implemented");
        } else if (tile.eastNorthUp) {
          Ellipsoid.WGS84.eastNorthUpToFixedFrame(instancePosition, instanceTransform);
          instanceTransform.getRotationMatrix3(instanceRotation);
        } else {
          instanceRotation.identity();
        }
      }
      if (hasCustomOrientation) {
        instanceNormalForward.copy(instanceNormalRight).cross(instanceNormalUp).normalize();
        instanceRotation.setColumn(0, instanceNormalRight);
        instanceRotation.setColumn(1, instanceNormalUp);
        instanceRotation.setColumn(2, instanceNormalForward);
      }
      instanceQuaternion.fromMatrix3(instanceRotation);
      instanceTranslationRotationScale.rotation = instanceQuaternion;
      instanceScale.set(1, 1, 1);
      const scale6 = featureTable.getProperty("SCALE", GL2.FLOAT, 1, i, scratch3);
      if (Number.isFinite(scale6)) {
        instanceScale.multiplyByScalar(scale6);
      }
      const nonUniformScale = featureTable.getProperty("SCALE_NON_UNIFORM", GL2.FLOAT, 3, i, scratch1);
      if (nonUniformScale) {
        instanceScale.scale(nonUniformScale);
      }
      instanceTranslationRotationScale.scale = instanceScale;
      let batchId = featureTable.getProperty("BATCH_ID", GL2.UNSIGNED_SHORT, 1, i, scratch4);
      if (batchId === void 0) {
        batchId = i;
      }
      const rotationMatrix = new Matrix4().fromQuaternion(instanceTranslationRotationScale.rotation);
      instanceTransform.identity();
      instanceTransform.translate(instanceTranslationRotationScale.translation);
      instanceTransform.multiplyRight(rotationMatrix);
      instanceTransform.scale(instanceTranslationRotationScale.scale);
      const modelMatrix = instanceTransform.clone();
      instances[i] = {
        modelMatrix,
        batchId
      };
    }
    tile.instances = instances;
  }

  // src/lib/parsers/parse-3d-tile-composite.ts
  async function parseComposite3DTile(tile, arrayBuffer, byteOffset, options, context, parse3DTile2) {
    byteOffset = parse3DTileHeaderSync(tile, arrayBuffer, byteOffset);
    const view = new DataView(arrayBuffer);
    tile.tilesLength = view.getUint32(byteOffset, true);
    byteOffset += 4;
    tile.tiles = [];
    while (tile.tiles.length < tile.tilesLength && (tile.byteLength || 0) - byteOffset > 12) {
      const subtile = { shape: "tile3d" };
      tile.tiles.push(subtile);
      byteOffset = await parse3DTile2(arrayBuffer, byteOffset, options, context, subtile);
    }
    return byteOffset;
  }

  // src/lib/parsers/parse-3d-tile-gltf.ts
  async function parseGltf3DTile(tile, arrayBuffer, options, context) {
    tile.rotateYtoZ = true;
    tile.gltfUpAxis = options?.["3d-tiles"]?.assetGltfUpAxis ? options["3d-tiles"].assetGltfUpAxis : "Y";
    if (options?.["3d-tiles"]?.loadGLTF) {
      if (!context) {
        return arrayBuffer.byteLength;
      }
      const gltfWithBuffers = await parseFromContext(arrayBuffer, GLTFLoader, options, context);
      tile.gltf = postProcessGLTF(gltfWithBuffers);
      tile.gpuMemoryUsageInBytes = getMemoryUsageGLTF(tile.gltf);
    } else {
      tile.gltfArrayBuffer = arrayBuffer;
    }
    return arrayBuffer.byteLength;
  }

  // src/lib/parsers/parse-3d-tile.ts
  async function parse3DTile(arrayBuffer, byteOffset = 0, options, context, tile = { shape: "tile3d" }) {
    tile.byteOffset = byteOffset;
    tile.type = getMagicString2(arrayBuffer, byteOffset);
    switch (tile.type) {
      case TILE3D_TYPE.COMPOSITE:
        return await parseComposite3DTile(
          tile,
          arrayBuffer,
          byteOffset,
          options,
          context,
          parse3DTile
        );
      case TILE3D_TYPE.BATCHED_3D_MODEL:
        return await parseBatchedModel3DTile(tile, arrayBuffer, byteOffset, options, context);
      case TILE3D_TYPE.GLTF:
        return await parseGltf3DTile(tile, arrayBuffer, options, context);
      case TILE3D_TYPE.INSTANCED_3D_MODEL:
        return await parseInstancedModel3DTile(tile, arrayBuffer, byteOffset, options, context);
      case TILE3D_TYPE.POINT_CLOUD:
        return await parsePointCloud3DTile(tile, arrayBuffer, byteOffset, options, context);
      default:
        throw new Error(`3DTileLoader: unknown type ${tile.type}`);
    }
  }

  // src/lib/parsers/helpers/parse-3d-tile-subtree.ts
  var SUBTREE_FILE_MAGIC = 1952609651;
  var SUBTREE_FILE_VERSION = 1;
  async function parse3DTilesSubtree(data, options, context) {
    const magic = new Uint32Array(data.slice(0, 4));
    if (magic[0] !== SUBTREE_FILE_MAGIC) {
      throw new Error("Wrong subtree file magic number");
    }
    const version = new Uint32Array(data.slice(4, 8));
    if (version[0] !== SUBTREE_FILE_VERSION) {
      throw new Error("Wrong subtree file verson, must be 1");
    }
    const jsonByteLength = parseUint64Value(data.slice(8, 16));
    const stringAttribute = new Uint8Array(data, 24, jsonByteLength);
    const textDecoder = new TextDecoder("utf8");
    const string = textDecoder.decode(stringAttribute);
    const subtree = JSON.parse(string);
    const binaryByteLength = parseUint64Value(data.slice(16, 24));
    let internalBinaryBuffer = new ArrayBuffer(0);
    if (binaryByteLength) {
      internalBinaryBuffer = data.slice(24 + jsonByteLength);
    }
    await loadExplicitBitstream(subtree, subtree.tileAvailability, internalBinaryBuffer, context);
    if (Array.isArray(subtree.contentAvailability)) {
      for (const contentAvailability of subtree.contentAvailability) {
        await loadExplicitBitstream(subtree, contentAvailability, internalBinaryBuffer, context);
      }
    } else {
      await loadExplicitBitstream(
        subtree,
        subtree.contentAvailability,
        internalBinaryBuffer,
        context
      );
    }
    await loadExplicitBitstream(
      subtree,
      subtree.childSubtreeAvailability,
      internalBinaryBuffer,
      context
    );
    return subtree;
  }
  async function loadExplicitBitstream(subtree, availabilityObject, internalBinaryBuffer, context) {
    const bufferViewIndex = Number.isFinite(availabilityObject.bitstream) ? availabilityObject.bitstream : availabilityObject.bufferView;
    if (typeof bufferViewIndex !== "number") {
      return;
    }
    const bufferView = subtree.bufferViews[bufferViewIndex];
    const buffer = subtree.buffers[bufferView.buffer];
    if (!context?.baseUrl) {
      throw new Error("Url is not provided");
    }
    if (!context.fetch) {
      throw new Error("fetch is not provided");
    }
    if (buffer.uri) {
      const bufferUri = `${context?.baseUrl || ""}/${buffer.uri}`;
      const response = await context.fetch(bufferUri);
      const data = await response.arrayBuffer();
      availabilityObject.explicitBitstream = new Uint8Array(
        data,
        bufferView.byteOffset,
        bufferView.byteLength
      );
      return;
    }
    const bufferStart = subtree.buffers.slice(0, bufferView.buffer).reduce((offset, buf) => offset + buf.byteLength, 0);
    availabilityObject.explicitBitstream = new Uint8Array(
      internalBinaryBuffer.slice(bufferStart, bufferStart + buffer.byteLength),
      bufferView.byteOffset,
      bufferView.byteLength
    );
  }
  function parseUint64Value(buffer) {
    const dataView = new DataView(buffer);
    const left = dataView.getUint32(0, true);
    const right = dataView.getUint32(4, true);
    return left + 2 ** 32 * right;
  }

  // src/tile-3d-subtree-loader.ts
  var Tile3DSubtreeLoader = {
    dataType: null,
    batchType: null,
    id: "3d-tiles-subtree",
    name: "3D Tiles Subtree",
    module: "3d-tiles",
    version: VERSION3,
    extensions: ["subtree"],
    mimeTypes: ["application/octet-stream"],
    tests: ["subtree"],
    parse: parse3DTilesSubtree,
    options: {}
  };

  // src/lib/parsers/parse-3d-tile-header.ts
  var import_core23 = __toESM(require_core(), 1);

  // src/lib/parsers/helpers/parse-3d-implicit-tiles.ts
  var import_core22 = __toESM(require_core(), 1);

  // ../../node_modules/long/index.js
  var wasm = null;
  try {
    wasm = new WebAssembly.Instance(
      new WebAssembly.Module(
        new Uint8Array([
          // \0asm
          0,
          97,
          115,
          109,
          // version 1
          1,
          0,
          0,
          0,
          // section "type"
          1,
          13,
          2,
          // 0, () => i32
          96,
          0,
          1,
          127,
          // 1, (i32, i32, i32, i32) => i32
          96,
          4,
          127,
          127,
          127,
          127,
          1,
          127,
          // section "function"
          3,
          7,
          6,
          // 0, type 0
          0,
          // 1, type 1
          1,
          // 2, type 1
          1,
          // 3, type 1
          1,
          // 4, type 1
          1,
          // 5, type 1
          1,
          // section "global"
          6,
          6,
          1,
          // 0, "high", mutable i32
          127,
          1,
          65,
          0,
          11,
          // section "export"
          7,
          50,
          6,
          // 0, "mul"
          3,
          109,
          117,
          108,
          0,
          1,
          // 1, "div_s"
          5,
          100,
          105,
          118,
          95,
          115,
          0,
          2,
          // 2, "div_u"
          5,
          100,
          105,
          118,
          95,
          117,
          0,
          3,
          // 3, "rem_s"
          5,
          114,
          101,
          109,
          95,
          115,
          0,
          4,
          // 4, "rem_u"
          5,
          114,
          101,
          109,
          95,
          117,
          0,
          5,
          // 5, "get_high"
          8,
          103,
          101,
          116,
          95,
          104,
          105,
          103,
          104,
          0,
          0,
          // section "code"
          10,
          191,
          1,
          6,
          // 0, "get_high"
          4,
          0,
          35,
          0,
          11,
          // 1, "mul"
          36,
          1,
          1,
          126,
          32,
          0,
          173,
          32,
          1,
          173,
          66,
          32,
          134,
          132,
          32,
          2,
          173,
          32,
          3,
          173,
          66,
          32,
          134,
          132,
          126,
          34,
          4,
          66,
          32,
          135,
          167,
          36,
          0,
          32,
          4,
          167,
          11,
          // 2, "div_s"
          36,
          1,
          1,
          126,
          32,
          0,
          173,
          32,
          1,
          173,
          66,
          32,
          134,
          132,
          32,
          2,
          173,
          32,
          3,
          173,
          66,
          32,
          134,
          132,
          127,
          34,
          4,
          66,
          32,
          135,
          167,
          36,
          0,
          32,
          4,
          167,
          11,
          // 3, "div_u"
          36,
          1,
          1,
          126,
          32,
          0,
          173,
          32,
          1,
          173,
          66,
          32,
          134,
          132,
          32,
          2,
          173,
          32,
          3,
          173,
          66,
          32,
          134,
          132,
          128,
          34,
          4,
          66,
          32,
          135,
          167,
          36,
          0,
          32,
          4,
          167,
          11,
          // 4, "rem_s"
          36,
          1,
          1,
          126,
          32,
          0,
          173,
          32,
          1,
          173,
          66,
          32,
          134,
          132,
          32,
          2,
          173,
          32,
          3,
          173,
          66,
          32,
          134,
          132,
          129,
          34,
          4,
          66,
          32,
          135,
          167,
          36,
          0,
          32,
          4,
          167,
          11,
          // 5, "rem_u"
          36,
          1,
          1,
          126,
          32,
          0,
          173,
          32,
          1,
          173,
          66,
          32,
          134,
          132,
          32,
          2,
          173,
          32,
          3,
          173,
          66,
          32,
          134,
          132,
          130,
          34,
          4,
          66,
          32,
          135,
          167,
          36,
          0,
          32,
          4,
          167,
          11
        ])
      ),
      {}
    ).exports;
  } catch {
  }
  function Long(low, high, unsigned) {
    this.low = low | 0;
    this.high = high | 0;
    this.unsigned = !!unsigned;
  }
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", { value: true });
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  Long.isLong = isLong;
  var INT_CACHE = {};
  var UINT_CACHE = {};
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
    if (unsigned) {
      value >>>= 0;
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj)
          return cachedObj;
      }
      obj = fromBits(value, 0, true);
      if (cache)
        UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj)
          return cachedObj;
      }
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache)
        INT_CACHE[value] = obj;
      return obj;
    }
  }
  Long.fromInt = fromInt;
  function fromNumber(value, unsigned) {
    if (isNaN(value))
      return unsigned ? UZERO : ZERO4;
    if (unsigned) {
      if (value < 0)
        return UZERO;
      if (value >= TWO_PWR_64_DBL)
        return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL)
        return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL)
        return MAX_VALUE;
    }
    if (value < 0)
      return fromNumber(-value, unsigned).neg();
    return fromBits(
      value % TWO_PWR_32_DBL | 0,
      value / TWO_PWR_32_DBL | 0,
      unsigned
    );
  }
  Long.fromNumber = fromNumber;
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  Long.fromBits = fromBits;
  var pow_dbl = Math.pow;
  function fromString(str3, unsigned, radix) {
    if (str3.length === 0)
      throw Error("empty string");
    if (typeof unsigned === "number") {
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
    if (str3 === "NaN" || str3 === "Infinity" || str3 === "+Infinity" || str3 === "-Infinity")
      return unsigned ? UZERO : ZERO4;
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
      throw RangeError("radix");
    var p;
    if ((p = str3.indexOf("-")) > 0)
      throw Error("interior hyphen");
    else if (p === 0) {
      return fromString(str3.substring(1), unsigned, radix).neg();
    }
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO4;
    for (var i = 0; i < str3.length; i += 8) {
      var size = Math.min(8, str3.length - i), value = parseInt(str3.substring(i, i + size), radix);
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
    result.unsigned = unsigned;
    return result;
  }
  Long.fromString = fromString;
  function fromValue(val, unsigned) {
    if (typeof val === "number")
      return fromNumber(val, unsigned);
    if (typeof val === "string")
      return fromString(val, unsigned);
    return fromBits(
      val.low,
      val.high,
      typeof unsigned === "boolean" ? unsigned : val.unsigned
    );
  }
  Long.fromValue = fromValue;
  var TWO_PWR_16_DBL = 1 << 16;
  var TWO_PWR_24_DBL = 1 << 24;
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  var ZERO4 = fromInt(0);
  Long.ZERO = ZERO4;
  var UZERO = fromInt(0, true);
  Long.UZERO = UZERO;
  var ONE = fromInt(1);
  Long.ONE = ONE;
  var UONE = fromInt(1, true);
  Long.UONE = UONE;
  var NEG_ONE = fromInt(-1);
  Long.NEG_ONE = NEG_ONE;
  var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
  Long.MAX_VALUE = MAX_VALUE;
  var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
  Long.MIN_VALUE = MIN_VALUE;
  var LongPrototype = Long.prototype;
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned)
      return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
      throw RangeError("radix");
    if (this.isZero())
      return "0";
    if (this.isNegative()) {
      if (this.eq(MIN_VALUE)) {
        var radixLong = fromNumber(radix), div2 = this.div(radixLong), rem1 = div2.mul(radixLong).sub(this);
        return div2.toString(radix) + rem1.toInt().toString(radix);
      } else
        return "-" + this.neg().toString(radix);
    }
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
    var result = "";
    while (true) {
      var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero())
        return digits + result;
      else {
        while (digits.length < 6)
          digits = "0" + digits;
        result = "" + digits + result;
      }
    }
  };
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative())
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
    for (var bit = 31; bit > 0; bit--)
      if ((val & 1 << bit) != 0)
        break;
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  LongPrototype.isSafeInteger = function isSafeInteger() {
    var top11Bits = this.high >> 21;
    if (!top11Bits)
      return true;
    if (this.unsigned)
      return false;
    return top11Bits === -1 && !(this.low === 0 && this.high === -2097152);
  };
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  LongPrototype.eqz = LongPrototype.isZero;
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  LongPrototype.equals = function equals4(other) {
    if (!isLong(other))
      other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
      return false;
    return this.high === other.high && this.low === other.low;
  };
  LongPrototype.eq = LongPrototype.equals;
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
      /* validates */
      other
    );
  };
  LongPrototype.neq = LongPrototype.notEquals;
  LongPrototype.ne = LongPrototype.notEquals;
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
      /* validates */
      other
    ) < 0;
  };
  LongPrototype.lt = LongPrototype.lessThan;
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
      /* validates */
      other
    ) <= 0;
  };
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
      /* validates */
      other
    ) > 0;
  };
  LongPrototype.gt = LongPrototype.greaterThan;
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
      /* validates */
      other
    ) >= 0;
  };
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  LongPrototype.compare = function compare(other) {
    if (!isLong(other))
      other = fromValue(other);
    if (this.eq(other))
      return 0;
    var thisNeg = this.isNegative(), otherNeg = other.isNegative();
    if (thisNeg && !otherNeg)
      return -1;
    if (!thisNeg && otherNeg)
      return 1;
    if (!this.unsigned)
      return this.sub(other).isNegative() ? -1 : 1;
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  LongPrototype.comp = LongPrototype.compare;
  LongPrototype.negate = function negate2() {
    if (!this.unsigned && this.eq(MIN_VALUE))
      return MIN_VALUE;
    return this.not().add(ONE);
  };
  LongPrototype.neg = LongPrototype.negate;
  LongPrototype.add = function add5(addend) {
    if (!isLong(addend))
      addend = fromValue(addend);
    var a48 = this.high >>> 16;
    var a32 = this.high & 65535;
    var a16 = this.low >>> 16;
    var a00 = this.low & 65535;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 65535;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 65535;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 65535;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 65535;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 65535;
    c48 += a48 + b48;
    c48 &= 65535;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  LongPrototype.subtract = function subtract3(subtrahend) {
    if (!isLong(subtrahend))
      subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  LongPrototype.sub = LongPrototype.subtract;
  LongPrototype.multiply = function multiply5(multiplier) {
    if (this.isZero())
      return this;
    if (!isLong(multiplier))
      multiplier = fromValue(multiplier);
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
    if (multiplier.isZero())
      return this.unsigned ? UZERO : ZERO4;
    if (this.eq(MIN_VALUE))
      return multiplier.isOdd() ? MIN_VALUE : ZERO4;
    if (multiplier.eq(MIN_VALUE))
      return this.isOdd() ? MIN_VALUE : ZERO4;
    if (this.isNegative()) {
      if (multiplier.isNegative())
        return this.neg().mul(multiplier.neg());
      else
        return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative())
      return this.mul(multiplier.neg()).neg();
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
      return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
    var a48 = this.high >>> 16;
    var a32 = this.high & 65535;
    var a16 = this.low >>> 16;
    var a00 = this.low & 65535;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 65535;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 65535;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 65535;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 65535;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 65535;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 65535;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 65535;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 65535;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 65535;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  LongPrototype.mul = LongPrototype.multiply;
  LongPrototype.divide = function divide2(divisor) {
    if (!isLong(divisor))
      divisor = fromValue(divisor);
    if (divisor.isZero())
      throw Error("division by zero");
    if (wasm) {
      if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
        return this;
      }
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
        this.low,
        this.high,
        divisor.low,
        divisor.high
      );
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
    if (this.isZero())
      return this.unsigned ? UZERO : ZERO4;
    var approx, rem, res;
    if (!this.unsigned) {
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
          return MIN_VALUE;
        else if (divisor.eq(MIN_VALUE))
          return ONE;
        else {
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
          if (approx.eq(ZERO4)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE))
        return this.unsigned ? UZERO : ZERO4;
      if (this.isNegative()) {
        if (divisor.isNegative())
          return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative())
        return this.div(divisor.neg()).neg();
      res = ZERO4;
    } else {
      if (!divisor.unsigned)
        divisor = divisor.toUnsigned();
      if (divisor.gt(this))
        return UZERO;
      if (divisor.gt(this.shru(1)))
        return UONE;
      res = UZERO;
    }
    rem = this;
    while (rem.gte(divisor)) {
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
      var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      }
      if (approxRes.isZero())
        approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
    return res;
  };
  LongPrototype.div = LongPrototype.divide;
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor))
      divisor = fromValue(divisor);
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
        this.low,
        this.high,
        divisor.low,
        divisor.high
      );
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
    return this.sub(this.div(divisor).mul(divisor));
  };
  LongPrototype.mod = LongPrototype.modulo;
  LongPrototype.rem = LongPrototype.modulo;
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  LongPrototype.and = function and(other) {
    if (!isLong(other))
      other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  LongPrototype.or = function or(other) {
    if (!isLong(other))
      other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  LongPrototype.xor = function xor(other) {
    if (!isLong(other))
      other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits))
      numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
      return this;
    else if (numBits < 32)
      return fromBits(
        this.low << numBits,
        this.high << numBits | this.low >>> 32 - numBits,
        this.unsigned
      );
    else
      return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  LongPrototype.shl = LongPrototype.shiftLeft;
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits))
      numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
      return this;
    else if (numBits < 32)
      return fromBits(
        this.low >>> numBits | this.high << 32 - numBits,
        this.high >> numBits,
        this.unsigned
      );
    else
      return fromBits(
        this.high >> numBits - 32,
        this.high >= 0 ? 0 : -1,
        this.unsigned
      );
  };
  LongPrototype.shr = LongPrototype.shiftRight;
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits))
      numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
      return this;
    if (numBits < 32)
      return fromBits(
        this.low >>> numBits | this.high << 32 - numBits,
        this.high >>> numBits,
        this.unsigned
      );
    if (numBits === 32)
      return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits))
      numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
      return this;
    if (numBits === 32)
      return fromBits(this.high, this.low, this.unsigned);
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(
        this.low << numBits | this.high >>> b,
        this.high << numBits | this.low >>> b,
        this.unsigned
      );
    }
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(
      this.high << numBits | this.low >>> b,
      this.low << numBits | this.high >>> b,
      this.unsigned
    );
  };
  LongPrototype.rotl = LongPrototype.rotateLeft;
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits))
      numBits = numBits.toInt();
    if ((numBits &= 63) === 0)
      return this;
    if (numBits === 32)
      return fromBits(this.high, this.low, this.unsigned);
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(
        this.high << b | this.low >>> numBits,
        this.low << b | this.high >>> numBits,
        this.unsigned
      );
    }
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(
      this.low << b | this.high >>> numBits,
      this.high << b | this.low >>> numBits,
      this.unsigned
    );
  };
  LongPrototype.rotr = LongPrototype.rotateRight;
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned)
      return this;
    return fromBits(this.low, this.high, false);
  };
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned)
      return this;
    return fromBits(this.low, this.high, true);
  };
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high, lo = this.low;
    return [
      lo & 255,
      lo >>> 8 & 255,
      lo >>> 16 & 255,
      lo >>> 24,
      hi & 255,
      hi >>> 8 & 255,
      hi >>> 16 & 255,
      hi >>> 24
    ];
  };
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high, lo = this.low;
    return [
      hi >>> 24,
      hi >>> 16 & 255,
      hi >>> 8 & 255,
      hi & 255,
      lo >>> 24,
      lo >>> 16 & 255,
      lo >>> 8 & 255,
      lo & 255
    ];
  };
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(
      bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
      bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
      unsigned
    );
  };
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(
      bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
      bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
      unsigned
    );
  };
  if (typeof BigInt === "function") {
    Long.fromBigInt = function fromBigInt(value, unsigned) {
      var lowBits = Number(BigInt.asIntN(32, value));
      var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
      return fromBits(lowBits, highBits, unsigned);
    };
    Long.fromValue = function fromValueWithBigInt(value, unsigned) {
      if (typeof value === "bigint")
        return Long.fromBigInt(value, unsigned);
      return fromValue(value, unsigned);
    };
    LongPrototype.toBigInt = function toBigInt2() {
      var lowBigInt = BigInt(this.low >>> 0);
      var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
      return highBigInt << BigInt(32) | lowBigInt;
    };
  }
  var long_default = Long;

  // src/lib/utils/s2/s2-token-functions.ts
  var MAXIMUM_TOKEN_LENGTH = 16;
  function getS2CellIdFromToken(token) {
    if (token === "X") {
      token = "";
    }
    const paddedToken = token.padEnd(MAXIMUM_TOKEN_LENGTH, "0");
    return long_default.fromString(paddedToken, true, 16);
  }
  function getS2TokenFromCellId(cellId) {
    if (cellId.isZero()) {
      return "X";
    }
    let numZeroDigits = cellId.countTrailingZeros();
    const remainder = numZeroDigits % 4;
    numZeroDigits = (numZeroDigits - remainder) / 4;
    const trailingZeroHexChars = numZeroDigits;
    numZeroDigits *= 4;
    const x = cellId.shiftRightUnsigned(numZeroDigits);
    const hexString = x.toString(16).replace(/0+$/, "");
    const zeroString = Array(17 - trailingZeroHexChars - hexString.length).join("0");
    return zeroString + hexString;
  }
  function getS2ChildCellId(cellId, index) {
    const newLsb = lsb(cellId).shiftRightUnsigned(2);
    const childCellId = cellId.add(long_default.fromNumber(2 * index + 1 - 4).multiply(newLsb));
    return childCellId;
  }
  function lsb(cellId) {
    return cellId.and(cellId.not().add(1));
  }

  // src/lib/utils/s2/s2geometry/s2-geometry.ts
  var FACE_BITS = 3;
  var MAX_LEVEL = 30;
  var POS_BITS = 2 * MAX_LEVEL + 1;
  var RADIAN_TO_DEGREE = 180 / Math.PI;
  function getS2CellFromQuadKey(hilbertQuadkey) {
    if (hilbertQuadkey.length === 0) {
      throw new Error(`Invalid Hilbert quad key ${hilbertQuadkey}`);
    }
    const parts = hilbertQuadkey.split("/");
    const face = parseInt(parts[0], 10);
    const position = parts[1];
    const maxLevel = position.length;
    let level = 0;
    const point = [0, 0];
    for (let i = maxLevel - 1; i >= 0; i--) {
      level = maxLevel - i;
      const bit = position[i];
      let rx = 0;
      let ry = 0;
      if (bit === "1") {
        ry = 1;
      } else if (bit === "2") {
        rx = 1;
        ry = 1;
      } else if (bit === "3") {
        rx = 1;
      }
      const val = Math.pow(2, level - 1);
      rotateAndFlipQuadrant(val, point, rx, ry);
      point[0] += val * rx;
      point[1] += val * ry;
    }
    if (face % 2 === 1) {
      const t = point[0];
      point[0] = point[1];
      point[1] = t;
    }
    return { face, ij: point, level };
  }
  function getS2QuadkeyFromCellId(cellId) {
    if (cellId.isZero()) {
      return "";
    }
    let bin = cellId.toString(2);
    while (bin.length < FACE_BITS + POS_BITS) {
      bin = "0" + bin;
    }
    const lsbIndex = bin.lastIndexOf("1");
    const faceB = bin.substring(0, 3);
    const posB = bin.substring(3, lsbIndex);
    const levelN = posB.length / 2;
    const faceS = long_default.fromString(faceB, true, 2).toString(10);
    let posS = "";
    if (levelN !== 0) {
      posS = long_default.fromString(posB, true, 2).toString(4);
      while (posS.length < levelN) {
        posS = "0" + posS;
      }
    }
    return `${faceS}/${posS}`;
  }
  function IJToST(ij, level, offsets) {
    const maxSize = 1 << level;
    return [(ij[0] + offsets[0]) / maxSize, (ij[1] + offsets[1]) / maxSize];
  }
  function singleSTtoUV(st) {
    if (st >= 0.5) {
      return 1 / 3 * (4 * st * st - 1);
    }
    return 1 / 3 * (1 - 4 * (1 - st) * (1 - st));
  }
  function STToUV(st) {
    return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
  }
  function FaceUVToXYZ(face, [u, v]) {
    switch (face) {
      case 0:
        return [1, u, v];
      case 1:
        return [-u, 1, v];
      case 2:
        return [-u, -v, 1];
      case 3:
        return [-1, -v, -u];
      case 4:
        return [v, -1, -u];
      case 5:
        return [v, u, -1];
      default:
        throw new Error("Invalid face");
    }
  }
  function XYZToLngLat([x, y, z]) {
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lng = Math.atan2(y, x);
    return [lng * RADIAN_TO_DEGREE, lat * RADIAN_TO_DEGREE];
  }
  function rotateAndFlipQuadrant(n, point, rx, ry) {
    if (ry === 0) {
      if (rx === 1) {
        point[0] = n - 1 - point[0];
        point[1] = n - 1 - point[1];
      }
      const x = point[0];
      point[0] = point[1];
      point[1] = x;
    }
  }
  function getS2LngLatFromS2Cell(s2Cell) {
    const st = IJToST(s2Cell.ij, s2Cell.level, [0.5, 0.5]);
    const uv = STToUV(st);
    const xyz = FaceUVToXYZ(s2Cell.face, uv);
    return XYZToLngLat(xyz);
  }

  // src/lib/utils/s2/converters/s2-to-boundary.ts
  var MAX_RESOLUTION = 100;
  function getS2BoundaryFlatFromS2Cell(s2cell) {
    const { face, ij, level } = s2cell;
    const offsets = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0]
    ];
    const resolution = Math.max(1, Math.ceil(MAX_RESOLUTION * Math.pow(2, -level)));
    const result = new Float64Array(4 * resolution * 2 + 2);
    let ptIndex = 0;
    let prevLng = 0;
    for (let i = 0; i < 4; i++) {
      const offset = offsets[i].slice(0);
      const nextOffset = offsets[i + 1];
      const stepI = (nextOffset[0] - offset[0]) / resolution;
      const stepJ = (nextOffset[1] - offset[1]) / resolution;
      for (let j = 0; j < resolution; j++) {
        offset[0] += stepI;
        offset[1] += stepJ;
        const st = IJToST(ij, level, offset);
        const uv = STToUV(st);
        const xyz = FaceUVToXYZ(face, uv);
        const lngLat = XYZToLngLat(xyz);
        if (Math.abs(lngLat[1]) > 89.999) {
          lngLat[0] = prevLng;
        }
        const deltaLng = lngLat[0] - prevLng;
        lngLat[0] += deltaLng > 180 ? -360 : deltaLng < -180 ? 360 : 0;
        result[ptIndex++] = lngLat[0];
        result[ptIndex++] = lngLat[1];
        prevLng = lngLat[0];
      }
    }
    result[ptIndex++] = result[0];
    result[ptIndex++] = result[1];
    return result;
  }

  // src/lib/utils/s2/s2geometry/s2-cell-utils.ts
  function getS2Cell(tokenOrKey) {
    const key = getS2QuadKey(tokenOrKey);
    const s2cell = getS2CellFromQuadKey(key);
    return s2cell;
  }
  function getS2QuadKey(tokenOrKey) {
    if (tokenOrKey.indexOf("/") > 0) {
      return tokenOrKey;
    }
    const id = getS2CellIdFromToken(tokenOrKey);
    return getS2QuadkeyFromCellId(id);
  }

  // src/lib/utils/s2/s2-geometry-functions.ts
  function getS2LngLat(s2Token) {
    const s2cell = getS2Cell(s2Token);
    return getS2LngLatFromS2Cell(s2cell);
  }

  // src/lib/utils/s2/converters/s2-to-region.ts
  function getS2Region(s2cell) {
    let region;
    if (s2cell.face === 2 || s2cell.face === 5) {
      let corners = null;
      let len2 = 0;
      for (let i = 0; i < 4; i++) {
        const key = `${s2cell.face}/${i}`;
        const cell = getS2Cell(key);
        const corns = getS2BoundaryFlatFromS2Cell(cell);
        if (typeof corners === "undefined" || corners === null)
          corners = new Float64Array(4 * corns.length);
        corners.set(corns, len2);
        len2 += corns.length;
      }
      region = get2DRegionFromS2Corners(corners);
    } else {
      const corners = getS2BoundaryFlatFromS2Cell(s2cell);
      region = get2DRegionFromS2Corners(corners);
    }
    return region;
  }
  function get2DRegionFromS2Corners(corners) {
    if (corners.length % 2 !== 0) {
      throw new Error("Invalid corners");
    }
    const longitudes = [];
    const latitudes = [];
    for (let i = 0; i < corners.length; i += 2) {
      longitudes.push(corners[i]);
      latitudes.push(corners[i + 1]);
    }
    longitudes.sort((a, b) => a - b);
    latitudes.sort((a, b) => a - b);
    return {
      west: longitudes[0],
      east: longitudes[longitudes.length - 1],
      north: latitudes[latitudes.length - 1],
      south: latitudes[0]
    };
  }

  // src/lib/utils/s2/converters/s2-to-obb-points.ts
  function getS2OrientedBoundingBoxCornerPoints(tokenOrKey, heightInfo) {
    const min2 = heightInfo?.minimumHeight || 0;
    const max2 = heightInfo?.maximumHeight || 0;
    const s2cell = getS2Cell(tokenOrKey);
    const region = getS2Region(s2cell);
    const W = region.west;
    const S = region.south;
    const E = region.east;
    const N = region.north;
    const points = [];
    points.push(new Vector3(W, N, min2));
    points.push(new Vector3(E, N, min2));
    points.push(new Vector3(E, S, min2));
    points.push(new Vector3(W, S, min2));
    points.push(new Vector3(W, N, max2));
    points.push(new Vector3(E, N, max2));
    points.push(new Vector3(E, S, max2));
    points.push(new Vector3(W, S, max2));
    return points;
  }

  // src/lib/utils/obb/s2-corners-to-obb.ts
  function convertS2BoundingVolumetoOBB(s2VolumeInfo) {
    const token = s2VolumeInfo.token;
    const heightInfo = {
      minimumHeight: s2VolumeInfo.minimumHeight,
      maximumHeight: s2VolumeInfo.maximumHeight
    };
    const corners = getS2OrientedBoundingBoxCornerPoints(token, heightInfo);
    const center = getS2LngLat(token);
    const centerLng = center[0];
    const centerLat = center[1];
    const point = Ellipsoid.WGS84.cartographicToCartesian([
      centerLng,
      centerLat,
      heightInfo.maximumHeight
    ]);
    const centerPointAdditional = new Vector3(point[0], point[1], point[2]);
    corners.push(centerPointAdditional);
    const obb = makeOrientedBoundingBoxFromPoints(corners);
    const box = [...obb.center, ...obb.halfAxes];
    return box;
  }

  // src/lib/parsers/helpers/parse-3d-implicit-tiles.ts
  var QUADTREE_DIVISION_COUNT = 4;
  var OCTREE_DIVISION_COUNT = 8;
  var SUBDIVISION_COUNT_MAP = {
    QUADTREE: QUADTREE_DIVISION_COUNT,
    OCTREE: OCTREE_DIVISION_COUNT
  };
  function getChildS2VolumeBox(s2VolumeBox, index, subdivisionScheme) {
    if (s2VolumeBox?.box) {
      const cellId = getS2CellIdFromToken(s2VolumeBox.s2VolumeInfo.token);
      const childCellId = getS2ChildCellId(cellId, index);
      const childToken = getS2TokenFromCellId(childCellId);
      const s2ChildVolumeInfo = { ...s2VolumeBox.s2VolumeInfo };
      s2ChildVolumeInfo.token = childToken;
      switch (subdivisionScheme) {
        case "OCTREE":
          const s2VolumeInfo = s2VolumeBox.s2VolumeInfo;
          const delta = s2VolumeInfo.maximumHeight - s2VolumeInfo.minimumHeight;
          const sizeZ = delta / 2;
          const midZ = s2VolumeInfo.minimumHeight + delta / 2;
          s2VolumeInfo.minimumHeight = midZ - sizeZ;
          s2VolumeInfo.maximumHeight = midZ + sizeZ;
          break;
        default:
          break;
      }
      const box = convertS2BoundingVolumetoOBB(s2ChildVolumeInfo);
      const childS2VolumeBox = {
        box,
        s2VolumeInfo: s2ChildVolumeInfo
      };
      return childS2VolumeBox;
    }
    return void 0;
  }
  async function parseImplicitTiles(params) {
    const {
      subtree,
      subtreeData = {
        level: 0,
        x: 0,
        y: 0,
        z: 0
      },
      parentData = {
        mortonIndex: 0,
        localLevel: -1,
        localX: 0,
        localY: 0,
        localZ: 0
      },
      childIndex = 0,
      implicitOptions,
      loaderOptions,
      s2VolumeBox
    } = params;
    const {
      subdivisionScheme,
      subtreeLevels,
      maximumLevel,
      contentUrlTemplate,
      subtreesUriTemplate,
      basePath
    } = implicitOptions;
    const tile = { children: [], lodMetricValue: 0, contentUrl: "" };
    if (typeof maximumLevel !== "number" || !Number.isFinite(maximumLevel)) {
      dist_default.once(
        `Missing 'maximumLevel' or 'availableLevels' property. The subtree ${contentUrlTemplate} won't be loaded...`
      );
      return tile;
    }
    const localLevel = parentData.localLevel + 1;
    const level = subtreeData.level + localLevel;
    if (level > maximumLevel + 1) {
      return tile;
    }
    const childrenPerTile = SUBDIVISION_COUNT_MAP[subdivisionScheme];
    const bitsPerTile = Math.log2(childrenPerTile);
    const lastBitX = childIndex & 1;
    const lastBitY = childIndex >> 1 & 1;
    const lastBitZ = childIndex >> 2 & 1;
    const localX = concatBits(parentData.localX, lastBitX, 1);
    const localY = concatBits(parentData.localY, lastBitY, 1);
    const localZ = concatBits(parentData.localZ, lastBitZ, 1);
    const x = concatBits(subtreeData.x, localX, localLevel);
    const y = concatBits(subtreeData.y, localY, localLevel);
    const z = concatBits(subtreeData.z, localZ, localLevel);
    const mortonIndex = concatBits(parentData.mortonIndex, childIndex, bitsPerTile);
    const isChildSubtreeAvailable = localLevel === subtreeLevels && getAvailabilityResult(subtree.childSubtreeAvailability, mortonIndex);
    let nextSubtree;
    let nextSubtreeData;
    let nextParentData;
    let tileAvailabilityIndex;
    if (isChildSubtreeAvailable) {
      const subtreePath = `${basePath}/${subtreesUriTemplate}`;
      const childSubtreeUrl = replaceContentUrlTemplate(subtreePath, level, x, y, z);
      const childSubtree = await (0, import_core22.load)(childSubtreeUrl, Tile3DSubtreeLoader, loaderOptions);
      nextSubtree = childSubtree;
      tileAvailabilityIndex = 0;
      nextSubtreeData = { level, x, y, z };
      nextParentData = { mortonIndex: 0, localLevel: 0, localX: 0, localY: 0, localZ: 0 };
    } else {
      nextSubtree = subtree;
      const levelOffset = (childrenPerTile ** localLevel - 1) / (childrenPerTile - 1);
      tileAvailabilityIndex = levelOffset + mortonIndex;
      nextSubtreeData = subtreeData;
      nextParentData = { mortonIndex, localLevel, localX, localY, localZ };
    }
    const isTileAvailable = getAvailabilityResult(
      nextSubtree.tileAvailability,
      tileAvailabilityIndex
    );
    if (!isTileAvailable) {
      return tile;
    }
    const isContentAvailable = getAvailabilityResult(
      nextSubtree.contentAvailability,
      tileAvailabilityIndex
    );
    if (isContentAvailable) {
      tile.contentUrl = replaceContentUrlTemplate(contentUrlTemplate, level, x, y, z);
    }
    for (let index = 0; index < childrenPerTile; index++) {
      const childS2VolumeBox = getChildS2VolumeBox(
        s2VolumeBox,
        index,
        subdivisionScheme
      );
      const childTile = await parseImplicitTiles({
        subtree: nextSubtree,
        subtreeData: nextSubtreeData,
        parentData: nextParentData,
        childIndex: index,
        implicitOptions,
        loaderOptions,
        s2VolumeBox: childS2VolumeBox
      });
      if (childTile.contentUrl || childTile.children.length) {
        tile.children.push(childTile);
      }
    }
    if (tile.contentUrl || tile.children.length) {
      const coordinates = { level, x, y, z };
      const formattedTile = formatTileData(tile, coordinates, implicitOptions, s2VolumeBox);
      return formattedTile;
    }
    return tile;
  }
  function getAvailabilityResult(availabilityData, index) {
    let availabilityObject;
    if (Array.isArray(availabilityData)) {
      availabilityObject = availabilityData[0];
      if (availabilityData.length > 1) {
        dist_default.once('Not supported extension "3DTILES_multiple_contents" has been detected');
      }
    } else {
      availabilityObject = availabilityData;
    }
    if ("constant" in availabilityObject) {
      return Boolean(availabilityObject.constant);
    }
    if (availabilityObject.explicitBitstream) {
      return getBooleanValueFromBitstream(index, availabilityObject.explicitBitstream);
    }
    return false;
  }
  function formatTileData(tile, coordinates, options, s2VolumeBox) {
    const {
      basePath,
      refine,
      getRefine: getRefine2,
      lodMetricType,
      getTileType: getTileType2,
      rootLodMetricValue,
      rootBoundingVolume
    } = options;
    const uri = tile.contentUrl && tile.contentUrl.replace(`${basePath}/`, "");
    const lodMetricValue = rootLodMetricValue / 2 ** coordinates.level;
    const boundingVolume = s2VolumeBox?.box ? { box: s2VolumeBox.box } : rootBoundingVolume;
    const boundingVolumeForChildTile = calculateBoundingVolumeForChildTile(
      boundingVolume,
      coordinates,
      options.subdivisionScheme
    );
    return {
      children: tile.children,
      contentUrl: tile.contentUrl,
      content: { uri },
      id: tile.contentUrl,
      refine: getRefine2(refine),
      type: getTileType2(tile),
      lodMetricType,
      lodMetricValue,
      geometricError: lodMetricValue,
      transform: tile.transform,
      boundingVolume: boundingVolumeForChildTile
    };
  }
  function calculateBoundingVolumeForChildTile(rootBoundingVolume, coordinates, subdivisionScheme) {
    if (rootBoundingVolume.region) {
      const { level, x, y, z } = coordinates;
      const [west, south, east, north, minimumHeight, maximumHeight] = rootBoundingVolume.region;
      const boundingVolumesCount = 2 ** level;
      const sizeX = (east - west) / boundingVolumesCount;
      const [childWest, childEast] = [west + sizeX * x, west + sizeX * (x + 1)];
      const sizeY = (north - south) / boundingVolumesCount;
      const [childSouth, childNorth] = [south + sizeY * y, south + sizeY * (y + 1)];
      let childMinimumHeight;
      let childMaximumHeight;
      if (subdivisionScheme === "OCTREE") {
        const sizeZ = (maximumHeight - minimumHeight) / boundingVolumesCount;
        [childMinimumHeight, childMaximumHeight] = [
          minimumHeight + sizeZ * z,
          minimumHeight + sizeZ * (z + 1)
        ];
      } else {
        [childMinimumHeight, childMaximumHeight] = [minimumHeight, maximumHeight];
      }
      return {
        region: [childWest, childSouth, childEast, childNorth, childMinimumHeight, childMaximumHeight]
      };
    }
    if (rootBoundingVolume.box) {
      return rootBoundingVolume;
    }
    throw new Error(`Unsupported bounding volume type ${JSON.stringify(rootBoundingVolume)}`);
  }
  function concatBits(higher, lower, shift) {
    return (higher << shift) + lower;
  }
  function replaceContentUrlTemplate(templateUrl, level, x, y, z) {
    const mapUrl = generateMapUrl({ level, x, y, z });
    return templateUrl.replace(/{level}|{x}|{y}|{z}/gi, (matched) => mapUrl[matched]);
  }
  function generateMapUrl(items) {
    const mapUrl = {};
    for (const key in items) {
      mapUrl[`{${key}}`] = items[key];
    }
    return mapUrl;
  }
  function getBooleanValueFromBitstream(availabilityIndex, availabilityBuffer) {
    const byteIndex = Math.floor(availabilityIndex / 8);
    const bitIndex = availabilityIndex % 8;
    const bitValue = availabilityBuffer[byteIndex] >> bitIndex & 1;
    return bitValue === 1;
  }

  // src/lib/parsers/parse-3d-tile-header.ts
  function getTileType(tile, tileContentUrl = "") {
    if (!tileContentUrl) {
      return "empty" /* EMPTY */;
    }
    const contentUrl = tileContentUrl.split("?")[0];
    const fileExtension = contentUrl.split(".").pop();
    switch (fileExtension) {
      case "pnts":
        return "pointcloud" /* POINTCLOUD */;
      case "i3dm":
      case "b3dm":
      case "glb":
      case "gltf":
        return "scenegraph" /* SCENEGRAPH */;
      default:
        return fileExtension || "empty" /* EMPTY */;
    }
  }
  function getRefine(refine) {
    switch (refine) {
      case "REPLACE":
      case "replace":
        return 2 /* REPLACE */;
      case "ADD":
      case "add":
        return 1 /* ADD */;
      default:
        return refine;
    }
  }
  function resolveUri(uri, basePath) {
    const urlSchemeRegex = /^[a-z][0-9a-z+.-]*:/i;
    if (urlSchemeRegex.test(basePath)) {
      const url = new URL(uri, `${basePath}/`);
      return decodeURI(url.toString());
    } else if (uri.startsWith("/")) {
      return uri;
    }
    return path_exports.resolve(basePath, uri);
  }
  function normalizeTileData(tile, basePath) {
    if (!tile) {
      return null;
    }
    let tileContentUrl;
    if (tile.content) {
      const contentUri = tile.content.uri || tile.content?.url;
      if (typeof contentUri !== "undefined") {
        tileContentUrl = resolveUri(contentUri, basePath);
      }
    }
    const tilePostprocessed = {
      ...tile,
      id: tileContentUrl,
      contentUrl: tileContentUrl,
      lodMetricType: "geometricError" /* GEOMETRIC_ERROR */,
      lodMetricValue: tile.geometricError,
      transformMatrix: tile.transform,
      type: getTileType(tile, tileContentUrl),
      refine: getRefine(tile.refine)
    };
    return tilePostprocessed;
  }
  async function normalizeTileHeaders(tileset, basePath, options) {
    let root = null;
    const rootImplicitTilingExtension = getImplicitTilingExtensionData(tileset.root);
    if (rootImplicitTilingExtension && tileset.root) {
      root = await normalizeImplicitTileHeaders(
        tileset.root,
        tileset,
        basePath,
        rootImplicitTilingExtension,
        options
      );
    } else {
      root = normalizeTileData(tileset.root, basePath);
    }
    const stack2 = [];
    stack2.push(root);
    while (stack2.length > 0) {
      const tile = stack2.pop() || {};
      const children = tile.children || [];
      const childrenPostprocessed = [];
      for (const childHeader of children) {
        const childImplicitTilingExtension = getImplicitTilingExtensionData(childHeader);
        let childHeaderPostprocessed;
        if (childImplicitTilingExtension) {
          childHeaderPostprocessed = await normalizeImplicitTileHeaders(
            childHeader,
            tileset,
            basePath,
            childImplicitTilingExtension,
            options
          );
        } else {
          childHeaderPostprocessed = normalizeTileData(childHeader, basePath);
        }
        if (childHeaderPostprocessed) {
          childrenPostprocessed.push(childHeaderPostprocessed);
          stack2.push(childHeaderPostprocessed);
        }
      }
      tile.children = childrenPostprocessed;
    }
    return root;
  }
  async function normalizeImplicitTileHeaders(tile, tileset, basePath, implicitTilingExtension, options) {
    const {
      subdivisionScheme,
      maximumLevel,
      availableLevels,
      subtreeLevels,
      subtrees: { uri: subtreesUriTemplate }
    } = implicitTilingExtension;
    const replacedUrlTemplate = replaceContentUrlTemplate(subtreesUriTemplate, 0, 0, 0, 0);
    const subtreeUrl = resolveUri(replacedUrlTemplate, basePath);
    const subtree = await (0, import_core23.load)(subtreeUrl, Tile3DSubtreeLoader, options);
    const tileContentUri = tile.content?.uri;
    const contentUrlTemplate = tileContentUri ? resolveUri(tileContentUri, basePath) : "";
    const refine = tileset?.root?.refine;
    const rootLodMetricValue = tile.geometricError;
    const s2VolumeInfo = tile.boundingVolume.extensions?.["3DTILES_bounding_volume_S2"];
    if (s2VolumeInfo) {
      const box = convertS2BoundingVolumetoOBB(s2VolumeInfo);
      const s2VolumeBox = { box, s2VolumeInfo };
      tile.boundingVolume = s2VolumeBox;
    }
    const rootBoundingVolume = tile.boundingVolume;
    const implicitOptions = {
      contentUrlTemplate,
      subtreesUriTemplate,
      subdivisionScheme,
      subtreeLevels,
      maximumLevel: Number.isFinite(availableLevels) ? availableLevels - 1 : maximumLevel,
      refine,
      basePath,
      lodMetricType: "geometricError" /* GEOMETRIC_ERROR */,
      rootLodMetricValue,
      rootBoundingVolume,
      getTileType,
      getRefine
    };
    return await normalizeImplicitTileData(tile, basePath, subtree, implicitOptions, options);
  }
  async function normalizeImplicitTileData(tile, basePath, rootSubtree, implicitOptions, loaderOptions) {
    if (!tile) {
      return null;
    }
    const { children, contentUrl } = await parseImplicitTiles({
      subtree: rootSubtree,
      implicitOptions,
      loaderOptions
    });
    let tileContentUrl;
    let tileContent = null;
    if (contentUrl) {
      tileContentUrl = contentUrl;
      tileContent = { uri: contentUrl.replace(`${basePath}/`, "") };
    }
    const tilePostprocessed = {
      ...tile,
      id: tileContentUrl,
      contentUrl: tileContentUrl,
      lodMetricType: "geometricError" /* GEOMETRIC_ERROR */,
      lodMetricValue: tile.geometricError,
      transformMatrix: tile.transform,
      type: getTileType(tile, tileContentUrl),
      refine: getRefine(tile.refine),
      content: tileContent || tile.content,
      children
    };
    return tilePostprocessed;
  }
  function getImplicitTilingExtensionData(tile) {
    return tile?.extensions?.["3DTILES_implicit_tiling"] || tile?.implicitTiling;
  }

  // src/tiles-3d-loader.ts
  var Tiles3DLoader = {
    dataType: null,
    batchType: null,
    id: "3d-tiles",
    name: "3D Tiles",
    module: "3d-tiles",
    version: VERSION3,
    extensions: ["cmpt", "pnts", "b3dm", "i3dm"],
    mimeTypes: ["application/octet-stream"],
    tests: ["cmpt", "pnts", "b3dm", "i3dm"],
    parse: parse3,
    options: {
      "3d-tiles": {
        loadGLTF: true,
        decodeQuantizedPositions: false,
        isTileset: "auto",
        assetGltfUpAxis: null
      }
    }
  };
  async function parse3(data, options = {}, context) {
    const loaderOptions = options["3d-tiles"] || {};
    let isTileset;
    if (loaderOptions.isTileset === "auto") {
      isTileset = context?.url && context.url.indexOf(".json") !== -1;
    } else {
      isTileset = loaderOptions.isTileset;
    }
    return isTileset ? parseTileset(data, options, context) : parseTile(data, options, context);
  }
  async function parseTileset(data, options, context) {
    const tilesetJson = JSON.parse(new TextDecoder().decode(data));
    const tilesetUrl = context?.url || "";
    const basePath = getBaseUri(tilesetUrl);
    const normalizedRoot = await normalizeTileHeaders(tilesetJson, basePath, options || {});
    const tilesetJsonPostprocessed = {
      ...tilesetJson,
      shape: "tileset3d",
      loader: Tiles3DLoader,
      url: tilesetUrl,
      queryString: context?.queryString || "",
      basePath,
      root: normalizedRoot || tilesetJson.root,
      type: "TILES3D" /* TILES3D */,
      lodMetricType: "geometricError" /* GEOMETRIC_ERROR */,
      lodMetricValue: tilesetJson.root?.geometricError || 0
    };
    return tilesetJsonPostprocessed;
  }
  async function parseTile(arrayBuffer, options, context) {
    const tile = {
      content: {
        shape: "tile3d",
        featureIds: null
      }
    };
    const byteOffset = 0;
    await parse3DTile(arrayBuffer, byteOffset, options, context, tile.content);
    return tile.content;
  }
  function getBaseUri(tilesetUrl) {
    return path_exports.dirname(tilesetUrl);
  }

  // src/lib/ion/ion.ts
  var import_core24 = __toESM(require_core(), 1);
  var CESIUM_ION_URL = "https://api.cesium.com/v1/assets";
  async function getIonTilesetMetadata(accessToken, assetId) {
    if (!assetId) {
      const assets = await getIonAssets(accessToken);
      for (const item of assets.items) {
        if (item.type === "3DTILES") {
          assetId = item.id;
        }
      }
    }
    const ionAssetMetadata = await getIonAssetMetadata(accessToken, assetId);
    const type = ionAssetMetadata.type;
    const url = ionAssetMetadata.options?.url || ionAssetMetadata.url;
    assert2(type === "3DTILES" && url);
    ionAssetMetadata.headers = {
      // Use provided accessToken if a new token is not provided in the ion response
      Authorization: `Bearer ${ionAssetMetadata.accessToken || accessToken}`
    };
    return ionAssetMetadata;
  }
  async function getIonAssets(accessToken) {
    assert2(accessToken);
    const url = CESIUM_ION_URL;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const response = await (0, import_core24.fetchFile)(url, { headers });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  }
  async function getIonAssetMetadata(accessToken, assetId) {
    assert2(accessToken, assetId);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const url = `${CESIUM_ION_URL}/${assetId}`;
    let response = await (0, import_core24.fetchFile)(`${url}`, { headers });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let metadata = await response.json();
    response = await (0, import_core24.fetchFile)(`${url}/endpoint`, { headers });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const tilesetInfo = await response.json();
    metadata = {
      ...metadata,
      ...tilesetInfo
    };
    return metadata;
  }

  // src/cesium-ion-loader.ts
  async function preload(url, options = {}) {
    options = options["cesium-ion"] || {};
    const { accessToken } = options;
    let assetId = options.assetId;
    if (!Number.isFinite(assetId)) {
      const matched = url.match(/\/([0-9]+)\/tileset.json/);
      assetId = matched && matched[1];
    }
    return getIonTilesetMetadata(accessToken, assetId);
  }
  var CesiumIonLoader = {
    ...Tiles3DLoader,
    id: "cesium-ion",
    name: "Cesium Ion",
    // @ts-ignore
    preload,
    parse: async (data, options, context) => {
      options = { ...options };
      options["3d-tiles"] = options["cesium-ion"];
      options.loader = CesiumIonLoader;
      return Tiles3DLoader.parse(data, options, context);
    },
    options: {
      "cesium-ion": {
        ...Tiles3DLoader.options["3d-tiles"],
        accessToken: null
      }
    }
  };

  // ../zip/src/parse-zip/readable-file-utils.ts
  function toBigInt(value) {
    return typeof value === "bigint" ? value : BigInt(value);
  }
  function toNumber2(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      throw new Error("Offset is out of bounds");
    }
    return numberValue;
  }
  function normalizeOffset(offset, size) {
    if (offset < 0) {
      return Math.max(size + offset, 0);
    }
    return Math.min(offset, size);
  }
  async function readRange(file, start, end) {
    const startOffset = toBigInt(start);
    const endOffset = toBigInt(end);
    const length4 = endOffset - startOffset;
    if (length4 < 0) {
      throw new Error("Invalid range requested");
    }
    return await file.read(startOffset, toNumber2(length4));
  }
  async function readDataView(file, start, end) {
    const arrayBuffer = await readRange(file, start, end);
    return new DataView(arrayBuffer);
  }
  async function readUint16(file, offset) {
    const dataView = await readDataView(file, offset, toBigInt(offset) + 2n);
    return dataView.getUint16(0, true);
  }
  async function readUint32(file, offset) {
    const dataView = await readDataView(file, offset, toBigInt(offset) + 4n);
    return dataView.getUint32(0, true);
  }
  async function readBigUint64(file, offset) {
    const dataView = await readDataView(file, offset, toBigInt(offset) + 8n);
    return dataView.getBigUint64(0, true);
  }
  async function getReadableFileSize(file) {
    if (file.bigsize > 0n) {
      return file.bigsize;
    }
    if (file.size > 0) {
      return BigInt(file.size);
    }
    if (file.stat) {
      const stats = await file.stat();
      if (stats?.bigsize !== void 0) {
        return stats.bigsize;
      }
      if (stats?.size !== void 0) {
        return BigInt(stats.size);
      }
    }
    return 0n;
  }
  var DataViewReadableFile = class {
    handle;
    size;
    bigsize;
    url;
    constructor(dataView, url = "") {
      this.handle = dataView;
      this.size = dataView.byteLength;
      this.bigsize = BigInt(dataView.byteLength);
      this.url = url;
    }
    async close() {
    }
    async stat() {
      return { size: this.size, bigsize: this.bigsize, isDirectory: false };
    }
    async read(start = 0, length4) {
      const offset = toNumber2(start);
      const end = length4 ? offset + length4 : this.size;
      const normalizedStart = normalizeOffset(offset, this.size);
      const normalizedEnd = normalizeOffset(end, this.size);
      const clampedEnd = Math.max(normalizedEnd, normalizedStart);
      const lengthToRead = clampedEnd - normalizedStart;
      if (lengthToRead <= 0) {
        return new ArrayBuffer(0);
      }
      return copyToArrayBuffer2(this.handle.buffer, normalizedStart, lengthToRead);
    }
  };

  // ../zip/src/parse-zip/search-from-the-end.ts
  var buffLength = 1024;
  var searchFromTheEnd = async (file, target) => {
    const fileLength = await getReadableFileSize(file);
    const lastBytes = new Uint8Array(await readRange(file, fileLength - 3n, fileLength + 1n));
    const searchWindow = [lastBytes[3], lastBytes[2], lastBytes[1], void 0];
    let targetOffset = -1;
    let point = fileLength - 4n;
    do {
      const prevPoint = point;
      point -= BigInt(buffLength);
      point = point >= 0n ? point : 0n;
      const buff = new Uint8Array(await readRange(file, point, prevPoint));
      for (let i = buff.length - 1; i > -1; i--) {
        searchWindow[3] = searchWindow[2];
        searchWindow[2] = searchWindow[1];
        searchWindow[1] = searchWindow[0];
        searchWindow[0] = buff[i];
        if (searchWindow.every((val, index) => val === target[index])) {
          targetOffset = i;
          break;
        }
      }
    } while (targetOffset === -1 && point > 0n);
    return point + BigInt(targetOffset);
  };

  // ../zip/src/parse-zip/end-of-central-directory.ts
  var eoCDSignature = new Uint8Array([80, 75, 5, 6]);
  var zip64EoCDLocatorSignature = new Uint8Array([80, 75, 6, 7]);
  var zip64EoCDSignature = new Uint8Array([80, 75, 6, 6]);
  var CD_RECORDS_NUMBER_OFFSET = 8n;
  var CD_CD_BYTE_SIZE_OFFSET = 12n;
  var CD_START_OFFSET_OFFSET = 16n;
  var ZIP64_EOCD_START_OFFSET_OFFSET = 8n;
  var ZIP64_CD_RECORDS_NUMBER_OFFSET = 24n;
  var ZIP64_CD_CD_BYTE_SIZE_OFFSET = 40n;
  var ZIP64_CD_START_OFFSET_OFFSET = 48n;
  var parseEoCDRecord = async (file) => {
    const zipEoCDOffset = await searchFromTheEnd(file, eoCDSignature);
    let cdRecordsNumber = BigInt(await readUint16(file, zipEoCDOffset + CD_RECORDS_NUMBER_OFFSET));
    let cdByteSize = BigInt(await readUint32(file, zipEoCDOffset + CD_CD_BYTE_SIZE_OFFSET));
    let cdStartOffset = BigInt(await readUint32(file, zipEoCDOffset + CD_START_OFFSET_OFFSET));
    let zip64EoCDLocatorOffset = zipEoCDOffset - 20n;
    let zip64EoCDOffset = 0n;
    const magicBytes = await readRange(file, zip64EoCDLocatorOffset, zip64EoCDLocatorOffset + 4n);
    if (compareArrayBuffers(magicBytes, zip64EoCDLocatorSignature.buffer)) {
      zip64EoCDOffset = await readBigUint64(
        file,
        zip64EoCDLocatorOffset + ZIP64_EOCD_START_OFFSET_OFFSET
      );
      const endOfCDMagicBytes = await readRange(file, zip64EoCDOffset, zip64EoCDOffset + 4n);
      if (!compareArrayBuffers(endOfCDMagicBytes, zip64EoCDSignature.buffer)) {
        throw new Error("zip64 EoCD not found");
      }
      cdRecordsNumber = await readBigUint64(file, zip64EoCDOffset + ZIP64_CD_RECORDS_NUMBER_OFFSET);
      cdByteSize = await readBigUint64(file, zip64EoCDOffset + ZIP64_CD_CD_BYTE_SIZE_OFFSET);
      cdStartOffset = await readBigUint64(file, zip64EoCDOffset + ZIP64_CD_START_OFFSET_OFFSET);
    } else {
      zip64EoCDLocatorOffset = 0n;
    }
    return {
      cdRecordsNumber,
      cdStartOffset,
      cdByteSize,
      offsets: {
        zip64EoCDOffset,
        zip64EoCDLocatorOffset,
        zipEoCDOffset
      }
    };
  };
  var EOCD_FIELDS = [
    // End of central directory signature = 0x06054b50
    {
      offset: 0,
      size: 4,
      default: new DataView(eoCDSignature.buffer).getUint32(0, true)
    },
    // Number of this disk (or 0xffff for ZIP64)
    {
      offset: 4,
      size: 2,
      default: 0
    },
    // Disk where central directory starts (or 0xffff for ZIP64)
    {
      offset: 6,
      size: 2,
      default: 0
    },
    // Number of central directory records on this disk (or 0xffff for ZIP64)
    {
      offset: 8,
      size: 2,
      name: "recordsNumber"
    },
    // Total number of central directory records (or 0xffff for ZIP64)
    {
      offset: 10,
      size: 2,
      name: "recordsNumber"
    },
    // Size of central directory (bytes) (or 0xffffffff for ZIP64)
    {
      offset: 12,
      size: 4,
      name: "cdSize"
    },
    // Offset of start of central directory, relative to start of archive (or 0xffffffff for ZIP64)
    {
      offset: 16,
      size: 4,
      name: "cdOffset"
    },
    // Comment length (n)
    {
      offset: 20,
      size: 2,
      default: 0
    }
  ];
  var ZIP64_EOCD_LOCATOR_FIELDS = [
    // zip64 end of central dir locator signature
    {
      offset: 0,
      size: 4,
      default: new DataView(zip64EoCDLocatorSignature.buffer).getUint32(0, true)
    },
    // number of the disk with the start of the zip64 end of
    {
      offset: 4,
      size: 4,
      default: 0
    },
    // start of the zip64 end of central directory
    {
      offset: 8,
      size: 8,
      name: "eoCDStart"
    },
    // total number of disks
    {
      offset: 16,
      size: 4,
      default: 1
    }
  ];
  var ZIP64_EOCD_FIELDS = [
    // End of central directory signature = 0x06064b50
    {
      offset: 0,
      size: 4,
      default: new DataView(zip64EoCDSignature.buffer).getUint32(0, true)
    },
    // Size of the EOCD64 minus 12
    {
      offset: 4,
      size: 8,
      default: 44
    },
    // Version made by
    {
      offset: 12,
      size: 2,
      default: 45
    },
    // Version needed to extract (minimum)
    {
      offset: 14,
      size: 2,
      default: 45
    },
    // Number of this disk
    {
      offset: 16,
      size: 4,
      default: 0
    },
    // Disk where central directory starts
    {
      offset: 20,
      size: 4,
      default: 0
    },
    // Number of central directory records on this disk
    {
      offset: 24,
      size: 8,
      name: "recordsNumber"
    },
    // Total number of central directory records
    {
      offset: 32,
      size: 8,
      name: "recordsNumber"
    },
    // Size of central directory (bytes)
    {
      offset: 40,
      size: 8,
      name: "cdSize"
    },
    // Offset of start of central directory, relative to start of archive
    {
      offset: 48,
      size: 8,
      name: "cdOffset"
    }
  ];

  // ../zip/src/parse-zip/cd-file-header.ts
  var CD_COMPRESSED_SIZE_OFFSET = 20;
  var CD_UNCOMPRESSED_SIZE_OFFSET = 24;
  var CD_FILE_NAME_LENGTH_OFFSET = 28;
  var CD_EXTRA_FIELD_LENGTH_OFFSET = 30;
  var CD_START_DISK_OFFSET = 32;
  var CD_LOCAL_HEADER_OFFSET_OFFSET = 42;
  var CD_FILE_NAME_OFFSET = 46n;
  var ZIP64_EXTRA_FIELD_ID = 1;
  var signature = new Uint8Array([80, 75, 1, 2]);
  var parseZipCDFileHeader = async (headerOffset, file) => {
    const fileLength = await getReadableFileSize(file);
    if (headerOffset >= fileLength) {
      return null;
    }
    const mainHeader = await readDataView(file, headerOffset, headerOffset + CD_FILE_NAME_OFFSET);
    const magicBytes = mainHeader.buffer.slice(0, 4);
    if (!compareArrayBuffers(magicBytes, signature.buffer)) {
      return null;
    }
    const compressedSize = BigInt(mainHeader.getUint32(CD_COMPRESSED_SIZE_OFFSET, true));
    const uncompressedSize = BigInt(mainHeader.getUint32(CD_UNCOMPRESSED_SIZE_OFFSET, true));
    const extraFieldLength = mainHeader.getUint16(CD_EXTRA_FIELD_LENGTH_OFFSET, true);
    const startDisk = BigInt(mainHeader.getUint16(CD_START_DISK_OFFSET, true));
    const fileNameLength = mainHeader.getUint16(CD_FILE_NAME_LENGTH_OFFSET, true);
    const additionalHeader = await readRange(
      file,
      headerOffset + CD_FILE_NAME_OFFSET,
      headerOffset + CD_FILE_NAME_OFFSET + BigInt(fileNameLength + extraFieldLength)
    );
    const filenameBytes = additionalHeader.slice(0, fileNameLength);
    const fileName = new TextDecoder().decode(filenameBytes);
    const extraOffset = headerOffset + CD_FILE_NAME_OFFSET + BigInt(fileNameLength);
    const oldFormatOffset = mainHeader.getUint32(CD_LOCAL_HEADER_OFFSET_OFFSET, true);
    const localHeaderOffset = BigInt(oldFormatOffset);
    const extraField = new DataView(
      additionalHeader.slice(fileNameLength, additionalHeader.byteLength)
    );
    const zip64data = {
      uncompressedSize,
      compressedSize,
      localHeaderOffset,
      startDisk
    };
    const res = findZip64DataInExtra(zip64data, extraField);
    return {
      ...zip64data,
      ...res,
      extraFieldLength,
      fileNameLength,
      fileName,
      extraOffset
    };
  };
  async function* makeZipCDHeaderIterator(fileProvider) {
    const { cdStartOffset, cdByteSize } = await parseEoCDRecord(fileProvider);
    const centralDirectory = new DataViewReadableFile(
      new DataView(await readRange(fileProvider, cdStartOffset, cdStartOffset + cdByteSize))
    );
    let cdHeader = await parseZipCDFileHeader(0n, centralDirectory);
    while (cdHeader) {
      yield cdHeader;
      cdHeader = await parseZipCDFileHeader(
        cdHeader.extraOffset + BigInt(cdHeader.extraFieldLength),
        centralDirectory
      );
    }
  }
  var findZip64DataInExtra = (zip64data, extraField) => {
    const zip64dataList = findExpectedData(zip64data);
    const zip64DataRes = {};
    if (zip64dataList.length > 0) {
      const zip64chunkSize = zip64dataList.reduce((sum, curr) => sum + curr.length, 0);
      let offset = 0;
      while (offset + 4 <= extraField.byteLength) {
        const headerId = extraField.getUint16(offset, true);
        const dataSize = extraField.getUint16(offset + 2, true);
        const payloadStart = offset + 4;
        if (payloadStart + dataSize > extraField.byteLength) {
          break;
        }
        if (headerId === ZIP64_EXTRA_FIELD_ID && dataSize === zip64chunkSize) {
          let bytesRead = 0;
          for (const note of zip64dataList) {
            const fieldOffset = payloadStart + bytesRead;
            if (fieldOffset + 8 > payloadStart + dataSize) {
              break;
            }
            zip64DataRes[note.name] = extraField.getBigUint64(fieldOffset, true);
            bytesRead += note.length;
          }
          break;
        }
        offset = payloadStart + dataSize;
      }
    }
    return zip64DataRes;
  };
  var findExpectedData = (zip64data) => {
    const zip64dataList = [];
    if (zip64data.uncompressedSize === BigInt(4294967295)) {
      zip64dataList.push({ name: "uncompressedSize", length: 8 });
    }
    if (zip64data.compressedSize === BigInt(4294967295)) {
      zip64dataList.push({ name: "compressedSize", length: 8 });
    }
    if (zip64data.localHeaderOffset === BigInt(4294967295)) {
      zip64dataList.push({ name: "localHeaderOffset", length: 8 });
    }
    if (zip64data.startDisk === BigInt(4294967295)) {
      zip64dataList.push({ name: "startDisk", length: 4 });
    }
    return zip64dataList;
  };
  var ZIP_HEADER_FIELDS = [
    // Central directory file header signature = 0x02014b50
    {
      offset: 0,
      size: 4,
      default: new DataView(signature.buffer).getUint32(0, true)
    },
    // Version made by
    {
      offset: 4,
      size: 2,
      default: 45
    },
    // Version needed to extract (minimum)
    {
      offset: 6,
      size: 2,
      default: 45
    },
    // General purpose bit flag
    {
      offset: 8,
      size: 2,
      default: 0
    },
    // Compression method
    {
      offset: 10,
      size: 2,
      default: 0
    },
    // File last modification time
    {
      offset: 12,
      size: 2,
      default: 0
    },
    // File last modification date
    {
      offset: 14,
      size: 2,
      default: 0
    },
    // CRC-32 of uncompressed data
    {
      offset: 16,
      size: 4,
      name: "crc32"
    },
    // Compressed size (or 0xffffffff for ZIP64)
    {
      offset: 20,
      size: 4,
      name: "length"
    },
    // Uncompressed size (or 0xffffffff for ZIP64)
    {
      offset: 24,
      size: 4,
      name: "length"
    },
    // File name length (n)
    {
      offset: 28,
      size: 2,
      name: "fnlength"
    },
    // Extra field length (m)
    {
      offset: 30,
      size: 2,
      default: 0,
      name: "extraLength"
    },
    // File comment length (k)
    {
      offset: 32,
      size: 2,
      default: 0
    },
    // Disk number where file starts (or 0xffff for ZIP64)
    {
      offset: 34,
      size: 2,
      default: 0
    },
    // Internal file attributes
    {
      offset: 36,
      size: 2,
      default: 0
    },
    // External file attributes
    {
      offset: 38,
      size: 4,
      default: 0
    },
    // Relative offset of local file header
    {
      offset: 42,
      size: 4,
      name: "offset"
    }
  ];

  // ../zip/src/parse-zip/local-file-header.ts
  var COMPRESSION_METHOD_OFFSET = 8;
  var COMPRESSED_SIZE_OFFSET = 18;
  var UNCOMPRESSED_SIZE_OFFSET = 22;
  var FILE_NAME_LENGTH_OFFSET = 26;
  var EXTRA_FIELD_LENGTH_OFFSET = 28;
  var FILE_NAME_OFFSET = 30n;
  var signature2 = new Uint8Array([80, 75, 3, 4]);
  var parseZipLocalFileHeader = async (headerOffset, file) => {
    const mainHeader = await readDataView(file, headerOffset, headerOffset + FILE_NAME_OFFSET);
    const magicBytes = mainHeader.buffer.slice(0, 4);
    if (!compareArrayBuffers(magicBytes, signature2.buffer)) {
      return null;
    }
    const fileNameLength = mainHeader.getUint16(FILE_NAME_LENGTH_OFFSET, true);
    const extraFieldLength = mainHeader.getUint16(EXTRA_FIELD_LENGTH_OFFSET, true);
    const additionalHeader = await readRange(
      file,
      headerOffset + FILE_NAME_OFFSET,
      headerOffset + FILE_NAME_OFFSET + BigInt(fileNameLength + extraFieldLength)
    );
    const fileNameBuffer = additionalHeader.slice(0, fileNameLength);
    const extraDataBuffer = new DataView(
      additionalHeader.slice(fileNameLength, additionalHeader.byteLength)
    );
    const fileName = new TextDecoder().decode(fileNameBuffer).split("\\").join("/");
    let fileDataOffset = headerOffset + FILE_NAME_OFFSET + BigInt(fileNameLength + extraFieldLength);
    const compressionMethod = mainHeader.getUint16(COMPRESSION_METHOD_OFFSET, true);
    let compressedSize = BigInt(mainHeader.getUint32(COMPRESSED_SIZE_OFFSET, true));
    let uncompressedSize = BigInt(mainHeader.getUint32(UNCOMPRESSED_SIZE_OFFSET, true));
    let offsetInZip64Data = 4;
    if (uncompressedSize === BigInt(4294967295)) {
      uncompressedSize = extraDataBuffer.getBigUint64(offsetInZip64Data, true);
      offsetInZip64Data += 8;
    }
    if (compressedSize === BigInt(4294967295)) {
      compressedSize = extraDataBuffer.getBigUint64(offsetInZip64Data, true);
      offsetInZip64Data += 8;
    }
    if (fileDataOffset === BigInt(4294967295)) {
      fileDataOffset = extraDataBuffer.getBigUint64(offsetInZip64Data, true);
    }
    return {
      fileNameLength,
      fileName,
      extraFieldLength,
      fileDataOffset,
      compressedSize,
      compressionMethod
    };
  };
  var ZIP_HEADER_FIELDS2 = [
    // Local file header signature = 0x04034b50
    {
      offset: 0,
      size: 4,
      default: new DataView(signature2.buffer).getUint32(0, true)
    },
    // Version needed to extract (minimum)
    {
      offset: 4,
      size: 2,
      default: 45
    },
    // General purpose bit flag
    {
      offset: 6,
      size: 2,
      default: 0
    },
    // Compression method
    {
      offset: 8,
      size: 2,
      default: 0
    },
    // File last modification time
    {
      offset: 10,
      size: 2,
      default: 0
    },
    // File last modification date
    {
      offset: 12,
      size: 2,
      default: 0
    },
    // CRC-32 of uncompressed data
    {
      offset: 14,
      size: 4,
      name: "crc32"
    },
    // Compressed size (or 0xffffffff for ZIP64)
    {
      offset: 18,
      size: 4,
      name: "length"
    },
    // Uncompressed size (or 0xffffffff for ZIP64)
    {
      offset: 22,
      size: 4,
      name: "length"
    },
    // File name length (n)
    {
      offset: 26,
      size: 2,
      name: "fnlength"
    },
    // Extra field length (m)
    {
      offset: 28,
      size: 2,
      default: 0,
      name: "extraLength"
    }
  ];

  // ../crypto/src/lib/hash.ts
  var Hash = class {
    constructor(options = {}) {
      this.hashBatches = this.hashBatches.bind(this);
    }
    async preload() {
      return;
    }
    async *hashBatches(asyncIterator, encoding = "base64") {
      const arrayBuffers = [];
      for await (const arrayBuffer of asyncIterator) {
        arrayBuffers.push(arrayBuffer);
        yield arrayBuffer;
      }
      const output = await this.concatenate(arrayBuffers);
      const hash = await this.hash(output, encoding);
      this.options.crypto?.onEnd?.({ hash });
    }
    // HELPERS
    async concatenate(asyncIterator) {
      return await concatenateArrayBuffersAsync(asyncIterator);
    }
  };

  // ../crypto/src/lib/utils/base64-utils.ts
  function asciiToBase64(string) {
    string = `${string}`;
    for (let i = 0; i < string.length; i++) {
      if (string.charCodeAt(i) > 255) {
        return null;
      }
    }
    let out = "";
    for (let i = 0; i < string.length; i += 3) {
      const groupsOfSix = [void 0, void 0, void 0, void 0];
      groupsOfSix[0] = string.charCodeAt(i) >> 2;
      groupsOfSix[1] = (string.charCodeAt(i) & 3) << 4;
      if (string.length > i + 1) {
        groupsOfSix[1] |= string.charCodeAt(i + 1) >> 4;
        groupsOfSix[2] = (string.charCodeAt(i + 1) & 15) << 2;
      }
      if (string.length > i + 2) {
        groupsOfSix[2] |= string.charCodeAt(i + 2) >> 6;
        groupsOfSix[3] = string.charCodeAt(i + 2) & 63;
      }
      for (let j = 0; j < groupsOfSix.length; j++) {
        if (typeof groupsOfSix[j] === "undefined") {
          out += "=";
        } else {
          out += btoaLookup(groupsOfSix[j]);
        }
      }
    }
    return out;
  }
  function btoaLookup(idx) {
    if (idx < 26) {
      return String.fromCharCode(idx + "A".charCodeAt(0));
    }
    if (idx < 52) {
      return String.fromCharCode(idx - 26 + "a".charCodeAt(0));
    }
    if (idx < 62) {
      return String.fromCharCode(idx - 52 + "0".charCodeAt(0));
    }
    if (idx === 62) {
      return "+";
    }
    if (idx === 63) {
      return "/";
    }
    return void 0;
  }

  // ../crypto/src/lib/utils/digest-utils.ts
  function encodeHex(hex, encoding) {
    switch (encoding) {
      case "hex":
        return hex;
      case "base64":
        return convertHexToBase64(hex);
      default:
        throw new Error(encoding);
    }
  }
  function convertHexToBase64(hexstring) {
    if (hexstring.length % 2 !== 0) {
      hexstring = `0${hexstring}`;
    }
    const matches3 = hexstring.match(/\w{2}/g) || [];
    const string = matches3.map((a) => String.fromCharCode(parseInt(a, 16))).join("");
    return asciiToBase64(string) || "";
  }

  // ../crypto/src/lib/algorithms/md5-wasm.ts
  var BASE64_LOOKUP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var wasmB64Bytes = decodeBase64Safely(
    "AGFzbQEAAAABDANgAX8AYAAAYAABfwIeAgdpbXBvcnRzA2xvZwAAB2ltcG9ydHMDbWVtAgABAzIxAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAAAAAAAAAgICAgIAAAAAAAaYARt/AUGBxpS6Bgt/AUGJ17b+fgt/AUH+uevFeQt/AUH2qMmBAQt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALB7oCJQhvbmVGdWxsQQAYCG9uZUZ1bGxCABkIb25lRnVsbEMAGghvbmVGdWxsRAAbBWxvb3BzAAEEbG9vcAACBXByaW1lAAMFbG9vcEEABAZsb29wQTEABQZsb29wQTIABgZsb29wQTMABwZsb29wQTQACAVsb29wQgAJBmxvb3BCMQAKBmxvb3BCMgALBmxvb3BCMwAMBmxvb3BCNAANBWxvb3BDAA4GbG9vcEMxAA8GbG9vcEMyABAGbG9vcEMzABEGbG9vcEM0ABIFbG9vcEQAEwZsb29wRDEAFAZsb29wRDIAFQZsb29wRDMAFgZsb29wRDQAFwRnZXRBACgEZ2V0QgApBGdldEMAKgRnZXREACsEZ2V0WAAsBHNldEEALQRzZXRCAC4Ec2V0QwAvBHNldEQAMARzZXRYADEKzA0xWwEBf0EAJAggAEEGdCEBAkADQCMIIAFGDQEjACQEIwEkBSMCJAYjAyQHEAIjBCMAaiQAIwUjAWokASMGIwJqJAIjByMDaiQDIwhBwABqJAgMAAsLIwgjGmokGgsTACMIIxpqJAkQAxAEEAkQDhATC6IBAEEAIwlqKAIAJApBBCMJaigCACQLQQgjCWooAgAkDEEMIwlqKAIAJA1BECMJaigCACQOQRQjCWooAgAkD0EYIwlqKAIAJBBBHCMJaigCACQRQSAjCWooAgAkEkEkIwlqKAIAJBNBKCMJaigCACQUQSwjCWooAgAkFUEwIwlqKAIAJBZBNCMJaigCACQXQTgjCWooAgAkGEE8IwlqKAIAJBkLCgAQBRAGEAcQCAsuAEH4yKq7fSMKahAYQdbunsZ+IwtqEBtB2+GBoQIjDGoQGkHunfeNfCMNahAZCy0AQa+f8Kt/Iw5qEBhBqoyfvAQjD2oQG0GTjMHBeiMQahAaQYGqmmojEWoQGQssAEHYsYLMBiMSahAYQa/vk9p4IxNqEBtBsbd9IxRqEBpBvq/zyngjFWoQGQstAEGiosDcBiMWahAYQZPj4WwjF2oQG0GOh+WzeiMYahAaQaGQ0M0EIxlqEBkLCgAQChALEAwQDQsuAEHiyviwfyMLahAcQcDmgoJ8IxBqEB9B0bT5sgIjFWoQHkGqj9vNfiMKahAdCy0AQd2gvLF9Iw9qEBxB06iQEiMUahAfQYHNh8V9IxlqEB5ByPfPvn4jDmoQHQsuAEHmm4ePAiMTahAcQdaP3Jl8IxhqEB9Bh5vUpn8jDWoQHkHtqeiqBCMSahAdCy0AQYXSj896IxdqEBxB+Me+ZyMMahAfQdmFvLsGIxFqEB5Bipmp6XgjFmoQHQsKABAPEBAQERASCysAQcLyaCMPahAgQYHtx7t4IxJqECNBosL17AYjFWoQIkGM8JRvIxhqECELLgBBxNT7pXojC2oQIEGpn/veBCMOahAjQeCW7bV/IxFqECJB8Pj+9XsjFGoQIQstAEHG/e3EAiMXahAgQfrPhNV+IwpqECNBheG8p30jDWoQIkGFuqAkIxBqECELLgBBuaDTzn0jE2oQIEHls+62fiMWahAjQfj5if0BIxlqECJB5ayxpXwjDGoQIQsKABAUEBUQFhAXCy0AQcTEpKF/IwpqECRBl/+rmQQjEWoQJ0Gnx9DceiMYahAmQbnAzmQjD2oQJQstAEHDs+2qBiMWahAkQZKZs/h4Iw1qECdB/ei/fyMUahAmQdG7kax4IwtqECULLQBBz/yh/QYjEmoQJEHgzbNxIxlqECdBlIaFmHojEGoQJkGho6DwBCMXahAlCy4AQYL9zbp/Iw5qECRBteTr6XsjFWoQJ0G7pd/WAiMMahAmQZGnm9x+IxNqECULKAEBf0F/IwFzIwNxIwEjAnFyIwBqIABqIgFBB3QgAUEZdnIjAWokAAsoAQF/QX8jAnMjAHEjAiMDcXIjAWogAGoiAUEWdCABQQp2ciMCaiQBCygBAX9BfyMDcyMBcSMDIwBxciMCaiAAaiIBQRF0IAFBD3ZyIwNqJAILKAEBf0F/IwBzIwJxIwAjAXFyIwNqIABqIgFBDHQgAUEUdnIjAGokAwsoAQF/IwJBfyMDc3EjASMDcXIjAGogAGoiAUEFdCABQRt2ciMBaiQACygBAX8jA0F/IwBzcSMCIwBxciMBaiAAaiIBQRR0IAFBDHZyIwJqJAELKAEBfyMAQX8jAXNxIwMjAXFyIwJqIABqIgFBDnQgAUESdnIjA2okAgsoAQF/IwFBfyMCc3EjACMCcXIjA2ogAGoiAUEJdCABQRd2ciMAaiQDCyIBAX8jASMCcyMDcyMAaiAAaiIBQQR0IAFBHHZyIwFqJAALIgEBfyMCIwNzIwBzIwFqIABqIgFBF3QgAUEJdnIjAmokAQsiAQF/IwMjAHMjAXMjAmogAGoiAUEQdCABQRB2ciMDaiQCCyIBAX8jACMBcyMCcyMDaiAAaiIBQQt0IAFBFXZyIwBqJAMLJQEBf0F/IwNzIwFyIwJzIwBqIABqIgFBBnQgAUEadnIjAWokAAslAQF/QX8jAHMjAnIjA3MjAWogAGoiAUEVdCABQQt2ciMCaiQBCyUBAX9BfyMBcyMDciMAcyMCaiAAaiIBQQ90IAFBEXZyIwNqJAILJQEBf0F/IwJzIwByIwFzIwNqIABqIgFBCnQgAUEWdnIjAGokAwsEACMACwQAIwELBAAjAgsEACMDCwQAIxoLBgAgACQACwYAIAAkAQsGACAAJAILBgAgACQDCwYAIAAkGgsA6gQEbmFtZQGSAzIAA2xvZwEFbG9vcHMCBGxvb3ADBXByaW1lBAVsb29wQQUGbG9vcEExBgZsb29wQTIHBmxvb3BBMwgGbG9vcEE0CQVsb29wQgoGbG9vcEIxCwZsb29wQjIMBmxvb3BCMw0GbG9vcEI0DgVsb29wQw8GbG9vcEMxEAZsb29wQzIRBmxvb3BDMxIGbG9vcEM0EwVsb29wRBQGbG9vcEQxFQZsb29wRDIWBmxvb3BEMxcGbG9vcEQ0GAhvbmVGdWxsQRkIb25lRnVsbEIaCG9uZUZ1bGxDGwhvbmVGdWxsRBwIdHdvRnVsbEEdCHR3b0Z1bGxCHgh0d29GdWxsQx8IdHdvRnVsbEQgCHRyZUZ1bGxBIQh0cmVGdWxsQiIIdHJlRnVsbEMjCHRyZUZ1bGxEJAhxdWFGdWxsQSUIcXVhRnVsbEImCHF1YUZ1bGxDJwhxdWFGdWxsRCgEZ2V0QSkEZ2V0QioEZ2V0QysEZ2V0RCwEZ2V0WC0Ec2V0QS4Ec2V0Qi8Ec2V0QzAEc2V0RDEEc2V0WALNATIAAQAAAQIAAAEIbnVtbG9vcHMCAAMABAAFAAYABwAIAAkACgALAAwADQAOAA8AEAARABIAEwAUABUAFgAXABgCAAABAW4ZAgAAAQFuGgIAAAEBbhsCAAABAW4cAgAAAQFuHQIAAAEBbh4CAAABAW4fAgAAAQFuIAIAAAEBbiECAAABAW4iAgAAAQFuIwIAAAEBbiQCAAABAW4lAgAAAQFuJgIAAAEBbicCAAABAW4oACkAKgArACwALQEAAC4BAAAvAQAAMAEAADEBAAA="
  );
  var wasm2 = typeof WebAssembly !== "undefined" && wasmB64Bytes ? wasmB64Bytes.buffer : false;
  var crypt = makeCrypt();
  var biteSize = 240 * 16 * 16;
  var bounder = Math.floor(biteSize * 16 * 1.066666667);
  var upperLimit = 268435456 - 65536;
  var parmTypeErrStr = "Parameter must be ArrayBuffer, ArrayBufferView or string";
  var tooBigErrStr = "Parameter exceeds max size of 255.9 Mbytes";
  if (!wasm2) {
  }
  async function md5WASM(data) {
    const input = normalizeInput(data);
    if (!input) {
      throw new TypeError(parmTypeErrStr);
    }
    if (!wasm2 || input.length <= bounder) {
      return makeMD5JS()(input);
    }
    if (input.length > upperLimit) {
      throw new Error(tooBigErrStr);
    }
    const memory = new WebAssembly.Memory({
      initial: input.length > 32e6 ? input.length > 64e6 ? input.length > 128e6 ? 4096 : 2048 : 1024 : 512
    });
    const memoryView = new Uint32Array(memory.buffer);
    const { instance } = await WebAssembly.instantiate(wasm2, {
      imports: { mem: memory, log: console.log }
    });
    return makeMD5WA()(input, instance.exports, memoryView);
  }
  function makeMD5WA() {
    var _loop, loops;
    var getA, setA, getB, setB, getC, setC, getD, setD, _getX, _setX, memView;
    var md5WA = function(message) {
      var m00, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15, aa, bb, cc, dd, m, _k;
      var _qwerty = new Date().getTime();
      var _md5Used = 0;
      var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, i = 0, l = message.length * 8, len2;
      len2 = bytesToWordsNewer(message, memView);
      memView[l >>> 5] |= 128 << l % 32;
      memView[(l + 64 >>> 9 << 4) + 14] = l;
      len2 = (l + 64 >>> 9 << 4) + 15;
      m = memView;
      while (i < len2) {
        if (len2 > i + bounder) {
          setA(a);
          setB(b);
          setC(c);
          setD(d);
          loops(biteSize);
          i = i + biteSize * 16;
          a = getA();
          b = getB();
          c = getC();
          d = getD();
          _md5Used++;
        } else {
          aa = a;
          bb = b;
          cc = c;
          dd = d;
          m00 = m[i + 0] >>> 0;
          m01 = m[i + 1] >>> 0;
          m02 = m[i + 2] >>> 0;
          m03 = m[i + 3] >>> 0;
          m04 = m[i + 4] >>> 0;
          m05 = m[i + 5] >>> 0;
          m06 = m[i + 6] >>> 0;
          m07 = m[i + 7] >>> 0;
          m08 = m[i + 8] >>> 0;
          m09 = m[i + 9] >>> 0;
          m10 = m[i + 10] >>> 0;
          m11 = m[i + 11] >>> 0;
          m12 = m[i + 12] >>> 0;
          m13 = m[i + 13] >>> 0;
          m14 = m[i + 14] >>> 0;
          m15 = m[i + 15] >>> 0;
          a = ____(7, 25, a + (b & c | ~b & d) + m00 - 680876936) + b;
          d = ____(12, 20, d + (a & b | ~a & c) + m01 - 389564586) + a;
          c = ____(17, 15, c + (d & a | ~d & b) + m02 + 606105819) + d;
          b = ____(22, 10, b + (c & d | ~c & a) + m03 - 1044525330) + c;
          a = ____(7, 25, a + (b & c | ~b & d) + m04 - 176418897) + b;
          d = ____(12, 20, d + (a & b | ~a & c) + m05 + 1200080426) + a;
          c = ____(17, 15, c + (d & a | ~d & b) + m06 - 1473231341) + d;
          b = ____(22, 10, b + (c & d | ~c & a) + m07 - 45705983) + c;
          a = ____(7, 25, a + (b & c | ~b & d) + m08 + 1770035416) + b;
          d = ____(12, 20, d + (a & b | ~a & c) + m09 - 1958414417) + a;
          c = ____(17, 15, c + (d & a | ~d & b) + m10 - 42063) + d;
          b = ____(22, 10, b + (c & d | ~c & a) + m11 - 1990404162) + c;
          a = ____(7, 25, a + (b & c | ~b & d) + m12 + 1804603682) + b;
          d = ____(12, 20, d + (a & b | ~a & c) + m13 - 40341101) + a;
          c = ____(17, 15, c + (d & a | ~d & b) + m14 - 1502002290) + d;
          b = ____(22, 10, b + (c & d | ~c & a) + m15 + 1236535329) + c;
          a = ____(5, 27, a + (b & d | c & ~d) + m01 - 165796510) + b;
          d = ____(9, 23, d + (a & c | b & ~c) + m06 - 1069501632) + a;
          c = ____(14, 18, c + (d & b | a & ~b) + m11 + 643717713) + d;
          b = ____(20, 12, b + (c & a | d & ~a) + m00 - 373897302) + c;
          a = ____(5, 27, a + (b & d | c & ~d) + m05 - 701558691) + b;
          d = ____(9, 23, d + (a & c | b & ~c) + m10 + 38016083) + a;
          c = ____(14, 18, c + (d & b | a & ~b) + m15 - 660478335) + d;
          b = ____(20, 12, b + (c & a | d & ~a) + m04 - 405537848) + c;
          a = ____(5, 27, a + (b & d | c & ~d) + m09 + 568446438) + b;
          d = ____(9, 23, d + (a & c | b & ~c) + m14 - 1019803690) + a;
          c = ____(14, 18, c + (d & b | a & ~b) + m03 - 187363961) + d;
          b = ____(20, 12, b + (c & a | d & ~a) + m08 + 1163531501) + c;
          a = ____(5, 27, a + (b & d | c & ~d) + m13 - 1444681467) + b;
          d = ____(9, 23, d + (a & c | b & ~c) + m02 - 51403784) + a;
          c = ____(14, 18, c + (d & b | a & ~b) + m07 + 1735328473) + d;
          b = ____(20, 12, b + (c & a | d & ~a) + m12 - 1926607734) + c;
          a = ____(4, 28, a + (b ^ c ^ d) + m05 - 378558) + b;
          d = ____(11, 21, d + (a ^ b ^ c) + m08 - 2022574463) + a;
          c = ____(16, 16, c + (d ^ a ^ b) + m11 + 1839030562) + d;
          b = ____(23, 9, b + (c ^ d ^ a) + m14 - 35309556) + c;
          a = ____(4, 28, a + (b ^ c ^ d) + m01 - 1530992060) + b;
          d = ____(11, 21, d + (a ^ b ^ c) + m04 + 1272893353) + a;
          c = ____(16, 16, c + (d ^ a ^ b) + m07 - 155497632) + d;
          b = ____(23, 9, b + (c ^ d ^ a) + m10 - 1094730640) + c;
          a = ____(4, 28, a + (b ^ c ^ d) + m13 + 681279174) + b;
          d = ____(11, 21, d + (a ^ b ^ c) + m00 - 358537222) + a;
          c = ____(16, 16, c + (d ^ a ^ b) + m03 - 722521979) + d;
          b = ____(23, 9, b + (c ^ d ^ a) + m06 + 76029189) + c;
          a = ____(4, 28, a + (b ^ c ^ d) + m09 - 640364487) + b;
          d = ____(11, 21, d + (a ^ b ^ c) + m12 - 421815835) + a;
          c = ____(16, 16, c + (d ^ a ^ b) + m15 + 530742520) + d;
          b = ____(23, 9, b + (c ^ d ^ a) + m02 - 995338651) + c;
          a = ____(6, 26, a + (c ^ (b | ~d)) + m00 - 198630844) + b;
          d = ____(10, 22, d + (b ^ (a | ~c)) + m07 + 1126891415) + a;
          c = ____(15, 17, c + (a ^ (d | ~b)) + m14 - 1416354905) + d;
          b = ____(21, 11, b + (d ^ (c | ~a)) + m05 - 57434055) + c;
          a = ____(6, 26, a + (c ^ (b | ~d)) + m12 + 1700485571) + b;
          d = ____(10, 22, d + (b ^ (a | ~c)) + m03 - 1894986606) + a;
          c = ____(15, 17, c + (a ^ (d | ~b)) + m10 - 1051523) + d;
          b = ____(21, 11, b + (d ^ (c | ~a)) + m01 - 2054922799) + c;
          a = ____(6, 26, a + (c ^ (b | ~d)) + m08 + 1873313359) + b;
          d = ____(10, 22, d + (b ^ (a | ~c)) + m15 - 30611744) + a;
          c = ____(15, 17, c + (a ^ (d | ~b)) + m06 - 1560198380) + d;
          b = ____(21, 11, b + (d ^ (c | ~a)) + m13 + 1309151649) + c;
          a = ____(6, 26, a + (c ^ (b | ~d)) + m04 - 145523070) + b;
          d = ____(10, 22, d + (b ^ (a | ~c)) + m11 - 1120210379) + a;
          c = ____(15, 17, c + (a ^ (d | ~b)) + m02 + 718787259) + d;
          b = ____(21, 11, b + (d ^ (c | ~a)) + m09 - 343485551) + c;
          i = i + 16;
          a = a + aa >>> 0;
          b = b + bb >>> 0;
          c = c + cc >>> 0;
          d = d + dd >>> 0;
        }
      }
      return crypt.endian([a, b, c, d]);
      function ____(s, t, n) {
        return n << s | n >>> t;
      }
      function bytesToWordsNewer(bytes, words) {
        var i2 = -1, l2 = Math.floor((bytes.length - 1) / 4), j = 0, b0, b1, b2, b3;
        while (l2 - 8 > i2++) {
          j = i2 << 2;
          words[i2] = bytes[j + 0] | bytes[j + 1] << 8 | bytes[j + 2] << 16 | bytes[j + 3] << 24;
        }
        i2--;
        while (l2 > i2++) {
          j = i2 << 2;
          b0 = typeof bytes[j + 0] === "undefined" ? 0 : bytes[j + 0];
          b1 = typeof bytes[j + 1] === "undefined" ? 0 : bytes[j + 1];
          b2 = typeof bytes[j + 2] === "undefined" ? 0 : bytes[j + 2];
          b3 = typeof bytes[j + 3] === "undefined" ? 0 : bytes[j + 3];
          words[i2] = b0 | b1 << 8 | b2 << 16 | b3 << 24;
        }
        return l2 + 1;
      }
    };
    return function(message, exports, mView, options) {
      var digestbytes;
      loops = exports.loops;
      _loop = exports.loop;
      getA = exports.getA;
      getB = exports.getB;
      getC = exports.getC;
      getD = exports.getD;
      _getX = exports.getX;
      setA = exports.setA;
      setB = exports.setB;
      setC = exports.setC;
      setD = exports.setD;
      _setX = exports.setX;
      memView = mView;
      digestbytes = crypt.wordsToBytes(md5WA(message));
      return options && options.asBytes ? digestbytes : crypt.bytesconvertNumberToHex(digestbytes);
    };
  }
  function makeMD5JS() {
    var md5JS = function(message, options) {
      var m00, m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14, m15, aa, bb, cc, dd, m;
      var _qwerty = new Date().getTime();
      var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, l = message.length * 8;
      m = crypt.bytesToWords(message);
      for (var j = 0; j < m.length; j++) {
        m[j] = (m[j] << 8 | m[j] >>> 24) & 16711935 | (m[j] << 24 | m[j] >>> 8) & 4278255360;
      }
      m[l >>> 5] |= 128 << l % 32;
      m[(l + 64 >>> 9 << 4) + 14] = l;
      for (var i = 0; i < m.length; i += 16) {
        aa = a;
        bb = b;
        cc = c;
        dd = d;
        m00 = m[i + 0] >>> 0;
        m01 = m[i + 1] >>> 0;
        m02 = m[i + 2] >>> 0;
        m03 = m[i + 3] >>> 0;
        m04 = m[i + 4] >>> 0;
        m05 = m[i + 5] >>> 0;
        m06 = m[i + 6] >>> 0;
        m07 = m[i + 7] >>> 0;
        m08 = m[i + 8] >>> 0;
        m09 = m[i + 9] >>> 0;
        m10 = m[i + 10] >>> 0;
        m11 = m[i + 11] >>> 0;
        m12 = m[i + 12] >>> 0;
        m13 = m[i + 13] >>> 0;
        m14 = m[i + 14] >>> 0;
        m15 = m[i + 15] >>> 0;
        a = ____(7, 25, a + (b & c | ~b & d) + m00 - 680876936) + b;
        d = ____(12, 20, d + (a & b | ~a & c) + m01 - 389564586) + a;
        c = ____(17, 15, c + (d & a | ~d & b) + m02 + 606105819) + d;
        b = ____(22, 10, b + (c & d | ~c & a) + m03 - 1044525330) + c;
        a = ____(7, 25, a + (b & c | ~b & d) + m04 - 176418897) + b;
        d = ____(12, 20, d + (a & b | ~a & c) + m05 + 1200080426) + a;
        c = ____(17, 15, c + (d & a | ~d & b) + m06 - 1473231341) + d;
        b = ____(22, 10, b + (c & d | ~c & a) + m07 - 45705983) + c;
        a = ____(7, 25, a + (b & c | ~b & d) + m08 + 1770035416) + b;
        d = ____(12, 20, d + (a & b | ~a & c) + m09 - 1958414417) + a;
        c = ____(17, 15, c + (d & a | ~d & b) + m10 - 42063) + d;
        b = ____(22, 10, b + (c & d | ~c & a) + m11 - 1990404162) + c;
        a = ____(7, 25, a + (b & c | ~b & d) + m12 + 1804603682) + b;
        d = ____(12, 20, d + (a & b | ~a & c) + m13 - 40341101) + a;
        c = ____(17, 15, c + (d & a | ~d & b) + m14 - 1502002290) + d;
        b = ____(22, 10, b + (c & d | ~c & a) + m15 + 1236535329) + c;
        a = ____(5, 27, a + (b & d | c & ~d) + m01 - 165796510) + b;
        d = ____(9, 23, d + (a & c | b & ~c) + m06 - 1069501632) + a;
        c = ____(14, 18, c + (d & b | a & ~b) + m11 + 643717713) + d;
        b = ____(20, 12, b + (c & a | d & ~a) + m00 - 373897302) + c;
        a = ____(5, 27, a + (b & d | c & ~d) + m05 - 701558691) + b;
        d = ____(9, 23, d + (a & c | b & ~c) + m10 + 38016083) + a;
        c = ____(14, 18, c + (d & b | a & ~b) + m15 - 660478335) + d;
        b = ____(20, 12, b + (c & a | d & ~a) + m04 - 405537848) + c;
        a = ____(5, 27, a + (b & d | c & ~d) + m09 + 568446438) + b;
        d = ____(9, 23, d + (a & c | b & ~c) + m14 - 1019803690) + a;
        c = ____(14, 18, c + (d & b | a & ~b) + m03 - 187363961) + d;
        b = ____(20, 12, b + (c & a | d & ~a) + m08 + 1163531501) + c;
        a = ____(5, 27, a + (b & d | c & ~d) + m13 - 1444681467) + b;
        d = ____(9, 23, d + (a & c | b & ~c) + m02 - 51403784) + a;
        c = ____(14, 18, c + (d & b | a & ~b) + m07 + 1735328473) + d;
        b = ____(20, 12, b + (c & a | d & ~a) + m12 - 1926607734) + c;
        a = ____(4, 28, a + (b ^ c ^ d) + m05 - 378558) + b;
        d = ____(11, 21, d + (a ^ b ^ c) + m08 - 2022574463) + a;
        c = ____(16, 16, c + (d ^ a ^ b) + m11 + 1839030562) + d;
        b = ____(23, 9, b + (c ^ d ^ a) + m14 - 35309556) + c;
        a = ____(4, 28, a + (b ^ c ^ d) + m01 - 1530992060) + b;
        d = ____(11, 21, d + (a ^ b ^ c) + m04 + 1272893353) + a;
        c = ____(16, 16, c + (d ^ a ^ b) + m07 - 155497632) + d;
        b = ____(23, 9, b + (c ^ d ^ a) + m10 - 1094730640) + c;
        a = ____(4, 28, a + (b ^ c ^ d) + m13 + 681279174) + b;
        d = ____(11, 21, d + (a ^ b ^ c) + m00 - 358537222) + a;
        c = ____(16, 16, c + (d ^ a ^ b) + m03 - 722521979) + d;
        b = ____(23, 9, b + (c ^ d ^ a) + m06 + 76029189) + c;
        a = ____(4, 28, a + (b ^ c ^ d) + m09 - 640364487) + b;
        d = ____(11, 21, d + (a ^ b ^ c) + m12 - 421815835) + a;
        c = ____(16, 16, c + (d ^ a ^ b) + m15 + 530742520) + d;
        b = ____(23, 9, b + (c ^ d ^ a) + m02 - 995338651) + c;
        a = ____(6, 26, a + (c ^ (b | ~d)) + m00 - 198630844) + b;
        d = ____(10, 22, d + (b ^ (a | ~c)) + m07 + 1126891415) + a;
        c = ____(15, 17, c + (a ^ (d | ~b)) + m14 - 1416354905) + d;
        b = ____(21, 11, b + (d ^ (c | ~a)) + m05 - 57434055) + c;
        a = ____(6, 26, a + (c ^ (b | ~d)) + m12 + 1700485571) + b;
        d = ____(10, 22, d + (b ^ (a | ~c)) + m03 - 1894986606) + a;
        c = ____(15, 17, c + (a ^ (d | ~b)) + m10 - 1051523) + d;
        b = ____(21, 11, b + (d ^ (c | ~a)) + m01 - 2054922799) + c;
        a = ____(6, 26, a + (c ^ (b | ~d)) + m08 + 1873313359) + b;
        d = ____(10, 22, d + (b ^ (a | ~c)) + m15 - 30611744) + a;
        c = ____(15, 17, c + (a ^ (d | ~b)) + m06 - 1560198380) + d;
        b = ____(21, 11, b + (d ^ (c | ~a)) + m13 + 1309151649) + c;
        a = ____(6, 26, a + (c ^ (b | ~d)) + m04 - 145523070) + b;
        d = ____(10, 22, d + (b ^ (a | ~c)) + m11 - 1120210379) + a;
        c = ____(15, 17, c + (a ^ (d | ~b)) + m02 + 718787259) + d;
        b = ____(21, 11, b + (d ^ (c | ~a)) + m09 - 343485551) + c;
        a = a + aa >>> 0;
        b = b + bb >>> 0;
        c = c + cc >>> 0;
        d = d + dd >>> 0;
      }
      return crypt.endian([a, b, c, d]);
      function ____(s, t, n) {
        return n << s | n >>> t;
      }
    };
    return function(message, options) {
      var digestbytes = crypt.wordsToBytes(md5JS(message, options)), result = options && options.asBytes ? digestbytes : crypt.bytesconvertNumberToHex(digestbytes);
      return result;
    };
  }
  function decodeBase64Safely(str3) {
    try {
      return decodeBase64ToUint8Array(str3);
    } catch (_error) {
      return null;
    }
  }
  function decodeBase64ToUint8Array(base64) {
    var sanitized = base64.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof atob === "function") {
      return binaryStringToUint8Array(atob(sanitized));
    }
    return decodeBase64WithoutAtob(sanitized);
  }
  function decodeBase64WithoutAtob(base64) {
    var paddingLength = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0, byteLength = base64.length * 3 / 4 - paddingLength, bytes = new Uint8Array(byteLength), byteIndex = 0, i = 0, enc1, enc2, enc3, enc4;
    while (i < base64.length) {
      enc1 = BASE64_LOOKUP.indexOf(base64.charAt(i++));
      enc2 = BASE64_LOOKUP.indexOf(base64.charAt(i++));
      enc3 = BASE64_LOOKUP.indexOf(base64.charAt(i++));
      enc4 = BASE64_LOOKUP.indexOf(base64.charAt(i++));
      if (enc1 < 0 || enc2 < 0 || enc3 < 0 || enc4 < 0) {
        throw new TypeError("Invalid base64 input");
      }
      bytes[byteIndex++] = enc1 << 2 | enc2 >> 4;
      if (enc3 < 64 && byteIndex < byteLength) {
        bytes[byteIndex++] = (enc2 & 15) << 4 | enc3 >> 2;
      }
      if (enc4 < 64 && byteIndex < byteLength) {
        bytes[byteIndex++] = (enc3 & 3) << 6 | enc4;
      }
    }
    return bytes;
  }
  function binaryStringToUint8Array(str3) {
    var length4 = str3.length, view = new Uint8Array(length4), i = 0;
    while (i < length4) {
      view[i] = str3.charCodeAt(i);
      i++;
    }
    return view;
  }
  function normalizeInput(data) {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (data && typeof data === "object" && ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    if (typeof data === "string") {
      return new TextEncoder().encode(data);
    }
    return null;
  }
  function makeCrypt() {
    var _base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return {
      rotl: function(n, b) {
        return n << b | n >>> 32 - b;
      },
      endian: function(n) {
        if (n.constructor === Number) {
          return crypt.rotl(n, 8) & 16711935 | crypt.rotl(n, 24) & 4278255360;
        }
        for (var i = 0; i < n.length; i++)
          n[i] = crypt.endian(n[i]);
        return n;
      },
      bytesToWords: function(bytes) {
        for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
          words[b >>> 5] |= bytes[i] << 24 - b % 32;
        return words;
      },
      wordsToBytes: function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8)
          bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
        return bytes;
      },
      bytesconvertNumberToHex: function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 15).toString(16));
        }
        return hex.join("");
      }
    };
  }

  // ../crypto/src/lib/md5-hash.ts
  var MD5Hash = class extends Hash {
    name = "md5";
    options;
    constructor(options = {}) {
      super();
      this.options = options;
    }
    /**
     * Atomic hash calculation
     * @returns base64 encoded hash
     */
    async hash(input, encoding) {
      const hex = await md5WASM(input);
      return encodeHex(hex, encoding);
    }
  };

  // ../compression/src/lib/compression.ts
  var Compression = class {
    constructor(options) {
      this.compressBatches = this.compressBatches.bind(this);
      this.decompressBatches = this.decompressBatches.bind(this);
    }
    /** Preloads any dynamic libraries. May enable sync functions */
    async preload(modules = {}) {
      registerJSModules(modules);
      return;
    }
    /** Asynchronously compress data */
    async compress(input) {
      await this.preload();
      return this.compressSync(input);
    }
    /** Asynchronously decompress data */
    async decompress(input, size) {
      await this.preload();
      return this.decompressSync(input, size);
    }
    /** Synchronously compress data */
    compressSync(input) {
      throw new Error(`${this.name}: sync compression not supported`);
    }
    /** Synchronously compress data */
    decompressSync(input, size) {
      throw new Error(`${this.name}: sync decompression not supported`);
    }
    /** Compress batches */
    async *compressBatches(asyncIterator) {
      const input = await this.concatenate(asyncIterator);
      yield this.compress(input);
    }
    /** Decompress batches */
    async *decompressBatches(asyncIterator) {
      const input = await this.concatenate(asyncIterator);
      yield this.decompress(input);
    }
    // HELPERS
    concatenate(asyncIterator) {
      return concatenateArrayBuffersAsync(asyncIterator);
    }
    improveError(error) {
      if (!error.message.includes(this.name)) {
        error.message = `${this.name} ${error.message}`;
      }
      return error;
    }
  };

  // ../compression/src/lib/no-compression.ts
  var NoCompression = class extends Compression {
    name = "uncompressed";
    extensions = [];
    contentEncodings = [];
    isSupported = true;
    options;
    constructor(options) {
      super(options);
      this.options = options || {};
    }
    compressSync(input) {
      return input;
    }
    decompressSync(input) {
      return input;
    }
    async *compressBatches(asyncIterator) {
      return yield* asyncIterator;
    }
    async *decompressBatches(asyncIterator) {
      return yield* asyncIterator;
    }
  };

  // ../compression/src/lib/deflate-compression.ts
  var import_pako = __toESM(require_pako(), 1);
  var import_zlib = __toESM(require_zlib(), 1);
  var DeflateCompression = class extends Compression {
    name = "deflate";
    extensions = [];
    contentEncodings = ["deflate"];
    isSupported = true;
    options;
    _chunks = [];
    constructor(options = {}) {
      super(options);
      this.options = options;
    }
    async compress(input) {
      if (!isBrowser && this.options.deflate?.useZlib) {
        const buffer = this.options.deflate?.gzip ? await promisify1(import_zlib.default.gzip)(input) : await promisify1(import_zlib.default.deflate)(input);
        return toArrayBuffer2(buffer);
      }
      return this.compressSync(input);
    }
    async decompress(input) {
      if (!isBrowser && this.options.deflate?.useZlib) {
        const buffer = this.options.deflate?.gzip ? await promisify1(import_zlib.default.gunzip)(input) : await promisify1(import_zlib.default.inflate)(input);
        return toArrayBuffer2(buffer);
      }
      return this.decompressSync(input);
    }
    compressSync(input) {
      if (!isBrowser && this.options.deflate?.useZlib) {
        const buffer = this.options.deflate?.gzip ? import_zlib.default.gzipSync(input) : import_zlib.default.deflateSync(input);
        return toArrayBuffer2(buffer);
      }
      const pakoOptions = this.options?.deflate || {};
      const inputArray = new Uint8Array(input);
      const deflate = this.options?.raw ? import_pako.default.deflateRaw : import_pako.default.deflate;
      return toArrayBuffer2(deflate(inputArray, pakoOptions).buffer);
    }
    decompressSync(input) {
      if (!isBrowser && this.options.deflate?.useZlib) {
        const buffer = this.options.deflate?.gzip ? import_zlib.default.gunzipSync(input) : import_zlib.default.inflateSync(input);
        return toArrayBuffer2(buffer);
      }
      const pakoOptions = this.options?.deflate || {};
      const inputArray = new Uint8Array(input);
      const inflate = this.options?.raw ? import_pako.default.inflateRaw : import_pako.default.inflate;
      return toArrayBuffer2(inflate(inputArray, pakoOptions).buffer);
    }
    async *compressBatches(asyncIterator) {
      const pakoOptions = this.options?.deflate || {};
      const pakoProcessor = new import_pako.default.Deflate(pakoOptions);
      yield* this.transformBatches(pakoProcessor, asyncIterator);
    }
    async *decompressBatches(asyncIterator) {
      const pakoOptions = this.options?.deflate || {};
      const pakoProcessor = new import_pako.default.Inflate(pakoOptions);
      yield* this.transformBatches(pakoProcessor, asyncIterator);
    }
    async *transformBatches(pakoProcessor, asyncIterator) {
      pakoProcessor.onData = this._onData.bind(this);
      pakoProcessor.onEnd = this._onEnd.bind(this);
      for await (const chunk of asyncIterator) {
        const uint8Array = new Uint8Array(chunk);
        const ok2 = pakoProcessor.push(uint8Array, false);
        if (!ok2) {
          throw new Error(`${this._getError()}write`);
        }
        const chunks2 = this._getChunks();
        yield* chunks2;
      }
      const emptyChunk = new Uint8Array(0);
      const ok = pakoProcessor.push(emptyChunk, true);
      if (!ok) {
      }
      const chunks = this._getChunks();
      yield* chunks;
    }
    _onData(chunk) {
      this._chunks.push(chunk);
    }
    _onEnd(status) {
      if (status !== 0) {
        throw new Error(this._getError(status) + this._chunks.length);
      }
    }
    _getChunks() {
      const chunks = this._chunks;
      this._chunks = [];
      return chunks;
    }
    // TODO - For some reason we don't get the error message from pako in _onEnd?
    _getError(code = 0) {
      const MESSAGES = {
        /* Z_NEED_DICT       2  */
        2: "need dictionary",
        /* Z_STREAM_END      1  */
        1: "stream end",
        /* Z_OK              0  */
        0: "",
        /* Z_ERRNO         (-1) */
        "-1": "file error",
        /* Z_STREAM_ERROR  (-2) */
        "-2": "stream error",
        /* Z_DATA_ERROR    (-3) */
        "-3": "data error",
        /* Z_MEM_ERROR     (-4) */
        "-4": "insufficient memory",
        /* Z_BUF_ERROR     (-5) */
        "-5": "buffer error",
        /* Z_VERSION_ERROR (-6) */
        "-6": "incompatible version"
      };
      return `${this.name}: ${MESSAGES[code]}`;
    }
  };

  // ../zip/src/filesystems/zip-filesystem.ts
  var ZIP_COMPRESSION_HANDLERS = {
    /** No compression */
    0: async (compressedFile) => compressedFile,
    /** Deflation */
    8: async (compressedFile) => {
      const compression = new DeflateCompression({ raw: true });
      const decompressedData = await compression.decompress(compressedFile);
      return decompressedData;
    }
  };
  var ZipFileSystem = class {
    /** File instance */
    file = null;
    fileName;
    archive = null;
    /**
     * Constructor
     * @param file - instance of ReadableFile or file path string
     */
    constructor(file) {
      if (typeof file === "string") {
        this.fileName = file;
        if (isBrowser) {
          throw new Error("ZipFileSystem cannot open file paths in browser environments");
        }
        this.file = new NodeFileFacade(file);
      } else if (file instanceof Blob || file instanceof ArrayBuffer) {
        this.file = new BlobFile(file);
      } else if (file instanceof IndexedArchive) {
        this.file = file.file;
        this.archive = file;
        this.fileName = file.fileName;
      } else {
        this.file = file;
      }
    }
    /** Clean up resources */
    async destroy() {
      if (this.file) {
        await this.file.close();
      }
    }
    /**
     * Get file names list from zip archive
     * @returns array of file names
     */
    async readdir() {
      if (!this.file) {
        throw new Error("No data detected in the zip archive");
      }
      const fileNames = [];
      const zipCDIterator = makeZipCDHeaderIterator(this.file);
      for await (const cdHeader of zipCDIterator) {
        fileNames.push(cdHeader.fileName);
      }
      return fileNames;
    }
    /**
     * Get file metadata
     * @param filename - name of a file
     * @returns central directory data
     */
    async stat(filename2) {
      const cdFileHeader = await this.getCDFileHeader(filename2);
      return { ...cdFileHeader, size: Number(cdFileHeader.uncompressedSize) };
    }
    /**
     * Implementation of fetch against this file system
     * @param filename - name of a file
     * @returns - Response with file data
     */
    async fetch(filename2) {
      if (this.fileName && filename2.indexOf(this.fileName) === 0) {
        filename2 = filename2.substring(this.fileName.length + 1);
      }
      let uncompressedFile;
      if (this.archive) {
        uncompressedFile = await this.archive.getFile(filename2, "http");
      } else {
        if (!this.file) {
          throw new Error("No data detected in the zip archive");
        }
        const cdFileHeader = await this.getCDFileHeader(filename2);
        const localFileHeader = await parseZipLocalFileHeader(
          cdFileHeader.localHeaderOffset,
          this.file
        );
        if (!localFileHeader) {
          throw new Error("Local file header has not been found in the zip archive`");
        }
        const compressionHandler = ZIP_COMPRESSION_HANDLERS[localFileHeader.compressionMethod.toString()];
        if (!compressionHandler) {
          throw Error("Only Deflation compression is supported");
        }
        const compressedFile = await readRange(
          this.file,
          localFileHeader.fileDataOffset,
          localFileHeader.fileDataOffset + localFileHeader.compressedSize
        );
        uncompressedFile = await compressionHandler(compressedFile);
      }
      const response = new Response(uncompressedFile);
      Object.defineProperty(response, "url", {
        value: filename2 ? `${this.fileName || ""}/${filename2}` : this.fileName || ""
      });
      return response;
    }
    /**
     * Get central directory file header
     * @param filename - name of a file
     * @returns central directory file header
     */
    async getCDFileHeader(filename2) {
      if (!this.file) {
        throw new Error("No data detected in the zip archive");
      }
      const zipCDIterator = makeZipCDHeaderIterator(this.file);
      let result = null;
      for await (const cdHeader of zipCDIterator) {
        if (cdHeader.fileName === filename2) {
          result = cdHeader;
          break;
        }
      }
      if (!result) {
        throw new Error("File has not been found in the zip archive");
      }
      return result;
    }
  };

  // ../zip/src/filesystems/IndexedArchive.ts
  var IndexedArchive = class {
    file;
    fileName;
    /**
     * Constructor
     * @param fileProvider - readable file instance for random access
     * @param hashTable - pre-loaded hashTable. If presented, getFile will skip reading the hash file
     * @param fileName - name of the archive. It is used to add to an URL of a loader context
     */
    constructor(file, hashTable, fileName) {
      this.file = file;
      this.fileName = fileName;
    }
    /**
     * Get file as from order ZIP arhive without using the hash file
     * @param filename - path to the internal file
     * @returns
     */
    async getFileWithoutHash(filename2) {
      const zipFS = new ZipFileSystem(this.file);
      const response = await zipFS.fetch(filename2);
      return await response.arrayBuffer();
    }
  };

  // ../zip/src/hash-file-utility.ts
  function parseHashTable(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);
    const hashMap = {};
    for (let i = 0; i < arrayBuffer.byteLength; i = i + 24) {
      const offset = dataView.getBigUint64(i + 16, true);
      const hash = bufferToHex(arrayBuffer, i, 16);
      hashMap[hash] = offset;
    }
    return hashMap;
  }
  function bufferToHex(buffer, start, length4) {
    return [...new Uint8Array(buffer, start, length4)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  async function makeHashTableFromZipHeaders(fileProvider) {
    const zipCDIterator = makeZipCDHeaderIterator(fileProvider);
    return getHashTable(zipCDIterator);
  }
  async function getHashTable(zipCDIterator) {
    const md5Hash = new MD5Hash();
    const textEncoder = new TextEncoder();
    const hashTable = {};
    for await (const cdHeader of zipCDIterator) {
      const filename2 = cdHeader.fileName.split("\\").join("/").toLocaleLowerCase();
      const arrayBuffer = textEncoder.encode(filename2).buffer;
      const md5 = await md5Hash.hash(arrayBuffer, "hex");
      hashTable[md5] = cdHeader.localHeaderOffset;
    }
    return hashTable;
  }

  // src/3d-tiles-archive/3d-tiles-archive-archive.ts
  var COMPRESSION_METHODS = {
    /** No compression */
    0: (data) => new NoCompression().decompress(data),
    /** Deflation */
    8: (data) => new DeflateCompression({ raw: true }).decompress(data)
  };
  var Tiles3DArchive = class extends IndexedArchive {
    /** hash info */
    hashTable;
    /**
     * creates Tiles3DArchive handler
     * @param fileProvider - readable file handle with the whole archive
     * @param hashTable - hash info
     */
    constructor(fileProvider, hashTable, fileName) {
      super(fileProvider, hashTable, fileName);
      this.hashTable = hashTable;
    }
    /**
     * Returns file with the given path from 3tz archive
     * @param path - path inside the 3tz
     * @returns buffer with ready to use file
     */
    async getFile(path) {
      let data = await this.getFileBytes(path.toLocaleLowerCase());
      if (!data) {
        data = await this.getFileBytes(path);
      }
      if (!data) {
        throw new Error(`No such file in the archive: ${path}`);
      }
      return data;
    }
    /**
     * Trying to get raw file data by adress
     * @param path - path inside the archive
     * @returns buffer with the raw file data
     */
    async getFileBytes(path) {
      let uncompressedFile;
      if (this.hashTable) {
        const arrayBuffer = new TextEncoder().encode(path).buffer;
        const nameHash = await new MD5Hash().hash(arrayBuffer, "hex");
        const byteOffset = this.hashTable[nameHash];
        if (byteOffset === void 0) {
          return null;
        }
        const localFileHeader = await parseZipLocalFileHeader(byteOffset, this.file);
        if (!localFileHeader) {
          return null;
        }
        const compressedFile = await readRange(
          this.file,
          localFileHeader.fileDataOffset,
          localFileHeader.fileDataOffset + localFileHeader.compressedSize
        );
        const compressionMethod = COMPRESSION_METHODS[localFileHeader.compressionMethod];
        if (!compressionMethod) {
          throw Error("Only Deflation compression is supported");
        }
        uncompressedFile = await compressionMethod(compressedFile);
      } else {
        uncompressedFile = await this.getFileWithoutHash(path);
      }
      return uncompressedFile;
    }
  };

  // src/3d-tiles-archive/3d-tiles-archive-parser.ts
  var parse3DTilesArchive = async (fileProvider, cb) => {
    const hashCDOffset = await searchFromTheEnd(fileProvider, signature);
    const cdFileHeader = await parseZipCDFileHeader(hashCDOffset, fileProvider);
    let hashTable;
    if (cdFileHeader?.fileName !== "@3dtilesIndex1@") {
      hashTable = await makeHashTableFromZipHeaders(fileProvider);
      cb?.(
        "3tz doesnt contain hash file, hash info has been composed according to zip archive headers"
      );
    } else {
      const localFileHeader = await parseZipLocalFileHeader(
        cdFileHeader.localHeaderOffset,
        fileProvider
      );
      if (!localFileHeader) {
        throw new Error("corrupted 3tz zip archive");
      }
      const fileDataOffset = localFileHeader.fileDataOffset;
      const hashFile = await readRange(
        fileProvider,
        fileDataOffset,
        fileDataOffset + localFileHeader.compressedSize
      );
      hashTable = parseHashTable(hashFile);
    }
    return new Tiles3DArchive(fileProvider, hashTable);
  };

  // src/3d-tiles-archive-loader.ts
  var VERSION8 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";
  var Tiles3DArchiveFileLoader = {
    dataType: null,
    batchType: null,
    name: "3tz",
    id: "3tz",
    module: "3d-tiles",
    version: VERSION8,
    mimeTypes: ["application/octet-stream", "application/vnd.maxar.archive.3tz+zip"],
    parse: parse3DTilesArchive2,
    extensions: ["3tz"],
    options: {}
  };
  async function parse3DTilesArchive2(data, options = {}) {
    const archive = await parse3DTilesArchive(
      new DataViewReadableFile(new DataView(data))
    );
    return archive.getFile(options["3d-tiles-archive"]?.path ?? "");
  }

  // src/lib/encoders/helpers/encode-3d-tile-header.ts
  function encode3DTileHeader(tile, dataView, byteOffset) {
    const HEADER_SIZE = 12;
    if (!dataView) {
      return byteOffset + HEADER_SIZE;
    }
    const { magic, version = 1, byteLength = 12 } = tile;
    assert2(Array.isArray(magic) && Number.isFinite(version) && Number.isFinite(byteLength));
    dataView.setUint8(byteOffset + 0, magic[0]);
    dataView.setUint8(byteOffset + 1, magic[1]);
    dataView.setUint8(byteOffset + 2, magic[2]);
    dataView.setUint8(byteOffset + 3, magic[3]);
    dataView.setUint32(byteOffset + 4, version, true);
    dataView.setUint32(byteOffset + 8, byteLength, true);
    byteOffset += HEADER_SIZE;
    return byteOffset;
  }
  function encode3DTileByteLength(dataView, byteOffsetTileStart, byteLength) {
    if (!dataView) {
      return;
    }
    dataView.setUint32(byteOffsetTileStart + 8, byteLength, true);
  }

  // src/lib/encoders/encode-3d-tile-composite.ts
  function encodeComposite3DTile(tile, dataView, byteOffset, options, encode3DTile2) {
    tile = { magic: MAGIC_ARRAY.COMPOSITE, tiles: [], ...tile };
    const byteOffsetStart = byteOffset;
    byteOffset += encode3DTileHeader(tile, dataView, byteOffset);
    if (dataView) {
      dataView.setUint32(byteOffset, tile.tiles.length, true);
    }
    byteOffset += 4;
    for (let i = 0; i < tile.tiles.length; ++i) {
      byteOffset += encode3DTile2(tile.tiles[i], dataView, byteOffset, options);
    }
    encode3DTileByteLength(dataView, byteOffsetStart, byteOffset - byteOffsetStart);
    return byteOffset;
  }

  // src/lib/encoders/encode-3d-tile-batched-model.ts
  function encodeBatchedModel3DTile(tile, dataView, byteOffset, options) {
    const { featuresLength = 0, batchTable } = tile;
    const featureTableJson = {
      BATCH_LENGTH: featuresLength
    };
    const featureTableJsonString = JSON.stringify(featureTableJson);
    const batchTableJsonString = batchTable ? JSON.stringify(batchTable) : "";
    const featureTableJsonByteLength = padToNBytes(featureTableJsonString.length, 8);
    const batchTableJsonByteLength = batchTableJsonString ? padToNBytes(batchTableJsonString.length, 8) : 0;
    tile = { magic: MAGIC_ARRAY.BATCHED_MODEL, ...tile };
    const byteOffsetStart = byteOffset;
    byteOffset = encode3DTileHeader(tile, dataView, byteOffset);
    if (dataView) {
      dataView.setUint32(12, featureTableJsonByteLength, true);
      dataView.setUint32(16, 0, true);
      dataView.setUint32(20, batchTableJsonByteLength, true);
      dataView.setUint32(24, 0, true);
    }
    byteOffset += 16;
    byteOffset = copyPaddedStringToDataView(dataView, byteOffset, featureTableJsonString, 8);
    if (batchTable) {
      byteOffset = copyPaddedStringToDataView(dataView, byteOffset, batchTableJsonString, 8);
    }
    const gltfEncoded = tile.gltfEncoded;
    if (gltfEncoded) {
      byteOffset = copyBinaryToDataView(dataView, byteOffset, gltfEncoded, gltfEncoded.byteLength);
    }
    encode3DTileByteLength(dataView, byteOffsetStart, byteOffset - byteOffsetStart);
    return byteOffset;
  }

  // src/lib/encoders/encode-3d-tile-instanced-model.ts
  function encodeInstancedModel3DTile(tile, dataView, byteOffset, options) {
    const { featuresLength = 1, gltfFormat = 1, gltfUri = "" } = tile;
    const gltfUriByteLength = gltfUri.length;
    const featureTableJson = {
      INSTANCES_LENGTH: featuresLength,
      POSITION: new Array(featuresLength * 3).fill(0)
    };
    const featureTableJsonString = JSON.stringify(featureTableJson);
    const featureTableJsonByteLength = featureTableJsonString.length;
    tile = { magic: MAGIC_ARRAY.INSTANCED_MODEL, ...tile };
    const byteOffsetStart = byteOffset;
    byteOffset = encode3DTileHeader(tile, dataView, 0);
    if (dataView) {
      dataView.setUint32(12, featureTableJsonByteLength, true);
      dataView.setUint32(16, 0, true);
      dataView.setUint32(20, 0, true);
      dataView.setUint32(24, 0, true);
      dataView.setUint32(28, gltfFormat, true);
    }
    byteOffset += 20;
    byteOffset += copyStringToDataView(
      dataView,
      byteOffset,
      featureTableJsonString,
      featureTableJsonByteLength
    );
    byteOffset += copyStringToDataView(dataView, byteOffset, gltfUri, gltfUriByteLength);
    encode3DTileByteLength(dataView, byteOffsetStart, byteOffset - byteOffsetStart);
    return byteOffset;
  }

  // src/lib/encoders/encode-3d-tile-point-cloud.ts
  var DEFAULT_FEATURE_TABLE_JSON = {
    POINTS_LENGTH: 1,
    POSITIONS: {
      byteOffset: 0
    }
  };
  function encodePointCloud3DTile(tile, dataView, byteOffset, options) {
    const { featureTableJson = DEFAULT_FEATURE_TABLE_JSON } = tile;
    let featureTableJsonString = JSON.stringify(featureTableJson);
    featureTableJsonString = padStringToByteAlignment(featureTableJsonString, 4);
    const { featureTableJsonByteLength = featureTableJsonString.length } = tile;
    const featureTableBinary = new ArrayBuffer(12);
    const featureTableBinaryByteLength = featureTableBinary.byteLength;
    tile = { magic: MAGIC_ARRAY.POINT_CLOUD, ...tile };
    const byteOffsetStart = byteOffset;
    byteOffset += encode3DTileHeader(tile, dataView, 0);
    if (dataView) {
      dataView.setUint32(byteOffset + 0, featureTableJsonByteLength, true);
      dataView.setUint32(byteOffset + 4, featureTableBinaryByteLength, true);
      dataView.setUint32(byteOffset + 8, 0, true);
      dataView.setUint32(byteOffset + 12, 0, true);
    }
    byteOffset += 16;
    byteOffset += copyStringToDataView(
      dataView,
      byteOffset,
      featureTableJsonString,
      featureTableJsonByteLength
    );
    byteOffset += copyBinaryToDataView(
      dataView,
      byteOffset,
      featureTableBinary,
      featureTableBinaryByteLength
    );
    encode3DTileByteLength(dataView, byteOffsetStart, byteOffset - byteOffsetStart);
    return byteOffset;
  }

  // src/lib/encoders/encode-3d-tile.ts
  function encode3DTile(tile, options) {
    const byteLength = encode3DTileToDataView(tile, null, 0, options);
    const arrayBuffer = new ArrayBuffer(byteLength);
    const dataView = new DataView(arrayBuffer);
    encode3DTileToDataView(tile, dataView, 0, options);
    return arrayBuffer;
  }
  function encode3DTileToDataView(tile, dataView, byteOffset, options) {
    assert2(typeof tile.type === "string");
    switch (tile.type) {
      case TILE3D_TYPE.COMPOSITE:
        return encodeComposite3DTile(tile, dataView, byteOffset, options, encode3DTileToDataView);
      case TILE3D_TYPE.POINT_CLOUD:
        return encodePointCloud3DTile(tile, dataView, byteOffset, options);
      case TILE3D_TYPE.BATCHED_3D_MODEL:
        return encodeBatchedModel3DTile(tile, dataView, byteOffset, options);
      case TILE3D_TYPE.INSTANCED_3D_MODEL:
        return encodeInstancedModel3DTile(tile, dataView, byteOffset, options);
      default:
        throw new Error("3D Tiles: unknown tile type");
    }
  }

  // src/tile-3d-writer.ts
  var Tile3DWriter = {
    name: "3D Tile",
    id: "3d-tiles",
    module: "3d-tiles",
    version: VERSION3,
    extensions: ["cmpt", "pnts", "b3dm", "i3dm"],
    mimeTypes: ["application/octet-stream"],
    binary: true,
    options: {
      ["3d-tiles"]: {}
    },
    encode: async (tile, options) => encodeSync(tile, options),
    encodeSync
  };
  function encodeSync(tile, options) {
    return encode3DTile(tile, options);
  }
  return __toCommonJS(bundle_exports);
})();
/*! Bundled license information:

long/index.js:
  (**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
      return __exports__;
      });
