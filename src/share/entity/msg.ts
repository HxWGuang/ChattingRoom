import {eMsgType as msgType} from "./defineType";

interface msgInfo {
    prefix: string;
}

abstract class msg implements msgInfo{
     prefix = '';
     public msgStr(data: string, from?: string): string {
         if (from === undefined) {
             return `${this.prefix} ${data}`;
         } else {
             return `${this.prefix} ${from} ${data}`;
         }
     };
}

export class chatMsg extends msg{
    prefix = '[chat]';

    public msgStr(data: string, from?: string, line?: number): string {
        if (line === undefined) {
            return `${this.prefix} ${from}> ${data}`;
        } else {
            return `${line} ${this.prefix} ${from}> ${data}`;
        }
    }
}

export class replyMsg extends msg {
    prefix = '[reply]';
}

export class serverMsg extends msg {
    prefix = '[server]';
}

// export let broadcast: msgInfo = {
//     prefix: '[server]',
// }
//
// export class log {
//     static broadcastInfo(from: string, data: string) {
//         console.log(`${broadcast.prefix} ${from} => ${data}`);
//     }
// }