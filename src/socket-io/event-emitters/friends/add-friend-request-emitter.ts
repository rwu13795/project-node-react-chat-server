import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

export function addFriendRequest_emitter(
  socket: Socket,
  target_id: string,
  data: {
    sender_id: string;
    sender_username: string;
    sender_email: string;
    message: string;
  }
) {
  socket
    .to(`${chatType.private}_${target_id}`)
    .emit("add-friend-request", data);
}
