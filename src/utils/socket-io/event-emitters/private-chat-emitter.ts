import { Socket, Server } from "socket.io";
import { db_pool } from "../../db-connection";
import { MessageObject } from "../event-listeners/messageToServer-listener";

export default async function privateChat_emitter(
  messageObject: MessageObject,
  io: Server
) {
  const { sender_id, recipient_id, targetChatRoom_type, body, created_at } =
    messageObject;

  // each user connects to a private room where only the user is inside.
  // the server will emit all direct messages which are for this user
  // to the private room. So as long as the user is connected, he can listen
  // to all direct messages sent to him.
  io.to(`${targetChatRoom_type}_${recipient_id}`).emit(
    "messageToClients",
    messageObject
  );

  //   save the chat message to DB
  try {
    const new_msg = {
      name: "new_msg",
      text: "INSERT INTO private_messages(body) VALUES($1) RETURNING msg_id",
      values: [body],
    };
    const msg_id_result = await db_pool.query(new_msg);

    const { msg_id } = msg_id_result.rows[0];
    const new_msg_users = {
      name: "new_msg_users",
      text: `INSERT INTO users_private_messages(sender_id, recipient_id, msg_id)
                  VALUES($1, $2, $3)`,
      values: [sender_id, recipient_id, msg_id],
    };
    await db_pool.query(new_msg_users);

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log(
    "sending message to room",
    `${targetChatRoom_type}_${recipient_id}`
  );
}
