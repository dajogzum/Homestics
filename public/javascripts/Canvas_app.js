var canvas = document.getElementById("myCanvas"),
    ctx = canvas.getContext("2d"),
    temp = document.getElementsByName("temp"),
    tempmin,
    tempmax,
    diff,
    dz;

function generate() {
    tempmin = (temp[0].value * 1);
    tempmax = (temp[1].value * 1);
    diff = Math.abs(tempmin) + Math.abs(tempmax);
    dz = 700 / diff;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("config").style.visibility = "visible";
    ctx.font = "12px Arial";
    ctx.fillStyle = 'white';
    ctx.beginPath();
    //szare linie pomocnicze
    ctx.strokeStyle = "#444";
    for (var i = 0; i < 10; i++) {
        ctx.moveTo(50, (i * 20) + 50);
        ctx.lineTo(750, (i * 20) + 50);
    }
    for (var i = 0; i < diff; i++) {
        ctx.moveTo(i * dz + 50, 250);
        ctx.lineTo(i * dz + 50, 50);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.moveTo(50, 250);
    //linia skali
    ctx.lineTo(750, 250); // X
    //podzialka skali X
    for (var i = 0; i <= diff; i++) {
        ctx.moveTo((i * dz) + 50, 253);
        ctx.lineTo((i * dz) + 50, 247);
    }
    var tmpTempmin = tempmin;
    for (var i = 0; i <= diff; i++) {
        ctx.fillText(tmpTempmin + "°", (i * dz) + 40, 270);
        if (tmpTempmin == 0) {
            ctx.moveTo((i * dz) + 50, 250)
            ctx.lineTo((i * dz) + 50, 50); // Y
            //podzialka skali Y
            for (var j = 0; j <= 10; j++) {
                ctx.moveTo((i * dz) + 47, (j * 20) + 50);
                ctx.lineTo((i * dz) + 53, (j * 20) + 50);
                ctx.fillText((10 - j) * 10 + "%", 13, (j * 20) + 54);
            }
        }
        tmpTempmin++;
    }
    ctx.stroke();
}

function drawNew() {
    generate();
    var c = document.getElementsByName("point").length;
    var points = getPoints(c);
    ctx.beginPath();
    ctx.moveTo(50, 50);
    for (var i = 0; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
    // input[2].min = input[0].value;
    // input[4].min = input[2].value;
    // input[6].min = input[4].value;
    // input[3].min = input[1].value;
    // input[5].min = input[3].value;
    // input[7].min = input[5].value;
}

function addpoint() {
    var anchor = document.getElementById("inputtings");
    var div = document.createElement("div");
    var inputx = document.createElement("input");
    inputx.type = "number";
    inputx.name = "point";
    inputx.value = "0";
    inputx.min = "0";
    inputx.max = diff;
    inputx.setAttribute("onchange", "drawNew()");
    var inputy = document.createElement("input");
    inputy.type = "number";
    inputy.name = "point";
    inputy.value = "0";
    inputy.min = "0";
    inputy.max = "100";
    inputy.setAttribute("onchange", "drawNew()");
    div.append(inputx);
    div.append(inputy);
    anchor.append(div);
}

function getPoints() {
    var input = document.getElementsByName("point");
    var points = [];
    for (var i = 0; i < input.length; i++) {
        points.push([((input[i].value) * dz) + 50, 250 - (input[i + 1].value * 2)]);
        i++;
    }
    return points;
}

var equations = [];

function save() {
    equations = [];
    var points = getPoints();
    //console.log(points);
    var input = document.getElementsByName("point");
    for (var i = 0; i < points.length; i++) {
        if (i == 0) {
            var Xa = 0; // X
            var Ya = 100; // Y
            var Xb = input[i].value; // X
            var Yb = input[i + 1].value; // Y
        } else {
            var tmp = (i * 2) - 2;
            var Xa = input[tmp].value; // X
            var Ya = input[tmp + 1].value; // Y
            var Xb = input[tmp + 2].value; // X
            var Yb = input[tmp + 3].value; // Y
        }
        var y = (Ya - Yb) / (Xa - Xb) + "*x+(" + (Ya - ((Ya - Yb) / (Xa - Xb)) * Xa) + ")"
        equations.push({
            eq: y,
            left: Xa * 1,
            right: Xb * 1,
        });
    }
    var socket = io();
    socket.emit("equations", equations);
    popUp("Zapisano!", 2500);
    //console.log(equations)
}


/*
function conversion(X) {
    var out;
    if (X == 0) {
        out = tempmax;
    } else if (X == diff) {
        out = tempmin;
    } else {
        out = tempmax - X;
    }
    return out * 1;
}

function output(x) {
    var percent;
    for (var i = 0; i < equations.length; i++) {
        if (x <= 0) {
            percent = 100;
        } else if (x >= diff) {
            percent = 0;
        } else if (x <= equations[i].right && x > equations[i].left) {
            percent = eval(equations[i].eq);
        }
    }
    return percent;
    //return Math.round((255*percent)/100);
}

function input(T) {
    //console.log(T+" "+tempmax+" "+tempmin);
    var X = 0;
    T = (T * 10) / 10;
    if (T >= tempmax) {
        X = diff;
    } else if (T <= tempmin) {
        X = 0;
    } else {
        for (var i = tempmin; i < T; i += 0.5) {
            X += 0.5;
        }
    }
    //console.log(X);
    document.getElementById("demo").innerHTML = "do Ampio: " + Math.round((255 * output(X)) / 100) + "<br>" + (Math.round(output(X) * 10) / 10) + "%";
}
*/
$(document).ready(function () {
    $("#generuj").click(generate);
    $("#add").click(addpoint);
    $("#save").click(save);
});