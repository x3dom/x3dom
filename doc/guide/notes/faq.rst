.. _faq:

FAQ
===

**Q: Why declarative 3D in HTML? Can I not just use WebGL, O3D, etc.**
    WebGL_, O3D_ or [your favorite 3D-JS lib] are made by gfx-coders for
    gfx-coders who know how to deal with a 4×4 transformation matrix and 
    speak GLSL as their first language. Most web-page developer have a
    different profile. They just would like to build their 3D-UI, 
    Visual-Analytics or Web-Shop application and want to utilize some 3D 
    technology.

    If you build the next high-end browser-based online game or visualization 
    demo then use WebGL or O3D. But if you simply need some 3D elements in  
    your Web-App then try X3DOM.


**Q: Why X3D? Can I not just use Collada, VRML, OBJ, etc.**
    3D (X)HTML-ized graphics requires a royalty-free, open and standardized 
    XML-encoded format. Therefore Collada_ or X3D_ are the best candidates 
    (however you can easily `convert VRML to X3D-XML <http://www.instantreality.org/tools/x3d_encoding_converter/>`_).

    Collada_ is really designed as interchange and intermediate format to  
    transport and manage your 3D data. The `Collada specification <http://www.khronos.org/files/collada_spec_1_5.pdf>`_ does not include, unlike 
    X3D, a `runtime or event model <http://www.web3d.org/x3d/specifications/ISO-IEC-19775-1.2-X3D-AbstractSpecification/Part01/concepts.html#Runtimeenvironment>`_, which is needed for 
    per-frame updates on the 3D-side (e.g. animations). Therefore this project 
    uses a well defined `subset of X3D <http://www.x3dom.org/?page_id=158>`_ (called Profile in the X3D-World) for X3DOM. For more background information 
    about how Collada and X3D relate and why **“X3D is ideal for the Web”** 
    please read the `Whitepaper <http://www.khronos.org/collada/presentations/Developing_Web_Applications_with_COLLADA_and_X3D.pdf>`_ by `Rémi Arnaud <http://software.intel.com/en-us/blogs/author/remi-arnaud/>`_ and `Tony Parisi <http://flux.typepad.com/>`_.


**Q: Why JS? Can you not write the system/plugin in C++, Java, …**

    Well, the developer of this project worked on different native `commercial and open-source X3D-runtimes <http://www.web3d.org/x3d/content/examples/X3dResources.html#Applications>`_  
    before. The limitations of the current plugin interface (e.g. how to 
    monitor DOM-changes) would make a implementation hard or even imposible.

    In addition, we just wanted an open source test environment, which is 
    small, works without any plugin and can be easily modified to inspire and 
    follow the integration-model easily. And first tests showed that the 
    increasing performance of JavaScript and WebGL would lead to impressive 
    results.

**Q: Why any standardization and native implementation if there is already the X3DOM-JS runtime?**

    Short answer: Feature and Speed. The current JS/WebGL layer does not allow 
    to implement e.g. spatial `Sound <http://www.web3d.org/x3d/specifications/ISO-IEC-19775-1.2-X3D-AbstractSpecification/Part01/components/sound.html#Sound>`_ or specific image loader and 
    although WebGL is an impressive step forward we still have to do all the 
    scene management and updates in JS.


.. _WebGL: http://www.khronos.org/news/press/releases/khronos-webgl-initiative-hardware-accelerated-3d-graphics-internet/
.. _O3D: http://code.google.com/apis/o3d/
.. _Collada: http://www.khronos.org/collada/
.. _X3D: http://www.web3d.org/about/overview/