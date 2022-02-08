import { Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { get_friends_id } from "../../utils/db-queries";
import online_emitter from "../event-emitters/online-emitter";

import { FriendsOnlineStatus } from "../socket-io-connection";
import { chatType } from "./messageToServer-listener";

export default function online_listener(socket: Socket) {
  socket.on("online", async () => {
    const currentUser = socket.handshake.query;
    // currentUser: { user_id: string, username: string }
    const user_id = currentUser.user_id as string;

    // set current user info inside the socket when the user has signed in.
    const friends = await db_pool.query(get_friends_id(user_id));

    // map the friends id into a normalized object
    let friendsOnlineStatus: FriendsOnlineStatus = {
      friends_id: [],
      rooms_id: [],
      status: {},
    };
    for (let friend of friends.rows) {
      friendsOnlineStatus.friends_id.push(friend.friend_id);
      friendsOnlineStatus.rooms_id.push(
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
