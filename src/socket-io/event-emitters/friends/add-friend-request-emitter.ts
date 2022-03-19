import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface Body {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  message: string;
}

export function addFriendRequest_emitter(
  socket: Socket,
  target_id: string,
  { sender_id, sender_username, sender_email, message }: Body
) {
  socket.to(`${chatType.private}_${target_id}`).emit("add-friend-request", {
    sender_id,
    sender_username,
    sender_email,
    message,
  });
}
