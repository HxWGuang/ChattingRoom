"use strict";
exports.__esModule = true;
var net = require("node:net");
var serverInfo_1 = require("./entity/serverInfo");
var sockets = new Map();
var server = net.createServer(handleSocket).listen(serverInfo_1.serverInfo.port, serverInfo_1.serverInfo.host, function () {
    console.log('正在监听', server.address());
});
function handleSocket(socket) {
    socket.on('data', function (data) {
        if (typeof data === "string") {
            var key = getCmdKey(data);
            handleKey(key, socket);
        }
    });
}
function handleKey(key, socket) {
    switch (key) {
        case 'login_name': {
            var name_1 = getCmdValue(key);
            sockets.set(name_1, socket);
            broadcast(name_1, "".concat(name_1, "\u52A0\u5165\u804A\u5929\u5BA4"));
        }
    }
}
function getCmdKey(cmd) {
    return cmd.split(' ')[0];
}
function getCmdValue(cmd) {
    return cmd.split(' ')[1];
}
function broadcast(from, msg) {
    if (sockets.size <= 0) {
        console.info('聊天室内没有用户！');
        return;
    }
    sockets.forEach(function (s, k, map) {
        if (k === from)
            return;
        s.write(msg);
    });
}
