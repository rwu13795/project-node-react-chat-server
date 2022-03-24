import { Socket } from "socket.io";

import uploadFileTo_S3 from "../../../utils/aws-s3/upload-file";
import { db_pool } from "../../../utils/database/db-connection";
import {
  update_private_notification_count,
  insert_new_msg_users_ref,
  insert_new_msg,
} from "../../../utils/database/queries/__index";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import { chatType, MessageObject } from "../../event-listeners";

export async function privateMessage_emitter(
  socket: Socket,
  messageObject: MessageObject
) {
  const {
    sender_id,
    recipient_id,
    sender_name,
    recipient_name,
    msg_body,
    msg_type,
    file_body,
    file_name,
    created_at,
  } = messageObject;

  // each user connects to a private room where only the user is inside.
  // the server will emit all direct messages which are for this user
  // to the private room. So as long as the user is connected, he can listen
  // to all direct messages sent to him.
  const targetRoom = `${chatType.private}_${recipient_id}`;

  // if there is a file in the message, upload it to S3
  // the "type" of a file is different from the extension. For txt file, the type is
  // 'text/plain'. I have to split(".") the file_name to get the extension type in order to
  // upload the file to S3
  let file_type = "none";
  let file_url = "none";
  if (file_body && file_name) {
    const { type, url } = await uploadFileTo_S3(
      file_body,
      file_name,
      sender_id,
      recipient_id,
      chatType.private
    );
    file_type = type;
    file_url = url;
  }

  let messageObject_res: MessageObject_res = {
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

  socket.to(targetRoom).emit("message-to-client", {
    messageObject: messageObject_res,
    room_type: chatType.private,
  });

  // save the message to DB and update notification count
  try {
    const msg_id_result = await db_pool.query(
      insert_new_msg(msg_body, msg_type, file_name, file_type, file_url)
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

  console.log("sending message to room", `${chatType.private}_${recipient_id}`);
}
