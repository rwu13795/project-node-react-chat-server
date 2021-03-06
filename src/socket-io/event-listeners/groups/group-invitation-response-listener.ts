import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType } from "..";
import {
  delete_group_invitation,
  get_groups_list,
  get_group_one_notification,
  insert_group_notifications,
  insert_new_group_member,
  insert_new_group_msg,
} from "../../../utils/database/queries/__index";
import {
  groupAdminNotification_emitter,
  joinNewGroup_emitter,
} from "../../event-emitters";
import { msgType } from "../../../utils/enums/message-type";

interface Data {
  group_id: string;
  accept: boolean;
}

export function groupInvitationResponse_listener(socket: Socket, io: Server) {
  socket.on("group-invitation-response", async ({ group_id, accept }: Data) => {
    const invitee_id = socket.currentUser.user_id;

    const result = await db_pool.query(
      delete_group_invitation(group_id, invitee_id)
    );
    // the returning value after deleting a row is the deleted row
    // if the deleted row is empty, that means the group has been marked as disbanded
    // before this user accept the invitation. So don't let this user join the disbanded
    // group. If the user is online, let him know the group is disbanded
    if (result.rowCount === 0) {
      joinNewGroup_emitter(io, invitee_id, {
        note: {} as any,
        newGroupsList: [] as any,
        newGroupId: group_id,
        failed: true,
      });
      return;
    }

    if (accept) {
      let msg_body = `New member "${socket.currentUser.username}" has joined the group!`;
      await Promise.all([
        db_pool.query(insert_group_notifications(group_id, invitee_id)),
        db_pool.query(insert_new_group_member(group_id, invitee_id)),
        db_pool.query(
          insert_new_group_msg(group_id, invitee_id, msg_body, msgType.admin)
        ),
      ]);

      // after the user joined the new group
      // get the updated groupsList, and send it back to the client socket
      // "check-group-invitation" listener, to let the client update the groupsList
      const [noteResult, listResult] = await Promise.all([
        db_pool.query(get_group_one_notification(group_id, invitee_id)),
        db_pool.query(get_groups_list(invitee_id)),
      ]);

      joinNewGroup_emitter(io, invitee_id, {
        note: noteResult.rows[0],
        newGroupsList: listResult.rows,
        newGroupId: group_id,
      });
      socket.join(`${chatType.group}_${group_id}`);

      // emit the new-member-joined message to the group, let the members
      // who are online know that there is new member immediately
      // and let the client fetch a new memeber list from server
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

      // use socket to emit, because the user who just accepted to
      // join the new group does not need to receive this message
      groupAdminNotification_emitter(socket, {
        messageObject: messageObject_res,
        group_id,
        room_type: chatType.group,
      });
    }
  });
}
