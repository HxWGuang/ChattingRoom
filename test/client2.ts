const net = require('node:net');

const host = 'localhost';
const port = 3000;

let socket = new net.Socket();

socket.connect(port, host, () => {
    socket.write("HEAD / HTTP/1.0\r\n");
    socket.write("Host: localhost\r\n");
    socket.write("User-Agent: Node.js HTTP client\r\n");
    socket.write("Accept: text/html\r\n");
    socket.write("Connection: close\r\n\r\n");
});

socket.on('data', (data) => {
    console.log(`${data}`);
    socket.destroy();
})