'use strict';
var utils = {
    refreshTime: function () {
        var t = new Date();
        var Time = {
            sekunda: t.getSeconds(),
            minuta: t.getMinutes(),
            godzina: t.getHours(),
            dzienMies: t.getDate(),
            dzienTyg: t.getDay(),
            miesiac: t.getMonth() + 1,
            rok: t.getFullYear(),
            odliczanie: 60 - t.getSeconds(),
        }
        console.info(utils.CColors.Bright, "-> Time: " + Time.dzienTyg + " " + utils.twoDigits(Time.dzienMies) + "-" + utils.twoDigits(Time.miesiac) + "-" + Time.rok + " " + utils.twoDigits(Time.godzina) + ":" + utils.twoDigits(Time.minuta) + ":" + utils.twoDigits(Time.sekunda), utils.CColors.Dim);
        return Time;
    },
    timeAgo: function (number, Case) {
        var f = new Date();
        switch (Case) {
            case "hours":
                f.setHours(f.getHours() - number);
                return f.getFullYear() + "-" + utils.twoDigits(1 + f.getMonth()) + "-" + utils.twoDigits(f.getDate()) + " " + utils.twoDigits(f.getHours()) + ":" + utils.twoDigits(f.getMinutes()) + ":00";
                break;
            case "days":
                f.setDate(f.getDate() - number);
                return f.getFullYear() + "-" + utils.twoDigits(1 + f.getMonth()) + "-" + utils.twoDigits(f.getDate());
                break;
            case "months":
                f.setMonth(f.getMonth() - number);
                return f.getFullYear() + "-" + utils.twoDigits(1 + f.getMonth());
                break;
            case "years":
                f.setFullYear(f.getFullYear() - number);
                return f.getFullYear();
                break;
            default:
                break;
        }
    },
    twoDigits: function (d) {
        if (0 <= d && d < 10) return "0" + d.toString();
        if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
        return d.toString();
    },
    CColors: {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",
    },
}

module.exports = utils;