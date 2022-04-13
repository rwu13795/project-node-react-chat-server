import { Server, Socket } from "socket.io";
import { db_pool } from "../../../utils/database/db-connection";
import { update_socket_id } from "../../../utils/database/queries/socket_id";

export async function disconnectSameUser_emitter(io: Server, socket: Socket) {
  // get the prev_socket_id from DB (should use redis)
  // and store the current socket_id
  const sid_result = await db_pool.query(
    update_socket_id(socket.handshake.query.user_id as string, socket.id)
  );
  const prev_socket_id = sid_result.rows[0].prev_socket_id.split("_")[1];

  console.log("prev_socket_id --------------------->", prev_socket_id);

  // emit to the prev_socket socket, if the prev_socket is still connected,
  // it can receive message and force the client disconnect and logout
  // (only clear the store data in the client, do not destroy the session)
  io.to(prev_socket_id).emit("disconnect_same_user");
}
