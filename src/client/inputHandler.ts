import * as net from "net";
import {eCommandType} from "../share/utils/attTypeDefine";

export class inputHandler {
    private socket: net.Socket | undefined;
    private actions = new Map<eCommandType, Function>();

    register(type: eCommandType, callback: Function) {
        this.actions.set(type, callback);
    }

    execute(cmd: eCommandType, args:string[]) {
        let func = this.actions.get(cmd);
        if (func) {
            func.apply(this.socket, args);
        } else {
            console.error(`未找到cmd: ${cmd}`);
        }
    }
}