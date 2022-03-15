import { Socket } from "socket.io";

import { db_pool } from "../../../utils/db-connection";
import { chatType } from "..";
import {
  clear_group_notification_count,
  clear_private_notification_count,
  get_friends_id,
} from "../../../utils/queries";

export function log_out_listener(socket: Socket) {
  socket.on("log-out", async () => {
    const { user_id, currentTargetRoom } = socket.currentUser;

    const friends = await db_pool.query(get_friends_id(user_id));

    const rooms_id = friends.rows.map((elem) => {
      return `${chatType.private}_${elem.friend_id}`;
    });

    // let all the friends know that this user just logged out
    if (rooms_id.length > 0) {
      console.log(`let the friend ${rooms_id} this user${user_id} logged out`);
      // only emit if the user has at least one friend, otherwise
      // the socket will emit to every one globally if the array is emtpy
      socket.to(rooms_id).emit("offline", user_id);
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
