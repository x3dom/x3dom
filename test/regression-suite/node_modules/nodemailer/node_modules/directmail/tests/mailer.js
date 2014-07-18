"use strict";

var simplesmtp = require("simplesmtp"),
    createDirectmailer = require("../index"),
    packageData = require("../package.json"),
    PORT_NUMBER = 8397;

exports["General tests"] = {
    setUp: function (callback) {
        this.server = new simplesmtp.createServer({
            disableDNSValidation: true
        });
        this.server.listen(PORT_NUMBER, function(err){
            if(err){
                throw err;
            }else{
                callback();
            }
        });

    },

    tearDown: function (callback) {
        this.server.end(callback);
    },

    "Create directmailer instance": function(test){
        var mailer = createDirectmailer();
        test.ok(mailer.send);
        test.done();
    },

    "Mailer instance exposes version number": function(test){
        var mailer = createDirectmailer();
        test.ok(mailer.version);
        test.equal(mailer.version, packageData.version);
        test.done();
    },

    "Send mail": function(test){
        var mailer = createDirectmailer({
            debug: false,
            port: PORT_NUMBER
        });

        var mail = mailer.send({
            from: "andris@example.com",
            recipients: "andris@127.0.0.1",
            message: "Subject: test\r\n\r\nTest!"
        });

        test.equal(mailer.length, 1);

        mail.once("failed", function(){
            test.ok(false);
            test.done();
        });

        mail.once("sent", function(data){
            test.equal(data.domain, "127.0.0.1");
            test.ok(/^250\D/.test(data.response));
            test.equal(mailer.length, 0);
            test.done();
        });
    }
};
