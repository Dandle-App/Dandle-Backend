import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bp from 'body-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import session from 'express-session';
import connectRedis from 'connect-redis';
import passport from 'passport';
import multer from 'multer';
import winston from 'winston';
import expressWinston from 'express-winston';
import { Server } from 'http';
import redisClient from './redis';
import { logger } from './logging';
import indexRouter from './routes';
import testRouter from './routes/test/testRouter';
import signUpRouter from './routes/signup/signUpRouter';
import signInRouter from './routes/signin/signInRouter';
import socketconf from './socketio/SockIOConf';
import requestRouter from './routes/requests/requestRouter';

const upload = multer();
dotenv.config();
const app = express();
logger.info(JSON.stringify(process.env.REDIS_HOST));
const RedisStore = connectRedis(session);

async function prestart() {
  // Connect to mongoose before continuing, if its not set then log the error and exit
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (e) {
      const error: String = JSON.stringify(e);
      logger.error(`Could not connect to Mongo. Error: ${error}`);
    }
  } else {
    logger.error('MongoDB connection string was not set!');
    process.exit(1);
  }
}

function normalizePort(portStr: string): number {
  const port = parseInt(portStr, 10);

  if (Number.isNaN(port) && port <= 0) {
    logger.crit('Invalid port!');
    process.exit(1);
  }

  return port;
}

// This is just a hacky way of avoiding using async/await syntax at top-level
prestart().catch(() => {
  logger.error('Error occurred during prestart!');
});
app.use(helmet()); // security basics
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use(express.static('public'));

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = crypto.randomBytes(64).toString('hex');
}

app.use(
  session({
    // @ts-ignore redis client will always be initialized before this.
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.File({
        format: winston.format.combine(
          winston.format.label({ label: 'express-internal' }),
          winston.format.timestamp(),
          winston.format.json(),
        ),
        filename: 'logs.log',
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.label({ label: 'express-internal' }),
          winston.format.timestamp(),
          winston.format.padLevels(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ],
    expressFormat: true,
    colorize: true,
  }),
);

require('./auth/passportConfig')(passport);

app.use('/', indexRouter);
app.use('/test', testRouter);
app.use('/signup', signUpRouter);
app.use('/signin', signInRouter);
app.use('/requests', requestRouter);

// Start the server up!
// if the env is not production then start the server with a random port
// eslint-disable-next-line import/no-mutable-exports
let server: Server;

if (process.env.NODE_ENV === 'test') {
  server = app.listen(0, () => {
    // if server is not null then log the port
    if (server !== null) {
      // @ts-ignore: Object is possibly 'null'.
      const { port } = server.address();
      logger.info(`Server is listening on port ${port}`);
      socketconf(server, redisClient);
    }
  });
} else {
  // if the env is production then start the server on the port specified in the env
  const port = normalizePort(process.env.PORT || '3000');
  server = app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
    socketconf(server, redisClient);
  });
}

// export the app and the server for testing
export { app, server };
