#!/bin/sh
#generate html for all examples to dist/examples
mkdir dist/examples
cp -r test/functional/ dist/examples
cp -r test/regression-suite/test/cases/ dist/examples
cd dist/examples
examples=$(find ./ -name '*html')
#patch to use build
sed -i 's|<script.*include.js.*script>|<script type="text/javascript" src="/x3dom-full.debug.js"></script>\n    <link rel="stylesheet" type="text/css" href="/x3dom.css" />|' $examples
#generate html
cat <<HTMLEND > index.html && cd ../.. && exit
<html>
  <head>
    <title>X3DOM examples</title>
  </head>
  <body>
    <h1> X3DOM examples</h1>
    <ol type='I'>
      $(cd dist; ls -lhr --time-style=long-iso * components/* | grep -v html | awk 'NF==8 {print "<li><strong><a href=\""$8"\">"$8"</a>", $5"</strong>", $6, $7 "</li>"}' | head -n -9)
    </ol>
    <footer style='text-align: end'> examples </footer>
  </body>
</html>
HTMLEND
