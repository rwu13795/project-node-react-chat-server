import { Server, Socket } from "socket.io";
import { db_pool } from "../../../utils/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { delete_group_invitation } from "../../../utils/queries/group-invitation";
import { insert_new_group_msg } from "../../../utils/queries/group-messages";
import {
  get_groups_list,
  insert_new_group_member,
} from "../../../utils/queries/groups";
import { insert_group_notifications } from "../../../utils/queries/notifications-group-chat";
import { chatType } from "../user/message-to-server-listener";

interface Props {
  group_id: string;
  accept: boolean;
}

export function groupInvitationResponse_listener(socket: Socket, io: Server) {
  socket.on(
    "group-invitation-response",
    async ({ group_id, accept }: Props) => {
      const invitee_id = socket.currentUser.user_id;

      await db_pool.query(delete_group_invitation(group_id, invitee_id));

      if (accept) {
        let msg_body = `New member ${socket.currentUser.username} has joined the group!`;
        await Promise.all([
          db_pool.query(insert_new_group_member(group_id, invitee_id)),
          db_pool.query(insert_group_notifications(group_id, invitee_id)),
          db_pool.query(
            insert_new_group_msg(group_id, invitee_id, msg_body, "admin")
          ),
        ]);

        console.log(`user  @${invitee_id} ACCEPTED to join group ${group_id}`);

        socket.join(`${chatType.group}_${group_id}`);
        // after the user joined the new group
        // get the update groupsList, and send it back to the client socket
        // "check-group-invitation" listener, to let the client update the groupsList
        const result = await db_pool.query(get_groups_list(invitee_id));
        io.to(`${chatType.private}_${invitee_id}`).emit(
          "check-group-invitation",
          {
            message: "User joined group",
            newGroupsList: result.rows,
            newGroupId: group_id,
          }
        );

        // emit the new-member-joined message to the group, let the members
        // who are online know that there is new member immediately
        // and update the members list in client
        let messageObject_res: MessageObject_res = {
          sender_id: invitee_id,
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
        // also let all the group members who are online in this group to
        // update their membersList
        socket
          .to(`${chatType.group}_${group_id}`)
          .emit("group-admin-notification", {
            messageObject: messageObject_res,
            group_id,
            room_type: chatType.group,
          });
      }
    }
  );
}
