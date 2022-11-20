import * as net from "node:net";
import {stdin as input, stdout as output} from 'node:process';
import {eCommandType, serverInfo} from "../share/entity/defineType";
import {chatMsg, replyMsg, serverMsg} from "../share/entity/msg";
import readline from "node:readline";

const rl = readline.createInterface({input, output});
const chatMsgIns = new chatMsg();
const serMsgIns = new serverMsg();
const reMsgIns = new replyMsg();

let userMapping = new Map<net.Socket, string>();
let line = 0;

let server = net.createServer(onConnection).listen(serverInfo.port, serverInfo.host, () => {
    console.log('正在监听',server.address());
});

function onConnection(socket: net.Socket) {
    console.info(`连接到${socket.remoteAddress}:${socket.remotePort}`);
    socket.setEncoding('utf-8');

    socket.on('data', (data) => {
        let str_data = data.toString();
        handleData(str_data, socket);
    });

    socket.on('error', (err) => {
        console.info(`${userMapping.get(socket)} 断开连接`);
        removeSocket(socket);
    });

    socket.on('close', () => {
        console.info(`${userMapping.get(socket)} 已离开聊天室`)
        removeSocket(socket);
    });
}

function handleData(data: string, socket: net.Socket) {
    let cmd = getCmdKey(data) as eCommandType;
    let name = userMapping.get(socket);

    console.info(`[debug] 已收到消息：${name} => ${data}`);
    console.log('解析出cmd =', cmd);

    switch (cmd) {
        case eCommandType.login: {
            let name = getCmdValue(data);
            userMapping.set(socket, name);
            broadcast(serMsgIns.msgStr(`已加入聊天室`, name));
            break;
        }
        case eCommandType.leave: {
            broadcast(serMsgIns.msgStr(`已离开聊天室`, name), socket);
            break;
        }
        case eCommandType.say: {
            let msg = getCmdValue(data);
            broadcast(chatMsgIns.msgStr(msg, name), socket);
            break;
        }
        case eCommandType.reply: {
            let reMsg = getCmdValue(data);
            broadcast(reMsgIns.msgStr(reMsg, name), socket);
            break;
        }
    }
}

function getCmdKey(data: string) {
    return data.split(' ')[0];
}
function getCmdValue(data: string) {
    let firstSpace = data.indexOf(' ');
    return data.slice(firstSpace + 1);
}

function broadcast(msg: string, from?: net.Socket) {
    if (userMapping.size <= 0) {
        console.info('聊天室内没有用户！');
        return;
    } else {
        userMapping.forEach((name,socket) => {
            if (from === undefined) {
                socket.write(msg);
            } else {
                if (from === socket) return;
                socket.write(msg);
            }
        });
        console.info(`已广播消息：${msg}`);
    }
}

function removeSocket(socket: net.Socket) {
    if (userMapping.size <= 0) return;

    userMapping.delete(socket);
}

function lookupAllUser(roomId?: number) {
    if (typeof roomId !== 'undefined') {
        console.info('要查询的roomId:', roomId);
    } else {
        output.write('[\n');
        userMapping.forEach((name,socket) => {
            output.write(`${socket.remoteAddress}:${socket.remotePort} -> ${name}`);
        });
        output.write(']\n');
    }
}