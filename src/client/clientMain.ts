import * as net from 'node:net';
import readline from "node:readline";
import {stdin as input, stdout as output} from 'node:process';
import {serverInfo} from "../share/entity/serverConfig";
import {eCommandType} from "../share/utils/attTypeDefine";
import {inputHandler} from "./inputHandler";
import {chatSys} from "./chatSys";
import {loginSys} from "./loginSys";
import {commonAction} from "./commonAction";
import {gmAction} from "./gmAction";

const rl = readline.createInterface({input, output});

const inputHandlerInst = new inputHandler();
const loginSysInst = new loginSys(inputHandlerInst);
const chatSysInst = new chatSys(inputHandlerInst);
const commActionInst = new commonAction(inputHandlerInst);
const gmActionInst = new gmAction(inputHandlerInst);

const socket = net.connect(serverInfo.port, serverInfo.host, () => {
    socket.setEncoding('utf-8');
    onConnect(socket);
});

function onConnect(socket: net.Socket) {
    console.info(`已连接到${socket.remoteAddress}:${socket.remotePort}`);

    // init
    loginSysInst.socket = socket;
    chatSysInst.socket = socket;
    commActionInst.socket = socket;
    gmActionInst.socket = socket;

    output.write('登录或注册：\n');

    rl.on('line', (input) => {
        const sendDataArr = input.split(' ');
        const cmd = sendDataArr[0] as eCommandType;
        const args = sendDataArr.slice(1);

        if (!(cmd in eCommandType)) {
            console.error(`无法识别指令：${sendDataArr[0]}`);
            return;
        }
        if (cmd === eCommandType.login || cmd === eCommandType.signup) {
            chatSysInst.username = args[0];
            inputHandlerInst.execute(cmd, args);
        } else {
            if (!chatSysInst.stat) {
                output.write('请先登录或注册!\n');
                return;
            } else {
                inputHandlerInst.execute(cmd, args);
            }
        }
    });

    socket.on('data', chatSysInst.onRecvData.bind(chatSysInst));

    socket.on('end', () => {
        output.write('已断开连接\n');
        // chatSysInst.stat = false;
        process.exit();
    })

    socket.on('timeout', () => {
        socket.end();
    });
}