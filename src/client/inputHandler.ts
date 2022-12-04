import {eCommandType} from "../share/utils/attTypeDefine";

export class inputHandler {
    private actions = new Map<eCommandType, Function>();

    register(type: eCommandType, callback: Function) {
        this.actions.set(type, callback);
    }

    execute(cmd: eCommandType, args:string[]) {
        let func = this.actions.get(cmd);
        if (func) {
            func(...args);
        } else {
            console.error(`未找到cmd: ${cmd}`);
        }
    }
}