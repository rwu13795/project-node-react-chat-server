import { Socket } from "socket.io";
import { db_pool } from "../../utils/db-connection";
import { update_private_notification_count } from "../../utils/queries/notifications-private-chat";
import {
  insert_new_msg,
  insert_new_msg_users_ref,
} from "../../utils/queries/private-messages";

import { MessageObject } from "../event-listeners/messageToServer-listener";

export default async function privateMessage_toClient(
  socket: Socket,
  messageObject: MessageObject
) {
  const { sender_id, recipient_id, targetChatRoom_type, body } = messageObject;

  const targetRoomIdentifier_recipient = `${targetChatRoom_type}_${recipient_id}`;

  // each user connects to a private room where only the user is inside.
  // the server will emit all direct messages which are for this user
  // to the private room. So as long as the user is connected, he can listen
  // to all direct messages sent to him.
  socket
    .to(targetRoomIdentifier_recipient)
    .emit("privateMessage_toClient", messageObject);

  // save the message to DB and update notification count
  try {
    const msg_id_result = await db_pool.query(insert_new_msg(body));
    const msg_id = msg_id_result.rows[0].msg_id as string;

    await Promise.all([
      db_pool.query(insert_new_msg_users_ref(sender_id, recipient_id, msg_id)),
      db_pool.query(update_private_notification_count(sender_id, recipient_id)),
    ]);

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log(
    "sending message to room",
    `${targetChatRoom_type}_${recipient_id}`
  );
}
