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

// ... 前面代碼不變 ...
    socket.on('editPlayer', (data) => {
        players[data.name] = {
            // 如果是新玩家（原本沒分），預設給 100 分，否則保留傳入的分數
            score: data.isNew ? 100 : parseInt(data.score),
            avatar: data.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + data.name
        };
        io.emit('updateData', players);
    });
// ... 後面代碼不變 ...

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
