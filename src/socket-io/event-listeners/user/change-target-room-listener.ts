import { Socket } from "socket.io";

interface Data {
  room_id: string;
}

export function changeTargetRoom_listener(socket: Socket) {
  // set the target room in the socket, so that I could use the room_id
  // to clear the notifications of that room if the user was in that room when
  // he disconnected.
  socket.on("current-target-room", ({ room_id }: Data) => {
    console.log(
      `socket ${socket.currentUser.username}  setting target room ${room_id}`
    );

    socket.currentUser.currentTargetRoom = room_id;
  });
}
