import { Socket } from "socket.io";

import { db_pool } from "../../../utils/database/db-connection";
import { get_friends_id } from "../../../utils/database/queries/__index";
import { chatType } from "..";
import { online_emitter } from "../../event-emitters";

interface Data {
  onlineStatus: string;
  target_id?: string;
}

export function online_listener(socket: Socket) {
  socket.on("online", async ({ onlineStatus, target_id }: Data) => {
    const query = socket.handshake.query;
    const user_id = query.user_id as string;
    const username = query.username as string;

    // after user accepted an add-friend request, Let the new friend know
    // that the user is online
    if (target_id) {
      console.log(
        "let target_id know",
        target_id,
        "onlineStatus",
        onlineStatus
      );
      let friend_room_id = `${chatType.private}_${target_id}`;
      online_emitter(socket, friend_room_id, {
        sender_id: user_id,
        status: onlineStatus,
      });
    }
    // if no target_id, that means user just signed in and wants to let all
    // the friends know he is online.
    else {
      const friends = await db_pool.query(get_friends_id(user_id));
      // map the friends id into a the socket custom object
      const friends_id: string[] = [];
      const friends_room_id: string[] = [];
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
      console.log(
        `online_emitter let user ${friends_room_id} know ${user_id} is online`
      );
      // emit message to multiple rooms (the private room of each friends)
      if (friends_room_id.length > 0) {
        // only emit if the user has at least one friend, otherwise
        // the socket will emit to every one globally if the array is emtpy
        online_emitter(socket, friends_room_id, {
          sender_id: user_id,
          status: onlineStatus,
        });
      }
    }
  });
}
