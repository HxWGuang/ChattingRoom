import * as net from 'node:net';
import * as readline from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';
import {clientInfo, socket, serverInfo, eCommandType} from "./entity/defineType";

const rl = readline.createInterface({input, output});

let client = new net.Socket();
client.setEncoding('utf-8');

// console.info('请输入用户名:');
// rl.on('line', (input) => {
//     if (input.length <= 0) {
//         console.error("用户名不能为空！请重新输入!");
//     } else {
//         name = input;
//         rl.close();
//
//         client.connect(serverInfo.port, serverInfo.host, () => {
//             console.info(`已连接到${client.remoteAddress}:${client.remotePort}`);
//             client.write(`${eCommandType.login} ${name}`);
//         });
//     }
// });

const waitUsername = new Promise((resolve) => {
    rl.question('请输入用户名:\n', answer => {
        resolve(answer);
    });
});

waitUsername.then(username => {
    client.connect(serverInfo.port, serverInfo.host, () => {
        console.info(`已连接到${client.remoteAddress}:${client.remotePort}`);
        client.write(`${eCommandType.login} ${username}`);
    });
});

rl.on('line', (input) => {
    client.on('data', (input) => {
        client.write(input);
    });
});