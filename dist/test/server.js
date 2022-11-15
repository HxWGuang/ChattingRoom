"use strict";
const http = require("http");
const fs = require("fs");
const url = require("url");
http.createServer((req, res) => {
    //解析请求
    // console.log(req.connection)
    const pathname = url.parse(req.url).pathname;
    console.log(pathname);
    fs.readFile(pathname.substring(1), (err, data) => {
        if (err) {
            // 404
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        }
        else {
            // 200
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            //响应文件内容
            res.write("data => " + data.toString());
        }
        res.end();
    });
}).listen(3000, () => { console.log("Server running at http://localhost:3000/"); });
