import { Socket } from "socket.io";

export default function online_emitter(socket: Socket, currentUserId: string) {
  const room_id = socket.currentUser.friendsOnlineStatus.room_id;
  // emit message to multiple rooms (the private room of each friends)

  console.log(
    `online_emitter let user ${room_id} know ${currentUserId} is online`
  );
  socket.to(room_id).emit("online", currentUserId);
}
