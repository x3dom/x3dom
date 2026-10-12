(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
        else if (typeof exports === 'object') exports['loaders'] = factory();
  else root['loaders'] = factory();})(globalThis, function () {
"use strict";
var __exports__ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // bundle.ts
  var bundle_exports = {};
  __export(bundle_exports, {
    FetchError: () => FetchError,
    JSONLoader: () => JSONLoader,
    NullLoader: () => NullLoader,
    NullWorkerLoader: () => NullWorkerLoader,
    RequestScheduler: () => RequestScheduler,
    _BrowserFileSystem: () => BrowserFileSystem,
    _fetchProgress: () => fetchProgress,
    _selectSource: () => selectSource2,
    _unregisterLoaders: () => _unregisterLoaders,
    assert: () => assert,
    concatenateArrayBuffersAsync: () => concatenateArrayBuffersAsync,
    createDataSource: () => createDataSource,
    document: () => document_,
    encode: () => encode,
    encodeInBatches: () => encodeInBatches,
    encodeSync: () => encodeSync,
    encodeTable: () => encodeTable,
    encodeTableAsText: () => encodeTableAsText,
    encodeTableInBatches: () => encodeTableInBatches,
    encodeText: () => encodeText,
    encodeTextSync: () => encodeTextSync,
    encodeURLtoURL: () => encodeURLtoURL,
    fetchFile: () => fetchFile,
    forEach: () => forEach,
    getLoaderOptions: () => getGlobalLoaderOptions,
    getPathPrefix: () => getPathPrefix,
    global: () => global_,
    isAsyncIterable: () => isAsyncIterable,
    isBrowser: () => isBrowser,
    isIterable: () => isIterable,
    isIterator: () => isIterator,
    isPromise: () => isPromise,
    isPureObject: () => isPureObject,
    isReadableStream: () => isReadableStream,
    isResponse: () => isResponse,
    isWorker: () => isWorker,
    isWritableStream: () => isWritableStream,
    load: () => load,
    loadInBatches: () => loadInBatches,
    makeIterator: () => makeIterator,
    makeLineIterator: () => makeLineIterator,
    makeNumberedLineIterator: () => makeNumberedLineIterator,
    makeStream: () => makeStream,
    makeTextDecoderIterator: () => makeTextDecoderIterator,
    makeTextEncoderIterator: () => makeTextEncoderIterator,
    parse: () => parse,
    parseInBatches: () => parseInBatches,
    parseSync: () => parseSync,
    readArrayBuffer: () => readArrayBuffer,
    registerLoaders: () => registerLoaders,
    resolvePath: () => resolvePath,
    selectLoader: () => selectLoader,
    selectLoaderSync: () => selectLoaderSync,
    self: () => self_,
    setLoaderOptions: () => setGlobalOptions,
    setPathPrefix: () => setPathPrefix,
    window: () => window_
  });

  // ../loader-utils/src/lib/env-utils/assert.ts
  function assert(condition, message) {
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
  var isWorker = typeof importScripts === "function";
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
  function assert2(condition, message) {
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
    assert2(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
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
    assert2(messageType === "string" || messageType === "object");
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
  function leftPad(string, length = 8) {
    const padLength = Math.max(length - string.length, 0);
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
        if (!predefined.find((name) => key === name)) {
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
      assert2(method);
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

  // ../loader-utils/src/lib/log-utils/log.ts
  var VERSION2 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";
  var version = VERSION2[0] >= "0" && VERSION2[0] <= "9" ? `v${VERSION2}` : "";
  function createLog() {
    const log2 = new ProbeLog({ id: "loaders.gl" });
    globalThis.loaders ||= {};
    globalThis.loaders.log = log2;
    globalThis.loaders.version = version;
    globalThis.probe ||= {};
    globalThis.probe.loaders = log2;
    return log2;
  }
  var log = createLog();

  // ../loader-utils/src/lib/javascript-utils/is-type.ts
  var isBoolean = (value) => typeof value === "boolean";
  var isFunction = (value) => typeof value === "function";
  var isObject = (value) => value !== null && typeof value === "object";
  var isPureObject = (value) => isObject(value) && value.constructor === {}.constructor;
  var isSharedArrayBuffer = (value) => typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer;
  var isArrayBufferLike = (value) => isObject(value) && typeof value.byteLength === "number" && typeof value.slice === "function";
  var isPromise = (value) => isObject(value) && "then" in value && isFunction(value.then);
  var isIterable = (value) => Boolean(value) && isFunction(value[Symbol.iterator]);
  var isAsyncIterable = (value) => Boolean(value) && isFunction(value[Symbol.asyncIterator]);
  var isIterator = (value) => Boolean(value) && isFunction(value.next);
  var isResponse = (value) => typeof Response !== "undefined" && value instanceof Response || isObject(value) && isFunction(value.arrayBuffer) && isFunction(value.text) && isFunction(value.json);
  var isBlob = (value) => typeof Blob !== "undefined" && value instanceof Blob;
  var isWritableDOMStream = (value) => isObject(value) && isFunction(value.abort) && isFunction(value.getWriter);
  var isReadableDOMStream = (value) => typeof ReadableStream !== "undefined" && value instanceof ReadableStream || isObject(value) && isFunction(value.tee) && isFunction(value.cancel) && isFunction(value.getReader);
  var isWritableNodeStream = (value) => isObject(value) && isFunction(value.end) && isFunction(value.write) && isBoolean(value.writable);
  var isReadableNodeStream = (value) => isObject(value) && isFunction(value.read) && isFunction(value.pipe) && isBoolean(value.readable);
  var isReadableStream = (value) => isReadableDOMStream(value) || isReadableNodeStream(value);
  var isWritableStream = (value) => isWritableDOMStream(value) || isWritableNodeStream(value);

  // ../loader-utils/src/lib/option-utils/merge-options.ts
  function mergeOptions(baseOptions, newOptions) {
    return mergeOptionsRecursively(baseOptions || {}, newOptions);
  }
  function mergeOptionsRecursively(baseOptions, newOptions, level = 0) {
    if (level > 3) {
      return newOptions;
    }
    const options = { ...baseOptions };
    for (const [key, newValue] of Object.entries(newOptions)) {
      if (newValue && typeof newValue === "object" && !Array.isArray(newValue)) {
        options[key] = mergeOptionsRecursively(
          options[key] || {},
          newOptions[key],
          level + 1
        );
      } else {
        options[key] = newOptions[key];
      }
    }
    return options;
  }

  // ../loader-utils/src/lib/module-utils/js-module-utils.ts
  function registerJSModules(modules) {
    globalThis.loaders ||= {};
    globalThis.loaders.modules ||= {};
    Object.assign(globalThis.loaders.modules, modules);
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
  var VERSION3 = getVersion();

  // ../worker-utils/src/lib/env-utils/assert.ts
  function assert3(condition, message) {
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
  var isMobile = typeof window !== "undefined" && typeof window.orientation !== "undefined";
  var matches2 = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
  var nodeVersion2 = matches2 && parseFloat(matches2[1]) || 0;

  // ../worker-utils/src/lib/worker-farm/worker-job.ts
  var WorkerJob = class {
    name;
    workerThread;
    isRunning = true;
    /** Promise that resolves when Job is done */
    result;
    _resolve = () => {
    };
    _reject = () => {
    };
    constructor(jobName, workerThread) {
      this.name = jobName;
      this.workerThread = workerThread;
      this.result = new Promise((resolve2, reject) => {
        this._resolve = resolve2;
        this._reject = reject;
      });
    }
    /**
     * Send a message to the job's worker thread
     * @param data any data structure, ideally consisting mostly of transferrable objects
     */
    postMessage(type, payload) {
      this.workerThread.postMessage({
        source: "loaders.gl",
        // Lets worker ignore unrelated messages
        type,
        payload
      });
    }
    /**
     * Call to resolve the `result` Promise with the supplied value
     */
    done(value) {
      assert3(this.isRunning);
      this.isRunning = false;
      this._resolve(value);
    }
    /**
     * Call to reject the `result` Promise with the supplied error
     */
    error(error) {
      assert3(this.isRunning);
      this.isRunning = false;
      this._reject(error);
    }
  };

  // ../worker-utils/src/lib/node/worker_threads-browser.ts
  var NodeWorker = class {
    terminate() {
    }
  };

  // ../worker-utils/src/lib/worker-utils/get-loadable-worker-url.ts
  var workerURLCache = /* @__PURE__ */ new Map();
  function getLoadableWorkerURL(props) {
    assert3(props.source && !props.url || !props.source && props.url);
    let workerURL = workerURLCache.get(props.source || props.url);
    if (!workerURL) {
      if (props.url) {
        workerURL = getLoadableWorkerURLFromURL(props.url);
        workerURLCache.set(props.url, workerURL);
      }
      if (props.source) {
        workerURL = getLoadableWorkerURLFromSource(props.source);
        workerURLCache.set(props.source, workerURL);
      }
    }
    assert3(workerURL);
    return workerURL;
  }
  function getLoadableWorkerURLFromURL(url) {
    if (!url.startsWith("http")) {
      return url;
    }
    const workerSource = buildScriptSource(url);
    return getLoadableWorkerURLFromSource(workerSource);
  }
  function getLoadableWorkerURLFromSource(workerSource) {
    const blob = new Blob([workerSource], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }
  function buildScriptSource(workerUrl) {
    return `try {
  importScripts('${workerUrl}');
} catch (error) {
  console.error(error);
  throw error;
}`;
  }

  // ../worker-utils/src/lib/worker-utils/get-transfer-list.ts
  function getTransferList(object, recursive = true, transfers) {
    const transfersSet = transfers || /* @__PURE__ */ new Set();
    if (!object) {
    } else if (isTransferable(object)) {
      transfersSet.add(object);
    } else if (isTransferable(object.buffer)) {
      transfersSet.add(object.buffer);
    } else if (ArrayBuffer.isView(object)) {
    } else if (recursive && typeof object === "object") {
      for (const key in object) {
        getTransferList(object[key], recursive, transfersSet);
      }
    }
    return transfers === void 0 ? Array.from(transfersSet) : [];
  }
  function isTransferable(object) {
    if (!object) {
      return false;
    }
    if (object instanceof ArrayBuffer) {
      return true;
    }
    if (typeof MessagePort !== "undefined" && object instanceof MessagePort) {
      return true;
    }
    if (typeof ImageBitmap !== "undefined" && object instanceof ImageBitmap) {
      return true;
    }
    if (typeof OffscreenCanvas !== "undefined" && object instanceof OffscreenCanvas) {
      return true;
    }
    return false;
  }
  function getTransferListForWriter(object) {
    if (object === null) {
      return {};
    }
    const clone = Object.assign({}, object);
    Object.keys(clone).forEach((key) => {
      if (typeof object[key] === "object" && !ArrayBuffer.isView(object[key]) && !(object[key] instanceof Array)) {
        clone[key] = getTransferListForWriter(object[key]);
      } else if (typeof clone[key] === "function" || clone[key] instanceof RegExp) {
        clone[key] = {};
      } else {
        clone[key] = object[key];
      }
    });
    return clone;
  }

  // ../worker-utils/src/lib/worker-farm/worker-thread.ts
  var NOOP = () => {
  };
  var WorkerThread = class {
    name;
    source;
    url;
    terminated = false;
    worker;
    onMessage;
    onError;
    _loadableURL = "";
    /** Checks if workers are supported on this platform */
    static isSupported() {
      return typeof Worker !== "undefined" && isBrowser3 || typeof NodeWorker !== "undefined" && !isBrowser3;
    }
    constructor(props) {
      const { name, source, url } = props;
      assert3(source || url);
      this.name = name;
      this.source = source;
      this.url = url;
      this.onMessage = NOOP;
      this.onError = (error) => console.log(error);
      this.worker = isBrowser3 ? this._createBrowserWorker() : this._createNodeWorker();
    }
    /**
     * Terminate this worker thread
     * @note Can free up significant memory
     */
    destroy() {
      this.onMessage = NOOP;
      this.onError = NOOP;
      this.worker.terminate();
      this.terminated = true;
    }
    get isRunning() {
      return Boolean(this.onMessage);
    }
    /**
     * Send a message to this worker thread
     * @param data any data structure, ideally consisting mostly of transferrable objects
     * @param transferList If not supplied, calculated automatically by traversing data
     */
    postMessage(data, transferList) {
      transferList = transferList || getTransferList(data);
      this.worker.postMessage(data, transferList);
    }
    // PRIVATE
    /**
     * Generate a standard Error from an ErrorEvent
     * @param event
     */
    _getErrorFromErrorEvent(event) {
      let message = "Failed to load ";
      message += `worker ${this.name} from ${this.url}. `;
      if (event.message) {
        message += `${event.message} in `;
      }
      if (event.lineno) {
        message += `:${event.lineno}:${event.colno}`;
      }
      return new Error(message);
    }
    /**
     * Creates a worker thread on the browser
     */
    _createBrowserWorker() {
      this._loadableURL = getLoadableWorkerURL({ source: this.source, url: this.url });
      const worker = new Worker(this._loadableURL, { name: this.name });
      worker.onmessage = (event) => {
        if (!event.data) {
          this.onError(new Error("No data received"));
        } else {
          this.onMessage(event.data);
        }
      };
      worker.onerror = (error) => {
        this.onError(this._getErrorFromErrorEvent(error));
        this.terminated = true;
      };
      worker.onmessageerror = (event) => console.error(event);
      return worker;
    }
    /**
     * Creates a worker thread in node.js
     * @todo https://nodejs.org/api/async_hooks.html#async-resource-worker-pool
     */
    _createNodeWorker() {
      let worker;
      if (this.url) {
        const absolute = this.url.includes(":/") || this.url.startsWith("/");
        const url = absolute ? this.url : `./${this.url}`;
        const type = this.url.endsWith(".ts") || this.url.endsWith(".mjs") ? "module" : "commonjs";
        worker = new NodeWorker(url, { eval: false, type });
      } else if (this.source) {
        worker = new NodeWorker(this.source, { eval: true });
      } else {
        throw new Error("no worker");
      }
      worker.on("message", (data) => {
        this.onMessage(data);
      });
      worker.on("error", (error) => {
        this.onError(error);
      });
      worker.on("exit", (code) => {
      });
      return worker;
    }
  };

  // ../worker-utils/src/lib/worker-farm/worker-pool.ts
  var WorkerPool = class {
    name = "unnamed";
    source;
    // | Function;
    url;
    maxConcurrency = 1;
    maxMobileConcurrency = 1;
    onDebug = () => {
    };
    reuseWorkers = true;
    props = {};
    jobQueue = [];
    idleQueue = [];
    count = 0;
    isDestroyed = false;
    /** Checks if workers are supported on this platform */
    static isSupported() {
      return WorkerThread.isSupported();
    }
    /**
     * @param processor - worker function
     * @param maxConcurrency - max count of workers
     */
    constructor(props) {
      this.source = props.source;
      this.url = props.url;
      this.setProps(props);
    }
    /**
     * Terminates all workers in the pool
     * @note Can free up significant memory
     */
    destroy() {
      this.idleQueue.forEach((worker) => worker.destroy());
      this.isDestroyed = true;
    }
    setProps(props) {
      this.props = { ...this.props, ...props };
      if (props.name !== void 0) {
        this.name = props.name;
      }
      if (props.maxConcurrency !== void 0) {
        this.maxConcurrency = props.maxConcurrency;
      }
      if (props.maxMobileConcurrency !== void 0) {
        this.maxMobileConcurrency = props.maxMobileConcurrency;
      }
      if (props.reuseWorkers !== void 0) {
        this.reuseWorkers = props.reuseWorkers;
      }
      if (props.onDebug !== void 0) {
        this.onDebug = props.onDebug;
      }
    }
    async startJob(name, onMessage3 = (job, type, data) => job.done(data), onError = (job, error) => job.error(error)) {
      const startPromise = new Promise((onStart) => {
        this.jobQueue.push({ name, onMessage: onMessage3, onError, onStart });
        return this;
      });
      this._startQueuedJob();
      return await startPromise;
    }
    // PRIVATE
    /**
     * Starts first queued job if worker is available or can be created
     * Called when job is started and whenever a worker returns to the idleQueue
     */
    async _startQueuedJob() {
      if (!this.jobQueue.length) {
        return;
      }
      const workerThread = this._getAvailableWorker();
      if (!workerThread) {
        return;
      }
      const queuedJob = this.jobQueue.shift();
      if (queuedJob) {
        this.onDebug({
          message: "Starting job",
          name: queuedJob.name,
          workerThread,
          backlog: this.jobQueue.length
        });
        const job = new WorkerJob(queuedJob.name, workerThread);
        workerThread.onMessage = (data) => queuedJob.onMessage(job, data.type, data.payload);
        workerThread.onError = (error) => queuedJob.onError(job, error);
        queuedJob.onStart(job);
        try {
          await job.result;
        } catch (error) {
          console.error(`Worker exception: ${error}`);
        } finally {
          this.returnWorkerToQueue(workerThread);
        }
      }
    }
    /**
     * Returns a worker to the idle queue
     * Destroys the worker if
     *  - pool is destroyed
     *  - if this pool doesn't reuse workers
     *  - if maxConcurrency has been lowered
     * @param worker
     */
    returnWorkerToQueue(worker) {
      const shouldDestroyWorker = (
        // Workers on Node.js prevent the process from exiting.
        // Until we figure out how to close them before exit, we always destroy them
        !isBrowser3 || // If the pool is destroyed, there is no reason to keep the worker around
        this.isDestroyed || // If the app has disabled worker reuse, any completed workers should be destroyed
        !this.reuseWorkers || // If concurrency has been lowered, this worker might be surplus to requirements
        this.count > this._getMaxConcurrency()
      );
      if (shouldDestroyWorker) {
        worker.destroy();
        this.count--;
      } else {
        this.idleQueue.push(worker);
      }
      if (!this.isDestroyed) {
        this._startQueuedJob();
      }
    }
    /**
     * Returns idle worker or creates new worker if maxConcurrency has not been reached
     */
    _getAvailableWorker() {
      if (this.idleQueue.length > 0) {
        return this.idleQueue.shift() || null;
      }
      if (this.count < this._getMaxConcurrency()) {
        this.count++;
        const name = `${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`;
        return new WorkerThread({ name, source: this.source, url: this.url });
      }
      return null;
    }
    _getMaxConcurrency() {
      return isMobile ? this.maxMobileConcurrency : this.maxConcurrency;
    }
  };

  // ../worker-utils/src/lib/worker-farm/worker-farm.ts
  var DEFAULT_PROPS = {
    maxConcurrency: 3,
    maxMobileConcurrency: 1,
    reuseWorkers: true,
    onDebug: () => {
    }
  };
  var _WorkerFarm = class {
    props;
    workerPools = /* @__PURE__ */ new Map();
    /** Checks if workers are supported on this platform */
    static isSupported() {
      return WorkerThread.isSupported();
    }
    /** Get the singleton instance of the global worker farm */
    static getWorkerFarm(props = {}) {
      _WorkerFarm._workerFarm = _WorkerFarm._workerFarm || new _WorkerFarm({});
      _WorkerFarm._workerFarm.setProps(props);
      return _WorkerFarm._workerFarm;
    }
    /** get global instance with WorkerFarm.getWorkerFarm() */
    constructor(props) {
      this.props = { ...DEFAULT_PROPS };
      this.setProps(props);
      this.workerPools = /* @__PURE__ */ new Map();
    }
    /**
     * Terminate all workers in the farm
     * @note Can free up significant memory
     */
    destroy() {
      for (const workerPool of this.workerPools.values()) {
        workerPool.destroy();
      }
      this.workerPools = /* @__PURE__ */ new Map();
    }
    /**
     * Set props used when initializing worker pools
     * @param props
     */
    setProps(props) {
      this.props = { ...this.props, ...props };
      for (const workerPool of this.workerPools.values()) {
        workerPool.setProps(this._getWorkerPoolProps());
      }
    }
    /**
     * Returns a worker pool for the specified worker
     * @param options - only used first time for a specific worker name
     * @param options.name - the name of the worker - used to identify worker pool
     * @param options.url -
     * @param options.source -
     * @example
     *   const job = WorkerFarm.getWorkerFarm().getWorkerPool({name, url}).startJob(...);
     */
    getWorkerPool(options) {
      const { name, source, url } = options;
      let workerPool = this.workerPools.get(name);
      if (!workerPool) {
        workerPool = new WorkerPool({
          name,
          source,
          url
        });
        workerPool.setProps(this._getWorkerPoolProps());
        this.workerPools.set(name, workerPool);
      }
      return workerPool;
    }
    _getWorkerPoolProps() {
      return {
        maxConcurrency: this.props.maxConcurrency,
        maxMobileConcurrency: this.props.maxMobileConcurrency,
        reuseWorkers: this.props.reuseWorkers,
        onDebug: this.props.onDebug
      };
    }
  };
  var WorkerFarm = _WorkerFarm;
  // singleton
  __publicField(WorkerFarm, "_workerFarm");

  // ../worker-utils/src/lib/worker-api/get-worker-url.ts
  function getWorkerName(worker) {
    const warning = worker.version !== VERSION3 ? ` (worker-utils@${VERSION3})` : "";
    return `${worker.name}@${worker.version}${warning}`;
  }
  function getWorkerURL(worker, options = {}) {
    const workerOptions = options[worker.id] || {};
    const workerFile = isBrowser3 ? worker.workerFile || `${worker.id}-worker.js` : `${worker.id}-worker-node.js`;
    let url = workerOptions.workerUrl;
    if (!url && worker.id === "compression") {
      url = options.workerUrl;
    }
    const workerType = options._workerType || options?.core?._workerType;
    if (workerType === "test") {
      if (isBrowser3) {
        url = `modules/${worker.module}/dist/${workerFile}`;
      } else {
        url = `modules/${worker.module}/src/workers/${worker.id}-worker-node.ts`;
      }
    }
    if (!url) {
      let version2 = worker.version;
      if (version2 === "latest") {
        version2 = NPM_TAG;
      }
      const versionTag = version2 ? `@${version2}` : "";
      url = `https://unpkg.com/@loaders.gl/${worker.module}${versionTag}/dist/${workerFile}`;
    }
    assert3(url);
    return url;
  }

  // ../worker-utils/src/lib/worker-api/process-on-worker.ts
  async function processOnWorker(worker, data, options = {}, context = {}) {
    const name = getWorkerName(worker);
    const workerFarm = WorkerFarm.getWorkerFarm(options);
    const { source } = options;
    const workerPoolProps = { name, source };
    if (!source) {
      workerPoolProps.url = getWorkerURL(worker, options);
    }
    const workerPool = workerFarm.getWorkerPool(workerPoolProps);
    const jobName = options.jobName || worker.name;
    const job = await workerPool.startJob(
      jobName,
      // eslint-disable-next-line
      onMessage.bind(null, context)
    );
    const transferableOptions = getTransferListForWriter(options);
    job.postMessage("process", { input: data, options: transferableOptions });
    const result = await job.result;
    return result.result;
  }
  async function onMessage(context, job, type, payload) {
    switch (type) {
      case "done":
        job.done(payload);
        break;
      case "error":
        job.error(new Error(payload.error));
        break;
      case "process":
        const { id, input, options } = payload;
        try {
          if (!context.process) {
            job.postMessage("error", { id, error: "Worker not set up to process on main thread" });
            return;
          }
          const result = await context.process(input, options);
          job.postMessage("done", { id, result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "unknown error";
          job.postMessage("error", { id, error: message });
        }
        break;
      default:
        console.warn(`process-on-worker: unknown message ${type}`);
    }
  }

  // ../worker-utils/src/lib/worker-api/validate-worker-version.ts
  function validateWorkerVersion(worker, coreVersion = VERSION3) {
    assert3(worker, "no worker provided");
    const workerVersion = worker.version;
    if (!coreVersion || !workerVersion) {
      return false;
    }
    return true;
  }

  // ../loader-utils/src/lib/worker-loader-utils/parse-with-worker.ts
  function canParseWithWorker(loader, options) {
    if (!WorkerFarm.isSupported()) {
      return false;
    }
    const nodeWorkers = options?._nodeWorkers ?? options?.core?._nodeWorkers;
    if (!isBrowser3 && !nodeWorkers) {
      return false;
    }
    const useWorkers = options?.worker ?? options?.core?.worker;
    return Boolean(loader.worker && useWorkers);
  }
  async function parseWithWorker(loader, data, options, context, parseOnMainThread) {
    const name = loader.id;
    const url = getWorkerURL(loader, options);
    const workerFarm = WorkerFarm.getWorkerFarm(options?.core);
    const workerPool = workerFarm.getWorkerPool({ name, url });
    options = JSON.parse(JSON.stringify(options || {}));
    options._workerLoaderId = loader.id;
    context = JSON.parse(JSON.stringify(context || {}));
    const job = await workerPool.startJob(
      "process-on-worker",
      // @ts-expect-error
      onMessage2.bind(null, parseOnMainThread)
      // eslint-disable-line @typescript-eslint/no-misused-promises
    );
    job.postMessage("process", {
      // @ts-ignore
      input: data,
      options,
      context
    });
    const result = await job.result;
    return await result.result;
  }
  async function onMessage2(parseOnMainThread, job, type, payload) {
    switch (type) {
      case "done":
        job.done(payload);
        break;
      case "error":
        job.error(new Error(payload.error));
        break;
      case "process":
        const { id, input, options } = payload;
        try {
          const result = await parseOnMainThread(input, options);
          job.postMessage("done", { id, result });
        } catch (error) {
          const message = error instanceof Error ? error.message : "unknown error";
          job.postMessage("error", { id, error: message });
        }
        break;
      default:
        console.warn(`parse-with-worker unknown message ${type}`);
    }
  }

  // ../loader-utils/src/lib/worker-loader-utils/encode-with-worker.ts
  function canEncodeWithWorker(writer, options) {
    if (!WorkerFarm.isSupported()) {
      return false;
    }
    const nodeWorkers = options?._nodeWorkers ?? options?.core?._nodeWorkers;
    const useWorkers = options?.worker ?? options?.core?.worker;
    if (!isBrowser && !nodeWorkers) {
      return false;
    }
    return Boolean(writer.worker && useWorkers);
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
    const byteLength = sourceArrays.reduce((length, typedArray) => length + typedArray.byteLength, 0);
    const result = new Uint8Array(byteLength);
    let offset = 0;
    for (const sourceArray of sourceArrays) {
      result.set(sourceArray, offset);
      offset += sourceArray.byteLength;
    }
    return result.buffer;
  }

  // ../loader-utils/src/lib/iterators/text-iterators.ts
  async function* makeTextDecoderIterator(arrayBufferIterator, options = {}) {
    const textDecoder = new TextDecoder(void 0, options);
    for await (const arrayBuffer of arrayBufferIterator) {
      yield typeof arrayBuffer === "string" ? arrayBuffer : textDecoder.decode(arrayBuffer, { stream: true });
    }
  }
  async function* makeTextEncoderIterator(textIterator) {
    const textEncoder = new TextEncoder();
    for await (const text of textIterator) {
      yield typeof text === "string" ? textEncoder.encode(text).buffer : text;
    }
  }
  async function* makeLineIterator(textIterator) {
    let previous = "";
    for await (const textChunk of textIterator) {
      previous += textChunk;
      let eolIndex;
      while ((eolIndex = previous.indexOf("\n")) >= 0) {
        const line = previous.slice(0, eolIndex + 1);
        previous = previous.slice(eolIndex + 1);
        yield line;
      }
    }
    if (previous.length > 0) {
      yield previous;
    }
  }
  async function* makeNumberedLineIterator(lineIterator) {
    let counter = 1;
    for await (const line of lineIterator) {
      yield { counter, line };
      counter++;
    }
  }

  // ../loader-utils/src/lib/iterators/async-iteration.ts
  async function forEach(iterable, visitor) {
    const iterator = toAsyncIterator(iterable);
    while (true) {
      const { done, value } = await iterator.next();
      if (done) {
        if (iterator.return) {
          iterator.return();
        }
        return;
      }
      const cancel = visitor(value);
      if (cancel) {
        return;
      }
    }
  }
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
    const copy = new Uint8Array(view.length);
    copy.set(view);
    return copy.buffer;
  }
  function toAsyncIterator(iterable) {
    if (typeof iterable[Symbol.asyncIterator] === "function") {
      return iterable[Symbol.asyncIterator]();
    }
    if (typeof iterable[Symbol.iterator] === "function") {
      const iterator = iterable[Symbol.iterator]();
      return iteratorToAsyncIterator(iterator);
    }
    return iterable;
  }
  function iteratorToAsyncIterator(iterator) {
    return {
      next(value) {
        return Promise.resolve(iterator.next(value));
      },
      return(value) {
        if (typeof iterator.return === "function") {
          return Promise.resolve(iterator.return(value));
        }
        return Promise.resolve({ done: true, value });
      },
      throw(error) {
        if (typeof iterator.throw === "function") {
          return Promise.resolve(iterator.throw(error));
        }
        return Promise.reject(error);
      }
    };
  }

  // ../../node_modules/@probe.gl/stats/dist/utils/hi-res-timestamp.js
  function getHiResTimestamp2() {
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
      this._startTime = getHiResTimestamp2();
      this._timerPending = true;
      return this;
    }
    /** End a timer. Adds to time and bumps the timing count. */
    timeEnd() {
      if (!this._timerPending) {
        return this;
      }
      this.addTime(getHiResTimestamp2() - this._startTime);
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

  // ../loader-utils/src/lib/request-utils/request-scheduler.ts
  var STAT_QUEUED_REQUESTS = "Queued Requests";
  var STAT_ACTIVE_REQUESTS = "Active Requests";
  var STAT_CANCELLED_REQUESTS = "Cancelled Requests";
  var STAT_QUEUED_REQUESTS_EVER = "Queued Requests Ever";
  var STAT_ACTIVE_REQUESTS_EVER = "Active Requests Ever";
  var DEFAULT_PROPS2 = {
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
      this.props = { ...DEFAULT_PROPS2, ...props };
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
          if (this.updateTimer === null) {
            this.updateTimer = setTimeout(() => this._issueNewRequestsAsync(), 0);
          }
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

  // ../loader-utils/src/lib/path-utils/file-aliases.ts
  var pathPrefix = "";
  var fileAliases = {};
  function setPathPrefix(prefix) {
    pathPrefix = prefix;
  }
  function getPathPrefix() {
    return pathPrefix;
  }
  function resolvePath(filename2) {
    for (const alias in fileAliases) {
      if (filename2.startsWith(alias)) {
        const replacement = fileAliases[alias];
        filename2 = filename2.replace(alias, replacement);
      }
    }
    if (!filename2.startsWith("http://") && !filename2.startsWith("https://")) {
      filename2 = `${pathPrefix}${filename2}`;
    }
    return filename2;
  }

  // ../loader-utils/src/json-loader.ts
  var VERSION4 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";
  var JSONLoader = {
    dataType: null,
    batchType: null,
    name: "JSON",
    id: "json",
    module: "json",
    version: VERSION4,
    extensions: ["json", "geojson"],
    mimeTypes: ["application/json"],
    category: "json",
    text: true,
    parseTextSync,
    parse: async (arrayBuffer) => parseTextSync(new TextDecoder().decode(arrayBuffer)),
    options: {}
  };
  function parseTextSync(text) {
    return JSON.parse(text);
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
    const copy = new Uint8Array(view.length);
    copy.set(view);
    return copy.buffer;
  }
  function toArrayBufferView(data) {
    if (ArrayBuffer.isView(data)) {
      return data;
    }
    return new Uint8Array(data);
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
    async read(start, length) {
      const arrayBuffer = await this.handle.slice(Number(start), Number(start) + Number(length)).arrayBuffer();
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
    async read(start, length) {
      throw NOT_IMPLEMENTED;
    }
    /** Write to file. The number of bytes written will be returned */
    async write(arrayBuffer, offset, length) {
      throw NOT_IMPLEMENTED;
    }
    /** Get information about file */
    async stat() {
      throw NOT_IMPLEMENTED;
    }
    /** Truncates the file descriptor. Only available on NodeFile. */
    async truncate(length) {
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

  // src/lib/fetch/fetch-error.ts
  var FetchError = class extends Error {
    constructor(message, info) {
      super(message);
      this.reason = info.reason;
      this.url = info.url;
      this.response = info.response;
    }
    /** A best effort reason for why the fetch failed */
    reason;
    /** The URL that failed to load. Empty string if not available. */
    url;
    /** The Response object, if any. */
    response;
  };

  // src/lib/utils/mime-type-utils.ts
  var DATA_URL_PATTERN = /^data:([-\w.]+\/[-\w.+]+)(;|,)/;
  var MIME_TYPE_PATTERN = /^([-\w.]+\/[-\w.+]+)/;
  function compareMIMETypes(mimeType1, mimeType2) {
    if (mimeType1.toLowerCase() === mimeType2.toLowerCase()) {
      return true;
    }
    return false;
  }
  function parseMIMEType(mimeString) {
    const matches3 = MIME_TYPE_PATTERN.exec(mimeString);
    if (matches3) {
      return matches3[1];
    }
    return mimeString;
  }
  function parseMIMETypeFromURL(url) {
    const matches3 = DATA_URL_PATTERN.exec(url);
    if (matches3) {
      return matches3[1];
    }
    return "";
  }

  // src/lib/utils/url-utils.ts
  var QUERY_STRING_PATTERN = /\?.*/;
  function extractQueryString(url) {
    const matches3 = url.match(QUERY_STRING_PATTERN);
    return matches3 && matches3[0];
  }
  function stripQueryString(url) {
    return url.replace(QUERY_STRING_PATTERN, "");
  }
  function shortenUrlForDisplay(url) {
    if (url.length < 50) {
      return url;
    }
    const urlEnd = url.slice(url.length - 15);
    const urlStart = url.substr(0, 32);
    return `${urlStart}...${urlEnd}`;
  }

  // src/lib/utils/resource-utils.ts
  function getResourceUrl(resource) {
    if (isResponse(resource)) {
      return resource.url;
    }
    if (isBlob(resource)) {
      const fileName = "name" in resource ? resource.name : "";
      return fileName || "";
    }
    if (typeof resource === "string") {
      return resource;
    }
    return "";
  }
  function getResourceMIMEType(resource) {
    if (isResponse(resource)) {
      const contentTypeHeader = resource.headers.get("content-type") || "";
      const noQueryUrl = stripQueryString(resource.url);
      return parseMIMEType(contentTypeHeader) || parseMIMETypeFromURL(noQueryUrl);
    }
    if (isBlob(resource)) {
      return resource.type || "";
    }
    if (typeof resource === "string") {
      return parseMIMETypeFromURL(resource);
    }
    return "";
  }
  function getResourceContentLength(resource) {
    if (isResponse(resource)) {
      const response = resource;
      return response.headers["content-length"] || -1;
    }
    if (isBlob(resource)) {
      const blob = resource;
      return blob.size;
    }
    if (typeof resource === "string") {
      return resource.length;
    }
    if (resource instanceof ArrayBuffer) {
      return resource.byteLength;
    }
    if (ArrayBuffer.isView(resource)) {
      return resource.byteLength;
    }
    return -1;
  }

  // src/lib/utils/response-utils.ts
  async function makeResponse(resource) {
    if (isResponse(resource)) {
      return resource;
    }
    const headers = {};
    const contentLength = getResourceContentLength(resource);
    if (contentLength >= 0) {
      headers["content-length"] = String(contentLength);
    }
    const url = getResourceUrl(resource);
    const type = getResourceMIMEType(resource);
    if (type) {
      headers["content-type"] = type;
    }
    const initialDataUrl = await getInitialDataUrl(resource);
    if (initialDataUrl) {
      headers["x-first-bytes"] = initialDataUrl;
    }
    if (typeof resource === "string") {
      resource = new TextEncoder().encode(resource);
    }
    const response = new Response(resource, { headers });
    Object.defineProperty(response, "url", { value: url });
    return response;
  }
  async function checkResponse(response) {
    if (!response.ok) {
      const error = await getResponseError(response);
      throw error;
    }
  }
  async function getResponseError(response) {
    const shortUrl = shortenUrlForDisplay(response.url);
    let message = `Failed to fetch resource (${response.status}) ${response.statusText}: ${shortUrl}`;
    message = message.length > 100 ? `${message.slice(0, 100)}...` : message;
    const info = {
      reason: response.statusText,
      url: response.url,
      response
    };
    try {
      const contentType = response.headers.get("Content-Type");
      info.reason = !response.bodyUsed && contentType?.includes("application/json") ? await response.json() : await response.text();
    } catch (error) {
    }
    return new FetchError(message, info);
  }
  async function getInitialDataUrl(resource) {
    const INITIAL_DATA_LENGTH = 5;
    if (typeof resource === "string") {
      return `data:,${resource.slice(0, INITIAL_DATA_LENGTH)}`;
    }
    if (resource instanceof Blob) {
      const blobSlice = resource.slice(0, 5);
      return await new Promise((resolve2) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve2(event?.target?.result);
        reader.readAsDataURL(blobSlice);
      });
    }
    if (resource instanceof ArrayBuffer) {
      const slice = resource.slice(0, INITIAL_DATA_LENGTH);
      const base64 = arrayBufferToBase64(slice);
      return `data:base64,${base64}`;
    }
    return null;
  }
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // src/lib/fetch/fetch-file.ts
  function isNodePath(url) {
    return !isRequestURL(url) && !isDataURL(url);
  }
  function isRequestURL(url) {
    return url.startsWith("http:") || url.startsWith("https:");
  }
  function isDataURL(url) {
    return url.startsWith("data:");
  }
  async function fetchFile(urlOrData, fetchOptions) {
    if (typeof urlOrData === "string") {
      const url = resolvePath(urlOrData);
      if (isNodePath(url)) {
        if (globalThis.loaders?.fetchNode) {
          return globalThis.loaders?.fetchNode(url, fetchOptions);
        }
      }
      return await fetch(url, fetchOptions);
    }
    return await makeResponse(urlOrData);
  }

  // src/lib/fetch/read-array-buffer.ts
  async function readArrayBuffer(file, start, length) {
    if (!(file instanceof Blob)) {
      file = new Blob([file]);
    }
    const slice = file.slice(start, start + length);
    return await readBlob(slice);
  }
  async function readBlob(blob) {
    return await new Promise((resolve2, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve2(event?.target?.result);
      fileReader.onerror = (error) => reject(error);
      fileReader.readAsArrayBuffer(blob);
    });
  }

  // src/lib/loader-utils/loggers.ts
  var probeLog = new ProbeLog({ id: "loaders.gl" });
  var NullLog = class {
    log() {
      return () => {
      };
    }
    info() {
      return () => {
      };
    }
    warn() {
      return () => {
      };
    }
    error() {
      return () => {
      };
    }
  };
  var ConsoleLog = class {
    console;
    constructor() {
      this.console = console;
    }
    log(...args) {
      return this.console.log.bind(this.console, ...args);
    }
    info(...args) {
      return this.console.info.bind(this.console, ...args);
    }
    warn(...args) {
      return this.console.warn.bind(this.console, ...args);
    }
    error(...args) {
      return this.console.error.bind(this.console, ...args);
    }
  };

  // src/lib/loader-utils/option-defaults.ts
  var DEFAULT_LOADER_OPTIONS = {
    core: {
      baseUrl: void 0,
      // baseUrl
      fetch: null,
      mimeType: void 0,
      fallbackMimeType: void 0,
      ignoreRegisteredLoaders: void 0,
      nothrow: false,
      log: new ConsoleLog(),
      // A probe.gl compatible (`log.log()()` syntax) that just logs to console
      useLocalLibraries: false,
      CDN: "https://unpkg.com/@loaders.gl",
      worker: true,
      // By default, use worker if provided by loader.
      maxConcurrency: 3,
      // How many worker instances should be created for each loader.
      maxMobileConcurrency: 1,
      // How many worker instances should be created for each loader on mobile devices.
      reuseWorkers: isBrowser,
      // By default reuse workers in browser (Node.js refuses to terminate if browsers are running)
      _nodeWorkers: false,
      // By default do not support node workers
      _workerType: "",
      // 'test' to use locally generated workers
      limit: 0,
      _limitMB: 0,
      batchSize: "auto",
      batchDebounceMs: 0,
      metadata: false,
      // TODO - currently only implemented for parseInBatches, adds initial metadata batch,
      transforms: []
    }
  };
  var REMOVED_LOADER_OPTIONS = {
    // deprecated top-level alias
    baseUri: "core.baseUrl",
    fetch: "core.fetch",
    mimeType: "core.mimeType",
    fallbackMimeType: "core.fallbackMimeType",
    ignoreRegisteredLoaders: "core.ignoreRegisteredLoaders",
    nothrow: "core.nothrow",
    log: "core.log",
    useLocalLibraries: "core.useLocalLibraries",
    CDN: "core.CDN",
    worker: "core.worker",
    maxConcurrency: "core.maxConcurrency",
    maxMobileConcurrency: "core.maxMobileConcurrency",
    reuseWorkers: "core.reuseWorkers",
    _nodeWorkers: "core.nodeWorkers",
    _workerType: "core._workerType",
    _worker: "core._workerType",
    limit: "core.limit",
    _limitMB: "core._limitMB",
    batchSize: "core.batchSize",
    batchDebounceMs: "core.batchDebounceMs",
    metadata: "core.metadata",
    transforms: "core.transforms",
    // Older deprecations
    throws: "nothrow",
    dataType: "(no longer used)",
    uri: "core.baseUrl",
    // Warn if fetch options are used on toplevel
    method: "core.fetch.method",
    headers: "core.fetch.headers",
    body: "core.fetch.body",
    mode: "core.fetch.mode",
    credentials: "core.fetch.credentials",
    cache: "core.fetch.cache",
    redirect: "core.fetch.redirect",
    referrer: "core.fetch.referrer",
    referrerPolicy: "core.fetch.referrerPolicy",
    integrity: "core.fetch.integrity",
    keepalive: "core.fetch.keepalive",
    signal: "core.fetch.signal"
  };

  // src/lib/loader-utils/option-utils.ts
  var CORE_LOADER_OPTION_KEYS = [
    "baseUrl",
    "fetch",
    "mimeType",
    "fallbackMimeType",
    "ignoreRegisteredLoaders",
    "nothrow",
    "log",
    "useLocalLibraries",
    "CDN",
    "worker",
    "maxConcurrency",
    "maxMobileConcurrency",
    "reuseWorkers",
    "_nodeWorkers",
    "_workerType",
    "limit",
    "_limitMB",
    "batchSize",
    "batchDebounceMs",
    "metadata",
    "transforms"
  ];
  function getGlobalLoaderState() {
    globalThis.loaders = globalThis.loaders || {};
    const { loaders } = globalThis;
    if (!loaders._state) {
      loaders._state = {};
    }
    return loaders._state;
  }
  function getGlobalLoaderOptions() {
    const state = getGlobalLoaderState();
    state.globalOptions = state.globalOptions || {
      ...DEFAULT_LOADER_OPTIONS,
      core: { ...DEFAULT_LOADER_OPTIONS.core }
    };
    return normalizeLoaderOptions(state.globalOptions);
  }
  function setGlobalOptions(options) {
    const state = getGlobalLoaderState();
    const globalOptions = getGlobalLoaderOptions();
    state.globalOptions = normalizeOptionsInternal(globalOptions, options);
    registerJSModules(options.modules);
  }
  function normalizeOptions(options, loader, loaders, url) {
    loaders = loaders || [];
    loaders = Array.isArray(loaders) ? loaders : [loaders];
    validateOptions(options, loaders);
    return normalizeLoaderOptions(normalizeOptionsInternal(loader, options, url));
  }
  function normalizeLoaderOptions(options) {
    const normalized = cloneLoaderOptions(options);
    moveDeprecatedTopLevelOptionsToCore(normalized);
    for (const key of CORE_LOADER_OPTION_KEYS) {
      if (normalized.core && normalized.core[key] !== void 0) {
        delete normalized[key];
      }
    }
    if (normalized.core && normalized.core._workerType !== void 0) {
      delete normalized._worker;
    }
    return normalized;
  }
  function validateOptions(options, loaders) {
    validateOptionsObject(options, null, DEFAULT_LOADER_OPTIONS, REMOVED_LOADER_OPTIONS, loaders);
    for (const loader of loaders) {
      const idOptions = options && options[loader.id] || {};
      const loaderOptions = loader.options && loader.options[loader.id] || {};
      const deprecatedOptions = loader.deprecatedOptions && loader.deprecatedOptions[loader.id] || {};
      validateOptionsObject(idOptions, loader.id, loaderOptions, deprecatedOptions, loaders);
    }
  }
  function validateOptionsObject(options, id, defaultOptions, deprecatedOptions, loaders) {
    const loaderName = id || "Top level";
    const prefix = id ? `${id}.` : "";
    for (const key in options) {
      const isSubOptions = !id && isObject(options[key]);
      const isBaseUriOption = key === "baseUri" && !id;
      const isWorkerUrlOption = key === "workerUrl" && id;
      if (!(key in defaultOptions) && !isBaseUriOption && !isWorkerUrlOption) {
        if (key in deprecatedOptions) {
          if (probeLog.level > 0) {
            probeLog.warn(
              `${loaderName} loader option '${prefix}${key}' no longer supported, use '${deprecatedOptions[key]}'`
            )();
          }
        } else if (!isSubOptions) {
          if (probeLog.level > 0) {
            const suggestion = findSimilarOption(key, loaders);
            probeLog.warn(
              `${loaderName} loader option '${prefix}${key}' not recognized. ${suggestion}`
            )();
          }
        }
      }
    }
  }
  function findSimilarOption(optionKey, loaders) {
    const lowerCaseOptionKey = optionKey.toLowerCase();
    let bestSuggestion = "";
    for (const loader of loaders) {
      for (const key in loader.options) {
        if (optionKey === key) {
          return `Did you mean '${loader.id}.${key}'?`;
        }
        const lowerCaseKey = key.toLowerCase();
        const isPartialMatch = lowerCaseOptionKey.startsWith(lowerCaseKey) || lowerCaseKey.startsWith(lowerCaseOptionKey);
        if (isPartialMatch) {
          bestSuggestion = bestSuggestion || `Did you mean '${loader.id}.${key}'?`;
        }
      }
    }
    return bestSuggestion;
  }
  function normalizeOptionsInternal(loader, options, url) {
    const loaderDefaultOptions = loader.options || {};
    const mergedOptions = { ...loaderDefaultOptions };
    if (loaderDefaultOptions.core) {
      mergedOptions.core = { ...loaderDefaultOptions.core };
    }
    moveDeprecatedTopLevelOptionsToCore(mergedOptions);
    if (mergedOptions.core?.log === null) {
      mergedOptions.core = { ...mergedOptions.core, log: new NullLog() };
    }
    mergeNestedFields(mergedOptions, normalizeLoaderOptions(getGlobalLoaderOptions()));
    const userOptions = normalizeLoaderOptions(options);
    mergeNestedFields(mergedOptions, userOptions);
    addUrlOptions(mergedOptions, url);
    addDeprecatedTopLevelOptions(mergedOptions);
    return mergedOptions;
  }
  function mergeNestedFields(mergedOptions, options) {
    for (const key in options) {
      if (key in options) {
        const value = options[key];
        if (isPureObject(value) && isPureObject(mergedOptions[key])) {
          mergedOptions[key] = {
            ...mergedOptions[key],
            ...options[key]
          };
        } else {
          mergedOptions[key] = options[key];
        }
      }
    }
  }
  function addUrlOptions(options, url) {
    if (!url) {
      return;
    }
    const hasCoreBaseUrl = options.core?.baseUrl !== void 0;
    if (!hasCoreBaseUrl) {
      options.core ||= {};
      options.core.baseUrl = path_exports.dirname(stripQueryString(url));
    }
  }
  function cloneLoaderOptions(options) {
    const clonedOptions = { ...options };
    if (options.core) {
      clonedOptions.core = { ...options.core };
    }
    return clonedOptions;
  }
  function moveDeprecatedTopLevelOptionsToCore(options) {
    if (options.baseUri !== void 0) {
      options.core ||= {};
      if (options.core.baseUrl === void 0) {
        options.core.baseUrl = options.baseUri;
      }
    }
    for (const key of CORE_LOADER_OPTION_KEYS) {
      if (options[key] !== void 0) {
        const coreOptions = options.core = options.core || {};
        const coreRecord = coreOptions;
        if (coreRecord[key] === void 0) {
          coreRecord[key] = options[key];
        }
      }
    }
    const workerTypeAlias = options._worker;
    if (workerTypeAlias !== void 0) {
      options.core ||= {};
      if (options.core._workerType === void 0) {
        options.core._workerType = workerTypeAlias;
      }
    }
  }
  function addDeprecatedTopLevelOptions(options) {
    const coreOptions = options.core;
    if (!coreOptions) {
      return;
    }
    for (const key of CORE_LOADER_OPTION_KEYS) {
      if (coreOptions[key] !== void 0) {
        options[key] = coreOptions[key];
      }
    }
  }

  // src/lib/loader-utils/normalize-loader.ts
  function isLoaderObject(loader) {
    if (!loader) {
      return false;
    }
    if (Array.isArray(loader)) {
      loader = loader[0];
    }
    const hasExtensions = Array.isArray(loader?.extensions);
    return hasExtensions;
  }
  function normalizeLoader(loader) {
    assert(loader, "null loader");
    assert(isLoaderObject(loader), "invalid loader");
    let options;
    if (Array.isArray(loader)) {
      options = loader[1];
      loader = loader[0];
      loader = {
        ...loader,
        options: { ...loader.options, ...options }
      };
    }
    if (loader?.parseTextSync || loader?.parseText) {
      loader.text = true;
    }
    if (!loader.text) {
      loader.binary = true;
    }
    return loader;
  }

  // src/lib/api/register-loaders.ts
  var getGlobalLoaderRegistry = () => {
    const state = getGlobalLoaderState();
    state.loaderRegistry = state.loaderRegistry || [];
    return state.loaderRegistry;
  };
  function registerLoaders(loaders) {
    const loaderRegistry = getGlobalLoaderRegistry();
    loaders = Array.isArray(loaders) ? loaders : [loaders];
    for (const loader of loaders) {
      const normalizedLoader = normalizeLoader(loader);
      if (!loaderRegistry.find((registeredLoader) => normalizedLoader === registeredLoader)) {
        loaderRegistry.unshift(normalizedLoader);
      }
    }
  }
  function getRegisteredLoaders() {
    return getGlobalLoaderRegistry();
  }
  function _unregisterLoaders() {
    const state = getGlobalLoaderState();
    state.loaderRegistry = [];
  }

  // src/lib/api/select-loader.ts
  var EXT_PATTERN = /\.([^.]+)$/;
  async function selectLoader(data, loaders = [], options, context) {
    if (!validHTTPResponse(data)) {
      return null;
    }
    const normalizedOptions = normalizeLoaderOptions(options || {});
    normalizedOptions.core ||= {};
    if (data instanceof Response && mayContainText(data)) {
      const text = await data.clone().text();
      const textLoader = selectLoaderSync(
        text,
        loaders,
        { ...normalizedOptions, core: { ...normalizedOptions.core, nothrow: true } },
        context
      );
      if (textLoader) {
        return textLoader;
      }
    }
    let loader = selectLoaderSync(
      data,
      loaders,
      { ...normalizedOptions, core: { ...normalizedOptions.core, nothrow: true } },
      context
    );
    if (loader) {
      return loader;
    }
    if (isBlob(data)) {
      data = await data.slice(0, 10).arrayBuffer();
      loader = selectLoaderSync(data, loaders, normalizedOptions, context);
    }
    if (!loader && data instanceof Response && mayContainText(data)) {
      const text = await data.clone().text();
      loader = selectLoaderSync(text, loaders, normalizedOptions, context);
    }
    if (!loader && !normalizedOptions.core.nothrow) {
      throw new Error(getNoValidLoaderMessage(data));
    }
    return loader;
  }
  function mayContainText(response) {
    const mimeType = getResourceMIMEType(response);
    return Boolean(
      mimeType && (mimeType.startsWith("text/") || mimeType === "application/json" || mimeType.endsWith("+json"))
    );
  }
  function selectLoaderSync(data, loaders = [], options, context) {
    if (!validHTTPResponse(data)) {
      return null;
    }
    const normalizedOptions = normalizeLoaderOptions(options || {});
    normalizedOptions.core ||= {};
    if (loaders && !Array.isArray(loaders)) {
      return normalizeLoader(loaders);
    }
    let candidateLoaders = [];
    if (loaders) {
      candidateLoaders = candidateLoaders.concat(loaders);
    }
    if (!normalizedOptions.core.ignoreRegisteredLoaders) {
      candidateLoaders.push(...getRegisteredLoaders());
    }
    normalizeLoaders(candidateLoaders);
    const loader = selectLoaderInternal(data, candidateLoaders, normalizedOptions, context);
    if (!loader && !normalizedOptions.core.nothrow) {
      throw new Error(getNoValidLoaderMessage(data));
    }
    return loader;
  }
  function selectLoaderInternal(data, loaders, options, context) {
    const url = getResourceUrl(data);
    const type = getResourceMIMEType(data);
    const testUrl = stripQueryString(url) || context?.url;
    let loader = null;
    let reason = "";
    if (options?.core?.mimeType) {
      loader = findLoaderByMIMEType(loaders, options?.core?.mimeType);
      reason = `match forced by supplied MIME type ${options?.core?.mimeType}`;
    }
    loader = loader || findLoaderByUrl(loaders, testUrl);
    reason = reason || (loader ? `matched url ${testUrl}` : "");
    loader = loader || findLoaderByMIMEType(loaders, type);
    reason = reason || (loader ? `matched MIME type ${type}` : "");
    loader = loader || findLoaderByInitialBytes(loaders, data);
    reason = reason || (loader ? `matched initial data ${getFirstCharacters(data)}` : "");
    if (options?.core?.fallbackMimeType) {
      loader = loader || findLoaderByMIMEType(loaders, options?.core?.fallbackMimeType);
      reason = reason || (loader ? `matched fallback MIME type ${type}` : "");
    }
    if (reason) {
      log.log(1, `selectLoader selected ${loader?.name}: ${reason}.`);
    }
    return loader;
  }
  function validHTTPResponse(data) {
    if (data instanceof Response) {
      if (data.status === 204) {
        return false;
      }
    }
    return true;
  }
  function getNoValidLoaderMessage(data) {
    const url = getResourceUrl(data);
    const type = getResourceMIMEType(data);
    let message = "No valid loader found (";
    message += url ? `${path_exports.filename(url)}, ` : "no url provided, ";
    message += `MIME type: ${type ? `"${type}"` : "not provided"}, `;
    const firstCharacters = data ? getFirstCharacters(data) : "";
    message += firstCharacters ? ` first bytes: "${firstCharacters}"` : "first bytes: not available";
    message += ")";
    return message;
  }
  function normalizeLoaders(loaders) {
    for (const loader of loaders) {
      normalizeLoader(loader);
    }
  }
  function findLoaderByUrl(loaders, url) {
    const match = url && EXT_PATTERN.exec(url);
    const extension = match && match[1];
    return extension ? findLoaderByExtension(loaders, extension) : null;
  }
  function findLoaderByExtension(loaders, extension) {
    extension = extension.toLowerCase();
    for (const loader of loaders) {
      for (const loaderExtension of loader.extensions) {
        if (loaderExtension.toLowerCase() === extension) {
          return loader;
        }
      }
    }
    return null;
  }
  function findLoaderByMIMEType(loaders, mimeType) {
    for (const loader of loaders) {
      if (loader.mimeTypes?.some((mimeType1) => compareMIMETypes(mimeType, mimeType1))) {
        return loader;
      }
      if (compareMIMETypes(mimeType, `application/x.${loader.id}`)) {
        return loader;
      }
    }
    return null;
  }
  function findLoaderByInitialBytes(loaders, data) {
    if (!data) {
      return null;
    }
    for (const loader of loaders) {
      if (typeof data === "string") {
        if (testDataAgainstText(data, loader)) {
          return loader;
        }
      } else if (ArrayBuffer.isView(data)) {
        if (testDataAgainstBinary(data.buffer, data.byteOffset, loader)) {
          return loader;
        }
      } else if (data instanceof ArrayBuffer) {
        const byteOffset = 0;
        if (testDataAgainstBinary(data, byteOffset, loader)) {
          return loader;
        }
      }
    }
    return null;
  }
  function testDataAgainstText(data, loader) {
    if (loader.testText) {
      return loader.testText(data);
    }
    const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
    return tests.some((test) => data.startsWith(test));
  }
  function testDataAgainstBinary(data, byteOffset, loader) {
    const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
    return tests.some((test) => testBinary(data, byteOffset, loader, test));
  }
  function testBinary(data, byteOffset, loader, test) {
    if (isArrayBufferLike(test)) {
      return compareArrayBuffers(test, data, test.byteLength);
    }
    switch (typeof test) {
      case "function":
        return test(ensureArrayBuffer(data));
      case "string":
        const magic = getMagicString(data, byteOffset, test.length);
        return test === magic;
      default:
        return false;
    }
  }
  function getFirstCharacters(data, length = 5) {
    if (typeof data === "string") {
      return data.slice(0, length);
    } else if (ArrayBuffer.isView(data)) {
      return getMagicString(data.buffer, data.byteOffset, length);
    } else if (data instanceof ArrayBuffer) {
      const byteOffset = 0;
      return getMagicString(data, byteOffset, length);
    }
    return "";
  }
  function getMagicString(arrayBuffer, byteOffset, length) {
    if (arrayBuffer.byteLength < byteOffset + length) {
      return "";
    }
    const dataView = new DataView(arrayBuffer);
    let magic = "";
    for (let i = 0; i < length; i++) {
      magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
    }
    return magic;
  }

  // src/iterators/make-iterator/make-string-iterator.ts
  var DEFAULT_CHUNK_SIZE = 256 * 1024;
  function* makeStringIterator(string, options) {
    const chunkSize = options?.chunkSize || DEFAULT_CHUNK_SIZE;
    let offset = 0;
    const textEncoder = new TextEncoder();
    while (offset < string.length) {
      const chunkLength = Math.min(string.length - offset, chunkSize);
      const chunk = string.slice(offset, offset + chunkLength);
      offset += chunkLength;
      yield ensureArrayBuffer(textEncoder.encode(chunk));
    }
  }

  // src/iterators/make-iterator/make-array-buffer-iterator.ts
  var DEFAULT_CHUNK_SIZE2 = 256 * 1024;
  function* makeArrayBufferIterator(arrayBuffer, options = {}) {
    const { chunkSize = DEFAULT_CHUNK_SIZE2 } = options;
    let byteOffset = 0;
    while (byteOffset < arrayBuffer.byteLength) {
      const chunkByteLength = Math.min(arrayBuffer.byteLength - byteOffset, chunkSize);
      const chunk = new ArrayBuffer(chunkByteLength);
      const sourceArray = new Uint8Array(arrayBuffer, byteOffset, chunkByteLength);
      const chunkArray = new Uint8Array(chunk);
      chunkArray.set(sourceArray);
      byteOffset += chunkByteLength;
      yield chunk;
    }
  }

  // src/iterators/make-iterator/make-blob-iterator.ts
  var DEFAULT_CHUNK_SIZE3 = 1024 * 1024;
  async function* makeBlobIterator(blob, options) {
    const chunkSize = options?.chunkSize || DEFAULT_CHUNK_SIZE3;
    let offset = 0;
    while (offset < blob.size) {
      const end = offset + chunkSize;
      const chunk = await blob.slice(offset, end).arrayBuffer();
      offset = end;
      yield chunk;
    }
  }

  // src/iterators/make-iterator/make-stream-iterator.ts
  function makeStreamIterator(stream, options) {
    return isBrowser ? makeBrowserStreamIterator(stream, options) : makeNodeStreamIterator(stream, options);
  }
  async function* makeBrowserStreamIterator(stream, options) {
    const reader = stream.getReader();
    let nextBatchPromise;
    try {
      while (true) {
        const currentBatchPromise = nextBatchPromise || reader.read();
        if (options?._streamReadAhead) {
          nextBatchPromise = reader.read();
        }
        const { done, value } = await currentBatchPromise;
        if (done) {
          return;
        }
        yield toArrayBuffer2(value);
      }
    } catch (error) {
      reader.releaseLock();
    }
  }
  async function* makeNodeStreamIterator(stream, options) {
    for await (const chunk of stream) {
      yield toArrayBuffer2(chunk);
    }
  }

  // src/iterators/make-iterator/make-iterator.ts
  function makeIterator(data, options) {
    if (typeof data === "string") {
      return makeStringIterator(data, options);
    }
    if (data instanceof ArrayBuffer) {
      return makeArrayBufferIterator(data, options);
    }
    if (isBlob(data)) {
      return makeBlobIterator(data, options);
    }
    if (isReadableStream(data)) {
      return makeStreamIterator(data, options);
    }
    if (isResponse(data)) {
      const responseBody = data.body;
      if (!responseBody) {
        throw new Error("Readable stream not available on Response");
      }
      return makeStreamIterator(responseBody, options);
    }
    throw new Error("makeIterator");
  }

  // src/lib/loader-utils/get-data.ts
  var ERR_DATA = "Cannot convert supplied data type";
  function getArrayBufferOrStringFromDataSync(data, loader, options) {
    if (loader.text && typeof data === "string") {
      return data;
    }
    if (isBuffer(data)) {
      data = data.buffer;
    }
    if (isArrayBufferLike(data)) {
      const bufferSource = toArrayBufferView(data);
      if (loader.text && !loader.binary) {
        const textDecoder = new TextDecoder("utf8");
        return textDecoder.decode(bufferSource);
      }
      return toArrayBuffer2(bufferSource);
    }
    throw new Error(ERR_DATA);
  }
  async function getArrayBufferOrStringFromData(data, loader, options) {
    if (typeof data === "string" || isArrayBufferLike(data)) {
      return getArrayBufferOrStringFromDataSync(data, loader, options);
    }
    if (isBlob(data)) {
      data = await makeResponse(data);
    }
    if (isResponse(data)) {
      await checkResponse(data);
      return loader.binary ? await data.arrayBuffer() : await data.text();
    }
    if (isReadableStream(data)) {
      data = makeIterator(data, options);
    }
    if (isIterable(data) || isAsyncIterable(data)) {
      return concatenateArrayBuffersAsync(data);
    }
    throw new Error(ERR_DATA);
  }
  async function getAsyncIterableFromData(data, options) {
    if (isPromise(data)) {
      data = await data;
    }
    if (isIterator(data)) {
      return data;
    }
    if (isResponse(data)) {
      await checkResponse(data);
      const body = await data.body;
      if (!body) {
        throw new Error(ERR_DATA);
      }
      return makeIterator(body, options);
    }
    if (isBlob(data) || isReadableStream(data)) {
      return makeIterator(data, options);
    }
    if (isAsyncIterable(data)) {
      return data;
    }
    if (isIterable(data)) {
      return data;
    }
    return getIterableFromData(data);
  }
  function getIterableFromData(data) {
    if (ArrayBuffer.isView(data)) {
      return function* oneChunk() {
        yield toArrayBuffer2(data);
      }();
    }
    if (isArrayBufferLike(data)) {
      return function* oneChunk() {
        yield toArrayBuffer2(data);
      }();
    }
    if (isIterator(data)) {
      return data;
    }
    if (isIterable(data)) {
      return data[Symbol.iterator]();
    }
    throw new Error(ERR_DATA);
  }

  // src/lib/loader-utils/get-fetch-function.ts
  function getFetchFunction(options, context) {
    const globalOptions = getGlobalLoaderOptions();
    const loaderOptions = options || globalOptions;
    const fetchOption = loaderOptions.fetch ?? loaderOptions.core?.fetch;
    if (typeof fetchOption === "function") {
      return fetchOption;
    }
    if (isObject(fetchOption)) {
      return (url) => fetchFile(url, fetchOption);
    }
    if (context?.fetch) {
      return context?.fetch;
    }
    return fetchFile;
  }

  // src/lib/loader-utils/loader-context.ts
  function getLoaderContext(context, options, parentContext) {
    if (parentContext) {
      return parentContext;
    }
    const newContext = {
      fetch: getFetchFunction(options, context),
      ...context
    };
    if (newContext.url) {
      const baseUrl = stripQueryString(newContext.url);
      newContext.baseUrl = baseUrl;
      newContext.queryString = extractQueryString(newContext.url);
      newContext.filename = path_exports.filename(baseUrl);
      newContext.baseUrl = path_exports.dirname(baseUrl);
    }
    if (!Array.isArray(newContext.loaders)) {
      newContext.loaders = null;
    }
    return newContext;
  }
  function getLoadersFromContext(loaders, context) {
    if (loaders && !Array.isArray(loaders)) {
      return loaders;
    }
    let candidateLoaders;
    if (loaders) {
      candidateLoaders = Array.isArray(loaders) ? loaders : [loaders];
    }
    if (context && context.loaders) {
      const contextLoaders = Array.isArray(context.loaders) ? context.loaders : [context.loaders];
      candidateLoaders = candidateLoaders ? [...candidateLoaders, ...contextLoaders] : contextLoaders;
    }
    return candidateLoaders && candidateLoaders.length ? candidateLoaders : void 0;
  }

  // src/lib/api/parse.ts
  async function parse(data, loaders, options, context) {
    if (loaders && !Array.isArray(loaders) && !isLoaderObject(loaders)) {
      context = void 0;
      options = loaders;
      loaders = void 0;
    }
    data = await data;
    options = options || {};
    const url = getResourceUrl(data);
    const typedLoaders = loaders;
    const candidateLoaders = getLoadersFromContext(typedLoaders, context);
    const loader = await selectLoader(data, candidateLoaders, options);
    if (!loader) {
      return null;
    }
    const strictOptions = normalizeOptions(options, loader, candidateLoaders, url);
    context = getLoaderContext(
      // @ts-expect-error
      { url, _parse: parse, loaders: candidateLoaders },
      strictOptions,
      context || null
    );
    return await parseWithLoader(loader, data, strictOptions, context);
  }
  async function parseWithLoader(loader, data, options, context) {
    validateWorkerVersion(loader);
    options = mergeOptions(loader.options, options);
    if (isResponse(data)) {
      const { ok, redirected, status, statusText, type, url } = data;
      const headers = Object.fromEntries(data.headers.entries());
      context.response = { headers, ok, redirected, status, statusText, type, url };
    }
    data = await getArrayBufferOrStringFromData(data, loader, options);
    const loaderWithParser = loader;
    if (loaderWithParser.parseTextSync && typeof data === "string") {
      return loaderWithParser.parseTextSync(data, options, context);
    }
    if (canParseWithWorker(loader, options)) {
      return await parseWithWorker(loader, data, options, context, parse);
    }
    if (loaderWithParser.parseText && typeof data === "string") {
      return await loaderWithParser.parseText(data, options, context);
    }
    if (loaderWithParser.parse) {
      return await loaderWithParser.parse(data, options, context);
    }
    assert3(!loaderWithParser.parseSync);
    throw new Error(`${loader.id} loader - no parser found and worker is disabled`);
  }

  // src/lib/api/parse-sync.ts
  function parseSync(data, loaders, options, context) {
    if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
      context = void 0;
      options = loaders;
      loaders = void 0;
    }
    options = options || {};
    const typedLoaders = loaders;
    const candidateLoaders = getLoadersFromContext(typedLoaders, context);
    const loader = selectLoaderSync(data, candidateLoaders, options);
    if (!loader) {
      return null;
    }
    const strictOptions = normalizeOptions(options, loader, candidateLoaders);
    const url = getResourceUrl(data);
    const parse2 = () => {
      throw new Error("parseSync called parse (which is async");
    };
    context = getLoaderContext(
      { url, _parseSync: parse2, _parse: parse2, loaders },
      strictOptions,
      context || null
    );
    return parseWithLoaderSync(loader, data, strictOptions, context);
  }
  function parseWithLoaderSync(loader, data, options, context) {
    data = getArrayBufferOrStringFromDataSync(data, loader, options);
    if (loader.parseTextSync && typeof data === "string") {
      return loader.parseTextSync(data, options);
    }
    if (loader.parseSync && data instanceof ArrayBuffer) {
      return loader.parseSync(data, options, context);
    }
    throw new Error(
      `${loader.name} loader: 'parseSync' not supported by this loader, use 'parse' instead. ${context.url || ""}`
    );
  }

  // ../schema-utils/src/lib/table/tables/table-accessors.ts
  function isTable(table) {
    const shape = typeof table === "object" && table?.shape;
    switch (shape) {
      case "array-row-table":
      case "object-row-table":
        return Array.isArray(table.data);
      case "geojson-table":
        return Array.isArray(table.features);
      case "columnar-table":
        return table.data && typeof table.data === "object";
      case "arrow-table":
        return Boolean(table?.data?.numRows !== void 0);
      default:
        return false;
    }
  }
  function getTableLength(table) {
    switch (table.shape) {
      case "array-row-table":
      case "object-row-table":
        return table.data.length;
      case "geojson-table":
        return table.features.length;
      case "arrow-table":
        const arrowTable = table.data;
        return arrowTable.numRows;
      case "columnar-table":
        for (const column of Object.values(table.data)) {
          return column.length || 0;
        }
        return 0;
      default:
        throw new Error("table");
    }
  }

  // ../schema-utils/src/lib/table/batches/make-table-batch-iterator.ts
  function makeBatchFromTable(table) {
    return { ...table, length: getTableLength(table), batchType: "data" };
  }

  // src/lib/api/parse-in-batches.ts
  async function parseInBatches(data, loaders, options, context) {
    const loaderArray = Array.isArray(loaders) ? loaders : void 0;
    if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
      context = void 0;
      options = loaders;
      loaders = void 0;
    }
    data = await data;
    options = options || {};
    const url = getResourceUrl(data);
    const loader = await selectLoader(data, loaders, options);
    if (!loader) {
      return [];
    }
    const strictOptions = normalizeOptions(options, loader, loaderArray, url);
    context = getLoaderContext(
      { url, _parseInBatches: parseInBatches, _parse: parse, loaders: loaderArray },
      strictOptions,
      context || null
    );
    return await parseWithLoaderInBatches(loader, data, strictOptions, context);
  }
  async function parseWithLoaderInBatches(loader, data, options, context) {
    const outputIterator = await parseToOutputIterator(loader, data, options, context);
    if (!options?.core?.metadata) {
      return outputIterator;
    }
    const metadataBatch = {
      shape: "metadata",
      batchType: "metadata",
      metadata: {
        _loader: loader,
        _context: context
      },
      // Populate with some default fields to avoid crashing
      data: [],
      bytesUsed: 0
    };
    async function* makeMetadataBatchIterator(iterator) {
      yield metadataBatch;
      yield* iterator;
    }
    return makeMetadataBatchIterator(outputIterator);
  }
  async function parseToOutputIterator(loader, data, options, context) {
    const inputIterator = await getAsyncIterableFromData(data, options);
    const transformedIterator = await applyInputTransforms(
      inputIterator,
      options?.core?.transforms || []
    );
    if (loader.parseInBatches) {
      return loader.parseInBatches(transformedIterator, options, context);
    }
    return parseChunkInBatches(transformedIterator, loader, options, context);
  }
  async function* parseChunkInBatches(transformedIterator, loader, options, context) {
    const arrayBuffer = await concatenateArrayBuffersAsync(transformedIterator);
    const parsedData = await parse(
      arrayBuffer,
      loader,
      // TODO - Hack: supply loaders MIME type to ensure we match it
      { ...options, core: { ...options?.core, mimeType: loader.mimeTypes[0] } },
      context
    );
    const batch = convertDataToBatch(parsedData, loader);
    yield batch;
  }
  function convertDataToBatch(parsedData, loader) {
    const batch = isTable(parsedData) ? makeBatchFromTable(parsedData) : {
      shape: "unknown",
      batchType: "data",
      data: parsedData,
      length: Array.isArray(parsedData) ? parsedData.length : 1
    };
    batch.mimeType = loader.mimeTypes[0];
    return batch;
  }
  async function applyInputTransforms(inputIterator, transforms = []) {
    let iteratorChain = inputIterator;
    for await (const transformBatches of transforms) {
      iteratorChain = transformBatches(iteratorChain);
    }
    return iteratorChain;
  }

  // src/lib/api/load.ts
  async function load(url, loaders, options, context) {
    let resolvedLoaders;
    let resolvedOptions;
    if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
      resolvedLoaders = [];
      resolvedOptions = loaders;
      context = void 0;
    } else {
      resolvedLoaders = loaders;
      resolvedOptions = options;
    }
    const fetch2 = getFetchFunction(resolvedOptions);
    let data = url;
    if (typeof url === "string") {
      data = await fetch2(url);
    }
    if (isBlob(url)) {
      data = await fetch2(url);
    }
    if (typeof url === "string") {
      const normalizedOptions = normalizeLoaderOptions(resolvedOptions || {});
      if (!normalizedOptions.core?.baseUrl) {
        resolvedOptions = {
          ...resolvedOptions,
          core: {
            ...resolvedOptions?.core,
            baseUrl: url
          }
        };
      }
    }
    return Array.isArray(resolvedLoaders) ? await parse(data, resolvedLoaders, resolvedOptions) : await parse(data, resolvedLoaders, resolvedOptions);
  }

  // src/lib/api/load-in-batches.ts
  function loadInBatches(files, loaders, options, context) {
    let loadersArray;
    if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
      context = void 0;
      options = loaders;
      loadersArray = void 0;
    } else {
      loadersArray = loaders;
    }
    const fetch2 = getFetchFunction(options || {});
    if (!Array.isArray(files)) {
      return loadOneFileInBatches(files, loadersArray, options || {}, fetch2);
    }
    const promises = files.map(
      (file) => loadOneFileInBatches(file, loadersArray, options || {}, fetch2)
    );
    return promises;
  }
  async function loadOneFileInBatches(file, loaders, options, fetch2) {
    if (typeof file === "string") {
      const url = file;
      const response = await fetch2(url);
      return Array.isArray(loaders) ? await parseInBatches(response, loaders, options) : await parseInBatches(response, loaders, options);
    }
    return Array.isArray(loaders) ? await parseInBatches(file, loaders, options) : await parseInBatches(file, loaders, options);
  }

  // src/lib/api/encode-table.ts
  async function encodeTable(data, writer, options) {
    if (writer.encode) {
      return await writer.encode(data, options);
    }
    if (writer.encodeText) {
      const text = await writer.encodeText(data, options);
      return ensureArrayBuffer(new TextEncoder().encode(text));
    }
    if (writer.encodeInBatches) {
      const batches = encodeTableInBatches(data, writer, options);
      const chunks = [];
      for await (const batch of batches) {
        chunks.push(batch);
      }
      return concatenateArrayBuffers(...chunks);
    }
    throw new Error("Writer could not encode data");
  }
  async function encodeTableAsText(data, writer, options) {
    if (writer.text && writer.encodeText) {
      return await writer.encodeText(data, options);
    }
    if (writer.text) {
      const arrayBuffer = await encodeTable(data, writer, options);
      return new TextDecoder().decode(arrayBuffer);
    }
    throw new Error(`Writer ${writer.name} could not encode data as text`);
  }
  function encodeTableInBatches(data, writer, options) {
    if (writer.encodeInBatches) {
      const dataIterator = getIterator(data);
      return writer.encodeInBatches(dataIterator, options);
    }
    throw new Error("Writer could not encode data in batches");
  }
  function getIterator(data) {
    const dataIterator = [{ ...data, start: 0, end: data.length }];
    return dataIterator;
  }

  // src/lib/api/encode.ts
  async function encode(data, writer, options_) {
    const globalOptions = getGlobalLoaderOptions();
    const options = { ...globalOptions, ...options_ };
    if (writer.encodeURLtoURL) {
      return encodeWithCommandLineTool(writer, data, options);
    }
    if (canEncodeWithWorker(writer, options)) {
      return await processOnWorker(writer, data, options);
    }
    return await writer.encode(data, options);
  }
  function encodeSync(data, writer, options) {
    if (writer.encodeSync) {
      return writer.encodeSync(data, options);
    }
    if (writer.encodeTextSync) {
      return ensureArrayBuffer(new TextEncoder().encode(writer.encodeTextSync(data, options)));
    }
    throw new Error(`Writer ${writer.name} could not synchronously encode data`);
  }
  async function encodeText(data, writer, options) {
    if (writer.encodeText) {
      return await writer.encodeText(data, options);
    }
    if (writer.encodeTextSync) {
      return writer.encodeTextSync(data, options);
    }
    if (writer.text) {
      const arrayBuffer = await writer.encode(data, options);
      return new TextDecoder().decode(arrayBuffer);
    }
    throw new Error(`Writer ${writer.name} could not encode data as text`);
  }
  function encodeTextSync(data, writer, options) {
    if (writer.encodeTextSync) {
      return writer.encodeTextSync(data, options);
    }
    if (writer.text && writer.encodeSync) {
      const arrayBuffer = encodeSync(data, writer, options);
      return new TextDecoder().decode(arrayBuffer);
    }
    throw new Error(`Writer ${writer.name} could not encode data as text`);
  }
  function encodeInBatches(data, writer, options) {
    if (writer.encodeInBatches) {
      const dataIterator = getIterator2(data);
      return writer.encodeInBatches(dataIterator, options);
    }
    throw new Error(`Writer ${writer.name} could not encode in batches`);
  }
  async function encodeURLtoURL(inputUrl, outputUrl, writer, options) {
    inputUrl = resolvePath(inputUrl);
    outputUrl = resolvePath(outputUrl);
    if (isBrowser || !writer.encodeURLtoURL) {
      throw new Error();
    }
    const outputFilename = await writer.encodeURLtoURL(inputUrl, outputUrl, options);
    return outputFilename;
  }
  async function encodeWithCommandLineTool(writer, data, options) {
    if (isBrowser) {
      throw new Error(`Writer ${writer.name} not supported in browser`);
    }
    const tmpInputFilename = getTemporaryFilename("input");
    const file = new NodeFileFacade(tmpInputFilename, "w");
    await file.write(data);
    const tmpOutputFilename = getTemporaryFilename("output");
    const outputFilename = await encodeURLtoURL(tmpInputFilename, tmpOutputFilename, writer, options);
    const response = await fetchFile(outputFilename);
    return response.arrayBuffer();
  }
  function getIterator2(data) {
    const dataIterator = [{ ...data, start: 0, end: data.length }];
    return dataIterator;
  }
  function getTemporaryFilename(filename2) {
    return `/tmp/${filename2}`;
  }

  // src/lib/api/create-data-source.ts
  function createDataSource(data, sources, options) {
    const type = options?.core?.type || options.type || "auto";
    const source = type === "auto" ? selectSource(data, sources) : getSourceOfType(type, sources);
    if (!source) {
      throw new Error("Not a valid source type");
    }
    return source.createDataSource(data, options);
  }
  function selectSource(url, sources) {
    for (const service of sources) {
      if (service.testURL && service.testURL(url)) {
        return service;
      }
    }
    return null;
  }
  function getSourceOfType(type, sources) {
    for (const service of sources) {
      if (service.type === type) {
        return service;
      }
    }
    return null;
  }

  // src/lib/api/select-source.ts
  function selectSource2(url, sources, options) {
    const type = options?.type || "auto";
    let selectedSource = null;
    if (type === "auto") {
      for (const source of sources) {
        if (typeof url === "string" && source.testURL && source.testURL(url)) {
          return source;
        }
      }
    } else {
      selectedSource = getSourceOfType2(type, sources);
    }
    if (!selectedSource && !options?.nothrow) {
      throw new Error("Not a valid image source type");
    }
    return selectedSource;
  }
  function getSourceOfType2(type, sources) {
    for (const service of sources) {
      if (service.type === type) {
        return service;
      }
    }
    return null;
  }

  // src/iterators/make-stream/make-stream.ts
  function makeStream(source, options) {
    if (globalThis.loaders.makeNodeStream) {
      return globalThis.loaders.makeNodeStream(source, options);
    }
    const iterator = source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
    return new ReadableStream(
      {
        // Create a byte stream (enables `Response(stream).arrayBuffer()`)
        // Only supported on Chrome
        // See: https://developer.mozilla.org/en-US/docs/Web/API/ReadableByteStreamController
        // @ts-ignore
        type: "bytes",
        async pull(controller) {
          try {
            const { done, value } = await iterator.next();
            if (done) {
              controller.close();
            } else {
              controller.enqueue(new Uint8Array(value));
            }
          } catch (error) {
            controller.error(error);
          }
        },
        async cancel() {
          await iterator?.return?.();
        }
      },
      // options: QueingStrategy<Uint8Array>
      {
        // This is bytes, not chunks
        highWaterMark: 2 ** 24,
        ...options
      }
    );
  }

  // src/null-loader.ts
  var VERSION5 = typeof __VERSION__ !== "undefined" ? __VERSION__ : "latest";
  var NullWorkerLoader = {
    dataType: null,
    batchType: null,
    name: "Null loader",
    id: "null",
    module: "core",
    version: VERSION5,
    worker: true,
    mimeTypes: ["application/x.empty"],
    extensions: ["null"],
    tests: [() => false],
    options: {
      null: {}
    }
  };
  var NullLoader = {
    dataType: null,
    batchType: null,
    name: "Null loader",
    id: "null",
    module: "core",
    version: VERSION5,
    mimeTypes: ["application/x.empty"],
    extensions: ["null"],
    parse: async (arrayBuffer, options, context) => parseSync2(arrayBuffer, options || {}, context),
    parseSync: parseSync2,
    parseInBatches: async function* generator(asyncIterator, options, context) {
      for await (const batch of asyncIterator) {
        yield parseSync2(batch, options, context);
      }
    },
    tests: [() => false],
    options: {
      null: {}
    }
  };
  function parseSync2(arrayBuffer, options, context) {
    return null;
  }

  // src/lib/progress/fetch-progress.ts
  async function fetchProgress(response, onProgress, onDone = () => {
  }, onError = () => {
  }) {
    response = await response;
    if (!response.ok) {
      return response;
    }
    const body = response.body;
    if (!body) {
      return response;
    }
    const contentLength = response.headers.get("content-length") || 0;
    const totalBytes = contentLength ? parseInt(contentLength) : 0;
    if (!(totalBytes > 0)) {
      return response;
    }
    if (typeof ReadableStream === "undefined" || !body.getReader) {
      return response;
    }
    const progressStream = new ReadableStream({
      async start(controller) {
        const reader = body.getReader();
        await read(controller, reader, 0, totalBytes, onProgress, onDone, onError);
      }
    });
    return new Response(progressStream);
  }
  async function read(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError) {
    try {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        controller.close();
        return;
      }
      loadedBytes += value.byteLength;
      const percent = Math.round(loadedBytes / totalBytes * 100);
      onProgress(percent, { loadedBytes, totalBytes });
      controller.enqueue(value);
      await read(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError);
    } catch (error) {
      controller.error(error);
      onError(error);
    }
  }

  // src/lib/filesystems/browser-filesystem.ts
  var BrowserFileSystem = class {
    _fetch;
    files = {};
    lowerCaseFiles = {};
    usedFiles = {};
    /**
     * A FileSystem API wrapper around a list of browser 'File' objects
     * @param files
     * @param options
     */
    constructor(files, options) {
      this._fetch = options?.fetch || fetch;
      for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        this.files[file.name] = file;
        this.lowerCaseFiles[file.name.toLowerCase()] = file;
        this.usedFiles[file.name] = false;
      }
      this.fetch = this.fetch.bind(this);
    }
    // implements IFileSystem
    /**
     * Implementation of fetch against this file system
     * Delegates to global fetch for http{s}:// or data://
     */
    async fetch(path, options) {
      if (path.includes("://")) {
        return this._fetch(path, options);
      }
      const file = this.files[path];
      if (!file) {
        return new Response(path, { status: 400, statusText: "NOT FOUND" });
      }
      const headers = new Headers(options?.headers);
      const range = headers.get("Range");
      const bytes = range && /bytes=($1)-($2)/.exec(range);
      if (bytes) {
        const start = parseInt(bytes[1]);
        const end = parseInt(bytes[2]);
        const data = await file.slice(start, end).arrayBuffer();
        const response2 = new Response(data);
        Object.defineProperty(response2, "url", { value: path });
        return response2;
      }
      const response = new Response(file);
      Object.defineProperty(response, "url", { value: path });
      return response;
    }
    /**
     * List filenames in this filesystem
     * @param dirname
     * @returns
     */
    async readdir(dirname2) {
      const files = [];
      for (const path in this.files) {
        files.push(path);
      }
      return files;
    }
    /**
     * Return information (size) about files in this file system
     */
    async stat(path, options) {
      const file = this.files[path];
      if (!file) {
        throw new Error(path);
      }
      return { size: file.size };
    }
    /**
     * Just removes the file from the list
     */
    async unlink(path) {
      delete this.files[path];
      delete this.lowerCaseFiles[path];
      this.usedFiles[path] = true;
    }
    // implements IRandomAccessFileSystem
    // RANDOM ACCESS
    async openReadableFile(pathname, flags) {
      return new BlobFile(this.files[pathname]);
    }
    // PRIVATE
    // Supports case independent paths, and file usage tracking
    _getFile(path, used) {
      const file = this.files[path] || this.lowerCaseFiles[path];
      if (file && used) {
        this.usedFiles[path] = true;
      }
      return file;
    }
  };
  return __toCommonJS(bundle_exports);
})();
      return __exports__;
      });
