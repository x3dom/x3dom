"use strict";

var http = require("http"),
    resolver = require("../index"),
    port = 1235;

module.exports["Response OK"] = {
    setUp: function(next){
        this.server = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({
                address: "1.2.3.4",
                hostname: "tere.tere"
            }));
        }).listen(port, next);
    },

    tearDown: function(next){
        this.server.close(next);
    },

    resolve: function(test){
        resolver({
                hostname: "localhost",
                port: port
            }, function(err, data){
                test.ifError(err);
                test.deepEqual(data, {
                    address: "1.2.3.4",
                    hostname: "tere.tere"
                });
                test.done();
            });
    }
};

module.exports["Status error"] = {
    setUp: function(next){
        this.server = http.createServer(function (req, res) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify({
                address: "1.2.3.4",
                hostname: "tere.tere"
            }));
        }).listen(port, next);
    },

    tearDown: function(next){
        this.server.close(next);
    },

    resolve: function(test){
        resolver({
                hostname: "localhost",
                port: port
            }, function(err, data){
                test.ok(err);
                test.ok(!data);
                test.done();
            });
    }
};

module.exports["Data error"] = {
    setUp: function(next){
        this.server = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end("tere!");
        }).listen(port, next);
    },

    tearDown: function(next){
        this.server.close(next);
    },

    resolve: function(test){
        resolver({
                hostname: "localhost",
                port: port
            }, function(err, data){
                test.ok(err);
                test.ok(!data);
                test.done();
            });
    }
};
