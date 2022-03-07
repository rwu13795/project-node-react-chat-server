import { Socket } from "socket.io";
import uploadImageTo_S3 from "../../utils/aws-s3/upload-image";

import { db_pool } from "../../utils/db-connection";
import { MessageObject_res } from "../../utils/interfaces/response-interfaces";
import { insert_new_group_msg } from "../../utils/queries/group-messages";
import { update_group_notification_count } from "../../utils/queries/notifications-group-chat";
import { MessageObject } from "../event-listeners/user/message-to-server-listener";

export default async function groupMessage_emitter(
  socket: Socket,
  messageObject: MessageObject,
  room_type: string
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
  const targetRoom = `${room_type}_${recipient_id}`;

  // // if there is a file in the message, upload it to S3
  let file_type = "none";
  let file_url = "none";
  if (file_body && file_name) {
    const { type, url } = await uploadImageTo_S3(
      file_body,
      file_name,
      sender_id,
      recipient_id,
      room_type
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

  socket
    .to(targetRoom)
    .emit("message-to-client", { messageObject: messageObject_res, room_type });

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
      db_pool.query(update_group_notification_count(recipient_id, sender_id)),
    ]);

    console.log("insert new msg into table");
  } catch (err) {
    console.log(err);
  }

  console.log("sending message to room", targetRoom);
}
