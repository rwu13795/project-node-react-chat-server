import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

export function kickedOutOfGroup_emitter(
  io: Server,
  kicked_member_id: string,
  data: {
    group_id: string;
  }
) {
  io.to(`${chatType.private}_${kicked_member_id}`).emit(
    "kicked-out-of-group",
    data
  );
}
