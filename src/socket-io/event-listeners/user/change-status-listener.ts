import { Socket } from "socket.io";

interface Props {
  status: string;
}

export function changeOnlineStatus_listener(socket: Socket) {
  socket.on("online-status-change", ({ status }: Props) => {
    const { user_id, friends_room_id } = socket.currentUser;

    console.log(`user ${user_id} changed online status to ${status}`);
    // save the new status in the socket, so that the "online-echo" can emit
    // the latest status to the friend who just logged in
    socket.currentUser.onlineStatus = status;

    // let all the friends know that the current user change the status
    socket.to(friends_room_id).emit("online-echo", {
      friend_id: user_id,
      status,
    });
  });
}
