import { Server, Socket } from "socket.io";
import { db_pool } from "../../../utils/db-connection";
import {
  check_group_member,
  insert_group_invitation,
} from "../../../utils/queries/group-invitation";
import { chatType } from "../user/message-to-server-listener";

interface Props {
  friend_id: string;
  group_id: string;
  group_name: string;
  inviter_name: string;
}

export function groupInvitationReqest_listener(socket: Socket, io: Server) {
  socket.on(
    "group-invitation-request",
    async ({ friend_id, group_id, group_name, inviter_name }: Props) => {
      const inviter_id = socket.currentUser.user_id;
      console.log(
        `user ${inviter_name} @${inviter_id} invites user ${friend_id} to group ${group_id}`
      );

      // check if the friend is already in the group
      const result = await db_pool.query(
        check_group_member(friend_id, group_id)
      );
      if (result.rowCount > 0) {
        const { was_kicked, user_left } = result.rows[0];

        if (user_left && was_kicked) {
          let body = `This user was kicked from the group, you cannot invite this 
                      user for at least a week from the time he/she was kicked.`;
          io.to(`${chatType.private}_${inviter_id}`).emit(
            "check-group-invitation",
            { message: body }
          );
          return;
        }
        if (!user_left && !was_kicked) {
          let body = "Your friend is already in this group!";
          io.to(`${chatType.private}_${inviter_id}`).emit(
            "check-group-invitation",
            { message: body }
          );
          return;
        }
        // if the (user_left && !was_kicked)
        // allow to invite back the user who left on his own
      }

      try {
        await db_pool.query(
          insert_group_invitation(group_id, inviter_id, friend_id)
        );

        console.log("added new invitation");
      } catch (err) {
        io.to(`${chatType.private}_${inviter_id}`).emit(
          "check-group-invitation",
          {
            message:
              "You or the other group members have already sent an invitaion to this friend before!",
          }
        );
        return;
      }

      socket
        .to(`${chatType.private}_${friend_id}`)
        .emit("group-invitation-request", {
          group_id,
          group_name,
          inviter_name,
          was_responded: false,
        });
      // tell the sender about the result. Since the current socket is the sender's
      // socket, and socket CANNOT receive message which is sent by the same
      // socket to the room where this socket is in. I have to use the io to emit
      // the message just like the "group chat"
      io.to(`${chatType.private}_${inviter_id}`).emit(
        "check-group-invitation",
        { message: "The request has been sent!" }
      );
    }
  );
}
