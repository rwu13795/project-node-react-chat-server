import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface Body {
  acceptor_name: string;
}

export function addFriendResponse_emitter(
  socket: Socket,
  respondTo: string,
  { acceptor_name }: Body
) {
  socket
    .to(`${chatType.private}_${respondTo}`)
    .emit("add-friend-response", { acceptor_name });
}
