import { Socket } from "socket.io";

export default function joinRoom_listener(
  socket: Socket,
  id: number | undefined
) {
  socket.on("joinRoom", (roomName) => {
    console.log(
      `socket ${socket.id} has joined ${roomName}, using worker ${id}`
    );
    socket.join(roomName);
  });
}
