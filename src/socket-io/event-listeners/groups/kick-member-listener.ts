import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType } from "..";
import {
  group_member_left,
  insert_new_group_msg,
  remove_group_notifications,
} from "../../../utils/queries";

interface Props {
  group_id: string;
  member_user_id: string;
  member_username: string;
}

export function kickMember_listener(socket: Socket, io: Server) {
  socket.on(
    "kick-member",
    async ({ group_id, member_user_id, member_username }: Props) => {
      const { user_id, username } = socket.currentUser;
      console.log(
        `user ${member_user_id} ${member_username} was kicked by group admin`
      );

      let msg_body = `Member ${member_username} was politely kicked out of the 
                    group by the administrator ${username}!`;
      await Promise.all([
        db_pool.query(group_member_left(group_id, member_user_id, true)),
        db_pool.query(
          insert_new_group_msg(group_id, user_id, msg_body, "admin")
        ),
        db_pool.query(remove_group_notifications(group_id, user_id)),
      ]);

      // emit the leave-group message to the group, let the members
      // who are online know that a member was kicked out of the group
      // and update the members list in client
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

      io.to(`${chatType.group}_${group_id}`).emit("group-admin-notification", {
        messageObject: messageObject_res,
        room_type: chatType.group,
        group_id,
      });

      // let the client-socket of the kicked user leave the room of this group
      io.to(`${chatType.private}_${member_user_id}`).emit(
        "kicked-out-of-group",
        { group_id }
      );
    }
  );
}
