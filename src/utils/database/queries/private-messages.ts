import { msgType } from "../../enums/message-type";

export function get_private_chat_history(
  id_1: string,
  id_2: string,
  MSG_PER_PAGE: number,
  offset: number
) {
  return {
    // name: "get_private_chat_history",
    text: `SELECT 
                  user_private_messages_ref.sender_id::TEXT,
                  user_private_messages_ref.recipient_id::TEXT,
                  private_messages.msg_body,
                  private_messages.msg_type,
                  private_messages.created_at,
                  private_messages.file_type,
                  private_messages.file_url,
                  private_messages.file_name
             FROM private_messages     
             INNER JOIN user_private_messages_ref
                ON private_messages.msg_id = user_private_messages_ref.msg_id
             WHERE (user_private_messages_ref.sender_id = $1 and user_private_messages_ref.recipient_id = $2)
                    or (user_private_messages_ref.sender_id = $2 and user_private_messages_ref.recipient_id = $1)
             ORDER BY 5 DESC      
             Limit ${MSG_PER_PAGE} OFFSET ${offset}`,
    values: [id_1, id_2],
  };
}

export function insert_new_msg(
  msg_body: string,
  msg_type: msgType,
  file_name: string = "none",
  file_type: string = "none",
  file_url: string = "none"
) {
  return {
    name: "new_msg",
    text: `INSERT INTO private_messages
                (msg_body, msg_type, file_name, file_type, file_url) 
           VALUES($1, $2, $3, $4, $5)
           RETURNING msg_id`,
    values: [msg_body, msg_type, file_name, file_type, file_url],
  };
}

export function insert_new_msg_users_ref(
  sender_id: string,
  recipient_id: string,
  msg_id: string
) {
  return {
    name: "new_msg_users",
    text: `INSERT INTO user_private_messages_ref(sender_id, recipient_id, msg_id)
                  VALUES($1, $2, $3)`,
    values: [sender_id, recipient_id, msg_id],
  };
}
