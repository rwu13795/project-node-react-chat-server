import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface Data {
  acceptor_name: string;
}

export function addFriendResponse_emitter(
  socket: Socket,
  respondTo: string,
  { acceptor_name }: Data
) {
  socket
    .to(`${chatType.private}_${respondTo}`)
    .emit("add-friend-response", { acceptor_name });
}
