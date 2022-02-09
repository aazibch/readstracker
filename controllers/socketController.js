// const io = require('socket');

let onlineUsers = [];

const saveUser = (data) => {
    onlineUsers.push(data);
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

exports.onConnection = (io) => {
    return (socket) => {
        console.log('[Socket server] A user connected to the socket server.');

        socket.on('saveUser', (convoId) => {
            saveUser({ socketId: socket.id, convoId });

            io.emit('onlineUsers', onlineUsers);
        });

        socket.on('sendMessage', (data) => {
            // To refactor
            const receiver = onlineUsers.find(
                (user) =>
                    user.convoId === data.convoId && user.socketId !== socket.id
            );

            io.to(receiver.socketId).emit('chatMessage', {
                content: data.content
            });
        });

        socket.on('disconnect', (io) => {
            console.log(
                '[Socket server] A user disconnected from the socket server.'
            );

            removeUser(socket.id);

            // io.emit('onlineUsers', onlineUsers);
        });
    };
};
