/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// version
/***********************************************************************/
const SGL_VERSION_MAJOR      = 0;
const SGL_VERSION_MINOR      = 1;
const SGL_VERSION_REVISION   = 1;
const SGL_VERSION_STRING     = SGL_VERSION_MAJOR + "." + SGL_VERSION_MINOR + "." + SGL_VERSION_REVISION;
/***********************************************************************/


// exceptions
/***********************************************************************/
function sglUnknown() {
	throw new Error("SpiderGL : UNKNOWN");
}

function sglUnsupported() {
	throw new Error("SpiderGL : UNSUPPORTED");
}

function sglUnimplemented() {
	throw new Error("SpiderGL : UNIMPLEMENTED");
}

function sglInvalidParameter() {
	throw new Error("SpiderGL : INVALID_PARAMETER");
}

function sglInvalidCall() {
	throw new Error("SpiderGL : INVALID_CALL");
}
/***********************************************************************/


// utilities
/***********************************************************************/
function sglDefineGetter(ClassName, getterName, getterFunc) {
	ClassName.prototype.__defineGetter__(getterName, getterFunc);
}

function sglDefineSetter(ClassName, setterName, setterFunc) {
	ClassName.prototype.__defineSetter__(setterName, setterFunc);
}

function sglDefineConstant(ClassName, constantName, constantValue) {
	ClassName[constantName] = constantValue;
}

function sglInherit(DerivedClassName, BaseClassName) {
	DerivedClassName.prototype = new BaseClassName();
	DerivedClassName.prototype.constructor = DerivedClassName;
}
/***********************************************************************/


// initialization - finalization
/***********************************************************************/
function sglInitialize() {
	;
}

function sglFinalize() {
	;
}

window.addEventListener("load",   function() { sglInitialize(); }, false);
window.addEventListener("unload", function() { sglFinalize();   }, false);
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// DOM utilities
/*********************************************************/
function sglNodeText(domNodeID) {
	var node = document.getElementById(domNodeID);
	if (!node) return null;

	var str = "";
	var n   = node.firstChild;
	while (n) {
		if (n.nodeType == 3) {
			str += n.textContent;
		}
		n = n.nextSibling;
	}
	return str;
}

function sglLoadFile(url, callback) {
	var async = (callback) ? (true) : (false);
	var req = new XMLHttpRequest();

	if (async) {
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (callback) {
					callback(req.responseText);
				}
			}
		};
	}

	req.open("GET", url, async);
	req.send(null);

	var ret = null;
	if (!async) {
		ret = req.responseText;
	}

	return ret;
}

function sglGetLines(text)
{
	var allLines = text.split("\n");
	var n = allLines.length;
	var lines = [ ];
	var line = null;
	for (var i=0; i<n; ++i) {
		line = allLines[i].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
		if (line.length > 0) {
			lines.push(line);
		}
	}
	return lines;
}
/*********************************************************/


// SglRequest
/*********************************************************/
const SGL_REQUEST_FAILED     = 0;
const SGL_REQUEST_SUCCEEDED  = 1;
const SGL_REQUEST_IDLE       = 2;
const SGL_REQUEST_ONGOING    = 3;
const SGL_REQUEST_ABORTED    = 4;
const SGL_REQUEST_QUEUED     = 5;
const SGL_REQUEST_REJECTED   = 6;
const SGL_REQUEST_CANCELLED  = 7;

/**
 * Constructs a SglRequest.
 * @class Base class for an asynchronous request.
 */
function SglRequest(onReadyCallback) {
	this._priority = null;
	this._status   = SGL_REQUEST_IDLE;
	this._queue    = null;
	this._onReady  = [ ];
	if (onReadyCallback) {
		this.addOnReadyCallback(onReadyCallback);
	}
}

SglRequest.prototype = {
	_createOnReadyCallback : function() {
		var t  = this;
		var cb = function(ok) {
			t._status = (ok) ? (SGL_REQUEST_SUCCEEDED) : (SGL_REQUEST_FAILED);
			if (t._queue) {
				t._queue._requestReady(t);
				this._queue  = null;
			}
			var n = t._onReady.length;
			for (var i=0; i<n; ++i) {
				t._onReady[i](t);
			}
		};
		return cb;
	},

	get status() {
		return this._status;
	},

	get priority() {
		return this._priority;
	},

	set priority(p) {
		this._priority = p;
		if (this._queue) {
			this._queue._updateRequest(this);
		}
	},

	get succeeded() {
		return (this._status == SGL_REQUEST_SUCCEEDED);
	},

	get failed() {
		return (this._status == SGL_REQUEST_FAILED);
	},

	addOnReadyCallback : function(f) {
		if (f) {
			this._onReady.push(f);
			if (this.isReady) {
				f(this);
			}
		}
	},

	removeOnReadyCallback : function(f) {
		var index = -1;
		var n = this._onReady.length;
		for (var i=0; i<n; ++i) {
			if (this._onReady[i] == f) {
				index = i;
				break;
			}
		}
		if (index < 0) return;
		this._onReady.splice(index, 1);
	},

	get isReady() {
		return (this.failed || this.succeeded);
	},

	get queue() {
		return this._queue;
	},

	send : function() {
		if (!this._send) return false;
		var r = this._send();
		if (r) {
			this._status = SGL_REQUEST_ONGOING;
		}
		else {
			this._status = SGL_REQUEST_FAILED;
			var cb = this._createOnReadyCallback();
			cb(false);
		}
		return r;
	},

	cancel : function() {
		if (this._status == SGL_REQUEST_QUEUED) {
			if (this._queue) {
				this._queue._removeQueuedRequest(this);
				this._queue  = null;
			}
			this._status = SGL_REQUEST_CANCELLED;
		}
	},

	abort : function() {
		this.cancel();
		if (this._status == SGL_REQUEST_ONGOING) {
			if (this._queue) {
				this._queue._removeOngoingRequest(this);
				this._queue  = null;
			}
			if (this._abort) {
				this._abort();
			}
			this._status = SGL_REQUEST_ABORTED;
		}
	}
};
/*********************************************************/


// SglTextFileRequest
/*********************************************************/
/**
 * Constructs a SglTextFileRequest.
 * @class Asynchronous text file request.
 */
function SglTextFileRequest(url, onReadyCallback) {
	SglRequest.apply(this, Array.prototype.slice.call(arguments, 1));
	this._url = url;
	this._req = null;
}

sglInherit(SglTextFileRequest, SglRequest);

sglDefineGetter(SglTextFileRequest, "url", function() {
	return this._url;
});

sglDefineGetter(SglTextFileRequest, "text", function() {
	return this._req.responseText;
});

SglTextFileRequest.prototype._send = function() {
	if (!this._url) return false;

	var req = new XMLHttpRequest();
	this._req = req;

	var cb = this._createOnReadyCallback();
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			var ok = (req.status) ? (req.status == 200) : (true);
			cb(ok);
		}
	};
	req.open("GET", this._url, true);
	req.send();

	return true;
};

SglTextFileRequest.prototype._abort = function() {
	if (!this._req) return;
	this._req.abort();
};
/*********************************************************/


// SglImageRequest
/*********************************************************/
/**
 * Constructs a SglImageRequest.
 * @class Asynchronous image request.
 */
function SglImageRequest(url, onReadyCallback) {
	SglRequest.apply(this, Array.prototype.slice.call(arguments, 1));
	this._url = url;
	this._img = null;
}

sglInherit(SglImageRequest, SglRequest);

sglDefineGetter(SglImageRequest, "url", function() {
	return this._url;
});

sglDefineGetter(SglImageRequest, "image", function() {
	return this._img;
});

SglImageRequest.prototype._send = function() {
	if (!this._url) return false;

	var img = new Image();
	this._img = img;

	var cb = this._createOnReadyCallback();
	img.onload = function() {
		cb(img.complete);
	};
	img.onerror = function() {
		cb(false);
	};
	img.src = this._url;

	return true;
};

SglImageRequest.prototype._abort = function() {
	;
};
/*********************************************************/


// SglRequestWatcher
/*********************************************************/
/**
 * Constructs a SglRequestWatcher.
 * @class Watches for requests completion.
 */
function SglRequestWatcher(reqs, onReadyCallback) {
	var n = reqs.length;

	this._onReady       = (onReadyCallback) ? (onReadyCallback) : (null);
	this._waitingReqs   = n;
	this._succeededReqs = 0;
	this._failedReqs    = 0;
	this._reqs          = reqs.slice();

	var t  = this;
	var cb = function(r) {
		if (r.succeeded) {
			t._succeededReqs++;
		}
		else if (r.failed) {
			t._failedReqs++;
		}
		t._waitingReqs--;
		if (t.isReady) {
			if (t._onReady) {
				t._onReady(t);
			}
		}
	};

	for (var i=0; i<n; ++i) {
		if (reqs[i].succeeded) {
			this._succeededReqs++;
			this._waitingReqs--;
		}
		else if (reqs[i].failed) {
			this._failedReqs++;
			this._waitingReqs--;
		}
		else {
			reqs[i].addOnReadyCallback(cb);
		}
	}

	if (this._waitingReqs <= 0) {
		if (this._onReady) {
			this._onReady(this);
		}
	}
}

SglRequestWatcher.prototype = {
	get requests() {
		return this._reqs;
	},

	get succeeded() {
		return (this._succeededReqs == this._reqs.length);
	},

	get failed() {
		if ((this._succeededReqs + this._failedReqs) < this._reqs.length) return false;
		return (this._succeededReqs < this._reqs.length);
	},

	get onReady() {
		return this._onReady;
	},

	set onReady(f) {
		this._onReady = f;
		if (this.isReady) {
			if (this._onReady) {
				this._onReady(t);
			}
		}
	},

	get isReady() {
		return ((this._succeededReqs + this._failedReqs) == this._reqs.length);
	},

	send : function() {
		var n = this._reqs.length;
		for (var i=0; i<n; ++i) {
			this._reqs[i].send();
		}
	},

	cancel : function() {
		var n = this._reqs.length;
		for (var i=0; i<n; ++i) {
			this._reqs[i].cancel();
		}
	},

	abort : function() {
		var n = this._reqs.length;
		for (var i=0; i<n; ++i) {
			this._reqs[i].abort();
		}
	}
};
/*********************************************************/


// SglRequestQueue
/*********************************************************/
/**
 * Constructs a SglRequestQueue.
 * @class Asynchronous requests scheduler.
 */
function SglRequestQueue(maxOngoing, maxQueued, onReadyCallback) {
	this._maxOngoing = (maxOngoing > 0) ? (maxOngoing) : (0);
	this._maxQueued  = (maxQueued  > 0) ? (maxQueued ) : (0);

	this._ongoing = [ ];
	this._queued  = [ ];
	this._onReady = null;
	this._minPriorityReq = null;
	this._priorityCompare = null;
	this._dirty = true;
}

SglRequestQueue.prototype = {
	_sort : function() {
		if (!this._dirty) return;

		this._dirty = false;
		this._minPriorityReq = null;
		if (this._queued.length <= 0) return;

		if (this._priorityCompare) {
			this._queued.sort(this._priorityCompare);
		}
		else {
			this._queued.sort();
		}
		if (this._queued.length > 0) {
			this._minPriorityReq = this._queued[0];
		}
	},

	_updateMinPriority : function() {
		this._minPriorityReq = null;
		var n = this._queued.length;
		if (n <= 0) return;

		this._minPriorityReq = this._queued[0];
		if (!this._dirty) return;

		for (var i=1; i<n; ++i) {
			if (this.comparePriorities(this._queued[i].priority, this._minPriorityReq.priority) <= 0) {
				this._minPriorityReq = this._queued[i];
			}
		}
	},

	_removeFromArray : function(arr, elem) {
		var index = -1;
		var n = arr.length;
		for (var i=0; i<n; ++i) {
			if (arr[i] == elem) {
				index = i;
				break;
			}
		}
		if (index < 0) return;
		arr.splice(index, 1);
	},

	_removeQueuedRequest : function(r) {
		this._removeFromArray(this._queued, r);
		if (this._queued.length <= 0) {
			this._minPriorityReq = null;
		}
		else if (r == this._minPriorityReq) {
			this._updateMinPriority();
		}
	},

	_removeOngoingRequest : function(r) {
		this._removeFromArray(this._ongoing, r);
		this._execute();
	},

	_updateRequest : function(r) {
		if (this.comparePriorities(r.priority, this._minPriorityReq.priority) <= 0) {
			this._minPriorityReq = r;
		}
		this._dirty = true;
	},

	_requestReady : function(r) {
		this._removeOngoingRequest(r);
		if (this._onReady) {
			this._onReady(r);
		}
		this._execute();
	},

	_execute : function() {
		var n = this._queued.length;
		if (n <= 0) return;
		var sendable = (this._maxOngoing > 0) ? (this._maxOngoing - this._ongoing.length) : (n)
		if (sendable <= 0) return;
		if (sendable > n) sendable = n;
		this._sort();
		var r = null;
		for (var i=0; i<sendable; ++i) {
			r = this._queued.pop();
			r.send();
		}
		if (this._queued.length > 0) {
			this._minPriorityReq = this._queued[0];
		}
	},

	comparePriorities : function(a, b) {
		if (this._priorityCompare) {
			return this._priorityCompare(a, b);
		}
		return (a - b);
	},

	get priorityCompare() {
		return this._priorityCompare;
	},

	set priorityCompare(f) {
		this._priorityCompare = f;
		this._updateMinPriority();
	},

	get onReady() {
		return this._onReady;
	},

	set onReady(f) {
		this._onReady = f;
	},

	push : function(r) {
		var ret = {
			victims : null,
			result  : false
		};

		if (r.queue) return ret;
		var n = this._queued.length;
		var overflow = ((this._maxQueued > 0) && (n >= this._maxQueued));

		if  (overflow) {
			if (this.comparePriorities(r.priority, this._minPriorityReq.priority) <= 0) {
				r._status = SGL_REQUEST_REJECTED;
				return ret;
			}
		}

		this._queued.push(r);
		r._queue  = this;
		r._status = SGL_REQUEST_QUEUED;
		n++;

		ret.result = true;

		var toKill = (this._maxQueued > 0) ? (n - this._maxQueued) : (0);
		if (toKill <= 0) {
			if (this._minPriorityReq != null) {
				if (this.comparePriorities(r.priority, this._minPriorityReq.priority) <= 0) {
					this._minPriorityReq = r;
				}
			}
			else {
				this._minPriorityReq = r;
			}
			this._dirty = true;
		}
		else {
			this._sort();
			ret.victims = this._queued.slice(0, toKill);
			this._queued.splice(0, toKill);
			for (var i=0; i<toKill; ++i) {
				ret.victims[i]._status = SGL_REQUEST_REJECTED;
				ret.victims[i]._queue  = null;
			}
		}

		this._execute();

		return ret;
	}
};
/*********************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// math utilities
/***********************************************************************/
const SGL_PI = Math.PI;

function sglAbs(x) {
	return Math.abs(x);
}

function sglFloor(x) {
	return Math.floor(x);
}

function sglCeil(x) {
	return Math.ceil(x);
}

function sglSqrt(x) {
	return Math.sqrt(x);
}

function sglPow(x, y) {
	return Math.pow(x, y);
}

function sglLog(x) {
	return Math.log(x);
}

function sglExp(x) {
	return Math.exp(x);
}

function sglSin(x) {
	return Math.sin(x);
}

function sglAsin(x) {
	return Math.asin(x);
}

function sglCos(x) {
	return Math.cos(x);
}

function sglAcos(x) {
	return Math.acos(x);
}

function sglTan(x) {
	return Math.tan(x);
}

function sglAtan(x) {
	return Math.atan(x);
}

function sglAtan2(y, x) {
	return Math.atan2(y, x);
}

function sglDegToRad(x) {
	return (x * (SGL_PI / 180.0));
}

function sglRadToDeg(x) {
	return (x * (180.0 / SGL_PI));
}

function sglMin(a, b) {
	return Math.min(a, b);
}

function sglMax(a, b) {
	return Math.max(a, b);
}

function sglClamp(x, min, max) {
	return ((x <= min) ? (min) : ((x >= max) ? (max) : (x)));
}

function sglRandom01() {
	return Math.random();
}

function sglMapVN(vArray, size, f, param, first, count, stride) {
	first  = (first  != undefined) ? first  : 0;
	stride = (stride != undefined) ? stride : size;
	count  = (count  != undefined) ? count  : ((vArray.length - first) / stride);

	var last = first + count * stride;
	var v    = new Array(n);

	var k = 0;
	var j = 0;
	for (var i=first; i<last; i+=stride) {
		for (j=0; j<n; ++j) {
			v[j] = vArray[i+j];
		}
		f(v, param, k++);
		for (j=0; j<n; ++j) {
			vArray[i+j] = v[j];
		}
	}
}

function sglMapV2(v2Array, f, param, first, count, stride) {
	sglMapVN(v2Array, 2, f, param, first, count, stride);
}

function sglMapV3(v3Array, f, param, first, count, stride) {
	sglMapVN(v3Array, 3, f, param, first, count, stride);
}

function sglMapV4(v4Array, f, param, first, count, stride) {
	sglMapVN(v4Array, 4, f, param, first, count, stride);
}
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// 2-dimensional vector
/***********************************************************************/
function sglUndefV2(v) {
	return new Array(2);
}

function sglV2V(v) {
	return v.slice(0, 2);
}

function sglV2S(s) {
	return [ s, s ];
}

function sglV2C(x, y) {
	return [ x, y ];
}

function sglZeroV2() {
	return sglV2S(0.0);
}

function sglOneV2() {
	return sglV2S(1.0);
}

function sglV2() {
	var n = arguments.length;
	var s;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				return sglV2V(arguments[0]);
			}
			return sglV2S(arguments[0]);
		break;

		case 2:
			return sglV2V(arguments);
		break;

		default:
			return sglZeroV2();
		break;
	}
	return null;
}

function sglDupV2(v) {
	return v.slice(0, 2);
}

function sglNegV2(v) {
	return sglV2C(-v[0], -v[1]);
}

function sglAddV2(u, v) {
	return sglV2C(u[0]+v[0], u[1]+v[1]);
}

function sglAddV2S(v, s) {
	return sglV2C(v[0]+s, v[1]+s);
}

function sglAddSV2(s, v) {
	return sglAddV2S(v, s)
}

function sglSubV2(u, v) {
	return sglV2C(u[0]-v[0], u[1]-v[1]);
}

function sglSubV2S(v, s) {
	return sglV2C(v[0]-s, v[1]-s);
}

function sglSubSV2(v, s) {
	return sglV2C(s-v[0], s-v[1]);
}

function sglMulV2(u, v) {
	return sglV2C(u[0]*v[0], u[1]*v[1]);
}

function sglMulV2S(v, s) {
	return sglV2C(v[0]*s, v[1]*s);
}

function sglMulSV2(s, v) {
	return sglMulV2S(v, s);
}

function sglDivV2(u, v) {
	return sglV2C(u[0]/v[0], u[1]/v[1]);
}

function sglDivV2S(v, s) {
	return sglV2C(v[0]/s, v[1]/s);
}

function sglDivSV2(s, v) {
	return sglV2C(s/v[0], s/v[1]);
}

function sglRcpV2(v) {
	return sglDivSV2(1.0, v);
}

function sglDotV2(u, v) {
	return (u[0]*v[0] + u[1]*v[1]);
}

function sglCrossV2(u, v) {
	return (u[0]*v[1] - u[1]*v[0]);
}

function sglSqLengthV2(v) {
	return sglDotV2(v, v);
}

function sglLengthV2(v) {
	return sglSqrt(sglSqLengthV2(v));
}

function sglNormalizedV2(v) {
	var f = 1.0 / sglLengthV2(v);
	return sglMulV2S(v, f);
}

function sglSelfNegV2(v) {
	v[0] = -v[0];
	v[1] = -v[1];
	return v;
}

function sglSelfAddV2(u, v) {
	u[0] += v[0];
	u[1] += v[1];
	return u;
}

function sglSelfAddV2S(v, s) {
	v[0] += s;
	v[1] += s;
	return v;
}

function sglSelfAddSV2(s, v) {
	v[0] += s;
	v[1] += s;
	return v;
}

function sglSelfSubV2(u, v) {
	u[0] -= v[0];
	u[1] -= v[1];
	return u;
}

function sglSelfSubV2S(v, s) {
	v[0] -= s;
	v[1] -= s;
	return v;
}

function sglSelfSubSV2(v, s) {
	v[0] = s - v[0];
	v[1] = s - v[1];
	return v;
}

function sglSelfMulV2(u, v) {
	u[0] *= v[0];
	u[1] *= v[1];
	return u;
}

function sglSelfMulV2S(v, s) {
	v[0] *= s;
	v[1] *= s;
	return v;
}

function sglSelfMulSV2(s, v) {
	v[0] *= s;
	v[1] *= s;
	return v;
}

function sglSelfDivV2(u, v) {
	u[0] /= v[0];
	u[1] /= v[1];
	return u;
}

function sglSelfDivV2S(v, s) {
	u[0] /= s;
	u[1] /= s;
	return u;
}

function sglSelfDivSV2(s, v) {
	v[0] = s / v[0];
	v[1] = s / v[1];
	return v;
}

function sglSelfRcpV2(v) {
	return sglSelfDivSV2(1.0, v);
}

function sglSelfNormalizeV2(v) {
	var f = 1.0 / sglLengthV2(v);
	return sglSelfMulV2S(v, f);
}

function sglMinV2(u, v) {
	return [
		((u[0] < v[0]) ? (u[0]) : (v[0])),
		((u[1] < v[1]) ? (u[1]) : (v[1]))
	];
}

function sglMaxV2(u, v) {
	return [
		((u[0] > v[0]) ? (u[0]) : (v[0])),
		((u[1] > v[1]) ? (u[1]) : (v[1]))
	];
}

function sglV2toV3(v, z) {
	return sglV3C(v[0], v[1], z);
}

function sglV2toV4(v, z, w) {
	return sglV4C(v[0], v[1], z, w);
}
/***********************************************************************/


// 3-dimensional vector
/***********************************************************************/
function sglUndefV3(v) {
	return new Array(3);
}

function sglV3V(v) {
	return v.slice(0, 3);
}

function sglV3S(s) {
	return [ s, s, s ];
}

function sglV3C(x, y, z) {
	return [ x, y, z ];
}

function sglZeroV3() {
	return sglV3S(0.0);
}

function sglOneV3() {
	return sglV3S(1.0);
}

function sglV3() {
	var n = arguments.length;
	var s;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				return sglV3V(arguments[0]);
			}
			return sglV3S(arguments[0]);
		break;

		case 3:
			return sglV3V(arguments);
		break;

		default:
			return sglZeroV3();
		break;
	}
	return null;
}

function sglDupV3(v) {
	return v.slice(0, 3);
}

function sglNegV3(v) {
	return sglV3C(-v[0], -v[1], -v[2]);
}

function sglAddV3(u, v) {
	return sglV3C(u[0]+v[0], u[1]+v[1], u[2]+v[2]);
}

function sglAddV3S(v, s) {
	return sglV3C(v[0]+s, v[1]+s, v[2]+s);
}

function sglAddSV3(s, v) {
	return sglAddV3S(v, s)
}

function sglSubV3(u, v) {
	return sglV3C(u[0]-v[0], u[1]-v[1], u[2]-v[2]);
}

function sglSubV3S(v, s) {
	return sglV3C(v[0]-s, v[1]-s, v[2]-s);
}

function sglSubSV3(v, s) {
	return sglV3C(s-v[0], s-v[1], s-v[2]);
}

function sglMulV3(u, v) {
	return sglV3C(u[0]*v[0], u[1]*v[1], u[2]*v[2]);
}

function sglMulV3S(v, s) {
	return sglV3C(v[0]*s, v[1]*s, v[2]*s);
}

function sglMulSV3(s, v) {
	return sglMulV3S(v, s);
}

function sglDivV3(u, v) {
	return sglV3C(u[0]/v[0], u[1]/v[1], u[2]/v[2]);
}

function sglDivV3S(v, s) {
	return sglV3C(v[0]/s, v[1]/s, v[2]/s);
}

function sglDivSV3(s, v) {
	return sglV3C(s/v[0], s/v[1], s/v[2]);
}

function sglRcpV3(v) {
	return sglDivSV3(1.0, v);
}

function sglDotV3(u, v) {
	return (u[0]*v[0] + u[1]*v[1] + u[2]*v[2]);
}

function sglCrossV3(u, v) {
	return sglV3C(u[1]*v[2] - u[2]*v[1], u[2]*v[0] - u[0]*v[2], u[0]*v[1] - u[1]*v[0]);
}

function sglSqLengthV3(v) {
	return sglDotV3(v, v);
}

function sglLengthV3(v) {
	return sglSqrt(sglSqLengthV3(v));
}

function sglNormalizedV3(v) {
	var f = 1.0 / sglLengthV3(v);
	return sglMulV3S(v, f);
}

function sglSelfNegV3(v) {
	v[0] = -v[0];
	v[1] = -v[1];
	v[2] = -v[2];
	return v;
}

function sglSelfAddV3(u, v) {
	u[0] += v[0];
	u[1] += v[1];
	u[2] += v[2];
	return u;
}

function sglSelfAddV3S(v, s) {
	v[0] += s;
	v[1] += s;
	v[2] += s;
	return v;
}

function sglSelfAddSV3(s, v) {
	v[0] += s;
	v[1] += s;
	v[2] += s;
	return v;
}

function sglSelfSubV3(u, v) {
	u[0] -= v[0];
	u[1] -= v[1];
	u[2] -= v[2];
	return u;
}

function sglSelfSubV3S(v, s) {
	v[0] -= s;
	v[1] -= s;
	v[2] -= s;
	return v;
}

function sglSelfSubSV3(v, s) {
	v[0] = s - v[0];
	v[1] = s - v[1];
	v[2] = s - v[2];
	return v;
}

function sglSelfMulV3(u, v) {
	u[0] *= v[0];
	u[1] *= v[1];
	u[2] *= v[2];
	return u;
}

function sglSelfMulV3S(v, s) {
	v[0] *= s;
	v[1] *= s;
	v[2] *= s;
	return v;
}

function sglSelfMulSV3(s, v) {
	v[0] *= s;
	v[1] *= s;
	v[2] *= s;
	return v;
}

function sglSelfDivV3(u, v) {
	u[0] /= v[0];
	u[1] /= v[1];
	u[2] /= v[2];
	return u;
}

function sglSelfDivV3S(v, s) {
	u[0] /= s;
	u[1] /= s;
	u[2] /= s;
	return u;
}

function sglSelfDivSV3(s, v) {
	v[0] = s / v[0];
	v[1] = s / v[1];
	v[2] = s / v[2];
	return v;
}

function sglSelfRcpV3(v) {
	return sglSelfDivSV3(1.0, v);
}

function sglSelfCrossV3(u, v) {
	var t = sglV3C(u[1]*v[2] - u[2]*v[1], u[2]*v[0] - u[0]*v[2], u[0]*v[1] - u[1]*v[0]);
	u[0] = t[0];
	u[1] = t[1];
	u[2] = t[2];
	return u;
}

function sglSelfNormalizeV3(v) {
	var f = 1.0 / sglLengthV3(v);
	return sglSelfMulV3S(v, f);
}

function sglMinV3(u, v) {
	return [
		((u[0] < v[0]) ? (u[0]) : (v[0])),
		((u[1] < v[1]) ? (u[1]) : (v[1])),
		((u[2] < v[2]) ? (u[2]) : (v[2]))
	];
}

function sglMaxV3(u, v) {
	return [
		((u[0] > v[0]) ? (u[0]) : (v[0])),
		((u[1] > v[1]) ? (u[1]) : (v[1])),
		((u[2] > v[2]) ? (u[2]) : (v[2]))
	];
}

function sglV3toV2(v) {
	return v.slice(0, 2);
}

function sglV3toV4(v, w) {
	return sglV4C(v[0], v[1], v[2], w);
}
/***********************************************************************/


// 4-dimensional vector
/***********************************************************************/
function sglUndefV4(v) {
	return new Array(4);
}

function sglV4V(v) {
	return v.slice(0, 4);
}

function sglV4S(s) {
	return [ s, s, s, s ];
}

function sglV4C(x, y, z, w) {
	return [ x, y, z, w ];
}

function sglZeroV4() {
	return sglV4S(0.0);
}

function sglOneV4() {
	return sglV4S(1.0);
}

function sglV4() {
	var n = arguments.length;
	var s;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				return sglV4V(arguments[0]);
			}
			return sglV4S(arguments[0]);
		break;

		case 4:
			return sglV4V(arguments);
		break;

		default:
			return sglZeroV4();
		break;
	}
	return null;
}

function sglDupV4(v) {
	return v.slice(0, 4);
}

function sglNegV4(v) {
	return sglV4C(-v[0], -v[1], -v[2], -v[3]);
}

function sglAddV4(u, v) {
	return sglV4C(u[0]+v[0], u[1]+v[1], u[2]+v[2], u[3]+v[3]);
}

function sglAddV4S(v, s) {
	return sglV4C(v[0]+s, v[1]+s, v[2]+s, v[3]+s);
}

function sglAddSV4(s, v) {
	return sglAddV4S(v, s)
}

function sglSubV4(u, v) {
	return sglV4C(u[0]-v[0], u[1]-v[1], u[2]-v[2], u[3]-v[3]);
}

function sglSubV4S(v, s) {
	return sglV4C(v[0]-s, v[1]-s, v[2]-s, v[3]-s);
}

function sglSubSV4(v, s) {
	return sglV4C(s-v[0], s-v[1], s-v[2], s-v[3]);
}

function sglMulV4(u, v) {
	return sglV4C(u[0]*v[0], u[1]*v[1], u[2]*v[2], u[3]*v[3]);
}

function sglMulV4S(v, s) {
	return sglV4C(v[0]*s, v[1]*s, v[2]*s, v[3]*s);
}

function sglMulSV4(s, v) {
	return sglMulV4S(v, s);
}

function sglDivV4(u, v) {
	return sglV4C(u[0]/v[0], u[1]/v[1], u[2]/v[2], u[3]/v[3]);
}

function sglDivV4S(v, s) {
	return sglV4C(v[0]/s, v[1]/s, v[2]/s, v[3]/s);
}

function sglDivSV4(s, v) {
	return sglV4C(s/v[0], s/v[1], s/v[2], s/v[3]);
}

function sglRcpV4(v) {
	return sglDivSV4(1.0, v);
}

function sglDotV4(u, v) {
	return (u[0]*v[0] + u[1]*v[1] + u[2]*v[2] + u[3]*v[3]);
}

function sglSqLengthV4(v) {
	return sglDotV4(v, v);
}

function sglLengthV4(v) {
	return sglSqrt(sglSqLengthV4(v));
}

function sglNormalizedV4(v) {
	var f = 1.0 / sglLengthV4(v);
	return sglMulV4S(v, f);
}

function sglProjectV4(v) {
	var f = 1.0 / v[3];
	return sglV4C(v[0]*f, v[1]*f, v[2]*f, 1.0);
}

function sglSelfNegV4(v) {
	v[0] = -v[0];
	v[1] = -v[1];
	v[2] = -v[2];
	v[3] = -v[3];
	return v;
}

function sglSelfAddV4(u, v) {
	u[0] += v[0];
	u[1] += v[1];
	u[2] += v[2];
	u[3] += v[3];
	return u;
}

function sglSelfAddV4S(v, s) {
	v[0] += s;
	v[1] += s;
	v[2] += s;
	v[3] += s;
	return v;
}

function sglSelfAddSV4(s, v) {
	v[0] += s;
	v[1] += s;
	v[2] += s;
	v[3] += s;
	return v;
}

function sglSelfSubV4(u, v) {
	u[0] -= v[0];
	u[1] -= v[1];
	u[2] -= v[2];
	u[3] -= v[3];
	return u;
}

function sglSelfSubV4S(v, s) {
	v[0] -= s;
	v[1] -= s;
	v[2] -= s;
	v[3] -= s;
	return v;
}

function sglSelfSubSV4(v, s) {
	v[0] = s - v[0];
	v[1] = s - v[1];
	v[2] = s - v[2];
	v[3] = s - v[3];
	return v;
}

function sglSelfMulV4(u, v) {
	u[0] *= v[0];
	u[1] *= v[1];
	u[2] *= v[2];
	u[3] *= v[3];
	return u;
}

function sglSelfMulV4S(v, s) {
	v[0] *= s;
	v[1] *= s;
	v[2] *= s;
	v[3] *= s;
	return v;
}

function sglSelfMulSV4(s, v) {
	v[0] *= s;
	v[1] *= s;
	v[2] *= s;
	v[3] *= s;
	return v;
}

function sglSelfDivV4(u, v) {
	u[0] /= v[0];
	u[1] /= v[1];
	u[2] /= v[2];
	u[3] /= v[3];
	return u;
}

function sglSelfDivV4S(v, s) {
	u[0] /= s;
	u[1] /= s;
	u[2] /= s;
	u[3] /= s;
	return u;
}

function sglSelfDivSV4(s, v) {
	v[0] = s / v[0];
	v[1] = s / v[1];
	v[2] = s / v[2];
	v[3] = s / v[3];
	return v;
}

function sglSelfRcpV4(v) {
	return sglSelfDivSV4(1.0, v);
}

function sglSelfNormalizeV4(v) {
	var f = 1.0 / sglLengthV4(v);
	return sglSelfMulV4S(v, f);
}

function sglSelfProjectV4(v) {
	var f = 1.0 / v[3];
	v[0] *= f;
	v[1] *= f;
	v[2] *= f;
	v[3]  = 1.0;
	return v;
}

function sglMinV4(u, v) {
	return [
		((u[0] < v[0]) ? (u[0]) : (v[0])),
		((u[1] < v[1]) ? (u[1]) : (v[1])),
		((u[2] < v[2]) ? (u[2]) : (v[2])),
		((u[3] < v[3]) ? (u[3]) : (v[3]))
	];
}

function sglMaxV4(u, v) {
	return [
		((u[0] > v[0]) ? (u[0]) : (v[0])),
		((u[1] > v[1]) ? (u[1]) : (v[1])),
		((u[2] > v[2]) ? (u[2]) : (v[2])),
		((u[3] > v[3]) ? (u[3]) : (v[3]))
	];
}

function sglV4toV2(v) {
	return v.slice(0, 2);
}

function sglV4toV3(v) {
	return v.slice(0, 3);
}
/***********************************************************************/


// 4x4 matrix
/***********************************************************************/
function sglUndefM4() {
	return new Array(16);
}

function sglM4V(v) {
	return v.slice(0, 16);
}

function sglM4S(s) {
	var m = sglUndefM4();
	for (var i=0; i<16; ++i) {
		m[i] = s;
	}
	return m;
}

function sglDiagM4V(d) {
	var m = sglM4S(0.0);
	m[ 0] = d[0];
	m[ 5] = d[1];
	m[10] = d[2];
	m[15] = d[3];
	return m;
}

function sglDiagM4S(s) {
	var m = sglM4S(0.0);
	m[ 0] = s;
	m[ 5] = s;
	m[10] = s;
	m[15] = s;
	return m;
}

function sglDiagM4C(m00, m11, m22, m33) {
	return sglDiagM4V(arguments);
}

function sglZeroM4() {
	return sglM4S(0.0);
}

function sglOneM4() {
	return sglM4S(1.0);
}

function sglIdentityM4() {
	return sglDiagM4S(1.0);
}

function sglM4() {
	var n = arguments.length;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				switch (arguments[0].length) {
					case 1:
						return sglDiagM4S(arguments[0]);
					break;
					case 4:
						return sglDiagM4V(arguments[0]);
					break;
					case 16:
						return sglM4V(arguments[0]);
					break;
					default:
						return sglIdentityM4();
					break;
				}
			}
			return sglM4S(arguments[0]);
		break;

		case 4:
			return sglDiagM4V(arguments);
		break;

		case 16:
			return sglM4V(arguments);
		break;

		default:
			return sglIdentityM4();
		break;
	}
	return null;
}

function sglDupM4(m) {
	var r = sglUndefM4();

	r[ 0] = m[ 0];
	r[ 1] = m[ 1];
	r[ 2] = m[ 2];
	r[ 3] = m[ 3];

	r[ 4] = m[ 4];
	r[ 5] = m[ 5];
	r[ 6] = m[ 6];
	r[ 7] = m[ 7];

	r[ 8] = m[ 8];
	r[ 9] = m[ 9];
	r[10] = m[10];
	r[11] = m[11];

	r[12] = m[12];
	r[13] = m[13];
	r[14] = m[14];
	r[15] = m[15];

	return r;

	//return m.slice(0, 16);
	//return m.slice();
}

function sglGetElemM4(m, row, col) {
	return m[row+col*4];
}

function sglSetElemM4(m, row, col, value) {
	m[row+col*4] = value;
}

function sglGetRowM4(m, r) {
	return sglV4C(m[r+0], m[r+4], m[r+8], m[r+12]);
}

function sglSetRowM4V(m, r, v) {
	m[r+ 0] = v[0];
	m[r+ 4] = v[1];
	m[r+ 8] = v[2];
	m[r+12] = v[3];
}

function sglSetRowM4S(m, r, s) {
	m[r+ 0] = s;
	m[r+ 4] = s;
	m[r+ 8] = s;
	m[r+12] = s;
}

function sglSetRowM4C(m, r, x, y, z, w) {
	m[r+ 0] = x;
	m[r+ 4] = y;
	m[r+ 8] = z;
	m[r+12] = w;
}

function sglGetColM4(m, c) {
	var i = c * 4;
	return sglV4C(m[i+0], m[i+1], m[i+2], m[i+3]);
}

function sglSetColM4V(m, c, v) {
	var i = c * 4;
	m[i+0] = v[0];
	m[i+1] = v[1];
	m[i+2] = v[2];
	m[i+3] = v[3];
}

function sglSetColM4S(m, c, s) {
	var i = c * 4;
	m[i+0] = s;
	m[i+1] = s;
	m[i+2] = s;
	m[i+3] = s;
}

function sglSetColM4C(m, c, x, y, z, w) {
	var i = c * 4;
	m[i+0] = x;
	m[i+1] = y;
	m[i+2] = z;
	m[i+3] = w;
}

function sglM4toM3(m) {
	return [
		m[ 0], m[ 1], m[ 2],
		m[ 4], m[ 5], m[ 6],
		m[ 8], m[ 9], m[10]
	];
}

function sglIsIdentityM4(m) {
	var i = 0;
	var j = 0;
	var s = 0.0;
	for (i=0; i<4; ++i) {
		for (j=0; j<4; ++j) {
			s = m[i+j*4];
			if ((i == j)) {
				if (s != 1.0) {
					return false;
				}
			}
			else {
				if (s != 0.0) {
					return false;
				}
			}
		}
	}
	return true;
}

function sglNegM4(m) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = -m[i];
	}
	return r;
}

function sglAddM4(a, b) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = a[i] + b[i];
	}
	return r;
}

function sglAddM4S(m, s)
{
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = m[i] + s;
	}
	return r;
}

function sglAddSM4(s, m) {
	return sglAddM4S(m, s);
}

function sglSubM4(a, b) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = a[i] - b[i];
	}
	return r;
}

function sglSubM4S(m, s) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = m[i] - s;
	}
	return r;
}

function sglSubSM4(s, m) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = s - m[i];
	}
	return r;
}

function sglMulM4(a, b) {
	var a0  = a[ 0], a1  = a[ 1],  a2 = a[ 2], a3  = a[ 3],
	    a4  = a[ 4], a5  = a[ 5],  a6 = a[ 6], a7  = a[ 7],
	    a8  = a[ 8], a9  = a[ 9], a10 = a[10], a11 = a[11],
	    a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15],

	    b0  = b[ 0], b1  = b[ 1], b2  = b[ 2], b3  = b[ 3],
	    b4  = b[ 4], b5  = b[ 5], b6  = b[ 6], b7  = b[ 7],
	    b8  = b[ 8], b9  = b[ 9], b10 = b[10], b11 = b[11],
	    b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

	var r = sglUndefM4();

	r[ 0] = a0*b0 + a4*b1 + a8*b2  + a12*b3;
	r[ 1] = a1*b0 + a5*b1 + a9*b2  + a13*b3;
	r[ 2] = a2*b0 + a6*b1 + a10*b2 + a14*b3;
	r[ 3] = a3*b0 + a7*b1 + a11*b2 + a15*b3;

	r[ 4] = a0*b4 + a4*b5 + a8*b6  + a12*b7;
	r[ 5] = a1*b4 + a5*b5 + a9*b6  + a13*b7;
	r[ 6] = a2*b4 + a6*b5 + a10*b6 + a14*b7;
	r[ 7] = a3*b4 + a7*b5 + a11*b6 + a15*b7;

	r[ 8] = a0*b8 + a4*b9 + a8*b10  + a12*b11;
	r[ 9] = a1*b8 + a5*b9 + a9*b10  + a13*b11;
	r[10] = a2*b8 + a6*b9 + a10*b10 + a14*b11;
	r[11] = a3*b8 + a7*b9 + a11*b10 + a15*b11;

	r[12] = a0*b12 + a4*b13 + a8*b14  + a12*b15;
	r[13] = a1*b12 + a5*b13 + a9*b14  + a13*b15;
	r[14] = a2*b12 + a6*b13 + a10*b14 + a14*b15;
	r[15] = a3*b12 + a7*b13 + a11*b14 + a15*b15;

	/*
	r[ 0] = a[ 0]*b[ 0] + a[ 4]*b[ 1] + a[ 8]*b[ 2] + a[12]*b[ 3];
	r[ 1] = a[ 1]*b[ 0] + a[ 5]*b[ 1] + a[ 9]*b[ 2] + a[13]*b[ 3];
	r[ 2] = a[ 2]*b[ 0] + a[ 6]*b[ 1] + a[10]*b[ 2] + a[14]*b[ 3];
	r[ 3] = a[ 3]*b[ 0] + a[ 7]*b[ 1] + a[11]*b[ 2] + a[15]*b[ 3];

	r[ 4] = a[ 0]*b[ 4] + a[ 4]*b[ 5] + a[ 8]*b[ 6] + a[12]*b[ 7];
	r[ 5] = a[ 1]*b[ 4] + a[ 5]*b[ 5] + a[ 9]*b[ 6] + a[13]*b[ 7];
	r[ 6] = a[ 2]*b[ 4] + a[ 6]*b[ 5] + a[10]*b[ 6] + a[14]*b[ 7];
	r[ 7] = a[ 3]*b[ 4] + a[ 7]*b[ 5] + a[11]*b[ 6] + a[15]*b[ 7];

	r[ 8] = a[ 0]*b[ 8] + a[ 4]*b[ 9] + a[ 8]*b[10] + a[12]*b[11];
	r[ 9] = a[ 1]*b[ 8] + a[ 5]*b[ 9] + a[ 9]*b[10] + a[13]*b[11];
	r[10] = a[ 2]*b[ 8] + a[ 6]*b[ 9] + a[10]*b[10] + a[14]*b[11];
	r[11] = a[ 3]*b[ 8] + a[ 7]*b[ 9] + a[11]*b[10] + a[15]*b[11];

	r[12] = a[ 0]*b[12] + a[ 4]*b[13] + a[ 8]*b[14] + a[12]*b[15];
	r[13] = a[ 1]*b[12] + a[ 5]*b[13] + a[ 9]*b[14] + a[13]*b[15];
	r[14] = a[ 2]*b[12] + a[ 6]*b[13] + a[10]*b[14] + a[14]*b[15];
	r[15] = a[ 3]*b[12] + a[ 7]*b[13] + a[11]*b[14] + a[15]*b[15];
	*/

	return r;

	/*
	var r = sglUndefM4();

	r[ 0] = a[ 0]*b[ 0] + a[ 4]*b[ 1] + a[ 8]*b[ 2] + a[12]*b[ 3];
	r[ 1] = a[ 1]*b[ 0] + a[ 5]*b[ 1] + a[ 9]*b[ 2] + a[13]*b[ 3];
	r[ 2] = a[ 2]*b[ 0] + a[ 6]*b[ 1] + a[10]*b[ 2] + a[14]*b[ 3];
	r[ 3] = a[ 3]*b[ 0] + a[ 7]*b[ 1] + a[11]*b[ 2] + a[15]*b[ 3];

	r[ 4] = a[ 0]*b[ 4] + a[ 4]*b[ 5] + a[ 8]*b[ 6] + a[12]*b[ 7];
	r[ 5] = a[ 1]*b[ 4] + a[ 5]*b[ 5] + a[ 9]*b[ 6] + a[13]*b[ 7];
	r[ 6] = a[ 2]*b[ 4] + a[ 6]*b[ 5] + a[10]*b[ 6] + a[14]*b[ 7];
	r[ 7] = a[ 3]*b[ 4] + a[ 7]*b[ 5] + a[11]*b[ 6] + a[15]*b[ 7];

	r[ 8] = a[ 0]*b[ 8] + a[ 4]*b[ 9] + a[ 8]*b[10] + a[12]*b[11];
	r[ 9] = a[ 1]*b[ 8] + a[ 5]*b[ 9] + a[ 9]*b[10] + a[13]*b[11];
	r[10] = a[ 2]*b[ 8] + a[ 6]*b[ 9] + a[10]*b[10] + a[14]*b[11];
	r[11] = a[ 3]*b[ 8] + a[ 7]*b[ 9] + a[11]*b[10] + a[15]*b[11];

	r[12] = a[ 0]*b[12] + a[ 4]*b[13] + a[ 8]*b[14] + a[12]*b[15];
	r[13] = a[ 1]*b[12] + a[ 5]*b[13] + a[ 9]*b[14] + a[13]*b[15];
	r[14] = a[ 2]*b[12] + a[ 6]*b[13] + a[10]*b[14] + a[14]*b[15];
	r[15] = a[ 3]*b[12] + a[ 7]*b[13] + a[11]*b[14] + a[15]*b[15];

	return r;
	*/
}

function sglMulM4S(m, s) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = m[i] * s;
	}
	return r;
}

function sglMulSM4(s, m) {
	return sglMulM4S(m, s);
}

function sglMulM4V3(m, v, w) {
	return [
		m[ 0] * v[0] + m[ 4] * v[1] + m[ 8] * v[2] + m[12] * w,
		m[ 1] * v[0] + m[ 5] * v[1] + m[ 9] * v[2] + m[13] * w,
		m[ 2] * v[0] + m[ 6] * v[1] + m[10] * v[2] + m[14] * w /* ,
		m[ 3] * v[0] + m[ 7] * v[1] + m[11] * v[2] + m[15] * w*/
	];
}

function sglMulM4V4(m, v) {
	return [
		m[ 0] * v[0] + m[ 4] * v[1] + m[ 8] * v[2] + m[12] * v[3],
		m[ 1] * v[0] + m[ 5] * v[1] + m[ 9] * v[2] + m[13] * v[3],
		m[ 2] * v[0] + m[ 6] * v[1] + m[10] * v[2] + m[14] * v[3],
		m[ 3] * v[0] + m[ 7] * v[1] + m[11] * v[2] + m[15] * v[3]
	];
}

function sglDivM4S(m, s) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = m[i] / s;
	}
	return r;
}

function sglDivSM4(s, m) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = s / m[i];
	}
	return r;
}

function sglRcpM4(m) {
	return sglDivSM4(1.0, m);
}

function sglCompMulM4(a, b) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = a[i] * b[i];
	}
	return r;
}

function sglCompDivM4(a, b) {
	var r = sglUndefM4();
	for (var i=0; i<16; ++i) {
		r[i] = a[i] / b[i];
	}
	return r;
}

function sglTransposeM4(m) {
	var r = sglUndefM4();

	r[ 0] = m[ 0];
	r[ 1] = m[ 4];
	r[ 2] = m[ 8];
	r[ 3] = m[12];

	r[ 4] = m[ 1];
	r[ 5] = m[ 5];
	r[ 6] = m[ 9];
	r[ 7] = m[13];

	r[ 8] = m[ 2];
	r[ 9] = m[ 6];
	r[10] = m[10];
	r[11] = m[14];

	r[12] = m[ 3];
	r[13] = m[ 7];
	r[14] = m[11];
	r[15] = m[15];

	return r;
}

function sglDeterminantM4(m) {
	var m0  = m[ 0], m1  = m[ 1], m2  = m[ 2], m3  = m[ 3],
	    m4  = m[ 4], m5  = m[ 5], m6  = m[ 6], m7  = m[ 7],
	    m8  = m[ 8], m9  = m[ 9], m10 = m[10], m11 = m[11],
	    m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15]

	return (
		m12 * m9 * m6 * m3 - m8 * m13 * m6 * m3 - m12 * m5 * m10 * m3 + m4 * m13 * m10 * m3 +
		m8 * m5 * m14 * m3 - m4 * m9 * m14 * m3 - m12 * m9 * m2 * m7 + m8 * m13 * m2 * m7 +
		m12 * m1 * m10 * m7 - m0 * m13 * m10 * m7 - m8 * m1 * m14 * m7 + m0 * m9 * m14 * m7 +
		m12 * m5 * m2 * m11 - m4 * m13 * m2 * m11 - m12 * m1 * m6 * m11 + m0 * m13 * m6 * m11 +
		m4 * m1 * m14 * m11 - m0 * m5 * m14 * m11 - m8 * m5 * m2 * m15 + m4 * m9 * m2 * m15 +
		m8 * m1 * m6 * m15 - m0 * m9 * m6 * m15 - m4 * m1 * m10 * m15 + m0 * m5 * m10 * m15
	);
}

function sglInverseM4(m) {
	var m0  = m[ 0], m1  = m[ 1], m2  = m[ 2], m3  = m[ 3],
	    m4  = m[ 4], m5  = m[ 5], m6  = m[ 6], m7  = m[ 7],
	    m8  = m[ 8], m9  = m[ 9], m10 = m[10], m11 = m[11],
	    m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15]

	var t = sglUndefM4();

	t[ 0] = (m9*m14*m7-m13*m10*m7+m13*m6*m11-m5*m14*m11-m9*m6*m15+m5*m10*m15);
	t[ 1] = (m13*m10*m3-m9*m14*m3-m13*m2*m11+m1*m14*m11+m9*m2*m15-m1*m10*m15);
	t[ 2] = (m5*m14*m3-m13*m6*m3+m13*m2*m7-m1*m14*m7-m5*m2*m15+m1*m6*m15);
	t[ 3] = (m9*m6*m3-m5*m10*m3-m9*m2*m7+m1*m10*m7+m5*m2*m11-m1*m6*m11);

	t[ 4] = (m12*m10*m7-m8*m14*m7-m12*m6*m11+m4*m14*m11+m8*m6*m15-m4*m10*m15);
	t[ 5] = (m8*m14*m3-m12*m10*m3+m12*m2*m11-m0*m14*m11-m8*m2*m15+m0*m10*m15);
	t[ 6] = (m12*m6*m3-m4*m14*m3-m12*m2*m7+m0*m14*m7+m4*m2*m15-m0*m6*m15);
	t[ 7] = (m4*m10*m3-m8*m6*m3+m8*m2*m7-m0*m10*m7-m4*m2*m11+m0*m6*m11);

	t[ 8] = (m8*m13*m7-m12*m9*m7+m12*m5*m11-m4*m13*m11-m8*m5*m15+m4*m9*m15);
	t[ 9] = (m12*m9*m3-m8*m13*m3-m12*m1*m11+m0*m13*m11+m8*m1*m15-m0*m9*m15);
	t[10] = (m4*m13*m3-m12*m5*m3+m12*m1*m7-m0*m13*m7-m4*m1*m15+m0*m5*m15);
	t[11] = (m8*m5*m3-m4*m9*m3-m8*m1*m7+m0*m9*m7+m4*m1*m11-m0*m5*m11);

	t[12] = (m12*m9*m6-m8*m13*m6-m12*m5*m10+m4*m13*m10+m8*m5*m14-m4*m9*m14);
	t[13] = (m8*m13*m2-m12*m9*m2+m12*m1*m10-m0*m13*m10-m8*m1*m14+m0*m9*m14);
	t[14] = (m12*m5*m2-m4*m13*m2-m12*m1*m6+m0*m13*m6+m4*m1*m14-m0*m5*m14);
	t[15] = (m4*m9*m2-m8*m5*m2+m8*m1*m6-m0*m9*m6-m4*m1*m10+m0*m5*m10);

	var s = 1.0 / (
		m12 * m9 * m6 * m3 - m8 * m13 * m6 * m3 - m12 * m5 * m10 * m3 + m4 * m13 * m10 * m3 +
		m8 * m5 * m14 * m3 - m4 * m9 * m14 * m3 - m12 * m9 * m2 * m7 + m8 * m13 * m2 * m7 +
		m12 * m1 * m10 * m7 - m0 * m13 * m10 * m7 - m8 * m1 * m14 * m7 + m0 * m9 * m14 * m7 +
		m12 * m5 * m2 * m11 - m4 * m13 * m2 * m11 - m12 * m1 * m6 * m11 + m0 * m13 * m6 * m11 +
		m4 * m1 * m14 * m11 - m0 * m5 * m14 * m11 - m8 * m5 * m2 * m15 + m4 * m9 * m2 * m15 +
		m8 * m1 * m6 * m15 - m0 * m9 * m6 * m15 - m4 * m1 * m10 * m15 + m0 * m5 * m10 * m15
	);

	for (var i=0; i<16; ++i) t[i] *= s;

	return t;
}

function sglTraceM4(m) {
	return (m[0] + m[5] + m[10] + m[15]);
}

function sglTranslationM4V(v) {
	var m = sglIdentityM4();
	m[12] = v[0];
	m[13] = v[1];
	m[14] = v[2];
	return m;
}

function sglTranslationM4C(x, y, z) {
	return sglTranslationM4V([x, y, z]);
}

function sglTranslationM4S(s) {
	return sglTranslationM4C(s, s, s);
}

function sglRotationAngleAxisM4V(angleRad, axis) {
	var ax = sglNormalizedV3(axis);
	var s  = sglSin(angleRad);
	var c  = sglCos(angleRad);
	var q   = 1.0 - c;

	var x = ax[0];
	var y = ax[1];
	var z = ax[2];

	var xx, yy, zz, xy, yz, zx, xs, ys, zs;

	xx = x * x;
	yy = y * y;
	zz = z * z;
	xy = x * y;
	yz = y * z;
	zx = z * x;
	xs = x * s;
	ys = y * s;
	zs = z * s;

	var m = sglUndefM4();

	m[ 0] = (q * xx) + c;
	m[ 1] = (q * xy) + zs;
	m[ 2] = (q * zx) - ys;
	m[ 3] = 0.0;

	m[ 4] = (q * xy) - zs;
	m[ 5] = (q * yy) + c;
	m[ 6] = (q * yz) + xs;
	m[ 7] = 0.0;

	m[ 8] = (q * zx) + ys;
	m[ 9] = (q * yz) - xs;
	m[10] = (q * zz) + c;
	m[11] = 0.0;

	m[12] = 0.0;
	m[13] = 0.0;
	m[14] = 0.0;
	m[15] = 1.0;

	return m;
}

function sglRotationAngleAxisM4C(angleRad, ax, ay, az) {
	return sglRotationAngleAxisM4V(angleRad, [ax, ay, az]);
}

function sglScalingM4V(v) {
	var m = sglIdentityM4();
	m[ 0] = v[0];
	m[ 5] = v[1];
	m[10] = v[2];
	return m;
}

function sglScalingM4C(x, y, z) {
	return sglScalingM4V([x, y, z]);
}

function sglScalingM4S(s) {
	return sglScalingM4C(s, s, s);
}

function sglLookAtM4V(position, target, up) {
	var v = sglNormalizedV3(sglSubV3(target, position));
	var u = sglNormalizedV3(up);
	var s = sglNormalizedV3(sglCrossV3(v, u));

	u = sglNormalizedV3(sglCrossV3(s, v));

	var m = sglUndefM4();

	m[ 0] =  s[0];
	m[ 1] =  u[0];
	m[ 2] = -v[0];
	m[ 3] =   0.0;

	m[ 4] =  s[1];
	m[ 5] =  u[1];
	m[ 6] = -v[1];
	m[ 7] =   0.0;

	m[ 8] =  s[2];
	m[ 9] =  u[2];
	m[10] = -v[2];
	m[11] =   0.0;

	m[12] =   0.0;
	m[13] =   0.0;
	m[14] =   0.0;
	m[15] =   1.0;

	m = sglMulM4(m, sglTranslationM4V(sglNegV3(position)));

	return m;
}

function sglLookAtM4C(positionX, positionY, positionZ, targetX, targetY, targetZ, upX, upY, upZ) {
	return sglLookAtM4V([positionX, positionY, positionZ], [targetX, targetY, targetZ], [upX, upY, upZ]);
}

function sglOrthoM4V(omin, omax) {
	var sum   = sglAddV3(omax, omin);
	var dif   = sglSubV3(omax, omin);

	var m = sglUndefM4();

	m[ 0] =      2.0 / dif[0];
	m[ 1] =               0.0;
	m[ 2] =               0.0;
	m[ 3] =               0.0;

	m[ 4] =               0.0;
	m[ 5] =      2.0 / dif[1];
	m[ 6] =               0.0;
	m[ 7] =               0.0;

	m[ 8] =               0.0;
	m[ 9] =               0.0;
	m[10] =     -2.0 / dif[2];
	m[11] =                 0.0;

	m[12] =  -sum[0] / dif[0];
	m[13] =  -sum[1] / dif[1];
	m[14] =  -sum[2] / dif[2];
	m[15] =               1.0;

	return m;
}

function sglOrthoM4C(left, right, bottom, top, zNear, zFar) {
	return sglOrthoM4V([left, bottom, zNear], [right, top, zFar]);
}

function sglFrustumM4V(fmin, fmax) {
	var sum   = sglAddV3(fmax, fmin);
	var dif   = sglSubV3(fmax, fmin);
	var t     = 2.0 * fmin[2];

	var m = sglUndefM4();

	m[ 0] =            t / dif[0];
	m[ 1] =                   0.0;
	m[ 2] =                   0.0;
	m[ 3] =                   0.0;

	m[ 4] =                   0.0;
	m[ 5] =            t / dif[1];
	m[ 6] =                   0.0;
	m[ 7] =                   0.0;

	m[ 8] =       sum[0] / dif[0];
	m[ 9] =       sum[1] / dif[1];
	m[10] =      -sum[2] / dif[2];
	m[11] =                  -1.0;

	m[12] =                   0.0;
	m[13] =                   0.0;
	m[14] = -t * fmax[2] / dif[2];
	m[15] =                   0.0;

	return m;
}

function sglFrustumM4C(left, right, bottom, top, zNear, zFar) {
	return sglFrustumM4V([left, bottom, zNear], [right, top, zFar]);
}

function sglPerspectiveM4(fovYRad, aspectRatio, zNear, zFar) {
	var pmin = sglUndefV4();
	var pmax = sglUndefV4();

	pmin[2] = zNear;
	pmax[2] = zFar;

	pmax[1] = pmin[2] * sglTan(fovYRad / 2.0);
	pmin[1] = -pmax[1];

	pmax[0] = pmax[1] * aspectRatio;
	pmin[0] = -pmax[0];

	return sglFrustumM4V(pmin, pmax);
}
/***********************************************************************/


// quaternion
/***********************************************************************/
function sglUndefQuat(v) {
	return new Array(4);
}

function sglQuatV(v) {
	return v.slice(0, 4);
}

function sglIdentityQuat() {
	return [ 0.0, 0.0, 0.0, 1.0 ];
}

function sglAngleAxisQuat(angleRad, axis) {
	var halfAngle = angleRad / 2.0;
	var fsin = sglSin(halfAngle);
	return [
		fsin * axis[0],
		fsin * axis[1],
		fsin * axis[2],
		sglCos(halfAngle)
	];
}

function sglM4Quat(m) {
	var trace = sglGetElemM4(m, 0, 0) + sglGetElemM4(m, 1, 1) + sglGetElemM4(m, 2, 2);
	var root = null;
	var q = sglUndefQuat();

	if (trace > 0.0) {
		root = sglSqrt(trace + 1.0);
		q[3] = root / 2.0;
		root = 0.5 / root;
		q[0] = (sglGetElemM4(m, 2, 1) - sglGetElemM4(m, 1, 2)) * root;
		q[1] = (sglGetElemM4(m, 0, 2) - sglGetElemM4(m, 2, 0)) * root;
		q[2] = (sglGetElemM4(m, 1, 0) - sglGetElemM4(m, 0, 1)) * root;
	}
	else {
		var i = 0;

		if (sglGetElemM4(m, 1, 1) > sglGetElemM4(m, 0, 0)) i = 1;
		if (sglGetElemM4(m, 2, 2) > sglGetElemM4(m, i, i)) i = 2;

		var j = (i + 1) % 3;
		var k = (j + 1) % 3;

		root = sglSqrt(sglGetElemM4(m, i, i) - sglGetElemM4(m, j, j) - sglGetElemM4(m, k, k) + 1.0);

		q[i] = root / 2.0;
		root = 0.5 / root;
		q[3] = (sglGetElemM4(m, k, j) - sglGetElemM4(m, j, k)) * root;
		q[j] = (sglGetElemM4(m, j, i) + sglGetElemM4(m, i, j)) * root;
		q[k] = (sglGetElemM4(m, k, i) + sglGetElemM4(m, i, k)) * root;
	}
	return q;
}

function sglGetQuatAngleAxis(q) {
	var v = new Array(4);

	var sqLen = sglSqLengthV4(q);
	var angle = null;

	if (sqLen > 0.0) {
		var invLen = 1.0 / sglSqrt(sqLen);
		v[0] = q[0] * invLen;
		v[1] = q[1] * invLen;
		v[2] = q[2] * invLen;
		v[3] = 2.0 * aglAcos(q[3]);
	}
	else
	{
		v[0] = 0.0;
		v[1] = 0.0;
		v[2] = 1.0;
		v[3] = 0.0;
	}

	return v;
}

function sglGetQuatRotationM4(q) {
	var tx  = 2.0 * q[0];
	var ty  = 2.0 * q[1];
	var tz  = 2.0 * q[2];
	var twx = tx * q[3];
	var twy = ty * q[3];
	var twz = tz * q[3];
	var txx = tx * q[0];
	var txy = ty * q[0];
	var txz = tz * q[0];
	var tyy = ty * q[1];
	var tyz = tz * q[1];
	var tzz = tz * q[2];

	var m = sglIdentityM4();

	sglSetElemM4(m, 0, 0, 1.0 - (tyy + tzz));
	sglSetElemM4(m, 0, 1, txy - twz);
	sglSetElemM4(m, 0, 2, txz + twy);
	sglSetElemM4(m, 1, 0, txy + twz);
	sglSetElemM4(m, 1, 1, 1.0 - (txx + tzz));
	sglSetElemM4(m, 1, 2, tyz - twx);
	sglSetElemM4(m, 2, 0, txz - twy);
	sglSetElemM4(m, 2, 1, tyz + twx);
	sglSetElemM4(m, 2, 2, 1.0 - (txx + tyy));

	return m;
}

function sglNormalizedQuat(q) {
	return sglNormalizedV4(q);
}

function sglMulQuat(q1, q2) {
	var r = sglUndefQuat();

	r[0] = p[3] * q[0] + p[0] * q[3] + p[1] * q[2] - p[2] * q[1];
	r[1] = p[3] * q[1] + p[1] * q[3] + p[2] * q[0] - p[0] * q[2];
	r[2] = p[3] * q[2] + p[2] * q[3] + p[0] * q[1] - p[1] * q[0];
	r[3] = p[3] * q[3] - p[0] * q[0] - p[1] * q[1] - p[2] * q[2];
}
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglVec2
/***********************************************************************/
/**
 * Constructs a SglVec2.
 * @class 2-dimensional vector.
 */
function SglVec2() {
	this.v = new Array(2);
	var n = arguments.length;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				this.setVec(arguments[0]);
			}
			else if (arguments[0] instanceof SglVec2) {
				this.setVec(arguments[0].v);
			}
			else {
				this.setScalar(arguments[0]);
			}
		break;
		case 2:
			this.setVec(arguments);
		break;
		default:
			this.setZero();
		break;
	}
}

SglVec2.prototype = {
	clone : function() {
		return new SglVec2(this);
	},

	get copy() {
		return this.clone();
	},

	get x( ) { return this.v[0]; },
	set x(n) { this.v[0] = n;    },
	get y( ) { return this.v[1]; },
	set y(n) { this.v[1] = n;    },

	set : function(x, y) {
		this.v[0] = x;
		this.v[1] = y;
		return this;
	},

	setVec : function(v) {
		return this.set(v[0], v[1]);
	},

	setScalar : function(s) {
		return this.set(s, s);
	},

	setZero : function() {
		return this.setScalar(0.0);
	},

	setOne : function() {
		return this.setScalar(1.0);
	},

	at : function(i) {
		return this.v[i];
	},

	get squaredLength() {
		return this.dot(this);
	},

	get length() {
		return sglSqrt(this.squaredLength);
	},

	normalize : function() {
		var f = this.length;
		if (f > 0.0) f = 1.0 / f;
		this.v[0] *= f;
		this.v[1] *= f;
		return this;
	},

	get normalized() {
		return this.clone().normalize();
	},

	get neg() {
		return new SglVec2(-(this.v[0]), -(this.v[1]));
	},

	get abs() {
		return new SglVec2(sglAbs(this.v[0]), sglAbs(this.v[1]));
	},

	get minComp() {
		var m = this.v[0];
		if (m > this.v[1]) m = this.v[1];
		return m;
	},

	get maxComp() {
		var m = this.v[0];
		if (m < this.v[1]) m = this.v[1];
		return m;
	},

	get argMin() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		return a;
	},

	get argMax() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		return a;
	},

	add : function(v) {
		return new SglVec2(this.v[0] + v.v[0], this.v[1] + v.v[1]);
	},

	sub : function(v) {
		return new SglVec2(this.v[0] - v.v[0], this.v[1] - v.v[1]);
	},

	mul : function(v) {
		return new SglVec2(this.v[0] * v.v[0], this.v[1] * v.v[1]);
	},

	div : function(v) {
		return new SglVec2(this.v[0] / v.v[0], this.v[1] / v.v[1]);
	},

	get rcp() {
		return new SglVec2(1.0 / this.v[0], 1.0 / this.v[1]);
	},

	dot : function(v) {
		return (this.v[0] * v.v[0] + this.v[1] * v.v[1]);
	},

	cross : function(v) {
		return (this.v[0]*v.v[1] - this.v[1]*v.v[0]);
	},

	min : function(v) {
		return new SglVec2(sglMin(this.v[0], v.v[0]), sglMin(this.v[1], v.v[1]));
	},

	max : function(v) {
		return new SglVec2(sglMax(this.v[0], v.v[0]), sglMax(this.v[1], v.v[1]));
	}
};
/***********************************************************************/


// SglVec3
/***********************************************************************/
/**
 * Constructs a SglVec3.
 * @class 3-dimensional vector.
 */
function SglVec3() {
	this.v = new Array(3);
	var n = arguments.length;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				this.setVec(arguments[0]);
			}
			else if (arguments[0] instanceof SglVec3) {
				this.setVec(arguments[0].v);
			}
			else {
				this.setScalar(arguments[0]);
			}
		break;
		case 3:
			this.setVec(arguments);
		break;
		default:
			this.setZero();
		break;
	}
}

SglVec3.prototype = {
	clone : function() {
		return new SglVec3(this);
	},

	get copy() {
		return this.clone();
	},

	get x( ) { return this.v[0]; },
	set x(n) { this.v[0] = n;    },
	get y( ) { return this.v[1]; },
	set y(n) { this.v[1] = n;    },
	get z( ) { return this.v[2]; },
	set z(n) { this.v[2] = n;    },

	set : function(x, y, z) {
		this.v[0] = x;
		this.v[1] = y;
		this.v[2] = z;
		return this;
	},

	setVec : function(v) {
		return this.set(v[0], v[1], v[2]);
	},

	setScalar : function(s) {
		return this.set(s, s, s);
	},

	setZero : function() {
		return this.setScalar(0.0);
	},

	setOne : function() {
		return this.setScalar(1.0);
	},

	at : function(i) {
		return this.v[i];
	},

	get squaredLength() {
		return this.dot(this);
	},

	get length() {
		return sglSqrt(this.squaredLength);
	},

	normalize : function() {
		var f = this.length;
		if (f > 0.0) f = 1.0 / f;
		this.v[0] *= f;
		this.v[1] *= f;
		this.v[2] *= f;
		return this;
	},

	get normalized() {
		return this.clone().normalize();
	},

	get neg() {
		return new SglVec3(-(this.v[0]), -(this.v[1]), -(this.v[2]));
	},

	get abs() {
		return new SglVec3(sglAbs(this.v[0]), sglAbs(this.v[1]), sglAbs(this.v[2]));
	},

	get minComp() {
		var m = this.v[0];
		if (m > this.v[1]) m = this.v[1];
		if (m > this.v[2]) m = this.v[2];
		return m;
	},

	get maxComp() {
		var m = this.v[0];
		if (m < this.v[1]) m = this.v[1];
		if (m < this.v[2]) m = this.v[2];
		return m;
	},

	get argMin() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		if (this.v[a] > this.v[2]) a = 2;
		return a;
	},

	get argMax() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		if (this.v[a] > this.v[2]) a = 2;
		return a;
	},

	add : function(v) {
		return new SglVec3(this.v[0] + v.v[0], this.v[1] + v.v[1], this.v[2] + v.v[2]);
	},

	sub : function(v) {
		return new SglVec3(this.v[0] - v.v[0], this.v[1] - v.v[1], this.v[2] - v.v[2]);
	},

	mul : function(v) {
		return new SglVec3(this.v[0] * v.v[0], this.v[1] * v.v[1], this.v[2] * v.v[2]);
	},

	div : function(v) {
		return new SglVec3(this.v[0] / v.v[0], this.v[1] / v.v[1], this.v[2] / v.v[2]);
	},

	get rcp() {
		return new SglVec3(1.0 / this.v[0], 1.0 / this.v[1], 1.0 / this.v[2]);
	},

	dot : function(v) {
		return (this.v[0] * v.v[0] + this.v[1] * v.v[1] + this.v[2] * v.v[2]);
	},

	cross : function(v) {
		return new SglVec3(this.v[1]*v.v[2] - this.v[2]*v.v[1], this.v[2]*v.v[0] - this.v[0]*v.v[2], this.v[0]*v.v[1] - this.v[1]*v.v[0]);
	},

	min : function(v) {
		return new SglVec3(sglMin(this.v[0], v.v[0]), sglMin(this.v[1], v.v[1]), sglMin(this.v[2], v.v[2]));
	},

	max : function(v) {
		return new SglVec3(sglMax(this.v[0], v.v[0]), sglMax(this.v[1], v.v[1]), sglMax(this.v[2], v.v[2]));
	}
};
/***********************************************************************/


// SglVec4
/***********************************************************************/
/**
 * Constructs a SglVec3.
 * @class 4-dimensional vector.
 */
function SglVec4() {
	this.v = new Array(4);
	var n = arguments.length;
	switch (n) {
		case 1:
			if (arguments[0] instanceof Array) {
				this.setVec(arguments[0]);
			}
			else if (arguments[0] instanceof SglVec4) {
				this.setVec(arguments[0].v);
			}
			else {
				this.setScalar(arguments[0]);
			}
		break;
		case 4:
			this.setVec(arguments);
		break;
		default:
			this.setZero();
		break;
	}
}

SglVec4.prototype = {
	clone : function() {
		return new SglVec4(this);
	},

	get copy() {
		return this.clone();
	},

	get x( ) { return this.v[0]; },
	set x(n) { this.v[0] = n;    },
	get y( ) { return this.v[1]; },
	set y(n) { this.v[1] = n;    },
	get z( ) { return this.v[2]; },
	set z(n) { this.v[2] = n;    },
	get w( ) { return this.v[3]; },
	set w(n) { this.v[3] = n;    },

	set : function(x, y, z, w) {
		this.v[0] = x;
		this.v[1] = y;
		this.v[2] = z;
		this.v[3] = w;
		return this;
	},

	setVec : function(v) {
		return this.set(v[0], v[1], v[2], v[3]);
	},

	setScalar : function(s) {
		return this.set(s, s, s, s);
	},

	setZero : function() {
		return this.setScalar(0.0);
	},

	setOne : function() {
		return this.setScalar(1.0);
	},

	at : function(i) {
		return this.v[i];
	},

	get squaredLength() {
		return this.dot(this);
	},

	get length() {
		return sglSqrt(this.squaredLength);
	},

	normalize : function() {
		var f = this.length;
		if (f > 0.0) f = 1.0 / f;
		this.v[0] *= f;
		this.v[1] *= f;
		this.v[2] *= f;
		this.v[3] *= f;
		return this;
	},

	get normalized() {
		return this.clone().normalize();
	},

	get neg() {
		return new SglVec4(-(this.v[0]), -(this.v[1]), -(this.v[2]), -(this.v[3]));
	},

	get abs() {
		return new SglVec4(sglAbs(this.v[0]), sglAbs(this.v[1]), sglAbs(this.v[2]), sglAbs(this.v[3]));
	},

	get minComp() {
		var m = this.v[0];
		if (m > this.v[1]) m = this.v[1];
		if (m > this.v[2]) m = this.v[2];
		if (m > this.v[3]) m = this.v[3];
		return m;
	},

	get maxComp() {
		var m = this.v[0];
		if (m < this.v[1]) m = this.v[1];
		if (m < this.v[2]) m = this.v[2];
		if (m < this.v[3]) m = this.v[3];
		return m;
	},

	get argMin() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		if (this.v[a] > this.v[2]) a = 2;
		if (this.v[a] > this.v[3]) a = 2;
		return a;
	},

	get argMax() {
		var a = 0;
		if (this.v[a] > this.v[1]) a = 1;
		if (this.v[a] > this.v[2]) a = 2;
		if (this.v[a] > this.v[3]) a = 2;
		return a;
	},

	add : function(v) {
		return new SglVec4(this.v[0] + v.v[0], this.v[1] + v.v[1], this.v[2] + v.v[2], this.v[3] + v.v[3]);
	},

	sub : function(v) {
		return new SglVec4(this.v[0] - v.v[0], this.v[1] - v.v[1], this.v[2] - v.v[2], this.v[3] - v.v[3]);
	},

	mul : function(v) {
		return new SglVec4(this.v[0] * v.v[0], this.v[1] * v.v[1], this.v[2] * v.v[2], this.v[3] * v.v[3]);
	},

	div : function(v) {
		return new SglVec4(this.v[0] / v.v[0], this.v[1] / v.v[1], this.v[2] / v.v[2], this.v[3] / v.v[3]);
	},

	get rcp() {
		return new SglVec4(1.0 / this.v[0], 1.0 / this.v[1], 1.0 / this.v[2], 1.0 / this.v[3]);
	},

	dot : function(v) {
		return (this.v[0] * v.v[0] + this.v[1] * v.v[1] + this.v[2] * v.v[2] + this.v[3] * v.v[3]);
	},

	/*
	cross : function(u, v, w) {
		return null;
	},
	*/

	min : function(v) {
		return new SglVec4(sglMin(this.v[0], v.v[0]), sglMin(this.v[1], v.v[1]), sglMin(this.v[2], v.v[2]), sglMin(this.v[3], v.v[3]));
	},

	max : function(v) {
		return new SglVec4(sglMax(this.v[0], v.v[0]), sglMax(this.v[1], v.v[1]), sglMax(this.v[2], v.v[2]), sglMax(this.v[3], v.v[3]));
	}
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglPlane3
/***********************************************************************/
/**
 * Constructs a SglPlane3.
 * @class Represents a plane in space.
 */
function SglPlane3(normal, offset, normalize) {
	this._normal = [ 0.0, 0.0, 1.0 ];
	this._offset = 0.0;

	if (normal && offset) {
		this.setup(normal, offset, normalize);
	}
}

SglPlane3.prototype = {
	get normal()  { return this._normal;          },
	set normal(n) { this._normal = n.slice(0, 3); },

	get offset()  { return this._offset;          },
	set offset(o) { this._offset = o.slize(0, 3); },

	clone : function() {
		return new SglPlane3(this._normal, this._offset, false);
	},

	get copy() {
		return this.clone();
	},

	setup : function(normal, offset, nomalize) {
		this._normal[0] = normal[0];
		this._normal[1] = normal[1];
		this._normal[2] = normal[2];
		this._offset    = offset;

		if (normalize) {
			var s = sglSqrt(sglDotV3(this._normal));

			if (s > 0.0) {
				s = 1.0 / s;
				sglSelfMulV3S(this._normal, s);
				this._offset    *= s;
			}
		}
	}
};
/***********************************************************************/


// SglBox3
/***********************************************************************/
/**
 * Constructs a SglBox3.
 * @class Represents an axis-aligned box in space.
 */
function SglBox3(min, max) {
	this._min = [  1.0,  1.0,  1.0 ];
	this._max = [ -1.0, -1.0, -1.0 ];

	if (min && max) {
		this.setup(min, max);
	}
}

SglBox3.prototype = {
	get min()  { return this._min;          },
	set min(m) { this._min = m.slice(0, 3); },

	get max()  { return this._max;          },
	set max(m) { this._max = m.slice(0, 3); },

	clone : function() {
		return new SglBox3(this._min, this._max);
	},

	get copy() {
		return this.clone();
	},

	setup : function(min, max) {
		for (var i=0; i<3; ++i) {
			this._min[i] = min[i];
			this._max[i] = max[i];
		}
		return this;
	},

	get isNull() {
		return (this._min[0] > this._max[0]);
	},

	get isEmpty() {
		return (
			   (this._min[0] == this._max[0])
			&& (this._min[1] == this._max[1])
			&& (this._min[2] == this._max[2])
		);
	},

	get center() {
		return sglSelfMulV3S(sglAddV3(this._min, this._max), 0.5);
	},

	get size() {
		return sglSubV3(this._max, this._min);
	},

	get squaredDiagonal() {
		var s = this.size;
		return sglDotV3(s, s);
	},

	get diagonal() {
		return sglSqrt(this.squaredDiagonal);
	},

	get facesAreas() {
		var s = this.size;
		return [
			(s[1] * s[2]),
			(s[0] * s[2]),
			(s[0] * s[1])
		];
	},

	get surfaceArea() {
		var a = this.facesArea;
		return ((a[0] + a[1] + a[2]) * 2.0);
	},

	get volume() {
		var s = this.size;
		return (s[0] * s[1] * s[2]);
	},

	offset : function(halfDelta) {
		sglSelfSubV3S(this._min[i], halfDelta);
		sglSelfAddV3S(this._max[i], halfDelta);
		return this;
	},

	corner : function(index) {
		var s = this.size;
		return [
			this._min[0] + (((index % 2)       != (0.0)) ? (1.0) : (0.0)) * s[0],
			this._min[1] + ((((index / 2) % 2) != (0.0)) ? (1.0) : (0.0)) * s[1],
			this._min[2] + (((index > 3)       != (0.0)) ? (1.0) : (0.0)) * s[2]
		];
	},

	transformed : function(matrix) {
		var b = new SglBox3();
		var p = sglMulM4V3(matrix, this.corner(0), 1.0);
		b.min = p;
		b.max = p;
		for (var i=1; i<8; ++i) {
			p = sglMulM4V3(matrix, this.corner(1), 1.0);
			b.min = sglMinV3(b.min, p);
			b.max = sglMaxV3(b.max, p);
		}
		return b;
	},

	addPoint : function(p) {
		if (this.isNull) {
			this.min = p;
			this.max = p;
		}
		else {
			this.min = sglMinV3(this.min, p);
			this.max = sglMaxV3(this.min, p);
		}
		return this;
	},

	addBox : function(b) {
		if (!b.isNull) {
			if (this.isNull) {
				this.min = b.min;
				this.max = b.max;
			}
			else {
				this.min = sglMinV3(this.min, b.min);
				this.max = sglMaxV3(this.max, b.max);
			}
		}
		return this;
	}
};
/***********************************************************************/


// SglSphere3
/***********************************************************************/
/**
 * Constructs a SglSphere3.
 * @class Represents a sphere in space.
 */
function SglSphere3(center, radius) {
	this._center = [ 0.0, 0.0, 0.0 ];
	this._radius = -1.0;

	if (center && radius) {
		this.setup(center, radius);
	}
}

SglSphere3.prototype = {
	get center()  { return this._center;          },
	set center(c) { this._center = c.slice(0, 3); },

	get radius()  { return this._redius;          },
	set radius(r) { this._radius = r;             },

	clone : function() {
		return new SglSphere3(this._center, this._radius);
	},

	get copy() {
		return this.clone();
	},

	setup : function(center, radius) {
		this._center[0] = center[0];
		this._center[1] = center[1];
		this._center[2] = center[2];
		this._radius    = radius;
		return this;
	},

	get isNull() {
		return (this._radius < 0.0);
	},

	get isEmpty() {
		return (this._radius == 0.0);
	},

	get surfaceArea() {
		return (4.0 * SGL_PI * this._radius * this._radius);
	},

	get volume() {
		return ((4.0 / 3.0) * SGL_PI * this._radius * this._radius * this._radius);
	}
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglMatrixStack
/***********************************************************************/
/**
 * Constructs a SglMatrixStack.
 * @class Represents a stack of 4x4 matrices.
 */
function SglMatrixStack() {
	this._s = [ ];
	this._s.push(sglIdentityM4());
	this._n = 0;
}

SglMatrixStack.prototype = {
	clone : function() {
		var ss = new SglMatrixStack();
		ss.s = [ ];
		for (var i=0; i<(this._n+1); ++i) {
			ss._s.push(sglDupM4(this._s[i]));
		}
		return ss;
	},

	get copy() {
		return this.clone();
	},

	reset : function() {
		this._s = [ ];
		this._s.push(sglIdentityM4());
		this._n = 0;
		return this;
	},

	get size() {
		return (this._n + 1);
	},

	get top() {
		return sglDupM4(this._s[this._n]);
	},

	get topRef() {
		return this._s[this._n];
	},

	push : function() {
		this._s.push(sglDupM4(this._s[this._n]));
		this._n++;
		return this;
	},

	pop : function() {
		if (this._n > 0) {
			this._s.pop();
			this._n--;
		}
		return this;
	},

	load : function(m) {
		this._s[this._n] = sglDupM4(m);
		return this;
	},

	multiply : function(m) {
		this._s[this._n] = sglMulM4(this._s[this._n], m);
		return this;
	},

	loadIdentity : function() {
		this._s[this._n] = sglIdentityM4();
		return this;
	},

	translate : function(x, y, z) {
		return this.multiply(sglTranslationM4C(x, y, z));
	},

	rotate : function(angleRad, x, y, z) {
		return this.multiply(sglRotationAngleAxisM4C(angleRad, x, y, z));
	},

	scale : function(x, y, z) {
		return this.multiply(sglScalingM4C(x, y, z));
	},

	lookAt : function(positionX, positionY, positionZ, targetX, targetY, targetZ, upX, upY, upZ) {
		return this.multiply(sglLookAtM4C(positionX, positionY, positionZ, targetX, targetY, targetZ, upX, upY, upZ));
	},

	ortho : function(left, right, bottom, top, zNear, zFar) {
		return this.multiply(sglOrthoM4C(left, right, bottom, top, zNear, zFar));
	},

	frustum : function(left, right, bottom, top, zNear, zFar) {
		return this.multiply(sglFrustumM4C(left, right, bottom, top, zNear, zFar));
	},

	perspective : function(fovYRad, aspectRatio, zNear, zFar) {
		return this.multiply(sglPerspectiveM4(fovYRad, aspectRatio, zNear, zFar));
	}
};
/***********************************************************************/


// SglTransformStack
/***********************************************************************/
/**
 * Constructs a SglTransformStack.
 * @class Holds model, view and projection matrix stacks.
 */
function SglTransformStack() {
	this._ms = new SglMatrixStack();
	this._vs = new SglMatrixStack();
	this._ps = new SglMatrixStack();
}

SglTransformStack.prototype = {
	clone : function() {
		var xs = new SglTransformStack();
		xs._ms = this._ms.clone();
		xs._vs = this._vs.clone();
		xs._ps = this._ps.clone();
		return xs;
	},

	get copy() {
		return this.clone();
	},

	reset : function() {
		this._ms.reset();
		this._vs.reset();
		this._ps.reset();
		return this;
	},

	get model() {
		return this._ms;
	},

	get view() {
		return this._vs;
	},

	get projection() {
		return this._ps;
	},

	get modelMatrix() {
		return this.model.top;
	},

	get modelMatrixRef() {
		return this.model.topRef;
	},

	get modelMatrixTranspose() {
		return sglTransposeM4(this.modelMatrixRef);
	},

	get modelMatrixInverse() {
		return sglInverseM4(this.modelMatrixRef);
	},

	get modelMatrixInverseTranspose() {
		return sglTransposeM4(this.modelMatrixInverse);
	},

	get viewMatrix() {
		return this.view.top;
	},

	get viewMatrixRef() {
		return this.view.topRef;
	},

	get viewMatrixTranspose() {
		return sglTransposeM4(this.viewMatrixRef);
	},

	get viewMatrixInverse() {
		return sglInverseM4(this.viewMatrixRef);
	},

	get viewMatrixInverseTranspose() {
		return sglTransposeM4(this.viewMatrixInverse);
	},

	get projectionMatrix() {
		return this.projection.top;
	},

	get projectionMatrixRef() {
		return this.projection.topRef;
	},

	get projectionMatrixTranspose() {
		return sglTransposeM4(this.projectionMatrixRef);
	},

	get projectionMatrixInverse() {
		return sglInverseM4(this.projectionMatrixRef);
	},

	get projectionMatrixInverseTranspose() {
		return sglTransposeM4(this.projectionMatrixInverse);
	},

	get modelViewMatrix() {
		return sglMulM4(this.viewMatrixRef, this.modelMatrixRef);
	},

	get modelViewMatrixTranspose() {
		return sglTransposeM4(this.modelViewMatrix);
	},

	get modelViewMatrixInverse() {
		return sglInverseM4(this.modelViewMatrix);
	},

	get modelViewMatrixInverseTranspose() {
		return sglTransposeM4(this.modelViewMatrixInverse);
	},

	get viewProjectionMatrix() {
		return sglMulM4(this.projectionMatrixRef, this.viewMatrixRef);
	},

	get viewProjectionMatrixTranspose() {
		return sglTransposeM4(this.viewProjectionMatrix);
	},

	get viewProjectionMatrixInverse() {
		return sglInverseM4(this.viewProjectionMatrix);
	},

	get viewProjectionMatrixInverseTranspose() {
		return sglTransposeM4(this.viewProjectionMatrixInverse);
	},

	get modelViewProjectionMatrix() {
		return sglMulM4(this.projectionMatrixRef, sglMulM4(this.viewMatrixRef, this.modelMatrixRef));
	},

	get modelViewProjectionMatrixTranspose() {
		return sglTransposeM4(this.modelViewProjectionMatrix);
	},

	get modelViewProjectionMatrixInverse() {
		return sglInverseM4(this.modelViewProjectionMatrix);
	},

	get modelViewProjectionMatrixInverseTranspose() {
		return sglTransposeM4(this.modelViewProjectionMatrixInverse);
	},

	get worldSpaceNormalMatrix() {
		return sglM4toM3(this.modelMatrixInverseTranspose);
	},

	get viewSpaceNormalMatrix() {
		return sglM4toM3(this.modelViewMatrixInverseTranspose);
	},

	get modelSpaceViewerPosition() {
		return sglV4toV3(sglGetColM4(this.modelViewMatrixInverse, 3));
	},

	get modelSpaceViewDirection() {
		return sglNegV3(sglV4toV3(sglGetRowM4(this.modelViewMatrix, 2)));
	},

	get worldSpaceViewerPosition() {
		return sglV4toV3(sglGetColM4(this.viewMatrixInverse, 3));
	},

	get worldSpaceViewDirection() {
		return ssglNegV3(sglV4toV3(sglGetRowM4(this.viewMatrixRef, 2)));
	}
};
/***********************************************************************/


// _SglFrustumPlane
/**********************************************************/
function _SglFrustumPlane() {
	this.normal     = [ 0.0, 0.0, 1.0 ];
	this.offset     = 0.0;
	this.testVertex = [ 0, 0, 0 ];
}

_SglFrustumPlane.prototype = {
	setup : function(nx, ny, nz, off) {
		var s = 1.0 / sglSqrt(nx*nx + ny*ny + nz*nz);

		this.normal[0] = nx * s;
		this.normal[1] = ny * s;
		this.normal[2] = nz * s;

		this.offset = off * s;

		this.testVertex[0] = (this.normal[0] >= 0.0) ? (1) : (0);
		this.testVertex[1] = (this.normal[1] >= 0.0) ? (1) : (0);
		this.testVertex[2] = (this.normal[2] >= 0.0) ? (1) : (0);
	}
};
/**********************************************************/


// SglFrustum
/**********************************************************/
const SGL_OUTSIDE_FRUSTUM   = 0;
const SGL_INTERSECT_FRUSTUM = 1;
const SGL_INSIDE_FRUSTUM    = 2;

/**
 * Constructs a SglFrustum.
 * @class Holds frustum information for operations such as visibility culling.
 */
function SglFrustum(projectionMatrix, modelViewMatrix, viewport) {
	this._mvpMatrix       = sglIdentityM4();
	this._viewport        = [ 0, 0, 1, 1 ];
	this._vp              = [ 0, 0, 1, 1 ];
	this._billboardMatrix = sglIdentityM4();

	this._planes = new Array(6);
	for (var i=0; i<6; ++i) {
		this._planes[i] = new _SglFrustumPlane();
	}

	if (projectionMatrix && modelViewMatrix && viewport) {
		this.setup(projectionMatrix, modelViewMatrix, viewport);
	}
}

SglFrustum.prototype = {
	setup : function (projectionMatrix, modelViewMatrix, viewport) {
		var rot = [
			sglGetColM4(modelViewMatrix, 0),
			sglGetColM4(modelViewMatrix, 1),
			sglGetColM4(modelViewMatrix, 2)
		];

		var sc = [
			sglLengthV4(rot[0]),
			sglLengthV4(rot[1]),
			sglLengthV4(rot[2])
		];

		var scRcp = sglRcpV3(sc);

		var sMat    = sglScalingM4V(sc);
		var sMatInv = sglScalingM4V(scRcp);

		rot[0] = sglMulV4S(rot[0], scRcp[0]);
		rot[1] = sglMulV4S(rot[1], scRcp[1]);
		rot[2] = sglMulV4S(rot[2], scRcp[2]);

		var rMatInv = sglIdentityM4();
		sglSetRowM4V(rMatInv, 0, rot[0]);
		sglSetRowM4V(rMatInv, 1, rot[1]);
		sglSetRowM4V(rMatInv, 2, rot[2]);

		this._mvpMatrix       = sglMulM4(projectionMatrix, modelViewMatrix);
		this._billboardMatrix = sglMulM4(sMatInv, sglMulM4(rMatInv, sMat));
		this._viewport        = viewport.slice(0, 4);

		this._vp[0] = this._viewport[2] * 0.5;
		this._vp[1] = this._viewport[0] + this._viewport[2] * 0.5;
		this._vp[2] = this._viewport[3] * 0.5;
		this._vp[3] = this._viewport[1] + this._viewport[3] * 0.5;


		var m = this._mvpMatrix;
		var q = [ m[3], m[7], m[11] ];

		this._planes[0].setup(q[ 0] - m[ 0], q[ 1] - m[ 4], q[ 2] - m[ 8], m[15] - m[12]);
		this._planes[1].setup(q[ 0] + m[ 0], q[ 1] + m[ 4], q[ 2] + m[ 8], m[15] + m[12]);
		this._planes[2].setup(q[ 0] - m[ 1], q[ 1] - m[ 5], q[ 2] - m[ 9], m[15] - m[13]);
		this._planes[3].setup(q[ 0] + m[ 1], q[ 1] + m[ 5], q[ 2] + m[ 9], m[15] + m[13]);
		this._planes[4].setup(q[ 0] - m[ 2], q[ 1] - m[ 6], q[ 2] - m[10], m[15] - m[14]);
		this._planes[5].setup(q[ 0] + m[ 2], q[ 1] + m[ 6], q[ 2] + m[10], m[15] + m[14]);
	},

	boxVisibility : function(boxMin, boxMax) {
		var ret = SGL_INSIDE_FRUSTUM;

		var bminmax = [ boxMin, boxMax ];

		var fp = null;
		for (var i=0; i<6; ++i) {
			fp = this._planes[i];
			if (
				((fp.normal[0] * bminmax[fp.testVertex[0]][0]) +
				 (fp.normal[1] * bminmax[fp.testVertex[1]][1]) +
				 (fp.normal[2] * bminmax[fp.testVertex[2]][2]) +
				 (fp.offset)) < 0.0
			) {
				return SGL_OUTSIDE_FRUSTUM;
			}

			if (
				((fp.normal[0] * bminmax[1 - fp.testVertex[0]][0]) +
				 (fp.normal[1] * bminmax[1 - fp.testVertex[1]][1]) +
				 (fp.normal[2] * bminmax[1 - fp.testVertex[2]][2]) +
				 (fp.offset)) < 0.0
			) {
				ret = SGL_INTERSECT_FRUSTUM;
			}
		}

		return ret;
	},

	projectedSegmentSize : function(center, size) {
		var hs = size * 0.5;

		var p0 = sglV3toV4(center, 0.0);
		var p1 = [ -hs, 0.0, 0.0, 1.0 ];
		var p2 = [  hs, 0.0, 0.0, 1.0 ];

		p1 = sglMulM4V4(this._billboardMatrix, p1);
		p1 = sglAddV4(p1, p0);
		p1 = sglProjectV4(sglMulM4V4(this._mvpMatrix, p1));

		p2 = sglMulM4V4(this._billboardMatrix, p2);
		p2 = sglAddV4(p2, p0);
		p2 = sglProjectV4(sglMulM4V4(this._mvpMatrix, p2));

		/*
		p1[0] = this._vp[0] * p1[0] + this._vp[1];
		p2[0] = this._vp[0] * p2[0] + this._vp[1];
		//p1[1] = this.viewport[3] * 0.5 * p1[1] + this.viewport[1] + this.viewport[3] * 0.5;

		p2[0] = this.viewport[2] * 0.5 * p2[0] + this.viewport[0] + this.viewport[2] * 0.5;
		//p2[1] = this.viewport[3] * 0.5 * p2[1] + this.viewport[1] + this.viewport[3] * 0.5;

		var size = aglAbs(p2[0] - p1[0]);
		*/

		var sz = this._vp[0] * sglAbs(p2[0] - p1[0]);

		return sz;
	}
};

function sglBoxVisibility(modelViewProjectionMatrix, boxMin, boxMax) {
	var fc = new SglFrustum(modelViewProjectionMatrix);
	return fc.boxVisibility(boxMin, boxMax);
}
/**********************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// GL utilities
/***********************************************************************/
function _sglConsolidateOptions(fullOptions, usedOptions)
{
	if (usedOptions) {
		for (var attr in usedOptions) {
			fullOptions[attr] = usedOptions[attr];
		}
	}
	return fullOptions;
}
/***********************************************************************/


// SglBufferInfo
/***********************************************************************/
function sglGetBufferOptions(gl, options) {
	var opt = {
		usage : gl.STATIC_DRAW
	};
	return _sglConsolidateOptions(opt, options);
}

/**
 * Constructs a SglBufferInfo.
 * @class Holds information about a WebGL buffer object.
 */
function SglBufferInfo() {
	this.handle = null;
	this.valid  = false;
	this.target = 0;
	this.size   = 0;
	this.usage  = 0;
}

function sglBufferFromData(gl, target, values, options) {
	var opt = sglGetBufferOptions(gl, options);
	var buff = gl.createBuffer();
	gl.bindBuffer(target, buff);
	gl.bufferData(target, values, opt.usage);
	gl.bindBuffer(target, null);

	var obj = new SglBufferInfo();
	obj.handle = buff;
	obj.valid  = true;
	obj.target = target;
	obj.size   = values.sizeInBytes;
	obj.usage  = opt.usage;

	return obj;
}

function sglVertexBufferFromData(gl, values, usage) {
	return sglBufferFromData(gl, gl.ARRAY_BUFFER, values, usage);
}

function sglIndexBufferFromData(gl, values, usage) {
	return sglBufferFromData(gl, gl.ELEMENT_ARRAY_BUFFER, values, usage);
}
/***********************************************************************/


// SglShaderInfo
/***********************************************************************/
/**
 * Constructs a SglShaderInfo.
 * @class Holds information about a WebGL shader object.
 */
function SglShaderInfo() {
	this.handle = null;
	this.valid  = false;
	this.type   = 0;
	this.log    = "";
}

function sglShaderFromSource(gl, type, src) {
	var log = "";
	log += "----------------------\n";

	var shd  = gl.createShader(type);
	gl.shaderSource(shd, src);
	gl.compileShader(shd);

	log += "[SHADER LOG]\n";
	var valid = true;
	if (gl.getShaderParameter(shd, gl.COMPILE_STATUS) != 0) {
		log += "SUCCESS:\n";
	}
	else {
		valid = false;
		log += "FAIL:\n";
	}
	log += gl.getShaderInfoLog(shd);
	log += "\n";
	log += "----------------------\n";

	var obj = new SglShaderInfo();
	obj.handle = shd;
	obj.valid  = valid;
	obj.type   = type;
	obj.log    = log;

	return obj;
}

function sglVertexShaderFromSource(gl, src) {
	return sglShaderFromSource(gl, gl.VERTEX_SHADER, src);
}

function sglFragmentShaderFromSource(gl, src) {
	return sglShaderFromSource(gl, gl.FRAGMENT_SHADER, src);
}
/***********************************************************************/


// SglProgramAttributeInfo
/***********************************************************************/
/**
 * Constructs a SglProgramAttributeInfo.
 * @class Holds information about a WebGL program active attribute.
 */
function SglProgramAttributeInfo() {
	this.name       = "";
	this.nativeType = 0;
	//this.scalarType = 0;
	//this.dimensions = 0;
	this.size       = 0;
	this.location   = -1;
}
/***********************************************************************/


// SglProgramUniformInfo
/***********************************************************************/
/**
 * Constructs a SglProgramAttributeInfo.
 * @class Holds information about a WebGL program active uniform.
 */
function SglProgramUniformInfo() {
	this.name       = "";
	this.nativeType = 0;
	//this.scalarType = 0;
	//this.dimensions = 0;
	this.size       = 0;
	this.location   = -1;
}
/***********************************************************************/


// SglProgramSamplerInfo
/***********************************************************************/
/**
 * Constructs a SglProgramSamplerInfo.
 * @class Holds information about a WebGL program active sampler.
 */
function SglProgramSamplerInfo() {
	this.name       = "";
	this.nativeType = 0;
	//this.scalarType = 0;
	//this.dimensions = 0;
	this.size       = 0;
	this.location   = -1;
}
/***********************************************************************/


// SglProgramInfo
/***********************************************************************/
/**
 * Constructs a SglProgramInfo.
 * @class Holds information about a WebGL program object.
 */
function SglProgramInfo() {
	this.handle     = null;
	this.valid      = false;
	this.shaders    = [ ];
	this.attributes = new Object();
	this.uniforms   = new Object();
	this.samplers   = new Object();
	this.log        = "";
}

function sglProgramFromShaders(gl, shaders) {
	var log = "";
	log += "----------------------\n";

	var prg = gl.createProgram();
	for (var s in shaders) {
		var shd = shaders[s];
		//if (shd.valid) {
			gl.attachShader(prg, shd.handle);
		//}
	}
	gl.linkProgram(prg);

	var valid = true;
	valid = valid && (gl.getProgramParameter(prg, gl.LINK_STATUS)     != 0);

	// validation is needed when uniforms are set, so skip this.
	//gl.validateProgram(prg);
	//valid = valid && (gl.getProgramParameter(prg, gl.VALIDATE_STATUS) != 0);

	log += "[PROGRAM LOG]\n";
	if (valid) {
		log += "SUCCESS:\n";
	}
	else {
		log += "FAIL:\n";
	}
	log += gl.getProgramInfoLog(prg);
	log += "\n";
	log += "----------------------\n";

	var obj = new SglProgramInfo();
	obj.handle = prg;
	obj.valid  = valid;
	for (var s in shaders) {
		var shd = shaders[s]
		//if (shd.valid) {
			obj.shaders.push(shd);
		//}
	}
	obj.log = log;

	var attribs_count = gl.getProgramParameter(prg, gl.ACTIVE_ATTRIBUTES);
	var attr, loc, a;
	for (var i=0; i<attribs_count; ++i) {
		attr = gl.getActiveAttrib(prg, i);
		if (!attr) continue;
		a    = new SglProgramAttributeInfo();
		a.name = attr.name;
		a.nativeType = attr.type;
		a.size = attr.size;
		a.location = gl.getAttribLocation(prg, attr.name);
		obj.attributes[a.name] = a;
	}

	var uniforms_count = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);
	var unif, loc, u;
	for (var i=0; i<uniforms_count; ++i) {
		unif = gl.getActiveUniform(prg, i);
		if (!unif) continue;
		loc  = gl.getUniformLocation(prg, unif.name);
		if ((unif.type == gl.SAMPLER_2D) || (unif.type == gl.SAMPLER_CUBE) || (unif.type == 35682)) {
			s = new SglProgramSamplerInfo();
			s.name = unif.name;
			s.nativeType = unif.type;
			s.size = unif.size;
			s.location = loc;
			obj.samplers[s.name] = s;
		}
		else {
			u = new SglProgramUniformInfo();
			u.name = unif.name;
			u.nativeType = unif.type;
			u.size = unif.size;
			u.location = loc;
			obj.uniforms[u.name] = u;
		}
	}

	sglSetDefaultProgramBindings(gl, obj);

	return obj;
}

function sglProgramFromSources(gl, vertexSources, fragmentSources) {
	var shd = null;
	var shaders = [ ];
	for (var s in vertexSources) {
		var src = vertexSources[s];
		shd = sglVertexShaderFromSource(gl, src);
		shaders.push(shd);
	}
	for (var s in fragmentSources) {
		var src = fragmentSources[s];
		shd = sglFragmentShaderFromSource(gl, src);
		shaders.push(shd);
	}
	return sglProgramFromShaders(gl, shaders);
}

function sglSetDefaultProgramBindings(gl, programInfo) {
	var prg = programInfo.handle;

	// ensure index is sequential in "for (attr in programInfo.attributes)" loops
	var index = 0;
	for (var v in programInfo.attributes) {
		var vattr = programInfo.attributes[v];
		gl.bindAttribLocation(prg, index, vattr.name);
		vattr.location = index;
		index++;
	}
	// must relink after attributes binding
	gl.linkProgram(prg);

	// uniform locations could change after program linking, so update them
	for (var u in programInfo.uniforms) {
		var unif = programInfo.uniforms[u];
		unif.location = gl.getUniformLocation(prg, unif.name);
	}

	gl.useProgram(programInfo.handle);
	// ensure texture unit is sequential in "for (attr in programInfo.samplers)" loops
	var unit = 0;
	for (var s in programInfo.samplers) {
		var smp = programInfo.samplers[s];
		smp.location = gl.getUniformLocation(prg, smp.name);
		gl.uniform1i(smp.location, unit);
		unit++;
	}
	//gl.useProgram(null);
}

function sglProgramSynchronize(gl, programInfo) {
	var prg = programInfo.handle;

	for (var v in programInfo.attributes) {
		var vattr = programInfo.attributes[v];
		vattr.location = gl.getAttribLocation(prg, vattr.name);
	}

	for (var u in programInfo.uniforms) {
		var unif = programInfo.uniforms[u];
		unif.location = gl.getUniformLocation(prg, unif.name);
	}

	for (var s in programInfo.samplers) {
		var smp = programInfo.samplers[s];
		smp.location = gl.getUniformLocation(prg, smp.name);
	}
}
/***********************************************************************/


// SglTextureInfo
/***********************************************************************/
function sglGetTextureOptions(gl, options) {
	var opt = {
		minFilter        : gl.LINEAR,
		magFilter        : gl.LINEAR,
		wrapS            : gl.CLAMP_TO_EDGE,
		wrapT            : gl.CLAMP_TO_EDGE,
		isDepth          : false,
		depthMode        : gl.LUMINANCE,
		depthCompareMode : gl.COMPARE_R_TO_TEXTURE,
		depthCompareFunc : gl.LEQUAL,
		generateMipmap   : false,
		flipY            : true,
		premultiplyAlpha : false,
		onload           : null
	};
	return _sglConsolidateOptions(opt, options);
}

/**
 * Constructs a SglTextureInfo.
 * @class Holds information about a WebGL texture object.
 */
function SglTextureInfo() {
	this.handle           = null;
	this.valid            = false;
	this.target           = 0;
	this.format           = 0;
	this.width            = 0;
	this.height           = 0;
	this.minFilter        = 0;
	this.magFilter        = 0;
	this.wrapS            = 0;
	this.wrapT            = 0;
	this.isDepth          = false;
	this.depthMode        = 0;
	this.depthCompareMode = 0;
	this.depthCompareFunc = 0;
}

function sglTexture2DFromData(gl, internalFormat, width, height, sourceFormat, sourceType, texels, options) {
	var opt = sglGetTextureOptions(gl, options);

	// Chrome does not like texels == null
	if (!texels) {
		if (sourceType == gl.FLOAT) {
			texels = new Float32Array(width * height * 4);
		}
		else {
			texels = new Uint8Array(width * height * 4);
		}
	}

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	var flipYEnabled  = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
	var flipYRequired = (opt.flipY === true);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYRequired) ? (1) : (0)));
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, sourceFormat, sourceType, texels);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYEnabled) ? (1) : (0)));
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     opt.wrapS    );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     opt.wrapT    );
	if (opt.isDepth) {
		gl.texParameteri(gl.TEXTURE_2D, gl.DEPTH_TEXTURE_MODE,   opt.depthMode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, opt.depthCompareMode);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, opt.depthCompareFunc);
	}
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);

	var obj = new SglTextureInfo();
	obj.handle           = tex;
	obj.valid            = true;
	obj.target           = gl.TEXTURE_2D;
	obj.format           = internalFormat;
	obj.width            = width;
	obj.height           = height;
	obj.minFilter        = opt.minFilter;
	obj.magFilter        = opt.magFilter;
	obj.wrapS            = opt.wrapS;
	obj.wrapT            = opt.wrapT;
	obj.isDepth          = opt.isDepth;
	obj.depthMode        = opt.depthMode;
	obj.depthCompareMode = opt.depthCompareMode;
	obj.depthCompareFunc = opt.depthCompareFunc;

	return obj;
}

function sglTexture2DFromImage(gl, image, options) {
	var opt = sglGetTextureOptions(gl, options);

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	var flipYEnabled  = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
	var flipYRequired = (opt.flipY === true);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYRequired) ? (1) : (0)));
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYEnabled) ? (1) : (0)));
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     opt.wrapS    );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     opt.wrapT    );
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);

	var obj = new SglTextureInfo();
	obj.handle           = tex;
	obj.valid            = true;
	obj.target           = gl.TEXTURE_2D;
	obj.format           = gl.RGBA;
	obj.width            = image.width;
	obj.height           = image.height;
	obj.minFilter        = opt.minFilter;
	obj.magFilter        = opt.magFilter;
	obj.wrapS            = opt.wrapS;
	obj.wrapT            = opt.wrapT;
	obj.isDepth          = false;
	obj.depthMode        = 0;
	obj.depthCompareMode = 0;
	obj.depthCompareFunc = 0;

	return obj;
}

function sglTexture2DFromUrl(gl, url, options) {
	var opt = sglGetTextureOptions(gl, options);
	var obj = new SglTextureInfo();

	var img = new Image();
	img.onload = function() {
		var texInfo = sglTexture2DFromImage(gl, img, opt);
		for (var a in texInfo) {
			obj[a] = texInfo[a];
		}
		if (opt.onload) {
			opt.onload(gl, obj, url);
		}
	};
	img.src = url;

	return obj;
}
/***********************************************************************/


/***********************************************************************/
function sglTextureCubeFromData(gl, internalFormat, width, height, sourceFormat, sourceType, facesTexels, options) {
	var opt = sglGetTextureOptions(gl, options);

	// Chrome does not like texels == null
	if (!facesTexels) {
		var tx = null;
		if (sourceType == gl.FLOAT) {
			tx = new Float32Array(width * height * 4);
		}
		else {
			tx = new Uint8Array(width * height * 4);
		}
		facesTexels = new Array(6);
		for (var i=0; i<6; ++i) {
			facesTexels[i] = tx;
		}
	}

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

	var flipYEnabled  = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
	var flipYRequired = (opt.flipY === true);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYRequired) ? (1) : (0)));
	}
	for (var i=0; i<6; ++i) {
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, width, height, 0, sourceFormat, sourceType, facesTexels[i]);
	}
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYEnabled) ? (1) : (0)));
	}

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,     opt.wrapS    );
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,     opt.wrapT    );
	if (opt.isDepth) {
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.DEPTH_TEXTURE_MODE,   opt.depthMode);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_MODE, opt.depthCompareMode);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_FUNC, opt.depthCompareFunc);
	}
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	}
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	var obj = new SglTextureInfo();
	obj.handle           = tex;
	obj.valid            = true;
	obj.target           = gl.TEXTURE_CUBE_MAP;
	obj.format           = internalFormat;
	obj.width            = width;
	obj.height           = height;
	obj.minFilter        = opt.minFilter;
	obj.magFilter        = opt.magFilter;
	obj.wrapS            = opt.wrapS;
	obj.wrapT            = opt.wrapT;
	obj.isDepth          = opt.isDepth;
	obj.depthMode        = opt.depthMode;
	obj.depthCompareMode = opt.depthCompareMode;
	obj.depthCompareFunc = opt.depthCompareFunc;

	return obj;
}

function sglTextureCubeFromImages(gl, images, options) {
	var opt = sglGetTextureOptions(gl, options);

	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);

	var flipYEnabled  = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
	var flipYRequired = (opt.flipY === true);
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYRequired) ? (1) : (0)));
	}
	for (var i=0; i<6; ++i) {
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
	}
	if (flipYEnabled != flipYRequired) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ((flipYEnabled) ? (1) : (0)));
	}
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, opt.minFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, opt.magFilter);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,     opt.wrapS    );
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,     opt.wrapT    );
	if (opt.generateMipmap) {
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	}
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	var obj = new SglTextureInfo();
	obj.handle           = tex;
	obj.valid            = true;
	obj.target           = gl.TEXTURE_CUBE_MAP;
	obj.format           = gl.RGBA;
	obj.width            = images[0].width;
	obj.height           = images[0].height;
	obj.minFilter        = opt.minFilter;
	obj.magFilter        = opt.magFilter;
	obj.wrapS            = opt.wrapS;
	obj.wrapT            = opt.wrapT;
	obj.isDepth          = false;
	obj.depthMode        = 0;
	obj.depthCompareMode = 0;
	obj.depthCompareFunc = 0;

	return obj;
}

function sglTextureCubeFromUrls(gl, urls, options) {
	var opt = sglGetTextureOptions(gl, options);
	var obj = new SglTextureInfo();

	var remaining = 6;
	var images = new Array(6);
	for (var i=0; i<6; ++i) {
		images[i] = new Image();
	}
	var watcher = function() {
		remaining--;
		if (remaining == 0) {
			var texInfo = sglTextureCubeFromImages(gl, images, opt);
			for (var a in texInfo) {
				obj[a] = texInfo[a];
			}
			if (opt.onload) {
				opt.onload(gl, obj, urls);
			}
		}
	};
	for (var i=0; i<6; ++i) {
		images[i].onload = watcher;
		images[i].src    = urls[i];
	}

	return obj;
}
/***********************************************************************/


// SglRenderbufferInfo
/***********************************************************************/
/**
 * Constructs a SglRenderbufferInfo.
 * @class Holds information about a WebGL renderbuffer object.
 */
function SglRenderbufferInfo() {
	this.handle    = null;
	this.valid     = false;
	this.target    = 0;
	this.format    = 0;
	this.width     = 0;
	this.height    = 0;
}

function sglRenderbufferFromFormat(gl, format, width, height) {
	var rb = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
	gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	var obj = new SglRenderbufferInfo();
	obj.handle = rb;
	obj.valid  = true;
	obj.target = gl.RENDERBUFFER;
	obj.format = format;
	obj.width  = width;
	obj.height = height;

	return obj;
}
/***********************************************************************/


// SglFramebufferInfo
/***********************************************************************/
function sglGetFramebufferOptions(gl, options) {
	var opt = {
		minFilter             : gl.LINEAR,
		magFilter             : gl.LINEAR,
		wrapS                 : gl.CLAMP_TO_EDGE,
		wrapT                 : gl.CLAMP_TO_EDGE,
		isDepth               : false,
		depthMode             : gl.LUMINANCE,
		depthCompareMode      : gl.COMPARE_R_TO_TEXTURE,
		depthCompareFunc      : gl.LEQUAL,
		colorsAsRenderbuffer  : false,
		depthAsRenderbuffer   : false,
		stencilAsRenderbuffer : false,
		generateColorsMipmap  : false,
		generateDepthMipmap   : false,
		generateStencilMipmap : false
	};
	return _sglConsolidateOptions(opt, options);
}

/**
 * Constructs a SglFramebufferInfo.
 * @class Holds information about a WebGL framebuffer object.
 */
function SglFramebufferInfo() {
	this.handle        = null;
	this.valid         = false;
	this.width         = 0;
	this.height        = 0;
	this.colorTargets  = [ ];
	this.depthTarget   = null;
	this.stencilTarget = null;
	this.status        = 0;
}

function sglFramebufferFromTargets(gl, colorTargets, depthTarget, stencilTarget, options) {
	var opt = sglGetFramebufferOptions(gl, options);

	var fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

	if ((depthTarget != undefined) && (depthTarget != null) && (depthTarget != gl.NONE)) {
		if (depthTarget.target == gl.TEXTURE_2D) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTarget.handle, 0);
		}
		else if (depthTarget.target == gl.RENDERBUFFER) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthTarget.handle);
		}
	}

	if ((stencilTarget != undefined) && (stencilTarget != null) && (stencilTarget != gl.NONE)) {
		if (stencilTarget.target == gl.TEXTURE_2D) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, stencilTarget.handle, 0);
		}
		else if (stencilTarget.target == gl.RENDERBUFFER) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencilTarget.handle);
		}
	}

	var cts = [ ];
	var drawBuffers = [ ];
	if ((colorTargets != undefined) && (colorTargets != null)) {
		var n = colorTargets.length;
		if (n == 0) {
			drawBuffers.push(gl.NONE);
			//gl.readBuffer(gl.NONE);
		}
		else {
			var att = gl.COLOR_ATTACHMENT0;
			for (var c in colorTargets) {
				var ct = colorTargets[c];
				if (ct.target == gl.TEXTURE_2D) {
					gl.framebufferTexture2D(gl.FRAMEBUFFER, att, gl.TEXTURE_2D, ct.handle, 0);
				}
				else if (ct.target == gl.RENDERBUFFER) {
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, att, gl.RENDERBUFFER, ct.handle);
				}
				drawBuffers.push(att);
				cts.push(ct);
				att++;
			}
		}
	}
	//gl.drawBuffers(drawBuffers);
	var fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	var trg = null;
	if (cts.length > 0) {
		trg = cts[0];
	}
	else if (depthTarget) {
		trg = depthTarget;
	}
	else if (stencilTarget) {
		trg = stencilTarget;
	}

	var width  = 0;
	var height = 0;
	if (trg) {
		width  = trg.width;
		height = trg.height;
	}

	var obj = new SglFramebufferInfo()
	obj.handle        = fb;
	obj.valid         = (fbStatus == gl.FRAMEBUFFER_COMPLETE);
	obj.width         = width;
	obj.height        = height;
	obj.colorTargets  = cts;
	obj.depthTarget   = (depthTarget  ) ? (depthTarget  ) : (null);
	obj.stencilTarget = (stencilTarget) ? (stencilTarget) : (null);
	obj.status        = fbStatus;

	return obj;
}

function sglFramebufferFromFormats(gl, width, height, colorFormats, depthFormat, stencilFormat, options) {
	var opt = sglGetFramebufferOptions(gl, options);

	var colorTargets = null;
	if (colorFormats) {
		opt.isDepth = false;
		colorTargets = [ ];
		var ct = null;
		if (opt.colorsAsRenderbuffer) {
			for (var c in colorFormats) {
				var cc = colorFormats[c];
				ct = sglRenderbufferFromFormat(gl, cc, width, height);
				colorTargets.push(ct);
			}
		}
		else {
			opt.generateMipmap = opt.generateColorsMipmap;
			for (var c in colorFormats) {
				var cc = colorFormats[c];
				ct = sglTexture2DFromData(gl, cc, width, height, gl.RGBA, gl.UNSIGNED_BYTE, null, opt);
				colorTargets.push(ct);
			}
		}
	}

	var depthTarget = null;
	if (depthFormat) {
		opt.isDepth = true;
		if (opt.depthAsRenderbuffer) {
			depthTarget = sglRenderbufferFromFormat(gl, depthFormat, width, height);
		}
		else {
			opt.generateMipmap = opt.generateDepthMipmap;
			depthTarget = sglTexture2DFromData(gl, depthFormat, width, height, gl.DEPTH_COMPONENT, gl.FLOAT, null, opt);
		}
	}

	var stencilTarget = null;
	if (stencilFormat) {
		opt.isDepth = false;
		if (opt.stencilAsRenderbuffer) {
			stencilTarget = sglRenderbufferFromFormat(gl, stencilFormat, width, height);
		}
		else {
			opt.generateMipmap = opt.generateStencilMipmap;
			stencilTarget = sglTexture2DFromData(gl, stencilFormat, width, height, gl.STENCIL_COMPONENT, gl.UNSIGNED_BYTE, null, opt);
		}
	}

	return sglFramebufferFromTargets(gl, colorTargets, depthTarget, stencilTarget, opt);
}
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglVertexBuffer
/***********************************************************************/
// SglVertexBuffer(gl, info)
// SglVertexBuffer(gl, values, usage)
/**
 * Constructs a SglVertexBuffer.
 * @class Manages a WebGL vertex buffer object.
 */
function SglVertexBuffer() {
	this.gl    = arguments[0];
	this._info = null;
	if (arguments[1] instanceof SglBufferInfo) {
		this._info = arguments[1];
	}
	else {
		this._info = sglVertexBufferFromData(this.gl, arguments[1], arguments[2]);
	}
}

SglVertexBuffer.prototype = {
	get info() { return this._info; },

	destroy : function() {
		if (this._info.valid) {
			this.gl.deleteBuffer(this._info.handle);
		}
		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	bind : function() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._info.handle);
	},

	unbind : function() {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	}
};
/***********************************************************************/


// SglIndexBuffer
/***********************************************************************/
// SglIndexBuffer(gl, info)
// SglIndexBuffer(gl, values, usage)
/**
 * Constructs a SglIndexBuffer.
 * @class Manages a WebGL index buffer object.
 */
function SglIndexBuffer() {
	this.gl    = arguments[0];
	this._info = null;
	if (arguments[1] instanceof SglBufferInfo) {
		this._info = arguments[1];
	}
	else {
		this._info = sglIndexBufferFromData(this.gl, arguments[1], arguments[2]);
	}
}

SglIndexBuffer.prototype = {
	get info() { return this._info; },

	destroy : function() {
		if (this._info.valid) {
			this.gl.deleteBuffer(this._info.handle);
		}
		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	bind : function() {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._info.handle);
	},

	unbind : function() {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	}
};
/***********************************************************************/


// SglProgramAttribute
/***********************************************************************/
/**
 * Constructs a SglProgramAttribute.
 * @class Manages a program attribute.
 */
function SglProgramAttribute(program, info) {
	this._prog = program;
	this._info = info;
}

SglProgramAttribute.prototype = {
	set index(n) {
		this._prog.gl.bindAttribLocation(this._prog._info.handle, n, this._info.name)
		this._info.location = n;
	},

	get index () {
		return this._info.location;
	}
};
/***********************************************************************/


// SglProgramUniform
/***********************************************************************/
/**
 * Constructs a SglProgramUniform.
 * @class Manages a program uniform.
 */
function SglProgramUniform(program, info) {
	this._prog = program;
	this._info = info;
	this._func = null;

	var gl   = this._prog.gl;
	var type = this._info.nativeType;

	if (type == gl.BOOL) {
		this._func = function (v) { this._prog.gl.uniform1i(this._info.location, v); };
	}
	else if (type == gl.BOOL_VEC2) {
		this._func = function (v) { this._prog.gl.uniform2iv(this._info.location, v); };
	}
	else if (type == gl.BOOL_VEC3) {
		this._func = function (v) { this._prog.gl.uniform3iv(this._info.location, v); };
	}
	else if (type == gl.BOOL_VEC4) {
		this._func = function (v) { this._prog.gl.uniform4iv(this._info.location, v); };
	}
	else if (type == gl.INT) {
		this._func = function (v) { this._prog.gl.uniform1i(this._info.location, v); };
	}
	else if (type == gl.INT_VEC2) {
		this._func = function (v) { this._prog.gl.uniform2iv(this._info.location, v); };
	}
	else if (type == gl.INT_VEC3) {
		this._func = function (v) { this._prog.gl.uniform3iv(this._info.location, v); };
	}
	else if (type == gl.INT_VEC4) {
		this._func = function (v) { this._prog.gl.uniform4iv(this._info.location, v); };
	}
	else if (type == gl.FLOAT) {
		this._func = function (v) { this._prog.gl.uniform1f(this._info.location, v); };
	}
	else if (type == gl.FLOAT_VEC2) {
		this._func = function (v) { this._prog.gl.uniform2fv(this._info.location, v); };
	}
	else if (type == gl.FLOAT_VEC3) {
		this._func = function (v) { this._prog.gl.uniform3fv(this._info.location, v); };
	}
	else if (type == gl.FLOAT_VEC4) {
		this._func = function (v) { this._prog.gl.uniform4fv(this._info.location, v); };
	}
	else if (type == gl.FLOAT_MAT2) {
		this._func = function (v) { this._prog.gl.uniformMatrix2fv(this._info.location, this._prog.gl.FALSE, v); };
	}
	else if (type == gl.FLOAT_MAT3) {
		this._func = function (v) { this._prog.gl.uniformMatrix3fv(this._info.location, this._prog.gl.FALSE, v); };
	}
	else if (type == gl.FLOAT_MAT4) {
		this._func = function (v) { this._prog.gl.uniformMatrix4fv(this._info.location, this._prog.gl.FALSE, v); };
	}
	else {
		sglUnknown();
	}
}

SglProgramUniform.prototype = {
	set value(v) {
		this._func(v);
	},

	get value() {
		return this._prog.gl.getUniform(this._prog._info.handle, this._info.location);
	}
};
/***********************************************************************/


// SglProgramSampler
/***********************************************************************/
/**
 * Constructs a SglProgramSampler.
 * @class Manages a program sampler.
 */
function SglProgramSampler(program, info) {
	this._prog = program;
	this._info = info;
	this._unit = -1;

	var gl   = this._prog.gl;
	var type = this._info.nativeType;

	if (type == gl.SAMPLER_2D) {
		;
	}
	else if (type == gl.SAMPLER_CUBE) {
		;
	}
	else if (type == 35682) {
		;
	}
	else {
		sglUnknown();
	}
}

SglProgramSampler.prototype = {
	set unit(n) {
		this._prog.gl.uniform1i(this._info.location, n);
		this._unit = n;
	},

	get unit() {
		//return this._prog.gl.getUniform(this._prog._info.handle, this._info.location);
		return this._unit;
	}
};
/***********************************************************************/


// SglProgram
/***********************************************************************/
// SglProgram(gl, info)
// SglProgram(gl, [vertexSources], [fragmentSources])
/**
 * Constructs a SglProgram.
 * @class Manages a WebGL program object.
 */
function SglProgram() {
	this.gl    = arguments[0];
	this._info = null;

	if (arguments[1] instanceof SglProgramInfo) {
		this._info = arguments[1];
	}
	else {
		this._info = sglProgramFromSources(this.gl, arguments[1], arguments[2]);
	}

	this._attributes = new Object();
	for (var a in this._info.attributes) {
		this._attributes[a] = new SglProgramAttribute(this, this._info.attributes[a]);
	}

	this._uniforms = new Object();
	for (var u in this._info.uniforms) {
		this._uniforms[u] = new SglProgramUniform(this, this._info.uniforms[u]);
	}

	var unit = 0;
	this._samplers = new Object();
	for (var s in this._info.samplers) {
		this._samplers[s] = new SglProgramSampler(this, this._info.samplers[s]);
		this._samplers[s]._unit = unit;
		unit++;
	}
}

SglProgram.prototype =
{
	get info()       { return this._info;        },
	get attributes() { return this._attributes;  },
	get uniforms()   { return this._uniforms;    },
	get samplers()   { return this._samplers;    },

	destroy : function() {
		if (this._info.valid == null) return;

		var gl = this.gl;

		gl.deleteProgram(this._info.handle);
		for (var s in this._info.shaders) {
			gl.deleteShader(this._info.shaders[s].handle);
		}

		this._attributes = null;
		this._uniforms   = null;
		this._samplers   = null;

		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	get log() {
		var log = "";
		log += "-------------------------------------\n";
		for (var s in this._info.shaders) {
			log += this._info.shaders[s].log;
		}
		log += this._info.log;
		log += "-------------------------------------\n";
		log += "\n";
		return log;
	},

	setDefaultBindings : function() {
		sglSetDefaultProgramBindings(this.gl, this._info);
	},

	synchronize : function() {
		sglProgramSynchronize(this.gl, this._info);
	},

	bind : function() {
		this.gl.useProgram(this._info.handle);
	},

	unbind : function() {
		//this.gl.useProgram(null);
	},

	setAttributes : function(mapping) {
		var attr = null;
		for (var a in mapping) {
			attr = this._attributes[a];
			if (attr) {
				attr.index = mapping[a];
			}
		}
		this.link();
	},

	setUniforms : function(mapping) {
		var unif = null;
		for (var u in mapping) {
			unif = this._uniforms[u];
			if (unif) {
				unif.value = mapping[u];
			}
		}
	},

	setSamplers : function(mapping) {
		var smp = null;
		for (var s in mapping) {
			smp = this._samplers[s];
			if (smp != undefined) {
				smp.unit = mapping[s];
			}
		}
	}
};
/***********************************************************************/


// SglTexture2D
/***********************************************************************/
// SglTexture2D(gl, info)
// SglTexture2D(gl, internalFormat, width, height, sourceFormat, sourceType, texels, options)
// SglTexture2D(gl, image, options)
// SglTexture2D(gl, url, options)
/**
 * Constructs a SglTexture2D.
 * @class Manages a WebGL 2D texture object.
 */
function SglTexture2D() {
	this.gl    = arguments[0];
	this._info = null;

	var gl = this.gl;

	var n = arguments.length;
	if ((n == 2) || (n == 3)) {
		if (arguments[1] instanceof Image) {
			this._info = sglTexture2DFromImage(gl, arguments[1], arguments[2]);
		}
		//else if (arguments[1] instanceof String) {
		else if (typeof(arguments[1]) == "string") {
			this._info = sglTexture2DFromUrl(gl, arguments[1], arguments[2]);
		}
		else {
			this._info = arguments[1];
		}
	}
	else {
		this._info = sglTexture2DFromData(gl, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
	}
}

SglTexture2D.prototype = {
	get info() { return this._info; },

	destroy : function() {
		if (this._info.handle == null) return;
		this.gl.deleteTexture(this._info.handle);
		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	bind : function(unit) {
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.gl.bindTexture(this._info.target, this._info.handle);
	},

	unbind : function(unit) {
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.gl.bindTexture(this._info.target, null);
	},

	generateMipmap : function() {
		this.gl.generateMipmap(this._info.target);
	}
};
/***********************************************************************/


// SglTextureCube
/***********************************************************************/
// SglTextureCube(gl, info)
// SglTextureCube(gl, internalFormat, width, height, sourceFormat, sourceType, facesTexels, options)
// SglTextureCube(gl, images, options)
// SglTextureCube(gl, urls, options)
/**
 * Constructs a SglTextureCube.
 * @class Manages a WebGL cube texture object.
 */
function SglTextureCube() {
	this.gl    = arguments[0];
	this._info = null;

	var gl = this.gl;

	var n = arguments.length;
	if ((n == 2) || (n == 3)) {
		if (arguments[1] instanceof Array) {
			if (arguments[1][0] instanceof Image) {
				this._info = sglTextureCubeFromImages(gl, arguments[1], arguments[2]);
			}
			//else if (arguments[1] instanceof String) {
			else if (typeof(arguments[1][0]) == "string") {
				this._info = sglTextureCubeFromUrls(gl, arguments[1], arguments[2]);
			}
		}
		else {
			this._info = arguments[1];
		}
	}
	else {
		this._info = sglTextureCubeFromData(gl, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
	}
}

SglTextureCube.prototype = {
	get info() { return this._info; },

	destroy : function() {
		if (this._info.handle == null) return;
		this.gl.deleteTexture(this._info.handle);
		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	bind : function(unit) {
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.gl.bindTexture(this._info.target, this._info.handle);
	},

	unbind : function(unit) {
		this.gl.activeTexture(this.gl.TEXTURE0 + unit);
		this.gl.bindTexture(this._info.target, null);
	},

	generateMipmap : function() {
		this.gl.generateMipmap(this._info.target);
	}
};
/***********************************************************************/


// SglRenderbuffer
/***********************************************************************/
// SglRenderbuffer(gl, info)
// SglRenderbuffer(gl, format, width, height)
/**
 * Constructs a SglRenderbuffer.
 * @class Manages a WebGL renderbuffer object.
 */
function SglRenderbuffer() {
	this.gl    = arguments[0];
	this._info = null;

	var gl = this.gl;

	var n = arguments.length;
	if (n == 2) {
		this._info = arguments[1];
	}
	else {
		this._info = sglRenderbufferFromFormat(gl, arguments[1], arguments[2], arguments[3]);
	}
}

SglRenderbuffer.prototype = {
	get info() { return this._info; },

	destroy : function() {
		if (this._info.handle == null) return;
		this.gl.deleteRenderbuffer(this._info.handle);
		this._info = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	bind : function() {
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this._info.handle);
	},

	unbind : function() {
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	}
};
/***********************************************************************/


// SglFramebuffer
/***********************************************************************/
// SglFramebuffer(gl, info)
// SglFramebuffer(gl, width, height, colorFormats, depthFormat, stencilFormat, options)
/**
 * Constructs a SglFramebuffer.
 * @class Manages a WebGL framebuffer object.
 */
function SglFramebuffer() {
	this.gl    = arguments[0];
	this._info = null;

	var gl = this.gl;

	var n = arguments.length;
	if (n == 2) {
		this._info = arguments[1];
	}
	else {
		this._info = sglFramebufferFromFormats(gl, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
	}

	var s = null;
	var t = null;

	this._colorTargets = [ ];
	for (var c in this._info.colorTargets) {
		s = this._info.colorTargets[c];
		t = null;
		if (s.target == gl.TEXTURE_2D) {
			t = new SglTexture2D(gl, s);
		}
		else if (s.target == gl.RENDERBUFFER) {
			t = new SglRenderbuffer(gl, s);
		}
		this._colorTargets.push(t);
	}

	this._depthTarget = null;
	if (this._info.depthTarget) {
		s = this._info.depthTarget;
		t = null;
		if (s.target == gl.TEXTURE_2D) {
			t = new SglTexture2D(gl, s);
		}
		else if (s.target == gl.RENDERBUFFER) {
			t = new SglRenderbuffer(gl, s);
		}
		this._depthTarget = t;
	}

	this._stencilTarget = null;
	if (this._info.stencilTarget) {
		s = this._info.stencilTarget;
		t = null;
		if (s.target == gl.TEXTURE_2D) {
			t = new SglTexture2D(gl, s);
		}
		else if (s.target == gl.RENDERBUFFER) {
			t = new SglRenderbuffer(gl, s);
		}
		this._stencilTarget = t;
	}
}

SglFramebuffer.prototype = {
	get info()          { return this._info;          },
	get colorTargets()  { return this._colorTargets;  },
	get depthTarget()   { return this._depthTarget;   },
	get stencilTarget() { return this._stencilTarget; },

	destroy : function() {
		if (this._info.handle == null) return;
		this.gl.deleteFramebuffer(this._info.handle);
		for (var t in this._colorTargets) {
			var ct = this._colorTargets[t];
			if (ct) {
				this._colorTargets[t].destroy();
			}
		}
		if (this._depthTarget) {
			this._depthTarget.destroy();
		}
		if (this._stencilTarget) {
			this._stencilTarget.destroy();
		}
		this._info   = null;
		this.targets = null;
	},

	get handle() {
		return this._info.handle;
	},

	get isValid() {
		return this._info.valid;
	},

	get width() {
		return this._info.width;
	},

	get height() {
		return this._info.height;
	},

	bind : function(setViewport) {
		var vp = true;
		if (setViewport != undefined) vp = setViewport;

		if (vp) {
			this.gl.viewport(0, 0, this._info.width, this._info.height);
		}

		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._info.handle);
	},

	unbind : function() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	},

	bindColor : function(index, unit) {
		this._colorTargets[index].bind(unit);
	},

	unbindColor : function(index, unit) {
		this._colorTargets[index].unbind(unit);
	},

	bindDepth : function(unit) {
		this._depthTarget.bind(unit);
	},

	unbindDepth : function(unit) {
		this._depthTarget.unbind(unit);
	},

	bindStencil : function(unit) {
		this._stencilTarget.bind(unit);
	},

	unbindStencil : function(unit) {
		this._stencilTarget.unbind(unit);
	},

	generateMipmap : function(colors, depth, stencil) {
		var t = null;

		if (colors) {
			for (var c in this._colorTargets) {
				t = this._colorTargets[c];
				if (!t) continue;
				if (t.info.target == this.gl.TEXTURE_2D) {
					t.bind(0);
					t.generateMipmap();
					t.unbind(0);
				}
			}
		}

		if (depth) {
			t = this._depthTarget;
			if (t) {
				if (t.info.target == this.gl.TEXTURE_2D) {
					t.bind(0);
					t.generateMipmap();
					t.unbind(0);
				}
			}
		}

		if (stencil) {
			t = this._stencilTarget;
			if (t) {
				if (t.info.target == this.gl.TEXTURE_2D) {
					t.bind(0);
					t.generateMipmap();
					t.unbind(0);
				}
			}
		}
	},

	attachColorTarget : function(index, t) {
		if (!t) return false;
		if ((index < 0) || (index >= this._colorTargets.length)) return false;
		if ((t.width != this.width) || (t.height != this.height)) return false;

		var gl = this.gl;

		var att = this.gl.COLOR_ATTACHMENT0 + index;
		if (t.target == gl.TEXTURE_2D) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, att, gl.TEXTURE_2D, t.handle, 0);
		}
		else if (t.target == gl.RENDERBUFFER) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, att, gl.RENDERBUFFER, t.handle);
		}

		this._colorTargets[index] = t;

		return true;
	},

	detachColorTarget : function(index) {
		if ((index < 0) || (index >= this._colorTargets.length)) return false;

		var t = this._colorTargets[index]
		if (!t) return false;

		var gl = this.gl;

		if (t.target == gl.TEXTURE_2D) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, att, gl.TEXTURE_2D, null, 0);
		}
		else if (t.target == gl.RENDERBUFFER) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, att, gl.RENDERBUFFER, null);
		}

		this._colorTargets[index] = null;

		return true;
	}
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglAttributeStreamJS
/***************************************************************/
/**
 * Constructs a SglAttributeStreamJS.
 * @class Holds the properties and the storage array of a vertex attribute stream.
 */
function SglAttributeStreamJS(name, size, values, byCopy) {
	this._name = name;
	this._size = size;
	this._buff = (byCopy) ? ((values) ? (values.slice()) : (null)) : (values);
}

SglAttributeStreamJS.prototype = {
	get name()       { return this._name; },
	get size()       { return this._size; },
	get buffer()     { return this._buff; },
	get length()     { return this._buff.length; },

	get : function(index) {
		return this._buff.slice(index * this._size, this._size);
	},

	set : function(index, value) {
		var k = index * this._size;
		for (var i=0; i<this._size; ++i) {
			this._buff[k++] = value[i];
		}
		return r;
	}
};
/***************************************************************/


// SglVertexStreamJS
/***************************************************************/
/**
 * Constructs a SglVertexStreamJS.
 * @class Container of vertex attribute streams.
 */
function SglVertexStreamJS() {
	this._attribs = { };
	this._length  = 0;
}

SglVertexStreamJS.prototype = {
	get attributes() { return this._attribs; },
	get length()     { return this._length;  },

	addAttribute : function(name, size, values, byCopy) {
		var attr = new SglAttributeStreamJS(name, size, values, byCopy);
		this._attribs[name] = attr;
		this._length = attr.length;
	},

	removeAttribute : function(name) {
		if (!this._attribs[name]) return;

		delete this._attribs[name];

		this._length = 0;
		for (var a in this._attribs) {
			this._length = this._attribs[a].length;
			break;
		}
	}
};
/***************************************************************/


const SGL_ARRAY_PRIMITIVE_STREAM          = 1;
const SGL_INDEXED_PRIMITIVE_STREAM        = 2;
const SGL_PACKED_INDEXED_PRIMITIVE_STREAM = 3;

const SGL_POINTS_LIST    = 1;
const SGL_LINES_LIST     = 2;
const SGL_LINE_STRIP     = 3;
const SGL_LINE_LOOP      = 4;
const SGL_TRIANGLES_LIST = 5;
const SGL_TRIANGLE_STRIP = 6;
const SGL_TRIANGLE_FAN   = 7;


// SglPrimitiveStreamJS
/***************************************************************/
/**
 * Constructs a SglPrimitiveStreamJS.
 * @class Holds the primitives stream information and storage (if any).
 */
function SglPrimitiveStreamJS(name, mode, first, length) {
	this._name = name;
	this._mode = mode;
	this._first  = (first)  ? (first)  : (0);
	this._length = (length) ? (length) : (0);
}

SglPrimitiveStreamJS.prototype = {
	get type()   { return undefined;    },
	get name()   { return this._name;   },
	get mode()   { return this._mode;   },
	get first()  { return this._first;  },
	get length() { return this._length; }
}
/***************************************************************/


// SglArrayPrimitiveStreamJS
/***************************************************************/
/**
 * Constructs a SglArrayPrimitiveStreamJS.
 * @class Holds the array primitive stream information.
 */
function SglArrayPrimitiveStreamJS(name, mode, first, count) {
	SglPrimitiveStreamJS.call(this, name, mode, first, count);
}

sglInherit(SglArrayPrimitiveStreamJS, SglPrimitiveStreamJS);

sglDefineGetter(SglArrayPrimitiveStreamJS, "type", function() {
	return SGL_ARRAY_PRIMITIVE_STREAM;
});
/***************************************************************/


// SglIndexedPrimitiveStreamJS
/***************************************************************/
/**
 * Constructs a SglIndexedPrimitiveStreamJS.
 * @class Holds the indexed primitive stream information and storage.
 */
function SglIndexedPrimitiveStreamJS(name, mode, indices, byCopy) {
	SglPrimitiveStreamJS.call(this, name, mode, 0, indices.length);

	this._buff = (byCopy) ? ((indices) ? (indices.slice()) : (null)) : (indices);
}

sglInherit(SglIndexedPrimitiveStreamJS, SglPrimitiveStreamJS);

sglDefineGetter(SglIndexedPrimitiveStreamJS, "type", function() {
	return SGL_INDEXED_PRIMITIVE_STREAM;
});

sglDefineGetter(SglIndexedPrimitiveStreamJS, "buffer", function() {
	return this._buff;
});

sglDefineGetter(SglIndexedPrimitiveStreamJS, "length", function() {
	return this._buff.length;
});
/***************************************************************/


// SglConnectivityJS
/***************************************************************/
/**
 * Constructs a SglConnectivityJS.
 * @class Container for primitive streams.
 */
function SglConnectivityJS() {
	this._prims = { };
}

SglConnectivityJS.prototype = {
	get primitives() { return this._prims; },

	addArrayPrimitives : function(name, mode, first, count) {
		var prim = new SglArrayPrimitiveStreamJS(name, mode, first, count)
		this._prims[name] = prim;
	},

	addIndexedPrimitives : function(name, mode, indices, byCopy) {
		var prim = new SglIndexedPrimitiveStreamJS(name, mode, indices, byCopy)
		this._prims[name] = prim;
	},

	removePrimitives : function(name) {
		if (!this._prims[name]) return;
		delete this._prims[name];
	}
};
/***************************************************************/


// SglMeshJS
/***************************************************************/
/**
 * Constructs a SglMeshJS.
 * @class Mesh definition with vertex stream and primitive stream.
 */
function SglMeshJS() {
	this._valid = false;
	this._vert  = new SglVertexStreamJS();
	this._conn  = new SglConnectivityJS();
}

SglMeshJS.prototype = {
	get isValid()      { return this._valid;  },
	set isValid(value) { this._valid = value; },

	get vertices()     { return this._vert; },
	get connectivity() { return this._conn; },

	addVertexAttribute : function(name, size, values, byCopy) {
		this._vert.addAttribute(name, size, values, byCopy);
	},

	removeVertexAttribute : function(name) {
		this._vert.removeAttribute(name);
	},

	addArrayPrimitives : function(name, mode, first, count) {
		this._conn.addArrayPrimitives(name, mode, first, count);
	},

	addIndexedPrimitives : function(name, mode, indices, byCopy) {
		this._conn.addIndexedPrimitives(name, mode, indices, byCopy);
	},

	removePrimitives : function(name) {
		this._conn.removePrimitives(name);
	}
};
/***************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// importers
/***********************************************************************/
function sglMeshJSImportOBJFromString(mesh, text) {
	var positionsArray = [ ];
	var texcoordsArray = [ ];
	var normalsArray   = [ ];
	var indicesArray   = [ ];

	var positions = [ ];
	var texcoords = [ ];
	var normals   = [ ];
	var facemap   = { };
	var index     = 0;

	var line = null;
	var f   = null;
	var pos = 0;
	var tex = 0;
	var nor = 0;
	var x   = 0.0;
	var y   = 0.0;
	var z   = 0.0;
	var tokens = null;

	var hasPos = false;
	var hasTex = false;
	var hasNor = false;

	var lines = text.split("\n");
	for (var lineIndex in lines) {
		line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");

		if (line[0] == "#") continue;

		tokens = line.split(" ");
		if (tokens[0] == "v") {
			positions.push(parseFloat(tokens[1]));
			positions.push(parseFloat(tokens[2]));
			positions.push(parseFloat(tokens[3]));
		}
		else if (tokens[0] == "vt") {
			texcoords.push(parseFloat(tokens[1]));
			texcoords.push(parseFloat(tokens[2]));
		}
		else if (tokens[0] == "vn") {
			normals.push(parseFloat(tokens[1]));
			normals.push(parseFloat(tokens[2]));
			normals.push(parseFloat(tokens[3]));
		}
		else if (tokens[0] == "f") {
			if (tokens.length != 4) continue;

			for (var i=1; i<4; ++i) {
				if (!(tokens[i] in facemap)) {
					f = tokens[i].split("/");

					if (f.length == 1) {
						pos = parseInt(f[0]) - 1;
						tex = pos;
						nor = pos;
					}
					else if (f.length == 3) {
						pos = parseInt(f[0]) - 1;
						tex = parseInt(f[1]) - 1;
						nor = parseInt(f[2]) - 1;
					}
					else {
						return false;
					}

					x = 0.0;
					y = 0.0;
					z = 0.0;
					if ((pos * 3 + 2) < positions.length) {
						hasPos = true;
						x = positions[pos*3+0];
						y = positions[pos*3+1];
						z = positions[pos*3+2];
					}
					positionsArray.push(x);
					positionsArray.push(y);
					positionsArray.push(z);

					x = 0.0;
					y = 0.0;
					if ((tex * 2 + 1) < texcoords.length) {
						hasTex = true;
						x = texcoords[tex*2+0];
						y = texcoords[tex*2+1];
					}
					texcoordsArray.push(x);
					texcoordsArray.push(y);

					x = 0.0;
					y = 0.0;
					z = 1.0;
					if ((nor * 3 + 2) < normals.length) {
						hasNor = true;
						x = normals[nor*3+0];
						y = normals[nor*3+1];
						z = normals[nor*3+2];
					}
					normalsArray.push(x);
					normalsArray.push(y);
					normalsArray.push(z);

					facemap[tokens[i]] = index++;
				}

				indicesArray.push(facemap[tokens[i]]);
			}
		}
	}

	if (hasPos) {
		mesh.addVertexAttribute("position", 3, positionsArray, false);
	}
	if (hasNor) {
		mesh.addVertexAttribute("normal", 3, normalsArray, false);
	}
	if (hasTex) {
		mesh.addVertexAttribute("texcoord", 2, texcoordsArray, false);
	}

	if (indicesArray.length > 0) {
		mesh.addIndexedPrimitives("triangles", SGL_TRIANGLES_LIST, indicesArray, false);
	}

	return true;
}

function sglMeshJSImportOBJFromURL(mesh, url, asynch, callback) {
	mesh.isValid = false;

	if (!asynch) {
		var txt = sglLoadFile(url);
		mesh.isValid = sglMeshJSImportOBJFromString(mesh, txt);
		if (callback) {
			callback(mesh, url);
		}
		return mesh.isValid;
	}

	sglLoadFile(url, function(txt) {
		mesh.isValid = sglMeshJSImportOBJFromString(mesh, txt);
		if (callback) {
			callback(mesh, url);
		}
	});

	return true;
}

SglMeshJS.prototype.parseOBJ = function(txt) {
	this.isValid = sglMeshJSImportOBJFromString(this, txt);
	return this.isValid;
};

SglMeshJS.prototype.importOBJ = function(url, asynch, callback) {
	return sglMeshJSImportOBJFromURL(this, url, asynch, callback);
};

function _sglFindVertexAttributeJSON(m, name) {
	for (var a in m.vertices) {
		if (m.vertices[a].name === name) {
			return m.vertices[a];
		}
	}
	return null;
}

function _sglFindConnectivityJSON(m, name) {
	for (var a in m.connectivity) {
		if (m.connectivity[a].name === name) {
			return m.connectivity[a];
		}
	}
	return null;
}

function sglMeshJSImportJSONFromString(mesh, text) {
	var m = JSON.parse(text);
	if (!m) return false;

	var mapping = m.mapping;
	var stdMapping = null;
	for (var v in mapping) {
		if (mapping[v].name === "standard") {
			stdMapping = mapping[v];
			break;
		}
	}
	if (!stdMapping) return false;

	for (var a in stdMapping.attributes) {
		var vm = stdMapping.attributes[a];
		var vattr = _sglFindVertexAttributeJSON(m, vm.source);
		if (!vattr) continue;
		if (vattr.normalized) {
			for (var i=0, n=vattr.values.length; i<n; ++i) {
				vattr.values[i] /= 255.0;
			}
		}
		mesh.addVertexAttribute(vm.semantic, vattr.size, vattr.values, false);
	}

	var conn = _sglFindConnectivityJSON(m, stdMapping.primitives);
	if (!conn) return false;
	mesh.addIndexedPrimitives(conn.name, SGL_TRIANGLES_LIST, conn.indices, false);

	return true;
}

function sglMeshJSImportJSONFromURL(mesh, url, asynch, callback) {
	mesh.isValid = false;

	if (!asynch) {
		var txt = sglLoadFile(url);
		mesh.isValid = sglMeshJSImportJSONFromString(mesh, txt);
		if (callback) {
			callback(mesh, url);
		}
		return mesh.isValid;
	}

	sglLoadFile(url, function(txt) {
		mesh.isValid = sglMeshJSImportJSONFromString(mesh, txt);
		if (callback) {
			callback(mesh, url);
		}
	});

	return true;
}

SglMeshJS.prototype.parseJSON = function(txt) {
	this.isValid = sglMeshJSImportJSONFromString(this, txt);
	return this.isValid;
};

SglMeshJS.prototype.importJSON = function(url, asynch, callback) {
	return sglMeshJSImportJSONFromURL(this, url, asynch, callback);
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// utilities
/***************************************************************/
function sglGLTypeSize(gl, type) {
	if (type == gl.BYTE)           return 1;
	if (type == gl.UNSIGNED_BYTE)  return 1;
	if (type == gl.SHORT)          return 2;
	if (type == gl.UNSIGNED_SHORT) return 2;
	if (type == gl.INT)            return 4;
	if (type == gl.UNSIGNED_INT)   return 4;
	if (type == gl.FLOAT)          return 4;
	return null;
}

function sglGLTypeFromWebGLArray(gl, wglArray) {
	if (wglArray instanceof Int8Array   ) return gl.BYTE;
	if (wglArray instanceof Uint8Array  ) return gl.UNSIGNED_BYTE;
	if (wglArray instanceof Int16Array  ) return gl.SHORT;
	if (wglArray instanceof Uint16Array ) return gl.UNSIGNED_SHORT;
	if (wglArray instanceof Int32Array  ) return gl.INT;
	if (wglArray instanceof Uint32Array ) return gl.UNSIGNED_INT;
	if (wglArray instanceof Float32Array) return gl.FLOAT;
	return null;
}
/***************************************************************/


// SglAttributeStreamGL
/***************************************************************/
/**
 * Constructs a SglAttributeStreamGL.
 * @class Holds the properties and the storage buffer of a vertex attribute stream.
 */
function SglAttributeStreamGL(gl, name, size, values, normalized) {
	var type   = sglGLTypeFromWebGLArray(gl, values);
	var stride = sglGLTypeSize(gl, type) * size;

	this.gl      = gl;
	this._name   = name;
	this._size   = size;
	this._type   = type;
	this._norm   = (normalized) ? (true) : (false);
	this._stride = stride;
	this._offset = 0;
	this._length = values.length / size;
	this._buff   = new SglVertexBuffer(gl, values, { usage : gl.STATIC_DRAW });
}

SglAttributeStreamGL.prototype = {
	get name()         { return this._name;   },
	get size()         { return this._size;   },
	get type()         { return this._type;   },
	get isNormalized() { return this._norm;   },
	get stride()       { return this._stride; },
	get offset()       { return this._offset; },
	get buffer()       { return this._buff;   },
	get length()       { return this._length; },

	destroy : function() {
		this._buff.destroy();
	},

	bind : function(index, baseVertex) {
		var off = ((baseVertex) ? (baseVertex) : (0)) * this._stride;
		this._buff.bind();
		this.gl.vertexAttribPointer(index, this._size, this._type, this._norm, this._stride, this._offset + off);
	},

	unbind : function(index) {
		this._buff.unbind();
	}
};
/***************************************************************/


// SglVertexStreamGL
/***************************************************************/
/**
 * Constructs a SglVertexStreamGL.
 * @class Container of vertex attribute streams.
 */
function SglVertexStreamGL(gl) {
	this.gl       = gl;
	this._attribs = new Object();
	this._length  = 0;
}

SglVertexStreamGL.prototype = {
	get attributes() { return this._attribs; },
	get length()     { return this._length;  },

	destroy : function() {
		for (var attr in this._attribs) {
			this._attribs[attr].destroy();
		}
	},

	addAttribute : function(name, size, normalized, values) {
		var attr = new SglAttributeStreamGL(this.gl, name, size, normalized, values)
		this._attribs[name] = attr;
		this._length = attr.length;
	},

	removeAttribute : function(name, doDestroy) {
		if (!this._attribs[name]) return;

		if (doDestroy) {
			this._attribs[name].destroy();
		}

		delete this._attribs[name];

		this._length = 0;
		for (var a in this._attribs) {
			this._length = this._attribs[a].length;
			break;
		}
	},

	bind : function(mapping, baseVertex) {
		var vm = null;
		for (var m in mapping) {
			vm = this._attribs[m];
			if (vm) {
				vm.bind(mapping[m], baseVertex)
			}
		}
	},

	unbind : function(mapping) {
		var vm = null;
		for (var m in mapping) {
			vm = this._attribs[m];
			if (vm) {
				vm.unbind(mapping[m])
			}
		}
	}
};
/***************************************************************/


// SglPrimitiveStreamGL
/***************************************************************/
/**
 * Constructs a SglPrimitiveStreamGL.
 * @class Holds the primitives stream information and storage (if any).
 */
function SglPrimitiveStreamGL(gl, name, mode, first, length) {
	this.gl      = gl;
	this._name   = name;
	this._mode   = mode;
	this._first  = (first)  ? (first)  : (0);
	this._length = (length) ? (length) : (0);
}

SglPrimitiveStreamGL.prototype = {
	_clampRange : function(first, count) {
		var end = this._first + this._length;

		var f = this._first + ((first >= 0) ? (first) : (0));
		if (f >= end) return null;

		var c = (count >= 0) ? (count) : (this._length);
		var vEnd = (f + c);
		if (vEnd > end) c -= vEnd - end;

		return [f, c];
	},

	_render : function(first, count) {
		;
	},

	get type()   { return undefined;    },
	get name()   { return this._name;   },
	get mode()   { return this._mode;   },
	get first()  { return this._first;  },
	get length() { return this._length; },

	destroy : function() {
		if (this._destroy) {
			this._destroy();
		}
	},

	bind : function() {
		;
	},

	unbind : function() {
		;
	},

	render : function(first, count) {
		var range = this._clampRange(first, count);
		this._render(range[0], range[1]);
	}
}
/***************************************************************/


// SglArrayPrimitiveStreamGL
/***************************************************************/
/**
 * Constructs a SglArrayPrimitiveStreamGL.
 * @class Holds the array primitive stream information.
 */
function SglArrayPrimitiveStreamGL(gl, name, mode, first, count) {
	SglPrimitiveStreamGL.call(this, gl, name, mode, first, count);
}

sglInherit(SglArrayPrimitiveStreamGL, SglPrimitiveStreamGL);

sglDefineGetter(SglArrayPrimitiveStreamGL, "type", function() {
	return SGL_ARRAY_PRIMITIVE_STREAM;
});

SglArrayPrimitiveStreamGL.prototype._render = function(first, count) {
	this.gl.drawArrays(this._mode, first, count);
}
/***************************************************************/


// SglIndexedPrimitiveStreamGL
/***************************************************************/
/**
 * Constructs a SglIndexedPrimitiveStreamGL.
 * @class Holds the indexed primitive stream information and storage.
 */
function SglIndexedPrimitiveStreamGL(gl, name, mode, indices) {
	SglPrimitiveStreamGL.call(this, gl, name, mode, 0, indices.length);

	var type   = sglGLTypeFromWebGLArray(gl, indices);
	var stride = sglGLTypeSize(gl, type);

	this._idxType = type;
	this._stride  = stride;
	this._buff    = new SglIndexBuffer(gl, indices, { usage : gl.STATIC_DRAW });
}

sglInherit(SglIndexedPrimitiveStreamGL, SglPrimitiveStreamGL);

sglDefineGetter(SglIndexedPrimitiveStreamGL, "indexType", function() {
	return this._idxType;
});

sglDefineGetter(SglIndexedPrimitiveStreamGL, "stride", function() {
	return this._stride;
});

sglDefineGetter(SglIndexedPrimitiveStreamGL, "type", function() {
	return SGL_INDEXED_PRIMITIVE_STREAM;
});

SglIndexedPrimitiveStreamGL.prototype._destroy = function() {
	this._buff.destroy();
	this._buff = null;
}

SglIndexedPrimitiveStreamGL.prototype.bind = function() {
	this._buff.bind();
}

SglIndexedPrimitiveStreamGL.prototype.unbind = function() {
	this._buff.unbind();
}

SglIndexedPrimitiveStreamGL.prototype._render = function(first, count) {
	this.gl.drawElements(this._mode, count, this._idxType, first * this._stride);
}
/***************************************************************/


// SglPackedIndexedPrimitiveStreamGL
/***************************************************************/
/**
 * Constructs a SglPackedIndexedPrimitiveStream.
 * @class Holds the packed indexed primitive stream information and storage.
 */
function SglPackedIndexedPrimitiveStreamGL(gl, name, mode, indices, blockStartingIndices, blockStartingVertices) {
	if (blockStartingIndices.length != blockStartingVertices.length) {
		sglInvalidParameter();
	}

	SglPrimitiveStreamGL.call(this, gl, name, mode, 0, indices.length);

	var type   = sglGLTypeFromWebGLArray(gl, indices);
	var stride = sglGLTypeSize(gl, type);

	this._idxType = type;
	this._stride  = stride;
	this._buff    = new SglIndexBuffer(gl, indices, { usage : gl.STATIC_DRAW });


	this._blockStartingVertices = blockStartingVertices.slice();
	var n = this._blockStartingVertices.length;

	this._blockStartingIndices = blockStartingIndices.slice();
	this._blockIndicesCount    = new Array(n);

	var start = this._blockStartingIndices[0];
	for (var i=0; i<(n-1); ++i) {
		var sIdx = this._blockStartingIndices[i+1];
		this._blockIndicesCount[i] = sIdx - start;
		start = sIdx;
	}
	this._blockIndicesCount[n-1] = indices.length - start;
}

sglInherit(SglPackedIndexedPrimitiveStreamGL, SglPrimitiveStreamGL);

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "isPacked", function() {
	return true;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "indexType", function() {
	return this._idxType;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "stride", function() {
	return this._stride;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "type", function() {
	return SGL_PACKED_INDEXED_PRIMITIVE_STREAM;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "blocksCount", function() {
	return this._blockStartingIndices.length;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "blockStartingVertices", function() {
	return this._blockStartingVertices;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "blockStartingIndices", function() {
	return this._blockStartingIndices;
});

sglDefineGetter(SglPackedIndexedPrimitiveStreamGL, "blockIndicesCount", function() {
	return this._blockIndicesCount;
});

SglPackedIndexedPrimitiveStreamGL.prototype._destroy = function() {
	this._buff.destroy();
	this._buff = null;
}

SglPackedIndexedPrimitiveStreamGL.prototype.bind = function() {
	this._buff.bind();
}

SglPackedIndexedPrimitiveStreamGL.prototype.unbind = function() {
	this._buff.unbind();
}

SglPackedIndexedPrimitiveStreamGL.prototype._clampBlockRange = function(block, first, count) {
	var end = this._blockStartingIndices[block] + this._blockIndicesCount[block];

	var f = this._blockStartingIndices[block] + ((first >= 0) ? (first) : (0));
	if (f >= end) return null;

	var c = (count >= 0) ? (count) : (this._blockIndicesCount[block]);
	var vEnd = (f + c);
	if (vEnd > end) c -= vEnd - end;

	return [f, c];
}

SglPackedIndexedPrimitiveStreamGL.prototype.blockRanges = function(first, count) {
	var range = this._clampRange(first, count);
	var n     = this._blockStartingIndices.length;

	var firstBlock = 0;
	while ((firstBlock < n) && (range[0] < this._blockStartingIndices[firstBlock])) {
		firstBlock++;
	}
	if (firstBlock >= n) return null;

	var last = range[0] + range[1] - 1;
	var lastBlock = firstBlock;
	while ((lastBlock < n) && (last >= (this._blockStartingIndices[lastBlock] + this._blockIndicesCount[lastBlock]))) {
		lastBlock++;
	}
	if (lastBlock >= n) lastBlock = n - 1;

	var ranges = [ ];
	var f = range[0] - this._blockStartingIndices[firstBlock];
	var c = range[1];
	var e = f + range[1];
	if (e > this._blockIndicesCount[firstBlock]) c = this._blockIndicesCount[firstBlock] - this._blockStartingIndices[firstBlock];
	ranges.push([firstBlock, f, c, this._blockStartingVertices[firstBlock]]);
	for (var i=firstBlock+1; i<lastBlock; ++i) {
		ranges.push([i, 0, this._blockIndicesCount[i], this._blockStartingVertices[i]]);
	}
	if (lastBlock > firstBlock) {
		ranges.push([i, 0, range[0] + range[1] - this._blockStartingIndices[lastBlock], this._blockStartingVertices[lastBlock]]);
	}

	return ranges;
}

SglPackedIndexedPrimitiveStreamGL.prototype.renderBlock = function(block, first, count) {
	var range = this._clampBlockRange(block, first, count);
	this.gl.drawElements(this._mode, range[1], this._idxType, range[0] * this._stride);
}
/***************************************************************/


// SglConnectivityGL
/***************************************************************/
/**
 * Constructs a SglConnectivityGL.
 * @class Container of primitive streams.
 */
function SglConnectivityGL(gl) {
	this.gl     = gl;
	this._prims = new Object();
}

SglConnectivityGL.prototype = {
	get primitives() { return this._prims; },

	destroy : function() {
		for (var prim in this._prims) {
			this._prims[prim].destroy();
		}
	},

	addArrayPrimitives: function(name, mode, first, count) {
		var prim = new SglArrayPrimitiveStreamGL(this.gl, name, mode, first, count)
		this._prims[name] = prim;
	},

	addIndexedPrimitives : function(name, mode, indices) {
		var prim = new SglIndexedPrimitiveStreamGL(this.gl, name, mode, indices)
		this._prims[name] = prim;
	},

	addPackedIndexedPrimitives : function(name, mode, indices, blockStartingIndices, blockStartingVertices) {
		var prim = new SglPackedIndexedPrimitiveStreamGL(this.gl, name, mode, indices, blockStartingIndices, blockStartingVertices)
		this._prims[name] = prim;
	},

	removePrimitives : function(name, doDestroy) {
		if (!this._prims[name]) return;

		if (doDestroy) {
			this._prims[name].destroy();
		}

		delete this._prims[name];
	}
};
/***************************************************************/


// SglMeshGL
/***************************************************************/
/**
 * Constructs a SglMeshGL.
 * @class Mesh definition with vertex stream and primitive stream.
 */
function SglMeshGL(gl) {
	this.gl    = gl;
	this._vert = new SglVertexStreamGL(this.gl);
	this._conn = new SglConnectivityGL(this.gl);
}

SglMeshGL.prototype = {
	get vertices()     { return this._vert; },
	get connectivity() { return this._conn; },

	destroy : function() {
		this._vert.destroy();
		this._conn.destroy();
	},

	addVertexAttribute : function(name, size, values, normalized) {
		this._vert.addAttribute(name, size, values, normalized);
	},

	removeVertexAttribute : function(name, doDestroy) {
		this._vert.removeAttribute(name, doDestroy);
	},

	addArrayPrimitives : function(name, mode, first, count) {
		this._conn.addArrayPrimitives(name, mode, first, count);
	},

	addIndexedPrimitives : function(name, mode, indices) {
		this._conn.addIndexedPrimitives(name, mode, indices);
	},

	addPackedIndexedPrimitives : function(name, mode, indices, blockStartingIndices, blockStartingVertices) {
		this._conn.addPackedIndexedPrimitives(name, mode, indices, blockStartingIndices, blockStartingVertices);
	},

	removePrimitives : function(name, doDestroy) {
		this._conn.removePrimitives(name, doDestroy);
	}
};
/***************************************************************/


// SglMeshRenderer
/***************************************************************/
var SGL_DefaultStreamMappingPrefix = "a_";

/**
 * Constructs a SglMeshGLRenderer.
 * @class Takes charge of mesh rendering, including program attributes, uniforms and samplers bindings.
 */
function SglMeshGLRenderer(program, doSynchronize) {
	this._prog        = program;
	this._mapping     = null;
	this._meshAttrMap = null;
	this._mesh        = null;
	this._primStream  = null;
	this._phase       = 0;

	this._updateEnabledVB = false;

	if (doSynchronize) {
		this.synchronizeProgram();
	}

	this.setStreamMapping();
}

SglMeshGLRenderer.prototype = {
	_bindVertexBuffers : function(baseVertex) {
		this._mesh.vertices.bind(this._meshAttrMap, baseVertex);
	},

	_unbindVertexBuffers : function() {
		this._mesh.vertices.unbind(this._meshAttrMap);
	},

	get program() { return this.prog; },

	synchronizeProgram : function() {
		this._prog.synchronize();

		var doLink = false;
		var index = 0;
		var attr = null;
		for (var a in this._prog.attributes) {
			attr = this._prog.attributes[a];
			if (attr.index != index) {
				attr.index = index;
				doLink = true;
			}
			index++;
		}
		if (doLink) {
			this._prog.link();
		}

		var unit = 0;
		var smp = null;
		for (var s in this._prog.samplers) {
			smp = this._prog.samplers[s];
			smp.unit = unit;
			unit++;
		}
	},

	getStreamMappingFromPrefix : function(prefix) {
		var n = prefix.length;
		var mapping = new Object();
		var src = null;
		for (var attr in this._prog.attributes) {
			if (attr.substr(0, n) == prefix) {
				src = attr.substr(n);
				if (src.length > 0) {
					mapping[attr] = src;
				}
			}
		}
		return mapping;
	},

	setStreamMapping : function(mapping) {
		//if ((this._phase != 0) && (this._phase != 1)) return;

		this._updateEnabledVB = true;

		var meshAttrName = null;

		this._mapping = this.getStreamMappingFromPrefix(SGL_DefaultStreamMappingPrefix);
		for (var progAttrName in mapping) {
			meshAttrName = mapping[progAttr];
			if (this._prog.attributes[progAttrName]) {
				this._mapping[progAttrName] = meshAttrName;
			}
		}

		this._meshAttrMap = { };
		var progAttr = null;
		for (var progAttrName in this._mapping) {
			meshAttrName = this._mapping[progAttrName];
			progAttr     = this._prog.attributes[progAttrName];
			this._meshAttrMap[meshAttrName] = progAttr.index;
		}

		if (this._mesh) {
			this._bindVertexBuffers(0);
		}
	},

	setStreamMappingFromPrefix : function(prefix) {
		if (!prefix) prefix = SGL_DefaultStreamMappingPrefix;
		var mapping = this.getStreamMappingFromPrefix(prefix);
		this.setStreamMapping(mapping);
	},

	setUniforms : function(mapping) {
		if (this._phase == 0) return;
		this._prog.setUniforms(mapping);
	},

	setSamplers : function(mapping) {
		if (this._phase == 0) return;

		var samplers = { };
		var textures = { };

		var t = null;
		for (var s in mapping) {
			t = mapping[s];
			if (typeof(t) == "number") {
				samplers[s] = t;
			}
			else {
				textures[s] = t;
			}
		}

		this._prog.setSamplers(samplers);

		var smp = null;
		for (var s in textures) {
			smp = this._prog.samplers[s];
			if (smp) {
				textures[s].bind(smp.unit);
			}
		}
	},

	begin : function() {
		if (this._phase != 0) return;
		/*
		var gl = this._prog.gl;
		for (var a in this._prog.attributes) {
			gl.enableVertexAttribArray(this._prog.attributes[a].index);
		}
		*/
		this._prog.bind();
		this._phase = 1;
	},

	end : function() {
		if (this._phase != 1) return;
		this._prog.unbind();
		var gl = this._prog.gl;
		for (var a in this._prog.attributes) {
			gl.disableVertexAttribArray(this._prog.attributes[a].index);
		}
		this._phase = 0;
	},

	beginMesh : function(mesh) {
		if (this._phase != 1) return;
		this._updateEnabledVB = true;
		this._mesh = mesh;
		this._bindVertexBuffers(0);
		this._phase = 2;
	},

	endMesh : function() {
		if (this._phase != 2) return;
		this._unbindVertexBuffers();
		this._prog.gl.bindBuffer(this._prog.gl.ARRAY_BUFFER, null);
		this._mesh = null;
		this._phase = 1;
	},

	beginPrimitives : function(name) {
		if (this._phase != 2) return;
		this._primStream = this._mesh.connectivity.primitives[name];
		this._primStream.bind();
		this._phase = 3;
	},

	endPrimitives : function() {
		if (this._phase != 3) return;
		this._primStream.unbind();
		this._primStream = null;
		this._phase = 2;
	},

	render : function(first, count) {
		if (this._phase != 3) return;

		var gl = this._prog.gl;
		var vIndex = 0;

		if (this._updateEnabledVB) {
			this._updateEnabledVB = false;
			for (var progAttr in this._mapping) {
				vIndex = this._prog.attributes[progAttr].index;
				if (this._mesh.vertices.attributes[this._mapping[progAttr]]) {
					gl.enableVertexAttribArray(vIndex);
				}
				else {
					gl.disableVertexAttribArray(vIndex);
				}
			}
		}

		if (this._primStream.isPacked) {
			if (this._primStream.blocksCount > 0) {
				var blocks = this._primStream.blockRanges(first, count);
				var n = blocks.length;
				for (var i=0; i<n; ++i) {
					this._bindVertexBuffers(blocks[i][3]);
					this._primStream.renderBlock(blocks[i][0], blocks[i][1], blocks[i][2]);
				}
			}
		}
		else {
			this._primStream.render(first, count);
		}
	},

	renderMeshPrimitives : function(mesh, name, first, count) {
		this.beginMesh(mesh);
			this.beginPrimitives(name);
				this.render(first, count);
			this.endPrimitives();
		this.endMesh();
	}
};

function sglRenderMeshGLPrimitives(mesh, name, program, streamMapping, uniforms, samplers, first, count) {
	var renderer = new SglMeshGLRenderer(program);
	renderer.begin();
	if (streamMapping) renderer.setStreamMapping (streamMapping);
	if (uniforms     ) renderer.setUniforms      (uniforms     );
	if (samplers     ) renderer.setSamplers      (samplers     );
	if (name) {
		renderer.renderMeshPrimitives(mesh, name, first, count);
	}
	else {
		var primitives = mesh.connectivity.primitives;
		for (var p in primitives) {
			renderer.renderMeshPrimitives(mesh, p, first, count);
		}
	}
}
/***************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// utilities
/***********************************************************************/
function sglMeshJSCalculateBBox(meshJS, attribName) {
	var attrn     = attribName || "position";

	var posAttrib = meshJS.vertices.attributes[attrn];
	var posSize   = posAttrib.size;
	var posBuffer = posAttrib.buffer;

	var bbox = new SglBox3();
	if (posSize != 3) return bbox;

	var n = posBuffer.length / posSize;
	if (n <= 0) return bbox;

	n *= posSize;

	for (var j=0; j<posSize; ++j) {
		bbox.min[j] = posBuffer[j];
		bbox.max[j] = posBuffer[j];
	}

	var val = 0.0;
	for (var i=posSize; i<n; i+=posSize) {
		for (var j=0; j<posSize; ++j) {
			val = posBuffer[i+j];
			if (bbox.min[j] > val) bbox.min[j] = val;
			if (bbox.max[j] < val) bbox.max[j] = val;
		}
	}

	return bbox;
}

SglMeshJS.prototype.calculateBoundingBox = function(attribName) {
	return sglMeshJSCalculateBBox(this, attribName);
};

function sglGLPrimitiveType(gl, primType) {
	switch (primType) {
		case SGL_POINTS_LIST    : return gl.POINTS;         break;
		case SGL_LINES_LIST     : return gl.LINES;          break;
		case SGL_LINE_STRIP     : return gl.LINE_STRIP;     break;
		case SGL_LINE_LOOP      : return gl.LINE_LOOP;      break;
		case SGL_TRIANGLES_LIST : return gl.TRIANGLES;      break;
		case SGL_TRIANGLE_STRIP : return gl.TRIANGLE_STRIP; break;
		case SGL_TRIANGLE_FAN   : return gl.TRIANGLE_FAN;   break;
		default                 : return undefined;         break;
	}
	return undefined;
}

function sglMeshJStoGL(gl, meshJS) {
	var meshGL = new SglMeshGL(gl);

	for (a in meshJS.vertices.attributes) {
		var attr = meshJS.vertices.attributes[a];
		meshGL.addVertexAttribute(attr.name, attr.size, new Float32Array(attr.buffer));
	}

	for (p in meshJS.connectivity.primitives) {
		var prim = meshJS.connectivity.primitives[p];
		var ptype = sglGLPrimitiveType(meshGL.gl, prim.mode);
		if (ptype == undefined) continue;

		switch (prim.type) {
			case SGL_ARRAY_PRIMITIVE_STREAM :
				meshGL.addArrayPrimitives(prim.name, ptype, prim.first, prim.length);
			break;
			case SGL_INDEXED_PRIMITIVE_STREAM :
				meshGL.addIndexedPrimitives(prim.name, ptype, new Uint16Array(prim.buffer));
			break;
			default :
			break;
		}
	}

	return meshGL;
}

SglMeshJS.prototype.toMeshGL = function(gl) {
	return sglMeshJStoGL(gl, this);
};

function sglPackMeshJStoGL(gl, mesh, primitives, maxVertexIndex) {
	var primName = primitives     || triangles;
	var maxInd   = maxVertexIndex || 65000;

	var prim = mesh.connectivity.primitives[primName];

	if (!prim) return null;
	if (prim.type != SGL_INDEXED_PRIMITIVE_STREAM) return null;

	var pmode = sglGLPrimitiveType(gl, prim.mode);
	if (pmode == undefined) return null;

	var res   = [ ];

	var srcIndices = prim.buffer;
	var n          = srcIndices.length;
	n -= (n % 3);

	var start = 0;

	var startVertex = 0;
	var startIndex  = 0;
	var startVertices = [ ];
	var startIndices  = [ ];

	var newIndices = [ ];
	var newAttribs = { };
	for (var a in mesh.vertices.attributes) {
		var attr  = mesh.vertices.attributes[a];
		newAttribs[a] = {
			name   : attr.name,
			size   : attr.size,
			buffer : [ ]
		};
	}

	while (start < n) {
		var indicesMap = { };
		var dstIndices = [ ];
		var vtxCount = 0;

		var indicesMap = { };
		var vtxCount   = 0;
		for (var i=start; i<n; i+=3) {
			var triIndices       = { };
			var newVerticesCount = 0;
			for (var j=0; j<3; ++j) {
				var srcIdx = srcIndices[i+j];
				if (triIndices[srcIdx] == undefined) {
					triIndices[srcIdx] = true;
					if (indicesMap[srcIdx] == undefined) {
						newVerticesCount++;
					}
				}
			}

			if ((vtxCount + newVerticesCount) <= maxInd) {
				for (var j=0; j<3; ++j) {
					var srcIdx = srcIndices[i+j];
					var dstIdx = indicesMap[srcIdx];
					if (dstIdx == undefined) {
						indicesMap[srcIdx] = vtxCount;
						dstIdx = vtxCount;
						vtxCount++;
					}
					dstIndices.push(dstIdx);
				}
				start += 3;
			}
			else {
				break;
			}
		}

		if (vtxCount <= 0) break;

		var idxCount = dstIndices.length;

		for (var a in mesh.vertices.attributes) {
			var srcAttr  = mesh.vertices.attributes[a];
			var dstAttr  = newAttribs[a];
			var asize    = srcAttr.size;
			var dstBase  = dstAttr.buffer.length;
			var newArr   = new Array(vtxCount * asize);
			dstAttr.buffer = dstAttr.buffer.concat(newArr);

			var srcBuff = srcAttr.buffer;
			var dstBuff = dstAttr.buffer;
			for (var i in indicesMap) {
				var dstIdx = indicesMap[i];
				for (var c=0; c<asize; ++c) {
					dstBuff[dstBase + (dstIdx*asize+c)] = srcBuff[i*asize+c];
				}
			}
		}

		newIndices = newIndices.concat(dstIndices);

		startVertices.push(startVertex);
		startIndices.push(startIndex);

		startVertex += vtxCount;
		startIndex  += idxCount;
	}

	var m = new SglMeshGL(gl);

	for (var a in newAttribs) {
		var attr = newAttribs[a];
		m.addVertexAttribute(attr.name, attr.size, new Float32Array(attr.buffer));
	}

	if (startVertices.length == 1) {
		m.addIndexedPrimitives(primName, pmode, new Uint16Array(newIndices));
	}
	else {
		m.addPackedIndexedPrimitives(primName, pmode, new Uint16Array(newIndices), startIndices, startVertices);
	}

	return m;
}

SglMeshJS.prototype.toPackedMeshGL = function(gl, primitives, maxVertexIndex) {
	return sglPackMeshJStoGL(gl, this, primitives, maxVertexIndex);
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// SglTrackball
/***********************************************************************/
const SGL_TRACKBALL_NO_ACTION = 0;
const SGL_TRACKBALL_ROTATE    = 1;
const SGL_TRACKBALL_PAN       = 2;
const SGL_TRACKBALL_DOLLY     = 3;
const SGL_TRACKBALL_SCALE     = 4;

/**
 * Constructs a SglTrackball object.
 * @class Interactor which implements a typical trackball controller.
 */
function SglTrackball() {
	this._matrix = sglIdentityM4();
	this._pts    = [ [0.0, 0.0], [0.0, 0.0] ];
	this._action = SGL_TRACKBALL_NO_ACTION;

	this.reset();
}

SglTrackball.prototype = {
	_projectOnSphere : function(x, y) {
		var r = 1.0;

		var z = 0.0;
		var d = sglSqrt(x*x + y*y);
		if (d < (r * 0.70710678118654752440)) {
			/* Inside sphere */
			z = sglSqrt(r*r - d*d);
		}
		else {
			/* On hyperbola */
			t = r / 1.41421356237309504880;
			z = t*t / d;
		}
		return z;
	},

	_transform : function(m, x, y, z) {
		return sglMulM4V4(m, sglV4C(x, y, z, 0.0));
	},

	_transformOnSphere : function(m, x, y) {
		var z = this._projectOnSphere(x, y);
		return this._transform(m, x, y, z);
	},

	_translate : function(offset, f) {
		var invMat = sglInverseM4(this._matrix);
		var t = sglV3toV4(offset, 0.0);
		t = sglMulM4V4(invMat, t);
		t = sglMulSV4(f, t);
		var trMat = sglTranslationM4V(t);
		this._matrix = sglMulM4(this._matrix, trMat);
	},

	get action()  { return this._action; },
	set action(a) { this._action = a     },

	get matrix() { return this._matrix; },

	reset : function () {
		this._matrix = sglIdentityM4();
		this._pts    = [ [0.0, 0.0], [0.0, 0.0] ];
		this._action = SGL_TRACKBALL_NO_ACTION
	},

	track : function(m, x, y, z) {
		this._pts[0][0] = this._pts[1][0];
		this._pts[0][1] = this._pts[1][1];
		this._pts[1][0] = x;
		this._pts[1][1] = y;

		switch (this._action) {
			case SGL_TRACKBALL_ROTATE:
				this.rotate(m);
			break;

			case SGL_TRACKBALL_PAN:
				this.pan(m);
			break;

			case SGL_TRACKBALL_DOLLY:
				this.dolly(m, z);
			break;

			case SGL_TRACKBALL_SCALE:
				this.scale(m, z);
			break;

			default:
			break;
		}
	},

	rotate : function(m) {
		if ((this._pts[0][0] == this._pts[1][0]) && (this._pts[0][1] == this._pts[1][1])) return;

		var mInv = sglInverseM4(m);

		var v0 = this._transformOnSphere(mInv, this._pts[0][0], this._pts[0][1]);
		var v1 = this._transformOnSphere(mInv, this._pts[1][0], this._pts[1][1]);

		var axis   = sglCrossV3(v0, v1);
		var angle  = sglLengthV3(axis);
		var rotMat = sglRotationAngleAxisM4V(angle, axis);

		this._matrix = sglMulM4(rotMat, this._matrix);
	},

	pan : function(m) {
		var mInv = sglInverseM4(m);
		var v0 = this._transform(mInv, this._pts[0][0], this._pts[0][1], -1.0);
		var v1 = this._transform(mInv, this._pts[1][0], this._pts[1][1], -1.0);
		var offset = sglSubV3(v1, v0);
		this._translate(offset, 2.0);
	},

	dolly : function(m, dz) {
		var mInv = sglInverseM4(m);
		var offset = this._transform(mInv, 0.0, 0.0, dz);
		this._translate(offset, 1.0);
	},

	scale : function(m, s) {
		var scaleMat = sglScalingM4C(s, s, s);
		this._matrix = sglMulM4(this._matrix, scaleMat);
	}
}
/***********************************************************************/


// SglFirstPersonCamera
/***********************************************************************/
/**
 * Constructs a SglFirstPersonCamera object.
 * The default pose is positioned at the origin, looking towards the -Z axis with 0 degrees roll.
 * The camera moves on the XZ plane, having +Y as upward axis.
 * @class Interactor which implements typical First-Person camera movements.
 */
function SglFirstPersonCamera() {
	this._position = sglZeroV3();
	this._angles   = sglZeroV3();

	this.lookAt(0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0);
}

SglFirstPersonCamera.prototype = {
	/**
	 * Clones the object.
	 * @return {SglFirstPersonCamera} A clone of the object.
	 * @see SglFirstPersonCamera#get:copy
	 */
	clone : function() {
		var r = new SglFirstPersonCamera();
		r._position = this._position.slice();
		r._angles   = this._angles.slice();
		return r;
	},

	/**
	 * Getter for the whole object clone.
	 * It returns a clone of the object.
	 * @name SglFirstPersonCamera#get:copy
	 * @function.
	 * @return {SglFirstPersonCamera}
	 * @see SglFirstPersonCamera#clone
	 */
	get copy() {
		return this.clone();
	},

	/**
	 * Sets camera pose.
	 * @param {number} positionX The X coordinate of the camera position.
	 * @param {number} positionY The Y coordinate of the camera position.
	 * @param {number} positionZ The Z coordinate of the camera position.
	 * @param {number} targetX   The X coordinate of the point the camera will be looking at.
	 * @param {number} targetY   The Y coordinate of the point the camera will be looking at.
	 * @param {number} targetZ   The Z coordinate of the point the camera will be looking at.
	 * @param {number} roll      The angle (in radians) of rotation around the view direction (upward vector is kepth at Y axis).
	 * @return {SglFirstPersonCamera} A self reference.
	 */
	lookAt : function(positionX, positionY, positionZ, targetX, targetY, targetZ, roll) {
		this._position = sglV3C(positionX, positionY, positionZ);

		var viewDir = sglSubV3([ targetX, targetY, targetZ ], this._position);

		this._angles[0] = sglAtan2( viewDir[1], -viewDir[2]);
		this._angles[1] = sglAtan2(-viewDir[0], -viewDir[2]);
		this._angles[2] = (roll) ? (roll) : (0.0);

		return this;
	},

	/**
	 * Translates the camera position in its frame of reference.
	 * @param {number} xOffset The amount of translation along the X axis.
	 * @param {number} yOffset The amount of translation along the Y axis.
	 * @param {number} zOffset The amount of translation along the Z axis.
	 * @return {SglFirstPersonCamera} A self reference.
	 */
	translate : function(xOffset, yOffset, zOffset) {
		var pitchMat  = sglRotationAngleAxisM4C(this._angles[0], 1.0, 0.0, 0.0);
		var yawMat    = sglRotationAngleAxisM4C(this._angles[1], 0.0, 1.0, 0.0);
		var rollMat   = sglRotationAngleAxisM4C(this._angles[2], 0.0, 0.0, 1.0);
		var rotMat    = sglMulM4(rollMat, sglMulM4(yawMat, pitchMat));
		var rotOffset = sglMulM4V4(rotMat, [ xOffset, yOffset, zOffset, 0.0 ]);

		this._position[0] += rotOffset[0];
		this._position[1] += rotOffset[1];
		this._position[2] += rotOffset[2];

		return this;
	},

	/**
	 * Translates the camera position in its frame of reference, while preserving the Y coordinate (i.e. altitude).
	 * @param {number} xOffset The amount of translation along the X axis.
	 * @param {number} yOffset The amount of translation along the Y axis.
	 * @param {number} zOffset The amount of translation along the Z axis.
	 * @return {SglFirstPersonCamera} A self reference.
	 */
	translateOnPlane : function(xOffset, yOffset, zOffset) {
		var rotMat    = sglRotationAngleAxisM4C(this._angles[1], 0.0, 1.0, 0.0);
		var rotOffset = sglMulM4V4(rotMat, [ xOffset, yOffset, zOffset, 0.0 ]);

		this._position[0] += rotOffset[0];
		this._position[1] += rotOffset[1];
		this._position[2] += rotOffset[2];

		return this;
	},

	/**
	 * Rotate the camera in its pitch-yaw-roll reference frame.
	 * @param {number} pitchOffset The amount of rotation around the X axis (in radians).
	 * @param {number} yawOffset   The amount of rotation around the Y axis (in radians).
	 * @param {number} rollOffset  The amount of rotation around the view direction (in radians).
	 * @return {SglFirstPersonCamera} A self reference.
	 */
	rotate : function(pitchOffset, yawOffset, rollOffset) {
		this._angles[0] += pitchOffset;
		this._angles[1] += yawOffset;
		this._angles[2] += rollOffset;

		return this;
	},

	/**
	 * Getter for the camera pose matrix.
	 * The camera pose is returned as a 16-element array representing a 4x4 column major transofrmation matrix.
	 * @name SglFirstPersonCamera#get:matrix
	 * @function.
	 * @return {Array}
	 */
	get matrix() {
		var pitchMat  = sglRotationAngleAxisM4C(-this._angles[0], 1.0, 0.0, 0.0);
		var yawMat    = sglRotationAngleAxisM4C(-this._angles[1], 0.0, 1.0, 0.0);
		var rollMat   = sglRotationAngleAxisM4C(-this._angles[2], 0.0, 0.0, 1.0);
		var posMat    = sglTranslationM4V(sglNegV3(this._position));
		var res       = sglMulM4(rollMat, sglMulM4(pitchMat, sglMulM4(yawMat, posMat)));

		return res;
	}
};
/***********************************************************************/


/*************************************************************************/
/*                                                                       */
/*  SpiderGL                                                             */
/*  JavaScript 3D Graphics Library on top of WebGL                       */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  Marco Di Benedetto                                                   */
/*  Visual Computing Laboratory                                          */
/*  ISTI - Italian National Research Council (CNR)                       */
/*  http://vcg.isti.cnr.it                                               */
/*  mailto: marco[DOT]dibenedetto[AT]isti[DOT]cnr[DOT]it                 */
/*                                                                       */
/*  This file is part of SpiderGL.                                       */
/*                                                                       */
/*  SpiderGL is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU Lesser General Public License as          */
/*  published by the Free Software Foundation; either version 2.1 of     */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  SpiderGL is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU Lesser General Public License                            */
/*  (http://www.fsf.org/licensing/licenses/lgpl.html) for more details.  */
/*                                                                       */
/*************************************************************************/


// canvas utilities
/***********************************************************************/
function sglGetCanvasContext(canvasID) {
	var canvas = document.getElementById(canvasID);
	if (!canvas) return null;

	var gl = canvas.getContext("experimental-webgl");
	if (!gl) return null;

	if (gl.FALSE == undefined) gl.FALSE = 0;
	if (gl.TRUE  == undefined) gl.TRUE  = 1;

	return gl;
}
/***********************************************************************/


// SglCanvasUI
/***********************************************************************/
/**
 * Constructs a SglCanvasUI.
 * @class Holds current information about the canvas object and input devices state.
 */
function SglCanvasUI(manager, handler, canvas, gl) {
	this._manager = manager;
	this._handler = handler;
	this._canvas  = canvas;

	this._timerID = null;
	this._updRate = 0.0;

	this.gl = gl;

	this.loadEvent        = null;
	this.unloadEvent      = null;
	this.keyDownEvent     = null;
	this.keyUpEvent       = null;
	this.keyPressEvent    = null;
	this.mouseDownEvent   = null;
	this.mouseUpEvent     = null;
	this.mouseMoveEvent   = null;
	this.mouseWheelEvent  = null;
	this.clickEvent       = null;
	this.dblClickEvent    = null;
	this.resizeEvent      = null;
	this.updateEvent      = null;
	this.drawEvent        = null;

	this.keysDown         = new Object();

	this.mouseButtonsDown = new Object();
	this.mousePos         = { x:0, y:0 };
	this.mousePrevPos     = { x:0, y:0 };
	this.mouseDeltaPos    = { x:0, y:0 };

	this.timeNow   = Date.now() / 1000.0;
	this.timePrev  = this.timeNow;
	this.timeDelta = 0.0;
}

SglCanvasUI.prototype = {
	get canvas() {
		return this._canvas;
	},

	get width() {
		return this._canvas.width;
	},

	get height() {
		return this._canvas.height;
	},

	get updateRate() {
		if (this._updRate <= 0.0) return 0.0;
		return this._updRate;
	},

	set updateRate(r) {
		var updR = r;
		if (updR < 0.0) updR = 0.0;
		if (updR > 1000.0) updR = 1000.0;
		if (this._updRate == updR) return;

		this._updRate = updR;

		if (this._timerID != null)
		{
			clearInterval(this._timerID);
			this._timerID = null;
		}

		if (this._updRate > 0.0)
		{
			var ms  = 1000.0 / this._updRate;
			if (ms < 1.0) ms = 1.0;
			var mgr = this._manager;

			this.timeNow   = Date.now() / 1000.0;
			this.timePrev  = this.timeNow;
			this.timeDelta = 0.0;

			this._timerID = setInterval(function() { mgr.update(); }, ms);
		}
	},

	get requestDraw() {
		var t = this;
		return (function() { t._manager.requestDraw(); });
	}
};
/***********************************************************************/


// _SglCanvasManager
/***********************************************************************/
function _SglCanvasManager(canvasID, handler, updateRate) {
	var canvas = document.getElementById(canvasID);
	if (!canvas) throw new Error("SpiderGL : Canvas not found");

	canvas.contentEditable = true;

	var gl = sglGetCanvasContext(canvasID);
	if (!gl) throw new Error("SpiderGL : Cannot get WebGL context");

	gl.pixelStorei(gl.PACK_ALIGNMENT,                 1);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT,               1);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,            1);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);

	// for some strange reason, this is a workaround
	// to have Chrome work properly...
	// (anyway it should be harmless...)
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	var ui  = new SglCanvasUI(this, handler, canvas, gl);
	this.ui = ui;

	var mgr = this;

	this.gl      = gl;
	this.canvas  = canvas;
	this.handler = handler;
	//this.handler.prototype.ui = get function() { return ui };
	//this.handler.ui = get function() { return ui };
	this.handler.ui = ui;

	this._drawPending = false;
	this._drawFunc = function() {
		mgr.draw();
	};


	this.canvas.addEventListener("load",            function(e) { mgr.load        (e); }, false);
	this.canvas.addEventListener("unload",          function(e) { mgr.unload      (e); }, false);
	this.canvas.addEventListener("keydown",         function(e) { mgr.keyDown     (e); }, false);
	this.canvas.addEventListener("keyup",           function(e) { mgr.keyUp       (e); }, false);
	this.canvas.addEventListener("keypress",        function(e) { mgr.keyPress    (e); }, false);
	this.canvas.addEventListener("mousedown",       function(e) { mgr.mouseDown   (e); }, false);
	this.canvas.addEventListener("mouseup",         function(e) { mgr.mouseUp     (e); }, false);
	this.canvas.addEventListener("mousemove",       function(e) { mgr.mouseMove   (e); }, false);
	this.canvas.addEventListener("click",           function(e) { mgr.click       (e); }, false);
	this.canvas.addEventListener("dblclick",        function(e) { mgr.dblClick    (e); }, false);
	this.canvas.addEventListener("resize",          function(e) { mgr.resize      (e); }, false);

	this.canvas.addEventListener("mousewheel",      function(e) { mgr.mouseWheel  (e); }, false);
	this.canvas.addEventListener("DOMMouseScroll",  function(e) { mgr.mouseWheel  (e); }, false);

	this.canvas.addEventListener("blur",            function(e) { mgr.blur        (e); }, false);
	this.canvas.addEventListener("mouseout",        function(e) { mgr.mouseOut    (e); }, false);

	this.load();

	if (updateRate) {
		this.ui.updateRate = updateRate;
	}
}

_SglCanvasManager.prototype = {
	_getMouseClientPos : function(e) {
		var rct = this.canvas.getBoundingClientRect();
		return {
			x : (e.clientX - rct.left),
			y : (e.clientY - rct.top )
		};
	},

	requestDraw : function() {
		if (!this._drawPending) {
			this._drawPending = true;
			setTimeout(this._drawFunc, 0);
		}
	},

	blur : function(e) {
		var doDraw = false;
		for (var button in this.ui.mouseButtonsDown) {
			if (this.ui.mouseButtonsDown[button]) {
				this.ui.mouseButtonsDown[button] = false;
				if (this.handler.mouseUp) {
					if (this.handler.mouseUp(this.gl, button, this.ui.mousePos.x, this.ui.mousePos.y) != false) {
						doDraw = true;
					}
				}
			}
		}

		for (var key in this.ui.keysDown) {
			if (this.ui.keysDown[key]) {
				this.ui.keysDown[key] = false;
				if (this.handler.keyUp) {
					// WARNING : passing 0 as keyCode
					if (this.handler.keyUp(this.gl, 0, key) != false) {
						doDraw = true;
					}
				}
			}
		}

		if (doDraw) {
			this.requestDraw();
		}
	},

	mouseOut: function(e) {
		var doDraw = false;
		for (var button in this.ui.mouseButtonsDown) {
			if (this.ui.mouseButtonsDown[button]) {
				this.ui.mouseButtonsDown[button] = false;
				if (this.handler.mouseUp) {
					if (this.handler.mouseUp(this.gl, button, this.ui.mousePos.x, this.ui.mousePos.y) != false) {
						doDraw = true;
					}
				}
			}
		}

		if (doDraw) {
			this.requestDraw();
		}
	},

	load : function() {
		this.ui.loadEvent = null;
		if (this.handler.load) {
			if (this.handler.load(this.gl) != false) {
				;
			}
		}
		this.requestDraw();
	},

	unload : function()
	{
		this.ui.unloadEvent = null;
		this.ui.updateRate = 0.0;
		if (this.handler.unload) {
			this.handler.unload(this.gl);
		}
		this.handler.ui = null;
		this.handler    = null;
		this.ui         = null;
	},

	keyDown : function(e) {
		this.ui.keyDownEvent = e;
		var keyString = String.fromCharCode(e.keyCode);
		this.ui.keysDown[keyString.toLowerCase()] = true;
		this.ui.keysDown[keyString.toUpperCase()] = true;
		this.ui.keysDown[e.keyCode] = true;
		if (this.handler.keyDown) {
			if (this.handler.keyDown(this.gl, e.keyCode, keyString) != false) {
				this.requestDraw();
			}
		}
		/*
		if (e.preventDefault) {
			e.preventDefault();
		}
		*/
	},

	keyUp : function(e) {
		this.ui.keyUpEvent = e;
		var keyString = String.fromCharCode(e.keyCode);
		this.ui.keysDown[keyString.toLowerCase()] = false;
		this.ui.keysDown[keyString.toUpperCase()] = false;
		this.ui.keysDown[e.keyCode] = false;
		if (this.handler.keyUp) {
			if (this.handler.keyUp(this.gl, e.keyCode, keyString) != false) {
				this.requestDraw();
			}
		}
		/*
		if (e.preventDefault) {
			e.preventDefault();
		}
		*/
	},

	keyPress : function(e) {
		this.ui.keyPressEvent = e;
		var keyString = String.fromCharCode(e.charCode);
		if (this.handler.keyPress) {
			if (this.handler.keyPress(this.gl, e.charCode, keyString) != false) {
				this.requestDraw();
			}
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	mouseDown : function(e) {
		this.ui.mouseDownEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		this.ui.mousePrevPos.x = x;
		this.ui.mousePrevPos.y = y;
		this.ui.mousePos.x = x;
		this.ui.mousePos.y = y;
		this.ui.mouseDeltaPos.x = 0;
		this.ui.mouseDeltaPos.y = 0;
		this.ui.mouseButtonsDown[e.button] = true;
		if (this.handler.mouseDown) {
			if (this.handler.mouseDown(this.gl, e.button, x, y) != false) {
				this.requestDraw();
			}
		}
		this.canvas.focus();
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	mouseUp : function(e) {
		this.ui.mouseUpEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		this.ui.mousePrevPos.x = x;
		this.ui.mousePrevPos.y = y;
		this.ui.mousePos.x = x;
		this.ui.mousePos.y = y;
		this.ui.mouseDeltaPos.x = 0;
		this.ui.mouseDeltaPos.y = 0;
		this.ui.mouseButtonsDown[e.button] = false;
		if (this.handler.mouseUp) {
			if (this.handler.mouseUp(this.gl, e.button, x, y) != false) {
				this.requestDraw();
			}
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	mouseMove : function(e) {
		this.ui.mouseMoveEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		this.ui.mousePrevPos.x = this.ui.mousePos.x;
		this.ui.mousePrevPos.y = this.ui.mousePos.y;
		this.ui.mousePos.x = x;
		this.ui.mousePos.y = y;
		this.ui.mouseDeltaPos.x = this.ui.mousePos.x - this.ui.mousePrevPos.x;
		this.ui.mouseDeltaPos.y = this.ui.mousePos.y - this.ui.mousePrevPos.y;
		if (this.handler.mouseMove) {
			if (this.handler.mouseMove(this.gl, x, y) != false) {
				this.requestDraw();
			}
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	mouseWheel : function(e) {
		this.ui.mouseWheelEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		this.ui.mousePrevPos.x = x;
		this.ui.mousePrevPos.y = y;
		this.ui.mousePos.x = x;
		this.ui.mousePos.y = y;
		this.ui.mouseDeltaPos.x = 0;
		this.ui.mouseDeltaPos.y = 0;
		if (this.handler.mouseWheel) {
			var delta = 0;
			if (!e) /* For IE. */ {
				e = window.event;
			}
			if (e.wheelDelta) /* IE/Opera. */ {
				delta = e.wheelDelta / 120;
				/* In Opera 9, delta differs in sign as compared to IE.
				 */
				if (window.opera) {
					delta = -delta;
				}
			}
			else if (e.detail) /** Mozilla case. */ {
				/** In Mozilla, sign of delta is different than in IE.
				 * Also, delta is multiple of 3.
				 */
				delta = -e.detail / 3;
			}
			/* If delta is nonzero, handle it.
			 * Basically, delta is now positive if wheel was scrolled up,
			 * and negative, if wheel was scrolled down.
			 */
			if (delta) {
				if (this.handler.mouseWheel(this.gl, delta, x, y) != false) {
					this.requestDraw();
				}
			}
		}

		/* Prevent default actions caused by mouse wheel.
		 * That might be ugly, but we handle scrolls somehow
		 * anyway, so don't bother here..
		 */
		if (e.preventDefault) {
			e.preventDefault();
		}
		//e.returnValue = false;
	},

	click : function(e) {
		this.ui.clickEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		if (this.handler.click) {
			if (this.handler.click(this.gl, e.button, x, y) != false) {
				this.requestDraw();
			}
		}
		/*
		if (e.preventDefault) {
			e.preventDefault();
		}
		*/
	},

	dblClick : function(e) {
		this.ui.dblClickEvent = e;
		var xy = this._getMouseClientPos(e);
		var x = xy.x;
		var y = this.canvas.height - 1 - xy.y;
		if (this.handler.dblClick) {
			if (this.handler.dblClick(this.gl, e.button, x, y) != false) {
				this.requestDraw();
			}
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	resize : function(e) {
		this.ui.resizeEvent = e;
		if (this.handler.resize) {
			if (this.handler.resize(this.gl, this.canvas.width, this.canvas.height) != false) {
				this.requestDraw();
			}
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
	},

	update : function() {
		this.ui.updateEvent = null;
		var now = Date.now() / 1000.0;
		this.ui.timePrev  = this.ui.timeNow;
		this.ui.timeNow   = now;
		this.ui.timeDelta = (this.ui.timeNow - this.ui.timePrev);
		var doDraw = true;
		if (this.handler.update) {
			doDraw = (this.handler.update(this.gl, this.ui.timeDelta) != false);
		}
		if (doDraw) {
			this.requestDraw();
		}
	},

	draw : function() {
		this.ui.drawEvent = null;
		if (this.handler.draw) {
			this.handler.draw(this.gl);
		}
		this.gl.flush();
		this._drawPending = false;
	}
};
/***********************************************************************/


// canvas registration
/***********************************************************************/
var _SGL_RegisteredCanvas = new Object();

function _sglManageCanvas(canvasID, handler, updateRate) {
	var manager = new _SglCanvasManager(canvasID, handler, updateRate);
	_SGL_RegisteredCanvas[canvasID] = manager;
}

function _sglUnmanageCanvas(canvasID) {
	if (_SGL_RegisteredCanvas[canvasID]) {
		_SGL_RegisteredCanvas[canvasID] = null;
		delete _SGL_RegisteredCanvas[canvasID];
	}
}

function _sglManageCanvasOnLoad(canvasID, handler, updateRate) {
	window.addEventListener("load", function() { _sglManageCanvas(canvasID, handler, updateRate); }, false);
}

function _sglUnmanageCanvasOnLoad(canvasID) {
	window.addEventListener("unload", function() { _sglUnmanageCanvas(canvasID); }, false);
}

function sglRegisterCanvas(canvasID, handler, updateRate) {
	_sglManageCanvasOnLoad(canvasID, handler, updateRate);
	_sglUnmanageCanvasOnLoad(canvasID);
}

function sglRegisterLoadedCanvas(canvasID, handler, updateRate) {
	_sglManageCanvas(canvasID, handler, updateRate);
	_sglUnmanageCanvasOnLoad(canvasID);
}
/***********************************************************************/
