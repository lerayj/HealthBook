var express = require('express');
var app = module.exports = express();

const   _ = require('lodash'),
        urlParse = require('url-parse'),
        exec = require('child_process').exec,
        fs = require('fs'),
        pagexray = require('pagexray'),
        moment = require('moment'),
        dirTree = require('directory-tree');

//send last data report for a specific url
//@url: query
app.get('/report/', function(req, res){
    var url = req.query.url;
    if(!url)
        res.send("Error, you should provide url query param");
    var promXray = getLastResultXray(url);
    promXray.then(function(data){
        res.send(data);
    });
});

const   BROWSERTIME_RESULT = __dirname + "/browsertime-results/";

app.get('/reports', function(req, res) {
    var tree = dirTree(BROWSERTIME_RESULT);
    res.send(tree);
    // fs.readdir(BROWSERTIME_RESULT, (err, files) => {
    //     res.send(files);
    // });
});

//generate new report
app.post('/report', function (req, res) {
    var urlToReport = cleanUrl = req.query.url;

    if (urlToReport.substr(0, 7) == "http://")
        cleanUrl = urlToReport.substr(7);

    var saveDir = "browsertime-results/" + cleanUrl + "/" + moment().toISOString();

    var snippet = "'return new Date().valueOf() > window.performance.timing.loadEventEnd'";

    exec('browsertime-master/bin/browsertime.js -n 3 ' + urlToReport + ' --resultDir ' + saveDir + " --pageCompleteCheck " + snippet, function(err, out, code) {
        if (err)
            console.log("Error:", err);   
        var harPath = __dirname + "/" + saveDir + "/browsertime.har";
        fs.readFile(harPath, (err, rawHar) => {
            if(err)
                console.log("error is: ", err);
            var harJson = JSON.parse(rawHar);
            console.log("[Xray HAR file]");
            var pages = pagexray.convert(harJson, {pretty: true, includeAssets: true});
            console.log("[Pages] ", pages);

            fs.writeFile(__dirname + "/" + saveDir + "/browsertime.xray.json", JSON.stringify(pages), (err) => {
                if(err)
                    console.log("error: ", err);
                console.log("[Saved] - " + __dirname + "/" + saveDir + "/browsertime.xray.json")
            })



            
            res.send(pages);
        });
    });
});

function toCleanUrl(url){
    return url.substr(0, 7) == "http://" ? url.substr(7) : url;
}

function getLastResultXray(url){
    return new Promise(function(resolve, reject){
        var path = BROWSERTIME_RESULT + toCleanUrl(url) + "/";
        console.log("PATH: ", path);
        fs.readdir(path, (err, files) => {
            var browserRecordRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*/;
            var temp = [];
            console.log("FILES: ", files);
            files.forEach( file => {
                console.log("each file: ", file);
                if (browserRecordRegex.test(file)){
                    console.log("file: ", file);
                    temp.push(moment(file));
                }
            });
            var lastestResults = moment.max(temp);
            var pathLastResult = path + lastestResults.toISOString();
            fs.readFile(pathLastResult + "/browsertime.xray.json", (err, rawData) => {
                if(err)
                    console.log("error is: ", err);
                var data = JSON.parse(rawData);
                resolve(data);
            });
            
        });
    });
}