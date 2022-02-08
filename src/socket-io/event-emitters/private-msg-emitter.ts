import { Socket, Server } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { insert_new_msg, new_msg_users_ref } from "../../utils/db-queries";
import { MessageObject } from "../event-listeners/messageToServer-listener";

export default async function privateMessage_toClient(
  messageObject: MessageObject,
  io: Server,
  socket: Socket
) {
  const { sender_id, recipient_id, targetChatRoom_type, body, created_at } =
    messageObject;

  const targetRoomIdentifier_recipient = `${targetChatRoom_type}_${recipient_id}`;
  const targetRoomIdentifier_sender = `${targetChatRoom_type}_${sender_id}`;

  // each user connects to a private room where only the user is inside.
  // the server will emit all direct messages which are for this user
  // to the private room. So as long as the user is connected, he can listen
  // to all direct messages sent to him.
  io.to(targetRoomIdentifier_recipient).emit(
    "privateMessage_toClient",
    messageObject
  );

  // save the chat message to DB
  try {
    const msg_id_result = await db_pool.query(insert_new_msg(body));
    const msg_id = msg_id_result.rows[0].msg_id as string;

    await db_pool.query(new_msg_users_ref([sender_id, recipient_id, msg_id]));

    // update the notification for the recipient in DB
    // use the socket.currentUser friendOnlineStatus to know

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log(
    "sending message to room",
    `${targetChatRoom_type}_${recipient_id}`
  );
}
