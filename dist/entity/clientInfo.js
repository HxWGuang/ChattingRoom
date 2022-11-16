"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientInfo = void 0;
class clientInfo {
    constructor(name, socket) {
        this.name = name;
        if (typeof socket !== null) {
            this.socket = socket;
        }
    }
}
exports.clientInfo = clientInfo;
