import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import session from 'express-session';
import connectRedis from 'connect-redis';
import passport from 'passport';
import bcrypt from 'bcrypt';
import multer from 'multer';
import redisClient from './redis';
import { logger, middlewareLogger } from './logging';
import indexRouter from './routes';
import testRouter from './routes/test/testRouter';
import signUpRouter from './routes/signup/signUpRouter';
import signInRouter from './routes/signin/signInRouter';
import User from './models/user';

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

// This is just a hacky way of avoiding using async/await syntax at top-level
prestart().catch(() => {
  logger.error('Error occurred during prestart!');
});

app.use(middlewareLogger); // for logging internal express logging
app.use(helmet()); // security basics
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use(express.static('public'));

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = crypto.randomBytes(64).toString('hex');
}

User.findOneAndUpdate(
  {
    username: 'testuse@test.com',
    password: bcrypt.hashSync('password1234', 10),
    staff_name: 'Test McTesterson',
  },
  {
    $push: {
      orgs: {
        org_id: 'org123456789',
        is_admin: true,
        staff_id: 29471823,
      },
    },
  },
  {
    upsert: true,
  },
).catch((error) => {
  if (error.code !== 11000) logger.error(JSON.stringify(error));
});

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

require('./auth/passportConfig')(passport);

app.use('/', indexRouter);
app.use('/test', testRouter);
app.use('/signup', signUpRouter);
app.use('/signIn', signInRouter);

export default app;
