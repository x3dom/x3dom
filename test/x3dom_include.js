// load all x3dom JS files
(function() {

var pathes = [
    "../../",
	"../",		// examples
    "../../../x3dom/",
    "../../../../x3dom/",
    "../../../../"
];

var packages = "tools/packages.json";
var fallback_path = "http://www.x3dom.org/x3dom/";
var i = 0;

if (i < pathes.length)
    send_xhr(pathes[i++]);

function send_xhr(path){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path + packages, false);

    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
            if (xhr.responseText && (xhr.status == 200 || xhr.status == 0)) {
                console.log("found x3dom script base path on: " + path);
                setCSS(path);

                var group, p;
                var data = JSON.parse(xhr.responseText);
                if (!data) {
                    console.error("cannot read " + packages);
                    return;
                }

                for(group in data.grouplist){
                    //skip COMPONENTS section
                    if(data.grouplist[group].group == "COMPONENTS")
                        continue;
                    for(p in data.grouplist[group].data){
                        document.write("<script src=\"" + path + "src/" + 
						data.grouplist[group].data[p].path + "\"></script>");
                    }
                }

                //this is only for tests
                document.write("<script src=\""+ path + "test/functional/media/js/tests.js\"></script>");
            } else {
                console.error('xhr status is not 200 on: ' + path);
				if (i < pathes.length) {
					send_xhr(pathes[i++]);
				}
				else {
                    console.warn('FALLBACK to x3dom.org base path');
                    send_xhr(fallback_path);
				}
            }
        }
    };
    xhr.send();
}

function setCSS(path){
    var headNode = document.getElementsByTagName("head")[0];

    var importcss = document.createElement("link");
    importcss.type = "text/css";
    importcss.href = path + "src/x3dom.css";
    console.log("including CSS from: " + importcss.href);
    importcss.rel="stylesheet";
    headNode.appendChild(importcss);
}

})();
