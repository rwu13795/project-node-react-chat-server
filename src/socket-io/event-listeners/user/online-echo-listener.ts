import { Socket } from "socket.io";

import { chatType } from "..";

interface Props {
  friend_id: string;
}

export function onlineEcho_listener(socket: Socket) {
  socket.on("online-echo", ({ friend_id }: Props) => {
    const { user_id, onlineStatus } = socket.currentUser;

    // let the friend who just logged in know that this socket is also online
    console.log(
      `let the friend ${friend_id} who is just logged in know that this socket ${user_id} is also online`
    );
    socket.to(`${chatType.private}_${friend_id}`).emit("online-echo", {
      friend_id: user_id,
      status: onlineStatus,
    });
  });
}
