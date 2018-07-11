var Core = {
    setViewport: function () {
        //Odczytaj rozmiar wyświetlaego pola
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var wo = ((w / 2) - 2) + "px";
        var ho = (((h - 50) / 3) - 2) + "px";
        var content = document.getElementById("content");
        //Ustaw '.content' na Fullscreen 
        content.style.height = (h - 50) + "px";
        content.style.width = w + "px";
        //Ustaw poszczegolne komorki 'container', aby wypelnialy caly ekran
        var container = document.getElementsByClassName("container");
        for (var i = 0; i < 6; i++) {
            container[i].style.height = ho;
            container[i].style.width = wo;
            document.getElementsByTagName("canvas")[i].setAttribute("width", wo);
            document.getElementsByTagName("canvas")[i].setAttribute("height", ho);
        };
        return {
            width: wo,
            height: ho,
        };
    },
    //Wczytuje konfiguracje
    loadConfig: function (socket) {
        var Config;
        socket.emit("Config_request", function (Config_tmp) {
            console.log(Config_tmp);
            Config = Config_tmp;
        });
        return Config
    },
    //Wypelnij wykres konkretnymi danymi
    fillGraph: function (what, index, limit, where, tformat, date) {
        $.ajax({
            url: "http://localhost:1337/query_data/" + what + "/" + tformat + "/" + where + "/" + limit + "/" + date,
            type: "GET",
            success: function (data) {
                var length = data.length;
                var graphticks;
                if (length < limit) {
                    graphticks = length;
                } else {
                    graphticks = limit;
                }
                for (var i = graphticks - 1; i >= 0; i--) {
                    time = data[i].time;
                    values = data[i].value;
                    graphsTab[index].data.labels.push(time);
                    graphsTab[index].data.datasets.forEach((dataset) => {
                        dataset.data.push(values);
                    });
                };
                graphsTab[index].update();
            },
            error: function (data) {
                console.log("Blad w Core.fillGraph:\n" + data.responseText);
            }
        });
    },
    //Aktualizuje wykres z nowymi danymi
    updateGraph: function (what, index, limit, where, tformat, date) {
        var length = graphsTab[index].data.labels.length;
        $.ajax({
            url: "http://localhost:1337/query_data/" + what + "/" + tformat + "/" + where + "/1/" + date,
            type: "GET",
            success: function (data) {
                time = data[0].time;
                values = data[0].value;
                console.log("Wstawiono do wykresu:\n" + values, time)
                if (length > limit) {
                    graphsTab[index].data.labels.splice(0, 1);
                };
                graphsTab[index].data.labels.push(time);
                graphsTab[index].data.datasets.forEach((dataset) => {
                    if (length > limit) {
                        dataset.data.splice(0, 1);
                    };
                    dataset.data.push(values);
                });
                graphsTab[index].update();
            },
            error: function (data) {
                console.log("Blad w updateGraph:\n" + data.responseText);
            }
        });
    },
    //Tworzy pusty wykres przy ladowaniu strony
    createGraph: function (index, Config) {
        var chartdata = {
            labels: [],
            datasets: [
                {
                    label: Config.wykresy[index][0],
                    backgroundColor: Config.wykresy[index][3],
                    borderColor: Config.wykresy[index][4],
                    hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
                    hoverBorderColor: 'rgba(200, 200, 200, 1)',
                    data: [],
                },
            ]
        };
        var ctx = $(Config.wykresy[index][2]);
        graphsTab[index] = new Chart(ctx, {
            type: 'line',
            data: chartdata,
            options: {
                scales: {
                    yAxes: [{
                        gridLines: { color: 'rgba(255, 255, 255, 0.5)', },
                        ticks: {
                            stepSize: Config.wykresy[index][5],
                        },
                    }],
                    xAxes: [{
                        gridLines: { color: 'rgba(255, 255, 255, 0.5)', },
                        ticks: {
                            autoSkipPadding: 25,
                            maxRotation: 0,
                        },
                    }]
                }
            }
        });
    },
    //Podglad na zywo
    generateLiveWrapper: function (anchor) {
        var n = Config.live.length;
        this.anchor = anchor;
        anchor.html("<div class='live-wrapper'></div>");
        var dimensions = {
            width: function () {
                return ($("#pos3").width()) / n;
            },
            height: function () {
                return $("#pos3").height() - 1;
            },
        }
        for (var i = 0; i < n; i++) {
            $(".live-wrapper").append("<div class='block" + i + "'><span>" + Config.live[i][0] + "</span><p></p></div > ");
            $(".block" + i).css({ "width": dimensions.width, "height": dimensions.height, "float": "left", "margin": "0 auto", "text-align": "center" });
        }
    },
    liveUpdates: function (values) {
        for (var i = 0; i < Config.live.length; i++) {
            $(".block"+i+" p").html(values[i])
        }
    },
}