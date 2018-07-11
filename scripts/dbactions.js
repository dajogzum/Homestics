'use strict';
var mysql = require('mysql');
var request = require('request');
var fs = require('fs'); 
var utils = require('./utils');
var Config = require("../Config.json");

var dbActions = {
    makeConnection: function () {
        var dbCon = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: Config.dbName,
            multipleStatements: true,
        });
        dbCon.connect(function (err) {
            if (err) throw err;
            console.log(utils.CColors.FgGreen, "-> Polaczono z baza danych", utils.CColors.Reset);
        });
        return dbCon;
    },
    importArgs: function () {
        var names = [];
        var ids = [];
        for (var i = 0; i < Config.wykresy.length; i++) {
                names.push(Config.wykresy[i][0]);
                ids.push(Config.wykresy[i][1]);
        };
        return { name: names, id: ids };
    },
    queryData: function (callback, query, con) {
        var queryaddon;
        if (query.date == "xd") {
            queryaddon = '';
        } else {
            var timestamp = new Date(query.date).toMysqlFormat("datePlusOne");
            queryaddon = "WHERE date>='" + query.date + "' AND date<'" + timestamp + "'";
        }
        con.query("SELECT `" + query.what + "` AS value, DATE_FORMAT(`date`, '" + query.tformat + "') AS time FROM `" + query.where + "` " + queryaddon + "ORDER BY `date` DESC LIMIT " + query.limit,
            function (err, rows) {
                var json = JSON.stringify(rows);
                callback(err, json);
            }
        );
        con.end(function () {
            console.log(utils.CColors.Bright, '->->-> Rozlaczono z baza danych', utils.CColors.Reset)
        })
    },
    insertData: function (body, con, db) {
        var Args = dbActions.importArgs();
        var time = new Date().toMysqlFormat("fulldate");
        if (typeof body.List != "undefined") {
            var name = "";
            var value = "";
            for (var i = 0; i < Config.wykresy.length; i++) {
                name += ", `" + Args.name[i] + "`";
                value += ", " + body.List[Args.id[i]].stan;
            }
            con.query("INSERT INTO `current` (`date` " + name + ") SELECT * FROM (SELECT '" + time + "' " + value + ") AS tmp WHERE NOT EXISTS (SELECT `date` FROM `current` WHERE `date` = '" + time + "') LIMIT 1");
            console.log(utils.CColors.FgGreen, '->-> Pobrano dane z API oraz je zapisano w bazie', utils.CColors.Reset);
        } else if (typeof body[0] != "undefined" && typeof db != "number") {
            var x = 0;
            var query = "";
            body.forEach(function (key, index) {
                var name = "";
                var value = "";
                var date = key.date;
                //console.log(date);
                for (var i = 0; i < Config.wykresy.length; i++) {
                    name += ", `" + Args.name[i] + "`";
                    value += ", " + key[Args.name[i]];
                };
                query += "INSERT INTO `" + db + "` (`date` " + name + ") SELECT * FROM (SELECT '" + date + "' " + value + ") AS tmp WHERE NOT EXISTS (SELECT `date` FROM `" + db + "` WHERE `date` = '" + date + "') LIMIT 1; ";
                //console.log(query);
                //console.log(x++)

            })
            con.query(query);
        } else {
            console.log(utils.CColors.FgRed, "Cos poszlo nie tak w dbActions.insertData()\nDla: "+body+" i "+db, utils.CColors.Reset)
        };
    },
    updates: function (callback, errors) {
        if (typeof errors != "undefined") {
            var errCon = errors;
        } else {
            var errCon = 0;
        }
        var con = dbActions.makeConnection();
        var url = "http://" + Config.user + ":" + Config.pswd + "@" + Config.ip + ":" + Config.port + "/api/json/devices";
        var urlLog = "http://xxxx:xxxx@" + Config.ip + ":" + Config.port + "/api/json/devices";
        console.log(utils.CColors.Bright, "-> Laczenie z: " + urlLog, utils.CColors.Reset);
        request.get({
            url: url,
            json: true
        }, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                dbActions.insertData(body, con);
                callback();
                con.end(function () {
                    console.log(utils.CColors.Bright, '->->-> Rozlaczono z baza danych', utils.CColors.Reset)
                })
            } else {
                console.log(utils.CColors.FgRed, '->-> Blad podczas pobierania danych\nPonowne laczenie...', utils.CColors.Reset);
                con.end();
                if (errCon >= 5) {
                    console.log(utils.CColors.FgWhite, utils.CColors.BgRed, "Nie udalo sie polaczyc!", utils.CColors.Reset);
                } else {
                    setTimeout(function () {
                        dbActions.updates(callback, errCon++);
                    }, 4000);
                }
                
            }
        })
    },
    dbSort: function (Case) {
        var insertionCase, query;
        var con = dbActions.makeConnection();
        var col = "";
        var Args = dbActions.importArgs();
        for (var i = 0; i < Config.wykresy.length; i++) {
                col += ", AVG(`" + Args.name[i] + "`) AS `" + Args.name[i] + "`";
        }
        switch (Case) {
            case "current":
                insertionCase = "hours";
                query = "SELECT DATE_FORMAT(`date`, '%Y-%m-%d %H:00') AS date " + col + " FROM `" + Case + "` WHERE DATE_FORMAT(`date`, '%Y-%m-%d %H:00')<='" + utils.timeAgo(1, insertionCase) + "' GROUP BY DATE_FORMAT(`date`, '%d-%H') ORDER BY `date` DESC;";
                break;
            case "hours":
                insertionCase = "days";
                query = "SELECT DATE_FORMAT(`date`, '%Y-%m-%d') AS date " + col + " FROM `" + Case + "` WHERE DATE_FORMAT(`date`, '%Y-%m-%d')<='" + utils.timeAgo(1, insertionCase) + "' GROUP BY DATE_FORMAT(`date`, '%Y-%m-%d') ORDER BY `date` DESC;";
                break;
            case "days":
                insertionCase = "months";
                query = "SELECT DATE_FORMAT(`date`, '%Y-%m-%d') AS date " + col + " FROM `" + Case + "` WHERE DATE_FORMAT(`date`, '%Y-%m-%d')<='" + utils.timeAgo(1, insertionCase) + "' GROUP BY DATE_FORMAT(`date`, '%Y-%m') ORDER BY `date` DESC;";
                break;
            case "months":
                insertionCase = "years";
                query = "SELECT DATE_FORMAT(`date`, '%Y-%m') AS date " + col + " FROM `" + Case + "` WHERE DATE_FORMAT(`date`, '%Y-%m')<='" + utils.timeAgo(1, insertionCase) + "' GROUP BY DATE_FORMAT(`date`, '%Y') ORDER BY `date` DESC;";
                break;
            default:
                insertionCase = 1;
        }
        //console.log(query);
        con.query(query,
            function (err, rows) {
                var json = JSON.parse(JSON.stringify(rows));
                dbActions.insertData(json, con, insertionCase);
            }
        );
        if (Case == "current") {
            query = "DELETE FROM `current` WHERE DATE_FORMAT(`date`, '%%Y-%%m-%%d %%H:00')<'" + utils.timeAgo(Config.minuty_wstecz, "hours") + "';";
            //con.query(query);
            console.log(query);
        } else if (Case == "hours") {
            query = "DELETE FROM `hours` WHERE DATE_FORMAT(`date`, '%%Y-%%m-%%d %%H:00')<'" + utils.timeAgo(Config.godziny_wstecz, "hours") + "';";
            //con.query(query);
            console.log(query);
        } else if (Case == "days") {
            query = "DELETE FROM `days` WHERE DATE_FORMAT(`date`, '%%Y-%%m-%%d %%H:00')<'" + utils.timeAgo(Config.dni_wstecz, "days") + "';";
            //con.query(query);
            console.log(query);
        }
        setTimeout(function () {
            con.end(function () {
                console.log(utils.CColors.Bright, '->->-> Rozlaczono z baza danych', utils.CColors.Reset)

            });
        }, 500);
    },
    saveEQ: function (EQUA) {
        var con = dbActions.makeConnection();
        console.log("saved_EQ ");
    }
}

module.exports = dbActions;