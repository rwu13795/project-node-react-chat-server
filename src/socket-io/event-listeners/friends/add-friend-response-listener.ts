import { Server, Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import {
  insert_friends_pair,
  insert_new_msg,
  insert_new_msg_users_ref,
  insert_private_notifications,
  reject_add_friend_request,
  delete_add_friend_request,
} from "../../../utils/database/queries/__index";
import { msgType } from "../../../utils/enums/message-type";
import {
  addFriendResponse_emitter,
  newFriendAdded_emitter,
} from "../../event-emitters";

interface Data {
  sender_id: string;
  sender_username: string;
  target_id: string;
  target_username: string;
  accept: boolean;
}

export function addFriendResponse_listener(socket: Socket, io: Server) {
  socket.on(
    "add-friend-response",
    async ({
      sender_id,
      sender_username,
      target_id,
      target_username,
      accept,
    }: Data) => {
      if (!accept) {
        // mark the add_friend_request as rejected. A new request could only be
        // sent after a week
        await db_pool.query(reject_add_friend_request(target_id, sender_id));
        return;
      }

      // add friend_pair, add message to private_chat and notifiction,
      // to let the user who sent the request know that the request was accepted.
      const body = `"${target_username}" has accepted the friend request from "${sender_username}".
        You can start chatting now!`;

      const [msg_id_result] = await Promise.all([
        db_pool.query(insert_new_msg(body, msgType.admin)),
        db_pool.query(insert_friends_pair(target_id, sender_id)),
      ]);

      const msg_id = msg_id_result.rows[0].msg_id as string;

      await Promise.all([
        db_pool.query(insert_new_msg_users_ref(target_id, sender_id, msg_id)),
        db_pool.query(insert_private_notifications(sender_id, target_id)),
        db_pool.query(delete_add_friend_request(target_id, sender_id)),
      ]);

      addFriendResponse_emitter(socket, sender_id, {
        acceptor_name: target_username,
      });

      // let the user who accepted the add-friend-request know that the
      // DB is updated.
      newFriendAdded_emitter(io, target_id);
    }
  );
}
