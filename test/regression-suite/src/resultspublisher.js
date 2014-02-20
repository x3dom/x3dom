var fw = require('./filewriter');
var ResultsPublisher = function(outputPath)
{
    var that = this;
    this.outputPath = outputPath;


    //Create output folder
    fw.writeFile(that.outputPath + '/');

    //------------------------------------------------------------------------------------------------------------------

    this.publishOverview = function()
    {
        var pageStart = "<html><head><title>x3dom Regression Tests for "+ p
        var pageEnd = "</ul></body>";
    };

    //------------------------------------------------------------------------------------------------------------------

    this.publishResults = function(profile, results)
    {
        var fullPath = that.outputPath+"/"+profile.name+"/";

        var statistics =
        {
            "count" : results.length,
            "failed" : 0,
            "passed" : 0
        };

        var contents = [];

        for(var r in results)
        {
            var result = results[r];
            that.evaluateTestResult(result,statistics,contents);
        }


        var includes = "<link rel='stylesheet' href='../../jquery-ui-1.10.4.custom/css/smoothness/jquery-ui-1.10.4.custom.min.css'/><script src='../../jquery-ui-1.10.4.custom/js/jquery-1.10.2.js'></script><script src='../../jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js'></script>";
        var script = "<script>$(function(){$(\".accordion\").accordion({collapsible: true, heightStyle: 'content', active: false});});</script>"
        var pageStart = "<html><head>"+includes+script+"<title>x3dom Regression Tests for "+ profile.name +"</title></head><body><h1>"+profile.name +" results overview - "+ statistics.passed +" / "+ (statistics.passed + statistics.failed) +" passed</h1>";
        var pageEnd = "<br/><br/><br/><br/>"+"</body>";

        var details = contents.join("");

        fw.writeFile(fullPath+"index.html", pageStart+details+pageEnd);
    }

    //------------------------------------------------------------------------------------------------------------------

    this.evaluateTestResult = function(result, statistics, content)
    {
        var success = true;

        var resultText = "";

        for(var d in result.details)
        {
            var detail = result.details[d];

            if(detail.data.context){
                var step = detail.data.context.test.steps[detail.data.context.stepId];
                var image = result.test.name + "_" + detail.data.context.screenshotId + ".png";
                var difftag = "<a target='_blank' href='diff/" + image + "'><img width = '200px' height = '150px' src='diff/" + image + "'/></a>";
                var imagetag = "<a target='_blank' href='" + image + "'><img width = '200px' height = '150px' src='" + image + "'/></a>";
                var reftag = "<a target='_blank' href='../../test/reference/" + image + "'><img width = '200px' height = '150px' src='../../test/reference/" + image + "'/></a>";
                if(detail.status == 'success')
                {
                    statistics.passed++;
                    if(detail.data.type == "CompareScreenshot") //CompareScreenshot
                    {
                        resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + step.type + "</h3><div>Difference: " + detail.data.equality + "<br/>" + imagetag + reftag + "<br/>" + "</div></div>";
                    }else if(detail.data.type == "CompareValue") //CompareValue
                    {
                        resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + step.type + "</h3><div>Distance: " + detail.data.distance + "<br/>Value: " + detail.data.actualValue + "<br/>Reference: " + detail.data.referenceValue + "</div></div>";
                    }
                }
                else if(detail.status == 'failed')
                {
                    statistics.failed++;
                    if(detail.data.type == "CompareScreenshot") //CompareScreenshot
                    {
                        resultText += "<div class='accordion' style='width: 500px; '><h3 style='background: none; background-color: #ff7e74;'>" + step.type + "</h3><div>Difference: "+detail.data.equality+"<br/>" + imagetag + reftag + difftag + "<br/>" + "</div></div>";
                    }else if(detail.data.type == "CompareValue") //CompareValue
                    {
                        resultText += "<div class='accordion' style='width: 500px; '><h3 style='background: none; background-color: #ff7e74;'>" + step.type + "</h3><div>Distance: " + detail.data.distance + "<br/>Value: " + detail.data.actualValue + "<br/>Reference: " + detail.data.referenceValue + "</div></div>";
                    }
                }
                else if(detail.status == 'info')
                {
                    resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + step.type + "</h3><div>"+detail.data.info + "</div></div>";

                }
                else if(detail.status == 'error')
                {
                    resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #ff7e74; '>" + step.type + "</h3><div>"+detail.data.error + "</div></div>";
                }
            }
        }




        content.push("<h3>"+result.test.name+"</h3><div>" + resultText +"</div>");
    }

    this.publishOverview = function()
    {
        var pageStart = "<html><head><title>x3dom Regression Tests for "+ profile.name +"</title></head><body><h1>"+profile.name +" results overview</h1></h1>";
        var pageEnd = "</body>";
    }
};

exports.ResultsPublisher = ResultsPublisher;
exports.ResultsPublisher.publishOverview = ResultsPublisher.publishOverview;
exports.ResultsPublisher.publishResults = ResultsPublisher.publishResults;
