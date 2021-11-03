import { Server } from 'socket.io';
import http from 'http';
import { logger } from '../logging';

export default (server: http.Server) => {
  logger.info('Starting SocketIO...');

  const io = new Server(server);
  io.on('connection', () => {
    logger.info('Connection on the socket made.');
  });
};
