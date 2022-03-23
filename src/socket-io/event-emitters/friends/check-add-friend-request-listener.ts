import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

interface Data {
  message: string;
}

export function check_addFriendRequest_emitter(
  io: Server,
  sender_id: string,
  { message }: Data
) {
  io.to(`${chatType.private}_${sender_id}`).emit("check-add-friend-request", {
    message,
  });
}
