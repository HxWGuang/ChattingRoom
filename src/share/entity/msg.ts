interface msgInfo {
    prefix: string;
}

class msg {
    protected prefix = '';
    protected msgStr(data: string, from: string | undefined): string {
        return `${this.prefix} ${from} ${data}`;
    };
}

export class chat extends msg{
    readonly prefix = '[chat]';

    public msgStr(data: string, from: string | undefined, line?: number): string {
        if (line === undefined) {
            return `${this.prefix} ${from} => ${data}`;
        } else {
            return `${line} ${this.prefix} ${from} => ${data}`;
        }
    }
}

export let broadcast: msgInfo = {
    prefix: '[server]',
}

export class log {
    static broadcastInfo(from: string, data: string) {
        console.log(`${broadcast.prefix} ${from} => ${data}`);
    }
}