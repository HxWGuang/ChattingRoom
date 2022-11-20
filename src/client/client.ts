import * as net from 'node:net';
import * as readline from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';
import {clientInfo, socket, serverInfo, eCommandType} from "../share/entity/defineType";

const rl = readline.createInterface({input, output});

let username: string;
let line = 0;
const msgList: Buffer[] = [];

const waitUsername = new Promise((resolve) => {
    rl.question('请输入用户名:\n', answer => {
        resolve(answer);
    });
});

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
        const sendDataArr = input.split(' ');

        switch (sendDataArr[0]) {
            case eCommandType.leave: {
                socket.write(eCommandType.leave);
                socket.setTimeout(1000);
                break;
            }
            case eCommandType.reply: {
                const replyLine = Number(sendDataArr[1]);
                const sourceContent = msgList[replyLine - 1];
                const replyContent = sendDataArr[2];
                const sendStr = `reply ${sourceContent} \
                \n---------------------- \
                \n${replyContent}`;
                socket.write(sendStr);
                break;
            }
            default: {
                socket.write(input);
            }
        }
        output.write(`${++line} ${input}\n`);
    });

    socket.on('data', (msg) => {
        output.write(`${++line} ${msg}\n`);
        msgList.push(msg);
    });

    socket.on('timeout', () => {
        socket.end();
    });
}