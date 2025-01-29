const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (data) => {
        socket.username = data.username;
        console.log(`${socket.username} joined the chat`);
    });

    socket.on('chat', (data) => {
        console.log('Message received:', data);
        io.emit('chat', data);
    });

    socket.on('fileUpload', (data) => {
        console.log('File uploaded:', data);
        io.emit('chat', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.username} disconnected`);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
