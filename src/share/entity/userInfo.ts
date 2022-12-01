import * as net from "net";
import {room} from "./room";
import {hall} from "../../server/hall";

export class userInfo {
    private _username: string;
    private _socket: net.Socket;
    private _location: room | hall;

    constructor(username:string, socket:net.Socket, location: room | hall) {
        this._username = username;
        this._socket = socket;
        this._location = location;
    }

    get username() {
        return this._username;
    }
    get socket() {
        return this._socket;
    }
    get location() {
        return this._location;
    }
    set location(loc: room | hall) {
        this._location = loc;
    }
}