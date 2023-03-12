const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const booksRoutes = require('./routes/booksRoutes');
const usersRoutes = require('./routes/usersRoutes');
const viewsRoutes = require('./routes/viewsRoutes');
const conversationsRoutes = require('./routes/conversationsRoutes');
const connectionsRoutes = require('./routes/connectionsRoutes');
const error = require('./middleware/error');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.options('*', cors());

app.use(helmet());

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again in an hour.'
});

app.use('/api', limiter);
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json('10kb'));
app.use(express.json());

app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['title', 'author', 'rating', 'genre', 'dateCreated']
  })
);
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/', viewsRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/conversations', conversationsRoutes);
app.use('/api/v1/connections', connectionsRoutes);

app.all('*', (req, res, next) => {
  next(new AppError('Route not found.', 404));
});
app.use(error);

module.exports = app;
