// load all x3dom JS files
(function() {

    var packages = "tools/packages.json";
    var fallback_path = "http://www.x3dom.org/x3dom/";
    var maxDepth = 6;
    send_xhr("../");

    function send_xhr(basePath){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', basePath + packages, false);

        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4) {
                if (xhr.responseText && (xhr.status == 200 || xhr.status == 0)) {
                    console.log("found x3dom script base path on: " + basePath);
                    setCSS(basePath);

                    var groupId, entryId, fileId;
                    var data = JSON.parse(xhr.responseText);
                    if (!data) {
                        console.error("cannot read " + packages);
                        return;
                    }

                    for(groupId in data.grouplist){
                        for(entryId in data.grouplist[groupId].data){
                            var entry = data.grouplist[groupId].data[entryId];
                            if(entry.path)
                            {
                                document.write("<script src=\"" + basePath + "src/" + entry.path + "\"></script>");
                            }
                            else if(entry.files && entry.files.length > 0)
                            {
                                var filePrefix = (entry.filePrefix)?entry.filePrefix:"";
                                for(fileId in entry.files)
                                {
                                    var fileEntry = entry.files[fileId];
                                    document.write("<script src=\"" + basePath + "src/" + filePrefix + fileEntry.file + "\"></script>");
                                }
                            }
                        }
                    }
                } else {
                    //console.error('xhr status is not 200 on: ' + path);
                    if (maxDepth-- > 0) {
                        send_xhr(basePath + "../");
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
