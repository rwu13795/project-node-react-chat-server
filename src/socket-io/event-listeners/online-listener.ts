import { Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import online_emitter from "../event-emitters/online-emitter";

import { FriendsOnlineStatus } from "../socket-io-connection";
import { chatType } from "./messageToServer-listener";

export default function online_listener(socket: Socket) {
  socket.on("online", async () => {
    const currentUser = socket.handshake.query;
    // currentUser: { user_id: string, username: string }
    const user_id = currentUser.user_id as string;

    // set current user info inside the socket when the user has signed in.
    const get_friends_id = {
      name: "get_friends_id",
      text: `SELECT users.user_id as "friend_id", users.username as "friend_username", users.email as "friend_email" FROM users 
             INNER JOIN friends_pair
                ON friends_pair.friend_id = $1
                    AND friends_pair.user_id = users.user_id`,
      values: [user_id],
    };
    const friends = await db_pool.query(get_friends_id);

    // map the friends id into a normalized object
    let friendsOnlineStatus: FriendsOnlineStatus = {
      friends_id: [],
      room_id: [],
      status: {},
    };
    for (let friend of friends.rows) {
      friendsOnlineStatus.friends_id.push(friend.friend_id);
      friendsOnlineStatus.room_id.push(
        `${chatType.private}_${friend.friend_id}`
      );
      friendsOnlineStatus.status[friend.friend_id] = false;
    }

    socket.currentUser = {
      user_id: currentUser.user_id as string,
      username: currentUser.username as string,
      friendsOnlineStatus,
    };

    // let all the friends of this user know that this user is online
    online_emitter(socket, user_id);
  });
}
