const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fetch = require('node-fetch'); // <--- 1. 頂部加呢句

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};

// Google Sheet Web App URL (記得換成你部署嗰條)
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbw2gqPFDXCt-on9QPPfVZQtPQfa2wfek2aSHd146SwnoLcaXnNxl5KIeNnZm0POhT2q/exec";

app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------
// 2. 加入定時備份邏輯 (放喺呢度)
// ---------------------------------------------------------
setInterval(() => {
    if (Object.keys(players).length > 0) {
        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(players),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => console.log('備份成功至 Google Sheet'))
        .catch(err => console.error('備份失敗:', err));
    }
}, 30000); 
// ---------------------------------------------------------

io.on('connection', (socket) => {
    socket.emit('updateData', players);

    socket.on('editPlayer', (data) => {
        players[data.name] = {
            score: data.isNew ? 100 : parseInt(data.score),
            avatar: data.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + data.name
        };
        io.emit('updateData', players);
    });

    socket.on('deletePlayer', (name) => {
        delete players[name];
        io.emit('updateData', players);
    });

    socket.on('resetAll', () => {
        players = {};
        io.emit('updateData', players);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`系統已啟動！Port: ${PORT}`);
});
