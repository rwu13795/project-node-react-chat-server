import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import {
  check_add_friend_request,
  insert_add_friend_request,
  update_add_friend_request,
} from "../../../utils/database/queries/__index";
import {
  addFriendRequest_emitter,
  check_addFriendRequest_emitter,
} from "../../event-emitters";

interface Data {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  sender_avatar: string;
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
      sender_avatar,
      message,
      target_id,
    }: Data) => {
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
        addFriendRequest_emitter(socket, target_id, {
          sender_id,
          sender_username,
          sender_email,
          sender_avatar,
          message,
        });

        // tell the sender about the result. Since the current socket is the sender's
        // socket, and socket CANNOT receive message which is sent by the same
        // socket to the room where this socket is in. I have to use the io to emit
        // the message just like the "group chat"
        check_addFriendRequest_emitter(io, sender_id, {
          message: "Request sent!",
        });
      }
      // Current user has sent a request to the same target before
      else {
        const { rejected, rejected_at } = checkResult.rows[0];

        if (rejected === false) {
          check_addFriendRequest_emitter(io, sender_id, {
            message:
              "You have already sent a request to this user before, please wait for the response.",
          });
          return;
        }

        // only allow current user to send a new request to the same target one week
        // after the rejected_at time  (604800000 ms = one week)
        const oneWeekAfter =
          Date.now() - 604800000 > new Date(rejected_at).getTime();
        if (!oneWeekAfter) {
          check_addFriendRequest_emitter(io, sender_id, {
            message: `Your previous request was rejected on ${new Date(
              rejected_at
            ).toDateString()}.
                You may only send a new request to the same user one week 
                after you were rejected.`,
          });
        } else {
          // update the existed rejected request
          await db_pool.query(
            update_add_friend_request(target_id, sender_id, message)
          );

          addFriendRequest_emitter(socket, target_id, {
            sender_id,
            sender_username,
            sender_email,
            sender_avatar,
            message,
          });

          check_addFriendRequest_emitter(io, sender_id, {
            message: "The request has been sent!",
          });
        }
      }
    }
  );
}
