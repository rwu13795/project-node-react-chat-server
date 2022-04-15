import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import {
  check_group_member,
  insert_group_invitation,
} from "../../../utils/database/queries/__index";
import {
  check_groupInvitation_emitter,
  groupInvitationRequest_emitter,
} from "../../event-emitters";

interface Data {
  friend_id: string;
  group_id: string;
  group_name: string;
  admin_user_id: string;
}

export function groupInvitationReqest_listener(socket: Socket, io: Server) {
  socket.on(
    "group-invitation-request",
    async ({ friend_id, group_id, group_name, admin_user_id }: Data) => {
      const inviter_id = socket.currentUser.user_id;

      // check if the friend is already in the group
      const result = await db_pool.query(
        check_group_member(friend_id, group_id)
      );
      if (result.rowCount > 0) {
        const { was_kicked, user_left } = result.rows[0];

        if (
          user_left &&
          was_kicked &&
          parseInt(admin_user_id) !== parseInt(inviter_id)
        ) {
          let message = `This user was kicked from the group, only the group administrator
                    could invite this user back to the group.`;
          check_groupInvitation_emitter(io, inviter_id, { message });
          return;
        }
        if (!user_left && !was_kicked) {
          let message = "Your friend is already in this group.";
          check_groupInvitation_emitter(io, inviter_id, { message });
          return;

          // if the (user_left && !was_kicked)
          // the user who left the group on his/her own can be invited back by anyone
          // as a "new" member following the logic below
        }
      }

      // add or update the invitation
      try {
        await db_pool.query(
          insert_group_invitation(group_id, inviter_id, friend_id)
        );
      } catch (err) {
        let message =
          "You or another group member have already sent an invitaion to this friend before.";
        check_groupInvitation_emitter(io, inviter_id, { message });
        return;
      }

      groupInvitationRequest_emitter(socket, friend_id, {
        group_id,
        group_name,
        inviter_id,
        was_responded: false,
      });
      // tell the sender about the result. Since the current socket is the sender's
      // socket, and socket CANNOT receive message which is sent by the same
      // socket to the room where this socket is in. I have to use the io to emit
      // the message just like the "group chat"
      let message = "Invitation sent!";
      check_groupInvitation_emitter(io, inviter_id, { message });
    }
  );
}
