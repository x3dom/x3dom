var xhr = new XMLHttpRequest();
xhr.open('GET', '../../tools/packages.json', false);
xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
        if(xhr.status == 200 || xhr.status == 0){
            var group, p;
            var data = JSON.parse(xhr.response);
            for(group in data.grouplist){
                //skip COMPONENTS section
                if(data.grouplist[group].group == "COMPONENTS") continue;
                for(p in data.grouplist[group].data){
                    document.write("<script src=\"../../src/" + data.grouplist[group].data[p].path + "\"></script>");
                }
            }
        }else{
            console.error('xhr status is not 200');
        }
    }
};
xhr.send();

var headNode = document.getElementsByTagName("head")[0];

var importcss = document.createElement("link");
importcss.type = "text/css";
importcss.href = "../../src/x3dom.css";
//importcss.href = "media/css/tests.css";
importcss.rel="stylesheet";
headNode.appendChild(importcss);


//this is only for tests
document.write("<script src=\"media/js/tests.js\"></script>");