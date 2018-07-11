'use strict';
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var dbActions = require('../scripts/dbactions');
var utils = require('../scripts/utils');

router.get('/', function (req, res) {
    res.render('homestics');
});

router.get('/canvas', function (req, res) {
    res.render('canvas');
});

router.get('/configure', function (req, res) {
    res.render('configure');
});

router.get('/query_data/:what/:tformat/:where/:limit/:date', function (req, res, next) {
    var con = dbActions.makeConnection();
    var query = {
        what: req.params.what,
        tformat: "",
        where: req.params.where,
        limit: req.params.limit,
        date: req.params.date,
    };
    switch (req.params.tformat) {
        case "hours":
            query.tformat = "%H:%i";
            break;
        case "date":
            query.tformat = "%Y-%m-%d"; 
            break;
        case "fulldate":
            query.tformat = "%Y-%m-%d %H:%i";
            break;
        default:
            query.tformat = "Err!";
    };
    dbActions.queryData(function (err, Result) {
        res.setHeader('Content-Type', 'application/json');
        res.render('data', { data: Result });
    }, query, con);
});

Date.prototype.toMysqlFormat = function (Case) {
    switch (Case) {
        case "date":
            return this.getFullYear() + "-" + utils.twoDigits(1 + this.getMonth()) + "-" + utils.twoDigits(this.getDate());
        case "datePlusOne":
            return this.getFullYear() + "-" + utils.twoDigits(1 + this.getMonth()) + "-" + utils.twoDigits(this.getDate()+1);
        case "hours":
            return utils.twoDigits(this.getHours()) + ":" + utils.twoDigits(this.getMinutes()) + ":00";
        case "fulldate":
            return this.getFullYear() + "-" + utils.twoDigits(1 + this.getMonth()) + "-" + utils.twoDigits(this.getDate()) + " " + utils.twoDigits(this.getHours()) + ":" + utils.twoDigits(this.getMinutes()) + ":00";
    }
    
};

module.exports = router;
