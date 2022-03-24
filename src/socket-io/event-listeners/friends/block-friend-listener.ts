import { Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import {
  being_blocked_unblocked,
  block_unblock_friend,
} from "../../../utils/queries/__index";
import { blockFriend_emitter } from "../../event-emitters";

interface Data {
  friend_id: string;
  block: boolean;
}

export function blockFriend_listener(socket: Socket) {
  socket.on("block-friend", async ({ friend_id, block }: Data) => {
    console.log("block-friend", friend_id, block);

    const currentUserId = socket.currentUser.user_id;

    // let the client of the user who is being blocked/un-blocked know that he/she
    // is blocked/un-blocked by one of the friends. let the client update the UI
    blockFriend_emitter(socket, friend_id, {
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
