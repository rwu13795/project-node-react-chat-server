import { Socket } from "socket.io";

import uploadFileTo_S3 from "../../../utils/aws-s3/upload-file";
import { db_pool } from "../../../utils/database/db-connection";
import { MessageObject_res } from "../../../utils/interfaces/response-interfaces";
import {
  insert_new_group_msg,
  update_group_notification_count,
} from "../../../utils/database/queries/__index";
import { chatType, MessageObject } from "../../event-listeners";

export async function groupMessage_emitter(
  socket: Socket,
  messageObject: MessageObject
) {
  const {
    sender_id,
    sender_name,
    recipient_id, // group_id
    recipient_name, // group_name
    msg_body,
    msg_type,
    file_body,
    file_name,
    created_at,
  } = messageObject;

  // the recipient_id will always be the group_id
  const targetRoom = `${chatType.group}_${recipient_id}`;

  // // if there is a file in the message, upload it to S3
  let file_type = "none";
  let file_url = "none";
  if (file_body && file_name) {
    const { type, url } = await uploadFileTo_S3(
      file_body,
      file_name,
      sender_id,
      recipient_id,
      chatType.group
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
    room_type: chatType.group,
  });

  // save the message to DB and update notification count
  try {
    await Promise.all([
      db_pool.query(
        insert_new_group_msg(
          recipient_id,
          sender_id,
          msg_body,
          msg_type,
          file_name,
          file_type,
          file_url
        )
      ),
      db_pool.query(update_group_notification_count(recipient_id)),
    ]);
  } catch (err) {
    console.log(err);
  }
}
