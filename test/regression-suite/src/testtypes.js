var fw = require('./filewriter');
var fs = require("fs");
//var gm = require('gm');
//gm.compare = require('./comparemod.js')();
var ts = require('./testsuite');
var webdriver = require("selenium-webdriver");
var resemble = require("resemble");



function getName(path)
{
    return path.replace("\\", "/").replace(/^\/(.+\/)*(.+)\.(.+)$/i, '$2');
}


function CompareScreenshot()
{
    var that = this;

    this.run = function(context)
    {
        that.context = context;

        var step = context.test.steps[context.stepId];

        context.screenshotId = context.result.screenshotCount;
        var filename = context.test.name + "_" +(context.result.screenshotCount++)+".png";
        var renderedImagePath = context.outputPath+"/"+filename;

        var referenceImagePath = globals.referencePath+filename;

        setTimeout(function(){
            that.writeRenderedImage(context.driver, step.params, renderedImagePath, function()
            {
                that.compareImages(referenceImagePath, renderedImagePath, context);
            });
        }, globals.screenshotDelay);
    };

    this.writeRenderedImage = function(driver, params, outputPath, callback)
    {
        var script = "var x3d_node = document.getElementById('"+params.x3d+"');if(!x3d_node) x3d_node = document.getElementsByTagName('x3d')[0]; return x3d_node.runtime.getScreenshot()";


        driver.executeScript(script)
            .then(function (return_value) {
                var buf = new Buffer(return_value.replace(/^data:image\/png;base64,/, ''), 'base64');
                //console.log("OutputPath: " +outputPath);
                fw.writeFile(outputPath, buf, function (err) {
                    if (err) {
                        console.log("Error writing rendered image: " + err);
                        that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "type" : "CompareScreenshot", "error": err}));
                        that.context.finishedCallback();
                    }
                    else
                        callback();
                });
            }, function(err)
            {
                console.log("Error executing screenshot script: " + err);
                that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "type" : "CompareScreenshot", "error": err}));
                that.context.finishedCallback();
            });

    };


    this.compareImages = function(referenceImagePath, renderedImagePath, context)
    {
        //console.log(referenceImagePath + " <-> "+renderedImagePath);
        fs.exists(referenceImagePath, function(exists){
            if(!exists)
            {
                that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "type" : "CompareScreenshot", "error": {"message" : "Reference image not found!"}}));
                that.context.finishedCallback();
            }
            else
            {
                resemble.resemble(referenceImagePath).compareTo(renderedImagePath).onComplete(function(data){
                    var equal = data.misMatchPercentage < that.context.config.settings.misMatchPercentage;
                    //console.log(equal + "  " + data.misMatchPercentage + " " +that.context.config.settings.misMatchPercentage);
                    if(!equal)
                    {
                        //write diff
                        var diffImage = renderedImagePath.replace(/(.*\/)(?!(.*\/.*))/i, '$1diff/');
                        var diffImageFolder = diffImage.substring(0, diffImage.lastIndexOf("/"));
                        var buf = new Buffer(data.getImageDataUrl().replace(/^data:image\/png;base64,/,''),'base64');
                        fw.writeFile(diffImage, buf, function(err){
                            if(err)
                            {
                                console.log("Error writing rendered image: "+ err);
                                that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "type" : "CompareScreenshot", "error": err}));
                                that.context.finishedCallback();
                            }
                        });
                    }
                    that.context.result.details.push( equal ?
                            new ts.SuccessDetail(
                                {
                                    "screenshotId"   : that.context.screenshotId,
                                    "equality"      : data.misMatchPercentage,
                                    "type" : "CompareScreenshot",
                                    "testName"   : getName(context.test.url)
                                }) :
                            new ts.FailureDetail(
                                {
                                    "screenshotId"   : that.context.screenshotId,
                                    "equality"      : data.misMatchPercentage,
                                    "type" : "CompareScreenshot",
                                    "testName"   : getName(context.test.url)
                                }
                            )
                    );
                    that.context.finishedCallback();
                });

            }
        });

//        gm.compare(referenceImagePath, renderedImagePath, 0.0001,
//            function(cerr, isEqual, equality, raw)
//            {
//                if(cerr)
//                {
//                    //console.log("Error comparing images: "+cerr);
//                    console.log("Reference Image not found: " + referenceImagePath);
//                    that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "error": cerr}));
//                }
//                else
//                {
//                    //if not equal render difference image
//                    var diffImage;
//                    if(!isEqual)
//                    {
//                        diffImage = renderedImagePath.replace(/(.*\/)(?!(.*\/.*))/i, '$1diff/');
//                        var diffImageFolder = diffImage.substring(0, diffImage.lastIndexOf("/"));
//                        var options = {
//                            highlightStyle: 'Threshold',
//                            highlightColor: 'red', // optional. Defaults to red
//                            file: diffImage // required
//                        };
//
//                        fw.writeFile(diffImageFolder, "", function(err){
//                        if(err)
//                            console.log(err);
//                        else
//                        {
//                            gm.compare(referenceImagePath, renderedImagePath, options, function(cerr)
//                            {
//                                if(cerr)
//                                    console.log(cerr);
//                            });
//                        }
//                        });
//                    }
//
//                    that.context.result.details.push( isEqual ?
//                        new ts.SuccessDetail(
//                            {
//                                "context"   : that.context,
//                                "equality"      : equality,
//                                "raw" : raw,
//                                "type" : "CompareScreenshot"
//                            }) :
//                        new ts.FailureDetail(
//                            {
//                                "context"   : that.context,
//                                "equality"      : equality,
//                                "raw" : raw,
//                                "type" : "CompareScreenshot"
//                            }));
//
//                }
//                that.context.finishedCallback();
//
//            }
//        );
    }
}

function CompareValue(){
    var that = this;

    this.run = function(context){
        that.context = context;
        var fieldId = context.test.steps[context.stepId].params.id;
        var floatingPoints = 10;
        var referenceValue = parseFloat(context.test.steps[context.stepId].params.value).toFixed(floatingPoints);
        var script = "return document.getElementById('" + fieldId + "').innerHTML;";
        context.driver.executeScript(script).then(function(val){
            var actualValue = parseFloat(val).toFixed(floatingPoints);
            var distance = actualValue - referenceValue;
            var detail = {
                "distance" : distance,
                "actualValue" : actualValue,
                "referenceValue" : referenceValue,
                "type" : "CompareValue",
                "testName"   : getName(context.test.url)
            };
            that.context.result.details.push(
                (distance < referenceValue * that.context.config.settings.misMatchPercentage) ? new ts.SuccessDetail(detail) : new ts.FailureDetail(detail)
            );
            that.context.finishedCallback();
        }, function(err)
        {
            console.log("Error executing screenshot script: " + err);
            that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "type" : "CompareValue", "error": err}));
            that.context.finishedCallback();
        });
    }
}

function ExecuteCommand(){
    var that = this;

    this.run = function(context){
        that.context = context;
        var script = context.test.steps[context.stepId].params.command;

        context.driver.executeScript(script).then(function(){
            that.context.result.details.push(new ts.InfoDetail(
                {
                    "info"   : script,
                    "type"   : "ExecuteCommand"
                }));
            that.context.finishedCallback();
        }, function(err)
        {
            console.log("Error executing screenshot script: " + err);
            that.context.result.details.push(new ts.ErrorDetail({"description": that.context.stepId, "error": err}));
            that.context.finishedCallback();
        });
    }
}

function ExecuteClick(){
    var that = this;
    var tries = 0;

    this.run = function(context){
        that.context = context;
        click();
    };
    function click(){
        var context = that.context;
        if(tries++ > 10){
            return context.finishedCallback();
        }
        var coords = {};
        coords.x = parseInt(context.test.steps[context.stepId].params.x);
        coords.y = parseInt(context.test.steps[context.stepId].params.y);
        var target = context.test.steps[context.stepId].params.x3d;
        if(target){
            target = "x3dom-" + target + "-canvas";
        }else{
            target = "x3dom-canvas";
        }
        context.driver.findElement(webdriver.By.id(target)).then(function(canvas){
            var as = new webdriver.ActionSequence(context.driver);
            as.mouseMove(canvas, coords).click().perform().then(function(){
                context.finishedCallback();
            }, function(err){
                console.log(err);
                setTimeout(click, 20);
            });
        }, function(err){
            console.log(err);
            setTimeout(click, 20);
        });
    }
}

function ExecuteDrag(){
    var that = this;
    var tries = 0;

    this.run = function(context){
        that.context = context;
        drag();
    }

    function drag(){
        var context = that.context;
        if(tries++ > 10){
            return context.finishedCallback();
        }
        var target  = context.test.steps[context.stepId].params.target;
        context.driver.findElement(webdriver.By.id(target)).then(function(elem){
            var coords0 = {};
            var coords1 = {};
            coords0.x = parseInt(context.test.steps[context.stepId].params.x.split(" ")[0]);
            coords0.y = parseInt(context.test.steps[context.stepId].params.y.split(" ")[0]);
            coords1.x = parseInt(context.test.steps[context.stepId].params.x.split(" ")[1]);
            coords1.y = parseInt(context.test.steps[context.stepId].params.y.split(" ")[1]);
            new webdriver.ActionSequence(context.driver).mouseMove(elem, coords0).mouseDown().mouseMove(elem, coords1).mouseUp().perform().then(function(){
                context.finishedCallback();
            }, function(err){
                console.log(err);
                setTimeout(drag(), 20);
            });
        }, function(err){
            setTimeout(drag(), 20);
        });
    }
}

function Wait(){
    this.run = function(context){
        var time = parseInt(context.test.steps[context.stepId].params.time);
        setTimeout(function(){
            context.finishedCallback();
        }, time);
    }
}

exports.CompareScreenshot = CompareScreenshot;
exports.CompareValue = CompareValue;
exports.ExecuteCommand = ExecuteCommand;
exports.ExecuteClick = ExecuteClick;
exports.ExecuteDrag = ExecuteDrag;
exports.Wait = Wait;

