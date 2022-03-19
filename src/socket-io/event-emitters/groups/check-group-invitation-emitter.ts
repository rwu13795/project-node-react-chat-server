import { Server } from "socket.io";
import { chatType } from "../../event-listeners";

interface GroupMember {
  user_id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

interface Group {
  group_id: string;
  group_name: string;
  creator_user_id: string;
  user_left: boolean;
  user_left_at: string | null;
  was_kicked: boolean;
  group_members?: GroupMember[];
  wasMembersListLoaded: boolean;
}

interface Body {
  message: string;
  newGroupsList?: Group[];
  newGroupId?: string;
}

export function check_groupInvitation_emitter(
  io: Server,
  send_to_id: string,
  { message, newGroupsList, newGroupId }: Body
) {
  io.to(`${chatType.private}_${send_to_id}`).emit("check-group-invitation", {
    message,
    newGroupsList,
    newGroupId,
  });
}
