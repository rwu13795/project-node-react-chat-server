import { Socket, Server } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { MessageObject } from "../event-listeners/messageToServer-listener";

export default async function privateChat_emitter(
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
    "privateChat_toClient",
    messageObject
  );

  // save the chat message to DB
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

    // update the notification for the recipient in DB
    // If user is online AND in the target room (chatting with the sender)
    // then I don't need to update the nofification row
    // if (socket.currentUser.currentTargetRoom !== targetRoomIdentifier_sender) {
    //   console.log(
    //     `user ${socket.currentUser.username}_${socket.currentUser.user_id} is not in ${targetRoomIdentifier_sender}`
    //   );
    // }

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log(
    "sending message to room",
    `${targetChatRoom_type}_${recipient_id}`
  );
}
