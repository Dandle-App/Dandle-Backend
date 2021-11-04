import { Server, Socket } from 'socket.io';
import http from 'http';
import { logger } from '../logging';

export default (server: http.Server) => {
  logger.info('Starting SocketIO...');

  const io = new Server(server);
  io.on('connection', (socket: Socket) => {
    logger.info('Connection on the socket made.');

    socket.on('ping', () => {
      logger.info('Ping event recieved!');
      socket.emit('pong', 'pong');
    });
  });

  return io;
};
