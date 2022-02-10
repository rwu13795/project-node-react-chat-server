export function get_private_chat_history(
  id_1: string,
  id_2: string,
  MSG_PER_PAGE: number,
  offset: number
) {
  return {
    // name: "get_private_chat_history",
    text: `SELECT 
                  users_private_messages.sender_id,
                  users_private_messages.recipient_id,
                  private_messages.body,
                  private_messages.created_at
             FROM private_messages     
             INNER JOIN users_private_messages
                ON private_messages.msg_id = users_private_messages.msg_id
             WHERE (users_private_messages.sender_id = $1 and users_private_messages.recipient_id = $2)
                    or (users_private_messages.sender_id = $2 and users_private_messages.recipient_id = $1)
             ORDER BY 4 DESC      
             Limit ${MSG_PER_PAGE} OFFSET ${offset}`,
    values: [id_1, id_2],
  };
}

export function insert_new_msg(body: string) {
  return {
    name: "new_msg",
    text: "INSERT INTO private_messages(body) VALUES($1) RETURNING msg_id",
    values: [body],
  };
}

export function insert_new_msg_users_ref(
  sender_id: string,
  recipient_id: string,
  msg_id: string
) {
  return {
    name: "new_msg_users",
    text: `INSERT INTO users_private_messages(sender_id, recipient_id, msg_id)
                  VALUES($1, $2, $3)`,
    values: [sender_id, recipient_id, msg_id],
  };
}
