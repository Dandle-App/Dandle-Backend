import { Socket } from 'socket.io';

export default (socket: Socket, room: string) => {
  socket.leave(room);
  socket.emit('RoomLeft', { room });
};
