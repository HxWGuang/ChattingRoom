"use strict";
exports.__esModule = true;
exports.clientInfo = exports.serverInfo = void 0;
// 服务器信息
exports.serverInfo = {
    host: "127.0.0.1",
    port: 3000
};
var clientInfo = /** @class */ (function () {
    function clientInfo(name, socket) {
        this.name = name;
        if (typeof socket !== null) {
            this.socket = socket;
        }
    }
    return clientInfo;
}());
exports.clientInfo = clientInfo;
