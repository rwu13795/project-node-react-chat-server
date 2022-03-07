import { Server, Socket } from "socket.io";
import { db_pool } from "../../../utils/db-connection";
import { update_add_friend_request } from "../../../utils/queries/add-friend-request";
import {
  being_blocked_unblocked,
  block_unblock_friend,
  insert_friends_pair,
} from "../../../utils/queries/friends-pair";
import { insert_private_notifications } from "../../../utils/queries/notifications-private-chat";
import {
  insert_new_msg,
  insert_new_msg_users_ref,
} from "../../../utils/queries/private-messages";
import { chatType } from "../user/message-to-server-listener";

interface Props {
  friend_id: string;
  block: boolean;
}

export function blockFriend_listener(socket: Socket) {
  socket.on("block-friend", async ({ friend_id, block }: Props) => {
    console.log("block-friend", friend_id, block);

    const currentUserId = socket.currentUser.user_id;

    // let the client of the user who is being blocked/un-blocked know that this user
    // is blocked/un-blocked by one of the friends. let the client update the UI
    socket.to(`${chatType.private}_${friend_id}`).emit("block-friend", {
      blocked_by: currentUserId,
      block,
    });

    // update the friends_pair rows
    await Promise.all([
      db_pool.query(block_unblock_friend(currentUserId, friend_id, block)),
      db_pool.query(being_blocked_unblocked(currentUserId, friend_id, block)),
    ]);
  });
}
