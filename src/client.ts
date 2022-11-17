import * as net from 'node:net';
import * as readline from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';
import {clientInfo, socket, serverInfo, eCommandType} from "./entity/defineType";

const rl = readline.createInterface({input, output});

const waitUsername = new Promise((resolve) => {
    rl.question('请输入用户名:\n', answer => {
        resolve(answer);
    });
});

let username: string;

waitUsername.then(_username => {
    username = _username as string;
    const socket = net.connect(serverInfo.port, serverInfo.host, () => {
        socket.setEncoding('utf-8');

        onConnection(socket);
    });
});

function onConnection(socket: net.Socket) {
    console.info(`已连接到${socket.remoteAddress}:${socket.remotePort}`);
    socket.write(`${eCommandType.login} ${username}`);

    rl.on('line', (input) => {
        console.log('input =', input);

        if (input === eCommandType.leave) {
            socket.write(eCommandType.leave);
            socket.setTimeout(1000);
        } else {
            socket.write(input);
        }
    });

    socket.on('data', (msg) => {
        console.info(msg);
    });

    socket.on('timeout', () => {
        socket.end();
    });
}