const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utills/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utills/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chat BOT';

// Run when client connects
io.on('connection', (socket) => {
  // A user joining a room
  socket.on('joinRoom', ({ username, room }) => {
    // Enter the user to specific room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room); //??

    // Welcome current user
    socket.emit('message', formatMessage(botName, "Welcome to Niel's World"));

    // Broadcast when a user connects except the sender
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      //??
      room: user.room, //??
      users: getRoomUsers(user.room), //??
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when a user disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      //??
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        //??
        room: user.room, //??
        users: getRoomUsers(user.room), //??
      });
    }
  });
});

server.listen(3000, () => {
  console.log('listening at port 3000');
});
