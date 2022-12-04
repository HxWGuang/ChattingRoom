import * as net from "net";
import {inputHandler} from "./inputHandler";
import {dataBodyStruct, eCommandType} from "../share/utils/attTypeDefine";

export class commonAction {
    socket: net.Socket | undefined;
    inputHandlerInst: inputHandler;

    constructor(inputHandler: inputHandler, socket?: net.Socket) {
        this.inputHandlerInst = inputHandler;
        this.socket = socket;

        this.init();
    }

    init() {
        this.inputHandlerInst.register(eCommandType.create, this.create.bind(this));
        this.inputHandlerInst.register(eCommandType.list, this.list.bind(this));
        this.inputHandlerInst.register(eCommandType.join, this.join.bind(this));
        this.inputHandlerInst.register(eCommandType.leave, this.leave.bind(this));
        this.inputHandlerInst.register(eCommandType.roll, this.roll.bind(this));
    }

    create() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.create, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }

    list() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.list, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }

    leave() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.leave, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }

    join(roomId: string) {
        let sendData: dataBodyStruct = {
            arg: [roomId], cmd: eCommandType.join, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }

    roll() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.roll, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }
}