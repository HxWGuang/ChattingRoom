// 命令类型
export enum eCommandType {
    signup = 'signup',
    login = 'login',
    say = 'say',
    reply = 'reply',
    roll = 'roll',
    leave = 'leave',
    logout = 'logout',
    join = 'join',
    create = 'create',
    list = 'list',
    refresh = 'refresh',
}

// 消息类型
export enum eMsgType {
    server = 'server',
    chat = 'chat',
    reply = 'reply'
}

export enum eUserType {
    normal,
    admin,
}

// 游戏状态
export enum eGameStat {
started,
ended,
}

// 房间状态
export const enum eRoomState {
    normal = 'normal',
    destroying = 'destroying',
    destroyed = 'destroyed',
}

// 消息结构
export interface msgBodyStruct {
    type: eMsgType;
    from: string;
    to?: string;
    content: string;
    status: boolean;
}

// 指令数据结构
export interface dataBodyStruct {
    cmd: string,
    arg: string[],
    content: string,
}

// 用户数据结构
export interface usersDataStruct {
    count: number,
    users: userInfoStruct[]
}

// 用户信息结构
export interface userInfoStruct {
    username: string;
    password: string;
    ip: string;
    type: eUserType;
    //...
}
