var ts = require("./testsuite.js");
var rp = require("./resultspublisher.js");
var fs = require("fs");
var rmdir = require("rimraf");


globals = new Object();
globals.screenshotDelay = 100;
globals.referencePath = "test/reference/";
globals.configuration = "configuration.json";
globals.testOnly = false;
globals.publishOnly= false;


function run(){
    if(!globals.publishOnly)
    {
        var testsuite = new TestSuite();
        testsuite.startTesting(function(){

        })
    }
}

function removeOutput(callback){
    //delete outfolder
    try{
        rmdir.sync("output",function(){
            console.log("Error removing output folder");
        });
    }catch(e){};
    fs.exists("output", function(exists){
        if(exists)
        {
            console.log("remove output");
            removeOutput(callback);
        }
        else
        {
            callback();
        }
    });
}

function parseConfig()
{
    fs.readFile(globals.configuration,function(err, data)
    {
        if(err)
            console.log("Could not find configuration file: "+configuration);
        else
        {
            var config = JSON.parse(data);

            if(!config)
                console.log("Error reading configuration file: "+configuration);

            console.log("deleting output folder...");
            removeOutput(function(){
                var publisher = new rp.ResultsPublisher();
                if(globals.publishOnly)
                {
                    publisher.publishResults(config, function(){
                        //done;
                    });
                }
                else
                {
                    var testsuite = new ts.TestSuite(config);
                    testsuite.startTesting(function(profile, results, id, callback){
                        if(!globals.testOnly)
                        {
                            publisher.storeResults(profile, results, id, config, callback);
                        }
                        else{
                            callback();
                        }
                    }, function(){
                        if(!globals.testOnly)publisher.publishResults(config, function(){
                            //done;
                        });
                    });
                }
            });

        }
    });
}

//parse command line arguments
process.argv.forEach(function(val, index, array){
    if(index > 1)
    {
        if(val == '-c' || val == '--conservative')
        {
            console.log("Running in conservative mode");
            globals.screenshotDelay = 5000;
        }
//        if(val == '-n' || val == '--no-aa')
//        {
//            console.log("Using reference folder: test/reference-no-aa");
//            globals.referencePath = "test/reference-no-aa/";
//        }
        if(val == '-t' || val == '--testing-only')
        {
            globals.testOnly = true;
        }
        if(val == '-p' || val == '--publish-only')
        {
            globals.publishOnly = true;
        }
    }
});
parseConfig();
