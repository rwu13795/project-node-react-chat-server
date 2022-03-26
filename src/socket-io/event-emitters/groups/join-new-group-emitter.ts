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

interface NewGroupNotification {
  group_id: string;
  count: number;
  last_added_at: string;
}

export function joinNewGroup_emitter(
  io: Server,
  target_id: string,
  data: {
    note: NewGroupNotification;
    newGroupsList: Group[];
    newGroupId: string;
  }
) {
  io.to(`${chatType.private}_${target_id}`).emit("join-new-group", data);
}
