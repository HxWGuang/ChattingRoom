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

    public msgStr(data: string, from: string): string {
        return `${this.prefix} ${from}>\
        \n\t${data}`;
    }
}

export class serverMsg extends msg {
    prefix = '[server]';
}