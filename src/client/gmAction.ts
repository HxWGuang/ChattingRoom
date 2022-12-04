import * as net from "net";
import {inputHandler} from "./inputHandler";
import {dataBodyStruct, eCommandType} from "../share/utils/attTypeDefine";

export class gmAction {
    socket: net.Socket | undefined;
    inputHandlerInst: inputHandler;

    constructor(inputHandler: inputHandler, socket?: net.Socket) {
        this.inputHandlerInst = inputHandler;
        this.socket = socket;

        this.init();
    }

    init() {
        this.inputHandlerInst.register(eCommandType.list, this.list.bind(this));
        this.inputHandlerInst.register(eCommandType.kick, this.kick.bind(this));
    }

    list() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.list, content: ""
        }

        this.socket?.write(JSON.stringify(sendData));
    }

    kick(name: string) {
        let sendData: dataBodyStruct = {
            arg: [name], cmd: eCommandType.kick, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
    }
}