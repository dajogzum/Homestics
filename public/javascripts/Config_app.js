var input = document.getElementsByName("config");
var wykresyIte = 0;
var liveIte = 0;
function save() {
    var Input_toSave = [],
        Charts = [],
        Live = [];
    for (var i = 0; i < input.length; i++) {
        Input_toSave.push(input[i].value);
    }
    var c = $("div[id*='wykresy']").length;
    for (var i = 0; i < c; i++) {
        var inputs = $("div[id='wykresy" + i + "']").find("input").toArray();
        Charts.push([
            inputs[0].value,
            inputs[1].value,
            $("div[id='wykresy" + i + "'] > select").val(),
            inputs[2].value,
            inputs[3].value,
            inputs[4].value,
        ]);
    }
    c = $("div[id*='live'").length;
    for (var i = 0; i < c; i++) {
        var inputs = $("div[id='live" + i + "'] > input").toArray();
        Live.push([
            inputs[0].value,
            inputs[1].value,
            $("div[id='live" + i + "'] > select").val(),
        ]);
    }
    Input_toSave.push(Charts, Live);
    var socket = io();
    socket.emit("save_config", Input_toSave);
    popUp("Zapisano!", 2500);
    console.log(Input_toSave);
}

var Config;

function onLoad(errors) {
    var socket = io();
    socket.emit('Config', function (temp) {
        Config = temp;
    });
    if (typeof errors != "undefined") {
        var errCon = errors;
    } else {
        var errCon = 0;
    };
    if (!Config) {
        if (errCon >= 5) {
            console.log("Configuration not loaded! \n Create config file")
        } else {
            setTimeout(function () { onLoad(errCon++) }, 300);
        }
    } else if (!Config.null) {
        input[0].value = Config.user;
        input[1].value = Config.pswd;
        input[2].value = Config.ip;
        input[3].value = Config.port;
        input[4].value = Config.dbName;
        input[5].value = Config.dni_wstecz;
        input[6].value = Config.godziny_wstecz;
        input[7].value = Config.minuty_wstecz;
        input[8].value = Config.limit;
        for (var i = 0; i < Config.wykresy.length; i++) {
            createWykres(Config.wykresy[i]);
        }
        for (var i = 0; i < Config.live.length; i++) {
            createLive(Config.live[i]);
        }
        console.log('Config loaded successfully!')
        return 0;
    } else {
        console.log("Config file is empty!");
    };
}

function createWykres(onLoad) {
    var div = document.createElement("div");
    div.id = "wykresy" + wykresyIte;
    var title = document.createElement("h3");
    title.innerText = "#" + (wykresyIte + 1);
    title.style.marginBottom = "0px"; 
    div.append(title);
    var input = document.createElement("input");
    input.type = "text";
    input.name = "chart";
    if (onLoad) {
        input.value = onLoad[0];
    }
    div.append(input);
    input = document.createElement("input");
    input.type = "number";
    input.name = "chart";
    input.style.width = "50px"
    if (onLoad) {
        input.value = onLoad[1];
    }
    div.append(input);
    input = document.createElement("select");
    for (var i = 0; i < 6; i++) {
        var option = document.createElement("option");
        option.value = "#numero" + i;
        option.text = "Pozycja" + i;
        input.append(option);
    }
    if (onLoad) {
        input.value = onLoad[2];
    }
    div.append(input);
    input = document.createElement("input");
    input.type = "text";
    input.name = "chart";
    input.className = "form-control input-lg colorpicker-element";
    input.id = "cp1" + wykresyIte;
    if (onLoad) {
        input.value = onLoad[3];
    }
    div.append(input);
    input = document.createElement("input");
    input.type = "text";
    input.name = "chart";
    input.className = "form-control input-lg colorpicker-element";
    input.id = "cp2" + wykresyIte;
    if (onLoad) {
        input.value = onLoad[4];
    }
    div.append(input);
    input = document.createElement("input");
    input.type = "number";
    input.name = "chart";
    input.style.width = "60px"
    if (onLoad) {
        input.value = onLoad[5];
    }
    div.append(input);
    input = document.createElement("div");
    input.id = "remove";
    input.innerHTML = "-";
    input.title = wykresyIte;
    div.append(input);
    $(".wykresy").append(div);
    wykresyIte++;
}

function createLive(onLoad) {
    var div = document.createElement("div");
    div.id = "live" + liveIte;
    var input = document.createElement("input");
    input.type = "text";
    input.name = "live";
    if (onLoad) {
        input.value = onLoad[0];
    }
    div.append(input);
    input = document.createElement("input");
    input.type = "nubmer";
    input.name = "live";
    if (onLoad) {
        input.value = onLoad[1];
    }
    div.append(input);
    input = document.createElement("select");
    for (var i = 0; i < 6; i++) {
        var option = document.createElement("option");
        option.value = "#numero" + i;
        option.text = "Pozycja" + i;
        input.append(option);
    }
    if (onLoad) {
        input.value = onLoad[2];
    }
    div.append(input);
    input = document.createElement("div");
    input.id = "remove";
    input.innerHTML = "-";
    input.title = wykresyIte;
    div.append(input);
    $(".live").append(div);
    liveIte++;
}

function getIDs() {
    var ids= "";
    var array = $("div[id*='wykresy'] > input[id*='cp']").toArray();
    for (var i = 0; i < array.length; i++) {
        if (i == array.length-1) {
            ids += "#" + array[i].id;
        } else {
            ids += "#" + array[i].id + ",";
        }
    }
    return ids;
}

onLoad();

$(document).ready(function () {
    $("#save").click(save);
    $("#showpswd").mousedown(function () {
        $(this).css("background-color", "white");
        $("#password").attr("type", "text");
    });
    $("#showpswd").mouseup(function () {
        $(this).css("background-color", "rgb(130, 130, 130)");
        $("#password").attr("type", "password");
    });
    $("#showpswd").mouseleave(function () {
        $(this).css("background-color", "rgb(130, 130, 130)");
        $("#password").attr("type", "password");
    });
    $(".wykresy > #add").click(function () {
        createWykres();
    });
    $(".live > #add").click(function () {
        createLive();
    });
    $(".wykresy, .live").on('click', '#remove', function (ktory) {
        $("#" + ktory.target.parentElement.id).remove();
    })
    $(function () {
        $(".wykresy").on("mouseenter", getIDs(), function () {
            $(getIDs()).colorpicker({
                format: "rgba"
            });
        })
    });
});
