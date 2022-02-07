import { Socket } from "socket.io";

export default function joinRoom_listener(
  socket: Socket,
  id: number | undefined
) {
  socket.on("joinRoom", (room_id) => {
    console.log(
      `socket ${socket.id} has joined ${room_id}, using worker ${id}`
    );
    socket.join(room_id);
  });
}
