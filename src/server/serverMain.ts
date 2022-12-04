import * as net from "node:net";
import * as fs from "fs";
// import {stdin as input, stdout as output} from 'node:process';
import {serverInfo, userStoreLoc} from "../share/entity/serverConfig";
import {msgTool} from "../share/utils/msgTool";
import {room} from "./room";
import {hall} from "./hall";
import {userInfo} from "./userInfo";
import {rollGameMgr} from "./rollGameMgr";
import {
    dataBodyStruct,
    eCommandType,
    eGameStat,
    eMsgType,
    eRoomState as roomStat,
    eUserType,
    userInfoStruct,
    usersDataStruct
} from "../share/utils/attTypeDefine";

// const rl = readline.createInterface({input, output});

let users: usersDataStruct = {
    count: 0,
    users: []
}
const userMapping = new Map<net.Socket, userInfo>();
const roomMapping = new Map<string, room>();
const hallIns = new hall();
const rollGameMgrIns = new rollGameMgr();
let timer: NodeJS.Timer | undefined;
let intervalTimer: NodeJS.Timer | undefined;

type locType = hall | room;

let serverMain = net.createServer(onConnection).listen(serverInfo.port, serverInfo.host, () => {
    console.log('正在监听',serverMain.address());

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
        console.error(err);
        onClose();
    });

    socket.on('close', onClose);

    function onClose() {
        const user = removeUser(socket);
        if (!user) {
            console.error(`onClose: ${socket} 未找到!`);
            return;
        }
        broadcast(msgTool.toJson(eMsgType.server, `${user.username} 已离开聊天室`), user.location);
        if (user.location instanceof room && user.location.users.size <= 0) {
            console.log('开始删除房间')
            destroyRoom(user.location);
        }
    }

    // todo: 服务器输入指令
    // rl.on('line', (input) => {
    //
    // });
}

function handleData(_data: string, socket: net.Socket) {
    let data: dataBodyStruct = JSON.parse(_data);
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

        let user: userInfoStruct | undefined;
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
                const _user = new userInfo(name, socket, hallIns, user.type, user.ip);
                // add to userMapping
                userMapping.set(socket, _user);
                // add to hall
                hallIns.addUser(_user);
                broadcast(msgTool.toJson(eMsgType.server, `${name} 已进入聊天室`), hallIns);
                socket.write(msgTool.toJson(eMsgType.server, listRooms()));
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

        // write to file
        let userdata: userInfoStruct = {
            username: name,
            password: pwd,
            ip: socket.remoteAddress ? socket.remoteAddress.toString() : 'null',
            type: eUserType.normal, //默认普通用户，管理员不在客户端注册
        }
        users.users.push(userdata);
        users.count++;
        fs.writeFile(userStoreLoc, JSON.stringify(users), ()=> {
            console.info('已写入用户数据');
            socket.write(msgTool.toJson(eMsgType.server, '注册成功！'));
        });
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
            case eCommandType.refresh: {
                // refresh all active rooms
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
                socket.write(msgTool.toJson(eMsgType.server, listRooms()));

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
                if (rollGameMgrIns.status === eGameStat.started) {
                    socket.write(msgTool.toJson(eMsgType.server, '游戏已开始!'));
                    return;
                }

                // game not start
                if (rollGameMgrIns.players.size <= 0) {
                    broadcast(msgTool.toJson(eMsgType.server, `${name}开启了一局roll游戏！`));
                    rollGameMgrIns.startTime = Date.now();
                    rollGameMgrIns.players.add(user);
                    timer = setTimeout(() => {
                        onGamTimerDone(lastLoc);
                    }, 10 * 1000);
                    intervalTimer = setInterval(() => {
                        let diff = Date.now() - rollGameMgrIns.startTime;
                        console.log('diff =', diff);
                        if (diff >= 5 * 1000) {
                            broadcast(msgTool.toJson(eMsgType.server, `倒计时：${10 - Math.floor(diff/1000)}`), lastLoc);
                        }
                    }, 1000);
                } else {
                    let diff = Date.now() - rollGameMgrIns.startTime;
                    if (diff < 10 * 1000) {
                        if (diff >= 5 * 1000) {
                            socket.write(msgTool.toJson(eMsgType.server, `游戏已进入倒计时！不能加入`));
                        } else {
                            rollGameMgrIns.startTime = Date.now();
                            rollGameMgrIns.players.add(user);
                            broadcast(msgTool.toJson(eMsgType.server, `${name} 加入游戏`), lastLoc);
                            timer?.refresh();
                            // clearTimeout(timer);
                            // timer = setTimeout(() => {
                            //     onGamTimerDone(lastLoc);
                            // },10 * 1000);
                        }
                    }
                }
                break;
            }
            case eCommandType.list: {
                if (user.type === eUserType.admin) {
                    socket.write(msgTool.toJson(eMsgType.server, showUsers(lastLoc)));
                }
                break;
            }
            case eCommandType.kick: {
                if (user.type === eUserType.admin) {
                    const kickUser = lastLoc.searchUser(data.arg[0]);
                    if (kickUser) {
                        console.info(`准备踢掉用户：${kickUser.username}`);
                        moveUser(kickUser,lastLoc,hallIns);
                        broadcast(msgTool.toJson(eMsgType.server,`${kickUser.username} 已离开房间`), lastLoc);
                        kickUser.socket.write(msgTool.toJson(eMsgType.server, listRooms()));
                    } else {
                        socket.write(msgTool.toJson(eMsgType.server, `未找到用户：${data.arg[0]}`));
                    }
                }
                break;
            }
        }
    }
}

function onGamTimerDone(loc: locType) {
    clearInterval(intervalTimer);
    let res = rollGameMgrIns.startGame();
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

function removeUser(user: net.Socket): userInfo | undefined;
function removeUser(user: userInfo): userInfo | undefined;
function removeUser(expect: net.Socket | userInfo): userInfo | undefined
{
    if (userMapping.size <= 0) return;

    const user = (expect instanceof userInfo) ? expect : userMapping.get(expect);
    if (!user) {
        console.error(`userMapping中没有找到 ${expect} 对应的 userinfo!`);
        return undefined;
    }

    const loc = user.location;
    // delete user from room/hall
    loc.users.delete(user);
    // delete user from userMapping
    userMapping.delete(user.socket);

    return user;
}

function showUsers(loc: locType): string {
    let resStr = 'user list: \n';

    for (let user of loc.users) {
        resStr += `\t[ 用户名：${user.username}  ip：${user.ip} ]\n`;
    }

    return resStr;
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
function canUseThisCmd(loc: locType, cmd: eCommandType) {

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