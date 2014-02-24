var fw = require('./filewriter');
var ResultsPublisher = function(outputPath)
{
    var that = this;
    this.outputPath = outputPath;
    this.overviewData = {};
    this.overviewData.profiles = [];



    //Create output folder
    fw.writeFile(that.outputPath + '/');

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




        var dateString = that.getDateString();

        var includes = "<link rel='stylesheet' href='../../jquery-ui-1.10.4.custom/css/smoothness/jquery-ui-1.10.4.custom.min.css'/><script src='../../jquery-ui-1.10.4.custom/js/jquery-1.10.2.js'></script><script src='../../jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js'></script>";
        var script = "<script>$(function(){$(\".accordion\").accordion({collapsible: true, heightStyle: 'content', active: false});});</script>"
        var pageStart = "<html><head>"+includes+script+"<title>x3dom Regression Tests for "+ profile.name +"</title></head><body><h1>"+profile.name +" results overview - "+ statistics.passed +" / "+ (statistics.passed + statistics.failed) +" passed</h1><h3>" + dateString + "</h3>";
        var pageEnd = "<br/><br/><br/><br/>"+"</body>";

        var details = contents.join("");
        profile.statistics = statistics;
        that.overviewData.profiles.push(profile);

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
                var reftag = "<a target='_blank' href='../../"+globals.referencePath + image + "'><img width = '200px' height = '150px' src='../../"+globals.referencePath + image + "'/></a>";
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

    this.getDateString = function(){
        function pad(num, size)
        {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }
        var date = new Date();
        return pad(date.getDate(),2)+"."+pad((date.getMonth()+1), 2)+"."+date.getFullYear()+" - "+pad(date.getHours(), 2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2);
    }

    this.publishOverview = function()
    {
        var style="<style>h1,p,th,td{font-family: 'Trebuchet MS' Helvetica, Arial, sans-serif} td.success{background-color: #94FF86; } td.failed{background-color: #FF7E74;} img{width:75px;height:75px;} table,th,td{text-align:left; vertical-align:middle; border: 2px solid darkslategray; border-collapse:collapse} th{font-size:1.1em; background-color:darkslategray; color: white}</style>"
        var pageStart = "<html><head><title>x3dom Testing Overview</title>"+style+"</head><body><h1>Regression Test Results</h1><h3>"+that.getDateString()+"</h3>";
        pageStart += "<table><tr><th>Browser</th><th>Test-Results</th></tr>";
        var content = "";
        for(var i in that.overviewData.profiles)
        {
            var profile = that.overviewData.profiles[i];
            var success = profile.statistics.failed <= 0;
            var successString = success?"success":"failed";
            content += "<tr><td><img src='img/"+profile.name+"_icon.png'/></td>";
            content += "<td class='"+successString+"'><a href='results/"+profile.name+"/index.html'>"+profile.statistics.passed+" / "+(profile.statistics.passed + profile.statistics.failed)+" passed</a></td></tr>";
        }
        var pageEnd = "</table></body></html>";

        var path = that.outputPath+"/index.html";

        console.log("publishing overview: "+path);
        fw.writeFile(path, pageStart+content+pageEnd);
    }

};

exports.ResultsPublisher = ResultsPublisher;
exports.ResultsPublisher.publishOverview = ResultsPublisher.publishOverview;
exports.ResultsPublisher.publishResults = ResultsPublisher.publishResults;
