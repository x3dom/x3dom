START "seleniumfirefox" java -DSTOP.PORT=8079 -DSTOP.KEY=secret -jar selenium-server-standalone-2.39.0.jar
START "nodeserv" node.exe src/server.js
TIMEOUT 2 > nul
node src/x3dom-regression.js
taskkill /fi "WINDOWTITLE eq nodeserv"
taskkill /fi "WINDOWTITLE eq seleniumfirefox"