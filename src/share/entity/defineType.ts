// 命令枚举
export const enum eCommandType {
    login   = 'login',
    say     = 'say',
    reply   = 'reply',
    roll    = 'roll',
    leave   = 'leave',
    logout  = 'logout',
    join    = 'join',
    create  = 'create',
    list    = 'list',
    refresh ='refresh',
}

export const enum eMsgType {
    server = 'server',
    chat   = 'chat',
    reply  = 'reply',
    state  = 'state'
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