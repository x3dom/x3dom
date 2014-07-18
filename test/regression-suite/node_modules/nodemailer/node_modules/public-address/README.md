# public-address

Resolve the public IP address and hostname of your current machine.

This module makes a HTTP request to www.remoteaddress.net IP resolving service.

## Installation

    npm install public-address

## Usage

    var publicAddress = require("public-address");
    publicAddress([options,] callback);

Where

  * **options** - an optional options object. Everything in this object is passed to the HTTP request object (eg. `agent`, `localAddress` etc.)
  * **callback** - function to run once the resolving succeeded or failed. Has error object and response data as arguments

The data argument for `callback` has the following properties

  * **address** - public IP address
  * **hostname** - (if available) hostname of the IP address

## Example

Resolve public IP:

    publicAddress(function(err, data){
        console.log(err || data);
    });

Example response:

    {
        "address": "193.152.61.139",
        "hostname": "gprs-inet-61-139.example.com"
    }

## License

**MIT**
