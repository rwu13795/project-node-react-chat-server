import { Socket } from "socket.io";
import uploadImageTo_S3 from "../../utils/aws-s3/upload-image";
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
  const {
    sender_id,
    recipient_id,
    sender_name,
    recipient_name,
    targetChatRoom_type,
    msg_body,
    msg_type,
    file_body,
    file_name,
    created_at,
  } = messageObject;

  const targetRoomIdentifier_recipient = `${targetChatRoom_type}_${recipient_id}`;

  // each user connects to a private room where only the user is inside.
  // the server will emit all direct messages which are for this user
  // to the private room. So as long as the user is connected, he can listen
  // to all direct messages sent to him.

  let file_type = "none";
  if (file_body && file_name) {
    await uploadImageTo_S3(
      file_body,
      file_name,
      sender_id,
      recipient_id,
      targetChatRoom_type
    );
    file_type = file_name.split(".")[1];
  }

  socket.to(targetRoomIdentifier_recipient).emit("privateMessage_toClient", {
    sender_id,
    sender_name,
    recipient_id,
    recipient_name,
    msg_body,
    msg_type,
    file_type,
    file_name,
    created_at,
    targetChatRoom_type,
  });

  // save the message to DB and update notification count
  try {
    const msg_id_result = await db_pool.query(
      insert_new_msg(msg_body, msg_type, file_name, file_type)
    );
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
