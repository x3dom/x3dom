var pathes = [
    "../../",
    "../../../x3dom/"
];

var fallback_path = "http://www.x3dom.org/x3dom/";
var found_path = "";
var not_found_count = 0;

for (var i in pathes){
    send_xhr(pathes[i]);
}
function send_xhr(path){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path + "tools/packages.json", false);
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            if(xhr.status == 200 || xhr.status == 0){
                //if already found elsewhere, stop
                if(found_path != ""){
                    return;
                }
                found_path = path;
                console.log("found path on: " + path);
                var group, p;
                var data = JSON.parse(xhr.response);
                for(group in data.grouplist){
                    for(p in data.grouplist[group].data){
                        document.write("<script src=\"" + path + "src/" + data.grouplist[group].data[p].path + "\"></script>");
                    }
                }
                setCSS(path);

                //this is only for tests
                document.write("<script src=\""+ path + "test/functional/media/js/tests.js\"></script>");
            }else{
                console.error('xhr status is not 200 on: ' + path);
                not_found_count++;
                if(not_found_count >= pathes.length){
                    console.log('FALLBACK to x3dom.org');
                    //only once
                    not_found_count = 0;
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
    //importcss.href = "media/css/tests.css";
    importcss.rel="stylesheet";
    headNode.appendChild(importcss);
}
