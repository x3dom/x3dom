

var createDir = function(path, fcallback){
    var fs = require('fs');
    if(!fcallback){
        fcallback=function(){};
    }
    fs.exists(path,function(exists)
    {
        if(!exists)
        {
            fs.mkdir(path, fcallback);
            return;
        }
        else
            fcallback();
        return;
    });
}

//create the folders and then write the file. If file end on '/', only create the folders
var writeFile = function(file, content, callback){
    var fs = require('fs');
    if(!callback)callback=function(){};
    var path = ".";
    var folderList = file.split('/');

    if(folderList.length == 0)
    {
        callback();
    }
    else
    {
        for (var i = 0; i<folderList.length - 1;i++){
            path += '/' + folderList[i];
            if(i == folderList.length - 2)
            {
                createDir(path, function()
                {
                    path += '/' + folderList[folderList.length - 1];
                    if(content)
                    {
                        fs.writeFile(path, content, callback);
                        return;
                    }
                    else
                    {
                        createDir(path, callback);
                        return;
                    }
                })

            }else{
                createDir(path);
            }
        }
    }
}

exports.writeFile = writeFile;
exports.createDir = createDir;
