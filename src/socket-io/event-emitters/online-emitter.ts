import { Socket } from "socket.io";

export default function online_emitter(socket: Socket, currentUserId: string) {
  const rooms_id = socket.currentUser.friendsOnlineStatus.rooms_id;
  // emit message to multiple rooms (the private room of each friends)

  console.log(
    `online_emitter let user ${rooms_id} know ${currentUserId} is online`
  );
  socket.to(rooms_id).emit("online", currentUserId);
}
