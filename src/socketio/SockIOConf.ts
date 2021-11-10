import { Server } from 'socket.io';
import http from 'http';
import ioredis from 'ioredis';
import crypto from 'crypto';
import passport from 'passport';
import session from 'express-session';
import { logger } from '../logging';
import HandleCreateRequest from './HandleCreateRequest';
import HandleRoomJoinRequest from './HandleRoomJoinRequest';
import HandleRoomLeave from './HandleRoomLeave';
import HandleCancelRequest from './HandleCancelRequest';

// Wrapper for socket.io middleware
const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

export default (server: http.Server, redisclient: ioredis.Redis) => {
  logger.info('Starting SocketIO...');

  const io = new Server(server);
  io.on('connection', (socket) => {
    socket.on('CreateRequest', (reqObj) => HandleCreateRequest(redisclient, socket, reqObj));
    // handler to handle RoomJoinRequest event and emit RoomJoined event
    socket.on('RoomJoinRequest', (room: string) => HandleRoomJoinRequest(socket, room));
    // handler to handle RoomLeaveRequest event and emit RoomLeft event
    socket.on('RoomLeaveRequest', (room: string) => HandleRoomLeave(socket, room));
    // hanlder to handle CancelRequest event and emit RequestCancelled event
    socket.on('CancelRequest', (reqId) => HandleCancelRequest(redisclient, socket, reqId));
    
    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });
  });

  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = crypto.randomBytes(64).toString('hex');
  }

  io.use(wrap(session({
    // @ts-ignore redis client will always be initialized before this.
    store: new RedisStore({ client: redisClient }),
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
  })));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));
  io.use(wrap(passport.authenticate('jwt', { session: false })));

  io.use((socket: any, next) => {
    if (socket.request.user) {
      next();
    } else {
      next(new Error('unauthorized'));
    }
  });

  return io;
};
