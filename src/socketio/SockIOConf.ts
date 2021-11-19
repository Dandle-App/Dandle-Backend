import { Server } from 'socket.io';
import http from 'http';
import connectRedis from 'connect-redis';
import redisClient from '../redis';
import ioredis from 'ioredis';
import crypto from 'crypto';
import { logger } from '../logging';

async function socketconf(server: http.Server, redisclient: ioredis.Redis): Promise<Server | void> {
  const uuid = crypto.randomBytes(16).toString("hex");
  logger.info('Starting SocketIO...');

  const io = new Server(server);
  await io.on('connection', async socket => {
    logger.info('Connection on the socket made.');

      await socket.on('CreateRequest', (reqObj) => {
      logger.info('Ping event received');
      redisclient.setnx(uuid, reqObj);
      // testing to see if this was implemented properly
      redisclient.get(uuid, (err, result) => {
        if(err) {
          logger.info(err);
        } else {
          logger.info(result);
        }
      });
      socket.emit('requestCreated', {id: uuid});
    });
  });
  return io;
};
export default socketconf;
