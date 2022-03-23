import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

export function addFriendResponse_emitter(
  socket: Socket,
  respondTo: string,
  data: {
    acceptor_name: string;
  }
) {
  socket
    .to(`${chatType.private}_${respondTo}`)
    .emit("add-friend-response", data);
}
