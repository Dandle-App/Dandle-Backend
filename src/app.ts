import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { logger, middlewareLogger } from './logging';
import indexRouter from './routes';
import testDbRouter from './routes/test/db';

dotenv.config();
const app = express();
const redisClient = new Redis(6379, 'redis');
redisClient.on('error', (errorObj) => {
  const errorString = JSON.stringify(errorObj, null, 2);
  if (errorObj.code === 'ENOTFOUND') {
    logger.error('Could not connect to Redis, check that it is running and the URL is correct.');
  } else {
    logger.error(errorString);
  }
});
redisClient.on('ready', () => {
  logger.info('Connected to Redis!');
});

const RedisStore = connectRedis(session);
async function prestart() {
  // Connect to mongoose before continuing, if its not set then log the error and exit
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (e) {
      logger.error('Could not connect');
    }
  } else {
    logger.error('MongoDB connection string was not set!');
    process.exit(1);
  }
}

// This is just a hacky way of avoiding using async/await syntax at top-level
prestart().catch(() => {
  logger.error('Error occurred during prestart!');
});

app.use(middlewareLogger); // for logging internal express logging
app.use(helmet()); // security basics
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    // @ts-ignore redis client will always be initialized before this.
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret:
            process.env.SESSION_SECRET
            || crypto.randomBytes(64).toString('hex'),
    resave: false,
  }),
);

app.use('/', indexRouter);
app.use('/test', testDbRouter);

export default app;
