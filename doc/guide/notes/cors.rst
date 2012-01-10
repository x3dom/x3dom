.. _cors:

Loading resources from external servers
========================================

Sometimes it is desirable to load resources, like textures, from other
locations than your web server. The most common use case being serving
textures from a `CDN <http://en.wikipedia.org/wiki/Content_delivery_network>`_.
While technically not a problem, there are security mechanisms
in place to prevent injection of malicious code into your application.
Browser vendors started to block loading of resources originating from
domains unless these resources marked safe by the foreign web server.

The corresponding W3C specification is called
Cross-Origin Resource Sharing [CORS2010]_ and adhered to by most browsers.
And in essence, you need to configure the
foreign web server to add a HTTP header that marks the resource safe for
your domain. Say, your application is served from ``http://yoursite.org`` and
needs to load resources from ``http://othersite.org``, the webserver of
``othersite.org`` needs to set a HTTP header that marks ``yoursite.org``
safe for cross site requests. For example::

    Access-Control-Allow-Origin: http://yoursite.org

An alternative to adhering to the CORS protocol, is to setting
up a proxy server forwarding requests to the foreign server in the background.
If you can do away with the benefits CDN provides this technique may be
a viable alternative.

*More information on CORS and setting HTTP headers:*

* `Cross-Origin Resource Sharing <http://www.w3.org/TR/cors/>`_
* `Apache mod_headers <http://httpd.apache.org/docs/2.1/en/mod/mod_headers.html>`_
* `Lighttpd mod_setenv <http://redmine.lighttpd.net/wiki/1/Docs:ModSetEnv>`_
* `NGINX headers module <http://wiki.nginx.org/HttpHeadersModule>`_

*More information on proxy configuration:*

* `Apache mod_proxy <http://httpd.apache.org/docs/2.1/mod/mod_proxy.html>`_
* `Lighttpd ModProxy <http://redmine.lighttpd.net/wiki/1/Docs:ModProxy>`_
* `NGINX proxy module <http://wiki.nginx.org/HttpProxyModule>`_


Developing locally
------------------
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


Using a web server
~~~~~~~~~~~~~~~~~~
Installing a web server locally and serving your files under
the localhost domain is the best way of developing web applications. We also
recommend you use this technique when developing with X3DOM. Using a full web
stack locally ensures that your browser behaves the same way it would when
loading a website over the internet. Requests are sent and received by the
browser just like they would in a production environment. It is also
the only way to properly test Ajax functionality and HTTP features, like
expiry headers.

There are various ways to install a web server on your machine. In case of
Mac OS X, Apache is already installed and you can just put your documents in
your `Site` folder.

On Linux there are
`various ways to install Apache <http://www.google.com/?q=linux+apache+howto>`_
depending on your distribution. Most likely two or three commands should
suffice.

Windows users are best served with a package called
`XAMPP <http://www.apachefriends.org>`_, which also caters  various Unix based
systems.


Using a web server with proxy pass
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
What about external resources in local development, I want to develop locally
and load textures from ``textureheaven.net``. You could install as system wide
proxy server, which processes the request and response to ``textureheaven.net``
and adds the correspoding CORS header to the response. Another straight forward
way is to leverage the power of what you already have: your local web server.

The setup is more elaborate and out of the scope of this document. Here are
some pointer of how to get started.


First you need to confiture your web server to answer requests to
``textureheaven.net`` instead of sending those requests to the real
``textureheaven.net`` web server. To do so you need to make an entry in
your ``/etc/hosts`` file so the address does not resolve to the real site
but to ``localhost``. Within your web server configuration you now create
a virtual host that answers requests to ``textureheaven.net`` and proxies
them request to the real ``textureheaven.net`` site. In order to make this
all work, you finally need to add a CORS header to the response
(e.g. ``Access-Control-Allow-Origin: http://localhost``)

Sounds too complicated? There's a shortcut way. But as with all shortcuts,
use it with caution.


Disable browser security
~~~~~~~~~~~~~~~~~~~~~~~~

If you have all resources locally, there is a shortcut for circumventing
the CORS mechanisms. Please use with care.


Chrome
++++++

The Chrome browser allows you to disable a security precaution that prevents
you loading resources from disk. Use the following startup parameters::

    --allow-file-access-from-files
    --allow-file-access

To disable CORS protection for loading files from foreign servers, use the
following startup switch::

    --disable-web-security


Firefox
+++++++

Enter the following in your location bar::

    about:config

Acknowledge the secuirty warning and enter the following in the filter bar::

    fileuri

Look for the option called **security.fileuri.strict_origin_policy** and
set it to **false**.






.. [CORS2010] Cross-Origin Resource Sharing, W3C, 2010.
    Available online at http://www.w3.org/TR/cors/
