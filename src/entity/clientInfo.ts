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