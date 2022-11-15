"use strict";
const net = require("net");
const host = "127.0.0.1";
const port = 3000;
const server = net.createServer(socket => {
    console.log(`connected: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.on('data', (data) => {
        console.log(`${socket.remoteAddress}:${data}`);
        socket.write(`${data}`);
    });
    socket.on('close', (hadError) => {
        console.log(`hadError? -> ${hadError}`);
        console.log(`connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
    });
}).listen(port, host, () => {
    // console.log(`Server listening on ${host}:${port}`);
    console.log(`Server listening on`, server.address());
});
