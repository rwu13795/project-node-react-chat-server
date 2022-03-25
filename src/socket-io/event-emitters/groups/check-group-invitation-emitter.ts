import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

export function check_groupInvitation_emitter(
  io: Server,
  target_id: string,
  data: {
    message: string;
  }
) {
  io.to(`${chatType.private}_${target_id}`).emit(
    "check-group-invitation",
    data
  );
}
