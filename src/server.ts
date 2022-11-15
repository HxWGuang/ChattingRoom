import * as net from "node:net";
import {clientInfo, socket} from "./entity/clientInfo";
import {serverInfo} from "./entity/serverInfo";

let sockets = new Map<string, net.Socket>();

let server = net.createServer(handleSocket).listen(serverInfo.port, serverInfo.host, () => {
    console.log('正在监听',server.address());
});

function handleSocket(socket: net.Socket) {
    console.info(`连接到${socket.remoteAddress}:${socket.remotePort}`);
    socket.setEncoding('utf-8');

    socket.on('data', (data) => {
        let str_data = data.toString();

        handleData(str_data, socket);
    });
}

function handleData(data: string, socket: net.Socket) {
    let key = getCmdKey(data);
    switch (key) {
        case 'login_name': {
            let name = getCmdValue(data);
            sockets.set(name, socket);
            broadcast(name, `${name}加入聊天室`);
        }
    }
}

function getCmdKey(cmd: string) {
    return cmd.split(' ')[0];
}
function getCmdValue(cmd: string) {
    return cmd.split(' ')[1];
}

function broadcast(from: string, msg: string) {
    if (sockets.size <= 0) {
        console.info('聊天室内没有用户！');
        return;
    }

    sockets.forEach((s,k,map) => {
        console.log(k);
        if (k === from) return;

        s.write(msg);
        console.log(`发送消息：${msg}`);
    })
}