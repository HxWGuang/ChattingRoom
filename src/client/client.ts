import * as net from 'node:net';
import * as readline from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';
import {serverInfo, eCommandType} from "../share/entity/defineType";

const rl = readline.createInterface({input, output});

let username: string;
let line = 0;
const msgList: string[] = [];

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
            case eCommandType.logout: {
                socket.write(eCommandType.logout);
                socket.setTimeout(1000);
                break;
            }
            case eCommandType.say: {
                socket.write(input);
                // todo: 建立消息类，存储收发消息
                output.write(`${++line} ${input}\n`);
                break;
            }
            case eCommandType.reply: {
                // 回复的行号
                const replyLine = Number(sendDataArr[1]);
                // 回复的原消息
                const sourceContent = msgList[replyLine - 1];
                // 回复的内容
                const replyContent = sendDataArr[2];
                console.log(`回复的原消息：${sourceContent}`);
                console.log(`回复的内容：${replyContent}`);
                const sendStr = `reply ${sourceContent}\
                \n----------------------\
                \n${replyContent}`;
                socket.write(sendStr);

                output.write(`${++line} ${input}\n`);
                break;
            }
            default: {
                socket.write(input);
                output.write(`${input}\n`);
            }
        }
    });

    socket.on('data', (msg) => {
        if (msg.toString().startsWith('[server]')) {
            output.write(`${msg}\n`);
            return;
        } else {
            output.write(`${++line} ${msg}\n`);
            msgList.push(msg.toString());
        }
        console.log(`客户端收到消息：${msg}`);
        console.log(`msgList =`, msgList);
    });

    socket.on('timeout', () => {
        socket.end();
    });
}