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

function WorkerPool(size) {
    var _this = this;
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;

    this.init = function() {
        // create 'size' number of worker threads
        for (var i = 0 ; i < this.poolSize ; i++) {
            _this.workerQueue.push(new WorkerThread(_this));
        }
    } // init

    this.addWorkerTask = function(workerTask) {
        if (_this.workerQueue.length > 0) {
            // use the free worker from the front of the queue
            var workerThread = _this.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers
            _this.taskQueue.push(workerTask);
        }
    } // addWorkerTask

    this.freeWorkerThread = function(workerThread) {
        if (_this.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = _this.taskQueue.shift();
	    if(workerTask.discard)
		return this.freeWorkerThread(workerThread);
            workerThread.run(workerTask);
        } else {
            _this.workerQueue.push(workerThread);
        }
    } // freeWorkerThread
}; /* WorkerPool */

function WorkerThread(workerPool) {
    var _this = this;
    this.workerPool = workerPool;
    this.workerTask = {};

    this.run = function(workerTask) {
        this.workerTask = workerTask;
        var worker = new Worker(workerTask.script);
	worker.caller = workerTask.caller;
	worker.onmessage = function(e) {
	    _this.workerTask.callback(e);
	    _this.workerPool.freeWorkerThread(_this);
	}
        worker.postMessage(workerTask.startMessage);
    } // run
}; /* WorkerThread */

function WorkerTask(script, caller, callback, msg) {
    this.script = script;
    this.caller = caller;
    this.callback = callback;
    this.startMessage = msg;
};

// TODO: var poolSize = Math.max(3,navigator.hardwareConcurrency);
var poolSize = 3;
var tessWorkerPool = new WorkerPool(poolSize);
tessWorkerPool.init();
