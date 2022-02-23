import { Socket } from "socket.io";
import { db_pool } from "../../../utils/db-connection";
import { get_friends_id } from "../../../utils/queries/friends-pair";

import { chatType } from "./messageToServer-listener";

export default function online_listener(socket: Socket) {
  socket.on("online", async (target_id?: string) => {
    const query = socket.handshake.query;
    const user_id = query.user_id as string;
    const username = query.username as string;

    // used when user accepted an add-friend request. Let the new friend know
    // that the user is online
    if (target_id) {
      console.log("target_id", target_id);
      socket.to(`${chatType.private}_${target_id}`).emit("online", user_id);
    }

    // if no target_id, that means user just signed in and wants to let all
    // the friends know he is online.
    else {
      const friends = await db_pool.query(get_friends_id(user_id));
      // map the friends id into a the socket custom object
      const friends_id: string[] = [];
      const rooms_id: string[] = [];
      for (let friend of friends.rows) {
        friends_id.push(friend.friend_id);
        rooms_id.push(`${chatType.private}_${friend.friend_id}`);
      }
      socket.currentUser = {
        user_id,
        username,
        friends_id,
        rooms_id,
        currentTargetRoom: "",
      };

      // let all the friends of this user know that this user is online
      console.log(
        `online_emitter let user ${rooms_id} know ${user_id} is online`
      );
      // emit message to multiple rooms (the private room of each friends)
      if (rooms_id.length > 0) {
        // only emit if the user has at least one friend, otherwise
        // the socket will emit to every one globally if the array is emtpy
        socket.to(rooms_id).emit("online", user_id);
      }
    }
  });
}
