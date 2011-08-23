.. _imagesoundmovie:


Images, sound and movie formats
===============================

This tutorial shows what type of image, sound and movie formats can be used in X3DOM and what are the features and restrictions.


Images
------

You can use PNG_, JPEG_ or GIF_ to encode your static Texture data. JPG has a low memory profile but has a lossy compression and it does not support alpha channels. PNG compression is lossless and can handle alpha. GIF is also lossless and has alpha.

General: If you do not need an alpha channel and the content does not have hard edges (e.g. Text) use JPG. Otherwise use PNG. You should really not use GIF anymore. PNG is more flexible for future content (e.g. 16-bit channels).

.. code-block:: xml

    <ImageTexture url=’foo.jpg’ />

Sound
-----

You can use WAV_, MP3_ and OGG_ for sound sources. All UA should support WAV. If you would like to use compressed formats (e.g. MP3 or OGG) provide alternative encodings in your AudioClip node.

.. code-block:: xml

    <AudioClip url=’”foo.wav”,”foo.ogg”‘ />

Movies
------

There is right now no single movie file supported by all user agents. Use the `X3DOM formats exmaple <http://x3dom.org/x3dom/example/x3dom_video.xhtml>`_ to check your browser.

The best solution right now is to encode your content as MP4_ and OGV_ movie and provide alternative sources in your MovieTexture node.

.. code-block:: xml
    
    <MovieTexture url=’”foo.mp4″,”foo.ogv”‘ />



.. _PNG: http://en.wikipedia.org/wiki/Portable_Network_Graphics
.. _JPEG: http://en.wikipedia.org/wiki/Jpeg
.. _GIF: http://en.wikipedia.org/wiki/Gif
.. _WAV: http://en.wikipedia.org/wiki/Wav
.. _MP3: http://en.wikipedia.org/wiki/Mp3
.. _OGG: http://en.wikipedia.org/wiki/Ogg
.. _MP4: http://en.wikipedia.org/wiki/MP4
.. _OGV: http://en.wikipedia.org/wiki/OGV
