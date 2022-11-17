// 命令枚举
export const enum eCommandType {
    login  = 'login',
    say    = 'say',
    reply  = 'reply',
    roll   = 'roll',
    leave  = 'leave',
    logout = 'logout',
}

// 服务器信息
export const serverInfo = {
    host : "127.0.0.1",
    port : 3000
}

export interface socket {
    ip: string;
    port: number;
}

export class clientInfo {
    name: string;
    socket?: socket | undefined;

    constructor(name:string,socket: socket | undefined) {
        this.name = name;
        if (typeof socket !== null) {
            this.socket = socket;
        }
    }
}