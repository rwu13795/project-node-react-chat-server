import { Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { get_friends_id } from "../../utils/db-queries";

import { FriendsOnlineStatus } from "../socket-io-connection";
import { chatType } from "./messageToServer-listener";

export default function online_listener(socket: Socket) {
  socket.on("online", async () => {
    const query = socket.handshake.query;
    // currentUser: { user_id: string, username: string }
    const user_id = query.user_id as string;

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

      //// pending ////
      // do I need to track the online status in the server ?
      friendsOnlineStatus.status[friend.friend_id] = false;
    }

    socket.currentUser = {
      user_id,
      friendsOnlineStatus,
    };

    // let all the friends of this user know that this user is online
    const rooms_id = socket.currentUser.friendsOnlineStatus.rooms_id;
    console.log(
      `online_emitter let user ${rooms_id} know ${user_id} is online`
    );
    // emit message to multiple rooms (the private room of each friends)
    socket.to(rooms_id).emit("online", user_id);
  });
}
