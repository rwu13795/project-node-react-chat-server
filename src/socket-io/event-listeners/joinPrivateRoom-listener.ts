import { Socket } from "socket.io";

export default function joinPrivateRoom_listener(
  socket: Socket,
  id: number | undefined
) {
  socket.on("join-private-room", (room_id: string) => {
    console.log(
      `socket ${socket.id} has joined ${room_id}, using worker ${id}`
    );
    // the current user will join his/her private room after signing in
    // all private messages to this user will be sent to this private room directly.
    socket.join(room_id);
  });
}
