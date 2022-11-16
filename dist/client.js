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
const readline = __importStar(require("node:readline"));
const node_process_1 = require("node:process");
const serverInfo_1 = require("./entity/serverInfo");
const rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
let name;
let client = new net.Socket();
client.setEncoding('utf-8');
console.info('请输入用户名:');
rl.on('line', (input) => {
    if (input.length <= 0) {
        console.error("用户名不能为空！请重新输入!");
    }
    else {
        name = input;
        rl.close();
        client.connect(serverInfo_1.serverInfo.port, serverInfo_1.serverInfo.host, () => {
            console.info(`已连接到${client.remoteAddress}:${client.remotePort}`);
            client.write(`login_name ${name}`);
        });
    }
});
client.on('data', (data) => {
    console.info(`${data}`);
});
