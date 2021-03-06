import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType } from "..";
import {
  group_member_left,
  insert_new_group_msg,
  user_left_group_notifications,
} from "../../../utils/database/queries/__index";
import {
  groupAdminNotification_emitter,
  kickedOutOfGroup_emitter,
} from "../../event-emitters";
import { msgType } from "../../../utils/enums/message-type";

interface Data {
  group_id: string;
  member_user_id: string;
  member_username: string;
}

export function kickMember_listener(socket: Socket, io: Server) {
  socket.on(
    "kick-member",
    async ({ group_id, member_user_id, member_username }: Data) => {
      const { user_id, username } = socket.currentUser;

      let msg_body = `Member "${member_username}" was politely kicked out of the 
                    group by the administrator "${username}"!`;
      await Promise.all([
        db_pool.query(user_left_group_notifications(group_id, user_id)),
        db_pool.query(group_member_left(group_id, member_user_id, true)),
        db_pool.query(
          insert_new_group_msg(group_id, user_id, msg_body, msgType.admin)
        ),
      ]);

      // emit the leave-group message to the group, let the members
      // who are online know that a member was kicked out of the group
      // and let the client fetch a new memeber list from server
      let messageObject_res: MessageObject_res = {
        sender_id: user_id,
        sender_name: socket.currentUser.username,
        recipient_id: group_id,
        recipient_name: "",
        msg_body,
        msg_type: "admin",
        created_at: new Date().toString(),
        file_type: "none",
        file_name: "none",
        file_url: "none",
      };

      groupAdminNotification_emitter(io, {
        messageObject: messageObject_res,
        room_type: chatType.group,
        group_id,
      });

      // force the client-socket of the kicked user leave the room of this group
      kickedOutOfGroup_emitter(io, member_user_id, { group_id });
    }
  );
}
