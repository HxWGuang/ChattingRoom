"use strict";
exports.__esModule = true;
exports.clientInfo = void 0;
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
