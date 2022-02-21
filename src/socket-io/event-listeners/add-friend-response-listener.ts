import { Server, Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import {
  check_add_friend_request,
  insert_add_friend_request,
  update_add_friend_request,
} from "../../utils/queries/add-friend-request";
import { insert_friends_pair } from "../../utils/queries/friends-pair";
import {
  insert_private_notifications,
  update_private_notification_count,
} from "../../utils/queries/notifications-private-chat";
import {
  insert_new_msg,
  insert_new_msg_users_ref,
} from "../../utils/queries/private-messages";

import { chatType } from "./messageToServer-listener";

interface Props {
  sender_id: string;
  sender_username: string;
  target_id: string;
  target_username: string;
  accept: boolean;
}

export default function addFriendResponse_listener(socket: Socket) {
  socket.on(
    "add-friend-response",
    async ({
      sender_id,
      sender_username,
      target_id,
      target_username,
      accept,
    }: Props) => {
      // mark the add_friend_request as responded
      await db_pool.query(update_add_friend_request(target_id, sender_id));

      if (!accept) {
        // don't let the sender know if he is rejected. the sender could not send another
        // request until the add_friend_request is deleted
        console.log(
          `user ${target_username} id-${target_id} rejects sender ${sender_id}`
        );
      } else {
        console.log(
          `user ${target_username} id-${target_id} ACCEPTs sender ${sender_id}`
        );

        // add friend_pair, add message to private_chat and notifiction,
        // to let the requested know that the request was accepted.
        const body = `Notification: ${target_username} has accepted the befriend request from ${sender_username}! 
        We can start chatting now!`;

        const [msg_id_result] = await Promise.all([
          db_pool.query(insert_new_msg(body, "admin")),
          db_pool.query(insert_friends_pair(target_id, sender_id)),
        ]);

        const msg_id = msg_id_result.rows[0].msg_id as string;

        await Promise.all([
          db_pool.query(insert_new_msg_users_ref(target_id, sender_id, msg_id)),
          db_pool.query(insert_private_notifications(sender_id, target_id)),
        ]);

        socket
          .to(`${chatType.private}_${sender_id}`)
          .emit("add-friend-response", target_username);
      }
    }
  );
}
