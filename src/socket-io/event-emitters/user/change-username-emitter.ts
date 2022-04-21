import { Socket } from "socket.io";

export function changeUsername_emitter(
  socket: Socket,
  friends_room_id: string[] | string,
  data: {
    sender_id: string;
    new_name: string;
  }
) {
  socket.to(friends_room_id).emit("change-username", data);
}
