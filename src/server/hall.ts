import {userInfo} from "../share/entity/userInfo";
import * as net from "net";

export class hall {
    private _users: Set<userInfo>;
    private _userCount: number;

    constructor() {
        this._users = new Set<userInfo>();
        this._userCount = this._users.size;
    }

    addUser(user: userInfo) {
        this._users.add(user);
    }

    removeUser(user: userInfo):boolean {
        if (this._users.has(user)) {
            this._users.delete(user);
            // console.log('this._users =', this._users);
            return true;
        } else {
            console.log('没有找到待删除用户！');
            return false;
        }
    }

    searchUser(name: string): userInfo | undefined;
    searchUser(socket: net.Socket): userInfo | undefined;
    searchUser(expect: string | net.Socket) {
        if (typeof expect === "string") {
            for (const user of this._users) {
                if (user.username === expect)
                    return user;
            }
            return undefined;
        } else {
            for (const user of this._users) {
                if (user.socket === expect)
                    return user;
            }
            return undefined;
        }
    }
    get users() {
        return this._users;
    }
    get userCount() {
        return this._users.size;
    }
}