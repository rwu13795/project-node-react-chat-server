import { Socket } from "socket.io";

interface Body {
  sender_id: string;
}

export function offline_emitter(
  socket: Socket,
  friends_room_id: string[],
  { sender_id }: Body
) {
  socket.to(friends_room_id).emit("offline", { sender_id });
}
