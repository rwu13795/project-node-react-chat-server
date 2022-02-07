import { Socket, Server } from "socket.io";
import { db_pool } from "../../db-connection";

export default function groupChat_emitter(
  socket: Socket,
  io: Server,
  id: number | undefined
) {
  socket.on(
    "messageToServer",
    async ({ sender_id, recipient_id, body, created_at }) => {
      console.log(`server received msg from socket ${socket.id} ----> ${body}`);
      console.log("sending message to room", sender_id);

      ///////// testing database insertion
      try {
        const text = "INSERT INTO testing(name) VALUES($1)";
        const values = [body];
        await db_pool.query(text, values);
        console.log("insert into db");
      } catch (err) {
        console.log(err);
      }

      // save the chat message to DB here //

      // each user connects to a private room where only the user is inside
      // the server will emit all direct messages which are for this user
      // to the private room. So as long as the user is connected, he can listen
      // to all direct messages sent to him.
      io.to(`room_${recipient_id}`).emit(
        // room name cannot be number characters only?
        "messageToClients",
        { sender_id, recipient_id, body, created_at }
      );
    }
  );
}
