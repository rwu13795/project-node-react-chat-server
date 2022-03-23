import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

export function check_addFriendRequest_emitter(
  io: Server,
  sender_id: string,
  data: {
    message: string;
  }
) {
  io.to(`${chatType.private}_${sender_id}`).emit(
    "check-add-friend-request",
    data
  );
}
