import { Socket, Server } from "socket.io";
import { db_pool } from "../../db-connection";

export default function messageToServer_listener(
  socket: Socket,
  io: Server,
  id: number | undefined
) {
  socket.on("messageToServer", async ({ sendTo, msg }) => {
    console.log(`server received msg from socket ${socket.id} ----> ${msg}`);

    ///////// testing database insertion
    try {
      const text = "INSERT INTO testing(name) VALUES($1)";
      const values = [msg];
      await db_pool.query(text, values);
      console.log("insert into db");
    } catch (err) {
      console.log(err);
    }

    io.to(sendTo).emit(
      "messageToClients",
      `message sent from client socket ${socket.id} using worker ${id}, ${msg}`
    );
  });
}
