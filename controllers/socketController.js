let onlineUsers = [];

const saveUser = (data) => {
    onlineUsers.push(data);
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getRecipient = (convoId, currentSocketId) => onlineUsers.find(
    (user) =>
        user.convoId === convoId && user.socketId !== currentSocketId
);

exports.onConnection = (io) => {
    return (socket) => {
        console.log('[Socket server] A user connected to the socket server.');

        socket.on('saveUser', (convoId) => {
            saveUser({ socketId: socket.id, convoId });

            io.emit('onlineUsers', onlineUsers);
        });

        socket.on('sendMessage', (data) => {
            const recipient = getRecipient(data.convoId, socket.id);

            io.to(recipient.socketId).emit('chatMessage', {
                content: data.content
            });
        });

        socket.on('disconnect', (io) => {
            console.log(
                '[Socket server] A user disconnected from the socket server.'
            );

            removeUser(socket.id);
        });
    };
};
