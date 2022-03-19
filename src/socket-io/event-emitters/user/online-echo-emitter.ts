import { Socket } from "socket.io";

interface Body {
  sender_id: string;
  status: string;
}

export function onlineEcho_emitter(
  socket: Socket,
  friends_room_id: string[] | string,
  { sender_id, status }: Body
) {
  socket.to(friends_room_id).emit("online-echo", {
    sender_id,
    status,
  });
}
