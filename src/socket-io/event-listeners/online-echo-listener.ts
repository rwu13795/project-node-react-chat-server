import { Socket } from "socket.io";

import { chatType } from "./messageToServer-listener";

export default function onlineEcho_listener(socket: Socket) {
  socket.on("online-echo", (friend_id: string) => {
    const currentUserId = socket.currentUser.user_id;

    // let the friend who just logged in know that this socket is also online
    console.log(
      `let the friend ${friend_id} who is just logged in know that this socket ${currentUserId} is also online`
    );
    socket
      .to(`${chatType.private}_${friend_id}`)
      .emit("online-echo", currentUserId);
  });
}
