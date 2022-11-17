"use strict";
exports.__esModule = true;
var net = require("node:net");
var readline = require("node:readline");
var node_process_1 = require("node:process");
var defineType_1 = require("./entity/defineType");
var rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
var client = new net.Socket();
client.setEncoding('utf-8');
// console.info('请输入用户名:');
// rl.on('line', (input) => {
//     if (input.length <= 0) {
//         console.error("用户名不能为空！请重新输入!");
//     } else {
//         name = input;
//         rl.close();
//
//         client.connect(serverInfo.port, serverInfo.host, () => {
//             console.info(`已连接到${client.remoteAddress}:${client.remotePort}`);
//             client.write(`${eCommandType.login} ${name}`);
//         });
//     }
// });
var waitUsername = new Promise(function (resolve) {
    rl.question('请输入用户名:\n', function (answer) {
        resolve(answer);
    });
});
waitUsername.then(function (username) {
    client.connect(defineType_1.serverInfo.port, defineType_1.serverInfo.host, function () {
        console.info("\u5DF2\u8FDE\u63A5\u5230".concat(client.remoteAddress, ":").concat(client.remotePort));
        client.write("".concat("login" /* eCommandType.login */, " ").concat(username));
    });
});
rl.on('line', function (input) {
    client.on('data', function (input) {
        client.write(input);
    });
});
