import { Server, Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import {
  check_add_friend_request,
  insert_add_friend_request,
} from "../../utils/queries/add-friend-request";

import { chatType } from "./messageToServer-listener";

interface Props {
  sender_id: string;
  sender_username: string;
  sender_email: string;
  message: string;
  target_id: string;
}

export default function addFriendRequest_listener(socket: Socket, io: Server) {
  socket.on(
    "add-friend-request",
    async ({
      sender_id,
      sender_username,
      sender_email,
      message,
      target_id,
    }: Props) => {
      console.log(
        `user ${sender_username} id-${sender_id} sends a request to ${target_id}`
      );

      try {
        // add a new add_friend_request, if user has already sent a request
        // the DB will throw a duplication error since the id combination must
        // be unique.
        await db_pool.query(
          insert_add_friend_request(target_id, sender_id, message)
        );
      } catch (err) {
        io.to(`${chatType.private}_${sender_id}`).emit(
          "check-add-friend-request",
          "You have already sent a request to this user before!"
        );
        return;
      }

      // send request to target private room, if the target user is online
      // he can respond to the request immediately. Otherwise, this request
      // will be loaded from the DB the next time the target user signs in.
      socket.to(`${chatType.private}_${target_id}`).emit("add-friend-request", {
        sender_id,
        sender_username,
        sender_email,
        message,
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
