var socket = io();
var Config;
socket.emit('Config', function (temp) {
    Config = temp;
});

var graph0,
    graph1,
    graph2,
    graph3,
    graph4,
    graph5,
    Sgodzina,
    SdzienTyg,
    Smiesiac,
    Srok,
    localLimit,
    localTable,
    localTFormat = "hours",
    refSW = 1,
    graphsTab = [graph0, graph1, graph2, graph3, graph4, graph5],
    Time = {};

//Tutaj rozpoczyna sie rozruch aplikacji
function start(errors) {
    if (typeof errors != "undefined") {
        var errCon = errors;
    } else {
        var errCon = 0;
    };
    if (!Config) {
        if (errCon >= 5) {
            console.log("BŁĄD WCZYTYWANIA PLIKU KONFIGURACYJNEGO")
        } else {
            setTimeout(function () { start(errCon++) }, 300);
        }
    } else {
        localLimit = Config.limit;
        localTable = Config.current;
        Core.setViewport();
        refreshTime();
        init();
        console.log('Application Started!')
        return 0;
    }
}
start();

function refreshTime() {
    var t = new Date();
    Time = {
        sekunda: t.getSeconds(),
        minuta: t.getMinutes(),
        godzina: t.getHours(),
        dzienMies: t.getDate(),
        dzienTyg: t.getDay(),
        miesiac: t.getMonth() + 1,
        rok: t.getFullYear(),
        odliczanie: 60 - t.getSeconds(),
    }
    console.log("Current time: " + Time.dzienTyg + " " + Time.dzienMies + "-" + Time.miesiac + "-" + Time.rok + " " + Time.godzina + ":" + Time.minuta + ":" + Time.sekunda);
};

function zegar() {
    var czas = new Date();
    godzina = czas.getHours(); if (godzina <= 9) { godzina = "0" + godzina; }
    minuta = czas.getMinutes(); if (minuta <= 9) { minuta = "0" + minuta; }
    sekunda = czas.getSeconds(); if (sekunda <= 9) { sekunda = "0" + sekunda; }
    document.getElementById('zegar').innerHTML = godzina + ":" + minuta + ":" + sekunda;
};

function updates() {
    if (refSW == 1) {
        for (var i = 0; i < Config.wykresy.length; i++) {
            Core.updateGraph(Config.wykresy[i][0], i, localLimit, localTable, localTFormat, "xd");
        };
    } else if (refSW == 2) {
        if (Time.godzina != Sgodzina) {
            for (var i = 0; i < Config.wykresy.length; i++) {
                Core.updateGraph(Config.wykresy[i][0], i, localLimit, localTable, localTFormat, "xd");
            };
        }
    }
}
//pozwala na wczytanie starszych danych z bazy
function history(limit, table, tformat, sw, date) {
    //jezeli bedzie null to wczytuj aktualne (date jest z kalendarza)
    //jezeli bedzie podana konkretna data wczytaj ja...
    if (date == null) {
        date = "xd";
        for (var i = 0; i < Config.wykresy.length; i++) {
            graphsTab[i].data.labels = [];
            graphsTab[i].data.datasets.forEach((dataset) => {
                dataset.data = [];
            });
            Core.fillGraph(Config.wykresy[i][0], i, limit, table, tformat, date);
        };
    } else {
        for (var i = 0; i < Config.wykresy.length; i++) {
            graphsTab[i].data.labels = [];
            graphsTab[i].data.datasets.forEach((dataset) => {
                dataset.data = [];
            });
            Core.fillGraph(Config.wykresy[i][0], i, limit, table, tformat, date);
        };
    }
    //ustaw aktualne zmienne dla ktorych ma sie odswierzac wykres
    localLimit = limit;
    localTFormat = tformat;
    localTable = table;
    //0-brak update; 1-co 2 minuty; 2-co godzine; dla refSW (refresh Switch)
    refSW = sw;
}

function init() {
    //Tworzy wykresy z aktualnymi danymi z bazy
    for (var i = 0; i < Config.wykresy.length; i++) {
        Core.createGraph(i, Config);
        Core.fillGraph(Config.wykresy[i][0], i, localLimit, localTable, localTFormat, "xd");
    };
    var anchor = $("#pos3");
    Core.generateLiveWrapper(anchor);
};

socket.on('update', function () {
    console.log('update poprzez socket.io')
    updates();
})

socket.on('live', function (values) {
    Core.liveUpdates(values);
})
//Typowy Frontend
setInterval(zegar, 1000);

new niceDatePicker({
    dom: document.getElementById('calendar-wrapper'),
    onClickDate: function (date) {
        history(24, Config.hours, Config.today, 0, date);
    },
    mode: 'pl',
});

$(document).ready(function () {
    $("#flip").click(function () {
        $("#calendar").slideToggle("slow");
    });
    $(".nice-normal, #content").click(function () {
        $("#calendar").slideUp("slow");
    });
});