import { Socket } from "socket.io";

import { db_pool } from "../../utils/db-connection";
import { MessageObject_res } from "../../utils/interfaces/response-interfaces";
import { MessageObject } from "../event-listeners/messageToServer-listener";

export default function groupMessage_emitter(
  socket: Socket,
  messageObject: MessageObject
) {
  const {
    sender_id,
    sender_name,
    recipient_id, // group_id
    recipient_name, // group_name
    targetChatRoom_type,
    msg_body,
    msg_type,
    file_body,
    file_name,
    created_at,
  } = messageObject;

  // the recipient_id will always be the group_id
  const targetRoom = `${targetChatRoom_type}_${recipient_id}`;

  // // if there is a file in the message, upload it to S3
  let file_type = "none";
  let file_url = "none";
  // if (file_body && file_name) {
  //   file_type = file_name.split(".")[1];
  //   // generate a random key for the url
  //   file_url = crypto.randomBytes(16).toString("hex") + `.${file_type}`;

  //   await uploadImageTo_S3(
  //     file_body,
  //     file_url,
  //     sender_id,
  //     recipient_id,
  //     targetChatRoom_type
  //   );
  // }

  let messageObject_res: MessageObject_res = {
    targetChatRoom_type,
    sender_id,
    sender_name,
    recipient_id,
    recipient_name,
    msg_body,
    msg_type,
    created_at,
    file_type,
    file_name,
    file_url,
  };

  socket.to(targetRoom).emit("message-to-client", messageObject_res);

  // save the message to DB and update notification count
  try {
    // const msg_id_result = await db_pool.query(
    //   insert_new_msg(msg_body, msg_type, file_name, file_type, file_url)
    // );
    // const msg_id = msg_id_result.rows[0].msg_id as string;

    // await Promise.all([
    //   db_pool.query(insert_new_msg_users_ref(sender_id, recipient_id, msg_id)),
    //   db_pool.query(update_private_notification_count(sender_id, recipient_id)),
    // ]);

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log("sending message to room", targetRoom);
}
