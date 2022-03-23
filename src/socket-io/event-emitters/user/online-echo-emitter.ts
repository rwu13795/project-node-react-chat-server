import { Socket } from "socket.io";

interface Data {
  sender_id: string;
  status: string;
}

export function onlineEcho_emitter(
  socket: Socket,
  friends_room_id: string[] | string,
  { sender_id, status }: Data
) {
  socket.to(friends_room_id).emit("online-echo", {
    sender_id,
    status,
  });
}
