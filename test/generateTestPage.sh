#!/bin/sh
#generate html for all examples to dist/examples
mkdir dist/examples
cp -r test/functional/ dist/examples
cp -r test/regression-suite/test/cases/ dist/examples
cd dist/examples
examples=$(find ./ -name '*html')
#patch to use build
sed -i 's|<script.*include.js.*full.*script>|<script type="text/javascript" src="/x3dom-full.js"></script>\n    <link rel="stylesheet" type="text/css" href="/x3dom.css" />|' $examples
sed -i 's|<script.*include.js.*script>|<script type="text/javascript" src="/x3dom.js"></script>\n    <link rel="stylesheet" type="text/css" href="/x3dom.css" />|' $examples
#generate html
cat <<HTMLEND > index.html && cd ../..
<html>
  <head>
    <title>X3DOM examples, $(date)</title>
  </head>
  <body>
    <h1> X3DOM examples</h1>
    <ol type='i'>
      $(for f in $examples; do echo "      <li><a href=\"$f\"> ${f#*/} </a></li>" ; done | sort)
    </ol>
    <footer style='text-align: end'> $(date) </footer>
  </body>
</html>
HTMLEND
