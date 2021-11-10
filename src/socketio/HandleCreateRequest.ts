import crypto from 'crypto';
import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import { logger } from '../logging';

const HandleCreateRequest = (redisclient: Redis, socket: Socket, reqObj: any) => {
  const uuid = crypto.randomBytes(16).toString('hex');
  logger.info('Request Created');
  redisclient.setnx(uuid, reqObj);
  // testing to see if this was implemented properly
  redisclient.get(uuid, (err: any, result: any) => {
    if (err) {
      logger.info(err);
    } else {
      logger.info(result);
    }
  });
  socket.emit('requestCreated', { id: uuid });
};

export default HandleCreateRequest;
