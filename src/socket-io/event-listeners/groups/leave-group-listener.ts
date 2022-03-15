import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType } from "..";
import {
  group_member_left,
  insert_new_group_msg,
  remove_group_notifications,
} from "../../../utils/queries/__index";

interface Props {
  group_id: string;
  user_id: string;
}

export function leaveGroup_listener(socket: Socket, io: Server) {
  socket.on("leave-group", async ({ group_id, user_id }: Props) => {
    console.log(`user ${user_id} has left ${group_id}`);

    socket.leave(`${chatType.group}_${group_id}`);

    let msg_body = `Member ${socket.currentUser.username} has left the group...`;
    // add the "left" message before updating the group_member_left,
    // this "left" message can be included in the limited history while
    // using created_at <= "user_left_at" to fetch the messages
    await Promise.all([
      db_pool.query(insert_new_group_msg(group_id, user_id, msg_body, "admin")),
      db_pool.query(group_member_left(group_id, user_id, false)),
      db_pool.query(remove_group_notifications(group_id, user_id)),
    ]);

    // emit the leave-group message to the group, let the members
    // who are online know that a member has left
    // and update the members list in client
    let messageObject_res: MessageObject_res = {
      sender_id: user_id,
      sender_name: socket.currentUser.username,
      recipient_id: group_id,
      recipient_name: "",
      msg_body,
      msg_type: "admin",
      created_at: new Date().toDateString(),
      file_type: "none",
      file_name: "none",
      file_url: "none",
    };
    io.to(`${chatType.group}_${group_id}`).emit("group-admin-notification", {
      messageObject: messageObject_res,
      room_type: chatType.group,
      group_id,
    });
  });
}
