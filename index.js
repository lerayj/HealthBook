const   _ = require('lodash'),
        urlParse = require('url-parse'),
        exec = require('child_process').exec,
        fs = require('fs'),
        pagexray = require('pagexray'),
        moment = require('moment'),
        dirTree = require('directory-tree');

var express = require('express'),
    app = express(),
    cors = require('cors');

    app.use(cors());

var routesNew = require('./routes_new.js');
var routesOld = require('./routes_old.js');

app.use(routesNew);
app.use(routesOld);


var port = process.env.PORT || 3003;

app.listen(port, function () {
  console.log('[Server running on port ', port, ']');
});
