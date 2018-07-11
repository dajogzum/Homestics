'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var fs = require('fs');
var reload = require('require-reload')(require)
var emptyconfig = false;
if (!fs.existsSync('./Config.json')) {
    console.log('cfg created!');
    emptyconfig = true;
    fs.writeFileSync('Config.json', '{"null": true}');
};
var dbActions;
var utils = require('./scripts/utils');
var routes = require('./routes/routes');
var Config = reload('./Config.json');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.disable('etag');
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = http.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

var Time = utils.refreshTime();
var Sgodzina = "";
var SdzienTyg = "";
var Smiesiac = "";
var Srok = "";

io.on('connection', function (socket) {
    var CFGobj = Config;
    socket.on("save_config", function (inputs) {
        console.log(inputs[9]);
        console.log(inputs[10]);
        CFGobj = {
            //Konfigurowalne:
            user: inputs[0],
            pswd: inputs[1],
            ip: inputs[2],
            port: inputs[3],
            dbName: inputs[4],
            dni_wstecz: inputs[5],
            godziny_wstecz: inputs[6],
            minuty_wstecz: inputs[7],
            limit: inputs[8],
            wykresy: [],
            live: [],
            //Stale:
            fulldate: "fulldate",
            date: "date",
            today: "hours",
            weekDay: "%W",
            month: "%%M",
            year: "%%Y",
            current: "current",
            hours: "hours",
            days: "days"
        }
        CFGobj.wykresy = inputs[9];
        CFGobj.live = inputs[10];
        fs.writeFileSync('Config.json', JSON.stringify(CFGobj), function (err) {
            if (err) throw err;
            console.log('Config Saved!');
        });
        setTimeout(function () {
            Config = reload('./Config.json');
            emptyconfig = false;
            console.log("Zaktualizowano config");
        }, 2000);
    });
    socket.on('Config', function (pass) {
        pass(Config);
    });
    socket.on("equations", function (EQUA) {
        CFGobj.equations = EQUA;
        fs.writeFileSync('Config.json', JSON.stringify(CFGobj), function (err) {
            if (err) throw err;
            console.log('Config Saved!');
        });
        setTimeout(function () {
            Config = reload('./Config.json');
            emptyconfig = false;
            console.log("Zaktualizowano config");
        }, 4000);
    })
});

function push() {
    setTimeout(function () {
        console.log(utils.CColors.BgMagenta, utils.CColors.FgWhite, "Wyslano push 'update'", utils.CColors.Reset);
        io.emit('update', 'updating...');
    }, 1000);
};

function live() {
    var url = "http://" + Config.user + ":" + Config.pswd + "@" + Config.ip + ":" + Config.port + "/api/json/devices";
    request.get({
        url: url,
        json: true
    }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var values = [
                body.List[Config.live[0][1]].stan,
                body.List[Config.live[1][1]].stan,
            ];
            io.emit('live', values);
        } else {
            return [null];
        }
    })
};

function sorting(firstInit) {
    if (Time.godzina != Sgodzina) {
        dbActions.dbSort("current");
        Sgodzina = Time.godzina;
        console.log('Db-godzina');
    };
    if (Time.dzienTyg != SdzienTyg) {
        if (firstInit) {
            setTimeout(function () { dbActions.dbSort("hours"); console.log("hours xddddd"); }, 10000);
        } else {
            setTimeout(function () { dbActions.dbSort("hours") }, 1000);
        }
        SdzienTyg = Time.dzienTyg;
        console.log('Db-tyg');
    };
    if (Time.miesiac != Smiesiac) {
        if (firstInit) {
            setTimeout(function () { dbActions.dbSort("days"); console.log("days xddddd"); }, 20000);
        } else {
            setTimeout(function () { dbActions.dbSort("days") }, 2000);
        }
        Smiesiac = Time.miesiac;
        console.log('Db-mies');
    };
    if (Time.rok != Srok) {
        if (firstInit) {
            setTimeout(function () { dbActions.dbSort("months"); console.log("months xddddd"); }, 30000);
        } else {
            setTimeout(function () { dbActions.dbSort("months") }, 3000);
        }
        Srok = Time.rok;
        console.log('Db-rok');
    };
}

//rozruch calej aplikacji

if (!emptyconfig && !Config.null) {
    console.log("Server Started!");
    dbActions = require('./scripts/dbactions');
    Start();
} else {
    console.log("Create Config File");
    var starter = setInterval(function () {
        if (!emptyconfig && !Config.null) {
            console.log("Config detected \n Starting application!")
            dbActions = require('./scripts/dbactions');
            Start();
            clearInterval(starter);
        }
    }, 3000);
}

function Start() {
    if (Time.minuta % 2 == 0) {
        dbActions.updates(push);//pierwszy update danych
        sorting(true);//sortowanie niezalezne od czasu
        setInterval(live, 5000);//uruchomienie podgladau na zywo
        setTimeout(function () {
            setInterval(function () {
                Time = utils.refreshTime();//odswiezanie czasu
                sorting(false);//sortowanie zalezne od czasu
                if (Time.minuta % 2 == 0) {
                    console.log(utils.CColors.Bright, '-> Zapisano Dane', utils.CColors.Reset)
                    dbActions.updates(push);//aktualizacja bazy dancyh
                }
            }, 60 * 1000)
        }, Time.odliczanie * 1000)
    } else {
        sorting(true);
        setInterval(live, 1000);
        setTimeout(function () {
            dbActions.updates(push);
            setInterval(function () {
                Time = utils.refreshTime();
                sorting(false);
                if (Time.minuta % 2 == 0) {
                    console.log(utils.CColors.Bright, '-> Zapisano Dane', utils.CColors.Reset)
                    dbActions.updates(push);
                }
            }, 60 * 1000)
        }, Time.odliczanie * 1000)
    }
}