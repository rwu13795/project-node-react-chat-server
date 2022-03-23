import { Socket } from "socket.io";
import { onlineEcho_emitter } from "../../event-emitters";

interface Data {
  status: string;
}

export function changeOnlineStatus_listener(socket: Socket) {
  socket.on("online-status-change", ({ status }: Data) => {
    const { user_id, friends_room_id } = socket.currentUser;

    console.log(`user ${user_id} changed online status to ${status}`);
    // save the new status in the socket, so that the "online-echo" can emit
    // the latest status to the friend who just logged in
    socket.currentUser.onlineStatus = status;

    // let all the friends know that the current user change the status
    onlineEcho_emitter(socket, friends_room_id, { sender_id: user_id, status });
  });
}
