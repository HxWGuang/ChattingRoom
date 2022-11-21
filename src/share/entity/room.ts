import * as net from "node:net";

export class room {
    roomId: string;
    userCount: number;
    private sockets: net.Socket[];

    constructor(roomId:string, ...sockets:net.Socket[]) {
        this.roomId = roomId;
        if (sockets !== undefined) {
            this.sockets = sockets;
        } else {
            this.sockets = [];
        }
        this.userCount = sockets.length;
    }
}