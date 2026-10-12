(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["3DTilesRenderer"] = {}));
})(this, (function(exports2) {
  "use strict";
  function getUrlExtension(url) {
    if (!url) {
      return null;
    }
    let endIndex = url.length;
    const queryIndex = url.indexOf("?");
    const fragmentIndex = url.indexOf("#");
    if (queryIndex !== -1) {
      endIndex = Math.min(endIndex, queryIndex);
    }
    if (fragmentIndex !== -1) {
      endIndex = Math.min(endIndex, fragmentIndex);
    }
    const lastPeriodIndex = url.lastIndexOf(".", endIndex);
    const lastSlashIndex = url.lastIndexOf("/", endIndex);
    const protocolIndex = url.indexOf("://");
    const isHostOnly = protocolIndex !== -1 && protocolIndex + 2 === lastSlashIndex;
    if (isHostOnly || lastPeriodIndex === -1 || lastPeriodIndex < lastSlashIndex) {
      return null;
    }
    return url.substring(lastPeriodIndex + 1, endIndex) || null;
  }
  const GIGABYTE_BYTES = 2 ** 30;
  class LRUCache {
    get unloadPriorityCallback() {
      return this._unloadPriorityCallback;
    }
    set unloadPriorityCallback(cb) {
      if (cb.length === 1) {
        console.warn('LRUCache: "unloadPriorityCallback" function has been changed to take two arguments.');
        this._unloadPriorityCallback = (a, b) => {
          const valA = cb(a);
          const valB = cb(b);
          if (valA < valB) return -1;
          if (valA > valB) return 1;
          return 0;
        };
      } else {
        this._unloadPriorityCallback = cb;
      }
    }
    constructor() {
      this.minSize = 6e3;
      this.maxSize = 8e3;
      this.minBytesSize = 0.3 * GIGABYTE_BYTES;
      this.maxBytesSize = 0.4 * GIGABYTE_BYTES;
      this.unloadPercent = 0.05;
      this.autoMarkUnused = true;
      this.itemSet = /* @__PURE__ */ new Map();
      this.itemList = [];
      this.usedSet = /* @__PURE__ */ new Set();
      this.callbacks = /* @__PURE__ */ new Map();
      this.unloadingHandle = -1;
      this.cachedBytes = 0;
      this.bytesMap = /* @__PURE__ */ new Map();
      this.loadedSet = /* @__PURE__ */ new Set();
      this._unloadPriorityCallback = null;
      const itemSet = this.itemSet;
      this.defaultPriorityCallback = (item) => itemSet.get(item);
    }
    // Returns whether or not the cache has reached the maximum size
    isFull() {
      return this.itemSet.size >= this.maxSize || this.cachedBytes >= this.maxBytesSize;
    }
    getMemoryUsage(item) {
      return this.bytesMap.get(item) || 0;
    }
    setMemoryUsage(item, bytes) {
      const { bytesMap, itemSet } = this;
      if (!itemSet.has(item)) {
        return;
      }
      this.cachedBytes -= bytesMap.get(item) || 0;
      bytesMap.set(item, bytes);
      this.cachedBytes += bytes;
    }
    add(item, removeCb) {
      const itemSet = this.itemSet;
      if (itemSet.has(item)) {
        return false;
      }
      if (this.isFull()) {
        return false;
      }
      const usedSet = this.usedSet;
      const itemList = this.itemList;
      const callbacks = this.callbacks;
      itemList.push(item);
      usedSet.add(item);
      itemSet.set(item, Date.now());
      callbacks.set(item, removeCb);
      return true;
    }
    has(item) {
      return this.itemSet.has(item);
    }
    remove(item) {
      const usedSet = this.usedSet;
      const itemSet = this.itemSet;
      const itemList = this.itemList;
      const bytesMap = this.bytesMap;
      const callbacks = this.callbacks;
      const loadedSet = this.loadedSet;
      if (itemSet.has(item)) {
        this.cachedBytes -= bytesMap.get(item) || 0;
        bytesMap.delete(item);
        callbacks.get(item)(item);
        const index = itemList.indexOf(item);
        itemList.splice(index, 1);
        usedSet.delete(item);
        itemSet.delete(item);
        callbacks.delete(item);
        loadedSet.delete(item);
        return true;
      }
      return false;
    }
    // Marks whether tiles in the cache have been completely loaded or not. Tiles that have not been completely
    // loaded are subject to being disposed early if the cache is full above its max size limits, even if they
    // are marked as used.
    setLoaded(item, value) {
      const { itemSet, loadedSet } = this;
      if (itemSet.has(item)) {
        if (value === true) {
          loadedSet.add(item);
        } else {
          loadedSet.delete(item);
        }
      }
    }
    markUsed(item) {
      const itemSet = this.itemSet;
      const usedSet = this.usedSet;
      if (itemSet.has(item) && !usedSet.has(item)) {
        itemSet.set(item, Date.now());
        usedSet.add(item);
      }
    }
    markUnused(item) {
      this.usedSet.delete(item);
    }
    markAllUnused() {
      this.usedSet.clear();
    }
    // TODO: this should be renamed because it's not necessarily unloading all unused content
    // Maybe call it "cleanup" or "unloadToMinSize"
    unloadUnusedContent() {
      const {
        unloadPercent,
        minSize,
        maxSize,
        itemList,
        itemSet,
        usedSet,
        loadedSet,
        callbacks,
        bytesMap,
        minBytesSize,
        maxBytesSize
      } = this;
      const unused = itemList.length - usedSet.size;
      const unloaded = itemList.length - loadedSet.size;
      const excessNodes = Math.max(Math.min(itemList.length - minSize, unused), 0);
      const excessBytes = this.cachedBytes - minBytesSize;
      const unloadPriorityCallback = this.unloadPriorityCallback || this.defaultPriorityCallback;
      let needsRerun = false;
      const hasNodesToUnload = excessNodes > 0 && unused > 0 || unloaded && itemList.length > maxSize;
      const hasBytesToUnload = unused && this.cachedBytes > minBytesSize || unloaded && this.cachedBytes > maxBytesSize;
      if (hasBytesToUnload || hasNodesToUnload) {
        itemList.sort((a, b) => {
          const usedA = usedSet.has(a);
          const usedB = usedSet.has(b);
          if (usedA === usedB) {
            const loadedA = loadedSet.has(a);
            const loadedB = loadedSet.has(b);
            if (loadedA === loadedB) {
              return -unloadPriorityCallback(a, b);
            } else {
              return loadedA ? 1 : -1;
            }
          } else {
            return usedA ? 1 : -1;
          }
        });
        const maxUnload = Math.max(minSize * unloadPercent, excessNodes * unloadPercent);
        const nodesToUnload = Math.ceil(Math.min(maxUnload, unused, excessNodes));
        const maxBytesUnload = Math.max(unloadPercent * excessBytes, unloadPercent * minBytesSize);
        const bytesToUnload = Math.min(maxBytesUnload, excessBytes);
        let removedNodes = 0;
        let removedBytes = 0;
        while (this.cachedBytes - removedBytes > maxBytesSize || itemList.length - removedNodes > maxSize) {
          const item = itemList[removedNodes];
          const bytes = bytesMap.get(item) || 0;
          if (usedSet.has(item) && loadedSet.has(item) || this.cachedBytes - removedBytes - bytes < maxBytesSize && itemList.length - removedNodes <= maxSize) {
            break;
          }
          removedBytes += bytes;
          removedNodes++;
        }
        while (removedBytes < bytesToUnload || removedNodes < nodesToUnload) {
          const item = itemList[removedNodes];
          const bytes = bytesMap.get(item) || 0;
          if (usedSet.has(item) || this.cachedBytes - removedBytes - bytes < minBytesSize && removedNodes >= nodesToUnload) {
            break;
          }
          removedBytes += bytes;
          removedNodes++;
        }
        itemList.splice(0, removedNodes).forEach((item) => {
          this.cachedBytes -= bytesMap.get(item) || 0;
          callbacks.get(item)(item);
          bytesMap.delete(item);
          itemSet.delete(item);
          callbacks.delete(item);
          loadedSet.delete(item);
          usedSet.delete(item);
        });
        needsRerun = removedNodes < excessNodes || removedBytes < excessBytes && removedNodes < unused;
        needsRerun = needsRerun && removedNodes > 0;
      }
      if (needsRerun) {
        this.unloadingHandle = requestAnimationFrame(() => this.scheduleUnload());
      }
    }
    scheduleUnload() {
      cancelAnimationFrame(this.unloadingHandle);
      if (!this.scheduled) {
        this.scheduled = true;
        queueMicrotask(() => {
          this.scheduled = false;
          this.unloadUnusedContent();
        });
      }
    }
  }
  class PriorityQueue {
    // returns whether tasks are queued or actively running
    get running() {
      return this.items.length !== 0 || this.currJobs !== 0;
    }
    constructor() {
      this.maxJobs = 6;
      this.items = [];
      this.callbacks = /* @__PURE__ */ new Map();
      this.currJobs = 0;
      this.scheduled = false;
      this.autoUpdate = true;
      this.priorityCallback = null;
      this.schedulingCallback = (func) => {
        requestAnimationFrame(func);
      };
      this._runjobs = () => {
        this.scheduled = false;
        this.tryRunJobs();
      };
    }
    sort() {
      const priorityCallback2 = this.priorityCallback;
      const items = this.items;
      if (priorityCallback2 !== null) {
        items.sort(priorityCallback2);
      }
    }
    has(item) {
      return this.callbacks.has(item);
    }
    add(item, callback) {
      const data = {
        callback,
        reject: null,
        resolve: null,
        promise: null
      };
      data.promise = new Promise((resolve, reject) => {
        const items = this.items;
        const callbacks = this.callbacks;
        data.resolve = resolve;
        data.reject = reject;
        items.unshift(item);
        callbacks.set(item, data);
        if (this.autoUpdate) {
          this.scheduleJobRun();
        }
      });
      return data.promise;
    }
    remove(item) {
      const items = this.items;
      const callbacks = this.callbacks;
      const index = items.indexOf(item);
      if (index !== -1) {
        const info = callbacks.get(item);
        info.promise.catch(() => {
        });
        info.reject(new Error("PriorityQueue: Item removed."));
        items.splice(index, 1);
        callbacks.delete(item);
      }
    }
    removeByFilter(filter) {
      const { items } = this;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (filter(item)) {
          this.remove(item);
        }
      }
    }
    tryRunJobs() {
      this.sort();
      const items = this.items;
      const callbacks = this.callbacks;
      const maxJobs = this.maxJobs;
      let iterated = 0;
      const completedCallback = () => {
        this.currJobs--;
        if (this.autoUpdate) {
          this.scheduleJobRun();
        }
      };
      while (maxJobs > this.currJobs && items.length > 0 && iterated < maxJobs) {
        this.currJobs++;
        iterated++;
        const item = items.pop();
        const { callback, resolve, reject } = callbacks.get(item);
        callbacks.delete(item);
        let result;
        try {
          result = callback(item);
        } catch (err) {
          reject(err);
          completedCallback();
        }
        if (result instanceof Promise) {
          result.then(resolve).catch(reject).finally(completedCallback);
        } else {
          resolve(result);
          completedCallback();
        }
      }
    }
    scheduleJobRun() {
      if (!this.scheduled) {
        this.schedulingCallback(this._runjobs);
        this.scheduled = true;
      }
    }
  }
  const FAILED = -1;
  const UNLOADED = 0;
  const LOADING = 1;
  const PARSING = 2;
  const LOADED = 3;
  const WGS84_RADIUS = 6378137;
  const WGS84_FLATTENING = 1 / 298.257223563;
  const WGS84_HEIGHT = 6356752314245179e-9;
  const viewErrorTarget$1 = {
    inView: false,
    error: Infinity,
    distanceFromCamera: Infinity
  };
  const LOAD_ROOT_SIBLINGS = true;
  function isDownloadFinished(value) {
    return value === LOADED || value === FAILED;
  }
  function isUsedThisFrame(tile, frameCount) {
    return tile.__lastFrameVisited === frameCount && tile.__used;
  }
  function areChildrenProcessed(tile) {
    return tile.__childrenProcessed === tile.children.length;
  }
  function canUnconditionallyRefine(tile) {
    return tile.__hasUnrenderableContent || tile.parent && tile.parent.geometricError < tile.geometricError;
  }
  function resetFrameState(tile, renderer) {
    if (tile.__lastFrameVisited !== renderer.frameCount) {
      tile.__lastFrameVisited = renderer.frameCount;
      tile.__used = false;
      tile.__inFrustum = false;
      tile.__isLeaf = false;
      tile.__visible = false;
      tile.__active = false;
      tile.__error = Infinity;
      tile.__distanceFromCamera = Infinity;
      tile.__allChildrenReady = false;
      renderer.calculateTileViewError(tile, viewErrorTarget$1);
      tile.__inFrustum = viewErrorTarget$1.inView;
      tile.__error = viewErrorTarget$1.error;
      tile.__distanceFromCamera = viewErrorTarget$1.distanceFromCamera;
    }
  }
  function recursivelyMarkUsed(tile, renderer, cacheOnly = false) {
    renderer.ensureChildrenArePreprocessed(tile);
    resetFrameState(tile, renderer);
    markUsed(tile, renderer, cacheOnly);
    if (canUnconditionallyRefine(tile) && areChildrenProcessed(tile)) {
      const children = tile.children;
      for (let i = 0, l = children.length; i < l; i++) {
        recursivelyMarkUsed(children[i], renderer, cacheOnly);
      }
    }
  }
  function recursivelyLoadNextRenderableTiles(tile, renderer) {
    renderer.ensureChildrenArePreprocessed(tile);
    if (isUsedThisFrame(tile, renderer.frameCount)) {
      if (tile.__hasContent) {
        renderer.queueTileForDownload(tile);
      }
      if (areChildrenProcessed(tile)) {
        const children = tile.children;
        for (let i = 0, l = children.length; i < l; i++) {
          recursivelyLoadNextRenderableTiles(children[i], renderer);
        }
      }
    }
  }
  function markUsed(tile, renderer, cacheOnly = false) {
    if (tile.__used) {
      return;
    }
    if (!cacheOnly) {
      tile.__used = true;
      renderer.stats.used++;
    }
    renderer.markTileUsed(tile);
    if (tile.__inFrustum === true) {
      renderer.stats.inFrustum++;
    }
  }
  function canTraverse(tile, renderer) {
    if (tile.__error <= renderer.errorTarget && !canUnconditionallyRefine(tile)) {
      return false;
    }
    if (renderer.maxDepth > 0 && tile.__depth + 1 >= renderer.maxDepth) {
      return false;
    }
    if (!areChildrenProcessed(tile)) {
      return false;
    }
    return true;
  }
  function markUsedTiles(tile, renderer) {
    renderer.ensureChildrenArePreprocessed(tile);
    resetFrameState(tile, renderer);
    if (!tile.__inFrustum) {
      return;
    }
    if (!canTraverse(tile, renderer)) {
      markUsed(tile, renderer);
      return;
    }
    let anyChildrenUsed = false;
    let anyChildrenInFrustum = false;
    const children = tile.children;
    for (let i = 0, l = children.length; i < l; i++) {
      const c = children[i];
      markUsedTiles(c, renderer);
      anyChildrenUsed = anyChildrenUsed || isUsedThisFrame(c, renderer.frameCount);
      anyChildrenInFrustum = anyChildrenInFrustum || c.__inFrustum;
    }
    if (tile.refine === "REPLACE" && !anyChildrenInFrustum && children.length !== 0) {
      tile.__inFrustum = false;
      for (let i = 0, l = children.length; i < l; i++) {
        recursivelyMarkUsed(children[i], renderer, true);
      }
      return;
    }
    markUsed(tile, renderer);
    if (tile.refine === "REPLACE" && (anyChildrenUsed && tile.__depth !== 0 || LOAD_ROOT_SIBLINGS)) {
      for (let i = 0, l = children.length; i < l; i++) {
        recursivelyMarkUsed(children[i], renderer);
      }
    }
  }
  function markUsedSetLeaves(tile, renderer) {
    const frameCount = renderer.frameCount;
    if (!isUsedThisFrame(tile, frameCount)) {
      return;
    }
    const children = tile.children;
    let anyChildrenUsed = false;
    for (let i = 0, l = children.length; i < l; i++) {
      const c = children[i];
      anyChildrenUsed = anyChildrenUsed || isUsedThisFrame(c, frameCount);
    }
    if (!anyChildrenUsed) {
      tile.__isLeaf = true;
    } else {
      let allChildrenReady = true;
      for (let i = 0, l = children.length; i < l; i++) {
        const c = children[i];
        markUsedSetLeaves(c, renderer);
        if (isUsedThisFrame(c, frameCount)) {
          const childCanDisplay = !canUnconditionallyRefine(c);
          let isChildReady = !c.__hasContent || c.__hasRenderableContent && isDownloadFinished(c.__loadingState) || c.__hasUnrenderableContent && c.__loadingState === FAILED;
          isChildReady = childCanDisplay && isChildReady || c.__allChildrenReady;
          allChildrenReady = allChildrenReady && isChildReady;
        }
      }
      tile.__allChildrenReady = allChildrenReady;
    }
  }
  function markVisibleTiles(tile, renderer) {
    const stats = renderer.stats;
    if (!isUsedThisFrame(tile, renderer.frameCount)) {
      return;
    }
    if (tile.__isLeaf) {
      if (tile.__loadingState === LOADED) {
        if (tile.__inFrustum) {
          tile.__visible = true;
          stats.visible++;
        }
        tile.__active = true;
        stats.active++;
      } else if (tile.__hasContent) {
        renderer.queueTileForDownload(tile);
      }
      return;
    }
    const children = tile.children;
    const hasContent = tile.__hasContent;
    const loadedContent = isDownloadFinished(tile.__loadingState) && hasContent;
    const errorRequirement = (renderer.errorTarget + 1) * renderer.errorThreshold;
    const meetsSSE = tile.__error <= errorRequirement;
    const isAdditiveRefine = tile.refine === "ADD";
    const allChildrenReady = tile.__allChildrenReady || tile.__depth === 0 && !LOAD_ROOT_SIBLINGS;
    if (hasContent && (meetsSSE || isAdditiveRefine)) {
      renderer.queueTileForDownload(tile);
    }
    if (meetsSSE && loadedContent && !allChildrenReady || loadedContent && isAdditiveRefine) {
      if (tile.__inFrustum) {
        tile.__visible = true;
        stats.visible++;
      }
      tile.__active = true;
      stats.active++;
    }
    if (!isAdditiveRefine && meetsSSE && !allChildrenReady) {
      for (let i = 0, l = children.length; i < l; i++) {
        const c = children[i];
        if (isUsedThisFrame(c, renderer.frameCount)) {
          recursivelyLoadNextRenderableTiles(c, renderer);
        }
      }
    } else {
      for (let i = 0, l = children.length; i < l; i++) {
        markVisibleTiles(children[i], renderer);
      }
    }
  }
  function toggleTiles(tile, renderer) {
    const isUsed = isUsedThisFrame(tile, renderer.frameCount);
    if (isUsed || tile.__usedLastFrame) {
      let setActive = false;
      let setVisible = false;
      if (isUsed) {
        setActive = tile.__active;
        if (renderer.displayActiveTiles) {
          setVisible = tile.__active || tile.__visible;
        } else {
          setVisible = tile.__visible;
        }
      } else {
        resetFrameState(tile, renderer);
      }
      if (tile.__hasRenderableContent && tile.__loadingState === LOADED) {
        if (tile.__wasSetActive !== setActive) {
          renderer.invokeOnePlugin((plugin) => plugin.setTileActive && plugin.setTileActive(tile, setActive));
        }
        if (tile.__wasSetVisible !== setVisible) {
          renderer.invokeOnePlugin((plugin) => plugin.setTileVisible && plugin.setTileVisible(tile, setVisible));
        }
      }
      tile.__wasSetActive = setActive;
      tile.__wasSetVisible = setVisible;
      tile.__usedLastFrame = isUsed;
      const children = tile.children;
      for (let i = 0, l = children.length; i < l; i++) {
        const c = children[i];
        toggleTiles(c, renderer);
      }
    }
  }
  function throttle(callback) {
    let handle = null;
    return () => {
      if (handle === null) {
        handle = requestAnimationFrame(() => {
          handle = null;
          callback();
        });
      }
    };
  }
  function traverseSet(tile, beforeCb = null, afterCb = null) {
    const stack = [];
    stack.push(tile);
    stack.push(null);
    stack.push(0);
    while (stack.length > 0) {
      const depth = stack.pop();
      const parent = stack.pop();
      const tile2 = stack.pop();
      if (beforeCb && beforeCb(tile2, parent, depth)) {
        if (afterCb) {
          afterCb(tile2, parent, depth);
        }
        return;
      }
      const children = tile2.children;
      if (children) {
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i]);
          stack.push(tile2);
          stack.push(depth + 1);
        }
      }
      if (afterCb) {
        afterCb(tile2, parent, depth);
      }
    }
  }
  function traverseAncestors(tile, callback = null) {
    let current = tile;
    while (current) {
      const depth = current.__depth;
      const parent = current.parent;
      if (callback) {
        callback(current, parent, depth);
      }
      current = parent;
    }
  }
  const TraversalUtils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    traverseAncestors,
    traverseSet
  }, Symbol.toStringTag, { value: "Module" }));
  const PLUGIN_REGISTERED = Symbol("PLUGIN_REGISTERED");
  const priorityCallback = (a, b) => {
    const aPriority = a.priority || 0;
    const bPriority = b.priority || 0;
    if (aPriority !== bPriority) {
      return aPriority > bPriority ? 1 : -1;
    } else if (a.__used !== b.__used) {
      return a.__used ? 1 : -1;
    } else if (a.__error !== b.__error) {
      return a.__error > b.__error ? 1 : -1;
    } else if (a.__distanceFromCamera !== b.__distanceFromCamera) {
      return a.__distanceFromCamera > b.__distanceFromCamera ? -1 : 1;
    } else if (a.__depthFromRenderedParent !== b.__depthFromRenderedParent) {
      return a.__depthFromRenderedParent > b.__depthFromRenderedParent ? -1 : 1;
    }
    return 0;
  };
  const lruPriorityCallback = (a, b) => {
    const aPriority = a.priority || 0;
    const bPriority = b.priority || 0;
    if (aPriority !== bPriority) {
      return aPriority > bPriority ? 1 : -1;
    } else if (a.__lastFrameVisited !== b.__lastFrameVisited) {
      return a.__lastFrameVisited > b.__lastFrameVisited ? -1 : 1;
    } else if (a.__depthFromRenderedParent !== b.__depthFromRenderedParent) {
      return a.__depthFromRenderedParent > b.__depthFromRenderedParent ? 1 : -1;
    } else if (a.__loadingState !== b.__loadingState) {
      return a.__loadingState > b.__loadingState ? -1 : 1;
    } else if (a.__hasUnrenderableContent !== b.__hasUnrenderableContent) {
      return a.__hasUnrenderableContent ? -1 : 1;
    } else if (a.__error !== b.__error) {
      return a.__error > b.__error ? -1 : 1;
    }
    return 0;
  };
  class TilesRendererBase {
    get root() {
      const tileset = this.rootTileset;
      return tileset ? tileset.root : null;
    }
    get rootTileSet() {
      console.warn('TilesRenderer: "rootTileSet" has been deprecated. Use "rootTileset" instead.');
      return this.rootTileset;
    }
    get loadProgress() {
      const { stats, isLoading } = this;
      const loading2 = stats.downloading + stats.parsing;
      const total = stats.inCacheSinceLoad + (isLoading ? 1 : 0);
      return total === 0 ? 1 : 1 - loading2 / total;
    }
    get errorThreshold() {
      return this._errorThreshold;
    }
    set errorThreshold(v) {
      console.warn('TilesRenderer: The "errorThreshold" option has been deprecated.');
      this._errorThreshold = v;
    }
    constructor(url = null) {
      this.rootLoadingState = UNLOADED;
      this.rootTileset = null;
      this.rootURL = url;
      this.fetchOptions = {};
      this.plugins = [];
      this.queuedTiles = [];
      this.cachedSinceLoadComplete = /* @__PURE__ */ new Set();
      this.isLoading = false;
      const lruCache = new LRUCache();
      lruCache.unloadPriorityCallback = lruPriorityCallback;
      const downloadQueue = new PriorityQueue();
      downloadQueue.maxJobs = 25;
      downloadQueue.priorityCallback = priorityCallback;
      const parseQueue = new PriorityQueue();
      parseQueue.maxJobs = 5;
      parseQueue.priorityCallback = priorityCallback;
      const processNodeQueue = new PriorityQueue();
      processNodeQueue.maxJobs = 25;
      this.processedTiles = /* @__PURE__ */ new WeakSet();
      this.visibleTiles = /* @__PURE__ */ new Set();
      this.activeTiles = /* @__PURE__ */ new Set();
      this.usedSet = /* @__PURE__ */ new Set();
      this.lruCache = lruCache;
      this.downloadQueue = downloadQueue;
      this.parseQueue = parseQueue;
      this.processNodeQueue = processNodeQueue;
      this.stats = {
        inCacheSinceLoad: 0,
        inCache: 0,
        parsing: 0,
        downloading: 0,
        failed: 0,
        inFrustum: 0,
        used: 0,
        active: 0,
        visible: 0
      };
      this.frameCount = 0;
      this._dispatchNeedsUpdateEvent = throttle(() => {
        this.dispatchEvent({ type: "needs-update" });
      });
      this.errorTarget = 16;
      this._errorThreshold = Infinity;
      this.displayActiveTiles = false;
      this.maxDepth = Infinity;
    }
    // Plugins
    registerPlugin(plugin) {
      if (plugin[PLUGIN_REGISTERED] === true) {
        throw new Error("TilesRendererBase: A plugin can only be registered to a single tileset");
      }
      if (plugin.loadRootTileSet && !plugin.loadRootTileset) {
        console.warn('TilesRendererBase: Plugin implements deprecated "loadRootTileSet" method. Please rename to "loadRootTileset".');
        plugin.loadRootTileset = plugin.loadRootTileSet;
      }
      if (plugin.preprocessTileSet && !plugin.preprocessTileset) {
        console.warn('TilesRendererBase: Plugin implements deprecated "preprocessTileSet" method. Please rename to "preprocessTileset".');
        plugin.preprocessTileset = plugin.preprocessTileSet;
      }
      const plugins = this.plugins;
      const priority = plugin.priority || 0;
      let insertionPoint = plugins.length;
      for (let i = 0; i < plugins.length; i++) {
        const otherPriority = plugins[i].priority || 0;
        if (otherPriority > priority) {
          insertionPoint = i;
          break;
        }
      }
      plugins.splice(insertionPoint, 0, plugin);
      plugin[PLUGIN_REGISTERED] = true;
      if (plugin.init) {
        plugin.init(this);
      }
    }
    unregisterPlugin(plugin) {
      const plugins = this.plugins;
      if (typeof plugin === "string") {
        plugin = this.getPluginByName(plugin);
      }
      if (plugins.includes(plugin)) {
        const index = plugins.indexOf(plugin);
        plugins.splice(index, 1);
        if (plugin.dispose) {
          plugin.dispose();
        }
        return true;
      }
      return false;
    }
    getPluginByName(name) {
      return this.plugins.find((p) => p.name === name) || null;
    }
    invokeOnePlugin(func) {
      const plugins = [...this.plugins, this];
      for (let i = 0; i < plugins.length; i++) {
        const result = func(plugins[i]);
        if (result) {
          return result;
        }
      }
      return null;
    }
    invokeAllPlugins(func) {
      const plugins = [...this.plugins, this];
      const pending = [];
      for (let i = 0; i < plugins.length; i++) {
        const result = func(plugins[i]);
        if (result) {
          pending.push(result);
        }
      }
      return pending.length === 0 ? null : Promise.all(pending);
    }
    // Public API
    traverse(beforecb, aftercb, ensureFullyProcessed = true) {
      if (!this.root) return;
      traverseSet(this.root, (tile, ...args) => {
        if (ensureFullyProcessed) {
          this.ensureChildrenArePreprocessed(tile, true);
        }
        return beforecb ? beforecb(tile, ...args) : false;
      }, aftercb);
    }
    getAttributions(target = []) {
      this.invokeAllPlugins((plugin) => plugin !== this && plugin.getAttributions && plugin.getAttributions(target));
      return target;
    }
    update() {
      const { lruCache, usedSet, stats, root, downloadQueue, parseQueue, processNodeQueue } = this;
      if (this.rootLoadingState === UNLOADED) {
        this.rootLoadingState = LOADING;
        this.invokeOnePlugin((plugin) => plugin.loadRootTileset && plugin.loadRootTileset()).then((root2) => {
          let processedUrl = this.rootURL;
          if (processedUrl !== null) {
            this.invokeAllPlugins((plugin) => processedUrl = plugin.preprocessURL ? plugin.preprocessURL(processedUrl, null) : processedUrl);
          }
          this.rootLoadingState = LOADED;
          this.rootTileset = root2;
          this.dispatchEvent({ type: "needs-update" });
          this.dispatchEvent({ type: "load-content" });
          this.dispatchEvent({
            type: "load-tileset",
            tileset: root2,
            url: processedUrl
          });
        }).catch((error) => {
          this.rootLoadingState = FAILED;
          console.error(error);
          this.rootTileset = null;
          this.dispatchEvent({
            type: "load-error",
            tile: null,
            error,
            url: this.rootURL
          });
        });
      }
      if (!root) {
        return;
      }
      stats.inFrustum = 0;
      stats.used = 0;
      stats.active = 0;
      stats.visible = 0;
      this.frameCount++;
      usedSet.forEach((tile) => lruCache.markUnused(tile));
      usedSet.clear();
      markUsedTiles(root, this);
      markUsedSetLeaves(root, this);
      markVisibleTiles(root, this);
      toggleTiles(root, this);
      const queuedTiles = this.queuedTiles;
      queuedTiles.sort(lruCache.unloadPriorityCallback);
      for (let i = 0, l = queuedTiles.length; i < l && !lruCache.isFull(); i++) {
        this.requestTileContents(queuedTiles[i]);
      }
      queuedTiles.length = 0;
      lruCache.scheduleUnload();
      const runningTasks = downloadQueue.running || parseQueue.running || processNodeQueue.running;
      if (runningTasks === false && this.isLoading === true) {
        this.cachedSinceLoadComplete.clear();
        stats.inCacheSinceLoad = 0;
        this.dispatchEvent({ type: "tiles-load-end" });
        this.isLoading = false;
      }
    }
    resetFailedTiles() {
      if (this.rootLoadingState === FAILED) {
        this.rootLoadingState = UNLOADED;
      }
      const stats = this.stats;
      if (stats.failed === 0) {
        return;
      }
      this.traverse((tile) => {
        if (tile.__loadingState === FAILED) {
          tile.__loadingState = UNLOADED;
        }
      }, null, false);
      stats.failed = 0;
    }
    dispose() {
      const plugins = [...this.plugins];
      plugins.forEach((plugin) => {
        this.unregisterPlugin(plugin);
      });
      const lruCache = this.lruCache;
      const toRemove = [];
      this.traverse((t) => {
        toRemove.push(t);
        return false;
      }, null, false);
      for (let i = 0, l = toRemove.length; i < l; i++) {
        lruCache.remove(toRemove[i]);
      }
      this.stats = {
        parsing: 0,
        downloading: 0,
        failed: 0,
        inFrustum: 0,
        used: 0,
        active: 0,
        visible: 0
      };
      this.frameCount = 0;
    }
    // Overrideable
    calculateBytesUsed(scene, tile) {
      return 0;
    }
    dispatchEvent(e) {
    }
    addEventListener(name, callback) {
    }
    removeEventListener(name, callback) {
    }
    parseTile(buffer, tile, extension) {
      return null;
    }
    disposeTile(tile) {
      if (tile.__visible) {
        this.invokeOnePlugin((plugin) => plugin.setTileVisible && plugin.setTileVisible(tile, false));
        tile.__visible = false;
      }
      if (tile.__active) {
        this.invokeOnePlugin((plugin) => plugin.setTileActive && plugin.setTileActive(tile, false));
        tile.__active = false;
      }
    }
    preprocessNode(tile, tilesetDir, parentTile = null) {
      var _a;
      this.processedTiles.add(tile);
      if (tile.content) {
        if (!("uri" in tile.content) && "url" in tile.content) {
          tile.content.uri = tile.content.url;
          delete tile.content.url;
        }
        if (tile.content.boundingVolume && !("box" in tile.content.boundingVolume || "sphere" in tile.content.boundingVolume || "region" in tile.content.boundingVolume)) {
          delete tile.content.boundingVolume;
        }
      }
      tile.parent = parentTile;
      tile.children = tile.children || [];
      if ((_a = tile.content) == null ? void 0 : _a.uri) {
        const extension = getUrlExtension(tile.content.uri);
        tile.__hasContent = true;
        tile.__hasUnrenderableContent = Boolean(extension && /json$/.test(extension));
        tile.__hasRenderableContent = !tile.__hasUnrenderableContent;
      } else {
        tile.__hasContent = false;
        tile.__hasUnrenderableContent = false;
        tile.__hasRenderableContent = false;
      }
      tile.__childrenProcessed = 0;
      if (parentTile) {
        parentTile.__childrenProcessed++;
      }
      tile.__distanceFromCamera = Infinity;
      tile.__error = Infinity;
      tile.__inFrustum = false;
      tile.__isLeaf = false;
      tile.__usedLastFrame = false;
      tile.__used = false;
      tile.__wasSetVisible = false;
      tile.__visible = false;
      tile.__allChildrenReady = false;
      tile.__wasSetActive = false;
      tile.__active = false;
      tile.__loadingState = UNLOADED;
      if (parentTile === null) {
        tile.__depth = 0;
        tile.__depthFromRenderedParent = tile.__hasRenderableContent ? 1 : 0;
        tile.refine = tile.refine || "REPLACE";
      } else {
        tile.__depth = parentTile.__depth + 1;
        tile.__depthFromRenderedParent = parentTile.__depthFromRenderedParent + (tile.__hasRenderableContent ? 1 : 0);
        tile.refine = tile.refine || parentTile.refine;
      }
      tile.__basePath = tilesetDir;
      tile.__lastFrameVisited = -1;
      this.invokeAllPlugins((plugin) => {
        plugin !== this && plugin.preprocessNode && plugin.preprocessNode(tile, tilesetDir, parentTile);
      });
    }
    setTileActive(tile, active) {
      active ? this.activeTiles.add(tile) : this.activeTiles.delete(tile);
    }
    setTileVisible(tile, visible) {
      visible ? this.visibleTiles.add(tile) : this.visibleTiles.delete(tile);
    }
    calculateTileViewError(tile, target) {
    }
    // Private Functions
    queueTileForDownload(tile) {
      if (tile.__loadingState !== UNLOADED || this.lruCache.isFull()) {
        return;
      }
      this.queuedTiles.push(tile);
    }
    markTileUsed(tile) {
      this.usedSet.add(tile);
      this.lruCache.markUsed(tile);
    }
    fetchData(url, options) {
      return fetch(url, options);
    }
    ensureChildrenArePreprocessed(tile, immediate = false) {
      const children = tile.children;
      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        if ("__depth" in child) {
          break;
        } else if (immediate) {
          this.processNodeQueue.remove(child);
          this.preprocessNode(child, tile.__basePath, tile);
        } else {
          if (!this.processNodeQueue.has(child)) {
            this.processNodeQueue.add(child, (child2) => {
              this.preprocessNode(child2, tile.__basePath, tile);
              this._dispatchNeedsUpdateEvent();
            });
          }
        }
      }
    }
    // returns the total bytes used for by the given tile as reported by all plugins
    getBytesUsed(tile) {
      let bytes = 0;
      this.invokeAllPlugins((plugin) => {
        if (plugin.calculateBytesUsed) {
          bytes += plugin.calculateBytesUsed(tile, tile.cached.scene) || 0;
        }
      });
      return bytes;
    }
    // force a recalculation of the tile or all tiles if no tile is provided
    recalculateBytesUsed(tile = null) {
      const { lruCache, processedTiles } = this;
      if (tile === null) {
        lruCache.itemSet.forEach((item) => {
          if (processedTiles.has(item)) {
            lruCache.setMemoryUsage(item, this.getBytesUsed(item));
          }
        });
      } else {
        lruCache.setMemoryUsage(tile, this.getBytesUsed(tile));
      }
    }
    preprocessTileset(json, url, parent = null) {
      const proto = Object.getPrototypeOf(this);
      if (Object.hasOwn(proto, "preprocessTileSet")) {
        console.warn(`${proto.constructor.name}: Class overrides deprecated "preprocessTileSet" method. Please rename to "preprocessTileset".`);
      }
      const version = json.asset.version;
      const [major, minor] = version.split(".").map((v) => parseInt(v));
      console.assert(
        major <= 1,
        "TilesRenderer: asset.version is expected to be a 1.x or a compatible version."
      );
      if (major === 1 && minor > 0) {
        console.warn("TilesRenderer: tiles versions at 1.1 or higher have limited support. Some new extensions and features may not be supported.");
      }
      let basePath = url.replace(/\/[^/]*$/, "");
      basePath = new URL(basePath, window.location.href).toString();
      this.preprocessNode(json.root, basePath, parent);
    }
    preprocessTileSet(...args) {
      console.warn('TilesRenderer: "preprocessTileSet" has been deprecated. Use "preprocessTileset" instead.');
      return this.preprocessTileset(...args);
    }
    loadRootTileset() {
      const proto = Object.getPrototypeOf(this);
      if (Object.hasOwn(proto, "loadRootTileSet")) {
        console.warn(`${proto.constructor.name}: Class overrides deprecated "loadRootTileSet" method. Please rename to "loadRootTileset".`);
      }
      let processedUrl = this.rootURL;
      this.invokeAllPlugins((plugin) => processedUrl = plugin.preprocessURL ? plugin.preprocessURL(processedUrl, null) : processedUrl);
      const pr = this.invokeOnePlugin((plugin) => plugin.fetchData && plugin.fetchData(processedUrl, this.fetchOptions)).then((res) => {
        if (!(res instanceof Response)) {
          return res;
        } else if (res.ok) {
          return res.json();
        } else {
          throw new Error(`TilesRenderer: Failed to load tileset "${processedUrl}" with status ${res.status} : ${res.statusText}`);
        }
      }).then((root) => {
        this.preprocessTileset(root, processedUrl);
        return root;
      });
      return pr;
    }
    loadRootTileSet(...args) {
      console.warn('TilesRenderer: "loadRootTileSet" has been deprecated. Use "loadRootTileset" instead.');
      return this.loadRootTileSet(...args);
    }
    requestTileContents(tile) {
      if (tile.__loadingState !== UNLOADED) {
        return;
      }
      let isExternalTileset = false;
      let externalTileset = null;
      let uri = new URL(tile.content.uri, tile.__basePath + "/").toString();
      this.invokeAllPlugins((plugin) => uri = plugin.preprocessURL ? plugin.preprocessURL(uri, tile) : uri);
      const stats = this.stats;
      const lruCache = this.lruCache;
      const downloadQueue = this.downloadQueue;
      const parseQueue = this.parseQueue;
      const extension = getUrlExtension(uri);
      const controller = new AbortController();
      const signal = controller.signal;
      const addedSuccessfully = lruCache.add(tile, (t) => {
        controller.abort();
        if (isExternalTileset) {
          t.children.length = 0;
          t.__childrenProcessed = 0;
        } else {
          this.invokeAllPlugins((plugin) => {
            plugin.disposeTile && plugin.disposeTile(t);
          });
        }
        stats.inCache--;
        if (this.cachedSinceLoadComplete.has(tile)) {
          this.cachedSinceLoadComplete.delete(tile);
          stats.inCacheSinceLoad--;
        }
        if (t.__loadingState === LOADING) {
          stats.downloading--;
        } else if (t.__loadingState === PARSING) {
          stats.parsing--;
        }
        t.__loadingState = UNLOADED;
        parseQueue.remove(t);
        downloadQueue.remove(t);
      });
      if (!addedSuccessfully) {
        return;
      }
      if (!this.isLoading) {
        this.isLoading = true;
        this.dispatchEvent({ type: "tiles-load-start" });
      }
      lruCache.setMemoryUsage(tile, this.getBytesUsed(tile));
      this.cachedSinceLoadComplete.add(tile);
      stats.inCacheSinceLoad++;
      stats.inCache++;
      stats.downloading++;
      tile.__loadingState = LOADING;
      return downloadQueue.add(tile, (downloadTile) => {
        if (signal.aborted) {
          return Promise.resolve();
        }
        const res = this.invokeOnePlugin((plugin) => plugin.fetchData && plugin.fetchData(uri, { ...this.fetchOptions, signal }));
        this.dispatchEvent({ type: "tile-download-start", tile });
        return res;
      }).then((res) => {
        if (signal.aborted) {
          return;
        }
        if (!(res instanceof Response)) {
          return res;
        } else if (res.ok) {
          return extension === "json" ? res.json() : res.arrayBuffer();
        } else {
          throw new Error(`Failed to load model with error code ${res.status}`);
        }
      }).then((content) => {
        if (signal.aborted) {
          return;
        }
        stats.downloading--;
        stats.parsing++;
        tile.__loadingState = PARSING;
        return parseQueue.add(tile, (parseTile) => {
          if (signal.aborted) {
            return Promise.resolve();
          }
          if (extension === "json" && content.root) {
            this.preprocessTileset(content, uri, tile);
            tile.children.push(content.root);
            externalTileset = content;
            isExternalTileset = true;
            return Promise.resolve();
          } else {
            return this.invokeOnePlugin((plugin) => plugin.parseTile && plugin.parseTile(content, parseTile, extension, uri, signal));
          }
        });
      }).then(() => {
        if (signal.aborted) {
          return;
        }
        stats.parsing--;
        tile.__loadingState = LOADED;
        lruCache.setLoaded(tile, true);
        const bytesUsed = this.getBytesUsed(tile);
        if (lruCache.getMemoryUsage(tile) === 0 && bytesUsed > 0 && lruCache.isFull()) {
          lruCache.remove(tile);
          return;
        }
        lruCache.setMemoryUsage(tile, bytesUsed);
        this.dispatchEvent({ type: "needs-update" });
        this.dispatchEvent({ type: "load-content" });
        if (isExternalTileset) {
          this.dispatchEvent({
            type: "load-tileset",
            tileset: externalTileset,
            url: uri
          });
        }
        if (tile.cached.scene) {
          this.dispatchEvent({
            type: "load-model",
            scene: tile.cached.scene,
            tile
          });
        }
      }).catch((error) => {
        if (signal.aborted) {
          return;
        }
        if (error.name !== "AbortError") {
          parseQueue.remove(tile);
          downloadQueue.remove(tile);
          if (tile.__loadingState === PARSING) {
            stats.parsing--;
          } else if (tile.__loadingState === LOADING) {
            stats.downloading--;
          }
          stats.failed++;
          console.error(`TilesRenderer : Failed to load tile at url "${tile.content.uri}".`);
          console.error(error);
          tile.__loadingState = FAILED;
          lruCache.setLoaded(tile, true);
          this.dispatchEvent({
            type: "load-error",
            tile,
            error,
            url: uri
          });
        } else {
          lruCache.remove(tile);
        }
      });
    }
  }
  function readMagicBytes(bufferOrDataView) {
    if (bufferOrDataView === null || bufferOrDataView.byteLength < 4) {
      return "";
    }
    let view;
    if (bufferOrDataView instanceof DataView) {
      view = bufferOrDataView;
    } else {
      view = new DataView(bufferOrDataView);
    }
    if (String.fromCharCode(view.getUint8(0)) === "{") {
      return null;
    }
    let magicBytes = "";
    for (let i = 0; i < 4; i++) {
      magicBytes += String.fromCharCode(view.getUint8(i));
    }
    return magicBytes;
  }
  const utf8decoder = new TextDecoder();
  function arrayToString(array) {
    return utf8decoder.decode(array);
  }
  function getWorkingPath(url) {
    return url.replace(/[\\/][^\\/]+$/, "") + "/";
  }
  const LoaderUtils$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    arrayToString,
    getWorkingPath,
    readMagicBytes
  }, Symbol.toStringTag, { value: "Module" }));
  class LoaderBase {
    constructor() {
      this.fetchOptions = {};
      this.workingPath = "";
    }
    load(...args) {
      console.warn('Loader: "load" function has been deprecated in favor of "loadAsync".');
      return this.loadAsync(...args);
    }
    loadAsync(url) {
      return fetch(url, this.fetchOptions).then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load file "${url}" with status ${res.status} : ${res.statusText}`);
        }
        return res.arrayBuffer();
      }).then((buffer) => {
        if (this.workingPath === "") {
          this.workingPath = getWorkingPath(url);
        }
        return this.parse(buffer);
      });
    }
    resolveExternalURL(url) {
      return new URL(url, this.workingPath).href;
    }
    parse(buffer) {
      throw new Error("LoaderBase: Parse not implemented.");
    }
  }
  function parseBinArray(buffer, arrayStart, count, type, componentType, propertyName) {
    let stride;
    switch (type) {
      case "SCALAR":
        stride = 1;
        break;
      case "VEC2":
        stride = 2;
        break;
      case "VEC3":
        stride = 3;
        break;
      case "VEC4":
        stride = 4;
        break;
      default:
        throw new Error(`FeatureTable : Feature type not provided for "${propertyName}".`);
    }
    let data;
    const arrayLength = count * stride;
    switch (componentType) {
      case "BYTE":
        data = new Int8Array(buffer, arrayStart, arrayLength);
        break;
      case "UNSIGNED_BYTE":
        data = new Uint8Array(buffer, arrayStart, arrayLength);
        break;
      case "SHORT":
        data = new Int16Array(buffer, arrayStart, arrayLength);
        break;
      case "UNSIGNED_SHORT":
        data = new Uint16Array(buffer, arrayStart, arrayLength);
        break;
      case "INT":
        data = new Int32Array(buffer, arrayStart, arrayLength);
        break;
      case "UNSIGNED_INT":
        data = new Uint32Array(buffer, arrayStart, arrayLength);
        break;
      case "FLOAT":
        data = new Float32Array(buffer, arrayStart, arrayLength);
        break;
      case "DOUBLE":
        data = new Float64Array(buffer, arrayStart, arrayLength);
        break;
      default:
        throw new Error(`FeatureTable : Feature component type not provided for "${propertyName}".`);
    }
    return data;
  }
  class FeatureTable {
    constructor(buffer, start, headerLength, binLength) {
      this.buffer = buffer;
      this.binOffset = start + headerLength;
      this.binLength = binLength;
      let header = null;
      if (headerLength !== 0) {
        const headerData = new Uint8Array(buffer, start, headerLength);
        header = JSON.parse(arrayToString(headerData));
      } else {
        header = {};
      }
      this.header = header;
    }
    getKeys() {
      return Object.keys(this.header).filter((key) => key !== "extensions");
    }
    getData(key, count, defaultComponentType = null, defaultType = null) {
      const header = this.header;
      if (!(key in header)) {
        return null;
      }
      const feature = header[key];
      if (!(feature instanceof Object)) {
        return feature;
      } else if (Array.isArray(feature)) {
        return feature;
      } else {
        const { buffer, binOffset, binLength } = this;
        const byteOffset = feature.byteOffset || 0;
        const featureType = feature.type || defaultType;
        const featureComponentType = feature.componentType || defaultComponentType;
        if ("type" in feature && defaultType && feature.type !== defaultType) {
          throw new Error("FeatureTable: Specified type does not match expected type.");
        }
        const arrayStart = binOffset + byteOffset;
        const data = parseBinArray(buffer, arrayStart, count, featureType, featureComponentType, key);
        const dataEnd = arrayStart + data.byteLength;
        if (dataEnd > binOffset + binLength) {
          throw new Error("FeatureTable: Feature data read outside binary body length.");
        }
        return data;
      }
    }
    getBuffer(byteOffset, byteLength) {
      const { buffer, binOffset } = this;
      return buffer.slice(binOffset + byteOffset, binOffset + byteOffset + byteLength);
    }
  }
  class BatchTableHierarchyExtension {
    constructor(batchTable) {
      this.batchTable = batchTable;
      const extensionHeader = batchTable.header.extensions["3DTILES_batch_table_hierarchy"];
      this.classes = extensionHeader.classes;
      for (const classDef of this.classes) {
        const instances = classDef.instances;
        for (const property in instances) {
          classDef.instances[property] = this._parseProperty(instances[property], classDef.length, property);
        }
      }
      this.instancesLength = extensionHeader.instancesLength;
      this.classIds = this._parseProperty(extensionHeader.classIds, this.instancesLength, "classIds");
      if (extensionHeader.parentCounts) {
        this.parentCounts = this._parseProperty(extensionHeader.parentCounts, this.instancesLength, "parentCounts");
      } else {
        this.parentCounts = new Array(this.instancesLength).fill(1);
      }
      if (extensionHeader.parentIds) {
        const parentIdsLength = this.parentCounts.reduce((a, b) => a + b, 0);
        this.parentIds = this._parseProperty(extensionHeader.parentIds, parentIdsLength, "parentIds");
      } else {
        this.parentIds = null;
      }
      this.instancesIds = [];
      const classCounter = {};
      for (const classId of this.classIds) {
        classCounter[classId] = classCounter[classId] ?? 0;
        this.instancesIds.push(classCounter[classId]);
        classCounter[classId]++;
      }
    }
    _parseProperty(property, propertyLength, propertyName) {
      if (Array.isArray(property)) {
        return property;
      } else {
        const { buffer, binOffset } = this.batchTable;
        const byteOffset = property.byteOffset;
        const componentType = property.componentType || "UNSIGNED_SHORT";
        const arrayStart = binOffset + byteOffset;
        return parseBinArray(buffer, arrayStart, propertyLength, "SCALAR", componentType, propertyName);
      }
    }
    getDataFromId(id, target = {}) {
      const parentCount = this.parentCounts[id];
      if (this.parentIds && parentCount > 0) {
        let parentIdsOffset = 0;
        for (let i = 0; i < id; i++) {
          parentIdsOffset += this.parentCounts[i];
        }
        for (let i = 0; i < parentCount; i++) {
          const parentId = this.parentIds[parentIdsOffset + i];
          if (parentId !== id) {
            this.getDataFromId(parentId, target);
          }
        }
      }
      const classId = this.classIds[id];
      const instances = this.classes[classId].instances;
      const className = this.classes[classId].name;
      const instanceId = this.instancesIds[id];
      for (const key in instances) {
        target[className] = target[className] || {};
        target[className][key] = instances[key][instanceId];
      }
      return target;
    }
  }
  class BatchTable extends FeatureTable {
    get batchSize() {
      console.warn("BatchTable.batchSize has been deprecated and replaced with BatchTable.count.");
      return this.count;
    }
    constructor(buffer, count, start, headerLength, binLength) {
      super(buffer, start, headerLength, binLength);
      this.count = count;
      this.extensions = {};
      const extensions = this.header.extensions;
      if (extensions) {
        if (extensions["3DTILES_batch_table_hierarchy"]) {
          this.extensions["3DTILES_batch_table_hierarchy"] = new BatchTableHierarchyExtension(this);
        }
      }
    }
    getData(key, componentType = null, type = null) {
      console.warn("BatchTable: BatchTable.getData is deprecated. Use BatchTable.getDataFromId to get allproperties for an id or BatchTable.getPropertyArray for getting an array of value for a property.");
      return super.getData(key, this.count, componentType, type);
    }
    getDataFromId(id, target = {}) {
      if (id < 0 || id >= this.count) {
        throw new Error(`BatchTable: id value "${id}" out of bounds for "${this.count}" features number.`);
      }
      for (const key of this.getKeys()) {
        target[key] = super.getData(key, this.count)[id];
      }
      for (const extensionName in this.extensions) {
        const extension = this.extensions[extensionName];
        if (extension.getDataFromId instanceof Function) {
          target[extensionName] = target[extensionName] || {};
          extension.getDataFromId(id, target[extensionName]);
        }
      }
      return target;
    }
    getPropertyArray(key) {
      return super.getData(key, this.count);
    }
  }
  class B3DMLoaderBase extends LoaderBase {
    parse(buffer) {
      const dataView = new DataView(buffer);
      const magic = readMagicBytes(dataView);
      console.assert(magic === "b3dm");
      const version = dataView.getUint32(4, true);
      console.assert(version === 1);
      const byteLength = dataView.getUint32(8, true);
      console.assert(byteLength === buffer.byteLength);
      const featureTableJSONByteLength = dataView.getUint32(12, true);
      const featureTableBinaryByteLength = dataView.getUint32(16, true);
      const batchTableJSONByteLength = dataView.getUint32(20, true);
      const batchTableBinaryByteLength = dataView.getUint32(24, true);
      const featureTableStart = 28;
      const featureTableBuffer = buffer.slice(
        featureTableStart,
        featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength
      );
      const featureTable = new FeatureTable(
        featureTableBuffer,
        0,
        featureTableJSONByteLength,
        featureTableBinaryByteLength
      );
      const batchTableStart = featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength;
      const batchTableBuffer = buffer.slice(
        batchTableStart,
        batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength
      );
      const batchTable = new BatchTable(
        batchTableBuffer,
        featureTable.getData("BATCH_LENGTH"),
        0,
        batchTableJSONByteLength,
        batchTableBinaryByteLength
      );
      const glbStart = batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength;
      const glbBytes = new Uint8Array(buffer, glbStart, byteLength - glbStart);
      return {
        version,
        featureTable,
        batchTable,
        glbBytes
      };
    }
  }
  class I3DMLoaderBase extends LoaderBase {
    parse(buffer) {
      const dataView = new DataView(buffer);
      const magic = readMagicBytes(dataView);
      console.assert(magic === "i3dm");
      const version = dataView.getUint32(4, true);
      console.assert(version === 1);
      const byteLength = dataView.getUint32(8, true);
      console.assert(byteLength === buffer.byteLength);
      const featureTableJSONByteLength = dataView.getUint32(12, true);
      const featureTableBinaryByteLength = dataView.getUint32(16, true);
      const batchTableJSONByteLength = dataView.getUint32(20, true);
      const batchTableBinaryByteLength = dataView.getUint32(24, true);
      const gltfFormat = dataView.getUint32(28, true);
      const featureTableStart = 32;
      const featureTableBuffer = buffer.slice(
        featureTableStart,
        featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength
      );
      const featureTable = new FeatureTable(
        featureTableBuffer,
        0,
        featureTableJSONByteLength,
        featureTableBinaryByteLength
      );
      const batchTableStart = featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength;
      const batchTableBuffer = buffer.slice(
        batchTableStart,
        batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength
      );
      const batchTable = new BatchTable(
        batchTableBuffer,
        featureTable.getData("INSTANCES_LENGTH"),
        0,
        batchTableJSONByteLength,
        batchTableBinaryByteLength
      );
      const glbStart = batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength;
      const bodyBytes = new Uint8Array(buffer, glbStart, byteLength - glbStart);
      let glbBytes = null;
      let promise = null;
      let gltfWorkingPath = null;
      if (gltfFormat) {
        glbBytes = bodyBytes;
        promise = Promise.resolve();
      } else {
        const externalUri = this.resolveExternalURL(arrayToString(bodyBytes));
        gltfWorkingPath = getWorkingPath(externalUri);
        promise = fetch(externalUri, this.fetchOptions).then((res) => {
          if (!res.ok) {
            throw new Error(`I3DMLoaderBase : Failed to load file "${externalUri}" with status ${res.status} : ${res.statusText}`);
          }
          return res.arrayBuffer();
        }).then((buffer2) => {
          glbBytes = new Uint8Array(buffer2);
        });
      }
      return promise.then(() => {
        return {
          version,
          featureTable,
          batchTable,
          glbBytes,
          gltfWorkingPath
        };
      });
    }
  }
  class PNTSLoaderBase extends LoaderBase {
    parse(buffer) {
      const dataView = new DataView(buffer);
      const magic = readMagicBytes(dataView);
      console.assert(magic === "pnts");
      const version = dataView.getUint32(4, true);
      console.assert(version === 1);
      const byteLength = dataView.getUint32(8, true);
      console.assert(byteLength === buffer.byteLength);
      const featureTableJSONByteLength = dataView.getUint32(12, true);
      const featureTableBinaryByteLength = dataView.getUint32(16, true);
      const batchTableJSONByteLength = dataView.getUint32(20, true);
      const batchTableBinaryByteLength = dataView.getUint32(24, true);
      const featureTableStart = 28;
      const featureTableBuffer = buffer.slice(
        featureTableStart,
        featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength
      );
      const featureTable = new FeatureTable(
        featureTableBuffer,
        0,
        featureTableJSONByteLength,
        featureTableBinaryByteLength
      );
      const batchTableStart = featureTableStart + featureTableJSONByteLength + featureTableBinaryByteLength;
      const batchTableBuffer = buffer.slice(
        batchTableStart,
        batchTableStart + batchTableJSONByteLength + batchTableBinaryByteLength
      );
      const batchTable = new BatchTable(
        batchTableBuffer,
        featureTable.getData("BATCH_LENGTH") || featureTable.getData("POINTS_LENGTH"),
        0,
        batchTableJSONByteLength,
        batchTableBinaryByteLength
      );
      return Promise.resolve({
        version,
        featureTable,
        batchTable
      });
    }
  }
  class CMPTLoaderBase extends LoaderBase {
    parse(buffer) {
      const dataView = new DataView(buffer);
      const magic = readMagicBytes(dataView);
      console.assert(magic === "cmpt", 'CMPTLoader: The magic bytes equal "cmpt".');
      const version = dataView.getUint32(4, true);
      console.assert(version === 1, 'CMPTLoader: The version listed in the header is "1".');
      const byteLength = dataView.getUint32(8, true);
      console.assert(byteLength === buffer.byteLength, "CMPTLoader: The contents buffer length listed in the header matches the file.");
      const tilesLength = dataView.getUint32(12, true);
      const tiles = [];
      let offset = 16;
      for (let i = 0; i < tilesLength; i++) {
        const tileView = new DataView(buffer, offset, 12);
        const tileMagic = readMagicBytes(tileView);
        const tileVersion = tileView.getUint32(4, true);
        const byteLength2 = tileView.getUint32(8, true);
        const tileBuffer = new Uint8Array(buffer, offset, byteLength2);
        tiles.push({
          type: tileMagic,
          buffer: tileBuffer,
          version: tileVersion
        });
        offset += byteLength2;
      }
      return {
        version,
        tiles
      };
    }
  }
  /**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   */
  const REVISION = "170";
  const FrontSide = 0;
  const BackSide = 1;
  const DoubleSide = 2;
  const NormalBlending = 1;
  const AddEquation = 100;
  const SrcAlphaFactor = 204;
  const OneMinusSrcAlphaFactor = 205;
  const LessEqualDepth = 3;
  const MultiplyOperation = 0;
  const AttachedBindMode = "attached";
  const DetachedBindMode = "detached";
  const UVMapping = 300;
  const RepeatWrapping = 1e3;
  const ClampToEdgeWrapping = 1001;
  const MirroredRepeatWrapping = 1002;
  const NearestFilter = 1003;
  const NearestMipmapNearestFilter = 1004;
  const NearestMipmapLinearFilter = 1005;
  const LinearFilter = 1006;
  const LinearMipmapNearestFilter = 1007;
  const LinearMipmapLinearFilter = 1008;
  const UnsignedByteType = 1009;
  const ByteType = 1010;
  const ShortType = 1011;
  const UnsignedShortType = 1012;
  const IntType = 1013;
  const UnsignedIntType = 1014;
  const FloatType = 1015;
  const HalfFloatType = 1016;
  const UnsignedShort4444Type = 1017;
  const UnsignedShort5551Type = 1018;
  const UnsignedInt5999Type = 35902;
  const AlphaFormat = 1021;
  const RGBFormat = 1022;
  const RGBAFormat = 1023;
  const LuminanceFormat = 1024;
  const LuminanceAlphaFormat = 1025;
  const RedFormat = 1028;
  const RedIntegerFormat = 1029;
  const RGFormat = 1030;
  const RGIntegerFormat = 1031;
  const RGBAIntegerFormat = 1033;
  const RGB_S3TC_DXT1_Format = 33776;
  const RGBA_S3TC_DXT1_Format = 33777;
  const RGBA_S3TC_DXT3_Format = 33778;
  const RGBA_S3TC_DXT5_Format = 33779;
  const RGB_PVRTC_4BPPV1_Format = 35840;
  const RGB_PVRTC_2BPPV1_Format = 35841;
  const RGBA_PVRTC_4BPPV1_Format = 35842;
  const RGBA_PVRTC_2BPPV1_Format = 35843;
  const RGB_ETC1_Format = 36196;
  const RGB_ETC2_Format = 37492;
  const RGBA_ETC2_EAC_Format = 37496;
  const RGBA_ASTC_4x4_Format = 37808;
  const RGBA_ASTC_5x4_Format = 37809;
  const RGBA_ASTC_5x5_Format = 37810;
  const RGBA_ASTC_6x5_Format = 37811;
  const RGBA_ASTC_6x6_Format = 37812;
  const RGBA_ASTC_8x5_Format = 37813;
  const RGBA_ASTC_8x6_Format = 37814;
  const RGBA_ASTC_8x8_Format = 37815;
  const RGBA_ASTC_10x5_Format = 37816;
  const RGBA_ASTC_10x6_Format = 37817;
  const RGBA_ASTC_10x8_Format = 37818;
  const RGBA_ASTC_10x10_Format = 37819;
  const RGBA_ASTC_12x10_Format = 37820;
  const RGBA_ASTC_12x12_Format = 37821;
  const RGBA_BPTC_Format = 36492;
  const RGB_BPTC_SIGNED_Format = 36494;
  const RGB_BPTC_UNSIGNED_Format = 36495;
  const RED_RGTC1_Format = 36283;
  const SIGNED_RED_RGTC1_Format = 36284;
  const RED_GREEN_RGTC2_Format = 36285;
  const SIGNED_RED_GREEN_RGTC2_Format = 36286;
  const InterpolateDiscrete = 2300;
  const InterpolateLinear = 2301;
  const InterpolateSmooth = 2302;
  const ZeroCurvatureEnding = 2400;
  const ZeroSlopeEnding = 2401;
  const WrapAroundEnding = 2402;
  const NormalAnimationBlendMode = 2500;
  const TrianglesDrawMode = 0;
  const TriangleStripDrawMode = 1;
  const TriangleFanDrawMode = 2;
  const TangentSpaceNormalMap = 0;
  const NoColorSpace = "";
  const SRGBColorSpace = "srgb";
  const LinearSRGBColorSpace = "srgb-linear";
  const LinearTransfer = "linear";
  const SRGBTransfer = "srgb";
  const KeepStencilOp = 7680;
  const AlwaysStencilFunc = 519;
  const StaticDrawUsage = 35044;
  const WebGLCoordinateSystem = 2e3;
  const WebGPUCoordinateSystem = 2001;
  class EventDispatcher {
    addEventListener(type, listener) {
      if (this._listeners === void 0) this._listeners = {};
      const listeners = this._listeners;
      if (listeners[type] === void 0) {
        listeners[type] = [];
      }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
      }
    }
    hasEventListener(type, listener) {
      if (this._listeners === void 0) return false;
      const listeners = this._listeners;
      return listeners[type] !== void 0 && listeners[type].indexOf(listener) !== -1;
    }
    removeEventListener(type, listener) {
      if (this._listeners === void 0) return;
      const listeners = this._listeners;
      const listenerArray = listeners[type];
      if (listenerArray !== void 0) {
        const index = listenerArray.indexOf(listener);
        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      }
    }
    dispatchEvent(event) {
      if (this._listeners === void 0) return;
      const listeners = this._listeners;
      const listenerArray = listeners[event.type];
      if (listenerArray !== void 0) {
        event.target = this;
        const array = listenerArray.slice(0);
        for (let i = 0, l = array.length; i < l; i++) {
          array[i].call(this, event);
        }
        event.target = null;
      }
    }
  }
  const _lut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
  let _seed = 1234567;
  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;
  function generateUUID() {
    const d0 = Math.random() * 4294967295 | 0;
    const d1 = Math.random() * 4294967295 | 0;
    const d2 = Math.random() * 4294967295 | 0;
    const d3 = Math.random() * 4294967295 | 0;
    const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
    return uuid.toLowerCase();
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function euclideanModulo(n, m) {
    return (n % m + m) % m;
  }
  function mapLinear(x, a1, a2, b1, b2) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  }
  function inverseLerp(x, y, value) {
    if (x !== y) {
      return (value - x) / (y - x);
    } else {
      return 0;
    }
  }
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }
  function damp(x, y, lambda, dt) {
    return lerp(x, y, 1 - Math.exp(-lambda * dt));
  }
  function pingpong(x, length = 1) {
    return length - Math.abs(euclideanModulo(x, length * 2) - length);
  }
  function smoothstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  }
  function smootherstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }
  function randInt(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
  }
  function randFloat(low, high) {
    return low + Math.random() * (high - low);
  }
  function randFloatSpread(range) {
    return range * (0.5 - Math.random());
  }
  function seededRandom(s) {
    if (s !== void 0) _seed = s;
    let t = _seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function degToRad(degrees) {
    return degrees * DEG2RAD;
  }
  function radToDeg(radians) {
    return radians * RAD2DEG;
  }
  function isPowerOfTwo(value) {
    return (value & value - 1) === 0 && value !== 0;
  }
  function ceilPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
  }
  function floorPowerOfTwo(value) {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
  }
  function setQuaternionFromProperEuler(q, a, b, c, order) {
    const cos = Math.cos;
    const sin = Math.sin;
    const c2 = cos(b / 2);
    const s2 = sin(b / 2);
    const c13 = cos((a + c) / 2);
    const s13 = sin((a + c) / 2);
    const c1_3 = cos((a - c) / 2);
    const s1_3 = sin((a - c) / 2);
    const c3_1 = cos((c - a) / 2);
    const s3_1 = sin((c - a) / 2);
    switch (order) {
      case "XYX":
        q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
        break;
      case "YZY":
        q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
        break;
      case "ZXZ":
        q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
        break;
      case "XZX":
        q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
        break;
      case "YXY":
        q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
        break;
      case "ZYZ":
        q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
        break;
      default:
        console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + order);
    }
  }
  function denormalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return value / 4294967295;
      case Uint16Array:
        return value / 65535;
      case Uint8Array:
        return value / 255;
      case Int32Array:
        return Math.max(value / 2147483647, -1);
      case Int16Array:
        return Math.max(value / 32767, -1);
      case Int8Array:
        return Math.max(value / 127, -1);
      default:
        throw new Error("Invalid component type.");
    }
  }
  function normalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;
      case Uint32Array:
        return Math.round(value * 4294967295);
      case Uint16Array:
        return Math.round(value * 65535);
      case Uint8Array:
        return Math.round(value * 255);
      case Int32Array:
        return Math.round(value * 2147483647);
      case Int16Array:
        return Math.round(value * 32767);
      case Int8Array:
        return Math.round(value * 127);
      default:
        throw new Error("Invalid component type.");
    }
  }
  const MathUtils = {
    DEG2RAD,
    RAD2DEG,
    generateUUID,
    clamp,
    euclideanModulo,
    mapLinear,
    inverseLerp,
    lerp,
    damp,
    pingpong,
    smoothstep,
    smootherstep,
    randInt,
    randFloat,
    randFloatSpread,
    seededRandom,
    degToRad,
    radToDeg,
    isPowerOfTwo,
    ceilPowerOfTwo,
    floorPowerOfTwo,
    setQuaternionFromProperEuler,
    normalize,
    denormalize
  };
  class Vector2 {
    constructor(x = 0, y = 0) {
      Vector2.prototype.isVector2 = true;
      this.x = x;
      this.y = y;
    }
    get width() {
      return this.x;
    }
    set width(value) {
      this.x = value;
    }
    get height() {
      return this.y;
    }
    set height(value) {
      this.y = value;
    }
    set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      return this;
    }
    setX(x) {
      this.x = x;
      return this;
    }
    setY(y) {
      this.y = y;
      return this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    addScalar(s) {
      this.x += s;
      this.y += s;
      return this;
    }
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      return this;
    }
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      return this;
    }
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      return this;
    }
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    }
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      return this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    applyMatrix3(m) {
      const x = this.x, y = this.y;
      const e = m.elements;
      this.x = e[0] * x + e[3] * y + e[6];
      this.y = e[1] * x + e[4] * y + e[7];
      return this;
    }
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      return this;
    }
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      return this;
    }
    clamp(min, max) {
      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));
      return this;
    }
    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));
      return this;
    }
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    }
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    }
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    }
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      return this;
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
    cross(v) {
      return this.x * v.y - this.y * v.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      const angle = Math.atan2(-this.y, -this.x) + Math.PI;
      return angle;
    }
    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      const theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
      const dx = this.x - v.x, dy = this.y - v.y;
      return dx * dx + dy * dy;
    }
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      return this;
    }
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      return this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y;
    }
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      return array;
    }
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      return this;
    }
    rotateAround(center, angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      const x = this.x - center.x;
      const y = this.y - center.y;
      this.x = x * c - y * s + center.x;
      this.y = x * s + y * c + center.y;
      return this;
    }
    random() {
      this.x = Math.random();
      this.y = Math.random();
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
    }
  }
  class Matrix3 {
    constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      Matrix3.prototype.isMatrix3 = true;
      this.elements = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ];
      if (n11 !== void 0) {
        this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
      }
    }
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      const te = this.elements;
      te[0] = n11;
      te[1] = n21;
      te[2] = n31;
      te[3] = n12;
      te[4] = n22;
      te[5] = n32;
      te[6] = n13;
      te[7] = n23;
      te[8] = n33;
      return this;
    }
    identity() {
      this.set(
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      );
      return this;
    }
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];
      return this;
    }
    extractBasis(xAxis, yAxis, zAxis) {
      xAxis.setFromMatrix3Column(this, 0);
      yAxis.setFromMatrix3Column(this, 1);
      zAxis.setFromMatrix3Column(this, 2);
      return this;
    }
    setFromMatrix4(m) {
      const me = m.elements;
      this.set(
        me[0],
        me[4],
        me[8],
        me[1],
        me[5],
        me[9],
        me[2],
        me[6],
        me[10]
      );
      return this;
    }
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      const a11 = ae[0], a12 = ae[3], a13 = ae[6];
      const a21 = ae[1], a22 = ae[4], a23 = ae[7];
      const a31 = ae[2], a32 = ae[5], a33 = ae[8];
      const b11 = be[0], b12 = be[3], b13 = be[6];
      const b21 = be[1], b22 = be[4], b23 = be[7];
      const b31 = be[2], b32 = be[5], b33 = be[8];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31;
      te[3] = a11 * b12 + a12 * b22 + a13 * b32;
      te[6] = a11 * b13 + a12 * b23 + a13 * b33;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31;
      te[4] = a21 * b12 + a22 * b22 + a23 * b32;
      te[7] = a21 * b13 + a22 * b23 + a23 * b33;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31;
      te[5] = a31 * b12 + a32 * b22 + a33 * b32;
      te[8] = a31 * b13 + a32 * b23 + a33 * b33;
      return this;
    }
    multiplyScalar(s) {
      const te = this.elements;
      te[0] *= s;
      te[3] *= s;
      te[6] *= s;
      te[1] *= s;
      te[4] *= s;
      te[7] *= s;
      te[2] *= s;
      te[5] *= s;
      te[8] *= s;
      return this;
    }
    determinant() {
      const te = this.elements;
      const a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f2 = te[5], g = te[6], h = te[7], i = te[8];
      return a * e * i - a * f2 * h - b * d * i + b * f2 * g + c * d * h - c * e * g;
    }
    invert() {
      const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n31 * n23 - n33 * n21) * detInv;
      te[2] = (n32 * n21 - n31 * n22) * detInv;
      te[3] = t12 * detInv;
      te[4] = (n33 * n11 - n31 * n13) * detInv;
      te[5] = (n31 * n12 - n32 * n11) * detInv;
      te[6] = t13 * detInv;
      te[7] = (n21 * n13 - n23 * n11) * detInv;
      te[8] = (n22 * n11 - n21 * n12) * detInv;
      return this;
    }
    transpose() {
      let tmp;
      const m = this.elements;
      tmp = m[1];
      m[1] = m[3];
      m[3] = tmp;
      tmp = m[2];
      m[2] = m[6];
      m[6] = tmp;
      tmp = m[5];
      m[5] = m[7];
      m[7] = tmp;
      return this;
    }
    getNormalMatrix(matrix4) {
      return this.setFromMatrix4(matrix4).invert().transpose();
    }
    transposeIntoArray(r) {
      const m = this.elements;
      r[0] = m[0];
      r[1] = m[3];
      r[2] = m[6];
      r[3] = m[1];
      r[4] = m[4];
      r[5] = m[7];
      r[6] = m[2];
      r[7] = m[5];
      r[8] = m[8];
      return this;
    }
    setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
      const c = Math.cos(rotation);
      const s = Math.sin(rotation);
      this.set(
        sx * c,
        sx * s,
        -sx * (c * cx + s * cy) + cx + tx,
        -sy * s,
        sy * c,
        -sy * (-s * cx + c * cy) + cy + ty,
        0,
        0,
        1
      );
      return this;
    }
    //
    scale(sx, sy) {
      this.premultiply(_m3.makeScale(sx, sy));
      return this;
    }
    rotate(theta) {
      this.premultiply(_m3.makeRotation(-theta));
      return this;
    }
    translate(tx, ty) {
      this.premultiply(_m3.makeTranslation(tx, ty));
      return this;
    }
    // for 2D Transforms
    makeTranslation(x, y) {
      if (x.isVector2) {
        this.set(
          1,
          0,
          x.x,
          0,
          1,
          x.y,
          0,
          0,
          1
        );
      } else {
        this.set(
          1,
          0,
          x,
          0,
          1,
          y,
          0,
          0,
          1
        );
      }
      return this;
    }
    makeRotation(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      this.set(
        c,
        -s,
        0,
        s,
        c,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeScale(x, y) {
      this.set(
        x,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        1
      );
      return this;
    }
    //
    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;
      for (let i = 0; i < 9; i++) {
        if (te[i] !== me[i]) return false;
      }
      return true;
    }
    fromArray(array, offset = 0) {
      for (let i = 0; i < 9; i++) {
        this.elements[i] = array[i + offset];
      }
      return this;
    }
    toArray(array = [], offset = 0) {
      const te = this.elements;
      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];
      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];
      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];
      return array;
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }
  const _m3 = /* @__PURE__ */ new Matrix3();
  function arrayNeedsUint32(array) {
    for (let i = array.length - 1; i >= 0; --i) {
      if (array[i] >= 65535) return true;
    }
    return false;
  }
  function createElementNS(name) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", name);
  }
  const ColorManagement = {
    enabled: true,
    workingColorSpace: LinearSRGBColorSpace,
    /**
     * Implementations of supported color spaces.
     *
     * Required:
     *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
     *	- whitePoint: reference white [ x y ]
     *	- transfer: transfer function (pre-defined)
     *	- toXYZ: Matrix3 RGB to XYZ transform
     *	- fromXYZ: Matrix3 XYZ to RGB transform
     *	- luminanceCoefficients: RGB luminance coefficients
     *
     * Optional:
     *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace }
     *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
     *
     * Reference:
     * - https://www.russellcottrell.com/photo/matrixCalculator.htm
     */
    spaces: {},
    convert: function(color, sourceColorSpace, targetColorSpace) {
      if (this.enabled === false || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace) {
        return color;
      }
      if (this.spaces[sourceColorSpace].transfer === SRGBTransfer) {
        color.r = SRGBToLinear(color.r);
        color.g = SRGBToLinear(color.g);
        color.b = SRGBToLinear(color.b);
      }
      if (this.spaces[sourceColorSpace].primaries !== this.spaces[targetColorSpace].primaries) {
        color.applyMatrix3(this.spaces[sourceColorSpace].toXYZ);
        color.applyMatrix3(this.spaces[targetColorSpace].fromXYZ);
      }
      if (this.spaces[targetColorSpace].transfer === SRGBTransfer) {
        color.r = LinearToSRGB(color.r);
        color.g = LinearToSRGB(color.g);
        color.b = LinearToSRGB(color.b);
      }
      return color;
    },
    fromWorkingColorSpace: function(color, targetColorSpace) {
      return this.convert(color, this.workingColorSpace, targetColorSpace);
    },
    toWorkingColorSpace: function(color, sourceColorSpace) {
      return this.convert(color, sourceColorSpace, this.workingColorSpace);
    },
    getPrimaries: function(colorSpace) {
      return this.spaces[colorSpace].primaries;
    },
    getTransfer: function(colorSpace) {
      if (colorSpace === NoColorSpace) return LinearTransfer;
      return this.spaces[colorSpace].transfer;
    },
    getLuminanceCoefficients: function(target, colorSpace = this.workingColorSpace) {
      return target.fromArray(this.spaces[colorSpace].luminanceCoefficients);
    },
    define: function(colorSpaces) {
      Object.assign(this.spaces, colorSpaces);
    },
    // Internal APIs
    _getMatrix: function(targetMatrix, sourceColorSpace, targetColorSpace) {
      return targetMatrix.copy(this.spaces[sourceColorSpace].toXYZ).multiply(this.spaces[targetColorSpace].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(colorSpace) {
      return this.spaces[colorSpace].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(colorSpace = this.workingColorSpace) {
      return this.spaces[colorSpace].workingColorSpaceConfig.unpackColorSpace;
    }
  };
  function SRGBToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }
  function LinearToSRGB(c) {
    return c < 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
  }
  const REC709_PRIMARIES = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06];
  const REC709_LUMINANCE_COEFFICIENTS = [0.2126, 0.7152, 0.0722];
  const D65 = [0.3127, 0.329];
  const LINEAR_REC709_TO_XYZ = /* @__PURE__ */ new Matrix3().set(
    0.4123908,
    0.3575843,
    0.1804808,
    0.212639,
    0.7151687,
    0.0721923,
    0.0193308,
    0.1191948,
    0.9505322
  );
  const XYZ_TO_LINEAR_REC709 = /* @__PURE__ */ new Matrix3().set(
    3.2409699,
    -1.5373832,
    -0.4986108,
    -0.9692436,
    1.8759675,
    0.0415551,
    0.0556301,
    -0.203977,
    1.0569715
  );
  ColorManagement.define({
    [LinearSRGBColorSpace]: {
      primaries: REC709_PRIMARIES,
      whitePoint: D65,
      transfer: LinearTransfer,
      toXYZ: LINEAR_REC709_TO_XYZ,
      fromXYZ: XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
      workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
      outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
    },
    [SRGBColorSpace]: {
      primaries: REC709_PRIMARIES,
      whitePoint: D65,
      transfer: SRGBTransfer,
      toXYZ: LINEAR_REC709_TO_XYZ,
      fromXYZ: XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
      outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
    }
  });
  let _canvas;
  class ImageUtils {
    static getDataURL(image) {
      if (/^data:/i.test(image.src)) {
        return image.src;
      }
      if (typeof HTMLCanvasElement === "undefined") {
        return image.src;
      }
      let canvas;
      if (image instanceof HTMLCanvasElement) {
        canvas = image;
      } else {
        if (_canvas === void 0) _canvas = createElementNS("canvas");
        _canvas.width = image.width;
        _canvas.height = image.height;
        const context = _canvas.getContext("2d");
        if (image instanceof ImageData) {
          context.putImageData(image, 0, 0);
        } else {
          context.drawImage(image, 0, 0, image.width, image.height);
        }
        canvas = _canvas;
      }
      if (canvas.width > 2048 || canvas.height > 2048) {
        console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", image);
        return canvas.toDataURL("image/jpeg", 0.6);
      } else {
        return canvas.toDataURL("image/png");
      }
    }
    static sRGBToLinear(image) {
      if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
        const canvas = createElementNS("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i++) {
          data[i] = SRGBToLinear(data[i] / 255) * 255;
        }
        context.putImageData(imageData, 0, 0);
        return canvas;
      } else if (image.data) {
        const data = image.data.slice(0);
        for (let i = 0; i < data.length; i++) {
          if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);
          } else {
            data[i] = SRGBToLinear(data[i]);
          }
        }
        return {
          data,
          width: image.width,
          height: image.height
        };
      } else {
        console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.");
        return image;
      }
    }
  }
  let _sourceId = 0;
  class Source {
    constructor(data = null) {
      this.isSource = true;
      Object.defineProperty(this, "id", { value: _sourceId++ });
      this.uuid = generateUUID();
      this.data = data;
      this.dataReady = true;
      this.version = 0;
    }
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      if (!isRootObject && meta.images[this.uuid] !== void 0) {
        return meta.images[this.uuid];
      }
      const output = {
        uuid: this.uuid,
        url: ""
      };
      const data = this.data;
      if (data !== null) {
        let url;
        if (Array.isArray(data)) {
          url = [];
          for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].isDataTexture) {
              url.push(serializeImage(data[i].image));
            } else {
              url.push(serializeImage(data[i]));
            }
          }
        } else {
          url = serializeImage(data);
        }
        output.url = url;
      }
      if (!isRootObject) {
        meta.images[this.uuid] = output;
      }
      return output;
    }
  }
  function serializeImage(image) {
    if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
      return ImageUtils.getDataURL(image);
    } else {
      if (image.data) {
        return {
          data: Array.from(image.data),
          width: image.width,
          height: image.height,
          type: image.data.constructor.name
        };
      } else {
        console.warn("THREE.Texture: Unable to serialize Texture.");
        return {};
      }
    }
  }
  let _textureId = 0;
  class Texture extends EventDispatcher {
    constructor(image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = NoColorSpace) {
      super();
      this.isTexture = true;
      Object.defineProperty(this, "id", { value: _textureId++ });
      this.uuid = generateUUID();
      this.name = "";
      this.source = new Source(image);
      this.mipmaps = [];
      this.mapping = mapping;
      this.channel = 0;
      this.wrapS = wrapS;
      this.wrapT = wrapT;
      this.magFilter = magFilter;
      this.minFilter = minFilter;
      this.anisotropy = anisotropy;
      this.format = format;
      this.internalFormat = null;
      this.type = type;
      this.offset = new Vector2(0, 0);
      this.repeat = new Vector2(1, 1);
      this.center = new Vector2(0, 0);
      this.rotation = 0;
      this.matrixAutoUpdate = true;
      this.matrix = new Matrix3();
      this.generateMipmaps = true;
      this.premultiplyAlpha = false;
      this.flipY = true;
      this.unpackAlignment = 4;
      this.colorSpace = colorSpace;
      this.userData = {};
      this.version = 0;
      this.onUpdate = null;
      this.isRenderTargetTexture = false;
      this.pmremVersion = 0;
    }
    get image() {
      return this.source.data;
    }
    set image(value = null) {
      this.source.data = value;
    }
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.name = source.name;
      this.source = source.source;
      this.mipmaps = source.mipmaps.slice(0);
      this.mapping = source.mapping;
      this.channel = source.channel;
      this.wrapS = source.wrapS;
      this.wrapT = source.wrapT;
      this.magFilter = source.magFilter;
      this.minFilter = source.minFilter;
      this.anisotropy = source.anisotropy;
      this.format = source.format;
      this.internalFormat = source.internalFormat;
      this.type = source.type;
      this.offset.copy(source.offset);
      this.repeat.copy(source.repeat);
      this.center.copy(source.center);
      this.rotation = source.rotation;
      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrix.copy(source.matrix);
      this.generateMipmaps = source.generateMipmaps;
      this.premultiplyAlpha = source.premultiplyAlpha;
      this.flipY = source.flipY;
      this.unpackAlignment = source.unpackAlignment;
      this.colorSpace = source.colorSpace;
      this.userData = JSON.parse(JSON.stringify(source.userData));
      this.needsUpdate = true;
      return this;
    }
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      if (!isRootObject && meta.textures[this.uuid] !== void 0) {
        return meta.textures[this.uuid];
      }
      const output = {
        metadata: {
          version: 4.6,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(meta).uuid,
        mapping: this.mapping,
        channel: this.channel,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        colorSpace: this.colorSpace,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      if (Object.keys(this.userData).length > 0) output.userData = this.userData;
      if (!isRootObject) {
        meta.textures[this.uuid] = output;
      }
      return output;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    transformUv(uv) {
      if (this.mapping !== UVMapping) return uv;
      uv.applyMatrix3(this.matrix);
      if (uv.x < 0 || uv.x > 1) {
        switch (this.wrapS) {
          case RepeatWrapping:
            uv.x = uv.x - Math.floor(uv.x);
            break;
          case ClampToEdgeWrapping:
            uv.x = uv.x < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.x) % 2) === 1) {
              uv.x = Math.ceil(uv.x) - uv.x;
            } else {
              uv.x = uv.x - Math.floor(uv.x);
            }
            break;
        }
      }
      if (uv.y < 0 || uv.y > 1) {
        switch (this.wrapT) {
          case RepeatWrapping:
            uv.y = uv.y - Math.floor(uv.y);
            break;
          case ClampToEdgeWrapping:
            uv.y = uv.y < 0 ? 0 : 1;
            break;
          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.y) % 2) === 1) {
              uv.y = Math.ceil(uv.y) - uv.y;
            } else {
              uv.y = uv.y - Math.floor(uv.y);
            }
            break;
        }
      }
      if (this.flipY) {
        uv.y = 1 - uv.y;
      }
      return uv;
    }
    set needsUpdate(value) {
      if (value === true) {
        this.version++;
        this.source.needsUpdate = true;
      }
    }
    set needsPMREMUpdate(value) {
      if (value === true) {
        this.pmremVersion++;
      }
    }
  }
  Texture.DEFAULT_IMAGE = null;
  Texture.DEFAULT_MAPPING = UVMapping;
  Texture.DEFAULT_ANISOTROPY = 1;
  class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      Vector4.prototype.isVector4 = true;
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    get width() {
      return this.z;
    }
    set width(value) {
      this.z = value;
    }
    get height() {
      return this.w;
    }
    set height(value) {
      this.w = value;
    }
    set(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    }
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;
      this.w = scalar;
      return this;
    }
    setX(x) {
      this.x = x;
      return this;
    }
    setY(y) {
      this.y = y;
      return this;
    }
    setZ(z) {
      this.z = z;
      return this;
    }
    setW(w) {
      this.w = w;
      return this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        case 3:
          this.w = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      this.w = v.w !== void 0 ? v.w : 1;
      return this;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      this.w += v.w;
      return this;
    }
    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;
      this.w += s;
      return this;
    }
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      this.w = a.w + b.w;
      return this;
    }
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      this.w += v.w * s;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      this.w -= v.w;
      return this;
    }
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;
      this.w -= s;
      return this;
    }
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      this.w = a.w - b.w;
      return this;
    }
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      this.w *= v.w;
      return this;
    }
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      this.w *= scalar;
      return this;
    }
    applyMatrix4(m) {
      const x = this.x, y = this.y, z = this.z, w = this.w;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
      this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
      return this;
    }
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
      this.w /= v.w;
      return this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    setAxisAngleFromQuaternion(q) {
      this.w = 2 * Math.acos(q.w);
      const s = Math.sqrt(1 - q.w * q.w);
      if (s < 1e-4) {
        this.x = 1;
        this.y = 0;
        this.z = 0;
      } else {
        this.x = q.x / s;
        this.y = q.y / s;
        this.z = q.z / s;
      }
      return this;
    }
    setAxisAngleFromRotationMatrix(m) {
      let angle, x, y, z;
      const epsilon = 0.01, epsilon2 = 0.1, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
      if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
        if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
          this.set(1, 0, 0, 0);
          return this;
        }
        angle = Math.PI;
        const xx = (m11 + 1) / 2;
        const yy = (m22 + 1) / 2;
        const zz = (m33 + 1) / 2;
        const xy = (m12 + m21) / 4;
        const xz = (m13 + m31) / 4;
        const yz = (m23 + m32) / 4;
        if (xx > yy && xx > zz) {
          if (xx < epsilon) {
            x = 0;
            y = 0.707106781;
            z = 0.707106781;
          } else {
            x = Math.sqrt(xx);
            y = xy / x;
            z = xz / x;
          }
        } else if (yy > zz) {
          if (yy < epsilon) {
            x = 0.707106781;
            y = 0;
            z = 0.707106781;
          } else {
            y = Math.sqrt(yy);
            x = xy / y;
            z = yz / y;
          }
        } else {
          if (zz < epsilon) {
            x = 0.707106781;
            y = 0.707106781;
            z = 0;
          } else {
            z = Math.sqrt(zz);
            x = xz / z;
            y = yz / z;
          }
        }
        this.set(x, y, z, angle);
        return this;
      }
      let s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
      if (Math.abs(s) < 1e-3) s = 1;
      this.x = (m32 - m23) / s;
      this.y = (m13 - m31) / s;
      this.z = (m21 - m12) / s;
      this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
      return this;
    }
    setFromMatrixPosition(m) {
      const e = m.elements;
      this.x = e[12];
      this.y = e[13];
      this.z = e[14];
      this.w = e[15];
      return this;
    }
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);
      this.w = Math.min(this.w, v.w);
      return this;
    }
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);
      this.w = Math.max(this.w, v.w);
      return this;
    }
    clamp(min, max) {
      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));
      this.z = Math.max(min.z, Math.min(max.z, this.z));
      this.w = Math.max(min.w, Math.min(max.w, this.w));
      return this;
    }
    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));
      this.z = Math.max(minVal, Math.min(maxVal, this.z));
      this.w = Math.max(minVal, Math.min(maxVal, this.w));
      return this;
    }
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      this.w = Math.floor(this.w);
      return this;
    }
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      this.w = Math.ceil(this.w);
      return this;
    }
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      this.w = Math.round(this.w);
      return this;
    }
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      this.z = Math.trunc(this.z);
      this.w = Math.trunc(this.w);
      return this;
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      this.w = -this.w;
      return this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      this.w += (v.w - this.w) * alpha;
      return this;
    }
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;
      this.w = v1.w + (v2.w - v1.w) * alpha;
      return this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
    }
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      this.w = array[offset + 3];
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      array[offset + 3] = this.w;
      return array;
    }
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);
      this.w = attribute.getW(index);
      return this;
    }
    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();
      this.w = Math.random();
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
      yield this.w;
    }
  }
  class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.isQuaternion = true;
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
    }
    static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
      let x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3];
      const x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
      if (t === 0) {
        dst[dstOffset + 0] = x0;
        dst[dstOffset + 1] = y0;
        dst[dstOffset + 2] = z0;
        dst[dstOffset + 3] = w0;
        return;
      }
      if (t === 1) {
        dst[dstOffset + 0] = x1;
        dst[dstOffset + 1] = y1;
        dst[dstOffset + 2] = z1;
        dst[dstOffset + 3] = w1;
        return;
      }
      if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
        let s = 1 - t;
        const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1, dir = cos >= 0 ? 1 : -1, sqrSin = 1 - cos * cos;
        if (sqrSin > Number.EPSILON) {
          const sin = Math.sqrt(sqrSin), len = Math.atan2(sin, cos * dir);
          s = Math.sin(s * len) / sin;
          t = Math.sin(t * len) / sin;
        }
        const tDir = t * dir;
        x0 = x0 * s + x1 * tDir;
        y0 = y0 * s + y1 * tDir;
        z0 = z0 * s + z1 * tDir;
        w0 = w0 * s + w1 * tDir;
        if (s === 1 - t) {
          const f2 = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
          x0 *= f2;
          y0 *= f2;
          z0 *= f2;
          w0 *= f2;
        }
      }
      dst[dstOffset] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
    }
    static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
      const x0 = src0[srcOffset0];
      const y0 = src0[srcOffset0 + 1];
      const z0 = src0[srcOffset0 + 2];
      const w0 = src0[srcOffset0 + 3];
      const x1 = src1[srcOffset1];
      const y1 = src1[srcOffset1 + 1];
      const z1 = src1[srcOffset1 + 2];
      const w1 = src1[srcOffset1 + 3];
      dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
      dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
      dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
      dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
      return dst;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(value) {
      this._w = value;
      this._onChangeCallback();
    }
    set(x, y, z, w) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
      this._onChangeCallback();
      return this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(quaternion) {
      this._x = quaternion.x;
      this._y = quaternion.y;
      this._z = quaternion.z;
      this._w = quaternion.w;
      this._onChangeCallback();
      return this;
    }
    setFromEuler(euler, update = true) {
      const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
      const cos = Math.cos;
      const sin = Math.sin;
      const c1 = cos(x / 2);
      const c2 = cos(y / 2);
      const c3 = cos(z / 2);
      const s1 = sin(x / 2);
      const s2 = sin(y / 2);
      const s3 = sin(z / 2);
      switch (order) {
        case "XYZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "YXZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "ZXY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "ZYX":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        case "YZX":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;
        case "XZY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;
        default:
          console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + order);
      }
      if (update === true) this._onChangeCallback();
      return this;
    }
    setFromAxisAngle(axis, angle) {
      const halfAngle = angle / 2, s = Math.sin(halfAngle);
      this._x = axis.x * s;
      this._y = axis.y * s;
      this._z = axis.z * s;
      this._w = Math.cos(halfAngle);
      this._onChangeCallback();
      return this;
    }
    setFromRotationMatrix(m) {
      const te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33;
      if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1);
        this._w = 0.25 / s;
        this._x = (m32 - m23) * s;
        this._y = (m13 - m31) * s;
        this._z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        this._w = (m32 - m23) / s;
        this._x = 0.25 * s;
        this._y = (m12 + m21) / s;
        this._z = (m13 + m31) / s;
      } else if (m22 > m33) {
        const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        this._w = (m13 - m31) / s;
        this._x = (m12 + m21) / s;
        this._y = 0.25 * s;
        this._z = (m23 + m32) / s;
      } else {
        const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        this._w = (m21 - m12) / s;
        this._x = (m13 + m31) / s;
        this._y = (m23 + m32) / s;
        this._z = 0.25 * s;
      }
      this._onChangeCallback();
      return this;
    }
    setFromUnitVectors(vFrom, vTo) {
      let r = vFrom.dot(vTo) + 1;
      if (r < Number.EPSILON) {
        r = 0;
        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          this._x = -vFrom.y;
          this._y = vFrom.x;
          this._z = 0;
          this._w = r;
        } else {
          this._x = 0;
          this._y = -vFrom.z;
          this._z = vFrom.y;
          this._w = r;
        }
      } else {
        this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
        this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
        this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
        this._w = r;
      }
      return this.normalize();
    }
    angleTo(q) {
      return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
    }
    rotateTowards(q, step) {
      const angle = this.angleTo(q);
      if (angle === 0) return this;
      const t = Math.min(1, step / angle);
      this.slerp(q, t);
      return this;
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      this._x *= -1;
      this._y *= -1;
      this._z *= -1;
      this._onChangeCallback();
      return this;
    }
    dot(v) {
      return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
      let l = this.length();
      if (l === 0) {
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._w = 1;
      } else {
        l = 1 / l;
        this._x = this._x * l;
        this._y = this._y * l;
        this._z = this._z * l;
        this._w = this._w * l;
      }
      this._onChangeCallback();
      return this;
    }
    multiply(q) {
      return this.multiplyQuaternions(this, q);
    }
    premultiply(q) {
      return this.multiplyQuaternions(q, this);
    }
    multiplyQuaternions(a, b) {
      const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
      const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
      this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
      this._onChangeCallback();
      return this;
    }
    slerp(qb, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(qb);
      const x = this._x, y = this._y, z = this._z, w = this._w;
      let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
      if (cosHalfTheta < 0) {
        this._w = -qb._w;
        this._x = -qb._x;
        this._y = -qb._y;
        this._z = -qb._z;
        cosHalfTheta = -cosHalfTheta;
      } else {
        this.copy(qb);
      }
      if (cosHalfTheta >= 1) {
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
        return this;
      }
      const sqrSinHalfTheta = 1 - cosHalfTheta * cosHalfTheta;
      if (sqrSinHalfTheta <= Number.EPSILON) {
        const s = 1 - t;
        this._w = s * w + t * this._w;
        this._x = s * x + t * this._x;
        this._y = s * y + t * this._y;
        this._z = s * z + t * this._z;
        this.normalize();
        return this;
      }
      const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
      const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
      const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
      this._w = w * ratioA + this._w * ratioB;
      this._x = x * ratioA + this._x * ratioB;
      this._y = y * ratioA + this._y * ratioB;
      this._z = z * ratioA + this._z * ratioB;
      this._onChangeCallback();
      return this;
    }
    slerpQuaternions(qa, qb, t) {
      return this.copy(qa).slerp(qb, t);
    }
    random() {
      const theta1 = 2 * Math.PI * Math.random();
      const theta2 = 2 * Math.PI * Math.random();
      const x0 = Math.random();
      const r1 = Math.sqrt(1 - x0);
      const r2 = Math.sqrt(x0);
      return this.set(
        r1 * Math.sin(theta1),
        r1 * Math.cos(theta1),
        r2 * Math.sin(theta2),
        r2 * Math.cos(theta2)
      );
    }
    equals(quaternion) {
      return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
    }
    fromArray(array, offset = 0) {
      this._x = array[offset];
      this._y = array[offset + 1];
      this._z = array[offset + 2];
      this._w = array[offset + 3];
      this._onChangeCallback();
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._w;
      return array;
    }
    fromBufferAttribute(attribute, index) {
      this._x = attribute.getX(index);
      this._y = attribute.getY(index);
      this._z = attribute.getZ(index);
      this._w = attribute.getW(index);
      this._onChangeCallback();
      return this;
    }
    toJSON() {
      return this.toArray();
    }
    _onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._w;
    }
  }
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      Vector3.prototype.isVector3 = true;
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x, y, z) {
      if (z === void 0) z = this.z;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;
      return this;
    }
    setX(x) {
      this.x = x;
      return this;
    }
    setY(y) {
      this.y = y;
      return this;
    }
    setZ(z) {
      this.z = z;
      return this;
    }
    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }
      return this;
    }
    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + index);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;
      return this;
    }
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;
    }
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;
      return this;
    }
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    }
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;
    }
    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    }
    multiplyVectors(a, b) {
      this.x = a.x * b.x;
      this.y = a.y * b.y;
      this.z = a.z * b.z;
      return this;
    }
    applyEuler(euler) {
      return this.applyQuaternion(_quaternion$4.setFromEuler(euler));
    }
    applyAxisAngle(axis, angle) {
      return this.applyQuaternion(_quaternion$4.setFromAxisAngle(axis, angle));
    }
    applyMatrix3(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[3] * y + e[6] * z;
      this.y = e[1] * x + e[4] * y + e[7] * z;
      this.z = e[2] * x + e[5] * y + e[8] * z;
      return this;
    }
    applyNormalMatrix(m) {
      return this.applyMatrix3(m).normalize();
    }
    applyMatrix4(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      return this;
    }
    applyQuaternion(q) {
      const vx = this.x, vy = this.y, vz = this.z;
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      const tx = 2 * (qy * vz - qz * vy);
      const ty = 2 * (qz * vx - qx * vz);
      const tz = 2 * (qx * vy - qy * vx);
      this.x = vx + qw * tx + qy * tz - qz * ty;
      this.y = vy + qw * ty + qz * tx - qx * tz;
      this.z = vz + qw * tz + qx * ty - qy * tx;
      return this;
    }
    project(camera) {
      return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    }
    unproject(camera) {
      return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
    }
    transformDirection(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z;
      this.y = e[1] * x + e[5] * y + e[9] * z;
      this.z = e[2] * x + e[6] * y + e[10] * z;
      return this.normalize();
    }
    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
      return this;
    }
    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }
    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);
      return this;
    }
    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);
      return this;
    }
    clamp(min, max) {
      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));
      this.z = Math.max(min.z, Math.min(max.z, this.z));
      return this;
    }
    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));
      this.z = Math.max(minVal, Math.min(maxVal, this.z));
      return this;
    }
    clampLength(min, max) {
      const length = this.length();
      return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
    }
    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    }
    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    }
    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    }
    roundToZero() {
      this.x = Math.trunc(this.x);
      this.y = Math.trunc(this.y);
      this.z = Math.trunc(this.z);
      return this;
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      return this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    // TODO lengthSquared?
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      return this;
    }
    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;
      return this;
    }
    cross(v) {
      return this.crossVectors(this, v);
    }
    crossVectors(a, b) {
      const ax = a.x, ay = a.y, az = a.z;
      const bx = b.x, by = b.y, bz = b.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    }
    projectOnVector(v) {
      const denominator = v.lengthSq();
      if (denominator === 0) return this.set(0, 0, 0);
      const scalar = v.dot(this) / denominator;
      return this.copy(v).multiplyScalar(scalar);
    }
    projectOnPlane(planeNormal) {
      _vector$c.copy(this).projectOnVector(planeNormal);
      return this.sub(_vector$c);
    }
    reflect(normal) {
      return this.sub(_vector$c.copy(normal).multiplyScalar(2 * this.dot(normal)));
    }
    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
      if (denominator === 0) return Math.PI / 2;
      const theta = this.dot(v) / denominator;
      return Math.acos(clamp(theta, -1, 1));
    }
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
      const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }
    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }
    setFromSpherical(s) {
      return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }
    setFromSphericalCoords(radius, phi, theta) {
      const sinPhiRadius = Math.sin(phi) * radius;
      this.x = sinPhiRadius * Math.sin(theta);
      this.y = Math.cos(phi) * radius;
      this.z = sinPhiRadius * Math.cos(theta);
      return this;
    }
    setFromCylindrical(c) {
      return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
    }
    setFromCylindricalCoords(radius, theta, y) {
      this.x = radius * Math.sin(theta);
      this.y = y;
      this.z = radius * Math.cos(theta);
      return this;
    }
    setFromMatrixPosition(m) {
      const e = m.elements;
      this.x = e[12];
      this.y = e[13];
      this.z = e[14];
      return this;
    }
    setFromMatrixScale(m) {
      const sx = this.setFromMatrixColumn(m, 0).length();
      const sy = this.setFromMatrixColumn(m, 1).length();
      const sz = this.setFromMatrixColumn(m, 2).length();
      this.x = sx;
      this.y = sy;
      this.z = sz;
      return this;
    }
    setFromMatrixColumn(m, index) {
      return this.fromArray(m.elements, index * 4);
    }
    setFromMatrix3Column(m, index) {
      return this.fromArray(m.elements, index * 3);
    }
    setFromEuler(e) {
      this.x = e._x;
      this.y = e._y;
      this.z = e._z;
      return this;
    }
    setFromColor(c) {
      this.x = c.r;
      this.y = c.g;
      this.z = c.b;
      return this;
    }
    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z;
    }
    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      return array;
    }
    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);
      return this;
    }
    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();
      return this;
    }
    randomDirection() {
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const c = Math.sqrt(1 - u * u);
      this.x = c * Math.cos(theta);
      this.y = u;
      this.z = c * Math.sin(theta);
      return this;
    }
    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
    }
  }
  const _vector$c = /* @__PURE__ */ new Vector3();
  const _quaternion$4 = /* @__PURE__ */ new Quaternion();
  class Box3 {
    constructor(min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
      this.isBox3 = true;
      this.min = min;
      this.max = max;
    }
    set(min, max) {
      this.min.copy(min);
      this.max.copy(max);
      return this;
    }
    setFromArray(array) {
      this.makeEmpty();
      for (let i = 0, il = array.length; i < il; i += 3) {
        this.expandByPoint(_vector$b.fromArray(array, i));
      }
      return this;
    }
    setFromBufferAttribute(attribute) {
      this.makeEmpty();
      for (let i = 0, il = attribute.count; i < il; i++) {
        this.expandByPoint(_vector$b.fromBufferAttribute(attribute, i));
      }
      return this;
    }
    setFromPoints(points) {
      this.makeEmpty();
      for (let i = 0, il = points.length; i < il; i++) {
        this.expandByPoint(points[i]);
      }
      return this;
    }
    setFromCenterAndSize(center, size) {
      const halfSize = _vector$b.copy(size).multiplyScalar(0.5);
      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);
      return this;
    }
    setFromObject(object, precise = false) {
      this.makeEmpty();
      return this.expandByObject(object, precise);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(box) {
      this.min.copy(box.min);
      this.max.copy(box.max);
      return this;
    }
    makeEmpty() {
      this.min.x = this.min.y = this.min.z = Infinity;
      this.max.x = this.max.y = this.max.z = -Infinity;
      return this;
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(target) {
      return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
    }
    expandByPoint(point) {
      this.min.min(point);
      this.max.max(point);
      return this;
    }
    expandByVector(vector) {
      this.min.sub(vector);
      this.max.add(vector);
      return this;
    }
    expandByScalar(scalar) {
      this.min.addScalar(-scalar);
      this.max.addScalar(scalar);
      return this;
    }
    expandByObject(object, precise = false) {
      object.updateWorldMatrix(false, false);
      const geometry = object.geometry;
      if (geometry !== void 0) {
        const positionAttribute = geometry.getAttribute("position");
        if (precise === true && positionAttribute !== void 0 && object.isInstancedMesh !== true) {
          for (let i = 0, l = positionAttribute.count; i < l; i++) {
            if (object.isMesh === true) {
              object.getVertexPosition(i, _vector$b);
            } else {
              _vector$b.fromBufferAttribute(positionAttribute, i);
            }
            _vector$b.applyMatrix4(object.matrixWorld);
            this.expandByPoint(_vector$b);
          }
        } else {
          if (object.boundingBox !== void 0) {
            if (object.boundingBox === null) {
              object.computeBoundingBox();
            }
            _box$4.copy(object.boundingBox);
          } else {
            if (geometry.boundingBox === null) {
              geometry.computeBoundingBox();
            }
            _box$4.copy(geometry.boundingBox);
          }
          _box$4.applyMatrix4(object.matrixWorld);
          this.union(_box$4);
        }
      }
      const children = object.children;
      for (let i = 0, l = children.length; i < l; i++) {
        this.expandByObject(children[i], precise);
      }
      return this;
    }
    containsPoint(point) {
      return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y && point.z >= this.min.z && point.z <= this.max.z;
    }
    containsBox(box) {
      return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
    }
    getParameter(point, target) {
      return target.set(
        (point.x - this.min.x) / (this.max.x - this.min.x),
        (point.y - this.min.y) / (this.max.y - this.min.y),
        (point.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    intersectsBox(box) {
      return box.max.x >= this.min.x && box.min.x <= this.max.x && box.max.y >= this.min.y && box.min.y <= this.max.y && box.max.z >= this.min.z && box.min.z <= this.max.z;
    }
    intersectsSphere(sphere) {
      this.clampPoint(sphere.center, _vector$b);
      return _vector$b.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
    }
    intersectsPlane(plane) {
      let min, max;
      if (plane.normal.x > 0) {
        min = plane.normal.x * this.min.x;
        max = plane.normal.x * this.max.x;
      } else {
        min = plane.normal.x * this.max.x;
        max = plane.normal.x * this.min.x;
      }
      if (plane.normal.y > 0) {
        min += plane.normal.y * this.min.y;
        max += plane.normal.y * this.max.y;
      } else {
        min += plane.normal.y * this.max.y;
        max += plane.normal.y * this.min.y;
      }
      if (plane.normal.z > 0) {
        min += plane.normal.z * this.min.z;
        max += plane.normal.z * this.max.z;
      } else {
        min += plane.normal.z * this.max.z;
        max += plane.normal.z * this.min.z;
      }
      return min <= -plane.constant && max >= -plane.constant;
    }
    intersectsTriangle(triangle) {
      if (this.isEmpty()) {
        return false;
      }
      this.getCenter(_center$2);
      _extents.subVectors(this.max, _center$2);
      _v0$3.subVectors(triangle.a, _center$2);
      _v1$7.subVectors(triangle.b, _center$2);
      _v2$4.subVectors(triangle.c, _center$2);
      _f0.subVectors(_v1$7, _v0$3);
      _f1.subVectors(_v2$4, _v1$7);
      _f2.subVectors(_v0$3, _v2$4);
      let axes = [
        0,
        -_f0.z,
        _f0.y,
        0,
        -_f1.z,
        _f1.y,
        0,
        -_f2.z,
        _f2.y,
        _f0.z,
        0,
        -_f0.x,
        _f1.z,
        0,
        -_f1.x,
        _f2.z,
        0,
        -_f2.x,
        -_f0.y,
        _f0.x,
        0,
        -_f1.y,
        _f1.x,
        0,
        -_f2.y,
        _f2.x,
        0
      ];
      if (!satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents)) {
        return false;
      }
      axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      if (!satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents)) {
        return false;
      }
      _triangleNormal.crossVectors(_f0, _f1);
      axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
      return satForAxes(axes, _v0$3, _v1$7, _v2$4, _extents);
    }
    clampPoint(point, target) {
      return target.copy(point).clamp(this.min, this.max);
    }
    distanceToPoint(point) {
      return this.clampPoint(point, _vector$b).distanceTo(point);
    }
    getBoundingSphere(target) {
      if (this.isEmpty()) {
        target.makeEmpty();
      } else {
        this.getCenter(target.center);
        target.radius = this.getSize(_vector$b).length() * 0.5;
      }
      return target;
    }
    intersect(box) {
      this.min.max(box.min);
      this.max.min(box.max);
      if (this.isEmpty()) this.makeEmpty();
      return this;
    }
    union(box) {
      this.min.min(box.min);
      this.max.max(box.max);
      return this;
    }
    applyMatrix4(matrix) {
      if (this.isEmpty()) return this;
      _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
      _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
      _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
      _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
      _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
      _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
      _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
      _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
      this.setFromPoints(_points);
      return this;
    }
    translate(offset) {
      this.min.add(offset);
      this.max.add(offset);
      return this;
    }
    equals(box) {
      return box.min.equals(this.min) && box.max.equals(this.max);
    }
  }
  const _points = [
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3(),
    /* @__PURE__ */ new Vector3()
  ];
  const _vector$b = /* @__PURE__ */ new Vector3();
  const _box$4 = /* @__PURE__ */ new Box3();
  const _v0$3 = /* @__PURE__ */ new Vector3();
  const _v1$7 = /* @__PURE__ */ new Vector3();
  const _v2$4 = /* @__PURE__ */ new Vector3();
  const _f0 = /* @__PURE__ */ new Vector3();
  const _f1 = /* @__PURE__ */ new Vector3();
  const _f2 = /* @__PURE__ */ new Vector3();
  const _center$2 = /* @__PURE__ */ new Vector3();
  const _extents = /* @__PURE__ */ new Vector3();
  const _triangleNormal = /* @__PURE__ */ new Vector3();
  const _testAxis = /* @__PURE__ */ new Vector3();
  function satForAxes(axes, v0, v1, v2, extents) {
    for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
      _testAxis.fromArray(axes, i);
      const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
      const p0 = v0.dot(_testAxis);
      const p1 = v1.dot(_testAxis);
      const p2 = v2.dot(_testAxis);
      if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
        return false;
      }
    }
    return true;
  }
  const _box$3 = /* @__PURE__ */ new Box3();
  const _v1$6 = /* @__PURE__ */ new Vector3();
  const _v2$3 = /* @__PURE__ */ new Vector3();
  class Sphere {
    constructor(center = new Vector3(), radius = -1) {
      this.isSphere = true;
      this.center = center;
      this.radius = radius;
    }
    set(center, radius) {
      this.center.copy(center);
      this.radius = radius;
      return this;
    }
    setFromPoints(points, optionalCenter) {
      const center = this.center;
      if (optionalCenter !== void 0) {
        center.copy(optionalCenter);
      } else {
        _box$3.setFromPoints(points).getCenter(center);
      }
      let maxRadiusSq = 0;
      for (let i = 0, il = points.length; i < il; i++) {
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
      }
      this.radius = Math.sqrt(maxRadiusSq);
      return this;
    }
    copy(sphere) {
      this.center.copy(sphere.center);
      this.radius = sphere.radius;
      return this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      this.center.set(0, 0, 0);
      this.radius = -1;
      return this;
    }
    containsPoint(point) {
      return point.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(point) {
      return point.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(sphere) {
      const radiusSum = this.radius + sphere.radius;
      return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
    }
    intersectsBox(box) {
      return box.intersectsSphere(this);
    }
    intersectsPlane(plane) {
      return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(point, target) {
      const deltaLengthSq = this.center.distanceToSquared(point);
      target.copy(point);
      if (deltaLengthSq > this.radius * this.radius) {
        target.sub(this.center).normalize();
        target.multiplyScalar(this.radius).add(this.center);
      }
      return target;
    }
    getBoundingBox(target) {
      if (this.isEmpty()) {
        target.makeEmpty();
        return target;
      }
      target.set(this.center, this.center);
      target.expandByScalar(this.radius);
      return target;
    }
    applyMatrix4(matrix) {
      this.center.applyMatrix4(matrix);
      this.radius = this.radius * matrix.getMaxScaleOnAxis();
      return this;
    }
    translate(offset) {
      this.center.add(offset);
      return this;
    }
    expandByPoint(point) {
      if (this.isEmpty()) {
        this.center.copy(point);
        this.radius = 0;
        return this;
      }
      _v1$6.subVectors(point, this.center);
      const lengthSq = _v1$6.lengthSq();
      if (lengthSq > this.radius * this.radius) {
        const length = Math.sqrt(lengthSq);
        const delta = (length - this.radius) * 0.5;
        this.center.addScaledVector(_v1$6, delta / length);
        this.radius += delta;
      }
      return this;
    }
    union(sphere) {
      if (sphere.isEmpty()) {
        return this;
      }
      if (this.isEmpty()) {
        this.copy(sphere);
        return this;
      }
      if (this.center.equals(sphere.center) === true) {
        this.radius = Math.max(this.radius, sphere.radius);
      } else {
        _v2$3.subVectors(sphere.center, this.center).setLength(sphere.radius);
        this.expandByPoint(_v1$6.copy(sphere.center).add(_v2$3));
        this.expandByPoint(_v1$6.copy(sphere.center).sub(_v2$3));
      }
      return this;
    }
    equals(sphere) {
      return sphere.center.equals(this.center) && sphere.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const _vector$a = /* @__PURE__ */ new Vector3();
  const _segCenter = /* @__PURE__ */ new Vector3();
  const _segDir = /* @__PURE__ */ new Vector3();
  const _diff = /* @__PURE__ */ new Vector3();
  const _edge1 = /* @__PURE__ */ new Vector3();
  const _edge2 = /* @__PURE__ */ new Vector3();
  const _normal$1 = /* @__PURE__ */ new Vector3();
  class Ray {
    constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
      this.origin = origin;
      this.direction = direction;
    }
    set(origin, direction) {
      this.origin.copy(origin);
      this.direction.copy(direction);
      return this;
    }
    copy(ray) {
      this.origin.copy(ray.origin);
      this.direction.copy(ray.direction);
      return this;
    }
    at(t, target) {
      return target.copy(this.origin).addScaledVector(this.direction, t);
    }
    lookAt(v) {
      this.direction.copy(v).sub(this.origin).normalize();
      return this;
    }
    recast(t) {
      this.origin.copy(this.at(t, _vector$a));
      return this;
    }
    closestPointToPoint(point, target) {
      target.subVectors(point, this.origin);
      const directionDistance = target.dot(this.direction);
      if (directionDistance < 0) {
        return target.copy(this.origin);
      }
      return target.copy(this.origin).addScaledVector(this.direction, directionDistance);
    }
    distanceToPoint(point) {
      return Math.sqrt(this.distanceSqToPoint(point));
    }
    distanceSqToPoint(point) {
      const directionDistance = _vector$a.subVectors(point, this.origin).dot(this.direction);
      if (directionDistance < 0) {
        return this.origin.distanceToSquared(point);
      }
      _vector$a.copy(this.origin).addScaledVector(this.direction, directionDistance);
      return _vector$a.distanceToSquared(point);
    }
    distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
      _segCenter.copy(v0).add(v1).multiplyScalar(0.5);
      _segDir.copy(v1).sub(v0).normalize();
      _diff.copy(this.origin).sub(_segCenter);
      const segExtent = v0.distanceTo(v1) * 0.5;
      const a01 = -this.direction.dot(_segDir);
      const b0 = _diff.dot(this.direction);
      const b1 = -_diff.dot(_segDir);
      const c = _diff.lengthSq();
      const det = Math.abs(1 - a01 * a01);
      let s0, s1, sqrDist, extDet;
      if (det > 0) {
        s0 = a01 * b1 - b0;
        s1 = a01 * b0 - b1;
        extDet = segExtent * det;
        if (s0 >= 0) {
          if (s1 >= -extDet) {
            if (s1 <= extDet) {
              const invDet = 1 / det;
              s0 *= invDet;
              s1 *= invDet;
              sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
            } else {
              s1 = segExtent;
              s0 = Math.max(0, -(a01 * s1 + b0));
              sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
            }
          } else {
            s1 = -segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          if (s1 <= -extDet) {
            s0 = Math.max(0, -(-a01 * segExtent + b0));
            s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          } else if (s1 <= extDet) {
            s0 = 0;
            s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = s1 * (s1 + 2 * b1) + c;
          } else {
            s0 = Math.max(0, -(a01 * segExtent + b0));
            s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        }
      } else {
        s1 = a01 > 0 ? -segExtent : segExtent;
        s0 = Math.max(0, -(a01 * s1 + b0));
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }
      if (optionalPointOnRay) {
        optionalPointOnRay.copy(this.origin).addScaledVector(this.direction, s0);
      }
      if (optionalPointOnSegment) {
        optionalPointOnSegment.copy(_segCenter).addScaledVector(_segDir, s1);
      }
      return sqrDist;
    }
    intersectSphere(sphere, target) {
      _vector$a.subVectors(sphere.center, this.origin);
      const tca = _vector$a.dot(this.direction);
      const d2 = _vector$a.dot(_vector$a) - tca * tca;
      const radius2 = sphere.radius * sphere.radius;
      if (d2 > radius2) return null;
      const thc = Math.sqrt(radius2 - d2);
      const t0 = tca - thc;
      const t1 = tca + thc;
      if (t1 < 0) return null;
      if (t0 < 0) return this.at(t1, target);
      return this.at(t0, target);
    }
    intersectsSphere(sphere) {
      return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
    }
    distanceToPlane(plane) {
      const denominator = plane.normal.dot(this.direction);
      if (denominator === 0) {
        if (plane.distanceToPoint(this.origin) === 0) {
          return 0;
        }
        return null;
      }
      const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
      return t >= 0 ? t : null;
    }
    intersectPlane(plane, target) {
      const t = this.distanceToPlane(plane);
      if (t === null) {
        return null;
      }
      return this.at(t, target);
    }
    intersectsPlane(plane) {
      const distToPoint = plane.distanceToPoint(this.origin);
      if (distToPoint === 0) {
        return true;
      }
      const denominator = plane.normal.dot(this.direction);
      if (denominator * distToPoint < 0) {
        return true;
      }
      return false;
    }
    intersectBox(box, target) {
      let tmin, tmax, tymin, tymax, tzmin, tzmax;
      const invdirx = 1 / this.direction.x, invdiry = 1 / this.direction.y, invdirz = 1 / this.direction.z;
      const origin = this.origin;
      if (invdirx >= 0) {
        tmin = (box.min.x - origin.x) * invdirx;
        tmax = (box.max.x - origin.x) * invdirx;
      } else {
        tmin = (box.max.x - origin.x) * invdirx;
        tmax = (box.min.x - origin.x) * invdirx;
      }
      if (invdiry >= 0) {
        tymin = (box.min.y - origin.y) * invdiry;
        tymax = (box.max.y - origin.y) * invdiry;
      } else {
        tymin = (box.max.y - origin.y) * invdiry;
        tymax = (box.min.y - origin.y) * invdiry;
      }
      if (tmin > tymax || tymin > tmax) return null;
      if (tymin > tmin || isNaN(tmin)) tmin = tymin;
      if (tymax < tmax || isNaN(tmax)) tmax = tymax;
      if (invdirz >= 0) {
        tzmin = (box.min.z - origin.z) * invdirz;
        tzmax = (box.max.z - origin.z) * invdirz;
      } else {
        tzmin = (box.max.z - origin.z) * invdirz;
        tzmax = (box.min.z - origin.z) * invdirz;
      }
      if (tmin > tzmax || tzmin > tmax) return null;
      if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
      if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
      if (tmax < 0) return null;
      return this.at(tmin >= 0 ? tmin : tmax, target);
    }
    intersectsBox(box) {
      return this.intersectBox(box, _vector$a) !== null;
    }
    intersectTriangle(a, b, c, backfaceCulling, target) {
      _edge1.subVectors(b, a);
      _edge2.subVectors(c, a);
      _normal$1.crossVectors(_edge1, _edge2);
      let DdN = this.direction.dot(_normal$1);
      let sign;
      if (DdN > 0) {
        if (backfaceCulling) return null;
        sign = 1;
      } else if (DdN < 0) {
        sign = -1;
        DdN = -DdN;
      } else {
        return null;
      }
      _diff.subVectors(this.origin, a);
      const DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));
      if (DdQxE2 < 0) {
        return null;
      }
      const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));
      if (DdE1xQ < 0) {
        return null;
      }
      if (DdQxE2 + DdE1xQ > DdN) {
        return null;
      }
      const QdN = -sign * _diff.dot(_normal$1);
      if (QdN < 0) {
        return null;
      }
      return this.at(QdN / DdN, target);
    }
    applyMatrix4(matrix4) {
      this.origin.applyMatrix4(matrix4);
      this.direction.transformDirection(matrix4);
      return this;
    }
    equals(ray) {
      return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class Matrix4 {
    constructor(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      Matrix4.prototype.isMatrix4 = true;
      this.elements = [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ];
      if (n11 !== void 0) {
        this.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
      }
    }
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      const te = this.elements;
      te[0] = n11;
      te[4] = n12;
      te[8] = n13;
      te[12] = n14;
      te[1] = n21;
      te[5] = n22;
      te[9] = n23;
      te[13] = n24;
      te[2] = n31;
      te[6] = n32;
      te[10] = n33;
      te[14] = n34;
      te[3] = n41;
      te[7] = n42;
      te[11] = n43;
      te[15] = n44;
      return this;
    }
    identity() {
      this.set(
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    clone() {
      return new Matrix4().fromArray(this.elements);
    }
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];
      te[9] = me[9];
      te[10] = me[10];
      te[11] = me[11];
      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];
      te[15] = me[15];
      return this;
    }
    copyPosition(m) {
      const te = this.elements, me = m.elements;
      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];
      return this;
    }
    setFromMatrix3(m) {
      const me = m.elements;
      this.set(
        me[0],
        me[3],
        me[6],
        0,
        me[1],
        me[4],
        me[7],
        0,
        me[2],
        me[5],
        me[8],
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    extractBasis(xAxis, yAxis, zAxis) {
      xAxis.setFromMatrixColumn(this, 0);
      yAxis.setFromMatrixColumn(this, 1);
      zAxis.setFromMatrixColumn(this, 2);
      return this;
    }
    makeBasis(xAxis, yAxis, zAxis) {
      this.set(
        xAxis.x,
        yAxis.x,
        zAxis.x,
        0,
        xAxis.y,
        yAxis.y,
        zAxis.y,
        0,
        xAxis.z,
        yAxis.z,
        zAxis.z,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    extractRotation(m) {
      const te = this.elements;
      const me = m.elements;
      const scaleX = 1 / _v1$5.setFromMatrixColumn(m, 0).length();
      const scaleY = 1 / _v1$5.setFromMatrixColumn(m, 1).length();
      const scaleZ = 1 / _v1$5.setFromMatrixColumn(m, 2).length();
      te[0] = me[0] * scaleX;
      te[1] = me[1] * scaleX;
      te[2] = me[2] * scaleX;
      te[3] = 0;
      te[4] = me[4] * scaleY;
      te[5] = me[5] * scaleY;
      te[6] = me[6] * scaleY;
      te[7] = 0;
      te[8] = me[8] * scaleZ;
      te[9] = me[9] * scaleZ;
      te[10] = me[10] * scaleZ;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    }
    makeRotationFromEuler(euler) {
      const te = this.elements;
      const x = euler.x, y = euler.y, z = euler.z;
      const a = Math.cos(x), b = Math.sin(x);
      const c = Math.cos(y), d = Math.sin(y);
      const e = Math.cos(z), f2 = Math.sin(z);
      if (euler.order === "XYZ") {
        const ae = a * e, af = a * f2, be = b * e, bf = b * f2;
        te[0] = c * e;
        te[4] = -c * f2;
        te[8] = d;
        te[1] = af + be * d;
        te[5] = ae - bf * d;
        te[9] = -b * c;
        te[2] = bf - ae * d;
        te[6] = be + af * d;
        te[10] = a * c;
      } else if (euler.order === "YXZ") {
        const ce = c * e, cf = c * f2, de = d * e, df = d * f2;
        te[0] = ce + df * b;
        te[4] = de * b - cf;
        te[8] = a * d;
        te[1] = a * f2;
        te[5] = a * e;
        te[9] = -b;
        te[2] = cf * b - de;
        te[6] = df + ce * b;
        te[10] = a * c;
      } else if (euler.order === "ZXY") {
        const ce = c * e, cf = c * f2, de = d * e, df = d * f2;
        te[0] = ce - df * b;
        te[4] = -a * f2;
        te[8] = de + cf * b;
        te[1] = cf + de * b;
        te[5] = a * e;
        te[9] = df - ce * b;
        te[2] = -a * d;
        te[6] = b;
        te[10] = a * c;
      } else if (euler.order === "ZYX") {
        const ae = a * e, af = a * f2, be = b * e, bf = b * f2;
        te[0] = c * e;
        te[4] = be * d - af;
        te[8] = ae * d + bf;
        te[1] = c * f2;
        te[5] = bf * d + ae;
        te[9] = af * d - be;
        te[2] = -d;
        te[6] = b * c;
        te[10] = a * c;
      } else if (euler.order === "YZX") {
        const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e;
        te[4] = bd - ac * f2;
        te[8] = bc * f2 + ad;
        te[1] = f2;
        te[5] = a * e;
        te[9] = -b * e;
        te[2] = -d * e;
        te[6] = ad * f2 + bc;
        te[10] = ac - bd * f2;
      } else if (euler.order === "XZY") {
        const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
        te[0] = c * e;
        te[4] = -f2;
        te[8] = d * e;
        te[1] = ac * f2 + bd;
        te[5] = a * e;
        te[9] = ad * f2 - bc;
        te[2] = bc * f2 - ad;
        te[6] = b * e;
        te[10] = bd * f2 + ac;
      }
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return this;
    }
    makeRotationFromQuaternion(q) {
      return this.compose(_zero, q, _one);
    }
    lookAt(eye, target, up) {
      const te = this.elements;
      _z.subVectors(eye, target);
      if (_z.lengthSq() === 0) {
        _z.z = 1;
      }
      _z.normalize();
      _x.crossVectors(up, _z);
      if (_x.lengthSq() === 0) {
        if (Math.abs(up.z) === 1) {
          _z.x += 1e-4;
        } else {
          _z.z += 1e-4;
        }
        _z.normalize();
        _x.crossVectors(up, _z);
      }
      _x.normalize();
      _y.crossVectors(_z, _x);
      te[0] = _x.x;
      te[4] = _y.x;
      te[8] = _z.x;
      te[1] = _x.y;
      te[5] = _y.y;
      te[9] = _z.y;
      te[2] = _x.z;
      te[6] = _y.z;
      te[10] = _z.z;
      return this;
    }
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
      const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
      const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
      const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
      const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
      const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
      const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
      const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
      return this;
    }
    multiplyScalar(s) {
      const te = this.elements;
      te[0] *= s;
      te[4] *= s;
      te[8] *= s;
      te[12] *= s;
      te[1] *= s;
      te[5] *= s;
      te[9] *= s;
      te[13] *= s;
      te[2] *= s;
      te[6] *= s;
      te[10] *= s;
      te[14] *= s;
      te[3] *= s;
      te[7] *= s;
      te[11] *= s;
      te[15] *= s;
      return this;
    }
    determinant() {
      const te = this.elements;
      const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
      const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
      const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
      const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
      return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
    }
    transpose() {
      const te = this.elements;
      let tmp;
      tmp = te[1];
      te[1] = te[4];
      te[4] = tmp;
      tmp = te[2];
      te[2] = te[8];
      te[8] = tmp;
      tmp = te[6];
      te[6] = te[9];
      te[9] = tmp;
      tmp = te[3];
      te[3] = te[12];
      te[12] = tmp;
      tmp = te[7];
      te[7] = te[13];
      te[13] = tmp;
      tmp = te[11];
      te[11] = te[14];
      te[14] = tmp;
      return this;
    }
    setPosition(x, y, z) {
      const te = this.elements;
      if (x.isVector3) {
        te[12] = x.x;
        te[13] = x.y;
        te[14] = x.z;
      } else {
        te[12] = x;
        te[13] = y;
        te[14] = z;
      }
      return this;
    }
    invert() {
      const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7], n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15], t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44, t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44, t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44, t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
      const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const detInv = 1 / det;
      te[0] = t11 * detInv;
      te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
      te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
      te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
      te[4] = t12 * detInv;
      te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
      te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
      te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
      te[8] = t13 * detInv;
      te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
      te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
      te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
      te[12] = t14 * detInv;
      te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
      te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
      te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
      return this;
    }
    scale(v) {
      const te = this.elements;
      const x = v.x, y = v.y, z = v.z;
      te[0] *= x;
      te[4] *= y;
      te[8] *= z;
      te[1] *= x;
      te[5] *= y;
      te[9] *= z;
      te[2] *= x;
      te[6] *= y;
      te[10] *= z;
      te[3] *= x;
      te[7] *= y;
      te[11] *= z;
      return this;
    }
    getMaxScaleOnAxis() {
      const te = this.elements;
      const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
      const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
      const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
      return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
    }
    makeTranslation(x, y, z) {
      if (x.isVector3) {
        this.set(
          1,
          0,
          0,
          x.x,
          0,
          1,
          0,
          x.y,
          0,
          0,
          1,
          x.z,
          0,
          0,
          0,
          1
        );
      } else {
        this.set(
          1,
          0,
          0,
          x,
          0,
          1,
          0,
          y,
          0,
          0,
          1,
          z,
          0,
          0,
          0,
          1
        );
      }
      return this;
    }
    makeRotationX(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        1,
        0,
        0,
        0,
        0,
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeRotationY(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        c,
        0,
        s,
        0,
        0,
        1,
        0,
        0,
        -s,
        0,
        c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeRotationZ(theta) {
      const c = Math.cos(theta), s = Math.sin(theta);
      this.set(
        c,
        -s,
        0,
        0,
        s,
        c,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeRotationAxis(axis, angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;
      const x = axis.x, y = axis.y, z = axis.z;
      const tx = t * x, ty = t * y;
      this.set(
        tx * x + c,
        tx * y - s * z,
        tx * z + s * y,
        0,
        tx * y + s * z,
        ty * y + c,
        ty * z - s * x,
        0,
        tx * z - s * y,
        ty * z + s * x,
        t * z * z + c,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeScale(x, y, z) {
      this.set(
        x,
        0,
        0,
        0,
        0,
        y,
        0,
        0,
        0,
        0,
        z,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    makeShear(xy, xz, yx, yz, zx, zy) {
      this.set(
        1,
        yx,
        zx,
        0,
        xy,
        1,
        zy,
        0,
        xz,
        yz,
        1,
        0,
        0,
        0,
        0,
        1
      );
      return this;
    }
    compose(position, quaternion, scale) {
      const te = this.elements;
      const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
      const x2 = x + x, y2 = y + y, z2 = z + z;
      const xx = x * x2, xy = x * y2, xz = x * z2;
      const yy = y * y2, yz = y * z2, zz = z * z2;
      const wx = w * x2, wy = w * y2, wz = w * z2;
      const sx = scale.x, sy = scale.y, sz = scale.z;
      te[0] = (1 - (yy + zz)) * sx;
      te[1] = (xy + wz) * sx;
      te[2] = (xz - wy) * sx;
      te[3] = 0;
      te[4] = (xy - wz) * sy;
      te[5] = (1 - (xx + zz)) * sy;
      te[6] = (yz + wx) * sy;
      te[7] = 0;
      te[8] = (xz + wy) * sz;
      te[9] = (yz - wx) * sz;
      te[10] = (1 - (xx + yy)) * sz;
      te[11] = 0;
      te[12] = position.x;
      te[13] = position.y;
      te[14] = position.z;
      te[15] = 1;
      return this;
    }
    decompose(position, quaternion, scale) {
      const te = this.elements;
      let sx = _v1$5.set(te[0], te[1], te[2]).length();
      const sy = _v1$5.set(te[4], te[5], te[6]).length();
      const sz = _v1$5.set(te[8], te[9], te[10]).length();
      const det = this.determinant();
      if (det < 0) sx = -sx;
      position.x = te[12];
      position.y = te[13];
      position.z = te[14];
      _m1$4.copy(this);
      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;
      _m1$4.elements[0] *= invSX;
      _m1$4.elements[1] *= invSX;
      _m1$4.elements[2] *= invSX;
      _m1$4.elements[4] *= invSY;
      _m1$4.elements[5] *= invSY;
      _m1$4.elements[6] *= invSY;
      _m1$4.elements[8] *= invSZ;
      _m1$4.elements[9] *= invSZ;
      _m1$4.elements[10] *= invSZ;
      quaternion.setFromRotationMatrix(_m1$4);
      scale.x = sx;
      scale.y = sy;
      scale.z = sz;
      return this;
    }
    makePerspective(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem) {
      const te = this.elements;
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      let c, d;
      if (coordinateSystem === WebGLCoordinateSystem) {
        c = -(far + near) / (far - near);
        d = -2 * far * near / (far - near);
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        c = -far / (far - near);
        d = -far * near / (far - near);
      } else {
        throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + coordinateSystem);
      }
      te[0] = x;
      te[4] = 0;
      te[8] = a;
      te[12] = 0;
      te[1] = 0;
      te[5] = y;
      te[9] = b;
      te[13] = 0;
      te[2] = 0;
      te[6] = 0;
      te[10] = c;
      te[14] = d;
      te[3] = 0;
      te[7] = 0;
      te[11] = -1;
      te[15] = 0;
      return this;
    }
    makeOrthographic(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem) {
      const te = this.elements;
      const w = 1 / (right - left);
      const h = 1 / (top - bottom);
      const p = 1 / (far - near);
      const x = (right + left) * w;
      const y = (top + bottom) * h;
      let z, zInv;
      if (coordinateSystem === WebGLCoordinateSystem) {
        z = (far + near) * p;
        zInv = -2 * p;
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        z = near * p;
        zInv = -1 * p;
      } else {
        throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + coordinateSystem);
      }
      te[0] = 2 * w;
      te[4] = 0;
      te[8] = 0;
      te[12] = -x;
      te[1] = 0;
      te[5] = 2 * h;
      te[9] = 0;
      te[13] = -y;
      te[2] = 0;
      te[6] = 0;
      te[10] = zInv;
      te[14] = -z;
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[15] = 1;
      return this;
    }
    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;
      for (let i = 0; i < 16; i++) {
        if (te[i] !== me[i]) return false;
      }
      return true;
    }
    fromArray(array, offset = 0) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = array[i + offset];
      }
      return this;
    }
    toArray(array = [], offset = 0) {
      const te = this.elements;
      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];
      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];
      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];
      array[offset + 9] = te[9];
      array[offset + 10] = te[10];
      array[offset + 11] = te[11];
      array[offset + 12] = te[12];
      array[offset + 13] = te[13];
      array[offset + 14] = te[14];
      array[offset + 15] = te[15];
      return array;
    }
  }
  const _v1$5 = /* @__PURE__ */ new Vector3();
  const _m1$4 = /* @__PURE__ */ new Matrix4();
  const _zero = /* @__PURE__ */ new Vector3(0, 0, 0);
  const _one = /* @__PURE__ */ new Vector3(1, 1, 1);
  const _x = /* @__PURE__ */ new Vector3();
  const _y = /* @__PURE__ */ new Vector3();
  const _z = /* @__PURE__ */ new Vector3();
  const _matrix$2 = /* @__PURE__ */ new Matrix4();
  const _quaternion$3 = /* @__PURE__ */ new Quaternion();
  class Euler {
    constructor(x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER) {
      this.isEuler = true;
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
    }
    get x() {
      return this._x;
    }
    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(value) {
      this._order = value;
      this._onChangeCallback();
    }
    set(x, y, z, order = this._order) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
      this._onChangeCallback();
      return this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(euler) {
      this._x = euler._x;
      this._y = euler._y;
      this._z = euler._z;
      this._order = euler._order;
      this._onChangeCallback();
      return this;
    }
    setFromRotationMatrix(m, order = this._order, update = true) {
      const te = m.elements;
      const m11 = te[0], m12 = te[4], m13 = te[8];
      const m21 = te[1], m22 = te[5], m23 = te[9];
      const m31 = te[2], m32 = te[6], m33 = te[10];
      switch (order) {
        case "XYZ":
          this._y = Math.asin(clamp(m13, -1, 1));
          if (Math.abs(m13) < 0.9999999) {
            this._x = Math.atan2(-m23, m33);
            this._z = Math.atan2(-m12, m11);
          } else {
            this._x = Math.atan2(m32, m22);
            this._z = 0;
          }
          break;
        case "YXZ":
          this._x = Math.asin(-clamp(m23, -1, 1));
          if (Math.abs(m23) < 0.9999999) {
            this._y = Math.atan2(m13, m33);
            this._z = Math.atan2(m21, m22);
          } else {
            this._y = Math.atan2(-m31, m11);
            this._z = 0;
          }
          break;
        case "ZXY":
          this._x = Math.asin(clamp(m32, -1, 1));
          if (Math.abs(m32) < 0.9999999) {
            this._y = Math.atan2(-m31, m33);
            this._z = Math.atan2(-m12, m22);
          } else {
            this._y = 0;
            this._z = Math.atan2(m21, m11);
          }
          break;
        case "ZYX":
          this._y = Math.asin(-clamp(m31, -1, 1));
          if (Math.abs(m31) < 0.9999999) {
            this._x = Math.atan2(m32, m33);
            this._z = Math.atan2(m21, m11);
          } else {
            this._x = 0;
            this._z = Math.atan2(-m12, m22);
          }
          break;
        case "YZX":
          this._z = Math.asin(clamp(m21, -1, 1));
          if (Math.abs(m21) < 0.9999999) {
            this._x = Math.atan2(-m23, m22);
            this._y = Math.atan2(-m31, m11);
          } else {
            this._x = 0;
            this._y = Math.atan2(m13, m33);
          }
          break;
        case "XZY":
          this._z = Math.asin(-clamp(m12, -1, 1));
          if (Math.abs(m12) < 0.9999999) {
            this._x = Math.atan2(m32, m22);
            this._y = Math.atan2(m13, m11);
          } else {
            this._x = Math.atan2(-m23, m33);
            this._y = 0;
          }
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + order);
      }
      this._order = order;
      if (update === true) this._onChangeCallback();
      return this;
    }
    setFromQuaternion(q, order, update) {
      _matrix$2.makeRotationFromQuaternion(q);
      return this.setFromRotationMatrix(_matrix$2, order, update);
    }
    setFromVector3(v, order = this._order) {
      return this.set(v.x, v.y, v.z, order);
    }
    reorder(newOrder) {
      _quaternion$3.setFromEuler(this);
      return this.setFromQuaternion(_quaternion$3, newOrder);
    }
    equals(euler) {
      return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
    }
    fromArray(array) {
      this._x = array[0];
      this._y = array[1];
      this._z = array[2];
      if (array[3] !== void 0) this._order = array[3];
      this._onChangeCallback();
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._order;
      return array;
    }
    _onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._order;
    }
  }
  Euler.DEFAULT_ORDER = "XYZ";
  class Layers {
    constructor() {
      this.mask = 1 | 0;
    }
    set(channel) {
      this.mask = (1 << channel | 0) >>> 0;
    }
    enable(channel) {
      this.mask |= 1 << channel | 0;
    }
    enableAll() {
      this.mask = 4294967295 | 0;
    }
    toggle(channel) {
      this.mask ^= 1 << channel | 0;
    }
    disable(channel) {
      this.mask &= ~(1 << channel | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(layers) {
      return (this.mask & layers.mask) !== 0;
    }
    isEnabled(channel) {
      return (this.mask & (1 << channel | 0)) !== 0;
    }
  }
  let _object3DId = 0;
  const _v1$4 = /* @__PURE__ */ new Vector3();
  const _q1 = /* @__PURE__ */ new Quaternion();
  const _m1$3 = /* @__PURE__ */ new Matrix4();
  const _target = /* @__PURE__ */ new Vector3();
  const _position$3 = /* @__PURE__ */ new Vector3();
  const _scale$2 = /* @__PURE__ */ new Vector3();
  const _quaternion$2 = /* @__PURE__ */ new Quaternion();
  const _xAxis = /* @__PURE__ */ new Vector3(1, 0, 0);
  const _yAxis = /* @__PURE__ */ new Vector3(0, 1, 0);
  const _zAxis = /* @__PURE__ */ new Vector3(0, 0, 1);
  const _addedEvent = { type: "added" };
  const _removedEvent = { type: "removed" };
  const _childaddedEvent = { type: "childadded", child: null };
  const _childremovedEvent = { type: "childremoved", child: null };
  class Object3D extends EventDispatcher {
    constructor() {
      super();
      this.isObject3D = true;
      Object.defineProperty(this, "id", { value: _object3DId++ });
      this.uuid = generateUUID();
      this.name = "";
      this.type = "Object3D";
      this.parent = null;
      this.children = [];
      this.up = Object3D.DEFAULT_UP.clone();
      const position = new Vector3();
      const rotation = new Euler();
      const quaternion = new Quaternion();
      const scale = new Vector3(1, 1, 1);
      function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
      }
      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, void 0, false);
      }
      rotation._onChange(onRotationChange);
      quaternion._onChange(onQuaternionChange);
      Object.defineProperties(this, {
        position: {
          configurable: true,
          enumerable: true,
          value: position
        },
        rotation: {
          configurable: true,
          enumerable: true,
          value: rotation
        },
        quaternion: {
          configurable: true,
          enumerable: true,
          value: quaternion
        },
        scale: {
          configurable: true,
          enumerable: true,
          value: scale
        },
        modelViewMatrix: {
          value: new Matrix4()
        },
        normalMatrix: {
          value: new Matrix3()
        }
      });
      this.matrix = new Matrix4();
      this.matrixWorld = new Matrix4();
      this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
      this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE;
      this.matrixWorldNeedsUpdate = false;
      this.layers = new Layers();
      this.visible = true;
      this.castShadow = false;
      this.receiveShadow = false;
      this.frustumCulled = true;
      this.renderOrder = 0;
      this.animations = [];
      this.userData = {};
    }
    onBeforeShadow() {
    }
    onAfterShadow() {
    }
    onBeforeRender() {
    }
    onAfterRender() {
    }
    applyMatrix4(matrix) {
      if (this.matrixAutoUpdate) this.updateMatrix();
      this.matrix.premultiply(matrix);
      this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(q) {
      this.quaternion.premultiply(q);
      return this;
    }
    setRotationFromAxisAngle(axis, angle) {
      this.quaternion.setFromAxisAngle(axis, angle);
    }
    setRotationFromEuler(euler) {
      this.quaternion.setFromEuler(euler, true);
    }
    setRotationFromMatrix(m) {
      this.quaternion.setFromRotationMatrix(m);
    }
    setRotationFromQuaternion(q) {
      this.quaternion.copy(q);
    }
    rotateOnAxis(axis, angle) {
      _q1.setFromAxisAngle(axis, angle);
      this.quaternion.multiply(_q1);
      return this;
    }
    rotateOnWorldAxis(axis, angle) {
      _q1.setFromAxisAngle(axis, angle);
      this.quaternion.premultiply(_q1);
      return this;
    }
    rotateX(angle) {
      return this.rotateOnAxis(_xAxis, angle);
    }
    rotateY(angle) {
      return this.rotateOnAxis(_yAxis, angle);
    }
    rotateZ(angle) {
      return this.rotateOnAxis(_zAxis, angle);
    }
    translateOnAxis(axis, distance) {
      _v1$4.copy(axis).applyQuaternion(this.quaternion);
      this.position.add(_v1$4.multiplyScalar(distance));
      return this;
    }
    translateX(distance) {
      return this.translateOnAxis(_xAxis, distance);
    }
    translateY(distance) {
      return this.translateOnAxis(_yAxis, distance);
    }
    translateZ(distance) {
      return this.translateOnAxis(_zAxis, distance);
    }
    localToWorld(vector) {
      this.updateWorldMatrix(true, false);
      return vector.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(vector) {
      this.updateWorldMatrix(true, false);
      return vector.applyMatrix4(_m1$3.copy(this.matrixWorld).invert());
    }
    lookAt(x, y, z) {
      if (x.isVector3) {
        _target.copy(x);
      } else {
        _target.set(x, y, z);
      }
      const parent = this.parent;
      this.updateWorldMatrix(true, false);
      _position$3.setFromMatrixPosition(this.matrixWorld);
      if (this.isCamera || this.isLight) {
        _m1$3.lookAt(_position$3, _target, this.up);
      } else {
        _m1$3.lookAt(_target, _position$3, this.up);
      }
      this.quaternion.setFromRotationMatrix(_m1$3);
      if (parent) {
        _m1$3.extractRotation(parent.matrixWorld);
        _q1.setFromRotationMatrix(_m1$3);
        this.quaternion.premultiply(_q1.invert());
      }
    }
    add(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      if (object === this) {
        console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
        return this;
      }
      if (object && object.isObject3D) {
        object.removeFromParent();
        object.parent = this;
        this.children.push(object);
        object.dispatchEvent(_addedEvent);
        _childaddedEvent.child = object;
        this.dispatchEvent(_childaddedEvent);
        _childaddedEvent.child = null;
      } else {
        console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
      }
      return this;
    }
    remove(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.remove(arguments[i]);
        }
        return this;
      }
      const index = this.children.indexOf(object);
      if (index !== -1) {
        object.parent = null;
        this.children.splice(index, 1);
        object.dispatchEvent(_removedEvent);
        _childremovedEvent.child = object;
        this.dispatchEvent(_childremovedEvent);
        _childremovedEvent.child = null;
      }
      return this;
    }
    removeFromParent() {
      const parent = this.parent;
      if (parent !== null) {
        parent.remove(this);
      }
      return this;
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(object) {
      this.updateWorldMatrix(true, false);
      _m1$3.copy(this.matrixWorld).invert();
      if (object.parent !== null) {
        object.parent.updateWorldMatrix(true, false);
        _m1$3.multiply(object.parent.matrixWorld);
      }
      object.applyMatrix4(_m1$3);
      object.removeFromParent();
      object.parent = this;
      this.children.push(object);
      object.updateWorldMatrix(false, true);
      object.dispatchEvent(_addedEvent);
      _childaddedEvent.child = object;
      this.dispatchEvent(_childaddedEvent);
      _childaddedEvent.child = null;
      return this;
    }
    getObjectById(id) {
      return this.getObjectByProperty("id", id);
    }
    getObjectByName(name) {
      return this.getObjectByProperty("name", name);
    }
    getObjectByProperty(name, value) {
      if (this[name] === value) return this;
      for (let i = 0, l = this.children.length; i < l; i++) {
        const child = this.children[i];
        const object = child.getObjectByProperty(name, value);
        if (object !== void 0) {
          return object;
        }
      }
      return void 0;
    }
    getObjectsByProperty(name, value, result = []) {
      if (this[name] === value) result.push(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].getObjectsByProperty(name, value, result);
      }
      return result;
    }
    getWorldPosition(target) {
      this.updateWorldMatrix(true, false);
      return target.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(target) {
      this.updateWorldMatrix(true, false);
      this.matrixWorld.decompose(_position$3, target, _scale$2);
      return target;
    }
    getWorldScale(target) {
      this.updateWorldMatrix(true, false);
      this.matrixWorld.decompose(_position$3, _quaternion$2, target);
      return target;
    }
    getWorldDirection(target) {
      this.updateWorldMatrix(true, false);
      const e = this.matrixWorld.elements;
      return target.set(e[8], e[9], e[10]).normalize();
    }
    raycast() {
    }
    traverse(callback) {
      callback(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverse(callback);
      }
    }
    traverseVisible(callback) {
      if (this.visible === false) return;
      callback(this);
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverseVisible(callback);
      }
    }
    traverseAncestors(callback) {
      const parent = this.parent;
      if (parent !== null) {
        callback(parent);
        parent.traverseAncestors(callback);
      }
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale);
      this.matrixWorldNeedsUpdate = true;
    }
    updateMatrixWorld(force) {
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldNeedsUpdate || force) {
        if (this.matrixWorldAutoUpdate === true) {
          if (this.parent === null) {
            this.matrixWorld.copy(this.matrix);
          } else {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
          }
        }
        this.matrixWorldNeedsUpdate = false;
        force = true;
      }
      const children = this.children;
      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];
        child.updateMatrixWorld(force);
      }
    }
    updateWorldMatrix(updateParents, updateChildren) {
      const parent = this.parent;
      if (updateParents === true && parent !== null) {
        parent.updateWorldMatrix(true, false);
      }
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldAutoUpdate === true) {
        if (this.parent === null) {
          this.matrixWorld.copy(this.matrix);
        } else {
          this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        }
      }
      if (updateChildren === true) {
        const children = this.children;
        for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];
          child.updateWorldMatrix(false, true);
        }
      }
    }
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      const output = {};
      if (isRootObject) {
        meta = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {}
        };
        output.metadata = {
          version: 4.6,
          type: "Object",
          generator: "Object3D.toJSON"
        };
      }
      const object = {};
      object.uuid = this.uuid;
      object.type = this.type;
      if (this.name !== "") object.name = this.name;
      if (this.castShadow === true) object.castShadow = true;
      if (this.receiveShadow === true) object.receiveShadow = true;
      if (this.visible === false) object.visible = false;
      if (this.frustumCulled === false) object.frustumCulled = false;
      if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
      if (Object.keys(this.userData).length > 0) object.userData = this.userData;
      object.layers = this.layers.mask;
      object.matrix = this.matrix.toArray();
      object.up = this.up.toArray();
      if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;
      if (this.isInstancedMesh) {
        object.type = "InstancedMesh";
        object.count = this.count;
        object.instanceMatrix = this.instanceMatrix.toJSON();
        if (this.instanceColor !== null) object.instanceColor = this.instanceColor.toJSON();
      }
      if (this.isBatchedMesh) {
        object.type = "BatchedMesh";
        object.perObjectFrustumCulled = this.perObjectFrustumCulled;
        object.sortObjects = this.sortObjects;
        object.drawRanges = this._drawRanges;
        object.reservedRanges = this._reservedRanges;
        object.visibility = this._visibility;
        object.active = this._active;
        object.bounds = this._bounds.map((bound) => ({
          boxInitialized: bound.boxInitialized,
          boxMin: bound.box.min.toArray(),
          boxMax: bound.box.max.toArray(),
          sphereInitialized: bound.sphereInitialized,
          sphereRadius: bound.sphere.radius,
          sphereCenter: bound.sphere.center.toArray()
        }));
        object.maxInstanceCount = this._maxInstanceCount;
        object.maxVertexCount = this._maxVertexCount;
        object.maxIndexCount = this._maxIndexCount;
        object.geometryInitialized = this._geometryInitialized;
        object.geometryCount = this._geometryCount;
        object.matricesTexture = this._matricesTexture.toJSON(meta);
        if (this._colorsTexture !== null) object.colorsTexture = this._colorsTexture.toJSON(meta);
        if (this.boundingSphere !== null) {
          object.boundingSphere = {
            center: object.boundingSphere.center.toArray(),
            radius: object.boundingSphere.radius
          };
        }
        if (this.boundingBox !== null) {
          object.boundingBox = {
            min: object.boundingBox.min.toArray(),
            max: object.boundingBox.max.toArray()
          };
        }
      }
      function serialize(library, element) {
        if (library[element.uuid] === void 0) {
          library[element.uuid] = element.toJSON(meta);
        }
        return element.uuid;
      }
      if (this.isScene) {
        if (this.background) {
          if (this.background.isColor) {
            object.background = this.background.toJSON();
          } else if (this.background.isTexture) {
            object.background = this.background.toJSON(meta).uuid;
          }
        }
        if (this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true) {
          object.environment = this.environment.toJSON(meta).uuid;
        }
      } else if (this.isMesh || this.isLine || this.isPoints) {
        object.geometry = serialize(meta.geometries, this.geometry);
        const parameters = this.geometry.parameters;
        if (parameters !== void 0 && parameters.shapes !== void 0) {
          const shapes = parameters.shapes;
          if (Array.isArray(shapes)) {
            for (let i = 0, l = shapes.length; i < l; i++) {
              const shape = shapes[i];
              serialize(meta.shapes, shape);
            }
          } else {
            serialize(meta.shapes, shapes);
          }
        }
      }
      if (this.isSkinnedMesh) {
        object.bindMode = this.bindMode;
        object.bindMatrix = this.bindMatrix.toArray();
        if (this.skeleton !== void 0) {
          serialize(meta.skeletons, this.skeleton);
          object.skeleton = this.skeleton.uuid;
        }
      }
      if (this.material !== void 0) {
        if (Array.isArray(this.material)) {
          const uuids = [];
          for (let i = 0, l = this.material.length; i < l; i++) {
            uuids.push(serialize(meta.materials, this.material[i]));
          }
          object.material = uuids;
        } else {
          object.material = serialize(meta.materials, this.material);
        }
      }
      if (this.children.length > 0) {
        object.children = [];
        for (let i = 0; i < this.children.length; i++) {
          object.children.push(this.children[i].toJSON(meta).object);
        }
      }
      if (this.animations.length > 0) {
        object.animations = [];
        for (let i = 0; i < this.animations.length; i++) {
          const animation = this.animations[i];
          object.animations.push(serialize(meta.animations, animation));
        }
      }
      if (isRootObject) {
        const geometries = extractFromCache(meta.geometries);
        const materials = extractFromCache(meta.materials);
        const textures = extractFromCache(meta.textures);
        const images = extractFromCache(meta.images);
        const shapes = extractFromCache(meta.shapes);
        const skeletons = extractFromCache(meta.skeletons);
        const animations = extractFromCache(meta.animations);
        const nodes = extractFromCache(meta.nodes);
        if (geometries.length > 0) output.geometries = geometries;
        if (materials.length > 0) output.materials = materials;
        if (textures.length > 0) output.textures = textures;
        if (images.length > 0) output.images = images;
        if (shapes.length > 0) output.shapes = shapes;
        if (skeletons.length > 0) output.skeletons = skeletons;
        if (animations.length > 0) output.animations = animations;
        if (nodes.length > 0) output.nodes = nodes;
      }
      output.object = object;
      return output;
      function extractFromCache(cache) {
        const values = [];
        for (const key in cache) {
          const data = cache[key];
          delete data.metadata;
          values.push(data);
        }
        return values;
      }
    }
    clone(recursive) {
      return new this.constructor().copy(this, recursive);
    }
    copy(source, recursive = true) {
      this.name = source.name;
      this.up.copy(source.up);
      this.position.copy(source.position);
      this.rotation.order = source.rotation.order;
      this.quaternion.copy(source.quaternion);
      this.scale.copy(source.scale);
      this.matrix.copy(source.matrix);
      this.matrixWorld.copy(source.matrixWorld);
      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
      this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
      this.layers.mask = source.layers.mask;
      this.visible = source.visible;
      this.castShadow = source.castShadow;
      this.receiveShadow = source.receiveShadow;
      this.frustumCulled = source.frustumCulled;
      this.renderOrder = source.renderOrder;
      this.animations = source.animations.slice();
      this.userData = JSON.parse(JSON.stringify(source.userData));
      if (recursive === true) {
        for (let i = 0; i < source.children.length; i++) {
          const child = source.children[i];
          this.add(child.clone());
        }
      }
      return this;
    }
  }
  Object3D.DEFAULT_UP = /* @__PURE__ */ new Vector3(0, 1, 0);
  Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
  Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
  const _v0$2 = /* @__PURE__ */ new Vector3();
  const _v1$3 = /* @__PURE__ */ new Vector3();
  const _v2$2 = /* @__PURE__ */ new Vector3();
  const _v3$2 = /* @__PURE__ */ new Vector3();
  const _vab = /* @__PURE__ */ new Vector3();
  const _vac = /* @__PURE__ */ new Vector3();
  const _vbc = /* @__PURE__ */ new Vector3();
  const _vap = /* @__PURE__ */ new Vector3();
  const _vbp = /* @__PURE__ */ new Vector3();
  const _vcp = /* @__PURE__ */ new Vector3();
  const _v40 = /* @__PURE__ */ new Vector4();
  const _v41 = /* @__PURE__ */ new Vector4();
  const _v42 = /* @__PURE__ */ new Vector4();
  class Triangle {
    constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
      this.a = a;
      this.b = b;
      this.c = c;
    }
    static getNormal(a, b, c, target) {
      target.subVectors(c, b);
      _v0$2.subVectors(a, b);
      target.cross(_v0$2);
      const targetLengthSq = target.lengthSq();
      if (targetLengthSq > 0) {
        return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
      }
      return target.set(0, 0, 0);
    }
    // static/instance method to calculate barycentric coordinates
    // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
    static getBarycoord(point, a, b, c, target) {
      _v0$2.subVectors(c, a);
      _v1$3.subVectors(b, a);
      _v2$2.subVectors(point, a);
      const dot00 = _v0$2.dot(_v0$2);
      const dot01 = _v0$2.dot(_v1$3);
      const dot02 = _v0$2.dot(_v2$2);
      const dot11 = _v1$3.dot(_v1$3);
      const dot12 = _v1$3.dot(_v2$2);
      const denom = dot00 * dot11 - dot01 * dot01;
      if (denom === 0) {
        target.set(0, 0, 0);
        return null;
      }
      const invDenom = 1 / denom;
      const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
      return target.set(1 - u - v, v, u);
    }
    static containsPoint(point, a, b, c) {
      if (this.getBarycoord(point, a, b, c, _v3$2) === null) {
        return false;
      }
      return _v3$2.x >= 0 && _v3$2.y >= 0 && _v3$2.x + _v3$2.y <= 1;
    }
    static getInterpolation(point, p1, p2, p3, v1, v2, v3, target) {
      if (this.getBarycoord(point, p1, p2, p3, _v3$2) === null) {
        target.x = 0;
        target.y = 0;
        if ("z" in target) target.z = 0;
        if ("w" in target) target.w = 0;
        return null;
      }
      target.setScalar(0);
      target.addScaledVector(v1, _v3$2.x);
      target.addScaledVector(v2, _v3$2.y);
      target.addScaledVector(v3, _v3$2.z);
      return target;
    }
    static getInterpolatedAttribute(attr, i1, i2, i3, barycoord, target) {
      _v40.setScalar(0);
      _v41.setScalar(0);
      _v42.setScalar(0);
      _v40.fromBufferAttribute(attr, i1);
      _v41.fromBufferAttribute(attr, i2);
      _v42.fromBufferAttribute(attr, i3);
      target.setScalar(0);
      target.addScaledVector(_v40, barycoord.x);
      target.addScaledVector(_v41, barycoord.y);
      target.addScaledVector(_v42, barycoord.z);
      return target;
    }
    static isFrontFacing(a, b, c, direction) {
      _v0$2.subVectors(c, b);
      _v1$3.subVectors(a, b);
      return _v0$2.cross(_v1$3).dot(direction) < 0 ? true : false;
    }
    set(a, b, c) {
      this.a.copy(a);
      this.b.copy(b);
      this.c.copy(c);
      return this;
    }
    setFromPointsAndIndices(points, i0, i1, i2) {
      this.a.copy(points[i0]);
      this.b.copy(points[i1]);
      this.c.copy(points[i2]);
      return this;
    }
    setFromAttributeAndIndices(attribute, i0, i1, i2) {
      this.a.fromBufferAttribute(attribute, i0);
      this.b.fromBufferAttribute(attribute, i1);
      this.c.fromBufferAttribute(attribute, i2);
      return this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(triangle) {
      this.a.copy(triangle.a);
      this.b.copy(triangle.b);
      this.c.copy(triangle.c);
      return this;
    }
    getArea() {
      _v0$2.subVectors(this.c, this.b);
      _v1$3.subVectors(this.a, this.b);
      return _v0$2.cross(_v1$3).length() * 0.5;
    }
    getMidpoint(target) {
      return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(target) {
      return Triangle.getNormal(this.a, this.b, this.c, target);
    }
    getPlane(target) {
      return target.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(point, target) {
      return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
    }
    getInterpolation(point, v1, v2, v3, target) {
      return Triangle.getInterpolation(point, this.a, this.b, this.c, v1, v2, v3, target);
    }
    containsPoint(point) {
      return Triangle.containsPoint(point, this.a, this.b, this.c);
    }
    isFrontFacing(direction) {
      return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
    }
    intersectsBox(box) {
      return box.intersectsTriangle(this);
    }
    closestPointToPoint(p, target) {
      const a = this.a, b = this.b, c = this.c;
      let v, w;
      _vab.subVectors(b, a);
      _vac.subVectors(c, a);
      _vap.subVectors(p, a);
      const d1 = _vab.dot(_vap);
      const d2 = _vac.dot(_vap);
      if (d1 <= 0 && d2 <= 0) {
        return target.copy(a);
      }
      _vbp.subVectors(p, b);
      const d3 = _vab.dot(_vbp);
      const d4 = _vac.dot(_vbp);
      if (d3 >= 0 && d4 <= d3) {
        return target.copy(b);
      }
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        v = d1 / (d1 - d3);
        return target.copy(a).addScaledVector(_vab, v);
      }
      _vcp.subVectors(p, c);
      const d5 = _vab.dot(_vcp);
      const d6 = _vac.dot(_vcp);
      if (d6 >= 0 && d5 <= d6) {
        return target.copy(c);
      }
      const vb = d5 * d2 - d1 * d6;
      if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        w = d2 / (d2 - d6);
        return target.copy(a).addScaledVector(_vac, w);
      }
      const va = d3 * d6 - d5 * d4;
      if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        _vbc.subVectors(c, b);
        w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        return target.copy(b).addScaledVector(_vbc, w);
      }
      const denom = 1 / (va + vb + vc);
      v = vb * denom;
      w = vc * denom;
      return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
    }
    equals(triangle) {
      return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
    }
  }
  const _colorKeywords = {
    "aliceblue": 15792383,
    "antiquewhite": 16444375,
    "aqua": 65535,
    "aquamarine": 8388564,
    "azure": 15794175,
    "beige": 16119260,
    "bisque": 16770244,
    "black": 0,
    "blanchedalmond": 16772045,
    "blue": 255,
    "blueviolet": 9055202,
    "brown": 10824234,
    "burlywood": 14596231,
    "cadetblue": 6266528,
    "chartreuse": 8388352,
    "chocolate": 13789470,
    "coral": 16744272,
    "cornflowerblue": 6591981,
    "cornsilk": 16775388,
    "crimson": 14423100,
    "cyan": 65535,
    "darkblue": 139,
    "darkcyan": 35723,
    "darkgoldenrod": 12092939,
    "darkgray": 11119017,
    "darkgreen": 25600,
    "darkgrey": 11119017,
    "darkkhaki": 12433259,
    "darkmagenta": 9109643,
    "darkolivegreen": 5597999,
    "darkorange": 16747520,
    "darkorchid": 10040012,
    "darkred": 9109504,
    "darksalmon": 15308410,
    "darkseagreen": 9419919,
    "darkslateblue": 4734347,
    "darkslategray": 3100495,
    "darkslategrey": 3100495,
    "darkturquoise": 52945,
    "darkviolet": 9699539,
    "deeppink": 16716947,
    "deepskyblue": 49151,
    "dimgray": 6908265,
    "dimgrey": 6908265,
    "dodgerblue": 2003199,
    "firebrick": 11674146,
    "floralwhite": 16775920,
    "forestgreen": 2263842,
    "fuchsia": 16711935,
    "gainsboro": 14474460,
    "ghostwhite": 16316671,
    "gold": 16766720,
    "goldenrod": 14329120,
    "gray": 8421504,
    "green": 32768,
    "greenyellow": 11403055,
    "grey": 8421504,
    "honeydew": 15794160,
    "hotpink": 16738740,
    "indianred": 13458524,
    "indigo": 4915330,
    "ivory": 16777200,
    "khaki": 15787660,
    "lavender": 15132410,
    "lavenderblush": 16773365,
    "lawngreen": 8190976,
    "lemonchiffon": 16775885,
    "lightblue": 11393254,
    "lightcoral": 15761536,
    "lightcyan": 14745599,
    "lightgoldenrodyellow": 16448210,
    "lightgray": 13882323,
    "lightgreen": 9498256,
    "lightgrey": 13882323,
    "lightpink": 16758465,
    "lightsalmon": 16752762,
    "lightseagreen": 2142890,
    "lightskyblue": 8900346,
    "lightslategray": 7833753,
    "lightslategrey": 7833753,
    "lightsteelblue": 11584734,
    "lightyellow": 16777184,
    "lime": 65280,
    "limegreen": 3329330,
    "linen": 16445670,
    "magenta": 16711935,
    "maroon": 8388608,
    "mediumaquamarine": 6737322,
    "mediumblue": 205,
    "mediumorchid": 12211667,
    "mediumpurple": 9662683,
    "mediumseagreen": 3978097,
    "mediumslateblue": 8087790,
    "mediumspringgreen": 64154,
    "mediumturquoise": 4772300,
    "mediumvioletred": 13047173,
    "midnightblue": 1644912,
    "mintcream": 16121850,
    "mistyrose": 16770273,
    "moccasin": 16770229,
    "navajowhite": 16768685,
    "navy": 128,
    "oldlace": 16643558,
    "olive": 8421376,
    "olivedrab": 7048739,
    "orange": 16753920,
    "orangered": 16729344,
    "orchid": 14315734,
    "palegoldenrod": 15657130,
    "palegreen": 10025880,
    "paleturquoise": 11529966,
    "palevioletred": 14381203,
    "papayawhip": 16773077,
    "peachpuff": 16767673,
    "peru": 13468991,
    "pink": 16761035,
    "plum": 14524637,
    "powderblue": 11591910,
    "purple": 8388736,
    "rebeccapurple": 6697881,
    "red": 16711680,
    "rosybrown": 12357519,
    "royalblue": 4286945,
    "saddlebrown": 9127187,
    "salmon": 16416882,
    "sandybrown": 16032864,
    "seagreen": 3050327,
    "seashell": 16774638,
    "sienna": 10506797,
    "silver": 12632256,
    "skyblue": 8900331,
    "slateblue": 6970061,
    "slategray": 7372944,
    "slategrey": 7372944,
    "snow": 16775930,
    "springgreen": 65407,
    "steelblue": 4620980,
    "tan": 13808780,
    "teal": 32896,
    "thistle": 14204888,
    "tomato": 16737095,
    "turquoise": 4251856,
    "violet": 15631086,
    "wheat": 16113331,
    "white": 16777215,
    "whitesmoke": 16119285,
    "yellow": 16776960,
    "yellowgreen": 10145074
  };
  const _hslA = { h: 0, s: 0, l: 0 };
  const _hslB = { h: 0, s: 0, l: 0 };
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
    return p;
  }
  class Color {
    constructor(r, g, b) {
      this.isColor = true;
      this.r = 1;
      this.g = 1;
      this.b = 1;
      return this.set(r, g, b);
    }
    set(r, g, b) {
      if (g === void 0 && b === void 0) {
        const value = r;
        if (value && value.isColor) {
          this.copy(value);
        } else if (typeof value === "number") {
          this.setHex(value);
        } else if (typeof value === "string") {
          this.setStyle(value);
        }
      } else {
        this.setRGB(r, g, b);
      }
      return this;
    }
    setScalar(scalar) {
      this.r = scalar;
      this.g = scalar;
      this.b = scalar;
      return this;
    }
    setHex(hex, colorSpace = SRGBColorSpace) {
      hex = Math.floor(hex);
      this.r = (hex >> 16 & 255) / 255;
      this.g = (hex >> 8 & 255) / 255;
      this.b = (hex & 255) / 255;
      ColorManagement.toWorkingColorSpace(this, colorSpace);
      return this;
    }
    setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
      this.r = r;
      this.g = g;
      this.b = b;
      ColorManagement.toWorkingColorSpace(this, colorSpace);
      return this;
    }
    setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
      h = euclideanModulo(h, 1);
      s = clamp(s, 0, 1);
      l = clamp(l, 0, 1);
      if (s === 0) {
        this.r = this.g = this.b = l;
      } else {
        const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
        const q = 2 * l - p;
        this.r = hue2rgb(q, p, h + 1 / 3);
        this.g = hue2rgb(q, p, h);
        this.b = hue2rgb(q, p, h - 1 / 3);
      }
      ColorManagement.toWorkingColorSpace(this, colorSpace);
      return this;
    }
    setStyle(style, colorSpace = SRGBColorSpace) {
      function handleAlpha(string) {
        if (string === void 0) return;
        if (parseFloat(string) < 1) {
          console.warn("THREE.Color: Alpha component of " + style + " will be ignored.");
        }
      }
      let m;
      if (m = /^(\w+)\(([^\)]*)\)/.exec(style)) {
        let color;
        const name = m[1];
        const components = m[2];
        switch (name) {
          case "rgb":
          case "rgba":
            if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
              handleAlpha(color[4]);
              return this.setRGB(
                Math.min(255, parseInt(color[1], 10)) / 255,
                Math.min(255, parseInt(color[2], 10)) / 255,
                Math.min(255, parseInt(color[3], 10)) / 255,
                colorSpace
              );
            }
            if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
              handleAlpha(color[4]);
              return this.setRGB(
                Math.min(100, parseInt(color[1], 10)) / 100,
                Math.min(100, parseInt(color[2], 10)) / 100,
                Math.min(100, parseInt(color[3], 10)) / 100,
                colorSpace
              );
            }
            break;
          case "hsl":
          case "hsla":
            if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
              handleAlpha(color[4]);
              return this.setHSL(
                parseFloat(color[1]) / 360,
                parseFloat(color[2]) / 100,
                parseFloat(color[3]) / 100,
                colorSpace
              );
            }
            break;
          default:
            console.warn("THREE.Color: Unknown color model " + style);
        }
      } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
        const hex = m[1];
        const size = hex.length;
        if (size === 3) {
          return this.setRGB(
            parseInt(hex.charAt(0), 16) / 15,
            parseInt(hex.charAt(1), 16) / 15,
            parseInt(hex.charAt(2), 16) / 15,
            colorSpace
          );
        } else if (size === 6) {
          return this.setHex(parseInt(hex, 16), colorSpace);
        } else {
          console.warn("THREE.Color: Invalid hex color " + style);
        }
      } else if (style && style.length > 0) {
        return this.setColorName(style, colorSpace);
      }
      return this;
    }
    setColorName(style, colorSpace = SRGBColorSpace) {
      const hex = _colorKeywords[style.toLowerCase()];
      if (hex !== void 0) {
        this.setHex(hex, colorSpace);
      } else {
        console.warn("THREE.Color: Unknown color " + style);
      }
      return this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(color) {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      return this;
    }
    copySRGBToLinear(color) {
      this.r = SRGBToLinear(color.r);
      this.g = SRGBToLinear(color.g);
      this.b = SRGBToLinear(color.b);
      return this;
    }
    copyLinearToSRGB(color) {
      this.r = LinearToSRGB(color.r);
      this.g = LinearToSRGB(color.g);
      this.b = LinearToSRGB(color.b);
      return this;
    }
    convertSRGBToLinear() {
      this.copySRGBToLinear(this);
      return this;
    }
    convertLinearToSRGB() {
      this.copyLinearToSRGB(this);
      return this;
    }
    getHex(colorSpace = SRGBColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      return Math.round(clamp(_color.r * 255, 0, 255)) * 65536 + Math.round(clamp(_color.g * 255, 0, 255)) * 256 + Math.round(clamp(_color.b * 255, 0, 255));
    }
    getHexString(colorSpace = SRGBColorSpace) {
      return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
    }
    getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      const r = _color.r, g = _color.g, b = _color.b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let hue, saturation;
      const lightness = (min + max) / 2;
      if (min === max) {
        hue = 0;
        saturation = 0;
      } else {
        const delta = max - min;
        saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
        switch (max) {
          case r:
            hue = (g - b) / delta + (g < b ? 6 : 0);
            break;
          case g:
            hue = (b - r) / delta + 2;
            break;
          case b:
            hue = (r - g) / delta + 4;
            break;
        }
        hue /= 6;
      }
      target.h = hue;
      target.s = saturation;
      target.l = lightness;
      return target;
    }
    getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      target.r = _color.r;
      target.g = _color.g;
      target.b = _color.b;
      return target;
    }
    getStyle(colorSpace = SRGBColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);
      const r = _color.r, g = _color.g, b = _color.b;
      if (colorSpace !== SRGBColorSpace) {
        return `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})`;
      }
      return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    }
    offsetHSL(h, s, l) {
      this.getHSL(_hslA);
      return this.setHSL(_hslA.h + h, _hslA.s + s, _hslA.l + l);
    }
    add(color) {
      this.r += color.r;
      this.g += color.g;
      this.b += color.b;
      return this;
    }
    addColors(color1, color2) {
      this.r = color1.r + color2.r;
      this.g = color1.g + color2.g;
      this.b = color1.b + color2.b;
      return this;
    }
    addScalar(s) {
      this.r += s;
      this.g += s;
      this.b += s;
      return this;
    }
    sub(color) {
      this.r = Math.max(0, this.r - color.r);
      this.g = Math.max(0, this.g - color.g);
      this.b = Math.max(0, this.b - color.b);
      return this;
    }
    multiply(color) {
      this.r *= color.r;
      this.g *= color.g;
      this.b *= color.b;
      return this;
    }
    multiplyScalar(s) {
      this.r *= s;
      this.g *= s;
      this.b *= s;
      return this;
    }
    lerp(color, alpha) {
      this.r += (color.r - this.r) * alpha;
      this.g += (color.g - this.g) * alpha;
      this.b += (color.b - this.b) * alpha;
      return this;
    }
    lerpColors(color1, color2, alpha) {
      this.r = color1.r + (color2.r - color1.r) * alpha;
      this.g = color1.g + (color2.g - color1.g) * alpha;
      this.b = color1.b + (color2.b - color1.b) * alpha;
      return this;
    }
    lerpHSL(color, alpha) {
      this.getHSL(_hslA);
      color.getHSL(_hslB);
      const h = lerp(_hslA.h, _hslB.h, alpha);
      const s = lerp(_hslA.s, _hslB.s, alpha);
      const l = lerp(_hslA.l, _hslB.l, alpha);
      this.setHSL(h, s, l);
      return this;
    }
    setFromVector3(v) {
      this.r = v.x;
      this.g = v.y;
      this.b = v.z;
      return this;
    }
    applyMatrix3(m) {
      const r = this.r, g = this.g, b = this.b;
      const e = m.elements;
      this.r = e[0] * r + e[3] * g + e[6] * b;
      this.g = e[1] * r + e[4] * g + e[7] * b;
      this.b = e[2] * r + e[5] * g + e[8] * b;
      return this;
    }
    equals(c) {
      return c.r === this.r && c.g === this.g && c.b === this.b;
    }
    fromArray(array, offset = 0) {
      this.r = array[offset];
      this.g = array[offset + 1];
      this.b = array[offset + 2];
      return this;
    }
    toArray(array = [], offset = 0) {
      array[offset] = this.r;
      array[offset + 1] = this.g;
      array[offset + 2] = this.b;
      return array;
    }
    fromBufferAttribute(attribute, index) {
      this.r = attribute.getX(index);
      this.g = attribute.getY(index);
      this.b = attribute.getZ(index);
      return this;
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      yield this.r;
      yield this.g;
      yield this.b;
    }
  }
  const _color = /* @__PURE__ */ new Color();
  Color.NAMES = _colorKeywords;
  let _materialId = 0;
  class Material extends EventDispatcher {
    static get type() {
      return "Material";
    }
    get type() {
      return this.constructor.type;
    }
    set type(_value) {
    }
    constructor() {
      super();
      this.isMaterial = true;
      Object.defineProperty(this, "id", { value: _materialId++ });
      this.uuid = generateUUID();
      this.name = "";
      this.blending = NormalBlending;
      this.side = FrontSide;
      this.vertexColors = false;
      this.opacity = 1;
      this.transparent = false;
      this.alphaHash = false;
      this.blendSrc = SrcAlphaFactor;
      this.blendDst = OneMinusSrcAlphaFactor;
      this.blendEquation = AddEquation;
      this.blendSrcAlpha = null;
      this.blendDstAlpha = null;
      this.blendEquationAlpha = null;
      this.blendColor = new Color(0, 0, 0);
      this.blendAlpha = 0;
      this.depthFunc = LessEqualDepth;
      this.depthTest = true;
      this.depthWrite = true;
      this.stencilWriteMask = 255;
      this.stencilFunc = AlwaysStencilFunc;
      this.stencilRef = 0;
      this.stencilFuncMask = 255;
      this.stencilFail = KeepStencilOp;
      this.stencilZFail = KeepStencilOp;
      this.stencilZPass = KeepStencilOp;
      this.stencilWrite = false;
      this.clippingPlanes = null;
      this.clipIntersection = false;
      this.clipShadows = false;
      this.shadowSide = null;
      this.colorWrite = true;
      this.precision = null;
      this.polygonOffset = false;
      this.polygonOffsetFactor = 0;
      this.polygonOffsetUnits = 0;
      this.dithering = false;
      this.alphaToCoverage = false;
      this.premultipliedAlpha = false;
      this.forceSinglePass = false;
      this.visible = true;
      this.toneMapped = true;
      this.userData = {};
      this.version = 0;
      this._alphaTest = 0;
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(value) {
      if (this._alphaTest > 0 !== value > 0) {
        this.version++;
      }
      this._alphaTest = value;
    }
    // onBeforeRender and onBeforeCompile only supported in WebGLRenderer
    onBeforeRender() {
    }
    onBeforeCompile() {
    }
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(values) {
      if (values === void 0) return;
      for (const key in values) {
        const newValue = values[key];
        if (newValue === void 0) {
          console.warn(`THREE.Material: parameter '${key}' has value of undefined.`);
          continue;
        }
        const currentValue = this[key];
        if (currentValue === void 0) {
          console.warn(`THREE.Material: '${key}' is not a property of THREE.${this.type}.`);
          continue;
        }
        if (currentValue && currentValue.isColor) {
          currentValue.set(newValue);
        } else if (currentValue && currentValue.isVector3 && (newValue && newValue.isVector3)) {
          currentValue.copy(newValue);
        } else {
          this[key] = newValue;
        }
      }
    }
    toJSON(meta) {
      const isRootObject = meta === void 0 || typeof meta === "string";
      if (isRootObject) {
        meta = {
          textures: {},
          images: {}
        };
      }
      const data = {
        metadata: {
          version: 4.6,
          type: "Material",
          generator: "Material.toJSON"
        }
      };
      data.uuid = this.uuid;
      data.type = this.type;
      if (this.name !== "") data.name = this.name;
      if (this.color && this.color.isColor) data.color = this.color.getHex();
      if (this.roughness !== void 0) data.roughness = this.roughness;
      if (this.metalness !== void 0) data.metalness = this.metalness;
      if (this.sheen !== void 0) data.sheen = this.sheen;
      if (this.sheenColor && this.sheenColor.isColor) data.sheenColor = this.sheenColor.getHex();
      if (this.sheenRoughness !== void 0) data.sheenRoughness = this.sheenRoughness;
      if (this.emissive && this.emissive.isColor) data.emissive = this.emissive.getHex();
      if (this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1) data.emissiveIntensity = this.emissiveIntensity;
      if (this.specular && this.specular.isColor) data.specular = this.specular.getHex();
      if (this.specularIntensity !== void 0) data.specularIntensity = this.specularIntensity;
      if (this.specularColor && this.specularColor.isColor) data.specularColor = this.specularColor.getHex();
      if (this.shininess !== void 0) data.shininess = this.shininess;
      if (this.clearcoat !== void 0) data.clearcoat = this.clearcoat;
      if (this.clearcoatRoughness !== void 0) data.clearcoatRoughness = this.clearcoatRoughness;
      if (this.clearcoatMap && this.clearcoatMap.isTexture) {
        data.clearcoatMap = this.clearcoatMap.toJSON(meta).uuid;
      }
      if (this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture) {
        data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(meta).uuid;
      }
      if (this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture) {
        data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(meta).uuid;
        data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();
      }
      if (this.dispersion !== void 0) data.dispersion = this.dispersion;
      if (this.iridescence !== void 0) data.iridescence = this.iridescence;
      if (this.iridescenceIOR !== void 0) data.iridescenceIOR = this.iridescenceIOR;
      if (this.iridescenceThicknessRange !== void 0) data.iridescenceThicknessRange = this.iridescenceThicknessRange;
      if (this.iridescenceMap && this.iridescenceMap.isTexture) {
        data.iridescenceMap = this.iridescenceMap.toJSON(meta).uuid;
      }
      if (this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture) {
        data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(meta).uuid;
      }
      if (this.anisotropy !== void 0) data.anisotropy = this.anisotropy;
      if (this.anisotropyRotation !== void 0) data.anisotropyRotation = this.anisotropyRotation;
      if (this.anisotropyMap && this.anisotropyMap.isTexture) {
        data.anisotropyMap = this.anisotropyMap.toJSON(meta).uuid;
      }
      if (this.map && this.map.isTexture) data.map = this.map.toJSON(meta).uuid;
      if (this.matcap && this.matcap.isTexture) data.matcap = this.matcap.toJSON(meta).uuid;
      if (this.alphaMap && this.alphaMap.isTexture) data.alphaMap = this.alphaMap.toJSON(meta).uuid;
      if (this.lightMap && this.lightMap.isTexture) {
        data.lightMap = this.lightMap.toJSON(meta).uuid;
        data.lightMapIntensity = this.lightMapIntensity;
      }
      if (this.aoMap && this.aoMap.isTexture) {
        data.aoMap = this.aoMap.toJSON(meta).uuid;
        data.aoMapIntensity = this.aoMapIntensity;
      }
      if (this.bumpMap && this.bumpMap.isTexture) {
        data.bumpMap = this.bumpMap.toJSON(meta).uuid;
        data.bumpScale = this.bumpScale;
      }
      if (this.normalMap && this.normalMap.isTexture) {
        data.normalMap = this.normalMap.toJSON(meta).uuid;
        data.normalMapType = this.normalMapType;
        data.normalScale = this.normalScale.toArray();
      }
      if (this.displacementMap && this.displacementMap.isTexture) {
        data.displacementMap = this.displacementMap.toJSON(meta).uuid;
        data.displacementScale = this.displacementScale;
        data.displacementBias = this.displacementBias;
      }
      if (this.roughnessMap && this.roughnessMap.isTexture) data.roughnessMap = this.roughnessMap.toJSON(meta).uuid;
      if (this.metalnessMap && this.metalnessMap.isTexture) data.metalnessMap = this.metalnessMap.toJSON(meta).uuid;
      if (this.emissiveMap && this.emissiveMap.isTexture) data.emissiveMap = this.emissiveMap.toJSON(meta).uuid;
      if (this.specularMap && this.specularMap.isTexture) data.specularMap = this.specularMap.toJSON(meta).uuid;
      if (this.specularIntensityMap && this.specularIntensityMap.isTexture) data.specularIntensityMap = this.specularIntensityMap.toJSON(meta).uuid;
      if (this.specularColorMap && this.specularColorMap.isTexture) data.specularColorMap = this.specularColorMap.toJSON(meta).uuid;
      if (this.envMap && this.envMap.isTexture) {
        data.envMap = this.envMap.toJSON(meta).uuid;
        if (this.combine !== void 0) data.combine = this.combine;
      }
      if (this.envMapRotation !== void 0) data.envMapRotation = this.envMapRotation.toArray();
      if (this.envMapIntensity !== void 0) data.envMapIntensity = this.envMapIntensity;
      if (this.reflectivity !== void 0) data.reflectivity = this.reflectivity;
      if (this.refractionRatio !== void 0) data.refractionRatio = this.refractionRatio;
      if (this.gradientMap && this.gradientMap.isTexture) {
        data.gradientMap = this.gradientMap.toJSON(meta).uuid;
      }
      if (this.transmission !== void 0) data.transmission = this.transmission;
      if (this.transmissionMap && this.transmissionMap.isTexture) data.transmissionMap = this.transmissionMap.toJSON(meta).uuid;
      if (this.thickness !== void 0) data.thickness = this.thickness;
      if (this.thicknessMap && this.thicknessMap.isTexture) data.thicknessMap = this.thicknessMap.toJSON(meta).uuid;
      if (this.attenuationDistance !== void 0 && this.attenuationDistance !== Infinity) data.attenuationDistance = this.attenuationDistance;
      if (this.attenuationColor !== void 0) data.attenuationColor = this.attenuationColor.getHex();
      if (this.size !== void 0) data.size = this.size;
      if (this.shadowSide !== null) data.shadowSide = this.shadowSide;
      if (this.sizeAttenuation !== void 0) data.sizeAttenuation = this.sizeAttenuation;
      if (this.blending !== NormalBlending) data.blending = this.blending;
      if (this.side !== FrontSide) data.side = this.side;
      if (this.vertexColors === true) data.vertexColors = true;
      if (this.opacity < 1) data.opacity = this.opacity;
      if (this.transparent === true) data.transparent = true;
      if (this.blendSrc !== SrcAlphaFactor) data.blendSrc = this.blendSrc;
      if (this.blendDst !== OneMinusSrcAlphaFactor) data.blendDst = this.blendDst;
      if (this.blendEquation !== AddEquation) data.blendEquation = this.blendEquation;
      if (this.blendSrcAlpha !== null) data.blendSrcAlpha = this.blendSrcAlpha;
      if (this.blendDstAlpha !== null) data.blendDstAlpha = this.blendDstAlpha;
      if (this.blendEquationAlpha !== null) data.blendEquationAlpha = this.blendEquationAlpha;
      if (this.blendColor && this.blendColor.isColor) data.blendColor = this.blendColor.getHex();
      if (this.blendAlpha !== 0) data.blendAlpha = this.blendAlpha;
      if (this.depthFunc !== LessEqualDepth) data.depthFunc = this.depthFunc;
      if (this.depthTest === false) data.depthTest = this.depthTest;
      if (this.depthWrite === false) data.depthWrite = this.depthWrite;
      if (this.colorWrite === false) data.colorWrite = this.colorWrite;
      if (this.stencilWriteMask !== 255) data.stencilWriteMask = this.stencilWriteMask;
      if (this.stencilFunc !== AlwaysStencilFunc) data.stencilFunc = this.stencilFunc;
      if (this.stencilRef !== 0) data.stencilRef = this.stencilRef;
      if (this.stencilFuncMask !== 255) data.stencilFuncMask = this.stencilFuncMask;
      if (this.stencilFail !== KeepStencilOp) data.stencilFail = this.stencilFail;
      if (this.stencilZFail !== KeepStencilOp) data.stencilZFail = this.stencilZFail;
      if (this.stencilZPass !== KeepStencilOp) data.stencilZPass = this.stencilZPass;
      if (this.stencilWrite === true) data.stencilWrite = this.stencilWrite;
      if (this.rotation !== void 0 && this.rotation !== 0) data.rotation = this.rotation;
      if (this.polygonOffset === true) data.polygonOffset = true;
      if (this.polygonOffsetFactor !== 0) data.polygonOffsetFactor = this.polygonOffsetFactor;
      if (this.polygonOffsetUnits !== 0) data.polygonOffsetUnits = this.polygonOffsetUnits;
      if (this.linewidth !== void 0 && this.linewidth !== 1) data.linewidth = this.linewidth;
      if (this.dashSize !== void 0) data.dashSize = this.dashSize;
      if (this.gapSize !== void 0) data.gapSize = this.gapSize;
      if (this.scale !== void 0) data.scale = this.scale;
      if (this.dithering === true) data.dithering = true;
      if (this.alphaTest > 0) data.alphaTest = this.alphaTest;
      if (this.alphaHash === true) data.alphaHash = true;
      if (this.alphaToCoverage === true) data.alphaToCoverage = true;
      if (this.premultipliedAlpha === true) data.premultipliedAlpha = true;
      if (this.forceSinglePass === true) data.forceSinglePass = true;
      if (this.wireframe === true) data.wireframe = true;
      if (this.wireframeLinewidth > 1) data.wireframeLinewidth = this.wireframeLinewidth;
      if (this.wireframeLinecap !== "round") data.wireframeLinecap = this.wireframeLinecap;
      if (this.wireframeLinejoin !== "round") data.wireframeLinejoin = this.wireframeLinejoin;
      if (this.flatShading === true) data.flatShading = true;
      if (this.visible === false) data.visible = false;
      if (this.toneMapped === false) data.toneMapped = false;
      if (this.fog === false) data.fog = false;
      if (Object.keys(this.userData).length > 0) data.userData = this.userData;
      function extractFromCache(cache) {
        const values = [];
        for (const key in cache) {
          const data2 = cache[key];
          delete data2.metadata;
          values.push(data2);
        }
        return values;
      }
      if (isRootObject) {
        const textures = extractFromCache(meta.textures);
        const images = extractFromCache(meta.images);
        if (textures.length > 0) data.textures = textures;
        if (images.length > 0) data.images = images;
      }
      return data;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.name = source.name;
      this.blending = source.blending;
      this.side = source.side;
      this.vertexColors = source.vertexColors;
      this.opacity = source.opacity;
      this.transparent = source.transparent;
      this.blendSrc = source.blendSrc;
      this.blendDst = source.blendDst;
      this.blendEquation = source.blendEquation;
      this.blendSrcAlpha = source.blendSrcAlpha;
      this.blendDstAlpha = source.blendDstAlpha;
      this.blendEquationAlpha = source.blendEquationAlpha;
      this.blendColor.copy(source.blendColor);
      this.blendAlpha = source.blendAlpha;
      this.depthFunc = source.depthFunc;
      this.depthTest = source.depthTest;
      this.depthWrite = source.depthWrite;
      this.stencilWriteMask = source.stencilWriteMask;
      this.stencilFunc = source.stencilFunc;
      this.stencilRef = source.stencilRef;
      this.stencilFuncMask = source.stencilFuncMask;
      this.stencilFail = source.stencilFail;
      this.stencilZFail = source.stencilZFail;
      this.stencilZPass = source.stencilZPass;
      this.stencilWrite = source.stencilWrite;
      const srcPlanes = source.clippingPlanes;
      let dstPlanes = null;
      if (srcPlanes !== null) {
        const n = srcPlanes.length;
        dstPlanes = new Array(n);
        for (let i = 0; i !== n; ++i) {
          dstPlanes[i] = srcPlanes[i].clone();
        }
      }
      this.clippingPlanes = dstPlanes;
      this.clipIntersection = source.clipIntersection;
      this.clipShadows = source.clipShadows;
      this.shadowSide = source.shadowSide;
      this.colorWrite = source.colorWrite;
      this.precision = source.precision;
      this.polygonOffset = source.polygonOffset;
      this.polygonOffsetFactor = source.polygonOffsetFactor;
      this.polygonOffsetUnits = source.polygonOffsetUnits;
      this.dithering = source.dithering;
      this.alphaTest = source.alphaTest;
      this.alphaHash = source.alphaHash;
      this.alphaToCoverage = source.alphaToCoverage;
      this.premultipliedAlpha = source.premultipliedAlpha;
      this.forceSinglePass = source.forceSinglePass;
      this.visible = source.visible;
      this.toneMapped = source.toneMapped;
      this.userData = JSON.parse(JSON.stringify(source.userData));
      return this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    onBuild() {
      console.warn("Material: onBuild() has been removed.");
    }
  }
  class MeshBasicMaterial extends Material {
    static get type() {
      return "MeshBasicMaterial";
    }
    constructor(parameters) {
      super();
      this.isMeshBasicMaterial = true;
      this.color = new Color(16777215);
      this.map = null;
      this.lightMap = null;
      this.lightMapIntensity = 1;
      this.aoMap = null;
      this.aoMapIntensity = 1;
      this.specularMap = null;
      this.alphaMap = null;
      this.envMap = null;
      this.envMapRotation = new Euler();
      this.combine = MultiplyOperation;
      this.reflectivity = 1;
      this.refractionRatio = 0.98;
      this.wireframe = false;
      this.wireframeLinewidth = 1;
      this.wireframeLinecap = "round";
      this.wireframeLinejoin = "round";
      this.fog = true;
      this.setValues(parameters);
    }
    copy(source) {
      super.copy(source);
      this.color.copy(source.color);
      this.map = source.map;
      this.lightMap = source.lightMap;
      this.lightMapIntensity = source.lightMapIntensity;
      this.aoMap = source.aoMap;
      this.aoMapIntensity = source.aoMapIntensity;
      this.specularMap = source.specularMap;
      this.alphaMap = source.alphaMap;
      this.envMap = source.envMap;
      this.envMapRotation.copy(source.envMapRotation);
      this.combine = source.combine;
      this.reflectivity = source.reflectivity;
      this.refractionRatio = source.refractionRatio;
      this.wireframe = source.wireframe;
      this.wireframeLinewidth = source.wireframeLinewidth;
      this.wireframeLinecap = source.wireframeLinecap;
      this.wireframeLinejoin = source.wireframeLinejoin;
      this.fog = source.fog;
      return this;
    }
  }
  const _vector$9 = /* @__PURE__ */ new Vector3();
  const _vector2$1 = /* @__PURE__ */ new Vector2();
  class BufferAttribute {
    constructor(array, itemSize, normalized = false) {
      if (Array.isArray(array)) {
        throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      }
      this.isBufferAttribute = true;
      this.name = "";
      this.array = array;
      this.itemSize = itemSize;
      this.count = array !== void 0 ? array.length / itemSize : 0;
      this.normalized = normalized;
      this.usage = StaticDrawUsage;
      this.updateRanges = [];
      this.gpuType = FloatType;
      this.version = 0;
    }
    onUploadCallback() {
    }
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    setUsage(value) {
      this.usage = value;
      return this;
    }
    addUpdateRange(start, count) {
      this.updateRanges.push({ start, count });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(source) {
      this.name = source.name;
      this.array = new source.array.constructor(source.array);
      this.itemSize = source.itemSize;
      this.count = source.count;
      this.normalized = source.normalized;
      this.usage = source.usage;
      this.gpuType = source.gpuType;
      return this;
    }
    copyAt(index1, attribute, index2) {
      index1 *= this.itemSize;
      index2 *= attribute.itemSize;
      for (let i = 0, l = this.itemSize; i < l; i++) {
        this.array[index1 + i] = attribute.array[index2 + i];
      }
      return this;
    }
    copyArray(array) {
      this.array.set(array);
      return this;
    }
    applyMatrix3(m) {
      if (this.itemSize === 2) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector2$1.fromBufferAttribute(this, i);
          _vector2$1.applyMatrix3(m);
          this.setXY(i, _vector2$1.x, _vector2$1.y);
        }
      } else if (this.itemSize === 3) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector$9.fromBufferAttribute(this, i);
          _vector$9.applyMatrix3(m);
          this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
        }
      }
      return this;
    }
    applyMatrix4(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.applyMatrix4(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.applyNormalMatrix(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$9.fromBufferAttribute(this, i);
        _vector$9.transformDirection(m);
        this.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
      }
      return this;
    }
    set(value, offset = 0) {
      this.array.set(value, offset);
      return this;
    }
    getComponent(index, component) {
      let value = this.array[index * this.itemSize + component];
      if (this.normalized) value = denormalize(value, this.array);
      return value;
    }
    setComponent(index, component, value) {
      if (this.normalized) value = normalize(value, this.array);
      this.array[index * this.itemSize + component] = value;
      return this;
    }
    getX(index) {
      let x = this.array[index * this.itemSize];
      if (this.normalized) x = denormalize(x, this.array);
      return x;
    }
    setX(index, x) {
      if (this.normalized) x = normalize(x, this.array);
      this.array[index * this.itemSize] = x;
      return this;
    }
    getY(index) {
      let y = this.array[index * this.itemSize + 1];
      if (this.normalized) y = denormalize(y, this.array);
      return y;
    }
    setY(index, y) {
      if (this.normalized) y = normalize(y, this.array);
      this.array[index * this.itemSize + 1] = y;
      return this;
    }
    getZ(index) {
      let z = this.array[index * this.itemSize + 2];
      if (this.normalized) z = denormalize(z, this.array);
      return z;
    }
    setZ(index, z) {
      if (this.normalized) z = normalize(z, this.array);
      this.array[index * this.itemSize + 2] = z;
      return this;
    }
    getW(index) {
      let w = this.array[index * this.itemSize + 3];
      if (this.normalized) w = denormalize(w, this.array);
      return w;
    }
    setW(index, w) {
      if (this.normalized) w = normalize(w, this.array);
      this.array[index * this.itemSize + 3] = w;
      return this;
    }
    setXY(index, x, y) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      return this;
    }
    setXYZ(index, x, y, z) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;
      return this;
    }
    setXYZW(index, x, y, z, w) {
      index *= this.itemSize;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
        w = normalize(w, this.array);
      }
      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;
      this.array[index + 3] = w;
      return this;
    }
    onUpload(callback) {
      this.onUploadCallback = callback;
      return this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      const data = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      if (this.name !== "") data.name = this.name;
      if (this.usage !== StaticDrawUsage) data.usage = this.usage;
      return data;
    }
  }
  class Uint16BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint16Array(array), itemSize, normalized);
    }
  }
  class Uint32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint32Array(array), itemSize, normalized);
    }
  }
  class Float32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Float32Array(array), itemSize, normalized);
    }
  }
  let _id$2 = 0;
  const _m1$2 = /* @__PURE__ */ new Matrix4();
  const _obj = /* @__PURE__ */ new Object3D();
  const _offset = /* @__PURE__ */ new Vector3();
  const _box$2 = /* @__PURE__ */ new Box3();
  const _boxMorphTargets = /* @__PURE__ */ new Box3();
  const _vector$8 = /* @__PURE__ */ new Vector3();
  class BufferGeometry extends EventDispatcher {
    constructor() {
      super();
      this.isBufferGeometry = true;
      Object.defineProperty(this, "id", { value: _id$2++ });
      this.uuid = generateUUID();
      this.name = "";
      this.type = "BufferGeometry";
      this.index = null;
      this.indirect = null;
      this.attributes = {};
      this.morphAttributes = {};
      this.morphTargetsRelative = false;
      this.groups = [];
      this.boundingBox = null;
      this.boundingSphere = null;
      this.drawRange = { start: 0, count: Infinity };
      this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(index) {
      if (Array.isArray(index)) {
        this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
      } else {
        this.index = index;
      }
      return this;
    }
    setIndirect(indirect) {
      this.indirect = indirect;
      return this;
    }
    getIndirect() {
      return this.indirect;
    }
    getAttribute(name) {
      return this.attributes[name];
    }
    setAttribute(name, attribute) {
      this.attributes[name] = attribute;
      return this;
    }
    deleteAttribute(name) {
      delete this.attributes[name];
      return this;
    }
    hasAttribute(name) {
      return this.attributes[name] !== void 0;
    }
    addGroup(start, count, materialIndex = 0) {
      this.groups.push({
        start,
        count,
        materialIndex
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(start, count) {
      this.drawRange.start = start;
      this.drawRange.count = count;
    }
    applyMatrix4(matrix) {
      const position = this.attributes.position;
      if (position !== void 0) {
        position.applyMatrix4(matrix);
        position.needsUpdate = true;
      }
      const normal = this.attributes.normal;
      if (normal !== void 0) {
        const normalMatrix = new Matrix3().getNormalMatrix(matrix);
        normal.applyNormalMatrix(normalMatrix);
        normal.needsUpdate = true;
      }
      const tangent = this.attributes.tangent;
      if (tangent !== void 0) {
        tangent.transformDirection(matrix);
        tangent.needsUpdate = true;
      }
      if (this.boundingBox !== null) {
        this.computeBoundingBox();
      }
      if (this.boundingSphere !== null) {
        this.computeBoundingSphere();
      }
      return this;
    }
    applyQuaternion(q) {
      _m1$2.makeRotationFromQuaternion(q);
      this.applyMatrix4(_m1$2);
      return this;
    }
    rotateX(angle) {
      _m1$2.makeRotationX(angle);
      this.applyMatrix4(_m1$2);
      return this;
    }
    rotateY(angle) {
      _m1$2.makeRotationY(angle);
      this.applyMatrix4(_m1$2);
      return this;
    }
    rotateZ(angle) {
      _m1$2.makeRotationZ(angle);
      this.applyMatrix4(_m1$2);
      return this;
    }
    translate(x, y, z) {
      _m1$2.makeTranslation(x, y, z);
      this.applyMatrix4(_m1$2);
      return this;
    }
    scale(x, y, z) {
      _m1$2.makeScale(x, y, z);
      this.applyMatrix4(_m1$2);
      return this;
    }
    lookAt(vector) {
      _obj.lookAt(vector);
      _obj.updateMatrix();
      this.applyMatrix4(_obj.matrix);
      return this;
    }
    center() {
      this.computeBoundingBox();
      this.boundingBox.getCenter(_offset).negate();
      this.translate(_offset.x, _offset.y, _offset.z);
      return this;
    }
    setFromPoints(points) {
      const positionAttribute = this.getAttribute("position");
      if (positionAttribute === void 0) {
        const position = [];
        for (let i = 0, l = points.length; i < l; i++) {
          const point = points[i];
          position.push(point.x, point.y, point.z || 0);
        }
        this.setAttribute("position", new Float32BufferAttribute(position, 3));
      } else {
        for (let i = 0, l = positionAttribute.count; i < l; i++) {
          const point = points[i];
          positionAttribute.setXYZ(i, point.x, point.y, point.z || 0);
        }
        if (points.length > positionAttribute.count) {
          console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");
        }
        positionAttribute.needsUpdate = true;
      }
      return this;
    }
    computeBoundingBox() {
      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }
      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this);
        this.boundingBox.set(
          new Vector3(-Infinity, -Infinity, -Infinity),
          new Vector3(Infinity, Infinity, Infinity)
        );
        return;
      }
      if (position !== void 0) {
        this.boundingBox.setFromBufferAttribute(position);
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _box$2.setFromBufferAttribute(morphAttribute);
            if (this.morphTargetsRelative) {
              _vector$8.addVectors(this.boundingBox.min, _box$2.min);
              this.boundingBox.expandByPoint(_vector$8);
              _vector$8.addVectors(this.boundingBox.max, _box$2.max);
              this.boundingBox.expandByPoint(_vector$8);
            } else {
              this.boundingBox.expandByPoint(_box$2.min);
              this.boundingBox.expandByPoint(_box$2.max);
            }
          }
        }
      } else {
        this.boundingBox.makeEmpty();
      }
      if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
        console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
      }
    }
    computeBoundingSphere() {
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }
      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;
      if (position && position.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this);
        this.boundingSphere.set(new Vector3(), Infinity);
        return;
      }
      if (position) {
        const center = this.boundingSphere.center;
        _box$2.setFromBufferAttribute(position);
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _boxMorphTargets.setFromBufferAttribute(morphAttribute);
            if (this.morphTargetsRelative) {
              _vector$8.addVectors(_box$2.min, _boxMorphTargets.min);
              _box$2.expandByPoint(_vector$8);
              _vector$8.addVectors(_box$2.max, _boxMorphTargets.max);
              _box$2.expandByPoint(_vector$8);
            } else {
              _box$2.expandByPoint(_boxMorphTargets.min);
              _box$2.expandByPoint(_boxMorphTargets.max);
            }
          }
        }
        _box$2.getCenter(center);
        let maxRadiusSq = 0;
        for (let i = 0, il = position.count; i < il; i++) {
          _vector$8.fromBufferAttribute(position, i);
          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
        }
        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            const morphTargetsRelative = this.morphTargetsRelative;
            for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
              _vector$8.fromBufferAttribute(morphAttribute, j);
              if (morphTargetsRelative) {
                _offset.fromBufferAttribute(position, j);
                _vector$8.add(_offset);
              }
              maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$8));
            }
          }
        }
        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
        if (isNaN(this.boundingSphere.radius)) {
          console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
        }
      }
    }
    computeTangents() {
      const index = this.index;
      const attributes = this.attributes;
      if (index === null || attributes.position === void 0 || attributes.normal === void 0 || attributes.uv === void 0) {
        console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      const positionAttribute = attributes.position;
      const normalAttribute = attributes.normal;
      const uvAttribute = attributes.uv;
      if (this.hasAttribute("tangent") === false) {
        this.setAttribute("tangent", new BufferAttribute(new Float32Array(4 * positionAttribute.count), 4));
      }
      const tangentAttribute = this.getAttribute("tangent");
      const tan1 = [], tan2 = [];
      for (let i = 0; i < positionAttribute.count; i++) {
        tan1[i] = new Vector3();
        tan2[i] = new Vector3();
      }
      const vA = new Vector3(), vB = new Vector3(), vC = new Vector3(), uvA = new Vector2(), uvB = new Vector2(), uvC = new Vector2(), sdir = new Vector3(), tdir = new Vector3();
      function handleTriangle(a, b, c) {
        vA.fromBufferAttribute(positionAttribute, a);
        vB.fromBufferAttribute(positionAttribute, b);
        vC.fromBufferAttribute(positionAttribute, c);
        uvA.fromBufferAttribute(uvAttribute, a);
        uvB.fromBufferAttribute(uvAttribute, b);
        uvC.fromBufferAttribute(uvAttribute, c);
        vB.sub(vA);
        vC.sub(vA);
        uvB.sub(uvA);
        uvC.sub(uvA);
        const r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
        if (!isFinite(r)) return;
        sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
        tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);
        tan1[a].add(sdir);
        tan1[b].add(sdir);
        tan1[c].add(sdir);
        tan2[a].add(tdir);
        tan2[b].add(tdir);
        tan2[c].add(tdir);
      }
      let groups = this.groups;
      if (groups.length === 0) {
        groups = [{
          start: 0,
          count: index.count
        }];
      }
      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];
        const start = group.start;
        const count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleTriangle(
            index.getX(j + 0),
            index.getX(j + 1),
            index.getX(j + 2)
          );
        }
      }
      const tmp = new Vector3(), tmp2 = new Vector3();
      const n = new Vector3(), n2 = new Vector3();
      function handleVertex(v) {
        n.fromBufferAttribute(normalAttribute, v);
        n2.copy(n);
        const t = tan1[v];
        tmp.copy(t);
        tmp.sub(n.multiplyScalar(n.dot(t))).normalize();
        tmp2.crossVectors(n2, t);
        const test = tmp2.dot(tan2[v]);
        const w = test < 0 ? -1 : 1;
        tangentAttribute.setXYZW(v, tmp.x, tmp.y, tmp.z, w);
      }
      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];
        const start = group.start;
        const count = group.count;
        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleVertex(index.getX(j + 0));
          handleVertex(index.getX(j + 1));
          handleVertex(index.getX(j + 2));
        }
      }
    }
    computeVertexNormals() {
      const index = this.index;
      const positionAttribute = this.getAttribute("position");
      if (positionAttribute !== void 0) {
        let normalAttribute = this.getAttribute("normal");
        if (normalAttribute === void 0) {
          normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
          this.setAttribute("normal", normalAttribute);
        } else {
          for (let i = 0, il = normalAttribute.count; i < il; i++) {
            normalAttribute.setXYZ(i, 0, 0, 0);
          }
        }
        const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
        const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
        const cb = new Vector3(), ab = new Vector3();
        if (index) {
          for (let i = 0, il = index.count; i < il; i += 3) {
            const vA = index.getX(i + 0);
            const vB = index.getX(i + 1);
            const vC = index.getX(i + 2);
            pA.fromBufferAttribute(positionAttribute, vA);
            pB.fromBufferAttribute(positionAttribute, vB);
            pC.fromBufferAttribute(positionAttribute, vC);
            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);
            nA.fromBufferAttribute(normalAttribute, vA);
            nB.fromBufferAttribute(normalAttribute, vB);
            nC.fromBufferAttribute(normalAttribute, vC);
            nA.add(cb);
            nB.add(cb);
            nC.add(cb);
            normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
            normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
            normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
          }
        } else {
          for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
            pA.fromBufferAttribute(positionAttribute, i + 0);
            pB.fromBufferAttribute(positionAttribute, i + 1);
            pC.fromBufferAttribute(positionAttribute, i + 2);
            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);
            normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
          }
        }
        this.normalizeNormals();
        normalAttribute.needsUpdate = true;
      }
    }
    normalizeNormals() {
      const normals = this.attributes.normal;
      for (let i = 0, il = normals.count; i < il; i++) {
        _vector$8.fromBufferAttribute(normals, i);
        _vector$8.normalize();
        normals.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
      }
    }
    toNonIndexed() {
      function convertBufferAttribute(attribute, indices2) {
        const array = attribute.array;
        const itemSize = attribute.itemSize;
        const normalized = attribute.normalized;
        const array2 = new array.constructor(indices2.length * itemSize);
        let index = 0, index2 = 0;
        for (let i = 0, l = indices2.length; i < l; i++) {
          if (attribute.isInterleavedBufferAttribute) {
            index = indices2[i] * attribute.data.stride + attribute.offset;
          } else {
            index = indices2[i] * itemSize;
          }
          for (let j = 0; j < itemSize; j++) {
            array2[index2++] = array[index++];
          }
        }
        return new BufferAttribute(array2, itemSize, normalized);
      }
      if (this.index === null) {
        console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.");
        return this;
      }
      const geometry2 = new BufferGeometry();
      const indices = this.index.array;
      const attributes = this.attributes;
      for (const name in attributes) {
        const attribute = attributes[name];
        const newAttribute = convertBufferAttribute(attribute, indices);
        geometry2.setAttribute(name, newAttribute);
      }
      const morphAttributes = this.morphAttributes;
      for (const name in morphAttributes) {
        const morphArray = [];
        const morphAttribute = morphAttributes[name];
        for (let i = 0, il = morphAttribute.length; i < il; i++) {
          const attribute = morphAttribute[i];
          const newAttribute = convertBufferAttribute(attribute, indices);
          morphArray.push(newAttribute);
        }
        geometry2.morphAttributes[name] = morphArray;
      }
      geometry2.morphTargetsRelative = this.morphTargetsRelative;
      const groups = this.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        geometry2.addGroup(group.start, group.count, group.materialIndex);
      }
      return geometry2;
    }
    toJSON() {
      const data = {
        metadata: {
          version: 4.6,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      data.uuid = this.uuid;
      data.type = this.type;
      if (this.name !== "") data.name = this.name;
      if (Object.keys(this.userData).length > 0) data.userData = this.userData;
      if (this.parameters !== void 0) {
        const parameters = this.parameters;
        for (const key in parameters) {
          if (parameters[key] !== void 0) data[key] = parameters[key];
        }
        return data;
      }
      data.data = { attributes: {} };
      const index = this.index;
      if (index !== null) {
        data.data.index = {
          type: index.array.constructor.name,
          array: Array.prototype.slice.call(index.array)
        };
      }
      const attributes = this.attributes;
      for (const key in attributes) {
        const attribute = attributes[key];
        data.data.attributes[key] = attribute.toJSON(data.data);
      }
      const morphAttributes = {};
      let hasMorphAttributes = false;
      for (const key in this.morphAttributes) {
        const attributeArray = this.morphAttributes[key];
        const array = [];
        for (let i = 0, il = attributeArray.length; i < il; i++) {
          const attribute = attributeArray[i];
          array.push(attribute.toJSON(data.data));
        }
        if (array.length > 0) {
          morphAttributes[key] = array;
          hasMorphAttributes = true;
        }
      }
      if (hasMorphAttributes) {
        data.data.morphAttributes = morphAttributes;
        data.data.morphTargetsRelative = this.morphTargetsRelative;
      }
      const groups = this.groups;
      if (groups.length > 0) {
        data.data.groups = JSON.parse(JSON.stringify(groups));
      }
      const boundingSphere = this.boundingSphere;
      if (boundingSphere !== null) {
        data.data.boundingSphere = {
          center: boundingSphere.center.toArray(),
          radius: boundingSphere.radius
        };
      }
      return data;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(source) {
      this.index = null;
      this.attributes = {};
      this.morphAttributes = {};
      this.groups = [];
      this.boundingBox = null;
      this.boundingSphere = null;
      const data = {};
      this.name = source.name;
      const index = source.index;
      if (index !== null) {
        this.setIndex(index.clone(data));
      }
      const attributes = source.attributes;
      for (const name in attributes) {
        const attribute = attributes[name];
        this.setAttribute(name, attribute.clone(data));
      }
      const morphAttributes = source.morphAttributes;
      for (const name in morphAttributes) {
        const array = [];
        const morphAttribute = morphAttributes[name];
        for (let i = 0, l = morphAttribute.length; i < l; i++) {
          array.push(morphAttribute[i].clone(data));
        }
        this.morphAttributes[name] = array;
      }
      this.morphTargetsRelative = source.morphTargetsRelative;
      const groups = source.groups;
      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        this.addGroup(group.start, group.count, group.materialIndex);
      }
      const boundingBox = source.boundingBox;
      if (boundingBox !== null) {
        this.boundingBox = boundingBox.clone();
      }
      const boundingSphere = source.boundingSphere;
      if (boundingSphere !== null) {
        this.boundingSphere = boundingSphere.clone();
      }
      this.drawRange.start = source.drawRange.start;
      this.drawRange.count = source.drawRange.count;
      this.userData = source.userData;
      return this;
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }
  const _inverseMatrix$3 = /* @__PURE__ */ new Matrix4();
  const _ray$3$1 = /* @__PURE__ */ new Ray();
  const _sphere$6 = /* @__PURE__ */ new Sphere();
  const _sphereHitAt = /* @__PURE__ */ new Vector3();
  const _vA$1 = /* @__PURE__ */ new Vector3();
  const _vB$1 = /* @__PURE__ */ new Vector3();
  const _vC$1 = /* @__PURE__ */ new Vector3();
  const _tempA = /* @__PURE__ */ new Vector3();
  const _morphA = /* @__PURE__ */ new Vector3();
  const _intersectionPoint = /* @__PURE__ */ new Vector3();
  const _intersectionPointWorld = /* @__PURE__ */ new Vector3();
  class Mesh extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {
      super();
      this.isMesh = true;
      this.type = "Mesh";
      this.geometry = geometry;
      this.material = material;
      this.updateMorphTargets();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      if (source.morphTargetInfluences !== void 0) {
        this.morphTargetInfluences = source.morphTargetInfluences.slice();
      }
      if (source.morphTargetDictionary !== void 0) {
        this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);
      }
      this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
      this.geometry = source.geometry;
      return this;
    }
    updateMorphTargets() {
      const geometry = this.geometry;
      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);
      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];
        if (morphAttribute !== void 0) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};
          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);
            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
    getVertexPosition(index, target) {
      const geometry = this.geometry;
      const position = geometry.attributes.position;
      const morphPosition = geometry.morphAttributes.position;
      const morphTargetsRelative = geometry.morphTargetsRelative;
      target.fromBufferAttribute(position, index);
      const morphInfluences = this.morphTargetInfluences;
      if (morphPosition && morphInfluences) {
        _morphA.set(0, 0, 0);
        for (let i = 0, il = morphPosition.length; i < il; i++) {
          const influence = morphInfluences[i];
          const morphAttribute = morphPosition[i];
          if (influence === 0) continue;
          _tempA.fromBufferAttribute(morphAttribute, index);
          if (morphTargetsRelative) {
            _morphA.addScaledVector(_tempA, influence);
          } else {
            _morphA.addScaledVector(_tempA.sub(target), influence);
          }
        }
        target.add(_morphA);
      }
      return target;
    }
    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const material = this.material;
      const matrixWorld = this.matrixWorld;
      if (material === void 0) return;
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      _sphere$6.copy(geometry.boundingSphere);
      _sphere$6.applyMatrix4(matrixWorld);
      _ray$3$1.copy(raycaster.ray).recast(raycaster.near);
      if (_sphere$6.containsPoint(_ray$3$1.origin) === false) {
        if (_ray$3$1.intersectSphere(_sphere$6, _sphereHitAt) === null) return;
        if (_ray$3$1.origin.distanceToSquared(_sphereHitAt) > (raycaster.far - raycaster.near) ** 2) return;
      }
      _inverseMatrix$3.copy(matrixWorld).invert();
      _ray$3$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$3);
      if (geometry.boundingBox !== null) {
        if (_ray$3$1.intersectsBox(geometry.boundingBox) === false) return;
      }
      this._computeIntersections(raycaster, intersects, _ray$3$1);
    }
    _computeIntersections(raycaster, intersects, rayLocalSpace) {
      let intersection;
      const geometry = this.geometry;
      const material = this.material;
      const index = geometry.index;
      const position = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      const uv1 = geometry.attributes.uv1;
      const normal = geometry.attributes.normal;
      const groups = geometry.groups;
      const drawRange = geometry.drawRange;
      if (index !== null) {
        if (Array.isArray(material)) {
          for (let i = 0, il = groups.length; i < il; i++) {
            const group = groups[i];
            const groupMaterial = material[group.materialIndex];
            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(index.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
            for (let j = start, jl = end; j < jl; j += 3) {
              const a = index.getX(j);
              const b = index.getX(j + 1);
              const c = index.getX(j + 2);
              intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
              if (intersection) {
                intersection.faceIndex = Math.floor(j / 3);
                intersection.face.materialIndex = group.materialIndex;
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end = Math.min(index.count, drawRange.start + drawRange.count);
          for (let i = start, il = end; i < il; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);
            intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
            if (intersection) {
              intersection.faceIndex = Math.floor(i / 3);
              intersects.push(intersection);
            }
          }
        }
      } else if (position !== void 0) {
        if (Array.isArray(material)) {
          for (let i = 0, il = groups.length; i < il; i++) {
            const group = groups[i];
            const groupMaterial = material[group.materialIndex];
            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(position.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
            for (let j = start, jl = end; j < jl; j += 3) {
              const a = j;
              const b = j + 1;
              const c = j + 2;
              intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
              if (intersection) {
                intersection.faceIndex = Math.floor(j / 3);
                intersection.face.materialIndex = group.materialIndex;
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end = Math.min(position.count, drawRange.start + drawRange.count);
          for (let i = start, il = end; i < il; i += 3) {
            const a = i;
            const b = i + 1;
            const c = i + 2;
            intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
            if (intersection) {
              intersection.faceIndex = Math.floor(i / 3);
              intersects.push(intersection);
            }
          }
        }
      }
    }
  }
  function checkIntersection$1(object, material, raycaster, ray, pA, pB, pC, point) {
    let intersect2;
    if (material.side === BackSide) {
      intersect2 = ray.intersectTriangle(pC, pB, pA, true, point);
    } else {
      intersect2 = ray.intersectTriangle(pA, pB, pC, material.side === FrontSide, point);
    }
    if (intersect2 === null) return null;
    _intersectionPointWorld.copy(point);
    _intersectionPointWorld.applyMatrix4(object.matrixWorld);
    const distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);
    if (distance < raycaster.near || distance > raycaster.far) return null;
    return {
      distance,
      point: _intersectionPointWorld.clone(),
      object
    };
  }
  function checkGeometryIntersection(object, material, raycaster, ray, uv, uv1, normal, a, b, c) {
    object.getVertexPosition(a, _vA$1);
    object.getVertexPosition(b, _vB$1);
    object.getVertexPosition(c, _vC$1);
    const intersection = checkIntersection$1(object, material, raycaster, ray, _vA$1, _vB$1, _vC$1, _intersectionPoint);
    if (intersection) {
      const barycoord = new Vector3();
      Triangle.getBarycoord(_intersectionPoint, _vA$1, _vB$1, _vC$1, barycoord);
      if (uv) {
        intersection.uv = Triangle.getInterpolatedAttribute(uv, a, b, c, barycoord, new Vector2());
      }
      if (uv1) {
        intersection.uv1 = Triangle.getInterpolatedAttribute(uv1, a, b, c, barycoord, new Vector2());
      }
      if (normal) {
        intersection.normal = Triangle.getInterpolatedAttribute(normal, a, b, c, barycoord, new Vector3());
        if (intersection.normal.dot(ray.direction) > 0) {
          intersection.normal.multiplyScalar(-1);
        }
      }
      const face = {
        a,
        b,
        c,
        normal: new Vector3(),
        materialIndex: 0
      };
      Triangle.getNormal(_vA$1, _vB$1, _vC$1, face.normal);
      intersection.face = face;
      intersection.barycoord = barycoord;
    }
    return intersection;
  }
  function cloneUniforms(src) {
    const dst = {};
    for (const u in src) {
      dst[u] = {};
      for (const p in src[u]) {
        const property = src[u][p];
        if (property && (property.isColor || property.isMatrix3 || property.isMatrix4 || property.isVector2 || property.isVector3 || property.isVector4 || property.isTexture || property.isQuaternion)) {
          if (property.isRenderTargetTexture) {
            console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().");
            dst[u][p] = null;
          } else {
            dst[u][p] = property.clone();
          }
        } else if (Array.isArray(property)) {
          dst[u][p] = property.slice();
        } else {
          dst[u][p] = property;
        }
      }
    }
    return dst;
  }
  function cloneUniformsGroups(src) {
    const dst = [];
    for (let u = 0; u < src.length; u++) {
      dst.push(src[u].clone());
    }
    return dst;
  }
  var default_vertex = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}";
  var default_fragment = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}";
  class ShaderMaterial extends Material {
    static get type() {
      return "ShaderMaterial";
    }
    constructor(parameters) {
      super();
      this.isShaderMaterial = true;
      this.defines = {};
      this.uniforms = {};
      this.uniformsGroups = [];
      this.vertexShader = default_vertex;
      this.fragmentShader = default_fragment;
      this.linewidth = 1;
      this.wireframe = false;
      this.wireframeLinewidth = 1;
      this.fog = false;
      this.lights = false;
      this.clipping = false;
      this.forceSinglePass = true;
      this.extensions = {
        clipCullDistance: false,
        // set to use vertex shader clipping
        multiDraw: false
        // set to use vertex shader multi_draw / enable gl_DrawID
      };
      this.defaultAttributeValues = {
        "color": [1, 1, 1],
        "uv": [0, 0],
        "uv1": [0, 0]
      };
      this.index0AttributeName = void 0;
      this.uniformsNeedUpdate = false;
      this.glslVersion = null;
      if (parameters !== void 0) {
        this.setValues(parameters);
      }
    }
    copy(source) {
      super.copy(source);
      this.fragmentShader = source.fragmentShader;
      this.vertexShader = source.vertexShader;
      this.uniforms = cloneUniforms(source.uniforms);
      this.uniformsGroups = cloneUniformsGroups(source.uniformsGroups);
      this.defines = Object.assign({}, source.defines);
      this.wireframe = source.wireframe;
      this.wireframeLinewidth = source.wireframeLinewidth;
      this.fog = source.fog;
      this.lights = source.lights;
      this.clipping = source.clipping;
      this.extensions = Object.assign({}, source.extensions);
      this.glslVersion = source.glslVersion;
      return this;
    }
    toJSON(meta) {
      const data = super.toJSON(meta);
      data.glslVersion = this.glslVersion;
      data.uniforms = {};
      for (const name in this.uniforms) {
        const uniform = this.uniforms[name];
        const value = uniform.value;
        if (value && value.isTexture) {
          data.uniforms[name] = {
            type: "t",
            value: value.toJSON(meta).uuid
          };
        } else if (value && value.isColor) {
          data.uniforms[name] = {
            type: "c",
            value: value.getHex()
          };
        } else if (value && value.isVector2) {
          data.uniforms[name] = {
            type: "v2",
            value: value.toArray()
          };
        } else if (value && value.isVector3) {
          data.uniforms[name] = {
            type: "v3",
            value: value.toArray()
          };
        } else if (value && value.isVector4) {
          data.uniforms[name] = {
            type: "v4",
            value: value.toArray()
          };
        } else if (value && value.isMatrix3) {
          data.uniforms[name] = {
            type: "m3",
            value: value.toArray()
          };
        } else if (value && value.isMatrix4) {
          data.uniforms[name] = {
            type: "m4",
            value: value.toArray()
          };
        } else {
          data.uniforms[name] = {
            value
          };
        }
      }
      if (Object.keys(this.defines).length > 0) data.defines = this.defines;
      data.vertexShader = this.vertexShader;
      data.fragmentShader = this.fragmentShader;
      data.lights = this.lights;
      data.clipping = this.clipping;
      const extensions = {};
      for (const key in this.extensions) {
        if (this.extensions[key] === true) extensions[key] = true;
      }
      if (Object.keys(extensions).length > 0) data.extensions = extensions;
      return data;
    }
  }
  class Camera extends Object3D {
    constructor() {
      super();
      this.isCamera = true;
      this.type = "Camera";
      this.matrixWorldInverse = new Matrix4();
      this.projectionMatrix = new Matrix4();
      this.projectionMatrixInverse = new Matrix4();
      this.coordinateSystem = WebGLCoordinateSystem;
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.matrixWorldInverse.copy(source.matrixWorldInverse);
      this.projectionMatrix.copy(source.projectionMatrix);
      this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
      this.coordinateSystem = source.coordinateSystem;
      return this;
    }
    getWorldDirection(target) {
      return super.getWorldDirection(target).negate();
    }
    updateMatrixWorld(force) {
      super.updateMatrixWorld(force);
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(updateParents, updateChildren) {
      super.updateWorldMatrix(updateParents, updateChildren);
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const _v3$1 = /* @__PURE__ */ new Vector3();
  const _minTarget = /* @__PURE__ */ new Vector2();
  const _maxTarget = /* @__PURE__ */ new Vector2();
  class PerspectiveCamera extends Camera {
    constructor(fov = 50, aspect = 1, near = 0.1, far = 2e3) {
      super();
      this.isPerspectiveCamera = true;
      this.type = "PerspectiveCamera";
      this.fov = fov;
      this.zoom = 1;
      this.near = near;
      this.far = far;
      this.focus = 10;
      this.aspect = aspect;
      this.view = null;
      this.filmGauge = 35;
      this.filmOffset = 0;
      this.updateProjectionMatrix();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.fov = source.fov;
      this.zoom = source.zoom;
      this.near = source.near;
      this.far = source.far;
      this.focus = source.focus;
      this.aspect = source.aspect;
      this.view = source.view === null ? null : Object.assign({}, source.view);
      this.filmGauge = source.filmGauge;
      this.filmOffset = source.filmOffset;
      return this;
    }
    /**
     * Sets the FOV by focal length in respect to the current .filmGauge.
     *
     * The default film gauge is 35, so that the focal length can be specified for
     * a 35mm (full frame) camera.
     *
     * Values for focal length and film gauge must have the same unit.
     */
    setFocalLength(focalLength) {
      const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;
      this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope);
      this.updateProjectionMatrix();
    }
    /**
     * Calculates the focal length from the current .fov and .filmGauge.
     */
    getFocalLength() {
      const vExtentSlope = Math.tan(DEG2RAD * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / vExtentSlope;
    }
    getEffectiveFOV() {
      return RAD2DEG * 2 * Math.atan(
        Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom
      );
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    /**
     * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
     * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
     */
    getViewBounds(distance, minTarget, maxTarget) {
      _v3$1.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse);
      minTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z);
      _v3$1.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse);
      maxTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z);
    }
    /**
     * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
     * Copies the result into the target Vector2, where x is width and y is height.
     */
    getViewSize(distance, target) {
      this.getViewBounds(distance, _minTarget, _maxTarget);
      return target.subVectors(_maxTarget, _minTarget);
    }
    /**
     * Sets an offset in a larger frustum. This is useful for multi-window or
     * multi-monitor/multi-machine setups.
     *
     * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
     * the monitors are in grid like this
     *
     *   +---+---+---+
     *   | A | B | C |
     *   +---+---+---+
     *   | D | E | F |
     *   +---+---+---+
     *
     * then for each monitor you would call it like this
     *
     *   const w = 1920;
     *   const h = 1080;
     *   const fullWidth = w * 3;
     *   const fullHeight = h * 2;
     *
     *   --A--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
     *   --B--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
     *   --C--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
     *   --D--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
     *   --E--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
     *   --F--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
     *
     *   Note there is no reason monitors have to be the same size or in a grid.
     */
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      this.aspect = fullWidth / fullHeight;
      if (this.view === null) {
        this.view = {
          enabled: true,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1
        };
      }
      this.view.enabled = true;
      this.view.fullWidth = fullWidth;
      this.view.fullHeight = fullHeight;
      this.view.offsetX = x;
      this.view.offsetY = y;
      this.view.width = width;
      this.view.height = height;
      this.updateProjectionMatrix();
    }
    clearViewOffset() {
      if (this.view !== null) {
        this.view.enabled = false;
      }
      this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const near = this.near;
      let top = near * Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom;
      let height = 2 * top;
      let width = this.aspect * height;
      let left = -0.5 * width;
      const view = this.view;
      if (this.view !== null && this.view.enabled) {
        const fullWidth = view.fullWidth, fullHeight = view.fullHeight;
        left += view.offsetX * width / fullWidth;
        top -= view.offsetY * height / fullHeight;
        width *= view.width / fullWidth;
        height *= view.height / fullHeight;
      }
      const skew = this.filmOffset;
      if (skew !== 0) left += near * skew / this.getFilmWidth();
      this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem);
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(meta) {
      const data = super.toJSON(meta);
      data.object.fov = this.fov;
      data.object.zoom = this.zoom;
      data.object.near = this.near;
      data.object.far = this.far;
      data.object.focus = this.focus;
      data.object.aspect = this.aspect;
      if (this.view !== null) data.object.view = Object.assign({}, this.view);
      data.object.filmGauge = this.filmGauge;
      data.object.filmOffset = this.filmOffset;
      return data;
    }
  }
  const _vector1 = /* @__PURE__ */ new Vector3();
  const _vector2 = /* @__PURE__ */ new Vector3();
  const _normalMatrix = /* @__PURE__ */ new Matrix3();
  class Plane {
    constructor(normal = new Vector3(1, 0, 0), constant = 0) {
      this.isPlane = true;
      this.normal = normal;
      this.constant = constant;
    }
    set(normal, constant) {
      this.normal.copy(normal);
      this.constant = constant;
      return this;
    }
    setComponents(x, y, z, w) {
      this.normal.set(x, y, z);
      this.constant = w;
      return this;
    }
    setFromNormalAndCoplanarPoint(normal, point) {
      this.normal.copy(normal);
      this.constant = -point.dot(this.normal);
      return this;
    }
    setFromCoplanarPoints(a, b, c) {
      const normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();
      this.setFromNormalAndCoplanarPoint(normal, a);
      return this;
    }
    copy(plane) {
      this.normal.copy(plane.normal);
      this.constant = plane.constant;
      return this;
    }
    normalize() {
      const inverseNormalLength = 1 / this.normal.length();
      this.normal.multiplyScalar(inverseNormalLength);
      this.constant *= inverseNormalLength;
      return this;
    }
    negate() {
      this.constant *= -1;
      this.normal.negate();
      return this;
    }
    distanceToPoint(point) {
      return this.normal.dot(point) + this.constant;
    }
    distanceToSphere(sphere) {
      return this.distanceToPoint(sphere.center) - sphere.radius;
    }
    projectPoint(point, target) {
      return target.copy(point).addScaledVector(this.normal, -this.distanceToPoint(point));
    }
    intersectLine(line, target) {
      const direction = line.delta(_vector1);
      const denominator = this.normal.dot(direction);
      if (denominator === 0) {
        if (this.distanceToPoint(line.start) === 0) {
          return target.copy(line.start);
        }
        return null;
      }
      const t = -(line.start.dot(this.normal) + this.constant) / denominator;
      if (t < 0 || t > 1) {
        return null;
      }
      return target.copy(line.start).addScaledVector(direction, t);
    }
    intersectsLine(line) {
      const startSign = this.distanceToPoint(line.start);
      const endSign = this.distanceToPoint(line.end);
      return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
    }
    intersectsBox(box) {
      return box.intersectsPlane(this);
    }
    intersectsSphere(sphere) {
      return sphere.intersectsPlane(this);
    }
    coplanarPoint(target) {
      return target.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(matrix, optionalNormalMatrix) {
      const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);
      const referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);
      const normal = this.normal.applyMatrix3(normalMatrix).normalize();
      this.constant = -referencePoint.dot(normal);
      return this;
    }
    translate(offset) {
      this.constant -= offset.dot(this.normal);
      return this;
    }
    equals(plane) {
      return plane.normal.equals(this.normal) && plane.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const _sphere$5 = /* @__PURE__ */ new Sphere();
  const _vector$7 = /* @__PURE__ */ new Vector3();
  class Frustum {
    constructor(p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane()) {
      this.planes = [p0, p1, p2, p3, p4, p5];
    }
    set(p0, p1, p2, p3, p4, p5) {
      const planes = this.planes;
      planes[0].copy(p0);
      planes[1].copy(p1);
      planes[2].copy(p2);
      planes[3].copy(p3);
      planes[4].copy(p4);
      planes[5].copy(p5);
      return this;
    }
    copy(frustum) {
      const planes = this.planes;
      for (let i = 0; i < 6; i++) {
        planes[i].copy(frustum.planes[i]);
      }
      return this;
    }
    setFromProjectionMatrix(m, coordinateSystem = WebGLCoordinateSystem) {
      const planes = this.planes;
      const me = m.elements;
      const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
      const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
      const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
      const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
      planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
      planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
      planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
      planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
      planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
      if (coordinateSystem === WebGLCoordinateSystem) {
        planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        planes[5].setComponents(me2, me6, me10, me14).normalize();
      } else {
        throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + coordinateSystem);
      }
      return this;
    }
    intersectsObject(object) {
      if (object.boundingSphere !== void 0) {
        if (object.boundingSphere === null) object.computeBoundingSphere();
        _sphere$5.copy(object.boundingSphere).applyMatrix4(object.matrixWorld);
      } else {
        const geometry = object.geometry;
        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
        _sphere$5.copy(geometry.boundingSphere).applyMatrix4(object.matrixWorld);
      }
      return this.intersectsSphere(_sphere$5);
    }
    intersectsSprite(sprite) {
      _sphere$5.center.set(0, 0, 0);
      _sphere$5.radius = 0.7071067811865476;
      _sphere$5.applyMatrix4(sprite.matrixWorld);
      return this.intersectsSphere(_sphere$5);
    }
    intersectsSphere(sphere) {
      const planes = this.planes;
      const center = sphere.center;
      const negRadius = -sphere.radius;
      for (let i = 0; i < 6; i++) {
        const distance = planes[i].distanceToPoint(center);
        if (distance < negRadius) {
          return false;
        }
      }
      return true;
    }
    intersectsBox(box) {
      const planes = this.planes;
      for (let i = 0; i < 6; i++) {
        const plane = planes[i];
        _vector$7.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector$7.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector$7.z = plane.normal.z > 0 ? box.max.z : box.min.z;
        if (plane.distanceToPoint(_vector$7) < 0) {
          return false;
        }
      }
      return true;
    }
    containsPoint(point) {
      const planes = this.planes;
      for (let i = 0; i < 6; i++) {
        if (planes[i].distanceToPoint(point) < 0) {
          return false;
        }
      }
      return true;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class PlaneGeometry extends BufferGeometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
      super();
      this.type = "PlaneGeometry";
      this.parameters = {
        width,
        height,
        widthSegments,
        heightSegments
      };
      const width_half = width / 2;
      const height_half = height / 2;
      const gridX = Math.floor(widthSegments);
      const gridY = Math.floor(heightSegments);
      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;
      const segment_width = width / gridX;
      const segment_height = height / gridY;
      const indices = [];
      const vertices = [];
      const normals = [];
      const uvs = [];
      for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segment_height - height_half;
        for (let ix = 0; ix < gridX1; ix++) {
          const x = ix * segment_width - width_half;
          vertices.push(x, -y, 0);
          normals.push(0, 0, 1);
          uvs.push(ix / gridX);
          uvs.push(1 - iy / gridY);
        }
      }
      for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
          const a = ix + gridX1 * iy;
          const b = ix + gridX1 * (iy + 1);
          const c = ix + 1 + gridX1 * (iy + 1);
          const d = ix + 1 + gridX1 * iy;
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
      this.setIndex(indices);
      this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
      this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
      this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    }
    copy(source) {
      super.copy(source);
      this.parameters = Object.assign({}, source.parameters);
      return this;
    }
    static fromJSON(data) {
      return new PlaneGeometry(data.width, data.height, data.widthSegments, data.heightSegments);
    }
  }
  class OrthographicCamera extends Camera {
    constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2e3) {
      super();
      this.isOrthographicCamera = true;
      this.type = "OrthographicCamera";
      this.zoom = 1;
      this.view = null;
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
      this.near = near;
      this.far = far;
      this.updateProjectionMatrix();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.left = source.left;
      this.right = source.right;
      this.top = source.top;
      this.bottom = source.bottom;
      this.near = source.near;
      this.far = source.far;
      this.zoom = source.zoom;
      this.view = source.view === null ? null : Object.assign({}, source.view);
      return this;
    }
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      if (this.view === null) {
        this.view = {
          enabled: true,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1
        };
      }
      this.view.enabled = true;
      this.view.fullWidth = fullWidth;
      this.view.fullHeight = fullHeight;
      this.view.offsetX = x;
      this.view.offsetY = y;
      this.view.width = width;
      this.view.height = height;
      this.updateProjectionMatrix();
    }
    clearViewOffset() {
      if (this.view !== null) {
        this.view.enabled = false;
      }
      this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const dx = (this.right - this.left) / (2 * this.zoom);
      const dy = (this.top - this.bottom) / (2 * this.zoom);
      const cx = (this.right + this.left) / 2;
      const cy = (this.top + this.bottom) / 2;
      let left = cx - dx;
      let right = cx + dx;
      let top = cy + dy;
      let bottom = cy - dy;
      if (this.view !== null && this.view.enabled) {
        const scaleW = (this.right - this.left) / this.view.fullWidth / this.zoom;
        const scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        left += scaleW * this.view.offsetX;
        right = left + scaleW * this.view.width;
        top -= scaleH * this.view.offsetY;
        bottom = top - scaleH * this.view.height;
      }
      this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem);
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(meta) {
      const data = super.toJSON(meta);
      data.object.zoom = this.zoom;
      data.object.left = this.left;
      data.object.right = this.right;
      data.object.top = this.top;
      data.object.bottom = this.bottom;
      data.object.near = this.near;
      data.object.far = this.far;
      if (this.view !== null) data.object.view = Object.assign({}, this.view);
      return data;
    }
  }
  function contain(texture, aspect) {
    const imageAspect = texture.image && texture.image.width ? texture.image.width / texture.image.height : 1;
    if (imageAspect > aspect) {
      texture.repeat.x = 1;
      texture.repeat.y = imageAspect / aspect;
      texture.offset.x = 0;
      texture.offset.y = (1 - texture.repeat.y) / 2;
    } else {
      texture.repeat.x = aspect / imageAspect;
      texture.repeat.y = 1;
      texture.offset.x = (1 - texture.repeat.x) / 2;
      texture.offset.y = 0;
    }
    return texture;
  }
  function cover(texture, aspect) {
    const imageAspect = texture.image && texture.image.width ? texture.image.width / texture.image.height : 1;
    if (imageAspect > aspect) {
      texture.repeat.x = aspect / imageAspect;
      texture.repeat.y = 1;
      texture.offset.x = (1 - texture.repeat.x) / 2;
      texture.offset.y = 0;
    } else {
      texture.repeat.x = 1;
      texture.repeat.y = imageAspect / aspect;
      texture.offset.x = 0;
      texture.offset.y = (1 - texture.repeat.y) / 2;
    }
    return texture;
  }
  function fill(texture) {
    texture.repeat.x = 1;
    texture.repeat.y = 1;
    texture.offset.x = 0;
    texture.offset.y = 0;
    return texture;
  }
  function getByteLength(width, height, format, type) {
    const typeByteLength = getTextureTypeByteLength(type);
    switch (format) {
      // https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
      case AlphaFormat:
        return width * height;
      case LuminanceFormat:
        return width * height;
      case LuminanceAlphaFormat:
        return width * height * 2;
      case RedFormat:
        return width * height / typeByteLength.components * typeByteLength.byteLength;
      case RedIntegerFormat:
        return width * height / typeByteLength.components * typeByteLength.byteLength;
      case RGFormat:
        return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
      case RGIntegerFormat:
        return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
      case RGBFormat:
        return width * height * 3 / typeByteLength.components * typeByteLength.byteLength;
      case RGBAFormat:
        return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
      case RGBAIntegerFormat:
        return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
      // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
      case RGB_S3TC_DXT1_Format:
      case RGBA_S3TC_DXT1_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
      case RGBA_S3TC_DXT3_Format:
      case RGBA_S3TC_DXT5_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
      case RGB_PVRTC_2BPPV1_Format:
      case RGBA_PVRTC_2BPPV1_Format:
        return Math.max(width, 16) * Math.max(height, 8) / 4;
      case RGB_PVRTC_4BPPV1_Format:
      case RGBA_PVRTC_4BPPV1_Format:
        return Math.max(width, 8) * Math.max(height, 8) / 2;
      // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
      case RGB_ETC1_Format:
      case RGB_ETC2_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
      case RGBA_ETC2_EAC_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      // https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
      case RGBA_ASTC_4x4_Format:
        return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
      case RGBA_ASTC_5x4_Format:
        return Math.floor((width + 4) / 5) * Math.floor((height + 3) / 4) * 16;
      case RGBA_ASTC_5x5_Format:
        return Math.floor((width + 4) / 5) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_6x5_Format:
        return Math.floor((width + 5) / 6) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_6x6_Format:
        return Math.floor((width + 5) / 6) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_8x5_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_8x6_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_8x8_Format:
        return Math.floor((width + 7) / 8) * Math.floor((height + 7) / 8) * 16;
      case RGBA_ASTC_10x5_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 4) / 5) * 16;
      case RGBA_ASTC_10x6_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 5) / 6) * 16;
      case RGBA_ASTC_10x8_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 7) / 8) * 16;
      case RGBA_ASTC_10x10_Format:
        return Math.floor((width + 9) / 10) * Math.floor((height + 9) / 10) * 16;
      case RGBA_ASTC_12x10_Format:
        return Math.floor((width + 11) / 12) * Math.floor((height + 9) / 10) * 16;
      case RGBA_ASTC_12x12_Format:
        return Math.floor((width + 11) / 12) * Math.floor((height + 11) / 12) * 16;
      // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
      case RGBA_BPTC_Format:
      case RGB_BPTC_SIGNED_Format:
      case RGB_BPTC_UNSIGNED_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
      // https://registry.khronos.org/webgl/extensions/EXT_texture_compression_rgtc/
      case RED_RGTC1_Format:
      case SIGNED_RED_RGTC1_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 8;
      case RED_GREEN_RGTC2_Format:
      case SIGNED_RED_GREEN_RGTC2_Format:
        return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
    }
    throw new Error(
      `Unable to determine texture byte length for ${format} format.`
    );
  }
  function getTextureTypeByteLength(type) {
    switch (type) {
      case UnsignedByteType:
      case ByteType:
        return { byteLength: 1, components: 1 };
      case UnsignedShortType:
      case ShortType:
      case HalfFloatType:
        return { byteLength: 2, components: 1 };
      case UnsignedShort4444Type:
      case UnsignedShort5551Type:
        return { byteLength: 2, components: 4 };
      case UnsignedIntType:
      case IntType:
      case FloatType:
        return { byteLength: 4, components: 1 };
      case UnsignedInt5999Type:
        return { byteLength: 4, components: 3 };
    }
    throw new Error(`Unknown texture type ${type}.`);
  }
  const TextureUtils = {
    contain,
    cover,
    fill,
    getByteLength
  };
  class Group extends Object3D {
    constructor() {
      super();
      this.isGroup = true;
      this.type = "Group";
    }
  }
  class InterleavedBuffer {
    constructor(array, stride) {
      this.isInterleavedBuffer = true;
      this.array = array;
      this.stride = stride;
      this.count = array !== void 0 ? array.length / stride : 0;
      this.usage = StaticDrawUsage;
      this.updateRanges = [];
      this.version = 0;
      this.uuid = generateUUID();
    }
    onUploadCallback() {
    }
    set needsUpdate(value) {
      if (value === true) this.version++;
    }
    setUsage(value) {
      this.usage = value;
      return this;
    }
    addUpdateRange(start, count) {
      this.updateRanges.push({ start, count });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(source) {
      this.array = new source.array.constructor(source.array);
      this.count = source.count;
      this.stride = source.stride;
      this.usage = source.usage;
      return this;
    }
    copyAt(index1, attribute, index2) {
      index1 *= this.stride;
      index2 *= attribute.stride;
      for (let i = 0, l = this.stride; i < l; i++) {
        this.array[index1 + i] = attribute.array[index2 + i];
      }
      return this;
    }
    set(value, offset = 0) {
      this.array.set(value, offset);
      return this;
    }
    clone(data) {
      if (data.arrayBuffers === void 0) {
        data.arrayBuffers = {};
      }
      if (this.array.buffer._uuid === void 0) {
        this.array.buffer._uuid = generateUUID();
      }
      if (data.arrayBuffers[this.array.buffer._uuid] === void 0) {
        data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
      }
      const array = new this.array.constructor(data.arrayBuffers[this.array.buffer._uuid]);
      const ib = new this.constructor(array, this.stride);
      ib.setUsage(this.usage);
      return ib;
    }
    onUpload(callback) {
      this.onUploadCallback = callback;
      return this;
    }
    toJSON(data) {
      if (data.arrayBuffers === void 0) {
        data.arrayBuffers = {};
      }
      if (this.array.buffer._uuid === void 0) {
        this.array.buffer._uuid = generateUUID();
      }
      if (data.arrayBuffers[this.array.buffer._uuid] === void 0) {
        data.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));
      }
      return {
        uuid: this.uuid,
        buffer: this.array.buffer._uuid,
        type: this.array.constructor.name,
        stride: this.stride
      };
    }
  }
  const _vector$6 = /* @__PURE__ */ new Vector3();
  class InterleavedBufferAttribute {
    constructor(interleavedBuffer, itemSize, offset, normalized = false) {
      this.isInterleavedBufferAttribute = true;
      this.name = "";
      this.data = interleavedBuffer;
      this.itemSize = itemSize;
      this.offset = offset;
      this.normalized = normalized;
    }
    get count() {
      return this.data.count;
    }
    get array() {
      return this.data.array;
    }
    set needsUpdate(value) {
      this.data.needsUpdate = value;
    }
    applyMatrix4(m) {
      for (let i = 0, l = this.data.count; i < l; i++) {
        _vector$6.fromBufferAttribute(this, i);
        _vector$6.applyMatrix4(m);
        this.setXYZ(i, _vector$6.x, _vector$6.y, _vector$6.z);
      }
      return this;
    }
    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$6.fromBufferAttribute(this, i);
        _vector$6.applyNormalMatrix(m);
        this.setXYZ(i, _vector$6.x, _vector$6.y, _vector$6.z);
      }
      return this;
    }
    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$6.fromBufferAttribute(this, i);
        _vector$6.transformDirection(m);
        this.setXYZ(i, _vector$6.x, _vector$6.y, _vector$6.z);
      }
      return this;
    }
    getComponent(index, component) {
      let value = this.array[index * this.data.stride + this.offset + component];
      if (this.normalized) value = denormalize(value, this.array);
      return value;
    }
    setComponent(index, component, value) {
      if (this.normalized) value = normalize(value, this.array);
      this.data.array[index * this.data.stride + this.offset + component] = value;
      return this;
    }
    setX(index, x) {
      if (this.normalized) x = normalize(x, this.array);
      this.data.array[index * this.data.stride + this.offset] = x;
      return this;
    }
    setY(index, y) {
      if (this.normalized) y = normalize(y, this.array);
      this.data.array[index * this.data.stride + this.offset + 1] = y;
      return this;
    }
    setZ(index, z) {
      if (this.normalized) z = normalize(z, this.array);
      this.data.array[index * this.data.stride + this.offset + 2] = z;
      return this;
    }
    setW(index, w) {
      if (this.normalized) w = normalize(w, this.array);
      this.data.array[index * this.data.stride + this.offset + 3] = w;
      return this;
    }
    getX(index) {
      let x = this.data.array[index * this.data.stride + this.offset];
      if (this.normalized) x = denormalize(x, this.array);
      return x;
    }
    getY(index) {
      let y = this.data.array[index * this.data.stride + this.offset + 1];
      if (this.normalized) y = denormalize(y, this.array);
      return y;
    }
    getZ(index) {
      let z = this.data.array[index * this.data.stride + this.offset + 2];
      if (this.normalized) z = denormalize(z, this.array);
      return z;
    }
    getW(index) {
      let w = this.data.array[index * this.data.stride + this.offset + 3];
      if (this.normalized) w = denormalize(w, this.array);
      return w;
    }
    setXY(index, x, y) {
      index = index * this.data.stride + this.offset;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
      }
      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;
      return this;
    }
    setXYZ(index, x, y, z) {
      index = index * this.data.stride + this.offset;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
      }
      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;
      this.data.array[index + 2] = z;
      return this;
    }
    setXYZW(index, x, y, z, w) {
      index = index * this.data.stride + this.offset;
      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
        w = normalize(w, this.array);
      }
      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;
      this.data.array[index + 2] = z;
      this.data.array[index + 3] = w;
      return this;
    }
    clone(data) {
      if (data === void 0) {
        console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
        const array = [];
        for (let i = 0; i < this.count; i++) {
          const index = i * this.data.stride + this.offset;
          for (let j = 0; j < this.itemSize; j++) {
            array.push(this.data.array[index + j]);
          }
        }
        return new BufferAttribute(new this.array.constructor(array), this.itemSize, this.normalized);
      } else {
        if (data.interleavedBuffers === void 0) {
          data.interleavedBuffers = {};
        }
        if (data.interleavedBuffers[this.data.uuid] === void 0) {
          data.interleavedBuffers[this.data.uuid] = this.data.clone(data);
        }
        return new InterleavedBufferAttribute(data.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
      }
    }
    toJSON(data) {
      if (data === void 0) {
        console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
        const array = [];
        for (let i = 0; i < this.count; i++) {
          const index = i * this.data.stride + this.offset;
          for (let j = 0; j < this.itemSize; j++) {
            array.push(this.data.array[index + j]);
          }
        }
        return {
          itemSize: this.itemSize,
          type: this.array.constructor.name,
          array,
          normalized: this.normalized
        };
      } else {
        if (data.interleavedBuffers === void 0) {
          data.interleavedBuffers = {};
        }
        if (data.interleavedBuffers[this.data.uuid] === void 0) {
          data.interleavedBuffers[this.data.uuid] = this.data.toJSON(data);
        }
        return {
          isInterleavedBufferAttribute: true,
          itemSize: this.itemSize,
          data: this.data.uuid,
          offset: this.offset,
          normalized: this.normalized
        };
      }
    }
  }
  const _basePosition = /* @__PURE__ */ new Vector3();
  const _skinIndex = /* @__PURE__ */ new Vector4();
  const _skinWeight = /* @__PURE__ */ new Vector4();
  const _vector3 = /* @__PURE__ */ new Vector3();
  const _matrix4 = /* @__PURE__ */ new Matrix4();
  const _vertex = /* @__PURE__ */ new Vector3();
  const _sphere$4 = /* @__PURE__ */ new Sphere();
  const _inverseMatrix$2 = /* @__PURE__ */ new Matrix4();
  const _ray$2$1 = /* @__PURE__ */ new Ray();
  class SkinnedMesh extends Mesh {
    constructor(geometry, material) {
      super(geometry, material);
      this.isSkinnedMesh = true;
      this.type = "SkinnedMesh";
      this.bindMode = AttachedBindMode;
      this.bindMatrix = new Matrix4();
      this.bindMatrixInverse = new Matrix4();
      this.boundingBox = null;
      this.boundingSphere = null;
    }
    computeBoundingBox() {
      const geometry = this.geometry;
      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }
      this.boundingBox.makeEmpty();
      const positionAttribute = geometry.getAttribute("position");
      for (let i = 0; i < positionAttribute.count; i++) {
        this.getVertexPosition(i, _vertex);
        this.boundingBox.expandByPoint(_vertex);
      }
    }
    computeBoundingSphere() {
      const geometry = this.geometry;
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }
      this.boundingSphere.makeEmpty();
      const positionAttribute = geometry.getAttribute("position");
      for (let i = 0; i < positionAttribute.count; i++) {
        this.getVertexPosition(i, _vertex);
        this.boundingSphere.expandByPoint(_vertex);
      }
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.bindMode = source.bindMode;
      this.bindMatrix.copy(source.bindMatrix);
      this.bindMatrixInverse.copy(source.bindMatrixInverse);
      this.skeleton = source.skeleton;
      if (source.boundingBox !== null) this.boundingBox = source.boundingBox.clone();
      if (source.boundingSphere !== null) this.boundingSphere = source.boundingSphere.clone();
      return this;
    }
    raycast(raycaster, intersects) {
      const material = this.material;
      const matrixWorld = this.matrixWorld;
      if (material === void 0) return;
      if (this.boundingSphere === null) this.computeBoundingSphere();
      _sphere$4.copy(this.boundingSphere);
      _sphere$4.applyMatrix4(matrixWorld);
      if (raycaster.ray.intersectsSphere(_sphere$4) === false) return;
      _inverseMatrix$2.copy(matrixWorld).invert();
      _ray$2$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$2);
      if (this.boundingBox !== null) {
        if (_ray$2$1.intersectsBox(this.boundingBox) === false) return;
      }
      this._computeIntersections(raycaster, intersects, _ray$2$1);
    }
    getVertexPosition(index, target) {
      super.getVertexPosition(index, target);
      this.applyBoneTransform(index, target);
      return target;
    }
    bind(skeleton, bindMatrix) {
      this.skeleton = skeleton;
      if (bindMatrix === void 0) {
        this.updateMatrixWorld(true);
        this.skeleton.calculateInverses();
        bindMatrix = this.matrixWorld;
      }
      this.bindMatrix.copy(bindMatrix);
      this.bindMatrixInverse.copy(bindMatrix).invert();
    }
    pose() {
      this.skeleton.pose();
    }
    normalizeSkinWeights() {
      const vector = new Vector4();
      const skinWeight = this.geometry.attributes.skinWeight;
      for (let i = 0, l = skinWeight.count; i < l; i++) {
        vector.fromBufferAttribute(skinWeight, i);
        const scale = 1 / vector.manhattanLength();
        if (scale !== Infinity) {
          vector.multiplyScalar(scale);
        } else {
          vector.set(1, 0, 0, 0);
        }
        skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
      }
    }
    updateMatrixWorld(force) {
      super.updateMatrixWorld(force);
      if (this.bindMode === AttachedBindMode) {
        this.bindMatrixInverse.copy(this.matrixWorld).invert();
      } else if (this.bindMode === DetachedBindMode) {
        this.bindMatrixInverse.copy(this.bindMatrix).invert();
      } else {
        console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
      }
    }
    applyBoneTransform(index, vector) {
      const skeleton = this.skeleton;
      const geometry = this.geometry;
      _skinIndex.fromBufferAttribute(geometry.attributes.skinIndex, index);
      _skinWeight.fromBufferAttribute(geometry.attributes.skinWeight, index);
      _basePosition.copy(vector).applyMatrix4(this.bindMatrix);
      vector.set(0, 0, 0);
      for (let i = 0; i < 4; i++) {
        const weight = _skinWeight.getComponent(i);
        if (weight !== 0) {
          const boneIndex = _skinIndex.getComponent(i);
          _matrix4.multiplyMatrices(skeleton.bones[boneIndex].matrixWorld, skeleton.boneInverses[boneIndex]);
          vector.addScaledVector(_vector3.copy(_basePosition).applyMatrix4(_matrix4), weight);
        }
      }
      return vector.applyMatrix4(this.bindMatrixInverse);
    }
  }
  class Bone extends Object3D {
    constructor() {
      super();
      this.isBone = true;
      this.type = "Bone";
    }
  }
  class DataTexture extends Texture {
    constructor(data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace) {
      super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);
      this.isDataTexture = true;
      this.image = { data, width, height };
      this.generateMipmaps = false;
      this.flipY = false;
      this.unpackAlignment = 1;
    }
  }
  const _offsetMatrix = /* @__PURE__ */ new Matrix4();
  const _identityMatrix$1 = /* @__PURE__ */ new Matrix4();
  class Skeleton {
    constructor(bones = [], boneInverses = []) {
      this.uuid = generateUUID();
      this.bones = bones.slice(0);
      this.boneInverses = boneInverses;
      this.boneMatrices = null;
      this.boneTexture = null;
      this.init();
    }
    init() {
      const bones = this.bones;
      const boneInverses = this.boneInverses;
      this.boneMatrices = new Float32Array(bones.length * 16);
      if (boneInverses.length === 0) {
        this.calculateInverses();
      } else {
        if (bones.length !== boneInverses.length) {
          console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.");
          this.boneInverses = [];
          for (let i = 0, il = this.bones.length; i < il; i++) {
            this.boneInverses.push(new Matrix4());
          }
        }
      }
    }
    calculateInverses() {
      this.boneInverses.length = 0;
      for (let i = 0, il = this.bones.length; i < il; i++) {
        const inverse = new Matrix4();
        if (this.bones[i]) {
          inverse.copy(this.bones[i].matrixWorld).invert();
        }
        this.boneInverses.push(inverse);
      }
    }
    pose() {
      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];
        if (bone) {
          bone.matrixWorld.copy(this.boneInverses[i]).invert();
        }
      }
      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];
        if (bone) {
          if (bone.parent && bone.parent.isBone) {
            bone.matrix.copy(bone.parent.matrixWorld).invert();
            bone.matrix.multiply(bone.matrixWorld);
          } else {
            bone.matrix.copy(bone.matrixWorld);
          }
          bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
        }
      }
    }
    update() {
      const bones = this.bones;
      const boneInverses = this.boneInverses;
      const boneMatrices = this.boneMatrices;
      const boneTexture = this.boneTexture;
      for (let i = 0, il = bones.length; i < il; i++) {
        const matrix = bones[i] ? bones[i].matrixWorld : _identityMatrix$1;
        _offsetMatrix.multiplyMatrices(matrix, boneInverses[i]);
        _offsetMatrix.toArray(boneMatrices, i * 16);
      }
      if (boneTexture !== null) {
        boneTexture.needsUpdate = true;
      }
    }
    clone() {
      return new Skeleton(this.bones, this.boneInverses);
    }
    computeBoneTexture() {
      let size = Math.sqrt(this.bones.length * 4);
      size = Math.ceil(size / 4) * 4;
      size = Math.max(size, 4);
      const boneMatrices = new Float32Array(size * size * 4);
      boneMatrices.set(this.boneMatrices);
      const boneTexture = new DataTexture(boneMatrices, size, size, RGBAFormat, FloatType);
      boneTexture.needsUpdate = true;
      this.boneMatrices = boneMatrices;
      this.boneTexture = boneTexture;
      return this;
    }
    getBoneByName(name) {
      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];
        if (bone.name === name) {
          return bone;
        }
      }
      return void 0;
    }
    dispose() {
      if (this.boneTexture !== null) {
        this.boneTexture.dispose();
        this.boneTexture = null;
      }
    }
    fromJSON(json, bones) {
      this.uuid = json.uuid;
      for (let i = 0, l = json.bones.length; i < l; i++) {
        const uuid = json.bones[i];
        let bone = bones[uuid];
        if (bone === void 0) {
          console.warn("THREE.Skeleton: No bone found with UUID:", uuid);
          bone = new Bone();
        }
        this.bones.push(bone);
        this.boneInverses.push(new Matrix4().fromArray(json.boneInverses[i]));
      }
      this.init();
      return this;
    }
    toJSON() {
      const data = {
        metadata: {
          version: 4.6,
          type: "Skeleton",
          generator: "Skeleton.toJSON"
        },
        bones: [],
        boneInverses: []
      };
      data.uuid = this.uuid;
      const bones = this.bones;
      const boneInverses = this.boneInverses;
      for (let i = 0, l = bones.length; i < l; i++) {
        const bone = bones[i];
        data.bones.push(bone.uuid);
        const boneInverse = boneInverses[i];
        data.boneInverses.push(boneInverse.toArray());
      }
      return data;
    }
  }
  class InstancedBufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized, meshPerAttribute = 1) {
      super(array, itemSize, normalized);
      this.isInstancedBufferAttribute = true;
      this.meshPerAttribute = meshPerAttribute;
    }
    copy(source) {
      super.copy(source);
      this.meshPerAttribute = source.meshPerAttribute;
      return this;
    }
    toJSON() {
      const data = super.toJSON();
      data.meshPerAttribute = this.meshPerAttribute;
      data.isInstancedBufferAttribute = true;
      return data;
    }
  }
  const _instanceLocalMatrix = /* @__PURE__ */ new Matrix4();
  const _instanceWorldMatrix = /* @__PURE__ */ new Matrix4();
  const _instanceIntersects = [];
  const _box3 = /* @__PURE__ */ new Box3();
  const _identity = /* @__PURE__ */ new Matrix4();
  const _mesh$1 = /* @__PURE__ */ new Mesh();
  const _sphere$3 = /* @__PURE__ */ new Sphere();
  class InstancedMesh extends Mesh {
    constructor(geometry, material, count) {
      super(geometry, material);
      this.isInstancedMesh = true;
      this.instanceMatrix = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
      this.instanceColor = null;
      this.morphTexture = null;
      this.count = count;
      this.boundingBox = null;
      this.boundingSphere = null;
      for (let i = 0; i < count; i++) {
        this.setMatrixAt(i, _identity);
      }
    }
    computeBoundingBox() {
      const geometry = this.geometry;
      const count = this.count;
      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }
      if (geometry.boundingBox === null) {
        geometry.computeBoundingBox();
      }
      this.boundingBox.makeEmpty();
      for (let i = 0; i < count; i++) {
        this.getMatrixAt(i, _instanceLocalMatrix);
        _box3.copy(geometry.boundingBox).applyMatrix4(_instanceLocalMatrix);
        this.boundingBox.union(_box3);
      }
    }
    computeBoundingSphere() {
      const geometry = this.geometry;
      const count = this.count;
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }
      if (geometry.boundingSphere === null) {
        geometry.computeBoundingSphere();
      }
      this.boundingSphere.makeEmpty();
      for (let i = 0; i < count; i++) {
        this.getMatrixAt(i, _instanceLocalMatrix);
        _sphere$3.copy(geometry.boundingSphere).applyMatrix4(_instanceLocalMatrix);
        this.boundingSphere.union(_sphere$3);
      }
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.instanceMatrix.copy(source.instanceMatrix);
      if (source.morphTexture !== null) this.morphTexture = source.morphTexture.clone();
      if (source.instanceColor !== null) this.instanceColor = source.instanceColor.clone();
      this.count = source.count;
      if (source.boundingBox !== null) this.boundingBox = source.boundingBox.clone();
      if (source.boundingSphere !== null) this.boundingSphere = source.boundingSphere.clone();
      return this;
    }
    getColorAt(index, color) {
      color.fromArray(this.instanceColor.array, index * 3);
    }
    getMatrixAt(index, matrix) {
      matrix.fromArray(this.instanceMatrix.array, index * 16);
    }
    getMorphAt(index, object) {
      const objectInfluences = object.morphTargetInfluences;
      const array = this.morphTexture.source.data.data;
      const len = objectInfluences.length + 1;
      const dataIndex = index * len + 1;
      for (let i = 0; i < objectInfluences.length; i++) {
        objectInfluences[i] = array[dataIndex + i];
      }
    }
    raycast(raycaster, intersects) {
      const matrixWorld = this.matrixWorld;
      const raycastTimes = this.count;
      _mesh$1.geometry = this.geometry;
      _mesh$1.material = this.material;
      if (_mesh$1.material === void 0) return;
      if (this.boundingSphere === null) this.computeBoundingSphere();
      _sphere$3.copy(this.boundingSphere);
      _sphere$3.applyMatrix4(matrixWorld);
      if (raycaster.ray.intersectsSphere(_sphere$3) === false) return;
      for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
        this.getMatrixAt(instanceId, _instanceLocalMatrix);
        _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);
        _mesh$1.matrixWorld = _instanceWorldMatrix;
        _mesh$1.raycast(raycaster, _instanceIntersects);
        for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
          const intersect2 = _instanceIntersects[i];
          intersect2.instanceId = instanceId;
          intersect2.object = this;
          intersects.push(intersect2);
        }
        _instanceIntersects.length = 0;
      }
    }
    setColorAt(index, color) {
      if (this.instanceColor === null) {
        this.instanceColor = new InstancedBufferAttribute(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3);
      }
      color.toArray(this.instanceColor.array, index * 3);
    }
    setMatrixAt(index, matrix) {
      matrix.toArray(this.instanceMatrix.array, index * 16);
    }
    setMorphAt(index, object) {
      const objectInfluences = object.morphTargetInfluences;
      const len = objectInfluences.length + 1;
      if (this.morphTexture === null) {
        this.morphTexture = new DataTexture(new Float32Array(len * this.count), len, this.count, RedFormat, FloatType);
      }
      const array = this.morphTexture.source.data.data;
      let morphInfluencesSum = 0;
      for (let i = 0; i < objectInfluences.length; i++) {
        morphInfluencesSum += objectInfluences[i];
      }
      const morphBaseInfluence = this.geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;
      const dataIndex = len * index;
      array[dataIndex] = morphBaseInfluence;
      array.set(objectInfluences, dataIndex + 1);
    }
    updateMorphTargets() {
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
      if (this.morphTexture !== null) {
        this.morphTexture.dispose();
        this.morphTexture = null;
      }
      return this;
    }
  }
  class LineBasicMaterial extends Material {
    static get type() {
      return "LineBasicMaterial";
    }
    constructor(parameters) {
      super();
      this.isLineBasicMaterial = true;
      this.color = new Color(16777215);
      this.map = null;
      this.linewidth = 1;
      this.linecap = "round";
      this.linejoin = "round";
      this.fog = true;
      this.setValues(parameters);
    }
    copy(source) {
      super.copy(source);
      this.color.copy(source.color);
      this.map = source.map;
      this.linewidth = source.linewidth;
      this.linecap = source.linecap;
      this.linejoin = source.linejoin;
      this.fog = source.fog;
      return this;
    }
  }
  const _vStart = /* @__PURE__ */ new Vector3();
  const _vEnd = /* @__PURE__ */ new Vector3();
  const _inverseMatrix$1 = /* @__PURE__ */ new Matrix4();
  const _ray$1$1 = /* @__PURE__ */ new Ray();
  const _sphere$1 = /* @__PURE__ */ new Sphere();
  const _intersectPointOnRay = /* @__PURE__ */ new Vector3();
  const _intersectPointOnSegment = /* @__PURE__ */ new Vector3();
  class Line extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new LineBasicMaterial()) {
      super();
      this.isLine = true;
      this.type = "Line";
      this.geometry = geometry;
      this.material = material;
      this.updateMorphTargets();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
      this.geometry = source.geometry;
      return this;
    }
    computeLineDistances() {
      const geometry = this.geometry;
      if (geometry.index === null) {
        const positionAttribute = geometry.attributes.position;
        const lineDistances = [0];
        for (let i = 1, l = positionAttribute.count; i < l; i++) {
          _vStart.fromBufferAttribute(positionAttribute, i - 1);
          _vEnd.fromBufferAttribute(positionAttribute, i);
          lineDistances[i] = lineDistances[i - 1];
          lineDistances[i] += _vStart.distanceTo(_vEnd);
        }
        geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
      } else {
        console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
      }
      return this;
    }
    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const matrixWorld = this.matrixWorld;
      const threshold = raycaster.params.Line.threshold;
      const drawRange = geometry.drawRange;
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      _sphere$1.copy(geometry.boundingSphere);
      _sphere$1.applyMatrix4(matrixWorld);
      _sphere$1.radius += threshold;
      if (raycaster.ray.intersectsSphere(_sphere$1) === false) return;
      _inverseMatrix$1.copy(matrixWorld).invert();
      _ray$1$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$1);
      const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
      const localThresholdSq = localThreshold * localThreshold;
      const step = this.isLineSegments ? 2 : 1;
      const index = geometry.index;
      const attributes = geometry.attributes;
      const positionAttribute = attributes.position;
      if (index !== null) {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(index.count, drawRange.start + drawRange.count);
        for (let i = start, l = end - 1; i < l; i += step) {
          const a = index.getX(i);
          const b = index.getX(i + 1);
          const intersect2 = checkIntersection(this, raycaster, _ray$1$1, localThresholdSq, a, b);
          if (intersect2) {
            intersects.push(intersect2);
          }
        }
        if (this.isLineLoop) {
          const a = index.getX(end - 1);
          const b = index.getX(start);
          const intersect2 = checkIntersection(this, raycaster, _ray$1$1, localThresholdSq, a, b);
          if (intersect2) {
            intersects.push(intersect2);
          }
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
        for (let i = start, l = end - 1; i < l; i += step) {
          const intersect2 = checkIntersection(this, raycaster, _ray$1$1, localThresholdSq, i, i + 1);
          if (intersect2) {
            intersects.push(intersect2);
          }
        }
        if (this.isLineLoop) {
          const intersect2 = checkIntersection(this, raycaster, _ray$1$1, localThresholdSq, end - 1, start);
          if (intersect2) {
            intersects.push(intersect2);
          }
        }
      }
    }
    updateMorphTargets() {
      const geometry = this.geometry;
      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);
      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];
        if (morphAttribute !== void 0) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};
          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);
            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
  }
  function checkIntersection(object, raycaster, ray, thresholdSq, a, b) {
    const positionAttribute = object.geometry.attributes.position;
    _vStart.fromBufferAttribute(positionAttribute, a);
    _vEnd.fromBufferAttribute(positionAttribute, b);
    const distSq = ray.distanceSqToSegment(_vStart, _vEnd, _intersectPointOnRay, _intersectPointOnSegment);
    if (distSq > thresholdSq) return;
    _intersectPointOnRay.applyMatrix4(object.matrixWorld);
    const distance = raycaster.ray.origin.distanceTo(_intersectPointOnRay);
    if (distance < raycaster.near || distance > raycaster.far) return;
    return {
      distance,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: _intersectPointOnSegment.clone().applyMatrix4(object.matrixWorld),
      index: a,
      face: null,
      faceIndex: null,
      barycoord: null,
      object
    };
  }
  const _start = /* @__PURE__ */ new Vector3();
  const _end = /* @__PURE__ */ new Vector3();
  class LineSegments extends Line {
    constructor(geometry, material) {
      super(geometry, material);
      this.isLineSegments = true;
      this.type = "LineSegments";
    }
    computeLineDistances() {
      const geometry = this.geometry;
      if (geometry.index === null) {
        const positionAttribute = geometry.attributes.position;
        const lineDistances = [];
        for (let i = 0, l = positionAttribute.count; i < l; i += 2) {
          _start.fromBufferAttribute(positionAttribute, i);
          _end.fromBufferAttribute(positionAttribute, i + 1);
          lineDistances[i] = i === 0 ? 0 : lineDistances[i - 1];
          lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);
        }
        geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
      } else {
        console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
      }
      return this;
    }
  }
  class LineLoop extends Line {
    constructor(geometry, material) {
      super(geometry, material);
      this.isLineLoop = true;
      this.type = "LineLoop";
    }
  }
  class PointsMaterial extends Material {
    static get type() {
      return "PointsMaterial";
    }
    constructor(parameters) {
      super();
      this.isPointsMaterial = true;
      this.color = new Color(16777215);
      this.map = null;
      this.alphaMap = null;
      this.size = 1;
      this.sizeAttenuation = true;
      this.fog = true;
      this.setValues(parameters);
    }
    copy(source) {
      super.copy(source);
      this.color.copy(source.color);
      this.map = source.map;
      this.alphaMap = source.alphaMap;
      this.size = source.size;
      this.sizeAttenuation = source.sizeAttenuation;
      this.fog = source.fog;
      return this;
    }
  }
  const _inverseMatrix = /* @__PURE__ */ new Matrix4();
  const _ray$4 = /* @__PURE__ */ new Ray();
  const _sphere$2 = /* @__PURE__ */ new Sphere();
  const _position$2 = /* @__PURE__ */ new Vector3();
  class Points extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new PointsMaterial()) {
      super();
      this.isPoints = true;
      this.type = "Points";
      this.geometry = geometry;
      this.material = material;
      this.updateMorphTargets();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
      this.geometry = source.geometry;
      return this;
    }
    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const matrixWorld = this.matrixWorld;
      const threshold = raycaster.params.Points.threshold;
      const drawRange = geometry.drawRange;
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      _sphere$2.copy(geometry.boundingSphere);
      _sphere$2.applyMatrix4(matrixWorld);
      _sphere$2.radius += threshold;
      if (raycaster.ray.intersectsSphere(_sphere$2) === false) return;
      _inverseMatrix.copy(matrixWorld).invert();
      _ray$4.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
      const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
      const localThresholdSq = localThreshold * localThreshold;
      const index = geometry.index;
      const attributes = geometry.attributes;
      const positionAttribute = attributes.position;
      if (index !== null) {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(index.count, drawRange.start + drawRange.count);
        for (let i = start, il = end; i < il; i++) {
          const a = index.getX(i);
          _position$2.fromBufferAttribute(positionAttribute, a);
          testPoint(_position$2, a, localThresholdSq, matrixWorld, raycaster, intersects, this);
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
        for (let i = start, l = end; i < l; i++) {
          _position$2.fromBufferAttribute(positionAttribute, i);
          testPoint(_position$2, i, localThresholdSq, matrixWorld, raycaster, intersects, this);
        }
      }
    }
    updateMorphTargets() {
      const geometry = this.geometry;
      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);
      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];
        if (morphAttribute !== void 0) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};
          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);
            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
  }
  function testPoint(point, index, localThresholdSq, matrixWorld, raycaster, intersects, object) {
    const rayPointDistanceSq = _ray$4.distanceSqToPoint(point);
    if (rayPointDistanceSq < localThresholdSq) {
      const intersectPoint = new Vector3();
      _ray$4.closestPointToPoint(point, intersectPoint);
      intersectPoint.applyMatrix4(matrixWorld);
      const distance = raycaster.ray.origin.distanceTo(intersectPoint);
      if (distance < raycaster.near || distance > raycaster.far) return;
      intersects.push({
        distance,
        distanceToRay: Math.sqrt(rayPointDistanceSq),
        point: intersectPoint,
        index,
        face: null,
        faceIndex: null,
        barycoord: null,
        object
      });
    }
  }
  class MeshStandardMaterial extends Material {
    static get type() {
      return "MeshStandardMaterial";
    }
    constructor(parameters) {
      super();
      this.isMeshStandardMaterial = true;
      this.defines = { "STANDARD": "" };
      this.color = new Color(16777215);
      this.roughness = 1;
      this.metalness = 0;
      this.map = null;
      this.lightMap = null;
      this.lightMapIntensity = 1;
      this.aoMap = null;
      this.aoMapIntensity = 1;
      this.emissive = new Color(0);
      this.emissiveIntensity = 1;
      this.emissiveMap = null;
      this.bumpMap = null;
      this.bumpScale = 1;
      this.normalMap = null;
      this.normalMapType = TangentSpaceNormalMap;
      this.normalScale = new Vector2(1, 1);
      this.displacementMap = null;
      this.displacementScale = 1;
      this.displacementBias = 0;
      this.roughnessMap = null;
      this.metalnessMap = null;
      this.alphaMap = null;
      this.envMap = null;
      this.envMapRotation = new Euler();
      this.envMapIntensity = 1;
      this.wireframe = false;
      this.wireframeLinewidth = 1;
      this.wireframeLinecap = "round";
      this.wireframeLinejoin = "round";
      this.flatShading = false;
      this.fog = true;
      this.setValues(parameters);
    }
    copy(source) {
      super.copy(source);
      this.defines = { "STANDARD": "" };
      this.color.copy(source.color);
      this.roughness = source.roughness;
      this.metalness = source.metalness;
      this.map = source.map;
      this.lightMap = source.lightMap;
      this.lightMapIntensity = source.lightMapIntensity;
      this.aoMap = source.aoMap;
      this.aoMapIntensity = source.aoMapIntensity;
      this.emissive.copy(source.emissive);
      this.emissiveMap = source.emissiveMap;
      this.emissiveIntensity = source.emissiveIntensity;
      this.bumpMap = source.bumpMap;
      this.bumpScale = source.bumpScale;
      this.normalMap = source.normalMap;
      this.normalMapType = source.normalMapType;
      this.normalScale.copy(source.normalScale);
      this.displacementMap = source.displacementMap;
      this.displacementScale = source.displacementScale;
      this.displacementBias = source.displacementBias;
      this.roughnessMap = source.roughnessMap;
      this.metalnessMap = source.metalnessMap;
      this.alphaMap = source.alphaMap;
      this.envMap = source.envMap;
      this.envMapRotation.copy(source.envMapRotation);
      this.envMapIntensity = source.envMapIntensity;
      this.wireframe = source.wireframe;
      this.wireframeLinewidth = source.wireframeLinewidth;
      this.wireframeLinecap = source.wireframeLinecap;
      this.wireframeLinejoin = source.wireframeLinejoin;
      this.flatShading = source.flatShading;
      this.fog = source.fog;
      return this;
    }
  }
  class MeshPhysicalMaterial extends MeshStandardMaterial {
    static get type() {
      return "MeshPhysicalMaterial";
    }
    constructor(parameters) {
      super();
      this.isMeshPhysicalMaterial = true;
      this.defines = {
        "STANDARD": "",
        "PHYSICAL": ""
      };
      this.anisotropyRotation = 0;
      this.anisotropyMap = null;
      this.clearcoatMap = null;
      this.clearcoatRoughness = 0;
      this.clearcoatRoughnessMap = null;
      this.clearcoatNormalScale = new Vector2(1, 1);
      this.clearcoatNormalMap = null;
      this.ior = 1.5;
      Object.defineProperty(this, "reflectivity", {
        get: function() {
          return clamp(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
        },
        set: function(reflectivity) {
          this.ior = (1 + 0.4 * reflectivity) / (1 - 0.4 * reflectivity);
        }
      });
      this.iridescenceMap = null;
      this.iridescenceIOR = 1.3;
      this.iridescenceThicknessRange = [100, 400];
      this.iridescenceThicknessMap = null;
      this.sheenColor = new Color(0);
      this.sheenColorMap = null;
      this.sheenRoughness = 1;
      this.sheenRoughnessMap = null;
      this.transmissionMap = null;
      this.thickness = 0;
      this.thicknessMap = null;
      this.attenuationDistance = Infinity;
      this.attenuationColor = new Color(1, 1, 1);
      this.specularIntensity = 1;
      this.specularIntensityMap = null;
      this.specularColor = new Color(1, 1, 1);
      this.specularColorMap = null;
      this._anisotropy = 0;
      this._clearcoat = 0;
      this._dispersion = 0;
      this._iridescence = 0;
      this._sheen = 0;
      this._transmission = 0;
      this.setValues(parameters);
    }
    get anisotropy() {
      return this._anisotropy;
    }
    set anisotropy(value) {
      if (this._anisotropy > 0 !== value > 0) {
        this.version++;
      }
      this._anisotropy = value;
    }
    get clearcoat() {
      return this._clearcoat;
    }
    set clearcoat(value) {
      if (this._clearcoat > 0 !== value > 0) {
        this.version++;
      }
      this._clearcoat = value;
    }
    get iridescence() {
      return this._iridescence;
    }
    set iridescence(value) {
      if (this._iridescence > 0 !== value > 0) {
        this.version++;
      }
      this._iridescence = value;
    }
    get dispersion() {
      return this._dispersion;
    }
    set dispersion(value) {
      if (this._dispersion > 0 !== value > 0) {
        this.version++;
      }
      this._dispersion = value;
    }
    get sheen() {
      return this._sheen;
    }
    set sheen(value) {
      if (this._sheen > 0 !== value > 0) {
        this.version++;
      }
      this._sheen = value;
    }
    get transmission() {
      return this._transmission;
    }
    set transmission(value) {
      if (this._transmission > 0 !== value > 0) {
        this.version++;
      }
      this._transmission = value;
    }
    copy(source) {
      super.copy(source);
      this.defines = {
        "STANDARD": "",
        "PHYSICAL": ""
      };
      this.anisotropy = source.anisotropy;
      this.anisotropyRotation = source.anisotropyRotation;
      this.anisotropyMap = source.anisotropyMap;
      this.clearcoat = source.clearcoat;
      this.clearcoatMap = source.clearcoatMap;
      this.clearcoatRoughness = source.clearcoatRoughness;
      this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
      this.clearcoatNormalMap = source.clearcoatNormalMap;
      this.clearcoatNormalScale.copy(source.clearcoatNormalScale);
      this.dispersion = source.dispersion;
      this.ior = source.ior;
      this.iridescence = source.iridescence;
      this.iridescenceMap = source.iridescenceMap;
      this.iridescenceIOR = source.iridescenceIOR;
      this.iridescenceThicknessRange = [...source.iridescenceThicknessRange];
      this.iridescenceThicknessMap = source.iridescenceThicknessMap;
      this.sheen = source.sheen;
      this.sheenColor.copy(source.sheenColor);
      this.sheenColorMap = source.sheenColorMap;
      this.sheenRoughness = source.sheenRoughness;
      this.sheenRoughnessMap = source.sheenRoughnessMap;
      this.transmission = source.transmission;
      this.transmissionMap = source.transmissionMap;
      this.thickness = source.thickness;
      this.thicknessMap = source.thicknessMap;
      this.attenuationDistance = source.attenuationDistance;
      this.attenuationColor.copy(source.attenuationColor);
      this.specularIntensity = source.specularIntensity;
      this.specularIntensityMap = source.specularIntensityMap;
      this.specularColor.copy(source.specularColor);
      this.specularColorMap = source.specularColorMap;
      return this;
    }
  }
  function convertArray(array, type, forceClone) {
    if (!array || // let 'undefined' and 'null' pass
    !forceClone && array.constructor === type) return array;
    if (typeof type.BYTES_PER_ELEMENT === "number") {
      return new type(array);
    }
    return Array.prototype.slice.call(array);
  }
  function isTypedArray(object) {
    return ArrayBuffer.isView(object) && !(object instanceof DataView);
  }
  function getKeyframeOrder(times) {
    function compareTime(i, j) {
      return times[i] - times[j];
    }
    const n = times.length;
    const result = new Array(n);
    for (let i = 0; i !== n; ++i) result[i] = i;
    result.sort(compareTime);
    return result;
  }
  function sortedArray(values, stride, order) {
    const nValues = values.length;
    const result = new values.constructor(nValues);
    for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++i) {
      const srcOffset = order[i] * stride;
      for (let j = 0; j !== stride; ++j) {
        result[dstOffset++] = values[srcOffset + j];
      }
    }
    return result;
  }
  function flattenJSON(jsonKeys, times, values, valuePropertyName) {
    let i = 1, key = jsonKeys[0];
    while (key !== void 0 && key[valuePropertyName] === void 0) {
      key = jsonKeys[i++];
    }
    if (key === void 0) return;
    let value = key[valuePropertyName];
    if (value === void 0) return;
    if (Array.isArray(value)) {
      do {
        value = key[valuePropertyName];
        if (value !== void 0) {
          times.push(key.time);
          values.push.apply(values, value);
        }
        key = jsonKeys[i++];
      } while (key !== void 0);
    } else if (value.toArray !== void 0) {
      do {
        value = key[valuePropertyName];
        if (value !== void 0) {
          times.push(key.time);
          value.toArray(values, values.length);
        }
        key = jsonKeys[i++];
      } while (key !== void 0);
    } else {
      do {
        value = key[valuePropertyName];
        if (value !== void 0) {
          times.push(key.time);
          values.push(value);
        }
        key = jsonKeys[i++];
      } while (key !== void 0);
    }
  }
  class Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      this.parameterPositions = parameterPositions;
      this._cachedIndex = 0;
      this.resultBuffer = resultBuffer !== void 0 ? resultBuffer : new sampleValues.constructor(sampleSize);
      this.sampleValues = sampleValues;
      this.valueSize = sampleSize;
      this.settings = null;
      this.DefaultSettings_ = {};
    }
    evaluate(t) {
      const pp = this.parameterPositions;
      let i1 = this._cachedIndex, t1 = pp[i1], t0 = pp[i1 - 1];
      validate_interval: {
        seek: {
          let right;
          linear_scan: {
            forward_scan: if (!(t < t1)) {
              for (let giveUpAt = i1 + 2; ; ) {
                if (t1 === void 0) {
                  if (t < t0) break forward_scan;
                  i1 = pp.length;
                  this._cachedIndex = i1;
                  return this.copySampleValue_(i1 - 1);
                }
                if (i1 === giveUpAt) break;
                t0 = t1;
                t1 = pp[++i1];
                if (t < t1) {
                  break seek;
                }
              }
              right = pp.length;
              break linear_scan;
            }
            if (!(t >= t0)) {
              const t1global = pp[1];
              if (t < t1global) {
                i1 = 2;
                t0 = t1global;
              }
              for (let giveUpAt = i1 - 2; ; ) {
                if (t0 === void 0) {
                  this._cachedIndex = 0;
                  return this.copySampleValue_(0);
                }
                if (i1 === giveUpAt) break;
                t1 = t0;
                t0 = pp[--i1 - 1];
                if (t >= t0) {
                  break seek;
                }
              }
              right = i1;
              i1 = 0;
              break linear_scan;
            }
            break validate_interval;
          }
          while (i1 < right) {
            const mid = i1 + right >>> 1;
            if (t < pp[mid]) {
              right = mid;
            } else {
              i1 = mid + 1;
            }
          }
          t1 = pp[i1];
          t0 = pp[i1 - 1];
          if (t0 === void 0) {
            this._cachedIndex = 0;
            return this.copySampleValue_(0);
          }
          if (t1 === void 0) {
            i1 = pp.length;
            this._cachedIndex = i1;
            return this.copySampleValue_(i1 - 1);
          }
        }
        this._cachedIndex = i1;
        this.intervalChanged_(i1, t0, t1);
      }
      return this.interpolate_(i1, t0, t, t1);
    }
    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(index) {
      const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset = index * stride;
      for (let i = 0; i !== stride; ++i) {
        result[i] = values[offset + i];
      }
      return result;
    }
    // Template methods for derived classes:
    interpolate_() {
      throw new Error("call to abstract method");
    }
    intervalChanged_() {
    }
  }
  class CubicInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
      this._weightPrev = -0;
      this._offsetPrev = -0;
      this._weightNext = -0;
      this._offsetNext = -0;
      this.DefaultSettings_ = {
        endingStart: ZeroCurvatureEnding,
        endingEnd: ZeroCurvatureEnding
      };
    }
    intervalChanged_(i1, t0, t1) {
      const pp = this.parameterPositions;
      let iPrev = i1 - 2, iNext = i1 + 1, tPrev = pp[iPrev], tNext = pp[iNext];
      if (tPrev === void 0) {
        switch (this.getSettings_().endingStart) {
          case ZeroSlopeEnding:
            iPrev = i1;
            tPrev = 2 * t0 - t1;
            break;
          case WrapAroundEnding:
            iPrev = pp.length - 2;
            tPrev = t0 + pp[iPrev] - pp[iPrev + 1];
            break;
          default:
            iPrev = i1;
            tPrev = t1;
        }
      }
      if (tNext === void 0) {
        switch (this.getSettings_().endingEnd) {
          case ZeroSlopeEnding:
            iNext = i1;
            tNext = 2 * t1 - t0;
            break;
          case WrapAroundEnding:
            iNext = 1;
            tNext = t1 + pp[1] - pp[0];
            break;
          default:
            iNext = i1 - 1;
            tNext = t0;
        }
      }
      const halfDt = (t1 - t0) * 0.5, stride = this.valueSize;
      this._weightPrev = halfDt / (t0 - tPrev);
      this._weightNext = halfDt / (tNext - t1);
      this._offsetPrev = iPrev * stride;
      this._offsetNext = iNext * stride;
    }
    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, o1 = i1 * stride, o0 = o1 - stride, oP = this._offsetPrev, oN = this._offsetNext, wP = this._weightPrev, wN = this._weightNext, p = (t - t0) / (t1 - t0), pp = p * p, ppp = pp * p;
      const sP = -wP * ppp + 2 * wP * pp - wP * p;
      const s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-0.5 + wP) * p + 1;
      const s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p;
      const sN = wN * ppp - wN * pp;
      for (let i = 0; i !== stride; ++i) {
        result[i] = sP * values[oP + i] + s0 * values[o0 + i] + s1 * values[o1 + i] + sN * values[oN + i];
      }
      return result;
    }
  }
  class LinearInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset1 = i1 * stride, offset0 = offset1 - stride, weight1 = (t - t0) / (t1 - t0), weight0 = 1 - weight1;
      for (let i = 0; i !== stride; ++i) {
        result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
      }
      return result;
    }
  }
  class DiscreteInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1) {
      return this.copySampleValue_(i1 - 1);
    }
  }
  class KeyframeTrack {
    constructor(name, times, values, interpolation) {
      if (name === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
      if (times === void 0 || times.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + name);
      this.name = name;
      this.times = convertArray(times, this.TimeBufferType);
      this.values = convertArray(values, this.ValueBufferType);
      this.setInterpolation(interpolation || this.DefaultInterpolation);
    }
    // Serialization (in static context, because of constructor invocation
    // and automatic invocation of .toJSON):
    static toJSON(track) {
      const trackType = track.constructor;
      let json;
      if (trackType.toJSON !== this.toJSON) {
        json = trackType.toJSON(track);
      } else {
        json = {
          "name": track.name,
          "times": convertArray(track.times, Array),
          "values": convertArray(track.values, Array)
        };
        const interpolation = track.getInterpolation();
        if (interpolation !== track.DefaultInterpolation) {
          json.interpolation = interpolation;
        }
      }
      json.type = track.ValueTypeName;
      return json;
    }
    InterpolantFactoryMethodDiscrete(result) {
      return new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    InterpolantFactoryMethodLinear(result) {
      return new LinearInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    InterpolantFactoryMethodSmooth(result) {
      return new CubicInterpolant(this.times, this.values, this.getValueSize(), result);
    }
    setInterpolation(interpolation) {
      let factoryMethod;
      switch (interpolation) {
        case InterpolateDiscrete:
          factoryMethod = this.InterpolantFactoryMethodDiscrete;
          break;
        case InterpolateLinear:
          factoryMethod = this.InterpolantFactoryMethodLinear;
          break;
        case InterpolateSmooth:
          factoryMethod = this.InterpolantFactoryMethodSmooth;
          break;
      }
      if (factoryMethod === void 0) {
        const message = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
        if (this.createInterpolant === void 0) {
          if (interpolation !== this.DefaultInterpolation) {
            this.setInterpolation(this.DefaultInterpolation);
          } else {
            throw new Error(message);
          }
        }
        console.warn("THREE.KeyframeTrack:", message);
        return this;
      }
      this.createInterpolant = factoryMethod;
      return this;
    }
    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return InterpolateDiscrete;
        case this.InterpolantFactoryMethodLinear:
          return InterpolateLinear;
        case this.InterpolantFactoryMethodSmooth:
          return InterpolateSmooth;
      }
    }
    getValueSize() {
      return this.values.length / this.times.length;
    }
    // move all keyframes either forwards or backwards in time
    shift(timeOffset) {
      if (timeOffset !== 0) {
        const times = this.times;
        for (let i = 0, n = times.length; i !== n; ++i) {
          times[i] += timeOffset;
        }
      }
      return this;
    }
    // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
    scale(timeScale) {
      if (timeScale !== 1) {
        const times = this.times;
        for (let i = 0, n = times.length; i !== n; ++i) {
          times[i] *= timeScale;
        }
      }
      return this;
    }
    // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
    // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
    trim(startTime, endTime) {
      const times = this.times, nKeys = times.length;
      let from = 0, to = nKeys - 1;
      while (from !== nKeys && times[from] < startTime) {
        ++from;
      }
      while (to !== -1 && times[to] > endTime) {
        --to;
      }
      ++to;
      if (from !== 0 || to !== nKeys) {
        if (from >= to) {
          to = Math.max(to, 1);
          from = to - 1;
        }
        const stride = this.getValueSize();
        this.times = times.slice(from, to);
        this.values = this.values.slice(from * stride, to * stride);
      }
      return this;
    }
    // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
    validate() {
      let valid = true;
      const valueSize = this.getValueSize();
      if (valueSize - Math.floor(valueSize) !== 0) {
        console.error("THREE.KeyframeTrack: Invalid value size in track.", this);
        valid = false;
      }
      const times = this.times, values = this.values, nKeys = times.length;
      if (nKeys === 0) {
        console.error("THREE.KeyframeTrack: Track is empty.", this);
        valid = false;
      }
      let prevTime = null;
      for (let i = 0; i !== nKeys; i++) {
        const currTime = times[i];
        if (typeof currTime === "number" && isNaN(currTime)) {
          console.error("THREE.KeyframeTrack: Time is not a valid number.", this, i, currTime);
          valid = false;
          break;
        }
        if (prevTime !== null && prevTime > currTime) {
          console.error("THREE.KeyframeTrack: Out of order keys.", this, i, currTime, prevTime);
          valid = false;
          break;
        }
        prevTime = currTime;
      }
      if (values !== void 0) {
        if (isTypedArray(values)) {
          for (let i = 0, n = values.length; i !== n; ++i) {
            const value = values[i];
            if (isNaN(value)) {
              console.error("THREE.KeyframeTrack: Value is not a valid number.", this, i, value);
              valid = false;
              break;
            }
          }
        }
      }
      return valid;
    }
    // removes equivalent sequential keys as common in morph target sequences
    // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
    optimize() {
      const times = this.times.slice(), values = this.values.slice(), stride = this.getValueSize(), smoothInterpolation = this.getInterpolation() === InterpolateSmooth, lastIndex = times.length - 1;
      let writeIndex = 1;
      for (let i = 1; i < lastIndex; ++i) {
        let keep = false;
        const time = times[i];
        const timeNext = times[i + 1];
        if (time !== timeNext && (i !== 1 || time !== times[0])) {
          if (!smoothInterpolation) {
            const offset = i * stride, offsetP = offset - stride, offsetN = offset + stride;
            for (let j = 0; j !== stride; ++j) {
              const value = values[offset + j];
              if (value !== values[offsetP + j] || value !== values[offsetN + j]) {
                keep = true;
                break;
              }
            }
          } else {
            keep = true;
          }
        }
        if (keep) {
          if (i !== writeIndex) {
            times[writeIndex] = times[i];
            const readOffset = i * stride, writeOffset = writeIndex * stride;
            for (let j = 0; j !== stride; ++j) {
              values[writeOffset + j] = values[readOffset + j];
            }
          }
          ++writeIndex;
        }
      }
      if (lastIndex > 0) {
        times[writeIndex] = times[lastIndex];
        for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++j) {
          values[writeOffset + j] = values[readOffset + j];
        }
        ++writeIndex;
      }
      if (writeIndex !== times.length) {
        this.times = times.slice(0, writeIndex);
        this.values = values.slice(0, writeIndex * stride);
      } else {
        this.times = times;
        this.values = values;
      }
      return this;
    }
    clone() {
      const times = this.times.slice();
      const values = this.values.slice();
      const TypedKeyframeTrack = this.constructor;
      const track = new TypedKeyframeTrack(this.name, times, values);
      track.createInterpolant = this.createInterpolant;
      return track;
    }
  }
  KeyframeTrack.prototype.TimeBufferType = Float32Array;
  KeyframeTrack.prototype.ValueBufferType = Float32Array;
  KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
  class BooleanKeyframeTrack extends KeyframeTrack {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(name, times, values) {
      super(name, times, values);
    }
  }
  BooleanKeyframeTrack.prototype.ValueTypeName = "bool";
  BooleanKeyframeTrack.prototype.ValueBufferType = Array;
  BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  class ColorKeyframeTrack extends KeyframeTrack {
  }
  ColorKeyframeTrack.prototype.ValueTypeName = "color";
  class NumberKeyframeTrack extends KeyframeTrack {
  }
  NumberKeyframeTrack.prototype.ValueTypeName = "number";
  class QuaternionLinearInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, alpha = (t - t0) / (t1 - t0);
      let offset = i1 * stride;
      for (let end = offset + stride; offset !== end; offset += 4) {
        Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);
      }
      return result;
    }
  }
  class QuaternionKeyframeTrack extends KeyframeTrack {
    InterpolantFactoryMethodLinear(result) {
      return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
    }
  }
  QuaternionKeyframeTrack.prototype.ValueTypeName = "quaternion";
  QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  class StringKeyframeTrack extends KeyframeTrack {
    // No interpolation parameter because only InterpolateDiscrete is valid.
    constructor(name, times, values) {
      super(name, times, values);
    }
  }
  StringKeyframeTrack.prototype.ValueTypeName = "string";
  StringKeyframeTrack.prototype.ValueBufferType = Array;
  StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
  class VectorKeyframeTrack extends KeyframeTrack {
  }
  VectorKeyframeTrack.prototype.ValueTypeName = "vector";
  class AnimationClip {
    constructor(name = "", duration = -1, tracks = [], blendMode = NormalAnimationBlendMode) {
      this.name = name;
      this.tracks = tracks;
      this.duration = duration;
      this.blendMode = blendMode;
      this.uuid = generateUUID();
      if (this.duration < 0) {
        this.resetDuration();
      }
    }
    static parse(json) {
      const tracks = [], jsonTracks = json.tracks, frameTime = 1 / (json.fps || 1);
      for (let i = 0, n = jsonTracks.length; i !== n; ++i) {
        tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
      }
      const clip = new this(json.name, json.duration, tracks, json.blendMode);
      clip.uuid = json.uuid;
      return clip;
    }
    static toJSON(clip) {
      const tracks = [], clipTracks = clip.tracks;
      const json = {
        "name": clip.name,
        "duration": clip.duration,
        "tracks": tracks,
        "uuid": clip.uuid,
        "blendMode": clip.blendMode
      };
      for (let i = 0, n = clipTracks.length; i !== n; ++i) {
        tracks.push(KeyframeTrack.toJSON(clipTracks[i]));
      }
      return json;
    }
    static CreateFromMorphTargetSequence(name, morphTargetSequence, fps, noLoop) {
      const numMorphTargets = morphTargetSequence.length;
      const tracks = [];
      for (let i = 0; i < numMorphTargets; i++) {
        let times = [];
        let values = [];
        times.push(
          (i + numMorphTargets - 1) % numMorphTargets,
          i,
          (i + 1) % numMorphTargets
        );
        values.push(0, 1, 0);
        const order = getKeyframeOrder(times);
        times = sortedArray(times, 1, order);
        values = sortedArray(values, 1, order);
        if (!noLoop && times[0] === 0) {
          times.push(numMorphTargets);
          values.push(values[0]);
        }
        tracks.push(
          new NumberKeyframeTrack(
            ".morphTargetInfluences[" + morphTargetSequence[i].name + "]",
            times,
            values
          ).scale(1 / fps)
        );
      }
      return new this(name, -1, tracks);
    }
    static findByName(objectOrClipArray, name) {
      let clipArray = objectOrClipArray;
      if (!Array.isArray(objectOrClipArray)) {
        const o = objectOrClipArray;
        clipArray = o.geometry && o.geometry.animations || o.animations;
      }
      for (let i = 0; i < clipArray.length; i++) {
        if (clipArray[i].name === name) {
          return clipArray[i];
        }
      }
      return null;
    }
    static CreateClipsFromMorphTargetSequences(morphTargets, fps, noLoop) {
      const animationToMorphTargets = {};
      const pattern = /^([\w-]*?)([\d]+)$/;
      for (let i = 0, il = morphTargets.length; i < il; i++) {
        const morphTarget = morphTargets[i];
        const parts = morphTarget.name.match(pattern);
        if (parts && parts.length > 1) {
          const name = parts[1];
          let animationMorphTargets = animationToMorphTargets[name];
          if (!animationMorphTargets) {
            animationToMorphTargets[name] = animationMorphTargets = [];
          }
          animationMorphTargets.push(morphTarget);
        }
      }
      const clips = [];
      for (const name in animationToMorphTargets) {
        clips.push(this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop));
      }
      return clips;
    }
    // parse the animation.hierarchy format
    static parseAnimation(animation, bones) {
      if (!animation) {
        console.error("THREE.AnimationClip: No animation in JSONLoader data.");
        return null;
      }
      const addNonemptyTrack = function(trackType, trackName, animationKeys, propertyName, destTracks) {
        if (animationKeys.length !== 0) {
          const times = [];
          const values = [];
          flattenJSON(animationKeys, times, values, propertyName);
          if (times.length !== 0) {
            destTracks.push(new trackType(trackName, times, values));
          }
        }
      };
      const tracks = [];
      const clipName = animation.name || "default";
      const fps = animation.fps || 30;
      const blendMode = animation.blendMode;
      let duration = animation.length || -1;
      const hierarchyTracks = animation.hierarchy || [];
      for (let h = 0; h < hierarchyTracks.length; h++) {
        const animationKeys = hierarchyTracks[h].keys;
        if (!animationKeys || animationKeys.length === 0) continue;
        if (animationKeys[0].morphTargets) {
          const morphTargetNames = {};
          let k;
          for (k = 0; k < animationKeys.length; k++) {
            if (animationKeys[k].morphTargets) {
              for (let m = 0; m < animationKeys[k].morphTargets.length; m++) {
                morphTargetNames[animationKeys[k].morphTargets[m]] = -1;
              }
            }
          }
          for (const morphTargetName in morphTargetNames) {
            const times = [];
            const values = [];
            for (let m = 0; m !== animationKeys[k].morphTargets.length; ++m) {
              const animationKey = animationKeys[k];
              times.push(animationKey.time);
              values.push(animationKey.morphTarget === morphTargetName ? 1 : 0);
            }
            tracks.push(new NumberKeyframeTrack(".morphTargetInfluence[" + morphTargetName + "]", times, values));
          }
          duration = morphTargetNames.length * fps;
        } else {
          const boneName = ".bones[" + bones[h].name + "]";
          addNonemptyTrack(
            VectorKeyframeTrack,
            boneName + ".position",
            animationKeys,
            "pos",
            tracks
          );
          addNonemptyTrack(
            QuaternionKeyframeTrack,
            boneName + ".quaternion",
            animationKeys,
            "rot",
            tracks
          );
          addNonemptyTrack(
            VectorKeyframeTrack,
            boneName + ".scale",
            animationKeys,
            "scl",
            tracks
          );
        }
      }
      if (tracks.length === 0) {
        return null;
      }
      const clip = new this(clipName, duration, tracks, blendMode);
      return clip;
    }
    resetDuration() {
      const tracks = this.tracks;
      let duration = 0;
      for (let i = 0, n = tracks.length; i !== n; ++i) {
        const track = this.tracks[i];
        duration = Math.max(duration, track.times[track.times.length - 1]);
      }
      this.duration = duration;
      return this;
    }
    trim() {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].trim(0, this.duration);
      }
      return this;
    }
    validate() {
      let valid = true;
      for (let i = 0; i < this.tracks.length; i++) {
        valid = valid && this.tracks[i].validate();
      }
      return valid;
    }
    optimize() {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].optimize();
      }
      return this;
    }
    clone() {
      const tracks = [];
      for (let i = 0; i < this.tracks.length; i++) {
        tracks.push(this.tracks[i].clone());
      }
      return new this.constructor(this.name, this.duration, tracks, this.blendMode);
    }
    toJSON() {
      return this.constructor.toJSON(this);
    }
  }
  function getTrackTypeForValueTypeName(typeName) {
    switch (typeName.toLowerCase()) {
      case "scalar":
      case "double":
      case "float":
      case "number":
      case "integer":
        return NumberKeyframeTrack;
      case "vector":
      case "vector2":
      case "vector3":
      case "vector4":
        return VectorKeyframeTrack;
      case "color":
        return ColorKeyframeTrack;
      case "quaternion":
        return QuaternionKeyframeTrack;
      case "bool":
      case "boolean":
        return BooleanKeyframeTrack;
      case "string":
        return StringKeyframeTrack;
    }
    throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + typeName);
  }
  function parseKeyframeTrack(json) {
    if (json.type === void 0) {
      throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
    }
    const trackType = getTrackTypeForValueTypeName(json.type);
    if (json.times === void 0) {
      const times = [], values = [];
      flattenJSON(json.keys, times, values, "value");
      json.times = times;
      json.values = values;
    }
    if (trackType.parse !== void 0) {
      return trackType.parse(json);
    } else {
      return new trackType(json.name, json.times, json.values, json.interpolation);
    }
  }
  const Cache = {
    enabled: false,
    files: {},
    add: function(key, file) {
      if (this.enabled === false) return;
      this.files[key] = file;
    },
    get: function(key) {
      if (this.enabled === false) return;
      return this.files[key];
    },
    remove: function(key) {
      delete this.files[key];
    },
    clear: function() {
      this.files = {};
    }
  };
  class LoadingManager {
    constructor(onLoad, onProgress, onError) {
      const scope = this;
      let isLoading = false;
      let itemsLoaded = 0;
      let itemsTotal = 0;
      let urlModifier = void 0;
      const handlers = [];
      this.onStart = void 0;
      this.onLoad = onLoad;
      this.onProgress = onProgress;
      this.onError = onError;
      this.itemStart = function(url) {
        itemsTotal++;
        if (isLoading === false) {
          if (scope.onStart !== void 0) {
            scope.onStart(url, itemsLoaded, itemsTotal);
          }
        }
        isLoading = true;
      };
      this.itemEnd = function(url) {
        itemsLoaded++;
        if (scope.onProgress !== void 0) {
          scope.onProgress(url, itemsLoaded, itemsTotal);
        }
        if (itemsLoaded === itemsTotal) {
          isLoading = false;
          if (scope.onLoad !== void 0) {
            scope.onLoad();
          }
        }
      };
      this.itemError = function(url) {
        if (scope.onError !== void 0) {
          scope.onError(url);
        }
      };
      this.resolveURL = function(url) {
        if (urlModifier) {
          return urlModifier(url);
        }
        return url;
      };
      this.setURLModifier = function(transform) {
        urlModifier = transform;
        return this;
      };
      this.addHandler = function(regex, loader) {
        handlers.push(regex, loader);
        return this;
      };
      this.removeHandler = function(regex) {
        const index = handlers.indexOf(regex);
        if (index !== -1) {
          handlers.splice(index, 2);
        }
        return this;
      };
      this.getHandler = function(file) {
        for (let i = 0, l = handlers.length; i < l; i += 2) {
          const regex = handlers[i];
          const loader = handlers[i + 1];
          if (regex.global) regex.lastIndex = 0;
          if (regex.test(file)) {
            return loader;
          }
        }
        return null;
      };
    }
  }
  const DefaultLoadingManager = /* @__PURE__ */ new LoadingManager();
  class Loader {
    constructor(manager) {
      this.manager = manager !== void 0 ? manager : DefaultLoadingManager;
      this.crossOrigin = "anonymous";
      this.withCredentials = false;
      this.path = "";
      this.resourcePath = "";
      this.requestHeader = {};
    }
    load() {
    }
    loadAsync(url, onProgress) {
      const scope = this;
      return new Promise(function(resolve, reject) {
        scope.load(url, resolve, onProgress, reject);
      });
    }
    parse() {
    }
    setCrossOrigin(crossOrigin) {
      this.crossOrigin = crossOrigin;
      return this;
    }
    setWithCredentials(value) {
      this.withCredentials = value;
      return this;
    }
    setPath(path) {
      this.path = path;
      return this;
    }
    setResourcePath(resourcePath) {
      this.resourcePath = resourcePath;
      return this;
    }
    setRequestHeader(requestHeader) {
      this.requestHeader = requestHeader;
      return this;
    }
  }
  Loader.DEFAULT_MATERIAL_NAME = "__DEFAULT";
  const loading = {};
  class HttpError extends Error {
    constructor(message, response) {
      super(message);
      this.response = response;
    }
  }
  class FileLoader extends Loader {
    constructor(manager) {
      super(manager);
    }
    load(url, onLoad, onProgress, onError) {
      if (url === void 0) url = "";
      if (this.path !== void 0) url = this.path + url;
      url = this.manager.resolveURL(url);
      const cached = Cache.get(url);
      if (cached !== void 0) {
        this.manager.itemStart(url);
        setTimeout(() => {
          if (onLoad) onLoad(cached);
          this.manager.itemEnd(url);
        }, 0);
        return cached;
      }
      if (loading[url] !== void 0) {
        loading[url].push({
          onLoad,
          onProgress,
          onError
        });
        return;
      }
      loading[url] = [];
      loading[url].push({
        onLoad,
        onProgress,
        onError
      });
      const req = new Request(url, {
        headers: new Headers(this.requestHeader),
        credentials: this.withCredentials ? "include" : "same-origin"
        // An abort controller could be added within a future PR
      });
      const mimeType = this.mimeType;
      const responseType = this.responseType;
      fetch(req).then((response) => {
        if (response.status === 200 || response.status === 0) {
          if (response.status === 0) {
            console.warn("THREE.FileLoader: HTTP Status 0 received.");
          }
          if (typeof ReadableStream === "undefined" || response.body === void 0 || response.body.getReader === void 0) {
            return response;
          }
          const callbacks = loading[url];
          const reader = response.body.getReader();
          const contentLength = response.headers.get("X-File-Size") || response.headers.get("Content-Length");
          const total = contentLength ? parseInt(contentLength) : 0;
          const lengthComputable = total !== 0;
          let loaded = 0;
          const stream = new ReadableStream({
            start(controller) {
              readData();
              function readData() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                  } else {
                    loaded += value.byteLength;
                    const event = new ProgressEvent("progress", { lengthComputable, loaded, total });
                    for (let i = 0, il = callbacks.length; i < il; i++) {
                      const callback = callbacks[i];
                      if (callback.onProgress) callback.onProgress(event);
                    }
                    controller.enqueue(value);
                    readData();
                  }
                }, (e) => {
                  controller.error(e);
                });
              }
            }
          });
          return new Response(stream);
        } else {
          throw new HttpError(`fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response);
        }
      }).then((response) => {
        switch (responseType) {
          case "arraybuffer":
            return response.arrayBuffer();
          case "blob":
            return response.blob();
          case "document":
            return response.text().then((text) => {
              const parser = new DOMParser();
              return parser.parseFromString(text, mimeType);
            });
          case "json":
            return response.json();
          default:
            if (mimeType === void 0) {
              return response.text();
            } else {
              const re = /charset="?([^;"\s]*)"?/i;
              const exec = re.exec(mimeType);
              const label = exec && exec[1] ? exec[1].toLowerCase() : void 0;
              const decoder = new TextDecoder(label);
              return response.arrayBuffer().then((ab) => decoder.decode(ab));
            }
        }
      }).then((data) => {
        Cache.add(url, data);
        const callbacks = loading[url];
        delete loading[url];
        for (let i = 0, il = callbacks.length; i < il; i++) {
          const callback = callbacks[i];
          if (callback.onLoad) callback.onLoad(data);
        }
      }).catch((err) => {
        const callbacks = loading[url];
        if (callbacks === void 0) {
          this.manager.itemError(url);
          throw err;
        }
        delete loading[url];
        for (let i = 0, il = callbacks.length; i < il; i++) {
          const callback = callbacks[i];
          if (callback.onError) callback.onError(err);
        }
        this.manager.itemError(url);
      }).finally(() => {
        this.manager.itemEnd(url);
      });
      this.manager.itemStart(url);
    }
    setResponseType(value) {
      this.responseType = value;
      return this;
    }
    setMimeType(value) {
      this.mimeType = value;
      return this;
    }
  }
  class ImageLoader extends Loader {
    constructor(manager) {
      super(manager);
    }
    load(url, onLoad, onProgress, onError) {
      if (this.path !== void 0) url = this.path + url;
      url = this.manager.resolveURL(url);
      const scope = this;
      const cached = Cache.get(url);
      if (cached !== void 0) {
        scope.manager.itemStart(url);
        setTimeout(function() {
          if (onLoad) onLoad(cached);
          scope.manager.itemEnd(url);
        }, 0);
        return cached;
      }
      const image = createElementNS("img");
      function onImageLoad() {
        removeEventListeners();
        Cache.add(url, this);
        if (onLoad) onLoad(this);
        scope.manager.itemEnd(url);
      }
      function onImageError(event) {
        removeEventListeners();
        if (onError) onError(event);
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      }
      function removeEventListeners() {
        image.removeEventListener("load", onImageLoad, false);
        image.removeEventListener("error", onImageError, false);
      }
      image.addEventListener("load", onImageLoad, false);
      image.addEventListener("error", onImageError, false);
      if (url.slice(0, 5) !== "data:") {
        if (this.crossOrigin !== void 0) image.crossOrigin = this.crossOrigin;
      }
      scope.manager.itemStart(url);
      image.src = url;
      return image;
    }
  }
  class TextureLoader extends Loader {
    constructor(manager) {
      super(manager);
    }
    load(url, onLoad, onProgress, onError) {
      const texture = new Texture();
      const loader = new ImageLoader(this.manager);
      loader.setCrossOrigin(this.crossOrigin);
      loader.setPath(this.path);
      loader.load(url, function(image) {
        texture.image = image;
        texture.needsUpdate = true;
        if (onLoad !== void 0) {
          onLoad(texture);
        }
      }, onProgress, onError);
      return texture;
    }
  }
  class Light extends Object3D {
    constructor(color, intensity = 1) {
      super();
      this.isLight = true;
      this.type = "Light";
      this.color = new Color(color);
      this.intensity = intensity;
    }
    dispose() {
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.color.copy(source.color);
      this.intensity = source.intensity;
      return this;
    }
    toJSON(meta) {
      const data = super.toJSON(meta);
      data.object.color = this.color.getHex();
      data.object.intensity = this.intensity;
      if (this.groundColor !== void 0) data.object.groundColor = this.groundColor.getHex();
      if (this.distance !== void 0) data.object.distance = this.distance;
      if (this.angle !== void 0) data.object.angle = this.angle;
      if (this.decay !== void 0) data.object.decay = this.decay;
      if (this.penumbra !== void 0) data.object.penumbra = this.penumbra;
      if (this.shadow !== void 0) data.object.shadow = this.shadow.toJSON();
      if (this.target !== void 0) data.object.target = this.target.uuid;
      return data;
    }
  }
  const _projScreenMatrix$1 = /* @__PURE__ */ new Matrix4();
  const _lightPositionWorld$1 = /* @__PURE__ */ new Vector3();
  const _lookTarget$1 = /* @__PURE__ */ new Vector3();
  class LightShadow {
    constructor(camera) {
      this.camera = camera;
      this.intensity = 1;
      this.bias = 0;
      this.normalBias = 0;
      this.radius = 1;
      this.blurSamples = 8;
      this.mapSize = new Vector2(512, 512);
      this.map = null;
      this.mapPass = null;
      this.matrix = new Matrix4();
      this.autoUpdate = true;
      this.needsUpdate = false;
      this._frustum = new Frustum();
      this._frameExtents = new Vector2(1, 1);
      this._viewportCount = 1;
      this._viewports = [
        new Vector4(0, 0, 1, 1)
      ];
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(light) {
      const shadowCamera = this.camera;
      const shadowMatrix = this.matrix;
      _lightPositionWorld$1.setFromMatrixPosition(light.matrixWorld);
      shadowCamera.position.copy(_lightPositionWorld$1);
      _lookTarget$1.setFromMatrixPosition(light.target.matrixWorld);
      shadowCamera.lookAt(_lookTarget$1);
      shadowCamera.updateMatrixWorld();
      _projScreenMatrix$1.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
      this._frustum.setFromProjectionMatrix(_projScreenMatrix$1);
      shadowMatrix.set(
        0.5,
        0,
        0,
        0.5,
        0,
        0.5,
        0,
        0.5,
        0,
        0,
        0.5,
        0.5,
        0,
        0,
        0,
        1
      );
      shadowMatrix.multiply(_projScreenMatrix$1);
    }
    getViewport(viewportIndex) {
      return this._viewports[viewportIndex];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      if (this.map) {
        this.map.dispose();
      }
      if (this.mapPass) {
        this.mapPass.dispose();
      }
    }
    copy(source) {
      this.camera = source.camera.clone();
      this.intensity = source.intensity;
      this.bias = source.bias;
      this.radius = source.radius;
      this.mapSize.copy(source.mapSize);
      return this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      const object = {};
      if (this.intensity !== 1) object.intensity = this.intensity;
      if (this.bias !== 0) object.bias = this.bias;
      if (this.normalBias !== 0) object.normalBias = this.normalBias;
      if (this.radius !== 1) object.radius = this.radius;
      if (this.mapSize.x !== 512 || this.mapSize.y !== 512) object.mapSize = this.mapSize.toArray();
      object.camera = this.camera.toJSON(false).object;
      delete object.camera.matrix;
      return object;
    }
  }
  class SpotLightShadow extends LightShadow {
    constructor() {
      super(new PerspectiveCamera(50, 1, 0.5, 500));
      this.isSpotLightShadow = true;
      this.focus = 1;
    }
    updateMatrices(light) {
      const camera = this.camera;
      const fov = RAD2DEG * 2 * light.angle * this.focus;
      const aspect = this.mapSize.width / this.mapSize.height;
      const far = light.distance || camera.far;
      if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {
        camera.fov = fov;
        camera.aspect = aspect;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
      super.updateMatrices(light);
    }
    copy(source) {
      super.copy(source);
      this.focus = source.focus;
      return this;
    }
  }
  class SpotLight extends Light {
    constructor(color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2) {
      super(color, intensity);
      this.isSpotLight = true;
      this.type = "SpotLight";
      this.position.copy(Object3D.DEFAULT_UP);
      this.updateMatrix();
      this.target = new Object3D();
      this.distance = distance;
      this.angle = angle;
      this.penumbra = penumbra;
      this.decay = decay;
      this.map = null;
      this.shadow = new SpotLightShadow();
    }
    get power() {
      return this.intensity * Math.PI;
    }
    set power(power) {
      this.intensity = power / Math.PI;
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.distance = source.distance;
      this.angle = source.angle;
      this.penumbra = source.penumbra;
      this.decay = source.decay;
      this.target = source.target.clone();
      this.shadow = source.shadow.clone();
      return this;
    }
  }
  const _projScreenMatrix = /* @__PURE__ */ new Matrix4();
  const _lightPositionWorld = /* @__PURE__ */ new Vector3();
  const _lookTarget = /* @__PURE__ */ new Vector3();
  class PointLightShadow extends LightShadow {
    constructor() {
      super(new PerspectiveCamera(90, 1, 0.5, 500));
      this.isPointLightShadow = true;
      this._frameExtents = new Vector2(4, 2);
      this._viewportCount = 6;
      this._viewports = [
        // These viewports map a cube-map onto a 2D texture with the
        // following orientation:
        //
        //  xzXZ
        //   y Y
        //
        // X - Positive x direction
        // x - Negative x direction
        // Y - Positive y direction
        // y - Negative y direction
        // Z - Positive z direction
        // z - Negative z direction
        // positive X
        new Vector4(2, 1, 1, 1),
        // negative X
        new Vector4(0, 1, 1, 1),
        // positive Z
        new Vector4(3, 1, 1, 1),
        // negative Z
        new Vector4(1, 1, 1, 1),
        // positive Y
        new Vector4(3, 0, 1, 1),
        // negative Y
        new Vector4(1, 0, 1, 1)
      ];
      this._cubeDirections = [
        new Vector3(1, 0, 0),
        new Vector3(-1, 0, 0),
        new Vector3(0, 0, 1),
        new Vector3(0, 0, -1),
        new Vector3(0, 1, 0),
        new Vector3(0, -1, 0)
      ];
      this._cubeUps = [
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1),
        new Vector3(0, 0, -1)
      ];
    }
    updateMatrices(light, viewportIndex = 0) {
      const camera = this.camera;
      const shadowMatrix = this.matrix;
      const far = light.distance || camera.far;
      if (far !== camera.far) {
        camera.far = far;
        camera.updateProjectionMatrix();
      }
      _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
      camera.position.copy(_lightPositionWorld);
      _lookTarget.copy(camera.position);
      _lookTarget.add(this._cubeDirections[viewportIndex]);
      camera.up.copy(this._cubeUps[viewportIndex]);
      camera.lookAt(_lookTarget);
      camera.updateMatrixWorld();
      shadowMatrix.makeTranslation(-_lightPositionWorld.x, -_lightPositionWorld.y, -_lightPositionWorld.z);
      _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this._frustum.setFromProjectionMatrix(_projScreenMatrix);
    }
  }
  class PointLight extends Light {
    constructor(color, intensity, distance = 0, decay = 2) {
      super(color, intensity);
      this.isPointLight = true;
      this.type = "PointLight";
      this.distance = distance;
      this.decay = decay;
      this.shadow = new PointLightShadow();
    }
    get power() {
      return this.intensity * 4 * Math.PI;
    }
    set power(power) {
      this.intensity = power / (4 * Math.PI);
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(source, recursive) {
      super.copy(source, recursive);
      this.distance = source.distance;
      this.decay = source.decay;
      this.shadow = source.shadow.clone();
      return this;
    }
  }
  class DirectionalLightShadow extends LightShadow {
    constructor() {
      super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
      this.isDirectionalLightShadow = true;
    }
  }
  class DirectionalLight extends Light {
    constructor(color, intensity) {
      super(color, intensity);
      this.isDirectionalLight = true;
      this.type = "DirectionalLight";
      this.position.copy(Object3D.DEFAULT_UP);
      this.updateMatrix();
      this.target = new Object3D();
      this.shadow = new DirectionalLightShadow();
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(source) {
      super.copy(source);
      this.target = source.target.clone();
      this.shadow = source.shadow.clone();
      return this;
    }
  }
  class LoaderUtils {
    static decodeText(array) {
      console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead.");
      if (typeof TextDecoder !== "undefined") {
        return new TextDecoder().decode(array);
      }
      let s = "";
      for (let i = 0, il = array.length; i < il; i++) {
        s += String.fromCharCode(array[i]);
      }
      try {
        return decodeURIComponent(escape(s));
      } catch (e) {
        return s;
      }
    }
    static extractUrlBase(url) {
      const index = url.lastIndexOf("/");
      if (index === -1) return "./";
      return url.slice(0, index + 1);
    }
    static resolveURL(url, path) {
      if (typeof url !== "string" || url === "") return "";
      if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
        path = path.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
      }
      if (/^(https?:)?\/\//i.test(url)) return url;
      if (/^data:.*,.*$/i.test(url)) return url;
      if (/^blob:.*$/i.test(url)) return url;
      return path + url;
    }
  }
  class ImageBitmapLoader extends Loader {
    constructor(manager) {
      super(manager);
      this.isImageBitmapLoader = true;
      if (typeof createImageBitmap === "undefined") {
        console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported.");
      }
      if (typeof fetch === "undefined") {
        console.warn("THREE.ImageBitmapLoader: fetch() not supported.");
      }
      this.options = { premultiplyAlpha: "none" };
    }
    setOptions(options) {
      this.options = options;
      return this;
    }
    load(url, onLoad, onProgress, onError) {
      if (url === void 0) url = "";
      if (this.path !== void 0) url = this.path + url;
      url = this.manager.resolveURL(url);
      const scope = this;
      const cached = Cache.get(url);
      if (cached !== void 0) {
        scope.manager.itemStart(url);
        if (cached.then) {
          cached.then((imageBitmap) => {
            if (onLoad) onLoad(imageBitmap);
            scope.manager.itemEnd(url);
          }).catch((e) => {
            if (onError) onError(e);
          });
          return;
        }
        setTimeout(function() {
          if (onLoad) onLoad(cached);
          scope.manager.itemEnd(url);
        }, 0);
        return cached;
      }
      const fetchOptions = {};
      fetchOptions.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include";
      fetchOptions.headers = this.requestHeader;
      const promise = fetch(url, fetchOptions).then(function(res) {
        return res.blob();
      }).then(function(blob) {
        return createImageBitmap(blob, Object.assign(scope.options, { colorSpaceConversion: "none" }));
      }).then(function(imageBitmap) {
        Cache.add(url, imageBitmap);
        if (onLoad) onLoad(imageBitmap);
        scope.manager.itemEnd(url);
        return imageBitmap;
      }).catch(function(e) {
        if (onError) onError(e);
        Cache.remove(url);
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      });
      Cache.add(url, promise);
      scope.manager.itemStart(url);
    }
  }
  class Clock {
    constructor(autoStart = true) {
      this.autoStart = autoStart;
      this.startTime = 0;
      this.oldTime = 0;
      this.elapsedTime = 0;
      this.running = false;
    }
    start() {
      this.startTime = now();
      this.oldTime = this.startTime;
      this.elapsedTime = 0;
      this.running = true;
    }
    stop() {
      this.getElapsedTime();
      this.running = false;
      this.autoStart = false;
    }
    getElapsedTime() {
      this.getDelta();
      return this.elapsedTime;
    }
    getDelta() {
      let diff = 0;
      if (this.autoStart && !this.running) {
        this.start();
        return 0;
      }
      if (this.running) {
        const newTime = now();
        diff = (newTime - this.oldTime) / 1e3;
        this.oldTime = newTime;
        this.elapsedTime += diff;
      }
      return diff;
    }
  }
  function now() {
    return performance.now();
  }
  const _RESERVED_CHARS_RE = "\\[\\]\\.:\\/";
  const _reservedRe = new RegExp("[" + _RESERVED_CHARS_RE + "]", "g");
  const _wordChar = "[^" + _RESERVED_CHARS_RE + "]";
  const _wordCharOrDot = "[^" + _RESERVED_CHARS_RE.replace("\\.", "") + "]";
  const _directoryRe = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", _wordChar);
  const _nodeRe = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", _wordCharOrDot);
  const _objectRe = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", _wordChar);
  const _propertyRe = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", _wordChar);
  const _trackRe = new RegExp(
    "^" + _directoryRe + _nodeRe + _objectRe + _propertyRe + "$"
  );
  const _supportedObjectNames = ["material", "materials", "bones", "map"];
  class Composite {
    constructor(targetGroup, path, optionalParsedPath) {
      const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);
      this._targetGroup = targetGroup;
      this._bindings = targetGroup.subscribe_(path, parsedPath);
    }
    getValue(array, offset) {
      this.bind();
      const firstValidIndex = this._targetGroup.nCachedObjects_, binding = this._bindings[firstValidIndex];
      if (binding !== void 0) binding.getValue(array, offset);
    }
    setValue(array, offset) {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
        bindings[i].setValue(array, offset);
      }
    }
    bind() {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
        bindings[i].bind();
      }
    }
    unbind() {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {
        bindings[i].unbind();
      }
    }
  }
  class PropertyBinding {
    constructor(rootNode, path, parsedPath) {
      this.path = path;
      this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);
      this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);
      this.rootNode = rootNode;
      this.getValue = this._getValue_unbound;
      this.setValue = this._setValue_unbound;
    }
    static create(root, path, parsedPath) {
      if (!(root && root.isAnimationObjectGroup)) {
        return new PropertyBinding(root, path, parsedPath);
      } else {
        return new PropertyBinding.Composite(root, path, parsedPath);
      }
    }
    /**
     * Replaces spaces with underscores and removes unsupported characters from
     * node names, to ensure compatibility with parseTrackName().
     *
     * @param {string} name Node name to be sanitized.
     * @return {string}
     */
    static sanitizeNodeName(name) {
      return name.replace(/\s/g, "_").replace(_reservedRe, "");
    }
    static parseTrackName(trackName) {
      const matches = _trackRe.exec(trackName);
      if (matches === null) {
        throw new Error("PropertyBinding: Cannot parse trackName: " + trackName);
      }
      const results = {
        // directoryName: matches[ 1 ], // (tschw) currently unused
        nodeName: matches[2],
        objectName: matches[3],
        objectIndex: matches[4],
        propertyName: matches[5],
        // required
        propertyIndex: matches[6]
      };
      const lastDot = results.nodeName && results.nodeName.lastIndexOf(".");
      if (lastDot !== void 0 && lastDot !== -1) {
        const objectName = results.nodeName.substring(lastDot + 1);
        if (_supportedObjectNames.indexOf(objectName) !== -1) {
          results.nodeName = results.nodeName.substring(0, lastDot);
          results.objectName = objectName;
        }
      }
      if (results.propertyName === null || results.propertyName.length === 0) {
        throw new Error("PropertyBinding: can not parse propertyName from trackName: " + trackName);
      }
      return results;
    }
    static findNode(root, nodeName) {
      if (nodeName === void 0 || nodeName === "" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid) {
        return root;
      }
      if (root.skeleton) {
        const bone = root.skeleton.getBoneByName(nodeName);
        if (bone !== void 0) {
          return bone;
        }
      }
      if (root.children) {
        const searchNodeSubtree = function(children) {
          for (let i = 0; i < children.length; i++) {
            const childNode = children[i];
            if (childNode.name === nodeName || childNode.uuid === nodeName) {
              return childNode;
            }
            const result = searchNodeSubtree(childNode.children);
            if (result) return result;
          }
          return null;
        };
        const subTreeNode = searchNodeSubtree(root.children);
        if (subTreeNode) {
          return subTreeNode;
        }
      }
      return null;
    }
    // these are used to "bind" a nonexistent property
    _getValue_unavailable() {
    }
    _setValue_unavailable() {
    }
    // Getters
    _getValue_direct(buffer, offset) {
      buffer[offset] = this.targetObject[this.propertyName];
    }
    _getValue_array(buffer, offset) {
      const source = this.resolvedProperty;
      for (let i = 0, n = source.length; i !== n; ++i) {
        buffer[offset++] = source[i];
      }
    }
    _getValue_arrayElement(buffer, offset) {
      buffer[offset] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(buffer, offset) {
      this.resolvedProperty.toArray(buffer, offset);
    }
    // Direct
    _setValue_direct(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
    }
    _setValue_direct_setNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
      this.targetObject.needsUpdate = true;
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
      this.targetObject.matrixWorldNeedsUpdate = true;
    }
    // EntireArray
    _setValue_array(buffer, offset) {
      const dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }
    }
    _setValue_array_setNeedsUpdate(buffer, offset) {
      const dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }
      this.targetObject.needsUpdate = true;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(buffer, offset) {
      const dest = this.resolvedProperty;
      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }
      this.targetObject.matrixWorldNeedsUpdate = true;
    }
    // ArrayElement
    _setValue_arrayElement(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
    }
    _setValue_arrayElement_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
      this.targetObject.needsUpdate = true;
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
      this.targetObject.matrixWorldNeedsUpdate = true;
    }
    // HasToFromArray
    _setValue_fromArray(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
    }
    _setValue_fromArray_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
      this.targetObject.needsUpdate = true;
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
      this.targetObject.matrixWorldNeedsUpdate = true;
    }
    _getValue_unbound(targetArray, offset) {
      this.bind();
      this.getValue(targetArray, offset);
    }
    _setValue_unbound(sourceArray, offset) {
      this.bind();
      this.setValue(sourceArray, offset);
    }
    // create getter / setter pair for a property in the scene graph
    bind() {
      let targetObject = this.node;
      const parsedPath = this.parsedPath;
      const objectName = parsedPath.objectName;
      const propertyName = parsedPath.propertyName;
      let propertyIndex = parsedPath.propertyIndex;
      if (!targetObject) {
        targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);
        this.node = targetObject;
      }
      this.getValue = this._getValue_unavailable;
      this.setValue = this._setValue_unavailable;
      if (!targetObject) {
        console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
        return;
      }
      if (objectName) {
        let objectIndex = parsedPath.objectIndex;
        switch (objectName) {
          case "materials":
            if (!targetObject.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!targetObject.material.materials) {
              console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
              return;
            }
            targetObject = targetObject.material.materials;
            break;
          case "bones":
            if (!targetObject.skeleton) {
              console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
              return;
            }
            targetObject = targetObject.skeleton.bones;
            for (let i = 0; i < targetObject.length; i++) {
              if (targetObject[i].name === objectIndex) {
                objectIndex = i;
                break;
              }
            }
            break;
          case "map":
            if ("map" in targetObject) {
              targetObject = targetObject.map;
              break;
            }
            if (!targetObject.material) {
              console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
              return;
            }
            if (!targetObject.material.map) {
              console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
              return;
            }
            targetObject = targetObject.material.map;
            break;
          default:
            if (targetObject[objectName] === void 0) {
              console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
              return;
            }
            targetObject = targetObject[objectName];
        }
        if (objectIndex !== void 0) {
          if (targetObject[objectIndex] === void 0) {
            console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, targetObject);
            return;
          }
          targetObject = targetObject[objectIndex];
        }
      }
      const nodeProperty = targetObject[propertyName];
      if (nodeProperty === void 0) {
        const nodeName = parsedPath.nodeName;
        console.error("THREE.PropertyBinding: Trying to update property for track: " + nodeName + "." + propertyName + " but it wasn't found.", targetObject);
        return;
      }
      let versioning = this.Versioning.None;
      this.targetObject = targetObject;
      if (targetObject.needsUpdate !== void 0) {
        versioning = this.Versioning.NeedsUpdate;
      } else if (targetObject.matrixWorldNeedsUpdate !== void 0) {
        versioning = this.Versioning.MatrixWorldNeedsUpdate;
      }
      let bindingType = this.BindingType.Direct;
      if (propertyIndex !== void 0) {
        if (propertyName === "morphTargetInfluences") {
          if (!targetObject.geometry) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
            return;
          }
          if (!targetObject.geometry.morphAttributes) {
            console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
            return;
          }
          if (targetObject.morphTargetDictionary[propertyIndex] !== void 0) {
            propertyIndex = targetObject.morphTargetDictionary[propertyIndex];
          }
        }
        bindingType = this.BindingType.ArrayElement;
        this.resolvedProperty = nodeProperty;
        this.propertyIndex = propertyIndex;
      } else if (nodeProperty.fromArray !== void 0 && nodeProperty.toArray !== void 0) {
        bindingType = this.BindingType.HasFromToArray;
        this.resolvedProperty = nodeProperty;
      } else if (Array.isArray(nodeProperty)) {
        bindingType = this.BindingType.EntireArray;
        this.resolvedProperty = nodeProperty;
      } else {
        this.propertyName = propertyName;
      }
      this.getValue = this.GetterByBindingType[bindingType];
      this.setValue = this.SetterByBindingTypeAndVersioning[bindingType][versioning];
    }
    unbind() {
      this.node = null;
      this.getValue = this._getValue_unbound;
      this.setValue = this._setValue_unbound;
    }
  }
  PropertyBinding.Composite = Composite;
  PropertyBinding.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  };
  PropertyBinding.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  };
  PropertyBinding.prototype.GetterByBindingType = [
    PropertyBinding.prototype._getValue_direct,
    PropertyBinding.prototype._getValue_array,
    PropertyBinding.prototype._getValue_arrayElement,
    PropertyBinding.prototype._getValue_toArray
  ];
  PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [
    [
      // Direct
      PropertyBinding.prototype._setValue_direct,
      PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
      PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate
    ],
    [
      // EntireArray
      PropertyBinding.prototype._setValue_array,
      PropertyBinding.prototype._setValue_array_setNeedsUpdate,
      PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate
    ],
    [
      // ArrayElement
      PropertyBinding.prototype._setValue_arrayElement,
      PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
      PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
    ],
    [
      // HasToFromArray
      PropertyBinding.prototype._setValue_fromArray,
      PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
      PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ];
  const _matrix$3 = /* @__PURE__ */ new Matrix4();
  class Raycaster {
    constructor(origin, direction, near = 0, far = Infinity) {
      this.ray = new Ray(origin, direction);
      this.near = near;
      this.far = far;
      this.camera = null;
      this.layers = new Layers();
      this.params = {
        Mesh: {},
        Line: { threshold: 1 },
        LOD: {},
        Points: { threshold: 1 },
        Sprite: {}
      };
    }
    set(origin, direction) {
      this.ray.set(origin, direction);
    }
    setFromCamera(coords, camera) {
      if (camera.isPerspectiveCamera) {
        this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
        this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
        this.camera = camera;
      } else if (camera.isOrthographicCamera) {
        this.ray.origin.set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
        this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
        this.camera = camera;
      } else {
        console.error("THREE.Raycaster: Unsupported camera type: " + camera.type);
      }
    }
    setFromXRController(controller) {
      _matrix$3.identity().extractRotation(controller.matrixWorld);
      this.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.ray.direction.set(0, 0, -1).applyMatrix4(_matrix$3);
      return this;
    }
    intersectObject(object, recursive = true, intersects = []) {
      intersect(object, this, intersects, recursive);
      intersects.sort(ascSort);
      return intersects;
    }
    intersectObjects(objects, recursive = true, intersects = []) {
      for (let i = 0, l = objects.length; i < l; i++) {
        intersect(objects[i], this, intersects, recursive);
      }
      intersects.sort(ascSort);
      return intersects;
    }
  }
  function ascSort(a, b) {
    return a.distance - b.distance;
  }
  function intersect(object, raycaster, intersects, recursive) {
    let propagate = true;
    if (object.layers.test(raycaster.layers)) {
      const result = object.raycast(raycaster, intersects);
      if (result === false) propagate = false;
    }
    if (propagate === true && recursive === true) {
      const children = object.children;
      for (let i = 0, l = children.length; i < l; i++) {
        intersect(children[i], raycaster, intersects, true);
      }
    }
  }
  class Spherical {
    constructor(radius = 1, phi = 0, theta = 0) {
      this.radius = radius;
      this.phi = phi;
      this.theta = theta;
      return this;
    }
    set(radius, phi, theta) {
      this.radius = radius;
      this.phi = phi;
      this.theta = theta;
      return this;
    }
    copy(other) {
      this.radius = other.radius;
      this.phi = other.phi;
      this.theta = other.theta;
      return this;
    }
    // restrict phi to be between EPS and PI-EPS
    makeSafe() {
      const EPS = 1e-6;
      this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
      return this;
    }
    setFromVector3(v) {
      return this.setFromCartesianCoords(v.x, v.y, v.z);
    }
    setFromCartesianCoords(x, y, z) {
      this.radius = Math.sqrt(x * x + y * y + z * z);
      if (this.radius === 0) {
        this.theta = 0;
        this.phi = 0;
      } else {
        this.theta = Math.atan2(x, z);
        this.phi = Math.acos(clamp(y / this.radius, -1, 1));
      }
      return this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  if (typeof __THREE_DEVTOOLS__ !== "undefined") {
    __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
      revision: REVISION
    } }));
  }
  if (typeof window !== "undefined") {
    if (window.__THREE__) {
      console.warn("WARNING: Multiple instances of Three.js being imported.");
    } else {
      window.__THREE__ = REVISION;
    }
  }
  function estimateBytesUsed$1(geometry) {
    let mem = 0;
    for (const name in geometry.attributes) {
      const attr = geometry.getAttribute(name);
      mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;
    }
    const indices = geometry.getIndex();
    mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
    return mem;
  }
  function toTrianglesDrawMode(geometry, drawMode) {
    if (drawMode === TrianglesDrawMode) {
      console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
      return geometry;
    }
    if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
      let index = geometry.getIndex();
      if (index === null) {
        const indices = [];
        const position = geometry.getAttribute("position");
        if (position !== void 0) {
          for (let i = 0; i < position.count; i++) {
            indices.push(i);
          }
          geometry.setIndex(indices);
          index = geometry.getIndex();
        } else {
          console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
          return geometry;
        }
      }
      const numberOfTriangles = index.count - 2;
      const newIndices = [];
      if (drawMode === TriangleFanDrawMode) {
        for (let i = 1; i <= numberOfTriangles; i++) {
          newIndices.push(index.getX(0));
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
        }
      } else {
        for (let i = 0; i < numberOfTriangles; i++) {
          if (i % 2 === 0) {
            newIndices.push(index.getX(i));
            newIndices.push(index.getX(i + 1));
            newIndices.push(index.getX(i + 2));
          } else {
            newIndices.push(index.getX(i + 2));
            newIndices.push(index.getX(i + 1));
            newIndices.push(index.getX(i));
          }
        }
      }
      if (newIndices.length / 3 !== numberOfTriangles) {
        console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
      }
      const newGeometry = geometry.clone();
      newGeometry.setIndex(newIndices);
      newGeometry.clearGroups();
      return newGeometry;
    } else {
      console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
      return geometry;
    }
  }
  class GLTFLoader extends Loader {
    constructor(manager) {
      super(manager);
      this.dracoLoader = null;
      this.ktx2Loader = null;
      this.meshoptDecoder = null;
      this.pluginCallbacks = [];
      this.register(function(parser) {
        return new GLTFMaterialsClearcoatExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsDispersionExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFTextureBasisUExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFTextureWebPExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFTextureAVIFExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsSheenExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsTransmissionExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsVolumeExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsIorExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsEmissiveStrengthExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsSpecularExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsIridescenceExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsAnisotropyExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMaterialsBumpExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFLightsExtension(parser);
      });
      this.register(function(parser) {
        return new GLTFMeshoptCompression(parser);
      });
      this.register(function(parser) {
        return new GLTFMeshGpuInstancing(parser);
      });
    }
    load(url, onLoad, onProgress, onError) {
      const scope = this;
      let resourcePath;
      if (this.resourcePath !== "") {
        resourcePath = this.resourcePath;
      } else if (this.path !== "") {
        const relativeUrl = LoaderUtils.extractUrlBase(url);
        resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
      } else {
        resourcePath = LoaderUtils.extractUrlBase(url);
      }
      this.manager.itemStart(url);
      const _onError = function(e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      };
      const loader = new FileLoader(this.manager);
      loader.setPath(this.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);
      loader.load(url, function(data) {
        try {
          scope.parse(data, resourcePath, function(gltf) {
            onLoad(gltf);
            scope.manager.itemEnd(url);
          }, _onError);
        } catch (e) {
          _onError(e);
        }
      }, onProgress, _onError);
    }
    setDRACOLoader(dracoLoader) {
      this.dracoLoader = dracoLoader;
      return this;
    }
    setKTX2Loader(ktx2Loader) {
      this.ktx2Loader = ktx2Loader;
      return this;
    }
    setMeshoptDecoder(meshoptDecoder) {
      this.meshoptDecoder = meshoptDecoder;
      return this;
    }
    register(callback) {
      if (this.pluginCallbacks.indexOf(callback) === -1) {
        this.pluginCallbacks.push(callback);
      }
      return this;
    }
    unregister(callback) {
      if (this.pluginCallbacks.indexOf(callback) !== -1) {
        this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
      }
      return this;
    }
    parse(data, path, onLoad, onError) {
      let json;
      const extensions = {};
      const plugins = {};
      const textDecoder = new TextDecoder();
      if (typeof data === "string") {
        json = JSON.parse(data);
      } else if (data instanceof ArrayBuffer) {
        const magic = textDecoder.decode(new Uint8Array(data, 0, 4));
        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          try {
            extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
          } catch (error) {
            if (onError) onError(error);
            return;
          }
          json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
        } else {
          json = JSON.parse(textDecoder.decode(data));
        }
      } else {
        json = data;
      }
      if (json.asset === void 0 || json.asset.version[0] < 2) {
        if (onError) onError(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
        return;
      }
      const parser = new GLTFParser(json, {
        path: path || this.resourcePath || "",
        crossOrigin: this.crossOrigin,
        requestHeader: this.requestHeader,
        manager: this.manager,
        ktx2Loader: this.ktx2Loader,
        meshoptDecoder: this.meshoptDecoder
      });
      parser.fileLoader.setRequestHeader(this.requestHeader);
      for (let i = 0; i < this.pluginCallbacks.length; i++) {
        const plugin = this.pluginCallbacks[i](parser);
        if (!plugin.name) console.error("THREE.GLTFLoader: Invalid plugin found: missing name");
        plugins[plugin.name] = plugin;
        extensions[plugin.name] = true;
      }
      if (json.extensionsUsed) {
        for (let i = 0; i < json.extensionsUsed.length; ++i) {
          const extensionName = json.extensionsUsed[i];
          const extensionsRequired = json.extensionsRequired || [];
          switch (extensionName) {
            case EXTENSIONS.KHR_MATERIALS_UNLIT:
              extensions[extensionName] = new GLTFMaterialsUnlitExtension();
              break;
            case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
              extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
              break;
            case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
              extensions[extensionName] = new GLTFTextureTransformExtension();
              break;
            case EXTENSIONS.KHR_MESH_QUANTIZATION:
              extensions[extensionName] = new GLTFMeshQuantizationExtension();
              break;
            default:
              if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) {
                console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');
              }
          }
        }
      }
      parser.setExtensions(extensions);
      parser.setPlugins(plugins);
      parser.parse(onLoad, onError);
    }
    parseAsync(data, path) {
      const scope = this;
      return new Promise(function(resolve, reject) {
        scope.parse(data, path, resolve, reject);
      });
    }
  }
  function GLTFRegistry() {
    let objects = {};
    return {
      get: function(key) {
        return objects[key];
      },
      add: function(key, object) {
        objects[key] = object;
      },
      remove: function(key) {
        delete objects[key];
      },
      removeAll: function() {
        objects = {};
      }
    };
  }
  const EXTENSIONS = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
    KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
    KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
    KHR_MATERIALS_IOR: "KHR_materials_ior",
    KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
    KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
    KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
    KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
    KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
    KHR_MATERIALS_VOLUME: "KHR_materials_volume",
    KHR_TEXTURE_BASISU: "KHR_texture_basisu",
    KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
    KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
    KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
    EXT_MATERIALS_BUMP: "EXT_materials_bump",
    EXT_TEXTURE_WEBP: "EXT_texture_webp",
    EXT_TEXTURE_AVIF: "EXT_texture_avif",
    EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
    EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
  };
  class GLTFLightsExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
      this.cache = { refs: {}, uses: {} };
    }
    _markDefs() {
      const parser = this.parser;
      const nodeDefs = this.parser.json.nodes || [];
      for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
        const nodeDef = nodeDefs[nodeIndex];
        if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) {
          parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
        }
      }
    }
    _loadLight(lightIndex) {
      const parser = this.parser;
      const cacheKey = "light:" + lightIndex;
      let dependency = parser.cache.get(cacheKey);
      if (dependency) return dependency;
      const json = parser.json;
      const extensions = json.extensions && json.extensions[this.name] || {};
      const lightDefs = extensions.lights || [];
      const lightDef = lightDefs[lightIndex];
      let lightNode;
      const color = new Color(16777215);
      if (lightDef.color !== void 0) color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);
      const range = lightDef.range !== void 0 ? lightDef.range : 0;
      switch (lightDef.type) {
        case "directional":
          lightNode = new DirectionalLight(color);
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;
        case "point":
          lightNode = new PointLight(color);
          lightNode.distance = range;
          break;
        case "spot":
          lightNode = new SpotLight(color);
          lightNode.distance = range;
          lightDef.spot = lightDef.spot || {};
          lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
          lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
          lightNode.angle = lightDef.spot.outerConeAngle;
          lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;
        default:
          throw new Error("THREE.GLTFLoader: Unexpected light type: " + lightDef.type);
      }
      lightNode.position.set(0, 0, 0);
      lightNode.decay = 2;
      assignExtrasToUserData(lightNode, lightDef);
      if (lightDef.intensity !== void 0) lightNode.intensity = lightDef.intensity;
      lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
      dependency = Promise.resolve(lightNode);
      parser.cache.add(cacheKey, dependency);
      return dependency;
    }
    getDependency(type, index) {
      if (type !== "light") return;
      return this._loadLight(index);
    }
    createNodeAttachment(nodeIndex) {
      const self2 = this;
      const parser = this.parser;
      const json = parser.json;
      const nodeDef = json.nodes[nodeIndex];
      const lightDef = nodeDef.extensions && nodeDef.extensions[this.name] || {};
      const lightIndex = lightDef.light;
      if (lightIndex === void 0) return null;
      return this._loadLight(lightIndex).then(function(light) {
        return parser._getNodeRef(self2.cache, lightIndex, light);
      });
    }
  }
  class GLTFMaterialsUnlitExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
    }
    getMaterialType() {
      return MeshBasicMaterial;
    }
    extendParams(materialParams, materialDef, parser) {
      const pending = [];
      materialParams.color = new Color(1, 1, 1);
      materialParams.opacity = 1;
      const metallicRoughness = materialDef.pbrMetallicRoughness;
      if (metallicRoughness) {
        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          const array = metallicRoughness.baseColorFactor;
          materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
          materialParams.opacity = array[3];
        }
        if (metallicRoughness.baseColorTexture !== void 0) {
          pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
        }
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsEmissiveStrengthExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const emissiveStrength = materialDef.extensions[this.name].emissiveStrength;
      if (emissiveStrength !== void 0) {
        materialParams.emissiveIntensity = emissiveStrength;
      }
      return Promise.resolve();
    }
  }
  class GLTFMaterialsClearcoatExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      if (extension.clearcoatFactor !== void 0) {
        materialParams.clearcoat = extension.clearcoatFactor;
      }
      if (extension.clearcoatTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
      }
      if (extension.clearcoatRoughnessFactor !== void 0) {
        materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
      }
      if (extension.clearcoatRoughnessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
      }
      if (extension.clearcoatNormalTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
        if (extension.clearcoatNormalTexture.scale !== void 0) {
          const scale = extension.clearcoatNormalTexture.scale;
          materialParams.clearcoatNormalScale = new Vector2(scale, scale);
        }
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsDispersionExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_DISPERSION;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const extension = materialDef.extensions[this.name];
      materialParams.dispersion = extension.dispersion !== void 0 ? extension.dispersion : 0;
      return Promise.resolve();
    }
  }
  class GLTFMaterialsIridescenceExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      if (extension.iridescenceFactor !== void 0) {
        materialParams.iridescence = extension.iridescenceFactor;
      }
      if (extension.iridescenceTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "iridescenceMap", extension.iridescenceTexture));
      }
      if (extension.iridescenceIor !== void 0) {
        materialParams.iridescenceIOR = extension.iridescenceIor;
      }
      if (materialParams.iridescenceThicknessRange === void 0) {
        materialParams.iridescenceThicknessRange = [100, 400];
      }
      if (extension.iridescenceThicknessMinimum !== void 0) {
        materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
      }
      if (extension.iridescenceThicknessMaximum !== void 0) {
        materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
      }
      if (extension.iridescenceThicknessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "iridescenceThicknessMap", extension.iridescenceThicknessTexture));
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsSheenExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      materialParams.sheenColor = new Color(0, 0, 0);
      materialParams.sheenRoughness = 0;
      materialParams.sheen = 1;
      const extension = materialDef.extensions[this.name];
      if (extension.sheenColorFactor !== void 0) {
        const colorFactor = extension.sheenColorFactor;
        materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace);
      }
      if (extension.sheenRoughnessFactor !== void 0) {
        materialParams.sheenRoughness = extension.sheenRoughnessFactor;
      }
      if (extension.sheenColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "sheenColorMap", extension.sheenColorTexture, SRGBColorSpace));
      }
      if (extension.sheenRoughnessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "sheenRoughnessMap", extension.sheenRoughnessTexture));
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsTransmissionExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      if (extension.transmissionFactor !== void 0) {
        materialParams.transmission = extension.transmissionFactor;
      }
      if (extension.transmissionTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsVolumeExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      materialParams.thickness = extension.thicknessFactor !== void 0 ? extension.thicknessFactor : 0;
      if (extension.thicknessTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "thicknessMap", extension.thicknessTexture));
      }
      materialParams.attenuationDistance = extension.attenuationDistance || Infinity;
      const colorArray = extension.attenuationColor || [1, 1, 1];
      materialParams.attenuationColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsIorExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_IOR;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const extension = materialDef.extensions[this.name];
      materialParams.ior = extension.ior !== void 0 ? extension.ior : 1.5;
      return Promise.resolve();
    }
  }
  class GLTFMaterialsSpecularExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      materialParams.specularIntensity = extension.specularFactor !== void 0 ? extension.specularFactor : 1;
      if (extension.specularTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "specularIntensityMap", extension.specularTexture));
      }
      const colorArray = extension.specularColorFactor || [1, 1, 1];
      materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
      if (extension.specularColorTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "specularColorMap", extension.specularColorTexture, SRGBColorSpace));
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsBumpExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.EXT_MATERIALS_BUMP;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      materialParams.bumpScale = extension.bumpFactor !== void 0 ? extension.bumpFactor : 1;
      if (extension.bumpTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "bumpMap", extension.bumpTexture));
      }
      return Promise.all(pending);
    }
  }
  class GLTFMaterialsAnisotropyExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
    }
    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;
      return MeshPhysicalMaterial;
    }
    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];
      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }
      const pending = [];
      const extension = materialDef.extensions[this.name];
      if (extension.anisotropyStrength !== void 0) {
        materialParams.anisotropy = extension.anisotropyStrength;
      }
      if (extension.anisotropyRotation !== void 0) {
        materialParams.anisotropyRotation = extension.anisotropyRotation;
      }
      if (extension.anisotropyTexture !== void 0) {
        pending.push(parser.assignTexture(materialParams, "anisotropyMap", extension.anisotropyTexture));
      }
      return Promise.all(pending);
    }
  }
  class GLTFTextureBasisUExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
    }
    loadTexture(textureIndex) {
      const parser = this.parser;
      const json = parser.json;
      const textureDef = json.textures[textureIndex];
      if (!textureDef.extensions || !textureDef.extensions[this.name]) {
        return null;
      }
      const extension = textureDef.extensions[this.name];
      const loader = parser.options.ktx2Loader;
      if (!loader) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
        } else {
          return null;
        }
      }
      return parser.loadTextureImage(textureIndex, extension.source, loader);
    }
  }
  class GLTFTextureWebPExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
      this.isSupported = null;
    }
    loadTexture(textureIndex) {
      const name = this.name;
      const parser = this.parser;
      const json = parser.json;
      const textureDef = json.textures[textureIndex];
      if (!textureDef.extensions || !textureDef.extensions[name]) {
        return null;
      }
      const extension = textureDef.extensions[name];
      const source = json.images[extension.source];
      let loader = parser.textureLoader;
      if (source.uri) {
        const handler = parser.options.manager.getHandler(source.uri);
        if (handler !== null) loader = handler;
      }
      return this.detectSupport().then(function(isSupported) {
        if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader);
        if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
          throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
        }
        return parser.loadTexture(textureIndex);
      });
    }
    detectSupport() {
      if (!this.isSupported) {
        this.isSupported = new Promise(function(resolve) {
          const image = new Image();
          image.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
          image.onload = image.onerror = function() {
            resolve(image.height === 1);
          };
        });
      }
      return this.isSupported;
    }
  }
  class GLTFTextureAVIFExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
      this.isSupported = null;
    }
    loadTexture(textureIndex) {
      const name = this.name;
      const parser = this.parser;
      const json = parser.json;
      const textureDef = json.textures[textureIndex];
      if (!textureDef.extensions || !textureDef.extensions[name]) {
        return null;
      }
      const extension = textureDef.extensions[name];
      const source = json.images[extension.source];
      let loader = parser.textureLoader;
      if (source.uri) {
        const handler = parser.options.manager.getHandler(source.uri);
        if (handler !== null) loader = handler;
      }
      return this.detectSupport().then(function(isSupported) {
        if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader);
        if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
          throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
        }
        return parser.loadTexture(textureIndex);
      });
    }
    detectSupport() {
      if (!this.isSupported) {
        this.isSupported = new Promise(function(resolve) {
          const image = new Image();
          image.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
          image.onload = image.onerror = function() {
            resolve(image.height === 1);
          };
        });
      }
      return this.isSupported;
    }
  }
  class GLTFMeshoptCompression {
    constructor(parser) {
      this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
      this.parser = parser;
    }
    loadBufferView(index) {
      const json = this.parser.json;
      const bufferView = json.bufferViews[index];
      if (bufferView.extensions && bufferView.extensions[this.name]) {
        const extensionDef = bufferView.extensions[this.name];
        const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
        const decoder = this.parser.options.meshoptDecoder;
        if (!decoder || !decoder.supported) {
          if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
            throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
          } else {
            return null;
          }
        }
        return buffer.then(function(res) {
          const byteOffset = extensionDef.byteOffset || 0;
          const byteLength = extensionDef.byteLength || 0;
          const count = extensionDef.count;
          const stride = extensionDef.byteStride;
          const source = new Uint8Array(res, byteOffset, byteLength);
          if (decoder.decodeGltfBufferAsync) {
            return decoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(function(res2) {
              return res2.buffer;
            });
          } else {
            return decoder.ready.then(function() {
              const result = new ArrayBuffer(count * stride);
              decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
              return result;
            });
          }
        });
      } else {
        return null;
      }
    }
  }
  class GLTFMeshGpuInstancing {
    constructor(parser) {
      this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
      this.parser = parser;
    }
    createNodeMesh(nodeIndex) {
      const json = this.parser.json;
      const nodeDef = json.nodes[nodeIndex];
      if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === void 0) {
        return null;
      }
      const meshDef = json.meshes[nodeDef.mesh];
      for (const primitive of meshDef.primitives) {
        if (primitive.mode !== WEBGL_CONSTANTS.TRIANGLES && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN && primitive.mode !== void 0) {
          return null;
        }
      }
      const extensionDef = nodeDef.extensions[this.name];
      const attributesDef = extensionDef.attributes;
      const pending = [];
      const attributes = {};
      for (const key in attributesDef) {
        pending.push(this.parser.getDependency("accessor", attributesDef[key]).then((accessor) => {
          attributes[key] = accessor;
          return attributes[key];
        }));
      }
      if (pending.length < 1) {
        return null;
      }
      pending.push(this.parser.createNodeMesh(nodeIndex));
      return Promise.all(pending).then((results) => {
        const nodeObject = results.pop();
        const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
        const count = results[0].count;
        const instancedMeshes = [];
        for (const mesh of meshes) {
          const m = new Matrix4();
          const p = new Vector3();
          const q = new Quaternion();
          const s = new Vector3(1, 1, 1);
          const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);
          for (let i = 0; i < count; i++) {
            if (attributes.TRANSLATION) {
              p.fromBufferAttribute(attributes.TRANSLATION, i);
            }
            if (attributes.ROTATION) {
              q.fromBufferAttribute(attributes.ROTATION, i);
            }
            if (attributes.SCALE) {
              s.fromBufferAttribute(attributes.SCALE, i);
            }
            instancedMesh.setMatrixAt(i, m.compose(p, q, s));
          }
          for (const attributeName in attributes) {
            if (attributeName === "_COLOR_0") {
              const attr = attributes[attributeName];
              instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized);
            } else if (attributeName !== "TRANSLATION" && attributeName !== "ROTATION" && attributeName !== "SCALE") {
              mesh.geometry.setAttribute(attributeName, attributes[attributeName]);
            }
          }
          Object3D.prototype.copy.call(instancedMesh, mesh);
          this.parser.assignFinalMaterial(instancedMesh);
          instancedMeshes.push(instancedMesh);
        }
        if (nodeObject.isGroup) {
          nodeObject.clear();
          nodeObject.add(...instancedMeshes);
          return nodeObject;
        }
        return instancedMeshes[0];
      });
    }
  }
  const BINARY_EXTENSION_HEADER_MAGIC = "glTF";
  const BINARY_EXTENSION_HEADER_LENGTH = 12;
  const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 1313821514, BIN: 5130562 };
  class GLTFBinaryExtension {
    constructor(data) {
      this.name = EXTENSIONS.KHR_BINARY_GLTF;
      this.content = null;
      this.body = null;
      const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
      const textDecoder = new TextDecoder();
      this.header = {
        magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true)
      };
      if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
        throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
      } else if (this.header.version < 2) {
        throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
      }
      const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
      const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
      let chunkIndex = 0;
      while (chunkIndex < chunkContentsLength) {
        const chunkLength = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;
        const chunkType = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;
        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
          const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
          this.content = textDecoder.decode(contentArray);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
          const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
          this.body = data.slice(byteOffset, byteOffset + chunkLength);
        }
        chunkIndex += chunkLength;
      }
      if (this.content === null) {
        throw new Error("THREE.GLTFLoader: JSON content not found.");
      }
    }
  }
  class GLTFDracoMeshCompressionExtension {
    constructor(json, dracoLoader) {
      if (!dracoLoader) {
        throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
      }
      this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
      this.json = json;
      this.dracoLoader = dracoLoader;
      this.dracoLoader.preload();
    }
    decodePrimitive(primitive, parser) {
      const json = this.json;
      const dracoLoader = this.dracoLoader;
      const bufferViewIndex = primitive.extensions[this.name].bufferView;
      const gltfAttributeMap = primitive.extensions[this.name].attributes;
      const threeAttributeMap = {};
      const attributeNormalizedMap = {};
      const attributeTypeMap = {};
      for (const attributeName in gltfAttributeMap) {
        const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
        threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
      }
      for (const attributeName in primitive.attributes) {
        const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
        if (gltfAttributeMap[attributeName] !== void 0) {
          const accessorDef = json.accessors[primitive.attributes[attributeName]];
          const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
          attributeTypeMap[threeAttributeName] = componentType.name;
          attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
        }
      }
      return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
        return new Promise(function(resolve, reject) {
          dracoLoader.decodeDracoFile(bufferView, function(geometry) {
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName];
              const normalized = attributeNormalizedMap[attributeName];
              if (normalized !== void 0) attribute.normalized = normalized;
            }
            resolve(geometry);
          }, threeAttributeMap, attributeTypeMap, LinearSRGBColorSpace, reject);
        });
      });
    }
  }
  class GLTFTextureTransformExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
    }
    extendTexture(texture, transform) {
      if ((transform.texCoord === void 0 || transform.texCoord === texture.channel) && transform.offset === void 0 && transform.rotation === void 0 && transform.scale === void 0) {
        return texture;
      }
      texture = texture.clone();
      if (transform.texCoord !== void 0) {
        texture.channel = transform.texCoord;
      }
      if (transform.offset !== void 0) {
        texture.offset.fromArray(transform.offset);
      }
      if (transform.rotation !== void 0) {
        texture.rotation = transform.rotation;
      }
      if (transform.scale !== void 0) {
        texture.repeat.fromArray(transform.scale);
      }
      texture.needsUpdate = true;
      return texture;
    }
  }
  class GLTFMeshQuantizationExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
    }
  }
  class GLTFCubicSplineInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }
    copySampleValue_(index) {
      const result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
      for (let i = 0; i !== valueSize; i++) {
        result[i] = values[offset + i];
      }
      return result;
    }
    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer;
      const values = this.sampleValues;
      const stride = this.valueSize;
      const stride2 = stride * 2;
      const stride3 = stride * 3;
      const td = t1 - t0;
      const p = (t - t0) / td;
      const pp = p * p;
      const ppp = pp * p;
      const offset1 = i1 * stride3;
      const offset0 = offset1 - stride3;
      const s2 = -2 * ppp + 3 * pp;
      const s3 = ppp - pp;
      const s0 = 1 - s2;
      const s1 = s3 - pp + p;
      for (let i = 0; i !== stride; i++) {
        const p0 = values[offset0 + i + stride];
        const m0 = values[offset0 + i + stride2] * td;
        const p1 = values[offset1 + i + stride];
        const m1 = values[offset1 + i] * td;
        result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
      }
      return result;
    }
  }
  const _q = new Quaternion();
  class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
    interpolate_(i1, t0, t, t1) {
      const result = super.interpolate_(i1, t0, t, t1);
      _q.fromArray(result).normalize().toArray(result);
      return result;
    }
  }
  const WEBGL_CONSTANTS = {
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6
  };
  const WEBGL_COMPONENT_TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  };
  const WEBGL_FILTERS = {
    9728: NearestFilter,
    9729: LinearFilter,
    9984: NearestMipmapNearestFilter,
    9985: LinearMipmapNearestFilter,
    9986: NearestMipmapLinearFilter,
    9987: LinearMipmapLinearFilter
  };
  const WEBGL_WRAPPINGS = {
    33071: ClampToEdgeWrapping,
    33648: MirroredRepeatWrapping,
    10497: RepeatWrapping
  };
  const WEBGL_TYPE_SIZES = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
    "MAT2": 4,
    "MAT3": 9,
    "MAT4": 16
  };
  const ATTRIBUTES = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3",
    COLOR_0: "color",
    WEIGHTS_0: "skinWeight",
    JOINTS_0: "skinIndex"
  };
  const PATH_PROPERTIES = {
    scale: "scale",
    translation: "position",
    rotation: "quaternion",
    weights: "morphTargetInfluences"
  };
  const INTERPOLATION = {
    CUBICSPLINE: void 0,
    // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
    // keyframe track will be initialized with a default interpolation type, then modified.
    LINEAR: InterpolateLinear,
    STEP: InterpolateDiscrete
  };
  const ALPHA_MODES = {
    OPAQUE: "OPAQUE",
    MASK: "MASK",
    BLEND: "BLEND"
  };
  function createDefaultMaterial(cache) {
    if (cache["DefaultMaterial"] === void 0) {
      cache["DefaultMaterial"] = new MeshStandardMaterial({
        color: 16777215,
        emissive: 0,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: FrontSide
      });
    }
    return cache["DefaultMaterial"];
  }
  function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
    for (const name in objectDef.extensions) {
      if (knownExtensions[name] === void 0) {
        object.userData.gltfExtensions = object.userData.gltfExtensions || {};
        object.userData.gltfExtensions[name] = objectDef.extensions[name];
      }
    }
  }
  function assignExtrasToUserData(object, gltfDef) {
    if (gltfDef.extras !== void 0) {
      if (typeof gltfDef.extras === "object") {
        Object.assign(object.userData, gltfDef.extras);
      } else {
        console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
      }
    }
  }
  function addMorphTargets(geometry, targets, parser) {
    let hasMorphPosition = false;
    let hasMorphNormal = false;
    let hasMorphColor = false;
    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];
      if (target.POSITION !== void 0) hasMorphPosition = true;
      if (target.NORMAL !== void 0) hasMorphNormal = true;
      if (target.COLOR_0 !== void 0) hasMorphColor = true;
      if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
    }
    if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry);
    const pendingPositionAccessors = [];
    const pendingNormalAccessors = [];
    const pendingColorAccessors = [];
    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];
      if (hasMorphPosition) {
        const pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry.attributes.position;
        pendingPositionAccessors.push(pendingAccessor);
      }
      if (hasMorphNormal) {
        const pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry.attributes.normal;
        pendingNormalAccessors.push(pendingAccessor);
      }
      if (hasMorphColor) {
        const pendingAccessor = target.COLOR_0 !== void 0 ? parser.getDependency("accessor", target.COLOR_0) : geometry.attributes.color;
        pendingColorAccessors.push(pendingAccessor);
      }
    }
    return Promise.all([
      Promise.all(pendingPositionAccessors),
      Promise.all(pendingNormalAccessors),
      Promise.all(pendingColorAccessors)
    ]).then(function(accessors) {
      const morphPositions = accessors[0];
      const morphNormals = accessors[1];
      const morphColors = accessors[2];
      if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
      if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
      if (hasMorphColor) geometry.morphAttributes.color = morphColors;
      geometry.morphTargetsRelative = true;
      return geometry;
    });
  }
  function updateMorphTargets(mesh, meshDef) {
    mesh.updateMorphTargets();
    if (meshDef.weights !== void 0) {
      for (let i = 0, il = meshDef.weights.length; i < il; i++) {
        mesh.morphTargetInfluences[i] = meshDef.weights[i];
      }
    }
    if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
      const targetNames = meshDef.extras.targetNames;
      if (mesh.morphTargetInfluences.length === targetNames.length) {
        mesh.morphTargetDictionary = {};
        for (let i = 0, il = targetNames.length; i < il; i++) {
          mesh.morphTargetDictionary[targetNames[i]] = i;
        }
      } else {
        console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
      }
    }
  }
  function createPrimitiveKey(primitiveDef) {
    let geometryKey;
    const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
    if (dracoExtension) {
      geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
    } else {
      geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
    }
    if (primitiveDef.targets !== void 0) {
      for (let i = 0, il = primitiveDef.targets.length; i < il; i++) {
        geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
      }
    }
    return geometryKey;
  }
  function createAttributesKey(attributes) {
    let attributesKey = "";
    const keys = Object.keys(attributes).sort();
    for (let i = 0, il = keys.length; i < il; i++) {
      attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
    }
    return attributesKey;
  }
  function getNormalizedComponentScale(constructor) {
    switch (constructor) {
      case Int8Array:
        return 1 / 127;
      case Uint8Array:
        return 1 / 255;
      case Int16Array:
        return 1 / 32767;
      case Uint16Array:
        return 1 / 65535;
      default:
        throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
    }
  }
  function getImageURIMimeType(uri) {
    if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data\:image\/jpeg/) === 0) return "image/jpeg";
    if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0) return "image/webp";
    if (uri.search(/\.ktx2($|\?)/i) > 0 || uri.search(/^data\:image\/ktx2/) === 0) return "image/ktx2";
    return "image/png";
  }
  const _identityMatrix = new Matrix4();
  class GLTFParser {
    constructor(json = {}, options = {}) {
      this.json = json;
      this.extensions = {};
      this.plugins = {};
      this.options = options;
      this.cache = new GLTFRegistry();
      this.associations = /* @__PURE__ */ new Map();
      this.primitiveCache = {};
      this.nodeCache = {};
      this.meshCache = { refs: {}, uses: {} };
      this.cameraCache = { refs: {}, uses: {} };
      this.lightCache = { refs: {}, uses: {} };
      this.sourceCache = {};
      this.textureCache = {};
      this.nodeNamesUsed = {};
      let isSafari = false;
      let safariVersion = -1;
      let isFirefox = false;
      let firefoxVersion = -1;
      if (typeof navigator !== "undefined") {
        const userAgent = navigator.userAgent;
        isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
        const safariMatch = userAgent.match(/Version\/(\d+)/);
        safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;
        isFirefox = userAgent.indexOf("Firefox") > -1;
        firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;
      }
      if (typeof createImageBitmap === "undefined" || isSafari && safariVersion < 17 || isFirefox && firefoxVersion < 98) {
        this.textureLoader = new TextureLoader(this.options.manager);
      } else {
        this.textureLoader = new ImageBitmapLoader(this.options.manager);
      }
      this.textureLoader.setCrossOrigin(this.options.crossOrigin);
      this.textureLoader.setRequestHeader(this.options.requestHeader);
      this.fileLoader = new FileLoader(this.options.manager);
      this.fileLoader.setResponseType("arraybuffer");
      if (this.options.crossOrigin === "use-credentials") {
        this.fileLoader.setWithCredentials(true);
      }
    }
    setExtensions(extensions) {
      this.extensions = extensions;
    }
    setPlugins(plugins) {
      this.plugins = plugins;
    }
    parse(onLoad, onError) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;
      this.cache.removeAll();
      this.nodeCache = {};
      this._invokeAll(function(ext) {
        return ext._markDefs && ext._markDefs();
      });
      Promise.all(this._invokeAll(function(ext) {
        return ext.beforeRoot && ext.beforeRoot();
      })).then(function() {
        return Promise.all([
          parser.getDependencies("scene"),
          parser.getDependencies("animation"),
          parser.getDependencies("camera")
        ]);
      }).then(function(dependencies) {
        const result = {
          scene: dependencies[0][json.scene || 0],
          scenes: dependencies[0],
          animations: dependencies[1],
          cameras: dependencies[2],
          asset: json.asset,
          parser,
          userData: {}
        };
        addUnknownExtensionsToUserData(extensions, result, json);
        assignExtrasToUserData(result, json);
        return Promise.all(parser._invokeAll(function(ext) {
          return ext.afterRoot && ext.afterRoot(result);
        })).then(function() {
          for (const scene of result.scenes) {
            scene.updateMatrixWorld();
          }
          onLoad(result);
        });
      }).catch(onError);
    }
    /**
     * Marks the special nodes/meshes in json for efficient parse.
     */
    _markDefs() {
      const nodeDefs = this.json.nodes || [];
      const skinDefs = this.json.skins || [];
      const meshDefs = this.json.meshes || [];
      for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
        const joints = skinDefs[skinIndex].joints;
        for (let i = 0, il = joints.length; i < il; i++) {
          nodeDefs[joints[i]].isBone = true;
        }
      }
      for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
        const nodeDef = nodeDefs[nodeIndex];
        if (nodeDef.mesh !== void 0) {
          this._addNodeRef(this.meshCache, nodeDef.mesh);
          if (nodeDef.skin !== void 0) {
            meshDefs[nodeDef.mesh].isSkinnedMesh = true;
          }
        }
        if (nodeDef.camera !== void 0) {
          this._addNodeRef(this.cameraCache, nodeDef.camera);
        }
      }
    }
    /**
     * Counts references to shared node / Object3D resources. These resources
     * can be reused, or "instantiated", at multiple nodes in the scene
     * hierarchy. Mesh, Camera, and Light instances are instantiated and must
     * be marked. Non-scenegraph resources (like Materials, Geometries, and
     * Textures) can be reused directly and are not marked here.
     *
     * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
     */
    _addNodeRef(cache, index) {
      if (index === void 0) return;
      if (cache.refs[index] === void 0) {
        cache.refs[index] = cache.uses[index] = 0;
      }
      cache.refs[index]++;
    }
    /** Returns a reference to a shared resource, cloning it if necessary. */
    _getNodeRef(cache, index, object) {
      if (cache.refs[index] <= 1) return object;
      const ref = object.clone();
      const updateMappings = (original, clone) => {
        const mappings = this.associations.get(original);
        if (mappings != null) {
          this.associations.set(clone, mappings);
        }
        for (const [i, child] of original.children.entries()) {
          updateMappings(child, clone.children[i]);
        }
      };
      updateMappings(object, ref);
      ref.name += "_instance_" + cache.uses[index]++;
      return ref;
    }
    _invokeOne(func) {
      const extensions = Object.values(this.plugins);
      extensions.push(this);
      for (let i = 0; i < extensions.length; i++) {
        const result = func(extensions[i]);
        if (result) return result;
      }
      return null;
    }
    _invokeAll(func) {
      const extensions = Object.values(this.plugins);
      extensions.unshift(this);
      const pending = [];
      for (let i = 0; i < extensions.length; i++) {
        const result = func(extensions[i]);
        if (result) pending.push(result);
      }
      return pending;
    }
    /**
     * Requests the specified dependency asynchronously, with caching.
     * @param {string} type
     * @param {number} index
     * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
     */
    getDependency(type, index) {
      const cacheKey = type + ":" + index;
      let dependency = this.cache.get(cacheKey);
      if (!dependency) {
        switch (type) {
          case "scene":
            dependency = this.loadScene(index);
            break;
          case "node":
            dependency = this._invokeOne(function(ext) {
              return ext.loadNode && ext.loadNode(index);
            });
            break;
          case "mesh":
            dependency = this._invokeOne(function(ext) {
              return ext.loadMesh && ext.loadMesh(index);
            });
            break;
          case "accessor":
            dependency = this.loadAccessor(index);
            break;
          case "bufferView":
            dependency = this._invokeOne(function(ext) {
              return ext.loadBufferView && ext.loadBufferView(index);
            });
            break;
          case "buffer":
            dependency = this.loadBuffer(index);
            break;
          case "material":
            dependency = this._invokeOne(function(ext) {
              return ext.loadMaterial && ext.loadMaterial(index);
            });
            break;
          case "texture":
            dependency = this._invokeOne(function(ext) {
              return ext.loadTexture && ext.loadTexture(index);
            });
            break;
          case "skin":
            dependency = this.loadSkin(index);
            break;
          case "animation":
            dependency = this._invokeOne(function(ext) {
              return ext.loadAnimation && ext.loadAnimation(index);
            });
            break;
          case "camera":
            dependency = this.loadCamera(index);
            break;
          default:
            dependency = this._invokeOne(function(ext) {
              return ext != this && ext.getDependency && ext.getDependency(type, index);
            });
            if (!dependency) {
              throw new Error("Unknown type: " + type);
            }
            break;
        }
        this.cache.add(cacheKey, dependency);
      }
      return dependency;
    }
    /**
     * Requests all dependencies of the specified type asynchronously, with caching.
     * @param {string} type
     * @return {Promise<Array<Object>>}
     */
    getDependencies(type) {
      let dependencies = this.cache.get(type);
      if (!dependencies) {
        const parser = this;
        const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
        dependencies = Promise.all(defs.map(function(def, index) {
          return parser.getDependency(type, index);
        }));
        this.cache.add(type, dependencies);
      }
      return dependencies;
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBuffer(bufferIndex) {
      const bufferDef = this.json.buffers[bufferIndex];
      const loader = this.fileLoader;
      if (bufferDef.type && bufferDef.type !== "arraybuffer") {
        throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
      }
      if (bufferDef.uri === void 0 && bufferIndex === 0) {
        return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
      }
      const options = this.options;
      return new Promise(function(resolve, reject) {
        loader.load(LoaderUtils.resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
          reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));
        });
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferViewIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBufferView(bufferViewIndex) {
      const bufferViewDef = this.json.bufferViews[bufferViewIndex];
      return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
        const byteLength = bufferViewDef.byteLength || 0;
        const byteOffset = bufferViewDef.byteOffset || 0;
        return buffer.slice(byteOffset, byteOffset + byteLength);
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
     * @param {number} accessorIndex
     * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
     */
    loadAccessor(accessorIndex) {
      const parser = this;
      const json = this.json;
      const accessorDef = this.json.accessors[accessorIndex];
      if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
        const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        const normalized = accessorDef.normalized === true;
        const array = new TypedArray(accessorDef.count * itemSize);
        return Promise.resolve(new BufferAttribute(array, itemSize, normalized));
      }
      const pendingBufferViews = [];
      if (accessorDef.bufferView !== void 0) {
        pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
      } else {
        pendingBufferViews.push(null);
      }
      if (accessorDef.sparse !== void 0) {
        pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
        pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
      }
      return Promise.all(pendingBufferViews).then(function(bufferViews) {
        const bufferView = bufferViews[0];
        const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        const elementBytes = TypedArray.BYTES_PER_ELEMENT;
        const itemBytes = elementBytes * itemSize;
        const byteOffset = accessorDef.byteOffset || 0;
        const byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
        const normalized = accessorDef.normalized === true;
        let array, bufferAttribute;
        if (byteStride && byteStride !== itemBytes) {
          const ibSlice = Math.floor(byteOffset / byteStride);
          const ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
          let ib = parser.cache.get(ibCacheKey);
          if (!ib) {
            array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
            ib = new InterleavedBuffer(array, byteStride / elementBytes);
            parser.cache.add(ibCacheKey, ib);
          }
          bufferAttribute = new InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
        } else {
          if (bufferView === null) {
            array = new TypedArray(accessorDef.count * itemSize);
          } else {
            array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
          }
          bufferAttribute = new BufferAttribute(array, itemSize, normalized);
        }
        if (accessorDef.sparse !== void 0) {
          const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
          const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
          const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
          const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
          const sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
          const sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
          if (bufferView !== null) {
            bufferAttribute = new BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
          }
          bufferAttribute.normalized = false;
          for (let i = 0, il = sparseIndices.length; i < il; i++) {
            const index = sparseIndices[i];
            bufferAttribute.setX(index, sparseValues[i * itemSize]);
            if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
            if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
            if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
            if (itemSize >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
          }
          bufferAttribute.normalized = normalized;
        }
        return bufferAttribute;
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
     * @param {number} textureIndex
     * @return {Promise<THREE.Texture|null>}
     */
    loadTexture(textureIndex) {
      const json = this.json;
      const options = this.options;
      const textureDef = json.textures[textureIndex];
      const sourceIndex = textureDef.source;
      const sourceDef = json.images[sourceIndex];
      let loader = this.textureLoader;
      if (sourceDef.uri) {
        const handler = options.manager.getHandler(sourceDef.uri);
        if (handler !== null) loader = handler;
      }
      return this.loadTextureImage(textureIndex, sourceIndex, loader);
    }
    loadTextureImage(textureIndex, sourceIndex, loader) {
      const parser = this;
      const json = this.json;
      const textureDef = json.textures[textureIndex];
      const sourceDef = json.images[sourceIndex];
      const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;
      if (this.textureCache[cacheKey]) {
        return this.textureCache[cacheKey];
      }
      const promise = this.loadImageSource(sourceIndex, loader).then(function(texture) {
        texture.flipY = false;
        texture.name = textureDef.name || sourceDef.name || "";
        if (texture.name === "" && typeof sourceDef.uri === "string" && sourceDef.uri.startsWith("data:image/") === false) {
          texture.name = sourceDef.uri;
        }
        const samplers = json.samplers || {};
        const sampler = samplers[textureDef.sampler] || {};
        texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
        texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;
        texture.generateMipmaps = !texture.isCompressedTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
        parser.associations.set(texture, { textures: textureIndex });
        return texture;
      }).catch(function() {
        return null;
      });
      this.textureCache[cacheKey] = promise;
      return promise;
    }
    loadImageSource(sourceIndex, loader) {
      const parser = this;
      const json = this.json;
      const options = this.options;
      if (this.sourceCache[sourceIndex] !== void 0) {
        return this.sourceCache[sourceIndex].then((texture) => texture.clone());
      }
      const sourceDef = json.images[sourceIndex];
      const URL2 = self.URL || self.webkitURL;
      let sourceURI = sourceDef.uri || "";
      let isObjectURL = false;
      if (sourceDef.bufferView !== void 0) {
        sourceURI = parser.getDependency("bufferView", sourceDef.bufferView).then(function(bufferView) {
          isObjectURL = true;
          const blob = new Blob([bufferView], { type: sourceDef.mimeType });
          sourceURI = URL2.createObjectURL(blob);
          return sourceURI;
        });
      } else if (sourceDef.uri === void 0) {
        throw new Error("THREE.GLTFLoader: Image " + sourceIndex + " is missing URI and bufferView");
      }
      const promise = Promise.resolve(sourceURI).then(function(sourceURI2) {
        return new Promise(function(resolve, reject) {
          let onLoad = resolve;
          if (loader.isImageBitmapLoader === true) {
            onLoad = function(imageBitmap) {
              const texture = new Texture(imageBitmap);
              texture.needsUpdate = true;
              resolve(texture);
            };
          }
          loader.load(LoaderUtils.resolveURL(sourceURI2, options.path), onLoad, void 0, reject);
        });
      }).then(function(texture) {
        if (isObjectURL === true) {
          URL2.revokeObjectURL(sourceURI);
        }
        assignExtrasToUserData(texture, sourceDef);
        texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);
        return texture;
      }).catch(function(error) {
        console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
        throw error;
      });
      this.sourceCache[sourceIndex] = promise;
      return promise;
    }
    /**
     * Asynchronously assigns a texture to the given material parameters.
     * @param {Object} materialParams
     * @param {string} mapName
     * @param {Object} mapDef
     * @return {Promise<Texture>}
     */
    assignTexture(materialParams, mapName, mapDef, colorSpace) {
      const parser = this;
      return this.getDependency("texture", mapDef.index).then(function(texture) {
        if (!texture) return null;
        if (mapDef.texCoord !== void 0 && mapDef.texCoord > 0) {
          texture = texture.clone();
          texture.channel = mapDef.texCoord;
        }
        if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
          const transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
          if (transform) {
            const gltfReference = parser.associations.get(texture);
            texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
            parser.associations.set(texture, gltfReference);
          }
        }
        if (colorSpace !== void 0) {
          texture.colorSpace = colorSpace;
        }
        materialParams[mapName] = texture;
        return texture;
      });
    }
    /**
     * Assigns final material to a Mesh, Line, or Points instance. The instance
     * already has a material (generated from the glTF material options alone)
     * but reuse of the same glTF material may require multiple threejs materials
     * to accommodate different primitive types, defines, etc. New materials will
     * be created if necessary, and reused from a cache.
     * @param  {Object3D} mesh Mesh, Line, or Points instance.
     */
    assignFinalMaterial(mesh) {
      const geometry = mesh.geometry;
      let material = mesh.material;
      const useDerivativeTangents = geometry.attributes.tangent === void 0;
      const useVertexColors = geometry.attributes.color !== void 0;
      const useFlatShading = geometry.attributes.normal === void 0;
      if (mesh.isPoints) {
        const cacheKey = "PointsMaterial:" + material.uuid;
        let pointsMaterial = this.cache.get(cacheKey);
        if (!pointsMaterial) {
          pointsMaterial = new PointsMaterial();
          Material.prototype.copy.call(pointsMaterial, material);
          pointsMaterial.color.copy(material.color);
          pointsMaterial.map = material.map;
          pointsMaterial.sizeAttenuation = false;
          this.cache.add(cacheKey, pointsMaterial);
        }
        material = pointsMaterial;
      } else if (mesh.isLine) {
        const cacheKey = "LineBasicMaterial:" + material.uuid;
        let lineMaterial = this.cache.get(cacheKey);
        if (!lineMaterial) {
          lineMaterial = new LineBasicMaterial();
          Material.prototype.copy.call(lineMaterial, material);
          lineMaterial.color.copy(material.color);
          lineMaterial.map = material.map;
          this.cache.add(cacheKey, lineMaterial);
        }
        material = lineMaterial;
      }
      if (useDerivativeTangents || useVertexColors || useFlatShading) {
        let cacheKey = "ClonedMaterial:" + material.uuid + ":";
        if (useDerivativeTangents) cacheKey += "derivative-tangents:";
        if (useVertexColors) cacheKey += "vertex-colors:";
        if (useFlatShading) cacheKey += "flat-shading:";
        let cachedMaterial = this.cache.get(cacheKey);
        if (!cachedMaterial) {
          cachedMaterial = material.clone();
          if (useVertexColors) cachedMaterial.vertexColors = true;
          if (useFlatShading) cachedMaterial.flatShading = true;
          if (useDerivativeTangents) {
            if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
            if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= -1;
          }
          this.cache.add(cacheKey, cachedMaterial);
          this.associations.set(cachedMaterial, this.associations.get(material));
        }
        material = cachedMaterial;
      }
      mesh.material = material;
    }
    getMaterialType() {
      return MeshStandardMaterial;
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
     * @param {number} materialIndex
     * @return {Promise<Material>}
     */
    loadMaterial(materialIndex) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;
      const materialDef = json.materials[materialIndex];
      let materialType;
      const materialParams = {};
      const materialExtensions = materialDef.extensions || {};
      const pending = [];
      if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
        const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
        materialType = kmuExtension.getMaterialType();
        pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
      } else {
        const metallicRoughness = materialDef.pbrMetallicRoughness || {};
        materialParams.color = new Color(1, 1, 1);
        materialParams.opacity = 1;
        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          const array = metallicRoughness.baseColorFactor;
          materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
          materialParams.opacity = array[3];
        }
        if (metallicRoughness.baseColorTexture !== void 0) {
          pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
        }
        materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
        materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
        if (metallicRoughness.metallicRoughnessTexture !== void 0) {
          pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
          pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
        }
        materialType = this._invokeOne(function(ext) {
          return ext.getMaterialType && ext.getMaterialType(materialIndex);
        });
        pending.push(Promise.all(this._invokeAll(function(ext) {
          return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
        })));
      }
      if (materialDef.doubleSided === true) {
        materialParams.side = DoubleSide;
      }
      const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
      if (alphaMode === ALPHA_MODES.BLEND) {
        materialParams.transparent = true;
        materialParams.depthWrite = false;
      } else {
        materialParams.transparent = false;
        if (alphaMode === ALPHA_MODES.MASK) {
          materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : 0.5;
        }
      }
      if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
        materialParams.normalScale = new Vector2(1, 1);
        if (materialDef.normalTexture.scale !== void 0) {
          const scale = materialDef.normalTexture.scale;
          materialParams.normalScale.set(scale, scale);
        }
      }
      if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
        if (materialDef.occlusionTexture.strength !== void 0) {
          materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
        }
      }
      if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
        const emissiveFactor = materialDef.emissiveFactor;
        materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);
      }
      if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) {
        pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture, SRGBColorSpace));
      }
      return Promise.all(pending).then(function() {
        const material = new materialType(materialParams);
        if (materialDef.name) material.name = materialDef.name;
        assignExtrasToUserData(material, materialDef);
        parser.associations.set(material, { materials: materialIndex });
        if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
        return material;
      });
    }
    /** When Object3D instances are targeted by animation, they need unique names. */
    createUniqueName(originalName) {
      const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || "");
      if (sanitizedName in this.nodeNamesUsed) {
        return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
      } else {
        this.nodeNamesUsed[sanitizedName] = 0;
        return sanitizedName;
      }
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
     *
     * Creates BufferGeometries from primitives.
     *
     * @param {Array<GLTF.Primitive>} primitives
     * @return {Promise<Array<BufferGeometry>>}
     */
    loadGeometries(primitives) {
      const parser = this;
      const extensions = this.extensions;
      const cache = this.primitiveCache;
      function createDracoPrimitive(primitive) {
        return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function(geometry) {
          return addPrimitiveAttributes(geometry, primitive, parser);
        });
      }
      const pending = [];
      for (let i = 0, il = primitives.length; i < il; i++) {
        const primitive = primitives[i];
        const cacheKey = createPrimitiveKey(primitive);
        const cached = cache[cacheKey];
        if (cached) {
          pending.push(cached.promise);
        } else {
          let geometryPromise;
          if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {
            geometryPromise = createDracoPrimitive(primitive);
          } else {
            geometryPromise = addPrimitiveAttributes(new BufferGeometry(), primitive, parser);
          }
          cache[cacheKey] = { primitive, promise: geometryPromise };
          pending.push(geometryPromise);
        }
      }
      return Promise.all(pending);
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
     * @param {number} meshIndex
     * @return {Promise<Group|Mesh|SkinnedMesh>}
     */
    loadMesh(meshIndex) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;
      const meshDef = json.meshes[meshIndex];
      const primitives = meshDef.primitives;
      const pending = [];
      for (let i = 0, il = primitives.length; i < il; i++) {
        const material = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
        pending.push(material);
      }
      pending.push(parser.loadGeometries(primitives));
      return Promise.all(pending).then(function(results) {
        const materials = results.slice(0, results.length - 1);
        const geometries = results[results.length - 1];
        const meshes = [];
        for (let i = 0, il = geometries.length; i < il; i++) {
          const geometry = geometries[i];
          const primitive = primitives[i];
          let mesh;
          const material = materials[i];
          if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
            mesh = meshDef.isSkinnedMesh === true ? new SkinnedMesh(geometry, material) : new Mesh(geometry, material);
            if (mesh.isSkinnedMesh === true) {
              mesh.normalizeSkinWeights();
            }
            if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
              mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleStripDrawMode);
            } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
              mesh.geometry = toTrianglesDrawMode(mesh.geometry, TriangleFanDrawMode);
            }
          } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
            mesh = new LineSegments(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
            mesh = new Line(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
            mesh = new LineLoop(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
            mesh = new Points(geometry, material);
          } else {
            throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
          }
          if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
            updateMorphTargets(mesh, meshDef);
          }
          mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
          assignExtrasToUserData(mesh, meshDef);
          if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);
          parser.assignFinalMaterial(mesh);
          meshes.push(mesh);
        }
        for (let i = 0, il = meshes.length; i < il; i++) {
          parser.associations.set(meshes[i], {
            meshes: meshIndex,
            primitives: i
          });
        }
        if (meshes.length === 1) {
          if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);
          return meshes[0];
        }
        const group = new Group();
        if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);
        parser.associations.set(group, { meshes: meshIndex });
        for (let i = 0, il = meshes.length; i < il; i++) {
          group.add(meshes[i]);
        }
        return group;
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
     * @param {number} cameraIndex
     * @return {Promise<THREE.Camera>}
     */
    loadCamera(cameraIndex) {
      let camera;
      const cameraDef = this.json.cameras[cameraIndex];
      const params = cameraDef[cameraDef.type];
      if (!params) {
        console.warn("THREE.GLTFLoader: Missing camera parameters.");
        return;
      }
      if (cameraDef.type === "perspective") {
        camera = new PerspectiveCamera(MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
      } else if (cameraDef.type === "orthographic") {
        camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar);
      }
      if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);
      assignExtrasToUserData(camera, cameraDef);
      return Promise.resolve(camera);
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
     * @param {number} skinIndex
     * @return {Promise<Skeleton>}
     */
    loadSkin(skinIndex) {
      const skinDef = this.json.skins[skinIndex];
      const pending = [];
      for (let i = 0, il = skinDef.joints.length; i < il; i++) {
        pending.push(this._loadNodeShallow(skinDef.joints[i]));
      }
      if (skinDef.inverseBindMatrices !== void 0) {
        pending.push(this.getDependency("accessor", skinDef.inverseBindMatrices));
      } else {
        pending.push(null);
      }
      return Promise.all(pending).then(function(results) {
        const inverseBindMatrices = results.pop();
        const jointNodes = results;
        const bones = [];
        const boneInverses = [];
        for (let i = 0, il = jointNodes.length; i < il; i++) {
          const jointNode = jointNodes[i];
          if (jointNode) {
            bones.push(jointNode);
            const mat = new Matrix4();
            if (inverseBindMatrices !== null) {
              mat.fromArray(inverseBindMatrices.array, i * 16);
            }
            boneInverses.push(mat);
          } else {
            console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinDef.joints[i]);
          }
        }
        return new Skeleton(bones, boneInverses);
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
     * @param {number} animationIndex
     * @return {Promise<AnimationClip>}
     */
    loadAnimation(animationIndex) {
      const json = this.json;
      const parser = this;
      const animationDef = json.animations[animationIndex];
      const animationName = animationDef.name ? animationDef.name : "animation_" + animationIndex;
      const pendingNodes = [];
      const pendingInputAccessors = [];
      const pendingOutputAccessors = [];
      const pendingSamplers = [];
      const pendingTargets = [];
      for (let i = 0, il = animationDef.channels.length; i < il; i++) {
        const channel = animationDef.channels[i];
        const sampler = animationDef.samplers[channel.sampler];
        const target = channel.target;
        const name = target.node;
        const input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
        const output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
        if (target.node === void 0) continue;
        pendingNodes.push(this.getDependency("node", name));
        pendingInputAccessors.push(this.getDependency("accessor", input));
        pendingOutputAccessors.push(this.getDependency("accessor", output));
        pendingSamplers.push(sampler);
        pendingTargets.push(target);
      }
      return Promise.all([
        Promise.all(pendingNodes),
        Promise.all(pendingInputAccessors),
        Promise.all(pendingOutputAccessors),
        Promise.all(pendingSamplers),
        Promise.all(pendingTargets)
      ]).then(function(dependencies) {
        const nodes = dependencies[0];
        const inputAccessors = dependencies[1];
        const outputAccessors = dependencies[2];
        const samplers = dependencies[3];
        const targets = dependencies[4];
        const tracks = [];
        for (let i = 0, il = nodes.length; i < il; i++) {
          const node = nodes[i];
          const inputAccessor = inputAccessors[i];
          const outputAccessor = outputAccessors[i];
          const sampler = samplers[i];
          const target = targets[i];
          if (node === void 0) continue;
          if (node.updateMatrix) {
            node.updateMatrix();
          }
          const createdTracks = parser._createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target);
          if (createdTracks) {
            for (let k = 0; k < createdTracks.length; k++) {
              tracks.push(createdTracks[k]);
            }
          }
        }
        return new AnimationClip(animationName, void 0, tracks);
      });
    }
    createNodeMesh(nodeIndex) {
      const json = this.json;
      const parser = this;
      const nodeDef = json.nodes[nodeIndex];
      if (nodeDef.mesh === void 0) return null;
      return parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
        const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
        if (nodeDef.weights !== void 0) {
          node.traverse(function(o) {
            if (!o.isMesh) return;
            for (let i = 0, il = nodeDef.weights.length; i < il; i++) {
              o.morphTargetInfluences[i] = nodeDef.weights[i];
            }
          });
        }
        return node;
      });
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
     * @param {number} nodeIndex
     * @return {Promise<Object3D>}
     */
    loadNode(nodeIndex) {
      const json = this.json;
      const parser = this;
      const nodeDef = json.nodes[nodeIndex];
      const nodePending = parser._loadNodeShallow(nodeIndex);
      const childPending = [];
      const childrenDef = nodeDef.children || [];
      for (let i = 0, il = childrenDef.length; i < il; i++) {
        childPending.push(parser.getDependency("node", childrenDef[i]));
      }
      const skeletonPending = nodeDef.skin === void 0 ? Promise.resolve(null) : parser.getDependency("skin", nodeDef.skin);
      return Promise.all([
        nodePending,
        Promise.all(childPending),
        skeletonPending
      ]).then(function(results) {
        const node = results[0];
        const children = results[1];
        const skeleton = results[2];
        if (skeleton !== null) {
          node.traverse(function(mesh) {
            if (!mesh.isSkinnedMesh) return;
            mesh.bind(skeleton, _identityMatrix);
          });
        }
        for (let i = 0, il = children.length; i < il; i++) {
          node.add(children[i]);
        }
        return node;
      });
    }
    // ._loadNodeShallow() parses a single node.
    // skin and child nodes are created and added in .loadNode() (no '_' prefix).
    _loadNodeShallow(nodeIndex) {
      const json = this.json;
      const extensions = this.extensions;
      const parser = this;
      if (this.nodeCache[nodeIndex] !== void 0) {
        return this.nodeCache[nodeIndex];
      }
      const nodeDef = json.nodes[nodeIndex];
      const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
      const pending = [];
      const meshPromise = parser._invokeOne(function(ext) {
        return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
      });
      if (meshPromise) {
        pending.push(meshPromise);
      }
      if (nodeDef.camera !== void 0) {
        pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera) {
          return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);
        }));
      }
      parser._invokeAll(function(ext) {
        return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
      }).forEach(function(promise) {
        pending.push(promise);
      });
      this.nodeCache[nodeIndex] = Promise.all(pending).then(function(objects) {
        let node;
        if (nodeDef.isBone === true) {
          node = new Bone();
        } else if (objects.length > 1) {
          node = new Group();
        } else if (objects.length === 1) {
          node = objects[0];
        } else {
          node = new Object3D();
        }
        if (node !== objects[0]) {
          for (let i = 0, il = objects.length; i < il; i++) {
            node.add(objects[i]);
          }
        }
        if (nodeDef.name) {
          node.userData.name = nodeDef.name;
          node.name = nodeName;
        }
        assignExtrasToUserData(node, nodeDef);
        if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);
        if (nodeDef.matrix !== void 0) {
          const matrix = new Matrix4();
          matrix.fromArray(nodeDef.matrix);
          node.applyMatrix4(matrix);
        } else {
          if (nodeDef.translation !== void 0) {
            node.position.fromArray(nodeDef.translation);
          }
          if (nodeDef.rotation !== void 0) {
            node.quaternion.fromArray(nodeDef.rotation);
          }
          if (nodeDef.scale !== void 0) {
            node.scale.fromArray(nodeDef.scale);
          }
        }
        if (!parser.associations.has(node)) {
          parser.associations.set(node, {});
        }
        parser.associations.get(node).nodes = nodeIndex;
        return node;
      });
      return this.nodeCache[nodeIndex];
    }
    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
     * @param {number} sceneIndex
     * @return {Promise<Group>}
     */
    loadScene(sceneIndex) {
      const extensions = this.extensions;
      const sceneDef = this.json.scenes[sceneIndex];
      const parser = this;
      const scene = new Group();
      if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);
      assignExtrasToUserData(scene, sceneDef);
      if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);
      const nodeIds = sceneDef.nodes || [];
      const pending = [];
      for (let i = 0, il = nodeIds.length; i < il; i++) {
        pending.push(parser.getDependency("node", nodeIds[i]));
      }
      return Promise.all(pending).then(function(nodes) {
        for (let i = 0, il = nodes.length; i < il; i++) {
          scene.add(nodes[i]);
        }
        const reduceAssociations = (node) => {
          const reducedAssociations = /* @__PURE__ */ new Map();
          for (const [key, value] of parser.associations) {
            if (key instanceof Material || key instanceof Texture) {
              reducedAssociations.set(key, value);
            }
          }
          node.traverse((node2) => {
            const mappings = parser.associations.get(node2);
            if (mappings != null) {
              reducedAssociations.set(node2, mappings);
            }
          });
          return reducedAssociations;
        };
        parser.associations = reduceAssociations(scene);
        return scene;
      });
    }
    _createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target) {
      const tracks = [];
      const targetName = node.name ? node.name : node.uuid;
      const targetNames = [];
      if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
        node.traverse(function(object) {
          if (object.morphTargetInfluences) {
            targetNames.push(object.name ? object.name : object.uuid);
          }
        });
      } else {
        targetNames.push(targetName);
      }
      let TypedKeyframeTrack;
      switch (PATH_PROPERTIES[target.path]) {
        case PATH_PROPERTIES.weights:
          TypedKeyframeTrack = NumberKeyframeTrack;
          break;
        case PATH_PROPERTIES.rotation:
          TypedKeyframeTrack = QuaternionKeyframeTrack;
          break;
        case PATH_PROPERTIES.position:
        case PATH_PROPERTIES.scale:
          TypedKeyframeTrack = VectorKeyframeTrack;
          break;
        default:
          switch (outputAccessor.itemSize) {
            case 1:
              TypedKeyframeTrack = NumberKeyframeTrack;
              break;
            case 2:
            case 3:
            default:
              TypedKeyframeTrack = VectorKeyframeTrack;
              break;
          }
          break;
      }
      const interpolation = sampler.interpolation !== void 0 ? INTERPOLATION[sampler.interpolation] : InterpolateLinear;
      const outputArray = this._getArrayFromAccessor(outputAccessor);
      for (let j = 0, jl = targetNames.length; j < jl; j++) {
        const track = new TypedKeyframeTrack(
          targetNames[j] + "." + PATH_PROPERTIES[target.path],
          inputAccessor.array,
          outputArray,
          interpolation
        );
        if (sampler.interpolation === "CUBICSPLINE") {
          this._createCubicSplineTrackInterpolant(track);
        }
        tracks.push(track);
      }
      return tracks;
    }
    _getArrayFromAccessor(accessor) {
      let outputArray = accessor.array;
      if (accessor.normalized) {
        const scale = getNormalizedComponentScale(outputArray.constructor);
        const scaled = new Float32Array(outputArray.length);
        for (let j = 0, jl = outputArray.length; j < jl; j++) {
          scaled[j] = outputArray[j] * scale;
        }
        outputArray = scaled;
      }
      return outputArray;
    }
    _createCubicSplineTrackInterpolant(track) {
      track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
        const interpolantType = this instanceof QuaternionKeyframeTrack ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant;
        return new interpolantType(this.times, this.values, this.getValueSize() / 3, result);
      };
      track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
    }
  }
  function computeBounds(geometry, primitiveDef, parser) {
    const attributes = primitiveDef.attributes;
    const box = new Box3();
    if (attributes.POSITION !== void 0) {
      const accessor = parser.json.accessors[attributes.POSITION];
      const min = accessor.min;
      const max = accessor.max;
      if (min !== void 0 && max !== void 0) {
        box.set(
          new Vector3(min[0], min[1], min[2]),
          new Vector3(max[0], max[1], max[2])
        );
        if (accessor.normalized) {
          const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
          box.min.multiplyScalar(boxScale);
          box.max.multiplyScalar(boxScale);
        }
      } else {
        console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
        return;
      }
    } else {
      return;
    }
    const targets = primitiveDef.targets;
    if (targets !== void 0) {
      const maxDisplacement = new Vector3();
      const vector = new Vector3();
      for (let i = 0, il = targets.length; i < il; i++) {
        const target = targets[i];
        if (target.POSITION !== void 0) {
          const accessor = parser.json.accessors[target.POSITION];
          const min = accessor.min;
          const max = accessor.max;
          if (min !== void 0 && max !== void 0) {
            vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
            vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
            vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
            if (accessor.normalized) {
              const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
              vector.multiplyScalar(boxScale);
            }
            maxDisplacement.max(vector);
          } else {
            console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
          }
        }
      }
      box.expandByVector(maxDisplacement);
    }
    geometry.boundingBox = box;
    const sphere = new Sphere();
    box.getCenter(sphere.center);
    sphere.radius = box.min.distanceTo(box.max) / 2;
    geometry.boundingSphere = sphere;
  }
  function addPrimitiveAttributes(geometry, primitiveDef, parser) {
    const attributes = primitiveDef.attributes;
    const pending = [];
    function assignAttributeAccessor(accessorIndex, attributeName) {
      return parser.getDependency("accessor", accessorIndex).then(function(accessor) {
        geometry.setAttribute(attributeName, accessor);
      });
    }
    for (const gltfAttributeName in attributes) {
      const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
      if (threeAttributeName in geometry.attributes) continue;
      pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
    }
    if (primitiveDef.indices !== void 0 && !geometry.index) {
      const accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor2) {
        geometry.setIndex(accessor2);
      });
      pending.push(accessor);
    }
    if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && "COLOR_0" in attributes) {
      console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);
    }
    assignExtrasToUserData(geometry, primitiveDef);
    computeBounds(geometry, primitiveDef, parser);
    return Promise.all(pending).then(function() {
      return primitiveDef.targets !== void 0 ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
    });
  }
  class B3DMLoader extends B3DMLoaderBase {
    constructor(manager = DefaultLoadingManager) {
      super();
      this.manager = manager;
      this.adjustmentTransform = new Matrix4();
    }
    parse(buffer) {
      const b3dm = super.parse(buffer);
      const gltfBuffer = b3dm.glbBytes.slice().buffer;
      return new Promise((resolve, reject) => {
        const manager = this.manager;
        const fetchOptions = this.fetchOptions;
        const loader = manager.getHandler("path.gltf") || new GLTFLoader(manager);
        if (fetchOptions.credentials === "include" && fetchOptions.mode === "cors") {
          loader.setCrossOrigin("use-credentials");
        }
        if ("credentials" in fetchOptions) {
          loader.setWithCredentials(fetchOptions.credentials === "include");
        }
        if (fetchOptions.headers) {
          loader.setRequestHeader(fetchOptions.headers);
        }
        let workingPath = this.workingPath;
        if (!/[\\/]$/.test(workingPath) && workingPath.length) {
          workingPath += "/";
        }
        const adjustmentTransform = this.adjustmentTransform;
        loader.parse(gltfBuffer, workingPath, (model) => {
          const { batchTable, featureTable } = b3dm;
          const { scene } = model;
          const rtcCenter = featureTable.getData("RTC_CENTER", 1, "FLOAT", "VEC3");
          if (rtcCenter) {
            scene.position.x += rtcCenter[0];
            scene.position.y += rtcCenter[1];
            scene.position.z += rtcCenter[2];
          }
          model.scene.updateMatrix();
          model.scene.matrix.multiply(adjustmentTransform);
          model.scene.matrix.decompose(model.scene.position, model.scene.quaternion, model.scene.scale);
          model.batchTable = batchTable;
          model.featureTable = featureTable;
          scene.batchTable = batchTable;
          scene.featureTable = featureTable;
          resolve(model);
        }, reject);
      });
    }
  }
  function rgb565torgb(rgb565) {
    const red5 = rgb565 >> 11;
    const green6 = rgb565 >> 5 & 63;
    const blue5 = rgb565 & 31;
    const red8 = Math.round(red5 / 31 * 255);
    const green8 = Math.round(green6 / 63 * 255);
    const blue8 = Math.round(blue5 / 31 * 255);
    return [red8, green8, blue8];
  }
  const f = new Vector2();
  function decodeOctNormal(x, y, target = new Vector3()) {
    f.set(x, y).divideScalar(256).multiplyScalar(2).subScalar(1);
    target.set(f.x, f.y, 1 - Math.abs(f.x) - Math.abs(f.y));
    const t = MathUtils.clamp(-target.z, 0, 1);
    if (target.x >= 0) {
      target.setX(target.x - t);
    } else {
      target.setX(target.x + t);
    }
    if (target.y >= 0) {
      target.setY(target.y - t);
    } else {
      target.setY(target.y + t);
    }
    target.normalize();
    return target;
  }
  const DRACO_ATTRIBUTE_MAP = {
    RGB: "color",
    POSITION: "position"
  };
  class PNTSLoader extends PNTSLoaderBase {
    constructor(manager = DefaultLoadingManager) {
      super();
      this.manager = manager;
    }
    parse(buffer) {
      return super.parse(buffer).then(async (result) => {
        const { featureTable, batchTable } = result;
        const material = new PointsMaterial();
        const extensions = featureTable.header.extensions;
        const translationOffset = new Vector3();
        let geometry;
        if (extensions && extensions["3DTILES_draco_point_compression"]) {
          const { byteOffset, byteLength, properties } = extensions["3DTILES_draco_point_compression"];
          const dracoLoader = this.manager.getHandler("draco.drc");
          if (dracoLoader == null) {
            throw new Error("PNTSLoader: dracoLoader not available.");
          }
          const attributeIDs = {};
          for (const key in properties) {
            if (key in DRACO_ATTRIBUTE_MAP && key in properties) {
              const mappedKey = DRACO_ATTRIBUTE_MAP[key];
              attributeIDs[mappedKey] = properties[key];
            }
          }
          const taskConfig = {
            attributeIDs,
            attributeTypes: {
              position: "Float32Array",
              color: "Uint8Array"
            },
            useUniqueIDs: true
          };
          const buffer2 = featureTable.getBuffer(byteOffset, byteLength);
          geometry = await dracoLoader.decodeGeometry(buffer2, taskConfig);
          if (geometry.attributes.color) {
            material.vertexColors = true;
          }
        } else {
          const POINTS_LENGTH = featureTable.getData("POINTS_LENGTH");
          const POSITION = featureTable.getData("POSITION", POINTS_LENGTH, "FLOAT", "VEC3");
          const NORMAL = featureTable.getData("NORMAL", POINTS_LENGTH, "FLOAT", "VEC3");
          const NORMAL_OCT16P = featureTable.getData("NORMAL", POINTS_LENGTH, "UNSIGNED_BYTE", "VEC2");
          const RGB = featureTable.getData("RGB", POINTS_LENGTH, "UNSIGNED_BYTE", "VEC3");
          const RGBA = featureTable.getData("RGBA", POINTS_LENGTH, "UNSIGNED_BYTE", "VEC4");
          const RGB565 = featureTable.getData("RGB565", POINTS_LENGTH, "UNSIGNED_SHORT", "SCALAR");
          const CONSTANT_RGBA = featureTable.getData("CONSTANT_RGBA", POINTS_LENGTH, "UNSIGNED_BYTE", "VEC4");
          const POSITION_QUANTIZED = featureTable.getData("POSITION_QUANTIZED", POINTS_LENGTH, "UNSIGNED_SHORT", "VEC3");
          const QUANTIZED_VOLUME_SCALE = featureTable.getData("QUANTIZED_VOLUME_SCALE", POINTS_LENGTH, "FLOAT", "VEC3");
          const QUANTIZED_VOLUME_OFFSET = featureTable.getData("QUANTIZED_VOLUME_OFFSET", POINTS_LENGTH, "FLOAT", "VEC3");
          geometry = new BufferGeometry();
          if (POSITION_QUANTIZED) {
            const decodedPositions = new Float32Array(POINTS_LENGTH * 3);
            for (let i = 0; i < POINTS_LENGTH; i++) {
              for (let j = 0; j < 3; j++) {
                const index = 3 * i + j;
                decodedPositions[index] = POSITION_QUANTIZED[index] / 65535 * QUANTIZED_VOLUME_SCALE[j];
              }
            }
            translationOffset.x = QUANTIZED_VOLUME_OFFSET[0];
            translationOffset.y = QUANTIZED_VOLUME_OFFSET[1];
            translationOffset.z = QUANTIZED_VOLUME_OFFSET[2];
            geometry.setAttribute("position", new BufferAttribute(decodedPositions, 3, false));
          } else {
            geometry.setAttribute("position", new BufferAttribute(POSITION, 3, false));
          }
          if (NORMAL !== null) {
            geometry.setAttribute("normal", new BufferAttribute(NORMAL, 3, false));
          } else if (NORMAL_OCT16P !== null) {
            const decodedNormals = new Float32Array(POINTS_LENGTH * 3);
            const n = new Vector3();
            for (let i = 0; i < POINTS_LENGTH; i++) {
              const x = NORMAL_OCT16P[i * 2];
              const y = NORMAL_OCT16P[i * 2 + 1];
              const normal = decodeOctNormal(x, y, n);
              decodedNormals[i * 3] = normal.x;
              decodedNormals[i * 3 + 1] = normal.y;
              decodedNormals[i * 3 + 2] = normal.z;
            }
            geometry.setAttribute("normal", new BufferAttribute(decodedNormals, 3, false));
          }
          if (RGBA !== null) {
            geometry.setAttribute("color", new BufferAttribute(RGBA, 4, true));
            material.vertexColors = true;
            material.transparent = true;
            material.depthWrite = false;
          } else if (RGB !== null) {
            geometry.setAttribute("color", new BufferAttribute(RGB, 3, true));
            material.vertexColors = true;
          } else if (RGB565 !== null) {
            const color = new Uint8Array(POINTS_LENGTH * 3);
            for (let i = 0; i < POINTS_LENGTH; i++) {
              const rgbColor = rgb565torgb(RGB565[i]);
              for (let j = 0; j < 3; j++) {
                const index = 3 * i + j;
                color[index] = rgbColor[j];
              }
            }
            geometry.setAttribute("color", new BufferAttribute(color, 3, true));
            material.vertexColors = true;
          } else if (CONSTANT_RGBA !== null) {
            const color = new Color(CONSTANT_RGBA[0], CONSTANT_RGBA[1], CONSTANT_RGBA[2]);
            material.color = color;
            const opacity = CONSTANT_RGBA[3] / 255;
            if (opacity < 1) {
              material.opacity = opacity;
              material.transparent = true;
              material.depthWrite = false;
            }
          }
        }
        const object = new Points(geometry, material);
        object.position.copy(translationOffset);
        result.scene = object;
        result.scene.featureTable = featureTable;
        result.scene.batchTable = batchTable;
        const rtcCenter = featureTable.getData("RTC_CENTER", 1, "FLOAT", "VEC3");
        if (rtcCenter) {
          result.scene.position.x += rtcCenter[0];
          result.scene.position.y += rtcCenter[1];
          result.scene.position.z += rtcCenter[2];
        }
        return result;
      });
    }
  }
  const _spherical$1 = new Spherical();
  const _vec$6 = new Vector3();
  const _geoResults = {};
  function swapToGeoFrame(target) {
    const { x, y, z } = target;
    target.x = z;
    target.y = x;
    target.z = y;
  }
  function swapToThreeFrame(target) {
    const { x, y, z } = target;
    target.z = x;
    target.x = y;
    target.y = z;
  }
  function sphericalPhiToLatitude(phi) {
    return -(phi - Math.PI / 2);
  }
  function latitudeToSphericalPhi(latitude) {
    return -latitude + Math.PI / 2;
  }
  function correctGeoCoordWrap(lat, lon, target = {}) {
    _spherical$1.theta = lon;
    _spherical$1.phi = latitudeToSphericalPhi(lat);
    _vec$6.setFromSpherical(_spherical$1);
    _spherical$1.setFromVector3(_vec$6);
    target.lat = sphericalPhiToLatitude(_spherical$1.phi);
    target.lon = _spherical$1.theta;
    return target;
  }
  function toHoursMinutesSecondsString(value, pos = "E", neg = "W") {
    const direction = value < 0 ? neg : pos;
    value = Math.abs(value);
    const hours = ~~value;
    const minDec = (value - hours) * 60;
    const minutes = ~~minDec;
    const secDec = (minDec - minutes) * 60;
    const seconds = ~~secDec;
    return `${hours}° ${minutes}' ${seconds}" ${direction}`;
  }
  function toLatLonString(lat, lon, decimalFormat = false) {
    const result = correctGeoCoordWrap(lat, lon, _geoResults);
    let latString, lonString;
    if (decimalFormat) {
      latString = `${(MathUtils.RAD2DEG * result.lat).toFixed(4)}°`;
      lonString = `${(MathUtils.RAD2DEG * result.lon).toFixed(4)}°`;
    } else {
      latString = toHoursMinutesSecondsString(MathUtils.RAD2DEG * result.lat, "N", "S");
      lonString = toHoursMinutesSecondsString(MathUtils.RAD2DEG * result.lon, "E", "W");
    }
    return `${latString} ${lonString}`;
  }
  const GeoUtils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    latitudeToSphericalPhi,
    sphericalPhiToLatitude,
    swapToGeoFrame,
    swapToThreeFrame,
    toLatLonString
  }, Symbol.toStringTag, { value: "Module" }));
  const _spherical = new Spherical();
  const _norm$1 = new Vector3();
  const _vec$5 = new Vector3();
  const _vec2$1 = new Vector3();
  const _matrix$1 = new Matrix4();
  const _matrix2 = new Matrix4();
  const _matrix3 = new Matrix4();
  const _sphere = new Sphere();
  const _euler$1 = new Euler();
  const _vecX$1 = new Vector3();
  const _vecY$1 = new Vector3();
  const _vecZ$1 = new Vector3();
  const _pos$2 = new Vector3();
  const _ray$3 = new Ray();
  const EPSILON12 = 1e-12;
  const CENTER_EPS = 0.1;
  const ENU_FRAME = 0;
  const CAMERA_FRAME = 1;
  const OBJECT_FRAME = 2;
  class Ellipsoid {
    constructor(x = 1, y = 1, z = 1) {
      this.name = "";
      this.radius = new Vector3(x, y, z);
    }
    intersectRay(ray, target) {
      _matrix$1.makeScale(...this.radius).invert();
      _sphere.center.set(0, 0, 0);
      _sphere.radius = 1;
      _ray$3.copy(ray).applyMatrix4(_matrix$1);
      if (_ray$3.intersectSphere(_sphere, target)) {
        _matrix$1.makeScale(...this.radius);
        target.applyMatrix4(_matrix$1);
        return target;
      } else {
        return null;
      }
    }
    // returns a frame with Z indicating altitude, Y pointing north, X pointing east
    getEastNorthUpFrame(lat, lon, height, target) {
      if (height.isMatrix4) {
        target = height;
        height = 0;
        console.warn('Ellipsoid: The signature for "getEastNorthUpFrame" has changed.');
      }
      this.getEastNorthUpAxes(lat, lon, _vecX$1, _vecY$1, _vecZ$1);
      this.getCartographicToPosition(lat, lon, height, _pos$2);
      return target.makeBasis(_vecX$1, _vecY$1, _vecZ$1).setPosition(_pos$2);
    }
    // returns a frame with z indicating altitude and az, el, roll rotation within that frame
    // - azimuth: measured off of true north, increasing towards "east" (z-axis)
    // - elevation: measured off of the horizon, increasing towards sky (x-axis)
    // - roll: rotation around northern axis (y-axis)
    getOrientedEastNorthUpFrame(lat, lon, height, az, el, roll, target) {
      return this.getObjectFrame(lat, lon, height, az, el, roll, target, ENU_FRAME);
    }
    // returns a frame similar to the ENU frame but rotated to match three.js object and camera conventions
    // OBJECT_FRAME: oriented such that "+Y" is up and "+Z" is forward.
    // CAMERA_FRAME: oriented such that "+Y" is up and "-Z" is forward.
    getObjectFrame(lat, lon, height, az, el, roll, target, frame = OBJECT_FRAME) {
      this.getEastNorthUpFrame(lat, lon, height, _matrix$1);
      _euler$1.set(el, roll, -az, "ZXY");
      target.makeRotationFromEuler(_euler$1).premultiply(_matrix$1);
      if (frame === CAMERA_FRAME) {
        _euler$1.set(Math.PI / 2, 0, 0, "XYZ");
        _matrix2.makeRotationFromEuler(_euler$1);
        target.multiply(_matrix2);
      } else if (frame === OBJECT_FRAME) {
        _euler$1.set(-Math.PI / 2, 0, Math.PI, "XYZ");
        _matrix2.makeRotationFromEuler(_euler$1);
        target.multiply(_matrix2);
      }
      return target;
    }
    getCartographicFromObjectFrame(matrix, target, frame = OBJECT_FRAME) {
      if (frame === CAMERA_FRAME) {
        _euler$1.set(-Math.PI / 2, 0, 0, "XYZ");
        _matrix2.makeRotationFromEuler(_euler$1).premultiply(matrix);
      } else if (frame === OBJECT_FRAME) {
        _euler$1.set(-Math.PI / 2, 0, Math.PI, "XYZ");
        _matrix2.makeRotationFromEuler(_euler$1).premultiply(matrix);
      } else {
        _matrix2.copy(matrix);
      }
      _pos$2.setFromMatrixPosition(_matrix2);
      this.getPositionToCartographic(_pos$2, target);
      this.getEastNorthUpFrame(target.lat, target.lon, 0, _matrix$1).invert();
      _matrix2.premultiply(_matrix$1);
      _euler$1.setFromRotationMatrix(_matrix2, "ZXY");
      target.azimuth = -_euler$1.z;
      target.elevation = _euler$1.x;
      target.roll = _euler$1.y;
      return target;
    }
    getEastNorthUpAxes(lat, lon, vecEast, vecNorth, vecUp, point = _pos$2) {
      this.getCartographicToPosition(lat, lon, 0, point);
      this.getCartographicToNormal(lat, lon, vecUp);
      vecEast.set(-point.y, point.x, 0).normalize();
      vecNorth.crossVectors(vecUp, vecEast).normalize();
    }
    // azimuth: measured off of true north, increasing towards "east"
    // elevation: measured off of the horizon, increasing towards sky
    // roll: rotation around northern axis
    getAzElRollFromRotationMatrix(lat, lon, rotationMatrix, target, frame = ENU_FRAME) {
      console.warn('Ellipsoid: "getAzElRollFromRotationMatrix" is deprecated. Use "getCartographicFromObjectFrame", instead.');
      this.getCartographicToPosition(lat, lon, 0, _pos$2);
      _matrix3.copy(rotationMatrix).setPosition(_pos$2);
      this.getCartographicFromObjectFrame(_matrix3, target, frame);
      delete target.height;
      delete target.lat;
      delete target.lon;
      return target;
    }
    getRotationMatrixFromAzElRoll(lat, lon, az, el, roll, target, frame = ENU_FRAME) {
      console.warn('Ellipsoid: "getRotationMatrixFromAzElRoll" function has been deprecated. Use "getObjectFrame", instead.');
      this.getObjectFrame(lat, lon, 0, az, el, roll, target, frame);
      target.setPosition(0, 0, 0);
      return target;
    }
    getFrame(lat, lon, az, el, roll, height, target, frame = ENU_FRAME) {
      console.warn('Ellipsoid: "getFrame" function has been deprecated. Use "getObjectFrame", instead.');
      return this.getObjectFrame(lat, lon, height, az, el, roll, target, frame);
    }
    getCartographicToPosition(lat, lon, height, target) {
      this.getCartographicToNormal(lat, lon, _norm$1);
      const radius = this.radius;
      _vec$5.copy(_norm$1);
      _vec$5.x *= radius.x ** 2;
      _vec$5.y *= radius.y ** 2;
      _vec$5.z *= radius.z ** 2;
      const gamma = Math.sqrt(_norm$1.dot(_vec$5));
      _vec$5.divideScalar(gamma);
      return target.copy(_vec$5).addScaledVector(_norm$1, height);
    }
    getPositionToCartographic(pos, target) {
      this.getPositionToSurfacePoint(pos, _vec$5);
      this.getPositionToNormal(pos, _norm$1);
      const heightDelta = _vec2$1.subVectors(pos, _vec$5);
      target.lon = Math.atan2(_norm$1.y, _norm$1.x);
      target.lat = Math.asin(_norm$1.z);
      target.height = Math.sign(heightDelta.dot(pos)) * heightDelta.length();
      return target;
    }
    getCartographicToNormal(lat, lon, target) {
      _spherical.set(1, latitudeToSphericalPhi(lat), lon);
      target.setFromSpherical(_spherical).normalize();
      swapToGeoFrame(target);
      return target;
    }
    getPositionToNormal(pos, target) {
      const radius = this.radius;
      target.copy(pos);
      target.x /= radius.x ** 2;
      target.y /= radius.y ** 2;
      target.z /= radius.z ** 2;
      target.normalize();
      return target;
    }
    getPositionToSurfacePoint(pos, target) {
      const radius = this.radius;
      const invRadiusSqX = 1 / radius.x ** 2;
      const invRadiusSqY = 1 / radius.y ** 2;
      const invRadiusSqZ = 1 / radius.z ** 2;
      const x2 = pos.x * pos.x * invRadiusSqX;
      const y2 = pos.y * pos.y * invRadiusSqY;
      const z2 = pos.z * pos.z * invRadiusSqZ;
      const squaredNorm = x2 + y2 + z2;
      const ratio = Math.sqrt(1 / squaredNorm);
      const intersection = _vec$5.copy(pos).multiplyScalar(ratio);
      if (squaredNorm < CENTER_EPS) {
        return !isFinite(ratio) ? null : target.copy(intersection);
      }
      const gradient = _vec2$1.set(
        intersection.x * invRadiusSqX * 2,
        intersection.y * invRadiusSqY * 2,
        intersection.z * invRadiusSqZ * 2
      );
      let lambda = (1 - ratio) * pos.length() / (0.5 * gradient.length());
      let correction = 0;
      let func, denominator;
      let xMultiplier, yMultiplier, zMultiplier;
      let xMultiplier2, yMultiplier2, zMultiplier2;
      let xMultiplier3, yMultiplier3, zMultiplier3;
      do {
        lambda -= correction;
        xMultiplier = 1 / (1 + lambda * invRadiusSqX);
        yMultiplier = 1 / (1 + lambda * invRadiusSqY);
        zMultiplier = 1 / (1 + lambda * invRadiusSqZ);
        xMultiplier2 = xMultiplier * xMultiplier;
        yMultiplier2 = yMultiplier * yMultiplier;
        zMultiplier2 = zMultiplier * zMultiplier;
        xMultiplier3 = xMultiplier2 * xMultiplier;
        yMultiplier3 = yMultiplier2 * yMultiplier;
        zMultiplier3 = zMultiplier2 * zMultiplier;
        func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1;
        denominator = x2 * xMultiplier3 * invRadiusSqX + y2 * yMultiplier3 * invRadiusSqY + z2 * zMultiplier3 * invRadiusSqZ;
        const derivative = -2 * denominator;
        correction = func / derivative;
      } while (Math.abs(func) > EPSILON12);
      return target.set(
        pos.x * xMultiplier,
        pos.y * yMultiplier,
        pos.z * zMultiplier
      );
    }
    calculateHorizonDistance(latitude, elevation) {
      const effectiveRadius = this.calculateEffectiveRadius(latitude);
      return Math.sqrt(2 * effectiveRadius * elevation + elevation ** 2);
    }
    calculateEffectiveRadius(latitude) {
      const semiMajorAxis = this.radius.x;
      const semiMinorAxis = this.radius.z;
      const eSquared = 1 - semiMinorAxis ** 2 / semiMajorAxis ** 2;
      const phi = latitude * MathUtils.DEG2RAD;
      const sinPhiSquared = Math.sin(phi) ** 2;
      const N = semiMajorAxis / Math.sqrt(1 - eSquared * sinPhiSquared);
      return N;
    }
    getPositionElevation(pos) {
      this.getPositionToSurfacePoint(pos, _vec$5);
      const heightDelta = _vec2$1.subVectors(pos, _vec$5);
      return Math.sign(heightDelta.dot(pos)) * heightDelta.length();
    }
    // Returns an estimate of the closest point on the ellipsoid to the ray. Returns
    // the surface intersection if they collide.
    closestPointToRayEstimate(ray, target) {
      if (this.intersectRay(ray, target)) {
        return target;
      } else {
        _matrix$1.makeScale(...this.radius).invert();
        _ray$3.copy(ray).applyMatrix4(_matrix$1);
        _vec$5.set(0, 0, 0);
        _ray$3.closestPointToPoint(_vec$5, target).normalize();
        _matrix$1.makeScale(...this.radius);
        return target.applyMatrix4(_matrix$1);
      }
    }
    copy(source) {
      this.radius.copy(source.radius);
      return this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const WGS84_ELLIPSOID = new Ellipsoid(WGS84_RADIUS, WGS84_RADIUS, WGS84_HEIGHT);
  WGS84_ELLIPSOID.name = "WGS84 Earth";
  const tempFwd = /* @__PURE__ */ new Vector3();
  const tempUp = /* @__PURE__ */ new Vector3();
  const tempRight = /* @__PURE__ */ new Vector3();
  const tempPos = /* @__PURE__ */ new Vector3();
  const tempQuat = /* @__PURE__ */ new Quaternion();
  const tempSca = /* @__PURE__ */ new Vector3();
  const tempMat$2 = /* @__PURE__ */ new Matrix4();
  const tempMat2 = /* @__PURE__ */ new Matrix4();
  const tempGlobePos = /* @__PURE__ */ new Vector3();
  const tempEnuFrame = /* @__PURE__ */ new Matrix4();
  const tempLocalQuat = /* @__PURE__ */ new Quaternion();
  const tempLatLon = {};
  class I3DMLoader extends I3DMLoaderBase {
    constructor(manager = DefaultLoadingManager) {
      super();
      this.manager = manager;
      this.adjustmentTransform = new Matrix4();
      this.ellipsoid = WGS84_ELLIPSOID.clone();
    }
    resolveExternalURL(url) {
      return this.manager.resolveURL(super.resolveExternalURL(url));
    }
    parse(buffer) {
      return super.parse(buffer).then((i3dm) => {
        const { featureTable, batchTable } = i3dm;
        const gltfBuffer = i3dm.glbBytes.slice().buffer;
        return new Promise((resolve, reject) => {
          const fetchOptions = this.fetchOptions;
          const manager = this.manager;
          const loader = manager.getHandler("path.gltf") || new GLTFLoader(manager);
          if (fetchOptions.credentials === "include" && fetchOptions.mode === "cors") {
            loader.setCrossOrigin("use-credentials");
          }
          if ("credentials" in fetchOptions) {
            loader.setWithCredentials(fetchOptions.credentials === "include");
          }
          if (fetchOptions.headers) {
            loader.setRequestHeader(fetchOptions.headers);
          }
          let workingPath = i3dm.gltfWorkingPath ?? this.workingPath;
          if (!/[\\/]$/.test(workingPath)) {
            workingPath += "/";
          }
          const adjustmentTransform = this.adjustmentTransform;
          loader.parse(gltfBuffer, workingPath, (model) => {
            const INSTANCES_LENGTH = featureTable.getData("INSTANCES_LENGTH");
            let POSITION = featureTable.getData("POSITION", INSTANCES_LENGTH, "FLOAT", "VEC3");
            const POSITION_QUANTIZED = featureTable.getData("POSITION_QUANTIZED", INSTANCES_LENGTH, "UNSIGNED_SHORT", "VEC3");
            const QUANTIZED_VOLUME_OFFSET = featureTable.getData("QUANTIZED_VOLUME_OFFSET", 1, "FLOAT", "VEC3");
            const QUANTIZED_VOLUME_SCALE = featureTable.getData("QUANTIZED_VOLUME_SCALE", 1, "FLOAT", "VEC3");
            const NORMAL_UP = featureTable.getData("NORMAL_UP", INSTANCES_LENGTH, "FLOAT", "VEC3");
            const NORMAL_RIGHT = featureTable.getData("NORMAL_RIGHT", INSTANCES_LENGTH, "FLOAT", "VEC3");
            const SCALE_NON_UNIFORM = featureTable.getData("SCALE_NON_UNIFORM", INSTANCES_LENGTH, "FLOAT", "VEC3");
            const SCALE = featureTable.getData("SCALE", INSTANCES_LENGTH, "FLOAT", "SCALAR");
            const RTC_CENTER = featureTable.getData("RTC_CENTER", 1, "FLOAT", "VEC3");
            const EAST_NORTH_UP = featureTable.getData("EAST_NORTH_UP");
            [
              "NORMAL_UP_OCT32P",
              "NORMAL_RIGHT_OCT32P"
            ].forEach((feature) => {
              if (feature in featureTable.header) {
                console.warn(`I3DMLoader: Unsupported FeatureTable feature "${feature}" detected.`);
              }
            });
            if (!POSITION && POSITION_QUANTIZED) {
              POSITION = new Float32Array(INSTANCES_LENGTH * 3);
              for (let i = 0; i < INSTANCES_LENGTH; i++) {
                POSITION[i * 3 + 0] = QUANTIZED_VOLUME_OFFSET[0] + POSITION_QUANTIZED[i * 3 + 0] / 65535 * QUANTIZED_VOLUME_SCALE[0];
                POSITION[i * 3 + 1] = QUANTIZED_VOLUME_OFFSET[1] + POSITION_QUANTIZED[i * 3 + 1] / 65535 * QUANTIZED_VOLUME_SCALE[1];
                POSITION[i * 3 + 2] = QUANTIZED_VOLUME_OFFSET[2] + POSITION_QUANTIZED[i * 3 + 2] / 65535 * QUANTIZED_VOLUME_SCALE[2];
              }
            }
            const averageVector = new Vector3();
            for (let i = 0; i < INSTANCES_LENGTH; i++) {
              averageVector.x += POSITION[i * 3 + 0] / INSTANCES_LENGTH;
              averageVector.y += POSITION[i * 3 + 1] / INSTANCES_LENGTH;
              averageVector.z += POSITION[i * 3 + 2] / INSTANCES_LENGTH;
            }
            const instances = [];
            const meshes = [];
            model.scene.updateMatrixWorld();
            model.scene.traverse((child) => {
              if (child.isMesh) {
                meshes.push(child);
                const { geometry, material } = child;
                const instancedMesh = new InstancedMesh(geometry, material, INSTANCES_LENGTH);
                instancedMesh.position.copy(averageVector);
                if (RTC_CENTER) {
                  instancedMesh.position.x += RTC_CENTER[0];
                  instancedMesh.position.y += RTC_CENTER[1];
                  instancedMesh.position.z += RTC_CENTER[2];
                }
                instances.push(instancedMesh);
              }
            });
            for (let i = 0; i < INSTANCES_LENGTH; i++) {
              tempPos.set(
                POSITION[i * 3 + 0] - averageVector.x,
                POSITION[i * 3 + 1] - averageVector.y,
                POSITION[i * 3 + 2] - averageVector.z
              );
              tempQuat.identity();
              if (NORMAL_UP) {
                tempUp.set(
                  NORMAL_UP[i * 3 + 0],
                  NORMAL_UP[i * 3 + 1],
                  NORMAL_UP[i * 3 + 2]
                );
                tempRight.set(
                  NORMAL_RIGHT[i * 3 + 0],
                  NORMAL_RIGHT[i * 3 + 1],
                  NORMAL_RIGHT[i * 3 + 2]
                );
                tempFwd.crossVectors(tempRight, tempUp).normalize();
                tempMat$2.makeBasis(
                  tempRight,
                  tempUp,
                  tempFwd
                );
                tempQuat.setFromRotationMatrix(tempMat$2);
              }
              tempSca.set(1, 1, 1);
              if (SCALE_NON_UNIFORM) {
                tempSca.set(
                  SCALE_NON_UNIFORM[i * 3 + 0],
                  SCALE_NON_UNIFORM[i * 3 + 1],
                  SCALE_NON_UNIFORM[i * 3 + 2]
                );
              }
              if (SCALE) {
                tempSca.multiplyScalar(SCALE[i]);
              }
              for (let j = 0, l = instances.length; j < l; j++) {
                const instance = instances[j];
                tempLocalQuat.copy(tempQuat);
                if (EAST_NORTH_UP) {
                  instance.updateMatrixWorld();
                  tempGlobePos.copy(tempPos).applyMatrix4(instance.matrixWorld);
                  this.ellipsoid.getPositionToCartographic(tempGlobePos, tempLatLon);
                  this.ellipsoid.getEastNorthUpFrame(tempLatLon.lat, tempLatLon.lon, tempEnuFrame);
                  tempLocalQuat.setFromRotationMatrix(tempEnuFrame);
                }
                tempMat$2.compose(tempPos, tempLocalQuat, tempSca).multiply(adjustmentTransform);
                const mesh = meshes[j];
                tempMat2.multiplyMatrices(tempMat$2, mesh.matrixWorld);
                instance.setMatrixAt(i, tempMat2);
              }
            }
            model.scene.clear();
            model.scene.add(...instances);
            model.batchTable = batchTable;
            model.featureTable = featureTable;
            model.scene.batchTable = batchTable;
            model.scene.featureTable = featureTable;
            resolve(model);
          }, reject);
        });
      });
    }
  }
  class CMPTLoader extends CMPTLoaderBase {
    constructor(manager = DefaultLoadingManager) {
      super();
      this.manager = manager;
      this.adjustmentTransform = new Matrix4();
      this.ellipsoid = WGS84_ELLIPSOID.clone();
    }
    parse(buffer) {
      const result = super.parse(buffer);
      const { manager, ellipsoid, adjustmentTransform } = this;
      const promises = [];
      for (const i in result.tiles) {
        const { type, buffer: buffer2 } = result.tiles[i];
        switch (type) {
          case "b3dm": {
            const slicedBuffer = buffer2.slice();
            const loader = new B3DMLoader(manager);
            loader.workingPath = this.workingPath;
            loader.fetchOptions = this.fetchOptions;
            loader.adjustmentTransform.copy(adjustmentTransform);
            const promise = loader.parse(slicedBuffer.buffer);
            promises.push(promise);
            break;
          }
          case "pnts": {
            const slicedBuffer = buffer2.slice();
            const loader = new PNTSLoader(manager);
            loader.workingPath = this.workingPath;
            loader.fetchOptions = this.fetchOptions;
            const promise = loader.parse(slicedBuffer.buffer);
            promises.push(promise);
            break;
          }
          case "i3dm": {
            const slicedBuffer = buffer2.slice();
            const loader = new I3DMLoader(manager);
            loader.workingPath = this.workingPath;
            loader.fetchOptions = this.fetchOptions;
            loader.ellipsoid.copy(ellipsoid);
            loader.adjustmentTransform.copy(adjustmentTransform);
            const promise = loader.parse(slicedBuffer.buffer);
            promises.push(promise);
            break;
          }
        }
      }
      return Promise.all(promises).then((results) => {
        const group = new Group();
        results.forEach((result2) => {
          group.add(result2.scene);
        });
        return {
          tiles: results,
          scene: group
        };
      });
    }
  }
  const tempMat$1 = new Matrix4();
  class TilesGroup extends Group {
    constructor(tilesRenderer) {
      super();
      this.isTilesGroup = true;
      this.name = "TilesRenderer.TilesGroup";
      this.tilesRenderer = tilesRenderer;
      this.matrixWorldInverse = new Matrix4();
    }
    raycast(raycaster, intersects) {
      if (this.tilesRenderer.optimizeRaycast) {
        this.tilesRenderer.raycast(raycaster, intersects);
        return false;
      }
      return true;
    }
    updateMatrixWorld(force) {
      if (this.matrixAutoUpdate) {
        this.updateMatrix();
      }
      if (this.matrixWorldNeedsUpdate || force) {
        if (this.parent === null) {
          tempMat$1.copy(this.matrix);
        } else {
          tempMat$1.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        }
        this.matrixWorldNeedsUpdate = false;
        const elA = tempMat$1.elements;
        const elB = this.matrixWorld.elements;
        let isDifferent = false;
        for (let i = 0; i < 16; i++) {
          const itemA = elA[i];
          const itemB = elB[i];
          const diff = Math.abs(itemA - itemB);
          if (diff > Number.EPSILON) {
            isDifferent = true;
            break;
          }
        }
        if (isDifferent) {
          this.matrixWorld.copy(tempMat$1);
          this.matrixWorldInverse.copy(tempMat$1).invert();
          const children = this.children;
          for (let i = 0, l = children.length; i < l; i++) {
            children[i].updateMatrixWorld();
          }
        }
      }
    }
    updateWorldMatrix(updateParents, updateChildren) {
      if (this.parent && updateParents) {
        this.parent.updateWorldMatrix(updateParents, false);
      }
      this.updateMatrixWorld(true);
    }
  }
  const _localRay = new Ray();
  const _vec$4 = new Vector3();
  const _hitArray = [];
  function distanceSort(a, b) {
    return a.distance - b.distance;
  }
  function intersectTileScene(tile, raycaster, renderer, intersects) {
    const { scene } = tile.cached;
    const didRaycast = renderer.invokeOnePlugin((plugin) => plugin.raycastTile && plugin.raycastTile(tile, scene, raycaster, intersects));
    if (!didRaycast) {
      raycaster.intersectObject(scene, true, intersects);
    }
  }
  function intersectTileSceneFirstHist(tile, raycaster, renderer) {
    intersectTileScene(tile, raycaster, renderer, _hitArray);
    _hitArray.sort(distanceSort);
    const hit = _hitArray[0] || null;
    _hitArray.length = 0;
    return hit;
  }
  function isTileInitialized(tile) {
    return "__used" in tile;
  }
  function raycastTraverseFirstHit(renderer, tile, raycaster, localRay = null) {
    const { group, activeTiles } = renderer;
    if (localRay === null) {
      localRay = _localRay;
      localRay.copy(raycaster.ray).applyMatrix4(group.matrixWorldInverse);
    }
    const array = [];
    const children = tile.children;
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      if (!isTileInitialized(child) || !child.__used) {
        continue;
      }
      const boundingVolume = child.cached.boundingVolume;
      if (boundingVolume.intersectRay(localRay, _vec$4) !== null) {
        _vec$4.applyMatrix4(group.matrixWorld);
        array.push({
          distance: _vec$4.distanceToSquared(raycaster.ray.origin),
          tile: child
        });
      }
    }
    array.sort(distanceSort);
    let bestHit = null;
    let bestHitDistSq = Infinity;
    if (activeTiles.has(tile)) {
      const hit = intersectTileSceneFirstHist(tile, raycaster, renderer);
      if (hit) {
        bestHit = hit;
        bestHitDistSq = hit.distance * hit.distance;
      }
    }
    for (let i = 0, l = array.length; i < l; i++) {
      const data = array[i];
      const boundingVolumeDistSq = data.distance;
      const tile2 = data.tile;
      if (boundingVolumeDistSq > bestHitDistSq) {
        break;
      }
      const hit = raycastTraverseFirstHit(renderer, tile2, raycaster, localRay);
      if (hit) {
        const hitDistSq = hit.distance * hit.distance;
        if (hitDistSq < bestHitDistSq) {
          bestHit = hit;
          bestHitDistSq = hitDistSq;
        }
      }
    }
    return bestHit;
  }
  function raycastTraverse(renderer, tile, raycaster, intersects, localRay = null) {
    if (!isTileInitialized(tile)) {
      return;
    }
    const { group, activeTiles } = renderer;
    const { boundingVolume } = tile.cached;
    if (localRay === null) {
      localRay = _localRay;
      localRay.copy(raycaster.ray).applyMatrix4(group.matrixWorldInverse);
    }
    if (!tile.__used || !boundingVolume.intersectsRay(localRay)) {
      return;
    }
    if (activeTiles.has(tile)) {
      intersectTileScene(tile, raycaster, renderer, intersects);
    }
    const children = tile.children;
    for (let i = 0, l = children.length; i < l; i++) {
      raycastTraverse(renderer, children[i], raycaster, intersects, localRay);
    }
  }
  const _worldMin = new Vector3();
  const _worldMax = new Vector3();
  const _norm = new Vector3();
  const _ray$2 = new Ray();
  class OBB {
    constructor(box = new Box3(), transform = new Matrix4()) {
      this.box = box.clone();
      this.transform = transform.clone();
      this.inverseTransform = new Matrix4();
      this.points = new Array(8).fill().map(() => new Vector3());
      this.planes = new Array(6).fill().map(() => new Plane());
    }
    copy(source) {
      this.box.copy(source.box);
      this.transform.copy(source.transform);
      this.update();
      return this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    /**
     * Clamps the given point within the bounds of this OBB
     * @param {Vector3} point
     * @param {Vector3} result
     * @returns {Vector3}
     */
    clampPoint(point, result) {
      return result.copy(point).applyMatrix4(this.inverseTransform).clamp(this.box.min, this.box.max).applyMatrix4(this.transform);
    }
    /**
     * Returns the distance from any edge of this OBB to the specified point.
     * If the point lies inside of this box, the distance will be 0.
     * @param {Vector3} point
     * @returns {number}
     */
    distanceToPoint(point) {
      return this.clampPoint(point, _norm).distanceTo(point);
    }
    containsPoint(point) {
      _norm.copy(point).applyMatrix4(this.inverseTransform);
      return this.box.containsPoint(_norm);
    }
    // returns boolean indicating whether the ray has intersected the obb
    intersectsRay(ray) {
      _ray$2.copy(ray).applyMatrix4(this.inverseTransform);
      return _ray$2.intersectsBox(this.box);
    }
    // Sets "target" equal to the intersection point.
    // Returns "null" if no intersection found.
    intersectRay(ray, target) {
      _ray$2.copy(ray).applyMatrix4(this.inverseTransform);
      if (_ray$2.intersectBox(this.box, target)) {
        target.applyMatrix4(this.transform);
        return target;
      } else {
        return null;
      }
    }
    update() {
      const { points, inverseTransform, transform, box } = this;
      inverseTransform.copy(transform).invert();
      const { min, max } = box;
      let index = 0;
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            points[index].set(
              x < 0 ? min.x : max.x,
              y < 0 ? min.y : max.y,
              z < 0 ? min.z : max.z
            ).applyMatrix4(transform);
            index++;
          }
        }
      }
      this.updatePlanes();
    }
    updatePlanes() {
      _worldMin.copy(this.box.min).applyMatrix4(this.transform);
      _worldMax.copy(this.box.max).applyMatrix4(this.transform);
      _norm.set(0, 0, 1).transformDirection(this.transform);
      this.planes[0].setFromNormalAndCoplanarPoint(_norm, _worldMin);
      this.planes[1].setFromNormalAndCoplanarPoint(_norm, _worldMax).negate();
      _norm.set(0, 1, 0).transformDirection(this.transform);
      this.planes[2].setFromNormalAndCoplanarPoint(_norm, _worldMin);
      this.planes[3].setFromNormalAndCoplanarPoint(_norm, _worldMax).negate();
      _norm.set(1, 0, 0).transformDirection(this.transform);
      this.planes[4].setFromNormalAndCoplanarPoint(_norm, _worldMin);
      this.planes[5].setFromNormalAndCoplanarPoint(_norm, _worldMax).negate();
    }
    intersectsSphere(sphere) {
      this.clampPoint(sphere.center, _norm);
      return _norm.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
    }
    intersectsFrustum(frustum) {
      return this._intersectsPlaneShape(frustum.planes, frustum.points);
    }
    intersectsOBB(obb) {
      return this._intersectsPlaneShape(obb.planes, obb.points);
    }
    // takes a series of 6 planes that define and enclosed shape and the 8 points that lie at the corners
    // of that shape to determine whether the OBB is intersected with.
    _intersectsPlaneShape(otherPlanes, otherPoints) {
      const thisPoints = this.points;
      const thisPlanes = this.planes;
      for (let i = 0; i < 6; i++) {
        const plane = otherPlanes[i];
        let maxDistance = -Infinity;
        for (let j = 0; j < 8; j++) {
          const v = thisPoints[j];
          const dist = plane.distanceToPoint(v);
          maxDistance = maxDistance < dist ? dist : maxDistance;
        }
        if (maxDistance < 0) {
          return false;
        }
      }
      for (let i = 0; i < 6; i++) {
        const plane = thisPlanes[i];
        let maxDistance = -Infinity;
        for (let j = 0; j < 8; j++) {
          const v = otherPoints[j];
          const dist = plane.distanceToPoint(v);
          maxDistance = maxDistance < dist ? dist : maxDistance;
        }
        if (maxDistance < 0) {
          return false;
        }
      }
      return true;
    }
  }
  const PI = Math.PI;
  const HALF_PI = PI / 2;
  const _orthoX = new Vector3();
  const _orthoY = new Vector3();
  const _orthoZ = new Vector3();
  const _invMatrix$2 = new Matrix4();
  let _poolIndex = 0;
  const _pointsPool = [];
  function getVector(usePool = false) {
    if (!usePool) {
      return new Vector3();
    }
    if (!_pointsPool[_poolIndex]) {
      _pointsPool[_poolIndex] = new Vector3();
    }
    _poolIndex++;
    return _pointsPool[_poolIndex - 1];
  }
  function resetPool() {
    _poolIndex = 0;
  }
  class EllipsoidRegion extends Ellipsoid {
    constructor(x, y, z, latStart = -HALF_PI, latEnd = HALF_PI, lonStart = 0, lonEnd = 2 * PI, heightStart = 0, heightEnd = 0) {
      super(x, y, z);
      this.latStart = latStart;
      this.latEnd = latEnd;
      this.lonStart = lonStart;
      this.lonEnd = lonEnd;
      this.heightStart = heightStart;
      this.heightEnd = heightEnd;
    }
    _getPoints(usePool = false) {
      const {
        latStart,
        latEnd,
        lonStart,
        lonEnd,
        heightStart,
        heightEnd
      } = this;
      const midLat = MathUtils.mapLinear(0.5, 0, 1, latStart, latEnd);
      const midLon = MathUtils.mapLinear(0.5, 0, 1, lonStart, lonEnd);
      const lonOffset = Math.floor(lonStart / HALF_PI) * HALF_PI;
      const latlon = [
        [-PI / 2, 0],
        [PI / 2, 0],
        [0, lonOffset],
        [0, lonOffset + PI / 2],
        [0, lonOffset + PI],
        [0, lonOffset + 3 * PI / 2],
        [latStart, lonEnd],
        [latEnd, lonEnd],
        [latStart, lonStart],
        [latEnd, lonStart],
        [0, lonStart],
        [0, lonEnd],
        [midLat, midLon],
        [latStart, midLon],
        [latEnd, midLon],
        [midLat, lonStart],
        [midLat, lonEnd]
      ];
      const target = [];
      const total = latlon.length;
      for (let z = 0; z <= 1; z++) {
        const height = MathUtils.mapLinear(z, 0, 1, heightStart, heightEnd);
        for (let i = 0, l = total; i < l; i++) {
          const [lat, lon] = latlon[i];
          if (lat >= latStart && lat <= latEnd && lon >= lonStart && lon <= lonEnd) {
            const v = getVector(usePool);
            target.push(v);
            this.getCartographicToPosition(lat, lon, height, v);
          }
        }
      }
      return target;
    }
    getBoundingBox(box, matrix) {
      resetPool();
      const {
        latStart,
        latEnd,
        lonStart,
        lonEnd
      } = this;
      const latRange = latEnd - latStart;
      if (latRange < PI / 2) {
        const midLat = MathUtils.mapLinear(0.5, 0, 1, latStart, latEnd);
        const midLon = MathUtils.mapLinear(0.5, 0, 1, lonStart, lonEnd);
        this.getCartographicToNormal(midLat, midLon, _orthoZ);
        _orthoY.set(0, 0, 1);
        _orthoX.crossVectors(_orthoY, _orthoZ);
        _orthoY.crossVectors(_orthoX, _orthoZ);
        matrix.makeBasis(_orthoX, _orthoY, _orthoZ);
      } else {
        _orthoX.set(1, 0, 0);
        _orthoY.set(0, 1, 0);
        _orthoZ.set(0, 0, 1);
        matrix.makeBasis(_orthoX, _orthoY, _orthoZ);
      }
      _invMatrix$2.copy(matrix).invert();
      const points = this._getPoints(true);
      for (let i = 0, l = points.length; i < l; i++) {
        points[i].applyMatrix4(_invMatrix$2);
      }
      box.makeEmpty();
      box.setFromPoints(points);
    }
    getBoundingSphere(sphere, center) {
      resetPool();
      const points = this._getPoints(true);
      sphere.makeEmpty();
      sphere.setFromPoints(points, center);
    }
  }
  const _vecX = new Vector3();
  const _vecY = new Vector3();
  const _vecZ = new Vector3();
  const _sphereVec = new Vector3();
  const _obbVec = new Vector3();
  class TileBoundingVolume {
    constructor() {
      this.sphere = null;
      this.obb = null;
      this.region = null;
      this.regionObb = null;
    }
    intersectsRay(ray) {
      const sphere = this.sphere;
      const obb = this.obb || this.regionObb;
      if (sphere && !ray.intersectsSphere(sphere)) {
        return false;
      }
      if (obb && !obb.intersectsRay(ray)) {
        return false;
      }
      return true;
    }
    intersectRay(ray, target = null) {
      const sphere = this.sphere;
      const obb = this.obb || this.regionObb;
      let sphereDistSq = -Infinity;
      let obbDistSq = -Infinity;
      if (sphere) {
        if (ray.intersectSphere(sphere, _sphereVec)) {
          sphereDistSq = sphere.containsPoint(ray.origin) ? 0 : ray.origin.distanceToSquared(_sphereVec);
        }
      }
      if (obb) {
        if (obb.intersectRay(ray, _obbVec)) {
          obbDistSq = obb.containsPoint(ray.origin) ? 0 : ray.origin.distanceToSquared(_obbVec);
        }
      }
      const furthestDist = Math.max(sphereDistSq, obbDistSq);
      if (furthestDist === -Infinity) {
        return null;
      }
      ray.at(Math.sqrt(furthestDist), target);
      return target;
    }
    distanceToPoint(point) {
      const sphere = this.sphere;
      const obb = this.obb || this.regionObb;
      let sphereDistance = -Infinity;
      let obbDistance = -Infinity;
      if (sphere) {
        sphereDistance = Math.max(sphere.distanceToPoint(point), 0);
      }
      if (obb) {
        obbDistance = obb.distanceToPoint(point);
      }
      return sphereDistance > obbDistance ? sphereDistance : obbDistance;
    }
    intersectsFrustum(frustum) {
      const obb = this.obb || this.regionObb;
      const sphere = this.sphere;
      if (sphere && !frustum.intersectsSphere(sphere)) {
        return false;
      }
      if (obb && !obb.intersectsFrustum(frustum)) {
        return false;
      }
      return Boolean(sphere || obb);
    }
    intersectsSphere(otherSphere) {
      const obb = this.obb || this.regionObb;
      const sphere = this.sphere;
      if (sphere && !sphere.intersectsSphere(otherSphere)) {
        return false;
      }
      if (obb && !obb.intersectsSphere(otherSphere)) {
        return false;
      }
      return Boolean(sphere || obb);
    }
    intersectsOBB(otherObb) {
      const obb = this.obb || this.regionObb;
      const sphere = this.sphere;
      if (sphere && !otherObb.intersectsSphere(sphere)) {
        return false;
      }
      if (obb && !obb.intersectsOBB(otherObb)) {
        return false;
      }
      return Boolean(sphere || obb);
    }
    getOBB(targetBox, targetMatrix) {
      const obb = this.obb || this.regionObb;
      if (obb) {
        targetBox.copy(obb.box);
        targetMatrix.copy(obb.transform);
      } else {
        this.getAABB(targetBox);
        targetMatrix.identity();
      }
    }
    getAABB(target) {
      if (this.sphere) {
        this.sphere.getBoundingBox(target);
      } else {
        const obb = this.obb || this.regionObb;
        target.copy(obb.box).applyMatrix4(obb.transform);
      }
    }
    getSphere(target) {
      if (this.sphere) {
        target.copy(this.sphere);
      } else if (this.region) {
        this.region.getBoundingSphere(target);
      } else {
        const obb = this.obb || this.regionObb;
        obb.box.getBoundingSphere(target);
        target.applyMatrix4(obb.transform);
      }
    }
    setObbData(data, transform) {
      const obb = new OBB();
      _vecX.set(data[3], data[4], data[5]);
      _vecY.set(data[6], data[7], data[8]);
      _vecZ.set(data[9], data[10], data[11]);
      const scaleX = _vecX.length();
      const scaleY = _vecY.length();
      const scaleZ = _vecZ.length();
      _vecX.normalize();
      _vecY.normalize();
      _vecZ.normalize();
      if (scaleX === 0) {
        _vecX.crossVectors(_vecY, _vecZ);
      }
      if (scaleY === 0) {
        _vecY.crossVectors(_vecX, _vecZ);
      }
      if (scaleZ === 0) {
        _vecZ.crossVectors(_vecX, _vecY);
      }
      obb.transform.set(
        _vecX.x,
        _vecY.x,
        _vecZ.x,
        data[0],
        _vecX.y,
        _vecY.y,
        _vecZ.y,
        data[1],
        _vecX.z,
        _vecY.z,
        _vecZ.z,
        data[2],
        0,
        0,
        0,
        1
      ).premultiply(transform);
      obb.box.min.set(-scaleX, -scaleY, -scaleZ);
      obb.box.max.set(scaleX, scaleY, scaleZ);
      obb.update();
      this.obb = obb;
    }
    setSphereData(x, y, z, radius, transform) {
      const sphere = new Sphere();
      sphere.center.set(x, y, z);
      sphere.radius = radius;
      sphere.applyMatrix4(transform);
      this.sphere = sphere;
    }
    setRegionData(ellipsoid, west, south, east, north, minHeight, maxHeight) {
      const region = new EllipsoidRegion(
        ...ellipsoid.radius,
        south,
        north,
        west,
        east,
        minHeight,
        maxHeight
      );
      const obb = new OBB();
      region.getBoundingBox(obb.box, obb.transform);
      obb.update();
      this.region = region;
      this.regionObb = obb;
    }
  }
  const _mat3 = new Matrix3();
  function findIntersectionPoint(plane1, plane2, plane3, target) {
    const A = _mat3.set(
      plane1.normal.x,
      plane1.normal.y,
      plane1.normal.z,
      plane2.normal.x,
      plane2.normal.y,
      plane2.normal.z,
      plane3.normal.x,
      plane3.normal.y,
      plane3.normal.z
    );
    target.set(-plane1.constant, -plane2.constant, -plane3.constant);
    target.applyMatrix3(A.invert());
    return target;
  }
  class ExtendedFrustum extends Frustum {
    constructor() {
      super();
      this.points = Array(8).fill().map(() => new Vector3());
    }
    setFromProjectionMatrix(m, coordinateSystem) {
      super.setFromProjectionMatrix(m, coordinateSystem);
      this.calculateFrustumPoints();
      return this;
    }
    calculateFrustumPoints() {
      const { planes, points } = this;
      const planeIntersections = [
        [planes[0], planes[3], planes[4]],
        // Near top left
        [planes[1], planes[3], planes[4]],
        // Near top right
        [planes[0], planes[2], planes[4]],
        // Near bottom left
        [planes[1], planes[2], planes[4]],
        // Near bottom right
        [planes[0], planes[3], planes[5]],
        // Far top left
        [planes[1], planes[3], planes[5]],
        // Far top right
        [planes[0], planes[2], planes[5]],
        // Far bottom left
        [planes[1], planes[2], planes[5]]
        // Far bottom right
      ];
      planeIntersections.forEach((planes2, index) => {
        findIntersectionPoint(planes2[0], planes2[1], planes2[2], points[index]);
      });
    }
  }
  function getTextureByteLength(tex) {
    if (!tex) {
      return 0;
    }
    const { format, type, image } = tex;
    const { width, height } = image;
    let bytes = TextureUtils.getByteLength(width, height, format, type);
    bytes *= tex.generateMipmaps ? 4 / 3 : 1;
    return bytes;
  }
  function estimateBytesUsed(object) {
    const dedupeSet = /* @__PURE__ */ new Set();
    let totalBytes = 0;
    object.traverse((c) => {
      if (c.geometry && !dedupeSet.has(c.geometry)) {
        totalBytes += estimateBytesUsed$1(c.geometry);
        dedupeSet.add(c.geometry);
      }
      if (c.material) {
        const material = c.material;
        for (const key in material) {
          const value = material[key];
          if (value && value.isTexture && !dedupeSet.has(value)) {
            totalBytes += getTextureByteLength(value);
            dedupeSet.add(value);
          }
        }
      }
    });
    return totalBytes;
  }
  const MemoryUtils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    estimateBytesUsed,
    getTextureByteLength
  }, Symbol.toStringTag, { value: "Module" }));
  const _mat = new Matrix4();
  const _euler = new Euler();
  const INITIAL_FRUSTUM_CULLED = Symbol("INITIAL_FRUSTUM_CULLED");
  const tempMat = new Matrix4();
  const tempVector = new Vector3();
  const tempVector2 = new Vector2();
  const viewErrorTarget = {
    inView: false,
    error: Infinity
  };
  const X_AXIS = new Vector3(1, 0, 0);
  const Y_AXIS = new Vector3(0, 1, 0);
  function updateFrustumCulled(object, toInitialValue) {
    object.traverse((c) => {
      c.frustumCulled = c[INITIAL_FRUSTUM_CULLED] && toInitialValue;
    });
  }
  class TilesRenderer extends TilesRendererBase {
    get autoDisableRendererCulling() {
      return this._autoDisableRendererCulling;
    }
    set autoDisableRendererCulling(value) {
      if (this._autoDisableRendererCulling !== value) {
        super._autoDisableRendererCulling = value;
        this.forEachLoadedModel((scene) => {
          updateFrustumCulled(scene, !value);
        });
      }
    }
    get optimizeRaycast() {
      return this._optimizeRaycast;
    }
    set optimizeRaycast(v) {
      console.warn('TilesRenderer: The "optimizeRaycast" option has been deprecated.');
      this._optimizeRaycast = v;
    }
    constructor(...args) {
      super(...args);
      this.group = new TilesGroup(this);
      this.ellipsoid = WGS84_ELLIPSOID.clone();
      this.cameras = [];
      this.cameraMap = /* @__PURE__ */ new Map();
      this.cameraInfo = [];
      this._optimizeRaycast = true;
      this._upRotationMatrix = new Matrix4();
      this._bytesUsed = /* @__PURE__ */ new WeakMap();
      this._autoDisableRendererCulling = true;
      this.manager = new LoadingManager();
      this._listeners = {};
    }
    addEventListener(type, listener) {
      if (type === "load-tile-set") {
        console.warn('TilesRenderer: "load-tile-set" event has been deprecated. Use "load-tileset" instead.');
        type = "load-tileset";
      }
      EventDispatcher.prototype.addEventListener.call(this, type, listener);
    }
    hasEventListener(type, listener) {
      if (type === "load-tile-set") {
        console.warn('TilesRenderer: "load-tile-set" event has been deprecated. Use "load-tileset" instead.');
        type = "load-tileset";
      }
      return EventDispatcher.prototype.hasEventListener.call(this, type, listener);
    }
    removeEventListener(type, listener) {
      if (type === "load-tile-set") {
        console.warn('TilesRenderer: "load-tile-set" event has been deprecated. Use "load-tileset" instead.');
        type = "load-tileset";
      }
      EventDispatcher.prototype.removeEventListener.call(this, type, listener);
    }
    dispatchEvent(e) {
      if ("tileset" in e) {
        Object.defineProperty(e, "tileSet", {
          get() {
            console.warn('TilesRenderer: "event.tileSet" has been deprecated. Use "event.tileset" instead.');
            return e.tileset;
          },
          enumerable: false,
          configurable: true
        });
      }
      EventDispatcher.prototype.dispatchEvent.call(this, e);
    }
    /* Public API */
    getBoundingBox(target) {
      if (!this.root) {
        return false;
      }
      const boundingVolume = this.root.cached.boundingVolume;
      if (boundingVolume) {
        boundingVolume.getAABB(target);
        return true;
      } else {
        return false;
      }
    }
    getOrientedBoundingBox(targetBox, targetMatrix) {
      if (!this.root) {
        return false;
      }
      const boundingVolume = this.root.cached.boundingVolume;
      if (boundingVolume) {
        boundingVolume.getOBB(targetBox, targetMatrix);
        return true;
      } else {
        return false;
      }
    }
    getBoundingSphere(target) {
      if (!this.root) {
        return false;
      }
      const boundingVolume = this.root.cached.boundingVolume;
      if (boundingVolume) {
        boundingVolume.getSphere(target);
        return true;
      } else {
        return false;
      }
    }
    forEachLoadedModel(callback) {
      this.traverse((tile) => {
        const scene = tile.cached && tile.cached.scene;
        if (scene) {
          callback(scene, tile);
        }
      }, null, false);
    }
    raycast(raycaster, intersects) {
      if (!this.root) {
        return;
      }
      if (raycaster.firstHitOnly) {
        const hit = raycastTraverseFirstHit(this, this.root, raycaster);
        if (hit) {
          intersects.push(hit);
        }
      } else {
        raycastTraverse(this, this.root, raycaster, intersects);
      }
    }
    hasCamera(camera) {
      return this.cameraMap.has(camera);
    }
    setCamera(camera) {
      const cameras = this.cameras;
      const cameraMap = this.cameraMap;
      if (!cameraMap.has(camera)) {
        cameraMap.set(camera, new Vector2());
        cameras.push(camera);
        this.dispatchEvent({ type: "add-camera", camera });
        return true;
      }
      return false;
    }
    setResolution(camera, xOrVec, y) {
      const cameraMap = this.cameraMap;
      if (!cameraMap.has(camera)) {
        return false;
      }
      const width = xOrVec.isVector2 ? xOrVec.x : xOrVec;
      const height = xOrVec.isVector2 ? xOrVec.y : y;
      const cameraVec = cameraMap.get(camera);
      if (cameraVec.width !== width || cameraVec.height !== height) {
        cameraVec.set(width, height);
        this.dispatchEvent({ type: "camera-resolution-change" });
      }
      return true;
    }
    setResolutionFromRenderer(camera, renderer) {
      renderer.getSize(tempVector2);
      return this.setResolution(camera, tempVector2.x, tempVector2.y);
    }
    deleteCamera(camera) {
      const cameras = this.cameras;
      const cameraMap = this.cameraMap;
      if (cameraMap.has(camera)) {
        const index = cameras.indexOf(camera);
        cameras.splice(index, 1);
        cameraMap.delete(camera);
        this.dispatchEvent({ type: "delete-camera", camera });
        return true;
      }
      return false;
    }
    /* Overriden */
    loadRootTileset(...args) {
      return super.loadRootTileset(...args).then((root) => {
        const { asset, extensions = {} } = root;
        const upAxis = asset && asset.gltfUpAxis || "y";
        switch (upAxis.toLowerCase()) {
          case "x":
            this._upRotationMatrix.makeRotationAxis(Y_AXIS, -Math.PI / 2);
            break;
          case "y":
            this._upRotationMatrix.makeRotationAxis(X_AXIS, Math.PI / 2);
            break;
        }
        if ("3DTILES_ellipsoid" in extensions) {
          const ext = extensions["3DTILES_ellipsoid"];
          const { ellipsoid } = this;
          ellipsoid.name = ext.body;
          if (ext.radii) {
            ellipsoid.radius.set(...ext.radii);
          } else {
            ellipsoid.radius.set(1, 1, 1);
          }
        }
        return root;
      });
    }
    update() {
      let needsUpdate = null;
      this.invokeAllPlugins((plugin) => {
        if (plugin.doTilesNeedUpdate) {
          const res = plugin.doTilesNeedUpdate();
          if (needsUpdate === null) {
            needsUpdate = res;
          } else {
            needsUpdate = Boolean(needsUpdate || res);
          }
        }
      });
      if (needsUpdate === false) {
        this.dispatchEvent({ type: "update-before" });
        this.dispatchEvent({ type: "update-after" });
        return;
      }
      this.dispatchEvent({ type: "update-before" });
      const group = this.group;
      const cameras = this.cameras;
      const cameraMap = this.cameraMap;
      const cameraInfo = this.cameraInfo;
      while (cameraInfo.length > cameras.length) {
        cameraInfo.pop();
      }
      while (cameraInfo.length < cameras.length) {
        cameraInfo.push({
          frustum: new ExtendedFrustum(),
          isOrthographic: false,
          sseDenominator: -1,
          // used if isOrthographic:false
          position: new Vector3(),
          invScale: -1,
          pixelSize: 0
          // used if isOrthographic:true
        });
      }
      tempVector.setFromMatrixScale(group.matrixWorldInverse);
      if (Math.abs(Math.max(tempVector.x - tempVector.y, tempVector.x - tempVector.z)) > 1e-6) {
        console.warn("ThreeTilesRenderer : Non uniform scale used for tile which may cause issues when calculating screen space error.");
      }
      for (let i = 0, l = cameraInfo.length; i < l; i++) {
        const camera = cameras[i];
        const info = cameraInfo[i];
        const frustum = info.frustum;
        const position = info.position;
        const resolution = cameraMap.get(camera);
        if (resolution.width === 0 || resolution.height === 0) {
          console.warn("TilesRenderer: resolution for camera error calculation is not set.");
        }
        const projection = camera.projectionMatrix.elements;
        info.isOrthographic = projection[15] === 1;
        if (info.isOrthographic) {
          const w = 2 / projection[0];
          const h = 2 / projection[5];
          info.pixelSize = Math.max(h / resolution.height, w / resolution.width);
        } else {
          info.sseDenominator = 2 / projection[5] / resolution.height;
        }
        tempMat.copy(group.matrixWorld);
        tempMat.premultiply(camera.matrixWorldInverse);
        tempMat.premultiply(camera.projectionMatrix);
        frustum.setFromProjectionMatrix(tempMat);
        position.set(0, 0, 0);
        position.applyMatrix4(camera.matrixWorld);
        position.applyMatrix4(group.matrixWorldInverse);
      }
      super.update();
      this.dispatchEvent({ type: "update-after" });
      if (cameras.length === 0 && this.root) {
        let found = false;
        this.invokeAllPlugins((plugin) => found = found || Boolean(plugin !== this && plugin.calculateTileViewError));
        if (found === false) {
          console.warn("TilesRenderer: no cameras defined. Cannot update 3d tiles.");
        }
      }
    }
    preprocessNode(tile, tilesetDir, parentTile = null) {
      super.preprocessNode(tile, tilesetDir, parentTile);
      const transform = new Matrix4();
      if (tile.transform) {
        const transformArr = tile.transform;
        for (let i = 0; i < 16; i++) {
          transform.elements[i] = transformArr[i];
        }
      }
      if (parentTile) {
        transform.premultiply(parentTile.cached.transform);
      }
      const transformInverse = new Matrix4().copy(transform).invert();
      const boundingVolume = new TileBoundingVolume();
      if ("sphere" in tile.boundingVolume) {
        boundingVolume.setSphereData(...tile.boundingVolume.sphere, transform);
      }
      if ("box" in tile.boundingVolume) {
        boundingVolume.setObbData(tile.boundingVolume.box, transform);
      }
      if ("region" in tile.boundingVolume) {
        boundingVolume.setRegionData(this.ellipsoid, ...tile.boundingVolume.region);
      }
      tile.cached = {
        transform,
        transformInverse,
        active: false,
        boundingVolume,
        metadata: null,
        scene: null,
        geometry: null,
        materials: null,
        textures: null
      };
    }
    async parseTile(buffer, tile, extension, uri, abortSignal) {
      const cached = tile.cached;
      const workingPath = getWorkingPath(uri);
      const fetchOptions = this.fetchOptions;
      const manager = this.manager;
      let promise = null;
      const cachedTransform = cached.transform;
      const upRotationMatrix = this._upRotationMatrix;
      const fileType = (readMagicBytes(buffer) || extension).toLowerCase();
      switch (fileType) {
        case "b3dm": {
          const loader = new B3DMLoader(manager);
          loader.workingPath = workingPath;
          loader.fetchOptions = fetchOptions;
          loader.adjustmentTransform.copy(upRotationMatrix);
          promise = loader.parse(buffer);
          break;
        }
        case "pnts": {
          const loader = new PNTSLoader(manager);
          loader.workingPath = workingPath;
          loader.fetchOptions = fetchOptions;
          promise = loader.parse(buffer);
          break;
        }
        case "i3dm": {
          const loader = new I3DMLoader(manager);
          loader.workingPath = workingPath;
          loader.fetchOptions = fetchOptions;
          loader.adjustmentTransform.copy(upRotationMatrix);
          loader.ellipsoid.copy(this.ellipsoid);
          promise = loader.parse(buffer);
          break;
        }
        case "cmpt": {
          const loader = new CMPTLoader(manager);
          loader.workingPath = workingPath;
          loader.fetchOptions = fetchOptions;
          loader.adjustmentTransform.copy(upRotationMatrix);
          loader.ellipsoid.copy(this.ellipsoid);
          promise = loader.parse(buffer).then((res) => res.scene);
          break;
        }
        // 3DTILES_content_gltf
        case "gltf":
        case "glb": {
          const loader = manager.getHandler("path.gltf") || manager.getHandler("path.glb") || new GLTFLoader(manager);
          loader.setWithCredentials(fetchOptions.credentials === "include");
          loader.setRequestHeader(fetchOptions.headers || {});
          if (fetchOptions.credentials === "include" && fetchOptions.mode === "cors") {
            loader.setCrossOrigin("use-credentials");
          }
          let resourcePath = loader.resourcePath || loader.path || workingPath;
          if (!/[\\/]$/.test(resourcePath) && resourcePath.length) {
            resourcePath += "/";
          }
          promise = loader.parseAsync(buffer, resourcePath).then((result2) => {
            result2.scene = result2.scene || new Group();
            const { scene: scene2 } = result2;
            scene2.updateMatrix();
            scene2.matrix.multiply(upRotationMatrix).decompose(scene2.position, scene2.quaternion, scene2.scale);
            return result2;
          });
          break;
        }
        default: {
          promise = this.invokeOnePlugin((plugin) => plugin.parseToMesh && plugin.parseToMesh(buffer, tile, extension, uri, abortSignal));
          break;
        }
      }
      const result = await promise;
      if (result === null) {
        throw new Error(`TilesRenderer: Content type "${fileType}" not supported.`);
      }
      let scene;
      let metadata;
      if (result.isObject3D) {
        scene = result;
        metadata = null;
      } else {
        scene = result.scene;
        metadata = result;
      }
      scene.updateMatrix();
      scene.matrix.premultiply(cachedTransform);
      scene.matrix.decompose(scene.position, scene.quaternion, scene.scale);
      await this.invokeAllPlugins((plugin) => {
        return plugin.processTileModel && plugin.processTileModel(scene, tile);
      });
      scene.traverse((c) => {
        c[INITIAL_FRUSTUM_CULLED] = c.frustumCulled;
      });
      updateFrustumCulled(scene, !this.autoDisableRendererCulling);
      const materials = [];
      const geometry = [];
      const textures = [];
      scene.traverse((c) => {
        if (c.geometry) {
          geometry.push(c.geometry);
        }
        if (c.material) {
          const material = c.material;
          materials.push(c.material);
          for (const key in material) {
            const value = material[key];
            if (value && value.isTexture) {
              textures.push(value);
            }
          }
        }
      });
      if (abortSignal.aborted) {
        for (let i = 0, l = textures.length; i < l; i++) {
          const texture = textures[i];
          if (texture.image instanceof ImageBitmap) {
            texture.image.close();
          }
          texture.dispose();
        }
        return;
      }
      cached.materials = materials;
      cached.geometry = geometry;
      cached.textures = textures;
      cached.scene = scene;
      cached.metadata = metadata;
    }
    disposeTile(tile) {
      super.disposeTile(tile);
      const cached = tile.cached;
      if (cached.scene) {
        const materials = cached.materials;
        const geometry = cached.geometry;
        const textures = cached.textures;
        const parent = cached.scene.parent;
        cached.scene.traverse((child) => {
          if (child.userData.meshFeatures) {
            child.userData.meshFeatures.dispose();
          }
          if (child.userData.structuralMetadata) {
            child.userData.structuralMetadata.dispose();
          }
        });
        for (let i = 0, l = geometry.length; i < l; i++) {
          geometry[i].dispose();
        }
        for (let i = 0, l = materials.length; i < l; i++) {
          materials[i].dispose();
        }
        for (let i = 0, l = textures.length; i < l; i++) {
          const texture = textures[i];
          if (texture.image instanceof ImageBitmap) {
            texture.image.close();
          }
          texture.dispose();
        }
        if (parent) {
          parent.remove(cached.scene);
        }
        this.dispatchEvent({
          type: "dispose-model",
          scene: cached.scene,
          tile
        });
        cached.scene = null;
        cached.materials = null;
        cached.textures = null;
        cached.geometry = null;
        cached.metadata = null;
      }
    }
    setTileVisible(tile, visible) {
      const scene = tile.cached.scene;
      const group = this.group;
      if (visible) {
        if (scene) {
          group.add(scene);
          scene.updateMatrixWorld(true);
        }
      } else {
        if (scene) {
          group.remove(scene);
        }
      }
      super.setTileVisible(tile, visible);
      this.dispatchEvent({
        type: "tile-visibility-change",
        scene,
        tile,
        visible
      });
    }
    calculateBytesUsed(tile, scene) {
      const bytesUsed = this._bytesUsed;
      if (!bytesUsed.has(tile) && scene) {
        bytesUsed.set(tile, estimateBytesUsed(scene));
      }
      return bytesUsed.get(tile) ?? null;
    }
    calculateTileViewError(tile, target) {
      const cached = tile.cached;
      const cameras = this.cameras;
      const cameraInfo = this.cameraInfo;
      const boundingVolume = cached.boundingVolume;
      let inView = false;
      let inViewError = -Infinity;
      let inViewDistance = Infinity;
      let maxError = -Infinity;
      let minDistance = Infinity;
      for (let i = 0, l = cameras.length; i < l; i++) {
        const info = cameraInfo[i];
        let error;
        let distance;
        if (info.isOrthographic) {
          const pixelSize = info.pixelSize;
          error = tile.geometricError / pixelSize;
          distance = Infinity;
        } else {
          const sseDenominator = info.sseDenominator;
          distance = boundingVolume.distanceToPoint(info.position);
          error = distance === 0 ? Infinity : tile.geometricError / (distance * sseDenominator);
        }
        const frustum = cameraInfo[i].frustum;
        if (boundingVolume.intersectsFrustum(frustum)) {
          inView = true;
          inViewError = Math.max(inViewError, error);
          inViewDistance = Math.min(inViewDistance, distance);
        }
        maxError = Math.max(maxError, error);
        minDistance = Math.min(minDistance, distance);
      }
      this.invokeAllPlugins((plugin) => {
        if (plugin !== this && plugin.calculateTileViewError && plugin.calculateTileViewError(tile, viewErrorTarget)) {
          inView = inView && viewErrorTarget.inView;
          maxError = Math.max(maxError, viewErrorTarget.error);
          if (viewErrorTarget.inView) {
            inViewError = Math.max(inViewError, viewErrorTarget.error);
          }
        }
      });
      if (inView) {
        target.inView = true;
        target.error = inViewError;
        target.distanceFromCamera = inViewDistance;
      } else {
        target.inView = viewErrorTarget.inView;
        target.error = maxError;
        target.distanceFromCamera = minDistance;
      }
    }
    // adjust the rotation of the group such that Y is altitude, X is North, and Z is East
    setLatLonToYUp(lat, lon) {
      console.warn("TilesRenderer: setLatLonToYUp is deprecated. Use the ReorientationPlugin, instead.");
      const { ellipsoid, group } = this;
      _euler.set(Math.PI / 2, Math.PI / 2, 0);
      _mat.makeRotationFromEuler(_euler);
      ellipsoid.getEastNorthUpFrame(lat, lon, 0, group.matrix).multiply(_mat).invert().decompose(
        group.position,
        group.quaternion,
        group.scale
      );
      group.updateMatrixWorld(true);
    }
    dispose() {
      super.dispose();
      this.group.removeFromParent();
    }
  }
  class PivotPointMesh extends Mesh {
    constructor() {
      super(new PlaneGeometry(0, 0), new PivotMaterial());
      this.renderOrder = Infinity;
    }
    onBeforeRender(renderer) {
      const uniforms = this.material.uniforms;
      renderer.getSize(uniforms.resolution.value);
    }
    updateMatrixWorld() {
      this.matrixWorld.makeTranslation(this.position);
    }
    dispose() {
      this.geometry.dispose();
      this.material.dispose();
    }
  }
  class PivotMaterial extends ShaderMaterial {
    constructor() {
      super({
        depthWrite: false,
        depthTest: false,
        transparent: true,
        uniforms: {
          resolution: { value: new Vector2() },
          size: { value: 15 },
          thickness: { value: 2 },
          opacity: { value: 1 }
        },
        vertexShader: (
          /* glsl */
          `

				uniform float pixelRatio;
				uniform float size;
				uniform float thickness;
				uniform vec2 resolution;
				varying vec2 vUv;

				void main() {

					vUv = uv;

					float aspect = resolution.x / resolution.y;
					vec2 offset = uv * 2.0 - vec2( 1.0 );
					offset.y *= aspect;

					vec4 screenPoint = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					screenPoint.xy += offset * ( size + thickness ) * screenPoint.w / resolution.x;

					gl_Position = screenPoint;

				}
			`
        ),
        fragmentShader: (
          /* glsl */
          `

				uniform float size;
				uniform float thickness;
				uniform float opacity;

				varying vec2 vUv;
				void main() {

					float ht = 0.5 * thickness;
					float planeDim = size + thickness;
					float offset = ( planeDim - ht - 2.0 ) / planeDim;
					float texelThickness = ht / planeDim;

					vec2 vec = vUv * 2.0 - vec2( 1.0 );
					float dist = abs( length( vec ) - offset );
					float fw = fwidth( dist ) * 0.5;
					float a = smoothstep( texelThickness - fw, texelThickness + fw, dist );

					gl_FragColor = vec4( 1, 1, 1, opacity * ( 1.0 - a ) );

				}
			`
        )
      });
    }
  }
  const _vec$3 = new Vector2();
  const _vec2 = new Vector2();
  class PointerTracker {
    constructor() {
      this.domElement = null;
      this.buttons = 0;
      this.pointerType = null;
      this.pointerOrder = [];
      this.previousPositions = {};
      this.pointerPositions = {};
      this.startPositions = {};
      this.pointerSetThisFrame = {};
      this.hoverPosition = new Vector2();
      this.hoverSet = false;
    }
    reset() {
      this.buttons = 0;
      this.pointerType = null;
      this.pointerOrder = [];
      this.previousPositions = {};
      this.pointerPositions = {};
      this.startPositions = {};
      this.pointerSetThisFrame = {};
      this.hoverPosition = new Vector2();
      this.hoverSet = false;
    }
    // The pointers can be set multiple times per frame so track whether the pointer has
    // been set this frame or not so we don't overwrite the previous position and lose information
    // about pointer movement
    updateFrame() {
      const { previousPositions, pointerPositions } = this;
      for (const id in pointerPositions) {
        previousPositions[id].copy(pointerPositions[id]);
      }
    }
    setHoverEvent(e) {
      if (e.pointerType === "mouse" || e.type === "wheel") {
        this.getAdjustedPointer(e, this.hoverPosition);
        this.hoverSet = true;
      }
    }
    getLatestPoint(target) {
      if (this.pointerType !== null) {
        this.getCenterPoint(target);
        return target;
      } else if (this.hoverSet) {
        target.copy(this.hoverPosition);
        return target;
      } else {
        return null;
      }
    }
    // get the pointer position in the coordinate system of the target element
    getAdjustedPointer(e, target) {
      const domRef = this.domElement ? this.domElement : e.target;
      const rect = domRef.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.set(x, y);
    }
    addPointer(e) {
      const id = e.pointerId;
      const position = new Vector2();
      this.getAdjustedPointer(e, position);
      this.pointerOrder.push(id);
      this.pointerPositions[id] = position;
      this.previousPositions[id] = position.clone();
      this.startPositions[id] = position.clone();
      if (this.getPointerCount() === 1) {
        this.pointerType = e.pointerType;
        this.buttons = e.buttons;
      }
    }
    updatePointer(e) {
      const id = e.pointerId;
      if (!(id in this.pointerPositions)) {
        return false;
      }
      this.getAdjustedPointer(e, this.pointerPositions[id]);
      return true;
    }
    deletePointer(e) {
      const id = e.pointerId;
      const pointerOrder = this.pointerOrder;
      pointerOrder.splice(pointerOrder.indexOf(id), 1);
      delete this.pointerPositions[id];
      delete this.previousPositions[id];
      delete this.startPositions[id];
      if (this.getPointerCount.length === 0) {
        this.buttons = 0;
        this.pointerType = null;
      }
    }
    getPointerCount() {
      return this.pointerOrder.length;
    }
    getCenterPoint(target, pointerPositions = this.pointerPositions) {
      const pointerOrder = this.pointerOrder;
      if (this.getPointerCount() === 1 || this.getPointerType() === "mouse") {
        const id = pointerOrder[0];
        target.copy(pointerPositions[id]);
        return target;
      } else if (this.getPointerCount() === 2) {
        const id0 = this.pointerOrder[0];
        const id1 = this.pointerOrder[1];
        const p0 = pointerPositions[id0];
        const p1 = pointerPositions[id1];
        target.addVectors(p0, p1).multiplyScalar(0.5);
        return target;
      }
      return null;
    }
    getPreviousCenterPoint(target) {
      return this.getCenterPoint(target, this.previousPositions);
    }
    getStartCenterPoint(target) {
      return this.getCenterPoint(target, this.startPositions);
    }
    getMoveDistance() {
      this.getCenterPoint(_vec$3);
      this.getPreviousCenterPoint(_vec2);
      return _vec$3.sub(_vec2).length();
    }
    getTouchPointerDistance(pointerPositions = this.pointerPositions) {
      if (this.getPointerCount() <= 1 || this.getPointerType() === "mouse") {
        return 0;
      }
      const { pointerOrder } = this;
      const id0 = pointerOrder[0];
      const id1 = pointerOrder[1];
      const p0 = pointerPositions[id0];
      const p1 = pointerPositions[id1];
      return p0.distanceTo(p1);
    }
    getPreviousTouchPointerDistance() {
      return this.getTouchPointerDistance(this.previousPositions);
    }
    getStartTouchPointerDistance() {
      return this.getTouchPointerDistance(this.startPositions);
    }
    getPointerType() {
      return this.pointerType;
    }
    isPointerTouch() {
      return this.getPointerType() === "touch";
    }
    getPointerButtons() {
      return this.buttons;
    }
    isLeftClicked() {
      return Boolean(this.buttons & 1);
    }
    isRightClicked() {
      return Boolean(this.buttons & 2);
    }
  }
  const _matrix = new Matrix4();
  new Vector3();
  function makeRotateAroundPoint(point, quat, target) {
    target.makeTranslation(-point.x, -point.y, -point.z);
    _matrix.makeRotationFromQuaternion(quat);
    target.premultiply(_matrix);
    _matrix.makeTranslation(point.x, point.y, point.z);
    target.premultiply(_matrix);
    return target;
  }
  function mouseToCoords(clientX, clientY, element, target) {
    target.x = (clientX - element.offsetLeft) / element.clientWidth * 2 - 1;
    target.y = -((clientY - element.offsetTop) / element.clientHeight) * 2 + 1;
    if (target.isVector3) {
      target.z = 0;
    }
  }
  function setRaycasterFromCamera(raycaster, coords, camera) {
    const ray = raycaster instanceof Ray ? raycaster : raycaster.ray;
    const { origin, direction } = ray;
    origin.set(coords.x, coords.y, -1).unproject(camera);
    direction.set(coords.x, coords.y, 1).unproject(camera).sub(origin);
    if (!raycaster.isRay) {
      raycaster.near = 0;
      raycaster.far = direction.length();
      raycaster.camera = camera;
    }
    direction.normalize();
  }
  const NONE = 0;
  const DRAG = 1;
  const ROTATE = 2;
  const ZOOM = 3;
  const WAITING = 4;
  const DRAG_PLANE_THRESHOLD = 0.05;
  const DRAG_UP_THRESHOLD = 0.025;
  const _rotMatrix$1 = /* @__PURE__ */ new Matrix4();
  const _invMatrix$1 = /* @__PURE__ */ new Matrix4();
  const _delta = /* @__PURE__ */ new Vector3();
  const _vec$2 = /* @__PURE__ */ new Vector3();
  const _pos$1 = /* @__PURE__ */ new Vector3();
  const _center$1 = /* @__PURE__ */ new Vector3();
  const _forward$2 = /* @__PURE__ */ new Vector3();
  const _right = /* @__PURE__ */ new Vector3();
  const _targetRight$1 = /* @__PURE__ */ new Vector3();
  const _rotationAxis = /* @__PURE__ */ new Vector3();
  const _quaternion$1 = /* @__PURE__ */ new Quaternion();
  const _plane = /* @__PURE__ */ new Plane();
  const _localUp = /* @__PURE__ */ new Vector3();
  const _mouseBefore = /* @__PURE__ */ new Vector3();
  const _mouseAfter = /* @__PURE__ */ new Vector3();
  const _identityQuat = /* @__PURE__ */ new Quaternion();
  const _ray$1 = /* @__PURE__ */ new Ray();
  const _zoomPointPointer = /* @__PURE__ */ new Vector2();
  const _pointer$1 = /* @__PURE__ */ new Vector2();
  const _prevPointer = /* @__PURE__ */ new Vector2();
  const _deltaPointer = /* @__PURE__ */ new Vector2();
  const _centerPoint = /* @__PURE__ */ new Vector2();
  const _startCenterPoint = /* @__PURE__ */ new Vector2();
  const _changeEvent = { type: "change" };
  const _startEvent = { type: "start" };
  const _endEvent = { type: "end" };
  class EnvironmentControls extends EventDispatcher {
    get enabled() {
      return this._enabled;
    }
    set enabled(v) {
      if (v !== this.enabled) {
        this._enabled = v;
        this.resetState();
        this.pointerTracker.reset();
        if (!this.enabled) {
          this.dragInertia.set(0, 0, 0);
          this.rotationInertia.set(0, 0);
        }
      }
    }
    constructor(scene = null, camera = null, domElement = null, tilesRenderer = null) {
      super();
      this.isEnvironmentControls = true;
      this.domElement = null;
      this.camera = null;
      this.scene = null;
      this.tilesRenderer = null;
      this._enabled = true;
      this.cameraRadius = 5;
      this.rotationSpeed = 1;
      this.minAltitude = 0;
      this.maxAltitude = 0.45 * Math.PI;
      this.minDistance = 10;
      this.maxDistance = Infinity;
      this.minZoom = 0;
      this.maxZoom = Infinity;
      this.zoomSpeed = 1;
      this.adjustHeight = true;
      this.enableDamping = false;
      this.dampingFactor = 0.15;
      this.fallbackPlane = new Plane(new Vector3(0, 1, 0), 0);
      this.useFallbackPlane = true;
      this.scaleZoomOrientationAtEdges = false;
      this.autoAdjustCameraRotation = true;
      this.state = NONE;
      this.pointerTracker = new PointerTracker();
      this.needsUpdate = false;
      this.actionHeightOffset = 0;
      this.pivotPoint = new Vector3();
      this.zoomDirectionSet = false;
      this.zoomPointSet = false;
      this.zoomDirection = new Vector3();
      this.zoomPoint = new Vector3();
      this.zoomDelta = 0;
      this.rotationInertiaPivot = new Vector3();
      this.rotationInertia = new Vector2();
      this.dragInertia = new Vector3();
      this.inertiaTargetDistance = Infinity;
      this.inertiaStableFrames = 0;
      this.pivotMesh = new PivotPointMesh();
      this.pivotMesh.raycast = () => {
      };
      this.pivotMesh.scale.setScalar(0.25);
      this.raycaster = new Raycaster();
      this.raycaster.firstHitOnly = true;
      this.up = new Vector3(0, 1, 0);
      this.clock = new Clock();
      this._detachCallback = null;
      this._upInitialized = false;
      this._lastUsedState = NONE;
      this._zoomPointWasSet = false;
      this._tilesOnChangeCallback = () => this.zoomPointSet = false;
      if (domElement) this.attach(domElement);
      if (camera) this.setCamera(camera);
      if (scene) this.setScene(scene);
      if (tilesRenderer) this.setTilesRenderer(tilesRenderer);
    }
    setScene(scene) {
      this.scene = scene;
    }
    setCamera(camera) {
      this.camera = camera;
      this._upInitialized = false;
      this.zoomDirectionSet = false;
      this.zoomPointSet = false;
      this.needsUpdate = true;
      this.raycaster.camera = camera;
      this.resetState();
    }
    setTilesRenderer(tilesRenderer) {
      console.warn('EnvironmentControls: "setTilesRenderer" has been deprecated. Use "setScene" and "setEllipsoid", instead.');
      this.tilesRenderer = tilesRenderer;
      if (this.tilesRenderer !== null) {
        this.setScene(this.tilesRenderer.group);
      }
    }
    attach(domElement) {
      if (this.domElement) {
        throw new Error("EnvironmentControls: Controls already attached to element");
      }
      this.domElement = domElement;
      this.pointerTracker.domElement = domElement;
      domElement.style.touchAction = "none";
      const contextMenuCallback = (e) => {
        if (!this.enabled) {
          return;
        }
        e.preventDefault();
      };
      const pointerdownCallback = (e) => {
        if (!this.enabled) {
          return;
        }
        e.preventDefault();
        const {
          camera,
          raycaster,
          domElement: domElement2,
          up,
          pivotMesh,
          pointerTracker,
          scene,
          pivotPoint,
          enabled
        } = this;
        pointerTracker.addPointer(e);
        this.needsUpdate = true;
        if (pointerTracker.isPointerTouch()) {
          pivotMesh.visible = false;
          if (pointerTracker.getPointerCount() === 0) {
            domElement2.setPointerCapture(e.pointerId);
          } else if (pointerTracker.getPointerCount() > 2) {
            this.resetState();
            return;
          }
        }
        pointerTracker.getCenterPoint(_pointer$1);
        mouseToCoords(_pointer$1.x, _pointer$1.y, domElement2, _pointer$1);
        setRaycasterFromCamera(raycaster, _pointer$1, camera);
        const dot = Math.abs(raycaster.ray.direction.dot(up));
        if (dot < DRAG_PLANE_THRESHOLD || dot < DRAG_UP_THRESHOLD) {
          return;
        }
        const hit = this._raycast(raycaster);
        if (hit) {
          if (pointerTracker.getPointerCount() === 2 || pointerTracker.isRightClicked() || pointerTracker.isLeftClicked() && e.shiftKey) {
            this.setState(pointerTracker.isPointerTouch() ? WAITING : ROTATE);
            pivotPoint.copy(hit.point);
            pivotMesh.position.copy(hit.point);
            pivotMesh.visible = pointerTracker.isPointerTouch() ? false : enabled;
            pivotMesh.updateMatrixWorld();
            scene.add(pivotMesh);
          } else if (pointerTracker.isLeftClicked()) {
            this.setState(DRAG);
            pivotPoint.copy(hit.point);
            pivotMesh.position.copy(hit.point);
            pivotMesh.updateMatrixWorld();
            scene.add(pivotMesh);
          }
        }
      };
      let _pointerMoveQueued = false;
      const pointermoveCallback = (e) => {
        const { pointerTracker } = this;
        if (!this.enabled) {
          return;
        }
        e.preventDefault();
        const {
          pivotMesh,
          enabled
        } = this;
        this.zoomDirectionSet = false;
        this.zoomPointSet = false;
        if (this.state !== NONE) {
          this.needsUpdate = true;
        }
        pointerTracker.setHoverEvent(e);
        if (!pointerTracker.updatePointer(e)) {
          return;
        }
        if (pointerTracker.isPointerTouch() && pointerTracker.getPointerCount() === 2) {
          if (!_pointerMoveQueued) {
            _pointerMoveQueued = true;
            queueMicrotask(() => {
              _pointerMoveQueued = false;
              pointerTracker.getCenterPoint(_centerPoint);
              const startDist = pointerTracker.getStartTouchPointerDistance();
              const pointerDist = pointerTracker.getTouchPointerDistance();
              const separateDelta = pointerDist - startDist;
              if (this.state === NONE || this.state === WAITING) {
                pointerTracker.getCenterPoint(_centerPoint);
                pointerTracker.getStartCenterPoint(_startCenterPoint);
                const dragThreshold = 2 * window.devicePixelRatio;
                const parallelDelta = _centerPoint.distanceTo(_startCenterPoint);
                if (Math.abs(separateDelta) > dragThreshold || parallelDelta > dragThreshold) {
                  if (Math.abs(separateDelta) > parallelDelta) {
                    this.setState(ZOOM);
                    this.zoomDirectionSet = false;
                  } else {
                    this.setState(ROTATE);
                  }
                }
              }
              if (this.state === ZOOM) {
                const previousDist = pointerTracker.getPreviousTouchPointerDistance();
                this.zoomDelta += pointerDist - previousDist;
                pivotMesh.visible = false;
              } else if (this.state === ROTATE) {
                pivotMesh.visible = enabled;
              }
            });
          }
        }
        this.dispatchEvent(_changeEvent);
      };
      const pointerupCallback = (e) => {
        const { pointerTracker } = this;
        if (!this.enabled || pointerTracker.getPointerCount() === 0) {
          return;
        }
        pointerTracker.deletePointer(e);
        if (pointerTracker.getPointerType() === "touch" && pointerTracker.getPointerCount() === 0) {
          domElement.releasePointerCapture(e.pointerId);
        }
        this.resetState();
        this.needsUpdate = true;
      };
      const wheelCallback = (e) => {
        if (!this.enabled) {
          return;
        }
        e.preventDefault();
        const { pointerTracker } = this;
        pointerTracker.setHoverEvent(e);
        pointerTracker.updatePointer(e);
        this.dispatchEvent(_startEvent);
        let delta;
        switch (e.deltaMode) {
          case 2:
            delta = e.deltaY * 800;
            break;
          case 1:
            delta = e.deltaY * 40;
            break;
          case 0:
            delta = e.deltaY;
            break;
        }
        const deltaSign = Math.sign(delta);
        const normalizedDelta = Math.abs(delta);
        this.zoomDelta -= 0.25 * deltaSign * normalizedDelta;
        this.needsUpdate = true;
        this._lastUsedState = ZOOM;
        this.dispatchEvent(_endEvent);
      };
      const pointerleaveCallback = (e) => {
        if (!this.enabled) {
          return;
        }
        this.resetState();
      };
      domElement.addEventListener("contextmenu", contextMenuCallback);
      domElement.addEventListener("pointerdown", pointerdownCallback);
      domElement.addEventListener("wheel", wheelCallback, { passive: false });
      const document2 = domElement.getRootNode();
      document2.addEventListener("pointermove", pointermoveCallback);
      document2.addEventListener("pointerup", pointerupCallback);
      document2.addEventListener("pointerleave", pointerleaveCallback);
      this._detachCallback = () => {
        domElement.removeEventListener("contextmenu", contextMenuCallback);
        domElement.removeEventListener("pointerdown", pointerdownCallback);
        domElement.removeEventListener("wheel", wheelCallback);
        document2.removeEventListener("pointermove", pointermoveCallback);
        document2.removeEventListener("pointerup", pointerupCallback);
        document2.removeEventListener("pointerleave", pointerleaveCallback);
      };
    }
    detach() {
      this.domElement = null;
      if (this._detachCallback) {
        this._detachCallback();
        this._detachCallback = null;
        this.pointerTracker.reset();
      }
    }
    // override-able functions for retrieving the up direction at a point
    getUpDirection(point, target) {
      target.copy(this.up);
    }
    getCameraUpDirection(target) {
      this.getUpDirection(this.camera.position, target);
    }
    // returns the active / last used pivot point for the scene
    getPivotPoint(target) {
      let result = null;
      if (this._lastUsedState === ZOOM) {
        if (this._zoomPointWasSet) {
          result = target.copy(this.zoomPoint);
        }
      } else if (this._lastUsedState === ROTATE || this._lastUsedState === DRAG) {
        result = target.copy(this.pivotPoint);
      }
      const { camera, raycaster } = this;
      if (result !== null) {
        _vec$2.copy(result).project(camera);
        if (_vec$2.x < -1 || _vec$2.x > 1 || _vec$2.y < -1 || _vec$2.y > 1) {
          result = null;
        }
      }
      setRaycasterFromCamera(raycaster, { x: 0, y: 0 }, camera);
      const hit = this._raycast(raycaster);
      if (hit) {
        if (result === null || hit.distance < result.distanceTo(raycaster.ray.origin)) {
          result = target.copy(hit.point);
        }
      }
      return result;
    }
    resetState() {
      if (this.state !== NONE) {
        this.dispatchEvent(_endEvent);
      }
      this.state = NONE;
      this.pivotMesh.removeFromParent();
      this.pivotMesh.visible = this.enabled;
      this.actionHeightOffset = 0;
      this.pointerTracker.reset();
    }
    setState(state = this.state, fireEvent = true) {
      if (this.state === state) {
        return;
      }
      if (this.state === NONE && fireEvent) {
        this.dispatchEvent(_startEvent);
      }
      this.pivotMesh.visible = this.enabled;
      this.dragInertia.set(0, 0, 0);
      this.rotationInertia.set(0, 0);
      this.inertiaStableFrames = 0;
      this.state = state;
      if (state !== NONE && state !== WAITING) {
        this._lastUsedState = state;
      }
    }
    update(deltaTime = Math.min(this.clock.getDelta(), 64 / 1e3)) {
      if (!this.enabled || !this.camera || deltaTime === 0) {
        return;
      }
      const {
        camera,
        cameraRadius,
        pivotPoint,
        up,
        state,
        adjustHeight,
        autoAdjustCameraRotation
      } = this;
      camera.updateMatrixWorld();
      this.getCameraUpDirection(_localUp);
      if (!this._upInitialized) {
        this._upInitialized = true;
        this.up.copy(_localUp);
      }
      this.zoomPointSet = false;
      const inertiaNeedsUpdate = this._inertiaNeedsUpdate();
      const adjustCameraRotation = this.needsUpdate || inertiaNeedsUpdate;
      if (this.needsUpdate || inertiaNeedsUpdate) {
        const zoomDelta = this.zoomDelta;
        this._updateZoom();
        this._updatePosition(deltaTime);
        this._updateRotation(deltaTime);
        if (state === DRAG || state === ROTATE) {
          _forward$2.set(0, 0, -1).transformDirection(camera.matrixWorld);
          this.inertiaTargetDistance = _vec$2.copy(pivotPoint).sub(camera.position).dot(_forward$2);
        } else if (state === NONE) {
          this._updateInertia(deltaTime);
        }
        if (state !== NONE || zoomDelta !== 0 || inertiaNeedsUpdate) {
          this.dispatchEvent(_changeEvent);
        }
        this.needsUpdate = false;
      }
      const hit = camera.isOrthographicCamera ? null : adjustHeight && this._getPointBelowCamera() || null;
      this.getCameraUpDirection(_localUp);
      this._setFrame(_localUp);
      if ((this.state === DRAG || this.state === ROTATE) && this.actionHeightOffset !== 0) {
        const { actionHeightOffset } = this;
        camera.position.addScaledVector(up, -actionHeightOffset);
        pivotPoint.addScaledVector(up, -actionHeightOffset);
        if (hit) {
          hit.distance -= actionHeightOffset;
        }
      }
      this.actionHeightOffset = 0;
      if (hit) {
        const dist = hit.distance;
        if (dist < cameraRadius) {
          const delta = cameraRadius - dist;
          camera.position.addScaledVector(up, delta);
          pivotPoint.addScaledVector(up, delta);
          this.actionHeightOffset = delta;
        }
      }
      this.pointerTracker.updateFrame();
      if (adjustCameraRotation && autoAdjustCameraRotation) {
        this.getCameraUpDirection(_localUp);
        this._alignCameraUp(_localUp, 1);
        this.getCameraUpDirection(_localUp);
        this._clampRotation(_localUp);
      }
    }
    // updates the camera to position it based on the constraints of the controls
    adjustCamera(camera) {
      const { adjustHeight, cameraRadius } = this;
      if (camera.isPerspectiveCamera) {
        this.getUpDirection(camera.position, _localUp);
        const hit = adjustHeight && this._getPointBelowCamera(camera.position, _localUp) || null;
        if (hit) {
          const dist = hit.distance;
          if (dist < cameraRadius) {
            camera.position.addScaledVector(_localUp, cameraRadius - dist);
          }
        }
      }
    }
    dispose() {
      this.detach();
    }
    // private
    _updateInertia(deltaTime) {
      const {
        rotationInertia,
        pivotPoint,
        dragInertia,
        enableDamping,
        dampingFactor,
        camera,
        cameraRadius,
        minDistance,
        inertiaTargetDistance
      } = this;
      if (!this.enableDamping || this.inertiaStableFrames > 1) {
        dragInertia.set(0, 0, 0);
        rotationInertia.set(0, 0, 0);
        return;
      }
      const factor = Math.pow(2, -deltaTime / dampingFactor);
      const stableDistance = Math.max(camera.near, cameraRadius, minDistance, inertiaTargetDistance);
      const resolution = 2 * 1e3;
      const pixelWidth = 2 / resolution;
      const pixelThreshold = 0.25 * pixelWidth;
      if (rotationInertia.lengthSq() > 0) {
        setRaycasterFromCamera(_ray$1, _vec$2.set(0, 0, -1), camera);
        _ray$1.applyMatrix4(camera.matrixWorldInverse);
        _ray$1.direction.normalize();
        _ray$1.recast(-_ray$1.direction.dot(_ray$1.origin)).at(stableDistance / _ray$1.direction.z, _vec$2);
        _vec$2.applyMatrix4(camera.matrixWorld);
        setRaycasterFromCamera(_ray$1, _delta.set(pixelThreshold, pixelThreshold, -1), camera);
        _ray$1.applyMatrix4(camera.matrixWorldInverse);
        _ray$1.direction.normalize();
        _ray$1.recast(-_ray$1.direction.dot(_ray$1.origin)).at(stableDistance / _ray$1.direction.z, _delta);
        _delta.applyMatrix4(camera.matrixWorld);
        _vec$2.sub(pivotPoint).normalize();
        _delta.sub(pivotPoint).normalize();
        const threshold = _vec$2.angleTo(_delta) / deltaTime;
        rotationInertia.multiplyScalar(factor);
        if (rotationInertia.lengthSq() < threshold ** 2 || !enableDamping) {
          rotationInertia.set(0, 0);
        }
      }
      if (dragInertia.lengthSq() > 0) {
        setRaycasterFromCamera(_ray$1, _vec$2.set(0, 0, -1), camera);
        _ray$1.applyMatrix4(camera.matrixWorldInverse);
        _ray$1.direction.normalize();
        _ray$1.recast(-_ray$1.direction.dot(_ray$1.origin)).at(stableDistance / _ray$1.direction.z, _vec$2);
        _vec$2.applyMatrix4(camera.matrixWorld);
        setRaycasterFromCamera(_ray$1, _delta.set(pixelThreshold, pixelThreshold, -1), camera);
        _ray$1.applyMatrix4(camera.matrixWorldInverse);
        _ray$1.direction.normalize();
        _ray$1.recast(-_ray$1.direction.dot(_ray$1.origin)).at(stableDistance / _ray$1.direction.z, _delta);
        _delta.applyMatrix4(camera.matrixWorld);
        const threshold = _vec$2.distanceTo(_delta) / deltaTime;
        dragInertia.multiplyScalar(factor);
        if (dragInertia.lengthSq() < threshold ** 2 || !enableDamping) {
          dragInertia.set(0, 0, 0);
        }
      }
      if (rotationInertia.lengthSq() > 0) {
        this._applyRotation(rotationInertia.x * deltaTime, rotationInertia.y * deltaTime, pivotPoint);
      }
      if (dragInertia.lengthSq() > 0) {
        camera.position.addScaledVector(dragInertia, deltaTime);
        camera.updateMatrixWorld();
      }
    }
    _inertiaNeedsUpdate() {
      const { rotationInertia, dragInertia } = this;
      return rotationInertia.lengthSq() !== 0 || dragInertia.lengthSq() !== 0;
    }
    _updateZoom() {
      const {
        zoomPoint,
        zoomDirection,
        camera,
        minDistance,
        maxDistance,
        pointerTracker,
        domElement,
        minZoom,
        maxZoom,
        zoomSpeed,
        state
      } = this;
      let scale = this.zoomDelta;
      this.zoomDelta = 0;
      if (!pointerTracker.getLatestPoint(_pointer$1) || scale === 0 && state !== ZOOM) {
        return;
      }
      this.rotationInertia.set(0, 0);
      this.dragInertia.set(0, 0, 0);
      if (camera.isOrthographicCamera) {
        this._updateZoomDirection();
        const zoomIntoPoint = this.zoomPointSet || this._updateZoomPoint();
        _mouseBefore.unproject(camera);
        const normalizedDelta = Math.pow(0.95, Math.abs(scale * 0.05));
        let scaleFactor = scale > 0 ? 1 / Math.abs(normalizedDelta) : normalizedDelta;
        scaleFactor *= zoomSpeed;
        if (scaleFactor > 1) {
          if (maxZoom < camera.zoom * scaleFactor) {
            scaleFactor = 1;
          }
        } else {
          if (minZoom > camera.zoom * scaleFactor) {
            scaleFactor = 1;
          }
        }
        camera.zoom *= scaleFactor;
        camera.updateProjectionMatrix();
        if (zoomIntoPoint) {
          mouseToCoords(_pointer$1.x, _pointer$1.y, domElement, _mouseAfter);
          _mouseAfter.unproject(camera);
          camera.position.sub(_mouseAfter).add(_mouseBefore);
          camera.updateMatrixWorld();
        }
      } else {
        this._updateZoomDirection();
        const finalZoomDirection = _vec$2.copy(zoomDirection);
        if (this.zoomPointSet || this._updateZoomPoint()) {
          const dist = zoomPoint.distanceTo(camera.position);
          if (scale < 0) {
            const remainingDistance = Math.min(0, dist - maxDistance);
            scale = scale * dist * zoomSpeed * 25e-4;
            scale = Math.max(scale, remainingDistance);
          } else {
            const remainingDistance = Math.max(0, dist - minDistance);
            scale = scale * Math.max(dist - minDistance, 0) * zoomSpeed * 25e-4;
            scale = Math.min(scale, remainingDistance);
          }
          camera.position.addScaledVector(zoomDirection, scale);
          camera.updateMatrixWorld();
        } else {
          const hit = this._getPointBelowCamera();
          if (hit) {
            const dist = hit.distance;
            finalZoomDirection.set(0, 0, -1).transformDirection(camera.matrixWorld);
            camera.position.addScaledVector(finalZoomDirection, scale * dist * 0.01);
            camera.updateMatrixWorld();
          }
        }
      }
    }
    _updateZoomDirection() {
      if (this.zoomDirectionSet) {
        return;
      }
      const { domElement, raycaster, camera, zoomDirection, pointerTracker } = this;
      pointerTracker.getLatestPoint(_pointer$1);
      mouseToCoords(_pointer$1.x, _pointer$1.y, domElement, _mouseBefore);
      setRaycasterFromCamera(raycaster, _mouseBefore, camera);
      zoomDirection.copy(raycaster.ray.direction).normalize();
      this.zoomDirectionSet = true;
    }
    // update the point being zoomed in to based on the zoom direction
    _updateZoomPoint() {
      const {
        camera,
        zoomDirectionSet,
        zoomDirection,
        raycaster,
        zoomPoint,
        pointerTracker,
        domElement
      } = this;
      this._zoomPointWasSet = false;
      if (!zoomDirectionSet) {
        return false;
      }
      if (camera.isOrthographicCamera && pointerTracker.getLatestPoint(_zoomPointPointer)) {
        mouseToCoords(_zoomPointPointer.x, _zoomPointPointer.y, domElement, _zoomPointPointer);
        setRaycasterFromCamera(raycaster, _zoomPointPointer, camera);
      } else {
        raycaster.ray.origin.copy(camera.position);
        raycaster.ray.direction.copy(zoomDirection);
        raycaster.near = 0;
        raycaster.far = Infinity;
      }
      const hit = this._raycast(raycaster);
      if (hit) {
        zoomPoint.copy(hit.point);
        this.zoomPointSet = true;
        this._zoomPointWasSet = true;
        return true;
      }
      return false;
    }
    // returns the point below the camera
    _getPointBelowCamera(point = this.camera.position, up = this.up) {
      const { raycaster } = this;
      raycaster.ray.direction.copy(up).multiplyScalar(-1);
      raycaster.ray.origin.copy(point).addScaledVector(up, 1e5);
      raycaster.near = 0;
      raycaster.far = Infinity;
      const hit = this._raycast(raycaster);
      if (hit) {
        hit.distance -= 1e5;
      }
      return hit;
    }
    // update the drag action
    _updatePosition(deltaTime) {
      const {
        raycaster,
        camera,
        pivotPoint,
        up,
        pointerTracker,
        domElement,
        state,
        dragInertia
      } = this;
      if (state === DRAG) {
        pointerTracker.getCenterPoint(_pointer$1);
        mouseToCoords(_pointer$1.x, _pointer$1.y, domElement, _pointer$1);
        _plane.setFromNormalAndCoplanarPoint(up, pivotPoint);
        setRaycasterFromCamera(raycaster, _pointer$1, camera);
        if (Math.abs(raycaster.ray.direction.dot(up)) < DRAG_PLANE_THRESHOLD) {
          const angle = Math.acos(DRAG_PLANE_THRESHOLD);
          _rotationAxis.crossVectors(raycaster.ray.direction, up).normalize();
          raycaster.ray.direction.copy(up).applyAxisAngle(_rotationAxis, angle).multiplyScalar(-1);
        }
        this.getUpDirection(pivotPoint, _localUp);
        if (Math.abs(raycaster.ray.direction.dot(_localUp)) < DRAG_UP_THRESHOLD) {
          const angle = Math.acos(DRAG_UP_THRESHOLD);
          _rotationAxis.crossVectors(raycaster.ray.direction, _localUp).normalize();
          raycaster.ray.direction.copy(_localUp).applyAxisAngle(_rotationAxis, angle).multiplyScalar(-1);
        }
        if (raycaster.ray.intersectPlane(_plane, _vec$2)) {
          _delta.subVectors(pivotPoint, _vec$2);
          camera.position.add(_delta);
          camera.updateMatrixWorld();
          _delta.multiplyScalar(1 / deltaTime);
          if (pointerTracker.getMoveDistance() / deltaTime < 2 * window.devicePixelRatio) {
            this.inertiaStableFrames++;
          } else {
            dragInertia.copy(_delta);
            this.inertiaStableFrames = 0;
          }
        }
      }
    }
    _updateRotation(deltaTime) {
      const {
        pivotPoint,
        pointerTracker,
        domElement,
        state,
        rotationInertia
      } = this;
      if (state === ROTATE) {
        pointerTracker.getCenterPoint(_pointer$1);
        pointerTracker.getPreviousCenterPoint(_prevPointer);
        _deltaPointer.subVectors(_pointer$1, _prevPointer).multiplyScalar(2 * Math.PI / domElement.clientHeight);
        this._applyRotation(_deltaPointer.x, _deltaPointer.y, pivotPoint);
        _deltaPointer.multiplyScalar(1 / deltaTime);
        if (pointerTracker.getMoveDistance() / deltaTime < 2 * window.devicePixelRatio) {
          this.inertiaStableFrames++;
        } else {
          rotationInertia.copy(_deltaPointer);
          this.inertiaStableFrames = 0;
        }
      }
    }
    _applyRotation(x, y, pivotPoint) {
      if (x === 0 && y === 0) {
        return;
      }
      const {
        camera,
        minAltitude,
        maxAltitude,
        rotationSpeed
      } = this;
      const azimuth = -x * rotationSpeed;
      let altitude = y * rotationSpeed;
      _forward$2.set(0, 0, 1).transformDirection(camera.matrixWorld);
      _right.set(1, 0, 0).transformDirection(camera.matrixWorld);
      this.getUpDirection(pivotPoint, _localUp);
      let angle;
      if (_localUp.dot(_forward$2) > 1 - 1e-10) {
        angle = 0;
      } else {
        _vec$2.crossVectors(_localUp, _forward$2).normalize();
        const sign = Math.sign(_vec$2.dot(_right));
        angle = sign * _localUp.angleTo(_forward$2);
      }
      if (altitude > 0) {
        altitude = Math.min(angle - minAltitude, altitude);
        altitude = Math.max(0, altitude);
      } else {
        altitude = Math.max(angle - maxAltitude, altitude);
        altitude = Math.min(0, altitude);
      }
      _quaternion$1.setFromAxisAngle(_localUp, azimuth);
      makeRotateAroundPoint(pivotPoint, _quaternion$1, _rotMatrix$1);
      camera.matrixWorld.premultiply(_rotMatrix$1);
      _right.set(1, 0, 0).transformDirection(camera.matrixWorld);
      _quaternion$1.setFromAxisAngle(_right, -altitude);
      makeRotateAroundPoint(pivotPoint, _quaternion$1, _rotMatrix$1);
      camera.matrixWorld.premultiply(_rotMatrix$1);
      camera.matrixWorld.decompose(camera.position, camera.quaternion, _vec$2);
    }
    // sets the "up" axis for the current surface of the tileset
    _setFrame(newUp) {
      const {
        up,
        camera,
        zoomPoint,
        zoomDirectionSet,
        zoomPointSet,
        scaleZoomOrientationAtEdges
      } = this;
      if (zoomDirectionSet && (zoomPointSet || this._updateZoomPoint())) {
        _quaternion$1.setFromUnitVectors(up, newUp);
        if (scaleZoomOrientationAtEdges) {
          this.getUpDirection(zoomPoint, _vec$2);
          let amt = Math.max(_vec$2.dot(up) - 0.6, 0) / 0.4;
          amt = MathUtils.mapLinear(amt, 0, 0.5, 0, 1);
          amt = Math.min(amt, 1);
          if (camera.isOrthographicCamera) {
            amt *= 0.1;
          }
          _quaternion$1.slerp(_identityQuat, 1 - amt);
        }
        makeRotateAroundPoint(zoomPoint, _quaternion$1, _rotMatrix$1);
        camera.updateMatrixWorld();
        camera.matrixWorld.premultiply(_rotMatrix$1);
        camera.matrixWorld.decompose(camera.position, camera.quaternion, _vec$2);
        this.zoomDirectionSet = false;
        this._updateZoomDirection();
      }
      up.copy(newUp);
      camera.updateMatrixWorld();
    }
    _raycast(raycaster) {
      const { scene, useFallbackPlane, fallbackPlane } = this;
      const result = raycaster.intersectObject(scene)[0] || null;
      if (result) {
        return result;
      } else if (useFallbackPlane) {
        const plane = fallbackPlane;
        if (raycaster.ray.intersectPlane(plane, _vec$2)) {
          const planeHit = {
            point: _vec$2.clone(),
            distance: raycaster.ray.origin.distanceTo(_vec$2)
          };
          return planeHit;
        }
      }
      return null;
    }
    // tilt the camera to align with the provided "up" value
    _alignCameraUp(up, alpha = 1) {
      const { camera, state, pivotPoint, zoomPoint, zoomPointSet } = this;
      camera.updateMatrixWorld();
      _forward$2.set(0, 0, -1).transformDirection(camera.matrixWorld);
      _right.set(-1, 0, 0).transformDirection(camera.matrixWorld);
      let multiplier = MathUtils.mapLinear(1 - Math.abs(_forward$2.dot(up)), 0, 0.2, 0, 1);
      multiplier = MathUtils.clamp(multiplier, 0, 1);
      alpha *= multiplier;
      _targetRight$1.crossVectors(up, _forward$2);
      _targetRight$1.lerp(_right, 1 - alpha).normalize();
      _quaternion$1.setFromUnitVectors(_right, _targetRight$1);
      camera.quaternion.premultiply(_quaternion$1);
      let fixedPoint = null;
      if (state === DRAG || state === ROTATE) {
        fixedPoint = _pos$1.copy(pivotPoint);
      } else if (zoomPointSet) {
        fixedPoint = _pos$1.copy(zoomPoint);
      }
      if (fixedPoint) {
        _invMatrix$1.copy(camera.matrixWorld).invert();
        _vec$2.copy(fixedPoint).applyMatrix4(_invMatrix$1);
        camera.updateMatrixWorld();
        _vec$2.applyMatrix4(camera.matrixWorld);
        _center$1.subVectors(fixedPoint, _vec$2);
        camera.position.add(_center$1);
      }
      camera.updateMatrixWorld();
    }
    // clamp rotation to the given "up" vector
    _clampRotation(up) {
      const { camera, minAltitude, maxAltitude, state, pivotPoint, zoomPoint, zoomPointSet } = this;
      camera.updateMatrixWorld();
      _forward$2.set(0, 0, 1).transformDirection(camera.matrixWorld);
      _right.set(1, 0, 0).transformDirection(camera.matrixWorld);
      let angle;
      if (up.dot(_forward$2) > 1 - 1e-10) {
        angle = 0;
      } else {
        _vec$2.crossVectors(up, _forward$2);
        const sign = Math.sign(_vec$2.dot(_right));
        angle = sign * up.angleTo(_forward$2);
      }
      let targetAngle;
      if (angle > maxAltitude) {
        targetAngle = maxAltitude;
      } else if (angle < minAltitude) {
        targetAngle = minAltitude;
      } else {
        return;
      }
      _forward$2.copy(up);
      _quaternion$1.setFromAxisAngle(_right, targetAngle);
      _forward$2.applyQuaternion(_quaternion$1).normalize();
      _vec$2.crossVectors(_forward$2, _right).normalize();
      _rotMatrix$1.makeBasis(_right, _vec$2, _forward$2);
      camera.quaternion.setFromRotationMatrix(_rotMatrix$1);
      let fixedPoint = null;
      if (state === DRAG || state === ROTATE) {
        fixedPoint = _pos$1.copy(pivotPoint);
      } else if (zoomPointSet) {
        fixedPoint = _pos$1.copy(zoomPoint);
      }
      if (fixedPoint) {
        _invMatrix$1.copy(camera.matrixWorld).invert();
        _vec$2.copy(fixedPoint).applyMatrix4(_invMatrix$1);
        camera.updateMatrixWorld();
        _vec$2.applyMatrix4(camera.matrixWorld);
        _center$1.subVectors(fixedPoint, _vec$2);
        camera.position.add(_center$1);
      }
      camera.updateMatrixWorld();
    }
  }
  const _invMatrix = /* @__PURE__ */ new Matrix4();
  const _rotMatrix = /* @__PURE__ */ new Matrix4();
  const _pos = /* @__PURE__ */ new Vector3();
  const _vec$1 = /* @__PURE__ */ new Vector3();
  const _center = /* @__PURE__ */ new Vector3();
  const _forward$1 = /* @__PURE__ */ new Vector3();
  const _targetRight = /* @__PURE__ */ new Vector3();
  const _globalUp = /* @__PURE__ */ new Vector3();
  const _quaternion = /* @__PURE__ */ new Quaternion();
  const _zoomPointUp = /* @__PURE__ */ new Vector3();
  const _toCenter = /* @__PURE__ */ new Vector3();
  const _ray = /* @__PURE__ */ new Ray();
  const _ellipsoid = /* @__PURE__ */ new Ellipsoid();
  const _pointer = /* @__PURE__ */ new Vector2();
  const _latLon = {};
  const MIN_ELEVATION = 2550;
  class GlobeControls extends EnvironmentControls {
    get tilesGroup() {
      console.warn('GlobeControls: "tilesGroup" has been deprecated. Use "ellipsoidGroup", instead.');
      return this.ellipsoidFrame;
    }
    get ellipsoidFrame() {
      return this.ellipsoidGroup.matrixWorld;
    }
    get ellipsoidFrameInverse() {
      const { ellipsoidGroup, ellipsoidFrame, _ellipsoidFrameInverse } = this;
      return ellipsoidGroup.matrixWorldInverse ? ellipsoidGroup.matrixWorldInverse : _ellipsoidFrameInverse.copy(ellipsoidFrame).invert();
    }
    constructor(scene = null, camera = null, domElement = null, tilesRenderer = null) {
      super(scene, camera, domElement);
      this.isGlobeControls = true;
      this._dragMode = 0;
      this._rotationMode = 0;
      this.maxZoom = 0.01;
      this.nearMargin = 0.25;
      this.farMargin = 0;
      this.useFallbackPlane = false;
      this.autoAdjustCameraRotation = false;
      this.globeInertia = new Quaternion();
      this.globeInertiaFactor = 0;
      this.ellipsoid = WGS84_ELLIPSOID.clone();
      this.ellipsoidGroup = new Group();
      this._ellipsoidFrameInverse = new Matrix4();
      if (tilesRenderer !== null) {
        this.setTilesRenderer(tilesRenderer);
      }
    }
    setTilesRenderer(tilesRenderer) {
      super.setTilesRenderer(tilesRenderer);
      if (tilesRenderer !== null) {
        this.setEllipsoid(tilesRenderer.ellipsoid, tilesRenderer.group);
      }
    }
    setEllipsoid(ellipsoid, ellipsoidGroup) {
      this.ellipsoid = ellipsoid || WGS84_ELLIPSOID.clone();
      this.ellipsoidGroup = ellipsoidGroup || new Group();
    }
    getPivotPoint(target) {
      const { camera, ellipsoidFrame, ellipsoidFrameInverse, ellipsoid } = this;
      _forward$1.set(0, 0, -1).transformDirection(camera.matrixWorld);
      _ray.origin.copy(camera.position);
      _ray.direction.copy(_forward$1);
      _ray.applyMatrix4(ellipsoidFrameInverse);
      ellipsoid.closestPointToRayEstimate(_ray, _vec$1).applyMatrix4(ellipsoidFrame);
      if (super.getPivotPoint(target) === null || _pos.subVectors(target, _ray.origin).dot(_ray.direction) > _pos.subVectors(_vec$1, _ray.origin).dot(_ray.direction)) {
        target.copy(_vec$1);
      }
      return target;
    }
    // get the vector to the center of the provided globe
    getVectorToCenter(target) {
      const { ellipsoidFrame, camera } = this;
      return target.setFromMatrixPosition(ellipsoidFrame).sub(camera.position);
    }
    // get the distance to the center of the globe
    getDistanceToCenter() {
      return this.getVectorToCenter(_vec$1).length();
    }
    getUpDirection(point, target) {
      const { ellipsoidFrame, ellipsoidFrameInverse, ellipsoid } = this;
      _vec$1.copy(point).applyMatrix4(ellipsoidFrameInverse);
      ellipsoid.getPositionToNormal(_vec$1, target);
      target.transformDirection(ellipsoidFrame);
    }
    getCameraUpDirection(target) {
      const { ellipsoidFrame, ellipsoidFrameInverse, ellipsoid, camera } = this;
      if (camera.isOrthographicCamera) {
        this._getVirtualOrthoCameraPosition(_vec$1);
        _vec$1.applyMatrix4(ellipsoidFrameInverse);
        ellipsoid.getPositionToNormal(_vec$1, target);
        target.transformDirection(ellipsoidFrame);
      } else {
        this.getUpDirection(camera.position, target);
      }
    }
    update(deltaTime = Math.min(this.clock.getDelta(), 64 / 1e3)) {
      if (!this.enabled || !this.camera || deltaTime === 0) {
        return;
      }
      const { camera, pivotMesh } = this;
      if (this._isNearControls()) {
        this.scaleZoomOrientationAtEdges = this.zoomDelta < 0;
      } else {
        if (this.state !== NONE && this._dragMode !== 1 && this._rotationMode !== 1) {
          pivotMesh.visible = false;
        }
        this.scaleZoomOrientationAtEdges = false;
      }
      const adjustCameraRotation = this.needsUpdate || this._inertiaNeedsUpdate();
      super.update(deltaTime);
      this.adjustCamera(camera);
      if (adjustCameraRotation && this._isNearControls()) {
        this.getCameraUpDirection(_globalUp);
        this._alignCameraUp(_globalUp, 1);
        this.getCameraUpDirection(_globalUp);
        this._clampRotation(_globalUp);
      }
    }
    // Updates the passed camera near and far clip planes to encapsulate the ellipsoid from the
    // current position in addition to adjusting the height.
    adjustCamera(camera) {
      super.adjustCamera(camera);
      const { ellipsoidFrame, ellipsoidFrameInverse, ellipsoid, nearMargin, farMargin } = this;
      const maxRadius = Math.max(...ellipsoid.radius);
      if (camera.isPerspectiveCamera) {
        const distanceToCenter = _vec$1.setFromMatrixPosition(ellipsoidFrame).sub(camera.position).length();
        const margin = nearMargin * maxRadius;
        const alpha = MathUtils.clamp((distanceToCenter - maxRadius) / margin, 0, 1);
        const minNear = MathUtils.lerp(1, 1e3, alpha);
        camera.near = Math.max(minNear, distanceToCenter - maxRadius - margin);
        _pos.copy(camera.position).applyMatrix4(ellipsoidFrameInverse);
        ellipsoid.getPositionToCartographic(_pos, _latLon);
        const elevation = Math.max(ellipsoid.getPositionElevation(_pos), MIN_ELEVATION);
        const horizonDistance = ellipsoid.calculateHorizonDistance(_latLon.lat, elevation);
        camera.far = horizonDistance + 0.1 + maxRadius * farMargin;
        camera.updateProjectionMatrix();
      } else {
        this._getVirtualOrthoCameraPosition(camera.position, camera);
        camera.updateMatrixWorld();
        _invMatrix.copy(camera.matrixWorld).invert();
        _vec$1.setFromMatrixPosition(ellipsoidFrame).applyMatrix4(_invMatrix);
        const distanceToCenter = -_vec$1.z;
        camera.near = distanceToCenter - maxRadius * (1 + nearMargin);
        camera.far = distanceToCenter + 0.1 + maxRadius * farMargin;
        camera.position.addScaledVector(_forward$1, camera.near);
        camera.far -= camera.near;
        camera.near = 0;
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
      }
    }
    // resets the "stuck" drag modes
    setState(...args) {
      super.setState(...args);
      this._dragMode = 0;
      this._rotationMode = 0;
    }
    _updateInertia(deltaTime) {
      super._updateInertia(deltaTime);
      const {
        globeInertia,
        enableDamping,
        dampingFactor,
        camera,
        cameraRadius,
        minDistance,
        inertiaTargetDistance,
        ellipsoidFrame
      } = this;
      if (!this.enableDamping || this.inertiaStableFrames > 1) {
        this.globeInertiaFactor = 0;
        this.globeInertia.identity();
        return;
      }
      const factor = Math.pow(2, -deltaTime / dampingFactor);
      const stableDistance = Math.max(camera.near, cameraRadius, minDistance, inertiaTargetDistance);
      const resolution = 2 * 1e3;
      const pixelWidth = 2 / resolution;
      const pixelThreshold = 0.25 * pixelWidth;
      _center.setFromMatrixPosition(ellipsoidFrame);
      if (this.globeInertiaFactor !== 0) {
        setRaycasterFromCamera(_ray, _vec$1.set(0, 0, -1), camera);
        _ray.applyMatrix4(camera.matrixWorldInverse);
        _ray.direction.normalize();
        _ray.recast(-_ray.direction.dot(_ray.origin)).at(stableDistance / _ray.direction.z, _vec$1);
        _vec$1.applyMatrix4(camera.matrixWorld);
        setRaycasterFromCamera(_ray, _pos.set(pixelThreshold, pixelThreshold, -1), camera);
        _ray.applyMatrix4(camera.matrixWorldInverse);
        _ray.direction.normalize();
        _ray.recast(-_ray.direction.dot(_ray.origin)).at(stableDistance / _ray.direction.z, _pos);
        _pos.applyMatrix4(camera.matrixWorld);
        _vec$1.sub(_center).normalize();
        _pos.sub(_center).normalize();
        this.globeInertiaFactor *= factor;
        const threshold = _vec$1.angleTo(_pos) / deltaTime;
        const globeAngle = 2 * Math.acos(globeInertia.w) * this.globeInertiaFactor;
        if (globeAngle < threshold || !enableDamping) {
          this.globeInertiaFactor = 0;
          globeInertia.identity();
        }
      }
      if (this.globeInertiaFactor !== 0) {
        if (globeInertia.w === 1 && (globeInertia.x !== 0 || globeInertia.y !== 0 || globeInertia.z !== 0)) {
          globeInertia.w = Math.min(globeInertia.w, 1 - 1e-9);
        }
        _center.setFromMatrixPosition(ellipsoidFrame);
        _quaternion.identity().slerp(globeInertia, this.globeInertiaFactor * deltaTime);
        makeRotateAroundPoint(_center, _quaternion, _rotMatrix);
        camera.matrixWorld.premultiply(_rotMatrix);
        camera.matrixWorld.decompose(camera.position, camera.quaternion, _vec$1);
      }
    }
    _inertiaNeedsUpdate() {
      return super._inertiaNeedsUpdate() || this.globeInertiaFactor !== 0;
    }
    _updatePosition(deltaTime) {
      if (this.state === DRAG) {
        if (this._dragMode === 0) {
          this._dragMode = this._isNearControls() ? 1 : -1;
        }
        const {
          raycaster,
          camera,
          pivotPoint,
          pointerTracker,
          domElement,
          ellipsoidFrame,
          ellipsoidFrameInverse
        } = this;
        const pivotDir = _pos;
        const newPivotDir = _targetRight;
        pointerTracker.getCenterPoint(_pointer);
        mouseToCoords(_pointer.x, _pointer.y, domElement, _pointer);
        setRaycasterFromCamera(raycaster, _pointer, camera);
        raycaster.ray.applyMatrix4(ellipsoidFrameInverse);
        const pivotRadius = _vec$1.copy(pivotPoint).applyMatrix4(ellipsoidFrameInverse).length();
        _ellipsoid.radius.setScalar(pivotRadius);
        if (!_ellipsoid.intersectRay(raycaster.ray, _vec$1)) {
          this.resetState();
          this._updateInertia(deltaTime);
          return;
        }
        _vec$1.applyMatrix4(ellipsoidFrame);
        _center.setFromMatrixPosition(ellipsoidFrame);
        pivotDir.subVectors(pivotPoint, _center).normalize();
        newPivotDir.subVectors(_vec$1, _center).normalize();
        _quaternion.setFromUnitVectors(newPivotDir, pivotDir);
        makeRotateAroundPoint(_center, _quaternion, _rotMatrix);
        camera.matrixWorld.premultiply(_rotMatrix);
        camera.matrixWorld.decompose(camera.position, camera.quaternion, _vec$1);
        if (pointerTracker.getMoveDistance() / deltaTime < 2 * window.devicePixelRatio) {
          this.inertiaStableFrames++;
        } else {
          this.globeInertia.copy(_quaternion);
          this.globeInertiaFactor = 1 / deltaTime;
          this.inertiaStableFrames = 0;
        }
      }
    }
    // disable rotation once we're outside the control transition
    _updateRotation(...args) {
      if (this._rotationMode === 1 || this._isNearControls()) {
        this._rotationMode = 1;
        super._updateRotation(...args);
      } else {
        this.pivotMesh.visible = false;
        this._rotationMode = -1;
      }
    }
    _updateZoom() {
      const { zoomDelta, ellipsoid, zoomSpeed, zoomPoint, camera, maxZoom, state } = this;
      if (state !== ZOOM && zoomDelta === 0) {
        return;
      }
      this.rotationInertia.set(0, 0);
      this.dragInertia.set(0, 0, 0);
      this.globeInertia.identity();
      this.globeInertiaFactor = 0;
      const deltaAlpha = MathUtils.clamp(MathUtils.mapLinear(Math.abs(zoomDelta), 0, 20, 0, 1), 0, 1);
      if (this._isNearControls() || zoomDelta > 0) {
        this._updateZoomDirection();
        if (zoomDelta < 0 && (this.zoomPointSet || this._updateZoomPoint())) {
          _forward$1.set(0, 0, -1).transformDirection(camera.matrixWorld).normalize();
          _toCenter.copy(this.up).multiplyScalar(-1);
          this.getUpDirection(zoomPoint, _zoomPointUp);
          const upAlpha = MathUtils.clamp(MathUtils.mapLinear(-_zoomPointUp.dot(_toCenter), 1, 0.95, 0, 1), 0, 1);
          const forwardAlpha = 1 - _forward$1.dot(_toCenter);
          const cameraAlpha = camera.isOrthographicCamera ? 0.05 : 1;
          const adjustedDeltaAlpha = MathUtils.clamp(deltaAlpha * 3, 0, 1);
          const alpha = Math.min(upAlpha * forwardAlpha * cameraAlpha * adjustedDeltaAlpha, 0.1);
          _toCenter.lerpVectors(_forward$1, _toCenter, alpha).normalize();
          _quaternion.setFromUnitVectors(_forward$1, _toCenter);
          makeRotateAroundPoint(zoomPoint, _quaternion, _rotMatrix);
          camera.matrixWorld.premultiply(_rotMatrix);
          camera.matrixWorld.decompose(camera.position, camera.quaternion, _toCenter);
          this.zoomDirection.subVectors(zoomPoint, camera.position).normalize();
        }
        super._updateZoom();
      } else if (camera.isPerspectiveCamera) {
        const transitionDistance = this._getPerspectiveTransitionDistance();
        const maxDistance = this._getMaxPerspectiveDistance();
        const distanceAlpha = MathUtils.mapLinear(this.getDistanceToCenter(), transitionDistance, maxDistance, 0, 1);
        this._tiltTowardsCenter(MathUtils.lerp(0, 0.4, distanceAlpha * deltaAlpha));
        this._alignCameraUpToNorth(MathUtils.lerp(0, 0.2, distanceAlpha * deltaAlpha));
        const dist = this.getDistanceToCenter() - ellipsoid.radius.x;
        const scale = zoomDelta * dist * zoomSpeed * 25e-4;
        const clampedScale = Math.max(scale, Math.min(this.getDistanceToCenter() - maxDistance, 0));
        this.getVectorToCenter(_vec$1).normalize();
        this.camera.position.addScaledVector(_vec$1, clampedScale);
        this.camera.updateMatrixWorld();
        this.zoomDelta = 0;
      } else {
        const transitionZoom = this._getOrthographicTransitionZoom();
        const minZoom = this._getMinOrthographicZoom();
        const distanceAlpha = MathUtils.mapLinear(camera.zoom, transitionZoom, minZoom, 0, 1);
        this._tiltTowardsCenter(MathUtils.lerp(0, 0.4, distanceAlpha * deltaAlpha));
        this._alignCameraUpToNorth(MathUtils.lerp(0, 0.2, distanceAlpha * deltaAlpha));
        const scale = this.zoomDelta;
        const normalizedDelta = Math.pow(0.95, Math.abs(scale * 0.05));
        const scaleFactor = scale > 0 ? 1 / Math.abs(normalizedDelta) : normalizedDelta;
        const maxScaleFactor = minZoom / camera.zoom;
        const clampedScaleFactor = Math.max(scaleFactor * zoomSpeed, Math.min(maxScaleFactor, 1));
        camera.zoom = Math.min(maxZoom, camera.zoom * clampedScaleFactor);
        camera.updateProjectionMatrix();
        this.zoomDelta = 0;
        this.zoomDirectionSet = false;
      }
    }
    // tilt the camera to align with north
    _alignCameraUpToNorth(alpha) {
      const { ellipsoidFrame } = this;
      _globalUp.set(0, 0, 1).transformDirection(ellipsoidFrame);
      this._alignCameraUp(_globalUp, alpha);
    }
    // tilt the camera to look at the center of the globe
    _tiltTowardsCenter(alpha) {
      const {
        camera,
        ellipsoidFrame
      } = this;
      _forward$1.set(0, 0, -1).transformDirection(camera.matrixWorld).normalize();
      _vec$1.setFromMatrixPosition(ellipsoidFrame).sub(camera.position).normalize();
      _vec$1.lerp(_forward$1, 1 - alpha).normalize();
      _quaternion.setFromUnitVectors(_forward$1, _vec$1);
      camera.quaternion.premultiply(_quaternion);
      camera.updateMatrixWorld();
    }
    // returns the perspective camera transition distance can move to based on globe size and fov
    _getPerspectiveTransitionDistance() {
      const { camera, ellipsoid } = this;
      if (!camera.isPerspectiveCamera) {
        throw new Error();
      }
      const ellipsoidRadius = Math.max(...ellipsoid.radius);
      const fovHoriz = 2 * Math.atan(Math.tan(MathUtils.DEG2RAD * camera.fov * 0.5) * camera.aspect);
      const distVert = ellipsoidRadius / Math.tan(MathUtils.DEG2RAD * camera.fov * 0.5);
      const distHoriz = ellipsoidRadius / Math.tan(fovHoriz * 0.5);
      const dist = Math.max(distVert, distHoriz);
      return dist;
    }
    // returns the max distance the perspective camera can move to based on globe size and fov
    _getMaxPerspectiveDistance() {
      const { camera, ellipsoid } = this;
      if (!camera.isPerspectiveCamera) {
        throw new Error();
      }
      const ellipsoidRadius = Math.max(...ellipsoid.radius);
      const fovHoriz = 2 * Math.atan(Math.tan(MathUtils.DEG2RAD * camera.fov * 0.5) * camera.aspect);
      const distVert = ellipsoidRadius / Math.tan(MathUtils.DEG2RAD * camera.fov * 0.5);
      const distHoriz = ellipsoidRadius / Math.tan(fovHoriz * 0.5);
      const dist = 2 * Math.max(distVert, distHoriz);
      return dist;
    }
    // returns the transition threshold for orthographic zoom based on the globe size and camera settings
    _getOrthographicTransitionZoom() {
      const { camera, ellipsoid } = this;
      if (!camera.isOrthographicCamera) {
        throw new Error();
      }
      const orthoHeight = camera.top - camera.bottom;
      const orthoWidth = camera.right - camera.left;
      const orthoSize = Math.max(orthoHeight, orthoWidth);
      const ellipsoidRadius = Math.max(...ellipsoid.radius);
      const ellipsoidDiameter = 2 * ellipsoidRadius;
      return 2 * orthoSize / ellipsoidDiameter;
    }
    // returns the minimum allowed orthographic zoom based on the globe size and camera settings
    _getMinOrthographicZoom() {
      const { camera, ellipsoid } = this;
      if (!camera.isOrthographicCamera) {
        throw new Error();
      }
      const orthoHeight = camera.top - camera.bottom;
      const orthoWidth = camera.right - camera.left;
      const orthoSize = Math.min(orthoHeight, orthoWidth);
      const ellipsoidRadius = Math.max(...ellipsoid.radius);
      const ellipsoidDiameter = 2 * ellipsoidRadius;
      return 0.7 * orthoSize / ellipsoidDiameter;
    }
    // returns the "virtual position" of the orthographic based on where it is and
    // where it's looking primarily so we can reasonably position the camera object
    // in space and derive a reasonable "up" value.
    _getVirtualOrthoCameraPosition(target, camera = this.camera) {
      const { ellipsoidFrame, ellipsoidFrameInverse, ellipsoid } = this;
      if (!camera.isOrthographicCamera) {
        throw new Error();
      }
      _ray.origin.copy(camera.position);
      _ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
      _ray.applyMatrix4(ellipsoidFrameInverse);
      ellipsoid.closestPointToRayEstimate(_ray, _pos).applyMatrix4(ellipsoidFrame);
      const orthoHeight = camera.top - camera.bottom;
      const orthoWidth = camera.right - camera.left;
      const orthoSize = Math.max(orthoHeight, orthoWidth) / camera.zoom;
      _forward$1.set(0, 0, -1).transformDirection(camera.matrixWorld);
      const dist = _pos.sub(camera.position).dot(_forward$1);
      target.copy(camera.position).addScaledVector(_forward$1, dist - orthoSize * 4);
    }
    _isNearControls() {
      const { camera } = this;
      if (camera.isPerspectiveCamera) {
        return this.getDistanceToCenter() < this._getPerspectiveTransitionDistance();
      } else {
        return camera.zoom > this._getOrthographicTransitionZoom();
      }
    }
    _raycast(raycaster) {
      const result = super._raycast(raycaster);
      if (result === null) {
        const { ellipsoid, ellipsoidFrame, ellipsoidFrameInverse } = this;
        _ray.copy(raycaster.ray).applyMatrix4(ellipsoidFrameInverse);
        const point = ellipsoid.intersectRay(_ray, _vec$1);
        if (point !== null) {
          point.applyMatrix4(ellipsoidFrame);
          return {
            point: point.clone(),
            distance: point.distanceTo(raycaster.ray.origin)
          };
        } else {
          return null;
        }
      } else {
        return result;
      }
    }
  }
  const _forward = new Vector3();
  const _vec = new Vector3();
  const _orthographicCamera = new OrthographicCamera();
  const _targetOffset = new Vector3();
  const _perspOffset = new Vector3();
  const _orthoOffset = new Vector3();
  const _quat = new Quaternion();
  const _targetQuat = new Quaternion();
  class CameraTransitionManager extends EventDispatcher {
    get animating() {
      return this._alpha !== 0 && this._alpha !== 1;
    }
    get alpha() {
      return this._target === 0 ? 1 - this._alpha : this._alpha;
    }
    get camera() {
      if (this._alpha === 0) return this.perspectiveCamera;
      if (this._alpha === 1) return this.orthographicCamera;
      return this.transitionCamera;
    }
    get mode() {
      return this._target === 0 ? "perspective" : "orthographic";
    }
    set mode(v) {
      if (v === this.mode) {
        return;
      }
      const prevCamera = this.camera;
      if (v === "perspective") {
        this._target = 0;
        this._alpha = 0;
      } else {
        this._target = 1;
        this._alpha = 1;
      }
      this.dispatchEvent({ type: "camera-change", camera: this.camera, prevCamera });
    }
    constructor(perspectiveCamera = new PerspectiveCamera(), orthographicCamera = new OrthographicCamera()) {
      super();
      this.perspectiveCamera = perspectiveCamera;
      this.orthographicCamera = orthographicCamera;
      this.transitionCamera = new PerspectiveCamera();
      this.orthographicPositionalZoom = true;
      this.orthographicOffset = 50;
      this.fixedPoint = new Vector3();
      this.duration = 200;
      this.autoSync = true;
      this.easeFunction = (x) => x;
      this._target = 0;
      this._alpha = 0;
      this._clock = new Clock();
    }
    toggle() {
      this._target = this._target === 1 ? 0 : 1;
      this._clock.getDelta();
      this.dispatchEvent({ type: "toggle" });
    }
    update(deltaTime = Math.min(this._clock.getDelta(), 64 / 1e3)) {
      if (this.autoSync) {
        this.syncCameras();
      }
      const { perspectiveCamera, orthographicCamera, transitionCamera, camera } = this;
      const delta = deltaTime * 1e3;
      if (this._alpha !== this._target) {
        const direction = Math.sign(this._target - this._alpha);
        const step = direction * delta / this.duration;
        this._alpha = MathUtils.clamp(this._alpha + step, 0, 1);
        this.dispatchEvent({ type: "change", alpha: this.alpha });
      }
      const prevCamera = camera;
      let newCamera = null;
      if (this._alpha === 0) {
        newCamera = perspectiveCamera;
      } else if (this._alpha === 1) {
        newCamera = orthographicCamera;
      } else {
        newCamera = transitionCamera;
        this._updateTransitionCamera();
      }
      if (prevCamera !== newCamera) {
        if (newCamera === transitionCamera) {
          this.dispatchEvent({ type: "transition-start" });
        }
        this.dispatchEvent({ type: "camera-change", camera: newCamera, prevCamera });
        if (prevCamera === transitionCamera) {
          this.dispatchEvent({ type: "transition-end" });
        }
      }
    }
    syncCameras() {
      const fromCamera = this._getFromCamera();
      const { perspectiveCamera, orthographicCamera, transitionCamera, fixedPoint } = this;
      _forward.set(0, 0, -1).transformDirection(fromCamera.matrixWorld).normalize();
      if (fromCamera.isPerspectiveCamera) {
        if (this.orthographicPositionalZoom) {
          orthographicCamera.position.copy(perspectiveCamera.position).addScaledVector(_forward, -this.orthographicOffset);
          orthographicCamera.rotation.copy(perspectiveCamera.rotation);
          orthographicCamera.updateMatrixWorld();
        } else {
          const orthoDist = _vec.subVectors(fixedPoint, orthographicCamera.position).dot(_forward);
          const perspDist = _vec.subVectors(fixedPoint, perspectiveCamera.position).dot(_forward);
          _vec.copy(perspectiveCamera.position).addScaledVector(_forward, perspDist);
          orthographicCamera.rotation.copy(perspectiveCamera.rotation);
          orthographicCamera.position.copy(_vec).addScaledVector(_forward, -orthoDist);
          orthographicCamera.updateMatrixWorld();
        }
        const distToPoint = Math.abs(_vec.subVectors(perspectiveCamera.position, fixedPoint).dot(_forward));
        const projectionHeight = 2 * Math.tan(MathUtils.DEG2RAD * perspectiveCamera.fov * 0.5) * distToPoint;
        const orthoHeight = orthographicCamera.top - orthographicCamera.bottom;
        orthographicCamera.zoom = orthoHeight / projectionHeight;
        orthographicCamera.updateProjectionMatrix();
      } else {
        const distToPoint = Math.abs(_vec.subVectors(orthographicCamera.position, fixedPoint).dot(_forward));
        const orthoHeight = (orthographicCamera.top - orthographicCamera.bottom) / orthographicCamera.zoom;
        const targetDist = orthoHeight * 0.5 / Math.tan(MathUtils.DEG2RAD * perspectiveCamera.fov * 0.5);
        perspectiveCamera.rotation.copy(orthographicCamera.rotation);
        perspectiveCamera.position.copy(orthographicCamera.position).addScaledVector(_forward, distToPoint).addScaledVector(_forward, -targetDist);
        perspectiveCamera.updateMatrixWorld();
        if (this.orthographicPositionalZoom) {
          orthographicCamera.position.copy(perspectiveCamera.position).addScaledVector(_forward, -this.orthographicOffset);
          orthographicCamera.updateMatrixWorld();
        }
      }
      transitionCamera.position.copy(perspectiveCamera.position);
      transitionCamera.rotation.copy(perspectiveCamera.rotation);
    }
    _getTransitionDirection() {
      return Math.sign(this._target - this._alpha);
    }
    _getToCamera() {
      const dir = this._getTransitionDirection();
      if (dir === 0) {
        return this._target === 0 ? this.perspectiveCamera : this.orthographicCamera;
      } else if (dir > 0) {
        return this.orthographicCamera;
      } else {
        return this.perspectiveCamera;
      }
    }
    _getFromCamera() {
      const dir = this._getTransitionDirection();
      if (dir === 0) {
        return this._target === 0 ? this.perspectiveCamera : this.orthographicCamera;
      } else if (dir > 0) {
        return this.perspectiveCamera;
      } else {
        return this.orthographicCamera;
      }
    }
    _updateTransitionCamera() {
      const { perspectiveCamera, orthographicCamera, transitionCamera, fixedPoint } = this;
      const alpha = this.easeFunction(this._alpha);
      _forward.set(0, 0, -1).transformDirection(orthographicCamera.matrixWorld).normalize();
      _orthographicCamera.copy(orthographicCamera);
      _orthographicCamera.position.addScaledVector(_forward, orthographicCamera.near);
      orthographicCamera.far -= orthographicCamera.near;
      orthographicCamera.near = 0;
      _forward.set(0, 0, -1).transformDirection(perspectiveCamera.matrixWorld).normalize();
      const distToPoint = Math.abs(_vec.subVectors(perspectiveCamera.position, fixedPoint).dot(_forward));
      const projectionHeight = 2 * Math.tan(MathUtils.DEG2RAD * perspectiveCamera.fov * 0.5) * distToPoint;
      const targetQuat = _targetQuat.slerpQuaternions(perspectiveCamera.quaternion, _orthographicCamera.quaternion, alpha);
      const targetFov = MathUtils.lerp(perspectiveCamera.fov, 1, alpha);
      const targetDistance = projectionHeight * 0.5 / Math.tan(MathUtils.DEG2RAD * targetFov * 0.5);
      const orthoOffset = _orthoOffset.copy(_orthographicCamera.position).sub(fixedPoint).applyQuaternion(_quat.copy(_orthographicCamera.quaternion).invert());
      const perspOffset = _perspOffset.copy(perspectiveCamera.position).sub(fixedPoint).applyQuaternion(_quat.copy(perspectiveCamera.quaternion).invert());
      const targetOffset = _targetOffset.lerpVectors(perspOffset, orthoOffset, alpha);
      targetOffset.z -= Math.abs(targetOffset.z) - targetDistance;
      const distToPersp = -(perspOffset.z - targetOffset.z);
      const distToOrtho = -(orthoOffset.z - targetOffset.z);
      const targetNearPlane = MathUtils.lerp(distToPersp + perspectiveCamera.near, distToOrtho + _orthographicCamera.near, alpha);
      const targetFarPlane = MathUtils.lerp(distToPersp + perspectiveCamera.far, distToOrtho + _orthographicCamera.far, alpha);
      const planeDelta = Math.max(targetFarPlane, 0) - Math.max(targetNearPlane, 0);
      transitionCamera.aspect = perspectiveCamera.aspect;
      transitionCamera.fov = targetFov;
      transitionCamera.near = Math.max(targetNearPlane, planeDelta * 1e-5);
      transitionCamera.far = targetFarPlane;
      transitionCamera.position.copy(targetOffset).applyQuaternion(targetQuat).add(fixedPoint);
      transitionCamera.quaternion.copy(targetQuat);
      transitionCamera.updateProjectionMatrix();
      transitionCamera.updateMatrixWorld();
    }
  }
  exports2.B3DMLoader = B3DMLoader;
  exports2.B3DMLoaderBase = B3DMLoaderBase;
  exports2.CAMERA_FRAME = CAMERA_FRAME;
  exports2.CMPTLoader = CMPTLoader;
  exports2.CMPTLoaderBase = CMPTLoaderBase;
  exports2.CameraTransitionManager = CameraTransitionManager;
  exports2.ENU_FRAME = ENU_FRAME;
  exports2.Ellipsoid = Ellipsoid;
  exports2.EllipsoidRegion = EllipsoidRegion;
  exports2.EnvironmentControls = EnvironmentControls;
  exports2.FAILED = FAILED;
  exports2.GeoUtils = GeoUtils;
  exports2.GlobeControls = GlobeControls;
  exports2.I3DMLoader = I3DMLoader;
  exports2.I3DMLoaderBase = I3DMLoaderBase;
  exports2.LOADED = LOADED;
  exports2.LOADING = LOADING;
  exports2.LRUCache = LRUCache;
  exports2.LoaderBase = LoaderBase;
  exports2.LoaderUtils = LoaderUtils$1;
  exports2.MemoryUtils = MemoryUtils;
  exports2.OBB = OBB;
  exports2.OBJECT_FRAME = OBJECT_FRAME;
  exports2.PARSING = PARSING;
  exports2.PNTSLoader = PNTSLoader;
  exports2.PNTSLoaderBase = PNTSLoaderBase;
  exports2.PriorityQueue = PriorityQueue;
  exports2.TilesRenderer = TilesRenderer;
  exports2.TilesRendererBase = TilesRendererBase;
  exports2.TraversalUtils = TraversalUtils;
  exports2.UNLOADED = UNLOADED;
  exports2.WGS84_ELLIPSOID = WGS84_ELLIPSOID;
  exports2.WGS84_FLATTENING = WGS84_FLATTENING;
  exports2.WGS84_HEIGHT = WGS84_HEIGHT;
  exports2.WGS84_RADIUS = WGS84_RADIUS;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=index.umd.cjs.map
//AP
x3dom.3DTilesRenderer = exports