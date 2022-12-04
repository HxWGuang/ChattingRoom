import {inputHandler} from "./inputHandler";
import * as net from "net";
import {dataBodyStruct, eCommandType} from "../share/utils/attTypeDefine";

export class loginSys {
    socket: net.Socket | undefined;
    inputHandlerInst: inputHandler;

    constructor(i: inputHandler, socket?: net.Socket) {
        this.inputHandlerInst = i;
        this.socket = socket;
        this.init();
    }

    init() {
        this.inputHandlerInst.register(eCommandType.login, this.login.bind(this));
        this.inputHandlerInst.register(eCommandType.signup, this.signup.bind(this));
        this.inputHandlerInst.register(eCommandType.logout, this.logout.bind(this));
    }

    login(name: string, pwd: string) {
        let sendJson: dataBodyStruct = {
            cmd: eCommandType.login,
            arg: [],
            content: "",
        }

        sendJson.arg.push(name);
        sendJson.arg.push(pwd);

        this.socket?.write(JSON.stringify(sendJson));
    }

    signup(name: string, pwd: string) {
        let sendJson: dataBodyStruct = {
            cmd: eCommandType.signup,
            arg: [],
            content: "",
        }

        sendJson.arg.push(name);
        sendJson.arg.push(pwd);

        this.socket?.write(JSON.stringify(sendJson));
    }

    logout() {
        let sendData: dataBodyStruct = {
            arg: [], cmd: eCommandType.logout, content: ""
        }
        this.socket?.write(JSON.stringify(sendData));
        // this.socket?.setTimeout(1000);
    }
}