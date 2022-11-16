"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("node:net"));
const serverInfo_1 = require("./entity/serverInfo");
let sockets = new Map();
let server = net.createServer(handleSocket).listen(serverInfo_1.serverInfo.port, serverInfo_1.serverInfo.host, () => {
    console.log('正在监听', server.address());
});
function handleSocket(socket) {
    console.info(`连接到${socket.remoteAddress}:${socket.remotePort}`);
    socket.setEncoding('utf-8');
    socket.on('data', (data) => {
        let str_data = data.toString();
        handleData(str_data, socket);
    });
}
function handleData(data, socket) {
    let key = getCmdKey(data);
    switch (key) {
        case 'login_name': {
            let name = getCmdValue(data);
            sockets.set(name, socket);
            broadcast(name, `${name}加入聊天室`);
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
    sockets.forEach((s, k, map) => {
        console.log(k);
        if (k === from)
            return;
        s.write(msg);
        console.log(`发送消息：${msg}`);
    });
}
