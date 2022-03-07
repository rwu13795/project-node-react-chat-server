import { Server, Socket } from "socket.io";
import { chatType } from "../user/message-to-server-listener";

// force the user who got kicked out disconnect from the group room
// so that he can no longer send message to that room
export function kickedOutOfGroup_listener(socket: Socket) {
  socket.on("kicked-out-of-group", async (group_id: string) => {
    socket.leave(`${chatType.group}_${group_id}`);
  });
}
