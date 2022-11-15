"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const serverInfo_1 = require("./entity/serverInfo");
let server = net.createServer((client) => {
    client.on('connect', (data) => {
        console.info(`数据：${data}`);
    });
});
server.listen(serverInfo_1.serverInfo.port, serverInfo_1.serverInfo.host, () => {
    // console.log(`正在监听：${server.address()}`);
    console.log('正在监听', server.address());
});
