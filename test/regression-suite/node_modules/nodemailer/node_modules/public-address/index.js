"use strict";

var http = require("http");

module.exports = resolve;

function resolve(options, callback){
    var requestOptions = {
        hostname: 'www.remoteaddress.net',
        port: 80,
        path: '/api/ip',
        method: 'GET'
    };

    if(!callback && typeof options == "function"){
        callback = options;
        options = undefined;
    }

    options = options || {};
    Object.keys(options).forEach(function(key){
        requestOptions[key] = options[key];
    });

    http.get(requestOptions, function(res) {
        var chunks = [], chunklen = 0;

        if(res.statusCode != 200){
            res.on("data", function(){});
            res.on("end", function(){
                callback(new Error("Invalid response code " + res.statusCode));
            });
            return;
        }

        res.on("data", function(chunk){
            chunks.push(chunk);
            chunklen += chunk.length;
        });

        res.on("end", function(){
            var data;
            try{
                data = JSON.parse(Buffer.concat(chunks, chunklen).toString());
            }catch(exception){}
            if(!data){
                callback(new Error("Invalid response from server"));
            }else{
                callback(null, data);
            }
        });
    }).on('error', function(err) {
        callback(err);
    });
}
