import * as net from "net";
import {room} from "./room";
import {hall} from "./hall";
import {eUserType} from "../share/utils/attTypeDefine";

export class userInfo {
    private _username: string;
    private _socket: net.Socket;
    private _location: room | hall;
    private _type: eUserType;
    private _ip: string;

    constructor(username:string, socket:net.Socket, location: room | hall, type: eUserType, ip: string) {
        this._username = username;
        this._socket = socket;
        this._location = location;
        this._type = type;
        this._ip = ip;
    }

    get username() {
        return this._username;
    }
    get socket() {
        return this._socket;
    }
    get type() {
        return this._type;
    }
    get ip() {
        return this._ip;
    }
    get location() {
        return this._location;
    }
    set location(loc: room | hall) {
        this._location = loc;
    }
}