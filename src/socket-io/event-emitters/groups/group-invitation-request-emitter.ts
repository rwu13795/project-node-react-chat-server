import { Socket } from "socket.io";
import { chatType } from "../../event-listeners";

interface Data {
  group_id: string;
  group_name: string;
  inviter_name: string;
  was_responded: boolean;
}

export function groupInvitationRequest_emitter(
  socket: Socket,
  invitee_id: string,
  { group_id, group_name, inviter_name, was_responded }: Data
) {
  console.log("groupInvitationRequest_emitter ----------------------");

  socket
    .to(`${chatType.private}_${invitee_id}`)
    .emit("group-invitation-request", {
      group_id,
      group_name,
      inviter_name,
      was_responded,
    });
}
