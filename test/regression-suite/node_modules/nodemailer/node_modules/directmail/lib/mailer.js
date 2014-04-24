"use strict";

var createQueue = require("./queue"),
    simplesmtp = require("simplesmtp"),
    dns = require("dns"),
    net = require("net"),
    os = require("os"),
    packageData = require("../package.json"),
    EventEmitter = require("events").EventEmitter;

module.exports = function(options){
    var mailer = new DirectMailer(options);
    mailer.version = packageData.version;
    return mailer;
};

/**
 * Creates a new DirectMailer instance. Provides method 'send' to queue
 * outgoing e-mails. The queue is processed in the background.
 *
 * @constructor
 * @param {Object} [options] Optional options object
 */
function DirectMailer(options){
    this._options = options || {};
    this._queue = createQueue();
    this._started = false;
    this._lastId = 0;
}

// Adds a dynamic property 'length'
Object.defineProperty(DirectMailer.prototype, "length", {
    get: function() {
        return this._queue._instantQueue.length + this._queue._sortedQueue.length;
    }
});

/**
 * Adds an outgoing message to the queue. Recipient addresses are sorted
 * by the receiving domain and for every domain, a copy of the message is queued.
 *
 * If input is deemed invalid, an error is thrown, so be ready to catch these
 * when calling directmail.send(...)
 *
 * @param {Object} options E-mail options
 * @param {String} options.from Sender e-mail address
 * @param {Array|String} options.recipients A list of or a single recipient address
 * @param {String|Buffer} options.message RFC2822 formatted e-mail
 * @return {EventEmitter} Handler for receiving information about message sending status
 */
DirectMailer.prototype.send = function(options){
    options = options || {};

    var from = [].concat(options.from || []).shift() || "",
        recipients = [].concat(options.recipients || []),
        message = options.message || "",
        domainGroups = {},
        emitter = new EventEmitter();

    if(!from){
        throw new Error("'From' address missing");
    }

    if(!recipients.length){
        throw new Error("'Recipients' addresses missing");
    }

    if(!message){
        throw new Error("Nothing to send, 'message' empty");
    }

    recipients.forEach(function(recipient){
        recipient = (recipient || "").toString();

        var domain = (recipient.split("@").pop() || "").toLowerCase().trim();

        if(!domainGroups[domain]){
            domainGroups[domain] = [recipient];
        }else if(domainGroups[domain].indexOf(recipient) < 0){
            domainGroups[domain].push(recipient);
        }
    });

    Object.keys(domainGroups).forEach((function(domain){
        var item = {
            from: from,
            to: domainGroups[domain],
            domain: domain,
            message: message,
            emitter: emitter,
            id: ++this._lastId
        };
        this._formatMessage(item);
        this._queue.insert(item);
        if(this._options.debug){
            console.log("Queued message #%s from %s, to %s", this._lastId, from, domainGroups[domain].join(", "));
        }
    }).bind(this));

    // start send loop if needed
    if(!this._started){
        this._started = true;

        // do not start the loop before current execution context is finished
        if(typeof setImmediate == "function"){
            setImmediate(this._loop.bind(this));
        }else{
            process.nextTick(this._loop.bind(this));
        }
    }

    return emitter;
};

/**
 * Looping function to fetch a message from the queue and send it.
 */
DirectMailer.prototype._loop = function(){

    // callback is fired when a message is added to the queue
    this._queue.get((function(data){

        if(this._options.debug){
            console.log("Retrieved message #%s from the queue, reolving %s", data.id, data.domain);
        }

        // Resolve destination MX server
        this._resolveMx(data.domain, (function(err, list){
            if(this._options.debug){
                if(err){
                    console.log("Resolving %s for #%s failed", data.domain, data.id);
                    console.log(err);
                }else if(!list || !list.length){
                    console.log("Could not resolve any MX servers for %s", data.domain);
                }
            }
            if(err || !list || !list.length){
                data.emitter.emit("failed", {
                    domain: data.domain,
                    error: err
                });
                if(typeof setImmediate == "function"){
                    setImmediate(this._loop.bind(this));
                }else{
                    process.nextTick(this._loop.bind(this));
                }
                return;
            }

            // Sort MX list by priority field
            list.sort(function(a, b){
                return (a && a.priority || 0) - (b && b.priority || 0);
            });

            // Use the first server on the list
            var exchange = list[0] && list[0].exchange;

            if(this._options.debug){
                console.log("%s resolved to %s for #%s", data.domain, exchange, data.id);
            }

            // Try to send the message
            this._process(exchange, data, (function(err, response){
                if(this._options.debug){
                    if(err){
                        console.log("Failed processing message #%s", data.id);
                    }else{
                        console.log("Server responded for #%s:", data.id);
                        console.log(response);
                    }
                }
                if(err){
                    if(err.code && err.code >= 500){
                        data.emitter.emit("failed", {
                            domain: data.domain,
                            error: err
                        });
                    }else{
                        data.replies = (data.replies || 0) + 1;
                        if(data.replies <= 5){
                            this._queue.insert(data, data.replies * 15 * 60 * 1000);
                            if(this._options.debug){
                                console.log("Message #%s requeued for %s minutes", data.id, data.replies * 15);
                            }
                            data.emitter.emit("requeue", {
                                domain: data.domain,
                                error: err
                            });
                        }else{
                            data.emitter.emit("failed", {
                                domain: data.domain,
                                error: err
                            });
                        }
                    }
                }else{
                    data.emitter.emit("sent", {
                        domain: data.domain,
                        response: response
                    });
                }
                if(typeof setImmediate == "function"){
                    setImmediate(this._loop.bind(this));
                }else{
                    process.nextTick(this._loop.bind(this));
                }
            }).bind(this));

        }).bind(this));

    }).bind(this));
};

/**
 * Sends a message to provided MX server
 *
 * @param {String} exchange MX server
 * @param {Object} data Message object
 * @param {Function} callback Callback to run once the message is either sent or sending fails
 */
DirectMailer.prototype._process = function(exchange, data, callback){
    if(this._options.debug){
        console.log("Connecting to %s:%s for message #%s", exchange, this._options.port || 25, data.id);
    }

    var options = {
        ignoreTLS: true
    };

    // Add options from DirectMailer options to simplesmtp client
    Object.keys(this._options).forEach((function(key){
        options[key] = this._options[key];
    }).bind(this));

    var client = simplesmtp.connect(this._options.port || 25, exchange, options),
        response = {},
        ready = false;

    // Once client is connected and an e-mail can be sent
    client.once("idle", function(){
        // Define MAIL FROM and RCTP TO values
        client.useEnvelope({
            from: data.from,
            to: data.to
        });
    });

    // If recipient is not accepted, log it
    client.once("rcptFailed", (function(addresses){
        if(this._options.debug){
            console.log("The following addresses were rejected for #%s: %s", data.id, addresses.join(", "));
        }
    }).bind(this));

    // Envelope is set up and the server is waiting for DATA command
    client.once("message", (function(){
        if(this._options.debug){
            console.log("Transmitting message #%s", data.id);
        }
        // Send the entire message at once
        client.end(data.message);
    }).bind(this));

    // Message has been delivered to the server
    client.once("ready", function(success, message){
        response.success = !!success;
        response.message = message;
        client.quit();
    });

    // Sending failed
    client.once("error", function(err){
        if(ready){
            return;
        }
        ready = true;
        callback(err);
    });

    // Connection to the server is closed
    client.once("end", function(){
        var err;

        if(ready){
            return;
        }
        ready = true;

        if(!response.success){
            err = new Error("Sending failed with error " + (response.message || "").substr(0, 3));
            err.code = Number((response.message || "").substr(0, 3)) || 0;
            callback(err);
        }else{
            callback(null, response.message);
        }
    });
};

/**
 * Adds additional headers to the outgoing message
 */
DirectMailer.prototype._formatMessage = function(item){
    var hostname = this._resolveHostname(this._options.name),
        headers = [
            // Act like the message went through a SMTP relay
            "Received: from localhost (127.0.0.1)\r\n by " + hostname + " with SMTP; " + Date()
        ];

    item.message = headers.join("\r\n") + "\r\n" + (item.message || "");
};

/**
 * Resolves MX server for a domain
 *
 * @param {String} domain Domain to resolve the MX to
 * @param {Function} callback Callback function to run
 */
DirectMailer.prototype._resolveMx = function(domain, callback){

    // Do not try to resolve the domain name if it is an IP address
    if(net.isIP(domain)){
        return callback(null, [{'priority': 10, 'exchange': domain}]);
    }

    dns.resolveMx(domain, callback);
};

/**
 * Resolves current hostname. If resolved name is an IP address, uses "localhost".
 *
 * @param {String} [name] Preferred hostname
 * @return {String} Resolved hostname
 */
DirectMailer.prototype._resolveHostname = function(name){
    if(!name || net.isIP(name.replace(/[\[\]]/g, "").trim())){
        name = (os.hostname && os.hostname()) || "";
    }

    if(!name || net.isIP(name.replace(/[\[\]]/g, "").trim())){
        name = "localhost";
    }

    return name.toLowerCase();
};
