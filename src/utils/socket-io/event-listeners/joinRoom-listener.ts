import { Socket } from "socket.io";

export default function joinRoom_listener(
  socket: Socket,
  id: number | undefined
) {
  socket.on("joinRoom", (user_id) => {
    console.log(
      `socket ${socket.id} has joined ${user_id}, using worker ${id}`
    );
    socket.join(`room_${user_id}`);
  });
}
