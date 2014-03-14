var fw = require('./filewriter');
var fs = require('fs');
var ResultsPublisher = function()
{
    var that = this;
    this.outputPath;
    this.dbPath;
    this.overviewData = {};
    this.overviewData.profiles = [];
    this.db = {};
    this.newFail = {};
    that.tableStyle = "<style>h1,p,th,td{font-family: 'Trebuchet MS' Helvetica, Arial, sans-serif} td.success{background-color: #94FF86; } td.failed{background-color: #FF7E74;} td.broken{background-color: #FFCC7E} img{width:75px;height:75px;} table,th,td{text-align:left; vertical-align:middle; border: 2px solid darkslategray; border-collapse:collapse} th{font-size:1.1em; background-color:darkslategray; color: white}</style>";



    //Create output folder
    //fw.writeFile(that.outputPath + '/');

    //------------------------------------------------------------------------------------------------------------------

    this.storeResults = function(profile, results, outputPath, callback)
    {
        var db = {};
        that.dbPath = "db/"+profile.name+"_results.json";
        fs.readFile(that.dbPath, function(err, data)
        {
            if(err)
            {
                console.log("Could not find db file: " + that.dbPath);
                db.data = [];
            }
            else
            {
                db = JSON.parse(data);
            }
//            results.forEach(function(result){
//                result.details.forEach(function(detail){
//                    console.log(detail.data);
//                });
//            });
            db.data.unshift({"results": results, "time": new Date().getTime()});
            fw.writeFile(that.dbPath, JSON.stringify(db), callback);
        });
    }

    this.publishResults = function(profiles, outputPath, callback, index)
    {
        if(!index)
        {
            index = 0;
        }
        if (index >= profiles.length)
        {
            //done
            return that.publishOverview(callback);
        }
        console.log(index);
        var profile = profiles[index];
        that.dbPath = "db/"+profile.name+"_results.json";
        that.outputPath = outputPath;
        var profilePath = that.outputPath+"/"+profile.name+"/";
        that.db = {};
        var db;
        fs.readFile(that.dbPath, function(err, data)
        {
            if(err)
            {
                console.log("Could not find db file: " + that.dbPath);
                return;
            }
            else
            {
                that.db[profile.name] = JSON.parse(data);
                db = that.db[profile.name];
            }

            var statistics =
            {
                "count" : db.data[0].results.length,
                "failed" : 0,
                "passed" : 0
            };
            var contents = [];

            that.createProfilePage(profile, statistics, contents, profilePath);
            that.createTimelinePage(profile, function(){
                that.publishResults(profiles, outputPath, callback, index+1);
            });
        });
    }


    this.createProfilePage = function(profile, statistics, contents, path)
    {
        var db = that.db[profile.name];
        db.data[db.data.length-1].results.forEach(function(result){
            that.evaluateTestResult(result,statistics,contents);
        });




        var dateString = that.getDateString();

        var includes = "<link rel='stylesheet' href='../../jquery-ui-1.10.4.custom/css/smoothness/jquery-ui-1.10.4.custom.min.css'/><script src='../../jquery-ui-1.10.4.custom/js/jquery-1.10.2.js'></script><script src='../../jquery-ui-1.10.4.custom/js/jquery-ui-1.10.4.custom.min.js'></script>";
        var script = "<script>$(function(){$(\".accordion\").accordion({collapsible: true, heightStyle: 'content', active: false});});</script>"
        var pageStart = "<html><head>"+includes+script+"<title>x3dom Regression Tests for "+ profile.name +"</title></head><body><h1>"+profile.name +" results overview - "+ statistics.passed +" / "+ (statistics.passed + statistics.failed) +" passed</h1><h3>" + dateString + "</h3>";
        var pageEnd = "<br/><br/><br/><br/>"+"</body>";

        var details = contents.join("");
        profile.statistics = statistics;
        that.overviewData.profiles.push(profile);

        fw.writeFile(path+"index.html", pageStart+details+pageEnd);
    }

    //------------------------------------------------------------------------------------------------------------------

    this.evaluateTestResult = function(result, statistics, content)
    {
        var success = true;

        var resultText = "";

        for(var d in result.details)
        {
            var detail = result.details[d];
            var image = result.testName + "_" + detail.screenshotId + ".png";
            var difftag = "<a target='_blank' href='diff/" + image + "'><img width = '200px' height = '150px' src='diff/" + image + "'/></a>";
            var imagetag = "<a target='_blank' href='" + image + "'><img width = '200px' height = '150px' src='" + image + "'/></a>";
            var reftag = "<a target='_blank' href='../../"+globals.referencePath + image + "'><img width = '200px' height = '150px' src='../../"+globals.referencePath + image + "'/></a>";
            if(detail.status == 'success')
            {
                statistics.passed++;
                if(detail.data.type == "CompareScreenshot") //CompareScreenshot
                {
                    resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + detail.data.type + "</h3><div>Difference: " + detail.data.equality + "<br/>" + imagetag + reftag + "<br/>" + "</div></div>";
                }else if(detail.data.type == "CompareValue") //CompareValue
                {
                    resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + detail.data.type + "</h3><div>Distance: " + detail.data.distance + "<br/>Value: " + detail.data.actualValue + "<br/>Reference: " + detail.data.referenceValue + "</div></div>";
                }
            }
            else if(detail.status == 'failed')
            {
                statistics.failed++;
                if(detail.data.type == "CompareScreenshot") //CompareScreenshot
                {
                    resultText += "<div class='accordion' style='width: 500px; '><h3 style='background: none; background-color: #ff7e74;'>" + detail.data.type + "</h3><div>Difference: "+detail.data.equality+"<br/>" + imagetag + reftag + difftag + "<br/>" + "</div></div>";
                }else if(detail.data.type == "CompareValue") //CompareValue
                {
                    resultText += "<div class='accordion' style='width: 500px; '><h3 style='background: none; background-color: #ff7e74;'>" + detail.data.type + "</h3><div>Distance: " + detail.data.distance + "<br/>Value: " + detail.data.actualValue + "<br/>Reference: " + detail.data.referenceValue + "</div></div>";
                }
            }
            else if(detail.status == 'info')
            {
                resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #94ff86; '>" + detail.data.type + "</h3><div>"+detail.data.info + "</div></div>";

            }
            else if(detail.status == 'error')
            {
                resultText += "<div class='accordion' style='width: 500px;'><h3 style='background: none; background-color: #ff7e74; '>" + detail.data.type + "</h3><div>"+detail.data.error + "</div></div>";
            }

        }




        content.push("<h3>"+result.testName+"</h3><div>" + resultText +"</div>");
    }

    this.getDateString = function(time){
        function pad(num, size)
        {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }
        var date;
        if(time)
        {
            date = new Date(time);
        }
        else
        {
            date = new Date();
        }
        return pad(date.getDate(),2)+"."+pad((date.getMonth()+1), 2)+"."+date.getFullYear()+" - "+pad(date.getHours(), 2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2);
    }

    this.publishOverview = function(callback)
    {
        var pageStart = "<html><head><title>x3dom Testing Overview</title>"+that.tableStyle+"</head><body><h1>Regression Test Results</h1><h3>"+that.getDateString()+"</h3>";
        pageStart += "<table><tr><th>Browser</th><th>Test-Results</th><th>Timeline</th></tr>";
        var content = "";
        for(var i in that.overviewData.profiles)
        {
            var profile = that.overviewData.profiles[i];
            var success = profile.statistics.failed <= 0;
            var anyNewFail = false;
            that.newFail[profile.name][0].forEach(function(nf){
                anyNewFail = anyNewFail || nf;
            });
            var successString = success?"success":anyNewFail[0]?"failed":"broken";
            content += "<tr>";
            content += "<td><img src='img/"+profile.name+"_icon.png'/></td>";
            content += "<td class='"+successString+"'><a href='results/"+profile.name+"/index.html'>"+profile.statistics.passed+" / "+(profile.statistics.passed + profile.statistics.failed)+" passed</a></td>";
            content += "<td><a href='timeline_"+profile.name+".html'>Timeline</a></td></tr>";
            content += "</tr>";
        }
        var pageEnd = "</table></body></html>";

        var path = that.outputPath+"/index.html";

        console.log("publishing overview: "+path);
        fw.writeFile(path, pageStart+content+pageEnd, callback);
    }

    this.createTimelinePage = function(profile, callback)
    {
        var db = that.db[profile.name];
        var path = that.outputPath+"/timeline_"+profile.name+".html";
        var pageStart = "<html><head></head><style>"+that.tableStyle+"</style><body><table>";
        var pageEnd = "</table></body></html>";
        var body = "";

        var newFail = that.newFail[profile.name];
        newFail = [];
        for (var resultId = -1; resultId < db.data[0].results.length; resultId++)
        {
            body += "<tr>";
            for (var detail = 0; detail < db.data[0].results[Math.max(0, resultId)].details.length; detail++)
            {
                for (var row = -1; row < db.data.length; row++)
                {
                    var result = db.data[Math.max(0, row)].results[Math.max(0, resultId)];
                    var entry = result.details[detail];
                    if(resultId == -1 && detail == 0) //headline
                    {
                        if(row == -1)
                        {
                            body += "<th>Test</th>";
                        }
                        else
                        {
                            body += "<th>"+that.getDateString(db.data[row].time)+"</th>";
                        }
                    }
                    else if(resultId != -1)
                    {
                        //if no comparison
                        if(entry.status != 'success' && entry.status != 'failed' && entry.status != 'error')
                        {

                        }
                        else if(row == -1)
                        {
                            body += "<td>"+result.testName+"</td>"
                        }
                        else
                        {

                            if(!newFail[row])
                            {
                                newFail[row] = [];
                            }
                            if(row < db.data.length - 1) //if not last row
                            {
                                newFail[row].push(db.data[row+1].results[resultId].details[detail].status == "success" && entry.status != "success");
                            }
                            else
                            {
                                newFail[row].push(false);
                            }

                            var successString = (entry.status=="success")?"success":newFail[row][newFail[row].length-1]?"failed":"broken";
                            body += "<td class='"+successString+"'>"+successString+"</td>";
                            if(row == db.data.length-1)//last row
                            {
                                body += "</tr><tr>";
                            }
                        }
                    }
                }
            }
            body += "</tr>";
        }
        that.newFail[profile.name] = newFail;
        fw.writeFile(path, pageStart+body+pageEnd);
        callback(newFail);
    }

};

exports.ResultsPublisher = ResultsPublisher;
exports.ResultsPublisher.publishOverview = ResultsPublisher.publishOverview;
exports.ResultsPublisher.publishResults = ResultsPublisher.publishResults;
