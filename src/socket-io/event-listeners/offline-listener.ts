import { Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { get_friends_id } from "../../utils/db-queries";
import offline_emitter from "../event-emitters/offline-emitter";

import { chatType } from "./messageToServer-listener";

export default function offline_listener(socket: Socket) {
  socket.on("disconnect", async () => {
    // socket.currentUser will no longer be available when the socket is
    // disconnected. But the query in the "handshake" still exist.
    // I can use the user_id to find all this user's friends in DB again
    // and let those friends know this user is offline now
    const currentUser = socket.handshake.query;
    // currentUser: { user_id: string, username: string }
    const user_id = currentUser.user_id as string;

    const friends = await db_pool.query(get_friends_id(user_id));

    const rooms_id = friends.rows.map((elem) => {
      return `${chatType.private}_${elem.friend_id}`;
    });

    offline_emitter(socket, rooms_id, user_id);
  });
}
