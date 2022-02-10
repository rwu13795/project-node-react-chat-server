import { Server, Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import {
  check_add_friend_request,
  insert_add_friend_request,
} from "../../utils/db-queries";

import { chatType } from "./messageToServer-listener";

interface AddFriendRequest {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  target_id: string;
}

export default function addFriendRequest_listener(socket: Socket, io: Server) {
  socket.on(
    "add-friend-request",
    async ({
      sender_id,
      sender_username,
      sender_email,
      target_id,
    }: AddFriendRequest) => {
      console.log(
        `user ${sender_username} id-${sender_id} sends a request to ${target_id}`
      );

      // check if the sender has sent a request before
      const result = await db_pool.query(
        check_add_friend_request(target_id, sender_id)
      );

      console.log("result", result.rowCount);

      if (result.rowCount > 0) {
        io.to(`${chatType.private}_${sender_id}`).emit(
          "check-add-friend-request",
          "You have already sent a request to this user before!"
        );
        return;
      }

      await db_pool.query(insert_add_friend_request(target_id, sender_id));

      // send request to target private room
      socket.to(`${chatType.private}_${target_id}`).emit("add-friend-request", {
        sender_id,
        sender_username,
        sender_email,
      });
      // tell the sender about the result. Since the current socket is the sender's
      // socket, and socket CANNOT receive message which is sent by the same
      // socket to the room where this socket is in. I have to use the io to emit
      // the message just like the "group chat"
      io.to(`${chatType.private}_${sender_id}`).emit(
        "check-add-friend-request",
        "The request has been sent!"
      );
    }
  );
}
