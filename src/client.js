"use strict";
exports.__esModule = true;
var net = require("node:net");
var readline = require("node:readline");
var node_process_1 = require("node:process");
var serverInfo_1 = require("./entity/serverInfo");
var rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
var name;
var client = new net.Socket();
console.info('请输入用户名:');
rl.on('line', function (input) {
    if (input.length <= 0) {
        console.error("用户名不能为空！请重新输入!");
    }
    else {
        name = input;
        rl.close();
        client.connect(serverInfo_1.serverInfo.port, serverInfo_1.serverInfo.host, function () {
            console.info("\u5DF2\u8FDE\u63A5\u5230".concat(client.remoteAddress, ":").concat(client.remotePort));
            client.write("login_name ".concat(name));
        });
    }
});
client.on('data', function (data) {
    console.info("".concat(data));
});
