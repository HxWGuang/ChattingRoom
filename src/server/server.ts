import * as net from "node:net";
import {stdin as input, stdout as output} from 'node:process';
import {eCommandType, serverInfo} from "../share/entity/defineType";
import * as message from "../share/entity/msg";
import readline from "node:readline";

const rl = readline.createInterface({input, output});

// let sockets: net.Socket[];
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

    console.info(`已收到消息：${name} => ${data}`);
    console.log('解析出cmd =', cmd);

    switch (cmd) {
        case eCommandType.login: {
            let name = getCmdValue(data);
            userMapping.set(socket, name);
            broadcast(socket, `${name} 加入聊天室`);
            break;
        }
        case eCommandType.leave: {
            broadcast(socket, `${name} 离开聊天室`);
            break;
        }
        case eCommandType.say: {
            let msg = getCmdValue(data);
            // broadcast(socket, `${name} => ${msg}`);
            broadcast(socket, new message.chat().msgStr(msg, name, ++line));
            break;
        }
        case eCommandType.reply: {

            break;
        }
    }
}

function getCmdKey(cmd: string) {
    return cmd.split(' ')[0];
}
function getCmdValue(cmd: string) {
    return cmd.split(' ')[1];
}

function broadcast(from: net.Socket, msg: string) {
    if (userMapping.size <= 0) {
        console.info('聊天室内没有用户！');
        return;
    } else {
        userMapping.forEach((name,socket) => {
            if (socket === from) return;

            socket.write(msg);
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