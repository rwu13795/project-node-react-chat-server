import { Server, Socket } from "socket.io";

import { chatType } from "..";
import { db_pool } from "../../../utils/db-connection";
import {
  check_add_friend_request,
  insert_add_friend_request,
  update_add_friend_request,
} from "../../../utils/queries/__index";

interface Props {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  message: string;
  target_id: string;
}

export function addFriendRequest_listener(socket: Socket, io: Server) {
  socket.on(
    "add-friend-request",
    async ({
      sender_id,
      sender_username,
      sender_email,
      message,
      target_id,
    }: Props) => {
      console.log(
        `user ${sender_username} id-${sender_id} sends a request to ${target_id}`
      );

      const checkResult = await db_pool.query(
        check_add_friend_request(target_id, sender_id)
      );

      // No existed request, send a new request
      if (checkResult.rowCount < 1) {
        await db_pool.query(
          insert_add_friend_request(target_id, sender_id, message)
        );
        // send request to target private room, if the target user is online
        // he can respond to the request immediately. Otherwise, this request
        // will be loaded from the DB the next time the target user signs in.
        socket
          .to(`${chatType.private}_${target_id}`)
          .emit("add-friend-request", {
            sender_id,
            sender_username,
            sender_email,
            message,
          });
        // tell the sender about the result. Since the current socket is the sender's
        // socket, and socket CANNOT receive message which is sent by the same
        // socket to the room where this socket is in. I have to use the io to emit
        // the message just like the "group chat"
        io.to(`${chatType.private}_${sender_id}`).emit(
          "check-add-friend-request",
          "The request has been sent!"
        );
      }
      // Current user has sent a request to the same target before
      else {
        const { rejected, rejected_at } = checkResult.rows[0];

        if (rejected === false) {
          io.to(`${chatType.private}_${sender_id}`).emit(
            "check-add-friend-request",
            "You have already sent a request to this user before, please wait for the response."
          );
          return;
        }

        // only allow current user to send a new request to the same target one week
        // after the rejected_at time  (604800000 ms = one week)
        const oneWeekAfter =
          Date.now() - 604800000 > new Date(rejected_at).getTime();
        if (!oneWeekAfter) {
          io.to(`${chatType.private}_${sender_id}`).emit(
            "check-add-friend-request",
            `Your previous request was rejected on ${new Date(
              rejected_at
            ).toDateString()}.
                You may only send a new request to the same user one week 
                after you were rejected.`
          );
        } else {
          // update the existed rejected request
          await db_pool.query(
            update_add_friend_request(target_id, sender_id, message)
          );
          socket
            .to(`${chatType.private}_${target_id}`)
            .emit("add-friend-request", {
              sender_id,
              sender_username,
              sender_email,
              message,
            });
          io.to(`${chatType.private}_${sender_id}`).emit(
            "check-add-friend-request",
            "The request has been sent!"
          );
        }
      }
    }
  );
}
