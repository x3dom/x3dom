.. _complex_models:

.. sectionauthor:: Andreas Aderhold <andreas.aderhold@igd.fraunhofer.de>

*+++ Draft +++*

Complex models
==============

While X3DOM is very well suited for small models up to a few
kilobytes in size, big models can become a major problem. This
section takes a look at the different aspects involved and
tries to find partial solutions to the problem. The problems can
be broken down to the following areas:

  * Loading a HTML/X3D file containing a lot of data
  * Parsing data into the DOM
  * Storing data in memory

And server side:

  * I/O when sending big files (sendfile)
  * Server stalling because user presses "reload" endlessly when
    not informed that an operation is in progress and consequently
    exhausting free server slots.

While most of these problems are inherent to the domain we are moving in,
and not X3DOM specific, measures can be taken to optimize loading of
large chunks of data, especially cutting down transmission time over
the network.

Another, more complex problem, is presented by the way JavaScript and DOM
work. There is no manual memory management possible and freeing up memory
is left to the garbage collector that runs at intervals out of our control.
We can not even manually start garbage collection. And if we could, there
is quite some overhead involved in garbage collection.

The only alternative to cope with the memory specific problem is
circumventing the DOM entirely parsing. While this somewhat defies the
purpose of X3DOM, it may present a viable alternative for performance critical
applications. Various techniques and ideas are explored further in the
following sections.

It is paramount to keep in mind, no matter how much we optimize, the use of
complex models is limited by the following boundaries:

  * Memory of client (storing more data)
  * Processing power of client machine (parsing more faster)

In the following sections we are presenting various tools and techniques
to optimize various aspects of loading big models.



Delivering deflated content (HTTP/1.1)
--------------------------------------

The most obvious idea is to compress the HTML/XML files. Luckily this is
the easiest to implement and will improve performance of loading time
significantly. Most web browsers support the deflate algorithms (ZIP) and
can handle compressed files on the fly. The web server is configured to
compress HTML files before delivering them to the client. By means of
setting the HTTP (`Accpet-Encoding <http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html>`_),
header, denoting a compressed file arrives, the client can act on this
information and decompress the deflated file on the fly. Any browser
that supports the HTTP/1.1 should be able to handle deflated input.

In order to enable your webserver to compress the files during
transport, the configuration needs to be alterd. How to achieve this
can be found in you web server documentation. For exmaple:

  * `Apache <http://httpd.apache.org/docs/current/mod/mod_deflate.html>`_
  * `NGINX <http://wiki.nginx.org/HttpGzipModule>`_
  * `Lighttpd <http://redmine.lighttpd.net/wiki/1/Docs:ModCompress>`_

If you are using a different web server, refer to its documentation.

**Benefits**

It is considered good practice for web development to enable in-memory
compression for text resources like HTML, CSS, JS. Tests showed that
file size can be reduced to about 50%. Transmission time should be
typically cut in half. For exmaple, the vary large model of the walking
soldier () is about 13MB in size. Using GZIP compression, this model
is only 5.2MB big.


**Drawbacks**

This method does not present us with any significant drawbacks.

A slight overhead on server- and client-side processing power is
inherent with on-the-fly compression. Caching techniques of
web servers and browser mitigate the small performance hit of
on-the-fly compression.

An actual benchmark of decompressing the soldier model has not
yet been conducted. However the ventured guess is that the savings
of network time outperform the decompression algorithm which
runs naively.

For very large files this technique may not be beneficial since
the server may block too long during compression or the client,
especially with slow clients, may take to long to decompress. This
however needs to be verified and tested.

We recommend to enable compression on your web server and only out out
if there are  performance hits than can be attributed to compression.



Makeing use of browser side caching
-----------------------------------

  * Etags
  * Expire headers
  * HTML5 offline stuff?
  * etc.



Using asynchronous loading (aka Ajax)
-------------------------------------

X3D inline
Ajax

**Benefits**

**Drawbacks**

The most significant drawback of the current XMLHttpRequest object
implementations is the complete ignorance of the HTTP Accept-Encoding
header. While lazy loading geometry data is possible using either the
X3D inline element or custom code to load a model and modify the DOM,
the lack of compression makes this process rather slow.



Using geometry images
---------------------

    * `<http://research.microsoft.com/en-us/um/people/hoppe/proj/gim/>`_
    * `<http://graphicrants.blogspot.com/2009/01/virtual-geometry-images.html>`_
    * `<http://www.cs.jhu.edu/%7Ebpurnomo/>`_
    * `<http://www.uni-koblenz.de/~cg/Studienarbeiten/gpu_mesh_painting_ritschel.pdf>`_
    * `<http://wiki.secondlife.com/wiki/Sculpted_prim>`_


**Benefits**

  * Uses canvas to decode (native speed)
  * Circumvents the DOM for better performance

**Drawbacks**

  * Circumvents the DOM
  * Use cases limited to simpler geometry?





Web server optimizations
------------------------

Optimization of a web server is not exactly a core topic of X3DOM. To give you
a starting point, we collected some resources that should get you going:

    * Apache
    * YSlow
    * yada, et cetera et al.
