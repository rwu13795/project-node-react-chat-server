import { Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { chatType } from "..";
import {
  clear_group_notification_count,
  clear_private_notification_count,
  get_friends_id,
} from "../../../utils/database/queries/__index";
import { offline_emitter } from "../../event-emitters";

// socket-io can detect when socket is disconnected
// the "disconnect" is a build-in listener key word for detecting disconnection
export function offline_listener(socket: Socket) {
  socket.on("disconnect", async () => {
    if (!socket.currentUser) return;

    const { user_id, currentTargetRoom } = socket.currentUser;

    const friends = await db_pool.query(get_friends_id(user_id));

    const friends_room_id = friends.rows.map((elem) => {
      return `${chatType.private}_${elem.friend_id}`;
    });

    // let all the friends know that this user is now offline
    if (friends_room_id.length > 0) {
      console.log(
        `let the friend ${friends_room_id} this user${user_id} is offline`
      );
      // only emit if the user has at least one friend, otherwise
      // the socket will emit to every one globally if the array is emtpy
      offline_emitter(socket, friends_room_id, { sender_id: user_id });
    }

    // clear the notification in the room where the user was in when disconnected
    const [type, target_id] = currentTargetRoom.split("_");
    if (type === chatType.private && currentTargetRoom !== "") {
      await db_pool.query(clear_private_notification_count(target_id, user_id));
    } else {
      await db_pool.query(clear_group_notification_count(target_id, user_id));
    }

    socket.disconnect(true);
  });
}
