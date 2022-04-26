let onlineUsers = [];

const saveUser = (data) => {
    onlineUsers.push(data);
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getCorrespondent = (userId) =>
    onlineUsers.find((user) => user.userId === userId);

exports.onConnection = (io) => {
    return (socket) => {
        console.log('[Socket server] A user connected to the socket server.');

        socket.on('saveUser', (userId) => {
            const updatedData = { userId, socketId: socket.id };

            saveUser(updatedData);
            io.emit('onlineUsers', onlineUsers);
        });

        socket.on('sendMessage', (data) => {
            const correspondent = getCorrespondent(data.recipient);

            console.log('[socketsController.js] data', data);

            if (correspondent) {
                io.to(correspondent.socketId).emit('chatMessage', {
                    content: data.content,
                    sender: data.sender,
                    convoId: data.convoId
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
