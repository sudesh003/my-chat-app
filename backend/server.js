const express = require('express');
const http = require('http');
const app = express();
const port = 8000;
const cors = require('cors');
const { Server } = require('socket.io');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://ec2-52-66-205-55.ap-south-1.compute.amazonaws.com:3000/',
        methods: ['GET', 'POST'],
    },
});

const users = {};

io.on('connection', (socket) => {
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name;
        io.emit('users-update', Object.values(users));
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', (message) => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    // If someone leaves the chat, let others know
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('users-update', Object.values(users));
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
