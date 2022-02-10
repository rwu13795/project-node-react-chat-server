import { Socket } from "socket.io";

export default function currentTargetRoom_listener(socket: Socket) {
  // set the target room in the socket, so that I could use the room_id
  // to clear the notifications of that room if the user was in that room when
  // disconnected.
  socket.on("current-target-room", (room_id: string) => {
    console.log(`socket ${socket.id} entered room ${room_id}`);

    socket.currentUser.currentTargetRoom = room_id;
  });
}
