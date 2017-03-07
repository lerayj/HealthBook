var express = require('express');
var app = module.exports = express();

const   _ = require('lodash');

var kue = require('kue'),
    queue = kue.createQueue({
        redis: 'redis://toto@redis-14773.c3.eu-west-1-2.ec2.cloud.redislabs.com:14773'
    });

app.post('/report_new', function (req, res) {
    var url = req.query.url;
    var job = queue.create('report', {
        url: url
    }).save( function(err){
       if( !err ) console.log( job.id );
    });
});