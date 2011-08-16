.. _cors:


Loading resources from external servers
========================================

Sometimes it is desirable to load resources like textures
from other locations than your web server. The most common
use case being a serving textures from a
`CDN <http://en.wikipedia.org/wiki/Content_delivery_network>`_.
While technically not a problem, there are security precautions
in place to prevent injection of malicious code into your application.
Browser vendors started to prevent loading resources from other locations
unless these resources are not marked safe by the foreign web server.

The corresponding W3C specification is called
`Cross-Origin Resource Sharing <http://www.w3.org/TR/cors/>`_
and adhered to by most browsers. And in essence, you need to configure the
foreign web server to add a HTTP header that marks the resource safe for
your domain. Say, your application is served from ``http://yoursite.org`` and
needs to load resources from ``http://othersite.org``, the webserver of
``othersite.org`` needs to set a HTTP header that marks ``yoursite.org``
safe for cross site requests. For example::

    Access-Control-Allow-Origin: http://yoursite.org

**More information on CORS**

* `Cross-Origin Resource Sharing <http://www.w3.org/TR/cors/>`_
* `Apache mod_headers <http://httpd.apache.org/docs/2.1/en/mod/mod_headers.html>`_
* `Lighttpd mod_setenv <http://redmine.lighttpd.net/wiki/1/Docs:ModSetEnv>`_
* `NGINX headers module <http://wiki.nginx.org/HttpHeadersModule>`_

An alternative to adhering to the CORS protocol, is to setting up a
proxy server forwarding requests to the foreign server in the background.
If you can do away with the benefits CDN provides this technique may be
a viable alternative.

**More information on Proxies**

* `Apache mod_proxy <http://httpd.apache.org/docs/2.1/mod/mod_proxy.html>`_
* `Lighttpd ModProxy <http://redmine.lighttpd.net/wiki/1/Docs:ModProxy>`_
* `NGINX proxy module <http://wiki.nginx.org/HttpProxyModule>`_


Local development
~~~~~~~~~~~~~~~~~
While the HTTP headers method presented above is the best practice
in production environments, it is unpractical for local development
of your application. Fortunately there are a couple of workarounds
making you develop with pleasure.

* Use a real web server (e.g. Apache) to deliver your site locally
* Use a web server with proxy module to fetch external resources
  form a live website
* Use browser flags to disable security measures

The latter one being the most flaky. It is not guaranteed that
the browser will support disabling security in the long run. Also
strange behaviour in case of magically enabled security after
updates in combination with browser caches.
