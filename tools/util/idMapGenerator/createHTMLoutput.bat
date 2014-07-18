REM this script for encoded shadowIDs first removes the old generated folder
rmdir /s /q opt\
mkdir opt
rem idmap(XXX) creates an id-map called XXX.json (as given as 1st cmd line param via %*)
rem Prefix(%%~ni) adds a prefix to the node names, in our case ataXX as derived from file name
for %%i in (*.wrl) do aopt.exe -i %%i -O %%~ni -F Scene:"cacheopt(true),idmap(%*),Prefix(%%~ni)" -v opt/%%~nxi
rem move json to opt folder
move %*.json opt/%*.json
cd opt
rem beware that only *nix style cat, as on cygwin, creates files in correct encoding
cat *.wrl > all.wrl
rem finally, create binary geometry with normals encoded in w component to save memory (flag p) and id's encoded in texCoord (d)
mkdir binGeo
aopt -i all.wrl -V -G binGeo/:sacpd -D Shape -N output.html
