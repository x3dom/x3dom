var testtypes = require("./testtypes.js");
var retry_delay = 20;

var TestSuite = function(urlPrefix, outputPath, profile, tests, driver)
{
    var that = this;

    this.urlPrefix = urlPrefix;
    this.outputPath = outputPath;
    this.profile = profile;
    this.testList = tests;

    this.driver = driver;

    //current testing status
    this.currentTestId = 0;
    this.working = false;
    this.currentStepId = 0;
    this.stepWorking = false;
    this.currentResult;

    //results array
    this.results = [];

    //------------------------------------------------------------------------------------------------------------------

    //sequentially runs the defined tests
    this.runTests =  function(callback)
    {
        if(typeof that.callback === 'undefined')
            that.callback = callback;

        if(that.working)
        {
            setTimeout(that.runTests,retry_delay);
        }
        else
        {
            if(that.testList.length > that.currentTestId)
            {
                var test = that.testList[that.currentTestId];
                that.working = true;
                that.runTest(test);
                setTimeout(that.runTests,retry_delay);
            }
            else
            {
                that.driver.close();
                that.driver.quit();
                that.callback(profile, that.results);
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    this.runTest = function(test)
    {
        var url = that.urlPrefix+test.url;
        console.log("Testing on " + that.profile.name + ": " + url);

        var split = test.url.split("/");
        test.name = split[split.length-1].split(".")[0];

        this.driver.get(url);

        var result = new TestResult(test);
        result.screenshotCount = 0;
        that.results.push(result);
        that.currentResult = result;
        that.currentStepId = 0;
        that.runSteps();
    }

    //----------------------------------------------------------------------------------------------------------------------

    this.runSteps = function(){
        if(that.stepWorking){
            setTimeout(that.runSteps, retry_delay);
        }else{
            var test = that.testList[that.currentTestId];
            if(test.steps.length > that.currentStepId){
                that.stepWorking = true;
                that.runStep(test);
                setTimeout(that.runSteps, retry_delay);
            }else{ //finished all steps for current test
                that.working = false;
                that.currentTestId ++;
            }
        }
    }

    this.runStep = function(test){
        var step = test.steps[that.currentStepId];
        //console.log("Step: " + test.name + that.currentStepId);

        var instance = new testtypes[step.type];
        if(instance)
        {
            var context =
            {
                outputPath : that.outputPath +"/" + profile.name,
                driver : that.driver,
                test : test,
                stepId : that.currentStepId,
                result : that.currentResult,
                finishedCallback: function()
                {
                    that.currentStepId ++;
                    that.stepWorking = false;
                }
            };
            instance.run(context);
        }
        else
        {
            console.log("Could not create step: "+step.type);
            that.currentStepId++;
            that.stepWorking = false;
        }

    }

};

//----------------------------------------------------------------------------------------------------------------------

exports.TestSuite = TestSuite;
exports.TestSuite.runTests = TestSuite.runTests;

//----------------------------------------------------------------------------------------------------------------------

function TestResult(test)
{
    this.test = test;
    this.details = [];
}

exports.TestResult = TestResult;

//----------------------------------------------------------------------------------------------------------------------

function ErrorDetail(data)
{
    this.status = "error";
    this.data = data;
}

//----------------------------------------------------------------------------------------------------------------------

function SuccessDetail(data)
{
    this.status = "success";
    this.data = data;
}

//----------------------------------------------------------------------------------------------------------------------

function FailureDetail(data)
{
    this.status = "failed";
    this.data = data;
}

//----------------------------------------------------------------------------------------------------------------------

function InfoDetail(data)
{
    this.status = "info";
    this.data = data;
}

//----------------------------------------------------------------------------------------------------------------------

exports.ErrorDetail = ErrorDetail;
exports.SuccessDetail = SuccessDetail;
exports.FailureDetail = FailureDetail;
exports.InfoDetail = InfoDetail;