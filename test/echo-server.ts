const net = require("net");

const host = "localhost";
const port = 3000;

net.createServer(socket => {
    console.log(`connected: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        console.log(`${socket.remoteAddress}:${data}`);
        socket.write(`${data}`);
    });

    socket.on('close', (hadError) => {
        console.log(`hadError? -> ${hadError}`);
        console.log(`connection closed: ${socket.remoteAddress}:${socket.remotePort}`);
    });
}).listen(port,host,() => {
    console.log(`Server listening on ${host}:${port}`);
})