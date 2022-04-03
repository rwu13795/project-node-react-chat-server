import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType } from "..";
import {
  disband_group,
  get_next_admin,
  group_member_left,
  insert_new_group_msg,
  remove_group_notifications,
  update_group_admin,
  user_left_group_notifications,
} from "../../../utils/database/queries/__index";
import { groupAdminNotification_emitter } from "../../event-emitters";
import { msgType } from "../../../utils/enums/message-type";

interface Data {
  group_id: string;
  user_id: string;
  admin_user_id: string;
}

export function leaveGroup_listener(socket: Socket, io: Server) {
  socket.on(
    "leave-group",
    async ({ group_id, user_id, admin_user_id }: Data) => {
      console.log(`user ${user_id} has left ${group_id}`);

      socket.leave(`${chatType.group}_${group_id}`);

      // mark the user as left and remove the associated notification
      await Promise.all([
        db_pool.query(group_member_left(group_id, user_id, false)),

        // db_pool.query(remove_group_notifications(group_id, user_id)),
      ]);

      let msg_body = `Member ${socket.currentUser.username} has left the group...`;
      let newAdmin = undefined;
      if (admin_user_id === user_id) {
        // if the user who left is the admin, promote the user who has been
        // in the group for the longest to be the next Admin
        const result = await db_pool.query(get_next_admin(group_id));

        console.log("next admin result", result.rows);
        console.log("Admin left -------->", admin_user_id === user_id);

        if (result.rowCount < 1) {
          // if all the members have left the group, mark this group as
          // disbanded and delete it after 1 month
          const result_disband = await db_pool.query(disband_group(group_id));
          msg_body = `This group has been disbanded on ${result_disband.rows[0].disbanded_at}`;

          console.log("group disbanded ----------------------");
        } else {
          // since the admin is always the oldest member, the next oldest member
          // should become the next admin. The query selects only the oldest memeber
          // who has not left, this user will be the new admin
          const { user_id, username } = result.rows[0];
          newAdmin = user_id;

          console.log("next - Admin", newAdmin);
          await db_pool.query(update_group_admin(group_id, user_id));
          msg_body = `Administrator ${socket.currentUser.username} has left the group. User ${username} now is the new administrator.`;
        }
      }

      // add the "user left" message in the chat board
      // set user_left as true in notification table, new notifications won't
      // update the counts for user who has left
      await Promise.all([
        db_pool.query(user_left_group_notifications(group_id, user_id)),
        db_pool.query(group_member_left(group_id, user_id, false)),
        db_pool.query(
          insert_new_group_msg(group_id, user_id, msg_body, msgType.admin)
        ),
        // db_pool.query(remove_group_notifications(group_id, user_id)),
      ]);

      // emit the leave-group message to the group, let the members
      // who are online know that a member has left
      // and let the client fetch a new memeber list from server
      let messageObject_res: MessageObject_res = {
        sender_id: user_id,
        sender_name: socket.currentUser.username,
        recipient_id: group_id,
        recipient_name: "",
        msg_body,
        msg_type: msgType.admin,
        created_at: new Date().toDateString(),
        file_type: "none",
        file_name: "none",
        file_url: "none",
      };

      console.log("newAdmin", newAdmin);

      groupAdminNotification_emitter(io, {
        messageObject: messageObject_res,
        room_type: chatType.group,
        group_id,
        newAdmin,
      });
    }
  );
}
