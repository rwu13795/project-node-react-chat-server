import { Socket } from "socket.io";
import { chatType } from "../event-listeners/messageToServer-listener";

export default function offline_emitter(
  socket: Socket,
  rooms_id: string[],
  user_id: string
) {
  // let the friend who is just logged in know that this socket is also online
  console.log(`let the friend ${rooms_id} this user${user_id} is offline`);

  socket.to(rooms_id).emit("offline", user_id);
}
