import { Socket } from "socket.io";

export function offline_emitter(
  socket: Socket,
  friends_room_id: string[],
  data: {
    sender_id: string;
  }
) {
  socket.to(friends_room_id).emit("offline", data);
}
