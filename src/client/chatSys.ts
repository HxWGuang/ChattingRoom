import {dataBodyStruct, eCommandType, eMsgType, msgBodyStruct} from "../share/utils/attTypeDefine";
import * as net from "net";
import {inputHandler} from "./inputHandler";
import {stdin as input, stdout as output} from 'node:process';
import {msgTool} from "../share/utils/msgTool";

export type msgTup = [string, string];

export class chatSys {
    socket: net.Socket | undefined;
    inputHandlerInst: inputHandler;

    username = 'temp';
    msgLine = 0;
    msgList: msgTup[] = [];

    stat = false;

    constructor(input: inputHandler, socket?: net.Socket) {
        this.socket = socket;
        this.inputHandlerInst = input;

        this.init();
    }

    init() {
        this.inputHandlerInst.register(eCommandType.say, this.say.bind(this));
        this.inputHandlerInst.register(eCommandType.reply, this.reply.bind(this));
    }

    say(content: string) {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.say, content: content
        }

        this.socket?.write(JSON.stringify(sendData));

        //store msg
        this.storeMsg(content);
        output.write(`${++this.msgLine} ${this.username}> ${content}\n`);
    }

    reply(line: number, content: string) {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.reply, content: ""
        }

        // 回复的原消息
        const sourceContent = `@${this.msgList[line - 1][0]}:${this.msgList[line - 1][1]}`;
        sendData.arg.push(sourceContent);
        // 回复的内容
        sendData.content = content

        this.socket?.write(JSON.stringify(sendData));

        //store msg
        this.storeMsg(content);
        output.write(`${++this.msgLine} reply:${line} ${this.username}> ${content}\n`);
    }

    onRecvData(msg: Buffer) {
        let jsonData: msgBodyStruct = JSON.parse(msg.toString());
        this.stat = jsonData.status;

        if (jsonData.type === eMsgType.chat || jsonData.type === eMsgType.reply) {
            output.write(`${++this.msgLine} ${msgTool.showMsg(jsonData.type, jsonData.content, jsonData.from, jsonData.to)}\n`);
            // store chat msg
            this.storeMsg(jsonData.from, jsonData.content);
        } else {
            output.write(`${msgTool.showMsg(jsonData.type, jsonData.content, jsonData.from)}\n`);
            return;
        }
    }

    storeMsg(content: string, from: string = this.username) {
        this.msgList.push([from,content]);
    }
}