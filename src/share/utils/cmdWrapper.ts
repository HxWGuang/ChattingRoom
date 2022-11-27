import {eCommandType} from "../entity/cmdMgr";

export interface data{
    cmd: string,
    arg: string,
    content: string,
}

export class cmdWrapper {

    static toJson(...arg:string[]) {
        let sendData: data = {
            cmd: '',
            arg: '',
            content: '',
        };

        let cmd = arg[0] as eCommandType;
        sendData.cmd = cmd;

        switch (cmd) {
            // 一个参数
            case eCommandType.leave:
            case eCommandType.create:
            case eCommandType.list:
            case eCommandType.logout:
            case eCommandType.refresh:
            case eCommandType.roll: {

                break;
            }
            // 两个参数
            case eCommandType.join:
            case eCommandType.login: {
                sendData.arg = arg[1];
                break;
            }
            case eCommandType.say: {
                sendData.content = arg[1];
                break;
            }
            // 三个参数
            case eCommandType.reply: {
                sendData.arg = arg[1];
                sendData.content = arg[2];
            }
        }

        return JSON.stringify(sendData);
    }
}