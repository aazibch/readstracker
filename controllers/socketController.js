let onlineUsers = [];

const saveUser = (data) => {
    if (!onlineUsers.some((user) => user.userId === data.id))
        onlineUsers.push(data);
};

const updateUserActiveState = (data) => {
    const index = onlineUsers.findIndex(
        (user) => user.socketId === data.socketId
    );

    onlineUsers[index] = {
        ...onlineUsers[index],
        activeConversation: data.activeConversation
    };
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => onlineUsers.find((user) => user.userId === userId);

exports.onConnection = (io) => {
    return (socket) => {
        console.log('[Socket server] A user connected to the socket server.');

        socket.on('saveUser', (userId) => {
            saveUser({ userId, socketId: socket.id, activeConversation: null });
            io.emit('onlineUsers', onlineUsers);
        });

        socket.on('updateUserActiveState', (data) => {
            updateUserActiveState(data);

            io.emit('onlineUsers', onlineUsers);
        });

        socket.on('sendMessage', (data) => {
            const user = getUser(data.recipient);

            console.log('[socketsController.js sendMessage] data', data);

            if (user) {
                io.to(user.socketId).emit('chatMessage', {
                    content: data.content,
                    sender: data.sender,
                    conversationId: data.conversationId
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(
                '[Socket server] A user disconnected from the socket server.'
            );
            removeUser(socket.id);
            io.emit('onlineUsers', onlineUsers);
        });
    };
};
