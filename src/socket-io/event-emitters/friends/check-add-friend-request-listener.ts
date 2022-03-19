import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

interface Body {
  message: string;
}

export function check_addFriendRequest_emitter(
  io: Server,
  sender_id: string,
  { message }: Body
) {
  io.to(`${chatType.private}_${sender_id}`).emit("check-add-friend-request", {
    message,
  });
}
