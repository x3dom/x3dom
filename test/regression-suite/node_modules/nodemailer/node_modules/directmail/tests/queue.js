"use strict";

var createQueue = require("../lib/queue");

exports["General tests"] = {

    setUp: function(done){
        this.queue = createQueue();
        done();
    },

    "Add item to queue": function(test){

        test.deepEqual(this.queue._instantQueue, []);
        this.queue.insert("value1");
        test.deepEqual(this.queue._instantQueue, ["value1"]);
        this.queue.insert("value2");
        test.deepEqual(this.queue._instantQueue, ["value2", "value1"]);

        test.done();
    },

    "Pull items from a queue": function(test){
        var queue = this.queue;
        queue.insert("value1");
        queue.insert("value2");

        queue.get(function(value){
            test.equal(value, "value1");

            queue.get(function(value){
                test.equal(value, "value2");
                test.deepEqual(queue._instantQueue, []);
                test.done();
            });
        });
    },

    "Add delayed items": function(test){
        var queue = this.queue;

        queue.insert("value1", 300);
        queue.insert("value2", 100);
        queue.insert("value3");

        queue.get(function(value){
            test.equal(value, "value3");

            queue.get(function(value){
                test.equal(value, "value2");

                queue.get(function(value){
                    test.equal(value, "value1");
                    test.done();
                });
            });
        });
    }
};
