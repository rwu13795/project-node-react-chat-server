import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface Data {
  blocked_by: string;
  block: boolean;
}

export function blockFriend_emitter(
  socket: Socket,
  blocking_target: string,
  { blocked_by, block }: Data
) {
  socket.to(`${chatType.private}_${blocking_target}`).emit("block-friend", {
    blocked_by,
    block,
  });
}
