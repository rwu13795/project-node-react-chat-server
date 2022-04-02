import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

export function groupInvitationRequest_emitter(
  socket: Socket,
  invitee_id: string,
  data: {
    group_id: string;
    group_name: string;
    inviter_id: string;
    was_responded: boolean;
  }
) {
  socket
    .to(`${chatType.private}_${invitee_id}`)
    .emit("group-invitation-request", data);
}
