import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

export function blockFriend_emitter(
  socket: Socket,
  blocking_target: string,
  data: {
    blocked_by: string;
    block: boolean;
  }
) {
  socket
    .to(`${chatType.private}_${blocking_target}`)
    .emit("block-friend", data);
}
