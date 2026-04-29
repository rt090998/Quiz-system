const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存放玩家數據
let players = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // 新連線時發送現有數據
    socket.emit('updateData', players);

    // 處理新增或修改分數
    socket.on('editPlayer', (data) => {
        players[data.name] = {
            score: parseInt(data.score),
            avatar: data.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + data.name
        };
        io.emit('updateData', players);
    });

    // 處理刪除玩家
    socket.on('deletePlayer', (name) => {
        delete players[name];
        io.emit('updateData', players);
    });

    // 處理清空所有數據 (新場次用)
    socket.on('resetAll', () => {
        players = {};
        io.emit('updateData', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`系統已啟動！Port: ${PORT}`);
});