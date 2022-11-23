import * as net from "node:net";
import readline from "node:readline";
import {stdin as input, stdout as output} from 'node:process';
import {eCommandType, serverInfo} from "../share/entity/defineType";
import {chatMsg, replyMsg, serverMsg} from "../share/entity/msg";
import {room, eRoomState as roomStat} from "../share/entity/room";
import {hall} from "../share/entity/hall";
import {userInfo} from "../share/entity/userInfo";

const rl = readline.createInterface({input, output});
const chatMsgIns = new chatMsg();
const serMsgIns = new serverMsg();
const reMsgIns = new replyMsg();

const userMapping = new Map<net.Socket, userInfo>();
const roomMapping = new Map<string, room>();
const hallIns = new hall();

type locType = hall | room;

let server = net.createServer(onConnection).listen(serverInfo.port, serverInfo.host, () => {
    console.log('正在监听',server.address());
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
        removeUser(socket);
    });

    socket.on('close', () => {
        const user = userMapping.get(socket);
        console.info(`${user? user.username : socket} 已离开聊天室`);
        removeUser(socket);
    });

    // todo: 服务器输入指令
    rl.on('line', (input) => {

    });
}

function handleData(data: string, socket: net.Socket) {
    let cmd = getCmdKey(data) as eCommandType;
    console.info(`[debug] 已收到消息：${socket.remoteAddress}:${socket.remotePort} => ${data}`);
    console.log('cmd =', cmd);
    // 登录指令
    if (cmd === eCommandType.login) {
        // create userInfo instance
        const name = getCmdValue(data);
        const user = new userInfo(name, socket, hallIns);

        // add to userMapping
        userMapping.set(socket, user);

        // add to hall
        hallIns.addUser(user);

        broadcast(serMsgIns.msgStr(`已加入聊天室`, name));
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
                broadcast(serMsgIns.msgStr(`${name} 创建了房间：${roomId}`), lastLoc);

                // move user
                moveUser(user, lastLoc, roomIns);
                //fixme: 这里会给创建房间的用户发送两遍消息，待修复
                broadcast(serMsgIns.msgStr(`${name} 已进入房间0：${roomIns.roomId}`), user.location);
                break;
            }
            case eCommandType.list: {
                // list all active rooms
                const roomList = listRooms();
                socket.write(serMsgIns.msgStr(roomList));
                break;
            }
            case eCommandType.join: {
                // join a room
                const roomId = getCmdValue(data);
                const room = roomMapping.get(roomId);
                if (room) {
                    moveUser(user, lastLoc, room);
                    broadcast(serMsgIns.msgStr(`${name} 已进入房间`), lastLoc);
                } else {
                    socket.write(serMsgIns.msgStr(`${roomId} 房间不存在！`));
                }
                break;
            }
            case eCommandType.leave: {
                // leave a room back to hall
                broadcast(serMsgIns.msgStr(`${name} 已离开房间`), lastLoc, user);
                moveUser(user, lastLoc, hallIns);

                // should destroy room?
                if (lastLoc instanceof room && lastLoc.userCount <= 0) {
                    console.log('最后一个用户已离开, 准备销毁房间！');
                    destroyRoom(lastLoc);
                }
                break;
            }
            case eCommandType.logout: {
                broadcast(serMsgIns.msgStr(`${name} 已离开聊天室`), hallIns);
                // 后续操作在socket的close事件中执行
                break;
            }
            case eCommandType.say: {
                const msg = getCmdValue(data);
                broadcast(chatMsgIns.msgStr(msg, name), lastLoc, user);
                break;
            }
            case eCommandType.reply: {
                const reMsg = getCmdValue(data);
                broadcast(reMsgIns.msgStr(reMsg, name), lastLoc, user);
                break;
            }
            case eCommandType.roll: {

                break;
            }
        }
    }
}

function getCmdKey(data: string) {
    return data.split(' ')[0];
}
function getCmdValue(data: string) {
    let firstSpace = data.indexOf(' ');
    return data.slice(firstSpace + 1);
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

    for (const roomId of roomMapping.keys()) {
        roomListStr += ('\t' + roomId + '\n');
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