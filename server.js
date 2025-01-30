const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());
app.use(express.static('client'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (data) => {
        console.log(`${data.username} joined the chat`);
    });

    socket.on('chat', (data) => {
        io.emit('chat', data);
    });

    socket.on('fileUpload', (data) => {
        io.emit('chat', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
