const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (data) => {
        socket.userId = data.userId;
        socket.nickname = data.nickname;
        console.log(`${data.nickname} (${data.userId}) joined the chat`);
    });

    socket.on('sendMessage', (message) => {
        io.emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
