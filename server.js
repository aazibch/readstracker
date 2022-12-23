const http = require('http');
require('dotenv').config();
const mongoose = require('mongoose');
const socketController = require('./controllers/socketController');

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION', err);
    process.exit(1);
});

const app = require('./app');

const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});

io.on('connection', socketController.onConnection(io));

const conString = process.env.DB.replace('<password>', process.env.DB_PASS);

const exitProcess = () => server.close(() => process.exit(1));

mongoose
    .connect(conString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => console.log('Connected to database...'))
    .catch((err) => {
        console.log(err);
        console.log('Unable to connect to the database.');
        exitProcess();
    });

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION', err);
    exitProcess();
});

process.on('SIGTERM', () => {
    console.log('SIGTERM! Shutting down...');

    server.close(() => {
        console.log('Server closed.');
    });
});
