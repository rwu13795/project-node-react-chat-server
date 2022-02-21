import { Server, Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { MessageObject_res } from "../../utils/interfaces/response-interfaces";
import { insert_new_group_msg } from "../../utils/queries/group-messages";
import { delete_group_member } from "../../utils/queries/groups";
import { chatType } from "./messageToServer-listener";

interface Props {
  group_id: string;
  user_id: string;
}

export default function leaveGroup_listener(socket: Socket, io: Server) {
  socket.on("leave-group", async ({ group_id, user_id }: Props) => {
    console.log(`user ${user_id} has left ${group_id}`);

    socket.leave(`${chatType.group}_${group_id}`);

    let msg_body = `Member ${socket.currentUser.username} has left the group...`;
    await Promise.all([
      db_pool.query(delete_group_member(group_id, user_id)),
      db_pool.query(insert_new_group_msg(group_id, user_id, msg_body, "admin")),
    ]);

    // emit the leave-group message to the group, let the members
    // who are online know that a member has left
    // and update the members list in client
    let messageObject_res: MessageObject_res = {
      targetChatRoom_type: chatType.group,
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
      messageObject_res,
      note_type: "left",
      group_id,
      member_user_id: user_id,
    });
  });
}
