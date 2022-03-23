import { Socket } from "socket.io";

export function online_emitter(
  socket: Socket,
  friends_room_id: string[] | string,
  data: {
    sender_id: string;
    status: string;
  }
) {
  socket.to(friends_room_id).emit("online", data);
}
