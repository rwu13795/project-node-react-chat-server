import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

interface Data {
  group_id: string;
}

export function kickedOutOfGroup_emitter(
  io: Server,
  kicked_member_id: string,
  { group_id }: Data
) {
  io.to(`${chatType.private}_${kicked_member_id}`).emit("kicked-out-of-group", {
    group_id,
  });
}
