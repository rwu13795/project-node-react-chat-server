import { Socket } from "socket.io";

export function changeAvatar_emitter(
  socket: Socket,
  friends_room_id: string[] | string,
  data: {
    sender_id: string;
    new_avatar_url: string;
  }
) {
  socket.to(friends_room_id).emit("change-avatar", data);
}
