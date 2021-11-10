import { Socket } from 'socket.io';

export default (socket: Socket, room: string) => {
  socket.join(room);
  socket.emit('RoomJoined', { room });
};
