require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION');
    console.log(err.name, err.message);
    console.log(err);
    process.exit(1);
});

const app = require('./app');
const conString  = process.env.DB.replace('<password>', process.env.DB_PASS);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});

mongoose.connect(conString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true 
})
    .then(() => console.log('Connected to database...'))
    .catch(() => {
        console.log('Unable to connect to the database.');
        exitProcess();
    });

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION');
    console.log(err.name, err.message);
    exitProcess();
});

const exitProcess = () => server.close(() => process.exit(1));