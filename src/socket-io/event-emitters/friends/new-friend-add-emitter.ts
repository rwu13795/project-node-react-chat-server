import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

export function newFriendAdded_emitter(io: Server, target_id: string) {
  io.to(`${chatType.private}_${target_id}`).emit("new-friend-added");
}
