import { Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { get_friends_id } from "../../../utils/database/queries/__index";
import { chatType } from "..";
import { online_emitter } from "../../event-emitters";

interface Data {
  onlineStatus: string;
}

export function online_listener(socket: Socket) {
  socket.on("online", async ({ onlineStatus }: Data) => {
    const query = socket.handshake.query;
    const user_id = query.user_id as string;
    const username = query.username as string;

    let friends_id: string[] = [];
    let friends_room_id: string[] = [];

    const friends = await db_pool.query(get_friends_id(user_id));
    // map the friends id into a the socket custom object
    for (let friend of friends.rows) {
      friends_id.push(friend.friend_id);
      friends_room_id.push(`${chatType.private}_${friend.friend_id}`);
    }

    // save the current user info in the socket custom property
    socket.currentUser = {
      user_id,
      username,
      friends_id,
      friends_room_id,
      currentTargetRoom: "",
      onlineStatus,
    };

    // let all the friends of this user know that this user is online
    // emit message to multiple rooms (the private room of each friends)
    if (friends_room_id.length > 0) {
      // only emit if the user has at least one friend, otherwise
      // the socket will emit to every one globally if the array is emtpy
      online_emitter(socket, friends_room_id, {
        sender_id: user_id,
        status: onlineStatus,
      });
    }
  });
}
