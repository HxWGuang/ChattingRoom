import * as net from 'node:net';
import * as readline from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';
import {serverInfo} from "../share/entity/serverConfig";
import {cmdWrapper} from "../share/utils/cmdWrapper";
import {eCommandType} from "../share/entity/cmdMgr";
import {eMsgType, msgInfo, msgTool} from "../share/utils/msgTool";

const rl = readline.createInterface({input, output});

let username: string;
let line = 0;
type msgTup = [string,string];
const msgList: msgTup[] = [];

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
    // socket.write(`${eCommandType.login} ${username}`);
    socket.write(cmdWrapper.toJson(eCommandType.login,username));

    rl.on('line', (input) => {
        const sendDataArr = input.split(' ');

        if (!(sendDataArr[0] in eCommandType)) {
            console.error(`无法识别指令：${sendDataArr[0]}`);
            return;
        }

        // 不同的指令有不同的特殊操作
        // todo: 缺少指令合法性检查
        // if (!roomId) {
        //     socket.write(msgWrapper.toJson(eMsgType.server, `指令：${data.cmd}缺少参数！`));
        //     return;
        // }
        switch (sendDataArr[0]) {
            case eCommandType.logout: {
                socket.write(cmdWrapper.toJson(...sendDataArr));
                socket.setTimeout(1000);
                break;
            }
            case eCommandType.say: {
                socket.write(cmdWrapper.toJson(...sendDataArr));
                // store chat msg
                msgList.push([username, sendDataArr[1]]);
                output.write(`${++line} ${input}\n`);
                break;
            }
            case eCommandType.reply: {
                // 回复的行号
                const replyLine = Number(sendDataArr[1]);
                // 回复的原消息
                const sourceContent = `@${msgList[replyLine - 1][0]}:${msgList[replyLine - 1][1]}`;
                // 回复的内容
                const replyContent = sendDataArr[2];

                socket.write(cmdWrapper.toJson(sendDataArr[0], sourceContent, replyContent));

                // store chat msg
                msgList.push([username, replyContent]);
                output.write(`${++line} ${input}\n`);
                break;
            }
            default: {
                socket.write(cmdWrapper.toJson(...sendDataArr));
                output.write(`${input}\n`);
            }
        }
    });

    //todo: 服务器也要发json，客户端解析json
    socket.on('data', (msg) => {
        let jsonData: msgInfo = JSON.parse(msg.toString());

        if (jsonData.type === eMsgType.chat || jsonData.type === eMsgType.reply) {
            output.write(`${++line} ${msgTool.showMsg(jsonData.type, jsonData.content, jsonData.from, jsonData.to)}\n`);
            // store chat msg
            msgList.push([jsonData.from, jsonData.content]);
        } else {
            output.write(`${msgTool.showMsg(jsonData.type, jsonData.content, jsonData.from)}\n`);
            return;
        }
        console.log(`客户端收到消息：${msg}`);
        console.log(`msgList =`, msgList);
    });

    socket.on('timeout', () => {
        socket.end();
    });
}