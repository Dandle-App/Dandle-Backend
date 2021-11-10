import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
import { logger } from '../logging';

export default (redisclient: Redis, socket: Socket, reqId: string) => {
  // Check if the user from the socket request is the same as the user from the redis request
  redisclient.get(reqId, (err, reply) => {
    if (err) {
      logger.error(err);
      return;
    }
    if (reply) {
      const user = JSON.parse(reply);
      if (user.socketId === socket.id) {
        redisclient.del(reqId);
      }
    }
    logger.info('Request Created');
    redisclient.del(reqId);
    socket.emit('RequestCancelled', { id: reqId });
  });
};
