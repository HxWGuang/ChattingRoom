import * as net from "node:net";
import readline from "node:readline";
import * as fs from "fs";
import {stdin as input, stdout as output} from 'node:process';
import {serverInfo, userStoreLoc} from "../share/entity/serverConfig";
import {eMsgType, msgTool} from "../share/utils/msgTool";
import {eRoomState as roomStat, room} from "../share/entity/room";
import {hall} from "../share/entity/hall";
import {user, userInfo, usersData} from "../share/entity/userInfo";
import {eCommandType} from "../share/entity/cmdMgr";
import {data} from "../share/utils/cmdWrapper";
import {eGameStat, rollGame} from "./rollGame";

const rl = readline.createInterface({input, output});

let users: usersData = {
    count: 0,
    users: []
}
const userMapping = new Map<net.Socket, userInfo>();
const roomMapping = new Map<string, room>();
const hallIns = new hall();
const rollGameMgr = new rollGame();
let timer: NodeJS.Timer | undefined;
let intervalTimer: NodeJS.Timer | undefined;

type locType = hall | room;

let server = net.createServer(onConnection).listen(serverInfo.port, serverInfo.host, () => {
    console.log('正在监听',server.address());

    let sourceData = fs.readFileSync(userStoreLoc);
    if (sourceData.toString()) {
        users = JSON.parse(sourceData.toString());
    }

    console.log(users);
});

function onConnection(socket: net.Socket) {
    console.info(`连接到${socket.remoteAddress}:${socket.remotePort}`);
    socket.setEncoding('utf-8');

    socket.on('data', (data) => {
        let str_data = data.toString();
        handleData(str_data, socket);
    });

    socket.on('error', (err) => {
        console.info(`${userMapping.get(socket)} 断开连接`);
        let user = userMapping.get(socket);
        if (user && user.location instanceof room && user.location.users.size <= 0) {
            destroyRoom(user.location);
        }
        removeUser(socket);
    });

    socket.on('close', () => {
        const user = userMapping.get(socket);
        console.info(`${user? user.username : socket} 已离开聊天室`);
        if (user && user.location instanceof room && user.location.users.size <= 0) {
            destroyRoom(user.location);
        }
        removeUser(socket);
    });

    // todo: 服务器输入指令
    rl.on('line', (input) => {

    });
}

function handleData(_data: string, socket: net.Socket) {
    let data: data = JSON.parse(_data);
    if (!data) {
        console.error(`收到data为空：${data}`);
        return;
    }
    console.info(`[debug] 已收到消息：${socket.remoteAddress}:${socket.remotePort} =>`, data);
    let cmd = data.cmd;
    // 登录指令
    if (cmd === eCommandType.login) {
        const name = data.arg[0];
        const pwd = data.arg[1];

        let user: user | undefined;
        users.users.forEach((_user) => {
            if (_user.username === name) {
                user = _user;
            }
        });
        if (!user) {
            socket.write(msgTool.toJson(eMsgType.server, `用户：${name}未注册！`, false));
            return;
        } else {
            if (user.password !== pwd) {
                socket.write(msgTool.toJson(eMsgType.server, '密码错误！', false));
                return;
            }
            else
            {
                // create userInfo instance
                const _user = new userInfo(name, socket, hallIns);
                // add to userMapping
                userMapping.set(socket, _user);
                // add to hall
                hallIns.addUser(_user);
                broadcast(msgTool.toJson(eMsgType.server, `${name} 已进入聊天室`), hallIns);
            }
        }
    }
    // 注册指令
    if (cmd === eCommandType.signup) {
        // create userInfo instance
        const name = data.arg[0];
        const pwd = data.arg[1];

        // check signup user
        let res = users.users.find((user) => {
            if (user.username === name) {
                return true;
            }
        });
        if (res) {
            socket.write(msgTool.toJson(eMsgType.server, `用户名：${name} 已存在！`, false));
            return;
        }

        const user = new userInfo(name, socket, hallIns);

        // add to userMapping
        userMapping.set(socket, user);

        // add to hall
        hallIns.addUser(user);

        // write to file
        let userdata: user = {
            username: name,
            password: pwd,
            ip: socket.remoteAddress ? socket.remoteAddress.toString() : 'null'
        }
        users.users.push(userdata);
        users.count++;
        fs.writeFile(userStoreLoc, JSON.stringify(users), ()=> {
            console.info('已写入用户数据');
        });

        broadcast(msgTool.toJson(eMsgType.server, `${name} 已进入聊天室`), hallIns);
    }
    else // 其他指令
    {
        const user = userMapping.get(socket);
        if (user === undefined) {
            console.error(`没有找到 ${socket} 对应的userinfo！`);
            return;
        }

        const name = user.username;
        const lastLoc = user.location;

        switch (cmd) {
            case eCommandType.create: {
                // create room instance
                const roomId = 'room' + (roomMapping.size + 1);
                const roomIns = new room(roomId);
                roomMapping.set(roomId, roomIns);
                broadcast(msgTool.toJson(eMsgType.server,`${name} 创建了房间：${roomId}`), lastLoc);

                // move user
                moveUser(user, lastLoc, roomIns);
                broadcast(msgTool.toJson(eMsgType.server,`${name} 已进入房间：${roomIns.roomId}`), user.location);
                break;
            }
            case eCommandType.list: {
                // list all active rooms
                const roomList = listRooms();
                socket.write(msgTool.toJson(eMsgType.server, roomList));
                break;
            }
            // join [arg1]
            case eCommandType.join: {
                // join a room
                const roomId = data.arg[0];
                const room = roomMapping.get(roomId);
                if (room) {
                    moveUser(user, lastLoc, room);
                    broadcast(msgTool.toJson(eMsgType.server, `${name} 已进入房间`), user.location);
                } else {
                    socket.write(msgTool.toJson(eMsgType.server, `${roomId} 房间不存在！`));
                }
                break;
            }
            case eCommandType.leave: {
                // leave a room back to hall
                broadcast(msgTool.toJson(eMsgType.server,`${name} 已离开房间`), lastLoc, user);
                moveUser(user, lastLoc, hallIns);

                // should destroy room?
                if (lastLoc instanceof room && lastLoc.userCount <= 0) {
                    console.log('最后一个用户已离开, 准备销毁房间！');
                    destroyRoom(lastLoc);
                }
                break;
            }
            case eCommandType.logout: {
                broadcast(msgTool.toJson(eMsgType.server, `${name} 已离开聊天室`), hallIns);
                // 后续操作在socket的close事件中执行
                break;
            }
            case eCommandType.say: {
                broadcast(msgTool.toJson(eMsgType.chat, data.content, name), lastLoc, user);
                break;
            }
            case eCommandType.reply: {
                broadcast(msgTool.toJson(eMsgType.reply, data.content, name, data.arg[0]), lastLoc, user);
                break;
            }
            case eCommandType.roll: {
                // game started
                if (rollGameMgr.status === eGameStat.started) {
                    socket.write(msgTool.toJson(eMsgType.server, '游戏已开始!'));
                    return;
                }

                // game not start
                if (rollGameMgr.players.size <= 0) {
                    broadcast(msgTool.toJson(eMsgType.server, `${name}开启了一局roll游戏！`));
                    rollGameMgr.startTime = Date.now();
                    rollGameMgr.players.add(user);
                    timer = setTimeout(() => {
                        onGamTimerDone(lastLoc);
                    }, 10 * 1000);
                    intervalTimer = setInterval(() => {
                        let diff = Date.now() - rollGameMgr.startTime;
                        console.log('diff =', diff);
                        if (diff >= 5 * 1000) {
                            broadcast(msgTool.toJson(eMsgType.server, `倒计时：${10 - Math.floor(diff/1000)}`), lastLoc);
                        }
                    }, 1000);
                } else {
                    let diff = Date.now() - rollGameMgr.startTime;
                    if (diff < 10 * 1000) {
                        if (diff >= 5 * 1000) {
                            socket.write(msgTool.toJson(eMsgType.server, `游戏已进入倒计时！不能加入`));
                        } else {
                            rollGameMgr.startTime = Date.now();
                            rollGameMgr.players.add(user);
                            broadcast(msgTool.toJson(eMsgType.server, `${name} 加入游戏`), lastLoc);
                            clearTimeout(timer);
                            timer = setTimeout(() => {
                                onGamTimerDone(lastLoc);
                            },10 * 1000);
                        }
                    }
                }
                break;
            }
        }
    }
}

function onGamTimerDone(loc: locType) {
    clearInterval(intervalTimer);
    let res = rollGameMgr.startGame();
    broadcast(msgTool.toJson(eMsgType.server, res), loc);
    clearTimeout(timer);
}

function broadcast(msg: string, loc?: locType, from? :userInfo)
{
    if (userMapping.size <= 0) {
        console.info('聊天室内没有用户！');
        return;
    }
    else
    {
        if (loc) {  // 向loc区域内用户广播
            if (from) {
                loc.users.forEach((user) => {
                    if (from === user) return;
                    user.socket.write(msg);
                });
            } else {
                loc.users.forEach((user) => {
                    user.socket.write(msg);
                });
            }
        }
        else // 向全局所有用户广播
        {
            if (from) {
                userMapping.forEach((user,socket) => {
                    if (from.socket === socket) return;
                    socket.write(msg);
                });
            } else {
                userMapping.forEach((user, socket) => {
                    socket.write(msg);
                });
            }
        }
        console.info(`已广播消息：${msg}`);
    }
}

function removeUser(user: net.Socket): void;
function removeUser(user: userInfo):void;
function removeUser(expect: net.Socket | userInfo)
{
    if (userMapping.size <= 0) return;

    const user = (expect instanceof userInfo) ? expect : userMapping.get(expect);
    if (!user) {
        console.error(`userMapping中没有找到 ${expect} 对应的 userinfo!`);
        return;
    }

    const loc = user.location;
    // delete user from room/hall
    loc.users.delete(user);
    // delete user from userMapping
    userMapping.delete(user.socket);
}

function lookupAllUser(roomId?: string) {
    if (roomId !== undefined) {
        console.info('要查询的roomId:', roomId);
    } else {
        output.write('[\n');
        userMapping.forEach((name,socket) => {
            output.write(`${socket.remoteAddress}:${socket.remotePort} -> ${name}`);
        });
        output.write(']\n');
    }
}

function listRooms() {
    let roomListStr = 'room list: \n';

    if (roomMapping.size <= 0) {
        roomListStr += '\tnull';
    }

    for (const roomInfo of roomMapping) {
        roomListStr += `\t[ 名字：${roomInfo[1].roomId}  状态：${roomInfo[1].state}  人数：${roomInfo[1].users.size} ]\n`;
    }

    console.log(roomListStr);
    return roomListStr;
}

function destroyRoom(roomIns: room) {
    roomIns.state = roomStat.destroying;
    roomMapping.delete(roomIns.roomId);

    setTimeout(()=> {
        roomIns.state = roomStat.destroyed;
        console.info(`${roomIns.roomId} 已销毁！`);
    },10 * 1000);
}

// todo: 指令在该场景中是否可用
function canUserThisCmd(loc: locType, cmd: eCommandType) {

}

// 注意：moveUser会修改user的location
function moveUser(user: userInfo, from: locType, to: locType): void;
function moveUser(socket: net.Socket, from: locType, to: locType): void;
function moveUser(expect: userInfo | net.Socket, from: locType, to: locType) {
    if (expect instanceof userInfo) {
        from.removeUser(expect);
        to.addUser(expect);
        expect.location = to;
    } else {
        const user = userMapping.get(expect);
        if (user) {
            from.removeUser(user);
            to.addUser(user);
            user.location = to;
        }
    }
}