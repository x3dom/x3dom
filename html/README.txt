The server by default will listen on the local network for broadcast
traffic on UDP port 3000, the same port as is used by VBS2. The server
will read from the local network and forward any ESPDUs to web clients
that connect, in binary DIS format. The web clients will send any
ESPDUs they generate to the server over a websocket (in binary DIS
format) and the server will repeat the message to all web clients
and send on port 3000 on all interfaces on broadcast.

You can configure the port and whether to use mcast or bcast in the 
GatewayConfiguration.properties file.

This directory holds content served up by the web server, including HTML
files and Javascript files. 

index.html is a simple three.js WebGL 3D scene that creates an entity in the
world, then sends out binary format IEEE DIS updates to reflect that position.
It also reads from a websocket binary IEEE DIS, does a coordinate system
transformation, and creates a cube to reflect any entities it hears of from
the network.

map.html implements a simple Google Maps page that displays the location
of entities on a map.

The javascript directory contains supporting javascript files for DIS
and three.js. DIS files include RangeCoordinates (for coordinate conversions)
and the javascript classes necessary to encode and decode DIS.

The models directory holds Collada 3D models that can be loaded by web
pages.


