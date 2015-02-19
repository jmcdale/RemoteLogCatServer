var childProcess = require('child_process');
var util = require('util');
var server = require('http').createServer();
var io = require('socket.io')(server);
var LogCatLine = require('./Objects/LogCatLine');

childProcess.execSync('adb logcat -c');
var spawn = childProcess.spawn;

var logcat = spawn('adb', ['logcat']);
var emit = false;

var getIp = function () {
    var interfaces = require('os').networkInterfaces();
    var localIp = "127.0.0.1";

    Object.keys(interfaces).forEach(function (interfaceName) {

        interfaces[interfaceName].forEach(function (networkInterface) {
            if ('IPv4' !== networkInterface.family || networkInterface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            localIp = networkInterface.address
        });

    });

    return localIp;
};

io.on('connection', function (socket) {

    console.log("Connected");
    emit = true;
    socket.on('event', function (data) {
        console.log("event");
    });

    socket.on('disconnect', function () {
        console.log("Disconnected");
        emit = false;
    });

});

var port = 3000;
var ip = getIp();

server.listen(port);
console.log("Listening at http://" + ip + ":" + port);

logcat.stdout.on('data', function (chunk) {
    //console.log("Out Data: " + chunk);
    if (emit == true) {
        //TODO Chunk might be more than one line. Split it and emit multiple.
        var line = new LogCatLine("" + chunk);
        var pidName = childProcess.execSync('adb shell ps ' + line.pid);//.split(' ');
        pidName = ("" + pidName).split(" ").splice(-1)[0].trim();
        line.setPidName(pidName);
        console.log("Emitting Data");
        io.emit("NEW_LOGCAT_LINE", line);
    }
});

logcat.stderr.on('data', function (chunk) {
    console.log("Error Data: " + chunk);
    if (emit == true) {
        console.log("Emitting Data");
        io.emit("NEW_STRING", {
            "String": chunk
        });
    }
});

logcat.on('close', function (code) {
    console.log("Close Code: " + code);
    if (emit == true) {
        io.emit("NEW_STRING", {
            "String": chunk
        });
    }
});

logcat.on('error', function (code) {
    console.log("Error Code: " + code);
    if (emit == true) {
        io.emit("NEW_STRING", {
            "String": chunk
        });
    }
});
