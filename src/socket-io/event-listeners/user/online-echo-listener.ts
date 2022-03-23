import { Socket } from "socket.io";

import { chatType } from "..";
import { onlineEcho_emitter } from "../../event-emitters";

interface Data {
  friend_id: string;
}

export function onlineEcho_listener(socket: Socket) {
  socket.on("online-echo", ({ friend_id }: Data) => {
    const { user_id, onlineStatus } = socket.currentUser;

    // let the friend who just logged in know that this socket is also online
    console.log(
      `let the friend ${friend_id} who is just logged in know that this socket ${user_id} is also online`
    );

    const friend_room_id = `${chatType.private}_${friend_id}`;
    onlineEcho_emitter(socket, friend_room_id, {
      sender_id: user_id,
      status: onlineStatus,
    });
  });
}
